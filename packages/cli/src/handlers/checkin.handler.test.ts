/**
 * @fileoverview Unit tests for CheckinHandler
 * @author Development Team
 * @since 11.3.0
 */

import { CheckinHandler } from './checkin.handler';
import { CheckinServiceSdk } from '../services/checkin-service';
import { CheckinServiceConfig, CheckinStartOptions, CheckinListOptions, CheckinResultOptions, CheckinSessionsOptions } from '../types/checkin';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError, PolyVError } from '../utils/errors';

// Mock CheckinServiceSdk
jest.mock('../services/checkin-service');
const MockedCheckinService = CheckinServiceSdk as jest.MockedClass<typeof CheckinServiceSdk>;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('CheckinHandler', () => {
  let checkinHandler: CheckinHandler;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: CheckinServiceConfig;
  let mockCheckinService: jest.Mocked<CheckinServiceSdk>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock auth config
    mockAuthConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id'
    };

    // Mock service config
    mockServiceConfig = {
      baseUrl: 'https://api.polyv.net',
      timeout: 30000,
      debug: false
    };

    // Create mock service instance
    mockCheckinService = {
      startCheckin: jest.fn(),
      listCheckins: jest.fn(),
      getCheckinResult: jest.fn(),
      listSessions: jest.fn()
    } as any;

    // Mock CheckinService constructor
    MockedCheckinService.mockImplementation(() => mockCheckinService);

    // Create handler instance
    checkinHandler = new CheckinHandler(mockAuthConfig, mockServiceConfig);
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('constructor', () => {
    it('should create CheckinServiceSdk with correct configuration', () => {
      expect(MockedCheckinService).toHaveBeenCalledWith(mockAuthConfig, mockServiceConfig);
    });
  });

  // ============================================================
  // AC #1: checkin start command
  // ============================================================
  describe('startCheckin (AC #1)', () => {
    it('11.3-UNIT-001: should start checkin with minimal parameters', async () => {
      const options: CheckinStartOptions = {
        channelId: '3151318',
        output: 'table'
      };

      mockCheckinService.startCheckin.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          checkinId: 'db14ef80-81b8-11eb-b114-e7477b'
        }
      });

      await checkinHandler.startCheckin(options);

      expect(mockCheckinService.startCheckin).toHaveBeenCalledWith({
        channelId: '3151318',
        limitTime: undefined,
        delayTime: undefined,
        message: undefined,
        forceCheckInEnabled: undefined
      });
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Checkin started successfully')
      );
    });

    it('11.3-UNIT-002: should start checkin with limitTime parameter', async () => {
      const options: CheckinStartOptions = {
        channelId: '3151318',
        limitTime: 30,
        output: 'table'
      };

      mockCheckinService.startCheckin.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          checkinId: 'db14ef80-81b8-11eb-b114-e7477b'
        }
      });

      await checkinHandler.startCheckin(options);

      expect(mockCheckinService.startCheckin).toHaveBeenCalledWith(
        expect.objectContaining({
          limitTime: 30
        })
      );
    });

    it('11.3-UNIT-003: should start checkin with delayTime parameter (scheduled checkin)', async () => {
      const options: CheckinStartOptions = {
        channelId: '3151318',
        limitTime: 60,
        delayTime: 1700734800000,
        output: 'table'
      };

      mockCheckinService.startCheckin.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          checkinId: 'db14ef80-81b8-11eb-b114-e7477b'
        }
      });

      await checkinHandler.startCheckin(options);

      expect(mockCheckinService.startCheckin).toHaveBeenCalledWith(
        expect.objectContaining({
          delayTime: 1700734800000
        })
      );
    });

    it('11.3-UNIT-004: should start checkin with message parameter', async () => {
      const options: CheckinStartOptions = {
        channelId: '3151318',
        message: '请签到',
        output: 'table'
      };

      mockCheckinService.startCheckin.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          checkinId: 'db14ef80-81b8-11eb-b114-e7477b'
        }
      });

      await checkinHandler.startCheckin(options);

      expect(mockCheckinService.startCheckin).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '请签到'
        })
      );
    });

    it('11.3-UNIT-005: should start checkin with force flag enabled', async () => {
      const options: CheckinStartOptions = {
        channelId: '3151318',
        force: true,
        output: 'table'
      };

      mockCheckinService.startCheckin.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          checkinId: 'db14ef80-81b8-11eb-b114-e7477b'
        }
      });

      await checkinHandler.startCheckin(options);

      expect(mockCheckinService.startCheckin).toHaveBeenCalledWith(
        expect.objectContaining({
          forceCheckInEnabled: 'Y'
        })
      );
    });

    it('11.3-UNIT-006: should validate channelId is required', async () => {
      const options = {
        channelId: '',
        output: 'table' as const
      };

      await expect(checkinHandler.startCheckin(options)).rejects.toThrow(PolyVValidationError);
      await expect(checkinHandler.startCheckin(options)).rejects.toThrow('channelId is required');
    });

    it('11.3-UNIT-007: should validate limitTime is within valid range (0-86400)', async () => {
      const options = {
        channelId: '3151318',
        limitTime: 100000,
        output: 'table' as const
      };

      await expect(checkinHandler.startCheckin(options)).rejects.toThrow(PolyVValidationError);
      await expect(checkinHandler.startCheckin(options)).rejects.toThrow('limitTime must be between 0 and 86400');
    });

    it('11.3-UNIT-008: should format success message for immediate checkin', async () => {
      const options: CheckinStartOptions = {
        channelId: '3151318',
        output: 'table'
      };

      mockCheckinService.startCheckin.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          checkinId: 'db14ef80-81b8-11eb-b114-e7477b'
        }
      });

      await checkinHandler.startCheckin(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Checkin ID: db14ef80-81b8-11eb-b114-e7477b')
      );
    });

    it('11.3-UNIT-009: should format success message for scheduled checkin', async () => {
      const scheduledTime = Date.now() + 3600000;
      const options: CheckinStartOptions = {
        channelId: '3151318',
        delayTime: scheduledTime,
        output: 'table'
      };

      mockCheckinService.startCheckin.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          checkinId: 'db14ef80-81b8-11eb-b114-e7477b'
        }
      });

      await checkinHandler.startCheckin(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Scheduled checkin')
      );
    });

    it('11.3-UNIT-010: should handle API errors gracefully', async () => {
      const options: CheckinStartOptions = {
        channelId: '3151318',
        output: 'table'
      };

      const apiError = new PolyVError('API Error: Authentication failed', 'AUTH_ERROR', 401);
      mockCheckinService.startCheckin.mockRejectedValue(apiError);

      await expect(checkinHandler.startCheckin(options)).rejects.toThrow(PolyVError);
    });
  });

  // ============================================================
  // AC #2: checkin list command
  // ============================================================
  describe('listCheckins (AC #2)', () => {
    it('11.3-UNIT-011: should list checkins with minimal parameters', async () => {
      const options: CheckinListOptions = {
        channelId: '3151318',
        output: 'table'
      };

      mockCheckinService.listCheckins.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [
            {
              checkinid: 'db14ef80-81b8-11eb-b114-e7477b',
              nickname: 'User1',
              userid: 'user123',
              time: 1616150400000,
              timeFormat: '2021-03-19 12:00:00'
            }
          ],
          count: 1
        }
      });

      await checkinHandler.listCheckins(options);

      expect(mockCheckinService.listCheckins).toHaveBeenCalledWith({
        channelId: '3151318',
        page: undefined,
        pageSize: undefined,
        date: undefined,
        sessionId: undefined
      });
    });

    it('11.3-UNIT-012: should list checkins with pagination (page, size)', async () => {
      const options: CheckinListOptions = {
        channelId: '3151318',
        page: 1,
        size: 20,
        output: 'table'
      };

      mockCheckinService.listCheckins.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [],
          count: 0
        }
      });

      await checkinHandler.listCheckins(options);

      expect(mockCheckinService.listCheckins).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          pageSize: 20
        })
      );
    });

    it('11.3-UNIT-013: should list checkins filtered by date', async () => {
      const options: CheckinListOptions = {
        channelId: '3151318',
        date: '2024-01-15',
        output: 'table'
      };

      mockCheckinService.listCheckins.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [],
          count: 0
        }
      });

      await checkinHandler.listCheckins(options);

      expect(mockCheckinService.listCheckins).toHaveBeenCalledWith(
        expect.objectContaining({
          date: '2024-01-15'
        })
      );
    });

    it('11.3-UNIT-014: should list checkins filtered by sessionId', async () => {
      const options: CheckinListOptions = {
        channelId: '3151318',
        sessionId: 'fwly13xczv',
        output: 'table'
      };

      mockCheckinService.listCheckins.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [],
          count: 0
        }
      });

      await checkinHandler.listCheckins(options);

      expect(mockCheckinService.listCheckins).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'fwly13xczv'
        })
      );
    });

    it('11.3-UNIT-015: should validate channelId is required', async () => {
      const options = {
        channelId: '',
        output: 'table' as const
      };

      await expect(checkinHandler.listCheckins(options)).rejects.toThrow(PolyVValidationError);
      await expect(checkinHandler.listCheckins(options)).rejects.toThrow('channelId is required');
    });

    it('11.3-UNIT-016: should output results in table format by default', async () => {
      const options: CheckinListOptions = {
        channelId: '3151318',
        output: 'table'
      };

      mockCheckinService.listCheckins.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [
            {
              checkinid: 'db14ef80-81b8-11eb-b114-e7477b',
              nickname: 'User1',
              userid: 'user123',
              time: 1616150400000,
              timeFormat: '2021-03-19 12:00:00'
            }
          ],
          count: 1
        }
      });

      await checkinHandler.listCheckins(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Checkin ID')
      );
    });

    it('11.3-UNIT-017: should output results in JSON format when specified', async () => {
      const options: CheckinListOptions = {
        channelId: '3151318',
        output: 'json'
      };

      mockCheckinService.listCheckins.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [
            {
              checkinid: 'db14ef80-81b8-11eb-b114-e7477b',
              nickname: 'User1',
              userid: 'user123',
              time: 1616150400000,
              timeFormat: '2021-03-19 12:00:00'
            }
          ],
          count: 1
        }
      });

      await checkinHandler.listCheckins(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"checkinid"')
      );
    });

    it('11.3-UNIT-018: should display empty message when no checkins found', async () => {
      const options: CheckinListOptions = {
        channelId: '3151318',
        output: 'table'
      };

      mockCheckinService.listCheckins.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [],
          count: 0
        }
      });

      await checkinHandler.listCheckins(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No checkins found')
      );
    });

    it('11.3-UNIT-019: should handle API errors gracefully', async () => {
      const options: CheckinListOptions = {
        channelId: '3151318',
        output: 'table'
      };

      const apiError = new PolyVError('API Error: Authentication failed', 'AUTH_ERROR', 401);
      mockCheckinService.listCheckins.mockRejectedValue(apiError);

      await expect(checkinHandler.listCheckins(options)).rejects.toThrow(PolyVError);
    });
  });

  // ============================================================
  // AC #3: checkin result command
  // ============================================================
  describe('getCheckinResult (AC #3)', () => {
    it('11.3-UNIT-020: should get checkin result with checkinId', async () => {
      const options: CheckinResultOptions = {
        channelId: '3151318',
        checkinId: 'db14ef80-81b8-11eb-b114-e7477b',
        output: 'table'
      };

      mockCheckinService.getCheckinResult.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [
          {
            userid: 'user123',
            nickname: 'User1',
            checked: 'Y',
            time: 1616150400000,
            timeFormat: '2021-03-19 12:00:00'
          }
        ]
      });

      await checkinHandler.getCheckinResult(options);

      expect(mockCheckinService.getCheckinResult).toHaveBeenCalledWith({
        channelId: '3151318',
        checkinId: 'db14ef80-81b8-11eb-b114-e7477b'
      });
    });

    it('11.3-UNIT-021: should display checked-in users (checked=Y)', async () => {
      const options: CheckinResultOptions = {
        channelId: '3151318',
        checkinId: 'db14ef80-81b8-11eb-b114-e7477b',
        output: 'table'
      };

      mockCheckinService.getCheckinResult.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [
          {
            userid: 'user123',
            nickname: 'User1',
            checked: 'Y',
            time: 1616150400000,
            timeFormat: '2021-03-19 12:00:00'
          }
        ]
      });

      await checkinHandler.getCheckinResult(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Y')
      );
    });

    it('11.3-UNIT-022: should display not-checked-in users (checked=N)', async () => {
      const options: CheckinResultOptions = {
        channelId: '3151318',
        checkinId: 'db14ef80-81b8-11eb-b114-e7477b',
        output: 'table'
      };

      mockCheckinService.getCheckinResult.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [
          {
            userid: 'user456',
            nickname: 'User2',
            checked: 'N',
            time: null,
            timeFormat: null
          }
        ]
      });

      await checkinHandler.getCheckinResult(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('N')
      );
    });

    it('11.3-UNIT-023: should validate channelId is required', async () => {
      const options = {
        channelId: '',
        checkinId: 'db14ef80-81b8-11eb-b114-e7477b',
        output: 'table' as const
      };

      await expect(checkinHandler.getCheckinResult(options)).rejects.toThrow(PolyVValidationError);
      await expect(checkinHandler.getCheckinResult(options)).rejects.toThrow('channelId is required');
    });

    it('11.3-UNIT-024: should validate checkinId is required', async () => {
      const options = {
        channelId: '3151318',
        checkinId: '',
        output: 'table' as const
      };

      await expect(checkinHandler.getCheckinResult(options)).rejects.toThrow(PolyVValidationError);
      await expect(checkinHandler.getCheckinResult(options)).rejects.toThrow('checkinId is required');
    });

    it('11.3-UNIT-025: should output results in table format', async () => {
      const options: CheckinResultOptions = {
        channelId: '3151318',
        checkinId: 'db14ef80-81b8-11eb-b114-e7477b',
        output: 'table'
      };

      mockCheckinService.getCheckinResult.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [
          {
            userid: 'user123',
            nickname: 'User1',
            checked: 'Y',
            time: 1616150400000,
            timeFormat: '2021-03-19 12:00:00'
          }
        ]
      });

      await checkinHandler.getCheckinResult(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('User ID')
      );
    });

    it('11.3-UNIT-026: should output results in JSON format', async () => {
      const options: CheckinResultOptions = {
        channelId: '3151318',
        checkinId: 'db14ef80-81b8-11eb-b114-e7477b',
        output: 'json'
      };

      mockCheckinService.getCheckinResult.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [
          {
            userid: 'user123',
            nickname: 'User1',
            checked: 'Y',
            time: 1616150400000,
            timeFormat: '2021-03-19 12:00:00'
          }
        ]
      });

      await checkinHandler.getCheckinResult(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"userid"')
      );
    });

    it('11.3-UNIT-027: should handle API errors gracefully', async () => {
      const options: CheckinResultOptions = {
        channelId: '3151318',
        checkinId: 'db14ef80-81b8-11eb-b114-e7477b',
        output: 'table'
      };

      const apiError = new PolyVError('API Error: Authentication failed', 'AUTH_ERROR', 401);
      mockCheckinService.getCheckinResult.mockRejectedValue(apiError);

      await expect(checkinHandler.getCheckinResult(options)).rejects.toThrow(PolyVError);
    });
  });

  // ============================================================
  // AC #4: checkin sessions command
  // ============================================================
  describe('listSessions (AC #4)', () => {
    it('11.3-UNIT-028: should list checkin sessions with date range', async () => {
      const options: CheckinSessionsOptions = {
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        output: 'table'
      };

      mockCheckinService.listSessions.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [
          {
            checkinid: 'db14ef80-81b8-11eb-b114-e7477b',
            time: 1616150400000,
            timeFormat: '2021-03-19 12:00:00'
          }
        ]
      });

      await checkinHandler.listSessions(options);

      expect(mockCheckinService.listSessions).toHaveBeenCalledWith({
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      });
    });

    it('11.3-UNIT-029: should validate channelId is required', async () => {
      const options = {
        channelId: '',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        output: 'table' as const
      };

      await expect(checkinHandler.listSessions(options)).rejects.toThrow(PolyVValidationError);
      await expect(checkinHandler.listSessions(options)).rejects.toThrow('channelId is required');
    });

    it('11.3-UNIT-030: should validate date range format (yyyy-MM-dd)', async () => {
      const options = {
        channelId: '3151318',
        startDate: '01-01-2024',
        endDate: '01-31-2024',
        output: 'table' as const
      };

      await expect(checkinHandler.listSessions(options)).rejects.toThrow(PolyVValidationError);
      await expect(checkinHandler.listSessions(options)).rejects.toThrow('Invalid date format');
    });

    it('11.3-UNIT-031: should validate date range is within 30 days', async () => {
      const options = {
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '2024-02-15',
        output: 'table' as const
      };

      await expect(checkinHandler.listSessions(options)).rejects.toThrow(PolyVValidationError);
      await expect(checkinHandler.listSessions(options)).rejects.toThrow('Date range cannot exceed 30 days');
    });

    it('11.3-UNIT-032: should output results in table format', async () => {
      const options: CheckinSessionsOptions = {
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        output: 'table'
      };

      mockCheckinService.listSessions.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [
          {
            checkinid: 'db14ef80-81b8-11eb-b114-e7477b',
            time: 1616150400000,
            timeFormat: '2021-03-19 12:00:00'
          }
        ]
      });

      await checkinHandler.listSessions(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Checkin ID')
      );
    });

    it('11.3-UNIT-033: should output results in JSON format', async () => {
      const options: CheckinSessionsOptions = {
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        output: 'json'
      };

      mockCheckinService.listSessions.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [
          {
            checkinid: 'db14ef80-81b8-11eb-b114-e7477b',
            time: 1616150400000,
            timeFormat: '2021-03-19 12:00:00'
          }
        ]
      });

      await checkinHandler.listSessions(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"checkinid"')
      );
    });

    it('11.3-UNIT-034: should handle API errors gracefully', async () => {
      const options: CheckinSessionsOptions = {
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        output: 'table'
      };

      const apiError = new PolyVError('API Error: Authentication failed', 'AUTH_ERROR', 401);
      mockCheckinService.listSessions.mockRejectedValue(apiError);

      await expect(checkinHandler.listSessions(options)).rejects.toThrow(PolyVError);
    });
  });

  // ============================================================
  // AC #8: Error handling tests
  // ============================================================
  describe('Error Handling (AC #8)', () => {
    it('11.3-UNIT-050: should validate missing channelId and throw PolyVValidationError', async () => {
      const options = {
        channelId: '',
        output: 'table' as const
      };

      await expect(checkinHandler.startCheckin(options)).rejects.toThrow(PolyVValidationError);
    });

    it('11.3-UNIT-051: should validate missing checkinId and throw PolyVValidationError', async () => {
      const options = {
        channelId: '3151318',
        checkinId: '',
        output: 'table' as const
      };

      await expect(checkinHandler.getCheckinResult(options)).rejects.toThrow(PolyVValidationError);
    });

    it('11.3-UNIT-052: should validate invalid date format and throw PolyVValidationError', async () => {
      const options = {
        channelId: '3151318',
        startDate: '01-01-2024',
        endDate: '01-31-2024',
        output: 'table' as const
      };

      await expect(checkinHandler.listSessions(options)).rejects.toThrow(PolyVValidationError);
    });

    it('11.3-UNIT-053: should validate date range exceeds 30 days and throw error', async () => {
      const options = {
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '2024-02-15',
        output: 'table' as const
      };

      await expect(checkinHandler.listSessions(options)).rejects.toThrow(PolyVValidationError);
    });

    it('11.3-UNIT-054: should handle API 401 error (authentication failed)', async () => {
      const options: CheckinStartOptions = {
        channelId: '3151318',
        output: 'table'
      };

      const apiError = new PolyVError('Request failed with status code 401', 'AUTH_ERROR', 401);
      mockCheckinService.startCheckin.mockRejectedValue(apiError);

      await expect(checkinHandler.startCheckin(options)).rejects.toThrow();
    });

    it('11.3-UNIT-055: should handle API 403 error (permission denied)', async () => {
      const options: CheckinStartOptions = {
        channelId: '3151318',
        output: 'table'
      };

      const apiError = new PolyVError('Request failed with status code 403', 'FORBIDDEN', 403);
      mockCheckinService.startCheckin.mockRejectedValue(apiError);

      await expect(checkinHandler.startCheckin(options)).rejects.toThrow();
    });

    it('11.3-UNIT-056: should handle API 404 error (resource not found)', async () => {
      const options: CheckinResultOptions = {
        channelId: '3151318',
        checkinId: 'nonexistent',
        output: 'table'
      };

      const apiError = new PolyVError('Request failed with status code 404', 'NOT_FOUND', 404);
      mockCheckinService.getCheckinResult.mockRejectedValue(apiError);

      await expect(checkinHandler.getCheckinResult(options)).rejects.toThrow();
    });

    it('11.3-UNIT-057: should handle API 500 error (internal server error)', async () => {
      const options: CheckinStartOptions = {
        channelId: '3151318',
        output: 'table'
      };

      const apiError = new PolyVError('Request failed with status code 500', 'SERVER_ERROR', 500);
      mockCheckinService.startCheckin.mockRejectedValue(apiError);

      await expect(checkinHandler.startCheckin(options)).rejects.toThrow();
    });

    it('11.3-UNIT-058: should handle network timeout errors', async () => {
      const options: CheckinStartOptions = {
        channelId: '3151318',
        output: 'table'
      };

      const apiError = new PolyVError('timeout of 30000ms exceeded', 'TIMEOUT', -1);
      mockCheckinService.startCheckin.mockRejectedValue(apiError);

      await expect(checkinHandler.startCheckin(options)).rejects.toThrow();
    });
  });
});
