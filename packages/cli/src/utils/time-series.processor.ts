/**
 * @fileoverview Time series data processing utilities for monitoring
 * @author Development Team
 * @since 5.2.0
 */

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

/**
 * Time series with metadata
 */
export interface TimeSeries {
  name: string;
  metric: string;
  channelId: string;
  points: TimeSeriesPoint[];
  unit: string;
  aggregationType?: 'avg' | 'sum' | 'min' | 'max' | 'last';
}

/**
 * Time range specification
 */
export interface TimeRange {
  start: Date;
  end: Date;
}

/**
 * Aggregation configuration
 */
export interface AggregationConfig {
  interval: number; // milliseconds
  type: 'avg' | 'sum' | 'min' | 'max' | 'last';
}

/**
 * Query options for time series data
 */
export interface TimeSeriesQuery {
  channelId?: string;
  metric?: string;
  timeRange?: TimeRange;
  limit?: number;
  aggregation?: AggregationConfig;
}

/**
 * Time series processor for managing historical data
 */
export class TimeSeriesProcessor {
  private series: Map<string, TimeSeries>;
  private maxPointsPerSeries: number;
  private retentionPeriod: number; // milliseconds

  constructor(maxPointsPerSeries = 1000, retentionPeriodHours = 24) {
    this.series = new Map();
    this.maxPointsPerSeries = maxPointsPerSeries;
    this.retentionPeriod = retentionPeriodHours * 60 * 60 * 1000;
  }

  /**
   * Adds a data point to a time series
   * @param seriesKey Unique key for the series
   * @param point Data point to add
   * @param metadata Series metadata
   */
  public addPoint(
    seriesKey: string,
    point: TimeSeriesPoint,
    metadata: {
      name: string;
      metric: string;
      channelId?: string;
      unit: string;
      aggregationType?: 'avg' | 'sum' | 'min' | 'max' | 'last';
    }
  ): void {
    let series = this.series.get(seriesKey);
    
    if (!series) {
      series = {
        name: metadata.name,
        metric: metadata.metric,
        channelId: metadata.channelId || '',
        points: [],
        unit: metadata.unit,
        aggregationType: metadata.aggregationType || 'last'
      };
      this.series.set(seriesKey, series!);
    }

    // Add the point
    series!.points.push(point);

    // Sort by timestamp to maintain order
    series!.points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Trim to max points limit
    if (series!.points.length > this.maxPointsPerSeries) {
      series!.points = series!.points.slice(-this.maxPointsPerSeries);
    }

    // Clean up old data beyond retention period
    this.cleanupOldData(series!);
  }

  /**
   * Adds multiple data points for stream metrics
   * @param channelId Channel ID
   * @param timestamp Timestamp for all metrics
   * @param metrics Object containing metric values
   */
  public addStreamMetrics(
    channelId: string,
    timestamp: Date,
    metrics: {
      bitrate?: number;
      fps?: number;
      viewerCount?: number;
      bandwidth?: number;
      uptime?: number;
    }
  ): void {
    if (metrics.bitrate !== undefined) {
      this.addPoint(
        `${channelId}-bitrate`,
        { timestamp, value: metrics.bitrate },
        {
          name: `Channel ${channelId} Bitrate`,
          metric: 'bitrate',
          channelId,
          unit: 'kbps',
          aggregationType: 'avg'
        }
      );
    }

    if (metrics.fps !== undefined) {
      this.addPoint(
        `${channelId}-fps`,
        { timestamp, value: metrics.fps },
        {
          name: `Channel ${channelId} FPS`,
          metric: 'fps',
          channelId,
          unit: 'fps',
          aggregationType: 'avg'
        }
      );
    }

    if (metrics.viewerCount !== undefined) {
      this.addPoint(
        `${channelId}-viewerCount`,
        { timestamp, value: metrics.viewerCount },
        {
          name: `Channel ${channelId} Viewers`,
          metric: 'viewerCount',
          channelId,
          unit: 'viewers',
          aggregationType: 'last'
        }
      );
    }

    if (metrics.bandwidth !== undefined) {
      this.addPoint(
        `${channelId}-bandwidth`,
        { timestamp, value: metrics.bandwidth },
        {
          name: `Channel ${channelId} Bandwidth`,
          metric: 'bandwidth',
          channelId,
          unit: 'bps',
          aggregationType: 'avg'
        }
      );
    }

    if (metrics.uptime !== undefined) {
      this.addPoint(
        `${channelId}-uptime`,
        { timestamp, value: metrics.uptime },
        {
          name: `Channel ${channelId} Uptime`,
          metric: 'uptime',
          channelId,
          unit: 'ms',
          aggregationType: 'last'
        }
      );
    }
  }

