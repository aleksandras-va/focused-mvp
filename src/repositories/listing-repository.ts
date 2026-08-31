import 'server-only';
import { sql } from 'kysely';
import { db } from '@/db';
import type { ListingInclusion, NewListing } from '@/db/tables';

function listingQuery() {
  return db
    .selectFrom('listings')
    .innerJoin('models', 'models.id', 'listings.model_id')
    .innerJoin('brands', 'brands.id', 'models.brand_id')
    .leftJoin('mounts', 'mounts.id', 'models.mount_id')
    .innerJoin('users', 'users.id', 'listings.seller_id')
    .select([
      'listings.id',
      'listings.description',
      'listings.price_cents',
      'listings.cosmetic_condition',
      'listings.functional_condition',
      'listings.shutter_count',
      'listings.location',
      'listings.status',
      'listings.published_at',
      'models.slug as model_slug',
      'models.category',
      'models.display_name as model_name',
      'brands.name as brand_name',
      'mounts.name as mount_name',
      'users.display_name as seller_name',
      'users.seller_type',
      'users.store_name',
      'users.store_slug',
    ]);
}

export type ListingRow = Awaited<ReturnType<ReturnType<typeof listingQuery>['execute']>>[number];

export function insertListing(values: NewListing, inclusions: ListingInclusion[]) {
  return db.transaction().execute(async (trx) => {
    const listing = await trx
      .insertInto('listings')
      .values(values)
      .returning('id')
      .executeTakeFirstOrThrow();

    if (inclusions.length > 0) {
      await trx
        .insertInto('listing_inclusions')
        .values(inclusions.map((inclusion) => ({ listing_id: listing.id, inclusion })))
        .execute();
    }

    return listing;
  });
}

export function findListingById(id: string) {
  return listingQuery()
    .select((eb) =>
      eb
        .selectFrom('listing_inclusions')
        .whereRef('listing_inclusions.listing_id', '=', 'listings.id')
        .select(sql<string[]>`coalesce(array_agg(inclusion::text), '{}')`.as('inclusions'))
        .as('inclusions'),
    )
    .where('listings.id', '=', id)
    .executeTakeFirst();
}

export function listPublishedListings(limit = 24) {
  return listingQuery()
    .where('listings.status', '=', 'active')
    .orderBy('listings.published_at', 'desc')
    .limit(limit)
    .execute();
}

export function listListingsBySeller(sellerId: string) {
  return listingQuery()
    .where('listings.seller_id', '=', sellerId)
    .orderBy('listings.created_at', 'desc')
    .execute();
}
