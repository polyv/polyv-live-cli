/**
 * Authentication source manager for priority-based authentication
 */

import {
  AuthenticationSource,
  AuthenticationSourceType,
  AuthenticationSourceDetector,
  AUTH_PRIORITY,
  SOURCE_DESCRIPTIONS,
} from '../types/auth-source.types';
import { SessionStateManager } from './session-state';
import { AccountConfigManager } from './account-config';
import { AUTH_ENV_VARS, AUTH_CLI_OPTIONS } from '../types/auth';

/**
 * Command line account authentication source detector (--account parameter)
 */
export class CommandLineAccountDetector implements AuthenticationSourceDetector {
  readonly type: AuthenticationSourceType = 'command-line-account';
  readonly priority: number = AUTH_PRIORITY.COMMAND_LINE_ACCOUNT;

  private accountManager: AccountConfigManager;

  constructor(accountManager?: AccountConfigManager) {
    this.accountManager = accountManager || new AccountConfigManager();
  }

  detect(options?: Record<string, unknown>): AuthenticationSource | null {
    if (!options) {
      return null;
    }

    const accountName = options['account'] as string | undefined;

    // Check if --account parameter is provided
    if (!accountName) {
      return null;
    }

    try {
      // Check if account exists
      if (!this.accountManager.accountExists(accountName)) {
        return {
          type: this.type,
          priority: this.priority,
          metadata: {
            source: SOURCE_DESCRIPTIONS[this.type],
            accountName,
            setAt: new Date(),
            context: {
              error: 'account_not_found',
              message: `指定的账号 '${accountName}' 不存在`,
            },
          },
        };
      }

      const account = this.accountManager.getAccount(accountName);
      if (!account) {
        return null;
      }

      return {
        type: this.type,
        priority: this.priority,
        appId: account.appId,
        appSecret: account.appSecret,
        userId: account.userId,
        baseUrl: account.baseUrl,
        environment: account.environment,
        metadata: {
          source: SOURCE_DESCRIPTIONS[this.type],
          accountName,
          setAt: new Date(),
          context: {
            providedAccountName: accountName,
          },
        },
      };
    } catch (error) {
      return {
        type: this.type,
        priority: this.priority,
        metadata: {
          source: SOURCE_DESCRIPTIONS[this.type],
          accountName,
          setAt: new Date(),
          context: {
            error: 'detection_failed',
            message: error instanceof Error ? error.message : '账号检测失败',
          },
        },
      };
    }
  }

  isAvailable(options?: Record<string, unknown>): boolean {
    const source = this.detect(options);
    return source !== null && !!source.appId && !!source.appSecret;
  }
}

/**
 * Command line authentication source detector
 */
export class CommandLineAuthDetector implements AuthenticationSourceDetector {
  readonly type: AuthenticationSourceType = 'command-line';
  readonly priority: number = AUTH_PRIORITY.COMMAND_LINE;

  detect(options?: Record<string, unknown>): AuthenticationSource | null {
    if (!options) {
      return null;
    }

    const appId = options[AUTH_CLI_OPTIONS.APP_ID] as string | undefined;
    const appSecret = options[AUTH_CLI_OPTIONS.APP_SECRET] as string | undefined;
    const userId = options[AUTH_CLI_OPTIONS.USER_ID] as string | undefined;

    // Check if any command line auth parameters are provided
    if (!appId && !appSecret && !userId) {
      return null;
    }

    return {
      type: this.type,
      priority: this.priority,
      appId,
      appSecret,
      userId,
      metadata: {
        source: SOURCE_DESCRIPTIONS[this.type],
        setAt: new Date(),
        context: {
          providedParams: {
            appId: !!appId,
            appSecret: !!appSecret,
            userId: !!userId,
          },
        },
      },
    };
  }

  isAvailable(options?: Record<string, unknown>): boolean {
    if (!options) {
      return false;
    }

    const appId = options[AUTH_CLI_OPTIONS.APP_ID] as string | undefined;
    const appSecret = options[AUTH_CLI_OPTIONS.APP_SECRET] as string | undefined;

    // Only consider available if both appId and appSecret are provided
    return !!(appId && appSecret);
  }
}

/**
 * Session account authentication source detector
 */
export class SessionAuthDetector implements AuthenticationSourceDetector {
  readonly type: AuthenticationSourceType = 'session';
  readonly priority: number = AUTH_PRIORITY.SESSION;

