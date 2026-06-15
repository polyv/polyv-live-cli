/**
 * @fileoverview Interaction Manager for keyboard navigation, shortcuts, and focus management
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';
import {
  KeyboardEvent,
  MouseEvent,
  FocusableComponent,
  ShortcutConfig,
  InteractionConfig,
} from '../types/interaction';

/**
 * Manages all interactive operations including keyboard navigation,
 * shortcuts, focus management, and mouse interactions
 */
export class InteractionManager extends EventEmitter {
  private config: InteractionConfig;
  private screen: any;
  private focusableComponents: Map<string, FocusableComponent> = new Map();
  private currentFocus: string | undefined;
  private focusHistory: string[] = [];
  private shortcuts: Map<string, ShortcutConfig> = new Map();
  private isDestroyed = false;

  constructor(screen: any, config: InteractionConfig) {
    super();
    this.screen = screen;
    this.config = config;
    this.initializeInteractionHandlers();
    this.registerDefaultShortcuts();
  }

  /**
   * Initialize keyboard and mouse event handlers
   */
  private initializeInteractionHandlers(): void {
    if (!this.screen) {
      throw new Error('Screen instance is required for interaction management');
    }

    // Set up keyboard event handling
    if (this.config.keyboardEnabled) {
      this.setupKeyboardHandling();
    }

    // Set up mouse event handling
    if (this.config.mouseEnabled) {
      this.setupMouseHandling();
    }

    // Enable mouse support in blessed screen
    if (this.config.mouseEnabled && this.screen.program) {
      this.screen.program.enableMouse();
    }
  }

  /**
   * Set up keyboard event handling
   */
  private setupKeyboardHandling(): void {
    this.screen.on('keypress', (ch: any, key: any) => {
      if (this.isDestroyed || !key) return;

      const keyboardEvent: KeyboardEvent = {
        key: key.name || '',
        shift: key.shift || false,
        ctrl: key.ctrl || false,
        alt: key.meta || false,
        meta: key.meta || false,
        full: key.full || '',
        ch: ch || '',
      };

      this.handleKeyboardEvent(keyboardEvent);
    });

    // Handle specific navigation keys
    this.screen.key(['tab'], () => {
      this.focusNext();
    });

    this.screen.key(['S-tab'], () => {
      this.focusPrevious();
    });

    this.screen.key(['escape'], () => {
      this.handleEscape();
    });

    this.screen.key(['enter'], () => {
      this.handleEnter();
    });
  }

  /**
   * Set up mouse event handling
   */
  private setupMouseHandling(): void {
    this.screen.on('mouse', (data: any) => {
      if (this.isDestroyed) return;

      const mouseEvent: MouseEvent = {
        action: data.action || 'mousedown',
        x: data.x || 0,
        y: data.y || 0,
        button: data.button || 'left',
        shift: data.shift || false,
        ctrl: data.ctrl || false,
      };

      this.handleMouseEvent(mouseEvent);
    });
  }

  /**
   * Register default keyboard shortcuts
   */
  private registerDefaultShortcuts(): void {
    const defaultShortcuts: ShortcutConfig[] = [
      // Data refresh shortcuts
      {
        key: 'f5',
        description: 'Refresh all monitoring data',
        action: 'refresh-all',
        global: true,
      },
      {
        key: 'ctrl+r',
        description: 'Refresh current panel',
        action: 'refresh-current',
        global: true,
      },
      
      // Help and information
      {
        key: 'f1',
        description: 'Show help and shortcuts',
        action: 'help',
        global: true,
      },
      {
        key: '?',
        description: 'Show help and shortcuts',
        action: 'help',
        global: true,
      },
      
      // Exit shortcuts
      {
        key: 'q',
        description: 'Exit application',
        action: 'exit',
        global: true,
      },
      {
        key: 'ctrl+c',
        description: 'Exit application',
        action: 'exit',
        global: true,
      },
      {
        key: 'escape',
        description: 'Cancel current operation or exit',
        action: 'cancel',
        global: true,
      },
      
      // Panel management
      {
        key: 'f11',
        description: 'Toggle fullscreen for current panel',
        action: 'fullscreen',
        global: true,
      },
      
      // Screen management
      {
        key: 'ctrl+l',
        description: 'Clear and redraw screen',
        action: 'clear-screen',
        global: true,
      },
      
      // Panel switching (1-9)
      ...Array.from({ length: 9 }, (_, i) => ({
        key: `${i + 1}`,
        description: `Switch to layout ${i + 1}`,
        action: `layout:${i + 1}`,
        global: true,
      })),
      
      // Search functionality
      {
        key: 'ctrl+f',
        description: 'Open search',
        action: 'search',
        global: true,
        context: 'list',
      },
      {
        key: '/',
        description: 'Quick search',
        action: 'search',
        global: true,
        context: 'list',
      },
    ];

    // Add shortcuts from config
    const allShortcuts = [...defaultShortcuts, ...this.config.shortcuts];
    
    allShortcuts.forEach(shortcut => {
      this.registerShortcut(shortcut);
    });
  }

