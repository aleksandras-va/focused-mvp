import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { cache } from 'react';
import { SellerProfile } from '@/components/features/seller-profile';
import { NOT_INDEXED, OPEN_GRAPH_BASE } from '@/lib/site';
import { authService } from '@/services/auth/auth.service';
import { listingService } from '@/services/listing/listing.service';
import { sellerService } from '@/services/seller/seller.service';

const loadSeller = cache(async (id: string) => {
  const seller = await sellerService.getProfile(id);

  if (!seller) return null;

  const user = await authService.getCurrentUserCached();
  const listings = await listingService.getPublishedBySeller(seller.id, user?.id ?? null);

  return { seller, listings };
});

export async function generateMetadata({ params }: PageProps<'/sellers/[id]'>): Promise<Metadata> {
  const loaded = await loadSeller((await params).id);

  if (!loaded) return {};

  const { seller, listings } = loaded;
  const t = await getTranslations('sellerProfile.meta');
  const title = t('title', { name: seller.name });
  const description = t('description', {
    name: seller.name,
    isStore: seller.isStore ? 'yes' : 'no',
    count: listings.length,
  });
  const path = `/sellers/${seller.id}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...OPEN_GRAPH_BASE, url: path, title, description },
    robots: listings.length === 0 ? NOT_INDEXED : undefined,
  };
}

export default async function SellerPage({ params }: PageProps<'/sellers/[id]'>) {
  const loaded = await loadSeller((await params).id);

  if (!loaded) notFound();

  return <SellerProfile seller={loaded.seller} listings={loaded.listings} />;
}
