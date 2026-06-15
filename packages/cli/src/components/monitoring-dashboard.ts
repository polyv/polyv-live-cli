import blessed from 'blessed';
import { EventEmitter } from 'events';
import { GridManager } from './grid-manager';
import { ComponentRegistry } from './component-registry';
import { MonitoringConfig, ThemeConfig } from '../types/monitoring';
import { StatusComponent, StatusComponentFactory } from './status.component';
import { ChannelStatusPanel, ChannelStatusPanelConfig } from './channel-status.panel';
import { SystemResourcePanel } from './system-resource.panel';
import { InteractionManager } from './interaction-manager';
import { InteractionConfig } from '../types/interaction';
import { HelpPanel } from './help-panel';
import { Tooltip } from './tooltip';
import { ContextMenu } from './context-menu';
import { ContextMenuFactory } from './context-menu-factory';
import { SearchPanel } from './search-panel';
import { LayoutManager } from './layout-manager';

export class MonitoringDashboard {
  private screen: any;
  private gridManager: GridManager;
  private componentRegistry: ComponentRegistry;
  private eventBus: EventEmitter;
  private config: MonitoringConfig;
  private isRunning = false;
  private cleanupHandlers: (() => void)[] = [];
  private interactionManager!: InteractionManager;
  private helpPanel!: HelpPanel;
  private tooltip!: Tooltip;
  private contextMenu!: ContextMenu;
  private searchPanel!: SearchPanel;
  private layoutManager!: LayoutManager;

  constructor(config: MonitoringConfig) {
    this.config = config;
    this.eventBus = new EventEmitter();
    this.eventBus.setMaxListeners(100); // Increase listener limit for monitoring
    
    this.initializeScreen();
    this.setupSignalHandlers();
    this.componentRegistry = new ComponentRegistry(this.eventBus);
    this.registerComponentFactories();
    this.gridManager = new GridManager(
      this.screen,
      this.eventBus,
      12, // rows
      12  // cols
    );
    
    this.setupEventListeners();
    this.setupInteractionManager();
  }

  private registerComponentFactories(): void {
    // Register the status component factory
    this.componentRegistry.registerFactory(StatusComponentFactory);
    
    // Register the channel status panel factory
    const ChannelStatusPanelFactory = {
      type: 'channel-status',
      create: (config: any, eventBus: EventEmitter) => {
        const channelConfig: ChannelStatusPanelConfig = {
          ...config,
          refreshInterval: config.config?.refreshInterval || 5000,
          maxChannels: config.config?.maxChannels || 100,
          showColors: config.config?.showColors !== false,
          columnWidths: config.config?.columnWidths || [20, 12, 10, 10, 15, 15],
          sortField: config.config?.sortField || 'name',
          sortOrder: config.config?.sortOrder || 'asc',
          filters: config.config?.filters || {}
        };
        return new ChannelStatusPanel(channelConfig, eventBus);
      },
    };
    this.componentRegistry.registerFactory(ChannelStatusPanelFactory);
    
    // Create simple placeholder factories for the remaining monitoring components
    const createPlaceholderFactory = (type: string) => ({
      type,
      create: (config: any, eventBus: EventEmitter) => {
        return new StatusComponent({
          ...config,
          type,
        }, eventBus);
      },
    });
    
    // Register system resource panel factory
    const SystemResourcePanelFactory = {
      type: 'system-resources',
      create: (config: any, eventBus: EventEmitter) => {
        return new SystemResourcePanel(config, eventBus);
      },
    };
    this.componentRegistry.registerFactory(SystemResourcePanelFactory);
    
    // Register placeholder factories for other monitoring dashboard components
    this.componentRegistry.registerFactory(createPlaceholderFactory('stream-metrics'));
    this.componentRegistry.registerFactory(createPlaceholderFactory('activity-log'));
  }

