/**
 * @fileoverview Help panel component for displaying keyboard shortcuts and usage information
 * @author Development Team
 * @since 1.0.0
 */

import blessed from 'blessed';
import { EventEmitter } from 'events';
import { ShortcutConfig } from '../types/interaction';

/**
 * Help panel configuration
 */
export interface HelpPanelConfig {
  /** Panel title */
  title?: string;
  /** Whether to show keyboard shortcuts */
  showShortcuts?: boolean;
  /** Whether to show navigation help */
  showNavigation?: boolean;
  /** Whether to show usage tips */
  showUsageTips?: boolean;
  /** Custom help sections */
  customSections?: Array<{
    title: string;
    content: string[];
  }>;
}

/**
 * Help panel for displaying keyboard shortcuts and usage information
 */
export class HelpPanel {
  private screen: any;
  private eventBus: EventEmitter;
  private config: HelpPanelConfig;
  private helpBox: any;
  private shortcuts: ShortcutConfig[] = [];
  private isVisible = false;

  constructor(screen: any, eventBus: EventEmitter, config: HelpPanelConfig = {}) {
    this.screen = screen;
    this.eventBus = eventBus;
    this.config = {
      title: 'PolyV Monitoring Dashboard - Help',
      showShortcuts: true,
      showNavigation: true,
      showUsageTips: true,
      ...config,
    };
  }

  /**
   * Set available shortcuts for display
   */
  public setShortcuts(shortcuts: ShortcutConfig[]): void {
    this.shortcuts = shortcuts;
  }

  /**
   * Show the help panel
   */
  public show(): void {
    if (this.isVisible) return;
    
    this.createHelpBox();
    this.isVisible = true;
    
    this.eventBus.emit('help:shown', {
      timestamp: new Date(),
    });
  }

  /**
   * Hide the help panel
   */
  public hide(): void {
    if (!this.isVisible || !this.helpBox) return;
    
    try {
      this.screen.remove(this.helpBox);
      this.helpBox = null;
      this.isVisible = false;
      this.screen.render();
      
      this.eventBus.emit('help:hidden', {
        timestamp: new Date(),
      });
    } catch (error) {
      // Handle errors gracefully
      console.error('Failed to hide help panel:', error);
      this.helpBox = null;
      this.isVisible = false;
    }
  }

  /**
   * Toggle help panel visibility
   */
  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Create the help box widget
   */
  private createHelpBox(): void {
    try {
      const content = this.generateHelpContent();
      
      this.helpBox = blessed.box({
        top: 'center',
        left: 'center',
        width: '90%',
        height: '90%',
        content,
        tags: true,
        border: {
          type: 'line',
        },
        style: {
          fg: 'white',
          bg: 'black',
          border: {
            fg: 'cyan',
          },
          scrollbar: {
            bg: 'cyan',
            fg: 'white',
          },
        },
        label: ` ${this.config.title} `,
        scrollable: true,
        alwaysScroll: true,
        mouse: true,
        keys: true,
        vi: true,
      });

      // Set up event handlers
      this.setupHelpBoxEvents();
      
      // Add to screen and focus
      this.screen.append(this.helpBox);
      this.helpBox.focus();
      this.screen.render();
    } catch (error) {
      // Handle errors gracefully - help panel failure shouldn't crash the app
      console.error('Failed to create help panel:', error);
      this.isVisible = false;
      this.helpBox = null;
    }
  }

  /**
   * Set up help box event handlers
   */
  private setupHelpBoxEvents(): void {
    if (!this.helpBox) return;

    // Close on escape, enter, or q
    this.helpBox.key(['escape', 'enter', 'q', 'C-c'], () => {
      this.hide();
    });

    // Scroll with arrow keys
    this.helpBox.key(['up', 'down', 'pageup', 'pagedown'], (_ch: any, key: any) => {
      switch (key.name) {
        case 'up':
          this.helpBox.scroll(-1);
          break;
        case 'down':
          this.helpBox.scroll(1);
          break;
        case 'pageup':
          this.helpBox.scroll(-10);
          break;
        case 'pagedown':
          this.helpBox.scroll(10);
          break;
      }
      this.screen.render();
    });

    // Handle mouse wheel
    this.helpBox.on('wheelup', () => {
      this.helpBox.scroll(-3);
      this.screen.render();
    });

    this.helpBox.on('wheeldown', () => {
      this.helpBox.scroll(3);
      this.screen.render();
    });
  }

