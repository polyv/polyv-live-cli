/**
 * @fileoverview System resource monitoring panel component
 * @author Development Team
 * @since 1.0.0
 */

import * as blessed from 'blessed';
import * as contrib from 'blessed-contrib';
import { EventEmitter } from 'events';
import { BaseComponent } from './base.component';
import { ComponentConfig } from '../types/monitoring';
import { SystemResourceService, SystemResourcesDetailed, NetworkUtils } from '../services/system-resource.service';

// Lazy initialize blessed screen only when needed
let screen: any = null;
let screenRefCount = 0;

const getScreen = () => {
  if (!screen) {
    try {
      screen = blessed.screen({
        smartCSR: true,
        dockBorders: true,
      });
    } catch (error) {
      // Fallback for test environment
      screen = {
        render: () => {},
        destroy: () => {},
      };
    }
  }
  screenRefCount++;
  return screen;
};

const releaseScreen = () => {
  screenRefCount--;
  if (screenRefCount <= 0 && screen && screen.destroy) {
    try {
      screen.destroy();
    } catch {
      // Ignore destroy errors
    }
    screen = null;
    screenRefCount = 0;
  }
};

/**
 * System resource alert thresholds
 */
interface ResourceAlertThresholds {
  cpu: {
    warning: number;
    critical: number;
  };
  memory: {
    warning: number;
    critical: number;
  };
  network: {
    warning: number; // MB/s
    critical: number; // MB/s
  };
}

/**
 * System resource monitoring panel component
 * Displays real-time system resource usage including CPU, memory, and network
 */
export class SystemResourcePanel extends BaseComponent {
  private container!: blessed.Widgets.BoxElement;
  private cpuGauge: any;
  private memoryGauge: any;
  private processGauge: any;
  private networkChart: any;
  private cpuChart: any;
  private memoryChart: any;
  private networkStatsBox!: blessed.Widgets.BoxElement;
  private processStatsBox!: blessed.Widgets.BoxElement;
  private infoBox!: blessed.Widgets.BoxElement;
  private alertBox!: blessed.Widgets.BoxElement;
  
  private systemResourceService: SystemResourceService;
  private currentResources: SystemResourcesDetailed | null = null;
  private networkHistory: Array<{ timestamp: number; bytesIn: number; bytesOut: number }> = [];
  private cpuHistory: Array<{ timestamp: number; usage: number }> = [];
  private memoryHistory: Array<{ timestamp: number; usage: number }> = [];
  private readonly maxNetworkHistorySize = 60; // 60 data points for 5 minutes at 5s intervals
  private readonly maxCpuHistorySize = 60; // 60 data points for trend chart
  private readonly maxMemoryHistorySize = 60; // 60 data points for trend chart
  
  private alertThresholds: ResourceAlertThresholds = {
    cpu: { warning: 70, critical: 85 },
    memory: { warning: 75, critical: 90 },
    network: { warning: 10, critical: 50 }, // MB/s
  };
  
  private isGracefullyDegraded = false;
  private lastNetworkBytes = { in: 0, out: 0, timestamp: 0 };

  constructor(config: ComponentConfig, eventBus: EventEmitter) {
    super(config, eventBus);
    this.systemResourceService = new SystemResourceService();
    this.setupResourceService();
    this.loadAlertThresholds();
  }

  /**
   * Load alert thresholds from configuration
   */
  private loadAlertThresholds(): void {
    const alertConfig = this.config.config['alertThresholds'];
    if (alertConfig) {
      this.alertThresholds = {
        cpu: {
          warning: alertConfig.cpu?.warning || this.alertThresholds.cpu.warning,
          critical: alertConfig.cpu?.critical || this.alertThresholds.cpu.critical,
        },
        memory: {
          warning: alertConfig.memory?.warning || this.alertThresholds.memory.warning,
          critical: alertConfig.memory?.critical || this.alertThresholds.memory.critical,
        },
        network: {
          warning: alertConfig.network?.warning || this.alertThresholds.network.warning,
          critical: alertConfig.network?.critical || this.alertThresholds.network.critical,
        },
      };
    }
  }

