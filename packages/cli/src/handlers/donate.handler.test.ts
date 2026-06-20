/**
 * @fileoverview Unit tests for DonateHandler
 * @author Development Team
 * @since 11.6.0
 *
 * ATDD RED PHASE - These tests will fail until donate.handler.ts is implemented
 */

// @ts-expect-error - Module not implemented yet
import { DonateHandler } from './donate.handler';
// @ts-expect-error - Module not implemented yet
import { DonateServiceSdk } from '../services/donate-service';
// @ts-expect-error - Module not implemented yet
import {
  DonateServiceConfig,
  DonateConfigGetOptions,
  DonateConfigUpdateOptions,
  DonateListOptions,
} from '../types/donate';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError, PolyVError } from '../utils/errors';

// Mock DonateServiceSdk
jest.mock('../services/donate-service');
const MockedDonateService = DonateServiceSdk as jest.MockedClass<typeof DonateServiceSdk>;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('DonateHandler (ATDD RED PHASE)', () => {
  let donateHandler: DonateHandler;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: DonateServiceConfig;
  let mockDonateService: jest.Mocked<DonateServiceSdk>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id',
    };

    mockServiceConfig = {
      baseUrl: 'https://api.polyv.net',
      timeout: 30000,
      debug: false,
    };

    mockDonateService = {
      getDonateConfig: jest.fn(),
      updateDonateConfig: jest.fn(),
      listRewardGift: jest.fn(),
    } as any;

    try {
      MockedDonateService.mockImplementation(() => mockDonateService);
      donateHandler = new DonateHandler(mockAuthConfig, mockServiceConfig);
    } catch {
      // Expected to fail in RED phase
    }
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('constructor', () => {
    it('11.6-UNIT-001: should create DonateServiceSdk with correct configuration', () => {
      expect(MockedDonateService).toHaveBeenCalledWith(mockAuthConfig, mockServiceConfig);
    });
  });

  // ============================================================
  // AC #1: donate config get command
  // ============================================================
  describe('getConfig (AC #1)', () => {
    it('11.6-UNIT-002: should get donate config with minimal parameters', async () => {
      const options: DonateConfigGetOptions = {
        channelId: '3151318',
        output: 'table',
      };

      mockDonateService.getDonateConfig.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          globalSettingEnabled: 'Y',
          donateCashEnabled: 'Y',
          donateGoodEnabled: 'Y',
          donateTips: 'Thanks for donating',
          cashMin: 0.01,
          cashes: [0.88, 6.66, 8.88, 18.88, 66.6, 88.8],
          donatePointEnabled: 'N',
          pointUnit: null,
          goods: [],
        },
      });

      await donateHandler.getConfig(options);

      expect(mockDonateService.getDonateConfig).toHaveBeenCalledWith({
        channelId: '3151318',
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('11.6-UNIT-003: should validate channelId is required', async () => {
      const options = {
        channelId: '',
        output: 'table' as const,
      };

      await expect(donateHandler.getConfig(options)).rejects.toThrow(PolyVValidationError);
      await expect(donateHandler.getConfig(options)).rejects.toThrow('channelId is required');
    });

    it('11.6-UNIT-004: should output in JSON format when specified', async () => {
      const options: DonateConfigGetOptions = {
        channelId: '3151318',
        output: 'json',
      };

      mockDonateService.getDonateConfig.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          globalSettingEnabled: 'Y',
          donateCashEnabled: 'Y',
          donateGoodEnabled: 'Y',
          donateTips: 'Thanks',
          cashMin: 0.01,
          cashes: [0.88],
          donatePointEnabled: 'N',
          pointUnit: null,
          goods: [],
        },
      });

      await donateHandler.getConfig(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('donateCashEnabled')
      );
    });

    it('11.6-UNIT-005: should output in table format by default', async () => {
      const options: DonateConfigGetOptions = {
        channelId: '3151318',
        output: 'table',
      };

      mockDonateService.getDonateConfig.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          globalSettingEnabled: 'Y',
          donateCashEnabled: 'Y',
          donateGoodEnabled: 'Y',
          donateTips: 'Thanks',
          cashMin: 0.01,
          cashes: [0.88],
          donatePointEnabled: 'N',
          pointUnit: null,
          goods: [],
        },
      });

      await donateHandler.getConfig(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('11.6-UNIT-006: should handle API errors gracefully', async () => {
      const options: DonateConfigGetOptions = {
        channelId: '3151318',
        output: 'table',
      };

      const apiError = new PolyVError('API Error: Authentication failed', 'AUTH_ERROR', 401);
      mockDonateService.getDonateConfig.mockRejectedValue(apiError);

      await expect(donateHandler.getConfig(options)).rejects.toThrow(PolyVError);
    });
  });

  // ============================================================
  // AC #2: donate config update command
  // ============================================================
  describe('updateConfig (AC #2)', () => {
    it('11.6-UNIT-007: should update donate config with cash settings', async () => {
      const options: DonateConfigUpdateOptions = {
        channelId: '3151318',
        cashEnabled: 'Y',
        force: true,
        output: 'table',
      };

      mockDonateService.updateDonateConfig.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {},
      });

      await donateHandler.updateConfig(options);

      expect(mockDonateService.updateDonateConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          donateEnabled: 'Y',
        })
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Donate config updated successfully')
      );
    });

    it('11.6-UNIT-008: should update donate config with gift settings', async () => {
      const options: DonateConfigUpdateOptions = {
        channelId: '3151318',
        giftEnabled: 'Y',
        force: true,
        output: 'table',
      };

      mockDonateService.updateDonateConfig.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {},
      });

      await donateHandler.updateConfig(options);

      expect(mockDonateService.updateDonateConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
        })
      );
    });

    it('11.6-UNIT-009: should update donate config with tips and amounts', async () => {
      const options: DonateConfigUpdateOptions = {
        channelId: '3151318',
        tips: 'Thank you for your support!',
        amounts: [0.88, 6.66, 8.88, 18.88],
        force: true,
        output: 'table',
      };

      mockDonateService.updateDonateConfig.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {},
      });

      await donateHandler.updateConfig(options);

      expect(mockDonateService.updateDonateConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          donateTips: 'Thank you for your support!',
          donateAmounts: [0.88, 6.66, 8.88, 18.88],
        })
      );
    });

    it('11.6-UNIT-010: should update all settings at once', async () => {
      const options: DonateConfigUpdateOptions = {
        channelId: '3151318',
        cashEnabled: 'Y',
        giftEnabled: 'Y',
        tips: 'Thanks!',
        amounts: [1, 5, 10],
        force: true,
        output: 'json',
      };

      mockDonateService.updateDonateConfig.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {},
      });

      await donateHandler.updateConfig(options);

      expect(mockDonateService.updateDonateConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          donateEnabled: 'Y',
          donateTips: 'Thanks!',
          donateAmounts: [1, 5, 10],
        })
      );
    });

    it('11.6-UNIT-011: should validate channelId is required', async () => {
      const options = {
        channelId: '',
        output: 'table' as const,
      };

      await expect(donateHandler.updateConfig(options)).rejects.toThrow(PolyVValidationError);
      await expect(donateHandler.updateConfig(options)).rejects.toThrow('channelId is required');
    });

    it('11.6-UNIT-012: should validate cashEnabled must be Y or N', async () => {
      const options = {
        channelId: '3151318',
        cashEnabled: 'invalid' as any,
        output: 'table' as const,
      };

      await expect(donateHandler.updateConfig(options)).rejects.toThrow(PolyVValidationError);
      await expect(donateHandler.updateConfig(options)).rejects.toThrow(
        'cashEnabled must be either "Y" or "N"'
      );
    });

    it('11.6-UNIT-013: should validate giftEnabled must be Y or N', async () => {
      const options = {
        channelId: '3151318',
        giftEnabled: 'yes' as any,
        output: 'table' as const,
      };

      await expect(donateHandler.updateConfig(options)).rejects.toThrow(PolyVValidationError);
      await expect(donateHandler.updateConfig(options)).rejects.toThrow(
        'giftEnabled must be either "Y" or "N"'
      );
    });

    it('11.6-UNIT-014: should parse amounts from comma-separated string', async () => {
      const options: DonateConfigUpdateOptions = {
        channelId: '3151318',
        amounts: '0.88,6.66,8.88,18.88,66.6,88.8',
        force: true,
        output: 'table',
      };

      mockDonateService.updateDonateConfig.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {},
      });

      await donateHandler.updateConfig(options);

      expect(mockDonateService.updateDonateConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          donateAmounts: [0.88, 6.66, 8.88, 18.88, 66.6, 88.8],
        })
      );
    });

    it('11.6-UNIT-015: should handle API errors gracefully', async () => {
      const options: DonateConfigUpdateOptions = {
        channelId: '3151318',
        cashEnabled: 'Y',
        force: true,
        output: 'table',
      };

      const apiError = new PolyVError('API Error: Permission denied', 'FORBIDDEN', 403);
      mockDonateService.updateDonateConfig.mockRejectedValue(apiError);

      await expect(donateHandler.updateConfig(options)).rejects.toThrow(PolyVError);
    });
  });

  // ============================================================
  // AC #3: donate list command
  // ============================================================
  describe('listRecords (AC #3)', () => {
    it('11.6-UNIT-016: should list donate records with required parameters', async () => {
      const options: DonateListOptions = {
        channelId: '3151318',
        start: 1615772426000,
        end: 1615858826000,
        output: 'table',
      };

      mockDonateService.listRewardGift.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
          totalItems: 2,
          contents: [
            {
              userId: 'user123',
              nickName: 'Test User',
              timestamp: 1615772426000,
              name: 'Flower',
              type: '1',
              amount: 6.66,
              sessionId: 'session001',
            },
            {
              userId: 'user456',
              nickName: 'Another User',
              timestamp: 1615772526000,
              name: 'Cash',
              type: '2',
              amount: 8.88,
              sessionId: 'session001',
            },
          ],
        },
      });

      await donateHandler.listRecords(options);

      expect(mockDonateService.listRewardGift).toHaveBeenCalledWith({
        channelId: '3151318',
        start: 1615772426000,
        end: 1615858826000,
        pageNumber: 1,
        pageSize: 10,
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('11.6-UNIT-017: should list donate records with pagination', async () => {
      const options: DonateListOptions = {
        channelId: '3151318',
        start: 1615772426000,
        end: 1615858826000,
        page: 2,
        size: 20,
        output: 'table',
      };

      mockDonateService.listRewardGift.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          pageNumber: 2,
          pageSize: 20,
          totalPages: 5,
          totalItems: 100,
          contents: [],
        },
      });

      await donateHandler.listRecords(options);

      expect(mockDonateService.listRewardGift).toHaveBeenCalledWith(
        expect.objectContaining({
          pageNumber: 2,
          pageSize: 20,
        })
      );
    });

    it('11.6-UNIT-018: should validate channelId is required', async () => {
      const options = {
        channelId: '',
        start: 1615772426000,
        end: 1615858826000,
        output: 'table' as const,
      };

      await expect(donateHandler.listRecords(options)).rejects.toThrow(PolyVValidationError);
      await expect(donateHandler.listRecords(options)).rejects.toThrow('channelId is required');
    });

    it('11.6-UNIT-019: should validate start is required', async () => {
      const options = {
        channelId: '3151318',
        start: undefined as any,
        end: 1615858826000,
        output: 'table' as const,
      };

      await expect(donateHandler.listRecords(options)).rejects.toThrow(PolyVValidationError);
      await expect(donateHandler.listRecords(options)).rejects.toThrow('start is required');
    });

    it('11.6-UNIT-020: should validate end is required', async () => {
      const options = {
        channelId: '3151318',
        start: 1615772426000,
        end: undefined as any,
        output: 'table' as const,
      };

      await expect(donateHandler.listRecords(options)).rejects.toThrow(PolyVValidationError);
      await expect(donateHandler.listRecords(options)).rejects.toThrow('end is required');
    });

    it('11.6-UNIT-021: should validate start must be before end', async () => {
      const options = {
        channelId: '3151318',
        start: 1615858826000,
        end: 1615772426000,
        output: 'table' as const,
      };

      await expect(donateHandler.listRecords(options)).rejects.toThrow(PolyVValidationError);
      await expect(donateHandler.listRecords(options)).rejects.toThrow('start must be before end');
    });

    it('11.6-UNIT-022: should output results in table format', async () => {
      const options: DonateListOptions = {
        channelId: '3151318',
        start: 1615772426000,
        end: 1615858826000,
        output: 'table',
      };

      mockDonateService.listRewardGift.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
          totalItems: 1,
          contents: [
            {
              userId: 'user123',
              nickName: 'Test User',
              timestamp: 1615772426000,
              name: 'Flower',
              type: '1',
              amount: 6.66,
              sessionId: 'session001',
            },
          ],
        },
      });

      await donateHandler.listRecords(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('User ID')
      );
    });

    it('11.6-UNIT-023: should output results in JSON format', async () => {
      const options: DonateListOptions = {
        channelId: '3151318',
        start: 1615772426000,
        end: 1615858826000,
        output: 'json',
      };

      mockDonateService.listRewardGift.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
          totalItems: 1,
          contents: [
            {
              userId: 'user123',
              nickName: 'Test User',
              timestamp: 1615772426000,
              name: 'Flower',
              type: '1',
              amount: 6.66,
              sessionId: 'session001',
            },
          ],
        },
      });

      await donateHandler.listRecords(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('userId')
      );
    });

    it('11.6-UNIT-024: should display empty message when no records found', async () => {
      const options: DonateListOptions = {
        channelId: '3151318',
        start: 1615772426000,
        end: 1615858826000,
        output: 'table',
      };

      mockDonateService.listRewardGift.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          pageNumber: 1,
          pageSize: 10,
          totalPages: 0,
          totalItems: 0,
          contents: [],
        },
      });

      await donateHandler.listRecords(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No donate records found')
      );
    });

    it('11.6-UNIT-025: should display pagination info in table format', async () => {
      const options: DonateListOptions = {
        channelId: '3151318',
        start: 1615772426000,
        end: 1615858826000,
        output: 'table',
      };

      mockDonateService.listRewardGift.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          pageNumber: 1,
          pageSize: 10,
          totalPages: 5,
          totalItems: 50,
          contents: [],
        },
      });

      await donateHandler.listRecords(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('50')
      );
    });

    it('11.6-UNIT-026: should handle API errors gracefully', async () => {
      const options: DonateListOptions = {
        channelId: '3151318',
        start: 1615772426000,
        end: 1615858826000,
        output: 'table',
      };

      const apiError = new PolyVError('API Error: Invalid time range', 'VALIDATION_ERROR', 400);
      mockDonateService.listRewardGift.mockRejectedValue(apiError);

      await expect(donateHandler.listRecords(options)).rejects.toThrow(PolyVError);
    });
  });

  // ============================================================
  // AC #4: Output format tests
  // ============================================================
  describe('Output Format (AC #4)', () => {
    it('11.6-UNIT-030: should validate output format must be table or json', async () => {
      const options = {
        channelId: '3151318',
        output: 'xml' as any,
      };

      await expect(donateHandler.getConfig(options)).rejects.toThrow(PolyVValidationError);
      await expect(donateHandler.getConfig(options)).rejects.toThrow(
        'output must be either "table" or "json"'
      );
    });
  });

  // ============================================================
  // AC #7: Error handling tests
  // ============================================================
  describe('Error Handling (AC #7)', () => {
    it('11.6-UNIT-040: should handle API 401 error (authentication failed)', async () => {
      const options: DonateConfigGetOptions = {
        channelId: '3151318',
        output: 'table',
      };

      const apiError = new PolyVError('Request failed with status code 401', 'AUTH_ERROR', 401);
      mockDonateService.getDonateConfig.mockRejectedValue(apiError);

      await expect(donateHandler.getConfig(options)).rejects.toThrow();
    });

    it('11.6-UNIT-041: should handle API 403 error (permission denied)', async () => {
      const options: DonateConfigUpdateOptions = {
        channelId: '3151318',
        cashEnabled: 'Y',
        force: true,
        output: 'table',
      };

      const apiError = new PolyVError('Request failed with status code 403', 'FORBIDDEN', 403);
      mockDonateService.updateDonateConfig.mockRejectedValue(apiError);

      await expect(donateHandler.updateConfig(options)).rejects.toThrow();
    });

    it('11.6-UNIT-042: should handle API 404 error (resource not found)', async () => {
      const options: DonateConfigGetOptions = {
        channelId: 'nonexistent',
        output: 'table',
      };

      const apiError = new PolyVError('Request failed with status code 404', 'NOT_FOUND', 404);
      mockDonateService.getDonateConfig.mockRejectedValue(apiError);

      await expect(donateHandler.getConfig(options)).rejects.toThrow();
    });

    it('11.6-UNIT-043: should handle API 500 error (internal server error)', async () => {
      const options: DonateListOptions = {
        channelId: '3151318',
        start: 1615772426000,
        end: 1615858826000,
        output: 'table',
      };

      const apiError = new PolyVError('Request failed with status code 500', 'SERVER_ERROR', 500);
      mockDonateService.listRewardGift.mockRejectedValue(apiError);

      await expect(donateHandler.listRecords(options)).rejects.toThrow();
    });

    it('11.6-UNIT-044: should handle network timeout errors', async () => {
      const options: DonateConfigGetOptions = {
        channelId: '3151318',
        output: 'table',
      };

      const apiError = new PolyVError('timeout of 30000ms exceeded', 'TIMEOUT', -1);
      mockDonateService.getDonateConfig.mockRejectedValue(apiError);

      await expect(donateHandler.getConfig(options)).rejects.toThrow();
    });
  });
});
