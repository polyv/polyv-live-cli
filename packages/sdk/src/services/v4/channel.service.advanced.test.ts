/**
 * @fileoverview Unit tests for V4ChannelService - Advanced Configuration
 * @module services/v4/channel.service.advanced.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { V4ChannelService } from './channel.service.js';
import type { PolyVClient } from '../../client.js';

// Mock the PolyVClient
const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
} as unknown as PolyVClient;

describe('V4ChannelService - Advanced Configuration', () => {
  let service: V4ChannelService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4ChannelService(mockClient);
  });

  // ============================================
  // Account Management Tests
  // ============================================

  describe('addAccount', () => {
    it('[P0] should add account successfully', async () => {
      const mockResponse = { accountId: 1001 };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.addAccount({
        channelId: '12345678',
        account: 'test@example.com',
        password: 'password123',
        nickname: 'Test Account'
      });

      expect(result.accountId).toBe(1001);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/operate/account/add-account',
        null,
        expect.objectContaining({
          params: expect.objectContaining({
            channelId: '12345678'
          })
        })
      );
    });

    it('[P1] should add multiple accounts sequentially', async () => {
      for (let i = 0; i < 3; i++) {
        const mockResponse = { accountId: 1001 + i };
        mockHttpClient.post.mockResolvedValueOnce(mockResponse);

        const result = await service.addAccount({
          channelId: '12345678',
          account: `account${i}@example.com`,
          password: 'password',
          nickname: `Account ${i}`
        });

        expect(result.accountId).toBe(1001 + i);
      }
    });
  });

  describe('updateAccount', () => {
    it('[P0] should update account successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateAccount({
        channelId: '12345678',
        accountId: 1001,
        nickname: 'Updated Nickname'
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });

    it('[P1] should update account password', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateAccount({
        channelId: '12345678',
        accountId: 1001,
        password: 'newPassword123'
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('getAccountViewer', () => {
    it('[P0] should get account viewer settings', async () => {
      const mockResponse = {
        authType: 'password',
        enabled: 'Y',
        viewerAuthEnabled: 'N'
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getAccountViewer({
        channelId: '12345678'
      });

      expect(result.authType).toBe('password');
    });
  });

  describe('updateAccountViewer', () => {
    it('[P0] should update account viewer settings', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateAccountViewer({
        channelId: '12345678',
        authType: 'code',
        enabled: 'Y'
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  // ============================================
  // Bitrate Settings Tests
  // ============================================

  describe('channelSetPullBitrate', () => {
    it('[P0] should set pull bitrate successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.channelSetPullBitrate({
        channelId: '12345678',
        bitrate: 2000
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/operate/channel-set-pull-bitrate',
        null,
        expect.objectContaining({
          params: expect.objectContaining({
            bitrate: 2000
          })
        })
      );
    });

    it('[P1] should handle different bitrate values', async () => {
      const bitrates = [500, 1000, 1500, 2000, 3000];

      for (const bitrate of bitrates) {
        mockHttpClient.post.mockResolvedValueOnce(undefined);

        await service.channelSetPullBitrate({
          channelId: '12345678',
          bitrate
        });

        expect(mockHttpClient.post).toHaveBeenCalledWith(
          expect.any(String),
          null,
          expect.objectContaining({
            params: expect.objectContaining({ bitrate })
          })
        );
      }
    });
  });

  // ============================================
  // Chat Settings Tests
  // ============================================

  describe('updateChatEnabled', () => {
    it('[P0] should enable chat successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateChatEnabled({
        channelId: '12345678',
        chatEnabled: 'Y'
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/chat/update-chat-enabled',
        null,
        expect.objectContaining({
          params: expect.objectContaining({
            chatEnabled: 'Y'
          })
        })
      );
    });

    it('[P0] should disable chat successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateChatEnabled({
        channelId: '12345678',
        chatEnabled: 'N'
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        null,
        expect.objectContaining({
          params: expect.objectContaining({
            chatEnabled: 'N'
          })
        })
      );
    });
  });

  // ============================================
  // Decorate Settings Tests
  // ============================================

  describe('updateDecorate', () => {
    it('[P0] should update decorate with cover image', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateDecorate({
        channelId: '12345678',
        coverImg: 'https://example.com/cover.jpg',
        coverEnabled: 'Y'
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });

    it('[P1] should update decorate with multiple settings', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateDecorate({
        channelId: '12345678',
        coverImg: 'https://example.com/cover.jpg',
        coverEnabled: 'Y',
        adImg: 'https://example.com/ad.jpg',
        adEnabled: 'Y'
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('updateSkin', () => {
    it('[P0] should update skin settings', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateSkin({
        channelId: '12345678',
        skinId: 'skin123'
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  // ============================================
  // Donate Settings Tests
  // ============================================

  describe('getDonate', () => {
    it('[P0] should get donate settings', async () => {
      const mockResponse = {
        enabled: 'Y',
        donateType: 'money'
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getDonate({ channelId: '12345678' });

      expect(result.enabled).toBe('Y');
    });
  });

  describe('updateDonate', () => {
    it('[P0] should update donate settings', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateDonate({
        channelId: '12345678',
        donateGiftEnabled: 'Y'
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  // ============================================
  // Distribute Settings Tests
  // ============================================

  describe('distributeList', () => {
    it('[P0] should list distribute settings', async () => {
      const mockResponse = {
        contents: [
          { viewerId: 'viewer1', weight: 1 },
          { viewerId: 'viewer2', weight: 2 }
        ]
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.distributeList({
        channelId: '12345678',
        pageNumber: 1,
        pageSize: 10
      });

      expect(result.contents).toHaveLength(2);
    });
  });

  describe('distributeStatistic', () => {
    it('[P0] should get distribute statistics', async () => {
      const mockResponse = {
        totalViewers: 1000,
        distributedCount: 500
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.distributeStatistic({
        channelId: '12345678'
      });

      expect(result.totalViewers).toBe(1000);
    });
  });

  describe('updateMasterSwitch', () => {
    it('[P0] should update master switch', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateMasterSwitch({
        channelId: '12345678',
        enabled: 'Y'
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/distribute/update-master-switch',
        null,
        { params: { channelId: '12345678', distributeEnabled: 'Y' } }
      );
    });
  });

  describe('updateSwitch', () => {
    it('[P0] should update switch', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateSwitch({
        channelId: '12345678',
        distributeId: 1,
        enabled: 'Y'
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/distribute/update-switch',
        null,
        { params: { channelId: '12345678', distributeIds: '1', distributeEnabled: 'Y' } }
      );
    });
  });

  // ============================================
  // Monitor and Status Tests
  // ============================================

  describe('monitorListStreamInfo', () => {
    it('[P0] should list stream info for multiple channels', async () => {
      const mockResponse = [
        { channelId: '123', status: 'live', bitrate: 2000 },
        { channelId: '124', status: 'idle', bitrate: 0 }
      ];
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.monitorListStreamInfo({
        channelIds: '123,124'
      });

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('live');
    });
  });

  // ============================================
  // Subtitle Advanced Tests
  // ============================================

  describe('updateChannelSubtitle', () => {
    it('[P0] should update channel subtitle', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateChannelSubtitle({
        channelId: '12345678',
        videoId: 'video123',
        subtitleUrl: 'https://example.com/subtitle.vtt',
        language: 'zh-CN'
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('queryPlaybackVideoInfo', () => {
    it('[P0] should query playback video info', async () => {
      const mockResponse = {
        videoId: 'video123',
        duration: 3600,
        status: 'processed'
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.queryPlaybackVideoInfo({
        channelId: '12345678',
        videoId: 'video123'
      });

      expect(result.videoId).toBe('video123');
    });
  });

  // ============================================
  // Session Advanced Tests
  // ============================================

  describe('getRelevance', () => {
    it('[P0] should get session relevance info', async () => {
      const mockResponse = {
        sessionId: 'session123',
        relevanceType: 'playback',
        relevanceId: 'video123'
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getRelevance({
        channelId: '12345678',
        sessionId: 'session123'
      });

      expect(result.sessionId).toBe('session123');
    });
  });

  // ============================================
  // PageMRecord Tests
  // ============================================

  describe('pageMRecord', () => {
    it('[P0] should get record files list', async () => {
      const mockResponse = {
        contents: [
          { recordId: 'rec1', startTime: 1678800000000 },
          { recordId: 'rec2', startTime: 1678900000000 }
        ],
        total: 2
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.pageMRecord({
        channelId: '12345678',
        pageNumber: 1,
        pageSize: 10
      });

      expect(result.contents).toHaveLength(2);
    });
  });

  // ============================================
  // List Operations Advanced Tests
  // ============================================

  describe('channelBasicList', () => {
    it('[P0] should get channel basic list with pagination', async () => {
      const mockResponse = {
        contents: [
          { channelId: '123', name: 'Channel 1' },
          { channelId: '124', name: 'Channel 2' }
        ]
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.channelBasicList({
        pageNumber: 1,
        pageSize: 20
      });

      expect(result.contents).toHaveLength(2);
    });
  });

  describe('channelSimpleList', () => {
    it('[P0] should get channel simple list without pagination', async () => {
      const mockResponse = {
        contents: [
          { channelId: '123', name: 'Channel 1' }
        ]
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.channelSimpleList();

      expect(result.contents).toHaveLength(1);
    });
  });

  describe('channelDetailList', () => {
    it('[P0] should get channel detail list', async () => {
      const mockResponse = {
        contents: [
          {
            channelId: '123',
            name: 'Channel 1',
            viewerCount: 100,
            status: 'live'
          }
        ]
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.channelDetailList({
        pageNumber: 1,
        pageSize: 10
      });

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].viewerCount).toBe(100);
    });
  });

  describe('listChannelBasicInfo', () => {
    it('[P0] should list channel basic info', async () => {
      const mockResponse = {
        channelId: '12345678',
        name: 'Test Channel',
        status: 'live'
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listChannelBasicInfo({
        channelId: '12345678'
      });

      expect(result.channelId).toBe('12345678');
    });
  });
});
