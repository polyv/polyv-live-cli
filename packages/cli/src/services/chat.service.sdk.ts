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

function compactParams<T extends Record<string, unknown>>(params: T): any {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined));
}

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

  async sendChat(options: { channelId: string; userId: string; content?: string; imgUrl?: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.sendChat(compactParams({
      channelId: options.channelId,
      userId: options.userId,
      content: options.content,
      imgUrl: options.imgUrl,
    }));
  }

  async sendHiddenByAdmin(options: { channelId: string; content: string; role: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.sendHiddenByAdmin(compactParams({
      channelId: options.channelId,
      content: options.content,
      role: options.role,
    }));
  }

  async countOnlineUser(options: { channelId: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.countOnlineUser(options);
  }

  async getSpeakList(options: { startTime?: number; endTime?: number; cursor?: string; size?: number }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.getSpeakList(compactParams({
      startTime: options.startTime,
      endTime: options.endTime,
      cursor: options.cursor,
      size: options.size,
    }));
  }

  async alertToSpecial(options: { channelId: string; title: string; message: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.alertToSpecial(compactParams({
      channelId: options.channelId,
      title: options.title,
      message: options.message,
    }));
  }

  async messageAudit(options: { channelId: string; messages: any[] }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.messageAudit(compactParams({
      channelId: options.channelId,
      messages: options.messages,
    }));
  }

  async sendCustomMessage(options: {
    channelId: string;
    content?: string;
    imgUrl?: string;
    joinHistoryList?: boolean;
    watchType?: string;
    important?: boolean;
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.v4Chat.sendCustomMessage(compactParams({
      channelId: options.channelId,
      content: options.content,
      imgUrl: options.imgUrl,
      joinHistoryList: options.joinHistoryList,
      watchType: options.watchType,
      important: options.important,
    }));
  }

  async sendCustomMessageEncode(options: {
    channelId: string;
    content?: string;
    imgUrl?: string;
    joinHistoryList?: 0 | 1;
    watchType?: string;
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.v4Chat.sendCustomMessageEncode(compactParams({
      channelId: options.channelId,
      content: options.content,
      imgUrl: options.imgUrl,
      joinHistoryList: options.joinHistoryList,
      watchType: options.watchType,
    }));
  }

  async emitByUserId(options: { roomId: string; userIds: string[]; payload: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.other.emitByUserId(compactParams({
      roomId: options.roomId,
      userIds: options.userIds,
      payload: options.payload,
    }));
  }

  async getUserBadwordList(): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.getUserBadwordList();
  }

  async addBadwords(options: { userId: string; words: string[]; channelId?: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.addBadwords(compactParams({
      userId: options.userId,
      words: options.words,
      channelId: options.channelId,
    }));
  }

  async deleteUserBadword(options: { words: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.deleteUserBadword(options);
  }

  async addBannedIp(options: { channelId: string; ip: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.addBannedIp(options);
  }

  async getUserBannedList(options: { page?: number; size?: number }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.getUserBannedList(compactParams({
      page: options.page,
      size: options.size,
    }));
  }

  async getForbidUserList(options: {
    viewerId?: string;
    nickName?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.getForbidUserList(compactParams({
      viewerId: options.viewerId,
      nickName: options.nickName,
      pageNumber: options.pageNumber,
      pageSize: options.pageSize,
    }));
  }

  async deleteChannelBanned(options: { channelId: string; type: 'ip' | 'badword'; content: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.deleteChannelBanned(compactParams({
      channelId: options.channelId,
      type: options.type,
      content: options.content,
    }));
  }

  async listBulletins(options: { channelId: string; pageNumber: number; pageSize: number; sort?: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.v4Chat.listBulletins(compactParams({
      channelId: options.channelId,
      pageNumber: options.pageNumber,
      pageSize: options.pageSize,
      sort: options.sort,
    }));
  }

  async addBulletin(options: { channelId: string; content: string; isTop?: 'Y' | 'N'; isPop?: 'Y' | 'N' }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.v4Chat.addBulletin(compactParams({
      channelId: options.channelId,
      content: options.content,
      isTop: options.isTop,
      isPop: options.isPop,
    }));
  }

  async cleanNotices(options: { channelId: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.v4Chat.cleanNotices(options);
  }

  async listQa(options: { channelId: string; pageNumber: number; pageSize: number }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.v4Chat.listQa(compactParams({
      channelId: options.channelId,
      pageNumber: options.pageNumber,
      pageSize: options.pageSize,
    }));
  }

  async updateCensorEnabled(options: { channelId: string; enabled?: 'Y' | 'N' }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.updateCensorEnabled(compactParams({
      channelId: options.channelId,
      enabled: options.enabled,
    }));
  }

  async getAdminInfo(options: { channelId: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.getAdminInfo(options.channelId);
  }

  async updateAdminInfo(options: { channelId: string; nickname: string; actor: string; avatar?: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.updateAdminInfo(compactParams({
      channelId: options.channelId,
      nickname: options.nickname,
      actor: options.actor,
      avatar: options.avatar,
    }));
  }

  async getTeacherInfo(options: { channelId: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.getTeacherInfo(options);
  }

  async updateTeacherInfo(options: {
    channelId: string;
    nickname?: string;
    actor?: string;
    passwd?: string;
    avatar?: string;
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.updateTeacherInfo(compactParams({
      channelId: options.channelId,
      nickname: options.nickname,
      actor: options.actor,
      passwd: options.passwd,
      avatar: options.avatar,
    }));
  }

  async getUserList(options: { roomId: string; page?: number; len?: number; toGetSubRooms?: boolean }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.chat.getUserList(compactParams({
      roomId: options.roomId,
      page: options.page,
      len: options.len,
      toGetSubRooms: options.toGetSubRooms,
    }));
  }

  async getRobotSetting(options: { channelId: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.v4Chat.getRobotSetting(options);
  }

  async getRobotStats(options: { channelId: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.v4Robot.getRobotStats(options);
  }

  async updateRobotSetting(options: {
    channelId: string;
    robotNumber: number;
    addRobotModel: 'timely' | 'fixed_time';
    changeTime?: number;
    virtualBookingNumber?: number;
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.v4Robot.updateRobotSetting(compactParams({
      channelId: options.channelId,
      robotNumber: options.robotNumber,
      addRobotModel: options.addRobotModel,
      changeTime: options.changeTime,
      virtualBookingNumber: options.virtualBookingNumber,
    }));
  }

  async updateRobotListSetting(options: {
    channelId: string;
    robotNumber: number;
    addRobotModel: 'timely' | 'fixed_time';
    changeTime?: number;
    virtualBookingNumber?: number;
    robotList?: Array<{ name: string; avatar: string }>;
    robotRandomMemberEnabled?: 'Y' | 'N';
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.v4Chat.updateRobotListSetting(compactParams({
      channelId: options.channelId,
      robotNumber: options.robotNumber,
      addRobotModel: options.addRobotModel,
      changeTime: options.changeTime,
      virtualBookingNumber: options.virtualBookingNumber,
      robotList: options.robotList,
      robotRandomMemberEnabled: options.robotRandomMemberEnabled,
    }));
  }

  async pauseRobot(options: { channelId: string }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return await client.v4Robot.pauseRobot(options);
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
