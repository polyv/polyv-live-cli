import {
  CLIError,
  ValidationError,
  ConfigurationError,
  APIError,
  formatError,
  logError,
  handleUncaughtError,
  handleUnhandledRejection
} from './errors';

describe('Error Classes', () => {
  describe('CLIError', () => {
    it('should create error with default values', () => {
      const error = new CLIError('Test message');
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('CLI_ERROR');
      expect(error.statusCode).toBe(1);
      expect(error.name).toBe('CLIError');
    });

    it('should create error with custom values', () => {
      const error = new CLIError('Custom message', 'CUSTOM_CODE', 2);
      expect(error.message).toBe('Custom message');
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.statusCode).toBe(2);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error correctly', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(1);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('ConfigurationError', () => {
    it('should create configuration error correctly', () => {
      const error = new ConfigurationError('Missing config');
      expect(error.message).toBe('Missing config');
      expect(error.code).toBe('CONFIG_ERROR');
      expect(error.statusCode).toBe(1);
      expect(error.name).toBe('ConfigurationError');
    });
  });

  describe('APIError', () => {
    it('should create API error correctly', () => {
      const error = new APIError('API failed', 500);
      expect(error.message).toBe('API failed');
      expect(error.code).toBe('API_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('APIError');
    });

    it('should create API error with default statusCode', () => {
      const error = new APIError('API failed');
      expect(error.message).toBe('API failed');
      expect(error.code).toBe('API_ERROR');
      expect(error.statusCode).toBe(1);
      expect(error.name).toBe('APIError');
    });
  });
});

describe('formatError', () => {
  it('should format CLI errors correctly', () => {
    const error = new CLIError('Test CLI error');
    expect(formatError(error)).toBe('Error: Test CLI error');
  });

  it('should format file not found errors', () => {
    const error = new Error('ENOENT: no such file or directory');
    expect(formatError(error)).toBe('Error: File or directory not found');
  });

  it('should format permission denied errors', () => {
    const error = new Error('EACCES: permission denied');
    expect(formatError(error)).toBe('Error: Permission denied');
  });

  it('should format not a directory errors', () => {
    const error = new Error('ENOTDIR: not a directory');
    expect(formatError(error)).toBe('Error: Not a directory');
  });

  it('should format generic errors', () => {
    const error = new Error('Some other error');
    expect(formatError(error)).toBe('Unexpected error: Some other error');
  });
});

describe('logError', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should log formatted error message', () => {
    const error = new CLIError('Test error');
    logError(error);
    expect(consoleSpy).toHaveBeenCalledWith('Error: Test error');
  });

  it('should log stack trace in development', () => {
    const originalEnv = process.env['NODE_ENV'];
    process.env['NODE_ENV'] = 'development';
    
    const error = new Error('Test error');
    logError(error);
    
    expect(consoleSpy).toHaveBeenCalledWith('Unexpected error: Test error');
    expect(consoleSpy).toHaveBeenCalledWith('Stack trace:', error.stack);
    
    process.env['NODE_ENV'] = originalEnv;
  });
});

describe('Error Handlers', () => {
  let exitSpy: jest.SpyInstance;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    exitSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  describe('handleUncaughtError', () => {
    it('should log error and exit process', () => {
      const error = new Error('Uncaught error');
      handleUncaughtError(error);
      
      expect(consoleSpy).toHaveBeenCalledWith('Unexpected error: Uncaught error');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('handleUnhandledRejection', () => {
    it('should handle error objects', () => {
      const error = new Error('Unhandled rejection');
      handleUnhandledRejection(error);
      
      expect(consoleSpy).toHaveBeenCalledWith('Unexpected error: Unhandled rejection');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle non-error objects', () => {
      handleUnhandledRejection('String rejection');
      
      expect(consoleSpy).toHaveBeenCalledWith('Unexpected error: String rejection');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('PolyV Error Classes', () => {
    it('should create PolyVError correctly with defaults', () => {
      const { PolyVError } = require('./errors');
      const error = new PolyVError('PolyV issue');
      expect(error.message).toBe('PolyV issue');
      expect(error.code).toBe('POLYV_ERROR');
      expect(error.name).toBe('PolyVError');
      expect(error.statusCode).toBe(1);
      expect(error.context).toBeUndefined();
    });

    it('should create PolyVError with custom parameters', () => {
      const { PolyVError } = require('./errors');
      const context = { operation: 'stream' };
      const error = new PolyVError('Custom issue', 'CUSTOM_CODE', 2, context);
      expect(error.message).toBe('Custom issue');
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.statusCode).toBe(2);
      expect(error.context).toEqual(context);
    });

    it('should create PolyVValidationError correctly', () => {
      const { PolyVValidationError } = require('./errors');
      const error = new PolyVValidationError('Validation failed');
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('POLYV_VALIDATION_ERROR');
      expect(error.name).toBe('PolyVValidationError');
    });

    it('should create PolyVConfigError correctly', () => {
      const error = new (require('./errors').PolyVConfigError)('Config issue');
      expect(error.message).toBe('Config issue');
      expect(error.code).toBe('POLYV_CONFIG_ERROR');
      expect(error.name).toBe('PolyVConfigError');
      expect(error.statusCode).toBe(1);
    });

    it('should create PolyVConfigError with context', () => {
      const context = { field: 'appId' };
      const error = new (require('./errors').PolyVConfigError)('Config issue', context);
      expect(error.message).toBe('Config issue');
      expect(error.context).toEqual(context);
    });

    it('should create PolyVAuthenticationError correctly', () => {
      const error = new (require('./errors').PolyVAuthenticationError)('Auth issue');
      expect(error.message).toBe('Auth issue');
      expect(error.code).toBe('POLYV_AUTH_ERROR');
      expect(error.name).toBe('PolyVAuthenticationError');
      expect(error.statusCode).toBe(1);
    });

    it('should create PolyVAuthenticationError with context', () => {
      const context = { userId: '123' };
      const error = new (require('./errors').PolyVAuthenticationError)('Auth issue', context);
      expect(error.message).toBe('Auth issue');
      expect(error.context).toEqual(context);
    });
  });
});