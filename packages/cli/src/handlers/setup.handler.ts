/**
 * @fileoverview Setup handler for scene initialization (Story 8-4)
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { createSdkClient } from '../sdk';
import { AuthConfig } from '../types/auth';
import { SceneConfigLoader, SceneInfo } from '../setup/scene-config-loader';
import { SceneExecutor, ExecutionResult, ProgressEvent } from '../setup/scene-executor';
import { OutputRenderer } from '../setup/output-renderer';

/**
 * Setup command options
 */
export interface SetupOptions {
  /** Scene name to setup */
  scene: string;
  /** Output format */
  output?: OutputFormat | undefined;
  /** Dry run mode */
  dryRun?: boolean | undefined;
  /** Progress callback */
  onProgress?: ((event: ProgressEvent) => void) | undefined;
}

/**
 * Setup list options
 */
export interface SetupListOptions {
  /** Output format */
  output?: OutputFormat | undefined;
  /** Show detailed info */
  detailed?: boolean | undefined;
}

/**
 * Service configuration
 */
export interface SetupServiceConfig {
  /** API base URL */
  baseUrl: string;
  /** Request timeout */
  timeout?: number;
  /** Debug mode */
  debug?: boolean;
}

/**
 * Handler for setup commands
 */
export class SetupHandler extends BaseHandler {
  private readonly authConfig: AuthConfig;
  private readonly serviceConfig: SetupServiceConfig;
  private readonly loader: SceneConfigLoader;
  private readonly renderer: OutputRenderer;

  constructor(authConfig: AuthConfig, serviceConfig: SetupServiceConfig) {
    super();
    this.authConfig = authConfig;
    this.serviceConfig = serviceConfig;
    this.loader = new SceneConfigLoader();
    this.renderer = new OutputRenderer();
  }

  /**
   * Setup a scene
   * @param options Setup options
   */
  async setup(options: SetupOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate options
      if (!options.scene || options.scene.trim() === '') {
        throw new Error('Scene name is required');
      }

      if (options.output && !['table', 'json'].includes(options.output)) {
        throw new Error('Output format must be "table" or "json"');
      }

      // Load scene configuration
      const config = await this.loader.loadScene(options.scene);

      // Create SDK client
      const client = createSdkClient(this.authConfig, this.serviceConfig.baseUrl);

      // Create executor
      const executor = new SceneExecutor(client);

      // Set progress callback
      if (options.onProgress) {
        executor.setProgressCallback(options.onProgress);
      }

      // Execute scene
      const execOptions: { dryRun: boolean; onProgress?: (event: ProgressEvent) => void } = {
        dryRun: options.dryRun ?? false,
      };
      if (options.onProgress) {
        execOptions.onProgress = options.onProgress;
      }
      const result = await executor.execute(config, execOptions);

      // Build outputs for rendering
      const outputs = this.buildOutputs(result);

      // Display results
      if (options.output === 'json') {
        // JSON output - always just output the result object
        console.log(JSON.stringify({
          success: result.success,
          scene: config.name,
          resources: result.resources,
          duration: result.duration,
          dryRun: result.dryRun,
        }, null, 2));
      } else if (options.dryRun) {
        console.log(this.renderer.renderDryRunOutput(config, result.resources));
      } else {
        // Render summary
        const renderOpts: { format?: OutputFormat; duration?: number } = {};
        if (options.output) {
          renderOpts.format = options.output as OutputFormat;
        }
        if (result.duration !== undefined && result.duration !== null) {
          renderOpts.duration = result.duration;
        }
        const summary = this.renderer.renderSummary(config, result.resources, renderOpts);
        console.log(summary);

        // Render next steps if available
        if (config.nextSteps && config.nextSteps.length > 0) {
          const nextSteps = this.renderer.renderNextSteps(config.nextSteps, outputs);
          console.log(nextSteps);
        }
      }
    }, 'setup');
  }

  /**
   * List available scenes
   * @param options List options
   */
  async listScenes(options: SetupListOptions = {}): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const scenes = this.loader.listAllScenes();

      if (options.output === 'json') {
        const result: {
          builtin: SceneInfo[];
          user: SceneInfo[];
        } = {
          builtin: scenes.builtin.map(name => this.loader.getSceneInfo(name)),
          user: scenes.user.map(name => this.loader.getSceneInfo(name)),
        };
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      // Table output
      if (scenes.builtin.length === 0 && scenes.user.length === 0) {
        console.log('No scenes available.');
        console.log('');
        console.log('Built-in scenes are provided in the setup-scenes directory.');
        console.log('You can also create custom scenes in ~/.polyv/scenes/');
        return;
      }

      console.log('\n📋 Available Scenes:\n');

      if (scenes.builtin.length > 0) {
        console.log('Built-in scenes:');
        for (const name of scenes.builtin) {
          const info = this.loader.getSceneInfo(name);
          const icon = info.icon || '📦';
          const desc = info.description || '';
          console.log(`  ${icon} ${name} - ${desc}`);
        }
        console.log('');
      }

      if (scenes.user.length > 0) {
        console.log('Custom scenes (~/.polyv/scenes/):');
        for (const name of scenes.user) {
          const info = this.loader.getSceneInfo(name);
          const icon = info.icon || '🔧';
          const desc = info.description || '';
          console.log(`  ${icon} ${name} - ${desc}`);
        }
        console.log('');
      }

      console.log('Usage:');
      console.log('  polyv-live-cli setup <scene-name>');
      console.log('');
      console.log('Example:');
      console.log('  polyv-live-cli setup e-commerce');
    }, 'setup.list');
  }

  /**
   * List scenes with detailed information
   * @param options List options
   */
  async listScenesDetailed(options: SetupListOptions = {}): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const scenes = this.loader.listAllScenes();

      if (options.output === 'json') {
        const result: {
          builtin: SceneInfo[];
          user: SceneInfo[];
        } = {
          builtin: scenes.builtin.map(name => this.loader.getSceneInfo(name)),
          user: scenes.user.map(name => this.loader.getSceneInfo(name)),
        };
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log('\n📋 Available Scenes (Detailed):\n');

      const allScenes = [
        ...scenes.builtin.map(name => ({ name, type: 'builtin' as const })),
        ...scenes.user.map(name => ({ name, type: 'user' as const })),
      ];

      for (const { name, type } of allScenes) {
        const info = this.loader.getSceneInfo(name);
        const icon = info.icon || (type === 'builtin' ? '📦' : '🔧');
        const typeLabel = type === 'builtin' ? 'Built-in' : 'Custom';

        console.log(`${icon} ${name} (${typeLabel})`);
        if (info.description) {
          console.log(`   Description: ${info.description}`);
        }
        if (info.category) {
          console.log(`   Category: ${info.category}`);
        }
        if (info.resources !== undefined) {
          console.log(`   Resources: ${info.resources}`);
        }
        if (info.tags && info.tags.length > 0) {
          console.log(`   Tags: ${info.tags.join(', ')}`);
        }
        console.log('');
      }
    }, 'setup.listDetailed');
  }

  /**
   * Build outputs object from execution result
   */
  private buildOutputs(result: ExecutionResult): Record<string, Record<string, any>> {
    const outputs: Record<string, Record<string, any>> = {};

    for (const resource of result.resources) {
      outputs[resource.id] = resource.output;
    }

    return outputs;
  }
}
