import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/unit/**/*.test.ts', 'scripts/**/*.test.ts'],
    exclude: ['tests/integration/**/*.test.ts'],
    reporters: [
      'default',
      ['junit', { outputFile: './test-results/junit.xml' }]
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: ['src/types/**', 'scripts/**', 'src/**/index.ts'],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      }
    }
  },
  resolve: {
    alias: {
      '^(\\.{1,2}/.*)\\.js$': '$1'
    }
  }
});
