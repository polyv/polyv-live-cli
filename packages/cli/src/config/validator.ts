/**
 * Configuration validation and error handling
 */

import { ConfigValidationResult, AppConfig, Environment, RawConfig, ENVIRONMENT_CONFIGS } from '../types/config';
import { AuthOptions } from '../types/auth';
import { parseBoolean, parseInteger, parseUrl } from './loader';

/**
 * Required configuration fields that must be present
 */
export const REQUIRED_FIELDS = {
  AUTH: ['appId', 'appSecret'] as const,
  CORE: [] as const, // No core fields are strictly required as we have defaults
} as const;

/**
 * Configuration field constraints
 */
export const FIELD_CONSTRAINTS = {
  timeout: { min: 1000, max: 300000 }, // 1s to 5min
  maxRetries: { min: 0, max: 10 },
  baseUrl: { protocol: ['http:', 'https:'] },
} as const;

/**
 * Validates authentication configuration
 * @param auth Authentication options to validate
 * @returns Validation result for auth
 */
export function validateAuth(auth: AuthOptions): Pick<ConfigValidationResult, 'errors' | 'missingFields'> {
  const errors: string[] = [];
  const missingFields: string[] = [];

  // Check required auth fields
  if (!auth.appId || !auth.appId.trim()) {
    missingFields.push('appId');
    errors.push('PolyV App ID is required. Set via --appId or POLYV_APP_ID environment variable.');
  }

  if (!auth.appSecret || !auth.appSecret.trim()) {
    missingFields.push('appSecret');
    errors.push('PolyV App Secret is required. Set via --appSecret or POLYV_APP_SECRET environment variable.');
  }

  // Validate auth field formats
  if (auth.appId && auth.appId.trim()) {
    const trimmedAppId = auth.appId.trim();
    if (trimmedAppId.length < 10) {
      errors.push('App ID appears to be invalid (too short). Please check your PolyV App ID.');
    }
  }

  if (auth.appSecret && auth.appSecret.trim()) {
    const trimmedAppSecret = auth.appSecret.trim();
    if (trimmedAppSecret.length < 16) {
      errors.push('App Secret appears to be invalid (too short). Please check your PolyV App Secret.');
    }
  }

  if (auth.userId && auth.userId.trim()) {
    const trimmedUserId = auth.userId.trim();
    if (!/^[a-zA-Z0-9]+$/.test(trimmedUserId)) {
      errors.push('User ID must be alphanumeric (letters and numbers only). Please provide a valid PolyV User ID.');
    }
    if (trimmedUserId.length < 3) {
      errors.push('User ID appears to be invalid (too short). Please check your PolyV User ID.');
    }
  }

  return { errors, missingFields };
}

/**
 * Validates environment configuration
 * @param environment Environment to validate
 * @returns Validation errors if any
 */
export function validateEnvironmentConfig(environment: Environment): string[] {
  const errors: string[] = [];

  if (!ENVIRONMENT_CONFIGS[environment]) {
    errors.push(`Invalid environment '${environment}'. Must be one of: development, production, test`);
  }

  return errors;
}

/**
 * Validates timeout value
 * @param timeout Timeout value to validate
 * @returns Validation errors if any
 */
export function validateTimeout(timeout: number): string[] {
  const errors: string[] = [];
  const { min, max } = FIELD_CONSTRAINTS.timeout;

  if (timeout < min) {
    errors.push(`Timeout must be at least ${min}ms (${min / 1000}s)`);
  }

  if (timeout > max) {
    errors.push(`Timeout must not exceed ${max}ms (${max / 1000}s)`);
  }

  return errors;
}

/**
 * Validates max retries value
 * @param maxRetries Max retries value to validate
 * @returns Validation errors if any
 */
