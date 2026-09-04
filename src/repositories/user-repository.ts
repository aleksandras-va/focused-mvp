import 'server-only';
import { db } from '@/db';
import type { NewUser } from '@/db/tables';

const userColumns = ['id', 'email', 'display_name', 'phone', 'password_hash'] as const;

export type UserRow = Awaited<ReturnType<typeof findUserById>>;

export function findUserById(id: string) {
  return db.selectFrom('user').select(userColumns).where('id', '=', id).executeTakeFirst();
}

export function findUserByEmail(email: string) {
  return db.selectFrom('user').select(userColumns).where('email', '=', email).executeTakeFirst();
}

export function insertUser(values: NewUser) {
  return db.insertInto('user').values(values).returning(userColumns).executeTakeFirstOrThrow();
}
