/**
 * @fileoverview Unit tests for environment utilities
 * @module utils/env.test
 */

import { describe, it, expect } from 'vitest';
import { isNode, isBrowser, isWebWorker, getEnvironmentInfo } from './env.js';

describe('Environment Utilities', () => {
  describe('isNode', () => {
    it('[P0] should detect Node.js environment', () => {
      // In vitest/node environment, isNode should be true
      expect(typeof isNode).toBe('boolean');
      expect(isNode).toBe(true); // Running in Node.js
    });
  });

  describe('isBrowser', () => {
    it('[P0] should detect browser environment', () => {
      expect(typeof isBrowser).toBe('boolean');
      expect(isBrowser).toBe(false); // Running in Node.js, not browser
    });
  });

  describe('isWebWorker', () => {
    it('[P0] should detect web worker environment', () => {
      expect(typeof isWebWorker).toBe('boolean');
      expect(isWebWorker).toBe(false); // Not in web worker
    });
  });

  describe('getEnvironmentInfo', () => {
    it('[P0] should return environment info object', () => {
      const info = getEnvironmentInfo();

      expect(info).toHaveProperty('isNode');
      expect(info).toHaveProperty('isBrowser');
      expect(info).toHaveProperty('isWebWorker');
      expect(info).toHaveProperty('cryptoAvailable');
      expect(info).toHaveProperty('cryptoSource');
    });

    it('[P0] should detect Node.js in test environment', () => {
      const info = getEnvironmentInfo();

      expect(info.isNode).toBe(true);
      expect(info.isBrowser).toBe(false);
      expect(info.isWebWorker).toBe(false);
    });

    it('[P0] should have crypto available in Node.js', () => {
      const info = getEnvironmentInfo();

      expect(info.cryptoAvailable).toBe(true);
      expect(info.cryptoSource).toBe('node');
    });

    it('[P1] should return valid crypto source types', () => {
      const info = getEnvironmentInfo();
      const validSources = ['node', 'browser', 'crypto-js', 'none'];

      expect(validSources).toContain(info.cryptoSource);
    });
  });
});
