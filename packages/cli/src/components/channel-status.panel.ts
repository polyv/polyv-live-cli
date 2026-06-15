/**
 * @fileoverview Channel status panel component for displaying channel health monitoring
 * @author Development Team
 * @since 5.3.0
 */

import { EventEmitter } from 'events';
import blessed from 'blessed';
import { table as createTable, Table, TableOptions } from 'blessed-contrib';
import { BaseComponent } from './base.component';
import { ComponentConfig } from '../types/monitoring';
import { ChannelDetailModel } from '../types/channel';
import { ChannelDetailsPopup } from './channel-details.popup';
import { BatchOperationsDialog } from './batch-operations.dialog';

/**
 * Watch status type definition matching PolyV API
 */
export type WatchStatus = 'live' | 'playback' | 'end' | 'waiting' | 'unStart' | 'banpush';

/**
 * Channel status information for display
 */
export interface ChannelStatusInfo {
  channelId: string;
  name: string;
  status: WatchStatus;
  statusText: string;
  viewerCount: number;
  maxViewer: number;
  publisher: string;
  startTime: number;
  endTime: number;
  createdTime: number;
  selected?: boolean;
}

/**
 * Configuration for channel status panel
 */
export interface ChannelStatusPanelConfig extends ComponentConfig {
  /** Refresh interval in milliseconds */
  refreshInterval: number;
  /** Maximum number of channels to display */
  maxChannels: number;
  /** Show status colors */
  showColors: boolean;
  /** Column widths for table display */
  columnWidths: number[];
  /** Default sort field */
  sortField: keyof ChannelStatusInfo;
  /** Default sort order */
  sortOrder: 'asc' | 'desc';
  /** Filter settings */
  filters: {
    status?: WatchStatus[];
    searchTerm?: string;
  };
}

/**
 * Sort configuration
 */
export interface SortConfig {
  field: keyof ChannelStatusInfo;
  order: 'asc' | 'desc';
  secondaryField?: keyof ChannelStatusInfo;
  secondaryOrder?: 'asc' | 'desc';
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  status?: WatchStatus[];
  searchTerm?: string;
  viewerCountMin?: number;
  viewerCountMax?: number;
  publisherFilter?: string;
  dateRange?: {
    startDate?: Date;
    endDate?: Date;
  };
}

/**
 * Channel status panel component for table-style monitoring
 */
export class ChannelStatusPanel extends BaseComponent {
  private table!: Table;
  private container!: blessed.Widgets.BoxElement;
  private headerBox!: blessed.Widgets.BoxElement;
  private footerBox!: blessed.Widgets.BoxElement;
  private noDataBox!: blessed.Widgets.BoxElement;
  private detailsPopup!: ChannelDetailsPopup;
  private batchDialog!: BatchOperationsDialog;
  
  private channels: ChannelStatusInfo[] = [];
  private filteredChannels: ChannelStatusInfo[] = [];
  private selectedChannels: Set<string> = new Set();
  private currentIndex = 0;
  private sortConfig: SortConfig;
  private filterConfig: FilterConfig;
  private lastUpdateTime: Date;
  
  // Enhanced navigation state
  private selectionStartIndex = -1;
  private isRangeSelecting = false;
  private lastJumpPosition = 0;
  private navigationHistory: number[] = [];

  constructor(config: ChannelStatusPanelConfig, eventBus: EventEmitter) {
    super(config, eventBus);
    
    this.sortConfig = {
      field: config.sortField || 'name',
      order: config.sortOrder || 'asc'
    };
    
    this.filterConfig = config.filters || {};
    this.lastUpdateTime = new Date();
  }

