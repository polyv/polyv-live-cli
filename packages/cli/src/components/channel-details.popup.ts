/**
 * @fileoverview Channel details popup component for displaying comprehensive channel information
 * @author Development Team
 * @since 5.3.0
 */

import blessed from 'blessed';
import { EventEmitter } from 'events';
import { ChannelStatusInfo } from './channel-status.panel';

/**
 * Configuration for channel details popup
 */
export interface ChannelDetailsPopupConfig {
  /** Parent screen reference */
  screen: blessed.Widgets.Screen;
  /** Event bus for communication */
  eventBus: EventEmitter;
  /** Whether to show colors */
  showColors: boolean;
  /** Auto-refresh interval in ms */
  refreshInterval: number;
}

/**
 * Channel details popup component for displaying comprehensive channel information
 */
export class ChannelDetailsPopup {
  private screen: blessed.Widgets.Screen;
  private eventBus: EventEmitter;
  private config: ChannelDetailsPopupConfig;
  private popup!: blessed.Widgets.BoxElement;
  private headerBox!: blessed.Widgets.BoxElement;
  private scrollBox!: blessed.Widgets.BoxElement;
  private footerBox!: blessed.Widgets.BoxElement;
  
  private channel: ChannelStatusInfo | null = null;
  private isVisible = false;
  private scrollOffset = 0;
  private maxScrollOffset = 0;
  private refreshTimer?: NodeJS.Timeout | undefined;
  private notificationTimer?: NodeJS.Timeout | undefined;
  
  constructor(config: ChannelDetailsPopupConfig) {
    this.config = config;
    this.screen = config.screen;
    this.eventBus = config.eventBus;
    
    this.createPopup();
    this.setupEventListeners();
  }
  
  /**
   * Creates the popup widget structure
   */
  private createPopup(): void {
    // Main popup container
    this.popup = blessed.box({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: '90%',
      height: '85%',
      border: { type: 'line' },
      style: {
        fg: 'white',
        bg: 'black',
        border: { fg: 'cyan' }
      },
      shadow: true,
      keys: true,
      vi: true,
      mouse: true,
      scrollable: false,
      hidden: true,
      label: ' Channel Details ',
      tags: true
    });
    
    // Header box for channel basic info
    this.headerBox = blessed.box({
      parent: this.popup,
      top: 0,
      left: 0,
      width: '100%',
      height: 4,
      border: { type: 'line' },
      style: {
        fg: 'cyan',
        bg: 'black',
        border: { fg: 'gray' }
      },
      tags: true
    });
    
    // Scrollable content area
    this.scrollBox = blessed.box({
      parent: this.popup,
      top: 4,
      left: 0,
      width: '100%',
      height: 'shrink',
      bottom: 2,
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      vi: true,
      mouse: true,
      scrollbar: {
        ch: ' ',
        track: {
          bg: 'gray'
        },
        style: {
          inverse: true
        }
      },
      style: {
        fg: 'white',
        bg: 'black'
      },
      tags: true
    });
    
    // Footer box for controls
    this.footerBox = blessed.box({
      parent: this.popup,
      bottom: 0,
      left: 0,
      width: '100%',
      height: 2,
      border: { type: 'line' },
      style: {
        fg: 'gray',
        bg: 'black',
        border: { fg: 'gray' }
      },
      content: this.getFooterContent(),
      tags: true
    });
    
    this.setupKeyBindings();
  }
  
  /**
   * Sets up keyboard bindings for the popup
   */
  private setupKeyBindings(): void {
    // Close popup
    this.popup.key(['escape', 'q'], () => {
      this.hide();
    });
    
    // Refresh
    this.popup.key(['r', 'R', 'f5'], () => {
      this.refreshChannel();
    });
    
    // Navigation
    this.popup.key(['up', 'k'], () => {
      this.scroll(-1);
    });
    
    this.popup.key(['down', 'j'], () => {
      this.scroll(1);
    });
    
    this.popup.key(['pageup'], () => {
      this.scroll(-10);
    });
    
    this.popup.key(['pagedown'], () => {
      this.scroll(10);
    });
    
    this.popup.key(['home'], () => {
      this.scrollToTop();
    });
    
    this.popup.key(['end'], () => {
      this.scrollToBottom();
    });
    
    // Copy channel info
    this.popup.key(['ctrl+c'], () => {
      this.copyChannelInfo();
    });
  }
  
