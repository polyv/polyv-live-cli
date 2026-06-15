/**
 * @fileoverview Whitelist command definitions for CLI
 * @author Development Team
 * @since 12.4.0
 */

import { Command } from 'commander';
import { WhitelistHandler } from '../handlers/whitelist.handler';
import { WhitelistServiceConfig } from '../types/whitelist';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';
import { OutputFormat } from '../handlers/base.handler';

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

/**
 * Registers whitelist-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerWhitelistCommands(program: Command): void {
  const whitelistCmd = program.command('whitelist');
  whitelistCmd.description('白名单管理');

  // ========================================
  // whitelist list (AC #1)
  // ========================================
  const listCmd = whitelistCmd
    .command('list')
    .description('获取白名单列表')
    .requiredOption('--rank <number>', '条件级别 (1=主要条件/ 2=次要条件)', parseInt)
    .option('--channel-id <id>', '频道ID (可选，不传为全局设置)')
    .option('--page <number>', '页码，默认为1', parseInt)
    .option('--page-size <number>', '每页数量，默认为10', parseInt)
    .option('--keyword <keyword>', '关键词（可根据会员码和名称查询）')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const whitelistHandler = new WhitelistHandler(authConfig, serviceConfig);

        await whitelistHandler.listWhitelist({
          channelId: options.channelId,
          rank: options.rank,
          page: options.page,
          pageSize: options.pageSize,
          keyword: options.keyword,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  listCmd.addHelpText('after', `
Examples:
  # 获取频道白名单
  $ polyv-live-cli whitelist list --channel-id 123456 --rank 1

  # 获取全局白名单
  $ polyv-live-cli whitelist list --rank 1

  # 分页和搜索
  $ polyv-live-cli whitelist list --channel-id 123456 --rank 1 --page 1 --page-size 20 --keyword "张三"

  # JSON 输出格式
  $ polyv-live-cli whitelist list --channel-id 123456 --rank 1 -o json

Output Formats:
  table       - 表格输出格式 (默认)
  json        - JSON 格式输出，适合程序化处理
`);

  // ========================================
  // whitelist add (AC #2)
  // ========================================
  const addCmd = whitelistCmd
    .command('add')
    .description('添加白名单项')
    .requiredOption('--rank <number>', '条件级别 (1=主要条件/ 2=次要条件)', parseInt)
    .requiredOption('--code <code>', '会员码 (最多50个字符)')
    .option('--channel-id <id>', '频道ID (可选，不传为全局设置)')
    .option('--name <name>', '昵称 (可选，最多50个字符)')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const whitelistHandler = new WhitelistHandler(authConfig, serviceConfig);

        await whitelistHandler.addWhitelist({
          channelId: options.channelId,
          rank: options.rank,
          code: options.code,
          name: options.name,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  addCmd.addHelpText('after', `
Examples:
  # 添加频道白名单
  $ polyv-live-cli whitelist add --channel-id 123456 --rank 1 --code "13800138000" --name "张三"

  # 添加全局白名单
  $ polyv-live-cli whitelist add --rank 1 --code "13800138000" --name "张三"

  # JSON 输出格式
  $ polyv-live-cli whitelist add --rank 1 --code "13800138000" -o json
`);

  // ========================================
  // whitelist update (AC #3)
  // ========================================
  const updateCmd = whitelistCmd
    .command('update')
    .description('更新白名单项')
    .requiredOption('--rank <number>', '条件级别 (1=主要条件/ 2=次要条件)', parseInt)
    .requiredOption('--old-code <code>', '原会员码')
    .requiredOption('--code <code>', '新会员码 (最多50个字符)')
    .option('--channel-id <id>', '频道ID (可选，不传为全局设置)')
    .option('--name <name>', '昵称 (可选，最多50个字符)')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const whitelistHandler = new WhitelistHandler(authConfig, serviceConfig);

        await whitelistHandler.updateWhitelist({
          channelId: options.channelId,
          rank: options.rank,
          oldCode: options.oldCode,
          code: options.code,
          name: options.name,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  updateCmd.addHelpText('after', `
Examples:
  # 更新频道白名单
  $ polyv-live-cli whitelist update --channel-id 123456 --rank 1 --old-code "13800138000" --code "13900139000" --name "李四"

  # 更新全局白名单
  $ polyv-live-cli whitelist update --rank 1 --old-code "13800138000" --code "13900139000" --name "李四"

  # JSON 输出格式
  $ polyv-live-cli whitelist update --rank 1 --old-code "13800138000" --code "13900139000" -o json
`);

  // ========================================
  // whitelist remove (AC #4)
  // ========================================
  const removeCmd = whitelistCmd
    .command('remove')
    .description('删除白名单项')
    .requiredOption('--rank <number>', '条件级别 (1=主要条件/ 2=次要条件)', parseInt)
    .option('--channel-id <id>', '频道ID (可选，不传为全局设置)')
    .option('--codes <codes>', '要删除的会员码 (逗号分隔)')
    .option('--clear', '清空所有白名单')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const whitelistHandler = new WhitelistHandler(authConfig, serviceConfig);

        await whitelistHandler.removeWhitelist({
          channelId: options.channelId,
          rank: options.rank,
          codes: options.codes,
          clear: options.clear,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  removeCmd.addHelpText('after', `
Examples:
  # 删除单个白名单
  $ polyv-live-cli whitelist remove --channel-id 123456 --rank 1 --codes "13800138000"

  # 清空所有白名单
  $ polyv-live-cli whitelist remove --channel-id 123456 --rank 1 --clear

  # JSON 输出格式
  $ polyv-live-cli whitelist remove --channel-id 123456 --rank 1 --codes "13800138000" -o json

Note:
  --codes 参数目前只支持单个会员码（API限制）
`);
}


// ========================================
// Common helper
// ========================================
async function loadAuthAndServiceConfig(parentOptions: any): Promise<{
  authConfig: AuthConfig;
  serviceConfig: WhitelistServiceConfig;
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

  const serviceConfig: WhitelistServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug,
  };

  return {
    authConfig: authResult.config,
    serviceConfig,
  };
}
