/**
 * Live Interaction API Types
 *
 * 直播互动功能类型定义（签到、答题卡、问卷、抽奖、点赞、打赏、学员提问）
 */

export type LiveInteractionChannelId = string | number;
export type LiveInteractionYnFlag = 'Y' | 'N';
export type QuestionType = 'R' | 'C' | 'S' | 'V';
export type QuestionnaireQuestionType = 'R' | 'C' | 'Q' | 'J' | 'X' | string;
export type RewardDonateType = 'cash' | 'good' | string;
export type TeacherAnswerMessageType = 'image' | string;

// ============================================
// 签到 (Checkin) Types
// ============================================

export interface GetCheckinListParams {
  channelId: LiveInteractionChannelId;
  page?: number;
  pageSize?: number;
  date?: string;
  sessionId?: string;
}

export interface GetCheckinByCheckinIdParams {
  channelId: LiveInteractionChannelId;
  checkinId: string;
}

export interface GetCheckinBySessionIdParams {
  channelId: LiveInteractionChannelId;
  sessionId: string;
}

export interface GetCheckinByTimeParams {
  channelId: LiveInteractionChannelId;
  startDate: string;
  endDate: string;
}

export interface CheckinListItem {
  checkinId?: string;
  sessionId?: string;
  checkinTime?: number;
  viewerId?: string;
  nick?: string;
  [key: string]: unknown;
}

export interface CheckinListResponse {
  pageNumber?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  contents?: CheckinListItem[];
  [key: string]: unknown;
}

export type CheckinRecordResponse = unknown;

// ============================================
// 问卷 (Questionnaire) Types
// ============================================

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

export interface BatchQuestionnaireParams extends CreateQuestionnaireParams {}

export interface BatchCreateQuestionnaireParams {
  questionnaires: BatchQuestionnaireParams[];
}

export type AddEditQuestionnaireParams = CreateQuestionnaireParams;

export interface ListQuestionnaireParams {
  channelId: LiveInteractionChannelId;
  startTime?: number;
  endTime?: number;
  page?: number;
  pageSize?: number;
}

