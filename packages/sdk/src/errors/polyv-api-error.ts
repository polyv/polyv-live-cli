/**
 * PolyV API Error Class
 *
 * Represents errors returned from the PolyV API.
 * Contains PolyV-specific error codes and messages.
 */
import { PolyVError } from './polyv-error.js';

/**
 * Options for creating a PolyVAPIError
 */
export interface PolyVAPIErrorOptions {
  polyvCode?: number;
  polyvMessage?: string;
  code?: string;
  details?: unknown;
}

/**
 * PolyV API response structure for error handling
 */
export interface PolyVAPIErrorResponse {
  code: number;
  status: string;
  message: string;
  data?: {
    polyvCode?: number;
    polyvMessage?: string;
  };
}

export class PolyVAPIError extends PolyVError {
  /**
   * HTTP status code from the API response
   */
  readonly statusCode: number;

  /**
   * PolyV-specific error code
   */
  readonly polyvCode?: number;

  /**
   * PolyV-specific error message
   */
  readonly polyvMessage?: string;

  constructor(message: string, statusCode: number, options?: PolyVAPIErrorOptions) {
    super(message, options?.code, options?.details);

    this.name = 'PolyVAPIError';
    this.statusCode = statusCode;
    this.polyvCode = options?.polyvCode;
    this.polyvMessage = options?.polyvMessage;

    // Set the prototype explicitly for instanceof to work correctly
    Object.setPrototypeOf(this, PolyVAPIError.prototype);
  }

  /**
   * Create a PolyVAPIError from an API response
   */
  static fromResponse(response: PolyVAPIErrorResponse): PolyVAPIError {
    return new PolyVAPIError(response.message, response.code, {
      polyvCode: response.data?.polyvCode,
      polyvMessage: response.data?.polyvMessage,
    });
  }

  /**
   * Check if the error is retryable
   * - 5xx errors are retryable (server errors)
   * - 429 (rate limit) is retryable
   * - Other 4xx errors are not retryable
   */
  isRetryable(): boolean {
    // 5xx server errors are retryable
    if (this.statusCode >= 500 && this.statusCode < 600) {
      return true;
    }
    // 429 rate limit is retryable
    if (this.statusCode === 429) {
      return true;
    }
    return false;
  }

  /**
   * Serialize error to JSON for logging and debugging
   */
  override toJSON(): {
    name: string;
    message: string;
    code: string | undefined;
    details: unknown;
    statusCode: number;
    polyvCode: number | undefined;
    polyvMessage: string | undefined;
  } {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
      polyvCode: this.polyvCode,
      polyvMessage: this.polyvMessage,
    };
  }

  /**
   * Return a formatted string representation of the error
   */
  override toString(): string {
    if (this.polyvCode) {
      return `${this.name} [${this.polyvCode}]: ${this.message}`;
    }
    return `${this.name}: ${this.message}`;
  }
}
