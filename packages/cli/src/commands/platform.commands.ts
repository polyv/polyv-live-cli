/**
 * @fileoverview Platform command definitions for CLI
 * @author Development Team
 * @since 13.1.0
 */

import { Command } from 'commander';
import { PlatformHandler } from '../handlers/platform.handler';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { confirmDeletion } from '../utils/confirmation';
import { AuthConfig } from '../types/auth';
import {
  PlatformGetOptions,
  PlatformSwitchGetOptions,
  PlatformSwitchUpdateOptions,
  PlatformCallbackGetOptions,
  PlatformCallbackUpdateOptions,
  PlatformSettingGetOptions,
  PlatformSettingUpdateOptions,
  PlatformAnchorCreateOptions,
  PlatformAnchorGetOptions,
  PlatformAnchorRelationOptions,
  PlatformAnchorUpdateOptions,
  PlatformAnchorUpdateStatusOptions,
  PlatformContentGroupListOptions,
  PlatformCouponStatusBatchOptions,
  PlatformCouponUpdateOptions,
  PlatformCouponViewerListOptions,
  PlatformListAnchorsOptions,
  PlatformServiceConfig,
  VALID_SWITCH_PARAMS,
} from '../types/platform';

/** Default timeout in milliseconds */
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Load and prepare authentication and service configuration
 * @internal Exported for testing purposes
 */
export async function loadAuthAndServiceConfig(parentOptions: Record<string, unknown>): Promise<{
  authConfig: AuthConfig;
  serviceConfig: PlatformServiceConfig;
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

  const serviceConfig: PlatformServiceConfig = {
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
 * Validate enabled value (Y or N)
 * @param value Enabled value string
 * @returns Validated enabled value
 * @throws Error if value is invalid
 */
export function validateEnabledValue(value: string): 'Y' | 'N' {
  if (value !== 'Y' && value !== 'N') {
    throw new Error('enabled 必须是 Y 或 N');
  }
  return value;
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
 * Validate URL format for callback
 * @param value URL string
 * @returns Validated URL
 * @throws Error if URL format is invalid
 */
export function validateUrlFormat(value: string): string {
  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    throw new Error('url 必须以 http:// 或 https:// 开头');
  }
  return value;
}

function parsePositiveInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('value must be a positive integer');
  }
  return parsed;
}

function parseNonNegativeInteger(value: string): 0 | 1 {
  const parsed = Number(value);
  if (parsed !== 0 && parsed !== 1) {
    throw new Error('value must be 0 or 1');
  }
  return parsed as 0 | 1;
}

function parseTimestamp(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('timestamp must be a positive number');
  }
  return parsed;
}

function parseIdList(value: string): number[] {
  const ids = value.split(',').map(item => Number(item.trim())).filter(Number.isFinite);
  if (ids.length === 0 || ids.some(id => !Number.isInteger(id) || id <= 0)) {
    throw new Error('ids must be positive integers separated by comma');
  }
  return ids;
}

function parseStringList(value: string): string[] {
  const ids = value.split(',').map(item => item.trim()).filter(Boolean);
  if (ids.length === 0) {
    throw new Error('ids must not be empty');
  }
  return ids;
}

function parseJsonObject(value: string): Record<string, unknown> {
  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('config must be a JSON object');
  }
  return parsed as Record<string, unknown>;
}

function validateSex(value: string): 'M' | 'W' {
  if (value !== 'M' && value !== 'W') {
    throw new Error('sex must be M or W');
  }
  return value;
}

function validateContentGroupType(value: string): 'script' | 'robot' {
  if (value !== 'script' && value !== 'robot') {
    throw new Error('type must be script or robot');
  }
  return value;
}

function validateReceiveSource(value: string): 'CHANNEL' | 'AGGREGATE_PAGE' {
  if (value !== 'CHANNEL' && value !== 'AGGREGATE_PAGE') {
    throw new Error('receive-source must be CHANNEL or AGGREGATE_PAGE');
  }
  return value;
}

async function confirmPlatformWrite(force: boolean | undefined, message: string): Promise<void> {
  if (force) return;
  const confirmed = await confirmDeletion(message);
  if (!confirmed) {
    throw new Error('Operation cancelled.');
  }
}