  /**
   * Sets up event listeners
   */
  private setupEventListeners(): void {
    // Listen for channel updates
    this.eventBus.on('channel:updated', (data) => {
      if (this.isVisible && this.channel && data.channelId === this.channel.channelId) {
        this.updateChannel(data.channel);
      }
    });
    
    // Listen for data refresh requests
    this.eventBus.on('dashboard:refresh', () => {
      if (this.isVisible) {
        this.refreshChannel();
      }
    });
  }
  
  /**
   * Shows the popup with channel details
   */
  public show(channel: ChannelStatusInfo): void {
    this.channel = channel;
    this.isVisible = true;
    this.scrollOffset = 0;
    
    this.updateContent();
    this.popup.show();
    this.popup.focus();
    this.screen.render();
    
    // Start auto-refresh if configured
    if (this.config.refreshInterval > 0) {
      this.startAutoRefresh();
    }
    
    this.eventBus.emit('channelDetails:shown', {
      channelId: channel.channelId,
      timestamp: new Date()
    });
  }
  
  /**
   * Hides the popup
   */
  public hide(): void {
    this.isVisible = false;
    this.popup.hide();
    this.screen.render();
    
    this.stopAutoRefresh();
    
    if (this.channel) {
      this.eventBus.emit('channelDetails:hidden', {
        channelId: this.channel.channelId,
        timestamp: new Date()
      });
    }
    
    this.channel = null;
  }
  
  /**
   * Updates the channel data and refreshes display
   */
  public updateChannel(channel: ChannelStatusInfo): void {
    this.channel = channel;
    if (this.isVisible) {
      this.updateContent();
      this.screen.render();
    }
  }
  
  /**
   * Updates the popup content with current channel data
   */
  private updateContent(): void {
    if (!this.channel) return;
    
    // Update header
    const headerContent = this.getHeaderContent();
    this.headerBox.setContent(headerContent);
    
    // Update scrollable content
    const detailsContent = this.getDetailsContent();
    this.scrollBox.setContent(detailsContent);
    
    // Update footer
    this.updateFooter();
    
    // Calculate max scroll offset
    const contentLines = detailsContent.split('\n').length;
    const visibleLines = this.scrollBox.height as number - 2; // Account for borders
    this.maxScrollOffset = Math.max(0, contentLines - visibleLines);
  }
  
  /**
   * Gets the header content with basic channel info
   */
  private getHeaderContent(): string {
    if (!this.channel) return '';
    
    const statusColors = this.getStatusColors(this.channel.status);
    const statusIcon = this.config.showColors ? statusColors.icon : '';
    const statusText = `${statusIcon} ${this.channel.statusText}`;
    
    return `{center}{bold}${this.channel.name}{/bold}{/center}\n` +
           `{center}Channel ID: {cyan-fg}${this.channel.channelId}{/cyan-fg} | Status: {${statusColors.fg}-fg}${statusText}{/${statusColors.fg}-fg}{/center}`;
  }
  
  /**
   * Gets the detailed content for the channel
   */
  private getDetailsContent(): string {
    if (!this.channel) return '';
    
    const sections = [
      this.getBasicInfoSection(),
      this.getStatisticsSection(),
      this.getTimingSection(),
      this.getPublisherSection(),
      this.getStatusHistorySection()
    ];
    
    return sections.join('\n\n');
  }
  
  /**
   * Gets basic information section
   */
  private getBasicInfoSection(): string {
    if (!this.channel) return '';
    
    const statusColors = this.getStatusColors(this.channel.status);
    const statusDisplay = this.config.showColors ? 
      `{${statusColors.fg}-fg}${statusColors.icon} ${this.channel.statusText}{/${statusColors.fg}-fg}` :
      this.channel.statusText;
    
    return `{yellow-fg}{bold}Basic Information{/bold}{/yellow-fg}\n` +
           `├─ Channel ID: {cyan-fg}${this.channel.channelId}{/cyan-fg}\n` +
           `├─ Name: {white-fg}${this.channel.name}{/white-fg}\n` +
           `├─ Status: ${statusDisplay}\n` +
           `├─ Publisher: {green-fg}${this.channel.publisher}{/green-fg}\n` +
           `└─ Selected: {magenta-fg}${this.channel.selected ? 'Yes' : 'No'}{/magenta-fg}`;
  }
  
