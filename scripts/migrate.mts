/**
 * Kysely migration runner.
 *
 *   pnpm db:migrate        # run every pending migration
 *   pnpm db:rollback       # undo the most recent migration
 *
 * Run with plain `node` — Node strips the TypeScript types itself.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// @next/env is CommonJS-only, so it has no named ESM exports.
import nextEnv from '@next/env';
import { Kysely, PostgresDialect } from 'kysely';
import { FileMigrationProvider, Migrator } from 'kysely/migration';
import pg from 'pg';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Next.js loads .env* itself at runtime; outside of it we do the same by hand.
nextEnv.loadEnvConfig(projectRoot);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set — see .env.example');
}

const db = new Kysely<unknown>({
  dialect: new PostgresDialect({ pool: new pg.Pool({ connectionString }) }),
});

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(projectRoot, 'src/db/migrations'),
  }),
});

const direction = process.argv[2] ?? 'up';

const { error, results } = await (direction === 'down'
  ? migrator.migrateDown()
  : migrator.migrateToLatest());

for (const result of results ?? []) {
  if (result.status === 'Success') {
    console.log(`✔ ${result.migrationName} (${result.direction})`);
  } else if (result.status === 'Error') {
    console.error(`✘ ${result.migrationName} (${result.direction})`);
  }
}

if (error) {
  console.error('Migration failed:', error);
  await db.destroy();
  process.exit(1);
}

if (!results?.length) {
  console.log('No migrations to run.');
}

await db.destroy();
