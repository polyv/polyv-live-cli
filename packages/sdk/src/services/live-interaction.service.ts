/**
 * LiveInteraction Service
 *
 * 直播互动功能服务（签到、问卷、答题卡、抽奖、点赞、打赏、学员提问）
 *
 * @module services/live-interaction.service
 */

import type { PolyVClient } from '../client.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';
import type {
  AddEditQuestionParams,
  AddEditQuestionnaireParams,
  AddReceiveInfoParams,
  AddReceiveInfoResponse,
  AddReceiveInfoV4Params,
  AnswerListResponse,
  BatchCreateQuestionnaireParams,
  BatchCreateQuestionnaireResponse,
  CheckinListResponse,
  CheckinRecordResponse,
  CreateQuestionnaireParams,
  DeleteQuestionParams,
  DeleteStudentQuestionWebhookParams,
  DownloadWinnerDetailParams,
  DownloadWinnerDetailResponse,
  GetAnswerListParams,
  GetCheckinByCheckinIdParams,
  GetCheckinBySessionIdParams,
  GetCheckinByTimeParams,
  GetCheckinListParams,
  GetQuestionListParams,
  GetQuestionListResponse,
  GetQuestionnaireDetailParams,
  GetQuestionnaireResultParams,
  GetStudentQuestionWebhookParams,
  GetWinnerDetailParams,
  ListChannelsLotteryParams,
  ListLotteryParams,
  ListQuestionnaireByPageParams,
  ListQuestionnaireParams,
  ListQuestionParams,
  ListQuestionSendTimeParams,
  LotteryListResponse,
  QuestionListResponse,
  QuestionnaireDetailResponse,
  QuestionnaireListResponse,
  QuestionnaireResultResponse,
  SendFavorParams,
  SendFavorResponse,
  SendQuestionParams,
  SendQuestionResultParams,
  SendRewardMsgParams,
  SendRewardMsgResponse,
  SetStudentQuestionWebhookParams,
  StopQuestionParams,
  StudentQuestionWebhookMutationResponse,
  StudentQuestionWebhookResponse,
  TeacherAnswerParams,
  TeacherAnswerResponse,
  WinnerDetailResponse,
} from '../types/live-interaction.js';

type Params = Record<string, unknown>;

/**
 * LiveInteractionService
 *
 * Provides live interaction APIs including check-in, questionnaire, question card,
 * lottery, reward messages, likes, and student question webhooks.
 */
export class LiveInteractionService {
  constructor(private readonly client: PolyVClient) {}

