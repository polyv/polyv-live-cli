/**
 * @fileoverview Data management utility for monitoring components
 * @author Development Team
 * @since 5.2.0
 */

import { EventEmitter } from 'events';
import { StreamServiceSdk } from '../services/stream.service.sdk';
import { ChannelServiceSdk } from '../services/channel.service.sdk';
import { StreamMetrics } from '../types/monitoring';

/**
 * Configuration for data manager
 */
export interface DataManagerConfig {
  refreshInterval: number;
  retryAttempts: number;
  retryDelay: number;
  channels: string[];
  enableStreaming: boolean;
  bufferSize: number;
}

/**
 * Data collection result
 */
export interface DataCollectionResult {
  success: boolean;
  data?: StreamMetrics[];
  error?: Error | undefined;
  timestamp: Date;
  duration: number;
}

/**
 * Channel data cache entry
 */
interface ChannelCacheEntry {
  channelId: string;
  lastUpdate: Date;
  metrics?: StreamMetrics;
  error?: Error | undefined;
  retryCount: number;
}

/**
 * Data manager for coordinating stream metrics collection
 */
export class DataManager extends EventEmitter {
  private streamService: StreamServiceSdk;
  // @ts-ignore - Reserved for future use
  private _channelService: ChannelServiceSdk;
  private config: DataManagerConfig;
  private isRunning = false;
  private refreshTimer?: NodeJS.Timeout;
  private channelCache: Map<string, ChannelCacheEntry>;
  private lastCollectionTime: Date;

  constructor(
    streamService: StreamServiceSdk,
    channelService: ChannelServiceSdk,
    config: DataManagerConfig
  ) {
    super();
    this.streamService = streamService;
    this._channelService = channelService;
    this.config = config;
    this.channelCache = new Map();
    this.lastCollectionTime = new Date(0);

    this.setMaxListeners(50); // Increase listener limit for monitoring
  }

  /**
   * Starts data collection
   */
  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.scheduleNextCollection();
    
