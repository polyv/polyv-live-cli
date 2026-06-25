/**
 * @fileoverview Chat command handler for CLI operations
 * @author Development Team
 * @since 11.1.0
 */

import { BaseHandler } from './base.handler';
import { ChatServiceSdk } from '../services/chat.service.sdk';
import {
  ChatSendOptions,
  ChatListOptions,
  ChatDeleteOptions,
  ChatBanOptions,
  ChatUnbanOptions,
  ChatKickOptions,
  ChatUnkickOptions,
  ChatBannedListOptions,
  ChatKickedListOptions,
  ChatServiceConfig,
  OutputFormat
} from '../types/chat';
import { AuthConfig } from '../types/auth';
import { confirmDeletion } from '../utils/confirmation';
import { PolyVValidationError } from '../utils/errors';

import type { ChatHistoryPageResponse, ChatMessage, SendAdminMsgResponse } from 'polyv-live-api-sdk';

/**
 * Handler for chat-related CLI commands
 */
export class ChatHandler extends BaseHandler {
  private readonly chatService: ChatServiceSdk;

  /**
   * Creates a new ChatHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Chat service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: ChatServiceConfig) {
    super();
    this.chatService = new ChatServiceSdk(authConfig, serviceConfig);
  }

  // ========================================
  // chat send (AC #1)
  // ========================================

  /**
   * Sends an admin message to the channel chat
   * @param options Chat send options from CLI
   * @returns Promise that resolves when message is sent
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   *
   * @example
   * ```typescript
   * await chatHandler.sendAdminMessage({
   *   channelId: '3151318',
   *   msg: 'Hello World',
   *   output: 'table'
   * });
   * ```
   */
  async sendAdminMessage(options: ChatSendOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateSendOptions(options);

      // Call SDK service
      const result = await this.chatService.sendAdminMessage(options);

      // Display results
      this.displaySendResult(result, options.output);

    }, 'chat.send');
  }

  // ========================================
  // chat list (AC #2)
  // ========================================

  /**
   * Lists chat history with pagination support
   * @param options Chat list options from CLI
   * @returns Promise that resolves when messages are listed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   *
   * @example
   * ```typescript
   * await chatHandler.listMessages({
   *   channelId: '3151318',
   *   page: 1,
   *   size: 20,
   *   output: 'table'
   * });
   * ```
   */
  async listMessages(options: ChatListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateListOptions(options);

      // Call SDK service
      const result = await this.chatService.listMessages(options);

      // Display results
      this.displayListResult(result, options);

    }, 'chat.list');
  }

  // ========================================
  // chat delete (AC #3)
  // ========================================

  /**
   * Deletes a chat message or clears all messages
   * @param options Chat delete options from CLI
   * @returns Promise that resolves when delete is complete
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   *
   * @example
   * ```typescript
   * // Delete single message
   * await chatHandler.deleteMessage({
   *   channelId: '3151318',
   *   messageId: 'abc123',
   *   output: 'table'
   * });
   *
   * // Clear all messages
   * await chatHandler.deleteMessage({
   *   channelId: '3151318',
   *   clear: true,
   *   output: 'table'
   * });
   * ```
   */
  async deleteMessage(options: ChatDeleteOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateDeleteOptions(options);

      // Check if confirmation is needed (skip if force is true)
      if (!options.force) {
        if (!options.clear) {
          const confirmed = await confirmDeletion(
            `Are you sure you want to delete message "${options.messageId}"? This action cannot be undone.`,
            'yes'
          );
          if (!confirmed) {
            this.displayInfo('Operation cancelled');
            return;
          }
        } else {
          const confirmed = await confirmDeletion(
            'Are you sure you want to clear all chat messages? This action cannot be undone.',
            'yes'
          );
          if (!confirmed) {
            this.displayInfo('Operation cancelled');
            return;
          }
        }
      }

      // Call SDK service
      await this.chatService.deleteMessage(options);

      // Display results
      this.displayDeleteResult(options);

    }, 'chat.delete');
  }

  async getGroupLoginTimes(options: { channelId: string; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      if (!options.channelId || options.channelId.trim() === '') {
        throw new PolyVValidationError(
          'channelId is required',
          'channelId',
          options.channelId,
          'validation_failed'
        );
      }
      this.displayData(await this.chatService.getGroupLoginTimes({ channelId: options.channelId }), options.output || 'table');
    }, 'chat.group-login-times.get');
  }

  async sendHiddenMessage(options: {
    channelId: string;
    userId: string;
    content?: string;
    imgUrl?: string;
    output?: OutputFormat;
  }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'userId']);
      this.validateContentOrImage(options);
      const result = await this.chatService.sendChat(options);
      this.displayGenericResult(result, options.output, 'Hidden message sent successfully');
    }, 'chat.message.hidden-send');
  }

  async sendHiddenByAdmin(options: {
    channelId: string;
    content: string;
    role: string;
    output?: OutputFormat;
  }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'content', 'role']);
      const result = await this.chatService.sendHiddenByAdmin(options);
      this.displayGenericResult(result, options.output, 'Admin hidden message sent successfully');
    }, 'chat.message.admin-send');
  }

  async countOnlineUser(options: { channelId: string; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      const result = await this.chatService.getChatOnlineCount(options.channelId);
      this.displayGenericResult({ channelId: options.channelId, onlineUserCount: result }, options.output);
    }, 'chat.message.online-count');
  }

  async removeChatContents(options: { channelId: string; ids: string[]; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'ids']);
      if (!(await this.confirmIfNeeded(options.force, `Remove chat message(s) ${options.ids.join(',')} from channel ${options.channelId}?`))) return;
      const result = await this.chatService.removeChatContents({
        channelId: options.channelId,
        ids: options.ids,
      });
      this.displayGenericResult(result, options.output, 'Chat message(s) removed successfully');
    }, 'chat.message.remove-contents');
  }

  async listSpeak(options: {
    startTime?: number;
    endTime?: number;
    cursor?: string;
    size?: number;
    output?: OutputFormat;
  }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.chatService.getSpeakList(options);
      this.displayGenericResult(result, options.output);
    }, 'chat.message.speak-list');
  }

  async alertToSpecial(options: {
    channelId: string;
    title: string;
    message: string;
    force?: boolean;
    output?: OutputFormat;
  }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'title', 'message']);
      if (!(await this.confirmIfNeeded(options.force, `Send popup alert to channel ${options.channelId}?`))) return;
      const result = await this.chatService.alertToSpecial(options);
      this.displayGenericResult(result, options.output, 'Popup alert sent successfully');
    }, 'chat.message.alert-special');
  }

  async auditMessage(options: {
    channelId: string;
    msgId: string;
    viewerId: string;
    nickName: string;
    content: string;
    avatar?: string;
    sessionId?: string;
    viewerType?: string;
    force?: boolean;
    output?: OutputFormat;
  }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'msgId', 'viewerId', 'nickName', 'content']);
      if (!(await this.confirmIfNeeded(options.force, `Submit audited chat message ${options.msgId}?`))) return;
      const result = await this.chatService.messageAudit({
        channelId: options.channelId,
        messages: [{
          msgId: options.msgId,
          viewerId: options.viewerId,
          nickName: options.nickName,
          content: options.content,
          avatar: options.avatar,
          sessionId: options.sessionId,
          viewerType: options.viewerType
        }]
      });
      this.displayGenericResult(result, options.output, 'Audited message submitted successfully');
    }, 'chat.message.audit');
  }

  async sendCustomMessage(options: {
    channelId: string;
    content?: string;
    imgUrl?: string;
    joinHistoryList?: boolean;
    watchType?: string;
    important?: boolean;
    force?: boolean;
    output?: OutputFormat;
  }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      this.validateContentOrImage(options);
      if (!(await this.confirmIfNeeded(options.force, `Send custom message to channel ${options.channelId}?`))) return;
      const result = await this.chatService.sendCustomMessage(options);
      this.displayGenericResult(result ?? { success: true }, options.output, 'Custom message sent successfully');
    }, 'chat.message.custom-send');
  }

  async sendCustomMessageEncode(options: {
    channelId: string;
    content?: string;
    imgUrl?: string;
    joinHistoryList?: 0 | 1;
    watchType?: string;
    force?: boolean;
    output?: OutputFormat;
  }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      this.validateContentOrImage(options);
      if (!(await this.confirmIfNeeded(options.force, `Send encoded custom message to channel ${options.channelId}?`))) return;
      const result = await this.chatService.sendCustomMessageEncode(options);
      this.displayGenericResult(result ?? { success: true }, options.output, 'Encoded custom message sent successfully');
    }, 'chat.message.custom-send-encode');
  }

  async emitByUserId(options: { roomId: string; userIds: string[]; payload: string; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['roomId', 'payload']);
      if (!options.userIds || options.userIds.length === 0) {
        throw new PolyVValidationError('userIds is required', 'userIds', options.userIds, 'validation_failed');
      }
      if (!(await this.confirmIfNeeded(options.force, `Broadcast message to ${options.userIds.length} users in room ${options.roomId}?`))) return;
      const result = await this.chatService.emitByUserId(options);
      this.displayGenericResult(result ?? { success: true }, options.output, 'Broadcast message sent successfully');
    }, 'chat.message.emit-by-user-id');
  }

  async listUserBadwords(options: { output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.chatService.getUserBadwordList();
      this.displayGenericResult(result, options.output);
    }, 'chat.badword.list');
  }

  async addBadwords(options: { userId: string; words: string[]; channelId?: string; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['userId']);
      if (!options.words || options.words.length === 0) {
        throw new PolyVValidationError('words is required', 'words', options.words, 'validation_failed');
      }
      if (!(await this.confirmIfNeeded(options.force, `Add ${options.words.length} badword(s)?`))) return;
      const result = await this.chatService.addBadwords(options);
      this.displayGenericResult(result, options.output, 'Badwords added successfully');
    }, 'chat.badword.add');
  }

  async deleteUserBadword(options: { words: string; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['words']);
      if (!(await this.confirmIfNeeded(options.force, `Delete account badword(s): ${options.words}?`))) return;
      const result = await this.chatService.deleteUserBadword({ words: options.words });
      this.displayGenericResult(result, options.output, 'Account badwords deleted successfully');
    }, 'chat.badword.delete');
  }

  async addBannedIp(options: { channelId: string; ip: string; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'ip']);
      if (!(await this.confirmIfNeeded(options.force, `Ban IP ${options.ip} in channel ${options.channelId}?`))) return;
      const result = await this.chatService.addBannedIp({ channelId: options.channelId, ip: options.ip });
      this.displayGenericResult(result, options.output, 'IP banned successfully');
    }, 'chat.banned.ip-add');
  }

  async listUserBanned(options: { page?: number; size?: number; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.chatService.getUserBannedList(this.compactOptions({ page: options.page, size: options.size }));
      this.displayGenericResult(result, options.output);
    }, 'chat.banned.user-list');
  }

  async listForbidUsers(options: {
    viewerId?: string;
    nickName?: string;
    pageNumber?: number;
    pageSize?: number;
    output?: OutputFormat;
  }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.chatService.getForbidUserList(options);
      this.displayGenericResult(result, options.output);
    }, 'chat.banned.forbid-list');
  }

  async deleteChannelBanned(options: {
    channelId: string;
    type: 'ip' | 'badword';
    content: string;
    force?: boolean;
    output?: OutputFormat;
  }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'type', 'content']);
      if (options.type !== 'ip' && options.type !== 'badword') {
        throw new PolyVValidationError('type must be ip or badword', 'type', options.type, 'validation_failed');
      }
      if (!(await this.confirmIfNeeded(options.force, `Delete ${options.type} from channel ${options.channelId}: ${options.content}?`))) return;
      const result = await this.chatService.deleteChannelBanned(options);
      this.displayGenericResult(result, options.output, 'Channel banned item deleted successfully');
    }, 'chat.banned.delete');
  }

  async listBulletins(options: { channelId: string; pageNumber?: number; pageSize?: number; sort?: string; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      const result = await this.chatService.listBulletins(this.compactOptions({
        channelId: options.channelId,
        pageNumber: options.pageNumber || 1,
        pageSize: options.pageSize || 20,
        sort: options.sort
      }));
      this.displayGenericResult(result, options.output);
    }, 'chat.notice.list');
  }

  async addBulletin(options: {
    channelId: string;
    content: string;
    isTop?: 'Y' | 'N';
    isPop?: 'Y' | 'N';
    force?: boolean;
    output?: OutputFormat;
  }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'content']);
      this.validateYN('isTop', options.isTop);
      this.validateYN('isPop', options.isPop);
      if (!(await this.confirmIfNeeded(options.force, `Add notice to channel ${options.channelId}?`))) return;
      const result = await this.chatService.addBulletin(options);
      this.displayGenericResult(result, options.output, 'Notice added successfully');
    }, 'chat.notice.add');
  }

  async cleanNotices(options: { channelId: string; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      if (!(await this.confirmIfNeeded(options.force, `Clear all notices for channel ${options.channelId}?`))) return;
      const result = await this.chatService.cleanNotices({ channelId: options.channelId });
      this.displayGenericResult(result ?? { success: true }, options.output, 'Notices cleared successfully');
    }, 'chat.notice.clean');
  }

  async listQa(options: { channelId: string; pageNumber?: number; pageSize?: number; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      const result = await this.chatService.listQa({
        channelId: options.channelId,
        pageNumber: options.pageNumber || 1,
        pageSize: options.pageSize || 20
      });
      this.displayGenericResult(result, options.output);
    }, 'chat.qa.list');
  }

  async updateCensorEnabled(options: { channelId: string; enabled?: 'Y' | 'N'; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      this.validateYN('enabled', options.enabled);
      if (!(await this.confirmIfNeeded(options.force, `Update chat censor setting for channel ${options.channelId}?`))) return;
      const result = await this.chatService.updateCensorEnabled(this.compactOptions({
        channelId: options.channelId,
        enabled: options.enabled
      }));
      this.displayGenericResult(result, options.output, 'Chat censor setting updated successfully');
    }, 'chat.censor.update');
  }

  async getAdminInfo(options: { channelId: string; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      const result = await this.chatService.getAdminInfo({ channelId: options.channelId });
      this.displayGenericResult(result, options.output);
    }, 'chat.role.admin-get');
  }

  async updateAdminInfo(options: {
    channelId: string;
    nickname: string;
    actor: string;
    avatar: string;
    force?: boolean;
    output?: OutputFormat;
  }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'nickname', 'actor', 'avatar']);
      if (!(await this.confirmIfNeeded(options.force, `Update admin info for channel ${options.channelId}?`))) return;
      const result = await this.chatService.updateAdminInfo(options);
      this.displayGenericResult(result, options.output, 'Admin info updated successfully');
    }, 'chat.role.admin-update');
  }

  async getTeacherInfo(options: { channelId: string; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      const result = await this.chatService.getTeacherInfo({ channelId: options.channelId });
      this.displayGenericResult(result, options.output);
    }, 'chat.role.teacher-get');
  }

  async updateTeacherInfo(options: {
    channelId: string;
    nickname?: string;
    actor?: string;
    passwd?: string;
    avatar?: string;
    force?: boolean;
    output?: OutputFormat;
  }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      if (!(await this.confirmIfNeeded(options.force, `Update teacher info for channel ${options.channelId}?`))) return;
      const result = await this.chatService.updateTeacherInfo(options);
      this.displayGenericResult(result, options.output, 'Teacher info updated successfully');
    }, 'chat.role.teacher-update');
  }

  async getUserList(options: {
    roomId: string;
    page?: number;
    len?: number;
    toGetSubRooms?: boolean;
    output?: OutputFormat;
  }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['roomId']);
      const result = await this.chatService.getUserList(options);
      this.displayGenericResult(result, options.output);
    }, 'chat.role.user-list');
  }

  async getRobotSetting(options: { channelId: string; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      const result = await this.chatService.getRobotSetting({ channelId: options.channelId });
      this.displayGenericResult(result, options.output);
    }, 'chat.robot.setting-get');
  }

  async getRobotStats(options: { channelId: string; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      const result = await this.chatService.getRobotStats({ channelId: options.channelId });
      this.displayGenericResult(result, options.output);
    }, 'chat.robot.stats');
  }

  async updateRobotSetting(options: {
    channelId: string;
    robotNumber: number;
    addRobotModel: 'timely' | 'fixed_time';
    changeTime?: number;
    virtualBookingNumber?: number;
    force?: boolean;
    output?: OutputFormat;
  }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'robotNumber', 'addRobotModel']);
      if (!(await this.confirmIfNeeded(options.force, `Update robot setting for channel ${options.channelId}?`))) return;
      const result = await this.chatService.updateRobotSetting(options);
      this.displayGenericResult(result ?? { success: true }, options.output, 'Robot setting updated successfully');
    }, 'chat.robot.setting-update');
  }

  async updateRobotListSetting(options: {
    channelId: string;
    robotNumber: number;
    addRobotModel: 'timely' | 'fixed_time';
    changeTime?: number;
    virtualBookingNumber?: number;
    robotList?: Array<{ name: string; avatar: string }>;
    robotRandomMemberEnabled?: 'Y' | 'N';
    force?: boolean;
    output?: OutputFormat;
  }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'robotNumber', 'addRobotModel']);
      this.validateYN('robotRandomMemberEnabled', options.robotRandomMemberEnabled);
      if (!(await this.confirmIfNeeded(options.force, `Update robot list setting for channel ${options.channelId}?`))) return;
      const result = await this.chatService.updateRobotListSetting(options);
      this.displayGenericResult(result ?? { success: true }, options.output, 'Robot list setting updated successfully');
    }, 'chat.robot.list-update');
  }

  async pauseRobot(options: { channelId: string; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      if (!(await this.confirmIfNeeded(options.force, `Pause robot growth for channel ${options.channelId}?`))) return;
      const result = await this.chatService.pauseRobot({ channelId: options.channelId });
      this.displayGenericResult(result ?? { success: true }, options.output, 'Robot paused successfully');
    }, 'chat.robot.pause');
  }

  async batchUpdateChatEnabled(options: { channelIds: string[]; chatEnabled: 'Y' | 'N'; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      if (!options.channelIds || options.channelIds.length === 0) {
        throw new PolyVValidationError('channelIds is required', 'channelIds', options.channelIds, 'validation_failed');
      }
      this.validateYN('chatEnabled', options.chatEnabled);
      if (!(await this.confirmIfNeeded(options.force, `Update chat switch for channel(s) ${options.channelIds.join(',')}?`))) return;
      const result = await this.chatService.batchUpdateChatEnabled({
        channelIds: options.channelIds,
        chatEnabled: options.chatEnabled,
      });
      this.displayGenericResult(result ?? { success: true }, options.output, 'Chat switch updated successfully');
    }, 'chat.enabled.update');
  }

  async logoutWatchViewer(options: { channelId: string; token?: string; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      if (!(await this.confirmIfNeeded(options.force, `Log out viewer from watch page for channel ${options.channelId}?`))) return;
      const result = await this.chatService.logoutWatchViewer({
        channelId: options.channelId,
        ...(options.token ? { token: options.token } : {}),
      });
      this.displayGenericResult(result ?? { success: true }, options.output, 'Watch viewer logged out successfully');
    }, 'chat.viewer.logout');
  }

  // ===== Private Display Methods =====

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

    if (options.output && !['table', 'json'].includes(options.output)) {
      throw new PolyVValidationError('output must be either "table" or "json"', 'output', options.output, 'validation_failed');
    }
  }

  private compactOptions<T extends Record<string, any>>(options: T): any {
    return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined));
  }

  private validateContentOrImage(options: { content?: string; imgUrl?: string }): void {
    if (!options.content && !options.imgUrl) {
      throw new PolyVValidationError('content or imgUrl is required', 'content', options, 'validation_failed');
    }
  }

  private validateYN(field: string, value?: string): void {
    if (value !== undefined && value !== 'Y' && value !== 'N') {
      throw new PolyVValidationError(`${field} must be Y or N`, field, value, 'validation_failed');
    }
  }

  private async confirmIfNeeded(force: boolean | undefined, message: string): Promise<boolean> {
    if (force) {
      return true;
    }

    const confirmed = await confirmDeletion(message, 'yes');
    if (!confirmed) {
      this.displayInfo('Operation cancelled');
    }
    return confirmed;
  }

  private displayGenericResult(result: any, format?: OutputFormat, successMessage?: string): void {
    if (successMessage && format !== 'json') {
      this.displaySuccess(successMessage);
    }

    if (result !== undefined) {
      this.displayData(result, format || 'table');
    } else if (format === 'json') {
      this.displayData({ success: true }, 'json');
    }
  }

  private displaySendResult(result: SendAdminMsgResponse, format?: OutputFormat): void {
    // The send-admin-msg envelope does not always carry a top-level `success`
    // field; derive it from the API code/status so callers can rely on it.
    const anyResult = result as unknown as Record<string, unknown>;
    const success =
      typeof anyResult['success'] === 'boolean'
        ? (anyResult['success'] as boolean)
        : anyResult['code'] === 200 || anyResult['status'] === 'success';
    const data = {
      success,
      message: (anyResult['message'] as string | undefined) ?? result.message ?? '',
      data: anyResult['data'] ?? result.data,
    };

    if (format === 'json') {
      this.displayData(data, 'json');
    } else {
      this.displaySuccess(`Admin message sent successfully`, data, 'table');
    }
  }

  private displayListResult(result: ChatHistoryPageResponse, options: ChatListOptions): void {
    const messages = result.contents || [];
    const page = options.page || 1;
    const size = options.size || 20;

    if (messages.length === 0) {
      this.displayInfo(`No chat messages found for channel ${options.channelId}`);
      return;
    }

    // Display pagination info
    const fromItem = (page - 1) * size + 1;
    const toItem = Math.min(fromItem + messages.length - 1, fromItem + size - 1);
    this.displayInfo(`Showing messages ${fromItem}-${toItem} (page ${page}, size ${size})`);

    if (options.output === 'json') {
      this.displayData(messages, 'json');
    } else {
      this.displayMessagesTable(messages);
    }
  }

  private displayMessagesTable(messages: ChatMessage[]): void {
    const tableData = messages.map((msg) => ({
      'Message ID': msg.id || '-',
      'Content': this.truncateContent(msg.content || '', 50),
      'Time': msg.time ? new Date(msg.time).toLocaleString() : '-',
      'Sender': msg.user?.nick || '-',
      'User Type': msg.user?.userType || '-',
    }));

    this.displayAsTable(tableData);
  }

  private displayDeleteResult(options: ChatDeleteOptions): void {
    const data = {
      channelId: options.channelId,
      deleted: true,
      timestamp: new Date().toISOString(),
      ...(options.clear ? { cleared: 'all messages' } : { messageId: options.messageId }),
    };

    if (options.output === 'json') {
      this.displayData(data, 'json');
    } else {
      if (options.clear) {
        this.displaySuccess(`All chat messages cleared successfully`, data, 'table');
      } else {
        this.displaySuccess(`Message ${options.messageId} deleted successfully`, data, 'table');
      }
    }
  }

  private truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength - 3) + '...';
  }

  // ========================================
  // chat ban/unban commands (Story 11-2)
  // ========================================

  /**
   * Bans users at channel or global level
   * @param options Ban options from CLI
   * @returns Promise that resolves when users are banned
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   *
   * @example
   * ```typescript
   * await chatHandler.banUser({
   *   channelId: '3151318',
   *   userIds: ['user1', 'user2'],
   *   output: 'table'
   * });
   * ```
   */
  async banUser(options: ChatBanOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateBanOptions(options);

      let result: any;
      if (options.global) {
        // Global ban (account level)
        result = await this.chatService.updateBannedViewer({
          viewerIds: options.userIds,
          banned: 'Y'
        });
        this.displayBanResult(options, result, true);
      } else {
        // Channel-level ban
        result = await this.chatService.updateBannedUser({
          channelId: options.channelId!,
          userIds: options.userIds.join(','),
          toBanned: 'Y'
        });
        this.displayBanResult(options, result, false);
      }
    }, 'chat.ban');
  }

  /**
   * Unbans users at channel or global level
   * @param options Unban options from CLI
   * @returns Promise that resolves when users are unbanned
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   *
   * @example
   * ```typescript
   * await chatHandler.unbanUser({
   *   channelId: '3151318',
   *   userIds: ['user1', 'user2'],
   *   output: 'table'
   * });
   * ```
   */
  async unbanUser(options: ChatUnbanOptions): Promise<void>{
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateBanOptions(options);

      let result: any;
      if (options.global) {
        // Global unban (account level)
        result = await this.chatService.updateBannedViewer({
          viewerIds: options.userIds,
          banned: 'N'
        });
        this.displayUnbanResult(options, result, true);
      } else {
        // Channel-level unban
        result = await this.chatService.updateBannedUser({
          channelId: options.channelId!,
          userIds: options.userIds.join(','),
          toBanned: 'N'
        });
        this.displayUnbanResult(options, result, false);
      }
    }, 'chat.unban');
  }

  // ========================================
  // chat kick/unkick commands (Story 11-2)
  // ========================================

  /**
   * Kicks users at channel or global level
   * @param options Kick options from CLI
   * @returns Promise that resolves when users are kicked
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   *
   * @example
   * ```typescript
   * await chatHandler.kickUser({
   *   channelId: '3151318',
   *   viewerIds: ['viewer1'],
   *   nickNames: ['Nick1'],
   *   output: 'table'
   * });
   * ```
   */
  async kickUser(options: ChatKickOptions): Promise<void>{
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateKickOptions(options);

      let result: any;
      if (options.global) {
        // Global kick (platform level)
        result = await this.chatService.forbidKickUsers({
          viewerIds: options.viewerIds!,
          nickNames: options.nickNames!
        });
      } else {
        // Channel-level kick
        result = await this.chatService.forbidChannelKickUsers({
          channelId: options.channelId!,
          viewerIds: options.viewerIds!,
          nickNames: options.nickNames!
        });
      }
      this.displayKickResult(options, result);
    }, 'chat.kick');
  }

  /**
   * Unkicks users at channel or global level
   * @param options Unkick options from CLI
   * @returns Promise that resolves when users are unkicked
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   *
   * @example
   * ```typescript
   * await chatHandler.unkickUser({
   *   channelId: '3151318',
   *   viewerIds: ['viewer1'],
   *   nickNames: ['Nick1'],
   *   output: 'table'
   * });
   * ```
   */
  async unkickUser(options: ChatUnkickOptions): Promise<void>{
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateKickOptions(options);

      let result: any;
      if (options.global) {
        // Global unkick (platform level)
        result = await this.chatService.forbidUnkickUsers({
          viewerIds: options.viewerIds!,
          nickNames: options.nickNames!
        });
      } else {
        // Channel-level unkick
        result = await this.chatService.forbidChannelUnkickUsers({
          channelId: options.channelId!,
          viewerIds: options.viewerIds!,
          nickNames: options.nickNames!
        });
      }
      this.displayUnkickResult(options, result);
    }, 'chat.unkick');
  }

  // ========================================
  // chat banned/kicked list commands (Story 11-2)
  // ========================================

  /**
   * Lists banned users, IPs, or badwords
   * @param options Banned list options from CLI
   * @returns Promise that resolves when list is displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   *
   * @example
   * ```typescript
   * await chatHandler.listBanned({
   *   channelId: '3151318',
   *   type: 'userId',
   *   output: 'table'
   * });
   * ```
   */
  async listBanned(options: ChatBannedListOptions): Promise<void>{
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateBannedListOptions(options);

      let result: any;
      if (options.type === 'badword') {
        result = await this.chatService.getChannelBannedList({
          channelId: options.channelId,
          type: 'badword'
        });
      } else {
        result = await this.chatService.getChannelBannedUserList({
          channelId: options.channelId,
          type: options.type
        });
      }
      this.displayBannedListResult(options, result);
    }, 'chat.banned.list');
  }

  /**
   * Lists kicked users
   * @param options Kicked list options from CLI
   * @returns Promise that resolves when list is displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   *
   * @example
   * ```typescript
   * await chatHandler.listKicked({
   *   channelId: '3151318',
   *   output: 'table'
   * });
   * ```
   */
  async listKicked(options: ChatKickedListOptions): Promise<void>{
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateKickedListOptions(options);

      const result = await this.chatService.getChannelKickedUserList({
        channelId: options.channelId
      });
      this.displayKickedListResult(options, result);
    }, 'chat.kicked.list');
  }

  // ===== Private Validation Methods =====

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

    if (options.page !== undefined) {
      if (typeof options.page !== 'number' || !Number.isInteger(options.page) || options.page < 1) {
        errors.push('page must be a positive integer');
      }
    }

    if (options.size !== undefined) {
      if (typeof options.size !== 'number' || !Number.isInteger(options.size) || options.size < 1 || options.size > 100) {
        errors.push('pageSize must be an integer between 1 and 100');
      }
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
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

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
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

  private validateBanOptions(options: ChatBanOptions | ChatUnbanOptions): void {
    const errors: string[] = [];

    if (!options.global && (!options.channelId || options.channelId.trim() === '')) {
      errors.push('channelId is required when --global is not specified');
    }

    if (!options.userIds || options.userIds.length === 0) {
      errors.push('userIds is required');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Chat ban options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateKickOptions(options: ChatKickOptions | ChatUnkickOptions): void {
    const errors: string[] = [];

    if (!options.global && (!options.channelId || options.channelId.trim() === '')) {
      errors.push('channelId is required when --global is not specified');
    }

    if (!options.viewerIds && !options.nickNames) {
      errors.push('viewerIds and nickNames are required');
    }

    if (options.viewerIds && options.nickNames && options.viewerIds.length !== options.nickNames.length) {
      errors.push('viewerIds and nickNames must have the same length');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Chat kick options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateBannedListOptions(options: ChatBannedListOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (!['userId', 'ip', 'badword'].includes(options.type)) {
      errors.push('type must be one of: userId, ip, badword');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Chat banned list options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateKickedListOptions(options: ChatKickedListOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Chat kicked list options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  // ===== Display Methods for Ban/Kick (Story 11-2) =====

  private displayBanResult(options: ChatBanOptions, result: any, isGlobal: boolean): void {
    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        userIds: options.userIds,
        global: isGlobal,
        result
      }, 'json');
    } else {
      const scopeText = isGlobal ? 'globally' : `in channel ${options.channelId}`;
      this.displaySuccess(`Users ${options.userIds.join(', ')} banned ${scopeText} successfully`);
    }
  }

  private displayUnbanResult(options: ChatUnbanOptions, result: any, isGlobal: boolean): void {
    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        userIds: options.userIds,
        global: isGlobal,
        result
      }, 'json');
    } else {
      const scopeText = isGlobal ? 'globally' : `in channel ${options.channelId}`;
      this.displaySuccess(`Users ${options.userIds.join(', ')} unbanned ${scopeText} successfully`);
    }
  }

  private displayKickResult(options: ChatKickOptions, result: any): void {
    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        viewerIds: options.viewerIds,
        nickNames: options.nickNames,
        global: options.global,
        result
      }, 'json');
    } else {
      const scopeText = options.global ? 'globally' : `in channel ${options.channelId}`;
      this.displaySuccess(`Users kicked ${scopeText} successfully`);
    }
  }

  private displayUnkickResult(options: ChatUnkickOptions, result: any): void {
    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        viewerIds: options.viewerIds,
        nickNames: options.nickNames,
        global: options.global,
        result
      }, 'json');
    } else {
      const scopeText = options.global ? 'globally' : `in channel ${options.channelId}`;
      this.displaySuccess(`Users unkicked ${scopeText} successfully`);
    }
  }

  private displayBannedListResult(options: ChatBannedListOptions, result: any): void {
    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        type: options.type,
        data: result.data || []
      }, 'json');
    } else {
      const data = result.data || [];
      if (data.length === 0) {
        this.displayInfo(`No banned ${options.type} found in channel ${options.channelId}`);
        return;
      }

      if (options.type === 'badword') {
        this.displayAsTable(data.map((word: string) => ({ Badword: word })));
      } else {
        this.displayAsTable(data.map((item: string) => ({ [options.type === 'userId' ? 'User ID' : 'IP']: item })));
      }
    }
  }

  private displayKickedListResult(options: ChatKickedListOptions, result: any): void {
    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        data: result.data || []
      }, 'json');
    } else {
      const data = result.data || [];
      if (data.length === 0) {
        this.displayInfo(`No kicked users found in channel ${options.channelId}`);
        return;
      }

      this.displayAsTable(data.map((user: any) => ({
        'User ID': user.userId || 'N/A',
        'Nickname': user.nick || 'N/A',
        'IP': user.clientIp || 'N/A',
        'User Type': user.userType || 'N/A',
        'Room ID': user.roomId || 'N/A'
      })));
    }
  }
}
