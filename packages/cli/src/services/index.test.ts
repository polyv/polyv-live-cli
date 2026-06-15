/**
 * @fileoverview Tests for services index exports
 */

import { ChannelServiceSdk, StreamServiceSdk, ProductServiceSdk } from './index';

describe('Services Index Exports', () => {
  test('should export ChannelServiceSdk', () => {
    expect(ChannelServiceSdk).toBeDefined();
    expect(typeof ChannelServiceSdk).toBe('function');
  });

  test('should export StreamServiceSdk', () => {
    expect(StreamServiceSdk).toBeDefined();
    expect(typeof StreamServiceSdk).toBe('function');
  });

  test('should export ProductServiceSdk', () => {
    expect(ProductServiceSdk).toBeDefined();
    expect(typeof ProductServiceSdk).toBe('function');
  });
});
