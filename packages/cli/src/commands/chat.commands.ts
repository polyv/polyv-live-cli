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

/**
 * Registers chat-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerChatCommands(program: Command): void {
  const chatCmd = program.command('chat');
  chatCmd.description('Manage live streaming chat messages');

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
