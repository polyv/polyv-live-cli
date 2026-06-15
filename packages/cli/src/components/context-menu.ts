/**
 * @fileoverview Context menu component for right-click interactions
 * @author Development Team
 * @since 1.0.0
 */

import blessed from 'blessed';
import { EventEmitter } from 'events';

/**
 * Context menu item interface
 */
export interface ContextMenuItem {
  /** Menu item label */
  label: string;
  /** Action to execute when selected */
  action: string;
  /** Whether the item is enabled */
  enabled?: boolean;
  /** Keyboard shortcut display */
  shortcut?: string;
  /** Submenu items */
  submenu?: ContextMenuItem[];
  /** Separator after this item */
  separator?: boolean;
  /** Icon or emoji to display */
  icon?: string;
}

/**
 * Context menu configuration
 */
export interface ContextMenuConfig {
  /** Menu items */
  items: ContextMenuItem[];
  /** X position */
  x: number;
  /** Y position */
  y: number;
  /** Context type for menu generation */
  context?: string;
  /** Component ID if applicable */
  componentId?: string | undefined;
  /** Auto-hide when clicked outside */
  autoHide?: boolean;
  /** Style configuration */
  style?: {
    fg?: string;
    bg?: string;
    selectedFg?: string;
    selectedBg?: string;
    border?: {
      fg?: string;
      bg?: string;
    };
  };
}

/**
 * Context menu component for right-click interactions
 */
export class ContextMenu {
  private screen: any;
  private eventBus: EventEmitter;
  private menuBox: any;
  private isVisible = false;
  private selectedIndex = 0;
  private menuItems: ContextMenuItem[] = [];
  private currentConfig?: ContextMenuConfig;

  constructor(screen: any, eventBus: EventEmitter) {
    this.screen = screen;
    this.eventBus = eventBus;
  }