  /**
   * Update alert thresholds
   */
  public updateAlertThresholds(newThresholds: Partial<ResourceAlertThresholds>): void {
    if (newThresholds.cpu) {
      this.alertThresholds.cpu = { ...this.alertThresholds.cpu, ...newThresholds.cpu };
    }
    if (newThresholds.memory) {
      this.alertThresholds.memory = { ...this.alertThresholds.memory, ...newThresholds.memory };
    }
    if (newThresholds.network) {
      this.alertThresholds.network = { ...this.alertThresholds.network, ...newThresholds.network };
    }
  }

  /**
   * Get current alert thresholds
   */
  public getAlertThresholds(): ResourceAlertThresholds {
    return { ...this.alertThresholds };
  }

  /**
   * Set up system resource service event listeners
   */
  private setupResourceService(): void {
    this.systemResourceService.on('resourceUpdate', (resources: SystemResourcesDetailed) => {
      this.currentResources = resources;
      this.updateNetworkHistory(resources);
      this.updateCpuHistory(resources);
      this.updateMemoryHistory(resources);
      this.update(resources);
    });

    this.systemResourceService.on('error', (error: Error) => {
      this.handleResourceError(error);
    });
  }

  /**
   * Create the widget components
   */
  protected createWidget(): void {
    try {
      // Initialize the main widget first
      this.widget = blessed.box({
        parent: getScreen(),
        top: this.config.position.y || 0,
        left: this.config.position.x || 0,
        width: this.config.position.width || '100%',
        height: this.config.position.height || '100%',
        label: ' System Resources ',
        border: { type: 'line' },
        style: {
          border: { fg: 'blue' },
          label: { fg: 'white', bold: true },
        },
      });
      
      this.container = this.widget;

      this.createGauges();
      this.createNetworkChart();
      this.createCpuChart();
      this.createMemoryChart();
      this.createNetworkStatsBox();
      this.createProcessStatsBox();
      this.createInfoBox();
      this.createAlertBox();
      
      this.startDataCollection();
    } catch (error) {
      this.handleResourceError(error instanceof Error ? error : new Error('Widget creation failed'));
    }
  }

  /**
   * Create CPU, memory, and process gauges
   */
  private createGauges(): void {
    // CPU Gauge
    this.cpuGauge = contrib.gauge({
      top: '1%',
      left: '0%',
      width: '33%',
      height: '40%',
      label: 'CPU Usage',
      stroke: 'green',
      fill: 'white',
      showLabel: true,
      style: {
        label: { fg: 'white' },
      },
    } as any);
    this.container.append(this.cpuGauge);

    // Memory Gauge
    this.memoryGauge = contrib.gauge({
      top: '1%',
      left: '33%',
      width: '33%',
      height: '40%',
      label: 'Memory Usage',
      stroke: 'green',
      fill: 'white',
      showLabel: true,
      style: {
        label: { fg: 'white' },
      },
    } as any);
    this.container.append(this.memoryGauge);

    // Process Gauge
    this.processGauge = contrib.gauge({
      top: '1%',
      left: '66%',
      width: '34%',
      height: '40%',
      label: 'Process CPU',
      stroke: 'green',
      fill: 'white',
      showLabel: true,
      style: {
        label: { fg: 'white' },
      },
    } as any);
    this.container.append(this.processGauge);
  }

  /**
   * Create network traffic chart
   */
  private createNetworkChart(): void {
    this.networkChart = contrib.line({
      label: 'Network Traffic (MB/s)',
      showLegend: true,
      legend: { width: 12 },
      style: {
        line: 'yellow',
        text: 'green',
        baseline: 'black',
      },
    } as any);
    
    // Set position manually
    this.networkChart.top = '41%';
    this.networkChart.left = '0%';
    this.networkChart.width = '35%';
    this.networkChart.height = '25%';
    
    this.container.append(this.networkChart);
  }

  /**
   * Create CPU usage trend chart
   */
  private createCpuChart(): void {
    this.cpuChart = contrib.line({
      label: 'CPU Usage Trend (%)',
      showLegend: false,
      style: {
        line: 'red',
        text: 'green',
        baseline: 'black',
      },
    } as any);
    
    // Set position manually
    this.cpuChart.top = '41%';
    this.cpuChart.left = '35%';
    this.cpuChart.width = '35%';
    this.cpuChart.height = '25%';
    
    this.container.append(this.cpuChart);
  }

