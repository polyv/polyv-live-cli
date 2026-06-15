/**
 * @fileoverview Unit tests for PlaybackHandler - ATDD Failing Tests (RED Phase)
 * @story 9.1: 回放列表命令
 * @story 9.2: 回放详情命令
 * @story 9.3: 回放删除命令
 *
 * These tests will FAIL until the feature is implemented (TDD red phase)
 *
 * Acceptance Criteria (Story 9.1):
 * - AC1: `playback list` 命令支持通过 `--channel-id` 参数获取指定频道的回放列表
 * - AC2: 支持分页参数 `--page` 和 `--page-size`
 * - AC3: 支持 `--list-type` 参数区分回放列表(playback)和点播列表(vod)
 * - AC4: 表格输出格式清晰，显示视频ID、标题、时长、创建时间等关键信息
 * - AC5: JSON 输出完整包含所有字段
 * - AC6: 优雅处理空结果（无回放视频时显示友好提示）
 *
 * Acceptance Criteria (Story 9.2):
 * - AC1: `playback get` 命令通过 `--channel-id` 和 `--video-id` 参数获取指定回放视频的详情
 * - AC2: 返回完整的回放信息（包含视频ID、标题、时长、状态、创建时间等)
 * - AC3: 表格输出格式清晰，显示视频ID、标题、时长、创建时间、状态等关键信息
 * - AC4: JSON 输出完整包含所有字段
 * - AC5: 指定的回放视频不存在时显示友好的错误提示
 * - AC6: 支持 `--list-type` 参数区分回放列表(playback)和点播列表(vod)
 *
 * Acceptance Criteria (Story 9.3):
 * - AC1: `playback delete` 命令支持 `--channel-id` 参数（必填）
 * - AC2: `playback delete` 命令支持 `--video-id` 参数（必填）
 * - AC3: 删除前需要确认提示，除非使用 `--force` 标志
 * - AC4: 成功删除后显示确认消息
 * - AC5: 支持 `--list-type` 参数区分回放列表(playback)和点播列表(vod)
 * - AC6: 支持 `--force` 标志跳过确认提示
 * - AC7: 支持 `--output` 参数选择 table 或 json 输出格式
 * - AC8: 表格输出格式清晰，显示删除结果
 */

import { PlaybackHandler, IPlaybackService } from './playback.handler';
import { AuthConfig } from '../types/auth';
import { PlaybackServiceConfig, PlaybackListOptions, PlaybackGetOptions, PlaybackDeleteOptions, PlaybackMergeOptions } from '../types/playback';
import { confirmDeletion, isInteractiveEnvironment } from '../utils/confirmation';

// Mock the PlaybackServiceSdk
jest.mock('../services/playback.service.sdk', () => ({
  PlaybackServiceSdk: jest.fn().mockImplementation(() => ({
    getPlaybackList: jest.fn(),
    deletePlayback: jest.fn(),
    mergePlayback: jest.fn(),
    mergePlaybackAsync: jest.fn(),
  })),
}));

// Mock the confirmation utility
jest.mock('../utils/confirmation', () => ({
  confirmDeletion: jest.fn(),
  isInteractiveEnvironment: jest.fn().mockReturnValue(true),
}));

