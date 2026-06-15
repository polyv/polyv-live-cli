/**
 * @fileoverview Donate command definitions for CLI
 * @author Development Team
 * @since 11.6.0
 */

import { Command } from 'commander';
import { DonateHandler } from '../handlers/donate.handler';
import { DonateServiceConfig } from '../types/donate';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';
import { OutputFormat } from '../handlers/base.handler';

/**
 * Validate output format
 * @param value Output format string
 * @returns Validated output format
 */
export function validateOutputFormat(value: string): OutputFormat {
  if (!['table', 'json'].includes(value)) {
    throw new Error('Output format must be either "table" or "json"');
  }
  return value as OutputFormat;
}

/**
 * Registers donate-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerDonateCommands(program: Command): void {
  const donateCmd = program.command('donate');
  donateCmd.description('Manage live streaming donate interactions');

  // ========================================
  // donate config (subcommand group)
  // ========================================
  const configCmd = donateCmd.command('config');
  configCmd.description('Manage donate configuration');

  // ========================================
  // donate config get (AC #1)
  // ========================================
  const getCmd = configCmd
    .command('get')
    .description('Get donate configuration')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const donateHandler = new DonateHandler(authConfig, serviceConfig);

        await donateHandler.getConfig({
          channelId: options.channelId,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  getCmd.addHelpText('after', `
Examples:
  # Get donate configuration
  $ polyv-live-cli donate config get -c "3151318"

  # JSON output
  $ polyv-live-cli donate config get -c "3151318" -o json

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // donate config update (AC #2)
  // ========================================
  const updateCmd = configCmd
    .command('update')
    .description('Update donate configuration')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--cash-enabled <Y|N>', 'enable cash donate (Y/N)')
    .option('--gift-enabled <Y|N>', 'enable gift donate (Y/N)')
    .option('--tips <text>', 'donate tips text')
    .option('--amounts <values>', 'donate amounts (comma-separated, e.g., "0.88,6.66,8.88")')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const donateHandler = new DonateHandler(authConfig, serviceConfig);

        await donateHandler.updateConfig({
          channelId: options.channelId,
          cashEnabled: options.cashEnabled,
          giftEnabled: options.giftEnabled,
          tips: options.tips,
          amounts: options.amounts,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  updateCmd.addHelpText('after', `
Examples:
  # Enable cash donate
  $ polyv-live-cli donate config update -c "3151318" --cash-enabled Y

  # Update with tips and amounts
  $ polyv-live-cli donate config update -c "3151318" --tips "Thank you for your support!" --amounts "0.88,6.66,8.88,18.88"

  # Update all settings
  $ polyv-live-cli donate config update -c "3151318" --cash-enabled Y --gift-enabled Y --tips "Thanks!" --amounts "1,5,10"

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // donate list (AC #3)
  // ========================================
  const listCmd = donateCmd
    .command('list')
    .description('List donate records')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--start <timestamp>', 'start time (timestamp in milliseconds)', parseInt)
    .requiredOption('--end <timestamp>', 'end time (timestamp in milliseconds)', parseInt)
    .option('--page <number>', 'page number', parseInt)
    .option('--size <number>', 'page size', parseInt)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const donateHandler = new DonateHandler(authConfig, serviceConfig);

        await donateHandler.listRecords({
          channelId: options.channelId,
          start: options.start,
          end: options.end,
          page: options.page,
          size: options.size,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  listCmd.addHelpText('after', `
Examples:
  # List donate records with time range
  $ polyv-live-cli donate list -c "3151318" --start 1615772426000 --end 1615858826000

  # List with pagination
  $ polyv-live-cli donate list -c "3151318" --start 1615772426000 --end 1615858826000 --page 2 --size 20

  # JSON output
  $ polyv-live-cli donate list -c "3151318" --start 1615772426000 --end 1615858826000 -o json

Note:
  --start and --end require 13-digit millisecond timestamps (e.g., 1615772426000)

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);
}

// ========================================
// Common helper
// ========================================
async function loadAuthAndServiceConfig(parentOptions: any): Promise<{
  authConfig: AuthConfig;
  serviceConfig: DonateServiceConfig;
}> {
  const authResult = authAdapter.tryGetAuthConfig(parentOptions);
  if (!authResult) {
    throw new Error(authAdapter.getStatusMessage(parentOptions));
  }

  // Load app configuration for service settings (try-catch to handle missing auth in old config)
  let configResult;
  try {
    configResult = await configManager.load({
      cliOptions: parentOptions,
    });
  } catch (error) {
    // If config loading fails due to auth, use defaults for service config
    if (error instanceof Error && error.message.includes('Auth configuration is incomplete')) {
      configResult = {
        config: {
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false
        }
      };
    } else {
      throw error;
    }
  }

  const serviceConfig: DonateServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug,
  };

  return {
    authConfig: authResult.config,
    serviceConfig,
  };
}
