import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { PlatformService } from './platform.service.js';
import { PolyVClient } from '../client.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';

describe('PlatformService', () => {
  let service: PlatformService;
  let mockClient: { httpClient: { get: Mock; post: Mock } };

  beforeEach(() => {
    mockClient = {
      httpClient: {
        get: vi.fn(),
        post: vi.fn(),
      },
    };
    service = new PlatformService(mockClient as unknown as PolyVClient);
  });

  // ============================================
  // Anchor Management APIs
  // ============================================
  describe('createAnchor', () => {
    it('should create anchor successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue(1);

      const result = await service.createAnchor({
        nickname: '主播1',
        sex: 'W',
        avatar: 'https://example.com/avatar.png',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/anchor/create',
        {
          nickname: '主播1',
          sex: 'W',
          avatar: 'https://example.com/avatar.png',
        }
      );
      expect(result).toBe(1);
    });

    it('should create anchor with all optional fields', async () => {
      mockClient.httpClient.post.mockResolvedValue(2);

      const result = await service.createAnchor({
        nickname: '主播2',
        sex: 'M',
        avatar: 'https://example.com/avatar2.png',
        description: '这是描述',
        addChannelIds: [123, 456],
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/anchor/create',
        {
          nickname: '主播2',
          sex: 'M',
          avatar: 'https://example.com/avatar2.png',
          description: '这是描述',
          addChannelIds: [123, 456],
        }
      );
      expect(result).toBe(2);
    });

    it('should throw validation error for missing nickname', async () => {
      await expect(service.createAnchor({
        nickname: '',
        sex: 'W',
        avatar: 'https://example.com/avatar.png',
      })).rejects.toThrow('nickname is required');
    });

    it('should throw validation error for nickname too long', async () => {
      await expect(service.createAnchor({
        nickname: 'a'.repeat(21),
        sex: 'W',
        avatar: 'https://example.com/avatar.png',
      })).rejects.toThrow('nickname cannot exceed 20 characters');
    });

    it('should throw validation error for invalid sex', async () => {
      await expect(service.createAnchor({
        nickname: '主播',
        sex: 'X' as 'M',
        avatar: 'https://example.com/avatar.png',
      })).rejects.toThrow('sex must be "M" or "W"');
    });

    it('should throw validation error for missing avatar', async () => {
      await expect(service.createAnchor({
        nickname: '主播',
        sex: 'W',
        avatar: '',
      })).rejects.toThrow('avatar is required');
    });

    it('should throw validation error for avatar too long', async () => {
      await expect(service.createAnchor({
        nickname: '主播',
        sex: 'W',
        avatar: 'https://example.com/' + 'a'.repeat(250),
      })).rejects.toThrow('avatar cannot exceed 255 characters');
    });

    it('should throw validation error for description too long', async () => {
      await expect(service.createAnchor({
        nickname: '主播',
        sex: 'W',
        avatar: 'https://example.com/avatar.png',
        description: 'a'.repeat(151),
      })).rejects.toThrow('description cannot exceed 150 characters');
    });

    it('should throw validation error for addChannelIds not array', async () => {
      await expect(service.createAnchor({
        nickname: '主播',
        sex: 'W',
        avatar: 'https://example.com/avatar.png',
        addChannelIds: 'not-array' as unknown as number[],
      })).rejects.toThrow('addChannelIds must be an array');
    });

    it('should throw validation error for addChannelIds too many', async () => {
      await expect(service.createAnchor({
        nickname: '主播',
        sex: 'W',
        avatar: 'https://example.com/avatar.png',
        addChannelIds: Array(1001).fill(1),
      })).rejects.toThrow('addChannelIds cannot exceed 1000 items');
    });
  });

  describe('getAnchor', () => {
    it('should get anchor successfully', async () => {
      const mockResponse = { anchorId: 1, nickname: '主播', status: 1 };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getAnchor(1);

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/anchor/get',
        { params: { anchorId: 1 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for undefined anchorId', async () => {
      await expect(service.getAnchor(undefined as unknown as number))
        .rejects.toThrow('anchorId is required');
    });

    it('should throw validation error for null anchorId', async () => {
      await expect(service.getAnchor(null as unknown as number))
        .rejects.toThrow('anchorId is required');
    });

    it('should throw validation error for NaN anchorId', async () => {
      await expect(service.getAnchor(NaN))
        .rejects.toThrow('anchorId must be a number');
    });
  });

  describe('listAnchors', () => {
    it('should list anchors without params', async () => {
      const mockResponse = { contents: [], total: 0 };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.listAnchors();

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/anchor/list',
        { params: {} }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should list anchors with filters', async () => {
      const mockResponse = { contents: [], total: 100 };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.listAnchors({
        pageNumber: 2,
        pageSize: 20,
        status: 1,
        sex: 'W',
        nickname: '主播',
        startTime: '2024-01-01',
        endTime: '2024-01-31',
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/anchor/list',
        { params: {
          pageNumber: 2,
          pageSize: 20,
          status: 1,
          sex: 'W',
          nickname: '主播',
          startTime: '2024-01-01',
          endTime: '2024-01-31',
        }}
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for invalid status', async () => {
      await expect(service.listAnchors({ status: 2 as 0 }))
        .rejects.toThrow('status must be 0 or 1');
    });

    it('should throw validation error for invalid sex', async () => {
      await expect(service.listAnchors({ sex: 'X' as 'M' }))
        .rejects.toThrow('sex must be "M" or "W"');
    });

    it('should throw validation error for pageNumber < 1', async () => {
      await expect(service.listAnchors({ pageNumber: 0 }))
        .rejects.toThrow('pageNumber must be at least 1');
    });

    it('should throw validation error for pageSize < 1', async () => {
      await expect(service.listAnchors({ pageSize: 0 }))
        .rejects.toThrow('pageSize must be at least 1');
    });

    it('should throw validation error for pageSize > 1000', async () => {
      await expect(service.listAnchors({ pageSize: 1001 }))
        .rejects.toThrow('pageSize cannot exceed 1000');
    });
  });

  describe('listAnchorRelations', () => {
    it('should list anchor relations', async () => {
      const mockResponse = { contents: [], total: 0 };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.listAnchorRelations({ anchorId: 1 });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/anchor/list-relation',
        { params: { anchorId: 1 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should list anchor relations with pagination', async () => {
      const mockResponse = { contents: [], total: 100 };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.listAnchorRelations({
        anchorId: 1,
        pageNumber: 2,
        pageSize: 50,
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/anchor/list-relation',
        { params: { anchorId: 1, pageNumber: 2, pageSize: 50 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for invalid anchorId', async () => {
      await expect(service.listAnchorRelations({ anchorId: NaN }))
        .rejects.toThrow('anchorId must be a number');
    });
  });

  describe('listAnchorUnrelations', () => {
    it('should list anchor unrelations', async () => {
      const mockResponse = { contents: [], total: 0 };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.listAnchorUnrelations({ anchorId: 1 });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/anchor/list-unrelation',
        { params: { anchorId: 1 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for invalid anchorId', async () => {
      await expect(service.listAnchorUnrelations({ anchorId: undefined as unknown as number }))
        .rejects.toThrow('anchorId is required');
    });
  });

  describe('updateAnchor', () => {
    it('should update anchor successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue(undefined);

      await service.updateAnchor({
        anchorId: 1,
        nickname: '新昵称',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/anchor/update',
        { anchorId: 1, nickname: '新昵称' }
      );
    });

    it('should update anchor with all fields', async () => {
      mockClient.httpClient.post.mockResolvedValue(undefined);

      await service.updateAnchor({
        anchorId: 1,
        nickname: '新昵称',
        sex: 'M',
        avatar: 'https://example.com/new.png',
        description: '新描述',
        addChannelIds: [123],
        delChannelIds: [456],
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/anchor/update',
        {
          anchorId: 1,
          nickname: '新昵称',
          sex: 'M',
          avatar: 'https://example.com/new.png',
          description: '新描述',
          addChannelIds: [123],
          delChannelIds: [456],
        }
      );
    });

    it('should throw validation error for invalid anchorId', async () => {
      await expect(service.updateAnchor({ anchorId: NaN, nickname: 'test' }))
        .rejects.toThrow('anchorId must be a number');
    });

    it('should throw validation error for invalid nickname', async () => {
      await expect(service.updateAnchor({ anchorId: 1, nickname: 'a'.repeat(21) }))
        .rejects.toThrow('nickname cannot exceed 20 characters');
    });

    it('should throw validation error for invalid sex', async () => {
      await expect(service.updateAnchor({ anchorId: 1, sex: 'X' as 'M' }))
        .rejects.toThrow('sex must be "M" or "W"');
    });

    it('should throw validation error for delChannelIds not array', async () => {
      await expect(service.updateAnchor({
        anchorId: 1,
        delChannelIds: 'not-array' as unknown as number[],
      })).rejects.toThrow('delChannelIds must be an array');
    });
  });

  describe('updateAnchorStatus', () => {
    it('should enable anchor', async () => {
      mockClient.httpClient.post.mockResolvedValue(undefined);

      await service.updateAnchorStatus({ anchorId: 1, status: 1 });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/anchor/update-status',
        { anchorId: 1, status: 1 }
      );
    });

    it('should disable anchor', async () => {
      mockClient.httpClient.post.mockResolvedValue(undefined);

      await service.updateAnchorStatus({ anchorId: 1, status: 0 });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/anchor/update-status',
        { anchorId: 1, status: 0 }
      );
    });

    it('should throw validation error for invalid status', async () => {
      await expect(service.updateAnchorStatus({ anchorId: 1, status: 2 as 0 }))
        .rejects.toThrow('status must be 0 or 1');
    });

    it('should throw validation error for invalid anchorId', async () => {
      await expect(service.updateAnchorStatus({ anchorId: null as unknown as number, status: 1 }))
        .rejects.toThrow('anchorId is required');
    });
  });

  // ============================================
  // Content Group APIs
  // ============================================
  describe('listContentGroups', () => {
    it('should list script groups', async () => {
      const mockResponse = [{ labelId: 1, labelName: 'group1' }];
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.listContentGroups('script');

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/global/robot/label/list',
        { params: { type: 'script' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should list robot groups', async () => {
      const mockResponse = [{ labelId: 2, labelName: 'group2' }];
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.listContentGroups('robot');

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/global/robot/label/list',
        { params: { type: 'robot' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for invalid type', async () => {
      await expect(service.listContentGroups('invalid' as 'script'))
        .rejects.toThrow('type must be "script" or "robot"');
    });
  });
});
