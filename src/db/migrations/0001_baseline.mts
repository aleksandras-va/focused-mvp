import { readFile } from 'node:fs/promises';
import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  const { rows } = await sql<{ schemaAlreadyExists: boolean }>`
    select to_regclass('public.listing') is not null as "schemaAlreadyExists"
  `.execute(db);

  if (rows[0].schemaAlreadyExists) {
    return;
  }

  const baselineSchema = await readFile(new URL('./0001_baseline.sql', import.meta.url), 'utf8');

  await sql.raw(baselineSchema).execute(db);
}
