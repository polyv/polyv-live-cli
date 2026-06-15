/**
 * @fileoverview Unit tests for GridManager
 */

import { EventEmitter } from 'events';
import { GridManager } from './grid-manager';

// Mock blessed-contrib
jest.mock('blessed-contrib', () => ({
  grid: jest.fn(() => ({
    set: jest.fn(),
    screen: {
      render: jest.fn()
    }
  }))
}));

describe('GridManager', () => {
  let gridManager: GridManager;
  let eventBus: EventEmitter;
  let mockScreen: any;

  beforeEach(() => {
    eventBus = new EventEmitter();
    mockScreen = {
      render: jest.fn(),
      on: jest.fn(),
      removeAllListeners: jest.fn(),
      cols: 80,
      rows: 24,
      width: 120,
      height: 30
    };

    gridManager = new GridManager(mockScreen, eventBus, 12, 12);
  });

  afterEach(() => {
    gridManager.destroy();
  });

  describe('Constructor', () => {
    it('should create GridManager instance', () => {
      expect(gridManager).toBeInstanceOf(GridManager);
    });

    it('should initialize with custom dimensions', () => {
      const customGrid = new GridManager(mockScreen, eventBus, 6, 8);
      expect(customGrid).toBeInstanceOf(GridManager);
      customGrid.destroy();
    });
  });

  describe('Layout Management', () => {
    it('should register a layout', () => {
      const layout = {
        id: 'test-layout',
        name: 'test-layout',
        isBuiltIn: false,
        grid: { cols: 12, rows: 8, cellWidth: 10, cellHeight: 3, padding: 1 },
        responsive: true,
        minTerminalSize: { width: 80, height: 24 },
        components: []
      };

      expect(() => {
        gridManager.registerLayout(layout);
      }).not.toThrow();
    });

    it('should get available layouts', () => {
      const layouts = gridManager.getAvailableLayouts();
      expect(Array.isArray(layouts)).toBe(true);
      expect(layouts.length).toBeGreaterThan(0);
    });

    it('should get current layout', () => {
      const currentLayout = gridManager.getCurrentLayout();
      expect(typeof currentLayout).toBe('string');
    });

    it('should get layout config', () => {
      const config = gridManager.getLayoutConfig('default');
      expect(config).toBeDefined();
    });

    it('should handle switching to existing layout', () => {
      expect(() => {
        gridManager.setLayout('default');
      }).not.toThrow();
    });

    it('should handle switching to non-existent layout', () => {
      expect(() => {
        gridManager.setLayout('non-existent');
      }).toThrow();
    });
  });

  describe('Component Management', () => {
    it('should add component to grid', () => {
      const mockComponent = {
        getConfig: () => ({
          type: 'test',
          position: { x: 0, y: 0, width: 4, height: 4 },
          size: { minWidth: 2, minHeight: 2 },
          config: {},
          visible: true,
          priority: 1
        }),
        getWidget: jest.fn(),
        isVisible: () => true,
        destroy: jest.fn(),
        getState: () => ({ id: 'test-component' })
      } as any;

      expect(() => {
        gridManager.addComponent(mockComponent, { x: 0, y: 0, width: 4, height: 4 });
      }).not.toThrow();
    });

    it('should remove component from grid', () => {
      const mockComponent = {
        getConfig: () => ({
          type: 'test',
          position: { x: 0, y: 0, width: 4, height: 4 },
          size: { minWidth: 2, minHeight: 2 },
          config: {},
          visible: true,
          priority: 1
        }),
        getWidget: jest.fn(),
        isVisible: () => true,
        destroy: jest.fn(),
        getState: () => ({ id: 'test-component' })
      } as any;

      gridManager.addComponent(mockComponent, { x: 0, y: 0, width: 4, height: 4 });
      
      expect(() => {
        gridManager.removeComponent('test-component');
      }).not.toThrow();
    });
  });

  describe('Position Management', () => {
    it('should check if component can be placed', () => {
      const position = { x: 0, y: 0, width: 2, height: 2 };
      const result = gridManager.canPlaceComponent(position);
      expect(typeof result).toBe('boolean');
    });

    it('should get optimal position for component', () => {
      const size = { minWidth: 4, minHeight: 4 };
      const position = gridManager.getOptimalPosition(size);
      
      if (position) {
        expect(position).toHaveProperty('x');
        expect(position).toHaveProperty('y');
        expect(typeof position.x).toBe('number');
        expect(typeof position.y).toBe('number');
      }
    });

    it('should return position even when size is clamped to grid', () => {
      const size = { minWidth: 20, minHeight: 20 }; // Will be clamped to 12x12 grid
      const position = gridManager.getOptimalPosition(size);
      expect(position).not.toBeNull();
      if (position) {
        expect(position.width).toBe(12); // Clamped to grid width
        expect(position.height).toBe(12); // Clamped to grid height
      }
    });

    it('should return null when grid is full', () => {
      // Fill the entire grid first by adding a large component
      const mockComponent = {
        getConfig: () => ({
          type: 'test',
          position: { x: 0, y: 0, width: 12, height: 12 },
          size: { minWidth: 12, minHeight: 12 },
          config: {},
          visible: true,
          priority: 1
        }),
        getWidget: jest.fn(),
        isVisible: () => true,
        destroy: jest.fn(),
        getState: () => ({ id: 'big-component' })
      } as any;

      gridManager.addComponent(mockComponent, { x: 0, y: 0, width: 12, height: 12 });
      
      // Now try to find position for another component
      const size = { minWidth: 1, minHeight: 1 };
      const position = gridManager.getOptimalPosition(size);
      expect(position).toBeNull();
    });

    it('should get occupied cells', () => {
      const occupied = gridManager.getOccupiedCells();
      expect(Array.isArray(occupied)).toBe(true);
    });
  });

  describe('Grid Information', () => {
    it('should get grid instance', () => {
      const grid = gridManager.getGrid();
      expect(grid).toBeDefined();
    });

    it('should get grid size', () => {
      const size = gridManager.getGridSize();
      expect(size).toHaveProperty('rows');
      expect(size).toHaveProperty('cols');
      expect(typeof size.rows).toBe('number');
      expect(typeof size.cols).toBe('number');
    });
  });

  describe('Destruction', () => {
    it('should destroy grid manager', () => {
      expect(() => {
        gridManager.destroy();
      }).not.toThrow();
    });

    it('should handle multiple destroy calls', () => {
      gridManager.destroy();
      expect(() => {
        gridManager.destroy();
      }).not.toThrow();
    });
  });

  describe('Event Handling', () => {
    it('should emit events on layout change', (done) => {
      eventBus.once('layout:changed', (event) => {
        expect(event).toHaveProperty('layout');
        done();
      });

      gridManager.setLayout('default');
    });

    it('should emit events on component add', (done) => {
      eventBus.once('grid:componentAdded', (event) => {
        expect(event).toHaveProperty('componentId');
        done();
      });

      const mockComponent = {
        getConfig: () => ({
          type: 'test',
          position: { x: 0, y: 0, width: 2, height: 2 },
          size: { minWidth: 1, minHeight: 1 },
          config: {},
          visible: true,
          priority: 1
        }),
        getWidget: jest.fn(),
        isVisible: () => true,
        destroy: jest.fn(),
        getState: () => ({ id: 'test-component' })
      } as any;

      gridManager.addComponent(mockComponent, { x: 0, y: 0, width: 2, height: 2 });
    });

    it('should handle resize events', () => {
      jest.useFakeTimers();
      
      // Mock screen with on method but no resize handler initially
      const mockScreenWithResize = {
        ...mockScreen,
        on: jest.fn(),
        width: 100,
        height: 25
      };
      
      const gridManagerWithResize = new GridManager(mockScreenWithResize, eventBus, 12, 12);
      
      // Simulate resize event
      const resizeHandler = mockScreenWithResize.on.mock.calls.find((call: any) => call[0] === 'resize')?.[1];
      if (resizeHandler) {
        resizeHandler();
        
        // Fast forward timer
        jest.advanceTimersByTime(150);
      }
      
      jest.useRealTimers();
      gridManagerWithResize.destroy();
    });

    it('should handle screen without on method', () => {
      const screenWithoutOn = {
        render: jest.fn(),
        removeAllListeners: jest.fn(),
        cols: 80,
        rows: 24
      };

      expect(() => {
        const manager = new GridManager(screenWithoutOn, eventBus, 12, 12);
        manager.destroy();
      }).not.toThrow();
    });

    it('should handle component:created event', () => {
      const data = { componentId: 'test-component', type: 'test' };
      
      expect(() => {
        eventBus.emit('component:created', data);
      }).not.toThrow();
    });

    it('should handle component:destroyed event', () => {
      const data = { componentId: 'test-component' };
      
      expect(() => {
        eventBus.emit('component:destroyed', data);
      }).not.toThrow();
    });

    it('should handle layout:change event', () => {
      const data = { layout: 'default' };
      
      expect(() => {
        eventBus.emit('layout:change', data);
      }).not.toThrow();
    });
  });

  describe('Resize Handling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should handle resize with environment variables', () => {
      const originalWidth = process.env['POLYV_TERMINAL_WIDTH'];
      const originalHeight = process.env['POLYV_TERMINAL_HEIGHT'];
      
      process.env['POLYV_TERMINAL_WIDTH'] = '150';
      process.env['POLYV_TERMINAL_HEIGHT'] = '40';
      
      const emitSpy = jest.spyOn(eventBus, 'emit');
      
      // Trigger handleResize by calling it directly
      gridManager['handleResize']();
      jest.advanceTimersByTime(150);
      
      expect(emitSpy).toHaveBeenCalledWith('terminal:resize', expect.objectContaining({
        width: expect.any(Number),
        height: expect.any(Number)
      }));
      
      // Restore environment variables
      if (originalWidth !== undefined) {
        process.env['POLYV_TERMINAL_WIDTH'] = originalWidth;
      } else {
        delete process.env['POLYV_TERMINAL_WIDTH'];
      }
      if (originalHeight !== undefined) {
        process.env['POLYV_TERMINAL_HEIGHT'] = originalHeight;
      } else {
        delete process.env['POLYV_TERMINAL_HEIGHT'];
      }
    });

    it('should handle resize with invalid environment variables', () => {
      const originalWidth = process.env['POLYV_TERMINAL_WIDTH'];
      const originalHeight = process.env['POLYV_TERMINAL_HEIGHT'];
      
      process.env['POLYV_TERMINAL_WIDTH'] = 'invalid';
      process.env['POLYV_TERMINAL_HEIGHT'] = '0';
      
      const emitSpy = jest.spyOn(eventBus, 'emit');
      
      gridManager['handleResize']();
      jest.advanceTimersByTime(150);
      
      expect(emitSpy).toHaveBeenCalledWith('terminal:resize', expect.objectContaining({
        width: expect.any(Number),
        height: expect.any(Number)
      }));
      
      // Restore environment variables
      if (originalWidth !== undefined) {
        process.env['POLYV_TERMINAL_WIDTH'] = originalWidth;
      } else {
        delete process.env['POLYV_TERMINAL_WIDTH'];
      }
      if (originalHeight !== undefined) {
        process.env['POLYV_TERMINAL_HEIGHT'] = originalHeight;
      } else {
        delete process.env['POLYV_TERMINAL_HEIGHT'];
      }
    });

    it('should debounce multiple resize events', () => {
      const emitSpy = jest.spyOn(eventBus, 'emit');
      
      // Trigger multiple resize events
      gridManager['handleResize']();
      gridManager['handleResize']();
      gridManager['handleResize']();
      
      // Should not emit until timeout
      expect(emitSpy).not.toHaveBeenCalledWith('terminal:resize', expect.any(Object));
      
      // Fast forward past debounce timeout
      jest.advanceTimersByTime(150);
      
      // Should emit terminal:resize event
      expect(emitSpy).toHaveBeenCalledWith('terminal:resize', expect.any(Object));
    });

    it('should use screen dimensions when available and valid', () => {
      const screenWithDimensions = {
        ...mockScreen,
        width: 160,
        height: 50
      };
      
      const managerWithDimensions = new GridManager(screenWithDimensions, eventBus, 12, 12);
      const emitSpy = jest.spyOn(eventBus, 'emit');
      
      managerWithDimensions['handleResize']();
      jest.advanceTimersByTime(150);
      
      expect(emitSpy).toHaveBeenCalledWith('terminal:resize', {
        width: 160,
        height: 50
      });
      
      managerWithDimensions.destroy();
    });

    it('should ignore invalid screen dimensions', () => {
      const screenWithInvalidDimensions = {
        ...mockScreen,
        width: 1,
        height: 0
      };
      
      const managerWithInvalidDimensions = new GridManager(screenWithInvalidDimensions, eventBus, 12, 12);
      const emitSpy = jest.spyOn(eventBus, 'emit');
      
      managerWithInvalidDimensions['handleResize']();
      jest.advanceTimersByTime(150);
      
      expect(emitSpy).toHaveBeenCalledWith('terminal:resize', expect.objectContaining({
        width: expect.any(Number),
        height: expect.any(Number)
      }));
      
      managerWithInvalidDimensions.destroy();
    });
  });

  describe('Layout Registration', () => {
    it('should register custom layout', () => {
      const customLayout = {
        id: 'custom',
        name: 'custom',
        isBuiltIn: false,
        grid: { cols: 12, rows: 8, cellWidth: 10, cellHeight: 3, padding: 1 },
        responsive: true,
        minTerminalSize: { width: 60, height: 20 },
        components: [
          {
            type: 'status',
            position: { x: 0, y: 0, width: 6, height: 6 },
            size: { minWidth: 20, minHeight: 10 },
            config: {}
          }
        ]
      };

      gridManager.registerLayout(customLayout);
      
      const layouts = gridManager.getAvailableLayouts();
      expect(layouts).toContain('custom');
      
      const config = gridManager.getLayoutConfig('custom');
      expect(config).toEqual(customLayout);
    });

    it('should handle duplicate layout registration', () => {
      const layout = {
        id: 'duplicate',
        name: 'duplicate',
        isBuiltIn: false,
        grid: { cols: 12, rows: 8, cellWidth: 10, cellHeight: 3, padding: 1 },
        responsive: true,
        minTerminalSize: { width: 80, height: 24 },
        components: []
      };

      gridManager.registerLayout(layout);
      
      // Register again with same name
      const updatedLayout = {
        id: 'duplicate',
        name: 'duplicate',
        isBuiltIn: false,
        grid: { cols: 12, rows: 8, cellWidth: 10, cellHeight: 3, padding: 1 },
        responsive: true,
        minTerminalSize: { width: 100, height: 30 },
        components: []
      };

      gridManager.registerLayout(updatedLayout);
      
      const config = gridManager.getLayoutConfig('duplicate');
      expect(config?.minTerminalSize.width).toBe(100);
    });
  });
});