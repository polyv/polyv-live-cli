/**
 * Authentication configuration loading and validation
 */

import { AuthConfig, AuthOptions, AuthResult, AuthSource, AUTH_ENV_VARS, AUTH_CLI_OPTIONS } from '../types/auth';
import { ConfigurationError } from '../utils/errors';

/**
 * Loads authentication configuration from command line arguments
 * @param cliOptions Parsed command line options from Commander.js
 * @returns AuthOptions with values from CLI arguments
 */
export function loadAuthFromCLI(cliOptions: Record<string, unknown>): AuthOptions {
  const authOptions: AuthOptions = {};

  if (typeof cliOptions[AUTH_CLI_OPTIONS.APP_ID] === 'string') {
    authOptions.appId = cliOptions[AUTH_CLI_OPTIONS.APP_ID] as string;
  }

  if (typeof cliOptions[AUTH_CLI_OPTIONS.APP_SECRET] === 'string') {
    authOptions.appSecret = cliOptions[AUTH_CLI_OPTIONS.APP_SECRET] as string;
  }

  if (typeof cliOptions[AUTH_CLI_OPTIONS.USER_ID] === 'string') {
    authOptions.userId = cliOptions[AUTH_CLI_OPTIONS.USER_ID] as string;
  }

  return authOptions;
}

/**
 * Loads authentication configuration from environment variables
 * @returns AuthOptions with values from environment variables
 */
export function loadAuthFromEnv(): AuthOptions {
  const authOptions: AuthOptions = {};

  const appId = process.env[AUTH_ENV_VARS.APP_ID];
  if (appId !== undefined) {
    authOptions.appId = appId.trim();
  }

  const appSecret = process.env[AUTH_ENV_VARS.APP_SECRET];
  if (appSecret !== undefined) {
    authOptions.appSecret = appSecret.trim();
  }

  const userId = process.env[AUTH_ENV_VARS.USER_ID];
  if (userId !== undefined) {
    authOptions.userId = userId.trim();
  }

  return authOptions;
}

/**
 * Merges authentication options with CLI taking precedence over environment variables
 * @param cliOptions Authentication options from command line
 * @param envOptions Authentication options from environment variables
 * @returns Merged AuthOptions and source information
 */
export function mergeAuthOptions(cliOptions: AuthOptions, envOptions: AuthOptions): { options: AuthOptions; sources: AuthSource } {
  const mergedOptions: AuthOptions = {};
  const sources: AuthSource = {};

  // appId: CLI > ENV (check for undefined to handle empty strings)
  if (cliOptions.appId !== undefined) {
    mergedOptions.appId = cliOptions.appId;
    sources.appIdSource = 'cli';
  } else if (envOptions.appId !== undefined) {
    mergedOptions.appId = envOptions.appId;
    sources.appIdSource = 'env';
  }

  // appSecret: CLI > ENV (check for undefined to handle empty strings)
  if (cliOptions.appSecret !== undefined) {
    mergedOptions.appSecret = cliOptions.appSecret;
    sources.appSecretSource = 'cli';
  } else if (envOptions.appSecret !== undefined) {
    mergedOptions.appSecret = envOptions.appSecret;
    sources.appSecretSource = 'env';
  }

  // userId: CLI > ENV (check for undefined to handle empty strings)
  if (cliOptions.userId !== undefined) {
    mergedOptions.userId = cliOptions.userId;
    sources.userIdSource = 'cli';
  } else if (envOptions.userId !== undefined) {
    mergedOptions.userId = envOptions.userId;
    sources.userIdSource = 'env';
  }

  return { options: mergedOptions, sources };
}

/**
 * Validates authentication configuration for completeness
 * @param authOptions Authentication options to validate
 * @returns Whether the configuration is valid
 */
export function validateAuthConfig(authOptions: AuthOptions): boolean {
  return !!(authOptions.appId && authOptions.appSecret);
}

/**
 * Creates a detailed error message for missing authentication parameters
 * @param authOptions Current authentication options
 * @param sources Source information for debugging
 * @returns User-friendly error message
 */
export function createAuthErrorMessage(authOptions: AuthOptions, sources: AuthSource): string {
  const missing: string[] = [];
  
  if (!authOptions.appId) {
    missing.push('appId');
  }
  
  if (!authOptions.appSecret) {
    missing.push('appSecret');
  }

  if (missing.length === 0) {
    return 'Authentication configuration is valid';
  }

  const missingStr = missing.join(', ');
  const hasCliSource = Object.values(sources).some(source => source === 'cli');
  const hasEnvSource = Object.values(sources).some(source => source === 'env');

  let message = `Missing required authentication parameters: ${missingStr}\n\n`;
  
  message += 'You can provide authentication in two ways:\n';
  message += '1. Command line: --appId <ID> --appSecret <SECRET> [--userId <USER_ID>]\n';
  message += '2. Environment variables: POLYV_APP_ID, POLYV_APP_SECRET, POLYV_USER_ID\n\n';
  
  if (hasCliSource || hasEnvSource) {
    message += 'Current configuration sources:\n';
    if (sources.appIdSource) {
      message += `  appId: ${sources.appIdSource}\n`;
    }
    if (sources.appSecretSource) {
      message += `  appSecret: ${sources.appSecretSource}\n`;
    }
    if (sources.userIdSource) {
      message += `  userId: ${sources.userIdSource}\n`;
    }
  }

  return message.trim();
}

/**
 * Main authentication configuration loading function
 * @param cliOptions Command line options from Commander.js
 * @returns Complete authentication result with config, sources, and validation status
 */
export function loadAuthConfig(cliOptions: Record<string, unknown> = {}): AuthResult {
  // Load from both sources
  const cliAuth = loadAuthFromCLI(cliOptions);
  const envAuth = loadAuthFromEnv();

  // Merge with CLI precedence
  const { options: mergedOptions, sources } = mergeAuthOptions(cliAuth, envAuth);

  // Validate configuration
  const isValid = validateAuthConfig(mergedOptions);

  if (!isValid) {
    const errorMessage = createAuthErrorMessage(mergedOptions, sources);
    throw new ConfigurationError(errorMessage);
  }

  // Create final config (we know it's valid at this point)
  const config: AuthConfig = {
    appId: mergedOptions.appId!,
    appSecret: mergedOptions.appSecret!,
    ...(mergedOptions.userId && { userId: mergedOptions.userId }),
  };

  return {
    config,
    sources,
    isValid: true,
  };
}