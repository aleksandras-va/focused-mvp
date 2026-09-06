import { LISTING_LABELS } from '@/lib/listing-options';
import type {
  ListingCardRow,
  ListingDetailItemRow,
  ListingDetailRow,
} from '@/repositories/listing.repository';
import { photoService } from '../photo/photo.service';
import type {
  ListingDetail,
  ListingItemDetail,
  ListingPhotoUrl,
  ListingSummary,
} from './listing.types';

export function mapToSummary(row: ListingCardRow): ListingSummary {
  const first = row.items[0];

  return {
    id: row.id,
    title: row.items.map((item) => item.model_name).join(' + '),
    priceCents: row.price_cents,
    location: row.location,
    status: row.status,
    isBundle: row.items.length > 1,
    itemCount: row.items.length,
    brand: first?.brand_name ?? null,
    mount: first?.mount_name ?? null,
    cosmeticCondition: first
      ? (LISTING_LABELS.get(first.cosmetic_condition) ?? first.cosmetic_condition)
      : null,
    shutterCount: first?.shutter_count ?? null,
    coverUrl: row.cover_key ? photoService.getPublicUrl(row.cover_key, 'card') : null,
  };
}

export function mapToDetail(row: ListingDetailRow): ListingDetail {
  const items = row.items.map(mapToItemDetail);

  return {
    id: row.id,
    title: items.map((item) => item.modelName).join(' + '),
    priceCents: row.price_cents,
    location: row.location,
    status: row.status,
    isBundle: items.length > 1,
    description: row.description,
    contact: { email: row.contact_email, phone: row.contact_phone },
    seller: {
      name: row.seller_name,
      isStore: row.store_name !== null,
      storeName: row.store_name,
      storeSlug: row.store_slug,
    },
    items,
    photos: mapToPhotos(row),
  };
}

function mapToItemDetail(row: ListingDetailItemRow): ListingItemDetail {
  return {
    id: row.id,
    modelName: row.model_name,
    modelSlug: row.model_slug,
    brand: row.brand_name,
    mount: row.mount_name,
    category: row.category,
    priceCents: row.price_cents,
    cosmeticCondition: LISTING_LABELS.get(row.cosmetic_condition) ?? row.cosmetic_condition,
    functionalCondition: LISTING_LABELS.get(row.functional_condition) ?? row.functional_condition,
    shutterCount: row.shutter_count,
    soldSeparately: row.sold_separately,
    inclusions: row.inclusions.map(({ inclusion }) => LISTING_LABELS.get(inclusion) ?? inclusion),
  };
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
