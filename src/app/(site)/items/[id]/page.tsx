import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { cache } from 'react';
import { ListingDetail } from '@/components/features/listings';
import { OwnerBar } from '@/components/features/listings/owner-bar';
import { RecordListingView } from '@/components/features/listings/record-view';
import { JsonLd } from '@/components/ui/json-ld';
import { itemMetadata } from '@/lib/listing-metadata';
import { itemStructuredData } from '@/lib/listing-structured-data';
import { NOT_INDEXED } from '@/lib/site';
import { authService } from '@/services/auth/auth.service';
import { listingService } from '@/services/listing/listing.service';
import { trackListingViewAction, trackMessageClickAction } from '../../../actions';
import { startConversationAction } from '../../messages/actions';
import {
  deleteListingAction,
  hideListingAction,
  markItemSoldAction,
  markListingSoldAction,
  restoreListingAction,
  unmarkItemSoldAction,
} from '../../sell/actions';

const loadItem = cache(async (id: string) => {
  const user = await authService.getCurrentUserCached();
  const listing = await listingService.getByItemId(id, user?.id ?? null);
  const item = listing?.items.find((candidate) => candidate.id === id);

  return { listing, item };
});

export async function generateMetadata({ params }: PageProps<'/items/[id]'>) {
  const { listing, item } = await loadItem((await params).id);

  if (!listing || !item) return {};

  const metadata = itemMetadata(listing, item, await getTranslations());

  return item.isSold ? { ...metadata, robots: NOT_INDEXED } : metadata;
}

export default async function ItemPage({ params }: PageProps<'/items/[id]'>) {
  const { id } = await params;
  const { listing, item } = await loadItem(id);

  if (!listing || !item) notFound();

  const viewer = await authService.getCurrentUserCached();
  const reference = {
    listingId: listing.id,
    itemId: item.id,
    title: item.modelName,
    priceCents: item.priceCents,
    isBundle: listing.isBundle,
    brand: item.brand,
    category: item.category,
    sellerId: listing.seller.id,
  };

  return (
    <>
      <JsonLd entries={itemStructuredData(listing, item, await getTranslations())} />
      {listing.status === 'active' && !item.isSold && item.priceCents !== null ? (
        <RecordListingView
          listing={{
            href: `/items/${item.id}`,
            title: item.modelName,
            priceCents: item.priceCents,
          }}
          trackViewAction={listing.isOwner ? null : trackListingViewAction.bind(null, reference)}
        />
      ) : null}
      {listing.isOwner ? (
        <OwnerBar
          listingId={listing.id}
          status={listing.status}
          item={{ id: item.id, isSold: item.isSold, inBundle: listing.items.length > 1 }}
          editHref={`/sell/${listing.id}`}
          markSoldAction={markListingSoldAction}
          markItemSoldAction={markItemSoldAction.bind(null, listing.id)}
          unmarkItemSoldAction={unmarkItemSoldAction.bind(null, listing.id)}
          hideAction={hideListingAction}
          restoreAction={restoreListingAction}
          deleteAction={deleteListingAction}
        />
      ) : null}
      <ListingDetail
        listing={listing}
        focusedItem={item}
        isSignedIn={viewer !== null}
        messaging={
          listing.isOwner || item.isSold
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
