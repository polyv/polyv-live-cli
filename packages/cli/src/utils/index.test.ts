/**
 * @fileoverview Tests for utils index exports
 */

import * as utils from './index';

describe('Utils Index Exports', () => {
  test('should export error utilities', () => {
    expect(utils.PolyVAPIError).toBeDefined();
    expect(utils.PolyVValidationError).toBeDefined();
    expect(utils.ConfigurationError).toBeDefined();
    expect(utils.logError).toBeDefined();
    expect(utils.formatError).toBeDefined();
  });

  test('should export signature utilities', () => {
    expect(utils.generateSignature).toBeDefined();
  });

  test('should export confirmation utilities', () => {
    expect(utils.confirmDeletion).toBeDefined();
    expect(utils.isInteractiveEnvironment).toBeDefined();
    expect(utils.validateConfirmationEnvironment).toBeDefined();
  });

  test('exported functions should be callable', () => {
    // Test signature utilities
    expect(typeof utils.generateSignature).toBe('function');
    
    // Test error utilities
    expect(typeof utils.logError).toBe('function');
    expect(typeof utils.formatError).toBeDefined();
    
    // Test confirmation utilities
    expect(typeof utils.confirmDeletion).toBe('function');
    expect(typeof utils.isInteractiveEnvironment).toBe('function');
  });

  test('error classes should be constructable', () => {
    expect(() => new utils.PolyVAPIError('test error')).not.toThrow();
    expect(() => new utils.PolyVValidationError('validation error', 'testField', 'testValue', 'testConstraint')).not.toThrow();
    expect(() => new utils.ConfigurationError('config error')).not.toThrow();
  });
});