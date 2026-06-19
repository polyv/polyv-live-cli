import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

// Load .env file
config();

/**
 * Vitest configuration for integration tests
 *
 * These tests make real API calls and require:
 * - POLYV_APP_ID environment variable
 * - POLYV_APP_SECRET environment variable
 * - POLYV_USER_ID environment variable (for channel operations)
 *
 * Run with: npm run test:integration
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    testTimeout: 30000, // 30 seconds for API calls
    hookTimeout: 30000,
    // Load .env file
    env: {
      POLYV_APP_ID: process.env.POLYV_APP_ID || '',
      POLYV_APP_SECRET: process.env.POLYV_APP_SECRET || '',
      POLYV_USER_ID: process.env.POLYV_USER_ID || '',
      POLYV_CHANNEL_ID: process.env.POLYV_CHANNEL_ID || '',
      POLYV_CHILD_USER_ID: process.env.POLYV_CHILD_USER_ID || '',
    },
  }
});
