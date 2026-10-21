import type { MetadataRoute } from 'next';
import { modelHref } from '@/lib/model-href';
import { SITE_URL } from '@/lib/site';
import { listingService } from '@/services/listing/listing.service';
import { modelCatalogService } from '@/services/model-catalog/model-catalog.service';

export const revalidate = 3600;

const categories = ['camera', 'lens', 'accessory'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, models] = await Promise.all([
    listingService.getSitemapListings(),
    modelCatalogService.getModelsWithActiveAds(),
  ]);
  const newest = listings.reduce<Date | undefined>(
    (latest, listing) => (latest && latest > listing.updatedAt ? latest : listing.updatedAt),
    undefined,
  );

  const listingPages = listings.flatMap((listing) => [
    ...(listing.isBundle
      ? [{ url: `${SITE_URL}/bundles/${listing.id}`, lastModified: listing.updatedAt }]
      : []),
    ...listing.itemIds.map((itemId) => ({
      url: `${SITE_URL}/items/${itemId}`,
      lastModified: listing.updatedAt,
    })),
  ]);

  const sellerIds = [...new Set(listings.map((listing) => listing.sellerId))];

  return [
    { url: SITE_URL, lastModified: newest, changeFrequency: 'daily', priority: 1 },
    ...categories.map((category) => ({
      url: `${SITE_URL}/?category=${category}`,
      lastModified: newest,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/about`, changeFrequency: 'yearly', priority: 0.3 },
    ...models.map((model) => ({
      url: `${SITE_URL}${modelHref(model.slug)}`,
      lastModified: model.updatedAt,
    })),
    ...listingPages,
    ...sellerIds.map((sellerId) => ({ url: `${SITE_URL}/sellers/${sellerId}` })),
  ];
}
