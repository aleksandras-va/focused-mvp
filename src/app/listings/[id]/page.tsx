import { notFound } from 'next/navigation';
import { ListingDetail } from '@/components/features/listings/listing-detail';
import { getListing } from '@/services/listing-service';

export default async function ListingPage({ params }: PageProps<'/listings/[id]'>) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) notFound();

  return <ListingDetail listing={listing} />;
}
