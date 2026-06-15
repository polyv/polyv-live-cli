/**
 * @fileoverview Record settings command definitions for CLI
 * @author Development Team
 * @since 9.7.0
 */

import { Command } from 'commander';
import {
  RecordServiceConfig,
  RecordSettingGetOptions,
  RecordSettingSetOptions,
  RecordConvertOptions,
  RecordSetDefaultOptions,
} from '../types/record';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';

/**
 * Load and prepare authentication and service configuration
 */
async function loadAuthAndServiceConfig(parentOptions: any): Promise<{
  authConfig: AuthConfig;
  serviceConfig: RecordServiceConfig;
  isVerbose: boolean;
  authSource?: string;
  accountName?: string;
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

  // Create service configuration
  const serviceConfig: RecordServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug
  };

  // Display authentication source information if verbose
  const isVerbose = !!parentOptions.verbose;
  if (isVerbose) {
    console.log(`🔐 Authentication Source: ${authResult.source}`);
    if (authResult.accountName) {
      console.log(`👤 Account: ${authResult.accountName}`);
    }
    console.log('');
  }

  const result: {
    authConfig: AuthConfig;
    serviceConfig: RecordServiceConfig;
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
 * Validate output format
 * @param value Output format string
 * @returns Validated output format
 * @throws Error if format is invalid
 */
export function validateOutputFormat(value: string): 'table' | 'json' {
  if (!['table', 'json'].includes(value)) {
    throw new Error('Output format must be either "table" or "json"');
  }
  return value as 'table' | 'json';
}

/**
 * Validate Y/N option
 * @param value Y/N string
 * @returns Validated Y/N
 * @throws Error if value is invalid
 */
export function validateYN(value: string): 'Y' | 'N' {
  const upper = value.toUpperCase();
  if (!['Y', 'N'].includes(upper)) {
    throw new Error('Value must be either "Y" or "N"');
  }
  return upper as 'Y' | 'N';
}

/**
 * Validate playback type
 * @param value Playback type string
 * @returns Validated playback type
 * @throws Error if type is invalid
 */
export function validatePlaybackType(value: string): 'single' | 'list' {
  if (!['single', 'list'].includes(value)) {
    throw new Error('Playback type must be either "single" or "list"');
  }
  return value as 'single' | 'list';
}

/**
 * Validate playback origin
 * @param value Playback origin string
 * @returns Validated playback origin
 * @throws Error if origin is invalid
 */
export function validatePlaybackOrigin(value: string): 'record' | 'playback' | 'vod' | 'material' {
  if (!['record', 'playback', 'vod', 'material'].includes(value)) {
    throw new Error('Playback origin must be one of: record, playback, vod, material');
  }
  return value as 'record' | 'playback' | 'vod' | 'material';
}

/**
 * Validate list type
 * @param value List type string
 * @returns Validated list type
 * @throws Error if type is invalid
 */
export function validateListType(value: string): 'playback' | 'vod' {
  if (!['playback', 'vod'].includes(value)) {
    throw new Error('List type must be either "playback" or "vod"');
  }
  return value as 'playback' | 'vod';
}

/**
 * Registers record-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerRecordCommands(program: Command): void {
  // Create record command group
  const recordCmd = program.command('record');
  recordCmd.description('录制设置管理命令');

  // Create setting subcommand group
  const settingCmd = recordCmd.command('setting');
  settingCmd.description('回放设置管理');

  // record setting get command
  const settingGetCmd = settingCmd
    .command('get')
    .description(`获取频道回放设置

Examples:
  $ polyv-live-cli record setting get -c "2588188"
  $ polyv-live-cli record setting get -c "2588188" -o json`)
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async function(this: Command, options) {
      try {
        // Load authentication and service configuration
        const parentOptions = this.optsWithGlobals();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Dynamically import to allow mocking in tests
        const { RecordHandler } = await import('../handlers/record.handler');

        // Create record handler instance
        const recordHandler = new RecordHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const getOptions: RecordSettingGetOptions = {
          channelId: options.channelId,
          output: options.output
        };

        // Execute get playback setting
        await recordHandler.getPlaybackSetting(getOptions);

      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for record setting get command
  settingGetCmd.addHelpText('after', `
Examples:
  # 获取频道回放设置
  $ polyv-live-cli record setting get -c "2588188"

  # JSON格式输出
  $ polyv-live-cli record setting get -c "2588188" -o json

Options:
  -c, --channel-id    频道ID (必填)
  -o, --output        输出格式: table 或 json，默认为table
`);

  // record setting set command
  const settingSetCmd = settingCmd
    .command('set')
    .description(`设置频道回放设置

Examples:
  $ polyv-live-cli record setting set -c "2588188" --playback-enabled Y
  $ polyv-live-cli record setting set -c "2588188" --playback-enabled Y --type single --origin playback --video-id "73801f70c8"
  $ polyv-live-cli record setting set -c "2588188" --playback-enabled Y --playback-multiplier-enabled Y`)
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .option('--playback-enabled <value>', '回放开关 (Y|N)', validateYN)
    .option('--type <type>', '回放方式 (single|list)', validatePlaybackType)
    .option('--origin <origin>', '回放来源 (record|playback|vod|material)', validatePlaybackOrigin)
    .option('--video-id <videoId>', '回放的视频ID')
    .option('--playback-multiplier-enabled <value>', '倍数播放开关 (Y|N)', validateYN)
    .option('--playback-progress-bar-enabled <value>', '进度条开关 (Y|N)', validateYN)
    .option('--chat-playback-enabled <value>', '聊天互动重现开关 (Y|N)', validateYN)
    .option('--product-playback-enabled <value>', '商品库开关 (Y|N)', validateYN)
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async function(this: Command, options) {
      try {
        // Load authentication and service configuration
        const parentOptions = this.optsWithGlobals();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Dynamically import to allow mocking in tests
        const { RecordHandler } = await import('../handlers/record.handler');

        // Create record handler instance
        const recordHandler = new RecordHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const setOptions: RecordSettingSetOptions = {
          channelId: options.channelId,
          output: options.output
        };

        // Add optional fields if provided
        if (options.playbackEnabled !== undefined) setOptions.playbackEnabled = options.playbackEnabled;
        if (options.type !== undefined) setOptions.type = options.type;
        if (options.origin !== undefined) setOptions.origin = options.origin;
        if (options.videoId !== undefined) setOptions.videoId = options.videoId;
        if (options.playbackMultiplierEnabled !== undefined) setOptions.playbackMultiplierEnabled = options.playbackMultiplierEnabled;
        if (options.playbackProgressBarEnabled !== undefined) setOptions.playbackProgressBarEnabled = options.playbackProgressBarEnabled;
        if (options.chatPlaybackEnabled !== undefined) setOptions.chatPlaybackEnabled = options.chatPlaybackEnabled;
        if (options.productPlaybackEnabled !== undefined) setOptions.productPlaybackEnabled = options.productPlaybackEnabled;

        // Execute set playback setting
        await recordHandler.setPlaybackSetting(setOptions);

      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for record setting set command
  settingSetCmd.addHelpText('after', `
Examples:
  # 开启回放
  $ polyv-live-cli record setting set -c "2588188" --playback-enabled Y

  # 设置单个回放方式，指定视频
  $ polyv-live-cli record setting set -c "2588188" --playback-enabled Y --type single --origin playback --video-id "73801f70c8"

  # 开启倍数播放
  $ polyv-live-cli record setting set -c "2588188" --playback-enabled Y --playback-multiplier-enabled Y

Options:
  -c, --channel-id                    频道ID (必填)
  --playback-enabled                  回放开关: Y(开启) 或 N(关闭)
  --type                              回放方式: single(单个回放) 或 list(列表回放)
  --origin                            回放来源: record(录制文件), playback(回放列表), vod(点播列表), material(素材库)
  --video-id                          回放的视频ID
  --playback-multiplier-enabled       倍数播放开关: Y 或 N
  --playback-progress-bar-enabled     进度条开关: Y 或 N
  --chat-playback-enabled             聊天互动重现开关: Y 或 N
  --product-playback-enabled          商品库开关: Y 或 N
  -o, --output                        输出格式: table 或 json，默认为table
`);

  // record convert command
  const convertCmd = recordCmd
    .command('convert')
    .description(`转存录制文件到点播

Examples:
  $ polyv-live-cli record convert -c "2588188" --session-id "fvlyin8qz3" --file-name "测试转存"
  $ polyv-live-cli record convert -c "2588188" --session-id "fvlyin8qz3" --file-name "测试转存" --to-play-list Y --set-as-default Y
  $ polyv-live-cli record convert -c "2588188" --session-id "fvlyin8qz3" --file-name "测试转存" --async`)
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--file-name <fileName>', '转存后的点播视频名称')
    .option('--session-id <sessionId>', '直播场次ID')
    .option('--to-play-list <value>', '是否存放到回放列表 (Y|N)', validateYN)
    .option('--set-as-default <value>', '是否设为默认回放视频 (Y|N)', validateYN)
    .option('--async', '使用异步转存模式', false)
    .option('--callback-url <url>', '转存完成后的回调URL（异步模式）')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async function(this: Command, options) {
      try {
        // Load authentication and service configuration
        const parentOptions = this.optsWithGlobals();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Dynamically import to allow mocking in tests
        const { RecordHandler } = await import('../handlers/record.handler');

        // Create record handler instance
        const recordHandler = new RecordHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const convertOptions: RecordConvertOptions = {
          channelId: options.channelId,
          fileName: options.fileName,
          async: options.async,
          output: options.output
        };

        // Add optional fields if provided
        if (options.sessionId !== undefined) convertOptions.sessionId = options.sessionId;
        if (options.toPlayList !== undefined) convertOptions.toPlayList = options.toPlayList;
        if (options.setAsDefault !== undefined) convertOptions.setAsDefault = options.setAsDefault;
        if (options.callbackUrl !== undefined) convertOptions.callbackUrl = options.callbackUrl;

        // Execute convert
        await recordHandler.recordConvert(convertOptions);

      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for record convert command
  convertCmd.addHelpText('after', `
Examples:
  # 同步转存录制文件到点播
  $ polyv-live-cli record convert -c "2588188" --session-id "fvlyin8qz3" --file-name "测试转存"

  # 转存并添加到回放列表、设为默认回放
  $ polyv-live-cli record convert -c "2588188" --session-id "fvlyin8qz3" --file-name "测试转存" --to-play-list Y --set-as-default Y

  # 异步转存模式
  $ polyv-live-cli record convert -c "2588188" --session-id "fvlyin8qz3" --file-name "测试转存" --async

Options:
  -c, --channel-id      频道ID (必填)
  --file-name           转存后的点播视频名称 (必填)
  --session-id          直播场次ID
  --to-play-list        是否存放到回放列表: Y 或 N
  --set-as-default      是否设为默认回放视频: Y 或 N
  --async               使用异步转存模式
  --callback-url        转存完成后的回调URL（异步模式）
  -o, --output          输出格式: table 或 json，默认为table

Notes:
  - 同一个POLYV账号，调用该接口的间隔至少5分钟
  - 同步模式会等待转存完成后返回视频ID
  - 异步模式会立即返回，转存完成后可在点播后台查看
`);

  // record set-default command
  const setDefaultCmd = recordCmd
    .command('set-default')
    .description(`设置默认回放视频

Examples:
  $ polyv-live-cli record set-default -c "2588188" --video-id "73801f70c8"
  $ polyv-live-cli record set-default -c "2588188" --video-id "73801f70c8" --list-type playback -o json`)
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--video-id <videoId>', '视频ID')
    .option('--list-type <type>', '视频列表类型 (playback|vod)', validateListType)
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async function(this: Command, options) {
      try {
        // Load authentication and service configuration
        const parentOptions = this.optsWithGlobals();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Dynamically import to allow mocking in tests
        const { RecordHandler } = await import('../handlers/record.handler');

        // Create record handler instance
        const recordHandler = new RecordHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const setDefaultOptions: RecordSetDefaultOptions = {
          channelId: options.channelId,
          videoId: options.videoId,
          output: options.output
        };

        // Add optional fields if provided
        if (options.listType !== undefined) setDefaultOptions.listType = options.listType;

        // Execute set default
        await recordHandler.setRecordDefault(setDefaultOptions);

      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for record set-default command
  setDefaultCmd.addHelpText('after', `
Examples:
  # 设置默认回放视频
  $ polyv-live-cli record set-default -c "2588188" --video-id "73801f70c8"

  # 指定列表类型，JSON格式输出
  $ polyv-live-cli record set-default -c "2588188" --video-id "73801f70c8" --list-type playback -o json

Options:
  -c, --channel-id    频道ID (必填)
  --video-id          视频ID (必填)
  --list-type         视频列表类型: playback(回放列表) 或 vod(点播列表)
  -o, --output        输出格式: table 或 json，默认为table
`);
}