  /**
   * Show context menu with given configuration
   */
  public show(config: ContextMenuConfig): void {
    // Hide existing menu if visible
    if (this.isVisible) {
      this.hide();
    }

    this.currentConfig = config;
    this.menuItems = config.items.filter(item => item.enabled !== false);
    this.selectedIndex = 0;

    if (this.menuItems.length === 0) {
      return; // No items to show
    }

    this.createMenuBox(config);
    
    // Only set visible if createMenuBox succeeded
    if (this.menuBox) {
      this.isVisible = true;
      
      this.eventBus.emit('contextmenu:shown', {
        x: config.x,
        y: config.y,
        context: config.context,
        componentId: config.componentId,
        itemCount: this.menuItems.length,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Hide the context menu
   */
  public hide(): void {
    if (!this.isVisible || !this.menuBox) return;

    try {
      this.screen.remove(this.menuBox);
      this.menuBox = null;
      this.isVisible = false;
      this.selectedIndex = 0;
      this.menuItems = [];
      this.screen.render();

      this.eventBus.emit('contextmenu:hidden', {
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to hide context menu:', error);
      this.menuBox = null;
      this.isVisible = false;
    }
  }

  /**
   * Navigate menu selection up
   */
  public navigateUp(): void {
    if (!this.isVisible || this.menuItems.length === 0) return;

    this.selectedIndex = this.selectedIndex === 0 
      ? this.menuItems.length - 1 
      : this.selectedIndex - 1;
    
    this.updateMenuDisplay();
  }

  /**
   * Navigate menu selection down
   */
  public navigateDown(): void {
    if (!this.isVisible || this.menuItems.length === 0) return;

    this.selectedIndex = (this.selectedIndex + 1) % this.menuItems.length;
    this.updateMenuDisplay();
  }

  /**
   * Select current menu item
   */
  public selectItem(): void {
    if (!this.isVisible || this.menuItems.length === 0) return;

    const selectedItem = this.menuItems[this.selectedIndex];
    if (selectedItem) {
      this.executeAction(selectedItem);
      this.hide();
    }
  }

  /**
   * Check if context menu is visible
   */
  public isContextMenuVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Get currently selected item index
   */
  public getSelectedIndex(): number {
    return this.selectedIndex;
  }

  /**
   * Create the context menu box widget
   */
  private createMenuBox(config: ContextMenuConfig): void {
    try {
      const content = this.generateMenuContent();
      const { adjustedX, adjustedY } = this.calculatePosition(config.x, config.y);
      const menuWidth = this.calculateMenuWidth();
      const menuHeight = this.menuItems.length + 2; // Add border height

      this.menuBox = blessed.box({
        left: adjustedX,
        top: adjustedY,
        width: menuWidth,
        height: menuHeight,
        content,
        tags: true,
        border: {
          type: 'line',
        },
        style: {
          fg: config.style?.fg || 'white',
          bg: config.style?.bg || 'black',
          border: {
            fg: config.style?.border?.fg || 'gray',
            bg: config.style?.border?.bg || 'black',
          },
        },
        keys: true,
        mouse: true,
      });

      // Set up event handlers
      this.setupMenuEvents();

      this.screen.append(this.menuBox);
      this.menuBox.focus();
      this.screen.render();
    } catch (error) {
      console.error('Failed to create context menu:', error);
      this.isVisible = false;
      this.menuBox = null;
    }
  }

  /**
   * Set up menu event handlers
   */
  private setupMenuEvents(): void {
    if (!this.menuBox) return;

    // Handle keyboard navigation
    this.menuBox.key(['up', 'k'], () => {
      this.navigateUp();
    });

    this.menuBox.key(['down', 'j'], () => {
      this.navigateDown();
    });

    this.menuBox.key(['enter', 'space'], () => {
      this.selectItem();
    });

    this.menuBox.key(['escape', 'q'], () => {
      this.hide();
    });

    // Handle mouse events
    this.menuBox.on('click', (data: any) => {
      if (data && typeof data.y === 'number') {
        // Calculate which menu item was clicked (accounting for border)
        const clickedIndex = data.y - 1; // Subtract border top
        if (clickedIndex >= 0 && clickedIndex < this.menuItems.length) {
          this.selectedIndex = clickedIndex;
          this.selectItem();
        }
      }
    });

    // Handle clicking outside menu (if autoHide is enabled)
    if (this.currentConfig?.autoHide !== false) {
      this.screen.on('click', () => {
        // Small delay to allow menu item clicks to be processed first
        setTimeout(() => {
          if (this.isVisible) {
            this.hide();
          }
        }, 50);
      });
    }
  }

  /**
   * Generate menu content with highlighting
   */
  private generateMenuContent(): string {
    const lines: string[] = [];

    this.menuItems.forEach((item, index) => {
      const isSelected = index === this.selectedIndex;
      const icon = item.icon ? `${item.icon} ` : '';
      const shortcut = item.shortcut ? ` {gray-fg}${item.shortcut}{/gray-fg}` : '';
      
      let line = `${icon}${item.label}${shortcut}`;
      
      if (isSelected) {
        const selectedFg = this.currentConfig?.style?.selectedFg || 'black';
        const selectedBg = this.currentConfig?.style?.selectedBg || 'white';
        line = `{${selectedBg}-bg}{${selectedFg}-fg}${line}{/${selectedFg}-fg}{/${selectedBg}-bg}`;
      }

      lines.push(line);

      // Add separator if specified
      if (item.separator && index < this.menuItems.length - 1) {
        lines.push('{gray-fg}─'.repeat(this.calculateMenuWidth() - 4) + '{/gray-fg}');
      }
    });

    return lines.join('\n');
  }

  /**
   * Update menu display with current selection
   */
  private updateMenuDisplay(): void {
    if (!this.menuBox) return;

    try {
      const content = this.generateMenuContent();
      this.menuBox.setContent(content);
      this.screen.render();
    } catch (error) {
      console.error('Failed to update menu display:', error);
    }
  }

  /**
   * Calculate menu width based on content
   */
  private calculateMenuWidth(): number {
    let maxWidth = 20; // Minimum width

    this.menuItems.forEach(item => {
      const iconLength = item.icon ? item.icon.length + 1 : 0;
      const shortcutLength = item.shortcut ? item.shortcut.length + 1 : 0;
      const itemWidth = iconLength + item.label.length + shortcutLength + 4; // Add padding
      maxWidth = Math.max(maxWidth, itemWidth);
    });

    return Math.min(maxWidth, 60); // Cap at reasonable width
  }

  /**
   * Calculate menu position considering screen bounds
   */
  private calculatePosition(x: number, y: number): { adjustedX: number; adjustedY: number } {
    const screenWidth = this.screen.width || 80;
    const screenHeight = this.screen.height || 24;
    const menuWidth = this.calculateMenuWidth();
    const menuHeight = this.menuItems.length + 2;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust X position to stay within screen bounds
    if (adjustedX + menuWidth > screenWidth) {
      adjustedX = Math.max(0, x - menuWidth);
    }

    // Adjust Y position to stay within screen bounds
    if (adjustedY + menuHeight > screenHeight) {
      adjustedY = Math.max(0, y - menuHeight);
    }

    return { adjustedX, adjustedY };
  }

  /**
   * Execute menu item action
   */
  private executeAction(item: ContextMenuItem): void {
    this.eventBus.emit('contextmenu:action', {
      action: item.action,
      label: item.label,
      context: this.currentConfig?.context,
      componentId: this.currentConfig?.componentId,
      timestamp: new Date(),
    });

    // Also emit specific action events
    this.eventBus.emit(`action:${item.action}`, {
      context: this.currentConfig?.context,
      componentId: this.currentConfig?.componentId,
      source: 'contextmenu',
    });
  }

  /**
   * Destroy the context menu and clean up resources
   */
  public destroy(): void {
    this.hide();
  }
}