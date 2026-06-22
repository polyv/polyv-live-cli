/**
 * @fileoverview Channel command definitions for CLI
 * @author Development Team
 * @since 2.1.0
 */

import { Command } from 'commander';
import { ChannelHandler } from '../handlers/channel.handler';
import { ChannelServiceSdk } from '../services/channel.service.sdk';
import { ChannelCreateOptions, ChannelListOptions, ChannelGetOptions, ChannelUpdateOptions, ChannelDeleteOptions, ChannelServiceConfig } from '../types/channel';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';
import {
  apiParams,
  confirmWrite,
  displayApiResult,
  parseJsonArray,
  parseJsonObject,
  parseNumberList,
  parseStringList,
} from '../utils/api-command';

/**
 * Load and prepare authentication and service configuration
 */
async function loadAuthAndServiceConfig(parentOptions: any): Promise<{
  authConfig: any;
  serviceConfig: ChannelServiceConfig;
  isVerbose: boolean;
  authSource?: string;
  accountName?: string;
}> {
  // Get authentication using new priority system first
  const authResult = authAdapter.tryGetAuthConfig(parentOptions);
  if (!authResult) {
    // Throw error with authentication guidance
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
          maxRetries: 3,
          debug: false
        }
      };
    } else {
      throw error;
    }
  }

  // Create service configuration
  const serviceConfig: ChannelServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    maxRetries: configResult.config.maxRetries,
    debug: configResult.config.debug
  };

  // Display authentication source information if verbose
  const isVerbose = !!parentOptions.verbose;
  if (isVerbose) {
    console.log(`🔐 Authentication Source: ${authResult.source}`);
    if (authResult.accountName) {
      console.log(`👤 Account: ${authResult.accountName}`);
    }
    console.log(''); // Empty line for spacing
  }

  const result: {
    authConfig: AuthConfig;
    serviceConfig: ChannelServiceConfig;
    isVerbose: boolean;
    authSource?: string;
    accountName?: string;
  } = {
    authConfig: authResult.config,
    serviceConfig,
    isVerbose,
  };

  if (authResult.source) {
    result.authSource = authResult.source;
  }

  if (authResult.accountName) {
    result.accountName = authResult.accountName;
  }

  return result;
}

