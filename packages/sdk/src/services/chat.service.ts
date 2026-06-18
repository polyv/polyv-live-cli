/**
 * Chat Service
 *
 * Service for managing PolyV Live chat messages.
 * Provides methods for sending, retrieving, and managing chat messages.
 *
 * @module services/chat
 */

import type { PolyVClient } from '../client.js';
import type {
  getHistoryPageParams,
  ChatHistoryPageResponse,
  sendAdminMsgParams,
  SendAdminMsgResponse,
  sendChatParams,
  SendChatResponse,
  sendHiddenByAdminParams,
  SendHiddenByAdminResponse,
  CountOnlineUserParams,
  delChatParams,
  delChatResponse,
  cleanChatParams,
  cleanChatResponse,
  messageAuditParams,
  messageAuditResponse,
  alertToSpecialParams,
  alertToSpecialResponse,
  getSpeakListParams,
  SpeakListResponse,
} from '../types/chat.js';
import type {
  UpdateCensorEnabledParams,
  UpdateCensorEnabledResponse,
  GetAdminInfoParams,
  GetAdminInfoResponse,
  UpdateAdminInfoParams,
  UpdateAdminInfoResponse,
  GetTeacherInfoParams,
  GetTeacherInfoResponse,
  UpdateTeacherInfoParams,
  UpdateTeacherInfoResponse,
  GetUserListParams,
  GetUserListResponse,
} from '../types/chat-censor-role.js';
import type {
  AddBadwordsParams,
  AddBadwordsResponse,
  AddBannedIpParams,
  AddBannedIpResponse,
  DeleteChannelBannedParams,
  DeleteChannelBannedResponse,
  DeleteUserBadwordParams,
  DeleteUserBadwordResponse,
  ForbidChannelKickUsersParams,
  ForbidChannelKickUsersBody,
  ForbidKickUsersGlobalResponse,
  ForbidChannelUnkickUsersParams,
  ForbidChannelUnkickUsersBody,
  ForbidKickUsersBody,
  ForbidUnkickUsersBody,
  GetChannelBannedListParams,
  GetChannelBannedListResponse,
  GetChannelBannedUserListParams,
  GetChannelBannedUserListResponse,
  GetChannelKickedUserListParams,
  GetChannelKickedUserListResponse,
  GetForbidUserListParams,
  GetForbidUserListResponse,
  GetUserBadwordListResponse,
  GetUserBannedListParams,
  GetUserBannedListResponse,
  UpdateBannedUserParams,
  UpdateBannedUserResponse,
  UpdateBannedViewerParams,
  UpdateBannedViewerResponse,
} from '../types/chat-banned.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';

/**
 * ChatService
 *
 * Provides methods to interact with PolyV Live Chat APIs.
 *
 * @example
 * ```typescript
 * const client = new PolyVClient({ appId: 'xxx', appSecret: 'yyy' });
 * const messages = await client.chat.getHistoryPage({
 *   channelId: '123456',
 *   startDay: '2024-01-01',
 *   endDay: '2024-01-31',
 * });
 * ```
 */
export class ChatService {
  private client: PolyVClient;

  /**
   * Create a new ChatService instance
   *
   * @param client - The PolyVClient instance to use for API calls
   */
  constructor(client: PolyVClient) {
    this.client = client;
  }

  /**
   * Validate channel ID
   */
  private validateChannelId(channelId: string): void {
    if (!channelId || channelId.trim() === '') {
      throw new PolyVValidationError('channelId is required');
    }
  }

  // ============================================
  // AC 2: getHistoryPage - Query chat history
  // ============================================

  /**
   * Query channel chat history with pagination
   *
   * @param params - Query parameters
   * @returns Paginated chat history response
   *
   * @example
   * ```typescript
   * const result = await client.chat.getHistoryPage({
   *   channelId: '123456',
   *   startDay: '2024-01-01',
   *   endDay: '2024-01-31',
   *   page: 1,
   *   pageSize: 20,
   * });
   * console.log(result.contents);
   * ```
   */
  async getHistoryPage(params: getHistoryPageParams): Promise<ChatHistoryPageResponse> {
    const response = await this.client.httpClient.get<ChatHistoryPageResponse>(
      '/live/v3/channel/chat/get-history-page',
      { params }
    );
    return response as unknown as ChatHistoryPageResponse;
  }

