/**
 * @fileoverview Context menu factory for generating context-specific menus
 * @author Development Team
 * @since 1.0.0
 */

import { ContextMenuItem } from './context-menu';

/**
 * Context menu factory for generating appropriate menus based on component type
 */
export class ContextMenuFactory {
  /**
   * Generate context menu items based on component type and context
   */
  public static generateMenuItems(
    componentType: string,
    componentId: string,
    additionalContext?: any
  ): ContextMenuItem[] {
    switch (componentType) {
      case 'channel-status':
        return this.createChannelStatusMenu(componentId, additionalContext);
      
      case 'system-resource':
        return this.createSystemResourceMenu();
      
      case 'stream-metrics':
        return this.createStreamMetricsMenu();
      
      case 'help-panel':
        return this.createHelpPanelMenu();
      
      case 'monitoring-dashboard':
        return this.createDashboardMenu();
      
      default:
        return this.createGenericMenu(componentType, componentId);
    }
  }

  /**
   * Create channel status panel context menu
   */
  private static createChannelStatusMenu(
    _channelId: string, 
    context?: any
  ): ContextMenuItem[] {
    const isLive = context?.status === 'live';
    const hasChannelData = context?.channelData !== undefined;

    const items: ContextMenuItem[] = [
      {
        label: 'View Details',
        action: 'channel:view-details',
        icon: '📋',
        shortcut: 'Enter',
        enabled: hasChannelData,
      },
      {
        label: 'Refresh Data',
        action: 'channel:refresh',
        icon: '🔄',
        shortcut: 'F5',
      },
      {
        label: 'separator',
        action: '',
        separator: true,
      } as any,
    ];

    // Add live streaming controls
    if (isLive) {
      items.push(
        {
          label: 'Stop Stream',
          action: 'channel:stop-stream',
          icon: '⏹️',
          shortcut: 'S',
        },
        {
          label: 'View Stream Info',
          action: 'channel:stream-info',
          icon: '📊',
        }
      );
    } else {
      items.push({
        label: 'Start Stream',
        action: 'channel:start-stream',
        icon: '▶️',
        shortcut: 'S',
        enabled: hasChannelData,
      });
    }

    items.push(
      {
        label: 'separator',
        action: '',
        separator: true,
      } as any,
      {
        label: 'Copy Channel ID',
        action: 'channel:copy-id',
        icon: '📋',
        shortcut: 'Ctrl+C',
      },
      {
        label: 'Export Data',
        action: 'channel:export',
        icon: '💾',
      },
      {
        label: 'separator',
        action: '',
        separator: true,
      } as any,
      {
        label: 'Delete Channel',
        action: 'channel:delete',
        icon: '🗑️',
        shortcut: 'Del',
        enabled: hasChannelData && !isLive,
      }
    );

    return items.filter(item => item.label !== 'separator');
  }

  /**
   * Create system resource panel context menu
   */
  private static createSystemResourceMenu(_componentId?: string): ContextMenuItem[] {
    return [
      {
        label: 'Refresh Metrics',
        action: 'system:refresh',
        icon: '🔄',
        shortcut: 'F5',
      },
      {
        label: 'View History',
        action: 'system:view-history',
        icon: '📈',
        shortcut: 'H',
      },
      {
        label: 'separator',
        action: '',
        separator: true,
      } as any,
      {
        label: 'Configure Alerts',
        action: 'system:configure-alerts',
        icon: '⚠️',
      },
      {
        label: 'Export Metrics',
        action: 'system:export',
        icon: '💾',
      },
      {
        label: 'separator',
        action: '',
        separator: true,
      } as any,
      {
        label: 'Reset Counters',
        action: 'system:reset',
        icon: '🔄',
      },
      {
        label: 'Panel Settings',
        action: 'system:settings',
        icon: '⚙️',
      },
    ].filter(item => item.label !== 'separator');
  }

  /**
   * Create stream metrics panel context menu
   */
  private static createStreamMetricsMenu(_componentId?: string): ContextMenuItem[] {
    return [
      {
        label: 'Refresh Metrics',
        action: 'metrics:refresh',
        icon: '🔄',
        shortcut: 'F5',
      },
      {
        label: 'View Details',
        action: 'metrics:view-details',
        icon: '📊',
        shortcut: 'Enter',
      },
      {
        label: 'separator',
        action: '',
        separator: true,
      } as any,
      {
        label: 'Reset Statistics',
        action: 'metrics:reset',
        icon: '🔄',
      },
      {
        label: 'Export Data',
        action: 'metrics:export',
        icon: '💾',
      },
      {
        label: 'separator',
        action: '',
        separator: true,
      } as any,
      {
        label: 'Configure Thresholds',
        action: 'metrics:configure',
        icon: '⚙️',
      },
      {
        label: 'Toggle Fullscreen',
        action: 'metrics:fullscreen',
        icon: '🔳',
        shortcut: 'F11',
      },
    ].filter(item => item.label !== 'separator');
  }

