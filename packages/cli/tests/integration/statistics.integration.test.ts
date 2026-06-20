/**
 * @fileoverview Integration tests for statistics commands
 * @author Development Team
 * @since 10.1.0
 */

import { StatisticsServiceSdk } from '../../src/services/statistics.service.sdk';
import { ChannelServiceSdk } from '../../src/services/channel.service.sdk';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

// Helper functions
function getDateString(daysOffset: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0]; // yyyy-MM-dd
}

function getTimestamp(daysOffset: number = 0): number {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function getDateTimeString(daysOffset: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().replace('T', ' ').substring(0, 19); // yyyy-MM-dd HH:mm:ss
}

(shouldRunTests ? describe : describe.skip)('Statistics Integration Tests', () => {
  let statisticsService: StatisticsServiceSdk;
  let channelService: ChannelServiceSdk;
  let testChannelId: string;

  beforeAll(async () => {
    statisticsService = new StatisticsServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });
    channelService = new ChannelServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false,
    });
    const created = await channelService.createChannel({
      name: `Test Statistics ${Date.now()}`,
      newScene: 'topclass',
      template: 'ppt',
    });
    testChannelId = String(created.channelId);
  }, 30000);

  afterAll(async () => {
    if (testChannelId) {
      try {
        await channelService.deleteChannel(testChannelId);
      } catch {
        // Ignore cleanup errors for already-removed temporary channels.
      }
    }
  });

  // ========================================
  // Daily View Statistics Tests
  // ========================================

  describe('statistics view', () => {
    it('should get daily view statistics successfully', async () => {
      const result = await statisticsService.getDailyViewStatistics({
        channelId: testChannelId,
        startDay: getDateString(-7),
        endDay: getDateString(0)
      });

      expect(Array.isArray(result)).toBe(true);
      // Result may be empty if no views in the date range
    }, 15000);

    it('should handle date range within 60 days', async () => {
      const result = await statisticsService.getDailyViewStatistics({
        channelId: testChannelId,
        startDay: getDateString(-30),
        endDay: getDateString(0)
      });

      expect(Array.isArray(result)).toBe(true);
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        statisticsService.getDailyViewStatistics({
          channelId: '',
          startDay: getDateString(-7),
          endDay: getDateString(0)
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid date format', async () => {
      await expect(
        statisticsService.getDailyViewStatistics({
          channelId: testChannelId,
          startDay: 'invalid-date',
          endDay: getDateString(0)
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate date range exceeding 60 days', async () => {
      await expect(
        statisticsService.getDailyViewStatistics({
          channelId: testChannelId,
          startDay: getDateString(-90),
          endDay: getDateString(0)
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate startDay after endDay', async () => {
      await expect(
        statisticsService.getDailyViewStatistics({
          channelId: testChannelId,
          startDay: getDateString(0),
          endDay: getDateString(-7)
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Concurrency Data Tests
  // ========================================

  describe('statistics concurrency', () => {
    it('should get concurrency data successfully', async () => {
      const result = await statisticsService.getConcurrencyData({
        channelId: testChannelId,
        startDate: getDateString(-7),
        endDate: getDateString(0)
      });

      expect(Array.isArray(result)).toBe(true);
    }, 15000);

    it('should handle date range within 60 days', async () => {
      const result = await statisticsService.getConcurrencyData({
        channelId: testChannelId,
        startDate: getDateString(-30),
        endDate: getDateString(0)
      });

      expect(Array.isArray(result)).toBe(true);
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        statisticsService.getConcurrencyData({
          channelId: '',
          startDate: getDateString(-7),
          endDate: getDateString(0)
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate date range exceeding 60 days', async () => {
      await expect(
        statisticsService.getConcurrencyData({
          channelId: testChannelId,
          startDate: getDateString(-90),
          endDate: getDateString(0)
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Max Concurrent Tests
  // ========================================

  describe('statistics max-concurrent', () => {
    it('should get max concurrent viewers successfully', async () => {
      const result = await statisticsService.getMaxConcurrent({
        channelId: testChannelId,
        startTime: getTimestamp(-7),
        endTime: getTimestamp(0)
      });

      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        statisticsService.getMaxConcurrent({
          channelId: '',
          startTime: getTimestamp(-7),
          endTime: getTimestamp(0)
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid timestamp format', async () => {
      await expect(
        statisticsService.getMaxConcurrent({
          channelId: testChannelId,
          startTime: 'invalid' as any,
          endTime: getTimestamp(0)
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate time range exceeding 3 months', async () => {
      await expect(
        statisticsService.getMaxConcurrent({
          channelId: testChannelId,
          startTime: getTimestamp(-120),
          endTime: getTimestamp(0)
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate startTime after endTime', async () => {
      await expect(
        statisticsService.getMaxConcurrent({
          channelId: testChannelId,
          startTime: getTimestamp(0),
          endTime: getTimestamp(-7)
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Region Distribution Tests
  // ========================================

  describe('statistics audience region', () => {
    it('should get region distribution with province type', async () => {
      const result = await statisticsService.getRegionDistribution({
        channelId: testChannelId,
        startTime: getTimestamp(-7),
        endTime: getTimestamp(0),
        type: 'province'
      });

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0].region).toBeDefined();
        expect(result[0].viewers).toBeDefined();
      }
    }, 15000);

    it('should get region distribution with city type', async () => {
      const result = await statisticsService.getRegionDistribution({
        channelId: testChannelId,
        startTime: getTimestamp(-7),
        endTime: getTimestamp(0),
        type: 'city'
      });

      expect(Array.isArray(result)).toBe(true);
    }, 15000);

    it('should get region distribution with country type', async () => {
      const result = await statisticsService.getRegionDistribution({
        channelId: testChannelId,
        startTime: getTimestamp(-7),
        endTime: getTimestamp(0),
        type: 'country'
      });

      expect(Array.isArray(result)).toBe(true);
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        statisticsService.getRegionDistribution({
          channelId: '',
          startTime: getTimestamp(-7),
          endTime: getTimestamp(0)
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid type', async () => {
      await expect(
        statisticsService.getRegionDistribution({
          channelId: testChannelId,
          startTime: getTimestamp(-7),
          endTime: getTimestamp(0),
          type: 'invalid' as any
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate time range exceeding 90 days', async () => {
      await expect(
        statisticsService.getRegionDistribution({
          channelId: testChannelId,
          startTime: getTimestamp(-120),
          endTime: getTimestamp(0)
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Device Distribution Tests
  // ========================================

  describe('statistics audience device', () => {
    it('should get device distribution successfully', async () => {
      const result = await statisticsService.getDeviceDistribution({
        channelId: testChannelId,
        startTime: getTimestamp(-7),
        endTime: getTimestamp(0)
      });

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0].name).toBeDefined();
        expect(result[0].platform).toBeDefined();
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        statisticsService.getDeviceDistribution({
          channelId: '',
          startTime: getTimestamp(-7),
          endTime: getTimestamp(0)
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate time range exceeding 90 days', async () => {
      await expect(
        statisticsService.getDeviceDistribution({
          channelId: testChannelId,
          startTime: getTimestamp(-120),
          endTime: getTimestamp(0)
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Viewlog Export Tests
  // ========================================

  describe('statistics export viewlog', () => {
    it('should get viewlog data successfully', async () => {
      const result = await statisticsService.getViewlog({
        channelId: testChannelId,
        startTime: getDateTimeString(-7),
        endTime: getDateTimeString(0),
        page: 1,
        pageSize: 10
      });

      expect(Array.isArray(result)).toBe(true);
    }, 15000);

    it('should filter by watchType', async () => {
      const result = await statisticsService.getViewlog({
        channelId: testChannelId,
        startTime: getDateTimeString(-7),
        endTime: getDateTimeString(0),
        watchType: 'live',
        page: 1,
        pageSize: 10
      });

      expect(Array.isArray(result)).toBe(true);
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        statisticsService.getViewlog({
          channelId: '',
          startTime: getDateTimeString(-7),
          endTime: getDateTimeString(0)
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid datetime format', async () => {
      await expect(
        statisticsService.getViewlog({
          channelId: testChannelId,
          startTime: 'invalid',
          endTime: getDateTimeString(0)
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate same month constraint', async () => {
      // Use dates from different months
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const startTime = lastMonth.toISOString().replace('T', ' ').substring(0, 19);
      const endTime = getDateTimeString(0);

      await expect(
        statisticsService.getViewlog({
          channelId: testChannelId,
          startTime,
          endTime
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid watchType', async () => {
      await expect(
        statisticsService.getViewlog({
          channelId: testChannelId,
          startTime: getDateTimeString(-7),
          endTime: getDateTimeString(0),
          watchType: 'invalid' as any
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Session Export Tests
  // ========================================

  describe('statistics export session', () => {
    it('should validate empty channelId', async () => {
      await expect(
        statisticsService.exportSessionStats({
          channelId: '',
          sessionId: 'test-session-id'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty sessionId', async () => {
      await expect(
        statisticsService.exportSessionStats({
          channelId: testChannelId,
          sessionId: ''
        })
      ).rejects.toThrow();
    }, 10000);

    it('should handle non-existent session ID', async () => {
      try {
        const result = await statisticsService.exportSessionStats({
          channelId: testChannelId,
          sessionId: 'non-existent-session-id-99999'
        });
        // API might return empty or error
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    }, 15000);
  });

  // ========================================
  // Validation Tests Summary
  // ========================================

  describe('validation tests', () => {
    it('should validate getDailyViewStatistics channelId', async () => {
      await expect(
        statisticsService.getDailyViewStatistics({
          channelId: '',
          startDay: '2024-01-01',
          endDay: '2024-01-31'
        })
      ).rejects.toThrow();
    });

    it('should validate getConcurrencyData channelId', async () => {
      await expect(
        statisticsService.getConcurrencyData({
          channelId: '',
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
      ).rejects.toThrow();
    });

    it('should validate getMaxConcurrent channelId', async () => {
      await expect(
        statisticsService.getMaxConcurrent({
          channelId: '',
          startTime: 1704067200000,
          endTime: 1735689600000
        })
      ).rejects.toThrow();
    });

    it('should validate getRegionDistribution channelId', async () => {
      await expect(
        statisticsService.getRegionDistribution({
          channelId: '',
          startTime: 1704067200000,
          endTime: 1735689600000
        })
      ).rejects.toThrow();
    });

    it('should validate getDeviceDistribution channelId', async () => {
      await expect(
        statisticsService.getDeviceDistribution({
          channelId: '',
          startTime: 1704067200000,
          endTime: 1735689600000
        })
      ).rejects.toThrow();
    });

    it('should validate getViewlog channelId', async () => {
      await expect(
        statisticsService.getViewlog({
          channelId: '',
          startTime: '2024-01-01 00:00:00',
          endTime: '2024-01-31 23:59:59'
        })
      ).rejects.toThrow();
    });

    it('should validate exportSessionStats channelId', async () => {
      await expect(
        statisticsService.exportSessionStats({
          channelId: '',
          sessionId: 'test-session'
        })
      ).rejects.toThrow();
    });

    it('should validate exportSessionStats sessionId', async () => {
      await expect(
        statisticsService.exportSessionStats({
          channelId: testChannelId,
          sessionId: ''
        })
      ).rejects.toThrow();
    });
  });

  // ========================================
  // Integration Workflow Tests
  // ========================================

  describe('statistics workflow', () => {
    it('should complete statistics query workflow', async () => {
      // 1. Get daily view statistics
      const viewStats = await statisticsService.getDailyViewStatistics({
        channelId: testChannelId,
        startDay: getDateString(-7),
        endDay: getDateString(0)
      });
      expect(Array.isArray(viewStats)).toBe(true);

      // 2. Get concurrency data
      const concurrencyData = await statisticsService.getConcurrencyData({
        channelId: testChannelId,
        startDate: getDateString(-7),
        endDate: getDateString(0)
      });
      expect(Array.isArray(concurrencyData)).toBe(true);

      // 3. Get max concurrent
      const maxConcurrent = await statisticsService.getMaxConcurrent({
        channelId: testChannelId,
        startTime: getTimestamp(-7),
        endTime: getTimestamp(0)
      });
      expect(typeof maxConcurrent).toBe('number');

      // 4. Get region distribution
      const regionData = await statisticsService.getRegionDistribution({
        channelId: testChannelId,
        startTime: getTimestamp(-7),
        endTime: getTimestamp(0)
      });
      expect(Array.isArray(regionData)).toBe(true);

      // 5. Get device distribution
      const deviceData = await statisticsService.getDeviceDistribution({
        channelId: testChannelId,
        startTime: getTimestamp(-7),
        endTime: getTimestamp(0)
      });
      expect(Array.isArray(deviceData)).toBe(true);
    }, 30000);
  });
});
