const base = require('../../jest.config.base');

module.exports = {
  ...base,
  displayName: '@tide/contracts',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
};