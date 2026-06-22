/**
 * LiveInteraction Service
 *
 * 直播互动功能服务 (抽奖、问卷、签到、答题卡、点赞、打赏)
 *
 * @module services/live-interaction.service
 */

import type { PolyVClient } from '../client.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';
import type {
  // Checkin
  GetCheckinListParams,
  GetCheckinByCheckinIdParams,
  GetCheckinBySessionIdParams,
  GetCheckinByTimeParams,
  CheckinListResponse,
  CheckinRecordResponse,
  // Questionnaire
  CreateQuestionnaireParams,
  BatchCreateQuestionnaireParams,
  BatchCreateQuestionnaireBody,
  AddEditQuestionnaireParams,
  AddEditQuestionnaireBody,
  ListQuestionnaireParams,
  ListQuestionnaireByPageParams,
  GetQuestionnaireDetailParams,
  GetQuestionnaireResultParams,
  QuestionnaireListResponse,
  QuestionnaireDetailResponse,
  QuestionnaireResultResponse,
  // Question
  ListQuestionParams,
  ListQuestionSendTimeParams,
  AddEditQuestionParams,
  DeleteQuestionParams,
  SendQuestionParams,
  StopQuestionParams,
  SendQuestionResultParams,
  GetAnswerListParams,
  QuestionListResponse,
  AnswerListResponse,
  // Lottery
  ListLotteryParams,
  ListChannelsLotteryParams,
  GetWinnerDetailParams,
  DownloadWinnerDetailParams,
  AddReceiveInfoParams,
  AddReceiveInfoV4Params,
  LotteryListResponse,
  WinnerDetailResponse,
  AddReceiveInfoResponse,
  // Other
  SendFavorParams,
  SendFavorResponse,
  SendRewardMsgParams,
  SendRewardMsgResponse,
  GetQuestionListParams,
  QuestionListResponse2,
} from '../types/live-interaction.js';

type Params = Record<string, unknown>;

