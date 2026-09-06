import 'server-only';
import { db } from '@/db';
import type { NewUser } from '@/db/tables';

const userColumns = ['id', 'email', 'display_name', 'phone', 'password_hash'] as const;

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
} as const;
