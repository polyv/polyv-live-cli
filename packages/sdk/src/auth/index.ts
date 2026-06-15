/**
 * Authentication Module
 *
 * Re-exports signature generation functions and types.
 *
 * @module auth
 */

export {
  generateSignature,
  generateTimestamp,
  sortParams,
  createSignature,
} from './signature.js';
