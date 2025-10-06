/**
 * Jest global setup for all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.DATABASE_URL = 'postgresql://tide:tide_dev_password@localhost:5432/tide_test';
process.env.REDIS_URL = 'redis://localhost:6379';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Global test utilities
global.beforeAll(() => {
  console.log('🧪 Starting test suite...');
});

global.afterAll(() => {
  console.log('✅ Test suite completed');
});
