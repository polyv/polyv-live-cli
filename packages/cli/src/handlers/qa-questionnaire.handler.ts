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
  QuestionnaireCreateOptions,
  QuestionnaireListOptions,
  QuestionnaireDetailOptions,
} from '../types/qa';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';

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

  // ===== Private Validation Methods =====

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

  // ===== Private Helper Methods =====

  /**
   * Truncate string to specified length
   */
  private truncate(str: string | undefined, maxLength: number): string {
    if (!str) return '-';
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }
}
