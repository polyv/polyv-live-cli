/**
 * @fileoverview Handler for cross-cutting live interaction CLI commands
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { InteractionServiceSdk } from '../services/interaction-service';
import type { AuthConfig } from '../types/auth';
import {
  InteractionServiceConfig,
  InteractionFavorOptions,
  InteractionRewardOptions,
  StudentQuestionWebhookGetOptions,
  StudentQuestionWebhookSetOptions,
  StudentQuestionWebhookDeleteOptions,
  TeacherAnswerOptions,
} from '../types/interaction';
import { PolyVValidationError } from '../utils/errors';
import { apiParams, confirmWrite } from '../utils/api-command';

export class InteractionHandler extends BaseHandler {
  private readonly service: InteractionServiceSdk;

  constructor(authConfig: AuthConfig, serviceConfig: InteractionServiceConfig) {
    super();
    this.service = new InteractionServiceSdk(authConfig, serviceConfig);
  }

  async sendFavor(options: InteractionFavorOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'viewerId']);
      this.validateOptionalPositiveInteger('times', options.times);

      await confirmWrite(options.force, `Send favor for viewer ${options.viewerId}?`);
      const result = await this.service.sendFavor(this.compactOptions({
        channelId: options.channelId,
        viewerId: options.viewerId,
        times: options.times,
      }));

      this.displayGenericResult(result, options.output, 'Favor sent successfully');
    }, 'interaction.favor');
  }

  async sendRewardMsg(options: InteractionRewardOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'nickname', 'avatar', 'viewerId', 'donateType', 'content']);
      this.validateYn('needUserImage', options.needUserImage);

      await confirmWrite(options.force, `Send reward message for viewer ${options.viewerId}?`);
      const result = await this.service.sendRewardMsg(this.compactOptions({
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
      }));

      this.displayGenericResult(result, options.output, 'Reward message sent successfully');
    }, 'interaction.reward');
  }

  async getStudentQuestionWebhook(options: StudentQuestionWebhookGetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateOutputOption(options.output);
      const result = await this.service.getStudentQuestionWebhook(this.compactOptions({
        roomId: options.roomId,
      }));
      this.displayGenericResult(result, options.output);
    }, 'interaction.webhook.get');
  }

  async setStudentQuestionWebhook(options: StudentQuestionWebhookSetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['roomId', 'callbackUrl']);

      await confirmWrite(options.force, `Set student question webhook for room ${options.roomId}?`);
      const result = await this.service.setStudentQuestionWebhook({
        roomId: options.roomId,
        callbackUrl: options.callbackUrl,
      });

      this.displayGenericResult(result ?? { success: true }, options.output, 'Student question webhook saved successfully');
    }, 'interaction.webhook.set');
  }

  async deleteStudentQuestionWebhook(options: StudentQuestionWebhookDeleteOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['roomId']);

      await confirmWrite(options.force, `Delete student question webhook for room ${options.roomId}?`);
      const result = await this.service.deleteStudentQuestionWebhook({
        roomId: options.roomId,
      });

      this.displayGenericResult(result ?? { success: true }, options.output, 'Student question webhook deleted successfully');
    }, 'interaction.webhook.delete');
  }

  async sendTeacherAnswer(options: TeacherAnswerOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['roomId', 'content', 'viewerUserId']);

      await confirmWrite(options.force, `Send teacher answer to viewer ${options.viewerUserId}?`);
      const result = await this.service.sendTeacherAnswer(this.compactOptions({
        roomId: options.roomId,
        content: options.content,
        viewerUserId: options.viewerUserId,
        teacherNick: options.teacherNick,
        teacherPic: options.teacherPic,
        msgType: options.msgType,
      }));

      this.displayGenericResult(result, options.output, 'Teacher answer sent successfully');
    }, 'interaction.teacher-answer');
  }

  async listInteractionEvents(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['roomId']);
      const result = await this.service.listInteractionEvents(this.toV4Params(options));
      this.displayGenericResult(result, options.output);
    }, 'interaction.event.list');
  }

  async saveInteractionEvent(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'tasks', 'allDone']);

      await confirmWrite(options.force, `Save interaction event for channel ${options.channelId}?`);
      const result = await this.service.saveInteractionEvent(this.toV4Params(options));

      this.displayGenericResult(result, options.output, 'Interaction event saved successfully');
    }, 'interaction.event.save');
  }

  async deleteInteractionEvent(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'taskIds']);

      await confirmWrite(options.force, `Delete interaction event for channel ${options.channelId}?`);
      const result = await this.service.deleteInteractionEvent(this.toV4Params(options));

      this.displayGenericResult(result, options.output, 'Interaction event deleted successfully');
    }, 'interaction.event.delete');
  }

  async createInvitePoster(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'openId', 'nickname']);

      await confirmWrite(options.force, `Create invite poster for ${options.nickname}?`);
      const result = await this.service.createInvitePoster(this.toV4Params(options));

      this.displayGenericResult(result, options.output, 'Invite poster created successfully');
    }, 'interaction.invite-poster.create');
  }

  async queryDiskVideoCustomScript(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'diskVideoId']);
      const result = await this.service.queryDiskVideoCustomScript(this.toV4Params(options));
      this.displayGenericResult(result, options.output);
    }, 'interaction.script.query');
  }

  async uploadDiskVideoCustomScript(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'diskVideoId', 'filePath']);

      await confirmWrite(options.force, `Upload interaction script for disk video ${options.diskVideoId}?`);
      const result = await this.service.uploadDiskVideoCustomScript(this.toV4Params(options));

      this.displayGenericResult(result, options.output, 'Interaction script uploaded successfully');
    }, 'interaction.script.upload');
  }

  async deleteInteractionScript(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'id']);

      await confirmWrite(options.force, `Delete interaction script ${options.id}?`);
      const result = await this.service.deleteInteractionScript(this.toV4Params(options));

      this.displayGenericResult(result, options.output, 'Interaction script deleted successfully');
    }, 'interaction.script.delete');
  }

  async createTaskRewardActivity(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'activityName', 'taskRule', 'startTime', 'endTime', 'tasks']);
      this.validateArrayOption('tasks', options.tasks);

      await confirmWrite(options.force, `Create task reward activity "${options.activityName}"?`);
      const result = await this.service.createTaskRewardActivity(this.toV4Params(options));

      this.displayGenericResult(result, options.output, 'Task reward activity created successfully');
    }, 'interaction.task-reward.create');
  }

  async listTaskRewardActivities(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      this.validateOptionalPositiveInteger('page', options.page);
      this.validateOptionalPositiveInteger('size', options.size);
      const result = await this.service.listTaskRewardActivities(this.toV4Params(options));
      this.displayGenericResult(result, options.output);
    }, 'interaction.task-reward.list');
  }

  async listTaskRewardStats(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      this.validateOptionalPositiveInteger('page', options.page);
      this.validateOptionalPositiveInteger('size', options.size);
      const result = await this.service.listTaskRewardStats(this.toV4Params(options));
      this.displayGenericResult(result, options.output);
    }, 'interaction.task-reward.stats');
  }

  async listTaskRewardViewerDetails(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'activityId']);
      this.validateOptionalPositiveInteger('page', options.page);
      this.validateOptionalPositiveInteger('size', options.size);
      const result = await this.service.listTaskRewardViewerDetails(this.toV4Params(options));
      this.displayGenericResult(result, options.output);
    }, 'interaction.task-reward.viewer-detail');
  }

  async updateTaskRewardActivity(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'activityId', 'tasks']);
      this.validateArrayOption('tasks', options.tasks);

      await confirmWrite(options.force, `Update task reward activity ${options.activityId}?`);
      const result = await this.service.updateTaskRewardActivity(this.toV4Params(options));

      this.displayGenericResult(result, options.output, 'Task reward activity updated successfully');
    }, 'interaction.task-reward.update');
  }

  async deleteTaskRewardActivity(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['activityId']);

      await confirmWrite(options.force, `Delete task reward activity ${options.activityId}?`);
      const result = await this.service.deleteTaskRewardActivity(this.toV4Params(options));

      this.displayGenericResult(result, options.output, 'Task reward activity deleted successfully');
    }, 'interaction.task-reward.delete');
  }

  async stopTaskRewardActivity(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['activityId']);

      await confirmWrite(options.force, `Stop task reward activity ${options.activityId}?`);
      const result = await this.service.stopTaskRewardActivity(this.toV4Params(options));

      this.displayGenericResult(result, options.output, 'Task reward activity stopped successfully');
    }, 'interaction.task-reward.stop');
  }

  async listViewerTaskRewardDetails(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['viewerId']);
      this.validateOptionalPositiveInteger('page', options.page);
      this.validateOptionalPositiveInteger('size', options.size);
      const result = await this.service.listViewerTaskRewardDetails(this.toV4Params(options));
      this.displayGenericResult(result, options.output);
    }, 'interaction.task-reward.viewer-list');
  }

  async submitViewerTaskRewardAcceptInfo(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['id', 'viewerId', 'formInfo']);
      this.validateArrayOption('formInfo', options.formInfo);

      await confirmWrite(options.force, `Submit task reward accept info for viewer ${options.viewerId}?`);
      const result = await this.service.submitViewerTaskRewardAcceptInfo(this.toV4Params(options));

      this.displayGenericResult(result, options.output, 'Task reward accept info submitted successfully');
    }, 'interaction.task-reward.submit-accept-info');
  }

  private validateRequiredOptions(options: Record<string, any>, fields: string[]): void {
    const missing = fields.filter((field) => {
      const value = options[field];
      return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
    });

    if (missing.length > 0) {
      throw new PolyVValidationError(
        `Missing required options: ${missing.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }

    this.validateOutputOption(options.output);
  }

  private validateOutputOption(output: unknown): void {
    if (output && output !== 'table' && output !== 'json') {
      throw new PolyVValidationError(
        'output must be either "table" or "json"',
        'output',
        output,
        'validation_failed'
      );
    }
  }

  private validateOptionalPositiveInteger(field: string, value: number | undefined): void {
    if (value === undefined) return;
    if (!Number.isInteger(value) || value < 1) {
      throw new PolyVValidationError(
        `${field} must be a positive integer`,
        field,
        value,
        'validation_failed'
      );
    }
  }

  private validateYn(field: string, value?: string): void {
    if (value !== undefined && value !== 'Y' && value !== 'N') {
      throw new PolyVValidationError(
        `${field} must be Y or N`,
        field,
        value,
        'validation_failed'
      );
    }
  }

  private validateArrayOption(field: string, value: unknown): void {
    if (!Array.isArray(value) || value.length === 0) {
      throw new PolyVValidationError(
        `${field} must be a non-empty JSON array`,
        field,
        value,
        'validation_failed'
      );
    }
  }

  private compactOptions<T extends Record<string, any>>(options: T): any {
    return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined));
  }

  private toV4Params(options: Record<string, any>): Record<string, unknown> {
    const params = apiParams(options) as Record<string, unknown>;
    if (params.page !== undefined) {
      params.pageNumber = params.page;
      delete params.page;
    }
    if (params.size !== undefined) {
      params.pageSize = params.size;
      delete params.size;
    }
    return params;
  }

  private displayGenericResult(result: any, format?: OutputFormat, successMessage?: string): void {
    if (successMessage && format !== 'json') {
      this.displaySuccess(successMessage);
    }
    this.displayData(result ?? { success: true }, format || 'table');
  }
}