  /**
   * Creates the blessed widget structure for the component
   */
  protected createWidget(): void {
    // Main container
    this.container = blessed.box({
      label: ' Channel Status Monitor ',
      border: { type: 'line' },
      style: {
        fg: 'white',
        bg: 'black',
        border: { fg: 'cyan' }
      },
      top: this.config.position.y,
      left: this.config.position.x,
      width: this.config.position.width,
      height: this.config.position.height,
      scrollable: false,
      mouse: true,
      keys: true,
      vi: true,
      tags: true
    });

    // Header box for status and controls
    this.headerBox = blessed.box({
      parent: this.container,
      top: 0,
      left: 0,
      width: '100%',
      height: 2,
      content: this.getHeaderContent(),
      style: { fg: 'yellow' },
      tags: true
    });

    // Footer box for help and navigation info
    this.footerBox = blessed.box({
      parent: this.container,
      bottom: 0,
      left: 0,
      width: '100%',
      height: 2,
      content: this.getFooterContent(),
      style: { fg: 'gray' },
      tags: true
    });

    // Table configuration
    const tableConfig: TableOptions = {
      keys: true,
      interactive: true,
      columnSpacing: 2,
      columnWidth: this.getConfig().columnWidths || [20, 12, 10, 10, 15, 15],
      style: {
        fg: 'white',
        bg: 'black',
        border: { fg: 'gray' },
        header: { fg: 'cyan', bold: true },
        cell: { fg: 'white' },
        selected: { bg: 'blue', fg: 'white' }
      }
    };

    // Create table widget
    this.table = createTable(tableConfig);
    this.table.parent = this.container;
    this.table.top = 2;
    this.table.left = 0;
    this.table.width = '100%';
    this.table.height = 'bottom-2';

    // No data message box (initially hidden)
    this.noDataBox = blessed.box({
      parent: this.container,
      top: 'center',
      left: 'center',
      width: 'shrink',
      height: 'shrink',
      content: this.getNoDataMessage(),
      style: { fg: 'gray' },
      tags: true,
      hidden: true
    });

    this.widget = this.container;

    // Initialize channel details popup
    this.initializeDetailsPopup();
    
    // Initialize batch operations dialog
    this.initializeBatchDialog();

    // Set up keyboard bindings
    this.setupKeyBindings();

    // Initialize table display
    this.updateTableDisplay();
  }

  /**
   * Initializes the channel details popup
   */
  private initializeDetailsPopup(): void {
    this.detailsPopup = new ChannelDetailsPopup({
      screen: this.widget.screen,
      eventBus: this.eventBus,
      showColors: this.getConfig().showColors,
      refreshInterval: this.getConfig().refreshInterval
    });
  }
  
  /**
   * Initializes the batch operations dialog
   */
  private initializeBatchDialog(): void {
    this.batchDialog = new BatchOperationsDialog({
      screen: this.widget.screen,
      eventBus: this.eventBus,
      showColors: this.getConfig().showColors
    });
  }

  /**
   * Sets up keyboard bindings for the component
   */
  private setupKeyBindings(): void {
    // Navigation keys
    this.container.key(['up', 'k'], () => {
      this.moveSelection(-1);
    });

    this.container.key(['down', 'j'], () => {
      this.moveSelection(1);
    });

    this.container.key(['pageup'], () => {
      this.moveSelection(-10);
    });

    this.container.key(['pagedown'], () => {
      this.moveSelection(10);
    });

    this.container.key(['home'], () => {
      this.moveToTop();
    });

    this.container.key(['end'], () => {
      this.moveToBottom();
    });

    // Selection keys
    this.container.key(['space'], () => {
      this.toggleSelection();
    });

    this.container.key(['enter'], () => {
      this.showChannelDetails();
    });

    // Sorting keys
    this.container.key(['s'], () => {
      this.cycleSortField();
    });

    this.container.key(['S'], () => {
      this.toggleSortOrder();
    });

    // Filter keys
    this.container.key(['f'], () => {
      this.showFilterDialog();
    });

    this.container.key(['F'], () => {
      this.showAdvancedFilterDialog();
    });

    this.container.key(['c'], () => {
      this.clearFilters();
    });

    // Quick filter keys
    this.container.key(['1'], () => {
      this.quickFilterByStatus('live');
    });

    this.container.key(['2'], () => {
      this.quickFilterByStatus('waiting');
    });

    this.container.key(['3'], () => {
      this.quickFilterByStatus('end');
    });

    this.container.key(['4'], () => {
      this.quickFilterByStatus('banpush');
    });

    // Refresh and other controls
    this.container.key(['r', 'R', 'f5'], () => {
      this.requestUpdate();
    });

    // Batch operations
    this.container.key(['a'], () => {
      this.selectAll();
    });

    this.container.key(['A'], () => {
      this.deselectAll();
    });

    this.container.key(['d'], () => {
      this.showBatchOperations();
    });

    // Enhanced navigation
    this.container.key(['g'], () => {
      this.moveToTop();
    });

    this.container.key(['G'], () => {
      this.moveToBottom();
    });

    // Jump navigation
    this.container.key(['ctrl+f'], () => {
      this.showQuickJumpDialog();
    });

    this.container.key(['ctrl+g'], () => {
      this.showGoToLineDialog();
    });

    // Selection range
    this.container.key(['shift+up', 'shift+k'], () => {
      this.extendSelectionUp();
    });

    this.container.key(['shift+down', 'shift+j'], () => {
      this.extendSelectionDown();
    });

    // Copy selection info
    this.container.key(['ctrl+c'], () => {
      this.copySelectionInfo();
    });
  }

