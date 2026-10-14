import 'server-only';

import type {
  ConversationInboxRow,
  ConversationRow,
  MessageRow,
} from '@/repositories/conversation.repository';
import { listingTitleResolver } from '../listing/listing.title-resolver';
import { photoService } from '../photo/photo.service';
import type {
  ConversationDetail,
  ConversationListing,
  ConversationMessage,
  ConversationSummary,
} from './conversation.types';

export function mapToSummary(row: ConversationInboxRow, viewerId: string): ConversationSummary {
  return {
    id: row.id,
    counterpartName: counterpartName(row, viewerId),
    listing: mapListing(row),
    lastMessage: row.last_message_body,
    lastMessageAt: row.last_message_at,
    unreadCount: Number(row.unread_count ?? 0),
  };
}

export function mapToDetail(
  row: ConversationRow,
  messages: MessageRow[],
  viewerId: string,
): ConversationDetail {
  return {
    id: row.id,
    counterpartName: counterpartName(row, viewerId),
    listing: mapListing(row),
    messages: messages.map((message) => mapToMessage(message, viewerId)),
  };
}

export function mapToMessage(row: MessageRow, viewerId: string): ConversationMessage {
  return {
    id: row.id,
    body: row.body,
    sentAt: row.created_at,
    isMine: row.sender_id === viewerId,
  };
}

export function listingTitle(row: ConversationRow) {
  return listingTitleResolver.resolve(
    row.listing_items.map((item) => ({
      name: item.model_name ?? item.custom_name ?? '',
      category: item.category,
    })),
  );
}

function mapListing(row: ConversationRow): ConversationListing | null {
  if (!row.listing_id) return null;

  return {
    id: row.listing_id,
    title: listingTitle(row),
    coverUrl: row.listing_cover_key
      ? photoService.getPublicUrl(row.listing_cover_key, 'card')
      : null,
    firstItemId: row.listing_items[0]?.id ?? null,
    isPublic: row.listing_status === 'active',
  };
}

function counterpartName(row: ConversationRow, viewerId: string) {
  return row.buyer_id === viewerId ? row.seller_name : row.buyer_name;
}
