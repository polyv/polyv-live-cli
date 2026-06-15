/**
 * @fileoverview Mouse handling utilities for terminal interactions
 * @author Development Team
 * @since 1.0.0
 */

import { MouseEvent } from '../types/interaction';

/**
 * Mouse interaction state tracking
 */
interface MouseState {
  /** Last mouse position */
  lastPosition: { x: number; y: number };
  /** Whether mouse is being dragged */
  isDragging: boolean;
  /** Drag start position */
  dragStart: { x: number; y: number } | undefined;
  /** Currently pressed buttons */
  pressedButtons: Set<string>;
  /** Last click time for double-click detection */
  lastClickTime: number;
  /** Last click position for double-click detection */
  lastClickPosition: { x: number; y: number } | undefined;
  /** Hover state tracking */
  hoveredElement: string | undefined;
}

/**
 * Rectangle bounds interface
 */
interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Utility class for mouse event processing and gesture recognition
 */
export class MouseHandler {
  private state: MouseState = {
    lastPosition: { x: 0, y: 0 },
    isDragging: false,
    dragStart: undefined,
    pressedButtons: new Set(),
    lastClickTime: 0,
    lastClickPosition: undefined,
    hoveredElement: undefined,
  };

  private readonly DOUBLE_CLICK_THRESHOLD_MS = 500;
  private readonly DOUBLE_CLICK_DISTANCE_THRESHOLD = 5;
  private readonly DRAG_THRESHOLD = 3;

  /**
   * Normalize mouse event to standard format
   */
  public static normalizeMouseEvent(rawEvent: any): MouseEvent {
    return {
      action: rawEvent.action || 'mousedown',
      x: rawEvent.x || 0,
      y: rawEvent.y || 0,
      button: rawEvent.button || 'left',
      shift: !!rawEvent.shift,
      ctrl: !!rawEvent.ctrl,
    };
  }

  /**
   * Process mouse event and update state
   */
  public processMouseEvent(event: MouseEvent): {
    event: MouseEvent;
    isDoubleClick: boolean;
    isDragStart: boolean;
    isDragMove: boolean;
    isDragEnd: boolean;
    dragDistance: number | undefined;
  } {
    const now = Date.now();
    const result = {
      event,
      isDoubleClick: false,
      isDragStart: false,
      isDragMove: false,
      isDragEnd: false,
      dragDistance: undefined as number | undefined,
    };

    switch (event.action) {
      case 'mousedown':
        this.handleMouseDown(event, now, result);
        break;
      case 'mouseup':
        this.handleMouseUp(event, result);
        break;
      case 'mousemove':
        this.handleMouseMove(event, result);
        break;
      case 'wheelup':
      case 'wheeldown':
        this.handleWheel(event);
        break;
    }

    // Update last position
    this.state.lastPosition = { x: event.x, y: event.y };

    return result;
  }

  /**
   * Handle mouse down events
   */
  private handleMouseDown(
    event: MouseEvent,
    now: number,
    result: ReturnType<MouseHandler['processMouseEvent']>
  ): void {
    this.state.pressedButtons.add(event.button);

    // Check for double-click
    if (event.button === 'left') {
      const timeDiff = now - this.state.lastClickTime;
      const positionDiff = this.state.lastClickPosition
        ? this.calculateDistance(event, this.state.lastClickPosition)
        : Infinity;

      if (timeDiff < this.DOUBLE_CLICK_THRESHOLD_MS &&
          positionDiff < this.DOUBLE_CLICK_DISTANCE_THRESHOLD) {
        result.isDoubleClick = true;
        this.state.lastClickTime = 0; // Reset to prevent triple-click
        this.state.lastClickPosition = undefined;
      } else {
        this.state.lastClickTime = now;
        this.state.lastClickPosition = { x: event.x, y: event.y };
      }
    }

    // Prepare for potential drag
    this.state.dragStart = { x: event.x, y: event.y };
  }

  /**
   * Handle mouse up events
   */
  private handleMouseUp(
    event: MouseEvent,
    result: ReturnType<MouseHandler['processMouseEvent']>
  ): void {
    this.state.pressedButtons.delete(event.button);

    // End drag if it was active
    if (this.state.isDragging) {
      result.isDragEnd = true;
      this.state.isDragging = false;
      this.state.dragStart = undefined;
    }
  }