  /**
   * Handle keyboard events
   */
  private handleKeyboardEvent(event: KeyboardEvent): void {
    // Emit keyboard event for other components
    this.emit('keyboard:event', event);

    // Check for shortcuts first
    const shortcutKey = this.buildShortcutKey(event);
    if (this.shortcuts.has(shortcutKey)) {
      const shortcut = this.shortcuts.get(shortcutKey)!;
      this.activateShortcut(shortcut, event);
      return;
    }

    // Pass event to focused component
    if (this.currentFocus) {
      const component = this.focusableComponents.get(this.currentFocus);
      if (component && component.handleKeyboard(event)) {
        return; // Component handled the event
      }
    }

    // Handle navigation keys
    this.handleNavigationKeys(event);
  }

  /**
   * Handle mouse events
   */
  private handleMouseEvent(event: MouseEvent): void {
    // Emit mouse event for other components
    this.emit('mouse:event', event);

    // Handle scrolling
    if (event.action === 'wheelup' || event.action === 'wheeldown') {
      this.handleScrollEvent(event);
      return;
    }

    // Handle right-click context menu
    if (event.action === 'mousedown' && event.button === 'right') {
      this.handleContextMenu(event);
      return;
    }

    // Handle mouse hover for tooltips and visual feedback
    if (event.action === 'mousemove') {
      this.handleMouseHover(event);
    }

    // Find component at mouse position and handle event
    const componentAtPosition = this.findComponentAtPosition(event.x, event.y);
    
    if (componentAtPosition) {
      const { id, component } = componentAtPosition;
      
      // Try to handle mouse event with specific component
      if (component.handleMouse(event)) {
        // If component handled mouse event and it's a click, focus it
        if (event.action === 'mousedown' && event.button === 'left') {
          this.setFocus(id);
        }
        return;
      }
    }

    // Fallback: pass event to all components for generic handling
    for (const [id, component] of this.focusableComponents) {
      if (component.handleMouse(event)) {
        // If component handled mouse event and it's a click, focus it
        if (event.action === 'mousedown' && event.button === 'left') {
          this.setFocus(id);
        }
        return;
      }
    }
  }

  /**
   * Build shortcut key string from keyboard event
   */
  private buildShortcutKey(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrl) parts.push('C');
    if (event.alt) parts.push('A');
    if (event.shift) parts.push('S');
    if (event.meta) parts.push('M');
    
    parts.push(event.key);
    
