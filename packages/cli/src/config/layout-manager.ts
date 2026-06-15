/**
 * Layout management system for monitoring interface
 * Handles layout templates, component positioning, and responsive design
 */

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { LayoutConfig, ComponentLayout } from '../types/monitoring';
import { ConfigValidator } from './config-validator';
import { ConfigurationError } from '../utils/errors';

export interface LayoutManagerOptions {
  layoutsDir?: string;
  autoSave?: boolean;
  enableResponsive?: boolean;
}

export interface TerminalSize {
  width: number;
  height: number;
}

export interface LayoutMetrics {
  totalComponents: number;
  activeComponents: number;
  gridUtilization: number;
  overlappingComponents: ComponentLayout[];
}

/**
 * Layout manager class for handling layout operations
 * Provides layout loading, switching, creation, and responsive design
 */
export class LayoutManager extends EventEmitter {
  private layouts: Map<string, LayoutConfig> = new Map();
  private currentLayoutId: string = 'default';
  private customLayouts: Map<string, LayoutConfig> = new Map();
  private layoutsDir: string;
  private options: Required<LayoutManagerOptions>;
  private currentTerminalSize: TerminalSize = { width: 120, height: 40 };

  constructor(options: LayoutManagerOptions = {}) {
    super();
    
    this.options = {
      layoutsDir: options.layoutsDir || path.join(os.homedir(), '.polyv-live-cli', 'layouts'),
      autoSave: options.autoSave ?? true,
      enableResponsive: options.enableResponsive ?? true,
    };

    this.layoutsDir = this.options.layoutsDir;
    
    // Ensure layouts directory exists
    this.ensureLayoutsDirectory();
    
    // Load built-in layouts
    this.loadBuiltInLayouts();
    
    // Load custom layouts
    this.loadCustomLayouts();
  }

  /**
   * Gets available layout IDs
   * @returns Array of layout IDs
   */
  getAvailableLayouts(): string[] {
    return Array.from(this.layouts.keys());
  }

  /**
   * Gets layout configuration by ID
   * @param layoutId Layout ID
   * @returns Layout configuration or undefined
   */
  getLayout(layoutId: string): LayoutConfig | undefined {
    return this.layouts.get(layoutId);
  }

  /**
   * Gets current active layout
   * @returns Current layout configuration
   */
  getCurrentLayout(): LayoutConfig {
    const layout = this.layouts.get(this.currentLayoutId);
    if (!layout) {
      throw new ConfigurationError(`Current layout '${this.currentLayoutId}' not found`);
    }
    return layout;
  }

  /**
   * Gets current layout ID
   * @returns Current layout ID
   */
  getCurrentLayoutId(): string {
    return this.currentLayoutId;
  }

