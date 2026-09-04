import { notFound } from 'next/navigation';
import { ListingDetail } from '@/components/features/listings/listing-detail';
import { RecordListingView } from '@/components/features/listings/record-view';
import { getListing } from '@/services/listing-service';

export default async function ListingPage({ params }: PageProps<'/listings/[id]'>) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) notFound();

  return (
    <>
      <RecordListingView
        listing={{ id: listing.id, title: listing.title, priceCents: listing.priceCents }}
      />
      <ListingDetail listing={listing} />
    </>
  );
}
