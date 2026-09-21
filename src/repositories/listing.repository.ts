import 'server-only';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { db } from '@/db';
import type { Inclusion, NewListing, NewListingItem } from '@/db/tables';
import type { BrowseFilters } from '@/lib/browse-filters';

export interface ListingItemInput {
  item: Omit<NewListingItem, 'listing_id'>;
  inclusions: Inclusion[];
}

export type ListingCardRow = Awaited<
  ReturnType<ReturnType<typeof listingCardQuery>['execute']>
>[number];

export type ListingDetailRow = NonNullable<Awaited<ReturnType<typeof listingRepository.findById>>>;

export type ListingDetailItemRow = ListingDetailRow['items'][number];

export const listingRepository = {
  insert(values: NewListing, items: ListingItemInput[], photoKeys: string[]) {
    return db.transaction().execute(async (trx) => {
      const listing = await trx
        .insertInto('listing')
        .values(values)
        .returning('id')
        .executeTakeFirstOrThrow();

      if (photoKeys.length > 0) {
        await trx
          .insertInto('listing_photo')
          .values(
            photoKeys.map((storageKey, position) => ({
              listing_id: listing.id,
              storage_key: storageKey,
              position,
            })),
          )
          .execute();
      }

      const itemIds: string[] = [];

      for (const { item, inclusions } of items) {
        const inserted = await trx
          .insertInto('listing_item')
          .values({ ...item, listing_id: listing.id })
          .returning('id')
          .executeTakeFirstOrThrow();

        itemIds.push(inserted.id);

        if (inclusions.length > 0) {
          await trx
            .insertInto('listing_inclusion')
            .values(inclusions.map((inclusion) => ({ listing_item_id: inserted.id, inclusion })))
            .execute();
        }
      }

      return { id: listing.id, itemIds };
    });
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
          .innerJoin('model', 'model.id', 'listing_item.model_id')
          .innerJoin('brand', 'brand.id', 'model.brand_id')
          .leftJoin('mount', 'mount.id', 'model.mount_id')
          .select('listing_item.id')
          .whereRef('listing_item.listing_id', '=', 'listing.id');

        if (filters.category) items = items.where('model.category', '=', filters.category);
        if (filters.brand) items = items.where('brand.slug', '=', filters.brand);
        if (filters.mount) items = items.where('mount.slug', '=', filters.mount);
        if (filters.model) items = items.where('model.slug', '=', filters.model);
        if (filters.cosmeticCondition) {
          items = items.where('listing_item.cosmetic_condition', '=', filters.cosmeticCondition);
        }

        return exists(items);
      });
    }

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

  listBySeller(sellerId: string) {
    return listingCardQuery()
      .where('listing.seller_id', '=', sellerId)
      .orderBy('listing.created_at', 'desc')
      .execute();
  },
} as const;

function listingCardQuery() {
  return db
    .selectFrom('listing')
    .innerJoin('city', 'city.id', 'listing.city_id')
    .select([
      'listing.id',
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
          .innerJoin('model', 'model.id', 'listing_item.model_id')
          .innerJoin('brand', 'brand.id', 'model.brand_id')
          .leftJoin('mount', 'mount.id', 'model.mount_id')
          .select([
            'listing_item.id',
            'listing_item.cosmetic_condition',
            'listing_item.shutter_count',
            'model.display_name as model_name',
            'brand.name as brand_name',
            'mount.name as mount_name',
          ])
          .whereRef('listing_item.listing_id', '=', 'listing.id')
          .orderBy('listing_item.position'),
      ).as('items'),
    );
}

function listingDetailQuery() {
  return db
    .selectFrom('listing')
    .innerJoin('user', 'user.id', 'listing.seller_id')
    .innerJoin('city', 'city.id', 'listing.city_id')
    .leftJoin('store', 'store.user_id', 'user.id')
    .select([
      'listing.id',
      'listing.description',
      'listing.price_cents',
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
          .innerJoin('model', 'model.id', 'listing_item.model_id')
          .innerJoin('brand', 'brand.id', 'model.brand_id')
          .leftJoin('mount', 'mount.id', 'model.mount_id')
          .select([
            'listing_item.id',
            'listing_item.price_cents',
            'listing_item.cosmetic_condition',
            'listing_item.functional_condition',
            'listing_item.shutter_count',
            'listing_item.sold_separately',
            'listing_item.position',
            'model.slug as model_slug',
            'model.category',
            'model.display_name as model_name',
            'brand.name as brand_name',
            'brand.slug as brand_slug',
            'mount.name as mount_name',
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
