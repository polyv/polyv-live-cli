/**
 * @fileoverview SDK wrapper for checkin operations
 * @author Development Team
 * @since 11.3.0
 */

import { PolyVClient } from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import { PolyVError } from '../utils/errors';
import {
  CheckinServiceConfig,
  StartCheckinParams,
  ListCheckinsParams,
  GetCheckinResultParams,
  GetCheckinBySessionIdParams,
  ListSessionsParams,
} from '../types/checkin';

/**
 * SDK wrapper for checkin operations
 * Encapsulates V4ChatService.batchCheckin and LiveInteractionService checkin methods
 */
export class CheckinServiceSdk {
  private readonly client: PolyVClient;
  private readonly v4Chat: any;
  private readonly liveInteraction: any;

  /**
   * Creates a new CheckinServiceSdk instance
   * @param authConfig Authentication configuration
   * @param _serviceConfig Service configuration (currently unused but required for consistency)
   */
  constructor(authConfig: AuthConfig, _serviceConfig?: CheckinServiceConfig) {
    this.client = new PolyVClient(authConfig);
    this.v4Chat = this.client.v4Chat;
    this.liveInteraction = this.client.liveInteraction;
  }

  /**
   * Start a checkin session using V4 API
   * @param params Checkin start parameters
   * @returns API response
   */
  async startCheckin(params: StartCheckinParams): Promise<any> {
    try {
      // Convert single channelId to array for batch API
      const channelIds = params.channelId.includes(',')
        ? params.channelId.split(',').map(id => id.trim())
        : [params.channelId];

      // Build items array in SDK-expected format
      const items = channelIds.map(channelId => {
        const item: any = { channelId };

        if (params.limitTime !== undefined) {
          item.limitTime = params.limitTime;
        }
        if (params.delayTime !== undefined) {
          item.delayTime = params.delayTime;
        }
        if (params.message !== undefined) {
          item.message = params.message;
        }
        if (params.forceCheckInEnabled !== undefined) {
          item.forceCheckInEnabled = params.forceCheckInEnabled;
        }

        return item;
      });

      const result = await this.v4Chat.batchCheckin({ items });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'startCheckin');
    }
  }

  /**
   * List checkin records
   * @param params List parameters
   * @returns API response with checkin records
   */
  async listCheckins(params: ListCheckinsParams): Promise<any> {
    try {
      const result = await this.liveInteraction.getCheckinList({
        channelId: params.channelId,
        page: params.page,
        pageSize: params.pageSize,
        date: params.date,
        sessionId: params.sessionId,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'listCheckins');
    }
  }

  /**
   * Get checkin result details (including checked and unchecked users)
   * @param params Result parameters
   * @returns API response with checkin details
   */
  async getCheckinResult(params: GetCheckinResultParams): Promise<any> {
    try {
      const result = await this.liveInteraction.getCheckinByCheckinId({
        channelId: params.channelId,
        checkinId: params.checkinId,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'getCheckinResult');
    }
  }

  /**
   * Get checkin records by live session ID
   * @param params Session result parameters
   * @returns API response with session checkin details
   */
  async getCheckinBySessionId(params: GetCheckinBySessionIdParams): Promise<any> {
    try {
      const result = await this.liveInteraction.getCheckinBySessionId({
        channelId: params.channelId,
        sessionId: params.sessionId,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'getCheckinBySessionId');
    }
  }

  /**
   * List checkin sessions by time range
   * @param params Session list parameters
   * @returns API response with session list
   */
  async listSessions(params: ListSessionsParams): Promise<any> {
    try {
      const result = await this.liveInteraction.getCheckinByTime({
        channelId: params.channelId,
        startDate: params.startDate,
        endDate: params.endDate,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'listSessions');
    }
  }

  /**
   * Wrap SDK errors with PolyVError for consistent error handling
   */
  private wrapError(error: unknown, operation: string): PolyVError {
    if (error instanceof PolyVError) {
      return error;
    }
    const message = error instanceof Error ? error.message : String(error);
    return new PolyVError(
      `${operation} failed: ${message}`,
      'CHECKIN_API_ERROR',
      1,
      { originalError: error }
    );
  }
}
