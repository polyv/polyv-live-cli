/**
 * PolyV SDK Constants Module
 *
 * This module exports all constants, enumerations, and helper functions
 * for error codes and other configuration values.
 */

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
} from './error-codes.js';
