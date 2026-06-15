import { MonitoringConfigManager, defaultMonitoringConfig } from './monitoring';
import { MonitoringConfig } from '../types/monitoring';

describe('MonitoringConfigManager', () => {
  let configManager: MonitoringConfigManager;

  beforeEach(() => {
    configManager = new MonitoringConfigManager();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const config = configManager.getConfig();
      expect(config.refreshInterval).toBe(defaultMonitoringConfig.refreshInterval);
      expect(config.layout).toBe(defaultMonitoringConfig.layout);
      expect(config.theme).toBe(defaultMonitoringConfig.theme);
    });

    it('should merge user config with defaults', () => {
      const userConfig: Partial<MonitoringConfig> = {
        refreshInterval: 10000,
        layout: 'compact',
        theme: 'dark',
      };

      const customConfigManager = new MonitoringConfigManager(userConfig);
      const config = customConfigManager.getConfig();

      expect(config.refreshInterval).toBe(10000);
      expect(config.layout).toBe('compact');
      expect(config.theme).toBe('dark');
      expect(config.terminal).toEqual(defaultMonitoringConfig.terminal);
    });
  });

  describe('configuration updates', () => {
    it('should update refresh interval', () => {
      configManager.setRefreshInterval(3000);
      expect(configManager.getRefreshInterval()).toBe(3000);
    });

    it('should throw error for invalid refresh interval', () => {
      expect(() => {
        configManager.setRefreshInterval(500);
      }).toThrow('Refresh interval must be at least 1000ms');
    });

    it('should update layout', () => {
      configManager.setLayout('compact');
      expect(configManager.getLayout()).toBe('compact');
    });

    it('should update theme', () => {
      configManager.setTheme('dark');
      expect(configManager.getTheme()).toBe('dark');
    });

    it('should update component config', () => {
      configManager.updateComponentConfig('stream-metrics', {
        showBitrate: false,
        refreshInterval: 2000,
      });

      const componentConfig = configManager.getComponentConfig('stream-metrics');
      expect(componentConfig?.config['showBitrate']).toBe(false);
      expect(componentConfig?.config['refreshInterval']).toBe(2000);
    });
  });

  describe('configuration validation', () => {
    it('should validate valid configuration', () => {
      const validation = configManager.validateConfig();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid refresh interval', () => {
      configManager.updateConfig({ refreshInterval: 500 });
      const validation = configManager.validateConfig();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Refresh interval must be at least 1000ms');
    });

    it('should detect invalid terminal dimensions', () => {
      configManager.updateConfig({
        terminal: {
          minWidth: 50,
          minHeight: 15,
          colorSupport: true,
          mouseSupport: true,
          unicodeSupport: true,
        },
      });

      const validation = configManager.validateConfig();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Minimum terminal width must be at least 60 characters');
      expect(validation.errors).toContain('Minimum terminal height must be at least 20 lines');
    });

    it('should detect invalid performance config', () => {
      configManager.updateConfig({
        performance: {
          maxMemoryUsage: 30 * 1024 * 1024, // 30MB - too low
          maxCpuUsage: 0, // Invalid
          renderThrottleMs: 10, // Too low
          dataBufferSize: 1000,
        },
      });

      const validation = configManager.validateConfig();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Maximum memory usage must be at least 50MB');
      expect(validation.errors).toContain('Maximum CPU usage must be between 1% and 100%');
      expect(validation.errors).toContain('Render throttle must be at least 16ms (~60fps)');
    });

    it('should detect empty components array', () => {
      configManager.updateConfig({ components: [] });
      const validation = configManager.validateConfig();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('At least one component must be configured');
    });

    it('should detect invalid component configuration', () => {
      configManager.updateConfig({
        components: [
          {
            type: '',
            position: { x: -1, y: -1, width: 0, height: 0 },
            size: { minWidth: 0, minHeight: 0 },
            config: {},
            visible: true,
            priority: 0,
          },
        ],
      });

      const validation = configManager.validateConfig();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Component type is required');
      expect(validation.errors).toContain('Component  position must be non-negative');
      expect(validation.errors).toContain('Component  size must be positive');
      expect(validation.errors).toContain('Component  minimum size must be positive');
      expect(validation.errors).toContain('Component  priority must be between 1 and 10');
    });
  });

  describe('getters', () => {
    it('should get terminal config', () => {
      const terminalConfig = configManager.getTerminalConfig();
      expect(terminalConfig).toEqual(defaultMonitoringConfig.terminal);
    });

    it('should get performance config', () => {
      const performanceConfig = configManager.getPerformanceConfig();
      expect(performanceConfig).toEqual(defaultMonitoringConfig.performance);
    });

    it('should get component config by type', () => {
      const streamMetricsConfig = configManager.getComponentConfig('stream-metrics');
      expect(streamMetricsConfig).toBeDefined();
      expect(streamMetricsConfig?.type).toBe('stream-metrics');
    });

    it('should return undefined for non-existent component type', () => {
      const unknownConfig = configManager.getComponentConfig('unknown');
      expect(unknownConfig).toBeUndefined();
    });
  });

  describe('environment variable loading', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should load configuration from environment variables', () => {
      process.env['POLYV_MONITOR_REFRESH_INTERVAL'] = '8000';
      process.env['POLYV_MONITOR_LAYOUT'] = 'compact';
      process.env['POLYV_MONITOR_THEME'] = 'dark';
      process.env['POLYV_MONITOR_COLOR_SUPPORT'] = 'false';
      process.env['POLYV_MONITOR_MAX_MEMORY'] = '200';
      process.env['POLYV_MONITOR_MAX_CPU'] = '10';

      const envConfigManager = MonitoringConfigManager.fromEnvironment();
      const config = envConfigManager.getConfig();

      expect(config.refreshInterval).toBe(8000);
      expect(config.layout).toBe('compact');
      expect(config.theme).toBe('dark');
      expect(config.terminal?.colorSupport).toBe(false);
      expect(config.performance?.maxMemoryUsage).toBe(200 * 1024 * 1024);
      expect(config.performance?.maxCpuUsage).toBe(10);
    });
  });

  describe('file operations', () => {
    const fs = require('fs');
    const testConfigPath = '/tmp/test-monitoring-config.json';

    afterEach(() => {
      if (fs.existsSync(testConfigPath)) {
        fs.unlinkSync(testConfigPath);
      }
    });

    it('should save configuration to file', () => {
      configManager.setRefreshInterval(7000);
      configManager.setLayout('single');

      configManager.saveToFile(testConfigPath);

      expect(fs.existsSync(testConfigPath)).toBe(true);

      const savedConfig = JSON.parse(fs.readFileSync(testConfigPath, 'utf8'));
      expect(savedConfig.refreshInterval).toBe(7000);
      expect(savedConfig.layout).toBe('single');
    });

    it('should load configuration from file', () => {
      const testConfig = {
        refreshInterval: 6000,
        layout: 'compact',
        theme: 'dark',
        terminal: defaultMonitoringConfig.terminal,
        performance: defaultMonitoringConfig.performance,
        components: defaultMonitoringConfig.components,
      };

      fs.writeFileSync(testConfigPath, JSON.stringify(testConfig), 'utf8');

      const fileConfigManager = MonitoringConfigManager.fromFile(testConfigPath);
      const config = fileConfigManager.getConfig();

      expect(config.refreshInterval).toBe(6000);
      expect(config.layout).toBe('compact');
      expect(config.theme).toBe('dark');
    });

    it('should throw error when loading non-existent file', () => {
      expect(() => {
        MonitoringConfigManager.fromFile('/non/existent/path.json');
      }).toThrow();
    });

    it('should throw error when loading invalid JSON', () => {
      fs.writeFileSync(testConfigPath, 'invalid json', 'utf8');

      expect(() => {
        MonitoringConfigManager.fromFile(testConfigPath);
      }).toThrow();
    });
  });

  describe('config validation', () => {
    it('should validate component type is required', () => {
      const invalidConfig = {
        refreshInterval: 5000,
        layout: 'default' as const,
        theme: 'light' as const,
        terminal: {
          colorSupport: true,
          unicode: true,
          minWidth: 80,
          minHeight: 24,
          mouseSupport: true,
          unicodeSupport: true
        },
        performance: {
          maxMemoryUsage: 512 * 1024 * 1024,
          maxCpuUsage: 80,
          enableProfiling: false,
          renderThrottleMs: 16,
          dataBufferSize: 1000
        },
        components: [
          {
            // Missing type property
            position: { x: 0, y: 0, width: 50, height: 20 },
            size: { width: 50, height: 20, minWidth: 20, minHeight: 10 },
            config: {},
            visible: true,
            priority: 1
          } as any
        ]
      };

      const manager = new MonitoringConfigManager(invalidConfig);
      const validation = manager.validateConfig();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Component type is required');
    });

    it('should validate component position is non-negative', () => {
      const invalidConfig = {
        refreshInterval: 5000,
        layout: 'default' as const,
        theme: 'light' as const,
        terminal: {
          colorSupport: true,
          unicode: true,
          minWidth: 80,
          minHeight: 24,
          mouseSupport: true,
          unicodeSupport: true
        },
        performance: {
          maxMemoryUsage: 512 * 1024 * 1024,
          maxCpuUsage: 80,
          enableProfiling: false,
          renderThrottleMs: 16,
          dataBufferSize: 1000
        },
        components: [
          {
            type: 'stream-status' as const,
            position: { x: -1, y: 0, width: 50, height: 20 }, // Invalid negative position
            size: { width: 50, height: 20, minWidth: 20, minHeight: 10 },
            config: {},
            visible: true,
            priority: 1
          }
        ]
      };

      const manager = new MonitoringConfigManager(invalidConfig);
      const validation = manager.validateConfig();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Component stream-status position must be non-negative');
    });
  });
});