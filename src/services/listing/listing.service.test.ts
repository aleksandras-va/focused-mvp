import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseBrowseFilters } from '@/lib/browse-filters';
import { userRepository } from '@/repositories/user.repository';
import { cityService } from '../city/city.service';
import { modelCatalogService } from '../model-catalog/model-catalog.service';
import { listingService } from './listing.service';
import type {
  CreateListingItemInput,
  CreateListingPayload,
  SimilarListingsBasis,
} from './listing.types';

const { deleteStored } = vi.hoisted(() => ({ deleteStored: vi.fn() }));

vi.mock('../photo/photo.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../photo/photo.service')>();

  return {
    photoService: {
      ...actual.photoService,
      deleteStored,
      getPublicUrl: (storageKey: string, size: string) =>
        `https://photos.test/${storageKey}/${size}`,
    },
  };
});

const SELLER_EMAIL = 'listing-service-test@example.com';

const ADS: [slug: string, price: string][] = [
  ['sony-a7-iii', '1200'],
  ['nikon-d850', '1500'],
  ['sony-fe-50mm-f-1-8-sony-e', '150'],
];

type SimilarCase = [
  slug: string,
  basis: SimilarListingsBasis,
  basisName: string | null,
  listed: string[],
];

let sellerId: string;

async function requireModel(slug: string) {
  const model = await modelCatalogService.getModel(slug);

  if (!model) throw new Error(`No model ${slug} in the test catalog`);

  return model;
}

async function removeSellerListings() {
  const listings = await listingService.getSellerListings(sellerId);

  for (const listing of listings) await listingService.remove(listing.id, sellerId);
}

beforeAll(async () => {
  const seller =
    (await userRepository.findByEmail(SELLER_EMAIL)) ??
    (await userRepository.insert({
      email: SELLER_EMAIL,
      display_name: 'Listing test seller',
      password_hash: 'not-a-hash',
    }));

  sellerId = seller.id;
  await removeSellerListings();

  for (const [slug, price] of ADS) {
    await listingService.save(null, sellerId, await draftPayload(slug, price));
  }
});

async function itemInput(
  slug: string,
  price: string,
  overrides: Partial<CreateListingItemInput> = {},
): Promise<CreateListingItemInput> {
  const model = await requireModel(slug);

  return {
    id: randomUUID(),
    modelId: model.id,
    custom: null,
    price,
    cosmeticCondition: 'good',
    functionalCondition: 'fully_working',
    shutterCount: null,
    soldSeparately: true,
    description: null,
    photoKeys: [`photos/${randomUUID()}`],
    inclusions: [],
    ...overrides,
  };
}

async function draftPayload(slug: string, price: string): Promise<CreateListingPayload> {
  const [city] = await cityService.getAll();

  return {
    items: [await itemInput(slug, price)],
    bundlePrice: null,
    cityId: city.id,
    contactEmail: null,
    contactPhone: null,
    publish: true,
  };
}

async function bundlePayload(): Promise<CreateListingPayload> {
  const [city] = await cityService.getAll();

  return {
    items: [
      await itemInput('canon-eos-r6', '1400', { soldSeparately: false }),
      await itemInput('canon-rf-50mm-f-1-8-stm-canon-rf', '180', { soldSeparately: true }),
      await itemInput('canon-rf-24-105mm-f-4l-is-usm-canon-rf', '800', { soldSeparately: false }),
    ],
    bundlePrice: '2200',
    cityId: city.id,
    contactEmail: null,
    contactPhone: null,
    publish: true,
  };
}

function sellerCards<T extends { isOwner: boolean }>(listings: T[]) {
  return listings.filter((listing) => listing.isOwner);
}

afterAll(removeSellerListings);

describe('listingService photo storage', () => {
  beforeEach(() => deleteStored.mockClear());

  it('deletes only the photos a save drops, then all of them with the ad', async () => {
    const [kept, dropped] = [`photos/${randomUUID()}`, `photos/${randomUUID()}`];
    const payload = { ...(await draftPayload('nikon-d850', '900')), publish: false };
    const [item] = payload.items;
    const { id } = await listingService.save(null, sellerId, {
      ...payload,
      items: [{ ...item, photoKeys: [kept, dropped] }],
    });

    expect(deleteStored).not.toHaveBeenCalled();

    await listingService.save(id, sellerId, {
      ...payload,
      items: [{ ...item, photoKeys: [kept] }],
    });

    expect(deleteStored).toHaveBeenLastCalledWith([dropped]);

    await listingService.remove(id, sellerId);

    expect(deleteStored).toHaveBeenLastCalledWith([kept]);
  });

  it('sells the last bundle-only item separately when every other item is', async () => {
    const payload = await bundlePayload();
    const items = payload.items.map((item, index) => ({
      ...item,
      soldSeparately: index !== 0,
    }));
    const { id } = await listingService.save(null, sellerId, { ...payload, items });

    try {
      const detail = await listingService.get(id, null);

      expect(detail?.items.map((item) => item.soldSeparately)).toEqual([true, true, true]);
    } finally {
      await listingService.remove(id, sellerId);
    }
  });

  it('refuses to publish an item without a photo', async () => {
    const payload = await draftPayload('nikon-d850', '900');
    const [item] = payload.items;

    await expect(
      listingService.save(null, sellerId, { ...payload, items: [{ ...item, photoKeys: [] }] }),
    ).rejects.toThrow('no_photos');
  });
});

