/**
 * @fileoverview SDK wrapper for cross-cutting live interaction operations
 */

import { PolyVClient } from 'polyv-live-api-sdk';
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

  constructor(authConfig: AuthConfig, _serviceConfig?: InteractionServiceConfig) {
    this.client = new PolyVClient(authConfig);
    this.liveInteraction = this.client.liveInteraction;
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
