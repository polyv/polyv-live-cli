/**
 * @fileoverview API call statistics and analytics
 * Provides comprehensive analysis of API usage patterns and performance
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';

/**
 * Configuration for API analytics
 */
export interface ApiAnalyticsConfig {
  /** Enable detailed request tracking */
  enableDetailedTracking: boolean;
  /** Maximum number of request records to keep */
  maxRequestRecords: number;
  /** Time window for analytics in milliseconds */
  analyticsWindow: number;
  /** Enable performance monitoring */
  enablePerformanceMonitoring: boolean;
  /** Enable error tracking */
  enableErrorTracking: boolean;
  /** Sample rate for detailed logging (0-1) */
  sampleRate: number;
}

/**
 * Individual API request record
 */
export interface ApiRequestRecord {
  /** Unique request ID */
  id: string;
  /** Request method */
  method: string;
  /** Request URL */
  url: string;
  /** Request timestamp */
  timestamp: number;
  /** Response time in milliseconds */
  responseTime: number;
  /** Response status code */
  statusCode: number;
  /** Request size in bytes */
  requestSize: number;
  /** Response size in bytes */
  responseSize: number;
  /** Whether request was successful */
  success: boolean;
  /** Error message if failed */
  error: string;
  /** Request priority */
  priority: 'low' | 'medium' | 'high';
  /** Whether request was cached */
  cached: boolean;
  /** Whether request was batched */
  batched: boolean;
  /** User agent or client identifier */
  userAgent: string;
}

/**
 * API endpoint statistics
 */
export interface EndpointStats {
  /** Endpoint URL pattern */
  endpoint: string;
  /** Total requests */
  totalRequests: number;
  /** Successful requests */
  successfulRequests: number;
  /** Failed requests */
  failedRequests: number;
  /** Average response time */
  averageResponseTime: number;
  /** Minimum response time */
  minResponseTime: number;
  /** Maximum response time */
  maxResponseTime: number;
  /** Success rate */
  successRate: number;
  /** Total data transferred */
  totalDataTransferred: number;
  /** Last request timestamp */
  lastRequestTime: number;
  /** Requests per hour */
  requestsPerHour: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Average response time across all requests */
  averageResponseTime: number;
  /** 95th percentile response time */
  p95ResponseTime: number;
  /** 99th percentile response time */
  p99ResponseTime: number;
  /** Overall success rate */
  overallSuccessRate: number;
  /** Total requests per second */
  requestsPerSecond: number;
  /** Cache hit rate */
  cacheHitRate: number;
  /** Batch efficiency */
  batchEfficiency: number;
  /** Error rate */
  errorRate: number;
  /** Average request size */
  averageRequestSize: number;
  /** Average response size */
  averageResponseSize: number;
}

/**
 * Error analysis
 */
export interface ErrorAnalysis {
  /** Most common error types */
  commonErrors: Array<{
    error: string;
    count: number;
    percentage: number;
    endpoints: string[];
  }>;
  /** Error rate by endpoint */
  errorsByEndpoint: Array<{
    endpoint: string;
    errorCount: number;
    errorRate: number;
  }>;
  /** Error trends over time */
  errorTrends: Array<{
    timestamp: number;
    errorCount: number;
    totalRequests: number;
  }>;
}

/**
 * Usage patterns analysis
 */
export interface UsagePatterns {
  /** Peak usage hours */
  peakHours: Array<{
    hour: number;
    requestCount: number;
  }>;
  /** Most active endpoints */
  activeEndpoints: Array<{
    endpoint: string;
    requestCount: number;
    percentage: number;
  }>;
  /** Request distribution by method */
  methodDistribution: Record<string, number>;
  /** Request distribution by priority */
  priorityDistribution: Record<string, number>;
  /** Caching effectiveness */
  cachingStats: {
    cacheHitRate: number;
    cacheMissRate: number;
    cacheableRequests: number;
  };
}

/**
 * API analytics and statistics tracker
 */
export class ApiAnalytics extends EventEmitter {
  private config: ApiAnalyticsConfig;
  private requestRecords: ApiRequestRecord[] = [];
  private endpointStats: Map<string, EndpointStats> = new Map();
  private errorCounts: Map<string, number> = new Map();
  private isRunning = false;
  private analyticsTimer?: NodeJS.Timeout;

  constructor(config: Partial<ApiAnalyticsConfig> = {}) {
    super();
    
    this.config = {
      enableDetailedTracking: true,
      maxRequestRecords: 10000,
      analyticsWindow: 3600000, // 1 hour
      enablePerformanceMonitoring: true,
      enableErrorTracking: true,
      sampleRate: 1.0,
      ...config,
    };

    this.setupPeriodicAnalytics();
  }

