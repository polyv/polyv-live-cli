import { MonitoringConfig, TerminalConfig, PerformanceConfig } from '../types/monitoring';

export const defaultMonitoringConfig: MonitoringConfig = {
  version: '1.0.0',
  refreshInterval: 5000, // 5 seconds
  layout: 'default',
  theme: 'default',
  terminal: {
    minWidth: 80,
    minHeight: 24,
    colorSupport: true,
    mouseSupport: true,
    unicodeSupport: true,
  },
  performance: {
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    maxCpuUsage: 5, // 5%
    renderThrottleMs: 16, // ~60fps
    dataBufferSize: 1000, // Keep last 1000 data points
  },
  components: [
    {
      type: 'stream-metrics',
      position: { x: 0, y: 0, width: 8, height: 6 },
      size: { minWidth: 40, minHeight: 15 },
      config: {
        showBitrate: true,
        showFps: true,
        showViewers: true,
        showUptime: true,
        refreshInterval: 5000,
      },
      visible: true,
      priority: 1,
    },
    {
      type: 'channel-status',
      position: { x: 8, y: 0, width: 4, height: 6 },
      size: { minWidth: 30, minHeight: 15 },
      config: {
        showInactive: true,
        maxChannels: 20,
        sortBy: 'activity',
        refreshInterval: 10000,
      },
      visible: true,
      priority: 2,
    },
    {
      type: 'system-resources',
      position: { x: 0, y: 6, width: 6, height: 6 },
      size: { minWidth: 30, minHeight: 15 },
      config: {
        showCpu: true,
        showMemory: true,
        showNetwork: true,
        showDisk: false,
        refreshInterval: 2000,
      },
      visible: true,
      priority: 3,
    },
    {
      type: 'activity-log',
      position: { x: 6, y: 6, width: 6, height: 6 },
      size: { minWidth: 30, minHeight: 15 },
      config: {
        maxLines: 100,
        showTimestamp: true,
        logLevel: 'info',
        autoScroll: true,
      },
      visible: true,
      priority: 4,
    },
  ],
  customThemes: [],
  customLayouts: [],
  preferences: {
    autoSave: true,
    confirmActions: true,
    showHelp: true,
    keyboardShortcuts: true,
    animationSpeed: 'normal',
    soundEnabled: true,
    compactMode: false,
    showTimestamps: true,
    maxHistoryItems: 1000,
  },
};

export class MonitoringConfigManager {
  private config: MonitoringConfig;

  constructor(config?: Partial<MonitoringConfig>) {
    this.config = this.mergeConfig(defaultMonitoringConfig, config);
  }

  private mergeConfig(
    defaultConfig: MonitoringConfig,
    userConfig?: Partial<MonitoringConfig>
  ): MonitoringConfig {
    if (!userConfig) {
      return { ...defaultConfig };
    }

    return {
      ...defaultConfig,
      ...userConfig,
      terminal: {
        ...defaultConfig.terminal,
        ...userConfig.terminal,
      } as TerminalConfig,
      performance: {
        ...defaultConfig.performance,
        ...userConfig.performance,
      } as PerformanceConfig,
      components: userConfig.components || defaultConfig.components,
    };
  }

