import { BaseHandler } from './base.handler';
import { MonitoringDashboard } from '../components/monitoring-dashboard';
import { MonitoringConfigManager } from '../config/monitoring';
import { MonitorOptions } from '../commands/monitor.commands';
import { formatTable, formatJSON } from '../utils/formatter';

export class MonitorHandler extends BaseHandler {
  private dashboard?: MonitoringDashboard;
  private configManager: MonitoringConfigManager;

  constructor() {
    super();
    this.configManager = this.loadConfiguration();
  }

  private loadConfiguration(): MonitoringConfigManager {
    // Try to load from various sources in order of priority
    try {
      // 1. From environment variables
      return MonitoringConfigManager.fromEnvironment();
    } catch (envError) {
      try {
        // 2. From config file in current directory
        return MonitoringConfigManager.fromFile('./polyv-monitor.json');
      } catch (fileError) {
        try {
          // 3. From global config directory
          const os = require('os');
          const path = require('path');
          const globalConfigPath = path.join(os.homedir(), '.polyv', 'monitor.json');
          return MonitoringConfigManager.fromFile(globalConfigPath);
        } catch (globalError) {
          // 4. Use default configuration
          return new MonitoringConfigManager();
        }
      }
    }
  }

  public async startMonitoring(options: MonitorOptions): Promise<void> {
    try {
      // Validate terminal compatibility first
      await this.checkTerminalCompatibility();

      // Update configuration with command-line options
      this.updateConfigFromOptions(options);

      // Validate configuration
      const validation = this.configManager.validateConfig();
      if (!validation.valid) {
        throw new Error(`Configuration validation failed:\n${validation.errors.join('\n')}`);
      }

      // Create and start dashboard
      this.dashboard = new MonitoringDashboard(this.configManager.getConfig());

      // Handle debug mode
      if (options.debug) {
        this.enableDebugMode();
      }

      console.log('Starting PolyV Live Monitoring Dashboard...');
      console.log(`Layout: ${this.configManager.getLayout()}`);
      console.log(`Refresh interval: ${this.configManager.getRefreshInterval()}ms`);
      console.log(`Theme: ${this.configManager.getTheme()}`);
      console.log('Press ? or h for help, q or Ctrl+C to exit\n');

      await this.dashboard.start();

    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  public async showStatus(options: Pick<MonitorOptions, 'output'>): Promise<void> {
    try {
      const status = {
        isRunning: !!this.dashboard,
        configuration: {
          layout: this.configManager.getLayout(),
          theme: this.configManager.getTheme(),
          refreshInterval: this.configManager.getRefreshInterval(),
        },
        terminal: this.getTerminalInfo(),
        performance: this.getPerformanceInfo(),
      };

      if (this.dashboard) {
        const dashboardStatus = this.dashboard.getStatus();
        Object.assign(status, {
          dashboard: dashboardStatus,
        });
      }

      if (options.output === 'json') {
        console.log(formatJSON(status));
      } else {
        this.displayStatusTable(status);
      }

    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Failed to get status'));
    }
  }

  public async showConfig(options: Pick<MonitorOptions, 'output'>): Promise<void> {
    try {
      const config = this.configManager.getConfig();

      if (options.output === 'json') {
        console.log(formatJSON(config));
      } else {
        this.displayConfigTable(config);
      }

    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Failed to show config'));
    }
  }

  public async listLayouts(options: Pick<MonitorOptions, 'output'>): Promise<void> {
    try {
      const layouts = [
        {
          name: 'default',
          description: 'Full-featured layout with all panels',
          minSize: '120x30',
          components: 4,
        },
        {
          name: 'compact',
          description: 'Compact layout for smaller terminals',
          minSize: '80x24',
          components: 2,
        },
        {
          name: 'single',
          description: 'Single panel layout for focused monitoring',
          minSize: '60x20',
          components: 1,
        },
      ];

      if (options.output === 'json') {
        console.log(formatJSON(layouts));
      } else {
        const table = formatTable({
          headers: ['Name', 'Description', 'Min Size', 'Components'],
          data: layouts.map(layout => [
            layout.name,
            layout.description,
            layout.minSize,
            layout.components.toString(),
          ]),
        });
        console.log(table);
      }

    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Failed to list layouts'));
    }
  }

  public async listThemes(options: Pick<MonitorOptions, 'output'>): Promise<void> {
    try {
      const themes = [
        {
          name: 'default',
          description: 'Default light theme with blue accents',
          colors: 'Blue/White/Black',
        },
        {
          name: 'dark',
          description: 'Dark theme with cyan accents',
          colors: 'Cyan/White/Black',
        },
      ];

      if (options.output === 'json') {
        console.log(formatJSON(themes));
      } else {
        const table = formatTable({
          headers: ['Name', 'Description', 'Colors'],
          data: themes.map(theme => [
            theme.name,
            theme.description,
            theme.colors,
          ]),
        });
        console.log(table);
      }

    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Failed to list themes'));
    }
  }

  public async testCompatibility(options: Pick<MonitorOptions, 'output'>): Promise<void> {
    try {
      const results = await this.runCompatibilityTests();

      if (options.output === 'json') {
        console.log(formatJSON(results));
      } else {
        this.displayCompatibilityResults(results);
      }

    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Failed to test compatibility'));
    }
  }

  public async exportConfig(filepath: string): Promise<void> {
    try {
      this.configManager.saveToFile(filepath);
      console.log(`Configuration exported to ${filepath}`);

    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Failed to export config'));
    }
  }

  public async importConfig(filepath: string): Promise<void> {
    try {
      this.configManager = MonitoringConfigManager.fromFile(filepath);
      
      const validation = this.configManager.validateConfig();
      if (!validation.valid) {
        throw new Error(`Invalid configuration:\n${validation.errors.join('\n')}`);
      }

      console.log(`Configuration imported from ${filepath}`);

    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Failed to import config'));
    }
  }

  private updateConfigFromOptions(options: MonitorOptions): void {
    const updates: any = {};

    if (options.refresh) {
      const refreshMs = parseInt(options.refresh) * 1000;
      if (isNaN(refreshMs) || refreshMs < 1000) {
        throw new Error('Refresh interval must be a number >= 1 second');
      }
      updates.refreshInterval = refreshMs;
    }

    if (options.layout) {
      updates.layout = options.layout;
    }

    if (options.theme) {
      updates.theme = options.theme;
    }

    if (options.config) {
      // Load configuration from file
      try {
        this.configManager = MonitoringConfigManager.fromFile(options.config);
      } catch (error) {
        throw new Error(`Failed to load config from ${options.config}: ${error}`);
      }
    }

    if (Object.keys(updates).length > 0) {
      this.configManager.updateConfig(updates);
    }
  }

  private async checkTerminalCompatibility(): Promise<void> {
    const terminalInfo = this.getTerminalInfo();
    const terminalConfig = this.configManager.getTerminalConfig();

    // Check for very small or undetected terminal sizes (likely CI/CD or non-interactive)
    if (terminalInfo.width <= 1 || terminalInfo.height <= 1) {
      throw new Error(
        `Terminal size could not be detected or is too small (${terminalInfo.width}x${terminalInfo.height}). ` +
        `This usually happens in non-interactive environments. ` +
        `Please run this command in a proper terminal with at least ${terminalConfig.minWidth}x${terminalConfig.minHeight} size.`
      );
    }

    if (terminalInfo.width < terminalConfig.minWidth || 
        terminalInfo.height < terminalConfig.minHeight) {
      throw new Error(
        `Terminal size too small. Required: ${terminalConfig.minWidth}x${terminalConfig.minHeight}, ` +
        `Current: ${terminalInfo.width}x${terminalInfo.height}. ` +
        `Please resize your terminal window or try using a smaller layout with --layout compact or --layout single.`
      );
    }

    // Check for basic blessed compatibility
    try {
      const blessed = require('blessed');
      const testScreen = blessed.screen({
        smartCSR: true,
        title: 'Compatibility Test',
      });
      testScreen.destroy();
    } catch (error) {
      throw new Error('Terminal is not compatible with blessed UI library');
    }
  }

  private getTerminalInfo() {
    // Check for environment variable overrides first (useful for testing/CI)
    const envWidth = process.env['POLYV_TERMINAL_WIDTH'];
    const envHeight = process.env['POLYV_TERMINAL_HEIGHT'];
    
    // Get terminal dimensions with proper fallbacks
    let width = process.stdout.columns && process.stdout.columns > 0 ? process.stdout.columns : 120;
    let height = process.stdout.rows && process.stdout.rows > 0 ? process.stdout.rows : 30;
    
    // Override with environment variables if provided
    if (envWidth && parseInt(envWidth) > 0) {
      width = parseInt(envWidth);
    }
    if (envHeight && parseInt(envHeight) > 0) {
      height = parseInt(envHeight);
    }
    
    return {
      width,
      height,
      colorDepth: this.getColorDepth(),
      platform: process.platform,
      term: process.env['TERM'] || 'unknown',
    };
  }

  private getColorDepth(): number {
    const colorterm = process.env['COLORTERM'];
    const term = process.env['TERM'] || '';
    
    if (colorterm === 'truecolor' || colorterm === '24bit') {
      return 24;
    } else if (term.includes('256') || colorterm === '256') {
      return 8;
    } else if (term.includes('color')) {
      return 4;
    }
    
    return 1;
  }

  private getPerformanceInfo() {
    const memUsage = process.memoryUsage();
    return {
      memoryUsage: {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      },
      cpuUsage: process.cpuUsage(),
      uptime: Math.round(process.uptime()),
    };
  }

  private enableDebugMode(): void {
    process.env['POLYV_DEBUG'] = 'true';
    console.log('Debug mode enabled');
  }

  private displayStatusTable(status: any): void {
    console.log('PolyV Monitoring Dashboard Status\n');
    
    const basicInfo = [
      ['Status', status.isRunning ? 'Running' : 'Stopped'],
      ['Layout', status.configuration.layout],
      ['Theme', status.configuration.theme],
      ['Refresh Interval', `${status.configuration.refreshInterval}ms`],
      ['Terminal Size', `${status.terminal.width}x${status.terminal.height}`],
      ['Color Depth', `${status.terminal.colorDepth}-bit`],
      ['Platform', status.terminal.platform],
    ];

    if (status.dashboard) {
      basicInfo.push(
        ['Components', status.dashboard.components.toString()],
        ['Uptime', `${Math.round(status.dashboard.uptime / 1000)}s`]
      );
    }

    const table = formatTable({
      headers: ['Property', 'Value'],
      data: basicInfo,
    });
    console.log(table);
  }

  private displayConfigTable(config: any): void {
    console.log('PolyV Monitoring Configuration\n');
    
    const configInfo = [
      ['Refresh Interval', `${config.refreshInterval}ms`],
      ['Layout', config.layout],
      ['Theme', config.theme],
      ['Min Terminal Width', config.terminal.minWidth.toString()],
      ['Min Terminal Height', config.terminal.minHeight.toString()],
      ['Color Support', config.terminal.colorSupport ? 'Yes' : 'No'],
      ['Mouse Support', config.terminal.mouseSupport ? 'Yes' : 'No'],
      ['Unicode Support', config.terminal.unicodeSupport ? 'Yes' : 'No'],
      ['Max Memory', `${Math.round(config.performance.maxMemoryUsage / 1024 / 1024)}MB`],
      ['Max CPU', `${config.performance.maxCpuUsage}%`],
      ['Render Throttle', `${config.performance.renderThrottleMs}ms`],
      ['Components', config.components.length.toString()],
    ];

    const table = formatTable({
      headers: ['Setting', 'Value'],
      data: configInfo,
    });
    console.log(table);
  }

  private async runCompatibilityTests() {
    const results = {
      overall: 'pass',
      tests: [] as Array<{ name: string; status: 'pass' | 'fail' | 'warn'; message: string }>,
    };

    // Test terminal size
    const terminalInfo = this.getTerminalInfo();
    const terminalConfig = this.configManager.getTerminalConfig();
    
    if (terminalInfo.width >= terminalConfig.minWidth && terminalInfo.height >= terminalConfig.minHeight) {
      results.tests.push({
        name: 'Terminal Size',
        status: 'pass',
        message: `${terminalInfo.width}x${terminalInfo.height} (required: ${terminalConfig.minWidth}x${terminalConfig.minHeight})`,
      });
    } else {
      results.tests.push({
        name: 'Terminal Size',
        status: 'fail',
        message: `${terminalInfo.width}x${terminalInfo.height} (required: ${terminalConfig.minWidth}x${terminalConfig.minHeight})`,
      });
      results.overall = 'fail';
    }

    // Test color support
    if (terminalInfo.colorDepth >= 8) {
      results.tests.push({
        name: 'Color Support',
        status: 'pass',
        message: `${terminalInfo.colorDepth}-bit colors`,
      });
    } else {
      results.tests.push({
        name: 'Color Support',
        status: 'warn',
        message: `${terminalInfo.colorDepth}-bit colors (8-bit recommended)`,
      });
    }

    // Test blessed compatibility
    try {
      const blessed = require('blessed');
      const testScreen = blessed.screen({ smartCSR: true });
      testScreen.destroy();
      results.tests.push({
        name: 'Blessed Compatibility',
        status: 'pass',
        message: 'Terminal is compatible with blessed library',
      });
    } catch (error) {
      results.tests.push({
        name: 'Blessed Compatibility',
        status: 'fail',
        message: 'Terminal is not compatible with blessed library',
      });
      results.overall = 'fail';
    }

    // Test memory availability
    const memUsage = process.memoryUsage();
    const availableMemory = memUsage.rss / 1024 / 1024; // MB
    const requiredMemory = this.configManager.getPerformanceConfig().maxMemoryUsage / 1024 / 1024; // MB
    
    if (availableMemory < requiredMemory) {
      results.tests.push({
        name: 'Memory Availability',
        status: 'pass',
        message: `${Math.round(availableMemory)}MB used (${Math.round(requiredMemory)}MB limit)`,
      });
    } else {
      results.tests.push({
        name: 'Memory Availability',
        status: 'warn',
        message: `${Math.round(availableMemory)}MB used (${Math.round(requiredMemory)}MB limit)`,
      });
    }

    return results;
  }

  private displayCompatibilityResults(results: any): void {
    console.log(`Compatibility Test Results: ${results.overall.toUpperCase()}\n`);
    
    const table = formatTable({
      headers: ['Test', 'Status', 'Details'],
      data: results.tests.map((test: any) => [
        test.name,
        test.status.toUpperCase(),
        test.message,
      ]),
    });
    console.log(table);

    if (results.overall === 'fail') {
      console.log('\nSome compatibility tests failed. The monitoring dashboard may not work properly.');
    } else if (results.tests.some((test: any) => test.status === 'warn')) {
      console.log('\nSome tests have warnings. The monitoring dashboard should work but may have reduced functionality.');
    } else {
      console.log('\nAll tests passed! The monitoring dashboard should work properly.');
    }
  }

  private handleError(error: Error): void {
    if (this.dashboard) {
      this.dashboard.stop();
    }
    this.displayError(error.message, error);
  }
}