  /**
   * Start analytics tracking
   */
  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.emit('analyticsStarted', {
      timestamp: Date.now(),
      config: this.config,
    });
  }

  /**
   * Stop analytics tracking
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.analyticsTimer) {
      clearInterval(this.analyticsTimer);
      delete this.analyticsTimer;
    }

    this.emit('analyticsStopped', {
      timestamp: Date.now(),
      finalStats: this.getOverallStats(),
    });
  }

  /**
   * Record an API request
   */
  public recordRequest(
    id: string,
    method: string,
    url: string,
    responseTime: number,
    options: {
      statusCode?: number;
      requestSize?: number;
      responseSize?: number;
      success?: boolean;
      error?: string;
      priority?: 'low' | 'medium' | 'high';
      cached?: boolean;
      batched?: boolean;
      userAgent?: string;
    } = {}
  ): void {
    if (!this.isRunning) {
      return;
    }

    // Sample requests if sampling is enabled
    if (this.config.sampleRate < 1.0 && Math.random() > this.config.sampleRate) {
      return;
    }

    const record: ApiRequestRecord = {
      id,
      method: method.toUpperCase(),
      url,
      timestamp: Date.now(),
      responseTime,
      statusCode: options.statusCode || 0,
      requestSize: options.requestSize || 0,
      responseSize: options.responseSize || 0,
      success: options.success !== false,
      error: options.error || '',
      priority: options.priority || 'medium',
      cached: options.cached || false,
      batched: options.batched || false,
      userAgent: options.userAgent || '',
    };

    // Store detailed record if enabled
    if (this.config.enableDetailedTracking) {
      this.requestRecords.push(record);
      
      // Limit records to max size
      if (this.requestRecords.length > this.config.maxRequestRecords) {
        this.requestRecords.shift();
      }
    }

    // Update endpoint statistics
    this.updateEndpointStats(record);

    // Track errors if enabled
    if (this.config.enableErrorTracking && !record.success && record.error) {
      this.trackError(record.error);
    }

    this.emit('requestRecorded', {
      record,
      timestamp: Date.now(),
    });
  }

  /**
   * Get overall statistics
   */
  public getOverallStats(): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    successRate: number;
    totalDataTransferred: number;
    timeWindow: number;
  } {
    const now = Date.now();
    const windowStart = now - this.config.analyticsWindow;
    const recentRecords = this.requestRecords.filter(r => r.timestamp >= windowStart);

    const totalRequests = recentRecords.length;
    const successfulRequests = recentRecords.filter(r => r.success).length;
    const failedRequests = totalRequests - successfulRequests;
    
    const averageResponseTime = totalRequests > 0 
      ? recentRecords.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests
      : 0;

    const successRate = totalRequests > 0 ? successfulRequests / totalRequests : 0;
    const totalDataTransferred = recentRecords.reduce((sum, r) => sum + r.requestSize + r.responseSize, 0);

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      successRate,
      totalDataTransferred,
      timeWindow: this.config.analyticsWindow,
    };
  }

  /**
   * Get endpoint statistics
   */
  public getEndpointStats(): EndpointStats[] {
    return Array.from(this.endpointStats.values()).sort((a, b) => b.totalRequests - a.totalRequests);
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    const now = Date.now();
    const windowStart = now - this.config.analyticsWindow;
    const recentRecords = this.requestRecords.filter(r => r.timestamp >= windowStart);

    if (recentRecords.length === 0) {
      return {
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        overallSuccessRate: 0,
        requestsPerSecond: 0,
        cacheHitRate: 0,
        batchEfficiency: 0,
        errorRate: 0,
        averageRequestSize: 0,
        averageResponseSize: 0,
      };
    }

    // Calculate response time percentiles
    const responseTimes = recentRecords.map(r => r.responseTime).sort((a, b) => a - b);
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);

    const averageResponseTime = responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length;
    const p95ResponseTime = responseTimes[p95Index] || 0;
    const p99ResponseTime = responseTimes[p99Index] || 0;

    // Calculate success rate
    const successfulRequests = recentRecords.filter(r => r.success).length;
    const overallSuccessRate = successfulRequests / recentRecords.length;

    // Calculate requests per second
    const timeSpan = (now - windowStart) / 1000;
    const requestsPerSecond = recentRecords.length / timeSpan;

    // Calculate cache hit rate
    const cachedRequests = recentRecords.filter(r => r.cached).length;
    const cacheHitRate = cachedRequests / recentRecords.length;

    // Calculate batch efficiency
    const batchedRequests = recentRecords.filter(r => r.batched).length;
    const batchEfficiency = batchedRequests / recentRecords.length;

    // Calculate error rate
    const errorRate = 1 - overallSuccessRate;

    // Calculate average sizes
    const averageRequestSize = recentRecords.reduce((sum, r) => sum + r.requestSize, 0) / recentRecords.length;
    const averageResponseSize = recentRecords.reduce((sum, r) => sum + r.responseSize, 0) / recentRecords.length;

    return {
      averageResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      overallSuccessRate,
      requestsPerSecond,
      cacheHitRate,
      batchEfficiency,
      errorRate,
      averageRequestSize,
      averageResponseSize,
    };
  }

  /**
   * Get error analysis
   */
  public getErrorAnalysis(): ErrorAnalysis {
    const now = Date.now();
    const windowStart = now - this.config.analyticsWindow;
    const recentRecords = this.requestRecords.filter(r => r.timestamp >= windowStart);
    const errorRecords = recentRecords.filter(r => !r.success && r.error);

    // Common errors
    const errorCounts = new Map<string, { count: number; endpoints: Set<string> }>();
    
    for (const record of errorRecords) {
      const error = record.error!;
      const existing = errorCounts.get(error) || { count: 0, endpoints: new Set() };
      existing.count++;
      existing.endpoints.add(record.url);
      errorCounts.set(error, existing);
    }

    const commonErrors = Array.from(errorCounts.entries())
      .map(([error, data]) => ({
        error,
        count: data.count,
        percentage: (data.count / errorRecords.length) * 100,
        endpoints: Array.from(data.endpoints),
      }))
      .sort((a, b) => b.count - a.count);

    // Errors by endpoint
    const endpointErrorCounts = new Map<string, number>();
    const endpointTotalCounts = new Map<string, number>();

    for (const record of recentRecords) {
      const current = endpointTotalCounts.get(record.url) || 0;
      endpointTotalCounts.set(record.url, current + 1);

      if (!record.success) {
        const errorCurrent = endpointErrorCounts.get(record.url) || 0;
        endpointErrorCounts.set(record.url, errorCurrent + 1);
      }
    }

    const errorsByEndpoint = Array.from(endpointErrorCounts.entries())
      .map(([endpoint, errorCount]) => ({
        endpoint,
        errorCount,
        errorRate: errorCount / (endpointTotalCounts.get(endpoint) || 1),
      }))
      .sort((a, b) => b.errorRate - a.errorRate);

    // Error trends over time
    const hourlyBuckets = new Map<number, { errors: number; total: number }>();
    const hourMs = 3600000;

    for (const record of recentRecords) {
      const hourBucket = Math.floor(record.timestamp / hourMs) * hourMs;
      const existing = hourlyBuckets.get(hourBucket) || { errors: 0, total: 0 };
      existing.total++;
      if (!record.success) {
        existing.errors++;
      }
      hourlyBuckets.set(hourBucket, existing);
    }

    const errorTrends = Array.from(hourlyBuckets.entries())
      .map(([timestamp, data]) => ({
        timestamp,
        errorCount: data.errors,
        totalRequests: data.total,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    return {
      commonErrors,
      errorsByEndpoint,
      errorTrends,
    };
  }

  /**
   * Get usage patterns
   */
  public getUsagePatterns(): UsagePatterns {
    const now = Date.now();
    const windowStart = now - this.config.analyticsWindow;
    const recentRecords = this.requestRecords.filter(r => r.timestamp >= windowStart);

    // Peak usage hours
    const hourlyRequests = new Map<number, number>();
    
    for (const record of recentRecords) {
      const hour = new Date(record.timestamp).getHours();
      hourlyRequests.set(hour, (hourlyRequests.get(hour) || 0) + 1);
    }

    const peakHours = Array.from(hourlyRequests.entries())
      .map(([hour, requestCount]) => ({ hour, requestCount }))
      .sort((a, b) => b.requestCount - a.requestCount);

    // Most active endpoints
    const endpointRequests = new Map<string, number>();
    
    for (const record of recentRecords) {
      endpointRequests.set(record.url, (endpointRequests.get(record.url) || 0) + 1);
    }

    const totalRequests = recentRecords.length;
    const activeEndpoints = Array.from(endpointRequests.entries())
      .map(([endpoint, requestCount]) => ({
        endpoint,
        requestCount,
        percentage: (requestCount / totalRequests) * 100,
      }))
      .sort((a, b) => b.requestCount - a.requestCount);

    // Method distribution
    const methodDistribution: Record<string, number> = {};
    for (const record of recentRecords) {
      methodDistribution[record.method] = (methodDistribution[record.method] || 0) + 1;
    }

    // Priority distribution
    const priorityDistribution: Record<string, number> = {};
    for (const record of recentRecords) {
      priorityDistribution[record.priority] = (priorityDistribution[record.priority] || 0) + 1;
    }

    // Caching statistics
    const cachedRequests = recentRecords.filter(r => r.cached).length;
    const cacheableRequests = recentRecords.filter(r => r.method === 'GET').length;
    const cachingStats = {
      cacheHitRate: cacheableRequests > 0 ? cachedRequests / cacheableRequests : 0,
      cacheMissRate: cacheableRequests > 0 ? (cacheableRequests - cachedRequests) / cacheableRequests : 0,
      cacheableRequests,
    };

    return {
      peakHours,
      activeEndpoints,
      methodDistribution,
      priorityDistribution,
      cachingStats,
    };
  }

  /**
   * Generate analytics report
   */
  public generateReport(): {
    summary: ReturnType<ApiAnalytics['getOverallStats']>;
    performance: PerformanceMetrics;
    errors: ErrorAnalysis;
    usage: UsagePatterns;
    endpoints: EndpointStats[];
    generatedAt: number;
  } {
    return {
      summary: this.getOverallStats(),
      performance: this.getPerformanceMetrics(),
      errors: this.getErrorAnalysis(),
      usage: this.getUsagePatterns(),
      endpoints: this.getEndpointStats(),
      generatedAt: Date.now(),
    };
  }

  /**
   * Clear all analytics data
   */
  public clearData(): void {
    this.requestRecords = [];
    this.endpointStats.clear();
    this.errorCounts.clear();

    this.emit('dataCleared', {
      timestamp: Date.now(),
    });
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ApiAnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    this.emit('configUpdated', {
      config: this.config,
      timestamp: Date.now(),
    });
  }

  /**
   * Update endpoint statistics
   */
  private updateEndpointStats(record: ApiRequestRecord): void {
    const endpoint = this.normalizeEndpoint(record.url);
    const existing = this.endpointStats.get(endpoint) || {
      endpoint,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      successRate: 0,
      totalDataTransferred: 0,
      lastRequestTime: 0,
      requestsPerHour: 0,
    };

    existing.totalRequests++;
    existing.lastRequestTime = record.timestamp;
    existing.totalDataTransferred += record.requestSize + record.responseSize;

    if (record.success) {
      existing.successfulRequests++;
    } else {
      existing.failedRequests++;
    }

    // Update response time statistics
    existing.averageResponseTime = (
      (existing.averageResponseTime * (existing.totalRequests - 1)) + record.responseTime
    ) / existing.totalRequests;

    existing.minResponseTime = Math.min(existing.minResponseTime, record.responseTime);
    existing.maxResponseTime = Math.max(existing.maxResponseTime, record.responseTime);

    // Update success rate
    existing.successRate = existing.successfulRequests / existing.totalRequests;

    // Calculate requests per hour
    const now = Date.now();
    const hourAgo = now - 3600000;
    const recentRequests = this.requestRecords.filter(
      r => r.url === record.url && r.timestamp >= hourAgo
    );
    existing.requestsPerHour = recentRequests.length;

    this.endpointStats.set(endpoint, existing);
  }

  /**
   * Normalize endpoint URL for grouping
   */
  private normalizeEndpoint(url: string): string {
    // Remove query parameters
    const baseUrl = url.split('?')[0];
    
    // Replace numeric IDs with placeholder
    return (baseUrl || '').replace(/\/\d+/g, '/{id}');
  }

  /**
   * Track error occurrence
   */
  private trackError(error: string): void {
    this.errorCounts.set(error, (this.errorCounts.get(error) || 0) + 1);
  }

  /**
   * Set up periodic analytics processing
   */
  private setupPeriodicAnalytics(): void {
    this.analyticsTimer = setInterval(() => {
      if (this.isRunning) {
        this.performPeriodicAnalytics();
      }
    }, 60000); // Every minute
  }

  /**
   * Perform periodic analytics processing
   */
  private performPeriodicAnalytics(): void {
    const report = this.generateReport();
    
    this.emit('periodicAnalytics', {
      report,
      timestamp: Date.now(),
    });

    // Clean up old records
    const cutoffTime = Date.now() - this.config.analyticsWindow;
    this.requestRecords = this.requestRecords.filter(r => r.timestamp >= cutoffTime);
  }
}