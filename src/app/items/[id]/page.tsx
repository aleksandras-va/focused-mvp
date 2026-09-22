import { notFound } from 'next/navigation';
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

export default async function ItemPage({ params }: PageProps<'/items/[id]'>) {
  const { id } = await params;
  const user = await authService.getCurrentUserCached();
  const listing = await listingService.getByItemId(id, user?.id ?? null);
  const item = listing?.items.find((candidate) => candidate.id === id);

  if (!listing || !item) notFound();

  return (
    <>
      <RecordListingView
        listing={{ href: `/items/${item.id}`, title: item.modelName, priceCents: item.priceCents }}
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
      <ListingDetail listing={listing} focusedItem={item} />
    </>
  );
}
