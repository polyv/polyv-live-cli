/**
 * Configuration types and interfaces for PolyV CLI
 */

import { AuthConfig } from './auth';

/**
 * Validates output format value
 */
export function validateOutputFormat(value: string): 'table' | 'json' {
  const validFormats = ['table', 'json'] as const;
  if (!validFormats.includes(value as any)) {
    throw new Error(`Invalid output format: ${value}. Must be one of: ${validFormats.join(', ')}`);
  }
  return value as 'table' | 'json';
}

/**
 * Environment types supported by the CLI
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * Configuration source types indicating where config values come from
 */
export type ConfigSource = 'cli' | 'env' | 'file' | 'global' | 'default';

/**
 * Core application configuration interface
 */
export interface AppConfig {
  /** Application environment */
  environment: Environment;
  /** Authentication configuration */
  auth: AuthConfig;
  /** Configuration file path (optional) */
  configPath?: string;
  /** Enable debug mode */
  debug: boolean;
  /** API timeout in milliseconds */
  timeout: number;
  /** Base URL for PolyV API */
  baseUrl: string;
  /** Maximum retry attempts for API calls */
  maxRetries: number;
}

/**
 * Environment-specific configuration
 */
export interface EnvironmentConfig {
  /** Environment name */
  environment: Environment;
  /** API base URL for this environment */
  baseUrl: string;
  /** Default timeout for this environment */
  timeout: number;
  /** Maximum retries for this environment */
  maxRetries: number;
  /** Debug mode default for this environment */
  debug: boolean;
}

/**
 * Configuration loading options
 */
export interface ConfigOptions {
  /** Custom configuration file path */
  configPath?: string;
  /** Environment to load configuration for */
  environment?: Environment;
  /** Skip .env file loading */
  skipEnvFile?: boolean;
  /** Additional environment file paths to load */
  envFiles?: string[];
  /** Command line options */
  cliOptions?: Record<string, unknown>;
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  /** Whether the configuration is valid */
  isValid: boolean;
  /** Validation errors if any */
  errors: string[];
  /** Validation warnings if any */
  warnings: string[];
  /** Missing required fields */
  missingFields: string[];
}

/**
 * Configuration source tracking for debugging
 */
export interface ConfigSources {
  /** Source of environment setting */
  environment: ConfigSource;
  /** Source of debug setting */
  debug: ConfigSource;
  /** Source of timeout setting */
  timeout: ConfigSource;
  /** Source of baseUrl setting */
  baseUrl: ConfigSource;
  /** Source of maxRetries setting */
  maxRetries: ConfigSource;
  /** Source of configPath setting */
  configPath?: ConfigSource;
}

/**
 * Complete configuration result with metadata
 */
export interface ConfigResult {
  /** Final application configuration */
  config: AppConfig;
  /** Source information for each configuration field */
  sources: ConfigSources;
  /** Validation result */
  validation: ConfigValidationResult;
  /** Loaded environment files */
  loadedEnvFiles: string[];
}

/**
 * Raw configuration from environment files
 */
export interface RawConfig {
  /** Environment setting */
  POLYV_ENVIRONMENT?: string | undefined;
  /** Debug mode setting */
  POLYV_DEBUG?: string | undefined;
  /** API timeout setting */
  POLYV_TIMEOUT?: string | undefined;
  /** API base URL setting */
  POLYV_BASE_URL?: string | undefined;
  /** Max retries setting */
  POLYV_MAX_RETRIES?: string | undefined;
  /** Configuration file path */
  POLYV_CONFIG_PATH?: string | undefined;
  /** Authentication settings */
  POLYV_APP_ID?: string | undefined;
  POLYV_APP_SECRET?: string | undefined;
  POLYV_USER_ID?: string | undefined;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Omit<AppConfig, 'auth'> = {
  environment: 'production',
  debug: false,
  timeout: 30000,
  baseUrl: 'https://api.polyv.net',
  maxRetries: 3,
};

/**
 * Environment-specific configurations
 */
export const ENVIRONMENT_CONFIGS: Record<Environment, EnvironmentConfig> = {
  development: {
    environment: 'development',
    baseUrl: 'https://api-dev.polyv.net',
    timeout: 10000,
    maxRetries: 1,
    debug: true,
  },
  production: {
    environment: 'production',
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    maxRetries: 3,
    debug: false,
  },
  test: {
    environment: 'test',
    baseUrl: 'https://develop-3-api.polyv.net',
    timeout: 5000,
    maxRetries: 0,
    debug: false,
  },
};

/**
 * Configuration environment variable names
 */
export const CONFIG_ENV_VARS = {
  ENVIRONMENT: 'POLYV_ENVIRONMENT',
  DEBUG: 'POLYV_DEBUG',
  TIMEOUT: 'POLYV_TIMEOUT',
  BASE_URL: 'POLYV_BASE_URL',
  MAX_RETRIES: 'POLYV_MAX_RETRIES',
  CONFIG_PATH: 'POLYV_CONFIG_PATH',
} as const;

/**
 * Configuration CLI option names
 */
export const CONFIG_CLI_OPTIONS = {
  ENVIRONMENT: 'environment',
  DEBUG: 'debug',
  TIMEOUT: 'timeout',
  BASE_URL: 'baseUrl',
  MAX_RETRIES: 'maxRetries',
  CONFIG_PATH: 'config',
} as const;

/**
 * Environment file patterns for different environments
 */
export const ENV_FILE_PATTERNS = {
  base: '.env',
  local: '.env.local',
  environment: (env: Environment) => `.env.${env}`,
  environmentLocal: (env: Environment) => `.env.${env}.local`,
} as const;