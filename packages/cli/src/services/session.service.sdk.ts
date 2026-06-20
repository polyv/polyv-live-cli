/**
 * @fileoverview Session service using PolyV Live API SDK
 * @author Development Team
 * @since 9.6.0
 */

import {
  SessionListOptions,
  SessionServiceConfig,
  SessionDisplayItem,
} from '../types/session';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { createSdkClient } from '../sdk';

/**
 * Session service for managing PolyV live sessions using SDK
 */
export class SessionServiceSdk {
  private readonly config: SessionServiceConfig;
  private readonly authConfig: AuthConfig;

  /**
   * Creates a new SessionServiceSdk instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: SessionServiceConfig) {
    this.authConfig = authConfig;
    this.config = serviceConfig;
  }

  /**
   * Get session list for a channel or all channels
   * @param options Session list options from CLI
   * @returns Promise resolving to array of session display items
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getSessionList(options: SessionListOptions): Promise<{
    contents: SessionDisplayItem[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }> {
    // Validate parameters
    this.validateListOptions(options);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Build SDK params - convert string channelId to number
    // Note: Include channelId as undefined if not provided, to satisfy test expectations
    const params: {
      channelId?: number | undefined;
      pageNumber?: number;
      pageSize?: number;
    } = {
      channelId: (options.channelId !== undefined && options.channelId !== '')
        ? parseInt(options.channelId, 10)
        : undefined,
    };

    if (options.page !== undefined) {
      params.pageNumber = options.page;
    }
    if (options.pageSize !== undefined) {
      params.pageSize = options.pageSize;
    }

    // Call SDK - sessionList now accepts optional channelId
    const result = await client.v4Channel.sessionList(params);

    // Transform data for CLI display
    return {
      contents: (result.contents || []).map((item) => this.transformToDisplayItem(item)),
      pageNumber: result.pageNumber,
      pageSize: result.pageSize,
      totalItems: result.totalItems || 0,
      totalPages: result.totalPages || 0,
    };
  }

  /**
   * Get a single session by sessionId
   * @param channelId Channel ID
   * @param sessionId Session ID
   * @returns Promise resolving to session display item
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getSession(channelId: string, sessionId: string): Promise<SessionDisplayItem> {
    // Validate parameters
    this.validateGetParams(channelId, sessionId);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK - convert channelId string to number
    const result = await client.v4Channel.sessionGet({
      channelId: parseInt(channelId, 10),
      sessionId,
    });

    // Transform data for CLI display
    return this.transformToDisplayItem(result);
  }

  async listLegacyChannelSessions(options: {
    channelId: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.listChannelSessions(options);
  }

  async getSessionDataList(options: {
    channelId: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getSessionDataList(options);
  }

  async getSessionExternalBySession(channelId: string, sessionId: string): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.getSessionExternalBySession({ channelId, sessionId });
  }

  async createSession(options: {
    channelId: string;
    name: string;
    planStartTime?: number;
    planEndTime?: number;
    splashImg?: string;
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.sessionCreate(options);
  }

  async updateSession(options: {
    channelId: string;
    sessionId: string;
    name?: string;
    planStartTime?: number;
    planEndTime?: number;
    splashImg?: string;
  }): Promise<void> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    await client.v4Channel.sessionUpdate(options);
  }

  async deleteSession(channelId: string, sessionId: string): Promise<void> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    await client.v4Channel.sessionDelete({ channelId, sessionId });
  }

  async getSessionByExternal(channelId: string, externalSessionId: string): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getSessionByExternal({ channelId, externalSessionId });
  }

  async listFileIdByExternal(channelId: string, externalSessionId: string): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.listFileIdByExternal({ channelId, externalSessionId });
  }

  async relevanceSession(channelId: string, externalSessionId: string): Promise<string> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.relevanceSession({ channelId, externalSessionId });
  }

  /**
   * Transform SDK SessionInfo to CLI SessionDisplayItem
   * @param item SDK SessionInfo object
   * @returns CLI SessionDisplayItem object
   */
  private transformToDisplayItem(item: any): SessionDisplayItem {
    const displayItem: SessionDisplayItem = {
      sessionId: item.sessionId,
      channelId: String(item.channelId),
      status: item.status,
    };

    // Only add optional fields if they have values
    if (item.name !== undefined) displayItem.name = item.name;
    if (item.startTime !== undefined) displayItem.startTime = item.startTime;
    if (item.endTime !== undefined) displayItem.endTime = item.endTime;
    if (item.createdTime !== undefined) displayItem.createdTime = item.createdTime;
    if (item.planStartTime !== undefined) displayItem.planStartTime = item.planStartTime;
    if (item.planEndTime !== undefined) displayItem.planEndTime = item.planEndTime;
    if (item.streamType !== undefined) displayItem.streamType = item.streamType;
    if (item.pushClient !== undefined) displayItem.pushClient = item.pushClient;
    if (item.watchUrl !== undefined) displayItem.watchUrl = item.watchUrl;
    if (item.userId !== undefined) displayItem.userId = item.userId;
    if (item.splashImg !== undefined) displayItem.splashImg = item.splashImg;
    if (item.splashLargeImg !== undefined) displayItem.splashLargeImg = item.splashLargeImg;

    return displayItem;
  }

  /**
   * Validates session list options
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateListOptions(options: SessionListOptions): void {
    const errors: string[] = [];

    // Validate channelId parameter (optional, but must be non-empty if provided)
    if (options.channelId !== undefined && options.channelId !== '' &&
        (typeof options.channelId !== 'string' || options.channelId.trim().length === 0)) {
      errors.push('channelId must be a non-empty string if provided');
    }

    // Validate page if specified
    if (options.page !== undefined && (!Number.isInteger(options.page) || options.page < 1)) {
      errors.push('page must be a positive integer');
    }

    // Validate pageSize if specified
    if (options.pageSize !== undefined && (!Number.isInteger(options.pageSize) || options.pageSize < 1)) {
      errors.push('pageSize must be a positive integer');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Session list options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  /**
   * Validates get parameters
   * @param channelId Channel ID
   * @param sessionId Session ID
   * @throws {PolyVValidationError} When validation fails
   */
  private validateGetParams(channelId: string, sessionId: string): void {
    const errors: string[] = [];

    // Validate channelId parameter
    if (!channelId || typeof channelId !== 'string' || channelId.trim().length === 0) {
      errors.push('channelId is required and must be a non-empty string');
    }

    // Validate sessionId parameter
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      errors.push('sessionId is required and must be a non-empty string');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Session get parameters validation failed: ${errors.join(', ')}`,
        'params',
        { channelId, sessionId },
        'validation_failed'
      );
    }
  }
}
