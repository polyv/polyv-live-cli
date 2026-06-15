/**
 * @fileoverview Unit tests for StatusComponent
 */

import { EventEmitter } from 'events';
import { StatusComponent, StatusComponentFactory } from './status.component';
import { ComponentConfig } from '../types/monitoring';

// Mock blessed
jest.mock('blessed', () => ({
  box: jest.fn(() => ({
    setContent: jest.fn(),
    destroy: jest.fn(),
    screen: {
      render: jest.fn()
    }
  }))
}));

describe('StatusComponent', () => {
  let statusComponent: StatusComponent;
  let eventBus: EventEmitter;
  let config: ComponentConfig;

  beforeEach(() => {
    eventBus = new EventEmitter();
    config = {
      type: 'status',
      position: { x: 0, y: 0, width: 40, height: 10 },
      size: { minWidth: 20, minHeight: 5 },
      config: {},
      visible: true,
      priority: 1
    };

    statusComponent = new StatusComponent(config, eventBus);
  });

  afterEach(() => {
    statusComponent.destroy();
  });

  describe('Constructor', () => {
    it('should create StatusComponent instance', () => {
      expect(statusComponent).toBeInstanceOf(StatusComponent);
    });
  });

  describe('update', () => {
    it('should update status with provided data', () => {
      const data = {
        status: 'Running',
        uptime: '5m 30s',
        layout: 'compact',
        components: '4'
      };

      expect(() => {
        statusComponent.update(data);
      }).not.toThrow();
    });

    it('should handle empty data', () => {
      expect(() => {
        statusComponent.update({});
      }).not.toThrow();
    });

    it('should handle null data', () => {
      expect(() => {
        statusComponent.update(null);
      }).not.toThrow();
    });
  });

  describe('render', () => {
    it('should render without throwing', () => {
      expect(() => {
        statusComponent.render();
      }).not.toThrow();
    });

    it('should handle render when destroyed', () => {
      statusComponent.destroy();
      expect(() => {
        statusComponent.render();
      }).not.toThrow();
    });
  });

  describe('formatStatus', () => {
    it('should format status data correctly', () => {
      const data = {
        status: 'Running',
        uptime: '10m',
        layout: 'grid',
        components: '6'
      };

      // Access private method via any cast for testing
      const result = (statusComponent as any).formatStatus(data);
      
      expect(result).toContain('PolyV Monitoring Dashboard');
      expect(result).toContain('Status: Running');
      expect(result).toContain('Uptime: 10m');
      expect(result).toContain('Layout: grid');
      expect(result).toContain('Components: 6');
    });

    it('should use default values when data is missing', () => {
      const result = (statusComponent as any).formatStatus({});
      
      expect(result).toContain('Status: Running');
      expect(result).toContain('Uptime: 0s');
      expect(result).toContain('Layout: default');
      expect(result).toContain('Components: 0');
    });
  });

  describe('error handling', () => {
    it('should handle errors during update', () => {
      const invalidData = { status: undefined, uptime: null };
      
      expect(() => {
        statusComponent.update(invalidData);
      }).not.toThrow();
    });

    it('should handle errors during render', () => {
      // Mock widget to throw error
      const mockWidget = {
        screen: {
          render: jest.fn(() => {
            throw new Error('Render error');
          })
        },
        destroy: jest.fn()
      };
      
      (statusComponent as any).widget = mockWidget;
      
      expect(() => {
        statusComponent.render();
      }).not.toThrow();
    });
  });

  describe('resize', () => {
    it('should handle resize operations', () => {
      const newSize = { minWidth: 50, minHeight: 15 };
      
      expect(() => {
        statusComponent.resize(newSize);
      }).not.toThrow();
    });
  });

  describe('state management', () => {
    it('should maintain component state', () => {
      const data = { status: 'Active', uptime: '1h' };
      statusComponent.update(data);
      
      expect(statusComponent.getState().lastUpdate).toBeDefined();
    });

    it('should handle multiple updates', () => {
      statusComponent.update({ status: 'Starting' });
      statusComponent.update({ status: 'Running' });
      statusComponent.update({ status: 'Stopping' });
      
      expect(statusComponent.getState().lastUpdate).toBeDefined();
    });
  });
});

describe('StatusComponentFactory', () => {
  it('should have correct type', () => {
    expect(StatusComponentFactory.type).toBe('status');
  });

  it('should create StatusComponent instance', () => {
    const eventBus = new EventEmitter();
    const config: ComponentConfig = {
      type: 'status',
      position: { x: 0, y: 0, width: 40, height: 10 },
      size: { minWidth: 20, minHeight: 5 },
      config: {},
      visible: true,
      priority: 1
    };

    const component = StatusComponentFactory.create(config, eventBus);
    expect(component).toBeInstanceOf(StatusComponent);
    
    component.destroy();
  });

  it('should handle factory creation with minimal config', () => {
    const eventBus = new EventEmitter();
    const minimalConfig: ComponentConfig = {
      type: 'status',
      position: { x: 0, y: 0, width: 20, height: 5 },
      size: { minWidth: 20, minHeight: 5 },
      config: {},
      visible: true,
      priority: 1
    };

    const component = StatusComponentFactory.create(minimalConfig, eventBus);
    expect(component).toBeInstanceOf(StatusComponent);
    component.destroy();
  });

  it('should handle factory creation with extended config', () => {
    const eventBus = new EventEmitter();
    const extendedConfig: ComponentConfig = {
      type: 'status',
      position: { x: 10, y: 10, width: 60, height: 20 },
      size: { minWidth: 40, minHeight: 10, maxWidth: 80, maxHeight: 30 },
      config: { theme: 'dark', showUptime: true },
      visible: true,
      priority: 2
    };

    const component = StatusComponentFactory.create(extendedConfig, eventBus);
    expect(component).toBeInstanceOf(StatusComponent);
    component.destroy();
  });
});