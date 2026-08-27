import "server-only";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { DB } from "./types";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set — see .env.example");
}

// `next dev` re-evaluates modules on every change, so the pool is cached on
// globalThis to avoid leaking a new set of connections per hot reload.
const globalForDb = globalThis as typeof globalThis & {
  __focusedDb?: Kysely<DB>;
};

export const db =
  globalForDb.__focusedDb ??
  new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString, max: 10 }),
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__focusedDb = db;
}

export type { DB } from "./types";
