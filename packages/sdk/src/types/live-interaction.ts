/**
 * Live Interaction API Types
 *
 * 直播互动功能类型定义 (抽奖、问卷、签到、答题卡、点赞、打赏)
 */

// ============================================
// 签到 (Checkin) Types
// ============================================

export interface GetCheckinListParams {
  channelId: string;
  page?: number;
  pageSize?: number;
  date?: string;
  sessionId?: string;
}

export interface GetCheckinByCheckinIdParams {
  channelId: string;
  checkinId: string;
}

export interface GetCheckinBySessionIdParams {
  channelId: string;
  sessionId: string;
}

export interface GetCheckinByTimeParams {
  channelId: string;
  startDate: string;
  endDate: string;
}

// ============================================
// 问卷 (Questionnaire) Types
// ============================================

export interface CreateQuestionnaireParams {
  channelId: number;
}

export interface BatchCreateQuestionnaireParams {
  // Empty - just appId, timestamp, sign
}

export interface BatchCreateQuestionnaireBody {
  channelIds: number[];
  title: string;
  items: Array<{
    type: string;
    question: string;
    options?: string[];
    required?: boolean;
  }>;
}

export interface AddEditQuestionnaireParams {
  channelId: string;
}

export interface AddEditQuestionnaireBody {
  questionnaireId?: string;
  title: string;
  items: Array<{
    type: 'R' | 'C' | 'S' | 'V';
    question: string;
    options?: string[];
    required?: boolean;
  }>;
}

export interface ListQuestionnaireParams {
  channelId: string;
  startTime?: number;
  endTime?: number;
  page?: number;
  pageSize?: number;
}

export interface ListQuestionnaireByPageParams {
  channelId: string;
  page?: number;
  pageSize?: number;
  sessionIdId?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetQuestionnaireDetailParams {
  channelId: string;
  questionnaireId: string;
}

export interface GetQuestionnaireResultParams {
  channelId: string;
  questionnaireId?: string;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================
// 答题卡 (Question) Types
// ============================================

export interface ListQuestionParams {
  channelId: string;
}

export interface ListQuestionSendTimeParams {
  channelId: string;
}

export interface AddEditQuestionParams {
  channelId: string;
  questionId?: string;
  _type: 'R' | 'C' | 'S' | 'V';
  answer: string;
  name: string;
  itemType: number;
  option1_option15?: string;
  tips1_tips5?: string;
}

export interface DeleteQuestionParams {
  channelId: string;
  questionId: string;
}

export interface SendQuestionParams {
  channelId: number;
  questionId: string;
  duration?: number;
}

export interface StopQuestionParams {
  channelId: number;
  questionId: string;
}

export interface SendQuestionResultParams {
  channelId: number;
  questionId: string;
}

export interface GetAnswerListParams {
  channelId: string;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================
// 抽奖 (Lottery) Types
// ============================================

export interface ListLotteryParams {
  channelId: string;
  sessionId?: string;
  startTime: number;
  endTime: number;
  page?: number;
  limit?: number;
}

export interface ListChannelsLotteryParams {
  channelIds: string;
  startTime: number;
  endTime: number;
  sessionId?: string;
  page?: number;
  limit?: number;
}

export interface GetWinnerDetailParams {
  channelId: string;
  lotteryId: string;
  page?: number;
  limit?: number;
}

export interface DownloadWinnerDetailParams {
  channelId: string;
  lotteryId: string;
}

export interface AddReceiveInfoParams {
  channelId: string;
  lotteryId: string;
  winnerCode: string;
  viewerId: string;
  name?: string;
  telephone?: string;
  receiveInfo?: unknown;
}

export interface AddReceiveInfoV4Params {
  channelId: string;
  lotteryId: string;
  winnerCode: string;
  viewerId: string;
  receiveInfo?: unknown;
}

// ============================================
// 其他互动 Types
// ============================================

export interface SendFavorParams {
  viewerId: string;
  times?: number;
}

export interface SendRewardMsgParams {
  channelId: string;
  nickname: string;
  avatar: string;
  viewerId: string;
  donateType: 'cash' | 'good';
  content: string;
  goodImage?: string;
  sessionId?: string;
  goodNum?: string;
  needUserImage?: 'Y' | 'N';
}

export interface GetQuestionListParams {
  begin?: number;
  end?: number;
}

// ============================================
// Response Types
// ============================================

export interface CheckinListResponse {
  code?: number;
  status?: string;
  message?: string;
  data?: {
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    contents: Array<{
      checkinId: string;
      sessionId: string;
      checkinTime: number;
      viewerId: string;
      nick: string;
    }>;
  };
}

export interface CheckinRecordResponse {
  code?: number;
  status?: string;
  message?: string;
  data?: unknown;
}

export interface QuestionnaireListResponse {
  code?: number;
  status?: string;
  message?: string;
  data?: {
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    contents: Array<{
      questionnaireId: string;
      title: string;
      status: string;
      createdTime: number;
    }>;
  };
}

export interface QuestionnaireDetailResponse {
  code?: number;
  status?: string;
  message?: string;
  data?: Record<string, unknown>;
}

export interface QuestionnaireResultResponse {
  code?: number;
  status?: string;
  message?: string;
  data?: unknown;
}

export interface QuestionListResponse {
  code?: number;
  status?: string;
  message?: string;
  data?: Record<string, unknown>;
}

export interface AnswerListResponse {
  code?: number;
  status?: string;
  message?: string;
  data?: unknown;
}

export interface LotteryListResponse {
  code?: number;
  status?: string;
  message?: string;
  data?: {
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    contents: Array<{
      lotteryId: string;
      channelId: string;
      sessionId: string;
      lotteryTime: number;
      winnerCount: number;
    }>;
  };
}

export interface WinnerDetailResponse {
  code?: number;
  status?: string;
  message?: string;
  data?: {
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    contents: Array<{
      viewerId: string;
      nick: string;
      winnerCode: string;
      winTime: number;
    }>;
  };
}

export interface AddReceiveInfoResponse {
  code?: number;
  status?: string;
  message?: string;
  data?: string;
}

export interface SendFavorResponse {
  code?: number;
  status?: string;
  message?: string;
  data?: string;
}

export interface SendRewardMsgResponse {
  code?: number;
  status?: string;
  message?: string;
  data?: string;
}

export interface QuestionListResponse2 {
  code?: number;
  status?: string;
  message?: string;
  data?: unknown;
}