  /**
   * Applies a layout by ID
   * @param layoutId Layout ID to apply
   * @returns Promise resolving when layout is applied
   */
  async applyLayout(layoutId: string): Promise<void> {
    const layout = this.layouts.get(layoutId);
    if (!layout) {
      throw new ConfigurationError(`Layout '${layoutId}' not found`);
    }

    // Validate layout before applying
    const validation = ConfigValidator.validateLayoutConfig(layout);
    if (!validation.valid) {
      throw new ConfigurationError(
        `Cannot apply invalid layout: ${ConfigValidator.createErrorMessage(validation)}`
      );
    }

    // Check if terminal size meets minimum requirements
    if (this.currentTerminalSize.width < layout.minTerminalSize.width ||
        this.currentTerminalSize.height < layout.minTerminalSize.height) {
      throw new ConfigurationError(
        `Terminal size ${this.currentTerminalSize.width}x${this.currentTerminalSize.height} ` +
        `is smaller than layout minimum ${layout.minTerminalSize.width}x${layout.minTerminalSize.height}`
      );
    }

    const previousLayoutId = this.currentLayoutId;
    this.currentLayoutId = layoutId;

    try {
      // Apply responsive adjustments if enabled
      const adjustedLayout = this.options.enableResponsive 
        ? this.applyResponsiveAdjustments(layout)
        : layout;
      
      // Apply layout to interface
      await this.applyLayoutToInterface(adjustedLayout);
      
      this.emit('layout:applied', adjustedLayout, previousLayoutId);
      
    } catch (error) {
      // Rollback on failure
      this.currentLayoutId = previousLayoutId;
      throw new ConfigurationError(
        `Failed to apply layout '${layoutId}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Creates a new custom layout
   * @param layout Layout configuration
   * @returns Promise resolving when layout is created
   */
  async createCustomLayout(layout: LayoutConfig): Promise<void> {
    // Validate layout
    const validation = ConfigValidator.validateLayoutConfig(layout);
    if (!validation.valid) {
      throw new ConfigurationError(
        `Cannot create invalid layout: ${ConfigValidator.createErrorMessage(validation)}`
      );
    }

    // Check if layout ID already exists
    if (this.layouts.has(layout.id)) {
      throw new ConfigurationError(`Layout with ID '${layout.id}' already exists`);
    }

    // Ensure it's marked as custom layout
    const customLayout: LayoutConfig = {
      ...layout,
      isBuiltIn: false,
    };

    // Save layout to file
    await this.saveCustomLayout(customLayout);
    
    // Add to collections
    this.layouts.set(customLayout.id, customLayout);
    this.customLayouts.set(customLayout.id, customLayout);
    
    this.emit('layout:created', customLayout);
  }

  /**
   * Updates an existing custom layout
   * @param layoutId Layout ID to update
   * @param updates Layout updates
   * @returns Promise resolving when layout is updated
   */
  async updateCustomLayout(layoutId: string, updates: Partial<LayoutConfig>): Promise<void> {
    const existingLayout = this.customLayouts.get(layoutId);
    if (!existingLayout) {
      throw new ConfigurationError(`Custom layout '${layoutId}' not found`);
    }

    if (existingLayout.isBuiltIn) {
      throw new ConfigurationError(`Cannot update built-in layout '${layoutId}'`);
    }

    // Merge updates
    const updatedLayout: LayoutConfig = {
      ...existingLayout,
      ...updates,
      id: layoutId, // Prevent ID changes
      isBuiltIn: false, // Ensure it remains custom
    };

    // Validate updated layout
    const validation = ConfigValidator.validateLayoutConfig(updatedLayout);
    if (!validation.valid) {
      throw new ConfigurationError(
        `Cannot update to invalid layout: ${ConfigValidator.createErrorMessage(validation)}`
      );
    }

    // Save updated layout
    await this.saveCustomLayout(updatedLayout);
    
    // Update collections
    this.layouts.set(layoutId, updatedLayout);
    this.customLayouts.set(layoutId, updatedLayout);
    
    // If this is the current layout, re-apply it
    if (this.currentLayoutId === layoutId) {
      await this.applyLayoutToInterface(updatedLayout);
    }
    
    this.emit('layout:updated', updatedLayout, existingLayout);
  }

  /**
   * Deletes a custom layout
   * @param layoutId Layout ID to delete
   * @returns Promise resolving when layout is deleted
   */
  async deleteCustomLayout(layoutId: string): Promise<void> {
    const layout = this.customLayouts.get(layoutId);
    if (!layout) {
      throw new ConfigurationError(`Custom layout '${layoutId}' not found`);
    }

    if (layout.isBuiltIn) {
      throw new ConfigurationError(`Cannot delete built-in layout '${layoutId}'`);
    }

    // If this is the current layout, switch to default first
    if (this.currentLayoutId === layoutId) {
      await this.applyLayout('default');
    }

    // Remove layout file
    const layoutFile = path.join(this.layoutsDir, `${layoutId}.json`);
    if (fs.existsSync(layoutFile)) {
      await fs.promises.unlink(layoutFile);
    }
    
    // Remove from collections
    this.layouts.delete(layoutId);
    this.customLayouts.delete(layoutId);
    
    this.emit('layout:deleted', layout);
  }

  /**
   * Updates terminal size and triggers responsive layout adjustments
   * @param size New terminal size
   * @returns Promise resolving when adjustments are applied
   */
  async updateTerminalSize(size: TerminalSize): Promise<void> {
    const previousSize = { ...this.currentTerminalSize };
    this.currentTerminalSize = size;
    
    if (this.options.enableResponsive) {
      const currentLayout = this.getCurrentLayout();
      
      // Check if size meets minimum requirements
      if (size.width < currentLayout.minTerminalSize.width ||
          size.height < currentLayout.minTerminalSize.height) {
        this.emit('layout:size-warning', {
          current: size,
          minimum: currentLayout.minTerminalSize,
          layout: currentLayout.id
        });
      }
      
      // Apply responsive adjustments
      const adjustedLayout = this.applyResponsiveAdjustments(currentLayout);
      await this.applyLayoutToInterface(adjustedLayout);
    }
    
    this.emit('layout:terminal-resized', size, previousSize);
  }

  /**
   * Gets layout metrics for analysis
   * @param layoutId Layout ID (current layout if not specified)
   * @returns Layout metrics
   */
  getLayoutMetrics(layoutId?: string): LayoutMetrics {
    const layout = layoutId 
      ? this.layouts.get(layoutId)
      : this.getCurrentLayout();
      
    if (!layout) {
      throw new ConfigurationError(`Layout '${layoutId}' not found`);
    }

    const metrics: LayoutMetrics = {
      totalComponents: layout.components.length,
      activeComponents: layout.components.filter(c => c.config['visible'] !== false).length,
      gridUtilization: this.calculateGridUtilization(layout),
      overlappingComponents: this.findOverlappingComponents(layout),
    };

    return metrics;
  }

  /**
   * Validates component positions for overlaps
   * @param layout Layout to validate
   * @returns Array of overlapping components
   */
  findOverlappingComponents(layout: LayoutConfig): ComponentLayout[] {
    const overlapping: ComponentLayout[] = [];
    const components = layout.components;

    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const componentI = components[i];
        const componentJ = components[j];
        if (componentI && componentJ && this.componentsOverlap(componentI, componentJ)) {
          if (!overlapping.includes(componentI)) {
            overlapping.push(componentI);
          }
          if (!overlapping.includes(componentJ)) {
            overlapping.push(componentJ);
          }
        }
      }
    }

    return overlapping;
  }

  /**
   * Optimizes layout by resolving overlaps and improving grid utilization
   * @param layout Layout to optimize
   * @returns Optimized layout
   */
  optimizeLayout(layout: LayoutConfig): LayoutConfig {
    const optimizedLayout = JSON.parse(JSON.stringify(layout)) as LayoutConfig;
    
    // Resolve overlapping components
    this.resolveOverlaps(optimizedLayout);
    
    // Pack components more efficiently
    this.packComponents(optimizedLayout);
    
    return optimizedLayout;
  }

  /**
   * Gets all custom layouts
   * @returns Array of custom layout configurations
   */
  getCustomLayouts(): LayoutConfig[] {
    return Array.from(this.customLayouts.values());
  }

  /**
   * Gets all built-in layouts
   * @returns Array of built-in layout configurations
   */
  getBuiltInLayouts(): LayoutConfig[] {
    return Array.from(this.layouts.values()).filter(layout => layout.isBuiltIn);
  }

  /**
   * Exports a layout to a file
   * @param layoutId Layout ID to export
   * @param filePath Export file path
   * @returns Promise resolving when export is complete
   */
  async exportLayout(layoutId: string, filePath: string): Promise<void> {
    const layout = this.layouts.get(layoutId);
    if (!layout) {
      throw new ConfigurationError(`Layout '${layoutId}' not found`);
    }

    try {
      const layoutJson = JSON.stringify(layout, null, 2);
      await fs.promises.writeFile(filePath, layoutJson, 'utf8');
      
      this.emit('layout:exported', layout, filePath);
      
    } catch (error) {
      throw new ConfigurationError(
        `Failed to export layout to '${filePath}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Imports a layout from a file
   * @param filePath Import file path
   * @returns Promise resolving to imported layout
   */
  async importLayout(filePath: string): Promise<LayoutConfig> {
    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      const layout = JSON.parse(fileContent) as LayoutConfig;
      
      // Validate imported layout
      const validation = ConfigValidator.validateLayoutConfig(layout);
      if (!validation.valid) {
        throw new ConfigurationError(
          `Invalid layout file: ${ConfigValidator.createErrorMessage(validation)}`
        );
      }

      // Check for ID conflicts
      if (this.layouts.has(layout.id)) {
        // Generate unique ID
        const originalId = layout.id;
        let counter = 1;
        while (this.layouts.has(`${originalId}-${counter}`)) {
          counter++;
        }
        layout.id = `${originalId}-${counter}`;
      }

      // Mark as custom layout
      layout.isBuiltIn = false;
      
      // Create the layout
      await this.createCustomLayout(layout);
      
      this.emit('layout:imported', layout, filePath);
      
      return layout;
      
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }
      throw new ConfigurationError(
        `Failed to import layout from '${filePath}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Ensures layouts directory exists
   */
  private ensureLayoutsDirectory(): void {
    try {
      if (!fs.existsSync(this.layoutsDir)) {
        fs.mkdirSync(this.layoutsDir, { recursive: true });
      }
    } catch (error) {
      throw new ConfigurationError(
        `Failed to create layouts directory: ${error}`
      );
    }
  }

  /**
   * Loads built-in layouts
   */
  private loadBuiltInLayouts(): void {
    // Default layout
    const defaultLayout = this.createDefaultLayout();
    this.layouts.set(defaultLayout.id, defaultLayout);
    
    // Compact layout
    const compactLayout = this.createCompactLayout();
    this.layouts.set(compactLayout.id, compactLayout);
    
    // Widescreen layout
    const widescreenLayout = this.createWidescreenLayout();
    this.layouts.set(widescreenLayout.id, widescreenLayout);
    
    // Single column layout
    const singleColumnLayout = this.createSingleColumnLayout();
    this.layouts.set(singleColumnLayout.id, singleColumnLayout);
  }

  /**
   * Loads custom layouts from files
   */
  private async loadCustomLayouts(): Promise<void> {
    try {
      if (!fs.existsSync(this.layoutsDir)) {
        return;
      }

      const files = await fs.promises.readdir(this.layoutsDir);
      const layoutFiles = files.filter(file => file.endsWith('.json'));
      
      for (const file of layoutFiles) {
        try {
          const filePath = path.join(this.layoutsDir, file);
          const fileContent = await fs.promises.readFile(filePath, 'utf8');
          const layout = JSON.parse(fileContent) as LayoutConfig;
          
          // Validate layout
          const validation = ConfigValidator.validateLayoutConfig(layout);
          if (validation.valid) {
            this.layouts.set(layout.id, layout);
            this.customLayouts.set(layout.id, layout);
          } else {
            console.warn(`Invalid layout file ${file}: ${validation.errors.join(', ')}`);
          }
          
        } catch (error) {
          console.warn(`Failed to load layout file ${file}: ${error}`);
        }
      }
      
    } catch (error) {
      console.warn(`Failed to load custom layouts: ${error}`);
    }
  }

  /**
   * Saves a custom layout to file
   * @param layout Layout to save
   */
  private async saveCustomLayout(layout: LayoutConfig): Promise<void> {
    const layoutFile = path.join(this.layoutsDir, `${layout.id}.json`);
    const layoutJson = JSON.stringify(layout, null, 2);
    
    try {
      await fs.promises.writeFile(layoutFile, layoutJson, 'utf8');
    } catch (error) {
      throw new ConfigurationError(
        `Failed to save layout '${layout.id}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Applies layout to the interface
   * @param layout Layout to apply
   */
  private async applyLayoutToInterface(layout: LayoutConfig): Promise<void> {
    // This method would integrate with the blessed-contrib interface
    // For now, we'll emit an event that the monitoring dashboard can listen to
    this.emit('layout:interface-update', layout);
    
    // Add a small delay to simulate layout application
    // Use shorter delay in test environment
    const delay = process.env['NODE_ENV'] === 'test' ? 1 : 100;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Applies responsive adjustments to layout based on terminal size
   * @param layout Original layout
   * @returns Adjusted layout
   */
  private applyResponsiveAdjustments(layout: LayoutConfig): LayoutConfig {
    if (!layout.responsive) {
      return layout;
    }

    const adjustedLayout = JSON.parse(JSON.stringify(layout)) as LayoutConfig;
    const { width, height } = this.currentTerminalSize;
    
    // Calculate scale factors
    const scaleX = width / layout.minTerminalSize.width;
    const scaleY = height / layout.minTerminalSize.height;
    
    // Adjust component positions and sizes
    adjustedLayout.components.forEach(component => {
      component.position.width = Math.floor(component.position.width * scaleX);
      component.position.height = Math.floor(component.position.height * scaleY);
      
      // Ensure minimum sizes are respected
      component.position.width = Math.max(component.position.width, component.size.minWidth);
      component.position.height = Math.max(component.position.height, component.size.minHeight);
      
      // Respect maximum sizes if defined
      if (component.size.maxWidth) {
        component.position.width = Math.min(component.position.width, component.size.maxWidth);
      }
      if (component.size.maxHeight) {
        component.position.height = Math.min(component.position.height, component.size.maxHeight);
      }
    });
    
    return adjustedLayout;
  }

  /**
   * Checks if two components overlap
   * @param comp1 First component
   * @param comp2 Second component
   * @returns True if components overlap
   */
  private componentsOverlap(comp1: ComponentLayout, comp2: ComponentLayout): boolean {
    const r1 = comp1.position;
    const r2 = comp2.position;
    
    return !(r1.x + r1.width <= r2.x ||
             r2.x + r2.width <= r1.x ||
             r1.y + r1.height <= r2.y ||
             r2.y + r2.height <= r1.y);
  }

  /**
   * Calculates grid utilization percentage
   * @param layout Layout to analyze
   * @returns Grid utilization percentage (0-100)
   */
  private calculateGridUtilization(layout: LayoutConfig): number {
    const totalCells = layout.grid.rows * layout.grid.cols;
    let usedCells = 0;
    
    layout.components.forEach(component => {
      usedCells += component.position.width * component.position.height;
    });
    
    return Math.min(100, (usedCells / totalCells) * 100);
  }

  /**
   * Resolves overlapping components by adjusting positions
   * @param layout Layout to fix
   */
  private resolveOverlaps(layout: LayoutConfig): void {
    const components = layout.components;
    
    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const componentI = components[i];
        const componentJ = components[j];
        if (componentI && componentJ && this.componentsOverlap(componentI, componentJ)) {
          // Move the second component to avoid overlap
          this.repositionComponent(layout, componentJ, components.slice(0, j));
        }
      }
    }
  }

  /**
   * Repositions a component to avoid overlaps
   * @param layout Layout context
   * @param component Component to reposition
   * @param existingComponents Existing components to avoid
   */
  private repositionComponent(
    layout: LayoutConfig,
    component: ComponentLayout,
    existingComponents: ComponentLayout[]
  ): void {
    const grid = layout.grid;
    
    // Try to find a free position
    for (let y = 0; y <= grid.rows - component.position.height; y++) {
      for (let x = 0; x <= grid.cols - component.position.width; x++) {
        const testPosition = {
          ...component.position,
          x,
          y,
        };
        
        const testComponent = { ...component, position: testPosition };
        
        if (!existingComponents.some(existing => 
          this.componentsOverlap(testComponent, existing)
        )) {
          component.position.x = x;
          component.position.y = y;
          return;
        }
      }
    }
  }

  /**
   * Packs components more efficiently to reduce empty space
   * @param layout Layout to pack
   */
  private packComponents(layout: LayoutConfig): void {
    // Sort components by size (largest first)
    layout.components.sort((a, b) => {
      const aSize = a.position.width * a.position.height;
      const bSize = b.position.width * b.position.height;
      return bSize - aSize;
    });
    
    // Reposition each component optimally
    layout.components.forEach((component, index) => {
      const otherComponents = layout.components.slice(0, index);
      this.repositionComponent(layout, component, otherComponents);
    });
  }

  /**
   * Creates default layout configuration
   */
  private createDefaultLayout(): LayoutConfig {
    return {
      id: 'default',
      name: 'Default',
      description: 'Standard monitoring layout with balanced component arrangement',
      isBuiltIn: true,
      responsive: true,
      grid: {
        rows: 12,
        cols: 12,
        cellWidth: 10,
        cellHeight: 3,
        padding: 1,
      },
      minTerminalSize: { width: 120, height: 40 },
      components: [
        {
          type: 'stream-metrics',
          position: { x: 0, y: 0, width: 8, height: 6 },
          size: { minWidth: 40, minHeight: 15 },
          config: { priority: 1 },
        },
        {
          type: 'channel-status',
          position: { x: 8, y: 0, width: 4, height: 6 },
          size: { minWidth: 30, minHeight: 15 },
          config: { priority: 2 },
        },
        {
          type: 'system-resources',
          position: { x: 0, y: 6, width: 6, height: 6 },
          size: { minWidth: 30, minHeight: 15 },
          config: { priority: 3 },
        },
        {
          type: 'alert-panel',
          position: { x: 6, y: 6, width: 6, height: 6 },
          size: { minWidth: 30, minHeight: 15 },
          config: { priority: 4 },
        },
      ],
    };
  }

  /**
   * Creates compact layout configuration
   */
  private createCompactLayout(): LayoutConfig {
    return {
      id: 'compact',
      name: 'Compact',
      description: 'Space-efficient layout for smaller terminals',
      isBuiltIn: true,
      responsive: true,
      grid: {
        rows: 8,
        cols: 8,
        cellWidth: 8,
        cellHeight: 2,
        padding: 0,
      },
      minTerminalSize: { width: 80, height: 24 },
      components: [
        {
          type: 'stream-metrics',
          position: { x: 0, y: 0, width: 4, height: 4 },
          size: { minWidth: 30, minHeight: 10 },
          config: { priority: 1 },
        },
        {
          type: 'channel-status',
          position: { x: 4, y: 0, width: 4, height: 4 },
          size: { minWidth: 25, minHeight: 10 },
          config: { priority: 2 },
        },
        {
          type: 'system-resources',
          position: { x: 0, y: 4, width: 4, height: 4 },
          size: { minWidth: 25, minHeight: 10 },
          config: { priority: 3 },
        },
        {
          type: 'alert-panel',
          position: { x: 4, y: 4, width: 4, height: 4 },
          size: { minWidth: 25, minHeight: 10 },
          config: { priority: 4 },
        },
      ],
    };
  }

  /**
   * Creates widescreen layout configuration
   */
  private createWidescreenLayout(): LayoutConfig {
    return {
      id: 'widescreen',
      name: 'Widescreen',
      description: 'Optimized layout for wide terminal displays',
      isBuiltIn: true,
      responsive: true,
      grid: {
        rows: 8,
        cols: 16,
        cellWidth: 12,
        cellHeight: 4,
        padding: 1,
      },
      minTerminalSize: { width: 160, height: 40 },
      components: [
        {
          type: 'stream-metrics',
          position: { x: 0, y: 0, width: 6, height: 4 },
          size: { minWidth: 40, minHeight: 15 },
          config: { priority: 1 },
        },
        {
          type: 'channel-status',
          position: { x: 6, y: 0, width: 5, height: 4 },
          size: { minWidth: 35, minHeight: 15 },
          config: { priority: 2 },
        },
        {
          type: 'system-resources',
          position: { x: 11, y: 0, width: 5, height: 4 },
          size: { minWidth: 35, minHeight: 15 },
          config: { priority: 3 },
        },
        {
          type: 'alert-panel',
          position: { x: 0, y: 4, width: 16, height: 4 },
          size: { minWidth: 80, minHeight: 15 },
          config: { priority: 4 },
        },
      ],
    };
  }

  /**
   * Creates single column layout configuration
   */
  private createSingleColumnLayout(): LayoutConfig {
    return {
      id: 'single-column',
      name: 'Single Column',
      description: 'Vertical layout suitable for narrow terminals',
      isBuiltIn: true,
      responsive: false,
      grid: {
        rows: 16,
        cols: 6,
        cellWidth: 12,
        cellHeight: 3,
        padding: 1,
      },
      minTerminalSize: { width: 80, height: 60 },
      components: [
        {
          type: 'stream-metrics',
          position: { x: 0, y: 0, width: 6, height: 4 },
          size: { minWidth: 60, minHeight: 12 },
          config: { priority: 1 },
        },
        {
          type: 'channel-status',
          position: { x: 0, y: 4, width: 6, height: 4 },
          size: { minWidth: 60, minHeight: 12 },
          config: { priority: 2 },
        },
        {
          type: 'system-resources',
          position: { x: 0, y: 8, width: 6, height: 4 },
          size: { minWidth: 60, minHeight: 12 },
          config: { priority: 3 },
        },
        {
          type: 'alert-panel',
          position: { x: 0, y: 12, width: 6, height: 4 },
          size: { minWidth: 60, minHeight: 12 },
          config: { priority: 4 },
        },
      ],
    };
  }

  /**
   * Destroys the layout manager and cleans up resources
   */
  destroy(): void {
    this.removeAllListeners();
    this.layouts.clear();
    this.customLayouts.clear();
  }
}

/**
 * Default layout manager instance
 */
export const layoutManager = new LayoutManager();
