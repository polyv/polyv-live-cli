/**
 * @fileoverview ATDD Unit tests for VariableResolver (Story 8-4)
 * TDD RED PHASE - These tests will FAIL until the feature is implemented
 */

import { VariableResolver, ResourceOutputs } from './variable-resolver';

describe('VariableResolver', () => {
  let resolver: VariableResolver;

  beforeEach(() => {
    resolver = new VariableResolver();
  });

  // ========================================
  // AC3: 变量类型 - {timestamp}
  // ========================================
  describe('timestamp variable', () => {
    it('[P0] should resolve {timestamp} to millisecond timestamp', () => {
      const before = Date.now();
      const result = resolver.resolve('channel-{timestamp}');
      const after = Date.now();

      const timestamp = parseInt(result.replace('channel-', ''), 10);
      // Allow 10ms tolerance for CI timing edge cases
      expect(timestamp).toBeGreaterThanOrEqual(before - 10);
      expect(timestamp).toBeLessThanOrEqual(after + 10);
    });

    it('[P1] should resolve multiple {timestamp} in same string', () => {
      // Multiple timestamps in same resolution should be same value
      const result = resolver.resolve('{timestamp}-{timestamp}');
      const parts = result.split('-');
      expect(parts[0]).toBe(parts[1]);
    });

    it('[P1] should use consistent timestamp within resolve call', () => {
      const template = {
        name: 'channel-{timestamp}',
        description: 'created at {timestamp}'
      };

      const result = resolver.resolveObject(template);
      const timestamp = (result.name as string).replace('channel-', '');
      expect(result.description).toBe(`created at ${timestamp}`);
    });
  });

  // ========================================
  // AC3: 变量类型 - {random:n-m}
  // ========================================
  describe('random variable', () => {
    it('[P0] should resolve {random:6-16} to random string of 6-16 chars', () => {
      const result = resolver.resolve('password-{random:6-16}');
      const password = result.replace('password-', '');

      expect(password.length).toBeGreaterThanOrEqual(6);
      expect(password.length).toBeLessThanOrEqual(16);
    });

    it('[P0] should generate alphanumeric random string', () => {
      const result = resolver.resolve('{random:10-10}');
      expect(result).toMatch(/^[a-zA-Z0-9]{10}$/);
    });

    it('[P1] should handle fixed length random', () => {
      const result = resolver.resolve('{random:8-8}');
      expect(result.length).toBe(8);
    });

    it('[P1] should throw error for invalid range', () => {
      expect(() => resolver.resolve('{random:10-5}'))
        .toThrow('Invalid random range: min must be <= max');
    });

    it('[P1] should throw error for range below 1', () => {
      expect(() => resolver.resolve('{random:0-5}'))
        .toThrow('Invalid random range: min must be >= 1');
    });

    it('[P2] should generate different values on each call', () => {
      const results = new Set<string>();
      for (let i = 0; i < 100; i++) {
        results.add(resolver.resolve('{random:8-8}'));
      }
      // Should have many unique values (very unlikely to get duplicates)
      expect(results.size).toBeGreaterThan(90);
    });
  });

  // ========================================
  // AC3: 变量类型 - {now} and {now+Nd}
  // ========================================
  describe('now variable', () => {
    it('[P0] should resolve {now} to current timestamp', () => {
      const before = Date.now();
      const result = resolver.resolve('{now}');
      const after = Date.now();

      const timestamp = parseInt(result, 10);
      // Allow 2ms tolerance for edge cases
      expect(timestamp).toBeGreaterThanOrEqual(before - 2);
      expect(timestamp).toBeLessThanOrEqual(after + 2);
    });

    it('[P0] should resolve {now+30d} to 30 days from now', () => {
      const now = Date.now();
      const expectedFuture = now + 30 * 24 * 60 * 60 * 1000;
      const tolerance = 1000; // 1 second tolerance

      const result = resolver.resolve('{now+30d}');
      const timestamp = parseInt(result, 10);

      expect(Math.abs(timestamp - expectedFuture)).toBeLessThan(tolerance);
    });

    it('[P1] should resolve {now+1d} to 1 day from now', () => {
      const now = Date.now();
      const expectedFuture = now + 1 * 24 * 60 * 60 * 1000;
      const tolerance = 1000;

      const result = resolver.resolve('{now+1d}');
      const timestamp = parseInt(result, 10);

      expect(Math.abs(timestamp - expectedFuture)).toBeLessThan(tolerance);
    });

    it('[P1] should resolve {now+7d} for weekly expiry', () => {
      const now = Date.now();
      const expectedFuture = now + 7 * 24 * 60 * 60 * 1000;
      const tolerance = 1000;

      const result = resolver.resolve('{now+7d}');
      const timestamp = parseInt(result, 10);

      expect(Math.abs(timestamp - expectedFuture)).toBeLessThan(tolerance);
    });

    it('[P2] should throw error for invalid day format', () => {
      expect(() => resolver.resolve('{now+invalid}'))
        .toThrow('Invalid now offset format');
    });
  });

  // ========================================
  // AC3: 变量类型 - 资源引用 {resource.field}
  // ========================================
  describe('resource reference variable', () => {
    const mockOutputs: ResourceOutputs = {
      channel: {
        channelId: 'ch_12345',
        channelName: '电商示例频道'
      },
      product: {
        productId: 'prod_67890'
      },
      coupon: {
        couponId: 'cpn_abc123'
      }
    };

    it('[P0] should resolve {channel.channelId} from resource outputs', () => {
      const result = resolver.resolve('{channel.channelId}', mockOutputs);
      expect(result).toBe('ch_12345');
    });

    it('[P0] should resolve multiple resource references', () => {
      const result = resolver.resolve(
        'Channel: {channel.channelId}, Product: {product.productId}',
        mockOutputs
      );
      expect(result).toBe('Channel: ch_12345, Product: prod_67890');
    });

    it('[P1] should throw error for undefined resource', () => {
      expect(() => resolver.resolve('{nonexistent.field}', mockOutputs))
        .toThrow('Resource "nonexistent" not found in outputs');
    });

    it('[P1] should throw error for undefined field', () => {
      expect(() => resolver.resolve('{channel.nonexistentField}', mockOutputs))
        .toThrow('Field "nonexistentField" not found in resource "channel"');
    });

    it('[P1] should resolve nested resource fields', () => {
      const nestedOutputs: ResourceOutputs = {
        channel: {
          channelId: 'ch_123',
          config: { maxViewers: 1000 }
        }
      };

      // Object values are converted to JSON string
      const result = resolver.resolve('{channel.config}', nestedOutputs);
      expect(result).toBe('{"maxViewers":1000}');
    });
  });

  // ========================================
  // resolveObject - 处理整个对象
  // ========================================
  describe('resolveObject', () => {
    const mockOutputs: ResourceOutputs = {
      channel: { channelId: 'ch_123', channelName: 'Test Channel' }
    };

    it('[P0] should resolve variables in all string values', () => {
      const template = {
        name: 'channel-{timestamp}',
        channelId: '{channel.channelId}'
      };

      const result = resolver.resolveObject(template, mockOutputs);

      expect(result.name).toMatch(/^channel-\d+$/);
      expect(result.channelId).toBe('ch_123');
    });

    it('[P0] should handle nested objects', () => {
      const template = {
        resource: {
          id: '{channel.channelId}',
          name: 'test-{timestamp}'
        }
      };

      const result = resolver.resolveObject(template, mockOutputs);

      expect(result.resource.id).toBe('ch_123');
      expect(result.resource.name).toMatch(/^test-\d+$/);
    });

    it('[P1] should handle arrays', () => {
      const template = {
        ids: ['{channel.channelId}', '{timestamp}']
      };

      const result = resolver.resolveObject(template, mockOutputs);

      expect(result.ids[0]).toBe('ch_123');
      expect(result.ids[1]).toMatch(/^\d+$/);
    });

    it('[P1] should preserve non-string values', () => {
      const template = {
        count: 100,
        enabled: true,
        price: 99.9,
        name: '{channel.channelId}'
      };

      const result = resolver.resolveObject(template, mockOutputs);

      expect(result.count).toBe(100);
      expect(result.enabled).toBe(true);
      expect(result.price).toBe(99.9);
      expect(result.name).toBe('ch_123');
    });

    it('[P2] should handle null values', () => {
      const template = {
        value: null,
        name: '{channel.channelId}'
      };

      const result = resolver.resolveObject(template, mockOutputs);

      expect(result.value).toBeNull();
      expect(result.name).toBe('ch_123');
    });
  });

  // ========================================
  // 边界情况和错误处理
  // ========================================
  describe('edge cases', () => {
    it('[P1] should handle string with no variables', () => {
      const result = resolver.resolve('plain text');
      expect(result).toBe('plain text');
    });

    it('[P1] should handle empty string', () => {
      const result = resolver.resolve('');
      expect(result).toBe('');
    });

    it('[P2] should handle malformed variable syntax gracefully', () => {
      // Missing closing brace
      expect(() => resolver.resolve('{timestamp'))
        .toThrow('Malformed variable syntax');
    });

    it('[P2] should handle unclosed braces', () => {
      expect(() => resolver.resolve('{channel.channelId'))
        .toThrow('Malformed variable syntax');
    });

    it('[P2] should handle nested braces', () => {
      // This should be treated as literal or throw error
      const result = resolver.resolve('{{timestamp}}');
      // Behavior depends on implementation
      expect(result).toBeDefined();
    });

    it('[P3] should handle very long strings', () => {
      const longTemplate = '{timestamp} '.repeat(1000);
      const result = resolver.resolve(longTemplate);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(1000);
    });
  });

  // ========================================
  // AC6: 输出模板渲染
  // ========================================
  describe('renderTemplate', () => {
    const mockOutputs: ResourceOutputs = {
      channel: { channelId: 'ch_123', channelName: 'Test Channel' },
      product: { productId: 'prod_456' },
      coupon: { couponId: 'cpn_789' }
    };

    it('[P0] should render output template with resource references', () => {
      const template = `
# 🎉 配置完成！
## 频道
- ID: {channel.channelId}
- 名称: {channel.channelName}
## 商品
- ID: {product.productId}
## 优惠券
- ID: {coupon.couponId}
`;

      const result = resolver.renderTemplate(template, mockOutputs);

      expect(result).toContain('ID: ch_123');
      expect(result).toContain('名称: Test Channel');
      expect(result).toContain('ID: prod_456');
      expect(result).toContain('ID: cpn_789');
    });

    it('[P1] should render nextSteps commands', () => {
      const template = 'polyv-live-cli stream start --channelId {channel.channelId}';

      const result = resolver.renderTemplate(template, mockOutputs);

      expect(result).toBe('polyv-live-cli stream start --channelId ch_123');
    });

    it('[P1] should handle template with missing variables gracefully', () => {
      const template = 'ID: {channel.channelId}, Missing: {nonexistent.field}';

      // Should either throw or handle gracefully
      expect(() => resolver.renderTemplate(template, mockOutputs))
        .toThrow('Resource "nonexistent" not found');
    });
  });
});
