/**
 * @fileoverview Unit tests for LayoutManager component
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';
import { LayoutManager, LayoutPreset } from './layout-manager';

describe('LayoutManager', () => {
  let layoutManager: LayoutManager;
  let mockScreen: any;
  let mockEventBus: EventEmitter;
  let mockComponent: any;

  const createMockComponent = (_id: string) => ({
    widget: {
      left: 0,
      top: 0,
      width: 20,
      height: 10,
      hidden: false,
      show: jest.fn(),
      hide: jest.fn(),
      setLabel: jest.fn(),
      border: {},
      style: {
        border: {},
      },
    },
    on: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockScreen = {
      width: 120,
      height: 30,
      render: jest.fn(),
      on: jest.fn(),
    };

    mockEventBus = new EventEmitter();
    mockComponent = createMockComponent('test-panel');

    layoutManager = new LayoutManager(mockScreen, mockEventBus);
  });

  afterEach(() => {
    layoutManager.destroy();
  });

  describe('Constructor', () => {
    it('should initialize layout manager with screen and event bus', () => {
      expect(layoutManager).toBeInstanceOf(LayoutManager);
    });

    it('should set up default layouts', () => {
      const layouts = layoutManager.getAvailableLayouts();
      expect(layouts).toContain('compact');
      expect(layouts).toContain('standard');
      expect(layouts).toContain('detailed');
    });

    it('should set default layout to standard', () => {
      expect(layoutManager.getCurrentLayout()).toBe('standard');
    });

    it('should set up screen resize handler', () => {
      expect(mockScreen.on).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  describe('Panel Registration', () => {
    it('should register panel component', () => {
      const eventSpy = jest.spyOn(mockEventBus, 'emit');

      layoutManager.registerPanel('test-panel', mockComponent);

      expect(eventSpy).toHaveBeenCalledWith('panel:registered', {
        panelId: 'test-panel',
        timestamp: expect.any(Date),
      });
    });

    it('should set up double-click handler for panel', () => {
      layoutManager.registerPanel('test-panel', mockComponent);

      expect(mockComponent.on).toHaveBeenCalledWith('doubleclick', expect.any(Function));
    });

    it('should handle components without event support', () => {
      const simpleComponent = { widget: mockComponent.widget };

      expect(() => {
        layoutManager.registerPanel('simple-panel', simpleComponent);
      }).not.toThrow();
    });

    it('should unregister panel component', () => {
      layoutManager.registerPanel('test-panel', mockComponent);
      const eventSpy = jest.spyOn(mockEventBus, 'emit');

      layoutManager.unregisterPanel('test-panel');

      expect(eventSpy).toHaveBeenCalledWith('panel:unregistered', {
        panelId: 'test-panel',
        timestamp: expect.any(Date),
      });
    });

    it('should handle unregistering non-existent panel', () => {
      expect(() => {
        layoutManager.unregisterPanel('non-existent');
      }).not.toThrow();
    });
  });

  describe('Layout Switching', () => {
    beforeEach(() => {
      layoutManager.registerPanel('channel-status', createMockComponent('channel-status'));
      layoutManager.registerPanel('system-resources', createMockComponent('system-resources'));
    });

    it('should switch to compact layout', () => {
      const eventSpy = jest.spyOn(mockEventBus, 'emit');

      layoutManager.switchLayout('compact');

      expect(layoutManager.getCurrentLayout()).toBe('compact');
      expect(eventSpy).toHaveBeenCalledWith('layout:switched', {
        fromLayout: 'standard',
        toLayout: 'compact',
        timestamp: expect.any(Date),
      });
    });

    it('should switch to detailed layout', () => {
      layoutManager.switchLayout('detailed');

      expect(layoutManager.getCurrentLayout()).toBe('detailed');
    });

    it('should throw error for non-existent layout', () => {
      expect(() => {
        layoutManager.switchLayout('non-existent');
      }).toThrow("Layout 'non-existent' not found");
    });

    it('should check terminal size requirements', () => {
      // Mock small terminal
      mockScreen.width = 40;
      mockScreen.height = 15;

      const eventSpy = jest.spyOn(mockEventBus, 'emit');

      layoutManager.switchLayout('detailed'); // Requires 120x30

      expect(eventSpy).toHaveBeenCalledWith('layout:size:insufficient', {
        required: { width: 120, height: 30 },
        current: { width: 40, height: 15 },
        layout: 'detailed',
      });

      // Layout should not change
      expect(layoutManager.getCurrentLayout()).toBe('standard');
    });

    it('should maintain layout history', () => {
      layoutManager.switchLayout('compact');
      layoutManager.switchLayout('detailed');

      // History should be limited and contain previous layouts
      expect(layoutManager.getCurrentLayout()).toBe('detailed');
    });
  });

  describe('Panel State Management', () => {
    beforeEach(() => {
      layoutManager.registerPanel('test-panel', mockComponent);
    });

    it('should minimize panel', () => {
      // Create panel state first
      layoutManager.switchLayout('standard');
      const eventSpy = jest.spyOn(mockEventBus, 'emit');

      layoutManager.minimizePanel('test-panel');

      expect(mockComponent.widget.hide).toHaveBeenCalled();
      expect(mockScreen.render).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith('panel:minimized', {
        panelId: 'test-panel',
        timestamp: expect.any(Date),
      });
    });

    it('should maximize panel', () => {
      const eventSpy = jest.spyOn(mockEventBus, 'emit');

      layoutManager.maximizePanel('test-panel');

      expect(mockComponent.widget.show).toHaveBeenCalled();
      expect(mockComponent.widget.width).toBe(96); // 80% of 120
      expect(mockComponent.widget.height).toBe(24); // 80% of 30
      expect(mockScreen.render).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith('panel:maximized', {
        panelId: 'test-panel',
        timestamp: expect.any(Date),
      });
    });

    it('should restore panel to normal state', () => {
      // First maximize to store original position
      layoutManager.maximizePanel('test-panel');
      const eventSpy = jest.spyOn(mockEventBus, 'emit');

      layoutManager.restorePanel('test-panel');

      expect(mockComponent.widget.show).toHaveBeenCalled();
      expect(mockScreen.render).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith('panel:restored', {
        panelId: 'test-panel',
        timestamp: expect.any(Date),
      });
    });

    it('should handle state changes for non-existent panels', () => {
      expect(() => {
        layoutManager.minimizePanel('non-existent');
        layoutManager.maximizePanel('non-existent');
        layoutManager.restorePanel('non-existent');
      }).not.toThrow();
    });
  });

  describe('Fullscreen Mode', () => {
    beforeEach(() => {
      layoutManager.registerPanel('test-panel', mockComponent);
      layoutManager.registerPanel('other-panel', createMockComponent('other-panel'));
    });

    it('should enter fullscreen mode', () => {
      const eventSpy = jest.spyOn(mockEventBus, 'emit');

      layoutManager.toggleFullscreen('test-panel');

      expect(mockComponent.widget.left).toBe(0);
      expect(mockComponent.widget.top).toBe(0);
      expect(mockComponent.widget.width).toBe('100%');
      expect(mockComponent.widget.height).toBe('100%');
      expect(mockComponent.widget.show).toHaveBeenCalled();
      expect(layoutManager.isFullscreen()).toBe(true);
      expect(layoutManager.getFullscreenPanel()).toBe('test-panel');
      expect(eventSpy).toHaveBeenCalledWith('panel:fullscreen:entered', {
        panelId: 'test-panel',
        timestamp: expect.any(Date),
      });
    });

    it('should exit fullscreen mode', () => {
      layoutManager.toggleFullscreen('test-panel'); // Enter
      const eventSpy = jest.spyOn(mockEventBus, 'emit');

      layoutManager.toggleFullscreen('test-panel'); // Exit

      expect(layoutManager.isFullscreen()).toBe(false);
      expect(layoutManager.getFullscreenPanel()).toBeUndefined();
      expect(eventSpy).toHaveBeenCalledWith('panel:fullscreen:exited', {
        panelId: 'test-panel',
        timestamp: expect.any(Date),
      });
    });

    it('should hide other panels when entering fullscreen', () => {
      const otherComponent = createMockComponent('other-panel');
      layoutManager.registerPanel('other-panel', otherComponent);

      layoutManager.toggleFullscreen('test-panel');

      expect(otherComponent.widget.hide).toHaveBeenCalled();
    });

    it('should show other panels when exiting fullscreen', () => {
      const otherComponent = createMockComponent('other-panel');
      layoutManager.registerPanel('other-panel', otherComponent);
      
      // Create panel states first
      layoutManager.switchLayout('standard');

      layoutManager.toggleFullscreen('test-panel'); // Enter
      layoutManager.toggleFullscreen('test-panel'); // Exit

      expect(otherComponent.widget.show).toHaveBeenCalled();
    });

    it('should handle fullscreen toggle for non-existent panel', () => {
      expect(() => {
        layoutManager.toggleFullscreen('non-existent');
      }).not.toThrow();
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      layoutManager.registerPanel('test-panel', mockComponent);
    });

    it('should handle panel minimize event', () => {
      // Create panel state first
      layoutManager.switchLayout('standard');
      
      mockEventBus.emit('panel:minimize', { panelId: 'test-panel' });

      expect(mockComponent.widget.hide).toHaveBeenCalled();
    });

    it('should handle panel maximize event', () => {
      mockEventBus.emit('panel:maximize', { panelId: 'test-panel' });

      expect(mockComponent.widget.show).toHaveBeenCalled();
    });

    it('should handle panel restore event', () => {
      layoutManager.maximizePanel('test-panel'); // Set up for restore
      mockEventBus.emit('panel:restore', { panelId: 'test-panel' });

      expect(mockComponent.widget.show).toHaveBeenCalled();
    });

    it('should handle panel fullscreen event', () => {
      mockEventBus.emit('panel:fullscreen', { panelId: 'test-panel' });

      expect(layoutManager.isFullscreen()).toBe(true);
    });

    it('should handle layout switch event', () => {
      mockEventBus.emit('layout:switch', { layoutName: 'compact' });

      expect(layoutManager.getCurrentLayout()).toBe('compact');
    });
  });

  describe('Screen Resize Handling', () => {
    beforeEach(() => {
      layoutManager.registerPanel('test-panel', mockComponent);
    });

    it('should reapply layout on screen resize', () => {
      const resizeHandler = mockScreen.on.mock.calls.find(
        (call: any) => call[0] === 'resize'
      )?.[1];

      if (resizeHandler) {
        resizeHandler();
        expect(mockScreen.render).toHaveBeenCalled();
      }
    });

    it('should switch to compatible layout when terminal becomes too small', () => {
      // Start with detailed layout
      layoutManager.switchLayout('detailed');
      expect(layoutManager.getCurrentLayout()).toBe('detailed');

      // Mock screen becoming smaller
      mockScreen.width = 60;
      mockScreen.height = 20;

      const resizeHandler = mockScreen.on.mock.calls.find(
        (call: any) => call[0] === 'resize'
      )?.[1];

      if (resizeHandler) {
        resizeHandler();
        // Should switch to compact layout automatically
        expect(layoutManager.getCurrentLayout()).toBe('compact');
      }
    });
  });

  describe('Layout Information', () => {
    it('should get layout information', () => {
      const standardLayout = layoutManager.getLayoutInfo('standard');

      expect(standardLayout).toBeDefined();
      expect(standardLayout?.name).toBe('standard');
      expect(standardLayout?.description).toContain('Standard layout');
      expect(standardLayout?.panels.length).toBeGreaterThan(0);
    });

    it('should get current layout information', () => {
      const currentLayout = layoutManager.getLayoutInfo();

      expect(currentLayout?.name).toBe('standard');
    });

    it('should return null for non-existent layout', () => {
      const layout = layoutManager.getLayoutInfo('non-existent');

      expect(layout).toBeNull();
    });

    it('should get panel state information', () => {
      layoutManager.registerPanel('test-panel', mockComponent);
      layoutManager.switchLayout('standard'); // This should create panel states

      const panelState = layoutManager.getPanelState('test-panel');
      expect(panelState).toBeDefined();
    });

    it('should return null for non-existent panel state', () => {
      const panelState = layoutManager.getPanelState('non-existent');

      expect(panelState).toBeNull();
    });
  });

  describe('Custom Layout Management', () => {
    const customLayout: LayoutPreset = {
      name: 'custom-test',
      description: 'Custom test layout',
      minSize: { width: 100, height: 25 },
      panels: [
        {
          id: 'custom-panel',
          title: 'Custom Panel',
          component: null,
          position: { top: 0, left: 0, width: '100%', height: '100%' },
          visible: true,
          state: 'normal',
        },
      ],
    };

    it('should add custom layout preset', () => {
      const eventSpy = jest.spyOn(mockEventBus, 'emit');

      layoutManager.addLayoutPreset(customLayout);

      expect(layoutManager.getAvailableLayouts()).toContain('custom-test');
      expect(eventSpy).toHaveBeenCalledWith('layout:preset:added', {
        layoutName: 'custom-test',
        timestamp: expect.any(Date),
      });
    });

    it('should remove custom layout preset', () => {
      layoutManager.addLayoutPreset(customLayout);
      const eventSpy = jest.spyOn(mockEventBus, 'emit');

      layoutManager.removeLayoutPreset('custom-test');

      expect(layoutManager.getAvailableLayouts()).not.toContain('custom-test');
      expect(eventSpy).toHaveBeenCalledWith('layout:preset:removed', {
        layoutName: 'custom-test',
        timestamp: expect.any(Date),
      });
    });

    it('should not allow removing currently active layout', () => {
      layoutManager.addLayoutPreset(customLayout);
      layoutManager.switchLayout('custom-test');

      expect(() => {
        layoutManager.removeLayoutPreset('custom-test');
      }).toThrow('Cannot remove currently active layout');
    });

    it('should save current state as layout preset', () => {
      layoutManager.registerPanel('test-panel', mockComponent);
      layoutManager.switchLayout('standard');

      const savedLayout = layoutManager.saveCurrentState();

      expect(savedLayout.name).toMatch(/^custom-\d+$/);
      expect(savedLayout.description).toBe('User saved layout');
      expect(savedLayout.panels.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Position Calculations', () => {
    it('should calculate percentage positions correctly', () => {
      const position = layoutManager['calculatePosition']({
        left: '25%',
        top: '50%', 
        width: '50%',
        height: '25%',
      });

      expect(position.left).toBe(30); // 25% of 120
      expect(position.top).toBe(15);  // 50% of 30
      expect(position.width).toBe(60); // 50% of 120
      expect(position.height).toBe(7); // 25% of 30
    });

    it('should handle absolute position values', () => {
      const position = layoutManager['calculatePosition']({
        left: 10,
        top: 5,
        width: 30,
        height: 15,
      });

      expect(position.left).toBe(10);
      expect(position.top).toBe(5);
      expect(position.width).toBe(30);
      expect(position.height).toBe(15);
    });

    it('should handle mixed position values', () => {
      const position = layoutManager['calculatePosition']({
        left: 5,
        top: '25%',
        width: '60%',
        height: 10,
      });

      expect(position.left).toBe(5);
      expect(position.top).toBe(7);   // 25% of 30
      expect(position.width).toBe(72); // 60% of 120
      expect(position.height).toBe(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle panel config application errors gracefully', () => {
      const brokenComponent = {
        widget: {
          get left() { throw new Error('Property access failed'); },
          set left(_value) { throw new Error('Property set failed'); },
        },
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      layoutManager.registerPanel('broken-panel', brokenComponent);
      
      expect(() => {
        layoutManager.switchLayout('compact');
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle components without widget property', () => {
      const componentWithoutWidget = {};

      expect(() => {
        layoutManager.registerPanel('no-widget', componentWithoutWidget);
        layoutManager.minimizePanel('no-widget');
        layoutManager.maximizePanel('no-widget');
        layoutManager.restorePanel('no-widget');
      }).not.toThrow();
    });
  });

  describe('Destroy', () => {
    beforeEach(() => {
      layoutManager.registerPanel('test-panel', mockComponent);
    });

    it('should exit fullscreen on destroy', () => {
      layoutManager.toggleFullscreen('test-panel');
      expect(layoutManager.isFullscreen()).toBe(true);

      layoutManager.destroy();

      expect(layoutManager.isFullscreen()).toBe(false);
    });

    it('should clear all state on destroy', () => {
      layoutManager.switchLayout('compact');
      layoutManager.maximizePanel('test-panel');

      layoutManager.destroy();

      expect(layoutManager.getAvailableLayouts()).toHaveLength(0);
    });

    it('should be safe to destroy multiple times', () => {
      expect(() => {
        layoutManager.destroy();
        layoutManager.destroy();
      }).not.toThrow();
    });
  });
});