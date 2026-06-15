/**
 * @fileoverview Integration tests for stream metrics functionality
 * @author Development Team
 * @since 5.2.0
 */

import { EventEmitter } from 'events';
import { StreamServiceSdk } from '../../src/services/stream.service.sdk';
import { ChannelServiceSdk } from '../../src/services/channel.service.sdk';
import { DataManager, DataManagerConfig } from '../../src/utils/data-manager';
import { TimeSeriesProcessor } from '../../src/utils/time-series.processor';
import { StreamMetricsPanel, StreamMetricsPanelConfig } from '../../src/components/stream-metrics.panel';
import { AuthConfig } from '../../src/types/auth';

// Mock the services for integration testing
jest.mock('../../src/services/stream.service.sdk');
jest.mock('../../src/services/channel.service.sdk');

// Mock blessed and blessed-contrib for UI components
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
    hide: jest.fn(),
    parent: null,
    top: 0,
    left: 0,
    width: '100%',
    height: 'bottom-1'
  }))
}));

describe('Stream Metrics Integration Tests', () => {
  let mockStreamService: jest.Mocked<StreamServiceSdk>;
  let mockChannelService: jest.Mocked<ChannelServiceSdk>;
  let dataManager: DataManager;
  let timeSeriesProcessor: TimeSeriesProcessor;
  let panel: StreamMetricsPanel;
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
    // Create mocked services
    mockStreamService = new StreamServiceSdk(authConfig, serviceConfig) as jest.Mocked<StreamServiceSdk>;
    mockChannelService = new ChannelServiceSdk(authConfig, serviceConfig) as jest.Mocked<ChannelServiceSdk>;

    // Setup event bus
    eventBus = new EventEmitter();

    // Create data manager
    const dataManagerConfig: DataManagerConfig = {
      refreshInterval: 1000, // 1 second for fast testing
      retryAttempts: 3,
      retryDelay: 1000,
      channels: ['test-channel-1', 'test-channel-2'],
      enableStreaming: true,
      bufferSize: 100
    };

    dataManager = new DataManager(mockStreamService, mockChannelService, dataManagerConfig);

    // Create time series processor
    timeSeriesProcessor = new TimeSeriesProcessor(50, 1); // 50 points max, 1 hour retention

    // Create panel
    const panelConfig: StreamMetricsPanelConfig = {
      type: 'stream-metrics',
      position: { x: 0, y: 0, width: 100, height: 50 },
      size: { minWidth: 50, minHeight: 20 },
      config: {},
      visible: true,
      priority: 1,
      refreshInterval: 1000,
      maxDataPoints: 50,
      channels: ['test-channel-1', 'test-channel-2'],
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

    panel = new StreamMetricsPanel(panelConfig, eventBus);
  });

  afterEach(() => {
    if (dataManager) {
      dataManager.destroy();
    }
    if (panel) {
      panel.destroy();
    }
    eventBus.removeAllListeners();
  });

  describe('End-to-End Data Flow', () => {
    it('should collect stream data and update panel display', async () => {
      // Setup mock stream service response
      const mockStreamStatus = {
        channelId: 'test-channel-1',
        status: 'live' as const,
        statusText: 'Live',
        isLive: true,
        duration: 3600000,
        durationText: '1h 0m 0s',
        metrics: {
          fps: 30,
          lfr: 0.1,
          bandwidth: 1500000,
          bandwidthText: '1.50 Mbps'
        },
        network: {
          deployAddress: '192.168.1.100',
          inAddress: '10.0.0.1',
          streamName: 'stream-001'
        },
        lastUpdated: new Date()
      };

      mockStreamService.getStreamStatus = jest.fn().mockResolvedValue(mockStreamStatus);

      // Start data collection
      dataManager.start();

      // Wait for data collection
      await new Promise(resolve => {
        dataManager.once('dataManager:dataCollected', (result) => {
          expect(result.success).toBe(true);
          expect(result.data).toHaveLength(2); // Two channels configured
          resolve(result);
        });
      });

      // Get collected data and update panel
      const collectedData = dataManager.getAllChannelsData();
      expect(collectedData).toHaveLength(2);

      panel.update(collectedData);

      // Verify panel state
      const currentChannelData = panel.getCurrentChannelData();
      expect(currentChannelData).not.toBeNull();
      expect(currentChannelData!.isActive).toBe(true);
      expect(currentChannelData!.dataPoints).toHaveLength(1);
      expect(currentChannelData!.dataPoints[0]?.fps).toBe(30);
      expect(currentChannelData!.dataPoints[0]?.bitrate).toBe(1500); // Converted from bps to kbps
    });

    it('should handle multiple data collection cycles', async () => {
      // Setup mock responses for multiple cycles
      let callCount = 0;
      mockStreamService.getStreamStatus = jest.fn().mockImplementation((request) => {
        // Only handle test-channel-1, let test-channel-2 fail
        if (request.channelId === 'test-channel-1') {
          callCount++;
          return Promise.resolve({
            channelId: 'test-channel-1',
            status: 'live' as const,
            statusText: 'Live',
            isLive: true,
            duration: callCount * 1000000,
            durationText: `${callCount}h 0m 0s`,
            metrics: {
              fps: 25 + callCount,
              lfr: 0.1,
              bandwidth: 1000000 + callCount * 100000,
              bandwidthText: `${1 + callCount * 0.1} Mbps`
            },
            lastUpdated: new Date()
          });
        } else {
          return Promise.reject(new Error('Channel not found'));
        }
      });

      // Start data collection
      dataManager.start();

      // Collect data multiple times and update panel each time
      for (let i = 0; i < 3; i++) {
        const result = await dataManager.collectData();
        if (result.data && result.data.length > 0) {
          panel.update(result.data);
        }
      }

      const channelData = panel.getCurrentChannelData();
      expect(channelData).not.toBeNull();
      expect(channelData!.dataPoints.length).toBe(3);

      // Verify data progression
      const points = channelData!.dataPoints;
      expect(points[0]?.fps).toBe(26); // 25 + 1
      expect(points[1]?.fps).toBe(27); // 25 + 2
      expect(points[2]?.fps).toBe(28); // 25 + 3
    });

    it('should integrate with time series processor for historical data', async () => {
      const mockStreamStatus = {
        channelId: 'test-channel-1',
        status: 'live' as const,
        statusText: 'Live',
        isLive: true,
        metrics: {
          fps: 30,
          bandwidth: 1500000
        },
        lastUpdated: new Date()
      };

      mockStreamService.getStreamStatus = jest.fn().mockResolvedValue(mockStreamStatus);

      // Collect data
      const result = await dataManager.collectData();
      expect(result.success).toBe(true);

      // Process data with time series processor
      const metrics = result.data![0]!;
      timeSeriesProcessor.addStreamMetrics(
        metrics.channelId,
        metrics.lastUpdate,
        {
          bitrate: metrics.bitrate,
          fps: metrics.fps,
          viewerCount: metrics.viewerCount,
          bandwidth: metrics.bandwidth
        }
      );

      // Query historical data
      const historicalData = timeSeriesProcessor.getChannelMetrics('test-channel-1');
      expect(historicalData.size).toBeGreaterThan(0);
      expect(historicalData.has('bitrate')).toBe(true);
      expect(historicalData.has('fps')).toBe(true);

      const bitrateData = historicalData.get('bitrate');
      expect(bitrateData!.points).toHaveLength(1);
      expect(bitrateData!.points[0]?.value).toBe(1500);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle service errors gracefully', async () => {
      // Setup mock to throw error
      mockStreamService.getStreamStatus = jest.fn().mockRejectedValue(
        new Error('API service unavailable')
      );

      // Start data collection
      dataManager.start();

      // Wait for error handling
      await new Promise(resolve => {
        dataManager.once('dataManager:channelError', (errorData) => {
          expect(errorData.error.message).toBe('API service unavailable');
          expect(errorData.channelId).toBe('test-channel-1');
          resolve(errorData);
        });
      });

      // Verify panel handles missing data gracefully
      const allData = dataManager.getAllChannelsData();
      expect(allData).toHaveLength(0); // No successful data

      panel.update(allData);
      expect(panel.getCurrentChannelData()).toBeNull();
    });

    it('should handle partial failures in multi-channel setup', async () => {
      // Setup mock to succeed for one channel, fail for another
      mockStreamService.getStreamStatus = jest.fn().mockImplementation((request) => {
        if (request.channelId === 'test-channel-1') {
          return Promise.resolve({
            channelId: 'test-channel-1',
            status: 'live' as const,
            statusText: 'Live',
            isLive: true,
            metrics: { fps: 30, bandwidth: 1500000 },
            lastUpdated: new Date()
          });
        } else {
          return Promise.reject(new Error('Channel not found'));
        }
      });

      // Collect data
      const result = await dataManager.collectData();
      
      
      // Should be marked as failed due to partial failure, but still have some data
      expect(result.success).toBe(false);
      expect(result.data).toHaveLength(1); // Only successful channel

      panel.update(result.data!);
      expect(panel.getCurrentChannelData()).not.toBeNull();
      expect(panel.getCurrentChannelData()!.channelId).toBe('test-channel-1');
    });
  });

  describe('Alert System Integration', () => {
    it('should trigger alerts and propagate through system', async () => {
      // Setup mock with high bitrate to trigger alert
      const mockStreamStatus = {
        channelId: 'test-channel-1',
        status: 'live' as const,
        statusText: 'Live',
        isLive: true,
        metrics: {
          fps: 30,
          bandwidth: 6000000 // 6 Mbps = 6000 kbps, above threshold of 5000
        },
        lastUpdated: new Date()
      };

      mockStreamService.getStreamStatus = jest.fn().mockResolvedValue(mockStreamStatus);

      // Listen for alerts
      const alertPromise = new Promise(resolve => {
        eventBus.once('component:alert', resolve);
      });

      // Collect data and update panel
      const result = await dataManager.collectData();
      panel.update(result.data!);

      // Wait for alert
      const alertData = await alertPromise;
      expect(alertData).toBeDefined();
      expect((alertData as any).alert.type).toBe('bitrate');
      expect((alertData as any).alert.level).toBe('error');
    });

    it('should handle alert cooldowns in continuous monitoring', async () => {
      // Create a single-channel data manager for this test
      const singleChannelDataManager = new DataManager(mockStreamService, mockChannelService, {
        refreshInterval: 1000,
        retryAttempts: 3,
        retryDelay: 1000,
        channels: ['test-channel-1'],
        enableStreaming: true,
        bufferSize: 100
      });

      // Setup mock with consistently high bitrate
      mockStreamService.getStreamStatus = jest.fn().mockResolvedValue({
        channelId: 'test-channel-1',
        status: 'live' as const,
        statusText: 'Live',
        isLive: true,
        metrics: {
          fps: 30,
          bandwidth: 6000000 // Above threshold
        },
        lastUpdated: new Date()
      });

      let alertCount = 0;
      eventBus.on('component:alert', () => {
        alertCount++;
      });

      // Collect data multiple times quickly
      for (let i = 0; i < 3; i++) {
        const result = await singleChannelDataManager.collectData();
        panel.update(result.data!);
        
        // Small delay between updates to ensure they are processed sequentially
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      // Should only trigger one alert due to cooldown
      expect(alertCount).toBe(1);
      
      singleChannelDataManager.destroy();
    });
  });

  describe('Multi-Channel Management Integration', () => {
    it('should manage multiple channels independently', async () => {
      // Setup different responses for different channels
      mockStreamService.getStreamStatus = jest.fn().mockImplementation((request) => {
        const channelId = request.channelId;
        const bitrate = channelId === 'test-channel-1' ? 1000000 : 2000000;
        const fps = channelId === 'test-channel-1' ? 25 : 30;

        return Promise.resolve({
          channelId,
          status: 'live' as const,
          statusText: 'Live',
          isLive: true,
          metrics: { fps, bandwidth: bitrate },
          lastUpdated: new Date()
        });
      });

      // Collect data
      const result = await dataManager.collectData();
      expect(result.data).toHaveLength(2);

      panel.update(result.data!);

      // Verify different channels have different data
      expect(panel.getAllChannelsData().size).toBe(2);

      const channel1Data = panel.getAllChannelsData().get('test-channel-1');
      const channel2Data = panel.getAllChannelsData().get('test-channel-2');

      expect(channel1Data!.dataPoints[0]?.bitrate).toBe(1000); // 1000000 bps = 1000 kbps
      expect(channel1Data!.dataPoints[0]?.fps).toBe(25);

      expect(channel2Data!.dataPoints[0]?.bitrate).toBe(2000); // 2000000 bps = 2000 kbps
      expect(channel2Data!.dataPoints[0]?.fps).toBe(30);
    });

    it('should handle channel switching with maintained data', async () => {
      // Setup and collect data for multiple channels
      mockStreamService.getStreamStatus = jest.fn().mockImplementation((request) => {
        return Promise.resolve({
          channelId: request.channelId,
          status: 'live' as const,
          statusText: 'Live',
          isLive: true,
          metrics: { fps: 30, bandwidth: 1500000 },
          lastUpdated: new Date()
        });
      });

      const result = await dataManager.collectData();
      panel.update(result.data!);

      // Initial channel should be the first one
      expect(panel.getCurrentChannelData()!.channelId).toBe('test-channel-1');

      // Switch channels and verify data persistence
      panel.setCurrentChannel('test-channel-2');
      expect(panel.getCurrentChannelData()!.channelId).toBe('test-channel-2');

      // Both channels should still have their data
      expect(panel.getAllChannelsData().size).toBe(2);
    });
  });

  describe('Performance Integration', () => {
    it('should handle high-frequency updates efficiently', async () => {
      // Create single-channel data manager for this test
      const singleChannelDataManager = new DataManager(mockStreamService, mockChannelService, {
        refreshInterval: 1000,
        retryAttempts: 3,
        retryDelay: 1000,
        channels: ['test-channel-1'],
        enableStreaming: true,
        bufferSize: 100
      });

      // Setup mock for rapid updates
      let localUpdateCount = 0;
      mockStreamService.getStreamStatus = jest.fn().mockImplementation(() => {
        localUpdateCount++;
        return Promise.resolve({
          channelId: 'test-channel-1',
          status: 'live' as const,
          statusText: 'Live',
          isLive: true,
          metrics: {
            fps: 30 + localUpdateCount,
            bandwidth: 1000000 + localUpdateCount * 10000
          },
          lastUpdated: new Date()
        });
      });

      const startTime = Date.now();

      // Perform rapid data collection with sequential updates
      for (let i = 0; i < 10; i++) {
        const result = await singleChannelDataManager.collectData();
        if (result.success && result.data) {
          panel.update(result.data);
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 5 seconds)
      expect(duration).toBeLessThan(5000);

      // Verify final state
      const channelData = panel.getCurrentChannelData();
      expect(channelData!.dataPoints.length).toBe(10);
      
      singleChannelDataManager.destroy();
    });

    it('should respect data point limits under continuous updates', async () => {
      // Create single-channel data manager for this test
      const singleChannelDataManager = new DataManager(mockStreamService, mockChannelService, {
        refreshInterval: 1000,
        retryAttempts: 3,
        retryDelay: 1000,
        channels: ['test-channel-1'],
        enableStreaming: true,
        bufferSize: 100
      });

      // Create panel with small data limit
      const limitedPanelConfig: StreamMetricsPanelConfig = {
        type: 'stream-metrics',
        position: { x: 0, y: 0, width: 100, height: 50 },
        size: { minWidth: 50, minHeight: 20 },
        config: {},
        visible: true,
        priority: 1,
        refreshInterval: 1000,
        maxDataPoints: 5, // Small limit
        channels: ['test-channel-1'],
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

      const limitedPanel = new StreamMetricsPanel(limitedPanelConfig, eventBus);

      let localUpdateCount = 0;
      mockStreamService.getStreamStatus = jest.fn().mockImplementation(() => {
        localUpdateCount++;
        return Promise.resolve({
          channelId: 'test-channel-1',
          status: 'live' as const,
          statusText: 'Live',
          isLive: true,
          metrics: {
            fps: 30 + localUpdateCount,
            bandwidth: 1000000 + localUpdateCount * 10000
          },
          lastUpdated: new Date(Date.now() + localUpdateCount * 1000)
        });
      });

      // Perform updates beyond the limit
      for (let i = 0; i < 10; i++) {
        const result = await singleChannelDataManager.collectData();
        limitedPanel.update(result.data!);
      }

      // Should maintain data point limit
      const channelData = limitedPanel.getCurrentChannelData();
      expect(channelData!.dataPoints).toHaveLength(5);

      // Should keep the most recent data (last 5 data points from 10 updates)
      const lastPoint = channelData!.dataPoints[4]!;
      expect(lastPoint.fps).toBe(40); // 30 + 10 (last update)

      limitedPanel.destroy();
      singleChannelDataManager.destroy();
    });
  });
});