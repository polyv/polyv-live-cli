import * as contrib from 'blessed-contrib';
import { EventEmitter } from 'events';
import { BaseComponent } from './base.component';
import { GridPosition, GridSize, LayoutConfig } from '../types/monitoring';

export interface GridCell {
  component?: BaseComponent;
  position: GridPosition;
  widget?: any;
  occupied: boolean;
}

export class GridManager {
  private screen: any;
  private grid: any;
  private eventBus: EventEmitter;
  private cells: GridCell[][] = [];
  private rows: number;
  private cols: number;
  private currentLayout: string;
  private layouts = new Map<string, LayoutConfig>();
  private resizeTimeout?: NodeJS.Timeout;

  constructor(screen: any, eventBus: EventEmitter, rows = 12, cols = 12) {
    this.screen = screen;
    this.eventBus = eventBus;
    this.rows = rows;
    this.cols = cols;
    this.currentLayout = 'default';
    
    this.initializeGrid();
    this.initializeCells();
    this.setupEventListeners();
    this.registerDefaultLayouts();
  }

  private initializeGrid(): void {
    this.grid = contrib.grid({
      rows: this.rows,
      cols: this.cols,
      screen: this.screen,
    });
  }

  private initializeCells(): void {
    this.cells = [];
    for (let row = 0; row < this.rows; row++) {
      this.cells[row] = [];
      for (let col = 0; col < this.cols; col++) {
        if (this.cells[row]) {
          this.cells[row]![col] = {
            position: { x: col, y: row, width: 1, height: 1 },
            occupied: false,
          };
        }
      }
    }
  }

  private setupEventListeners(): void {
    if (this.screen?.on) {
      this.screen.on('resize', () => {
        this.handleResize();
      });
    }

    this.eventBus.on('layout:change', (data) => {
      this.setLayout(data.layout);
    });

    this.eventBus.on('component:created', (_data) => {
      this.handleComponentCreated();
    });

    this.eventBus.on('component:destroyed', (data) => {
      this.handleComponentDestroyed(data);
    });
  }

  private handleResize(): void {
    // Debounce resize events
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = setTimeout(() => {
      this.recalculateLayout();
      
      // Use the same terminal size detection approach as other components
      const envWidth = process.env['POLYV_TERMINAL_WIDTH'];
      const envHeight = process.env['POLYV_TERMINAL_HEIGHT'];
      
      let width = process.stdout.columns && process.stdout.columns > 0 ? process.stdout.columns : 120;
      let height = process.stdout.rows && process.stdout.rows > 0 ? process.stdout.rows : 30;
      
      if (envWidth && parseInt(envWidth) > 0) {
        width = parseInt(envWidth);
      }
      if (envHeight && parseInt(envHeight) > 0) {
        height = parseInt(envHeight);
      }
      
      // Fall back to screen size if available and makes sense
      if (this.screen?.width && this.screen.width > 1) {
        width = this.screen.width;
      }
      if (this.screen?.height && this.screen.height > 1) {
        height = this.screen.height;
      }
      
      this.eventBus.emit('terminal:resize', {
        width,
        height,
      });
    }, 100);
  }

  private handleComponentCreated(): void {
    // Components will be added explicitly via addComponent
  }

  private handleComponentDestroyed(data: any): void {
    this.removeComponentFromGrid(data.componentId);
  }

