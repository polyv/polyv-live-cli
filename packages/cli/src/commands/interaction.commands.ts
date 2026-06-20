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
import { parseJsonArray, parseJsonObject, parseTimestamp } from '../utils/api-command';

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

  const eventCmd = interactionCmd
    .command('event')
    .description('Manage interaction listener events');

  eventCmd
    .command('list')
    .description('List interaction listener events')
    .requiredOption('--room-id <id>', 'room ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.listInteractionEvents({
      roomId: options.roomId,
      output: options.output,
    })));

  eventCmd
    .command('save')
    .description('Save an interaction listener event')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--event-type <type>', 'event type')
    .requiredOption('--event-data <json>', 'event data JSON object', parseJsonObject)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.saveInteractionEvent({
      channelId: options.channelId,
      eventType: options.eventType,
      eventData: options.eventData,
      force: options.force,
      output: options.output,
    })));

  eventCmd
    .command('delete')
    .description('Delete an interaction listener event')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--event-id <id>', 'event ID')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.deleteInteractionEvent({
      channelId: options.channelId,
      eventId: options.eventId,
      force: options.force,
      output: options.output,
    })));

  const invitePosterCmd = interactionCmd
    .command('invite-poster')
    .description('Manage invite poster interaction helpers');

  invitePosterCmd
    .command('create')
    .description('Create an invite poster inviter')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--open-id <id>', 'viewer open ID')
    .requiredOption('--nickname <name>', 'viewer nickname')
    .option('--avatar <url>', 'viewer avatar URL')
    .option('--viewer-id <id>', 'viewer ID')
    .option('--invitee <id>', 'invitee ID')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.createInvitePoster({
      channelId: options.channelId,
      openId: options.openId,
      nickname: options.nickname,
      avatar: options.avatar,
      viewerId: options.viewerId,
      invitee: options.invitee,
      force: options.force,
      output: options.output,
    })));

  const scriptCmd = interactionCmd
    .command('script')
    .description('Manage pseudo-live disk video interaction scripts');

  scriptCmd
    .command('query')
    .description('Query custom interaction scripts for a disk video')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--disk-video-id <id>', 'disk video ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.queryDiskVideoCustomScript({
      channelId: options.channelId,
      diskVideoId: options.diskVideoId,
      output: options.output,
    })));

  scriptCmd
    .command('upload')
    .description('Upload a custom interaction script for a disk video')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--disk-video-id <id>', 'disk video ID')
    .requiredOption('--file <path>', 'script file path')
    .option('--label-id <id>', 'disk video label ID')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.uploadDiskVideoCustomScript({
      channelId: options.channelId,
      diskVideoId: options.diskVideoId,
      filePath: options.file,
      labelId: options.labelId,
      force: options.force,
      output: options.output,
    })));

  scriptCmd
    .command('delete')
    .description('Delete an interaction script')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--id <id>', 'script ID')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.deleteInteractionScript({
      channelId: options.channelId,
      id: options.id,
      force: options.force,
      output: options.output,
    })));

  const taskRewardCmd = interactionCmd
    .command('task-reward')
    .description('Manage task reward activities');

  taskRewardCmd
    .command('list')
    .description('List task reward activities')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--page <number>', 'page number', parsePositiveInteger)
    .option('--size <number>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.listTaskRewardActivities({
      channelId: options.channelId,
      page: options.page,
      size: options.size,
      output: options.output,
    })));

  taskRewardCmd
    .command('create')
    .description('Create a task reward activity')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--activity-name <name>', 'activity name')
    .requiredOption('--task-rule <number>', 'task rule', parsePositiveInteger)
    .requiredOption('--start-time <timestamp>', 'start time (timestamp in milliseconds)', parseTimestamp)
    .requiredOption('--end-time <timestamp>', 'end time (timestamp in milliseconds)', parseTimestamp)
    .requiredOption('--tasks-json <json>', 'task settings JSON array', parseJsonArray)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.createTaskRewardActivity({
      channelId: options.channelId,
      activityName: options.activityName,
      taskRule: options.taskRule,
      startTime: options.startTime,
      endTime: options.endTime,
      tasks: options.tasksJson,
      force: options.force,
      output: options.output,
    })));

  taskRewardCmd
    .command('update')
    .description('Update a task reward activity')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--activity-id <id>', 'activity ID')
    .requiredOption('--tasks-json <json>', 'task settings JSON array', parseJsonArray)
    .option('--activity-name <name>', 'activity name')
    .option('--task-rule <number>', 'task rule', parsePositiveInteger)
    .option('--start-time <timestamp>', 'start time (timestamp in milliseconds)', parseTimestamp)
    .option('--end-time <timestamp>', 'end time (timestamp in milliseconds)', parseTimestamp)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.updateTaskRewardActivity({
      channelId: options.channelId,
      activityId: options.activityId,
      activityName: options.activityName,
      taskRule: options.taskRule,
      startTime: options.startTime,
      endTime: options.endTime,
      tasks: options.tasksJson,
      force: options.force,
      output: options.output,
    })));

  taskRewardCmd
    .command('delete')
    .description('Delete a task reward activity')
    .requiredOption('--activity-id <id>', 'activity ID')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.deleteTaskRewardActivity({
      activityId: options.activityId,
      force: options.force,
      output: options.output,
    })));

  taskRewardCmd
    .command('stop')
    .description('Stop a task reward activity')
    .requiredOption('--activity-id <id>', 'activity ID')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.stopTaskRewardActivity({
      activityId: options.activityId,
      force: options.force,
      output: options.output,
    })));

  taskRewardCmd
    .command('stats')
    .description('List task reward activity statistics')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--page <number>', 'page number', parsePositiveInteger)
    .option('--size <number>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.listTaskRewardStats({
      channelId: options.channelId,
      page: options.page,
      size: options.size,
      output: options.output,
    })));

  taskRewardCmd
    .command('viewer-detail')
    .description('List viewer details for a task reward activity')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--activity-id <id>', 'activity ID')
    .option('--viewer-id <id>', 'viewer ID')
    .option('--page <number>', 'page number', parsePositiveInteger)
    .option('--size <number>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.listTaskRewardViewerDetails({
      channelId: options.channelId,
      activityId: options.activityId,
      viewerId: options.viewerId,
      page: options.page,
      size: options.size,
      output: options.output,
    })));

  taskRewardCmd
    .command('viewer-list')
    .description('List viewer-side task reward details')
    .requiredOption('--viewer-id <id>', 'viewer ID')
    .option('--page <number>', 'page number', parsePositiveInteger)
    .option('--size <number>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.listViewerTaskRewardDetails({
      viewerId: options.viewerId,
      page: options.page,
      size: options.size,
      output: options.output,
    })));

  taskRewardCmd
    .command('submit-accept-info')
    .description('Submit viewer accept information for a task reward')
    .requiredOption('--id <id>', 'viewer task reward record ID')
    .requiredOption('--viewer-id <id>', 'viewer ID')
    .requiredOption('--form-info-json <json>', 'accept form information JSON array', parseJsonArray)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInteractionHandler((handler) => handler.submitViewerTaskRewardAcceptInfo({
      id: options.id,
      viewerId: options.viewerId,
      formInfo: options.formInfoJson,
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
