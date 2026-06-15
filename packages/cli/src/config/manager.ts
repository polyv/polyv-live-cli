/**
 * Configuration management with priority handling and merging
 */

import { AppConfig, ConfigResult, ConfigOptions, Environment, ConfigSources } from '../types/config';
import { AuthConfig, AuthOptions } from '../types/auth';
import { ConfigurationError } from '../utils/errors';
import { loadEnvironmentConfig, extractRawConfig, parseInteger, parseUrl, validateEnvironment, findConfigFile } from './loader';
import { parseRawConfig, validateAppConfig, createConfigErrorMessage, applyDefaults } from './validator';
import { loadAuthFromCLI, loadAuthFromEnv } from './auth';
import { globalConfig } from './global';

/**
 * Configuration manager class for handling all configuration operations
 */
export class ConfigManager {
  private config: AppConfig | null = null;
  private sources: ConfigSources | null = null;
  private loadedEnvFiles: string[] = [];

  /**
   * Loads configuration from all sources with proper priority handling
   * @param options Configuration loading options
   * @returns Complete configuration result
   */
  async load(options: ConfigOptions = {}): Promise<ConfigResult> {
    // Reset state
    this.config = null;
    this.sources = null;
    this.loadedEnvFiles = [];

    // Step 1: Determine environment from CLI options first
    let { environment, source: environmentSource } = this.determineEnvironment(options);

    // Step 2: If environment comes from CLI options, load environment files with override
    // If environment is default, load base files first to check for POLYV_ENVIRONMENT
    const envFileOptions: import('./loader').EnvFileOptions = {
      baseDir: process.cwd(),
    };
    
    if (options.envFiles) {
      envFileOptions.additionalFiles = options.envFiles;
    }
    
    if (options.skipEnvFile) {
      envFileOptions.override = options.skipEnvFile;
    }

    // Save current environment variables that were set before loading files
    const originalEnvVars: Record<string, string | undefined> = {};
    const configEnvVars = [
      'POLYV_ENVIRONMENT', 'POLYV_DEBUG', 'POLYV_TIMEOUT', 'POLYV_BASE_URL',
      'POLYV_MAX_RETRIES', 'POLYV_CONFIG_PATH', 'POLYV_APP_ID', 'POLYV_APP_SECRET', 'POLYV_USER_ID'
    ];
    
    for (const varName of configEnvVars) {
      originalEnvVars[varName] = process.env[varName];
    }

    if (environmentSource === 'default') {
      // Load base files to check for environment setting
      loadEnvironmentConfig('production', envFileOptions, true);
      // Re-determine environment after loading base files
      const newEnvResult = this.determineEnvironment(options);
      environment = newEnvResult.environment;
      environmentSource = newEnvResult.source;
    }
    
    // Step 3: Load all environment files with override to ensure proper file priority
    const envFileResults = loadEnvironmentConfig(environment, envFileOptions, true);
    
    // Step 4: Restore original environment variables to maintain env var > file priority
    for (const varName of configEnvVars) {
      if (originalEnvVars[varName] !== undefined) {
        process.env[varName] = originalEnvVars[varName];
      }
    }

    // Track loaded files
    this.loadedEnvFiles = envFileResults
      .filter(result => result.loaded)
      .map(result => result.path);

    // Step 3: Extract raw configuration from environment
    const rawConfig = extractRawConfig();

    // Step 4: Parse raw configuration using determined environment
    const parsedConfig = parseRawConfig(rawConfig, environment);

    // Step 5: Load CLI configuration
    const cliConfig = this.loadCliConfig(options.cliOptions || {});
    
    // Check for CLI validation errors
    if (cliConfig.errors.length > 0) {
      const errorMessage = `CLI configuration errors:\n${cliConfig.errors.map(e => `  • ${e}`).join('\n')}`;
      throw new ConfigurationError(errorMessage);
    }

    // Step 6: Merge configurations with priority
    const mergedConfig = this.mergeConfigurations(
      parsedConfig,
      cliConfig,
      environment,
      environmentSource,
      options.configPath
    );

    // Step 7: Apply defaults
    const configWithDefaults = applyDefaults(mergedConfig.config, environment);

    // Step 8: Create final auth config
    const authConfig = this.createAuthConfig(configWithDefaults.auth);

    // Step 9: Create final app config
    const finalConfig: AppConfig = {
      ...configWithDefaults,
      auth: authConfig,
    };

    // Step 10: Validate final configuration
    const validation = validateAppConfig(finalConfig);

    if (!validation.isValid) {
      const errorMessage = createConfigErrorMessage(validation);
      throw new ConfigurationError(errorMessage);
    }

    // Store results
    this.config = finalConfig;
    this.sources = mergedConfig.sources;

    return {
      config: finalConfig,
      sources: mergedConfig.sources,
      validation,
      loadedEnvFiles: this.loadedEnvFiles,
    };
  }

