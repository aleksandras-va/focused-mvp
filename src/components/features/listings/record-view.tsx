'use client';

import { useEffect, useRef } from 'react';
import { type RecentlyViewedListing, recordRecentlyViewed } from '@/lib/recently-viewed';

interface RecordListingViewProps {
  listing: RecentlyViewedListing;
  trackViewAction: (() => Promise<void>) | null;
}

export function RecordListingView({ listing, trackViewAction }: RecordListingViewProps) {
  const trackedHref = useRef<string | null>(null);

  useEffect(() => {
    recordRecentlyViewed(listing);
  }, [listing]);

  useEffect(() => {
    if (!trackViewAction || trackedHref.current === listing.href) return;

    trackedHref.current = listing.href;
    trackViewAction();
  }, [listing.href, trackViewAction]);

  return null;
}
