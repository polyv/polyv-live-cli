# Error Handling Strategy

**Version**: 1.2  
**Last Updated**: 2025-07-01  
**Related**: [Data Models](./data-models.md), [External APIs](./external-apis.md)

---

## Error Handling Philosophy

### **Core Principles**

1. **User-Friendly Messages**: All errors should provide clear, actionable guidance
2. **Structured Logging**: Errors should be logged with sufficient context for debugging
3. **Graceful Degradation**: CLI should never crash without proper error reporting
4. **Security-Aware**: Never expose sensitive information in error messages
5. **Consistent Format**: All errors follow the same structure and pattern

---

## Error Type Hierarchy

### **Base Error Classes**

```typescript
// Base error class for all PolyV CLI errors
abstract class PolyVError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: any;
  public readonly requestId?: string;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string,
    statusCode?: number,
    details?: any,
    requestId?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.requestId = requestId;
    this.timestamp = new Date();
    
    // Ensure proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  // Serialize error for logging (excludes sensitive data)
  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      requestId: this.requestId,
      timestamp: this.timestamp.toISOString()
      // Deliberately exclude 'details' as it may contain sensitive data
    };
  }

  // Get user-friendly error message
  abstract getUserMessage(): string;
}
```

### **Specific Error Types**

```typescript
// Authentication and authorization errors
class PolyVAuthenticationError extends PolyVError {
  constructor(message: string, details?: any, requestId?: string) {
    super(message, 'AUTH_ERROR', 401, details, requestId);
  }

  getUserMessage(): string {
    if (this.message.includes('invalid signature')) {
      return 'Authentication failed. Please check your appId and appSecret configuration.';
    }
    if (this.message.includes('时间戳过期') || this.message.includes('timestamp')) {
      return 'Request timestamp expired. Please ensure your system clock is synchronized.';
    }
    if (this.message.includes('application not found')) {
      return 'Invalid application ID. Please verify your PolyV appId is correct.';
    }
    return 'Authentication failed. Please check your PolyV credentials.';
  }
}

// Network and connectivity errors
class PolyVNetworkError extends PolyVError {
  public readonly timeout: boolean;
  public readonly retryCount: number;

  constructor(
    message: string,
    timeout: boolean = false,
    retryCount: number = 0,
    details?: any
  ) {
    super(message, 'NETWORK_ERROR', undefined, details);
    this.timeout = timeout;
    this.retryCount = retryCount;
  }

  getUserMessage(): string {
    if (this.timeout) {
      return `Network request timed out after ${this.retryCount} retries. Please check your internet connection and try again.`;
    }
    return `Network error occurred. Please check your internet connection and try again. (Retries: ${this.retryCount})`;
  }
}

// Input validation errors
class PolyVValidationError extends PolyVError {
  public readonly field: string;
  public readonly value: any;
  public readonly constraint: string;

  constructor(
    message: string,
    field: string,
    value: any,
    constraint: string
  ) {
    super(message, 'VALIDATION_ERROR', 400, { field, value, constraint });
    this.field = field;
    this.value = value;
    this.constraint = constraint;
  }

  getUserMessage(): string {
    switch (this.constraint) {
      case 'required':
        return `${this.field} is required.`;
      case 'maxLength':
        return `${this.field} must be no more than ${this.details.maxLength} characters.`;
      case 'minLength':
        return `${this.field} must be at least ${this.details.minLength} characters.`;
      case 'pattern':
        return `${this.field} format is invalid.`;
      case 'enum':
        return `${this.field} must be one of: ${this.details.allowedValues.join(', ')}.`;
      default:
        return `${this.field} validation failed: ${this.message}`;
    }
  }
}

// PolyV API specific errors
class PolyVAPIError extends PolyVError {
  public readonly apiCode?: number;
  public readonly apiMessage?: string;

  constructor(
    message: string,
    statusCode: number,
    apiResponse?: any,
    requestId?: string
  ) {
    super(message, 'API_ERROR', statusCode, apiResponse, requestId);
    this.apiCode = apiResponse?.error?.code || apiResponse?.code;
    this.apiMessage = apiResponse?.error?.desc || apiResponse?.message;
  }

  getUserMessage(): string {
    // Map common PolyV API errors to user-friendly messages
    const errorMappings: Record<number, string> = {
      20001: 'Application not found. Please verify your PolyV appId.',
      20002: 'Invalid signature. Please check your appSecret.',
      20003: 'Request timestamp expired. Please try again.',
      30001: 'Channel not found. Please verify the channel ID.',
      30002: 'Channel access denied. Please check your permissions.',
      40001: 'Invalid channel parameters. Please check your input.',
      50001: 'PolyV service temporarily unavailable. Please try again later.'
    };

    if (this.apiCode && errorMappings[this.apiCode]) {
      return errorMappings[this.apiCode];
    }

    // Fallback to generic message based on status code
    switch (this.statusCode) {
      case 400:
        return 'Invalid request. Please check your input parameters.';
      case 401:
        return 'Authentication failed. Please check your credentials.';
      case 403:
        return 'Access denied. Please check your permissions.';
      case 404:
        return 'Resource not found. Please verify the ID.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'PolyV service error. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

// Configuration errors
class PolyVConfigError extends PolyVError {
  constructor(message: string, details?: any) {
    super(message, 'CONFIG_ERROR', undefined, details);
  }

  getUserMessage(): string {
    if (this.message.includes('appId')) {
      return 'PolyV App ID is missing. Please set POLYV_APP_ID environment variable or use --appId option.';
    }
    if (this.message.includes('appSecret')) {
      return 'PolyV App Secret is missing. Please set POLYV_APP_SECRET environment variable or use --appSecret option.';
    }
    if (this.message.includes('userId')) {
      return 'PolyV User ID is required for this operation. Please set POLYV_USER_ID environment variable or use --userId option.';
    }
    return `Configuration error: ${this.message}`;
  }
}
```

