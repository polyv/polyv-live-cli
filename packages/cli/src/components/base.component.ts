import { EventEmitter } from 'events';
import { Component, ComponentConfig, ComponentState, GridSize } from '../types/monitoring';
import { FocusableComponent, FocusState, KeyboardEvent, MouseEvent } from '../types/interaction';

export abstract class BaseComponent extends Component implements FocusableComponent {
  protected refreshInterval?: NodeJS.Timeout;
  protected isDestroyed = false;
  protected lastRenderTime = 0;
  protected renderThrottleMs = 16; // ~60fps
  protected focusState: FocusState = {
    focused: false,
    focusable: true,
    tabIndex: 0,
    showFocusRing: true,
  };

  constructor(config: ComponentConfig, eventBus: EventEmitter) {
    super(config, eventBus);
    this.initializeComponent();
  }

  protected initializeComponent(): void {
    this.state.status = 'initializing';
    this.setupEventListeners();
    this.createWidget();
    this.state.status = 'running';
    this.state.lastUpdate = new Date();
  }

  protected setupEventListeners(): void {
    this.subscribe('terminal:resize', this.handleTerminalResize.bind(this));
    this.subscribe('theme:change', this.handleThemeChange.bind(this));
    this.subscribe('component:update', this.handleComponentUpdate.bind(this));
  }

  protected abstract createWidget(): void;

  protected throttledRender(): void {
    const now = Date.now();
    if (now - this.lastRenderTime >= this.renderThrottleMs) {
      this.render();
      this.lastRenderTime = now;
    }
  }

  protected handleTerminalResize(data: { width: number; height: number }): void {
    if (this.isDestroyed) return;
    
    const newSize: GridSize = {
      minWidth: Math.max(this.config.size.minWidth, data.width * 0.1),
      minHeight: Math.max(this.config.size.minHeight, data.height * 0.1),
      maxWidth: data.width,
      maxHeight: data.height,
    };
    
    this.resize(newSize);
  }

  protected handleThemeChange(data: { theme: string }): void {
    if (this.isDestroyed) return;
    this.applyTheme(data.theme);
    this.throttledRender();
  }

  protected handleComponentUpdate(data: any): void {
    if (this.isDestroyed) return;
    if (data.source === this.state.id) return; // Avoid self-updates
    
    this.update(data);
  }

  protected applyTheme(_theme: string): void {
    // Override in subclasses to apply theme-specific styling
  }

  protected startRefresh(intervalMs: number): void {
    this.stopRefresh();
    this.refreshInterval = setInterval(() => {
      if (!this.isDestroyed) {
        this.requestUpdate();
      }
    }, intervalMs);
  }

