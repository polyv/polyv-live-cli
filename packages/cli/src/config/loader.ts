/**
 * Configuration file loading functionality
 */

import { config as dotenvConfig } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { Environment, RawConfig, ENV_FILE_PATTERNS } from '../types/config';

/**
 * Environment file loading result
 */
export interface EnvFileResult {
  /** Path to the loaded file */
  path: string;
  /** Whether the file was successfully loaded */
  loaded: boolean;
  /** Error message if loading failed */
  error?: string;
}

/**
 * Environment file loading options
 */
export interface EnvFileOptions {
  /** Base directory to search for .env files */
  baseDir?: string;
  /** Override specific files to load */
  override?: boolean;
  /** Additional environment files to load */
  additionalFiles?: string[];
}

/**
 * Gets the list of environment files to load based on environment and options
 * @param environment Current environment
 * @param options Loading options
 * @returns Array of file paths in loading order (lowest to highest priority)
 */
export function getEnvFilePaths(environment: Environment, options: EnvFileOptions = {}): string[] {
  const baseDir = options.baseDir || process.cwd();
  const files: string[] = [];

  if (options.override && options.additionalFiles) {
    // If override is true, only use additional files
    return options.additionalFiles.map(file => resolve(baseDir, file));
  }

  // Standard loading order (lowest to highest priority)
  files.push(resolve(baseDir, ENV_FILE_PATTERNS.base)); // .env
  files.push(resolve(baseDir, ENV_FILE_PATTERNS.environment(environment))); // .env.{environment}
  files.push(resolve(baseDir, ENV_FILE_PATTERNS.local)); // .env.local
  files.push(resolve(baseDir, ENV_FILE_PATTERNS.environmentLocal(environment))); // .env.{environment}.local

  // Add additional files at the end (highest priority)
  if (options.additionalFiles) {
    files.push(...options.additionalFiles.map(file => resolve(baseDir, file)));
  }

  return files;
}

/**
 * Loads a single environment file
 * @param filePath Path to the environment file
 * @param override Whether to override existing environment variables
 * @returns Loading result
 */
export function loadEnvFile(filePath: string, override: boolean = false): EnvFileResult {
  const result: EnvFileResult = {
    path: filePath,
    loaded: false,
  };

  try {
    if (!existsSync(filePath)) {
      return result;
    }

    const dotenvResult = dotenvConfig({ path: filePath, override });
    
    if (dotenvResult.error) {
      result.error = dotenvResult.error.message;
      return result;
    }

    result.loaded = true;
    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error occurred';
    return result;
  }
}

/**
 * Loads multiple environment files in order
 * @param filePaths Array of file paths to load
 * @param override Whether to override existing environment variables
 * @returns Array of loading results
 */
export function loadEnvFiles(filePaths: string[], override: boolean = false): EnvFileResult[] {
  return filePaths.map(path => loadEnvFile(path, override));
}

/**
 * Loads environment configuration based on environment and options
 * @param environment Current environment
 * @param options Loading options
 * @param override Whether to override existing environment variables
 * @returns Loading results for all attempted files
 */
export function loadEnvironmentConfig(environment: Environment, options: EnvFileOptions = {}, override: boolean = false): EnvFileResult[] {
  const filePaths = getEnvFilePaths(environment, options);
  return loadEnvFiles(filePaths, override);
}

/**
 * Extracts raw configuration from environment variables
 * @returns Raw configuration object
 */
export function extractRawConfig(): RawConfig {
  return {
    POLYV_ENVIRONMENT: process.env['POLYV_ENVIRONMENT'],
    POLYV_DEBUG: process.env['POLYV_DEBUG'],
    POLYV_TIMEOUT: process.env['POLYV_TIMEOUT'],
    POLYV_BASE_URL: process.env['POLYV_BASE_URL'],
    POLYV_MAX_RETRIES: process.env['POLYV_MAX_RETRIES'],
    POLYV_CONFIG_PATH: process.env['POLYV_CONFIG_PATH'],
    POLYV_APP_ID: process.env['POLYV_APP_ID'],
    POLYV_APP_SECRET: process.env['POLYV_APP_SECRET'],
    POLYV_USER_ID: process.env['POLYV_USER_ID'],
  };
}

/**
 * Validates environment name
 * @param env Environment string to validate
 * @returns Validated environment or undefined if invalid
 */
export function validateEnvironment(env: string | undefined): Environment | undefined {
  if (!env) return undefined;
  
  const normalizedEnv = env.toLowerCase().trim();
  if (normalizedEnv === 'development' || normalizedEnv === 'dev') {
    return 'development';
  }
  if (normalizedEnv === 'production' || normalizedEnv === 'prod') {
    return 'production';
  }
  if (normalizedEnv === 'test') {
    return 'test';
  }
  
  return undefined;
}

/**
 * Parses boolean value from string
 * @param value String value to parse
 * @param defaultValue Default value if parsing fails
 * @returns Parsed boolean value
 */
export function parseBoolean(value: string | undefined, defaultValue: boolean = false): boolean {
  if (!value) return defaultValue;
  
  const normalized = value.toLowerCase().trim();
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
}

/**
 * Parses integer value from string
 * @param value String value to parse
 * @param defaultValue Default value if parsing fails
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @returns Parsed integer value
 */
export function parseInteger(
  value: string | undefined,
  defaultValue: number,
  min?: number,
  max?: number
): number {
  if (!value) return defaultValue;
  
  const parsed = parseInt(value.trim(), 10);
  if (isNaN(parsed)) return defaultValue;
  
  if (min !== undefined && parsed < min) return defaultValue;
  if (max !== undefined && parsed > max) return defaultValue;
  
  return parsed;
}

/**
 * Parses URL value from string
 * @param value String value to parse
 * @param defaultValue Default value if parsing fails
 * @returns Parsed URL string or default
 */
export function parseUrl(value: string | undefined, defaultValue: string): string {
  if (!value) return defaultValue;
  
  const trimmed = value.trim();
  if (!trimmed) return defaultValue;
  
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    return defaultValue;
  }
}

/**
 * Finds custom configuration file path
 * @param configPath Custom config path from options
 * @param baseDir Base directory to search in
 * @returns Resolved config file path or undefined if not found
 */
export function findConfigFile(configPath?: string, baseDir: string = process.cwd()): string | undefined {
  if (!configPath) return undefined;
  
  const resolvedPath = resolve(baseDir, configPath);
  return existsSync(resolvedPath) ? resolvedPath : undefined;
}