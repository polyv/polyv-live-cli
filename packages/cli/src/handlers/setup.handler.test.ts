/**
 * @fileoverview ATDD Unit tests for SetupHandler (Story 8-4)
 * TDD RED PHASE - These tests will FAIL until the feature is implemented
 */

import { SetupHandler, SetupOptions, SetupListOptions } from './setup.handler';
import { SceneConfigLoader } from '../setup/scene-config-loader';
import { SceneExecutor } from '../setup/scene-executor';
import { OutputRenderer } from '../setup/output-renderer';
import { AuthConfig } from '../types/auth';
import { PolyVClient } from 'polyv-live-api-sdk';

// Mock dependencies
jest.mock('../setup/scene-config-loader');
jest.mock('../setup/scene-executor');
jest.mock('../setup/output-renderer');
jest.mock('polyv-live-api-sdk');

// Mock console
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('SetupHandler', () => {
  let handler: SetupHandler;
  let mockAuthConfig: AuthConfig;
  let mockLoader: jest.Mocked<SceneConfigLoader>;
  let mockExecutor: jest.Mocked<SceneExecutor>;
  let mockRenderer: jest.Mocked<OutputRenderer>;
  let mockClient: jest.Mocked<PolyVClient>;

  const mockSceneConfig = {
    name: 'e-commerce',
    version: '1.0',
    description: '电商直播场景',
    metadata: { icon: '🛒', category: 'business' },
    resources: [
      { id: 'channel', type: 'channel', params: {}, output: { channelId: 'channelId' } },
      { id: 'product', type: 'product', dependsOn: 'channel', params: {}, output: { productId: 'productId' } },
      { id: 'coupon', type: 'coupon', params: {}, output: { couponId: 'couponId' } }
    ],
    outputTemplate: '# 配置完成',
    nextSteps: []
  };

  const mockExecutionResult = {
    success: true,
    resources: [
      { id: 'channel', type: 'channel', output: { channelId: 'ch_123' }, status: 'created' },
      { id: 'product', type: 'product', output: { productId: 'prod_456' }, status: 'created' },
      { id: 'coupon', type: 'coupon', output: { couponId: 'cpn_789' }, status: 'created' }
    ],
    duration: 1234
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id'
    };

    mockLoader = {
      loadBuiltinScene: jest.fn(),
      loadUserScene: jest.fn(),
      loadScene: jest.fn(),
      listAllScenes: jest.fn(),
      getSceneInfo: jest.fn()
    } as any;

    mockExecutor = {
      execute: jest.fn(),
      getExecutionOrder: jest.fn(),
      setProgressCallback: jest.fn()
    } as any;

    mockRenderer = {
      renderSummary: jest.fn(),
      renderNextSteps: jest.fn(),
      renderProgress: jest.fn(),
      renderDryRunOutput: jest.fn().mockReturnValue('Dry Run Output')
    } as any;

    mockClient = {} as any;

    (SceneConfigLoader as jest.Mock).mockImplementation(() => mockLoader);
    (SceneExecutor as jest.Mock).mockImplementation(() => mockExecutor);
    (OutputRenderer as jest.Mock).mockImplementation(() => mockRenderer);

    handler = new SetupHandler(mockAuthConfig, { baseUrl: 'https://api.polyv.net' });
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  // ========================================
  // AC1: polyv-live-cli setup <scene> 命令
  // ========================================
  describe('setup', () => {
    it('[P0] should setup e-commerce scene successfully', async () => {
      mockLoader.loadScene.mockResolvedValue(mockSceneConfig);
      mockExecutor.execute.mockResolvedValue(mockExecutionResult);
      mockRenderer.renderSummary.mockReturnValue('Summary output');
      mockRenderer.renderNextSteps.mockReturnValue('Next steps');

      const options: SetupOptions = {
        scene: 'e-commerce',
        output: 'table'
      };

      await handler.setup(options);

      expect(mockLoader.loadScene).toHaveBeenCalledWith('e-commerce');
      // Execute is called with config and options object
      expect(mockExecutor.execute).toHaveBeenCalledWith(
        mockSceneConfig,
        expect.objectContaining({ dryRun: false })
      );
      expect(mockRenderer.renderSummary).toHaveBeenCalled();
    });

    it('[P0] should throw error for nonexistent scene', async () => {
      mockLoader.loadScene.mockRejectedValue(new Error('Scene "nonexistent" not found'));

      const options: SetupOptions = {
        scene: 'nonexistent',
        output: 'table'
      };

      await expect(handler.setup(options))
        .rejects
        .toThrow('Scene "nonexistent" not found');
    });

    it('[P0] should output in JSON format when specified', async () => {
      mockLoader.loadScene.mockResolvedValue(mockSceneConfig);
      mockExecutor.execute.mockResolvedValue(mockExecutionResult);

      const options: SetupOptions = {
        scene: 'e-commerce',
        output: 'json'
      };

      await handler.setup(options);

      // Should log JSON output
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"success": true')
      );
    });

    it('[P1] should show progress during setup', async () => {
      mockLoader.loadScene.mockResolvedValue(mockSceneConfig);
      mockExecutor.execute.mockImplementation(async (config, options) => {
        // Simulate progress callbacks
        if (options?.onProgress) {
          options.onProgress({ phase: 'creating', resourceId: 'channel' });
          options.onProgress({ phase: 'created', resourceId: 'channel' });
        }
        return mockExecutionResult;
      });

      const progressCallback = jest.fn();
      const options: SetupOptions = {
        scene: 'e-commerce',
        output: 'table',
        onProgress: progressCallback
      };

      await handler.setup(options);

      expect(progressCallback).toHaveBeenCalled();
    });

    it('[P1] should handle execution failure with rollback info', async () => {
      mockLoader.loadScene.mockResolvedValue(mockSceneConfig);
      mockExecutor.execute.mockRejectedValue(
        new Error('Failed to create resource "product": API Error')
      );

      const options: SetupOptions = {
        scene: 'e-commerce',
        output: 'table'
      };

      await expect(handler.setup(options))
        .rejects
        .toThrow('Failed to create resource "product"');
      // Error is thrown - rollback happens internally in executor
    });
  });

  // ========================================
  // AC7: --list 选项
  // ========================================
  describe('listScenes', () => {
    it('[P0] should list all available scenes', async () => {
      mockLoader.listAllScenes.mockReturnValue({
        builtin: ['e-commerce', 'education'],
        user: ['my-custom-scene']
      });

      mockLoader.getSceneInfo.mockImplementation((name: string) => ({
        name,
        description: `${name} description`,
        icon: '📦'
      }));

      const options: SetupListOptions = {
        output: 'table'
      };

      await handler.listScenes(options);

      expect(mockLoader.listAllScenes).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('e-commerce')
      );
    });

    it('[P0] should output list in JSON format', async () => {
      mockLoader.listAllScenes.mockReturnValue({
        builtin: ['e-commerce'],
        user: []
      });

      mockLoader.getSceneInfo.mockReturnValue({
        name: 'e-commerce',
        description: '电商场景',
        icon: '🛒'
      });

      const options: SetupListOptions = {
        output: 'json'
      };

      await handler.listScenes(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"e-commerce"')
      );
    });

    it('[P1] should show scene details', async () => {
      mockLoader.listAllScenes.mockReturnValue({
        builtin: ['e-commerce'],
        user: []
      });

      mockLoader.getSceneInfo.mockReturnValue({
        name: 'e-commerce',
        description: '电商直播场景 - 包含频道、商品、优惠券',
        icon: '🛒',
        category: 'business',
        resources: 3
      });

      const options: SetupListOptions = {
        output: 'table',
        detailed: true
      };

      await handler.listScenes(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('电商直播场景')
      );
    });

    it('[P1] should handle empty scene list', async () => {
      mockLoader.listAllScenes.mockReturnValue({
        builtin: [],
        user: []
      });

      const options: SetupListOptions = {
        output: 'table'
      };

      await handler.listScenes(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No scenes available')
      );
    });
  });

  // ========================================
  // AC6: 输出配置摘要和下一步操作指引
  // ========================================
  describe('output', () => {
    it('[P0] should display configuration summary after setup', async () => {
      mockLoader.loadScene.mockResolvedValue(mockSceneConfig);
      mockExecutor.execute.mockResolvedValue(mockExecutionResult);
      mockRenderer.renderSummary.mockReturnValue('# 配置完成\n\n频道: ch_123\n商品: prod_456');

      const options: SetupOptions = {
        scene: 'e-commerce',
        output: 'table'
      };

      await handler.setup(options);

      // renderSummary is called with config, resources, and options
      expect(mockRenderer.renderSummary).toHaveBeenCalledWith(
        mockSceneConfig,
        mockExecutionResult.resources,
        expect.objectContaining({ format: 'table' })
      );
    });

    it('[P0] should display next steps guidance', async () => {
      const configWithNextSteps = {
        ...mockSceneConfig,
        nextSteps: [
          { command: 'polyv-live-cli stream start --channelId {channel.channelId}', description: '开始直播' }
        ]
      };

      mockLoader.loadScene.mockResolvedValue(configWithNextSteps);
      mockExecutor.execute.mockResolvedValue(mockExecutionResult);
      mockRenderer.renderNextSteps.mockReturnValue('Next: polyv-live-cli stream start --channelId ch_123');

      const options: SetupOptions = {
        scene: 'e-commerce',
        output: 'table'
      };

      await handler.setup(options);

      expect(mockRenderer.renderNextSteps).toHaveBeenCalledWith(
        configWithNextSteps.nextSteps,
        expect.objectContaining({ channel: { channelId: 'ch_123' } })
      );
    });
  });

  // ========================================
  // Dry Run Mode
  // ========================================
  describe('dry run', () => {
    it('[P1] should support dry run mode', async () => {
      mockLoader.loadScene.mockResolvedValue(mockSceneConfig);
      mockExecutor.execute.mockResolvedValue({
        ...mockExecutionResult,
        dryRun: true
      });

      const options: SetupOptions = {
        scene: 'e-commerce',
        output: 'table',
        dryRun: true
      };

      await handler.setup(options);

      expect(mockExecutor.execute).toHaveBeenCalledWith(
        mockSceneConfig,
        expect.objectContaining({ dryRun: true })
      );
    });

    it('[P1] should show what would be created in dry run', async () => {
      mockLoader.loadScene.mockResolvedValue(mockSceneConfig);
      mockExecutor.execute.mockResolvedValue({
        success: true,
        dryRun: true,
        resources: [
          { id: 'channel', type: 'channel', output: {}, status: 'would_create' },
          { id: 'product', type: 'product', output: {}, status: 'would_create' },
          { id: 'coupon', type: 'coupon', output: {}, status: 'would_create' }
        ]
      });

      const options: SetupOptions = {
        scene: 'e-commerce',
        output: 'table',
        dryRun: true
      };

      await handler.setup(options);

      // Dry run output shows "Dry Run" indicator
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Dry Run')
      );
    });
  });

  // ========================================
  // Error Handling
  // ========================================
  describe('error handling', () => {
    it('[P0] should provide user-friendly error messages', async () => {
      mockLoader.loadScene.mockRejectedValue(
        new Error('Scene config validation failed: missing required field "name"')
      );

      const options: SetupOptions = {
        scene: 'invalid-scene',
        output: 'table'
      };

      await expect(handler.setup(options))
        .rejects
        .toThrow('Scene config validation failed');
    });

    it('[P1] should handle authentication errors', async () => {
      mockLoader.loadScene.mockResolvedValue(mockSceneConfig);
      mockExecutor.execute.mockRejectedValue(
        new Error('Authentication failed: Invalid appId or appSecret')
      );

      const options: SetupOptions = {
        scene: 'e-commerce',
        output: 'table'
      };

      await expect(handler.setup(options))
        .rejects
        .toThrow('Authentication failed');
    });

    it('[P1] should handle network errors gracefully', async () => {
      mockLoader.loadScene.mockResolvedValue(mockSceneConfig);
      mockExecutor.execute.mockRejectedValue(
        new Error('Network error: Connection refused')
      );

      const options: SetupOptions = {
        scene: 'e-commerce',
        output: 'table'
      };

      await expect(handler.setup(options))
        .rejects
        .toThrow('Network error');
    });
  });

  // ========================================
  // Validation
  // ========================================
  describe('validation', () => {
    it('[P1] should validate scene name', async () => {
      const options: SetupOptions = {
        scene: '', // Empty scene name
        output: 'table'
      };

      await expect(handler.setup(options))
        .rejects
        .toThrow('Scene name is required');
    });

    it('[P1] should validate output format', async () => {
      const options: SetupOptions = {
        scene: 'e-commerce',
        output: 'invalid' as any
      };

      await expect(handler.setup(options))
        .rejects
        .toThrow('Output format must be "table" or "json"');
    });
  });

  describe('listScenesDetailed', () => {
    it('should list scenes in JSON format', async () => {
      mockLoader.listAllScenes.mockReturnValue({
        builtin: ['e-commerce'],
        user: [],
      } as any);
      mockLoader.getSceneInfo.mockReturnValue({
        name: 'e-commerce', icon: '📦', description: 'E-commerce scene', category: 'business', tags: ['shop'],
      } as any);
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      await handler.listScenesDetailed({ output: 'json' });
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"builtin"'));
      logSpy.mockRestore();
    });

    it('should list scenes in table format', async () => {
      mockLoader.listAllScenes.mockReturnValue({
        builtin: ['e-commerce'],
        user: ['custom-scene'],
      } as any);
      mockLoader.getSceneInfo.mockReturnValue({
        name: 'e-commerce', icon: '📦', description: 'E-commerce scene', category: 'business', tags: ['shop'],
      } as any);
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      await handler.listScenesDetailed({ output: 'table' });
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Available Scenes'));
      logSpy.mockRestore();
    });
  });
});
