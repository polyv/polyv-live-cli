/**
 * PolyV Validation Error Class
 *
 * Represents parameter validation errors.
 * Provides field-level error details and factory methods for common validation errors.
 */
import { PolyVError } from './polyv-error.js';

/**
 * Validation constraints metadata
 */
export interface ValidationConstraints {
  [key: string]: unknown;
}

export class PolyVValidationError extends PolyVError {
  /**
   * The field that failed validation
   */
  readonly field?: string;

  /**
   * The value that was rejected
   */
  readonly invalidValue?: unknown;

  /**
   * Validation constraints that were not satisfied
   */
  readonly constraints?: ValidationConstraints;

  /**
   * Array of aggregated errors (when multiple validation errors exist)
   */
  readonly errors?: PolyVValidationError[];

  constructor(
    message: string,
    field?: string,
    invalidValue?: unknown,
    constraints?: ValidationConstraints,
    code?: string
  ) {
    // Build details object from validation-specific fields
    const details: Record<string, unknown> = {};
    if (field !== undefined) {
      details.field = field;
    }
    if (invalidValue !== undefined) {
      details.invalidValue = invalidValue;
    }
    if (constraints !== undefined) {
      details.constraints = constraints;
    }
    super(message, code || 'ERR_VALIDATION', Object.keys(details).length > 0 ? details : undefined);

    this.name = 'PolyVValidationError';
    this.field = field;
    this.invalidValue = invalidValue;
    this.constraints = constraints;

    // Set the prototype explicitly for instanceof to work correctly
    Object.setPrototypeOf(this, PolyVValidationError.prototype);
  }

  /**
   * Serialize error to JSON for logging and debugging
   */
  override toJSON(): {
    name: string;
    message: string;
    code: string | undefined;
    details: unknown;
    field: string | undefined;
    invalidValue: unknown;
    constraints: ValidationConstraints | undefined;
  } {
    // For PolyVValidationError, we expose field/invalidValue/constraints as top-level properties
    // and set details to undefined to avoid duplication
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: undefined,
      field: this.field,
      invalidValue: this.invalidValue,
      constraints: this.constraints,
    };
  }

  /**
   * Return a formatted string representation of the error
   */
  override toString(): string {
    if (this.field) {
      return `${this.name} [field=${this.field}]: ${this.message}`;
    }
    return `${this.name}: ${this.message}`;
  }

  /**
   * Factory method for required field errors
   */
  static required(field: string): PolyVValidationError {
    return new PolyVValidationError(`${field} is required`, field, undefined, undefined, 'ERR_REQUIRED');
  }

  /**
   * Factory method for invalid type errors
   */
  static invalidType(field: string, expectedType: string, actualValue: unknown): PolyVValidationError {
    return new PolyVValidationError(
      `${field} must be of type ${expectedType}, got ${actualValue}`,
      field,
      actualValue,
      { expectedType }
    );
  }

  /**
   * Factory method for out of range errors
   */
  static outOfRange(
    field: string,
    value: number,
    constraints: { min?: number; max?: number }
  ): PolyVValidationError {
    const { min, max } = constraints;
    let message: string;
    if (min !== undefined && max !== undefined) {
      message = `${field} must be between ${min} and ${max}`;
    } else if (min !== undefined) {
      message = `${field} must be at least ${min}`;
    } else if (max !== undefined) {
      message = `${field} must be at most ${max}`;
    } else {
      message = `${field} is out of range`;
    }
    return new PolyVValidationError(message, field, value, constraints);
  }

  /**
   * Factory method for pattern mismatch errors
   */
  static patternMismatch(field: string, value: string, pattern: RegExp): PolyVValidationError {
    return new PolyVValidationError(`${field} does not match expected pattern`, field, value, {
      pattern: pattern.source,
    });
  }

  /**
   * Aggregate multiple validation errors into a single error
   */
  static aggregate(errors: PolyVValidationError[]): PolyVValidationError | null {
    if (errors.length === 0) {
      return null;
    }

    const aggregated = new PolyVValidationError(`Validation failed with ${errors.length} error(s)`);
    // Use Object.defineProperty to set readonly property
    Object.defineProperty(aggregated, 'errors', {
      value: errors,
      writable: false,
      enumerable: true,
      configurable: false,
    });

    return aggregated;
  }
}
