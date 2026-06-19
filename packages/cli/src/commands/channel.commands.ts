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
import { apiParams, confirmWrite } from '../utils/api-command';

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

// Export validation functions for testing
export {
  parseInteger,
  validateScene,
  validateTemplate,
  validateLimit,
  validateOutputFormat
};
