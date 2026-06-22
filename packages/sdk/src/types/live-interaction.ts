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

export type LiveInteractionChannelId = string | number;
export type LiveInteractionYnFlag = 'Y' | 'N';
export type QuestionType = 'R' | 'C' | 'S' | 'V';
export type QuestionnaireQuestionType = 'R' | 'C' | 'Q' | 'J' | 'X' | string;

export interface QuestionnaireOption {
  id?: string;
  name?: string;
  [key: string]: unknown;
}

export interface QuestionnaireQuestion {
  name: string;
  type: QuestionnaireQuestionType;
  desc?: string;
  answer?: string;
  required?: LiveInteractionYnFlag | string;
  scoreEnabled?: LiveInteractionYnFlag | string;
  score?: number | string;
  scoreExt?: unknown;
  options?: string[];
  optionList?: QuestionnaireOption[];
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  option5?: string;
  option6?: string;
  option7?: string;
  option8?: string;
  option9?: string;
  option10?: string;
  [key: string]: unknown;
}

export interface CreateQuestionnaireParams {
  channelId: LiveInteractionChannelId;
  questionnaireTitle: string;
  questions: QuestionnaireQuestion[];
  customQuestionnaireId?: string;
  autoPublishTime?: string | number;
  autoEndTime?: string | number;
  privacyEnabled?: LiveInteractionYnFlag | string;
  privacyContent?: string;
  userTags?: string[];
  desc?: string;
  [key: string]: unknown;
}

export interface BatchCreateQuestionnaireParams {
  questionnaires: CreateQuestionnaireParams[];
}

export type BatchCreateQuestionnaireBody = BatchCreateQuestionnaireParams;
export type AddEditQuestionnaireParams = { channelId: LiveInteractionChannelId } & Partial<Omit<CreateQuestionnaireParams, 'channelId'>>;
export type AddEditQuestionnaireBody = Omit<CreateQuestionnaireParams, 'channelId'> & {
  title?: string;
  items?: Array<{
    type: 'R' | 'C' | 'S' | 'V' | string;
    question: string;
    options?: string[];
    required?: boolean;
  }>;
};

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
  channelId: LiveInteractionChannelId;
  questionId?: string;
  type?: QuestionType;
  _type?: QuestionType;
  answer: string;
  name: string;
  itemType: number;
  option1_option15?: string;
  tips1_tips5?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  option5?: string;
  option6?: string;
  option7?: string;
  option8?: string;
  option9?: string;
  option10?: string;
  option11?: string;
  option12?: string;
  option13?: string;
  option14?: string;
  option15?: string;
  tips1?: string;
  tips2?: string;
  tips3?: string;
  tips4?: string;
  tips5?: string;
}

export interface DeleteQuestionParams {
  channelId: string;
  questionId: string;
}

export interface SendQuestionParams {
  channelId: LiveInteractionChannelId;
  questionId: string;
  duration?: number;
}

export interface StopQuestionParams {
  channelId: LiveInteractionChannelId;
  questionId: string;
}

export interface SendQuestionResultParams {
  channelId: LiveInteractionChannelId;
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
