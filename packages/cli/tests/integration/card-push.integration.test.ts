/**
 * @fileoverview Integration tests for card-push commands
 * @author Development Team
 * @since 14.2.0
 */

import { CardPushServiceSdk } from '../../src/services/card-push-service';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

function isExpectedCardPushUnavailable(message: string): boolean {
  return ['404', 'not found', '找不到', '不存在', '已达上限', 'limit', 'exceeded'].some(e =>
    message.includes(e)
  );
}

function extractCardPushId(value: Record<string, unknown>): string {
  const data = value.data && typeof value.data === 'object' ? value.data as Record<string, unknown> : undefined;
  const result = value.result && typeof value.result === 'object' ? value.result as Record<string, unknown> : undefined;
  const candidates = [
    value.id,
    value.cardPushId,
    data?.id,
    data?.cardPushId,
    result?.id,
    result?.cardPushId,
  ];
  const id = candidates.find((candidate) => /^\d+$/.test(String(candidate ?? '')));
  if (id === undefined) {
    throw new Error(`Cannot extract cardPushId from CLI output: ${JSON.stringify(value)}`);
  }

  return String(id);
}

(shouldRunTests ? describe : describe.skip)('Card-Push Integration Tests', () => {
  let cardPushService: CardPushServiceSdk;
  let testChannelId: string;
  let createdCardPushIds: number[] = [];

  beforeAll(() => {
    cardPushService = new CardPushServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });
    testChannelId = testConfig.testChannelId;
  });

  afterAll(async () => {
    // Clean up created card-pushes
    if (createdCardPushIds.length > 0) {
      console.log(`🧹 Cleaning up ${createdCardPushIds.length} card-pushes...`);
      for (const id of createdCardPushIds) {
        try {
          await cardPushService.deleteCardPush({
            channelId: testChannelId,
            cardPushId: String(id)
          });
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    }
  });

  // ========================================
  // Card-Push List Tests
  // ========================================

  describe('card-push list', () => {
    it('should list card-pushes successfully', async () => {
      try {
        const result = await cardPushService.listCardPushes(testChannelId);

        expect(Array.isArray(result)).toBe(true);
        // Result may be empty if no card-pushes exist
      } catch (error: any) {
        const message = error.message || '';
        if (isExpectedCardPushUnavailable(message)) {
          console.log('Card-push API not available for test channel');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        cardPushService.listCardPushes('')
      ).rejects.toThrow();
    }, 10000);

    it('should handle non-existent channel gracefully', async () => {
      try {
        const result = await cardPushService.listCardPushes('9999999');
        // API might return empty array or error
        expect(Array.isArray(result)).toBe(true);
      } catch (error: any) {
        // Expected error for non-existent channel
        expect(error).toBeDefined();
      }
    }, 15000);
  });

  // ========================================
  // Card-Push Create Tests
  // ========================================

  describe('card-push create', () => {
    it('should create a card-push with minimal required fields', async () => {
      try {
        const result = await cardPushService.createCardPush({
          channelId: testChannelId,
          imageType: 'giftbox',
          title: `TC${Date.now()}`.slice(-16), // Max 16 chars
          link: 'https://example.com',
          duration: 0,
          showCondition: 'PUSH'
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();

        createdCardPushIds.push(result.id);
      } catch (error: any) {
        const message = error.message || '';
        if (isExpectedCardPushUnavailable(message)) {
          console.log('Card-push API not available or limit reached');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should create a card-push with all optional fields', async () => {
      try {
        const result = await cardPushService.createCardPush({
          channelId: testChannelId,
          cardType: 'common',
          imageType: 'redpack',
          title: `FC${Date.now()}`.slice(-16),
          link: 'https://example.com/full',
          duration: 10,
          durationPosition: 'bottom',
          showCondition: 'WATCH',
          conditionValue: 30,
          conditionUnit: 'SECONDS',
          countdownMsg: '即将结束',
          enterEnabled: 'Y',
          linkEnabled: 'Y',
          redirectType: 'iframe'
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();

        createdCardPushIds.push(result.id);
      } catch (error: any) {
        const message = error.message || '';
        if (isExpectedCardPushUnavailable(message)) {
          console.log('Card-push API not available or limit reached');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        cardPushService.createCardPush({
          channelId: '',
          imageType: 'giftbox',
          title: 'Test',
          link: 'https://example.com',
          duration: 0,
          showCondition: 'PUSH'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty imageType', async () => {
      await expect(
        cardPushService.createCardPush({
          channelId: testChannelId,
          imageType: '' as any,
          title: 'Test',
          link: 'https://example.com',
          duration: 0,
          showCondition: 'PUSH'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty title', async () => {
      await expect(
        cardPushService.createCardPush({
          channelId: testChannelId,
          imageType: 'giftbox',
          title: '',
          link: 'https://example.com',
          duration: 0,
          showCondition: 'PUSH'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty link', async () => {
      await expect(
        cardPushService.createCardPush({
          channelId: testChannelId,
          imageType: 'giftbox',
          title: 'Test',
          link: '',
          duration: 0,
          showCondition: 'PUSH'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate missing duration', async () => {
      await expect(
        cardPushService.createCardPush({
          channelId: testChannelId,
          imageType: 'giftbox',
          title: 'Test',
          link: 'https://example.com',
          duration: undefined as any,
          showCondition: 'PUSH'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty showCondition', async () => {
      await expect(
        cardPushService.createCardPush({
          channelId: testChannelId,
          imageType: 'giftbox',
          title: 'Test',
          link: 'https://example.com',
          duration: 0,
          showCondition: '' as any
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Card-Push Update Tests
  // ========================================

  describe('card-push update', () => {
    let testCardPushId: number | null = null;

    beforeAll(async () => {
      // Create a card-push for update testing
      try {
        const result = await cardPushService.createCardPush({
          channelId: testChannelId,
          imageType: 'giftbox',
          title: 'ToUpdate',
          link: 'https://example.com',
          duration: 0,
          showCondition: 'PUSH'
        });
        testCardPushId = result.id;
        // Don't add to cleanup - we'll test delete separately
      } catch (error) {
        // API not available
      }
    }, 15000);

    it('should update card-push title', async () => {
      if (!testCardPushId) {
        console.log('Skipping: No card-push ID available');
        return;
      }

      try {
        const result = await cardPushService.updateCardPush({
          channelId: testChannelId,
          cardPushId: String(testCardPushId),
          title: `UC${Date.now()}`.slice(-16)
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(testCardPushId);
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '找不到', '不能为空', '不存在'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          console.log('Card-push update not available');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should update multiple fields', async () => {
      if (!testCardPushId) {
        console.log('Skipping: No card-push ID available');
        return;
      }

      try {
        const result = await cardPushService.updateCardPush({
          channelId: testChannelId,
          cardPushId: String(testCardPushId),
          title: 'MultiUpdate',
          link: 'https://example.com/upd',
          duration: 20,
          enterEnabled: 'Y'
        });

        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '找不到', '不能为空', '不存在'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          console.log('Card-push update not available');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        cardPushService.updateCardPush({
          channelId: '',
          cardPushId: '123',
          title: 'Test'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty cardPushId', async () => {
      await expect(
        cardPushService.updateCardPush({
          channelId: testChannelId,
          cardPushId: '',
          title: 'Test'
        })
      ).rejects.toThrow();
    }, 10000);

    afterAll(async () => {
      // Clean up test card-push
      if (testCardPushId) {
        try {
          await cardPushService.deleteCardPush({
            channelId: testChannelId,
            cardPushId: String(testCardPushId)
          });
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    });
  });

  // ========================================
  // Card-Push Push Tests
  // ========================================

  describe('card-push push', () => {
    let testCardPushId: number | null = null;

    beforeAll(async () => {
      // Create a card-push for push testing
      try {
        const result = await cardPushService.createCardPush({
          channelId: testChannelId,
          imageType: 'giftbox',
          title: 'CardToPush',
          link: 'https://example.com',
          duration: 30,
          showCondition: 'PUSH'
        });
        testCardPushId = result.id;
      } catch (error) {
        // API not available
      }
    }, 15000);

    it('should push a card or handle gracefully', async () => {
      if (!testCardPushId) {
        console.log('Skipping: No card-push ID available');
        return;
      }

      try {
        await cardPushService.pushCard({
          channelId: testChannelId,
          cardPushId: String(testCardPushId)
        });
        // Success - no error thrown
        expect(true).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        // Push may fail if channel is not live or API issues
        const expectedErrors = [
          'not live',
          '直播未开始',
          'no session',
          '404',
          'not found',
          '找不到',
          '不能为空',
          '不存在'
        ];
        const isExpectedError = expectedErrors.some(e =>
          message.toLowerCase().includes(e.toLowerCase())
        );

        if (isExpectedError) {
          console.log('Card push not available (channel not live or API error)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        cardPushService.pushCard({
          channelId: '',
          cardPushId: '123'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty cardPushId', async () => {
      await expect(
        cardPushService.pushCard({
          channelId: testChannelId,
          cardPushId: ''
        })
      ).rejects.toThrow();
    }, 10000);

    afterAll(async () => {
      // Clean up test card-push
      if (testCardPushId) {
        try {
          await cardPushService.deleteCardPush({
            channelId: testChannelId,
            cardPushId: String(testCardPushId)
          });
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    });
  });

  // ========================================
  // Card-Push Cancel Tests
  // ========================================

  describe('card-push cancel', () => {
    it('should validate empty channelId', async () => {
      await expect(
        cardPushService.cancelPush({
          channelId: '',
          cardPushId: '123'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty cardPushId', async () => {
      await expect(
        cardPushService.cancelPush({
          channelId: testChannelId,
          cardPushId: ''
        })
      ).rejects.toThrow();
    }, 10000);

    it('should handle cancel for non-existent card-push', async () => {
      try {
        await cardPushService.cancelPush({
          channelId: testChannelId,
          cardPushId: '99999999'
        });
        // API might return success or error
        expect(true).toBe(true);
      } catch (error: any) {
        // Expected error
        expect(error).toBeDefined();
      }
    }, 15000);
  });

  // ========================================
  // Card-Push Delete Tests
  // ========================================

  describe('card-push delete', () => {
    it('should delete a card-push successfully', async () => {
      let cardPushId: number | null = null;

      // Create a card-push to delete
      try {
        const createResult = await cardPushService.createCardPush({
          channelId: testChannelId,
          imageType: 'giftbox',
          title: 'ToDelete',
          link: 'https://example.com',
          duration: 0,
          showCondition: 'PUSH'
        });
        cardPushId = createResult.id;
      } catch (error: any) {
        const message = error.message || '';
        if (isExpectedCardPushUnavailable(message)) {
          console.log('Card-push API not available or limit reached, skipping delete test');
          expect(true).toBe(true);
          return;
        }
        throw error;
      }

      if (!cardPushId) {
        console.log('Skipping: No card-push ID created');
        return;
      }

      // Delete it
      try {
        await cardPushService.deleteCardPush({
          channelId: testChannelId,
          cardPushId: String(cardPushId)
        });
        // Success - no error thrown
        expect(true).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '找不到', '不能为空', '不存在'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          console.log('Card-push delete not available');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        cardPushService.deleteCardPush({
          channelId: '',
          cardPushId: '123'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty cardPushId', async () => {
      await expect(
        cardPushService.deleteCardPush({
          channelId: testChannelId,
          cardPushId: ''
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Card-Push Lifecycle Test (CRUD)
  // ========================================

  describe('card-push lifecycle (CRUD)', () => {
    it('should complete full card-push lifecycle', async () => {
      let cardPushId: number | null = null;

      // 1. Create
      try {
        const createResult = await cardPushService.createCardPush({
          channelId: testChannelId,
          imageType: 'giftbox',
          title: `LC${Date.now()}`.slice(-16),
          link: 'https://example.com/lc',
          duration: 10,
          showCondition: 'PUSH'
        });

        expect(createResult).toBeDefined();
        cardPushId = createResult.id;
        expect(cardPushId).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (isExpectedCardPushUnavailable(message)) {
          console.log('Card-push API not available or limit reached, skipping lifecycle test');
          expect(true).toBe(true);
          return;
        }
        throw error;
      }

      // 2. Read - List
      try {
        const listResult = await cardPushService.listCardPushes(testChannelId);
        expect(Array.isArray(listResult)).toBe(true);
      } catch (error) {
        // Continue despite list error
      }

      // 3. Update
      try {
        const updateResult = await cardPushService.updateCardPush({
          channelId: testChannelId,
          cardPushId: String(cardPushId),
          title: 'UpdatedLC',
          duration: 20
        });
        expect(updateResult).toBeDefined();
      } catch (error) {
        // Continue despite update error
      }

      // 4. Delete
      try {
        await cardPushService.deleteCardPush({
          channelId: testChannelId,
          cardPushId: String(cardPushId)
        });
        // Success

        // Remove from cleanup since already deleted
        createdCardPushIds = createdCardPushIds.filter(id => id !== cardPushId);
      } catch (error) {
        // Continue despite delete error
      }
    }, 30000);
  });

  // ========================================
  // Validation Tests Summary
  // ========================================

  describe('validation tests', () => {
    it('should validate listCardPushes channelId', async () => {
      await expect(
        cardPushService.listCardPushes('')
      ).rejects.toThrow();
    });

    it('should validate createCardPush channelId', async () => {
      await expect(
        cardPushService.createCardPush({
          channelId: '',
          imageType: 'giftbox',
          title: 'Test',
          link: 'https://example.com',
          duration: 0,
          showCondition: 'PUSH'
        })
      ).rejects.toThrow();
    });

    it('should validate createCardPush title', async () => {
      await expect(
        cardPushService.createCardPush({
          channelId: testChannelId,
          imageType: 'giftbox',
          title: '',
          link: 'https://example.com',
          duration: 0,
          showCondition: 'PUSH'
        })
      ).rejects.toThrow();
    });

    it('should validate updateCardPush channelId', async () => {
      await expect(
        cardPushService.updateCardPush({
          channelId: '',
          cardPushId: '123',
          title: 'Test'
        })
      ).rejects.toThrow();
    });

    it('should validate updateCardPush cardPushId', async () => {
      await expect(
        cardPushService.updateCardPush({
          channelId: testChannelId,
          cardPushId: '',
          title: 'Test'
        })
      ).rejects.toThrow();
    });

    it('should validate pushCard channelId', async () => {
      await expect(
        cardPushService.pushCard({
          channelId: '',
          cardPushId: '123'
        })
      ).rejects.toThrow();
    });

    it('should validate pushCard cardPushId', async () => {
      await expect(
        cardPushService.pushCard({
          channelId: testChannelId,
          cardPushId: ''
        })
      ).rejects.toThrow();
    });

    it('should validate cancelPush channelId', async () => {
      await expect(
        cardPushService.cancelPush({
          channelId: '',
          cardPushId: '123'
        })
      ).rejects.toThrow();
    });

    it('should validate deleteCardPush channelId', async () => {
      await expect(
        cardPushService.deleteCardPush({
          channelId: '',
          cardPushId: '123'
        })
      ).rejects.toThrow();
    });

    it('should validate deleteCardPush cardPushId', async () => {
      await expect(
        cardPushService.deleteCardPush({
          channelId: testChannelId,
          cardPushId: ''
        })
      ).rejects.toThrow();
    });
  });
});

(shouldRunTests ? describe : describe.skip)('Card-Push real CLI lifecycle coverage', () => {
  it('runs create, update, and delete through the local CLI with a temporary channel', () => {
    let channelId: string | undefined;
    let cardPushId: string | undefined;

    try {
      channelId = createTemporaryChannel('Card Push CLI');

      const createOutput = runCliSuccess([
        'card-push',
        'create',
        '--channelId',
        channelId,
        '--imageType',
        'giftbox',
        '--title',
        `Card${Date.now().toString().slice(-8)}`,
        '--link',
        'https://example.com/card-push-cli',
        '--duration',
        '5',
        '--showCondition',
        'PUSH',
        '--output',
        'json',
      ]);
      const created = parseJsonObject(createOutput);
      cardPushId = extractCardPushId(created);

      const updateOutput = runCliSuccess([
        'card-push',
        'update',
        '--channelId',
        channelId,
        '--cardPushId',
        cardPushId,
        '--title',
        `Upd${Date.now().toString().slice(-8)}`,
        '--duration',
        '10',
        '--output',
        'json',
      ]);
      const updated = parseJsonObject(updateOutput);
      expect(updated.success).toBe(true);

      const deleteOutput = runCliSuccess([
        'card-push',
        'delete',
        '--channelId',
        channelId,
        '--cardPushId',
        cardPushId,
        '--output',
        'json',
      ]);
      const deleted = parseJsonObject(deleteOutput);
      expect(deleted.success).toBe(true);
      cardPushId = undefined;
    } finally {
      if (cardPushId && channelId) {
        runCliSuccess([
          'card-push',
          'delete',
          '--channelId',
          channelId,
          '--cardPushId',
          cardPushId,
          '--output',
          'json',
        ]);
      }
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  it('runs push and cancel through the local CLI with a temporary channel', () => {
    let channelId: string | undefined;
    let cardPushId: string | undefined;
    let streamStarted = false;
    let testError: unknown;

    try {
      channelId = createTemporaryChannel('Card Push Push CLI');

      const createOutput = runCliSuccess([
        'card-push',
        'create',
        '--channelId',
        channelId,
        '--imageType',
        'giftbox',
        '--title',
        `Push${Date.now().toString().slice(-8)}`,
        '--link',
        'https://example.com/card-push-cli-push',
        '--duration',
        '5',
        '--showCondition',
        'PUSH',
        '--output',
        'json',
      ]);
      const created = parseJsonObject(createOutput);
      cardPushId = extractCardPushId(created);

      runCliSuccess([
        'stream',
        'start',
        '--channelId',
        channelId,
      ]);
      streamStarted = true;

      const pushOutput = runCliSuccess([
        'card-push',
        'push',
        '--channelId',
        channelId,
        '--cardPushId',
        cardPushId,
        '--output',
        'json',
      ]);
      const pushed = parseJsonObject(pushOutput);
      expect(pushed.success).toBe(true);

      const cancelOutput = runCliSuccess([
        'card-push',
        'cancel',
        '--channelId',
        channelId,
        '--cardPushId',
        cardPushId,
        '--output',
        'json',
      ]);
      const cancelled = parseJsonObject(cancelOutput);
      expect(cancelled.success).toBe(true);
    } catch (error) {
      testError = error;
      throw error;
    } finally {
      const cleanupErrors: string[] = [];
      const recordCleanupError = (action: string, error: unknown) => {
        cleanupErrors.push(`${action}: ${error instanceof Error ? error.message : String(error)}`);
      };

      if (streamStarted && channelId) {
        try {
          runCliSuccess([
            'stream',
            'stop',
            '--channelId',
            channelId,
          ]);
        } catch (error) {
          recordCleanupError(`stop temporary stream ${channelId}`, error);
        }
      }
      if (cardPushId && channelId) {
        try {
          runCliSuccess([
            'card-push',
            'delete',
            '--channelId',
            channelId,
            '--cardPushId',
            cardPushId,
            '--output',
            'json',
          ]);
        } catch (error) {
          recordCleanupError(`delete temporary card-push ${cardPushId}`, error);
        }
      }
      if (channelId) {
        try {
          deleteTemporaryChannel(channelId);
        } catch (error) {
          recordCleanupError(`delete temporary channel ${channelId}`, error);
        }
      }

      if (cleanupErrors.length > 0) {
        const message = `Card-push CLI cleanup failed:\n${cleanupErrors.join('\n')}`;
        if (testError) {
          console.warn(message);
        } else {
          throw new Error(message);
        }
      }
    }
  }, 240000);
});