  /**
   * Generate help content
   */
  private generateHelpContent(): string {
    const sections: string[] = [];

    // Title and introduction
    sections.push('{center}{bold}PolyV Live Monitoring Dashboard - Help{/bold}{/center}');
    sections.push('');
    sections.push('Welcome to the PolyV Live Streaming Monitoring Dashboard!');
    sections.push('This interactive terminal interface provides real-time monitoring of your live streaming services.');
    sections.push('');

    // Navigation help
    if (this.config.showNavigation) {
      sections.push('{cyan-fg}{bold}Navigation:{/bold}{/cyan-fg}');
      sections.push('  {bold}Tab{/bold}           - Move focus to next component');
      sections.push('  {bold}Shift+Tab{/bold}     - Move focus to previous component');
      sections.push('  {bold}Arrow Keys{/bold}    - Navigate within lists and tables');
      sections.push('  {bold}Home/End{/bold}      - Move to first/last component');
      sections.push('  {bold}Enter{/bold}         - Activate selected item');
      sections.push('  {bold}Escape{/bold}        - Cancel operation or close dialogs');
      sections.push('');
    }

    // Keyboard shortcuts
    if (this.config.showShortcuts && this.shortcuts.length > 0) {
      sections.push('{cyan-fg}{bold}Keyboard Shortcuts:{/bold}{/cyan-fg}');
      
      // Group shortcuts by category
      const categories = this.groupShortcutsByCategory();
      
      for (const [category, shortcuts] of Object.entries(categories)) {
        if (shortcuts.length > 0) {
          sections.push(`  {yellow-fg}{bold}${category}:{/bold}{/yellow-fg}`);
          
          shortcuts.forEach(shortcut => {
            const keyDisplay = this.formatKeyForDisplay(shortcut.key);
            const spacing = ' '.repeat(Math.max(1, 15 - keyDisplay.length));
            sections.push(`    {bold}${keyDisplay}{/bold}${spacing}- ${shortcut.description}`);
          });
          
          sections.push('');
        }
      }
    }

    // Usage tips
    if (this.config.showUsageTips) {
      sections.push('{cyan-fg}{bold}Usage Tips:{/bold}{/cyan-fg}');
      sections.push('  • Use Tab to navigate between different monitoring panels');
      sections.push('  • Press F5 to refresh all data or Ctrl+R for current panel');
      sections.push('  • Right-click on components for context menus');
      sections.push('  • Use number keys (1-9) to quickly switch layouts');
      sections.push('  • Press "/" or Ctrl+F to search in channel lists');
      sections.push('  • Press F11 to toggle fullscreen for focused panel');
      sections.push('  • Use arrow keys and Page Up/Down to scroll in this help');
      sections.push('');
    }

    // Custom sections
    if (this.config.customSections) {
      this.config.customSections.forEach(section => {
        sections.push(`{cyan-fg}{bold}${section.title}:{/bold}{/cyan-fg}`);
        section.content.forEach(line => {
          sections.push(`  ${line}`);
        });
        sections.push('');
      });
    }

    // Footer
    sections.push('{center}{yellow-fg}Press Escape, Enter, or Q to close this help{/yellow-fg}{/center}');
    sections.push('{center}{gray-fg}Use arrow keys or mouse wheel to scroll{/gray-fg}{/center}');

    return sections.join('\n');
  }

  /**
   * Group shortcuts by category
   */
  private groupShortcutsByCategory(): Record<string, ShortcutConfig[]> {
    const categories: Record<string, ShortcutConfig[]> = {
      'Data & Refresh': [],
      'Navigation': [],
      'Panels & Layout': [],
      'Search & Filter': [],
      'Application': [],
      'Other': [],
    };

    this.shortcuts.forEach(shortcut => {
      const action = shortcut.action.toLowerCase();
      
      if (action.includes('refresh') || action.includes('update')) {
        categories['Data & Refresh']?.push(shortcut);
      } else if (action.includes('layout') || action.includes('panel') || action.includes('fullscreen')) {
        categories['Panels & Layout']?.push(shortcut);
      } else if (action.includes('search') || action.includes('filter')) {
        categories['Search & Filter']?.push(shortcut);
      } else if (action.includes('exit') || action.includes('help') || action.includes('cancel')) {
        categories['Application']?.push(shortcut);
      } else {
        categories['Other']?.push(shortcut);
      }
    });

    // Remove empty categories
    Object.keys(categories).forEach(key => {
      if (categories[key]?.length === 0) {
        delete categories[key];
      }
    });

    return categories;
  }

  /**
   * Format keyboard key for display
   */
  private formatKeyForDisplay(key: string): string {
    return key
      .replace(/ctrl\+/gi, 'Ctrl+')
      .replace(/alt\+/gi, 'Alt+')
      .replace(/shift\+/gi, 'Shift+')
      .replace(/meta\+/gi, 'Meta+')
      .replace(/f(\d+)/gi, 'F$1')
      .replace(/^(.)$/, (match) => match.toUpperCase());
  }

  /**
   * Check if help panel is visible
   */
  public isHelpVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Update help configuration
   */
  public updateConfig(config: Partial<HelpPanelConfig>): void {
    this.config = { ...this.config, ...config };
    
    // If help is visible, recreate it with new config
    if (this.isVisible) {
      this.hide();
      this.show();
    }
  }

  /**
   * Destroy the help panel and clean up resources
   */
  public destroy(): void {
    this.hide();
    this.shortcuts = [];
  }
}