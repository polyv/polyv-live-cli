/**
 * @fileoverview Unit tests for BaseHandler class
 * @author Development Team
 * @since 2.1.0
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { PolyVError, logError } from '../utils/errors';

// Mock the utils/errors module
jest.mock('../utils/errors');

// Create a concrete implementation of BaseHandler for testing
class TestHandler extends BaseHandler {
  public async testExecuteWithErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    return this.executeWithErrorHandling(operation, operationName);
  }

  public testDisplaySuccess(message: string, data?: any, format?: OutputFormat): void {
    return this.displaySuccess(message, data, format);
  }

  public testDisplayData(data: any, format?: OutputFormat): void {
    return this.displayData(data, format);
  }

  public testDisplayAsTable(data: any): void {
    return this.displayAsTable(data);
  }

  public testDisplayError(message: string, details?: any): void {
    return this.displayError(message, details);
  }

  public testDisplayWarning(message: string): void {
    return this.displayWarning(message);
  }

  public testDisplayInfo(message: string): void {
    return this.displayInfo(message);
  }

  public testValidateRequiredParams(params: Record<string, any>, requiredFields: string[]): void {
    return this.validateRequiredParams(params, requiredFields);
  }
}

describe('BaseHandler', () => {
  let handler: TestHandler;
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    handler = new TestHandler();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    originalEnv = process.env;
    
    // Clear mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    process.env = originalEnv;
  });

  describe('executeWithErrorHandling', () => {
    it('should execute operation successfully', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');
      
      const result = await handler.testExecuteWithErrorHandling(mockOperation, 'test-operation');
      
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should re-throw PolyVError as-is', async () => {
      const polyVError = new PolyVError('Test error', 'TEST_CODE', 1);
      const mockOperation = jest.fn(() => Promise.reject(polyVError));
      
      try {
        await handler.testExecuteWithErrorHandling(mockOperation, 'test-operation');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVError);
        expect(error).toBe(polyVError);
      }
      
      expect(logError).not.toHaveBeenCalled();
    });

    it('should re-throw other Error objects without double-logging', async () => {
      const error = new Error('Regular error');
      const mockOperation = jest.fn().mockRejectedValue(error);

      await expect(handler.testExecuteWithErrorHandling(mockOperation, 'test-operation'))
        .rejects.toThrow(error);

      // Logging is the command layer's responsibility; the handler must not log
      // (otherwise the CLI prints each error twice).
      expect(logError).not.toHaveBeenCalled();
    });

    it('should convert non-Error objects to Error and re-throw without logging', async () => {
      const stringError = 'String error';
      const mockOperation = jest.fn().mockRejectedValue(stringError);

      try {
        await handler.testExecuteWithErrorHandling(mockOperation, 'test-operation');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(stringError);
      }

      expect(logError).not.toHaveBeenCalled();
    });

    it('should log debug information when DEBUG env is set', async () => {
      process.env['DEBUG'] = '1';
      const error = new Error('Debug error');
      const mockOperation = jest.fn().mockRejectedValue(error);
      
      await expect(handler.testExecuteWithErrorHandling(mockOperation, 'debug-operation'))
        .rejects.toThrow(error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('[debug-operation] Error details:', error);
    });

    it('should not log debug information when DEBUG env is not set', async () => {
      delete process.env['DEBUG'];
      const error = new Error('No debug error');
      const mockOperation = jest.fn().mockRejectedValue(error);
      
      await expect(handler.testExecuteWithErrorHandling(mockOperation, 'no-debug-operation'))
        .rejects.toThrow(error);
      
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('[no-debug-operation] Error details:'),
        error
      );
    });
  });

  describe('displaySuccess', () => {
    it('should display success message without data', () => {
      handler.testDisplaySuccess('Operation completed');
      
      expect(consoleSpy).toHaveBeenCalledWith('✅ Operation completed');
    });

    it('should display success message with data in table format', () => {
      const data = { id: 1, name: 'test' };
      handler.testDisplaySuccess('Operation completed', data);
      
      expect(consoleSpy).toHaveBeenCalledWith('✅ Operation completed');
      // Should also call displayData which will format as table
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Id'));
    });

    it('should display success message with data in json format', () => {
      const data = { id: 1, name: 'test' };
      handler.testDisplaySuccess('Operation completed', data, 'json');
      
      expect(consoleSpy).toHaveBeenCalledWith('✅ Operation completed');
      expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
    });
  });

  describe('displayData', () => {
    it('should display data as JSON when format is json', () => {
      const data = { id: 1, name: 'test' };
      handler.testDisplayData(data, 'json');
      
      expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
    });

    it('should display data as table when format is table (default)', () => {
      const data = { id: 1, name: 'test' };
      handler.testDisplayData(data, 'table');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Id'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Name'));
    });

    it('should default to table format when no format specified', () => {
      const data = { id: 1, name: 'test' };
      handler.testDisplayData(data);
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Id'));
    });
  });

  describe('displayAsTable', () => {
    it('should display non-object data directly', () => {
      handler.testDisplayAsTable('simple string');
      expect(consoleSpy).toHaveBeenCalledWith('simple string');
      
      handler.testDisplayAsTable(123);
      expect(consoleSpy).toHaveBeenCalledWith(123);
    });

    it('should display null/undefined directly', () => {
      handler.testDisplayAsTable(null);
      expect(consoleSpy).toHaveBeenCalledWith(null);
      
      handler.testDisplayAsTable(undefined);
      expect(consoleSpy).toHaveBeenCalledWith(undefined);
    });

    it('should display array as table', () => {
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];
      handler.testDisplayAsTable(data);
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('id'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('name'));
    });

    it('should display object as table', () => {
      const data = { id: 1, name: 'test', active: true };
      handler.testDisplayAsTable(data);
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Id'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Name'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Active'));
    });

    it('should handle empty arrays', () => {
      handler.testDisplayAsTable([]);
      expect(consoleSpy).toHaveBeenCalledWith('No data to display');
    });

    it('should handle arrays with mixed object structures', () => {
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2', extra: 'value' },
        { id: 3 }
      ];
      handler.testDisplayAsTable(data);
      
      // Should include all unique keys from all objects
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('id'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('name'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('extra'));
    });

    it('should handle arrays with non-object items', () => {
      const data = [
        { id: 1, name: 'Item 1' },
        'string item',
        null,
        { id: 2 }
      ];
      handler.testDisplayAsTable(data);
      
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should format various value types correctly', () => {
      const data = {
        nullValue: null,
        undefinedValue: undefined,
        booleanTrue: true,
        booleanFalse: false,
        dateValue: new Date('2023-01-01T08:00:00Z'),
        objectValue: { nested: 'object' },
        stringValue: 'text'
      };
      handler.testDisplayAsTable(data);
      
      const tableOutput = consoleSpy.mock.calls[0][0];
      expect(tableOutput).toContain('-'); // null/undefined formatted as '-'
      expect(tableOutput).toContain('Yes'); // true formatted as 'Yes'
      expect(tableOutput).toContain('No'); // false formatted as 'No'
      expect(tableOutput).toContain('2023'); // date formatted (year should always be present)
      expect(tableOutput).toContain('{"nested":"object"}'); // object stringified
      expect(tableOutput).toContain('text'); // string as-is
    });
  });

  describe('displayError', () => {
    it('should display error message', () => {
      handler.testDisplayError('Something went wrong');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Something went wrong');
    });

    it('should display error details when DEBUG is enabled', () => {
      process.env['DEBUG'] = '1';
      const details = { code: 'ERR001', context: 'test' };
      
      handler.testDisplayError('Something went wrong', details);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Something went wrong');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error details:', details);
    });

    it('should not display error details when DEBUG is not enabled', () => {
      delete process.env['DEBUG'];
      const details = { code: 'ERR001', context: 'test' };
      
      handler.testDisplayError('Something went wrong', details);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Something went wrong');
      expect(consoleErrorSpy).not.toHaveBeenCalledWith('Error details:', details);
    });
  });

  describe('displayWarning', () => {
    it('should display warning message', () => {
      handler.testDisplayWarning('This is a warning');
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️  This is a warning');
    });
  });

  describe('displayInfo', () => {
    it('should display info message', () => {
      handler.testDisplayInfo('This is information');
      
      expect(consoleSpy).toHaveBeenCalledWith('ℹ️  This is information');
    });
  });

  describe('validateRequiredParams', () => {
    it('should pass validation when all required params are provided', () => {
      const params = { name: 'test', id: 123, active: true };
      const requiredFields = ['name', 'id'];
      
      expect(() => {
        handler.testValidateRequiredParams(params, requiredFields);
      }).not.toThrow();
    });

    it('should throw PolyVError when required params are missing', () => {
      const params = { name: 'test' };
      const requiredFields = ['name', 'id', 'active'];
      
      expect(() => {
        handler.testValidateRequiredParams(params, requiredFields);
      }).toThrow(PolyVError);
    });

    it('should throw PolyVError with correct missing field information', () => {
      const params = { name: 'test', id: null, active: '' };
      const requiredFields = ['name', 'id', 'active', 'description'];
      
      expect(() => {
        handler.testValidateRequiredParams(params, requiredFields);
      }).toThrow();
    });

    it('should consider undefined, null, and empty string as missing', () => {
      const params = {
        valid: 'value',
        undefinedValue: undefined,
        nullValue: null,
        emptyString: '',
        zeroNumber: 0,
        falseBolean: false
      };
      const requiredFields = ['valid', 'undefinedValue', 'nullValue', 'emptyString', 'zeroNumber', 'falseBolean'];
      
      expect(() => {
        handler.testValidateRequiredParams(params, requiredFields);
      }).toThrow();
    });

    it('should handle empty required fields array', () => {
      const params = { name: 'test' };
      const requiredFields: string[] = [];
      
      expect(() => {
        handler.testValidateRequiredParams(params, requiredFields);
      }).not.toThrow();
    });
  });
});