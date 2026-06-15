/**
 * Integration tests for configuration system
 */

import { resolve } from 'path';
import { writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { ConfigManager } from '../../src/config/manager';

// Mock global config
jest.mock('../../src/config/global', () => ({
  globalConfig: {
    load: jest.fn(() => ({})),
    exists: jest.fn(() => false),
    validate: jest.fn(() => ({ isValid: true, missingKeys: [] }))
  }
}));

describe('Configuration System Integration', () => {
  const testDir = resolve(__dirname, 'test-env');
  let configManager: ConfigManager;

  beforeEach(() => {
    // Create test directory
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }

    configManager = new ConfigManager();
    
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

  afterEach(() => {
    // Clean up test files
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Environment file loading', () => {
    it('should load configuration from .env file', async () => {
      const envFile = resolve(testDir, '.env');
      writeFileSync(envFile, [
        'POLYV_ENVIRONMENT=development',
        'POLYV_DEBUG=true',
        'POLYV_APP_ID=test-app-id',
        'POLYV_APP_SECRET=test-app-secret-123456789',
        'POLYV_USER_ID=12345'
      ].join('\n'));

      // Change working directory to test directory
      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const result = await configManager.load();

        expect(result.config.environment).toBe('development');
        expect(result.config.debug).toBe(true);
        expect(result.config.auth.appId).toBe('test-app-id');
        expect(result.config.auth.appSecret).toBe('test-app-secret-123456789');
        expect(result.config.auth.userId).toBe('12345');
        expect(result.loadedEnvFiles).toContain(envFile);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should load environment-specific configuration files', async () => {
      const baseEnvFile = resolve(testDir, '.env');
      const devEnvFile = resolve(testDir, '.env.development');
      const localEnvFile = resolve(testDir, '.env.local');

      writeFileSync(baseEnvFile, [
        'POLYV_APP_ID=base-app-id',
        'POLYV_APP_SECRET=base-app-secret-123456789',
        'POLYV_TIMEOUT=30000'
      ].join('\n'));

      writeFileSync(devEnvFile, [
        'POLYV_ENVIRONMENT=development',
        'POLYV_DEBUG=true',
        'POLYV_TIMEOUT=10000'
      ].join('\n'));

      writeFileSync(localEnvFile, [
        'POLYV_APP_ID=local-app-id'
      ].join('\n'));

      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const result = await configManager.load({
          environment: 'development'
        });

        expect(result.config.environment).toBe('development');
        expect(result.config.debug).toBe(true);
        expect(result.config.timeout).toBe(10000); // from .env.development
        expect(result.config.auth.appId).toBe('local-app-id'); // from .env.local (highest priority)
        expect(result.config.auth.appSecret).toBe('base-app-secret-123456789'); // from .env

        expect(result.loadedEnvFiles).toContain(baseEnvFile);
        expect(result.loadedEnvFiles).toContain(devEnvFile);
        expect(result.loadedEnvFiles).toContain(localEnvFile);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle missing environment files gracefully', async () => {
      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const result = await configManager.load({
          cliOptions: {
            appId: 'cli-app-id',
            appSecret: 'cli-app-secret-123456789'
          }
        });

        expect(result.config.auth.appId).toBe('cli-app-id');
        expect(result.config.auth.appSecret).toBe('cli-app-secret-123456789');
        expect(result.loadedEnvFiles).toHaveLength(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Configuration priority', () => {
    it('should prioritize CLI options over environment variables', async () => {
      // Set environment variables
      process.env['POLYV_APP_ID'] = 'env-app-id';
      process.env['POLYV_APP_SECRET'] = 'env-app-secret-123456789';
      process.env['POLYV_ENVIRONMENT'] = 'production';
      process.env['POLYV_DEBUG'] = 'false';

      const result = await configManager.load({
        cliOptions: {
          appId: 'cli-app-id',
          appSecret: 'cli-app-secret-123456789',
          environment: 'development',
          debug: true
        }
      });

      expect(result.config.auth.appId).toBe('cli-app-id');
      expect(result.config.auth.appSecret).toBe('cli-app-secret-123456789');
      expect(result.config.environment).toBe('development');
      expect(result.config.debug).toBe(true);
    });

    it('should prioritize environment variables over .env files', async () => {
      const envFile = resolve(testDir, '.env');
      writeFileSync(envFile, [
        'POLYV_APP_ID=file-app-id',
        'POLYV_APP_SECRET=file-app-secret-123456789',
        'POLYV_DEBUG=false'
      ].join('\n'));

      // Set environment variables
      process.env['POLYV_APP_ID'] = 'env-app-id';
      process.env['POLYV_DEBUG'] = 'true';

      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const result = await configManager.load();

        expect(result.config.auth.appId).toBe('env-app-id');
        expect(result.config.auth.appSecret).toBe('file-app-secret-123456789');
        expect(result.config.debug).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should use defaults when no configuration is provided', async () => {
      const result = await configManager.load({
        cliOptions: {
          appId: 'test-app-id',
          appSecret: 'test-app-secret-123456789'
        }
      });

      expect(result.config.environment).toBe('production');
      expect(result.config.debug).toBe(false);
      expect(result.config.timeout).toBe(30000);
      expect(result.config.baseUrl).toBe('https://api.polyv.net');
      expect(result.config.maxRetries).toBe(3);
    });
  });

  describe('Configuration validation', () => {
    it('should validate complete configuration successfully', async () => {
      const result = await configManager.load({
        cliOptions: {
          appId: 'valid-app-id-123456',
          appSecret: 'valid-app-secret-123456789',
          environment: 'development',
          timeout: '5000',
          maxRetries: '2'
        }
      });

      expect(result.validation.isValid).toBe(true);
      expect(result.validation.errors).toHaveLength(0);
      expect(result.validation.missingFields).toHaveLength(0);
    });

    it('should fail validation for missing required fields', async () => {
      await expect(configManager.load({
        cliOptions: {
          environment: 'development'
        },
        skipEnvFile: true,
        envFiles: [] // Use empty env files to avoid loading .env
      })).rejects.toThrow();
    });

    it('should fail validation for invalid field values', async () => {
      await expect(configManager.load({
        cliOptions: {
          appId: 'valid-app-id-123456',
          appSecret: 'valid-app-secret-123456789',
          timeout: '100', // too low
          maxRetries: '20' // too high
        }
      })).rejects.toThrow();
    });

    it('should generate warnings for environment mismatches', async () => {
      const result = await configManager.load({
        cliOptions: {
          appId: 'valid-app-id-123456',
          appSecret: 'valid-app-secret-123456789',
          environment: 'production',
          debug: true // debug in production
        }
      });

      expect(result.validation.isValid).toBe(true);
      expect(result.validation.warnings.length).toBeGreaterThan(0);
      expect(result.validation.warnings.some(w => w.includes('production environment'))).toBe(true);
    });
  });

  describe('Environment-specific defaults', () => {
    it('should use development defaults for development environment', async () => {
      const result = await configManager.load({
        environment: 'development',
        cliOptions: {
          appId: 'test-app-id',
          appSecret: 'test-app-secret-123456789'
        }
      });

      expect(result.config.environment).toBe('development');
      expect(result.config.debug).toBe(true);
      expect(result.config.timeout).toBe(10000);
      expect(result.config.baseUrl).toBe('https://api-dev.polyv.net');
      expect(result.config.maxRetries).toBe(1);
    });

    it('should use test defaults for test environment', async () => {
      // Save and clear environment variables that might interfere
      const originalUserId = process.env['POLYV_USER_ID'];
      const originalTestUserId = process.env['POLYV_TEST_USER_ID'];
      delete process.env['POLYV_USER_ID'];
      delete process.env['POLYV_TEST_USER_ID'];
      
      try {
        const result = await configManager.load({
          environment: 'test',
          cliOptions: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret-123456789',
            userId: '123456'
          }
        });

        expect(result.config.environment).toBe('test');
        expect(result.config.debug).toBe(false);
        expect(result.config.timeout).toBe(5000);
        expect(result.config.baseUrl).toBe('https://develop-3-api.polyv.net');
        expect(result.config.maxRetries).toBe(0);
      } finally {
        // Restore environment variables
        if (originalUserId) process.env['POLYV_USER_ID'] = originalUserId;
        if (originalTestUserId) process.env['POLYV_TEST_USER_ID'] = originalTestUserId;
      }
    });
  });

  describe('Configuration reload', () => {
    it('should reload configuration with new options', async () => {
      // Initial load
      const initialResult = await configManager.load({
        cliOptions: {
          appId: 'test-app-id',
          appSecret: 'test-app-secret-123456789',
          environment: 'production'
        }
      });

      expect(initialResult.config.environment).toBe('production');

      // Reload with different environment
      const reloadResult = await configManager.reload({
        cliOptions: {
          appId: 'test-app-id',
          appSecret: 'test-app-secret-123456789',
          environment: 'development'
        }
      });

      expect(reloadResult.config.environment).toBe('development');
      expect(reloadResult.config.debug).toBe(true);
      expect(configManager.getConfig()?.environment).toBe('development');
    });
  });

  describe('Manager state', () => {
    it('should return null for unloaded configuration', () => {
      expect(configManager.getConfig()).toBeNull();
      expect(configManager.getSources()).toBeNull();
      expect(configManager.getLoadedEnvFiles()).toEqual([]);
    });

    it('should maintain state after loading', async () => {
      const envFile = resolve(testDir, '.env');
      writeFileSync(envFile, [
        'POLYV_APP_ID=test-app-id',
        'POLYV_APP_SECRET=test-app-secret-123456789'
      ].join('\n'));

      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        await configManager.load();

        const config = configManager.getConfig();
        const sources = configManager.getSources();
        const envFiles = configManager.getLoadedEnvFiles();

        expect(config).not.toBeNull();
        expect(sources).not.toBeNull();
        expect(envFiles).toContain(envFile);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Complex configuration scenarios', () => {
    it('should handle complete configuration scenario', async () => {
      // Create multiple env files
      writeFileSync(resolve(testDir, '.env'), [
        'POLYV_APP_ID=base-app-id',
        'POLYV_APP_SECRET=base-app-secret-123456789',
        'POLYV_TIMEOUT=30000',
        'POLYV_MAX_RETRIES=3'
      ].join('\n'));

      writeFileSync(resolve(testDir, '.env.development'), [
        'POLYV_ENVIRONMENT=development',
        'POLYV_DEBUG=true',
        'POLYV_TIMEOUT=10000',
        'POLYV_BASE_URL=https://api-dev.polyv.net'
      ].join('\n'));

      writeFileSync(resolve(testDir, '.env.local'), [
        'POLYV_APP_ID=local-app-id',
        'POLYV_USER_ID=67890'
      ].join('\n'));

      // Set some environment variables
      process.env['POLYV_MAX_RETRIES'] = '2';

      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const result = await configManager.load({
          environment: 'development',
          cliOptions: {
            timeout: '8000',
            debug: false
          }
        });

        // Verify priority: CLI > ENV > .env.local > .env.development > .env
        expect(result.config.timeout).toBe(8000); // CLI
        expect(result.config.debug).toBe(false); // CLI
        expect(result.config.maxRetries).toBe(2); // ENV var
        expect(result.config.auth.appId).toBe('local-app-id'); // .env.local
        expect(result.config.auth.userId).toBe('67890'); // .env.local
        expect(result.config.baseUrl).toBe('https://api-dev.polyv.net'); // .env.development
        expect(result.config.auth.appSecret).toBe('base-app-secret-123456789'); // .env

        expect(result.validation.isValid).toBe(true);
        expect(result.loadedEnvFiles).toHaveLength(3);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});