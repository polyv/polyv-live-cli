/**
 * @fileoverview Lottery command definitions for CLI
 * @author Development Team
 * @since 11.5.0
 */

import { Command } from 'commander';
import { LotteryHandler } from '../handlers/lottery.handler';
import { LotteryServiceConfig } from '../types/lottery';
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
 * Registers lottery-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerLotteryCommands(program: Command): void {
  const lotteryCmd = program.command('lottery');
  lotteryCmd.description('Manage live streaming lottery interactions');

  // ========================================
  // lottery create (AC #1)
  // ========================================
  const createCmd = lotteryCmd
    .command('create')
    .description('Create a lottery activity')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--name <name>', 'lottery activity name')
    .requiredOption('--type <type>', 'lottery condition type (none|invite|duration|comment|question)')
    .requiredOption('--amount <number>', 'number of winners', parseInt)
    .requiredOption('--prize-name <name>', 'prize name')
    .option('--receive-info <json>', 'receive info JSON string')
    .option('--duration <seconds>', 'duration in seconds (for invite/duration types)', parseInt)
    .option('--invite-num <number>', 'number of invites required (for invite type)', parseInt)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const lotteryHandler = new LotteryHandler(authConfig, serviceConfig);

        await lotteryHandler.createLottery({
          channelId: options.channelId,
          name: options.name,
          type: options.type,
          amount: options.amount,
          prizeName: options.prizeName,
          receiveInfo: options.receiveInfo,
          duration: options.duration,
          inviteNum: options.inviteNum,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  createCmd.addHelpText('after', `
Examples:
  # Create unconditional lottery
  $ polyv-live-cli lottery create -c "3151318" --name "New Year Lottery" --type none --amount 3 --prize-name "Gift Pack"

  # Create invite lottery
  $ polyv-live-cli lottery create -c "3151318" --name "Invite Lottery" --type invite --amount 5 --prize-name "Coupon" --duration 30 --invite-num 3

  # Create duration lottery
  $ polyv-live-cli lottery create -c "3151318" --name "Watch Duration Lottery" --type duration --amount 2 --prize-name "Member Card" --duration 10

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // lottery list (AC #2)
  // ========================================
  const listCmd = lotteryCmd
    .command('list')
    .description('List lottery activities')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--page <number>', 'page number', parseInt)
    .option('--size <number>', 'page size', parseInt)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const lotteryHandler = new LotteryHandler(authConfig, serviceConfig);

        await lotteryHandler.listLottery({
          channelId: options.channelId,
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
  # List all lottery activities
  $ polyv-live-cli lottery list -c "3151318"

  # List with pagination
  $ polyv-live-cli lottery list -c "3151318" --page 1 --size 20

  # JSON output
  $ polyv-live-cli lottery list -c "3151318" -o json

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // lottery get (AC #3)
  // ========================================
  const getCmd = lotteryCmd
    .command('get')
    .description('Get lottery activity details')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--id <id>', 'lottery activity ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const lotteryHandler = new LotteryHandler(authConfig, serviceConfig);

        await lotteryHandler.getLottery({
          channelId: options.channelId,
          id: options.id,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  getCmd.addHelpText('after', `
Examples:
  # Get lottery activity details
  $ polyv-live-cli lottery get -c "3151318" --id 20521

  # JSON output
  $ polyv-live-cli lottery get -c "3151318" --id 20521 -o json

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // lottery update (AC #4)
  // ========================================
  const updateCmd = lotteryCmd
    .command('update')
    .description('Update lottery activity')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--id <id>', 'lottery activity ID')
    .option('--name <name>', 'new lottery activity name')
    .option('--amount <number>', 'new number of winners', parseInt)
    .option('--prize-name <name>', 'new prize name')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const lotteryHandler = new LotteryHandler(authConfig, serviceConfig);

        await lotteryHandler.updateLottery({
          channelId: options.channelId,
          id: options.id,
          name: options.name,
          amount: options.amount,
          prizeName: options.prizeName,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  updateCmd.addHelpText('after', `
Examples:
  # Update lottery activity
  $ polyv-live-cli lottery update -c "3151318" --id 20521 --amount 5

  # Update with new name and prize
  $ polyv-live-cli lottery update -c "3151318" --id 20521 --name "Updated Lottery" --prize-name "New Prize"

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // lottery delete (AC #5)
  // ========================================
  const deleteCmd = lotteryCmd
    .command('delete')
    .description('Delete lottery activity')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--id <id>', 'lottery activity ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const lotteryHandler = new LotteryHandler(authConfig, serviceConfig);

        await lotteryHandler.deleteLottery({
          channelId: options.channelId,
          id: options.id,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  deleteCmd.addHelpText('after', `
Examples:
  # Delete lottery activity
  $ polyv-live-cli lottery delete -c "3151318" --id 20521

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // lottery winners (AC #6)
  // ========================================
  const winnersCmd = lotteryCmd
    .command('winners')
    .description('Get winner list for a lottery')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--lottery-id <id>', 'lottery ID')
    .option('--page <number>', 'page number', parseInt)
    .option('--limit <number>', 'items per page', parseInt)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const lotteryHandler = new LotteryHandler(authConfig, serviceConfig);

        await lotteryHandler.getWinners({
          channelId: options.channelId,
          lotteryId: options.lotteryId,
          page: options.page,
          limit: options.limit,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  winnersCmd.addHelpText('after', `
Examples:
  # Get winner list
  $ polyv-live-cli lottery winners -c "3151318" --lottery-id "fv3mao43u6"

  # Get with pagination
  $ polyv-live-cli lottery winners -c "3151318" --lottery-id "fv3mao43u6" --page 1 --limit 20

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // lottery records (AC #7)
  // ========================================
  const recordsCmd = lotteryCmd
    .command('records')
    .description('Get lottery records (legacy V3 API)')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--start-time <timestamp>', 'start time (timestamp in milliseconds)', parseInt)
    .option('--end-time <timestamp>', 'end time (timestamp in milliseconds)', parseInt)
    .option('--session-id <id>', 'session ID filter')
    .option('--page <number>', 'page number', parseInt)
    .option('--limit <number>', 'items per page', parseInt)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const lotteryHandler = new LotteryHandler(authConfig, serviceConfig);

        await lotteryHandler.getRecords({
          channelId: options.channelId,
          startTime: options.startTime,
          endTime: options.endTime,
          sessionId: options.sessionId,
          page: options.page,
          limit: options.limit,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  recordsCmd.addHelpText('after', `
Examples:
  # Get lottery records
  $ polyv-live-cli lottery records -c "3151318"

  # Get records with time range
  $ polyv-live-cli lottery records -c "3151318" --start-time 1615772426000 --end-time 1615773566000

  # Get records by session ID
  $ polyv-live-cli lottery records -c "3151318" --session-id "fwly13xczv"

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
  serviceConfig: LotteryServiceConfig;
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

  const serviceConfig: LotteryServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug,
  };

  return {
    authConfig: authResult.config,
    serviceConfig,
  };
}
