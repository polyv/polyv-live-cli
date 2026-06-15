/**
 * @fileoverview Batch operations dialog component for performing bulk actions on selected channels
 * @author Development Team
 * @since 5.3.0
 */

import blessed from 'blessed';
import { EventEmitter } from 'events';

/**
 * Configuration for batch operations dialog
 */
export interface BatchOperationsDialogConfig {
  /** Parent screen reference */
  screen: blessed.Widgets.Screen;
  /** Event bus for communication */
  eventBus: EventEmitter;
  /** Whether to show colors */
  showColors: boolean;
}

/**
 * Available batch operations
 */
export type BatchOperation = 'start' | 'stop' | 'delete' | 'refresh' | 'export';

/**
 * Batch operation result
 */
export interface BatchOperationResult {
  operation: BatchOperation;
  totalChannels: number;
  successCount: number;
  failureCount: number;
  errors: Array<{ channelId: string; error: string }>;
  timestamp: Date;
}

/**
 * Batch operations dialog component for performing bulk actions on selected channels
 */
export class BatchOperationsDialog {
  private screen: blessed.Widgets.Screen;
  private eventBus: EventEmitter;
  private config: BatchOperationsDialogConfig;
  private dialog!: blessed.Widgets.BoxElement;
  private operationsList!: blessed.Widgets.ListElement;
  private statusBox!: blessed.Widgets.BoxElement;
  private progressBar!: blessed.Widgets.ProgressBarElement;
  private footerBox!: blessed.Widgets.BoxElement;
  
  private selectedChannels: string[] = [];
  private isVisible = false;
  private currentOperation: BatchOperation | null = null;
  private operationInProgress = false;
  
  constructor(config: BatchOperationsDialogConfig) {
    this.config = config;
    this.screen = config.screen;
    this.eventBus = config.eventBus;
    
    this.createDialog();
    this.setupEventListeners();
  }
  
