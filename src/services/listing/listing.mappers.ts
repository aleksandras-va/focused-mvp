import 'server-only';

import type { ModelCategory } from '@/db/types';
import { bundleFullPriceCents } from '@/lib/bundle-price';
import { countByCategory, resolveListingTitle } from '@/lib/listing-title';
import type {
  ListingCardRow,
  ListingDetailItemRow,
  ListingDetailRow,
  SitemapListingRow,
} from '@/repositories/listing.repository';
import type { CatalogModel } from '../model-catalog/model-catalog.types';
import { photoService } from '../photo/photo.service';
import type {
  BundleRole,
  EditableListing,
  EditablePhoto,
  ListingDetail,
  ListingItemDetail,
  ListingPhotoUrl,
  ListingSummary,
  SitemapListing,
} from './listing.types';
import { centsToPriceInput } from './listing.utils';

function shownItems<T extends { isSold: boolean }>(items: T[]) {
  const forSale = items.filter((item) => !item.isSold);

  return { forSale, shown: forSale.length > 0 ? forSale : items };
}

function bundleRole(row: ListingCardRow): BundleRole {
  if (row.kind === 'bundle' || row.unsold_count <= 1) return 'none';

  return row.sold_separately ? 'alsoInBundle' : 'bundleOnly';
}

export function mapToSummary(row: ListingCardRow, viewerId: string | null): ListingSummary {
  const isBundle = row.kind === 'bundle';
  const { forSale, shown } = shownItems(
    row.items.map((item) => ({ ...item, isSold: item.sold_at !== null })),
  );
  const own = isBundle ? shown : shown.filter((item) => item.id === row.item_id);
  const first = own[0];

  return {
    id: row.listing_id,
    itemId: row.item_id,
    title: resolveListingTitle(
      own.map((item) => ({
        name: item.model_name ?? item.custom_name ?? '',
        category: item.category,
      })),
    ),
    priceCents: row.price_cents,
    fullPriceCents: isBundle
      ? bundleFullPriceCents(
          row.price_cents,
          forSale.map((item) => item.price_cents),
        )
      : null,
    city: row.city_name,
    status: row.status,
    isBundle,
    itemCount: forSale.length,
    bundleRole: bundleRole(row),
    bundledWith: isBundle ? [] : countByCategory(forSale.filter((item) => item.id !== row.item_id)),
    brand: first?.brand_name ?? null,
    mount: first?.mount_name ?? null,
    cosmeticCondition: isBundle ? null : (first?.cosmetic_condition ?? null),
    shutterCount: isBundle ? null : (first?.shutter_count ?? null),
    coverUrl: row.cover_key ? photoService.getPublicUrl(row.cover_key, 'card') : null,
    isOwner: row.seller_id === viewerId,
  };
}

export function mapToDetail(row: ListingDetailRow, viewerId: string | null): ListingDetail {
  const items = row.items.map(mapToItemDetail);
  const { forSale, shown } = shownItems(items);

  return {
    id: row.id,
    title: resolveListingTitle(
      shown.map((item) => ({ name: item.modelName, category: item.category })),
    ),
    priceCents: row.price_cents,
    fullPriceCents: bundleFullPriceCents(
      row.price_cents,
      forSale.map((item) => item.priceCents),
    ),
    city: row.city_name,
    status: row.status,
    isBundle: forSale.length > 1,
    contact: { email: row.contact_email, phone: row.contact_phone },
    seller: {
      id: row.seller_id,
      name: row.seller_name,
      isStore: row.store_name !== null,
      storeName: row.store_name,
      storeSlug: row.store_slug,
    },
    items,
    isOwner: row.seller_id === viewerId,
  };
}

export function mapToEditable(row: ListingDetailRow, models: CatalogModel[]): EditableListing {
  const modelsById = new Map(models.map((model) => [model.id, model]));

  return {
    id: row.id,
    status: row.status,
    bundlePrice: row.price_cents === null ? '' : centsToPriceInput(row.price_cents),
    cityId: row.city_id ?? '',
    contactEmail: row.contact_email ?? '',
    contactPhone: row.contact_phone ?? '',
    items: row.items.flatMap((item) => {
      if (item.sold_at !== null) return [];

      const model = item.model_id ? modelsById.get(item.model_id) : undefined;

      const custom = item.custom_name
        ? { name: item.custom_name, category: item.custom_category }
        : null;

      if (!model && !custom) return [];

      return [
        {
          id: item.id,
          model: model ?? null,
          custom,
          price: item.price_cents === null ? '' : centsToPriceInput(item.price_cents),
          cosmeticCondition: item.cosmetic_condition,
          functionalCondition: item.functional_condition,
          shutterCount: item.shutter_count === null ? '' : String(item.shutter_count),
          soldSeparately: item.sold_separately,
          description: item.description ?? '',
          photos: mapToEditablePhotos(item),
          inclusions: item.inclusions.map(({ inclusion }) => inclusion),
        },
      ];
    }),
  };
}

function mapToItemDetail(row: ListingDetailItemRow): ListingItemDetail {
  return {
    id: row.id,
    modelName: row.model_name ?? row.custom_name ?? '',
    modelSlug: row.model_slug,
    brand: row.brand_name,
    brandSlug: row.brand_slug,
    mount: row.mount_name,
    category: itemCategory(row),
    priceCents: row.price_cents,
    cosmeticCondition: row.cosmetic_condition,
    functionalCondition: row.functional_condition,
    shutterCount: row.shutter_count,
    soldSeparately: row.sold_separately,
    isSold: row.sold_at !== null,
    description: row.description,
    photos: mapToPhotos(row),
    inclusions: row.inclusions.map(({ inclusion }) => inclusion),
  };
}

function itemCategory(row: ListingDetailItemRow): ModelCategory {
  const category = row.category ?? row.custom_category;

  if (!category) throw new Error(`Listing item ${row.id} has no category.`);

  return category;
}

function mapToPhotos(row: ListingDetailItemRow): ListingPhotoUrl[] {
  const photos: ListingPhotoUrl[] = [];

  for (const photo of row.photos) {
    const largeUrl = photoService.getPublicUrl(photo.storage_key, 'large');
    const cardUrl = photoService.getPublicUrl(photo.storage_key, 'card');

    if (largeUrl && cardUrl) photos.push({ largeUrl, cardUrl });
  }

  return photos;
}

function mapToEditablePhotos(row: ListingDetailItemRow): EditablePhoto[] {
  return row.photos.flatMap((photo) => {
    const url = photoService.getPublicUrl(photo.storage_key, 'card');

    return url ? [{ storageKey: photo.storage_key, url }] : [];
  });
}

export function mapToSitemapListing(row: SitemapListingRow): SitemapListing {
  return {
    id: row.id,
    sellerId: row.seller_id,
    itemIds: row.items.map((item) => item.id),
    isBundle: row.items.length > 1,
    updatedAt: row.updated_at,
  };
}