describe('listingService bundles', () => {
  let bundleId: string;
  let itemIds: string[];

  beforeAll(async () => {
    const created = await listingService.save(null, sellerId, await bundlePayload());

    bundleId = created.id;
    itemIds = created.itemIds;
  });

  afterAll(async () => {
    await listingService.remove(bundleId, sellerId);
  });

  it('lists the bundle plus a card for the item sold separately on the open feed', async () => {
    const { listings } = await listingService.getPublishedPage(parseBrowseFilters({}), sellerId, 1);
    const cards = sellerCards(listings).filter((card) => card.id === bundleId);

    expect(cards.map((card) => [card.isBundle, card.bundleRole, card.priceCents]).sort()).toEqual([
      [false, 'alsoInBundle', 18000],
      [true, 'none', 220000],
    ]);
    expect(cards.find((card) => card.isBundle)).toMatchObject({
      itemCount: 3,
      fullPriceCents: 238000,
      cosmeticCondition: null,
    });
  });

  it('shows a bundle-only item under a filter, at the bundle price', async () => {
    const { listings } = await listingService.getPublishedPage(
      parseBrowseFilters({ model: 'canon-eos-r6' }),
      sellerId,
      1,
    );
    const [card] = sellerCards(listings);

    expect(card).toMatchObject({
      id: bundleId,
      itemId: itemIds[0],
      isBundle: false,
      bundleRole: 'bundleOnly',
      priceCents: 220000,
      title: { names: ['Canon EOS R6'], counts: [] },
    });
    expect(sellerCards(listings)).toHaveLength(1);
  });

  it('keeps the bundle out of the feed when an item of it is sold separately only', async () => {
    const { listings } = await listingService.getPublishedPage(
      parseBrowseFilters({ category: 'lens' }),
      sellerId,
      1,
    );
    const cards = sellerCards(listings).filter((card) => card.id === bundleId);

    expect(cards.every((card) => !card.isBundle)).toBe(true);
    expect(cards.map((card) => card.bundleRole).sort()).toEqual(['alsoInBundle', 'bundleOnly']);
  });

  it('gives every item its own photos and description', async () => {
    const detail = await listingService.get(bundleId, null);

    expect(detail?.items.map((item) => item.photos.length)).toEqual([1, 1, 1]);
    expect(detail?.isBundle).toBe(true);
  });

  it('marking one item sold reprices the bundle and hides the item page', async () => {
    await listingService.markItemSold(itemIds[1], sellerId);

    const detail = await listingService.get(bundleId, null);

    expect(detail).toMatchObject({ status: 'active', priceCents: 220000, isBundle: true });
    expect(detail?.items.map((item) => item.isSold)).toEqual([false, true, false]);
    expect(await listingService.getByItemId(itemIds[1], null)).toBeNull();
    expect(await listingService.getByItemId(itemIds[1], sellerId)).not.toBeNull();

    const editable = await listingService.getForEdit(bundleId, sellerId);

    expect(editable.items.map((item) => item.id)).toEqual([itemIds[0], itemIds[2]]);
  });

  it('marking the second to last item sold turns the ad into a single item', async () => {
    await listingService.markItemSold(itemIds[2], sellerId);

    const detail = await listingService.get(bundleId, null);

    expect(detail).toMatchObject({ status: 'active', priceCents: 140000, isBundle: false });

    const { listings } = await listingService.getPublishedPage(parseBrowseFilters({}), sellerId, 1);
    const cards = sellerCards(listings).filter((card) => card.id === bundleId);

    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({ isBundle: false, bundleRole: 'none', itemId: itemIds[0] });
  });

  it('marking the last item sold marks the ad sold', async () => {
    await listingService.markItemSold(itemIds[0], sellerId);

    expect(await listingService.get(bundleId, null)).toBeNull();
    expect(await listingService.get(bundleId, sellerId)).toMatchObject({ status: 'sold' });
  });

  it('putting items back on sale revives the ad and reprices it', async () => {
    await listingService.unmarkItemSold(itemIds[0], sellerId);

    expect(await listingService.get(bundleId, null)).toMatchObject({
      status: 'active',
      priceCents: 140000,
      isBundle: false,
    });

    await listingService.unmarkItemSold(itemIds[2], sellerId);

    const detail = await listingService.get(bundleId, null);

    expect(detail).toMatchObject({ priceCents: 220000, isBundle: true });
    expect(detail?.items.map((item) => item.isSold)).toEqual([false, true, false]);
    expect(await listingService.getByItemId(itemIds[2], null)).not.toBeNull();
  });
});

