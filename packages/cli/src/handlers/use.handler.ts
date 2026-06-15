/**
 * Use command handler for session account management
 */

import { SessionStateManager } from '../config/session-state';
import { AccountConfigManager } from '../config/account-config';

/**
 * Use command handler class
 */
export class UseHandler {
  private sessionManager: SessionStateManager;

  /**
   * Initialize UseHandler
   * @param sessionManager Optional session state manager instance
   */
  constructor(sessionManager?: SessionStateManager) {
    const accountManager = new AccountConfigManager();
    this.sessionManager = sessionManager || new SessionStateManager(accountManager);
  }

  /**
   * Handle use command to switch session account
   * @param accountName Account name to switch to
   * @returns Operation result message
   */
  public async handleUse(accountName: string): Promise<string> {
    try {
      const result = this.sessionManager.setSessionAccount(accountName);
      
      if (result.success) {
        return result.message;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw new Error(`切换账号失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * Handle use clear command to clear session account
   * @returns Operation result message
   */
  public async handleUseClear(): Promise<string> {
    try {
      const result = this.sessionManager.clearSessionAccount();
      
      if (result.success) {
        return result.message;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw new Error(`清除会话账号失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * Format date to consistent string format
   * @param date Date to format
   * @returns Formatted date string
   */
  private formatDateTime(date: Date): string {
    // Convert to UTC and format manually to ensure consistency across environments
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    
    return `${year}/${month}/${day} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Handle use status command to show current session status
   * @returns Status message
   */
  public async handleUseStatus(): Promise<string> {
    try {
      const currentAccount = this.sessionManager.getCurrentSessionAccount();
      const sessionState = this.sessionManager.getSessionState();
      
      if (!currentAccount) {
        return this.sessionManager.getAuthStatusMessage();
      }

      let statusMessage = `当前会话账号: ${currentAccount}`;
      
      if (sessionState) {
        const setTime = this.formatDateTime(sessionState.setAt);
        statusMessage += `\n设置时间: ${setTime}`;
        
        if (sessionState.expiresAt) {
          const expireTime = this.formatDateTime(sessionState.expiresAt);
          statusMessage += `\n过期时间: ${expireTime}`;
        }
        
        statusMessage += `\n终端ID: ${sessionState.terminalId}`;
        statusMessage += `\n进程ID: ${sessionState.processId}`;
      }

      return statusMessage;
    } catch (error) {
      throw new Error(`获取会话状态失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * Handle use list command to show available accounts
   * @returns Available accounts message
   */
  public async handleUseList(): Promise<string> {
    try {
      const accountManager = new AccountConfigManager();
      const accounts = accountManager.listAccounts();
      const currentAccount = this.sessionManager.getCurrentSessionAccount();
      
      if (accounts.length === 0) {
        return '没有可用的账号配置。使用 \'polyv-live-cli account add <account-name>\' 添加账号。';
      }

      let message = '可用账号:\n';
      
      for (const account of accounts) {
        const isCurrent = account.name === currentAccount;
        const marker = isCurrent ? ' (当前会话)' : '';
        const createdAt = new Date(account.createdAt).toLocaleDateString('zh-CN');
        
        message += `  ${account.name}${marker}\n`;
        message += `    App ID: ${account.appId}\n`;
        if (account.userId) {
          message += `    User ID: ${account.userId}\n`;
        }
        message += `    创建时间: ${createdAt}\n`;
      }

      if (!currentAccount) {
        message += '\n使用 \'polyv-live-cli use <account-name>\' 切换到指定账号。';
      }

      return message.trim();
    } catch (error) {
      throw new Error(`获取账号列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * Clean up expired session files
   * @returns Cleanup result message
   */
  public async handleCleanup(): Promise<string> {
    try {
      const cleanedCount = this.sessionManager.cleanupExpiredSessions();
      
      if (cleanedCount === 0) {
        return '没有需要清理的过期会话文件。';
      }
      
      return `已清理 ${cleanedCount} 个过期会话文件。`;
    } catch (error) {
      throw new Error(`清理会话文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * Get session manager instance
   * @returns Session manager instance
   */
  public getSessionManager(): SessionStateManager {
    return this.sessionManager;
  }
}
