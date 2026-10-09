import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    alter table mount
      add column search_terms text[] not null default '{}'
  `.execute(db);
}
