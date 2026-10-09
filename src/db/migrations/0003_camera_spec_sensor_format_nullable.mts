import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    alter table camera_spec
      alter column sensor_format drop not null
  `.execute(db);
}