  private compactParams(params?: Params): Params {
    if (!params) return {};

    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
    );
  }

  private validateRequiredString(value: unknown, fieldName: string): void {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new PolyVValidationError(`${fieldName} is required`);
    }
  }

  private validateRequiredChannelId(value: unknown, fieldName = 'channelId'): void {
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      throw new PolyVValidationError(`${fieldName} is required`);
    }
  }

  private validateRequiredNumber(value: unknown, fieldName: string): void {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new PolyVValidationError(`${fieldName} is required`);
    }
  }

  private validatePositiveInteger(value: unknown, fieldName: string): void {
    if (value === undefined || value === null) return;

    if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
      throw new PolyVValidationError(`${fieldName} must be a positive integer`);
    }
  }

  private validateNonNegativeInteger(value: unknown, fieldName: string): void {
    if (value === undefined || value === null) return;

    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      throw new PolyVValidationError(`${fieldName} must be a non-negative integer`);
    }
  }

  private validateRequiredArray(value: unknown, fieldName: string): void {
    if (!Array.isArray(value) || value.length === 0) {
      throw new PolyVValidationError(`${fieldName} is required`);
    }
  }

  private validateRequiredChannelIds(value: unknown): void {
    if (Array.isArray(value)) {
      this.validateRequiredArray(value, 'channelIds');
      value.forEach((channelId, index) => {
        this.validateRequiredChannelId(channelId, `channelIds[${index}]`);
      });
      return;
    }

    this.validateRequiredString(value, 'channelIds');
  }

  private validateHttpUrl(value: string, fieldName: string): void {
    try {
      const parsedUrl = new URL(value);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('invalid protocol');
      }
    } catch {
      throw new PolyVValidationError(`${fieldName} must be a valid http:// or https:// URL`);
    }
  }

  private validatePageParams(params: { page?: number; pageSize?: number; limit?: number }): void {
    this.validatePositiveInteger(params.page, 'page');
    this.validatePositiveInteger(params.pageSize, 'pageSize');
    this.validatePositiveInteger(params.limit, 'limit');
  }

  private validateDateRange(params: { startDate?: string; endDate?: string }): void {
    if (params.startDate !== undefined) this.validateRequiredString(params.startDate, 'startDate');
    if (params.endDate !== undefined) this.validateRequiredString(params.endDate, 'endDate');
  }

  private validateTimeRange(params: { startTime?: number; endTime?: number }): void {
    this.validateRequiredNumber(params.startTime, 'startTime');
    this.validateRequiredNumber(params.endTime, 'endTime');
  }

  private validateQuestionnairePayload(params: CreateQuestionnaireParams): void {
    this.validateRequiredChannelId(params.channelId);
    this.validateRequiredString(params.questionnaireTitle, 'questionnaireTitle');
    this.validateRequiredArray(params.questions, 'questions');
  }

  private validateQuestionPayload(params: AddEditQuestionParams): void {
    this.validateRequiredChannelId(params.channelId);
    this.validateRequiredString(params.questionId, 'questionId');
    this.validateRequiredString(params.type, 'type');
    this.validateRequiredString(params.answer, 'answer');
    this.validateRequiredString(params.name, 'name');
    this.validateRequiredNumber(params.itemType, 'itemType');
  }

  private splitQuestionnairePayload(params: CreateQuestionnaireParams): {
    query: { channelId: CreateQuestionnaireParams['channelId'] };
    body: Omit<CreateQuestionnaireParams, 'channelId'>;
  } {
    const { channelId, ...body } = params;
    return { query: { channelId }, body };
  }

  private channelPathSegment(value: unknown, fieldName = 'channelId'): string {
    this.validateRequiredChannelId(value, fieldName);
    return encodeURIComponent(String(value));
  }

  // ============================================
  // 签到 (Checkin) APIs
  // ============================================

  /**
   * 查询频道签到成功记录（仅返回已签到记录）
   */
  async getCheckinList(params: GetCheckinListParams): Promise<CheckinListResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validatePageParams(params);

    const response = await this.client.httpClient.get<CheckinListResponse>(
      '/live/v3/channel/checkin/list',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as CheckinListResponse;
  }

  /**
   * 根据签到 ID 查询所有签到记录。
   */
  async getCheckinByCheckinId(params: GetCheckinByCheckinIdParams): Promise<CheckinRecordResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validateRequiredString(params.checkinId, 'checkinId');

    const response = await this.client.httpClient.get<CheckinRecordResponse>(
      '/live/v3/channel/chat/get-checkins',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as CheckinRecordResponse;
  }

  /**
   * 通过直播场次 ID 查询签到发起记录。
   */
  async getCheckinBySessionId(params: GetCheckinBySessionIdParams): Promise<CheckinRecordResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validateRequiredString(params.sessionId, 'sessionId');

    const response = await this.client.httpClient.get<CheckinRecordResponse>(
      '/live/v3/channel/chat/checkin-by-sessionId',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as CheckinRecordResponse;
  }

  /**
   * 查询频道指定时间范围内发起的签到记录。
   */
  async getCheckinByTime(params: GetCheckinByTimeParams): Promise<CheckinRecordResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validateRequiredString(params.startDate, 'startDate');
    this.validateRequiredString(params.endDate, 'endDate');

    const response = await this.client.httpClient.get<CheckinRecordResponse>(
      '/live/v3/channel/chat/get-checkin-list',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as CheckinRecordResponse;
  }

  // ============================================
  // 问卷 (Questionnaire) APIs
  // ============================================

  /**
   * 新增或修改频道问卷。
   */
  async createQuestionnaire(params: CreateQuestionnaireParams): Promise<QuestionnaireDetailResponse> {
    this.validateQuestionnairePayload(params);
    const { query, body } = this.splitQuestionnairePayload(params);

    const response = await this.client.httpClient.post<QuestionnaireDetailResponse>(
      '/live/v4/channel/questionnaire/save',
      body,
      { params: query }
    );
    return response as unknown as QuestionnaireDetailResponse;
  }

  /**
   * 批量创建问卷（支持多频道同时创建）。
   */
  async batchCreateQuestionnaire(
    params: BatchCreateQuestionnaireParams
  ): Promise<BatchCreateQuestionnaireResponse> {
    this.validateRequiredArray(params.questionnaires, 'questionnaires');
    params.questionnaires.forEach((questionnaire, index) => {
      try {
        this.validateQuestionnairePayload(questionnaire);
      } catch (error) {
        if (error instanceof PolyVValidationError) {
          throw new PolyVValidationError(`questionnaires[${index}].${error.message}`);
        }
        throw error;
      }
    });

    const response = await this.client.httpClient.post<BatchCreateQuestionnaireResponse>(
      '/live/v4/channel/questionnaire/create-batch',
      params
    );
    return response as unknown as BatchCreateQuestionnaireResponse;
  }

  /**
   * @deprecated Use createQuestionnaire. The current API is /live/v4/channel/questionnaire/save.
   */
  async addEditQuestionnaire(
    params: AddEditQuestionnaireParams
  ): Promise<QuestionnaireDetailResponse> {
    return this.createQuestionnaire(params);
  }

  /**
   * 查询频道问卷列表。
   */
  async listQuestionnaire(params: ListQuestionnaireParams): Promise<QuestionnaireListResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validatePageParams(params);

    const response = await this.client.httpClient.get<QuestionnaireListResponse>(
      '/live/v3/channel/questionnaire/list',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionnaireListResponse;
  }

  /**
   * 分页查询频道问卷结果。
   */
  async listQuestionnaireByPage(
    params: ListQuestionnaireByPageParams
  ): Promise<QuestionnaireListResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validatePageParams(params);
    this.validateDateRange(params);

    const response = await this.client.httpClient.get<QuestionnaireListResponse>(
      '/live/v3/channel/questionnaire/list-answer-records',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionnaireListResponse;
  }

  /**
   * 查询频道问卷题目与结果。
   */
  async getQuestionnaireDetail(
    params: GetQuestionnaireDetailParams
  ): Promise<QuestionnaireDetailResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validateRequiredString(params.questionnaireId, 'questionnaireId');

    const response = await this.client.httpClient.get<QuestionnaireDetailResponse>(
      '/live/v3/channel/questionnaire/detail',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionnaireDetailResponse;
  }

  /**
   * 查询频道问卷结果。
   */
  async getQuestionnaireResult(
    params: GetQuestionnaireResultParams
  ): Promise<QuestionnaireResultResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validateDateRange(params);

    const response = await this.client.httpClient.get<QuestionnaireResultResponse>(
      '/live/v3/channel/questionnaire/answer-records',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionnaireResultResponse;
  }

  // ============================================
  // 答题卡 (Question) APIs
  // ============================================

  /**
   * 查询频道答题卡列表。
   */
  async listQuestion(params: ListQuestionParams): Promise<QuestionListResponse> {
    this.validateRequiredChannelId(params.channelId);

    const response = await this.client.httpClient.get<QuestionListResponse>(
      '/live/v3/channel/interact/question/list-question',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionListResponse;
  }

  /**
   * 查询频道答题卡发送时间列表。
   */
  async listQuestionSendTime(params: ListQuestionSendTimeParams): Promise<QuestionListResponse> {
    this.validateRequiredChannelId(params.channelId);

    const response = await this.client.httpClient.get<QuestionListResponse>(
      '/live/v3/channel/interact/question/list-send-time',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionListResponse;
  }

  /**
   * 新增或修改频道答题卡。
   */
  async addEditQuestion(params: AddEditQuestionParams): Promise<QuestionListResponse> {
    this.validateQuestionPayload(params);

    const response = await this.client.httpClient.post<QuestionListResponse>(
      '/live/v3/channel/interact/question/add-edit-question',
      null,
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionListResponse;
  }

  /**
   * 删除频道答题卡。
   */
  async deleteQuestion(params: DeleteQuestionParams): Promise<QuestionListResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validateRequiredString(params.questionId, 'questionId');

    const response = await this.client.httpClient.post<QuestionListResponse>(
      '/live/v3/channel/interact/question/delete-question',
      null,
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionListResponse;
  }

  /**
   * 发送答题卡。
   */
  async sendQuestion(params: SendQuestionParams): Promise<QuestionListResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validateRequiredString(params.questionId, 'questionId');
    this.validatePositiveInteger(params.duration, 'duration');

    const response = await this.client.httpClient.post<QuestionListResponse>(
      '/live/v4/channel/question/send',
      null,
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionListResponse;
  }

  /**
   * 停止答题卡。
   */
  async stopQuestion(params: StopQuestionParams): Promise<QuestionListResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validateRequiredString(params.questionId, 'questionId');

    const response = await this.client.httpClient.post<QuestionListResponse>(
      '/live/v4/channel/question/stop',
      null,
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionListResponse;
  }

  /**
   * 发送答题卡结果。
   */
  async sendQuestionResult(params: SendQuestionResultParams): Promise<QuestionListResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validateRequiredString(params.questionId, 'questionId');

    const response = await this.client.httpClient.post<QuestionListResponse>(
      '/live/v4/channel/question/send-result',
      null,
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionListResponse;
  }

  /**
   * 查询频道答题卡结果。
   */
  async getAnswerList(params: GetAnswerListParams): Promise<AnswerListResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validateDateRange(params);

    const response = await this.client.httpClient.get<AnswerListResponse>(
      '/live/v3/channel/question/answer-records',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as AnswerListResponse;
  }

  // ============================================
  // 抽奖 (Lottery) APIs
  // ============================================

  /**
   * 查询频道抽奖记录。
   */
  async listLottery(params: ListLotteryParams): Promise<LotteryListResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validateTimeRange(params);
    this.validatePageParams(params);

    const response = await this.client.httpClient.get<LotteryListResponse>(
      '/live/v3/channel/lottery/list-lottery',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as LotteryListResponse;
  }

  /**
   * 查询多个频道抽奖记录。
   */
  async listChannelsLottery(params: ListChannelsLotteryParams): Promise<LotteryListResponse> {
    this.validateRequiredChannelIds(params.channelIds);
    this.validateTimeRange(params);
    this.validatePageParams(params);

    const query = {
      ...params,
      channelIds: Array.isArray(params.channelIds)
        ? params.channelIds.join(',')
        : params.channelIds,
    };

    const response = await this.client.httpClient.get<LotteryListResponse>(
      '/live/v3/channel/lottery/list-channels-lottery',
      { params: this.compactParams(query as unknown as Params) }
    );
    return response as unknown as LotteryListResponse;
  }

  /**
   * 查询频道中奖记录。
   */
  async getWinnerDetail(params: GetWinnerDetailParams): Promise<WinnerDetailResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validateRequiredString(params.lotteryId, 'lotteryId');
    this.validatePageParams(params);

    const response = await this.client.httpClient.get<WinnerDetailResponse>(
      '/live/v3/channel/lottery/get-winner-detail',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as WinnerDetailResponse;
  }

  /**
   * 下载频道中奖记录。
   */
  async downloadWinnerDetail(
    params: DownloadWinnerDetailParams
  ): Promise<DownloadWinnerDetailResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validateRequiredString(params.lotteryId, 'lotteryId');

    const response = await this.client.httpClient.get<DownloadWinnerDetailResponse>(
      '/live/v3/channel/lottery/download-winner-detail',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as DownloadWinnerDetailResponse;
  }

  /**
   * 提交中奖信息。
   */
  async addReceiveInfo(params: AddReceiveInfoParams): Promise<AddReceiveInfoResponse> {
    return this.addReceiveInfoV4(params);
  }

  /**
   * 提交中奖信息。
   */
  async addReceiveInfoV4(params: AddReceiveInfoV4Params): Promise<AddReceiveInfoResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validateRequiredString(params.lotteryId, 'lotteryId');
    this.validateRequiredString(params.winnerCode, 'winnerCode');
    this.validateRequiredString(params.viewerId, 'viewerId');

    const response = await this.client.httpClient.post<AddReceiveInfoResponse>(
      '/live/v4/channel/lottery/add-receive-info',
      null,
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as AddReceiveInfoResponse;
  }

  // ============================================
  // 其他互动 APIs
  // ============================================

  /**
   * 发送点赞。
   */
  async sendFavor(params: SendFavorParams): Promise<SendFavorResponse> {
    const channelId = this.channelPathSegment(params.channelId);
    this.validateRequiredString(params.viewerId, 'viewerId');
    this.validatePositiveInteger(params.times, 'times');
    if (params.times !== undefined && params.times > 30) {
      throw new PolyVValidationError('times must be less than or equal to 30');
    }

    const { channelId: _channelId, ...query } = params;
    void _channelId;

    const response = await this.client.httpClient.post<SendFavorResponse>(
      `/live/v2/channels/${channelId}/like`,
      null,
      { params: this.compactParams(query as unknown as Params) }
    );
    return response as unknown as SendFavorResponse;
  }

  /**
   * 发送打赏消息。
   */
  async sendRewardMsg(params: SendRewardMsgParams): Promise<SendRewardMsgResponse> {
    this.validateRequiredChannelId(params.channelId);
    this.validateRequiredString(params.nickname, 'nickname');
    this.validateRequiredString(params.avatar, 'avatar');
    this.validateRequiredString(params.viewerId, 'viewerId');
    this.validateRequiredString(params.donateType, 'donateType');
    this.validateRequiredString(params.content, 'content');

    const response = await this.client.httpClient.post<SendRewardMsgResponse>(
      '/live/v3/channel/chat/send-reward-msg',
      null,
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as SendRewardMsgResponse;
  }

  /**
   * 查询频道提问记录。
   */
  async getQuestionList(
    channelId: string,
    params?: GetQuestionListParams
  ): Promise<GetQuestionListResponse> {
    const encodedChannelId = this.channelPathSegment(channelId);
    if (params) {
      this.validateNonNegativeInteger(params.begin, 'begin');
      if (params.end !== undefined && (!Number.isInteger(params.end) || params.end < -1)) {
        throw new PolyVValidationError('end must be -1 or a non-negative integer');
      }
    }

    const response = await this.client.httpClient.get<GetQuestionListResponse>(
      `/live/v2/chat/${encodedChannelId}/getQuestion`,
      { params: this.compactParams(params as unknown as Params | undefined) }
    );
    return response as unknown as GetQuestionListResponse;
  }

  /**
   * 查询学员提问客户回调地址。
   */
  async getStudentQuestionWebhook(
    params?: GetStudentQuestionWebhookParams
  ): Promise<StudentQuestionWebhookResponse> {
    const response = await this.client.httpClient.get<StudentQuestionWebhookResponse>(
      '/live/v5/chat/redirect/channel/student-question-webhook/get',
      { params: this.compactParams(params as unknown as Params | undefined) }
    );
    return response as unknown as StudentQuestionWebhookResponse;
  }

  /**
   * 配置学员提问客户回调地址。
   */
  async setStudentQuestionWebhook(
    params: SetStudentQuestionWebhookParams
  ): Promise<StudentQuestionWebhookMutationResponse> {
    this.validateRequiredString(params.roomId, 'roomId');
    this.validateRequiredString(params.callbackUrl, 'callbackUrl');
    this.validateHttpUrl(params.callbackUrl, 'callbackUrl');

    const response = await this.client.httpClient.post<StudentQuestionWebhookMutationResponse>(
      '/live/v5/chat/redirect/channel/student-question-webhook/post',
      params
    );
    return response as unknown as StudentQuestionWebhookMutationResponse;
  }

  /**
   * 删除学员提问客户回调地址。
   */
  async deleteStudentQuestionWebhook(
    params: DeleteStudentQuestionWebhookParams
  ): Promise<StudentQuestionWebhookMutationResponse> {
    this.validateRequiredString(params.roomId, 'roomId');

    const response = await this.client.httpClient.post<StudentQuestionWebhookMutationResponse>(
      '/live/v5/chat/redirect/channel/student-question-webhook/delete',
      params
    );
    return response as unknown as StudentQuestionWebhookMutationResponse;
  }

  /**
   * 讲师通过 HTTP 回复学员提问。
   */
  async sendTeacherAnswer(params: TeacherAnswerParams): Promise<TeacherAnswerResponse> {
    this.validateRequiredString(params.roomId, 'roomId');
    this.validateRequiredString(params.content, 'content');
    this.validateRequiredString(params.viewerUserId, 'viewerUserId');

    const response = await this.client.httpClient.post<TeacherAnswerResponse>(
      '/live/v5/chat/redirect/channel/teacher-answer/post',
      params
    );
    return response as unknown as TeacherAnswerResponse;
  }
}
