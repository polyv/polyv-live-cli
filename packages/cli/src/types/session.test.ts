/**
 * @fileoverview Unit tests for session type definitions - ATDD Failing Tests (RED Phase)
 * @story 9.6: 场次管理命令
 *
 * These tests will FAIL until the types are defined (TDD red phase)
 *
 * Acceptance Criteria:
 * - AC1-7: Type definitions support all required session command parameters and response fields
 */

import {
  SessionServiceConfig,
  SessionListOptions,
  SessionGetOptions,
  SessionDisplayItem,
} from './session';

describe('Session Types (Story 9.6 - ATDD RED Phase)', () => {
  describe('SessionServiceConfig', () => {
    it('should define config with baseUrl, timeout, and debug fields', () => {
      const config: SessionServiceConfig = {
        baseUrl: 'https://api.polyv.net',
        timeout: 30000,
        debug: false,
      };

      expect(config.baseUrl).toBe('https://api.polyv.net');
      expect(config.timeout).toBe(30000);
      expect(config.debug).toBe(false);
    });

    it('should accept custom baseUrl', () => {
      const config: SessionServiceConfig = {
        baseUrl: 'https://custom.api.com',
        timeout: 5000,
        debug: true,
      };

      expect(config.baseUrl).toBe('https://custom.api.com');
      expect(config.debug).toBe(true);
    });
  });

  describe('SessionListOptions', () => {
    it('should support all optional parameters for list command', () => {
      const options: SessionListOptions = {
        channelId: '2588188',
        page: 1,
        pageSize: 20,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        output: 'table',
      };

      expect(options.channelId).toBe('2588188');
      expect(options.page).toBe(1);
      expect(options.pageSize).toBe(20);
      expect(options.startDate).toBe('2024-01-01');
      expect(options.endDate).toBe('2024-01-31');
      expect(options.output).toBe('table');
    });

    it('should allow empty options (all fields optional)', () => {
      const options: SessionListOptions = {};

      expect(options.channelId).toBeUndefined();
      expect(options.page).toBeUndefined();
      expect(options.pageSize).toBeUndefined();
      expect(options.output).toBeUndefined();
    });

    it('should support json output format', () => {
      const options: SessionListOptions = {
        output: 'json',
      };

      expect(options.output).toBe('json');
    });

    it('should accept only pagination parameters', () => {
      const options: SessionListOptions = {
        page: 2,
        pageSize: 50,
      };

      expect(options.page).toBe(2);
      expect(options.pageSize).toBe(50);
      expect(options.channelId).toBeUndefined();
    });
  });

  describe('SessionGetOptions', () => {
    it('should require channelId and sessionId', () => {
      const options: SessionGetOptions = {
        channelId: '2588188',
        sessionId: 'e9s2h3jd8f',
      };

      expect(options.channelId).toBe('2588188');
      expect(options.sessionId).toBe('e9s2h3jd8f');
    });

    it('should support optional output parameter', () => {
      const options: SessionGetOptions = {
        channelId: '2588188',
        sessionId: 'e9s2h3jd8f',
        output: 'json',
      };

      expect(options.output).toBe('json');
    });

    it('should default to undefined output if not specified', () => {
      const options: SessionGetOptions = {
        channelId: '2588188',
        sessionId: 'e9s2h3jd8f',
      };

      expect(options.output).toBeUndefined();
    });
  });

  describe('SessionDisplayItem', () => {
    it('should define all session display fields', () => {
      const item: SessionDisplayItem = {
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
      };

      expect(item.sessionId).toBe('e9s2h3jd8f');
      expect(item.channelId).toBe('2588188');
      expect(item.name).toBe('测试场次1');
      expect(item.status).toBe('end');
      expect(item.startTime).toBe('2024-01-15 10:30');
      expect(item.endTime).toBe(1705292400000);
      expect(item.createdTime).toBe(1705285800000);
      expect(item.planStartTime).toBe(1705284000000);
      expect(item.planEndTime).toBe(1705291200000);
      expect(item.streamType).toBe('client');
      expect(item.pushClient).toBe('web');
      expect(item.watchUrl).toBe('https://live.polyv.net/2588188/e9s2h3jd8f');
      expect(item.userId).toBe('test-user');
      expect(item.splashImg).toBe('https://example.com/cover.jpg');
      expect(item.splashLargeImg).toBe('https://example.com/cover-large.jpg');
    });

    it('should allow optional fields to be undefined', () => {
      const item: SessionDisplayItem = {
        sessionId: 'e9s2h3jd8f',
        channelId: '2588188',
        status: 'live',
      };

      expect(item.sessionId).toBe('e9s2h3jd8f');
      expect(item.channelId).toBe('2588188');
      expect(item.status).toBe('live');
      expect(item.name).toBeUndefined();
      expect(item.startTime).toBeUndefined();
      expect(item.endTime).toBeUndefined();
    });

    it('should support different session statuses', () => {
      const statuses: Array<SessionDisplayItem['status']> = [
        'unStart',
        'live',
        'end',
        'playback',
        'expired',
      ];

      statuses.forEach((status) => {
        const item: SessionDisplayItem = {
          sessionId: 'test-id',
          channelId: '123',
          status: status,
        };
        expect(item.status).toBe(status);
      });
    });
  });
});
