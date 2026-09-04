import 'server-only';
import { db } from '@/db';
import type { NewStore } from '@/db/tables';

const storeColumns = ['id', 'user_id', 'name', 'slug'] as const;

export function findStoreByUserId(userId: string) {
  return db
    .selectFrom('store')
    .select(storeColumns)
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

export async function storeSlugExists(slug: string) {
  const match = await db
    .selectFrom('store')
    .select('id')
    .where('slug', '=', slug)
    .executeTakeFirst();
  return match !== undefined;
}

export function insertStore(values: NewStore) {
  return db.insertInto('store').values(values).returning(storeColumns).executeTakeFirstOrThrow();
}