  /**
   * Create memory usage trend chart
   */
  private createMemoryChart(): void {
    this.memoryChart = contrib.line({
      label: 'Memory Usage Trend (%)',
      showLegend: false,
      style: {
        line: 'blue',
        text: 'green',
        baseline: 'black',
      },
    } as any);
    
    // Set position manually
    this.memoryChart.top = '66%';
    this.memoryChart.left = '0%';
    this.memoryChart.width = '35%';
    this.memoryChart.height = '25%';
    
    this.container.append(this.memoryChart);
  }
  
  /**
   * Create network statistics box
   */
  private createNetworkStatsBox(): void {
    this.networkStatsBox = blessed.box({
      parent: this.container,
      top: '41%',
      left: '70%',
      width: '30%',
      height: '25%',
      label: ' Network Stats ',
      border: { type: 'line' },
      style: {
        border: { fg: 'cyan' },
        label: { fg: 'white' },
      },
      content: 'Loading network stats...',
    });
  }
  
  /**
   * Create process statistics box
   */
  private createProcessStatsBox(): void {
    this.processStatsBox = blessed.box({
      parent: this.container,
      top: '66%',
      left: '35%',
      width: '35%',
      height: '25%',
      label: ' Process Stats ',
      border: { type: 'line' },
      style: {
        border: { fg: 'magenta' },
        label: { fg: 'white' },
      },
      content: 'Loading process stats...',
    });
  }

  /**
   * Create system info box
   */
  private createInfoBox(): void {
    this.infoBox = blessed.box({
      parent: this.container,
      top: '91%',
      left: 0,
      width: '50%',
      height: '9%',
      label: ' System Info ',
      border: { type: 'line' },
      style: {
        border: { fg: 'gray' },
        label: { fg: 'white' },
      },
      content: 'Loading system info...',
    });
  }

  /**
   * Create alert box
   */
  private createAlertBox(): void {
    this.alertBox = blessed.box({
      parent: this.container,
      top: '91%',
      left: '50%',
      width: '50%',
      height: '9%',
      label: ' Alerts ',
      border: { type: 'line' },
      style: {
        border: { fg: 'red' },
        label: { fg: 'white' },
      },
      content: 'No alerts',
    });
  }

  /**
   * Start data collection
   */
  private startDataCollection(): void {
    // Start with immediate collection
    this.collectResourceData();
    
    // Then start periodic collection
    const refreshInterval = this.config.config['refreshInterval'] || 5000;
    this.startRefresh(refreshInterval);
  }

  /**
   * Collect resource data
   */
  private async collectResourceData(): Promise<void> {
    try {
      await this.systemResourceService.getSystemResources();
    } catch (error) {
      this.handleResourceError(error instanceof Error ? error : new Error('Data collection failed'));
    }
  }

  /**
   * Update network history for chart display
   */
  private updateNetworkHistory(resources: SystemResourcesDetailed): void {
    const now = Date.now();
    const currentBytes = {
      in: resources.network.totalBytesIn,
      out: resources.network.totalBytesOut,
      timestamp: now,
    };

    // Calculate rates (bytes per second)
    let inRate = 0;
    let outRate = 0;
    
    if (this.lastNetworkBytes.timestamp > 0) {
      const timeDiff = (now - this.lastNetworkBytes.timestamp) / 1000; // seconds
      if (timeDiff > 0) {
        inRate = Math.max(0, (currentBytes.in - this.lastNetworkBytes.in) / timeDiff);
        outRate = Math.max(0, (currentBytes.out - this.lastNetworkBytes.out) / timeDiff);
      }
    }

    this.lastNetworkBytes = currentBytes;

    // Add to history
    this.networkHistory.push({
      timestamp: now,
      bytesIn: inRate / (1024 * 1024), // Convert to MB/s
      bytesOut: outRate / (1024 * 1024), // Convert to MB/s
    });

    // Limit history size
    if (this.networkHistory.length > this.maxNetworkHistorySize) {
      this.networkHistory.shift();
    }
  }

