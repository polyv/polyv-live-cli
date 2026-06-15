/**
 * PolyV SDK Base Error Class
 *
 * All PolyV SDK errors extend from this class.
 * Provides consistent error handling with name, message, code, and details.
 */
export class PolyVError extends Error {
  /**
   * Error code for programmatic error handling
   */
  readonly code?: string;

  /**
   * Additional error details
   */
  readonly details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);

    // Set the error name to the constructor name
    this.name = 'PolyVError';

    // Set optional properties
    this.code = code;
    this.details = details;

    // Set the prototype explicitly for instanceof to work correctly
    Object.setPrototypeOf(this, PolyVError.prototype);

    // Capture stack trace (V8 engines like Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serialize error to JSON for logging and debugging
   */
  toJSON(): {
    name: string;
    message: string;
    code: string | undefined;
    details: unknown;
  } {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }

  /**
   * Return a formatted string representation of the error
   */
  toString(): string {
    if (this.code) {
      return `${this.name} [${this.code}]: ${this.message}`;
    }
    return `${this.name}: ${this.message}`;
  }
}
