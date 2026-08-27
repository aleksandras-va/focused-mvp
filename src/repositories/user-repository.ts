import "server-only";
import { db } from "@/db";
import type { NewUser } from "@/db/tables";

const userColumns = [
  "id",
  "email",
  "display_name",
  "seller_type",
  "store_name",
  "store_slug",
] as const;

export type UserRow = Awaited<ReturnType<typeof findUserById>>;

export function findUserById(id: string) {
  return db
    .selectFrom("users")
    .select(userColumns)
    .where("id", "=", id)
    .executeTakeFirst();
}

export function findUserByEmail(email: string) {
  return db
    .selectFrom("users")
    .select(userColumns)
    .where("email", "=", email)
    .executeTakeFirst();
}

export async function storeSlugExists(slug: string) {
  const match = await db
    .selectFrom("users")
    .select("id")
    .where("store_slug", "=", slug)
    .executeTakeFirst();

  return match !== undefined;
}

export function insertUser(values: NewUser) {
  return db
    .insertInto("users")
    .values(values)
    .returning(userColumns)
    .executeTakeFirstOrThrow();
}
