/**
 * @fileoverview Integration test configuration helper
 * Reads credentials from environment variables or .env.test
 * @author Development Team
 * @since 3.5.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { AuthConfig } from '../../src/types/auth';

export const envTestPath = path.join(__dirname, '../../.env.test');

export function loadIntegrationEnvFile(filePath: string = envTestPath): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const env: Record<string, string> = {};
  const envContent = fs.readFileSync(filePath, 'utf-8');

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');
        env[key.trim()] = value;
      }
    }
  });

  return env;
}

export const integrationEnv = loadIntegrationEnvFile();

function applyIntegrationEnv(): void {
  Object.entries(integrationEnv).forEach(([key, value]) => {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });

  if (!process.env['POLYV_APP_ID'] && process.env['POLYV_TEST_APP_ID']) {
    process.env['POLYV_APP_ID'] = process.env['POLYV_TEST_APP_ID'];
  }

  if (!process.env['POLYV_APP_SECRET'] && process.env['POLYV_TEST_APP_SECRET']) {
    process.env['POLYV_APP_SECRET'] = process.env['POLYV_TEST_APP_SECRET'];
  }

  if (!process.env['POLYV_USER_ID'] && process.env['POLYV_TEST_USER_ID']) {
    process.env['POLYV_USER_ID'] = process.env['POLYV_TEST_USER_ID'];
  }
}

applyIntegrationEnv();

/**
 * Resolved integration credentials
 */
export interface TestCredentials {
  appId: string;
  appSecret: string;
  userId?: string;
}

/**
 * Get credentials from .env.test or process environment.
 */
export function getAccountCredentials(): TestCredentials | null {
  const appId = process.env['POLYV_APP_ID'] || process.env['POLYV_TEST_APP_ID'];
  const appSecret = process.env['POLYV_APP_SECRET'] || process.env['POLYV_TEST_APP_SECRET'];
  const userId = process.env['POLYV_USER_ID'] || process.env['POLYV_TEST_USER_ID'];

  if (!appId || !appSecret) {
    return null;
  }

  return {
    appId,
    appSecret,
    ...(userId && { userId }),
  };
}

/**
 * Get the default account credentials
 */
export function getDefaultCredentials(): TestCredentials | null {
  return getAccountCredentials();
}

/**
 * Check if real credentials are available
 */
export function hasRealCredentials(): boolean {
  const envAppId = process.env['POLYV_APP_ID'] || process.env['POLYV_TEST_APP_ID'];
  const envAppSecret = process.env['POLYV_APP_SECRET'] || process.env['POLYV_TEST_APP_SECRET'];

  return !!(envAppId && envAppSecret && envAppId.length >= 8 && envAppSecret.length >= 8);
}

/**
 * Alias for hasRealCredentials - used by some tests
 */
export const hasRealCredentialsAvailable = hasRealCredentials;

/**
 * Get test configuration with credentials
 * Priority: Environment variables > CLI account config
 */
export function getTestConfig(): {
  authConfig: AuthConfig;
  testChannelId: string;
  baseUrl: string;
} {
  const credentials = getDefaultCredentials();

  if (credentials) {
    return {
      authConfig: {
        appId: credentials.appId,
        appSecret: credentials.appSecret,
        userId: credentials.userId,
      },
      testChannelId: process.env['POLYV_TEST_CHANNEL_ID'] || '3151318',
      baseUrl: process.env['POLYV_TEST_BASE_URL'] || 'https://api.polyv.net',
    };
  }

  // Fallback to dummy values for unit tests
  return {
    authConfig: {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id',
    },
    testChannelId: '3151318',
    baseUrl: 'https://api.polyv.net',
  };
}

// Export testConfig for convenience
export const testConfig = getTestConfig();

/**
 * Skip test conditionally based on credentials
 */
export function skipIfNoCredentials(): boolean {
  return !hasRealCredentials();
}
