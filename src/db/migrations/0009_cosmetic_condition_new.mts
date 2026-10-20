import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`alter type cosmetic_condition rename value 'mint' to 'new'`.execute(db);
}
