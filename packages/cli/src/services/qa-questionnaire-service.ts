/**
 * @fileoverview SDK wrapper for QA and questionnaire operations
 * @author Development Team
 * @since 11.4.0
 */

import { PolyVClient } from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import { PolyVError } from '../utils/errors';
import {
  QaQuestionnaireServiceConfig,
  SendQaParams,
  ListQaParams,
  StopQaParams,
  CreateQuestionnaireParams,
  ListQuestionnairesParams,
  GetQuestionnaireDetailParams,
} from '../types/qa';

/**
 * SDK wrapper for QA and questionnaire operations
 * Encapsulates LiveInteractionService QA and questionnaire methods
 */
export class QaQuestionnaireServiceSdk {
  private readonly client: PolyVClient;
  private readonly liveInteraction: any;

  /**
   * Creates a new QaQuestionnaireServiceSdk instance
   * @param authConfig Authentication configuration
   * @param _serviceConfig Service configuration (currently unused but required for consistency)
   */
  constructor(authConfig: AuthConfig, _serviceConfig?: QaQuestionnaireServiceConfig) {
    this.client = new PolyVClient(authConfig);
    this.liveInteraction = this.client.liveInteraction;
  }

  // ============================================
  // QA (答题卡) Operations
  // ============================================

  /**
   * Send a QA question card
   * @param params Send parameters
   * @returns API response
   */
  async sendQa(params: SendQaParams): Promise<any> {
    try {
      const result = await this.liveInteraction.sendQuestion({
        channelId: params.channelId,
        questionId: params.questionId,
        duration: params.duration,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'sendQa');
    }
  }

  /**
   * List QA question cards
   * @param params List parameters
   * @returns API response with question list
   */
  async listQa(params: ListQaParams): Promise<any> {
    try {
      const result = await this.liveInteraction.listQuestion({
        channelId: params.channelId,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'listQa');
    }
  }

  /**
   * Stop a QA question card
   * @param params Stop parameters
   * @returns API response with statistics
   */
  async stopQa(params: StopQaParams): Promise<any> {
    try {
      const result = await this.liveInteraction.stopQuestion({
        channelId: params.channelId,
        questionId: params.questionId,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'stopQa');
    }
  }

  // ============================================
  // Questionnaire (问卷) Operations
  // ============================================

  /**
   * Create a questionnaire (V4 API)
   * @param params Create parameters
   * @returns API response with questionnaire details
   */
  async createQuestionnaire(params: CreateQuestionnaireParams): Promise<any> {
    try {
      const result = await this.liveInteraction.createQuestionnaire({
        channelId: params.channelId,
        questionnaireTitle: params.title,
        customQuestionnaireId: params.customQuestionnaireId,
        autoPublishTime: params.autoPublishTime,
        autoEndTime: params.autoEndTime,
        privacyEnabled: params.privacyEnabled,
        privacyContent: params.privacyContent,
        questions: params.questions.map(q => this.toSdkQuestionnaireQuestion(q)),
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'createQuestionnaire');
    }
  }

  private toSdkQuestionnaireQuestion(
    question: CreateQuestionnaireParams['questions'][number]
  ): Record<string, unknown> {
    const sdkQuestion: Record<string, unknown> = {
      name: question.name,
      type: question.type,
      options: question.options,
      answer: question.answer,
      scoreEnabled: question.scoreEnabled,
      score: question.score,
      required: question.required,
    };

    if (question.options && question.options.length > 0) {
      sdkQuestion.optionList = question.options.map((name, index) => ({
        id: String(index + 1),
        name,
      }));

      question.options.slice(0, 10).forEach((option, index) => {
        sdkQuestion[`option${index + 1}`] = option;
      });
    }

    return sdkQuestion;
  }

  /**
   * List questionnaires with pagination
   * @param params List parameters
   * @returns API response with questionnaire list
   */
  async listQuestionnaires(params: ListQuestionnairesParams): Promise<any> {
    try {
      const result = await this.liveInteraction.listQuestionnaireByPage({
        channelId: params.channelId,
        page: params.page,
        pageSize: params.pageSize,
        sessionId: params.sessionId,
        startDate: params.startDate,
        endDate: params.endDate,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'listQuestionnaires');
    }
  }

  /**
   * Get questionnaire detail
   * @param params Detail parameters
   * @returns API response with questionnaire details
   */
  async getQuestionnaireDetail(params: GetQuestionnaireDetailParams): Promise<any> {
    try {
      const result = await this.liveInteraction.getQuestionnaireDetail({
        channelId: params.channelId,
        questionnaireId: params.questionnaireId,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'getQuestionnaireDetail');
    }
  }

  // ============================================
  // Error Handling
  // ============================================

  /**
   * Wrap SDK errors with PolyVError for consistent error handling
   */
  private wrapError(error: unknown, operation: string): PolyVError {
    if (error instanceof PolyVError) {
      return error;
    }
    const message = error instanceof Error ? error.message : String(error);
    return new PolyVError(
      `${operation} failed: ${message}`,
      'QA_QUESTIONNAIRE_API_ERROR',
      1,
      { originalError: error }
    );
  }
}
