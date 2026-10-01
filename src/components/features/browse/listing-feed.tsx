import { Fragment } from 'react';
import { ListingCard, toListingCardItem } from '@/components/features/browse/listing-card';
import type { ListingSummary } from '@/services/listing/listing.types';

const ITEMS_BETWEEN_BREAKS = 12;

interface ListingFeedProps {
  listings: ListingSummary[];
  breaks: React.ReactNode[];
}

function inGroups(listings: ListingSummary[]) {
  const groups: ListingSummary[][] = [];

  for (let start = 0; start < listings.length; start += ITEMS_BETWEEN_BREAKS) {
    groups.push(listings.slice(start, start + ITEMS_BETWEEN_BREAKS));
  }

  return groups;
}

export function ListingFeed({ listings, breaks }: ListingFeedProps) {
  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      {inGroups(listings).map((group, index) => (
        <Fragment key={group[0].id}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {group.map((listing) => (
              <ListingCard key={listing.id} item={toListingCardItem(listing)} />
            ))}
          </div>
          {breaks[index] ?? null}
        </Fragment>
      ))}
    </div>
  );
}
