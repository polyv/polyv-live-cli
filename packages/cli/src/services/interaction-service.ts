/**
 * @fileoverview SDK wrapper for cross-cutting live interaction operations
 */

import { PolyVClient } from 'polyv-live-api-sdk';
import { readFileSync } from 'fs';
import { AuthConfig } from '../types/auth';
import { PolyVError } from '../utils/errors';
import {
  InteractionServiceConfig,
  SendFavorParams,
  SendRewardMsgParams,
  GetStudentQuestionWebhookParams,
  SetStudentQuestionWebhookParams,
  DeleteStudentQuestionWebhookParams,
  SendTeacherAnswerParams,
} from '../types/interaction';

export class InteractionServiceSdk {
  private readonly client: PolyVClient;
  private readonly liveInteraction: any;
  private readonly v4Channel: PolyVClient['v4Channel'];

  constructor(authConfig: AuthConfig, _serviceConfig?: InteractionServiceConfig) {
    this.client = new PolyVClient(authConfig);
    this.liveInteraction = this.client.liveInteraction;
    this.v4Channel = this.client.v4Channel;
  }

  async sendFavor(params: SendFavorParams): Promise<any> {
    try {
      const result = await this.liveInteraction.sendFavor({
        channelId: params.channelId,
        viewerId: params.viewerId,
        times: params.times,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'sendFavor');
    }
  }

  async sendRewardMsg(params: SendRewardMsgParams): Promise<any> {
    try {
      const result = await this.liveInteraction.sendRewardMsg({
        channelId: params.channelId,
        nickname: params.nickname,
        avatar: params.avatar,
        viewerId: params.viewerId,
        donateType: params.donateType,
        content: params.content,
        goodImage: params.goodImage,
        sessionId: params.sessionId,
        goodNum: params.goodNum,
        needUserImage: params.needUserImage,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'sendRewardMsg');
    }
  }

  async getStudentQuestionWebhook(params: GetStudentQuestionWebhookParams): Promise<any> {
    try {
      const result = await this.liveInteraction.getStudentQuestionWebhook({
        roomId: params.roomId,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'getStudentQuestionWebhook');
    }
  }

  async setStudentQuestionWebhook(params: SetStudentQuestionWebhookParams): Promise<any> {
    try {
      const result = await this.liveInteraction.setStudentQuestionWebhook({
        roomId: params.roomId,
        callbackUrl: params.callbackUrl,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'setStudentQuestionWebhook');
    }
  }

  async deleteStudentQuestionWebhook(params: DeleteStudentQuestionWebhookParams): Promise<any> {
    try {
      const result = await this.liveInteraction.deleteStudentQuestionWebhook({
        roomId: params.roomId,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'deleteStudentQuestionWebhook');
    }
  }

  async sendTeacherAnswer(params: SendTeacherAnswerParams): Promise<any> {
    try {
      const result = await this.liveInteraction.sendTeacherAnswer({
        roomId: params.roomId,
        content: params.content,
        viewerUserId: params.viewerUserId,
        teacherNick: params.teacherNick,
        teacherPic: params.teacherPic,
        msgType: params.msgType,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'sendTeacherAnswer');
    }
  }

  async listInteractionEvents(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.listInteractionEvents(params as any);
    } catch (error) {
      throw this.wrapError(error, 'listInteractionEvents');
    }
  }

  async saveInteractionEvent(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.interactionEventSave(params as any);
    } catch (error) {
      throw this.wrapError(error, 'saveInteractionEvent');
    }
  }

  async deleteInteractionEvent(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.interactionEventDelete(params as any);
    } catch (error) {
      throw this.wrapError(error, 'deleteInteractionEvent');
    }
  }

  async createInvitePoster(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.createInvitePoster(params as any);
    } catch (error) {
      throw this.wrapError(error, 'createInvitePoster');
    }
  }

  async queryDiskVideoCustomScript(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.queryDiskVideoCustomScript(params as any);
    } catch (error) {
      throw this.wrapError(error, 'queryDiskVideoCustomScript');
    }
  }

  async uploadDiskVideoCustomScript(params: Record<string, unknown>): Promise<any> {
    try {
      const filePath = String(params.filePath ?? '');
      const bytes = readFileSync(filePath);
      const file = new Blob([bytes]);
      return await this.v4Channel.uploadDiskVideoCustomScript({
        channelId: params.channelId,
        diskVideoId: params.diskVideoId,
        labelId: params.labelId,
        file,
      } as any);
    } catch (error) {
      throw this.wrapError(error, 'uploadDiskVideoCustomScript');
    }
  }

  async deleteInteractionScript(params: Record<string, unknown>): Promise<any> {
    try {
      await this.v4Channel.deleteInteractionScript(params as any);
      return { success: true };
    } catch (error) {
      throw this.wrapError(error, 'deleteInteractionScript');
    }
  }

  async createTaskRewardActivity(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.createTaskRewardActivity(params as any);
    } catch (error) {
      throw this.wrapError(error, 'createTaskRewardActivity');
    }
  }

  async listTaskRewardActivities(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.listTaskRewardActivities(params as any);
    } catch (error) {
      throw this.wrapError(error, 'listTaskRewardActivities');
    }
  }

  async listTaskRewardStats(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.listTaskRewardStats(params as any);
    } catch (error) {
      throw this.wrapError(error, 'listTaskRewardStats');
    }
  }

  async listTaskRewardViewerDetails(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.listTaskRewardViewerDetails(params as any);
    } catch (error) {
      throw this.wrapError(error, 'listTaskRewardViewerDetails');
    }
  }

  async updateTaskRewardActivity(params: Record<string, unknown>): Promise<any> {
    try {
      await this.v4Channel.updateTaskRewardActivity(params as any);
      return { success: true };
    } catch (error) {
      throw this.wrapError(error, 'updateTaskRewardActivity');
    }
  }

  async deleteTaskRewardActivity(params: Record<string, unknown>): Promise<any> {
    try {
      await this.v4Channel.deleteTaskRewardActivity(params as any);
      return { success: true };
    } catch (error) {
      throw this.wrapError(error, 'deleteTaskRewardActivity');
    }
  }

  async stopTaskRewardActivity(params: Record<string, unknown>): Promise<any> {
    try {
      await this.v4Channel.stopTaskRewardActivity(params as any);
      return { success: true };
    } catch (error) {
      throw this.wrapError(error, 'stopTaskRewardActivity');
    }
  }

  async listViewerTaskRewardDetails(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.listViewerTaskRewardDetails(params as any);
    } catch (error) {
      throw this.wrapError(error, 'listViewerTaskRewardDetails');
    }
  }

  async submitViewerTaskRewardAcceptInfo(params: Record<string, unknown>): Promise<any> {
    try {
      await this.v4Channel.submitViewerTaskRewardAcceptInfo(params as any);
      return { success: true };
    } catch (error) {
      throw this.wrapError(error, 'submitViewerTaskRewardAcceptInfo');
    }
  }

  private wrapError(error: unknown, operation: string): PolyVError {
    if (error instanceof PolyVError) {
      return error;
    }
    const message = error instanceof Error ? error.message : String(error);
    return new PolyVError(
      `${operation} failed: ${message}`,
      'INTERACTION_API_ERROR',
      1,
      { originalError: error }
    );
  }
}
