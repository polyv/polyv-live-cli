/**
 * @fileoverview Status Bar Component for system information and operation hints
 * @author Development Team
 * @since 1.0.0
 */

import * as blessed from 'blessed';
import { EventEmitter } from 'events';
import { BaseComponent } from './base.component';
import { ComponentConfig, ComponentState } from '../types/monitoring';
import { StatusInfo } from '../types/interaction';

export interface StatusBarConfig extends ComponentConfig {
  type: 'status-bar';
  statusPosition: 'top' | 'bottom';
  showTime: boolean;
  showMemoryUsage: boolean;
  showCpuUsage: boolean;
  showConnectionStatus: boolean;
  showOperationHints: boolean;
  updateInterval: number;
}

export interface StatusBarState extends ComponentState {
  statusInfo: StatusInfo;
  isCollapsed: boolean;
}

/**
 * StatusBar displays system information, operation hints, and current status
 * at the top or bottom of the terminal interface
 */
export class StatusBar extends BaseComponent {
  protected declare config: StatusBarConfig;
  protected declare state: StatusBarState;
  
  private statusContainer!: blessed.Widgets.BoxElement;
  private leftSection!: blessed.Widgets.BoxElement;
  private centerSection!: blessed.Widgets.BoxElement;
  private rightSection!: blessed.Widgets.BoxElement;
  private messageArea!: blessed.Widgets.BoxElement;
  private updateTimer?: NodeJS.Timeout;

  constructor(config: StatusBarConfig, eventBus: EventEmitter) {
    // Initialize status state before calling super() which calls createWidget()
    const tempState = {
      statusInfo: {
        connection: 'disconnected' as const,
        lastUpdate: new Date(),
        memoryUsage: 0,
        cpuUsage: 0,
        currentOperation: 'Initializing...',
        availableShortcuts: ['F1: Help', 'F5: Refresh', 'q: Quit'],
        messages: [],
      },
      isCollapsed: false,
    };
    
    super(config, eventBus);
    
    // Set the status state properly after super()
    this.state = {
      ...this.state,
      ...tempState,
    };
    
    this.setupStatusListeners();
  }


  protected setupStatusListeners(): void {
    // Listen for system updates
    this.subscribe('system:status', this.updateSystemStatus.bind(this));
    this.subscribe('system:performance', this.updatePerformanceMetrics.bind(this));
    this.subscribe('connection:status', this.updateConnectionStatus.bind(this));
    this.subscribe('operation:status', this.updateOperationStatus.bind(this));
    this.subscribe('message:display', this.displayMessage.bind(this));
    this.subscribe('shortcuts:update', this.updateShortcuts.bind(this));
    this.subscribe('status-bar:toggle', this.toggleCollapse.bind(this));
  }

