import { notFound } from 'next/navigation';
import { SellerProfile } from '@/components/features/seller-profile';
import { authService } from '@/services/auth/auth.service';
import { listingService } from '@/services/listing/listing.service';
import { sellerService } from '@/services/seller/seller.service';

export default async function SellerPage({ params }: PageProps<'/sellers/[id]'>) {
  const { id } = await params;
  const seller = await sellerService.getProfile(id);

  if (!seller) notFound();

  const user = await authService.getCurrentUserCached();
  const listings = await listingService.getPublishedBySeller(seller.id, user?.id ?? null);

  return <SellerProfile seller={seller} listings={listings} />;
}
