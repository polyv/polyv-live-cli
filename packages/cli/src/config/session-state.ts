/**
 * Session state manager for multi-account session handling
 */

import { SessionState, SessionOperationResult, AuthSource, SessionStateValidation } from '../types/session.types';
import { SessionStorage } from './session-storage';
import { AccountConfigManager } from './account-config';

/**
 * Session state manager class
 */
export class SessionStateManager {
  private sessionStorage: SessionStorage;
  private accountManager: AccountConfigManager;

  /**
   * Initialize SessionStateManager
   * @param accountManager Account configuration manager instance
   * @param sessionStorage Optional custom session storage instance
   */
  constructor(accountManager?: AccountConfigManager, sessionStorage?: SessionStorage) {
    this.accountManager = accountManager || new AccountConfigManager();
    this.sessionStorage = sessionStorage || new SessionStorage();
  }

  /**
   * Set current session account
   * @param accountName Account name to set
   * @returns Operation result
   */
  public setSessionAccount(accountName: string): SessionOperationResult {
    try {
      // Validate account name format
      this.validateAccountName(accountName);

      // Check if account exists in configuration
      if (!this.accountManager.accountExists(accountName)) {
        const availableAccounts = this.accountManager.listAccounts();
        const suggestion = availableAccounts.length > 0 
          ? `\n\n可用账号: ${availableAccounts.map(acc => acc.name).join(', ')}\n使用 'polyv-live-cli account add <account-name>' 添加新账号。`
          : '\n\n当前没有配置任何账号。使用 \'polyv-live-cli account add <account-name>\' 添加账号。';

        return {
          success: false,
          message: `账号 '${accountName}' 不存在。${suggestion}`
        };
      }

      // Set session account
      const success = this.sessionStorage.setSessionAccount(accountName);
      if (!success) {
        return {
          success: false,
          message: '设置会话账号失败，请检查文件权限。'
        };
      }

      // Get session state for response
      const sessionState = this.sessionStorage.getSessionState();

      return {
        success: true,
        message: `已切换到账号 '${accountName}'，当前终端会话将使用此账号。`,
        ...(sessionState && { sessionState })
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '设置会话账号时发生未知错误'
      };
    }
  }

  /**
   * Get current session account
   * @returns Account name if set, null otherwise
   */
  public getCurrentSessionAccount(): string | null {
    return this.sessionStorage.getSessionAccount();
  }

  /**
   * Clear current session account
   * @returns Operation result
   */
  public clearSessionAccount(): SessionOperationResult {
    try {
      const currentAccount = this.getCurrentSessionAccount();
      
      if (!currentAccount) {
        return {
          success: false,
          message: '当前终端没有设置会话账号。'
        };
      }

      const success = this.sessionStorage.clearSessionAccount();
      if (!success) {
        return {
          success: false,
          message: '清除会话账号失败，请检查文件权限。'
        };
      }

      return {
        success: true,
        message: `已清除会话账号 '${currentAccount}'，当前终端将使用默认配置。`
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '清除会话账号时发生未知错误'
      };
    }
  }

  /**
   * Get current session state
   * @returns Session state if exists, null otherwise
   */
  public getSessionState(): SessionState | null {
    return this.sessionStorage.getSessionState();
  }

  /**
   * Get authentication source information
   * @param commandLineArgs Optional command line arguments
   * @returns Authentication source information
   */
  public getAuthSource(commandLineArgs?: { appId?: string; appSecret?: string; userId?: string }): AuthSource {
    // Priority 1: Command line arguments
    if (commandLineArgs && (commandLineArgs.appId || commandLineArgs.appSecret)) {
      return {
        type: 'command-line',
        description: '命令行参数',
        priority: 1
      };
    }

    // Priority 2: Session account
    const sessionAccount = this.getCurrentSessionAccount();
    if (sessionAccount) {
      return {
        type: 'session',
        description: '当前会话账号',
        accountName: sessionAccount,
        priority: 2
      };
    }

    // Priority 3: Environment variables
    if (process.env['POLYV_APP_ID'] || process.env['POLYV_APP_SECRET']) {
      return {
        type: 'environment',
        description: '环境变量',
        priority: 3
      };
    }

    // Priority 4: Global config
    return {
      type: 'config',
      description: '全局配置',
      priority: 4
    };
  }

