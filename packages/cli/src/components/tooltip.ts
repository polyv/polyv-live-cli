/**
 * @fileoverview Tooltip component for displaying hover information
 * @author Development Team
 * @since 1.0.0
 */

import blessed from 'blessed';
import { EventEmitter } from 'events';

/**
 * Tooltip configuration interface
 */
export interface TooltipConfig {
  /** Tooltip content */
  content: string;
  /** X position */
  x: number;
  /** Y position */
  y: number;
  /** Maximum width */
  maxWidth?: number;
  /** Auto hide delay in milliseconds */
  autoHideDelay?: number;
  /** Whether to follow mouse */
  followMouse?: boolean;
  /** Style configuration */
  style?: {
    fg?: string;
    bg?: string;
    border?: {
      fg?: string;
      bg?: string;
    };
  };
}

/**
 * Tooltip component for mouse hover information
 */
export class Tooltip {
  private screen: any;
  private eventBus: EventEmitter;
  private tooltipBox: any;
  private isVisible = false;
  private hideTimeout: NodeJS.Timeout | undefined;
  private currentConfig?: TooltipConfig;

  constructor(screen: any, eventBus: EventEmitter) {
    this.screen = screen;
    this.eventBus = eventBus;
  }

  /**
   * Show tooltip with given configuration
   */
  public show(config: TooltipConfig): void {
    // Clear any existing hide timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }

    // Hide existing tooltip if visible
    if (this.isVisible) {
      this.hide();
    }

    this.currentConfig = config;
    this.createTooltipBox(config);

    // Set up auto-hide if configured
    if (config.autoHideDelay && config.autoHideDelay > 0) {
      this.hideTimeout = setTimeout(() => {
        this.hide();
      }, config.autoHideDelay);
    }

    this.eventBus.emit('tooltip:shown', {
      content: config.content,
      x: config.x,
      y: config.y,
      timestamp: new Date(),
    });
  }

  /**
   * Hide the tooltip
   */
  public hide(): void {
    if (!this.isVisible || !this.tooltipBox) return;

    try {
      this.screen.remove(this.tooltipBox);
      this.tooltipBox = null;
      this.isVisible = false;
      this.screen.render();

      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = undefined;
      }

      this.eventBus.emit('tooltip:hidden', {
        timestamp: new Date(),
      });
    } catch (error) {
      // Handle errors gracefully
      console.error('Failed to hide tooltip:', error);
      this.tooltipBox = null;
      this.isVisible = false;
    }
  }

  /**
   * Update tooltip position (for mouse following)
   */
  public updatePosition(x: number, y: number): void {
    if (!this.isVisible || !this.tooltipBox || !this.currentConfig) return;

    try {
      // Calculate new position considering screen bounds
      const { adjustedX, adjustedY } = this.calculatePosition(x, y, this.currentConfig);
      
      this.tooltipBox.left = adjustedX;
      this.tooltipBox.top = adjustedY;
      this.screen.render();
    } catch (error) {
      console.error('Failed to update tooltip position:', error);
    }
  }

  /**
   * Check if tooltip is currently visible
   */
  public isTooltipVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Create the tooltip box widget
   */
  private createTooltipBox(config: TooltipConfig): void {
    try {
      const { adjustedX, adjustedY } = this.calculatePosition(config.x, config.y, config);
      
      this.tooltipBox = blessed.box({
        left: adjustedX,
        top: adjustedY,
        width: Math.min(config.maxWidth || 40, config.content.length + 4),
        height: this.calculateContentHeight(config.content, config.maxWidth || 40),
        content: config.content,
        tags: false,
        border: {
          type: 'line',
        },
        style: {
          fg: config.style?.fg || 'white',
          bg: config.style?.bg || 'black',
          border: {
            fg: config.style?.border?.fg || 'yellow',
            bg: config.style?.border?.bg || 'black',
          },
        },
        padding: {
          left: 1,
          right: 1,
          top: 0,
          bottom: 0,
        },
      });

      this.screen.append(this.tooltipBox);
      this.screen.render();
      this.isVisible = true;
    } catch (error) {
      console.error('Failed to create tooltip:', error);
      this.isVisible = false;
      this.tooltipBox = null;
    }
  }

  /**
   * Calculate tooltip position considering screen bounds
   */
  private calculatePosition(x: number, y: number, config: TooltipConfig): { adjustedX: number; adjustedY: number } {
    const screenWidth = this.screen.width || 80;
    const screenHeight = this.screen.height || 24;
    const tooltipWidth = Math.min(config.maxWidth || 40, config.content.length + 4);
    const tooltipHeight = this.calculateContentHeight(config.content, config.maxWidth || 40);

    let adjustedX = x + 2; // Offset from mouse
    let adjustedY = y - 1;

    // Adjust X position to stay within screen bounds
    if (adjustedX + tooltipWidth > screenWidth) {
      adjustedX = x - tooltipWidth - 2; // Show to the left of mouse
    }
    if (adjustedX < 0) {
      adjustedX = 0;
    }

    // Adjust Y position to stay within screen bounds
    if (adjustedY + tooltipHeight > screenHeight) {
      adjustedY = y - tooltipHeight - 1; // Show above mouse
    }
    if (adjustedY < 0) {
      adjustedY = 0;
    }

    return { adjustedX, adjustedY };
  }

  /**
   * Calculate content height based on text wrapping
   */
  private calculateContentHeight(content: string, maxWidth: number): number {
    const effectiveWidth = maxWidth - 4; // Account for padding and borders
    const lines = content.split('\n');
    let totalLines = 0;

    for (const line of lines) {
      if (line.length <= effectiveWidth) {
        totalLines += 1;
      } else {
        totalLines += Math.ceil(line.length / effectiveWidth);
      }
    }

    return Math.max(1, totalLines) + 2; // Add border height
  }

  /**
   * Destroy the tooltip and clean up resources
   */
  public destroy(): void {
    this.hide();
    
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }
  }
}