  /**
   * Renders the component
   */
  public render(): void {
    if (this.isDestroyed || !this.widget) return;

    try {
      this.updateHeader();
      this.updateFooter();
      this.updateTableDisplay();
      this.widget.screen?.render();
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Unknown render error'));
    }
  }

  /**
   * Updates component with new channel data
   * @param data Channel data array or single channel
   */
  public update(data: ChannelDetailModel[] | ChannelDetailModel | { channels: ChannelDetailModel[] }): void {
    if (this.isDestroyed) return;

    try {
      let channelsArray: ChannelDetailModel[];

      // Normalize input data to array format
      if (Array.isArray(data)) {
        channelsArray = data;
      } else if ('channels' in data && Array.isArray(data.channels)) {
        channelsArray = data.channels;
      } else {
        channelsArray = [data as ChannelDetailModel];
      }

      // Convert to ChannelStatusInfo format
      this.channels = channelsArray.map(channel => this.convertToStatusInfo(channel));

      // Apply current filters and sorting
      this.applyFiltersAndSort();

      this.lastUpdateTime = new Date();
      this.updateState({ lastUpdate: this.lastUpdateTime });

      // Show/hide no data message
      if (this.channels.length === 0) {
        this.noDataBox.show();
        this.table.hide();
      } else {
        this.noDataBox.hide();
        this.table.show();
      }

      // 触发状态颜色动态更新
      this.updateStatusColors();

    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Failed to update channel status'));
    }
  }

  /**
   * Converts ChannelDetailModel to ChannelStatusInfo
   */
  private convertToStatusInfo(channel: ChannelDetailModel): ChannelStatusInfo {
    const selectedChannels = this.selectedChannels || new Set();
    return {
      channelId: channel.channelId.toString(),
      name: channel.name,
      status: channel.watchStatus,
      statusText: channel.watchStatusText,
      viewerCount: channel.pageView || 0,
      maxViewer: channel.maxViewer || 0,
      publisher: channel.publisher || '',
      startTime: channel.startTime || 0,
      endTime: channel.endTime || 0,
      createdTime: channel.createdTime || 0,
      selected: selectedChannels.has(channel.channelId.toString())
    };
  }

  /**
   * Compares two values for sorting
   */
  private compareValues(a: any, b: any): number {
    if (a === undefined && b === undefined) return 0;
    if (a === undefined) return 1;
    if (b === undefined) return -1;
    
    // Handle string comparison
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }
    
