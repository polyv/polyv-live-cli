/**
 * @fileoverview Checkin command definitions for CLI
 * @author Development Team
 * @since 11.3.0
 */

import { Command } from 'commander';
import { CheckinHandler } from '../handlers/checkin.handler';
import { CheckinServiceConfig } from '../types/checkin';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';

/**
 * Validate output format
 * @param value Output format string
 * @returns Validated output format
 */
export function validateOutputFormat(value: string): 'table' | 'json' {
  if (!['table', 'json'].includes(value)) {
    throw new Error('Output format must be either "table" or "json"');
  }
  return value as 'table' | 'json';
}

/**
 * Registers checkin-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerCheckinCommands(program: Command): void {
  const checkinCmd = program.command('checkin');
  checkinCmd.description('Manage live streaming checkin interactions');

  // ========================================
  // checkin start (AC #1)
  // ========================================
  const startCmd = checkinCmd
    .command('start')
    .description('Start a checkin session in the channel')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--limit-time <seconds>', 'checkin duration in seconds (0-86400, 0 = immediate)', parseInt)
    .option('--delay-time <timestamp>', 'scheduled start time (13-digit timestamp)', parseInt)
    .option('--message <text>', 'checkin message/prompt')
    .option('--force', 'force checkin mode')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const checkinHandler = new CheckinHandler(authConfig, serviceConfig);

        await checkinHandler.startCheckin({
          channelId: options.channelId,
          limitTime: options.limitTime,
          delayTime: options.delayTime,
          message: options.message,
          force: options.force,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  startCmd.addHelpText('after', `
Examples:
  # Start immediate checkin
  $ polyv-live-cli checkin start -c "3151318"

  # Start checkin with 30-second limit
  $ polyv-live-cli checkin start -c "3151318" --limit-time 30

  # Start scheduled checkin
  $ polyv-live-cli checkin start -c "3151318" --limit-time 60 --delay-time 1700734800000

  # Start checkin with custom message
  $ polyv-live-cli checkin start -c "3151318" --message "Please check in"

  # Force checkin mode
  $ polyv-live-cli checkin start -c "3151318" --force

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // checkin list (AC #2)
  // ========================================
  const listCmd = checkinCmd
    .command('list')
    .description('List checkin records (checked-in users only)')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--page <number>', 'page number', parseInt)
    .option('--size <number>', 'page size', parseInt)
    .option('--date <date>', 'filter by date (yyyy-MM-dd)')
    .option('--session-id <id>', 'filter by session ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const checkinHandler = new CheckinHandler(authConfig, serviceConfig);

        await checkinHandler.listCheckins({
          channelId: options.channelId,
          page: options.page,
          size: options.size,
          date: options.date,
          sessionId: options.sessionId,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  listCmd.addHelpText('after', `
Examples:
  # List all checkin records
  $ polyv-live-cli checkin list -c "3151318"

  # List with pagination
  $ polyv-live-cli checkin list -c "3151318" --page 1 --size 20

  # Filter by date
  $ polyv-live-cli checkin list -c "3151318" --date "2024-01-15"

  # Filter by session ID
  $ polyv-live-cli checkin list -c "3151318" --session-id "fwly13xczv"

  # JSON output
  $ polyv-live-cli checkin list -c "3151318" -o json

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // checkin result (AC #3)
  // ========================================
  const resultCmd = checkinCmd
    .command('result')
    .description('Get checkin result details (including checked and unchecked users)')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--checkin-id <id>', 'checkin ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const checkinHandler = new CheckinHandler(authConfig, serviceConfig);

        await checkinHandler.getCheckinResult({
          channelId: options.channelId,
          checkinId: options.checkinId,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  resultCmd.addHelpText('after', `
Examples:
  # Get checkin result
  $ polyv-live-cli checkin result -c "3151318" --checkin-id "db14ef80-81b8-11eb-b114-e7477b"

  # JSON output
  $ polyv-live-cli checkin result -c "3151318" --checkin-id "db14ef80-81b8-11eb-b114-e7477b" -o json

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // checkin sessions (AC #4)
  // ========================================
  const sessionsCmd = checkinCmd
    .command('sessions')
    .description('List checkin sessions by time range')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--start-date <date>', 'start date (yyyy-MM-dd, default: 7 days ago)')
    .option('--end-date <date>', 'end date (yyyy-MM-dd, default: today)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const checkinHandler = new CheckinHandler(authConfig, serviceConfig);

        await checkinHandler.listSessions({
          channelId: options.channelId,
          startDate: options.startDate,
          endDate: options.endDate,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  sessionsCmd.addHelpText('after', `
Examples:
  # List checkin sessions for date range
  $ polyv-live-cli checkin sessions -c "3151318" --start-date "2024-01-01" --end-date "2024-01-31"

  # List with default date range (last 7 days)
  $ polyv-live-cli checkin sessions -c "3151318"

  # JSON output
  $ polyv-live-cli checkin sessions -c "3151318" --start-date "2024-01-01" --end-date "2024-01-31" -o json

Note:
  Date range cannot exceed 30 days.

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
  serviceConfig: CheckinServiceConfig;
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

  const serviceConfig: CheckinServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug,
  };

  return {
    authConfig: authResult.config,
    serviceConfig,
  };
}
