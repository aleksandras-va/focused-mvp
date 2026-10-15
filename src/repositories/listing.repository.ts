import 'server-only';
import { sql, type Transaction } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { db } from '@/db';
import type { Inclusion, ListingUpdate, NewListing, NewListingItem } from '@/db/tables';
import type { DB } from '@/db/types';
import type { BrowseFilters } from '@/lib/browse-filters';

export interface ListingItemInput {
  item: Omit<NewListingItem, 'listing_id'> & { id: string };
  inclusions: Inclusion[];
}

export type ListingCardRow = Awaited<
  ReturnType<ReturnType<typeof listingCardQuery>['execute']>
>[number];

export type ListingDetailRow = NonNullable<Awaited<ReturnType<typeof listingRepository.findById>>>;

export type ListingDetailItemRow = ListingDetailRow['items'][number];

const SIMILARITY_STEPS = ['focalLength', 'mount', 'brand', 'newest'] as const;
const FOCAL_LENGTH_TOLERANCE = 1.25;

export type SimilarityStep = (typeof SIMILARITY_STEPS)[number];

export const listingRepository = {
  insert(values: NewListing, items: ListingItemInput[], photoKeys: string[]) {
    return db.transaction().execute(async (trx) => {
      const listing = await trx
        .insertInto('listing')
        .values(values)
        .returning('id')
        .executeTakeFirstOrThrow();

      await insertPhotos(trx, listing.id, photoKeys);

      const itemIds = await saveItems(trx, listing.id, items);

      return { id: listing.id, itemIds };
    });
  },

  update(id: string, values: ListingUpdate, items: ListingItemInput[], photoKeys: string[]) {
    return db.transaction().execute(async (trx) => {
      await trx
        .updateTable('listing')
        .set({ ...values, updated_at: sql<Date>`now()` })
        .where('id', '=', id)
        .execute();
      await trx.deleteFrom('listing_photo').where('listing_id', '=', id).execute();
      await insertPhotos(trx, id, photoKeys);

      const itemIds = await saveItems(trx, id, items);

      return { id, itemIds };
    });
  },

  updateStatus(id: string, values: ListingUpdate) {
    return db
      .updateTable('listing')
      .set({ ...values, updated_at: sql<Date>`now()` })
      .where('id', '=', id)
      .execute();
  },

  deleteById(id: string) {
    return db.deleteFrom('listing').where('id', '=', id).execute();
  },

  findSeller(id: string) {
    return db
      .selectFrom('listing')
      .select(['listing.id', 'listing.seller_id', 'listing.status', 'listing.published_at'])
      .where('listing.id', '=', id)
      .executeTakeFirst();
  },

  findById(id: string) {
    return listingDetailQuery().where('listing.id', '=', id).executeTakeFirst();
  },

  findByItemId(itemId: string) {
    return listingDetailQuery()
      .where((eb) =>
        eb(
          'listing.id',
          '=',
          eb
            .selectFrom('listing_item')
            .select('listing_item.listing_id')
            .where('listing_item.id', '=', itemId),
        ),
      )
      .executeTakeFirst();
  },

  listPublished(filters: BrowseFilters, limit = 48) {
    let query = listingCardQuery().where('listing.status', '=', 'active');

    const filtersItems =
      filters.category ||
      filters.brand ||
      filters.mount ||
      filters.model ||
      filters.cosmeticCondition;

    if (filtersItems) {
      query = query.where(({ exists, selectFrom }) => {
        let items = selectFrom('listing_item')
          .leftJoin('model', 'model.id', 'listing_item.model_id')
          .leftJoin('brand', 'brand.id', 'model.brand_id')
          .leftJoin('mount', 'mount.id', 'model.mount_id')
          .select('listing_item.id')
          .whereRef('listing_item.listing_id', '=', 'listing.id');

        if (filters.category) {
          const { category } = filters;

          items = items.where((eb) =>
            eb(eb.fn.coalesce('model.category', 'listing_item.custom_category'), '=', category),
          );
        }
        if (filters.brand) items = items.where('brand.slug', '=', filters.brand);
        if (filters.mount) items = items.where('mount.slug', '=', filters.mount);
        if (filters.model) items = items.where('model.slug', '=', filters.model);
        if (filters.cosmeticCondition) {
          items = items.where('listing_item.cosmetic_condition', '=', filters.cosmeticCondition);
        }

        return exists(items);
      });
    }

    if (filters.city) query = query.where('city.slug', '=', filters.city);

    if (filters.minPriceCents !== null) {
      query = query.where('listing.price_cents', '>=', filters.minPriceCents);
    }

    if (filters.maxPriceCents !== null) {
      query = query.where('listing.price_cents', '<=', filters.maxPriceCents);
    }

    switch (filters.sort) {
      case 'price_asc':
        query = query.orderBy('listing.price_cents', 'asc');
        break;
      case 'price_desc':
        query = query.orderBy('listing.price_cents', 'desc');
        break;
      default:
        query = query.orderBy('listing.published_at', 'desc');
    }

    return query.limit(limit).execute();
  },

  async listSimilarToModel(modelId: string, limit: number) {
    const rows = await listingCardQuery()
      .innerJoin(
        (eb) =>
          eb
            .selectFrom('listing_item')
            .innerJoin('model as target', (join) => join.on('target.id', '=', modelId))
            .leftJoin('model as candidate', 'candidate.id', 'listing_item.model_id')
            .leftJoin('lens_spec as target_lens', 'target_lens.model_id', 'target.id')
            .leftJoin('lens_spec as candidate_lens', 'candidate_lens.model_id', 'candidate.id')
            .select('listing_item.listing_id')
            .select(
              sql<number>`min(case
                when candidate.category = target.category
                  and candidate.mount_id = target.mount_id
                  and candidate_lens.focal_min_mm <= target_lens.focal_max_mm * ${FOCAL_LENGTH_TOLERANCE}::numeric
                  and candidate_lens.focal_max_mm * ${FOCAL_LENGTH_TOLERANCE}::numeric >= target_lens.focal_min_mm
                  then 0
                when candidate.category = target.category
                  and candidate.mount_id = target.mount_id then 1
                when candidate.category = target.category
                  and candidate.brand_id = target.brand_id then 2
                else 3
              end)`.as('step'),
            )
            .select(
              sql<number | null>`min(abs(candidate.release_year - target.release_year))`.as(
                'year_distance',
              ),
            )
            .groupBy('listing_item.listing_id')
            .as('similarity'),
        (join) => join.onRef('similarity.listing_id', '=', 'listing.id'),
      )
      .select('similarity.step')
      .where('listing.status', '=', 'active')
      .orderBy('similarity.step')
      .orderBy('similarity.year_distance')
      .orderBy('listing.published_at', 'desc')
      .limit(limit)
      .execute();

    if (rows.length === 0) return null;

    const [{ step }] = rows;

    return { step: SIMILARITY_STEPS[step], rows: rows.filter((row) => row.step === step) };
  },

  listPublishedBySeller(sellerId: string) {
    return listingCardQuery()
      .where('listing.seller_id', '=', sellerId)
      .where('listing.status', '=', 'active')
      .orderBy('listing.published_at', 'desc')
      .execute();
  },

  listBySeller(sellerId: string) {
    return listingCardQuery()
      .where('listing.seller_id', '=', sellerId)
      .orderBy('listing.created_at', 'desc')
      .execute();
  },
} as const;

