import type { Metadata } from 'next';
import type { ListingDetail, ListingItemDetail } from '@/services/listing/listing.types';
import { formatCount, formatPrice } from './format';

const SITE_NAME = 'Focused';

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

export function itemMetadata(listing: ListingDetail, item: ListingItemDetail): Metadata {
  const title = joinParts([
    item.modelName,
    item.priceCents === null ? null : formatPrice(item.priceCents),
  ]);
  const description = joinParts([
    `${item.cosmeticCondition} condition`,
    item.shutterCount === null ? null : `${formatCount(item.shutterCount)} shutter count`,
    listing.city,
  ]);

  return listingMetadata(title, description, `/items/${item.id}`, listing.photos[0]?.largeUrl);
}

export function bundleMetadata(listing: ListingDetail): Metadata {
  const title = joinParts([
    listing.title,
    listing.priceCents === null ? null : formatPrice(listing.priceCents),
  ]);
  const description = joinParts([`Bundle of ${listing.items.length} items`, listing.city]);

  return listingMetadata(title, description, `/bundles/${listing.id}`, listing.photos[0]?.largeUrl);
}
