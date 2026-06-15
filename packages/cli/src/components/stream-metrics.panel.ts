/**
 * @fileoverview Stream metrics panel component for real-time stream monitoring
 * @author Development Team
 * @since 5.2.0
 */

import { EventEmitter } from 'events';
import blessed from 'blessed';
import { line as createLineChart, LineChart, LineOptions } from 'blessed-contrib';
import { BaseComponent } from './base.component';
import { ComponentConfig, StreamMetrics } from '../types/monitoring';

/**
 * Configuration for stream metrics panel
 */
export interface StreamMetricsPanelConfig extends ComponentConfig {
  refreshInterval: number;
  maxDataPoints: number;
  channels: string[];
  alertThresholds: {
    bitrate: { min: number; max: number };
    fps: { min: number; max: number };
    viewerCount: { max: number };
  };
  chartStyle: {
    lineColors: string[];
    backgroundColor: string;
    foregroundColor: string;
  };
}

/**
 * Time series data point for metrics
 */
export interface MetricsDataPoint {
  timestamp: Date;
  bitrate: number;
  fps: number;
  viewerCount: number;
  bandwidth: number;
  channelId: string;
}

/**
 * Multi-channel metrics data structure
 */
export interface ChannelMetricsData {
  channelId: string;
  channelName?: string;
  isActive: boolean;
  dataPoints: MetricsDataPoint[];
  alerts: AlertInfo[];
  lastUpdate: Date;
}

/**
 * Alert information
 */
export interface AlertInfo {
  type: 'bitrate' | 'fps' | 'viewerCount';
  level: 'warning' | 'error';
  message: string;
  timestamp: Date;
  value: number;
  threshold: number;
}

/**
 * Stream metrics panel component for displaying real-time stream statistics
 */
export class StreamMetricsPanel extends BaseComponent {
  private lineChart!: LineChart;
  private channelsData: Map<string, ChannelMetricsData>;
  private currentChannelId: string | null;
  private container!: blessed.Widgets.BoxElement;
  private headerBox!: blessed.Widgets.BoxElement;
  private noDataBox!: blessed.Widgets.BoxElement;
  private alertBox!: blessed.Widgets.BoxElement;
  private lastUpdateTime: Date;
  private alertCooldowns: Map<string, Date>;

  constructor(config: StreamMetricsPanelConfig, eventBus: EventEmitter) {
    super(config, eventBus);
    this.channelsData = new Map();
    this.currentChannelId = null;
    this.lastUpdateTime = new Date();
    this.alertCooldowns = new Map();
  }

  /**
   * Creates the blessed widget structure for the component
   */
  protected createWidget(): void {
    // Main container
    this.container = blessed.box({
      label: ' Stream Metrics ',
      border: { type: 'line' },
      style: {
        fg: this.getConfig().chartStyle?.foregroundColor || 'white',
        bg: this.getConfig().chartStyle?.backgroundColor || 'black',
        border: { fg: 'cyan' }
      },
      top: this.config.position.y,
      left: this.config.position.x,
      width: this.config.position.width,
      height: this.config.position.height,
      scrollable: false,
      alwaysScroll: false,
      mouse: true,
      keys: true,
      vi: true,
      tags: true
    });

    // Header box for channel info and status
    this.headerBox = blessed.box({
      parent: this.container,
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      content: this.getNoChannelMessage(),
      style: { fg: 'yellow' },
      tags: true
    });

    // Alert box for displaying current alerts
    this.alertBox = blessed.box({
      parent: this.container,
      top: 'top+3',
      left: 0,
      width: '100%',
      height: 2,
      content: '',
      style: { fg: 'red', bold: true },
      tags: true
    });

    // Line chart for metrics display
    const chartConfig: LineOptions = {
      style: {
        line: this.getConfig().chartStyle?.lineColors?.[0] || 'yellow',
        text: this.getConfig().chartStyle?.foregroundColor || 'white',
        baseline: 'white'
      },
      xLabelPadding: 3,
      xPadding: 5,
      yLabelPadding: 3,
      yPadding: 2,
      legend: { width: 12 },
      wholeNumbersOnly: false,
      numYLabels: 6,
      numXLabels: 8,
      showLegend: true,
      abbreviate: true
    };

    this.lineChart = createLineChart(chartConfig);
    this.lineChart.parent = this.container;
    this.lineChart.top = 'top+5';
    this.lineChart.left = 0;
    this.lineChart.width = '100%';
    this.lineChart.height = 'bottom-1';

    // No data message box (initially hidden)
    this.noDataBox = blessed.box({
      parent: this.container,
      top: 'center',
      left: 'center',
      width: 'shrink',
      height: 'shrink',
      content: this.getNoDataMessage(),
      style: { fg: 'gray' },
      tags: true,
      hidden: false
    });

    this.widget = this.container;

    // Set up key bindings
    this.setupKeyBindings();

    // Hide chart initially until we have data
    this.lineChart.hide();
  }