  private initializeScreen(): void {
    // Get terminal dimensions with fallbacks
    const width = process.stdout.columns && process.stdout.columns > 0 ? process.stdout.columns : 120;
    const height = process.stdout.rows && process.stdout.rows > 0 ? process.stdout.rows : 30;
    
    // Override with environment variables if provided
    const envWidth = process.env['POLYV_TERMINAL_WIDTH'];
    const envHeight = process.env['POLYV_TERMINAL_HEIGHT'];
    const finalWidth = envWidth && parseInt(envWidth) > 0 ? parseInt(envWidth) : width;
    const finalHeight = envHeight && parseInt(envHeight) > 0 ? parseInt(envHeight) : height;

    this.screen = blessed.screen({
      smartCSR: true,
      title: 'PolyV Live Monitoring Dashboard',
      width: finalWidth,
      height: finalHeight,
      cursor: {
        artificial: true,
        shape: 'line',
        blink: true,
        color: 'white',
      },
      debug: false,
      dockBorders: true,
      fullUnicode: this.config.terminal?.unicodeSupport ?? true,
      sendFocus: true,
      warnings: false,
    });

    // Apply initial theme
    this.applyTheme(this.config.theme);
  }

  private setupSignalHandlers(): void {
    // Handle graceful shutdown
    const handleShutdown = () => {
      this.stop().then(() => {
        process.exit(0);
      }).catch((error) => {
        console.error('Error during shutdown:', error);
        process.exit(1);
      });
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
    process.on('SIGQUIT', handleShutdown);

    // Clean up handlers on destroy
    this.cleanupHandlers.push(() => {
      process.off('SIGINT', handleShutdown);
      process.off('SIGTERM', handleShutdown);
      process.off('SIGQUIT', handleShutdown);
    });
  }

  private setupEventListeners(): void {
    this.eventBus.on('component:error', (data) => {
      this.handleComponentError(data);
    });

    this.eventBus.on('component:requestUpdate', (data) => {
      this.handleComponentUpdateRequest(data);
    });

    this.eventBus.on('layout:changed', (data) => {
      this.handleLayoutChange(data);
    });

    this.eventBus.on('grid:componentAdded', (_data) => {
      this.screen.render();
    });

    this.eventBus.on('grid:componentRemoved', (_data) => {
      this.screen.render();
    });

    // Handle screen events
    this.screen.on('keypress', (ch: any, key: any) => {
      this.handleKeyPress(ch, key);
    });

    this.screen.on('resize', () => {
      this.handleScreenResize();
    });
  }

  private setupInteractionManager(): void {
    // Create interaction configuration
    const interactionConfig: InteractionConfig = {
      mouseEnabled: this.config.terminal?.mouseSupport ?? true,
      keyboardEnabled: true,
      focusRing: {
        enabled: true,
        style: {
          border: { fg: 'cyan' }
        }
      },
      shortcuts: [
        {
          key: 'f5',
          description: 'Refresh all data',
          action: 'refresh',
          global: true,
        },
        {
          key: 'f1',
          description: 'Show help',
          action: 'help',
          global: true,
        },
        {
          key: 'ctrl+r',
          description: 'Refresh screen',
          action: 'refresh-screen',
          global: true,
        },
        {
          key: 'ctrl+l',
          description: 'Clear and redraw screen',
          action: 'clear-screen',
          global: true,
        },
        {
          key: 'ctrl+f',
          description: 'Open search panel',
          action: 'search',
          global: true,
        },
        {
          key: '/',
          description: 'Open search panel',
          action: 'search',
          global: true,
        },
        {
          key: 'f11',
          description: 'Toggle fullscreen panel',
          action: 'fullscreen',
          global: true,
        },
        {
          key: '1',
          description: 'Switch to compact layout',
          action: 'layout:compact',
          global: true,
        },
        {
          key: '2',
          description: 'Switch to standard layout',
          action: 'layout:standard',
          global: true,
        },
        {
          key: '3',
          description: 'Switch to detailed layout',
          action: 'layout:detailed',
          global: true,
        }
      ],
      search: {
        placeholder: 'Search channels...',
        caseSensitive: false,
        mode: 'fuzzy',
        searchFields: ['name', 'channelId', 'status'],
        maxHistory: 10,
        showSuggestions: true,
      },
      statusBar: {
        enabled: true,
        position: 'bottom',
        height: 1,
      },
    };

    // Initialize interaction manager
    this.interactionManager = new InteractionManager(this.screen, interactionConfig);

    // Initialize help panel
    this.helpPanel = new HelpPanel(this.screen, this.eventBus, {
      title: 'PolyV Live Monitoring Dashboard - Help',
      showShortcuts: true,
      showNavigation: true,
      showUsageTips: true,
    });

    // Set shortcuts in help panel
    this.helpPanel.setShortcuts(this.interactionManager.getAllShortcuts());

    // Initialize tooltip system
    this.tooltip = new Tooltip(this.screen, this.eventBus);

    // Initialize context menu system
    this.contextMenu = new ContextMenu(this.screen, this.eventBus);

    // Initialize search panel system
    this.searchPanel = new SearchPanel(this.screen, this.eventBus, {
      placeholder: interactionConfig.search.placeholder,
      caseSensitive: interactionConfig.search.caseSensitive,
      mode: interactionConfig.search.mode,
      searchFields: interactionConfig.search.searchFields,
      maxHistory: interactionConfig.search.maxHistory,
      showSuggestions: interactionConfig.search.showSuggestions,
    });

    // Initialize layout manager system
    this.layoutManager = new LayoutManager(this.screen, this.eventBus);

    // Set up interaction event handlers
    this.setupInteractionEventHandlers();
  }

  private setupInteractionEventHandlers(): void {
    // Handle shortcut actions
    this.interactionManager.on('shortcut:activated', (data) => {
      this.handleShortcutAction(data.action);
    });

    // Handle focus changes
    this.interactionManager.on('focus:changed', (data) => {
      // Update visual focus indicators or perform other focus-related tasks
      this.eventBus.emit('focus:changed', data);
    });

    // Handle component interaction events
    this.interactionManager.on('action:refresh', () => {
      this.refresh();
    });

    this.interactionManager.on('action:help', () => {
      this.showHelp();
    });

    this.interactionManager.on('action:exit', () => {
      this.stop();
    });

    this.interactionManager.on('action:fullscreen', () => {
      this.toggleFullscreen();
    });

    this.interactionManager.on('action:panel', (data) => {
      this.switchToPanel(parseInt(data.panel) - 1);
    });

    // Handle context menus
    this.interactionManager.on('contextmenu:requested', (data) => {
      this.showContextMenu(data.x, data.y, data.context, data.componentId);
    });

    // Handle component hover for tooltips
    this.interactionManager.on('component:hover', (data) => {
      this.showTooltip(data);
    });

    // Handle hover clear
    this.interactionManager.on('component:hover:clear', () => {
      this.tooltip.hide();
    });

    // Handle scroll events
    this.interactionManager.on('scroll:event', (_data) => {
      // Hide tooltip during scrolling
      this.tooltip.hide();
      // Hide context menu during scrolling
      this.contextMenu.hide();
    });

    // Handle context menu actions
    this.eventBus.on('contextmenu:action', (data: any) => {
      this.handleContextMenuAction(data.action, data.componentId, data.context);
    });

    // Handle search events
    this.eventBus.on('search:result:selected', (data: any) => {
      this.handleSearchResultSelected(data.result, data.query);
    });

    this.eventBus.on('search:shown', () => {
      // Hide other panels when search is shown
      this.tooltip.hide();
      this.contextMenu.hide();
    });

    this.eventBus.on('search:hidden', () => {
      // Search panel closed, focus can return to dashboard
    });

    // Handle layout events
    this.eventBus.on('layout:switched', (data: any) => {
      console.log(`Layout switched from ${data.fromLayout} to ${data.toLayout}`);
    });

    this.eventBus.on('layout:size:insufficient', (data: any) => {
      console.log(`Terminal size insufficient for ${data.layout}: required ${data.required.width}x${data.required.height}, current ${data.current.width}x${data.current.height}`);
    });

    this.eventBus.on('panel:fullscreen:entered', (data: any) => {
      console.log(`Panel ${data.panelId} entered fullscreen mode`);
    });

    this.eventBus.on('panel:fullscreen:exited', (data: any) => {
      console.log(`Panel ${data.panelId} exited fullscreen mode`);
    });
  }

  private handleShortcutAction(action: string): void {
    switch (action) {
      case 'refresh':
        this.refresh();
        break;
      case 'refresh-screen':
        this.screen.realloc();
        this.screen.render();
        break;
      case 'clear-screen':
        this.screen.clear();
        this.screen.render();
        break;
      case 'help':
        this.showHelp();
        break;
      case 'search':
        this.showSearch();
        break;
      case 'fullscreen':
        this.toggleFullscreen();
        break;
      case 'layout:compact':
        this.switchLayout('compact');
        break;
      case 'layout:standard':
        this.switchLayout('standard');
        break;
      case 'layout:detailed':
        this.switchLayout('detailed');
        break;
      default:
        // Handle other actions
        break;
    }
  }

  private toggleFullscreen(): void {
    const focused = this.interactionManager.getCurrentFocus();
    if (focused) {
      this.layoutManager.toggleFullscreen(focused);
    }
  }

  private switchLayout(layoutName: string): void {
    try {
      this.layoutManager.switchLayout(layoutName);
    } catch (error) {
      console.error(`Failed to switch to layout ${layoutName}:`, error);
    }
  }

  private switchToPanel(index: number): void {
    const layouts = this.gridManager.getAvailableLayouts();
    if (index >= 0 && index < layouts.length) {
      const layout = layouts[index];
      if (layout) {
        this.setLayout(layout);
      }
    }
  }

  private showContextMenu(x: number, y: number, context: string, componentId?: string): void {
    // Hide tooltip when showing context menu
    this.tooltip.hide();

    // Generate menu items based on context
    const menuItems = ContextMenuFactory.generateMenuItems(
      context || 'global',
      componentId || '',
      this.getComponentContext(componentId, context)
    );

    // Filter and enhance menu items
    const filteredItems = ContextMenuFactory.filterMenuItems(menuItems);
    const enhancedItems = ContextMenuFactory.addShortcutsToMenuItems(
      filteredItems,
      new Map() // TODO: Get shortcuts from InteractionManager
    );

    if (enhancedItems.length === 0) {
      return; // No menu items to show
    }

    // Show context menu
    this.contextMenu.show({
      items: enhancedItems,
      x,
      y,
      context,
      componentId,
      autoHide: true,
      style: {
        fg: 'white',
        bg: 'black',
        selectedFg: 'black',
        selectedBg: 'cyan',
        border: {
          fg: 'gray',
        },
      },
    });
  }

  private getComponentContext(componentId?: string, context?: string): any {
    // Get additional context information for menu generation
    // This would typically include component state, data, etc.
    
    if (!componentId || !context) {
      return {};
    }

    // TODO: Implement context gathering based on component type
    // For now, return basic context
    return {
      componentId,
      context,
      // Add mock data for demonstration
      status: context === 'channel-status' ? 'live' : 'unknown',
      channelData: context === 'channel-status' ? { id: componentId } : undefined,
    };
  }

  private handleContextMenuAction(action: string, componentId?: string, context?: string): void {
    // Handle context menu actions
    switch (action) {
      // Channel actions
      case 'channel:view-details':
        this.handleChannelViewDetails(componentId);
        break;
      case 'channel:refresh':
        this.handleChannelRefresh(componentId);
        break;
      case 'channel:start-stream':
        this.handleChannelStartStream(componentId);
        break;
      case 'channel:stop-stream':
        this.handleChannelStopStream(componentId);
        break;
      case 'channel:stream-info':
        this.handleChannelStreamInfo(componentId);
        break;
      case 'channel:copy-id':
        this.handleChannelCopyId(componentId);
        break;
      case 'channel:export':
        this.handleChannelExport(componentId);
        break;
      case 'channel:delete':
        this.handleChannelDelete(componentId);
        break;

      // System resource actions
      case 'system:refresh':
        this.handleSystemRefresh(componentId);
        break;
      case 'system:view-history':
        this.handleSystemViewHistory(componentId);
        break;
      case 'system:configure-alerts':
        this.handleSystemConfigureAlerts(componentId);
        break;
      case 'system:export':
        this.handleSystemExport(componentId);
        break;
      case 'system:reset':
        this.handleSystemReset(componentId);
        break;
      case 'system:settings':
        this.handleSystemSettings(componentId);
        break;

      // Dashboard actions
      case 'dashboard:refresh-all':
        this.refresh();
        break;
      case 'dashboard:clear':
        this.screen.clear();
        this.screen.render();
        break;
      case 'dashboard:settings':
        this.handleDashboardSettings();
        break;
      case 'dashboard:help':
        this.showHelp();
        break;
      case 'dashboard:exit':
        this.stop();
        break;

      // Generic actions
      case 'component:focus':
        this.handleComponentFocus(componentId);
        break;
      case 'component:refresh':
        this.handleComponentRefresh(componentId);
        break;
      case 'component:fullscreen':
        this.toggleFullscreen();
        break;
      case 'component:help':
        this.showHelp();
        break;

      default:
        console.log(`Unhandled context menu action: ${action}`);
        break;
    }

    // Emit action event for other handlers
    this.eventBus.emit('contextmenu:action:executed', {
      action,
      componentId,
      context,
      timestamp: new Date(),
    });
  }

  private showTooltip(data: { componentId: string; componentType: string; x: number; y: number }): void {
    // Generate tooltip content based on component type and ID
    const content = this.generateTooltipContent(data.componentType, data.componentId);
    
    if (content) {
      this.tooltip.show({
        content,
        x: data.x,
        y: data.y,
        maxWidth: 50,
        autoHideDelay: 3000, // Auto-hide after 3 seconds
        style: {
          fg: 'white',
          bg: 'black',
          border: {
            fg: 'yellow',
          },
        },
      });
    }
  }

  private generateTooltipContent(componentType: string, componentId: string): string {
    // Generate contextual tooltip content based on component type
    switch (componentType) {
      case 'channel-status':
        return `Channel Status Panel\nID: ${componentId}\n\nFeatures:\n• Real-time channel monitoring\n• Status indicators\n• Quick actions\n\nTip: Right-click for menu`;
      
      case 'system-resource':
        return `System Resource Monitor\nID: ${componentId}\n\nShows:\n• CPU usage\n• Memory usage\n• Network activity\n\nTip: Scroll to view history`;
      
      case 'stream-metrics':
        return `Stream Metrics Panel\nID: ${componentId}\n\nMetrics:\n• Bitrate\n• Frame rate\n• Quality indicators\n\nTip: Click to focus panel`;
      
      case 'help-panel':
        return `Help Panel\n\nKeyboard shortcuts:\n• ESC/Q - Close\n• Arrow keys - Scroll\n• Enter - Close`;
      
      default:
        return `${componentType}\nID: ${componentId}\n\nTip: Use Tab to navigate\nPress F1 for help`;
    }
  }

  private handleComponentError(data: any): void {
    // Log error and potentially show notification
    console.error(`Component error (${data.componentId}):`, data.error);
    
    // Emit error event for other components to handle
    this.eventBus.emit('dashboard:error', {
      type: 'component',
      message: data.error,
      componentId: data.componentId,
      timestamp: new Date(),
    });
  }

  private handleComponentUpdateRequest(data: any): void {
    // Handle component update requests
    // This could trigger data fetching or other update operations
    this.eventBus.emit('data:requestUpdate', {
      componentId: data.componentId,
      type: data.type,
      timestamp: data.timestamp,
    });
  }

  private handleLayoutChange(_data: any): void {
    // Reinitialize components based on new layout
    this.reinitializeComponents();
  }

  private handleKeyPress(_ch: any, _key: any): void {
    // Key presses are now handled by InteractionManager
    // This method is kept for backward compatibility but should not be used
  }

  private handleScreenResize(): void {
    // Handle screen resize events
    const width = this.screen.width || 80;
    const height = this.screen.height || 24;
    
    // Check if current layout is still viable
    const currentLayout = this.gridManager.getCurrentLayout();
    const layoutConfig = this.gridManager.getLayoutConfig(currentLayout);
    
    if (layoutConfig && 
        (width < layoutConfig.minTerminalSize.width || 
         height < layoutConfig.minTerminalSize.height)) {
      // Switch to a more compact layout
      this.switchToCompatibleLayout(width, height);
    }
    
    this.screen.render();
  }

  private switchToCompatibleLayout(width: number, height: number): void {
    const layouts = this.gridManager.getAvailableLayouts();
    
    for (const layoutName of layouts) {
      const layoutConfig = this.gridManager.getLayoutConfig(layoutName);
      if (layoutConfig && 
          width >= layoutConfig.minTerminalSize.width && 
          height >= layoutConfig.minTerminalSize.height) {
        this.setLayout(layoutName);
        break;
      }
    }
  }

  private applyTheme(themeName: string): void {
    // Apply theme to screen and components
    // This is a simplified implementation
    const themes: Record<string, Partial<ThemeConfig>> = {
      'default': {
        colors: {
          primary: 'blue',
          secondary: 'cyan',
          background: 'black',
          foreground: 'white',
          accent: 'yellow',
          error: 'red',
          warning: 'yellow',
          success: 'green',
          info: 'blue',
          muted: 'gray',
          highlight: 'yellow',
          border: 'white',
          selection: 'blue',
        },
      },
      dark: {
        colors: {
          primary: 'white',
          secondary: 'gray',
          background: 'black',
          foreground: 'white',
          accent: 'cyan',
          error: 'red',
          warning: 'yellow',
          success: 'green',
          info: 'blue',
          muted: 'gray',
          highlight: 'cyan',
          border: 'gray',
          selection: 'white',
        },
      },
    };

    const theme = themes[themeName] || themes['default'];
    
    this.eventBus.emit('theme:change', {
      theme: themeName,
      config: theme,
      timestamp: new Date(),
    });
  }

  private reinitializeComponents(): void {
    // Clear existing components
    this.componentRegistry.removeAllComponents();
    
    // Create new components based on current layout
    const layout = this.gridManager.getCurrentLayout();
    const layoutConfig = this.gridManager.getLayoutConfig(layout);
    
    if (layoutConfig) {
      for (const componentLayout of layoutConfig.components) {
        try {
          const config = {
            type: componentLayout.type,
            position: componentLayout.position,
            size: componentLayout.size,
            config: componentLayout.config,
            visible: true,
            priority: 1,
          };
          
          const component = this.componentRegistry.createComponent(config);
          this.gridManager.addComponent(component, componentLayout.position);
          
          // Register component with interaction manager if it's focusable
          if (component && typeof component.canFocus === 'function') {
            this.interactionManager.registerComponent(component);
          }

          // Register component with layout manager
          if (component) {
            this.layoutManager.registerPanel(componentLayout.type, component);
          }
        } catch (error) {
          console.error(`Failed to create component ${componentLayout.type}:`, error);
        }
      }
    }
  }


  // Context menu action handlers

  private handleChannelViewDetails(componentId?: string): void {
    console.log(`Viewing details for channel: ${componentId}`);
    // TODO: Implement channel details view
  }

  private handleChannelRefresh(componentId?: string): void {
    console.log(`Refreshing channel: ${componentId}`);
    // TODO: Implement channel refresh
  }

  private handleChannelStartStream(componentId?: string): void {
    console.log(`Starting stream for channel: ${componentId}`);
    // TODO: Implement stream start
  }

  private handleChannelStopStream(componentId?: string): void {
    console.log(`Stopping stream for channel: ${componentId}`);
    // TODO: Implement stream stop
  }

  private handleChannelStreamInfo(componentId?: string): void {
    console.log(`Viewing stream info for channel: ${componentId}`);
    // TODO: Implement stream info view
  }

  private handleChannelCopyId(componentId?: string): void {
    console.log(`Copying channel ID: ${componentId}`);
    // TODO: Implement clipboard copy
  }

  private handleChannelExport(componentId?: string): void {
    console.log(`Exporting channel data: ${componentId}`);
    // TODO: Implement data export
  }

  private handleChannelDelete(componentId?: string): void {
    console.log(`Deleting channel: ${componentId}`);
    // TODO: Implement channel deletion with confirmation
  }

  private handleSystemRefresh(componentId?: string): void {
    console.log(`Refreshing system metrics: ${componentId}`);
    // TODO: Implement system metrics refresh
  }

  private handleSystemViewHistory(componentId?: string): void {
    console.log(`Viewing system history: ${componentId}`);
    // TODO: Implement history view
  }

  private handleSystemConfigureAlerts(componentId?: string): void {
    console.log(`Configuring alerts: ${componentId}`);
    // TODO: Implement alert configuration
  }

  private handleSystemExport(componentId?: string): void {
    console.log(`Exporting system metrics: ${componentId}`);
    // TODO: Implement metrics export
  }

  private handleSystemReset(componentId?: string): void {
    console.log(`Resetting system counters: ${componentId}`);
    // TODO: Implement counter reset
  }

  private handleSystemSettings(componentId?: string): void {
    console.log(`Opening system settings: ${componentId}`);
    // TODO: Implement settings dialog
  }

  private handleDashboardSettings(): void {
    console.log('Opening dashboard settings');
    // TODO: Implement dashboard settings
  }

  private handleComponentFocus(componentId?: string): void {
    if (componentId) {
      this.interactionManager.setFocus(componentId);
    }
  }

  private handleComponentRefresh(componentId?: string): void {
    console.log(`Refreshing component: ${componentId}`);
    // TODO: Implement component-specific refresh
  }

  private showHelp(): void {
    // Update shortcuts in help panel in case they've changed
    this.helpPanel.setShortcuts(this.interactionManager.getAllShortcuts());
    
    // Show the help panel
    this.helpPanel.show();
  }

  private showSearch(): void {
    // Update search data source with current component data
    const searchData = this.gatherSearchableData();
    this.searchPanel.setDataSource(searchData);
    
    // Show the search panel
    this.searchPanel.show();
  }

  private gatherSearchableData(): any[] {
    const searchData: any[] = [];

    // Gather data from all registered components
    const components = this.componentRegistry.getAllComponents();
    
    components.forEach((component, componentId) => {
      try {
        // Try to get searchable data from each component
        if (typeof (component as any).getSearchableData === 'function') {
          const componentData = (component as any).getSearchableData();
          if (Array.isArray(componentData)) {
            componentData.forEach(item => {
              searchData.push({
                ...item,
                componentId,
                componentType: component.constructor.name,
              });
            });
          }
        }
      } catch (error) {
        // Silently ignore components that don't support search
      }
    });

    // Add some mock data for demonstration if no components provide data
    if (searchData.length === 0) {
      searchData.push(
        {
          id: 'ch001',
          name: 'Live Stream Channel 1',
          status: 'live',
          type: 'channel',
          componentType: 'ChannelStatusPanel',
        },
        {
          id: 'ch002', 
          name: 'Test Channel',
          status: 'offline',
          type: 'channel',
          componentType: 'ChannelStatusPanel',
        },
        {
          id: 'sys001',
          name: 'System Resources',
          status: 'active',
          type: 'system',
          componentType: 'SystemResourcePanel',
        }
      );
    }

    return searchData;
  }

  private handleSearchResultSelected(result: any, query: string): void {
    // Handle when user selects a search result
    console.log(`Search result selected: ${result.item.name} (query: ${query})`);
    
    // Try to focus the related component
    if (result.item.componentId) {
      this.interactionManager.setFocus(result.item.componentId);
    }

    // Emit event for other handlers
    this.eventBus.emit('search:action:executed', {
      result,
      query,
      action: 'focus-component',
      timestamp: new Date(),
    });

    // Optionally hide search panel after selection
    this.searchPanel.hide();
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Dashboard is already running');
    }

    try {
      this.isRunning = true;
      
      // Create a simple welcome message instead of complex grid layout
      this.createWelcomeScreen();
      
      // Start monitoring
      this.eventBus.emit('dashboard:started', {
        timestamp: new Date(),
        config: this.config,
      });
      
      // Enable screen
      this.screen.render();
      
      // Start refresh cycle
      this.startRefreshCycle();
      
    } catch (error) {
      this.isRunning = false;
      throw error;
    }
  }

