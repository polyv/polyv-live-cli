/**
 * @fileoverview Unit tests for V4ChannelService
 * @module services/v4/channel.service.test
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

describe('V4ChannelService', () => {
  let service: V4ChannelService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4ChannelService(mockClient);
  });

  // ============================================
  // create Tests
  // ============================================

  describe('create', () => {
    it('[P0] should create channel successfully', async () => {
      const mockResponse = { channelId: '12345678', name: 'Test Channel' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.create({ name: 'Test Channel', newScene: 'topclass', template: 'ppt' });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/create',
        { name: 'Test Channel', newScene: 'topclass', template: 'ppt' }
      );
    });

    it('[P1] should throw error when name is empty', async () => {
      await expect(
        service.create({ name: '', newScene: 'topclass', template: 'ppt' })
      ).rejects.toThrow('name is required');
    });
  });

  // ============================================
  // createBatch Tests
  // ============================================

  describe('createBatch', () => {
    it('[P0] should batch create channels successfully', async () => {
      const mockResponse = { createdCount: 2 };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createBatch({
        channels: [{ name: 'Channel 1', newScene: 'topclass', template: 'ppt' }, { name: 'Channel 2', newScene: 'topclass', template: 'ppt' }],
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/create-batch',
        [
          { name: 'Channel 1', newScene: 'topclass', template: 'ppt' },
          { name: 'Channel 2', newScene: 'topclass', template: 'ppt' },
        ]
      );
    });

    it('[P1] should throw error when channels is empty', async () => {
      await expect(
        service.createBatch({ channels: [] })
      ).rejects.toThrow('channels is required and cannot be empty');
    });
  });

  // ============================================
  // update Tests
  // ============================================

  describe('update', () => {
    it('[P0] should update channel successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.update({ channelId: '12345678', name: 'Updated Channel' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/update',
        { name: 'Updated Channel' },
        { params: { channelId: '12345678' } }
      );
    });

    it('[P1] should map channelPasswd to JSON body password', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.update({ channelId: '12345678', channelPasswd: 'abc12345' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/update',
        { password: 'abc12345' },
        { params: { channelId: '12345678' } }
      );
    });

    it('[P1] should throw error when channelId is empty', async () => {
      await expect(
        service.update({ channelId: '', name: 'Test' })
      ).rejects.toThrow('channelId is required');
    });
  });

  // ============================================
  // getChannel Tests
  // ============================================

  describe('getChannel', () => {
    it('[P0] should get channel successfully', async () => {
      const mockResponse = { channelId: '12345678', name: 'Test Channel' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getChannel({ channelId: '12345678' });

      expect(result).toEqual(mockResponse);
    });

    it('[P1] should throw error when channelId is empty', async () => {
      await expect(
        service.getChannel({ channelId: '' })
      ).rejects.toThrow('channelId is required');
    });
  });

  // ============================================
  // getChannelDetail Tests
  // ============================================

  describe('getChannelDetail', () => {
    it('[P0] should get channel detail successfully', async () => {
      const mockResponse = { channelId: '12345678', name: 'Test Channel', viewerCount: 100 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getChannelDetail({ channelId: '12345678' });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // listChannelBasic Tests
  // ============================================

  describe('listChannelBasic', () => {
    it('[P0] should list channels successfully', async () => {
      const mockResponse = { contents: [{ channelId: '12345678' }] };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listChannelBasic({ pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
    });

    it('[P1] should throw error when pageNumber < 1', async () => {
      await expect(
        service.listChannelBasic({ pageNumber: 0, pageSize: 10 })
      ).rejects.toThrow('pageNumber must be >= 1');
    });
  });

  // ============================================
  // playbackList Tests
  // ============================================

  describe('playbackList', () => {
    it('[P0] should list playbacks successfully', async () => {
      const mockResponse = { contents: [{ videoId: '123' }], total: 1 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.playbackList({ channelId: '12345678', pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
    });

    it('[P1] should throw error when channelId is empty', async () => {
      await expect(
        service.playbackList({ channelId: '', pageNumber: 1, pageSize: 10 })
      ).rejects.toThrow('channelId is required');
    });
  });

  // ============================================
  // sessionCreate Tests
  // ============================================

  describe('sessionCreate', () => {
    it('[P0] should create session successfully', async () => {
      const mockResponse = { sessionId: 'session123' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.sessionCreate({ channelId: '12345678', name: 'Session 1' });

      expect(result).toEqual(mockResponse);
    });

    it('[P1] should throw error when channelId is empty', async () => {
      await expect(
        service.sessionCreate({ channelId: '', name: 'Test' })
      ).rejects.toThrow('channelId is required');
    });
  });

  // ============================================
  // sessionList Tests
  // ============================================

  describe('sessionList', () => {
    it('[P0] should list sessions successfully', async () => {
      const mockResponse = { contents: [{ sessionId: 'session123' }], total: 1 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.sessionList({ channelId: '12345678', pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // sessionGet Tests
  // ============================================

  describe('sessionGet', () => {
    it('[P0] should get session successfully', async () => {
      const mockResponse = { sessionId: 'session123', name: 'Session 1' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.sessionGet({ channelId: '12345678', sessionId: 'session123' });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // sessionUpdate Tests
  // ============================================

  describe('sessionUpdate', () => {
    it('[P0] should update session successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.sessionUpdate({ channelId: '12345678', sessionId: 'session123', name: 'Updated' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  // ============================================
  // sessionDelete Tests
  // ============================================

  describe('sessionDelete', () => {
    it('[P0] should delete session successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.sessionDelete({ channelId: '12345678', sessionId: 'session123' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  // ============================================
  // getDecorate Tests
  // ============================================

  describe('getDecorate', () => {
    it('[P0] should get decorate settings successfully', async () => {
      const mockResponse = { enabled: 'Y' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getDecorate({ channelId: '12345678' });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // updateDecorate Tests
  // ============================================

  describe('updateDecorate', () => {
    it('[P0] should update decorate settings successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateDecorate({ channelId: '12345678', coverImg: 'https://example.com/cover.jpg', coverEnabled: 'Y' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  // ============================================
  // blacklistAdd Tests
  // ============================================

  describe('blacklistAdd', () => {
    it('[P0] should add to blacklist successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.blacklistAdd({ channelId: '12345678', viewerIds: ['viewer1'] });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  // ============================================
  // blacklistPage Tests
  // ============================================

  describe('blacklistPage', () => {
    it('[P0] should list blacklist successfully', async () => {
      const mockResponse = { contents: [{ viewerId: 'viewer1' }] };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.blacklistPage({ channelId: '12345678', pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // groupAdd Tests
  // ============================================

  describe('groupAdd', () => {
    it('[P0] should add group successfully', async () => {
      const mockResponse = { groupId: 'group123' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.groupAdd({ channelId: '12345678', name: 'Group 1' });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // groupList Tests
  // ============================================

  describe('groupList', () => {
    it('[P0] should list groups successfully', async () => {
      const mockResponse = [{ groupId: 'group123', name: 'Group 1' }];
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.groupList({ channelId: '12345678' });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // liveSummary Tests
  // ============================================

  describe('liveSummary', () => {
    it('[P0] should get live summary successfully', async () => {
      const mockResponse = { totalViewers: 1000, maxConcurrent: 500 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.liveSummary({ channelId: '12345678', startTime: 1678800000000, endTime: 1678999999999 });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // getAllLiveStatusList Tests
  // ============================================

  describe('getAllLiveStatusList', () => {
    it('[P0] should get all live status list successfully', async () => {
      const mockResponse = [{ channelId: '12345678', status: 'live' }];
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getAllLiveStatusList();

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // listAllLanguage Tests
  // ============================================

  describe('listAllLanguage', () => {
    it('[P0] should list all languages successfully', async () => {
      const mockResponse = [{ code: 'zh-CN', name: 'Chinese' }];
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listAllLanguage();

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // viewerLogout Tests
  // ============================================

  describe('viewerLogout', () => {
    it('[P0] should logout viewer successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.viewerLogout({ channelId: '12345678', viewerId: 'viewer1' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  // ============================================
  // getSubtitle Tests
  // ============================================

  describe('getSubtitle', () => {
    it('[P0] should get subtitle successfully', async () => {
      const mockResponse = { subtitleId: 'sub123', content: 'Hello' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getSubtitle({ channelId: '12345678' });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // updateSubtitle Tests
  // ============================================

  describe('updateSubtitle', () => {
    it('[P0] should update subtitle successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateSubtitle({ channelId: '12345678', videoId: 'video123', subtitleUrl: 'https://example.com/sub.vtt', language: 'zh-CN' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  // ============================================
  // getByRole Tests
  // ============================================

  describe('getByRole', () => {
    it('[P0] should get by role successfully', async () => {
      const mockResponse = { roleId: 1, config: {} };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getByRole({ channelId: '12345678', role: 'admin' });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // updateByRole Tests
  // ============================================

  describe('updateByRole', () => {
    it('[P0] should update by role successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateByRole({ channelId: '12345678', role: 'admin', config: {} });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  // ============================================
  // getLiveSession Tests
  // ============================================

  describe('getLiveSession', () => {
    it('[P0] should get live session successfully', async () => {
      const mockResponse = { sessionId: 'session123', status: 'live' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getLiveSession({ channelId: '12345678' });

      expect(result).toEqual(mockResponse);
    });
  });
});
