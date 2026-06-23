/**
 * @fileoverview Unit tests for LotteryHandler
 * @author Development Team
 * @since 11.5.0
 *
 * ATDD RED PHASE - These tests will fail until lottery.handler.ts is implemented
 */

// @ts-expect-error - Module not implemented yet
import { LotteryHandler } from './lottery.handler';
// @ts-expect-error - Module not implemented yet
import { LotteryServiceSdk } from '../services/lottery-service';
// @ts-expect-error - Module not implemented yet
import {
  LotteryServiceConfig,
  LotteryCreateOptions,
  LotteryListOptions,
  LotteryGetOptions,
  LotteryUpdateOptions,
  LotteryDeleteOptions,
  LotteryWinnersOptions,
  LotteryRecordsOptions,
} from '../types/lottery';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError, PolyVError } from '../utils/errors';
import { confirmWrite } from '../utils/api-command';

// Mock LotteryServiceSdk
jest.mock('../services/lottery-service');
jest.mock('../utils/api-command', () => ({
  ...jest.requireActual('../utils/api-command'),
  confirmWrite: jest.fn().mockResolvedValue(undefined),
}));
const MockedLotteryService = LotteryServiceSdk as jest.MockedClass<typeof LotteryServiceSdk>;
const mockConfirmWrite = confirmWrite as jest.MockedFunction<typeof confirmWrite>;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('LotteryHandler (ATDD RED PHASE)', () => {
  let lotteryHandler: LotteryHandler;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: LotteryServiceConfig;
  let mockLotteryService: jest.Mocked<LotteryServiceSdk>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirmWrite.mockResolvedValue(undefined);

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

    mockLotteryService = {
      createLotteryActivity: jest.fn(),
      listLotteryActivities: jest.fn(),
      getLotteryActivity: jest.fn(),
      updateLotteryActivity: jest.fn(),
      deleteLotteryActivity: jest.fn(),
      getWinnerDetail: jest.fn(),
      listLottery: jest.fn(),
    } as any;

    try {
      MockedLotteryService.mockImplementation(() => mockLotteryService);
      lotteryHandler = new LotteryHandler(mockAuthConfig, mockServiceConfig);
    } catch {
      // Expected to fail in RED phase
    }
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('constructor', () => {
    it('11.5-UNIT-001: should create LotteryServiceSdk with correct configuration', () => {
      expect(MockedLotteryService).toHaveBeenCalledWith(mockAuthConfig, mockServiceConfig);
    });
  });

  // ============================================================
  // AC #1: lottery create command
  // ============================================================
  describe('createLottery (AC #1)', () => {
    it('11.5-UNIT-002: should create lottery with minimal parameters (type=none)', async () => {
      const options: LotteryCreateOptions = {
        channelId: '3151318',
        name: 'Test Lottery',
        type: 'none',
        amount: 3,
        prizeName: 'Test Prize',
        force: true,
        output: 'table',
      };

      mockLotteryService.createLotteryActivity.mockResolvedValue({
        code: 200,
        status: 'success',
        data: { id: '20521' },
      });

      await lotteryHandler.createLottery(options);

      expect(mockLotteryService.createLotteryActivity).toHaveBeenCalledWith({
        channelId: '3151318',
        activityName: 'Test Lottery',
        lotteryCondition: 'none',
        amount: 3,
        prizeName: 'Test Prize',
      });
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Lottery created successfully')
      );
    });

    it('11.5-UNIT-002b: should confirm before creating lottery when force is not provided', async () => {
      const options: LotteryCreateOptions = {
        channelId: '3151318',
        name: 'Test Lottery',
        type: 'none',
        amount: 3,
        prizeName: 'Test Prize',
        output: 'table',
      };

      mockConfirmWrite.mockImplementation(async () => {
        expect(mockLotteryService.createLotteryActivity).not.toHaveBeenCalled();
      });
      mockLotteryService.createLotteryActivity.mockResolvedValue({
        code: 200,
        status: 'success',
        data: { id: '20521' },
      });

      await lotteryHandler.createLottery(options);

      expect(mockConfirmWrite).toHaveBeenCalledWith(
        undefined,
        'Create lottery activity "Test Lottery" on channel 3151318?'
      );
      expect(mockLotteryService.createLotteryActivity).toHaveBeenCalledTimes(1);
    });

    it('11.5-UNIT-003: should create invite-type lottery activity', async () => {
      const options: LotteryCreateOptions = {
        channelId: '3151318',
        name: 'Invite Lottery',
        type: 'invite',
        amount: 5,
        prizeName: 'Invite Prize',
        duration: 30,
        inviteNum: 3,
        force: true,
        output: 'table',
      };

      mockLotteryService.createLotteryActivity.mockResolvedValue({
        code: 200,
        status: 'success',
        data: { id: '20522' },
      });

      await lotteryHandler.createLottery(options);

      expect(mockLotteryService.createLotteryActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          lotteryCondition: 'invite',
          duration: 30,
          inviteNum: 3,
        })
      );
    });

    it('11.5-UNIT-004: should create duration-type lottery activity', async () => {
      const options: LotteryCreateOptions = {
        channelId: '3151318',
        name: 'Duration Lottery',
        type: 'duration',
        amount: 2,
        prizeName: 'Duration Prize',
        duration: 10,
        force: true,
        output: 'table',
      };

      mockLotteryService.createLotteryActivity.mockResolvedValue({
        code: 200,
        status: 'success',
        data: { id: '20523' },
      });

      await lotteryHandler.createLottery(options);

      expect(mockLotteryService.createLotteryActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          lotteryCondition: 'duration',
          duration: 10,
        })
      );
    });

    it('11.5-UNIT-005: should create comment-type lottery activity', async () => {
      const options: LotteryCreateOptions = {
        channelId: '3151318',
        name: 'Comment Lottery',
        type: 'comment',
        amount: 3,
        prizeName: 'Comment Prize',
        duration: 60,
        comment: '参与抽奖',
        force: true,
        output: 'table',
      };

      mockLotteryService.createLotteryActivity.mockResolvedValue({
        code: 200,
        status: 'success',
        data: { id: '20524' },
      });

      await lotteryHandler.createLottery(options);

      expect(mockLotteryService.createLotteryActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          lotteryCondition: 'comment',
          duration: 60,
          comment: '参与抽奖',
        })
      );
    });

    it('should require comment text for comment-type lottery activity', async () => {
      const options: LotteryCreateOptions = {
        channelId: '3151318',
        name: 'Comment Lottery',
        type: 'comment',
        amount: 3,
        prizeName: 'Comment Prize',
        duration: 60,
        force: true,
        output: 'table',
      };

      await expect(lotteryHandler.createLottery(options)).rejects.toThrow(
        'comment is required for comment lottery'
      );
    });

    it('11.5-UNIT-006: should create question-type lottery activity', async () => {
      const options: LotteryCreateOptions = {
        channelId: '3151318',
        name: 'Question Lottery',
        type: 'question',
        amount: 2,
        prizeName: 'Question Prize',
        force: true,
        output: 'table',
      };

      mockLotteryService.createLotteryActivity.mockResolvedValue({
        code: 200,
        status: 'success',
        data: { id: '20525' },
      });

      await lotteryHandler.createLottery(options);

      expect(mockLotteryService.createLotteryActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          lotteryCondition: 'question',
        })
      );
    });

    it('11.5-UNIT-007: should create lottery with receiveInfo', async () => {
      const receiveInfo = JSON.stringify([
        { type: 'userName', field: 'Name', tips: 'Please enter name', required: true },
      ]);
      const options: LotteryCreateOptions = {
        channelId: '3151318',
        name: 'Test Lottery',
        type: 'none',
        amount: 3,
        prizeName: 'Test Prize',
        receiveInfo,
        force: true,
        output: 'table',
      };

      mockLotteryService.createLotteryActivity.mockResolvedValue({
        code: 200,
        status: 'success',
        data: { id: '20521' },
      });

      await lotteryHandler.createLottery(options);

      expect(mockLotteryService.createLotteryActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          receiveEnabled: 'Y',
          receiveInfo,
        })
      );
    });

    it('11.5-UNIT-008: should validate channelId is required', async () => {
      const options = {
        channelId: '',
        name: 'Test',
        type: 'none' as const,
        amount: 1,
        prizeName: 'Prize',
        output: 'table' as const,
      };

      await expect(lotteryHandler.createLottery(options)).rejects.toThrow(PolyVValidationError);
      await expect(lotteryHandler.createLottery(options)).rejects.toThrow('channelId is required');
    });

    it('11.5-UNIT-009: should validate name is required', async () => {
      const options = {
        channelId: '3151318',
        name: '',
        type: 'none' as const,
        amount: 1,
        prizeName: 'Prize',
        output: 'table' as const,
      };

      await expect(lotteryHandler.createLottery(options)).rejects.toThrow(PolyVValidationError);
      await expect(lotteryHandler.createLottery(options)).rejects.toThrow('name is required');
    });

    it('11.5-UNIT-010: should validate type is valid', async () => {
      const options = {
        channelId: '3151318',
        name: 'Test',
        type: 'invalid' as any,
        amount: 1,
        prizeName: 'Prize',
        output: 'table' as const,
      };

      await expect(lotteryHandler.createLottery(options)).rejects.toThrow(PolyVValidationError);
      await expect(lotteryHandler.createLottery(options)).rejects.toThrow(
        'type must be one of: none, invite, duration, comment, question'
      );
    });

    it('11.5-UNIT-011: should validate amount is positive integer', async () => {
      const options = {
        channelId: '3151318',
        name: 'Test',
        type: 'none' as const,
        amount: 0,
        prizeName: 'Prize',
        output: 'table' as const,
      };

      await expect(lotteryHandler.createLottery(options)).rejects.toThrow(PolyVValidationError);
      await expect(lotteryHandler.createLottery(options)).rejects.toThrow('amount must be a positive integer');
    });

    it('11.5-UNIT-012: should validate prizeName is required', async () => {
      const options = {
        channelId: '3151318',
        name: 'Test',
        type: 'none' as const,
        amount: 1,
        prizeName: '',
        output: 'table' as const,
      };

      await expect(lotteryHandler.createLottery(options)).rejects.toThrow(PolyVValidationError);
      await expect(lotteryHandler.createLottery(options)).rejects.toThrow('prizeName is required');
    });

    it('11.5-UNIT-013: should output in JSON format when specified', async () => {
      const options: LotteryCreateOptions = {
        channelId: '3151318',
        name: 'Test Lottery',
        type: 'none',
        amount: 3,
        prizeName: 'Test Prize',
        force: true,
        output: 'json',
      };

      mockLotteryService.createLotteryActivity.mockResolvedValue({
        code: 200,
        status: 'success',
        data: { id: '20521' },
      });

      await lotteryHandler.createLottery(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"id"')
      );
    });

    it('11.5-UNIT-014: should handle API errors gracefully', async () => {
      const options: LotteryCreateOptions = {
        channelId: '3151318',
        name: 'Test Lottery',
        type: 'none',
        amount: 3,
        prizeName: 'Test Prize',
        force: true,
        output: 'table',
      };

      const apiError = new PolyVError('API Error: Authentication failed', 'AUTH_ERROR', 401);
      mockLotteryService.createLotteryActivity.mockRejectedValue(apiError);

      await expect(lotteryHandler.createLottery(options)).rejects.toThrow(PolyVError);
    });
  });

  // ============================================================
  // AC #2: lottery list command
  // ============================================================
  describe('listLottery (AC #2)', () => {
    it('11.5-UNIT-015: should list lottery activities with minimal parameters', async () => {
      const options: LotteryListOptions = {
        channelId: '3151318',
        output: 'table',
      };

      mockLotteryService.listLotteryActivities.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [
            {
              id: '20521',
              activityName: 'Test Lottery',
              lotteryCondition: 'none',
              status: 'ended',
              amount: 3,
              prizeName: 'Test Prize',
            },
          ],
          pageSize: 10,
          pageNumber: 1,
          totalItems: 1,
        },
      });

      await lotteryHandler.listLottery(options);

      expect(mockLotteryService.listLotteryActivities).toHaveBeenCalledWith({
        channelId: '3151318',
        pageNumber: 1,
        pageSize: 10,
      });
    });

    it('11.5-UNIT-016: should list lottery activities with pagination', async () => {
      const options: LotteryListOptions = {
        channelId: '3151318',
        page: 1,
        size: 20,
        output: 'table',
      };

      mockLotteryService.listLotteryActivities.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [],
          pageSize: 20,
          pageNumber: 1,
          totalItems: 0,
        },
      });

      await lotteryHandler.listLottery(options);

      expect(mockLotteryService.listLotteryActivities).toHaveBeenCalledWith(
        expect.objectContaining({
          pageNumber: 1,
          pageSize: 20,
        })
      );
    });

    it('11.5-UNIT-017: should validate channelId is required', async () => {
      const options = {
        channelId: '',
        output: 'table' as const,
      };

      await expect(lotteryHandler.listLottery(options)).rejects.toThrow(PolyVValidationError);
      await expect(lotteryHandler.listLottery(options)).rejects.toThrow('channelId is required');
    });

    it('11.5-UNIT-018: should output results in table format', async () => {
      const options: LotteryListOptions = {
        channelId: '3151318',
        output: 'table',
      };

      mockLotteryService.listLotteryActivities.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [
            {
              id: '20521',
              activityName: 'Test Lottery',
              lotteryCondition: 'none',
              status: 'ended',
              amount: 3,
              prizeName: 'Test Prize',
            },
          ],
          pageSize: 10,
          pageNumber: 1,
          totalItems: 1,
        },
      });

      await lotteryHandler.listLottery(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('ID')
      );
    });

    it('11.5-UNIT-019: should output results in JSON format', async () => {
      const options: LotteryListOptions = {
        channelId: '3151318',
        output: 'json',
      };

      mockLotteryService.listLotteryActivities.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [
            {
              id: '20521',
              activityName: 'Test Lottery',
              lotteryCondition: 'none',
              status: 'ended',
              amount: 3,
              prizeName: 'Test Prize',
            },
          ],
          pageSize: 10,
          pageNumber: 1,
          totalItems: 1,
        },
      });

      await lotteryHandler.listLottery(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"id"')
      );
    });

    it('11.5-UNIT-020: should display empty message when no activities found', async () => {
      const options: LotteryListOptions = {
        channelId: '3151318',
        output: 'table',
      };

      mockLotteryService.listLotteryActivities.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [],
          pageSize: 10,
          pageNumber: 1,
          totalItems: 0,
        },
      });

      await lotteryHandler.listLottery(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No lottery activities found')
      );
    });

    it('11.5-UNIT-021: should handle API errors gracefully', async () => {
      const options: LotteryListOptions = {
        channelId: '3151318',
        output: 'table',
      };

      const apiError = new PolyVError('API Error: Authentication failed', 'AUTH_ERROR', 401);
      mockLotteryService.listLotteryActivities.mockRejectedValue(apiError);

      await expect(lotteryHandler.listLottery(options)).rejects.toThrow(PolyVError);
    });
  });

  // ============================================================
  // AC #3: lottery get command
  // ============================================================
  describe('getLottery (AC #3)', () => {
    it('11.5-UNIT-022: should get lottery activity details', async () => {
      const options: LotteryGetOptions = {
        channelId: '3151318',
        id: '20521',
        output: 'table',
      };

      mockLotteryService.getLotteryActivity.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          id: '20521',
          activityName: 'Test Lottery',
          lotteryCondition: 'none',
          status: 'ended',
          amount: 3,
          prizeName: 'Test Prize',
        },
      });

      await lotteryHandler.getLottery(options);

      expect(mockLotteryService.getLotteryActivity).toHaveBeenCalledWith({
        channelId: '3151318',
        id: '20521',
      });
    });

    it('11.5-UNIT-023: should validate channelId is required', async () => {
      const options = {
        channelId: '',
        id: '20521',
        output: 'table' as const,
      };

      await expect(lotteryHandler.getLottery(options)).rejects.toThrow(PolyVValidationError);
      await expect(lotteryHandler.getLottery(options)).rejects.toThrow('channelId is required');
    });

    it('11.5-UNIT-024: should validate id is required', async () => {
      const options = {
        channelId: '3151318',
        id: '',
        output: 'table' as const,
      };

      await expect(lotteryHandler.getLottery(options)).rejects.toThrow(PolyVValidationError);
      await expect(lotteryHandler.getLottery(options)).rejects.toThrow('id is required');
    });

    it('11.5-UNIT-025: should output in JSON format', async () => {
      const options: LotteryGetOptions = {
        channelId: '3151318',
        id: '20521',
        output: 'json',
      };

      mockLotteryService.getLotteryActivity.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          id: '20521',
          activityName: 'Test Lottery',
          lotteryCondition: 'none',
          status: 'ended',
          amount: 3,
          prizeName: 'Test Prize',
        },
      });

      await lotteryHandler.getLottery(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"id"')
      );
    });
  });

  // ============================================================
  // AC #4: lottery update command
  // ============================================================
  describe('updateLottery (AC #4)', () => {
    it('11.5-UNIT-026: should update lottery activity', async () => {
      const options: LotteryUpdateOptions = {
        channelId: '3151318',
        id: '20521',
        name: 'Updated Name',
        amount: 5,
        prizeName: 'Updated Prize',
        force: true,
        output: 'table',
      };

      mockLotteryService.updateLotteryActivity.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {},
      });

      await lotteryHandler.updateLottery(options);

      expect(mockLotteryService.updateLotteryActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '20521',
          activityName: 'Updated Name',
          amount: 5,
          prizeName: 'Updated Prize',
        })
      );
    });

    it('11.5-UNIT-027: should validate id is required', async () => {
      const options = {
        channelId: '3151318',
        id: '',
        output: 'table' as const,
      };

      await expect(lotteryHandler.updateLottery(options)).rejects.toThrow(PolyVValidationError);
      await expect(lotteryHandler.updateLottery(options)).rejects.toThrow('id is required');
    });
  });

  // ============================================================
  // AC #5: lottery delete command
  // ============================================================
  describe('deleteLottery (AC #5)', () => {
    it('11.5-UNIT-028: should delete lottery activity', async () => {
      const options: LotteryDeleteOptions = {
        channelId: '3151318',
        id: '20521',
        force: true,
        output: 'table',
      };

      mockLotteryService.deleteLotteryActivity.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {},
      });

      await lotteryHandler.deleteLottery(options);

      expect(mockLotteryService.deleteLotteryActivity).toHaveBeenCalledWith({
        channelId: '3151318',
        id: '20521',
      });
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Lottery deleted successfully')
      );
    });

    it('11.5-UNIT-028b: should not delete lottery activity when confirmation fails', async () => {
      const options: LotteryDeleteOptions = {
        channelId: '3151318',
        id: '20521',
        output: 'table',
      };

      mockConfirmWrite.mockRejectedValue(new Error('Operation cancelled.'));

      await expect(lotteryHandler.deleteLottery(options)).rejects.toThrow('Operation cancelled.');

      expect(mockConfirmWrite).toHaveBeenCalledWith(
        undefined,
        'Delete lottery activity 20521 on channel 3151318?'
      );
      expect(mockLotteryService.deleteLotteryActivity).not.toHaveBeenCalled();
    });

    it('11.5-UNIT-029: should validate id is required', async () => {
      const options = {
        channelId: '3151318',
        id: '',
        output: 'table' as const,
      };

      await expect(lotteryHandler.deleteLottery(options)).rejects.toThrow(PolyVValidationError);
      await expect(lotteryHandler.deleteLottery(options)).rejects.toThrow('id is required');
    });
  });

  // ============================================================
  // AC #6: lottery winners command
  // ============================================================
  describe('getWinners (AC #6)', () => {
    it('11.5-UNIT-030: should get winner list', async () => {
      const options: LotteryWinnersOptions = {
        channelId: '3151318',
        lotteryId: 'fv3mao43u6',
        output: 'table',
      };

      mockLotteryService.getWinnerDetail.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [
          {
            viewerId: 'viewer123',
            nick: 'Winner1',
            winnerCode: 'ABC123',
            winTime: 1616150400000,
          },
        ],
      });

      await lotteryHandler.getWinners(options);

      expect(mockLotteryService.getWinnerDetail).toHaveBeenCalledWith({
        channelId: '3151318',
        lotteryId: 'fv3mao43u6',
      });
    });

    it('11.5-UNIT-031: should get winners with pagination', async () => {
      const options: LotteryWinnersOptions = {
        channelId: '3151318',
        lotteryId: 'fv3mao43u6',
        page: 1,
        limit: 20,
        output: 'table',
      };

      mockLotteryService.getWinnerDetail.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [],
      });

      await lotteryHandler.getWinners(options);

      expect(mockLotteryService.getWinnerDetail).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
        })
      );
    });

    it('11.5-UNIT-031b: should pass viewerId for viewer-specific winner lookup', async () => {
      const options: LotteryWinnersOptions = {
        channelId: '3151318',
        lotteryId: 'fv3mao43u6',
        viewerId: 'viewer123',
        output: 'table',
      };

      mockLotteryService.getWinnerDetail.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [],
      });

      await lotteryHandler.getWinners(options);

      expect(mockLotteryService.getWinnerDetail).toHaveBeenCalledWith({
        channelId: '3151318',
        lotteryId: 'fv3mao43u6',
        viewerId: 'viewer123',
      });
    });

    it('11.5-UNIT-032: should validate lotteryId is required', async () => {
      const options = {
        channelId: '3151318',
        lotteryId: '',
        output: 'table' as const,
      };

      await expect(lotteryHandler.getWinners(options)).rejects.toThrow(PolyVValidationError);
      await expect(lotteryHandler.getWinners(options)).rejects.toThrow('lotteryId is required');
    });

    it('11.5-UNIT-032b: should validate viewerId is not empty when provided', async () => {
      const options = {
        channelId: '3151318',
        lotteryId: 'fv3mao43u6',
        viewerId: '',
        output: 'table' as const,
      };

      await expect(lotteryHandler.getWinners(options)).rejects.toThrow(PolyVValidationError);
      await expect(lotteryHandler.getWinners(options)).rejects.toThrow('viewerId must not be empty');
    });

    it('11.5-UNIT-033: should output winners in table format', async () => {
      const options: LotteryWinnersOptions = {
        channelId: '3151318',
        lotteryId: 'fv3mao43u6',
        output: 'table',
      };

      mockLotteryService.getWinnerDetail.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [
          {
            viewerId: 'viewer123',
            nick: 'Winner1',
            winnerCode: 'ABC123',
            winTime: 1616150400000,
          },
        ],
      });

      await lotteryHandler.getWinners(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('ID')
      );
    });

    it('11.5-UNIT-034: should display empty message when no winners found', async () => {
      const options: LotteryWinnersOptions = {
        channelId: '3151318',
        lotteryId: 'fv3mao43u6',
        output: 'table',
      };

      mockLotteryService.getWinnerDetail.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [],
      });

      await lotteryHandler.getWinners(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No winners found')
      );
    });
  });

  // ============================================================
  // AC #7: lottery records command
  // ============================================================
  describe('getRecords (AC #7)', () => {
    it('11.5-UNIT-035: should get lottery records with minimal parameters', async () => {
      const options: LotteryRecordsOptions = {
        channelId: '3151318',
        startTime: 1601481600000,
        endTime: 1615357743000,
        output: 'table',
      };

      mockLotteryService.listLottery.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [
          {
            lotteryId: 'fv3mao43u6',
            channelId: '3151318',
            sessionId: 'fwly13xczv',
            prize: 'Test Prize',
            amount: 3,
            winnerCount: 3,
            createdTime: 1616150400000,
          },
        ],
      });

      await lotteryHandler.getRecords(options);

      expect(mockLotteryService.listLottery).toHaveBeenCalledWith({
        channelId: '3151318',
        startTime: 1601481600000,
        endTime: 1615357743000,
      });
    });

    it('11.5-UNIT-036: should get lottery records with time range', async () => {
      const options: LotteryRecordsOptions = {
        channelId: '3151318',
        startTime: 1615772426000,
        endTime: 1615773566000,
        output: 'table',
      };

      mockLotteryService.listLottery.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [],
      });

      await lotteryHandler.getRecords(options);

      expect(mockLotteryService.listLottery).toHaveBeenCalledWith(
        expect.objectContaining({
          startTime: 1615772426000,
          endTime: 1615773566000,
        })
      );
    });

    it('11.5-UNIT-037: should get lottery records with sessionId filter', async () => {
      const options: LotteryRecordsOptions = {
        channelId: '3151318',
        startTime: 1601481600000,
        endTime: 1615357743000,
        sessionId: 'fwly13xczv',
        output: 'table',
      };

      mockLotteryService.listLottery.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [],
      });

      await lotteryHandler.getRecords(options);

      expect(mockLotteryService.listLottery).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'fwly13xczv',
        })
      );
    });

    it('11.5-UNIT-038: should get lottery records with pagination', async () => {
      const options: LotteryRecordsOptions = {
        channelId: '3151318',
        startTime: 1601481600000,
        endTime: 1615357743000,
        page: 1,
        limit: 20,
        output: 'table',
      };

      mockLotteryService.listLottery.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [],
      });

      await lotteryHandler.getRecords(options);

      expect(mockLotteryService.listLottery).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
        })
      );
    });

    it('11.5-UNIT-039: should output records in table format', async () => {
      const options: LotteryRecordsOptions = {
        channelId: '3151318',
        startTime: 1601481600000,
        endTime: 1615357743000,
        output: 'table',
      };

      mockLotteryService.listLottery.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [
          {
            lotteryId: 'fv3mao43u6',
            channelId: '3151318',
            sessionId: 'fwly13xczv',
            prize: 'Test Prize',
            amount: 3,
            winnerCount: 3,
            createdTime: 1616150400000,
          },
        ],
      });

      await lotteryHandler.getRecords(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('ID')
      );
    });

    it('11.5-UNIT-040: should display empty message when no records found', async () => {
      const options: LotteryRecordsOptions = {
        channelId: '3151318',
        startTime: 1601481600000,
        endTime: 1615357743000,
        output: 'table',
      };

      mockLotteryService.listLottery.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [],
      });

      await lotteryHandler.getRecords(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No lottery records found')
      );
    });

    it('11.5-UNIT-040b: should require time range', async () => {
      const options = {
        channelId: '3151318',
        output: 'table',
      } as LotteryRecordsOptions;

      await expect(lotteryHandler.getRecords(options)).rejects.toThrow(PolyVValidationError);
      await expect(lotteryHandler.getRecords(options)).rejects.toThrow('startTime is required');
    });
  });

  // ============================================================
  // AC #8: Output format tests
  // ============================================================
  describe('Output Format (AC #8)', () => {
    it('11.5-UNIT-041: should validate output format must be table or json', async () => {
      const options = {
        channelId: '3151318',
        output: 'xml' as any,
      };

      await expect(lotteryHandler.listLottery(options)).rejects.toThrow(PolyVValidationError);
      await expect(lotteryHandler.listLottery(options)).rejects.toThrow(
        'output must be either "table" or "json"'
      );
    });
  });

  // ============================================================
  // AC #11: Error handling tests
  // ============================================================
  describe('Error Handling (AC #11)', () => {
    it('11.5-UNIT-050: should handle API 401 error (authentication failed)', async () => {
      const options: LotteryCreateOptions = {
        channelId: '3151318',
        name: 'Test',
        type: 'none',
        amount: 1,
        prizeName: 'Prize',
        force: true,
        output: 'table',
      };

      const apiError = new PolyVError('Request failed with status code 401', 'AUTH_ERROR', 401);
      mockLotteryService.createLotteryActivity.mockRejectedValue(apiError);

      await expect(lotteryHandler.createLottery(options)).rejects.toThrow();
    });

    it('11.5-UNIT-051: should handle API 403 error (permission denied)', async () => {
      const options: LotteryCreateOptions = {
        channelId: '3151318',
        name: 'Test',
        type: 'none',
        amount: 1,
        prizeName: 'Prize',
        force: true,
        output: 'table',
      };

      const apiError = new PolyVError('Request failed with status code 403', 'FORBIDDEN', 403);
      mockLotteryService.createLotteryActivity.mockRejectedValue(apiError);

      await expect(lotteryHandler.createLottery(options)).rejects.toThrow();
    });

    it('11.5-UNIT-052: should handle API 404 error (resource not found)', async () => {
      const options: LotteryGetOptions = {
        channelId: '3151318',
        id: 'nonexistent',
        output: 'table',
      };

      const apiError = new PolyVError('Request failed with status code 404', 'NOT_FOUND', 404);
      mockLotteryService.getLotteryActivity.mockRejectedValue(apiError);

      await expect(lotteryHandler.getLottery(options)).rejects.toThrow();
    });

    it('11.5-UNIT-053: should handle API 500 error (internal server error)', async () => {
      const options: LotteryCreateOptions = {
        channelId: '3151318',
        name: 'Test',
        type: 'none',
        amount: 1,
        prizeName: 'Prize',
        force: true,
        output: 'table',
      };

      const apiError = new PolyVError('Request failed with status code 500', 'SERVER_ERROR', 500);
      mockLotteryService.createLotteryActivity.mockRejectedValue(apiError);

      await expect(lotteryHandler.createLottery(options)).rejects.toThrow();
    });

    it('11.5-UNIT-054: should handle network timeout errors', async () => {
      const options: LotteryCreateOptions = {
        channelId: '3151318',
        name: 'Test',
        type: 'none',
        amount: 1,
        prizeName: 'Prize',
        force: true,
        output: 'table',
      };

      const apiError = new PolyVError('timeout of 30000ms exceeded', 'TIMEOUT', -1);
      mockLotteryService.createLotteryActivity.mockRejectedValue(apiError);

      await expect(lotteryHandler.createLottery(options)).rejects.toThrow();
    });
  });
});