async function insertPhotos(trx: Transaction<DB>, listingId: string, photoKeys: string[]) {
  if (photoKeys.length === 0) return;

  await trx
    .insertInto('listing_photo')
    .values(
      photoKeys.map((storageKey, position) => ({
        listing_id: listingId,
        storage_key: storageKey,
        position,
      })),
    )
    .execute();
}

async function saveItems(trx: Transaction<DB>, listingId: string, items: ListingItemInput[]) {
  let removed = trx.deleteFrom('listing_item').where('listing_id', '=', listingId);

  if (items.length > 0) {
    removed = removed.where(
      'id',
      'not in',
      items.map(({ item }) => item.id),
    );
  }

  await removed.execute();

  const itemIds: string[] = [];

  for (const { item, inclusions } of items) {
    const saved = await trx
      .insertInto('listing_item')
      .values({ ...item, listing_id: listingId })
      .onConflict((oc) =>
        oc
          .column('id')
          .doUpdateSet((eb) => ({
            model_id: eb.ref('excluded.model_id'),
            custom_name: eb.ref('excluded.custom_name'),
            custom_category: eb.ref('excluded.custom_category'),
            price_cents: eb.ref('excluded.price_cents'),
            cosmetic_condition: eb.ref('excluded.cosmetic_condition'),
            functional_condition: eb.ref('excluded.functional_condition'),
            shutter_count: eb.ref('excluded.shutter_count'),
            sold_separately: eb.ref('excluded.sold_separately'),
            position: eb.ref('excluded.position'),
            updated_at: sql<Date>`now()`,
          }))
          .where('listing_item.listing_id', '=', listingId),
      )
      .returning('id')
      .executeTakeFirst();

    if (!saved) throw new Error(`Listing item ${item.id} belongs to another listing.`);

    itemIds.push(saved.id);

    await trx.deleteFrom('listing_inclusion').where('listing_item_id', '=', saved.id).execute();

    if (inclusions.length > 0) {
      await trx
        .insertInto('listing_inclusion')
        .values(inclusions.map((inclusion) => ({ listing_item_id: saved.id, inclusion })))
        .execute();
    }
  }

  return itemIds;
}

