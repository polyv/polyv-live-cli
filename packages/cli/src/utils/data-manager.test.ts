/**
 * @fileoverview Unit tests for DataManager
 * @author Development Team
 * @since 5.2.0
 */

import { DataManager, DataManagerConfig } from './data-manager';
import { StreamServiceSdk } from '../services/stream.service.sdk';
import { ChannelServiceSdk } from '../services/channel.service.sdk';

describe('DataManager', () => {
  let dataManager: DataManager;
  let mockStreamService: jest.Mocked<StreamServiceSdk>;
  let mockChannelService: jest.Mocked<ChannelServiceSdk>;
  let config: DataManagerConfig;

  beforeEach(() => {
    // Create mock service instances
    mockStreamService = {
      getStreamStatus: jest.fn(),
      getStreamKey: jest.fn(),
      startStream: jest.fn(),
      stopStream: jest.fn()
    } as any;

    mockChannelService = {
      createChannel: jest.fn(),
      getChannel: jest.fn(),
      updateChannel: jest.fn(),
      deleteChannel: jest.fn(),
      listChannels: jest.fn()
    } as any;

    config = {
      refreshInterval: 1000,
      retryAttempts: 3,
      retryDelay: 1000,
      channels: ['channel-1', 'channel-2'],
      enableStreaming: true,
      bufferSize: 100
    };

    dataManager = new DataManager(mockStreamService, mockChannelService, config);
  });

  afterEach(() => {
    dataManager.destroy();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with correct configuration', () => {
      const retrievedConfig = dataManager.getConfig();
      expect(retrievedConfig).toEqual(config);
    });

    it('should set max listeners to 50', () => {
      expect(dataManager.getMaxListeners()).toBe(50);
    });

    it('should initialize with empty cache and not running state', () => {
      const stats = dataManager.getStats();
      expect(stats.isRunning).toBe(false);
      expect(stats.channelCount).toBe(2);
      expect(stats.cacheStats.totalEntries).toBe(0);
      expect(stats.cacheStats.activeChannels).toBe(0);
      expect(stats.cacheStats.errorChannels).toBe(0);
    });
  });

  describe('Channel Management', () => {
    it('should add new channel and initialize cache entry', (done) => {
      const newChannelId = 'new-channel';

      dataManager.once('dataManager:channelAdded', (event) => {
        expect(event.channelId).toBe(newChannelId);
        expect(event.timestamp).toBeInstanceOf(Date);

        const updatedConfig = dataManager.getConfig();
        expect(updatedConfig.channels).toContain(newChannelId);

        const stats = dataManager.getStats();
        expect(stats.channelCount).toBe(3);

        done();
      });

      dataManager.addChannel(newChannelId);
    });

    it('should not add duplicate channels', () => {
      const initialChannelCount = dataManager.getConfig().channels.length;
      dataManager.addChannel('channel-1'); // Already exists

      expect(dataManager.getConfig().channels.length).toBe(initialChannelCount);
    });

    it('should remove existing channel and clean up cache', (done) => {
      const channelToRemove = 'channel-1';

      dataManager.once('dataManager:channelRemoved', (event) => {
        expect(event.channelId).toBe(channelToRemove);
        expect(event.timestamp).toBeInstanceOf(Date);

        const updatedConfig = dataManager.getConfig();
        expect(updatedConfig.channels).not.toContain(channelToRemove);

        const stats = dataManager.getStats();
        expect(stats.channelCount).toBe(1);

        done();
      });

      dataManager.removeChannel(channelToRemove);
    });

    it('should not remove non-existent channel', () => {
      const initialChannelCount = dataManager.getConfig().channels.length;
      dataManager.removeChannel('non-existent-channel');

      expect(dataManager.getConfig().channels.length).toBe(initialChannelCount);
    });

    it('should trigger immediate collection for new channel when running', (done) => {
      mockStreamService.getStreamStatus = jest.fn().mockResolvedValue({
        channelId: 'new-channel',
        status: 'live' as const,
        statusText: 'Live',
        isLive: true,
        metrics: { fps: 30, bandwidth: 1500000 },
        lastUpdated: new Date()
      });

      dataManager.start();

      dataManager.once('dataManager:channelUpdated', (event) => {
        if (event.channelId === 'new-channel') {
          expect(event.metrics.channelId).toBe('new-channel');
          expect(event.metrics.bitrate).toBe(1500); // 1500000 / 1000
          done();
        }
      });

      dataManager.addChannel('new-channel');
    });
  });

  describe('Data Collection', () => {
    beforeEach(() => {
      mockStreamService.getStreamStatus = jest.fn().mockImplementation((request) => {
        return Promise.resolve({
          channelId: request.channelId,
          status: 'live' as const,
          statusText: 'Live',
          isLive: true,
          duration: 3600000,
          metrics: {
            fps: 30,
            bandwidth: 1500000
          },
          lastUpdated: new Date()
        });
      });
    });

    it('should collect data for all channels successfully', async () => {
      const result = await dataManager.collectData();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.error).toBeUndefined();
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.duration).toBeGreaterThanOrEqual(0);

      expect(mockStreamService.getStreamStatus).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures correctly', async () => {
      mockStreamService.getStreamStatus = jest.fn().mockImplementation((request) => {
        if (request.channelId === 'channel-1') {
          return Promise.resolve({
            channelId: 'channel-1',
            status: 'live' as const,
            statusText: 'Live',
            isLive: true,
            metrics: { fps: 30, bandwidth: 1500000 },
            lastUpdated: new Date()
          });
        }
        return Promise.reject(new Error('Collection failed'));
      });

      const result = await dataManager.collectData();

      expect(result.success).toBe(false);
      expect(result.data).toHaveLength(1);
      expect(result.error).toBeInstanceOf(Error);
    });

    it('should handle complete collection failure', async () => {
      mockStreamService.getStreamStatus = jest.fn().mockRejectedValue(new Error('All failed'));

      const result = await dataManager.collectData();

      expect(result.success).toBe(false);
      expect(result.data).toHaveLength(0);
      expect(result.error).toBeInstanceOf(Error);
    });

    it('should update cache after successful collection', async () => {
      await dataManager.collectData();

      const stats = dataManager.getStats();
      expect(stats.cacheStats.totalEntries).toBe(2);
      expect(stats.cacheStats.activeChannels).toBe(2);
    });
  });

  describe('Start/Stop Behavior', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should schedule automatic collection when started', async () => {
      const collectDataSpy = jest.spyOn(dataManager, 'collectData');

      dataManager.start();

      // Fast forward time to trigger collection
      jest.advanceTimersByTime(config.refreshInterval);

      // Allow promises to resolve
      await Promise.resolve();

      expect(collectDataSpy).toHaveBeenCalled();

      collectDataSpy.mockRestore();
    });

    it('should not schedule collection when stopped', () => {
      const collectDataSpy = jest.spyOn(dataManager, 'collectData');

      dataManager.start();
      dataManager.stop();

      // Fast forward time
      jest.advanceTimersByTime(config.refreshInterval * 2);

      expect(collectDataSpy).not.toHaveBeenCalled();

      collectDataSpy.mockRestore();
    });

    it('should continue scheduling after collection completes', async () => {
      const collectDataSpy = jest.spyOn(dataManager, 'collectData').mockResolvedValue({
        success: true,
        data: [],
        timestamp: new Date(),
        duration: 0
      });

      dataManager.start();

      // First collection
      jest.advanceTimersByTime(config.refreshInterval);
      await jest.runAllTicks();

      // Second collection
      jest.advanceTimersByTime(config.refreshInterval);
      await jest.runAllTicks();

      expect(collectDataSpy).toHaveBeenCalledTimes(2);

      collectDataSpy.mockRestore();
    });
  });

  describe('Error handling branch coverage', () => {
    it('should handle collection errors and emit error result', async () => {
      // Setup a mock stream service that throws an error
      const mockStreamServiceError = {
        getStreamStatus: jest.fn().mockRejectedValue(new Error('Collection failed')),
        getStreamKey: jest.fn(),
        startStream: jest.fn(),
        stopStream: jest.fn()
      } as any;

      const testManager = new DataManager(mockStreamServiceError, mockChannelService, config);
      const emitSpy = jest.spyOn(testManager, 'emit');

      const result = await testManager.collectData();

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Collection failed');
      expect(emitSpy).toHaveBeenCalledWith('dataManager:dataCollected', expect.objectContaining({
        success: false,
        channelCount: 2,
        successCount: 0,
        errorCount: 2
      }));

      testManager.destroy();
    });

    it('should handle non-Error exceptions in collection', async () => {
      // Setup a mock stream service that throws a non-Error object
      const mockStreamServiceError = {
        getStreamStatus: jest.fn().mockRejectedValue('String error'),
        getStreamKey: jest.fn(),
        startStream: jest.fn(),
        stopStream: jest.fn()
      } as any;

      const testManager = new DataManager(mockStreamServiceError, mockChannelService, config);

      const result = await testManager.collectData();

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Unknown channel error');

      testManager.destroy();
    });

    it('should count active and error channels in statistics', () => {
      // Add some channels with metrics (active)
      (dataManager as any).channelCache.set('channel1', {
        channelId: 'channel1',
        metrics: { fps: 30, bandwidth: 1000000 },
        lastUpdated: new Date()
      });

      (dataManager as any).channelCache.set('channel2', {
        channelId: 'channel2',
        metrics: { fps: 25, bandwidth: 800000 },
        lastUpdated: new Date()
      });

      // Add a channel with error
      (dataManager as any).channelCache.set('channel3', {
        channelId: 'channel3',
        error: new Error('Channel error'),
        lastUpdated: new Date()
      });

      const stats = dataManager.getStats();

      expect(stats.cacheStats.activeChannels).toBe(2);
      expect(stats.cacheStats.errorChannels).toBe(1);
    });

    it('should handle general collection failure in catch block', async () => {
      // Create a scenario where the entire collection method throws
      const mockStreamServiceThrowing = {
        getStreamStatus: jest.fn(),
        getStreamKey: jest.fn(),
        startStream: jest.fn(),
        stopStream: jest.fn()
      } as any;

      const testManager = new DataManager(mockStreamServiceThrowing, mockChannelService, config);

      // Mock map function to throw an error
      const originalMap = Array.prototype.map;
      Array.prototype.map = jest.fn().mockImplementation(() => {
        throw new Error('Array map failed');
      });

      const result = await testManager.collectData();

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Array map failed');
      expect(result.data).toBeUndefined();

      // Restore original map function
      Array.prototype.map = originalMap;
      testManager.destroy();
    });
  });
});