  private registerDefaultLayouts(): void {
    // Default layout: Full screen with multiple panels
    this.layouts.set('default', {
      id: 'default',
      name: 'default',
      isBuiltIn: true,
      grid: { cols: 12, rows: 12, cellWidth: 10, cellHeight: 3, padding: 1 },
      responsive: true,
      minTerminalSize: { width: 120, height: 30 },
      components: [
        {
          type: 'stream-metrics',
          position: { x: 0, y: 0, width: 8, height: 6 },
          size: { minWidth: 40, minHeight: 15 },
          config: {},
        },
        {
          type: 'channel-status',
          position: { x: 8, y: 0, width: 4, height: 6 },
          size: { minWidth: 30, minHeight: 15 },
          config: {},
        },
        {
          type: 'system-resources',
          position: { x: 0, y: 6, width: 6, height: 6 },
          size: { minWidth: 30, minHeight: 15 },
          config: {},
        },
        {
          type: 'activity-log',
          position: { x: 6, y: 6, width: 6, height: 6 },
          size: { minWidth: 30, minHeight: 15 },
          config: {},
        },
      ],
    });

    // Compact layout: For smaller terminals
    this.layouts.set('compact', {
      id: 'compact',
      name: 'compact',
      isBuiltIn: true,
      grid: { cols: 12, rows: 12, cellWidth: 8, cellHeight: 2, padding: 1 },
      responsive: true,
      minTerminalSize: { width: 80, height: 24 },
      components: [
        {
          type: 'stream-metrics',
          position: { x: 0, y: 0, width: 12, height: 8 },
          size: { minWidth: 40, minHeight: 15 },
          config: {},
        },
        {
          type: 'channel-status',
          position: { x: 0, y: 8, width: 12, height: 4 },
          size: { minWidth: 30, minHeight: 8 },
          config: {},
        },
      ],
    });

    // Single panel layout: For very small terminals or focused monitoring
    this.layouts.set('single', {
      id: 'single',
      name: 'single',
      isBuiltIn: true,
      grid: { cols: 12, rows: 12, cellWidth: 6, cellHeight: 2, padding: 1 },
      responsive: true,
      minTerminalSize: { width: 60, height: 20 },
      components: [
        {
          type: 'stream-metrics',
          position: { x: 0, y: 0, width: 12, height: 12 },
          size: { minWidth: 40, minHeight: 15 },
          config: {},
        },
      ],
    });
  }

  public setLayout(layoutName: string): void {
    const layout = this.layouts.get(layoutName);
    if (!layout) {
      throw new Error(`Layout '${layoutName}' not found`);
    }

    // Use the same terminal size detection approach as other components
    const envWidth = process.env['POLYV_TERMINAL_WIDTH'];
    const envHeight = process.env['POLYV_TERMINAL_HEIGHT'];
    
    let width = process.stdout.columns && process.stdout.columns > 0 ? process.stdout.columns : 120;
    let height = process.stdout.rows && process.stdout.rows > 0 ? process.stdout.rows : 30;
    
    if (envWidth && parseInt(envWidth) > 0) {
      width = parseInt(envWidth);
    }
    if (envHeight && parseInt(envHeight) > 0) {
      height = parseInt(envHeight);
    }
    
    // Fall back to screen size if available and makes sense
    if (this.screen.width && this.screen.width > 1) {
      width = this.screen.width;
    }
    if (this.screen.height && this.screen.height > 1) {
      height = this.screen.height;
    }

    const terminalSize = { width, height };
    if (terminalSize.width < layout.minTerminalSize.width ||
        terminalSize.height < layout.minTerminalSize.height) {
      throw new Error(`Terminal size too small for layout '${layoutName}'. ` +
        `Required: ${layout.minTerminalSize.width}x${layout.minTerminalSize.height}, ` +
        `Current: ${terminalSize.width}x${terminalSize.height}`);
    }

    this.currentLayout = layoutName;
    this.clearGrid();
    
    this.eventBus.emit('layout:changed', {
      layout: layoutName,
      config: layout,
      timestamp: new Date(),
    });
  }

  public addComponent(component: BaseComponent, position: GridPosition): any {
    if (!this.canPlaceComponent(position)) {
      throw new Error(`Cannot place component at position ${JSON.stringify(position)}`);
    }

    if (!this.grid) {
      throw new Error('Grid is not initialized. Make sure blessed-contrib is properly imported and initialized.');
    }

    const widget = this.grid.set(
      position.y,
      position.x,
      position.height,
      position.width,
      component.getWidget(),
      {}
    );

    this.markCellsOccupied(position, component);
    
    this.eventBus.emit('grid:componentAdded', {
      componentId: component.getState().id,
      position,
      timestamp: new Date(),
    });

    return widget;
  }

  public removeComponent(componentId: string): boolean {
    const component = this.findComponentById(componentId);
    if (!component) {
      return false;
    }

    this.markCellsUnoccupied(component.position);
    
    this.eventBus.emit('grid:componentRemoved', {
      componentId,
      timestamp: new Date(),
    });

    return true;
  }