  /**
   * Create help panel context menu
   */
  private static createHelpPanelMenu(): ContextMenuItem[] {
    return [
      {
        label: 'Close Help',
        action: 'help:close',
        icon: '❌',
        shortcut: 'Esc',
      },
      {
        label: 'Print Help',
        action: 'help:print',
        icon: '🖨️',
        shortcut: 'Ctrl+P',
      },
      {
        label: 'separator',
        action: '',
        separator: true,
      } as any,
      {
        label: 'About',
        action: 'help:about',
        icon: 'ℹ️',
      },
    ].filter(item => item.label !== 'separator');
  }

  /**
   * Create dashboard-level context menu
   */
  private static createDashboardMenu(): ContextMenuItem[] {
    return [
      {
        label: 'Refresh All',
        action: 'dashboard:refresh-all',
        icon: '🔄',
        shortcut: 'F5',
      },
      {
        label: 'Clear Screen',
        action: 'dashboard:clear',
        icon: '🧹',
        shortcut: 'Ctrl+L',
      },
      {
        label: 'separator',
        action: '',
        separator: true,
      } as any,
      {
        label: 'Switch Layout',
        action: 'dashboard:switch-layout',
        icon: '🔧',
        submenu: [
          {
            label: 'Compact Layout',
            action: 'layout:compact',
            shortcut: '1',
          },
          {
            label: 'Standard Layout',
            action: 'layout:standard',
            shortcut: '2',
          },
          {
            label: 'Detailed Layout',
            action: 'layout:detailed',
            shortcut: '3',
          },
        ],
      },
      {
        label: 'Settings',
        action: 'dashboard:settings',
        icon: '⚙️',
      },
      {
        label: 'separator',
        action: '',
        separator: true,
      } as any,
      {
        label: 'Help',
        action: 'dashboard:help',
        icon: '❓',
        shortcut: 'F1',
      },
      {
        label: 'Exit',
        action: 'dashboard:exit',
        icon: '🚪',
        shortcut: 'Q',
      },
    ].filter(item => item.label !== 'separator');
  }

  /**
   * Create generic context menu for unknown component types
   */
  private static createGenericMenu(_componentType: string, _componentId: string): ContextMenuItem[] {
    return [
      {
        label: 'Focus Component',
        action: 'component:focus',
        icon: '🎯',
        shortcut: 'Tab',
      },
      {
        label: 'Refresh',
        action: 'component:refresh',
        icon: '🔄',
        shortcut: 'F5',
      },
      {
        label: 'separator',
        action: '',
        separator: true,
      } as any,
      {
        label: 'Properties',
        action: 'component:properties',
        icon: '📋',
      },
      {
        label: 'Toggle Fullscreen',
        action: 'component:fullscreen',
        icon: '🔳',
        shortcut: 'F11',
      },
      {
        label: 'separator',
        action: '',
        separator: true,
      } as any,
      {
        label: 'Help',
        action: 'component:help',
        icon: '❓',
        shortcut: 'F1',
      },
    ].filter(item => item.label !== 'separator');
  }

  /**
   * Filter menu items based on current state or permissions
   */
  public static filterMenuItems(
    items: ContextMenuItem[],
    _context: any = {}
  ): ContextMenuItem[] {
    return items.filter(item => {
      // Filter out disabled items
      if (item.enabled === false) {
        return false;
      }

      // Add context-specific filtering logic here
      // For example, hide certain actions based on user permissions
      
      return true;
    });
  }

  /**
   * Add keyboard shortcuts to menu items based on global shortcuts
   */
  public static addShortcutsToMenuItems(
    items: ContextMenuItem[],
    shortcuts: Map<string, any>
  ): ContextMenuItem[] {
    return items.map(item => {
      // Try to find matching shortcut for this action
      for (const [key, shortcutConfig] of shortcuts) {
        if (shortcutConfig.action === item.action) {
          return {
            ...item,
            shortcut: item.shortcut || key.toUpperCase(),
          };
        }
      }
      return item;
    });
  }
}