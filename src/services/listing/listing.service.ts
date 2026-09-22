import 'server-only';

import type { BrowseFilters } from '@/lib/browse-filters';
import { MAX_PHOTOS } from '@/lib/photos';
import { type ListingItemInput, listingRepository } from '@/repositories/listing.repository';
import { modelRepository } from '@/repositories/model.repository';
import { modelCatalogService } from '../model-catalog/model-catalog.service';
import { STORAGE_KEY_PATTERN } from './listing.constants';
import { ListingError } from './listing.error';
import { mapToDetail, mapToEditable, mapToSummary } from './listing.mappers';
import type {
  CreatedListing,
  CreateListingInput,
  CreateListingPayload,
  EditableListing,
  ListingDetail,
  ListingSummary,
} from './listing.types';
import { parsePriceCents, parseShutterCount } from './listing.utils';

export const listingService = {
  async get(id: string, viewerId: string | null): Promise<ListingDetail | null> {
    const row = await listingRepository.findById(id);

    if (!row || !isVisibleTo(row.status, row.seller_id, viewerId)) return null;

    return mapToDetail(row, viewerId);
  },

  async getByItemId(itemId: string, viewerId: string | null): Promise<ListingDetail | null> {
    const row = await listingRepository.findByItemId(itemId);

    if (!row || !isVisibleTo(row.status, row.seller_id, viewerId)) return null;

    return mapToDetail(row, viewerId);
  },

  async getPublished(filters: BrowseFilters, viewerId: string | null): Promise<ListingSummary[]> {
    const rows = await listingRepository.listPublished(filters);

    return rows.map((row) => mapToSummary(row, viewerId));
  },

  async getSellerListings(sellerId: string): Promise<ListingSummary[]> {
    const rows = await listingRepository.listBySeller(sellerId);

    return rows.map((row) => mapToSummary(row, sellerId));
  },

  async getForEdit(listingId: string, sellerId: string): Promise<EditableListing> {
    const row = await listingRepository.findById(listingId);

    if (!row) throw new ListingError('That ad no longer exists.');
    if (row.seller_id !== sellerId) throw new ListingError('That ad is not yours.');

    const models = await modelCatalogService.getByIds(row.items.map((item) => item.model_id));

    return mapToEditable(row, models);
  },

  async create(input: CreateListingInput): Promise<CreatedListing> {
    const content = await buildContent(input);

    return listingRepository.insert(
      {
        ...content.values,
        seller_id: input.sellerId,
        status: input.publish ? 'active' : 'draft',
        published_at: input.publish ? new Date() : null,
      },
      content.items,
      input.photoKeys,
    );
  },

  async update(
    listingId: string,
    sellerId: string,
    input: CreateListingPayload,
  ): Promise<CreatedListing> {
    const listing = await requireOwned(listingId, sellerId);
    const content = await buildContent(input);
    const publish = input.publish || listing.status === 'active';

    return listingRepository.update(
      listingId,
      {
        ...content.values,
        status: publish ? 'active' : listing.status,
        published_at: publish ? (listing.published_at ?? new Date()) : listing.published_at,
      },
      content.items,
      input.photoKeys,
    );
  },

  async markSold(listingId: string, sellerId: string): Promise<void> {
    await requireOwned(listingId, sellerId);
    await listingRepository.updateStatus(listingId, { status: 'sold' });
  },

  async hide(listingId: string, sellerId: string): Promise<void> {
    await requireOwned(listingId, sellerId);
    await listingRepository.updateStatus(listingId, { status: 'removed' });
  },

  async restore(listingId: string, sellerId: string): Promise<void> {
    const listing = await requireOwned(listingId, sellerId);

    await listingRepository.updateStatus(listingId, {
      status: 'active',
      published_at: listing.published_at ?? new Date(),
    });
  },

  async remove(listingId: string, sellerId: string): Promise<void> {
    await requireOwned(listingId, sellerId);
    await listingRepository.deleteById(listingId);
  },
} as const;

function isVisibleTo(status: string, sellerId: string, viewerId: string | null) {
  return status === 'active' || sellerId === viewerId;
}

async function requireOwned(listingId: string, sellerId: string) {
  const listing = await listingRepository.findSeller(listingId);

  if (!listing) throw new ListingError('That ad no longer exists.');
  if (listing.seller_id !== sellerId) throw new ListingError('That ad is not yours.');

  return listing;
}

async function buildContent(input: CreateListingPayload) {
  if (input.items.length === 0) throw new ListingError('Add at least one item.');

  if (input.items.some((item) => !item.modelId)) {
    throw new ListingError('Pick a model from the catalog for every item.');
  }

  if (!input.cityId) throw new ListingError('Pick a city.');

  const models = await modelRepository.findForListing(input.items.map((item) => item.modelId));

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

  if (input.photoKeys.length > MAX_PHOTOS) {
    throw new ListingError(`A listing can have up to ${MAX_PHOTOS} photos.`);
  }
  if (input.photoKeys.some((key) => !STORAGE_KEY_PATTERN.test(key))) {
    throw new ListingError('One of the photos failed to upload — remove it and try again.');
  }

  return {
    values: {
      description: input.description?.trim() || null,
      price_cents: isBundle ? parsePriceCents(input.bundlePrice ?? '') : items[0].item.price_cents,
      city_id: input.cityId,
      contact_email: input.contactEmail?.trim() || null,
      contact_phone: input.contactPhone?.trim() || null,
    },
    items,
  };
}
