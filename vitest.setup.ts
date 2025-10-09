import { beforeAll, afterAll, afterEach } from 'vitest';

// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'silent';
});

// Clean up after each test
afterEach(() => {
  // Clear all timers
  vi.clearAllTimers();
});

// Global test teardown
afterAll(() => {
  // Clean up any remaining resources
});
