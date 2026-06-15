/**
 * @fileoverview Unit tests for MonitorHandler
 */

import { MonitorHandler } from './monitor.handler';
import { MonitoringDashboard } from '../components/monitoring-dashboard';
import { MonitoringConfigManager } from '../config/monitoring';
import { MonitorOptions } from '../commands/monitor.commands';

// Mock blessed-contrib
jest.mock('blessed-contrib', () => ({
  grid: jest.fn(() => ({
    set: jest.fn(),
    screen: {
      render: jest.fn()
    }
  }))
}));

// Mock dependencies
jest.mock('../components/monitoring-dashboard');
jest.mock('../config/monitoring');
jest.mock('../utils/formatter', () => ({
  formatTable: jest.fn(() => 'mocked table'),
  formatJSON: jest.fn((data) => JSON.stringify(data, null, 2))
}));

// Mock blessed for compatibility tests
jest.mock('blessed', () => ({
  screen: jest.fn(() => ({
    destroy: jest.fn()
  }))
}));

// Mock os and path modules
jest.mock('os', () => ({
  homedir: jest.fn().mockReturnValue('/mock/home')
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/'))
}));

describe('MonitorHandler', () => {
  let monitorHandler: MonitorHandler;
  let mockConfigManager: jest.Mocked<MonitoringConfigManager>;
  let mockDashboard: jest.Mocked<MonitoringDashboard>;
  let mockHandleError: jest.SpyInstance;
  let originalConsoleLog: typeof console.log;
  let originalEnv: NodeJS.ProcessEnv;
  let originalColumns: number | undefined;
  let originalRows: number | undefined;

  beforeEach(() => {
    // Mock console.log to suppress output during tests
    originalConsoleLog = console.log;
    console.log = jest.fn();

    // Store original environment
    originalEnv = { ...process.env };

    // Store original values and redefine properties to avoid redefinition errors
    originalColumns = process.stdout.columns;
    originalRows = process.stdout.rows;
    
    // Delete existing properties first to avoid redefinition errors
    try {
      delete (process.stdout as any).columns;
      delete (process.stdout as any).rows;
    } catch (error) {
      // Ignore errors if properties cannot be deleted (they may be non-configurable)
    }
    
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock config manager
    mockConfigManager = {
      validateConfig: jest.fn().mockReturnValue({ valid: true, errors: [] }),
      getConfig: jest.fn().mockReturnValue({
        refreshInterval: 5000,
        layout: 'default',
        theme: 'default',
        terminal: {
          minWidth: 80,
          minHeight: 24,
          colorSupport: true,
          mouseSupport: true,
          unicodeSupport: true
        },
        performance: {
          maxMemoryUsage: 512 * 1024 * 1024, // 512MB
          maxCpuUsage: 80,
          renderThrottleMs: 16
        },
        components: []
      }),
      getLayout: jest.fn().mockReturnValue('default'),
      getTheme: jest.fn().mockReturnValue('default'),
      getRefreshInterval: jest.fn().mockReturnValue(5000),
      getTerminalConfig: jest.fn().mockReturnValue({
        minWidth: 80,
        minHeight: 24
      }),
      getPerformanceConfig: jest.fn().mockReturnValue({
        maxMemoryUsage: 512 * 1024 * 1024
      }),
      updateConfig: jest.fn(),
      saveToFile: jest.fn(),
      fromFile: jest.fn()
    } as any;

    // Mock MonitoringConfigManager static methods
    (MonitoringConfigManager.fromEnvironment as jest.Mock) = jest.fn().mockReturnValue(mockConfigManager);
    (MonitoringConfigManager.fromFile as jest.Mock) = jest.fn().mockReturnValue(mockConfigManager);
    (MonitoringConfigManager as any).mockImplementation(() => mockConfigManager);

    // Setup mock dashboard
    mockDashboard = {
      start: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn(),
      getStatus: jest.fn().mockReturnValue({
        components: 4,
        uptime: 60000
      })
    } as any;

    (MonitoringDashboard as jest.MockedClass<typeof MonitoringDashboard>).mockImplementation(() => mockDashboard);

    // Mock process properties
    if (!Object.prototype.hasOwnProperty.call(process.stdout, 'columns')) {
      Object.defineProperty(process.stdout, 'columns', { value: 120, configurable: true });
    }
    if (!Object.prototype.hasOwnProperty.call(process.stdout, 'rows')) {
      Object.defineProperty(process.stdout, 'rows', { value: 30, configurable: true });
    }

    monitorHandler = new MonitorHandler();
    
    // Mock the private methods
    mockHandleError = jest.spyOn(monitorHandler as any, 'handleError').mockImplementation(() => {});
    jest.spyOn(monitorHandler as any, 'checkTerminalCompatibility').mockResolvedValue(undefined);
  });

  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
    
    // Restore environment
    process.env = originalEnv;
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Restore process.stdout properties
    try {
      delete (process.stdout as any).columns;
      delete (process.stdout as any).rows;
      if (originalColumns !== undefined) {
        Object.defineProperty(process.stdout, 'columns', { value: originalColumns, configurable: true });
      }
      if (originalRows !== undefined) {
        Object.defineProperty(process.stdout, 'rows', { value: originalRows, configurable: true });
      }
    } catch (error) {
      // Ignore errors during cleanup
    }
    
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create MonitorHandler instance', () => {
      expect(monitorHandler).toBeInstanceOf(MonitorHandler);
    });

    it('should load configuration from environment', () => {
      expect(MonitoringConfigManager.fromEnvironment).toHaveBeenCalled();
    });

    it('should fallback to file configuration when environment fails', () => {
      (MonitoringConfigManager.fromEnvironment as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Environment config failed');
      });
      
      new MonitorHandler();
      expect(MonitoringConfigManager.fromFile).toHaveBeenCalled();
    });

    it('should use default configuration when all sources fail', () => {
      (MonitoringConfigManager.fromEnvironment as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Environment config failed');
      });
      (MonitoringConfigManager.fromFile as jest.Mock).mockImplementationOnce(() => {
        throw new Error('File config failed');
      });
      
      const handler = new MonitorHandler();
      expect(handler).toBeInstanceOf(MonitorHandler);
    });
  });

  describe('startMonitoring', () => {
    it('should start monitoring with valid options', async () => {
      const options: MonitorOptions = {
        refresh: '10',
        layout: 'compact',
        theme: 'dark',
        verbose: true
      };

      await monitorHandler.startMonitoring(options);

      expect(mockConfigManager.validateConfig).toHaveBeenCalled();
      expect(MonitoringDashboard).toHaveBeenCalledWith(mockConfigManager.getConfig());
      expect(mockDashboard.start).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Starting PolyV Live Monitoring Dashboard...');
    });

    it('should handle configuration validation errors', async () => {
      mockConfigManager.validateConfig.mockReturnValue({
        valid: false,
        errors: ['Invalid layout', 'Invalid theme']
      });

      const options: MonitorOptions = {};
      
      await expect(monitorHandler.startMonitoring(options)).resolves.toBeUndefined();
      expect(mockDashboard.start).not.toHaveBeenCalled();
    });

    it('should enable debug mode when debug option is true', async () => {
      const options: MonitorOptions = { debug: true };

      await monitorHandler.startMonitoring(options);

      expect(process.env['POLYV_DEBUG']).toBe('true');
      expect(console.log).toHaveBeenCalledWith('Debug mode enabled');
    });

    it('should handle terminal compatibility check failure', async () => {
      // Mock checkTerminalCompatibility to throw an error
      jest.spyOn(monitorHandler as any, 'checkTerminalCompatibility').mockRejectedValue(new Error('Terminal too small'));

      await expect(monitorHandler.startMonitoring({})).resolves.toBeUndefined();
      expect(mockDashboard.start).not.toHaveBeenCalled();
      expect(mockHandleError).toHaveBeenCalled();
    });
  });

  describe('showStatus', () => {
    it('should show status in table format', async () => {
      await monitorHandler.showStatus({ output: 'table' });

      expect(console.log).toHaveBeenCalledWith('PolyV Monitoring Dashboard Status\n');
      expect(console.log).toHaveBeenCalledWith('mocked table');
    });

    it('should show status in JSON format', async () => {
      await monitorHandler.showStatus({ output: 'json' });

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('isRunning'));
    });

    it('should include dashboard status when dashboard is running', async () => {
      // Start monitoring first to create dashboard
      await monitorHandler.startMonitoring({});
      
      await monitorHandler.showStatus({ output: 'json' });

      expect(mockDashboard.getStatus).toHaveBeenCalled();
    });
  });

  describe('showConfig', () => {
    it('should show config in table format', async () => {
      await monitorHandler.showConfig({ output: 'table' });

      expect(mockConfigManager.getConfig).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('PolyV Monitoring Configuration\n');
    });

    it('should show config in JSON format', async () => {
      await monitorHandler.showConfig({ output: 'json' });

      expect(mockConfigManager.getConfig).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('refreshInterval'));
    });

    it('should handle config retrieval errors', async () => {
      mockConfigManager.getConfig.mockImplementation(() => {
        throw new Error('Config error');
      });

      await monitorHandler.showConfig({ output: 'table' });

      expect(mockHandleError).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Config error'
      }));
    });

    it('should handle non-Error exceptions in config', async () => {
      mockConfigManager.getConfig.mockImplementation(() => {
        throw 'String error';
      });

      await monitorHandler.showConfig({ output: 'table' });

      expect(mockHandleError).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Failed to show config'
      }));
    });
  });

  describe('listLayouts', () => {
    it('should list layouts in table format', async () => {
      await monitorHandler.listLayouts({ output: 'table' });

      expect(console.log).toHaveBeenCalledWith('mocked table');
    });

    it('should list layouts in JSON format', async () => {
      await monitorHandler.listLayouts({ output: 'json' });

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('default'));
    });

    it('should handle layout listing errors', async () => {
      // Mock console.log to throw an error
      (console.log as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Console error');
      });

      await monitorHandler.listLayouts({ output: 'table' });

      expect(mockHandleError).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Console error'
      }));
    });

    it('should handle non-Error exceptions in layout listing', async () => {
      (console.log as jest.Mock).mockImplementationOnce(() => {
        throw 'String error';
      });

      await monitorHandler.listLayouts({ output: 'json' });

      expect(mockHandleError).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Failed to list layouts'
      }));
    });
  });


  describe('listThemes', () => {
    it('should list themes in table format', async () => {
      await monitorHandler.listThemes({ output: 'table' });

      expect(console.log).toHaveBeenCalledWith('mocked table');
    });

    it('should list themes in JSON format', async () => {
      await monitorHandler.listThemes({ output: 'json' });

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('default'));
    });

    it('should handle theme listing errors', async () => {
      (console.log as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Theme error');
      });

      await monitorHandler.listThemes({ output: 'table' });

      expect(mockHandleError).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Theme error'
      }));
    });

    it('should handle non-Error exceptions in theme listing', async () => {
      (console.log as jest.Mock).mockImplementationOnce(() => {
        throw 'String error';
      });

      await monitorHandler.listThemes({ output: 'json' });

      expect(mockHandleError).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Failed to list themes'
      }));
    });
  });

  describe('testCompatibility', () => {
    it('should run compatibility tests and show results in table format', async () => {
      await monitorHandler.testCompatibility({ output: 'table' });

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Compatibility Test Results'));
    });

    it('should run compatibility tests and show results in JSON format', async () => {
      await monitorHandler.testCompatibility({ output: 'json' });

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('overall'));
    });

    it('should handle compatibility test errors', async () => {
      (console.log as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Compatibility test error');
      });

      await monitorHandler.testCompatibility({ output: 'table' });

      expect(mockHandleError).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Compatibility test error'
      }));
    });

    it('should handle non-Error exceptions in compatibility tests', async () => {
      (console.log as jest.Mock).mockImplementationOnce(() => {
        throw 'String error';
      });

      await monitorHandler.testCompatibility({ output: 'json' });

      expect(mockHandleError).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Failed to test compatibility'
      }));
    });

    it('should detect terminal size issues', async () => {
      // Mock getTerminalInfo to return small terminal size
      jest.spyOn(monitorHandler as any, 'getTerminalInfo').mockReturnValue({
        width: 40,
        height: 10,
        colorSupport: true,
        unicodeSupport: true
      });

      await monitorHandler.testCompatibility({ output: 'json' });

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('fail'));
    });
  });

  describe('exportConfig', () => {
    it('should export configuration to file', async () => {
      const filepath = '/tmp/test-config.json';

      await monitorHandler.exportConfig(filepath);

      expect(mockConfigManager.saveToFile).toHaveBeenCalledWith(filepath);
      expect(console.log).toHaveBeenCalledWith(`Configuration exported to ${filepath}`);
    });

    it('should handle export errors', async () => {
      mockConfigManager.saveToFile.mockImplementation(() => {
        throw new Error('Write error');
      });

      await expect(monitorHandler.exportConfig('/invalid/path')).resolves.toBeUndefined();
    });
  });

  describe('importConfig', () => {
    it('should import valid configuration from file', async () => {
      const filepath = '/tmp/test-config.json';

      await monitorHandler.importConfig(filepath);

      expect(MonitoringConfigManager.fromFile).toHaveBeenCalledWith(filepath);
      expect(console.log).toHaveBeenCalledWith(`Configuration imported from ${filepath}`);
    });

    it('should handle invalid configuration', async () => {
      mockConfigManager.validateConfig.mockReturnValue({
        valid: false,
        errors: ['Invalid config']
      });

      await expect(monitorHandler.importConfig('/tmp/invalid-config.json')).resolves.toBeUndefined();
    });

    it('should handle import errors', async () => {
      (MonitoringConfigManager.fromFile as jest.Mock).mockImplementationOnce(() => {
        throw new Error('File not found');
      });

      await expect(monitorHandler.importConfig('/nonexistent/file')).resolves.toBeUndefined();
    });
  });

  describe('Private Methods', () => {
    it('should get terminal info correctly', () => {
      const handler = monitorHandler as any;
      const terminalInfo = handler.getTerminalInfo();

      expect(terminalInfo).toHaveProperty('width');
      expect(terminalInfo).toHaveProperty('height');
      expect(terminalInfo).toHaveProperty('colorDepth');
      expect(terminalInfo).toHaveProperty('platform');
      expect(terminalInfo).toHaveProperty('term');
    });

    it('should detect color depth from environment', () => {
      process.env['COLORTERM'] = 'truecolor';
      
      const handler = monitorHandler as any;
      const colorDepth = handler.getColorDepth();
      
      expect(colorDepth).toBe(24);
    });

    it('should get performance info correctly', () => {
      const handler = monitorHandler as any;
      const perfInfo = handler.getPerformanceInfo();

      expect(perfInfo).toHaveProperty('memoryUsage');
      expect(perfInfo).toHaveProperty('cpuUsage');
      expect(perfInfo).toHaveProperty('uptime');
    });

    it('should update config from options correctly', () => {
      const handler = monitorHandler as any;
      const options: MonitorOptions = {
        refresh: '15',
        layout: 'compact',
        theme: 'dark'
      };

      handler.updateConfigFromOptions(options);

      expect(mockConfigManager.updateConfig).toHaveBeenCalledWith({
        refreshInterval: 15000,
        layout: 'compact',
        theme: 'dark'
      });
    });

    it('should handle invalid refresh interval', () => {
      const handler = monitorHandler as any;
      const options: MonitorOptions = { refresh: 'invalid' };

      expect(() => {
        handler.updateConfigFromOptions(options);
      }).toThrow('Refresh interval must be a number >= 1 second');
    });

    it('should load config from custom file', () => {
      const handler = monitorHandler as any;
      const options: MonitorOptions = { config: '/custom/config.json' };

      handler.updateConfigFromOptions(options);

      expect(MonitoringConfigManager.fromFile).toHaveBeenCalledWith('/custom/config.json');
    });
  });
});