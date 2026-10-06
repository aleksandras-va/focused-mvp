import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nextEnv from '@next/env';
import { Kysely, PostgresDialect } from 'kysely';
import { FileMigrationProvider, Migrator } from 'kysely/migration';
import pg from 'pg';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

nextEnv.loadEnvConfig(projectRoot);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set — see .env.example');
}

const { host, pathname } = new URL(connectionString);

console.log(`Migrating ${host}${pathname}`);

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

const { error, results = [] } = await migrator.migrateToLatest();

for (const { migrationName, status } of results) {
  console.log(`${status === 'Success' ? 'applied' : 'failed'}  ${migrationName}`);
}

if (results.length === 0 && !error) {
  console.log('Already up to date.');
}

await db.destroy();

if (error) {
  console.error(error);
  process.exit(1);
}
