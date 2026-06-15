import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { GroupService } from './group.service.js';
import { PolyVClient } from '../client.js';

describe('GroupService', () => {
  let service: GroupService;
  let mockClient: { httpClient: { get: Mock; post: Mock } };

  beforeEach(() => {
    mockClient = {
      httpClient: {
        get: vi.fn(),
        post: vi.fn(),
      },
    };
    service = new GroupService(mockClient as unknown as PolyVClient);
  });

  // ============================================
  // AC1: Allocation Records API
  // ============================================
  describe('listAllocateLog', () => {
    it('should list allocation logs with required params', async () => {
      const mockResponse = { contents: [], total: 0 };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.listAllocateLog({
        emails: 'sub@polyv.com',
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/v2/group/account/list-allocate-log',
        { params: { emails: 'sub@polyv.com' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should list allocation logs with all params', async () => {
      const mockResponse = { contents: [], total: 100 };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.listAllocateLog({
        emails: 'sub1@polyv.com,sub2@polyv.com',
        type: 'live',
        startTime: '2024-01-01',
        endTime: '2024-01-31',
        page: 2,
        pageSize: 50,
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/v2/group/account/list-allocate-log',
        { params: {
          emails: 'sub1@polyv.com,sub2@polyv.com',
          type: 'live',
          startTime: '2024-01-01',
          endTime: '2024-01-31',
          page: 2,
          pageSize: 50,
        }}
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for missing emails', async () => {
      await expect(service.listAllocateLog({ emails: '' }))
        .rejects.toThrow('emails is required');
    });

    it('should throw validation error for invalid type', async () => {
      await expect(service.listAllocateLog({
        emails: 'sub@polyv.com',
        type: 'invalid' as 'all',
      })).rejects.toThrow('type must be one of: all, live, vod');
    });

    it('should throw validation error for page < 1', async () => {
      await expect(service.listAllocateLog({
        emails: 'sub@polyv.com',
        page: 0,
      })).rejects.toThrow('page must be at least 1');
    });

    it('should throw validation error for pageSize < 1', async () => {
      await expect(service.listAllocateLog({
        emails: 'sub@polyv.com',
        pageSize: 0,
      })).rejects.toThrow('pageSize must be at least 1');
    });

    it('should throw validation error for pageSize > 1000', async () => {
      await expect(service.listAllocateLog({
        emails: 'sub@polyv.com',
        pageSize: 1001,
      })).rejects.toThrow('pageSize cannot exceed 1000');
    });

    it('should accept valid types', async () => {
      mockClient.httpClient.get.mockResolvedValue({ contents: [] });

      const types = ['all', 'live', 'vod'] as const;
      for (const type of types) {
        await service.listAllocateLog({
          emails: 'sub@polyv.com',
          type,
        });
      }

      expect(mockClient.httpClient.get).toHaveBeenCalledTimes(3);
    });
  });

  // ============================================
  // AC2: Live Concurrency API
  // ============================================
  describe('setConcurrences', () => {
    it('should set concurrences without type', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setConcurrences({
        email: 'sub@polyv.com',
        concurrences: 100,
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/v2/group/live/set-concurrences',
        { email: 'sub@polyv.com', concurrences: 100 }
      );
      expect(result).toBe('success');
    });

    it('should set concurrences with add type', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setConcurrences({
        email: 'sub@polyv.com',
        concurrences: 100,
        type: 'add',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/v2/group/live/set-concurrences',
        { email: 'sub@polyv.com', concurrences: 100, type: 'add' }
      );
      expect(result).toBe('success');
    });

    it('should set concurrences with recover type', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setConcurrences({
        email: 'sub@polyv.com',
        concurrences: 50,
        type: 'recover',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/v2/group/live/set-concurrences',
        { email: 'sub@polyv.com', concurrences: 50, type: 'recover' }
      );
      expect(result).toBe('success');
    });

    it('should throw validation error for missing email', async () => {
      await expect(service.setConcurrences({
        email: '',
        concurrences: 100,
      })).rejects.toThrow('email is required');
    });

    it('should throw validation error for invalid email format', async () => {
      await expect(service.setConcurrences({
        email: 'invalid-email',
        concurrences: 100,
      })).rejects.toThrow('email must be a valid email address');
    });

    it('should throw validation error for invalid type', async () => {
      await expect(service.setConcurrences({
        email: 'sub@polyv.com',
        concurrences: 100,
        type: 'invalid' as 'add',
      })).rejects.toThrow('type must be one of: add, recover');
    });

    it('should throw validation error for zero concurrences', async () => {
      await expect(service.setConcurrences({
        email: 'sub@polyv.com',
        concurrences: 0,
      })).rejects.toThrow('concurrences must be a positive integer greater than 0');
    });

    it('should throw validation error for negative concurrences', async () => {
      await expect(service.setConcurrences({
        email: 'sub@polyv.com',
        concurrences: -10,
      })).rejects.toThrow('concurrences must be a positive integer greater than 0');
    });

    it('should throw validation error for non-integer concurrences', async () => {
      await expect(service.setConcurrences({
        email: 'sub@polyv.com',
        concurrences: 10.5,
      })).rejects.toThrow('concurrences must be a positive integer greater than 0');
    });
  });

  // ============================================
  // AC3: VOD Flow API
  // ============================================
  describe('setFlow', () => {
    it('should set flow with email only', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setFlow({
        email: 'sub@polyv.com',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/v2/group/vod/set-flow',
        { email: 'sub@polyv.com' }
      );
      expect(result).toBe('success');
    });

    it('should set flow with add type', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setFlow({
        email: 'sub@polyv.com',
        type: 'add',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/v2/group/vod/set-flow',
        { email: 'sub@polyv.com', type: 'add' }
      );
      expect(result).toBe('success');
    });

    it('should set flow with recover and all=1', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setFlow({
        email: 'sub@polyv.com',
        type: 'recover',
        all: 1,
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/v2/group/vod/set-flow',
        { email: 'sub@polyv.com', type: 'recover', all: 1 }
      );
      expect(result).toBe('success');
    });

    it('should throw validation error for all=1 without recover type', async () => {
      await expect(service.setFlow({
        email: 'sub@polyv.com',
        type: 'add',
        all: 1,
      })).rejects.toThrow('all=1 is only valid when type=recover');
    });

    it('should throw validation error for all=1 without type', async () => {
      await expect(service.setFlow({
        email: 'sub@polyv.com',
        all: 1,
      })).rejects.toThrow('all=1 is only valid when type=recover');
    });

    it('should throw validation error for invalid email', async () => {
      await expect(service.setFlow({
        email: 'invalid',
      })).rejects.toThrow('email must be a valid email address');
    });
  });

  // ============================================
  // AC4: Live Durations API
  // ============================================
  describe('setLiveDurations', () => {
    it('should set live durations without type', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setLiveDurations({
        email: 'sub@polyv.com',
        duration: 1000,
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/v2/group/live/set-durations',
        { email: 'sub@polyv.com', duration: 1000 }
      );
      expect(result).toBe('success');
    });

    it('should set live durations with add type', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setLiveDurations({
        email: 'sub@polyv.com',
        duration: 500,
        type: 'add',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/v2/group/live/set-durations',
        { email: 'sub@polyv.com', duration: 500, type: 'add' }
      );
      expect(result).toBe('success');
    });

    it('should set live durations with recover type', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setLiveDurations({
        email: 'sub@polyv.com',
        duration: 200,
        type: 'recover',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/v2/group/live/set-durations',
        { email: 'sub@polyv.com', duration: 200, type: 'recover' }
      );
      expect(result).toBe('success');
    });

    it('should throw validation error for missing duration', async () => {
      await expect(service.setLiveDurations({
        email: 'sub@polyv.com',
        duration: undefined as unknown as number,
      })).rejects.toThrow('duration is required');
    });

    it('should throw validation error for null duration', async () => {
      await expect(service.setLiveDurations({
        email: 'sub@polyv.com',
        duration: null as unknown as number,
      })).rejects.toThrow('duration is required');
    });

    it('should throw validation error for zero duration', async () => {
      await expect(service.setLiveDurations({
        email: 'sub@polyv.com',
        duration: 0,
      })).rejects.toThrow('duration must be a positive integer greater than 0');
    });

    it('should throw validation error for negative duration', async () => {
      await expect(service.setLiveDurations({
        email: 'sub@polyv.com',
        duration: -100,
      })).rejects.toThrow('duration must be a positive integer greater than 0');
    });
  });

  // ============================================
  // AC5: VOD Space API
  // ============================================
  describe('setSpace', () => {
    it('should set space with email only', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setSpace({
        email: 'sub@polyv.com',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/v2/group/vod/set-space',
        { email: 'sub@polyv.com' }
      );
      expect(result).toBe('success');
    });

    it('should set space with add type', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setSpace({
        email: 'sub@polyv.com',
        space: 10,
        type: 'add',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/v2/group/vod/set-space',
        { email: 'sub@polyv.com', space: 10, type: 'add' }
      );
      expect(result).toBe('success');
    });

    it('should set space with recover and all=1', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setSpace({
        email: 'sub@polyv.com',
        type: 'recover',
        all: 1,
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/v2/group/vod/set-space',
        { email: 'sub@polyv.com', type: 'recover', all: 1 }
      );
      expect(result).toBe('success');
    });

    it('should set space with all params', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setSpace({
        email: 'sub@polyv.com',
        space: 20,
        type: 'recover',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/v2/group/vod/set-space',
        { email: 'sub@polyv.com', space: 20, type: 'recover' }
      );
      expect(result).toBe('success');
    });

    it('should throw validation error for zero space', async () => {
      await expect(service.setSpace({
        email: 'sub@polyv.com',
        space: 0,
      })).rejects.toThrow('space must be a positive integer greater than 0');
    });

    it('should throw validation error for negative space', async () => {
      await expect(service.setSpace({
        email: 'sub@polyv.com',
        space: -5,
      })).rejects.toThrow('space must be a positive integer greater than 0');
    });

    it('should throw validation error for all=1 without recover type', async () => {
      await expect(service.setSpace({
        email: 'sub@polyv.com',
        type: 'add',
        all: 1,
      })).rejects.toThrow('all=1 is only valid when type=recover');
    });
  });
});
