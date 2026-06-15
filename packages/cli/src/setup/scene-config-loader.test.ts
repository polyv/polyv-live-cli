/**
 * @fileoverview ATDD Unit tests for SceneConfigLoader (Story 8-4)
 * TDD RED PHASE - These tests will FAIL until the feature is implemented
 */

import { SceneConfigLoader, SceneConfig, SceneResource } from './scene-config-loader';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock path module
jest.mock('path');
const mockPath = path as jest.Mocked<typeof path>;

describe('SceneConfigLoader', () => {
  let loader: SceneConfigLoader;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock path.join to return predictable paths
    mockPath.join.mockImplementation((...args: string[]) => {
      return args.join('/');
    });

    // Mock path.extname to return extension
    mockPath.extname.mockImplementation((file: string) => {
      const match = file.match(/\.[^.]+$/);
      return match ? match[0] : '';
    });

    // Mock path.basename to return filename without extension
    mockPath.basename.mockImplementation((file: string, ext?: string) => {
      let name = file.split('/').pop() || file;
      if (ext && name.endsWith(ext)) {
        name = name.slice(0, -ext.length);
      }
      return name;
    });

    loader = new SceneConfigLoader();
  });

  // ========================================
  // AC3: 配置文件驱动
  // ========================================
  describe('loadBuiltinScene', () => {
    const validECommerceConfig: SceneConfig = {
      name: 'e-commerce',
      version: '1.0',
      description: '电商直播场景 - 包含频道、商品、优惠券',
      metadata: {
        icon: '🛒',
        category: 'business',
        tags: ['电商', '直播带货']
      },
      resources: [
        {
          id: 'channel',
          type: 'channel',
          description: '电商直播频道',
          params: {
            name: '电商示例频道-{timestamp}',
            scene: 'topclass',
            channelPasswd: '{random:6-16}'
          },
          output: {
            channelId: 'channelId',
            channelName: 'name'
          }
        },
        {
          id: 'product',
          type: 'product',
          description: '示例商品',
          dependsOn: 'channel',
          params: {
            channelId: '{channel.channelId}',
            name: '示例商品',
            price: 99.9
          },
          output: {
            productId: 'productId'
          }
        },
        {
          id: 'coupon',
          type: 'coupon',
          description: '新人优惠券',
          params: {
            name: '新人专享券',
            type: 'MAX_OUT'
          },
          output: {
            couponId: 'couponId'
          }
        }
      ],
      outputTemplate: '# 🎉 配置完成！',
      nextSteps: [
        {
          command: 'polyv-live-cli stream start --channelId {channel.channelId}',
          description: '开始直播'
        }
      ]
    };

    it('[P0] should load e-commerce builtin scene successfully', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(validECommerceConfig));

      const config = await loader.loadBuiltinScene('e-commerce');

      expect(config).toBeDefined();
      expect(config.name).toBe('e-commerce');
      expect(config.version).toBe('1.0');
      expect(config.resources).toHaveLength(3);
    });

    it('[P0] should throw error when builtin scene not found', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await expect(loader.loadBuiltinScene('nonexistent'))
        .rejects
        .toThrow('Builtin scene "nonexistent" not found');
    });

    it('[P1] should list all available builtin scenes', async () => {
      mockFs.existsSync.mockReturnValue(true); // Directory exists
      mockFs.readdirSync.mockReturnValue(['e-commerce.yaml', 'education.yaml'] as any);

      const scenes = loader.listBuiltinScenes();

      expect(scenes).toContain('e-commerce');
      expect(scenes).toContain('education');
    });

    it('[P1] should validate scene config structure', async () => {
      const invalidConfig = {
        name: 'invalid',
        // Missing required fields
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(invalidConfig));

      await expect(loader.loadBuiltinScene('invalid'))
        .rejects
        .toThrow('Invalid scene config');
    });

    it('[P1] should validate resource dependsOn references', async () => {
      const configWithInvalidDependency = {
        ...validECommerceConfig,
        resources: [
          {
            id: 'product',
            type: 'product',
            dependsOn: 'nonexistent', // Invalid reference
            params: {},
            output: {}
          }
        ]
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(configWithInvalidDependency));

      await expect(loader.loadBuiltinScene('test'))
        .rejects
        .toThrow('dependsOn references nonexistent resource');
    });
  });

  // ========================================
  // AC3: 支持用户自定义场景
  // ========================================
  describe('loadUserScene', () => {
    const userSceneConfig: SceneConfig = {
      name: 'my-custom-scene',
      version: '1.0',
      description: 'Custom scene',
      resources: [
        {
          id: 'channel',
          type: 'channel',
          params: { name: 'My Channel' },
          output: { channelId: 'channelId' }
        }
      ]
    };

    it('[P0] should load user scene from ~/.polyv/scenes/', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(userSceneConfig));

      const config = await loader.loadUserScene('my-custom-scene');

      expect(config).toBeDefined();
      expect(config.name).toBe('my-custom-scene');
    });

    it('[P0] should throw error when user scene not found', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await expect(loader.loadUserScene('nonexistent'))
        .rejects
        .toThrow('User scene "nonexistent" not found');
    });

    it('[P1] should prefer builtin scene over user scene with same name', async () => {
      // Builtin scene should take precedence
      mockFs.existsSync.mockImplementation((path: any) => {
        // Builtin scenes are in setup-scenes directory
        return String(path).includes('setup-scenes');
      });
      const builtinConfig: SceneConfig = {
        name: 'e-commerce',
        version: '1.0',
        description: '电商直播场景',
        resources: [
          { id: 'channel', type: 'channel', params: {}, output: {} }
        ]
      };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(builtinConfig));

      const result = await loader.loadScene('e-commerce');

      // Should load builtin, not user scene
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('setup-scenes'),
        'utf-8'
      );
    });
  });

  // ========================================
  // AC7: --list 选项
  // ========================================
  describe('listAllScenes', () => {
    it('[P0] should list all available scenes (builtin + user)', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync
        .mockReturnValueOnce(['e-commerce.yaml', 'education.yaml'] as any) // builtin
        .mockReturnValueOnce(['my-scene.yaml'] as any); // user

      const scenes = loader.listAllScenes();

      expect(scenes.builtin).toContain('e-commerce');
      expect(scenes.builtin).toContain('education');
      expect(scenes.user).toContain('my-scene');
    });

    it('[P1] should handle missing user scenes directory', async () => {
      mockFs.existsSync.mockImplementation((path: any) => {
        return path.includes('setup-scenes'); // Only builtin exists
      });
      mockFs.readdirSync.mockReturnValue(['e-commerce.yaml'] as any);

      const scenes = loader.listAllScenes();

      expect(scenes.builtin).toContain('e-commerce');
      expect(scenes.user).toEqual([]);
    });

    it('[P1] should return scene metadata for display', async () => {
      mockFs.readdirSync.mockReturnValue(['e-commerce.yaml'] as any);
      mockFs.readFileSync.mockReturnValue(`
name: e-commerce
version: "1.0"
description: 电商直播场景
metadata:
  icon: 🛒
  category: business
resources: []
`);

      const sceneInfo = loader.getSceneInfo('e-commerce');

      expect(sceneInfo.name).toBe('e-commerce');
      expect(sceneInfo.description).toBe('电商直播场景');
      expect(sceneInfo.icon).toBe('🛒');
    });
  });

  // ========================================
  // Configuration Validation
  // ========================================
  describe('validateConfig', () => {
    it('[P1] should validate required config fields', () => {
      const invalidConfig = {
        name: '',
        version: '',
        resources: []
      };

      const errors = loader.validateConfig(invalidConfig as any);

      expect(errors).toContain('name is required');
      expect(errors).toContain('version is required');
      expect(errors).toContain('resources must not be empty');
    });

    it('[P1] should validate resource structure', () => {
      const configWithInvalidResource = {
        name: 'test',
        version: '1.0',
        resources: [
          {
            id: '',
            type: 'invalid-type',
            params: null
          }
        ]
      };

      const errors = loader.validateConfig(configWithInvalidResource as any);

      expect(errors).toContain('resource id is required');
      expect(errors).toContain('invalid resource type: invalid-type');
    });

    it('[P2] should detect circular dependencies', () => {
      const configWithCircularDep = {
        name: 'test',
        version: '1.0',
        resources: [
          { id: 'a', type: 'channel', dependsOn: 'b', params: {}, output: {} },
          { id: 'b', type: 'product', dependsOn: 'a', params: {}, output: {} }
        ]
      };

      const errors = loader.validateConfig(configWithCircularDep as any);

      expect(errors).toContain('circular dependency detected');
    });

    it.skip('[P2] should validate output field references', () => {
      const config = {
        name: 'test',
        version: '1.0',
        resources: [
          { id: 'a', type: 'channel', params: {}, output: { channelId: 'channelId' } },
          { id: 'b', type: 'product', params: { channelId: '{a.nonexistentField}' }, output: {} }
        ]
      };

      const errors = loader.validateConfig(config as any);

      expect(errors).toContain('output field "nonexistentField" not defined in resource "a"');
    });
  });

  // ========================================
  // AC2: 内置电商场景配置
  // ========================================
  describe('e-commerce builtin scene', () => {
    it('[P0] should have valid e-commerce scene configuration', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(`
name: e-commerce
version: "1.0"
description: 电商直播场景 - 包含频道、商品、优惠券
metadata:
  icon: 🛒
  category: business
  tags:
    - 电商
    - 直播带货
resources:
  - id: channel
    type: channel
    description: 电商直播频道
    params:
      name: "电商示例频道-{timestamp}"
      newScene: alone
      template: portrait_alone
      streamType: client
      linkMicLimit: 0
      pureRtcEnabled: "N"
    output:
      channelId: channelId
      channelName: name
  - id: product
    type: product
    description: 示例商品
    dependsOn: channel
    params:
      channelId: "{channel.channelId}"
      cover: "//liveimages.videocc.net/uploaded/images/2026/03/hguwyf1zxx.png"
      name: "Allowish英国进口香氛沐浴露"
      productDesc: "Allowish英国进口香氛沐浴露"
      productDetail: "<p>test</p>"
      status: 1
      btnShow: "去购买"
      linkType: 11
      link: "https://npcitem.jd.hk/10128409499312.html"
      mobileLink: "https://npcitem.jd.hk/10128409499312.html"
      productType: normal
      priceType: AMOUNT
      buyType: link
      realPrice: 179
      price: 399
      originalPriceType: AMOUNT
    output:
      productId: productId
  - id: coupon
    type: coupon
    description: 新人优惠券
    params:
      availableAmount: 1000
      dayOfUse: 1
      name: "满150减50"
      rule:
        condition: FULL_REDUCE
        unconditional:
          enable: false
          value: ""
          unit: MONEY
        fullReduce:
          enable: true
          full: 150
          reduce: 50
          unit: MONEY
        limitPerPerson: 1
      useTimeType: DAY
      type: MAX_OUT
      receiveStartTime: "{now}"
      receiveEndTime: "{now+30d}"
    output:
      couponId: couponId
outputTemplate: |
  # 配置完成
nextSteps:
  - command: "polyv-live-cli stream start --channelId {channel.channelId}"
    description: "开始直播"
`);

      const config = await loader.loadBuiltinScene('e-commerce');

      expect(config.name).toBe('e-commerce');
      expect(config.resources).toHaveLength(3);
      expect(config.resources[0].type).toBe('channel');
      expect(config.resources[1].type).toBe('product');
      expect(config.resources[2].type).toBe('coupon');
      expect(config.resources[1].dependsOn).toBe('channel');
      // Verify product has required fields
      expect(config.resources[1].params.status).toBe(1);
      expect(config.resources[1].params.linkType).toBe(11);
      expect(config.resources[1].params.realPrice).toBe(179);
      // Verify coupon has required fields
      expect(config.resources[2].params.useTimeType).toBe('DAY');
      expect(config.resources[2].params.dayOfUse).toBe(1);
      expect(config.resources[2].params.availableAmount).toBe(1000);
      expect(config.resources[2].params.rule.condition).toBe('FULL_REDUCE');
      expect(config.resources[2].params.rule.fullReduce.full).toBe(150);
      expect(config.resources[2].params.rule.fullReduce.reduce).toBe(50);
    });

    it('[P1] should have correct resource dependency order', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(`
name: e-commerce
version: "1.0"
resources:
  - id: channel
    type: channel
    params: {}
    output: { channelId: channelId }
  - id: product
    type: product
    dependsOn: channel
    params: { channelId: "{channel.channelId}" }
    output: { productId: productId }
  - id: coupon
    type: coupon
    params: {}
    output: { couponId: couponId }
`);

      const config = await loader.loadBuiltinScene('e-commerce');
      const executionOrder = loader.getExecutionOrder(config);

      // channel should come before product
      const channelIndex = executionOrder.indexOf('channel');
      const productIndex = executionOrder.indexOf('product');
      expect(channelIndex).toBeLessThan(productIndex);
    });
  });
});