---

## Error Handling Patterns

### **Service Layer Error Handling**

```typescript
class PolyVService {
  private async makeRequest<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    data?: any,
    params?: any
  ): Promise<T> {
    try {
      const response = await this.httpClient.request({
        method,
        url: endpoint,
        data,
        params
      });

      // Check for API-level errors in successful HTTP responses
      if (response.data.code !== 200 || response.data.status === 'error') {
        throw new PolyVAPIError(
          response.data.message || 'API request failed',
          response.data.code,
          response.data,
          response.data.requestId
        );
      }

      return response.data;
    } catch (error) {
      // Re-throw our custom errors as-is
      if (error instanceof PolyVError) {
        throw error;
      }

      // Handle Axios errors
      if (error.response) {
        // Server responded with error status
        throw new PolyVAPIError(
          error.response.data?.message || error.message,
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        // Network error
        const isTimeout = error.code === 'ECONNABORTED';
        throw new PolyVNetworkError(
          error.message,
          isTimeout,
          error.config?.retryCount || 0
        );
      } else {
        // Other errors
        throw new PolyVError(
          error.message,
          'UNKNOWN_ERROR',
          undefined,
          { originalError: error.name }
        );
      }
    }
  }
}
```

### **Handler Layer Error Processing**

```typescript
abstract class BaseHandler {
  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      // Log error with context
      this.logError(error, context);

      // Re-throw for CLI error handler
      throw error;
    }
  }

  private logError(error: any, context: string): void {
    const logData = {
      context,
      timestamp: new Date().toISOString(),
      error: error instanceof PolyVError ? error.toJSON() : {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    };

    // Use different log levels based on error type
    if (error instanceof PolyVValidationError) {
      console.warn('Validation Error:', JSON.stringify(logData, null, 2));
    } else if (error instanceof PolyVNetworkError) {
      console.error('Network Error:', JSON.stringify(logData, null, 2));
    } else {
      console.error('Application Error:', JSON.stringify(logData, null, 2));
    }
  }
}
```

### **CLI Entry Point Error Handling**

```typescript
// Global error handler for the CLI
function setupGlobalErrorHandling(): void {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    
    if (reason instanceof PolyVError) {
      displayUserError(reason);
    } else {
      displayGenericError(reason as Error);
    }
    
    process.exit(1);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    
    if (error instanceof PolyVError) {
      displayUserError(error);
    } else {
      displayGenericError(error);
    }
    
    process.exit(1);
  });
}

// Command error wrapper
function wrapCommand(handler: (...args: any[]) => Promise<void>) {
  return async (...args: any[]) => {
    try {
      await handler(...args);
    } catch (error) {
      if (error instanceof PolyVError) {
        displayUserError(error);
      } else {
        displayGenericError(error as Error);
      }
      process.exit(1);
    }
  };
}
```

---

## User-Friendly Error Display

### **Error Formatting Functions**

```typescript
import chalk from 'chalk';

function displayUserError(error: PolyVError): void {
  console.error(chalk.red('✗ Error:'), error.getUserMessage());
  
  // Show additional context for certain error types
  if (error instanceof PolyVValidationError) {
    console.error(chalk.yellow('  Field:'), error.field);
    console.error(chalk.yellow('  Value:'), error.value);
  }
  
  if (error instanceof PolyVNetworkError && error.timeout) {
    console.error(chalk.yellow('  Suggestion:'), 'Check your internet connection and try again');
  }
  
  if (error instanceof PolyVAuthenticationError) {
    console.error(chalk.yellow('  Help:'), 'Run "polyv-cli config --help" for authentication setup');
  }
  
  // Show request ID for debugging if available
  if (error.requestId) {
    console.error(chalk.gray('  Request ID:'), error.requestId);
  }
}

function displayGenericError(error: Error): void {
  console.error(chalk.red('✗ Unexpected Error:'), error.message);
  console.error(chalk.yellow('  Please report this issue with the following details:'));
  console.error(chalk.gray('  Error:'), error.name);
  console.error(chalk.gray('  Stack:'), error.stack);
}

function displayValidationErrors(errors: PolyVValidationError[]): void {
  console.error(chalk.red('✗ Validation Errors:'));
  
  errors.forEach((error, index) => {
    console.error(chalk.red(`  ${index + 1}.`), error.getUserMessage());
  });
  
  console.error(chalk.yellow('\nPlease fix the above errors and try again.'));
}
```

