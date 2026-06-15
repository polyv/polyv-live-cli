/**
 * PolyV Error Code Mapping
 *
 * This module defines error codes and their messages for the PolyV Live API.
 * Error codes are organized by category:
 * - Authentication (20000-20999): App ID, signature, timestamp issues
 * - Parameter (10000-19999): Request parameter validation errors
 * - Channel (30000-39999): Channel-related errors
 * - Permission (40000-49999): Authorization and account issues
 * - Service (50000-59999): Server-side errors
 */

/**
 * PolyV API Error Code Enumeration
 *
 * Each error code corresponds to a specific error condition returned by the PolyV API.
 */
export enum PolyVErrorCode {
  // Authentication errors (20000-20999)
  /** Invalid or non-existent appId */
  INVALID_APP_ID = 20001,
  /** Signature verification failed */
  INVALID_SIGNATURE = 20002,
  /** Request timestamp has expired (3 minute window) */
  TIMESTAMP_EXPIRED = 20003,
  /** Duplicate request detected (signatureNonce reuse) */
  DUPLICATE_REQUEST = 20004,
  /** Unsupported signature method */
  INVALID_SIGNATURE_METHOD = 20005,

  // Parameter errors (10000-19999)
  /** General parameter error */
  INVALID_PARAMETER = 10001,
  /** Required parameter is missing */
  MISSING_REQUIRED_PARAMETER = 10002,
  /** Parameter format is invalid */
  INVALID_PARAMETER_FORMAT = 10003,

  // Channel errors (30000-39999)
  /** Channel does not exist */
  CHANNEL_NOT_FOUND = 30001,
  /** Channel has been disabled */
  CHANNEL_DISABLED = 30002,
  /** Channel has expired */
  CHANNEL_EXPIRED = 30003,
  /** Channel count limit exceeded */
  CHANNEL_LIMIT_EXCEEDED = 30004,

  // Permission errors (40000-49999)
  /** Permission denied */
  PERMISSION_DENIED = 40001,
  /** Account balance insufficient */
  INSUFFICIENT_BALANCE = 40002,
  /** Feature not enabled for account */
  FEATURE_NOT_ENABLED = 40003,

  // Service errors (50000-59999)
  /** Internal server error */
  INTERNAL_ERROR = 50001,
  /** Service temporarily unavailable */
  SERVICE_UNAVAILABLE = 50002,
  /** Request timeout */
  REQUEST_TIMEOUT = 50003,
}

/**
 * Error message mapping for each error code
 */
export const ERROR_MESSAGES: Record<PolyVErrorCode, string> = {
  // Authentication errors
  [PolyVErrorCode.INVALID_APP_ID]: '无效的 appId',
  [PolyVErrorCode.INVALID_SIGNATURE]: '签名验证失败',
  [PolyVErrorCode.TIMESTAMP_EXPIRED]: '时间戳已过期',
  [PolyVErrorCode.DUPLICATE_REQUEST]: '重复的请求',
  [PolyVErrorCode.INVALID_SIGNATURE_METHOD]: '无效的签名方法',

  // Parameter errors
  [PolyVErrorCode.INVALID_PARAMETER]: '参数错误',
  [PolyVErrorCode.MISSING_REQUIRED_PARAMETER]: '必填参数缺失',
  [PolyVErrorCode.INVALID_PARAMETER_FORMAT]: '参数格式错误',

  // Channel errors
  [PolyVErrorCode.CHANNEL_NOT_FOUND]: '频道不存在',
  [PolyVErrorCode.CHANNEL_DISABLED]: '频道已禁用',
  [PolyVErrorCode.CHANNEL_EXPIRED]: '频道已过期',
  [PolyVErrorCode.CHANNEL_LIMIT_EXCEEDED]: '频道数量超限',

  // Permission errors
  [PolyVErrorCode.PERMISSION_DENIED]: '权限不足',
  [PolyVErrorCode.INSUFFICIENT_BALANCE]: '账户余额不足',
  [PolyVErrorCode.FEATURE_NOT_ENABLED]: '功能未开通',

  // Service errors
  [PolyVErrorCode.INTERNAL_ERROR]: '服务内部错误',
  [PolyVErrorCode.SERVICE_UNAVAILABLE]: '服务暂时不可用',
  [PolyVErrorCode.REQUEST_TIMEOUT]: '请求超时',
};

/**
 * Error category definition
 */
export interface ErrorCategory {
  /** Category name in Chinese */
  name: string;
  /** Error code range for this category */
  range: {
    min: number;
    max: number;
  };
}

/**
 * Error categories organized by code range
 */
export const ERROR_CATEGORIES: Record<string, ErrorCategory> = {
  AUTH: {
    name: '认证相关',
    range: { min: 20000, max: 20999 },
  },
  PARAMETER: {
    name: '参数相关',
    range: { min: 10000, max: 19999 },
  },
  CHANNEL: {
    name: '频道相关',
    range: { min: 30000, max: 39999 },
  },
  PERMISSION: {
    name: '权限相关',
    range: { min: 40000, max: 49999 },
  },
  SERVICE: {
    name: '服务相关',
    range: { min: 50000, max: 59999 },
  },
};

/**
 * Valid error category names
 */
export type ErrorCategoryName = keyof typeof ERROR_CATEGORIES;

/**
 * Get the error message for a specific error code
 *
 * @param code - The PolyV error code
 * @returns The corresponding error message in Chinese
 *
 * @example
 * ```typescript
 * const message = getErrorMessage(PolyVErrorCode.INVALID_APP_ID);
 * // Returns: '无效的 appId'
 * ```
 */
export function getErrorMessage(code: PolyVErrorCode): string {
  return ERROR_MESSAGES[code];
}

/**
 * Check if a number is a valid PolyV error code
 *
 * @param code - The number to check
 * @returns True if the code is a valid PolyV error code
 *
 * @example
 * ```typescript
 * isPolyVErrorCode(20001); // true
 * isPolyVErrorCode(99999); // false
 * ```
 */
export function isPolyVErrorCode(code: number): boolean {
  return Object.values(PolyVErrorCode).includes(code as PolyVErrorCode);
}

/**
 * Get error message by error code number with optional default message
 *
 * @param code - The error code number
 * @param defaultMessage - Optional default message for unknown codes
 * @returns The error message or default message
 *
 * @example
 * ```typescript
 * getErrorMessageByCode(20001); // '无效的 appId'
 * getErrorMessageByCode(99999); // '未知错误'
 * getErrorMessageByCode(99999, '自定义错误'); // '自定义错误'
 * ```
 */
export function getErrorMessageByCode(code: number, defaultMessage = '未知错误'): string {
  if (isPolyVErrorCode(code)) {
    return ERROR_MESSAGES[code as PolyVErrorCode];
  }
  return defaultMessage;
}

/**
 * Get the error category for a given error code
 *
 * @param code - The error code number
 * @returns The category name or 'UNKNOWN' if not in any category range
 *
 * @example
 * ```typescript
 * getErrorCodeCategory(20001); // 'AUTH'
 * getErrorCodeCategory(30001); // 'CHANNEL'
 * getErrorCodeCategory(999); // 'UNKNOWN'
 * ```
 */
export function getErrorCodeCategory(code: number): string {
  for (const [categoryName, category] of Object.entries(ERROR_CATEGORIES)) {
    if (code >= category.range.min && code <= category.range.max) {
      return categoryName;
    }
  }
  return 'UNKNOWN';
}