  /**
   * Sets up keyboard bindings for the component
   */
  private setupKeyBindings(): void {
    this.container.key(['n', 'N'], () => {
      this.switchToNextChannel();
    });

    this.container.key(['p', 'P'], () => {
      this.switchToPreviousChannel();
    });

    this.container.key(['r', 'R'], () => {
      this.requestUpdate();
    });

    this.container.key(['c', 'C'], () => {
      this.clearAlerts();
    });
  }

  /**
   * Renders the component
   */
  public render(): void {
    if (this.isDestroyed || !this.widget) return;

    try {
      this.updateHeader();
      this.updateAlertDisplay();
      this.updateChart();
      this.widget.screen?.render();
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Unknown render error'));
    }
  }

  /**
   * Updates component with new stream metrics data
   * @param data Stream metrics data or array of metrics for multiple channels
   */
  public update(data: StreamMetrics | StreamMetrics[] | { channels: StreamMetrics[] }): void {
    if (this.isDestroyed) return;

    try {
      let metricsArray: StreamMetrics[];

      // Normalize input data to array format
      if (Array.isArray(data)) {
        metricsArray = data;
      } else if ('channels' in data && Array.isArray(data.channels)) {
        metricsArray = data.channels;
      } else {
        metricsArray = [data as StreamMetrics];
      }

      // Process each channel's metrics
      for (const metrics of metricsArray) {
        this.processChannelMetrics(metrics);
      }

      // If no current channel selected, select the first available
      if (!this.currentChannelId && this.channelsData.size > 0) {
        this.currentChannelId = Array.from(this.channelsData.keys())[0] || null;
      }

      this.lastUpdateTime = new Date();
      this.updateState({ lastUpdate: this.lastUpdateTime });

      // Show chart if we have data, hide no-data message
      if (this.channelsData.size > 0) {
        this.noDataBox.hide();
        this.lineChart.show();
      } else {
        this.noDataBox.show();
        this.lineChart.hide();
      }

      this.throttledRender();

    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Failed to update stream metrics'));
    }
  }

  /**
   * Processes metrics for a specific channel
   * @param metrics Stream metrics for the channel
   */
  private processChannelMetrics(metrics: StreamMetrics): void {
    const channelId = metrics.channelId;
    
    // Get or create channel data
    let channelData = this.channelsData.get(channelId);
    if (!channelData) {
      channelData = {
        channelId,
        isActive: metrics.status === 'live',
        dataPoints: [],
        alerts: [],
        lastUpdate: new Date()
      };
      this.channelsData.set(channelId, channelData);
    }

    // Create new data point
    const dataPoint: MetricsDataPoint = {
      timestamp: metrics.lastUpdate || new Date(),
      bitrate: metrics.bitrate || 0,
      fps: metrics.fps || 0,
      viewerCount: metrics.viewerCount || 0,
      bandwidth: metrics.bandwidth || 0,
      channelId
    };

    // Add data point and maintain max data points limit
    channelData.dataPoints.push(dataPoint);
    const maxPoints = this.getConfig().maxDataPoints || 100;
    if (channelData.dataPoints.length > maxPoints) {
      channelData.dataPoints = channelData.dataPoints.slice(-maxPoints);
    }

    // Update channel status
    channelData.isActive = metrics.status === 'live';
    channelData.lastUpdate = new Date();

    // Check for alerts
    this.checkAlerts(channelData, dataPoint);
  }

