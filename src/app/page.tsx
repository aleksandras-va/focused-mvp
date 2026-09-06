import { Browse } from '@/components/features/browse';
import { parseBrowseFilters } from '@/lib/browse-filters';
import { listingService } from '@/services/listing/listing.service';
import { modelCatalogService } from '@/services/model-catalog/model-catalog.service';

export default async function HomePage({ searchParams }: PageProps<'/'>) {
  const filters = parseBrowseFilters(await searchParams);

  const [listings, options, model] = await Promise.all([
    listingService.getPublished(filters),
    modelCatalogService.getFilters(filters.category ?? undefined),
    filters.model ? modelCatalogService.getModel(filters.model) : null,
  ]);

  return (
    <Browse
      listings={listings}
      filters={filters}
      options={options}
      modelName={model?.displayName ?? null}
    />
  );
}