/**
 * Registers channel-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerChannelCommands(program: Command): void {

  // Create channel command group
  const channelCmd = program.command('channel');
  channelCmd.description('Manage live streaming channels');

  const runChannelViewerCommand = async (action: (handler: ChannelHandler) => Promise<void>): Promise<void> => {
    try {
      const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(program.opts());
      const channelHandler = new ChannelHandler(authConfig, serviceConfig);
      await action(channelHandler);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  };

  const runChannelViewerWriteCommand = async (
    options: any,
    confirmationMessage: string,
    action: (handler: ChannelHandler) => Promise<void>
  ): Promise<void> => {
    try {
      await confirmWrite(options.force, confirmationMessage);
      const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(program.opts());
      const channelHandler = new ChannelHandler(authConfig, serviceConfig);
      await action(channelHandler);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  };

  const runChannelApiCommand = async (
    options: any,
    action: (service: ChannelServiceSdk) => Promise<any>
  ): Promise<void> => {
    try {
      const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(program.opts());
      const service = new ChannelServiceSdk(authConfig, serviceConfig);
      displayApiResult(await action(service), options.output);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  };

  const runChannelApiWriteCommand = async (
    options: any,
    confirmationMessage: string,
    action: (service: ChannelServiceSdk) => Promise<any>
  ): Promise<void> => {
    try {
      await confirmWrite(options.force, confirmationMessage);
      const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(program.opts());
      const service = new ChannelServiceSdk(authConfig, serviceConfig);
      const result = await action(service);
      displayApiResult({ success: true, result: result ?? true }, options.output);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  };

  // Channel create command
  const createCmd = channelCmd
    .command('create')
    .description('Create a new live streaming channel')
    .requiredOption('-n, --name <name>', 'channel name (required, max 100 characters)')
    .option('-d, --description <description>', 'channel description (optional, max 500 characters)')
    .option('--max-viewers <number>', 'maximum number of viewers (optional, max 100,000)', parseInteger)
    .option('--auto-record', 'enable automatic recording (optional)')
    .option('--scene <scene>', 'live scene type (optional)', validateScene, 'topclass')
    .option('--template <template>', 'channel template (optional)', validateTemplate, 'ppt')
    .option('-p, --password <password>', 'channel password (optional, 6-16 alphanumeric characters)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create channel handler instance
        const channelHandler = new ChannelHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const channelOptions: ChannelCreateOptions = {
          name: options.name,
          description: options.description,
          maxViewers: options.maxViewers,
          autoRecord: options.autoRecord || false,
          scene: options.scene,
          template: options.template,
          password: options.password,
          output: options.output
        };

        // Execute channel creation
        await channelHandler.create(channelOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          // Add authentication diagnostics for auth-related errors
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(error => console.error(`  - ${error}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for channel create command
  createCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli channel create -n "My Live Stream"
  $ polyv-live-cli channel create -n "Demo Channel" -d "Test channel for demo"
  $ polyv-live-cli channel create -n "Secure Stream" -p "stream123" --max-viewers 500
  $ polyv-live-cli channel create -n "Activity" --scene alone --template portrait_alone
  $ polyv-live-cli channel create -n "JSON Output" -o json

Alternative (full parameter names):
  $ polyv-live-cli channel create --name "My Live Stream"
  $ polyv-live-cli channel create --name "Demo Channel" --description "Test channel for demo"

Scene Types (V4 API):
  topclass    - 大班课 (default)
  alone       - 活动营销
  seminar     - 研讨会
  train       - 企业培训
  double      - 双师课 (需开通权限)
  guide       - 导播 (需开通权限)

Templates (V4 API):
  ppt               - 三分屏-横屏 (default)
  portrait_ppt      - 三分屏-竖屏
  alone             - 纯视频-横屏
  portrait_alone    - 纯视频-竖屏
  topclass          - 纯视频极速-横屏
  portrait_topclass - 纯视频极速-竖屏
  seminar           - 研讨会

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // Channel list command
  const listCmd = channelCmd
    .command('list')
    .description('List live streaming channels with pagination')
    .option('-P, --page <number>', 'page number (optional, minimum 1, default 1)', parseInteger, 1)
    .option('-l, --limit <number>', 'items per page (optional, 1-100, default 20)', validateLimit, 20)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .option('--category-id <id>', 'filter by category ID (optional)')
    .option('--keyword <keyword>', 'filter by channel name keyword (optional)')
    .option('--label-id <id>', 'filter by label ID (optional)')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create channel handler instance
        const channelHandler = new ChannelHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const listOptions: ChannelListOptions = {
          page: options.page,
          limit: options.limit,
          output: options.output,
          categoryId: options.categoryId,
          keyword: options.keyword,
          labelId: options.labelId
        };

        // Execute channel listing
        await channelHandler.listChannels(listOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          // Add authentication diagnostics for auth-related errors
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(error => console.error(`  - ${error}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for channel list command
  listCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli channel list
  $ polyv-live-cli channel list -P 2 -l 10
  $ polyv-live-cli channel list -o json
  
Alternative (full parameter names):
  $ polyv-live-cli channel list --page 2 --limit 10 --output json
  $ polyv-live-cli channel list --keyword "live stream"
  $ polyv-live-cli channel list --category-id "cat123"
  $ polyv-live-cli channel list --page 1 --limit 5 --output table

Pagination:
  --page      Page number (minimum 1, default 1)
  --limit     Items per page (1-100, default 20)

Filters:
  --category-id   Filter by category ID
  --keyword       Filter by channel name (partial match)
  --label-id      Filter by label ID

Output Formats:
  table           Formatted table output (default)
  json            JSON format for programmatic use
`);

  // Channel get command
  const getCmd = channelCmd
    .command('get')
    .description('Get detailed information for a specific channel')
    .requiredOption('-c, --channelId <id>', 'channel ID (required)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create channel handler instance
        const channelHandler = new ChannelHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const getOptions: ChannelGetOptions = {
          channelId: options.channelId,
          output: options.output
        };

        // Execute channel detail retrieval
        await channelHandler.getChannelDetail(getOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          // Add authentication diagnostics for auth-related errors
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(error => console.error(`  - ${error}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for channel get command
  getCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli channel get --channelId 3151318
  $ polyv-live-cli channel get --channelId 3151318 --output table
  $ polyv-live-cli channel get --channelId 3151318 --output json

Parameter:
  --channelId     Channel ID to retrieve details for (required)

Output Formats:
  table           Formatted table output with grouped information (default)
  json            JSON format with all available data for programmatic use

Note: 
  The table format displays information in groups (Basic Information, 
  Configuration, Statistics & Timing, etc.) for better readability.
  The json format includes all available fields from the API response.
`);

  // Channel update command
  const updateCmd = channelCmd
    .command('update')
    .description('Update an existing live streaming channel')
    .requiredOption('-c, --channelId <id>', 'channel ID (required)')
    .option('-n, --name <name>', 'channel name (max 100 characters)')
    .option('-d, --description <description>', 'channel description (max 500 characters)')
    .option('--publisher <publisher>', 'publisher/host name')
    .option('-p, --password <password>', 'channel password (6-16 alphanumeric characters)')
    .option('--max-viewers <number>', 'maximum number of viewers', parseInteger)
    .option('--start-time <timestamp>', 'live start time (timestamp)', parseInteger)
    .option('--end-time <timestamp>', 'live end time (timestamp)', parseInteger)
    .option('--page-views <number>', 'page view count', parseInteger)
    .option('--likes <number>', 'likes count', parseInteger)
    .option('--cover-img <url>', 'cover image URL')
    .option('--splash-img <url>', 'splash image URL')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create channel handler instance
        const channelHandler = new ChannelHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const updateOptions: ChannelUpdateOptions = {
          channelId: options.channelId,
          name: options.name,
          description: options.description,
          publisher: options.publisher,
          password: options.password,
          maxViewers: options.maxViewers,
          startTime: options.startTime,
          endTime: options.endTime,
          pageView: options.pageViews,
          likes: options.likes,
          coverImg: options.coverImg,
          splashImg: options.splashImg,
          output: options.output
        };

        // Execute channel update
        await channelHandler.updateChannel(updateOptions);

      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for update command
  updateCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli channel update --channelId 3151318 --name "New Channel Name"
  $ polyv-live-cli channel update --channelId 3151318 --name "Test" --publisher "Host Name"
  $ polyv-live-cli channel update --channelId 3151318 --password "newpass123" --max-viewers 1000
  $ polyv-live-cli channel update --channelId 3151318 --description "Updated description" --output json
  $ polyv-live-cli channel update --channelId 3151318 --cover-img "https://example.com/cover.jpg"

Required Parameter:
  --channelId     Channel ID to update (required)

Update Parameters (at least one required):
  --name          Channel name (max 100 characters)
  --description   Channel description (max 500 characters)
  --publisher     Publisher/host name
  --password      Channel password (6-16 alphanumeric characters)
  --max-viewers   Maximum number of viewers (positive integer)
  --start-time    Live start time (13-digit timestamp)
  --end-time      Live end time (13-digit timestamp)
  --page-views    Page view count (non-negative integer)
  --likes         Likes count (non-negative integer)
  --cover-img     Cover image URL
  --splash-img    Splash image URL

Output Formats:
  table           Formatted table output with update summary (default)
  json            JSON format for programmatic use

Note: 
  At least one update parameter must be provided. The password field will be 
  masked in output for security. Time parameters should be 13-digit timestamps.
`);

  // Register single channel delete command
  const deleteCmd = channelCmd
    .command('delete')
    .description('Delete a single live streaming channel with confirmation')
    .requiredOption('-c, --channelId <id>', 'channel ID to delete')
    .option('-f, --force', 'force delete without confirmation')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create channel handler instance
        const channelHandler = new ChannelHandler(authConfig, serviceConfig);

        // Set up delete options for single channel
        const deleteOptions: ChannelDeleteOptions = {
          channelId: options.channelId,
          force: options.force || false,
          output: options.output
        };

        // Execute single channel delete command
        await channelHandler.deleteChannel(deleteOptions);

      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for single channel delete command
  deleteCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli channel delete --channelId 3151318
  $ polyv-live-cli channel delete --channelId 3151318 --force
  $ polyv-live-cli channel delete --channelId 3151318 --output json

Required Parameter:
  --channelId     Channel ID to delete (required)

Optional Parameters:
  --force         Skip interactive confirmation prompt (use with caution!)
  --output        Output format (table|json, default: table)

Output Formats:
  table           Formatted table output with deletion confirmation (default)
  json            JSON format for programmatic use

🚨 WARNING: 
  Channel deletion is PERMANENT and cannot be undone. All channel data,
  including recordings, chat history, and configurations will be lost.
  
  By default, you will be prompted to confirm the deletion. Use --force 
  flag to skip confirmation, but be very careful!

Interactive Confirmation:
  When not using --force, you will be prompted to type 'yes' to confirm
  the deletion. This helps prevent accidental deletions.

Non-Interactive Environments:
  In non-TTY environments (scripts, CI/CD), you must use --force flag
  to proceed with deletion.
`);

  // Register batch delete command for multiple channels
  const batchDeleteCmd = channelCmd
    .command('batch-delete')
    .description('Delete multiple live streaming channels at once')
    .requiredOption('--channelIds <ids...>', 'channel IDs to delete (space-separated list)')
    .option('-f, --force', 'force delete without confirmation')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create channel handler instance
        const channelHandler = new ChannelHandler(authConfig, serviceConfig);

        // Set up delete options for multiple channels (legacy interface)
        const deleteOptions: any = {
          channelIds: options.channelIds,
          force: options.force || false,
          output: options.output
        };

        // Execute batch delete command
        await channelHandler.deleteChannels(deleteOptions);

      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for batch delete command
  batchDeleteCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli channel batch-delete --channelIds 3151318
  $ polyv-live-cli channel batch-delete --channelIds 3151318 3151319 3151320
  $ polyv-live-cli channel batch-delete --channelIds 3151318 --force
  $ polyv-live-cli channel batch-delete --channelIds 3151318 3151319 --output json

Required Parameter:
  --channelIds    Channel IDs to delete (space-separated list, max 100)

Optional Parameters:
  --force         Skip confirmation prompts (be careful!)
  --output        Output format (table|json, default: table)

Output Formats:
  table           Formatted table output with deletion summary (default)
  json            JSON format for programmatic use

⚠️  WARNING: 
  Channel deletion is PERMANENT and cannot be undone. All channel data,
  including recordings, chat history, and configurations will be lost.
  
  Use --force flag to skip confirmation prompts, but be very careful!

Examples with multiple channels:
  $ polyv-live-cli channel batch-delete --channelIds 1001 1002 1003
  $ polyv-live-cli channel batch-delete --channelIds 1001 1002 1003 --force --output json

Note: 
  This command allows deleting up to 100 channels in a single operation.
  For single channel deletion with interactive confirmation, use 'channel delete' instead.
`);

  const addViewerCommonOptions = (cmd: Command): Command => cmd
    .option('--scope <scope>', 'live-bg endpoint scope (user|teacher)', validateChannelViewerScope, 'user')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table');

  const addViewerFilterOptions = (cmd: Command): Command => addViewerCommonOptions(cmd
    .option('--group-id <id>', 'viewer group ID', parseInteger)
    .option('--viewer-id <viewerId>', 'viewer ID')
    .option('--nickname <nickname>', 'viewer nickname')
    .option('--mobile <mobile>', 'viewer mobile')
  );

  const viewerCmd = channelCmd
    .command('viewer')
    .description('Manage channel-owned viewers and viewer groups');

  viewerCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli channel viewer group list --channel-id 3151318
  $ polyv-live-cli channel viewer list --channel-id 3151318 --page 1 --size 20 -o json
  $ polyv-live-cli channel viewer import --channel-id 3151318 --file viewers.xlsx --force

Scope:
  --scope user     Use /live-bg/v3/user endpoints (default)
  --scope teacher  Use /live-bg/v3/teacher endpoints
`);

  const viewerGroupCmd = viewerCmd
    .command('group')
    .description('Manage channel viewer groups');

  addViewerCommonOptions(
    viewerGroupCmd.command('list')
      .description('List channel viewer groups')
      .requiredOption('--channel-id <id>', 'channel ID')
  ).action((options) => runChannelViewerCommand(
    (handler) => handler.listChannelViewerGroups(options)
  ));

  addViewerCommonOptions(
    viewerGroupCmd.command('create')
      .description('Create a channel viewer group')
      .requiredOption('--channel-id <id>', 'channel ID')
      .requiredOption('--name <name>', 'group name')
      .option('-f, --force', 'skip confirmation prompt')
  ).action((options) => runChannelViewerWriteCommand(
    options,
    `Create channel viewer group "${options.name}"?`,
    (handler) => handler.createChannelViewerGroup(options)
  ));

  addViewerCommonOptions(
    viewerGroupCmd.command('update')
      .description('Update a channel viewer group')
      .requiredOption('--channel-id <id>', 'channel ID')
      .requiredOption('--id <id>', 'group ID', parseInteger)
      .requiredOption('--name <name>', 'group name')
      .option('-f, --force', 'skip confirmation prompt')
  ).action((options) => runChannelViewerWriteCommand(
    options,
    `Update channel viewer group ${options.id}?`,
    (handler) => handler.updateChannelViewerGroup(options)
  ));

  addViewerCommonOptions(
    viewerGroupCmd.command('delete')
      .description('Delete a channel viewer group')
      .requiredOption('--channel-id <id>', 'channel ID')
      .requiredOption('--id <id>', 'group ID', parseInteger)
      .option('-f, --force', 'skip confirmation prompt')
  ).action((options) => runChannelViewerWriteCommand(
    options,
    `Delete channel viewer group ${options.id}?`,
    (handler) => handler.deleteChannelViewerGroup(options)
  ));

  const viewerGroupSettingCmd = viewerCmd
    .command('group-setting')
    .description('Manage channel viewer group settings');

  addViewerCommonOptions(
    viewerGroupSettingCmd.command('get')
      .description('Get channel viewer group settings')
      .requiredOption('--channel-id <id>', 'channel ID')
  ).action((options) => runChannelViewerCommand(
    (handler) => handler.getChannelViewerGroupSetting(options)
  ));

  addViewerCommonOptions(
    viewerGroupSettingCmd.command('update')
      .description('Update channel viewer group settings')
      .requiredOption('--channel-id <id>', 'channel ID')
      .option('--channel-viewer-group-enabled <Y|N>', 'enable channel viewer groups', validateYnFlag)
      .option('--not-in-group-watch-enabled <Y|N>', 'allow viewers outside groups to watch', validateYnFlag)
      .option('-f, --force', 'skip confirmation prompt')
  ).action((options) => runChannelViewerWriteCommand(
    options,
    `Update channel viewer group settings for ${options.channelId}?`,
    (handler) => handler.updateChannelViewerGroupSetting(options)
  ));

  addViewerFilterOptions(
    viewerCmd.command('list')
      .description('List viewers belonging to a channel')
      .requiredOption('--channel-id <id>', 'channel ID')
      .option('--page <page>', 'page number', parseInteger, 1)
      .option('--size <size>', 'page size', parseInteger, 10)
  ).action((options) => runChannelViewerCommand(
    (handler) => handler.listChannelViewers(options)
  ));

  addViewerFilterOptions(
    viewerCmd.command('export')
      .description('Export viewers belonging to a channel')
      .requiredOption('--channel-id <id>', 'channel ID')
  ).action((options) => runChannelViewerCommand(
    (handler) => handler.exportChannelViewers(options)
  ));

  addViewerCommonOptions(
    viewerCmd.command('add')
      .description('Add viewers to a channel')
      .requiredOption('--channel-id <id>', 'channel ID')
      .requiredOption('--viewer-ids <ids>', 'viewer IDs, comma-separated')
      .option('--group-id <id>', 'target group ID', parseInteger)
      .option('-f, --force', 'skip confirmation prompt')
  ).action((options) => runChannelViewerWriteCommand(
    options,
    `Add viewers to channel ${options.channelId}?`,
    (handler) => handler.addChannelViewers(options)
  ));

  addViewerCommonOptions(
    viewerCmd.command('delete')
      .description('Delete viewers from a channel')
      .requiredOption('--channel-id <id>', 'channel ID')
      .requiredOption('--viewer-ids <ids>', 'viewer IDs, comma-separated')
      .option('-f, --force', 'skip confirmation prompt')
  ).action((options) => runChannelViewerWriteCommand(
    options,
    `Delete viewers from channel ${options.channelId}?`,
    (handler) => handler.deleteChannelViewers(options)
  ));

  addViewerCommonOptions(
    viewerCmd.command('transfer')
      .description('Transfer viewers to another group')
      .requiredOption('--channel-id <id>', 'channel ID')
      .requiredOption('--viewer-ids <ids>', 'viewer IDs, comma-separated')
      .option('--target-group-id <id>', 'target group ID; omit to clear group association', parseInteger)
      .option('-f, --force', 'skip confirmation prompt')
  ).action((options) => runChannelViewerWriteCommand(
    options,
    `Transfer viewers in channel ${options.channelId}?`,
    (handler) => handler.transferChannelViewers(options)
  ));

  addViewerCommonOptions(
    viewerCmd.command('import')
      .description('Import channel viewers from a file')
      .requiredOption('--channel-id <id>', 'channel ID')
      .requiredOption('--file <path>', 'viewer import file (.xls, .xlsx, or .csv)')
      .option('--group-id <id>', 'target group ID', parseInteger)
      .option('-f, --force', 'skip confirmation prompt')
  ).action((options) => runChannelViewerWriteCommand(
    options,
    `Import viewers into channel ${options.channelId} from ${options.file}?`,
    (handler) => handler.importChannelViewers(options)
  ));

  addViewerCommonOptions(
    viewerCmd.command('unrelated-list')
      .description('List viewers not joined to any channel group')
      .requiredOption('--channel-id <id>', 'channel ID')
      .option('--name <name>', 'viewer name')
      .option('--mobile <mobile>', 'mobile number')
      .option('--external-viewer-id <id>', 'external viewer ID')
      .option('--wx-open-id <id>', 'WeChat OpenID')
      .option('--wx-union-id <id>', 'WeChat UnionID')
      .option('--nickname <nickname>', 'viewer nickname')
      .option('--wx-nick-name <nickname>', 'WeChat nickname')
      .option('--source <source>', 'viewer source')
      .option('--email <email>', 'email')
      .option('--area <area>', 'area')
      .option('--last-collect-mobile <mobile>', 'last collected mobile')
      .option('--search-keyword <keyword>', 'keyword for nickname search')
      .option('--viewer-id <viewerId>', 'viewer ID')
      .option('--status <status>', 'viewer status')
      .option('--start-create-time <time>', 'registration start time, yyyy-MM-dd HH:mm:ss')
      .option('--end-create-time <time>', 'registration end time, yyyy-MM-dd HH:mm:ss')
      .option('--label-ids <ids>', 'label IDs, comma-separated')
      .option('--page <page>', 'page number', parseInteger, 1)
      .option('--size <size>', 'page size', parseInteger, 10)
  ).action((options) => runChannelViewerCommand(
    (handler) => handler.listUnrelatedChannelViewers(options)
  ));

  channelCmd.command('basic-list')
    .description('List V4 channel basic information')
    .option('--page-number <page>', 'page number', parseInteger)
    .option('--page-size <size>', 'page size', parseInteger)
    .option('--category-ids <ids>', 'category IDs, comma-separated', parseStringList)
    .option('--channel-ids <ids>', 'channel IDs, comma-separated', parseStringList)
    .option('--watch-status <status>', 'watch status filter')
    .option('--start-time <timestamp>', 'start timestamp', parseInteger)
    .option('--end-time <timestamp>', 'end timestamp', parseInteger)
    .option('--order-by <orderBy>', 'order by value')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiCommand(options, (service) => service.listAllChannelBasic(apiParams(options))));

  channelCmd.command('simple-list')
    .description('List V4 channel compact information')
    .option('--page-number <page>', 'page number', parseInteger)
    .option('--page-size <size>', 'page size', parseInteger)
    .option('--category-id <id>', 'category ID')
    .option('--watch-status <status>', 'watch status filter')
    .option('--keyword <keyword>', 'channel keyword')
    .option('--order-by <orderBy>', 'order by value')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiCommand(options, (service) => service.listChannelSimple(apiParams(options))));

  channelCmd.command('live-status-list')
    .description('Batch query V4 channel live status')
    .requiredOption('--channel-ids <ids>', 'channel IDs, comma-separated, max 200', parseStringList)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiCommand(options, (service) => service.listLiveStatus(apiParams(options))));

  channelCmd.command('batch-create')
    .description('Batch create V4 live channels')
    .requiredOption('--channels-json <json>', 'channels JSON array', parseJsonArray)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiWriteCommand(
      options,
      `Create ${options.channelsJson.length} channel(s)?`,
      (service) => service.createBatch(apiParams({
        ...options,
        channels: options.channelsJson,
        channelsJson: undefined,
      }))
    ));

  channelCmd.command('v4-update')
    .description('Update V4 channel basic information')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('--name <name>', 'channel name')
    .option('--publisher <publisher>', 'publisher name')
    .option('--channel-passwd <password>', 'channel password')
    .option('--start-time <timestamp>', 'start timestamp', parseInteger)
    .option('--end-time <timestamp>', 'end timestamp', parseInteger)
    .option('--cover-img <url>', 'cover image URL')
    .option('--splash-img <url>', 'splash image URL')
    .option('--desc <description>', 'channel description')
    .option('--publishing-region <region>', 'publishing region')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        ensureAtLeastOneOption(options, [
          'name',
          'publisher',
          'channelPasswd',
          'startTime',
          'endTime',
          'coverImg',
          'splashImg',
          'desc',
          'publishingRegion',
        ]);
        await runChannelApiWriteCommand(
          options,
          `Update V4 channel ${options.channelId}?`,
          (service) => service.updateV4(apiParams(options))
        );
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  channelCmd.command('create-init')
    .description('Create and initialize a V4 channel')
    .requiredOption('--basic-setting-json <json>', 'basicSetting JSON object', parseJsonObject)
    .option('--master-auth-setting-json <json>', 'masterAuthSetting JSON object', parseJsonObject)
    .option('--playback-setting-json <json>', 'playbackSetting JSON object', parseJsonObject)
    .option('--roles-json <json>', 'roles JSON array', parseJsonArray)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiWriteCommand(
      options,
      `Create initialized channel "${options.basicSettingJson?.name || ''}"?`,
      (service) => service.createInit(apiParams({
        ...options,
        basicSetting: options.basicSettingJson,
        masterAuthSetting: options.masterAuthSettingJson,
        playbackSetting: options.playbackSettingJson,
        roles: options.rolesJson,
        basicSettingJson: undefined,
        masterAuthSettingJson: undefined,
        playbackSettingJson: undefined,
        rolesJson: undefined,
      }))
    ));

  channelCmd.command('mr-create')
    .description('Create a V4 MR channel')
    .requiredOption('--name <name>', 'channel name')
    .option('--category-id <id>', 'category ID', parseInteger)
    .option('--start-time <timestamp>', 'start timestamp', parseInteger)
    .option('--channel-passwd <password>', 'channel password')
    .option('--assistant-passwd <password>', 'assistant password')
    .option('--splash-img <url>', 'splash image URL')
    .option('--sub-account <email>', 'sub account email')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiWriteCommand(
      options,
      `Create MR channel "${options.name}"?`,
      (service) => service.createMrChannel(apiParams(options))
    ));

  channelCmd.command('pull-bitrate-set')
    .description('Set V4 channel pull bitrate')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--pull-bit-rate <bitrate>', 'pull bitrate: -1,400,600,800,1000,1500,2000,2500', parseInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiWriteCommand(
      options,
      `Set pull bitrate for channel ${options.channelId}?`,
      (service) => service.setPullBitrate(apiParams(options))
    ));

  channelCmd.command('template-update')
    .description('Update V4 channel live template')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--template <template>', 'template value', validateTemplate)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiWriteCommand(
      options,
      `Update template for channel ${options.channelId}?`,
      (service) => service.updateTemplate(apiParams(options))
    ));

  const roleCmd = channelCmd.command('role').description('Manage historical channel role accounts');
  roleCmd.command('get')
    .description('Get one role account')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--account <account>', 'role account ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.getRoleAccount(options)));
  roleCmd.command('list')
    .description('List role accounts')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.listRoleAccounts(options)));
  roleCmd.command('batch-create')
    .description('Batch create role accounts')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--accounts-json <json>', 'accounts JSON array', parseJsonArray)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.batchCreateRoleAccounts({
      ...options,
      accounts: options.accountsJson
    })));
  roleCmd.command('delete')
    .description('Delete one role account')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--account <account>', 'role account ID')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.deleteRoleAccount(options)));
  roleCmd.command('account-create')
    .description('Create a V4 assistant or guest role account')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--role <role>', 'role, for example Assistant or Guest')
    .option('--actor <actor>', 'actor label')
    .option('--nick-name <name>', 'nickname')
    .option('--avatar <url>', 'avatar URL')
    .option('--passwd <password>', 'role account password')
    .option('--purview-list-json <json>', 'purviewList JSON array', parseJsonArray)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiWriteCommand(
      options,
      `Create ${options.role} account in channel ${options.channelId}?`,
      (service) => service.createAccount(apiParams({
        ...options,
        purviewList: options.purviewListJson,
        purviewListJson: undefined,
      }))
    ));
  roleCmd.command('account-update')
    .description('Update a V4 role account')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--account <account>', 'role account')
    .option('--actor <actor>', 'actor label')
    .option('--nick-name <name>', 'nickname')
    .option('--avatar <url>', 'avatar URL')
    .option('--passwd <password>', 'role account password')
    .option('--purview-list-json <json>', 'purviewList JSON array', parseJsonArray)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiWriteCommand(
      options,
      `Update role account ${options.account} in channel ${options.channelId}?`,
      (service) => service.updateAccountInfo(apiParams({
        ...options,
        purviewList: options.purviewListJson,
        purviewListJson: undefined,
      }))
    ));
  roleCmd.command('accounts-delete')
    .description('Batch delete V4 role accounts')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--accounts <accounts>', 'role accounts, comma-separated', parseStringList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiWriteCommand(
      options,
      `Delete ${options.accounts.length} role account(s) from channel ${options.channelId}?`,
      (service) => service.deleteAccountsBatch(apiParams(options))
    ));
  roleCmd.command('teacher-list')
    .description('Batch query V4 teacher information')
    .requiredOption('--channel-ids <ids>', 'channel IDs, comma-separated', parseStringList)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiCommand(options, (service) => service.teacherList(apiParams(options))));
  roleCmd.command('viewer-get')
    .description('Get V4 role-viewer display config')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiCommand(options, (service) => service.getAccountViewerConfig(apiParams(options))));
  roleCmd.command('viewer-update')
    .description('Update V4 role-viewer display config')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('--actor <actor>', 'actor title')
    .option('--actor-enabled <Y|N>', 'actor title switch', validateYnFlag)
    .option('--question-student-title <title>', 'question student title')
    .option('--question-student-title-enabled <Y|N>', 'question student title switch', validateYnFlag)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiWriteCommand(
      options,
      `Update role-viewer config for channel ${options.channelId}?`,
      (service) => service.updateAccountViewerConfig(apiParams(options))
    ));
  roleCmd.command('config-get')
    .description('Get V4 role config by role')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--role <role>', 'role')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiCommand(options, (service) => service.getByRole(apiParams(options))));
  roleCmd.command('config-update')
    .description('Update V4 role config by role')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--role <role>', 'role')
    .requiredOption('--config-json <json>', 'config JSON object', parseJsonObject)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiWriteCommand(
      options,
      `Update role config ${options.role} for channel ${options.channelId}?`,
      (service) => service.updateByRole(apiParams({
        ...options,
        config: options.configJson,
        configJson: undefined,
      }))
    ));

  const subtitleCmd = channelCmd.command('subtitle').description('Manage V4 realtime subtitle settings');
  subtitleCmd.command('config-get')
    .description('Get realtime subtitle config')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiCommand(options, (service) => service.getSubtitleConfig(apiParams(options))));
  subtitleCmd.command('languages')
    .description('List all realtime subtitle languages')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiCommand(options, (service) => service.listSubtitleLanguages()));
  subtitleCmd.command('config-update')
    .description('Update realtime subtitle config')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('--real-time-subtitle-enabled <Y|N>', 'realtime subtitle switch', validateYnFlag)
    .option('--real-time-subtitle-display-enabled <Y|N>', 'display realtime subtitle switch', validateYnFlag)
    .option('--source-language <code>', 'source language code')
    .option('--subtitle-translation-enabled <Y|N>', 'translation switch', validateYnFlag)
    .option('--translation-language <code>', 'single translation language')
    .option('--translation-languages <codes>', 'translation language codes, comma-separated', parseStringList)
    .option('--subtitle-callback-enabled <Y|N>', 'subtitle callback switch', validateYnFlag)
    .option('--subtitle-callback-url <url>', 'subtitle callback URL')
    .option('--real-time-subtitle-display-number-limit-enabled <Y|N>', 'display line limit switch', validateYnFlag)
    .option('--real-time-subtitle-display-number <number>', 'display line count', parseInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiWriteCommand(
      options,
      `Update subtitle config for channel ${options.channelId}?`,
      (service) => service.updateSubtitleConfig(apiParams(options))
    ));

  const distributeCmd = channelCmd.command('distribute').description('Manage V4 cloud distribution');
  distributeCmd.command('list')
    .description('List cloud distribution endpoints')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('--distribute-ids <ids>', 'distribution IDs, comma-separated')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiCommand(options, (service) => service.distributeList(apiParams(options))));
  distributeCmd.command('create-batch')
    .description('Batch create cloud distribution endpoints')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--distributes-json <json>', 'distributes JSON array', parseJsonArray)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiWriteCommand(
      options,
      `Create ${options.distributesJson.length} distribution endpoint(s) for channel ${options.channelId}?`,
      (service) => service.distributeCreateBatch(apiParams({
        ...options,
        distributes: options.distributesJson,
        distributesJson: undefined,
      }))
    ));
  distributeCmd.command('update-batch')
    .description('Batch update cloud distribution endpoints')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--distributes-json <json>', 'distributes JSON array', parseJsonArray)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiWriteCommand(
      options,
      `Update ${options.distributesJson.length} distribution endpoint(s) for channel ${options.channelId}?`,
      (service) => service.distributeUpdateBatch(apiParams({
        ...options,
        distributes: options.distributesJson,
        distributesJson: undefined,
      }))
    ));
  distributeCmd.command('delete-batch')
    .description('Batch delete cloud distribution endpoints')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--ids <ids>', 'distribution IDs, comma-separated', parseNumberList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiWriteCommand(
      options,
      `Delete ${options.ids.length} distribution endpoint(s) from channel ${options.channelId}?`,
      (service) => service.distributeDeleteBatch(apiParams(options))
    ));
  distributeCmd.command('statistic')
    .description('Get cloud distribution statistics')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('--session-ids <ids>', 'session IDs, comma-separated', parseStringList)
    .option('--start-time <timestamp>', 'start timestamp', parseInteger)
    .option('--end-time <timestamp>', 'end timestamp', parseInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiCommand(options, (service) => service.getDistributeStatistic(apiParams(options))));
  distributeCmd.command('master-switch')
    .description('Update cloud distribution master switch')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--enabled <Y|N>', 'master switch', validateYnFlag)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiWriteCommand(
      options,
      `Update distribution master switch for channel ${options.channelId}?`,
      (service) => service.updateMasterSwitch(apiParams(options))
    ));
  distributeCmd.command('switch')
    .description('Update one cloud distribution endpoint switch')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--distribute-id <id>', 'distribution ID', parseInteger)
    .requiredOption('--enabled <Y|N>', 'endpoint switch', validateYnFlag)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiWriteCommand(
      options,
      `Update distribution ${options.distributeId} switch for channel ${options.channelId}?`,
      (service) => service.updateSwitch(apiParams(options))
    ));

  channelCmd.command('advert-list')
    .description('List channel adverts')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.getChannelAdverts(options)));

  const callbackCmd = channelCmd.command('callback').description('Manage channel callback settings');
  callbackCmd.command('get')
    .description('Get channel callback settings')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.getCallbackSetting(options)));
  callbackCmd.command('update')
    .description('Update channel callback settings')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('--record-callback-url <url>', 'record callback URL')
    .option('--record-callback-video-type <type>', 'record callback video type')
    .option('--playback-callback-url <url>', 'playback callback URL')
    .option('--stream-callback-url <url>', 'stream callback URL')
    .option('--ppt-record-callback-url <url>', 'PPT record callback URL')
    .option('--live-scan-callback-url <url>', 'live scan callback URL')
    .option('--playback-cache-callback-url <url>', 'playback cache callback URL')
    .option('--subtitle-callback-url <url>', 'subtitle callback URL')
    .option('--live-violation-cutoff-callback-url <url>', 'live violation cutoff callback URL')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.updateCallbackSetting(options)));

  const pptRecordCmd = channelCmd.command('ppt-record').description('Manage PPT record remake tasks and settings');
  const pptRecordSettingCmd = pptRecordCmd.command('setting').description('Manage PPT record setting');
  pptRecordSettingCmd.command('get')
    .description('Get PPT record setting')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.getPptRecordSetting(options)));
  pptRecordSettingCmd.command('update')
    .description('Update PPT record setting')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('--global-setting-enabled <Y|N>', 'global setting enabled', validateYnFlag)
    .option('--type <type>', 'record layout type: 0|1|2', parseInteger)
    .option('--video-ratio <ratio>', 'camera ratio: 0|1', parseInteger)
    .option('--brand-img-file <pathOrUrl>', 'brand image file or URL')
    .option('--background-img-file <pathOrUrl>', 'background image file or URL')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.updatePptRecordSetting(options)));
  pptRecordCmd.command('list')
    .description('List PPT record tasks')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('--session-id <id>', 'session ID')
    .option('--status <status>', 'task status')
    .option('--start-time <time>', 'start time yyyyMMddHHmmss')
    .option('--end-time <time>', 'end time yyyyMMddHHmmss')
    .option('--page <page>', 'page number', parseInteger)
    .option('--page-size <size>', 'page size', parseInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.listPptRecordTasks(options)));
  pptRecordCmd.command('add-task')
    .description('Create a PPT record remake task')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--video-id <id>', 'playback video ID')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.addPptRecordTask(options)));
  pptRecordCmd.command('delete')
    .description('Delete PPT record tasks')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--task-ids <ids>', 'task IDs, comma-separated', parseStringList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.deletePptRecord(options)));

  channelCmd.command('copy')
    .description('Copy a channel')
    .requiredOption('--channel-id <id>', 'source channel ID')
    .option('--name <name>', 'new channel name')
    .option('--category-id <id>', 'category ID', parseInteger)
    .option('--start-time <timestamp>', 'start time timestamp', parseInteger)
    .option('--sub-account <account>', 'sub account')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.copyChannel(options)));

  channelCmd.command('children-list')
    .description('List channels owned by a child account')
    .requiredOption('--child-user-id <id>', 'child user ID')
    .option('--start-time <timestamp>', 'created start timestamp', parseInteger)
    .option('--end-time <timestamp>', 'created end timestamp', parseInteger)
    .option('--page-number <page>', 'page number', parseInteger, 1)
    .option('--page-size <size>', 'page size', parseInteger, 20)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.getUserChildrenChannels(options)));

  const tokenCmd = channelCmd.command('token').description('Manage channel historical tokens');
  tokenCmd.command('watch-api')
    .description('Get watch API token')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--viewer-id <id>', 'viewer ID')
    .option('--nickname <nickname>', 'viewer nickname')
    .option('--avatar <url>', 'viewer avatar')
    .option('--openid <openid>', 'WeChat OpenID')
    .option('--actor <actor>', 'viewer actor')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.getWatchApiToken(options)));
  tokenCmd.command('api')
    .description('Get channel API token')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--viewer-id <id>', 'viewer ID')
    .option('--nickname <nickname>', 'viewer nickname')
    .option('--avatar <url>', 'viewer avatar')
    .option('--openid <openid>', 'WeChat OpenID')
    .option('--actor <actor>', 'viewer actor')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.getApiToken(options)));
  tokenCmd.command('login-url')
    .description('Get passwordless role login URL')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('--account-id <id>', 'role account ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.getTokenLoginUrl(options)));
  tokenCmd.command('chat')
    .description('Get chat token')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--user-id <id>', 'viewer/user ID')
    .requiredOption('--role <role>', 'role: teacher|admin|guest|assistant|viewer', validateChatTokenRole)
    .option('--origin <origin>', 'watch origin')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.getChatToken(options)));
  tokenCmd.command('set')
    .description('Set one-time login token for a channel')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--token <token>', 'token')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.setChannelToken(options)));
  tokenCmd.command('set-account')
    .description('Set one-time login token for a sub-account channel')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--token <token>', 'token')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.setAccountToken(options)));

  const authCmd = channelCmd.command('auth').description('Manage channel auth tokens');
  authCmd.command('api-token')
    .description('Get a channel API access token')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('--disposable <true|false>', 'whether the token is disposable', parseBoolean)
    .option('--expire-seconds <seconds>', 'token expiration seconds', parseInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiCommand(
      options,
      (service) => service.getChannelApiAccessToken(apiParams(options))
    ));
  authCmd.command('test-mode-token')
    .description('Get a watch-page test mode token')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('--expire-time <seconds>', 'token validity seconds, max 30 days', parseInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelApiCommand(
      options,
      (service) => service.getTestModeToken(apiParams(options))
    ));

  const followCmd = channelCmd.command('follow').description('Manage follow-public-account settings');
  followCmd.command('list')
    .description('List channel follow settings')
    .requiredOption('--channel-ids <ids>', 'channel IDs, comma-separated', parseStringList)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.listChannelsFollow(options)));
  followCmd.command('update')
    .description('Update channel follow settings')
    .requiredOption('--channel-ids <ids>', 'channel IDs, comma-separated', parseStringList)
    .requiredOption('--qr-code-url <url>', 'QR code image URL')
    .option('--enabled <Y|N>', 'follow feature switch', validateYnFlag)
    .option('--auto-show-enabled <Y|N>', 'auto popup switch', validateYnFlag)
    .option('--entrance-text <text>', 'entry text')
    .option('--tips <text>', 'popup tips')
    .option('--pc-follow-tips <text>', 'PC popup tips')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.updateChannelsFollow(options)));

  channelCmd.command('submeeting-batch-add')
    .description('Batch save submeeting channels')
    .requiredOption('--channel-id <id>', 'main meeting channel ID')
    .requiredOption('--sub-channels-json <json>', 'sub channels JSON array', parseJsonArray)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.batchAddSubmeeting({
      ...options,
      subChannels: options.subChannelsJson
    })));

  channelCmd.command('questionnaire-stop')
    .description('Stop questionnaires for channels')
    .requiredOption('--channel-ids <ids>', 'channel IDs, comma-separated', parseStringList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.stopQuestionnaires(options)));

  channelCmd.command('danmu-batch-update')
    .description('Batch update channel danmu settings')
    .requiredOption('--channel-ids <ids>', 'channel IDs, comma-separated', parseStringList)
    .requiredOption('--close-danmu <Y|N>', 'Y closes danmu, N opens danmu', validateYnFlag)
    .requiredOption('--show-danmu-info-enabled <Y|N>', 'show danmu info enabled', validateYnFlag)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.batchUpdateDanmu(options)));

  channelCmd.command('max-viewer-set')
    .description('Set max viewer count')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--user-id <id>', 'user ID')
    .requiredOption('--max-viewer <count>', 'max viewer count', parseInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.setMaxViewer(options)));

  channelCmd.command('password-update')
    .description('Update channel password')
    .requiredOption('--user-id <id>', 'user ID')
    .requiredOption('--passwd <password>', 'new password')
    .option('--channel-id <id>', 'channel ID; omit to update all channels')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.updateChannelPassword(options)));

  channelCmd.command('marquee-url-set')
    .description('Set custom URL marquee protection')
    .requiredOption('--channel-id <id>', 'channel ID')
    .requiredOption('--marquee-restrict <Y|N>', 'marquee restriction switch', validateYnFlag)
    .option('--url <url>', 'marquee URL, required when switch is Y')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => runChannelViewerCommand((handler) => handler.setDiyUrlMarquee(options)));

  channelCmd.command('status-valid')
    .description('Check whether channel statuses are valid')
    .requiredOption('--channels <ids>', 'channel IDs, comma-separated, max 100')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(program.opts());
        const result = await new ChannelServiceSdk(authConfig, serviceConfig).checkChannelStatusValid(apiParams(options));
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  channelCmd.command('ccb-focus-reset')
    .description('Reset CCB focus channels')
    .option('--channel-ids <ids>', 'channel IDs, comma-separated; omit to clear focus')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        await confirmWrite(options.force, 'Reset CCB focus channels?');
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(program.opts());
        const params = apiParams(options);
        const result = await new ChannelServiceSdk(authConfig, serviceConfig).resetCcbFocus(params);
        console.log(JSON.stringify({ success: true, result }, null, 2));
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });
}

/**
 * Parses integer option values
 * @param value String value from CLI
 * @returns Parsed integer
 */
