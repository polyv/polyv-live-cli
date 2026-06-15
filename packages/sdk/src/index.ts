/**
 * PolyV Live API SDK
 *
 * This is the main entry point for the SDK.
 * All modules and services will be exported from here.
 */

// Placeholder export to ensure build succeeds
export const VERSION = '1.0.0';

// Error classes
export * from './errors/index.js';

// Types
export * from './types/index.js';

// Auth / Signature
export {
  generateSignature,
  generateTimestamp,
  sortParams,
  createSignature,
} from './auth/index.js';

// Utils
export { isNode, isBrowser, isWebWorker, getEnvironmentInfo } from './utils/index.js';
export type { EnvironmentInfo, CryptoSource } from './utils/index.js';

// Pagination utilities
export { paginate, collectAll } from './utils/index.js';

// Date validation utilities
export {
  MAX_DATE_RANGE_DAYS,
  isValidDateFormat,
  isStartDateBeforeEndDate,
  validateDateRange,
} from './utils/index.js';

// Client
export { PolyVClient } from './client.js';
export type { PolyVClientConfig } from './types/client.js';

// Constants
export {
  PolyVErrorCode,
  ERROR_MESSAGES,
  ERROR_CATEGORIES,
  getErrorMessage,
  isPolyVErrorCode,
  getErrorMessageByCode,
  getErrorCodeCategory,
  type ErrorCategory,
  type ErrorCategoryName,
} from './constants/index.js';

// Services
export { ChannelService } from './services/index.js';