function listingCardQuery() {
  return db
    .selectFrom('listing')
    .leftJoin('city', 'city.id', 'listing.city_id')
    .select([
      'listing.id',
      'listing.seller_id',
      'listing.price_cents',
      'city.name as city_name',
      'listing.status',
      'listing.published_at',
    ])
    .select((eb) =>
      eb
        .selectFrom('listing_photo')
        .select('listing_photo.storage_key')
        .whereRef('listing_photo.listing_id', '=', 'listing.id')
        .orderBy('listing_photo.position')
        .limit(1)
        .as('cover_key'),
    )
    .select((eb) =>
      jsonArrayFrom(
        eb
          .selectFrom('listing_item')
          .leftJoin('model', 'model.id', 'listing_item.model_id')
          .leftJoin('brand', 'brand.id', 'model.brand_id')
          .leftJoin('mount', 'mount.id', 'model.mount_id')
          .select([
            'listing_item.id',
            'listing_item.cosmetic_condition',
            'listing_item.shutter_count',
            'model.display_name as model_name',
            'listing_item.custom_name',
            'brand.name as brand_name',
            'mount.name as mount_name',
          ])
          .select((item) =>
            item.fn.coalesce('model.category', 'listing_item.custom_category').as('category'),
          )
          .whereRef('listing_item.listing_id', '=', 'listing.id')
          .orderBy('listing_item.position'),
      ).as('items'),
    );
}

function listingDetailQuery() {
  return db
    .selectFrom('listing')
    .innerJoin('user', 'user.id', 'listing.seller_id')
    .leftJoin('city', 'city.id', 'listing.city_id')
    .leftJoin('store', 'store.user_id', 'user.id')
    .select([
      'listing.id',
      'listing.seller_id',
      'listing.description',
      'listing.price_cents',
      'listing.city_id',
      'city.name as city_name',
      'listing.status',
      'listing.published_at',
      'listing.contact_email',
      'listing.contact_phone',
      'user.display_name as seller_name',
      'store.name as store_name',
      'store.slug as store_slug',
    ])
    .select((eb) =>
      jsonArrayFrom(
        eb
          .selectFrom('listing_item')
          .leftJoin('model', 'model.id', 'listing_item.model_id')
          .leftJoin('brand', 'brand.id', 'model.brand_id')
          .leftJoin('mount', 'mount.id', 'model.mount_id')
          .leftJoin('camera_spec', 'camera_spec.model_id', 'listing_item.model_id')
          .select([
            'listing_item.id',
            'listing_item.price_cents',
            'listing_item.cosmetic_condition',
            'listing_item.functional_condition',
            'listing_item.shutter_count',
            'listing_item.sold_separately',
            'listing_item.position',
            'listing_item.model_id',
            'model.slug as model_slug',
            'model.category',
            'model.display_name as model_name',
            'listing_item.custom_name',
            'listing_item.custom_category',
            'brand.name as brand_name',
            'brand.slug as brand_slug',
            'mount.name as mount_name',
            'camera_spec.is_film',
          ])
          .select((itemEb) =>
            jsonArrayFrom(
              itemEb
                .selectFrom('listing_inclusion')
                .whereRef('listing_inclusion.listing_item_id', '=', 'listing_item.id')
                .select('listing_inclusion.inclusion'),
            ).as('inclusions'),
          )
          .whereRef('listing_item.listing_id', '=', 'listing.id')
          .orderBy('listing_item.position'),
      ).as('items'),
    )
    .select((eb) =>
      jsonArrayFrom(
        eb
          .selectFrom('listing_photo')
          .select(['listing_photo.storage_key', 'listing_photo.position'])
          .whereRef('listing_photo.listing_id', '=', 'listing.id')
          .orderBy('listing_photo.position'),
      ).as('photos'),
    );
}
