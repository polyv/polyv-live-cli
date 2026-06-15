/**
 * @fileoverview Alert panel component for displaying and managing alerts
 * @author Development Team
 * @since 1.0.0
 */

import * as blessed from 'blessed';
import { EventEmitter } from 'events';
import { BaseComponent } from './base.component';
import { ComponentConfig } from '../types/monitoring';
import { 
  Alert, 
  AlertLevel, 
  AlertType, 
  AlertFilter, 
  AlertGrouping, 
  AlertPanelConfig,
  AlertStatistics 
} from '../types/alert';
import { KeyboardEvent } from '../types/interaction';

// Lazy initialize blessed screen
let screen: any = null;
let screenRefCount = 0;

const getScreen = () => {
  if (!screen) {
    try {
      screen = blessed.screen({
        smartCSR: true,
        dockBorders: true,
      });
    } catch (error) {
      // Fallback for test environment
      screen = {
        render: () => {},
        destroy: () => {},
      };
    }
  }
  screenRefCount++;
  return screen;
};

const releaseScreen = () => {
  screenRefCount--;
  if (screenRefCount <= 0 && screen && screen.destroy) {
    try {
      screen.destroy();
    } catch {
      // Ignore destroy errors
    }
    screen = null;
    screenRefCount = 0;
  }
};

/**
 * Alert panel component for comprehensive alert management
 * Displays alerts with multi-level support, filtering, and interactive features
 */
export class AlertPanel extends BaseComponent {
  private container!: blessed.Widgets.BoxElement;
  private alertList!: blessed.Widgets.ListElement;
  private detailsBox!: blessed.Widgets.BoxElement;
  private filterBox!: blessed.Widgets.BoxElement;
  private statisticsBox!: blessed.Widgets.BoxElement;
  private actionBar!: blessed.Widgets.BoxElement;
  
  private alerts: Alert[] = [];
  private filteredAlerts: Alert[] = [];
  private selectedAlertIndex = 0;
  private currentFilter: AlertFilter = {};
  private currentGrouping: AlertGrouping | undefined;
  private panelConfig: AlertPanelConfig;
  
  // Display state
  private showDetailsPane = false;
  private showFilterPane = false;
  private showStatisticsPane = false;
  
  // Note: Color scheme handled in blessed widgets directly
  
  // Icons for alert levels
  private readonly levelIcons: Record<AlertLevel, string> = {
    info: 'ⓘ',
    warning: '⚠',
    error: '✗',
    critical: '🔴'
  };
  
  // Type icons
  private readonly typeIcons: Record<AlertType, string> = {
    system: '⚙',
    stream: '📹',
    channel: '📺',
    network: '🌐'
  };

  constructor(config: ComponentConfig, eventBus: EventEmitter) {
    super(config, eventBus);
    
    // Initialize panel configuration with defaults
    this.panelConfig = {
      maxDisplayItems: 50,
      autoScroll: true,
      showTimestamps: true,
      showSources: true,
      showIds: false,
      timeFormat: 'relative',
      colorCoding: true,
      compactMode: false,
      ...config.config['panelConfig'],
      ...config.config['alertPanel']
    };
    
    this.setupAlertEventListeners();
  }

  /**
   * Set up event listeners for alert-related events
   */
  private setupAlertEventListeners(): void {
    this.subscribe('alert:new', this.handleNewAlert.bind(this));
    this.subscribe('alert:acknowledged', this.handleAlertAcknowledged.bind(this));
    this.subscribe('alert:resolved', this.handleAlertResolved.bind(this));
    this.subscribe('alert:updated', this.handleAlertUpdated.bind(this));
    this.subscribe('alert:filter', this.handleFilterChanged.bind(this));
    this.subscribe('alert:clear', this.handleClearAlerts.bind(this));
  }

  /**
   * Create the widget components
   */
  protected createWidget(): void {
    try {
      // Create main container
      this.widget = blessed.box({
        parent: getScreen(),
        top: this.config.position.y || 0,
        left: this.config.position.x || 0,
        width: this.config.position.width || '100%',
        height: this.config.position.height || '100%',
        label: ' Alert Center ',
        border: { type: 'line' },
        style: {
          border: { fg: 'blue' },
          label: { fg: 'white' },
        },
        keys: true,
        mouse: true,
        scrollable: true,
      });
      
      this.container = this.widget;
      
      this.createAlertList();
      this.createDetailsBox();
      this.createFilterBox();
      this.createStatisticsBox();
      this.createActionBar();
      
      // Use the action bar
      this.actionBar.setContent(this.generateActionBarContent());
      
      this.updateLayout();
      this.bindKeyboardEvents();
      this.bindMouseEvents();
      
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Widget creation failed'));
    }
  }