describe('listingService.getSimilarToModel', () => {
  const cases: SimilarCase[] = [
    ['sony-a7r-iii', 'sameMount', 'Sony E', ['Sony a7 III']],
    ['sony-rx100-vii', 'sameBrand', 'Sony', ['Sony a7 III']],
    ['sony-fe-55mm-f-1-8-za-sony-e', 'similarLenses', 'Sony E', ['Sony FE 50mm f/1.8']],
    ['sony-fe-85mm-f-1-8-sony-e', 'sameMount', 'Sony E', ['Sony FE 50mm f/1.8']],
    ['canon-eos-r5', 'newest', null, ['Nikon D850', 'Sony FE 50mm f/1.8', 'Sony a7 III']],
  ];

  for (const [slug, basis, basisName, listed] of cases) {
    it(`${slug} → ${basis}`, async () => {
      const similar = await listingService.getSimilarToModel(await requireModel(slug), null);

      expect(similar).toMatchObject({ basis, basisName });
      expect(similar?.listings.flatMap((listing) => listing.title.names).sort()).toEqual(listed);
    });
  }
});

describe('listingService.getSitemapListings', () => {
  it('lists active ads with their item ids and drops hidden ones', async () => {
    const [hidden, ...visible] = await listingService.getSellerListings(sellerId);

    await listingService.hide(hidden.id, sellerId);

    const sellerEntries = (await listingService.getSitemapListings()).filter(
      (entry) => entry.sellerId === sellerId,
    );

    expect(sellerEntries.map((entry) => entry.id).sort()).toEqual(
      visible.map((listing) => listing.id).sort(),
    );
    expect(sellerEntries.every((entry) => entry.itemIds.length === 1 && !entry.isBundle)).toBe(
      true,
    );

    await listingService.restore(hidden.id, sellerId);
  });
});

describe('modelCatalogService.searchBrandAndModel with ads', () => {
  it('lists a model with ads first, with its count and lowest price', async () => {
    const { models } = await modelCatalogService.searchBrandAndModel('sony a7');

    expect(models[0]).toMatchObject({
      displayName: 'Sony a7 III',
      adCount: 1,
      minPriceCents: 120000,
    });
    expect(models.slice(1).every((model) => model.adCount === 0)).toBe(true);
  });
});

describe('modelCatalogService.getModelWithOffers', () => {
  it('counts active ads and their price range', async () => {
    const model = await modelCatalogService.getModelWithOffers('sony-a7-iii');

    expect(model?.offers).toEqual({ adCount: 1, minPriceCents: 120000, maxPriceCents: 120000 });
  });

  it('gives a model without ads no offers', async () => {
    const model = await modelCatalogService.getModelWithOffers('sony-a7r-iii');

    expect(model?.offers).toEqual({ adCount: 0, minPriceCents: null, maxPriceCents: null });
  });

  it('is null for an unknown slug', async () => {
    expect(await modelCatalogService.getModelWithOffers('no-such-model')).toBeNull();
  });
});

describe('modelCatalogService.getModelsWithActiveAds', () => {
  it('lists only models with an active ad and drops one once its ad is hidden', async () => {
    const slugs = async () =>
      (await modelCatalogService.getModelsWithActiveAds()).map((model) => model.slug).sort();
    const [hidden] = await listingService.getSellerListings(sellerId);
    const hiddenSlug = (await listingService.getForEdit(hidden.id, sellerId)).items[0].model?.slug;

    expect(await slugs()).toEqual(ADS.map(([slug]) => slug).sort());

    await listingService.hide(hidden.id, sellerId);

    try {
      expect(await slugs()).not.toContain(hiddenSlug);
    } finally {
      await listingService.restore(hidden.id, sellerId);
    }
  });
});
