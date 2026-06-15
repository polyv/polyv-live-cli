/**
 * @fileoverview Unit tests for RecordHandler - ATDD Failing Tests (RED Phase)
 * @story 9.7: 录制设置管理命令
 *
 * These tests will FAIL until the feature is implemented (TDD red phase)
 *
 * Acceptance Criteria (Story 9.7):
 * - AC1: `record setting get` 命令支持 `--channel-id` 参数获取频道回放设置
 * - AC2: `record setting set` 命令支持更新频道回放设置（回放开关、回放方式、回放来源等）
 * - AC3: `record convert` 命令支持将录制文件转存到点播（同步模式）
 * - AC4: `record convert` 命令支持 `--async` 参数异步转存
 * - AC5: `record set-default` 命令支持设置默认回放视频
 * - AC6: 所有命令支持 `--output` 参数选择 table 或 json 输出格式
 * - AC7: 表格输出格式清晰，显示设置信息
 * - AC8: JSON 输出完整包含所有 API 返回字段
 */

import { RecordHandler, IRecordService } from './record.handler';
import { AuthConfig } from '../types/auth';
import {
  RecordServiceConfig,
  RecordSettingGetOptions,
  RecordSettingSetOptions,
  RecordConvertOptions,
  RecordSetDefaultOptions,
  RecordSettingDisplayItem,
} from '../types/record';

// Mock the RecordServiceSdk
jest.mock('../services/record.service.sdk', () => ({
  RecordServiceSdk: jest.fn().mockImplementation(() => ({
    getPlaybackSetting: jest.fn(),
    setPlaybackSetting: jest.fn(),
    recordConvert: jest.fn(),
    recordConvertAsync: jest.fn(),
    setRecordDefault: jest.fn(),
  })),
}));

