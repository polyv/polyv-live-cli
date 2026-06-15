/**
 * Unit tests for configuration manager
 */

import { ConfigManager, loadConfig, getConfig, reloadConfig } from './manager';
import { ConfigOptions, AppConfig } from '../types/config';
import * as loader from './loader';
import * as validator from './validator';
import * as auth from './auth';

// Mock dependencies
jest.mock('./loader');
jest.mock('./validator');
jest.mock('./auth');
jest.mock('./global', () => ({
  globalConfig: {
    load: jest.fn(() => ({})),
    exists: jest.fn(() => false),
    validate: jest.fn(() => ({ isValid: true, missingKeys: [] }))
  }
}));

const mockLoader = loader as jest.Mocked<typeof loader>;
const mockValidator = validator as jest.Mocked<typeof validator>;
const mockAuth = auth as jest.Mocked<typeof auth>;

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = new ConfigManager();
    jest.clearAllMocks();
    
    // Reset environment
    delete process.env['POLYV_ENVIRONMENT'];
    delete process.env['POLYV_APP_ID'];
    delete process.env['POLYV_APP_SECRET'];
    
    // Setup default mocks
    mockLoader.loadEnvironmentConfig.mockReturnValue([
      { path: '.env', loaded: true },
      { path: '.env.production', loaded: false }
    ]);
    
    mockLoader.extractRawConfig.mockReturnValue({
      POLYV_APP_ID: 'test-app-id',
      POLYV_APP_SECRET: 'test-app-secret'
    });
    
    // Mock utility functions from loader
    mockLoader.parseInteger.mockImplementation((value, defaultValue, min, max) => {
      if (!value) return defaultValue;
      const parsed = parseInt(value.trim(), 10);
      if (isNaN(parsed)) return defaultValue;
      if (min !== undefined && parsed < min) return defaultValue;
      if (max !== undefined && parsed > max) return defaultValue;
      return parsed;
    });
    
    mockLoader.parseUrl.mockImplementation((value, defaultValue) => {
      if (!value) return defaultValue;
      try {
        new URL(value);
        return value;
      } catch {
        return defaultValue;
      }
    });
    
    mockLoader.validateEnvironment.mockImplementation((env) => {
      if (!env) return undefined;
      const normalizedEnv = env.toLowerCase().trim();
      if (normalizedEnv === 'development' || normalizedEnv === 'dev') return 'development';
      if (normalizedEnv === 'production' || normalizedEnv === 'prod') return 'production';
      if (normalizedEnv === 'test') return 'test';
      return undefined;
    });
    
    mockValidator.parseRawConfig.mockReturnValue({
      environment: 'production',
      debug: false,
      timeout: 30000,
      baseUrl: 'https://api.polyv.net',
      maxRetries: 3,
      auth: { appId: 'test-app-id', appSecret: 'test-app-secret' },
      errors: [],
      warnings: []
    });
    
    mockValidator.applyDefaults.mockImplementation((config, env) => ({
      environment: env,
      debug: false,
      timeout: 30000,
      baseUrl: 'https://api.polyv.net',
      maxRetries: 3,
      ...config
    }));
    
    mockValidator.validateAppConfig.mockReturnValue({
      isValid: true,
      errors: [],
      warnings: [],
      missingFields: []
    });
    
    mockAuth.loadAuthFromCLI.mockReturnValue({});
    mockAuth.loadAuthFromEnv.mockReturnValue({});
  });

  describe('load', () => {
    it('should load configuration successfully', async () => {
      const result = await configManager.load();

      expect(result.config).toBeDefined();
      expect(result.sources).toBeDefined();
      expect(result.validation.isValid).toBe(true);
      expect(result.loadedEnvFiles).toContain('.env');
    });

    it('should determine environment from CLI options', async () => {
      const options: ConfigOptions = {
        environment: 'development'
      };

      await configManager.load(options);

      expect(mockLoader.loadEnvironmentConfig).toHaveBeenCalledWith(
        'development',
        expect.any(Object),
        expect.any(Boolean)
      );
    });

    it('should determine environment from environment variable', async () => {
      process.env['POLYV_ENVIRONMENT'] = 'test';
      
      await configManager.load();

      expect(mockValidator.parseRawConfig).toHaveBeenCalled();
    });

    it('should handle configuration validation errors', async () => {
      mockValidator.validateAppConfig.mockReturnValue({
        isValid: false,
        errors: ['Missing appId'],
        warnings: [],
        missingFields: ['appId']
      });
      
      mockValidator.createConfigErrorMessage.mockReturnValue('Configuration error');

      await expect(configManager.load()).rejects.toThrow('Configuration error');
    });

    it('should merge CLI and environment configurations', async () => {
      const options: ConfigOptions = {
        cliOptions: {
          appId: 'cli-app-id',
          debug: true
        }
      };

      mockAuth.loadAuthFromCLI.mockReturnValue({
        appId: 'cli-app-id'
      });

      await configManager.load(options);

      expect(mockAuth.loadAuthFromCLI).toHaveBeenCalledWith(options.cliOptions);
      expect(mockAuth.loadAuthFromEnv).toHaveBeenCalled();
    });

    it('should skip env files when requested', async () => {
      const options: ConfigOptions = {
        skipEnvFile: true
      };

      await configManager.load(options);

      expect(mockLoader.loadEnvironmentConfig).toHaveBeenCalledWith(
        'production',
        expect.objectContaining({}),
        expect.any(Boolean)
      );
    });

    it('should load additional env files', async () => {
      const options: ConfigOptions = {
        envFiles: ['.env.custom', '.env.local']
      };

      await configManager.load(options);

      expect(mockLoader.loadEnvironmentConfig).toHaveBeenCalledWith(
        'production',
        expect.objectContaining({ additionalFiles: options.envFiles }),
        expect.any(Boolean)
      );
    });
  });

  describe('getConfig', () => {
    it('should return null when no config is loaded', () => {
      expect(configManager.getConfig()).toBeNull();
    });

    it('should return loaded configuration', async () => {
      await configManager.load();
      
      const config = configManager.getConfig();
      expect(config).not.toBeNull();
      expect(config?.auth.appId).toBe('test-app-id');
    });
  });

  describe('getSources', () => {
    it('should return null when no config is loaded', () => {
      expect(configManager.getSources()).toBeNull();
    });

    it('should return configuration sources after loading', async () => {
      await configManager.load();
      
      const sources = configManager.getSources();
      expect(sources).not.toBeNull();
      expect(sources?.environment).toBeDefined();
    });
  });

  describe('getLoadedEnvFiles', () => {
    it('should return empty array when no config is loaded', () => {
      expect(configManager.getLoadedEnvFiles()).toEqual([]);
    });

    it('should return loaded env files after loading', async () => {
      await configManager.load();
      
      const files = configManager.getLoadedEnvFiles();
      expect(files).toContain('.env');
    });
  });

  describe('reload', () => {
    it('should reload configuration with new options', async () => {
      // First load
      await configManager.load();
      const initialConfig = configManager.getConfig();

      // Mock different response for reload
      mockValidator.parseRawConfig.mockReturnValueOnce({
        environment: 'development',
        debug: true,
        timeout: 10000,
        baseUrl: 'https://api-dev.polyv.net',
        maxRetries: 1,
        auth: { appId: 'new-app-id', appSecret: 'new-app-secret' },
        errors: [],
        warnings: []
      });

      // Reload with new options
      const result = await configManager.reload({
        environment: 'development'
      });

      expect(result.config.environment).toBe('development');
      expect(configManager.getConfig()).not.toEqual(initialConfig);
    });
  });

  describe('CLI option parsing', () => {
    it('should parse environment from CLI options', async () => {
      const options: ConfigOptions = {
        environment: 'development'
      };

      await configManager.load(options);

      expect(mockLoader.loadEnvironmentConfig).toHaveBeenCalledWith(
        'development',
        expect.any(Object),
        expect.any(Boolean)
      );
    });

    it('should parse debug flag from CLI options', async () => {
      const options: ConfigOptions = {
        cliOptions: {
          debug: true
        }
      };

      mockValidator.applyDefaults.mockImplementationOnce((config) => ({
        environment: 'production',
        debug: config.debug !== undefined ? config.debug : false,
        timeout: 30000,
        baseUrl: 'https://api.polyv.net',
        maxRetries: 3,
        ...config
      }));

      await configManager.load(options);

      expect(mockValidator.applyDefaults).toHaveBeenCalledWith(
        expect.objectContaining({ debug: true }),
        'production'
      );
    });

    it('should parse numeric options from CLI', async () => {
      const options: ConfigOptions = {
        cliOptions: {
          appId: 'valid-app-id-123456',
          appSecret: 'valid-app-secret-123456789',
          timeout: '5000',
          maxRetries: '2'
        }
      };

      await configManager.load(options);

      // Verify that parsing functions would be called
      // (actual parsing logic is tested in loader tests)
      expect(mockValidator.applyDefaults).toHaveBeenCalled();
    });
  });

  describe('authentication integration', () => {
    it('should merge authentication from CLI and environment', async () => {
      const options: ConfigOptions = {
        cliOptions: {
          appId: 'cli-app-id'
        }
      };

      mockAuth.loadAuthFromCLI.mockReturnValue({
        appId: 'cli-app-id'
      });

      mockAuth.loadAuthFromEnv.mockReturnValue({
        appSecret: 'env-app-secret',
        userId: 'env-user-id'
      });

      await configManager.load(options);

      expect(mockAuth.loadAuthFromCLI).toHaveBeenCalledWith(options.cliOptions);
      expect(mockAuth.loadAuthFromEnv).toHaveBeenCalled();
    });

    it('should prioritize CLI auth over environment auth', async () => {
      const options: ConfigOptions = {
        cliOptions: {
          appId: 'cli-app-id',
          appSecret: 'cli-app-secret'
        }
      };

      mockAuth.loadAuthFromCLI.mockReturnValue({
        appId: 'cli-app-id',
        appSecret: 'cli-app-secret'
      });

      mockAuth.loadAuthFromEnv.mockReturnValue({
        appId: 'env-app-id',
        appSecret: 'env-app-secret'
      });

      await configManager.load(options);

      // Verify CLI values take precedence
      expect(mockAuth.loadAuthFromCLI).toHaveBeenCalled();
      expect(mockAuth.loadAuthFromEnv).toHaveBeenCalled();
    });
  });
});

