/**
 * @fileoverview Layout manager for panel switching and layout management
 * @author Development Team  
 * @since 1.0.0
 */

// Layout manager doesn't need blessed directly - components handle their own widgets
import { EventEmitter } from 'events';

/**
 * Panel configuration interface
 */
export interface PanelConfig {
  /** Panel identifier */
  id: string;
  /** Panel title */
  title: string;
  /** Panel component instance */
  component: any;
  /** Panel position in layout */
  position: {
    top: number | string;
    left: number | string;
    width: number | string;
    height: number | string;
  };
  /** Panel z-index for overlapping */
  zIndex?: number;
  /** Whether panel is resizable */
  resizable?: boolean;
  /** Whether panel is movable */
  movable?: boolean;
  /** Panel border style */
  border?: {
    type?: string;
    fg?: string;
    bg?: string;
  };
  /** Panel visibility */
  visible?: boolean;
  /** Panel state (minimized, maximized, normal) */
  state?: 'minimized' | 'maximized' | 'normal' | 'fullscreen';
}

/**
 * Layout preset interface
 */
export interface LayoutPreset {
  /** Layout name */
  name: string;
  /** Layout description */
  description: string;
  /** Panel configurations for this layout */
  panels: PanelConfig[];
  /** Minimum terminal size required */
  minSize: {
    width: number;
    height: number;
  };
}

/**
 * Layout state interface
 */
export interface LayoutState {
  /** Current layout name */
  currentLayout: string;
  /** Panel states */
  panelStates: Map<string, PanelConfig>;
  /** Fullscreen panel if any */
  fullscreenPanel?: string;
  /** Layout history for undo */
  history: string[];
}

/**
 * Layout manager for panel switching and layout management
 */
export class LayoutManager {
  private screen: any;
  private eventBus: EventEmitter;
  private layouts: Map<string, LayoutPreset> = new Map();
  private currentState: LayoutState;
  private panels: Map<string, any> = new Map();
  private originalPositions: Map<string, PanelConfig> = new Map();

  constructor(screen: any, eventBus: EventEmitter) {
    this.screen = screen;
    this.eventBus = eventBus;
    this.currentState = {
      currentLayout: 'default',
      panelStates: new Map(),
      history: [],
    };

    this.initializeDefaultLayouts();
    this.setupEventHandlers();
  }

