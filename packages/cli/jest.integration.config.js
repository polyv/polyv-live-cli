/**
 * Jest configuration for integration tests
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: false
      }
    ]
  },
  maxWorkers: 4,
  cache: true,
  forceExit: false,
  setupFiles: [
    '<rootDir>/jest.setup.js'
  ],
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  testTimeout: 30000,
  verbose: true
};
