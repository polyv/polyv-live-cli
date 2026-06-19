/**
 * Unit tests for AuthenticationSourceManager
 */

import {
  AuthenticationSourceManager,
  CommandLineAccountDetector,
  CommandLineAuthDetector,
  SessionAuthDetector,
  EnvironmentAuthDetector,
  ConfigAuthDetector,
} from './auth-source-manager';
import { SessionStateManager } from './session-state';
import { AccountConfigManager } from './account-config';
import { AUTH_ENV_VARS, AUTH_CLI_OPTIONS } from '../types/auth';

// Mock dependencies
jest.mock('./session-state');
jest.mock('./account-config');
jest.mock('./global');

describe('CommandLineAccountDetector', () => {
  let detector: CommandLineAccountDetector;
  let mockAccountManager: jest.Mocked<AccountConfigManager>;

  beforeEach(() => {
    mockAccountManager = {
      accountExists: jest.fn(),
      getAccount: jest.fn(),
    } as any;
    detector = new CommandLineAccountDetector(mockAccountManager);
  });

  describe('detect', () => {
    it('应该返回null当没有提供options时', () => {
      const result = detector.detect();
      expect(result).toBeNull();
    });

    it('应该返回null当没有account参数时', () => {
      const result = detector.detect({});
      expect(result).toBeNull();
    });

    it('应该检测到命令行账号参数', () => {
      const accountName = 'test-account';
      const mockAccount = {
        name: accountName,
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
        environment: 'production',
      };

      mockAccountManager.accountExists.mockReturnValue(true);
      mockAccountManager.getAccount.mockReturnValue(mockAccount);

      const result = detector.detect({ account: accountName });

      expect(result).not.toBeNull();
      expect(result!.type).toBe('command-line-account');
      expect(result!.priority).toBe(1);
      expect(result!.appId).toBe('test-app-id');
      expect(result!.appSecret).toBe('test-app-secret');
      expect(result!.userId).toBe('test-user-id');
      expect(result!.metadata.source).toBe('命令行指定账号');
      expect(result!.metadata.accountName).toBe(accountName);
    });

    it('应该返回错误当账号不存在时', () => {
      const accountName = 'non-existent-account';
      mockAccountManager.accountExists.mockReturnValue(false);

      const result = detector.detect({ account: accountName });

      expect(result).not.toBeNull();
      expect(result!.type).toBe('command-line-account');
      expect(result!.priority).toBe(1);
      expect(result!.appId).toBeUndefined();
      expect(result!.appSecret).toBeUndefined();
      expect(result!.metadata.accountName).toBe(accountName);
      expect(result!.metadata.context?.error).toBe('account_not_found');
      expect(result!.metadata.context?.message).toContain(accountName);
    });

    it('应该处理检测异常', () => {
      const accountName = 'test-account';
      mockAccountManager.accountExists.mockImplementation(() => {
        throw new Error('Account check failed');
      });

      const result = detector.detect({ account: accountName });

      expect(result).not.toBeNull();
      expect(result!.type).toBe('command-line-account');
      expect(result!.metadata.context?.error).toBe('detection_failed');
    });
  });

  describe('isAvailable', () => {
    it('应该返回true当账号存在且有完整认证信息时', () => {
      const accountName = 'test-account';
      const mockAccount = {
        name: accountName,
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
      };

      mockAccountManager.accountExists.mockReturnValue(true);
      mockAccountManager.getAccount.mockReturnValue(mockAccount);

      const result = detector.isAvailable({ account: accountName });

      expect(result).toBe(true);
    });

    it('应该返回false当账号不存在时', () => {
      const accountName = 'non-existent-account';
      mockAccountManager.accountExists.mockReturnValue(false);

      const result = detector.isAvailable({ account: accountName });

      expect(result).toBe(false);
    });
  });
});