  /**
   * Initialize default layout presets
   */
  private initializeDefaultLayouts(): void {
    // Compact layout - minimal space usage
    this.layouts.set('compact', {
      name: 'compact',
      description: 'Compact layout for small terminals',
      minSize: { width: 60, height: 20 },
      panels: [
        {
          id: 'main-status',
          title: 'Status',
          component: null,
          position: { top: 0, left: 0, width: '100%', height: '50%' },
          border: { type: 'line', fg: 'cyan' },
          visible: true,
          state: 'normal',
        },
        {
          id: 'system-info',
          title: 'System',
          component: null,
          position: { top: '50%', left: 0, width: '100%', height: '50%' },
          border: { type: 'line', fg: 'yellow' },
          visible: true,
          state: 'normal',
        },
      ],
    });

    // Standard layout - balanced view
    this.layouts.set('standard', {
      name: 'standard',
      description: 'Standard layout with balanced panels',
      minSize: { width: 80, height: 24 },
      panels: [
        {
          id: 'channel-status',
          title: 'Channel Status',
          component: null,
          position: { top: 0, left: 0, width: '60%', height: '60%' },
          border: { type: 'line', fg: 'cyan' },
          visible: true,
          state: 'normal',
        },
        {
          id: 'system-resources',
          title: 'System Resources',
          component: null,
          position: { top: 0, left: '60%', width: '40%', height: '60%' },
          border: { type: 'line', fg: 'yellow' },
          visible: true,
          state: 'normal',
        },
        {
          id: 'stream-metrics',
          title: 'Stream Metrics',
          component: null,
          position: { top: '60%', left: 0, width: '50%', height: '40%' },
          border: { type: 'line', fg: 'green' },
          visible: true,
          state: 'normal',
        },
        {
          id: 'activity-log',
          title: 'Activity Log',
          component: null,
          position: { top: '60%', left: '50%', width: '50%', height: '40%' },
          border: { type: 'line', fg: 'magenta' },
          visible: true,
          state: 'normal',
        },
      ],
    });

    // Detailed layout - maximum information
    this.layouts.set('detailed', {
      name: 'detailed',
      description: 'Detailed layout with all panels visible',
      minSize: { width: 120, height: 30 },
      panels: [
        {
          id: 'channel-status',
          title: 'Channel Status',
          component: null,
          position: { top: 0, left: 0, width: '40%', height: '50%' },
          border: { type: 'line', fg: 'cyan' },
          visible: true,
          state: 'normal',
        },
        {
          id: 'stream-metrics',
          title: 'Stream Metrics',
          component: null,
          position: { top: 0, left: '40%', width: '30%', height: '50%' },
          border: { type: 'line', fg: 'green' },
          visible: true,
          state: 'normal',
        },
        {
          id: 'system-resources',
          title: 'System Resources',
          component: null,
          position: { top: 0, left: '70%', width: '30%', height: '50%' },
          border: { type: 'line', fg: 'yellow' },
          visible: true,
          state: 'normal',
        },
        {
          id: 'activity-log',
          title: 'Activity Log',
          component: null,
          position: { top: '50%', left: 0, width: '60%', height: '50%' },
          border: { type: 'line', fg: 'magenta' },
          visible: true,
          state: 'normal',
        },
        {
          id: 'performance-monitor',
          title: 'Performance',
          component: null,
          position: { top: '50%', left: '60%', width: '40%', height: '50%' },
          border: { type: 'line', fg: 'red' },
          visible: true,
          state: 'normal',
        },
      ],
    });

    // Set default layout
    this.currentState.currentLayout = 'standard';
  }

  /**
   * Set up event handlers
   */
  private setupEventHandlers(): void {
    // Handle screen resize
    this.screen.on('resize', () => {
      this.handleScreenResize();
    });

    // Handle panel events
    this.eventBus.on('panel:minimize', (data: any) => {
      this.minimizePanel(data.panelId);
    });

    this.eventBus.on('panel:maximize', (data: any) => {
      this.maximizePanel(data.panelId);
    });

    this.eventBus.on('panel:restore', (data: any) => {
      this.restorePanel(data.panelId);
    });

    this.eventBus.on('panel:fullscreen', (data: any) => {
      this.toggleFullscreen(data.panelId);
    });

    this.eventBus.on('layout:switch', (data: any) => {
      this.switchLayout(data.layoutName);
    });
  }

  /**
   * Register a panel component
   */
  public registerPanel(panelId: string, component: any): void {
    this.panels.set(panelId, component);
    
    // Set up panel-specific event handlers
    if (component && typeof component.on === 'function') {
      component.on('doubleclick', () => {
        this.toggleFullscreen(panelId);
      });
    }

    this.eventBus.emit('panel:registered', {
      panelId,
      timestamp: new Date(),
    });
  }

