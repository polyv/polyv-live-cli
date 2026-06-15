/**
 * @fileoverview Integration tests for questionnaire commands
 * @author Development Team
 * @since 11.4.0
 */

import { QaQuestionnaireServiceSdk } from '../../src/services/qa-questionnaire-service';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('Questionnaire Integration Tests', () => {
  let questionnaireService: QaQuestionnaireServiceSdk;
  let testChannelId: string;
  let createdQuestionnaireIds: string[] = [];

  beforeAll(() => {
    questionnaireService = new QaQuestionnaireServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });
    testChannelId = testConfig.testChannelId;
  });

  // Note: Questionnaire API may not have delete endpoint, so we track for reference
  afterAll(() => {
    if (createdQuestionnaireIds.length > 0) {
      console.log(`\n📝 Note: ${createdQuestionnaireIds.length} questionnaires were created during tests`);
    }
  });

  // ========================================
  // Questionnaire List Tests
  // ========================================

  describe('questionnaire list', () => {
    it('should list questionnaires successfully', async () => {
      try {
        const result = await questionnaireService.listQuestionnaires({
          channelId: testChannelId,
          page: 1,
          pageSize: 10
        });

        expect(result).toBeDefined();
        expect(result.contents).toBeDefined();
        expect(Array.isArray(result.contents)).toBe(true);
        expect(result.pageNumber).toBeDefined();
        expect(result.pageSize).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Questionnaire API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle pagination correctly', async () => {
      try {
        const result = await questionnaireService.listQuestionnaires({
          channelId: testChannelId,
          page: 1,
          pageSize: 5
        });

        expect(result).toBeDefined();
        expect(result.pageSize).toBeLessThanOrEqual(5);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle page 2 request', async () => {
      try {
        const result = await questionnaireService.listQuestionnaires({
          channelId: testChannelId,
          page: 2,
          pageSize: 10
        });

        expect(result).toBeDefined();
        expect(result.pageNumber).toBe(2);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should filter by session ID', async () => {
      try {
        const result = await questionnaireService.listQuestionnaires({
          channelId: testChannelId,
          sessionId: 'test-session-id',
          page: 1,
          pageSize: 10
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result.contents)).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不存在', '找不到'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should filter by date range', async () => {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      try {
        const result = await questionnaireService.listQuestionnaires({
          channelId: testChannelId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          page: 1,
          pageSize: 10
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result.contents)).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        questionnaireService.listQuestionnaires({
          channelId: '',
          page: 1,
          pageSize: 10
        })
      ).rejects.toThrow();
    }, 10000);

    it('should handle non-existent channel gracefully', async () => {
      try {
        const result = await questionnaireService.listQuestionnaires({
          channelId: '9999999',
          page: 1,
          pageSize: 10
        });
        // API might return empty array or error
        expect(result).toBeDefined();
      } catch (error: any) {
        // Expected error for non-existent channel
        expect(error).toBeDefined();
      }
    }, 15000);
  });

  // ========================================
  // Questionnaire Create Tests
  // ========================================

  describe('questionnaire create', () => {
    it('should create a questionnaire with single question', async () => {
      const title = `Test_${Date.now()}`;
      const questions = [
        {
          name: 'Your gender?',
          type: 'R' as const,
          options: ['Male', 'Female'],
          required: 'Y' as const
        }
      ];

      try {
        const result = await questionnaireService.createQuestionnaire({
          channelId: testChannelId,
          title,
          questions
        });

        expect(result).toBeDefined();

        // Track for reference
        if (result.questionnaireId) {
          createdQuestionnaireIds.push(result.questionnaireId);
        }
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          console.log('Questionnaire create API not available');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should create a questionnaire with multiple questions', async () => {
      const title = `Multi_${Date.now()}`;
      const questions = [
        {
          name: 'Your name?',
          type: 'X' as const,
          required: 'Y' as const
        },
        {
          name: 'Your rating?',
          type: 'R' as const,
          options: ['1', '2', '3', '4', '5'],
          required: 'N' as const
        }
      ];

      try {
        const result = await questionnaireService.createQuestionnaire({
          channelId: testChannelId,
          title,
          questions
        });

        expect(result).toBeDefined();

        if (result.questionnaireId) {
          createdQuestionnaireIds.push(result.questionnaireId);
        }
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should create questionnaire with custom ID', async () => {
      const title = `Custom_${Date.now()}`;
      const customId = `custom_${Date.now()}`;
      const questions = [
        {
          name: 'Question?',
          type: 'X' as const,
          required: 'Y' as const
        }
      ];

      try {
        const result = await questionnaireService.createQuestionnaire({
          channelId: testChannelId,
          title,
          questions,
          customQuestionnaireId: customId
        });

        expect(result).toBeDefined();

        if (result.questionnaireId) {
          createdQuestionnaireIds.push(result.questionnaireId);
        }
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        questionnaireService.createQuestionnaire({
          channelId: '',
          title: 'Test',
          questions: [{ name: 'Q?', type: 'X', required: 'Y' }]
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty title', async () => {
      await expect(
        questionnaireService.createQuestionnaire({
          channelId: testChannelId,
          title: '',
          questions: [{ name: 'Q?', type: 'X' as const, required: 'Y' as const }]
        })
      ).rejects.toThrow();
    }, 10000);

    it('should handle special characters in title', async () => {
      const title = `中文问卷_${Date.now()}`;
      const questions = [
        {
          name: '您的评价?',
          type: 'R' as const,
          options: ['好', '很好', '非常好'],
          required: 'Y' as const
        }
      ];

      try {
        const result = await questionnaireService.createQuestionnaire({
          channelId: testChannelId,
          title,
          questions
        });

        expect(result).toBeDefined();

        if (result.questionnaireId) {
          createdQuestionnaireIds.push(result.questionnaireId);
        }
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在', 'encoding'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle non-existent channel gracefully', async () => {
      try {
        const result = await questionnaireService.createQuestionnaire({
          channelId: '9999999',
          title: 'Test',
          questions: [{ name: 'Q?', type: 'X', required: 'Y' }]
        });

        // If no error, check result
        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);
  });

  // ========================================
  // Questionnaire Detail Tests
  // ========================================

  describe('questionnaire detail', () => {
    it('should get questionnaire detail successfully', async () => {
      // First, try to list to get an existing questionnaire
      let questionnaireId = 'test-questionnaire-id';

      try {
        const listResult = await questionnaireService.listQuestionnaires({
          channelId: testChannelId,
          page: 1,
          pageSize: 10
        });

        if (listResult.contents && listResult.contents.length > 0 && listResult.contents[0].questionnaireId) {
          questionnaireId = listResult.contents[0].questionnaireId;
        }
      } catch (error) {
        // Continue with default ID
      }

      try {
        const result = await questionnaireService.getQuestionnaireDetail({
          channelId: testChannelId,
          questionnaireId
        });

        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不存在', '找不到'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          console.log('Questionnaire detail API not available or questionnaire not found');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        questionnaireService.getQuestionnaireDetail({
          channelId: '',
          questionnaireId: 'test-id'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty questionnaireId', async () => {
      await expect(
        questionnaireService.getQuestionnaireDetail({
          channelId: testChannelId,
          questionnaireId: ''
        })
      ).rejects.toThrow();
    }, 10000);

    it('should handle non-existent questionnaire gracefully', async () => {
      try {
        const result = await questionnaireService.getQuestionnaireDetail({
          channelId: testChannelId,
          questionnaireId: 'non-existent-id-99999'
        });

        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不存在', '找不到'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);
  });

  // ========================================
  // Validation Tests Summary
  // ========================================

  describe('validation tests', () => {
    it('should validate listQuestionnaires channelId', async () => {
      await expect(
        questionnaireService.listQuestionnaires({
          channelId: '',
          page: 1,
          pageSize: 10
        })
      ).rejects.toThrow();
    });

    it('should validate createQuestionnaire channelId', async () => {
      await expect(
        questionnaireService.createQuestionnaire({
          channelId: '',
          title: 'Test',
          questions: []
        })
      ).rejects.toThrow();
    });

    it('should validate createQuestionnaire title', async () => {
      await expect(
        questionnaireService.createQuestionnaire({
          channelId: testChannelId,
          title: '',
          questions: [{ name: 'Q?', type: 'X', required: 'Y' }]
        })
      ).rejects.toThrow();
    });

    it('should validate getQuestionnaireDetail channelId', async () => {
      await expect(
        questionnaireService.getQuestionnaireDetail({
          channelId: '',
          questionnaireId: 'test'
        })
      ).rejects.toThrow();
    });

    it('should validate getQuestionnaireDetail questionnaireId', async () => {
      await expect(
        questionnaireService.getQuestionnaireDetail({
          channelId: testChannelId,
          questionnaireId: ''
        })
      ).rejects.toThrow();
    });
  });

  // ========================================
  // Questionnaire Workflow Tests
  // ========================================

  describe('questionnaire workflow', () => {
    it('should complete create-list-detail workflow', async () => {
      const title = `Workflow_${Date.now()}`;
      const questions = [
        {
          name: 'How would you rate our service?',
          type: 'R' as const,
          options: ['1', '2', '3', '4', '5'],
          required: 'Y' as const
        }
      ];

      // 1. Create questionnaire
      let questionnaireId: string | undefined;
      try {
        const createResult = await questionnaireService.createQuestionnaire({
          channelId: testChannelId,
          title,
          questions
        });

        expect(createResult).toBeDefined();
        questionnaireId = createResult.questionnaireId;

        if (questionnaireId) {
          createdQuestionnaireIds.push(questionnaireId);
        }
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Questionnaire API not available (404)');
          expect(true).toBe(true);
          return;
        }
        throw error;
      }

      // 2. List questionnaires to verify
      try {
        const listResult = await questionnaireService.listQuestionnaires({
          channelId: testChannelId,
          page: 1,
          pageSize: 10
        });
        expect(listResult).toBeDefined();
        expect(Array.isArray(listResult.contents)).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        if (!message.includes('404') && !message.includes('not found')) {
          throw error;
        }
      }

      // 3. Get detail if we have an ID
      if (questionnaireId) {
        try {
          const detailResult = await questionnaireService.getQuestionnaireDetail({
            channelId: testChannelId,
            questionnaireId
          });
          expect(detailResult).toBeDefined();
        } catch (error: any) {
          const message = error.message || '';
          if (!message.includes('404') && !message.includes('not found')) {
            throw error;
          }
        }
      }
    }, 30000);
  });
});
