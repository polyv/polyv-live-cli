/**
 * @fileoverview Advanced data change detection algorithm
 * Identifies active and static data sources with pattern recognition
 * @author Development Team
 * @since 1.0.0
 */

import { createHash } from 'crypto';
import { EventEmitter } from 'events';

/**
 * Configuration for change detection
 */
export interface ChangeDetectionConfig {
  /** Number of samples to analyze for pattern detection */
  sampleSize: number;
  /** Minimum time between samples for pattern analysis */
  minSampleInterval: number;
  /** Threshold for detecting significant changes */
  changeThreshold: number;
  /** Enable deep object comparison */
  deepComparison: boolean;
  /** Enable pattern recognition */
  patternRecognition: boolean;
}

/**
 * Change detection result
 */
export interface ChangeDetectionResult {
  /** Whether data has changed */
  hasChanged: boolean;
  /** Type of change detected */
  changeType: 'none' | 'minor' | 'major' | 'structural';
  /** Confidence level of change detection (0-1) */
  confidence: number;
  /** Hash of current data for comparison */
  currentHash: string;
  /** Hash of previous data */
  previousHash?: string;
  /** Detailed change information */
  changeDetails?: {
    addedFields: string[];
    removedFields: string[];
    modifiedFields: string[];
    sizeChange: number;
  };
}

/**
 * Pattern analysis result
 */
export interface PatternAnalysis {
  /** Pattern type identified */
  patternType: 'stable' | 'periodic' | 'volatile' | 'trending';
  /** Pattern strength (0-1) */
  strength: number;
  /** Predicted next change time */
  nextChangeTime?: number;
  /** Change frequency per hour */
  changeFrequency: number;
  /** Volatility score (0-1) */
  volatility: number;
}

/**
 * Data sample for historical analysis
 */
interface DataSample {
  timestamp: number;
  dataHash: string;
  changeType: string;
  confidence: number;
  size: number;
}

/**
 * Data source activity classification
 */
export interface DataSourceActivity {
  /** Data source identifier */
  dataSourceId: string;
  /** Activity level */
  activityLevel: 'static' | 'low' | 'medium' | 'high' | 'volatile';
  /** Pattern analysis */
  pattern: PatternAnalysis;
  /** Recommended polling interval */
  recommendedInterval: number;
  /** Confidence in classification */
  confidence: number;
}

/**
 * Advanced change detector with pattern recognition
 */
export class ChangeDetector extends EventEmitter {
  private config: ChangeDetectionConfig;
  private dataSamples: Map<string, DataSample[]> = new Map();
  private lastKnownHashes: Map<string, string> = new Map();
  private patternCache: Map<string, PatternAnalysis> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  constructor(config: Partial<ChangeDetectionConfig> = {}) {
    super();
    
    this.config = {
      sampleSize: 100,
      minSampleInterval: 1000, // 1 second
      changeThreshold: 0.1,
      deepComparison: true,
      patternRecognition: true,
      ...config,
    };
  }

  /**
   * Detect changes in data
   */
  public detectChange(
    dataSourceId: string,
    currentData: any,
    previousData?: any
  ): ChangeDetectionResult {
    const currentHash = this.generateDataHash(currentData);
    const previousHash = previousData 
      ? this.generateDataHash(previousData)
      : this.lastKnownHashes.get(dataSourceId);

    // Store current hash for future comparisons
    this.lastKnownHashes.set(dataSourceId, currentHash);

    // Basic change detection
    const hasBasicChange = currentHash !== previousHash;

    let result: ChangeDetectionResult = {
      hasChanged: hasBasicChange,
      changeType: 'none',
      confidence: 1.0,
      currentHash,
      previousHash: previousHash || '',
    };

    if (hasBasicChange && this.config.deepComparison) {
      result = this.performDeepComparison(currentData, previousData, result);
    }

    // Record sample for pattern analysis
    this.recordSample(dataSourceId, {
      timestamp: Date.now(),
      dataHash: currentHash,
      changeType: result.changeType,
      confidence: result.confidence,
      size: this.estimateDataSize(currentData),
    });

    // Emit change event
    if (result.hasChanged) {
      this.emit('changeDetected', {
        dataSourceId,
        result,
        timestamp: Date.now(),
      });
    }

    return result;
  }

