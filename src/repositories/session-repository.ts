import 'server-only';
import { sql } from 'kysely';
import { db } from '@/db';

export function insertSession(userId: string, expiresAt: Date) {
  return db
    .insertInto('session')
    .values({ user_id: userId, expires_at: expiresAt })
    .returning(['id', 'expires_at'])
    .executeTakeFirstOrThrow();
}

export function findActiveSession(id: string) {
  return db
    .selectFrom('session')
    .select(['id', 'user_id', 'expires_at'])
    .where('id', '=', id)
    .where('expires_at', '>', sql<Date>`now()`)
    .executeTakeFirst();
}

export async function deleteSession(id: string) {
  await db.deleteFrom('session').where('id', '=', id).execute();
}

export async function deleteExpiredSessions() {
  await db.deleteFrom('session').where('expires_at', '<=', sql<Date>`now()`).execute();
}