  /**
   * Handle mouse move events
   */
  private handleMouseMove(
    event: MouseEvent,
    result: ReturnType<MouseHandler['processMouseEvent']>
  ): void {
    // Check if we should start dragging
    if (!this.state.isDragging &&
        this.state.dragStart &&
        this.state.pressedButtons.has('left')) {
      
      const distance = this.calculateDistance(event, this.state.dragStart);
      if (distance > this.DRAG_THRESHOLD) {
        this.state.isDragging = true;
        result.isDragStart = true;
      }
    }

    // Update drag state
    if (this.state.isDragging) {
      result.isDragMove = true;
      if (this.state.dragStart) {
        result.dragDistance = this.calculateDistance(event, this.state.dragStart);
      }
    }
  }

  /**
   * Handle wheel events
   */
  private handleWheel(event: MouseEvent): void {
    // Wheel events don't require special state tracking
    // Just update position for consistency
    this.state.lastPosition = { x: event.x, y: event.y };
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(
    point1: { x: number; y: number },
    point2: { x: number; y: number }
  ): number {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check if point is within bounds
   */
  public static isPointInBounds(
    point: { x: number; y: number },
    bounds: Bounds
  ): boolean {
    return point.x >= bounds.x &&
           point.x < bounds.x + bounds.width &&
           point.y >= bounds.y &&
           point.y < bounds.y + bounds.height;
  }

  /**
   * Check if mouse event is within bounds
   */
  public static isMouseEventInBounds(event: MouseEvent, bounds: Bounds): boolean {
    return MouseHandler.isPointInBounds({ x: event.x, y: event.y }, bounds);
  }

  /**
   * Get relative position within bounds
   */
  public static getRelativePosition(
    point: { x: number; y: number },
    bounds: Bounds
  ): { x: number; y: number } {
    return {
      x: point.x - bounds.x,
      y: point.y - bounds.y,
    };
  }

  /**
   * Check if mouse is currently being dragged
   */
  public isDragging(): boolean {
    return this.state.isDragging;
  }

  /**
   * Get current mouse position
   */
  public getCurrentPosition(): { x: number; y: number } {
    return { ...this.state.lastPosition };
  }

  /**
   * Get pressed buttons
   */
  public getPressedButtons(): string[] {
    return Array.from(this.state.pressedButtons);
  }

  /**
   * Check if specific button is pressed
   */
  public isButtonPressed(button: string): boolean {
    return this.state.pressedButtons.has(button);
  }

  /**
   * Get drag start position if dragging
   */
  public getDragStart(): { x: number; y: number } | undefined {
    return this.state.dragStart ? { ...this.state.dragStart } : undefined;
  }

  /**
   * Set hover state for element
   */
  public setHover(elementId: string): void {
    this.state.hoveredElement = elementId;
  }

  /**
   * Clear hover state
   */
  public clearHover(): void {
    this.state.hoveredElement = undefined;
  }

  /**
   * Get currently hovered element
   */
  public getHoveredElement(): string | undefined {
    return this.state.hoveredElement;
  }

  /**
   * Reset mouse state
   */
  public reset(): void {
    this.state = {
      lastPosition: { x: 0, y: 0 },
      isDragging: false,
      dragStart: undefined,
      pressedButtons: new Set(),
      lastClickTime: 0,
      lastClickPosition: undefined,
      hoveredElement: undefined,
    };
  }

  /**
   * Create bounds object from position and size
   */
  public static createBounds(
    x: number,
    y: number,
    width: number,
    height: number
  ): Bounds {
    return { x, y, width, height };
  }

  /**
   * Expand bounds by margin
   */
  public static expandBounds(bounds: Bounds, margin: number): Bounds {
    return {
      x: bounds.x - margin,
      y: bounds.y - margin,
      width: bounds.width + 2 * margin,
      height: bounds.height + 2 * margin,
    };
  }

  /**
   * Check if two bounds intersect
   */
  public static boundsIntersect(bounds1: Bounds, bounds2: Bounds): boolean {
    return bounds1.x < bounds2.x + bounds2.width &&
           bounds1.x + bounds1.width > bounds2.x &&
           bounds1.y < bounds2.y + bounds2.height &&
           bounds1.y + bounds1.height > bounds2.y;
  }

  /**
   * Get intersection of two bounds
   */
  public static getIntersection(bounds1: Bounds, bounds2: Bounds): Bounds | null {
    if (!MouseHandler.boundsIntersect(bounds1, bounds2)) {
      return null;
    }

    const x = Math.max(bounds1.x, bounds2.x);
    const y = Math.max(bounds1.y, bounds2.y);
    const width = Math.min(bounds1.x + bounds1.width, bounds2.x + bounds2.width) - x;
    const height = Math.min(bounds1.y + bounds1.height, bounds2.y + bounds2.height) - y;

    return { x, y, width, height };
  }

  /**
   * Destroy the mouse handler
   */
  public destroy(): void {
    this.reset();
  }
}