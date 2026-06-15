/**
 * @fileoverview Unit tests for V4ChatService
 * @module services/v4/chat.service.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { V4ChatService } from './chat.service.js';
import type { PolyVClient } from '../../client.js';

// Mock the PolyVClient
const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
} as unknown as PolyVClient;

describe('V4ChatService', () => {
  let service: V4ChatService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4ChatService(mockClient);
  });

  // ============================================
  // sendCustomMessage Tests
  // ============================================

  describe('sendCustomMessage', () => {
    it('[P0] should send custom message with content successfully', async () => {
      mockHttpClient.get.mockResolvedValueOnce(undefined);

      await service.sendCustomMessage({
        channelId: '123456',
        content: 'Hello everyone!',
        watchType: '1',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/chat/send-custom-message',
        { params: { channelId: '123456', content: 'Hello everyone!', watchType: '1' } }
      );
    });

    it('[P0] should send custom message with imgUrl successfully', async () => {
      mockHttpClient.get.mockResolvedValueOnce(undefined);

      await service.sendCustomMessage({
        channelId: '123456',
        imgUrl: 'https://example.com/image.jpg',
      });

      expect(mockHttpClient.get).toHaveBeenCalled();
    });

    it('[P1] should throw error when channelId is empty', async () => {
      await expect(
        service.sendCustomMessage({ channelId: '', content: 'Hello' } as any)
      ).rejects.toThrow('channelId is required and cannot be empty');
    });

    it('[P1] should throw error when neither content nor imgUrl is provided', async () => {
      await expect(
        service.sendCustomMessage({ channelId: '123456' } as any)
      ).rejects.toThrow('content or imgUrl is required');
    });

    it('[P1] should throw error when content exceeds 1000 characters', async () => {
      await expect(
        service.sendCustomMessage({ channelId: '123456', content: 'a'.repeat(1001) })
      ).rejects.toThrow('content cannot exceed 1000 characters');
    });
  });

  // ============================================
  // sendCustomMessageEncode Tests
  // ============================================

  describe('sendCustomMessageEncode', () => {
    it('[P0] should send encoded custom message successfully', async () => {
      mockHttpClient.get.mockResolvedValueOnce(undefined);

      await service.sendCustomMessageEncode({
        channelId: '123456',
        content: encodeURIComponent('Hello with special chars!'),
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/chat/send-custom-message-encode',
        { params: expect.objectContaining({ channelId: '123456' }) }
      );
    });
  });

  // ============================================
  // listBulletins Tests
  // ============================================

  describe('listBulletins', () => {
    it('[P0] should list bulletins successfully', async () => {
      const mockResponse = {
        contents: [{ id: 1, title: 'Notice 1' }],
        total: 1,
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listBulletins({
        channelId: '123456',
        pageNumber: 1,
        pageSize: 10,
      });

      expect(result).toEqual(mockResponse);
    });

    it('[P1] should throw error when pageNumber < 1', async () => {
      await expect(
        service.listBulletins({ channelId: '123456', pageNumber: 0, pageSize: 10 })
      ).rejects.toThrow('pageNumber must be >= 1');
    });

    it('[P1] should throw error when pageSize > 1000', async () => {
      await expect(
        service.listBulletins({ channelId: '123456', pageNumber: 1, pageSize: 1001 })
      ).rejects.toThrow('pageSize must be between 1 and 1000');
    });
  });

  // ============================================
  // cleanNotices Tests
  // ============================================

  describe('cleanNotices', () => {
    it('[P0] should clean notices successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.cleanNotices({ channelId: '123456' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/chat/notice/clean',
        null,
        { params: { channelId: '123456' } }
      );
    });

    it('[P1] should throw error when channelId is empty', async () => {
      await expect(
        service.cleanNotices({ channelId: '' })
      ).rejects.toThrow('channelId is required and cannot be empty');
    });
  });

  // ============================================
  // listQa Tests
  // ============================================

  describe('listQa', () => {
    it('[P0] should list Q&A successfully', async () => {
      const mockResponse = {
        contents: [{ id: 1, question: 'Q1' }],
        total: 1,
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listQa({
        channelId: '123456',
        pageNumber: 1,
        pageSize: 10,
      });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // batchCheckin Tests
  // ============================================

  describe('batchCheckin', () => {
    it('[P0] should batch checkin successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.batchCheckin({
        items: [
          {
            channelId: '123456',
            limitTime: 60,
            message: 'Please check in',
          },
        ],
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/chat/batch-checkin',
        expect.arrayContaining([expect.objectContaining({ channelId: '123456' })])
      );
    });

    it('[P1] should throw error when items is empty', async () => {
      await expect(
        service.batchCheckin({ items: [] })
      ).rejects.toThrow('items is required and cannot be empty');
    });

    it('[P1] should throw error when items exceeds 1000', async () => {
      const items = Array.from({ length: 1001 }, (_, i) => ({
        channelId: `channel${i}`,
        limitTime: 60,
      }));

      await expect(
        service.batchCheckin({ items })
      ).rejects.toThrow('items cannot contain more than 1000 items');
    });

    it('[P1] should throw error when item channelId is empty', async () => {
      await expect(
        service.batchCheckin({ items: [{ channelId: '', limitTime: 60 }] })
      ).rejects.toThrow('items[0].channelId is required');
    });
  });

  // ============================================
  // getRobotSetting Tests
  // ============================================

  describe('getRobotSetting', () => {
    it('[P0] should get robot setting successfully', async () => {
      const mockResponse = { robotNumber: 10, addRobotModel: 1 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getRobotSetting({ channelId: '123456' });

      expect(result).toEqual(mockResponse);
    });

    it('[P1] should throw error when channelId is empty', async () => {
      await expect(
        service.getRobotSetting({ channelId: '' })
      ).rejects.toThrow('channelId is required and cannot be empty');
    });
  });

  // ============================================
  // getRobotStats Tests
  // ============================================

  describe('getRobotStats', () => {
    it('[P0] should get robot stats successfully', async () => {
      const mockResponse = { total: 5, active: 3 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getRobotStats({ channelId: '123456' });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // pauseRobot Tests
  // ============================================

  describe('pauseRobot', () => {
    it('[P0] should pause robot successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.pauseRobot({ channelId: '123456' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/chat/robot/pause',
        null,
        { params: { channelId: '123456' } }
      );
    });
  });

  // ============================================
  // updateRobotSetting Tests
  // ============================================

  describe('updateRobotSetting', () => {
    it('[P0] should update robot setting successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateRobotSetting({
        channelId: '123456',
        robotNumber: 10,
        addRobotModel: 'timely',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/chat/robot/update-robot-setting',
        null,
        { params: { channelId: '123456', robotNumber: 10, addRobotModel: 'timely' } }
      );
    });

    it('[P1] should throw error when channelId is empty', async () => {
      await expect(
        service.updateRobotSetting({ channelId: '', robotNumber: 10, addRobotModel: 'timely' })
      ).rejects.toThrow('channelId is required and cannot be empty');
    });
  });
});