  /**
   * Analyze patterns in data changes
   */
  public analyzePattern(dataSourceId: string): PatternAnalysis {
    // Check cache first
    const cached = this.patternCache.get(dataSourceId);
    const cacheTime = this.cacheExpiry.get(dataSourceId);
    
    if (cached && cacheTime && Date.now() - cacheTime < 60000) {
      return cached;
    }

    const samples = this.dataSamples.get(dataSourceId) || [];
    
    if (samples.length < 10) {
      return {
        patternType: 'stable',
        strength: 0.1,
        changeFrequency: 0,
        volatility: 0,
      };
    }

    const analysis = this.performPatternAnalysis(samples);
    
    // Cache result
    this.patternCache.set(dataSourceId, analysis);
    this.cacheExpiry.set(dataSourceId, Date.now());

    return analysis;
  }

  /**
   * Classify data source activity level
   */
  public classifyActivity(dataSourceId: string): DataSourceActivity {
    const pattern = this.analyzePattern(dataSourceId);
    const samples = this.dataSamples.get(dataSourceId) || [];
    
    // Calculate activity level based on pattern and volatility
    let activityLevel: DataSourceActivity['activityLevel'] = 'static';
    let recommendedInterval = 60000; // 1 minute default
    
    if (pattern.volatility > 0.8) {
      activityLevel = 'volatile';
      recommendedInterval = 1000; // 1 second
    } else if (pattern.changeFrequency > 30) {
      activityLevel = 'high';
      recommendedInterval = 2000; // 2 seconds
    } else if (pattern.changeFrequency > 10) {
      activityLevel = 'medium';
      recommendedInterval = 5000; // 5 seconds
    } else if (pattern.changeFrequency > 2) {
      activityLevel = 'low';
      recommendedInterval = 15000; // 15 seconds
    }

    // Adjust based on pattern type
    if (pattern.patternType === 'periodic' && pattern.nextChangeTime) {
      const timeUntilNextChange = pattern.nextChangeTime - Date.now();
      if (timeUntilNextChange > 0) {
        recommendedInterval = Math.min(recommendedInterval, timeUntilNextChange * 0.8);
      }
    }

    return {
      dataSourceId,
      activityLevel,
      pattern,
      recommendedInterval,
      confidence: this.calculateClassificationConfidence(samples),
    };
  }

  /**
   * Get historical samples for a data source
   */
  public getSamples(dataSourceId: string): DataSample[] {
    return [...(this.dataSamples.get(dataSourceId) || [])];
  }

  /**
   * Clear samples for a data source
   */
  public clearSamples(dataSourceId: string): void {
    this.dataSamples.delete(dataSourceId);
    this.lastKnownHashes.delete(dataSourceId);
    this.patternCache.delete(dataSourceId);
    this.cacheExpiry.delete(dataSourceId);
  }

  /**
   * Get statistics for all data sources
   */
  public getStatistics(): {
    totalDataSources: number;
    totalSamples: number;
    activityDistribution: Record<string, number>;
    patternDistribution: Record<string, number>;
  } {
    const activityDistribution: Record<string, number> = {
      static: 0,
      low: 0,
      medium: 0,
      high: 0,
      volatile: 0,
    };

    const patternDistribution: Record<string, number> = {
      stable: 0,
      periodic: 0,
      volatile: 0,
      trending: 0,
    };

    let totalSamples = 0;

    for (const [dataSourceId, samples] of this.dataSamples) {
      totalSamples += samples.length;
      
      const activity = this.classifyActivity(dataSourceId);
      activityDistribution[activity.activityLevel] = (activityDistribution[activity.activityLevel] || 0) + 1;
      patternDistribution[activity.pattern.patternType] = (patternDistribution[activity.pattern.patternType] || 0) + 1;
    }

    return {
      totalDataSources: this.dataSamples.size,
      totalSamples,
      activityDistribution,
      patternDistribution,
    };
  }

  /**
   * Generate hash for data comparison
   */
  private generateDataHash(data: any): string {
    if (data === null || data === undefined) {
      return 'null';
    }

    try {
      // Handle circular references with a replacer function
      const seen = new WeakSet();
      const serialized = JSON.stringify(data, (_key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      });
      return createHash('sha256').update(serialized).digest('hex');
    } catch (error) {
      // Fallback for any other serialization errors
      return createHash('sha256').update(String(data)).digest('hex');
    }
  }

