import type { Metadata } from 'next';
import type { getTranslations } from 'next-intl/server';
import type { ListingDetail, ListingItemDetail } from '@/services/listing/listing.types';
import { formatPrice } from './format';
import { formatListingTitle } from './listing-title';
import { DEFAULT_SHARE_IMAGE, OPEN_GRAPH_BASE } from './site';

type Translate = Awaited<ReturnType<typeof getTranslations<never>>>;
type TranslateTitle = Awaited<ReturnType<typeof getTranslations<'listingTitle'>>>;

const DESCRIPTION_LIMIT = 160;

function joinParts(parts: (string | null)[]) {
  return parts.filter(Boolean).join(' · ');
}

function withSellerText(facts: string, sellerText: string | null) {
  const text = sellerText?.replace(/\s+/g, ' ').trim();
  const full = text ? `${facts}. ${text}` : facts;

  return full.length > DESCRIPTION_LIMIT
    ? `${full.slice(0, DESCRIPTION_LIMIT - 1).trimEnd()}…`
    : full;
}

function listingMetadata(
  title: string,
  description: string,
  path: string,
  coverUrl: string | undefined,
): Metadata {
  const images = coverUrl ? [{ url: coverUrl, alt: title }] : [DEFAULT_SHARE_IMAGE];

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...OPEN_GRAPH_BASE, url: path, title, description, images },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}

export function itemMetadata(
  listing: ListingDetail,
  item: ListingItemDetail,
  t: Translate,
): Metadata {
  const name = t('listing.metadata.itemTitle', {
    name: item.modelName,
    condition: item.cosmeticCondition,
  });
  const title = item.priceCents === null ? name : `${name} – ${formatPrice(item.priceCents)}`;

  return listingMetadata(
    title,
    itemDescription(listing, item, t),
    `/items/${item.id}`,
    listing.photos[0]?.cardUrl,
  );
}

export function itemDescription(listing: ListingDetail, item: ListingItemDetail, t: Translate) {
  const facts = joinParts([
    joinParts([t(`enums.category.${item.category}`), item.mount]),
    t('listing.metadata.condition', {
      condition: t(`enums.cosmeticCondition.${item.cosmeticCondition}`),
    }),
    item.shutterCount === null
      ? null
      : t('listing.metadata.shutterCount', { count: item.shutterCount }),
    listing.city,
  ]);

  return withSellerText(facts, listing.description);
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
  const description = bundleDescription(listing, t);

  return listingMetadata(title, description, `/bundles/${listing.id}`, listing.photos[0]?.cardUrl);
}

export function bundleDescription(listing: ListingDetail, t: Translate) {
  return withSellerText(
    joinParts([t('listing.metadata.bundleOf', { count: listing.items.length }), listing.city]),
    listing.description,
  );
}
