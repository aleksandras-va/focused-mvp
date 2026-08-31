import 'server-only';
import { sql } from 'kysely';
import { db } from '@/db';
import type { Inclusion, NewListing } from '@/db/tables';

function listingQuery() {
  return db
    .selectFrom('listing')
    .innerJoin('model', 'model.id', 'listing.model_id')
    .innerJoin('brand', 'brand.id', 'model.brand_id')
    .leftJoin('mount', 'mount.id', 'model.mount_id')
    .innerJoin('user', 'user.id', 'listing.seller_id')
    .select([
      'listing.id',
      'listing.description',
      'listing.price_cents',
      'listing.cosmetic_condition',
      'listing.functional_condition',
      'listing.shutter_count',
      'listing.location',
      'listing.status',
      'listing.published_at',
      'model.slug as model_slug',
      'model.category',
      'model.display_name as model_name',
      'brand.name as brand_name',
      'mount.name as mount_name',
      'user.display_name as seller_name',
      'user.seller_type',
      'user.store_name',
      'user.store_slug',
    ]);
}

export type ListingRow = Awaited<ReturnType<ReturnType<typeof listingQuery>['execute']>>[number];

export function insertListing(values: NewListing, inclusions: Inclusion[]) {
  return db.transaction().execute(async (trx) => {
    const listing = await trx
      .insertInto('listing')
      .values(values)
      .returning('id')
      .executeTakeFirstOrThrow();

    if (inclusions.length > 0) {
      await trx
        .insertInto('listing_inclusion')
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
        .selectFrom('listing_inclusion')
        .whereRef('listing_inclusion.listing_id', '=', 'listing.id')
        .select(sql<string[]>`coalesce(array_agg(inclusion::text), '{}')`.as('inclusions'))
        .as('inclusions'),
    )
    .where('listing.id', '=', id)
    .executeTakeFirst();
}

export function listPublishedListings(limit = 24) {
  return listingQuery()
    .where('listing.status', '=', 'active')
    .orderBy('listing.published_at', 'desc')
    .limit(limit)
    .execute();
}

export function listListingsBySeller(sellerId: string) {
  return listingQuery()
    .where('listing.seller_id', '=', sellerId)
    .orderBy('listing.created_at', 'desc')
    .execute();
}
