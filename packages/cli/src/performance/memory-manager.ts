/**
 * @fileoverview Memory manager for monitoring and managing memory usage
 * Prevents memory leaks and maintains stable memory consumption
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';

/**
 * Configuration for memory management
 */
export interface MemoryManagerConfig {
  /** Memory usage threshold in bytes (warning level) */
  warningThreshold: number;
  /** Memory usage threshold in bytes (critical level) */
  criticalThreshold: number;
  /** Cleanup interval in milliseconds */
  cleanupInterval: number;
  /** Enable automatic cleanup */
  enableAutoCleanup: boolean;
  /** Enable garbage collection forcing */
  enableGcForcing: boolean;
  /** GC interval in milliseconds */
  gcInterval: number;
  /** Enable memory leak detection */
  enableLeakDetection: boolean;
  /** Leak detection sample interval */
  leakDetectionInterval: number;
  /** Number of samples to keep for trend analysis */
  trendSampleCount: number;
}

/**
 * Memory usage snapshot
 */
export interface MemorySnapshot {
  /** Timestamp of the snapshot */
  timestamp: number;
  /** Resident Set Size in bytes */
  rss: number;
  /** Heap used in bytes */
  heapUsed: number;
  /** Heap total in bytes */
  heapTotal: number;
  /** External memory in bytes */
  external: number;
  /** Array buffers in bytes */
  arrayBuffers: number;
  /** Memory usage percentage */
  usagePercentage: number;
}

/**
 * Memory statistics
 */
export interface MemoryStats {
  /** Current memory snapshot */
  current: MemorySnapshot;
  /** Peak memory usage */
  peak: MemorySnapshot;
  /** Average memory usage over time */
  average: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  /** Memory growth rate (bytes per second) */
  growthRate: number;
  /** Number of cleanups performed */
  cleanupCount: number;
  /** Number of GC cycles forced */
  gcCount: number;
  /** Leak detection alerts */
  leakAlerts: number;
  /** Memory pressure level */
  pressureLevel: 'normal' | 'warning' | 'critical';
}

/**
 * Memory leak detection result
 */
export interface LeakDetection {
  /** Whether a potential leak is detected */
  leakDetected: boolean;
  /** Leak severity */
  severity: 'low' | 'medium' | 'high';
  /** Memory growth trend */
  growthTrend: 'stable' | 'growing' | 'rapidly_growing';
  /** Growth rate in bytes per minute */
  growthRatePerMinute: number;
  /** Confidence level of detection */
  confidence: number;
  /** Recommendations for addressing the leak */
  recommendations: string[];
}

/**
 * Managed resource interface
 */
export interface ManagedResource {
  /** Resource identifier */
  id: string;
  /** Resource type */
  type: string;
  /** Resource size estimate in bytes */
  size: number;
  /** Creation timestamp */
  createdAt: number;
  /** Last accessed timestamp */
  lastAccessed: number;
  /** Cleanup function */
  cleanup: () => void;
  /** Whether resource is disposable */
  disposable: boolean;
  /** Resource priority for cleanup */
  priority: 'low' | 'medium' | 'high';
}

/**
 * Memory manager for monitoring and leak prevention
 */
export class MemoryManager extends EventEmitter {
  private config: MemoryManagerConfig;
  private snapshots: MemorySnapshot[] = [];
  private managedResources: Map<string, ManagedResource> = new Map();
  private cleanupTimer?: NodeJS.Timeout;
  private gcTimer?: NodeJS.Timeout;
  private leakDetectionTimer?: NodeJS.Timeout;
  private stats: MemoryStats;
  private isRunning = false;
  private peakSnapshot?: MemorySnapshot;

  constructor(config: Partial<MemoryManagerConfig> = {}) {
    super();
    
    this.config = {
      warningThreshold: 80 * 1024 * 1024, // 80MB
      criticalThreshold: 150 * 1024 * 1024, // 150MB
      cleanupInterval: 30000, // 30 seconds
      enableAutoCleanup: true,
      enableGcForcing: false, // Disabled by default as it can impact performance
      gcInterval: 60000, // 1 minute
      enableLeakDetection: true,
      leakDetectionInterval: 60000, // 1 minute
      trendSampleCount: 60, // 1 hour of samples at 1-minute intervals
      ...config,
    };

    // Initialize stats
    const initialSnapshot = this.takeMemorySnapshot();
    this.stats = {
      current: initialSnapshot,
      peak: initialSnapshot,
      average: {
        rss: initialSnapshot.rss,
        heapUsed: initialSnapshot.heapUsed,
        heapTotal: initialSnapshot.heapTotal,
      },
      growthRate: 0,
      cleanupCount: 0,
      gcCount: 0,
      leakAlerts: 0,
      pressureLevel: 'normal',
    };

    this.peakSnapshot = initialSnapshot;
  }

