/**
 * @fileoverview Render performance optimizer for terminal UI
 * Implements incremental rendering and DOM optimization for blessed-contrib components
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';
import { createHash } from 'crypto';

/**
 * Configuration for render optimization
 */
export interface RenderOptimizerConfig {
  /** Minimum interval between renders in milliseconds */
  minRenderInterval: number;
  /** Maximum interval between renders in milliseconds */
  maxRenderInterval: number;
  /** Enable incremental rendering */
  enableIncrementalRendering: boolean;
  /** Enable render batching */
  enableRenderBatching: boolean;
  /** Batch window in milliseconds */
  batchWindow: number;
  /** Enable virtual DOM diffing */
  enableVirtualDom: boolean;
  /** Frame rate target (FPS) */
  targetFrameRate: number;
  /** Enable render profiling */
  enableProfiling: boolean;
  /** Maximum pending render requests */
  maxPendingRenders: number;
}

/**
 * Component render state
 */
export interface ComponentRenderState {
  /** Component ID */
  componentId: string;
  /** Component type */
  componentType: string;
  /** Last render timestamp */
  lastRenderTime: number;
  /** Current content hash */
  contentHash: string;
  /** Render count */
  renderCount: number;
  /** Average render time */
  averageRenderTime: number;
  /** Is dirty (needs re-render) */
  isDirty: boolean;
  /** Render priority */
  priority: 'low' | 'medium' | 'high';
  /** Visible in viewport */
  isVisible: boolean;
  /** Component dimensions */
  dimensions?: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
}

/**
 * Virtual DOM node representation
 */
export interface VirtualNode {
  /** Node type */
  type: string;
  /** Node properties */
  props: Record<string, any>;
  /** Child nodes */
  children: VirtualNode[];
  /** Node key for reconciliation */
  key?: string;
  /** Content hash for comparison */
  hash: string;
}

/**
 * Render operation
 */
interface RenderOperation {
  /** Component ID */
  componentId: string;
  /** Operation type */
  type: 'full' | 'partial' | 'props' | 'content';
  /** Operation priority */
  priority: 'low' | 'medium' | 'high';
  /** Render function */
  renderFn: () => Promise<void> | void;
  /** Timestamp when operation was queued */
  queuedAt: number;
  /** Force render even if not dirty */
  force?: boolean;
}

/**
 * Render performance metrics
 */
export interface RenderMetrics {
  /** Total renders performed */
  totalRenders: number;
  /** Average render time */
  averageRenderTime: number;
  /** Frames per second */
  currentFps: number;
  /** Skipped renders due to optimization */
  skippedRenders: number;
  /** Batched renders */
  batchedRenders: number;
  /** Incremental renders */
  incrementalRenders: number;
  /** Memory usage for virtual DOM */
  virtualDomMemory: number;
  /** Active components */
  activeComponents: number;
  /** Dirty components */
  dirtyComponents: number;
}

/**
 * Render optimizer for terminal UI components
 */
export class RenderOptimizer extends EventEmitter {
  private config: RenderOptimizerConfig;
  private componentStates: Map<string, ComponentRenderState> = new Map();
  private virtualNodes: Map<string, VirtualNode> = new Map();
  private pendingOperations: Map<string, RenderOperation> = new Map();
  private batchTimer?: NodeJS.Timeout;
  private renderTimer?: NodeJS.Timeout;
  private lastFrameTime = 0;
  private frameCount = 0;
  private isRunning = false;
  private metrics: RenderMetrics;

  constructor(config: Partial<RenderOptimizerConfig> = {}) {
    super();
    
    this.config = {
      minRenderInterval: 16, // ~60 FPS
      maxRenderInterval: 1000, // 1 second max
      enableIncrementalRendering: true,
      enableRenderBatching: true,
      batchWindow: 16, // One frame at 60fps
      enableVirtualDom: true,
      targetFrameRate: 60,
      enableProfiling: true,
      maxPendingRenders: 100,
      ...config,
    };

    this.metrics = {
      totalRenders: 0,
      averageRenderTime: 0,
      currentFps: 0,
      skippedRenders: 0,
      batchedRenders: 0,
      incrementalRenders: 0,
      virtualDomMemory: 0,
      activeComponents: 0,
      dirtyComponents: 0,
    };

    this.setupRenderLoop();
  }

