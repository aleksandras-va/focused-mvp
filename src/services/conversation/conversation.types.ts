import 'server-only';

export type ConversationErrorCode =
  | 'listing_unavailable'
  | 'own_listing'
  | 'empty_message'
  | 'message_too_long'
  | 'not_found';

export interface ConversationListing {
  id: string;
  title: string;
  coverUrl: string | null;
  firstItemId: string | null;
  isPublic: boolean;
}

export interface ConversationSummary {
  id: string;
  counterpartName: string;
  listing: ConversationListing | null;
  lastMessage: string | null;
  lastMessageAt: Date;
  unreadCount: number;
}

export interface ConversationMessage {
  id: string;
  body: string;
  sentAt: Date;
  isMine: boolean;
}

export interface SentMessage {
  conversationId: string;
  listingId: string | null;
  role: 'buyer' | 'seller';
  isFirst: boolean;
}

export interface ConversationDetail {
  id: string;
  counterpartName: string;
  listing: ConversationListing | null;
  messages: ConversationMessage[];
}
