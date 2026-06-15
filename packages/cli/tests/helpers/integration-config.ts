/**
 * @fileoverview Integration test configuration helper
 * Reads credentials from CLI account config (~/.polyv/accounts.json) or .env.test
 * @author Development Team
 * @since 3.5.0
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { AuthConfig } from '../../src/types/auth';

// Load .env.test file if it exists
const envTestPath = path.join(__dirname, '../../.env.test');
if (fs.existsSync(envTestPath)) {
  const envContent = fs.readFileSync(envTestPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Only set if not already defined
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    }
  });
}

/**
 * Account configuration structure from accounts.json
 */
interface AccountData {
  name: string;
  appId: string;
  appSecret: string; // Encrypted
  userId?: string;
  environment?: string;
  createdAt: string;
  updatedAt: string;
}

interface AccountsStore {
  version: string;
  accounts: Record<string, AccountData>;
  defaultAccount?: string;
  metadata?: {
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Decrypted account credentials
 */
export interface TestCredentials {
  appId: string;
  appSecret: string;
  userId?: string;
  accountName: string;
}

/**
 * Get the default config path for accounts
 */
function getAccountsConfigPath(): string {
  const homeDir = process.env['HOME'] || os.homedir();
  return path.join(homeDir, '.polyv', 'accounts.json');
}

/**
 * Simple decryption for testing (matches AccountCrypto)
 * Note: This uses the same encryption as the CLI, but for testing purposes
 */
function decryptSecret(encryptedData: string): string {
  try {
    // If not encrypted (plain text), return as is
    if (!encryptedData.startsWith('{')) {
      return encryptedData;
    }

    const parsed = JSON.parse(encryptedData);
    const { data, meta } = parsed;

    if (!data || !meta?.iv) {
      return encryptedData;
    }

    // For testing, we'll use environment variable MASTER_KEY or a default
    // In production, the CLI uses a master key stored securely
    const masterKey = process.env['POLYV_MASTER_KEY'] || 'default-test-master-key-32bytes!';

    // Use Node.js crypto to decrypt (AES-256-CBC)
    const crypto = require('crypto');
    const key = crypto.scryptSync(masterKey, 'salt', 32);
    const iv = Buffer.from(meta.iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // If decryption fails, try using the value as-is (might be plain text for testing)
    return encryptedData;
  }
}

/**
 * Load accounts from the CLI config file
 */
function loadAccountsConfig(): AccountsStore | null {
  const configPath = getAccountsConfigPath();

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Warning: Could not parse accounts config: ${configPath}`);
    return null;
  }
}

/**
 * Get credentials for a specific account
 */
export function getAccountCredentials(accountName?: string): TestCredentials | null {
  const config = loadAccountsConfig();

  if (!config || !config.accounts) {
    return null;
  }

  // Use specified account, or default account, or first available
  const targetAccount = accountName || config.defaultAccount || Object.keys(config.accounts)[0];

  if (!targetAccount || !config.accounts[targetAccount]) {
    return null;
  }

  const account = config.accounts[targetAccount];

  return {
    appId: account.appId,
    appSecret: decryptSecret(account.appSecret),
    userId: account.userId,
    accountName: account.name,
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
  // First check environment variables
  const envAppId = process.env['POLYV_APP_ID'] || process.env['POLYV_TEST_APP_ID'];
  const envAppSecret = process.env['POLYV_APP_SECRET'] || process.env['POLYV_TEST_APP_SECRET'];

  if (envAppId && envAppSecret && envAppId.length >= 8 && envAppSecret.length >= 8) {
    return true;
  }

  // Then check CLI account config
  const credentials = getDefaultCredentials();
  return !!(credentials?.appId && credentials?.appSecret);
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
  // First try environment variables
  const envAppId = process.env['POLYV_APP_ID'] || process.env['POLYV_TEST_APP_ID'];
  const envAppSecret = process.env['POLYV_APP_SECRET'] || process.env['POLYV_TEST_APP_SECRET'];
  const envUserId = process.env['POLYV_USER_ID'] || process.env['POLYV_TEST_USER_ID'];

  if (envAppId && envAppSecret) {
    return {
      authConfig: {
        appId: envAppId,
        appSecret: envAppSecret,
        userId: envUserId,
      },
      testChannelId: process.env['POLYV_TEST_CHANNEL_ID'] || '3151318',
      baseUrl: process.env['POLYV_TEST_BASE_URL'] || 'https://api.polyv.net',
    };
  }

  // Then try CLI account config
  const credentials = getDefaultCredentials();

  if (credentials) {
    return {
      authConfig: {
        appId: credentials.appId,
        appSecret: credentials.appSecret,
        userId: credentials.userId,
      },
      testChannelId: process.env['POLYV_TEST_CHANNEL_ID'] || '3151318',
      baseUrl: 'https://api.polyv.net',
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
  return !hasRealCredentials() && !process.env['POLYV_APP_ID'] && !process.env['POLYV_TEST_APP_ID'];
}
