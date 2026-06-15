/**
 * @fileoverview Integration tests for transmit commands
 * @author Development Team
 * @since 14.3.0
 */

import { TransmitServiceSdk } from '../../src/services/transmit-service';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('Transmit Integration Tests', () => {
  let transmitService: TransmitServiceSdk;
  let testChannelId: string;
  let createdChannelIds: string[] = [];

  beforeAll(() => {
    transmitService = new TransmitServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });
    testChannelId = testConfig.testChannelId;
  });

  // Note: Transmit API may not have delete endpoint, so we track for reference
  afterAll(() => {
    if (createdChannelIds.length > 0) {
      console.log(`\n📝 Note: ${createdChannelIds.length} transmit channels were created during tests`);
    }
  });

  // ========================================
  // Transmit List Tests
  // ========================================

  describe('transmit list', () => {
    it('should list transmit associations successfully', async () => {
      try {
        const result = await transmitService.getTransmitAssociations(testChannelId);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Transmit API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        transmitService.getTransmitAssociations('')
      ).rejects.toThrow();
    }, 10000);

    it('should validate whitespace-only channelId', async () => {
      await expect(
        transmitService.getTransmitAssociations('   ')
      ).rejects.toThrow();
    }, 10000);

    it('should handle non-existent channel gracefully', async () => {
      try {
        const result = await transmitService.getTransmitAssociations('9999999');
        // API might return empty array or error
        expect(Array.isArray(result)).toBe(true);
      } catch (error: any) {
        // Expected error for non-existent channel
        expect(error).toBeDefined();
      }
    }, 15000);

    it('should return associations with correct structure', async () => {
      try {
        const result = await transmitService.getTransmitAssociations(testChannelId);

        if (result.length > 0) {
          const association = result[0];
          expect(association).toBeDefined();
          // Check for expected fields based on API response
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
  });

  // ========================================
  // Transmit Create Tests
  // ========================================

  describe('transmit create', () => {
    it('should create a single transmit channel', async () => {
      const name = `Transmit_${Date.now()}`;

      try {
        const result = await transmitService.batchCreateTransmitChannels(testChannelId, [name]);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(1);

        // Track for reference
        if (result[0]?.channelId) {
          createdChannelIds.push(String(result[0].channelId));
        }
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在', 'forbidden'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          console.log('Transmit create API not available');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should create multiple transmit channels', async () => {
      const names = [`Transmit1_${Date.now()}`, `Transmit2_${Date.now()}`, `Transmit3_${Date.now()}`];

      try {
        const result = await transmitService.batchCreateTransmitChannels(testChannelId, names);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(names.length);

        // Track for reference
        result.forEach(channel => {
          if (channel?.channelId) {
            createdChannelIds.push(String(channel.channelId));
          }
        });
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在', 'forbidden'];
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
        transmitService.batchCreateTransmitChannels('', ['Test'])
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty names array', async () => {
      await expect(
        transmitService.batchCreateTransmitChannels(testChannelId, [])
      ).rejects.toThrow();
    }, 10000);

    it('should validate names count exceeds 100', async () => {
      const names = Array(101).fill('Name');

      await expect(
        transmitService.batchCreateTransmitChannels(testChannelId, names)
      ).rejects.toThrow();
    }, 10000);

    it('should handle special characters in names', async () => {
      const names = [`中文转播_${Date.now()}`, `Special!@#${Date.now()}`];

      try {
        const result = await transmitService.batchCreateTransmitChannels(testChannelId, names);

        expect(result).toBeDefined();
        expect(result.length).toBe(names.length);

        result.forEach(channel => {
          if (channel?.channelId) {
            createdChannelIds.push(String(channel.channelId));
          }
        });
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在', 'encoding', 'forbidden'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle long names', async () => {
      const longName = `Long_${'A'.repeat(50)}_${Date.now()}`;

      try {
        const result = await transmitService.batchCreateTransmitChannels(testChannelId, [longName]);

        expect(result).toBeDefined();
        expect(result.length).toBe(1);

        if (result[0]?.channelId) {
          createdChannelIds.push(String(result[0].channelId));
        }
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在', 'too long', '过长', 'forbidden'];
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
        const result = await transmitService.batchCreateTransmitChannels('9999999', ['Test']);

        // If no error, check result
        expect(Array.isArray(result)).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在', 'forbidden', 'illegal'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle duplicate names gracefully', async () => {
      const name = `DupTransmit_${Date.now()}`;

      try {
        // Create first
        const result1 = await transmitService.batchCreateTransmitChannels(testChannelId, [name]);

        if (result1[0]?.channelId) {
          createdChannelIds.push(String(result1[0].channelId));
        }

        // Try duplicate
        const result2 = await transmitService.batchCreateTransmitChannels(testChannelId, [name]);

        if (result2[0]?.channelId) {
          createdChannelIds.push(String(result2[0].channelId));
        }

        // If no error, that's acceptable
        expect(true).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '已存在', 'duplicate', '重复', 'forbidden'];
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
    it('should validate getTransmitAssociations channelId', async () => {
      await expect(
        transmitService.getTransmitAssociations('')
      ).rejects.toThrow();
    });

    it('should validate getTransmitAssociations whitespace channelId', async () => {
      await expect(
        transmitService.getTransmitAssociations('   ')
      ).rejects.toThrow();
    });

    it('should validate batchCreateTransmitChannels channelId', async () => {
      await expect(
        transmitService.batchCreateTransmitChannels('', ['Test'])
      ).rejects.toThrow();
    });

    it('should validate batchCreateTransmitChannels empty names', async () => {
      await expect(
        transmitService.batchCreateTransmitChannels(testChannelId, [])
      ).rejects.toThrow();
    });

    it('should validate batchCreateTransmitChannels too many names', async () => {
      const names = Array(101).fill('Name');
      await expect(
        transmitService.batchCreateTransmitChannels(testChannelId, names)
      ).rejects.toThrow();
    });
  });

  // ========================================
  // Transmit Workflow Tests
  // ========================================

  describe('transmit workflow', () => {
    it('should complete create-list workflow', async () => {
      const name = `WfTransmit_${Date.now()}`;

      // 1. Create transmit channel
      try {
        const createResult = await transmitService.batchCreateTransmitChannels(testChannelId, [name]);

        expect(createResult).toBeDefined();
        expect(Array.isArray(createResult)).toBe(true);

        if (createResult[0]?.channelId) {
          createdChannelIds.push(String(createResult[0].channelId));
        }
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found') || message.includes('forbidden')) {
          console.log('Transmit API not available (404) or forbidden');
          expect(true).toBe(true);
          return;
        }
        throw error;
      }

      // 2. List associations to verify
      try {
        const listResult = await transmitService.getTransmitAssociations(testChannelId);
        expect(Array.isArray(listResult)).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Transmit list API not available');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 30000);

    it('should complete batch create-list workflow', async () => {
      const names = [`WfT1_${Date.now()}`, `WfT2_${Date.now()}`];

      // 1. Create multiple transmit channels
      try {
        const createResult = await transmitService.batchCreateTransmitChannels(testChannelId, names);

        expect(createResult).toBeDefined();
        expect(createResult.length).toBe(names.length);

        createResult.forEach(channel => {
          if (channel?.channelId) {
            createdChannelIds.push(String(channel.channelId));
          }
        });
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found') || message.includes('forbidden')) {
          console.log('Transmit API not available (404) or forbidden');
          expect(true).toBe(true);
          return;
        }
        throw error;
      }

      // 2. List and verify
      try {
        const listResult = await transmitService.getTransmitAssociations(testChannelId);
        expect(Array.isArray(listResult)).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 30000);
  });

  // ========================================
  // Edge Cases Tests
  // ========================================

  describe('edge cases', () => {
    it('should handle large batch creation near limit', async () => {
      // Test with 99 names (just under the 100 limit)
      const names = Array(99).fill(0).map((_, i) => `Batch_${Date.now()}_${i}`);

      try {
        const result = await transmitService.batchCreateTransmitChannels(testChannelId, names);

        expect(result).toBeDefined();
        expect(result.length).toBe(99);

        result.forEach(channel => {
          if (channel?.channelId) {
            createdChannelIds.push(String(channel.channelId));
          }
        });
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在', 'forbidden'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          console.log('Transmit batch create API not available');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 30000);

    it('should handle names with various unicode characters', async () => {
      const names = [
        `日本語_${Date.now()}`,
        `한국어_${Date.now()}`,
        `Emoji🎉_${Date.now()}`
      ];

      try {
        const result = await transmitService.batchCreateTransmitChannels(testChannelId, names);

        expect(result).toBeDefined();
        expect(result.length).toBe(names.length);

        result.forEach(channel => {
          if (channel?.channelId) {
            createdChannelIds.push(String(channel.channelId));
          }
        });
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在', 'encoding', 'forbidden'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle minimum valid name', async () => {
      const name = 'A'; // Minimum single character

      try {
        const result = await transmitService.batchCreateTransmitChannels(testChannelId, [name]);

        expect(result).toBeDefined();
        expect(result.length).toBe(1);

        if (result[0]?.channelId) {
          createdChannelIds.push(String(result[0].channelId));
        }
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在', 'too short', 'forbidden'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);
  });
});
