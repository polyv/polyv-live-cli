/**
 * @fileoverview Performance monitoring system for the monitoring interface
 * Collects, analyzes, and reports performance metrics for optimization
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import * as os from 'os';

/**
 * Configuration for performance monitoring
 */
export interface PerformanceMonitorConfig {
  /** Enable automatic performance monitoring */
  enableAutoMonitoring: boolean;
  /** Monitoring interval in milliseconds */
  monitoringInterval: number;
  /** Maximum number of performance records to keep */
  maxRecords: number;
  /** CPU threshold for warnings (0-100) */
  cpuThreshold: number;
  /** Memory threshold for warnings in MB */
  memoryThreshold: number;
  /** Response time threshold for warnings in ms */
  responseTimeThreshold: number;
  /** Enable performance alerts */
  enableAlerts: boolean;
  /** Enable performance reporting */
  enableReporting: boolean;
  /** Report generation interval in milliseconds */
  reportInterval: number;
  /** Enable performance profiling */
  enableProfiling: boolean;
  /** Profiling sample rate (0-1) */
  profilingSampleRate: number;
}

/**
 * Performance metrics data point
 */
export interface PerformanceMetrics {
  /** Timestamp of the measurement */
  timestamp: number;
  /** CPU usage percentage */
  cpuUsage: number;
  /** Memory usage in MB */
  memoryUsage: number;
  /** Heap usage in MB */
  heapUsage: number;
  /** Event loop delay in ms */
  eventLoopDelay: number;
  /** Render time in ms */
  renderTime: number;
  /** API response time in ms */
  apiResponseTime: number;
  /** API call count */
  apiCallCount: number;
  /** Error count */
  errorCount: number;
  /** Cache hit rate (0-1) */
  cacheHitRate: number;
  /** Active connections */
  activeConnections: number;
  /** GC pause time in ms */
  gcPauseTime: number;
  /** Frame rate (FPS) */
  frameRate: number;
  /** System load average */
  systemLoad: number[];
}

/**
 * Performance trend analysis
 */
export interface PerformanceTrend {
  /** Metric name */
  metric: string;
  /** Trend direction */
  direction: 'increasing' | 'decreasing' | 'stable';
  /** Trend strength (0-1) */
  strength: number;
  /** Average value */
  average: number;
  /** Min value */
  min: number;
  /** Max value */
  max: number;
  /** Standard deviation */
  standardDeviation: number;
  /** Trend prediction for next period */
  prediction: number;
}

/**
 * Performance alert
 */
export interface PerformanceAlert {
  /** Alert ID */
  id: string;
  /** Alert type */
  type: 'warning' | 'critical' | 'info';
  /** Alert message */
  message: string;
  /** Metric that triggered the alert */
  metric: string;
  /** Current value */
  currentValue: number;
  /** Threshold value */
  threshold: number;
  /** Alert timestamp */
  timestamp: number;
  /** Alert severity (1-10) */
  severity: number;
  /** Suggested actions */
  suggestedActions: string[];
}

/**
 * Performance report
 */
export interface PerformanceReport {
  /** Report generation timestamp */
  timestamp: number;
  /** Report period (start-end) */
  period: { start: number; end: number };
  /** Summary metrics */
  summary: {
    averageCpuUsage: number;
    averageMemoryUsage: number;
    averageResponseTime: number;
    totalApiCalls: number;
    totalErrors: number;
    averageCacheHitRate: number;
    uptime: number;
    systemHealth: 'healthy' | 'degraded' | 'critical';
  };
  /** Performance trends */
  trends: PerformanceTrend[];
  /** Performance alerts */
  alerts: PerformanceAlert[];
  /** Recommendations */
  recommendations: string[];
  /** Detailed metrics */
  metrics: PerformanceMetrics[];
}

/**
 * Performance profiling data
 */
export interface PerformanceProfile {
  /** Profile ID */
  id: string;
  /** Profile name */
  name: string;
  /** Start timestamp */
  startTime: number;
  /** End timestamp */
  endTime: number;
  /** Duration in ms */
  duration: number;
  /** CPU samples */
  cpuSamples: Array<{ timestamp: number; usage: number }>;
  /** Memory samples */
  memorySamples: Array<{ timestamp: number; usage: number }>;
  /** Function call stack */
  callStack: Array<{ function: string; duration: number; calls: number }>;
  /** Hot spots */
  hotSpots: Array<{ location: string; time: number; percentage: number }>;
}

