/**
 * Common Jest setup for all packages
 * Individual packages can extend this with their own setup
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.TZ = 'UTC';

// Increase timeout for async operations in tests
jest.setTimeout(10000);

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Keep error and warn for debugging
  error: jest.fn(console.error),
  warn: jest.fn(console.warn),
  // Silence log, debug, info
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Export types for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}