  protected stopRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined as any;
    }
  }

  protected requestUpdate(): void {
    this.emit('component:requestUpdate', {
      componentId: this.state.id,
      type: this.config.type,
      timestamp: new Date(),
    });
  }

  protected updateState(updates: Partial<ComponentState>): void {
    this.state = { ...this.state, ...updates, lastUpdate: new Date() };
  }

  protected handleError(error: Error): void {
    this.state.status = 'error';
    this.state.error = error;
    this.emit('component:error', {
      componentId: this.state.id,
      type: this.config.type,
      error: error.message,
      timestamp: new Date(),
    });
  }

  public resize(size: GridSize): void {
    if (this.isDestroyed || !this.widget) return;
    
    try {
      this.widget.width = size.maxWidth || size.minWidth;
      this.widget.height = size.maxHeight || size.minHeight;
      this.widget.screen?.render();
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Unknown resize error'));
    }
  }

  public show(): void {
    if (this.widget && !this.isDestroyed) {
      this.widget.show();
      this.widget.screen?.render();
    }
  }

  public hide(): void {
    if (this.widget && !this.isDestroyed) {
      this.widget.hide();
      this.widget.screen?.render();
    }
  }


  public destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    this.state.status = 'destroyed';
    
    this.stopRefresh();
    
    // Clear focus if this component has it
    if (this.focusState.focused) {
      this.blur();
    }
    
    // Remove component-specific event listeners
    // Note: We don't remove all listeners as that would affect other components
    
    // Clean up widget
    if (this.widget) {
      this.widget.destroy();
    }
    
    this.emit('component:destroyed', {
      componentId: this.state.id,
      type: this.config.type,
      timestamp: new Date(),
    });
  }

  // FocusableComponent interface implementation

  /**
   * Get component unique identifier
   */
  public getId(): string {
    return this.state.id;
  }

  /**
   * Get component type
   */
  public getType(): string {
    return this.config.type;
  }

  /**
   * Check if component can receive focus
   */
  public canFocus(): boolean {
    return this.focusState.focusable && !this.isDestroyed && this.widget;
  }

  /**
   * Set focus to this component
   */
  public focus(): void {
    if (!this.canFocus()) return;
    
    this.focusState.focused = true;
    
    // Focus the blessed widget
    if (this.widget && this.widget.focus) {
      this.widget.focus();
    }
    
    // Update visual focus indication
    this.updateFocusVisuals();
    
    this.emit('component:focused', {
      componentId: this.state.id,
      type: this.config.type,
      timestamp: new Date(),
    });
  }

  /**
   * Remove focus from this component
   */
  public blur(): void {
    if (!this.focusState.focused) return;
    
    this.focusState.focused = false;
    
    // Update visual focus indication
    this.updateFocusVisuals();
    
    this.emit('component:blurred', {
      componentId: this.state.id,
      type: this.config.type,
      timestamp: new Date(),
    });
  }

  /**
   * Get current focus state
   */
  public getFocusState(): FocusState {
    return { ...this.focusState };
  }

  /**
   * Handle keyboard events when focused
   * Override in subclasses for component-specific behavior
   */
  public handleKeyboard(event: KeyboardEvent): boolean {
    // Default keyboard handling
    switch (event.key) {
      case 'enter':
        this.handleEnterKey(event);
        return true;
      case 'escape':
        this.handleEscapeKey(event);
        return true;
      case 'space':
        this.handleSpaceKey(event);
        return true;
      default:
        return this.handleCustomKeyboard(event);
    }
  }

  /**
   * Handle mouse events
   * Override in subclasses for component-specific behavior
   */
  public handleMouse(event: MouseEvent): boolean {
    // Check if mouse event is within component bounds
    if (!this.isMouseEventInBounds(event)) {
      return false;
    }

    switch (event.action) {
      case 'mousedown':
        if (event.button === 'left') {
          this.handleMouseClick(event);
          return true;
        } else if (event.button === 'right') {
          this.handleRightClick(event);
          return true;
        }
        break;
      case 'wheelup':
      case 'wheeldown':
        this.handleMouseWheel(event);
        return true;
      case 'mousemove':
        this.handleMouseMove(event);
        return true;
    }
    
    return false;
  }

  /**
   * Set tab index for keyboard navigation order
   */
  public setTabIndex(index: number): void {
    this.focusState.tabIndex = index;
  }

  /**
   * Set whether component can receive focus
   */
  public setFocusable(focusable: boolean): void {
    this.focusState.focusable = focusable;
    if (!focusable && this.focusState.focused) {
      this.blur();
    }
  }

  /**
   * Set whether to show focus ring
   */
  public setShowFocusRing(show: boolean): void {
    this.focusState.showFocusRing = show;
    this.updateFocusVisuals();
  }

  // Protected methods for subclasses to override

  /**
   * Update visual focus indication
   * Override in subclasses for custom focus styling
   */
  protected updateFocusVisuals(): void {
    if (!this.widget) return;
    
    if (this.focusState.focused && this.focusState.showFocusRing) {
      // Add focus styling to widget
      if (this.widget.style) {
        this.widget.style.border = this.widget.style.border || {};
        this.widget.style.border.fg = 'cyan';
        this.widget.style.border.bold = true;
      }
    } else {
      // Remove focus styling
      if (this.widget.style && this.widget.style.border) {
        this.widget.style.border.fg = this.widget.style.border.fg === 'cyan' ? 'white' : this.widget.style.border.fg;
        this.widget.style.border.bold = false;
      }
    }
    
    // Re-render to show changes
    this.throttledRender();
  }

  /**
   * Handle enter key press
   * Override in subclasses for custom behavior
   */
  protected handleEnterKey(event: KeyboardEvent): void {
    // Default: emit activation event
    this.emit('component:activated', {
      componentId: this.state.id,
      type: this.config.type,
      event,
      timestamp: new Date(),
    });
  }

  /**
   * Handle escape key press
   * Override in subclasses for custom behavior
   */
  protected handleEscapeKey(event: KeyboardEvent): void {
    // Default: emit cancel event
    this.emit('component:cancelled', {
      componentId: this.state.id,
      type: this.config.type,
      event,
      timestamp: new Date(),
    });
  }

  /**
   * Handle space key press
   * Override in subclasses for custom behavior
   */
  protected handleSpaceKey(event: KeyboardEvent): void {
    // Default: same as enter
    this.handleEnterKey(event);
  }

  /**
   * Handle custom keyboard events
   * Override in subclasses for component-specific keys
   */
  protected handleCustomKeyboard(_event: KeyboardEvent): boolean {
    // Default: no custom handling
    return false;
  }

  /**
   * Handle mouse click
   * Override in subclasses for custom behavior
   */
  protected handleMouseClick(event: MouseEvent): void {
    // Default: request focus
    this.emit('component:clicked', {
      componentId: this.state.id,
      type: this.config.type,
      event,
      timestamp: new Date(),
    });
  }

  /**
   * Handle right mouse click
   * Override in subclasses for custom behavior
   */
  protected handleRightClick(event: MouseEvent): void {
    // Default: emit context menu request
    this.emit('component:contextmenu', {
      componentId: this.state.id,
      type: this.config.type,
      event,
      timestamp: new Date(),
    });
  }

  /**
   * Handle mouse wheel
   * Override in subclasses for custom behavior
   */
  protected handleMouseWheel(event: MouseEvent): void {
    // Default: emit scroll event
    this.emit('component:scroll', {
      componentId: this.state.id,
      type: this.config.type,
      event,
      direction: event.action === 'wheelup' ? 'up' : 'down',
      timestamp: new Date(),
    });
  }

  /**
   * Handle mouse move
   * Override in subclasses for custom behavior
   */
  protected handleMouseMove(event: MouseEvent): void {
    // Default: emit hover event
    this.emit('component:hover', {
      componentId: this.state.id,
      type: this.config.type,
      event,
      timestamp: new Date(),
    });
  }

  /**
   * Check if mouse event is within component bounds
   * Override in subclasses for more accurate bounds checking
   */
  protected isMouseEventInBounds(event: MouseEvent): boolean {
    if (!this.widget) return false;
    
    // Try multiple methods to get accurate bounds
    const bounds = this.getComponentBounds();
    
    if (!bounds) return false;
    
    return event.x >= bounds.left && event.x <= bounds.right &&
           event.y >= bounds.top && event.y <= bounds.bottom;
  }

  /**
   * Get component bounds with fallback methods
   */
  protected getComponentBounds(): { left: number; top: number; right: number; bottom: number } | null {
    if (!this.widget) return null;
    
    // Method 1: Use absolute positioning if available
    if (typeof this.widget.aleft === 'number' && typeof this.widget.atop === 'number') {
      const left = this.widget.aleft;
      const top = this.widget.atop;
      const width = this.widget.width as number || 0;
      const height = this.widget.height as number || 0;
      
      return {
        left,
        top,
        right: left + width - 1,
        bottom: top + height - 1,
      };
    }
    
    // Method 2: Use relative positioning and calculate
    const left = this.widget.left as number || 0;
    const top = this.widget.top as number || 0;
    const width = this.widget.width as number || 0;
    const height = this.widget.height as number || 0;
    
    // If parent exists, add parent offset
    let parentLeft = 0;
    let parentTop = 0;
    
    if (this.widget.parent) {
      parentLeft = (this.widget.parent as any).aleft || 0;
      parentTop = (this.widget.parent as any).atop || 0;
    }
    
    return {
      left: parentLeft + left,
      top: parentTop + top,
      right: parentLeft + left + width - 1,
      bottom: parentTop + top + height - 1,
    };
  }
}