import 'server-only';
import { type ExpressionBuilder, sql } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { db } from '@/db';
import type { NewConversation, NewMessage } from '@/db/tables';
import type { DB } from '@/db/types';

export type ConversationRow = NonNullable<
  Awaited<ReturnType<typeof conversationRepository.findById>>
>;

export type ConversationInboxRow = Awaited<
  ReturnType<typeof conversationRepository.listForUser>
>[number];

export type MessageRow = Awaited<ReturnType<typeof conversationRepository.listMessages>>[number];

const conversationColumns = [
  'conversation.id',
  'conversation.listing_id',
  'conversation.buyer_id',
  'conversation.seller_id',
  'conversation.last_message_at',
  'buyer.display_name as buyer_name',
  'seller.display_name as seller_name',
  'listing.status as listing_status',
] as const;

export const conversationRepository = {
  findByListingAndBuyer(listingId: string, buyerId: string) {
    return db
      .selectFrom('conversation')
      .select('id')
      .where('listing_id', '=', listingId)
      .where('buyer_id', '=', buyerId)
      .executeTakeFirst();
  },

  insert(values: NewConversation) {
    return db
      .insertInto('conversation')
      .values(values)
      .returning(['id', 'listing_id', 'buyer_id', 'seller_id'])
      .executeTakeFirstOrThrow();
  },

  findById(id: string) {
    return conversationQuery().where('conversation.id', '=', id).executeTakeFirst();
  },

  listForUser(userId: string) {
    return conversationQuery()
      .select((eb) => [
        eb
          .selectFrom('message')
          .select('message.body')
          .whereRef('message.conversation_id', '=', 'conversation.id')
          .orderBy('message.created_at', 'desc')
          .limit(1)
          .as('last_message_body'),
        eb
          .selectFrom('message')
          .select(eb.fn.countAll<string>().as('count'))
          .whereRef('message.conversation_id', '=', 'conversation.id')
          .where('message.sender_id', '<>', userId)
          .where('message.read_at', 'is', null)
          .as('unread_count'),
      ])
      .where((eb) =>
        eb.or([
          eb('conversation.buyer_id', '=', userId),
          eb('conversation.seller_id', '=', userId),
        ]),
      )
      .orderBy('conversation.last_message_at', 'desc')
      .execute();
  },

  listMessages(conversationId: string) {
    return db
      .selectFrom('message')
      .select(['id', 'sender_id', 'body', 'created_at', 'read_at'])
      .where('conversation_id', '=', conversationId)
      .orderBy('created_at')
      .execute();
  },

  insertMessage(values: NewMessage) {
    return db.transaction().execute(async (trx) => {
      const message = await trx
        .insertInto('message')
        .values(values)
        .returning(['id', 'conversation_id', 'sender_id', 'body', 'created_at'])
        .executeTakeFirstOrThrow();

      await trx
        .updateTable('conversation')
        .set({ last_message_at: message.created_at })
        .where('id', '=', values.conversation_id)
        .execute();

      return message;
    });
  },

  markRead(conversationId: string, readerId: string) {
    return db
      .updateTable('message')
      .set({ read_at: sql<Date>`now()` })
      .where('conversation_id', '=', conversationId)
      .where('sender_id', '<>', readerId)
      .where('read_at', 'is', null)
      .execute();
  },

  async hasUnreadFrom(conversationId: string, senderId: string) {
    const match = await db
      .selectFrom('message')
      .select('id')
      .where('conversation_id', '=', conversationId)
      .where('sender_id', '=', senderId)
      .where('read_at', 'is', null)
      .limit(1)
      .executeTakeFirst();

    return match !== undefined;
  },

  async countUnreadForUser(userId: string) {
    const row = await db
      .selectFrom('message')
      .innerJoin('conversation', 'conversation.id', 'message.conversation_id')
      .select((eb) => eb.fn.countAll<string>().as('count'))
      .where((eb) =>
        eb.or([
          eb('conversation.buyer_id', '=', userId),
          eb('conversation.seller_id', '=', userId),
        ]),
      )
      .where('message.sender_id', '<>', userId)
      .where('message.read_at', 'is', null)
      .executeTakeFirstOrThrow();

    return Number(row.count);
  },
} as const;

function conversationQuery() {
  return db
    .selectFrom('conversation')
    .innerJoin('user as buyer', 'buyer.id', 'conversation.buyer_id')
    .innerJoin('user as seller', 'seller.id', 'conversation.seller_id')
    .leftJoin('listing', 'listing.id', 'conversation.listing_id')
    .select(conversationColumns)
    .select((eb) => [
      listingCoverKey(eb).as('listing_cover_key'),
      listingItems(eb).as('listing_items'),
    ]);
}

function listingCoverKey(eb: ExpressionBuilder<DB, 'conversation'>) {
  return eb
    .selectFrom('listing_photo')
    .select('listing_photo.storage_key')
    .whereRef('listing_photo.listing_id', '=', 'conversation.listing_id')
    .orderBy('listing_photo.position')
    .limit(1);
}

function listingItems(eb: ExpressionBuilder<DB, 'conversation'>) {
  return jsonArrayFrom(
    eb
      .selectFrom('listing_item')
      .leftJoin('model', 'model.id', 'listing_item.model_id')
      .select(['listing_item.id', 'model.display_name as model_name', 'listing_item.custom_name'])
      .select((item) =>
        item.fn.coalesce('model.category', 'listing_item.custom_category').as('category'),
      )
      .whereRef('listing_item.listing_id', '=', 'conversation.listing_id')
      .orderBy('listing_item.position'),
  );
}
