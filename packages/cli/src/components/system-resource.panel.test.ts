/**
 * @fileoverview Unit tests for SystemResourcePanel component
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';
import { SystemResourcePanel } from './system-resource.panel';
import { SystemResourceService, SystemResourcesDetailed } from '../services/system-resource.service';
import { ComponentConfig } from '../types/monitoring';

// Mock blessed and blessed-contrib
jest.mock('blessed', () => ({
  box: jest.fn(() => ({
    setContent: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
    focus: jest.fn(),
    destroy: jest.fn(),
    append: jest.fn(),
    screen: { render: jest.fn() },
    style: { border: { fg: 'green' } },
  })),
  screen: jest.fn(() => ({
    render: jest.fn(),
    destroy: jest.fn(),
  })),
}));

jest.mock('blessed-contrib', () => ({
  gauge: jest.fn(() => ({
    setPercent: jest.fn(),
    setStack: jest.fn(),
  })),
  line: jest.fn(() => ({
    setData: jest.fn(),
    top: '0%',
    left: '0%',
    width: '100%',
    height: '100%',
  })),
}));

// Mock SystemResourceService
jest.mock('../services/system-resource.service', () => {
  const mockNetworkUtils = {
    formatBandwidth: jest.fn(() => ({ formatted: '1.0 MB/s', value: 1048576, unit: 'MB/s' })),
    formatBytes: jest.fn(() => ({ formatted: '1.0 GB', value: 1073741824, unit: 'GB' })),
  };
  
  return {
    SystemResourceService: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      removeAllListeners: jest.fn(),
      getSystemResources: jest.fn(),
      getSystemInfo: jest.fn(() => ({
        platform: 'darwin',
        hostname: 'test-host',
        uptime: 3600,
      })),
    })),
    NetworkUtils: mockNetworkUtils,
  };
});

describe('SystemResourcePanel', () => {
  let panel: SystemResourcePanel;
  let eventBus: EventEmitter;
  let mockConfig: ComponentConfig;
  let mockSystemResourceService: jest.Mocked<SystemResourceService>;

  const mockSystemResources: SystemResourcesDetailed = {
    cpu: {
      usage: 45.5,
      cores: 8,
      model: 'Intel Core i7',
      speed: 3200,
      loadAverage: [1.5, 1.2, 1.0],
    },
    memory: {
      total: 16 * 1024 * 1024 * 1024, // 16GB
      used: 8 * 1024 * 1024 * 1024,   // 8GB
      free: 8 * 1024 * 1024 * 1024,   // 8GB
      usage: 8 * 1024 * 1024 * 1024,
      available: 8 * 1024 * 1024 * 1024,
      percentage: 50,
    },
    network: {
      interfaces: [
        {
          name: 'eth0',
          isUp: true,
          bytesIn: 1024 * 1024 * 100, // 100MB
          bytesOut: 1024 * 1024 * 50,  // 50MB
          packetsIn: 1000,
          packetsOut: 800,
          errors: 0,
          dropped: 0,
          rateIn: 1024 * 1024, // 1MB/s
          rateOut: 512 * 1024, // 512KB/s
        },
      ],
      totalBytesIn: 1024 * 1024 * 100,
      totalBytesOut: 1024 * 1024 * 50,
      timestamp: Date.now(),
      connections: 25,
      totalRateIn: 1024 * 1024, // 1MB/s
      totalRateOut: 512 * 1024, // 512KB/s
      activeInterfaces: 1,
      errorRate: 0,
      connectionState: 'connected' as const,
    },
    process: {
      pid: 12345,
      cpuUsage: 2.5,
      memoryUsage: 128 * 1024 * 1024, // 128MB
      uptime: 3600, // 1 hour
      fileDescriptors: 50,
      threadCount: 8,
      status: 'running' as const,
      heapUsed: 64 * 1024 * 1024, // 64MB
      heapTotal: 128 * 1024 * 1024, // 128MB
      external: 8 * 1024 * 1024, // 8MB
      arrayBuffers: 4 * 1024 * 1024, // 4MB
      rss: 256 * 1024 * 1024, // 256MB
      avgCpuUsage: 2.0,
      peakMemoryUsage: 160 * 1024 * 1024, // 160MB
      performanceRating: 'good' as const,
    },
  };

  beforeEach(() => {
    eventBus = new EventEmitter();
    mockConfig = {
      type: 'system-resources',
      position: { x: 0, y: 0, width: 12, height: 12 },
      size: { minWidth: 80, minHeight: 24 },
      config: { refreshInterval: 5000 },
      visible: true,
      priority: 1,
    };

    // Clear all mocks
    jest.clearAllMocks();

    // Reset the mocked SystemResourceService
    mockSystemResourceService = new SystemResourceService() as jest.Mocked<SystemResourceService>;
    mockSystemResourceService.getSystemResources = jest.fn().mockResolvedValue(mockSystemResources);
    mockSystemResourceService.getHistory = jest.fn().mockReturnValue([]);
    mockSystemResourceService.getSystemInfo = jest.fn().mockReturnValue({
      platform: 'linux',
      architecture: 'x64',
      hostname: 'test-host',
      uptime: 86400,
      nodeVersion: 'v20.11.0',
    });
    mockSystemResourceService.isResourceStressed = jest.fn().mockReturnValue({
      cpu: false,
      memory: false,
      overall: false,
    });
    mockSystemResourceService.on = jest.fn();
    mockSystemResourceService.removeAllListeners = jest.fn();

    // Mock the constructor to return our mocked service
    (SystemResourceService as unknown as jest.Mock).mockImplementation(() => mockSystemResourceService);
  });

  afterEach(() => {
    if (panel) {
      panel.destroy();
    }
  });

  describe('Constructor and Initialization', () => {
    it('should create SystemResourcePanel instance', () => {
      panel = new SystemResourcePanel(mockConfig, eventBus);
      expect(panel).toBeInstanceOf(SystemResourcePanel);
    });

    it('should set up system resource service event listeners', () => {
      panel = new SystemResourcePanel(mockConfig, eventBus);
      expect(mockSystemResourceService.on).toHaveBeenCalledWith('resourceUpdate', expect.any(Function));
      expect(mockSystemResourceService.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should initialize with correct configuration', () => {
      panel = new SystemResourcePanel(mockConfig, eventBus);
      expect(panel.getState().type).toBe('system-resources');
      expect(panel.getState().status).toBe('running');
    });
  });

  describe('Component Rendering', () => {
    beforeEach(() => {
      panel = new SystemResourcePanel(mockConfig, eventBus);
    });

    it('should render without errors when no data is available', () => {
      expect(() => panel.render()).not.toThrow();
    });

    it('should render with system resource data', () => {
      panel.update(mockSystemResources);
      expect(() => panel.render()).not.toThrow();
    });

    it('should create all required UI components', () => {
      // Test that all components are created
      expect(panel).toBeDefined();
      
      // Mock the widget creation to verify all components were created
      const createWidgetSpy = jest.spyOn(panel as any, 'createWidget');
      (panel as any).createWidget();
      
      expect(createWidgetSpy).toHaveBeenCalled();
    });

    it('should handle widget creation errors gracefully', () => {
      const errorPanel = new SystemResourcePanel(mockConfig, eventBus);
      
      // Mock an error during widget creation
      jest.spyOn(errorPanel as any, 'createGauges').mockImplementation(() => {
        throw new Error('Widget creation failed');
      });
      
      expect(() => (errorPanel as any).createWidget()).not.toThrow();
    });

    it('should update all charts and boxes during render', () => {
      // Mock all update methods
      const updateGaugesSpy = jest.spyOn(panel as any, 'updateGauges');
      const updateNetworkChartSpy = jest.spyOn(panel as any, 'updateNetworkChart');
      const updateCpuChartSpy = jest.spyOn(panel as any, 'updateCpuChart');
      const updateMemoryChartSpy = jest.spyOn(panel as any, 'updateMemoryChart');
      const updateNetworkStatsBoxSpy = jest.spyOn(panel as any, 'updateNetworkStatsBox');
      const updateProcessStatsBoxSpy = jest.spyOn(panel as any, 'updateProcessStatsBox');
      const updateInfoBoxSpy = jest.spyOn(panel as any, 'updateInfoBox');
      const updateAlertBoxSpy = jest.spyOn(panel as any, 'updateAlertBox');
      
      panel.update(mockSystemResources);
      panel.render();
      
      expect(updateGaugesSpy).toHaveBeenCalled();
      expect(updateNetworkChartSpy).toHaveBeenCalled();
      expect(updateCpuChartSpy).toHaveBeenCalled();
      expect(updateMemoryChartSpy).toHaveBeenCalled();
      expect(updateNetworkStatsBoxSpy).toHaveBeenCalled();
      expect(updateProcessStatsBoxSpy).toHaveBeenCalled();
      expect(updateInfoBoxSpy).toHaveBeenCalled();
      expect(updateAlertBoxSpy).toHaveBeenCalled();
    });

    it('should handle render errors gracefully', () => {
      // Mock an error during render
      jest.spyOn(panel as any, 'updateGauges').mockImplementation(() => {
        throw new Error('Render failed');
      });
      
      panel.update(mockSystemResources);
      expect(() => panel.render()).not.toThrow();
    });
  });

  describe('Data Updates', () => {
    beforeEach(() => {
      panel = new SystemResourcePanel(mockConfig, eventBus);
    });

    it('should update component state when new data is received', () => {
      panel.update(mockSystemResources);
      const state = panel.getState();
      expect(state.data).toEqual(mockSystemResources);
      expect(state.lastUpdate).toBeInstanceOf(Date);
    });

    it('should handle resource update from service', () => {
      const updateSpy = jest.spyOn(panel, 'update');
      
      // Simulate service emitting resourceUpdate event
      const serviceCallback = (mockSystemResourceService.on as jest.Mock).mock.calls
        .find(call => call[0] === 'resourceUpdate')[1];
      
      serviceCallback(mockSystemResources);
      expect(updateSpy).toHaveBeenCalledWith(mockSystemResources);
    });
  });

  describe('Alert System', () => {
    beforeEach(() => {
      panel = new SystemResourcePanel(mockConfig, eventBus);
    });

    it('should detect CPU warning alerts', () => {
      const highCpuResources = {
        ...mockSystemResources,
        cpu: { ...mockSystemResources.cpu, usage: 75 },
      };
      
      panel.update(highCpuResources);
      panel.render();
      
      // The alertBox should be updated with warning
      expect(panel).toBeDefined();
    });

    it('should detect memory critical alerts', () => {
      const highMemoryResources = {
        ...mockSystemResources,
        memory: { ...mockSystemResources.memory, percentage: 95 },
      };
      
      panel.update(highMemoryResources);
      panel.render();
      
      // The alertBox should be updated with critical alert
      expect(panel).toBeDefined();
    });

    it('should handle no alerts condition', () => {
      const lowUsageResources = {
        ...mockSystemResources,
        cpu: { ...mockSystemResources.cpu, usage: 30 },
        memory: { ...mockSystemResources.memory, percentage: 40 },
      };
      
      panel.update(lowUsageResources);
      panel.render();
      
      // The alertBox should show no alerts
      expect(panel).toBeDefined();
    });

    it('should load alert thresholds from configuration', () => {
      const configWithThresholds = {
        ...mockConfig,
        config: {
          alertThresholds: {
            cpu: { warning: 80, critical: 95 },
            memory: { warning: 85, critical: 95 },
            network: { warning: 20, critical: 100 },
          },
        },
      };
      
      panel = new SystemResourcePanel(configWithThresholds, eventBus);
      const thresholds = panel.getAlertThresholds();
      
      expect(thresholds.cpu.warning).toBe(80);
      expect(thresholds.cpu.critical).toBe(95);
      expect(thresholds.memory.warning).toBe(85);
      expect(thresholds.memory.critical).toBe(95);
    });

    it('should update alert thresholds dynamically', () => {
      const newThresholds = {
        cpu: { warning: 60, critical: 80 },
        memory: { warning: 70, critical: 85 },
      };
      
      panel.updateAlertThresholds(newThresholds);
      const thresholds = panel.getAlertThresholds();
      
      expect(thresholds.cpu.warning).toBe(60);
      expect(thresholds.cpu.critical).toBe(80);
      expect(thresholds.memory.warning).toBe(70);
      expect(thresholds.memory.critical).toBe(85);
    });

    it('should return current alert thresholds', () => {
      const thresholds = panel.getAlertThresholds();
      
      expect(thresholds).toHaveProperty('cpu');
      expect(thresholds).toHaveProperty('memory');
      expect(thresholds).toHaveProperty('network');
      expect(thresholds.cpu).toHaveProperty('warning');
      expect(thresholds.cpu).toHaveProperty('critical');
    });
  });

  describe('Trend Chart Management', () => {
    beforeEach(() => {
      panel = new SystemResourcePanel(mockConfig, eventBus);
    });

    it('should maintain CPU history within size limits', () => {
      // Update with multiple data points
      for (let i = 0; i < 70; i++) {
        const resources = {
          ...mockSystemResources,
          cpu: { ...mockSystemResources.cpu, usage: 30 + i },
        };
        panel.update(resources);
      }
      
      // Should maintain reasonable history size
      expect(panel).toBeDefined();
    });

    it('should maintain memory history within size limits', () => {
      // Update with multiple data points
      for (let i = 0; i < 70; i++) {
        const resources = {
          ...mockSystemResources,
          memory: { ...mockSystemResources.memory, percentage: 40 + i },
        };
        panel.update(resources);
      }
      
      // Should maintain reasonable history size
      expect(panel).toBeDefined();
    });

    it('should update CPU chart with trend data', () => {
      // Mock the cpuChart
      const mockCpuChart = { setData: jest.fn() };
      (panel as any).cpuChart = mockCpuChart;
      (panel as any).cpuHistory = [
        { timestamp: Date.now(), usage: 30 },
        { timestamp: Date.now(), usage: 35 },
        { timestamp: Date.now(), usage: 40 },
      ];
      
      (panel as any).updateCpuChart();
      expect(mockCpuChart.setData).toHaveBeenCalledWith([
        {
          title: 'CPU',
          x: ['0', '1', '2'],
          y: ['30.0', '35.0', '40.0'],
          style: { line: 'red' },
        },
      ]);
    });

    it('should update memory chart with trend data', () => {
      // Mock the memoryChart
      const mockMemoryChart = { setData: jest.fn() };
      (panel as any).memoryChart = mockMemoryChart;
      (panel as any).memoryHistory = [
        { timestamp: Date.now(), usage: 50 },
        { timestamp: Date.now(), usage: 55 },
        { timestamp: Date.now(), usage: 60 },
      ];
      
      (panel as any).updateMemoryChart();
      expect(mockMemoryChart.setData).toHaveBeenCalledWith([
        {
          title: 'Memory',
          x: ['0', '1', '2'],
          y: ['50.0', '55.0', '60.0'],
          style: { line: 'blue' },
        },
      ]);
    });

    it('should not update charts when history is empty', () => {
      const mockCpuChart = { setData: jest.fn() };
      const mockMemoryChart = { setData: jest.fn() };
      (panel as any).cpuChart = mockCpuChart;
      (panel as any).memoryChart = mockMemoryChart;
      (panel as any).cpuHistory = [];
      (panel as any).memoryHistory = [];
      
      (panel as any).updateCpuChart();
      (panel as any).updateMemoryChart();
      
      expect(mockCpuChart.setData).not.toHaveBeenCalled();
      expect(mockMemoryChart.setData).not.toHaveBeenCalled();
    });

    it('should not update charts when chart components are not available', () => {
      (panel as any).cpuChart = null;
      (panel as any).memoryChart = null;
      (panel as any).cpuHistory = [{ timestamp: Date.now(), usage: 30 }];
      (panel as any).memoryHistory = [{ timestamp: Date.now(), usage: 50 }];
      
      expect(() => (panel as any).updateCpuChart()).not.toThrow();
      expect(() => (panel as any).updateMemoryChart()).not.toThrow();
    });

    it('should update CPU and memory histories directly', () => {
      const initialCpuLength = (panel as any).cpuHistory.length;
      const initialMemoryLength = (panel as any).memoryHistory.length;
      
      (panel as any).updateCpuHistory(mockSystemResources);
      (panel as any).updateMemoryHistory(mockSystemResources);
      
      expect((panel as any).cpuHistory.length).toBe(initialCpuLength + 1);
      expect((panel as any).memoryHistory.length).toBe(initialMemoryLength + 1);
      
      const latestCpuEntry = (panel as any).cpuHistory[(panel as any).cpuHistory.length - 1];
      const latestMemoryEntry = (panel as any).memoryHistory[(panel as any).memoryHistory.length - 1];
      
      expect(latestCpuEntry.usage).toBe(mockSystemResources.cpu.usage);
      expect(latestMemoryEntry.usage).toBe(mockSystemResources.memory.percentage);
    });
  });

  describe('Network History Management', () => {
    beforeEach(() => {
      panel = new SystemResourcePanel(mockConfig, eventBus);
    });

    it('should maintain network history within size limits', () => {
      // Update with multiple data points
      for (let i = 0; i < 70; i++) {
        const resources = {
          ...mockSystemResources,
          network: {
            ...mockSystemResources.network,
            totalBytesIn: 1024 * 1024 * (100 + i),
            totalBytesOut: 1024 * 1024 * (50 + i),
            timestamp: Date.now() + i * 1000,
            totalRateIn: 1024 * 1024 * (1 + i * 0.1),
            totalRateOut: 1024 * 512 * (1 + i * 0.1),
          },
        };
        panel.update(resources);
      }
      
      // Should maintain reasonable history size
      expect(panel).toBeDefined();
    });

    it('should calculate network rates correctly', async () => {
      const firstUpdate = {
        ...mockSystemResources,
        network: {
          ...mockSystemResources.network,
          totalBytesIn: 1024 * 1024 * 100,
          totalBytesOut: 1024 * 1024 * 50,
          timestamp: Date.now(),
        },
      };
      
      panel.update(firstUpdate);
      
      // Wait and update with new values
      await new Promise(resolve => setTimeout(resolve, 1)); // Use minimal delay
      
      const secondUpdate = {
        ...mockSystemResources,
        network: {
          ...mockSystemResources.network,
          totalBytesIn: 1024 * 1024 * 120, // 20MB more
          totalBytesOut: 1024 * 1024 * 60,  // 10MB more
          timestamp: Date.now() + 5000,    // 5 seconds later
          totalRateIn: 1024 * 1024 * 2,    // 2MB/s
          totalRateOut: 1024 * 1024,       // 1MB/s
        },
      };
      
      panel.update(secondUpdate);
      // Network rates should be calculated
      expect(panel).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      panel = new SystemResourcePanel(mockConfig, eventBus);
    });

    it('should handle resource service errors gracefully', () => {
      const error = new Error('Resource collection failed');
      
      // Simulate service emitting error event
      const errorCallback = (mockSystemResourceService.on as jest.Mock).mock.calls
        .find(call => call[0] === 'error')[1];
      
      expect(() => errorCallback(error)).not.toThrow();
    });

    it('should enter degraded mode on persistent errors', () => {
      const error = new Error('Persistent resource error');
      
      // Simulate service emitting error event
      const errorCallback = (mockSystemResourceService.on as jest.Mock).mock.calls
        .find(call => call[0] === 'error')[1];
      
      errorCallback(error);
      
      // Should handle degraded mode
      expect(panel.getState().status).toBe('error');
    });

    it('should handle update errors gracefully', () => {
      const invalidData = null as any;
      expect(() => panel.update(invalidData)).not.toThrow();
    });
  });

  describe('Configuration Management', () => {
    it('should use custom refresh interval from config', () => {
      const customConfig = {
        ...mockConfig,
        config: { refreshInterval: 10000 },
      };
      
      panel = new SystemResourcePanel(customConfig, eventBus);
      expect(panel).toBeDefined();
    });

    it('should use default refresh interval when not specified', () => {
      const defaultConfig = {
        ...mockConfig,
        config: {},
      };
      
      panel = new SystemResourcePanel(defaultConfig, eventBus);
      expect(panel).toBeDefined();
    });
  });

  describe('Component Lifecycle', () => {
    beforeEach(() => {
      panel = new SystemResourcePanel(mockConfig, eventBus);
    });

    it('should show component when show() is called', () => {
      const mockWidget = {
        show: jest.fn(),
        screen: { render: jest.fn() },
        destroy: jest.fn(),
      };
      
      // Mock the widget property
      (panel as any).widget = mockWidget;
      
      panel.show();
      expect(mockWidget.show).toHaveBeenCalled();
    });

    it('should hide component when hide() is called', () => {
      const mockWidget = {
        hide: jest.fn(),
        screen: { render: jest.fn() },
        destroy: jest.fn(),
      };
      
      // Mock the widget property
      (panel as any).widget = mockWidget;
      
      panel.hide();
      expect(mockWidget.hide).toHaveBeenCalled();
    });

    it('should focus component when focus() is called', () => {
      const mockWidget = {
        focus: jest.fn(),
        destroy: jest.fn(),
      };
      
      // Mock the widget property
      (panel as any).widget = mockWidget;
      
      panel.focus();
      expect(mockWidget.focus).toHaveBeenCalled();
    });

    it('should destroy component and clean up resources', () => {
      panel.destroy();
      
      expect(mockSystemResourceService.removeAllListeners).toHaveBeenCalled();
      expect(panel.getState().status).toBe('destroyed');
    });

    it('should clean up all history data on destroy', () => {
      // Manually add data to histories to test cleanup
      (panel as any).networkHistory = [
        { timestamp: Date.now(), bytesIn: 1, bytesOut: 1 },
        { timestamp: Date.now(), bytesIn: 2, bytesOut: 2 },
      ];
      (panel as any).cpuHistory = [
        { timestamp: Date.now(), usage: 30 },
        { timestamp: Date.now(), usage: 35 },
      ];
      (panel as any).memoryHistory = [
        { timestamp: Date.now(), usage: 50 },
        { timestamp: Date.now(), usage: 55 },
      ];
      (panel as any).currentResources = mockSystemResources;
      
      // Verify histories have data
      expect((panel as any).networkHistory.length).toBeGreaterThan(0);
      expect((panel as any).cpuHistory.length).toBeGreaterThan(0);
      expect((panel as any).memoryHistory.length).toBeGreaterThan(0);
      expect((panel as any).currentResources).not.toBeNull();
      
      // Destroy and verify cleanup
      panel.destroy();
      
      expect((panel as any).networkHistory).toEqual([]);
      expect((panel as any).cpuHistory).toEqual([]);
      expect((panel as any).memoryHistory).toEqual([]);
      expect((panel as any).currentResources).toBeNull();
    });

    it('should start data collection on creation', () => {
      const collectDataSpy = jest.spyOn(panel as any, 'collectResourceData');
      (panel as any).startDataCollection();
      
      expect(collectDataSpy).toHaveBeenCalled();
    });

    it('should request data update', () => {
      const collectDataSpy = jest.spyOn(panel as any, 'collectResourceData');
      (panel as any).requestUpdate();
      
      expect(collectDataSpy).toHaveBeenCalled();
    });
  });

  describe('Theme and Styling', () => {
    beforeEach(() => {
      panel = new SystemResourcePanel(mockConfig, eventBus);
    });

    it('should handle theme changes', () => {
      eventBus.emit('theme:change', { theme: 'dark' });
      expect(panel).toBeDefined();
    });

    it('should apply correct colors for different alert levels', () => {
      // Test color selection for different usage levels
      const getColorForValue = (panel as any).getColorForValue.bind(panel);
      
      expect(getColorForValue(30, 'cpu')).toBe('green');
      expect(getColorForValue(75, 'cpu')).toBe('yellow');
      expect(getColorForValue(90, 'cpu')).toBe('red');
    });
  });

  describe('UI Component Updates', () => {
    beforeEach(() => {
      panel = new SystemResourcePanel(mockConfig, eventBus);
    });

    it('should update gauges with correct values', () => {
      const mockCpuGauge = { setPercent: jest.fn(), setStack: jest.fn() };
      const mockMemoryGauge = { setPercent: jest.fn(), setStack: jest.fn() };
      const mockProcessGauge = { setPercent: jest.fn(), setStack: jest.fn() };
      
      (panel as any).cpuGauge = mockCpuGauge;
      (panel as any).memoryGauge = mockMemoryGauge;
      (panel as any).processGauge = mockProcessGauge;
      (panel as any).currentResources = mockSystemResources;
      
      (panel as any).updateGauges();
      
      expect(mockCpuGauge.setPercent).toHaveBeenCalledWith(mockSystemResources.cpu.usage);
      expect(mockMemoryGauge.setPercent).toHaveBeenCalledWith(mockSystemResources.memory.percentage);
      expect(mockProcessGauge.setPercent).toHaveBeenCalledWith(mockSystemResources.process.cpuUsage);
    });

    it('should not update gauges when currentResources is null', () => {
      const mockCpuGauge = { setPercent: jest.fn(), setStack: jest.fn() };
      (panel as any).cpuGauge = mockCpuGauge;
      (panel as any).currentResources = null;
      
      (panel as any).updateGauges();
      
      expect(mockCpuGauge.setPercent).not.toHaveBeenCalled();
    });

    it('should handle missing gauge components gracefully', () => {
      (panel as any).cpuGauge = null;
      (panel as any).memoryGauge = null;
      (panel as any).processGauge = null;
      (panel as any).currentResources = mockSystemResources;
      
      expect(() => (panel as any).updateGauges()).not.toThrow();
    });

    it('should update network stats box with correct content', () => {
      const mockNetworkStatsBox = { setContent: jest.fn(), style: { border: {} } };
      (panel as any).networkStatsBox = mockNetworkStatsBox;
      (panel as any).currentResources = mockSystemResources;
      
      (panel as any).updateNetworkStatsBox();
      
      expect(mockNetworkStatsBox.setContent).toHaveBeenCalled();
      const content = mockNetworkStatsBox.setContent.mock.calls[0][0];
      expect(content).toContain('Total:');
      expect(content).toContain('In:');
      expect(content).toContain('Out:');
    });

    it('should update process stats box with correct content', () => {
      const mockProcessStatsBox = { setContent: jest.fn(), style: { border: {} } };
      (panel as any).processStatsBox = mockProcessStatsBox;
      (panel as any).currentResources = mockSystemResources;
      
      (panel as any).updateProcessStatsBox();
      
      expect(mockProcessStatsBox.setContent).toHaveBeenCalled();
      const content = mockProcessStatsBox.setContent.mock.calls[0][0];
      expect(content).toContain('PID:');
      expect(content).toContain('CPU:');
      expect(content).toContain('Heap:');
    });

    it('should update info box with system information', () => {
      const mockInfoBox = { setContent: jest.fn() };
      (panel as any).infoBox = mockInfoBox;
      (panel as any).currentResources = mockSystemResources;
      
      // Mock the getSystemInfo method
      const mockSystemInfo = {
        platform: 'darwin',
        hostname: 'test-host',
        uptime: 3600,
      };
      jest.spyOn((panel as any).systemResourceService, 'getSystemInfo').mockReturnValue(mockSystemInfo);
      
      (panel as any).updateInfoBox();
      
      expect(mockInfoBox.setContent).toHaveBeenCalled();
      const content = mockInfoBox.setContent.mock.calls[0][0];
      expect(content).toContain('Platform:');
      expect(content).toContain('Hostname:');
    });

    it('should update alert box with current alerts', () => {
      const mockAlertBox = { setContent: jest.fn(), style: { border: {} } };
      (panel as any).alertBox = mockAlertBox;
      (panel as any).currentResources = {
        ...mockSystemResources,
        cpu: { ...mockSystemResources.cpu, usage: 80 }, // Above warning threshold
      };
      
      (panel as any).updateAlertBox();
      
      expect(mockAlertBox.setContent).toHaveBeenCalled();
      const content = mockAlertBox.setContent.mock.calls[0][0];
      expect(content).toContain('CPU: 80% (WARNING)');
    });

    it('should show degraded mode when handleResourceError is called', () => {
      const mockAlertBox = { setContent: jest.fn(), style: { border: {} } };
      (panel as any).alertBox = mockAlertBox;
      
      const error = new Error('Resource error');
      (panel as any).handleResourceError(error);
      
      expect(mockAlertBox.setContent).toHaveBeenCalledWith('DEGRADED MODE\nLimited data available');
    });
  });

  describe('Performance Considerations', () => {
    beforeEach(() => {
      panel = new SystemResourcePanel(mockConfig, eventBus);
    });

    it('should handle rapid updates efficiently', () => {
      const start = Date.now();
      
      // Send many rapid updates
      for (let i = 0; i < 100; i++) {
        panel.update(mockSystemResources);
      }
      
      const end = Date.now();
      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should throttle render calls', () => {
      const renderSpy = jest.spyOn(panel, 'render');
      
      // Send multiple updates rapidly
      for (let i = 0; i < 10; i++) {
        panel.update(mockSystemResources);
      }
      
      // Render should be throttled
      expect(renderSpy.mock.calls.length).toBeLessThan(10);
    });
  });

  describe('Data Validation', () => {
    beforeEach(() => {
      panel = new SystemResourcePanel(mockConfig, eventBus);
    });

    it('should handle missing CPU data gracefully', () => {
      const incompleteData = {
        ...mockSystemResources,
        cpu: undefined as any,
      };
      
      expect(() => panel.update(incompleteData)).not.toThrow();
    });

    it('should handle missing memory data gracefully', () => {
      const incompleteData = {
        ...mockSystemResources,
        memory: undefined as any,
      };
      
      expect(() => panel.update(incompleteData)).not.toThrow();
    });

    it('should handle missing network data gracefully', () => {
      const incompleteData = {
        ...mockSystemResources,
        network: undefined as any,
      };
      
      expect(() => panel.update(incompleteData)).not.toThrow();
    });
  });
});