  /**
   * Queries time series data
   * @param query Query parameters
   * @returns Array of matching time series
   */
  public query(query: TimeSeriesQuery = {}): TimeSeries[] {
    const results: TimeSeries[] = [];

    // Get all series that match the criteria
    for (const series of this.series.values()) {
      let matches = true;

      if (query.channelId && series.channelId !== query.channelId) {
        matches = false;
      }

      if (query.metric && series.metric !== query.metric) {
        matches = false;
      }

      if (matches) {
        const filteredSeries = { ...series };

        // Apply time range filter
        if (query.timeRange) {
          filteredSeries.points = series.points.filter(point => 
            point.timestamp >= query.timeRange!.start && 
            point.timestamp <= query.timeRange!.end
          );
        } else {
          filteredSeries.points = [...series.points];
        }

        // Apply aggregation if specified
        if (query.aggregation) {
          filteredSeries.points = this.aggregatePoints(
            filteredSeries.points,
            query.aggregation
          );
        }

        // Apply limit
        if (query.limit && filteredSeries.points.length > query.limit) {
          filteredSeries.points = filteredSeries.points.slice(-query.limit);
        }

        results.push(filteredSeries);
      }
    }

    return results;
  }

  /**
   * Gets historical data for a specific channel and metric
   * @param channelId Channel ID
   * @param metric Metric name
   * @param timeRange Optional time range
   * @returns Time series data or null if not found
   */
  public getHistoricalData(
    channelId: string,
    metric: string,
    timeRange?: TimeRange
  ): TimeSeries | null {
    const seriesKey = `${channelId}-${metric}`;
    const series = this.series.get(seriesKey);
    
    if (!series) return null;

    let points = [...series.points];

    // Filter by time range if specified
    if (timeRange) {
      points = points.filter(point => 
        point.timestamp >= timeRange.start && 
        point.timestamp <= timeRange.end
      );
    }

    return {
      ...series,
      points
    };
  }

  /**
   * Gets all metrics for a specific channel
   * @param channelId Channel ID
   * @param timeRange Optional time range
   * @returns Map of metric name to time series
   */
  public getChannelMetrics(
    channelId: string,
    timeRange?: TimeRange
  ): Map<string, TimeSeries> {
    const results = new Map<string, TimeSeries>();

    for (const [, series] of this.series.entries()) {
      if (series.channelId === channelId) {
        let points = [...series.points];

        // Filter by time range if specified
        if (timeRange) {
          points = points.filter(point => 
            point.timestamp >= timeRange.start && 
            point.timestamp <= timeRange.end
          );
        }

        results.set(series.metric, {
          ...series,
          points
        });
      }
    }

    return results;
  }

