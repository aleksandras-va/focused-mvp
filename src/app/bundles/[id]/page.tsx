import { notFound, redirect } from 'next/navigation';
import { ListingDetail } from '@/components/features/listings';
import { OwnerBar } from '@/components/features/listings/owner-bar';
import { RecordListingView } from '@/components/features/listings/record-view';
import { authService } from '@/services/auth/auth.service';
import { listingService } from '@/services/listing/listing.service';
import {
  deleteListingAction,
  hideListingAction,
  markListingSoldAction,
  restoreListingAction,
} from '../../sell/actions';

export default async function BundlePage({ params }: PageProps<'/bundles/[id]'>) {
  const { id } = await params;
  const user = await authService.getCurrentUserCached();
  const listing = await listingService.get(id, user?.id ?? null);

  if (!listing) notFound();
  if (!listing.isBundle && listing.items[0]) redirect(`/items/${listing.items[0].id}`);

  return (
    <>
      <RecordListingView
        listing={{
          href: `/bundles/${listing.id}`,
          title: listing.title,
          priceCents: listing.priceCents,
        }}
      />
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
      <ListingDetail listing={listing} focusedItem={null} />
    </>
  );
}