  public canPlaceComponent(position: GridPosition): boolean {
    // Check bounds
    if (position.x < 0 || position.y < 0 ||
        position.x + position.width > this.cols ||
        position.y + position.height > this.rows) {
      return false;
    }

    // Check if cells are occupied
    for (let row = position.y; row < position.y + position.height; row++) {
      for (let col = position.x; col < position.x + position.width; col++) {
        if (this.cells[row]?.[col]?.occupied) {
          return false;
        }
      }
    }

    return true;
  }

  public getOptimalPosition(size: GridSize): GridPosition | null {
    const width = Math.min(size.maxWidth || size.minWidth, this.cols);
    const height = Math.min(size.maxHeight || size.minHeight, this.rows);

    // Try to find the first available position
    for (let row = 0; row <= this.rows - height; row++) {
      for (let col = 0; col <= this.cols - width; col++) {
        const position = { x: col, y: row, width, height };
        if (this.canPlaceComponent(position)) {
          return position;
        }
      }
    }

    return null;
  }

  public getAvailableLayouts(): string[] {
    return Array.from(this.layouts.keys());
  }

  public getCurrentLayout(): string {
    return this.currentLayout;
  }

  public getLayoutConfig(layoutName: string): LayoutConfig | undefined {
    return this.layouts.get(layoutName);
  }

  public registerLayout(layout: LayoutConfig): void {
    this.layouts.set(layout.name, layout);
  }

  public getGrid(): contrib.Grid {
    return this.grid;
  }

  public getGridSize(): { rows: number; cols: number } {
    return { rows: this.rows, cols: this.cols };
  }

  public getOccupiedCells(): GridPosition[] {
    const occupied: GridPosition[] = [];
    
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.cells[row]?.[col];
        if (cell?.occupied) {
          occupied.push(cell.position);
        }
      }
    }

    return occupied;
  }

  private findComponentById(componentId: string): GridCell | undefined {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.cells[row]?.[col];
        if (cell?.component && cell.component.getState().id === componentId) {
          return cell;
        }
      }
    }
    return undefined;
  }

  private markCellsOccupied(position: GridPosition, component: BaseComponent): void {
    for (let row = position.y; row < position.y + position.height; row++) {
      for (let col = position.x; col < position.x + position.width; col++) {
        const cell = this.cells[row]?.[col];
        if (cell) {
          cell.occupied = true;
          cell.component = component;
        }
      }
    }
  }

  private markCellsUnoccupied(position: GridPosition): void {
    for (let row = position.y; row < position.y + position.height; row++) {
      for (let col = position.x; col < position.x + position.width; col++) {
        const cell = this.cells[row]?.[col];
        if (cell) {
          cell.occupied = false;
          cell.component = undefined as any;
        }
      }
    }
  }

  private removeComponentFromGrid(componentId: string): void {
    const component = this.findComponentById(componentId);
    if (component) {
      this.markCellsUnoccupied(component.position);
    }
  }

  private clearGrid(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.cells[row]?.[col];
        if (cell) {
          cell.occupied = false;
          cell.component = undefined as any;
        }
      }
    }
  }

  private recalculateLayout(): void {
    // Recalculate positions based on current terminal size
    const layout = this.layouts.get(this.currentLayout);
    if (!layout) return;

    // Use the same terminal size detection approach as other components
    const envWidth = process.env['POLYV_TERMINAL_WIDTH'];
    const envHeight = process.env['POLYV_TERMINAL_HEIGHT'];
    
    let width = process.stdout.columns && process.stdout.columns > 0 ? process.stdout.columns : 120;
    let height = process.stdout.rows && process.stdout.rows > 0 ? process.stdout.rows : 30;
    
    if (envWidth && parseInt(envWidth) > 0) {
      width = parseInt(envWidth);
    }
    if (envHeight && parseInt(envHeight) > 0) {
      height = parseInt(envHeight);
    }
    
    // Fall back to screen size if available and makes sense
    if (this.screen.width && this.screen.width > 1) {
      width = this.screen.width;
    }
    if (this.screen.height && this.screen.height > 1) {
      height = this.screen.height;
    }

    // For now, just emit a resize event - components will handle their own resizing
    this.eventBus.emit('grid:recalculated', {
      layout: this.currentLayout,
      terminalSize: { width, height },
      timestamp: new Date(),
    });
  }

  public destroy(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.clearGrid();
    this.layouts.clear();
    this.screen.removeAllListeners('resize');
  }
}