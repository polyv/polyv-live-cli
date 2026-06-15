/**
 * Unit tests for configuration loader
 */

import { 
  getEnvFilePaths, 
  loadEnvFile, 
  extractRawConfig, 
  validateEnvironment, 
  parseBoolean, 
  parseInteger, 
  parseUrl,
  findConfigFile
} from './loader';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Mock fs module
jest.mock('fs');
jest.mock('dotenv');

const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;

describe('Configuration Loader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear environment variables
    delete process.env['POLYV_ENVIRONMENT'];
    delete process.env['POLYV_DEBUG'];
    delete process.env['POLYV_TIMEOUT'];
    delete process.env['POLYV_BASE_URL'];
    delete process.env['POLYV_MAX_RETRIES'];
    delete process.env['POLYV_CONFIG_PATH'];
    delete process.env['POLYV_APP_ID'];
    delete process.env['POLYV_APP_SECRET'];
    delete process.env['POLYV_USER_ID'];
  });

  describe('getEnvFilePaths', () => {
    it('should return correct file paths for development environment', () => {
      const paths = getEnvFilePaths('development', { baseDir: '/test' });
      
      expect(paths).toEqual([
        resolve('/test', '.env'),
        resolve('/test', '.env.development'),
        resolve('/test', '.env.local'),
        resolve('/test', '.env.development.local'),
      ]);
    });

    it('should return correct file paths for production environment', () => {
      const paths = getEnvFilePaths('production', { baseDir: '/test' });
      
      expect(paths).toEqual([
        resolve('/test', '.env'),
        resolve('/test', '.env.production'),
        resolve('/test', '.env.local'),
        resolve('/test', '.env.production.local'),
      ]);
    });

    it('should include additional files when provided', () => {
      const paths = getEnvFilePaths('development', { 
        baseDir: '/test',
        additionalFiles: ['.env.custom', '.env.override']
      });
      
      expect(paths).toHaveLength(6);
      expect(paths).toContain(resolve('/test', '.env.custom'));
      expect(paths).toContain(resolve('/test', '.env.override'));
    });

    it('should use only additional files when override is true', () => {
      const paths = getEnvFilePaths('development', { 
        baseDir: '/test',
        override: true,
        additionalFiles: ['.env.custom']
      });
      
      expect(paths).toEqual([resolve('/test', '.env.custom')]);
    });
  });

  describe('loadEnvFile', () => {
    it('should return not loaded when file does not exist', () => {
      mockExistsSync.mockReturnValue(false);
      
      const result = loadEnvFile('/test/.env');
      
      expect(result).toEqual({
        path: '/test/.env',
        loaded: false,
      });
    });

    it('should handle dotenv loading errors', () => {
      mockExistsSync.mockReturnValue(true);
      
      const mockDotenv = require('dotenv');
      mockDotenv.config.mockReturnValue({ error: new Error('Parse error') });
      
      const result = loadEnvFile('/test/.env');
      
      expect(result).toEqual({
        path: '/test/.env',
        loaded: false,
        error: 'Parse error'
      });
    });
  });

  describe('extractRawConfig', () => {
    it('should extract all environment variables', () => {
      process.env['POLYV_ENVIRONMENT'] = 'development';
      process.env['POLYV_DEBUG'] = 'true';
      process.env['POLYV_TIMEOUT'] = '5000';
      process.env['POLYV_BASE_URL'] = 'https://api-dev.polyv.net';
      process.env['POLYV_MAX_RETRIES'] = '2';
      process.env['POLYV_CONFIG_PATH'] = '/custom/config';
      process.env['POLYV_APP_ID'] = 'test-app-id';
      process.env['POLYV_APP_SECRET'] = 'test-app-secret';
      process.env['POLYV_USER_ID'] = '12345';

      const config = extractRawConfig();

      expect(config).toEqual({
        POLYV_ENVIRONMENT: 'development',
        POLYV_DEBUG: 'true',
        POLYV_TIMEOUT: '5000',
        POLYV_BASE_URL: 'https://api-dev.polyv.net',
        POLYV_MAX_RETRIES: '2',
        POLYV_CONFIG_PATH: '/custom/config',
        POLYV_APP_ID: 'test-app-id',
        POLYV_APP_SECRET: 'test-app-secret',
        POLYV_USER_ID: '12345',
      });
    });

    it('should handle missing environment variables', () => {
      const config = extractRawConfig();

      expect(config).toEqual({
        POLYV_ENVIRONMENT: undefined,
        POLYV_DEBUG: undefined,
        POLYV_TIMEOUT: undefined,
        POLYV_BASE_URL: undefined,
        POLYV_MAX_RETRIES: undefined,
        POLYV_CONFIG_PATH: undefined,
        POLYV_APP_ID: undefined,
        POLYV_APP_SECRET: undefined,
        POLYV_USER_ID: undefined,
      });
    });
  });

  describe('validateEnvironment', () => {
    it('should validate development environment', () => {
      expect(validateEnvironment('development')).toBe('development');
      expect(validateEnvironment('dev')).toBe('development');
      expect(validateEnvironment('DEVELOPMENT')).toBe('development');
      expect(validateEnvironment(' dev ')).toBe('development');
    });

    it('should validate production environment', () => {
      expect(validateEnvironment('production')).toBe('production');
      expect(validateEnvironment('prod')).toBe('production');
      expect(validateEnvironment('PRODUCTION')).toBe('production');
      expect(validateEnvironment(' prod ')).toBe('production');
    });

    it('should validate test environment', () => {
      expect(validateEnvironment('test')).toBe('test');
      expect(validateEnvironment('TEST')).toBe('test');
      expect(validateEnvironment(' test ')).toBe('test');
    });

    it('should return undefined for invalid environments', () => {
      expect(validateEnvironment('invalid')).toBeUndefined();
      expect(validateEnvironment('staging')).toBeUndefined();
      expect(validateEnvironment('')).toBeUndefined();
      expect(validateEnvironment(undefined)).toBeUndefined();
    });
  });

  describe('parseBoolean', () => {
    it('should parse true values', () => {
      expect(parseBoolean('true')).toBe(true);
      expect(parseBoolean('TRUE')).toBe(true);
      expect(parseBoolean('1')).toBe(true);
      expect(parseBoolean('yes')).toBe(true);
      expect(parseBoolean('on')).toBe(true);
      expect(parseBoolean(' true ')).toBe(true);
    });

    it('should parse false values', () => {
      expect(parseBoolean('false')).toBe(false);
      expect(parseBoolean('FALSE')).toBe(false);
      expect(parseBoolean('0')).toBe(false);
      expect(parseBoolean('no')).toBe(false);
      expect(parseBoolean('off')).toBe(false);
      expect(parseBoolean('invalid')).toBe(false);
    });

    it('should use default value for undefined input', () => {
      expect(parseBoolean(undefined)).toBe(false);
      expect(parseBoolean(undefined, true)).toBe(true);
      expect(parseBoolean('')).toBe(false);
    });
  });

  describe('parseInteger', () => {
    it('should parse valid integers', () => {
      expect(parseInteger('123', 0)).toBe(123);
      expect(parseInteger('0', 100)).toBe(0);
      expect(parseInteger('-5', 100)).toBe(-5);
      expect(parseInteger(' 42 ', 0)).toBe(42);
    });

    it('should return default for invalid values', () => {
      expect(parseInteger('invalid', 100)).toBe(100);
      expect(parseInteger('12.5', 100)).toBe(12); // parseInt('12.5') returns 12
      expect(parseInteger('', 100)).toBe(100);
      expect(parseInteger(undefined, 100)).toBe(100);
    });

    it('should enforce minimum constraints', () => {
      expect(parseInteger('5', 100, 10)).toBe(100);
      expect(parseInteger('15', 100, 10)).toBe(15);
    });

    it('should enforce maximum constraints', () => {
      expect(parseInteger('50', 100, 0, 30)).toBe(100);
      expect(parseInteger('25', 100, 0, 30)).toBe(25);
    });
  });

  describe('parseUrl', () => {
    it('should parse valid URLs', () => {
      expect(parseUrl('https://api.example.com', 'default')).toBe('https://api.example.com');
      expect(parseUrl('http://localhost:3000', 'default')).toBe('http://localhost:3000');
      expect(parseUrl(' https://api.test.com ', 'default')).toBe('https://api.test.com');
    });

    it('should return default for invalid URLs', () => {
      expect(parseUrl('invalid-url', 'default')).toBe('default');
      expect(parseUrl('', 'default')).toBe('default');
      expect(parseUrl(undefined, 'default')).toBe('default');
      expect(parseUrl('not-a-url', 'default')).toBe('default');
    });
  });

  describe('findConfigFile', () => {
    it('should find existing config file', () => {
      mockExistsSync.mockReturnValue(true);
      
      const result = findConfigFile('custom.config.js', '/test');
      
      expect(result).toBe(resolve('/test', 'custom.config.js'));
      expect(mockExistsSync).toHaveBeenCalledWith(resolve('/test', 'custom.config.js'));
    });

    it('should return undefined for non-existent file', () => {
      mockExistsSync.mockReturnValue(false);
      
      const result = findConfigFile('missing.config.js', '/test');
      
      expect(result).toBeUndefined();
    });

    it('should return undefined when no config path provided', () => {
      const result = findConfigFile(undefined, '/test');
      
      expect(result).toBeUndefined();
      expect(mockExistsSync).not.toHaveBeenCalled();
    });
  });
});