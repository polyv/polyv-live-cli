/**
 * @fileoverview Integration tests for CheckinServiceSdk
 * @author Development Team
 * @since 11.3.0
 */

import { CheckinServiceSdk } from './checkin-service';
import { PolyVClient } from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import { PolyVError } from '../utils/errors';

// Mock PolyVClient
jest.mock('polyv-live-api-sdk');
const MockedPolyVClient = PolyVClient as jest.MockedClass<typeof PolyVClient>;

describe('CheckinServiceSdk', () => {
  let checkinService: CheckinServiceSdk;
  let mockAuthConfig: AuthConfig;
  let mockPolyVClient: jest.Mocked<PolyVClient>;
  let mockV4ChatService: any;
  let mockLiveInteractionService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id'
    };

    // Create mock services
    mockV4ChatService = {
      batchCheckin: jest.fn()
    };

    mockLiveInteractionService = {
      getCheckinList: jest.fn(),
      getCheckinByCheckinId: jest.fn(),
      getCheckinByTime: jest.fn()
    };

    // Create mock PolyVClient
    mockPolyVClient = {
      v4Chat: mockV4ChatService,
      liveInteraction: mockLiveInteractionService
    } as any;

    MockedPolyVClient.mockImplementation(() => mockPolyVClient);

    checkinService = new CheckinServiceSdk(mockAuthConfig);
  });

  // ============================================================
  // AC #7: SDK Integration Tests
  // ============================================================
  describe('11.3-INT-001: should call v4Chat.batchCheckin with correct parameters', () => {
    it('should call batchCheckin with items array containing channel IDs and options', async () => {
      mockV4ChatService.batchCheckin.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          checkinId: 'db14ef80-81b8-11eb-b114-e7477b'
        }
      });

      await checkinService.startCheckin({
        channelId: '3151318',
        limitTime: 30
      });

      expect(mockV4ChatService.batchCheckin).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              channelId: '3151318',
              limitTime: 30
            })
          ])
        })
      );
    });
  });

  describe('11.3-INT-002: should call liveInteraction.getCheckinList with correct parameters', () => {
    it('should call getCheckinList with channelId and pagination', async () => {
      const params = {
        channelId: '3151318',
        page: 1,
        pageSize: 20
      };

      mockLiveInteractionService.getCheckinList.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [],
          count: 0
        }
      });

      await checkinService.listCheckins(params);

      expect(mockLiveInteractionService.getCheckinList).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          page: 1,
          pageSize: 20
        })
      );
    });
  });

  describe('11.3-INT-003: should call liveInteraction.getCheckinByCheckinId with correct parameters', () => {
    it('should call getCheckinByCheckinId with channelId and checkinId', async () => {
      const params = {
        channelId: '3151318',
        checkinId: 'db14ef80-81b8-11eb-b114-e7477b'
      };

      mockLiveInteractionService.getCheckinByCheckinId.mockResolvedValue({
        code: 200,
        status: 'success',
        data: []
      });

      await checkinService.getCheckinResult(params);

      expect(mockLiveInteractionService.getCheckinByCheckinId).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          checkinId: 'db14ef80-81b8-11eb-b114-e7477b'
        })
      );
    });
  });

  describe('11.3-INT-004: should call liveInteraction.getCheckinByTime with correct parameters', () => {
    it('should call getCheckinByTime with channelId and date range', async () => {
      const params = {
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      mockLiveInteractionService.getCheckinByTime.mockResolvedValue({
        code: 200,
        status: 'success',
        data: []
      });

      await checkinService.listSessions(params);

      expect(mockLiveInteractionService.getCheckinByTime).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
      );
    });
  });

  describe('11.3-INT-005: should handle SDK errors and rethrow with friendly messages', () => {
    it('should wrap SDK errors with PolyVError', async () => {
      const sdkError = new Error('Network error');
      mockV4ChatService.batchCheckin.mockRejectedValue(sdkError);

      await expect(
        checkinService.startCheckin({
          channelId: '3151318'
        })
      ).rejects.toThrow(PolyVError);
    });

    it('should preserve error message from SDK', async () => {
      const sdkError = new Error('Authentication failed');
      mockV4ChatService.batchCheckin.mockRejectedValue(sdkError);

      await expect(
        checkinService.startCheckin({
          channelId: '3151318'
        })
      ).rejects.toThrow('Authentication failed');
    });
  });

  describe('11.3-INT-006: should transform SDK response to CLI format', () => {
    it('should return SDK response as-is for CLI consumption', async () => {
      const sdkResponse = {
        code: 200,
        status: 'success',
        data: {
          checkinId: 'db14ef80-81b8-11eb-b114-e7477b'
        }
      };

      mockV4ChatService.batchCheckin.mockResolvedValue(sdkResponse);

      const result = await checkinService.startCheckin({
        channelId: '3151318'
      });

      expect(result).toEqual(sdkResponse);
    });
  });

  // ============================================================
  // Constructor Tests
  // ============================================================
  describe('constructor', () => {
    it('should create PolyVClient with auth config', () => {
      expect(MockedPolyVClient).toHaveBeenCalledWith(mockAuthConfig);
    });

    it('should expose v4Chat service', () => {
      expect(checkinService.v4Chat).toBeDefined();
    });

    it('should expose liveInteraction service', () => {
      expect(checkinService.liveInteraction).toBeDefined();
    });
  });

  // ============================================================
  // Additional Integration Tests
  // ============================================================
  describe('startCheckin', () => {
    it('should convert force flag to boolean format for SDK', async () => {
      mockV4ChatService.batchCheckin.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          checkinId: 'test-id'
        }
      });

      await checkinService.startCheckin({
        channelId: '3151318',
        forceCheckInEnabled: 'Y'
      });

      expect(mockV4ChatService.batchCheckin).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              forceCheckInEnabled: true
            })
          ])
        })
      );
    });

    it('should handle multiple channel IDs', async () => {
      mockV4ChatService.batchCheckin.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          checkinId: 'test-id'
        }
      });

      await checkinService.startCheckin({
        channelId: '3151318,3151319'
      });

      expect(mockV4ChatService.batchCheckin).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [
            expect.objectContaining({ channelId: '3151318' }),
            expect.objectContaining({ channelId: '3151319' })
          ]
        })
      );
    });
  });

  describe('listCheckins', () => {
    it('should handle date filter parameter', async () => {
      mockLiveInteractionService.getCheckinList.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [],
          count: 0
        }
      });

      await checkinService.listCheckins({
        channelId: '3151318',
        date: '2024-01-15'
      });

      expect(mockLiveInteractionService.getCheckinList).toHaveBeenCalledWith(
        expect.objectContaining({
          date: '2024-01-15'
        })
      );
    });

    it('should handle sessionId filter parameter', async () => {
      mockLiveInteractionService.getCheckinList.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [],
          count: 0
        }
      });

      await checkinService.listCheckins({
        channelId: '3151318',
        sessionId: 'fwly13xczv'
      });

      expect(mockLiveInteractionService.getCheckinList).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'fwly13xczv'
        })
      );
    });
  });

  describe('getCheckinResult', () => {
    it('should return array of checkin records', async () => {
      const mockData = [
        {
          userid: 'user123',
          nickname: 'User1',
          checked: 'Y',
          time: 1616150400000,
          timeFormat: '2021-03-19 12:00:00'
        }
      ];

      mockLiveInteractionService.getCheckinByCheckinId.mockResolvedValue({
        code: 200,
        status: 'success',
        data: mockData
      });

      const result = await checkinService.getCheckinResult({
        channelId: '3151318',
        checkinId: 'test-id'
      });

      expect(result.data).toEqual(mockData);
    });
  });

  describe('listSessions', () => {
    it('should return array of checkin sessions', async () => {
      const mockData = [
        {
          checkinid: 'db14ef80-81b8-11eb-b114-e7477b',
          time: 1616150400000,
          timeFormat: '2021-03-19 12:00:00'
        }
      ];

      mockLiveInteractionService.getCheckinByTime.mockResolvedValue({
        code: 200,
        status: 'success',
        data: mockData
      });

      const result = await checkinService.listSessions({
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      });

      expect(result.data).toEqual(mockData);
    });
  });
});
