/**
 * @fileoverview Tests for handlers index exports
 */

import { BaseHandler, ChannelHandler } from './index';

describe('Handlers Index Exports', () => {
  test('should export BaseHandler', () => {
    expect(BaseHandler).toBeDefined();
    expect(typeof BaseHandler).toBe('function');
  });

  test('should export ChannelHandler', () => {
    expect(ChannelHandler).toBeDefined();
    expect(typeof ChannelHandler).toBe('function');
  });

  test('exported classes should be constructable', () => {
    // BaseHandler is abstract, so we test through ChannelHandler
    const authConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret'
    };
    
    const serviceConfig = {
      baseUrl: 'https://api.test.com',
      timeout: 5000,
      maxRetries: 3,
      debug: false
    };

    expect(() => new ChannelHandler(authConfig, serviceConfig)).not.toThrow();
  });
});