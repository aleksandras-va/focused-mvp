import type { getTranslations } from 'next-intl/server';
import type { CosmeticCondition } from '@/db/types';
import type { ListingDetail, ListingItemDetail } from '@/services/listing/listing.types';
import { bundleDescription, itemDescription } from './listing-metadata';
import { galleryPhotos, itemsForSale } from './listing-photos';
import { modelHref } from './model-href';
import { SITE_URL } from './site';

type Translate = Awaited<ReturnType<typeof getTranslations<never>>>;

const USED_CONDITION = 'https://schema.org/UsedCondition';

const ITEM_CONDITION: Record<CosmeticCondition, string> = {
  new: 'https://schema.org/NewCondition',
  excellent: USED_CONDITION,
  good: USED_CONDITION,
  well_used: USED_CONDITION,
  damaged: 'https://schema.org/DamagedCondition',
};

function offer(listing: ListingDetail, priceCents: number, path: string, condition: string) {
  return {
    '@type': 'Offer',
    url: `${SITE_URL}${path}`,
    price: (priceCents / 100).toFixed(2),
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
    itemCondition: condition,
    seller: {
      '@type': listing.seller.isStore ? 'Organization' : 'Person',
      name: listing.seller.storeName ?? listing.seller.name,
      url: `${SITE_URL}/sellers/${listing.seller.id}`,
    },
  };
}

function images(photos: { largeUrl: string }[]) {
  return photos.length > 0 ? photos.map((photo) => photo.largeUrl) : undefined;
}

function breadcrumbs(item: ListingItemDetail, t: Translate) {
  const trail = [
    { name: t(`enums.categoryPlural.${item.category}`), path: `/?category=${item.category}` },
    item.brand && item.brandSlug ? { name: item.brand, path: `/?brand=${item.brandSlug}` } : null,
    item.modelSlug ? { name: item.modelName, path: modelHref(item.modelSlug) } : null,
  ].filter((crumb) => crumb !== null);

  return breadcrumbList(trail);
}

export function breadcrumbList(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

export function itemStructuredData(
  listing: ListingDetail,
  item: ListingItemDetail,
  t: Translate,
): object[] {
  const path = `/items/${item.id}`;
  const product =
    listing.status === 'active' &&
    !item.isSold &&
    item.priceCents !== null &&
    (item.soldSeparately || !listing.isBundle)
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: item.modelName,
          image: images(item.photos),
          description: itemDescription(listing, item, t),
          category: t(`enums.category.${item.category}`),
          brand: item.brand ? { '@type': 'Brand', name: item.brand } : undefined,
          offers: offer(listing, item.priceCents, path, ITEM_CONDITION[item.cosmeticCondition]),
        }
      : null;

  return [product, breadcrumbs(item, t)].filter((entry) => entry !== null);
}

export function bundleStructuredData(
  listing: ListingDetail,
  title: string,
  t: Translate,
): object[] {
  if (listing.status !== 'active' || listing.priceCents === null) return [];

  const conditions = itemsForSale(listing).map((item) => ITEM_CONDITION[item.cosmeticCondition]);
  const condition = conditions.every((value) => value === conditions[0])
    ? conditions[0]
    : USED_CONDITION;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      image: images(galleryPhotos(listing, null)),
      description: bundleDescription(listing, t),
      offers: offer(listing, listing.priceCents, `/bundles/${listing.id}`, condition),
    },
  ];
}
