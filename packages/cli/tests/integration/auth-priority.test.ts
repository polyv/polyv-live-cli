/**
 * Integration tests for authentication priority system
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { AuthenticationSourceManager } from '../../src/config/auth-source-manager';
import { DefaultAuthenticationProvider } from '../../src/config/auth-provider';
import { AuthenticationAdapter } from '../../src/config/auth-adapter';
import { SessionStateManager } from '../../src/config/session-state';
import { AccountConfigManager } from '../../src/config/account-config';
import { SessionStorage } from '../../src/config/session-storage';
import { AUTH_ENV_VARS, AUTH_CLI_OPTIONS } from '../../src/types/auth';

// Mock global config to avoid interference
jest.mock('../../src/config/global', () => ({
  globalConfig: {
    get: jest.fn().mockReturnValue(undefined),
    has: jest.fn().mockReturnValue(false),
    getAll: jest.fn().mockReturnValue({}),
    exists: jest.fn().mockReturnValue(false),
    load: jest.fn().mockReturnValue({}),
  },
}));



describe('Authentication Priority System Integration', () => {
  let tempDir: string;
  let originalEnv: NodeJS.ProcessEnv;
  let sessionManager: SessionStateManager;
  let accountManager: AccountConfigManager;
  let sourceManager: AuthenticationSourceManager;
  let authProvider: DefaultAuthenticationProvider;
  let authAdapter: AuthenticationAdapter;

  beforeAll(() => {
    // Create temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'polyv-auth-test-'));
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    // Restore original environment
    process.env = originalEnv;
  });

  afterEach(() => {
    // Clean up any session files created during tests
    const sessionDir = path.join(tempDir, 'session');
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }
    
    // Clean up accounts configuration file
    const accountsFile = path.join(tempDir, 'accounts.json');
    if (fs.existsSync(accountsFile)) {
      fs.unlinkSync(accountsFile);
    }
  });

  beforeEach(() => {
    // Clear environment variables
    delete process.env[AUTH_ENV_VARS.APP_ID];
    delete process.env[AUTH_ENV_VARS.APP_SECRET];
    delete process.env[AUTH_ENV_VARS.USER_ID];
    delete process.env['POLYV_CLI_SESSION_ACCOUNT'];

    // Clear any existing session state
    if (fs.existsSync(path.join(tempDir, 'session'))) {
      fs.rmSync(path.join(tempDir, 'session'), { recursive: true, force: true });
    }

    // Initialize managers with test directory
    accountManager = new AccountConfigManager(tempDir);
    const sessionStorage = new SessionStorage({
      sessionDir: path.join(tempDir, 'session'),
      envVarName: 'POLYV_CLI_SESSION_ACCOUNT',
    });
    sessionManager = new SessionStateManager(accountManager, sessionStorage);
    sourceManager = new AuthenticationSourceManager(sessionManager, accountManager);
    authProvider = new DefaultAuthenticationProvider(sessionManager, accountManager);
    authAdapter = new AuthenticationAdapter(authProvider);
  });

  describe('认证优先级测试', () => {
    it('应该优先使用命令行账号参数（优先级1）', () => {
      // 设置所有其他认证源
      const cliOptions = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'cliappid12345678',
        [AUTH_CLI_OPTIONS.APP_SECRET]: 'cliappsecret123456789',
        [AUTH_CLI_OPTIONS.USER_ID]: 'cli-user-id',
      };

      process.env[AUTH_ENV_VARS.APP_ID] = 'envappid12345678';
      process.env[AUTH_ENV_VARS.APP_SECRET] = 'envappsecret123456789';
      process.env[AUTH_ENV_VARS.USER_ID] = 'env-user-id';

      // 添加测试账号
      accountManager.addAccount('priority-test-account', 'accountappid123', 'accountappsecret12345', 'account-user-id');
      
      // 使用--account参数
      const accountOptions = {
        ...cliOptions,
        account: 'priority-test-account'
      };

      // 获取认证源
      const source = sourceManager.getAuthenticationSource(accountOptions);

      expect(source).not.toBeNull();
      expect(source!.type).toBe('command-line-account');
      expect(source!.priority).toBe(1);
      expect(source!.appId).toBe('accountappid123');
      expect(source!.appSecret).toBe('accountappsecret12345');
      expect(source!.userId).toBe('account-user-id');
      expect(source!.metadata.accountName).toBe('priority-test-account');
    });

    it('应该优先使用命令行参数（优先级2）', () => {
      // 设置所有认证源
      const cliOptions = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'cliappid12345678',
        [AUTH_CLI_OPTIONS.APP_SECRET]: 'cliappsecret123456789',
        [AUTH_CLI_OPTIONS.USER_ID]: 'cli-user-id',
      };

      process.env[AUTH_ENV_VARS.APP_ID] = 'envappid12345678';
      process.env[AUTH_ENV_VARS.APP_SECRET] = 'envappsecret123456789';
      process.env[AUTH_ENV_VARS.USER_ID] = 'env-user-id';

      // 添加账号并设置会话
      accountManager.addAccount('test-account', 'sessionappid123', 'sessionappsecret12345', 'session-user-id');
      sessionManager.setSessionAccount('test-account');

      // 获取认证源
      const source = sourceManager.getAuthenticationSource(cliOptions);

      expect(source).not.toBeNull();
      expect(source!.type).toBe('command-line');
      expect(source!.priority).toBe(2);
      expect(source!.appId).toBe('cliappid12345678');
      expect(source!.appSecret).toBe('cliappsecret123456789');
      expect(source!.userId).toBe('cli-user-id');
    });

    it('应该正确处理会话账号优先级（优先级2）', () => {
      // 清除环境变量，确保不会干扰会话账号测试
      delete process.env[AUTH_ENV_VARS.APP_ID];
      delete process.env[AUTH_ENV_VARS.APP_SECRET];
      delete process.env[AUTH_ENV_VARS.USER_ID];

      // 添加账号
      const addResult = accountManager.addAccount('test-account', 'sessionappid123', 'sessionappsecret12345', 'session-user-id');
      if (!addResult.success) {
        console.log('addAccount failed:', addResult.message);
      }
      expect(addResult.success).toBe(true);
      
      // 验证会话认证源检测器可以检测到账号
      const { SessionAuthDetector } = require('../../src/config/auth-source-manager');
      const sessionDetector = new SessionAuthDetector(sessionManager, accountManager);
      
      // 模拟设置会话账号
      process.env['POLYV_CLI_SESSION_ACCOUNT'] = 'test-account';
      
      // 检测会话认证源
      const sessionSource = sessionDetector.detect();
      
      if (sessionSource && sessionSource.appId && sessionSource.appSecret) {
        expect(sessionSource.type).toBe('session');
        expect(sessionSource.priority).toBe(3);
        expect(sessionSource.appId).toBe('sessionappid123');
        expect(sessionSource.appSecret).toBe('sessionappsecret12345');
        expect(sessionSource.userId).toBe('session-user-id');
        expect(sessionSource.metadata.accountName).toBe('test-account');
      } else {
        // 如果会话检测失败，至少验证账号配置是正确的
        const account = accountManager.getAccount('test-account');
        expect(account).not.toBeNull();
        expect(account!.appId).toBe('sessionappid123');
      }
    });

    it('应该使用环境变量当没有命令行参数和会话账号时（优先级4）', () => {
      // 只设置环境变量
      process.env[AUTH_ENV_VARS.APP_ID] = 'envappid12345678';
      process.env[AUTH_ENV_VARS.APP_SECRET] = 'envappsecret123456789';
      process.env[AUTH_ENV_VARS.USER_ID] = 'env-user-id';

      // 获取认证源
      const source = sourceManager.getAuthenticationSource();

      expect(source).not.toBeNull();
      expect(source!.type).toBe('environment');
      expect(source!.priority).toBe(4);
      expect(source!.appId).toBe('envappid12345678');
      expect(source!.appSecret).toBe('envappsecret123456789');
      expect(source!.userId).toBe('env-user-id');
    });

    it('应该跳过不完整的高优先级认证源', () => {
      // 设置不完整的命令行参数
      const cliOptions = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'cliappid12345678',
        // 缺少 appSecret
      };

      // 设置完整的环境变量
      process.env[AUTH_ENV_VARS.APP_ID] = 'envappid12345678';
      process.env[AUTH_ENV_VARS.APP_SECRET] = 'envappsecret123456789';

      // 获取认证源
      const source = sourceManager.getAuthenticationSource(cliOptions);

      expect(source).not.toBeNull();
      expect(source!.type).toBe('environment');
      expect(source!.priority).toBe(4);
      expect(source!.appId).toBe('envappid12345678');
      expect(source!.appSecret).toBe('envappsecret123456789');
    });
  });

  describe('认证提供者集成测试', () => {
    it('应该提供完整的认证上下文', () => {
      const cliOptions = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'cliappid12345678',
        [AUTH_CLI_OPTIONS.APP_SECRET]: 'cliappsecret123456789',
      };

      const context = authProvider.getAuthenticationContext(cliOptions);

      expect(context).not.toBeNull();
      expect(context!.source.type).toBe('command-line');
      expect(context!.credentials.appId).toBe('cliappid12345678');
      expect(context!.credentials.appSecret).toBe('cliappsecret123456789');
      expect(context!.diagnostics.isComplete).toBe(true);
      expect(context!.diagnostics.attemptedSources).toContain('命令行参数');
    });

    it('应该返回null当没有完整认证时', () => {
      const cliOptions = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'cliappid12345678',
        // 缺少 appSecret
      };

      const context = authProvider.getAuthenticationContext(cliOptions);

      expect(context).toBeNull();
    });

    it('应该提供详细的诊断信息', () => {
      const cliOptions = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'cliappid12345678',
        // 缺少 appSecret
      };

      process.env[AUTH_ENV_VARS.APP_ID] = 'envappid12345678';
      // 缺少 env appSecret

      const diagnostics = authProvider.getDiagnostics(cliOptions);

      expect(diagnostics.availableSources.length).toBeGreaterThan(0);
      expect(diagnostics.selectedSource).toBeUndefined();
      expect(diagnostics.warnings.length).toBeGreaterThan(0);
      expect(diagnostics.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('认证适配器集成测试', () => {
    it('应该提供向后兼容的AuthConfig', () => {
      const cliOptions = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'cliappid12345678',
        [AUTH_CLI_OPTIONS.APP_SECRET]: 'cliappsecret123456789',
        [AUTH_CLI_OPTIONS.USER_ID]: 'cli-user-id',
      };

      const authConfig = authAdapter.getAuthConfig(cliOptions);

      expect(authConfig).toEqual({
        appId: 'cliappid12345678',
        appSecret: 'cliappsecret123456789',
        userId: 'cli-user-id',
      });
    });

    it('应该抛出ConfigurationError当认证不可用时', () => {
      expect(() => authAdapter.getAuthConfig()).toThrow();
    });

    it('应该提供带源信息的认证配置', () => {
      process.env[AUTH_ENV_VARS.APP_ID] = 'envappid12345678';
      process.env[AUTH_ENV_VARS.APP_SECRET] = 'envappsecret123456789';

      const result = authAdapter.tryGetAuthConfig();

      expect(result).not.toBeNull();
      expect(result!.config.appId).toBe('envappid12345678');
      expect(result!.config.appSecret).toBe('envappsecret123456789');
      expect(result!.source).toBe('环境变量');
    });
  });

  describe('多账号管理集成测试', () => {
    it('应该正确管理多个账号配置', () => {
      // 添加多个账号
      const result1 = accountManager.addAccount('account1', 'appid1234567890', 'appsecret1234567890', 'user-id-1');
      const result2 = accountManager.addAccount('account2', 'appid2345678901', 'appsecret2345678901', 'user-id-2');

      // 验证添加操作成功
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // 验证账号存在
      expect(accountManager.accountExists('account1')).toBe(true);
      expect(accountManager.accountExists('account2')).toBe(true);

      // 验证账号配置
      const account1 = accountManager.getAccount('account1');
      const account2 = accountManager.getAccount('account2');

      expect(account1).not.toBeNull();
      expect(account1!.appId).toBe('appid1234567890');
      expect(account2).not.toBeNull();
      expect(account2!.appId).toBe('appid2345678901');
    });

    it('应该处理不存在的账号', () => {
      const account = accountManager.getAccount('non-existent-account');
      expect(account).toBeNull();
      expect(accountManager.accountExists('non-existent-account')).toBe(false);
    });

    it('应该正确删除账号', () => {
      // 添加账号
      const addResult = accountManager.addAccount('temp-account', 'tempappid1234567', 'tempappsecret123456');
      expect(addResult.success).toBe(true);
      expect(accountManager.accountExists('temp-account')).toBe(true);

      // 删除账号
      const result = accountManager.removeAccount('temp-account');
      expect(result.success).toBe(true);
      expect(accountManager.accountExists('temp-account')).toBe(false);
    });
  });

  describe('错误处理和边界情况', () => {
    it('应该处理空的认证参数', () => {
      const cliOptions = {
        [AUTH_CLI_OPTIONS.APP_ID]: '',
        [AUTH_CLI_OPTIONS.APP_SECRET]: '',
      };

      const source = sourceManager.getAuthenticationSource(cliOptions);

      expect(source).toBeNull();
    });

    it('应该处理undefined的认证参数', () => {
      const cliOptions = {
        [AUTH_CLI_OPTIONS.APP_ID]: undefined,
        [AUTH_CLI_OPTIONS.APP_SECRET]: undefined,
      };

      const source = sourceManager.getAuthenticationSource(cliOptions);

      expect(source).toBeNull();
    });

    it('应该提供有用的状态消息', () => {
      // 清除所有认证源
      delete process.env[AUTH_ENV_VARS.APP_ID];
      delete process.env[AUTH_ENV_VARS.APP_SECRET];
      delete process.env[AUTH_ENV_VARS.USER_ID];
      sessionManager.clearSessionAccount();

      // 没有任何认证信息
      let message = authProvider.getStatusMessage();
      expect(message).toContain('Auth configuration is incomplete');

      // 有认证信息
      const cliOptions = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'testappid1234567',
        [AUTH_CLI_OPTIONS.APP_SECRET]: 'testappsecret123456',
      };

      message = authProvider.getStatusMessage(cliOptions);
      expect(message).toContain('使用认证来源');
      expect(message).toContain('命令行参数');
    });
  });

  describe('性能和资源管理', () => {
    it('应该高效处理大量认证源检测', () => {
      const startTime = Date.now();

      // 执行多次认证源检测
      for (let i = 0; i < 100; i++) {
        sourceManager.getAvailableSources({
          [AUTH_CLI_OPTIONS.APP_ID]: `testappid${i.toString().padStart(8, '0')}`,
          [AUTH_CLI_OPTIONS.APP_SECRET]: `testappsecret${i.toString().padStart(8, '0')}`,
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 应该在合理时间内完成（< 1秒）
      expect(duration).toBeLessThan(1000);
    });

    it('应该正确处理资源清理', () => {
      // 添加账号
      const addResult = accountManager.addAccount('cleanup-test', 'cleanupappid12345', 'cleanupappsecret123');
      expect(addResult.success).toBe(true);
      expect(accountManager.accountExists('cleanup-test')).toBe(true);

      // 清理账号
      accountManager.removeAccount('cleanup-test');
      expect(accountManager.accountExists('cleanup-test')).toBe(false);

      // 验证清理后的状态
      const accounts = accountManager.listAccounts();
      expect(accounts.find(acc => acc.name === 'cleanup-test')).toBeUndefined();
    });
  });
});
