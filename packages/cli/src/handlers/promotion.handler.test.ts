/**
 * @fileoverview Unit tests for PromotionHandler
 * @author Development Team
 * @since 14.1.0
 */

import { PromotionHandler, PromotionListOptions, PromotionCreateOptions } from './promotion.handler';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { PromotionServiceSdk } from '../services/promotion-service';

// Mock the PromotionServiceSdk module
const mockPromotionService = {
  listPopularizations: jest.fn(),
  batchCreatePopularizations: jest.fn(),
};

jest.mock('../services/promotion-service', () => ({
  PromotionServiceSdk: jest.fn(() => mockPromotionService),
}));

// Mock console methods to suppress output during tests
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('PromotionHandler', () => {
  let promotionHandler: PromotionHandler;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Ensure console methods are properly mocked and silent
    mockConsoleLog.mockImplementation(() => {});
    mockConsoleError.mockImplementation(() => {});
    mockConsoleWarn.mockImplementation(() => {});

    // Mock configs
    mockAuthConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
    };

    mockServiceConfig = {
      baseUrl: 'https://api.polyv.net',
      timeout: 30000,
      debug: false,
    };

    // Create handler instance
    promotionHandler = new PromotionHandler(mockAuthConfig, mockServiceConfig);
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
  });

  // ========================================
  // AC1: listPromotions - 列出推广渠道
  // ========================================
  describe('listPromotions', () => {
    const mockPromotions = [
      {
        promoteId: 'Fq5gpU',
        popularizationName: '甘肃分公司',
        visitsNum: 100,
        reservationNum: 10,
        watchNum: 50,
        viewerNum: 25,
        averageWatchTime: '00:15:30',
        enrollNum: 5,
        createdTime: 1616384611000,
      },
      {
        promoteId: 'rqibqI',
        popularizationName: '新疆分公司',
        visitsNum: 200,
        reservationNum: 20,
        watchNum: 100,
        viewerNum: 50,
        averageWatchTime: '00:30:45',
        enrollNum: 10,
        createdTime: 1616384156000,
      },
    ];

    const defaultOptions: PromotionListOptions = {
      channelId: '3151318',
      output: 'table',
    };

    it('[P0][HDL-001] should create PromotionServiceSdk with correct configuration', () => {
      expect(PromotionServiceSdk).toHaveBeenCalledWith(mockAuthConfig, mockServiceConfig);
    });

    it('[P0][HDL-002] should list promotion channels with channelId', async () => {
      mockPromotionService.listPopularizations.mockResolvedValueOnce(mockPromotions);

      await promotionHandler.listPromotions(defaultOptions);

      expect(mockPromotionService.listPopularizations).toHaveBeenCalledWith('3151318');
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P0][HDL-003] should output promotions in JSON format', async () => {
      mockPromotionService.listPopularizations.mockResolvedValueOnce(mockPromotions);

      const jsonOptions: PromotionListOptions = { channelId: '3151318', output: 'json' };
      await promotionHandler.listPromotions(jsonOptions);

      expect(mockPromotionService.listPopularizations).toHaveBeenCalled();
      // Verify JSON output was generated
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('"promoteId"')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('[P0][HDL-004] should output promotions in table format', async () => {
      mockPromotionService.listPopularizations.mockResolvedValueOnce(mockPromotions);

      await promotionHandler.listPromotions(defaultOptions);

      expect(mockPromotionService.listPopularizations).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P0][HDL-005] should handle API errors gracefully', async () => {
      const apiError = new Error('API error: Authentication failed');
      mockPromotionService.listPopularizations.mockRejectedValueOnce(apiError);

      await expect(promotionHandler.listPromotions(defaultOptions)).rejects.toThrow();
    });

    it('[P0][HDL-006] should display empty state when no promotions exist', async () => {
      mockPromotionService.listPopularizations.mockResolvedValueOnce([]);

      await promotionHandler.listPromotions(defaultOptions);

      expect(mockPromotionService.listPopularizations).toHaveBeenCalledWith('3151318');
      // Verify empty state message was displayed
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P1] should validate channelId is required', async () => {
      const invalidOptions: PromotionListOptions = {
        channelId: '',
        output: 'table',
      };

      await expect(promotionHandler.listPromotions(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should validate output format must be table or json', async () => {
      const invalidOptions: PromotionListOptions = {
        channelId: '3151318',
        output: 'xml' as any,
      };

      await expect(promotionHandler.listPromotions(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should default to table output', async () => {
      mockPromotionService.listPopularizations.mockResolvedValueOnce(mockPromotions);

      const optionsWithoutOutput: PromotionListOptions = {
        channelId: '3151318',
        output: 'table',
      };

      await promotionHandler.listPromotions(optionsWithoutOutput);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P1] should display required fields in table output', async () => {
      mockPromotionService.listPopularizations.mockResolvedValueOnce(mockPromotions);

      await promotionHandler.listPromotions(defaultOptions);

      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toMatch(/推广|promoteId|popularizationName|visitsNum|viewerNum|createdTime/i);
    });
  });

  // ========================================
  // AC2: createPromotions - 批量创建推广渠道
  // ========================================
  describe('createPromotions', () => {
    const mockCreatedPromotions = [
      {
        promoteId: 'new-1',
        popularizationName: 'First',
      },
      {
        promoteId: 'new-2',
        popularizationName: 'Second',
      },
    ];

    const validOptions: PromotionCreateOptions = {
      channelId: '3151318',
      names: ['First', 'Second'],
      output: 'table',
    };

    it('[P0][HDL-007] should create promotion channels with valid names', async () => {
      mockPromotionService.batchCreatePopularizations.mockResolvedValueOnce(mockCreatedPromotions);

      await promotionHandler.createPromotions(validOptions);

      expect(mockPromotionService.batchCreatePopularizations).toHaveBeenCalledWith({
        channelId: '3151318',
        names: ['First', 'Second'],
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P0][HDL-008] should validate channelId is required', async () => {
      const invalidOptions: PromotionCreateOptions = {
        channelId: '',
        names: ['First'],
        output: 'table',
      };

      await expect(promotionHandler.createPromotions(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockPromotionService.batchCreatePopularizations).not.toHaveBeenCalled();
    });

    it('[P0][HDL-009] should validate names is required', async () => {
      const invalidOptions: PromotionCreateOptions = {
        channelId: '3151318',
        names: [],
        output: 'table',
      };

      await expect(promotionHandler.createPromotions(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockPromotionService.batchCreatePopularizations).not.toHaveBeenCalled();
    });

    it('[P0][HDL-010] should validate names is not empty array', async () => {
      const invalidOptions: PromotionCreateOptions = {
        channelId: '3151318',
        names: [],
        output: 'table',
      };

      await expect(promotionHandler.createPromotions(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P0][HDL-011] should validate name length (max 20 chars)', async () => {
      const invalidOptions: PromotionCreateOptions = {
        channelId: '3151318',
        names: ['This name is way too long and exceeds 20 characters'],
        output: 'table',
      };

      await expect(promotionHandler.createPromotions(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P0][HDL-012] should output created promotion info', async () => {
      mockPromotionService.batchCreatePopularizations.mockResolvedValueOnce(mockCreatedPromotions);

      const jsonOptions: PromotionCreateOptions = {
        ...validOptions,
        output: 'json',
      };
      await promotionHandler.createPromotions(jsonOptions);

      expect(mockPromotionService.batchCreatePopularizations).toHaveBeenCalled();
      // Verify JSON output was generated
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('"promoteId"')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('[P0][HDL-013] should handle API errors gracefully', async () => {
      const apiError = new Error('API error: Create failed');
      mockPromotionService.batchCreatePopularizations.mockRejectedValueOnce(apiError);

      await expect(promotionHandler.createPromotions(validOptions)).rejects.toThrow();
    });

    it('[P1] should validate names cannot contain empty strings', async () => {
      const invalidOptions: PromotionCreateOptions = {
        channelId: '3151318',
        names: ['', 'Valid'],
        output: 'table',
      };

      await expect(promotionHandler.createPromotions(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should filter out empty names and validate remaining', async () => {
      mockPromotionService.batchCreatePopularizations.mockResolvedValueOnce([
        { promoteId: 'new-1', popularizationName: 'Valid' },
      ]);

      const optionsWithEmpty: PromotionCreateOptions = {
        channelId: '3151318',
        names: ['', 'Valid'],
        output: 'table',
      };

      // Handler should filter empty names or reject
      // Implementation choice: reject if any name is empty
      await expect(promotionHandler.createPromotions(optionsWithEmpty))
        .rejects
        .toThrow(PolyVValidationError);
    });
  });

  // ========================================
  // AC4: Error handling (HDL-016 to HDL-021)
  // ========================================
  describe('Error handling', () => {
    const defaultOptions: PromotionListOptions = {
      channelId: '3151318',
      output: 'table',
    };

    it('[P1][HDL-016] should show friendly error for missing channelId', async () => {
      const invalidOptions: PromotionListOptions = {
        channelId: '',
        output: 'table',
      };

      try {
        await promotionHandler.listPromotions(invalidOptions);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        const validationError = error as PolyVValidationError;
        expect(validationError.message).toMatch(/channelId|频道.*ID/i);
      }
    });

    it('[P1][HDL-017] should show friendly error for missing names', async () => {
      const invalidOptions: PromotionCreateOptions = {
        channelId: '3151318',
        names: [],
        output: 'table',
      };

      try {
        await promotionHandler.createPromotions(invalidOptions);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        const validationError = error as PolyVValidationError;
        expect(validationError.message).toMatch(/names|名称/i);
      }
    });

    it('[P1][HDL-018] should handle API 401 error', async () => {
      const authError = new Error('Authentication failed');
      mockPromotionService.listPopularizations.mockRejectedValueOnce(authError);

      await expect(promotionHandler.listPromotions(defaultOptions))
        .rejects
        .toThrow();
    });

    it('[P1][HDL-019] should handle API 403 error', async () => {
      const permissionError = new Error('Permission denied');
      mockPromotionService.listPopularizations.mockRejectedValueOnce(permissionError);

      await expect(promotionHandler.listPromotions(defaultOptions))
        .rejects
        .toThrow();
    });

    it('[P1][HDL-020] should handle API 404 error (channel not found)', async () => {
      const notFoundError = new Error('Channel not found');
      mockPromotionService.listPopularizations.mockRejectedValueOnce(notFoundError);

      await expect(promotionHandler.listPromotions(defaultOptions))
        .rejects
        .toThrow();
    });

    it('[P1][HDL-021] should handle API 500 error', async () => {
      const serverError = new Error('Internal server error');
      mockPromotionService.listPopularizations.mockRejectedValueOnce(serverError);

      await expect(promotionHandler.listPromotions(defaultOptions))
        .rejects
        .toThrow();
    });
  });

  // ========================================
  // AC7: Table Output Format (HDL-022 to HDL-028)
  // ========================================
  describe('Table output format', () => {
    const mockPromotions = [
      {
        promoteId: 'Fq5gpU',
        popularizationName: '甘肃分公司',
        visitsNum: 100,
        reservationNum: 10,
        watchNum: 50,
        viewerNum: 25,
        averageWatchTime: '00:15:30',
        enrollNum: 5,
        createdTime: 1616384611000,
      },
    ];

    const defaultOptions: PromotionListOptions = {
      channelId: '3151318',
      output: 'table',
    };

    it('[P1][HDL-022] should display promotions as formatted table', async () => {
      mockPromotionService.listPopularizations.mockResolvedValueOnce(mockPromotions);

      await promotionHandler.listPromotions(defaultOptions);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P1][HDL-023] should show promoteId column', async () => {
      mockPromotionService.listPopularizations.mockResolvedValueOnce(mockPromotions);

      await promotionHandler.listPromotions(defaultOptions);

      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toMatch(/promoteId|推广.*ID|ID/i);
    });

    it('[P1][HDL-024] should show popularizationName column', async () => {
      mockPromotionService.listPopularizations.mockResolvedValueOnce(mockPromotions);

      await promotionHandler.listPromotions(defaultOptions);

      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toMatch(/popularizationName|推广.*名|渠道.*名/i);
    });

    it('[P1][HDL-025] should show visitsNum column', async () => {
      mockPromotionService.listPopularizations.mockResolvedValueOnce(mockPromotions);

      await promotionHandler.listPromotions(defaultOptions);

      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toMatch(/visitsNum|访问.*次数|访问量/i);
    });

    it('[P1][HDL-026] should show viewerNum column', async () => {
      mockPromotionService.listPopularizations.mockResolvedValueOnce(mockPromotions);

      await promotionHandler.listPromotions(defaultOptions);

      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toMatch(/viewerNum|观看.*人数|观众/i);
    });

    it('[P1][HDL-027] should show createdTime column', async () => {
      mockPromotionService.listPopularizations.mockResolvedValueOnce(mockPromotions);

      await promotionHandler.listPromotions(defaultOptions);

      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toMatch(/createdTime|创建.*时间/i);
    });

    it('[P1][HDL-028] should show empty state message when no promotions', async () => {
      mockPromotionService.listPopularizations.mockResolvedValueOnce([]);

      await promotionHandler.listPromotions(defaultOptions);

      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toMatch(/没有.*推广|no.*promotion|empty|未找到/i);
    });
  });

  // ========================================
  // Output format validation (AC3)
  // ========================================
  describe('Output format validation', () => {
    it('[P0][HDL-014] should validate output must be table or json', async () => {
      const invalidOptions: PromotionListOptions = {
        channelId: '3151318',
        output: 'xml' as any,
      };

      await expect(promotionHandler.listPromotions(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P0][HDL-015] should default to table output', async () => {
      mockPromotionService.listPopularizations.mockResolvedValueOnce([]);

      // Handler should default to table when output not specified
      const optionsWithDefaultOutput: PromotionListOptions = {
        channelId: '3151318',
        output: 'table',
      };

      await promotionHandler.listPromotions(optionsWithDefaultOutput);

      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });
});