function parseInteger(value: string): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid number: ${value}`);
  }
  return parsed;
}

function parseBoolean(value: string): boolean {
  if (['true', '1', 'Y', 'y', 'yes'].includes(value)) return true;
  if (['false', '0', 'N', 'n', 'no'].includes(value)) return false;
  throw new Error(`Invalid boolean: ${value}. Must be true or false.`);
}

function ensureAtLeastOneOption(options: Record<string, unknown>, fields: string[]): void {
  const hasValue = fields.some((field) => options[field] !== undefined && options[field] !== null && options[field] !== '');
  if (!hasValue) {
    throw new Error(`At least one update option is required: ${fields.join(', ')}`);
  }
}

/**
 * Validates scene option values (V4 API)
 * @param value Scene value from CLI
 * @returns Validated scene
 */
function validateScene(value: string): 'topclass' | 'alone' | 'seminar' | 'train' | 'double' | 'guide' {
  const validScenes = ['topclass', 'alone', 'seminar', 'train', 'double', 'guide'] as const;
  if (!validScenes.includes(value as any)) {
    throw new Error(`Invalid scene type: ${value}. Must be one of: ${validScenes.join(', ')}`);
  }
  return value as 'topclass' | 'alone' | 'seminar' | 'train' | 'double' | 'guide';
}

/**
 * Validates template option values (V4 API)
 * @param value Template value from CLI
 * @returns Validated template
 */
function validateTemplate(value: string): 'ppt' | 'portrait_ppt' | 'alone' | 'portrait_alone' | 'topclass' | 'portrait_topclass' | 'seminar' {
  const validTemplates = ['ppt', 'portrait_ppt', 'alone', 'portrait_alone', 'topclass', 'portrait_topclass', 'seminar'] as const;
  if (!validTemplates.includes(value as any)) {
    throw new Error(`Invalid template: ${value}. Must be one of: ${validTemplates.join(', ')}`);
  }
  return value as 'ppt' | 'portrait_ppt' | 'alone' | 'portrait_alone' | 'topclass' | 'portrait_topclass' | 'seminar';
}

/**
 * Validates limit option values
 * @param value Limit value from CLI
 * @returns Validated limit
 */
function validateLimit(value: string): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid limit: ${value}. Must be a number.`);
  }
  if (parsed < 1 || parsed > 100) {
    throw new Error(`Invalid limit: ${value}. Must be between 1 and 100.`);
  }
  return parsed;
}

