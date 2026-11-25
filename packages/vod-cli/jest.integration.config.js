/**
 * Jest configuration for integration tests.
 *
 * They run the built binary (`dist/index.js`) in child processes: the offline ones wherever the
 * package is built, the real-account ones only when the test account is configured (see
 * `tests/helpers/credentials.ts`). `pnpm test:integration` builds first and then runs this.
 *
 * No junit reporter here on purpose: CI uploads `test-results/junit.xml` from the unit run.
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
  // One file at a time: the real-account file uploads to and deletes from the platform.
  maxWorkers: 1,
  cache: true,
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
  // Waiting for a transcode, or for the platform to let go of a just-uploaded video, takes minutes.
  testTimeout: 10 * 60 * 1000,
  verbose: true
};
