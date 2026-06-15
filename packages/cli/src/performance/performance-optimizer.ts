/**
 * @fileoverview Main performance optimizer that coordinates all optimization components
 * Integrates adaptive polling, render optimization, memory management, and more
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';
import { AdaptivePollingManager, AdaptivePollingConfig } from './adaptive-polling';
import { RenderOptimizer, RenderOptimizerConfig } from './render-optimizer';
import { MemoryManager, MemoryManagerConfig } from './memory-manager';
import { ApiOptimizer, ApiOptimizerConfig } from './api-optimizer';
import { BatchRequestManager, BatchRequestConfig } from './batch-request-manager';
import { ApiAnalytics, ApiAnalyticsConfig } from './api-analytics';
import { ChangeDetector, ChangeDetectionConfig } from './change-detector';
import { ConnectionPoolManager, ConnectionPoolConfig } from './connection-pool-manager';
import { FallbackManager, FallbackManagerConfig } from './fallback-manager';
import { PerformanceMonitor, PerformanceMonitorConfig } from './performance-monitor';
import { ErrorRecoveryManager, ErrorRecoveryConfig } from './error-recovery-manager';

/**
 * Overall performance optimizer configuration
 */
export interface PerformanceOptimizerConfig {
  /** Enable adaptive polling optimization */
  enableAdaptivePolling: boolean;
  /** Enable render optimization */
  enableRenderOptimization: boolean;
  /** Enable memory management */
  enableMemoryManagement: boolean;
  /** Enable API optimization */
  enableApiOptimization: boolean;
  /** Enable batch request management */
  enableBatchRequests: boolean;
  /** Enable API analytics */
  enableApiAnalytics: boolean;
  /** Enable change detection */
  enableChangeDetection: boolean;
  /** Enable connection pooling */
  enableConnectionPooling: boolean;
  /** Enable fallback management */
  enableFallbackManagement: boolean;
  /** Enable performance monitoring */
  enablePerformanceMonitoring: boolean;
  /** Enable error recovery */
  enableErrorRecovery: boolean;
  /** Performance monitoring interval */
  monitoringInterval: number;
  /** Auto-optimization threshold */
  autoOptimizationThreshold: number;
  /** Adaptive polling configuration */
  adaptivePolling?: Partial<AdaptivePollingConfig>;
  /** Render optimizer configuration */
  renderOptimizer?: Partial<RenderOptimizerConfig>;
  /** Memory manager configuration */
  memoryManager?: Partial<MemoryManagerConfig>;
  /** API optimizer configuration */
  apiOptimizer?: Partial<ApiOptimizerConfig>;
  /** Batch request configuration */
  batchRequests?: Partial<BatchRequestConfig>;
  /** API analytics configuration */
  apiAnalytics?: Partial<ApiAnalyticsConfig>;
  /** Change detection configuration */
  changeDetection?: Partial<ChangeDetectionConfig>;
  /** Connection pooling configuration */
  connectionPooling?: Partial<ConnectionPoolConfig>;
  /** Fallback management configuration */
  fallbackManagement?: Partial<FallbackManagerConfig>;
  /** Performance monitoring configuration */
  performanceMonitoring?: Partial<PerformanceMonitorConfig>;
  /** Error recovery configuration */
  errorRecovery?: Partial<ErrorRecoveryConfig>;
}

/**
 * Performance metrics from all components
 */
export interface PerformanceMetrics {
  /** Overall performance score (0-100) */
  overallScore: number;
  /** Individual component metrics */
  components: {
    adaptivePolling?: any;
    renderOptimizer?: any;
    memoryManager?: any;
    apiOptimizer?: any;
    batchRequests?: any;
    apiAnalytics?: any;
    changeDetection?: any;
    connectionPooling?: any;
    fallbackManagement?: any;
    performanceMonitoring?: any;
    errorRecovery?: any;
  };
  /** Performance recommendations */
  recommendations: string[];
  /** System resource usage */
  systemResources: {
    cpu: number;
    memory: number;
    networkRequests: number;
    renderFrameRate: number;
  };
  /** Optimization impact */
  optimizationImpact: {
    apiCallsReduced: number;
    memoryFreed: number;
    renderTimeImproved: number;
    networkBandwidthSaved: number;
  };
}

/**
 * Main performance optimizer that coordinates all optimization components
 */
