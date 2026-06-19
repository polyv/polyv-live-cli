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
import { confirmWrite } from '../utils/api-command';

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

  private compactOptions<T extends Record<string, any>>(options: T): any {
    return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined));
  }

  private displayGenericResult(result: any, format?: OutputFormat, successMessage?: string): void {
    if (successMessage && format !== 'json') {
      this.displaySuccess(successMessage);
    }
    this.displayData(result ?? { success: true }, format || 'table');
  }
}
