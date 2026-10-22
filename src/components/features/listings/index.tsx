import { useTranslations } from 'next-intl';
import { Gallery } from '@/components/features/listings/images';
import { ListingInfo } from '@/components/features/listings/info';
import { ListingBody } from '@/components/features/listings/info/body';
import type { MessageSellerProps } from '@/components/features/listings/info/message-seller-dialog';
import { MobileContactBar } from '@/components/features/listings/info/mobile-contact-bar';
import { galleryPhotos } from '@/lib/listing-photos';
import { formatListingTitle } from '@/lib/listing-title';
import type { ListingDetail as Listing, ListingItemDetail } from '@/services/listing/listing.types';

interface ListingDetailProps {
  listing: Listing;
  focusedItem: ListingItemDetail | null;
  isSignedIn: boolean;
  messaging: MessageSellerProps | null;
}

export function ListingDetail({ listing, focusedItem, isSignedIn, messaging }: ListingDetailProps) {
  const tTitle = useTranslations('listingTitle');
  const title = focusedItem?.modelName ?? formatListingTitle(listing.title, tTitle);

  return (
    <>
      <div className="grid grid-cols-1 gap-8 [grid-template-areas:'gallery'_'info'_'body'] lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:gap-x-10 lg:gap-y-10 lg:[grid-template-areas:'gallery_info'_'body_info']">
        <div className="min-w-0 [grid-area:gallery]">
          <Gallery photos={galleryPhotos(listing, focusedItem)} title={title} />
        </div>
        <div className="min-w-0 self-start [grid-area:info] lg:sticky lg:top-[calc(var(--spacing-header)+1rem)]">
          <ListingInfo
            listing={listing}
            focusedItem={focusedItem}
            isSignedIn={isSignedIn}
            messaging={messaging}
          />
        </div>
        <div className="min-w-0 [grid-area:body]">
          <ListingBody listing={listing} focusedItem={focusedItem} />
        </div>
      </div>
      <MobileContactBar listing={listing} focusedItem={focusedItem} messaging={messaging} />
    </>
  );
}
