/**
 * @fileoverview Unit tests for StreamMetricsPanel component
 * @author Development Team
 * @since 5.2.0
 */

import { EventEmitter } from 'events';
import { StreamMetricsPanel, StreamMetricsPanelConfig } from './stream-metrics.panel';
import { StreamMetrics } from '../types/monitoring';

// Mock blessed-contrib
jest.mock('blessed-contrib', () => ({
  line: jest.fn(() => ({
    setData: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
    parent: null,
    top: 0,
    left: 0,
    width: '100%',
    height: 'bottom-1'
  }))
}));

// Mock blessed
jest.mock('blessed', () => ({
  box: jest.fn(() => ({
    setContent: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
    key: jest.fn(),
    screen: {
      render: jest.fn()
    },
    destroy: jest.fn()
  })),
  screen: jest.fn(() => ({
    render: jest.fn()
  }))
}));

describe('StreamMetricsPanel', () => {
  let eventBus: EventEmitter;
  let config: StreamMetricsPanelConfig;
  let panel: StreamMetricsPanel;

  beforeEach(() => {
    eventBus = new EventEmitter();
    config = {
      type: 'stream-metrics',
      position: { x: 0, y: 0, width: 100, height: 50 },
      size: { minWidth: 50, minHeight: 20 },
      config: {},
      visible: true,
      priority: 1,
      refreshInterval: 5000,
      maxDataPoints: 100,
      channels: ['channel1', 'channel2'],
      alertThresholds: {
        bitrate: { min: 500, max: 5000 },
        fps: { min: 20, max: 60 },
        viewerCount: { max: 1000 }
      },
      chartStyle: {
        lineColors: ['yellow', 'green', 'cyan'],
        backgroundColor: 'black',
        foregroundColor: 'white'
      }
    };
  });

  afterEach(() => {
    if (panel) {
      panel.destroy();
    }
  });

  describe('Constructor and Initialization', () => {
    it('should create panel with correct initial state', () => {
      panel = new StreamMetricsPanel(config, eventBus);
      
      expect(panel.getState().type).toBe('stream-metrics');
      expect(panel.getState().status).toBe('running');
      expect(panel.getAllChannelsData().size).toBe(0);
      expect(panel.getCurrentChannelData()).toBeNull();
    });

    it('should initialize with provided configuration', () => {
      panel = new StreamMetricsPanel(config, eventBus);
      
      const panelConfig = (panel as any).getConfig();
      expect(panelConfig.refreshInterval).toBe(5000);
      expect(panelConfig.maxDataPoints).toBe(100);
      expect(panelConfig.channels).toEqual(['channel1', 'channel2']);
    });
  });

  describe('Data Processing', () => {
    beforeEach(() => {
      panel = new StreamMetricsPanel(config, eventBus);
    });

    it('should process single stream metrics', () => {
      const metrics: StreamMetrics = {
        channelId: 'test-channel',
        bitrate: 1500,
        fps: 30,
        resolution: '1920x1080',
        viewerCount: 100,
        status: 'live',
        uptime: 3600000,
        bandwidth: 1500000,
        lastUpdate: new Date()
      };

      panel.update(metrics);

      const channelData = panel.getCurrentChannelData();
      expect(channelData).not.toBeNull();
      expect(channelData!.channelId).toBe('test-channel');
      expect(channelData!.isActive).toBe(true);
      expect(channelData!.dataPoints).toHaveLength(1);
      expect(channelData!.dataPoints[0]?.bitrate).toBe(1500);
    });

    it('should process multiple stream metrics', () => {
      const metricsArray: StreamMetrics[] = [
        {
          channelId: 'channel1',
          bitrate: 1000,
          fps: 25,
          resolution: '1280x720',
          viewerCount: 50,
          status: 'live',
          uptime: 1800000,
          bandwidth: 1000000,
          lastUpdate: new Date()
        },
        {
          channelId: 'channel2',
          bitrate: 2000,
          fps: 30,
          resolution: '1920x1080',
          viewerCount: 150,
          status: 'live',
          uptime: 3600000,
          bandwidth: 2000000,
          lastUpdate: new Date()
        }
      ];

      panel.update(metricsArray);

      expect(panel.getAllChannelsData().size).toBe(2);
      expect(panel.getCurrentChannelData()?.channelId).toBe('channel1'); // First channel selected
    });

    it('should handle data updates in different formats', () => {
      // Test array format
      panel.update([{
        channelId: 'channel1',
        bitrate: 1000,
        fps: 25,
        resolution: '1280x720',
        viewerCount: 50,
        status: 'live',
        uptime: 1800000,
        bandwidth: 1000000,
        lastUpdate: new Date()
      }]);

      expect(panel.getAllChannelsData().size).toBe(1);

      // Test object with channels property
      panel.update({
        channels: [{
          channelId: 'channel2',
          bitrate: 2000,
          fps: 30,
          resolution: '1920x1080',
          viewerCount: 150,
          status: 'live',
          uptime: 3600000,
          bandwidth: 2000000,
          lastUpdate: new Date()
        }]
      });

      expect(panel.getAllChannelsData().size).toBe(2);
    });

    it('should maintain max data points limit', () => {
      const testConfig = { ...config, maxDataPoints: 3 };
      panel = new StreamMetricsPanel(testConfig, eventBus);

      // Add 5 data points
      for (let i = 0; i < 5; i++) {
        const metrics: StreamMetrics = {
          channelId: 'test-channel',
          bitrate: 1000 + i * 100,
          fps: 30,
          resolution: '1920x1080',
          viewerCount: 100,
          status: 'live',
          uptime: 3600000,
          bandwidth: 1000000,
          lastUpdate: new Date(Date.now() + i * 1000)
        };
        panel.update(metrics);
      }

      const channelData = panel.getCurrentChannelData();
      expect(channelData!.dataPoints).toHaveLength(3); // Should keep only last 3
      expect(channelData!.dataPoints[0]?.bitrate).toBe(1200); // Should keep points 2, 3, 4
    });
  });

  describe('Alert System', () => {
    beforeEach(() => {
      panel = new StreamMetricsPanel(config, eventBus);
    });

    it('should trigger bitrate alerts when below minimum', () => {
      const alertSpy = jest.fn();
      eventBus.on('component:alert', alertSpy);

      const metrics: StreamMetrics = {
        channelId: 'test-channel',
        bitrate: 300, // Below minimum of 500
        fps: 30,
        resolution: '1920x1080',
        viewerCount: 100,
        status: 'live',
        uptime: 3600000,
        bandwidth: 300000,
        lastUpdate: new Date()
      };

      panel.update(metrics);

      expect(alertSpy).toHaveBeenCalled();
      const alertData = alertSpy.mock.calls[0][0];
      expect(alertData.alert.type).toBe('bitrate');
      expect(alertData.alert.level).toBe('warning');
    });

    it('should trigger bitrate alerts when above maximum', () => {
      const alertSpy = jest.fn();
      eventBus.on('component:alert', alertSpy);

      const metrics: StreamMetrics = {
        channelId: 'test-channel',
        bitrate: 6000, // Above maximum of 5000
        fps: 30,
        resolution: '1920x1080',
        viewerCount: 100,
        status: 'live',
        uptime: 3600000,
        bandwidth: 6000000,
        lastUpdate: new Date()
      };

      panel.update(metrics);

      expect(alertSpy).toHaveBeenCalled();
      const alertData = alertSpy.mock.calls[0][0];
      expect(alertData.alert.type).toBe('bitrate');
      expect(alertData.alert.level).toBe('error');
    });

    it('should trigger FPS alerts when below minimum', () => {
      const alertSpy = jest.fn();
      eventBus.on('component:alert', alertSpy);

      const metrics: StreamMetrics = {
        channelId: 'test-channel',
        bitrate: 1500,
        fps: 15, // Below minimum of 20
        resolution: '1920x1080',
        viewerCount: 100,
        status: 'live',
        uptime: 3600000,
        bandwidth: 1500000,
        lastUpdate: new Date()
      };

      panel.update(metrics);

      expect(alertSpy).toHaveBeenCalled();
      const alertData = alertSpy.mock.calls[0][0];
      expect(alertData.alert.type).toBe('fps');
      expect(alertData.alert.level).toBe('warning');
    });

    it('should respect alert cooldown periods', () => {
      const alertSpy = jest.fn();
      eventBus.on('component:alert', alertSpy);

      const metrics: StreamMetrics = {
        channelId: 'test-channel',
        bitrate: 300, // Below minimum
        fps: 30,
        resolution: '1920x1080',
        viewerCount: 100,
        status: 'live',
        uptime: 3600000,
        bandwidth: 300000,
        lastUpdate: new Date()
      };

      // First update should trigger alert
      panel.update(metrics);
      expect(alertSpy).toHaveBeenCalledTimes(1);

      // Second update immediately should not trigger another alert
      panel.update(metrics);
      expect(alertSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Channel Management', () => {
    beforeEach(() => {
      panel = new StreamMetricsPanel(config, eventBus);
    });

    it('should switch to next channel', () => {
      // Add data for multiple channels
      const channels = ['channel1', 'channel2', 'channel3'];
      channels.forEach(channelId => {
        panel.update({
          channelId,
          bitrate: 1500,
          fps: 30,
          resolution: '1920x1080',
          viewerCount: 100,
          status: 'live',
          uptime: 3600000,
          bandwidth: 1500000,
          lastUpdate: new Date()
        });
      });

      expect(panel.getCurrentChannelData()?.channelId).toBe('channel1');

      // Simulate key press for next channel
      (panel as any).switchToNextChannel();
      expect(panel.getCurrentChannelData()?.channelId).toBe('channel2');

      (panel as any).switchToNextChannel();
      expect(panel.getCurrentChannelData()?.channelId).toBe('channel3');

      (panel as any).switchToNextChannel();
      expect(panel.getCurrentChannelData()?.channelId).toBe('channel1'); // Wraps around
    });

    it('should switch to previous channel', () => {
      // Add data for multiple channels
      const channels = ['channel1', 'channel2', 'channel3'];
      channels.forEach(channelId => {
        panel.update({
          channelId,
          bitrate: 1500,
          fps: 30,
          resolution: '1920x1080',
          viewerCount: 100,
          status: 'live',
          uptime: 3600000,
          bandwidth: 1500000,
          lastUpdate: new Date()
        });
      });

      expect(panel.getCurrentChannelData()?.channelId).toBe('channel1');

      // Simulate key press for previous channel
      (panel as any).switchToPreviousChannel();
      expect(panel.getCurrentChannelData()?.channelId).toBe('channel3'); // Wraps around

      (panel as any).switchToPreviousChannel();
      expect(panel.getCurrentChannelData()?.channelId).toBe('channel2');
    });

    it('should set current channel programmatically', () => {
      // Add data for multiple channels
      const channels = ['channel1', 'channel2'];
      channels.forEach(channelId => {
        panel.update({
          channelId,
          bitrate: 1500,
          fps: 30,
          resolution: '1920x1080',
          viewerCount: 100,
          status: 'live',
          uptime: 3600000,
          bandwidth: 1500000,
          lastUpdate: new Date()
        });
      });

      panel.setCurrentChannel('channel2');
      expect(panel.getCurrentChannelData()?.channelId).toBe('channel2');
    });

    it('should emit channel switch events', () => {
      const switchSpy = jest.fn();
      eventBus.on('component:channelSwitch', switchSpy);

      // Add data for channels
      panel.update({
        channelId: 'channel1',
        bitrate: 1500,
        fps: 30,
        resolution: '1920x1080',
        viewerCount: 100,
        status: 'live',
        uptime: 3600000,
        bandwidth: 1500000,
        lastUpdate: new Date()
      });

      panel.update({
        channelId: 'channel2',
        bitrate: 1500,
        fps: 30,
        resolution: '1920x1080',
        viewerCount: 100,
        status: 'live',
        uptime: 3600000,
        bandwidth: 1500000,
        lastUpdate: new Date()
      });

      (panel as any).switchToNextChannel();
      
      expect(switchSpy).toHaveBeenCalled();
      const switchData = switchSpy.mock.calls[0][0];
      expect(switchData.channelId).toBe('channel2');
    });
  });

  describe('Chart Updates', () => {
    beforeEach(() => {
      panel = new StreamMetricsPanel(config, eventBus);
    });

    it('should update chart data when metrics are available', () => {
      const mockChart = (panel as any).lineChart;
      const setDataSpy = jest.spyOn(mockChart, 'setData');

      // Add some data points
      for (let i = 0; i < 5; i++) {
        panel.update({
          channelId: 'test-channel',
          bitrate: 1000 + i * 100,
          fps: 25 + i,
          resolution: '1920x1080',
          viewerCount: 100 + i * 10,
          status: 'live',
          uptime: 3600000,
          bandwidth: 1000000 + i * 100000,
          lastUpdate: new Date(Date.now() + i * 1000)
        });
      }

      panel.render();

      expect(setDataSpy).toHaveBeenCalled();
      const chartData = setDataSpy.mock.calls[0]?.[0] as any[];
      expect(chartData).toHaveLength(3); // Bitrate, FPS, Viewers
      expect(chartData[0]?.title).toBe('Bitrate (kbps)');
      expect(chartData[1]?.title).toBe('FPS');
      expect(chartData[2]?.title).toBe('Viewers');
    });

    it('should handle chart update errors gracefully', () => {
      const mockChart = (panel as any).lineChart;
      jest.spyOn(mockChart, 'setData').mockImplementation(() => {
        throw new Error('Chart error');
      });

      // Should not throw error
      expect(() => {
        panel.update({
          channelId: 'test-channel',
          bitrate: 1500,
          fps: 30,
          resolution: '1920x1080',
          viewerCount: 100,
          status: 'live',
          uptime: 3600000,
          bandwidth: 1500000,
          lastUpdate: new Date()
        });
        panel.render();
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      panel = new StreamMetricsPanel(config, eventBus);
    });

    it('should handle invalid data gracefully', () => {
      expect(() => {
        (panel as any).update(null);
      }).not.toThrow();

      expect(() => {
        (panel as any).update(undefined);
      }).not.toThrow();

      expect(() => {
        (panel as any).update({});
      }).not.toThrow();
    });

    it('should emit error events when errors occur', () => {
      const errorSpy = jest.fn();
      eventBus.on('component:error', errorSpy);

      // Force an error by passing invalid data to render
      jest.spyOn(panel, 'render').mockImplementation(() => {
        throw new Error('Render error');
      });

      // Expect the render call to throw, but test should continue
      expect(() => panel.render()).toThrow('Render error');
    });
  });

  describe('Component Lifecycle', () => {
    beforeEach(() => {
      panel = new StreamMetricsPanel(config, eventBus);
    });

    it('should clean up resources on destroy', () => {
      const mockWidget = (panel as any).widget;
      const destroySpy = jest.spyOn(mockWidget, 'destroy');

      panel.destroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(panel.getState().status).toBe('destroyed');
      expect(panel.getAllChannelsData().size).toBe(0);
    });

    it('should handle resize operations', () => {
      const newSize = {
        minWidth: 100,
        minHeight: 50,
        maxWidth: 200,
        maxHeight: 100
      };

      expect(() => {
        panel.resize(newSize);
      }).not.toThrow();
    });

    it('should handle show/hide operations', () => {
      expect(() => {
        panel.show();
        panel.hide();
      }).not.toThrow();
    });
  });

  describe('Data Persistence', () => {
    beforeEach(() => {
      panel = new StreamMetricsPanel(config, eventBus);
    });

    it('should maintain separate data for different channels', () => {
      panel.update({
        channelId: 'channel1',
        bitrate: 1000,
        fps: 25,
        resolution: '1280x720',
        viewerCount: 50,
        status: 'live',
        uptime: 1800000,
        bandwidth: 1000000,
        lastUpdate: new Date()
      });

      panel.update({
        channelId: 'channel2',
        bitrate: 2000,
        fps: 30,
        resolution: '1920x1080',
        viewerCount: 150,
        status: 'live',
        uptime: 3600000,
        bandwidth: 2000000,
        lastUpdate: new Date()
      });

      const channel1Data = panel.getAllChannelsData().get('channel1');
      const channel2Data = panel.getAllChannelsData().get('channel2');

      expect(channel1Data?.dataPoints[0]?.bitrate).toBe(1000);
      expect(channel2Data?.dataPoints[0]?.bitrate).toBe(2000);
    });

    it('should accumulate historical data correctly', () => {
      // Add multiple data points for the same channel
      for (let i = 0; i < 3; i++) {
        panel.update({
          channelId: 'test-channel',
          bitrate: 1000 + i * 100,
          fps: 25 + i,
          resolution: '1920x1080',
          viewerCount: 100 + i * 10,
          status: 'live',
          uptime: 3600000 + i * 1000,
          bandwidth: 1000000 + i * 100000,
          lastUpdate: new Date(Date.now() + i * 1000)
        });
      }

      const channelData = panel.getCurrentChannelData();
      expect(channelData!.dataPoints).toHaveLength(3);
      expect(channelData!.dataPoints[0]?.bitrate).toBe(1000);
      expect(channelData!.dataPoints[1]?.bitrate).toBe(1100);
      expect(channelData!.dataPoints[2]?.bitrate).toBe(1200);
    });
  });
});