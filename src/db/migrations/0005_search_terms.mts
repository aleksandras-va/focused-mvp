import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    alter table brand
      add column search_terms text[] not null default '{}'
  `.execute(db);

  await sql`
    alter table model
      add column search_terms text[] not null default '{}'
  `.execute(db);
}