  private sessionManager: SessionStateManager;
  private accountManager: AccountConfigManager;

  constructor(sessionManager?: SessionStateManager, accountManager?: AccountConfigManager) {
    this.sessionManager = sessionManager || new SessionStateManager();
    this.accountManager = accountManager || new AccountConfigManager();
  }

  detect(_options?: Record<string, unknown>): AuthenticationSource | null {
    try {
      const sessionAccount = this.sessionManager.getCurrentSessionAccount();
      if (!sessionAccount) {
        return null;
      }

      // Check if account exists and get its configuration
      if (!this.accountManager.accountExists(sessionAccount)) {
        return {
          type: this.type,
          priority: this.priority,
          metadata: {
            source: SOURCE_DESCRIPTIONS[this.type],
            accountName: sessionAccount,
            setAt: new Date(),
            context: {
              error: 'account_not_found',
              message: `会话账号 '${sessionAccount}' 不存在`,
            },
          },
        };
      }

      const account = this.accountManager.getAccount(sessionAccount);
      if (!account) {
        return null;
      }

      return {
        type: this.type,
        priority: this.priority,
        appId: account.appId,
        appSecret: account.appSecret,
        userId: account.userId,
        baseUrl: account.baseUrl,
        environment: account.environment,
        metadata: {
          source: SOURCE_DESCRIPTIONS[this.type],
          accountName: sessionAccount,
          setAt: new Date(),
          context: {
            sessionState: this.sessionManager.getSessionState(),
          },
        },
      };
    } catch (error) {
      return {
        type: this.type,
        priority: this.priority,
        metadata: {
          source: SOURCE_DESCRIPTIONS[this.type],
          setAt: new Date(),
          context: {
            error: 'detection_failed',
            message: error instanceof Error ? error.message : '会话账号检测失败',
          },
        },
      };
    }
  }

  isAvailable(options?: Record<string, unknown>): boolean {
    const source = this.detect(options);
    return source !== null && !!source.appId && !!source.appSecret;
  }
}

/**
 * Default account authentication source detector
 */
export class DefaultAccountAuthDetector implements AuthenticationSourceDetector {
  readonly type: AuthenticationSourceType = 'default-account';
  readonly priority: number = AUTH_PRIORITY.DEFAULT_ACCOUNT;
  private accountManager: AccountConfigManager;

  constructor(accountManager?: AccountConfigManager) {
    this.accountManager = accountManager || new AccountConfigManager();
  }

  detect(_options?: Record<string, unknown>): AuthenticationSource | null {
    try {
      const defaultAccountName = this.accountManager.getDefaultAccount();
      if (!defaultAccountName) {
        return null;
      }

      // Check if default account exists
      if (!this.accountManager.accountExists(defaultAccountName)) {
        return {
          type: this.type,
          priority: this.priority,
          metadata: {
            source: SOURCE_DESCRIPTIONS[this.type],
            accountName: defaultAccountName,
            setAt: new Date(),
            context: {
              error: 'default_account_not_found',
              message: `默认账号 '${defaultAccountName}' 不存在`,
            },
          },
        };
      }

      const account = this.accountManager.getAccount(defaultAccountName);
      if (!account) {
        return null;
      }

      return {
        type: this.type,
        priority: this.priority,
        appId: account.appId,
        appSecret: account.appSecret,
        userId: account.userId,
        baseUrl: account.baseUrl,
        environment: account.environment,
        metadata: {
          source: SOURCE_DESCRIPTIONS[this.type],
          accountName: defaultAccountName,
          setAt: new Date(),
          context: {
            defaultAccount: defaultAccountName,
          },
        },
      };

    } catch (error) {
      return {
        type: this.type,
        priority: this.priority,
        metadata: {
          source: SOURCE_DESCRIPTIONS[this.type],
          setAt: new Date(),
          context: {
            error: 'detection_failed',
            message: error instanceof Error ? error.message : '默认账号检测失败',
          },
        },
      };
    }
  }

  isAvailable(options?: Record<string, unknown>): boolean {
    const source = this.detect(options);
    return source !== null && !!source.appId && !!source.appSecret;
  }
}

/**
 * Environment variable authentication source detector
 */
export class EnvironmentAuthDetector implements AuthenticationSourceDetector {
  readonly type: AuthenticationSourceType = 'environment';
  readonly priority: number = AUTH_PRIORITY.ENVIRONMENT;

