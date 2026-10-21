import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { cache } from 'react';
import { ModelPage } from '@/components/features/model-page';
import { JsonLd } from '@/components/ui/json-ld';
import { parseBrowseFilters, parseBrowsePage } from '@/lib/browse-filters';
import { modelDescription, modelMetadata } from '@/lib/model-metadata';
import { modelStructuredData } from '@/lib/model-structured-data';
import { authService } from '@/services/auth/auth.service';
import { listingService } from '@/services/listing/listing.service';
import { modelCatalogService } from '@/services/model-catalog/model-catalog.service';

const loadModel = cache((slug: string) => modelCatalogService.getModelWithOffers(slug));

const loadListings = cache(async (slug: string, page: number) => {
  const user = await authService.getCurrentUserCached();

  return listingService.getPublishedPage(
    parseBrowseFilters({ model: slug }),
    user?.id ?? null,
    page,
  );
});

export async function generateMetadata({ params }: PageProps<'/models/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const model = await loadModel(slug);

  if (!model) return {};

  const { listings } = await loadListings(slug, 1);

  return modelMetadata(model, listings[0]?.coverUrl ?? null, await getTranslations('modelPage'));
}

export default async function ModelRoute({ params, searchParams }: PageProps<'/models/[slug]'>) {
  const { slug } = await params;
  const model = await loadModel(slug);

  if (!model) notFound();

  const page = parseBrowsePage(await searchParams);
  const { listings, hasMore } = await loadListings(slug, page);
  const user = await authService.getCurrentUserCached();
  const similar =
    model.offers.adCount === 0
      ? await listingService.getSimilarToModel(model, user?.id ?? null)
      : null;
  const imageUrls = listings.flatMap((listing) => (listing.coverUrl ? [listing.coverUrl] : []));

  return (
    <>
      <JsonLd
        entries={modelStructuredData(
          model,
          modelDescription(model, await getTranslations('modelPage')),
          imageUrls,
          await getTranslations(),
        )}
      />
      <ModelPage
        model={model}
        listings={listings}
        hasMore={hasMore}
        page={page}
        similar={similar}
      />
    </>
  );
}
