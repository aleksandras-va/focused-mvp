import { Browse } from '@/components/features/browse';
import { parseBrowseFilters } from '@/lib/browse-filters';
import { authService } from '@/services/auth/auth.service';
import { listingService } from '@/services/listing/listing.service';
import { modelCatalogService } from '@/services/model-catalog/model-catalog.service';

const featuredPhoto = {
  imageUrl: '/images/hero/hero.jpg',
  width: 2400,
  height: 1200,
  place: 'Palanga',
  takenOn: '2025-07',
  gear: 'Zenit TTL + Helios 44M-4',
};

export default async function HomePage({ searchParams }: PageProps<'/'>) {
  const filters = parseBrowseFilters(await searchParams);
  const user = await authService.getCurrentUserCached();

  const [listings, options, model] = await Promise.all([
    listingService.getPublished(filters, user?.id ?? null),
    modelCatalogService.getFilters(filters.category ?? undefined),
    filters.model ? modelCatalogService.getModel(filters.model) : null,
  ]);

  return (
    <Browse
      listings={listings}
      filters={filters}
      options={options}
      modelName={model?.displayName ?? null}
      featuredPhoto={featuredPhoto}
    />
  );
}
