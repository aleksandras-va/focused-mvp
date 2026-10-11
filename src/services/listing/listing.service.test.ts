import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { userRepository } from '@/repositories/user.repository';
import { cityService } from '../city/city.service';
import { modelCatalogService } from '../model-catalog/model-catalog.service';
import { listingService } from './listing.service';

const SELLER_EMAIL = 'listing-service-test@example.com';

const ADS: [slug: string, price: string][] = [
  ['sony-a7-iii', '1200'],
  ['nikon-d850', '1500'],
  ['sony-fe-50mm-f-1-8-sony-e', '150'],
];

type SimilarCase = [slug: string, title: string, listed: string[]];

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
  const [city] = await cityService.getAll();

  sellerId = seller.id;
  await removeSellerListings();

  for (const [slug, price] of ADS) {
    const model = await requireModel(slug);

    await listingService.save(null, sellerId, {
      items: [
        {
          id: randomUUID(),
          modelId: model.id,
          custom: null,
          price,
          cosmeticCondition: 'good',
          functionalCondition: 'fully_working',
          shutterCount: null,
          soldSeparately: true,
          inclusions: [],
        },
      ],
      bundlePrice: null,
      photoKeys: [],
      cityId: city.id,
      description: null,
      contactEmail: null,
      contactPhone: null,
      publish: true,
    });
  }
});

afterAll(removeSellerListings);

describe('listingService.getSimilarToModel', () => {
  const cases: SimilarCase[] = [
    ['sony-a7r-iii', 'Other Sony E cameras', ['Sony A7 III']],
    ['sony-rx100-vii', 'Other Sony cameras', ['Sony A7 III']],
    ['sony-fe-55mm-f-1-8-za-sony-e', 'Similar Sony E lenses', ['Sony FE 50mm f/1.8']],
    ['sony-fe-85mm-f-1-8-sony-e', 'Other Sony E lenses', ['Sony FE 50mm f/1.8']],
    ['canon-eos-r5', 'Newest ads', ['Nikon D850', 'Sony A7 III', 'Sony FE 50mm f/1.8']],
  ];

  for (const [slug, title, listed] of cases) {
    it(`${slug} → ${title}`, async () => {
      const similar = await listingService.getSimilarToModel(await requireModel(slug), null);

      expect(similar?.title).toBe(title);
      expect(similar?.listings.map((listing) => listing.title).sort()).toEqual(listed);
    });
  }
});

describe('modelCatalogService.searchBrandAndModel with ads', () => {
  it('lists a model with ads first, with its count and lowest price', async () => {
    const { models } = await modelCatalogService.searchBrandAndModel('sony a7');

    expect(models[0]).toMatchObject({
      displayName: 'Sony A7 III',
      adCount: 1,
      minPriceCents: 120000,
    });
    expect(models.slice(1).every((model) => model.adCount === 0)).toBe(true);
  });
});