  /**
   * Update CPU history for chart display
   */
  private updateCpuHistory(resources: SystemResourcesDetailed): void {
    const now = Date.now();
    
    // Add to history
    this.cpuHistory.push({
      timestamp: now,
      usage: resources.cpu.usage,
    });

    // Limit history size
    if (this.cpuHistory.length > this.maxCpuHistorySize) {
      this.cpuHistory.shift();
    }
  }

  /**
   * Update memory history for chart display
   */
  private updateMemoryHistory(resources: SystemResourcesDetailed): void {
    const now = Date.now();
    
    // Add to history
    this.memoryHistory.push({
      timestamp: now,
      usage: resources.memory.percentage,
    });

    // Limit history size
    if (this.memoryHistory.length > this.maxMemoryHistorySize) {
      this.memoryHistory.shift();
    }
  }

  /**
   * Handle resource collection errors
   */
  private handleResourceError(error: Error): void {
    if (!this.isGracefullyDegraded) {
      this.isGracefullyDegraded = true;
      this.showDegradedMode();
    }
    this.handleError(error);
  }

  /**
   * Show degraded mode display
   */
  private showDegradedMode(): void {
    if (this.alertBox) {
      this.alertBox.setContent('DEGRADED MODE\nLimited data available');
      this.alertBox.style.border = { fg: 'yellow' };
    }
  }

  /**
   * Render the component
   */
  public render(): void {
    if (!this.currentResources) return;

    try {
      this.updateGauges();
      this.updateNetworkChart();
      this.updateCpuChart();
      this.updateMemoryChart();
      this.updateNetworkStatsBox();
      this.updateProcessStatsBox();
      this.updateInfoBox();
      this.updateAlertBox();
      
      const currentScreen = getScreen();
      if (currentScreen && currentScreen.render) {
        currentScreen.render();
      }
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Render failed'));
    }
  }

  /**
   * Update gauge displays
   */
  private updateGauges(): void {
    if (!this.currentResources) return;

    // Update CPU gauge
    if (this.cpuGauge) {
      const cpuPercent = this.currentResources.cpu.usage;
      this.cpuGauge.setPercent(cpuPercent);
      this.cpuGauge.setStack([
        { percent: cpuPercent, stroke: this.getColorForValue(cpuPercent, 'cpu') }
      ]);
    }

    // Update Memory gauge
    if (this.memoryGauge) {
      const memoryPercent = this.currentResources.memory.percentage;
      this.memoryGauge.setPercent(memoryPercent);
      this.memoryGauge.setStack([
        { percent: memoryPercent, stroke: this.getColorForValue(memoryPercent, 'memory') }
      ]);
    }

    // Update Process gauge
    if (this.processGauge) {
      const processPercent = Math.min(100, this.currentResources.process.cpuUsage);
      this.processGauge.setPercent(processPercent);
      
      // Color based on performance rating
      const ratingColor = this.currentResources.process.performanceRating === 'excellent' ? 'green' :
                         this.currentResources.process.performanceRating === 'good' ? 'cyan' :
                         this.currentResources.process.performanceRating === 'fair' ? 'yellow' : 'red';
      
      this.processGauge.setStack([
        { percent: processPercent, stroke: ratingColor }
      ]);
    }
  }

  /**
   * Update network chart
   */
  private updateNetworkChart(): void {
    if (!this.networkChart || this.networkHistory.length === 0) return;

    const labels = this.networkHistory.map((_, index) => index.toString());
    const inData = this.networkHistory.map(entry => entry.bytesIn.toFixed(2));
    const outData = this.networkHistory.map(entry => entry.bytesOut.toFixed(2));

    this.networkChart.setData([
      {
        title: 'In',
        x: labels,
        y: inData,
        style: { line: 'green' },
      },
      {
        title: 'Out',
        x: labels,
        y: outData,
        style: { line: 'red' },
      },
    ]);
  }

  /**
   * Update CPU chart
   */
  private updateCpuChart(): void {
    if (!this.cpuChart || this.cpuHistory.length === 0) return;

    const labels = this.cpuHistory.map((_, index) => index.toString());
    const data = this.cpuHistory.map(entry => entry.usage.toFixed(1));

    this.cpuChart.setData([
      {
        title: 'CPU',
        x: labels,
        y: data,
        style: { line: 'red' },
      },
    ]);
  }