  /**
   * Start the memory manager
   */
  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // Start monitoring
    this.startCleanupMonitoring();
    
    if (this.config.enableGcForcing) {
      this.startGcMonitoring();
    }
    
    if (this.config.enableLeakDetection) {
      this.startLeakDetection();
    }

    this.emit('started', {
      timestamp: Date.now(),
      config: this.config,
    });
  }

  /**
   * Stop the memory manager
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      delete this.cleanupTimer;
    }

    if (this.gcTimer) {
      clearInterval(this.gcTimer);
      delete this.gcTimer;
    }

    if (this.leakDetectionTimer) {
      clearInterval(this.leakDetectionTimer);
      delete this.leakDetectionTimer;
    }

    this.emit('stopped', {
      timestamp: Date.now(),
      finalStats: this.getStats(),
    });
  }

  /**
   * Register a resource for management
   */
  public registerResource(resource: Omit<ManagedResource, 'createdAt' | 'lastAccessed'>): void {
    const managedResource: ManagedResource = {
      ...resource,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
    };

    this.managedResources.set(resource.id, managedResource);

    this.emit('resourceRegistered', {
      resourceId: resource.id,
      type: resource.type,
      size: resource.size,
      timestamp: Date.now(),
    });
  }

  /**
   * Unregister a resource
   */
  public unregisterResource(resourceId: string): void {
    const resource = this.managedResources.get(resourceId);
    if (resource) {
      this.managedResources.delete(resourceId);
      
      this.emit('resourceUnregistered', {
        resourceId,
        type: resource.type,
        size: resource.size,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Touch a resource to update its last accessed time
   */
  public touchResource(resourceId: string): void {
    const resource = this.managedResources.get(resourceId);
    if (resource) {
      resource.lastAccessed = Date.now();
    }
  }

  /**
   * Force cleanup of expired resources
   */
  public async forceCleanup(): Promise<number> {
    const cleanedCount = await this.performCleanup();
    
    this.emit('cleanupForced', {
      resourcesCleaned: cleanedCount,
      timestamp: Date.now(),
    });

    return cleanedCount;
  }

  /**
   * Force garbage collection (if enabled)
   */
  public forceGarbageCollection(): void {
    if (global.gc) {
      try {
        global.gc();
        this.stats.gcCount++;
        
        this.emit('gcForced', {
          timestamp: Date.now(),
        });
      } catch (error) {
        this.emit('gcError', {
          error,
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Get current memory statistics
   */
  public getStats(): MemoryStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Get memory snapshots
   */
  public getSnapshots(count?: number): MemorySnapshot[] {
    const snapshots = count ? this.snapshots.slice(-count) : this.snapshots;
    return [...snapshots];
  }

  /**
   * Get managed resources information
   */
  public getManagedResources(): Array<{
    id: string;
    type: string;
    size: number;
    age: number;
    lastAccessed: number;
    priority: string;
  }> {
    const now = Date.now();
    return Array.from(this.managedResources.values()).map(resource => ({
      id: resource.id,
      type: resource.type,
      size: resource.size,
      age: now - resource.createdAt,
      lastAccessed: resource.lastAccessed,
      priority: resource.priority,
    }));
  }

  /**
   * Perform leak detection analysis
   */
  public detectMemoryLeaks(): LeakDetection {
    if (this.snapshots.length < 5) {
      return {
        leakDetected: false,
        severity: 'low',
        growthTrend: 'stable',
        growthRatePerMinute: 0,
        confidence: 0.1,
        recommendations: ['Insufficient data for leak detection'],
      };
    }

    const recentSnapshots = this.snapshots.slice(-10);
    const growthRates = this.calculateGrowthRates(recentSnapshots);
    const avgGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
    
    // Convert to per-minute rate
    const growthRatePerMinute = avgGrowthRate * 60;

    // Determine growth trend
    let growthTrend: LeakDetection['growthTrend'] = 'stable';
    if (growthRatePerMinute > 5 * 1024 * 1024) { // 5MB per minute
      growthTrend = 'rapidly_growing';
    } else if (growthRatePerMinute > 1 * 1024 * 1024) { // 1MB per minute
      growthTrend = 'growing';
    }

    // Calculate confidence based on consistency of growth
    const growthConsistency = this.calculateGrowthConsistency(growthRates);
    const confidence = Math.min(growthConsistency, 1.0);

    // Determine if leak is detected
    const leakDetected = growthTrend !== 'stable' && confidence > 0.7;

    // Determine severity
    let severity: LeakDetection['severity'] = 'low';
    if (growthRatePerMinute > 10 * 1024 * 1024) {
      severity = 'high';
    } else if (growthRatePerMinute > 3 * 1024 * 1024) {
      severity = 'medium';
    }

    // Generate recommendations
    const recommendations = this.generateLeakRecommendations(growthTrend, severity);

    return {
      leakDetected,
      severity,
      growthTrend,
      growthRatePerMinute,
      confidence,
      recommendations,
    };
  }

  /**
   * Set memory pressure level manually
   */
  public setPressureLevel(level: MemoryStats['pressureLevel']): void {
    this.stats.pressureLevel = level;
    
    this.emit('pressureLevelChanged', {
      level,
      timestamp: Date.now(),
    });

    if (level === 'critical') {
      this.handleCriticalMemoryPressure();
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<MemoryManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    this.emit('configUpdated', {
      config: this.config,
      timestamp: Date.now(),
    });
  }

  /**
   * Take a memory snapshot
   */
  private takeMemorySnapshot(): MemorySnapshot {
    const memUsage = process.memoryUsage();
    const timestamp = Date.now();
    
    // Calculate usage percentage based on heap
    const usagePercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    return {
      timestamp,
      rss: memUsage.rss,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers || 0,
      usagePercentage,
    };
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    const currentSnapshot = this.takeMemorySnapshot();
    this.stats.current = currentSnapshot;

    // Add to snapshots history
    this.snapshots.push(currentSnapshot);
    if (this.snapshots.length > this.config.trendSampleCount) {
      this.snapshots.shift();
    }

    // Update peak if current is higher
    if (!this.peakSnapshot || currentSnapshot.heapUsed > this.peakSnapshot.heapUsed) {
      this.peakSnapshot = currentSnapshot;
      this.stats.peak = currentSnapshot;
    }

    // Calculate averages
    if (this.snapshots.length > 1) {
      this.stats.average = {
        rss: this.snapshots.reduce((sum, s) => sum + s.rss, 0) / this.snapshots.length,
        heapUsed: this.snapshots.reduce((sum, s) => sum + s.heapUsed, 0) / this.snapshots.length,
        heapTotal: this.snapshots.reduce((sum, s) => sum + s.heapTotal, 0) / this.snapshots.length,
      };

      // Calculate growth rate
      const recentSnapshots = this.snapshots.slice(-5);
      if (recentSnapshots.length > 1) {
        const growthRates = this.calculateGrowthRates(recentSnapshots);
        this.stats.growthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
      }
    }

    // Update pressure level
    this.updatePressureLevel(currentSnapshot);
  }

  /**
   * Update memory pressure level
   */
  private updatePressureLevel(snapshot: MemorySnapshot): void {
    const oldLevel = this.stats.pressureLevel;
    
    if (snapshot.heapUsed > this.config.criticalThreshold) {
      this.stats.pressureLevel = 'critical';
    } else if (snapshot.heapUsed > this.config.warningThreshold) {
      this.stats.pressureLevel = 'warning';
    } else {
      this.stats.pressureLevel = 'normal';
    }

    if (oldLevel !== this.stats.pressureLevel) {
      this.emit('pressureLevelChanged', {
        level: this.stats.pressureLevel,
        previousLevel: oldLevel,
        snapshot,
        timestamp: Date.now(),
      });

      if (this.stats.pressureLevel === 'critical') {
        this.handleCriticalMemoryPressure();
      }
    }
  }

  /**
   * Handle critical memory pressure
   */
  private async handleCriticalMemoryPressure(): Promise<void> {
    this.emit('criticalMemoryPressure', {
      snapshot: this.stats.current,
      timestamp: Date.now(),
    });

    // Perform aggressive cleanup
    const cleanedResources = await this.performCleanup(true);
    
    // Force garbage collection if enabled
    if (this.config.enableGcForcing) {
      this.forceGarbageCollection();
    }

    this.emit('criticalMemoryHandled', {
      cleanedResources,
      timestamp: Date.now(),
    });
  }

  /**
   * Start cleanup monitoring
   */
  private startCleanupMonitoring(): void {
    this.cleanupTimer = setInterval(() => {
      if (this.isRunning && this.config.enableAutoCleanup) {
        this.performCleanup();
      }
      
      // Always update stats
      this.updateStats();
    }, this.config.cleanupInterval);
  }

  /**
   * Start GC monitoring
   */
  private startGcMonitoring(): void {
    this.gcTimer = setInterval(() => {
      if (this.isRunning && this.stats.pressureLevel !== 'normal') {
        this.forceGarbageCollection();
      }
    }, this.config.gcInterval);
  }

  /**
   * Start leak detection
   */
  private startLeakDetection(): void {
    this.leakDetectionTimer = setInterval(() => {
      if (this.isRunning) {
        const leakDetection = this.detectMemoryLeaks();
        
        if (leakDetection.leakDetected) {
          this.stats.leakAlerts++;
          
          this.emit('memoryLeakDetected', {
            detection: leakDetection,
            timestamp: Date.now(),
          });
        }
      }
    }, this.config.leakDetectionInterval);
  }

  /**
   * Perform cleanup of expired resources
   */
  private async performCleanup(aggressive = false): Promise<number> {
    const now = Date.now();
    const cleanupThreshold = aggressive ? 10000 : 300000; // 10s vs 5min
    let cleanedCount = 0;

    const resourcesToCleanup: ManagedResource[] = [];

    // Find resources to cleanup
    for (const resource of this.managedResources.values()) {
      if (resource.disposable) {
        const age = now - resource.lastAccessed;
        const shouldCleanup = age > cleanupThreshold || 
                             (aggressive && resource.priority === 'low');
        
        if (shouldCleanup) {
          resourcesToCleanup.push(resource);
        }
      }
    }

    // Sort by priority (low priority first)
    resourcesToCleanup.sort((a, b) => {
      const priorityOrder = { low: 0, medium: 1, high: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Perform cleanup
    for (const resource of resourcesToCleanup) {
      try {
        resource.cleanup();
        this.managedResources.delete(resource.id);
        cleanedCount++;

        this.emit('resourceCleaned', {
          resourceId: resource.id,
          type: resource.type,
          size: resource.size,
          age: now - resource.createdAt,
          timestamp: now,
        });
      } catch (error) {
        this.emit('cleanupError', {
          resourceId: resource.id,
          error,
          timestamp: now,
        });
      }
    }

    if (cleanedCount > 0) {
      this.stats.cleanupCount++;
      
      this.emit('cleanupCompleted', {
        resourcesCleaned: cleanedCount,
        aggressive,
        timestamp: now,
      });
    }

    return cleanedCount;
  }

  /**
   * Calculate growth rates between snapshots
   */
  private calculateGrowthRates(snapshots: MemorySnapshot[]): number[] {
    const growthRates: number[] = [];
    
    for (let i = 1; i < snapshots.length; i++) {
      const current = snapshots[i];
      const previous = snapshots[i - 1];
      if (!current || !previous) continue;
      const timeDiff = (current.timestamp - previous.timestamp) / 1000; // seconds
      const memoryDiff = current.heapUsed - previous.heapUsed;
      
      if (timeDiff > 0) {
        growthRates.push(memoryDiff / timeDiff); // bytes per second
      }
    }

    return growthRates;
  }

  /**
   * Calculate consistency of growth rates
   */
  private calculateGrowthConsistency(growthRates: number[]): number {
    if (growthRates.length < 2) {
      return 0;
    }

    const mean = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
    const variance = growthRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / growthRates.length;
    const standardDeviation = Math.sqrt(variance);

    // Consistency is inversely related to standard deviation
    // Normalize to 0-1 scale
    const consistency = 1 / (1 + standardDeviation / (Math.abs(mean) + 1));
    
    return consistency;
  }

  /**
   * Generate leak recommendations
   */
  private generateLeakRecommendations(
    growthTrend: LeakDetection['growthTrend'],
    severity: LeakDetection['severity']
  ): string[] {
    const recommendations: string[] = [];

    if (growthTrend === 'rapidly_growing') {
      recommendations.push('Immediate action required: Memory is growing rapidly');
      recommendations.push('Check for unbounded arrays, maps, or event listeners');
      recommendations.push('Review recent code changes for potential leaks');
    }

    if (severity === 'high') {
      recommendations.push('Consider forcing garbage collection');
      recommendations.push('Enable aggressive resource cleanup');
      recommendations.push('Monitor component lifecycle for proper cleanup');
    }

    if (growthTrend === 'growing') {
      recommendations.push('Monitor memory usage closely');
      recommendations.push('Review data structures for potential optimization');
      recommendations.push('Check for circular references');
    }

    recommendations.push('Use memory profiling tools for detailed analysis');
    recommendations.push('Implement resource pooling where appropriate');

    return recommendations;
  }
}