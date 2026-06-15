/**
 * @fileoverview Performance tests for stream metrics functionality
 * @author Development Team
 * @since 5.2.0
 */

import { EventEmitter } from 'events';
import { StreamService } from '../../src/services/stream.service';
import { ChannelService } from '../../src/services/channel.service';
import { DataManager, DataManagerConfig } from '../../src/utils/data-manager';
import { TimeSeriesProcessor } from '../../src/utils/time-series.processor';
import { StreamMetricsPanel, StreamMetricsPanelConfig } from '../../src/components/stream-metrics.panel';
import { AuthConfig } from '../../src/types/auth';

// Mock services for performance testing
jest.mock('../../src/services/stream.service');
jest.mock('../../src/services/channel.service');

// Mock blessed components to focus on data processing performance
jest.mock('blessed', () => ({
  box: jest.fn(() => ({
    setContent: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
    key: jest.fn(),
    screen: { render: jest.fn() },
    destroy: jest.fn()
  })),
  screen: jest.fn(() => ({ render: jest.fn() }))
}));

jest.mock('blessed-contrib', () => ({
  line: jest.fn(() => ({
    setData: jest.fn(),
    show: jest.fn(),
    hide: jest.fn()
  }))
}));

describe('Stream Metrics Performance Tests', () => {
  let mockStreamService: jest.Mocked<StreamService>;
  let mockChannelService: jest.Mocked<ChannelService>;
  let eventBus: EventEmitter;

  const authConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
    userId: 'test-user-id'
  };

  const serviceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
    maxRetries: 3
  };

  beforeEach(() => {
    mockStreamService = new StreamService(authConfig, serviceConfig) as jest.Mocked<StreamService>;
    mockChannelService = new ChannelService(authConfig, serviceConfig) as jest.Mocked<ChannelService>;
    eventBus = new EventEmitter();
  });

  afterEach(() => {
    eventBus.removeAllListeners();
  });

  describe('Data Collection Performance', () => {
    it('should handle rapid data collection cycles efficiently', async () => {
      const channelCount = 10;
      const channels = Array.from({ length: channelCount }, (_, i) => `channel-${i + 1}`);

      const dataManagerConfig: DataManagerConfig = {
        refreshInterval: 100, // Very fast for testing
        retryAttempts: 1,
        retryDelay: 100,
        channels,
        enableStreaming: true,
        bufferSize: 1000
      };

      const dataManager = new DataManager(mockStreamService, mockChannelService, dataManagerConfig);

      // Setup mock to respond quickly
      mockStreamService.getStreamStatus = jest.fn().mockImplementation((request) => {
        return Promise.resolve({
          channelId: request.channelId,
          status: 'live' as const,
          statusText: 'Live',
          isLive: true,
          metrics: {
            fps: Math.floor(Math.random() * 30) + 20,
            bandwidth: Math.floor(Math.random() * 2000000) + 1000000
          },
          lastUpdated: new Date()
        });
      });

      const startTime = performance.now();
      const collectionCycles = 20;
      const results = [];

      // Perform rapid collection cycles
      for (let i = 0; i < collectionCycles; i++) {
        const cycleStart = performance.now();
        const result = await dataManager.collectData();
        const cycleEnd = performance.now();

        results.push({
          cycle: i,
          duration: cycleEnd - cycleStart,
          success: result.success,
          dataCount: result.data?.length || 0
        });
      }

      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      const averageCycleDuration = totalDuration / collectionCycles;

      // Performance assertions
      expect(totalDuration).toBeLessThan(10000); // Should complete in under 10 seconds
      expect(averageCycleDuration).toBeLessThan(500); // Average cycle should be under 500ms
      
      // All collections should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.dataCount).toBe(channelCount);
        expect(result.duration).toBeLessThan(1000); // Individual cycles under 1 second
      });

      console.log(`Performance Summary:
        Total Duration: ${totalDuration.toFixed(2)}ms
        Average Cycle Duration: ${averageCycleDuration.toFixed(2)}ms
        Channels: ${channelCount}
        Cycles: ${collectionCycles}
        Success Rate: ${results.filter(r => r.success).length / results.length * 100}%`);

      dataManager.destroy();
    }, 15000); // 15 second timeout

    it('should scale efficiently with increasing channel count', async () => {
      const channelCounts = [5, 10, 20, 50];
      const results: Array<{ channelCount: number; duration: number; avgPerChannel: number }> = [];

      for (const channelCount of channelCounts) {
        const channels = Array.from({ length: channelCount }, (_, i) => `channel-${i + 1}`);

        const dataManagerConfig: DataManagerConfig = {
          refreshInterval: 5000,
          retryAttempts: 1,
          retryDelay: 100,
          channels,
          enableStreaming: true,
          bufferSize: 1000
        };

        const dataManager = new DataManager(mockStreamService, mockChannelService, dataManagerConfig);

        // Setup mock with slight delay to simulate real network
        mockStreamService.getStreamStatus = jest.fn().mockImplementation((request) => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve({
                channelId: request.channelId,
                status: 'live' as const,
                statusText: 'Live',
                isLive: true,
                metrics: {
                  fps: 30,
                  bandwidth: 1500000
                },
                lastUpdated: new Date()
              });
            }, 10); // 10ms simulated network delay
          });
        });

        const startTime = performance.now();
        const result = await dataManager.collectData();
        const endTime = performance.now();

        const duration = endTime - startTime;
        const avgPerChannel = duration / channelCount;

        results.push({ channelCount, duration, avgPerChannel });

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(channelCount);

        dataManager.destroy();
      }

      // Verify scaling characteristics
      results.forEach((result, index) => {
        if (index > 0) {
          const prevResult = results[index - 1]!;
          const scalingRatio = result.duration / prevResult.duration;
          const channelRatio = result.channelCount / prevResult.channelCount;

          // Duration should scale sub-linearly due to parallel processing
          // Relaxed threshold for CI environment where performance is less predictable
          expect(scalingRatio).toBeLessThan(channelRatio * 2.5);
        }

        // Individual channel processing should remain efficient
        expect(result.avgPerChannel).toBeLessThan(100); // Under 100ms per channel
      });

      console.log('Scaling Performance:');
      results.forEach(result => {
        console.log(`  ${result.channelCount} channels: ${result.duration.toFixed(2)}ms total, ${result.avgPerChannel.toFixed(2)}ms per channel`);
      });
    }, 30000); // 30 second timeout
  });

  describe('Time Series Processing Performance', () => {
    it('should handle large amounts of historical data efficiently', () => {
      const processor = new TimeSeriesProcessor(10000, 24); // 10k points, 24 hours
      const channelCount = 10;
      const pointsPerChannel = 1000;

      const startTime = performance.now();

      // Add large amount of data
      for (let channelIndex = 0; channelIndex < channelCount; channelIndex++) {
        const channelId = `channel-${channelIndex + 1}`;
        
        for (let pointIndex = 0; pointIndex < pointsPerChannel; pointIndex++) {
          const timestamp = new Date(Date.now() - pointIndex * 60000); // 1 minute intervals
          
          processor.addStreamMetrics(channelId, timestamp, {
            bitrate: Math.floor(Math.random() * 2000) + 1000,
            fps: Math.floor(Math.random() * 10) + 25,
            viewerCount: Math.floor(Math.random() * 500) + 100,
            bandwidth: Math.floor(Math.random() * 2000000) + 1000000
          });
        }
      }

      const addDataTime = performance.now();

      // Perform various queries
      const queryStartTime = performance.now();

      // Query all data for one channel
      const channelMetrics = processor.getChannelMetrics('channel-1');
      expect(channelMetrics.size).toBeGreaterThan(0);

      // Query with time range
      const timeRange = {
        start: new Date(Date.now() - 3600000), // 1 hour ago
        end: new Date()
      };
      const historicalData = processor.getHistoricalData('channel-1', 'bitrate', timeRange);
      expect(historicalData).not.toBeNull();

      // Perform aggregation
      const aggregatedData = processor.query({
        channelId: 'channel-1',
        metric: 'fps',
        aggregation: {
          interval: 300000, // 5 minutes
          type: 'avg'
        }
      });
      expect(aggregatedData).toHaveLength(1);

      const queryEndTime = performance.now();
      const endTime = performance.now();

      const totalDuration = endTime - startTime;
      const addDataDuration = addDataTime - startTime;
      const queryDuration = queryEndTime - queryStartTime;

      // Performance assertions
      expect(totalDuration).toBeLessThan(7000); // Should complete in under 7 seconds
      expect(addDataDuration).toBeLessThan(5000); // Data addition under 5 seconds
      expect(queryDuration).toBeLessThan(1000); // Queries under 1 second

      // Verify data integrity
      const stats = processor.getStats();
      expect(stats.totalPoints).toBe(channelCount * pointsPerChannel * 4); // 4 metrics per point
      expect(stats.channelCount).toBe(channelCount);

      console.log(`Time Series Performance:
        Total Points: ${stats.totalPoints}
        Channels: ${stats.channelCount}
        Add Data Duration: ${addDataDuration.toFixed(2)}ms
        Query Duration: ${queryDuration.toFixed(2)}ms
        Total Duration: ${totalDuration.toFixed(2)}ms`);
    });

    it('should efficiently handle data aggregation operations', () => {
      const processor = new TimeSeriesProcessor();
      const pointCount = 5000;
      const channelId = 'test-channel';

      // Add data points
      const addStartTime = performance.now();
      for (let i = 0; i < pointCount; i++) {
        const timestamp = new Date(Date.now() - i * 60000); // 1 minute intervals
        processor.addStreamMetrics(channelId, timestamp, {
          bitrate: 1000 + Math.sin(i / 100) * 500, // Oscillating data
          fps: 30 + Math.sin(i / 50) * 5
        });
      }
      const addEndTime = performance.now();

      // Test different aggregation types
      const aggregationTests = [
        { interval: 300000, type: 'avg' as const }, // 5 minutes
        { interval: 600000, type: 'max' as const }, // 10 minutes
        { interval: 900000, type: 'min' as const }, // 15 minutes
        { interval: 1800000, type: 'sum' as const } // 30 minutes
      ];

      const aggregationResults = [];

      for (const aggregationConfig of aggregationTests) {
        const startTime = performance.now();
        
        const result = processor.query({
          channelId,
          metric: 'bitrate',
          aggregation: aggregationConfig
        });

        const endTime = performance.now();
        const duration = endTime - startTime;

        aggregationResults.push({
          config: aggregationConfig,
          duration,
          resultCount: result[0]?.points.length || 0
        });

        expect(result).toHaveLength(1);
        expect(result[0]?.points.length).toBeGreaterThan(0);
        expect(duration).toBeLessThan(200); // Each aggregation under 200ms
      }

      const addDuration = addEndTime - addStartTime;
      expect(addDuration).toBeLessThan(4000); // Adding 5k points under 4 seconds

      console.log(`Aggregation Performance (${pointCount} points):`);
      console.log(`  Data Addition: ${addDuration.toFixed(2)}ms`);
      aggregationResults.forEach(result => {
        console.log(`  ${result.config.type} (${result.config.interval}ms): ${result.duration.toFixed(2)}ms -> ${result.resultCount} aggregated points`);
      });
    });
  });

  describe('Panel Rendering Performance', () => {
    it('should handle rapid UI updates efficiently', () => {
      const panelConfig: StreamMetricsPanelConfig = {
        type: 'stream-metrics',
        position: { x: 0, y: 0, width: 100, height: 50 },
        size: { minWidth: 50, minHeight: 20 },
        config: {},
        visible: true,
        priority: 1,
        refreshInterval: 1000,
        maxDataPoints: 1000,
        channels: ['test-channel'],
        alertThresholds: {
          bitrate: { min: 500, max: 5000 },
          fps: { min: 20, max: 60 },
          viewerCount: { max: 1000 }
        },
        chartStyle: {
          lineColors: ['yellow', 'green', 'cyan'],
          backgroundColor: 'black',
          foregroundColor: 'white'
        }
      };

      const panel = new StreamMetricsPanel(panelConfig, eventBus);
      const updateCount = 1000;
      const updateTimes: number[] = [];

      // Perform rapid updates
      for (let i = 0; i < updateCount; i++) {
        const updateStart = performance.now();
        
        panel.update({
          channelId: 'test-channel',
          bitrate: 1000 + Math.sin(i / 10) * 500,
          fps: 30 + Math.sin(i / 5) * 5,
          resolution: '1920x1080',
          viewerCount: 100 + Math.floor(Math.random() * 50),
          status: 'live',
          uptime: i * 1000,
          bandwidth: (1000 + Math.sin(i / 10) * 500) * 1000,
          lastUpdate: new Date(Date.now() + i * 1000)
        });

        const updateEnd = performance.now();
        updateTimes.push(updateEnd - updateStart);
      }

      const totalUpdateTime = updateTimes.reduce((sum, time) => sum + time, 0);
      const averageUpdateTime = totalUpdateTime / updateCount;
      const maxUpdateTime = Math.max(...updateTimes);
      const minUpdateTime = Math.min(...updateTimes);

      // Performance assertions (adjusted for CI environment)
      expect(averageUpdateTime).toBeLessThan(10); // Average under 10ms
      expect(maxUpdateTime).toBeLessThan(200); // Max under 200ms (allowing for CI slowness)
      expect(totalUpdateTime).toBeLessThan(10000); // Total under 10 seconds

      // Verify final state
      const channelData = panel.getCurrentChannelData();
      expect(channelData).not.toBeNull();
      expect(channelData!.dataPoints).toHaveLength(updateCount);

      console.log(`Panel Update Performance (${updateCount} updates):
        Total Time: ${totalUpdateTime.toFixed(2)}ms
        Average Time: ${averageUpdateTime.toFixed(2)}ms
        Min Time: ${minUpdateTime.toFixed(2)}ms
        Max Time: ${maxUpdateTime.toFixed(2)}ms`);

      panel.destroy();
    });

    it('should maintain performance with multiple channels and alerts', () => {
      const channelCount = 20;
      const panelConfig: StreamMetricsPanelConfig = {
        type: 'stream-metrics',
        position: { x: 0, y: 0, width: 100, height: 50 },
        size: { minWidth: 50, minHeight: 20 },
        config: {},
        visible: true,
        priority: 1,
        refreshInterval: 1000,
        maxDataPoints: 100,
        channels: Array.from({ length: channelCount }, (_, i) => `channel-${i + 1}`),
        alertThresholds: {
          bitrate: { min: 500, max: 5000 },
          fps: { min: 20, max: 60 },
          viewerCount: { max: 1000 }
        },
        chartStyle: {
          lineColors: ['yellow', 'green', 'cyan'],
          backgroundColor: 'black',
          foregroundColor: 'white'
        }
      };

      const panel = new StreamMetricsPanel(panelConfig, eventBus);
      let alertCount = 0;

      eventBus.on('component:alert', () => {
        alertCount++;
      });

      const startTime = performance.now();
      const updateRounds = 50;

      // Perform updates for all channels multiple times
      for (let round = 0; round < updateRounds; round++) {
        const channelUpdates = [];

        for (let channelIndex = 0; channelIndex < channelCount; channelIndex++) {
          const channelId = `channel-${channelIndex + 1}`;
          
          // Occasionally trigger alerts
          const shouldTriggerAlert = Math.random() < 0.1; // 10% chance
          const bitrate = shouldTriggerAlert ? 6000 : 1500; // Above threshold to trigger alert

          channelUpdates.push({
            channelId,
            bitrate,
            fps: 25 + Math.floor(Math.random() * 10),
            resolution: '1920x1080',
            viewerCount: 100 + Math.floor(Math.random() * 200),
            status: 'live' as const,
            uptime: round * 1000,
            bandwidth: bitrate * 1000,
            lastUpdate: new Date(Date.now() + round * 1000)
          });
        }

        panel.update(channelUpdates);
      }

      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      const averagePerUpdate = totalDuration / (updateRounds * channelCount);

      // Performance assertions
      expect(totalDuration).toBeLessThan(10000); // Should complete in under 10 seconds
      expect(averagePerUpdate).toBeLessThan(10); // Under 10ms per channel update

      // Verify system handled multiple channels
      expect(panel.getAllChannelsData().size).toBe(channelCount);
      expect(alertCount).toBeGreaterThan(0); // Some alerts should have been triggered

      console.log(`Multi-Channel Performance:
        Channels: ${channelCount}
        Update Rounds: ${updateRounds}
        Total Updates: ${updateRounds * channelCount}
        Total Duration: ${totalDuration.toFixed(2)}ms
        Average Per Update: ${averagePerUpdate.toFixed(2)}ms
        Alerts Triggered: ${alertCount}`);

      panel.destroy();
    });
  });

  describe('Memory Performance', () => {
    it('should maintain stable memory usage under continuous operation', () => {
      const initialMemory = process.memoryUsage();
      
      const processor = new TimeSeriesProcessor(1000, 1); // Limit to prevent excessive memory usage
      const panel = new StreamMetricsPanel({
        type: 'stream-metrics',
        position: { x: 0, y: 0, width: 100, height: 50 },
        size: { minWidth: 50, minHeight: 20 },
        config: {},
        visible: true,
        priority: 1,
        refreshInterval: 1000,
        maxDataPoints: 500, // Limited to test memory bounds
        channels: ['test-channel'],
        alertThresholds: {
          bitrate: { min: 500, max: 5000 },
          fps: { min: 20, max: 60 },
          viewerCount: { max: 1000 }
        },
        chartStyle: {
          lineColors: ['yellow'],
          backgroundColor: 'black',
          foregroundColor: 'white'
        }
      }, eventBus);

      const memoryMeasurements = [];

      // Simulate continuous operation
      for (let i = 0; i < 1000; i++) {
        // Add data to time series processor
        processor.addStreamMetrics('test-channel', new Date(), {
          bitrate: 1000 + Math.sin(i / 10) * 200,
          fps: 30,
          viewerCount: 100,
          bandwidth: 1500000
        });

        // Update panel
        panel.update({
          channelId: 'test-channel',
          bitrate: 1000 + Math.sin(i / 10) * 200,
          fps: 30,
          resolution: '1920x1080',
          viewerCount: 100,
          status: 'live',
          uptime: i * 1000,
          bandwidth: 1500000,
          lastUpdate: new Date()
        });

        // Measure memory every 100 iterations
        if (i % 100 === 0) {
          const currentMemory = process.memoryUsage();
          memoryMeasurements.push({
            iteration: i,
            heapUsed: currentMemory.heapUsed,
            heapTotal: currentMemory.heapTotal,
            external: currentMemory.external
          });
        }
      }

      const finalMemory = process.memoryUsage();

      // Calculate memory growth
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryGrowthMB = memoryGrowth / (1024 * 1024);

      // Memory should not grow excessively
      expect(memoryGrowthMB).toBeLessThan(50); // Less than 50MB growth

      // Check for memory stability (no significant growth in later measurements)
      const firstHalf = memoryMeasurements.slice(0, Math.floor(memoryMeasurements.length / 2));
      const secondHalf = memoryMeasurements.slice(Math.floor(memoryMeasurements.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.heapUsed, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.heapUsed, 0) / secondHalf.length;
      
      const memoryGrowthRatio = secondHalfAvg / firstHalfAvg;
      expect(memoryGrowthRatio).toBeLessThan(2); // Memory should not double

      console.log(`Memory Performance:
        Initial Heap: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB
        Final Heap: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB
        Growth: ${memoryGrowthMB.toFixed(2)}MB
        Growth Ratio: ${memoryGrowthRatio.toFixed(2)}x`);

      panel.destroy();
    });
  });
});