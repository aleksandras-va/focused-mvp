import 'server-only';

import { after } from 'next/server';
import { conversationRepository } from '@/repositories/conversation.repository';
import { listingRepository } from '@/repositories/listing.repository';
import { userRepository } from '@/repositories/user.repository';
import { emailService } from '../email/email.service';
import { CONVERSATION_ID_PATTERN, MESSAGE_MAX_LENGTH } from './conversation.constants';
import { ConversationError } from './conversation.error';
import { listingTitle, mapToDetail, mapToSummary } from './conversation.mappers';
import type { ConversationDetail, ConversationSummary, SentMessage } from './conversation.types';

export const conversationService = {
  async start(listingId: string, buyerId: string, body: string): Promise<SentMessage> {
    const listing = await listingRepository.findSeller(listingId);

    if (listing?.status !== 'active') {
      throw new ConversationError('listing_unavailable');
    }
    if (listing.seller_id === buyerId) {
      throw new ConversationError('own_listing');
    }

    const existing = await conversationRepository.findByListingAndBuyer(listingId, buyerId);
    const conversationId =
      existing?.id ??
      (
        await conversationRepository.insert({
          listing_id: listingId,
          buyer_id: buyerId,
          seller_id: listing.seller_id,
        })
      ).id;

    const sent = await this.send(conversationId, buyerId, body);

    return { ...sent, isFirst: existing === undefined };
  },

  async send(conversationId: string, senderId: string, body: string): Promise<SentMessage> {
    const text = body.trim();

    if (!text) throw new ConversationError('empty_message');
    if (text.length > MESSAGE_MAX_LENGTH) {
      throw new ConversationError('message_too_long');
    }

    const conversation = await requireParticipant(conversationId, senderId);
    const role = conversation.buyer_id === senderId ? 'buyer' : 'seller';
    const recipientId = role === 'buyer' ? conversation.seller_id : conversation.buyer_id;
    const recipientAlreadyNotified = await conversationRepository.hasUnreadFrom(
      conversationId,
      senderId,
    );

    await conversationRepository.insertMessage({
      conversation_id: conversationId,
      sender_id: senderId,
      body: text,
    });

    if (!recipientAlreadyNotified) {
      const senderName = role === 'buyer' ? conversation.buyer_name : conversation.seller_name;

      after(async () => {
        const recipient = await userRepository.findById(recipientId);

        if (!recipient) return;

        await emailService
          .sendNewMessage(recipient.email, {
            recipientName: recipient.display_name,
            senderName,
            listingTitle: conversation.listing_id ? listingTitle(conversation) : null,
            body: text,
            conversationId,
          })
          .catch((error) => {
            console.error('New message email failed', error);
          });
      });
    }

    return { conversationId, listingId: conversation.listing_id, role, isFirst: false };
  },

  async getInbox(userId: string): Promise<ConversationSummary[]> {
    const rows = await conversationRepository.listForUser(userId);

    return rows.map((row) => mapToSummary(row, userId));
  },

  async get(conversationId: string, viewerId: string): Promise<ConversationDetail | null> {
    if (!CONVERSATION_ID_PATTERN.test(conversationId)) return null;

    const row = await conversationRepository.findById(conversationId);

    if (!row || !isParticipant(row, viewerId)) return null;

    await conversationRepository.markRead(conversationId, viewerId);
    const messages = await conversationRepository.listMessages(conversationId);

    return mapToDetail(row, messages, viewerId);
  },

  countUnread(userId: string): Promise<number> {
    return conversationRepository.countUnreadForUser(userId);
  },
} as const;

function isParticipant(row: { buyer_id: string; seller_id: string }, userId: string) {
  return row.buyer_id === userId || row.seller_id === userId;
}

async function requireParticipant(conversationId: string, userId: string) {
  const row = CONVERSATION_ID_PATTERN.test(conversationId)
    ? await conversationRepository.findById(conversationId)
    : undefined;

  if (!row || !isParticipant(row, userId)) {
    throw new ConversationError('not_found');
  }

  return row;
}
