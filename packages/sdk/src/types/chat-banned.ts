/**
 * Chat Banned Service Types
 *
 * Types for the ChatService banned/chat management APIs (Epic 3, Story 3.3)
 */

// ============================================
// Badwords API Types
// ============================================

/**
 * Add badwords request parameters
 */
export interface AddBadwordsParams {
  /** 直播账号ID */
  userId: string;
  /** 严禁词，json数组格式，例如 ["forbiddenWords1","forbiddenWords2"] */
  words: string[];
  /** 频道号，可选，不提交或传-1则设置为账号级的严禁词，对该账号的所有频道都生效 */
  channelId?: string;
}

/**
 * Add badwords response
 */
export interface AddBadwordsResponse {
  code: number;
  status: string;
  message: string;
  data: {
    /** 直播账户id */
    userId: string;
    /** 该频道严禁词的数量，如果修改全部频道， count为该账户严禁词的全部数量 */
    count: number;
  };
}

// ============================================
// Banned IP API Types
// ============================================

/**
 * Add banned IP request parameters
 */
export interface AddBannedIpParams {
  /** 频道号 */
  channelId: string;
  /** 禁言IP */
  ip: string;
}

/**
 * Add banned IP response
 */
export interface AddBannedIpResponse {
  code: number;
  status: string;
  message: string;
  /** 当前设置的禁言IP数组 */
  data: string[];
}

// ============================================
// Delete Channel Banned Types
// ============================================

/**
 * Delete channel banned request parameters
 */
export interface DeleteChannelBannedParams {
  /** 频道号 */
  channelId: string;
  /** 请求类型: ip=取消已禁言IP, badword=删除严禁词 */
  type: 'ip' | 'badword';
  /** 要取消的IP或严禁词，多个用英文逗号分隔 */
  content: string;
}

/**
 * Delete channel banned response
 */
export interface DeleteChannelBannedResponse {
  code: number;
  status: string;
  message: string;
  /** 成功返回 "success" */
  data: string;
}

// ============================================
// Delete User Badword Types
// ============================================

/**
 * Delete user badword request parameters
 */
export interface DeleteUserBadwordParams {
  /** 要删除的严禁词，多个以英文逗号分隔 */
  words: string;
}

/**
 * Delete user badword response
 */
export interface DeleteUserBadwordResponse {
  code: number;
  status: string;
  message: string;
  /** 删除后剩下的严禁词数组 */
  data: string[];
}

// ============================================
// Kick Users API Types (Channel)
// ============================================

/**
 * Kick users request body
 */
export interface KickUsersBody {
  /** 需要踢人的用户ID列表 */
  viewerIds: string[];
  /** 用户昵称列表, 与viewerIds一一对应 */
  nickNames: string[];
}

/**
 * Kick users in channel request parameters
 */
export interface ForbidChannelKickUsersParams {
  /** 频道号 */
  channelId: string;
}

/**
 * Kick users in channel request body (JSON)
 */
export type ForbidChannelKickUsersBody = KickUsersBody;

/**
 * Kick users in channel response (uses same as global)
 */
export type ForbidChannelKickUsersResponse = ForbidKickUsersGlobalResponse;

/**
 * Kick users response
 */
export interface ForbidKickUsersResponse {
  code: number;
  status: string;
  message: string;
  /** 成功返回 "SUCCESS" */
  data: string;
}

// ============================================
// Unkick Users API Types (Channel)
// ============================================

/**
 * Unkick users in channel request parameters
 */
export interface ForbidChannelUnkickUsersParams {
  /** 频道号 */
  channelId: string;
}

/**
 * Unkick users in channel request body (JSON)
 */
export type ForbidChannelUnkickUsersBody = KickUsersBody;

/**
 * Unkick users response (uses same as kick)
 */
export type ForbidChannelUnkickUsersResponse = ForbidKickUsersResponse;

// ============================================
// Kick Users API Types (Global)
// ============================================

/**
 * Kick users globally request body (JSON)
 */
export type ForbidKickUsersBody = KickUsersBody;

/**
 * Kick users globally response
 */
export type ForbidKickUsersGlobalResponse = ForbidKickUsersResponse;

// ============================================
// Unkick Users API Types (Global)
// ============================================

/**
 * Unkick users globally request body (JSON)
 */
export type ForbidUnkickUsersBody = KickUsersBody;

/**
 * Unkick users globally response
 */
export type ForbidUnkickUsersGlobalResponse = ForbidKickUsersResponse;

// ============================================
// Get Channel Banned List Types
// ============================================

/**
 * Get channel banned list request parameters
 */
export interface GetChannelBannedListParams {
  /** 频道号 */
  channelId: string;
  /** 查询类型: badword=严禁词(默认), ip=禁言IP */
  type?: 'badword' | 'ip';
}

/**
 * Get channel banned list response
 */
export interface GetChannelBannedListResponse {
  code: number;
  status: string;
  message: string;
  /** 严禁词数组或禁言IP数组 */
  data: string[];
}

// ============================================
// Get Channel Banned User List Types
// ============================================

/**
 * Get channel banned user list request parameters
 */
