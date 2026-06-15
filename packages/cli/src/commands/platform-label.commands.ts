/**
 * @fileoverview Platform label command definitions for CLI
 * @author Development Team
 * @since 13.4.0
 */

import { Command } from 'commander';
import { PlatformLabelHandler } from '../handlers/platform-label.handler';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';
import { PlatformLabelServiceConfig } from '../types/platform-label';

/** Default timeout in milliseconds */
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Load and prepare authentication and service configuration
 * @internal Exported for testing purposes
 */
export async function loadAuthAndServiceConfig(parentOptions: Record<string, unknown>): Promise<{
  authConfig: AuthConfig;
  serviceConfig: PlatformLabelServiceConfig;
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

  const serviceConfig: PlatformLabelServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug,
  };

  const isVerbose = !!parentOptions['verbose'];
  if (isVerbose) {
    console.log(`🔐 Authentication Source: ${authResult.source}`);
    if (authResult.accountName) {
      console.log(`👤 Account: ${authResult.accountName}`);
    }
    console.log('');
  }

  return {
    authConfig: authResult.config,
    serviceConfig,
    isVerbose,
  };
}

/**
 * Validate output format
 * @param value Output format string
 * @returns Validated output format
 * @throws Error if format is invalid
 */
export function validateOutputFormat(value: string): 'table' | 'json' {
  if (!['table', 'json'].includes(value)) {
    throw new Error('Invalid output format. Must be "table" or "json"');
  }
  return value as 'table' | 'json';
}

/**
 * Registers platform label-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerPlatformLabelCommands(program: Command): void {
  // Create label command group under platform
  const platformCmd = program.commands.find((cmd) => cmd.name() === 'platform');
  if (!platformCmd) {
    throw new Error('Platform command not found. Platform label commands must be registered after platform commands.');
  }

  const labelCmd = platformCmd.command('label');
  labelCmd.description('Label management (标签管理)');

  // ========================================
  // platform label list - 获取标签列表
  // ========================================
  const listCmd = labelCmd
    .command('list')
    .description('List viewer labels (获取标签列表)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create handler instance
        const handler = new PlatformLabelHandler(authConfig, serviceConfig);

        // Execute list labels
        await handler.listLabels({
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for list command
  listCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli platform label list
  $ polyv-live-cli platform label list -o json

Output Formats:
  table  - Formatted table output (default)
  json   - JSON format for programmatic use
`);

  // ========================================
  // platform label create - 创建标签
  // ========================================
  const createCmd = labelCmd
    .command('create')
    .description('Create a viewer label (创建标签)')
    .requiredOption('--name <labelName>', 'label name (标签名称)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create handler instance
        const handler = new PlatformLabelHandler(authConfig, serviceConfig);

        // Execute create label
        await handler.createLabel({
          labelName: options.name,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for create command
  createCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli platform label create --name "VIP用户"
  $ polyv-live-cli platform label create --name "Staff" -o json
`);

  // ========================================
  // platform label update - 更新标签
  // ========================================
  const updateCmd = labelCmd
    .command('update')
    .description('Update a viewer label (更新标签)')
    .requiredOption('--id <labelId>', 'label ID (标签ID)', (value) => parseInt(value, 10))
    .requiredOption('--name <labelName>', 'label name (标签名称)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create handler instance
        const handler = new PlatformLabelHandler(authConfig, serviceConfig);

        // Execute update label
        await handler.updateLabel({
          labelId: options.id,
          labelName: options.name,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for update command
  updateCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli platform label update --id 1 --name "VIP会员"
  $ polyv-live-cli platform label update --id 2 --name "New Name" -o json
`);

  // ========================================
  // platform label delete - 删除标签
  // ========================================
  const deleteCmd = labelCmd
    .command('delete')
    .description('Delete a viewer label (删除标签)')
    .requiredOption('--id <labelId>', 'label ID (标签ID)', (value) => parseInt(value, 10))
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create handler instance
        const handler = new PlatformLabelHandler(authConfig, serviceConfig);

        // Execute delete label
        await handler.deleteLabel({
          labelId: options.id,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for delete command
  deleteCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli platform label delete --id 1
  $ polyv-live-cli platform label delete --id 2 -o json
`);
}
