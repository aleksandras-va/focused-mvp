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
  photoKeys: string[];
}

export type CardKind = 'item' | 'bundle';

export type ListingCardRow = Awaited<ReturnType<ReturnType<typeof cardQuery>['execute']>>[number];

export type ListingDetailRow = NonNullable<Awaited<ReturnType<typeof listingRepository.findById>>>;

export type ListingDetailItemRow = ListingDetailRow['items'][number];

export type SitemapListingRow = Awaited<
  ReturnType<typeof listingRepository.listPublishedForSitemap>
>[number];

const SIMILARITY_STEPS = ['focalLength', 'mount', 'brand', 'newest'] as const;
const FOCAL_LENGTH_TOLERANCE = 1.25;

export type SimilarityStep = (typeof SIMILARITY_STEPS)[number];

type CardMode = 'feed' | 'items' | 'listings';

const UNSOLD_COUNT = sql<number>`(
  select count(*)::int
  from listing_item unsold
  where unsold.listing_id = listing.id and unsold.sold_at is null
)`;

export const listingRepository = {
  insert(values: NewListing, items: ListingItemInput[]) {
    return db.transaction().execute(async (trx) => {
      const listing = await trx
        .insertInto('listing')
        .values(values)
        .returning('id')
        .executeTakeFirstOrThrow();

      const itemIds = await saveItems(trx, listing.id, items);

      return { id: listing.id, itemIds };
    });
  },

  update(id: string, values: ListingUpdate, items: ListingItemInput[]) {
    return db.transaction().execute(async (trx) => {
      await trx
        .updateTable('listing')
        .set({ ...values, updated_at: sql<Date>`now()` })
        .where('id', '=', id)
        .execute();

      const previousKeys = await unsoldPhotoKeys(trx, id);
      const itemIds = await saveItems(trx, id, items);
      const keptKeys = new Set(items.flatMap(({ photoKeys }) => photoKeys));
      const removedPhotoKeys = previousKeys.filter((key) => !keptKeys.has(key));

      return { id, itemIds, removedPhotoKeys };
    });
  },

  updateStatus(id: string, values: ListingUpdate) {
    return db
      .updateTable('listing')
      .set({ ...values, updated_at: sql<Date>`now()` })
      .where('id', '=', id)
      .execute();
  },

  setItemSold(itemId: string, sold: boolean, listingValues: ListingUpdate) {
    return db.transaction().execute(async (trx) => {
      const item = await trx
        .updateTable('listing_item')
        .set({ sold_at: sold ? sql<Date>`now()` : null, updated_at: sql<Date>`now()` })
        .where('id', '=', itemId)
        .where('sold_at', sold ? 'is' : 'is not', null)
        .returning('listing_id')
        .executeTakeFirstOrThrow();

      await trx
        .updateTable('listing')
        .set({ ...listingValues, updated_at: sql<Date>`now()` })
        .where('id', '=', item.listing_id)
        .execute();
    });
  },

  deleteById(id: string) {
    return db.transaction().execute(async (trx) => {
      const photos = await trx
        .selectFrom('listing_photo')
        .innerJoin('listing_item', 'listing_item.id', 'listing_photo.listing_item_id')
        .select('listing_photo.storage_key')
        .where('listing_item.listing_id', '=', id)
        .execute();
      await trx.deleteFrom('listing').where('id', '=', id).execute();

      return photos.map((photo) => photo.storage_key);
    });
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
    let query = cardQuery(hasItemFilters(filters) ? 'items' : 'feed', filters).where(
      'card.status',
      '=',
      'active',
    );

    if (filters.city) query = query.where('card.city_slug', '=', filters.city);

    if (filters.minPriceCents !== null) {
      query = query.where('card.price_cents', '>=', filters.minPriceCents);
    }

    if (filters.maxPriceCents !== null) {
      query = query.where('card.price_cents', '<=', filters.maxPriceCents);
    }

    switch (filters.sort) {
      case 'price_asc':
        query = query.orderBy('card.price_cents', 'asc');
        break;
      case 'price_desc':
        query = query.orderBy('card.price_cents', 'desc');
        break;
      default:
        query = query.orderBy('card.published_at', 'desc');
    }

    return query.orderBy('card.kind').orderBy('card.item_position').limit(limit).execute();
  },

  async listSimilarToModel(modelId: string, limit: number) {
    const rows = await cardQuery('listings')
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
            .where('listing_item.sold_at', 'is', null)
            .groupBy('listing_item.listing_id')
            .as('similarity'),
        (join) => join.onRef('similarity.listing_id', '=', 'card.listing_id'),
      )
      .select('similarity.step')
      .where('card.status', '=', 'active')
      .orderBy('similarity.step')
      .orderBy('similarity.year_distance')
      .orderBy('card.published_at', 'desc')
      .limit(limit)
      .execute();

    if (rows.length === 0) return null;

    const [{ step }] = rows;

    return { step: SIMILARITY_STEPS[step], rows: rows.filter((row) => row.step === step) };
  },

  listPublishedForSitemap() {
    return db
      .selectFrom('listing')
      .select((eb) => [
        'listing.id',
        'listing.seller_id',
        'listing.updated_at',
        jsonArrayFrom(
          eb
            .selectFrom('listing_item')
            .select('listing_item.id')
            .whereRef('listing_item.listing_id', '=', 'listing.id')
            .where('listing_item.sold_at', 'is', null)
            .orderBy('listing_item.position'),
        ).as('items'),
      ])
      .where('listing.status', '=', 'active')
      .orderBy('listing.published_at', 'desc')
      .execute();
  },

  listPublishedBySeller(sellerId: string) {
    return cardQuery('listings')
      .where('card.seller_id', '=', sellerId)
      .where('card.status', '=', 'active')
      .orderBy('card.published_at', 'desc')
      .execute();
  },

  listBySeller(sellerId: string) {
    return cardQuery('listings')
      .where('card.seller_id', '=', sellerId)
      .orderBy('card.created_at', 'desc')
      .execute();
  },
} as const;