export interface GetChannelBannedUserListParams {
  /** 频道号 */
  channelId: string;
  /** 禁言类型: ip=查询禁言IP, userId=查询禁言用户ID */
  type: 'ip' | 'userId';
  /** 是否获取子频道: 0=不获取, 1=获取 */
  toGetSubRooms?: number;
}

/**
 * Get channel banned user list response
 */
export interface GetChannelBannedUserListResponse {
  code: number;
  status: string;
  message: string;
  /** IP数组或用户ID数组 */
  data: string[];
}

// ============================================
// Get Channel Kicked User List Types
// ============================================

/**
 * Kicked user information
 */
export interface KickedUser {
  /** 是否禁言 */
  banned: boolean;
  /** 频道号 */
  channelId: string;
  /** 用户IP */
  clientIp: string;
  /** 昵称 */
  nick: string;
  /** 自定义参数param4 */
  param4?: string;
  /** 头像图片地址 */
  pic: string;
  /** 房间号 */
  roomId: string;
  /** 聊天室socket ID */
  uid: string;
  /** 用户ID */
  userId: string;
  /** 用户身份 */
  userType: 'manager' | 'teacher' | 'assistant' | 'guest' | 'viewer' | 'slice' | 'student';
}

/**
 * Get channel kicked user list request parameters
 */
export interface GetChannelKickedUserListParams {
  /** 频道号 */
  channelId: string;
}

/**
 * Get channel kicked user list response
 */
export interface GetChannelKickedUserListResponse {
  code: number;
  status: string;
  message: string;
  /** 被踢人列表 */
  data: KickedUser[];
}

// ============================================
// Get Forbid User List Types (Global)
// ============================================

/**
 * Forbid user information
 */
export interface ForbidUser {
  /** 用户昵称 */
  nickName: string;
  /** 用户ID */
  viewerId: string;
  /** 是否被禁言: Y是, N不是 */
  banned: 'Y' | 'N';
  /** 是否被踢人: Y是, N不是 */
  kicked: 'Y' | 'N';
  /** 操作时间戳(13位) */
  operationTime: number;
}

/**
 * Get forbid user list request parameters
 */
export interface GetForbidUserListParams {
  /** 观众ID (可选) */
  viewerId?: string;
  /** 观众昵称 (可选) */
  nickName?: string;
  /** 分页页码, 默认1 */
  pageNumber?: number;
  /** 分页大小, 默认10, 最大1000 */
  pageSize?: number;
}

/**
 * Paginated response data
 */
export interface PaginatedForbidUserData {
  /** 当前页码 */
  pageNumber: number;
  /** 分页记录数 */
  pageSize: number;
  /** 总条数 */
  totalItems: number;
  /** 封禁用户列表 */
  contents: ForbidUser[];
}

/**
 * Get forbid user list response
 */
export interface GetForbidUserListResponse {
  code: number;
  status: string;
  message: string;
  data: PaginatedForbidUserData;
}

// ============================================
// Get User Badword List Types
// ============================================

/**
 * Get user badword list response
 */
export interface GetUserBadwordListResponse {
  code: number;
  status: string;
  message: string;
  /** 账号下通用设置的严禁词数组 */
  data: string[];
}

// ============================================
// Get User Banned List Types
// ============================================

/**
 * Get user banned list request parameters
 */
export interface GetUserBannedListParams {
  /** 分页页码, 默认1 */
  page?: number;
  /** 分页大小, 默认10, 最大1000 */
  size?: number;
}

/**
 * User banned list paginated data
 */
export interface PaginatedUserBannedData {
  /** 当前页码 */
  pageNumber: number;
  /** 分页记录数 */
  pageSize: number;
  /** 总条数 */
  totalItems: number;
  /** 禁言用户ID列表 */
  contents: string[];
}

/**
 * Get user banned list response
 */
export interface GetUserBannedListResponse {
  code: number;
  status: string;
  message: string;
  data: PaginatedUserBannedData;
}

// ============================================
// Update Banned User Types
// ============================================

/**
 * Update banned user request parameters
 */
export interface UpdateBannedUserParams {
  /** 频道号 */
  channelId: string;
  /** 聊天室用户ID, 多个用半角逗号分隔 */
  userIds: string;
  /** Y=禁言, N=解除禁言 */
  toBanned?: 'Y' | 'N';
}

/**
 * Update banned user response
 */
export interface UpdateBannedUserResponse {
  code: number;
  status: string;
  message: string;
  /** 成功返回 "SUCCESS" */
  data: string;
}

// ============================================
// Update Banned Viewer Types (Account-level)
// ============================================

/**
 * Update banned viewer request parameters
 */
export interface UpdateBannedViewerParams {
  /** 聊天室用户ID数组 (json数组格式) */
  viewerIds: string[];
  /** Y=禁言, N=解除禁言 */
  banned: 'Y' | 'N';
}

 /**
 * Update banned viewer response
 */
export interface UpdateBannedViewerResponse {
  code: number;
  status: string;
  message: string;
  /** 成功返回 "SUCCESS" */
  data: string;
}
