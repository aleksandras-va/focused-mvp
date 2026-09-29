import { Home } from '@/components/features/home';
import { parseBrowseFilters } from '@/lib/browse-filters';
import { authService } from '@/services/auth/auth.service';
import { listingService } from '@/services/listing/listing.service';

const RECENT_LISTINGS = 8;

const featuredPhoto = {
  imageUrl: '/images/hero/hero.avif',
  place: 'Palanga',
  takenOn: '2025-07',
  gear: 'Sony A7R',
};

export default async function HomePage({ searchParams }: PageProps<'/'>) {
  const filters = parseBrowseFilters(await searchParams);
  const user = await authService.getCurrentUserCached();
  const listings = await listingService.getPublished(filters, user?.id ?? null, RECENT_LISTINGS);

  return <Home listings={listings} category={filters.category} featuredPhoto={featuredPhoto} />;
}