function hasItemFilters(filters: BrowseFilters) {
  return Boolean(
    filters.category ||
      filters.brand ||
      filters.mount ||
      filters.model ||
      filters.cosmeticCondition,
  );
}

async function unsoldPhotoKeys(trx: Transaction<DB>, listingId: string) {
  const photos = await trx
    .selectFrom('listing_photo')
    .innerJoin('listing_item', 'listing_item.id', 'listing_photo.listing_item_id')
    .select('listing_photo.storage_key')
    .where('listing_item.listing_id', '=', listingId)
    .where('listing_item.sold_at', 'is', null)
    .execute();

  return photos.map((photo) => photo.storage_key);
}

async function saveItems(trx: Transaction<DB>, listingId: string, items: ListingItemInput[]) {
  let removed = trx
    .deleteFrom('listing_item')
    .where('listing_id', '=', listingId)
    .where('sold_at', 'is', null);

  if (items.length > 0) {
    removed = removed.where(
      'id',
      'not in',
      items.map(({ item }) => item.id),
    );
  }

  await removed.execute();

  const itemIds: string[] = [];

  for (const { item, inclusions, photoKeys } of items) {
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
            description: eb.ref('excluded.description'),
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

    await trx.deleteFrom('listing_photo').where('listing_item_id', '=', saved.id).execute();

    if (photoKeys.length > 0) {
      await trx
        .insertInto('listing_photo')
        .values(
          photoKeys.map((storageKey, position) => ({
            listing_item_id: saved.id,
            storage_key: storageKey,
            position,
          })),
        )
        .execute();
    }
  }

  await sql`
    with ranked as (
      select id, row_number() over (order by position) - 1 as offset_position
      from listing_item
      where listing_id = ${listingId} and sold_at is not null
    )
    update listing_item
    set position = ${items.length} + ranked.offset_position
    from ranked
    where listing_item.id = ranked.id
  `.execute(trx);

  return itemIds;
}

function cardItems() {
  return db
    .selectFrom('listing_item as card_item')
    .leftJoin('model', 'model.id', 'card_item.model_id')
    .leftJoin('brand', 'brand.id', 'model.brand_id')
    .leftJoin('mount', 'mount.id', 'model.mount_id')
    .select([
      'card_item.id',
      'card_item.price_cents',
      'card_item.cosmetic_condition',
      'card_item.shutter_count',
      'card_item.sold_at',
      'model.display_name as model_name',
      'card_item.custom_name',
      'brand.name as brand_name',
      'mount.name as mount_name',
    ])
    .select((item) =>
      item.fn.coalesce('model.category', 'card_item.custom_category').as('category'),
    )
    .orderBy(sql`card_item.sold_at is not null`)
    .orderBy('card_item.position');
}

