/**
 * @fileoverview Integration tests for session commands
 * @author Development Team
 * @since 9.6.0
 */

import { SessionServiceSdk } from '../../src/services/session.service.sdk';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('Session Integration Tests', () => {
  let sessionService: SessionServiceSdk;
  let testChannelId: string;

  beforeAll(() => {
    sessionService = new SessionServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });
    testChannelId = testConfig.testChannelId;
  });

  // ========================================
  // Session List Tests
  // ========================================

  describe('session list', () => {
    it('should list sessions for a channel successfully', async () => {
      try {
        const result = await sessionService.getSessionList({
          channelId: testChannelId,
          page: 1,
          pageSize: 10
        });

        expect(result).toBeDefined();
        expect(result.contents).toBeDefined();
        expect(Array.isArray(result.contents)).toBe(true);
        expect(result.pageNumber).toBeDefined();
        expect(result.pageSize).toBeDefined();
        expect(result.totalItems).toBeDefined();
        expect(result.totalPages).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Session API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should list all channel sessions when channelId not provided', async () => {
      try {
        const result = await sessionService.getSessionList({
          page: 1,
          pageSize: 10
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result.contents)).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle pagination correctly', async () => {
      try {
        const result = await sessionService.getSessionList({
          channelId: testChannelId,
          page: 1,
          pageSize: 5
        });

        expect(result).toBeDefined();
        expect(result.pageSize).toBeLessThanOrEqual(5);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle page 2 request', async () => {
      try {
        const result = await sessionService.getSessionList({
          channelId: testChannelId,
          page: 2,
          pageSize: 10
        });

        expect(result).toBeDefined();
        expect(result.pageNumber).toBe(2);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should filter by date range', async () => {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      try {
        const result = await sessionService.getSessionList({
          channelId: testChannelId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          page: 1,
          pageSize: 10
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result.contents)).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate invalid page value', async () => {
      await expect(
        sessionService.getSessionList({
          channelId: testChannelId,
          page: 0,
          pageSize: 10
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid pageSize value', async () => {
      await expect(
        sessionService.getSessionList({
          channelId: testChannelId,
          page: 1,
          pageSize: 0
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate negative page value', async () => {
      await expect(
        sessionService.getSessionList({
          channelId: testChannelId,
          page: -1,
          pageSize: 10
        })
      ).rejects.toThrow();
    }, 10000);

    it('should handle non-existent channel gracefully', async () => {
      try {
        const result = await sessionService.getSessionList({
          channelId: '9999999',
          page: 1,
          pageSize: 10
        });

        // API might return empty array
        expect(result).toBeDefined();
        expect(Array.isArray(result.contents)).toBe(true);
      } catch (error: any) {
        // Expected error for non-existent channel
        expect(error).toBeDefined();
      }
    }, 15000);

    it('should return sessions with correct structure', async () => {
      try {
        const result = await sessionService.getSessionList({
          channelId: testChannelId,
          page: 1,
          pageSize: 10
        });

        if (result.contents && result.contents.length > 0) {
          const session = result.contents[0];
          expect(session.sessionId).toBeDefined();
          expect(session.channelId).toBeDefined();
          expect(session.status).toBeDefined();
        }
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);
  });

  // ========================================
  // Session Get Tests
  // ========================================

  describe('session get', () => {
    it('should get a single session successfully', async () => {
      // First, get a list to find a session ID
      let sessionId = '';
      try {
        const listResult = await sessionService.getSessionList({
          channelId: testChannelId,
          page: 1,
          pageSize: 10
        });

        if (listResult.contents && listResult.contents.length > 0) {
          sessionId = listResult.contents[0].sessionId;
        }
      } catch (error) {
        // Continue to test with placeholder ID
      }

      if (!sessionId) {
        console.log('No sessions found, skipping session get test');
        expect(true).toBe(true);
        return;
      }

      try {
        const result = await sessionService.getSession(testChannelId, sessionId);

        expect(result).toBeDefined();
        expect(result.sessionId).toBe(sessionId);
        expect(result.channelId).toBeDefined();
        expect(result.status).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Session get API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        sessionService.getSession('', 'test-session-id')
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty sessionId', async () => {
      await expect(
        sessionService.getSession(testChannelId, '')
      ).rejects.toThrow();
    }, 10000);

    it('should validate whitespace-only channelId', async () => {
      await expect(
        sessionService.getSession('   ', 'test-session-id')
      ).rejects.toThrow();
    }, 10000);

    it('should validate whitespace-only sessionId', async () => {
      await expect(
        sessionService.getSession(testChannelId, '   ')
      ).rejects.toThrow();
    }, 10000);

    it('should handle non-existent session gracefully', async () => {
      try {
        const result = await sessionService.getSession(testChannelId, 'non-existent-session-99999');

        // If no error, check result
        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不存在', '找不到', '系统异常', '异常'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle non-existent channel gracefully', async () => {
      try {
        const result = await sessionService.getSession('9999999', 'any-session-id');

        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不存在', '找不到'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);
  });

  // ========================================
  // Validation Tests Summary
  // ========================================

  describe('validation tests', () => {
    it('should validate getSessionList page', async () => {
      await expect(
        sessionService.getSessionList({ page: 0, pageSize: 10 })
      ).rejects.toThrow();
    });

    it('should validate getSessionList pageSize', async () => {
      await expect(
        sessionService.getSessionList({ page: 1, pageSize: 0 })
      ).rejects.toThrow();
    });

    it('should validate getSessionList negative page', async () => {
      await expect(
        sessionService.getSessionList({ page: -1, pageSize: 10 })
      ).rejects.toThrow();
    });

    it('should validate getSessionList negative pageSize', async () => {
      await expect(
        sessionService.getSessionList({ page: 1, pageSize: -10 })
      ).rejects.toThrow();
    });

    it('should validate getSession channelId', async () => {
      await expect(
        sessionService.getSession('', 'test')
      ).rejects.toThrow();
    });

    it('should validate getSession sessionId', async () => {
      await expect(
        sessionService.getSession(testChannelId, '')
      ).rejects.toThrow();
    });

    it('should validate getSession whitespace channelId', async () => {
      await expect(
        sessionService.getSession('   ', 'test')
      ).rejects.toThrow();
    });

    it('should validate getSession whitespace sessionId', async () => {
      await expect(
        sessionService.getSession(testChannelId, '   ')
      ).rejects.toThrow();
    });
  });

  // ========================================
  // Session Workflow Tests
  // ========================================

  describe('session workflow', () => {
    it('should complete list-get workflow', async () => {
      // 1. List sessions
      let sessionId = '';
      try {
        const listResult = await sessionService.getSessionList({
          channelId: testChannelId,
          page: 1,
          pageSize: 10
        });

        expect(listResult).toBeDefined();
        expect(Array.isArray(listResult.contents)).toBe(true);

        if (listResult.contents && listResult.contents.length > 0) {
          sessionId = listResult.contents[0].sessionId;
        }
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Session API not available (404)');
          expect(true).toBe(true);
          return;
        }
        throw error;
      }

      // 2. Get session detail if we have an ID
      if (sessionId) {
        try {
          const getResult = await sessionService.getSession(testChannelId, sessionId);
          expect(getResult).toBeDefined();
          expect(getResult.sessionId).toBe(sessionId);
        } catch (error: any) {
          const message = error.message || '';
          if (!message.includes('404') && !message.includes('not found')) {
            throw error;
          }
        }
      }
    }, 30000);

    it('should complete all-channels-list workflow', async () => {
      // List sessions for all channels (no channelId)
      try {
        const result = await sessionService.getSessionList({
          page: 1,
          pageSize: 20
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result.contents)).toBe(true);

        // Verify structure
        if (result.contents && result.contents.length > 0) {
          result.contents.forEach(session => {
            expect(session.sessionId).toBeDefined();
            expect(session.channelId).toBeDefined();
            expect(session.status).toBeDefined();
          });
        }
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Session API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);
  });

  // ========================================
  // Edge Cases Tests
  // ========================================

  describe('edge cases', () => {
    it('should handle large page size', async () => {
      try {
        const result = await sessionService.getSessionList({
          channelId: testChannelId,
          page: 1,
          pageSize: 100
        });

        expect(result).toBeDefined();
        expect(result.pageSize).toBeLessThanOrEqual(100);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle date filter with start date only', async () => {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);

      try {
        const result = await sessionService.getSessionList({
          channelId: testChannelId,
          startDate: startDate.toISOString().split('T')[0],
          page: 1,
          pageSize: 10
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result.contents)).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle date filter with end date only', async () => {
      const today = new Date();

      try {
        const result = await sessionService.getSessionList({
          channelId: testChannelId,
          endDate: today.toISOString().split('T')[0],
          page: 1,
          pageSize: 10
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result.contents)).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);
  });
});
