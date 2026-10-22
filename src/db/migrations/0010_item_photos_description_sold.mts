import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    alter table listing_item
      add column description text,
      add column sold_at timestamptz
  `.execute(db);

  await sql`
    update listing_item item
    set description = listing.description
    from listing
    where listing.id = item.listing_id
      and listing.description is not null
      and item.position = 0
  `.execute(db);

  await sql`update listing set description = null where description is not null`.execute(db);

  await sql`
    alter table listing_photo
      add column listing_item_id uuid references listing_item(id) on delete cascade
  `.execute(db);

  await sql`
    update listing_photo photo
    set listing_item_id = (
      select item.id
      from listing_item item
      where item.listing_id = photo.listing_id
      order by item.position
      limit 1
    )
  `.execute(db);

  await sql`delete from listing_photo where listing_item_id is null`.execute(db);

  await sql`
    alter table listing_photo
      alter column listing_item_id set not null,
      drop constraint listing_photo_listing_id_position_key,
      drop column listing_id,
      add constraint listing_photo_listing_item_id_position_key unique (listing_item_id, position)
  `.execute(db);
}
