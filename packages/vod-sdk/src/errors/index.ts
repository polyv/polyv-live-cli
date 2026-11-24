/**
 * Error types for the PolyV VOD SDK.
 *
 * @module errors
 */

export type PolyVVodErrorKind =
  /** Invalid input or configuration. */
  | 'validation'
  /** Missing credentials. */
  | 'auth'
  /** The platform answered with a non-success envelope or HTTP status. */
  | 'api'
  /** The request did not complete (timeout, connection failure, cancellation). */
  | 'network'
  /** An upload failed. */
  | 'upload';

export interface PolyVVodErrorDetails {
  /** Platform status code from the response envelope, or the HTTP status. */
  code?: number | string;
  httpStatus?: number;
  /** `data` of the failed response, when present. */
  data?: unknown;
  requestId?: string;
  /** Whether sending the same request again may succeed. */
  retryable?: boolean;
  cause?: unknown;
}

export class PolyVVodError extends Error {
  readonly kind: PolyVVodErrorKind;
  readonly code?: number | string;
  readonly httpStatus?: number;
  readonly data?: unknown;
  readonly requestId?: string;
  readonly retryable: boolean;
  readonly cause?: unknown;

  constructor(kind: PolyVVodErrorKind, message: string, details: PolyVVodErrorDetails = {}) {
    super(message);
    this.name = 'PolyVVodError';
    this.kind = kind;
    this.code = details.code;
    this.httpStatus = details.httpStatus;
    this.data = details.data;
    this.requestId = details.requestId;
    this.retryable = details.retryable ?? false;
    this.cause = details.cause;
  }
}

export function isPolyVVodError(error: unknown): error is PolyVVodError {
  return error instanceof PolyVVodError;
}