export function validateMaxRetries(maxRetries: number): string[] {
  const errors: string[] = [];
  const { min, max } = FIELD_CONSTRAINTS.maxRetries;

  if (maxRetries < min) {
    errors.push(`Max retries must be at least ${min}`);
  }

  if (maxRetries > max) {
    errors.push(`Max retries must not exceed ${max}`);
  }

  return errors;
}

/**
 * Validates base URL
 * @param baseUrl Base URL to validate
 * @returns Validation errors if any
 */
export function validateBaseUrl(baseUrl: string): string[] {
  const errors: string[] = [];

  try {
    const url = new URL(baseUrl);
    
    if (!FIELD_CONSTRAINTS.baseUrl.protocol.includes(url.protocol as 'http:' | 'https:')) {
      errors.push(`Base URL must use HTTP or HTTPS protocol, got: ${url.protocol}`);
    }

    if (!url.hostname) {
      errors.push('Base URL must have a valid hostname');
    }
  } catch {
    errors.push(`Invalid base URL format: ${baseUrl}`);
  }

  return errors;
}

/**
 * Parses and validates raw configuration
 * @param rawConfig Raw configuration from environment
 * @param environment Target environment for defaults
 * @returns Parsed configuration with validation results
 */
export function parseRawConfig(rawConfig: RawConfig, environment: Environment): {
  environment: Environment;
  debug: boolean;
  timeout: number;
  baseUrl: string;
  maxRetries: number;
  configPath?: string;
  auth: AuthOptions;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Use the provided environment for defaults (environment is determined by ConfigManager)
  const envDefaults = ENVIRONMENT_CONFIGS[environment];

  // Parse debug
  const debug = parseBoolean(rawConfig.POLYV_DEBUG, envDefaults.debug);

  // Parse timeout with validation
  const timeout = parseInteger(
    rawConfig.POLYV_TIMEOUT,
    envDefaults.timeout,
    FIELD_CONSTRAINTS.timeout.min,
    FIELD_CONSTRAINTS.timeout.max
  );

  if (rawConfig.POLYV_TIMEOUT && parseInteger(rawConfig.POLYV_TIMEOUT, -1) === -1) {
    warnings.push(`Invalid timeout value '${rawConfig.POLYV_TIMEOUT}', using default: ${envDefaults.timeout}ms`);
  }

  // Parse base URL with validation
  const baseUrl = parseUrl(rawConfig.POLYV_BASE_URL, envDefaults.baseUrl);
  if (rawConfig.POLYV_BASE_URL && baseUrl === envDefaults.baseUrl) {
    warnings.push(`Invalid base URL '${rawConfig.POLYV_BASE_URL}', using default: ${envDefaults.baseUrl}`);
  }

  // Parse max retries with validation
  const maxRetries = parseInteger(
    rawConfig.POLYV_MAX_RETRIES,
    envDefaults.maxRetries,
    FIELD_CONSTRAINTS.maxRetries.min,
    FIELD_CONSTRAINTS.maxRetries.max
  );

  if (rawConfig.POLYV_MAX_RETRIES && parseInteger(rawConfig.POLYV_MAX_RETRIES, -1) === -1) {
    warnings.push(`Invalid max retries value '${rawConfig.POLYV_MAX_RETRIES}', using default: ${envDefaults.maxRetries}`);
  }

  // Parse config path
  const configPath = rawConfig.POLYV_CONFIG_PATH?.trim();

  // Parse auth configuration
  const auth: AuthOptions = {};
  
  if (rawConfig.POLYV_APP_ID?.trim()) {
    auth.appId = rawConfig.POLYV_APP_ID.trim();
  }
  
  if (rawConfig.POLYV_APP_SECRET?.trim()) {
    auth.appSecret = rawConfig.POLYV_APP_SECRET.trim();
  }
  
  if (rawConfig.POLYV_USER_ID?.trim()) {
    auth.userId = rawConfig.POLYV_USER_ID.trim();
  }

  const result: {
    environment: Environment;
    debug: boolean;
    timeout: number;
    baseUrl: string;
    maxRetries: number;
    configPath?: string;
    auth: AuthOptions;
    errors: string[];
    warnings: string[];
  } = {
    environment,
    debug,
    timeout,
    baseUrl,
    maxRetries,
    auth,
    errors,
    warnings,
  };

  if (configPath) {
    result.configPath = configPath;
  }

  return result;
}