    // Handle numeric comparison
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    
    // Handle mixed types - convert to string
    return String(a).localeCompare(String(b));
  }

  /**
   * Applies current filters and sorting to channel data
   */
  private applyFiltersAndSort(): void {
    const channels = this.channels || [];
    
    // Apply filters
    this.filteredChannels = channels.filter(channel => {
      // Status filter
      if (this.filterConfig.status && this.filterConfig.status.length > 0) {
        if (!this.filterConfig.status.includes(channel.status)) {
          return false;
        }
      }

      // Search term filter (supports multiple keywords)
      if (this.filterConfig.searchTerm) {
        const searchTerms = this.filterConfig.searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);
        const searchableText = `${channel.name} ${channel.channelId} ${channel.publisher} ${channel.statusText}`.toLowerCase();
        
        // 支持AND搜索：所有关键词都必须匹配
        const allTermsMatch = searchTerms.every(term => searchableText.includes(term));
        if (!allTermsMatch) {
          return false;
        }
      }

      // Viewer count range filter
      if (this.filterConfig.viewerCountMin !== undefined && channel.viewerCount < this.filterConfig.viewerCountMin) {
        return false;
      }
      if (this.filterConfig.viewerCountMax !== undefined && channel.viewerCount > this.filterConfig.viewerCountMax) {
        return false;
      }

      // Publisher filter
      if (this.filterConfig.publisherFilter) {
        const publisherFilter = this.filterConfig.publisherFilter.toLowerCase();
        if (!channel.publisher.toLowerCase().includes(publisherFilter)) {
          return false;
        }
      }

      // Date range filter
      if (this.filterConfig.dateRange) {
        const channelDate = new Date(channel.createdTime);
        if (this.filterConfig.dateRange.startDate && channelDate < this.filterConfig.dateRange.startDate) {
          return false;
        }
        if (this.filterConfig.dateRange.endDate && channelDate > this.filterConfig.dateRange.endDate) {
          return false;
        }
      }

      return true;
    });

    // Apply sorting with multi-field support
    this.filteredChannels.sort((a, b) => {
      // Primary field comparison
      const aVal = a[this.sortConfig.field];
      const bVal = b[this.sortConfig.field];
      
      let comparison = this.compareValues(aVal, bVal);
      
      // If primary fields are equal and secondary field is specified, compare secondary
      if (comparison === 0 && this.sortConfig.secondaryField) {
        const aSecVal = a[this.sortConfig.secondaryField];
        const bSecVal = b[this.sortConfig.secondaryField];
        comparison = this.compareValues(aSecVal, bSecVal);
        
        // Apply secondary sort order
        if (this.sortConfig.secondaryOrder === 'desc') {
          comparison = -comparison;
        }
      }
      
      // Apply primary sort order
      return this.sortConfig.order === 'asc' ? comparison : -comparison;
    });

    // Update current index if needed
    const filteredChannels = this.filteredChannels || [];
    if (this.currentIndex >= filteredChannels.length) {
      this.currentIndex = Math.max(0, filteredChannels.length - 1);
    }
  }

  /**
   * Updates the table display with current data
   */
  private updateTableDisplay(): void {
    if (!this.table) return;

    const headers = ['Channel Name', 'Status', 'Viewers', 'Max', 'Publisher', 'Created'];
    const data: string[][] = [];

    const channels = this.filteredChannels || [];
    const selectedChannels = this.selectedChannels || new Set();

    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i];
      if (!channel) continue;
      
      const isSelected = selectedChannels.has(channel.channelId);
      const isCurrent = i === this.currentIndex;
      
      const row = [
        this.formatCellValue(channel.name, isSelected, isCurrent),
        this.formatStatusCell(channel.status, channel.statusText, isSelected, isCurrent),
        this.formatCellValue(channel.viewerCount.toString(), isSelected, isCurrent),
        this.formatCellValue(channel.maxViewer.toString(), isSelected, isCurrent),
        this.formatCellValue(channel.publisher, isSelected, isCurrent),
        this.formatCellValue(this.formatDate(new Date(channel.createdTime)), isSelected, isCurrent)
      ];
      
      data.push(row);
    }

    this.table.setData({
      headers,
      data
    });
  }

  /**
   * Formats a cell value with appropriate styling
   */
  private formatCellValue(value: string, isSelected: boolean, isCurrent: boolean): string {
    if (isCurrent) {
      return `{inverse}${isSelected ? '✓ ' : ''}${value}{/inverse}`;
    }
    return isSelected ? `{cyan-fg}✓ ${value}{/cyan-fg}` : value;
  }

  /**
   * Formats status cell with color coding and health indicators
   */
  private formatStatusCell(status: WatchStatus, statusText: string, isSelected: boolean, isCurrent: boolean): string {
    const colors = this.getStatusColors(status);
    const safeColor = this.getTerminalSafeColor(colors.fg);
    const prefix = isCurrent ? '{inverse}' : '';
    const suffix = isCurrent ? '{/inverse}' : '';
    const checkmark = isSelected ? '✓ ' : '';
    const icon = colors.icon || '';
    
    // 动态颜色更新：根据状态变化添加不同的视觉效果
    const healthLevel = this.getStatusHealthLevel(status);
    let statusDisplay = statusText;
    
    // 为不同健康状态添加视觉指示器
    switch (healthLevel) {
      case 'healthy':
        statusDisplay = `${icon} ${statusText}`;
        break;
      case 'warning':
        statusDisplay = `${icon} ${statusText}`;
        break;
      case 'error':
        statusDisplay = `${icon} ${statusText}`;
        break;
    }
    
    return `${prefix}{${safeColor}-fg}${checkmark}${statusDisplay}{/${safeColor}-fg}${suffix}`;
  }

  /**
   * Updates status colors dynamically when status changes
   */
  private updateStatusColors(): void {
    // 触发状态颜色的动态更新
    this.throttledRender();
    
    // 发出状态变化事件，用于其他组件监听
    this.emit('component:statusChanged', {
      componentId: this.state.id,
      healthSummary: this.getChannelHealthSummary(),
      timestamp: new Date()
    });
  }

  /**
   * Gets overall channel health summary
   */
  private getChannelHealthSummary(): { healthy: number; warning: number; error: number } {
    const channels = this.filteredChannels || [];
    const summary = { healthy: 0, warning: 0, error: 0 };
    
    channels.forEach(channel => {
      const healthLevel = this.getStatusHealthLevel(channel.status);
      summary[healthLevel]++;
    });
    
    return summary;
  }

  /**
   * Gets color configuration for status with health indicators
   * 绿色 = 正常健康状态，黄色 = 警告状态，红色 = 错误状态
   */
  private getStatusColors(status: WatchStatus): { fg: string; bg?: string; icon?: string } {
    switch (status) {
      case 'live':
        return { fg: 'green', icon: '●' }; // 正常：绿色，直播中
      case 'waiting':
        return { fg: 'yellow', icon: '◯' }; // 警告：黄色，等待中
      case 'end':
        return { fg: 'gray', icon: '◦' }; // 已结束：灰色
      case 'unStart':
        return { fg: 'gray', icon: '◦' }; // 未开始：灰色
      case 'banpush':
        return { fg: 'red', icon: '✖' }; // 错误：红色，推流被禁
      case 'playback':
        return { fg: 'blue', icon: '▶' }; // 信息：蓝色，回放中
      default:
        return { fg: 'white', icon: '?' }; // 未知状态：白色
    }
  }

  /**
   * Gets terminal-compatible color for different environments
   */
  private getTerminalSafeColor(color: string): string {
    const config = this.getConfig();
    if (!config.showColors) {
      return 'white';
    }

    // 检查终端颜色支持
    const colorMapping: Record<string, string> = {
      'green': 'green',
      'yellow': 'yellow', 
      'red': 'red',
      'blue': 'blue',
      'gray': 'gray',
      'white': 'white'
    };

    return colorMapping[color] || 'white';
  }

  /**
   * Gets status health level for alerting
   */
  private getStatusHealthLevel(status: WatchStatus): 'healthy' | 'warning' | 'error' {
    switch (status) {
      case 'live':
        return 'healthy';
      case 'waiting':
      case 'playback':
        return 'warning';
      case 'banpush':
        return 'error';
      case 'end':
      case 'unStart':
      default:
        return 'warning';
    }
  }

  /**
   * Formats date for display
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  /**
   * Updates header content
   */
  private updateHeader(): void {
    this.headerBox.setContent(this.getHeaderContent());
  }

  /**
   * Updates footer content
   */
  private updateFooter(): void {
    this.footerBox.setContent(this.getFooterContent());
  }

  /**
   * Gets header content with health summary
   */
  private getHeaderContent(): string {
    const total = this.channels?.length || 0;
    const filtered = this.filteredChannels?.length || 0;
    const selected = this.selectedChannels?.size || 0;
    const lastUpdate = this.lastUpdateTime?.toLocaleTimeString() || 'Never';
    const health = this.getChannelHealthSummary();
    
    // 健康状况摘要显示
    const healthDisplay = `{green-fg}●${health.healthy}{/green-fg} {yellow-fg}◯${health.warning}{/yellow-fg} {red-fg}✖${health.error}{/red-fg}`;
    
    return `Total: {bold}${total}{/bold} | Displayed: {bold}${filtered}{/bold} | Selected: {cyan-fg}${selected}{/cyan-fg} | Health: ${healthDisplay} | Updated: {gray-fg}${lastUpdate}{/gray-fg}`;
  }

  /**
   * Gets footer content with enhanced controls
   */
  private getFooterContent(): string {
    const activeFilters = this.filterConfig ? Object.keys(this.filterConfig).length : 0;
    const filterInfo = activeFilters > 0 ? `{yellow-fg}[${activeFilters} filters]{/yellow-fg}` : '';
    const sortInfo = this.sortConfig?.secondaryField ? `{cyan-fg}[Multi-sort]{/cyan-fg}` : '';
    
    return `{gray-fg}↑↓: Navigate | Space: Select | Enter: Details | S: Sort | Shift+S: Order | F: Filter | Shift+F: Advanced | 1-4: Quick Filter | C: Clear | R: Refresh{/gray-fg} ${filterInfo} ${sortInfo}`;
  }

  /**
   * Gets no data message
   */
  private getNoDataMessage(): string {
    return '{center}{gray-fg}No channel data available{/gray-fg}\n{center}{gray-fg}Waiting for channel information...{/gray-fg}{/center}';
  }

  /**
   * Navigation methods
   */
  private moveSelection(delta: number): void {
    const channels = this.filteredChannels || [];
    if (channels.length === 0) return;
    
    this.currentIndex = Math.max(0, Math.min(channels.length - 1, this.currentIndex + delta));
    this.throttledRender();
  }

  private moveToTop(): void {
    this.saveNavigationHistory();
    this.currentIndex = 0;
    this.isRangeSelecting = false;
    this.throttledRender();
    this.emitNavigationEvent('moveToTop');
  }

  private moveToBottom(): void {
    const channels = this.filteredChannels || [];
    this.saveNavigationHistory();
    this.currentIndex = Math.max(0, channels.length - 1);
    this.isRangeSelecting = false;
    this.throttledRender();
    this.emitNavigationEvent('moveToBottom');
  }

  /**
   * Enhanced navigation methods
   */
  private showQuickJumpDialog(): void {
    this.emit('component:quickJumpDialog', {
      componentId: this.state.id,
      currentIndex: this.currentIndex,
      totalItems: this.filteredChannels?.length || 0,
      timestamp: new Date()
    });
  }

  private showGoToLineDialog(): void {
    this.emit('component:goToLineDialog', {
      componentId: this.state.id,
      currentLine: this.currentIndex + 1,
      totalLines: this.filteredChannels?.length || 0,
      timestamp: new Date()
    });
  }

  private extendSelectionUp(): void {
    const channels = this.filteredChannels || [];
    if (channels.length === 0) return;

    if (!this.isRangeSelecting) {
      this.selectionStartIndex = this.currentIndex;
      this.isRangeSelecting = true;
    }

    const newIndex = Math.max(0, this.currentIndex - 1);
    this.updateRangeSelection(newIndex);
  }

  private extendSelectionDown(): void {
    const channels = this.filteredChannels || [];
    if (channels.length === 0) return;

    if (!this.isRangeSelecting) {
      this.selectionStartIndex = this.currentIndex;
      this.isRangeSelecting = true;
    }

    const newIndex = Math.min(channels.length - 1, this.currentIndex + 1);
    this.updateRangeSelection(newIndex);
  }

  private updateRangeSelection(newIndex: number): void {
    const channels = this.filteredChannels || [];
    const selectedChannels = this.selectedChannels || new Set();

    if (this.selectionStartIndex === -1) return;

    // Clear previous range selection
    this.clearRangeSelection();

    // Select range
    const startIndex = Math.min(this.selectionStartIndex, newIndex);
    const endIndex = Math.max(this.selectionStartIndex, newIndex);

    for (let i = startIndex; i <= endIndex; i++) {
      const channel = channels[i];
      if (channel) {
        selectedChannels.add(channel.channelId);
      }
    }

    this.currentIndex = newIndex;
    this.throttledRender();
  }

  private clearRangeSelection(): void {
    // This would be more complex in a real implementation
    // For now, we keep the simple implementation
  }

  private copySelectionInfo(): void {
    const selectedChannels = this.selectedChannels || new Set();
    const channels = this.filteredChannels || [];
    
    if (selectedChannels.size === 0 && this.currentIndex < channels.length) {
      // Copy current channel if nothing selected
      const currentChannel = channels[this.currentIndex];
      if (currentChannel) {
        this.copyChannelInfo(currentChannel);
      }
    } else {
      // Copy selected channels info
      const selectedChannelData = channels.filter(c => selectedChannels.has(c.channelId));
      this.copyMultipleChannelsInfo(selectedChannelData);
    }
  }

  private copyChannelInfo(channel: ChannelStatusInfo): void {
    const info = `${channel.name} (${channel.channelId}) - ${channel.statusText} - ${channel.viewerCount} viewers`;
    
    this.emit('component:copyToClipboard', {
      componentId: this.state.id,
      content: info,
      type: 'singleChannel',
      channel,
      timestamp: new Date()
    });
  }

  private copyMultipleChannelsInfo(channels: ChannelStatusInfo[]): void {
    const info = channels.map(c => 
      `${c.name} (${c.channelId}) - ${c.statusText} - ${c.viewerCount} viewers`
    ).join('\n');
    
    this.emit('component:copyToClipboard', {
      componentId: this.state.id,
      content: info,
      type: 'multipleChannels',
      channels,
      count: channels.length,
      timestamp: new Date()
    });
  }

  private saveNavigationHistory(): void {
    if (this.currentIndex !== this.lastJumpPosition) {
      this.navigationHistory.push(this.lastJumpPosition);
      // Keep only last 10 positions
      if (this.navigationHistory.length > 10) {
        this.navigationHistory.shift();
      }
      this.lastJumpPosition = this.currentIndex;
    }
  }

  private emitNavigationEvent(action: string): void {
    this.emit('component:navigation', {
      componentId: this.state.id,
      action,
      currentIndex: this.currentIndex,
      totalItems: this.filteredChannels?.length || 0,
      timestamp: new Date()
    });
  }

  /**
   * Jump to specific line/index
   */
  public jumpToLine(lineNumber: number): boolean {
    const channels = this.filteredChannels || [];
    const targetIndex = lineNumber - 1; // Convert to 0-based index
    
    if (targetIndex >= 0 && targetIndex < channels.length) {
      this.saveNavigationHistory();
      this.currentIndex = targetIndex;
      this.isRangeSelecting = false;
      this.throttledRender();
      this.emitNavigationEvent('jumpToLine');
      return true;
    }
    
    return false;
  }

  /**
   * Jump to channel by ID or name
   */
  public jumpToChannel(searchTerm: string): boolean {
    const channels = this.filteredChannels || [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    const targetIndex = channels.findIndex(channel => 
      channel.channelId.toLowerCase().includes(lowerSearchTerm) ||
      channel.name.toLowerCase().includes(lowerSearchTerm)
    );
    
    if (targetIndex !== -1) {
      this.saveNavigationHistory();
      this.currentIndex = targetIndex;
      this.isRangeSelecting = false;
      this.throttledRender();
      this.emitNavigationEvent('jumpToChannel');
      return true;
    }
    
    return false;
  }

  /**
   * Selection methods
   */
  private toggleSelection(): void {
    const channels = this.filteredChannels || [];
    const selectedChannels = this.selectedChannels || new Set();
    if (channels.length === 0) return;
    
    const currentChannel = channels[this.currentIndex];
    if (!currentChannel) return;
    
    if (selectedChannels.has(currentChannel.channelId)) {
      selectedChannels.delete(currentChannel.channelId);
    } else {
      selectedChannels.add(currentChannel.channelId);
    }
    
    this.throttledRender();
  }

  private selectAll(): void {
    const channels = this.filteredChannels || [];
    const selectedChannels = this.selectedChannels || new Set();
    channels.forEach(channel => {
      selectedChannels.add(channel.channelId);
    });
    this.throttledRender();
  }

  private deselectAll(): void {
    const selectedChannels = this.selectedChannels || new Set();
    selectedChannels.clear();
    this.throttledRender();
  }

  /**
   * Enhanced sorting methods
   */
  private cycleSortField(): void {
    const fields: (keyof ChannelStatusInfo)[] = ['name', 'status', 'viewerCount', 'maxViewer', 'publisher', 'createdTime'];
    const currentIndex = fields.indexOf(this.sortConfig.field);
    const nextIndex = (currentIndex + 1) % fields.length;
    const nextField = fields[nextIndex];
    
    if (nextField) {
      // 如果当前字段有次要排序，先切换到次要字段为主要字段
      if (this.sortConfig.secondaryField) {
        this.sortConfig.field = this.sortConfig.secondaryField;
        this.sortConfig.order = this.sortConfig.secondaryOrder || 'asc';
        delete this.sortConfig.secondaryField;
        delete this.sortConfig.secondaryOrder;
      } else {
        this.sortConfig.field = nextField;
      }
    }
    
    this.applyFiltersAndSort();
    this.throttledRender();
    
    this.emit('component:sortChanged', {
      componentId: this.state.id,
      sortConfig: this.sortConfig,
      timestamp: new Date()
    });
  }

  private toggleSortOrder(): void {
    this.sortConfig.order = this.sortConfig.order === 'asc' ? 'desc' : 'asc';
    this.applyFiltersAndSort();
    this.throttledRender();
    
    this.emit('component:sortChanged', {
      componentId: this.state.id,
      sortConfig: this.sortConfig,
      timestamp: new Date()
    });
  }

  /**
   * Sets multi-field sort configuration
   */
  public setMultiFieldSort(primary: keyof ChannelStatusInfo, primaryOrder: 'asc' | 'desc', 
                          secondary?: keyof ChannelStatusInfo, secondaryOrder?: 'asc' | 'desc'): void {
    const newConfig: SortConfig = {
      field: primary,
      order: primaryOrder
    };
    
    if (secondary !== undefined) {
      newConfig.secondaryField = secondary;
    }
    
    if (secondaryOrder !== undefined) {
      newConfig.secondaryOrder = secondaryOrder;
    }
    
    this.sortConfig = newConfig;
    
    this.applyFiltersAndSort();
    this.throttledRender();
    
    this.emit('component:sortChanged', {
      componentId: this.state.id,
      sortConfig: this.sortConfig,
      changeType: 'multiField',
      timestamp: new Date()
    });
  }

  /**
   * Filter methods with enhanced functionality
   */
  private showFilterDialog(): void {
    // 显示基础过滤对话框
    this.emit('component:filterDialog', {
      componentId: this.state.id,
      currentFilter: this.filterConfig,
      type: 'basic',
      timestamp: new Date()
    });
  }

  private showAdvancedFilterDialog(): void {
    // 显示高级过滤对话框
    this.emit('component:advancedFilterDialog', {
      componentId: this.state.id,
      currentFilter: this.filterConfig,
      availableFields: ['viewerCount', 'publisher', 'createdTime'],
      timestamp: new Date()
    });
  }

  private quickFilterByStatus(status: WatchStatus): void {
    // 快速状态过滤
    if (this.filterConfig.status?.includes(status)) {
      // 如果已经包含该状态，则移除
      this.filterConfig.status = this.filterConfig.status.filter(s => s !== status);
      if (this.filterConfig.status.length === 0) {
        delete this.filterConfig.status;
      }
    } else {
      // 添加状态过滤
      if (!this.filterConfig.status) {
        this.filterConfig.status = [];
      }
      this.filterConfig.status.push(status);
    }
    
    this.applyFiltersAndSort();
    this.throttledRender();
    
    // 发出过滤变化事件
    this.emit('component:filterChanged', {
      componentId: this.state.id,
      filter: this.filterConfig,
      changeType: 'quickFilter',
      status,
      timestamp: new Date()
    });
  }

  private clearFilters(): void {
    const hadFilters = Object.keys(this.filterConfig).length > 0;
    this.filterConfig = {};
    this.applyFiltersAndSort();
    this.throttledRender();
    
    if (hadFilters) {
      this.emit('component:filtersCleared', {
        componentId: this.state.id,
        timestamp: new Date()
      });
    }
  }

  /**
   * Sets advanced filter configuration
   */
  public setAdvancedFilter(filter: Partial<FilterConfig>): void {
    this.filterConfig = { ...this.filterConfig, ...filter };
    this.applyFiltersAndSort();
    this.throttledRender();
    
    this.emit('component:filterChanged', {
      componentId: this.state.id,
      filter: this.filterConfig,
      changeType: 'advanced',
      timestamp: new Date()
    });
  }

  /**
   * Detail and batch operation methods (placeholder implementations)
   */
  private showChannelDetails(): void {
    const channels = this.filteredChannels || [];
    if (channels.length === 0) return;
    
    const currentChannel = channels[this.currentIndex];
    if (!currentChannel) return;
    
    // Show the details popup
    this.detailsPopup.show(currentChannel);
    
    // Also emit event for other components that might be listening
    this.emit('component:showDetails', {
      componentId: this.state.id,
      channelId: currentChannel.channelId,
      channel: currentChannel,
      timestamp: new Date()
    });
  }

  private showBatchOperations(): void {
    const selectedChannels = this.selectedChannels || new Set();
    if (selectedChannels.size === 0) return;
    
    // Show the batch operations dialog
    this.batchDialog.show(Array.from(selectedChannels));
    
    // Also emit event for other components that might be listening
    this.emit('component:batchOperations', {
      componentId: this.state.id,
      selectedChannels: Array.from(selectedChannels),
      timestamp: new Date()
    });
  }

  /**
   * Gets the component configuration cast to the correct type
   */
  private getConfig(): ChannelStatusPanelConfig {
    return this.config as ChannelStatusPanelConfig;
  }

  /**
   * Gets current selected channels
   */
  public getSelectedChannels(): string[] {
    return Array.from(this.selectedChannels || new Set());
  }

  /**
   * Gets current channel at cursor position
   */
  public getCurrentChannel(): ChannelStatusInfo | null {
    const channels = this.filteredChannels || [];
    return channels[this.currentIndex] || null;
  }

  /**
   * Sets filter configuration
   */
  public setFilter(filter: FilterConfig): void {
    this.filterConfig = filter;
    this.applyFiltersAndSort();
    this.throttledRender();
  }

  /**
   * Sets sort configuration
   */
  public setSort(sort: SortConfig): void {
    this.sortConfig = sort;
    this.applyFiltersAndSort();
    this.throttledRender();
  }

  /**
   * Cleans up component resources
   */
  public override destroy(): void {
    this.stopRefresh();
    this.channels = [];
    this.filteredChannels = [];
    if (this.selectedChannels) {
      this.selectedChannels.clear();
    }
    if (this.detailsPopup) {
      this.detailsPopup.destroy();
    }
    if (this.batchDialog) {
      this.batchDialog.destroy();
    }
    super.destroy();
  }
}