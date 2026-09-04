import 'server-only';
import type {
  CosmeticCondition,
  FunctionalCondition,
  Inclusion,
  ListingStatus,
  ModelCategory,
} from '@/db/tables';
import type { BrowseFilters } from '@/lib/browse-filters';
import { LISTING_LABELS } from '@/lib/listing-options';
import { MAX_PHOTOS } from '@/lib/photos';
import {
  findListingById,
  insertListing,
  type ListingItemInput,
  type ListingItemRow,
  type ListingRow,
  listListingsBySeller,
  listPublishedListings,
} from '@/repositories/listing-repository';
import { findModelsForListing } from '@/repositories/model-repository';
import { publicPhotoUrl } from '@/services/photo-service';

export class ListingError extends Error {}

export type ListingItemSummary = {
  id: string;
  modelName: string;
  modelSlug: string;
  brand: string;
  mount: string | null;
  category: ModelCategory;
  priceCents: number;
  cosmeticCondition: string;
  functionalCondition: string;
  shutterCount: number | null;
  soldSeparately: boolean;
  inclusions: string[];
};

export type ListingPhotoSummary = {
  largeUrl: string;
  cardUrl: string;
};

export type ListingSummary = {
  id: string;
  title: string;
  priceCents: number;
  location: string;
  status: ListingStatus;
  isBundle: boolean;
  seller: { name: string; isStore: boolean; storeName: string | null; storeSlug: string | null };
  items: ListingItemSummary[];
  photos: ListingPhotoSummary[];
};

export type ListingDetail = ListingSummary & {
  description: string | null;
};

export type CreateListingItemInput = {
  modelId: string;
  price: string;
  cosmeticCondition: CosmeticCondition;
  functionalCondition: FunctionalCondition;
  shutterCount: string | null;
  soldSeparately: boolean;
  inclusions: Inclusion[];
};

export type CreateListingInput = {
  sellerId: string;
  items: CreateListingItemInput[];
  bundlePrice: string | null;
  photoKeys: string[];
  location: string;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  publish: boolean;
};

const STORAGE_KEY_PATTERN = /^photos\/[0-9a-f-]{36}$/;

function toItemSummary(row: ListingItemRow): ListingItemSummary {
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

function toPhotos(row: ListingRow): ListingPhotoSummary[] {
  const photos: ListingPhotoSummary[] = [];

  for (const photo of row.photos) {
    const largeUrl = publicPhotoUrl(photo.storage_key, 'large');
    const cardUrl = publicPhotoUrl(photo.storage_key, 'card');
    if (largeUrl && cardUrl) photos.push({ largeUrl, cardUrl });
  }

  return photos;
}

function toSummary(row: ListingRow): ListingSummary {
  const items = row.items.map(toItemSummary);

  return {
    id: row.id,
    title: items.map((item) => item.modelName).join(' + '),
    photos: toPhotos(row),
    priceCents: row.price_cents,
    location: row.location,
    status: row.status,
    isBundle: items.length > 1,
    seller: {
      name: row.seller_name,
      isStore: row.store_name !== null,
      storeName: row.store_name,
      storeSlug: row.store_slug,
    },
    items,
  };
}

function parsePriceCents(price: string) {
  const normalized = price.trim().replace(',', '.');
  const value = Number(normalized);

  if (!normalized || Number.isNaN(value) || value < 0) {
    throw new ListingError('Enter a valid price.');
  }

  return Math.round(value * 100);
}

function parseShutterCount(shutterCount: string | null) {
  if (!shutterCount?.trim()) return null;

  const value = Number(shutterCount.trim());
  if (!Number.isInteger(value) || value < 0) {
    throw new ListingError('Shutter count must be a whole number.');
  }

  return value;
}

export async function createListing(input: CreateListingInput) {
  if (input.items.length === 0) throw new ListingError('Add at least one item.');
  if (input.items.some((item) => !item.modelId)) {
    throw new ListingError('Pick a model from the catalog for every item.');
  }
  if (!input.location.trim()) throw new ListingError('Enter a location.');

  const models = await findModelsForListing(input.items.map((item) => item.modelId));
  const modelsById = new Map(models.map((model) => [model.id, model]));

  const items: ListingItemInput[] = input.items.map((item, position) => {
    const model = modelsById.get(item.modelId);
    if (!model) throw new ListingError('Pick a model from the catalog for every item.');

    const asksShutterCount = model.category === 'camera' && !model.is_film;

    return {
      item: {
        model_id: item.modelId,
        price_cents: parsePriceCents(item.price),
        cosmetic_condition: item.cosmeticCondition,
        functional_condition: item.functionalCondition,
        shutter_count: asksShutterCount ? parseShutterCount(item.shutterCount) : null,
        sold_separately: item.soldSeparately,
        position,
      },
      inclusions: item.inclusions,
    };
  });

  const isBundle = items.length > 1;

  if (isBundle && !input.bundlePrice?.trim()) {
    throw new ListingError('Enter a price for the whole bundle.');
  }

  const priceCents = isBundle
    ? parsePriceCents(input.bundlePrice ?? '')
    : items[0].item.price_cents;

  if (input.photoKeys.length > MAX_PHOTOS) {
    throw new ListingError(`A listing can have up to ${MAX_PHOTOS} photos.`);
  }
  if (input.photoKeys.some((key) => !STORAGE_KEY_PATTERN.test(key))) {
    throw new ListingError('One of the photos failed to upload — remove it and try again.');
  }

  const listing = await insertListing(
    {
      seller_id: input.sellerId,
      description: input.description?.trim() || null,
      price_cents: priceCents,
      location: input.location.trim(),
      contact_email: input.contactEmail?.trim() || null,
      contact_phone: input.contactPhone?.trim() || null,
      status: input.publish ? 'active' : 'draft',
      published_at: input.publish ? new Date() : null,
    },
    items,
    input.photoKeys,
  );

  return listing.id;
}

export async function getListing(id: string): Promise<ListingDetail | null> {
  const row = await findListingById(id);
  if (!row) return null;

  return { ...toSummary(row), description: row.description };
}

export async function getPublishedListings(filters: BrowseFilters): Promise<ListingSummary[]> {
  const rows = await listPublishedListings(filters);
  return rows.map(toSummary);
}

export async function getSellerListings(sellerId: string): Promise<ListingSummary[]> {
  const rows = await listListingsBySeller(sellerId);
  return rows.map(toSummary);
}