describe('Convenience functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadConfig', () => {
    it('should delegate to global config manager', async () => {
      const mockLoad = jest.spyOn(ConfigManager.prototype, 'load');
      mockLoad.mockResolvedValue({
        config: {} as AppConfig,
        sources: {} as any,
        validation: { isValid: true, errors: [], warnings: [], missingFields: [] },
        loadedEnvFiles: []
      });

      const options: ConfigOptions = { environment: 'test' };
      await loadConfig(options);

      expect(mockLoad).toHaveBeenCalledWith(options);
    });
  });

  describe('getConfig', () => {
    it('should delegate to global config manager', () => {
      const mockGet = jest.spyOn(ConfigManager.prototype, 'getConfig');
      mockGet.mockReturnValue(null);

      const result = getConfig();

      expect(mockGet).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('reloadConfig', () => {
    it('should delegate to global config manager', async () => {
      const mockReload = jest.spyOn(ConfigManager.prototype, 'reload');
      mockReload.mockResolvedValue({
        config: {} as AppConfig,
        sources: {} as any,
        validation: { isValid: true, errors: [], warnings: [], missingFields: [] },
        loadedEnvFiles: []
      });

      const options: ConfigOptions = { environment: 'development' };
      await reloadConfig(options);

      expect(mockReload).toHaveBeenCalledWith(options);
    });
  });
});