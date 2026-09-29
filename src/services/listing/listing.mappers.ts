import 'server-only';

import type { ModelCategory } from '@/db/types';
import { LISTING_LABELS } from '@/lib/listing-options';
import type {
  ListingCardRow,
  ListingDetailItemRow,
  ListingDetailRow,
} from '@/repositories/listing.repository';
import type { CatalogModel } from '../model-catalog/model-catalog.types';
import { photoService } from '../photo/photo.service';
import type {
  EditableListing,
  ListingDetail,
  ListingItemDetail,
  ListingPhotoUrl,
  ListingSummary,
} from './listing.types';
import { centsToPriceInput } from './listing.utils';

export function mapToSummary(row: ListingCardRow, viewerId: string | null): ListingSummary {
  const first = row.items[0];

  return {
    id: row.id,
    title: listingTitle(row.items.map((item) => item.model_name ?? item.custom_name ?? '')),
    priceCents: row.price_cents,
    city: row.city_name,
    status: row.status,
    isBundle: row.items.length > 1,
    itemCount: row.items.length,
    firstItemId: first?.id ?? null,
    brand: first?.brand_name ?? null,
    mount: first?.mount_name ?? null,
    cosmeticCondition: first
      ? (LISTING_LABELS.get(first.cosmetic_condition) ?? first.cosmetic_condition)
      : null,
    shutterCount: first?.shutter_count ?? null,
    coverUrl: row.cover_key ? photoService.getPublicUrl(row.cover_key, 'card') : null,
    isOwner: row.seller_id === viewerId,
  };
}

export function mapToDetail(row: ListingDetailRow, viewerId: string | null): ListingDetail {
  const items = row.items.map(mapToItemDetail);

  return {
    id: row.id,
    title: listingTitle(items.map((item) => item.modelName)),
    priceCents: row.price_cents,
    city: row.city_name,
    status: row.status,
    isBundle: items.length > 1,
    description: row.description,
    contact: { email: row.contact_email, phone: row.contact_phone },
    seller: {
      id: row.seller_id,
      name: row.seller_name,
      isStore: row.store_name !== null,
      storeName: row.store_name,
      storeSlug: row.store_slug,
    },
    items,
    photos: mapToPhotos(row),
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
    description: row.description ?? '',
    contactEmail: row.contact_email ?? '',
    contactPhone: row.contact_phone ?? '',
    photos: row.photos.flatMap((photo) => {
      const url = photoService.getPublicUrl(photo.storage_key, 'card');

      return url ? [{ storageKey: photo.storage_key, url }] : [];
    }),
    items: row.items.flatMap((item) => {
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
    brand: row.brand_name,
    brandSlug: row.brand_slug,
    mount: row.mount_name,
    category: itemCategory(row),
    priceCents: row.price_cents,
    cosmeticCondition: LISTING_LABELS.get(row.cosmetic_condition) ?? row.cosmetic_condition,
    functionalCondition: LISTING_LABELS.get(row.functional_condition) ?? row.functional_condition,
    shutterCount: row.shutter_count,
    soldSeparately: row.sold_separately,
    inclusions: row.inclusions.map(({ inclusion }) => LISTING_LABELS.get(inclusion) ?? inclusion),
  };
}

function itemCategory(row: ListingDetailItemRow): ModelCategory {
  const category = row.category ?? row.custom_category;

  if (!category) throw new Error(`Listing item ${row.id} has no category.`);

  return category;
}

function listingTitle(modelNames: string[]) {
  return modelNames.length > 0 ? modelNames.join(' + ') : 'Untitled draft';
}

function mapToPhotos(row: ListingDetailRow): ListingPhotoUrl[] {
  const photos: ListingPhotoUrl[] = [];

  for (const photo of row.photos) {
    const largeUrl = photoService.getPublicUrl(photo.storage_key, 'large');
    const cardUrl = photoService.getPublicUrl(photo.storage_key, 'card');

    if (largeUrl && cardUrl) photos.push({ largeUrl, cardUrl });
  }

  return photos;
}
