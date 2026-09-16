import { notFound } from 'next/navigation';
import { ListingDetail } from '@/components/features/listings/listing-detail';
import { RecordListingView } from '@/components/features/listings/record-view';
import { listingService } from '@/services/listing/listing.service';

export default async function ItemPage({ params }: PageProps<'/items/[id]'>) {
  const { id } = await params;
  const listing = await listingService.getByItemId(id);
  const item = listing?.items.find((candidate) => candidate.id === id);

  if (!listing || !item) notFound();

  return (
    <>
      <RecordListingView
        listing={{ href: `/items/${item.id}`, title: item.modelName, priceCents: item.priceCents }}
      />
      <ListingDetail listing={listing} focusedItem={item} />
    </>
  );
}