  /**
   * Perform deep comparison of data objects
   */
  private performDeepComparison(
    currentData: any,
    previousData: any,
    result: ChangeDetectionResult
  ): ChangeDetectionResult {
    if (!previousData) {
      return {
        ...result,
        changeType: 'major',
        confidence: 0.9,
      };
    }

    const changeDetails = {
      addedFields: [] as string[],
      removedFields: [] as string[],
      modifiedFields: [] as string[],
      sizeChange: 0,
    };

    // Compare object structures
    const currentKeys = new Set(Object.keys(currentData || {}));
    const previousKeys = new Set(Object.keys(previousData || {}));

    // Find added fields
    for (const key of currentKeys) {
      if (!previousKeys.has(key)) {
        changeDetails.addedFields.push(key);
      }
    }

    // Find removed fields
    for (const key of previousKeys) {
      if (!currentKeys.has(key)) {
        changeDetails.removedFields.push(key);
      }
    }

    // Find modified fields
    for (const key of currentKeys) {
      if (previousKeys.has(key)) {
        const currentValue = currentData[key];
        const previousValue = previousData[key];
        
        if (JSON.stringify(currentValue) !== JSON.stringify(previousValue)) {
          changeDetails.modifiedFields.push(key);
        }
      }
    }

    // Calculate size change
    const currentSize = this.estimateDataSize(currentData);
    const previousSize = this.estimateDataSize(previousData);
    changeDetails.sizeChange = currentSize - previousSize;

    // Determine change type and confidence
    let changeType: ChangeDetectionResult['changeType'] = 'none';
    let confidence = 1.0;

    const totalChanges = changeDetails.addedFields.length + 
                        changeDetails.removedFields.length + 
                        changeDetails.modifiedFields.length;

    if (changeDetails.addedFields.length > 0 || changeDetails.removedFields.length > 0) {
      changeType = 'structural';
      confidence = 0.95;
    } else if (totalChanges > currentKeys.size * 0.5) {
      changeType = 'major';
      confidence = 0.9;
    } else if (totalChanges > 0) {
      changeType = 'minor';
      confidence = 0.8;
    }

    return {
      ...result,
      changeType,
      confidence,
      changeDetails,
    };
  }

  /**
   * Perform pattern analysis on sample data
   */
  private performPatternAnalysis(samples: DataSample[]): PatternAnalysis {
    const recentSamples = samples.slice(-this.config.sampleSize);
    
    // Calculate change frequency
    const timespan = recentSamples.length > 1 
      ? (recentSamples[recentSamples.length - 1]?.timestamp || 0) - (recentSamples[0]?.timestamp || 0)
      : 3600000; // 1 hour default
    
    const changedSamples = recentSamples.filter(s => s.changeType !== 'none');
    const changeFrequency = (changedSamples.length / (timespan / 3600000)); // per hour

    // Calculate volatility
    const volatility = this.calculateVolatility(recentSamples);

    // Detect pattern type
    const patternType = this.detectPatternType(recentSamples);

    // Calculate pattern strength
    const strength = this.calculatePatternStrength(recentSamples, patternType);

    // Predict next change time for periodic patterns
    let nextChangeTime: number | undefined;
    if (patternType === 'periodic') {
      nextChangeTime = this.predictNextChangeTime(recentSamples);
    }

    return {
      patternType,
      strength,
      changeFrequency,
      volatility,
      ...(nextChangeTime && { nextChangeTime }),
    };
  }

  /**
   * Calculate volatility score
   */
  private calculateVolatility(samples: DataSample[]): number {
    if (samples.length < 3) {
      return 0;
    }

    const intervals: number[] = [];
    
    for (let i = 1; i < samples.length; i++) {
      const currentSample = samples[i];
      const previousSample = samples[i - 1];
      if (currentSample && previousSample && currentSample.changeType !== 'none') {
        intervals.push(currentSample.timestamp - previousSample.timestamp);
      }
    }

    if (intervals.length < 2) {
      return 0;
    }

    // Calculate standard deviation of intervals
    const mean = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // Normalize to 0-1 scale
    return Math.min(stdDev / mean, 1);
  }

  /**
   * Detect pattern type in sample data
   */
  private detectPatternType(samples: DataSample[]): PatternAnalysis['patternType'] {
    if (samples.length < 10) {
      return 'stable';
    }

    const changedSamples = samples.filter(s => s.changeType !== 'none');
    
    if (changedSamples.length === 0) {
      return 'stable';
    }

    // Check for periodic patterns
    if (this.isPeriodicPattern(changedSamples)) {
      return 'periodic';
    }

    // Check for trending patterns
    if (this.isTrendingPattern(samples)) {
      return 'trending';
    }

    // Check volatility
    const volatility = this.calculateVolatility(samples);
    if (volatility > 0.7) {
      return 'volatile';
    }

    return 'stable';
  }

