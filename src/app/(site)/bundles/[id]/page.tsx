import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { cache } from 'react';
import { ListingDetail } from '@/components/features/listings';
import { OwnerBar } from '@/components/features/listings/owner-bar';
import { RecordListingView } from '@/components/features/listings/record-view';
import { bundleMetadata } from '@/lib/listing-metadata';
import { authService } from '@/services/auth/auth.service';
import { listingService } from '@/services/listing/listing.service';
import { trackListingViewAction, trackMessageClickAction } from '../../../actions';
import { startConversationAction } from '../../messages/actions';
import {
  deleteListingAction,
  hideListingAction,
  markListingSoldAction,
  restoreListingAction,
} from '../../sell/actions';

const loadListing = cache(async (id: string) => {
  const user = await authService.getCurrentUserCached();

  return listingService.get(id, user?.id ?? null);
});

export async function generateMetadata({ params }: PageProps<'/bundles/[id]'>) {
  const listing = await loadListing((await params).id);

  return listing ? bundleMetadata(listing, await getTranslations()) : {};
}

export default async function BundlePage({ params }: PageProps<'/bundles/[id]'>) {
  const { id } = await params;
  const listing = await loadListing(id);

  if (!listing) notFound();
  if (!listing.isBundle && listing.items[0]) redirect(`/items/${listing.items[0].id}`);

  const viewer = await authService.getCurrentUserCached();
  const reference = {
    listingId: listing.id,
    itemId: null,
    title: listing.title,
    priceCents: listing.priceCents,
    isBundle: true,
    brand: null,
    category: null,
    sellerId: listing.seller.id,
  };

  return (
    <>
      {listing.status === 'active' && listing.priceCents !== null ? (
        <RecordListingView
          listing={{
            href: `/bundles/${listing.id}`,
            title: listing.title,
            priceCents: listing.priceCents,
          }}
          trackViewAction={listing.isOwner ? null : trackListingViewAction.bind(null, reference)}
        />
      ) : null}
      {listing.isOwner ? (
        <OwnerBar
          listingId={listing.id}
          status={listing.status}
          editHref={`/sell/${listing.id}`}
          markSoldAction={markListingSoldAction}
          hideAction={hideListingAction}
          restoreAction={restoreListingAction}
          deleteAction={deleteListingAction}
        />
      ) : null}
      <ListingDetail
        listing={listing}
        focusedItem={null}
        isSignedIn={viewer !== null}
        messaging={
          listing.isOwner
            ? null
            : {
                isSignedIn: viewer !== null,
                startAction: startConversationAction.bind(null, listing.id),
                trackClickAction: trackMessageClickAction.bind(null, reference),
              }
        }
      />
    </>
  );
}