/**
 * Validates complete application configuration
 * @param config Application configuration to validate
 * @returns Validation result
 */
export function validateAppConfig(config: AppConfig): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];

  // Validate authentication
  const authValidation = validateAuth(config.auth);
  errors.push(...authValidation.errors);
  missingFields.push(...authValidation.missingFields);

  // Validate environment
  const envErrors = validateEnvironmentConfig(config.environment);
  errors.push(...envErrors);

  // Validate timeout
  const timeoutErrors = validateTimeout(config.timeout);
  errors.push(...timeoutErrors);

  // Validate max retries
  const retriesErrors = validateMaxRetries(config.maxRetries);
  errors.push(...retriesErrors);

  // Validate base URL
  const urlErrors = validateBaseUrl(config.baseUrl);
  errors.push(...urlErrors);

  // Environment-specific warnings
  if (config.environment === 'development' && !config.debug) {
    warnings.push('Debug mode is disabled in development environment. Consider enabling it for better development experience.');
  }

  if (config.environment === 'production' && config.debug) {
    warnings.push('Debug mode is enabled in production environment. Consider disabling it for better performance.');
  }

  if (config.timeout < 5000 && config.environment === 'production') {
    warnings.push('Timeout is set to less than 5 seconds in production. This might cause issues with slower network connections.');
  }

  return {
    isValid: errors.length === 0 && missingFields.length === 0,
    errors,
    warnings,
    missingFields,
  };
}

/**
 * Creates user-friendly error message for configuration validation
 * @param validation Validation result
 * @returns Formatted error message
 */
export function createConfigErrorMessage(validation: ConfigValidationResult): string {
  if (validation.isValid) {
    return 'Configuration is valid';
  }

  let message = 'Configuration validation failed:\n\n';

  if (validation.missingFields.length > 0) {
    message += '❌ Missing required fields:\n';
    validation.missingFields.forEach(field => {
      message += `  • ${field}\n`;
    });
    message += '\n';
  }

  if (validation.errors.length > 0) {
    message += '❌ Configuration errors:\n';
    validation.errors.forEach(error => {
      message += `  • ${error}\n`;
    });
    message += '\n';
  }

  if (validation.warnings.length > 0) {
    message += '⚠️  Configuration warnings:\n';
    validation.warnings.forEach(warning => {
      message += `  • ${warning}\n`;
    });
    message += '\n';
  }

  message += 'Please fix the above issues before proceeding.\n';
  message += '\nFor help with configuration, run: polyv-live-cli --help';

  return message.trim();
}

/**
 * Applies default values to partial configuration
 * @param partial Partial configuration
 * @param environment Target environment
 * @returns Configuration with defaults applied
 */
export function applyDefaults(
  partial: Partial<Omit<AppConfig, 'auth'>> & { auth: AuthOptions },
  environment: Environment
): Omit<AppConfig, 'auth'> & { auth: AuthOptions } {
  const envDefaults = ENVIRONMENT_CONFIGS[environment];

  const result: Omit<AppConfig, 'auth'> & { auth: AuthOptions } = {
    environment: partial.environment || environment,
    debug: partial.debug !== undefined ? partial.debug : envDefaults.debug,
    timeout: partial.timeout || envDefaults.timeout,
    baseUrl: partial.baseUrl || envDefaults.baseUrl,
    maxRetries: partial.maxRetries !== undefined ? partial.maxRetries : envDefaults.maxRetries,
    auth: partial.auth,
  };

  if (partial.configPath) {
    result.configPath = partial.configPath;
  }

  return result;
}