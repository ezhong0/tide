import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/mocks/**',
        'packages/app/**', // iOS app
        'packages/web/**', // Next.js frontend
      ],
      include: [
        'packages/services/**/*.ts',
        'packages/shared/**/*.ts',
        'packages/libraries/**/*.ts',
      ],
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    isolate: true,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
  },
  resolve: {
    alias: {
      '@tide/contracts': resolve(__dirname, './packages/shared/contracts/src'),
      '@tide/base': resolve(__dirname, './packages/shared/base/src'),
      '@tide/logger': resolve(__dirname, './packages/libraries/logger/src'),
      '@tide/database': resolve(__dirname, './packages/libraries/database/src'),
      '@tide/middleware': resolve(__dirname, './packages/services/shared/middleware'),
      '@tide/config': resolve(__dirname, './packages/shared/config/src'),
      '@tide/testing': resolve(__dirname, './packages/shared/testing/src'),
    },
  },
});