function itemCardQuery() {
  return db
    .selectFrom('listing_item as item')
    .innerJoin('listing', 'listing.id', 'item.listing_id')
    .leftJoin('city', 'city.id', 'listing.city_id')
    .leftJoin('model', 'model.id', 'item.model_id')
    .leftJoin('brand', 'brand.id', 'model.brand_id')
    .leftJoin('mount', 'mount.id', 'model.mount_id')
    .select([
      sql<CardKind>`'item'`.as('kind'),
      'listing.id as listing_id',
      sql<string | null>`item.id`.as('item_id'),
      sql<number>`item.position`.as('item_position'),
      'listing.seller_id',
      'listing.status',
      'listing.published_at',
      'listing.created_at',
      'city.name as city_name',
      'city.slug as city_slug',
      sql<boolean>`item.sold_separately`.as('sold_separately'),
      UNSOLD_COUNT.as('unsold_count'),
      sql<number | null>`case
        when item.sold_separately or ${UNSOLD_COUNT} = 1 then item.price_cents
        else listing.price_cents
      end`.as('price_cents'),
      sql<string | null>`(
        select photo.storage_key
        from listing_photo photo
        where photo.listing_item_id = item.id
        order by photo.position
        limit 1
      )`.as('cover_key'),
      jsonArrayFrom(
        cardItems().where('card_item.listing_id', '=', sql.ref<string>('item.listing_id')),
      ).as('items'),
    ])
    .where('item.sold_at', 'is', null);
}

function bundleCardQuery() {
  return db
    .selectFrom('listing')
    .leftJoin('city', 'city.id', 'listing.city_id')
    .select([
      sql<CardKind>`'bundle'`.as('kind'),
      'listing.id as listing_id',
      sql<string | null>`null::uuid`.as('item_id'),
      sql<number>`-1`.as('item_position'),
      'listing.seller_id',
      'listing.status',
      'listing.published_at',
      'listing.created_at',
      'city.name as city_name',
      'city.slug as city_slug',
      sql<boolean>`false`.as('sold_separately'),
      UNSOLD_COUNT.as('unsold_count'),
      sql<number | null>`listing.price_cents`.as('price_cents'),
      sql<string | null>`(
        select photo.storage_key
        from listing_photo photo
        join listing_item cover_item on cover_item.id = photo.listing_item_id
        where cover_item.listing_id = listing.id and cover_item.sold_at is null
        order by cover_item.position, photo.position
        limit 1
      )`.as('cover_key'),
      jsonArrayFrom(
        cardItems().where('card_item.listing_id', '=', sql.ref<string>('listing.id')),
      ).as('items'),
    ]);
}

function cardQuery(mode: CardMode, filters: BrowseFilters | null = null) {
  let items = itemCardQuery();

  if (mode === 'items' && filters) {
    if (filters.category) {
      const { category } = filters;

      items = items.where((eb) =>
        eb(eb.fn.coalesce('model.category', 'item.custom_category'), '=', category),
      );
    }
    if (filters.brand) items = items.where('brand.slug', '=', filters.brand);
    if (filters.mount) items = items.where('mount.slug', '=', filters.mount);
    if (filters.model) items = items.where('model.slug', '=', filters.model);
    if (filters.cosmeticCondition) {
      items = items.where('item.cosmetic_condition', '=', filters.cosmeticCondition);
    }
  }

  const cards = mode === 'items' ? items : items.unionAll(bundleCardQuery());

  return db
    .selectFrom(cards.as('card'))
    .selectAll('card')
    .where((eb) => {
      const isBundle = eb('card.kind', '=', 'bundle');
      const isItem = eb('card.kind', '=', 'item');
      const isSingle = eb('card.unsold_count', '=', 1);
      const bundleCard = eb.and([isBundle, eb('card.unsold_count', '<>', 1)]);

      switch (mode) {
        case 'items':
          return isItem;
        case 'feed':
          return eb.or([
            bundleCard,
            eb.and([isItem, eb.or([isSingle, eb('card.sold_separately', '=', true)])]),
          ]);
        default:
          return eb.or([bundleCard, eb.and([isItem, isSingle])]);
      }
    });
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
            'listing_item.description',
            'listing_item.sold_at',
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
          .select((itemEb) => [
            jsonArrayFrom(
              itemEb
                .selectFrom('listing_inclusion')
                .whereRef('listing_inclusion.listing_item_id', '=', 'listing_item.id')
                .select('listing_inclusion.inclusion'),
            ).as('inclusions'),
            jsonArrayFrom(
              itemEb
                .selectFrom('listing_photo')
                .select(['listing_photo.storage_key', 'listing_photo.position'])
                .whereRef('listing_photo.listing_item_id', '=', 'listing_item.id')
                .orderBy('listing_photo.position'),
            ).as('photos'),
          ])
          .whereRef('listing_item.listing_id', '=', 'listing.id')
          .orderBy('listing_item.position'),
      ).as('items'),
    );
}
