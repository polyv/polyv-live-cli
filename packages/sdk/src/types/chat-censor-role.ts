/**
 * Chat Censor and Role Service Types
 *
 * Types for the ChatService censor and role APIs (Epic 3, Story 3.2)
 */

// ============================================
// Censor API Types
// ============================================

/**
 * Update censor enabled request parameters
 */
export interface UpdateCensorEnabledParams {
  /** 频道号 */
  channelId: string;
  /** 开关，Y/N，不传时根据当前值自动切换 */
  enabled?: 'Y' | 'N';
}

/**
 * Update censor enabled response
 */
export interface UpdateCensorEnabledResponse {
  code: number;
  status: string;
  message: string;
  /** 设置成功返回当前聊天审核开关类型，开启为true，没开启为false */
  data: boolean;
}

// ============================================
// Role API Types - Admin
// ============================================

/**
 * Admin information
 */
export interface AdminInfo {
  /** 管理员头衔 */
  actor: string;
  /** 管理员昵称 */
  nickname: string;
  /** 管理员头像 */
  avatar: string;
}

/**
 * Get admin info request parameters
 */
export interface GetAdminInfoParams {
  /** 频道号 */
  channelId: string;
}

/**
 * Get admin info response
 */
export interface GetAdminInfoResponse {
  code: number;
  status: string;
  message: string;
  data: AdminInfo;
}

/**
 * Update admin info request parameters
 * Note: avatar is a required multipart file upload (jpg/jpeg/png, <=2Mb).
 * Only appId, timestamp, nickname and actor participate in the signature;
 * the avatar file is submitted as a binary stream and is not signed.
 */
export interface UpdateAdminInfoParams {
  /** 频道号 */
  channelId: string;
  /** 管理员昵称，长度不能超过8 */
  nickname: string;
  /** 管理员头衔，长度不能超过4 */
  actor: string;
  /** 管理员头像文件（File/Blob/Buffer），支持jpg、jpeg、png三种格式，大小不能超过2Mb */
  avatar: Blob | File | Buffer;
}

/**
 * Update admin info response
 */
export interface UpdateAdminInfoResponse {
  code: number;
  status: string;
  message: string;
  /** 请求失败时为空，请求成功时为"修改成功" */
  data: string;
}

// ============================================
// Role API Types - Teacher
// ============================================

/**
 * Teacher information
 */
export interface TeacherInfo {
  /** 讲师id，同频道号 */
  account: string;
  /** 讲师头衔 */
  actor: string;
  /** 讲师头像 */
  avatar: string;
  /** 频道号 */
  channelId: string | number;
  /** 讲师昵称 */
  nickname: string;
  /** 讲师登录密码 */
  passwd: string;
  /** 该字段为null */
  loginCode: string | null;
  /** 该字段为null */
  role: string | null;
}

/**
 * Get teacher info request parameters
 */
export interface GetTeacherInfoParams {
  channelId: string;
}

/**
 * Get teacher info response
 */
export interface GetTeacherInfoResponse {
  code: number;
  status: string;
  message: string;
  data: TeacherInfo;
}

/**
 * Update teacher info request parameters
 */
export interface UpdateTeacherInfoParams {
  /** 频道号 */
  channelId: string;
  /** 讲师昵称 */
  nickname?: string;
  /** 讲师头衔 */
  actor?: string;
  /** 频道密码 */
  passwd?: string;
  /** 头像图片地址，如果为空，则使用默认头像 */
  avatar?: string;
}

/**
 * Update teacher info response
 */
export interface UpdateTeacherInfoResponse {
  code: number;
  status: string;
  message: string;
  /** 成功返回true，错误返回空字符串 */
  data: boolean | string;
}

// ============================================
// User List API Types
// ============================================

/**
 * User types in chat room
 */
export type UserType =
  | 'assistant'  // 助教
  | 'student'    // 普通观众
  | 'slice'      // 普通观众
  | 'dummy'      // 虚拟观众
  | 'teacher'    // 讲师
  | 'guest'      // 嘉宾
  | 'attendee'   // 研讨会参会者
  | 'manager'    // 直播监控管理员
  | 'talent';    // 同台主播

/**
 * User in chat room
 */
export interface ChatRoomUser {
  /** 身份信息，讲师、助教等 */
  actor: string;
  /** 是否禁言 */
  banned: boolean;
  /** 频道号 */
  channelId: string;
  /** 用户ip */
  clientIp: string;
  /** 昵称 */
  nick: string;
  /** 头像 */
  pic: string;
  /** 房间号 */
  roomId: string;
  /** socket id */
  uid: string;
  /** 用户id */
  userId: string;
  /** 信息来源 */
  userSource: string;
  /** 用户类型 */
  userType: UserType;
}

/**
 * Get user list request parameters
 */
export interface GetUserListParams {
  /** 房间号 */
  roomId: string;
  /** 页码，默认1 */
  page?: number;
  /** 每一页条数，默认100，最多返回1000条 */
  len?: number;
  /** 是否获取子频道的用户，true为获取，false为不获取 */
  toGetSubRooms?: boolean;
}

/**
 * Get user list response
 */
export interface GetUserListResponse {
  /** 总人数 */
  count: number;
  /** 用户列表 */
  userlist: ChatRoomUser[];
}