### **Success and Warning Messages**

```typescript
function displaySuccess(message: string, details?: any): void {
  console.log(chalk.green('✓'), message);
  
  if (details) {
    Object.entries(details).forEach(([key, value]) => {
      console.log(chalk.gray(`  ${key}:`), value);
    });
  }
}

function displayWarning(message: string): void {
  console.warn(chalk.yellow('⚠ Warning:'), message);
}

function displayInfo(message: string): void {
  console.info(chalk.blue('ℹ'), message);
}
```

---

## Error Recovery Strategies

### **Retry Logic**

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryCondition: (error: any) => boolean;
}

async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry if condition is not met
      if (!config.retryCondition(error)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(2, attempt),
        config.maxDelay
      );
      
      console.warn(chalk.yellow(`Retry ${attempt + 1}/${config.maxRetries} in ${delay}ms...`));
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Update retry count in error
  if (lastError instanceof PolyVNetworkError) {
    lastError.retryCount = config.maxRetries;
  }
  
  throw lastError;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryCondition: (error) => {
    // Retry on network errors and 5xx status codes
    return error instanceof PolyVNetworkError || 
           (error instanceof PolyVAPIError && error.statusCode >= 500);
  }
};
```

### **Graceful Degradation**

```typescript
// Fallback strategies for non-critical operations
async function getChannelWithFallback(channelId: string): Promise<ChannelModel | null> {
  try {
    return await polyvService.getChannel(channelId);
  } catch (error) {
    if (error instanceof PolyVAPIError && error.statusCode === 404) {
      // Channel not found - return null instead of throwing
      return null;
    }
    
    // Re-throw other errors
    throw error;
  }
}

// Partial success handling
async function batchDeleteChannels(channelIds: string[]): Promise<{
  succeeded: string[];
  failed: Array<{ channelId: string; error: string }>;
}> {
  const results = {
    succeeded: [] as string[],
    failed: [] as Array<{ channelId: string; error: string }>
  };
  
  // Process in batches to avoid API limits
  const BATCH_SIZE = 10;
  for (let i = 0; i < channelIds.length; i += BATCH_SIZE) {
    const batch = channelIds.slice(i, i + BATCH_SIZE);
    
    try {
      await polyvService.batchDeleteChannels(batch);
      results.succeeded.push(...batch);
    } catch (error) {
      // Record failed batch
      batch.forEach(channelId => {
        results.failed.push({
          channelId,
          error: error instanceof PolyVError ? error.getUserMessage() : error.message
        });
      });
    }
  }
  
  return results;
}
```

---

## Testing Error Scenarios

### **Error Simulation for Testing**

```typescript
// Mock error responses for testing
export const mockErrorResponses = {
  authenticationError: {
    code: 400,
    status: 'error',
    message: 'invalid signature.'
  },
  
  channelNotFound: {
    code: 400,
    status: 'error',
    message: 'Channel not found'
  },
  
  networkTimeout: {
    code: 'ECONNABORTED',
    message: 'timeout of 30000ms exceeded'
  },
  
  serverError: {
    code: 500,
    status: 'error',
    message: 'Internal server error'
  }
};

// Test error handling
describe('Error Handling', () => {
  it('should handle authentication errors gracefully', async () => {
    const mockService = {
      createChannel: jest.fn().mockRejectedValue(
        new PolyVAuthenticationError('invalid signature.')
      )
    };
    
    const handler = new ChannelHandler(mockService);
    
    await expect(handler.create({ name: 'test' }))
      .rejects
      .toThrow(PolyVAuthenticationError);
  });
  
  it('should retry on network errors', async () => {
    const mockService = {
      createChannel: jest.fn()
        .mockRejectedValueOnce(new PolyVNetworkError('Network error', false, 0))
        .mockRejectedValueOnce(new PolyVNetworkError('Network error', false, 1))
        .mockResolvedValue({ code: 200, data: { channelId: '123' } })
    };
    
    const result = await withRetry(
      () => mockService.createChannel(),
      DEFAULT_RETRY_CONFIG
    );
    
    expect(result.data.channelId).toBe('123');
    expect(mockService.createChannel).toHaveBeenCalledTimes(3);
  });
});
```

---

*This error handling strategy ensures robust, user-friendly error management throughout the PolyV CLI tool while maintaining security and providing clear guidance for issue resolution.* 