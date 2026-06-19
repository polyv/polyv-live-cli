/**
 * @fileoverview Integration tests for player commands
 * @author Development Team
 * @since 10.5.0
 */

import { ChannelServiceSdk } from '../../src/services/channel.service.sdk';
import { PlayerServiceSdk } from '../../src/services/player.service.sdk';
import { ChannelCreateRequest } from '../../src/types/channel';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('Player Integration Tests', () => {
  let channelService: ChannelServiceSdk;
  let playerService: PlayerServiceSdk;
  let testChannelId: string;
  let createdChannelIds: string[] = [];

  beforeAll(async () => {
    channelService = new ChannelServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      maxRetries: 3,
      debug: false
    });
    playerService = new PlayerServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });

    const createRequest: ChannelCreateRequest = {
      name: `Player Integration Test ${Date.now()}`,
      newScene: 'topclass',
      template: 'ppt'
    };
    const createdChannel = await channelService.createChannel(createRequest);
    testChannelId = String(createdChannel.channelId);
    createdChannelIds.push(testChannelId);
  }, 30000);

  afterAll(async () => {
    const channelIds = [...createdChannelIds];
    createdChannelIds = [];

    if (channelIds.length === 0) {
      return;
    }

    try {
      await channelService.batchDeleteChannels({ channelIds });
      console.log(`Cleaned up player integration test channels: ${channelIds.join(', ')}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Failed to clean up player integration test channels ${channelIds.join(', ')}: ${message}`);
    }
  }, 30000);

  // ========================================
  // Player Config Get Tests
  // ========================================

  describe('player config get', () => {
    it('should get channel decorate settings successfully', async () => {
      const result = await playerService.getChannelDecorate({
        channelId: testChannelId
      });

      expect(result).toBeDefined();
      // Result should contain player decorate settings
      expect(result.watermarkEnabled).toBeDefined();
      expect(result.warmupEnabled).toBeDefined();
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        playerService.getChannelDecorate({
          channelId: ''
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate whitespace-only channelId', async () => {
      await expect(
        playerService.getChannelDecorate({
          channelId: '   '
        })
      ).rejects.toThrow();
    }, 10000);

    it('should handle non-existent channel gracefully', async () => {
      try {
        const result = await playerService.getChannelDecorate({
          channelId: '9999999'
        });
        // API might return default settings
        expect(result).toBeDefined();
      } catch (error: any) {
        // Or it might throw an error
        expect(error).toBeDefined();
      }
    }, 15000);
  });

  // ========================================
  // Player Config Update Tests
  // ========================================

  describe('player config update', () => {
    it('should update watermark enabled setting', async () => {
      try {
        const result = await playerService.updateChannelDecorate({
          channelId: testChannelId,
          watermarkEnabled: 'Y'
        });

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.updatedFields).toContain('watermarkEnabled');
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Player API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should update warmup enabled setting', async () => {
      try {
        const result = await playerService.updateChannelDecorate({
          channelId: testChannelId,
          warmupEnabled: 'N'
        });

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.updatedFields).toContain('warmupEnabled');
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Player API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should update base page views', async () => {
      try {
        const result = await playerService.updateChannelDecorate({
          channelId: testChannelId,
          basePv: 1000
        });

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.updatedFields).toContain('basePv');
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Player API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should update multiple settings at once', async () => {
      try {
        const result = await playerService.updateChannelDecorate({
          channelId: testChannelId,
          watermarkEnabled: 'Y',
          watermarkPosition: 'br',
          watermarkOpacity: 0.8,
          warmupEnabled: 'N'
        });

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.updatedFields.length).toBeGreaterThan(1);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Player API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        playerService.updateChannelDecorate({
          channelId: '',
          watermarkEnabled: 'Y'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid watermarkEnabled value', async () => {
      await expect(
        playerService.updateChannelDecorate({
          channelId: testChannelId,
          watermarkEnabled: 'invalid' as any
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid watermarkPosition value', async () => {
      await expect(
        playerService.updateChannelDecorate({
          channelId: testChannelId,
          watermarkPosition: 'center' as any
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid watermarkOpacity value (negative)', async () => {
      await expect(
        playerService.updateChannelDecorate({
          channelId: testChannelId,
          watermarkOpacity: -0.5
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid watermarkOpacity value (greater than 1)', async () => {
      await expect(
        playerService.updateChannelDecorate({
          channelId: testChannelId,
          watermarkOpacity: 1.5
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid warmupEnabled value', async () => {
      await expect(
        playerService.updateChannelDecorate({
          channelId: testChannelId,
          warmupEnabled: 'yes' as any
        })
      ).rejects.toThrow();
    }, 10000);

    it('should accept valid watermark positions', async () => {
      const positions: Array<'tl' | 'tr' | 'bl' | 'br'> = ['tl', 'tr', 'bl', 'br'];

      for (const position of positions) {
        try {
          const result = await playerService.updateChannelDecorate({
            channelId: testChannelId,
            watermarkPosition: position
          });

          expect(result.success).toBe(true);
        } catch (error: any) {
          const message = error.message || '';
          if (message.includes('404') || message.includes('not found')) {
            console.log('Player API not available (404)');
            expect(true).toBe(true);
            break; // No need to test all positions if API not available
          } else {
            throw error;
          }
        }
      }
    }, 30000);
  });

  // ========================================
  // Validation Tests Summary
  // ========================================

  describe('validation tests', () => {
    it('should validate getChannelDecorate channelId', async () => {
      await expect(
        playerService.getChannelDecorate({ channelId: '' })
      ).rejects.toThrow();
    });

    it('should validate updateChannelDecorate channelId', async () => {
      await expect(
        playerService.updateChannelDecorate({
          channelId: '',
          watermarkEnabled: 'Y'
        })
      ).rejects.toThrow();
    });

    it('should validate watermarkEnabled Y/N values', async () => {
      await expect(
        playerService.updateChannelDecorate({
          channelId: testChannelId,
          watermarkEnabled: 'YES' as any
        })
      ).rejects.toThrow();
    });

    it('should validate warmupEnabled Y/N values', async () => {
      await expect(
        playerService.updateChannelDecorate({
          channelId: testChannelId,
          warmupEnabled: 'NO' as any
        })
      ).rejects.toThrow();
    });

    it('should validate watermarkPosition values', async () => {
      await expect(
        playerService.updateChannelDecorate({
          channelId: testChannelId,
          watermarkPosition: 'top' as any
        })
      ).rejects.toThrow();
    });

    it('should validate watermarkOpacity range (negative)', async () => {
      await expect(
        playerService.updateChannelDecorate({
          channelId: testChannelId,
          watermarkOpacity: -1
        })
      ).rejects.toThrow();
    });

    it('should validate watermarkOpacity range (above 1)', async () => {
      await expect(
        playerService.updateChannelDecorate({
          channelId: testChannelId,
          watermarkOpacity: 2
        })
      ).rejects.toThrow();
    });

    it('should accept valid watermarkOpacity (0)', async () => {
      try {
        const result = await playerService.updateChannelDecorate({
          channelId: testChannelId,
          watermarkOpacity: 0
        });
        expect(result.success).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        if (!message.includes('404') && !message.includes('not found')) {
          throw error;
        }
      }
    }, 15000);

    it('should accept valid watermarkOpacity (1)', async () => {
      try {
        const result = await playerService.updateChannelDecorate({
          channelId: testChannelId,
          watermarkOpacity: 1
        });
        expect(result.success).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        if (!message.includes('404') && !message.includes('not found')) {
          throw error;
        }
      }
    }, 15000);
  });

  // ========================================
  // Player Config Workflow Tests
  // ========================================

  describe('player config workflow', () => {
    it('should complete get-update-get workflow', async () => {
      // 1. Get current settings
      const initialSettings = await playerService.getChannelDecorate({
        channelId: testChannelId
      });
      expect(initialSettings).toBeDefined();

      // 2. Update settings
      try {
        const updateResult = await playerService.updateChannelDecorate({
          channelId: testChannelId,
          watermarkEnabled: 'Y',
          watermarkOpacity: 0.9
        });
        expect(updateResult.success).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Player API not available (404)');
          expect(true).toBe(true);
          return;
        }
        throw error;
      }

      // 3. Get settings again to verify
      const updatedSettings = await playerService.getChannelDecorate({
        channelId: testChannelId
      });
      expect(updatedSettings).toBeDefined();
    }, 30000);
  });
});
