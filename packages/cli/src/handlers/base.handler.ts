/**
 * @fileoverview Base handler for CLI command operations
 * @author Development Team
 * @since 2.1.0
 */

import Table from 'cli-table3';
import { PolyVError } from '../utils/errors';

/**
 * Output format options for handlers
 */
export type OutputFormat = 'table' | 'json';

/**
 * Base handler class providing common functionality for all command handlers
 */
export abstract class BaseHandler {
  /**
   * Executes an operation with standardized error handling
   * @param operation Async operation to execute
   * @param operationName Name of the operation for debugging
   * @returns Promise that resolves when operation completes
   */
  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      // Log the error for debugging
      if (process.env['DEBUG']) {
        console.error(`[${operationName}] Error details:`, error);
      }

      // Re-throw PolyV errors as-is (they have user-friendly messages)
      if (error instanceof PolyVError) {
        throw error;
      }

      // Re-throw other errors without logging here. The command action's catch
      // handler is the single user-facing logging point, so logging here would
      // cause every error to be printed twice in the CLI flow.
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Displays success message with optional data
   * @param message Success message
   * @param data Optional data to display
   * @param format Output format (table or json)
   */
  protected displaySuccess(
    message: string,
    data?: any,
    format: OutputFormat = 'table'
  ): void {
    console.log(`✅ ${message}`);
    
    if (data) {
      this.displayData(data, format);
    }
  }

  /**
   * Displays data in the specified format
   * @param data Data to display
   * @param format Output format (table or json)
   */
  protected displayData(data: any, format: OutputFormat = 'table'): void {
    if (format === 'json') {
      console.log(JSON.stringify(data, null, 2));
    } else {
      this.displayAsTable(data);
    }
  }

  /**
   * Displays data as a formatted table
   * @param data Data to display in table format
   */
  protected displayAsTable(data: any): void {
    if (!data || typeof data !== 'object') {
      console.log(data);
      return;
    }

    if (Array.isArray(data)) {
      this.displayArrayAsTable(data);
    } else {
      this.displayObjectAsTable(data);
    }
  }

  /**
   * Displays an array of objects as a table
   * @param data Array of objects to display
   */
  private displayArrayAsTable(data: any[]): void {
    if (data.length === 0) {
      console.log('No data to display');
      return;
    }

    // Get all unique keys from all objects
    const allKeys = new Set<string>();
    data.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => allKeys.add(key));
      }
    });

    const headers = Array.from(allKeys);
    const table = new Table({
      head: headers,
      style: { head: ['cyan'] }
    });

    data.forEach(item => {
      const row = headers.map(header => {
        const value = item?.[header];
        return this.formatTableValue(value);
      });
      table.push(row);
    });

    console.log(table.toString());
  }

  /**
   * Displays a single object as a table
   * @param data Object to display
   */
  private displayObjectAsTable(data: any): void {
    const table = new Table({
      style: { head: ['cyan'] }
    });

    Object.entries(data).forEach(([key, value]) => {
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
      const formattedValue = this.formatTableValue(value);
      table.push({ [formattedKey]: formattedValue });
    });

    console.log(table.toString());
  }

  /**
   * Formats a value for display in a table
   * @param value Value to format
   * @returns Formatted string representation
   */
  private formatTableValue(value: any): string {
    if (value === null || value === undefined) {
      return '-';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (value instanceof Date) {
      return value.toLocaleString();
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Displays an error message
   * @param message Error message
   * @param details Optional error details
   */
  protected displayError(message: string, details?: any): void {
    console.error(`❌ ${message}`);
    
    if (details && process.env['DEBUG']) {
      console.error('Error details:', details);
    }
  }

  /**
   * Displays a warning message
   * @param message Warning message
   */
  protected displayWarning(message: string): void {
    console.warn(`⚠️  ${message}`);
  }

  /**
   * Displays an info message
   * @param message Info message
   */
  protected displayInfo(message: string): void {
    console.log(`ℹ️  ${message}`);
  }

  /**
   * Validates required parameters
   * @param params Object containing parameters
   * @param requiredFields Array of required field names
   * @throws {PolyVError} When required fields are missing
   */
  protected validateRequiredParams(
    params: Record<string, any>,
    requiredFields: string[]
  ): void {
    const missing = requiredFields.filter(field => 
      params[field] === undefined || params[field] === null || params[field] === ''
    );

    if (missing.length > 0) {
      throw new PolyVError(
        `Missing required parameters: ${missing.join(', ')}`,
        'MISSING_REQUIRED_PARAMS',
        1,
        { missing, provided: Object.keys(params) }
      );
    }
  }
}