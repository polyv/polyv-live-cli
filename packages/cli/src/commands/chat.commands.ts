/**
 * @fileoverview Chat command definitions for CLI
 * @author Development Team
 * @since 11.1.0
 */

import { Command } from 'commander';
import { ChatHandler } from '../handlers/chat.handler';
import { ChatServiceConfig } from '../types/chat';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';

/**
 * Parse page size
 * @param value String value to parse
 * @returns Parsed integer
 */
export function parsePageSize(value: string): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 1 || parsed > 100) {
    throw new Error('Page size should be between 1 and 100');
  }
  return parsed;
}

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

export function validateYn(value: string): 'Y' | 'N' {
  if (value !== 'Y' && value !== 'N') {
    throw new Error('Value must be Y or N');
  }
  return value;
}

export function parsePositiveInteger(value: string): number {
  const parsed = parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error('Value must be a positive integer');
  }
  return parsed;
}

export function parseNonNegativeInteger(value: string): number {
  const parsed = parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error('Value must be a non-negative integer');
  }
  return parsed;
}

export function parseBooleanOption(value: string): boolean {
  if (value === 'true' || value === '1' || value === 'Y') return true;
  if (value === 'false' || value === '0' || value === 'N') return false;
  throw new Error('Value must be true/false, 1/0, or Y/N');
}

export function parseJoinHistoryList(value: string): 0 | 1 {
  const parsed = parseInt(value, 10);
  if (parsed !== 0 && parsed !== 1) {
    throw new Error('joinHistoryList must be 0 or 1');
  }
  return parsed as 0 | 1;
}