  detect(_options?: Record<string, unknown>): AuthenticationSource | null {
    const appId = process.env[AUTH_ENV_VARS.APP_ID];
    const appSecret = process.env[AUTH_ENV_VARS.APP_SECRET];
    const userId = process.env[AUTH_ENV_VARS.USER_ID];

    // Check if any environment variables are set
    if (!appId && !appSecret && !userId) {
      return null;
    }

    return {
      type: this.type,
      priority: this.priority,
      appId: appId?.trim(),
      appSecret: appSecret?.trim(),
      userId: userId?.trim(),
      metadata: {
        source: SOURCE_DESCRIPTIONS[this.type],
        setAt: new Date(),
        context: {
          envVars: {
            [AUTH_ENV_VARS.APP_ID]: !!appId,
            [AUTH_ENV_VARS.APP_SECRET]: !!appSecret,
            [AUTH_ENV_VARS.USER_ID]: !!userId,
          },
        },
      },
    };
  }

  isAvailable(options?: Record<string, unknown>): boolean {
    const source = this.detect(options);
    return source !== null && !!source.appId && !!source.appSecret;
  }
}

/**
 * Config-based authentication source detector
 */
export class ConfigAuthDetector implements AuthenticationSourceDetector {
  readonly type: AuthenticationSourceType = 'config';
  readonly priority: number = AUTH_PRIORITY.CONFIG;

  detect(_options?: Record<string, unknown>): AuthenticationSource | null {
    try {
      // Import globalConfig dynamically to avoid circular dependencies
      const { globalConfig } = require('./global');
      
      if (!globalConfig.exists()) {
        return null;
      }

      const config = globalConfig.load();
      const appId = config.appId;
      const appSecret = config.appSecret;
      const userId = config.userId;

      // Check if any config values are set
      if (!appId && !appSecret && !userId) {
        return null;
      }

      return {
        type: this.type,
        priority: this.priority,
        appId,
        appSecret,
        userId,
        metadata: {
          source: SOURCE_DESCRIPTIONS[this.type],
          setAt: new Date(),
          context: {
            configFile: globalConfig.getConfigPath(),
            configExists: globalConfig.exists(),
            validation: globalConfig.validate(config),
          },
        },
      };
    } catch (error) {
      return {
        type: this.type,
        priority: this.priority,
        metadata: {
          source: SOURCE_DESCRIPTIONS[this.type],
          setAt: new Date(),
          context: {
            error: 'detection_failed',
            message: error instanceof Error ? error.message : '全局配置检测失败',
          },
        },
      };
    }
  }

  isAvailable(options?: Record<string, unknown>): boolean {
    const source = this.detect(options);
    return source !== null && !!source.appId && !!source.appSecret;
  }
}

/**
 * Authentication source manager for priority-based source selection
 */
export class AuthenticationSourceManager {
  private detectors: AuthenticationSourceDetector[];

