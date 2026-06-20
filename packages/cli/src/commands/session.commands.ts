/**
 * @fileoverview Session command definitions for CLI
 * @author Development Team
 * @since 9.6.0
 */

import { Command } from 'commander';
import { SessionServiceConfig, SessionListOptions, SessionGetOptions } from '../types/session';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';
import { parsePositiveInteger, parseTimestamp } from '../utils/api-command';

/**
 * Load and prepare authentication and service configuration
 */
async function loadAuthAndServiceConfig(parentOptions: any): Promise<{
  authConfig: AuthConfig;
  serviceConfig: SessionServiceConfig;
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
  const serviceConfig: SessionServiceConfig = {
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
    serviceConfig: SessionServiceConfig;
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

async function runSessionAction(
  program: Command,
  action: (handler: import('../handlers/session.handler').SessionHandler) => Promise<void>
): Promise<void> {
  try {
    const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(program.opts());
    const { SessionHandler } = await import('../handlers/session.handler');
    await action(new SessionHandler(authConfig, serviceConfig));
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }
}

/**
 * Registers session-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerSessionCommands(program: Command): void {
  // Create session command group
  const sessionCmd = program.command('session');
  sessionCmd.description('场次管理命令');

  // Session list command
  const listCmd = sessionCmd
    .command('list')
    .description(`获取频道场次列表

Examples:
  $ polyv-live-cli session list
  $ polyv-live-cli session list -c "2588188"
  $ polyv-live-cli session list -c "2588188" --page 1 --page-size 20
  $ polyv-live-cli session list -c "2588188" --start-date "2024-01-01" --end-date "2024-01-31"
  $ polyv-live-cli session list -c "2588188" -o json`)
    .option('-c, --channel-id <channelId>', '频道ID（不传则获取全部频道场次）')
    .option('--page <number>', '页码，默认为1', (value) => parseInt(value, 10), 1)
    .option('--page-size <number>', '每页数量，默认为10', (value) => parseInt(value, 10), 10)
    .option('--start-date <date>', '开始日期 (格式: YYYY-MM-DD)')
    .option('--end-date <date>', '结束日期 (格式: YYYY-MM-DD)')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async function(this: Command, options) {
      try {
        // Load authentication and service configuration
        const parentOptions = this.optsWithGlobals();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Dynamically import to allow mocking in tests
        const { SessionHandler } = await import('../handlers/session.handler');

        // Create session handler instance
        const sessionHandler = new SessionHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const listOptions: SessionListOptions = {
          channelId: options.channelId,
          page: options.page,
          pageSize: options.pageSize,
          startDate: options.startDate,
          endDate: options.endDate,
          output: options.output
        };

        // Execute session list
        await sessionHandler.listSessions(listOptions);

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

  // Add help text for session list command
  listCmd.addHelpText('after', `
Examples:
  # 获取全部频道场次列表
  $ polyv-live-cli session list

  # 获取指定频道场次列表
  $ polyv-live-cli session list -c "2588188"

  # 指定分页参数
  $ polyv-live-cli session list -c "2588188" --page 2 --page-size 20

  # 指定日期范围过滤
  $ polyv-live-cli session list -c "2588188" --start-date "2024-01-01" --end-date "2024-01-31"

  # JSON格式输出
  $ polyv-live-cli session list -c "2588188" -o json

Options:
  -c, --channel-id    频道ID（不传则获取全部频道场次）
  --page              页码，默认为1
  --page-size         每页数量，默认为10
  --start-date        开始日期 (格式: YYYY-MM-DD)
  --end-date          结束日期 (格式: YYYY-MM-DD)
  -o, --output        输出格式: table 或 json，默认为table

Notes:
  - 不指定频道ID时，将获取账号下全部频道的场次
  - 场次状态包括: 未开始、直播中、已结束、回放中、已过期
  - 日期范围过滤为可选参数，不传则不限制日期范围
`);

  // Session get command
  const getCmd = sessionCmd
    .command('get')
    .description(`获取单个场次详情

Examples:
  $ polyv-live-cli session get -c "2588188" --session-id "e9s2h3jd8f"
  $ polyv-live-cli session get -c "2588188" --session-id "e9s2h3jd8f" -o json`)
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--session-id <sessionId>', '场次ID')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async function(this: Command, options) {
      try {
        // Load authentication and service configuration
        const parentOptions = this.optsWithGlobals();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Dynamically import to allow mocking in tests
        const { SessionHandler } = await import('../handlers/session.handler');

        // Create session handler instance
        const sessionHandler = new SessionHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const getOptions: SessionGetOptions = {
          channelId: options.channelId,
          sessionId: options.sessionId,
          output: options.output
        };

        // Execute session get
        await sessionHandler.getSession(getOptions);

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

  // Add help text for session get command
  getCmd.addHelpText('after', `
Examples:
  # 获取场次详情
  $ polyv-live-cli session get -c "2588188" --session-id "e9s2h3jd8f"

  # JSON格式输出
  $ polyv-live-cli session get -c "2588188" --session-id "e9s2h3jd8f" -o json

Options:
  -c, --channel-id    频道ID (必填)
  --session-id        场次ID (必填)
  -o, --output        输出格式: table 或 json，默认为table

Notes:
  - 频道ID和场次ID都是必填参数
  - 如果场次不存在，会显示友好的错误提示
`);

  sessionCmd
    .command('legacy-list')
    .description('查询频道历史场次信息')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .option('--start-date <date>', '开始日期 (YYYY-MM-DD)')
    .option('--end-date <date>', '结束日期 (YYYY-MM-DD)')
    .option('--page <number>', '页码', parsePositiveInteger)
    .option('--page-size <number>', '每页数量', parsePositiveInteger)
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runSessionAction(program, (handler) => handler.listLegacyChannelSessions(options)));

  sessionCmd
    .command('data-list')
    .description('查询频道场次数据列表')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .option('--start-date <date>', '开始日期 (YYYY-MM-DD)')
    .option('--end-date <date>', '结束日期 (YYYY-MM-DD)')
    .option('--page <number>', '页码', parsePositiveInteger)
    .option('--page-size <number>', '每页数量', parsePositiveInteger)
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runSessionAction(program, (handler) => handler.getSessionDataList(options)));

  sessionCmd
    .command('create')
    .description('创建频道新版场次')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--name <name>', '场次名称')
    .requiredOption('--plan-start-time <timestamp>', '计划开始时间戳', parseTimestamp)
    .requiredOption('--plan-end-time <timestamp>', '计划结束时间戳', parseTimestamp)
    .option('--splash-img <url>', '暖场图 URL')
    .option('-f, --force', '跳过确认提示')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runSessionAction(program, (handler) => handler.createSession(options)));

  sessionCmd
    .command('update')
    .description('更新频道新版场次')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--session-id <sessionId>', '场次ID')
    .requiredOption('--name <name>', '场次名称')
    .requiredOption('--plan-start-time <timestamp>', '计划开始时间戳', parseTimestamp)
    .requiredOption('--plan-end-time <timestamp>', '计划结束时间戳', parseTimestamp)
    .option('--splash-img <url>', '暖场图 URL')
    .option('-f, --force', '跳过确认提示')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runSessionAction(program, (handler) => handler.updateSession(options)));

  sessionCmd
    .command('delete')
    .description('删除频道新版场次')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--session-id <sessionId>', '场次ID')
    .option('-f, --force', '跳过确认提示')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runSessionAction(program, (handler) => handler.deleteSession(options)));

  const externalCmd = sessionCmd
    .command('external')
    .description('管理外部场次 ID 关联');

  externalCmd
    .command('get')
    .description('查询频道场次对应自定义场次ID')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--session-id <sessionId>', '场次ID')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runSessionAction(program, (handler) => handler.getSessionExternalBySession(options)));

  externalCmd
    .command('session-list')
    .description('根据自定义场次ID查询直播场次')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--external-session-id <externalSessionId>', '自定义场次ID')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runSessionAction(program, (handler) => handler.getSessionByExternal(options)));

  externalCmd
    .command('file-ids')
    .description('根据自定义场次ID查询频道暂存文件ID')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--external-session-id <externalSessionId>', '自定义场次ID')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runSessionAction(program, (handler) => handler.listFileIdByExternal(options)));

  externalCmd
    .command('relevance')
    .description('直播场次关联自定义ID')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--external-session-id <externalSessionId>', '自定义场次ID')
    .option('-f, --force', '跳过确认提示')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runSessionAction(program, (handler) => handler.relevanceSession(options)));
}
