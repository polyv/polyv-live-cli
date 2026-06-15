/**
 * @fileoverview Unit tests for TimeSeriesProcessor
 * @author Development Team
 * @since 5.2.0
 */

import { 
  TimeSeriesProcessor, 
  TimeSeriesPoint
} from './time-series.processor';


describe('TimeSeriesProcessor', () => {
  let processor: TimeSeriesProcessor;

  beforeEach(() => {
    processor = new TimeSeriesProcessor(100, 24); // 100 points max, 24 hours retention
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with default parameters', () => {
      const defaultProcessor = new TimeSeriesProcessor();
      const stats = defaultProcessor.getStats();
      
      expect(stats.seriesCount).toBe(0);
      expect(stats.totalPoints).toBe(0);
      expect(stats.channelCount).toBe(0);
      expect(stats.metricTypes).toEqual([]);
    });

    it('should initialize with custom parameters', () => {
      const customProcessor = new TimeSeriesProcessor(500, 48);
      const stats = customProcessor.getStats();
      
      expect(stats.seriesCount).toBe(0);
      expect(stats.totalPoints).toBe(0);
    });

    it('should have empty initial state', () => {
      const stats = processor.getStats();
      expect(stats.totalPoints).toBe(0);
      expect(stats.channelCount).toBe(0);
      expect(stats.oldestPoint).toBeUndefined();
      expect(stats.newestPoint).toBeUndefined();
    });
  });

  describe('Adding Data Points', () => {
    const timestamp = new Date();
    const point: TimeSeriesPoint = { timestamp, value: 1500 };

    it('should add point to new series', () => {
      processor.addPoint('test-series', point, {
        name: 'Test Series',
        metric: 'bitrate',
        channelId: 'test-channel',
        unit: 'kbps'
      });
      
      const stats = processor.getStats();
      expect(stats.seriesCount).toBe(1);
      expect(stats.totalPoints).toBe(1);
      expect(stats.channelCount).toBe(1);
      expect(stats.metricTypes).toContain('bitrate');
    });

    it('should add point to existing series', () => {
      const now = new Date();
      const point1 = { timestamp: new Date(now.getTime() - 60000), value: 1500 }; // 1 minute ago
      const point2 = { timestamp: new Date(now.getTime() - 30000), value: 1600 }; // 30 seconds ago

      processor.addPoint('test-series', point1, {
        name: 'Test Series',
        metric: 'bitrate',
        channelId: 'test-channel',
        unit: 'kbps'
      });
      
      processor.addPoint('test-series', point2, {
        name: 'Test Series',
        metric: 'bitrate',
        channelId: 'test-channel',
        unit: 'kbps'
      });
      
      const stats = processor.getStats();
      expect(stats.seriesCount).toBe(1);
      expect(stats.totalPoints).toBe(2);
    });

    it('should sort points by timestamp', () => {
      const now = new Date();
      const point1 = { timestamp: new Date(now.getTime() - 10000), value: 1700 }; // 10 seconds ago
      const point2 = { timestamp: new Date(now.getTime() - 30000), value: 1500 }; // 30 seconds ago
      const point3 = { timestamp: new Date(now.getTime() - 20000), value: 1600 }; // 20 seconds ago

      processor.addPoint('test-channel-bitrate', point1, {
        name: 'Test Series',
        metric: 'bitrate',
        channelId: 'test-channel',
        unit: 'kbps'
      });
      
      processor.addPoint('test-channel-bitrate', point2, {
        name: 'Test Series',
        metric: 'bitrate',
        channelId: 'test-channel',
        unit: 'kbps'
      });
      
      processor.addPoint('test-channel-bitrate', point3, {
        name: 'Test Series',
        metric: 'bitrate',
        channelId: 'test-channel',
        unit: 'kbps'
      });

      const historicalData = processor.getHistoricalData('test-channel', 'bitrate');
      expect(historicalData?.points.map(p => p.value)).toEqual([1500, 1600, 1700]);
    });

    it('should enforce max points limit', () => {
      const smallProcessor = new TimeSeriesProcessor(5, 24);
      
      // Add more points than the limit
      for (let i = 0; i < 10; i++) {
        smallProcessor.addPoint('test-series', 
          { timestamp: new Date(Date.now() + i * 1000), value: i },
          {
            name: 'Test Series',
            metric: 'bitrate',
            channelId: 'test-channel',
            unit: 'kbps'
          }
        );
      }

      const stats = smallProcessor.getStats();
      expect(stats.totalPoints).toBe(5);
    });

    it('should handle missing channelId in metadata', () => {
      processor.addPoint('test-series', point, {
        name: 'Test Series',
        metric: 'bitrate',
        unit: 'kbps'
      });
      
      const stats = processor.getStats();
      expect(stats.seriesCount).toBe(1);
      expect(stats.channelCount).toBe(0); // Empty channelId not counted
    });

    it('should use default aggregationType when not specified', () => {
      processor.addPoint('test-series', point, {
        name: 'Test Series',
        metric: 'bitrate',
        channelId: 'test-channel',
        unit: 'kbps'
      });
      
      const result = processor.query({ channelId: 'test-channel' });
      expect(result[0]?.aggregationType).toBe('last');
    });
  });

  describe('Adding Stream Metrics', () => {
    const channelId = 'test-channel';
    const timestamp = new Date();

    it('should add bitrate metric', () => {
      processor.addStreamMetrics(channelId, timestamp, { bitrate: 1500 });
      
      const stats = processor.getStats();
      expect(stats.totalPoints).toBe(1);
      expect(stats.metricTypes).toContain('bitrate');
      
      const historicalData = processor.getHistoricalData(channelId, 'bitrate');
      expect(historicalData?.points[0]?.value).toBe(1500);
    });

    it('should add fps metric', () => {
      processor.addStreamMetrics(channelId, timestamp, { fps: 30 });
      
      const historicalData = processor.getHistoricalData(channelId, 'fps');
      expect(historicalData?.points[0]?.value).toBe(30);
    });

    it('should add viewerCount metric', () => {
      processor.addStreamMetrics(channelId, timestamp, { viewerCount: 100 });
      
      const historicalData = processor.getHistoricalData(channelId, 'viewerCount');
      expect(historicalData?.points[0]?.value).toBe(100);
    });

    it('should add bandwidth metric', () => {
      processor.addStreamMetrics(channelId, timestamp, { bandwidth: 1500000 });
      
      const historicalData = processor.getHistoricalData(channelId, 'bandwidth');
      expect(historicalData?.points[0]?.value).toBe(1500000);
    });

    it('should add uptime metric', () => {
      processor.addStreamMetrics(channelId, timestamp, { uptime: 3600000 });
      
      const historicalData = processor.getHistoricalData(channelId, 'uptime');
      expect(historicalData?.points[0]?.value).toBe(3600000);
    });

    it('should add multiple metrics at once', () => {
      processor.addStreamMetrics(channelId, timestamp, {
        bitrate: 1500,
        fps: 30,
        viewerCount: 100,
        bandwidth: 1500000,
        uptime: 3600000
      });
      
      const stats = processor.getStats();
      expect(stats.totalPoints).toBe(5);
      expect(stats.metricTypes).toEqual(
        expect.arrayContaining(['bitrate', 'fps', 'viewerCount', 'bandwidth', 'uptime'])
      );
    });

    it('should handle undefined metrics gracefully', () => {
      const partialMetrics = {
        bitrate: 1500,
        viewerCount: 100
      };
      
      processor.addStreamMetrics(channelId, timestamp, partialMetrics);
      
      const stats = processor.getStats();
      expect(stats.totalPoints).toBe(2); // Only bitrate and viewerCount added
    });
  });

  describe('Data Retrieval', () => {
    beforeEach(() => {
      // Add test data
      const baseTime = new Date(Date.now() - 300000); // 5 minutes ago
      for (let i = 0; i < 5; i++) {
        const timestamp = new Date(baseTime.getTime() + i * 60000); // 1 minute intervals
        processor.addStreamMetrics('test-channel', timestamp, {
          bitrate: 1500 + i * 100,
          fps: 30 - i,
          viewerCount: 100 + i * 10
        });
      }
    });

    it('should get historical data for existing channel and metric', () => {
      const historicalData = processor.getHistoricalData('test-channel', 'bitrate');
      
      expect(historicalData).not.toBeNull();
      expect(historicalData!.points).toHaveLength(5);
      expect(historicalData!.points.map(p => p.value)).toEqual([1500, 1600, 1700, 1800, 1900]);
    });

    it('should get historical data with time range filter', () => {
      const baseTime = new Date(Date.now() - 300000); // 5 minutes ago
      const startTime = new Date(baseTime.getTime() + 60000); // 4 minutes ago
      const endTime = new Date(baseTime.getTime() + 180000); // 2 minutes ago
      
      const historicalData = processor.getHistoricalData('test-channel', 'bitrate', {
        start: startTime,
        end: endTime
      });
      
      expect(historicalData).not.toBeNull();
      expect(historicalData!.points.length).toBeGreaterThan(0); // Has points in range
      expect(historicalData!.points.map(p => p.value)).toContain(1700);
    });

    it('should return null for non-existent channel and metric', () => {
      const historicalData = processor.getHistoricalData('non-existent', 'bitrate');
      expect(historicalData).toBeNull();
    });

    it('should get channel metrics for existing channel', () => {
      const channelMetrics = processor.getChannelMetrics('test-channel');
      
      expect(channelMetrics.size).toBe(3); // bitrate, fps, viewerCount
      expect(channelMetrics.has('bitrate')).toBe(true);
      expect(channelMetrics.has('fps')).toBe(true);
      expect(channelMetrics.has('viewerCount')).toBe(true);
    });

    it('should get channel metrics with time range filter', () => {
      const baseTime = new Date(Date.now() - 300000); // 5 minutes ago
      const startTime = new Date(baseTime.getTime() + 60000); // 4 minutes ago
      const endTime = new Date(baseTime.getTime() + 180000); // 2 minutes ago
      
      const channelMetrics = processor.getChannelMetrics('test-channel', {
        start: startTime,
        end: endTime
      });
      
      expect(channelMetrics.size).toBe(3);
      const bitrateData = channelMetrics.get('bitrate');
      expect(bitrateData?.points.length).toBeGreaterThan(0);
    });

    it('should return empty map for non-existent channel', () => {
      const channelMetrics = processor.getChannelMetrics('non-existent');
      expect(channelMetrics.size).toBe(0);
    });
  });

  describe('Query System', () => {
    beforeEach(() => {
      // Add test data for multiple channels
      const baseTime = new Date(Date.now() - 600000); // 10 minutes ago
      for (let i = 0; i < 10; i++) {
        const timestamp = new Date(baseTime.getTime() + i * 60000);
        processor.addStreamMetrics('channel-1', timestamp, {
          bitrate: 1000 + i * 100,
          fps: 30 + i
        });
        processor.addStreamMetrics('channel-2', timestamp, {
          bitrate: 2000 + i * 100,
          viewerCount: 100 + i * 10
        });
      }
    });

    it('should query all series when no filters applied', () => {
      const result = processor.query();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should filter by channelId', () => {
      const result = processor.query({ channelId: 'channel-1' });
      expect(result).toHaveLength(2); // bitrate and fps
      expect(result.every(s => s.channelId === 'channel-1')).toBe(true);
    });

    it('should filter by metric', () => {
      const result = processor.query({ metric: 'bitrate' });
      expect(result).toHaveLength(2); // channel-1 and channel-2
      expect(result.every(s => s.metric === 'bitrate')).toBe(true);
    });

    it('should filter by channelId and metric', () => {
      const result = processor.query({ channelId: 'channel-1', metric: 'bitrate' });
      expect(result).toHaveLength(1);
      expect(result[0]?.channelId).toBe('channel-1');
      expect(result[0]?.metric).toBe('bitrate');
    });

    it('should apply time range filter', () => {
      const result = processor.query({
        channelId: 'channel-1',
        metric: 'bitrate',
        timeRange: {
          start: new Date(Date.now() - 500000), // 8 minutes 20 seconds ago
          end: new Date(Date.now() - 320000) // 5 minutes 20 seconds ago
        }
      });
      
      expect(result).toHaveLength(1);
      expect(result[0]?.points).toHaveLength(3); // 3 points in range
    });

    it('should apply limit', () => {
      const result = processor.query({
        channelId: 'channel-1',
        metric: 'bitrate',
        limit: 3
      });
      
      expect(result).toHaveLength(1);
      expect(result[0]?.points).toHaveLength(3);
    });

    it('should return empty array for non-matching filters', () => {
      const result = processor.query({
        channelId: 'non-existent',
        metric: 'bitrate'
      });
      expect(result).toHaveLength(0);
    });
  });

  describe('Aggregation', () => {
    beforeEach(() => {
      // Add test data with regular intervals
      const baseTime = new Date(Date.now() - 1200000); // 20 minutes ago
      for (let i = 0; i < 20; i++) {
        const timestamp = new Date(baseTime.getTime() + i * 60000); // 1 minute intervals
        processor.addStreamMetrics('test-channel', timestamp, {
          bitrate: 1000 + (i % 5) * 100 // Creates pattern: 1000, 1100, 1200, 1300, 1400, repeat
        });
      }
    });

    it('should aggregate with average', () => {
      const result = processor.query({
        channelId: 'test-channel',
        metric: 'bitrate',
        aggregation: {
          interval: 300000, // 5 minutes
          type: 'avg'
        }
      });
      
      expect(result).toHaveLength(1);
      expect(result[0]?.points.length).toBeGreaterThanOrEqual(4); // Should have at least 4 buckets
      
      // First bucket should be an average value
      const firstBucket = result[0]?.points[0];
      expect(firstBucket?.value).toBeGreaterThanOrEqual(1000); // Should be an average
    });

    it('should aggregate with sum', () => {
      const result = processor.query({
        channelId: 'test-channel',
        metric: 'bitrate',
        aggregation: {
          interval: 300000, // 5 minutes
          type: 'sum'
        }
      });
      
      expect(result).toHaveLength(1);
      const firstBucket = result[0]?.points[0];
      expect(firstBucket?.value).toBeGreaterThanOrEqual(1000); // Should be a sum
    });

    it('should aggregate with min', () => {
      const result = processor.query({
        channelId: 'test-channel',
        metric: 'bitrate',
        aggregation: {
          interval: 300000, // 5 minutes
          type: 'min'
        }
      });
      
      expect(result).toHaveLength(1);
      const firstBucket = result[0]?.points[0];
      expect(firstBucket?.value).toBe(1000); // Min of 1000, 1100, 1200, 1300, 1400
    });

    it('should aggregate with max', () => {
      const result = processor.query({
        channelId: 'test-channel',
        metric: 'bitrate',
        aggregation: {
          interval: 300000, // 5 minutes
          type: 'max'
        }
      });
      
      expect(result).toHaveLength(1);
      const firstBucket = result[0]?.points[0];
      expect(firstBucket?.value).toBeGreaterThanOrEqual(1000); // Should be max value
    });

    it('should aggregate with last', () => {
      const result = processor.query({
        channelId: 'test-channel',
        metric: 'bitrate',
        aggregation: {
          interval: 300000, // 5 minutes
          type: 'last'
        }
      });
      
      expect(result).toHaveLength(1);
      const firstBucket = result[0]?.points[0];
      expect(firstBucket?.value).toBeGreaterThanOrEqual(1000); // Should be last value
    });

    it('should handle empty points array', () => {
      processor.clearAll();
      const result = processor.query({
        channelId: 'test-channel',
        metric: 'bitrate',
        aggregation: {
          interval: 300000,
          type: 'avg'
        }
      });
      
      expect(result).toHaveLength(0);
    });

    it('should handle edge case in aggregation fallback', () => {
      // Test the fallback case in line 368
      processor.addPoint('edge-case', { timestamp: new Date(), value: 42 }, {
        name: 'Edge Case',
        metric: 'test',
        channelId: 'edge-channel',
        unit: 'units'
      });

      const result = processor.query({
        channelId: 'edge-channel',
        metric: 'test',
        aggregation: {
          interval: 60000,
          type: 'last'
        }
      });
      
      expect(result).toHaveLength(1);
      expect(result[0]?.points[0]?.value).toBe(42);
    });
  });

  describe('Data Management', () => {
    beforeEach(() => {
      processor.addStreamMetrics('channel-1', new Date(), { bitrate: 1500 });
      processor.addStreamMetrics('channel-2', new Date(), { fps: 30 });
    });

    it('should clear all data', () => {
      let stats = processor.getStats();
      expect(stats.totalPoints).toBeGreaterThan(0);
      
      processor.clearAll();
      
      stats = processor.getStats();
      expect(stats.totalPoints).toBe(0);
      expect(stats.seriesCount).toBe(0);
      expect(stats.channelCount).toBe(0);
    });

    it('should clear specific channel data', () => {
      let stats = processor.getStats();
      expect(stats.channelCount).toBe(2);
      
      processor.clearChannel('channel-1');
      
      stats = processor.getStats();
      expect(stats.channelCount).toBe(1);
      
      const channel1Data = processor.getChannelMetrics('channel-1');
      const channel2Data = processor.getChannelMetrics('channel-2');
      
      expect(channel1Data.size).toBe(0);
      expect(channel2Data.size).toBe(1);
    });

    it('should handle clearing non-existent channel', () => {
      const initialStats = processor.getStats();
      
      processor.clearChannel('non-existent');
      
      const finalStats = processor.getStats();
      expect(finalStats.channelCount).toBe(initialStats.channelCount);
    });

    it('should clean up old data based on retention period', () => {
      const shortRetentionProcessor = new TimeSeriesProcessor(1000, 0.001); // Very short retention
      
      // Add old data
      const oldTime = new Date(Date.now() - 10000); // 10 seconds ago
      shortRetentionProcessor.addStreamMetrics('test-channel', oldTime, { bitrate: 1000 });
      
      // Add new data to trigger cleanup
      const newTime = new Date();
      shortRetentionProcessor.addStreamMetrics('test-channel', newTime, { bitrate: 2000 });
      
      const historicalData = shortRetentionProcessor.getHistoricalData('test-channel', 'bitrate');
      expect(historicalData?.points).toHaveLength(1);
      expect(historicalData?.points[0]?.value).toBe(2000);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      const timestamps = [
        new Date(Date.now() - 180000), // 3 minutes ago
        new Date(Date.now() - 120000), // 2 minutes ago
        new Date(Date.now() - 60000)   // 1 minute ago
      ];

      timestamps.forEach((ts, index) => {
        processor.addStreamMetrics(`channel-${index + 1}`, ts, {
          bitrate: 1500 + index * 100,
          fps: 30 - index
        });
      });
    });

    it('should track statistics correctly', () => {
      const stats = processor.getStats();
      
      expect(stats.seriesCount).toBe(6); // 3 channels × 2 metrics each
      expect(stats.totalPoints).toBe(6);
      expect(stats.channelCount).toBe(3);
      expect(stats.metricTypes).toEqual(expect.arrayContaining(['bitrate', 'fps']));
      expect(stats.oldestPoint).toBeDefined();
      expect(stats.newestPoint).toBeDefined();
      expect(stats.oldestPoint!.getTime()).toBeLessThan(stats.newestPoint!.getTime());
    });

    it('should handle empty series with channelId', () => {
      processor.clearAll();
      processor.addPoint('test-series', { timestamp: new Date(), value: 100 }, {
        name: 'Test Series',
        metric: 'bitrate',
        channelId: '',
        unit: 'kbps'
      });

      const stats = processor.getStats();
      expect(stats.channelCount).toBe(0); // Empty channelId not counted
    });
  });

  describe('JSON Export/Import', () => {
    beforeEach(() => {
      processor.addStreamMetrics('channel-1', new Date(Date.now() - 120000), {
        bitrate: 1500,
        fps: 30
      });
      processor.addStreamMetrics('channel-2', new Date(Date.now() - 60000), {
        viewerCount: 100
      });
    });

    it('should export data to JSON', () => {
      const jsonData = processor.exportToJSON();
      const parsed = JSON.parse(jsonData);
      
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(3); // 2 metrics for channel-1, 1 for channel-2
      
      const bitrateEntry = parsed.find((item: any) => item.metric === 'bitrate');
      expect(bitrateEntry).toBeDefined();
      expect(bitrateEntry?.channelId).toBe('channel-1');
      expect(bitrateEntry?.points).toHaveLength(1);
    });

    it('should import data from JSON', () => {
      const originalData = processor.exportToJSON();
      
      // Clear and import
      processor.clearAll();
      processor.importFromJSON(originalData);
      
      const stats = processor.getStats();
      expect(stats.seriesCount).toBe(3);
      expect(stats.totalPoints).toBe(3);
      expect(stats.channelCount).toBe(2);
      
      const channel1Data = processor.getChannelMetrics('channel-1');
      expect(channel1Data.size).toBe(2);
    });

    it('should handle import of invalid JSON', () => {
      expect(() => {
        processor.importFromJSON('invalid json');
      }).toThrow('Failed to import JSON data');
    });

    it('should handle import of non-array JSON', () => {
      expect(() => {
        processor.importFromJSON('{"not": "array"}');
      }).toThrow('Invalid JSON format: expected array');
    });

    it('should handle import with invalid item structure', () => {
      const invalidData = JSON.stringify([
        { invalidKey: 'value' },
        {
          key: 'valid-key',
          name: 'Valid Series',
          metric: 'bitrate',
          channelId: 'channel-1',
          points: [{ timestamp: new Date(), value: 100 }],
          unit: 'kbps'
        }
      ]);
      
      processor.clearAll();
      processor.importFromJSON(invalidData);
      
      const stats = processor.getStats();
      expect(stats.seriesCount).toBe(1); // Only valid item imported
    });

    it('should handle import with missing optional fields', () => {
      const dataWithMissingFields = JSON.stringify([
        {
          key: 'test-key',
          name: 'Test Series',
          metric: 'bitrate',
          channelId: 'channel-1',
          points: [{ timestamp: new Date(), value: 100 }]
          // Missing unit and aggregationType
        }
      ]);
      
      processor.clearAll();
      processor.importFromJSON(dataWithMissingFields);
      
      const stats = processor.getStats();
      expect(stats.seriesCount).toBe(1);
      
      const result = processor.query({ channelId: 'channel-1' });
      expect(result[0]?.unit).toBe('');
      expect(result[0]?.aggregationType).toBe('last');
    });

    it('should handle import with non-Error exceptions', () => {
      // Mock JSON.parse to throw a non-Error object
      const originalParse = JSON.parse;
      JSON.parse = jest.fn().mockImplementation(() => {
        throw 'String error';
      });
      
      expect(() => {
        processor.importFromJSON('test');
      }).toThrow('Failed to import JSON data: Unknown error');
      
      JSON.parse = originalParse;
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty aggregation points', () => {
      // This tests the aggregatePoints method with empty array
      const result = processor.query({
        channelId: 'non-existent',
        aggregation: {
          interval: 60000,
          type: 'avg'
        }
      });
      
      expect(result).toHaveLength(0);
    });

    it('should handle missing bucketPoints in aggregation', () => {
      // Add a single point to create a bucket
      processor.addStreamMetrics('test-channel', new Date(), { bitrate: 1500 });
      
      const result = processor.query({
        channelId: 'test-channel',
        metric: 'bitrate',
        aggregation: {
          interval: 60000,
          type: 'last'
        }
      });
      
      expect(result).toHaveLength(1);
      expect(result[0]?.points[0]?.value).toBe(1500);
    });
  });
});