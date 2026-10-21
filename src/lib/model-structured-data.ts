import type { getTranslations } from 'next-intl/server';
import type { CatalogModelWithOffers } from '@/services/model-catalog/model-catalog.types';
import { breadcrumbList } from './listing-structured-data';
import { modelHref } from './model-href';
import { SITE_URL } from './site';

type Translate = Awaited<ReturnType<typeof getTranslations<never>>>;

export function modelStructuredData(
  model: CatalogModelWithOffers,
  description: string,
  imageUrls: string[],
  t: Translate,
): object[] {
  const { adCount, minPriceCents, maxPriceCents } = model.offers;
  const path = modelHref(model.slug);
  const product =
    adCount > 0 && minPriceCents !== null && maxPriceCents !== null
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: model.displayName,
          image: imageUrls.length > 0 ? imageUrls : undefined,
          description,
          category: t(`enums.category.${model.category}`),
          brand: { '@type': 'Brand', name: model.brand.name },
          offers: {
            '@type': 'AggregateOffer',
            url: `${SITE_URL}${path}`,
            priceCurrency: 'EUR',
            lowPrice: (minPriceCents / 100).toFixed(2),
            highPrice: (maxPriceCents / 100).toFixed(2),
            offerCount: adCount,
          },
        }
      : null;

  const breadcrumbs = breadcrumbList([
    { name: t(`enums.categoryPlural.${model.category}`), path: `/?category=${model.category}` },
    { name: model.brand.name, path: `/?brand=${model.brand.slug}` },
    { name: model.displayName, path },
  ]);

  return [product, breadcrumbs].filter((entry) => entry !== null);
}
