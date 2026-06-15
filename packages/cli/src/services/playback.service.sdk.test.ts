/**
 * @fileoverview Unit tests for PlaybackServiceSdk
 * @story 9.1: 回放列表命令
 * @story 9.3: 回放删除命令
 * @story 9.4: 回放合并命令
 */

import { PlaybackServiceSdk } from './playback.service.sdk';
import { PlaybackListOptions, PlaybackServiceConfig } from '../types/playback';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';

// Mock the SDK module
jest.mock('../sdk', () => ({
  createSdkClient: jest.fn().mockReturnValue({
    channel: {
      getPlaybackList: jest.fn(),
    },
  }),
}));

import { createSdkClient } from '../sdk';

describe('PlaybackServiceSdk', () => {
  let service: PlaybackServiceSdk;
  let mockSdkClient: any;

  const mockAuthConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
  };

  const mockServiceConfig: PlaybackServiceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSdkClient = {
      channel: {
        getPlaybackList: jest.fn(),
      },
    };
    (createSdkClient as jest.Mock).mockReturnValue(mockSdkClient);
    service = new PlaybackServiceSdk(mockAuthConfig, mockServiceConfig);
  });

  describe('constructor', () => {
    it('should create instance with auth and service config', () => {
      expect(service).toBeInstanceOf(PlaybackServiceSdk);
    });
  });

  describe('getPlaybackList', () => {
    const mockOptions: PlaybackListOptions = {
      channelId: '2191532',
    };

    const mockSdkResponse = {
      contents: [
        {
          videoId: 'abc123',
          videoPoolId: 'pool123',
          userId: 'user123',
          channelId: '2191532',
          title: 'Test Video',
          firstImage: 'https://example.com/image.jpg',
          duration: 3725, // 1:02:05
          myBr: '1',
          seed: 0,
          createdTime: 1615515464000,
          lastModified: 1615515464000,
          asDefault: 'N',
          status: 'Y',
          watchUrl: 'https://example.com/watch',
          liveType: 'ppt',
          origin: 'manual' as const,
        },
      ],
      pageNumber: 1,
      pageSize: 10,
      totalItems: 1,
      totalPages: 1,
    };

    it('should call SDK with correct parameters', async () => {
      mockSdkClient.channel.getPlaybackList.mockResolvedValue(mockSdkResponse);

      const result = await service.getPlaybackList(mockOptions);

      expect(mockSdkClient.channel.getPlaybackList).toHaveBeenCalledWith(
        '2191532',
        {}
      );
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].videoId).toBe('abc123');
    });

    it('should pass pagination options to SDK', async () => {
      mockSdkClient.channel.getPlaybackList.mockResolvedValue(mockSdkResponse);

      await service.getPlaybackList({
        ...mockOptions,
        page: 2,
        pageSize: 20,
      });

      expect(mockSdkClient.channel.getPlaybackList).toHaveBeenCalledWith(
        '2191532',
        { page: 2, pageSize: 20 }
      );
    });

    it('should pass listType option to SDK', async () => {
      mockSdkClient.channel.getPlaybackList.mockResolvedValue(mockSdkResponse);

      await service.getPlaybackList({
        ...mockOptions,
        listType: 'vod',
      });

      expect(mockSdkClient.channel.getPlaybackList).toHaveBeenCalledWith(
        '2191532',
        { listType: 'vod' }
      );
    });

    it('should format duration correctly', async () => {
      mockSdkClient.channel.getPlaybackList.mockResolvedValue(mockSdkResponse);

      const result = await service.getPlaybackList(mockOptions);

      // 3725 seconds = 1:02:05
      expect(result.contents[0].duration).toBe('01:02:05');
    });

    it('should handle zero duration', async () => {
      mockSdkClient.channel.getPlaybackList.mockResolvedValue({
        ...mockSdkResponse,
        contents: [{ ...mockSdkResponse.contents[0], duration: 0 }],
      });

      const result = await service.getPlaybackList(mockOptions);

      expect(result.contents[0].duration).toBe('00:00:00');
    });

    it('should handle undefined duration', async () => {
      mockSdkClient.channel.getPlaybackList.mockResolvedValue({
        ...mockSdkResponse,
        contents: [{ ...mockSdkResponse.contents[0], duration: undefined }],
      });

      const result = await service.getPlaybackList(mockOptions);

      expect(result.contents[0].duration).toBe('00:00:00');
    });

    it('should handle empty contents', async () => {
      mockSdkClient.channel.getPlaybackList.mockResolvedValue({
        contents: [],
        pageNumber: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
      });

      const result = await service.getPlaybackList(mockOptions);

      expect(result.contents).toHaveLength(0);
      expect(result.totalItems).toBe(0);
    });

    it('should handle undefined contents', async () => {
      mockSdkClient.channel.getPlaybackList.mockResolvedValue({
        contents: undefined,
        pageNumber: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
      });

      const result = await service.getPlaybackList(mockOptions);

      expect(result.contents).toHaveLength(0);
    });

    it('should handle undefined title', async () => {
      mockSdkClient.channel.getPlaybackList.mockResolvedValue({
        contents: [
          {
            videoId: 'abc123',
            channelId: '2191532',
            title: undefined,
            duration: 100,
          },
        ],
        pageNumber: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
      });

      const result = await service.getPlaybackList(mockOptions);

      expect(result.contents[0].title).toBe('');
    });

    it('should handle missing optional fields', async () => {
      mockSdkClient.channel.getPlaybackList.mockResolvedValue({
        contents: [
          {
            videoId: 'abc123',
            channelId: '2191532',
            title: 'Test Video',
            duration: 100,
            // No optional fields
          },
        ],
        pageNumber: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
      });

      const result = await service.getPlaybackList(mockOptions);

      expect(result.contents[0].videoId).toBe('abc123');
      expect(result.contents[0].videoPoolId).toBeUndefined();
      expect(result.contents[0].userId).toBeUndefined();
    });

    it('should throw PolyVValidationError for empty channelId', async () => {
      await expect(
        service.getPlaybackList({ channelId: '' })
      ).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid page', async () => {
      await expect(
        service.getPlaybackList({ ...mockOptions, page: -1 })
      ).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid pageSize', async () => {
      await expect(
        service.getPlaybackList({ ...mockOptions, pageSize: 0 })
      ).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid listType', async () => {
      await expect(
        service.getPlaybackList({ ...mockOptions, listType: 'invalid' as any })
      ).rejects.toThrow(PolyVValidationError);
    });

    it('should handle total field fallback', async () => {
      mockSdkClient.channel.getPlaybackList.mockResolvedValue({
        contents: mockSdkResponse.contents,
        pageNumber: 1,
        pageSize: 10,
        total: 5, // Some APIs return 'total' instead of 'totalItems'
        totalPages: 1,
      });

      const result = await service.getPlaybackList(mockOptions);

      expect(result.totalItems).toBe(5);
    });
  });

  // ============================================
  // Story 9.3: deletePlayback
  // ============================================

  describe('deletePlayback', () => {
    const mockSdkResponse = true;

    beforeEach(() => {
      mockSdkClient.channel.deletePlayback = jest.fn();
    });

    it('should call SDK with correct parameters', async () => {
      mockSdkClient.channel.deletePlayback.mockResolvedValueOnce(mockSdkResponse);

      const result = await service.deletePlayback('3151318', '1b96d90bf5');

      expect(mockSdkClient.channel.deletePlayback).toHaveBeenCalledWith(
        '3151318',
        '1b96d90bf5',
        undefined
      );
      expect(result).toBe(true);
    });

    it('should pass listType to SDK', async () => {
      mockSdkClient.channel.deletePlayback.mockResolvedValueOnce(mockSdkResponse);

      await service.deletePlayback('3151318', '1b96d90bf5', 'vod');

      expect(mockSdkClient.channel.deletePlayback).toHaveBeenCalledWith(
        '3151318',
        '1b96d90bf5',
        'vod'
      );
    });

    it('should throw PolyVValidationError for empty channelId', async () => {
      await expect(
        service.deletePlayback('', '1b96d90bf5')
      ).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for empty videoId', async () => {
      await expect(
        service.deletePlayback('3151318', '')
      ).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid listType', async () => {
      await expect(
        service.deletePlayback('3151318', '1b96d90bf5', 'invalid' as any)
      ).rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // Story 9.4: mergePlayback (Synchronous)
  // ============================================

  describe('mergePlayback (Story 9.4 - Synchronous)', () => {
    const mockMergeResponse = {
      fileId: 'merged-file-id',
      url: 'http://example.com/merged.mp4',
    };

    beforeEach(() => {
      mockSdkClient.channel.recordFileMerge = jest.fn();
    });

    it('should call SDK with correct parameters', async () => {
      mockSdkClient.channel.recordFileMerge.mockResolvedValueOnce(mockMergeResponse);

      const result = await service.mergePlayback('3151318', ['file1', 'file2', 'file3']);

      expect(mockSdkClient.channel.recordFileMerge).toHaveBeenCalledWith(
        '3151318',
        {
          fileIds: ['file1', 'file2', 'file3'],
          fileName: undefined,
        }
      );
      expect(result).toEqual(mockMergeResponse);
    });

    it('should pass fileName to SDK', async () => {
      mockSdkClient.channel.recordFileMerge.mockResolvedValueOnce(mockMergeResponse);

      await service.mergePlayback('3151318', ['file1', 'file2'], '合并回放');

      expect(mockSdkClient.channel.recordFileMerge).toHaveBeenCalledWith(
        '3151318',
        {
          fileIds: ['file1', 'file2'],
          fileName: '合并回放',
        }
      );
    });

    it('should throw PolyVValidationError for empty channelId', async () => {
      await expect(
        service.mergePlayback('', ['file1', 'file2'])
      ).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for empty fileIds array', async () => {
      await expect(
        service.mergePlayback('3151318', [])
      ).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid fileIds', async () => {
      await expect(
        service.mergePlayback('3151318', [''] as any)
      ).rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // Story 9.4: mergePlaybackAsync (Asynchronous)
  // ============================================

  describe('mergePlaybackAsync (Story 9.4 - Asynchronous)', () => {
    const mockAsyncResponse = true;

    beforeEach(() => {
      mockSdkClient.channel.recordFileMergeAsync = jest.fn();
    });

    it('should call SDK with correct parameters (basic)', async () => {
      mockSdkClient.channel.recordFileMergeAsync.mockResolvedValueOnce(mockAsyncResponse);

      const result = await service.mergePlaybackAsync('3151318', ['file1', 'file2', 'file3']);

      expect(mockSdkClient.channel.recordFileMergeAsync).toHaveBeenCalledWith(
        '3151318',
        {
          fileIds: ['file1', 'file2', 'file3'],
          fileName: undefined,
          callbackUrl: undefined,
        }
      );
      expect(result).toBe(true);
    });

    it('should pass all async options to SDK', async () => {
      mockSdkClient.channel.recordFileMergeAsync.mockResolvedValueOnce(mockAsyncResponse);

      await service.mergePlaybackAsync('3151318', ['file1', 'file2'], {
        fileName: '合并回放',
        callbackUrl: 'http://example.com/callback',
        autoConvert: true,
        mergeMp4: true,
        orderByCustom: true,
      });

      expect(mockSdkClient.channel.recordFileMergeAsync).toHaveBeenCalledWith(
        '3151318',
        {
          fileIds: ['file1', 'file2'],
          fileName: '合并回放',
          callbackUrl: 'http://example.com/callback',
          autoConvert: 'Y',
          mergeMp4: 'Y',
          orderByCustom: 'Y',
        }
      );
    });

    it('should throw PolyVValidationError for empty channelId', async () => {
      await expect(
        service.mergePlaybackAsync('', ['file1', 'file2'])
      ).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for empty fileIds array', async () => {
      await expect(
        service.mergePlaybackAsync('3151318', [])
      ).rejects.toThrow(PolyVValidationError);
    });
  });
});
