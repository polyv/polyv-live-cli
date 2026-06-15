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
import { AuthConfig } from '../types/auth';
import {
  PlatformGetOptions,
  PlatformSwitchGetOptions,
  PlatformSwitchUpdateOptions,
  PlatformCallbackGetOptions,
  PlatformCallbackUpdateOptions,
  PlatformSettingGetOptions,
  PlatformSettingUpdateOptions,
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