/**
 * LiveInteractionService
 *
 * 提供直播互动功能API，包括：
 * - 签到管理
 * - 问卷管理
 * - 答题卡管理
 * - 抽奖管理
 * - 点赞、打赏等互动功能
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

  private validatePageParams(params: { page?: number; pageSize?: number; limit?: number }): void {
    this.validatePositiveInteger(params.page, 'page');
    this.validatePositiveInteger(params.pageSize, 'pageSize');
    this.validatePositiveInteger(params.limit, 'limit');
  }

  private validateTimeRange(params: { startTime?: number; endTime?: number }): void {
    this.validateRequiredNumber(params.startTime, 'startTime');
    this.validateRequiredNumber(params.endTime, 'endTime');
  }

  private validateQuestionnairePayload(params: CreateQuestionnaireParams): void {
    this.validateRequiredChannelId(params.channelId);
    this.validateRequiredString(params.questionnaireTitle, 'questionnaireTitle');
    if (!Array.isArray(params.questions) || params.questions.length === 0) {
      throw new PolyVValidationError('questions is required');
    }
  }

  private splitQuestionnairePayload(params: CreateQuestionnaireParams): {
    query: { channelId: CreateQuestionnaireParams['channelId'] };
    body: Omit<CreateQuestionnaireParams, 'channelId'>;
  } {
    const { channelId, ...body } = params;
    return { query: { channelId }, body };
  }

  // ============================================
  // 签到 (Checkin) APIs
  // ============================================

  /**
   * 查询频道签到记录（仅返回已签到记录）
   *
   * @param params - Query parameters
   * @returns Paginated checkin list
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.getCheckinList({
   *   channelId: '2191569',
   *   date: '2024-01-01',
   *   page: 1,
   *   pageSize: 20,
   * });
   * ```
   */
  async getCheckinList(params: GetCheckinListParams): Promise<CheckinListResponse> {
    this.validateRequiredChannelId(params.channelId);
    const response = await this.client.httpClient.get<CheckinListResponse>(
      '/live/v3/channel/checkin/list',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as CheckinListResponse;
  }

  /**
   * 通过签到id查询签到记录（包括已签到与未签到记录）
   *
   * @param params - Query parameters
   * @returns Checkin record data
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.getCheckinByCheckinId({
   *   channelId: '2191569',
   *   checkinId: 'checkin-001',
   * });
   * ```
   */
  async getCheckinByCheckinId(params: GetCheckinByCheckinIdParams): Promise<CheckinRecordResponse> {
    const response = await this.client.httpClient.get<CheckinRecordResponse>(
      '/live/v3/channel/chat/get-checkins',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as CheckinRecordResponse;
  }

  /**
   * 通过直播场次id查询签到发起记录
   *
   * @param params - Query parameters
   * @returns Checkin record data
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.getCheckinBySessionId({
   *   channelId: '2191569',
   *   sessionId: 'session-001',
   * });
   * ```
   */
  async getCheckinBySessionId(params: GetCheckinBySessionIdParams): Promise<CheckinRecordResponse> {
    const response = await this.client.httpClient.get<CheckinRecordResponse>(
      '/live/v3/channel/chat/checkin-by-sessionId',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as CheckinRecordResponse;
  }

  /**
   * 通过指定时间范围查询签到发起记录
   *
   * @param params - Query parameters
   * @returns Checkin record data
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.getCheckinByTime({
   *   channelId: '2191569',
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   * });
   * ```
   */
  async getCheckinByTime(params: GetCheckinByTimeParams): Promise<CheckinRecordResponse> {
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
   * 创建问卷
   *
   * @param params - Create parameters
   * @param body - Questionnaire data
   * @returns Questionnaire detail
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.createQuestionnaire({
   *   channelId: 2191569,
   * });
   * ```
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
   * 批量创建问卷（支持多频道同时创建）
   *
   * @param params - Create parameters
   * @param body - Questionnaire data with channel IDs
   * @returns Questionnaire detail
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.batchCreateQuestionnaire({}, {
   *   channelIds: [2191569, 2191570],
   *   title: '问卷调查',
   *   items: [{ type: 'R', question: '您喜欢这个直播吗?', options: ['是', '否'] }],
   * });
   * ```
   */
  async batchCreateQuestionnaire(
    params: BatchCreateQuestionnaireParams,
    body?: BatchCreateQuestionnaireBody
  ): Promise<QuestionnaireDetailResponse> {
    const response = await this.client.httpClient.post<QuestionnaireDetailResponse>(
      '/live/v4/channel/questionnaire/create-batch',
      body ?? params
    );
    return response as unknown as QuestionnaireDetailResponse;
  }

  /**
   * 编辑或添加问卷信息
   *
   * @param params - Query parameters
   * @param body - Questionnaire data
   * @returns Questionnaire detail
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.addEditQuestionnaire({
   *   channelId: '2191569',
   * }, {
   *   questionnaireId: 'questionnaire-001',
   *   title: '问卷调查',
   *   items: [{ type: 'R', question: '问题', options: ['选项1', '选项2'] }],
   * });
   * ```
   */
  async addEditQuestionnaire(
    params: AddEditQuestionnaireParams,
    body: AddEditQuestionnaireBody
  ): Promise<QuestionnaireDetailResponse> {
    if (body) {
      const mappedQuestions: CreateQuestionnaireParams['questions'] = Array.isArray(body.questions)
        ? body.questions
        : body.items?.map((item) => ({
            name: item.question,
            type: item.type,
            options: item.options,
            required: item.required ? 'Y' : 'N',
          })) ?? [];
      const questionnaireTitle = typeof body.questionnaireTitle === 'string'
        ? body.questionnaireTitle
        : typeof body.title === 'string'
          ? body.title
          : '';

      return this.createQuestionnaire({
        ...body,
        channelId: params.channelId,
        questionnaireTitle,
        questions: mappedQuestions,
      });
    }

    return this.createQuestionnaire(params as CreateQuestionnaireParams);
  }

  /**
   * 获取频道的问卷列表
   *
   * @param params - Query parameters
   * @returns Questionnaire list
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.listQuestionnaire({
   *   channelId: '2191569',
   *   startTime: 1704067200000,
   *   endTime: 1704153600000,
   * });
   * ```
   */
  async listQuestionnaire(params: ListQuestionnaireParams): Promise<QuestionnaireListResponse> {
    const response = await this.client.httpClient.get<QuestionnaireListResponse>(
      '/live/v3/channel/questionnaire/list',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionnaireListResponse;
  }

  /**
   * 分页查询频道问卷结果
   *
   * @param params - Query parameters
   * @returns Questionnaire list
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.listQuestionnaireByPage({
   *   channelId: '2191569',
   *   page: 1,
   *   pageSize: 10,
   * });
   * ```
   */
  async listQuestionnaireByPage(params: ListQuestionnaireByPageParams): Promise<QuestionnaireListResponse> {
    const response = await this.client.httpClient.get<QuestionnaireListResponse>(
      '/live/v3/channel/questionnaire/list-answer-records',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionnaireListResponse;
  }

  /**
   * 查询频道问卷题目与结果
   *
   * @param params - Query parameters
   * @returns Questionnaire detail
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.getQuestionnaireDetail({
   *   channelId: '2191569',
   *   questionnaireId: 'questionnaire-001',
   * });
   * ```
   */
  async getQuestionnaireDetail(params: GetQuestionnaireDetailParams): Promise<QuestionnaireDetailResponse> {
    const response = await this.client.httpClient.get<QuestionnaireDetailResponse>(
      '/live/v3/channel/questionnaire/detail',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionnaireDetailResponse;
  }

  /**
   * 查询直播问卷的答题结果及统计
   *
   * @param params - Query parameters
   * @returns Questionnaire result
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.getQuestionnaireResult({
   *   channelId: '2191569',
   *   questionnaireId: 'questionnaire-001',
   * });
   * ```
   */
  async getQuestionnaireResult(params: GetQuestionnaireResultParams): Promise<QuestionnaireResultResponse> {
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
   * 获取频道的答题卡列表
   *
   * @param params - Query parameters
   * @returns Question list
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.listQuestion({
   *   channelId: '2191569',
   * });
   * ```
   */
  async listQuestion(params: ListQuestionParams): Promise<QuestionListResponse> {
    const response = await this.client.httpClient.get<QuestionListResponse>(
      '/live/v3/channel/interact/question/list-question',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionListResponse;
  }

  /**
   * 获取频道的答题卡发送时间列表
   *
   * @param params - Query parameters
   * @returns Question send time list
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.listQuestionSendTime({
   *   channelId: '2191569',
   * });
   * ```
   */
  async listQuestionSendTime(params: ListQuestionSendTimeParams): Promise<QuestionListResponse> {
    const response = await this.client.httpClient.get<QuestionListResponse>(
      '/live/v3/channel/interact/question/list-send-time',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionListResponse;
  }

  /**
   * 编辑或添加答题卡信息
   *
   * @param params - Query parameters
   * @returns Success response
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.addEditQuestion({
   *   channelId: '2191569',
   *   _type: 'R',
   *   answer: 'A',
   *   name: '单选题',
   *   itemType: 0,
   *   option1_option15: 'A,B,C,D',
   * });
   * ```
   */
  async addEditQuestion(params: AddEditQuestionParams): Promise<QuestionListResponse> {
    const { _type, option1_option15, tips1_tips5, ...rest } = params;
    const query: Record<string, unknown> = {
      ...rest,
      type: params.type ?? _type,
    };

    option1_option15?.split(',').forEach((option, index) => {
      query[`option${index + 1}`] = option;
    });
    tips1_tips5?.split(',').forEach((tip, index) => {
      query[`tips${index + 1}`] = tip;
    });

    const response = await this.client.httpClient.post<QuestionListResponse>(
      '/live/v3/channel/interact/question/add-edit-question',
      null,
      { params: this.compactParams(query) }
    );
    return response as unknown as QuestionListResponse;
  }

  /**
   * 删除频道答题卡信息
   *
   * @param params - Delete parameters
   * @returns Success response
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.deleteQuestion({
   *   channelId: '2191569',
   *   questionId: 'question-001',
   * });
   * ```
   */
  async deleteQuestion(params: DeleteQuestionParams): Promise<QuestionListResponse> {
    const response = await this.client.httpClient.post<QuestionListResponse>(
      '/live/v3/channel/interact/question/delete-question',
      null,
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionListResponse;
  }

  /**
   * 发送答题卡
   *
   * @param params - Send parameters
   * @returns Success response
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.sendQuestion({
   *   channelId: 2191569,
   *   questionId: 'question-001',
   *   duration: 30,
   * });
   * ```
   */
  async sendQuestion(params: SendQuestionParams): Promise<QuestionListResponse> {
    const response = await this.client.httpClient.post<QuestionListResponse>(
      '/live/v4/channel/question/send',
      null,
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionListResponse;
  }

  /**
   * 停止答题卡
   *
   * @param params - Stop parameters
   * @returns Success response
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.stopQuestion({
   *   channelId: 2191569,
   *   questionId: 'question-001',
   * });
   * ```
   */
  async stopQuestion(params: StopQuestionParams): Promise<QuestionListResponse> {
    const response = await this.client.httpClient.post<QuestionListResponse>(
      '/live/v4/channel/question/stop',
      null,
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionListResponse;
  }

  /**
   * 发送答题卡结果
   *
   * @param params - Send parameters
   * @returns Success response
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.sendQuestionResult({
   *   channelId: 2191569,
   *   questionId: 'question-001',
   * });
   * ```
   */
  async sendQuestionResult(params: SendQuestionResultParams): Promise<QuestionListResponse> {
    const response = await this.client.httpClient.post<QuestionListResponse>(
      '/live/v4/channel/question/send-result',
      null,
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as QuestionListResponse;
  }

  /**
   * 查询答题卡答题结果列表
   *
   * @param params - Query parameters
   * @returns Answer list
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.getAnswerList({
   *   channelId: '2191569',
   *   sessionId: 'session-001',
   * });
   * ```
   */
  async getAnswerList(params: GetAnswerListParams): Promise<AnswerListResponse> {
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
   * 获取一段时间内的直播频道抽奖记录列表
   *
   * @param params - Query parameters
   * @returns Lottery list
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.listLottery({
   *   channelId: '2191569',
   *   startTime: 1704067200000,
   *   endTime: 1704153600000,
   * });
   * ```
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
   * 获取一段时间内的多个直播频道发起抽奖记录列表
   *
   * @param params - Query parameters
   * @returns Lottery list
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.listChannelsLottery({
   *   channelIds: '2191569,2191570',
   *   startTime: 1704067200000,
   *   endTime: 1704153600000,
   * });
   * ```
   */
  async listChannelsLottery(params: ListChannelsLotteryParams): Promise<LotteryListResponse> {
    this.validateRequiredString(params.channelIds, 'channelIds');
    this.validateTimeRange(params);
    this.validatePageParams(params);

    const response = await this.client.httpClient.get<LotteryListResponse>(
      '/live/v3/channel/lottery/list-channels-lottery',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as LotteryListResponse;
  }

  /**
   * 通过抽奖ID获取频道的单场抽奖的中奖用户列表
   *
   * @param params - Query parameters
   * @returns Winner detail list
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.getWinnerDetail({
   *   channelId: '2191569',
   *   lotteryId: 'lottery-001',
   *   page: 1,
   *   limit: 10,
   * });
   * ```
   */
  async getWinnerDetail(params: GetWinnerDetailParams): Promise<WinnerDetailResponse> {
    const response = await this.client.httpClient.get<WinnerDetailResponse>(
      '/live/v3/channel/lottery/get-winner-detail',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as WinnerDetailResponse;
  }

  /**
   * 导出频道的单抽奖的中奖用户列表的中奖文件
   *
   * @param params - Query parameters
   * @returns File download URL or data
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.downloadWinnerDetail({
   *   channelId: '2191569',
   *   lotteryId: 'lottery-001',
   * });
   * ```
   */
  async downloadWinnerDetail(params: DownloadWinnerDetailParams): Promise<unknown> {
    const response = await this.client.httpClient.get<unknown>(
      '/live/v3/channel/lottery/download-winner-detail',
      { params: this.compactParams(params as unknown as Params) }
    );
    return response;
  }

  /**
   * 提交中奖者填写的信息
   *
   * @param params - Receive info parameters
   * @returns Success response
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.addReceiveInfo({
   *   channelId: '2191569',
   *   lotteryId: 'lottery-001',
   *   winnerCode: 'WIN001',
   *   viewerId: 'viewer-001',
   *   name: '张三',
   *   telephone: '13800138000',
   * });
   * ```
   */
  async addReceiveInfo(params: AddReceiveInfoParams): Promise<AddReceiveInfoResponse> {
    return this.addReceiveInfoV4(params);
  }

  /**
   * 提交中奖者填写的信息 (V4版本)
   *
   * @param params - Receive info parameters
   * @returns Success response
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.addReceiveInfoV4({
   *   channelId: '2191569',
   *   lotteryId: 'lottery-001',
   *   winnerCode: 'WIN001',
   *   viewerId: 'viewer-001',
   *   receiveInfo: [{ field: '姓名', value: '张三' }],
   * });
   * ```
   */
  async addReceiveInfoV4(params: AddReceiveInfoV4Params): Promise<AddReceiveInfoResponse> {
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
   * 点赞
   *
   * @param params - Favor parameters
   * @returns Like count
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.sendFavor({
   *   viewerId: 'viewer-001',
   *   times: 1,
   * });
   * ```
   */
  async sendFavor(params: SendFavorParams): Promise<SendFavorResponse> {
    const response = await this.client.httpClient.post<SendFavorResponse>(
      '/live/v2/chat/send_favor',
      null,
      { params }
    );
    return response as unknown as SendFavorResponse;
  }

  /**
   * 发送打赏消息
   *
   * @param params - Reward parameters
   * @returns Success response
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.sendRewardMsg({
   *   channelId: '2191569',
   *   nickname: '张三',
   *   avatar: 'https://example.com/avatar.png',
   *   viewerId: 'viewer-001',
   *   donateType: 'cash',
   *   content: '100',
   * });
   * ```
   */
  async sendRewardMsg(params: SendRewardMsgParams): Promise<SendRewardMsgResponse> {
    const response = await this.client.httpClient.post<SendRewardMsgResponse>(
      '/live/v3/channel/chat/send-reward-msg',
      null,
      { params: this.compactParams(params as unknown as Params) }
    );
    return response as unknown as SendRewardMsgResponse;
  }

  /**
   * 查询咨询提问记录
   *
   * @param channelId - Channel ID
   * @param params - Query parameters
   * @returns Question list
   *
   * @example
   * ```typescript
   * const result = await client.liveInteraction.getQuestionList('2191569', {
   *   begin: 0,
   *   end: 100,
   * });
   * ```
   */
  async getQuestionList(channelId: string, params?: GetQuestionListParams): Promise<QuestionListResponse2> {
    const response = await this.client.httpClient.get<QuestionListResponse2>(
      `/live/v2/chat/${encodeURIComponent(channelId)}/getQuestion`,
      { params: this.compactParams(params as unknown as Params | undefined) }
    );
    return response as unknown as QuestionListResponse2;
  }
}
