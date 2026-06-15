/**
 * @fileoverview Promotion command definitions for CLI
 * @author Development Team
 * @since 14.1.0
 */

import { Command } from 'commander';
import { PromotionHandler } from '../handlers/promotion.handler';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';
import { OutputFormat } from '../types/platform';

import {
  PromotionServiceConfig
} from '../types/promotion';

/** Default timeout in milliseconds */
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Load and prepare authentication and service configuration
 * @internal Exported for testing purposes
 */
export async function loadAuthAndServiceConfig(parentOptions: Record<string, unknown>): Promise<{
  authConfig: AuthConfig;
  serviceConfig: PromotionServiceConfig;
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
      }
    } else {
      throw error
    }
  }

  const serviceConfig: PromotionServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug,
  };

  const isVerbose = !!parentOptions['verbose']
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
 * Register promotion commands
 */
export function registerPromotionCommands(program: Command): void {
  const promotionCmd = program
    .command('promotion')
    .description('Manage marketing promotion channels (管理营销推广渠道)');

  // List command
  promotionCmd
    .command('list')
    .description('List all promotion channels (列出所有推广渠道)')
    .requiredOption('--channelId <id>', 'Channel ID (频道ID)')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(options);
        const handler = new PromotionHandler(authConfig, serviceConfig);
        await handler.listPromotions({
          channelId: options.channelId,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Create command
  promotionCmd
    .command('create')
    .description('Batch create promotion channels (批量创建推广渠道)')
    .requiredOption('--channelId <id>', 'Channel ID (频道ID)')
    .requiredOption('--names <names>', 'Comma-separated promotion channel names (推广渠道名称, 用逗分隔)')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(options);
        const handler = new PromotionHandler(authConfig, serviceConfig);
        await handler.createPromotions({
          channelId: options.channelId,
          names: options.names.split(',').map((n: string) => n.trim()).filter((n: string) => n.trim().length > 0),
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });
}