export class PerformanceOptimizer extends EventEmitter {
  private config: PerformanceOptimizerConfig;
  private adaptivePollingManager?: AdaptivePollingManager;
  private renderOptimizer?: RenderOptimizer;
  private memoryManager?: MemoryManager;
  private apiOptimizer?: ApiOptimizer;
  private batchRequestManager?: BatchRequestManager;
  private apiAnalytics?: ApiAnalytics;
  private changeDetector?: ChangeDetector;
  private connectionPoolManager?: ConnectionPoolManager;
  private fallbackManager?: FallbackManager;
  private performanceMonitor?: PerformanceMonitor;
  private errorRecoveryManager?: ErrorRecoveryManager;
  private monitoringTimer?: NodeJS.Timeout;
  private isRunning = false;
  private startTime = Date.now();

  constructor(config: Partial<PerformanceOptimizerConfig> = {}) {
    super();
    
    this.config = {
      enableAdaptivePolling: true,
      enableRenderOptimization: true,
      enableMemoryManagement: true,
      enableApiOptimization: true,
      enableBatchRequests: true,
      enableApiAnalytics: true,
      enableChangeDetection: true,
      enableConnectionPooling: true,
      enableFallbackManagement: true,
      enablePerformanceMonitoring: true,
      enableErrorRecovery: true,
      monitoringInterval: 10000, // 10 seconds
      autoOptimizationThreshold: 70, // Score below 70 triggers auto-optimization
      ...config,
    };

    this.initializeComponents();
    this.setupEventHandlers();
  }

  /**
   * Start performance optimization
   */
  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.startTime = Date.now();

    // Start all enabled components
    if (this.config.enableAdaptivePolling && this.adaptivePollingManager) {
      this.adaptivePollingManager.start();
    }

    if (this.config.enableRenderOptimization && this.renderOptimizer) {
      this.renderOptimizer.start();
    }

    if (this.config.enableMemoryManagement && this.memoryManager) {
      this.memoryManager.start();
    }

    if (this.config.enableApiAnalytics && this.apiAnalytics) {
      this.apiAnalytics.start();
    }

    if (this.config.enableBatchRequests && this.batchRequestManager) {
      this.batchRequestManager.start();
    }

    if (this.config.enableConnectionPooling && this.connectionPoolManager) {
      this.connectionPoolManager.start();
    }

    if (this.config.enableFallbackManagement && this.fallbackManager) {
      this.fallbackManager.start();
    }

    if (this.config.enablePerformanceMonitoring && this.performanceMonitor) {
      this.performanceMonitor.start();
    }

    if (this.config.enableErrorRecovery && this.errorRecoveryManager) {
      this.errorRecoveryManager.start();
    }

    // Start performance monitoring
    this.startPerformanceMonitoring();

