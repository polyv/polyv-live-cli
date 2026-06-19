/**
 * @fileoverview Tests for QaQuestionnaireServiceSdk
 * @author Development Team
 */

import { QaQuestionnaireServiceSdk } from './qa-questionnaire-service';
import {
  QaQuestionnaireServiceConfig,
  SendQaParams,
  ListQaParams,
  StopQaParams,
  CreateQuestionnaireParams,
  ListQuestionnairesParams,
  GetQuestionnaireDetailParams,
  QuestionnaireQuestionItem,
} from '../types/qa';
import { AuthConfig } from '../types/auth';
import { PolyVError } from '../utils/errors';
import { PolyVClient } from 'polyv-live-api-sdk';

// Mock the PolyVClient
jest.mock('polyv-live-api-sdk', () => ({
  PolyVClient: jest.fn(),
}));

const MockPolyVClient = PolyVClient as jest.MockedClass<typeof PolyVClient>;

describe('QaQuestionnaireServiceSdk', () => {
  let service: QaQuestionnaireServiceSdk;
  let mockLiveInteraction: {
    sendQuestion: jest.Mock;
    listQuestion: jest.Mock;
    stopQuestion: jest.Mock;
    addEditQuestionnaire: jest.Mock;
    createQuestionnaire: jest.Mock;
    listQuestionnaireByPage: jest.Mock;
    getQuestionnaireDetail: jest.Mock;
  };
  const mockAuthConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
  };
  const mockServiceConfig: QaQuestionnaireServiceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockLiveInteraction = {
      sendQuestion: jest.fn(),
      listQuestion: jest.fn(),
      stopQuestion: jest.fn(),
      addEditQuestionnaire: jest.fn(),
      createQuestionnaire: jest.fn((payload) => mockLiveInteraction.addEditQuestionnaire(
        { channelId: payload.channelId },
        {
          questionnaireId: payload.customQuestionnaireId,
          title: payload.questionnaireTitle,
          items: payload.questions.map((q: any) => ({
            type: q.type,
            question: q.name,
            options: q.options,
            required: q.required === 'Y',
          })),
        }
      )),
      listQuestionnaireByPage: jest.fn(),
      getQuestionnaireDetail: jest.fn(),
    };

    MockPolyVClient.mockImplementation(() => ({
      liveInteraction: mockLiveInteraction,
    }) as any);

    service = new QaQuestionnaireServiceSdk(mockAuthConfig, mockServiceConfig);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // ============================================
  // Constructor Tests
  // ============================================

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      expect(service).toBeInstanceOf(QaQuestionnaireServiceSdk);
    });

    it('should create PolyVClient with authConfig', () => {
      expect(MockPolyVClient).toHaveBeenCalledWith(mockAuthConfig);
    });

    it('should work without serviceConfig', () => {
      const serviceWithoutConfig = new QaQuestionnaireServiceSdk(mockAuthConfig);
      expect(serviceWithoutConfig).toBeInstanceOf(QaQuestionnaireServiceSdk);
    });
  });

  // ============================================
  // sendQa Tests
  // ============================================

  describe('sendQa', () => {
    const validParams: SendQaParams = {
      channelId: 3151318,
      questionId: 'question-123',
      duration: 60,
    };

    it('should send QA question successfully', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: { questionId: 'question-123' },
      };

      mockLiveInteraction.sendQuestion.mockResolvedValueOnce(mockResponse);

      const result = await service.sendQa(validParams);

      expect(result).toEqual(mockResponse);
      expect(mockLiveInteraction.sendQuestion).toHaveBeenCalledWith({
        channelId: 3151318,
        questionId: 'question-123',
        duration: 60,
      });
    });

    it('should send QA without optional duration', async () => {
      const paramsWithoutDuration: SendQaParams = {
        channelId: 3151318,
        questionId: 'question-123',
      };

      mockLiveInteraction.sendQuestion.mockResolvedValueOnce({ code: 200 });

      await service.sendQa(paramsWithoutDuration);

      expect(mockLiveInteraction.sendQuestion).toHaveBeenCalledWith({
        channelId: 3151318,
        questionId: 'question-123',
        duration: undefined,
      });
    });

    it('should wrap SDK errors in PolyVError', async () => {
      mockLiveInteraction.sendQuestion.mockRejectedValueOnce(new Error('SDK Error'));

      try {
        await service.sendQa(validParams);
        fail('Expected PolyVError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVError);
        expect((error as PolyVError).message).toContain('sendQa failed');
        expect((error as PolyVError).code).toBe('QA_QUESTIONNAIRE_API_ERROR');
      }
    });

    it('should preserve PolyVError instances', async () => {
      const polyvError = new PolyVError('Original error', 'ORIGINAL_ERROR', 1);
      mockLiveInteraction.sendQuestion.mockRejectedValueOnce(polyvError);

      await expect(service.sendQa(validParams)).rejects.toThrow(polyvError);
    });

    it('should handle non-Error throws', async () => {
      mockLiveInteraction.sendQuestion.mockRejectedValueOnce('string error');

      try {
        await service.sendQa(validParams);
        fail('Expected PolyVError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVError);
        expect((error as PolyVError).message).toContain('sendQa failed');
      }
    });
  });

  // ============================================
  // listQa Tests
  // ============================================

  describe('listQa', () => {
    const validParams: ListQaParams = {
      channelId: '3151318',
    };

    it('should list QA questions successfully', async () => {
      const mockResponse = {
        code: 200,
        data: {
          contents: [
            { questionId: 'q1', question: 'Question 1' },
            { questionId: 'q2', question: 'Question 2' },
          ],
          total: 2,
        },
      };

      mockLiveInteraction.listQuestion.mockResolvedValueOnce(mockResponse);

      const result = await service.listQa(validParams);

      expect(result).toEqual(mockResponse);
      expect(mockLiveInteraction.listQuestion).toHaveBeenCalledWith({
        channelId: '3151318',
      });
    });

    it('should return empty list when no questions', async () => {
      const mockResponse = {
        code: 200,
        data: { contents: [], total: 0 },
      };

      mockLiveInteraction.listQuestion.mockResolvedValueOnce(mockResponse);

      const result = await service.listQa(validParams);

      expect(result.data.contents).toEqual([]);
    });

    it('should wrap SDK errors in PolyVError', async () => {
      mockLiveInteraction.listQuestion.mockRejectedValueOnce(new Error('SDK Error'));

      try {
        await service.listQa(validParams);
        fail('Expected PolyVError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVError);
        expect((error as PolyVError).message).toContain('listQa failed');
      }
    });
  });

  // ============================================
  // stopQa Tests
  // ============================================

  describe('stopQa', () => {
    const validParams: StopQaParams = {
      channelId: 3151318,
      questionId: 'question-123',
    };

    it('should stop QA question successfully', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {
          answerCount: 50,
          correctCount: 45,
        },
      };

      mockLiveInteraction.stopQuestion.mockResolvedValueOnce(mockResponse);

      const result = await service.stopQa(validParams);

      expect(result).toEqual(mockResponse);
      expect(mockLiveInteraction.stopQuestion).toHaveBeenCalledWith({
        channelId: 3151318,
        questionId: 'question-123',
      });
    });

    it('should wrap SDK errors in PolyVError', async () => {
      mockLiveInteraction.stopQuestion.mockRejectedValueOnce(new Error('SDK Error'));

      try {
        await service.stopQa(validParams);
        fail('Expected PolyVError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVError);
        expect((error as PolyVError).message).toContain('stopQa failed');
      }
    });
  });

  // ============================================
  // createQuestionnaire Tests
  // ============================================

  describe('createQuestionnaire', () => {
    const questions: QuestionnaireQuestionItem[] = [
      {
        name: 'What is your favorite color?',
        type: 'R',
        options: ['Red', 'Blue', 'Green'],
        required: 'Y',
      },
      {
        name: 'Comments',
        type: 'Q',
        required: 'N',
      },
    ];

    const validParams: CreateQuestionnaireParams = {
      channelId: '3151318',
      title: 'Survey Title',
      questions,
    };

    it('should create questionnaire successfully', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: { questionnaireId: 'q-123' },
      };

      mockLiveInteraction.addEditQuestionnaire.mockResolvedValueOnce(mockResponse);

      const result = await service.createQuestionnaire(validParams);

      expect(result).toEqual(mockResponse);
    });

    it('should transform questions to SDK format', async () => {
      mockLiveInteraction.addEditQuestionnaire.mockResolvedValueOnce({ code: 200 });

      await service.createQuestionnaire(validParams);

      expect(mockLiveInteraction.addEditQuestionnaire).toHaveBeenCalledWith(
        { channelId: '3151318' },
        expect.objectContaining({
          items: [
            {
              type: 'R',
              question: 'What is your favorite color?',
              options: ['Red', 'Blue', 'Green'],
              required: true,
            },
            {
              type: 'Q',
              question: 'Comments',
              options: undefined,
              required: false,
            },
          ],
        })
      );
    });

    it('should include optional customQuestionnaireId', async () => {
      mockLiveInteraction.addEditQuestionnaire.mockResolvedValueOnce({ code: 200 });

      await service.createQuestionnaire({
        ...validParams,
        customQuestionnaireId: 'custom-123',
      });

      expect(mockLiveInteraction.addEditQuestionnaire).toHaveBeenCalledWith(
        { channelId: '3151318' },
        expect.objectContaining({
          questionnaireId: 'custom-123',
        })
      );
    });

    it('should include title in request', async () => {
      mockLiveInteraction.addEditQuestionnaire.mockResolvedValueOnce({ code: 200 });

      await service.createQuestionnaire(validParams);

      expect(mockLiveInteraction.addEditQuestionnaire).toHaveBeenCalledWith(
        { channelId: '3151318' },
        expect.objectContaining({
          title: 'Survey Title',
        })
      );
    });

    it('should convert required Y/N to boolean', async () => {
      const questionsWithMixedRequired: QuestionnaireQuestionItem[] = [
        { name: 'Q1', type: 'R', required: 'Y' },
        { name: 'Q2', type: 'Q', required: 'N' },
      ];

      mockLiveInteraction.addEditQuestionnaire.mockResolvedValueOnce({ code: 200 });

      await service.createQuestionnaire({
        channelId: '3151318',
        title: 'Test',
        questions: questionsWithMixedRequired,
      });

      const callArgs = mockLiveInteraction.addEditQuestionnaire.mock.calls[0][1];
      expect(callArgs.items[0].required).toBe(true);
      expect(callArgs.items[1].required).toBe(false);
    });

    it('should wrap SDK errors in PolyVError', async () => {
      mockLiveInteraction.addEditQuestionnaire.mockRejectedValueOnce(new Error('SDK Error'));

      try {
        await service.createQuestionnaire(validParams);
        fail('Expected PolyVError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVError);
        expect((error as PolyVError).message).toContain('createQuestionnaire failed');
      }
    });
  });

  // ============================================
  // listQuestionnaires Tests
  // ============================================

  describe('listQuestionnaires', () => {
    const validParams: ListQuestionnairesParams = {
      channelId: '3151318',
    };

    it('should list questionnaires successfully', async () => {
      const mockResponse = {
        code: 200,
        data: {
          contents: [
            { questionnaireId: 'q1', title: 'Survey 1' },
            { questionnaireId: 'q2', title: 'Survey 2' },
          ],
          total: 2,
        },
      };

      mockLiveInteraction.listQuestionnaireByPage.mockResolvedValueOnce(mockResponse);

      const result = await service.listQuestionnaires(validParams);

      expect(result).toEqual(mockResponse);
      expect(mockLiveInteraction.listQuestionnaireByPage).toHaveBeenCalledWith({
        channelId: '3151318',
        page: undefined,
        pageSize: undefined,
        sessionId: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should include optional parameters', async () => {
      mockLiveInteraction.listQuestionnaireByPage.mockResolvedValueOnce({ code: 200 });

      await service.listQuestionnaires({
        channelId: '3151318',
        page: 2,
        pageSize: 20,
        sessionId: 'session-123',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(mockLiveInteraction.listQuestionnaireByPage).toHaveBeenCalledWith({
        channelId: '3151318',
        page: 2,
        pageSize: 20,
        sessionId: 'session-123',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
    });

    it('should wrap SDK errors in PolyVError', async () => {
      mockLiveInteraction.listQuestionnaireByPage.mockRejectedValueOnce(new Error('SDK Error'));

      try {
        await service.listQuestionnaires(validParams);
        fail('Expected PolyVError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVError);
        expect((error as PolyVError).message).toContain('listQuestionnaires failed');
      }
    });
  });

  // ============================================
  // getQuestionnaireDetail Tests
  // ============================================

  describe('getQuestionnaireDetail', () => {
    const validParams: GetQuestionnaireDetailParams = {
      channelId: '3151318',
      questionnaireId: 'questionnaire-123',
    };

    it('should get questionnaire detail successfully', async () => {
      const mockResponse = {
        code: 200,
        data: {
          questionnaireId: 'questionnaire-123',
          title: 'Survey Title',
          items: [
            { questionId: 'q1', question: 'Question 1', type: 'R' },
          ],
        },
      };

      mockLiveInteraction.getQuestionnaireDetail.mockResolvedValueOnce(mockResponse);

      const result = await service.getQuestionnaireDetail(validParams);

      expect(result).toEqual(mockResponse);
      expect(mockLiveInteraction.getQuestionnaireDetail).toHaveBeenCalledWith({
        channelId: '3151318',
        questionnaireId: 'questionnaire-123',
      });
    });

    it('should wrap SDK errors in PolyVError', async () => {
      mockLiveInteraction.getQuestionnaireDetail.mockRejectedValueOnce(new Error('SDK Error'));

      try {
        await service.getQuestionnaireDetail(validParams);
        fail('Expected PolyVError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVError);
        expect((error as PolyVError).message).toContain('getQuestionnaireDetail failed');
      }
    });
  });

  // ============================================
  // Error Handling Tests
  // ============================================

  describe('wrapError', () => {
    it('should preserve PolyVError instances', async () => {
      const polyvError = new PolyVError('Original error', 'ORIGINAL_CODE', 1, { key: 'value' });
      mockLiveInteraction.sendQuestion.mockRejectedValueOnce(polyvError);

      try {
        await service.sendQa({ channelId: 1, questionId: 'q1' });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBe(polyvError);
      }
    });

    it('should convert Error instances to PolyVError', async () => {
      const error = new Error('Test error message');
      mockLiveInteraction.sendQuestion.mockRejectedValueOnce(error);

      try {
        await service.sendQa({ channelId: 1, questionId: 'q1' });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVError);
        expect((error as PolyVError).message).toBe('sendQa failed: Test error message');
      }
    });

    it('should convert non-Error values to PolyVError', async () => {
      mockLiveInteraction.sendQuestion.mockRejectedValueOnce('string error');

      try {
        await service.sendQa({ channelId: 1, questionId: 'q1' });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVError);
        expect((error as PolyVError).message).toBe('sendQa failed: string error');
      }
    });

    it('should convert number throws to PolyVError', async () => {
      mockLiveInteraction.sendQuestion.mockRejectedValueOnce(123);

      try {
        await service.sendQa({ channelId: 1, questionId: 'q1' });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVError);
        expect((error as PolyVError).message).toBe('sendQa failed: 123');
      }
    });

    it('should convert null throws to PolyVError', async () => {
      mockLiveInteraction.sendQuestion.mockRejectedValueOnce(null);

      try {
        await service.sendQa({ channelId: 1, questionId: 'q1' });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVError);
        expect((error as PolyVError).message).toBe('sendQa failed: null');
      }
    });

    it('should convert undefined throws to PolyVError', async () => {
      mockLiveInteraction.sendQuestion.mockRejectedValueOnce(undefined);

      try {
        await service.sendQa({ channelId: 1, questionId: 'q1' });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVError);
        expect((error as PolyVError).message).toBe('sendQa failed: undefined');
      }
    });

    it('should include originalError in context', async () => {
      const originalError = new Error('Original');
      mockLiveInteraction.sendQuestion.mockRejectedValueOnce(originalError);

      try {
        await service.sendQa({ channelId: 1, questionId: 'q1' });
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as PolyVError).context).toEqual({ originalError });
      }
    });
  });

  // ============================================
  // Question Type Tests
  // ============================================

  describe('question types in createQuestionnaire', () => {
    it('should handle all question types', async () => {
      mockLiveInteraction.addEditQuestionnaire.mockResolvedValue({ code: 200 });

      const questionTypes: Array<'R' | 'C' | 'Q' | 'J' | 'X'> = ['R', 'C', 'Q', 'J', 'X'];

      for (const type of questionTypes) {
        await service.createQuestionnaire({
          channelId: '3151318',
          title: 'Test',
          questions: [{ name: `Question ${type}`, type }],
        });
      }

      expect(mockLiveInteraction.addEditQuestionnaire).toHaveBeenCalledTimes(5);
    });

    it('should handle questions with all optional fields', async () => {
      mockLiveInteraction.addEditQuestionnaire.mockResolvedValueOnce({ code: 200 });

      const fullQuestion: QuestionnaireQuestionItem = {
        name: 'Full Question',
        type: 'C',
        options: ['A', 'B', 'C'],
        answer: 'A',
        scoreEnabled: 'Y',
        score: 10,
        required: 'Y',
      };

      await service.createQuestionnaire({
        channelId: '3151318',
        title: 'Test',
        questions: [fullQuestion],
      });

      expect(mockLiveInteraction.addEditQuestionnaire).toHaveBeenCalledWith(
        { channelId: '3151318' },
        expect.objectContaining({
          items: [expect.objectContaining({
            type: 'C',
            question: 'Full Question',
            options: ['A', 'B', 'C'],
            required: true,
          })],
        })
      );
    });
  });
});
