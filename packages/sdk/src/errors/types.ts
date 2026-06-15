/**
 * Type definitions for PolyV SDK errors
 */

/**
 * Options for creating a PolyVError
 */
export interface PolyVErrorOptions {
  code?: string;
  details?: unknown;
}

// Re-export the API error options type
export type { PolyVAPIErrorOptions, PolyVAPIErrorResponse } from './polyv-api-error.js';

// Re-export the validation constraints type
export type { ValidationConstraints } from './polyv-validation-error.js';
