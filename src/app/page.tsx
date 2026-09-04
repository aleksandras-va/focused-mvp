import { Browse } from '@/components/features/browse';
import { parseBrowseFilters } from '@/lib/browse-filters';
import { getCatalogFilters, getCatalogModel } from '@/services/catalog-service';
import { getPublishedListings } from '@/services/listing-service';

export default async function HomePage({ searchParams }: PageProps<'/'>) {
  const filters = parseBrowseFilters(await searchParams);

  const [listings, options, model] = await Promise.all([
    getPublishedListings(filters),
    getCatalogFilters(),
    filters.model ? getCatalogModel(filters.model) : null,
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