  constructor(
    sessionManager?: SessionStateManager,
    accountManager?: AccountConfigManager
  ) {
    this.detectors = [
      new CommandLineAccountDetector(accountManager),
      new CommandLineAuthDetector(),
      new SessionAuthDetector(sessionManager, accountManager),
      new DefaultAccountAuthDetector(accountManager),
      new EnvironmentAuthDetector(),
      new ConfigAuthDetector(),
    ];

    // Sort detectors by priority (lowest number = highest priority)
    this.detectors.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get all available authentication sources
   * @param options Optional command line options
   * @returns Array of available authentication sources
   */
  public getAvailableSources(options?: Record<string, unknown>): AuthenticationSource[] {
    const sources: AuthenticationSource[] = [];

    for (const detector of this.detectors) {
      try {
        const source = detector.detect(options);
        if (source) {
          sources.push(source);
        }
      } catch (error) {
        // Log warning but continue with other detectors
        console.warn(`Warning: Authentication source detection failed for ${detector.type}: ${error}`);
      }
    }

    return sources;
  }

  /**
   * Get the highest priority complete authentication source
   * @param options Optional command line options
   * @returns Authentication source or null if none available
   */
  public getAuthenticationSource(options?: Record<string, unknown>): AuthenticationSource | null {
    const sources = this.getAvailableSources(options);

    // Find the first complete authentication source (has both appId and appSecret)
    for (const source of sources) {
      if (this.isCompleteAuthentication(source)) {
        return source;
      }
    }

    return null;
  }

  /**
   * Check if authentication source is complete
   * @param source Authentication source to check
   * @returns Whether authentication is complete
   */
  public isCompleteAuthentication(source: AuthenticationSource): boolean {
    return !!(source.appId && source.appSecret);
  }

  /**
   * Get authentication credentials from the highest priority source
   * @param options Optional command line options
   * @returns Authentication credentials or null
   */
  public getCredentials(options?: Record<string, unknown>): {
    appId: string;
    appSecret: string;
    userId?: string;
  } | null {
    const source = this.getAuthenticationSource(options);
    if (!source || !this.isCompleteAuthentication(source)) {
      return null;
    }

    return {
      appId: source.appId!,
      appSecret: source.appSecret!,
      ...(source.userId && { userId: source.userId }),
    };
  }

  /**
   * Get detailed authentication diagnostics
   * @param options Optional command line options
   * @returns Diagnostic information
   */
  public getDiagnostics(options?: Record<string, unknown>): {
    availableSources: AuthenticationSource[];
    selectedSource?: AuthenticationSource;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const availableSources = this.getAvailableSources(options);
    const selectedSource = this.getAuthenticationSource(options);
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for incomplete sources
    for (const source of availableSources) {
      if (!this.isCompleteAuthentication(source)) {
        const missing = [];
        if (!source.appId) missing.push('appId');
        if (!source.appSecret) missing.push('appSecret');
        
        warnings.push(`${source.metadata.source} 缺少必需参数: ${missing.join(', ')}`);
      }

      // Check for source-specific errors
      if (source.metadata.context?.['error']) {
        errors.push(`${source.metadata.source}: ${source.metadata.context['message'] || source.metadata.context['error']}`);
      }
    }

    // Generate suggestions based on current state
    if (!selectedSource) {
      if (availableSources.length === 0) {
        suggestions.push('使用 \'polyv-live-cli account add <account-name>\' 添加账号');
        suggestions.push('设置环境变量: POLYV_APP_ID, POLYV_APP_SECRET');
        suggestions.push('使用命令行参数: --app-id, --app-secret');
      } else {
        suggestions.push('检查认证参数是否完整 (需要 appId 和 appSecret)');
        
        const sessionSource = availableSources.find(s => s.type === 'session');
        if (sessionSource && sessionSource.metadata.context?.['error'] === 'account_not_found') {
          suggestions.push(`会话账号 '${sessionSource.metadata.accountName}' 不存在，使用 'polyv-live-cli use <valid-account>' 切换`);
        }
      }
    }

    const result: {
      availableSources: AuthenticationSource[];
      selectedSource?: AuthenticationSource;
      errors: string[];
      warnings: string[];
      suggestions: string[];
    } = {
      availableSources,
      errors,
      warnings,
      suggestions,
    };

    if (selectedSource) {
      result.selectedSource = selectedSource;
    }

    return result;
  }

  /**
   * Get user-friendly authentication status message
   * @param options Optional command line options
   * @returns Status message with guidance
   */
  public getStatusMessage(options?: Record<string, unknown>): string {
    const diagnostics = this.getDiagnostics(options);

    if (diagnostics.selectedSource) {
      const source = diagnostics.selectedSource;
      const sourceDesc = source.metadata.accountName 
        ? `${source.metadata.source} (${source.metadata.accountName})`
        : source.metadata.source;
      
      return `使用认证来源: ${sourceDesc}`;
    }

    // No valid authentication found
    if (diagnostics.errors.length > 0) {
      return `Auth configuration is incomplete`;
    }

    if (diagnostics.warnings.length > 0) {
      return `Auth configuration is incomplete`;
    }

    return `Auth configuration is incomplete`;
  }

  /**
   * Get authentication source by type
   * @param type Source type to get
   * @param options Optional command line options
   * @returns Authentication source or null
   */
  public getSourceByType(type: AuthenticationSourceType, options?: Record<string, unknown>): AuthenticationSource | null {
    const detector = this.detectors.find(d => d.type === type);
    return detector ? detector.detect(options) : null;
  }

  /**
   * Check if a specific source type is available
   * @param type Source type to check
   * @param options Optional command line options
   * @returns Whether source type is available
   */
  public isSourceAvailable(type: AuthenticationSourceType, options?: Record<string, unknown>): boolean {
    const detector = this.detectors.find(d => d.type === type);
    return detector ? detector.isAvailable(options) : false;
  }
}
