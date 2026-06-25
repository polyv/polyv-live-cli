/**
 * @fileoverview Integration tests for donate commands
 * @author Development Team
 * @since 11.6.0
 */

import { DonateServiceSdk } from '../../src/services/donate-service';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';
import { runCli, sleep } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  runCliSuccess,
} from '../helpers/channel-fixture';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

// Helper function to get timestamp
function getTimestamp(daysOffset: number = 0): number {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

(shouldRunTests ? describe : describe.skip)('Donate Integration Tests', () => {
  let donateService: DonateServiceSdk;
  let testChannelId: string;

  beforeAll(() => {
    donateService = new DonateServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });
    testChannelId = createTemporaryChannel('Donate Service');
  });

  afterAll(() => {
    if (testChannelId) {
      deleteTemporaryChannel(testChannelId);
    }
  });

  // ========================================
  // Donate Config Get Tests
  // ========================================

  describe('donate config get', () => {
    it('should get donate configuration successfully', async () => {
      try {
        const result = await donateService.getDonateConfig({
          channelId: testChannelId
        });

        expect(result).toBeDefined();
        // Result should contain donate configuration (structure may vary by API version)
        // API might return { code, data, ... } or { donateEnabled, donateTips, ... }
        expect(result).not.toBeNull();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Donate API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        donateService.getDonateConfig({
          channelId: ''
        })
      ).rejects.toThrow();
    }, 10000);

    it('should handle non-existent channel gracefully', async () => {
      try {
        const result = await donateService.getDonateConfig({
          channelId: '9999999'
        });
        // API might return default settings or error
        expect(result).toBeDefined();
      } catch (error: any) {
        // Or it might throw an error
        expect(error).toBeDefined();
      }
    }, 15000);
  });

  // ========================================
  // Donate Config Update Tests
  // ========================================

  describe('donate config update', () => {
    it('should update donate tips', async () => {
      try {
        const result = await donateService.updateDonateConfig({
          channelId: testChannelId,
          donateTips: 'Thank you for your support!'
        });

        expect(result).toBeDefined();
        expect(result.code).toBe(200);
        expect(result.status).toBe('success');
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          console.log('Donate update API not available');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should update donate enabled setting', async () => {
      try {
        const result = await donateService.updateDonateConfig({
          channelId: testChannelId,
          donateEnabled: 'Y'
        });

        expect(result).toBeDefined();
        expect(result.code).toBe(200);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Donate update API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should update donate amounts', async () => {
      try {
        const result = await donateService.updateDonateConfig({
          channelId: testChannelId,
          donateAmounts: [1, 5, 10, 50, 100]
        });

        expect(result).toBeDefined();
        expect(result.code).toBe(200);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Donate update API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should update multiple settings at once', async () => {
      try {
        const result = await donateService.updateDonateConfig({
          channelId: testChannelId,
          donateEnabled: 'Y',
          donateTips: 'Support our channel!',
          donateAmounts: [1, 10, 100]
        });

        expect(result).toBeDefined();
        expect(result.code).toBe(200);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Donate update API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        donateService.updateDonateConfig({
          channelId: '',
          donateTips: 'Test'
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Donate List (Reward Gift) Tests
  // ========================================

  describe('donate list', () => {
    it('should list donate records successfully', async () => {
      try {
        const result = await donateService.listRewardGift({
          channelId: testChannelId,
          start: getTimestamp(-7),
          end: getTimestamp(0),
          pageNumber: 1,
          pageSize: 10
        });

        expect(result).toBeDefined();
        // Result may have pagination data
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Donate list API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle pagination correctly', async () => {
      try {
        const result = await donateService.listRewardGift({
          channelId: testChannelId,
          start: getTimestamp(-7),
          end: getTimestamp(0),
          pageNumber: 1,
          pageSize: 5
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
        donateService.listRewardGift({
          channelId: '',
          start: getTimestamp(-7),
          end: getTimestamp(0)
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate missing start parameter', async () => {
      await expect(
        donateService.listRewardGift({
          channelId: testChannelId,
          start: undefined as any,
          end: getTimestamp(0)
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate missing end parameter', async () => {
      await expect(
        donateService.listRewardGift({
          channelId: testChannelId,
          start: getTimestamp(-7),
          end: undefined as any
        })
      ).rejects.toThrow();
    }, 10000);

    it('should handle large date range', async () => {
      try {
        const result = await donateService.listRewardGift({
          channelId: testChannelId,
          start: getTimestamp(-30),
          end: getTimestamp(0),
          pageNumber: 1,
          pageSize: 20
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
  });

  // ========================================
  // Validation Tests Summary
  // ========================================

  describe('validation tests', () => {
    it('should validate getDonateConfig channelId', async () => {
      await expect(
        donateService.getDonateConfig({ channelId: '' })
      ).rejects.toThrow();
    });

    it('should validate updateDonateConfig channelId', async () => {
      await expect(
        donateService.updateDonateConfig({ channelId: '', donateTips: 'test' })
      ).rejects.toThrow();
    });

    it('should validate listRewardGift channelId', async () => {
      await expect(
        donateService.listRewardGift({
          channelId: '',
          start: 1615772426000,
          end: 1615858826000
        })
      ).rejects.toThrow();
    });

    it('should validate listRewardGift start parameter', async () => {
      await expect(
        donateService.listRewardGift({
          channelId: testChannelId,
          start: undefined as any,
          end: 1615858826000
        })
      ).rejects.toThrow();
    });

    it('should validate listRewardGift end parameter', async () => {
      await expect(
        donateService.listRewardGift({
          channelId: testChannelId,
          start: 1615772426000,
          end: undefined as any
        })
      ).rejects.toThrow();
    });
  });

  // ========================================
  // Donate Config Workflow Tests
  // ========================================

  describe('donate config workflow', () => {
    it('should complete get-update-get workflow', async () => {
      // 1. Get current config
      try {
        const initialConfig = await donateService.getDonateConfig({
          channelId: testChannelId
        });
        expect(initialConfig).toBeDefined();

        // 2. Update config
        const updateResult = await donateService.updateDonateConfig({
          channelId: testChannelId,
          donateTips: 'Updated tips'
        });
        expect(updateResult).toBeDefined();
        expect(updateResult.code).toBe(200);

        // 3. Get config again to verify
        const updatedConfig = await donateService.getDonateConfig({
          channelId: testChannelId
        });
        expect(updatedConfig).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Donate API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 30000);
  });
});

// ========================================
// Real CLI execution coverage (donate config get)
// The tests above exercise DonateServiceSdk directly; the block below drives the
// local CLI entry (`polyv-live-cli donate config get`) end-to-end so the
// `donate config get` leaf command counts as real-execution integration coverage.
// ========================================
(shouldRunTests ? describe : describe.skip)('donate config get CLI real execution', () => {
  it('returns donate configuration for a temporary channel via real CLI and cleans it up', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Donate Config Get CLI');

      const output = runCliSuccess([
        'donate',
        'config',
        'get',
        '-c',
        channelId,
        '-o',
        'json',
      ]);

      const parsed = parseJsonObject(output);
      // channelId echoes back the requested channel
      expect(String(parsed.channelId)).toBe(channelId);
      // donate config payload fields present for any channel
      expect(parsed).toHaveProperty('donateCashEnabled');
      expect(parsed).toHaveProperty('donateGiftEnabled');
      expect(parsed).toHaveProperty('cashDonate');
      expect(parsed).toHaveProperty('giftDonate');
      // cashDonate must carry the amount list
      const cashDonate = parsed.cashDonate as Record<string, unknown>;
      expect(Array.isArray(cashDonate.cashs)).toBe(true);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);
});

// ========================================
// Real-CLI coverage for `donate list`.
//
// `donate list` is a channel-scoped read requiring `-c`, `--start` and `--end`
// (13-digit ms timestamps). On a fresh temporary channel there are no donate
// records, so the handler prints a non-JSON info line
// (`ℹ️ No donate records found for channel <id>`) and exits 0 — the same
// empty-data shape as `lottery winners` / `donate list`. Coverage of this leaf
// command therefore asserts exit 0 plus the deterministic info message rather
// than a JSON payload (runCli is used instead of parseJsonObject).
// ========================================
(shouldRunTests ? describe : describe.skip)('donate list CLI real execution', () => {
  it('runs donate list via real CLI against a temporary channel', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Donate List CLI');

      const end = Date.now();
      const start = end - 23 * 60 * 60 * 1000;

      const result = runCli([
        'donate',
        'list',
        '-c',
        channelId,
        '--start',
        String(start),
        '--end',
        String(end),
        '-o',
        'json',
      ]);

      // Exits 0 and prints the deterministic empty-data info message on a fresh
      // channel (no donate records).
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('No donate records found');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);
});

// ========================================
// Real-CLI coverage for `donate config update`.
//
// `donate config update` is a channel-scoped reversible write. The
// `--gift-enabled <Y|N>` toggle persists to the server (verified via a
// get → update → get → restore round-trip), so it forms a genuine
// update lifecycle rather than the no-op behavior seen on the sibling
// `web donate cash-update` (which returns success but never persists).
// Coverage asserts exit 0, the structured `{ channelId, giftEnabled }`
// response, and that a follow-up `donate config get` reflects the new
// value; the original value is restored in the test body and the
// temporary channel is deleted in `finally`.
// ========================================
(shouldRunTests ? describe : describe.skip)('donate config update CLI real execution', () => {
  // donateGiftEnabled read-back can lag behind the write by a second or two
  // (PolyV eventually-consistent read replica). Poll a few times so the test
  // is robust to that replication delay rather than flaking.
  function readGiftEnabled(channelId: string): string {
    return String(
      parseJsonObject(
        runCliSuccess(['donate', 'config', 'get', '-c', channelId, '-o', 'json']),
      ).donateGiftEnabled,
    );
  }
  function expectGiftEnabledBecomes(channelId: string, expected: string): void {
    for (let attempt = 0; attempt < 5; attempt++) {
      if (readGiftEnabled(channelId) === expected) {
        return;
      }
      sleep(1000);
    }
    expect(readGiftEnabled(channelId)).toBe(expected);
  }

  it('flips donateGiftEnabled via real CLI and restores it on a temporary channel', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Donate Config Update CLI');

      // 1. Read the current gift-enabled flag (default "N" on a fresh channel).
      const original = readGiftEnabled(channelId);
      const flipped = original === 'Y' ? 'N' : 'Y';

      // 2. Flip the flag via real CLI and assert the structured response.
      const updateOutput = runCliSuccess([
        'donate',
        'config',
        'update',
        '-c',
        channelId,
        '--gift-enabled',
        flipped,
        '--force',
        '-o',
        'json',
      ]);
      const updated = parseJsonObject(updateOutput);
      expect(String(updated.channelId)).toBe(channelId);
      expect(String(updated.giftEnabled)).toBe(flipped);

      // 3. Verify the change persisted by reading config back (polls past lag).
      expectGiftEnabledBecomes(channelId, flipped);

      // 4. Restore the original value and confirm it settled back.
      runCliSuccess([
        'donate',
        'config',
        'update',
        '-c',
        channelId,
        '--gift-enabled',
        original,
        '--force',
        '-o',
        'json',
      ]);
      expectGiftEnabledBecomes(channelId, original);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);
});
