/**
 * Type guard functions for PolyV SDK errors
 */

import { PolyVError } from './polyv-error.js';
import { PolyVAPIError } from './polyv-api-error.js';
import { PolyVValidationError } from './polyv-validation-error.js';

/**
 * Type guard to check if an error is a PolyVError
 */
export function isPolyVError(error: unknown): error is PolyVError {
  return error instanceof PolyVError;
}

/**
 * Type guard to check if an error is a PolyVAPIError
 */
export function isPolyVAPIError(error: unknown): error is PolyVAPIError {
  return error instanceof PolyVAPIError;
}

/**
 * Type guard to check if an error is a PolyVValidationError
 */
export function isPolyVValidationError(error: unknown): error is PolyVValidationError {
  return error instanceof PolyVValidationError;
}