  // ============================================
  // AC 3: sendAdminMsg - Send admin message
  // ============================================

  /**
   * Send an admin message with optional image
   *
   * @param params - Send parameters
   * @returns Send result response
   *
   * @example
   * ```typescript
   * const result = await client.chat.sendAdminMsg({
   *   channelId: '123456',
   *   msg: 'Hello World',
   *   pic: 'https://example.com/avatar.png',
   *   nickName: 'Admin',
   * });
   * console.log(result.msgId);
   * ```
   */
  async sendAdminMsg(params: sendAdminMsgParams): Promise<SendAdminMsgResponse> {
    const response = await this.client.httpClient.post<SendAdminMsgResponse>(
      '/live/v3/channel/chat/send-admin-msg',
      null,
      { params }
    );
    return response as unknown as SendAdminMsgResponse;
  }

  // ============================================
  // AC 4: sendChat - Send hidden chat message
  // ============================================

  /**
   * Send a chat message (hidden mode)
   * Note: content needs base64 URL-safe encoding
   *
   * @param params - Send parameters
   * @returns Send result
   *
   * @example
   * ```typescript
   * const result = await client.chat.sendChat({
   *   channelId: '123456',
   *   userId: 'user123',
   *   content: 'Hello World',
   * });
   * console.log(result);
   * ```
   */
  async sendChat(params: sendChatParams): Promise<SendChatResponse> {
    // Note: The API expects content to be base64 encoded
    // For now, we pass the content as-is and let the caller handle encoding
    const response = await this.client.httpClient.post<SendChatResponse>(
      `/live/v1/channelSetting/${params.channelId}/send-chat`,
      { userId: params.userId, content: params.content, imgUrl: params.imgUrl }
    );
    return response as unknown as SendChatResponse;
  }

  // ============================================
  // AC 5: sendHiddenByAdmin - Send message as admin
  // ============================================

  /**
   * Send a message as admin (hidden mode)
   *
   * @param params - Send parameters
   * @returns Send result
   *
   * @example
   * ```typescript
   * const result = await client.chat.sendHiddenByAdmin({
   *   channelId: '123456',
   *   content: 'Hello from Admin',
   *   role: 'ADMIN',
   * });
   * console.log(result.data);
   * ```
   */
  async sendHiddenByAdmin(params: sendHiddenByAdminParams): Promise<SendHiddenByAdminResponse> {
    const response = await this.client.httpClient.post<SendHiddenByAdminResponse>(
      '/live/v3/channel/chat/send',
      null,
      { params }
    );
    return response as unknown as SendHiddenByAdminResponse;
  }

