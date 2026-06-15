/**
 * @fileoverview Type definitions for QA and questionnaire commands
 * @author Development Team
 * @since 11.4.0
 */

import { OutputFormat } from '../handlers/base.handler';

// ============================================
// QA (答题卡) Types
// ============================================

/**
 * Options for sending a QA question card
 */
export interface QaSendOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Question ID (required) */
  questionId: string;
  /** Duration in seconds (1-99) */
  duration?: number;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for listing QA question cards
 */
export interface QaListOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for stopping a QA question card
 */
export interface QaStopOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Question ID (required) */
  questionId: string;
  /** Output format (table or json) */
  output?: OutputFormat;
}

// ============================================
// Questionnaire (问卷) Types
// ============================================

/**
 * Question item for questionnaire
 */
export interface QuestionnaireQuestionItem {
  /** Question name/title */
  name: string;
  /** Question type: R=single choice, C=multiple choice, Q=text, J=true/false, X=rating */
  type: 'R' | 'C' | 'Q' | 'J' | 'X';
  /** Options array (required for choice questions) */
  options?: string[];
  /** Answer (required for scored questions) */
  answer?: string;
  /** Enable scoring (Y/N) */
  scoreEnabled?: 'Y' | 'N';
  /** Score value */
  score?: number;
  /** Required question (Y/N) */
  required?: 'Y' | 'N';
}

/**
 * Options for creating a questionnaire
 */
export interface QuestionnaireCreateOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Questionnaire title (required) */
  title: string;
  /** Questions array (can be JSON string or parsed array) */
  questions: string | QuestionnaireQuestionItem[];
  /** Custom questionnaire ID */
  customQuestionnaireId?: string;
  /** Auto publish time (timestamp) */
  autoPublishTime?: number;
  /** Auto end time (timestamp) */
  autoEndTime?: number;
  /** Enable privacy mode */
  privacyEnabled?: 'Y' | 'N';
  /** Privacy content */
  privacyContent?: string;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for listing questionnaires
 */
export interface QuestionnaireListOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Page number */
  page?: number;
  /** Page size */
  size?: number;
  /** Session ID filter */
  sessionId?: string;
  /** Start date filter (yyyy-MM-dd) */
  startDate?: string;
  /** End date filter (yyyy-MM-dd) */
  endDate?: string;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for getting questionnaire detail
 */
export interface QuestionnaireDetailOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Questionnaire ID (required) */
  questionnaireId: string;
  /** Output format (table or json) */
  output?: OutputFormat;
}

// ============================================
// Service Config Types
// ============================================

/**
 * Service configuration for QA and questionnaire operations
 */
export interface QaQuestionnaireServiceConfig {
  /** Base URL for API requests */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Enable debug mode */
  debug: boolean;
}

// ============================================
// SDK Params Types (for service wrapper)
// ============================================

/**
 * Parameters for sending QA question via SDK
 */
export interface SendQaParams {
  channelId: number;
  questionId: string;
  duration?: number | undefined;
}

/**
 * Parameters for listing QA questions via SDK
 */
export interface ListQaParams {
  channelId: string;
}

/**
 * Parameters for stopping QA question via SDK
 */
export interface StopQaParams {
  channelId: number;
  questionId: string;
}

/**
 * Parameters for creating questionnaire via SDK
 */
export interface CreateQuestionnaireParams {
  channelId: string;
  title: string;
  questions: QuestionnaireQuestionItem[];
  customQuestionnaireId?: string | undefined;
  autoPublishTime?: number | undefined;
  autoEndTime?: number | undefined;
  privacyEnabled?: 'Y' | 'N' | undefined;
  privacyContent?: string | undefined;
}

/**
 * Parameters for listing questionnaires via SDK
 */
export interface ListQuestionnairesParams {
  channelId: string;
  page?: number | undefined;
  pageSize?: number | undefined;
  sessionId?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
}

/**
 * Parameters for getting questionnaire detail via SDK
 */
export interface GetQuestionnaireDetailParams {
  channelId: string;
  questionnaireId: string;
}