/**
 * Validates output format option values
 * @param value Output format value from CLI
 * @returns Validated output format
 */
function validateOutputFormat(value: string): 'table' | 'json' {
  const validFormats = ['table', 'json'] as const;
  if (!validFormats.includes(value as any)) {
    throw new Error(`Invalid output format: ${value}. Must be one of: ${validFormats.join(', ')}`);
  }
  return value as 'table' | 'json';
}

function validateChannelViewerScope(value: string): 'user' | 'teacher' {
  const validScopes = ['user', 'teacher'] as const;
  if (!validScopes.includes(value as any)) {
    throw new Error(`Invalid scope: ${value}. Must be one of: ${validScopes.join(', ')}`);
  }
  return value as 'user' | 'teacher';
}

function validateYnFlag(value: string): 'Y' | 'N' {
  if (value !== 'Y' && value !== 'N') {
    throw new Error('Invalid value. Must be Y or N');
  }
  return value;
}

function validateChatTokenRole(value: string): 'teacher' | 'admin' | 'guest' | 'assistant' | 'viewer' {
  const validRoles = ['teacher', 'admin', 'guest', 'assistant', 'viewer'] as const;
  if (!validRoles.includes(value as any)) {
    throw new Error(`Invalid role: ${value}. Must be one of: ${validRoles.join(', ')}`);
  }
  return value as 'teacher' | 'admin' | 'guest' | 'assistant' | 'viewer';
}

// Export validation functions for testing
export {
  parseInteger,
  validateScene,
  validateTemplate,
  validateLimit,
  validateOutputFormat,
  validateChannelViewerScope,
  validateYnFlag,
  validateChatTokenRole,
  parseBoolean,
  ensureAtLeastOneOption
};
