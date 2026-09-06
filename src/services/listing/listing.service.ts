import type { BrowseFilters } from '@/lib/browse-filters';
import { MAX_PHOTOS } from '@/lib/photos';
import { type ListingItemInput, listingRepository } from '@/repositories/listing.repository';
import { modelRepository } from '@/repositories/model.repository';
import { STORAGE_KEY_PATTERN } from './listing.constants';
import { ListingError } from './listing.error';
import { mapToDetail, mapToSummary } from './listing.mappers';
import type { CreateListingInput, ListingDetail, ListingSummary } from './listing.types';
import { parsePriceCents, parseShutterCount } from './listing.utils';

export const listingService = {
  async get(id: string): Promise<ListingDetail | null> {
    const row = await listingRepository.findById(id);

    return row ? mapToDetail(row) : null;
  },

  async getPublished(filters: BrowseFilters): Promise<ListingSummary[]> {
    const rows = await listingRepository.listPublished(filters);

    return rows.map(mapToSummary);
  },

  async getSellerListings(sellerId: string): Promise<ListingSummary[]> {
    const rows = await listingRepository.listBySeller(sellerId);

    return rows.map(mapToSummary);
  },

  async create(input: CreateListingInput) {
    if (input.items.length === 0) throw new ListingError('Add at least one item.');

    if (input.items.some((item) => !item.modelId)) {
      throw new ListingError('Pick a model from the catalog for every item.');
    }

    if (!input.location.trim()) throw new ListingError('Enter a location.');

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

    const priceCents = isBundle
      ? parsePriceCents(input.bundlePrice ?? '')
      : items[0].item.price_cents;

    if (input.photoKeys.length > MAX_PHOTOS) {
      throw new ListingError(`A listing can have up to ${MAX_PHOTOS} photos.`);
    }
    if (input.photoKeys.some((key) => !STORAGE_KEY_PATTERN.test(key))) {
      throw new ListingError('One of the photos failed to upload — remove it and try again.');
    }

    const listing = await listingRepository.insert(
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
  },
} as const;
