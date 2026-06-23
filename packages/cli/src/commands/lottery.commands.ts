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
import { parseJsonArray, parseNumberList } from '../utils/api-command';

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

export function parsePositiveInteger(value: string): number {
  const parsed = parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error('Value must be a positive integer');
  }
  return parsed;
}

export function parsePositiveNumber(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Value must be a positive number');
  }
  return parsed;
}

export function parseStringList(value: string): string[] {
  const list = value.split(',').map((item) => item.trim()).filter(Boolean);
  if (list.length === 0) {
    throw new Error('Value must contain at least one item');
  }
  return list;
}

/**
 * Registers lottery-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerLotteryCommands(program: Command): void {
  const lotteryCmd = program.command('lottery');
  lotteryCmd.description('Manage live streaming lottery interactions');

  async function withLotteryHandler(action: (handler: LotteryHandler) => Promise<void>): Promise<void> {
    try {
      const parentOptions = program.opts();
      const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
      await action(new LotteryHandler(authConfig, serviceConfig));
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  }

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
    .option('--duration <seconds>', 'duration in seconds (for conditional lottery types)', parseInt)
    .option('--invite-num <number>', 'number of invites required (for invite type)', parseInt)
    .option('--comment <text>', 'comment content required for comment type')
    .option('-f, --force', 'skip confirmation prompt')
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
          comment: options.comment,
          force: options.force,
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

  # Create comment lottery
  $ polyv-live-cli lottery create -c "3151318" --name "Comment Lottery" --type comment --amount 3 --prize-name "Gift Pack" --duration 60 --comment "参与抽奖"

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
    .option('-f, --force', 'skip confirmation prompt')
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
          force: options.force,
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
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const lotteryHandler = new LotteryHandler(authConfig, serviceConfig);

        await lotteryHandler.deleteLottery({
          channelId: options.channelId,
          id: options.id,
          force: options.force,
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
    .option('--viewer-id <id>', 'viewer ID for viewer-specific winner lookup')
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
          viewerId: options.viewerId,
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

  # Query a specific viewer winner record
  $ polyv-live-cli lottery winners -c "3151318" --lottery-id "fv3mao43u6" --viewer-id "viewer-1"

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // lottery records (AC #7)
  // ========================================
  const recordsCmd = lotteryCmd
    .command('records')
    .description('Get lottery activity records')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--start-time <timestamp>', 'start time (timestamp in milliseconds)', parseInt)
    .requiredOption('--end-time <timestamp>', 'end time (timestamp in milliseconds)', parseInt)
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
  $ polyv-live-cli lottery records -c "3151318" --start-time 1615772426000 --end-time 1615773566000

  # Get records with time range
  $ polyv-live-cli lottery records -c "3151318" --start-time 1615772426000 --end-time 1615773566000

  # Get records by session ID
  $ polyv-live-cli lottery records -c "3151318" --start-time 1615772426000 --end-time 1615773566000 --session-id "fwly13xczv"

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // lottery legacy-records
  // ========================================
  const legacyRecordsCmd = lotteryCmd
    .command('legacy-records')
    .description('Get legacy V3 lottery records for a single channel')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--start-time <timestamp>', 'start time (timestamp in milliseconds)', parsePositiveNumber)
    .requiredOption('--end-time <timestamp>', 'end time (timestamp in milliseconds)', parsePositiveNumber)
    .option('--session-id <id>', 'session ID filter')
    .option('--page <number>', 'page number', parsePositiveInteger)
    .option('--limit <number>', 'items per page', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const lotteryHandler = new LotteryHandler(authConfig, serviceConfig);

        await lotteryHandler.getLegacyRecords({
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

  legacyRecordsCmd.addHelpText('after', `
Examples:
  # Get legacy V3 lottery records for a single channel
  $ polyv-live-cli lottery legacy-records -c "3151318" --start-time 1704067200000 --end-time 1706745599000
`);

  // ========================================
  // lottery channel-records
  // ========================================
  const channelRecordsCmd = lotteryCmd
    .command('channel-records')
    .description('Get lottery records across channels')
    .requiredOption('--channel-ids <ids>', 'comma-separated channel IDs', parseStringList)
    .requiredOption('--start-time <timestamp>', 'start time (timestamp in milliseconds)', parsePositiveNumber)
    .requiredOption('--end-time <timestamp>', 'end time (timestamp in milliseconds)', parsePositiveNumber)
    .option('--session-id <id>', 'session ID filter')
    .option('--page <number>', 'page number', parsePositiveInteger)
    .option('--limit <number>', 'items per page', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const lotteryHandler = new LotteryHandler(authConfig, serviceConfig);

        await lotteryHandler.getChannelRecords({
          channelIds: options.channelIds,
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

  channelRecordsCmd.addHelpText('after', `
Examples:
  # Get lottery records across channels
  $ polyv-live-cli lottery channel-records --channel-ids "3151318,3151319" --start-time 1704067200000 --end-time 1706745599000
`);

  // ========================================
  // lottery download-winners
  // ========================================
  const downloadWinnersCmd = lotteryCmd
    .command('download-winners')
    .description('Download lottery winner details')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--lottery-id <id>', 'lottery ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const lotteryHandler = new LotteryHandler(authConfig, serviceConfig);

        await lotteryHandler.downloadWinners({
          channelId: options.channelId,
          lotteryId: options.lotteryId,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  downloadWinnersCmd.addHelpText('after', `
Examples:
  # Download winner details
  $ polyv-live-cli lottery download-winners -c "3151318" --lottery-id "fv3mao43u6" -o json
`);

  // ========================================
  // lottery receive-info
  // ========================================
  const receiveInfoCmd = lotteryCmd
    .command('receive-info')
    .description('Add winner receive information')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--lottery-id <id>', 'lottery ID')
    .requiredOption('--winner-code <code>', 'winner code')
    .requiredOption('--viewer-id <id>', 'viewer ID')
    .option('--receive-info <json>', 'receive information JSON object or array')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const lotteryHandler = new LotteryHandler(authConfig, serviceConfig);

        await lotteryHandler.addReceiveInfo({
          channelId: options.channelId,
          lotteryId: options.lotteryId,
          winnerCode: options.winnerCode,
          viewerId: options.viewerId,
          receiveInfo: options.receiveInfo,
          force: options.force,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  receiveInfoCmd.addHelpText('after', `
Examples:
  # Add winner receive information
  $ polyv-live-cli lottery receive-info -c "3151318" --lottery-id "fv3mao43u6" --viewer-id "viewer-1" --winner-code "ABC123" --receive-info '{"name":"Nick","phone":"13800000000"}' --force
`);

  const waitCmd = lotteryCmd
    .command('wait')
    .description('Manage condition lottery wait schedules');

  waitCmd
    .command('create')
    .description('Create a waiting draw schedule for a condition lottery')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--id <id>', 'lottery activity ID')
    .requiredOption('--lottery-time <timestamp>', 'lottery time (timestamp in milliseconds)', parsePositiveNumber)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withLotteryHandler((handler) => handler.createWaitLottery({
      channelId: options.channelId,
      id: options.id,
      lotteryTime: options.lotteryTime,
      force: options.force,
      output: options.output,
    })));

  const groupCmd = lotteryCmd
    .command('group')
    .description('Manage lottery viewer whitelist groups');

  groupCmd
    .command('list')
    .description('List lottery viewer whitelist groups')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--page <number>', 'page number', parsePositiveInteger)
    .option('--size <number>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withLotteryHandler((handler) => handler.listViewerGroups({
      channelId: options.channelId,
      page: options.page,
      size: options.size,
      output: options.output,
    })));

  groupCmd
    .command('create')
    .description('Create a lottery viewer whitelist group')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--title <title>', 'group title')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withLotteryHandler((handler) => handler.createViewerGroup({
      channelId: options.channelId,
      title: options.title,
      force: options.force,
      output: options.output,
    })));

  groupCmd
    .command('update')
    .description('Update a lottery viewer whitelist group')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--id <id>', 'group ID')
    .requiredOption('--title <title>', 'group title')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withLotteryHandler((handler) => handler.updateViewerGroup({
      channelId: options.channelId,
      id: options.id,
      title: options.title,
      force: options.force,
      output: options.output,
    })));

  groupCmd
    .command('delete')
    .description('Delete a lottery viewer whitelist group')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--id <id>', 'group ID')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withLotteryHandler((handler) => handler.deleteViewerGroup({
      channelId: options.channelId,
      id: options.id,
      force: options.force,
      output: options.output,
    })));

  const groupViewerCmd = lotteryCmd
    .command('group-viewer')
    .description('Manage lottery viewer whitelist group members');

  groupViewerCmd
    .command('list')
    .description('List viewers in a lottery viewer group')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--group-id <id>', 'group ID')
    .option('--page <number>', 'page number', parsePositiveInteger)
    .option('--size <number>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withLotteryHandler((handler) => handler.listGroupViewers({
      channelId: options.channelId,
      groupId: options.groupId,
      page: options.page,
      size: options.size,
      output: options.output,
    })));

  groupViewerCmd
    .command('add')
    .description('Add viewers to a lottery viewer group')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--group-id <id>', 'group ID')
    .requiredOption('--viewer-ids <ids>', 'comma-separated viewer IDs', parseStringList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withLotteryHandler((handler) => handler.createGroupViewers({
      channelId: options.channelId,
      groupId: options.groupId,
      viewerIds: options.viewerIds,
      force: options.force,
      output: options.output,
    })));

  groupViewerCmd
    .command('add-names')
    .description('Add viewers with names to a lottery viewer group')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--group-id <id>', 'group ID')
    .requiredOption('--viewer-names <json>', 'JSON array of {viewerId,viewerName}', parseJsonArray)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withLotteryHandler((handler) => handler.createGroupViewerNames({
      channelId: options.channelId,
      groupId: options.groupId,
      viewerNames: options.viewerNames,
      force: options.force,
      output: options.output,
    })));

  groupViewerCmd
    .command('delete')
    .description('Delete viewers from a lottery viewer group')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--group-id <id>', 'group ID')
    .requiredOption('--ids <ids>', 'comma-separated group viewer record IDs', parseNumberList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withLotteryHandler((handler) => handler.deleteGroupViewers({
      channelId: options.channelId,
      groupId: options.groupId,
      ids: options.ids,
      force: options.force,
      output: options.output,
    })));

  const blacklistCmd = lotteryCmd
    .command('blacklist')
    .description('Manage lottery viewer blacklist');

  blacklistCmd
    .command('list')
    .description('List lottery viewer blacklist')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--page <number>', 'page number', parsePositiveInteger)
    .option('--size <number>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withLotteryHandler((handler) => handler.listBlacklistViewers({
      channelId: options.channelId,
      page: options.page,
      size: options.size,
      output: options.output,
    })));

  blacklistCmd
    .command('add')
    .description('Add viewers to lottery blacklist')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--viewer-ids <ids>', 'comma-separated viewer IDs', parseStringList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withLotteryHandler((handler) => handler.createBlacklistViewers({
      channelId: options.channelId,
      viewerIds: options.viewerIds,
      force: options.force,
      output: options.output,
    })));

  blacklistCmd
    .command('delete')
    .description('Delete viewers from lottery blacklist')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--ids <ids>', 'comma-separated blacklist record IDs', parseNumberList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withLotteryHandler((handler) => handler.deleteBlacklistViewers({
      channelId: options.channelId,
      ids: options.ids,
      force: options.force,
      output: options.output,
    })));

  const luckyBagCmd = lotteryCmd
    .command('lucky-bag')
    .description('Manage lucky bag lottery data');

  luckyBagCmd
    .command('winners')
    .description('List lucky bag winners')
    .requiredOption('--activity-id <id>', 'lucky bag activity ID')
    .option('--session-id <id>', 'live session ID')
    .option('--page <number>', 'page number', parsePositiveInteger)
    .option('--size <number>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withLotteryHandler((handler) => handler.listLuckyBagWinners({
      activityId: options.activityId,
      sessionId: options.sessionId,
      page: options.page,
      size: options.size,
      output: options.output,
    })));
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