export function parseCommaList(value: string): string[] {
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

export function parseRobotList(value: string): Array<{ name: string; avatar: string }> {
  const parsed = JSON.parse(value);
  if (!Array.isArray(parsed)) {
    throw new Error('Robot list must be a JSON array');
  }
  return parsed;
}

/**
 * Registers chat-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerChatCommands(program: Command): void {
  const chatCmd = program.command('chat');
  chatCmd.description('Manage live streaming chat messages');

  async function withChatHandler(action: (handler: ChatHandler) => Promise<void>): Promise<void> {
    try {
      const parentOptions = program.opts();
      const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
      await action(new ChatHandler(authConfig, serviceConfig));
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  }

  // ========================================
  // chat send (AC #1)
  // ========================================
  const sendCmd = chatCmd
    .command('send')
    .description('Send an admin message to the channel chat')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('-m, --msg <text>', 'text message content')
    .option('-i, --img-url <url>', 'image URL')
    .option('-p, --pic <url>', 'avatar URL')
    .option('-n, --nickname <name>', 'sender nickname')
    .option('-a, --actor <role>', 'actor/role')
    .option('--admin-index <number>', 'admin index', parseInt)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const chatHandler = new ChatHandler(authConfig, serviceConfig);

        // Provide default values for required API parameters
        await chatHandler.sendAdminMessage({
          channelId: options.channelId,
          msg: options.msg,
          imgUrl: options.imgUrl,
          pic: options.pic || 'https://live.polyv.net/assets/images/default-avatar.png',
          nickName: options.nickname || '管理员',
          actor: options.actor,
          adminIndex: options.adminIndex,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  sendCmd.addHelpText('after', `
Examples:
  # Send text message
  $ polyv-live-cli chat send -c "3151318" -m "Hello World"

  # Send image message
  $ polyv-live-cli chat send -c "3151318" -i "https://example.com/image.png"

  # Send message with custom nickname
  $ polyv-live-cli chat send -c "3151318" -m "Hello" -n "Admin" -a "管理员"

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // chat list (AC #2)
  // ========================================
  const listCmd = chatCmd
    .command('list')
    .description('List chat history with pagination')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--start-day <date>', 'start date filter (yyyy-MM-dd, default: today)')
    .option('--end-day <date>', 'end date filter (yyyy-MM-dd, default: today)')
    .option('--page <number>', 'page number (default 1)', parseInt)
    .option('--size <number>', 'page size (1-100, default 20)', parsePageSize)
    .option('--user-type <type>', 'user type filter')
    .option('--status <status>', 'status filter')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const chatHandler = new ChatHandler(authConfig, serviceConfig);

        // Default to today if not specified
        const today = new Date().toISOString().split('T')[0];
        const startDay = options.startDay || today;
        const endDay = options.endDay || today;

        await chatHandler.listMessages({
          channelId: options.channelId,
          startDay,
          endDay,
          page: options.page,
          size: options.size,
          userType: options.userType,
          status: options.status,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  listCmd.addHelpText('after', `
Examples:
  # List recent chat messages
  $ polyv-live-cli chat list -c "3151318"

  # List with pagination
  $ polyv-live-cli chat list -c "3151318" --page 2 --size 50

  # List with date range
  $ polyv-live-cli chat list -c "3151318" --start-day "2024-01-01" --end-day "2024-01-31"

  # List in JSON format
  $ polyv-live-cli chat list -c "3151318" -o json

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // chat delete (AC #3)
  // ========================================
  const deleteCmd = chatCmd
    .command('delete')
    .description('Delete a chat message or clear all messages')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('-m, --message-id <id>', 'message ID to delete')
    .option('--clear', 'clear all messages in the channel')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const chatHandler = new ChatHandler(authConfig, serviceConfig);

        await chatHandler.deleteMessage({
          channelId: options.channelId,
          messageId: options.messageId,
          clear: options.clear,
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
  # Delete a single message
  $ polyv-live-cli chat delete -c "3151318" -m "abc123"

  # Clear all messages
  $ polyv-live-cli chat delete -c "3151318" --clear

  # Skip confirmation
  $ polyv-live-cli chat delete -c "3151318" -m "abc123" --force

Note:
  Deletion is permanent and cannot be undone.
  Use --force to skip confirmation prompt.
`);

  chatCmd
    .command('group-login-times')
    .description('Get group login times for a channel')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
        await new ChatHandler(authConfig, serviceConfig).getGroupLoginTimes(options);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // ========================================
  // chat ban (Story 11-2, AC #1)
  // ========================================
  chatCmd
    .command('ban')
    .description('Ban users from chat (channel or global)')
    .option('-c, --channel-id <id>', 'channel ID (required for channel-level ban)')
    .requiredOption('-u, --user-ids <ids>', 'user IDs to ban (comma-separated)')
    .option('--global', 'ban users globally (account level)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const chatHandler = new ChatHandler(authConfig, serviceConfig);
        const userIds = options.userIds.split(',').map((id: string) => id.trim());

        await chatHandler.banUser({
          channelId: options.channelId,
          userIds,
          global: options.global,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // ========================================
  // chat unban (Story 11-2, AC #2)
  // ========================================
  chatCmd
    .command('unban')
    .description('Unban users from chat (channel or global)')
    .option('-c, --channel-id <id>', 'channel ID (required for channel-level unban)')
    .requiredOption('-u, --user-ids <ids>', 'user IDs to unban (comma-separated)')
    .option('--global', 'unban users globally (account level)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const chatHandler = new ChatHandler(authConfig, serviceConfig);
        const userIds = options.userIds.split(',').map((id: string) => id.trim());

        await chatHandler.unbanUser({
          channelId: options.channelId,
          userIds,
          global: options.global,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // ========================================
  // chat kick (Story 11-2, AC #3)
  // ========================================
  chatCmd
    .command('kick')
    .description('Kick users from channel or globally')
    .option('-c, --channel-id <id>', 'channel ID (required for channel-level kick)')
    .option('--viewer-ids <ids>', 'viewer IDs to kick (comma-separated)')
    .option('-n, --nick-names <names>', 'nicknames to kick (comma-separated)')
    .option('--global', 'kick users globally (platform level)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const chatHandler = new ChatHandler(authConfig, serviceConfig);
        const viewerIds = options.viewerIds ? options.viewerIds.split(',').map((id: string) => id.trim()) : undefined;
        const nickNames = options.nickNames ? options.nickNames.split(',').map((name: string) => name.trim()) : undefined;

        await chatHandler.kickUser({
          channelId: options.channelId,
          viewerIds,
          nickNames,
          global: options.global,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // ========================================
  // chat unkick (Story 11-2, AC #4)
  // ========================================
  chatCmd
    .command('unkick')
    .description('Unkick users (cancel kick status)')
    .option('-c, --channel-id <id>', 'channel ID (required for channel-level unkick)')
    .option('--viewer-ids <ids>', 'viewer IDs to unkick (comma-separated)')
    .option('-n, --nick-names <names>', 'nicknames to unkick (comma-separated)')
    .option('--global', 'unkick users globally (platform level)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const chatHandler = new ChatHandler(authConfig, serviceConfig);
        const viewerIds = options.viewerIds ? options.viewerIds.split(',').map((id: string) => id.trim()) : undefined;
        const nickNames = options.nickNames ? options.nickNames.split(',').map((name: string) => name.trim()) : undefined;

        await chatHandler.unkickUser({
          channelId: options.channelId,
          viewerIds,
          nickNames,
          global: options.global,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // ========================================
  // chat banned list (Story 11-2, AC #5)
  // ========================================
  const bannedCmd = chatCmd.command('banned');
  bannedCmd.description('Manage banned items');

  bannedCmd
    .command('list')
    .description('List banned users, IPs, or badwords')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('-t, --type <type>', 'banned list type (userId|ip|badword)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const chatHandler = new ChatHandler(authConfig, serviceConfig);

        await chatHandler.listBanned({
          channelId: options.channelId,
          type: options.type,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // ========================================
  // chat kicked list (Story 11-2, AC #6)
  // ========================================
  const kickedCmd = chatCmd.command('kicked');
  kickedCmd.description('Manage kicked users');

  kickedCmd
    .command('list')
    .description('List kicked users')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const chatHandler = new ChatHandler(authConfig, serviceConfig);

        await chatHandler.listKicked({
          channelId: options.channelId,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  const messageCmd = chatCmd.command('message');
  messageCmd.description('Manage advanced chat messages');

  messageCmd
    .command('hidden-send')
    .description('Send hidden text or image message as a user')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('-u, --user-id <id>', 'user ID')
    .option('--content <text>', 'message content')
    .option('--img-url <url>', 'image URL')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.sendHiddenMessage({
      channelId: options.channelId,
      userId: options.userId,
      content: options.content,
      imgUrl: options.imgUrl,
      output: options.output,
    })));

  messageCmd
    .command('admin-send')
    .description('Send hidden message as an admin role')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--content <text>', 'message content')
    .requiredOption('--role <role>', 'sender role')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.sendHiddenByAdmin(options)));

  messageCmd
    .command('online-count')
    .description('Get current chat online user count')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.countOnlineUser(options)));

  messageCmd
    .command('remove-contents')
    .description('Batch remove chat message records')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--ids <ids>', 'chat message IDs, comma-separated', parseCommaList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.removeChatContents(options)));

  messageCmd
    .command('speak-list')
    .description('List account chat speak records')
    .option('--start-time <timestamp>', 'start time timestamp', parsePositiveInteger)
    .option('--end-time <timestamp>', 'end time timestamp', parsePositiveInteger)
    .option('--cursor <cursor>', 'pagination cursor')
    .option('--size <number>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.listSpeak(options)));

  messageCmd
    .command('alert-special')
    .description('Send popup alert to broadcaster')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--title <text>', 'popup title')
    .requiredOption('--message <text>', 'popup message')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.alertToSpecial(options)));

  messageCmd
    .command('audit')
    .description('Submit an approved chat message audit item')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--msg-id <id>', 'message ID')
    .requiredOption('--viewer-id <id>', 'viewer ID')
    .requiredOption('--nick-name <name>', 'viewer nickname')
    .requiredOption('--content <text>', 'message content')
    .option('--avatar <url>', 'viewer avatar URL')
    .option('--session-id <id>', 'session ID')
    .option('--viewer-type <type>', 'viewer type')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.auditMessage(options)));

  messageCmd
    .command('custom-send')
    .description('Send custom chat message')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--content <text>', 'message content')
    .option('--img-url <url>', 'image URL')
    .option('--join-history-list <value>', 'join history list (true|false)', parseBooleanOption)
    .option('--watch-type <type>', 'watch target type')
    .option('--important <value>', 'important message flag (true|false)', parseBooleanOption)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.sendCustomMessage(options)));

  messageCmd
    .command('custom-send-encode')
    .description('Send URL-safe base64 encoded custom chat message')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--content <text>', 'encoded message content')
    .option('--img-url <url>', 'image URL')
    .option('--join-history-list <value>', 'join history list (0|1)', parseJoinHistoryList)
    .option('--watch-type <type>', 'watch target type')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.sendCustomMessageEncode(options)));

  messageCmd
    .command('emit-by-user-id')
    .description('Broadcast message to specific users by user ID')
    .requiredOption('-r, --room-id <id>', 'room ID')
    .requiredOption('-u, --user-ids <ids>', 'user IDs, comma-separated', parseCommaList)
    .requiredOption('--payload <text>', 'message payload')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.emitByUserId(options)));

  const badwordCmd = chatCmd.command('badword');
  badwordCmd.description('Manage account and channel badwords');

  badwordCmd
    .command('list')
    .description('List account badwords')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.listUserBadwords(options)));

  badwordCmd
    .command('add')
    .description('Add account or channel badwords')
    .requiredOption('--user-id <id>', 'account user ID')
    .requiredOption('--words <words>', 'badwords, comma-separated', parseCommaList)
    .option('-c, --channel-id <id>', 'channel ID for channel-level badwords')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.addBadwords(options)));

  badwordCmd
    .command('delete')
    .description('Delete account badwords')
    .requiredOption('--words <words>', 'badwords, comma-separated')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.deleteUserBadword(options)));

  bannedCmd
    .command('ip-add')
    .description('Ban an IP address in channel chat')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--ip <ip>', 'IP address')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.addBannedIp(options)));

  bannedCmd
    .command('user-list')
    .description('List account banned users')
    .option('--page <number>', 'page number', parsePositiveInteger)
    .option('--size <number>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.listUserBanned(options)));

  bannedCmd
    .command('forbid-list')
    .description('List globally forbidden chat users')
    .option('--viewer-id <id>', 'viewer ID filter')
    .option('--nick-name <name>', 'nickname filter')
    .option('--page-number <number>', 'page number', parsePositiveInteger)
    .option('--page-size <number>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.listForbidUsers(options)));

  bannedCmd
    .command('delete')
    .description('Delete channel badword or banned IP')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('-t, --type <type>', 'item type (ip|badword)')
    .requiredOption('--content <text>', 'IP or badword content')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.deleteChannelBanned(options)));

  const noticeCmd = chatCmd.command('notice');
  noticeCmd.description('Manage channel notices');

  noticeCmd
    .command('list')
    .description('List channel notices')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--page-number <number>', 'page number', parsePositiveInteger)
    .option('--page-size <number>', 'page size', parsePositiveInteger)
    .option('--sort <sort>', 'sort expression, for example createTime:desc')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.listBulletins(options)));

  noticeCmd
    .command('add')
    .description('Add channel notice')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--content <text>', 'notice content')
    .option('--is-top <value>', 'pin to top (Y|N)')
    .option('--is-pop <value>', 'show popup (Y|N)')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.addBulletin(options)));

  noticeCmd
    .command('clean')
    .description('Clear all channel notices')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.cleanNotices(options)));

  const qaCmd = chatCmd.command('qa');
  qaCmd.description('Manage chat Q&A records');

  qaCmd
    .command('list')
    .description('List channel Q&A records')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--page-number <number>', 'page number', parsePositiveInteger)
    .option('--page-size <number>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.listQa(options)));

  const censorCmd = chatCmd.command('censor');
  censorCmd.description('Manage chat censor settings');

  censorCmd
    .command('update')
    .description('Update chat censor enabled setting')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--enabled <value>', 'enabled flag (Y|N)')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.updateCensorEnabled(options)));

  const roleCmd = chatCmd.command('role');
  roleCmd.description('Manage chat role information');

  roleCmd
    .command('admin-get')
    .description('Get admin role information')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.getAdminInfo(options)));

  roleCmd
    .command('admin-update')
    .description('Update admin role information')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--nickname <name>', 'admin nickname')
    .requiredOption('--actor <title>', 'admin actor/title')
    .requiredOption('--avatar <path>', 'admin avatar image file path (jpg/jpeg/png)')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.updateAdminInfo(options)));

  roleCmd
    .command('teacher-get')
    .description('Get teacher role information')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.getTeacherInfo(options)));

  roleCmd
    .command('teacher-update')
    .description('Update teacher role information')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--nickname <name>', 'teacher nickname')
    .option('--actor <title>', 'teacher actor/title')
    .option('--passwd <password>', 'teacher password')
    .option('--avatar <url>', 'teacher avatar URL')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.updateTeacherInfo(options)));

  roleCmd
    .command('user-list')
    .description('List online chat room users')
    .requiredOption('-r, --room-id <id>', 'room ID')
    .option('--page <number>', 'page number', parsePositiveInteger)
    .option('--len <number>', 'page size', parsePositiveInteger)
    .option('--to-get-sub-rooms <value>', 'include sub rooms (true|false)', parseBooleanOption)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.getUserList(options)));

  const robotCmd = chatCmd.command('robot');
  robotCmd.description('Manage channel chat robots');

  robotCmd
    .command('setting-get')
    .description('Get channel robot setting')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.getRobotSetting(options)));

  robotCmd
    .command('stats')
    .description('Get channel robot stats')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.getRobotStats(options)));

  robotCmd
    .command('setting-update')
    .description('Update channel robot setting')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--robot-number <number>', 'robot number', parseNonNegativeInteger)
    .requiredOption('--add-robot-model <model>', 'robot add model (timely|fixed_time)')
    .option('--change-time <seconds>', 'change time in seconds', parsePositiveInteger)
    .option('--virtual-booking-number <number>', 'virtual booking number', parseNonNegativeInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.updateRobotSetting(options)));

  robotCmd
    .command('list-update')
    .description('Update channel robot count and custom robot list')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--robot-number <number>', 'robot number', parseNonNegativeInteger)
    .requiredOption('--add-robot-model <model>', 'robot add model (timely|fixed_time)')
    .option('--change-time <seconds>', 'change time in seconds', parsePositiveInteger)
    .option('--virtual-booking-number <number>', 'virtual booking number', parseNonNegativeInteger)
    .option('--robot-list <json>', 'custom robot list JSON array', parseRobotList)
    .option('--robot-random-member-enabled <value>', 'random content-library robots (Y|N)')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.updateRobotListSetting(options)));

  robotCmd
    .command('pause')
    .description('Pause channel robot growth')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.pauseRobot(options)));

  const enabledCmd = chatCmd.command('enabled');
  enabledCmd.description('Manage channel chat switch');

  enabledCmd
    .command('update')
    .description('Batch update channel chat switch')
    .requiredOption('--channel-ids <ids>', 'channel IDs, comma-separated', parseCommaList)
    .requiredOption('--chat-enabled <yn>', 'chat enabled flag (Y|N)', validateYn)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.batchUpdateChatEnabled({
      channelIds: options.channelIds,
      chatEnabled: options.chatEnabled,
      force: options.force,
      output: options.output,
    })));

  chatCmd
    .command('viewer-logout')
    .description('Log out a viewer from the channel watch page')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--token <token>', 'viewer token')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async options => withChatHandler(handler => handler.logoutWatchViewer(options)));

  // ========================================
  // Common helper
  // ========================================
  async function loadAuthAndServiceConfig(parentOptions: any): Promise<{
    authConfig: AuthConfig;
    serviceConfig: ChatServiceConfig;
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

    const serviceConfig: ChatServiceConfig = {
      baseUrl: configResult.config.baseUrl,
      timeout: configResult.config.timeout,
      debug: configResult.config.debug,
    };

    return {
      authConfig: authResult.config,
      serviceConfig,
    };
  }
}
