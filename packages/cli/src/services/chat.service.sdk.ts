/**
 * @fileoverview Chat service SDK wrapper for CLI
 * @author Development Team
 * @since 11.1.0
 */

import type {
  ChatHistoryPageResponse,
  SendAdminMsgResponse,
  UpdateBannedUserResponse,
  UpdateBannedViewerResponse,
  ForbidChannelKickUsersResponse,
  GetChannelBannedUserListResponse,
  GetChannelBannedListResponse,
  GetChannelKickedUserListResponse,
} from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { createSdkClient } from '../sdk';
import {
  ChatServiceConfig,
  ChatSendOptions,
  ChatListOptions,
  ChatDeleteOptions,
} from '../types/chat';

/**
 * Chat service for managing PolyV live streaming chat messages using SDK
 */
export class ChatServiceSdk {
  private readonly config: ChatServiceConfig;
  private readonly authConfig: AuthConfig;

  /**
   * Creates a new ChatServiceSdk instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: ChatServiceConfig) {
    this.authConfig = authConfig;
    this.config = serviceConfig;
  }

  /**
   * Sends an admin message to the channel chat
   * @param options Chat send options from CLI
   * @returns Promise resolving to send result
   */
  async sendAdminMessage(options: ChatSendOptions): Promise<SendAdminMsgResponse> {
    // Validate required fields
    this.validateSendOptions(options);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Build params object with only defined values
    const params: Record<string, unknown> = {
      channelId: options.channelId,
    };
    if (options.msg) params.msg = options.msg;
    if (options.imgUrl) params.imgUrl = options.imgUrl;
    if (options.pic) params.pic = options.pic;
    if (options.nickName) params.nickName = options.nickName;
    if (options.actor) params.actor = options.actor;
    if (options.adminIndex !== undefined) params.adminIndex = options.adminIndex;

    // Call SDK
    return await client.chat.sendAdminMsg(params as any);
  }

  /**
   * Lists chat history with pagination
   * @param options Chat list options from CLI
   * @returns Promise resolving to array of chat messages
   */
  async listMessages(options: ChatListOptions): Promise<ChatHistoryPageResponse> {
    // Validate required fields
    this.validateListOptions(options);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Build params object with only defined values
    const params: Record<string, unknown> = {
      channelId: options.channelId,
    };
    if (options.startDay) params.startDay = options.startDay;
    if (options.endDay) params.endDay = options.endDay;
    if (options.page !== undefined) params.page = options.page;
    if (options.size !== undefined) params.pageSize = options.size;
    if (options.userType) params.userType = options.userType;
    if (options.status) params.status = options.status;

    return await client.chat.getHistoryPage(params as any);
  }

  /**
   * Deletes a chat message or clears all messages
   * @param options Chat delete options from CLI
   * @returns Promise resolving when delete is complete
   */
  async deleteMessage(options: ChatDeleteOptions): Promise<void> {
    // Validate required fields
    this.validateDeleteOptions(options);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    if (options.clear) {
      await client.chat.cleanChat({
        channelId: options.channelId,
      });
    } else if (options.messageId) {
      await client.chat.delChat({
        channelId: options.channelId,
        id: options.messageId,
      });
    }
  }

  /**
   * Bans users at channel or global level
   * @param options Ban options from CLI
   * @returns Promise resolving to ban result
   */
  async updateBannedUser(options: { channelId: string; userIds: string; toBanned: 'Y' | 'N' }): Promise<UpdateBannedUserResponse> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.updateBannedUser({
      channelId: options.channelId,
      userIds: options.userIds,
      toBanned: options.toBanned,
    });
  }

  /**
   * Bans users globally (account level)
   * @param options Ban options from CLI
   * @returns Promise resolving to ban result
   */
  async updateBannedViewer(options: { viewerIds: string[]; banned: 'Y' | 'N' }): Promise<UpdateBannedViewerResponse> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.updateBannedViewer({
      viewerIds: options.viewerIds,
      banned: options.banned,
    });
  }

  /**
   * Kicks users at channel level
   * @param options Kick options from CLI
   * @returns Promise resolving to kick result
   */
  async forbidChannelKickUsers(options: { channelId: string; viewerIds: string[]; nickNames: string[] }): Promise<ForbidChannelKickUsersResponse> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.forbidChannelKickUsers(
      { channelId: options.channelId },
      { viewerIds: options.viewerIds, nickNames: options.nickNames }
    );
  }

  /**
   * Kicks users globally (platform level)
   * @param options Kick options from CLI
   * @returns Promise resolving to kick result
   */
  async forbidKickUsers(options: { viewerIds: string[]; nickNames: string[] }): Promise<ForbidChannelKickUsersResponse> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.forbidKickUsers({
      viewerIds: options.viewerIds,
      nickNames: options.nickNames,
    });
  }

  /**
   * Unkicks users at channel level
   * @param options Unkick options from CLI
   * @returns Promise resolving to unkick result
   */
  async forbidChannelUnkickUsers(options: { channelId: string; viewerIds: string[]; nickNames: string[] }): Promise<ForbidChannelKickUsersResponse> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.forbidChannelUnkickUsers(
      { channelId: options.channelId },
      { viewerIds: options.viewerIds, nickNames: options.nickNames }
    );
  }

  /**
   * Unkicks users globally (platform level)
   * @param options Unkick options from CLI
   * @returns Promise resolving to unkick result
   */
  async forbidUnkickUsers(options: { viewerIds: string[]; nickNames: string[] }): Promise<ForbidChannelKickUsersResponse> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.forbidUnkickUsers({
      viewerIds: options.viewerIds,
      nickNames: options.nickNames,
    });
  }

  /**
   * Gets banned user list (userId or IP)
   * @param options Banned list options from CLI
   * @returns Promise resolving to banned user list
   */
  async getChannelBannedUserList(options: { channelId: string; type: 'userId' | 'ip' }): Promise<GetChannelBannedUserListResponse> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.getChannelBannedUserList({
      channelId: options.channelId,
      type: options.type,
    });
  }

  /**
   * Gets banned badword list
   * @param options Banned list options from CLI
   * @returns Promise resolving to banned badword list
   */
  async getChannelBannedList(options: { channelId: string; type?: 'badword' | 'ip' }): Promise<GetChannelBannedListResponse> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    const params: { channelId: string; type?: 'badword' | 'ip' } = {
      channelId: options.channelId,
    };
    if (options.type) {
      params.type = options.type;
    }
    return await client.chat.getChannelBannedList(params);
  }

  /**
   * Gets kicked user list
   * @param options Kicked list options from CLI
   * @returns Promise resolving to kicked user list
   */
  async getChannelKickedUserList(options: { channelId: string }): Promise<GetChannelKickedUserListResponse> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.getChannelKickedUserList({
      channelId: options.channelId,
    });
  }

  async getGroupLoginTimes(options: { channelId: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.other.getGroupLoginTimes({
      channelId: options.channelId,
    });
  }

  // ===== Validation Methods =====

  private validateSendOptions(options: ChatSendOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (!options.msg && !options.imgUrl) {
      errors.push('msg or imgUrl is required');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Chat send options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateListOptions(options: ChatListOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (options.page !== undefined && (typeof options.page !== 'number' || options.page < 1)) {
      errors.push('page must be a positive integer');
    }

    if (options.size !== undefined && (typeof options.size !== 'number' || options.size < 1 || options.size > 100)) {
      errors.push('pageSize must be an integer between 1 and 100');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Chat list options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateDeleteOptions(options: ChatDeleteOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (!options.clear && !options.messageId) {
      errors.push('messageId is required when --clear is not specified');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Chat delete options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }
}
