/**
 * @fileoverview Card-push command definitions for CLI
 * @author Development Team
 * @since 14.2.0
 */

import { Command } from 'commander';
import { CardPushHandler } from '../handlers/card-push.handler';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';
import { OutputFormat } from '../types/platform';

import {
  CardPushServiceConfig
} from '../types/card-push';

/** Default timeout in milliseconds */
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Load and prepare authentication and service configuration
 * @internal Exported for testing purposes
 */
export async function loadAuthAndServiceConfig(parentOptions: Record<string, unknown>): Promise<{
  authConfig: AuthConfig;
  serviceConfig: CardPushServiceConfig;
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
      }
    } else {
      throw error
    }
  }

  const serviceConfig: CardPushServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug,
  };

  const isVerbose = !!parentOptions['verbose']
  if (isVerbose) {
    console.log('Using authentication from:', authResult.source);
  }

  return { authConfig: authResult.config, serviceConfig, isVerbose };
}

/**
 * Validates output format
 * @param format Output format to validate
 * @returns Validated format
 * @throws {Error} When format is invalid
 */
export function validateOutputFormat(format: string): OutputFormat {
  if (format !== 'table' && format !== 'json') {
    throw new Error('Invalid output format. Must be table or json');
  }
  return format;
}

/**
 * Validates image type
 * @param imageType Image type to validate
 * @returns Validated image type
 * @throws {Error} When image type is invalid
 */
export function validateImageType(imageType: string): 'giftbox' | 'redpack' | 'custom' | 'weixinWork' {
  const validTypes = ['giftbox', 'redpack', 'custom', 'weixinWork'];
  if (!validTypes.includes(imageType)) {
    throw new Error(`Invalid imageType. Must be one of: ${validTypes.join(', ')}`);
  }
  return imageType as 'giftbox' | 'redpack' | 'custom' | 'weixinWork';
}

/**
 * Validates show condition
 * @param showCondition Show condition to validate
 * @returns Validated show condition
 * @throws {Error} When show condition is invalid
 */
export function validateShowCondition(showCondition: string): 'PUSH' | 'WATCH' {
  const validConditions = ['PUSH', 'WATCH'];
  if (!validConditions.includes(showCondition)) {
    throw new Error(`Invalid showCondition. Must be one of: ${validConditions.join(', ')}`);
  }
  return showCondition as 'PUSH' | 'WATCH';
}

/**
 * Validates duration
 * @param duration Duration to validate
 * @returns Validated duration
 * @throws {Error} When duration is invalid
 */
export function validateDuration(duration: string): number {
  const durationNum = parseInt(duration, 10);
  const validDurations = [0, 5, 10, 20, 30];
  if (!validDurations.includes(durationNum)) {
    throw new Error(`Invalid duration. Must be one of: ${validDurations.join(', ')}`);
  }
  return durationNum;
}

/**
 * Register card-push commands
 */