describe('CommandLineAuthDetector', () => {
  let detector: CommandLineAuthDetector;

  beforeEach(() => {
    detector = new CommandLineAuthDetector();
  });

  describe('detect', () => {
    it('应该返回null当没有提供options时', () => {
      const result = detector.detect();
      expect(result).toBeNull();
    });

    it('应该返回null当options为空对象时', () => {
      const result = detector.detect({});
      expect(result).toBeNull();
    });

    it('应该检测到命令行认证参数', () => {
      const options = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'test-app-id',
        [AUTH_CLI_OPTIONS.APP_SECRET]: 'test-app-secret',
        [AUTH_CLI_OPTIONS.USER_ID]: 'test-user-id',
      };

      const result = detector.detect(options);

      expect(result).not.toBeNull();
      expect(result!.type).toBe('command-line');
      expect(result!.priority).toBe(2);
      expect(result!.appId).toBe('test-app-id');
      expect(result!.appSecret).toBe('test-app-secret');
      expect(result!.userId).toBe('test-user-id');
      expect(result!.metadata.source).toBe('命令行参数');
    });

    it('应该检测到部分命令行参数', () => {
      const options = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'test-app-id',
      };

      const result = detector.detect(options);

      expect(result).not.toBeNull();
      expect(result!.appId).toBe('test-app-id');
      expect(result!.appSecret).toBeUndefined();
      expect(result!.userId).toBeUndefined();
    });
  });

  describe('isAvailable', () => {
    it('应该返回false当没有认证信息时', () => {
      expect(detector.isAvailable({})).toBe(false);
    });

    it('应该返回false当只有appId时', () => {
      const options = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'test-app-id',
      };
      expect(detector.isAvailable(options)).toBe(false);
    });

    it('应该返回true当有完整认证信息时', () => {
      const options = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'test-app-id',
        [AUTH_CLI_OPTIONS.APP_SECRET]: 'test-app-secret',
      };
      expect(detector.isAvailable(options)).toBe(true);
    });
  });
});

describe('SessionAuthDetector', () => {
  let detector: SessionAuthDetector;
  let mockSessionManager: jest.Mocked<SessionStateManager>;
  let mockAccountManager: jest.Mocked<AccountConfigManager>;

  beforeEach(() => {
    mockSessionManager = {
      getCurrentSessionAccount: jest.fn(),
      getSessionState: jest.fn(),
    } as any;

    mockAccountManager = {
      accountExists: jest.fn(),
      getAccount: jest.fn(),
    } as any;

    detector = new SessionAuthDetector(mockSessionManager, mockAccountManager);
  });

  describe('detect', () => {
    it('应该返回null当没有会话账号时', () => {
      mockSessionManager.getCurrentSessionAccount.mockReturnValue(null);

      const result = detector.detect();

      expect(result).toBeNull();
    });

    it('应该返回错误信息当会话账号不存在时', () => {
      mockSessionManager.getCurrentSessionAccount.mockReturnValue('test-account');
      mockAccountManager.accountExists.mockReturnValue(false);

      const result = detector.detect();

      expect(result).not.toBeNull();
      expect(result!.type).toBe('session');
      expect(result!.metadata.accountName).toBe('test-account');
      expect(result!.metadata.context?.['error']).toBe('account_not_found');
    });

    it('应该检测到有效的会话账号', () => {
      const mockAccount = {
        name: 'test-account',
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };
      
      // 设置正确的mock返回值
      mockSessionManager.getCurrentSessionAccount.mockReturnValue('test-account');
      mockAccountManager.accountExists.mockReturnValue(true);
      mockAccountManager.getAccount.mockReturnValue(mockAccount);

      mockSessionManager.getSessionState.mockReturnValue({
        accountName: 'test-account',
        processId: 12345,
        terminalId: 'test-terminal',
        setAt: new Date(),
      });

      const result = detector.detect();

      expect(result).not.toBeNull();
      expect(result!.type).toBe('session');
      expect(result!.priority).toBe(3);
      expect(result!.appId).toBe('test-app-id');
      expect(result!.appSecret).toBe('test-app-secret');
      expect(result!.userId).toBe('test-user-id');
      expect(result!.metadata.accountName).toBe('test-account');
    });

    it('应该处理检测异常', () => {
      mockSessionManager.getCurrentSessionAccount.mockImplementation(() => {
        throw new Error('Session detection failed');
      });

      const result = detector.detect();

      expect(result).not.toBeNull();
      expect(result!.type).toBe('session');
      expect(result!.metadata.context?.['error']).toBe('detection_failed');
    });
  });

  describe('isAvailable', () => {
    it('应该返回false当会话账号不完整时', () => {
      mockSessionManager.getCurrentSessionAccount.mockReturnValue('test-account');
      mockAccountManager.accountExists.mockReturnValue(true);
      mockAccountManager.getAccount.mockReturnValue({
        name: 'test-account',
        appId: 'test-app-id',
        // missing appSecret
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      } as any);

      expect(detector.isAvailable()).toBe(false);
    });

    it('应该返回true当会话账号完整时', () => {
      mockSessionManager.getCurrentSessionAccount.mockReturnValue('test-account');
      mockAccountManager.accountExists.mockReturnValue(true);
      mockAccountManager.getAccount.mockReturnValue({
        name: 'test-account',
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      });

      expect(detector.isAvailable()).toBe(true);
    });
  });
});

