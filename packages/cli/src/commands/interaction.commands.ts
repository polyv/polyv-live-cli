/**
 * @fileoverview Cross-cutting live interaction command definitions
 */

import { Command } from 'commander';
import { InteractionHandler } from '../handlers/interaction.handler';
import { InteractionServiceConfig } from '../types/interaction';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';

export function validateOutputFormat(value: string): 'table' | 'json' {
  if (!['table', 'json'].includes(value)) {
    throw new Error('Output format must be either "table" or "json"');
  }
  return value as 'table' | 'json';
}

export function parsePositiveInteger(value: string): number {
  const parsed = parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error('Value must be a positive integer');
  }
  return parsed;
}

export function validateYn(value: string): 'Y' | 'N' {
  if (value !== 'Y' && value !== 'N') {
    throw new Error('Value must be Y or N');
  }
  return value;
}

export function registerInteractionCommands(program: Command): void {
  const interactionCmd = program.command('interaction');
  interactionCmd.description('Manage cross-cutting live interaction APIs');

  async function withInteractionHandler(action: (handler: InteractionHandler) => Promise<void>): Promise<void> {
    try {
      const parentOptions = program.opts();
      const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
      await action(new InteractionHandler(authConfig, serviceConfig));
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  }

  interactionCmd
    .command('favor')
    .description('Send likes for a viewer')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--viewer-id <id>', 'viewer ID')
    .option('--times <number>', 'like count', parsePositiveInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.sendFavor({
      channelId: options.channelId,
      viewerId: options.viewerId,
      times: options.times,
      force: options.force,
      output: options.output,
    })));

  interactionCmd
    .command('reward')
    .description('Send a reward message')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--nickname <name>', 'viewer nickname')
    .requiredOption('--avatar <url>', 'viewer avatar URL')
    .requiredOption('--viewer-id <id>', 'viewer ID')
    .requiredOption('--donate-type <type>', 'donate type')
    .requiredOption('--content <text>', 'reward content')
    .option('--good-image <url>', 'gift image URL')
    .option('--session-id <id>', 'live session ID')
    .option('--good-num <number>', 'gift count')
    .option('--need-user-image <Y|N>', 'whether user image is required', validateYn)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.sendRewardMsg({
      channelId: options.channelId,
      nickname: options.nickname,
      avatar: options.avatar,
      viewerId: options.viewerId,
      donateType: options.donateType,
      content: options.content,
      goodImage: options.goodImage,
      sessionId: options.sessionId,
      goodNum: options.goodNum,
      needUserImage: options.needUserImage,
      force: options.force,
      output: options.output,
    })));

  const webhookCmd = interactionCmd
    .command('webhook')
    .description('Manage student question webhook');

  webhookCmd
    .command('get')
    .description('Get student question webhook configuration')
    .option('--room-id <id>', 'room ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.getStudentQuestionWebhook({
      roomId: options.roomId,
      output: options.output,
    })));

  webhookCmd
    .command('set')
    .description('Set student question webhook configuration')
    .requiredOption('--room-id <id>', 'room ID')
    .requiredOption('--callback-url <url>', 'callback URL')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.setStudentQuestionWebhook({
      roomId: options.roomId,
      callbackUrl: options.callbackUrl,
      force: options.force,
      output: options.output,
    })));

  webhookCmd
    .command('delete')
    .description('Delete student question webhook configuration')
    .requiredOption('--room-id <id>', 'room ID')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.deleteStudentQuestionWebhook({
      roomId: options.roomId,
      force: options.force,
      output: options.output,
    })));

  interactionCmd
    .command('teacher-answer')
    .description('Send a teacher answer to a student question')
    .requiredOption('--room-id <id>', 'room ID')
    .requiredOption('--viewer-user-id <id>', 'viewer user ID')
    .requiredOption('--content <text>', 'answer content')
    .option('--teacher-nick <name>', 'teacher nickname')
    .option('--teacher-pic <url>', 'teacher avatar URL')
    .option('--msg-type <type>', 'message type')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.sendTeacherAnswer({
      roomId: options.roomId,
      viewerUserId: options.viewerUserId,
      content: options.content,
      teacherNick: options.teacherNick,
      teacherPic: options.teacherPic,
      msgType: options.msgType,
      force: options.force,
      output: options.output,
    })));
}

async function loadAuthAndServiceConfig(parentOptions: any): Promise<{
  authConfig: AuthConfig;
  serviceConfig: InteractionServiceConfig;
}> {
  const authResult = authAdapter.tryGetAuthConfig(parentOptions);
  if (!authResult) {
    throw new Error(authAdapter.getStatusMessage(parentOptions));
  }

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
          debug: false,
        },
      };
    } else {
      throw error;
    }
  }

  return {
    authConfig: authResult.config,
    serviceConfig: {
      baseUrl: configResult.config.baseUrl,
      timeout: configResult.config.timeout,
      debug: configResult.config.debug,
    },
  };
}
