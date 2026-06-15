/**
 * Unit tests for AuthenticationProvider
 */

import { DefaultAuthenticationProvider } from './auth-provider';
import { AuthenticationSourceManager } from './auth-source-manager';
import { AUTH_CLI_OPTIONS } from '../types/auth';

// Mock dependencies
jest.mock('./auth-source-manager');
jest.mock('./session-state');
jest.mock('./account-config');

describe('DefaultAuthenticationProvider', () => {
  let provider: DefaultAuthenticationProvider;
  let mockSourceManager: jest.Mocked<AuthenticationSourceManager>;

  beforeEach(() => {
    mockSourceManager = {
      getCredentials: jest.fn(),
      getAuthenticationSource: jest.fn(),
      isCompleteAuthentication: jest.fn(),
      getStatusMessage: jest.fn(),
      getDiagnostics: jest.fn(),
    } as any;

    // Mock the constructor
    (AuthenticationSourceManager as jest.MockedClass<typeof AuthenticationSourceManager>)
      .mockImplementation(() => mockSourceManager);

    provider = new DefaultAuthenticationProvider();
  });

  describe('getAuthenticationContext', () => {
    it('应该返回null当没有有效认证时', () => {
      mockSourceManager.getDiagnostics.mockReturnValue({
        availableSources: [],
        errors: [],
        warnings: [],
        suggestions: [],
      });

      const context = provider.getAuthenticationContext();

      expect(context).toBeNull();
    });

    it('应该返回认证上下文当有有效认证时', () => {
      const mockSource = {
        type: 'command-line' as const,
        priority: 1,
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
        metadata: {
          source: '命令行参数',
          setAt: new Date(),
        },
      };

      mockSourceManager.getDiagnostics.mockReturnValue({
        availableSources: [mockSource],
        selectedSource: mockSource,
        errors: [],
        warnings: [],
        suggestions: [],
      });

      mockSourceManager.isCompleteAuthentication.mockReturnValue(true);

      const context = provider.getAuthenticationContext();

      expect(context).not.toBeNull();
      expect(context!.source).toBe(mockSource);
      expect(context!.credentials.appId).toBe('test-app-id');
      expect(context!.credentials.appSecret).toBe('test-app-secret');
      expect(context!.credentials.userId).toBe('test-user-id');
      expect(context!.diagnostics.isComplete).toBe(true);
    });

    it('应该返回null当认证不完整时', () => {
      const mockSource = {
        type: 'command-line' as const,
        priority: 1,
        appId: 'test-app-id',
        // missing appSecret
        metadata: {
          source: '命令行参数',
        },
      };

      mockSourceManager.getDiagnostics.mockReturnValue({
        availableSources: [mockSource],
        selectedSource: mockSource,
        errors: [],
        warnings: [],
        suggestions: [],
      });

      mockSourceManager.isCompleteAuthentication.mockReturnValue(false);

      const context = provider.getAuthenticationContext();

      expect(context).toBeNull();
    });
  });

  describe('getCredentials', () => {
    it('应该返回认证凭据', () => {
      const expectedCredentials = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
      };

      mockSourceManager.getCredentials.mockReturnValue(expectedCredentials);

      const options = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'test-app-id',
        [AUTH_CLI_OPTIONS.APP_SECRET]: 'test-app-secret',
      };

      const credentials = provider.getCredentials(options);

      expect(credentials).toBe(expectedCredentials);
      expect(mockSourceManager.getCredentials).toHaveBeenCalledWith(options);
    });

    it('应该返回null当没有认证凭据时', () => {
      mockSourceManager.getCredentials.mockReturnValue(null);

      const credentials = provider.getCredentials();

      expect(credentials).toBeNull();
    });
  });

  describe('getCurrentSource', () => {
    it('应该返回当前认证源', () => {
      const mockSource = {
        type: 'environment' as const,
        priority: 3,
        appId: 'env-app-id',
        appSecret: 'env-app-secret',
        metadata: {
          source: '环境变量',
        },
      };

      mockSourceManager.getAuthenticationSource.mockReturnValue(mockSource);

      const source = provider.getCurrentSource();

      expect(source).toBe(mockSource);
    });

    it('应该返回null当没有认证源时', () => {
      mockSourceManager.getAuthenticationSource.mockReturnValue(null);

      const source = provider.getCurrentSource();

      expect(source).toBeNull();
    });
  });

  describe('validateAuthentication', () => {
    it('应该验证认证完整性', () => {
      const mockSource = {
        type: 'session' as const,
        priority: 2,
        appId: 'session-app-id',
        appSecret: 'session-app-secret',
        metadata: {
          source: '会话账号',
        },
      };

      mockSourceManager.isCompleteAuthentication.mockReturnValue(true);

      const isValid = provider.validateAuthentication(mockSource);

      expect(isValid).toBe(true);
      expect(mockSourceManager.isCompleteAuthentication).toHaveBeenCalledWith(mockSource);
    });

    it('应该返回false当认证不完整时', () => {
      const mockSource = {
        type: 'session' as const,
        priority: 2,
        appId: 'session-app-id',
        // missing appSecret
        metadata: {
          source: '会话账号',
        },
      };

      mockSourceManager.isCompleteAuthentication.mockReturnValue(false);

      const isValid = provider.validateAuthentication(mockSource);

      expect(isValid).toBe(false);
    });
  });

  describe('getStatusMessage', () => {
    it('应该返回状态消息', () => {
      const expectedMessage = '使用认证来源: 命令行参数';
      mockSourceManager.getStatusMessage.mockReturnValue(expectedMessage);

      const message = provider.getStatusMessage();

      expect(message).toBe(expectedMessage);
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

      mockSourceManager.getDiagnostics.mockReturnValue(expectedDiagnostics);

      const diagnostics = provider.getDiagnostics();

      expect(diagnostics).toBe(expectedDiagnostics);
    });
  });

  describe('getSourceByType', () => {
    it('应该通过类型获取认证源', () => {
      const mockSource = {
        type: 'config' as const,
        priority: 4,
        appId: 'config-app-id',
        appSecret: 'config-app-secret',
        metadata: {
          source: '全局配置',
        },
      };

      mockSourceManager.getSourceByType = jest.fn().mockReturnValue(mockSource);

      const source = provider.getSourceByType('config');

      expect(source).toBe(mockSource);
      expect(mockSourceManager.getSourceByType).toHaveBeenCalledWith('config', undefined);
    });
  });

  describe('isSourceAvailable', () => {
    it('应该检查认证源是否可用', () => {
      mockSourceManager.isSourceAvailable = jest.fn().mockReturnValue(true);

      const isAvailable = provider.isSourceAvailable('environment');

      expect(isAvailable).toBe(true);
      expect(mockSourceManager.isSourceAvailable).toHaveBeenCalledWith('environment', undefined);
    });

    it('应该返回false当认证源不可用时', () => {
      mockSourceManager.isSourceAvailable = jest.fn().mockReturnValue(false);

      const isAvailable = provider.isSourceAvailable('session');

      expect(isAvailable).toBe(false);
    });
  });
});
