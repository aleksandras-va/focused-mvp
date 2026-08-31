import 'server-only';
import type {
  CosmeticCondition,
  FunctionalCondition,
  ListingInclusion,
  ListingStatus,
} from '@/db/tables';
import { LISTING_LABELS } from '@/lib/listing-options';
import {
  findListingById,
  insertListing,
  type ListingRow,
  listListingsBySeller,
  listPublishedListings,
} from '@/repositories/listing-repository';

export class ListingError extends Error {}

export type ListingSummary = {
  id: string;
  modelName: string;
  modelSlug: string;
  brand: string;
  mount: string | null;
  priceCents: number;
  cosmeticCondition: string;
  functionalCondition: string;
  shutterCount: number | null;
  location: string;
  status: ListingStatus;
  seller: { name: string; isStore: boolean; storeName: string | null; storeSlug: string | null };
};

export type ListingDetail = ListingSummary & {
  description: string | null;
  inclusions: string[];
};

export type CreateListingInput = {
  sellerId: string;
  modelId: string;
  price: string;
  cosmeticCondition: CosmeticCondition;
  functionalCondition: FunctionalCondition;
  shutterCount: string | null;
  location: string;
  description: string | null;
  inclusions: ListingInclusion[];
  publish: boolean;
};

function toSummary(row: ListingRow): ListingSummary {
  return {
    id: row.id,
    modelName: row.model_name,
    modelSlug: row.model_slug,
    brand: row.brand_name,
    mount: row.mount_name,
    priceCents: row.price_cents,
    cosmeticCondition: LISTING_LABELS.get(row.cosmetic_condition) ?? row.cosmetic_condition,
    functionalCondition: LISTING_LABELS.get(row.functional_condition) ?? row.functional_condition,
    shutterCount: row.shutter_count,
    location: row.location,
    status: row.status,
    seller: {
      name: row.seller_name,
      isStore: row.seller_type === 'store',
      storeName: row.store_name,
      storeSlug: row.store_slug,
    },
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
  if (!input.modelId) throw new ListingError('Pick a model from the catalog.');
  if (!input.location.trim()) throw new ListingError('Enter a location.');

  const listing = await insertListing(
    {
      seller_id: input.sellerId,
      model_id: input.modelId,
      description: input.description?.trim() || null,
      price_cents: parsePriceCents(input.price),
      cosmetic_condition: input.cosmeticCondition,
      functional_condition: input.functionalCondition,
      shutter_count: parseShutterCount(input.shutterCount),
      location: input.location.trim(),
      status: input.publish ? 'active' : 'draft',
      published_at: input.publish ? new Date() : null,
    },
    input.inclusions,
  );

  return listing.id;
}

export async function getListing(id: string): Promise<ListingDetail | null> {
  const row = await findListingById(id);
  if (!row) return null;

  return {
    ...toSummary(row),
    description: row.description,
    inclusions: (row.inclusions ?? []).map((i) => LISTING_LABELS.get(i) ?? i),
  };
}

export async function getPublishedListings(): Promise<ListingSummary[]> {
  const rows = await listPublishedListings();
  return rows.map(toSummary);
}

export async function getSellerListings(sellerId: string): Promise<ListingSummary[]> {
  const rows = await listListingsBySeller(sellerId);
  return rows.map(toSummary);
}