    return parts.join('-').toLowerCase();
  }

  /**
   * Handle navigation keys (arrow keys, etc.)
   */
  private handleNavigationKeys(event: KeyboardEvent): void {
    switch (event.key) {
      case 'up':
      case 'down':
      case 'left':
      case 'right':
        this.handleArrowKeys(event.key);
        break;
      case 'home':
        this.focusFirst();
        break;
      case 'end':
        this.focusLast();
        break;
    }
  }

  /**
   * Handle arrow key navigation
   */
  private handleArrowKeys(direction: string): void {
    if (!this.currentFocus) {
      this.focusFirst();
      return;
    }

    // For now, implement simple sequential navigation
    // TODO: Implement spatial navigation based on component positions
    switch (direction) {
      case 'up':
      case 'left':
        this.focusPrevious();
        break;
      case 'down':
      case 'right':
        this.focusNext();
        break;
    }
  }

  /**
   * Handle escape key
   */
  private handleEscape(): void {
    // Clear focus or close modals
    if (this.currentFocus) {
      const component = this.focusableComponents.get(this.currentFocus);
      if (component) {
        const handled = component.handleKeyboard({
          key: 'escape',
          shift: false,
          ctrl: false,
          alt: false,
          meta: false,
        });
        
        if (!handled) {
          this.clearFocus();
        }
      }
    }
  }

  /**
   * Handle enter key
   */
  private handleEnter(): void {
    if (this.currentFocus) {
      const component = this.focusableComponents.get(this.currentFocus);
      if (component) {
        component.handleKeyboard({
          key: 'enter',
          shift: false,
          ctrl: false,
          alt: false,
          meta: false,
        });
      }
    }
  }

  /**
   * Handle scroll events (mouse wheel)
   */
  private handleScrollEvent(event: MouseEvent): void {
    // Find component at mouse position for targeted scrolling
    const componentAtPosition = this.findComponentAtPosition(event.x, event.y);
    
    if (componentAtPosition) {
      const { component } = componentAtPosition;
      
      // Try component-specific scroll handling first
      if (component.handleMouse(event)) {
        return;
      }
    }

    // Fallback: scroll focused component
    if (this.currentFocus) {
      const component = this.focusableComponents.get(this.currentFocus);
      if (component) {
        component.handleMouse(event);
      }
    }

    // Emit scroll event for dashboard-level handling
    this.emit('scroll:event', {
      direction: event.action === 'wheelup' ? 'up' : 'down',
      x: event.x,
      y: event.y,
    });
  }

  /**
   * Handle mouse hover for tooltips and visual feedback
   */
  private handleMouseHover(event: MouseEvent): void {
    const componentAtPosition = this.findComponentAtPosition(event.x, event.y);
    
    if (componentAtPosition) {
      const { id, component } = componentAtPosition;
      
      // Emit hover events for tooltip systems
      this.emit('component:hover', {
        componentId: id,
        componentType: component.getType(),
        x: event.x,
        y: event.y,
      });
      
      // Handle component-specific hover
      component.handleMouse(event);
    } else {
      // No component at position, clear hover
      this.emit('component:hover:clear');
    }
  }

  /**
   * Find component at specific screen position
   */
  private findComponentAtPosition(x: number, y: number): { id: string; component: FocusableComponent } | undefined {
    // Check all components to find which one contains the mouse position
    for (const [id, component] of this.focusableComponents) {
      if (component.canFocus() && this.isPositionInComponent(x, y, component)) {
        return { id, component };
      }
    }
    
    // Fallback: if no component was found at position, try focused component
    if (this.currentFocus) {
      const component = this.focusableComponents.get(this.currentFocus);
      if (component && component.canFocus()) {
        return { id: this.currentFocus, component };
      }
    }
    
    return undefined;
  }

  /**
   * Check if position is within component bounds
   */
  private isPositionInComponent(x: number, y: number, component: FocusableComponent): boolean {
    // Try to access the component's bounds checking method if available
    if (component && typeof (component as any).getComponentBounds === 'function') {
      const bounds = (component as any).getComponentBounds();
      if (bounds) {
        return x >= bounds.left && x <= bounds.right &&
               y >= bounds.top && y <= bounds.bottom;
      }
    }
    
    // Fallback: always return true for now since blessed components
    // don't reliably expose their bounds
    return true;
  }

  /**
   * Handle context menu request
   */
  private handleContextMenu(event: MouseEvent): void {
    // Find component at mouse position
    let context = 'global';
    let componentId = '';
    
    const componentAtPosition = this.findComponentAtPosition(event.x, event.y);
    if (componentAtPosition) {
      context = componentAtPosition.component.getType();
      componentId = componentAtPosition.id;
    }

    this.emit('contextmenu:requested', {
      x: event.x,
      y: event.y,
      context,
      componentId,
    });
  }

  /**
   * Register a focusable component
   */
  public registerComponent(component: FocusableComponent): void {
    if (this.isDestroyed) return;
    
    const id = component.getId();
    this.focusableComponents.set(id, component);
    
    // If no component is focused, focus this one
    if (!this.currentFocus && component.canFocus()) {
      this.setFocus(id);
    }
  }

  /**
   * Unregister a focusable component
   */
  public unregisterComponent(id: string): void {
    if (this.isDestroyed) return;
    
    // If this component has focus, move focus elsewhere
    if (this.currentFocus === id) {
      // Remove from components first
      this.focusableComponents.delete(id);
      
      // Try to focus another component
      const remainingComponents = Array.from(this.focusableComponents.values())
        .filter(c => c.canFocus());
      
      if (remainingComponents.length > 0) {
        const firstComponent = remainingComponents[0];
        if (firstComponent) {
          this.setFocus(firstComponent.getId());
        }
      } else {
        this.currentFocus = undefined;
        this.emit('focus:changed', {
          previous: id,
          current: undefined,
        });
      }
    } else {
      this.focusableComponents.delete(id);
    }
    
    // Remove from focus history
    this.focusHistory = this.focusHistory.filter(historyId => historyId !== id);
  }

  /**
   * Set focus to a specific component
   */
  public setFocus(componentId: string): boolean {
    if (this.isDestroyed) return false;
    
    const component = this.focusableComponents.get(componentId);
    if (!component || !component.canFocus()) {
      return false;
    }

    const previousFocus = this.currentFocus;
    
    // Blur previous component
    if (previousFocus && previousFocus !== componentId) {
      const prevComponent = this.focusableComponents.get(previousFocus);
      if (prevComponent) {
        prevComponent.blur();
      }
    }

    // Focus new component
    this.currentFocus = componentId;
    component.focus();
    
    // Update focus history
    if (previousFocus && previousFocus !== componentId) {
      this.focusHistory.push(previousFocus);
      // Keep history limited
      if (this.focusHistory.length > 10) {
        this.focusHistory.shift();
      }
    }

    // Emit focus change event
    this.emit('focus:changed', {
      previous: previousFocus,
      current: componentId,
    });

    return true;
  }

  /**
   * Focus next component in tab order
   */
  public focusNext(): void {
    if (this.isDestroyed) return;
    
    const components = Array.from(this.focusableComponents.values())
      .filter(c => c.canFocus())
      .sort((a, b) => a.getFocusState().tabIndex - b.getFocusState().tabIndex);

    if (components.length === 0) return;

    if (!this.currentFocus) {
      const firstComponent = components[0];
      if (firstComponent) {
        this.setFocus(firstComponent.getId());
      }
      return;
    }

    const currentIndex = components.findIndex(c => c.getId() === this.currentFocus);
    const nextIndex = (currentIndex + 1) % components.length;
    const nextComponent = components[nextIndex];
    if (nextComponent) {
      this.setFocus(nextComponent.getId());
    }
  }

  /**
   * Focus previous component in tab order
   */
  public focusPrevious(): void {
    if (this.isDestroyed) return;
    
    const components = Array.from(this.focusableComponents.values())
      .filter(c => c.canFocus())
      .sort((a, b) => a.getFocusState().tabIndex - b.getFocusState().tabIndex);

    if (components.length === 0) return;

    if (!this.currentFocus) {
      const lastComponent = components[components.length - 1];
      if (lastComponent) {
        this.setFocus(lastComponent.getId());
      }
      return;
    }

    const currentIndex = components.findIndex(c => c.getId() === this.currentFocus);
    const prevIndex = currentIndex === 0 ? components.length - 1 : currentIndex - 1;
    const prevComponent = components[prevIndex];
    if (prevComponent) {
      this.setFocus(prevComponent.getId());
    }
  }

  /**
   * Focus first component
   */
  public focusFirst(): void {
    if (this.isDestroyed) return;
    
    const components = Array.from(this.focusableComponents.values())
      .filter(c => c.canFocus())
      .sort((a, b) => a.getFocusState().tabIndex - b.getFocusState().tabIndex);

    if (components.length > 0) {
      const firstComponent = components[0];
      if (firstComponent) {
        this.setFocus(firstComponent.getId());
      }
    }
  }

  /**
   * Focus last component
   */
  public focusLast(): void {
    if (this.isDestroyed) return;
    
    const components = Array.from(this.focusableComponents.values())
      .filter(c => c.canFocus())
      .sort((a, b) => a.getFocusState().tabIndex - b.getFocusState().tabIndex);

    if (components.length > 0) {
      const lastComponent = components[components.length - 1];
      if (lastComponent) {
        this.setFocus(lastComponent.getId());
      }
    }
  }

  /**
   * Clear current focus
   */
  public clearFocus(): void {
    if (this.isDestroyed || !this.currentFocus) return;
    
    const component = this.focusableComponents.get(this.currentFocus);
    if (component) {
      component.blur();
    }

    const previousFocus = this.currentFocus;
    this.currentFocus = undefined;

    this.emit('focus:changed', {
      previous: previousFocus,
      current: undefined,
    });
  }

  /**
   * Register a keyboard shortcut
   */
  public registerShortcut(shortcut: ShortcutConfig): void {
    if (this.isDestroyed) return;
    
    const key = shortcut.key.toLowerCase();
    this.shortcuts.set(key, shortcut);
  }

  /**
   * Unregister a keyboard shortcut
   */
  public unregisterShortcut(key: string): void {
    if (this.isDestroyed) return;
    
    this.shortcuts.delete(key.toLowerCase());
  }

  /**
   * Activate a keyboard shortcut
   */
  private activateShortcut(shortcut: ShortcutConfig, _event: KeyboardEvent): void {
    this.emit('shortcut:activated', {
      key: shortcut.key,
      action: shortcut.action,
    });

    // Handle built-in shortcuts
    switch (shortcut.action) {
      case 'refresh-all':
        this.emit('action:refresh-all');
        break;
      case 'refresh-current':
        this.emit('action:refresh-current');
        break;
      case 'help':
        this.emit('action:help');
        break;
      case 'exit':
        this.emit('action:exit');
        break;
      case 'cancel':
        this.emit('action:cancel');
        break;
      case 'fullscreen':
        this.emit('action:fullscreen');
        break;
      case 'clear-screen':
        this.emit('action:clear-screen');
        break;
      case 'search':
        this.emit('action:search');
        break;
      default:
        if (shortcut.action.startsWith('layout:')) {
          const layoutNumber = shortcut.action.split(':')[1];
          this.emit('action:layout', { layout: layoutNumber });
        } else if (shortcut.action.startsWith('panel:')) {
          const panelNumber = shortcut.action.split(':')[1];
          this.emit('action:panel', { panel: panelNumber });
        } else {
          // Emit generic action for custom shortcuts
          this.emit('action:custom', { 
            action: shortcut.action,
            key: shortcut.key,
            description: shortcut.description 
          });
        }
        break;
    }
  }

  /**
   * Get all shortcut configurations for help display
   */
  public getAllShortcuts(): ShortcutConfig[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get current focused component ID
   */
  public getCurrentFocus(): string | undefined {
    return this.currentFocus;
  }

  /**
   * Get all registered components
   */
  public getComponents(): FocusableComponent[] {
    return Array.from(this.focusableComponents.values());
  }

  /**
   * Get all registered shortcuts
   */
  public getShortcuts(): ShortcutConfig[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get component by ID
   */
  public getComponent(id: string): FocusableComponent | undefined {
    return this.focusableComponents.get(id);
  }

  /**
   * Check if interaction manager is destroyed
   */
  public isInteractionManagerDestroyed(): boolean {
    return this.isDestroyed;
  }

  /**
   * Destroy the interaction manager and clean up resources
   */
  public destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    // Clear focus
    this.clearFocus();
    
    // Clear all components
    this.focusableComponents.clear();
    
    // Ensure focus is undefined after clearing
    this.currentFocus = undefined;
    
    // Clear shortcuts
    this.shortcuts.clear();
    
    // Clear focus history
    this.focusHistory = [];
    
    // Disable mouse if enabled
    if (this.config.mouseEnabled && this.screen?.program) {
      this.screen.program.disableMouse();
    }
    
    // Remove all listeners
    this.removeAllListeners();
    
    this.emit('destroyed');
  }
}