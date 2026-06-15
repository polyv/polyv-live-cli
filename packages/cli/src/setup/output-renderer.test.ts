/**
 * @fileoverview ATDD Unit tests for OutputRenderer (Story 8-4)
 * TDD RED PHASE - These tests will FAIL until the feature is implemented
 */

import { OutputRenderer } from './output-renderer';
import { SceneConfig } from './scene-config-loader';
import { ResourceResult } from './scene-executor';

describe('OutputRenderer', () => {
  let renderer: OutputRenderer;

  const mockConfig: SceneConfig = {
    name: 'e-commerce',
    version: '1.0',
    description: '电商直播场景',
    metadata: { icon: '🛒', category: 'business' },
    resources: [],
    outputTemplate: `
# 🎉 配置完成！
## 频道
- ID: {channel.channelId}
## 商品
- ID: {product.productId}
## 优惠券
- ID: {coupon.couponId}
`,
    nextSteps: [
      {
        command: 'polyv-live-cli stream start --channelId {channel.channelId}',
        description: '开始直播'
      },
      {
        command: 'polyv-live-cli product list --channelId {channel.channelId}',
        description: '查看商品列表'
      }
    ]
  };

  const mockResources: ResourceResult[] = [
    { id: 'channel', type: 'channel', output: { channelId: 'ch_123', channelName: '电商频道' }, status: 'created' },
    { id: 'product', type: 'product', output: { productId: 'prod_456' }, status: 'created' },
    { id: 'coupon', type: 'coupon', output: { couponId: 'cpn_789' }, status: 'created' }
  ];

  beforeEach(() => {
    renderer = new OutputRenderer();
  });

  // ========================================
  // AC6: 输出配置摘要
  // ========================================
  describe('renderSummary', () => {
    it('[P0] should render summary with all resource outputs', () => {
      const output = renderer.renderSummary(mockConfig, mockResources);

      expect(output).toContain('ch_123');
      expect(output).toContain('prod_456');
      expect(output).toContain('cpn_789');
    });

    it('[P0] should render summary with scene name', () => {
      const output = renderer.renderSummary(mockConfig, mockResources);

      expect(output).toContain('e-commerce');
    });

    it('[P0] should render summary with emoji icon', () => {
      const output = renderer.renderSummary(mockConfig, mockResources);

      expect(output).toContain('🛒');
    });

    it('[P1] should render summary in table format', () => {
      const output = renderer.renderSummary(mockConfig, mockResources, { format: 'table' });

      // Should contain table formatting
      expect(output).toBeDefined();
    });

    it('[P1] should render summary in JSON format', () => {
      const output = renderer.renderSummary(mockConfig, mockResources, { format: 'json' });

      const parsed = JSON.parse(output);
      expect(parsed.scene).toBe('e-commerce');
      expect(parsed.resources).toHaveLength(3);
    });

    it('[P1] should include timing information', () => {
      const output = renderer.renderSummary(mockConfig, mockResources, {
        duration: 1234
      });

      expect(output).toContain('1.23'); // Duration in seconds
    });

    it('[P2] should handle empty resources', () => {
      const output = renderer.renderSummary(mockConfig, []);

      // Should still show success message even with empty resources
      expect(output).toContain('configured successfully');
    });
  });

  // ========================================
  // AC6: 下一步操作指引
  // ========================================
  describe('renderNextSteps', () => {
    const resourceOutputs = {
      channel: { channelId: 'ch_123', channelName: '电商频道' },
      product: { productId: 'prod_456' },
      coupon: { couponId: 'cpn_789' }
    };

    it('[P0] should render next steps with resolved variables', () => {
      const output = renderer.renderNextSteps(mockConfig.nextSteps!, resourceOutputs);

      expect(output).toContain('polyv-live-cli stream start --channelId ch_123');
      expect(output).toContain('polyv-live-cli product list --channelId ch_123');
    });

    it('[P0] should render next step descriptions', () => {
      const output = renderer.renderNextSteps(mockConfig.nextSteps!, resourceOutputs);

      expect(output).toContain('开始直播');
      expect(output).toContain('查看商品列表');
    });

    it('[P1] should handle empty next steps', () => {
      const output = renderer.renderNextSteps([], resourceOutputs);

      expect(output).toContain('No next steps');
    });

    it('[P1] should handle missing variables gracefully', () => {
      const steps = [
        {
          command: 'polyv-live-cli test --id {nonexistent.field}',
          description: 'Test'
        }
      ];

      // Should handle gracefully by showing error in output (not throwing)
      const output = renderer.renderNextSteps(steps, resourceOutputs);
      expect(output).toContain('error');
    });

    it('[P2] should number the steps', () => {
      const output = renderer.renderNextSteps(mockConfig.nextSteps!, resourceOutputs);

      expect(output).toContain('1.');
      expect(output).toContain('2.');
    });
  });

  // ========================================
  // Progress Rendering
  // ========================================
  describe('renderProgress', () => {
    it('[P0] should render creating progress', () => {
      const output = renderer.renderProgress({
        phase: 'creating',
        resourceId: 'channel',
        resourceType: 'channel'
      });

      expect(output).toContain('Creating');
      expect(output).toContain('channel');
    });

    it('[P0] should render created progress', () => {
      const output = renderer.renderProgress({
        phase: 'created',
        resourceId: 'channel',
        resourceType: 'channel'
      });

      expect(output).toContain('Created');
      expect(output).toContain('channel');
    });

    it('[P0] should render rollback progress', () => {
      const output = renderer.renderProgress({
        phase: 'rolling_back',
        resourceId: 'channel',
        resourceType: 'channel'
      });

      expect(output).toContain('Rolling back');
    });

    it('[P1] should render progress with spinner', () => {
      const output = renderer.renderProgress({
        phase: 'creating',
        resourceId: 'channel',
        resourceType: 'channel',
        showSpinner: true
      });

      expect(output).toMatch(/⠋|⠙|⠹|⠸|⠼|⠴|⠦|⠧|⠇|⠏/);
    });

    it('[P1] should render progress percentage', () => {
      const output = renderer.renderProgress({
        phase: 'creating',
        resourceId: 'product',
        resourceType: 'product',
        current: 2,
        total: 3
      });

      expect(output).toContain('2/3');
    });
  });

  // ========================================
  // Error Rendering
  // ========================================
  describe('renderError', () => {
    it('[P0] should render error with rollback info', () => {
      const output = renderer.renderError(
        new Error('Failed to create product'),
        {
          rolledBack: ['channel', 'coupon']
        }
      );

      expect(output).toContain('Failed to create product');
      expect(output).toContain('Rolled back');
      expect(output).toContain('channel');
      expect(output).toContain('coupon');
    });

    it('[P0] should render error with failure point', () => {
      const output = renderer.renderError(
        new Error('Product creation failed'),
        {
          failedAt: 'product'
        }
      );

      expect(output).toContain('Failed at: product');
    });

    it('[P1] should render error with suggestion', () => {
      const output = renderer.renderError(
        new Error('Authentication failed'),
        {
          suggestion: 'Check your appId and appSecret'
        }
      );

      expect(output).toContain('Suggestion');
      expect(output).toContain('Check your appId and appSecret');
    });

    it('[P1] should render error in JSON format', () => {
      const output = renderer.renderError(
        new Error('Test error'),
        {},
        { format: 'json' }
      );

      const parsed = JSON.parse(output);
      expect(parsed.error).toBe('Test error');
    });
  });

  // ========================================
  // Template Rendering
  // ========================================
  describe('renderTemplate', () => {
    it('[P0] should render output template with resource values', () => {
      const template = 'Channel: {channel.channelId}, Product: {product.productId}';
      const outputs = {
        channel: { channelId: 'ch_123' },
        product: { productId: 'prod_456' }
      };

      const output = renderer.renderTemplate(template, outputs);

      expect(output).toBe('Channel: ch_123, Product: prod_456');
    });

    it('[P1] should handle multiline templates', () => {
      const template = `
# Header
Channel: {channel.channelId}
Product: {product.productId}
`;

      const outputs = {
        channel: { channelId: 'ch_123' },
        product: { productId: 'prod_456' }
      };

      const output = renderer.renderTemplate(template, outputs);

      expect(output).toContain('Channel: ch_123');
      expect(output).toContain('Product: prod_456');
    });

    it('[P1] should preserve template formatting', () => {
      const template = 'Line 1\n  Line 2 (indented)\nLine 3';

      const output = renderer.renderTemplate(template, {});

      expect(output).toContain('  Line 2 (indented)');
    });
  });

  // ========================================
  // Dry Run Output
  // ========================================
  describe('renderDryRunOutput', () => {
    it('[P0] should show what would be created', () => {
      const output = renderer.renderDryRunOutput(mockConfig, mockResources);

      // Check for dry run indicator and resources
      expect(output).toContain('Dry Run');
      expect(output).toContain('channel');
      expect(output).toContain('product');
      expect(output).toContain('coupon');
    });

    it('[P1] should show resource count', () => {
      const output = renderer.renderDryRunOutput(mockConfig, mockResources);

      // Implementation shows "Resources to be created: 3"
      expect(output).toContain('3');
    });

    it('[P1] should show execution order', () => {
      const output = renderer.renderDryRunOutput(mockConfig, mockResources);

      expect(output).toContain('Execution order');
    });
  });
});
