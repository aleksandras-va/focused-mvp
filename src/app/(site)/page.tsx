import { getTranslations } from 'next-intl/server';
import { cache } from 'react';
import { Browse } from '@/components/features/browse';
import {
  type BrowseFilters,
  isModelOnly,
  parseBrowseFilters,
  parseBrowsePage,
} from '@/lib/browse-filters';
import { browseMetadata } from '@/lib/browse-metadata';
import { authService } from '@/services/auth/auth.service';
import { cityService } from '@/services/city/city.service';
import { listingService } from '@/services/listing/listing.service';
import { modelCatalogService } from '@/services/model-catalog/model-catalog.service';

const featuredPhoto = {
  imageUrl: '/images/hero/vilnius-3.webp',
  place: 'Vilnius',
  takenOn: '2026-05',
  gear: [
    { name: 'Sony a6400' },
    { name: 'Tamron 18-300mm F/3.5-6.3', modelSlug: 'tamron-18-300mm-f-3-5-6-3-sony-e' },
  ],
};

const loadCatalog = cache((category: BrowseFilters['category'], modelSlug: string | null) =>
  Promise.all([
    modelCatalogService.getFilters(category ?? undefined),
    modelSlug ? modelCatalogService.getModel(modelSlug) : null,
  ]),
);

export async function generateMetadata({ searchParams }: PageProps<'/'>) {
  const filters = parseBrowseFilters(await searchParams);
  const [catalogFilters, model] = await loadCatalog(filters.category, filters.model);
  const brand = catalogFilters.brands.find((candidate) => candidate.slug === filters.brand);
  const tSite = await getTranslations('site');

  return browseMetadata(
    filters,
    { brand: brand?.name ?? null, model: model?.displayName ?? null },
    await getTranslations('browse'),
    { title: tSite('title'), description: tSite('description') },
  );
}

export default async function HomePage({ searchParams }: PageProps<'/'>) {
  const params = await searchParams;
  const filters = parseBrowseFilters(params);
  const page = parseBrowsePage(params);
  const user = await authService.getCurrentUserCached();

  const [{ listings, hasMore }, [catalogFilters, model], cities] = await Promise.all([
    listingService.getPublishedPage(filters, user?.id ?? null, page),
    loadCatalog(filters.category, filters.model),
    cityService.getAll(),
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
      options={{ ...catalogFilters, cities }}
      modelName={model?.displayName ?? null}
      similar={similar}
      featuredPhoto={featuredPhoto}
    />
  );
}
