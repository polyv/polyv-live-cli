import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { FinanceService } from './finance.service.js';
import { PolyVClient } from '../client.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';

describe('FinanceService', () => {
  let service: FinanceService;
  let mockClient: { httpClient: { get: Mock; post: Mock } };

  beforeEach(() => {
    mockClient = {
      httpClient: {
        get: vi.fn(),
        post: vi.fn(),
      },
    };
    service = new FinanceService(mockClient as unknown as PolyVClient);
  });

  // ============================================
  // Audio Moderation APIs
  // ============================================
  describe('getAudioModerationSettings', () => {
    it('should get audio moderation settings successfully', async () => {
      const mockResponse = { moderationEnabled: 'Y' as const, moderationStrategy: 'normal' as const };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getAudioModerationSettings(123456);

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/audio-moderation/get',
        { params: { channelId: 123456 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should accept string channelId', async () => {
      const mockResponse = { moderationEnabled: 'N' as const };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getAudioModerationSettings('123456');

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/audio-moderation/get',
        { params: { channelId: '123456' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for undefined channelId', async () => {
      await expect(service.getAudioModerationSettings(undefined as unknown as number))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw validation error for null channelId', async () => {
      await expect(service.getAudioModerationSettings(null as unknown as number))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw validation error for empty string channelId', async () => {
      await expect(service.getAudioModerationSettings(''))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw validation error for whitespace channelId', async () => {
      await expect(service.getAudioModerationSettings('   '))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('listAudioModerationRecords', () => {
    it('should list records with default params', async () => {
      const mockResponse = { contents: [], total: 0 };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.listAudioModerationRecords(123456);

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/audio-moderation/list',
        { params: { channelId: 123456 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should list records with pagination params', async () => {
      const mockResponse = { contents: [], total: 100 };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.listAudioModerationRecords(123456, {
        pageNumber: 2,
        pageSize: 20,
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/audio-moderation/list',
        { params: { channelId: 123456, pageNumber: 2, pageSize: 20 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should list records with all filter params', async () => {
      const mockResponse = { contents: [], total: 0 };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.listAudioModerationRecords(123456, {
        pageNumber: 1,
        pageSize: 10,
        startTime: 1704067200000,
        endTime: 1705276800000,
        sessionId: 'session123',
        moderationStrategy: 'normal',
        resultType: 1,
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/audio-moderation/list',
        { params: {
          channelId: 123456,
          pageNumber: 1,
          pageSize: 10,
          startTime: 1704067200000,
          endTime: 1705276800000,
          sessionId: 'session123',
          moderationStrategy: 'normal',
          resultType: 1,
        }}
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for pageNumber < 1', async () => {
      await expect(service.listAudioModerationRecords(123456, { pageNumber: 0 }))
        .rejects.toThrow('pageNumber must be at least 1');
    });

    it('should throw validation error for pageSize < 1', async () => {
      await expect(service.listAudioModerationRecords(123456, { pageSize: 0 }))
        .rejects.toThrow('pageSize must be at least 1');
    });

    it('should throw validation error for pageSize > 1000', async () => {
      await expect(service.listAudioModerationRecords(123456, { pageSize: 1001 }))
        .rejects.toThrow('pageSize cannot exceed 1000');
    });
  });

  describe('updateAudioModerationSettings', () => {
    it('should update settings with moderationEnabled', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const result = await service.updateAudioModerationSettings(123456, {
        moderationEnabled: 'Y',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/audio-moderation/update',
        { moderationEnabled: 'Y' },
        { params: { channelId: 123456 } }
      );
      expect(result).toBe(true);
    });

    it('should update settings with all params', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const result = await service.updateAudioModerationSettings(123456, {
        moderationEnabled: 'Y',
        moderationStrategy: 'strict',
        badwordEnabled: 'Y',
        illegalNotify: { platformEnabled: 'Y' },
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/audio-moderation/update',
        {
          moderationEnabled: 'Y',
          moderationStrategy: 'strict',
          badwordEnabled: 'Y',
          illegalNotify: { platformEnabled: 'Y' },
        },
        { params: { channelId: 123456 } }
      );
      expect(result).toBe(true);
    });

    it('should throw validation error for invalid moderationEnabled', async () => {
      await expect(service.updateAudioModerationSettings(123456, {
        moderationEnabled: 'INVALID' as 'Y',
      })).rejects.toThrow('moderationEnabled must be "Y" or "N"');
    });

    it('should throw validation error for invalid moderationStrategy', async () => {
      await expect(service.updateAudioModerationSettings(123456, {
        moderationEnabled: 'Y',
        moderationStrategy: 'invalid' as 'easy',
      })).rejects.toThrow('moderationStrategy must be one of: easy, normal, strict');
    });

    it('should throw validation error for invalid badwordEnabled', async () => {
      await expect(service.updateAudioModerationSettings(123456, {
        badwordEnabled: 'INVALID' as 'Y',
      })).rejects.toThrow('badwordEnabled must be "Y" or "N"');
    });

    it('should throw validation error for invalid illegalNotify key', async () => {
      await expect(service.updateAudioModerationSettings(123456, {
        illegalNotify: { invalidKey: 'Y' } as unknown as { platformEnabled: 'Y' },
      })).rejects.toThrow('Invalid illegalNotify key: invalidKey');
    });

    it('should throw validation error for invalid illegalNotify value', async () => {
      await expect(service.updateAudioModerationSettings(123456, {
        illegalNotify: { platformEnabled: 'INVALID' as 'Y' },
      })).rejects.toThrow('illegalNotify.platformEnabled must be "Y" or "N"');
    });

    it('should accept valid moderationStrategy values', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const strategies = ['easy', 'normal', 'strict'] as const;
      for (const strategy of strategies) {
        await service.updateAudioModerationSettings(123456, {
          moderationStrategy: strategy,
        });
      }

      expect(mockClient.httpClient.post).toHaveBeenCalledTimes(3);
    });
  });

  // ============================================
  // Video Moderation APIs
  // ============================================
  describe('getVideoModerationSettings', () => {
    it('should get video moderation settings successfully', async () => {
      const mockResponse = { moderationEnabled: 'Y' as const, imageFrequency: 60 as const };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getVideoModerationSettings(123456);

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/video-moderation/get',
        { params: { channelId: 123456 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should accept string channelId', async () => {
      const mockResponse = { moderationEnabled: 'N' as const };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      await service.getVideoModerationSettings('654321');

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/video-moderation/get',
        { params: { channelId: '654321' } }
      );
    });
  });

  describe('updateVideoModerationSettings', () => {
    const validSettings = {
      moderationEnabled: 'Y' as const,
      moderationStrategy: 'finance_normal' as const,
      imageFrequency: 60 as const,
      illegalNotify: { platformEnabled: 'Y' as const },
    };

    it('should update video moderation settings successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const result = await service.updateVideoModerationSettings(123456, validSettings);

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/video-moderation/update',
        validSettings,
        { params: { channelId: 123456 } }
      );
      expect(result).toBe(true);
    });

    it('should throw validation error for missing moderationEnabled', async () => {
      const { moderationEnabled, ...partial } = validSettings;
      await expect(service.updateVideoModerationSettings(123456, partial as unknown as typeof validSettings))
        .rejects.toThrow('moderationEnabled is required');
    });

    it('should throw validation error for missing moderationStrategy', async () => {
      const { moderationStrategy, ...partial } = validSettings;
      await expect(service.updateVideoModerationSettings(123456, partial as unknown as typeof validSettings))
        .rejects.toThrow('moderationStrategy is required');
    });

    it('should throw validation error for missing imageFrequency', async () => {
      const { imageFrequency, ...partial } = validSettings;
      await expect(service.updateVideoModerationSettings(123456, partial as unknown as typeof validSettings))
        .rejects.toThrow('imageFrequency is required');
    });

    it('should throw validation error for missing illegalNotify', async () => {
      const { illegalNotify, ...partial } = validSettings;
      await expect(service.updateVideoModerationSettings(123456, partial as unknown as typeof validSettings))
        .rejects.toThrow('illegalNotify is required');
    });

    it('should throw validation error for invalid moderationEnabled', async () => {
      await expect(service.updateVideoModerationSettings(123456, {
        ...validSettings,
        moderationEnabled: 'INVALID' as 'Y',
      })).rejects.toThrow('moderationEnabled must be "Y" or "N"');
    });

    it('should throw validation error for invalid moderationStrategy', async () => {
      await expect(service.updateVideoModerationSettings(123456, {
        ...validSettings,
        moderationStrategy: 'invalid' as 'finance_easy',
      })).rejects.toThrow('moderationStrategy must be one of: finance_easy, finance_normal, finance_serious');
    });

    it('should throw validation error for invalid imageFrequency', async () => {
      await expect(service.updateVideoModerationSettings(123456, {
        ...validSettings,
        imageFrequency: 10 as 5,
      })).rejects.toThrow('imageFrequency must be 5, 20, or 60');
    });

    it('should accept valid imageFrequency values', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const frequencies = [5, 20, 60] as const;
      for (const freq of frequencies) {
        await service.updateVideoModerationSettings(123456, {
          ...validSettings,
          imageFrequency: freq,
        });
      }

      expect(mockClient.httpClient.post).toHaveBeenCalledTimes(3);
    });

    it('should accept valid moderationStrategy values', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const strategies = ['finance_easy', 'finance_normal', 'finance_serious'] as const;
      for (const strategy of strategies) {
        await service.updateVideoModerationSettings(123456, {
          ...validSettings,
          moderationStrategy: strategy,
        });
      }

      expect(mockClient.httpClient.post).toHaveBeenCalledTimes(3);
    });
  });

  describe('listVideoModerationResults', () => {
    it('should list results with default params', async () => {
      const mockResponse = { contents: [], total: 0 };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.listVideoModerationResults(123456);

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/video-moderation/result/list',
        { params: { channelId: 123456 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should list results with all filter params', async () => {
      const mockResponse = { contents: [], total: 100 };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.listVideoModerationResults(123456, {
        pageNumber: 2,
        pageSize: 50,
        sessionId: 'session456',
        label: 'violence',
        resultType: '1,2,3',
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/video-moderation/result/list',
        { params: {
          channelId: 123456,
          pageNumber: 2,
          pageSize: 50,
          sessionId: 'session456',
          label: 'violence',
          resultType: '1,2,3',
        }}
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for invalid pageNumber', async () => {
      await expect(service.listVideoModerationResults(123456, { pageNumber: 0 }))
        .rejects.toThrow('pageNumber must be at least 1');
    });

    it('should throw validation error for invalid pageSize', async () => {
      await expect(service.listVideoModerationResults(123456, { pageSize: 2000 }))
        .rejects.toThrow('pageSize cannot exceed 1000');
    });
  });
});
