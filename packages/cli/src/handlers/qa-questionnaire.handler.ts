/**
 * @fileoverview Handler for QA and questionnaire CLI commands
 * @author Development Team
 * @since 11.4.0
 */

import { BaseHandler } from './base.handler';
import { QaQuestionnaireServiceSdk } from '../services/qa-questionnaire-service';
import {
  QaQuestionnaireServiceConfig,
  QaSendOptions,
  QaListOptions,
  QaStopOptions,
  QaSendTimesOptions,
  QaAnswerListOptions,
  QaQuestionListOptions,
  QaAddEditOptions,
  QaDeleteQuestionOptions,
  QaSendResultOptions,
  QuestionnaireCreateOptions,
  QuestionnaireListOptions,
  QuestionnaireLegacyListOptions,
  QuestionnaireDetailOptions,
  QuestionnaireResultOptions,
  QuestionnaireBatchCreateOptions,
} from '../types/qa';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { confirmWrite } from '../utils/api-command';

/**
 * Handler for QA and questionnaire-related CLI commands
 */
export class QaQuestionnaireHandler extends BaseHandler {
  private readonly service: QaQuestionnaireServiceSdk;

  /**
   * Creates a new QaQuestionnaireHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: QaQuestionnaireServiceConfig) {
    super();
    this.service = new QaQuestionnaireServiceSdk(authConfig, serviceConfig);
  }

  // ========================================
  // qa send (AC #1)
  // ========================================

  /**
   * Send a QA question card
   * @param options QA send options from CLI
   * @returns Promise that resolves when QA is sent
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async sendQa(options: QaSendOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateSendOptions(options);

      // Call SDK service
      const result = await this.service.sendQa({
        channelId: parseInt(options.channelId, 10),
        questionId: options.questionId,
        duration: options.duration,
      });

      // Display results
      this.displaySendResult(result, options);
    }, 'qa.send');
  }

  // ========================================
  // qa list (AC #2)
  // ========================================

  /**
   * List QA question cards
   * @param options QA list options from CLI
   * @returns Promise that resolves when questions are listed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async listQa(options: QaListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateListOptions(options);

      // Call SDK service
      const result = await this.service.listQa({
        channelId: options.channelId,
      });

      // Display results
      this.displayListResult(result, options);
    }, 'qa.list');
  }

  // ========================================
  // qa stop (AC #3)
  // ========================================

  /**
   * Stop a QA question card
   * @param options QA stop options from CLI
   * @returns Promise that resolves when QA is stopped
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async stopQa(options: QaStopOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateStopOptions(options);

      // Call SDK service
      const result = await this.service.stopQa({
        channelId: parseInt(options.channelId, 10),
        questionId: options.questionId,
      });

      // Display results
      this.displayStopResult(result, options);
    }, 'qa.stop');
  }

  async listQuestionSendTime(options: QaSendTimesOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);

      const result = await this.service.listQuestionSendTime({
        channelId: options.channelId,
      });

      this.displayGenericResult(result, options.output);
    }, 'qa.send-times');
  }

  async getAnswerList(options: QaAnswerListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      this.validateDateRangeOptions(options);

      const params: any = {
        channelId: options.channelId,
      };
      if (options.sessionId !== undefined) params.sessionId = options.sessionId;
      if (options.startDate !== undefined) params.startDate = options.startDate;
      if (options.endDate !== undefined) params.endDate = options.endDate;

      const result = await this.service.getAnswerList(params);

      this.displayGenericResult(result, options.output);
    }, 'qa.answers');
  }

  async getQuestionList(options: QaQuestionListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      this.validateOptionalPositiveInteger('begin', options.begin);
      this.validateOptionalPositiveInteger('end', options.end);

      const params: any = {
        channelId: options.channelId,
      };
      if (options.begin !== undefined) params.begin = options.begin;
      if (options.end !== undefined) params.end = options.end;

      const result = await this.service.getQuestionList(params);

      this.displayGenericResult(result, options.output);
    }, 'qa.question-list');
  }

  async addEditQuestion(options: QaAddEditOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'questionId', 'type', 'answer', 'name', 'itemType']);
      if (!Number.isInteger(options.itemType) || options.itemType < 0) {
        throw new PolyVValidationError(
          'itemType must be a non-negative integer',
          'itemType',
          options.itemType,
          'validation_failed'
        );
      }

      await confirmWrite(options.force, `Create or update QA question ${options.questionId}?`);
      const params: any = {
        channelId: options.channelId,
        questionId: options.questionId,
        type: options.type,
        answer: options.answer,
        name: options.name,
        itemType: options.itemType,
      };
      if (options.options !== undefined) params.options = options.options;
      if (options.tips !== undefined) params.tips = options.tips;

      const result = await this.service.addEditQuestion(params);

      this.displayGenericResult(result, options.output, 'QA question saved successfully');
    }, 'qa.add-edit');
  }

  async deleteQuestion(options: QaDeleteQuestionOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'questionId']);

      await confirmWrite(options.force, `Delete QA question ${options.questionId}?`);
      const result = await this.service.deleteQuestion({
        channelId: options.channelId,
        questionId: options.questionId,
      });

      this.displayGenericResult(result ?? { success: true }, options.output, 'QA question deleted successfully');
    }, 'qa.delete-question');
  }

  async sendQuestionResult(options: QaSendResultOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId', 'questionId']);

      await confirmWrite(options.force, `Publish QA result for question ${options.questionId}?`);
      const result = await this.service.sendQuestionResult({
        channelId: options.channelId,
        questionId: options.questionId,
      });

      this.displayGenericResult(result ?? { success: true }, options.output, 'QA result published successfully');
    }, 'qa.send-result');
  }

  // ========================================
  // questionnaire create (AC #4)
  // ========================================

  /**
   * Create a questionnaire
   * @param options Questionnaire create options from CLI
   * @returns Promise that resolves when questionnaire is created
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async createQuestionnaire(options: QuestionnaireCreateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateCreateOptions(options);

      // Get parsed questions (validation ensures it's available)
      const parsedQuestions = (options as any)._parsedQuestions || options.questions;

      // Call SDK service
      const result = await this.service.createQuestionnaire({
        channelId: options.channelId,
        title: options.title,
        questions: parsedQuestions,
        customQuestionnaireId: options.customQuestionnaireId,
        autoPublishTime: options.autoPublishTime,
        autoEndTime: options.autoEndTime,
        privacyEnabled: options.privacyEnabled,
        privacyContent: options.privacyContent,
      });

      // Display results
      this.displayCreateResult(result, options, parsedQuestions.length);
    }, 'questionnaire.create');
  }

  // ========================================
  // questionnaire list (AC #5)
  // ========================================

  /**
   * List questionnaires
   * @param options Questionnaire list options from CLI
   * @returns Promise that resolves when questionnaires are listed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async listQuestionnaires(options: QuestionnaireListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateListQuestionnairesOptions(options);

      // Call SDK service
      const result = await this.service.listQuestionnaires({
        channelId: options.channelId,
        page: options.page,
        pageSize: options.size,
        sessionId: options.sessionId,
        startDate: options.startDate,
        endDate: options.endDate,
      });

      // Display results
      this.displayListQuestionnairesResult(result, options);
    }, 'questionnaire.list');
  }

  async listQuestionnaire(options: QuestionnaireLegacyListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      this.validateOptionalPositiveInteger('page', options.page);
      this.validateOptionalPositiveInteger('size', options.size);

      const params: any = {
        channelId: options.channelId,
      };
      if (options.startTime !== undefined) params.startTime = options.startTime;
      if (options.endTime !== undefined) params.endTime = options.endTime;
      if (options.page !== undefined) params.page = options.page;
      if (options.size !== undefined) params.pageSize = options.size;

      const result = await this.service.listQuestionnaire(params);

      this.displayGenericResult(result, options.output);
    }, 'questionnaire.legacy-list');
  }

  // ========================================
  // questionnaire detail (AC #6)
  // ========================================

  /**
   * Get questionnaire detail
   * @param options Questionnaire detail options from CLI
   * @returns Promise that resolves when detail is displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getQuestionnaireDetail(options: QuestionnaireDetailOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateDetailOptions(options);

      // Call SDK service
      const result = await this.service.getQuestionnaireDetail({
        channelId: options.channelId,
        questionnaireId: options.questionnaireId,
      });

      // Display results
      this.displayDetailResult(result, options);
    }, 'questionnaire.detail');
  }

  async getQuestionnaireResult(options: QuestionnaireResultOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['channelId']);
      this.validateDateRangeOptions(options);

      const params: any = {
        channelId: options.channelId,
      };
      if (options.questionnaireId !== undefined) params.questionnaireId = options.questionnaireId;
      if (options.sessionId !== undefined) params.sessionId = options.sessionId;
      if (options.startDate !== undefined) params.startDate = options.startDate;
      if (options.endDate !== undefined) params.endDate = options.endDate;

      const result = await this.service.getQuestionnaireResult(params);

      this.displayGenericResult(result, options.output);
    }, 'questionnaire.results');
  }

  async batchCreateQuestionnaire(options: QuestionnaireBatchCreateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredOptions(options, ['questionnaires']);
      const questionnaires = this.parseQuestionnaires(options.questionnaires);

      await confirmWrite(options.force, `Batch create ${questionnaires.length} questionnaire(s)?`);
      const result = await this.service.batchCreateQuestionnaire({
        questionnaires,
      });

      this.displayGenericResult(result, options.output, 'Questionnaires created successfully');
    }, 'questionnaire.batch-create');
  }

  // ===== Private Validation Methods =====

  private validateRequiredOptions(options: Record<string, any>, fields: string[]): void {
    const missing = fields.filter((field) => {
      const value = options[field];
      return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
    });

    if (missing.length > 0) {
      throw new PolyVValidationError(
        `Missing required options: ${missing.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      throw new PolyVValidationError(
        'output must be either "table" or "json"',
        'output',
        options.output,
        'validation_failed'
      );
    }
  }

  private validateDateRangeOptions(options: { startDate?: string; endDate?: string }): void {
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (options.startDate && !dateFormatRegex.test(options.startDate)) {
      throw new PolyVValidationError(
        'Invalid startDate format. Use yyyy-MM-dd',
        'startDate',
        options.startDate,
        'validation_failed'
      );
    }
    if (options.endDate && !dateFormatRegex.test(options.endDate)) {
      throw new PolyVValidationError(
        'Invalid endDate format. Use yyyy-MM-dd',
        'endDate',
        options.endDate,
        'validation_failed'
      );
    }
  }

  private validateOptionalPositiveInteger(field: string, value: number | undefined): void {
    if (value === undefined) return;
    if (!Number.isInteger(value) || value < 1) {
      throw new PolyVValidationError(
        `${field} must be a positive integer`,
        field,
        value,
        'validation_failed'
      );
    }
  }

  private parseQuestionnaires(value: string | Record<string, unknown>[]): Record<string, unknown>[] {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new PolyVValidationError(
        'questionnaires must be a non-empty JSON array',
        'questionnaires',
        value,
        'validation_failed'
      );
    }
    return parsed as Record<string, unknown>[];
  }

  private validateSendOptions(options: QaSendOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (!options.questionId || options.questionId.trim() === '') {
      errors.push('questionId is required');
    }

    if (options.duration !== undefined) {
      if (typeof options.duration !== 'number' || options.duration < 1 || options.duration > 99) {
        errors.push('duration must be between 1 and 99');
      }
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `QA send options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateListOptions(options: QaListOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `QA list options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateStopOptions(options: QaStopOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (!options.questionId || options.questionId.trim() === '') {
      errors.push('questionId is required');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `QA stop options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateCreateOptions(options: QuestionnaireCreateOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (!options.title || options.title.trim() === '') {
      errors.push('title is required');
    }

    // Parse questions if it's a JSON string
    let parsedQuestions: any[] | null = null;
    if (typeof options.questions === 'string') {
      if (options.questions.trim() === '') {
        // Empty string is treated as missing
        parsedQuestions = null;
      } else {
        try {
          parsedQuestions = JSON.parse(options.questions);
        } catch {
          throw new PolyVValidationError(
            'Invalid JSON format for questions',
            'questions',
            options.questions,
            'invalid_json'
          );
        }
      }
    } else if (Array.isArray(options.questions)) {
      parsedQuestions = options.questions;
    }

    if (parsedQuestions === null) {
      errors.push('questions is required');
    } else if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
      parsedQuestions.forEach((q, idx) => {
        if (!q.name || q.name.trim() === '') {
          errors.push(`questions[${idx}].name is required`);
        }
        if (!q.type) {
          errors.push(`questions[${idx}].type is required`);
        }
        // Validate options for choice questions
        if ((q.type === 'R' || q.type === 'C') && (!q.options || q.options.length === 0)) {
          errors.push(`questions[${idx}].options is required for choice questions`);
        }
      });
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Questionnaire create options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }

    // Update options with parsed questions for use by createQuestionnaire
    (options as any)._parsedQuestions = parsedQuestions || [];
  }

  private validateListQuestionnairesOptions(options: QuestionnaireListOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (options.page !== undefined) {
      if (typeof options.page !== 'number' || !Number.isInteger(options.page) || options.page < 1) {
        errors.push('page must be a positive integer');
      }
    }

    if (options.size !== undefined) {
      if (typeof options.size !== 'number' || !Number.isInteger(options.size) || options.size < 1) {
        errors.push('size must be a positive integer');
      }
    }

    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (options.startDate && !dateFormatRegex.test(options.startDate)) {
      errors.push('Invalid startDate format. Use yyyy-MM-dd');
    }
    if (options.endDate && !dateFormatRegex.test(options.endDate)) {
      errors.push('Invalid endDate format. Use yyyy-MM-dd');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Questionnaire list options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateDetailOptions(options: QuestionnaireDetailOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (!options.questionnaireId || options.questionnaireId.trim() === '') {
      errors.push('questionnaireId is required');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Questionnaire detail options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  // ===== Private Display Methods =====

  private displaySendResult(result: any, options: QaSendOptions): void {
    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        questionId: options.questionId,
        duration: options.duration,
        result
      }, 'json');
    } else {
      console.log(`QA sent successfully`);
      console.log(`Channel ID: ${options.channelId}`);
      console.log(`Question ID: ${options.questionId}`);
      if (options.duration) {
        console.log(`Duration: ${options.duration} seconds`);
      }
    }
  }

  private displayListResult(result: any, options: QaListOptions): void {
    const questions = result?.data?.questions || result?.data?.contents || result?.questions || [];

    if (questions.length === 0) {
      this.displayInfo(`No QA found`);
      return;
    }

    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        count: questions.length,
        data: questions
      }, 'json');
    } else {
      const tableData = questions.map((item: any) => ({
        'Question ID': this.truncate(item.questionId, 10),
        'Name': this.truncate(item.name, 30),
        'Type': item.type || '-',
        'Status': item.status || '-',
        'Times': item.times || 0,
      }));

      console.log(`Found ${questions.length} QA questions`);
      this.displayAsTable(tableData);
    }
  }

  private displayStopResult(result: any, options: QaStopOptions): void {
    const data = result?.data || result;

    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        questionId: options.questionId,
        result: data
      }, 'json');
    } else {
      console.log(`QA stopped successfully`);
      console.log(`Channel ID: ${options.channelId}`);
      console.log(`Question ID: ${options.questionId}`);

      // Display statistics if available
      if (data) {
        console.log('\n--- Answer Statistics ---');
        if (data.answer) {
          console.log(`Correct Answer: ${data.answer}`);
        }
        if (data.total !== undefined) {
          console.log(`Total Respondents: ${data.total}`);
        }
        if (data.rightUserCount !== undefined) {
          console.log(`Correct: ${data.rightUserCount}`);
        }
        if (data.faultUserCount !== undefined) {
          console.log(`Incorrect: ${data.faultUserCount}`);
        }
        if (data.singleResult && Array.isArray(data.singleResult)) {
          console.log('\nOption Distribution:');
          data.singleResult.forEach((count: number, idx: number) => {
            console.log(`  Option ${idx + 1}: ${count}`);
          });
        }
      }
    }
  }

  private displayCreateResult(result: any, options: QuestionnaireCreateOptions, questionsCount: number): void {
    const questionnaireId = result?.data?.questionnaireId || result?.questionnaireId || 'N/A';

    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        questionnaireId,
        title: options.title,
        questionsCount,
        result
      }, 'json');
    } else {
      console.log(`Questionnaire created successfully`);
      console.log(`Channel ID: ${options.channelId}`);
      console.log(`Questionnaire ID: ${questionnaireId}`);
      console.log(`Title: ${options.title}`);
      console.log(`Questions: ${questionsCount}`);
    }
  }

  private displayListQuestionnairesResult(result: any, options: QuestionnaireListOptions): void {
    const contents = result?.data?.contents || result?.contents || [];
    const count = result?.data?.totalItems || contents.length;

    if (contents.length === 0) {
      this.displayInfo(`No questionnaires found for channel ${options.channelId}`);
      return;
    }

    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        count,
        data: contents
      }, 'json');
    } else {
      const tableData = contents.map((item: any) => ({
        'Questionnaire ID': this.truncate(item.questionnaireId, 10),
        'Title': this.truncate(item.title || item.questionnaireTitle, 30),
        'Last Modified': item.lastModified ? new Date(item.lastModified).toLocaleString() : '-',
        'Users': item.users?.length || 0,
      }));

      console.log(`Found ${count} questionnaires`);
      this.displayAsTable(tableData);
    }
  }

  private displayDetailResult(result: any, options: QuestionnaireDetailOptions): void {
    const data = result?.data || result;

    if (!data) {
      this.displayInfo(`No questionnaire detail found for ID ${options.questionnaireId}`);
      return;
    }

    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        questionnaireId: options.questionnaireId,
        data
      }, 'json');
    } else {
      console.log(`Questionnaire Detail`);
      console.log(`Channel ID: ${options.channelId}`);
      console.log(`Questionnaire ID: ${data.questionnaireId || options.questionnaireId}`);
      console.log(`Name: ${data.name || '-'}`);
      console.log(`Status: ${data.status || '-'}`);

      const questions = data.questions || [];
      if (questions.length > 0) {
        console.log(`\n--- Questions (${questions.length}) ---`);
        const tableData = questions.map((q: any) => ({
          'Question ID': this.truncate(q.questionId, 10),
          'Name': this.truncate(q.name, 30),
          'Type': q.type || '-',
          'Required': q.required === 'Y' ? 'Yes' : 'No',
          'Score Enabled': q.scoreEnabled === 'Y' ? 'Yes' : 'No',
        }));
        this.displayAsTable(tableData);
      }
    }
  }

  private displayGenericResult(result: any, format?: 'table' | 'json', successMessage?: string): void {
    if (successMessage && format !== 'json') {
      this.displaySuccess(successMessage);
    }
    this.displayData(result ?? { success: true }, format || 'table');
  }

  // ===== Private Helper Methods =====

  /**
   * Truncate string to specified length
   */
  private truncate(str: string | undefined, maxLength: number): string {
    if (!str) return '-';
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }
}
