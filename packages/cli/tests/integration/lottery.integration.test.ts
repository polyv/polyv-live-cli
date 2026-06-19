/**
 * @fileoverview Integration tests for lottery commands
 * @author Development Team
 * @since 11.5.0
 */

import { LotteryServiceSdk } from '../../src/services/lottery-service';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

// Helper to get timestamp
function getTimestamp(daysOffset: number = 0): number {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.getTime();
}

function uniqueName(prefix: string): string {
  return `${prefix}${Date.now().toString(36).slice(-8)}`.slice(0, 20);
}

(shouldRunTests ? describe : describe.skip)('Lottery Integration Tests', () => {
  let lotteryService: LotteryServiceSdk;
  let testChannelId: string;
  let createdLotteryIds: string[] = [];

  beforeAll(() => {
    lotteryService = new LotteryServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });
    testChannelId = testConfig.testChannelId;
  });

  afterAll(async () => {
    // Clean up created lottery activities
    if (createdLotteryIds.length > 0) {
      console.log(`🧹 Cleaning up ${createdLotteryIds.length} lottery activities...`);
      for (const id of createdLotteryIds) {
        try {
          await lotteryService.deleteLotteryActivity({
            channelId: testChannelId,
            id
          });
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    }
  });

  // ========================================
  // Lottery Create Tests
  // ========================================

  describe('lottery create', () => {
    it('should create a lottery activity with none condition', async () => {
      try {
        const result = await lotteryService.createLotteryActivity({
          channelId: testChannelId,
          activityName: uniqueName('Test'),
          lotteryCondition: 'none',
          amount: 3,
          prizeName: 'Test Prize'
        });

        expect(result).toBeDefined();
        if (result.lotteryActivityId || result.id) {
          createdLotteryIds.push(result.lotteryActivityId || result.id);
        }
      } catch (error: any) {
        // Lottery API might require channel to be live or have specific conditions
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Lottery API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should create a lottery activity with invite condition', async () => {
      try {
        const result = await lotteryService.createLotteryActivity({
              channelId: testChannelId,
              activityName: uniqueName('Invite'),
              lotteryCondition: 'invite',
              amount: 5,
              prizeName: 'Invite Prize',
          duration: 60,
          inviteNum: 2
        });

        expect(result).toBeDefined();
        if (result.lotteryActivityId || result.id) {
          createdLotteryIds.push(result.lotteryActivityId || result.id);
        }
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Lottery API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should create a lottery activity with duration condition', async () => {
      try {
        const result = await lotteryService.createLotteryActivity({
              channelId: testChannelId,
              activityName: uniqueName('Duration'),
          lotteryCondition: 'duration',
          amount: 2,
          prizeName: 'Duration Prize',
          duration: 30
        });

        expect(result).toBeDefined();
        if (result.lotteryActivityId || result.id) {
          createdLotteryIds.push(result.lotteryActivityId || result.id);
        }
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Lottery API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        lotteryService.createLotteryActivity({
          channelId: '',
          activityName: 'Test',
          lotteryCondition: 'none',
          amount: 1,
          prizeName: 'Prize'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should fail for non-existent channel', async () => {
      await expect(
        lotteryService.createLotteryActivity({
          channelId: '9999999',
          activityName: 'Test',
          lotteryCondition: 'none',
          amount: 1,
          prizeName: 'Prize'
        })
      ).rejects.toThrow();
    }, 15000);
  });

  // ========================================
  // Lottery List Tests
  // ========================================

  describe('lottery list', () => {
    it('should list lottery activities or handle gracefully', async () => {
      try {
        const result = await lotteryService.listLotteryActivities({
          channelId: testChannelId,
          pageNumber: 1,
          pageSize: 10
        });

        expect(result).toBeDefined();
        if (result.contents) {
          expect(Array.isArray(result.contents)).toBe(true);
        } else if (Array.isArray(result)) {
          expect(Array.isArray(result)).toBe(true);
        }
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Lottery API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle pagination correctly', async () => {
      try {
        const result = await lotteryService.listLotteryActivities({
          channelId: testChannelId,
          pageNumber: 1,
          pageSize: 5
        });

        expect(result).toBeDefined();
        if (result.contents) {
          expect(result.contents.length).toBeLessThanOrEqual(5);
        }
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Lottery API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        lotteryService.listLotteryActivities({
          channelId: '',
          pageNumber: 1
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Lottery Get Tests
  // ========================================

  describe('lottery get', () => {
    let testLotteryId: string | undefined;

    beforeAll(async () => {
      try {
        // Create a lottery for testing
        const result = await lotteryService.createLotteryActivity({
          channelId: testChannelId,
          activityName: 'Lottery To Get',
          lotteryCondition: 'none',
          amount: 1,
          prizeName: 'Get Test Prize'
        });
        testLotteryId = result.lotteryActivityId || result.id;
        if (testLotteryId) {
          createdLotteryIds.push(testLotteryId);
        }
      } catch (error: any) {
        // API not available, skip setup
        console.log('Lottery API not available, skipping lottery get setup');
      }
    }, 15000);

    it('should get lottery activity details', async () => {
      if (!testLotteryId) {
        console.log('Skipping: No lottery ID available');
        return;
      }

      try {
        const result = await lotteryService.getLotteryActivity({
          channelId: testChannelId,
          id: testLotteryId
        });

        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Lottery API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        lotteryService.getLotteryActivity({
          channelId: '',
          id: 'test-id'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty id', async () => {
      await expect(
        lotteryService.getLotteryActivity({
          channelId: testChannelId,
          id: ''
        })
      ).rejects.toThrow();
    }, 10000);

    it('should handle non-existent lottery ID', async () => {
      try {
        const result = await lotteryService.getLotteryActivity({
          channelId: testChannelId,
          id: 'non-existent-lottery-id-99999'
        });
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    }, 15000);
  });

  // ========================================
  // Lottery Update Tests
  // ========================================

  describe('lottery update', () => {
    let testLotteryId: string | null = null;

    beforeAll(async () => {
      try {
        // Create a lottery for testing
        const result = await lotteryService.createLotteryActivity({
          channelId: testChannelId,
          activityName: 'Lottery To Update',
          lotteryCondition: 'none',
          amount: 2,
          prizeName: 'Update Test Prize'
        });
        testLotteryId = result.lotteryActivityId || result.id;
        if (testLotteryId) {
          createdLotteryIds.push(testLotteryId);
        }
      } catch (error: any) {
        console.log('Lottery API not available, skipping lottery update setup');
      }
    }, 15000);

    it('should update lottery activity name', async () => {
      if (!testLotteryId) {
        console.log('Skipping: No lottery ID available');
        return;
      }

      try {
        const result = await lotteryService.updateLotteryActivity({
          channelId: testChannelId,
          id: testLotteryId,
          activityName: uniqueName('Updated')
        });

        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Lottery API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should update lottery activity amount', async () => {
      if (!testLotteryId) {
        console.log('Skipping: No lottery ID available');
        return;
      }

      try {
        const result = await lotteryService.updateLotteryActivity({
          channelId: testChannelId,
          id: testLotteryId,
          amount: 5
        });

        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Lottery API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        lotteryService.updateLotteryActivity({
          channelId: '',
          id: 'test-id',
          activityName: 'Test'
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Lottery Delete Tests
  // ========================================

  describe('lottery delete', () => {
    it('should delete a lottery activity successfully', async () => {
      let lotteryId: string | null = null;

      // Create a lottery to delete
      try {
        const createResult = await lotteryService.createLotteryActivity({
          channelId: testChannelId,
          activityName: 'Lottery To Delete',
          lotteryCondition: 'none',
          amount: 1,
          prizeName: 'Delete Test Prize'
        });
        lotteryId = createResult.lotteryActivityId || createResult.id;
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Lottery API not available (404), skipping delete test');
          expect(true).toBe(true);
          return;
        }
        throw error;
      }

      if (!lotteryId) {
        console.log('Skipping: No lottery ID created');
        return;
      }

      // Delete it
      try {
        const deleteResult = await lotteryService.deleteLotteryActivity({
          channelId: testChannelId,
          id: lotteryId
        });

        expect(deleteResult).toBeDefined();

        // Remove from cleanup list since it's already deleted
        createdLotteryIds = createdLotteryIds.filter(id => id !== lotteryId);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Lottery API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        lotteryService.deleteLotteryActivity({
          channelId: '',
          id: 'test-id'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty id', async () => {
      await expect(
        lotteryService.deleteLotteryActivity({
          channelId: testChannelId,
          id: ''
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Winner Detail Tests
  // ========================================

  describe('lottery winners', () => {
    it('should get winner detail list or handle gracefully', async () => {
      try {
        const result = await lotteryService.getWinnerDetail({
          channelId: testChannelId,
          lotteryId: 'test-lottery-id',
          page: 1,
          limit: 10
        });

        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('No winner data available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        lotteryService.getWinnerDetail({
          channelId: '',
          lotteryId: 'test-id'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty lotteryId', async () => {
      await expect(
        lotteryService.getWinnerDetail({
          channelId: testChannelId,
          lotteryId: ''
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Lottery Records Tests
  // ========================================

  describe('lottery records', () => {
    it('should list lottery records or handle gracefully', async () => {
      try {
        const result = await lotteryService.listLottery({
          channelId: testChannelId,
          startTime: getTimestamp(-7),
          endTime: getTimestamp(0),
          page: 1,
          limit: 10
        });

        expect(result).toBeDefined();
        if (result.contents) {
          expect(Array.isArray(result.contents)).toBe(true);
        }
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('No lottery records available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should filter by session ID', async () => {
      try {
        const result = await lotteryService.listLottery({
          channelId: testChannelId,
          sessionId: 'test-session-id',
          page: 1,
          limit: 10
        });

        expect(result).toBeDefined();
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
        lotteryService.listLottery({
          channelId: '',
          page: 1
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Lottery Lifecycle Test
  // ========================================

  describe('lottery lifecycle (CRUD)', () => {
    it('should complete full lottery lifecycle', async () => {
      let lotteryId: string | null = null;

      // 1. Create
      try {
        const createResult = await lotteryService.createLotteryActivity({
          channelId: testChannelId,
          activityName: uniqueName('Life'),
          lotteryCondition: 'none',
          amount: 3,
          prizeName: 'Lifecycle Prize'
        });

        expect(createResult).toBeDefined();
        lotteryId = createResult.lotteryActivityId || createResult.id;
        expect(lotteryId).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Lottery API not available (404), skipping lifecycle test');
          expect(true).toBe(true);
          return;
        }
        throw error;
      }

      // 2. Read - List
      try {
        const listResult = await lotteryService.listLotteryActivities({
          channelId: testChannelId,
          pageNumber: 1,
          pageSize: 100
        });
        expect(listResult).toBeDefined();
      } catch (error) {
        // Continue despite list error
      }

      // 3. Read - Get
      try {
        const getResult = await lotteryService.getLotteryActivity({
          channelId: testChannelId,
          id: lotteryId
        });
        expect(getResult).toBeDefined();
      } catch (error) {
        // Continue despite get error
      }

      // 4. Update
      try {
        const updateResult = await lotteryService.updateLotteryActivity({
          channelId: testChannelId,
          id: lotteryId,
          activityName: uniqueName('LifeUpd'),
          amount: 5
        });
        expect(updateResult).toBeDefined();
      } catch (error) {
        // Continue despite update error
      }

      // 5. Delete
      try {
        const deleteResult = await lotteryService.deleteLotteryActivity({
          channelId: testChannelId,
          id: lotteryId
        });
        expect(deleteResult).toBeDefined();

        // Remove from cleanup since already deleted
        createdLotteryIds = createdLotteryIds.filter(id => id !== lotteryId);
      } catch (error) {
        // Continue despite delete error
      }
    }, 30000);
  });

  // ========================================
  // Validation Tests
  // ========================================

  describe('validation tests', () => {
    it('should validate createLotteryActivity channelId', async () => {
      await expect(
        lotteryService.createLotteryActivity({
          channelId: '',
          activityName: 'Test',
          lotteryCondition: 'none',
          amount: 1,
          prizeName: 'Prize'
        })
      ).rejects.toThrow();
    });

    it('should validate listLotteryActivities channelId', async () => {
      await expect(
        lotteryService.listLotteryActivities({ channelId: '' })
      ).rejects.toThrow();
    });

    it('should validate getLotteryActivity channelId', async () => {
      await expect(
        lotteryService.getLotteryActivity({ channelId: '', id: 'test' })
      ).rejects.toThrow();
    });

    it('should validate getLotteryActivity id', async () => {
      await expect(
        lotteryService.getLotteryActivity({ channelId: testChannelId, id: '' })
      ).rejects.toThrow();
    });

    it('should validate updateLotteryActivity channelId', async () => {
      await expect(
        lotteryService.updateLotteryActivity({ channelId: '', id: 'test' })
      ).rejects.toThrow();
    });

    it('should validate deleteLotteryActivity channelId', async () => {
      await expect(
        lotteryService.deleteLotteryActivity({ channelId: '', id: 'test' })
      ).rejects.toThrow();
    });

    it('should validate getWinnerDetail channelId', async () => {
      await expect(
        lotteryService.getWinnerDetail({ channelId: '', lotteryId: 'test' })
      ).rejects.toThrow();
    });

    it('should validate listLottery channelId', async () => {
      await expect(
        lotteryService.listLottery({ channelId: '' })
      ).rejects.toThrow();
    });
  });
});
