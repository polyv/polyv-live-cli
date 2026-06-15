/**
 * @fileoverview Scene executor (Story 8-4)
 * Executes scene configuration with rollback support
 */

import { PolyVClient } from 'polyv-live-api-sdk';
import { SceneConfig, SceneResource } from './scene-config-loader';
import { VariableResolver, ResourceOutputs } from './variable-resolver';
import { createResourceHandlers, ResourceHandlers } from './resource-handlers';

/**
 * Resource creation result
 */
export interface ResourceResult {
  /** Resource ID from config */
  id: string;
  /** Resource type */
  type: string;
  /** Output from resource creation */
  output: Record<string, any>;
  /** Status of the resource */
  status: 'created' | 'would_create' | 'failed';
}

/**
 * Execution result
 */
export interface ExecutionResult {
  /** Whether execution succeeded */
  success: boolean;
  /** Created resources */
  resources: ResourceResult[];
  /** Total execution duration in ms */
  duration?: number;
  /** Dry run mode flag */
  dryRun?: boolean;
  /** Resource timing information */
  resourceTimings?: Record<string, number>;
}

/**
 * Progress callback event
 */
export interface ProgressEvent {
  /** Current phase */
  phase: 'creating' | 'created' | 'rolling_back' | 'rolled_back';
  /** Resource ID */
  resourceId: string;
  /** Resource type */
  resourceType: string;
  /** Current index (1-based) */
  current?: number;
  /** Total resources */
  total?: number;
}

/**
 * Execution options
 */
export interface ExecutionOptions {
  /** Dry run mode - don't actually create resources */
  dryRun?: boolean;
  /** Timeout for each resource creation */
  timeout?: number;
  /** Progress callback */
  onProgress?: (event: ProgressEvent) => void;
}

/**
 * Scene executor
 * Executes scene configuration with automatic rollback on failure
 */
export class SceneExecutor {
  private readonly handlers: ResourceHandlers;
  private readonly resolver: VariableResolver;
  private progressCallback?: (event: ProgressEvent) => void;
  private lastExecution: {
    rolledBack: string[];
    failedAt?: string;
  } = { rolledBack: [] };

  constructor(_client: PolyVClient) {
    // Client is used via handlers
    this.handlers = createResourceHandlers(_client);
    this.resolver = new VariableResolver();
  }

  /**
   * Set progress callback for execution updates
   * @param callback Progress callback function
   */
  setProgressCallback(callback: (event: ProgressEvent) => void): void {
    this.progressCallback = callback;
  }

  /**
   * Get last execution details
   */
  getLastExecution(): { rolledBack: string[]; failedAt?: string } {
    return this.lastExecution;
  }

  /**
   * Execute scene configuration
   * @param config Scene configuration
   * @param options Execution options
   * @returns Execution result
   */
  async execute(config: SceneConfig, options: ExecutionOptions = {}): Promise<ExecutionResult> {
    const startTime = Date.now();
    this.lastExecution = { rolledBack: [] };

    // Get execution order
    const order = this.getExecutionOrder(config);
    const outputs: ResourceOutputs = {};
    const created: Array<{ resource: SceneResource; output: Record<string, any> }> = [];
    const results: ResourceResult[] = [];
    const timings: Record<string, number> = {};

    try {
      for (let i = 0; i < order.length; i++) {
        const resourceId = order[i];
        if (!resourceId) continue;

        const resource = config.resources.find(r => r.id === resourceId);
        if (!resource) continue;

        // Report progress
        this.reportProgress({
          phase: 'creating',
          resourceId,
          resourceType: resource.type,
          current: i + 1,
          total: order.length,
        });

        const resourceStartTime = Date.now();

        if (options.dryRun) {
          // Dry run mode - don't actually create
          results.push({
            id: resourceId,
            type: resource.type,
            output: {},
            status: 'would_create',
          });
        } else {
          // Get handler for resource type
          const handler = this.handlers[resource.type as keyof ResourceHandlers];
          if (!handler) {
            throw new Error(`Unknown resource type: ${resource.type}`);
          }

          // Resolve parameters with outputs from previous resources
          const resolvedParams = this.resolver.resolveObject(resource.params, outputs);

          // Create resource
          const output = await handler.create(resolvedParams, resource.output);

          // Store output for future references
          outputs[resourceId] = output;

          // Track created resource for potential rollback
          created.push({ resource, output });

          results.push({
            id: resourceId,
            type: resource.type,
            output,
            status: 'created',
          });

          // Track this resource
          this.trackCreatedResource(resourceId, output);
        }

        timings[resourceId] = Date.now() - resourceStartTime;

        // Report completion
        this.reportProgress({
          phase: 'created',
          resourceId,
          resourceType: resource.type,
          current: i + 1,
          total: order.length,
        });
      }

      const result: ExecutionResult = {
        success: true,
        resources: results,
        duration: Date.now() - startTime,
        resourceTimings: timings,
      };
      if (options.dryRun) {
        result.dryRun = true;
      }
      return result;
    } catch (error) {
      const failedAt = order[created.length] || 'unknown';
      this.lastExecution.failedAt = failedAt;

      // Rollback in reverse order
      for (let i = created.length - 1; i >= 0; i--) {
        const createdItem = created[i];
        if (!createdItem) continue;

        this.reportProgress({
          phase: 'rolling_back',
          resourceId: createdItem.resource.id,
          resourceType: createdItem.resource.type,
        });

        try {
          const handler = this.handlers[createdItem.resource.type as keyof ResourceHandlers];
          if (handler?.rollback) {
            await handler.rollback(createdItem.output);
          }
          this.lastExecution.rolledBack.push(createdItem.resource.id);
        } catch (rollbackError) {
          // Continue rollback even if one fails
          console.error(`Rollback failed for ${createdItem.resource.id}:`, rollbackError);
        }

        this.reportProgress({
          phase: 'rolled_back',
          resourceId: createdItem.resource.id,
          resourceType: createdItem.resource.type,
        });
      }

      // Re-throw with context
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create resource "${failedAt}": ${errorMessage}`);
    }
  }

  /**
   * Get execution order for resources (topological sort)
   * @param config Scene configuration
   * @returns Array of resource IDs in execution order
   */
  getExecutionOrder(config: SceneConfig): string[] {
    const resources = config.resources;
    const ordered: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (resource: SceneResource) => {
      if (visited.has(resource.id)) {
        return;
      }

      if (visiting.has(resource.id)) {
        throw new Error(`Circular dependency detected at resource "${resource.id}"`);
      }

      visiting.add(resource.id);

      // Visit dependencies first
      if (resource.dependsOn) {
        const deps = Array.isArray(resource.dependsOn)
          ? resource.dependsOn
          : [resource.dependsOn];

        for (const depId of deps) {
          const depResource = resources.find(r => r.id === depId);
          if (!depResource) {
            throw new Error(`Dependency "${depId}" not found for resource "${resource.id}"`);
          }
          visit(depResource);
        }
      }

      visiting.delete(resource.id);
      visited.add(resource.id);
      ordered.push(resource.id);
    };

    // Visit all resources
    for (const resource of resources) {
      visit(resource);
    }

    return ordered;
  }

  /**
   * Report progress to callback
   */
  private reportProgress(event: ProgressEvent): void {
    if (this.progressCallback) {
      this.progressCallback(event);
    }
  }

  /**
   * Track created resource for debugging
   */
  private trackCreatedResource(_id: string, _output: Record<string, any>): void {
    // Used for debugging and testing
    // Implementation details are tracked in created array
  }
}
