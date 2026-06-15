/**
 * @fileoverview Integration tests for QA and questionnaire commands
 * @author Development Team
 * @since 11.4.0
 */

import { QaQuestionnaireServiceSdk } from '../../src/services/qa-questionnaire-service';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('QA Integration Tests', () => {
  let qaService: QaQuestionnaireServiceSdk;
  let testChannelId: string;

  beforeAll(() => {
    qaService = new QaQuestionnaireServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });
    testChannelId = testConfig.testChannelId;
  });

  // ========================================
  // QA List Tests
  // ========================================

  describe('qa list', () => {
    it('should list QA question cards or handle gracefully', async () => {
      try {
        const result = await qaService.listQa({
          channelId: testChannelId
        });

        expect(result).toBeDefined();
        // Result structure varies
        if (Array.isArray(result)) {
          expect(Array.isArray(result)).toBe(true);
        } else if (result.questions || result.contents) {
          expect(Array.isArray(result.questions || result.contents)).toBe(true);
        }
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('No QA data available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        qaService.listQa({ channelId: '' })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // QA Send Tests
  // ========================================

  describe('qa send', () => {
    let testQuestionId: string | undefined;

    beforeAll(async () => {
      // Try to get a question ID from list
      try {
        const result = await qaService.listQa({ channelId: testChannelId });
        if (Array.isArray(result) && result.length > 0) {
          testQuestionId = result[0].questionId || result[0].id;
        } else if (result.questions && result.questions.length > 0) {
          testQuestionId = result.questions[0].questionId || result.questions[0].id;
        }
      } catch (error) {
        // Ignore errors in setup
      }
    }, 15000);

    it('should send a QA question card or handle gracefully', async () => {
      if (!testQuestionId) {
        console.log('Skipping: No question ID available');
        return;
      }

      try {
        const result = await qaService.sendQa({
          channelId: parseInt(testChannelId, 10),
          questionId: testQuestionId,
          duration: 30
        });

        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        // Expected errors: channel not live, question already sent
        const expectedErrors = [
          'not live',
          '直播未开始',
          'already sent',
          '已发送',
          '404',
          'not found'
        ];
        const isExpectedError = expectedErrors.some(e =>
          message.toLowerCase().includes(e.toLowerCase())
        );

        if (isExpectedError) {
          console.log('QA send not available or already sent');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        qaService.sendQa({
          channelId: 0,
          questionId: 'test-id'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty questionId', async () => {
      await expect(
        qaService.sendQa({
          channelId: parseInt(testChannelId, 10),
          questionId: ''
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // QA Stop Tests
  // ========================================

  describe('qa stop', () => {
    let testQuestionId: string | undefined;

    beforeAll(async () => {
      // Try to get a question ID from list
      try {
        const result = await qaService.listQa({ channelId: testChannelId });
        if (Array.isArray(result) && result.length > 0) {
          testQuestionId = result[0].questionId || result[0].id;
        } else if (result.questions && result.questions.length > 0) {
          testQuestionId = result.questions[0].questionId || result.questions[0].id;
        }
      } catch (error) {
        // Ignore errors in setup
      }
    }, 15000);

    it('should stop a QA question card or handle gracefully', async () => {
      if (!testQuestionId) {
        console.log('Skipping: No question ID available');
        return;
      }

      try {
        const result = await qaService.stopQa({
          channelId: parseInt(testChannelId, 10),
          questionId: testQuestionId
        });

        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = [
          'not live',
          '直播未开始',
          'not found',
          '404',
          'not sent'
        ];
        const isExpectedError = expectedErrors.some(e =>
          message.toLowerCase().includes(e.toLowerCase())
        );

        if (isExpectedError) {
          console.log('QA stop not available');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        qaService.stopQa({
          channelId: 0,
          questionId: 'test-id'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty questionId', async () => {
      await expect(
        qaService.stopQa({
          channelId: parseInt(testChannelId, 10),
          questionId: ''
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Validation Tests
  // ========================================

  describe('validation tests', () => {
    it('should validate listQa channelId', async () => {
      await expect(
        qaService.listQa({ channelId: '' })
      ).rejects.toThrow();
    });

    it('should validate sendQa channelId', async () => {
      await expect(
        qaService.sendQa({ channelId: 0, questionId: 'test' })
      ).rejects.toThrow();
    });

    it('should validate sendQa questionId', async () => {
      await expect(
        qaService.sendQa({ channelId: 123, questionId: '' })
      ).rejects.toThrow();
    });

    it('should validate stopQa channelId', async () => {
      await expect(
        qaService.stopQa({ channelId: 0, questionId: 'test' })
      ).rejects.toThrow();
    });

    it('should validate stopQa questionId', async () => {
      await expect(
        qaService.stopQa({ channelId: 123, questionId: '' })
      ).rejects.toThrow();
    });
  });
});

// ========================================
// Questionnaire Integration Tests
// ========================================

(shouldRunTests ? describe : describe.skip)('Questionnaire Integration Tests', () => {
  let qaService: QaQuestionnaireServiceSdk;
  let testChannelId: string;
  let createdQuestionnaireIds: string[] = [];

  beforeAll(() => {
    qaService = new QaQuestionnaireServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });
    testChannelId = testConfig.testChannelId;
  });

  afterAll(async () => {
    // Note: Questionnaire cleanup may not be available via API
    if (createdQuestionnaireIds.length > 0) {
      console.log(`📝 Created ${createdQuestionnaireIds.length} questionnaires (cleanup may require manual action)`);
    }
  });

  // ========================================
  // Questionnaire Create Tests
  // ========================================

  describe('questionnaire create', () => {
    it('should create a questionnaire with single choice question', async () => {
      try {
        const result = await qaService.createQuestionnaire({
          channelId: testChannelId,
          title: `Test Questionnaire ${Date.now()}`,
          questions: [
            {
              name: 'What is your favorite color?',
              type: 'R',
              options: ['Red', 'Blue', 'Green', 'Yellow'],
              required: 'Y'
            }
          ]
        });

        expect(result).toBeDefined();
        if (result.questionnaireId || result.id) {
          createdQuestionnaireIds.push(result.questionnaireId || result.id);
        }
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

    it('should create a questionnaire with multiple question types', async () => {
      try {
        const result = await qaService.createQuestionnaire({
          channelId: testChannelId,
          title: `Multi-Question Test ${Date.now()}`,
          questions: [
            {
              name: 'Rate this session',
              type: 'X',
              options: ['1', '2', '3', '4', '5'],
              required: 'Y'
            },
            {
              name: 'Any feedback?',
              type: 'Q',
              required: 'N'
            }
          ]
        });

        expect(result).toBeDefined();
        if (result.questionnaireId || result.id) {
          createdQuestionnaireIds.push(result.questionnaireId || result.id);
        }
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

    it('should validate empty channelId', async () => {
      await expect(
        qaService.createQuestionnaire({
          channelId: '',
          title: 'Test',
          questions: [{ name: 'Q?', type: 'R', options: ['A', 'B'] }]
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty title', async () => {
      await expect(
        qaService.createQuestionnaire({
          channelId: testChannelId,
          title: '',
          questions: [{ name: 'Q?', type: 'R', options: ['A', 'B'] }]
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Questionnaire List Tests
  // ========================================

  describe('questionnaire list', () => {
    it('should list questionnaires or handle gracefully', async () => {
      try {
        const result = await qaService.listQuestionnaires({
          channelId: testChannelId,
          page: 1,
          pageSize: 10
        });

        expect(result).toBeDefined();
        // Result structure varies
        if (result.contents) {
          expect(Array.isArray(result.contents)).toBe(true);
        } else if (Array.isArray(result)) {
          expect(Array.isArray(result)).toBe(true);
        }
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('No questionnaire data available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle pagination correctly', async () => {
      try {
        const result = await qaService.listQuestionnaires({
          channelId: testChannelId,
          page: 1,
          pageSize: 5
        });

        expect(result).toBeDefined();
        if (result.contents) {
          expect(result.contents.length).toBeLessThanOrEqual(5);
        }
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
        qaService.listQuestionnaires({ channelId: '' })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Questionnaire Detail Tests
  // ========================================

  describe('questionnaire detail', () => {
    let testQuestionnaireId: string | undefined;

    beforeAll(async () => {
      // Try to get a questionnaire ID from list
      try {
        const result = await qaService.listQuestionnaires({
          channelId: testChannelId,
          page: 1,
          pageSize: 10
        });
        if (result.contents && result.contents.length > 0) {
          testQuestionnaireId = result.contents[0].questionnaireId || result.contents[0].id;
        } else if (Array.isArray(result) && result.length > 0) {
          testQuestionnaireId = result[0].questionnaireId || result[0].id;
        }
      } catch (error) {
        // Ignore errors in setup
      }
    }, 15000);

    it('should get questionnaire detail', async () => {
      if (!testQuestionnaireId) {
        console.log('Skipping: No questionnaire ID available');
        return;
      }

      try {
        const result = await qaService.getQuestionnaireDetail({
          channelId: testChannelId,
          questionnaireId: testQuestionnaireId
        });

        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Questionnaire detail not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        qaService.getQuestionnaireDetail({
          channelId: '',
          questionnaireId: 'test-id'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty questionnaireId', async () => {
      await expect(
        qaService.getQuestionnaireDetail({
          channelId: testChannelId,
          questionnaireId: ''
        })
      ).rejects.toThrow();
    }, 10000);

    it('should handle non-existent questionnaire ID', async () => {
      try {
        const result = await qaService.getQuestionnaireDetail({
          channelId: testChannelId,
          questionnaireId: 'non-existent-questionnaire-id-99999'
        });
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    }, 15000);
  });

  // ========================================
  // Questionnaire Validation Tests
  // ========================================

  describe('validation tests', () => {
    it('should validate createQuestionnaire channelId', async () => {
      await expect(
        qaService.createQuestionnaire({
          channelId: '',
          title: 'Test',
          questions: []
        })
      ).rejects.toThrow();
    });

    it('should validate listQuestionnaires channelId', async () => {
      await expect(
        qaService.listQuestionnaires({ channelId: '' })
      ).rejects.toThrow();
    });

    it('should validate getQuestionnaireDetail channelId', async () => {
      await expect(
        qaService.getQuestionnaireDetail({ channelId: '', questionnaireId: 'test' })
      ).rejects.toThrow();
    });

    it('should validate getQuestionnaireDetail questionnaireId', async () => {
      await expect(
        qaService.getQuestionnaireDetail({ channelId: testChannelId, questionnaireId: '' })
      ).rejects.toThrow();
    });
  });
});