  /**
   * Check if pattern is periodic
   */
  private isPeriodicPattern(changedSamples: DataSample[]): boolean {
    if (changedSamples.length < 4) {
      return false;
    }

    const intervals: number[] = [];
    for (let i = 1; i < changedSamples.length; i++) {
      const currentSample = changedSamples[i];
      const previousSample = changedSamples[i - 1];
      if (currentSample && previousSample) {
        intervals.push(currentSample.timestamp - previousSample.timestamp);
      }
    }

    // Check if intervals are roughly consistent
    const mean = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const consistentIntervals = intervals.filter(
      interval => Math.abs(interval - mean) < mean * 0.3
    );

    return consistentIntervals.length / intervals.length > 0.7;
  }

  /**
   * Check if pattern is trending
   */
  private isTrendingPattern(samples: DataSample[]): boolean {
    if (samples.length < 10) {
      return false;
    }

    // Check for consistent increase or decrease in change frequency
    const windowSize = 5;
    const windows: number[] = [];
    
    for (let i = 0; i <= samples.length - windowSize; i++) {
      const window = samples.slice(i, i + windowSize);
      const changeCount = window.filter(s => s.changeType !== 'none').length;
      windows.push(changeCount);
    }

    // Check for consistent trend
    let increasing = 0;
    let decreasing = 0;
    
    for (let i = 1; i < windows.length; i++) {
      const currentWindow = windows[i];
      const previousWindow = windows[i - 1];
      if (currentWindow !== undefined && previousWindow !== undefined) {
        if (currentWindow > previousWindow) {
          increasing++;
        } else if (currentWindow < previousWindow) {
          decreasing++;
        }
      }
    }

    const totalComparisons = windows.length - 1;
    return (increasing / totalComparisons > 0.7) || (decreasing / totalComparisons > 0.7);
  }

  /**
   * Calculate pattern strength
   */
  private calculatePatternStrength(
    samples: DataSample[],
    patternType: PatternAnalysis['patternType']
  ): number {
    switch (patternType) {
      case 'stable':
        return 1.0 - (samples.filter(s => s.changeType !== 'none').length / samples.length);
      
      case 'periodic':
        return this.isPeriodicPattern(samples.filter(s => s.changeType !== 'none')) ? 0.8 : 0.3;
      
      case 'volatile':
        return this.calculateVolatility(samples);
      
      case 'trending':
        return this.isTrendingPattern(samples) ? 0.7 : 0.3;
      
      default:
        return 0.5;
    }
  }

  /**
   * Predict next change time for periodic patterns
   */
  private predictNextChangeTime(samples: DataSample[]): number | undefined {
    const changedSamples = samples.filter(s => s.changeType !== 'none');
    
    if (changedSamples.length < 3) {
      return undefined;
    }

    // Calculate average interval
    const intervals: number[] = [];
    for (let i = 1; i < changedSamples.length; i++) {
      const currentSample = changedSamples[i];
      const previousSample = changedSamples[i - 1];
      if (currentSample && previousSample) {
        intervals.push(currentSample.timestamp - previousSample.timestamp);
      }
    }

    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const lastSample = changedSamples[changedSamples.length - 1];
    if (!lastSample) {
      return undefined;
    }
    const lastChangeTime = lastSample.timestamp;
    
    return lastChangeTime + averageInterval;
  }

  /**
   * Calculate confidence in activity classification
   */
  private calculateClassificationConfidence(samples: DataSample[]): number {
    if (samples.length < 10) {
      return 0.3;
    }

    if (samples.length < 50) {
      return 0.6;
    }

    return 0.9;
  }

  /**
   * Estimate data size in bytes
   */
  private estimateDataSize(data: any): number {
    if (data === null || data === undefined) {
      return 0;
    }

    try {
      // Handle circular references with the same method as generateDataHash
      const seen = new WeakSet();
      const serialized = JSON.stringify(data, (_key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      });
      return serialized.length;
    } catch (error) {
      // Fallback estimation
      return String(data).length;
    }
  }

  /**
   * Record a sample for pattern analysis
   */
  private recordSample(dataSourceId: string, sample: DataSample): void {
    if (!this.dataSamples.has(dataSourceId)) {
      this.dataSamples.set(dataSourceId, []);
    }

    const samples = this.dataSamples.get(dataSourceId)!;
    
    // Check minimum interval
    if (samples.length > 0) {
      const lastSample = samples[samples.length - 1];
      if (lastSample && sample.timestamp - lastSample.timestamp < this.config.minSampleInterval) {
        return; // Skip sample if too close to previous
      }
    }

    samples.push(sample);

    // Keep only recent samples
    if (samples.length > this.config.sampleSize) {
      samples.shift();
    }

    // Clear pattern cache when new sample is added
    this.patternCache.delete(dataSourceId);
    this.cacheExpiry.delete(dataSourceId);
  }
}