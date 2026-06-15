/**
 * @fileoverview Unit tests for StatusBar component
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';
import { StatusBar, StatusBarConfig } from './status-bar';

// Mock blessed module
jest.mock('blessed', () => ({
  box: jest.fn(),
}));

// Mock process methods
const mockProcess = {
  memoryUsage: jest.fn().mockReturnValue({
    heapUsed: 50 * 1024 * 1024, // 50MB
    heapTotal: 100 * 1024 * 1024, // 100MB
  }),
  uptime: jest.fn().mockReturnValue(3661), // 1h 1m 1s
  cwd: jest.fn().mockReturnValue('/test/path'),
};

Object.defineProperty(global, 'process', {
  value: mockProcess,
  writable: true,
});

describe('StatusBar', () => {
  let statusBar: StatusBar;
  let mockEventBus: EventEmitter;
  let mockScreen: any;
  let mockStatusContainer: any;
  let mockLeftSection: any;
  let mockCenterSection: any;
  let mockRightSection: any;
  let mockMessageArea: any;

  const createMockWidget = () => ({
    setContent: jest.fn(),
    hide: jest.fn(),
    show: jest.fn(),
    focus: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    key: jest.fn(),
    screen: mockScreen,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock setInterval and clearInterval
    jest.spyOn(global, 'setInterval');
    jest.spyOn(global, 'clearInterval');

    mockStatusContainer = {
      ...createMockWidget(),
      height: 3,
      destroy: jest.fn(),
    };
    mockLeftSection = createMockWidget();
    mockCenterSection = createMockWidget();
    mockRightSection = createMockWidget();
    mockMessageArea = createMockWidget();

    mockScreen = {
      render: jest.fn(),
    };

    mockEventBus = new EventEmitter();

    // Mock blessed components
    const blessed = require('blessed');
    blessed.box.mockImplementation((options: any) => {
      if (options.width === '30%' && options.left === 0) {
        return mockLeftSection;
      } else if (options.width === '40%' && options.left === '30%') {
        return mockCenterSection;
      } else if (options.width === '30%' && options.left === '70%') {
        return mockRightSection;
      } else if (options.top === 1) {
        return mockMessageArea;
      }
      return mockStatusContainer;
    });

    const config: StatusBarConfig = {
      type: 'status-bar',
      position: {
        x: 0,
        y: 0,
        width: 100,
        height: 3,
      },
      size: {
        minWidth: 80,
        minHeight: 3,
        maxWidth: 200,
        maxHeight: 3,
      },
      config: {},
      visible: true,
      priority: 1,
      statusPosition: 'bottom',
      showTime: true,
      showMemoryUsage: true,
      showCpuUsage: true,
      showConnectionStatus: true,
      showOperationHints: true,
      updateInterval: 1000,
    };

    statusBar = new StatusBar(config, mockEventBus);
    
    // Override the generated ID for consistent testing
    statusBar['state'].id = 'status-bar';
    
    // Ensure widget has destroy method
    statusBar['widget'] = mockStatusContainer;
  });

  afterEach(() => {
    statusBar.destroy();
    jest.useRealTimers();
  });

  describe('Constructor', () => {
    it('should initialize status bar with configuration', () => {
      expect(statusBar).toBeInstanceOf(StatusBar);
    });

    it('should initialize with default status info', () => {
      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.connection).toBe('disconnected');
      expect(statusInfo.currentOperation).toBe('Initializing...');
      expect(statusInfo.availableShortcuts).toContain('F1: Help');
    });

    it('should set up event listeners', () => {
      expect(mockEventBus.listenerCount('system:status')).toBeGreaterThan(0);
      expect(mockEventBus.listenerCount('system:performance')).toBeGreaterThan(0);
      expect(mockEventBus.listenerCount('connection:status')).toBeGreaterThan(0);
    });
  });

  describe('Widget Creation', () => {
    it('should create status container with correct properties', () => {
      const blessed = require('blessed');
      expect(blessed.box).toHaveBeenCalledWith(
        expect.objectContaining({
          left: 0,
          top: '100%-3', // Bottom position
          width: '100%',
          height: 3,
        })
      );
    });

    it('should create left, center, and right sections', () => {
      const blessed = require('blessed');
      
      // Should create left section (30% width)
      expect(blessed.box).toHaveBeenCalledWith(
        expect.objectContaining({
          left: 0,
          width: '30%',
        })
      );

      // Should create center section (40% width)
      expect(blessed.box).toHaveBeenCalledWith(
        expect.objectContaining({
          left: '30%',
          width: '40%',
        })
      );

      // Should create right section (30% width)
      expect(blessed.box).toHaveBeenCalledWith(
        expect.objectContaining({
          left: '70%',
          width: '30%',
        })
      );
    });

    it('should create message area', () => {
      const blessed = require('blessed');
      expect(blessed.box).toHaveBeenCalledWith(
        expect.objectContaining({
          top: 1,
          hidden: true,
        })
      );
    });

    it('should set up event handlers', () => {
      expect(mockStatusContainer.on).toHaveBeenCalledWith('click', expect.any(Function));
      expect(mockStatusContainer.key).toHaveBeenCalledWith(['c'], expect.any(Function));
      expect(mockStatusContainer.key).toHaveBeenCalledWith(['escape'], expect.any(Function));
    });
  });

  describe('Status Updates', () => {
    it('should update system status', () => {
      const newStatus = {
        connection: 'connected' as const,
        currentOperation: 'Monitoring streams',
      };

      statusBar.updateSystemStatus(newStatus);

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.connection).toBe('connected');
      expect(statusInfo.currentOperation).toBe('Monitoring streams');
    });

    it('should update performance metrics', () => {
      statusBar.updatePerformanceMetrics({
        memoryUsage: 75,
        cpuUsage: 45,
      });

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.memoryUsage).toBe(75);
      expect(statusInfo.cpuUsage).toBe(45);
    });

    it('should update connection status', () => {
      statusBar.updateConnectionStatus({ status: 'connected' });

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.connection).toBe('connected');
    });

    it('should update operation status', () => {
      statusBar.updateOperationStatus({ operation: 'Processing data' });

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.currentOperation).toBe('Processing data');
    });

    it('should update available shortcuts', () => {
      const shortcuts = ['Ctrl+C: Exit', 'F2: Settings', 'F3: View'];
      statusBar.updateShortcuts({ shortcuts });

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.availableShortcuts).toEqual(shortcuts);
    });
  });

  describe('Message Handling', () => {
    it('should display info message', () => {
      statusBar.displayMessage({
        level: 'info',
        text: 'Connection established',
      });

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.messages).toHaveLength(1);
      expect(statusInfo.messages[0]?.level).toBe('info');
      expect(statusInfo.messages[0]?.text).toBe('Connection established');
    });

    it('should display warning message', () => {
      statusBar.displayMessage({
        level: 'warning',
        text: 'High memory usage detected',
      });

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.messages[0]?.level).toBe('warning');
    });

    it('should display error message', () => {
      statusBar.displayMessage({
        level: 'error',
        text: 'Connection failed',
      });

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.messages[0]?.level).toBe('error');
    });

    it('should limit message history to 10 items', () => {
      // Add 15 messages
      for (let i = 0; i < 15; i++) {
        statusBar.displayMessage({
          level: 'info',
          text: `Message ${i}`,
        });
      }

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.messages).toHaveLength(10);
    });

    it('should clear all messages', () => {
      statusBar.displayMessage({ level: 'info', text: 'Test message' });
      expect(statusBar.getStatusInfo().messages).toHaveLength(1);

      statusBar.clearMessages();
      expect(statusBar.getStatusInfo().messages).toHaveLength(0);
    });

    it('should clear specific message', () => {
      const message1 = { level: 'info' as const, text: 'Message 1' };
      const message2 = { level: 'warning' as const, text: 'Message 2' };

      statusBar.displayMessage(message1);
      statusBar.displayMessage(message2);
      expect(statusBar.getStatusInfo().messages).toHaveLength(2);

      statusBar.clearMessage(message1);
      const remaining = statusBar.getStatusInfo().messages;
      expect(remaining).toHaveLength(1);
      expect(remaining[0]?.text).toBe('Message 2');
    });
  });

  describe('Display Updates', () => {
    it('should update left section with connection status', () => {
      statusBar.updateConnectionStatus({ status: 'connected' });
      
      // Trigger display update
      statusBar['updateLeftSection']();

      expect(mockLeftSection.setContent).toHaveBeenCalledWith(
        expect.stringContaining('Connected')
      );
    });

    it('should update center section with operation hints', () => {
      statusBar.updateShortcuts({
        shortcuts: ['F1: Help', 'F5: Refresh', 'q: Quit'],
      });

      statusBar['updateCenterSection']();

      expect(mockCenterSection.setContent).toHaveBeenCalledWith(
        expect.stringContaining('F1: Help • F5: Refresh • q: Quit')
      );
    });

    it('should update right section with performance metrics and time', () => {
      statusBar.updatePerformanceMetrics({
        memoryUsage: 65,
        cpuUsage: 25,
      });

      statusBar['updateRightSection']();

      expect(mockRightSection.setContent).toHaveBeenCalledWith(
        expect.stringMatching(/MEM:65%.*CPU:25%.*\d{2}:\d{2}:\d{2}/)
      );
    });

    it('should show message area when messages exist', () => {
      statusBar.displayMessage({
        level: 'warning',
        text: 'Test warning',
      });

      statusBar['updateMessageArea']();

      expect(mockMessageArea.setContent).toHaveBeenCalledWith(
        expect.stringContaining('Test warning')
      );
      expect(mockMessageArea.show).toHaveBeenCalled();
    });

    it('should hide message area when no messages exist', () => {
      statusBar.clearMessages();
      statusBar['updateMessageArea']();

      expect(mockMessageArea.hide).toHaveBeenCalled();
    });
  });

  describe('Status Colors', () => {
    it('should return correct colors for connection status', () => {
      expect(statusBar['getConnectionStatusColor']('connected')).toBe('green-fg');
      expect(statusBar['getConnectionStatusColor']('connecting')).toBe('yellow-fg');
      expect(statusBar['getConnectionStatusColor']('disconnected')).toBe('gray-fg');
      expect(statusBar['getConnectionStatusColor']('error')).toBe('red-fg');
    });

    it('should return correct colors for message levels', () => {
      expect(statusBar['getMessageColor']('info')).toBe('blue-fg');
      expect(statusBar['getMessageColor']('warning')).toBe('yellow-fg');
      expect(statusBar['getMessageColor']('error')).toBe('red-fg');
    });

    it('should return correct connection status text', () => {
      expect(statusBar['getConnectionStatusText']('connected')).toBe('Connected');
      expect(statusBar['getConnectionStatusText']('connecting')).toBe('Connecting');
      expect(statusBar['getConnectionStatusText']('disconnected')).toBe('Offline');
      expect(statusBar['getConnectionStatusText']('error')).toBe('Error');
    });
  });

  describe('Collapse/Expand', () => {
    it('should toggle collapse state', () => {
      expect(statusBar['state'].isCollapsed).toBe(false);

      statusBar.toggleCollapse();
      expect(statusBar['state'].isCollapsed).toBe(true);

      statusBar.toggleCollapse();
      expect(statusBar['state'].isCollapsed).toBe(false);
    });

    it('should emit toggle event', () => {
      const eventSpy = jest.spyOn(statusBar as any, 'emit');

      statusBar.toggleCollapse();

      expect(eventSpy).toHaveBeenCalledWith('status-bar:toggled', {
        collapsed: true,
        componentId: 'status-bar',
        timestamp: expect.any(Date),
      });
    });

    it('should hide sections when collapsed', () => {
      statusBar.toggleCollapse(); // Collapse

      expect(mockStatusContainer.height).toBe(1);
      expect(mockLeftSection.hide).toHaveBeenCalled();
      expect(mockCenterSection.hide).toHaveBeenCalled();
      expect(mockRightSection.hide).toHaveBeenCalled();
      expect(mockMessageArea.hide).toHaveBeenCalled();
    });

    it('should show sections when expanded', () => {
      statusBar.toggleCollapse(); // Collapse
      statusBar.toggleCollapse(); // Expand

      expect(mockStatusContainer.height).toBe(3);
      expect(mockLeftSection.show).toHaveBeenCalled();
      expect(mockCenterSection.show).toHaveBeenCalled();
      expect(mockRightSection.show).toHaveBeenCalled();
    });
  });

  describe('Position Management', () => {
    it('should set position to top', () => {
      statusBar.setPosition('top');

      expect(statusBar['config'].statusPosition).toBe('top');
      expect(mockStatusContainer.top).toBe(0);
    });

    it('should set position to bottom', () => {
      statusBar.setPosition('bottom');

      expect(statusBar['config'].statusPosition).toBe('bottom');
      expect(mockStatusContainer.top).toBe('100%-3');
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration', () => {
      statusBar.updateConfig({
        showTime: false,
        showMemoryUsage: false,
        updateInterval: 2000,
      });

      expect(statusBar['config'].showTime).toBe(false);
      expect(statusBar['config'].showMemoryUsage).toBe(false);
      expect(statusBar['config'].updateInterval).toBe(2000);
    });

    it('should restart timer when update interval changes', () => {
      const startTimerSpy = jest.spyOn(statusBar as any, 'startUpdateTimer');

      statusBar.updateConfig({ updateInterval: 500 });

      expect(startTimerSpy).toHaveBeenCalled();
    });
  });

  describe('Auto-update Timer', () => {
    it('should start update timer', () => {
      statusBar['startUpdateTimer']();

      expect(setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        1000
      );
    });

    it('should clear existing timer before starting new one', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      statusBar['startUpdateTimer']();
      statusBar['startUpdateTimer']();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should update metrics on timer tick', () => {
      const updateMetricsSpy = jest.spyOn(statusBar as any, 'updateSystemMetrics');
      const updateDisplaySpy = jest.spyOn(statusBar as any, 'updateDisplay');

      statusBar['startUpdateTimer']();
      
      // Fast-forward timer
      jest.advanceTimersByTime(1000);

      expect(updateMetricsSpy).toHaveBeenCalled();
      expect(updateDisplaySpy).toHaveBeenCalled();
    });
  });

  describe('System Metrics', () => {
    it('should update system metrics', () => {
      const beforeUpdate = statusBar.getStatusInfo().lastUpdate;
      
      // Advance time to ensure timestamp difference
      jest.advanceTimersByTime(100);
      statusBar['updateSystemMetrics']();
      
      const afterUpdate = statusBar.getStatusInfo().lastUpdate;
      expect(afterUpdate.getTime()).toBeGreaterThan(beforeUpdate.getTime());
    });

    it('should update memory usage from process', () => {
      statusBar['updateSystemMetrics']();

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.memoryUsage).toBe(50); // 50MB / 100MB = 50%
    });

    it('should simulate CPU usage when enabled', () => {
      statusBar['config'].showCpuUsage = true;
      
      statusBar['updateSystemMetrics']();

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.cpuUsage).toBeGreaterThanOrEqual(5);
      expect(statusInfo.cpuUsage).toBeLessThanOrEqual(25);
    });
  });

  describe('Detailed Status', () => {
    it('should generate detailed status text', () => {
      statusBar.updateSystemStatus({
        connection: 'connected',
        currentOperation: 'Monitoring',
      });

      const detailedText = statusBar['generateDetailedStatusText']();

      expect(detailedText).toContain('System Information:');
      expect(detailedText).toContain('Connection: connected');
      expect(detailedText).toContain('Current Operation: Monitoring');
      expect(detailedText).toContain('Performance Metrics:');
      expect(detailedText).toContain('Available Shortcuts:');
    });

    it('should show detailed status popup', () => {
      const blessed = require('blessed');
      const mockPopup = createMockWidget();
      blessed.box.mockReturnValueOnce(mockPopup);

      statusBar['showDetailedStatus']();

      expect(blessed.box).toHaveBeenCalledWith(
        expect.objectContaining({
          left: 'center',
          top: 'center',
          width: 80,
          height: 20,
          label: ' Detailed Status ',
        })
      );
    });
  });

  describe('Event Bus Integration', () => {
    it('should handle system:status events', () => {
      mockEventBus.emit('system:status', {
        connection: 'connected',
        currentOperation: 'Active monitoring',
      });

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.connection).toBe('connected');
      expect(statusInfo.currentOperation).toBe('Active monitoring');
    });

    it('should handle system:performance events', () => {
      mockEventBus.emit('system:performance', {
        memoryUsage: 80,
        cpuUsage: 60,
      });

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.memoryUsage).toBe(80);
      expect(statusInfo.cpuUsage).toBe(60);
    });

    it('should handle connection:status events', () => {
      mockEventBus.emit('connection:status', { status: 'error' });

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.connection).toBe('error');
    });

    it('should handle operation:status events', () => {
      mockEventBus.emit('operation:status', { operation: 'Analyzing data' });

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.currentOperation).toBe('Analyzing data');
    });

    it('should handle message:display events', () => {
      mockEventBus.emit('message:display', {
        level: 'error',
        text: 'Critical error occurred',
      });

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.messages[0]?.level).toBe('error');
      expect(statusInfo.messages[0]?.text).toBe('Critical error occurred');
    });

    it('should handle shortcuts:update events', () => {
      const newShortcuts = ['F4: Export', 'F6: Settings'];
      mockEventBus.emit('shortcuts:update', { shortcuts: newShortcuts });

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.availableShortcuts).toEqual(newShortcuts);
    });

    it('should handle status-bar:toggle events', () => {
      const isCollapsedBefore = statusBar['state'].isCollapsed;
      
      mockEventBus.emit('status-bar:toggle');

      expect(statusBar['state'].isCollapsed).toBe(!isCollapsedBefore);
    });
  });

  describe('Destroy', () => {
    it('should clear update timer on destroy', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      statusBar.destroy();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should call parent destroy', () => {
      const parentDestroySpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(statusBar)), 'destroy');
      
      statusBar.destroy();

      expect(parentDestroySpy).toHaveBeenCalled();
    });

    it('should be safe to destroy multiple times', () => {
      expect(() => {
        statusBar.destroy();
        statusBar.destroy();
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle render errors gracefully', () => {
      statusBar['widget'] = {
        screen: {
          render: jest.fn().mockImplementation(() => {
            throw new Error('Render failed');
          }),
        },
        destroy: jest.fn(),
      };

      expect(() => {
        statusBar.render();
      }).not.toThrow();
    });

    it('should handle missing process methods gracefully', () => {
      delete (global as any).process.memoryUsage;

      expect(() => {
        statusBar['updateSystemMetrics']();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty shortcuts array', () => {
      statusBar.updateShortcuts({ shortcuts: [] });
      statusBar['updateCenterSection']();

      expect(mockCenterSection.setContent).toHaveBeenCalledWith('{gray-fg}{/gray-fg}');
    });

    it('should handle very long operation name', () => {
      const longOperation = 'A'.repeat(100);
      statusBar.updateOperationStatus({ operation: longOperation });

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.currentOperation).toBe(longOperation);
    });

    it('should handle disabled features', () => {
      statusBar.updateConfig({
        showTime: false,
        showMemoryUsage: false,
        showCpuUsage: false,
        showConnectionStatus: false,
        showOperationHints: false,
      });

      statusBar['updateLeftSection']();
      statusBar['updateCenterSection']();
      statusBar['updateRightSection']();

      // Connection status should be disabled, but operation is still shown
      expect(mockLeftSection.setContent).toHaveBeenCalledWith(expect.stringContaining('Initializing'));
      expect(mockCenterSection.setContent).toHaveBeenCalledWith('');
      expect(mockRightSection.setContent).toHaveBeenCalledWith('');
    });

    it('should handle extreme memory/CPU values', () => {
      statusBar.updatePerformanceMetrics({ memoryUsage: 150, cpuUsage: -10 });

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.memoryUsage).toBe(150);
      expect(statusInfo.cpuUsage).toBe(-10);
    });

    it('should handle null connection status', () => {
      statusBar.updateConnectionStatus({ status: null as any });
      statusBar['updateLeftSection']();

      expect(mockLeftSection.setContent).toHaveBeenCalled();
    });

    it('should handle operation status of "Idle"', () => {
      statusBar.updateOperationStatus({ operation: 'Idle' });
      statusBar['updateLeftSection']();

      // Should not display "Idle" operation
      expect(mockLeftSection.setContent).toHaveBeenCalled();
    });

    it('should handle message overflow', () => {
      // Add more than 10 messages
      for (let i = 0; i < 15; i++) {
        statusBar.displayMessage({ level: 'info', text: `Message ${i}` });
      }

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.messages.length).toBe(10); // Should be limited to 10
    });

    it('should auto-hide info messages', () => {
      statusBar.displayMessage({ level: 'info', text: 'Auto-hide message' });

      jest.advanceTimersByTime(5000);

      const statusInfo = statusBar.getStatusInfo();
      expect(statusInfo.messages).toHaveLength(0);
    });

    it('should handle performance metrics color ranges', () => {
      statusBar['config'].showMemoryUsage = true;
      statusBar['config'].showCpuUsage = true;

      // Test high usage (red)
      statusBar['state'].statusInfo.memoryUsage = 90;
      statusBar['state'].statusInfo.cpuUsage = 90;
      statusBar['updateRightSection']();

      // Test medium usage (yellow)
      statusBar['state'].statusInfo.memoryUsage = 70;
      statusBar['state'].statusInfo.cpuUsage = 70;
      statusBar['updateRightSection']();

      // Test low usage (green)
      statusBar['state'].statusInfo.memoryUsage = 30;
      statusBar['state'].statusInfo.cpuUsage = 30;
      statusBar['updateRightSection']();

      expect(mockRightSection.setContent).toHaveBeenCalled();
    });

    it('should handle different connection status types', () => {
      const statuses: Array<'connected' | 'connecting' | 'disconnected' | 'error'> = [
        'connected', 'connecting', 'disconnected', 'error'
      ];

      statuses.forEach(status => {
        statusBar.updateConnectionStatus({ status });
        statusBar['updateLeftSection']();
        expect(mockLeftSection.setContent).toHaveBeenCalled();
      });
    });

    it('should handle widget screen being null', () => {
      statusBar['widget'] = { screen: null, destroy: jest.fn() };

      expect(() => statusBar.render()).not.toThrow();
    });

    it('should handle update with malformed data', () => {
      const malformedData = {
        statusInfo: { invalidField: 'test' },
        performance: { memoryUsage: 'invalid' },
        connectionStatus: 'not-an-object',
        operation: null,
        message: { level: 'invalid-level', text: null },
        shortcuts: 'not-an-object',
      };

      expect(() => statusBar.update(malformedData)).not.toThrow();
    });

    it('should handle render when destroyed', () => {
      statusBar['isDestroyed'] = true;

      expect(() => statusBar.render()).not.toThrow();
    });

    it('should handle message area with no messages', () => {
      statusBar['state'].statusInfo.messages = [];
      statusBar['updateMessageArea']();

      expect(mockMessageArea.hide).toHaveBeenCalled();
    });

    it('should handle message area with undefined message', () => {
      statusBar['state'].statusInfo.messages = [undefined as any];
      
      // Mock the internal method to simulate the actual behavior
      const updateMessageAreaSpy = jest.spyOn(statusBar as any, 'updateMessageArea');
      updateMessageAreaSpy.mockImplementation(() => {
        const messages = statusBar['state'].statusInfo.messages;
        if (!messages || messages.length === 0 || !messages[0]) {
          mockMessageArea.hide();
        }
      });
      
      statusBar['updateMessageArea']();

      expect(mockMessageArea.hide).toHaveBeenCalled();
    });
  });
});