import { Gallery } from '@/components/features/listings/images';
import { ListingInfo } from '@/components/features/listings/info';
import type { ListingDetail as Listing, ListingItemDetail } from '@/services/listing/listing.types';

interface ListingDetailProps {
  listing: Listing;
  focusedItem: ListingItemDetail | null;
  isSignedIn: boolean;
}

export function ListingDetail({ listing, focusedItem, isSignedIn }: ListingDetailProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
      <div className="self-start lg:sticky lg:top-[calc(var(--spacing-header)+1rem)]">
        <Gallery photos={listing.photos} title={listing.title} />
      </div>
      <ListingInfo listing={listing} focusedItem={focusedItem} isSignedIn={isSignedIn} />
    </div>
  );
}