  /**
   * Start the render optimizer
   */
  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    
    this.emit('optimizerStarted', {
      timestamp: Date.now(),
      config: this.config,
    });
  }

  /**
   * Stop the render optimizer
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined as any;
    }

    if (this.renderTimer) {
      clearInterval(this.renderTimer);
      this.renderTimer = undefined as any;
    }

    this.emit('optimizerStopped', {
      timestamp: Date.now(),
      metrics: this.getMetrics(),
    });
  }

  /**
   * Register a component for optimization
   */
  public registerComponent(
    componentId: string,
    componentType: string,
    options: {
      priority?: 'low' | 'medium' | 'high';
      dimensions?: ComponentRenderState['dimensions'];
      isVisible?: boolean;
    } = {}
  ): void {
    const state: ComponentRenderState = {
      componentId,
      componentType,
      lastRenderTime: 0,
      contentHash: '',
      renderCount: 0,
      averageRenderTime: 0,
      isDirty: true,
      priority: options.priority || 'medium',
      isVisible: options.isVisible !== false,
      dimensions: options.dimensions || { width: 0, height: 0, x: 0, y: 0 },
    };

    this.componentStates.set(componentId, state);
    this.updateActiveComponentsCount();

    this.emit('componentRegistered', {
      componentId,
      componentType,
      state,
      timestamp: Date.now(),
    });
  }

  /**
   * Unregister a component
   */
  public unregisterComponent(componentId: string): void {
    this.componentStates.delete(componentId);
    this.virtualNodes.delete(componentId);
    this.pendingOperations.delete(componentId);
    this.updateActiveComponentsCount();

    this.emit('componentUnregistered', {
      componentId,
      timestamp: Date.now(),
    });
  }

  /**
   * Mark a component as dirty and needing re-render
   */
  public markDirty(componentId: string, force = false): void {
    const state = this.componentStates.get(componentId);
    if (!state) {
      return;
    }

    state.isDirty = true;
    this.updateDirtyComponentsCount();

    this.emit('componentMarkedDirty', {
      componentId,
      force,
      timestamp: Date.now(),
    });

    if (force || this.shouldRenderImmediately(state)) {
      this.scheduleRender(componentId, 'high');
    }
  }

  /**
   * Schedule a render operation
   */
  public scheduleRender(
    componentId: string,
    priority: 'low' | 'medium' | 'high' = 'medium',
    renderFn?: () => Promise<void> | void,
    force = false
  ): void {
    if (!this.isRunning) {
      return;
    }

    const state = this.componentStates.get(componentId);
    if (!state && !force) {
      return;
    }

    // Check if we have too many pending renders
    if (this.pendingOperations.size >= this.config.maxPendingRenders) {
      this.emit('renderQueueFull', {
        componentId,
        queueSize: this.pendingOperations.size,
        timestamp: Date.now(),
      });
      return;
    }

    const operation: RenderOperation = {
      componentId,
      type: 'full',
      priority,
      renderFn: renderFn || (() => this.performDefaultRender(componentId)),
      queuedAt: Date.now(),
      force,
    };

    // Replace existing operation if higher priority
    const existing = this.pendingOperations.get(componentId);
    if (!existing || this.getPriorityValue(priority) > this.getPriorityValue(existing.priority)) {
      this.pendingOperations.set(componentId, operation);
    }

    if (this.config.enableRenderBatching) {
      this.scheduleBatchRender();
    } else {
      this.processRenderOperation(operation);
    }
  }

  /**
   * Update component content and check if render is needed
   */
  public updateContent(componentId: string, content: any): boolean {
    const state = this.componentStates.get(componentId);
    if (!state) {
      return false;
    }

    const newHash = this.generateContentHash(content);
    
    if (newHash !== state.contentHash) {
      state.contentHash = newHash;
      state.isDirty = true;
      this.updateDirtyComponentsCount();

      if (this.config.enableVirtualDom) {
        this.updateVirtualNode(componentId, content);
      }

      this.emit('contentUpdated', {
        componentId,
        contentHash: newHash,
        timestamp: Date.now(),
      });

      return true;
    }

    return false;
  }

  /**
   * Update component visibility
   */
  public updateVisibility(componentId: string, isVisible: boolean): void {
    const state = this.componentStates.get(componentId);
    if (!state) {
      return;
    }

    if (state.isVisible !== isVisible) {
      state.isVisible = isVisible;
      
      if (isVisible && state.isDirty) {
        this.scheduleRender(componentId, 'medium');
      }

      this.emit('visibilityChanged', {
        componentId,
        isVisible,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Update component dimensions
   */
  public updateDimensions(
    componentId: string,
    dimensions: ComponentRenderState['dimensions']
  ): void {
    const state = this.componentStates.get(componentId);
    if (!state) {
      return;
    }

    if (dimensions) {
      state.dimensions = dimensions;
    }
    state.isDirty = true;
    this.updateDirtyComponentsCount();

    this.emit('dimensionsChanged', {
      componentId,
      dimensions,
      timestamp: Date.now(),
    });
  }

  /**
   * Get render metrics
   */
  public getMetrics(): RenderMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Get component render states
   */
  public getComponentStates(): Map<string, ComponentRenderState> {
    return new Map(this.componentStates);
  }

  /**
   * Force render all dirty components
   */
  public async flushRenders(): Promise<void> {
    const dirtyComponents = Array.from(this.componentStates.entries())
      .filter(([_, state]) => state.isDirty)
      .map(([componentId]) => componentId);

    const renderPromises = dirtyComponents.map(componentId => 
      this.performDefaultRender(componentId)
    );

    await Promise.all(renderPromises);
    
    this.emit('rendersFlused', {
      componentCount: dirtyComponents.length,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all pending renders
   */
  public clearPendingRenders(): void {
    this.pendingOperations.clear();
    
    this.emit('pendingRendersCleared', {
      timestamp: Date.now(),
    });
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<RenderOptimizerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    this.emit('configUpdated', {
      config: this.config,
      timestamp: Date.now(),
    });
  }

  /**
   * Generate content hash for comparison
   */
  private generateContentHash(content: any): string {
    const serialized = JSON.stringify(content);
    return createHash('md5').update(serialized).digest('hex');
  }

  /**
   * Check if component should render immediately
   */
  private shouldRenderImmediately(state: ComponentRenderState): boolean {
    const now = Date.now();
    const timeSinceLastRender = now - state.lastRenderTime;
    
    return (
      state.priority === 'high' ||
      timeSinceLastRender > this.config.maxRenderInterval ||
      !state.isVisible
    );
  }

  /**
   * Get numeric priority value
   */
  private getPriorityValue(priority: 'low' | 'medium' | 'high'): number {
    switch (priority) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      default: return 2;
    }
  }

  /**
   * Schedule batch render processing
   */
  private scheduleBatchRender(): void {
    if (this.batchTimer) {
      return;
    }

    this.batchTimer = setTimeout(() => {
      this.processBatchRenders();
      this.batchTimer = undefined as any;
    }, this.config.batchWindow);
  }

  /**
   * Process batch renders
   */
  private async processBatchRenders(): Promise<void> {
    if (this.pendingOperations.size === 0) {
      return;
    }

    const operations = Array.from(this.pendingOperations.values())
      .sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));

    this.pendingOperations.clear();

    const batchStartTime = performance.now();
    
    this.emit('batchRenderStarted', {
      operationCount: operations.length,
      timestamp: Date.now(),
    });

    // Process high priority operations first
    const highPriorityOps = operations.filter(op => op.priority === 'high');
    const otherOps = operations.filter(op => op.priority !== 'high');

    // Execute high priority operations immediately
    for (const operation of highPriorityOps) {
      await this.processRenderOperation(operation);
    }

    // Batch process other operations
    if (otherOps.length > 0) {
      await this.processBatchOperations(otherOps);
    }

    const batchTime = performance.now() - batchStartTime;
    this.metrics.batchedRenders += operations.length;

    this.emit('batchRenderCompleted', {
      operationCount: operations.length,
      batchTime,
      timestamp: Date.now(),
    });
  }

  /**
   * Process batch operations with frame budgeting
   */
  private async processBatchOperations(operations: RenderOperation[]): Promise<void> {
    const frameTimeout = 1000 / this.config.targetFrameRate;
    let frameStartTime = performance.now();

    for (const operation of operations) {
      const now = performance.now();
      
      // Check if we're running out of frame time
      if (now - frameStartTime > frameTimeout * 0.8) {
        // Yield to event loop and start new frame
        await new Promise(resolve => setTimeout(resolve, 0));
        frameStartTime = performance.now();
      }

      await this.processRenderOperation(operation);
    }
  }

  /**
   * Process a single render operation
   */
  private async processRenderOperation(operation: RenderOperation): Promise<void> {
    const state = this.componentStates.get(operation.componentId);
    if (!state && !operation.force) {
      return;
    }

    const now = Date.now();
    const renderStartTime = performance.now();

    try {
      // Check render throttling
      if (state && !operation.force) {
        const timeSinceLastRender = now - state.lastRenderTime;
        if (timeSinceLastRender < this.config.minRenderInterval) {
          this.metrics.skippedRenders++;
          return;
        }

        // Skip render if component is not visible and not high priority
        if (!state.isVisible && state.priority !== 'high') {
          this.metrics.skippedRenders++;
          return;
        }
      }

      // Perform the render
      await operation.renderFn();

      const renderTime = performance.now() - renderStartTime;

      // Update component state
      if (state) {
        state.lastRenderTime = now;
        state.renderCount++;
        state.isDirty = false;
        
        // Update average render time
        state.averageRenderTime = (
          (state.averageRenderTime * (state.renderCount - 1)) + renderTime
        ) / state.renderCount;
      }

      // Update global metrics
      this.metrics.totalRenders++;
      this.updateAverageRenderTime(renderTime);
      this.updateDirtyComponentsCount();

      this.emit('renderCompleted', {
        componentId: operation.componentId,
        renderTime,
        operationType: operation.type,
        timestamp: now,
      });

    } catch (error) {
      this.emit('renderError', {
        componentId: operation.componentId,
        error,
        timestamp: now,
      });
    }
  }

  /**
   * Perform default render for a component
   */
  private async performDefaultRender(componentId: string): Promise<void> {
    // This would be implemented based on the actual rendering system
    // For now, we'll simulate a render operation
    
    await new Promise(resolve => setTimeout(resolve, 1 + Math.random() * 5));
    
    this.emit('defaultRenderPerformed', {
      componentId,
      timestamp: Date.now(),
    });
  }

  /**
   * Update virtual DOM node
   */
  private updateVirtualNode(componentId: string, content: any): void {
    const node: VirtualNode = {
      type: 'component',
      props: content.props || {},
      children: content.children || [],
      key: componentId,
      hash: this.generateContentHash(content),
    };

    this.virtualNodes.set(componentId, node);
    this.updateVirtualDomMemory();
  }

  /**
   * Set up render loop for FPS calculation
   */
  private setupRenderLoop(): void {
    this.renderTimer = setInterval(() => {
      if (this.isRunning) {
        this.updateFpsMetrics();
      }
    }, 1000); // Update FPS every second
  }

  /**
   * Update FPS metrics
   */
  private updateFpsMetrics(): void {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    
    if (deltaTime >= 1000) {
      this.metrics.currentFps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = now;
    } else {
      this.frameCount++;
    }
  }

  /**
   * Update average render time
   */
  private updateAverageRenderTime(renderTime: number): void {
    this.metrics.averageRenderTime = (
      (this.metrics.averageRenderTime * (this.metrics.totalRenders - 1)) + renderTime
    ) / this.metrics.totalRenders;
  }

  /**
   * Update active components count
   */
  private updateActiveComponentsCount(): void {
    this.metrics.activeComponents = this.componentStates.size;
  }

  /**
   * Update dirty components count
   */
  private updateDirtyComponentsCount(): void {
    this.metrics.dirtyComponents = Array.from(this.componentStates.values())
      .filter(state => state.isDirty).length;
  }

  /**
   * Update virtual DOM memory usage
   */
  private updateVirtualDomMemory(): void {
    // Rough estimate of virtual DOM memory usage
    this.metrics.virtualDomMemory = this.virtualNodes.size * 1024; // 1KB per node estimate
  }

  /**
   * Update all metrics
   */
  private updateMetrics(): void {
    this.updateActiveComponentsCount();
    this.updateDirtyComponentsCount();
    this.updateVirtualDomMemory();
  }
}