/**
 * Performance monitoring and analysis system
 */
export class PerformanceMonitor extends EventEmitter {
  private config: PerformanceMonitorConfig;
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private profiles: Map<string, PerformanceProfile> = new Map();
  private monitoringTimer?: NodeJS.Timeout;
  private reportTimer?: NodeJS.Timeout;
  private isRunning = false;
  private startTime = Date.now();
  private lastCpuUsage = process.cpuUsage();
  private lastMeasurement = Date.now();
  private alertIdCounter = 0;
  private activeProfiles = new Set<string>();

  constructor(config: Partial<PerformanceMonitorConfig> = {}) {
    super();
    
    this.config = {
      enableAutoMonitoring: true,
      monitoringInterval: 5000, // 5 seconds
      maxRecords: 1000,
      cpuThreshold: 80,
      memoryThreshold: 100, // MB
      responseTimeThreshold: 1000, // ms
      enableAlerts: true,
      enableReporting: true,
      reportInterval: 300000, // 5 minutes
      enableProfiling: false,
      profilingSampleRate: 0.1,
      ...config,
    };

    this.setupEventHandlers();
  }

  /**
   * Start performance monitoring
   */
  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.startTime = Date.now();
    this.lastMeasurement = Date.now();
    this.lastCpuUsage = process.cpuUsage();

    if (this.config.enableAutoMonitoring) {
      this.startMonitoring();
    }

    if (this.config.enableReporting) {
      this.startReporting();
    }

