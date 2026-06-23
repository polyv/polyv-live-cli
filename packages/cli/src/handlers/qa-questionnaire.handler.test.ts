/**
 * @fileoverview Unit tests for QaQuestionnaireHandler
 * @author Development Team
 * @since 11.4.0
 */

import { QaQuestionnaireHandler } from './qa-questionnaire.handler';
import { QaQuestionnaireServiceSdk } from '../services/qa-questionnaire-service';
import {
  QaQuestionnaireServiceConfig,
  QaSendOptions,
  QaListOptions,
  QaStopOptions,
  QaAddEditOptions,
  QuestionnaireCreateOptions,
  QuestionnaireListOptions,
  QuestionnaireResultListOptions,
  QuestionnaireDetailOptions,
} from '../types/qa';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError, PolyVError } from '../utils/errors';

// Mock QaQuestionnaireServiceSdk
jest.mock('../services/qa-questionnaire-service');
const MockedQaQuestionnaireService = QaQuestionnaireServiceSdk as jest.MockedClass<typeof QaQuestionnaireServiceSdk>;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('QaQuestionnaireHandler', () => {
  let qaQuestionnaireHandler: QaQuestionnaireHandler;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: QaQuestionnaireServiceConfig;
  let mockQaQuestionnaireService: jest.Mocked<QaQuestionnaireServiceSdk>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock auth config
    mockAuthConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id'
    };

    // Mock service config
    mockServiceConfig = {
      baseUrl: 'https://api.polyv.net',
      timeout: 30000,
      debug: false
    };

    // Create mock service instance
    mockQaQuestionnaireService = {
      sendQa: jest.fn(),
      listQa: jest.fn(),
      stopQa: jest.fn(),
      addEditQuestion: jest.fn(),
      createQuestionnaire: jest.fn(),
      listQuestionnaire: jest.fn(),
      listQuestionnaires: jest.fn(),
      getQuestionnaireDetail: jest.fn()
    } as any;

    // Mock QaQuestionnaireService constructor
    MockedQaQuestionnaireService.mockImplementation(() => mockQaQuestionnaireService);

    // Create handler instance
    qaQuestionnaireHandler = new QaQuestionnaireHandler(mockAuthConfig, mockServiceConfig);
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('constructor', () => {
    it('should create QaQuestionnaireServiceSdk with correct configuration', () => {
      expect(MockedQaQuestionnaireService).toHaveBeenCalledWith(mockAuthConfig, mockServiceConfig);
    });
  });

  // ============================================================
  // AC #1: qa send command
  // ============================================================
  describe('sendQa (AC #1)', () => {
    it('11.4-UNIT-001: should send qa with minimal parameters', async () => {
      const options: QaSendOptions = {
        channelId: '3151318',
        questionId: 'gv0uf9s5v7',
        output: 'table'
      };

      mockQaQuestionnaireService.sendQa.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {}
      });

      await qaQuestionnaireHandler.sendQa(options);

      expect(mockQaQuestionnaireService.sendQa).toHaveBeenCalledWith({
        channelId: 3151318,
        questionId: 'gv0uf9s5v7',
        duration: undefined
      });
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('QA sent successfully')
      );
    });

    it('11.4-UNIT-002: should send qa with duration parameter', async () => {
      const options: QaSendOptions = {
        channelId: '3151318',
        questionId: 'gv0uf9s5v7',
        duration: 30,
        output: 'table'
      };

      mockQaQuestionnaireService.sendQa.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {}
      });

      await qaQuestionnaireHandler.sendQa(options);

      expect(mockQaQuestionnaireService.sendQa).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 30
        })
      );
    });

    it('11.4-UNIT-003: should validate channelId is required', async () => {
      const options = {
        channelId: '',
        questionId: 'gv0uf9s5v7',
        output: 'table' as const
      };

      await expect(qaQuestionnaireHandler.sendQa(options)).rejects.toThrow(PolyVValidationError);
      await expect(qaQuestionnaireHandler.sendQa(options)).rejects.toThrow('channelId is required');
    });

    it('11.4-UNIT-004: should validate questionId is required', async () => {
      const options = {
        channelId: '3151318',
        questionId: '',
        output: 'table' as const
      };

      await expect(qaQuestionnaireHandler.sendQa(options)).rejects.toThrow(PolyVValidationError);
      await expect(qaQuestionnaireHandler.sendQa(options)).rejects.toThrow('questionId is required');
    });

    it('11.4-UNIT-005: should validate duration is within valid range (1-99)', async () => {
      const options = {
        channelId: '3151318',
        questionId: 'gv0uf9s5v7',
        duration: 100,
        output: 'table' as const
      };

      await expect(qaQuestionnaireHandler.sendQa(options)).rejects.toThrow(PolyVValidationError);
      await expect(qaQuestionnaireHandler.sendQa(options)).rejects.toThrow('duration must be between 1 and 99');
    });

    it('11.4-UNIT-006: should format success message', async () => {
      const options: QaSendOptions = {
        channelId: '3151318',
        questionId: 'gv0uf9s5v7',
        output: 'table'
      };

      mockQaQuestionnaireService.sendQa.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {}
      });

      await qaQuestionnaireHandler.sendQa(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('QA sent successfully')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('gv0uf9s5v7')
      );
    });

    it('11.4-UNIT-007: should handle API errors gracefully', async () => {
      const options: QaSendOptions = {
        channelId: '3151318',
        questionId: 'gv0uf9s5v7',
        output: 'table'
      };

      const apiError = new PolyVError('API Error: Authentication failed', 'AUTH_ERROR', 401);
      mockQaQuestionnaireService.sendQa.mockRejectedValue(apiError);

      await expect(qaQuestionnaireHandler.sendQa(options)).rejects.toThrow(PolyVError);
    });
  });

  describe('addEditQuestion', () => {
    it('should create qa question without questionId', async () => {
      const options: QaAddEditOptions = {
        channelId: '3151318',
        type: 'R',
        answer: 'A',
        name: '新品首发到手价是多少？',
        itemType: 0,
        options: ['299元', '399元'],
        tips: ['正确答案是299元'],
        force: true,
        output: 'json'
      };

      mockQaQuestionnaireService.addEditQuestion.mockResolvedValue({
        code: 200,
        status: 'success',
        data: 'gv0uf9s5v7'
      });

      await qaQuestionnaireHandler.addEditQuestion(options);

      expect(mockQaQuestionnaireService.addEditQuestion).toHaveBeenCalledWith({
        channelId: '3151318',
        type: 'R',
        answer: 'A',
        name: '新品首发到手价是多少？',
        itemType: 0,
        options: ['299元', '399元'],
        tips: ['正确答案是299元']
      });
    });

    it('should reject an explicitly blank questionId', async () => {
      const options: QaAddEditOptions = {
        channelId: '3151318',
        questionId: '',
        type: 'R',
        answer: 'A',
        name: '新品首发到手价是多少？',
        itemType: 0,
        force: true,
        output: 'json'
      };

      await expect(qaQuestionnaireHandler.addEditQuestion(options)).rejects.toThrow(PolyVValidationError);
      await expect(qaQuestionnaireHandler.addEditQuestion(options)).rejects.toThrow('questionId is required');
    });
  });

  // ============================================================
  // AC #2: qa list command
  // ============================================================
  describe('listQa (AC #2)', () => {
    it('11.4-UNIT-008: should list qa with minimal parameters', async () => {
      const options: QaListOptions = {
        channelId: '3151318',
        output: 'table'
      };

      mockQaQuestionnaireService.listQa.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [
            {
              questionId: 'gv0uf9s5v7',
              name: 'What is 1+1?',
              type: 'R',
              status: 'send',
              times: 5
            }
          ]
        }
      });

      await qaQuestionnaireHandler.listQa(options);

      expect(mockQaQuestionnaireService.listQa).toHaveBeenCalledWith({
        channelId: '3151318'
      });
    });

    it('should render qa list responses returned in top-level list', async () => {
      const options: QaListOptions = {
        channelId: '3151318',
        output: 'json'
      };

      mockQaQuestionnaireService.listQa.mockResolvedValue({
        templateId: 'template-1',
        list: [
          {
            questionId: 'gv0uf9s5v7',
            name: '新品首发到手价是多少？',
            type: 'R',
            status: 'draft',
            times: 0
          }
        ]
      });

      await qaQuestionnaireHandler.listQa(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('"count": 1'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('"questionId": "gv0uf9s5v7"'));
    });

    it('11.4-UNIT-009: should validate channelId is required', async () => {
      const options = {
        channelId: '',
        output: 'table' as const
      };

      await expect(qaQuestionnaireHandler.listQa(options)).rejects.toThrow(PolyVValidationError);
      await expect(qaQuestionnaireHandler.listQa(options)).rejects.toThrow('channelId is required');
    });

    it('11.4-UNIT-010: should output results in table format by default', async () => {
      const options: QaListOptions = {
        channelId: '3151318',
        output: 'table'
      };

      mockQaQuestionnaireService.listQa.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [
            {
              questionId: 'gv0uf9s5v7',
              name: 'What is 1+1?',
              type: 'R',
              status: 'send',
              times: 5
            }
          ]
        }
      });

      await qaQuestionnaireHandler.listQa(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Question ID')
      );
    });

    it('11.4-UNIT-011: should output results in JSON format when specified', async () => {
      const options: QaListOptions = {
        channelId: '3151318',
        output: 'json'
      };

      mockQaQuestionnaireService.listQa.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [
            {
              questionId: 'gv0uf9s5v7',
              name: 'What is 1+1?',
              type: 'R',
              status: 'send',
              times: 5
            }
          ]
        }
      });

      await qaQuestionnaireHandler.listQa(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"questionId"')
      );
    });

    it('11.4-UNIT-012: should display empty message when no qa found', async () => {
      const options: QaListOptions = {
        channelId: '3151318',
        output: 'table'
      };

      mockQaQuestionnaireService.listQa.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: []
        }
      });

      await qaQuestionnaireHandler.listQa(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No QA found')
      );
    });

    it('11.4-UNIT-013: should handle API errors gracefully', async () => {
      const options: QaListOptions = {
        channelId: '3151318',
        output: 'table'
      };

      const apiError = new PolyVError('API Error: Authentication failed', 'AUTH_ERROR', 401);
      mockQaQuestionnaireService.listQa.mockRejectedValue(apiError);

      await expect(qaQuestionnaireHandler.listQa(options)).rejects.toThrow(PolyVError);
    });
  });

  // ============================================================
  // AC #3: qa stop command
  // ============================================================
  describe('stopQa (AC #3)', () => {
    it('11.4-UNIT-014: should stop qa with questionId', async () => {
      const options: QaStopOptions = {
        channelId: '3151318',
        questionId: 'gv0uf9s5v7',
        output: 'table'
      };

      mockQaQuestionnaireService.stopQa.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          answer: 'A',
          total: 100,
          rightUserCount: 80,
          faultUserCount: 20,
          singleResult: [50, 30, 15, 5]
        }
      });

      await qaQuestionnaireHandler.stopQa(options);

      expect(mockQaQuestionnaireService.stopQa).toHaveBeenCalledWith({
        channelId: 3151318,
        questionId: 'gv0uf9s5v7'
      });
    });

    it('11.4-UNIT-015: should display qa statistics result', async () => {
      const options: QaStopOptions = {
        channelId: '3151318',
        questionId: 'gv0uf9s5v7',
        output: 'table'
      };

      mockQaQuestionnaireService.stopQa.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          answer: 'A',
          total: 100,
          rightUserCount: 80,
          faultUserCount: 20,
          singleResult: [50, 30, 15, 5]
        }
      });

      await qaQuestionnaireHandler.stopQa(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Correct Answer')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Total')
      );
    });

    it('11.4-UNIT-016: should validate channelId is required', async () => {
      const options = {
        channelId: '',
        questionId: 'gv0uf9s5v7',
        output: 'table' as const
      };

      await expect(qaQuestionnaireHandler.stopQa(options)).rejects.toThrow(PolyVValidationError);
      await expect(qaQuestionnaireHandler.stopQa(options)).rejects.toThrow('channelId is required');
    });

    it('11.4-UNIT-017: should validate questionId is required', async () => {
      const options = {
        channelId: '3151318',
        questionId: '',
        output: 'table' as const
      };

      await expect(qaQuestionnaireHandler.stopQa(options)).rejects.toThrow(PolyVValidationError);
      await expect(qaQuestionnaireHandler.stopQa(options)).rejects.toThrow('questionId is required');
    });

    it('11.4-UNIT-018: should output results in table format', async () => {
      const options: QaStopOptions = {
        channelId: '3151318',
        questionId: 'gv0uf9s5v7',
        output: 'table'
      };

      mockQaQuestionnaireService.stopQa.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          answer: 'A',
          total: 100,
          rightUserCount: 80,
          faultUserCount: 20,
          singleResult: [50, 30, 15, 5]
        }
      });

      await qaQuestionnaireHandler.stopQa(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Correct Answer')
      );
    });

    it('11.4-UNIT-019: should output results in JSON format', async () => {
      const options: QaStopOptions = {
        channelId: '3151318',
        questionId: 'gv0uf9s5v7',
        output: 'json'
      };

      mockQaQuestionnaireService.stopQa.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          answer: 'A',
          total: 100,
          rightUserCount: 80,
          faultUserCount: 20,
          singleResult: [50, 30, 15, 5]
        }
      });

      await qaQuestionnaireHandler.stopQa(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"answer"')
      );
    });

    it('11.4-UNIT-020: should handle API errors gracefully', async () => {
      const options: QaStopOptions = {
        channelId: '3151318',
        questionId: 'gv0uf9s5v7',
        output: 'table'
      };

      const apiError = new PolyVError('API Error: Authentication failed', 'AUTH_ERROR', 401);
      mockQaQuestionnaireService.stopQa.mockRejectedValue(apiError);

      await expect(qaQuestionnaireHandler.stopQa(options)).rejects.toThrow(PolyVError);
    });
  });

  // ============================================================
  // AC #4: questionnaire create command
  // ============================================================
  describe('createQuestionnaire (AC #4)', () => {
    it('11.4-UNIT-021: should create questionnaire with title and questions', async () => {
      const options: QuestionnaireCreateOptions = {
        channelId: '3151318',
        title: 'Survey Title',
        questions: JSON.stringify([
          { name: 'Your gender?', type: 'R', options: ['Male', 'Female'], required: 'Y' }
        ]),
        output: 'table'
      };

      mockQaQuestionnaireService.createQuestionnaire.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          questionnaireId: 'fs9v59nq4u'
        }
      });

      await qaQuestionnaireHandler.createQuestionnaire(options);

      expect(mockQaQuestionnaireService.createQuestionnaire).toHaveBeenCalledWith({
        channelId: '3151318',
        title: 'Survey Title',
        questions: [
          { name: 'Your gender?', type: 'R', options: ['Male', 'Female'], required: 'Y' }
        ]
      });
    });

    it('11.4-UNIT-022: should validate channelId is required', async () => {
      const options = {
        channelId: '',
        title: 'Survey Title',
        questions: '[]',
        output: 'table' as const
      };

      await expect(qaQuestionnaireHandler.createQuestionnaire(options)).rejects.toThrow(PolyVValidationError);
      await expect(qaQuestionnaireHandler.createQuestionnaire(options)).rejects.toThrow('channelId is required');
    });

    it('11.4-UNIT-023: should validate title is required', async () => {
      const options = {
        channelId: '3151318',
        title: '',
        questions: '[]',
        output: 'table' as const
      };

      await expect(qaQuestionnaireHandler.createQuestionnaire(options)).rejects.toThrow(PolyVValidationError);
      await expect(qaQuestionnaireHandler.createQuestionnaire(options)).rejects.toThrow('title is required');
    });

    it('11.4-UNIT-024: should validate questions is required', async () => {
      const options = {
        channelId: '3151318',
        title: 'Survey Title',
        questions: '',
        output: 'table' as const
      };

      await expect(qaQuestionnaireHandler.createQuestionnaire(options)).rejects.toThrow(PolyVValidationError);
      await expect(qaQuestionnaireHandler.createQuestionnaire(options)).rejects.toThrow('questions is required');
    });

    it('11.4-UNIT-025: should parse questions JSON correctly', async () => {
      const options: QuestionnaireCreateOptions = {
        channelId: '3151318',
        title: 'Survey Title',
        questions: '[{"name":"Q1?","type":"R","options":["A","B"],"required":"Y"}]',
        output: 'table'
      };

      mockQaQuestionnaireService.createQuestionnaire.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          questionnaireId: 'fs9v59nq4u'
        }
      });

      await qaQuestionnaireHandler.createQuestionnaire(options);

      expect(mockQaQuestionnaireService.createQuestionnaire).toHaveBeenCalledWith(
        expect.objectContaining({
          questions: [{ name: 'Q1?', type: 'R', options: ['A', 'B'], required: 'Y' }]
        })
      );
    });

    it('11.4-UNIT-026: should output success message with questionnaireId', async () => {
      const options: QuestionnaireCreateOptions = {
        channelId: '3151318',
        title: 'Survey Title',
        questions: '[]',
        output: 'table'
      };

      mockQaQuestionnaireService.createQuestionnaire.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          questionnaireId: 'fs9v59nq4u'
        }
      });

      await qaQuestionnaireHandler.createQuestionnaire(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Questionnaire created successfully')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('fs9v59nq4u')
      );
    });

    it('11.4-UNIT-027: should handle invalid questions JSON', async () => {
      const options = {
        channelId: '3151318',
        title: 'Survey Title',
        questions: 'invalid json',
        output: 'table' as const
      };

      await expect(qaQuestionnaireHandler.createQuestionnaire(options)).rejects.toThrow(PolyVValidationError);
      await expect(qaQuestionnaireHandler.createQuestionnaire(options)).rejects.toThrow('Invalid JSON format for questions');
    });

    it('11.4-UNIT-028: should handle API errors gracefully', async () => {
      const options: QuestionnaireCreateOptions = {
        channelId: '3151318',
        title: 'Survey Title',
        questions: '[]',
        output: 'table'
      };

      const apiError = new PolyVError('API Error: Authentication failed', 'AUTH_ERROR', 401);
      mockQaQuestionnaireService.createQuestionnaire.mockRejectedValue(apiError);

      await expect(qaQuestionnaireHandler.createQuestionnaire(options)).rejects.toThrow(PolyVError);
    });
  });

  // ============================================================
  // AC #5: questionnaire list command
  // ============================================================
  describe('listQuestionnaires (AC #5)', () => {
    it('11.4-UNIT-029: should list questionnaires with minimal parameters', async () => {
      const options: QuestionnaireResultListOptions = {
        channelId: '3151318',
        output: 'table'
      };

      mockQaQuestionnaireService.listQuestionnaires.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [
            {
              questionnaireId: 'fs9v59nq4u',
              questionnaireTitle: 'Survey Title',
              lastModified: 1704067200000,
              users: []
            }
          ],
          totalItems: 1
        }
      });

      await qaQuestionnaireHandler.listQuestionnaires(options);

      expect(mockQaQuestionnaireService.listQuestionnaires).toHaveBeenCalledWith({
        channelId: '3151318',
        page: undefined,
        pageSize: undefined,
        sessionId: undefined,
        startDate: undefined,
        endDate: undefined
      });
    });

    it('11.4-UNIT-030: should list questionnaires with pagination (page, size)', async () => {
      const options: QuestionnaireResultListOptions = {
        channelId: '3151318',
        page: 1,
        size: 20,
        output: 'table'
      };

      mockQaQuestionnaireService.listQuestionnaires.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [],
          totalItems: 0
        }
      });

      await qaQuestionnaireHandler.listQuestionnaires(options);

      expect(mockQaQuestionnaireService.listQuestionnaires).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          pageSize: 20
        })
      );
    });

    it('11.4-UNIT-031: should list questionnaires filtered by sessionId', async () => {
      const options: QuestionnaireResultListOptions = {
        channelId: '3151318',
        sessionId: 'fwly13xczv',
        output: 'table'
      };

      mockQaQuestionnaireService.listQuestionnaires.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [],
          totalItems: 0
        }
      });

      await qaQuestionnaireHandler.listQuestionnaires(options);

      expect(mockQaQuestionnaireService.listQuestionnaires).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'fwly13xczv'
        })
      );
    });

    it('11.4-UNIT-032: should list questionnaires filtered by date range', async () => {
      const options: QuestionnaireResultListOptions = {
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        output: 'table'
      };

      mockQaQuestionnaireService.listQuestionnaires.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [],
          totalItems: 0
        }
      });

      await qaQuestionnaireHandler.listQuestionnaires(options);

      expect(mockQaQuestionnaireService.listQuestionnaires).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
      );
    });

    it('11.4-UNIT-033: should validate channelId is required', async () => {
      const options = {
        channelId: '',
        output: 'table' as const
      };

      await expect(qaQuestionnaireHandler.listQuestionnaires(options)).rejects.toThrow(PolyVValidationError);
      await expect(qaQuestionnaireHandler.listQuestionnaires(options)).rejects.toThrow('channelId is required');
    });

    it('11.4-UNIT-034: should output results in table format by default', async () => {
      const options: QuestionnaireResultListOptions = {
        channelId: '3151318',
        output: 'table'
      };

      mockQaQuestionnaireService.listQuestionnaires.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [
            {
              questionnaireId: 'fs9v59nq4u',
              questionnaireTitle: 'Survey Title',
              lastModified: 1704067200000,
              users: []
            }
          ],
          totalItems: 1
        }
      });

      await qaQuestionnaireHandler.listQuestionnaires(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Questionnaire ID')
      );
    });

    it('11.4-UNIT-035: should output results in JSON format when specified', async () => {
      const options: QuestionnaireResultListOptions = {
        channelId: '3151318',
        output: 'json'
      };

      mockQaQuestionnaireService.listQuestionnaires.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [
            {
              questionnaireId: 'fs9v59nq4u',
              questionnaireTitle: 'Survey Title',
              lastModified: 1704067200000,
              users: []
            }
          ],
          totalItems: 1
        }
      });

      await qaQuestionnaireHandler.listQuestionnaires(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"questionnaireId"')
      );
    });

    it('11.4-UNIT-036: should display empty message when no questionnaire results found', async () => {
      const options: QuestionnaireResultListOptions = {
        channelId: '3151318',
        output: 'table'
      };

      mockQaQuestionnaireService.listQuestionnaires.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [],
          totalItems: 0
        }
      });

      await qaQuestionnaireHandler.listQuestionnaires(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No questionnaire results found')
      );
    });

    it('11.4-UNIT-037: should handle API errors gracefully', async () => {
      const options: QuestionnaireResultListOptions = {
        channelId: '3151318',
        output: 'table'
      };

      const apiError = new PolyVError('API Error: Authentication failed', 'AUTH_ERROR', 401);
      mockQaQuestionnaireService.listQuestionnaires.mockRejectedValue(apiError);

      await expect(qaQuestionnaireHandler.listQuestionnaires(options)).rejects.toThrow(PolyVError);
    });
  });

  describe('listQuestionnaire', () => {
    it('should list questionnaires with minimal parameters', async () => {
      const options: QuestionnaireListOptions = {
        channelId: '3151318',
        output: 'table'
      };

      mockQaQuestionnaireService.listQuestionnaire.mockResolvedValue({
        code: 200,
        data: {
          contents: [
            { questionnaireId: 'q1', questionnaireTitle: 'Survey 1' }
          ],
          totalItems: 1
        }
      });

      await qaQuestionnaireHandler.listQuestionnaire(options);

      expect(mockQaQuestionnaireService.listQuestionnaire).toHaveBeenCalledWith({
        channelId: '3151318'
      });
    });

    it('should pass timestamp and pagination options', async () => {
      const options: QuestionnaireListOptions = {
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: 1706745599000,
        page: 2,
        size: 20,
        output: 'json'
      };

      mockQaQuestionnaireService.listQuestionnaire.mockResolvedValue({
        code: 200,
        data: { contents: [], totalItems: 0 }
      });

      await qaQuestionnaireHandler.listQuestionnaire(options);

      expect(mockQaQuestionnaireService.listQuestionnaire).toHaveBeenCalledWith({
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: 1706745599000,
        page: 2,
        pageSize: 20
      });
    });
  });

  // ============================================================
  // AC #6: questionnaire detail command
  // ============================================================
  describe('getQuestionnaireDetail (AC #6)', () => {
    it('11.4-UNIT-038: should get questionnaire detail with questionnaireId', async () => {
      const options: QuestionnaireDetailOptions = {
        channelId: '3151318',
        questionnaireId: 'fs9v59nq4u',
        output: 'table'
      };

      mockQaQuestionnaireService.getQuestionnaireDetail.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          questionnaireId: 'fs9v59nq4u',
          name: 'Survey Title',
          status: 'published',
          questions: [
            {
              questionId: 'q1',
              name: 'What is your gender?',
              type: 'R',
              required: 'Y',
              scoreEnabled: 'N'
            }
          ]
        }
      });

      await qaQuestionnaireHandler.getQuestionnaireDetail(options);

      expect(mockQaQuestionnaireService.getQuestionnaireDetail).toHaveBeenCalledWith({
        channelId: '3151318',
        questionnaireId: 'fs9v59nq4u'
      });
    });

    it('11.4-UNIT-039: should display questionnaire questions list', async () => {
      const options: QuestionnaireDetailOptions = {
        channelId: '3151318',
        questionnaireId: 'fs9v59nq4u',
        output: 'table'
      };

      mockQaQuestionnaireService.getQuestionnaireDetail.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          questionnaireId: 'fs9v59nq4u',
          name: 'Survey Title',
          status: 'published',
          questions: [
            {
              questionId: 'q1',
              name: 'What is your gender?',
              type: 'R',
              required: 'Y',
              scoreEnabled: 'N'
            }
          ]
        }
      });

      await qaQuestionnaireHandler.getQuestionnaireDetail(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Question ID')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('What is your gender?')
      );
    });

    it('11.4-UNIT-040: should validate channelId is required', async () => {
      const options = {
        channelId: '',
        questionnaireId: 'fs9v59nq4u',
        output: 'table' as const
      };

      await expect(qaQuestionnaireHandler.getQuestionnaireDetail(options)).rejects.toThrow(PolyVValidationError);
      await expect(qaQuestionnaireHandler.getQuestionnaireDetail(options)).rejects.toThrow('channelId is required');
    });

    it('11.4-UNIT-041: should validate questionnaireId is required', async () => {
      const options = {
        channelId: '3151318',
        questionnaireId: '',
        output: 'table' as const
      };

      await expect(qaQuestionnaireHandler.getQuestionnaireDetail(options)).rejects.toThrow(PolyVValidationError);
      await expect(qaQuestionnaireHandler.getQuestionnaireDetail(options)).rejects.toThrow('questionnaireId is required');
    });

    it('11.4-UNIT-042: should output results in table format', async () => {
      const options: QuestionnaireDetailOptions = {
        channelId: '3151318',
        questionnaireId: 'fs9v59nq4u',
        output: 'table'
      };

      mockQaQuestionnaireService.getQuestionnaireDetail.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          questionnaireId: 'fs9v59nq4u',
          name: 'Survey Title',
          status: 'published',
          questions: []
        }
      });

      await qaQuestionnaireHandler.getQuestionnaireDetail(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Questionnaire Detail')
      );
    });

    it('11.4-UNIT-043: should output results in JSON format', async () => {
      const options: QuestionnaireDetailOptions = {
        channelId: '3151318',
        questionnaireId: 'fs9v59nq4u',
        output: 'json'
      };

      mockQaQuestionnaireService.getQuestionnaireDetail.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          questionnaireId: 'fs9v59nq4u',
          name: 'Survey Title',
          status: 'published',
          questions: []
        }
      });

      await qaQuestionnaireHandler.getQuestionnaireDetail(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"questionnaireId"')
      );
    });

    it('11.4-UNIT-044: should handle API errors gracefully', async () => {
      const options: QuestionnaireDetailOptions = {
        channelId: '3151318',
        questionnaireId: 'fs9v59nq4u',
        output: 'table'
      };

      const apiError = new PolyVError('API Error: Authentication failed', 'AUTH_ERROR', 401);
      mockQaQuestionnaireService.getQuestionnaireDetail.mockRejectedValue(apiError);

      await expect(qaQuestionnaireHandler.getQuestionnaireDetail(options)).rejects.toThrow(PolyVError);
    });
  });

  // ============================================================
  // AC #10: Error handling tests
  // ============================================================
  describe('Error Handling (AC #10)', () => {
    it('11.4-UNIT-074: should validate missing channelId and throw PolyVValidationError', async () => {
      const options = {
        channelId: '',
        questionId: 'gv0uf9s5v7',
        output: 'table' as const
      };

      await expect(qaQuestionnaireHandler.sendQa(options)).rejects.toThrow(PolyVValidationError);
    });

    it('11.4-UNIT-075: should validate missing questionId and throw PolyVValidationError', async () => {
      const options = {
        channelId: '3151318',
        questionId: '',
        output: 'table' as const
      };

      await expect(qaQuestionnaireHandler.sendQa(options)).rejects.toThrow(PolyVValidationError);
    });

    it('11.4-UNIT-076: should validate missing questionnaireId and throw PolyVValidationError', async () => {
      const options = {
        channelId: '3151318',
        questionnaireId: '',
        output: 'table' as const
      };

      await expect(qaQuestionnaireHandler.getQuestionnaireDetail(options)).rejects.toThrow(PolyVValidationError);
    });

    it('11.4-UNIT-077: should validate invalid questions JSON format', async () => {
      const options = {
        channelId: '3151318',
        title: 'Survey Title',
        questions: 'not a json',
        output: 'table' as const
      };

      await expect(qaQuestionnaireHandler.createQuestionnaire(options)).rejects.toThrow(PolyVValidationError);
    });

    it('11.4-UNIT-078: should handle API 401 error (authentication failed)', async () => {
      const options: QaSendOptions = {
        channelId: '3151318',
        questionId: 'gv0uf9s5v7',
        output: 'table'
      };

      const apiError = new PolyVError('Request failed with status code 401', 'AUTH_ERROR', 401);
      mockQaQuestionnaireService.sendQa.mockRejectedValue(apiError);

      await expect(qaQuestionnaireHandler.sendQa(options)).rejects.toThrow();
    });

    it('11.4-UNIT-079: should handle API 403 error (permission denied)', async () => {
      const options: QaSendOptions = {
        channelId: '3151318',
        questionId: 'gv0uf9s5v7',
        output: 'table'
      };

      const apiError = new PolyVError('Request failed with status code 403', 'FORBIDDEN', 403);
      mockQaQuestionnaireService.sendQa.mockRejectedValue(apiError);

      await expect(qaQuestionnaireHandler.sendQa(options)).rejects.toThrow();
    });

    it('11.4-UNIT-080: should handle API 404 error (resource not found)', async () => {
      const options: QuestionnaireDetailOptions = {
        channelId: '3151318',
        questionnaireId: 'nonexistent',
        output: 'table'
      };

      const apiError = new PolyVError('Request failed with status code 404', 'NOT_FOUND', 404);
      mockQaQuestionnaireService.getQuestionnaireDetail.mockRejectedValue(apiError);

      await expect(qaQuestionnaireHandler.getQuestionnaireDetail(options)).rejects.toThrow();
    });

    it('11.4-UNIT-081: should handle API 500 error (internal server error)', async () => {
      const options: QaSendOptions = {
        channelId: '3151318',
        questionId: 'gv0uf9s5v7',
        output: 'table'
      };

      const apiError = new PolyVError('Request failed with status code 500', 'SERVER_ERROR', 500);
      mockQaQuestionnaireService.sendQa.mockRejectedValue(apiError);

      await expect(qaQuestionnaireHandler.sendQa(options)).rejects.toThrow();
    });

    it('11.4-UNIT-082: should handle network timeout errors', async () => {
      const options: QaSendOptions = {
        channelId: '3151318',
        questionId: 'gv0uf9s5v7',
        output: 'table'
      };

      const apiError = new PolyVError('timeout of 30000ms exceeded', 'TIMEOUT', -1);
      mockQaQuestionnaireService.sendQa.mockRejectedValue(apiError);

      await expect(qaQuestionnaireHandler.sendQa(options)).rejects.toThrow();
    });
  });
});