    this.emit('dataManager:started', {
      timestamp: new Date(),
      config: this.config
    });
  }

  /**
   * Stops data collection
   */
  public stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined!;
    }

    this.emit('dataManager:stopped', {
      timestamp: new Date()
    });
  }

  /**
   * Adds a channel to monitor
   * @param channelId Channel ID to add
   */
  public addChannel(channelId: string): void {
    if (!this.config.channels.includes(channelId)) {
      this.config.channels.push(channelId);
      
      // Initialize cache entry
      this.channelCache.set(channelId, {
        channelId,
        lastUpdate: new Date(0),
        retryCount: 0
      });

      this.emit('dataManager:channelAdded', {
        channelId,
        timestamp: new Date()
      });

      // Trigger immediate collection for new channel if running
      if (this.isRunning) {
        this.collectChannelData(channelId);
      }
    }
  }

  /**
   * Removes a channel from monitoring
   * @param channelId Channel ID to remove
   */
  public removeChannel(channelId: string): void {
    const index = this.config.channels.indexOf(channelId);
    if (index !== -1) {
      this.config.channels.splice(index, 1);
      this.channelCache.delete(channelId);

      this.emit('dataManager:channelRemoved', {
        channelId,
        timestamp: new Date()
      });
    }
  }

  /**
   * Gets cached data for a specific channel
   * @param channelId Channel ID
   * @returns Cached channel data or null
   */
  public getChannelData(channelId: string): StreamMetrics | null {
    const entry = this.channelCache.get(channelId);
    return entry?.metrics || null;
  }

  /**
   * Gets cached data for all channels
   * @returns Array of stream metrics
   */
  public getAllChannelsData(): StreamMetrics[] {
    const results: StreamMetrics[] = [];
    
    for (const entry of this.channelCache.values()) {
      if (entry.metrics) {
        results.push(entry.metrics);
      }
    }

    return results;
  }

  /**
   * Manually triggers data collection for all channels
   * @returns Promise resolving to collection result
   */
  public async collectData(): Promise<DataCollectionResult> {
    const startTime = Date.now();
    const timestamp = new Date();

    try {
      const metrics: StreamMetrics[] = [];
      const errors: Error[] = [];

      // Collect data for all channels in parallel
      const promises = this.config.channels.map(channelId => 
        this.collectChannelData(channelId).catch(error => {
          errors.push(error);
          return null;
        })
      );

      const results = await Promise.all(promises);

      // Filter out null results and add to metrics array
      for (const result of results) {
        if (result) {
          metrics.push(result);
        }
      }

      this.lastCollectionTime = timestamp;
      const duration = Date.now() - startTime;

      const collectionResult: DataCollectionResult = {
        success: errors.length === 0,
        data: metrics,
        error: errors.length > 0 ? errors[0] : undefined,
        timestamp,
        duration
      };

      // Emit collected data
      this.emit('dataManager:dataCollected', {
        ...collectionResult,
        channelCount: this.config.channels.length,
        successCount: metrics.length,
        errorCount: errors.length
      });

      return collectionResult;

    } catch (error) {
      const duration = Date.now() - startTime;
      const collectionResult: DataCollectionResult = {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown collection error'),
        timestamp,
        duration
      };

      this.emit('dataManager:dataCollected', collectionResult);
      return collectionResult;
    }
  }

  /**
   * Collects data for a specific channel
   * @param channelId Channel ID to collect data for
   * @returns Promise resolving to stream metrics
   */
  private async collectChannelData(channelId: string): Promise<StreamMetrics | null> {
    const entry = this.channelCache.get(channelId) || {
      channelId,
      lastUpdate: new Date(0),
      retryCount: 0
    };

    try {
      // Get stream status which includes metrics for live channels
      const streamStatus = await this.streamService.getStreamStatus({ channelId });
      
      // Transform stream status to StreamMetrics format
      const metrics: StreamMetrics = {
        channelId,
        bitrate: streamStatus.metrics?.bandwidth ? Math.round(streamStatus.metrics.bandwidth / 1000) : 0, // Convert to kbps
        fps: streamStatus.metrics?.fps || 0,
        resolution: '1920x1080', // Default resolution - could be enhanced later
        viewerCount: 0, // Would need additional API call to get viewer count
        status: streamStatus.isLive ? 'live' : 'offline',
        uptime: streamStatus.duration || 0,
        bandwidth: streamStatus.metrics?.bandwidth || 0,
        lastUpdate: new Date()
      };

      // Update cache
      entry.metrics = metrics;
      entry.lastUpdate = new Date();
      entry.error = undefined;
      entry.retryCount = 0;
      this.channelCache.set(channelId, entry);

      // Emit channel-specific update
      this.emit('dataManager:channelUpdated', {
        channelId,
        metrics,
        timestamp: new Date()
      });

      return metrics;

    } catch (error) {
      // Update cache with error
      entry.error = error instanceof Error ? error : new Error('Unknown channel error');
      entry.retryCount++;
      entry.lastUpdate = new Date();
      this.channelCache.set(channelId, entry);

      // Emit channel error
      this.emit('dataManager:channelError', {
        channelId,
        error: entry.error,
        retryCount: entry.retryCount,
        timestamp: new Date()
      });

      // Re-throw error so it can be caught in collectData
      throw entry.error;
    }
  }

  /**
   * Schedules the next data collection
   */
  private scheduleNextCollection(): void {
    if (!this.isRunning) return;

    this.refreshTimer = setTimeout(async () => {
      if (this.isRunning) {
        await this.collectData();
        this.scheduleNextCollection();
      }
    }, this.config.refreshInterval);
  }

  /**
   * Updates the refresh interval
   * @param intervalMs New refresh interval in milliseconds
   */
  public setRefreshInterval(intervalMs: number): void {
    this.config.refreshInterval = intervalMs;
    
    // Restart collection with new interval if running
    if (this.isRunning) {
      this.stop();
      this.start();
    }

    this.emit('dataManager:configUpdated', {
      refreshInterval: intervalMs,
      timestamp: new Date()
    });
  }

  /**
   * Gets current configuration
   */
  public getConfig(): DataManagerConfig {
    return { ...this.config };
  }

  /**
   * Gets collection statistics
   */
  public getStats(): {
    isRunning: boolean;
    channelCount: number;
    lastCollectionTime: Date;
    cacheStats: {
      totalEntries: number;
      activeChannels: number;
      errorChannels: number;
    };
  } {
    let activeChannels = 0;
    let errorChannels = 0;

    for (const entry of this.channelCache.values()) {
      if (entry.metrics) {
        activeChannels++;
      }
      if (entry.error) {
        errorChannels++;
      }
    }

    return {
      isRunning: this.isRunning,
      channelCount: this.config.channels.length,
      lastCollectionTime: this.lastCollectionTime,
      cacheStats: {
        totalEntries: this.channelCache.size,
        activeChannels,
        errorChannels
      }
    };
  }

  /**
   * Clears all cached data
   */
  public clearCache(): void {
    this.channelCache.clear();
    
    this.emit('dataManager:cacheCleared', {
      timestamp: new Date()
    });
  }

  /**
   * Destroys the data manager and cleans up resources
   */
  public destroy(): void {
    this.stop();
    this.clearCache();
    this.removeAllListeners();
  }
}