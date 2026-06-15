/**
 * Utils Module
 *
 * Re-exports utility functions and environment detection.
 */

export { isNode, isBrowser, isWebWorker, getEnvironmentInfo } from './env.js';
export type { EnvironmentInfo, CryptoSource } from './env.js';

// Signature utilities (cross-environment support)
export {
  generateSignature,
  SignatureMethod,
  createSignature,
  generateTimestamp,
  sortParams,
} from './signature.js';
export type { SignatureInput, SignatureOutput, SignatureOptions } from './signature.js';

// Pagination utilities
export { paginate, collectAll } from './pagination.js';

// Date validation utilities
export {
  MAX_DATE_RANGE_DAYS,
  isValidDateFormat,
  isStartDateBeforeEndDate,
  validateDateRange,
  getDateDifferenceInDays,
} from './date-validation.js';
