import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000, // 30s for E2E tests with API calls
    hookTimeout: 10000,
    teardownTimeout: 5000,
    isolate: true,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
  },
});
