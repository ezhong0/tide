/**
 * Vitest Configuration for E2E Tests
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'e2e',
    include: ['e2e/**/*.e2e.test.ts'],
    globals: true,
    environment: 'node',
    testTimeout: 30000, // 30s timeout for E2E tests
    hookTimeout: 60000, // 60s for setup/teardown
    globalSetup: './e2e/setup.ts',
    setupFiles: ['./vitest.setup.ts'],
    poolOptions: {
      threads: {
        singleThread: true, // Run E2E tests sequentially
      },
    },
    coverage: {
      enabled: false, // E2E tests don't need coverage
    },
  },
  resolve: {
    alias: {
      '@tide/types': path.resolve(__dirname, './packages/shared/types/src'),
      '@tide/database': path.resolve(__dirname, './packages/libraries/database/src'),
      '@tide/logger': path.resolve(__dirname, './packages/libraries/logger/src'),
      '@tide/config': path.resolve(__dirname, './packages/shared/config/src'),
      '@tide/errors': path.resolve(__dirname, './packages/shared/errors/src'),
      '@tide/middleware': path.resolve(__dirname, './packages/services/shared/middleware'),
      '@tide/validation': path.resolve(__dirname, './packages/shared/validation/src'),
      '@tide/encryption': path.resolve(__dirname, './packages/libraries/encryption/src'),
    },
  },
});