  /**
   * Aggregates data points based on configuration
   * @param points Data points to aggregate
   * @param config Aggregation configuration
   * @returns Aggregated data points
   */
  private aggregatePoints(
    points: TimeSeriesPoint[],
    config: AggregationConfig
  ): TimeSeriesPoint[] {
    if (points.length === 0) return [];

    const buckets = new Map<number, TimeSeriesPoint[]>();

    // Group points into time buckets
    for (const point of points) {
      const bucketTime = Math.floor(point.timestamp.getTime() / config.interval) * config.interval;
      
      if (!buckets.has(bucketTime)) {
        buckets.set(bucketTime, []);
      }
      
      buckets.get(bucketTime)!.push(point);
    }

    // Aggregate each bucket
    const aggregatedPoints: TimeSeriesPoint[] = [];
    
    for (const [bucketTime, bucketPoints] of buckets.entries()) {
      let aggregatedValue: number;

      switch (config.type) {
        case 'avg':
          aggregatedValue = bucketPoints.reduce((sum, p) => sum + p.value, 0) / bucketPoints.length;
          break;
        case 'sum':
          aggregatedValue = bucketPoints.reduce((sum, p) => sum + p.value, 0);
          break;
        case 'min':
          aggregatedValue = Math.min(...bucketPoints.map(p => p.value));
          break;
        case 'max':
          aggregatedValue = Math.max(...bucketPoints.map(p => p.value));
          break;
        case 'last':
        default:
          aggregatedValue = bucketPoints[bucketPoints.length - 1]?.value || 0;
          break;
      }

      aggregatedPoints.push({
        timestamp: new Date(bucketTime),
        value: aggregatedValue
      });
    }

    return aggregatedPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Cleans up old data points beyond retention period
   * @param series Time series to clean up
   */
  private cleanupOldData(series: TimeSeries): void {
    const cutoffTime = new Date(Date.now() - this.retentionPeriod);
    
    series.points = series.points.filter(point => 
      point.timestamp >= cutoffTime
    );
  }

  /**
   * Clears all historical data
   */
  public clearAll(): void {
    this.series.clear();
  }

  /**
   * Clears data for a specific channel
   * @param channelId Channel ID to clear
   */
  public clearChannel(channelId: string): void {
    const keysToDelete: string[] = [];
    
    for (const [key, series] of this.series.entries()) {
      if (series.channelId === channelId) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.series.delete(key);
    }
  }

  /**
   * Gets statistics about stored data
   */
  public getStats(): {
    seriesCount: number;
    totalPoints: number;
    oldestPoint?: Date;
    newestPoint?: Date;
    channelCount: number;
    metricTypes: string[];
  } {
    let totalPoints = 0;
    let oldestPoint: Date | undefined;
    let newestPoint: Date | undefined;
    const channels = new Set<string>();
    const metricTypes = new Set<string>();

    for (const series of this.series.values()) {
      totalPoints += series.points.length;
      
      if (series.channelId) {
        channels.add(series.channelId);
      }
      
      metricTypes.add(series.metric);

      for (const point of series.points) {
        if (!oldestPoint || point.timestamp < oldestPoint) {
          oldestPoint = point.timestamp;
        }
        if (!newestPoint || point.timestamp > newestPoint) {
          newestPoint = point.timestamp;
        }
      }
    }

    return {
      seriesCount: this.series.size,
      totalPoints,
      ...(oldestPoint ? { oldestPoint } : {}),
      ...(newestPoint ? { newestPoint } : {}),
      channelCount: channels.size,
      metricTypes: Array.from(metricTypes)
    };
  }

  /**
   * Exports all data to JSON format
   * @returns JSON representation of all time series data
   */
  public exportToJSON(): string {
    const data = Array.from(this.series.entries()).map(([key, series]) => ({
      key,
      ...series
    }));

    return JSON.stringify(data, null, 2);
  }

  /**
   * Imports data from JSON format
   * @param jsonData JSON string containing time series data
   */
  public importFromJSON(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid JSON format: expected array');
      }

      this.series.clear();

      for (const item of data) {
        if (item.key && item.name && item.metric && item.points) {
          // Convert timestamp strings back to Date objects
          const points = item.points.map((p: any) => ({
            timestamp: new Date(p.timestamp),
            value: p.value
          }));

          this.series.set(item.key, {
            name: item.name,
            metric: item.metric,
            channelId: item.channelId,
            points,
            unit: item.unit || '',
            aggregationType: item.aggregationType || 'last'
          });
        }
      }
    } catch (error) {
      throw new Error(`Failed to import JSON data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}