import { defineConfig } from 'vitest/config';

// Real-account tests. Skipped automatically when POLYV_VOD_USER_ID / POLYV_VOD_SECRET_KEY /
// POLYV_VOD_WRITE_TOKEN are not set (loaded from .env.test by each test file).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    testTimeout: 300_000,
    hookTimeout: 300_000,
    fileParallelism: false,
    reporters: ['default'],
  },
  resolve: {
    alias: {
      '^(\\.{1,2}/.*)\\.js$': '$1'
    }
  }
});