  /**
   * Get authentication credentials with priority handling
   * @param commandLineArgs Optional command line arguments
   * @returns Authentication credentials or null if not available
   */
  public getAuthCredentials(commandLineArgs?: { appId?: string; appSecret?: string; userId?: string }): {
    appId: string;
    appSecret: string;
    userId?: string;
    source: AuthSource;
  } | null {
    const authSource = this.getAuthSource(commandLineArgs);

    try {
      switch (authSource.type) {
        case 'command-line': {
          if (commandLineArgs?.appId && commandLineArgs?.appSecret) {
            return {
              appId: commandLineArgs.appId,
              appSecret: commandLineArgs.appSecret,
              ...(commandLineArgs.userId && { userId: commandLineArgs.userId }),
              source: authSource
            };
          }
          break;
        }

        case 'session': {
          if (authSource.accountName) {
            const account = this.accountManager.getAccount(authSource.accountName);
            if (account) {
              return {
                appId: account.appId,
                appSecret: account.appSecret,
                ...(account.userId && { userId: account.userId }),
                source: authSource
              };
            }
          }
          break;
        }

        case 'environment': {
          const envAppId = process.env['POLYV_APP_ID'];
          const envAppSecret = process.env['POLYV_APP_SECRET'];
          if (envAppId && envAppSecret) {
            return {
              appId: envAppId,
              appSecret: envAppSecret,
              ...(process.env['POLYV_USER_ID'] && { userId: process.env['POLYV_USER_ID'] }),
              source: authSource
            };
          }
          break;
        }

        case 'config':
          // This would need to be implemented based on existing config system
          // For now, return null to indicate no config-based auth available
          break;
      }

      return null;
    } catch (error) {
      console.warn(`Warning: Could not get auth credentials from ${authSource.type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  /**
   * Get user-friendly authentication status message
   * @param commandLineArgs Optional command line arguments
   * @returns Status message with guidance
   */
  public getAuthStatusMessage(commandLineArgs?: { appId?: string; appSecret?: string; userId?: string }): string {
    const credentials = this.getAuthCredentials(commandLineArgs);
    
    if (credentials) {
      const sourceDesc = credentials.source.accountName 
        ? `${credentials.source.description} (${credentials.source.accountName})`
        : credentials.source.description;
      
      return `使用认证来源: ${sourceDesc}`;
    }

    // No authentication available - provide guidance
    const sessionAccount = this.getCurrentSessionAccount();
    const availableAccounts = this.accountManager.listAccounts();

    if (sessionAccount && !this.accountManager.accountExists(sessionAccount)) {
      return `当前会话账号 '${sessionAccount}' 不存在。请使用 'polyv-live-cli use <account-name>' 切换到有效账号，或使用 'polyv-live-cli account add' 添加账号。`;
    }

    if (availableAccounts.length === 0) {
      return '未找到认证信息。请使用以下方式之一设置认证:\n' +
             '1. 添加账号: polyv-live-cli account add <account-name>\n' +
             '2. 设置环境变量: POLYV_APP_ID, POLYV_APP_SECRET\n' +
             '3. 使用命令行参数: --app-id, --app-secret';
    }

    const accountList = availableAccounts.map(acc => acc.name).join(', ');
    return `未设置当前会话账号。可用账号: ${accountList}\n` +
           `使用 'polyv-live-cli use <account-name>' 切换账号。`;
  }

  /**
   * Validate account name format
   * @param accountName Account name to validate
   * @throws Error if validation fails
   */
  private validateAccountName(accountName: string): void {
    if (!accountName || typeof accountName !== 'string') {
      throw new Error('账号名称不能为空');
    }

    if (!SessionStateValidation.accountName.pattern.test(accountName)) {
      throw new Error('账号名称只能包含字母、数字、下划线和连字符');
    }

    if (accountName.length > SessionStateValidation.accountName.maxLength) {
      throw new Error(`账号名称不能超过 ${SessionStateValidation.accountName.maxLength} 个字符`);
    }
  }

  /**
   * Cleanup expired session files
   * @returns Number of cleaned files
   */
  public cleanupExpiredSessions(): number {
    return this.sessionStorage.cleanupExpiredSessions();
  }

  /**
   * Get session storage directory path
   * @returns Session directory path
   */
  public getSessionDir(): string {
    return this.sessionStorage.getSessionDir();
  }

  /**
   * Get environment variable name for session account
   * @returns Environment variable name
   */
  public getEnvVarName(): string {
    return this.sessionStorage.getEnvVarName();
  }
}
