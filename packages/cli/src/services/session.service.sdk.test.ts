/**
 * @fileoverview Unit tests for SessionServiceSdk - ATDD Failing Tests (RED Phase)
 * @story 9.6: 场次管理命令
 *
 * These tests will FAIL until the feature is implemented (TDD red phase)
 *
 * Acceptance Criteria:
 * - AC1: getSessionList() calls SDK client.v4Channel.sessionList() with channelId
 * - AC2: getSessionList() passes pagination parameters correctly
 * - AC3: getSessionList() maps response to SessionDisplayItem[] format
 * - AC4: getSession() calls SDK client.v4Channel.sessionGet() with channelId and sessionId
 * - AC7: Service returns complete API response fields
 */

import { SessionServiceSdk } from './session.service.sdk';
import { AuthConfig } from '../types/auth';
import { SessionServiceConfig, SessionListOptions } from '../types/session';

// Mock the internal SDK module
jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

import { createSdkClient } from '../sdk';

describe('SessionServiceSdk (Story 9.6 - ATDD RED Phase)', () => {
  let service: SessionServiceSdk;
  let mockClient: any;
  let mockV4Channel: any;

  const mockAuthConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
  };

  const mockServiceConfig: SessionServiceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };

  const mockSessionListResponse = {
    pageNumber: 1,
    pageSize: 10,
    totalItems: 2,
    totalPages: 1,
    contents: [
      {
        channelId: 2588188,
        sessionId: 'e9s2h3jd8f',
        name: '测试场次1',
        startTime: '2024-01-15 10:30',
        endTime: 1705292400000,
        status: 'end',
        createdTime: 1705285800000,
        planStartTime: 1705284000000,
        planEndTime: 1705291200000,
        streamType: 'client',
        pushClient: 'web',
        watchUrl: 'https://live.polyv.net/2588188/e9s2h3jd8f',
        userId: 'test-user',
        splashImg: 'https://example.com/cover.jpg',
        splashLargeImg: 'https://example.com/cover-large.jpg',
      },
      {
        channelId: 2588188,
        sessionId: 'k7d9f2h1l5',
        name: '测试场次2',
        startTime: '2024-01-14 14:00',
        endTime: 1705216800000,
        status: 'end',
        createdTime: 1705208400000,
        planStartTime: 1705204800000,
        planEndTime: 1705219200000,
        streamType: 'client',
        pushClient: 'obs',
        watchUrl: 'https://live.polyv.net/2588188/k7d9f2h1l5',
        userId: 'test-user',
      },
    ],
  };

  const mockSessionGetResponse = {
    channelId: 2588188,
    sessionId: 'e9s2h3jd8f',
    name: '测试场次1',
    status: 'end',
    startTime: '2024-01-15 10:30',
    endTime: 1705292400000,
    createdTime: 1705285800000,
    planStartTime: 1705284000000,
    planEndTime: 1705291200000,
    streamType: 'client',
    pushClient: 'web',
    watchUrl: 'https://live.polyv.net/2588188/e9s2h3jd8f',
    userId: 'test-user',
    splashImg: 'https://example.com/cover.jpg',
    splashLargeImg: 'https://example.com/cover-large.jpg',
    diskVideoVO: null,
    interactionScriptVO: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create fresh mock client
    mockV4Channel = {
      sessionList: jest.fn(),
      sessionGet: jest.fn(),
    };

    mockClient = {
      v4Channel: mockV4Channel,
    };

    // Mock createSdkClient to return our mock
    (createSdkClient as jest.Mock).mockReturnValue(mockClient);

    service = new SessionServiceSdk(mockAuthConfig, mockServiceConfig);
  });

  describe('constructor', () => {
    it('should create service instance with auth and service config', () => {
      expect(service).toBeInstanceOf(SessionServiceSdk);
    });
  });

  describe('getSessionList', () => {
    it('AC1: should call SDK sessionList with channelId parameter', async () => {
      mockV4Channel.sessionList.mockResolvedValue(mockSessionListResponse);

      const options: SessionListOptions = {
        channelId: '2588188',
      };

      await service.getSessionList(options);

      expect(mockV4Channel.sessionList).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: 2588188,
        })
      );
    });

    it('AC2: should pass pagination parameters to SDK', async () => {
      mockV4Channel.sessionList.mockResolvedValue(mockSessionListResponse);

      const options: SessionListOptions = {
        channelId: '2588188',
        page: 2,
        pageSize: 20,
      };

      await service.getSessionList(options);

      expect(mockV4Channel.sessionList).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: 2588188,
          pageNumber: 2,
          pageSize: 20,
        })
      );
    });

    it('AC3: should map SDK response to SessionDisplayItem[] format', async () => {
      mockV4Channel.sessionList.mockResolvedValue(mockSessionListResponse);

      const result = await service.getSessionList({ channelId: '2588188' });

      expect(result).toHaveProperty('contents');
      expect(result.contents).toHaveLength(2);
      expect(result.contents[0]).toEqual({
        sessionId: 'e9s2h3jd8f',
        channelId: '2588188',
        name: '测试场次1',
        status: 'end',
        startTime: '2024-01-15 10:30',
        endTime: 1705292400000,
        createdTime: 1705285800000,
        planStartTime: 1705284000000,
        planEndTime: 1705291200000,
        streamType: 'client',
        pushClient: 'web',
        watchUrl: 'https://live.polyv.net/2588188/e9s2h3jd8f',
        userId: 'test-user',
        splashImg: 'https://example.com/cover.jpg',
        splashLargeImg: 'https://example.com/cover-large.jpg',
      });
    });

    it('AC3: should include pagination metadata in response', async () => {
      mockV4Channel.sessionList.mockResolvedValue(mockSessionListResponse);

      const result = await service.getSessionList({ channelId: '2588188' });

      expect(result.pageNumber).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalItems).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    it('AC7: should include all API fields in response', async () => {
      mockV4Channel.sessionList.mockResolvedValue(mockSessionListResponse);

      const result = await service.getSessionList({ channelId: '2588188' });

      const firstSession = result.contents[0];
      expect(firstSession).toHaveProperty('sessionId');
      expect(firstSession).toHaveProperty('channelId');
      expect(firstSession).toHaveProperty('name');
      expect(firstSession).toHaveProperty('status');
      expect(firstSession).toHaveProperty('startTime');
      expect(firstSession).toHaveProperty('endTime');
      expect(firstSession).toHaveProperty('createdTime');
      expect(firstSession).toHaveProperty('planStartTime');
      expect(firstSession).toHaveProperty('planEndTime');
      expect(firstSession).toHaveProperty('streamType');
      expect(firstSession).toHaveProperty('pushClient');
      expect(firstSession).toHaveProperty('watchUrl');
      expect(firstSession).toHaveProperty('userId');
    });

    it('should handle empty session list', async () => {
      mockV4Channel.sessionList.mockResolvedValue({
        pageNumber: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
        contents: [],
      });

      const result = await service.getSessionList({ channelId: '2588188' });

      expect(result.contents).toHaveLength(0);
      expect(result.totalItems).toBe(0);
    });

    it('should convert channelId string to number for SDK', async () => {
      mockV4Channel.sessionList.mockResolvedValue(mockSessionListResponse);

      await service.getSessionList({ channelId: '12345' });

      expect(mockV4Channel.sessionList).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: 12345,
        })
      );
    });

    it('should call SDK without channelId if not provided', async () => {
      mockV4Channel.sessionList.mockResolvedValue(mockSessionListResponse);

      await service.getSessionList({});

      expect(mockV4Channel.sessionList).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: undefined,
        })
      );
    });
  });

  describe('getSession', () => {
    it('AC4: should call SDK sessionGet with channelId and sessionId', async () => {
      mockV4Channel.sessionGet.mockResolvedValue(mockSessionGetResponse);

      await service.getSession('2588188', 'e9s2h3jd8f');

      expect(mockV4Channel.sessionGet).toHaveBeenCalledWith({
        channelId: 2588188,
        sessionId: 'e9s2h3jd8f',
      });
    });

    it('AC7: should return complete session details', async () => {
      mockV4Channel.sessionGet.mockResolvedValue(mockSessionGetResponse);

      const result = await service.getSession('2588188', 'e9s2h3jd8f');

      expect(result).toEqual({
        sessionId: 'e9s2h3jd8f',
        channelId: '2588188',
        name: '测试场次1',
        status: 'end',
        startTime: '2024-01-15 10:30',
        endTime: 1705292400000,
        createdTime: 1705285800000,
        planStartTime: 1705284000000,
        planEndTime: 1705291200000,
        streamType: 'client',
        pushClient: 'web',
        watchUrl: 'https://live.polyv.net/2588188/e9s2h3jd8f',
        userId: 'test-user',
        splashImg: 'https://example.com/cover.jpg',
        splashLargeImg: 'https://example.com/cover-large.jpg',
      });
    });

    it('should convert channelId string to number for SDK', async () => {
      mockV4Channel.sessionGet.mockResolvedValue(mockSessionGetResponse);

      await service.getSession('99999', 'test-session-id');

      expect(mockV4Channel.sessionGet).toHaveBeenCalledWith({
        channelId: 99999,
        sessionId: 'test-session-id',
      });
    });

    it('should include optional fields if present', async () => {
      mockV4Channel.sessionGet.mockResolvedValue({
        ...mockSessionGetResponse,
        splashImg: 'https://example.com/custom-cover.jpg',
      });

      const result = await service.getSession('2588188', 'e9s2h3jd8f');

      expect(result.splashImg).toBe('https://example.com/custom-cover.jpg');
    });
  });

  describe('error handling', () => {
    it('should propagate SDK errors for sessionList', async () => {
      const error = new Error('Network error');
      mockV4Channel.sessionList.mockRejectedValue(error);

      await expect(service.getSessionList({ channelId: '2588188' })).rejects.toThrow('Network error');
    });

    it('should propagate SDK errors for sessionGet', async () => {
      const error = new Error('Session not found');
      mockV4Channel.sessionGet.mockRejectedValue(error);

      await expect(service.getSession('2588188', 'invalid-id')).rejects.toThrow('Session not found');
    });
  });

  describe('validation errors', () => {
    it('should throw validation error for invalid page parameter', async () => {
      await expect(service.getSessionList({ channelId: '2588188', page: -1 }))
        .rejects.toThrow('page must be a positive integer');
    });

    it('should throw validation error for invalid pageSize parameter', async () => {
      await expect(service.getSessionList({ channelId: '2588188', pageSize: 0 }))
        .rejects.toThrow('pageSize must be a positive integer');
    });

    it('should throw validation error for non-integer page', async () => {
      await expect(service.getSessionList({ channelId: '2588188', page: 1.5 }))
        .rejects.toThrow('page must be a positive integer');
    });

    it('should throw validation error for non-integer pageSize', async () => {
      await expect(service.getSessionList({ channelId: '2588188', pageSize: 10.5 }))
        .rejects.toThrow('pageSize must be a positive integer');
    });

    it('should throw validation error for whitespace-only channelId in getSessionList', async () => {
      await expect(service.getSessionList({ channelId: '   ' }))
        .rejects.toThrow('channelId must be a non-empty string if provided');
    });

    it('should throw validation error for empty channelId in getSession', async () => {
      await expect(service.getSession('', 'session-id'))
        .rejects.toThrow('channelId is required and must be a non-empty string');
    });

    it('should throw validation error for whitespace-only channelId in getSession', async () => {
      await expect(service.getSession('   ', 'session-id'))
        .rejects.toThrow('channelId is required and must be a non-empty string');
    });

    it('should throw validation error for empty sessionId in getSession', async () => {
      await expect(service.getSession('2588188', ''))
        .rejects.toThrow('sessionId is required and must be a non-empty string');
    });

    it('should throw validation error for whitespace-only sessionId in getSession', async () => {
      await expect(service.getSession('2588188', '   '))
        .rejects.toThrow('sessionId is required and must be a non-empty string');
    });

    it('should throw validation error for multiple invalid parameters in getSessionList', async () => {
      await expect(service.getSessionList({ page: -1, pageSize: 0 }))
        .rejects.toThrow('validation failed');
    });

    it('should throw validation error for multiple invalid parameters in getSession', async () => {
      await expect(service.getSession('', ''))
        .rejects.toThrow('validation failed');
    });
  });
});