  /**
   * Gets the current loaded configuration
   * @returns Current configuration or null if not loaded
   */
  getConfig(): AppConfig | null {
    return this.config;
  }

  /**
   * Gets configuration sources information
   * @returns Configuration sources or null if not loaded
   */
  getSources(): ConfigSources | null {
    return this.sources;
  }

  /**
   * Gets list of loaded environment files
   * @returns Array of loaded environment file paths
   */
  getLoadedEnvFiles(): string[] {
    return [...this.loadedEnvFiles];
  }

  /**
   * Reloads configuration (useful for development)
   * @param options Configuration loading options
   * @returns Updated configuration result
   */
  async reload(options: ConfigOptions = {}): Promise<ConfigResult> {
    return this.load(options);
  }

  /**
   * Determines the environment from CLI options or environment variables
   * @param options Configuration options
   * @returns Determined environment and its source
   */
  private determineEnvironment(options: ConfigOptions): { environment: Environment; source: 'cli' | 'env' | 'default' } {
    // CLI takes precedence - check both top-level options and cliOptions
    if (options.environment) {
      return { environment: options.environment, source: 'cli' };
    }
    
    // Check CLI options for environment
    if (options.cliOptions && typeof options.cliOptions['environment'] === 'string') {
      const { validateEnvironment } = require('./loader');
      const env = validateEnvironment(options.cliOptions['environment']);
      if (env) {
        return { environment: env, source: 'cli' };
      }
    }

    // Check environment variable
    const { validateEnvironment } = require('./loader');
    const envFromVar = validateEnvironment(process.env['POLYV_ENVIRONMENT']);
    if (envFromVar) {
      return { environment: envFromVar, source: 'env' };
    }

    // Default to production
    return { environment: 'production', source: 'default' };
  }

  /**
   * Loads configuration from CLI options
   * @param cliOptions CLI options from Commander.js
   * @returns CLI configuration with validation errors
   */
  private loadCliConfig(cliOptions: Record<string, unknown>): {
    environment?: Environment;
    debug?: boolean;
    timeout?: number;
    baseUrl?: string;
    maxRetries?: number;
    configPath?: string;
    auth: AuthOptions;
    errors: string[];
  } {
    const errors: string[] = [];
    const config: ReturnType<typeof this.loadCliConfig> = {
      auth: loadAuthFromCLI(cliOptions),
      errors,
    };

    // Parse CLI options
    if (typeof cliOptions['environment'] === 'string') {
      const env = validateEnvironment(cliOptions['environment']);
      if (env) config.environment = env;
    }

    if (typeof cliOptions['debug'] === 'boolean') {
      config.debug = cliOptions['debug'];
    }

    if (typeof cliOptions['timeout'] === 'string') {
      const timeout = parseInteger(cliOptions['timeout'], 0, 1000, 300000);
      if (timeout > 0) {
        config.timeout = timeout;
      } else {
        errors.push(`Invalid timeout value '${cliOptions['timeout']}'. Must be between 1000 and 300000 milliseconds.`);
      }
    }

    if (typeof cliOptions['baseUrl'] === 'string') {
      const baseUrl = parseUrl(cliOptions['baseUrl'], '');
      if (baseUrl) config.baseUrl = baseUrl;
    }

    if (typeof cliOptions['maxRetries'] === 'string') {
      const maxRetries = parseInteger(cliOptions['maxRetries'], -1, 0, 10);
      if (maxRetries >= 0) {
        config.maxRetries = maxRetries;
      } else {
        errors.push(`Invalid maxRetries value '${cliOptions['maxRetries']}'. Must be between 0 and 10.`);
      }
    }

    if (typeof cliOptions['config'] === 'string') {
      config.configPath = cliOptions['config'];
    }

    return config;
  }