  protected createWidget(): void {
    // Main status container
    this.statusContainer = blessed.box({
      left: 0,
      top: this.config.statusPosition === 'top' ? 0 : '100%-3',
      width: '100%',
      height: 3,
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: 'gray',
        },
        bg: 'black',
      },
      tags: true,
      mouse: true,
      keys: true,
    });

    // Left section - System status and connection
    this.leftSection = blessed.box({
      parent: this.statusContainer,
      left: 0,
      top: 0,
      width: '30%',
      height: '100%',
      content: '',
      style: {
        fg: 'white',
        bg: 'black',
      },
      tags: true,
    });

    // Center section - Current operation and shortcuts
    this.centerSection = blessed.box({
      parent: this.statusContainer,
      left: '30%',
      top: 0,
      width: '40%',
      height: '100%',
      content: '',
      align: 'center',
      style: {
        fg: 'cyan',
        bg: 'black',
      },
      tags: true,
    });

    // Right section - Performance metrics and time
    this.rightSection = blessed.box({
      parent: this.statusContainer,
      left: '70%',
      top: 0,
      width: '30%',
      height: '100%',
      content: '',
      align: 'right',
      style: {
        fg: 'yellow',
        bg: 'black',
      },
      tags: true,
    });

    // Message area (hidden by default, shows when messages are displayed)
    this.messageArea = blessed.box({
      parent: this.statusContainer,
      left: 0,
      top: 1,
      width: '100%',
      height: 1,
      content: '',
      style: {
        fg: 'white',
        bg: 'red',
      },
      tags: true,
      hidden: true,
    });

    this.widget = this.statusContainer;
    this.setupStatusEvents();
    this.startUpdateTimer();
    this.updateDisplay();
  }

  protected setupStatusEvents(): void {
    // Handle mouse clicks for toggling collapse
    this.statusContainer.on('click', () => {
      this.toggleCollapse();
    });

    // Handle keyboard shortcuts
    this.statusContainer.key(['c'], () => {
      this.toggleCollapse();
    });

    this.statusContainer.key(['escape'], () => {
      this.clearMessages();
    });

    // Handle double-click for detailed status
    this.statusContainer.on('element dblclick', () => {
      this.showDetailedStatus();
    });
  }

  /**
   * Start the automatic update timer
   */
  protected startUpdateTimer(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    this.updateTimer = setInterval(() => {
      this.updateSystemMetrics();
      this.updateDisplay();
    }, this.config.updateInterval || 1000);
  }

  /**
   * Update system metrics
   */
  protected updateSystemMetrics(): void {
    // Update current time
    this.state.statusInfo.lastUpdate = new Date();

    // Update memory usage (simulated - in real app would get from process.memoryUsage())
    if (this.config.showMemoryUsage) {
      try {
        const memUsage = process.memoryUsage();
        this.state.statusInfo.memoryUsage = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
      } catch (error) {
        // Fallback if process.memoryUsage is not available
        this.state.statusInfo.memoryUsage = 0;
      }
    }

    // Update CPU usage (simulated - in real app would use a library like pidusage)
    if (this.config.showCpuUsage) {
      // Simple simulation
      this.state.statusInfo.cpuUsage = Math.round(Math.random() * 20 + 5); // 5-25%
    }
  }

  /**
   * Update status display
   */
  protected updateDisplay(): void {
    if (this.isDestroyed || this.state.isCollapsed) {
      this.hideStatusBar();
      return;
    }

    // Only update if statusInfo is available
    if (!this.state.statusInfo) {
      return;
    }

    this.updateLeftSection();
    this.updateCenterSection();
    this.updateRightSection();
    this.updateMessageArea();

    this.render();
  }

  /**
   * Update left section (system status and connection)
   */
  protected updateLeftSection(): void {
    const parts: string[] = [];

    // Connection status
    if (this.config.showConnectionStatus) {
      const status = this.state.statusInfo.connection;
      const statusColor = this.getConnectionStatusColor(status);
      const statusText = this.getConnectionStatusText(status);
      parts.push(`{${statusColor}}● ${statusText}{/${statusColor}}`);
    }

    // Current operation
    const operation = this.state.statusInfo.currentOperation;
    if (operation && operation !== 'Idle') {
      parts.push(`{gray-fg}${operation}{/gray-fg}`);
    }

    this.leftSection.setContent(parts.join(' | '));
  }

  /**
   * Update center section (operation hints and shortcuts)
   */
  protected updateCenterSection(): void {
    if (!this.config.showOperationHints) {
      this.centerSection.setContent('');
      return;
    }

    const shortcuts = this.state.statusInfo.availableShortcuts.slice(0, 3);
    const hintsText = shortcuts.join(' • ');
    
    this.centerSection.setContent(`{gray-fg}${hintsText}{/gray-fg}`);
  }

  /**
   * Update right section (performance metrics and time)
   */
  protected updateRightSection(): void {
    const parts: string[] = [];

    // Memory usage
    if (this.config.showMemoryUsage) {
      const memColor = this.state.statusInfo.memoryUsage > 80 ? 'red' : 
                       this.state.statusInfo.memoryUsage > 60 ? 'yellow' : 'green';
      parts.push(`{${memColor}-fg}MEM:${this.state.statusInfo.memoryUsage}%{/${memColor}-fg}`);
    }

    // CPU usage
    if (this.config.showCpuUsage) {
      const cpuColor = this.state.statusInfo.cpuUsage > 80 ? 'red' :
                       this.state.statusInfo.cpuUsage > 60 ? 'yellow' : 'green';
      parts.push(`{${cpuColor}-fg}CPU:${this.state.statusInfo.cpuUsage}%{/${cpuColor}-fg}`);
    }

    // Current time
    if (this.config.showTime) {
      const timeStr = this.state.statusInfo.lastUpdate.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      parts.push(`{white-fg}${timeStr}{/white-fg}`);
    }

    this.rightSection.setContent(parts.join(' '));
  }

  /**
   * Update message area for warnings and errors
   */
  protected updateMessageArea(): void {
    if (this.state.statusInfo.messages.length === 0) {
      this.messageArea.hide();
      return;
    }

    // Show the most recent message
    const latestMessage = this.state.statusInfo.messages[0];
    if (!latestMessage) return;
    
    const messageColor = this.getMessageColor(latestMessage.level);
    const messageText = `{${messageColor}}${latestMessage.text}{/${messageColor}}`;
    
    this.messageArea.setContent(messageText);
    this.messageArea.show();

    // Auto-hide info messages after 5 seconds
    if (latestMessage.level === 'info') {
      setTimeout(() => {
        this.clearMessage(latestMessage);
      }, 5000);
    }
  }

  /**
   * Get connection status display color
   */
  protected getConnectionStatusColor(status: StatusInfo['connection']): string {
    switch (status) {
      case 'connected': return 'green-fg';
      case 'connecting': return 'yellow-fg';
      case 'disconnected': return 'gray-fg';
      case 'error': return 'red-fg';
      default: return 'gray-fg';
    }
  }

  /**
   * Get connection status display text
   */
  protected getConnectionStatusText(status: StatusInfo['connection']): string {
    switch (status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting';
      case 'disconnected': return 'Offline';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  }

  /**
   * Get message display color
   */
  protected getMessageColor(level: 'info' | 'warning' | 'error'): string {
    switch (level) {
      case 'info': return 'blue-fg';
      case 'warning': return 'yellow-fg';
      case 'error': return 'red-fg';
      default: return 'white-fg';
    }
  }

  /**
   * Toggle status bar collapse state
   */
  public toggleCollapse(): void {
    this.state.isCollapsed = !this.state.isCollapsed;
    
    if (this.state.isCollapsed) {
      this.hideStatusBar();
    } else {
      this.showStatusBar();
    }

    this.emit('status-bar:toggled', {
      collapsed: this.state.isCollapsed,
      componentId: this.state.id,
      timestamp: new Date(),
    });
  }

  /**
   * Hide status bar (collapsed state)
   */
  protected hideStatusBar(): void {
    if (this.statusContainer) {
      this.statusContainer.height = 1;
      this.leftSection.hide();
      this.centerSection.hide();
      this.rightSection.hide();
      this.messageArea.hide();
      
      // Show minimal status in collapsed mode
      this.statusContainer.setContent('{gray-fg}Status Bar (click to expand){/gray-fg}');
    }
  }

  /**
   * Show status bar (expanded state)
   */
  protected showStatusBar(): void {
    if (this.statusContainer) {
      this.statusContainer.height = 3;
      this.statusContainer.setContent('');
      this.leftSection.show();
      this.centerSection.show();
      this.rightSection.show();
      
      this.updateDisplay();
    }
  }

  /**
   * Show detailed status in a popup
   */
  protected showDetailedStatus(): void {
    const detailsPopup = blessed.box({
      parent: this.widget.screen,
      left: 'center',
      top: 'center',
      width: 80,
      height: 20,
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: 'cyan',
        },
        bg: 'black',
      },
      label: ' Detailed Status ',
      content: this.generateDetailedStatusText(),
      tags: true,
      keys: true,
      mouse: true,
    });

    detailsPopup.key(['escape', 'q'], () => {
      detailsPopup.destroy();
      this.widget.screen?.render();
    });

    detailsPopup.focus();
    this.widget.screen?.render();
  }

  /**
   * Generate detailed status text
   */
  protected generateDetailedStatusText(): string {
    const status = this.state.statusInfo;
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    
    return [
      'System Information:',
      `  Connection: ${status.connection}`,
      `  Last Update: ${status.lastUpdate.toLocaleString()}`,
      `  Current Operation: ${status.currentOperation}`,
      '',
      'Performance Metrics:',
      `  Memory Usage: ${status.memoryUsage}%`,
      `  CPU Usage: ${status.cpuUsage}%`,
      `  Process Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      `  Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      `  Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      '',
      'Available Shortcuts:',
      ...status.availableShortcuts.map(shortcut => `  ${shortcut}`),
      '',
      'Recent Messages:',
      ...status.messages.slice(0, 5).map(msg => `  [${msg.level.toUpperCase()}] ${msg.text}`),
      '',
      'Press ESC or Q to close',
    ].join('\n');
  }

  /**
   * Update system status
   */
  public updateSystemStatus(data: Partial<StatusInfo>): void {
    this.state.statusInfo = { ...this.state.statusInfo, ...data };
    this.updateDisplay();
  }

  /**
   * Update performance metrics
   */
  public updatePerformanceMetrics(data: { memoryUsage?: number; cpuUsage?: number }): void {
    if (data.memoryUsage !== undefined) {
      this.state.statusInfo.memoryUsage = data.memoryUsage;
    }
    if (data.cpuUsage !== undefined) {
      this.state.statusInfo.cpuUsage = data.cpuUsage;
    }
    this.updateDisplay();
  }

  /**
   * Update connection status
   */
  public updateConnectionStatus(data: { status: StatusInfo['connection'] }): void {
    this.state.statusInfo.connection = data.status;
    this.updateDisplay();
  }

  /**
   * Update current operation status
   */
  public updateOperationStatus(data: { operation: string }): void {
    this.state.statusInfo.currentOperation = data.operation;
    this.updateDisplay();
  }

  /**
   * Display a message
   */
  public displayMessage(data: { level: 'info' | 'warning' | 'error'; text: string }): void {
    this.state.statusInfo.messages.unshift(data);
    
    // Limit message history
    if (this.state.statusInfo.messages.length > 10) {
      this.state.statusInfo.messages = this.state.statusInfo.messages.slice(0, 10);
    }

    this.updateDisplay();
  }

  /**
   * Update available shortcuts
   */
  public updateShortcuts(data: { shortcuts: string[] }): void {
    this.state.statusInfo.availableShortcuts = data.shortcuts;
    this.updateDisplay();
  }

  /**
   * Clear all messages
   */
  public clearMessages(): void {
    this.state.statusInfo.messages = [];
    this.updateDisplay();
  }

  /**
   * Clear a specific message
   */
  public clearMessage(messageToRemove: { level: 'info' | 'warning' | 'error'; text: string }): void {
    this.state.statusInfo.messages = this.state.statusInfo.messages.filter(
      msg => !(msg.level === messageToRemove.level && msg.text === messageToRemove.text)
    );
    this.updateDisplay();
  }

  /**
   * Set status bar position
   */
  public setPosition(position: 'top' | 'bottom'): void {
    this.config.statusPosition = position;
    
    if (this.statusContainer) {
      this.statusContainer.top = position === 'top' ? 0 : '100%-3';
      this.render();
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<StatusBarConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.updateInterval && this.updateTimer) {
      this.startUpdateTimer();
    }
    
    this.updateDisplay();
  }

  /**
   * Get current status information
   */
  public getStatusInfo(): StatusInfo {
    return { ...this.state.statusInfo };
  }

  public update(data: any): void {
    if (this.isDestroyed) return;
    
    try {
      if (data.statusInfo) {
        this.updateSystemStatus(data.statusInfo);
      }
      if (data.performance) {
        this.updatePerformanceMetrics(data.performance);
      }
      if (data.connectionStatus) {
        this.updateConnectionStatus(data.connectionStatus);
      }
      if (data.operation) {
        this.updateOperationStatus(data.operation);
      }
      if (data.message) {
        this.displayMessage(data.message);
      }
      if (data.shortcuts) {
        this.updateShortcuts(data.shortcuts);
      }
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Update error'));
    }
  }

  public render(): void {
    if (this.widget && !this.isDestroyed) {
      try {
        this.widget.screen?.render();
      } catch (error) {
        // Silently handle render errors to prevent crashes
        console.error('StatusBar render error:', error);
      }
    }
  }

  public override destroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined as any;
    }
    super.destroy();
  }
}