describe('PlaybackHandler (Story 9.1 - ATDD RED Phase)', () => {
  let handler: PlaybackHandler;
  let mockPlaybackService: jest.Mocked<IPlaybackService>;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  const mockAuthConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
  };

  const mockServiceConfig: PlaybackServiceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };

  const mockPlaybackResponse = {
    pageSize: 10,
    pageNumber: 1,
    totalItems: 2,
    totalPages: 1,
    contents: [
      {
        videoId: '1b96d90bf5',
        videoPoolId: '1b448be323e68e4404332113a57353b2_1',
        userId: '1b448be323',
        channelId: '2191532',
        title: 'Spring 知识精讲',
        firstImage: '//doc.polyv.net/images/default/blackboard.png',
        duration: '00:01:53',
        myBr: '1',
        seed: 0,
        createdTime: 1615515464000,
        lastModified: 1615515464000,
        asDefault: 'N',
        status: 'Y',
        watchUrl: '//live.polyv.cn/watch/2191532?vid=1b96d90bf5',
        liveType: 'ppt',
        origin: 'manual' as const,
      },
      {
        videoId: '2c07e91cg6',
        videoPoolId: '1b448be323e68e4404332113a57353b2_2',
        userId: '1b448be323',
        channelId: '2191532',
        title: '直播回放测试',
        firstImage: '//doc.polyv.net/images/default/blackboard.png',
        duration: '00:05:30',
        myBr: '1',
        seed: 0,
        createdTime: 1615623738000,
        lastModified: 1615623738000,
        asDefault: 'N',
        status: 'Y',
        watchUrl: '//live.polyv.cn/watch/2191532?vid=2c07e91cg6',
        liveType: 'alone',
        origin: 'auto' as const,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock service
    mockPlaybackService = {
      getPlaybackList: jest.fn(),
      deletePlayback: jest.fn(),
      mergePlayback: jest.fn(),
      mergePlaybackAsync: jest.fn(),
    };

    // Create handler with mock service
    handler = new PlaybackHandler(mockAuthConfig, mockServiceConfig, mockPlaybackService);

    // Mock console methods
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  // ============================================
  // AC1: Basic playback list functionality
  // ============================================

  describe('AC1: listPlayback - Basic functionality', () => {
    it('should call service with channelId', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackListOptions = {
        channelId: '2191532',
      };

      await handler.listPlayback(options);

      expect(mockPlaybackService.getPlaybackList).toHaveBeenCalledWith({
        channelId: '2191532',
      });
    });

    it('should display playback list in table format by default', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackListOptions = {
        channelId: '2191532',
      };

      await handler.listPlayback(options);

      // Should display context info
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('回放列表')
      );
    });
  });

  // ============================================
  // AC2: Pagination parameters
  // ============================================

  describe('AC2: listPlayback - Pagination', () => {
    it('should pass page parameter to service', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackListOptions = {
        channelId: '2191532',
        page: 2,
      };

      await handler.listPlayback(options);

      expect(mockPlaybackService.getPlaybackList).toHaveBeenCalledWith({
        channelId: '2191532',
        page: 2,
      });
    });

    it('should pass pageSize parameter to service', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackListOptions = {
        channelId: '2191532',
        pageSize: 20,
      };

      await handler.listPlayback(options);

      expect(mockPlaybackService.getPlaybackList).toHaveBeenCalledWith({
        channelId: '2191532',
        pageSize: 20,
      });
    });

    it('should pass both page and pageSize parameters to service', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackListOptions = {
        channelId: '2191532',
        page: 2,
        pageSize: 20,
      };

      await handler.listPlayback(options);

      expect(mockPlaybackService.getPlaybackList).toHaveBeenCalledWith({
        channelId: '2191532',
        page: 2,
        pageSize: 20,
      });
    });
  });

  // ============================================
  // AC3: listType parameter
  // ============================================

  describe('AC3: listPlayback - List Type', () => {
    it('should pass listType "playback" to service', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackListOptions = {
        channelId: '2191532',
        listType: 'playback',
      };

      await handler.listPlayback(options);

      expect(mockPlaybackService.getPlaybackList).toHaveBeenCalledWith({
        channelId: '2191532',
        listType: 'playback',
      });
    });

    it('should pass listType "vod" to service', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackListOptions = {
        channelId: '2191532',
        listType: 'vod',
      };

      await handler.listPlayback(options);

      expect(mockPlaybackService.getPlaybackList).toHaveBeenCalledWith({
        channelId: '2191532',
        listType: 'vod',
      });
    });
  });

  // ============================================
  // AC4: Table output format
  // ============================================

  describe('AC4: listPlayback - Table Output', () => {
    it('should display table with Chinese headers', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackListOptions = {
        channelId: '2191532',
        output: 'table',
      };

      await handler.listPlayback(options);

      // Check for Chinese headers in table output
      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('视频ID');
      expect(logCalls).toContain('标题');
      expect(logCalls).toContain('时长');
      expect(logCalls).toContain('创建时间');
      expect(logCalls).toContain('状态');
    });

    it('should display playback videos in table rows', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackListOptions = {
        channelId: '2191532',
        output: 'table',
      };

      await handler.listPlayback(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('1b96d90bf5');
      expect(logCalls).toContain('Spring 知识精讲');
    });

    it('should display channel info and total count', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackListOptions = {
        channelId: '2191532',
        output: 'table',
      };

      await handler.listPlayback(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('2191532');
      expect(logCalls).toContain('共');
    });
  });

  // ============================================
  // AC5: JSON output format
  // ============================================

  describe('AC5: listPlayback - JSON Output', () => {
    it('should output full JSON when output is json', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackListOptions = {
        channelId: '2191532',
        output: 'json',
      };

      await handler.listPlayback(options);

      // Should have called console.log with JSON output
      const jsonCall = mockConsoleLog.mock.calls.find(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('"videoId"'))
      );
      expect(jsonCall).toBeDefined();
    });

    it('should include all fields in JSON output', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackListOptions = {
        channelId: '2191532',
        output: 'json',
      };

      await handler.listPlayback(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      // Check for complete field presence
      expect(logCalls).toContain('videoPoolId');
      expect(logCalls).toContain('watchUrl');
      expect(logCalls).toContain('liveType');
    });
  });

  // ============================================
  // AC6: Empty result handling
  // ============================================

  describe('AC6: listPlayback - Empty Results', () => {
    it('should display friendly message when no playback videos found', async () => {
      const emptyResponse = {
        pageSize: 10,
        pageNumber: 1,
        totalItems: 0,
        totalPages: 0,
        contents: [],
      };
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(emptyResponse);

      const options: PlaybackListOptions = {
        channelId: '2191532',
      };

      await handler.listPlayback(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('暂无回放视频');
    });

    it('should handle empty contents array gracefully', async () => {
      const emptyContentsResponse = {
        pageSize: 10,
        pageNumber: 1,
        totalItems: 0,
        totalPages: 0,
        contents: [],
      };
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(emptyContentsResponse);

      const options: PlaybackListOptions = {
        channelId: '2191532',
        output: 'json',
      };

      await handler.listPlayback(options);

      // Should not throw error and should handle gracefully
      expect(mockPlaybackService.getPlaybackList).toHaveBeenCalled();
    });
  });

  // ============================================
  // Error Handling
  // ============================================

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const error = new Error('API Error');
      mockPlaybackService.getPlaybackList.mockRejectedValueOnce(error);

      const options: PlaybackListOptions = {
        channelId: '2191532',
      };

      await expect(handler.listPlayback(options)).rejects.toThrow('API Error');
    });

    it('should validate required channelId', async () => {
      const options: PlaybackListOptions = {
        channelId: '',
      };

      await expect(handler.listPlayback(options)).rejects.toThrow();
    });
  });

  // ============================================
  // Story 9.2: getPlayback
  // ============================================

  describe('Story 9.2: getPlayback - AC1 Basic functionality', () => {
    it('should call service with channelId and videoId', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackGetOptions = {
        channelId: '2191532',
        videoId: '1b96d90bf5',
      };

      await handler.getPlayback(options);

      expect(mockPlaybackService.getPlaybackList).toHaveBeenCalledWith({
        channelId: '2191532',
      });
    });

    it('should filter playback list by videoId', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackGetOptions = {
        channelId: '2191532',
        videoId: '1b96d90bf5',
      };

      await handler.getPlayback(options);

      // Should display the specific video
      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('1b96d90bf5');
      expect(logCalls).toContain('Spring 知识精讲');
    });
  });

  // ============================================
  // Story 9.2 AC2: Complete playback information
  // ============================================

  describe('Story 9.2: getPlayback - AC2 Complete information', () => {
    it('should return complete playback information', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackGetOptions = {
        channelId: '2191532',
        videoId: '1b96d90bf5',
        output: 'json',
      };

      await handler.getPlayback(options);

      // Check for complete fields in JSON output
      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('videoId');
      expect(logCalls).toContain('title');
      expect(logCalls).toContain('duration');
      expect(logCalls).toContain('status');
      expect(logCalls).toContain('createdTime');
    });
  });

  // ============================================
  // Story 9.2 AC3: Table output format
  // ============================================

  describe('Story 9.2: getPlayback - AC3 Table output', () => {
    it('should display single playback details in table format', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackGetOptions = {
        channelId: '2191532',
        videoId: '1b96d90bf5',
        output: 'table',
      };

      await handler.getPlayback(options);

      // Check for table headers in output
      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('视频ID');
      expect(logCalls).toContain('标题');
      expect(logCalls).toContain('时长');
      expect(logCalls).toContain('创建时间');
      expect(logCalls).toContain('状态');
    });

    it('should display playback details with channel context', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackGetOptions = {
        channelId: '2191532',
        videoId: '1b96d90bf5',
      };

      await handler.getPlayback(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('2191532');
    });
  });

  // ============================================
  // Story 9.2 AC4: JSON output format
  // ============================================

  describe('Story 9.2: getPlayback - AC4 JSON output', () => {
    it('should output full JSON when output is json', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackGetOptions = {
        channelId: '2191532',
        videoId: '1b96d90bf5',
        output: 'json',
      };

      await handler.getPlayback(options);

      // Should have called console.log with JSON output
      const jsonCall = mockConsoleLog.mock.calls.find(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('"videoId"'))
      );
      expect(jsonCall).toBeDefined();
    });

    it('should include all fields in JSON output', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackGetOptions = {
        channelId: '2191532',
        videoId: '1b96d90bf5',
        output: 'json',
      };

      await handler.getPlayback(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      // Check for complete field presence
      expect(logCalls).toContain('videoPoolId');
      expect(logCalls).toContain('watchUrl');
      expect(logCalls).toContain('liveType');
    });
  });

  // ============================================
  // Story 9.2 AC5: Video not found error handling
  // ============================================

  describe('Story 9.2: getPlayback - AC5 Video not found', () => {
    it('should display friendly error when playback video not found', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackGetOptions = {
        channelId: '2191532',
        videoId: 'nonexistent-video-id',
      };

      await handler.getPlayback(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('未找到');
    });

    it('should handle empty playback list gracefully', async () => {
      const emptyResponse = {
        pageSize: 10,
        pageNumber: 1,
        totalItems: 0,
        totalPages: 0,
        contents: [],
      };
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(emptyResponse);

      const options: PlaybackGetOptions = {
        channelId: '2191532',
        videoId: 'some-video-id',
      };

      await handler.getPlayback(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('未找到');
    });
  });

  // ============================================
  // Story 9.2 AC6: listType parameter
  // ============================================

  describe('Story 9.2: getPlayback - AC6 listType parameter', () => {
    it('should pass listType "playback" to service', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackGetOptions = {
        channelId: '2191532',
        videoId: '1b96d90bf5',
        listType: 'playback',
      };

      await handler.getPlayback(options);

      expect(mockPlaybackService.getPlaybackList).toHaveBeenCalledWith({
        channelId: '2191532',
        listType: 'playback',
      });
    });

    it('should pass listType "vod" to service', async () => {
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackGetOptions = {
        channelId: '2191532',
        videoId: '1b96d90bf5',
        listType: 'vod',
      };

      await handler.getPlayback(options);

      expect(mockPlaybackService.getPlaybackList).toHaveBeenCalledWith({
        channelId: '2191532',
        listType: 'vod',
      });
    });
  });

  // ============================================
  // Story 9.2: Error Handling
  // ============================================

  describe('Story 9.2: getPlayback - Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const error = new Error('API Error');
      mockPlaybackService.getPlaybackList.mockRejectedValueOnce(error);

      const options: PlaybackGetOptions = {
        channelId: '2191532',
        videoId: '1b96d90bf5',
      };

      await expect(handler.getPlayback(options)).rejects.toThrow('API Error');
    });

    it('should validate required channelId', async () => {
      const options: PlaybackGetOptions = {
        channelId: '',
        videoId: '1b96d90bf5',
      };

      await expect(handler.getPlayback(options)).rejects.toThrow();
    });

    it('should validate required videoId', async () => {
      const options: PlaybackGetOptions = {
        channelId: '2191532',
        videoId: '',
      };

      await expect(handler.getPlayback(options)).rejects.toThrow();
    });
  });

  // ============================================
  // Story 9.3: deletePlayback
  // ============================================

  describe('Story 9.3: deletePlayback - AC1, AC2 Basic functionality', () => {
    it('should call service with channelId and videoId', async () => {
      mockPlaybackService.deletePlayback.mockResolvedValueOnce(true);
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '1b96d90bf5',
        force: true,
      };

      await handler.deletePlayback(options);

      expect(mockPlaybackService.deletePlayback).toHaveBeenCalledWith(
        '3151318',
        '1b96d90bf5',
        undefined
      );
    });

    it('should validate required channelId', async () => {
      const options: PlaybackDeleteOptions = {
        channelId: '',
        videoId: '1b96d90bf5',
        force: true,
      };

      await expect(handler.deletePlayback(options)).rejects.toThrow();
    });

    it('should validate required videoId', async () => {
      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '',
        force: true,
      };

      await expect(handler.deletePlayback(options)).rejects.toThrow();
    });
  });

  // ============================================
  // Story 9.3 AC3: Confirmation Flow
  // ============================================

  describe('Story 9.3: deletePlayback - AC3 Confirmation flow', () => {
    it('should prompt for confirmation before deletion when force is false', async () => {
      (confirmDeletion as jest.Mock).mockResolvedValueOnce(true);
      mockPlaybackService.deletePlayback.mockResolvedValueOnce(true);
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '1b96d90bf5',
        force: false,
      };

      await handler.deletePlayback(options);

      expect(confirmDeletion).toHaveBeenCalledWith(
        expect.stringContaining('1b96d90bf5'),
        'yes'
      );
    });

    it('should cancel operation when user declines confirmation', async () => {
      (confirmDeletion as jest.Mock).mockResolvedValueOnce(false);

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '1b96d90bf5',
        force: false,
      };

      await handler.deletePlayback(options);

      // Should NOT call deletePlayback when user declines
      expect(mockPlaybackService.deletePlayback).not.toHaveBeenCalled();
      // Should display cancellation message
      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('取消');
    });

    it('should proceed with deletion when user confirms', async () => {
      (confirmDeletion as jest.Mock).mockResolvedValueOnce(true);
      mockPlaybackService.deletePlayback.mockResolvedValueOnce(true);
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '1b96d90bf5',
        force: false,
      };

      await handler.deletePlayback(options);

      expect(mockPlaybackService.deletePlayback).toHaveBeenCalledWith(
        '3151318',
        '1b96d90bf5',
        undefined
      );
    });

    it('should throw error in non-TTY environment without force flag', async () => {
      (isInteractiveEnvironment as jest.Mock).mockReturnValueOnce(false);

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '1b96d90bf5',
        force: false,
      };

      await expect(handler.deletePlayback(options)).rejects.toThrow('non-TTY');
    });
  });

  // ============================================
  // Story 9.3 AC4: Success Message
  // ============================================

  describe('Story 9.3: deletePlayback - AC4 Success message', () => {
    it('should display success message after successful deletion', async () => {
      mockPlaybackService.deletePlayback.mockResolvedValueOnce(true);
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '1b96d90bf5',
        force: true,
      };

      await handler.deletePlayback(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('删除');
    });

    it('should include channelId and videoId in success message', async () => {
      mockPlaybackService.deletePlayback.mockResolvedValueOnce(true);
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '1b96d90bf5',
        force: true,
      };

      await handler.deletePlayback(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('3151318');
      expect(logCalls).toContain('1b96d90bf5');
    });
  });

  // ============================================
  // Story 9.3 AC5: listType parameter
  // ============================================

  describe('Story 9.3: deletePlayback - AC5 listType parameter', () => {
    it('should pass listType "playback" to service', async () => {
      mockPlaybackService.deletePlayback.mockResolvedValueOnce(true);
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '1b96d90bf5',
        listType: 'playback',
        force: true,
      };

      await handler.deletePlayback(options);

      expect(mockPlaybackService.deletePlayback).toHaveBeenCalledWith(
        '3151318',
        '1b96d90bf5',
        'playback'
      );
    });

    it('should pass listType "vod" to service', async () => {
      mockPlaybackService.deletePlayback.mockResolvedValueOnce(true);
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '1b96d90bf5',
        listType: 'vod',
        force: true,
      };

      await handler.deletePlayback(options);

      expect(mockPlaybackService.deletePlayback).toHaveBeenCalledWith(
        '3151318',
        '1b96d90bf5',
        'vod'
      );
    });
  });

  // ============================================
  // Story 9.3 AC6: Force flag
  // ============================================

  describe('Story 9.3: deletePlayback - AC6 Force flag', () => {
    it('should skip confirmation when force flag is true', async () => {
      mockPlaybackService.deletePlayback.mockResolvedValueOnce(true);
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '1b96d90bf5',
        force: true,
      };

      await handler.deletePlayback(options);

      // Should NOT call confirmDeletion when force is true
      expect(confirmDeletion).not.toHaveBeenCalled();
      expect(mockPlaybackService.deletePlayback).toHaveBeenCalled();
    });

    it('should call deletePlayback immediately when force is true', async () => {
      mockPlaybackService.deletePlayback.mockResolvedValueOnce(true);
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '1b96d90bf5',
        force: true,
      };

      await handler.deletePlayback(options);

      expect(mockPlaybackService.deletePlayback).toHaveBeenCalledWith(
        '3151318',
        '1b96d90bf5',
        undefined
      );
    });
  });

  // ============================================
  // Story 9.3 AC7, AC8: Output format
  // ============================================

  describe('Story 9.3: deletePlayback - AC7, AC8 Output format', () => {
    it('should display deletion result in table format by default', async () => {
      mockPlaybackService.deletePlayback.mockResolvedValueOnce(true);
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '1b96d90bf5',
        force: true,
        output: 'table',
      };

      await handler.deletePlayback(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('频道');
      expect(logCalls).toContain('视频ID');
    });

    it('should display deletion result in JSON format when output is json', async () => {
      mockPlaybackService.deletePlayback.mockResolvedValueOnce(true);
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '1b96d90bf5',
        force: true,
        output: 'json',
      };

      await handler.deletePlayback(options);

      // Should have called console.log with JSON output
      const jsonCall = mockConsoleLog.mock.calls.find(call =>
        call.some(arg => typeof arg === 'string' && (arg.includes('"videoId"') || arg.includes('"channelId"')))
      );
      expect(jsonCall).toBeDefined();
    });

    it('should include video title in table output', async () => {
      mockPlaybackService.deletePlayback.mockResolvedValueOnce(true);
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '1b96d90bf5',
        force: true,
        output: 'table',
      };

      await handler.deletePlayback(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('标题');
    });

    it('should include status "已删除" in table output', async () => {
      mockPlaybackService.deletePlayback.mockResolvedValueOnce(true);
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '1b96d90bf5',
        force: true,
        output: 'table',
      };

      await handler.deletePlayback(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('已删除');
    });
  });

  // ============================================
  // Story 9.3: Error Handling
  // ============================================

  describe('Story 9.3: deletePlayback - Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const error = new Error('API Error');
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);
      mockPlaybackService.deletePlayback.mockRejectedValueOnce(error);

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '1b96d90bf5',
        force: true,
      };

      await expect(handler.deletePlayback(options)).rejects.toThrow('API Error');
    });

    it('should handle API error responses', async () => {
      const error = new Error('Video not found');
      mockPlaybackService.getPlaybackList.mockResolvedValueOnce(mockPlaybackResponse);
      mockPlaybackService.deletePlayback.mockRejectedValueOnce(error);

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: 'nonexistent',
        force: true,
      };

      await expect(handler.deletePlayback(options)).rejects.toThrow('Video not found');
    });

    it('should handle confirmation timeout gracefully', async () => {
      (confirmDeletion as jest.Mock).mockRejectedValueOnce(new Error('Confirmation timed out'));

      const options: PlaybackDeleteOptions = {
        channelId: '3151318',
        videoId: '1b96d90bf5',
        force: false,
      };

      await expect(handler.deletePlayback(options)).rejects.toThrow('timed out');
    });
  });

  // ============================================
  // Story 9.4: mergePlayback - Synchronous mode
  // ============================================

  describe('Story 9.4: mergePlayback - AC1, AC2 Basic functionality', () => {
    it('should call service with channelId and fileIds (AC1, AC2)', async () => {
      mockPlaybackService.mergePlayback.mockResolvedValueOnce({
        fileId: 'merged-file-id',
        url: 'http://example.com/merged.mp4',
      });

      const options: PlaybackMergeOptions = {
        channelId: '3151318',
        fileIds: 'file1,file2,file3',
      };

      await handler.mergePlayback(options);

      expect(mockPlaybackService.mergePlayback).toHaveBeenCalledWith(
        '3151318',
        ['file1', 'file2', 'file3'],
        undefined
      );
    });

    it('should display merge result in table format by default', async () => {
      mockPlaybackService.mergePlayback.mockResolvedValueOnce({
        fileId: 'merged-file-id',
        url: 'http://example.com/merged.mp4',
      });

      const options: PlaybackMergeOptions = {
        channelId: '3151318',
        fileIds: 'file1,file2,file3',
        output: 'table',
      };

      await handler.mergePlayback(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('合并');
      expect(logCalls).toContain('成功');
    });

    it('should display file URL in table output (AC3)', async () => {
      mockPlaybackService.mergePlayback.mockResolvedValueOnce({
        fileId: 'merged-file-id',
        url: 'http://example.com/merged.mp4',
      });

      const options: PlaybackMergeOptions = {
        channelId: '3151318',
        fileIds: 'file1,file2,file3',
        output: 'table',
      };

      await handler.mergePlayback(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('http://example.com/merged.mp4');
    });

    it('should pass fileName to service (AC4)', async () => {
      mockPlaybackService.mergePlayback.mockResolvedValueOnce({
        fileId: 'merged-file-id',
        url: 'http://example.com/merged.mp4',
      });

      const options: PlaybackMergeOptions = {
        channelId: '3151318',
        fileIds: 'file1,file2,file3',
        fileName: '合并回放',
      };

      await handler.mergePlayback(options);

      expect(mockPlaybackService.mergePlayback).toHaveBeenCalledWith(
        '3151318',
        ['file1', 'file2', 'file3'],
        '合并回放'
      );
    });
  });

  // ============================================
  // Story 9.4 AC5: Async mode
  // ============================================

  describe('Story 9.4: mergePlayback - AC5 Async mode', () => {
    it('should call mergePlaybackAsync when async flag is true', async () => {
      mockPlaybackService.mergePlaybackAsync.mockResolvedValueOnce(true);

      const options: PlaybackMergeOptions = {
        channelId: '3151318',
        fileIds: 'file1,file2,file3',
        async: true,
      };

      await handler.mergePlayback(options);

      expect(mockPlaybackService.mergePlaybackAsync).toHaveBeenCalledWith(
        '3151318',
        ['file1', 'file2', 'file3'],
        {}
      );
    });

    it('should display async merge result with "processing" status', async () => {
      mockPlaybackService.mergePlaybackAsync.mockResolvedValueOnce(true);

      const options: PlaybackMergeOptions = {
        channelId: '3151318',
        fileIds: 'file1,file2,file3',
        async: true,
      };

      await handler.mergePlayback(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('处理中');
      expect(logCalls).toContain('已提交');
      expect(logCalls).toContain('异步合并不立即返回文件ID');
    });

    it('should pass async options to service (AC6, AC7, AC8)', async () => {
      mockPlaybackService.mergePlaybackAsync.mockResolvedValueOnce(true);

      const options: PlaybackMergeOptions = {
        channelId: '3151318',
        fileIds: 'file1,file2,file3',
        async: true,
        callbackUrl: 'http://example.com/callback',
        autoConvert: true,
        mergeMp4: true,
        fileName: '合并回放',
      };

      await handler.mergePlayback(options);

      expect(mockPlaybackService.mergePlaybackAsync).toHaveBeenCalledWith(
        '3151318',
        ['file1', 'file2', 'file3'],
        expect.objectContaining({
          callbackUrl: 'http://example.com/callback',
          autoConvert: true,
          mergeMp4: true,
          fileName: '合并回放',
        })
      );
    });

    it('should not call synchronous merge when async is true', async () => {
      mockPlaybackService.mergePlaybackAsync.mockResolvedValueOnce(true);

      const options: PlaybackMergeOptions = {
        channelId: '3151318',
        fileIds: 'file1,file2,file3',
        async: true,
      };

      await handler.mergePlayback(options);

      // Should NOT call synchronous merge
      expect(mockPlaybackService.mergePlayback).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Story 9.4: JSON output (AC9)
  // ============================================

  describe('Story 9.4: mergePlayback - JSON output (AC9)', () => {
    it('should output JSON when output is json (sync mode)', async () => {
      mockPlaybackService.mergePlayback.mockResolvedValueOnce({
        fileId: 'merged-file-id',
        url: 'http://example.com/merged.mp4',
      });

      const options: PlaybackMergeOptions = {
        channelId: '3151318',
        fileIds: 'file1,file2,file3',
        output: 'json',
      };

      await handler.mergePlayback(options);

      const jsonCall = mockConsoleLog.mock.calls.find(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('"fileId"'))
      );
      expect(jsonCall).toBeDefined();
    });

    it('should output JSON when output is json (async mode)', async () => {
      mockPlaybackService.mergePlaybackAsync.mockResolvedValueOnce(true);

      const options: PlaybackMergeOptions = {
        channelId: '3151318',
        fileIds: 'file1,file2,file3',
        async: true,
        output: 'json',
      };

      await handler.mergePlayback(options);

      const jsonCall = mockConsoleLog.mock.calls.find(call =>
        call.some(arg => typeof arg === 'string' && (arg.includes('"channelId"') || arg.includes('"status"')))
      );
      expect(jsonCall).toBeDefined();
    });
  });

  // ============================================
  // Story 9.4: Error Handling
  // ============================================

  describe('Story 9.4: mergePlayback - Error Handling', () => {
    it('should handle service errors gracefully (sync mode)', async () => {
      const error = new Error('Merge API Error');
      mockPlaybackService.mergePlayback.mockRejectedValueOnce(error);

      const options: PlaybackMergeOptions = {
        channelId: '3151318',
        fileIds: 'file1,file2,file3',
      };

      await expect(handler.mergePlayback(options)).rejects.toThrow('Merge API Error');
    });

    it('should handle service errors gracefully (async mode)', async () => {
      const error = new Error('Async merge API error');
      mockPlaybackService.mergePlaybackAsync.mockRejectedValueOnce(error);

      const options: PlaybackMergeOptions = {
        channelId: '3151318',
        fileIds: 'file1,file2,file3',
        async: true,
      };

      await expect(handler.mergePlayback(options)).rejects.toThrow('Async merge API error');
    });

    it('should validate required channelId', async () => {
      const options: PlaybackMergeOptions = {
        channelId: '',
        fileIds: 'file1,file2',
      };

      await expect(handler.mergePlayback(options)).rejects.toThrow();
    });

    it('should validate required fileIds', async () => {
      const options: PlaybackMergeOptions = {
        channelId: '3151318',
        fileIds: '',
      };

      await expect(handler.mergePlayback(options)).rejects.toThrow();
    });

    it('should validate empty fileIds after trimming', async () => {
      const options: PlaybackMergeOptions = {
        channelId: '3151318',
        fileIds: '   , ,  ',
      };

      await expect(handler.mergePlayback(options)).rejects.toThrow();
    });

    it('should reject more than 15 files (API limit)', async () => {
      // Create 16 file IDs
      const fileIds = Array.from({ length: 16 }, (_, i) => `file${i + 1}`).join(',');

      const options: PlaybackMergeOptions = {
        channelId: '3151318',
        fileIds,
      };

      await expect(handler.mergePlayback(options)).rejects.toThrow('Maximum 15 files can be merged at once');
    });

    it('should accept exactly 15 files', async () => {
      mockPlaybackService.mergePlayback.mockResolvedValueOnce({
        fileId: 'merged-file-id',
        url: 'http://example.com/merged.mp4',
      });

      // Create exactly 15 file IDs
      const fileIds = Array.from({ length: 15 }, (_, i) => `file${i + 1}`).join(',');

      const options: PlaybackMergeOptions = {
        channelId: '3151318',
        fileIds,
      };

      await handler.mergePlayback(options);

      expect(mockPlaybackService.mergePlayback).toHaveBeenCalledWith(
        '3151318',
        expect.arrayContaining([expect.any(String)]),
        undefined
      );
    });
  });
});
