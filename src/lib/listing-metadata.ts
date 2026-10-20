import type { Metadata } from 'next';
import type { getTranslations } from 'next-intl/server';
import type { ListingDetail, ListingItemDetail } from '@/services/listing/listing.types';
import { formatPrice } from './format';
import { formatListingTitle } from './listing-title';

const SITE_NAME = 'exposé';

type Translate = Awaited<ReturnType<typeof getTranslations<never>>>;
type TranslateTitle = Awaited<ReturnType<typeof getTranslations<'listingTitle'>>>;

function joinParts(parts: (string | null)[]) {
  return parts.filter(Boolean).join(' · ');
}

function listingMetadata(
  title: string,
  description: string,
  path: string,
  coverUrl: string | undefined,
): Metadata {
  const images = coverUrl ? [{ url: coverUrl, alt: title }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', siteName: SITE_NAME, url: path, title, description, images },
    twitter: { card: coverUrl ? 'summary_large_image' : 'summary', title, description, images },
  };
}

export function itemMetadata(
  listing: ListingDetail,
  item: ListingItemDetail,
  t: Translate,
): Metadata {
  const title = joinParts([
    item.modelName,
    item.priceCents === null ? null : formatPrice(item.priceCents),
  ]);
  const description = joinParts([
    t('listing.metadata.condition', {
      condition: t(`enums.cosmeticCondition.${item.cosmeticCondition}`),
    }),
    item.shutterCount === null
      ? null
      : t('listing.metadata.shutterCount', { count: item.shutterCount }),
    listing.city,
  ]);

  return listingMetadata(title, description, `/items/${item.id}`, listing.photos[0]?.cardUrl);
}

export function bundleMetadata(
  listing: ListingDetail,
  t: Translate,
  tTitle: TranslateTitle,
): Metadata {
  const title = joinParts([
    formatListingTitle(listing.title, tTitle),
    listing.priceCents === null ? null : formatPrice(listing.priceCents),
  ]);
  const description = joinParts([
    t('listing.metadata.bundleOf', { count: listing.items.length }),
    listing.city,
  ]);

  return listingMetadata(title, description, `/bundles/${listing.id}`, listing.photos[0]?.cardUrl);
}
