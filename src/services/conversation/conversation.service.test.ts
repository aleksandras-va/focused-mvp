import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { listingRepository } from '@/repositories/listing.repository';
import { userRepository } from '@/repositories/user.repository';
import { cityService } from '../city/city.service';
import { listingService } from '../listing/listing.service';
import { modelCatalogService } from '../model-catalog/model-catalog.service';
import { conversationService } from './conversation.service';

const scheduled: (() => Promise<void> | void)[] = [];

vi.mock('next/server', () => ({
  after: (task: () => Promise<void> | void) => {
    scheduled.push(task);
  },
}));

vi.mock('../email/email.service', () => ({
  emailService: { sendNewMessage: vi.fn(async () => {}) },
}));

const SELLER_EMAIL = 'conversation-test-seller@example.com';
const BUYER_EMAIL = 'conversation-test-buyer@example.com';

let sellerId: string;
let buyerId: string;
let listingId: string;

async function ensureUser(email: string, displayName: string) {
  const user =
    (await userRepository.findByEmail(email)) ??
    (await userRepository.insert({
      email,
      display_name: displayName,
      password_hash: 'not-a-hash',
    }));

  return user.id;
}

beforeAll(async () => {
  sellerId = await ensureUser(SELLER_EMAIL, 'Conversation test seller');
  buyerId = await ensureUser(BUYER_EMAIL, 'Conversation test buyer');

  for (const listing of await listingService.getSellerListings(sellerId)) {
    await listingService.remove(listing.id, sellerId);
  }

  const model = await modelCatalogService.getModel('sony-a7-iii');
  const [city] = await cityService.getAll();

  if (!model) throw new Error('No sony-a7-iii in the test catalog');

  const created = await listingService.save(null, sellerId, {
    items: [
      {
        id: randomUUID(),
        modelId: model.id,
        custom: null,
        price: '1200',
        cosmeticCondition: 'good',
        functionalCondition: 'fully_working',
        shutterCount: null,
        soldSeparately: true,
        inclusions: [],
      },
    ],
    bundlePrice: null,
    photoKeys: [],
    cityId: city.id,
    description: null,
    contactEmail: null,
    contactPhone: null,
    publish: true,
  });

  listingId = created.id;
});

afterAll(async () => {
  await listingRepository.deleteById(listingId);
});

describe('conversationService', () => {
  it('starts one thread per buyer per ad and reuses it', async () => {
    const first = await conversationService.start(listingId, buyerId, 'Is it still available?');
    const second = await conversationService.start(listingId, buyerId, 'Any scratches?');

    expect(first).toMatchObject({ listingId, role: 'buyer', isFirst: true });
    expect(second).toEqual({ ...first, isFirst: false });

    const detail = await conversationService.get(first.conversationId, buyerId);

    expect(detail?.listing?.title).toEqual({ names: ['Sony a7 III'], counts: [] });
    expect(detail?.counterpartName).toBe('Conversation test seller');
    expect(detail?.messages.map((message) => [message.body, message.isMine])).toEqual([
      ['Is it still available?', true],
      ['Any scratches?', true],
    ]);
  });

  it('refuses the seller messaging their own ad', async () => {
    await expect(conversationService.start(listingId, sellerId, 'hi')).rejects.toThrow(
      'own_listing',
    );
  });

  it('refuses an empty message', async () => {
    await expect(conversationService.start(listingId, buyerId, '   ')).rejects.toThrow(
      'empty_message',
    );
  });

  it('shows the seller unread messages and clears them on read', async () => {
    const [summary] = await conversationService.getInbox(sellerId);

    expect(summary.counterpartName).toBe('Conversation test buyer');
    expect(summary.lastMessage).toBe('Any scratches?');
    expect(summary.unreadCount).toBe(2);
    expect(await conversationService.countUnread(sellerId)).toBe(2);

    await conversationService.get(summary.id, sellerId);

    expect(await conversationService.countUnread(sellerId)).toBe(0);
  });

  it('hides the thread from anyone else', async () => {
    const [summary] = await conversationService.getInbox(buyerId);
    const stranger = await ensureUser('conversation-test-stranger@example.com', 'Stranger');

    expect(await conversationService.get(summary.id, stranger)).toBeNull();
    await expect(conversationService.send(summary.id, stranger, 'hello')).rejects.toThrow(
      'not_found',
    );
  });

  it('emails the recipient once per unread stretch', async () => {
    const [summary] = await conversationService.getInbox(sellerId);
    scheduled.length = 0;

    await conversationService.send(summary.id, sellerId, 'Yes, still here.');
    await conversationService.send(summary.id, sellerId, 'No scratches.');

    expect(scheduled).toHaveLength(1);

    await conversationService.get(summary.id, buyerId);
    await conversationService.send(summary.id, sellerId, 'Want to meet?');

    expect(scheduled).toHaveLength(2);
  });
});
