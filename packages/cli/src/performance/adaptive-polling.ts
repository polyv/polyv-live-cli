/**
 * @fileoverview Adaptive polling manager for intelligent data collection
 * Dynamically adjusts polling intervals based on data change frequency
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';

/**
 * Configuration for adaptive polling behavior
 */
export interface AdaptivePollingConfig {
  /** Base polling interval in milliseconds */
  baseInterval: number;
  /** Minimum polling interval in milliseconds */
  minInterval: number;
  /** Maximum polling interval in milliseconds */
  maxInterval: number;
  /** Sensitivity multiplier for change detection */
  sensitivity: number;
  /** Number of samples to keep for volatility calculation */
  sampleSize: number;
  /** Rate limit for API calls per minute */
  rateLimitPerMinute: number;
}

/**
 * Data source statistics for polling optimization
 */
export interface DataSourceStats {
  /** Data source identifier */
  id: string;
  /** Current polling interval */
  currentInterval: number;
  /** Last poll timestamp */
  lastPoll: number;
  /** Number of changes detected */
  changeCount: number;
  /** Total number of polls */
  totalPolls: number;
  /** Change rate (changes per poll) */
  changeRate: number;
  /** Volatility score (0-1) */
  volatility: number;
  /** Last N change timestamps */
  changeSamples: number[];
}

/**
 * Batch request configuration
 */
export interface BatchRequestConfig {
  /** Maximum number of requests in a batch */
  maxBatchSize: number;
  /** Maximum time to wait for batch completion */
  batchTimeout: number;
  /** Minimum time between batches */
  batchInterval: number;
}

/**
 * API call statistics
 */
export interface ApiCallStats {
  /** Total number of API calls */
  totalCalls: number;
  /** Number of successful calls */
  successfulCalls: number;
  /** Number of failed calls */
  failedCalls: number;
  /** Average response time */
  averageResponseTime: number;
  /** Calls per minute */
  callsPerMinute: number;
  /** Last call timestamp */
  lastCallTime: number;
}

/**
 * Adaptive polling manager that optimizes API call frequency based on data volatility
 */
export class AdaptivePollingManager extends EventEmitter {
  private config: AdaptivePollingConfig;
  private dataSourceStats: Map<string, DataSourceStats> = new Map();
  private intervalTimers: Map<string, NodeJS.Timeout> = new Map();
  private batchConfig: BatchRequestConfig;
  private apiStats: ApiCallStats;
  private pendingRequests: Map<string, any[]> = new Map();
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  constructor(config: Partial<AdaptivePollingConfig> = {}) {
    super();
    
    this.config = {
      baseInterval: 5000, // 5 seconds
      minInterval: 1000, // 1 second
      maxInterval: 60000, // 1 minute
      sensitivity: 0.8,
      sampleSize: 10,
      rateLimitPerMinute: 60,
      ...config,
    };

    this.batchConfig = {
      maxBatchSize: 10,
      batchTimeout: 2000, // 2 seconds
      batchInterval: 500, // 0.5 seconds
    };

    this.apiStats = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      averageResponseTime: 0,
      callsPerMinute: 0,
      lastCallTime: 0,
    };

