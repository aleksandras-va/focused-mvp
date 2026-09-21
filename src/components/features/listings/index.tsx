import { Gallery } from '@/components/features/listings/images';
import { ListingInfo } from '@/components/features/listings/info';
import type { ListingDetail as Listing, ListingItemDetail } from '@/services/listing/listing.types';

interface ListingDetailProps {
  listing: Listing;
  focusedItem: ListingItemDetail | null;
}

export function ListingDetail({ listing, focusedItem }: ListingDetailProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
      <Gallery photos={listing.photos} title={listing.title} />
      <ListingInfo listing={listing} focusedItem={focusedItem} />
    </div>
  );
}
