/**
 * Custom error types for the PolyV CLI
 */

export class CLIError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code = 'CLI_ERROR', statusCode = 1) {
    super(message);
    this.name = 'CLIError';
    this.code = code;
    this.statusCode = statusCode;
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CLIError);
    }
  }
}

export class ValidationError extends CLIError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 1);
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends CLIError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR', 1);
    this.name = 'ConfigurationError';
  }
}

export class APIError extends CLIError {
  constructor(message: string, statusCode = 1) {
    super(message, 'API_ERROR', statusCode);
    this.name = 'APIError';
  }
}

/**
 * Enhanced error for general PolyV CLI operations
 */
export class PolyVError extends CLIError {
  public readonly context?: Record<string, any> | undefined;

  constructor(
    message: string,
    code = 'POLYV_ERROR',
    statusCode = 1,
    context?: Record<string, any>
  ) {
    super(message, code, statusCode);
    this.name = 'PolyVError';
    this.context = context;
  }
}

/**
 * PolyV-specific validation error with detailed field information
 */
export class PolyVValidationError extends PolyVError {
  public readonly field: string;
  public readonly value: any;
  public readonly rule: string;

  constructor(
    message: string,
    field: string,
    value: any,
    rule: string,
    context?: Record<string, any>
  ) {
    super(message, 'POLYV_VALIDATION_ERROR', 1, context);
    this.name = 'PolyVValidationError';
    this.field = field;
    this.value = value;
    this.rule = rule;
  }
}

/**
 * PolyV API-specific error with HTTP status and API response details
 */
export class PolyVAPIError extends PolyVError {
  public readonly httpStatus: number;
  public readonly apiResponse?: any;

  constructor(
    message: string,
    code = 'POLYV_API_ERROR',
    httpStatus = 500,
    context?: Record<string, any>
  ) {
    super(message, code, httpStatus, context);
    this.name = 'PolyVAPIError';
    this.httpStatus = httpStatus;
    this.apiResponse = context?.['responseData'] || context?.['polyvData'];
  }
}

/**
 * PolyV configuration error
 */
export class PolyVConfigError extends PolyVError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'POLYV_CONFIG_ERROR', 1, context);
    this.name = 'PolyVConfigError';
  }
}

/**
 * PolyV authentication error
 */
export class PolyVAuthenticationError extends PolyVError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'POLYV_AUTH_ERROR', 1, context);
    this.name = 'PolyVAuthenticationError';
  }
}

/**
 * Formats error messages for user-friendly display
 */
export function formatError(error: Error): string {
  if (error instanceof CLIError) {
    return `Error: ${error.message}`;
  }
  
  // Handle known Node.js errors
  if (error.message.includes('ENOENT')) {
    return 'Error: File or directory not found';
  }
  
  if (error.message.includes('EACCES')) {
    return 'Error: Permission denied';
  }
  
  if (error.message.includes('ENOTDIR')) {
    return 'Error: Not a directory';
  }
  
  // Generic error formatting
  return `Unexpected error: ${error.message}`;
}

/**
 * Logs errors to console with appropriate formatting
 */
export function logError(error: Error): void {
  const formattedMessage = formatError(error);
  console.error(formattedMessage);
  
  // In development, also log the stack trace
  if (process.env['NODE_ENV'] === 'development' || process.env['DEBUG']) {
    console.error('Stack trace:', error.stack);
  }
}

/**
 * Global error handler for uncaught exceptions
 */
export function handleUncaughtError(error: Error): void {
  logError(error);
  process.exit(1);
}

/**
 * Global handler for unhandled promise rejections
 */
export function handleUnhandledRejection(reason: unknown): void {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logError(error);
  process.exit(1);
}