    this.emit('monitoringStarted', {
      timestamp: Date.now(),
      config: this.config,
    });
  }

  /**
   * Stop performance monitoring
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      delete this.monitoringTimer;
    }

    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      delete this.reportTimer;
    }

    // Stop all active profiles
    for (const profileId of this.activeProfiles) {
      this.stopProfile(profileId);
    }

    const finalReport = this.generateReport();

    this.emit('monitoringStopped', {
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      finalReport,
    });
  }

  /**
   * Collect current performance metrics
   */
  public collectMetrics(): PerformanceMetrics {
    const now = Date.now();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage(this.lastCpuUsage);
    const systemLoad = os.loadavg();
    
    // Calculate CPU usage percentage
    const cpuPercent = (cpuUsage.user + cpuUsage.system) / ((now - this.lastMeasurement) * 1000) * 100;
    
    // Calculate event loop delay (simplified)
    const eventLoopDelay = this.measureEventLoopDelay();

    const metrics: PerformanceMetrics = {
      timestamp: now,
      cpuUsage: Math.min(cpuPercent, 100),
      memoryUsage: memoryUsage.rss / 1024 / 1024, // MB
      heapUsage: memoryUsage.heapUsed / 1024 / 1024, // MB
      eventLoopDelay,
      renderTime: 0, // Will be updated by render optimizer
      apiResponseTime: 0, // Will be updated by API analytics
      apiCallCount: 0, // Will be updated by API analytics
      errorCount: 0, // Will be updated by error recovery
      cacheHitRate: 0, // Will be updated by cache system
      activeConnections: 0, // Will be updated by connection pool
      gcPauseTime: 0, // Will be updated by GC monitoring
      frameRate: 0, // Will be updated by render optimizer
      systemLoad,
    };

    this.lastCpuUsage = process.cpuUsage();
    this.lastMeasurement = now;

    return metrics;
  }

  /**
   * Record performance metrics
   */
  public recordMetrics(metrics: Partial<PerformanceMetrics>): void {
    const currentMetrics = this.collectMetrics();
    const combinedMetrics = { ...currentMetrics, ...metrics };

    this.metrics.push(combinedMetrics);

    // Limit metrics history
    if (this.metrics.length > this.config.maxRecords) {
      this.metrics = this.metrics.slice(-this.config.maxRecords);
    }

    // Check for performance alerts
    if (this.config.enableAlerts) {
      this.checkAlerts(combinedMetrics);
    }

    this.emit('metricsRecorded', {
      metrics: combinedMetrics,
      timestamp: Date.now(),
    });
  }

  /**
   * Start performance profiling
   */
  public startProfile(profileId: string, name: string): void {
    if (this.activeProfiles.has(profileId)) {
      return;
    }

    const profile: PerformanceProfile = {
      id: profileId,
      name,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      cpuSamples: [],
      memorySamples: [],
      callStack: [],
      hotSpots: [],
    };

    this.profiles.set(profileId, profile);
    this.activeProfiles.add(profileId);

    if (this.config.enableProfiling) {
      this.startProfilingSampling(profileId);
    }

    this.emit('profileStarted', {
      profileId,
      name,
      timestamp: Date.now(),
    });
  }

  /**
   * Stop performance profiling
   */
  public stopProfile(profileId: string): PerformanceProfile | null {
    const profile = this.profiles.get(profileId);
    if (!profile || !this.activeProfiles.has(profileId)) {
      return null;
    }

    profile.endTime = Date.now();
    profile.duration = profile.endTime - profile.startTime;
    this.activeProfiles.delete(profileId);

    // Analyze profile data
    this.analyzeProfile(profile);

    this.emit('profileStopped', {
      profileId,
      duration: profile.duration,
      timestamp: Date.now(),
    });

    return profile;
  }

  /**
   * Get performance metrics history
   */
  public getMetrics(timeRange?: { start: number; end: number }): PerformanceMetrics[] {
    if (!timeRange) {
      return [...this.metrics];
    }

    return this.metrics.filter(
      metric => metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
    );
  }

  /**
   * Get performance trends
   */
  public getTrends(timeRange?: { start: number; end: number }): PerformanceTrend[] {
    const metrics = this.getMetrics(timeRange);
    if (metrics.length < 2) {
      return [];
    }

    const trends: PerformanceTrend[] = [];
    const metricKeys: (keyof PerformanceMetrics)[] = [
      'cpuUsage', 'memoryUsage', 'renderTime', 'apiResponseTime', 'errorCount'
    ];

    for (const key of metricKeys) {
      const values = metrics.map(m => m[key] as number).filter(v => !isNaN(v));
      if (values.length < 2) continue;

      const trend = this.calculateTrend(key, values);
      trends.push(trend);
    }

    return trends;
  }

  /**
   * Get performance alerts
   */
  public getAlerts(timeRange?: { start: number; end: number }): PerformanceAlert[] {
    if (!timeRange) {
      return [...this.alerts];
    }

    return this.alerts.filter(
      alert => alert.timestamp >= timeRange.start && alert.timestamp <= timeRange.end
    );
  }

  /**
   * Generate performance report
   */
  public generateReport(timeRange?: { start: number; end: number }): PerformanceReport {
    const now = Date.now();
    const period = timeRange || {
      start: now - 3600000, // Last hour
      end: now,
    };

    const metrics = this.getMetrics(period);
    const trends = this.getTrends(period);
    const alerts = this.getAlerts(period);

    const summary = this.calculateSummary(metrics);
    const recommendations = this.generateRecommendations(metrics, trends, alerts);

    return {
      timestamp: now,
      period,
      summary,
      trends,
      alerts,
      recommendations,
      metrics,
    };
  }

  /**
   * Get performance profile
   */
  public getProfile(profileId: string): PerformanceProfile | null {
    return this.profiles.get(profileId) || null;
  }

  /**
   * Clear performance data
   */
  public clearData(): void {
    const clearedMetrics = this.metrics.length;
    const clearedAlerts = this.alerts.length;
    const clearedProfiles = this.profiles.size;

    this.metrics = [];
    this.alerts = [];
    this.profiles.clear();

    this.emit('dataCleared', {
      clearedMetrics,
      clearedAlerts,
      clearedProfiles,
      timestamp: Date.now(),
    });
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<PerformanceMonitorConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart monitoring if needed
    if (this.isRunning) {
      this.stop();
      this.start();
    }

    this.emit('configUpdated', {
      config: this.config,
      timestamp: Date.now(),
    });
  }

  /**
   * Measure event loop delay
   */
  private measureEventLoopDelay(): number {
    const start = performance.now();
    return new Promise<number>((resolve) => {
      setImmediate(() => {
        resolve(performance.now() - start);
      });
    }) as any; // Simplified measurement
  }

  /**
   * Start monitoring timer
   */
  private startMonitoring(): void {
    this.monitoringTimer = setInterval(() => {
      this.recordMetrics({});
    }, this.config.monitoringInterval);
  }

  /**
   * Start reporting timer
   */
  private startReporting(): void {
    this.reportTimer = setInterval(() => {
      const report = this.generateReport();
      this.emit('reportGenerated', {
        report,
        timestamp: Date.now(),
      });
    }, this.config.reportInterval);
  }

  /**
   * Check for performance alerts
   */
  private checkAlerts(metrics: PerformanceMetrics): void {
    const alerts: PerformanceAlert[] = [];

    // CPU usage alert
    if (metrics.cpuUsage > this.config.cpuThreshold) {
      alerts.push({
        id: `alert_${++this.alertIdCounter}`,
        type: 'warning',
        message: `High CPU usage: ${metrics.cpuUsage.toFixed(1)}%`,
        metric: 'cpuUsage',
        currentValue: metrics.cpuUsage,
        threshold: this.config.cpuThreshold,
        timestamp: Date.now(),
        severity: 7,
        suggestedActions: [
          'Review CPU-intensive operations',
          'Optimize algorithms',
          'Consider load balancing',
        ],
      });
    }

    // Memory usage alert
    if (metrics.memoryUsage > this.config.memoryThreshold) {
      alerts.push({
        id: `alert_${++this.alertIdCounter}`,
        type: 'warning',
        message: `High memory usage: ${metrics.memoryUsage.toFixed(1)}MB`,
        metric: 'memoryUsage',
        currentValue: metrics.memoryUsage,
        threshold: this.config.memoryThreshold,
        timestamp: Date.now(),
        severity: 6,
        suggestedActions: [
          'Review memory allocation',
          'Clear unused cache',
          'Check for memory leaks',
        ],
      });
    }

    // Response time alert
    if (metrics.apiResponseTime > this.config.responseTimeThreshold) {
      alerts.push({
        id: `alert_${++this.alertIdCounter}`,
        type: 'warning',
        message: `Slow API response: ${metrics.apiResponseTime.toFixed(0)}ms`,
        metric: 'apiResponseTime',
        currentValue: metrics.apiResponseTime,
        threshold: this.config.responseTimeThreshold,
        timestamp: Date.now(),
        severity: 5,
        suggestedActions: [
          'Check network connectivity',
          'Optimize API queries',
          'Enable caching',
        ],
      });
    }

    // Add alerts and emit events
    for (const alert of alerts) {
      this.alerts.push(alert);
      this.emit('alertTriggered', alert);
    }

    // Limit alerts history
    if (this.alerts.length > this.config.maxRecords) {
      this.alerts = this.alerts.slice(-this.config.maxRecords);
    }
  }

  /**
   * Start profiling sampling
   */
  private startProfilingSampling(profileId: string): void {
    const profile = this.profiles.get(profileId);
    if (!profile) return;

    const sampleInterval = 100; // Sample every 100ms
    const samplingTimer = setInterval(() => {
      if (!this.activeProfiles.has(profileId)) {
        clearInterval(samplingTimer);
        return;
      }

      const metrics = this.collectMetrics();
      profile.cpuSamples.push({
        timestamp: Date.now(),
        usage: metrics.cpuUsage,
      });
      profile.memorySamples.push({
        timestamp: Date.now(),
        usage: metrics.memoryUsage,
      });
    }, sampleInterval);
  }

  /**
   * Analyze profile data
   */
  private analyzeProfile(profile: PerformanceProfile): void {
    // Calculate hot spots
    const cpuHotSpots = this.findHotSpots(profile.cpuSamples);
    const memoryHotSpots = this.findHotSpots(profile.memorySamples);
    
    profile.hotSpots = [
      ...cpuHotSpots.map(spot => ({
        location: `CPU-${spot.timestamp}`,
        time: spot.usage,
        percentage: (spot.usage / 100) * 100,
      })),
      ...memoryHotSpots.map(spot => ({
        location: `Memory-${spot.timestamp}`,
        time: spot.usage,
        percentage: (spot.usage / (profile.memorySamples.reduce((max, s) => Math.max(max, s.usage), 0) || 1)) * 100,
      })),
    ];
  }

  /**
   * Find hot spots in performance data
   */
  private findHotSpots(samples: Array<{ timestamp: number; usage: number }>): Array<{ timestamp: number; usage: number }> {
    if (samples.length < 2) return [];

    const threshold = samples.reduce((sum, s) => sum + s.usage, 0) / samples.length * 1.5;
    return samples.filter(sample => sample.usage > threshold);
  }

  /**
   * Calculate trend for a metric
   */
  private calculateTrend(metric: string, values: number[]): PerformanceTrend {
    if (values.length < 2) {
      return {
        metric,
        direction: 'stable',
        strength: 0,
        average: 0,
        min: 0,
        max: 0,
        standardDeviation: 0,
        prediction: 0,
      };
    }

    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Calculate standard deviation
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    // Calculate trend direction and strength
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    const direction = Math.abs(difference) < average * 0.1 ? 'stable' : 
                     difference > 0 ? 'increasing' : 'decreasing';
    const strength = Math.min(Math.abs(difference) / average, 1);

    // Simple linear prediction
    const prediction = average + (difference / firstHalf.length) * values.length;

    return {
      metric,
      direction,
      strength,
      average,
      min,
      max,
      standardDeviation,
      prediction,
    };
  }

  /**
   * Calculate summary metrics
   */
  private calculateSummary(metrics: PerformanceMetrics[]): PerformanceReport['summary'] {
    if (metrics.length === 0) {
      return {
        averageCpuUsage: 0,
        averageMemoryUsage: 0,
        averageResponseTime: 0,
        totalApiCalls: 0,
        totalErrors: 0,
        averageCacheHitRate: 0,
        uptime: Date.now() - this.startTime,
        systemHealth: 'healthy',
      };
    }

    const averageCpuUsage = metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length;
    const averageMemoryUsage = metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length;
    const averageResponseTime = metrics.reduce((sum, m) => sum + m.apiResponseTime, 0) / metrics.length;
    const totalApiCalls = metrics.reduce((sum, m) => sum + m.apiCallCount, 0);
    const totalErrors = metrics.reduce((sum, m) => sum + m.errorCount, 0);
    const averageCacheHitRate = metrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / metrics.length;

    // Determine system health
    let systemHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (averageCpuUsage > 80 || averageMemoryUsage > 200 || averageResponseTime > 2000) {
      systemHealth = 'critical';
    } else if (averageCpuUsage > 60 || averageMemoryUsage > 150 || averageResponseTime > 1000) {
      systemHealth = 'degraded';
    }

    return {
      averageCpuUsage,
      averageMemoryUsage,
      averageResponseTime,
      totalApiCalls,
      totalErrors,
      averageCacheHitRate,
      uptime: Date.now() - this.startTime,
      systemHealth,
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    _metrics: PerformanceMetrics[],
    trends: PerformanceTrend[],
    alerts: PerformanceAlert[]
  ): string[] {
    const recommendations: string[] = [];

    // CPU recommendations
    const cpuTrend = trends.find(t => t.metric === 'cpuUsage');
    if (cpuTrend && cpuTrend.direction === 'increasing' && cpuTrend.average > 50) {
      recommendations.push('Consider optimizing CPU-intensive operations');
    }

    // Memory recommendations
    const memoryTrend = trends.find(t => t.metric === 'memoryUsage');
    if (memoryTrend && memoryTrend.direction === 'increasing') {
      recommendations.push('Review memory usage and implement cleanup strategies');
    }

    // Response time recommendations
    const responseTrend = trends.find(t => t.metric === 'apiResponseTime');
    if (responseTrend && responseTrend.average > 500) {
      recommendations.push('Optimize API calls with caching and request batching');
    }

    // Alert-based recommendations
    const criticalAlerts = alerts.filter(a => a.type === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push('Address critical performance alerts immediately');
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Performance is within acceptable ranges');
    }

    return recommendations;
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Handle process events
    process.on('warning', (warning) => {
      this.emit('performanceWarning', {
        warning: warning.message,
        timestamp: Date.now(),
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.emit('performanceError', {
        error: error.message,
        timestamp: Date.now(),
      });
    });
  }
}