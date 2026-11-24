import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['tests/**', 'node_modules/**', 'dist/**'],
    reporters: ['default', ['junit', { outputFile: './test-results/junit.xml' }]],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'src/types/**',
        'scripts/**',
        'src/**/index.ts',
        'src/version.ts',
        'src/__tests__/**',
        'tests/**'
      ],
      thresholds: {
        branches: 70,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '^(\\.{1,2}/.*)\\.js$': '$1'
    }
  }
});
