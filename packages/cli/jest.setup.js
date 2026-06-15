/**
 * Jest setup file to load environment variables from .env file
 */
require('dotenv').config();

// Set NODE_ENV to test for performance optimizations
process.env.NODE_ENV = 'test';

// Suppress console output during tests unless DEBUG is set
if (!process.env.DEBUG && !process.env.JEST_VERBOSE) {
  // Mock console methods to reduce noise in test output
  const originalConsole = { ...console };
  
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    // Keep assert and other methods that might be needed for debugging
    assert: originalConsole.assert,
    trace: originalConsole.trace,
    dir: originalConsole.dir,
    table: originalConsole.table
  };
}

// Increase max listeners for process events to prevent warnings during tests
process.setMaxListeners(50);

// Note: Jest's "worker process failed to exit gracefully" warning is expected
// for CLI applications using forceExit: true. This is normal behavior and
// indicates Jest is properly cleaning up resources before exit.