describe('EnvironmentAuthDetector', () => {
  let detector: EnvironmentAuthDetector;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    detector = new EnvironmentAuthDetector();
    originalEnv = process.env;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('detect', () => {
    it('应该返回null当没有环境变量时', () => {
      process.env = {};

      const result = detector.detect();

      expect(result).toBeNull();
    });

    it('应该检测到环境变量认证信息', () => {
      process.env = {
        [AUTH_ENV_VARS.APP_ID]: 'env-app-id',
        [AUTH_ENV_VARS.APP_SECRET]: 'env-app-secret',
        [AUTH_ENV_VARS.USER_ID]: 'env-user-id',
      };

      const result = detector.detect();

      expect(result).not.toBeNull();
      expect(result!.type).toBe('environment');
      expect(result!.priority).toBe(4);
      expect(result!.appId).toBe('env-app-id');
      expect(result!.appSecret).toBe('env-app-secret');
      expect(result!.userId).toBe('env-user-id');
    });

    it('应该处理带空格的环境变量', () => {
      process.env = {
        [AUTH_ENV_VARS.APP_ID]: '  env-app-id  ',
        [AUTH_ENV_VARS.APP_SECRET]: '  env-app-secret  ',
      };

      const result = detector.detect();

      expect(result).not.toBeNull();
      expect(result!.appId).toBe('env-app-id');
      expect(result!.appSecret).toBe('env-app-secret');
    });
  });

  describe('isAvailable', () => {
    it('应该返回false当环境变量不完整时', () => {
      process.env = {
        [AUTH_ENV_VARS.APP_ID]: 'env-app-id',
      };

      expect(detector.isAvailable()).toBe(false);
    });

    it('应该返回true当环境变量完整时', () => {
      process.env = {
        [AUTH_ENV_VARS.APP_ID]: 'env-app-id',
        [AUTH_ENV_VARS.APP_SECRET]: 'env-app-secret',
      };

      expect(detector.isAvailable()).toBe(true);
    });
  });
});

describe('ConfigAuthDetector', () => {
  let detector: ConfigAuthDetector;

  beforeEach(() => {
    detector = new ConfigAuthDetector();
  });

  describe('detect', () => {
    it('应该返回null当配置文件不存在时', () => {
      const mockGlobalConfig = {
        exists: jest.fn().mockReturnValue(false),
      };

      jest.doMock('./global', () => ({
        globalConfig: mockGlobalConfig,
      }));

      const result = detector.detect();

      expect(result).toBeNull();
    });

    it('应该检测到配置文件认证信息', () => {
      const mockGlobalConfig = {
        exists: jest.fn().mockReturnValue(true),
        load: jest.fn().mockReturnValue({
          appId: 'config-app-id',
          appSecret: 'config-app-secret',
          userId: 'config-user-id',
        }),
        getConfigPath: jest.fn().mockReturnValue('/path/to/config'),
        validate: jest.fn().mockReturnValue({ isValid: true, missingKeys: [] }),
      };

      // 重新创建detector实例以使用新的mock
      jest.resetModules();
      jest.doMock('./global', () => ({
        globalConfig: mockGlobalConfig,
      }));
      
      const { ConfigAuthDetector: MockedConfigAuthDetector } = require('./auth-source-manager');
      const mockedDetector = new MockedConfigAuthDetector();
      const result = mockedDetector.detect();

      expect(result).not.toBeNull();
      expect(result!.type).toBe('config');
      expect(result!.priority).toBe(6);
      expect(result!.appId).toBe('config-app-id');
      expect(result!.appSecret).toBe('config-app-secret');
      expect(result!.userId).toBe('config-user-id');
    });

    it('应该处理配置检测异常', () => {
      // 重新创建detector实例以使用新的mock
      jest.resetModules();
      jest.doMock('./global', () => {
        throw new Error('Config detection failed');
      });
      
      const { ConfigAuthDetector: MockedConfigAuthDetector } = require('./auth-source-manager');
      const mockedDetector = new MockedConfigAuthDetector();
      const result = mockedDetector.detect();

      expect(result).not.toBeNull();
      expect(result!.type).toBe('config');
      expect(result!.metadata.context?.['error']).toBe('detection_failed');
    });
  });
});

