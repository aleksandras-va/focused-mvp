import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nextEnv from '@next/env';

const LOCAL_HOSTS = ['localhost', '127.0.0.1'];

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function testDatabaseUrl(): string {
  nextEnv.loadEnvConfig(projectRoot);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not set — see .env.test');

  const { hostname, pathname } = new URL(databaseUrl);
  if (!LOCAL_HOSTS.includes(hostname) || !pathname.endsWith('_test')) {
    throw new Error(`Tests only run against a local *_test database, not ${hostname}${pathname}`);
  }

  return databaseUrl;
}