  /**
   * Update memory chart
   */
  private updateMemoryChart(): void {
    if (!this.memoryChart || this.memoryHistory.length === 0) return;

    const labels = this.memoryHistory.map((_, index) => index.toString());
    const data = this.memoryHistory.map(entry => entry.usage.toFixed(1));

    this.memoryChart.setData([
      {
        title: 'Memory',
        x: labels,
        y: data,
        style: { line: 'blue' },
      },
    ]);
  }
  
  /**
   * Update network statistics box
   */
  private updateNetworkStatsBox(): void {
    if (!this.networkStatsBox || !this.currentResources) return;

    const network = this.currentResources.network;
    const totalRateIn = network.totalRateIn || 0;
    const totalRateOut = network.totalRateOut || 0;
    const totalRate = totalRateIn + totalRateOut;
    
    const bandwidthIn = NetworkUtils.formatBandwidth(totalRateIn);
    const bandwidthOut = NetworkUtils.formatBandwidth(totalRateOut);
    const totalBandwidth = NetworkUtils.formatBandwidth(totalRate);
    
    const totalBytes = NetworkUtils.formatBytes(network.totalBytesIn + network.totalBytesOut);
    
    const content = [
      `Total: ${totalBandwidth.formatted}`,
      `In: ${bandwidthIn.formatted}`,
      `Out: ${bandwidthOut.formatted}`,
      ``,
      `Total Data: ${totalBytes.formatted}`,
      `Active IFs: ${network.activeInterfaces}`,
      `Connections: ${network.connections}`,
      `State: ${network.connectionState}`,
      ``,
      `Interface Details:`,
      ...network.interfaces.slice(0, 3).map(iface => 
        `  ${iface.name}: ${iface.isUp ? 'UP' : 'DOWN'}`
      ),
    ].join('\n');

    this.networkStatsBox.setContent(content);
    
    // Update border color based on connection state
    const borderColor = network.connectionState === 'connected' ? 'green' : 
                       network.connectionState === 'limited' ? 'yellow' : 'red';
    this.networkStatsBox.style.border = { fg: borderColor };
  }
  
  /**
   * Update process statistics box
   */
  private updateProcessStatsBox(): void {
    if (!this.processStatsBox || !this.currentResources) return;

    const proc = this.currentResources.process;
    
    // Format uptime
    const uptimeHours = Math.floor(proc.uptime / 3600);
    const uptimeMinutes = Math.floor((proc.uptime % 3600) / 60);
    const uptimeSeconds = Math.floor(proc.uptime % 60);
    const uptimeFormatted = `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`;
    
    // Format memory usage
    const heapUsed = NetworkUtils.formatBytes(proc.heapUsed);
    const heapTotal = NetworkUtils.formatBytes(proc.heapTotal || 0);
    const rss = NetworkUtils.formatBytes(proc.rss || 0);
    const peakMemory = NetworkUtils.formatBytes(proc.peakMemoryUsage || 0);
    
    // Performance rating color
    const ratingColor = proc.performanceRating === 'excellent' ? 'green' :
                       proc.performanceRating === 'good' ? 'cyan' :
                       proc.performanceRating === 'fair' ? 'yellow' : 'red';
    
    const content = [
      `PID: ${proc.pid}`,
      `Status: ${proc.status}`,
      `Uptime: ${uptimeFormatted}`,
      ``,
      `CPU: ${proc.cpuUsage}%`,
      `Avg CPU: ${proc.avgCpuUsage || 0}%`,
      ``,
      `Heap: ${heapUsed.formatted}`,
      `Total: ${heapTotal.formatted}`,
      `RSS: ${rss.formatted}`,
      `Peak: ${peakMemory.formatted}`,
      ``,
      `FDs: ${proc.fileDescriptors || 'N/A'}`,
      `Threads: ${proc.threadCount || 'N/A'}`,
      ``,
      `Rating: ${proc.performanceRating || 'unknown'}`,
    ].join('\n');

    this.processStatsBox.setContent(content);
    
    // Update border color based on performance rating
    this.processStatsBox.style.border = { fg: ratingColor };
  }

