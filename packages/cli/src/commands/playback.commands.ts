/**
 * @fileoverview Playback command definitions for CLI
 * @author Development Team
 * @since 9.1.0
 */

import { Command } from 'commander';
import { PlaybackServiceConfig, PlaybackListOptions, PlaybackGetOptions, PlaybackDeleteOptions, PlaybackMergeOptions } from '../types/playback';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';
import { parseStringList, parseJsonArray } from '../utils/api-command';

/**
 * Load and prepare authentication and service configuration
 */
async function loadAuthAndServiceConfig(parentOptions: any): Promise<{
  authConfig: AuthConfig;
  serviceConfig: PlaybackServiceConfig;
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
  const serviceConfig: PlaybackServiceConfig = {
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
    serviceConfig: PlaybackServiceConfig;
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

function validateYN(value: string): 'Y' | 'N' {
  const upper = value.toUpperCase();
  if (upper !== 'Y' && upper !== 'N') {
    throw new Error('Value must be Y or N');
  }
  return upper as 'Y' | 'N';
}

function validateMoveType(value: string): 'up' | 'down' {
  if (value !== 'up' && value !== 'down') {
    throw new Error('Move type must be up or down');
  }
  return value;
}

async function runPlaybackAction(
  program: Command,
  action: (handler: import('../handlers/playback.handler').PlaybackHandler) => Promise<void>
): Promise<void> {
  try {
    const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(program.opts());
    const { PlaybackHandler } = await import('../handlers/playback.handler');
    await action(new PlaybackHandler(authConfig, serviceConfig));
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }
}

/**
 * Registers playback-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerPlaybackCommands(program: Command): void {
  // Create playback command group
  const playbackCmd = program.command('playback');
  playbackCmd.description('回放管理命令');

  // Playback list command
  const listCmd = playbackCmd
    .command('list')
    .description(`获取频道回放列表

Examples:
  $ polyv-live-cli playback list -c "2191532"
  $ polyv-live-cli playback list -c "2191532" --list-type vod
  $ polyv-live-cli playback list -c "2191532" --page 2 --page-size 20 -o json`)
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .option('--page <number>', '页码，默认为1', (value) => parseInt(value, 10), 1)
    .option('--page-size <number>', '每页数量，默认为10', (value) => parseInt(value, 10), 10)
    .option('--list-type <type>', '列表类型 (playback|vod)', validateListType, 'playback')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async function(this: Command, options) {
      try {
        // Load authentication and service configuration
        const parentOptions = this.optsWithGlobals();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Dynamically import to allow mocking in tests
        const { PlaybackHandler } = await import('../handlers/playback.handler');

        // Create playback handler instance
        const playbackHandler = new PlaybackHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const listOptions: PlaybackListOptions = {
          channelId: options.channelId,
          page: options.page,
          pageSize: options.pageSize,
          listType: options.listType,
          output: options.output
        };

        // Execute playback list
        await playbackHandler.listPlayback(listOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(err => console.error(`  - ${err}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for playback list command
  listCmd.addHelpText('after', `
Examples:
  # 获取频道回放列表
  $ polyv-live-cli playback list -c "2191532"

  # 获取点播列表
  $ polyv-live-cli playback list -c "2191532" --list-type vod

  # 指定分页参数
  $ polyv-live-cli playback list -c "2191532" --page 2 --page-size 20

  # JSON格式输出
  $ polyv-live-cli playback list -c "2191532" -o json

Options:
  -c, --channel-id    频道ID (必填)
  --page              页码，默认为1
  --page-size         每页数量，默认为10
  --list-type         列表类型: playback(回放) 或 vod(点播)，默认为playback
  -o, --output        输出格式: table 或 json，默认为table

Notes:
  - 频道ID是必填参数
  - 回放列表包含直播生成的回放视频
  - 点播列表包含手动上传的视频
`);

  // Playback get command
  const getCmd = playbackCmd
    .command('get')
    .description(`获取单个回放视频详情

Examples:
  $ polyv-live-cli playback get -c "2191532" --video-id "1b96d90bf5"
  $ polyv-live-cli playback get -c "2191532" --video-id "1b96d90bf5" --list-type vod
  $ polyv-live-cli playback get -c "2191532" --video-id "1b96d90bf5" -o json`)
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--video-id <videoId>', '视频ID')
    .option('--list-type <type>', '列表类型 (playback|vod)', validateListType, 'playback')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async function(this: Command, options) {
      try {
        // Load authentication and service configuration
        const parentOptions = this.optsWithGlobals();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Dynamically import to allow mocking in tests
        const { PlaybackHandler } = await import('../handlers/playback.handler');

        // Create playback handler instance
        const playbackHandler = new PlaybackHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const getOptions: PlaybackGetOptions = {
          channelId: options.channelId,
          videoId: options.videoId,
          listType: options.listType,
          output: options.output
        };

        // Execute playback get
        await playbackHandler.getPlayback(getOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(err => console.error(`  - ${err}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for playback get command
  getCmd.addHelpText('after', `
Examples:
  # 获取回放视频详情
  $ polyv-live-cli playback get -c "2191532" --video-id "1b96d90bf5"

  # 获取点播视频详情
  $ polyv-live-cli playback get -c "2191532" --video-id "1b96d90bf5" --list-type vod

  # JSON格式输出
  $ polyv-live-cli playback get -c "2191532" --video-id "1b96d90bf5" -o json

Options:
  -c, --channel-id    频道ID (必填)
  --video-id          视频ID (必填)
  --list-type         列表类型: playback(回放) 或 vod(点播)，默认为playback
  -o, --output        输出格式: table 或 json，默认为table

Notes:
  - 频道ID和视频ID都是必填参数
  - 如果视频不存在，会显示友好的错误提示
`);

  // Playback delete command
  const deleteCmd = playbackCmd
    .command('delete')
    .description(`删除回放视频

Examples:
  $ polyv-live-cli playback delete -c "3151318" --video-id "1b96d90bf5"
  $ polyv-live-cli playback delete -c "3151318" --video-id "1b96d90bf5" --force
  $ polyv-live-cli playback delete -c "3151318" --video-id "1b96d90bf5" --list-type vod --force
  $ polyv-live-cli playback delete -c "3151318" --video-id "1b96d90bf5" --force -o json`)
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--video-id <videoId>', '视频ID')
    .option('--list-type <type>', '列表类型 (playback|vod)', validateListType, 'playback')
    .option('--force', '跳过确认提示，直接删除', false)
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async function(this: Command, options) {
      try {
        // Load authentication and service configuration
        const parentOptions = this.optsWithGlobals();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Dynamically import to allow mocking in tests
        const { PlaybackHandler } = await import('../handlers/playback.handler');

        // Create playback handler instance
        const playbackHandler = new PlaybackHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const deleteOptions: PlaybackDeleteOptions = {
          channelId: options.channelId,
          videoId: options.videoId,
          listType: options.listType,
          force: options.force,
          output: options.output
        };

        // Execute playback delete
        await playbackHandler.deletePlayback(deleteOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(err => console.error(`  - ${err}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for playback delete command
  deleteCmd.addHelpText('after', `
Examples:
  # 删除回放视频（需要确认）
  $ polyv-live-cli playback delete -c "3151318" --video-id "1b96d90bf5"

  # 跳过确认直接删除
  $ polyv-live-cli playback delete -c "3151318" --video-id "1b96d90bf5" --force

  # 删除点播视频
  $ polyv-live-cli playback delete -c "3151318" --video-id "1b96d90bf5" --list-type vod --force

  # JSON格式输出
  $ polyv-live-cli playback delete -c "3151318" --video-id "1b96d90bf5" --force -o json

Options:
  -c, --channel-id    频道ID (必填)
  --video-id          视频ID (必填)
  --list-type         列表类型: playback(回放) 或 vod(点播)，默认为playback
  --force             跳过确认提示，直接删除
  -o, --output        输出格式: table 或 json，默认为table

Notes:
  - 频道ID和视频ID都是必填参数
  - 默认需要确认，使用 --force 可以跳过确认
  - 此操作不可撤销，请谨慎使用
`);

  // Playback merge command
  const mergeCmd = playbackCmd
    .command('merge')
    .description(`合并录制文件

Examples:
  $ polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2,file3"
  $ polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2" --file-name "合并回放"
  $ polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2" --async
  $ polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2" --async --callback-url "http://example.com/callback"
  $ polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2" --async --auto-convert --merge-mp4
  $ polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2" -o json`)
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--file-ids <fileIds>', '要合并的录制文件ID，多个ID用逗号分隔')
    .option('--file-name [fileName]', '合并后的文件名')
    .option('--async', '使用异步合并模式', false)
    .option('--callback-url [url]', '合并完成后的回调URL（异步模式）')
    .option('--auto-convert', '自动转存到点播（异步模式）', false)
    .option('--merge-mp4', '合并为MP4文件（异步模式）', false)
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async function(this: Command, options) {
      try {
        // Load authentication and service configuration
        const parentOptions = this.optsWithGlobals();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Dynamically import to allow mocking in tests
        const { PlaybackHandler } = await import('../handlers/playback.handler');

        // Create playback handler instance
        const playbackHandler = new PlaybackHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const mergeOptions: PlaybackMergeOptions = {
          channelId: options.channelId,
          fileIds: options.fileIds,
          fileName: options.fileName,
          async: options.async,
          callbackUrl: options.callbackUrl,
          autoConvert: options.autoConvert,
          mergeMp4: options.mergeMp4,
          output: options.output
        };

        // Execute playback merge
        await playbackHandler.mergePlayback(mergeOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(err => console.error(`  - ${err}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for playback merge command
  mergeCmd.addHelpText('after', `
Examples:
  # 同步合并录制文件
  $ polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2,file3"

  # 设置合并后的文件名
  $ polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2" --file-name "合并回放"

  # 异步合并模式
  $ polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2" --async

  # 异步合并 + 回调URL
  $ polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2" --async --callback-url "http://example.com/callback"

  # 异步合并 + 自动转存点播 + 合并为MP4
  $ polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2" --async --auto-convert --merge-mp4

  # JSON格式输出
  $ polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2" -o json

Options:
  -c, --channel-id    频道ID (必填)
  --file-ids          要合并的录制文件ID，多个ID用逗号分隔 (必填)
  --file-name         合并后的文件名
  --async             使用异步合并模式
  --callback-url      合并完成后的回调URL（异步模式）
  --auto-convert      自动转存到点播（异步模式）
  --merge-mp4         合并为MP4文件（异步模式）
  -o, --output        输出格式: table 或 json，默认为table

Notes:
  - 频道ID和文件ID是必填参数
  - 多个文件ID用英文逗号分隔
  - 同步合并会等待合并完成后返回结果
  - 异步合并会立即返回，合并完成后可通过回调URL通知
`);

  playbackCmd
    .command('setting-list')
    .description('批量查询频道回放设置')
    .requiredOption('--channel-ids <ids>', '频道ID，逗号分隔', parseStringList)
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runPlaybackAction(program, (handler) => handler.listPlaybackSettings(options)));

  playbackCmd
    .command('video-info')
    .description('批量查询频道单个回放信息')
    .requiredOption('--channel-ids <ids>', '频道ID，逗号分隔', parseStringList)
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runPlaybackAction(program, (handler) => handler.getPlaybackVideoInfo(options)));

  const enabledCmd = playbackCmd
    .command('enabled')
    .description('管理频道回放开关');

  enabledCmd
    .command('get')
    .description('查询频道回放开关')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runPlaybackAction(program, (handler) => handler.getPlaybackEnabled(options)));

  enabledCmd
    .command('set')
    .description('修改用户或频道回放开关')
    .requiredOption('--user-id <userId>', '用户ID')
    .requiredOption('--play-back-enabled <value>', '回放开关 (Y|N)', validateYN)
    .option('-c, --channel-id <channelId>', '频道ID')
    .option('-f, --force', '跳过确认提示')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runPlaybackAction(program, (handler) => handler.setPlaybackEnabled(options)));

  playbackCmd
    .command('add-vod')
    .description('将点播视频添加到频道回放视频库')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--vid <vid>', '点播视频ID')
    .option('--set-as-default <value>', '是否设为默认回放 (Y|N)', validateYN)
    .option('--list-type <type>', '列表类型 (playback|vod)', validateListType)
    .option('-f, --force', '跳过确认提示')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runPlaybackAction(program, (handler) => handler.addVodPlayback(options)));

  const titleCmd = playbackCmd
    .command('title')
    .description('管理回放标题');

  titleCmd
    .command('update')
    .description('修改回放视频名称')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--video-id <videoId>', '回放视频ID')
    .requiredOption('--title <title>', '新标题')
    .option('-f, --force', '跳过确认提示')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runPlaybackAction(program, (handler) => handler.updatePlaybackTitle(options)));

  const sortCmd = playbackCmd
    .command('sort')
    .description('管理回放视频排序');

  sortCmd
    .command('move')
    .description('上移或下移单个回放视频')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--video-id <videoId>', '回放视频ID')
    .requiredOption('--type <type>', '移动方向 (up|down)', validateMoveType)
    .option('--list-type <type>', '列表类型 (playback|vod)', validateListType)
    .option('-f, --force', '跳过确认提示')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runPlaybackAction(program, (handler) => handler.movePlaybackVideo(options)));

  sortCmd
    .command('set')
    .description('按完整视频 ID 列表设置回放排序')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--video-ids <ids>', '回放视频ID，逗号分隔', parseStringList)
    .option('--list-type <type>', '列表类型 (playback|vod)', validateListType)
    .option('-f, --force', '跳过确认提示')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runPlaybackAction(program, (handler) => handler.sortPlaybackVideos(options)));

  const subtitleCmd = playbackCmd
    .command('subtitle')
    .description('管理回放字幕');

  subtitleCmd
    .command('update-batch')
    .description('批量修改频道回放字幕')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--body-json <json>', '字幕数组 JSON，例如 [{"id":1,"name":"字幕","status":"publish"}]', parseJsonArray)
    .option('-f, --force', '跳过确认提示')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runPlaybackAction(program, (handler) => handler.updateChannelSubtitles({
      channelId: options.channelId,
      body: options.bodyJson,
      force: options.force,
      output: options.output,
    })));
}
