/**
 * Account configuration types and interfaces for multi-account management
 */

/**
 * Account configuration interface
 * Contains all information needed to authenticate with a PolyV account
 */
export interface AccountConfig {
  /** Account name (unique identifier) */
  name: string;
  /** PolyV application ID (stored in plain text) */
  appId: string;
  /** Encrypted PolyV application secret */
  appSecret: string;
  /** Optional user ID */
  userId?: string;
  /** Environment type for this account */
  environment?: 'development' | 'production' | 'test' | 'custom';
  /** Custom base URL (takes precedence over environment) */
  baseUrl?: string;
  /** Account creation timestamp */
  createdAt: string;
  /** Account last update timestamp */
  updatedAt: string;
}

/**
 * Accounts store interface
 * Manages multiple account configurations
 */
export interface AccountsStore {
  /** Configuration file version for future compatibility */
  version: string;
  /** Map of account name to account configuration */
  accounts: Record<string, AccountConfig>;
  /** Default account name (used when no session account is set) */
  defaultAccount?: string;
  /** Store metadata */
  metadata: {
    /** Store creation timestamp */
    createdAt: string;
    /** Store last update timestamp */
    updatedAt: string;
    /** Optional backup timestamp */
    lastBackup?: string;
    /** Key source for encryption */
    keySource?: 'environment' | 'generated';
  };
}

/**
 * Environment-to-baseUrl mapping
 */
export const ENVIRONMENT_BASE_URLS = {
  development: 'https://api-dev.polyv.net',
  production: 'https://api.polyv.net',
  test: 'https://develop-3-api.polyv.net'
} as const;

/**
 * Environment types
 */
export type Environment = keyof typeof ENVIRONMENT_BASE_URLS | 'custom';

/**
 * Account validation rules
 */
export const AccountConfigValidation = {
  name: {
    required: true,
    pattern: /^[a-zA-Z0-9_-]+$/,  // 字母数字下划线横线
    maxLength: 50,
    minLength: 1
  },
  appId: {
    required: true,
    pattern: /^[a-zA-Z0-9]+$/,    // 字母数字
    minLength: 8,
    maxLength: 32
  },
  appSecret: {
    required: true,
    minLength: 16,                 // 最小16字符
    maxLength: 128                 // 最大128字符
  },
  environment: {
    required: false,
    validValues: ['development', 'production', 'test', 'custom'] as const
  },
  baseUrl: {
    required: false,
    pattern: /^https?:\/\/.+/,     // 必须是有效的HTTP(S) URL
    maxLength: 200
  }
} as const;

/**
 * Account operation result interface
 */
export interface AccountOperationResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Operation result message */
  message: string;
  /** Optional account data */
  account?: AccountConfig;
}

/**
 * Account list options
 */
export interface AccountListOptions {
  /** Output format */
  output?: 'table' | 'json';
  /** Show detailed information */
  detailed?: boolean;
}

/**
 * Account display information (without sensitive data)
 */
export interface AccountDisplayInfo {
  /** Account name */
  name: string;
  /** Application ID */
  appId: string;
  /** Optional user ID */
  userId?: string;
  /** Environment type */
  environment?: 'development' | 'production' | 'test' | 'custom';
  /** Base URL for API calls */
  baseUrl?: string;
  /** Creation timestamp */
  createdAt: string;
  /** Update timestamp */
  updatedAt: string;
}

/**
 * Encrypted account configuration for storage
 */
export interface EncryptedAccountConfig extends Omit<AccountConfig, 'appSecret'> {
  /** Encrypted application secret with IV */
  appSecret: string;
}

/**
 * Encryption metadata
 */
export interface EncryptionMetadata {
  /** Encryption algorithm used */
  algorithm: string;
  /** Initialization vector (IV) */
  iv: string;
  /** Authentication tag for GCM mode */
  authTag: string;
}

/**
 * Account configuration with encryption metadata
 */
export interface StoredAccountConfig extends AccountConfig {
  /** Encryption metadata for the secret */
  encryptionMeta?: EncryptionMetadata;
}

/**
 * New encrypted data format for AES-256-GCM
 */
export interface SecureEncryptedData {
  /** Encryption algorithm */
  algorithm: 'aes-256-gcm';
  /** Initialization vector (base64) */
  iv: string;
  /** Authentication tag (base64) */
  authTag: string;
  /** Encrypted data (base64) */
  encrypted: string;
}

/**
 * Security context interface
 */
export interface SecurityContext {
  /** Whether encryption is enabled */
  encryptionEnabled: boolean;
  /** Key source type */
  keySource: 'environment' | 'generated';
  /** Configuration version */
  configVersion: string;
  /** Last security check timestamp */
  lastSecurityCheck: Date;
  /** Whether permissions are valid */
  permissionsValid: boolean;
}

/**
 * Get the effective base URL for an account
 * Priority: Custom baseUrl > Environment-based URL > Default production URL
 */
export function getAccountBaseUrl(account: AccountConfig): string {
  // If account has custom baseUrl, use it
  if (account.baseUrl) {
    return account.baseUrl;
  }
  
  // If account has environment, use corresponding baseUrl
  if (account.environment && account.environment !== 'custom') {
    return ENVIRONMENT_BASE_URLS[account.environment];
  }
  
  // Default to production
  return ENVIRONMENT_BASE_URLS.production;
}

/**
 * Get environment label for display purposes
 */
export function getEnvironmentLabel(account: AccountConfig): string {
  if (account.baseUrl && account.environment === 'custom') {
    return 'custom';
  }
  return account.environment || 'production';
}