  /**
   * Query current online user count for a channel chat room
   *
   * @param params - Query parameters
   * @returns Current online user count
   */
  async countOnlineUser(params: CountOnlineUserParams): Promise<number> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<number>(
      '/live/v3/channel/chat/count-online-user',
      { params }
    );
    return response as unknown as number;
  }

  // ============================================
  // AC 6: delChat - Delete a chat message
  // ============================================

  /**
   * Delete a single chat message
   * Note: The API documentation shows POST method, but the endpoint name suggests GET
   * Since the response interceptor handles response extraction, we use the same approach as other services
   *
   * @param params - Delete parameters
   * @returns Delete result
   *
   * @example
   * ```typescript
   * const result = await client.chat.delChat({
   *   channelId: '123456',
   *   id: 'msg-uuid',
   * });
   * console.log(result.data);
   * ```
   */
  async delChat(params: delChatParams): Promise<delChatResponse> {
    this.validateChannelId(params.channelId);
    if (!params.id || params.id.trim() === '') {
      throw new PolyVValidationError('id is required');
    }

    const response = await this.client.httpClient.post<delChatResponse>(
      `/live/v2/chat/${params.channelId}/delChat`,
      null,
      { params: { id: params.id } }
    );
    return response as unknown as delChatResponse;
  }

  // ============================================
  // AC 7: cleanChat - Clear all chat messages
  // ============================================

  /**
   * Clear all chat messages in a channel
   *
   * @param params - Clear parameters
   * @returns Clear result
   *
   * @example
   * ```typescript
   * const result = await client.chat.cleanChat({
   *   channelId: '123456',
   * });
   * console.log(result.data);
   * ```
   */
  async cleanChat(params: cleanChatParams): Promise<cleanChatResponse> {
    const response = await this.client.httpClient.get<cleanChatResponse>(
      `/live/v2/chat/${params.channelId}/cleanChat`
    );
    return response as unknown as cleanChatResponse;
  }

  // ============================================
  // AC 8: messageAudit - Audit chat messages
  // ============================================

  /**
   * Send audit-passed chat messages
   * Note: Request body is an array of messages
   *
   * @param params - Audit parameters
   * @returns Audit response
   *
   * @example
   * ```typescript
   * const result = await client.chat.messageAudit({
   *   channelId: '123456',
   *   messages: [
   *     {
   *       msgId: 'msg-1',
   *       viewerId: 'viewer-1',
   *       nickName: 'Test User',
   *       content: 'Hello World',
   *     },
   *   ],
   * });
   * console.log(result.data);
   * ```
   */
  async messageAudit(params: messageAuditParams): Promise<messageAuditResponse> {
    const response = await this.client.httpClient.post<messageAuditResponse>(
      '/live/v4/chat/message/audit',
      params.messages,
      { params: { channelId: params.channelId } }
    );
    return response as unknown as messageAuditResponse;
  }

  // ============================================
  // AC 9: alertToSpecial - Send popup alert
  // ============================================

  /**
   * Send a popup alert to the broadcaster
   *
   * @param params - Alert parameters
   * @returns Alert response
   *
   * @example
   * ```typescript
   * const result = await client.chat.alertToSpecial({
   *   channelId: '123456',
   *   message: 'Please check the chat room rules',
   *   title: 'Warning',
   * });
   * console.log(result.data);
   * ```
   */
  async alertToSpecial(params: alertToSpecialParams): Promise<alertToSpecialResponse> {
    const response = await this.client.httpClient.post<alertToSpecialResponse>(
      '/live/v4/chat/alert-to-special',
      null,
      { params }
    );
    return response as unknown as alertToSpecialResponse;
  }

  // ============================================
  // AC 10: getSpeakList - Get speak list
  // Note: This uses v3 API path /live/v3/user/chat/get-speak-list
  // ============================================

  /**
   * Get the speak list (all chat records for the account)
   * Note: This endpoint uses cursor-based pagination
   *
   * @param params - Query parameters
   * @returns Speak list response
   *
   * @example
   * ```typescript
   * const result = await client.chat.getSpeakList({
   *   startTime: 1631000000000,
   *   endTime: 1631003600000,
   *   size: 10,
   * });
   * console.log(result.list);
   * ```
   */
  async getSpeakList(params: getSpeakListParams): Promise<SpeakListResponse> {
    const response = await this.client.httpClient.get<SpeakListResponse>(
      '/live/v3/user/chat/get-speak-list',
      { params }
    );
    return response as unknown as SpeakListResponse;
  }

  // ============================================
  // Story 3.2: Censor and role management APIs
  // ============================================

  /**
   * UpdateCensorEnabled - 更新聊天审核开关
   *
   * @param params - Update parameters
   * @returns Response with censor enabled status
   *
   * @example
   * ```typescript
   * const result = await client.chat.updateCensorEnabled({
   *   channelId: '123456',
   *   enabled: 'Y',
   * });
   * console.log(result.data); // true or false
   * ```
   */
  async updateCensorEnabled(params: UpdateCensorEnabledParams): Promise<UpdateCensorEnabledResponse> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }

    const response = await this.client.httpClient.post<UpdateCensorEnabledResponse>(
      '/live/v3/channel/chat/update-censor-enabled',
      null,
      { params }
    );
    return response as unknown as UpdateCensorEnabledResponse;
  }

  /**
   * getAdminInfo - 查询管理员身份信息
   *
   * @param channelId - 频道号
   * @returns Response with admin info
   *
   * @example
   * ```typescript
   * const result = await client.chat.getAdminInfo('123456');
   * console.log(result.data);
   * ```
   */
  async getAdminInfo(channelId: string): Promise<GetAdminInfoResponse> {
    if (!channelId) {
      throw new PolyVValidationError('channelId is required');
    }

    const response = await this.client.httpClient.get<GetAdminInfoResponse>(
      `/live/v2/channelSetting/${channelId}/get-chat-admin`
    );
    return response as unknown as GetAdminInfoResponse;
  }

  /**
   * getTeacherInfo - 获取讲师信息
   *
   * @param params - Query parameters
   * @returns Response with teacher info
   *
   * @example
   * ```typescript
   * const result = await client.chat.getTeacherInfo({
   *   channelId: '123456',
   * });
   * console.log(result.data);
   * ```
   */
  async getTeacherInfo(params: GetTeacherInfoParams): Promise<GetTeacherInfoResponse> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }

    const response = await this.client.httpClient.get<GetTeacherInfoResponse>(
      '/live/v3/channel/account/getTeacher',
      { params }
    );
    return response as unknown as GetTeacherInfoResponse;
  }

  /**
   * getUserList - 查询聊天室在线列表
   * Note: This endpoint uses a different base URL: https://apichat.polyv.net
   * The returned data is encrypted and needs to be decrypted
   *
   * @param params - Query parameters
   * @returns Response with user list
   *
   * @example
   * ```typescript
   * const result = await client.chat.getUserList({
   *   roomId: '123456',
   *   page: 1,
   *   len: 100,
   * });
   * console.log(result.count);
   * console.log(result.userlist);
   * ```
   */
  async getUserList(params: GetUserListParams): Promise<GetUserListResponse> {
    if (!params.roomId) {
      throw new PolyVValidationError('roomId is required');
    }
    if (params.page !== undefined && params.page < 1) {
      throw new PolyVValidationError('page must be >= 1');
    }
    if (params.len !== undefined && (params.len < 1 || params.len > 1000)) {
      throw new PolyVValidationError('len must be between 1 and 1000');
    }

    // Use a separate axios instance for this different base URL
    const response = await this.client.httpClient.get<GetUserListResponse>(
      'https://apichat.polyv.net/front/userlistExternal',
      { params }
    );
    return response as unknown as GetUserListResponse;
  }

  /**
   * updateAdminInfo - 更新管理员信息
   * Note: This endpoint requires multipart/form-data for avatar upload
   *
   * @param params - Update parameters
   * @returns Response with update result
   *
   * @example
   * ```typescript
   * const result = await client.chat.updateAdminInfo({
   *   channelId: '123456',
   *   nickname: '管理员',
   *   actor: '管理员1',
   *   avatar: imageBuffer,
   * });
   * console.log(result.data);
   * ```
   */
  async updateAdminInfo(params: UpdateAdminInfoParams): Promise<UpdateAdminInfoResponse> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }
    if (!params.nickname) {
      throw new PolyVValidationError('nickname is required');
    }
    if (!params.actor) {
      throw new PolyVValidationError('actor is required');
    }

    // Build request body
    const requestBody: Record<string, string> = {
      nickname: params.nickname,
      actor: params.actor,
    };
    if (params.avatar) {
      requestBody.avatar = params.avatar;
    }

    const response = await this.client.httpClient.post<UpdateAdminInfoResponse>(
      `/live/v2/channelSetting/${params.channelId}/set-chat-admin`,
      requestBody
    );
    return response as unknown as UpdateAdminInfoResponse;
  }

  /**
   * updateTeacherInfo - 更新讲师信息
   *
   * @param params - Update parameters
   * @returns Response with update result
   *
   * @example
   * ```typescript
   * const result = await client.chat.updateTeacherInfo({
   *   channelId: '123456',
   *   nickname: '讲师',
   *   actor: '讲师1',
   *   passwd: '123456',
   *   avatar: 'https://example.com/avatar.png',
   * });
   * console.log(result.data);
   * ```
   */
  async updateTeacherInfo(params: UpdateTeacherInfoParams): Promise<UpdateTeacherInfoResponse> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }

    const response = await this.client.httpClient.post<UpdateTeacherInfoResponse>(
      '/live/v3/channel/account/updateTeacher',
      null,
      { params }
    );
    return response as unknown as UpdateTeacherInfoResponse;
  }

  // ============================================
  // Story 3.3: Banned/Chat Management APIs
  // ============================================

  /**
   * addBadwords - 批量导入严禁词
   *
   * @param params - Add badwords parameters
   * @returns Response with added count
   *
   * @example
   * ```typescript
   * const result = await client.chat.addBadwords({
   *   userId: '1b448be323',
   *   words: ['严禁词1', '严禁词2'],
   *   channelId: '2191569', // optional
   * });
   * console.log(result.data.count);
   * ```
   */
  async addBadwords(params: AddBadwordsParams): Promise<AddBadwordsResponse> {
    if (!params.userId) {
      throw new PolyVValidationError('userId is required');
    }
    if (!params.words || params.words.length === 0) {
      throw new PolyVValidationError('words is required and cannot be empty');
    }

    const response = await this.client.httpClient.post<AddBadwordsResponse>(
      `/live/v2/chat/${params.userId}/addBadWords`,
      null,
      { params: { words: JSON.stringify(params.words), channelId: params.channelId } }
    );
    return response as unknown as AddBadwordsResponse;
  }

  /**
   * addBannedIp - 禁言IP
   *
   * @param params - Add banned IP parameters
   * @returns Response with banned IP list
   *
   * @example
   * ```typescript
   * const result = await client.chat.addBannedIp({
   *   channelId: '2191569',
   *   ip: '59.41.20.74',
   * });
   * console.log(result.data);
   * ```
   */
  async addBannedIp(params: AddBannedIpParams): Promise<AddBannedIpResponse> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }
    if (!params.ip) {
      throw new PolyVValidationError('ip is required');
    }

    const response = await this.client.httpClient.post<AddBannedIpResponse>(
      `/live/v2/chat/${params.channelId}/addBannedIP`,
      null,
      { params: { ip: params.ip } }
    );
    return response as unknown as AddBannedIpResponse;
  }

  /**
   * deleteChannelBanned - 删除频道严禁词/禁言IP
   *
   * @param params - Delete parameters
   * @returns Response with success status
   *
   * @example
   * ```typescript
   * const result = await client.chat.deleteChannelBanned({
   *   channelId: '2191569',
   *   type: 'ip',
   *   content: '59.41.20.74',
   * });
   * console.log(result.data);
   * ```
   */
  async deleteChannelBanned(params: DeleteChannelBannedParams): Promise<DeleteChannelBannedResponse> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }
    if (!params.type) {
      throw new PolyVValidationError('type is required');
    }
    if (!params.content) {
      throw new PolyVValidationError('content is required');
    }

    const response = await this.client.httpClient.post<DeleteChannelBannedResponse>(
      `/live/v2/chat/${params.channelId}/delBanned`,
      null,
      { params }
    );
    return response as unknown as DeleteChannelBannedResponse;
  }

  /**
   * deleteUserBadword - 删除账号严禁词
   *
   * @param params - Delete parameters
   * @returns Response with remaining badwords list
   *
   * @example
   * ```typescript
   * const result = await client.chat.deleteUserBadword({
   *   words: '账号严禁词1,账号严禁词2',
   * });
   * console.log(result.data);
   * ```
   */
  async deleteUserBadword(params: DeleteUserBadwordParams): Promise<DeleteUserBadwordResponse> {
    if (!params.words) {
      throw new PolyVValidationError('words is required');
    }

    const response = await this.client.httpClient.post<DeleteUserBadwordResponse>(
      '/live/v3/user/badword/delete',
      null,
      { params }
    );
    return response as unknown as DeleteUserBadwordResponse;
  }

  /**
   * forbidChannelKickUsers - 频道内踢人
   *
   * @param params - URL parameters including channelId
   * @param body - Request body with viewerIds and nickNames
   * @returns Response with success status
   *
   * @example
   * ```typescript
   * const result = await client.chat.forbidChannelKickUsers(
   *   { channelId: '1003' },
   *   { viewerIds: ['20230907_2', '20230907_1'], nickNames: ['22', '11'] }
   * );
   * console.log(result.data);
   * ```
   */
  async forbidChannelKickUsers(
    params: ForbidChannelKickUsersParams,
    body: ForbidChannelKickUsersBody
  ): Promise<ForbidKickUsersGlobalResponse> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }
    if (!body.viewerIds || body.viewerIds.length === 0) {
      throw new PolyVValidationError('viewerIds is required and cannot be empty');
    }
    if (!body.nickNames || body.nickNames.length === 0) {
      throw new PolyVValidationError('nickNames is required and cannot be empty');
    }

    const response = await this.client.httpClient.post<ForbidKickUsersGlobalResponse>(
      '/live/v4/chat/channel/forbid/kick-users',
      body,
      { params }
    );
    return response as unknown as ForbidKickUsersGlobalResponse;
  }

  /**
   * forbidChannelUnkickUsers - 频道内取消踢人
   *
   * @param params - URL parameters including channelId
   * @param body - Request body with viewerIds and nickNames
   * @returns Response with success status
   *
   * @example
   * ```typescript
   * const result = await client.chat.forbidChannelUnkickUsers(
   *   { channelId: '1003' },
   *   { viewerIds: ['20230907_2', '20230907_1'], nickNames: ['22', '11'] }
   * );
   * console.log(result.data);
   * ```
   */
  async forbidChannelUnkickUsers(
    params: ForbidChannelUnkickUsersParams,
    body: ForbidChannelUnkickUsersBody
  ): Promise<ForbidKickUsersGlobalResponse> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }
    if (!body.viewerIds || body.viewerIds.length === 0) {
      throw new PolyVValidationError('viewerIds is required and cannot be empty');
    }
    if (!body.nickNames || body.nickNames.length === 0) {
      throw new PolyVValidationError('nickNames is required and cannot be empty');
    }

    const response = await this.client.httpClient.post<ForbidKickUsersGlobalResponse>(
      '/live/v4/chat/channel/forbid/unkick-users',
      body,
      { params }
    );
    return response as unknown as ForbidKickUsersGlobalResponse;
  }

  /**
   * forbidKickUsers - 全平台踢人
   *
   * @param body - Request body with viewerIds and nickNames
   * @returns Response with success status
   *
   * @example
   * ```typescript
   * const result = await client.chat.forbidKickUsers({
   *   viewerIds: ['20230907_2', '20230907_1'],
   *   nickNames: ['22', '11']
   * });
   * console.log(result.data);
   * ```
   */
  async forbidKickUsers(body: ForbidKickUsersBody): Promise<ForbidKickUsersGlobalResponse> {
    if (!body.viewerIds || body.viewerIds.length === 0) {
      throw new PolyVValidationError('viewerIds is required and cannot be empty');
    }
    if (!body.nickNames || body.nickNames.length === 0) {
      throw new PolyVValidationError('nickNames is required and cannot be empty');
    }

    const response = await this.client.httpClient.post<ForbidKickUsersGlobalResponse>(
      '/live/v4/chat/forbid/kick-users',
      body
    );
    return response as unknown as ForbidKickUsersGlobalResponse;
  }

  /**
   * forbidUnkickUsers - 全平台取消踢人
   *
   * @param body - Request body with viewerIds and nickNames
   * @returns Response with success status
   *
   * @example
   * ```typescript
   * const result = await client.chat.forbidUnkickUsers({
   *   viewerIds: ['20230907_2', '20230907_1'],
   *   nickNames: ['22', '11']
   * });
   * console.log(result.data);
   * ```
   */
  async forbidUnkickUsers(body: ForbidUnkickUsersBody): Promise<ForbidKickUsersGlobalResponse> {
    if (!body.viewerIds || body.viewerIds.length === 0) {
      throw new PolyVValidationError('viewerIds is required and cannot be empty');
    }
    if (!body.nickNames || body.nickNames.length === 0) {
      throw new PolyVValidationError('nickNames is required and cannot be empty');
    }

    const response = await this.client.httpClient.post<ForbidKickUsersGlobalResponse>(
      '/live/v4/chat/forbid/unkick-users',
      body
    );
    return response as unknown as ForbidKickUsersGlobalResponse;
  }

  /**
   * getChannelBannedList - 查询频道严禁词/禁言IP
   *
   * @param params - Query parameters
   * @returns Response with badword or IP list
   *
   * @example
   * ```typescript
   * // Get badwords
   * const result = await client.chat.getChannelBannedList({
   *   channelId: '2191569',
   *   type: 'badword',
   * });
   * console.log(result.data);
   *
   * // Get banned IPs
   * const result2 = await client.chat.getChannelBannedList({
   *   channelId: '2191569',
   *   type: 'ip',
   * });
   * console.log(result2.data);
   * ```
   */
  async getChannelBannedList(params: GetChannelBannedListParams): Promise<GetChannelBannedListResponse> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }

    const response = await this.client.httpClient.get<GetChannelBannedListResponse>(
      '/live/v3/channel/badword/list',
      { params }
    );
    return response as unknown as GetChannelBannedListResponse;
  }

  /**
   * getChannelBannedUserList - 查询频道禁言用户Userid/IP
   *
   * @param params - Query parameters
   * @returns Response with user ID or IP list
   *
   * @example
   * ```typescript
   * // Get banned userIds
   * const result = await client.chat.getChannelBannedUserList({
   *   channelId: '2191569',
   *   type: 'userId',
   *   toGetSubRooms: 1,
   * });
   * console.log(result.data);
   *
   * // Get banned IPs
   * const result2 = await client.chat.getChannelBannedUserList({
   *   channelId: '2191569',
   *   type: 'ip',
   * });
   * console.log(result2.data);
   * ```
   */
  async getChannelBannedUserList(params: GetChannelBannedUserListParams): Promise<GetChannelBannedUserListResponse> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }
    if (!params.type) {
      throw new PolyVValidationError('type is required');
    }

    const response = await this.client.httpClient.get<GetChannelBannedUserListResponse>(
      '/live/v3/channel/chat/get-banned-list',
      { params }
    );
    return response as unknown as GetChannelBannedUserListResponse;
  }

  /**
   * getChannelKickedUserList - 查询频道踢人列表
   *
   * @param params - Query parameters
   * @returns Response with kicked user list
   *
   * @example
   * ```typescript
   * const result = await client.chat.getChannelKickedUserList({
   *   channelId: '2191569',
   * });
   * console.log(result.data);
   * ```
   */
  async getChannelKickedUserList(params: GetChannelKickedUserListParams): Promise<GetChannelKickedUserListResponse> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }

    const response = await this.client.httpClient.post<GetChannelKickedUserListResponse>(
      '/live/v3/channel/chat/list-kicked',
      null,
      { params }
    );
    return response as unknown as GetChannelKickedUserListResponse;
  }

  /**
   * getForbidUserList - 全平台封禁用户列表
   *
   * @param params - Query parameters
   * @returns Response with forbid user list
   *
   * @example
   * ```typescript
   * const result = await client.chat.getForbidUserList({
   *   pageNumber: 1,
   *   pageSize: 10,
   * });
   * console.log(result.data.contents);
   * ```
   */
  async getForbidUserList(params?: GetForbidUserListParams): Promise<GetForbidUserListResponse> {
    const response = await this.client.httpClient.get<GetForbidUserListResponse>(
      '/live/v4/chat/forbid/list',
      { params }
    );
    return response as unknown as GetForbidUserListResponse;
  }

  /**
   * getUserBadwordList - 查询账号严禁词
   *
   * @returns Response with badword list
   *
   * @example
   * ```typescript
   * const result = await client.chat.getUserBadwordList();
   * console.log(result.data);
   * ```
   */
  async getUserBadwordList(): Promise<GetUserBadwordListResponse> {
    const response = await this.client.httpClient.get<GetUserBadwordListResponse>(
      '/live/v3/user/badword/list'
    );
    return response as unknown as GetUserBadwordListResponse;
  }

  /**
   * getUserBannedList - 查询账号禁言列表
   *
   * @param params - Query parameters
   * @returns Response with banned user list
   *
   * @example
   * ```typescript
   * const result = await client.chat.getUserBannedList({
   *   page: 1,
   *   size: 10,
   * });
   * console.log(result.data.contents);
   * ```
   */
  async getUserBannedList(params?: GetUserBannedListParams): Promise<GetUserBannedListResponse> {
    const response = await this.client.httpClient.get<GetUserBannedListResponse>(
      '/live/v3/user/chat/banned-user/list',
      { params }
    );
    return response as unknown as GetUserBannedListResponse;
  }

  /**
   * updateBannedUser - 禁言/解禁用户
   *
   * @param params - Update parameters
   * @returns Response with success status
   *
   * @example
   * ```typescript
   * // Ban user
   * const result = await client.chat.updateBannedUser({
   *   channelId: '2191569',
   *   userIds: 'ovtl9t_RxnrTdqkXqkT5Q5lnxp2A',
   *   toBanned: 'Y',
   * });
   * console.log(result.data);
   *
   * // Unban user
   * const result2 = await client.chat.updateBannedUser({
   *   channelId: '2191569',
   *   userIds: 'ovtl9t_RxnrTdqkXqkT5Q5lnxp2A',
   *   toBanned: 'N',
   * });
   * console.log(result2.data);
   * ```
   */
  async updateBannedUser(params: UpdateBannedUserParams): Promise<UpdateBannedUserResponse> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }
    if (!params.userIds) {
      throw new PolyVValidationError('userIds is required');
    }

    const response = await this.client.httpClient.post<UpdateBannedUserResponse>(
      '/live/v3/channel/chat/banned-user',
      null,
      { params }
    );
    return response as unknown as UpdateBannedUserResponse;
  }

  /**
   * updateBannedViewer - 账号设置禁言/解禁用户
   *
   * @param params - Update parameters
   * @returns Response with success status
   *
   * @example
   * ```typescript
   * // Ban viewers
   * const result = await client.chat.updateBannedViewer({
   *   viewerIds: ['test', 'test1'],
   *   banned: 'Y',
   * });
   * console.log(result.data);
   *
   * // Unban viewers
   * const result2 = await client.chat.updateBannedViewer({
   *   viewerIds: ['test', 'test1'],
   *   banned: 'N',
   * });
   * console.log(result2.data);
   * ```
   */
  async updateBannedViewer(params: UpdateBannedViewerParams): Promise<UpdateBannedViewerResponse> {
    if (!params.viewerIds || params.viewerIds.length === 0) {
      throw new PolyVValidationError('viewerIds is required and cannot be empty');
    }
    if (!params.banned) {
      throw new PolyVValidationError('banned is required');
    }

    const response = await this.client.httpClient.post<UpdateBannedViewerResponse>(
      '/live/v3/user/chat/banned-user/update',
      null,
      { params: { viewerIds: JSON.stringify(params.viewerIds), banned: params.banned } }
    );
    return response as unknown as UpdateBannedViewerResponse;
  }
}
