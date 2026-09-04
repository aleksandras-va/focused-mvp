'use client';

import { useEffect } from 'react';
import { type RecentlyViewedListing, recordRecentlyViewed } from '@/lib/recently-viewed';

export function RecordListingView({ listing }: { listing: RecentlyViewedListing }) {
  useEffect(() => {
    recordRecentlyViewed(listing);
  }, [listing]);

  return null;
}
