/**
 * Unit tests for AuthenticationAdapter
 */

import { AuthenticationAdapter } from './auth-adapter';
import { AuthenticationProvider } from '../types/auth-source.types';
import { ConfigurationError } from '../utils/errors';

// Mock AuthenticationProvider
const mockAuthProvider: jest.Mocked<AuthenticationProvider> = {
  getAuthenticationContext: jest.fn(),
  getCredentials: jest.fn(),
  getCurrentSource: jest.fn(),
  validateAuthentication: jest.fn(),
  getStatusMessage: jest.fn(),
  getDiagnostics: jest.fn(),
};

describe('AuthenticationAdapter', () => {
  let adapter: AuthenticationAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new AuthenticationAdapter(mockAuthProvider);
  });

  describe('getAuthConfig', () => {
    it('应该返回AuthConfig当认证可用时', () => {
      const mockCredentials = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
      };

      mockAuthProvider.getCredentials.mockReturnValue(mockCredentials);

      const authConfig = adapter.getAuthConfig();

      expect(authConfig).toEqual({
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
      });
    });

    it('应该返回AuthConfig不包含userId当userId未提供时', () => {
      const mockCredentials = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
      };

      mockAuthProvider.getCredentials.mockReturnValue(mockCredentials);

      const authConfig = adapter.getAuthConfig();

      expect(authConfig).toEqual({
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
      });
      expect(authConfig).not.toHaveProperty('userId');
    });

    it('应该抛出ConfigurationError当认证不可用时', () => {
      mockAuthProvider.getCredentials.mockReturnValue(null);
      mockAuthProvider.getStatusMessage.mockReturnValue('未找到认证信息');

      expect(() => adapter.getAuthConfig()).toThrow(ConfigurationError);
      expect(() => adapter.getAuthConfig()).toThrow('未找到认证信息');
    });

    it('应该传递options到认证提供者', () => {
      const options = { appId: 'test-id' };
      const mockCredentials = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
      };

      mockAuthProvider.getCredentials.mockReturnValue(mockCredentials);

      adapter.getAuthConfig(options);

      expect(mockAuthProvider.getCredentials).toHaveBeenCalledWith(options);
    });
  });

  describe('tryGetAuthConfig', () => {
    it('应该返回配置和源信息当认证可用时', () => {
      const mockContext = {
        source: {
          type: 'command-line' as const,
          priority: 1,
          appId: 'test-app-id',
          appSecret: 'test-app-secret',
          userId: 'test-user-id',
          metadata: {
            source: '命令行参数',
            accountName: 'test-account',
          },
        },
        credentials: {
          appId: 'test-app-id',
          appSecret: 'test-app-secret',
          userId: 'test-user-id',
        },
        diagnostics: {
          attemptedSources: ['命令行参数'],
          selectedReason: '优先级最高',
          warnings: [],
          isComplete: true,
        },
      };

      mockAuthProvider.getAuthenticationContext.mockReturnValue(mockContext);

      const result = adapter.tryGetAuthConfig();

      expect(result).not.toBeNull();
      expect(result!.config).toEqual({
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
      });
      expect(result!.source).toBe('命令行参数');
      expect(result!.accountName).toBe('test-account');
    });

    it('应该返回配置不包含userId当userId未提供时', () => {
      const mockContext = {
        source: {
          type: 'environment' as const,
          priority: 3,
          appId: 'test-app-id',
          appSecret: 'test-app-secret',
          metadata: {
            source: '环境变量',
          },
        },
        credentials: {
          appId: 'test-app-id',
          appSecret: 'test-app-secret',
        },
        diagnostics: {
          attemptedSources: ['环境变量'],
          selectedReason: '环境变量可用',
          warnings: [],
          isComplete: true,
        },
      };

      mockAuthProvider.getAuthenticationContext.mockReturnValue(mockContext);

      const result = adapter.tryGetAuthConfig();

      expect(result).not.toBeNull();
      expect(result!.config).toEqual({
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
      });
      expect(result!.config).not.toHaveProperty('userId');
      expect(result!.source).toBe('环境变量');
      expect(result!.accountName).toBeUndefined();
    });

    it('应该返回null当认证不可用时', () => {
      mockAuthProvider.getAuthenticationContext.mockReturnValue(null);

      const result = adapter.tryGetAuthConfig();

      expect(result).toBeNull();
    });

    it('应该传递完整options到认证提供者', () => {
      const options = { appId: 'test-id', appSecret: 'test-secret' };

      mockAuthProvider.getAuthenticationContext.mockReturnValue(null);

      adapter.tryGetAuthConfig(options);

      expect(mockAuthProvider.getAuthenticationContext).toHaveBeenCalledWith(options);
    });

    it('应该在CLI认证不完整时直接返回null', () => {
      const options = { appSecret: 'test-secret' }; // Missing appId

      const result = adapter.tryGetAuthConfig(options);

      expect(result).toBeNull();
      // Should not call the provider when CLI auth is incomplete
      expect(mockAuthProvider.getAuthenticationContext).not.toHaveBeenCalled();
    });
  });

  describe('isAuthenticationAvailable', () => {
    it('应该返回true当认证可用时', () => {
      mockAuthProvider.getCredentials.mockReturnValue({
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
      });

      const isAvailable = adapter.isAuthenticationAvailable();

      expect(isAvailable).toBe(true);
    });

    it('应该返回false当认证不可用时', () => {
      mockAuthProvider.getCredentials.mockReturnValue(null);

      const isAvailable = adapter.isAuthenticationAvailable();

      expect(isAvailable).toBe(false);
    });

    it('应该传递options到认证提供者', () => {
      const options = { userId: 'test-user' };

      mockAuthProvider.getCredentials.mockReturnValue(null);

      adapter.isAuthenticationAvailable(options);

      expect(mockAuthProvider.getCredentials).toHaveBeenCalledWith(options);
    });
  });

  describe('getStatusMessage', () => {
    it('应该返回状态消息', () => {
      const expectedMessage = '使用认证来源: 会话账号 (test-account)';
      mockAuthProvider.getStatusMessage.mockReturnValue(expectedMessage);

      const message = adapter.getStatusMessage();

      expect(message).toBe(expectedMessage);
      expect(mockAuthProvider.getStatusMessage).toHaveBeenCalledWith(undefined);
    });

    it('应该传递options到认证提供者', () => {
      const options = { debug: true };
      mockAuthProvider.getStatusMessage.mockReturnValue('状态消息');

      adapter.getStatusMessage(options);

      expect(mockAuthProvider.getStatusMessage).toHaveBeenCalledWith(options);
    });
  });

  describe('getDiagnostics', () => {
    it('应该返回诊断信息', () => {
      const expectedDiagnostics = {
        availableSources: [],
        errors: ['认证错误'],
        warnings: ['认证警告'],
        suggestions: ['建议操作'],
      };

      mockAuthProvider.getDiagnostics.mockReturnValue(expectedDiagnostics);

      const diagnostics = adapter.getDiagnostics();

      expect(diagnostics).toBe(expectedDiagnostics);
      expect(mockAuthProvider.getDiagnostics).toHaveBeenCalledWith(undefined);
    });

    it('应该传递options到认证提供者', () => {
      const options = { verbose: true };
      const mockDiagnostics = {
        availableSources: [],
        errors: [],
        warnings: [],
        suggestions: [],
      };

      mockAuthProvider.getDiagnostics.mockReturnValue(mockDiagnostics);

      adapter.getDiagnostics(options);

      expect(mockAuthProvider.getDiagnostics).toHaveBeenCalledWith(options);
    });
  });

  describe('构造函数', () => {
    it('应该使用默认认证提供者当没有提供时', () => {
      // 这个测试验证默认构造函数不会抛出错误
      expect(() => new AuthenticationAdapter()).not.toThrow();
    });

    it('应该使用提供的认证提供者', () => {
      const customProvider = mockAuthProvider;
      const customAdapter = new AuthenticationAdapter(customProvider);

      customProvider.getCredentials.mockReturnValue({
        appId: 'custom-app-id',
        appSecret: 'custom-app-secret',
      });

      const config = customAdapter.getAuthConfig();

      expect(config.appId).toBe('custom-app-id');
      expect(customProvider.getCredentials).toHaveBeenCalled();
    });
  });
});