    this.emit('optimizerStarted', {
      timestamp: Date.now(),
      config: this.config,
    });
  }

  /**
   * Stop performance optimization
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Stop monitoring
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined as any;
    }

    // Stop all components
    if (this.adaptivePollingManager) {
      this.adaptivePollingManager.stop();
    }

    if (this.renderOptimizer) {
      this.renderOptimizer.stop();
    }

    if (this.memoryManager) {
      this.memoryManager.stop();
    }

    if (this.apiAnalytics) {
      this.apiAnalytics.stop();
    }

    if (this.batchRequestManager) {
      this.batchRequestManager.stop();
    }

    if (this.connectionPoolManager) {
      this.connectionPoolManager.stop();
    }

    if (this.fallbackManager) {
      this.fallbackManager.stop();
    }

    if (this.performanceMonitor) {
      this.performanceMonitor.stop();
    }

    if (this.errorRecoveryManager) {
      this.errorRecoveryManager.stop();
    }

    const finalMetrics = this.getPerformanceMetrics();
    const uptime = Date.now() - this.startTime;

    this.emit('optimizerStopped', {
      timestamp: Date.now(),
      uptime,
      finalMetrics,
    });
  }

  /**
   * Get comprehensive performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    const components: PerformanceMetrics['components'] = {};

    // Collect metrics from each component
    if (this.adaptivePollingManager) {
      components.adaptivePolling = this.adaptivePollingManager.getStats();
    }

    if (this.renderOptimizer) {
      components.renderOptimizer = this.renderOptimizer.getMetrics();
    }

    if (this.memoryManager) {
      components.memoryManager = this.memoryManager.getStats();
    }

    if (this.apiOptimizer) {
      components.apiOptimizer = this.apiOptimizer.getStats();
    }

    if (this.batchRequestManager) {
      components.batchRequests = this.batchRequestManager.getStats();
    }

    if (this.apiAnalytics) {
      components.apiAnalytics = this.apiAnalytics.getPerformanceMetrics();
    }

    if (this.changeDetector) {
      components.changeDetection = this.changeDetector.getStatistics();
    }

    if (this.connectionPoolManager) {
      components.connectionPooling = this.connectionPoolManager.getStats();
    }

    if (this.fallbackManager) {
      components.fallbackManagement = this.fallbackManager.getStats();
    }

    if (this.performanceMonitor) {
      components.performanceMonitoring = this.performanceMonitor.getMetrics();
    }

    if (this.errorRecoveryManager) {
      components.errorRecovery = this.errorRecoveryManager.getStatistics();
    }

    // Calculate overall performance score
    const overallScore = this.calculatePerformanceScore(components);

    // Generate recommendations
    const recommendations = this.generateRecommendations(components, overallScore);

    // Calculate system resource usage
    const systemResources = this.calculateSystemResources(components);

    // Calculate optimization impact
    const optimizationImpact = this.calculateOptimizationImpact(components);

    return {
      overallScore,
      components,
      recommendations,
      systemResources,
      optimizationImpact,
    };
  }

  /**
   * Register a component for render optimization
   */
  public registerComponent(
    componentId: string,
    componentType: string,
    options?: any
  ): void {
    if (this.renderOptimizer) {
      this.renderOptimizer.registerComponent(componentId, componentType, options);
    }
  }

  /**
   * Register a data source for adaptive polling
   */
  public registerDataSource(dataSourceId: string, initialInterval?: number): void {
    if (this.adaptivePollingManager) {
      this.adaptivePollingManager.registerDataSource(dataSourceId, initialInterval);
    }
  }

  /**
   * Optimize API request
   */
  public async optimizeApiRequest(
    method: string,
    url: string,
    params?: Record<string, any>,
    body?: any,
    options?: any
  ): Promise<any> {
    // Record request in analytics
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = performance.now();

    try {
      let result;

      // Use batch requests if enabled
      if (this.config.enableBatchRequests && this.batchRequestManager) {
        result = await this.batchRequestManager.addRequest(method, url, params, body, options);
      } 
      // Use API optimizer if enabled
      else if (this.config.enableApiOptimization && this.apiOptimizer) {
        result = await this.apiOptimizer.optimizeRequest(method, url, params, body, options);
      } 
      // Fall back to direct request
      else {
        // This would be replaced with actual HTTP client call
        result = { method, url, params, body, timestamp: Date.now() };
      }

      // Record successful request
      const responseTime = performance.now() - startTime;
      if (this.apiAnalytics) {
        this.apiAnalytics.recordRequest(requestId, method, url, responseTime, {
          success: true,
          requestSize: this.estimateSize(params, body),
          responseSize: this.estimateSize(result),
        });
      }

      return result;

    } catch (error) {
      // Record failed request
      const responseTime = performance.now() - startTime;
      if (this.apiAnalytics) {
        this.apiAnalytics.recordRequest(requestId, method, url, responseTime, {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          requestSize: this.estimateSize(params, body),
        });
      }

      throw error;
    }
  }

  /**
   * Report data change for adaptive polling
   */
  public reportDataChange(dataSourceId: string, changeData?: any): void {
    if (this.adaptivePollingManager) {
      this.adaptivePollingManager.reportDataChange(dataSourceId, changeData);
    }

    if (this.changeDetector) {
      this.changeDetector.detectChange(dataSourceId, changeData);
    }
  }

  /**
   * Mark component as dirty for render optimization
   */
  public markComponentDirty(componentId: string, force = false): void {
    if (this.renderOptimizer) {
      this.renderOptimizer.markDirty(componentId, force);
    }
  }

  /**
   * Register a resource for memory management
   */
  public registerResource(resource: any): void {
    if (this.memoryManager) {
      this.memoryManager.registerResource(resource);
    }
  }

  /**
   * Force optimization of all components
   */
  public async forceOptimization(): Promise<void> {
    this.emit('optimizationStarted', {
      timestamp: Date.now(),
    });

    // Force memory cleanup
    if (this.memoryManager) {
      await this.memoryManager.forceCleanup();
    }

    // Flush pending renders
    if (this.renderOptimizer) {
      await this.renderOptimizer.flushRenders();
    }

    // Flush pending batch requests
    if (this.batchRequestManager) {
      await this.batchRequestManager.flushPendingRequests();
    }

    // Invalidate API cache
    if (this.apiOptimizer) {
      this.apiOptimizer.invalidateCache();
    }

    this.emit('optimizationCompleted', {
      timestamp: Date.now(),
      metrics: this.getPerformanceMetrics(),
    });
  }

  /**
   * Update configuration for all components
   */
  public updateConfig(newConfig: Partial<PerformanceOptimizerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update component configurations
    if (newConfig.adaptivePolling && this.adaptivePollingManager) {
      // AdaptivePollingManager doesn't have updateConfig, but we could add it
    }

    if (newConfig.renderOptimizer && this.renderOptimizer) {
      this.renderOptimizer.updateConfig(newConfig.renderOptimizer);
    }

    if (newConfig.memoryManager && this.memoryManager) {
      this.memoryManager.updateConfig(newConfig.memoryManager);
    }

    if (newConfig.apiOptimizer && this.apiOptimizer) {
      this.apiOptimizer.updateConfig(newConfig.apiOptimizer);
    }

    if (newConfig.batchRequests && this.batchRequestManager) {
      this.batchRequestManager.updateConfig(newConfig.batchRequests);
    }

    if (newConfig.apiAnalytics && this.apiAnalytics) {
      this.apiAnalytics.updateConfig(newConfig.apiAnalytics);
    }

    this.emit('configUpdated', {
      config: this.config,
      timestamp: Date.now(),
    });
  }

  /**
   * Get optimization recommendations
   */
  public getRecommendations(): string[] {
    const metrics = this.getPerformanceMetrics();
    return metrics.recommendations;
  }

  /**
   * Initialize all optimization components
   */
  private initializeComponents(): void {
    if (this.config.enableAdaptivePolling) {
      this.adaptivePollingManager = new AdaptivePollingManager(this.config.adaptivePolling);
    }

    if (this.config.enableRenderOptimization) {
      this.renderOptimizer = new RenderOptimizer(this.config.renderOptimizer);
    }

    if (this.config.enableMemoryManagement) {
      this.memoryManager = new MemoryManager(this.config.memoryManager);
    }

    if (this.config.enableApiOptimization) {
      this.apiOptimizer = new ApiOptimizer(this.config.apiOptimizer);
    }

    if (this.config.enableBatchRequests) {
      this.batchRequestManager = new BatchRequestManager(this.config.batchRequests);
    }

    if (this.config.enableApiAnalytics) {
      this.apiAnalytics = new ApiAnalytics(this.config.apiAnalytics);
    }

    if (this.config.enableChangeDetection) {
      this.changeDetector = new ChangeDetector(this.config.changeDetection);
    }

    if (this.config.enableConnectionPooling) {
      this.connectionPoolManager = new ConnectionPoolManager(this.config.connectionPooling);
    }

    if (this.config.enableFallbackManagement) {
      this.fallbackManager = new FallbackManager(this.config.fallbackManagement);
    }

    if (this.config.enablePerformanceMonitoring) {
      this.performanceMonitor = new PerformanceMonitor(this.config.performanceMonitoring);
    }

    if (this.config.enableErrorRecovery) {
      this.errorRecoveryManager = new ErrorRecoveryManager(this.config.errorRecovery);
    }
  }

  /**
   * Set up event handlers for component coordination
   */
  private setupEventHandlers(): void {
    // Memory pressure handling
    if (this.memoryManager) {
      this.memoryManager.on('criticalMemoryPressure', () => {
        this.handleCriticalMemoryPressure();
      });
    }

    // Render optimization events
    if (this.renderOptimizer) {
      this.renderOptimizer.on('renderQueueFull', () => {
        this.handleRenderQueueFull();
      });
    }

    // API rate limiting
    if (this.adaptivePollingManager) {
      this.adaptivePollingManager.on('rateLimitWarning', () => {
        this.handleRateLimitWarning();
      });
    }
  }

  /**
   * Handle critical memory pressure
   */
  private async handleCriticalMemoryPressure(): Promise<void> {
    this.emit('criticalMemoryPressure', {
      timestamp: Date.now(),
    });

    // Aggressive optimization
    await this.forceOptimization();

    // Adjust configurations for lower memory usage
    if (this.renderOptimizer) {
      this.renderOptimizer.updateConfig({
        enableVirtualDom: false,
        maxPendingRenders: 5,
      });
    }

    if (this.apiOptimizer) {
      this.apiOptimizer.updateConfig({
        maxCacheSize: 100,
        cacheTtl: 10000,
      });
    }
  }

  /**
   * Handle render queue full
   */
  private handleRenderQueueFull(): void {
    this.emit('renderQueueFull', {
      timestamp: Date.now(),
    });

    // Clear low priority renders
    if (this.renderOptimizer) {
      this.renderOptimizer.clearPendingRenders();
    }
  }

  /**
   * Handle API rate limit warning
   */
  private handleRateLimitWarning(): void {
    this.emit('rateLimitWarning', {
      timestamp: Date.now(),
    });

    // Increase polling intervals
    if (this.adaptivePollingManager) {
      // This would require extending the AdaptivePollingManager API
    }
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    this.monitoringTimer = setInterval(() => {
      if (this.isRunning) {
        this.performPerformanceCheck();
      }
    }, this.config.monitoringInterval);
  }

  /**
   * Perform periodic performance check
   */
  private performPerformanceCheck(): void {
    const metrics = this.getPerformanceMetrics();

    this.emit('performanceCheck', {
      metrics,
      timestamp: Date.now(),
    });

    // Auto-optimization if performance is below threshold
    if (metrics.overallScore < this.config.autoOptimizationThreshold) {
      this.emit('autoOptimizationTriggered', {
        score: metrics.overallScore,
        threshold: this.config.autoOptimizationThreshold,
        timestamp: Date.now(),
      });

      this.forceOptimization();
    }
  }

  /**
   * Calculate overall performance score
   */
  private calculatePerformanceScore(components: PerformanceMetrics['components']): number {
    let totalScore = 0;
    let componentCount = 0;

    // Render performance (0-30 points)
    if (components.renderOptimizer) {
      const renderScore = Math.min(30, Math.max(0, 
        30 - (components.renderOptimizer.averageRenderTime / 10)
      ));
      totalScore += renderScore;
      componentCount++;
    }

    // Memory performance (0-25 points)
    if (components.memoryManager) {
      const memoryScore = components.memoryManager.pressureLevel === 'normal' ? 25 :
                         components.memoryManager.pressureLevel === 'warning' ? 15 : 5;
      totalScore += memoryScore;
      componentCount++;
    }

    // API performance (0-25 points)
    if (components.apiOptimizer) {
      const apiScore = Math.min(25, components.apiOptimizer.cacheHitRatio * 25);
      totalScore += apiScore;
      componentCount++;
    }

    // Polling efficiency (0-20 points)
    if (components.adaptivePolling) {
      const pollingScore = Math.min(20, (components.adaptivePolling.dataSourceCount * 4));
      totalScore += pollingScore;
      componentCount++;
    }

    return componentCount > 0 ? Math.round(totalScore * (4 / componentCount)) : 0;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    components: PerformanceMetrics['components'],
    overallScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (overallScore < 50) {
      recommendations.push('Overall performance is poor. Consider immediate optimization.');
    } else if (overallScore < 70) {
      recommendations.push('Performance could be improved. Review recommendations below.');
    }

    // Memory recommendations
    if (components.memoryManager) {
      if (components.memoryManager.pressureLevel === 'critical') {
        recommendations.push('Critical memory pressure detected. Force cleanup immediately.');
      } else if (components.memoryManager.pressureLevel === 'warning') {
        recommendations.push('Memory usage is high. Consider enabling aggressive cleanup.');
      }

      if (components.memoryManager.leakAlerts > 0) {
        recommendations.push('Memory leaks detected. Review resource management.');
      }
    }

    // Render recommendations
    if (components.renderOptimizer) {
      if (components.renderOptimizer.averageRenderTime > 50) {
        recommendations.push('Render times are slow. Enable render batching and throttling.');
      }

      if (components.renderOptimizer.skippedRenders > components.renderOptimizer.totalRenders * 0.3) {
        recommendations.push('Many renders are being skipped. Optimize component updating.');
      }
    }

    // API recommendations
    if (components.apiOptimizer && components.apiOptimizer.cacheHitRatio < 0.3) {
      recommendations.push('Low cache hit ratio. Increase cache TTL or review caching strategy.');
    }

    return recommendations;
  }

  /**
   * Calculate system resource usage
   */
  private calculateSystemResources(components: PerformanceMetrics['components']): PerformanceMetrics['systemResources'] {
    // This would integrate with actual system monitoring
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      cpu: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to milliseconds
      memory: memUsage.heapUsed / 1024 / 1024, // Convert to MB
      networkRequests: components.apiAnalytics?.requestsPerSecond || 0,
      renderFrameRate: components.renderOptimizer?.currentFps || 0,
    };
  }

  /**
   * Calculate optimization impact
   */
  private calculateOptimizationImpact(components: PerformanceMetrics['components']): PerformanceMetrics['optimizationImpact'] {
    return {
      apiCallsReduced: components.apiOptimizer?.cachedRequests || 0,
      memoryFreed: components.memoryManager?.cleanupCount || 0,
      renderTimeImproved: components.renderOptimizer?.skippedRenders || 0,
      networkBandwidthSaved: components.apiOptimizer?.bytesSaved || 0,
    };
  }

  /**
   * Estimate size of data
   */
  private estimateSize(...data: any[]): number {
    return data.reduce((total, item) => {
      if (item) {
        return total + JSON.stringify(item).length;
      }
      return total;
    }, 0);
  }
}