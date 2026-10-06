import { Gallery } from '@/components/features/listings/images';
import { ListingInfo } from '@/components/features/listings/info';
import { ListingBody } from '@/components/features/listings/info/body';
import { MobileContactBar } from '@/components/features/listings/info/mobile-contact-bar';
import type { ListingDetail as Listing, ListingItemDetail } from '@/services/listing/listing.types';

interface ListingDetailProps {
  listing: Listing;
  focusedItem: ListingItemDetail | null;
  isSignedIn: boolean;
}

export function ListingDetail({ listing, focusedItem, isSignedIn }: ListingDetailProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-8 [grid-template-areas:'gallery'_'info'_'body'] lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:gap-x-10 lg:gap-y-10 lg:[grid-template-areas:'gallery_info'_'body_info']">
        <div className="min-w-0 [grid-area:gallery]">
          <Gallery photos={listing.photos} title={listing.title} />
        </div>
        <div className="min-w-0 self-start [grid-area:info] lg:sticky lg:top-[calc(var(--spacing-header)+1rem)]">
          <ListingInfo listing={listing} focusedItem={focusedItem} isSignedIn={isSignedIn} />
        </div>
        <div className="min-w-0 [grid-area:body]">
          <ListingBody listing={listing} focusedItem={focusedItem} />
        </div>
      </div>
      <MobileContactBar listing={listing} focusedItem={focusedItem} />
    </>
  );
}
