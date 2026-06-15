/**
 * @fileoverview Watch condition command definitions for CLI
 * @author Development Team
 * @since 12.3.0
 */

import { Command } from 'commander';
import { WatchConditionHandler } from '../handlers/watch-condition.handler';
import { WatchConditionServiceConfig } from '../types/watch-condition';
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
 * Registers watch-condition-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerWatchConditionCommands(program: Command): void {
  const watchConditionCmd = program.command('watch-condition');
  watchConditionCmd.description('观看条件配置管理');

  // ========================================
  // watch-condition get (AC #1)
  // ========================================
  const getCmd = watchConditionCmd
    .command('get')
    .description('获取观看条件配置')
    .option('--channel-id <id>', '频道ID (可选，不传为全局设置)')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const watchConditionHandler = new WatchConditionHandler(authConfig, serviceConfig);

        await watchConditionHandler.getWatchCondition({
          channelId: options.channelId,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  getCmd.addHelpText('after', `
Examples:
  # 获取全局观看条件
  $ polyv-live-cli watch-condition get

  # 获取频道观看条件
  $ polyv-live-cli watch-condition get --channel-id 123456

  # JSON 输出格式
  $ polyv-live-cli watch-condition get --channel-id 123456 -o json

Output Formats:
  table       - 表格输出格式 (默认)
  json        - JSON 格式输出，适合程序化处理
`)

  // ========================================
  // watch-condition set (AC #2)
  // ========================================
  const setCmd = watchConditionCmd
    .command('set')
    .description('设置观看条件配置')
    .option('--channel-id <id>', '频道ID (可选，不传为全局设置)')
    .option('--rank <number>', '条件级别 (1=主要条件/ 2=次要条件)', parseInt)
    .option('--auth-type <type>', '认证类型 (none|code|pay|phone|info|custom|external|direct)')
    .option('--enabled <value>', '是否启用 (Y|N)')
    .option('--auth-code <password>', '密码 (authType=code 时使用)')
    .option('--price <amount>', '价格/元 (authType=pay 时使用)', parseFloat)
    .option('--config-file <path>', 'JSON 配置文件路径 (复杂配置场景)')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const watchConditionHandler = new WatchConditionHandler(authConfig, serviceConfig);

        await watchConditionHandler.setWatchCondition({
          channelId: options.channelId,
          rank: options.rank,
          authType: options.authType,
          enabled: options.enabled,
          authCode: options.authCode,
          price: options.price,
          configFile: options.configFile,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  setCmd.addHelpText('after', `
Examples:
  # 简单设置：关闭观看条件（公开观看）
  $ polyv-live-cli watch-condition set --channel-id 123456 --rank 1 --auth-type none --enabled Y

  # 简单设置：密码观看
  $ polyv-live-cli watch-condition set --channel-id 123456 --rank 1 --auth-type code --enabled Y --auth-code "abc123"

  # 简单设置：付费观看
  $ polyv-live-cli watch-condition set --channel-id 123456 --rank 1 --auth-type pay --enabled Y --price 99.9

  # 复杂设置：使用 JSON 配置文件
  $ polyv-live-cli watch-condition set --channel-id 123456 --config-file ./watch-condition.json

  # 设置全局观看条件
  $ polyv-live-cli watch-condition set --rank 1 --auth-type none --enabled N

JSON Config File Format:
  {
    "authSettings": [
      {
        "rank": 1,
        "enabled": "Y",
        "authType": "code",
        "authCode": "abc123"
      },
      {
        "rank": 2,
        "enabled": "N"
      }
    ]
  }

Output Formats:
  table       - 表格输出格式 (默认)
  json        - JSON 格式输出，适合程序化处理
`)
}


// ========================================
// Common helper
// ========================================
async function loadAuthAndServiceConfig(parentOptions: any): Promise<{
  authConfig: AuthConfig;
  serviceConfig: WatchConditionServiceConfig;
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

  const serviceConfig: WatchConditionServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug,
  };

  return {
    authConfig: authResult.config,
    serviceConfig,
  };
}