  /**
   * Checks for alert conditions based on current metrics
   * @param channelData Channel data to check
   * @param dataPoint Current data point
   */
  private checkAlerts(channelData: ChannelMetricsData, dataPoint: MetricsDataPoint): void {
    const config = this.getConfig();
    const thresholds = config.alertThresholds;
    const now = new Date();
    const cooldownMs = 30000; // 30 seconds cooldown

    // Check bitrate alerts
    if (thresholds?.bitrate) {
      const alertKey = `${channelData.channelId}-bitrate`;
      const lastAlert = this.alertCooldowns.get(alertKey);
      
      if (!lastAlert || (now.getTime() - lastAlert.getTime()) > cooldownMs) {
        if (dataPoint.bitrate < thresholds.bitrate.min) {
          const alert: AlertInfo = {
            type: 'bitrate',
            level: 'warning',
            message: `Low bitrate: ${dataPoint.bitrate} kbps (min: ${thresholds.bitrate.min} kbps)`,
            timestamp: now,
            value: dataPoint.bitrate,
            threshold: thresholds.bitrate.min
          };
          channelData.alerts.push(alert);
          this.alertCooldowns.set(alertKey, now);
          this.emitAlert(channelData.channelId, alert);
        } else if (dataPoint.bitrate > thresholds.bitrate.max) {
          const alert: AlertInfo = {
            type: 'bitrate',
            level: 'error',
            message: `High bitrate: ${dataPoint.bitrate} kbps (max: ${thresholds.bitrate.max} kbps)`,
            timestamp: now,
            value: dataPoint.bitrate,
            threshold: thresholds.bitrate.max
          };
          channelData.alerts.push(alert);
          this.alertCooldowns.set(alertKey, now);
          this.emitAlert(channelData.channelId, alert);
        }
      }
    }

    // Check FPS alerts
    if (thresholds?.fps) {
      const alertKey = `${channelData.channelId}-fps`;
      const lastAlert = this.alertCooldowns.get(alertKey);
      
      if (!lastAlert || (now.getTime() - lastAlert.getTime()) > cooldownMs) {
        if (dataPoint.fps < thresholds.fps.min) {
          const alert: AlertInfo = {
            type: 'fps',
            level: 'warning',
            message: `Low FPS: ${dataPoint.fps} (min: ${thresholds.fps.min})`,
            timestamp: now,
            value: dataPoint.fps,
            threshold: thresholds.fps.min
          };
          channelData.alerts.push(alert);
          this.alertCooldowns.set(alertKey, now);
          this.emitAlert(channelData.channelId, alert);
        }
      }
    }

    // Limit alerts per channel
    const maxAlerts = 10;
    if (channelData.alerts.length > maxAlerts) {
      channelData.alerts = channelData.alerts.slice(-maxAlerts);
    }
  }

  /**
   * Updates the header display with current channel information
   */
  private updateHeader(): void {
    if (!this.currentChannelId) {
      this.headerBox.setContent(this.getNoChannelMessage());
      return;
    }

    const channelData = this.channelsData.get(this.currentChannelId);
    if (!channelData) {
      this.headerBox.setContent(this.getNoChannelMessage());
      return;
    }

    const status = channelData.isActive ? '{green-fg}LIVE{/green-fg}' : '{red-fg}OFFLINE{/red-fg}';
    const lastUpdate = channelData.lastUpdate.toLocaleTimeString();
    const channelCount = this.channelsData.size;
    const currentIndex = Array.from(this.channelsData.keys()).indexOf(this.currentChannelId) + 1;

    const headerText = `Channel: {bold}${this.currentChannelId}{/bold} | Status: ${status} | Updated: {gray-fg}${lastUpdate}{/gray-fg} | {cyan-fg}${currentIndex}/${channelCount}{/cyan-fg}`;
    
    this.headerBox.setContent(headerText);
  }

  /**
   * Updates the alert display with current alerts
   */
  private updateAlertDisplay(): void {
    if (!this.currentChannelId) {
      this.alertBox.setContent('');
      return;
    }

    const channelData = this.channelsData.get(this.currentChannelId);
    if (!channelData || channelData.alerts.length === 0) {
      this.alertBox.setContent('');
      return;
    }

    // Show most recent alert
    const latestAlert = channelData.alerts[channelData.alerts.length - 1];
    const alertColor = latestAlert?.level === 'error' ? 'red' : 'yellow';
    const alertText = `{${alertColor}-fg}⚠ ${latestAlert?.message}{/${alertColor}-fg} | {gray-fg}${latestAlert?.timestamp.toLocaleTimeString()}{/gray-fg}`;
    
    this.alertBox.setContent(alertText);
  }