    this.setupRateLimitMonitoring();
  }

  /**
   * Start the adaptive polling manager
   */
  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.emit('started', {
      timestamp: Date.now(),
      config: this.config,
    });
  }

  /**
   * Stop the adaptive polling manager
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Clear all interval timers
    for (const [, timer] of this.intervalTimers) {
      clearInterval(timer);
    }
    this.intervalTimers.clear();

    // Clear all batch timers
    for (const [, timer] of this.batchTimers) {
      clearTimeout(timer);
    }
    this.batchTimers.clear();

    this.emit('stopped', {
      timestamp: Date.now(),
      stats: this.getStats(),
    });
  }

  /**
   * Register a data source for adaptive polling
   */
  public registerDataSource(
    dataSourceId: string,
    initialInterval?: number
  ): void {
    if (this.dataSourceStats.has(dataSourceId)) {
      return;
    }

    const stats: DataSourceStats = {
      id: dataSourceId,
      currentInterval: initialInterval || this.config.baseInterval,
      lastPoll: 0,
      changeCount: 0,
      totalPolls: 0,
      changeRate: 0,
      volatility: 0,
      changeSamples: [],
    };

    this.dataSourceStats.set(dataSourceId, stats);
    this.startPollingForDataSource(dataSourceId);

    this.emit('dataSourceRegistered', {
      dataSourceId,
      stats,
      timestamp: Date.now(),
    });
  }

  /**
   * Unregister a data source
   */
  public unregisterDataSource(dataSourceId: string): void {
    const timer = this.intervalTimers.get(dataSourceId);
    if (timer) {
      clearInterval(timer);
      this.intervalTimers.delete(dataSourceId);
    }

    this.dataSourceStats.delete(dataSourceId);
    this.pendingRequests.delete(dataSourceId);

    this.emit('dataSourceUnregistered', {
      dataSourceId,
      timestamp: Date.now(),
    });
  }

  /**
   * Report data changes for a specific data source
   */
  public reportDataChange(dataSourceId: string, changeData?: any): void {
    const stats = this.dataSourceStats.get(dataSourceId);
    if (!stats) {
      return;
    }

    const now = Date.now();
    stats.changeCount++;
    stats.changeSamples.push(now);

    // Keep only recent samples for volatility calculation
    if (stats.changeSamples.length > this.config.sampleSize) {
      stats.changeSamples.shift();
    }

    // Recalculate volatility and adjust interval
    this.updateVolatilityAndInterval(dataSourceId);

    this.emit('dataChange', {
      dataSourceId,
      changeData,
      stats,
      timestamp: now,
    });
  }

  /**
   * Get optimal polling interval for a data source
   */
  public getOptimalInterval(dataSourceId: string): number {
    const stats = this.dataSourceStats.get(dataSourceId);
    if (!stats) {
      return this.config.baseInterval;
    }

    return stats.currentInterval;
  }

  /**
   * Queue a request for batch processing
   */
  public queueBatchRequest(
    batchId: string,
    request: any,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.pendingRequests.has(batchId)) {
        this.pendingRequests.set(batchId, []);
      }

      const requests = this.pendingRequests.get(batchId)!;
      requests.push({
        request,
        priority,
        resolve,
        reject,
        timestamp: Date.now(),
      });

      // Sort by priority
      requests.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
      });

      // Start batch processing if we have enough requests or after timeout
      if (requests.length >= this.batchConfig.maxBatchSize) {
        this.processBatch(batchId);
      } else if (!this.batchTimers.has(batchId)) {
        const timer = setTimeout(() => {
          this.processBatch(batchId);
        }, this.batchConfig.batchTimeout);
        this.batchTimers.set(batchId, timer);
      }
    });
  }

  /**
   * Get API call statistics
   */
  public getApiStats(): ApiCallStats {
    return { ...this.apiStats };
  }

  /**
   * Get all data source statistics
   */
  public getDataSourceStats(): Map<string, DataSourceStats> {
    return new Map(this.dataSourceStats);
  }

  /**
   * Get overall statistics
   */
  public getStats(): {
    dataSourceCount: number;
    totalPolls: number;
    totalChanges: number;
    apiStats: ApiCallStats;
    averageInterval: number;
    activeDataSources: string[];
  } {
    const stats = Array.from(this.dataSourceStats.values());
    const totalPolls = stats.reduce((sum, s) => sum + s.totalPolls, 0);
    const totalChanges = stats.reduce((sum, s) => sum + s.changeCount, 0);
    const averageInterval = stats.length > 0 
      ? stats.reduce((sum, s) => sum + s.currentInterval, 0) / stats.length
      : this.config.baseInterval;

    return {
      dataSourceCount: stats.length,
      totalPolls,
      totalChanges,
      apiStats: this.getApiStats(),
      averageInterval,
      activeDataSources: Array.from(this.dataSourceStats.keys()),
    };
  }

  /**
   * Start polling for a specific data source
   */
  private startPollingForDataSource(dataSourceId: string): void {
    if (!this.isRunning) {
      return;
    }

    const stats = this.dataSourceStats.get(dataSourceId);
    if (!stats) {
      return;
    }

    const timer = setInterval(() => {
      this.pollDataSource(dataSourceId);
    }, stats.currentInterval);

    this.intervalTimers.set(dataSourceId, timer);
  }

  /**
   * Poll a specific data source
   */
  private async pollDataSource(dataSourceId: string): Promise<void> {
    const stats = this.dataSourceStats.get(dataSourceId);
    if (!stats) {
      return;
    }

    const now = Date.now();
    stats.lastPoll = now;
    stats.totalPolls++;

    // Update change rate
    stats.changeRate = stats.changeCount / Math.max(stats.totalPolls, 1);

    // Emit poll event for external handlers
    this.emit('poll', {
      dataSourceId,
      stats,
      timestamp: now,
    });

    // Track API call statistics
    this.trackApiCall(now);
  }

  /**
   * Update volatility score and adjust polling interval
   */
  private updateVolatilityAndInterval(dataSourceId: string): void {
    const stats = this.dataSourceStats.get(dataSourceId);
    if (!stats) {
      return;
    }

    // Calculate volatility based on recent change frequency
    const now = Date.now();
    const recentChanges = stats.changeSamples.filter(
      timestamp => now - timestamp < 60000 // Last minute
    );

    // Volatility score: 0 = no changes, 1 = very frequent changes
    stats.volatility = Math.min(
      recentChanges.length / this.config.sampleSize,
      1
    );

    // Adjust interval based on volatility
    const targetInterval = this.calculateOptimalInterval(stats.volatility);
    
    if (Math.abs(stats.currentInterval - targetInterval) > 1000) {
      stats.currentInterval = targetInterval;
      this.restartPollingForDataSource(dataSourceId);
    }
  }

  /**
   * Calculate optimal polling interval based on volatility
   */
  private calculateOptimalInterval(volatility: number): number {
    const { minInterval, maxInterval, sensitivity } = this.config;
    
    // High volatility = shorter interval, low volatility = longer interval
    const adjustedVolatility = Math.pow(volatility, sensitivity);
    const intervalRange = maxInterval - minInterval;
    const interval = maxInterval - (adjustedVolatility * intervalRange);
    
    return Math.max(minInterval, Math.min(maxInterval, interval));
  }

  /**
   * Restart polling for a data source with new interval
   */
  private restartPollingForDataSource(dataSourceId: string): void {
    const existingTimer = this.intervalTimers.get(dataSourceId);
    if (existingTimer) {
      clearInterval(existingTimer);
    }

    this.startPollingForDataSource(dataSourceId);

    this.emit('intervalAdjusted', {
      dataSourceId,
      newInterval: this.dataSourceStats.get(dataSourceId)?.currentInterval,
      timestamp: Date.now(),
    });
  }

  /**
   * Process a batch of requests
   */
  private async processBatch(batchId: string): Promise<void> {
    const requests = this.pendingRequests.get(batchId);
    if (!requests || requests.length === 0) {
      return;
    }

    // Clear timeout timer
    const timer = this.batchTimers.get(batchId);
    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(batchId);
    }

    // Process batch
    const batchRequests = requests.splice(0, this.batchConfig.maxBatchSize);
    
    try {
      this.emit('batchProcessing', {
        batchId,
        requestCount: batchRequests.length,
        timestamp: Date.now(),
      });

      // Here you would implement actual batch processing logic
      // For now, we'll simulate processing each request
      for (const batchRequest of batchRequests) {
        try {
          // Simulate processing
          await new Promise(resolve => setTimeout(resolve, 100));
          batchRequest.resolve({ success: true, processed: true });
        } catch (error) {
          batchRequest.reject(error);
        }
      }

      this.emit('batchProcessed', {
        batchId,
        processedCount: batchRequests.length,
        timestamp: Date.now(),
      });

    } catch (error) {
      // Reject all requests in the batch
      for (const batchRequest of batchRequests) {
        batchRequest.reject(error);
      }

      this.emit('batchError', {
        batchId,
        error,
        timestamp: Date.now(),
      });
    }

    // If there are more requests, schedule next batch
    if (requests.length > 0) {
      const nextTimer = setTimeout(() => {
        this.processBatch(batchId);
      }, this.batchConfig.batchInterval);
      this.batchTimers.set(batchId, nextTimer);
    }
  }

  /**
   * Track API call statistics
   */
  private trackApiCall(timestamp: number): void {
    this.apiStats.totalCalls++;
    this.apiStats.lastCallTime = timestamp;

    // Update calls per minute
    // const oneMinuteAgo = timestamp - 60000; // May be used for future analysis
    // This is a simplified calculation - in practice, you'd want to maintain
    // a sliding window of call timestamps
    this.apiStats.callsPerMinute = this.apiStats.totalCalls; // Simplified
  }

  /**
   * Set up rate limit monitoring
   */
  private setupRateLimitMonitoring(): void {
    setInterval(() => {
      const callsPerMinute = this.apiStats.callsPerMinute;
      const rateLimitThreshold = this.config.rateLimitPerMinute * 0.8; // 80% threshold

      if (callsPerMinute > rateLimitThreshold) {
        this.emit('rateLimitWarning', {
          callsPerMinute,
          rateLimitPerMinute: this.config.rateLimitPerMinute,
          timestamp: Date.now(),
        });

        // Increase intervals for all data sources to reduce call frequency
        for (const [dataSourceId, stats] of this.dataSourceStats) {
          if (stats.currentInterval < this.config.maxInterval) {
            stats.currentInterval = Math.min(
              stats.currentInterval * 1.5,
              this.config.maxInterval
            );
            this.restartPollingForDataSource(dataSourceId);
          }
        }
      }
    }, 60000); // Check every minute
  }
}