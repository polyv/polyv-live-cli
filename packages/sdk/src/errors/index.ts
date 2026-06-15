/**
 * PolyV SDK Error Classes
 *
 * This module exports all error classes and type guards for consistent error handling.
 */

// Error classes
export { PolyVError } from './polyv-error.js';
export { PolyVAPIError } from './polyv-api-error.js';
export { PolyVValidationError } from './polyv-validation-error.js';

// Type guards
export { isPolyVError, isPolyVAPIError, isPolyVValidationError } from './type-guards.js';

// Types
export type {
  PolyVErrorOptions,
  PolyVAPIErrorOptions,
  PolyVAPIErrorResponse,
  ValidationConstraints,
} from './types.js';
