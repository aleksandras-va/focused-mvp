import { Browse } from '@/components/features/browse';
import { isModelOnly, parseBrowseFilters, parseBrowsePage } from '@/lib/browse-filters';
import { authService } from '@/services/auth/auth.service';
import { listingService } from '@/services/listing/listing.service';
import { modelCatalogService } from '@/services/model-catalog/model-catalog.service';

const featuredPhoto = {
  imageUrl: '/images/hero/herox.jpg',
  place: 'Palanga',
  takenOn: '2025-07',
  gear: 'Sony A7R',
};

export default async function HomePage({ searchParams }: PageProps<'/'>) {
  const params = await searchParams;
  const filters = parseBrowseFilters(params);
  const page = parseBrowsePage(params);
  const user = await authService.getCurrentUserCached();

  const [{ listings, hasMore }, options, model] = await Promise.all([
    listingService.getPublishedPage(filters, user?.id ?? null, page),
    modelCatalogService.getFilters(filters.category ?? undefined),
    filters.model ? modelCatalogService.getModel(filters.model) : null,
  ]);

  const similar =
    model && listings.length === 0 && isModelOnly(filters)
      ? await listingService.getSimilarToModel(model, user?.id ?? null)
      : null;

  return (
    <Browse
      listings={listings}
      hasMore={hasMore}
      page={page}
      filters={filters}
      options={options}
      modelName={model?.displayName ?? null}
      similar={similar}
      featuredPhoto={featuredPhoto}
    />
  );
}
