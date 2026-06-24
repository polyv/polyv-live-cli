/**
 * @fileoverview Unit tests for V4RobotService
 * @module services/v4/robot.service.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { V4RobotService } from './robot.service.js';
import type { PolyVClient } from '../../client.js';

// Mock the PolyVClient
const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
} as unknown as PolyVClient;

describe('V4RobotService', () => {
  let service: V4RobotService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4RobotService(mockClient);
  });

  // ============================================
  // listRobots Tests
  // ============================================

  describe('listRobots', () => {
    it('[P0] should list robots successfully with params', async () => {
      const mockResponse = {
        contents: [{ id: 1, name: 'Robot A', avatar: 'http://example.com/a.jpg' }],
        total: 1,
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listRobots({ pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/global/robot/list',
        { params: { pageNumber: 1, pageSize: 10 } }
      );
    });

    it('[P0] should list robots without params', async () => {
      const mockResponse = { contents: [], total: 0 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listRobots();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/global/robot/list',
        { params: {} }
      );
    });
  });

  // ============================================
  // batchSaveRobots Tests
  // ============================================

  describe('batchSaveRobots', () => {
    it('[P0] should batch save robots successfully', async () => {
      const mockResponse = { savedCount: 2 };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const params = {
        robots: [
          { name: 'Robot A', avatar: 'http://example.com/a.jpg' },
          { name: 'Robot B' },
        ],
      };

      const result = await service.batchSaveRobots(params);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/global/robot/save-batch',
        params.robots
      );
    });

    it('[P1] should throw error when robots array is empty', async () => {
      await expect(
        service.batchSaveRobots({ robots: [] })
      ).rejects.toThrow('robots is required and cannot be empty');
    });

    it('[P1] should throw error when robots exceeds 200', async () => {
      const robots = Array.from({ length: 201 }, (_, i) => ({ name: `Robot ${i}` }));

      await expect(
        service.batchSaveRobots({ robots })
      ).rejects.toThrow('robots cannot contain more than 200 items');
    });

    it('[P1] should throw error when robot name exceeds 20 characters', async () => {
      await expect(
        service.batchSaveRobots({ robots: [{ name: 'a'.repeat(21) }] })
      ).rejects.toThrow('robots[0].name cannot exceed 20 characters');
    });

    it('[P1] should throw error when robot name contains emoji', async () => {
      await expect(
        service.batchSaveRobots({ robots: [{ name: 'Robot 😀' }] })
      ).rejects.toThrow('robots[0].name cannot contain emoji');
    });
  });

  // ============================================
  // batchDeleteRobots Tests
  // ============================================

  describe('batchDeleteRobots', () => {
    it('[P0] should batch delete robots successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.batchDeleteRobots({ ids: [1, 2, 3] });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/global/robot/delete-batch',
        null,
        { params: { ids: '1,2,3' } }
      );
    });

    it('[P1] should throw error when ids is empty', async () => {
      await expect(
        service.batchDeleteRobots({ ids: [] })
      ).rejects.toThrow('ids is required and cannot be empty');
    });

    it('[P1] should throw error when ids exceeds 200', async () => {
      const ids = Array.from({ length: 201 }, (_, i) => i);

      await expect(
        service.batchDeleteRobots({ ids })
      ).rejects.toThrow('ids cannot contain more than 200 items');
    });
  });

  // ============================================
  // getRobotSetting Tests
  // ============================================

  describe('getRobotSetting', () => {
    it('[P0] should get robot setting successfully', async () => {
      const mockResponse = {
        robotNumber: 10,
        addRobotModel: 'timely',
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getRobotSetting({ channelId: '12345678' });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/robot/setting/get',
        { params: { channelId: '12345678' } }
      );
    });

    it('[P1] should throw error when channelId is empty', async () => {
      await expect(
        service.getRobotSetting({ channelId: '' })
      ).rejects.toThrow('channelId is required and cannot be empty');
    });
  });

  // ============================================
  // updateRobotSetting Tests
  // ============================================

  describe('updateRobotSetting', () => {
    it('[P0] should update robot setting with timely model', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateRobotSetting({
        channelId: '12345678',
        robotNumber: 10,
        addRobotModel: 'timely',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/robot/setting/update',
        null,
        { params: { channelId: '12345678', robotNumber: 10, addRobotModel: 'timely' } }
      );
    });

    it('[P0] should update robot setting with fixed_time model', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateRobotSetting({
        channelId: '12345678',
        robotNumber: 10,
        addRobotModel: 'fixed_time',
        changeTime: 60,
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });

    it('[P1] should throw error when channelId is empty', async () => {
      await expect(
        service.updateRobotSetting({ channelId: '', addRobotModel: 'timely' } as any)
      ).rejects.toThrow('channelId is required and cannot be empty');
    });

    it('[P1] should throw error for invalid addRobotModel', async () => {
      await expect(
        service.updateRobotSetting({ channelId: '12345678', robotNumber: 10, addRobotModel: 'invalid' as any })
      ).rejects.toThrow('addRobotModel must be one of: timely, fixed_time');
    });

    it('[P1] should throw error when fixed_time model is used without changeTime', async () => {
      await expect(
        service.updateRobotSetting({
          channelId: '12345678',
          robotNumber: 10,
          addRobotModel: 'fixed_time',
        } as any)
      ).rejects.toThrow('changeTime is required when addRobotModel is "fixed_time"');
    });

    it('[P1] should throw error when changeTime is below 20', async () => {
      await expect(
        service.updateRobotSetting({
          channelId: '12345678',
          robotNumber: 10,
          addRobotModel: 'fixed_time',
          changeTime: 19,
        })
      ).rejects.toThrow('changeTime must be between 20 and 18000 seconds');
    });

    it('[P1] should throw error when changeTime exceeds 18000', async () => {
      await expect(
        service.updateRobotSetting({
          channelId: '12345678',
          robotNumber: 10,
          addRobotModel: 'fixed_time',
          changeTime: 18001,
        })
      ).rejects.toThrow('changeTime must be between 20 and 18000 seconds');
    });
  });

  // ============================================
  // getRobotStats Tests
  // ============================================

  describe('getRobotStats', () => {
    it('[P0] should get robot stats successfully', async () => {
      const mockResponse = {
        robotCount: 5,
        activeCount: 3,
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getRobotStats({ channelId: '12345678' });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/robot/stats/get',
        { params: { channelId: '12345678' } }
      );
    });

    it('[P1] should throw error when channelId is empty', async () => {
      await expect(
        service.getRobotStats({ channelId: '' })
      ).rejects.toThrow('channelId is required and cannot be empty');
    });
  });

  // ============================================
  // pauseRobot Tests
  // ============================================

  describe('pauseRobot', () => {
    it('[P0] should pause robot successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.pauseRobot({ channelId: '12345678' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/robot/pause',
        null,
        { params: { channelId: '12345678' } }
      );
    });

    it('[P1] should throw error when channelId is empty', async () => {
      await expect(
        service.pauseRobot({ channelId: '' })
      ).rejects.toThrow('channelId is required and cannot be empty');
    });
  });
});
