import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    create temporary table aperture_rename as
    with cleaned as (
      select
        model.id,
        model.category,
        brand.slug as brand_slug,
        mount.slug as mount_slug,
        regexp_replace(
          regexp_replace(model.name, '(f/[0-9]+(\\.[0-9]*[1-9])?-[0-9]+)\\.0(?![0-9])', '\\1', 'g'),
          'f/([0-9]+)\\.0(?![0-9])', 'f/\\1', 'g'
        ) as name,
        regexp_replace(
          regexp_replace(model.display_name, '(f/[0-9]+(\\.[0-9]*[1-9])?-[0-9]+)\\.0(?![0-9])', '\\1', 'g'),
          'f/([0-9]+)\\.0(?![0-9])', 'f/\\1', 'g'
        ) as display_name
      from model
      join brand on brand.id = model.brand_id
      left join mount on mount.id = model.mount_id
      where model.name ~ 'f/[0-9.-]*[0-9]\\.0(?![0-9])'
    )
    select
      id,
      name,
      display_name,
      trim(both '-' from regexp_replace(
        lower(brand_slug || ' ' || name || case
          when category = 'lens' and mount_slug is not null then ' ' || mount_slug
          else ''
        end),
        '[^a-z0-9]+', '-', 'g'
      )) as slug
    from cleaned
  `.execute(db);

  await sql`
    update listing_item
    set model_id = twin.id
    from aperture_rename
    join model as twin on twin.slug = aperture_rename.slug and twin.id <> aperture_rename.id
    where listing_item.model_id = aperture_rename.id
  `.execute(db);

  await sql`
    delete from model
    using aperture_rename
    join model as twin on twin.slug = aperture_rename.slug and twin.id <> aperture_rename.id
    where model.id = aperture_rename.id
  `.execute(db);

  await sql`
    update model
    set name = aperture_rename.name,
        display_name = aperture_rename.display_name,
        slug = aperture_rename.slug
    from aperture_rename
    where model.id = aperture_rename.id
  `.execute(db);

  await sql`drop table aperture_rename`.execute(db);
}
