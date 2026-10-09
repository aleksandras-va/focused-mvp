import path from 'node:path';
import { defineConfig } from 'vitest/config';
import { projectRoot, testDatabaseUrl } from './test/test-database.mts';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.join(projectRoot, 'src'),
      'server-only': path.join(projectRoot, 'node_modules/server-only/empty.js'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
    globalSetup: ['./test/global-setup.mts'],
    env: { DATABASE_URL: testDatabaseUrl() },
  },
});
