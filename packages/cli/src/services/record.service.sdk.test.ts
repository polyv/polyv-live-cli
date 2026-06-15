/**
 * @fileoverview Unit tests for RecordServiceSdk - ATDD Tests
 * @story 9.7: 录制设置管理命令
 *
 * Acceptance Criteria (Story 9.7):
 * - AC1: `record setting get` 命令支持 `--channel-id` 参数获取频道回放设置
 * - AC2: `record setting set` 命令支持更新频道回放设置
 * - AC3: `record convert` 命令支持将录制文件转存到点播（同步模式）
 * - AC4: `record convert` 命令支持 `--async` 参数异步转存
 * - AC5: `record set-default` 命令支持设置默认回放视频
 */

import { RecordServiceSdk } from './record.service.sdk';
import { AuthConfig } from '../types/auth';
import { RecordServiceConfig } from '../types/record';
import * as sdkModule from '../sdk';

// Mock the SDK module
jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

const mockCreateSdkClient = sdkModule.createSdkClient as jest.MockedFunction<typeof sdkModule.createSdkClient>;

describe('RecordServiceSdk - Story 9.7: Record Settings Commands', () => {
  let service: RecordServiceSdk;
  let mockSdkClient: { channel: { [key: string]: jest.Mock } };

  const mockAuthConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
    userId: 'test-user-id',
  };

  const mockServiceConfig: RecordServiceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };

  const mockPlaybackSettingResponse = {
    channelId: '2588188',
    playbackEnabled: 'Y',
    type: 'single',
    origin: 'playback',
    videoId: '73801f70c8',
    videoName: '测试视频',
    sectionEnabled: 'N',
    globalSettingEnabled: 'N',
    playbackMultiplierEnabled: 'Y',
    playbackProgressBarEnabled: 'Y',
    playbackProgressBarOperationType: 'drag',
    showPlayButtonEnabled: 'Y',
    chatPlaybackEnabled: 'N',
    productPlaybackEnabled: 'N',
    questionnairePlaybackEnabled: 'N',
    qaPlaybackEnabled: 'N',
    cardPushPlaybackEnabled: 'N',
    checkInPlaybackEnabled: 'N',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock SDK client
    mockSdkClient = {
      channel: {
        getPlaybackSetting: jest.fn(),
        setPlaybackSetting: jest.fn(),
        recordConvert: jest.fn(),
        recordConvertAsync: jest.fn(),
        setRecordDefault: jest.fn(),
      },
    };

    mockCreateSdkClient.mockReturnValue(mockSdkClient as any);
    service = new RecordServiceSdk(mockAuthConfig, mockServiceConfig);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // ============================================
  // AC1: getPlaybackSetting
  // ============================================

  describe('getPlaybackSetting (AC1)', () => {
    it('should call SDK client.channel.getPlaybackSetting', async () => {
      mockSdkClient.channel.getPlaybackSetting.mockResolvedValueOnce(mockPlaybackSettingResponse);

      await service.getPlaybackSetting('2588188');

      expect(mockSdkClient.channel.getPlaybackSetting).toHaveBeenCalledWith('2588188');
    });

    it('should transform response to display format', async () => {
      mockSdkClient.channel.getPlaybackSetting.mockResolvedValueOnce(mockPlaybackSettingResponse);

      const result = await service.getPlaybackSetting('2588188');

      expect(result).toHaveProperty('channelId', '2588188');
      expect(result).toHaveProperty('playbackEnabled', 'Y');
      expect(result).toHaveProperty('type', 'single');
      expect(result).toHaveProperty('origin', 'playback');
      expect(result).toHaveProperty('videoId', '73801f70c8');
      expect(result).toHaveProperty('videoName', '测试视频');
    });

    it('should handle missing optional fields', async () => {
      const minimalResponse = {
        channelId: '2588188',
        playbackEnabled: 'Y',
      };
      mockSdkClient.channel.getPlaybackSetting.mockResolvedValueOnce(minimalResponse);

      const result = await service.getPlaybackSetting('2588188');

      expect(result.channelId).toBe('2588188');
      expect(result.playbackEnabled).toBe('Y');
      // Optional fields should be undefined
      expect(result.videoName).toBeUndefined();
    });

    it('should handle crontabType, startTime, endTime fields', async () => {
      const responseWithSchedule = {
        channelId: '2588188',
        playbackEnabled: 'Y',
        crontabType: 'daily',
        startTime: 1705284000000,
        endTime: 1705291200000,
      };
      mockSdkClient.channel.getPlaybackSetting.mockResolvedValueOnce(responseWithSchedule);

      const result = await service.getPlaybackSetting('2588188');

      expect(result.crontabType).toBe('daily');
      expect(result.startTime).toBe(1705284000000);
      expect(result.endTime).toBe(1705291200000);
    });

    it('should use fallback channelId when result.channelId is undefined', async () => {
      const responseWithoutChannelId = {
        playbackEnabled: 'Y',
      };
      mockSdkClient.channel.getPlaybackSetting.mockResolvedValueOnce(responseWithoutChannelId);

      const result = await service.getPlaybackSetting('2588188');

      expect(result.channelId).toBe('2588188');
    });

    it('should propagate SDK errors', async () => {
      const error = new Error('API Error');
      mockSdkClient.channel.getPlaybackSetting.mockRejectedValueOnce(error);

      await expect(service.getPlaybackSetting('2588188')).rejects.toThrow('API Error');
    });
  });

  // ============================================
  // AC2: setPlaybackSetting
  // ============================================

  describe('setPlaybackSetting (AC2)', () => {
    it('should call SDK client.channel.setPlaybackSetting', async () => {
      mockSdkClient.channel.setPlaybackSetting.mockResolvedValueOnce(true);

      const options = {
        playbackEnabled: 'Y' as const,
        type: 'single' as const,
      };

      await service.setPlaybackSetting('2588188', options);

      expect(mockSdkClient.channel.setPlaybackSetting).toHaveBeenCalledWith(
        '2588188',
        expect.objectContaining({
          playbackEnabled: 'Y',
          type: 'single',
        })
      );
    });

    it('should pass all options correctly', async () => {
      mockSdkClient.channel.setPlaybackSetting.mockResolvedValueOnce(true);

      const options = {
        playbackEnabled: 'Y' as const,
        type: 'single' as const,
        origin: 'playback' as const,
        videoId: '73801f70c8',
        playbackMultiplierEnabled: 'Y' as const,
        chatPlaybackEnabled: 'N' as const,
      };

      await service.setPlaybackSetting('2588188', options);

      expect(mockSdkClient.channel.setPlaybackSetting).toHaveBeenCalledWith(
        '2588188',
        expect.objectContaining({
          playbackEnabled: 'Y',
          type: 'single',
          origin: 'playback',
          videoId: '73801f70c8',
          playbackMultiplierEnabled: 'Y',
          chatPlaybackEnabled: 'N',
        })
      );
    });

    it('should return true on success', async () => {
      mockSdkClient.channel.setPlaybackSetting.mockResolvedValueOnce(true);

      const result = await service.setPlaybackSetting('2588188', {
        playbackEnabled: 'Y',
      });

      expect(result).toBe(true);
    });

    it('should propagate SDK errors', async () => {
      const error = new Error('API Error');
      mockSdkClient.channel.setPlaybackSetting.mockRejectedValueOnce(error);

      await expect(
        service.setPlaybackSetting('2588188', { playbackEnabled: 'Y' })
      ).rejects.toThrow('API Error');
    });
  });

  // ============================================
  // AC3: recordConvert - Sync mode
  // ============================================

  describe('recordConvert - Sync mode (AC3)', () => {
    it('should call SDK client.channel.recordConvert', async () => {
      mockSdkClient.channel.recordConvert.mockResolvedValueOnce({
        fileId: 'vid123456',
      });

      const options = {
        sessionId: 'session-123',
        fileName: 'test.mp4',
      };

      await service.recordConvert('2588188', options);

      expect(mockSdkClient.channel.recordConvert).toHaveBeenCalledWith(
        '2588188',
        expect.objectContaining({
          fileId: 'session-123',
          fileName: 'test.mp4',
        })
      );
    });

    it('should return result with async=false and vid', async () => {
      mockSdkClient.channel.recordConvert.mockResolvedValueOnce({
        fileId: 'vid123456',
      });

      const result = await service.recordConvert('2588188', {
        sessionId: 'session-123',
      });

      expect(result).toHaveProperty('async', false);
      expect(result).toHaveProperty('vid', 'vid123456');
    });

    it('should pass all options correctly', async () => {
      mockSdkClient.channel.recordConvert.mockResolvedValueOnce({
        fileId: 'vid123456',
      });

      const options = {
        sessionId: 'session-123',
        fileName: 'test.mp4',
        cataId: 'cata123',
        cataName: '测试分类',
        toPlayList: 'Y' as const,
        setAsDefault: 'Y' as const,
        callbackUrl: 'https://example.com/callback',
      };

      await service.recordConvert('2588188', options);

      expect(mockSdkClient.channel.recordConvert).toHaveBeenCalledWith(
        '2588188',
        expect.objectContaining({
          fileId: 'session-123',
          fileName: 'test.mp4',
          callbackUrl: 'https://example.com/callback',
        })
      );
    });

    it('should propagate SDK errors', async () => {
      const error = new Error('API Error');
      mockSdkClient.channel.recordConvert.mockRejectedValueOnce(error);

      await expect(
        service.recordConvert('2588188', { sessionId: 'session-123' })
      ).rejects.toThrow('API Error');
    });
  });

  // ============================================
  // AC4: recordConvertAsync - Async mode
  // ============================================

  describe('recordConvertAsync - Async mode (AC4)', () => {
    it('should call SDK client.channel.recordConvertAsync', async () => {
      mockSdkClient.channel.recordConvertAsync.mockResolvedValueOnce({});

      const options = {
        sessionId: 'session-123',
        fileName: 'test.mp4',
        callbackUrl: 'https://example.com/callback',
      };

      await service.recordConvertAsync('2588188', options);

      expect(mockSdkClient.channel.recordConvertAsync).toHaveBeenCalledWith(
        '2588188',
        expect.objectContaining({
          fileId: 'session-123',
          fileName: 'test.mp4',
          callbackUrl: 'https://example.com/callback',
        })
      );
    });

    it('should return result with async=true', async () => {
      mockSdkClient.channel.recordConvertAsync.mockResolvedValueOnce({});

      const result = await service.recordConvertAsync('2588188', {
        sessionId: 'session-123',
      });

      expect(result).toHaveProperty('async', true);
    });

    it('should propagate SDK errors', async () => {
      const error = new Error('API Error');
      mockSdkClient.channel.recordConvertAsync.mockRejectedValueOnce(error);

      await expect(
        service.recordConvertAsync('2588188', { sessionId: 'session-123' })
      ).rejects.toThrow('API Error');
    });
  });

  // ============================================
  // AC5: setRecordDefault
  // ============================================

  describe('setRecordDefault (AC5)', () => {
    it('should call SDK client.channel.setRecordDefault', async () => {
      mockSdkClient.channel.setRecordDefault.mockResolvedValueOnce(true);

      await service.setRecordDefault('2588188', '73801f70c8', 'playback');

      expect(mockSdkClient.channel.setRecordDefault).toHaveBeenCalledWith(
        '2588188',
        '73801f70c8',
        'playback'
      );
    });

    it('should return true on success', async () => {
      mockSdkClient.channel.setRecordDefault.mockResolvedValueOnce(true);

      const result = await service.setRecordDefault('2588188', '73801f70c8', 'playback');

      expect(result).toBe(true);
    });

    it('should work without listType', async () => {
      mockSdkClient.channel.setRecordDefault.mockResolvedValueOnce(true);

      const result = await service.setRecordDefault('2588188', '73801f70c8');

      expect(mockSdkClient.channel.setRecordDefault).toHaveBeenCalledWith(
        '2588188',
        '73801f70c8',
        undefined
      );
      expect(result).toBe(true);
    });

    it('should propagate SDK errors', async () => {
      const error = new Error('API Error');
      mockSdkClient.channel.setRecordDefault.mockRejectedValueOnce(error);

      await expect(
        service.setRecordDefault('2588188', '73801f70c8', 'playback')
      ).rejects.toThrow('API Error');
    });
  });
});
