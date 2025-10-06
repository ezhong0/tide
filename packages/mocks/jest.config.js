const base = require('../../jest.config.base');

module.exports = {
  ...base,
  displayName: '@tide/mocks',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
};