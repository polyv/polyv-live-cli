/**
 * Unit tests for config types and utilities
 */

import { validateOutputFormat } from './config';

describe('Config Types', () => {
  describe('validateOutputFormat', () => {
    it('should return valid format for table', () => {
      expect(validateOutputFormat('table')).toBe('table');
    });

    it('should return valid format for json', () => {
      expect(validateOutputFormat('json')).toBe('json');
    });

    it('should throw error for invalid format', () => {
      expect(() => validateOutputFormat('invalid')).toThrow(
        'Invalid output format: invalid. Must be one of: table, json'
      );
    });

    it('should throw error for empty string', () => {
      expect(() => validateOutputFormat('')).toThrow(
        'Invalid output format: . Must be one of: table, json'
      );
    });

    it('should throw error for xml format', () => {
      expect(() => validateOutputFormat('xml')).toThrow(
        'Invalid output format: xml. Must be one of: table, json'
      );
    });

    it('should throw error for csv format', () => {
      expect(() => validateOutputFormat('csv')).toThrow(
        'Invalid output format: csv. Must be one of: table, json'
      );
    });
  });
});