  /**
   * Update system info box
   */
  private updateInfoBox(): void {
    if (!this.infoBox || !this.currentResources) return;

    const info = this.systemResourceService.getSystemInfo();
    const formatBytes = (bytes: number): string => {
      const result = NetworkUtils.formatBytes(bytes);
      return result.formatted;
    };

    const content = [
      `Platform: ${info.platform}`,
      `Hostname: ${info.hostname}`,
      `Uptime: ${Math.floor(info.uptime / 3600)}h ${Math.floor((info.uptime % 3600) / 60)}m`,
      `Memory: ${formatBytes(this.currentResources.memory.used)} / ${formatBytes(this.currentResources.memory.total)}`,
      `CPU: ${this.currentResources.cpu.cores} cores`,
      `Process: PID ${this.currentResources.process.pid}`,
      `Proc Mem: ${formatBytes(this.currentResources.process.memoryUsage)}`,
    ].join('\n');

    this.infoBox.setContent(content);
  }

  /**
   * Update alert box
   */
  private updateAlertBox(): void {
    if (!this.alertBox || !this.currentResources) return;

    const alerts: string[] = [];
    
    // Check CPU alerts
    if (this.currentResources.cpu.usage >= this.alertThresholds.cpu.critical) {
      alerts.push(`CPU: ${this.currentResources.cpu.usage}% (CRITICAL)`);
    } else if (this.currentResources.cpu.usage >= this.alertThresholds.cpu.warning) {
      alerts.push(`CPU: ${this.currentResources.cpu.usage}% (WARNING)`);
    }

    // Check Memory alerts
    if (this.currentResources.memory.percentage >= this.alertThresholds.memory.critical) {
      alerts.push(`Memory: ${this.currentResources.memory.percentage}% (CRITICAL)`);
    } else if (this.currentResources.memory.percentage >= this.alertThresholds.memory.warning) {
      alerts.push(`Memory: ${this.currentResources.memory.percentage}% (WARNING)`);
    }

    // Check Network alerts
    const currentNetworkMBps = this.networkHistory.length > 0 ? 
      (this.networkHistory[this.networkHistory.length - 1]?.bytesIn || 0) + 
      (this.networkHistory[this.networkHistory.length - 1]?.bytesOut || 0) : 0;
    
    if (currentNetworkMBps >= this.alertThresholds.network.critical) {
      alerts.push(`Network: ${currentNetworkMBps.toFixed(1)}MB/s (CRITICAL)`);
    } else if (currentNetworkMBps >= this.alertThresholds.network.warning) {
      alerts.push(`Network: ${currentNetworkMBps.toFixed(1)}MB/s (WARNING)`);
    }

    const content = alerts.length > 0 ? alerts.join('\n') : 'No alerts';
    this.alertBox.setContent(content);
    
    // Update alert box color based on severity
    if (alerts.some(alert => alert.includes('CRITICAL'))) {
      this.alertBox.style.border = { fg: 'red' };
    } else if (alerts.some(alert => alert.includes('WARNING'))) {
      this.alertBox.style.border = { fg: 'yellow' };
    } else {
      this.alertBox.style.border = { fg: 'green' };
    }
  }

  /**
   * Get color for value based on thresholds
   */
  private getColorForValue(value: number, type: 'cpu' | 'memory' | 'network'): string {
    const thresholds = this.alertThresholds[type];
    
    if (value >= thresholds.critical) {
      return 'red';
    } else if (value >= thresholds.warning) {
      return 'yellow';
    } else {
      return 'green';
    }
  }

  /**
   * Update component with new data
   */
  public update(data: SystemResourcesDetailed): void {
    if (this.isDestroyed) return;

    try {
      this.currentResources = data;
      this.updateState({ data, lastUpdate: new Date() });
      this.throttledRender();
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Update failed'));
    }
  }

  /**
   * Request data update
   */
  protected override requestUpdate(): void {
    this.collectResourceData();
  }

  /**
   * Destroy the component
   */
  public override destroy(): void {
    if (this.systemResourceService) {
      this.systemResourceService.removeAllListeners();
    }

    this.networkHistory = [];
    this.cpuHistory = [];
    this.memoryHistory = [];
    this.currentResources = null;

    super.destroy();
    releaseScreen();
  }
}