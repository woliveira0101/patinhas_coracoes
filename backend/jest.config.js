/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  testMatch: ['**/tests/**/*.test.js'],
  moduleDirectories: ['node_modules', 'src'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  globalSetup: './tests/globalSetup.js',
  globalTeardown: './tests/globalTeardown.js',
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/', '/src/config/', '/src/utils/logger.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  verbose: true,
  testTimeout: 30000,
  clearMocks: true,
  restoreMocks: true,
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {},
  roots: ['<rootDir>/tests'],
  bail: false,
  collectCoverageFrom: ['src/**/*.js', '!src/config/**', '!src/utils/logger.js'],
};
