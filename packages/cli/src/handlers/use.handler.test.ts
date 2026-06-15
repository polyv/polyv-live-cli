/**
 * Unit tests for UseHandler
 */

import { UseHandler } from './use.handler';
import { SessionStateManager } from '../config/session-state';
import { AccountConfigManager } from '../config/account-config';
import { SessionState } from '../types/session.types';

// Mock dependencies
jest.mock('../config/session-state');
jest.mock('../config/account-config');

const MockSessionStateManager = SessionStateManager as jest.MockedClass<typeof SessionStateManager>;
const MockAccountConfigManager = AccountConfigManager as jest.MockedClass<typeof AccountConfigManager>;

describe('UseHandler', () => {
  let useHandler: UseHandler;
  let mockSessionManager: jest.Mocked<SessionStateManager>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock instances
    mockSessionManager = new MockSessionStateManager() as jest.Mocked<SessionStateManager>;
    
    // Setup default mock behaviors
    mockSessionManager.setSessionAccount.mockReturnValue({
      success: true,
      message: '已切换到账号 \'test-account\'，当前终端会话将使用此账号。'
    });
    
    mockSessionManager.clearSessionAccount.mockReturnValue({
      success: true,
      message: '已清除会话账号 \'test-account\'，当前终端将使用默认配置。'
    });
    
    mockSessionManager.getCurrentSessionAccount.mockReturnValue('test-account');
    
    mockSessionManager.getSessionState.mockReturnValue({
      accountName: 'test-account',
      processId: 12345,
      terminalId: 'term-abc123',
      setAt: new Date('2024-01-01T10:00:00Z')
    });
    
    mockSessionManager.getAuthStatusMessage.mockReturnValue('未设置当前会话账号。');
    
    mockSessionManager.cleanupExpiredSessions.mockReturnValue(0);
    
    useHandler = new UseHandler(mockSessionManager);
  });

  describe('handleUse', () => {
    it('should handle successful account switching', async () => {
      const result = await useHandler.handleUse('test-account');
      
      expect(result).toContain('已切换到账号 \'test-account\'');
      expect(mockSessionManager.setSessionAccount).toHaveBeenCalledWith('test-account');
    });

    it('should handle account switching failure', async () => {
      mockSessionManager.setSessionAccount.mockReturnValue({
        success: false,
        message: '账号 \'nonexistent\' 不存在。'
      });
      
      await expect(useHandler.handleUse('nonexistent')).rejects.toThrow('账号 \'nonexistent\' 不存在。');
    });

    it('should handle unexpected errors', async () => {
      mockSessionManager.setSessionAccount.mockImplementation(() => {
        throw new Error('Unexpected error');
      });
      
      await expect(useHandler.handleUse('test-account')).rejects.toThrow('切换账号失败: Unexpected error');
    });

    it('should handle non-Error exceptions', async () => {
      mockSessionManager.setSessionAccount.mockImplementation(() => {
        throw 'String error';
      });
      
      await expect(useHandler.handleUse('test-account')).rejects.toThrow('切换账号失败: 未知错误');
    });
  });

  describe('handleUseClear', () => {
    it('should handle successful session clearing', async () => {
      const result = await useHandler.handleUseClear();
      
      expect(result).toContain('已清除会话账号');
      expect(mockSessionManager.clearSessionAccount).toHaveBeenCalled();
    });

    it('should handle session clearing failure', async () => {
      mockSessionManager.clearSessionAccount.mockReturnValue({
        success: false,
        message: '当前终端没有设置会话账号。'
      });
      
      await expect(useHandler.handleUseClear()).rejects.toThrow('当前终端没有设置会话账号。');
    });

    it('should handle unexpected errors during clearing', async () => {
      mockSessionManager.clearSessionAccount.mockImplementation(() => {
        throw new Error('Clear error');
      });
      
      await expect(useHandler.handleUseClear()).rejects.toThrow('清除会话账号失败: Clear error');
    });
  });

  describe('handleUseStatus', () => {
    it('should show current session status with details', async () => {
      const result = await useHandler.handleUseStatus();
      
      expect(result).toContain('当前会话账号: test-account');
      expect(result).toContain('设置时间: 2024/1/1 10:00:00');
      expect(result).toContain('终端ID: term-abc123');
      expect(result).toContain('进程ID: 12345');
      expect(mockSessionManager.getCurrentSessionAccount).toHaveBeenCalled();
      expect(mockSessionManager.getSessionState).toHaveBeenCalled();
    });

    it('should show session status with expiration time', async () => {
      const sessionStateWithExpiration: SessionState = {
        accountName: 'test-account',
        processId: 12345,
        terminalId: 'term-abc123',
        setAt: new Date('2024-01-01T10:00:00Z'),
        expiresAt: new Date('2024-01-01T22:00:00Z')
      };
      mockSessionManager.getSessionState.mockReturnValue(sessionStateWithExpiration);
      
      const result = await useHandler.handleUseStatus();
      
      expect(result).toContain('过期时间: 2024/1/1 22:00:00');
    });

    it('should show auth status when no session account is set', async () => {
      mockSessionManager.getCurrentSessionAccount.mockReturnValue(null);
      mockSessionManager.getSessionState.mockReturnValue(null);
      
      const result = await useHandler.handleUseStatus();
      
      expect(result).toBe('未设置当前会话账号。');
      expect(mockSessionManager.getAuthStatusMessage).toHaveBeenCalled();
    });

    it('should handle errors during status retrieval', async () => {
      mockSessionManager.getCurrentSessionAccount.mockImplementation(() => {
        throw new Error('Status error');
      });
      
      await expect(useHandler.handleUseStatus()).rejects.toThrow('获取会话状态失败: Status error');
    });
  });

  describe('handleUseList', () => {
    it('should list available accounts with current session marker', async () => {
      const mockAccounts = [
        {
          name: 'account1',
          appId: 'app1',
          userId: 'user1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          name: 'test-account',
          appId: 'app2',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z'
        }
      ];
      
      // Mock AccountConfigManager through the session manager
      const mockAccountManager = new MockAccountConfigManager() as jest.Mocked<AccountConfigManager>;
      mockAccountManager.listAccounts.mockReturnValue(mockAccounts);
      
      // We need to mock the constructor to return our mock
      MockAccountConfigManager.mockImplementation(() => mockAccountManager);
      
      const result = await useHandler.handleUseList();
      
      expect(result).toContain('可用账号:');
      expect(result).toContain('account1');
      expect(result).toContain('test-account (当前会话)');
      expect(result).toContain('App ID: app1');
      expect(result).toContain('User ID: user1');
      expect(result).toContain('创建时间: 2024/1/1');
    });

    it('should show message when no accounts are configured', async () => {
      const mockAccountManager = new MockAccountConfigManager() as jest.Mocked<AccountConfigManager>;
      mockAccountManager.listAccounts.mockReturnValue([]);
      MockAccountConfigManager.mockImplementation(() => mockAccountManager);
      
      const result = await useHandler.handleUseList();
      
      expect(result).toContain('没有可用的账号配置');
      expect(result).toContain('polyv-live-cli account add <account-name>');
    });

    it('should show usage instruction when no current session', async () => {
      mockSessionManager.getCurrentSessionAccount.mockReturnValue(null);
      
      const mockAccounts = [
        {
          name: 'account1',
          appId: 'app1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];
      
      const mockAccountManager = new MockAccountConfigManager() as jest.Mocked<AccountConfigManager>;
      mockAccountManager.listAccounts.mockReturnValue(mockAccounts);
      MockAccountConfigManager.mockImplementation(() => mockAccountManager);
      
      const result = await useHandler.handleUseList();
      
      expect(result).toContain('polyv-live-cli use <account-name>');
    });

    it('should handle errors during account listing', async () => {
      const mockAccountManager = new MockAccountConfigManager() as jest.Mocked<AccountConfigManager>;
      mockAccountManager.listAccounts.mockImplementation(() => {
        throw new Error('List error');
      });
      MockAccountConfigManager.mockImplementation(() => mockAccountManager);
      
      await expect(useHandler.handleUseList()).rejects.toThrow('获取账号列表失败: List error');
    });
  });

  describe('handleCleanup', () => {
    it('should report successful cleanup', async () => {
      mockSessionManager.cleanupExpiredSessions.mockReturnValue(3);
      
      const result = await useHandler.handleCleanup();
      
      expect(result).toBe('已清理 3 个过期会话文件。');
      expect(mockSessionManager.cleanupExpiredSessions).toHaveBeenCalled();
    });

    it('should report when no cleanup is needed', async () => {
      mockSessionManager.cleanupExpiredSessions.mockReturnValue(0);
      
      const result = await useHandler.handleCleanup();
      
      expect(result).toBe('没有需要清理的过期会话文件。');
    });

    it('should handle cleanup errors', async () => {
      mockSessionManager.cleanupExpiredSessions.mockImplementation(() => {
        throw new Error('Cleanup error');
      });
      
      await expect(useHandler.handleCleanup()).rejects.toThrow('清理会话文件失败: Cleanup error');
    });
  });

  describe('getSessionManager', () => {
    it('should return the session manager instance', () => {
      const result = useHandler.getSessionManager();
      
      expect(result).toBe(mockSessionManager);
    });
  });

  describe('constructor', () => {
    it('should create with default session manager when none provided', () => {
      // Reset the mock to test default constructor behavior
      MockSessionStateManager.mockClear();
      MockAccountConfigManager.mockClear();
      
      new UseHandler();
      
      expect(MockAccountConfigManager).toHaveBeenCalled();
      expect(MockSessionStateManager).toHaveBeenCalled();
    });

    it('should use provided session manager', () => {
      const customSessionManager = new MockSessionStateManager() as jest.Mocked<SessionStateManager>;
      
      const handler = new UseHandler(customSessionManager);
      
      expect(handler.getSessionManager()).toBe(customSessionManager);
    });
  });
});
