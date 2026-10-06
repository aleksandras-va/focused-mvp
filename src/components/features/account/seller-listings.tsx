'use client';

import { CameraIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ListingCard, toListingCardItem } from '@/components/features/browse/listing-card';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import type { ListingStatus } from '@/db/tables';
import { LISTING_STATUS_LABELS } from '@/lib/listing-options';
import { cn } from '@/lib/utils';
import type { ListingSummary } from '@/services/listing/listing.types';

const STATUSES: ListingStatus[] = ['active', 'draft', 'sold', 'removed'];

export function SellerListings({ listings }: { listings: ListingSummary[] }) {
  const [status, setStatus] = useState<ListingStatus | null>(null);
  const tabs = [
    { value: null, label: 'All', count: listings.length },
    ...STATUSES.map((value) => ({
      value,
      label: LISTING_STATUS_LABELS[value],
      count: listings.filter((listing) => listing.status === value).length,
    })).filter((tab) => tab.count > 0),
  ];
  const shown = status ? listings.filter((listing) => listing.status === status) : listings;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-2xl font-extrabold">Your ads</h2>
        <Link href="/sell" className={cn(buttonVariants())}>
          <PlusIcon />
          New ad
        </Link>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon={<CameraIcon />}
          title="No ads yet"
          description="List a camera, lens or accessory in a few minutes."
        />
      ) : (
        <>
          {tabs.length > 2 ? (
            <div
              role="tablist"
              aria-label="Ad status"
              className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={status === tab.value}
                  onClick={() => setStatus(tab.value)}
                  className={cn(
                    'flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors',
                    status === tab.value
                      ? 'bg-foreground text-background'
                      : 'text-foreground/75 hover:bg-muted hover:text-foreground',
                  )}
                >
                  {tab.label}
                  <span className="text-xs opacity-70">{tab.count}</span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {shown.map((listing) => (
              <ListingCard key={listing.id} item={toListingCardItem(listing)} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
