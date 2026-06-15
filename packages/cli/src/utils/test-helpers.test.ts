/**
 * @fileoverview Unit tests for test-helpers utility
 */

import {
  mockAuthConfig,
  mockServiceConfig,
  getAuthAdapterMockDefinition,
  getConfigManagerMockDefinition,
  createTestProgram,
  mockAuthSuccess,
  mockAuthFailure,
  mockConfigError,
  createMockHandler,
  suppressConsole,
  createMockParentOptions,
} from './test-helpers';

describe('test-helpers', () => {
  describe('mockAuthConfig', () => {
    it('should have standard test auth values', () => {
      expect(mockAuthConfig.appId).toBe('test-app-id');
      expect(mockAuthConfig.appSecret).toBe('test-app-secret');
      expect(mockAuthConfig.userId).toBe('test-user-id');
    });
  });

  describe('mockServiceConfig', () => {
    it('should have standard service config values', () => {
      expect(mockServiceConfig.baseUrl).toBe('https://api.polyv.net');
      expect(mockServiceConfig.timeout).toBe(30000);
      expect(mockServiceConfig.debug).toBe(false);
    });
  });

  describe('getAuthAdapterMockDefinition', () => {
    it('should return auth adapter mock definition', () => {
      const mockDef = getAuthAdapterMockDefinition();

      expect(mockDef.authAdapter).toBeDefined();
      expect(mockDef.authAdapter.tryGetAuthConfig).toBeDefined();
      expect(mockDef.authAdapter.getStatusMessage).toBeDefined();
      expect(typeof mockDef.authAdapter.tryGetAuthConfig).toBe('function');
      expect(typeof mockDef.authAdapter.getStatusMessage).toBe('function');
    });

    it('should return callable mock functions', () => {
      const mockDef = getAuthAdapterMockDefinition();

      // Should be able to call without error
      mockDef.authAdapter.tryGetAuthConfig();
      mockDef.authAdapter.getStatusMessage();

      expect(mockDef.authAdapter.tryGetAuthConfig).toHaveBeenCalled();
      expect(mockDef.authAdapter.getStatusMessage).toHaveBeenCalled();
    });
  });

  describe('getConfigManagerMockDefinition', () => {
    it('should return config manager mock definition', () => {
      const mockDef = getConfigManagerMockDefinition();

      expect(mockDef.configManager).toBeDefined();
      expect(mockDef.configManager.load).toBeDefined();
      expect(typeof mockDef.configManager.load).toBe('function');
    });

    it('should return callable mock function', async () => {
      const mockDef = getConfigManagerMockDefinition();

      await mockDef.configManager.load();

      expect(mockDef.configManager.load).toHaveBeenCalled();
    });
  });

  describe('createTestProgram', () => {
    it('should create a Commander program instance', () => {
      const program = createTestProgram();

      expect(program).toBeDefined();
      expect(typeof program.command).toBe('function');
      expect(typeof program.parseAsync).toBe('function');
    });

    it('should have exitOverride configured', () => {
      const program = createTestProgram();

      // This should throw instead of calling process.exit
      expect(() => {
        program.exitOverride(() => {
          throw new Error('exit override');
        });
      }).not.toThrow();
    });
  });

  describe('mockAuthSuccess', () => {
    it('should setup successful auth mocks', () => {
      const authAdapter = {
        tryGetAuthConfig: jest.fn(),
        getStatusMessage: jest.fn(),
      };
      const configManager = {
        load: jest.fn(),
      };

      mockAuthSuccess(authAdapter, configManager);

      expect(authAdapter.tryGetAuthConfig).not.toHaveBeenCalled();
      expect(configManager.load).not.toHaveBeenCalled();
    });

    it('should return correct values when mocks are called', async () => {
      const authAdapter = {
        tryGetAuthConfig: jest.fn(),
        getStatusMessage: jest.fn(),
      };
      const configManager = {
        load: jest.fn(),
      };

      mockAuthSuccess(authAdapter, configManager);

      const authResult = authAdapter.tryGetAuthConfig();
      expect(authResult).toEqual({
        config: mockAuthConfig,
        source: 'environment',
        accountName: null,
      });

      const configResult = await configManager.load();
      expect(configResult).toEqual({
        config: mockServiceConfig,
      });
    });

    it('should accept custom options', () => {
      const authAdapter = {
        tryGetAuthConfig: jest.fn(),
        getStatusMessage: jest.fn(),
      };
      const configManager = {
        load: jest.fn(),
      };

      mockAuthSuccess(authAdapter, configManager, {
        source: 'account',
        accountName: 'my-account',
        baseUrl: 'https://custom.api.com',
        timeout: 60000,
        debug: true,
      });

      const authResult = authAdapter.tryGetAuthConfig();
      expect(authResult.source).toBe('account');
      expect(authResult.accountName).toBe('my-account');

      // Config manager load returns a promise
      expect(configManager.load).not.toHaveBeenCalled();
    });

    it('should return custom config when load is called', async () => {
      const authAdapter = {
        tryGetAuthConfig: jest.fn(),
        getStatusMessage: jest.fn(),
      };
      const configManager = {
        load: jest.fn(),
      };

      mockAuthSuccess(authAdapter, configManager, {
        baseUrl: 'https://custom.api.com',
        timeout: 60000,
        debug: true,
      });

      const configResult = await configManager.load();
      expect(configResult.config.baseUrl).toBe('https://custom.api.com');
      expect(configResult.config.timeout).toBe(60000);
      expect(configResult.config.debug).toBe(true);
    });
  });

  describe('mockAuthFailure', () => {
    it('should setup failed auth mocks', () => {
      const authAdapter = {
        tryGetAuthConfig: jest.fn(),
        getStatusMessage: jest.fn(),
      };

      mockAuthFailure(authAdapter);

      const authResult = authAdapter.tryGetAuthConfig();
      expect(authResult).toBeNull();
    });

    it('should use custom error message', () => {
      const authAdapter = {
        tryGetAuthConfig: jest.fn(),
        getStatusMessage: jest.fn(),
      };

      mockAuthFailure(authAdapter, 'Custom error message');

      const message = authAdapter.getStatusMessage();
      expect(message).toBe('Custom error message');
    });

    it('should use default error message', () => {
      const authAdapter = {
        tryGetAuthConfig: jest.fn(),
        getStatusMessage: jest.fn(),
      };

      mockAuthFailure(authAdapter);

      const message = authAdapter.getStatusMessage();
      expect(message).toBe('No authentication configured');
    });
  });

  describe('mockConfigError', () => {
    it('should setup config error mock', async () => {
      const configManager = {
        load: jest.fn(),
      };

      mockConfigError(configManager, 'Config load failed');

      await expect(configManager.load()).rejects.toThrow('Config load failed');
    });
  });

  describe('createMockHandler', () => {
    it('should create mock handler with specified methods', () => {
      const handler = createMockHandler({
        getAccountInfo: { data: { accountId: '123' } },
        updateSwitch: undefined,
      });

      expect(handler.getAccountInfo).toBeDefined();
      expect(handler.updateSwitch).toBeDefined();
      expect(typeof handler.getAccountInfo).toBe('function');
      expect(typeof handler.updateSwitch).toBe('function');
    });

    it('should return resolved values from mock methods', async () => {
      const handler = createMockHandler({
        getAccountInfo: { data: { accountId: '123' } },
      });

      const result = await handler.getAccountInfo();

      expect(result).toEqual({ data: { accountId: '123' } });
    });

    it('should track mock calls', async () => {
      const handler = createMockHandler({
        method1: { value: 1 },
        method2: { value: 2 },
      });

      await handler.method1('arg1', 'arg2');
      await handler.method2();

      expect(handler.method1).toHaveBeenCalledWith('arg1', 'arg2');
      expect(handler.method2).toHaveBeenCalledTimes(1);
    });
  });

  describe('suppressConsole', () => {
    it('should suppress console output', () => {
      const restore = suppressConsole();

      console.log('test log');
      console.error('test error');
      console.warn('test warn');

      // Should not throw
      restore();
    });

    it('should restore original console methods', () => {
      const originalLog = console.log;
      const restore = suppressConsole();

      expect(console.log).not.toBe(originalLog);

      restore();

      expect(console.log).toBe(originalLog);
    });
  });

  describe('createMockParentOptions', () => {
    it('should create default parent options', () => {
      const options = createMockParentOptions();

      expect(options.appId).toBeUndefined();
      expect(options.appSecret).toBeUndefined();
      expect(options.userId).toBeUndefined();
      expect(options.verbose).toBe(false);
    });

    it('should merge custom options', () => {
      const options = createMockParentOptions({
        appId: 'custom-app-id',
        verbose: true,
        customOption: 'value',
      });

      expect(options.appId).toBe('custom-app-id');
      expect(options.verbose).toBe(true);
      expect(options.customOption).toBe('value');
    });
  });
});