  /**
   * Creates the dialog widget structure
   */
  private createDialog(): void {
    // Main dialog container
    this.dialog = blessed.box({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: '60%',
      height: '70%',
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
      hidden: true,
      label: ' Batch Operations ',
      tags: true
    });
    
    // Operations list
    this.operationsList = blessed.list({
      parent: this.dialog,
      top: 1,
      left: 1,
      width: '100%-2',
      height: '60%',
      border: { type: 'line' },
      style: {
        fg: 'white',
        bg: 'black',
        border: { fg: 'gray' },
        selected: { bg: 'blue', fg: 'white' }
      },
      label: ' Available Operations ',
      keys: true,
      vi: true,
      mouse: true,
      scrollable: true,
      items: this.getOperationItems(),
      tags: true
    });
    
    // Status box for operation feedback
    this.statusBox = blessed.box({
      parent: this.dialog,
      top: '60%',
      left: 1,
      width: '100%-2',
      height: 6,
      border: { type: 'line' },
      style: {
        fg: 'white',
        bg: 'black',
        border: { fg: 'gray' }
      },
      label: ' Operation Status ',
      scrollable: true,
      tags: true
    });
    
    // Progress bar
    this.progressBar = blessed.progressbar({
      parent: this.dialog,
      bottom: 4,
      left: 1,
      width: '100%-2',
      height: 3,
      border: { type: 'line' },
      style: {
        fg: 'white',
        bg: 'black',
        border: { fg: 'gray' },
        bar: { bg: 'green' }
      },
      label: ' Progress ',
      filled: 0,
      hidden: true
    });
    
    // Footer box for controls
    this.footerBox = blessed.box({
      parent: this.dialog,
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
   * Gets the list of available operations
   */
  private getOperationItems(): string[] {
    return [
      '{green-fg}Start Streaming{/green-fg} - Start broadcasting on selected channels',
      '{red-fg}Stop Streaming{/red-fg} - Stop broadcasting on selected channels',
      '{yellow-fg}Refresh Data{/yellow-fg} - Refresh information for selected channels',
      '{cyan-fg}Export Data{/cyan-fg} - Export selected channels data to file',
      '{red-fg}Delete Channels{/red-fg} - {bold}DANGER:{/bold} Permanently delete selected channels'
    ];
  }
  
  /**
   * Sets up keyboard bindings for the dialog
   */
  private setupKeyBindings(): void {
    // Close dialog
    this.dialog.key(['escape', 'q'], () => {
      if (!this.operationInProgress) {
        this.hide();
      }
    });
    
    // Execute selected operation
    this.dialog.key(['enter'], () => {
      if (!this.operationInProgress) {
        this.executeSelectedOperation();
      }
    });
    
    // Navigate operations list
    this.dialog.key(['up', 'k'], () => {
      this.operationsList.up(1);
      this.screen.render();
    });
    
    this.dialog.key(['down', 'j'], () => {
      this.operationsList.down(1);
      this.screen.render();
    });
    
    // Quick operation keys
    this.dialog.key(['1'], () => {
      this.operationsList.select(0);
      this.executeSelectedOperation();
    });
    
    this.dialog.key(['2'], () => {
      this.operationsList.select(1);
      this.executeSelectedOperation();
    });
    
    this.dialog.key(['3'], () => {
      this.operationsList.select(2);
      this.executeSelectedOperation();
    });
    
    this.dialog.key(['4'], () => {
      this.operationsList.select(3);
      this.executeSelectedOperation();
    });
    
    this.dialog.key(['5'], () => {
      this.operationsList.select(4);
      this.executeSelectedOperation();
    });
  }
  
  /**
   * Sets up event listeners
   */
  private setupEventListeners(): void {
    // Listen for operation completion from external services
    this.eventBus.on('batchOperation:completed', (result: BatchOperationResult) => {
      this.handleOperationCompleted(result);
    });
    
    // Listen for operation progress updates
    this.eventBus.on('batchOperation:progress', (data: { current: number; total: number; channel?: string }) => {
      this.updateProgress(data.current, data.total, data.channel);
    });
  }
  
  /**
   * Shows the dialog with selected channels
   */
  public show(selectedChannels: string[]): void {
    this.selectedChannels = selectedChannels;
    this.isVisible = true;
    this.operationInProgress = false;
    
    this.updateStatusBox(`Ready to perform batch operations on ${selectedChannels.length} selected channels.`);
    this.progressBar.hide();
    
    this.dialog.show();
    this.operationsList.focus();
    this.screen.render();
    
    this.eventBus.emit('batchOperations:shown', {
      selectedChannels: selectedChannels.length,
      timestamp: new Date()
    });
  }
  
  /**
   * Hides the dialog
   */
  public hide(): void {
    this.isVisible = false;
    this.dialog.hide();
    this.screen.render();
    
    if (this.selectedChannels.length > 0) {
      this.eventBus.emit('batchOperations:hidden', {
        selectedChannels: this.selectedChannels.length,
        timestamp: new Date()
      });
    }
    
    this.selectedChannels = [];
    this.currentOperation = null;
    this.operationInProgress = false;
  }
  
  /**
   * Executes the currently selected operation
   */
  private executeSelectedOperation(): void {
    if (this.operationInProgress || this.selectedChannels.length === 0) {
      return;
    }
    
    const selectedIndex = (this.operationsList as any).selected;
    const operations: BatchOperation[] = ['start', 'stop', 'refresh', 'export', 'delete'];
    const operation = operations[selectedIndex];
    
    if (!operation) return;
    
    // Show confirmation for destructive operations
    if (operation === 'delete') {
      this.showConfirmationDialog(operation);
      return;
    }
    
    this.startOperation(operation);
  }
  
  /**
   * Shows confirmation dialog for destructive operations
   */
  private showConfirmationDialog(operation: BatchOperation): void {
    const confirmDialog = blessed.question({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: '50%',
      height: 'shrink',
      border: { type: 'line' },
      style: {
        fg: 'white',
        bg: 'red',
        border: { fg: 'red' }
      },
      label: ' Confirmation Required ',
      tags: true
    });
    
    const message = operation === 'delete' 
      ? `Are you sure you want to DELETE ${this.selectedChannels.length} channels?\nThis action cannot be undone!`
      : `Are you sure you want to perform ${operation} on ${this.selectedChannels.length} channels?`;
    
    confirmDialog.ask(message, (_err, confirmed) => {
      this.screen.remove(confirmDialog);
      this.screen.render();
      
      if (confirmed) {
        this.startOperation(operation);
      }
    });
  }
  
  /**
   * Starts the batch operation
   */
  private startOperation(operation: BatchOperation): void {
    this.currentOperation = operation;
    this.operationInProgress = true;
    
    this.updateStatusBox(`Starting ${operation} operation on ${this.selectedChannels.length} channels...`);
    this.progressBar.show();
    this.progressBar.setProgress(0);
    this.refreshFooter();
    
    // Emit operation start event
    this.eventBus.emit('batchOperation:start', {
      operation,
      channels: this.selectedChannels,
      timestamp: new Date()
    });
  }
  
  /**
   * Updates the progress bar
   */
  private updateProgress(current: number, total: number, channelInfo?: string): void {
    if (!this.isVisible || !this.operationInProgress) return;
    
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    this.progressBar.setProgress(percentage);
    
    const statusText = channelInfo 
      ? `Processing ${current}/${total} - ${channelInfo}`
      : `Processing ${current}/${total} channels (${percentage}%)`;
    
    this.updateStatusBox(statusText);
    this.screen.render();
  }
  
  /**
   * Handles operation completion
   */
  private handleOperationCompleted(result: BatchOperationResult): void {
    if (!this.isVisible || result.operation !== this.currentOperation) return;
    
    this.operationInProgress = false;
    this.progressBar.setProgress(100);
    
    const statusText = this.formatOperationResult(result);
    this.updateStatusBox(statusText);
    this.refreshFooter();
    
    // Auto-hide dialog after successful operations (except errors)
    if (result.failureCount === 0) {
      setTimeout(() => {
        if (this.isVisible && !this.operationInProgress) {
          this.hide();
        }
      }, 3000);
    }
  }
  
  /**
   * Formats operation result for display
   */
  private formatOperationResult(result: BatchOperationResult): string {
    const { operation, totalChannels, successCount, failureCount } = result;
    
    let statusText = `{bold}Operation Complete:{/bold} ${operation}\n`;
    statusText += `Total: ${totalChannels}, Success: {green-fg}${successCount}{/green-fg}, Failed: {red-fg}${failureCount}{/red-fg}\n`;
    
    if (failureCount > 0 && result.errors.length > 0) {
      statusText += '\n{red-fg}Errors:{/red-fg}\n';
      result.errors.slice(0, 3).forEach(error => {
        statusText += `- ${error.channelId}: ${error.error}\n`;
      });
      
      if (result.errors.length > 3) {
        statusText += `... and ${result.errors.length - 3} more errors\n`;
      }
    }
    
    return statusText;
  }
  
  /**
   * Updates the status box content
   */
  private updateStatusBox(content: string): void {
    this.statusBox.setContent(content);
  }
  
  /**
   * Gets footer content with control hints
   */
  private getFooterContent(): string {
    if (this.operationInProgress) {
      return `{center}{gray-fg}Operation in progress... Please wait{/gray-fg}{/center}`;
    }
    
    // Show colors based on configuration
    const colorSupport = this.config.showColors ? 'Colors: ON' : 'Colors: OFF';
    return `{center}{gray-fg}Enter: Execute | ↑↓: Navigate | 1-5: Quick Select | ESC/q: Close | ${colorSupport}{/gray-fg}{/center}`;
  }
  
  /**
   * Updates the footer content
   */
  private updateFooter(): void {
    this.footerBox.setContent(this.getFooterContent());
  }
  
  /**
   * Updates footer when operation status changes
   */
  private refreshFooter(): void {
    this.updateFooter();
    this.screen.render();
  }
  
  /**
   * Checks if the dialog is currently visible
   */
  public isShowing(): boolean {
    return this.isVisible;
  }
  
  /**
   * Gets the currently selected channels
   */
  public getSelectedChannels(): string[] {
    return [...this.selectedChannels];
  }
  
  /**
   * Gets the current operation status
   */
  public getOperationStatus(): { operation: BatchOperation | null; inProgress: boolean } {
    return {
      operation: this.currentOperation,
      inProgress: this.operationInProgress
    };
  }
  
  /**
   * Destroys the dialog and cleans up resources
   */
  public destroy(): void {
    this.hide();
    
    if (this.dialog && this.screen) {
      try {
        if (typeof this.screen.remove === 'function') {
          this.screen.remove(this.dialog);
        }
      } catch (error) {
        // Ignore errors during cleanup - might be in test environment
      }
    }
    
    this.eventBus.emit('batchOperations:destroyed', {
      timestamp: new Date()
    });
  }
}