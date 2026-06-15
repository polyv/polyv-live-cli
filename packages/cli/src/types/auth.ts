/**
 * Authentication types and interfaces for PolyV CLI
 */

/**
 * Core authentication configuration interface
 * Contains all required and optional authentication parameters
 */
export interface AuthConfig {
  /** PolyV Application ID (required) */
  appId: string;
  /** PolyV Application Secret (required) */
  appSecret: string;
  /** PolyV User ID (optional) */
  userId?: string;
}

/**
 * Optional authentication parameters from command line or environment
 * All fields are optional to support partial configuration loading
 */
export interface AuthOptions {
  /** PolyV Application ID */
  appId?: string;
  /** PolyV Application Secret */
  appSecret?: string;
  /** PolyV User ID */
  userId?: string;
}

/**
 * Authentication source information for debugging and validation
 */
export interface AuthSource {
  /** Source of appId (cli|env|default) */
  appIdSource?: 'cli' | 'env' | 'default';
  /** Source of appSecret (cli|env|default) */
  appSecretSource?: 'cli' | 'env' | 'default';
  /** Source of userId (cli|env|default) */
  userIdSource?: 'cli' | 'env' | 'default';
}

/**
 * Complete authentication result with configuration and source info
 */
export interface AuthResult {
  /** Final authentication configuration */
  config: AuthConfig;
  /** Source information for each parameter */
  sources: AuthSource;
  /** Whether configuration is complete and valid */
  isValid: boolean;
}

/**
 * Environment variable names for authentication
 */
export const AUTH_ENV_VARS = {
  APP_ID: 'POLYV_APP_ID',
  APP_SECRET: 'POLYV_APP_SECRET',
  USER_ID: 'POLYV_USER_ID',
} as const;

/**
 * Command line parameter names for authentication
 */
export const AUTH_CLI_OPTIONS = {
  APP_ID: 'appId',
  APP_SECRET: 'appSecret',
  USER_ID: 'userId',
} as const;