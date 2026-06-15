/**
 * @fileoverview Unit tests for global configuration management
 * @author Development Team
 * @since 1.1.0
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Mock fs module
jest.mock('fs');
jest.mock('os', () => ({
  homedir: jest.fn(() => '/home/test')
}));

import { GlobalConfigManager, globalConfig } from './global';

const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;
const mockWriteFileSync = writeFileSync as jest.MockedFunction<typeof writeFileSync>;
const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockMkdirSync = mkdirSync as jest.MockedFunction<typeof mkdirSync>;
const mockHomedir = homedir as jest.MockedFunction<typeof homedir>;

describe('GlobalConfigManager', () => {
  let configManager: GlobalConfigManager;
  let mockConfigDir: string;
  let mockConfigFile: string;
  let consoleSpy: jest.SpyInstance;

  beforeAll(() => {
    // Setup mocks before any tests run
    mockHomedir.mockReturnValue('/home/test');
  });

  beforeEach(() => {
    // Setup mocks before creating the instance
    mockHomedir.mockReturnValue('/home/test');
    mockConfigDir = '/home/test/.polyv-live-cli';
    mockConfigFile = join(mockConfigDir, 'config.json');
    
    configManager = new GlobalConfigManager();
    
    // Mock console methods
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('constructor', () => {
    it('should set correct config directory and file paths', () => {
      expect(configManager.getConfigPath()).toBe(mockConfigFile);
    });
  });

  describe('load', () => {
    it('should return empty config if file does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      const config = configManager.load();

      expect(config).toEqual({});
      expect(mockExistsSync).toHaveBeenCalledWith(mockConfigFile);
    });

    it('should load and parse existing config file', () => {
      const mockConfig = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id'
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const config = configManager.load();

      expect(config).toEqual(mockConfig);
      expect(mockReadFileSync).toHaveBeenCalledWith(mockConfigFile, 'utf-8');
    });

    it('should return empty config and warn on parse error', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('invalid json');

      const config = configManager.load();

      expect(config).toEqual({});
      expect(console.warn).toHaveBeenCalledWith('⚠️  Failed to load config file, using empty config');
    });
  });

  describe('save', () => {
    it('should create config directory if it does not exist', () => {
      const mockConfig = { appId: 'test-app-id' };
      
      mockExistsSync.mockReturnValue(false);
      configManager.load = jest.fn().mockReturnValue({});

      configManager.save(mockConfig);

      expect(mockMkdirSync).toHaveBeenCalledWith(mockConfigDir, { recursive: true });
    });

    it('should merge with existing config and save', () => {
      const existingConfig = { appId: 'existing-id', userId: 'existing-user' };
      const newConfig = { appSecret: 'new-secret' };
      const expectedConfig = { appId: 'existing-id', userId: 'existing-user', appSecret: 'new-secret' };

      mockExistsSync.mockReturnValue(true);
      configManager.load = jest.fn().mockReturnValue(existingConfig);

      configManager.save(newConfig);

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        mockConfigFile,
        JSON.stringify(expectedConfig, null, 2)
      );
      expect(console.log).toHaveBeenCalledWith('✅ Configuration saved successfully');
    });

    it('should remove undefined values', () => {
      const mockConfig = { appId: 'test-id', userId: 'test-user' };
      const expectedConfig = { appId: 'test-id', userId: 'test-user' };

      configManager.load = jest.fn().mockReturnValue({});

      configManager.save({ ...mockConfig, appSecret: undefined } as any);

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        mockConfigFile,
        JSON.stringify(expectedConfig, null, 2)
      );
    });

    it('should throw error on save failure', () => {
      const mockConfig = { appId: 'test-id' };
      const saveError = new Error('Permission denied');

      configManager.load = jest.fn().mockReturnValue({});
      mockWriteFileSync.mockImplementation(() => {
        throw saveError;
      });

      expect(() => configManager.save(mockConfig)).toThrow('Failed to save configuration: Permission denied');
    });
  });

  describe('get', () => {
    it('should get specific config value', () => {
      const mockConfig = { appId: 'test-id', appSecret: 'test-secret' };
      configManager.load = jest.fn().mockReturnValue(mockConfig);

      const appId = configManager.get('appId');

      expect(appId).toBe('test-id');
    });

    it('should return undefined for non-existent key', () => {
      configManager.load = jest.fn().mockReturnValue({});

      const appId = configManager.get('appId');

      expect(appId).toBeUndefined();
    });
  });

  describe('set', () => {
    it('should set specific config value', () => {
      const existingConfig = { userId: 'existing-user' };
      const expectedConfig = { userId: 'existing-user', appId: 'new-app-id' };

      configManager.load = jest.fn().mockReturnValue(existingConfig);
      configManager.save = jest.fn();

      configManager.set('appId', 'new-app-id');

      expect(configManager.save).toHaveBeenCalledWith(expectedConfig);
    });
  });

  describe('unset', () => {
    it('should remove specific config value', () => {
      const existingConfig = { appId: 'test-id', userId: 'test-user' };
      const expectedConfig = { userId: 'test-user' };

      configManager.load = jest.fn().mockReturnValue(existingConfig);
      configManager.save = jest.fn();

      configManager.unset('appId');

      expect(configManager.save).toHaveBeenCalledWith(expectedConfig);
    });
  });

  describe('clear', () => {
    it('should clear all configuration', () => {
      configManager.save = jest.fn();

      configManager.clear();

      expect(configManager.save).toHaveBeenCalledWith({});
      expect(console.log).toHaveBeenCalledWith('✅ Configuration cleared');
    });
  });

  describe('exists', () => {
    it('should return true if config file exists', () => {
      mockExistsSync.mockReturnValue(true);

      const exists = configManager.exists();

      expect(exists).toBe(true);
      expect(mockExistsSync).toHaveBeenCalledWith(mockConfigFile);
    });

    it('should return false if config file does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      const exists = configManager.exists();

      expect(exists).toBe(false);
    });
  });

  describe('validate', () => {
    it('should validate complete configuration', () => {
      const validConfig = { appId: 'test-id', appSecret: 'test-secret' };

      const validation = configManager.validate(validConfig);

      expect(validation.isValid).toBe(true);
      expect(validation.missingKeys).toEqual([]);
    });

    it('should identify missing required keys', () => {
      const incompleteConfig = { appId: 'test-id' };

      const validation = configManager.validate(incompleteConfig);

      expect(validation.isValid).toBe(false);
      expect(validation.missingKeys).toEqual(['appSecret']);
    });

    it('should validate loaded configuration when no config provided', () => {
      const loadedConfig = { appSecret: 'test-secret' };
      configManager.load = jest.fn().mockReturnValue(loadedConfig);

      const validation = configManager.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.missingKeys).toEqual(['appId']);
    });
  });

  describe('singleton instance', () => {
    it('should export singleton globalConfig instance', () => {
      expect(globalConfig).toBeInstanceOf(GlobalConfigManager);
    });
  });
});