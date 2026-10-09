import { execFileSync } from 'node:child_process';
import pg from 'pg';
import { projectRoot, testDatabaseUrl } from './test-database.mts';

export default async function setup(): Promise<void> {
  const databaseUrl = testDatabaseUrl();
  const databaseName = new URL(databaseUrl).pathname.slice(1);

  const maintenanceUrl = new URL(databaseUrl);
  maintenanceUrl.pathname = '/postgres';

  const client = new pg.Client({ connectionString: maintenanceUrl.toString() });
  await client.connect();
  const existing = await client.query('select 1 from pg_database where datname = $1', [
    databaseName,
  ]);
  if (existing.rowCount === 0) await client.query(`create database ${databaseName}`);
  await client.end();

  for (const script of ['scripts/migrate.mts', 'scripts/seed.mts']) {
    execFileSync('node', [script], {
      cwd: projectRoot,
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'pipe',
    });
  }
}