export function registerCardPushCommands(program: Command): void {
  const cardPushCmd = program
    .command('card-push')
    .description('Manage card push for live streaming (管理直播卡片推送)');

  // List command
  cardPushCmd
    .command('list')
    .description('List all card-pushes (列出所有卡片推送)')
    .requiredOption('--channelId <id>', 'Channel ID (频道ID)')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(options);
        const handler = new CardPushHandler(authConfig, serviceConfig);
        await handler.listCardPushes({
          channelId: options.channelId,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Create command
  cardPushCmd
    .command('create')
    .description('Create a new card-push (创建新的卡片推送)')
    .requiredOption('--channelId <id>', 'Channel ID (频道ID)')
    .requiredOption('--imageType <type>', 'Image type (giftbox|redpack|custom|weixinWork)', validateImageType)
    .requiredOption('--title <title>', 'Card title (卡片标题，最多16个字符)')
    .requiredOption('--link <url>', 'Card link URL (卡片链接地址)')
    .requiredOption('--duration <seconds>', 'Card countdown duration (0,5,10,20,30秒)', validateDuration)
    .requiredOption('--showCondition <condition>', 'Show condition (PUSH|WATCH)', validateShowCondition)
    .option('--cardType <type>', 'Card type (common|qrCode)', 'common')
    .option('--durationPosition <position>', 'Duration position (bottom|top)')
    .option('--conditionValue <value>', 'Watch duration value (观看时长)', (val) => parseInt(val, 10))
    .option('--conditionUnit <unit>', 'Watch duration unit (SECONDS|MINUTES)')
    .option('--countdownMsg <message>', 'Countdown message (倒计时文案，最多8个字符)')
    .option('--enterEnabled <enabled>', 'Card entry enabled (Y|N)')
    .option('--linkEnabled <enabled>', 'Card link enabled (Y|N)')
    .option('--redirectType <type>', 'Redirect type (iframe|tab)')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(options);
        const handler = new CardPushHandler(authConfig, serviceConfig);
        await handler.createCardPush({
          channelId: options.channelId,
          cardType: options.cardType,
          imageType: options.imageType,
          title: options.title,
          link: options.link,
          duration: options.duration,
          durationPosition: options.durationPosition,
          showCondition: options.showCondition,
          conditionValue: options.conditionValue,
          conditionUnit: options.conditionUnit,
          countdownMsg: options.countdownMsg,
          enterEnabled: options.enterEnabled,
          linkEnabled: options.linkEnabled,
          redirectType: options.redirectType,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Update command
  cardPushCmd
    .command('update')
    .description('Update an existing card-push (更新现有卡片推送)')
    .requiredOption('--channelId <id>', 'Channel ID (频道ID)')
    .requiredOption('--cardPushId <id>', 'Card-push ID (卡片推送ID)')
    .option('--cardType <type>', 'Card type (common|qrCode)')
    .option('--imageType <type>', 'Image type (giftbox|redpack|custom|weixinWork)', validateImageType)
    .option('--title <title>', 'Card title (卡片标题，最多16个字符)')
    .option('--link <url>', 'Card link URL (卡片链接地址)')
    .option('--duration <seconds>', 'Card countdown duration (0,5,10,20,30秒)', validateDuration)
    .option('--durationPosition <position>', 'Duration position (bottom|top)')
    .option('--showCondition <condition>', 'Show condition (PUSH|WATCH)', validateShowCondition)
    .option('--conditionValue <value>', 'Watch duration value (观看时长)', (val) => parseInt(val, 10))
    .option('--conditionUnit <unit>', 'Watch duration unit (SECONDS|MINUTES)')
    .option('--countdownMsg <message>', 'Countdown message (倒计时文案，最多8个字符)')
    .option('--enterEnabled <enabled>', 'Card entry enabled (Y|N)')
    .option('--linkEnabled <enabled>', 'Card link enabled (Y|N)')
    .option('--redirectType <type>', 'Redirect type (iframe|tab)')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(options);
        const handler = new CardPushHandler(authConfig, serviceConfig);
        await handler.updateCardPush({
          channelId: options.channelId,
          cardPushId: options.cardPushId,
          cardType: options.cardType,
          imageType: options.imageType,
          title: options.title,
          link: options.link,
          duration: options.duration,
          durationPosition: options.durationPosition,
          showCondition: options.showCondition,
          conditionValue: options.conditionValue,
          conditionUnit: options.conditionUnit,
          countdownMsg: options.countdownMsg,
          enterEnabled: options.enterEnabled,
          linkEnabled: options.linkEnabled,
          redirectType: options.redirectType,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Push command
  cardPushCmd
    .command('push')
    .description('Push a card to viewers (推送卡片到观众)')
    .requiredOption('--channelId <id>', 'Channel ID (频道ID)')
    .requiredOption('--cardPushId <id>', 'Card-push ID (卡片推送ID)')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(options);
        const handler = new CardPushHandler(authConfig, serviceConfig);
        await handler.pushCard({
          channelId: options.channelId,
          cardPushId: options.cardPushId,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Cancel command
  cardPushCmd
    .command('cancel')
    .description('Cancel a pushing card (取消正在推送的卡片)')
    .requiredOption('--channelId <id>', 'Channel ID (频道ID)')
    .requiredOption('--cardPushId <id>', 'Card-push ID (卡片推送ID)')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(options);
        const handler = new CardPushHandler(authConfig, serviceConfig);
        await handler.cancelPush({
          channelId: options.channelId,
          cardPushId: options.cardPushId,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Delete command
  cardPushCmd
    .command('delete')
    .description('Delete a card-push (删除卡片推送)')
    .requiredOption('--channelId <id>', 'Channel ID (频道ID)')
    .requiredOption('--cardPushId <id>', 'Card-push ID (卡片推送ID)')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(options);
        const handler = new CardPushHandler(authConfig, serviceConfig);
        await handler.deleteCardPush({
          channelId: options.channelId,
          cardPushId: options.cardPushId,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });
}