  private createWelcomeScreen(): void {
    // Create a simple welcome box as a temporary solution
    const welcomeBox = blessed.box({
      top: 'center',
      left: 'center',
      width: '80%',
      height: '60%',
      content: this.getWelcomeMessage(),
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
      },
      label: ' PolyV Live Monitoring Dashboard ',
    });

    this.screen.append(welcomeBox);
  }

  private getWelcomeMessage(): string {
    return `
{center}Welcome to PolyV Live Monitoring Dashboard{/center}

{cyan-fg}Dashboard Status:{/cyan-fg}
• Status: Running
• Layout: ${this.config.layout}
• Theme: ${this.config.theme}
• Refresh Interval: ${this.config.refreshInterval}ms

{cyan-fg}Available Commands:{/cyan-fg}
• Press 'q', 'Escape', or 'Ctrl+C' to exit
• Press 'Ctrl+R' to refresh
• Press 'Ctrl+L' to clear screen
• Press '?' or 'h' for help

{cyan-fg}Features (Coming Soon):{/cyan-fg}
• Stream metrics monitoring
• Channel status tracking
• System resource monitoring
• Activity logging

{yellow-fg}Note: This is a basic interface. Full grid-based dashboard is under development.{/yellow-fg}

Press any key to continue monitoring...
    `;
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      this.isRunning = false;
      
      // Stop refresh cycle
      this.stopRefreshCycle();
      
      // Clean up components
      this.componentRegistry.removeAllComponents();
      
      // Clean up managers
      this.gridManager.destroy();
      
      // Clean up interaction manager
      if (this.interactionManager) {
        this.interactionManager.destroy();
      }
      
      // Clean up search panel
      if (this.searchPanel) {
        this.searchPanel.destroy();
      }
      
      // Clean up layout manager
      if (this.layoutManager) {
        this.layoutManager.destroy();
      }
      
      // Clean up event handlers
      this.cleanupHandlers.forEach(handler => handler());
      this.cleanupHandlers = [];
      
      // Clean up screen
      this.screen.destroy();
      
      this.eventBus.emit('dashboard:stopped', {
        timestamp: new Date(),
      });
      
    } catch (error) {
      console.error('Error stopping dashboard:', error);
    }
  }

  public refresh(): void {
    this.eventBus.emit('dashboard:refresh', {
      timestamp: new Date(),
    });
    this.screen.render();
  }

  public setLayout(layoutName: string): void {
    try {
      this.gridManager.setLayout(layoutName);
      this.reinitializeComponents();
      this.screen.render();
    } catch (error) {
      console.error(`Failed to set layout ${layoutName}:`, error);
    }
  }

  public getStatus(): {
    isRunning: boolean;
    layout: string;
    components: number;
    uptime: number;
  } {
    return {
      isRunning: this.isRunning,
      layout: this.gridManager.getCurrentLayout(),
      components: this.componentRegistry.getComponentCount(),
      uptime: this.isRunning ? Date.now() - this.startTime : 0,
    };
  }

  private startTime = Date.now();
  private refreshInterval?: NodeJS.Timeout;

  private startRefreshCycle(): void {
    this.refreshInterval = setInterval(() => {
      if (this.isRunning) {
        this.eventBus.emit('dashboard:tick', {
          timestamp: new Date(),
        });
      }
    }, this.config.refreshInterval);
  }

  private stopRefreshCycle(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined as any;
    }
  }

  public getComponentRegistry(): ComponentRegistry {
    return this.componentRegistry;
  }

  public getGridManager(): GridManager {
    return this.gridManager;
  }

  public getEventBus(): EventEmitter {
    return this.eventBus;
  }

  public getScreen(): any {
    return this.screen;
  }
}