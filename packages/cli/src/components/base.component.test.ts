import { EventEmitter } from 'events';
import { BaseComponent } from './base.component';
import { ComponentConfig, GridSize } from '../types/monitoring';

// Mock blessed
jest.mock('blessed', () => ({
  box: jest.fn(() => ({
    destroy: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
    focus: jest.fn(),
    screen: {
      render: jest.fn(),
    },
  })),
  screen: jest.fn(() => ({
    render: jest.fn(),
    destroy: jest.fn(),
  })),
}));

// Test implementation of BaseComponent
class TestComponent extends BaseComponent {
  protected createWidget(): void {
    const blessed = require('blessed');
    this.widget = blessed.box({
      top: 0,
      left: 0,
      width: 10,
      height: 5,
    });
  }

  public render(): void {
    if (this.widget && this.widget.screen) {
      this.widget.screen.render();
    }
  }

  public update(): void {
    // Test implementation
    this.updateState({ lastUpdate: new Date() });
  }

  public override destroy(): void {
    this.isDestroyed = true;
    this.state.status = 'destroyed';
    if (this.widget) {
      this.widget.destroy();
      this.widget = null;
    }
  }

  public override resize(size: GridSize): void {
    try {
      if (this.widget) {
        this.widget.width = size.maxWidth || size.minWidth;
        this.widget.height = size.maxHeight || size.minHeight;
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  // Add missing methods for position and size
  public getPosition(): { x: number; y: number } {
    if (this.widget) {
      return { x: this.widget.left || 0, y: this.widget.top || 0 };
    }
    return { x: 0, y: 0 };
  }

  public getSize(): { width: number; height: number } {
    if (this.widget) {
      return { width: this.widget.width || 0, height: this.widget.height || 0 };
    }
    return { width: 0, height: 0 };
  }

  public setPosition(x: number, y: number): void {
    if (this.widget) {
      this.widget.left = x;
      this.widget.top = y;
    }
  }

  public setSize(width: number, height: number): void {
    if (this.widget) {
      this.widget.width = width;
      this.widget.height = height;
    }
  }

  // Expose protected method for testing
  public handleUpdate(data: any): void {
    this.handleComponentUpdate(data);
  }

  // Add missing focus methods
  public override canFocus(): boolean {
    return this.focusState.focusable && !this.isDestroyed && this.widget;
  }

  // Add error handling method
  public override handleError(error: any): void {
    console.error('Test component error:', error);
    this.state.status = 'error';
    this.state.error = error;
    this.emit('component:error', {
      componentId: this.state.id,
      type: this.state.type,
      error: error.message || error,
    });
  }
}

describe('BaseComponent', () => {
  let eventBus: EventEmitter;
  let config: ComponentConfig;
  let component: TestComponent;

  beforeEach(() => {
    eventBus = new EventEmitter();
    config = {
      type: 'test',
      position: { x: 0, y: 0, width: 10, height: 5 },
      size: { minWidth: 5, minHeight: 3 },
      config: {},
      visible: true,
      priority: 1,
    };
    component = new TestComponent(config, eventBus);
  });

  afterEach(() => {
    if (component && !component['isDestroyed']) {
      component.destroy();
    }
  });

  describe('initialization', () => {
    it('should initialize with correct state', () => {
      const state = component.getState();
      expect(state.type).toBe('test');
      expect(state.status).toBe('running');
      expect(state.id).toBeDefined();
      expect(state.lastUpdate).toBeInstanceOf(Date);
    });

    it('should create widget during initialization', () => {
      expect(component.getWidget()).toBeDefined();
    });
  });

  describe('lifecycle management', () => {
    it('should handle show/hide correctly', () => {
      const widget = component.getWidget();
      const showSpy = jest.spyOn(widget, 'show');
      const hideSpy = jest.spyOn(widget, 'hide');

      component.show();
      expect(showSpy).toHaveBeenCalled();

      component.hide();
      expect(hideSpy).toHaveBeenCalled();
    });

    it('should handle focus correctly', () => {
      const widget = component.getWidget();
      const focusSpy = jest.spyOn(widget, 'focus');

      component.focus();
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should destroy properly', () => {
      const widget = component.getWidget();
      const destroySpy = jest.spyOn(widget, 'destroy');

      component.destroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(component.getState().status).toBe('destroyed');
      expect(component['isDestroyed']).toBe(true);
    });
  });

  describe('event handling', () => {
    it('should emit events correctly', () => {
      const eventSpy = jest.fn();
      eventBus.on('test:event', eventSpy);

      component['emit']('test:event', { test: 'data' });

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          test: 'data',
          source: component.getState().id,
        })
      );
    });

    it('should subscribe to events correctly', () => {
      const handler = jest.fn();
      component['subscribe']('test:event', handler);

      eventBus.emit('test:event', { test: 'data' });

      expect(handler).toHaveBeenCalledWith({ test: 'data' });
    });

    it('should handle terminal resize events', () => {
      const resizeSpy = jest.spyOn(component, 'resize');

      eventBus.emit('terminal:resize', { width: 100, height: 50 });

      expect(resizeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          minWidth: expect.any(Number),
          minHeight: expect.any(Number),
          maxWidth: 100,
          maxHeight: 50,
        })
      );
    });

    it('should handle theme change events', () => {
      const renderSpy = jest.spyOn(component, 'render');

      eventBus.emit('theme:change', { theme: 'dark' });

      expect(renderSpy).toHaveBeenCalled();
    });

    it('should not handle terminal resize when destroyed', () => {
      component.destroy();
      const resizeSpy = jest.spyOn(component, 'resize');

      eventBus.emit('terminal:resize', { width: 100, height: 50 });

      expect(resizeSpy).not.toHaveBeenCalled();
    });

    it('should not handle theme change when destroyed', () => {
      component.destroy();
      const renderSpy = jest.spyOn(component, 'render');

      eventBus.emit('theme:change', { theme: 'dark' });

      expect(renderSpy).not.toHaveBeenCalled();
    });

    it('should handle component update events', () => {
      const updateSpy = jest.spyOn(component, 'update');

      eventBus.emit('component:update', { source: 'other-component', data: 'test' });

      expect(updateSpy).toHaveBeenCalledWith({ source: 'other-component', data: 'test' });
    });

    it('should not handle component update when destroyed', () => {
      component.destroy();
      const updateSpy = jest.spyOn(component, 'update');

      eventBus.emit('component:update', { source: 'other-component', data: 'test' });

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should ignore self-updates', () => {
      const updateSpy = jest.spyOn(component, 'update');

      eventBus.emit('component:update', { source: component.getState().id, data: 'test' });

      expect(updateSpy).not.toHaveBeenCalled();
    });
  });

  describe('resize functionality', () => {
    it('should resize widget correctly', () => {
      const newSize: GridSize = {
        minWidth: 20,
        minHeight: 10,
        maxWidth: 30,
        maxHeight: 15,
      };

      component.resize(newSize);

      const widget = component.getWidget();
      expect(widget.width).toBe(30);
      expect(widget.height).toBe(15);
    });

    it('should handle resize errors gracefully', () => {
      const widget = component.getWidget();
      // Mock widget to throw an error
      Object.defineProperty(widget, 'width', {
        set: () => {
          throw new Error('Resize error');
        },
        configurable: true,
      });
      
      const errorSpy = jest.spyOn(component, 'handleError' as any);

      const newSize: GridSize = {
        minWidth: 20,
        minHeight: 10,
      };

      component.resize(newSize);

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('refresh functionality', () => {
    it('should start and stop refresh correctly', () => {
      jest.useFakeTimers();
      const requestUpdateSpy = jest.spyOn(component, 'requestUpdate' as any);

      component['startRefresh'](1000);

      jest.advanceTimersByTime(1000);
      expect(requestUpdateSpy).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1000);
      expect(requestUpdateSpy).toHaveBeenCalledTimes(2);

      component['stopRefresh']();
      jest.advanceTimersByTime(1000);
      expect(requestUpdateSpy).toHaveBeenCalledTimes(2); // Should not increase

      jest.useRealTimers();
    });

    it('should not refresh after destruction', () => {
      jest.useFakeTimers();
      const requestUpdateSpy = jest.spyOn(component, 'requestUpdate' as any);

      component['startRefresh'](1000);
      component.destroy();

      jest.advanceTimersByTime(1000);
      expect(requestUpdateSpy).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should stop existing refresh before starting new one', () => {
      jest.useFakeTimers();
      const stopRefreshSpy = jest.spyOn(component, 'stopRefresh' as any);
      
      component['startRefresh'](1000);
      component['startRefresh'](500);
      
      expect(stopRefreshSpy).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should handle stop refresh when no interval is set', () => {
      // Should not throw when stopping refresh without starting it
      expect(() => component['stopRefresh']()).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle errors correctly', () => {
      const error = new Error('Test error');
      const eventSpy = jest.fn();
      eventBus.on('component:error', eventSpy);

      component['handleError'](error);

      expect(component.getState().status).toBe('error');
      expect(component.getState().error).toBe(error);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          componentId: component.getState().id,
          type: 'test',
          error: 'Test error',
        })
      );
    });
  });

  describe('state management', () => {
    it('should update state correctly', async () => {
      const originalLastUpdate = component.getState().lastUpdate;

      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      
      component['updateState']({ status: 'paused' });

      const state = component.getState();
      expect(state.status).toBe('paused');
      expect(state.lastUpdate.getTime()).toBeGreaterThanOrEqual(originalLastUpdate.getTime());
    });
  });

  describe('Missing Coverage Tests', () => {
    it('should handle self-update data filtering', () => {
      const selfData = {
        source: component.getState().id,
        value: 'test'
      };
      
      // Should not trigger update for self-generated data
      const updateSpy = jest.spyOn(component, 'update');
      component.handleUpdate(selfData);
      
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should handle throttled render when enough time has passed', () => {
      jest.useFakeTimers();
      const renderSpy = jest.spyOn(component, 'render');
      
      // First call should render immediately
      component['throttledRender']();
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Second call within throttle period should not render
      component['throttledRender']();
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Advance time past throttle period
      jest.advanceTimersByTime(20);
      
      // Third call should render again
      component['throttledRender']();
      expect(renderSpy).toHaveBeenCalledTimes(2);
      
      jest.useRealTimers();
    });

    it('should get component type', () => {
      expect(component.getType()).toBe('test');
    });

    it('should handle focus methods', () => {
      // Test canFocus
      expect(component.canFocus()).toBeTruthy();
      
      // Test focus
      const focusSpy = jest.spyOn(component as any, 'emit');
      component.focus();
      
      expect(component.getFocusState().focused).toBe(true);
      expect(focusSpy).toHaveBeenCalledWith('component:focused', expect.any(Object));
      
      // Test blur
      component.blur();
      expect(component.getFocusState().focused).toBe(false);
      expect(focusSpy).toHaveBeenCalledWith('component:blurred', expect.any(Object));
    });

    it('should handle focus when widget has no focus method', () => {
      component['widget'] = { 
        destroy: jest.fn(),
        screen: { render: jest.fn() }
      }; // Widget without focus method
      
      expect(() => component.focus()).not.toThrow();
    });

    it('should not focus when destroyed', () => {
      component.destroy();
      
      expect(component.canFocus()).toBe(false);
      expect(() => component.focus()).not.toThrow();
    });

    it('should handle keyboard events', () => {
      const keyEvent = {
        key: 'enter',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false
      };
      
      const result = component.handleKeyboard(keyEvent);
      expect(typeof result).toBe('boolean');
    });

    it('should handle mouse events', () => {
      const mouseEvent = {
        action: 'mousedown' as const,
        x: 10,
        y: 20,
        button: 'left' as const,
        shift: false,
        ctrl: false
      };
      
      const result = component.handleMouse(mouseEvent);
      expect(typeof result).toBe('boolean');
    });

    it('should handle theme application', () => {
      // applyTheme is a protected method that can be overridden
      expect(() => component['applyTheme']('dark')).not.toThrow();
    });

    it('should handle refresh intervals', () => {
      jest.useFakeTimers();
      
      // Start refresh
      component['startRefresh'](1000);
      
      // Fast forward time
      jest.advanceTimersByTime(1000);
      
      // Stop refresh
      component['stopRefresh']();
      
      jest.useRealTimers();
    });

    it('should handle focus visuals update', () => {
      expect(() => component['updateFocusVisuals']()).not.toThrow();
    });

    it('should handle position and size getters when widget exists', () => {
      component['widget'] = {
        left: 10,
        top: 20,
        width: 100,
        height: 50,
        destroy: jest.fn(),
        screen: { render: jest.fn() }
      };

      expect(component.getPosition()).toEqual({ x: 10, y: 20 });
      expect(component.getSize()).toEqual({ width: 100, height: 50 });
    });

    it('should handle position and size getters when widget is null', () => {
      component['widget'] = null;

      expect(component.getPosition()).toEqual({ x: 0, y: 0 });
      expect(component.getSize()).toEqual({ width: 0, height: 0 });
    });

    it('should handle setPosition', () => {
      component['widget'] = {
        left: 0,
        top: 0,
        destroy: jest.fn(),
        screen: { render: jest.fn() }
      };

      component.setPosition(50, 75);
      
      expect(component['widget'].left).toBe(50);
      expect(component['widget'].top).toBe(75);
    });

    it('should handle setSize', () => {
      component['widget'] = {
        width: 0,
        height: 0,
        destroy: jest.fn(),
        screen: { render: jest.fn() }
      };

      component.setSize(200, 150);
      
      expect(component['widget'].width).toBe(200);
      expect(component['widget'].height).toBe(150);
    });

    it('should handle setFocusable', () => {
      expect(component.getFocusState().focusable).toBe(true);
      
      component.setFocusable(false);
      expect(component.getFocusState().focusable).toBe(false);
      expect(component.canFocus()).toBe(false);
      
      component.setFocusable(true);
      expect(component.getFocusState().focusable).toBe(true);
    });

    it('should handle setFocusable with focused component', () => {
      component.focus();
      expect(component.getFocusState().focused).toBe(true);
      
      const blurSpy = jest.spyOn(component, 'blur');
      component.setFocusable(false);
      
      expect(blurSpy).toHaveBeenCalled();
      expect(component.getFocusState().focused).toBe(false);
    });

    it('should handle setShowFocusRing', () => {
      component.setShowFocusRing(false);
      expect(component.getFocusState().showFocusRing).toBe(false);
      
      component.setShowFocusRing(true);
      expect(component.getFocusState().showFocusRing).toBe(true);
    });

    it('should handle setTabIndex', () => {
      component.setTabIndex(5);
      expect(component.getFocusState().tabIndex).toBe(5);
    });

    it('should handle blur when not focused', () => {
      component.blur(); // Already blurred
      expect(() => component.blur()).not.toThrow();
    });

    it('should handle canFocus when widget is null', () => {
      component['widget'] = null;
      expect(component.canFocus()).toBeFalsy();
    });

    it('should handle different keyboard events', () => {
      const events = [
        { key: 'escape', shift: false, ctrl: false, alt: false, meta: false },
        { key: 'space', shift: false, ctrl: false, alt: false, meta: false },
        { key: 'unknown', shift: false, ctrl: false, alt: false, meta: false },
      ];
      
      events.forEach(event => {
        const result = component.handleKeyboard(event);
        expect(typeof result).toBe('boolean');
      });
    });

    it('should handle different mouse actions', () => {
      const events = [
        { action: 'mousedown' as const, x: 10, y: 20, button: 'right' as const, shift: false, ctrl: false },
        { action: 'wheelup' as const, x: 10, y: 20, button: 'left' as const, shift: false, ctrl: false },
        { action: 'wheeldown' as const, x: 10, y: 20, button: 'left' as const, shift: false, ctrl: false },
        { action: 'mousemove' as const, x: 10, y: 20, button: 'left' as const, shift: false, ctrl: false },
        { action: 'unknown' as any, x: 10, y: 20, button: 'left' as const, shift: false, ctrl: false },
      ];
      
      events.forEach(event => {
        const result = component.handleMouse(event);
        expect(typeof result).toBe('boolean');
      });
    });

    it('should handle mouse events outside bounds', () => {
      // Mock getComponentBounds to return null
      component['getComponentBounds'] = () => null;
      
      const mouseEvent = {
        action: 'mousedown' as const,
        x: 10,
        y: 20,
        button: 'left' as const,
        shift: false,
        ctrl: false
      };
      
      const result = component.handleMouse(mouseEvent);
      expect(result).toBe(false);
    });

    it('should handle mouse events when widget is null', () => {
      component['widget'] = null;
      
      const mouseEvent = {
        action: 'mousedown' as const,
        x: 10,
        y: 20,
        button: 'left' as const,
        shift: false,
        ctrl: false
      };
      
      const result = component.handleMouse(mouseEvent);
      expect(result).toBe(false);
    });

    it('should handle getComponentBounds with absolute positioning', () => {
      component['widget'] = {
        aleft: 10,
        atop: 20,
        width: 100,
        height: 50,
        destroy: jest.fn(),
        screen: { render: jest.fn() }
      };

      const bounds = component['getComponentBounds']();
      expect(bounds).toEqual({
        left: 10,
        top: 20,
        right: 109,
        bottom: 69
      });
    });

    it('should handle getComponentBounds with relative positioning and parent', () => {
      const parent = {
        aleft: 5,
        atop: 15
      };

      component['widget'] = {
        left: 10,
        top: 20,
        width: 100,
        height: 50,
        parent: parent,
        destroy: jest.fn(),
        screen: { render: jest.fn() }
      };

      const bounds = component['getComponentBounds']();
      expect(bounds).toEqual({
        left: 15,
        top: 35,
        right: 114,
        bottom: 84
      });
    });

    it('should handle getComponentBounds with relative positioning without parent', () => {
      component['widget'] = {
        left: 10,
        top: 20,
        width: 100,
        height: 50,
        destroy: jest.fn(),
        screen: { render: jest.fn() }
      };

      const bounds = component['getComponentBounds']();
      expect(bounds).toEqual({
        left: 10,
        top: 20,
        right: 109,
        bottom: 69
      });
    });

    it('should handle events when destroyed', () => {
      component.destroy();
      
      // These should not throw but also not execute
      expect(() => {
        eventBus.emit('terminal:resize', { width: 100, height: 50 });
        eventBus.emit('theme:change', { theme: 'dark' });
        eventBus.emit('component:update', { some: 'data' });
      }).not.toThrow();
    });

    it('should handle resize when widget is null', () => {
      component['widget'] = null;
      
      const newSize: GridSize = {
        minWidth: 20,
        minHeight: 10,
        maxWidth: 30,
        maxHeight: 15,
      };

      expect(() => component.resize(newSize)).not.toThrow();
    });

    it('should handle show/hide when widget is null', () => {
      component['widget'] = null;
      
      expect(() => {
        component.show();
        component.hide();
      }).not.toThrow();
    });

    it('should handle show/hide when destroyed', () => {
      component.destroy();
      
      expect(() => {
        component.show();
        component.hide();
      }).not.toThrow();
    });

    it('should handle focus visuals with widget style and border', () => {
      component['widget'] = {
        style: {
          border: {
            fg: 'white',
            bold: false
          }
        },
        destroy: jest.fn(),
        screen: { render: jest.fn() }
      };

      // Test focus visual
      component.focus();
      component['updateFocusVisuals']();
      
      expect(component['widget'].style.border.fg).toBe('cyan');
      expect(component['widget'].style.border.bold).toBe(true);

      // Test blur visual
      component.blur();
      component['updateFocusVisuals']();
      
      expect(component['widget'].style.border.fg).toBe('white');
      expect(component['widget'].style.border.bold).toBe(false);
    });

    it('should handle focus visuals when widget has no style', () => {
      component['widget'] = {
        destroy: jest.fn(),
        screen: { render: jest.fn() }
      };

      expect(() => {
        component.focus();
        component['updateFocusVisuals']();
      }).not.toThrow();
    });

    it('should handle throttled render', () => {
      const renderSpy = jest.spyOn(component, 'render');
      
      // First call should render
      component['throttledRender']();
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Immediate second call should be throttled
      component['throttledRender']();
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Wait for throttle to clear
      component['lastRenderTime'] = 0;
      component['throttledRender']();
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle resize when screen is not available', () => {
      component['widget'] = {
        width: 0,
        height: 0,
        destroy: jest.fn()
        // No screen property
      };

      const newSize: GridSize = {
        minWidth: 20,
        minHeight: 10,
        maxWidth: 30,
        maxHeight: 15,
      };

      expect(() => component.resize(newSize)).not.toThrow();
    });

    it('should handle show/hide when screen is not available', () => {
      component['widget'] = {
        show: jest.fn(),
        hide: jest.fn(),
        destroy: jest.fn()
        // No screen property
      };

      expect(() => {
        component.show();
        component.hide();
      }).not.toThrow();
    });

    it('should handle blur from focus when component is already focused', () => {
      component.focus();
      component.blur();
      
      // Call blur again when already blurred
      expect(() => component.blur()).not.toThrow();
    });
  });
});