/**
 * Registers platform-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerPlatformCommands(program: Command): void {
  // Create platform command group
  const platformCmd = program.command('platform');
  platformCmd.description('Platform account info management commands (平台账号信息管理)');

  // ========================================
  // platform get - 获取账号基本信息
  // ========================================
  const getCmd = platformCmd
    .command('get')
    .description('Get account info (获取账号信息)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create platform handler instance
        const platformHandler = new PlatformHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const getOptions: PlatformGetOptions = {
          output: options.output,
        };

        // Execute get account info
        await platformHandler.getAccountInfo(getOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for platform get command
  getCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli platform get
  $ polyv-live-cli platform get -o json

Output Formats:
  table  - Formatted table output (default)
  json   - JSON format for programmatic use
`);

  // ========================================
  // platform switch - 开关配置命令组
  // ========================================
  const switchCmd = platformCmd.command('switch');
  switchCmd.description('Switch configuration management (开关配置管理)');

  // ========================================
  // platform switch get - 获取开关配置
  // ========================================
  const switchGetCmd = switchCmd
    .command('get')
    .description('Get switch configuration (获取开关配置)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create platform handler instance
        const platformHandler = new PlatformHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const getOptions: PlatformSwitchGetOptions = {
          output: options.output,
        };

        // Execute get switch config
        await platformHandler.getSwitchConfig(getOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for platform switch get command
  switchGetCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli platform switch get
  $ polyv-live-cli platform switch get -o json

Output Formats:
  table  - Formatted table output (default)
  json   - JSON format for programmatic use
`);

  // ========================================
  // platform switch update - 更新开关配置
  // ========================================
  const switchUpdateCmd = switchCmd
    .command('update')
    .description('Update switch configuration (更新开关配置)')
    .requiredOption('--param <name>', `switch parameter name (${VALID_SWITCH_PARAMS.join('|')})`)
    .requiredOption('--enabled <value>', 'enable status (Y|N)', validateEnabledValue)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create platform handler instance
        const platformHandler = new PlatformHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const updateOptions: PlatformSwitchUpdateOptions = {
          param: options.param,
          enabled: options.enabled,
          output: options.output,
        };

        await confirmPlatformWrite(options.force, `Update platform switch ${options.param}?`);

        // Execute update switch config
        await platformHandler.updateSwitchConfig(updateOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for platform switch update command
  switchUpdateCmd.addHelpText('after', `
Examples:
  # Enable authentication
  $ polyv-live-cli platform switch update --param authEnabled --enabled Y

  # Disable recording
  $ polyv-live-cli platform switch update --param recordEnabled --enabled N

  # JSON output
  $ polyv-live-cli platform switch update --param authEnabled --enabled Y -o json

Available Parameters:
  globalSettingEnabled  - Global settings switch (全局设置开关)
  authEnabled           - Authentication switch (认证开关)
  recordEnabled         - Recording switch (录制开关)
  playbackEnabled       - Playback switch (回放开关)
  danmuEnabled          - Danmu (bullet screen) switch (弹幕开关)

Enable Values:
  Y  - Enable the switch
  N  - Disable the switch
`);

  // ========================================
  // platform callback - 回调设置命令组
  // ========================================
  const callbackCmd = platformCmd.command('callback');
  callbackCmd.description('Callback settings management (回调设置管理)');

  // ========================================
  // platform callback get - 获取回调设置
  // ========================================
  const callbackGetCmd = callbackCmd
    .command('get')
    .description('Get callback settings (获取回调设置)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create platform handler instance
        const platformHandler = new PlatformHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const getOptions: PlatformCallbackGetOptions = {
          output: options.output,
        };

        // Execute get callback settings
        await platformHandler.getCallbackSettings(getOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for platform callback get command
  callbackGetCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli platform callback get
  $ polyv-live-cli platform callback get -o json

Output Formats:
  table  - Formatted table output (default)
  json   - JSON format for programmatic use
`);

  // ========================================
  // platform callback update - 更新回调设置
  // ========================================
  const callbackUpdateCmd = callbackCmd
    .command('update')
    .description('Update callback settings (更新回调设置)')
    .option('--url <url>', 'callback URL (must start with http:// or https://)', validateUrlFormat)
    .option('--enabled <value>', 'enable status (Y|N)', validateEnabledValue)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create platform handler instance
        const platformHandler = new PlatformHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const updateOptions: PlatformCallbackUpdateOptions = {
          url: options.url,
          enabled: options.enabled,
          output: options.output,
        };

        await confirmPlatformWrite(options.force, 'Update platform callback settings?');

        // Execute update callback settings
        await platformHandler.updateCallbackSettings(updateOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for platform callback update command
  callbackUpdateCmd.addHelpText('after', `
Examples:
  # Update callback URL
  $ polyv-live-cli platform callback update --url https://example.com/callback

  # Enable/disable callback
  $ polyv-live-cli platform callback update --enabled Y
  $ polyv-live-cli platform callback update --enabled N

  # Combined update
  $ polyv-live-cli platform callback update --url https://example.com/new-callback --enabled Y

  # JSON output
  $ polyv-live-cli platform callback update --url https://example.com/callback -o json

URL Format:
  URL must start with http:// or https://

Enable Values:
  Y  - Enable callback
  N  - Disable callback

Note:
  At least one parameter (--url or --enabled) must be provided
`);

  // ========================================
  // Story 13-3: Global Settings Commands
  // ========================================

  // ========================================
  // platform setting - 全局设置命令组
  // ========================================
  const settingCmd = platformCmd.command('setting');
settingCmd.description('Global channel settings management (全局频道设置管理)');

// ========================================
// platform setting get - 获取全局设置
// ========================================
const settingGetCmd = settingCmd
  .command('get')
  .description('Get global channel settings (获取全局频道设置)')
  .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
  .action(async (options) => {
    try {
      // Load authentication and service configuration
      const parentOptions = program.opts();
      const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

      // Create platform handler instance
      const platformHandler = new PlatformHandler(authConfig, serviceConfig);

      // Transform commander options to handler options
      const getOptions: PlatformSettingGetOptions = {
        output: options.output,
      };

      // Execute get global settings
      await platformHandler.getGlobalSettings(getOptions);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  });

// Add help text for platform setting get command
settingGetCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli platform setting get
  $ polyv-live-cli platform setting get -o json

Output Formats:
  table  - Formatted table output (default)
  json   - JSON format for programmatic use
`);

// ========================================
// platform setting update - 更新全局设置
// ========================================
const settingUpdateCmd = settingCmd
  .command('update')
  .description('Update global channel settings (更新全局频道设置)')
  .option('--channel-concurrences-enabled <value>', 'enable max concurrent viewers (Y|N)', validateGlobalSettingEnabledValue)
  .option('--timely-convert-enabled <value>', 'enable auto convert (Y|N)', validateGlobalSettingEnabledValue)
  .option('--donate-enabled <value>', 'enable donation (Y|N)', validateGlobalSettingEnabledValue)
  .option('--rebirth-auto-upload-enabled <value>', 'enable rebirth auto upload (Y|N)', validateGlobalSettingEnabledValue)
  .option('--rebirth-auto-convert-enabled <value>', 'enable rebirth auto convert (Y|N)', validateGlobalSettingEnabledValue)
  .option('--ppt-covered-enabled <value>', 'enable PPT full screen (Y|N)', validateGlobalSettingEnabledValue)
  .option('--cover-img-type <value>', 'cover image type (contain|cover)', validateCoverImgType)
  .option('--test-mode-button-enabled <value>', 'enable test mode button (Y|N)', validateGlobalSettingEnabledValue)
  .option('-f, --force', 'skip confirmation prompt')
  .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
  .action(async (options) => {
    try {
      // Load authentication and service configuration
      const parentOptions = program.opts();
      const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

      // Create platform handler instance
      const platformHandler = new PlatformHandler(authConfig, serviceConfig);

      // Transform commander options to handler options
      const updateOptions: PlatformSettingUpdateOptions = {
        channelConcurrencesEnabled: options.channelConcurrencesEnabled,
        timelyConvertEnabled: options.timelyConvertEnabled,
        donateEnabled: options.donateEnabled,
        rebirthAutoUploadEnabled: options.rebirthAutoUploadEnabled,
        rebirthAutoConvertEnabled: options.rebirthAutoConvertEnabled,
        pptCoveredEnabled: options.pptCoveredEnabled,
        coverImgType: options.coverImgType,
        testModeButtonEnabled: options.testModeButtonEnabled,
        output: options.output,
      };

      await confirmPlatformWrite(options.force, 'Update global channel settings?');

      // Execute update global settings
      await platformHandler.updateGlobalSettings(updateOptions);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  });

// Add help text for platform setting update command
settingUpdateCmd.addHelpText('after', `
Examples:
  # Update single setting
  $ polyv-live-cli platform setting update --channel-concurrences-enabled Y
  $ polyv-live-cli platform setting update --donate-enabled N
  $ polyv-live-cli platform setting update --cover-img-type contain

  # Update multiple settings
  $ polyv-live-cli platform setting update \\
    --channel-concurrences-enabled Y \\
    --timely-convert-enabled Y \\
    --donate-enabled N \\
    --cover-img-type contain

  # JSON output
  $ polyv-live-cli platform setting update --donate-enabled Y -o json

Boolean Parameters:
  Y  - Enable the setting
  N  - Disable the setting

Cover Image Types:
  contain  - Contain mode
  cover    - Cover mode

Note:
  At least one parameter must be provided
`);

  const anchorCmd = platformCmd
    .command('anchor')
    .description('Anchor management (主播管理)');

  anchorCmd
    .command('list')
    .description('List anchors')
    .option('--page <page>', 'page number', parsePositiveInteger)
    .option('--page-size <size>', 'page size', parsePositiveInteger)
    .option('--status <status>', 'status (0|1)', parseNonNegativeInteger)
    .option('--sex <sex>', 'sex (M|W)', validateSex)
    .option('--nickname <nickname>', 'nickname keyword')
    .option('--start-time <timestamp>', 'start timestamp', parseTimestamp)
    .option('--end-time <timestamp>', 'end timestamp', parseTimestamp)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
        const platformHandler = new PlatformHandler(authConfig, serviceConfig);
        const listOptions: PlatformListAnchorsOptions = {
          pageNumber: options.page,
          pageSize: options.pageSize,
          status: options.status,
          sex: options.sex,
          nickname: options.nickname,
          startTime: options.startTime,
          endTime: options.endTime,
          output: options.output,
        };
        await platformHandler.listAnchors(listOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  anchorCmd
    .command('get')
    .description('Get anchor detail')
    .requiredOption('--anchor-id <id>', 'anchor ID', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
        const platformHandler = new PlatformHandler(authConfig, serviceConfig);
        const getOptions: PlatformAnchorGetOptions = {
          anchorId: options.anchorId,
          output: options.output,
        };
        await platformHandler.getAnchor(getOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  anchorCmd
    .command('create')
    .description('Create anchor')
    .requiredOption('--nickname <nickname>', 'anchor nickname')
    .requiredOption('--sex <sex>', 'sex (M|W)', validateSex)
    .requiredOption('--avatar <url>', 'avatar URL')
    .option('--description <text>', 'description')
    .option('--add-channel-ids <ids>', 'channel IDs to associate, comma-separated', parseIdList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
        const platformHandler = new PlatformHandler(authConfig, serviceConfig);
        const createOptions: PlatformAnchorCreateOptions = {
          nickname: options.nickname,
          sex: options.sex,
          avatar: options.avatar,
          description: options.description,
          addChannelIds: options.addChannelIds,
          force: options.force,
          output: options.output,
        };
        await platformHandler.createAnchor(createOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  anchorCmd
    .command('update')
    .description('Update anchor')
    .requiredOption('--anchor-id <id>', 'anchor ID', parsePositiveInteger)
    .option('--nickname <nickname>', 'anchor nickname')
    .option('--sex <sex>', 'sex (M|W)', validateSex)
    .option('--avatar <url>', 'avatar URL')
    .option('--description <text>', 'description')
    .option('--add-channel-ids <ids>', 'channel IDs to add, comma-separated', parseIdList)
    .option('--del-channel-ids <ids>', 'channel IDs to remove, comma-separated', parseIdList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
        const platformHandler = new PlatformHandler(authConfig, serviceConfig);
        const updateOptions: PlatformAnchorUpdateOptions = {
          anchorId: options.anchorId,
          nickname: options.nickname,
          sex: options.sex,
          avatar: options.avatar,
          description: options.description,
          addChannelIds: options.addChannelIds,
          delChannelIds: options.delChannelIds,
          force: options.force,
          output: options.output,
        };
        await platformHandler.updateAnchor(updateOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  anchorCmd
    .command('update-status')
    .description('Update anchor status')
    .requiredOption('--anchor-id <id>', 'anchor ID', parsePositiveInteger)
    .requiredOption('--status <status>', 'status (0|1)', parseNonNegativeInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
        const platformHandler = new PlatformHandler(authConfig, serviceConfig);
        const updateOptions: PlatformAnchorUpdateStatusOptions = {
          anchorId: options.anchorId,
          status: options.status,
          force: options.force,
          output: options.output,
        };
        await platformHandler.updateAnchorStatus(updateOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  anchorCmd
    .command('relation-list')
    .description('List channels related to an anchor')
    .requiredOption('--anchor-id <id>', 'anchor ID', parsePositiveInteger)
    .option('--page <page>', 'page number', parsePositiveInteger)
    .option('--page-size <size>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
        const platformHandler = new PlatformHandler(authConfig, serviceConfig);
        const relationOptions: PlatformAnchorRelationOptions = {
          anchorId: options.anchorId,
          pageNumber: options.page,
          pageSize: options.pageSize,
          output: options.output,
        };
        await platformHandler.listAnchorRelations(relationOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  anchorCmd
    .command('unrelation-list')
    .description('List channels not related to an anchor')
    .requiredOption('--anchor-id <id>', 'anchor ID', parsePositiveInteger)
    .option('--page <page>', 'page number', parsePositiveInteger)
    .option('--page-size <size>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
        const platformHandler = new PlatformHandler(authConfig, serviceConfig);
        const relationOptions: PlatformAnchorRelationOptions = {
          anchorId: options.anchorId,
          pageNumber: options.page,
          pageSize: options.pageSize,
          output: options.output,
        };
        await platformHandler.listAnchorUnrelations(relationOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  const contentGroupCmd = platformCmd
    .command('content-group')
    .description('Content group management');

  contentGroupCmd
    .command('list')
    .description('List content groups')
    .requiredOption('--type <type>', 'content type (script|robot)', validateContentGroupType)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
        const platformHandler = new PlatformHandler(authConfig, serviceConfig);
        const listOptions: PlatformContentGroupListOptions = {
          type: options.type,
          output: options.output,
        };
        await platformHandler.listContentGroups(listOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  const couponCmd = platformCmd
    .command('coupon')
    .description('Platform coupon operations');

  couponCmd
    .command('viewer-list')
    .description('List viewers that received a coupon')
    .requiredOption('--coupon-id <id>', 'coupon ID')
    .option('--page <page>', 'page number', parsePositiveInteger)
    .option('--page-size <size>', 'page size', parsePositiveInteger)
    .option('--keyword <keyword>', 'viewer keyword')
    .option('--receive-source <source>', 'receive source (CHANNEL|AGGREGATE_PAGE)', validateReceiveSource)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
        const platformHandler = new PlatformHandler(authConfig, serviceConfig);
        const listOptions: PlatformCouponViewerListOptions = {
          couponId: options.couponId,
          pageNumber: options.page,
          pageSize: options.pageSize,
          keyword: options.keyword,
          receiveSource: options.receiveSource,
          output: options.output,
        };
        await platformHandler.listCouponViewers(listOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  couponCmd
    .command('update')
    .description('Update coupon fields from a JSON object')
    .requiredOption('--coupon-id <id>', 'coupon ID')
    .requiredOption('--config <json>', 'coupon update JSON object', parseJsonObject)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
        const platformHandler = new PlatformHandler(authConfig, serviceConfig);
        const updateOptions: PlatformCouponUpdateOptions = {
          couponId: options.couponId,
          config: options.config,
          force: options.force,
          output: options.output,
        };
        await platformHandler.updateCoupon(updateOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  couponCmd
    .command('status-batch')
    .description('Batch update coupon status')
    .requiredOption('--coupon-ids <ids>', 'coupon IDs, comma-separated', parseStringList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
        const platformHandler = new PlatformHandler(authConfig, serviceConfig);
        const updateOptions: PlatformCouponStatusBatchOptions = {
          couponIds: options.couponIds,
          force: options.force,
          output: options.output,
        };
        await platformHandler.updateCouponsStatusBatch(updateOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });
}

// ========================================
// Helper validation functions for Story 13-3
// ========================================

/**
 * Validation function for Y/N values in global settings
 */
function validateGlobalSettingEnabledValue(value: string): 'Y' | 'N' {
  if (value !== 'Y' && value !== 'N') {
    throw new Error('参数值必须是 Y 或 N');
  }
  return value;
}

/**
 * Validation function for cover image type
 */
function validateCoverImgType(value: string): 'contain' | 'cover' {
  if (value !== 'contain' && value !== 'cover') {
    throw new Error('cover-img-type 必须是 contain 或 cover');
  }
  return value;
}
