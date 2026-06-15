/**
 * @fileoverview Unit tests for SessionHandler - ATDD Failing Tests (RED Phase)
 * @story 9.6: 场次管理命令
 *
 * These tests will FAIL until the feature is implemented (TDD red phase)
 *
 * Acceptance Criteria:
 * - AC1: listSessions() calls service with channelId parameter
 * - AC2: listSessions() passes pagination parameters to service
 * - AC3: listSessions() supports date range filtering
 * - AC4: getSession() calls service with channelId and sessionId
 * - AC5: Both methods support --output parameter (table/json)
 * - AC6: Table output formats session data correctly
 * - AC7: JSON output includes all API fields
 */

import { SessionHandler, ISessionService } from './session.handler';
import { AuthConfig } from '../types/auth';
import { SessionServiceConfig, SessionListOptions, SessionGetOptions } from '../types/session';

// Mock the SessionServiceSdk
jest.mock('../services/session.service.sdk', () => ({
  SessionServiceSdk: jest.fn().mockImplementation(() => ({
    getSessionList: jest.fn(),
    getSession: jest.fn(),
  })),
}));

describe('SessionHandler (Story 9.6 - ATDD RED Phase)', () => {
  let handler: SessionHandler;
  let mockSessionService: jest.Mocked<ISessionService>;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

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
    pageSize: 10,
    pageNumber: 1,
    totalItems: 2,
    totalPages: 1,
    contents: [
      {
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
      },
      {
        sessionId: 'k7d9f2h1l5',
        channelId: '2588188',
        name: '测试场次2',
        status: 'end',
        startTime: '2024-01-14 14:00',
        endTime: 1705216800000,
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
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock service
    mockSessionService = {
      getSessionList: jest.fn(),
      getSession: jest.fn(),
    };

    // Mock console methods
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

    // Create handler with injected mock service
    handler = new SessionHandler(mockAuthConfig, mockServiceConfig, mockSessionService);
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('constructor', () => {
    it('should create handler instance', () => {
      expect(handler).toBeInstanceOf(SessionHandler);
    });

    it('should use injected session service if provided', () => {
      expect(handler).toBeDefined();
    });

    it('should create default SessionServiceSdk if not provided', () => {
      const defaultHandler = new SessionHandler(mockAuthConfig, mockServiceConfig);
      expect(defaultHandler).toBeInstanceOf(SessionHandler);
    });
  });

  describe('listSessions', () => {
    it('AC1: should call service with channelId parameter', async () => {
      mockSessionService.getSessionList.mockResolvedValue(mockSessionListResponse);

      const options: SessionListOptions = {
        channelId: '2588188',
      };

      await handler.listSessions(options);

      expect(mockSessionService.getSessionList).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '2588188',
        })
      );
    });

    it('AC2: should pass pagination parameters to service', async () => {
      mockSessionService.getSessionList.mockResolvedValue(mockSessionListResponse);

      const options: SessionListOptions = {
        channelId: '2588188',
        page: 2,
        pageSize: 20,
      };

      await handler.listSessions(options);

      expect(mockSessionService.getSessionList).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '2588188',
          page: 2,
          pageSize: 20,
        })
      );
    });

    it('AC3: should pass date range parameters if provided', async () => {
      mockSessionService.getSessionList.mockResolvedValue(mockSessionListResponse);

      const options: SessionListOptions = {
        channelId: '2588188',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      await handler.listSessions(options);

      expect(mockSessionService.getSessionList).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        })
      );
    });

    it('AC5: should output in table format by default', async () => {
      mockSessionService.getSessionList.mockResolvedValue(mockSessionListResponse);

      await handler.listSessions({ channelId: '2588188' });

      // Verify table output was logged
      expect(mockConsoleLog).toHaveBeenCalled();
      const output = mockConsoleLog.mock.calls.map(call => call.join(' ')).join('\n');
      expect(output).toContain('场次ID');
      expect(output).toContain('e9s2h3jd8f');
      expect(output).toContain('测试场次1');
    });

    it('AC5: should output in JSON format when output=json', async () => {
      mockSessionService.getSessionList.mockResolvedValue(mockSessionListResponse);

      await handler.listSessions({ channelId: '2588188', output: 'json' });

      expect(mockConsoleLog).toHaveBeenCalled();
      const output = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed).toHaveProperty('contents');
      expect(parsed.contents).toHaveLength(2);
      expect(parsed.contents[0].sessionId).toBe('e9s2h3jd8f');
    });

    it('AC6: should display formatted table with session info', async () => {
      mockSessionService.getSessionList.mockResolvedValue(mockSessionListResponse);

      await handler.listSessions({ channelId: '2588188' });

      const output = mockConsoleLog.mock.calls.map(call => call.join(' ')).join('\n');

      // Check for table headers
      expect(output).toMatch(/场次ID|ID/i);

      // Check for session data
      expect(output).toContain('e9s2h3jd8f');
      expect(output).toContain('测试场次1');
      expect(output).toContain('已结束');
    });

    it('AC7: should include all fields in JSON output', async () => {
      mockSessionService.getSessionList.mockResolvedValue(mockSessionListResponse);

      await handler.listSessions({ channelId: '2588188', output: 'json' });

      const output = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(output);

      const firstSession = parsed.contents[0];
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

    it('should handle empty session list gracefully', async () => {
      mockSessionService.getSessionList.mockResolvedValue({
        pageSize: 10,
        pageNumber: 1,
        totalItems: 0,
        totalPages: 0,
        contents: [],
      });

      await handler.listSessions({ channelId: '2588188' });

      const output = mockConsoleLog.mock.calls.map(call => call.join(' ')).join('\n');
      expect(output).toMatch(/无场次|没有找到|0.*场次/i);
    });

    it('should display total count in output', async () => {
      mockSessionService.getSessionList.mockResolvedValue(mockSessionListResponse);

      await handler.listSessions({ channelId: '2588188' });

      const output = mockConsoleLog.mock.calls.map(call => call.join(' ')).join('\n');
      expect(output).toMatch(/共.*2.*场次|2.*个场次/i);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Network error');
      mockSessionService.getSessionList.mockRejectedValue(error);

      await handler.listSessions({ channelId: '2588188' });

      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe('getSession', () => {
    it('AC4: should call service with channelId and sessionId', async () => {
      mockSessionService.getSession.mockResolvedValue(mockSessionGetResponse);

      const options: SessionGetOptions = {
        channelId: '2588188',
        sessionId: 'e9s2h3jd8f',
      };

      await handler.getSession(options);

      expect(mockSessionService.getSession).toHaveBeenCalledWith('2588188', 'e9s2h3jd8f');
    });

    it('AC5: should output in table format by default', async () => {
      mockSessionService.getSession.mockResolvedValue(mockSessionGetResponse);

      await handler.getSession({
        channelId: '2588188',
        sessionId: 'e9s2h3jd8f',
      });

      expect(mockConsoleLog).toHaveBeenCalled();
      const output = mockConsoleLog.mock.calls.map(call => call.join(' ')).join('\n');
      expect(output).toContain('e9s2h3jd8f');
      expect(output).toContain('测试场次1');
    });

    it('AC5: should output in JSON format when output=json', async () => {
      mockSessionService.getSession.mockResolvedValue(mockSessionGetResponse);

      await handler.getSession({
        channelId: '2588188',
        sessionId: 'e9s2h3jd8f',
        output: 'json',
      });

      expect(mockConsoleLog).toHaveBeenCalled();
      const output = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed.sessionId).toBe('e9s2h3jd8f');
      expect(parsed.channelId).toBe('2588188');
      expect(parsed.name).toBe('测试场次1');
    });

    it('AC6: should display formatted table with session details', async () => {
      mockSessionService.getSession.mockResolvedValue(mockSessionGetResponse);

      await handler.getSession({
        channelId: '2588188',
        sessionId: 'e9s2h3jd8f',
      });

      const output = mockConsoleLog.mock.calls.map(call => call.join(' ')).join('\n');

      expect(output).toContain('场次详情');
      expect(output).toContain('2588188');
      expect(output).toContain('e9s2h3jd8f');
      expect(output).toContain('测试场次1');
      expect(output).toMatch(/已结束|end/i);
    });

    it('AC7: should include all fields in JSON output', async () => {
      mockSessionService.getSession.mockResolvedValue(mockSessionGetResponse);

      await handler.getSession({
        channelId: '2588188',
        sessionId: 'e9s2h3jd8f',
        output: 'json',
      });

      const output = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed).toHaveProperty('sessionId');
      expect(parsed).toHaveProperty('channelId');
      expect(parsed).toHaveProperty('name');
      expect(parsed).toHaveProperty('status');
      expect(parsed).toHaveProperty('startTime');
      expect(parsed).toHaveProperty('endTime');
      expect(parsed).toHaveProperty('watchUrl');
    });

    it('should handle session not found error', async () => {
      const error = new Error('Session not found');
      mockSessionService.getSession.mockRejectedValue(error);

      await handler.getSession({
        channelId: '2588188',
        sessionId: 'invalid-id',
      });

      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      mockSessionService.getSession.mockRejectedValue(error);

      await handler.getSession({
        channelId: '2588188',
        sessionId: 'e9s2h3jd8f',
      });

      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should display plan times if available', async () => {
      mockSessionService.getSession.mockResolvedValue(mockSessionGetResponse);

      await handler.getSession({
        channelId: '2588188',
        sessionId: 'e9s2h3jd8f',
      });

      const output = mockConsoleLog.mock.calls.map(call => call.join(' ')).join('\n');
      // Should show plan start/end times
      expect(output).toMatch(/计划|plan/i);
    });
  });

  describe('status mapping', () => {
    it('should map status "unStart" to Chinese "未开始"', async () => {
      mockSessionService.getSessionList.mockResolvedValue({
        ...mockSessionListResponse,
        contents: [
          {
            ...mockSessionListResponse.contents[0],
            status: 'unStart',
          },
        ],
      });

      await handler.listSessions({ channelId: '2588188' });

      const output = mockConsoleLog.mock.calls.map(call => call.join(' ')).join('\n');
      expect(output).toContain('未开始');
    });

    it('should map status "live" to Chinese "直播中"', async () => {
      mockSessionService.getSessionList.mockResolvedValue({
        ...mockSessionListResponse,
        contents: [
          {
            ...mockSessionListResponse.contents[0],
            status: 'live',
          },
        ],
      });

      await handler.listSessions({ channelId: '2588188' });

      const output = mockConsoleLog.mock.calls.map(call => call.join(' ')).join('\n');
      expect(output).toContain('直播中');
    });

    it('should map status "playback" to Chinese "回放中"', async () => {
      mockSessionService.getSessionList.mockResolvedValue({
        ...mockSessionListResponse,
        contents: [
          {
            ...mockSessionListResponse.contents[0],
            status: 'playback',
          },
        ],
      });

      await handler.listSessions({ channelId: '2588188' });

      const output = mockConsoleLog.mock.calls.map(call => call.join(' ')).join('\n');
      expect(output).toContain('回放中');
    });

    it('should map status "expired" to Chinese "已过期"', async () => {
      mockSessionService.getSessionList.mockResolvedValue({
        ...mockSessionListResponse,
        contents: [
          {
            ...mockSessionListResponse.contents[0],
            status: 'expired',
          },
        ],
      });

      await handler.listSessions({ channelId: '2588188' });

      const output = mockConsoleLog.mock.calls.map(call => call.join(' ')).join('\n');
      expect(output).toContain('已过期');
    });
  });

  describe('formatTime edge cases', () => {
    it('should handle numeric string timestamp in startTime', async () => {
      mockSessionService.getSessionList.mockResolvedValue({
        ...mockSessionListResponse,
        contents: [
          {
            ...mockSessionListResponse.contents[0],
            startTime: '1705285800000', // Numeric string
          },
        ],
      });

      await handler.listSessions({ channelId: '2588188' });

      const output = mockConsoleLog.mock.calls.map(call => call.join(' ')).join('\n');
      // Should parse and format the timestamp
      expect(output).toBeTruthy();
    });

    it('should handle non-numeric string timestamp in startTime', async () => {
      mockSessionService.getSessionList.mockResolvedValue({
        ...mockSessionListResponse,
        contents: [
          {
            ...mockSessionListResponse.contents[0],
            startTime: 'invalid-timestamp', // Non-numeric string
          },
        ],
      });

      await handler.listSessions({ channelId: '2588188' });

      const output = mockConsoleLog.mock.calls.map(call => call.join(' ')).join('\n');
      expect(output).toContain('invalid-timestamp');
    });

    it('should handle numeric timestamp in startTime', async () => {
      mockSessionService.getSessionList.mockResolvedValue({
        ...mockSessionListResponse,
        contents: [
          {
            ...mockSessionListResponse.contents[0],
            startTime: 1705285800000, // Number
          },
        ],
      });

      await handler.listSessions({ channelId: '2588188' });

      const output = mockConsoleLog.mock.calls.map(call => call.join(' ')).join('\n');
      expect(output).toBeTruthy();
    });

    it('should handle undefined startTime', async () => {
      mockSessionService.getSessionList.mockResolvedValue({
        ...mockSessionListResponse,
        contents: [
          {
            ...mockSessionListResponse.contents[0],
            startTime: undefined,
          },
        ],
      });

      await handler.listSessions({ channelId: '2588188' });

      const output = mockConsoleLog.mock.calls.map(call => call.join(' ')).join('\n');
      expect(output).toContain('-');
    });
  });
});