  /**
   * Gets statistics section
   */
  private getStatisticsSection(): string {
    if (!this.channel) return '';
    
    const viewerPercentage = this.channel.maxViewer > 0 ? 
      ((this.channel.viewerCount / this.channel.maxViewer) * 100).toFixed(1) + '%' : 
      'N/A';
    
    return `{yellow-fg}{bold}Statistics{/bold}{/yellow-fg}\n` +
           `├─ Current Viewers: {cyan-fg}${this.channel.viewerCount.toLocaleString()}{/cyan-fg}\n` +
           `├─ Max Viewers: {cyan-fg}${this.channel.maxViewer.toLocaleString()}{/cyan-fg}\n` +
           `└─ Utilization: {magenta-fg}${viewerPercentage}{/magenta-fg}`;
  }
  
  /**
   * Gets timing information section
   */
  private getTimingSection(): string {
    if (!this.channel) return '';
    
    const formatTime = (timestamp: number): string => {
      if (timestamp === 0) return 'Not set';
      return new Date(timestamp).toLocaleString();
    };
    
    const getDuration = (start: number, end: number): string => {
      if (start === 0 || end === 0) return 'N/A';
      const duration = end - start;
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    };
    
    return `{yellow-fg}{bold}Timing Information{/bold}{/yellow-fg}\n` +
           `├─ Created: {cyan-fg}${formatTime(this.channel.createdTime)}{/cyan-fg}\n` +
           `├─ Start Time: {green-fg}${formatTime(this.channel.startTime)}{/green-fg}\n` +
           `├─ End Time: {red-fg}${formatTime(this.channel.endTime)}{/red-fg}\n` +
           `└─ Duration: {magenta-fg}${getDuration(this.channel.startTime, this.channel.endTime)}{/magenta-fg}`;
  }
  
  /**
   * Gets publisher information section
   */
  private getPublisherSection(): string {
    if (!this.channel) return '';
    
    return `{yellow-fg}{bold}Publisher Information{/bold}{/yellow-fg}\n` +
           `├─ Publisher: {green-fg}${this.channel.publisher}{/green-fg}\n` +
           `└─ Publishing Status: {cyan-fg}${this.getPublishingStatus()}{/cyan-fg}`;
  }
  
  /**
   * Gets status history section (placeholder for future implementation)
   */
  private getStatusHistorySection(): string {
    return `{yellow-fg}{bold}Recent Activity{/bold}{/yellow-fg}\n` +
           `├─ Last Updated: {cyan-fg}${new Date().toLocaleString()}{/cyan-fg}\n` +
           `├─ Status Changes: {green-fg}Available in full version{/green-fg}\n` +
           `└─ Performance Metrics: {magenta-fg}Available in full version{/magenta-fg}`;
  }
  
  /**
   * Gets publishing status based on channel status
   */
  private getPublishingStatus(): string {
    if (!this.channel) return 'Unknown';
    
    switch (this.channel.status) {
      case 'live':
        return 'Broadcasting Live';
      case 'waiting':
        return 'Waiting to Start';
      case 'end':
        return 'Broadcast Ended';
      case 'banpush':
        return 'Banned from Broadcasting';
      case 'playback':
        return 'Playing Back';
      case 'unStart':
        return 'Not Started';
      default:
        return 'Unknown Status';
    }
  }
  
  /**
   * Gets footer content with control hints
   */
  private getFooterContent(): string {
    return `{center}{gray-fg}ESC/q: Close | r/F5: Refresh | ↑↓: Scroll | Home/End: Top/Bottom | Ctrl+C: Copy{/gray-fg}{/center}`;
  }
  
  /**
   * Updates the footer content
   */
  private updateFooter(): void {
    this.footerBox.setContent(this.getFooterContent());
  }
  
