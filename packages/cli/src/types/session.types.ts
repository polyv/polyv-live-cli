/**
 * Session state management types for multi-account session handling
 */

/**
 * Session state interface
 */
export interface SessionState {
  /** 当前使用的账号名称 */
  accountName: string;
  /** 关联的进程ID */
  processId: number;
  /** 终端标识符 */
  terminalId: string;
  /** 设置时间 */
  setAt: Date;
  /** 可选过期时间 */
  expiresAt?: Date;
}

/**
 * Session operation result
 */
export interface SessionOperationResult {
  /** 操作是否成功 */
  success: boolean;
  /** 操作结果消息 */
  message: string;
  /** 可选的会话状态数据 */
  sessionState?: SessionState;
}

/**
 * Session storage configuration
 */
export interface SessionStorageConfig {
  /** 会话存储目录 */
  sessionDir: string;
  /** 环境变量名称 */
  envVarName: string;
  /** 会话文件前缀 */
  filePrefix: string;
  /** 会话过期时间（毫秒） */
  expirationMs?: number;
}

/**
 * Authentication source information
 */
export interface AuthSource {
  /** 认证来源类型 */
  type: 'command-line' | 'session' | 'environment' | 'config';
  /** 来源描述 */
  description: string;
  /** 账号名称（如果适用） */
  accountName?: string;
  /** 优先级（数字越小优先级越高） */
  priority: number;
}

/**
 * Session state validation rules
 */
export const SessionStateValidation = {
  accountName: {
    required: true,
    pattern: /^[a-zA-Z0-9_-]+$/,
    maxLength: 50
  },
  processId: {
    required: true,
    type: 'number' as const,
    positive: true
  },
  terminalId: {
    required: true,
    pattern: /^[a-zA-Z0-9_-]+$/,
    maxLength: 100
  }
} as const;

/**
 * Default session configuration
 */
export const DEFAULT_SESSION_CONFIG: SessionStorageConfig = {
  sessionDir: '.polyv/sessions',
  envVarName: 'POLYV_SESSION_ACCOUNT',
  filePrefix: 'session',
  expirationMs: 24 * 60 * 60 * 1000 // 24小时
} as const;
