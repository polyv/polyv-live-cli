/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  maxWorkers: 4,
  cache: true,
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  // The tests read what commands printed from the context, so the console stays quiet.
  setupFiles: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/__tests__/**'],
  coverageReporters: ['text', 'json-summary', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: { branches: 70, functions: 80, lines: 80, statements: 80 }
  },
  reporters: ['default', ['jest-junit', { outputDirectory: './test-results', outputName: 'junit.xml' }]]
};