  /**
   * Updates the line chart with current channel data
   */
  private updateChart(): void {
    if (!this.currentChannelId) return;

    const channelData = this.channelsData.get(this.currentChannelId);
    if (!channelData || channelData.dataPoints.length === 0) return;

    try {
      const dataPoints = channelData.dataPoints;
      const timestamps = dataPoints.map(p => p.timestamp.toLocaleTimeString().slice(0, 5)); // HH:MM format
      
      const chartData = [
        {
          title: 'Bitrate (kbps)',
          x: timestamps,
          y: dataPoints.map(p => p.bitrate),
          style: { line: this.getConfig().chartStyle?.lineColors?.[0] || 'yellow' }
        },
        {
          title: 'FPS',
          x: timestamps,
          y: dataPoints.map(p => p.fps),
          style: { line: this.getConfig().chartStyle?.lineColors?.[1] || 'green' }
        },
        {
          title: 'Viewers',
          x: timestamps,
          y: dataPoints.map(p => p.viewerCount),
          style: { line: this.getConfig().chartStyle?.lineColors?.[2] || 'cyan' }
        }
      ];

      this.lineChart.setData(chartData);
    } catch (error) {
      // Chart update failed, but don't crash the component
      console.warn('[StreamMetricsPanel] Chart update failed:', error);
    }
  }

  /**
   * Switches to the next available channel
   */
  private switchToNextChannel(): void {
    const channels = Array.from(this.channelsData.keys());
    if (channels.length === 0) return;

    const currentIndex = this.currentChannelId ? channels.indexOf(this.currentChannelId) : -1;
    const nextIndex = (currentIndex + 1) % channels.length;
    this.currentChannelId = channels[nextIndex] || null;
    
    this.throttledRender();
    if (this.currentChannelId) {
      this.emitChannelSwitch(this.currentChannelId);
    }
  }

  /**
   * Switches to the previous available channel
   */
  private switchToPreviousChannel(): void {
    const channels = Array.from(this.channelsData.keys());
    if (channels.length === 0) return;

    const currentIndex = this.currentChannelId ? channels.indexOf(this.currentChannelId) : 0;
    const prevIndex = currentIndex === 0 ? channels.length - 1 : currentIndex - 1;
    this.currentChannelId = channels[prevIndex] || null;
    
    this.throttledRender();
    if (this.currentChannelId) {
      this.emitChannelSwitch(this.currentChannelId);
    }
  }

  /**
   * Clears all alerts for the current channel
   */
  private clearAlerts(): void {
    if (!this.currentChannelId) return;

    const channelData = this.channelsData.get(this.currentChannelId);
    if (channelData) {
      channelData.alerts = [];
      this.throttledRender();
    }
  }

  /**
   * Emits an alert event
   * @param channelId Channel that triggered the alert
   * @param alert Alert information
   */
  private emitAlert(channelId: string, alert: AlertInfo): void {
    this.emit('component:alert', {
      componentId: this.state.id,
      channelId,
      alert,
      timestamp: new Date()
    });
  }

  /**
   * Emits a channel switch event
   * @param channelId New current channel ID
   */
  private emitChannelSwitch(channelId: string): void {
    this.emit('component:channelSwitch', {
      componentId: this.state.id,
      channelId,
      timestamp: new Date()
    });
  }

  /**
   * Gets the no channel message
   */
  private getNoChannelMessage(): string {
    return '{center}{gray-fg}No channel selected{/gray-fg}{/center}';
  }

  /**
   * Gets the no data message
   */
  private getNoDataMessage(): string {
    return '{center}{gray-fg}No stream data available{/gray-fg}\n{center}{gray-fg}Waiting for stream metrics...{/gray-fg}{/center}';
  }

  /**
   * Gets the component configuration cast to the correct type
   */
  private getConfig(): StreamMetricsPanelConfig {
    return this.config as StreamMetricsPanelConfig;
  }

  /**
   * Gets the current channel data
   */
  public getCurrentChannelData(): ChannelMetricsData | null {
    return this.currentChannelId ? this.channelsData.get(this.currentChannelId) || null : null;
  }

  /**
   * Gets all channel data
   */
  public getAllChannelsData(): Map<string, ChannelMetricsData> {
    return new Map(this.channelsData);
  }

  /**
   * Sets the current channel
   * @param channelId Channel ID to switch to
   */
  public setCurrentChannel(channelId: string): void {
    if (this.channelsData.has(channelId)) {
      this.currentChannelId = channelId;
      this.throttledRender();
      this.emitChannelSwitch(channelId);
    }
  }

  /**
   * Cleans up component resources
   */
  public override destroy(): void {
    this.stopRefresh();
    this.channelsData.clear();
    this.alertCooldowns.clear();
    super.destroy();
  }
}