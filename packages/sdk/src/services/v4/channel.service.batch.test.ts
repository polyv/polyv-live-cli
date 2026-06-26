/**
 * @fileoverview Unit tests for V4ChannelService - Batch Operations
 * @module services/v4/channel.service.batch.test
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

describe('V4ChannelService - Batch Operations', () => {
  let service: V4ChannelService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4ChannelService(mockClient);
  });

  // ============================================
  // createBatch Tests - Comprehensive
  // ============================================

  describe('createBatch', () => {
    it('[P0] should batch create 2 channels successfully', async () => {
      const mockResponse = {
        createdCount: 2,
        channelIds: ['12345678', '12345679']
      };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createBatch({
        channels: [
          { name: 'Channel 1', newScene: 'topclass', template: 'ppt' },
          { name: 'Channel 2', newScene: 'topclass', template: 'ppt' }
        ],
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/create-batch',
        expect.arrayContaining([
          expect.objectContaining({ name: 'Channel 1' }),
          expect.objectContaining({ name: 'Channel 2' })
        ])
      );
    });

    it('[P0] should batch create maximum 30 channels', async () => {
      const channels = Array.from({ length: 30 }, (_, i) => ({
        name: `Channel ${i + 1}`,
        newScene: 'topclass' as const,
        template: 'ppt' as const
      }));

      const mockResponse = { createdCount: 30 };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createBatch({ channels });

      expect(result.createdCount).toBe(30);
    });

    it('[P1] should throw error when channels exceeds 30', async () => {
      const channels = Array.from({ length: 31 }, (_, i) => ({
        name: `Channel ${i + 1}`,
        newScene: 'topclass' as const,
        template: 'ppt' as const
      }));

      await expect(
        service.createBatch({ channels })
      ).rejects.toThrow('channels cannot contain more than 30 items');
    });

    it('[P1] should throw error when channels array is empty', async () => {
      await expect(
        service.createBatch({ channels: [] })
      ).rejects.toThrow('channels is required and cannot be empty');
    });

    it('[P1] should throw error when channels is undefined', async () => {
      await expect(
        service.createBatch({ channels: undefined as any })
      ).rejects.toThrow('channels is required and cannot be empty');
    });

    it('[P2] should throw error when first channel name is empty', async () => {
      await expect(
        service.createBatch({
          channels: [
            { name: '', newScene: 'topclass', template: 'ppt' },
            { name: 'Valid', newScene: 'topclass', template: 'ppt' }
          ]
        })
      ).rejects.toThrow('channels[0].name is required');
    });

    it('[P2] should throw error when last channel name is empty', async () => {
      await expect(
        service.createBatch({
          channels: [
            { name: 'Valid', newScene: 'topclass', template: 'ppt' },
            { name: '', newScene: 'topclass', template: 'ppt' }
          ]
        })
      ).rejects.toThrow('channels[1].name is required');
    });

    it('[P2] should throw error when middle channel name is empty', async () => {
      await expect(
        service.createBatch({
          channels: [
            { name: 'Valid1', newScene: 'topclass', template: 'ppt' },
            { name: '', newScene: 'topclass', template: 'ppt' },
            { name: 'Valid2', newScene: 'topclass', template: 'ppt' }
          ]
        })
      ).rejects.toThrow('channels[1].name is required');
    });

    it('[P1] should handle different scene types in batch', async () => {
      const mockResponse = { createdCount: 3 };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createBatch({
        channels: [
          { name: 'Top Class', newScene: 'topclass', template: 'ppt' },
          { name: 'ALV', newScene: 'alv', template: 'alone' },
          { name: 'PPT', newScene: 'ppt', template: 'ppt' }
        ]
      });

      expect(result.createdCount).toBe(3);
    });

    it('[P2] should handle network timeout in batch creation', async () => {
      mockHttpClient.post.mockRejectedValueOnce(new Error('Network timeout'));

      await expect(
        service.createBatch({
          channels: [{ name: 'Test', newScene: 'topclass', template: 'ppt' }]
        })
      ).rejects.toThrow('Network timeout');
    });

    it('[P2] should handle partial success response', async () => {
      const mockResponse = {
        createdCount: 1,
        failedCount: 1,
        errors: [{ index: 1, reason: 'Name already exists' }]
      };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createBatch({
        channels: [
          { name: 'Success', newScene: 'topclass', template: 'ppt' },
          { name: 'Duplicate', newScene: 'topclass', template: 'ppt' }
        ]
      });

      expect(result.createdCount).toBe(1);
      expect(result.failedCount).toBe(1);
    });
  });

  // ============================================
  // distributeCreateBatch Tests
  // ============================================

  describe('distributeCreateBatch', () => {
    it('[P0] should create distribute batch successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      const distributes = [
        { viewerId: 'viewer1', weight: 1 },
        { viewerId: 'viewer2', weight: 2 }
      ];

      await service.distributeCreateBatch({
        channelId: '12345678',
        distributes
      });

      // channelId must travel in the signed query params, and the distributes
      // array is sent as the bare request body (server deserializes the body
      // into a List, not an object).
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/distribute/create-batch',
        distributes,
        { params: { channelId: '12345678' } }
      );
    });

    it('[P1] should handle empty distributes array', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.distributeCreateBatch({
        channelId: '12345678',
        distributes: []
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  // ============================================
  // distributeUpdateBatch Tests
  // ============================================

  describe('distributeUpdateBatch', () => {
    it('[P0] should update distribute batch successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      const distributes = [{ viewerId: 'viewer1', weight: 3 }];

      await service.distributeUpdateBatch({
        channelId: '12345678',
        distributes
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/distribute/update-batch',
        distributes,
        { params: { channelId: '12345678' } }
      );
    });
  });

  // ============================================
  // distributeDeleteBatch Tests
  // ============================================

  describe('distributeDeleteBatch', () => {
    it('[P0] should delete distribute batch successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.distributeDeleteBatch({
        channelId: '12345678',
        ids: [1, 2]
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/distribute/delete-batch',
        null,
        { params: { channelId: '12345678', distributeIds: '1,2' } }
      );
    });
  });

  // ============================================
  // deleteAccounts Tests
  // ============================================

  describe('deleteAccounts', () => {
    it('[P0] should delete multiple accounts successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteAccounts({
        channelId: '12345678',
        accountIds: [1, 2, 3]
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/operate/account/delete-accounts',
        null,
        expect.objectContaining({
          params: expect.objectContaining({
            channelId: '12345678',
            accountIds: '1,2,3'
          })
        })
      );
    });

    it('[P1] should handle empty accountIds array', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteAccounts({
        channelId: '12345678',
        accountIds: []
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  // ============================================
  // batchPublishSubtitle Tests
  // ============================================

  describe('batchPublishSubtitle', () => {
    it('[P0] should batch publish subtitles successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.batchPublishSubtitle({
        channelId: '12345678',
        subtitles: [
          { videoId: 'video1', subtitleUrl: 'https://example.com/sub1.vtt' },
          { videoId: 'video2', subtitleUrl: 'https://example.com/sub2.vtt' }
        ]
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });

    it('[P1] should handle single subtitle in batch', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.batchPublishSubtitle({
        channelId: '12345678',
        subtitles: [
          { videoId: 'video1', subtitleUrl: 'https://example.com/sub1.vtt' }
        ]
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  // ============================================
  // batchCreatePopularization Tests
  // ============================================

  describe('batchCreatePopularization', () => {
    it('[P0] should batch create popularizations successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.batchCreatePopularization({
        channelId: '12345678',
        popularizations: [
          { title: 'Promo 1', url: 'https://example.com/1' },
          { title: 'Promo 2', url: 'https://example.com/2' }
        ]
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });

    it('[P1] should handle large batch of popularizations', async () => {
      const popularizations = Array.from({ length: 50 }, (_, i) => ({
        title: `Promo ${i + 1}`,
        url: `https://example.com/${i + 1}`
      }));

      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.batchCreatePopularization({
        channelId: '12345678',
        popularizations
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });
});
