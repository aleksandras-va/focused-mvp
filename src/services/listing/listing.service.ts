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
  CreateListingItemInput,
  CreateListingPayload,
  EditableListing,
  ListingDetail,
  ListingSummary,
} from './listing.types';
import { optionalPriceCents, parsePriceCents, parseShutterCount } from './listing.utils';

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

  async getPublishedBySeller(sellerId: string, viewerId: string | null): Promise<ListingSummary[]> {
    const rows = await listingRepository.listPublishedBySeller(sellerId);

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

    const models = await modelCatalogService.getByIds(
      row.items.flatMap((item) => (item.model_id ? [item.model_id] : [])),
    );

    return mapToEditable(row, models);
  },

  async save(
    listingId: string | null,
    sellerId: string,
    input: CreateListingPayload,
  ): Promise<CreatedListing> {
    const existing = listingId ? await requireOwned(listingId, sellerId) : null;
    const publish = input.publish || existing?.status === 'active';
    const content = await buildContent(input, publish);

    if (!existing) {
      return listingRepository.insert(
        {
          ...content.values,
          seller_id: sellerId,
          status: publish ? 'active' : 'draft',
          published_at: publish ? new Date() : null,
        },
        content.items,
        content.photoKeys,
      );
    }

    return listingRepository.update(
      existing.id,
      {
        ...content.values,
        status: publish ? 'active' : existing.status,
        published_at: publish ? (existing.published_at ?? new Date()) : existing.published_at,
      },
      content.items,
      content.photoKeys,
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

    if (listing.status === 'draft') await assertPublishable(listingId);

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

async function assertPublishable(listingId: string) {
  const row = await listingRepository.findById(listingId);

  if (!row) throw new ListingError('That ad no longer exists.');
  if (row.items.length === 0) throw new ListingError('Add an item before publishing.');
  if (!row.city_id) throw new ListingError('Pick a city before publishing.');

  if (row.price_cents === null || row.items.some((item) => item.price_cents === null)) {
    throw new ListingError('Give every item a price before publishing.');
  }
}

function isDescribed(item: CreateListingItemInput) {
  return item.custom
    ? item.custom.name.trim() !== '' && item.custom.category !== null
    : item.modelId !== '';
}

function undescribedItemMessage(items: CreateListingItemInput[]) {
  const custom = items.find((item) => item.custom && !isDescribed(item))?.custom;

  if (!custom) return 'Pick a model from the catalog for every item.';
  if (!custom.name.trim()) return 'Name every item you add by hand.';

  return 'Choose camera, lens or accessory for every item you add by hand.';
}

async function buildContent(input: CreateListingPayload, publish: boolean) {
  if (input.photoKeys.length > MAX_PHOTOS) {
    throw new ListingError(`A listing can have up to ${MAX_PHOTOS} photos.`);
  }

  const photoKeys = input.photoKeys.filter((key) => STORAGE_KEY_PATTERN.test(key));

  if (publish && photoKeys.length !== input.photoKeys.length) {
    throw new ListingError('One of the photos failed to upload — remove it and try again.');
  }

  const described = input.items.filter(isDescribed);

  if (publish) {
    if (described.length === 0) throw new ListingError('Add at least one item.');
    if (described.length !== input.items.length) {
      throw new ListingError(undescribedItemMessage(input.items));
    }
    if (!input.cityId) throw new ListingError('Pick a city.');
  }

  const models = await modelRepository.findForListing(
    described.flatMap((item) => (item.custom ? [] : [item.modelId])),
  );

  const modelsById = new Map(models.map((model) => [model.id, model]));

  const items: ListingItemInput[] = described.map((item, position) => {
    const model = item.custom ? null : modelsById.get(item.modelId);
    const custom = item.custom?.category
      ? { name: item.custom.name.trim(), category: item.custom.category }
      : null;

    if (!model && !custom) throw new ListingError('Pick a model from the catalog for every item.');

    const asksShutterCount = model
      ? model.category === 'camera' && !model.is_film
      : custom?.category === 'camera';

    return {
      item: {
        model_id: model?.id ?? null,
        custom_name: custom?.name ?? null,
        custom_category: custom?.category ?? null,
        price_cents: publish ? parsePriceCents(item.price) : optionalPriceCents(item.price),
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

  if (publish && isBundle && !input.bundlePrice?.trim()) {
    throw new ListingError('Enter a price for the whole bundle.');
  }

  return {
    photoKeys,
    values: {
      description: input.description?.trim() || null,
      price_cents: isBundle
        ? optionalPriceCents(input.bundlePrice ?? '')
        : (items[0]?.item.price_cents ?? null),
      city_id: input.cityId || null,
      contact_email: input.contactEmail?.trim() || null,
      contact_phone: input.contactPhone?.trim() || null,
    },
    items,
  };
}
