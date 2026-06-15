import { EventEmitter } from 'events';
import { BaseComponent } from './base.component';
import { ComponentConfig, ComponentState } from '../types/monitoring';

export interface ComponentFactory {
  type: string;
  create(config: ComponentConfig, eventBus: EventEmitter): BaseComponent;
}

export class ComponentRegistry {
  private factories = new Map<string, ComponentFactory>();
  private components = new Map<string, BaseComponent>();
  private eventBus: EventEmitter;

  constructor(eventBus: EventEmitter) {
    this.eventBus = eventBus;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventBus.on('component:destroyed', (data) => {
      this.removeComponent(data.componentId);
    });
  }

  public registerFactory(factory: ComponentFactory): void {
    if (this.factories.has(factory.type)) {
      throw new Error(`Component factory for type '${factory.type}' already registered`);
    }
    
    this.factories.set(factory.type, factory);
  }

  public unregisterFactory(type: string): void {
    this.factories.delete(type);
  }

  public getRegisteredTypes(): string[] {
    return Array.from(this.factories.keys());
  }

  public hasFactory(type: string): boolean {
    return this.factories.has(type);
  }

  public createComponent(config: ComponentConfig): BaseComponent {
    const factory = this.factories.get(config.type);
    if (!factory) {
      throw new Error(`No factory registered for component type '${config.type}'`);
    }

    try {
      const component = factory.create(config, this.eventBus);
      this.components.set(component.getState().id, component);
      
      this.eventBus.emit('component:created', {
        componentId: component.getState().id,
        type: config.type,
        timestamp: new Date(),
      });
      
      return component;
    } catch (error) {
      this.eventBus.emit('component:createError', {
        type: config.type,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
      throw error;
    }
  }

  public getComponent(componentId: string): BaseComponent | undefined {
    return this.components.get(componentId);
  }

  public getAllComponents(): BaseComponent[] {
    return Array.from(this.components.values());
  }

  public getComponentsByType(type: string): BaseComponent[] {
    return this.getAllComponents().filter(component => 
      component.getState().type === type
    );
  }

  public getComponentStates(): ComponentState[] {
    return this.getAllComponents().map(component => component.getState());
  }

  public removeComponent(componentId: string): boolean {
    const component = this.components.get(componentId);
    if (!component) {
      return false;
    }

    try {
      // Capture state before destroying
      const componentType = component.getState().type;
      
      component.destroy();
      this.components.delete(componentId);
      
      this.eventBus.emit('component:removed', {
        componentId,
        type: componentType,
        timestamp: new Date(),
      });
      
      return true;
    } catch (error) {
      this.eventBus.emit('component:removeError', {
        componentId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
      return false;
    }
  }

  public removeAllComponents(): void {
    const componentIds = Array.from(this.components.keys());
    
    for (const componentId of componentIds) {
      this.removeComponent(componentId);
    }
  }

  public getComponentCount(): number {
    return this.components.size;
  }

  public getHealthStatus(): {
    total: number;
    running: number;
    error: number;
    initializing: number;
    paused: number;
    destroyed: number;
  } {
    const states = this.getComponentStates();
    
    return {
      total: states.length,
      running: states.filter(s => s.status === 'running').length,
      error: states.filter(s => s.status === 'error').length,
      initializing: states.filter(s => s.status === 'initializing').length,
      paused: states.filter(s => s.status === 'paused').length,
      destroyed: states.filter(s => s.status === 'destroyed').length,
    };
  }

  public destroy(): void {
    this.removeAllComponents();
    this.factories.clear();
    this.eventBus.removeAllListeners();
  }
}