  /**
   * Create alert list widget
   */
  private createAlertList(): void {
    this.alertList = blessed.list({
      parent: this.container,
      top: 1,
      left: 0,
      width: this.showDetailsPane ? '60%' : '100%',
      height: this.showFilterPane || this.showStatisticsPane ? '70%' : '85%',
      label: ' Alerts ',
      border: { type: 'line' },
      style: {
        border: { fg: 'cyan' },
        selected: { bg: 'blue', fg: 'white' },
        item: { fg: 'white' },
      },
      keys: true,
      mouse: true,
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: ' ',
        track: {
          bg: 'gray',
        },
        style: {
          inverse: true,
        },
      },
    });
  }

  /**
   * Create alert details box
   */
  private createDetailsBox(): void {
    this.detailsBox = blessed.box({
      parent: this.container,
      top: 1,
      left: '60%',
      width: '40%',
      height: this.showFilterPane || this.showStatisticsPane ? '70%' : '85%',
      label: ' Alert Details ',
      border: { type: 'line' },
      style: {
        border: { fg: 'green' },
        label: { fg: 'white' },
      },
      hidden: !this.showDetailsPane,
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      mouse: true,
    });
  }

  /**
   * Create filter configuration box
   */
  private createFilterBox(): void {
    this.filterBox = blessed.box({
      parent: this.container,
      top: '71%',
      left: 0,
      width: this.showDetailsPane ? '60%' : '100%',
      height: '14%',
      label: ' Filter & Search ',
      border: { type: 'line' },
      style: {
        border: { fg: 'yellow' },
        label: { fg: 'white' },
      },
      hidden: !this.showFilterPane,
      scrollable: true,
      content: this.generateFilterContent(),
    });
  }

  /**
   * Create statistics box
   */
  private createStatisticsBox(): void {
    this.statisticsBox = blessed.box({
      parent: this.container,
      top: '71%',
      left: this.showDetailsPane ? '60%' : (this.showFilterPane ? '0%' : '0%'),
      width: this.showDetailsPane ? '40%' : '100%',
      height: '14%',
      label: ' Alert Statistics ',
      border: { type: 'line' },
      style: {
        border: { fg: 'magenta' },
        label: { fg: 'white' },
      },
      hidden: !this.showStatisticsPane,
      content: 'Loading statistics...',
    });
  }

  /**
   * Create action bar
   */
  private createActionBar(): void {
    this.actionBar = blessed.box({
      parent: this.container,
      top: '86%',
      left: 0,
      width: '100%',
      height: '14%',
      label: ' Actions ',
      border: { type: 'line' },
      style: {
        border: { fg: 'white' },
        label: { fg: 'white' },
      },
      content: this.generateActionBarContent(),
    });
  }

  /**
   * Update layout based on current pane visibility
   */
  private updateLayout(): void {
    if (!this.alertList || !this.detailsBox || !this.filterBox || !this.statisticsBox) return;
    
    // Update alert list dimensions
    this.alertList.width = this.showDetailsPane ? '60%' : '100%';
    this.alertList.height = (this.showFilterPane || this.showStatisticsPane) ? '70%' : '85%';
    
    // Update details box
    this.detailsBox.hidden = !this.showDetailsPane;
    this.detailsBox.height = (this.showFilterPane || this.showStatisticsPane) ? '70%' : '85%';
    
    // Update filter box
    this.filterBox.hidden = !this.showFilterPane;
    this.filterBox.width = this.showDetailsPane ? '60%' : '100%';
    
    // Update statistics box
    this.statisticsBox.hidden = !this.showStatisticsPane;
    if (this.showStatisticsPane) {
      if (this.showDetailsPane) {
        this.statisticsBox.left = '60%';
        this.statisticsBox.width = '40%';
      } else if (this.showFilterPane) {
        this.statisticsBox.left = '0%';
        this.statisticsBox.top = '71%';
        this.statisticsBox.width = '100%';
      } else {
        this.statisticsBox.left = '0%';
        this.statisticsBox.width = '100%';
      }
    }
  }

  /**
   * Bind keyboard event handlers
   */
  private bindKeyboardEvents(): void {
    if (!this.alertList) return;
    
    this.alertList.on('select', (_item: any, index: number) => {
      this.selectedAlertIndex = index;
      this.updateDetailsPane();
    });
    
    this.alertList.key(['up', 'k'], () => {
      this.alertList.up(1);
      this.selectedAlertIndex = Math.max(0, this.selectedAlertIndex - 1);
      this.updateDetailsPane();
    });
    
    this.alertList.key(['down', 'j'], () => {
      this.alertList.down(1);
      this.selectedAlertIndex = Math.min(this.filteredAlerts.length - 1, this.selectedAlertIndex + 1);
      this.updateDetailsPane();
    });
  }

  /**
   * Bind mouse event handlers
   */
  private bindMouseEvents(): void {
    if (!this.alertList) return;
    
    this.alertList.on('click', () => {
      this.updateDetailsPane();
    });
  }

  /**
   * Handle custom keyboard events
   */
  protected override handleCustomKeyboard(event: KeyboardEvent): boolean {
    switch (event.key) {
      case 'a':
        this.acknowledgeSelectedAlert();
        return true;
      case 'r':
        this.resolveSelectedAlert();
        return true;
      case 'i':
        this.ignoreSelectedAlert();
        return true;
      case 'n':
        this.addNotesToSelected();
        return true;
      case 'A':
        this.acknowledgeAllFiltered();
        return true;
      case 'S':
        this.resolveAllFiltered();
        return true;
      case 'd':
        this.toggleDetailsPane();
        return true;
      case 'f':
        this.toggleFilterPane();
        return true;
      case 's':
        this.toggleStatisticsPane();
        return true;
      case 'c':
        this.clearAllAlerts();
        return true;
      case 'x':
        this.deleteSelectedAlert();
        return true;
      case 'R':
        this.refreshAlerts();
        return true;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        this.jumpToAlert(parseInt(event.key) - 1);
        return true;
      default:
        return false;
    }
  }

  /**
   * Generate action bar content
   */
  private generateActionBarContent(): string {
    return [
      '{bold}Alert Actions:{/bold}',
      '[a]ck  [r]esolve  [i]gnore  [n]otes  [d]etails  [f]ilter',
      '[A]ck All  [S]olve All  [c]lear  [x]delete  [R]efresh',
      '1-5: Jump to alert    [s]tats    [Esc]Close',
    ].join('\n');
  }

  /**
   * Generate filter content
   */
  private generateFilterContent(): string {
    const activeFilters: string[] = [];
    
    if (this.currentFilter.levels?.length) {
      activeFilters.push(`Levels: ${this.currentFilter.levels.join(', ')}`);
    }
    if (this.currentFilter.types?.length) {
      activeFilters.push(`Types: ${this.currentFilter.types.join(', ')}`);
    }
    if (this.currentFilter.statuses?.length) {
      activeFilters.push(`Status: ${this.currentFilter.statuses.join(', ')}`);
    }
    if (this.currentFilter.searchText) {
      activeFilters.push(`Search: "${this.currentFilter.searchText}"`);
    }
    
    return activeFilters.length > 0 
      ? `Active Filters:\n${activeFilters.join('\n')}` 
      : 'No active filters';
  }

  /**
   * Format alert for display in list
   */
  private formatAlertForList(alert: Alert, index: number): string {
    const icon = this.levelIcons[alert.level];
    const typeIcon = this.typeIcons[alert.type];
    const timestamp = this.formatTimestamp(alert.timestamp);
    const ackStatus = alert.acknowledged ? '✓' : ' ';
    
    if (this.panelConfig.compactMode) {
      return `${icon} ${alert.title} (${alert.source})`;
    }
    
    const parts: string[] = [];
    
    if (this.panelConfig.showIds) {
      parts.push(`[${index + 1}]`);
    }
    
    parts.push(`${icon}${typeIcon}`);
    parts.push(ackStatus);
    
    if (this.panelConfig.showTimestamps) {
      parts.push(`[${timestamp}]`);
    }
    
    parts.push(alert.title);
    
    if (this.panelConfig.showSources) {
      parts.push(`(${alert.source})`);
    }
    
    return parts.join(' ');
  }

  /**
   * Format timestamp based on configuration
   */
  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    
    if (this.panelConfig.timeFormat === 'relative') {
      const now = Date.now();
      const diff = now - timestamp;
      
      if (diff < 60000) { // Less than 1 minute
        return `${Math.floor(diff / 1000)}s ago`;
      } else if (diff < 3600000) { // Less than 1 hour
        return `${Math.floor(diff / 60000)}m ago`;
      } else if (diff < 86400000) { // Less than 1 day
        return `${Math.floor(diff / 3600000)}h ago`;
      } else {
        return `${Math.floor(diff / 86400000)}d ago`;
      }
    } else {
      return date.toLocaleTimeString();
    }
  }

  /**
   * Update alert list display
   */
  private updateAlertList(): void {
    if (!this.alertList) return;
    
    const items = this.filteredAlerts.map((alert, index) => 
      this.formatAlertForList(alert, index)
    );
    
    this.alertList.setItems(items);
    
    if (this.panelConfig.autoScroll && items.length > 0) {
      this.alertList.select(items.length - 1);
      this.selectedAlertIndex = items.length - 1;
    }
    
    // Update list label with count
    const totalCount = this.alerts.length;
    const filteredCount = this.filteredAlerts.length;
    const label = totalCount === filteredCount 
      ? ` Alerts (${totalCount}) `
      : ` Alerts (${filteredCount}/${totalCount}) `;
    
    this.alertList.setLabel(label);
  }

  /**
   * Update details pane content
   */
  private updateDetailsPane(): void {
    if (!this.detailsBox || !this.showDetailsPane) return;
    
    const selectedAlert = this.filteredAlerts[this.selectedAlertIndex];
    if (!selectedAlert) {
      this.detailsBox.setContent('No alert selected');
      return;
    }
    
    const content = this.formatAlertDetails(selectedAlert);
    this.detailsBox.setContent(content);
  }

  /**
   * Format alert details for display
   */
  private formatAlertDetails(alert: Alert): string {
    const lines: string[] = [];
    
    lines.push(`{bold}Alert Details{/bold}`);
    lines.push('');
    lines.push(`ID: ${alert.id}`);
    lines.push(`Level: ${this.levelIcons[alert.level]} ${alert.level.toUpperCase()}`);
    lines.push(`Type: ${this.typeIcons[alert.type]} ${alert.type.toUpperCase()}`);
    lines.push(`Status: ${alert.status.toUpperCase()}`);
    lines.push('');
    lines.push(`{bold}Title:{/bold} ${alert.title}`);
    lines.push('');
    lines.push(`{bold}Message:{/bold}`);
    lines.push(alert.message);
    lines.push('');
    lines.push(`{bold}Source:{/bold} ${alert.source}`);
    
    if (alert.channelId) {
      lines.push(`{bold}Channel:{/bold} ${alert.channelId}`);
    }
    
    lines.push('');
    lines.push(`{bold}Created:{/bold} ${new Date(alert.timestamp).toLocaleString()}`);
    
    if (alert.acknowledged) {
      lines.push(`{bold}Acknowledged:{/bold} ${alert.acknowledgedAt ? new Date(alert.acknowledgedAt).toLocaleString() : 'Yes'}`);
      if (alert.acknowledgedBy) {
        lines.push(`{bold}Acknowledged By:{/bold} ${alert.acknowledgedBy}`);
      }
    }
    
    if (alert.resolvedAt) {
      lines.push(`{bold}Resolved:{/bold} ${new Date(alert.resolvedAt).toLocaleString()}`);
    }
    
    if (alert.notes) {
      lines.push('');
      lines.push(`{bold}Notes:{/bold}`);
      lines.push(alert.notes);
    }
    
    if (alert.metadata && Object.keys(alert.metadata).length > 0) {
      lines.push('');
      lines.push(`{bold}Metadata:{/bold}`);
      Object.entries(alert.metadata).forEach(([key, value]) => {
        lines.push(`  ${key}: ${JSON.stringify(value)}`);
      });
    }
    
    return lines.join('\n');
  }

  /**
   * Apply current filter to alerts
   */
  private applyFilter(): void {
    this.filteredAlerts = this.alerts.filter(alert => {
      // Level filter
      if (this.currentFilter.levels?.length && !this.currentFilter.levels.includes(alert.level)) {
        return false;
      }
      
      // Type filter
      if (this.currentFilter.types?.length && !this.currentFilter.types.includes(alert.type)) {
        return false;
      }
      
      // Status filter
      if (this.currentFilter.statuses?.length && !this.currentFilter.statuses.includes(alert.status)) {
        return false;
      }
      
      // Source filter
      if (this.currentFilter.sources?.length && !this.currentFilter.sources.includes(alert.source)) {
        return false;
      }
      
      // Channel filter
      if (this.currentFilter.channelIds?.length && !this.currentFilter.channelIds.includes(alert.channelId || '')) {
        return false;
      }
      
      // Time range filter
      if (this.currentFilter.timeRange) {
        if (alert.timestamp < this.currentFilter.timeRange.start || 
            alert.timestamp > this.currentFilter.timeRange.end) {
          return false;
        }
      }
      
      // Search text filter
      if (this.currentFilter.searchText) {
        const searchText = this.currentFilter.searchText.toLowerCase();
        return alert.title.toLowerCase().includes(searchText) ||
               alert.message.toLowerCase().includes(searchText) ||
               alert.source.toLowerCase().includes(searchText);
      }
      
      // Acknowledged filter
      if (this.currentFilter.acknowledgedOnly && !alert.acknowledged) {
        return false;
      }
      
      if (this.currentFilter.unacknowledgedOnly && alert.acknowledged) {
        return false;
      }
      
      return true;
    });
    
    // Apply grouping if configured
    if (this.currentGrouping) {
      this.applyGrouping();
    }
    
    // Sort by timestamp (newest first) by default
    this.filteredAlerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Apply grouping to filtered alerts
   */
  private applyGrouping(): void {
    if (!this.currentGrouping) return;
    
    // Group alerts by specified field
    const groups = new Map<any, Alert[]>();
    
    this.filteredAlerts.forEach(alert => {
      const groupKey = alert[this.currentGrouping!.field];
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(alert);
    });
    
    // Sort and limit groups
    this.filteredAlerts = [];
    Array.from(groups.entries()).forEach(([, groupAlerts]) => {
      // Sort within group
      groupAlerts.sort((a, b) => {
        const aVal = a[this.currentGrouping!.field];
        const bVal = b[this.currentGrouping!.field];
        if (aVal === undefined && bVal === undefined) return 0;
        if (aVal === undefined) return 1;
        if (bVal === undefined) return -1;
        return this.currentGrouping!.sortOrder === 'asc' ? 
          (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1);
      });
      
      // Limit group size
      const limitedGroup = this.currentGrouping!.maxPerGroup 
        ? groupAlerts.slice(0, this.currentGrouping!.maxPerGroup)
        : groupAlerts;
      
      this.filteredAlerts.push(...limitedGroup);
    });
  }

  /**
   * Toggle details pane visibility
   */
  private toggleDetailsPane(): void {
    this.showDetailsPane = !this.showDetailsPane;
    this.updateLayout();
    this.updateDetailsPane();
    this.throttledRender();
  }

  /**
   * Toggle filter pane visibility
   */
  private toggleFilterPane(): void {
    this.showFilterPane = !this.showFilterPane;
    this.updateLayout();
    if (this.filterBox) {
      this.filterBox.setContent(this.generateFilterContent());
    }
    this.throttledRender();
  }

  /**
   * Toggle statistics pane visibility
   */
  private toggleStatisticsPane(): void {
    this.showStatisticsPane = !this.showStatisticsPane;
    this.updateLayout();
    this.updateStatistics();
    this.throttledRender();
  }

  /**
   * Update statistics display
   */
  private updateStatistics(): void {
    if (!this.statisticsBox || !this.showStatisticsPane) return;
    
    const stats = this.calculateStatistics();
    const content = this.formatStatistics(stats);
    this.statisticsBox.setContent(content);
  }

  /**
   * Calculate alert statistics
   */
  private calculateStatistics(): AlertStatistics {
    const stats: AlertStatistics = {
      total: this.alerts.length,
      byLevel: { info: 0, warning: 0, error: 0, critical: 0 },
      byType: { system: 0, stream: 0, channel: 0, network: 0 },
      byStatus: { active: 0, acknowledged: 0, resolved: 0, ignored: 0 },
      bySource: {},
      last24Hours: 0,
      mostFrequentType: 'system',
    };
    
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    
    const ackTimes: number[] = [];
    const resolveTimes: number[] = [];
    
    this.alerts.forEach(alert => {
      // By level
      stats.byLevel[alert.level]++;
      
      // By type
      stats.byType[alert.type]++;
      
      // By status
      stats.byStatus[alert.status]++;
      
      // By source
      stats.bySource[alert.source] = (stats.bySource[alert.source] || 0) + 1;
      
      // Last 24 hours
      if (alert.timestamp >= last24Hours) {
        stats.last24Hours++;
      }
      
      // Timing statistics
      if (alert.acknowledged && alert.acknowledgedAt) {
        ackTimes.push(alert.acknowledgedAt - alert.timestamp);
      }
      
      if (alert.resolvedAt) {
        resolveTimes.push(alert.resolvedAt - alert.timestamp);
      }
    });
    
    // Most frequent type
    const typeEntries = Object.entries(stats.byType) as [AlertType, number][];
    stats.mostFrequentType = typeEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    // Average times
    if (ackTimes.length > 0) {
      stats.avgTimeToAck = ackTimes.reduce((a, b) => a + b, 0) / ackTimes.length;
    }
    
    if (resolveTimes.length > 0) {
      stats.avgTimeToResolve = resolveTimes.reduce((a, b) => a + b, 0) / resolveTimes.length;
    }
    
    return stats;
  }

  /**
   * Format statistics for display
   */
  private formatStatistics(stats: AlertStatistics): string {
    const lines: string[] = [];
    
    lines.push(`{bold}Alert Statistics{/bold}`);
    lines.push('');
    lines.push(`Total Alerts: ${stats.total}`);
    lines.push(`Last 24h: ${stats.last24Hours}`);
    lines.push('');
    
    lines.push(`{bold}By Level:{/bold}`);
    Object.entries(stats.byLevel).forEach(([level, count]) => {
      if (count > 0) {
        const icon = this.levelIcons[level as AlertLevel];
        lines.push(`  ${icon} ${level}: ${count}`);
      }
    });
    
    lines.push('');
    lines.push(`{bold}By Type:{/bold}`);
    Object.entries(stats.byType).forEach(([type, count]) => {
      if (count > 0) {
        const icon = this.typeIcons[type as AlertType];
        lines.push(`  ${icon} ${type}: ${count}`);
      }
    });
    
    lines.push('');
    lines.push(`{bold}By Status:{/bold}`);
    Object.entries(stats.byStatus).forEach(([status, count]) => {
      if (count > 0) {
        lines.push(`  ${status}: ${count}`);
      }
    });
    
    if (stats.avgTimeToAck) {
      lines.push('');
      lines.push(`Avg Ack Time: ${Math.round(stats.avgTimeToAck / 1000)}s`);
    }
    
    if (stats.avgTimeToResolve) {
      lines.push(`Avg Resolve Time: ${Math.round(stats.avgTimeToResolve / 60000)}m`);
    }
    
    return lines.join('\n');
  }

  /**
   * Acknowledge selected alert
   */
  private acknowledgeSelectedAlert(): void {
    const alert = this.filteredAlerts[this.selectedAlertIndex];
    if (!alert || alert.acknowledged) return;
    
    this.acknowledgeAlert(alert.id);
  }

  /**
   * Ignore selected alert
   */
  private ignoreSelectedAlert(): void {
    const alert = this.filteredAlerts[this.selectedAlertIndex];
    if (!alert) return;
    
    this.ignoreAlert(alert.id);
  }

  /**
   * Add notes to selected alert
   */
  private addNotesToSelected(): void {
    const alert = this.filteredAlerts[this.selectedAlertIndex];
    if (!alert) return;
    
    // In a real implementation, this would show a text input dialog
    // For now, we'll just emit an event for external handling
    this.emit('alert:request-notes', { alertId: alert.id, alert });
  }

  /**
   * Jump to alert by number (1-5)
   */
  private jumpToAlert(index: number): void {
    if (index >= 0 && index < this.filteredAlerts.length) {
      this.selectAlert(index);
    }
  }


  /**
   * Resolve selected alert
   */
  private resolveSelectedAlert(): void {
    const alert = this.filteredAlerts[this.selectedAlertIndex];
    if (!alert) return;
    
    this.resolveAlert(alert.id);
  }

  /**
   * Delete selected alert
   */
  private deleteSelectedAlert(): void {
    const alert = this.filteredAlerts[this.selectedAlertIndex];
    if (!alert) return;
    
    this.deleteAlert(alert.id);
  }

  /**
   * Clear all alerts
   */
  private clearAllAlerts(): void {
    this.alerts = [];
    this.applyFilter();
    this.updateAlertList();
    this.updateDetailsPane();
    this.updateStatistics();
    this.throttledRender();
    
    this.emit('alert:cleared', { timestamp: Date.now() });
  }

  /**
   * Refresh alerts
   */
  private refreshAlerts(): void {
    this.emit('alert:refresh', { timestamp: Date.now() });
  }

  // Public API methods

  /**
   * Add new alert
   */
  public addAlert(alert: Alert): void {
    this.alerts.unshift(alert); // Add to beginning for newest first
    
    // Limit total alerts in memory
    if (this.alerts.length > this.panelConfig.maxDisplayItems) {
      this.alerts = this.alerts.slice(0, this.panelConfig.maxDisplayItems);
    }
    
    this.applyFilter();
    this.updateAlertList();
    this.updateDetailsPane();
    this.updateStatistics();
    this.throttledRender();
  }


  /**
   * Delete alert
   */
  public deleteAlert(alertId: string): boolean {
    const index = this.alerts.findIndex(a => a.id === alertId);
    if (index === -1) return false;
    
    this.alerts.splice(index, 1);
    
    this.applyFilter();
    this.updateAlertList();
    this.updateDetailsPane();
    this.updateStatistics();
    this.throttledRender();
    
    this.emit('alert:deleted', { alertId, timestamp: Date.now() });
    return true;
  }

  /**
   * Set alert filter
   */
  public setFilter(filter: AlertFilter): void {
    this.currentFilter = { ...filter };
    this.applyFilter();
    this.updateAlertList();
    this.updateDetailsPane();
    this.updateStatistics();
    
    if (this.filterBox) {
      this.filterBox.setContent(this.generateFilterContent());
    }
    
    this.throttledRender();
  }

  /**
   * Set alert grouping
   */
  public setGrouping(grouping?: AlertGrouping): void {
    this.currentGrouping = grouping;
    this.applyFilter();
    this.updateAlertList();
    this.updateDetailsPane();
    this.throttledRender();
  }

  /**
   * Get current alerts
   */
  public getAlerts(): Alert[] {
    return [...this.alerts];
  }

  /**
   * Get filtered alerts
   */
  public getFilteredAlerts(): Alert[] {
    return [...this.filteredAlerts];
  }

  /**
   * Get alert statistics
   */
  public getStatistics(): AlertStatistics {
    return this.calculateStatistics();
  }

  // Alert management methods

  /**
   * Acknowledge the currently selected alert
   */
  public acknowledgeCurrentAlert(user?: string): boolean {
    const alert = this.getSelectedAlert();
    if (!alert) return false;
    return this.acknowledgeAlert(alert.id, user);
  }

  /**
   * Acknowledge alert by ID
   */
  public acknowledgeAlert(alertId: string, user?: string): boolean {
    return this.acknowledgeAlertInternal(alertId, user, true);
  }

  /**
   * Resolve the currently selected alert
   */
  public resolveCurrentAlert(user?: string): boolean {
    const alert = this.getSelectedAlert();
    if (!alert) return false;
    return this.resolveAlert(alert.id, user);
  }

  /**
   * Resolve alert by ID
   */
  public resolveAlert(alertId: string, user?: string): boolean {
    return this.resolveAlertInternal(alertId, user, true);
  }

  /**
   * Ignore the currently selected alert
   */
  public ignoreCurrentAlert(user?: string): boolean {
    const alert = this.getSelectedAlert();
    if (!alert) return false;
    return this.ignoreAlert(alert.id, user);
  }

  /**
   * Ignore alert by ID
   */
  public ignoreAlert(alertId: string, user?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert || alert.status === 'ignored') return false;

    // Update alert status
    alert.status = 'ignored';
    alert.acknowledgedAt = Date.now();
    if (user) {
      alert.acknowledgedBy = user;
    }

    // Apply filter and update displays
    this.applyFilter();
    this.updateAlertList();
    this.updateDetailsPane();
    this.updateStatistics();
    this.throttledRender();

    // Emit event for external systems
    this.emit('alert:ignored', { alertId, alert, user });

    return true;
  }

  /**
   * Acknowledge multiple alerts by their IDs
   */
  public acknowledgeBatch(alertIds: string[], user?: string): { success: string[]; failed: string[] } {
    const result = { success: [] as string[], failed: [] as string[] };

    alertIds.forEach(alertId => {
      if (this.acknowledgeAlertInternal(alertId, user, false)) {
        result.success.push(alertId);
      } else {
        result.failed.push(alertId);
      }
    });

    // Update displays once after batch operation
    this.applyFilter();
    this.updateAlertList();
    this.updateDetailsPane();
    this.updateStatistics();
    this.throttledRender();

    // Emit batch event
    this.emit('alert:batch-acknowledged', { success: result.success, failed: result.failed, user });

    return result;
  }

  /**
   * Resolve multiple alerts by their IDs
   */
  public resolveBatch(alertIds: string[], user?: string): { success: string[]; failed: string[] } {
    const result = { success: [] as string[], failed: [] as string[] };

    alertIds.forEach(alertId => {
      if (this.resolveAlertInternal(alertId, user, false)) {
        result.success.push(alertId);
      } else {
        result.failed.push(alertId);
      }
    });

    // Update displays once after batch operation
    this.applyFilter();
    this.updateAlertList();
    this.updateDetailsPane();
    this.updateStatistics();
    this.throttledRender();

    // Emit batch event
    this.emit('alert:batch-resolved', { success: result.success, failed: result.failed, user });

    return result;
  }

  /**
   * Acknowledge all filtered alerts
   */
  public acknowledgeAllFiltered(user?: string): number {
    const alertIds = this.filteredAlerts
      .filter(alert => !alert.acknowledged)
      .map(alert => alert.id);
    
    const result = this.acknowledgeBatch(alertIds, user);
    return result.success.length;
  }

  /**
   * Resolve all filtered alerts
   */
  public resolveAllFiltered(user?: string): number {
    const alertIds = this.filteredAlerts
      .filter(alert => alert.status === 'active' || alert.status === 'acknowledged')
      .map(alert => alert.id);
    
    const result = this.resolveBatch(alertIds, user);
    return result.success.length;
  }

  /**
   * Add notes to an alert
   */
  public addAlertNotes(alertId: string, notes: string, user?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    // Append notes with timestamp and user
    const timestamp = new Date().toISOString();
    const noteEntry = user ? `[${timestamp}] ${user}: ${notes}` : `[${timestamp}] ${notes}`;
    
    if (alert.notes) {
      alert.notes += '\n' + noteEntry;
    } else {
      alert.notes = noteEntry;
    }

    // Update displays
    this.updateDetailsPane();
    this.throttledRender();

    // Emit event
    this.emit('alert:notes-added', { alertId, alert, notes, user });

    return true;
  }

  /**
   * Get the currently selected alert
   */
  public getSelectedAlert(): Alert | null {
    if (this.selectedAlertIndex >= 0 && this.selectedAlertIndex < this.filteredAlerts.length) {
      return this.filteredAlerts[this.selectedAlertIndex] || null;
    }
    return null;
  }

  /**
   * Select alert by index
   */
  public selectAlert(index: number): boolean {
    if (index >= 0 && index < this.filteredAlerts.length) {
      this.selectedAlertIndex = index;
      if (this.alertList) {
        this.alertList.select(index);
      }
      this.updateDetailsPane();
      this.throttledRender();
      return true;
    }
    return false;
  }

  /**
   * Select alert by ID
   */
  public selectAlertById(alertId: string): boolean {
    const index = this.filteredAlerts.findIndex(alert => alert.id === alertId);
    if (index !== -1) {
      return this.selectAlert(index);
    }
    return false;
  }

  /**
   * Internal method to acknowledge alert
   */
  private acknowledgeAlertInternal(alertId: string, user?: string, shouldUpdate = true): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert || alert.acknowledged) return false;

    // Update alert properties
    alert.acknowledged = true;
    alert.acknowledgedAt = Date.now();
    if (user) {
      alert.acknowledgedBy = user;
    }
    
    // Update status if it's still active
    if (alert.status === 'active') {
      alert.status = 'acknowledged';
    }

    if (shouldUpdate) {
      // Apply filter and update displays
      this.applyFilter();
      this.updateAlertList();
      this.updateDetailsPane();
      this.updateStatistics();
      this.throttledRender();

      // Emit event for external systems
      this.emit('alert:acknowledged', { alertId, alert, user });
    }

    return true;
  }

  /**
   * Internal method to resolve alert
   */
  private resolveAlertInternal(alertId: string, user?: string, shouldUpdate = true): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert || alert.status === 'resolved') return false;

    // Update alert properties
    alert.status = 'resolved';
    alert.resolvedAt = Date.now();
    
    // Auto-acknowledge if not already acknowledged
    if (!alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledgedAt = Date.now();
      if (user) {
        alert.acknowledgedBy = user;
      }
    }

    if (shouldUpdate) {
      // Apply filter and update displays
      this.applyFilter();
      this.updateAlertList();
      this.updateDetailsPane();
      this.updateStatistics();
      this.throttledRender();

      // Emit event for external systems
      this.emit('alert:resolved', { alertId, alert, user });
    }

    return true;
  }

  // Event handlers

  /**
   * Handle new alert event
   */
  private handleNewAlert(data: { alert: Alert }): void {
    this.addAlert(data.alert);
  }

  /**
   * Handle alert acknowledged event
   */
  private handleAlertAcknowledged(data: { alertId: string; user?: string }): void {
    this.acknowledgeAlertInternal(data.alertId, data.user, false);
  }

  /**
   * Handle alert resolved event
   */
  private handleAlertResolved(data: { alertId: string }): void {
    this.resolveAlertInternal(data.alertId, undefined, false);
  }

  /**
   * Handle alert updated event
   */
  private handleAlertUpdated(data: { alert: Alert }): void {
    const index = this.alerts.findIndex(a => a.id === data.alert.id);
    if (index !== -1) {
      this.alerts[index] = data.alert;
      this.applyFilter();
      this.updateAlertList();
      this.updateDetailsPane();
      this.updateStatistics();
      this.throttledRender();
    }
  }

  /**
   * Handle filter changed event
   */
  private handleFilterChanged(data: { filter: AlertFilter }): void {
    this.setFilter(data.filter);
  }

  /**
   * Handle clear alerts event
   */
  private handleClearAlerts(): void {
    this.clearAllAlerts();
  }

  /**
   * Render the component
   */
  public render(): void {
    if (this.isDestroyed) return;
    
    try {
      this.updateAlertList();
      this.updateDetailsPane();
      this.updateStatistics();
      
      const currentScreen = getScreen();
      if (currentScreen && currentScreen.render) {
        currentScreen.render();
      }
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Render failed'));
    }
  }

  /**
   * Update component with new data
   */
  public update(data: any): void {
    if (this.isDestroyed) return;
    
    try {
      // Validate data input
      if (data === null || data === undefined) {
        return; // Silently ignore null/undefined updates
      }
      
      // Handle different types of updates
      if (data.alerts && Array.isArray(data.alerts)) {
        this.alerts = data.alerts;
        this.applyFilter();
      }
      
      if (data.filter && typeof data.filter === 'object') {
        this.setFilter(data.filter);
      }
      
      if (data.grouping) {
        this.setGrouping(data.grouping);
      }
      
      this.updateState({ data, lastUpdate: new Date() });
      this.throttledRender();
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Update failed'));
    }
  }

  /**
   * Destroy the component
   */
  public override destroy(): void {
    this.alerts = [];
    this.filteredAlerts = [];
    super.destroy();
    releaseScreen();
  }
}