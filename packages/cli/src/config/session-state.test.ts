/**
 * Unit tests for SessionStateManager
 */

import { SessionStateManager } from './session-state';
import { SessionStorage } from './session-storage';
import { AccountConfigManager } from './account-config';
import { SessionState } from '../types/session.types';

// Mock dependencies
jest.mock('./session-storage');
jest.mock('./account-config');

const MockSessionStorage = SessionStorage as jest.MockedClass<typeof SessionStorage>;
const MockAccountConfigManager = AccountConfigManager as jest.MockedClass<typeof AccountConfigManager>;

describe('SessionStateManager', () => {
  let sessionManager: SessionStateManager;
  let mockSessionStorage: jest.Mocked<SessionStorage>;
  let mockAccountManager: jest.Mocked<AccountConfigManager>;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Save original environment
    originalEnv = { ...process.env };
    
    // Clear environment variables that might interfere with tests
    delete process.env['POLYV_APP_ID'];
    delete process.env['POLYV_APP_SECRET'];
    delete process.env['POLYV_USER_ID'];
    delete process.env['POLYV_SESSION_ACCOUNT'];
    
    // Create mock instances
    mockSessionStorage = new MockSessionStorage() as jest.Mocked<SessionStorage>;
    mockAccountManager = new MockAccountConfigManager() as jest.Mocked<AccountConfigManager>;
    
    // Setup default mock behaviors
    mockAccountManager.accountExists.mockReturnValue(true);
    mockAccountManager.listAccounts.mockReturnValue([
      { name: 'account1', appId: 'app1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { name: 'account2', appId: 'app2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]);
    mockAccountManager.getAccount.mockReturnValue({
      name: 'account1',
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    mockSessionStorage.setSessionAccount.mockReturnValue(true);
    mockSessionStorage.clearSessionAccount.mockReturnValue(true);
    mockSessionStorage.getSessionAccount.mockReturnValue(null);
    mockSessionStorage.getSessionState.mockReturnValue(null);
    mockSessionStorage.cleanupExpiredSessions.mockReturnValue(0);
    mockSessionStorage.getSessionDir.mockReturnValue('/mock/session/dir');
    mockSessionStorage.getEnvVarName.mockReturnValue('POLYV_SESSION_ACCOUNT');
    
    sessionManager = new SessionStateManager(mockAccountManager, mockSessionStorage);
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('setSessionAccount', () => {
    it('should set session account successfully', () => {
      const result = sessionManager.setSessionAccount('account1');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('已切换到账号 \'account1\'');
      expect(mockAccountManager.accountExists).toHaveBeenCalledWith('account1');
      expect(mockSessionStorage.setSessionAccount).toHaveBeenCalledWith('account1');
    });

    it('should fail when account does not exist', () => {
      mockAccountManager.accountExists.mockReturnValue(false);
      
      const result = sessionManager.setSessionAccount('nonexistent');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('账号 \'nonexistent\' 不存在');
      expect(result.message).toContain('可用账号: account1, account2');
    });

    it('should provide guidance when no accounts are configured', () => {
      mockAccountManager.accountExists.mockReturnValue(false);
      mockAccountManager.listAccounts.mockReturnValue([]);
      
      const result = sessionManager.setSessionAccount('test-account');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('当前没有配置任何账号');
      expect(result.message).toContain('polyv-live-cli account add');
    });

    it('should fail when session storage fails', () => {
      mockSessionStorage.setSessionAccount.mockReturnValue(false);
      
      const result = sessionManager.setSessionAccount('account1');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('设置会话账号失败');
    });

    it('should validate account name format', () => {
      const result = sessionManager.setSessionAccount('invalid account name!');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('账号名称只能包含字母、数字、下划线和连字符');
    });

    it('should reject empty account name', () => {
      const result = sessionManager.setSessionAccount('');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('账号名称不能为空');
    });

    it('should reject account name that is too long', () => {
      const longName = 'a'.repeat(51); // Exceeds maxLength of 50
      
      const result = sessionManager.setSessionAccount(longName);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('账号名称不能超过 50 个字符');
    });

    it('should include session state in successful response', () => {
      const mockSessionState: SessionState = {
        accountName: 'account1',
        processId: 12345,
        terminalId: 'term-abc123',
        setAt: new Date()
      };
      mockSessionStorage.getSessionState.mockReturnValue(mockSessionState);
      
      const result = sessionManager.setSessionAccount('account1');
      
      expect(result.success).toBe(true);
      expect(result.sessionState).toEqual(mockSessionState);
    });
  });

  describe('getCurrentSessionAccount', () => {
    it('should return current session account', () => {
      mockSessionStorage.getSessionAccount.mockReturnValue('current-account');
      
      const result = sessionManager.getCurrentSessionAccount();
      
      expect(result).toBe('current-account');
      expect(mockSessionStorage.getSessionAccount).toHaveBeenCalled();
    });

    it('should return null when no session account is set', () => {
      mockSessionStorage.getSessionAccount.mockReturnValue(null);
      
      const result = sessionManager.getCurrentSessionAccount();
      
      expect(result).toBeNull();
    });
  });

  describe('clearSessionAccount', () => {
    it('should clear session account successfully', () => {
      mockSessionStorage.getSessionAccount.mockReturnValue('current-account');
      
      const result = sessionManager.clearSessionAccount();
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('已清除会话账号 \'current-account\'');
      expect(mockSessionStorage.clearSessionAccount).toHaveBeenCalled();
    });

    it('should fail when no session account is set', () => {
      mockSessionStorage.getSessionAccount.mockReturnValue(null);
      
      const result = sessionManager.clearSessionAccount();
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('当前终端没有设置会话账号');
    });

    it('should fail when storage operation fails', () => {
      mockSessionStorage.getSessionAccount.mockReturnValue('current-account');
      mockSessionStorage.clearSessionAccount.mockReturnValue(false);
      
      const result = sessionManager.clearSessionAccount();
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('清除会话账号失败');
    });
  });

  describe('getSessionState', () => {
    it('should return session state', () => {
      const mockSessionState: SessionState = {
        accountName: 'test-account',
        processId: 12345,
        terminalId: 'term-abc123',
        setAt: new Date()
      };
      mockSessionStorage.getSessionState.mockReturnValue(mockSessionState);
      
      const result = sessionManager.getSessionState();
      
      expect(result).toEqual(mockSessionState);
    });

    it('should return null when no session state exists', () => {
      mockSessionStorage.getSessionState.mockReturnValue(null);
      
      const result = sessionManager.getSessionState();
      
      expect(result).toBeNull();
    });
  });

  describe('getAuthSource', () => {
    it('should return command-line source with highest priority', () => {
      const commandLineArgs = { appId: 'cli-app-id', appSecret: 'cli-secret' };
      
      const result = sessionManager.getAuthSource(commandLineArgs);
      
      expect(result.type).toBe('command-line');
      expect(result.priority).toBe(1);
      expect(result.description).toBe('命令行参数');
    });

    it('should return session source when no command-line args', () => {
      mockSessionStorage.getSessionAccount.mockReturnValue('session-account');
      
      const result = sessionManager.getAuthSource();
      
      expect(result.type).toBe('session');
      expect(result.priority).toBe(2);
      expect(result.description).toBe('当前会话账号');
      expect(result.accountName).toBe('session-account');
    });

    it('should return environment source when no session account', () => {
      process.env['POLYV_APP_ID'] = 'env-app-id';
      process.env['POLYV_APP_SECRET'] = 'env-secret';
      
      const result = sessionManager.getAuthSource();
      
      expect(result.type).toBe('environment');
      expect(result.priority).toBe(3);
      expect(result.description).toBe('环境变量');
    });

    it('should return config source as fallback', () => {
      // Ensure no environment variables are set
      delete process.env['POLYV_APP_ID'];
      delete process.env['POLYV_APP_SECRET'];
      delete process.env['POLYV_USER_ID'];
      
      const result = sessionManager.getAuthSource();
      
      expect(result.type).toBe('config');
      expect(result.priority).toBe(4);
      expect(result.description).toBe('全局配置');
    });
  });

  describe('getAuthCredentials', () => {
    it('should return command-line credentials', () => {
      const commandLineArgs = { 
        appId: 'cli-app-id', 
        appSecret: 'cli-secret', 
        userId: 'cli-user-id' 
      };
      
      const result = sessionManager.getAuthCredentials(commandLineArgs);
      
      expect(result).toEqual({
        appId: 'cli-app-id',
        appSecret: 'cli-secret',
        userId: 'cli-user-id',
        source: expect.objectContaining({ type: 'command-line' })
      });
    });

    it('should return session credentials', () => {
      mockSessionStorage.getSessionAccount.mockReturnValue('session-account');
      
      const result = sessionManager.getAuthCredentials();
      
      expect(result).toEqual({
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
        source: expect.objectContaining({ type: 'session' })
      });
    });

    it('should return environment credentials', () => {
      process.env['POLYV_APP_ID'] = 'env-app-id';
      process.env['POLYV_APP_SECRET'] = 'env-secret';
      process.env['POLYV_USER_ID'] = 'env-user-id';
      
      const result = sessionManager.getAuthCredentials();
      
      expect(result).toEqual({
        appId: 'env-app-id',
        appSecret: 'env-secret',
        userId: 'env-user-id',
        source: expect.objectContaining({ type: 'environment' })
      });
    });

    it('should handle missing userId gracefully', () => {
      mockSessionStorage.getSessionAccount.mockReturnValue('session-account');
      mockAccountManager.getAccount.mockReturnValue({
        name: 'session-account',
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      const result = sessionManager.getAuthCredentials();
      
      expect(result).toEqual({
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        source: expect.objectContaining({ type: 'session' })
      });
      expect(result?.userId).toBeUndefined();
    });

    it('should return null when no credentials are available', () => {
      // Ensure no environment variables are set
      delete process.env['POLYV_APP_ID'];
      delete process.env['POLYV_APP_SECRET'];
      delete process.env['POLYV_USER_ID'];
      
      const result = sessionManager.getAuthCredentials();
      
      expect(result).toBeNull();
    });

    it('should handle session account that does not exist', () => {
      mockSessionStorage.getSessionAccount.mockReturnValue('nonexistent-account');
      mockAccountManager.getAccount.mockReturnValue(null);
      
      const result = sessionManager.getAuthCredentials();
      
      expect(result).toBeNull();
    });
  });

  describe('getAuthStatusMessage', () => {
    it('should return status with credentials available', () => {
      mockSessionStorage.getSessionAccount.mockReturnValue('session-account');
      
      const result = sessionManager.getAuthStatusMessage();
      
      expect(result).toContain('使用认证来源: 当前会话账号 (session-account)');
    });

    it('should provide guidance when session account does not exist', () => {
      // Clear environment variables
      delete process.env['POLYV_APP_ID'];
      delete process.env['POLYV_APP_SECRET'];
      delete process.env['POLYV_USER_ID'];
      
      // Mock that getAuthCredentials returns null (no valid credentials)
      jest.spyOn(sessionManager, 'getAuthCredentials').mockReturnValue(null);
      mockSessionStorage.getSessionAccount.mockReturnValue('nonexistent-account');
      mockAccountManager.accountExists.mockReturnValue(false);
      
      const result = sessionManager.getAuthStatusMessage();
      
      expect(result).toContain('当前会话账号 \'nonexistent-account\' 不存在');
      expect(result).toContain('polyv-live-cli use <account-name>');
    });

    it('should provide guidance when no accounts are configured', () => {
      // Clear environment variables
      delete process.env['POLYV_APP_ID'];
      delete process.env['POLYV_APP_SECRET'];
      delete process.env['POLYV_USER_ID'];
      
      mockAccountManager.listAccounts.mockReturnValue([]);
      
      const result = sessionManager.getAuthStatusMessage();
      
      expect(result).toContain('未找到认证信息');
      expect(result).toContain('polyv-live-cli account add <account-name>');
    });

    it('should suggest available accounts when no session is set', () => {
      // Clear environment variables
      delete process.env['POLYV_APP_ID'];
      delete process.env['POLYV_APP_SECRET'];
      delete process.env['POLYV_USER_ID'];
      
      const result = sessionManager.getAuthStatusMessage();
      
      expect(result).toContain('未设置当前会话账号');
      expect(result).toContain('可用账号: account1, account2');
      expect(result).toContain('polyv-live-cli use <account-name>');
    });
  });

  describe('utility methods', () => {
    it('should cleanup expired sessions', () => {
      mockSessionStorage.cleanupExpiredSessions.mockReturnValue(3);
      
      const result = sessionManager.cleanupExpiredSessions();
      
      expect(result).toBe(3);
      expect(mockSessionStorage.cleanupExpiredSessions).toHaveBeenCalled();
    });

    it('should return session directory', () => {
      const result = sessionManager.getSessionDir();
      
      expect(result).toBe('/mock/session/dir');
      expect(mockSessionStorage.getSessionDir).toHaveBeenCalled();
    });

    it('should return environment variable name', () => {
      const result = sessionManager.getEnvVarName();
      
      expect(result).toBe('POLYV_SESSION_ACCOUNT');
      expect(mockSessionStorage.getEnvVarName).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle account manager errors gracefully', () => {
      mockAccountManager.accountExists.mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const result = sessionManager.setSessionAccount('account1');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Database error');
    });

    it('should handle session storage errors gracefully', () => {
      mockSessionStorage.setSessionAccount.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const result = sessionManager.setSessionAccount('account1');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Storage error');
    });

    it('should handle getAuthCredentials errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockSessionStorage.getSessionAccount.mockReturnValue('session-account');
      mockAccountManager.getAccount.mockImplementation(() => {
        throw new Error('Account retrieval error');
      });
      
      const result = sessionManager.getAuthCredentials();
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Could not get auth credentials from session'));
      
      consoleSpy.mockRestore();
    });
  });
});
