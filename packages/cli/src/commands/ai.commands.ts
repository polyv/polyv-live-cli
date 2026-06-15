/**
 * @fileoverview AI command definitions for CLI
 * @author Development Team
 * @since 14.4.0
 */

import { Command } from 'commander';
import { AIDigitalHumanHandler } from '../handlers/ai-digital-human.handler';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';
import { OutputFormat } from '../types/platform';
import { AIDigitalHumanServiceConfig } from '../types/ai-digital-human';

/** Default timeout in milliseconds */
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Load and prepare authentication and service configuration
 * @internal Exported for testing purposes
 */
export async function loadAuthAndServiceConfig(parentOptions: Record<string, unknown>): Promise<{
  authConfig: AuthConfig;
  serviceConfig: AIDigitalHumanServiceConfig;
  isVerbose: boolean;
}> {
  // Get authentication using priority system
  const authResult = authAdapter.tryGetAuthConfig(parentOptions);
  if (!authResult) {
    throw new Error(authAdapter.getStatusMessage(parentOptions));
  }

  // Load app configuration for service settings
  let configResult;
  try {
    configResult = await configManager.load({
      cliOptions: parentOptions,
    });
  } catch (error) {
    // If config loading fails, use defaults
    if (error instanceof Error && error.message.includes('Auth configuration is incomplete')) {
      configResult = {
        config: {
          baseUrl: 'https://api.polyv.net',
          timeout: DEFAULT_TIMEOUT_MS,
          debug: false,
        },
      };
    } else {
      throw error;
    }
  }

  const serviceConfig: AIDigitalHumanServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug,
  };

  const isVerbose = !!parentOptions['verbose'];
  if (isVerbose) {
    console.log('Using authentication from:', authResult.source);
  }

  return { authConfig: authResult.config, serviceConfig, isVerbose };
}

/**
 * Validates output format
 * @param format Output format to validate
 * @returns Validated format
 * @throws {Error} When format is invalid
 */
export function validateOutputFormat(format: string): OutputFormat {
  if (format !== 'table' && format !== 'json') {
    throw new Error('Invalid output format. Must be table or json');
  }
  return format;
}

/**
 * Register AI commands
 */
export function registerAiCommands(program: Command): void {
  const aiCmd = program
    .command('ai')
    .description('Manage AI features for live streaming (管理AI功能)');

  // Digital Human subcommand group
  const digitalHumanCmd = aiCmd
    .command('digital-human')
    .description('Manage AI Digital Humans (管理AI数字人)');

  // list subcommand
  digitalHumanCmd
    .command('list')
    .description('List AI Digital Humans (列出AI数字人)')
    .option('--page <number>', 'Page number (default: 1)', parseInt)
    .option('--size <number>', 'Page size (default: 10, max: 1000)', parseInt)
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(options);
        const handler = new AIDigitalHumanHandler(authConfig, serviceConfig);
        await handler.listDigitalHumans({
          page: options.page,
          size: options.size,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // list-org subcommand
  digitalHumanCmd
    .command('list-org')
    .description('List organization associations for AI Digital Humans (查询AI数字人关联的组织)')
    .requiredOption('--ids <ids>', 'AI Digital Human IDs, comma-separated (数字人ID，逗号分隔)')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(options);
        const handler = new AIDigitalHumanHandler(authConfig, serviceConfig);
        await handler.listOrganizations({
          ids: options.ids,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // set-org subcommand
  digitalHumanCmd
    .command('set-org')
    .description('Set organization associations for AI Digital Humans (设置AI数字人关联的组织)')
    .option('--config <json>', 'JSON array config (JSON数组配置)')
    .option('--aiDigitalHumanId <id>', 'AI Digital Human ID (数字人ID)')
    .option('--organizationIds <ids>', 'Organization IDs, comma-separated (组织ID，逗号分隔)')
    .option('--includeChildren', 'Include child organizations (包含子组织)', true)
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(options);
        const handler = new AIDigitalHumanHandler(authConfig, serviceConfig);
        await handler.setOrganizations({
          config: options.config,
          aiDigitalHumanId: options.aiDigitalHumanId,
          organizationIds: options.organizationIds,
          includeChildren: options.includeChildren,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });
}