export interface ListQuestionnaireByPageParams {
  channelId: LiveInteractionChannelId;
  page?: number;
  pageSize?: number;
  sessionIdId?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetQuestionnaireDetailParams {
  channelId: LiveInteractionChannelId;
  questionnaireId: string;
}

export interface GetQuestionnaireResultParams {
  channelId: LiveInteractionChannelId;
  questionnaireId?: string;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
}

export interface QuestionnaireListItem {
  questionnaireId?: string;
  questionnaireTitle?: string;
  title?: string;
  status?: string;
  createdTime?: number;
  [key: string]: unknown;
}

export interface QuestionnaireListResponse {
  pageNumber?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  contents?: QuestionnaireListItem[];
  [key: string]: unknown;
}

export interface QuestionnaireSavedInfo {
  questionnaireId?: string;
  questionIds?: string[];
  channelId?: LiveInteractionChannelId;
  questionnaireTitle?: string;
  [key: string]: unknown;
}

export type QuestionnaireDetailResponse = QuestionnaireSavedInfo | Record<string, unknown> | null;

export interface BatchCreateQuestionnaireResponse {
  questionnaires?: QuestionnaireSavedInfo[];
  [key: string]: unknown;
}

export type QuestionnaireResultResponse = unknown;

// ============================================
// 答题卡 (Question) Types
// ============================================

export interface ListQuestionParams {
  channelId: LiveInteractionChannelId;
}

export interface ListQuestionSendTimeParams {
  channelId: LiveInteractionChannelId;
}

export interface AddEditQuestionParams {
  channelId: LiveInteractionChannelId;
  questionId: string;
  type: QuestionType;
  answer: string;
  name: string;
  itemType: number;
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
  channelId: LiveInteractionChannelId;
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
  channelId: LiveInteractionChannelId;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetQuestionListParams {
  begin?: number;
  end?: number;
}

export interface QuestionListItem {
  questionId?: string;
  name?: string;
  type?: string;
  [key: string]: unknown;
}

export type QuestionListResponse = QuestionListItem[] | Record<string, unknown>;
export type AnswerListResponse = unknown;

export interface QuestionRecordUser {
  nick?: string;
  pic?: string;
  userId?: string;
  sessionId?: string | null;
  userType?: string;
  banned?: boolean;
  channelId?: string | null;
  [key: string]: unknown;
}

export interface QuestionRecord {
  id?: string;
  content?: string;
  time?: number;
  s_userId?: string | null;
  event?: 'T_ANSWER' | 'S_QUESTION' | string;
  sourceType?: string | null;
  user?: QuestionRecordUser;
  [key: string]: unknown;
}

export type GetQuestionListResponse = QuestionRecord[];

// ============================================
// 抽奖 (Lottery) Types
// ============================================

export interface ListLotteryParams {
  channelId: LiveInteractionChannelId;
  sessionId?: string;
  startTime: number;
  endTime: number;
  page?: number;
  limit?: number;
}

export interface ListChannelsLotteryParams {
  channelIds: string | LiveInteractionChannelId[];
  startTime: number;
  endTime: number;
  sessionId?: string;
  page?: number;
  limit?: number;
}

export interface GetWinnerDetailParams {
  channelId: LiveInteractionChannelId;
  lotteryId: string;
  page?: number;
  limit?: number;
}

export interface DownloadWinnerDetailParams {
  channelId: LiveInteractionChannelId;
  lotteryId: string;
}

export interface AddReceiveInfoParams {
  channelId: LiveInteractionChannelId;
  lotteryId: string;
  winnerCode: string;
  viewerId: string;
  receiveInfo?: unknown[] | Record<string, unknown>;
}

export type AddReceiveInfoV4Params = AddReceiveInfoParams;

export interface LotteryListItem {
  lotteryId?: string;
  channelId?: string;
  sessionId?: string;
  lotteryTime?: number;
  winnerCount?: number;
  [key: string]: unknown;
}

export interface LotteryListResponse {
  pageNumber?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  contents?: LotteryListItem[];
  [key: string]: unknown;
}

export interface WinnerDetailItem {
  viewerId?: string;
  nick?: string;
  winnerCode?: string;
  winTime?: number;
  [key: string]: unknown;
}

export interface WinnerDetailResponse {
  pageNumber?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  contents?: WinnerDetailItem[];
  [key: string]: unknown;
}

export type DownloadWinnerDetailResponse = unknown;
export type AddReceiveInfoResponse = string | Record<string, unknown> | null;

// ============================================
// 其他互动 Types
// ============================================

export interface SendFavorParams {
  channelId: LiveInteractionChannelId;
  viewerId: string;
  times?: number;
}

export type SendFavorResponse = string | number;

export interface SendRewardMsgParams {
  channelId: LiveInteractionChannelId;
  nickname: string;
  avatar: string;
  viewerId: string;
  donateType: RewardDonateType;
  content: string;
  goodImage?: string;
  sessionId?: string;
  goodNum?: string;
  needUserImage?: LiveInteractionYnFlag;
}

export type SendRewardMsgResponse = string | Record<string, unknown> | null;

// ============================================
// 学员提问 Webhook / 讲师回答 Types
// ============================================

export interface GetStudentQuestionWebhookParams {
  roomId?: string;
}

export interface StudentQuestionWebhookResponse {
  callbackUrl: string;
  [key: string]: unknown;
}

export interface SetStudentQuestionWebhookParams {
  roomId: string;
  callbackUrl: string;
}

export interface DeleteStudentQuestionWebhookParams {
  roomId: string;
}

export type StudentQuestionWebhookMutationResponse = string | Record<string, unknown> | null;

export interface TeacherAnswerParams {
  roomId: string;
  content: string;
  viewerUserId: string;
  teacherNick?: string;
  teacherPic?: string;
  msgType?: TeacherAnswerMessageType;
}

export interface TeacherAnswerResponse {
  id?: number;
  [key: string]: unknown;
}
