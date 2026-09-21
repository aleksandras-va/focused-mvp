import 'server-only';
import { sql } from 'kysely';
import { db } from '@/db';
import type { NewUser, UserUpdate } from '@/db/tables';

const userColumns = ['id', 'email', 'display_name', 'phone', 'city_id', 'password_hash'] as const;

export const userRepository = {
  findById(id: string) {
    return db.selectFrom('user').select(userColumns).where('id', '=', id).executeTakeFirst();
  },

  findByEmail(email: string) {
    return db.selectFrom('user').select(userColumns).where('email', '=', email).executeTakeFirst();
  },

  insert(values: NewUser) {
    return db.insertInto('user').values(values).returning(userColumns).executeTakeFirstOrThrow();
  },

  update(id: string, values: UserUpdate) {
    return db
      .updateTable('user')
      .set({ ...values, updated_at: sql<Date>`now()` })
      .where('id', '=', id)
      .returning(userColumns)
      .executeTakeFirstOrThrow();
  },
} as const;
