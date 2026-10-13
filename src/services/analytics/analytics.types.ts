import 'server-only';

import type { ModelCategory } from '@/db/types';

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
}

export interface AnalyticsEvents {
  'Signed Up': Record<string, never>;
  'Draft Started': { listingId: string };
  'Listing Published': { listingId: string; itemCount: number };
  'Listing Viewed': ListingReference;
  'Message Clicked': ListingReference;
  'Marked Sold': { listingId: string };
  Searched: SearchOutcome;
}

export type AnalyticsEventName = keyof AnalyticsEvents;
