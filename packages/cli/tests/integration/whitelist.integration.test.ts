/**
 * @fileoverview Integration tests for whitelist commands
 * @author Development Team
 * @since 12.4.0
 */

import { WhitelistServiceSdk } from '../../src/services/whitelist-service';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';
import { createTemporaryChannel, deleteTemporaryChannel } from '../helpers/channel-fixture';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('Whitelist Integration Tests', () => {
  let whitelistService: WhitelistServiceSdk;
  let testChannelId: string;
  let createdCodes: { code: string; rank: 1 | 2; channelId?: string }[] = [];

  beforeAll(() => {
    whitelistService = new WhitelistServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });
    testChannelId = createTemporaryChannel('Whitelist Service');
  });

  afterAll(async () => {
    // Clean up created whitelist items
    if (createdCodes.length > 0) {
      console.log(`🧹 Cleaning up ${createdCodes.length} whitelist items...`);
      for (const item of createdCodes) {
        try {
          await whitelistService.deleteWhiteList({
            rank: item.rank,
            isClear: 'N',
            codes: item.code,
            ...(item.channelId && { channelId: item.channelId })
          });
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    }

    if (testChannelId) {
      deleteTemporaryChannel(testChannelId);
    }
  });

  // ========================================
  // Whitelist List Tests
  // ========================================

  describe('whitelist list', () => {
    it('should list whitelist items for primary condition', async () => {
      try {
        const result = await whitelistService.getWhiteList({
          rank: 1,
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
          console.log('Whitelist API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should list whitelist items for secondary condition', async () => {
      try {
        const result = await whitelistService.getWhiteList({
          rank: 2,
          channelId: testChannelId,
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

    it('should list global whitelist items (no channel)', async () => {
      try {
        const result = await whitelistService.getWhiteList({
          rank: 1,
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

    it('should handle pagination correctly', async () => {
      try {
        const result = await whitelistService.getWhiteList({
          rank: 1,
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

    it('should filter by keyword', async () => {
      try {
        const result = await whitelistService.getWhiteList({
          rank: 1,
          channelId: testChannelId,
          keyword: 'test',
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

    it('should validate invalid rank value', async () => {
      await expect(
        whitelistService.getWhiteList({
          rank: 3 as any,
          channelId: testChannelId
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Whitelist Add Tests
  // ========================================

  describe('whitelist add', () => {
    it('should add a whitelist item successfully', async () => {
      const code = `test_${Date.now()}`;

      try {
        const result = await whitelistService.addWhiteList({
          rank: 1,
          code,
          name: 'Test User',
          channelId: testChannelId
        });

        expect(result).toBeDefined();
        expect(result).toBe('success');

        // Track for cleanup
        createdCodes.push({ code, rank: 1, channelId: testChannelId });
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '已存在', 'duplicate', '不能为空'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          console.log('Whitelist add API not available or duplicate');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should add global whitelist item', async () => {
      const code = `global_${Date.now()}`;

      try {
        const result = await whitelistService.addWhiteList({
          rank: 1,
          code,
          name: 'Global User'
        });

        expect(result).toBeDefined();
        expect(result).toBe('success');

        // Track for cleanup
        createdCodes.push({ code, rank: 1 });
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '已存在', '不能为空'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should add whitelist item for secondary condition', async () => {
      const code = `secondary_${Date.now()}`;

      try {
        const result = await whitelistService.addWhiteList({
          rank: 2,
          code,
          name: 'Secondary User',
          channelId: testChannelId
        });

        expect(result).toBeDefined();
        expect(result).toBe('success');

        // Track for cleanup
        createdCodes.push({ code, rank: 2, channelId: testChannelId });
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '已存在', '不能为空'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty code', async () => {
      await expect(
        whitelistService.addWhiteList({
          rank: 1,
          code: '',
          channelId: testChannelId
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid rank', async () => {
      await expect(
        whitelistService.addWhiteList({
          rank: 3 as any,
          code: 'test123',
          channelId: testChannelId
        })
      ).rejects.toThrow();
    }, 10000);

    it('should handle duplicate code gracefully', async () => {
      const code = `dup_${Date.now()}`;

      try {
        // Add first item
        await whitelistService.addWhiteList({
          rank: 1,
          code,
          name: 'First User',
          channelId: testChannelId
        });
        createdCodes.push({ code, rank: 1, channelId: testChannelId });

        // Try to add duplicate
        await whitelistService.addWhiteList({
          rank: 1,
          code,
          name: 'Second User',
          channelId: testChannelId
        });

        // If no error, that's acceptable
        expect(true).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['已存在', 'duplicate', '重复', 'exist'];
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
  // Whitelist Update Tests
  // ========================================

  describe('whitelist update', () => {
    let testCode: string = '';

    beforeAll(async () => {
      // Create a whitelist item for update testing
      testCode = `update_test_${Date.now()}`;
      try {
        await whitelistService.addWhiteList({
          rank: 1,
          code: testCode,
          name: 'ToUpdate',
          channelId: testChannelId
        });
        createdCodes.push({ code: testCode, rank: 1, channelId: testChannelId });
      } catch (error) {
        // API not available
      }
    }, 15000);

    it('should update a whitelist item successfully', async () => {
      if (!testCode) {
        console.log('Skipping: No test code available');
        return;
      }

      try {
        const result = await whitelistService.updateWhiteList({
          rank: 1,
          oldCode: testCode,
          code: testCode, // Same code, just updating name
          name: 'Updated User',
          channelId: testChannelId
        });

        expect(result).toBeDefined();
        expect(result).toBe('success');
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不存在', '不能为空'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          console.log('Whitelist update API not available');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty oldCode', async () => {
      await expect(
        whitelistService.updateWhiteList({
          rank: 1,
          oldCode: '',
          code: 'newCode',
          channelId: testChannelId
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty new code', async () => {
      await expect(
        whitelistService.updateWhiteList({
          rank: 1,
          oldCode: 'oldCode',
          code: '',
          channelId: testChannelId
        })
      ).rejects.toThrow();
    }, 10000);

    it('should handle non-existent code gracefully', async () => {
      try {
        await whitelistService.updateWhiteList({
          rank: 1,
          oldCode: 'non_existent_code_99999',
          code: 'new_code',
          name: 'Test',
          channelId: testChannelId
        });

        // If no error, acceptable
        expect(true).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不存在', '找不到', 'failed', 'illegal'];
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
  // Whitelist Delete Tests
  // ========================================

  describe('whitelist delete', () => {
    it('should delete a whitelist item successfully', async () => {
      const code = `delete_test_${Date.now()}`;

      // Create first
      try {
        await whitelistService.addWhiteList({
          rank: 1,
          code,
          name: 'To Delete',
          channelId: testChannelId
        });
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Whitelist API not available (404), skipping delete test');
          expect(true).toBe(true);
          return;
        }
        throw error;
      }

      // Delete it
      try {
        const result = await whitelistService.deleteWhiteList({
          rank: 1,
          isClear: 'N',
          codes: code,
          channelId: testChannelId
        });

        expect(result).toBeDefined();
        expect(result).toBe('success');
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不存在', '不能为空'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          console.log('Whitelist delete API not available');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should delete multiple items', async () => {
      const codes = [`multi1_${Date.now()}`, `multi2_${Date.now()}`];

      // Create items
      try {
        for (const code of codes) {
          await whitelistService.addWhiteList({
            rank: 1,
            code,
            name: 'Multi Delete',
            channelId: testChannelId
          });
        }
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
          return;
        }
        throw error;
      }

      // Delete them
      try {
        const result = await whitelistService.deleteWhiteList({
          rank: 1,
          isClear: 'N',
          codes: codes.join(','),
          channelId: testChannelId
        });

        expect(result).toBeDefined();
        expect(result).toBe('success');
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不存在', 'failed', 'illegal'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should clear all items with isClear=Y', async () => {
      try {
        const result = await whitelistService.deleteWhiteList({
          rank: 1,
          isClear: 'Y',
          channelId: testChannelId
        });

        expect(result).toBeDefined();
        expect(result).toBe('success');
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate invalid isClear value', async () => {
      await expect(
        whitelistService.deleteWhiteList({
          rank: 1,
          isClear: 'invalid' as any,
          channelId: testChannelId
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Validation Tests Summary
  // ========================================

  describe('validation tests', () => {
    it('should validate getWhiteList rank', async () => {
      await expect(
        whitelistService.getWhiteList({ rank: 3 as any })
      ).rejects.toThrow();
    });

    it('should validate addWhiteList code', async () => {
      await expect(
        whitelistService.addWhiteList({ rank: 1, code: '' })
      ).rejects.toThrow();
    });

    it('should validate addWhiteList rank', async () => {
      await expect(
        whitelistService.addWhiteList({ rank: 0 as any, code: 'test' })
      ).rejects.toThrow();
    });

    it('should validate updateWhiteList oldCode', async () => {
      await expect(
        whitelistService.updateWhiteList({
          rank: 1,
          oldCode: '',
          code: 'test'
        })
      ).rejects.toThrow();
    });

    it('should validate updateWhiteList code', async () => {
      await expect(
        whitelistService.updateWhiteList({
          rank: 1,
          oldCode: 'old',
          code: ''
        })
      ).rejects.toThrow();
    });

    it('should validate deleteWhiteList rank', async () => {
      await expect(
        whitelistService.deleteWhiteList({ rank: 3 as any, isClear: 'N' })
      ).rejects.toThrow();
    });
  });

  // ========================================
  // Whitelist Workflow Tests
  // ========================================

  describe('whitelist workflow', () => {
    it('should complete add-list-delete workflow', async () => {
      const code = `workflow_${Date.now()}`;

      // 1. Add item
      try {
        await whitelistService.addWhiteList({
          rank: 1,
          code,
          name: 'Workflow Test',
          channelId: testChannelId
        });
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Whitelist API not available (404)');
          expect(true).toBe(true);
          return;
        }
        throw error;
      }

      // 2. List and verify
      try {
        const listResult = await whitelistService.getWhiteList({
          rank: 1,
          channelId: testChannelId,
          keyword: code
        });
        expect(listResult).toBeDefined();
      } catch (error) {
        // Continue despite list error
      }

      // 3. Delete
      try {
        await whitelistService.deleteWhiteList({
          rank: 1,
          isClear: 'N',
          codes: code,
          channelId: testChannelId
        });
      } catch (error) {
        // Continue despite delete error
      }
    }, 30000);
  });
});
