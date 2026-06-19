/**
 * Authentication source types and interfaces for priority-based authentication
 */

/**
 * Authentication source types in priority order
 */
export type AuthenticationSourceType = 'command-line-account' | 'command-line' | 'session' | 'default-account' | 'environment' | 'config';

/**
 * Authentication source interface with priority and metadata
 */
export interface AuthenticationSource {
  /** Source type with priority: 1=command-line, 2=session, 3=environment, 4=config */
  type: AuthenticationSourceType;
  /** Priority level (1=highest, 4=lowest) */
  priority: number;
  /** Application ID */
  appId?: string | undefined;
  /** Application Secret */
  appSecret?: string | undefined;
  /** User ID (optional) */
  userId?: string | undefined;
  /** Base URL for API calls */
  baseUrl?: string | undefined;
  /** Environment type */
  environment?: string | undefined;
  /** Source metadata for debugging and display */
  metadata: {
    /** Human-readable source description */
    source: string;
    /** Account name (if applicable) */
    accountName?: string | undefined;
    /** When this source was set/detected */
    setAt?: Date | undefined;
    /** Additional context information */
    context?: Record<string, any> | undefined;
  };
}

/**
 * Authentication context with complete source information
 */
export interface AuthenticationContext {
  /** Selected authentication source */
  source: AuthenticationSource;
  /** Final authentication credentials */
  credentials: {
    appId: string;
    appSecret: string;
    userId?: string;
    baseUrl?: string;
    environment?: string;
  };
  /** Diagnostic information */
  diagnostics: {
    /** All attempted sources in order */
    attemptedSources: string[];
    /** Reason for selecting current source */
    selectedReason: string;
    /** Warning messages */
    warnings: string[];
    /** Whether authentication is complete */
    isComplete: boolean;
  };
}

/**
 * Authentication provider interface for unified authentication operations
 */
export interface AuthenticationProvider {
  /**
   * Get authentication context with priority-based source selection
   * @param options Optional command line options
   * @returns Authentication context or null if no valid authentication found
   */
  getAuthenticationContext(options?: Record<string, unknown>): AuthenticationContext | null;

  /**
   * Get authentication credentials directly
   * @param options Optional command line options
   * @returns Authentication credentials or null
   */
  getCredentials(options?: Record<string, unknown>): {
    appId: string;
    appSecret: string;
    userId?: string;
  } | null;

  /**
   * Get current authentication source information
   * @param options Optional command line options
   * @returns Authentication source or null
   */
  getCurrentSource(options?: Record<string, unknown>): AuthenticationSource | null;

  /**
   * Validate authentication completeness
   * @param source Authentication source to validate
   * @returns Whether authentication is complete
   */
  validateAuthentication(source: AuthenticationSource): boolean;

  /**
   * Get user-friendly authentication status message
   * @param options Optional command line options
   * @returns Status message with guidance
   */
  getStatusMessage(options?: Record<string, unknown>): string;

  /**
   * Get detailed authentication diagnostics
   * @param options Optional command line options
   * @returns Diagnostic information
   */
  getDiagnostics(options?: Record<string, unknown>): {
    availableSources: AuthenticationSource[];
    selectedSource?: AuthenticationSource;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  };
}

/**
 * Authentication source detector interface
 */
export interface AuthenticationSourceDetector {
  /** Source type this detector handles */
  readonly type: AuthenticationSourceType;
  /** Priority level for this source */
  readonly priority: number;

  /**
   * Detect and create authentication source
   * @param options Optional detection options
   * @returns Authentication source or null if not available
   */
  detect(options?: Record<string, unknown>): AuthenticationSource | null;

  /**
   * Check if this source is available
   * @param options Optional detection options
   * @returns Whether source is available
   */
  isAvailable(options?: Record<string, unknown>): boolean;
}

/**
 * Priority levels for authentication sources
 */
export const AUTH_PRIORITY = {
  COMMAND_LINE_ACCOUNT: 1,
  COMMAND_LINE: 2,
  SESSION: 3,
  ENVIRONMENT: 4,
  DEFAULT_ACCOUNT: 5,
  CONFIG: 6,
} as const;

/**
 * Authentication source type to priority mapping
 */
export const SOURCE_PRIORITY_MAP: Record<AuthenticationSourceType, number> = {
  'command-line-account': AUTH_PRIORITY.COMMAND_LINE_ACCOUNT,
  'command-line': AUTH_PRIORITY.COMMAND_LINE,
  'session': AUTH_PRIORITY.SESSION,
  'default-account': AUTH_PRIORITY.DEFAULT_ACCOUNT,
  'environment': AUTH_PRIORITY.ENVIRONMENT,
  'config': AUTH_PRIORITY.CONFIG,
};

/**
 * Human-readable source descriptions
 */
export const SOURCE_DESCRIPTIONS: Record<AuthenticationSourceType, string> = {
  'command-line-account': '命令行指定账号',
  'command-line': '命令行参数',
  'session': '会话账号',
  'default-account': '默认账号',
  'environment': '环境变量',
  'config': '全局配置',
};
