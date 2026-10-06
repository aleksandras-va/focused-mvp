import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    alter table listing_item
      drop constraint listing_item_listing_id_position_key,
      add constraint listing_item_listing_id_position_key
        unique (listing_id, position) deferrable initially deferred
  `.execute(db);
}
