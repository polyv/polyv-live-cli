import { EventEmitter } from 'events';
import { ComponentRegistry, ComponentFactory } from './component-registry';
import { BaseComponent } from './base.component';
import { ComponentConfig } from '../types/monitoring';

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
}));

// Test component implementation
class TestComponent extends BaseComponent {
  protected createWidget(): void {
    const blessed = require('blessed');
    this.widget = blessed.box({});
  }

  public render(): void {
    // Test implementation
  }

  public update(): void {
    // Test implementation
  }
}

// Test factory
const testFactory: ComponentFactory = {
  type: 'test',
  create: (config: ComponentConfig, eventBus: EventEmitter) => {
    return new TestComponent(config, eventBus);
  },
};

describe('ComponentRegistry', () => {
  let eventBus: EventEmitter;
  let registry: ComponentRegistry;

  beforeEach(() => {
    eventBus = new EventEmitter();
    registry = new ComponentRegistry(eventBus);
  });

  afterEach(() => {
    registry.destroy();
  });

  describe('factory management', () => {
    it('should register factory correctly', () => {
      registry.registerFactory(testFactory);

      expect(registry.hasFactory('test')).toBe(true);
      expect(registry.getRegisteredTypes()).toContain('test');
    });

    it('should not allow duplicate factory registration', () => {
      registry.registerFactory(testFactory);

      expect(() => {
        registry.registerFactory(testFactory);
      }).toThrow('Component factory for type \'test\' already registered');
    });

    it('should unregister factory correctly', () => {
      registry.registerFactory(testFactory);
      registry.unregisterFactory('test');

      expect(registry.hasFactory('test')).toBe(false);
      expect(registry.getRegisteredTypes()).not.toContain('test');
    });
  });

  describe('component creation', () => {
    beforeEach(() => {
      registry.registerFactory(testFactory);
    });

    it('should create component correctly', () => {
      const config: ComponentConfig = {
        type: 'test',
        position: { x: 0, y: 0, width: 10, height: 5 },
        size: { minWidth: 5, minHeight: 3 },
        config: {},
        visible: true,
        priority: 1,
      };

      const component = registry.createComponent(config);

      expect(component).toBeInstanceOf(TestComponent);
      expect(component.getState().type).toBe('test');
    });

    it('should handle factory creation errors', () => {
      const errorFactory: ComponentFactory = {
        type: 'error',
        create: () => {
          throw new Error('Factory creation failed');
        }
      };

      registry.registerFactory(errorFactory);

      const config: ComponentConfig = {
        type: 'error',
        position: { x: 0, y: 0, width: 10, height: 5 },
        size: { minWidth: 5, minHeight: 3 },
        config: {},
        visible: true,
        priority: 1,
      };

      expect(() => {
        registry.createComponent(config);
      }).toThrow('Factory creation failed');
    });

    it('should emit createError event on factory failure', () => {
      const errorFactory: ComponentFactory = {
        type: 'error',
        create: () => {
          throw new Error('Factory creation failed');
        }
      };

      registry.registerFactory(errorFactory);

      const emitSpy = jest.spyOn(eventBus, 'emit');

      const config: ComponentConfig = {
        type: 'error',
        position: { x: 0, y: 0, width: 10, height: 5 },
        size: { minWidth: 5, minHeight: 3 },
        config: {},
        visible: true,
        priority: 1,
      };

      try {
        registry.createComponent(config);
      } catch (error) {
        // Expected to throw
      }

      expect(emitSpy).toHaveBeenCalledWith('component:createError', expect.objectContaining({
        type: 'error',
        error: 'Factory creation failed',
        timestamp: expect.any(Date)
      }));
    });

    it('should handle non-Error exceptions in factory', () => {
      const errorFactory: ComponentFactory = {
        type: 'string-error',
        create: () => {
          throw 'String error';
        }
      };

      registry.registerFactory(errorFactory);

      const emitSpy = jest.spyOn(eventBus, 'emit');

      const config: ComponentConfig = {
        type: 'string-error',
        position: { x: 0, y: 0, width: 10, height: 5 },
        size: { minWidth: 5, minHeight: 3 },
        config: {},
        visible: true,
        priority: 1,
      };

      try {
        registry.createComponent(config);
      } catch (error) {
        // Expected to throw
      }

      expect(emitSpy).toHaveBeenCalledWith('component:createError', expect.objectContaining({
        type: 'string-error',
        error: 'Unknown error',
        timestamp: expect.any(Date)
      }));
    });

    it('should emit creation event', () => {
      const eventSpy = jest.fn();
      eventBus.on('component:created', eventSpy);

      const config: ComponentConfig = {
        type: 'test',
        position: { x: 0, y: 0, width: 10, height: 5 },
        size: { minWidth: 5, minHeight: 3 },
        config: {},
        visible: true,
        priority: 1,
      };

      const component = registry.createComponent(config);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          componentId: component.getState().id,
          type: 'test',
        })
      );
    });

    it('should throw error for unknown component type', () => {
      const config: ComponentConfig = {
        type: 'unknown',
        position: { x: 0, y: 0, width: 10, height: 5 },
        size: { minWidth: 5, minHeight: 3 },
        config: {},
        visible: true,
        priority: 1,
      };

      expect(() => {
        registry.createComponent(config);
      }).toThrow('No factory registered for component type \'unknown\'');
    });
  });

  describe('component management', () => {
    let component: BaseComponent;
    let config: ComponentConfig;

    beforeEach(() => {
      registry.registerFactory(testFactory);
      config = {
        type: 'test',
        position: { x: 0, y: 0, width: 10, height: 5 },
        size: { minWidth: 5, minHeight: 3 },
        config: {},
        visible: true,
        priority: 1,
      };
      component = registry.createComponent(config);
    });

    it('should retrieve component by ID', () => {
      const retrieved = registry.getComponent(component.getState().id);
      expect(retrieved).toBe(component);
    });

    it('should return undefined for non-existent component', () => {
      const retrieved = registry.getComponent('non-existent');
      expect(retrieved).toBeUndefined();
    });

    it('should get all components', () => {
      const allComponents = registry.getAllComponents();
      expect(allComponents).toHaveLength(1);
      expect(allComponents[0]).toBe(component);
    });

    it('should get components by type', () => {
      const testComponents = registry.getComponentsByType('test');
      expect(testComponents).toHaveLength(1);
      expect(testComponents[0]).toBe(component);

      const unknownComponents = registry.getComponentsByType('unknown');
      expect(unknownComponents).toHaveLength(0);
    });

    it('should get component states', () => {
      const states = registry.getComponentStates();
      expect(states).toHaveLength(1);
      expect(states[0]?.id).toBe(component.getState().id);
    });

    it('should remove component correctly', () => {
      const eventSpy = jest.fn();
      eventBus.on('component:removed', eventSpy);

      const componentId = component.getState().id;
      const result = registry.removeComponent(componentId);

      expect(result).toBe(true);
      expect(registry.getComponentCount()).toBe(0);
      
      // Check that removal event was emitted
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          componentId,
          type: 'test',
          timestamp: expect.any(Date),
        })
      );
    });

    it('should return false when removing non-existent component', () => {
      const result = registry.removeComponent('non-existent');
      expect(result).toBe(false);
    });

    it('should remove all components', () => {
      registry.createComponent(config);
      expect(registry.getComponentCount()).toBe(2);

      registry.removeAllComponents();

      expect(registry.getComponentCount()).toBe(0);
    });

    it('should handle component destroy errors during removal', () => {
      const errorComponent = new TestComponent(config, eventBus);
      errorComponent.destroy = jest.fn(() => {
        throw new Error('Destroy failed');
      });

      registry['components'].set('error-component', errorComponent);

      const emitSpy = jest.spyOn(eventBus, 'emit');
      const result = registry.removeComponent('error-component');

      expect(result).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith('component:removeError', expect.objectContaining({
        componentId: 'error-component',
        error: 'Destroy failed',
        timestamp: expect.any(Date)
      }));
    });

    it('should handle non-Error exceptions during removal', () => {
      const errorComponent = new TestComponent(config, eventBus);
      errorComponent.destroy = jest.fn(() => {
        throw 'String error';
      });

      registry['components'].set('error-component', errorComponent);

      const emitSpy = jest.spyOn(eventBus, 'emit');
      const result = registry.removeComponent('error-component');

      expect(result).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith('component:removeError', expect.objectContaining({
        componentId: 'error-component',
        error: 'Unknown error',
        timestamp: expect.any(Date)
      }));
    });
  });

  describe('health monitoring', () => {
    beforeEach(() => {
      registry.registerFactory(testFactory);
    });

    it('should provide health status', () => {
      const config: ComponentConfig = {
        type: 'test',
        position: { x: 0, y: 0, width: 10, height: 5 },
        size: { minWidth: 5, minHeight: 3 },
        config: {},
        visible: true,
        priority: 1,
      };

      registry.createComponent(config);
      registry.createComponent(config);

      const health = registry.getHealthStatus();

      expect(health.total).toBe(2);
      expect(health.running).toBe(2);
      expect(health.error).toBe(0);
      expect(health.initializing).toBe(0);
      expect(health.paused).toBe(0);
      expect(health.destroyed).toBe(0);
    });
  });

  describe('event handling', () => {
    it('should handle component destruction events', () => {
      registry.registerFactory(testFactory);

      const config: ComponentConfig = {
        type: 'test',
        position: { x: 0, y: 0, width: 10, height: 5 },
        size: { minWidth: 5, minHeight: 3 },
        config: {},
        visible: true,
        priority: 1,
      };

      const component = registry.createComponent(config);
      const componentId = component.getState().id;

      expect(registry.getComponentCount()).toBe(1);

      // Simulate component destruction event
      eventBus.emit('component:destroyed', { componentId });

      expect(registry.getComponentCount()).toBe(0);
    });
  });

  describe('destruction', () => {
    it('should clean up properly on destroy', () => {
      registry.registerFactory(testFactory);

      const config: ComponentConfig = {
        type: 'test',
        position: { x: 0, y: 0, width: 10, height: 5 },
        size: { minWidth: 5, minHeight: 3 },
        config: {},
        visible: true,
        priority: 1,
      };

      registry.createComponent(config);

      expect(registry.getComponentCount()).toBe(1);
      expect(registry.getRegisteredTypes()).toHaveLength(1);

      registry.destroy();

      expect(registry.getComponentCount()).toBe(0);
      expect(registry.getRegisteredTypes()).toHaveLength(0);
    });
  });
});