  /**
   * Unregister a panel component
   */
  public unregisterPanel(panelId: string): void {
    const component = this.panels.get(panelId);
    if (component) {
      this.panels.delete(panelId);
      this.currentState.panelStates.delete(panelId);
      
      this.eventBus.emit('panel:unregistered', {
        panelId,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Switch to a different layout
   */
  public switchLayout(layoutName: string): void {
    if (!this.layouts.has(layoutName)) {
      throw new Error(`Layout '${layoutName}' not found`);
    }

    const layout = this.layouts.get(layoutName)!;
    
    // Check if terminal size meets minimum requirements
    const terminalSize = this.getTerminalSize();
    if (terminalSize.width < layout.minSize.width || 
        terminalSize.height < layout.minSize.height) {
      this.eventBus.emit('layout:size:insufficient', {
        required: layout.minSize,
        current: terminalSize,
        layout: layoutName,
      });
      return;
    }

    // Save current state to history
    this.currentState.history.push(this.currentState.currentLayout);
    if (this.currentState.history.length > 10) {
      this.currentState.history.shift(); // Limit history size
    }

    // Apply new layout
    this.currentState.currentLayout = layoutName;
    this.applyLayout(layout);

    this.eventBus.emit('layout:switched', {
      fromLayout: this.currentState.history[this.currentState.history.length - 1],
      toLayout: layoutName,
      timestamp: new Date(),
    });
  }

  /**
   * Apply layout configuration
   */
  private applyLayout(layout: LayoutPreset): void {
    // Store current panel states for restoration
    this.storeCurrentStates();

    // Apply panel configurations
    layout.panels.forEach(panelConfig => {
      const component = this.panels.get(panelConfig.id);
      if (component) {
        this.applyPanelConfig(panelConfig, component);
        this.currentState.panelStates.set(panelConfig.id, { ...panelConfig });
      }
    });

    // Hide panels not in current layout
    this.panels.forEach((_component, panelId) => {
      if (!layout.panels.find(p => p.id === panelId)) {
        this.hidePanel(panelId);
      }
    });

    this.screen.render();
  }

  /**
   * Apply panel configuration to component
   */
  private applyPanelConfig(config: PanelConfig, component: any): void {
    try {
      if (component.widget) {
        // Calculate actual positions from percentages
        const position = this.calculatePosition(config.position);
        
        component.widget.left = position.left;
        component.widget.top = position.top;
        component.widget.width = position.width;
        component.widget.height = position.height;

        // Apply border style
        if (config.border) {
          component.widget.border = {
            type: config.border.type || 'line',
          };
          if (component.widget.style) {
            component.widget.style.border = {
              fg: config.border.fg || 'white',
              bg: config.border.bg || 'black',
            };
          }
        }

        // Set visibility
        if (config.visible !== false) {
          component.widget.show();
        } else {
          component.widget.hide();
        }

        // Set title
        if (config.title && component.widget.setLabel) {
          component.widget.setLabel(` ${config.title} `);
        }
      }
    } catch (error) {
      console.error(`Failed to apply panel config for ${config.id}:`, error);
    }
  }

  /**
   * Calculate actual positions from percentage values
   */
  private calculatePosition(position: PanelConfig['position']): {
    left: number;
    top: number;
    width: number;
    height: number;
  } {
    const screenSize = this.getTerminalSize();

    const calculateValue = (value: number | string, dimension: 'width' | 'height'): number => {
      if (typeof value === 'string' && value.endsWith('%')) {
        const percentage = parseInt(value) / 100;
        return Math.floor(percentage * screenSize[dimension]);
      }
      return typeof value === 'number' ? value : parseInt(String(value));
    };

    return {
      left: calculateValue(position.left, 'width'),
      top: calculateValue(position.top, 'height'),
      width: calculateValue(position.width, 'width'),
      height: calculateValue(position.height, 'height'),
    };
  }

  /**
   * Toggle panel fullscreen mode
   */
  public toggleFullscreen(panelId: string): void {
    const component = this.panels.get(panelId);
    if (!component) return;

    if (this.currentState.fullscreenPanel === panelId) {
      // Exit fullscreen
      this.exitFullscreen();
    } else {
      // Enter fullscreen
      this.enterFullscreen(panelId);
    }
  }

  /**
   * Enter fullscreen mode for panel
   */
  private enterFullscreen(panelId: string): void {
    const component = this.panels.get(panelId);
    if (!component || !component.widget) return;

    // Store original position
    this.originalPositions.set(panelId, {
      id: panelId,
      title: '',
      component,
      position: {
        left: component.widget.left,
        top: component.widget.top,
        width: component.widget.width,
        height: component.widget.height,
      },
    });

    // Hide other panels
    this.panels.forEach((otherComponent, otherId) => {
      if (otherId !== panelId && otherComponent.widget) {
        otherComponent.widget.hide();
      }
    });

    // Make panel fullscreen
    component.widget.left = 0;
    component.widget.top = 0;
    component.widget.width = '100%';
    component.widget.height = '100%';
    component.widget.show();

    this.currentState.fullscreenPanel = panelId;
    this.screen.render();

    this.eventBus.emit('panel:fullscreen:entered', {
      panelId,
      timestamp: new Date(),
    });
  }

  /**
   * Exit fullscreen mode
   */
  private exitFullscreen(): void {
    if (!this.currentState.fullscreenPanel) return;

    const panelId = this.currentState.fullscreenPanel;
    const component = this.panels.get(panelId);
    const originalPos = this.originalPositions.get(panelId);

    if (component && component.widget && originalPos) {
      // Restore original position
      component.widget.left = originalPos.position.left;
      component.widget.top = originalPos.position.top;
      component.widget.width = originalPos.position.width;
      component.widget.height = originalPos.position.height;
    }

    // Show other panels
    this.panels.forEach((otherComponent, otherId) => {
      if (otherId !== panelId && otherComponent.widget) {
        const panelState = this.currentState.panelStates.get(otherId);
        if (panelState && panelState.visible !== false) {
          otherComponent.widget.show();
        }
      }
    });

    this.currentState.fullscreenPanel = undefined as any;
    this.originalPositions.delete(panelId);
    this.screen.render();

    this.eventBus.emit('panel:fullscreen:exited', {
      panelId,
      timestamp: new Date(),
    });
  }

  /**
   * Minimize panel
   */
  public minimizePanel(panelId: string): void {
    const component = this.panels.get(panelId);
    if (!component || !component.widget) return;

    // Store original position
    const panelState = this.currentState.panelStates.get(panelId);
    if (panelState) {
      panelState.state = 'minimized';
      component.widget.hide();
      
      this.screen.render();
      
      this.eventBus.emit('panel:minimized', {
        panelId,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Maximize panel
   */
  public maximizePanel(panelId: string): void {
    const component = this.panels.get(panelId);
    if (!component || !component.widget) return;

    // Store original position if not already stored
    if (!this.originalPositions.has(panelId)) {
      this.originalPositions.set(panelId, {
        id: panelId,
        title: '',
        component,
        position: {
          left: component.widget.left,
          top: component.widget.top,
          width: component.widget.width,
          height: component.widget.height,
        },
      });
    }

    // Maximize to 80% of screen
    const screenSize = this.getTerminalSize();
    component.widget.left = Math.floor(screenSize.width * 0.1);
    component.widget.top = Math.floor(screenSize.height * 0.1);
    component.widget.width = Math.floor(screenSize.width * 0.8);
    component.widget.height = Math.floor(screenSize.height * 0.8);
    component.widget.show();

    const panelState = this.currentState.panelStates.get(panelId);
    if (panelState) {
      panelState.state = 'maximized';
    }

    this.screen.render();

    this.eventBus.emit('panel:maximized', {
      panelId,
      timestamp: new Date(),
    });
  }

  /**
   * Restore panel to normal state
   */
  public restorePanel(panelId: string): void {
    const component = this.panels.get(panelId);
    if (!component || !component.widget) return;

    const originalPos = this.originalPositions.get(panelId);
    if (originalPos) {
      // Restore original position
      component.widget.left = originalPos.position.left;
      component.widget.top = originalPos.position.top;
      component.widget.width = originalPos.position.width;
      component.widget.height = originalPos.position.height;
      component.widget.show();

      this.originalPositions.delete(panelId);
    }

    const panelState = this.currentState.panelStates.get(panelId);
    if (panelState) {
      panelState.state = 'normal';
    }

    this.screen.render();

    this.eventBus.emit('panel:restored', {
      panelId,
      timestamp: new Date(),
    });
  }

  /**
   * Hide panel
   */
  private hidePanel(panelId: string): void {
    const component = this.panels.get(panelId);
    if (component && component.widget && typeof component.widget.hide === 'function') {
      component.widget.hide();
    }
  }

  /**
   * Store current panel states
   */
  private storeCurrentStates(): void {
    this.panels.forEach((component, panelId) => {
      if (component.widget) {
        try {
          const currentState: PanelConfig = {
            id: panelId,
            title: '',
            component,
            position: {
              left: component.widget.left || 0,
              top: component.widget.top || 0,
              width: component.widget.width || 0,
              height: component.widget.height || 0,
            },
            visible: !component.widget.hidden,
            state: 'normal',
          };
          this.currentState.panelStates.set(panelId, currentState);
        } catch (error) {
          console.error(`Failed to store state for panel ${panelId}:`, error);
        }
      }
    });
  }

  /**
   * Handle screen resize
   */
  private handleScreenResize(): void {
    const currentLayout = this.layouts.get(this.currentState.currentLayout);
    if (currentLayout) {
      // Check if current layout is still viable
      const terminalSize = this.getTerminalSize();
      if (terminalSize.width < currentLayout.minSize.width || 
          terminalSize.height < currentLayout.minSize.height) {
        // Try to switch to a more compact layout
        this.findAndSwitchToCompatibleLayout(terminalSize);
      } else {
        // Reapply current layout with new dimensions
        this.applyLayout(currentLayout);
      }
    }
  }

  /**
   * Find and switch to compatible layout for current terminal size
   */
  private findAndSwitchToCompatibleLayout(terminalSize: { width: number; height: number }): void {
    const compatibleLayouts = Array.from(this.layouts.values())
      .filter(layout => 
        terminalSize.width >= layout.minSize.width && 
        terminalSize.height >= layout.minSize.height
      )
      .sort((a, b) => (b.minSize.width * b.minSize.height) - (a.minSize.width * a.minSize.height));

    if (compatibleLayouts.length > 0 && compatibleLayouts[0]) {
      this.switchLayout(compatibleLayouts[0].name);
    }
  }

  /**
   * Get current terminal size
   */
  private getTerminalSize(): { width: number; height: number } {
    return {
      width: this.screen.width || 80,
      height: this.screen.height || 24,
    };
  }

  /**
   * Get available layouts
   */
  public getAvailableLayouts(): string[] {
    return Array.from(this.layouts.keys());
  }

  /**
   * Get current layout name
   */
  public getCurrentLayout(): string {
    return this.currentState.currentLayout;
  }

  /**
   * Get layout information
   */
  public getLayoutInfo(layoutName?: string): LayoutPreset | null {
    const name = layoutName || this.currentState.currentLayout;
    return this.layouts.get(name) || null;
  }

  /**
   * Get panel state
   */
  public getPanelState(panelId: string): PanelConfig | null {
    return this.currentState.panelStates.get(panelId) || null;
  }

  /**
   * Check if panel is in fullscreen
   */
  public isFullscreen(): boolean {
    return this.currentState.fullscreenPanel !== undefined;
  }

  /**
   * Get fullscreen panel ID
   */
  public getFullscreenPanel(): string | undefined {
    return this.currentState.fullscreenPanel;
  }

  /**
   * Add custom layout preset
   */
  public addLayoutPreset(preset: LayoutPreset): void {
    this.layouts.set(preset.name, preset);
    
    this.eventBus.emit('layout:preset:added', {
      layoutName: preset.name,
      timestamp: new Date(),
    });
  }

  /**
   * Remove layout preset
   */
  public removeLayoutPreset(layoutName: string): void {
    if (layoutName === this.currentState.currentLayout) {
      throw new Error('Cannot remove currently active layout');
    }
    
    this.layouts.delete(layoutName);
    
    this.eventBus.emit('layout:preset:removed', {
      layoutName,
      timestamp: new Date(),
    });
  }

  /**
   * Save current layout state
   */
  public saveCurrentState(): LayoutPreset {
    const panels: PanelConfig[] = [];
    
    this.currentState.panelStates.forEach((panelState, _panelId) => {
      panels.push({ ...panelState });
    });

    return {
      name: `custom-${Date.now()}`,
      description: 'User saved layout',
      minSize: this.getTerminalSize(),
      panels,
    };
  }

  /**
   * Destroy layout manager and clean up resources
   */
  public destroy(): void {
    // Exit fullscreen if active
    if (this.currentState.fullscreenPanel) {
      this.exitFullscreen();
    }

    // Clear all stored states
    this.currentState.panelStates.clear();
    this.originalPositions.clear();
    this.panels.clear();
    this.layouts.clear();
  }
}