describe('AuthenticationSourceManager', () => {
  let manager: AuthenticationSourceManager;
  let mockSessionManager: jest.Mocked<SessionStateManager>;
  let mockAccountManager: jest.Mocked<AccountConfigManager>;

  beforeEach(() => {
    mockSessionManager = {
      getCurrentSessionAccount: jest.fn(),
      getSessionState: jest.fn(),
    } as any;

    mockAccountManager = {
      accountExists: jest.fn(),
      getAccount: jest.fn(),
      getDefaultAccount: jest.fn().mockReturnValue(null),
    } as any;

    manager = new AuthenticationSourceManager(mockSessionManager, mockAccountManager);
  });

  describe('getAvailableSources', () => {
    it('应该返回所有可用的认证源', () => {
      const options = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'cli-app-id',
        [AUTH_CLI_OPTIONS.APP_SECRET]: 'cli-app-secret',
      };

      process.env = {
        [AUTH_ENV_VARS.APP_ID]: 'env-app-id',
        [AUTH_ENV_VARS.APP_SECRET]: 'env-app-secret',
      };

      mockSessionManager.getCurrentSessionAccount.mockReturnValue('test-account');
      mockAccountManager.accountExists.mockReturnValue(true);
      mockAccountManager.getAccount.mockReturnValue({
        name: 'session-account',
        appId: 'session-app-id',
        appSecret: 'session-app-secret',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      });

      const sources = manager.getAvailableSources(options);

      expect(sources.length).toBeGreaterThan(0);
      expect(sources.some(s => s.type === 'command-line')).toBe(true);
      expect(sources.some(s => s.type === 'environment')).toBe(true);
      expect(sources.some(s => s.type === 'session')).toBe(true);
    });

    it('应该按优先级排序认证源', () => {
      const options = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'cli-app-id',
      };

      process.env = {
        [AUTH_ENV_VARS.APP_ID]: 'env-app-id',
      };

      const sources = manager.getAvailableSources(options);
      const priorities = sources.map(s => s.priority);

      // 验证优先级是递增的（1=最高优先级）
      for (let i = 1; i < priorities.length; i++) {
        expect(priorities[i]!).toBeGreaterThanOrEqual(priorities[i - 1]!);
      }
    });
  });

  describe('getAuthenticationSource', () => {
    it('应该返回最高优先级的完整认证源', () => {
      const options = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'cli-app-id',
        [AUTH_CLI_OPTIONS.APP_SECRET]: 'cli-app-secret',
      };

      process.env = {
        [AUTH_ENV_VARS.APP_ID]: 'env-app-id',
        [AUTH_ENV_VARS.APP_SECRET]: 'env-app-secret',
      };

      const source = manager.getAuthenticationSource(options);

      expect(source).not.toBeNull();
      expect(source!.type).toBe('command-line');
      expect(source!.priority).toBe(2);
    });

    it('应该跳过不完整的认证源', () => {
      const options = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'cli-app-id',
        // missing appSecret
      };

      process.env = {
        [AUTH_ENV_VARS.APP_ID]: 'env-app-id',
        [AUTH_ENV_VARS.APP_SECRET]: 'env-app-secret',
      };

      const source = manager.getAuthenticationSource(options);

      expect(source).not.toBeNull();
      expect(source!.type).toBe('environment');
      expect(source!.priority).toBe(4);
    });

    it('应该优先使用环境变量而不是默认账号', () => {
      process.env = {
        [AUTH_ENV_VARS.APP_ID]: 'env-app-id',
        [AUTH_ENV_VARS.APP_SECRET]: 'env-app-secret',
      };

      mockSessionManager.getCurrentSessionAccount.mockReturnValue(null);
      mockAccountManager.getDefaultAccount.mockReturnValue('default-account');
      mockAccountManager.accountExists.mockReturnValue(true);
      mockAccountManager.getAccount.mockReturnValue({
        name: 'default-account',
        appId: 'default-app-id',
        appSecret: 'default-app-secret',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      });

      const source = manager.getAuthenticationSource();

      expect(source).not.toBeNull();
      expect(source!.type).toBe('environment');
      expect(source!.appId).toBe('env-app-id');
      expect(source!.appSecret).toBe('env-app-secret');
    });

    it('应该返回null当没有完整认证源时', () => {
      const options = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'cli-app-id',
        // missing appSecret
      };

      process.env = {
        [AUTH_ENV_VARS.APP_ID]: 'env-app-id',
        // missing appSecret
      };

      const source = manager.getAuthenticationSource(options);

      expect(source).toBeNull();
    });
  });

  describe('isCompleteAuthentication', () => {
    it('应该返回true当认证信息完整时', () => {
      const source = {
        type: 'command-line' as const,
        priority: 1,
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        metadata: { source: '命令行参数' },
      };

      expect(manager.isCompleteAuthentication(source)).toBe(true);
    });

    it('应该返回false当缺少appId时', () => {
      const source = {
        type: 'command-line' as const,
        priority: 1,
        appSecret: 'test-app-secret',
        metadata: { source: '命令行参数' },
      };

      expect(manager.isCompleteAuthentication(source)).toBe(false);
    });

    it('应该返回false当缺少appSecret时', () => {
      const source = {
        type: 'command-line' as const,
        priority: 1,
        appId: 'test-app-id',
        metadata: { source: '命令行参数' },
      };

      expect(manager.isCompleteAuthentication(source)).toBe(false);
    });
  });

  describe('getCredentials', () => {
    it('应该返回认证凭据', () => {
      const options = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'cli-app-id',
        [AUTH_CLI_OPTIONS.APP_SECRET]: 'cli-app-secret',
        [AUTH_CLI_OPTIONS.USER_ID]: 'cli-user-id',
      };

      const credentials = manager.getCredentials(options);

      expect(credentials).not.toBeNull();
      expect(credentials!.appId).toBe('cli-app-id');
      expect(credentials!.appSecret).toBe('cli-app-secret');
      expect(credentials!.userId).toBe('cli-user-id');
    });

    it('应该返回null当没有完整认证时', () => {
      const options = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'cli-app-id',
        // missing appSecret
      };

      const credentials = manager.getCredentials(options);

      expect(credentials).toBeNull();
    });
  });

  describe('getDiagnostics', () => {
    it('应该返回诊断信息', () => {
      const options = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'cli-app-id',
        [AUTH_CLI_OPTIONS.APP_SECRET]: 'cli-app-secret',
      };

      const diagnostics = manager.getDiagnostics(options);

      expect(diagnostics).toBeDefined();
      expect(diagnostics.availableSources).toBeDefined();
      expect(diagnostics.selectedSource).toBeDefined();
      expect(diagnostics.errors).toBeDefined();
      expect(diagnostics.warnings).toBeDefined();
      expect(diagnostics.suggestions).toBeDefined();
    });

    it('应该包含错误信息当认证失败时', () => {
      mockSessionManager.getCurrentSessionAccount.mockReturnValue('missing-account');
      mockAccountManager.accountExists.mockReturnValue(false);

      const diagnostics = manager.getDiagnostics();

      expect(diagnostics.errors.length).toBeGreaterThan(0);
      expect(diagnostics.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('getStatusMessage', () => {
    it('应该返回成功状态消息', () => {
      const options = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'cli-app-id',
        [AUTH_CLI_OPTIONS.APP_SECRET]: 'cli-app-secret',
      };

      const message = manager.getStatusMessage(options);

      expect(message).toContain('使用认证来源');
      expect(message).toContain('命令行参数');
    });

    it('应该返回错误状态消息', () => {
      const message = manager.getStatusMessage();

      // 当有错误时，应该包含认证错误信息
      expect(message).toContain('Auth configuration is incomplete');
    });
  });
});
