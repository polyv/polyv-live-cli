/**
 * @fileoverview Output renderer for scene execution (Story 8-4)
 * Formats and displays execution results
 */

import { SceneConfig } from './scene-config-loader';
import { ResourceResult } from './scene-executor';
import { VariableResolver, ResourceOutputs } from './variable-resolver';

/**
 * Output format options
 */
export type OutputFormat = 'table' | 'json';

/**
 * Render options
 */
export interface RenderOptions {
  /** Output format */
  format?: OutputFormat | undefined;
  /** Execution duration in ms */
  duration?: number | undefined;
}

/**
 * Error render context
 */
export interface ErrorContext {
  /** Resources that were rolled back */
  rolledBack?: string[];
  /** Resource that failed */
  failedAt?: string;
  /** Suggestion for fixing the error */
  suggestion?: string;
}

/**
 * Output renderer for scene execution results
 */
export class OutputRenderer {
  private readonly resolver: VariableResolver;

  /** Spinner frames */
  private readonly spinnerFrames: string[] = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private spinnerIndex = 0;

  constructor() {
    this.resolver = new VariableResolver();
  }

  /**
   * Render execution summary
   * @param config Scene configuration
   * @param resources Resource results
   * @param options Render options
   * @returns Formatted summary string
   */
  renderSummary(
    config: SceneConfig,
    resources: ResourceResult[],
    options: RenderOptions = {}
  ): string {
    if (options.format === 'json') {
      return this.renderSummaryJson(config, resources, options);
    }

    return this.renderSummaryTable(config, resources, options);
  }

  /**
   * Render next steps guidance
   * @param nextSteps Next steps configuration
   * @param outputs Resource outputs for variable resolution
   * @returns Formatted next steps string
   */
  renderNextSteps(
    nextSteps: Array<{ command: string; description: string }>,
    outputs: ResourceOutputs
  ): string {
    if (!nextSteps || nextSteps.length === 0) {
      return 'No next steps available.';
    }

    const lines: string[] = ['\n📋 Next Steps:', ''];

    nextSteps.forEach((step, index) => {
      try {
        const resolvedCommand = this.resolver.renderTemplate(step.command, outputs);
        lines.push(`${index + 1}. ${step.description}`);
        lines.push(`   $ ${resolvedCommand}`);
        lines.push('');
      } catch (error) {
        // If resolution fails, show the error
        const errorMsg = error instanceof Error ? error.message : String(error);
        lines.push(`${index + 1}. ${step.description} (error: ${errorMsg})`);
        lines.push('');
      }
    });

    return lines.join('\n');
  }

  /**
   * Render progress indicator
   * @param event Progress event
   * @returns Formatted progress string
   */
  renderProgress(event: {
    phase: 'creating' | 'created' | 'rolling_back' | 'rolled_back';
    resourceId: string;
    resourceType: string;
    showSpinner?: boolean;
    current?: number;
    total?: number;
  }): string {
    const { phase, resourceId, resourceType, showSpinner, current, total } = event;

    let icon = '';
    let action = '';

    switch (phase) {
      case 'creating':
        icon = showSpinner ? this.getNextSpinnerFrame() : '⏳';
        action = 'Creating';
        break;
      case 'created':
        icon = '✅';
        action = 'Created';
        break;
      case 'rolling_back':
        icon = '↩️';
        action = 'Rolling back';
        break;
      case 'rolled_back':
        icon = '🔙';
        action = 'Rolled back';
        break;
    }

    let progress = '';
    if (current !== undefined && total !== undefined) {
      progress = ` (${current}/${total})`;
    }

    return `${icon} ${action} ${resourceType}: ${resourceId}${progress}`;
  }

  /**
   * Render error with context
   * @param error The error that occurred
   * @param context Error context
   * @param options Render options
   * @returns Formatted error string
   */
  renderError(
    error: Error,
    context: ErrorContext = {},
    options: RenderOptions = {}
  ): string {
    if (options.format === 'json') {
      return JSON.stringify({
        success: false,
        error: error.message,
        ...context,
      }, null, 2);
    }

    const lines: string[] = ['\n❌ Error:', '', error.message];

    if (context.failedAt) {
      lines.push(``);
      lines.push(`Failed at: ${context.failedAt}`);
    }

    if (context.rolledBack && context.rolledBack.length > 0) {
      lines.push('');
      lines.push('Rolled back resources:');
      context.rolledBack.forEach(id => {
        lines.push(`  - ${id}`);
      });
    }

    if (context.suggestion) {
      lines.push('');
      lines.push(`💡 Suggestion: ${context.suggestion}`);
    }

    return lines.join('\n');
  }

  /**
   * Render template with resource outputs
   * @param template Template string
   * @param outputs Resource outputs
   * @returns Rendered template
   */
  renderTemplate(template: string, outputs: ResourceOutputs): string {
    return this.resolver.renderTemplate(template, outputs);
  }

  /**
   * Render dry run output
   * @param config Scene configuration
   * @param resources Resource results (with would_create status)
   * @returns Formatted dry run output
   */
  renderDryRunOutput(config: SceneConfig, resources: ResourceResult[]): string {
    const lines: string[] = [
      '\n🔍 Dry Run - No resources will be created',
      '',
      `Scene: ${config.name}`,
      `Description: ${config.description || 'N/A'}`,
      '',
      `Resources to be created: ${resources.length}`,
      '',
    ];

    // Show execution order
    lines.push('Execution order:');
    resources.forEach((resource, index) => {
      lines.push(`  ${index + 1}. ${resource.type}: ${resource.id}`);
    });

    return lines.join('\n');
  }

  /**
   * Render summary as table format
   */
  private renderSummaryTable(
    config: SceneConfig,
    resources: ResourceResult[],
    options: RenderOptions
  ): string {
    const icon = config.metadata?.icon || '📦';
    const lines: string[] = [
      `\n${icon} Scene "${config.name}" configured successfully!`,
      '',
    ];

    // Resource outputs
    lines.push('Created resources:');
    lines.push('');

    resources.forEach(resource => {
      lines.push(`  ${resource.type}: ${resource.id}`);
      for (const [key, value] of Object.entries(resource.output)) {
        lines.push(`    - ${key}: ${value}`);
      }
      lines.push('');
    });

    // Duration
    if (options.duration !== undefined) {
      const seconds = (options.duration / 1000).toFixed(2);
      lines.push(`Duration: ${seconds}s`);
    }

    return lines.join('\n');
  }

  /**
   * Render summary as JSON format
   */
  private renderSummaryJson(
    config: SceneConfig,
    resources: ResourceResult[],
    options: RenderOptions
  ): string {
    return JSON.stringify({
      success: true,
      scene: config.name,
      resources: resources.map(r => ({
        id: r.id,
        type: r.type,
        output: r.output,
        status: r.status,
      })),
      duration: options.duration,
    }, null, 2);
  }

  /**
   * Get next spinner frame
   */
  private getNextSpinnerFrame(): string {
    const frame = this.spinnerFrames[this.spinnerIndex] ?? '⠋';
    this.spinnerIndex = (this.spinnerIndex + 1) % this.spinnerFrames.length;
    return frame;
  }
}
