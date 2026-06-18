/**
 * Chat Service Types
 *
 * Types for the ChatService message APIs (Epic 3, Story 3.1)
 */

// Request parameter types
export interface getHistoryPageParams {
  channelId: string;
  startDay?: string;
  endDay?: string;
  page?: number;
  pageSize?: number;
  userType?: string;
  status?: string;
  source?: string;
  roomId?: string;
}

export interface sendAdminMsgParams {
  channelId: string;
  msg?: string;
  imgUrl?: string;
  pic?: string;
  nickName?: string;
  actor?: string;
  adminIndex?: number;
  freeReview?: boolean;
  apiVersion?: string;
}

export interface sendChatParams {
  channelId: string;
  userId: string;
  content: string;
  imgUrl?: string;
}

export interface sendHiddenByAdminParams {
  channelId: string;
  content: string;
  role: string;
}

export interface delChatParams {
  channelId: string;
  id: string;
}

export interface CountOnlineUserParams {
  channelId: string;
}

export interface cleanChatParams {
  channelId: string;
}

export interface messageAuditParams {
  channelId: string;
  messages: messageAuditItem[];
}

export interface messageAuditItem {
  msgId: string;
  content: string;
  viewerId: string;
  nickName: string;
  avatar?: string;
  sessionId?: string;
  viewerType?: string;
}

export interface alertToSpecialParams {
  channelId: string;
  message: string;
  title: string;
}

export interface getSpeakListParams {
  startTime?: number;
  endTime?: number;
  cursor?: string;
  size?: number;
}

// Response types
export interface ChatMessage {
  id: string;
  content: string;
  msgType?: string;
  user?: {
    userId: string;
    nick: string;
    pic: string;
    userType: string;
  };
  time?: number;
  status?: string;
  image?: string;
  roomId?: string;
  sessionId?: string;
  accountId?: string;
}

export interface ChatHistoryPageResponse {
  contents: ChatMessage[];
  total: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
}

export interface SendAdminMsgResponse {
  success: boolean;
  message: string;
  data?: string;
}

export interface SendChatResponse {
  status: string;
  result?: string;
}

export interface SendHiddenByAdminResponse {
  code?: number;
  status: string;
  message?: string;
  data?: string;
}

export interface delChatResponse {
  success: boolean;
  message: string;
  data: string;
}

export interface cleanChatResponse {
  success: boolean;
  data: boolean;
}

export interface messageAuditResponse {
  code?: number;
  status?: string;
  requestId?: string;
  success?: boolean;
  data: {
    id: string;
    msgId: string;
    status: boolean;
    msg: string;
  }[];
}

export interface alertToSpecialResponse {
  code?: number;
  status?: string;
  requestId?: string;
  success?: boolean;
  data: boolean;
}

export interface SpeakListResponse {
  cursor: string;
  size: number;
  list: ChatMessage[];
}
