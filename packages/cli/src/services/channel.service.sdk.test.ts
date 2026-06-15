/**
 * @fileoverview Tests for ChannelServiceSdk
 * @author Development Team
 */

import { ChannelServiceSdk } from './channel.service.sdk';
import {
  ChannelCreateRequest,
  ChannelListRequest,
  ChannelDetailRequest,
  ChannelUpdateRequest,
  ChannelBatchDeleteRequest,
  ChannelServiceConfig,
  BasicSetting,
} from '../types/channel';
import { AuthConfig } from '../types/auth';
import { PolyVError, PolyVAPIError, PolyVValidationError } from '../utils/errors';
import * as sdkModule from '../sdk';

// Mock the SDK module
jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

const mockCreateSdkClient = sdkModule.createSdkClient as jest.MockedFunction<typeof sdkModule.createSdkClient>;

describe('ChannelServiceSdk', () => {
  let service: ChannelServiceSdk;
  let mockSdkClient: {
    v4Channel: {
      create: jest.Mock;
      channelDetailList: jest.Mock;
      getChannel: jest.Mock;
    };
    channel: {
      updateChannel: jest.Mock;
      batchDeleteChannels: jest.Mock;
    };
  };
  const mockAuthConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
    userId: 'test-user-id',
  };
  const mockServiceConfig: ChannelServiceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    maxRetries: 3,
    debug: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockSdkClient = {
      v4Channel: {
        create: jest.fn(),
        channelDetailList: jest.fn(),
        getChannel: jest.fn(),
      },
      channel: {
        updateChannel: jest.fn(),
        batchDeleteChannels: jest.fn(),
      },
    };

    mockCreateSdkClient.mockReturnValue(mockSdkClient as any);
    service = new ChannelServiceSdk(mockAuthConfig, mockServiceConfig);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // ============================================
  // Constructor Tests
  // ============================================

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      expect(service).toBeInstanceOf(ChannelServiceSdk);
    });

    it('should store authConfig and serviceConfig', () => {
      const newService = new ChannelServiceSdk(mockAuthConfig, mockServiceConfig);
      expect(newService).toBeDefined();
    });
  });

  // ============================================
  // createChannel Tests
  // ============================================

  describe('createChannel', () => {
    const validRequest: ChannelCreateRequest = {
      name: 'Test Channel',
      newScene: 'topclass',
      template: 'ppt',
    };

    it('should create channel successfully', async () => {
      const mockResponse = {
        channelId: '3151318',
        userId: 'test-user-id',
      };

      mockSdkClient.v4Channel.create.mockResolvedValueOnce(mockResponse);

      const result = await service.createChannel(validRequest);

      expect(result).toEqual({
        channelId: '3151318',
        name: 'Test Channel',
        userId: 'test-user-id',
        channelPasswd: '',
        newScene: 'topclass',
        template: 'ppt',
        status: 'waiting',
        createdAt: expect.any(Date),
      });
    });

    it('should create channel with optional parameters', async () => {
      const requestWithOptional: ChannelCreateRequest = {
        ...validRequest,
        channelPasswd: 'password123',
        linkMicLimit: 5,
        startTime: 1700000000000,
        endTime: 1700003600000,
      };

      mockSdkClient.v4Channel.create.mockResolvedValueOnce({ channelId: '3151319' });

      const result = await service.createChannel(requestWithOptional);

      expect(result.channelPasswd).toBe('password123');
    });

    it('should throw PolyVValidationError for empty name', async () => {
      const invalidRequest = { ...validRequest, name: '' };

      await expect(service.createChannel(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for name exceeding 100 characters', async () => {
      const invalidRequest = { ...validRequest, name: 'a'.repeat(101) };

      await expect(service.createChannel(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for non-string name', async () => {
      const invalidRequest = { ...validRequest, name: 123 as any };

      await expect(service.createChannel(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid newScene', async () => {
      const invalidRequest = { ...validRequest, newScene: 'invalid' as any };

      await expect(service.createChannel(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for missing newScene', async () => {
      const invalidRequest = { ...validRequest, newScene: undefined as any };

      await expect(service.createChannel(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid template', async () => {
      const invalidRequest = { ...validRequest, template: 'invalid' as any };

      await expect(service.createChannel(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for missing template', async () => {
      const invalidRequest = { ...validRequest, template: undefined as any };

      await expect(service.createChannel(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should accept all valid scene types', async () => {
      const scenes = ['topclass', 'alone', 'seminar', 'train', 'double', 'guide'];

      for (const scene of scenes) {
        mockSdkClient.v4Channel.create.mockResolvedValueOnce({ channelId: '123' });
        const result = await service.createChannel({ ...validRequest, newScene: scene as any });
        expect(result).toBeDefined();
      }
    });

    it('should accept all valid template types', async () => {
      const templates = ['ppt', 'portrait_ppt', 'alone', 'portrait_alone', 'topclass', 'portrait_topclass', 'seminar'];

      for (const template of templates) {
        mockSdkClient.v4Channel.create.mockResolvedValueOnce({ channelId: '123' });
        const result = await service.createChannel({ ...validRequest, template: template as any });
        expect(result).toBeDefined();
      }
    });

    it('should pass scene value directly to SDK (no mapping)', async () => {
      mockSdkClient.v4Channel.create.mockResolvedValueOnce({ channelId: '123' });

      await service.createChannel({ ...validRequest, newScene: 'alone' });

      expect(mockSdkClient.v4Channel.create).toHaveBeenCalledWith(
        expect.objectContaining({ newScene: 'alone' })
      );
    });

    it('should pass template value directly to SDK (no mapping)', async () => {
      mockSdkClient.v4Channel.create.mockResolvedValueOnce({ channelId: '123' });

      await service.createChannel({ ...validRequest, template: 'portrait_alone' });

      expect(mockSdkClient.v4Channel.create).toHaveBeenCalledWith(
        expect.objectContaining({ template: 'portrait_alone' })
      );
    });

    it('should handle API errors', async () => {
      mockSdkClient.v4Channel.create.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.createChannel(validRequest)).rejects.toThrow();
    });

    it('should use userId from authConfig when not in response', async () => {
      mockSdkClient.v4Channel.create.mockResolvedValueOnce({ channelId: '123' });

      const result = await service.createChannel(validRequest);

      expect(result.userId).toBe('test-user-id');
    });
  });

  // ============================================
  // listChannels Tests
  // ============================================

  describe('listChannels', () => {
    it('should list channels successfully with default parameters', async () => {
      const mockResponse = {
        contents: [
          {
            channelId: '3151318',
            name: 'Channel 1',
            watchStatus: 'live',
            startTime: 1700000000000,
            newScene: 'topclass',
            template: 'ppt',
          },
          {
            channelId: '3151319',
            name: 'Channel 2',
            watchStatus: 'waiting',
            startTime: 1700003600000,
            newScene: 'cloudclass',
            template: 'video',
          },
        ],
      };

      mockSdkClient.v4Channel.channelDetailList.mockResolvedValueOnce(mockResponse);

      const result = await service.listChannels();

      expect(result).toHaveLength(2);
      expect(result[0].channelId).toBe('3151318');
      expect(result[0].status).toBe('live');
      expect(result[1].status).toBe('waiting');
    });

    it('should return empty array when no channels', async () => {
      mockSdkClient.v4Channel.channelDetailList.mockResolvedValueOnce({ contents: [] });

      const result = await service.listChannels();

      expect(result).toEqual([]);
    });

    it('should return empty array when contents is null', async () => {
      mockSdkClient.v4Channel.channelDetailList.mockResolvedValueOnce({ contents: null });

      const result = await service.listChannels();

      expect(result).toEqual([]);
    });

    it('should filter by keyword', async () => {
      const mockResponse = {
        contents: [
          { channelId: '1', name: 'Test Channel', watchStatus: 'live', startTime: 1700000000000 },
          { channelId: '2', name: 'Other Channel', watchStatus: 'waiting', startTime: 1700000000000 },
        ],
      };

      mockSdkClient.v4Channel.channelDetailList.mockResolvedValueOnce(mockResponse);

      const result = await service.listChannels({ keyword: 'Test' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Channel');
    });

    it('should filter by keyword case-insensitively', async () => {
      const mockResponse = {
        contents: [
          { channelId: '1', name: 'TEST Channel', watchStatus: 'live', startTime: 1700000000000 },
        ],
      };

      mockSdkClient.v4Channel.channelDetailList.mockResolvedValueOnce(mockResponse);

      const result = await service.listChannels({ keyword: 'test' });

      expect(result).toHaveLength(1);
    });

    it('should use custom page and limit', async () => {
      mockSdkClient.v4Channel.channelDetailList.mockResolvedValueOnce({ contents: [] });

      await service.listChannels({ page: 2, limit: 50 });

      expect(mockSdkClient.v4Channel.channelDetailList).toHaveBeenCalledWith({
        pageNumber: 2,
        pageSize: 50,
      });
    });

    it('should throw PolyVValidationError for invalid page', async () => {
      const invalidRequest = { page: 0 };

      await expect(service.listChannels(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for negative page', async () => {
      const invalidRequest = { page: -1 };

      await expect(service.listChannels(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for limit exceeding 100', async () => {
      const invalidRequest = { limit: 101 };

      await expect(service.listChannels(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for limit below 1', async () => {
      const invalidRequest = { limit: 0 };

      await expect(service.listChannels(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should include maxViewers when available', async () => {
      const mockResponse = {
        contents: [
          { channelId: '1', name: 'Test', watchStatus: 'live', startTime: 1700000000000, maxViewer: 1000 },
        ],
      };

      mockSdkClient.v4Channel.channelDetailList.mockResolvedValueOnce(mockResponse);

      const result = await service.listChannels();

      expect(result[0].maxViewers).toBe(1000);
    });

    it('should not include maxViewers when zero or null', async () => {
      const mockResponse = {
        contents: [
          { channelId: '1', name: 'Test', watchStatus: 'live', startTime: 1700000000000, maxViewer: 0 },
        ],
      };

      mockSdkClient.v4Channel.channelDetailList.mockResolvedValueOnce(mockResponse);

      const result = await service.listChannels();

      expect(result[0].maxViewers).toBeUndefined();
    });

    it('should map watchStatus values correctly', async () => {
      const statusTests = [
        { watchStatus: 'waiting', expected: 'waiting' },
        { watchStatus: 'living', expected: 'live' },
        { watchStatus: 'live', expected: 'live' },
        { watchStatus: 'end', expected: 'end' },
        { watchStatus: 'ended', expected: 'end' },
        { watchStatus: 'unStart', expected: 'unStart' },
        { watchStatus: 'unknown', expected: 'waiting' },
      ];

      for (const test of statusTests) {
        mockSdkClient.v4Channel.channelDetailList.mockResolvedValueOnce({
          contents: [{ channelId: '1', name: 'Test', watchStatus: test.watchStatus, startTime: 1700000000000 }],
        });

        const result = await service.listChannels();
        expect(result[0].status).toBe(test.expected);
      }
    });

    it('should handle API errors', async () => {
      mockSdkClient.v4Channel.channelDetailList.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.listChannels()).rejects.toThrow();
    });
  });

  // ============================================
  // getChannelDetail Tests
  // ============================================

  describe('getChannelDetail', () => {
    const validRequest: ChannelDetailRequest = {
      channelId: '3151318',
    };

    it('should get channel detail successfully', async () => {
      const mockResponse = {
        channelId: 3151318,
        name: 'Test Channel',
        scene: 'topclass',
        newScene: 'topclass',
        template: 'ppt',
        channelPasswd: 'password123',
        publisher: 'Publisher',
        startTime: 1700000000000,
        endTime: 1700003600000,
        pageView: 1000,
        likes: 500,
        watchStatus: 'live',
        watchStatusText: 'Living',
      };

      mockSdkClient.v4Channel.getChannel.mockResolvedValueOnce(mockResponse);

      const result = await service.getChannelDetail(validRequest);

      expect(result.channelId).toBe(3151318);
      expect(result.name).toBe('Test Channel');
    });

    it('should throw PolyVValidationError for empty channelId', async () => {
      const invalidRequest = { channelId: '' };

      await expect(service.getChannelDetail(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for null channelId', async () => {
      const invalidRequest = { channelId: null as any };

      await expect(service.getChannelDetail(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for non-string channelId', async () => {
      const invalidRequest = { channelId: 123 as any };

      await expect(service.getChannelDetail(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should handle API errors', async () => {
      mockSdkClient.v4Channel.getChannel.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getChannelDetail(validRequest)).rejects.toThrow();
    });
  });

  // ============================================
  // updateChannel Tests
  // ============================================

  describe('updateChannel', () => {
    const validRequest: ChannelUpdateRequest = {
      channelId: '3151318',
      basicSetting: {
        name: 'Updated Channel',
      },
    };

    it('should update channel successfully', async () => {
      mockSdkClient.channel.updateChannel.mockResolvedValueOnce({});

      const result = await service.updateChannel(validRequest);

      expect(result.code).toBe(200);
      expect(result.status).toBe('success');
      expect(result.success).toBe(true);
    });

    it('should throw PolyVValidationError for empty channelId', async () => {
      const invalidRequest = { channelId: '', basicSetting: { name: 'Test' } };

      await expect(service.updateChannel(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError when no update fields provided', async () => {
      const invalidRequest = { channelId: '3151318' };

      await expect(service.updateChannel(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should accept authSettings as valid update field', async () => {
      mockSdkClient.channel.updateChannel.mockResolvedValueOnce({});

      const result = await service.updateChannel({
        channelId: '3151318',
        authSettings: [],
      });

      expect(result.success).toBe(true);
    });

    it('should map basicSetting fields correctly', async () => {
      mockSdkClient.channel.updateChannel.mockResolvedValueOnce({});

      const basicSetting: BasicSetting = {
        name: 'New Name',
        channelPasswd: 'newpass123',
        publisher: 'New Publisher',
        desc: 'New Description',
        startTime: 1700000000000,
        endTime: 1700003600000,
        pageView: 2000,
        likes: 100,
        maxViewer: 500,
        maxViewerRestrict: 'Y',
        coverImg: 'https://example.com/cover.png',
        splashImg: 'https://example.com/splash.png',
      };

      await service.updateChannel({
        channelId: '3151318',
        basicSetting,
      });

      expect(mockSdkClient.channel.updateChannel).toHaveBeenCalledWith(
        '3151318',
        expect.objectContaining({
          name: 'New Name',
          channelPasswd: 'newpass123',
          publisher: 'New Publisher',
          desc: 'New Description',
          pageView: 2000,
          likes: 100,
          maxViewer: 500,
          maxViewerRestrict: 'Y',
        })
      );
    });

    it('should handle API errors', async () => {
      mockSdkClient.channel.updateChannel.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.updateChannel(validRequest)).rejects.toThrow();
    });
  });

  // ============================================
  // deleteChannel Tests
  // ============================================

  describe('deleteChannel', () => {
    it('should delete channel successfully', async () => {
      mockSdkClient.channel.batchDeleteChannels.mockResolvedValueOnce({});

      const result = await service.deleteChannel('3151318');

      expect(result.code).toBe(200);
      expect(result.status).toBe('success');
      expect(mockSdkClient.channel.batchDeleteChannels).toHaveBeenCalledWith(['3151318']);
    });

    it('should throw PolyVValidationError for empty channelId', async () => {
      await expect(service.deleteChannel('')).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for null channelId', async () => {
      await expect(service.deleteChannel(null as any)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for non-string channelId', async () => {
      await expect(service.deleteChannel(123 as any)).rejects.toThrow(PolyVValidationError);
    });

    it('should handle API errors', async () => {
      mockSdkClient.channel.batchDeleteChannels.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.deleteChannel('3151318')).rejects.toThrow();
    });
  });

  // ============================================
  // batchDeleteChannels Tests
  // ============================================

  describe('batchDeleteChannels', () => {
    const validRequest: ChannelBatchDeleteRequest = {
      channelIds: ['3151318', '3151319'],
    };

    it('should batch delete channels successfully', async () => {
      mockSdkClient.channel.batchDeleteChannels.mockResolvedValueOnce({});

      const result = await service.batchDeleteChannels(validRequest);

      expect(result.code).toBe(200);
      expect(result.status).toBe('success');
      expect(mockSdkClient.channel.batchDeleteChannels).toHaveBeenCalledWith(['3151318', '3151319']);
    });

    it('should throw PolyVValidationError for empty channelIds array', async () => {
      const invalidRequest = { channelIds: [] };

      await expect(service.batchDeleteChannels(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for null channelIds', async () => {
      const invalidRequest = { channelIds: null as any };

      await expect(service.batchDeleteChannels(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for non-array channelIds', async () => {
      const invalidRequest = { channelIds: 'not-array' as any };

      await expect(service.batchDeleteChannels(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should handle API errors', async () => {
      mockSdkClient.channel.batchDeleteChannels.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.batchDeleteChannels(validRequest)).rejects.toThrow();
    });
  });

  // ============================================
  // Debug Mode Tests
  // ============================================

  describe('debug mode', () => {
    it('should not log errors when debug is false', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockSdkClient.v4Channel.create.mockRejectedValueOnce(new Error('API Error'));

      try {
        await service.createChannel({
          name: 'Test',
          newScene: 'topclass',
          template: 'ppt',
        });
      } catch (e) {
        // Expected
      }

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log errors when debug is true', async () => {
      const debugConfig = { ...mockServiceConfig, debug: true };
      const debugService = new ChannelServiceSdk(mockAuthConfig, debugConfig);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockCreateSdkClient.mockReturnValue(mockSdkClient as any);
      mockSdkClient.v4Channel.create.mockRejectedValueOnce(new Error('API Error'));

      try {
        await debugService.createChannel({
          name: 'Test',
          newScene: 'topclass',
          template: 'ppt',
        });
      } catch (e) {
        // Expected
      }

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // ============================================
  // Error Handling Tests
  // ============================================

  describe('handleError', () => {
    it('should preserve PolyVError instances', async () => {
      const polyvError = new PolyVValidationError('Test error', 'field', 'value', 'required');
      mockSdkClient.v4Channel.create.mockRejectedValueOnce(polyvError);

      await expect(service.createChannel({
        name: 'Test',
        newScene: 'topclass',
        template: 'ppt',
      })).rejects.toThrow(PolyVValidationError);
    });

    it('should preserve PolyVAPIError instances', async () => {
      const apiError = new PolyVAPIError('API error', 'API_ERROR', 500);
      mockSdkClient.v4Channel.create.mockRejectedValueOnce(apiError);

      await expect(service.createChannel({
        name: 'Test',
        newScene: 'topclass',
        template: 'ppt',
      })).rejects.toThrow(PolyVAPIError);
    });

    it('should convert SDK errors with code to PolyVAPIError', async () => {
      const sdkError = new Error('SDK error');
      (sdkError as any).code = 'SDK_ERROR';
      (sdkError as any).status = 400;

      mockSdkClient.v4Channel.create.mockRejectedValueOnce(sdkError);

      try {
        await service.createChannel({
          name: 'Test',
          newScene: 'topclass',
          template: 'ppt',
        });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVAPIError);
      }
    });

    it('should convert generic errors to PolyVError', async () => {
      mockSdkClient.v4Channel.create.mockRejectedValueOnce(new Error('Generic error'));

      try {
        await service.createChannel({
          name: 'Test',
          newScene: 'topclass',
          template: 'ppt',
        });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVError);
        expect((error as PolyVError).code).toBe('CHANNEL_SERVICE_ERROR');
      }
    });

    it('should handle non-Error throws', async () => {
      mockSdkClient.v4Channel.create.mockRejectedValueOnce('string error');

      try {
        await service.createChannel({
          name: 'Test',
          newScene: 'topclass',
          template: 'ppt',
        });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVError);
        expect((error as PolyVError).code).toBe('UNKNOWN_ERROR');
      }
    });
  });
});