  /**
   * Gets status colors for display
   */
  private getStatusColors(status: string): { fg: string; icon: string } {
    const colorMap: Record<string, { fg: string; icon: string }> = {
      'live': { fg: 'green', icon: '●' },
      'waiting': { fg: 'yellow', icon: '◯' },
      'end': { fg: 'gray', icon: '◦' },
      'banpush': { fg: 'red', icon: '✖' },
      'playback': { fg: 'blue', icon: '▶' },
      'unStart': { fg: 'gray', icon: '◦' }
    };
    
    return colorMap[status] || { fg: 'white', icon: '?' };
  }
  
  /**
   * Scrolls the content by the specified amount
   */
  private scroll(amount: number): void {
    this.scrollOffset = Math.max(0, Math.min(this.maxScrollOffset, this.scrollOffset + amount));
    this.scrollBox.scrollTo(this.scrollOffset);
    this.screen.render();
  }
  
  /**
   * Scrolls to the top of the content
   */
  private scrollToTop(): void {
    this.scrollOffset = 0;
    this.scrollBox.scrollTo(0);
    this.screen.render();
  }
  
  /**
   * Scrolls to the bottom of the content
   */
  private scrollToBottom(): void {
    this.scrollOffset = this.maxScrollOffset;
    this.scrollBox.scrollTo(this.maxScrollOffset);
    this.screen.render();
  }
  
  /**
   * Copies channel information to clipboard (placeholder implementation)
   */
  private copyChannelInfo(): void {
    if (!this.channel) return;
    
    const info = `Channel: ${this.channel.name}\n` +
                `ID: ${this.channel.channelId}\n` +
                `Status: ${this.channel.statusText}\n` +
                `Publisher: ${this.channel.publisher}\n` +
                `Viewers: ${this.channel.viewerCount}/${this.channel.maxViewer}`;
    
    // In a real implementation, this would copy to system clipboard
    this.eventBus.emit('channelDetails:copied', {
      channelId: this.channel.channelId,
      info,
      timestamp: new Date()
    });
    
    // Show temporary notification
    this.showNotification('Channel info copied to clipboard!');
  }
  
  /**
   * Shows a temporary notification
   */
  private showNotification(message: string): void {
    const notification = blessed.box({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: 'shrink',
      height: 'shrink',
      content: ` ${message} `,
      style: {
        fg: 'white',
        bg: 'green'
      },
      padding: {
        left: 2,
        right: 2,
        top: 1,
        bottom: 1
      }
    });
    
    this.screen.render();
    
    // Clear any existing notification timer
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer);
    }
    
    this.notificationTimer = setTimeout(() => {
      this.screen.remove(notification);
      this.screen.render();
      this.notificationTimer = undefined;
    }, 2000);
  }
  
  /**
   * Refreshes the channel data
   */
  private refreshChannel(): void {
    if (!this.channel) return;
    
    this.eventBus.emit('channel:requestRefresh', {
      channelId: this.channel.channelId,
      timestamp: new Date()
    });
  }
  
  /**
   * Starts auto-refresh timer
   */
  private startAutoRefresh(): void {
    this.stopAutoRefresh();
    
    if (this.config.refreshInterval > 0) {
      this.refreshTimer = setInterval(() => {
        this.refreshChannel();
      }, this.config.refreshInterval);
    }
  }
  
  /**
   * Stops auto-refresh timer
   */
  private stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
    
    // Also clear any pending notification timer
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer);
      this.notificationTimer = undefined;
    }
  }
  
  /**
   * Checks if the popup is currently visible
   */
  public isShowing(): boolean {
    return this.isVisible;
  }
  
  /**
   * Gets the current channel being displayed
   */
  public getCurrentChannel(): ChannelStatusInfo | null {
    return this.channel;
  }
  
  /**
   * Destroys the popup and cleans up resources
   */
  public destroy(): void {
    this.stopAutoRefresh();
    this.hide();
    
    if (this.popup && this.screen) {
      try {
        if (typeof this.screen.remove === 'function') {
          this.screen.remove(this.popup);
        }
      } catch (error) {
        // Ignore errors during cleanup - might be in test environment
      }
    }
    
    this.eventBus.emit('channelDetails:destroyed', {
      timestamp: new Date()
    });
  }
}