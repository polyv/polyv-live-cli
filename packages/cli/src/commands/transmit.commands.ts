/**
 * @fileoverview Transmit command definitions for CLI
 * @author Development Team
 * @since 14.3.0
 */

import { Command } from 'commander';
import { TransmitHandler } from '../handlers/transmit.handler';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';
import { OutputFormat } from '../types/platform';
import { TransmitServiceConfig } from '../types/transmit';
import { parseStringList } from '../utils/api-command';

/** Default timeout in milliseconds */
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Load and prepare authentication and service configuration
 * @internal Exported for testing purposes
 */
export async function loadAuthAndServiceConfig(parentOptions: Record<string, unknown>): Promise<{
  authConfig: AuthConfig;
  serviceConfig: TransmitServiceConfig;
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

  const serviceConfig: TransmitServiceConfig = {
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

export function validateAssociationType(type: string): 'add' | 'cancel' {
  if (type !== 'add' && type !== 'cancel') {
    throw new Error('Association type must be add or cancel');
  }
  return type;
}

/**
 * Register transmit commands
 */
export function registerTransmitCommands(program: Command): void {
  const transmitCmd = program
    .command('transmit')
    .description('Manage transmit channels for live streaming (管理直播转播频道)');

  // Create command
  transmitCmd
    .command('create')
    .description('Batch create transmit channels (批量创建转播频道)')
    .requiredOption('--channelId <id>', 'Source channel ID (发起转播的频道号)')
    .requiredOption('--names <names>', 'Channel names comma-separated (频道名称，逗号分隔)')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(options);
        const handler = new TransmitHandler(authConfig, serviceConfig);
        await handler.batchCreateTransmitChannels({
          channelId: options.channelId,
          names: options.names,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // List command
  transmitCmd
    .command('list')
    .description('Get transmit associations (获取转播关联列表)')
    .requiredOption('--channelId <id>', 'Channel ID (频道号)')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(options);
        const handler = new TransmitHandler(authConfig, serviceConfig);
        await handler.getTransmitAssociations({
          channelId: options.channelId,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  transmitCmd
    .command('associate')
    .description('Add or cancel receive channel transmit associations (关联或取消接收转播频道)')
    .requiredOption('--channelId <id>', 'Source channel ID (发起转播的频道号)')
    .requiredOption('--receive-channel-ids <ids>', 'Receive channel IDs, comma-separated (接收频道号，逗号分隔)', parseStringList)
    .option('--type <type>', 'Operation type: add|cancel', validateAssociationType, 'add')
    .option('-f, --force', 'Skip confirmation prompt')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(options);
        const handler = new TransmitHandler(authConfig, serviceConfig);
        await handler.associationReceiveChannels({
          channelId: options.channelId,
          receiveChannelIds: options.receiveChannelIds,
          type: options.type,
          force: options.force,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });
}
