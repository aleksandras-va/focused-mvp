import 'server-only';

import type { ModelCategory } from '@/db/types';
import type { VISIT_SOURCE_KEYS } from './analytics.constants';

export interface ListingReference {
  listingId: string;
  itemId: string | null;
  title: string;
  priceCents: number | null;
  isBundle: boolean;
  brand: string | null;
  category: ModelCategory | null;
  sellerId: string;
}

export interface SearchOutcome {
  term: string;
  resultCount: number;
  selectedKind: 'brand' | 'model' | null;
  selectedSlug: string | null;
  openedWith: 'shortcut' | 'click';
}

export interface VisitLanding {
  referrer: string;
  landingUrl: string;
}

export type VisitSource = Partial<Record<(typeof VISIT_SOURCE_KEYS)[number], string>>;

export interface VisitorLocation {
  countryCode: string | undefined;
  region: string | undefined;
  city: string | undefined;
}

export interface AnalyticsProfile {
  id: string;
  displayName: string;
  email: string;
}

export interface AnalyticsEvents {
  'Signed Up': Record<string, never>;
  'Draft Started': { listingId: string };
  'Listing Published': { listingId: string; itemCount: number };
  'Listing Viewed': ListingReference;
  'Message Clicked': ListingReference;
  'Message Sent': {
    conversationId: string;
    listingId: string | null;
    role: 'buyer' | 'seller';
    isFirst: boolean;
  };
  'Marked Sold': { listingId: string };
  Searched: SearchOutcome;
}

export type AnalyticsEventName = keyof AnalyticsEvents;