  /**
   * Merges configurations from different sources with proper priority
   * @param parsedConfig Parsed configuration from environment
   * @param cliConfig Configuration from CLI
   * @param environment Target environment
   * @param environmentSource Source of the environment setting
   * @param configPath Custom config path
   * @returns Merged configuration with sources
   */
  private mergeConfigurations(
    parsedConfig: ReturnType<typeof parseRawConfig>,
    cliConfig: ReturnType<typeof this.loadCliConfig>,
    environment: Environment,
    environmentSource: 'cli' | 'env' | 'default',
    configPath?: string
  ): {
    config: Partial<Omit<AppConfig, 'auth'>> & { auth: AuthOptions };
    sources: ConfigSources;
  } {
    const sources: ConfigSources = {
      environment: environmentSource,
      debug: 'default',
      timeout: 'default',
      baseUrl: 'default',
      maxRetries: 'default',
    };

    // Start with parsed config (from env files and env vars)
    const config: {
      environment: Environment;
      debug: boolean;
      timeout: number;
      baseUrl: string;
      maxRetries: number;
      configPath?: string;
      auth: AuthOptions;
    } = {
      environment: environment, // Use the determined environment, not parsed one
      debug: parsedConfig.debug,
      timeout: parsedConfig.timeout,
      baseUrl: parsedConfig.baseUrl,
      maxRetries: parsedConfig.maxRetries,
      auth: { ...parsedConfig.auth },
    };

    if (parsedConfig.configPath) {
      config.configPath = parsedConfig.configPath;
    }

    // Update sources for parsed config (environment source already set above)
    if (process.env['POLYV_DEBUG']) {
      sources.debug = 'env';
    }
    if (process.env['POLYV_TIMEOUT']) {
      sources.timeout = 'env';
    }
    if (process.env['POLYV_BASE_URL']) {
      sources.baseUrl = 'env';
    }
    if (process.env['POLYV_MAX_RETRIES']) {
      sources.maxRetries = 'env';
    }
    if (process.env['POLYV_CONFIG_PATH']) {
      sources.configPath = 'env';
    }

    // Override with CLI config (highest priority)
    // Note: environment is already set from determineEnvironment() and shouldn't be overridden here

    if (cliConfig.debug !== undefined) {
      config.debug = cliConfig.debug;
      sources.debug = 'cli';
    }

    if (cliConfig.timeout !== undefined) {
      config.timeout = cliConfig.timeout;
      sources.timeout = 'cli';
    }

    if (cliConfig.baseUrl !== undefined) {
      config.baseUrl = cliConfig.baseUrl;
      sources.baseUrl = 'cli';
    }

    if (cliConfig.maxRetries !== undefined) {
      config.maxRetries = cliConfig.maxRetries;
      sources.maxRetries = 'cli';
    }

    if (cliConfig.configPath !== undefined) {
      config.configPath = cliConfig.configPath;
      sources.configPath = 'cli';
    }

    // Merge auth configurations with priority: CLI > Environment Variables > Global Config
    const envAuth = loadAuthFromEnv();
    const globalConfigAuth = globalConfig.load();
    
    // Priority order: CLI > Env > Global Config
    // Note: We need to distinguish between "not provided" and "explicitly set to empty string"
    // Environment variables that are explicitly set to empty strings should take precedence over global config
    if (cliConfig.auth.appId) {
      config.auth.appId = cliConfig.auth.appId;
    } else if (envAuth.appId !== undefined) {
      config.auth.appId = envAuth.appId;
    } else if (globalConfigAuth.appId) {
      config.auth.appId = globalConfigAuth.appId;
    }

    if (cliConfig.auth.appSecret) {
      config.auth.appSecret = cliConfig.auth.appSecret;
    } else if (envAuth.appSecret !== undefined) {
      config.auth.appSecret = envAuth.appSecret;
    } else if (globalConfigAuth.appSecret) {
      config.auth.appSecret = globalConfigAuth.appSecret;
    }

    if (cliConfig.auth.userId) {
      config.auth.userId = cliConfig.auth.userId;
    } else if (envAuth.userId !== undefined) {
      config.auth.userId = envAuth.userId;
    } else if (globalConfigAuth.userId) {
      config.auth.userId = globalConfigAuth.userId;
    }

    // Apply global config baseUrl if available
    if (!cliConfig.baseUrl && !process.env['POLYV_BASE_URL'] && globalConfigAuth.baseUrl) {
      config.baseUrl = globalConfigAuth.baseUrl;
      sources.baseUrl = 'global';
    }

    // Handle custom config path
    if (configPath) {
      const foundConfigFile = findConfigFile(configPath);
      if (foundConfigFile) {
        config.configPath = foundConfigFile;
        sources.configPath = 'cli';
      }
    }

    return { config, sources };
  }

  /**
   * Creates final auth configuration
   * @param authOptions Auth options to convert
   * @returns Complete auth configuration
   */
  private createAuthConfig(authOptions: AuthOptions): AuthConfig {
    if (!authOptions.appId || !authOptions.appSecret) {
      throw new ConfigurationError('Auth configuration is incomplete');
    }

    return {
      appId: authOptions.appId,
      appSecret: authOptions.appSecret,
      ...(authOptions.userId && { userId: authOptions.userId }),
    };
  }
}

/**
 * Global configuration manager instance
 */
export const configManager = new ConfigManager();

/**
 * Convenience function to load configuration
 * @param options Configuration loading options
 * @returns Configuration result
 */
export async function loadConfig(options: ConfigOptions = {}): Promise<ConfigResult> {
  return configManager.load(options);
}

/**
 * Convenience function to get current configuration
 * @returns Current configuration or null
 */
export function getConfig(): AppConfig | null {
  return configManager.getConfig();
}

/**
 * Convenience function to reload configuration
 * @param options Configuration loading options
 * @returns Updated configuration result
 */
export async function reloadConfig(options: ConfigOptions = {}): Promise<ConfigResult> {
  return configManager.reload(options);
}