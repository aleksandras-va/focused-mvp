import type { Metadata } from 'next';
import type { getTranslations } from 'next-intl/server';
import type { CatalogModelWithOffers } from '@/services/model-catalog/model-catalog.types';
import { formatPrice } from './format';
import { modelHref } from './model-href';
import { DEFAULT_SHARE_IMAGE, NOT_INDEXED, OPEN_GRAPH_BASE } from './site';

type TranslateModelPage = Awaited<ReturnType<typeof getTranslations<'modelPage'>>>;

function lowestPrice(model: CatalogModelWithOffers) {
  return model.offers.adCount > 0 ? model.offers.minPriceCents : null;
}

export function modelDescription(model: CatalogModelWithOffers, t: TranslateModelPage) {
  const price = lowestPrice(model);

  return model.offers.adCount === 0
    ? t('meta.descriptionEmpty', { name: model.displayName })
    : t('meta.description', {
        name: model.displayName,
        count: model.offers.adCount,
        hasPrice: price === null ? 'no' : 'yes',
        price: price === null ? '' : formatPrice(price),
      });
}

export function modelMetadata(
  model: CatalogModelWithOffers,
  coverUrl: string | null,
  t: TranslateModelPage,
): Metadata {
  const price = lowestPrice(model);
  const title = t('meta.title', {
    name: model.displayName,
    hasPrice: price === null ? 'no' : 'yes',
    price: price === null ? '' : formatPrice(price),
  });
  const description = modelDescription(model, t);
  const path = modelHref(model.slug);
  const images = coverUrl ? [{ url: coverUrl, alt: model.displayName }] : [DEFAULT_SHARE_IMAGE];

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...OPEN_GRAPH_BASE, url: path, title, description, images },
    twitter: { card: 'summary_large_image', title, description, images },
    robots: model.offers.adCount === 0 ? NOT_INDEXED : undefined,
  };
}
