import 'server-only';
import { sql } from 'kysely';
import { db } from '@/db';

export const sessionRepository = {
  findActive(id: string) {
    return db
      .selectFrom('session')
      .select(['id', 'user_id', 'expires_at'])
      .where('id', '=', id)
      .where('expires_at', '>', sql<Date>`now()`)
      .executeTakeFirst();
  },

  insert(userId: string, expiresAt: Date) {
    return db
      .insertInto('session')
      .values({ user_id: userId, expires_at: expiresAt })
      .returning(['id', 'expires_at'])
      .executeTakeFirstOrThrow();
  },

  async delete(id: string) {
    await db.deleteFrom('session').where('id', '=', id).execute();
  },

  async deleteExpired() {
    await db.deleteFrom('session').where('expires_at', '<=', sql<Date>`now()`).execute();
  },
} as const;