  public getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<MonitoringConfig>): void {
    this.config = this.mergeConfig(this.config, updates);
  }

  public getRefreshInterval(): number {
    return this.config.refreshInterval;
  }

  public setRefreshInterval(interval: number): void {
    if (interval < 1000) {
      throw new Error('Refresh interval must be at least 1000ms');
    }
    this.config.refreshInterval = interval;
  }

  public getLayout(): string {
    return this.config.layout;
  }

  public setLayout(layout: string): void {
    this.config.layout = layout;
  }

  public getTheme(): string {
    return this.config.theme;
  }

  public setTheme(theme: string): void {
    this.config.theme = theme;
  }

  public getTerminalConfig(): TerminalConfig {
    return { ...this.config.terminal } as TerminalConfig;
  }

  public getPerformanceConfig(): PerformanceConfig {
    return { ...this.config.performance } as PerformanceConfig;
  }

  public getComponentConfig(type: string) {
    return this.config.components.find(c => c.type === type);
  }

  public updateComponentConfig(type: string, updates: Partial<any>): void {
    const component = this.config.components.find(c => c.type === type);
    if (component) {
      component.config = { ...component.config, ...updates };
    }
  }

  public validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate refresh interval
    if (this.config.refreshInterval < 1000) {
      errors.push('Refresh interval must be at least 1000ms');
    }

    // Validate terminal config
    if (this.config.terminal && this.config.terminal.minWidth < 60) {
      errors.push('Minimum terminal width must be at least 60 characters');
    }

    if (this.config.terminal && this.config.terminal.minHeight < 20) {
      errors.push('Minimum terminal height must be at least 20 lines');
    }

    // Validate performance config
    if (this.config.performance && this.config.performance.maxMemoryUsage < 50 * 1024 * 1024) {
      errors.push('Maximum memory usage must be at least 50MB');
    }

    if (this.config.performance && (this.config.performance.maxCpuUsage < 1 || this.config.performance.maxCpuUsage > 100)) {
      errors.push('Maximum CPU usage must be between 1% and 100%');
    }

    if (this.config.performance && this.config.performance.renderThrottleMs < 16) {
      errors.push('Render throttle must be at least 16ms (~60fps)');
    }

    // Validate components
    if (this.config.components.length === 0) {
      errors.push('At least one component must be configured');
    }

    for (const component of this.config.components) {
      if (!component.type) {
        errors.push('Component type is required');
      }

      if (component.position.x < 0 || component.position.y < 0) {
        errors.push(`Component ${component.type} position must be non-negative`);
      }

      if (component.position.width <= 0 || component.position.height <= 0) {
        errors.push(`Component ${component.type} size must be positive`);
      }

      if (component.size.minWidth <= 0 || component.size.minHeight <= 0) {
        errors.push(`Component ${component.type} minimum size must be positive`);
      }

      if (component.priority < 1 || component.priority > 10) {
        errors.push(`Component ${component.type} priority must be between 1 and 10`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  public static fromEnvironment(): MonitoringConfigManager {
    const config: Partial<MonitoringConfig> = {};

    // Read from environment variables
    const refreshInterval = process.env['POLYV_MONITOR_REFRESH_INTERVAL'];
    if (refreshInterval) {
      config.refreshInterval = parseInt(refreshInterval, 10);
    }

    const layout = process.env['POLYV_MONITOR_LAYOUT'];
    if (layout) {
      config.layout = layout;
    }

    const theme = process.env['POLYV_MONITOR_THEME'];
    if (theme) {
      config.theme = theme;
    }

    // Terminal configuration
    const terminalConfig: Partial<TerminalConfig> = {};
    
    const colorSupport = process.env['POLYV_MONITOR_COLOR_SUPPORT'];
    if (colorSupport) {
      terminalConfig.colorSupport = colorSupport.toLowerCase() === 'true';
    }

    const mouseSupport = process.env['POLYV_MONITOR_MOUSE_SUPPORT'];
    if (mouseSupport) {
      terminalConfig.mouseSupport = mouseSupport.toLowerCase() === 'true';
    }

    const unicodeSupport = process.env['POLYV_MONITOR_UNICODE_SUPPORT'];
    if (unicodeSupport) {
      terminalConfig.unicodeSupport = unicodeSupport.toLowerCase() === 'true';
    }

    if (Object.keys(terminalConfig).length > 0) {
      config.terminal = terminalConfig as TerminalConfig;
    }

    // Performance configuration
    const performanceConfig: Partial<PerformanceConfig> = {};
    
    const maxMemory = process.env['POLYV_MONITOR_MAX_MEMORY'];
    if (maxMemory) {
      performanceConfig.maxMemoryUsage = parseInt(maxMemory, 10) * 1024 * 1024; // MB to bytes
    }

    const maxCpu = process.env['POLYV_MONITOR_MAX_CPU'];
    if (maxCpu) {
      performanceConfig.maxCpuUsage = parseInt(maxCpu, 10);
    }

    const renderThrottle = process.env['POLYV_MONITOR_RENDER_THROTTLE'];
    if (renderThrottle) {
      performanceConfig.renderThrottleMs = parseInt(renderThrottle, 10);
    }

    const dataBufferSize = process.env['POLYV_MONITOR_DATA_BUFFER_SIZE'];
    if (dataBufferSize) {
      performanceConfig.dataBufferSize = parseInt(dataBufferSize, 10);
    }

    if (Object.keys(performanceConfig).length > 0) {
      config.performance = performanceConfig as PerformanceConfig;
    }

    return new MonitoringConfigManager(config);
  }

  public static fromFile(filePath: string): MonitoringConfigManager {
    try {
      const fs = require('fs');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const config = JSON.parse(fileContent);
      return new MonitoringConfigManager(config);
    } catch (error) {
      throw new Error(`Failed to load monitoring config from ${filePath}: ${error}`);
    }
  }

  public saveToFile(filePath: string): void {
    try {
      const fs = require('fs');
      const configJson = JSON.stringify(this.config, null, 2);
      fs.writeFileSync(filePath, configJson, 'utf8');
    } catch (error) {
      throw new Error(`Failed to save monitoring config to ${filePath}: ${error}`);
    }
  }
}