describe('RecordHandler - Story 9.7: Record Settings Commands (ATDD RED Phase)', () => {
  let handler: RecordHandler;
  let mockRecordService: jest.Mocked<IRecordService>;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  const mockAuthConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
  };

  const mockServiceConfig: RecordServiceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };

  const mockPlaybackSetting: RecordSettingDisplayItem = {
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

    // Create mock service
    mockRecordService = {
      getPlaybackSetting: jest.fn(),
      setPlaybackSetting: jest.fn(),
      recordConvert: jest.fn(),
      recordConvertAsync: jest.fn(),
      setRecordDefault: jest.fn(),
    };

    // Create handler with mock service
    handler = new RecordHandler(mockAuthConfig, mockServiceConfig, mockRecordService);

    // Mock console methods
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  // ============================================
  // AC1: getPlaybackSetting - Basic functionality
  // ============================================

  describe('AC1: getPlaybackSetting - Basic functionality', () => {
    it('should call service with channelId', async () => {
      mockRecordService.getPlaybackSetting.mockResolvedValueOnce(mockPlaybackSetting);

      const options: RecordSettingGetOptions = {
        channelId: '2588188',
      };

      await handler.getPlaybackSetting(options);

      expect(mockRecordService.getPlaybackSetting).toHaveBeenCalledWith('2588188');
    });

    it('should display playback settings in table format by default', async () => {
      mockRecordService.getPlaybackSetting.mockResolvedValueOnce(mockPlaybackSetting);

      const options: RecordSettingGetOptions = {
        channelId: '2588188',
      };

      await handler.getPlaybackSetting(options);

      // Should display context info
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('回放设置')
      );
    });

    it('should display playback settings in JSON format when requested', async () => {
      mockRecordService.getPlaybackSetting.mockResolvedValueOnce(mockPlaybackSetting);

      const options: RecordSettingGetOptions = {
        channelId: '2588188',
        output: 'json',
      };

      await handler.getPlaybackSetting(options);

      // Should have called console.log with JSON output
      const jsonCall = mockConsoleLog.mock.calls.find(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('"playbackEnabled"'))
      );
      expect(jsonCall).toBeDefined();
    });

    it('should validate required channelId', async () => {
      const options: RecordSettingGetOptions = {
        channelId: '',
      };

      await expect(handler.getPlaybackSetting(options)).rejects.toThrow();
    });
  });

  // ============================================
  // AC1: Table output format
  // ============================================

  describe('AC1: getPlaybackSetting - Table output format', () => {
    it('should display Chinese labels for settings', async () => {
      mockRecordService.getPlaybackSetting.mockResolvedValueOnce(mockPlaybackSetting);

      const options: RecordSettingGetOptions = {
        channelId: '2588188',
        output: 'table',
      };

      await handler.getPlaybackSetting(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('回放开关');
      expect(logCalls).toContain('回放类型');
      expect(logCalls).toContain('回放来源');
    });

    it('should map Y/N values to Chinese labels', async () => {
      mockRecordService.getPlaybackSetting.mockResolvedValueOnce(mockPlaybackSetting);

      const options: RecordSettingGetOptions = {
        channelId: '2588188',
        output: 'table',
      };

      await handler.getPlaybackSetting(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('开启');
    });
  });

  // ============================================
  // AC2: setPlaybackSetting - Basic functionality
  // ============================================

  describe('AC2: setPlaybackSetting - Basic functionality', () => {
    it('should call service with correct parameters', async () => {
      mockRecordService.setPlaybackSetting.mockResolvedValueOnce(true);

      const options: RecordSettingSetOptions = {
        channelId: '2588188',
        playbackEnabled: 'Y',
        type: 'single',
      };

      await handler.setPlaybackSetting(options);

      expect(mockRecordService.setPlaybackSetting).toHaveBeenCalledWith(
        '2588188',
        expect.objectContaining({
          playbackEnabled: 'Y',
          type: 'single',
        })
      );
    });

    it('should validate required channelId', async () => {
      const options: RecordSettingSetOptions = {
        channelId: '',
        playbackEnabled: 'Y',
      };

      await expect(handler.setPlaybackSetting(options)).rejects.toThrow();
    });

    it('should display success message after update', async () => {
      mockRecordService.setPlaybackSetting.mockResolvedValueOnce(true);

      const options: RecordSettingSetOptions = {
        channelId: '2588188',
        playbackEnabled: 'Y',
      };

      await handler.setPlaybackSetting(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('成功');
    });

    it('should display result in JSON format when requested', async () => {
      mockRecordService.setPlaybackSetting.mockResolvedValueOnce(true);

      const options: RecordSettingSetOptions = {
        channelId: '2588188',
        playbackEnabled: 'Y',
        output: 'json',
      };

      await handler.setPlaybackSetting(options);

      const jsonCall = mockConsoleLog.mock.calls.find(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('"channelId"'))
      );
      expect(jsonCall).toBeDefined();
    });
  });

  // ============================================
  // AC3: recordConvert - Sync mode
  // ============================================

  describe('AC3: recordConvert - Sync mode', () => {
    it('should call service with correct parameters', async () => {
      mockRecordService.recordConvert.mockResolvedValueOnce({
        async: false,
        vid: '1b448be32353f0f4638f70a9545c75bd_1',
      });

      const options: RecordConvertOptions = {
        channelId: '2588188',
        sessionId: 'fvlyin8qz3',
        fileName: '测试转存',
      };

      await handler.recordConvert(options);

      expect(mockRecordService.recordConvert).toHaveBeenCalledWith(
        '2588188',
        expect.objectContaining({
          sessionId: 'fvlyin8qz3',
          fileName: '测试转存',
        })
      );
    });

    it('should display convert result in table format', async () => {
      mockRecordService.recordConvert.mockResolvedValueOnce({
        async: false,
        vid: '1b448be32353f0f4638f70a9545c75bd_1',
      });

      const options: RecordConvertOptions = {
        channelId: '2588188',
        sessionId: 'fvlyin8qz3',
        fileName: '测试转存',
      };

      await handler.recordConvert(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('转存成功');
    });

    it('should display vid in output', async () => {
      mockRecordService.recordConvert.mockResolvedValueOnce({
        async: false,
        vid: '1b448be32353f0f4638f70a9545c75bd_1',
      });

      const options: RecordConvertOptions = {
        channelId: '2588188',
        sessionId: 'fvlyin8qz3',
        fileName: '测试转存',
      };

      await handler.recordConvert(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('1b448be32353f0f4638f70a9545c75bd_1');
    });

    it('should validate required fileName', async () => {
      const options: RecordConvertOptions = {
        channelId: '2588188',
        sessionId: 'fvlyin8qz3',
        fileName: '',
      };

      await expect(handler.recordConvert(options)).rejects.toThrow();
    });
  });

  // ============================================
  // AC4: recordConvert - Async mode
  // ============================================

  describe('AC4: recordConvert - Async mode', () => {
    it('should call service with async flag', async () => {
      mockRecordService.recordConvertAsync.mockResolvedValueOnce({
        async: true,
      });

      const options: RecordConvertOptions = {
        channelId: '2588188',
        sessionId: 'fvlyin8qz3',
        fileName: '测试转存',
        async: true,
      };

      await handler.recordConvert(options);

      expect(mockRecordService.recordConvertAsync).toHaveBeenCalledWith(
        '2588188',
        expect.objectContaining({
          sessionId: 'fvlyin8qz3',
          fileName: '测试转存',
        })
      );
    });

    it('should display async status message', async () => {
      mockRecordService.recordConvertAsync.mockResolvedValueOnce({
        async: true,
      });

      const options: RecordConvertOptions = {
        channelId: '2588188',
        sessionId: 'fvlyin8qz3',
        fileName: '测试转存',
        async: true,
      };

      await handler.recordConvert(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('已提交');
      expect(logCalls).toContain('处理中');
    });

    it('should not return vid in async mode', async () => {
      mockRecordService.recordConvertAsync.mockResolvedValueOnce({
        async: true,
      });

      const options: RecordConvertOptions = {
        channelId: '2588188',
        sessionId: 'fvlyin8qz3',
        fileName: '测试转存',
        async: true,
        output: 'json',
      };

      await handler.recordConvert(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      // Should not contain vid field in async mode
      expect(logCalls).not.toContain('1b448be32353f0f4638f70a9545c75bd_1');
    });

    it('should not call sync convert when async is true', async () => {
      mockRecordService.recordConvertAsync.mockResolvedValueOnce({
        async: true,
      });

      const options: RecordConvertOptions = {
        channelId: '2588188',
        sessionId: 'fvlyin8qz3',
        fileName: '测试转存',
        async: true,
      };

      await handler.recordConvert(options);

      // Should NOT call synchronous convert
      expect(mockRecordService.recordConvert).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // AC5: setRecordDefault - Basic functionality
  // ============================================

  describe('AC5: setRecordDefault - Basic functionality', () => {
    it('should call service with correct parameters', async () => {
      mockRecordService.setRecordDefault.mockResolvedValueOnce(true);

      const options: RecordSetDefaultOptions = {
        channelId: '2588188',
        videoId: '73801f70c8',
      };

      await handler.setRecordDefault(options);

      expect(mockRecordService.setRecordDefault).toHaveBeenCalledWith(
        '2588188',
        '73801f70c8',
        undefined
      );
    });

    it('should display success message', async () => {
      mockRecordService.setRecordDefault.mockResolvedValueOnce(true);

      const options: RecordSetDefaultOptions = {
        channelId: '2588188',
        videoId: '73801f70c8',
      };

      await handler.setRecordDefault(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('成功');
      expect(logCalls).toContain('默认回放');
    });

    it('should support listType parameter', async () => {
      mockRecordService.setRecordDefault.mockResolvedValueOnce(true);

      const options: RecordSetDefaultOptions = {
        channelId: '2588188',
        videoId: '73801f70c8',
        listType: 'playback',
      };

      await handler.setRecordDefault(options);

      expect(mockRecordService.setRecordDefault).toHaveBeenCalledWith(
        '2588188',
        '73801f70c8',
        'playback'
      );
    });

    it('should validate required channelId', async () => {
      const options: RecordSetDefaultOptions = {
        channelId: '',
        videoId: '73801f70c8',
      };

      await expect(handler.setRecordDefault(options)).rejects.toThrow();
    });

    it('should validate required videoId', async () => {
      const options: RecordSetDefaultOptions = {
        channelId: '2588188',
        videoId: '',
      };

      await expect(handler.setRecordDefault(options)).rejects.toThrow();
    });
  });

  // ============================================
  // AC6: Output format options
  // ============================================

  describe('AC6: Output format options', () => {
    it('should support table output for getPlaybackSetting', async () => {
      mockRecordService.getPlaybackSetting.mockResolvedValueOnce(mockPlaybackSetting);

      const options: RecordSettingGetOptions = {
        channelId: '2588188',
        output: 'table',
      };

      await handler.getPlaybackSetting(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('属性');
    });

    it('should support json output for getPlaybackSetting', async () => {
      mockRecordService.getPlaybackSetting.mockResolvedValueOnce(mockPlaybackSetting);

      const options: RecordSettingGetOptions = {
        channelId: '2588188',
        output: 'json',
      };

      await handler.getPlaybackSetting(options);

      const jsonCall = mockConsoleLog.mock.calls.find(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('"channelId"'))
      );
      expect(jsonCall).toBeDefined();
    });

    it('should support table output for recordConvert', async () => {
      mockRecordService.recordConvert.mockResolvedValueOnce({
        async: false,
        vid: 'test-vid',
      });

      const options: RecordConvertOptions = {
        channelId: '2588188',
        sessionId: 'test-session',
        fileName: 'test',
        output: 'table',
      };

      await handler.recordConvert(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('属性');
    });

    it('should support json output for recordConvert', async () => {
      mockRecordService.recordConvert.mockResolvedValueOnce({
        async: false,
        vid: 'test-vid',
      });

      const options: RecordConvertOptions = {
        channelId: '2588188',
        sessionId: 'test-session',
        fileName: 'test',
        output: 'json',
      };

      await handler.recordConvert(options);

      const jsonCall = mockConsoleLog.mock.calls.find(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('"vid"'))
      );
      expect(jsonCall).toBeDefined();
    });
  });

  // ============================================
  // Error Handling
  // ============================================

  describe('Error Handling', () => {
    it('should handle service errors gracefully in getPlaybackSetting', async () => {
      const error = new Error('API Error');
      mockRecordService.getPlaybackSetting.mockRejectedValueOnce(error);

      const options: RecordSettingGetOptions = {
        channelId: '2588188',
      };

      await expect(handler.getPlaybackSetting(options)).rejects.toThrow('API Error');
    });

    it('should handle service errors gracefully in setPlaybackSetting', async () => {
      const error = new Error('API Error');
      mockRecordService.setPlaybackSetting.mockRejectedValueOnce(error);

      const options: RecordSettingSetOptions = {
        channelId: '2588188',
        playbackEnabled: 'Y',
      };

      await expect(handler.setPlaybackSetting(options)).rejects.toThrow('API Error');
    });

    it('should handle service errors gracefully in recordConvert', async () => {
      const error = new Error('API Error');
      mockRecordService.recordConvert.mockRejectedValueOnce(error);

      const options: RecordConvertOptions = {
        channelId: '2588188',
        sessionId: 'test-session',
        fileName: 'test',
      };

      await expect(handler.recordConvert(options)).rejects.toThrow('API Error');
    });

    it('should handle service errors gracefully in setRecordDefault', async () => {
      const error = new Error('API Error');
      mockRecordService.setRecordDefault.mockRejectedValueOnce(error);

      const options: RecordSetDefaultOptions = {
        channelId: '2588188',
        videoId: '73801f70c8',
      };

      await expect(handler.setRecordDefault(options)).rejects.toThrow('API Error');
    });
  });
});
