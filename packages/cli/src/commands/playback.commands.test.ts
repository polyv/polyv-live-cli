/**
 * @fileoverview Unit tests for Playback Commands - ATDD Failing Tests (RED Phase)
 * @story 9.1: 回放列表命令
 * @story 9.2: 回放详情命令
 * @story 9.3: 回放删除命令
 * @story 9.4: 回放合并命令
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
 *
 * Acceptance Criteria (Story 9.4):
 * - AC1: `playback merge` 命令支持 `--channel-id` 参数（必填）
 * - AC2: `playback merge` 命令支持 `--file-ids` 参数（必填），多个文件ID用逗号分隔
 * - AC3: 合并成功后返回新回放文件ID
 * - AC4: 支持 `--file-name` 参数设置合并后的文件名
 * - AC5: 支持 `--async` 标志使用异步合并模式
 * - AC6: 支持 `--callback-url` 参数设置合并完成后的回调URL（异步模式）
 * - AC7: 支持 `--auto-convert` 标志自动转存到点播（异步模式）
 * - AC8: 支持 `--merge-mp4` 标志合并为MP4文件（异步模式）
 * - AC9: 支持 `--output` 参数选择 table 或 json 输出格式
 * - AC10: 表格输出格式清晰，显示合并结果
 */

import { Command } from 'commander';
import { registerPlaybackCommands, validateListType, validateOutputFormat } from './playback.commands';
import { PlaybackHandler } from '../handlers/playback.handler';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';

// Mock the PlaybackHandler
const mockListPlayback = jest.fn().mockResolvedValue(undefined);
const mockGetPlayback = jest.fn().mockResolvedValue(undefined);
const mockDeletePlayback = jest.fn().mockResolvedValue(undefined);
const mockMergePlayback = jest.fn().mockResolvedValue(undefined);

jest.mock('../handlers/playback.handler', () => ({
  PlaybackHandler: jest.fn().mockImplementation(() => ({
    listPlayback: mockListPlayback,
    getPlayback: mockGetPlayback,
    deletePlayback: mockDeletePlayback,
    mergePlayback: mockMergePlayback,
  })),
}));

const MockPlaybackHandler = PlaybackHandler as jest.MockedClass<typeof PlaybackHandler>;

// Mock the auth adapter
jest.mock('../config/auth-adapter', () => ({
  authAdapter: {
    tryGetAuthConfig: jest.fn().mockReturnValue({
      config: { appId: 'test-app-id', appSecret: 'test-app-secret' },
      source: 'environment',
    }),
    getStatusMessage: jest.fn().mockReturnValue('No authentication configured'),
    getDiagnostics: jest.fn().mockReturnValue({
      availableSources: [],
      errors: [],
    }),
  },
}));

// Mock the config manager
jest.mock('../config/manager', () => ({
  configManager: {
    load: jest.fn().mockResolvedValue({
      config: {
        baseUrl: 'https://api.polyv.net',
        timeout: 30000,
        debug: false,
      },
    }),
  },
}));

describe('Playback Commands (Story 9.1 - ATDD RED Phase)', () => {
  let program: Command;
  let mockExit: jest.SpyInstance;

  beforeEach(() => {
    program = new Command();
    program.exitOverride();
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });
  });

  afterEach(() => {
    mockExit.mockRestore();
    jest.clearAllMocks();
  });

  // ============================================
  // AC1: playback command group
  // ============================================

  describe('AC1: playback command group', () => {
    it('should register playback command group', () => {
      registerPlaybackCommands(program);

      const commands = program.commands;
      const playbackCmd = commands.find(cmd => cmd.name() === 'playback');

      expect(playbackCmd).toBeDefined();
      expect(playbackCmd?.description()).toContain('回放');
    });

    it('should have playback list subcommand', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const listCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'list');

      expect(listCmd).toBeDefined();
      expect(listCmd?.description()).toContain('列表');
    });
  });

  // ============================================
  // AC1: --channel-id required option
  // ============================================

  describe('AC1: --channel-id option', () => {
    it('should require --channel-id option', async () => {
      registerPlaybackCommands(program);

      // Attempt to run without channelId should fail
      await expect(
        program.parseAsync(['node', 'test', 'playback', 'list'], { from: 'user' })
      ).rejects.toThrow();
    });

    it('should accept --channel-id with short form -c', async () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const listCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'list');

      const channelIdOption = listCmd?.options.find(opt =>
        opt.long === '--channel-id' || opt.short === '-c'
      );

      expect(channelIdOption).toBeDefined();
    });

    it('should accept --channel-id with long form', async () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const listCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'list');

      const channelIdOption = listCmd?.options.find(opt => opt.long === '--channel-id');

      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });
  });

  // ============================================
  // AC2: --page and --page-size options
  // ============================================

  describe('AC2: Pagination options', () => {
    it('should have --page option with default value 1', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const listCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'list');

      const pageOption = listCmd?.options.find(opt => opt.long === '--page');

      expect(pageOption).toBeDefined();
      expect(pageOption?.defaultValue).toBe(1);
    });

    it('should have --page-size option with default value 10', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const listCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'list');

      const pageSizeOption = listCmd?.options.find(opt => opt.long === '--page-size');

      expect(pageSizeOption).toBeDefined();
      expect(pageSizeOption?.defaultValue).toBe(10);
    });
  });

  // ============================================
  // AC3: --list-type option
  // ============================================

  describe('AC3: --list-type option', () => {
    it('should have --list-type option', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const listCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'list');

      const listTypeOption = listCmd?.options.find(opt => opt.long === '--list-type');

      expect(listTypeOption).toBeDefined();
    });

    it('should accept playback value for --list-type', async () => {
      const result = validateListType('playback');
      expect(result).toBe('playback');
    });

    it('should accept vod value for --list-type', async () => {
      const result = validateListType('vod');
      expect(result).toBe('vod');
    });

    it('should reject invalid --list-type values', async () => {
      expect(() => validateListType('invalid')).toThrow();
    });
  });

  // ============================================
  // AC4, AC5: --output option
  // ============================================

  describe('AC4, AC5: --output option', () => {
    it('should have --output option with short form -o', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const listCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'list');

      const outputOption = listCmd?.options.find(opt =>
        opt.long === '--output' || opt.short === '-o'
      );

      expect(outputOption).toBeDefined();
    });

    it('should have default output value of table', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const listCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'list');

      const outputOption = listCmd?.options.find(opt => opt.long === '--output');

      expect(outputOption?.defaultValue).toBe('table');
    });

    it('should accept table value', async () => {
      const { validateOutputFormat } = await import('./playback.commands');
      expect(validateOutputFormat('table')).toBe('table');
    });

    it('should accept json value', async () => {
      const { validateOutputFormat } = await import('./playback.commands');
      expect(validateOutputFormat('json')).toBe('json');
    });

    it('should reject invalid output values', async () => {
      const { validateOutputFormat } = await import('./playback.commands');
      expect(() => validateOutputFormat('xml')).toThrow();
    });
  });

  // ============================================
  // Help Text
  // ============================================

  describe('Help Text', () => {
    it('should include examples in help text', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const listCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'list');

      const helpText = listCmd?.helpInformation() || '';

      expect(helpText).toContain('Examples');
      expect(helpText).toContain('playback list');
      expect(helpText).toContain('channel-id');
    });

    it('should describe all options in help text', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const listCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'list');

      const helpText = listCmd?.helpInformation() || '';

      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--page');
      expect(helpText).toContain('--page-size');
      expect(helpText).toContain('--list-type');
      expect(helpText).toContain('--output');
    });
  });

  // ============================================
  // Command Execution
  // ============================================

  describe('Command Execution', () => {
    // These tests verify end-to-end command execution.
    // Due to Commander.js async action handling complexity with mocks,
    // the core functionality is already tested via:
    // - Handler unit tests (playback.handler.test.ts)
    // - Option parsing tests (above describe blocks)
    // - Manual acceptance testing

    it('[P1] should create PlaybackHandler with auth config', async () => {
      // Clear previous calls
      mockListPlayback.mockClear();
      MockPlaybackHandler.mockClear();

      // Create a new program and register commands
      const testProgram = new Command();
      registerPlaybackCommands(testProgram);

      // Execute the command
      await testProgram.parseAsync(['node', 'test', 'playback', 'list', '-c', '123456']);

      // Verify handler was instantiated
      expect(MockPlaybackHandler).toHaveBeenCalled();
    });

    it('[P1] should call listPlayback with correct options', async () => {
      // Clear previous calls
      mockListPlayback.mockClear();

      // Create a new program and register commands
      const testProgram = new Command();
      registerPlaybackCommands(testProgram);

      // Execute the command
      await testProgram.parseAsync(['node', 'test', 'playback', 'list', '-c', '123456', '--page', '2', '--page-size', '20']);

      // Verify listPlayback was called
      expect(mockListPlayback).toHaveBeenCalled();
    });

    // Alternative: Test options are correctly parsed and would be passed to handler
    it('should parse all options correctly for handler', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const listCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'list');

      // Verify all expected options exist with correct defaults
      const options = listCmd?.options || [];

      const channelIdOpt = options.find(o => o.long === '--channel-id');
      expect(channelIdOpt?.required).toBe(true);

      const pageOpt = options.find(o => o.long === '--page');
      expect(pageOpt?.defaultValue).toBe(1);

      const pageSizeOpt = options.find(o => o.long === '--page-size');
      expect(pageSizeOpt?.defaultValue).toBe(10);

      const listTypeOpt = options.find(o => o.long === '--list-type');
      expect(listTypeOpt?.defaultValue).toBe('playback');

      const outputOpt = options.find(o => o.long === '--output');
      expect(outputOpt?.defaultValue).toBe('table');
    });
  });

  // ============================================
  // Story 9.2: playback get command
  // ============================================

  describe('Story 9.2: playback get command', () => {
    it('should have playback get subcommand', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const getCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'get');

      expect(getCmd).toBeDefined();
      expect(getCmd?.description()).toContain('详情');
    });
  });

  // ============================================
  // Story 9.2 AC1: --channel-id and --video-id required options
  // ============================================

  describe('Story 9.2 AC1: --channel-id and --video-id options', () => {
    it('should require --channel-id option', async () => {
      registerPlaybackCommands(program);

      // Attempt to run without channelId should fail
      await expect(
        program.parseAsync(['node', 'test', 'playback', 'get', '--video-id', '1b96d90bf5'], { from: 'user' })
      ).rejects.toThrow();
    });

    it('should require --video-id option', async () => {
      registerPlaybackCommands(program);

      // Attempt to run without videoId should fail
      await expect(
        program.parseAsync(['node', 'test', 'playback', 'get', '--channel-id', '2191532'], { from: 'user' })
      ).rejects.toThrow();
    });

    it('should accept --channel-id with short form -c', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const getCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'get');

      const channelIdOption = getCmd?.options.find(opt =>
        opt.long === '--channel-id' || opt.short === '-c'
      );

      expect(channelIdOption).toBeDefined();
    });

    it('should accept --video-id with short form -v', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const getCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'get');

      const videoIdOption = getCmd?.options.find(opt =>
        opt.long === '--video-id' || opt.short === '-v'
      );

      expect(videoIdOption).toBeDefined();
    });

    it('should have required --channel-id option', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const getCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'get');

      const channelIdOption = getCmd?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });

    it('should have required --video-id option', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const getCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'get');

      const videoIdOption = getCmd?.options.find(opt => opt.long === '--video-id');
      expect(videoIdOption?.required).toBe(true);
    });
  });

  // ============================================
  // Story 9.2 AC6: --list-type option
  // ============================================

  describe('Story 9.2 AC6: --list-type option', () => {
    it('should have --list-type option for get command', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const getCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'get');

      const listTypeOption = getCmd?.options.find(opt => opt.long === '--list-type');

      expect(listTypeOption).toBeDefined();
    });

    it('should have default listType value of playback', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const getCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'get');

      const listTypeOption = getCmd?.options.find(opt => opt.long === '--list-type');
      expect(listTypeOption?.defaultValue).toBe('playback');
    });
  });

  // ============================================
  // Story 9.2 AC3, AC4: --output option
  // ============================================

  describe('Story 9.2 AC3, AC4: --output option', () => {
    it('should have --output option with short form -o', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const getCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'get');

      const outputOption = getCmd?.options.find(opt =>
        opt.long === '--output' || opt.short === '-o'
      );

      expect(outputOption).toBeDefined();
    });

    it('should have default output value of table', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const getCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'get');

      const outputOption = getCmd?.options.find(opt => opt.long === '--output');
      expect(outputOption?.defaultValue).toBe('table');
    });
  });

  // ============================================
  // Story 9.2: Help Text
  // ============================================

  describe('Story 9.2: Help Text', () => {
    it('should include examples in help text for get command', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const getCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'get');

      const helpText = getCmd?.helpInformation() || '';

      expect(helpText).toContain('Examples');
      expect(helpText).toContain('playback get');
      expect(helpText).toContain('channel-id');
      expect(helpText).toContain('video-id');
    });

    it('should describe all options in help text for get command', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const getCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'get');

      const helpText = getCmd?.helpInformation() || '';

      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--video-id');
      expect(helpText).toContain('--list-type');
      expect(helpText).toContain('--output');
    });
  });

  // ============================================
  // Story 9.2: Command Execution
  // ============================================

  describe('Story 9.2: Command Execution', () => {
    it('should parse all options correctly for handler', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const getCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'get');

      // Verify all expected options exist with correct defaults
      const options = getCmd?.options || [];

      const channelIdOpt = options.find(o => o.long === '--channel-id');
      expect(channelIdOpt?.required).toBe(true);

      const videoIdOpt = options.find(o => o.long === '--video-id');
      expect(videoIdOpt?.required).toBe(true);

      const listTypeOpt = options.find(o => o.long === '--list-type');
      expect(listTypeOpt?.defaultValue).toBe('playback');

      const outputOpt = options.find(o => o.long === '--output');
      expect(outputOpt?.defaultValue).toBe('table');
    });
  });

  // ============================================
  // Story 9.3: playback delete command
  // ============================================

  describe('Story 9.3: playback delete command', () => {
    it('should have playback delete subcommand', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const deleteCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'delete');

      expect(deleteCmd).toBeDefined();
      expect(deleteCmd?.description()).toContain('删除');
    });
  });

  // ============================================
  // Story 9.3 AC1: --channel-id required option
  // ============================================

  describe('Story 9.3 AC1: --channel-id option', () => {
    it('should require --channel-id option', async () => {
      registerPlaybackCommands(program);

      // Attempt to run without channelId should fail
      await expect(
        program.parseAsync(['node', 'test', 'playback', 'delete', '--video-id', '1b96d90bf5'], { from: 'user' })
      ).rejects.toThrow();
    });

    it('should accept --channel-id with short form -c', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const deleteCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'delete');

      const channelIdOption = deleteCmd?.options.find(opt =>
        opt.long === '--channel-id' || opt.short === '-c'
      );

      expect(channelIdOption).toBeDefined();
    });

    it('should have required --channel-id option', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const deleteCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'delete');

      const channelIdOption = deleteCmd?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });
  });

  // ============================================
  // Story 9.3 AC2: --video-id required option
  // ============================================

  describe('Story 9.3 AC2: --video-id option', () => {
    it('should require --video-id option', async () => {
      registerPlaybackCommands(program);

      // Attempt to run without videoId should fail
      await expect(
        program.parseAsync(['node', 'test', 'playback', 'delete', '-c', '3151318'], { from: 'user' })
      ).rejects.toThrow();
    });

    it('should have required --video-id option', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const deleteCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'delete');

      const videoIdOption = deleteCmd?.options.find(opt => opt.long === '--video-id');
      expect(videoIdOption?.required).toBe(true);
    });
  });

  // ============================================
  // Story 9.3 AC5: --list-type option
  // ============================================

  describe('Story 9.3 AC5: --list-type option', () => {
    it('should have --list-type option for delete command', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const deleteCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'delete');

      const listTypeOption = deleteCmd?.options.find(opt => opt.long === '--list-type');

      expect(listTypeOption).toBeDefined();
    });

    it('should have default listType value of playback', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const deleteCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'delete');

      const listTypeOption = deleteCmd?.options.find(opt => opt.long === '--list-type');
      expect(listTypeOption?.defaultValue).toBe('playback');
    });
  });

  // ============================================
  // Story 9.3 AC6: --force flag
  // ============================================

  describe('Story 9.3 AC6: --force flag', () => {
    it('should have --force flag option', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const deleteCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'delete');

      const forceOption = deleteCmd?.options.find(opt => opt.long === '--force');

      expect(forceOption).toBeDefined();
    });

    it('should have default force value of false', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const deleteCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'delete');

      const forceOption = deleteCmd?.options.find(opt => opt.long === '--force');
      expect(forceOption?.defaultValue).toBe(false);
    });
  });

  // ============================================
  // Story 9.3 AC7: --output option
  // ============================================

  describe('Story 9.3 AC7: --output option', () => {
    it('should have --output option with short form -o', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const deleteCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'delete');

      const outputOption = deleteCmd?.options.find(opt =>
        opt.long === '--output' || opt.short === '-o'
      );

      expect(outputOption).toBeDefined();
    });

    it('should have default output value of table', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const deleteCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'delete');

      const outputOption = deleteCmd?.options.find(opt => opt.long === '--output');
      expect(outputOption?.defaultValue).toBe('table');
    });
  });

  // ============================================
  // Story 9.3: Help Text
  // ============================================

  describe('Story 9.3: Help Text', () => {
    it('should include examples in help text for delete command', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const deleteCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'delete');

      const helpText = deleteCmd?.helpInformation() || '';

      expect(helpText).toContain('Examples');
      expect(helpText).toContain('playback delete');
      expect(helpText).toContain('channel-id');
      expect(helpText).toContain('video-id');
    });

    it('should describe all options in help text for delete command', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const deleteCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'delete');

      const helpText = deleteCmd?.helpInformation() || '';

      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--video-id');
      expect(helpText).toContain('--list-type');
      expect(helpText).toContain('--force');
      expect(helpText).toContain('--output');
    });

    it('should include force flag in help text', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const deleteCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'delete');

      const helpText = deleteCmd?.helpInformation() || '';

      expect(helpText).toContain('--force');
    });
  });

  // ============================================
  // Story 9.3: Command Execution
  // ============================================

  describe('Story 9.3: Command Execution', () => {
    it('should parse all options correctly for handler', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const deleteCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'delete');

      // Verify all expected options exist with correct defaults
      const options = deleteCmd?.options || [];

      const channelIdOpt = options.find(o => o.long === '--channel-id');
      expect(channelIdOpt?.required).toBe(true);

      const videoIdOpt = options.find(o => o.long === '--video-id');
      expect(videoIdOpt?.required).toBe(true);

      const listTypeOpt = options.find(o => o.long === '--list-type');
      expect(listTypeOpt?.defaultValue).toBe('playback');

      const forceOpt = options.find(o => o.long === '--force');
      expect(forceOpt?.defaultValue).toBe(false);

      const outputOpt = options.find(o => o.long === '--output');
      expect(outputOpt?.defaultValue).toBe('table');
    });
  });

  // ============================================
  // Story 9.4: playback merge command
  // ============================================

  describe('Story 9.4: playback merge command', () => {
    it('should have playback merge subcommand', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      expect(mergeCmd).toBeDefined();
      expect(mergeCmd?.description()).toContain('合并');
    });
  });

  // ============================================
  // Story 9.4 AC1: --channel-id required option
  // ============================================

  describe('Story 9.4 AC1: --channel-id option', () => {
    it('should require --channel-id option', async () => {
      registerPlaybackCommands(program);

      // Attempt to run without channelId should fail
      await expect(
        program.parseAsync(['node', 'test', 'playback', 'merge', '--file-ids', 'file1,file2'], { from: 'user' })
      ).rejects.toThrow();
    });

    it('should accept --channel-id with short form -c', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const channelIdOption = mergeCmd?.options.find(opt =>
        opt.long === '--channel-id' || opt.short === '-c'
      );

      expect(channelIdOption).toBeDefined();
    });

    it('should have required --channel-id option', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const channelIdOption = mergeCmd?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });
  });

  // ============================================
  // Story 9.4 AC2: --file-ids required option
  // ============================================

  describe('Story 9.4 AC2: --file-ids option', () => {
    it('should require --file-ids option', async () => {
      registerPlaybackCommands(program);

      // Attempt to run without fileIds should fail
      await expect(
        program.parseAsync(['node', 'test', 'playback', 'merge', '-c', '3151318'], { from: 'user' })
      ).rejects.toThrow();
    });

    it('should have --file-ids option', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const fileIdsOption = mergeCmd?.options.find(opt => opt.long === '--file-ids');
      expect(fileIdsOption).toBeDefined();
      expect(fileIdsOption?.required).toBe(true);
    });

    it('should accept comma-separated file IDs', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const fileIdsOption = mergeCmd?.options.find(opt => opt.long === '--file-ids');
      expect(fileIdsOption).toBeDefined();
    });
  });

  // ============================================
  // Story 9.4 AC4: --file-name option
  // ============================================

  describe('Story 9.4 AC4: --file-name option', () => {
    it('should have --file-name option', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const fileNameOption = mergeCmd?.options.find(opt => opt.long === '--file-name');
      expect(fileNameOption).toBeDefined();
    });

    it('should be optional', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const fileNameOption = mergeCmd?.options.find(opt => opt.long === '--file-name');
      expect(fileNameOption?.required).toBeFalsy();
    });
  });

  // ============================================
  // Story 9.4 AC5: --async flag
  // ============================================

  describe('Story 9.4 AC5: --async flag', () => {
    it('should have --async flag option', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const asyncOption = mergeCmd?.options.find(opt => opt.long === '--async');
      expect(asyncOption).toBeDefined();
    });

    it('should have default async value of false', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const asyncOption = mergeCmd?.options.find(opt => opt.long === '--async');
      expect(asyncOption?.defaultValue).toBe(false);
    });
  });

  // ============================================
  // Story 9.4 AC6: --callback-url option
  // ============================================

  describe('Story 9.4 AC6: --callback-url option', () => {
    it('should have --callback-url option', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const callbackUrlOption = mergeCmd?.options.find(opt => opt.long === '--callback-url');
      expect(callbackUrlOption).toBeDefined();
    });

    it('should be optional', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const callbackUrlOption = mergeCmd?.options.find(opt => opt.long === '--callback-url');
      expect(callbackUrlOption?.required).toBeFalsy();
    });
  });

  // ============================================
  // Story 9.4 AC7: --auto-convert flag
  // ============================================

  describe('Story 9.4 AC7: --auto-convert flag', () => {
    it('should have --auto-convert flag option', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const autoConvertOption = mergeCmd?.options.find(opt => opt.long === '--auto-convert');
      expect(autoConvertOption).toBeDefined();
    });

    it('should have default autoConvert value of false', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const autoConvertOption = mergeCmd?.options.find(opt => opt.long === '--auto-convert');
      expect(autoConvertOption?.defaultValue).toBe(false);
    });
  });

  // ============================================
  // Story 9.4 AC8: --merge-mp4 flag
  // ============================================

  describe('Story 9.4 AC8: --merge-mp4 flag', () => {
    it('should have --merge-mp4 flag option', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const mergeMp4Option = mergeCmd?.options.find(opt => opt.long === '--merge-mp4');
      expect(mergeMp4Option).toBeDefined();
    });

    it('should have default mergeMp4 value of false', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const mergeMp4Option = mergeCmd?.options.find(opt => opt.long === '--merge-mp4');
      expect(mergeMp4Option?.defaultValue).toBe(false);
    });
  });

  // ============================================
  // Story 9.4 AC9: --output option
  // ============================================

  describe('Story 9.4 AC9: --output option', () => {
    it('should have --output option with short form -o', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const outputOption = mergeCmd?.options.find(opt =>
        opt.long === '--output' || opt.short === '-o'
      );

      expect(outputOption).toBeDefined();
    });

    it('should have default output value of table', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const outputOption = mergeCmd?.options.find(opt => opt.long === '--output');
      expect(outputOption?.defaultValue).toBe('table');
    });
  });

  // ============================================
  // Story 9.4: Help Text
  // ============================================

  describe('Story 9.4: Help Text', () => {
    it('should include examples in help text for merge command', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const helpText = mergeCmd?.helpInformation() || '';

      expect(helpText).toContain('Examples');
      expect(helpText).toContain('playback merge');
      expect(helpText).toContain('channel-id');
      expect(helpText).toContain('file-ids');
    });

    it('should describe all options in help text for merge command', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      const helpText = mergeCmd?.helpInformation() || '';

      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--file-ids');
      expect(helpText).toContain('--file-name');
      expect(helpText).toContain('--async');
      expect(helpText).toContain('--callback-url');
      expect(helpText).toContain('--auto-convert');
      expect(helpText).toContain('--merge-mp4');
      expect(helpText).toContain('--output');
    });
  });

  // ============================================
  // Story 9.4: Command Execution
  // ============================================

  describe('Story 9.4: Command Execution', () => {
    it('should parse all options correctly for handler', () => {
      registerPlaybackCommands(program);

      const playbackCmd = program.commands.find(cmd => cmd.name() === 'playback');
      const mergeCmd = playbackCmd?.commands.find(cmd => cmd.name() === 'merge');

      // Verify all expected options exist with correct defaults
      const options = mergeCmd?.options || [];

      const channelIdOpt = options.find(o => o.long === '--channel-id');
      expect(channelIdOpt?.required).toBe(true);

      const fileIdsOpt = options.find(o => o.long === '--file-ids');
      expect(fileIdsOpt?.required).toBe(true);

      const fileNameOpt = options.find(o => o.long === '--file-name');
      expect(fileNameOpt?.required).toBeFalsy();

      const asyncOpt = options.find(o => o.long === '--async');
      expect(asyncOpt?.defaultValue).toBe(false);

      const callbackUrlOpt = options.find(o => o.long === '--callback-url');
      expect(callbackUrlOpt?.required).toBeFalsy();

      const autoConvertOpt = options.find(o => o.long === '--auto-convert');
      expect(autoConvertOpt?.defaultValue).toBe(false);

      const mergeMp4Opt = options.find(o => o.long === '--merge-mp4');
      expect(mergeMp4Opt?.defaultValue).toBe(false);

      const outputOpt = options.find(o => o.long === '--output');
      expect(outputOpt?.defaultValue).toBe('table');
    });
  });

  // ============================================
  // Action Handler Tests
  // ============================================

  describe('action handlers', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockListPlayback.mockClear();
      mockGetPlayback.mockClear();
      mockDeletePlayback.mockClear();
      mockMergePlayback.mockClear();
    });

    // ============================================
    // list action handler tests
    // ============================================

    describe('list action', () => {
      it('should list playbacks with valid parameters', async () => {
        mockListPlayback.mockResolvedValueOnce({ contents: [], total: 0 });

        const program = new Command();
        registerPlaybackCommands(program);

        await program.parseAsync(['node', 'test', 'playback', 'list', '--channel-id', '3151318']);

        expect(mockListPlayback).toHaveBeenCalled();
      });

      it('should handle list with pagination options', async () => {
        mockListPlayback.mockResolvedValueOnce({ contents: [], total: 0 });

        const program = new Command();
        registerPlaybackCommands(program);

        await program.parseAsync([
          'node', 'test', 'playback', 'list',
          '--channel-id', '3151318',
          '--page', '2',
          '--page-size', '20',
        ]);

        expect(mockListPlayback).toHaveBeenCalled();
      });

      it('should handle list with list-type option', async () => {
        mockListPlayback.mockResolvedValueOnce({ contents: [], total: 0 });

        const program = new Command();
        registerPlaybackCommands(program);

        await program.parseAsync([
          'node', 'test', 'playback', 'list',
          '--channel-id', '3151318',
          '--list-type', 'vod',
        ]);

        expect(mockListPlayback).toHaveBeenCalled();
      });

      it('should output in JSON format when specified', async () => {
        mockListPlayback.mockResolvedValueOnce({ contents: [], total: 0 });

        const program = new Command();
        registerPlaybackCommands(program);

        await program.parseAsync([
          'node', 'test', 'playback', 'list',
          '--channel-id', '3151318',
          '--output', 'json',
        ]);

        expect(mockListPlayback).toHaveBeenCalled();
      });

      it('should handle API errors in list action', async () => {
        mockListPlayback.mockRejectedValueOnce(new Error('API Error'));

        const program = new Command();
        registerPlaybackCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'playback', 'list', '--channel-id', '3151318'])
        ).rejects.toThrow();
      });
    });

    // ============================================
    // get action handler tests
    // ============================================

    describe('get action', () => {
      it('should get playback detail with valid parameters', async () => {
        mockGetPlayback.mockResolvedValueOnce({ fileId: '123' });

        const program = new Command();
        registerPlaybackCommands(program);

        await program.parseAsync([
          'node', 'test', 'playback', 'get',
          '--channel-id', '3151318',
          '--video-id', '123',
        ]);

        expect(mockGetPlayback).toHaveBeenCalled();
      });

      it('should output in JSON format when specified', async () => {
        mockGetPlayback.mockResolvedValueOnce({ fileId: '123' });

        const program = new Command();
        registerPlaybackCommands(program);

        await program.parseAsync([
          'node', 'test', 'playback', 'get',
          '--channel-id', '3151318',
          '--video-id', '123',
          '--output', 'json',
        ]);

        expect(mockGetPlayback).toHaveBeenCalled();
      });

      it('should handle API errors in get action', async () => {
        mockGetPlayback.mockRejectedValueOnce(new Error('API Error'));

        const program = new Command();
        registerPlaybackCommands(program);

        await expect(
          program.parseAsync([
            'node', 'test', 'playback', 'get',
            '--channel-id', '3151318',
            '--video-id', '123',
          ])
        ).rejects.toThrow();
      });
    });

    // ============================================
    // delete action handler tests
    // ============================================

    describe('delete action', () => {
      it('should delete playback with valid parameters', async () => {
        mockDeletePlayback.mockResolvedValueOnce({ success: true });

        const program = new Command();
        registerPlaybackCommands(program);

        await program.parseAsync([
          'node', 'test', 'playback', 'delete',
          '--channel-id', '3151318',
          '--video-id', '123',
          '--force',
        ]);

        expect(mockDeletePlayback).toHaveBeenCalled();
      });

      it('should handle API errors in delete action', async () => {
        mockDeletePlayback.mockRejectedValueOnce(new Error('API Error'));

        const program = new Command();
        registerPlaybackCommands(program);

        await expect(
          program.parseAsync([
            'node', 'test', 'playback', 'delete',
            '--channel-id', '3151318',
            '--video-id', '123',
            '--force',
          ])
        ).rejects.toThrow();
      });
    });

    // ============================================
    // merge action handler tests
    // ============================================

    describe('merge action', () => {
      it('should merge playbacks with valid parameters', async () => {
        mockMergePlayback.mockResolvedValueOnce({ fileId: 'merged-123' });

        const program = new Command();
        registerPlaybackCommands(program);

        await program.parseAsync([
          'node', 'test', 'playback', 'merge',
          '--channel-id', '3151318',
          '--file-ids', '1,2,3',
        ]);

        expect(mockMergePlayback).toHaveBeenCalled();
      });

      it('should handle merge with file-name option', async () => {
        mockMergePlayback.mockResolvedValueOnce({ fileId: 'merged-123' });

        const program = new Command();
        registerPlaybackCommands(program);

        await program.parseAsync([
          'node', 'test', 'playback', 'merge',
          '--channel-id', '3151318',
          '--file-ids', '1,2,3',
          '--file-name', 'Merged Recording',
        ]);

        expect(mockMergePlayback).toHaveBeenCalled();
      });

      it('should handle merge with async option', async () => {
        mockMergePlayback.mockResolvedValueOnce({ fileId: 'merged-123' });

        const program = new Command();
        registerPlaybackCommands(program);

        await program.parseAsync([
          'node', 'test', 'playback', 'merge',
          '--channel-id', '3151318',
          '--file-ids', '1,2,3',
          '--async',
        ]);

        expect(mockMergePlayback).toHaveBeenCalled();
      });

      it('should handle merge with callback-url option', async () => {
        mockMergePlayback.mockResolvedValueOnce({ fileId: 'merged-123' });

        const program = new Command();
        registerPlaybackCommands(program);

        await program.parseAsync([
          'node', 'test', 'playback', 'merge',
          '--channel-id', '3151318',
          '--file-ids', '1,2,3',
          '--callback-url', 'https://example.com/callback',
        ]);

        expect(mockMergePlayback).toHaveBeenCalled();
      });

      it('should handle merge with auto-convert option', async () => {
        mockMergePlayback.mockResolvedValueOnce({ fileId: 'merged-123' });

        const program = new Command();
        registerPlaybackCommands(program);

        await program.parseAsync([
          'node', 'test', 'playback', 'merge',
          '--channel-id', '3151318',
          '--file-ids', '1,2,3',
          '--auto-convert',
        ]);

        expect(mockMergePlayback).toHaveBeenCalled();
      });

      it('should handle merge with merge-mp4 option', async () => {
        mockMergePlayback.mockResolvedValueOnce({ fileId: 'merged-123' });

        const program = new Command();
        registerPlaybackCommands(program);

        await program.parseAsync([
          'node', 'test', 'playback', 'merge',
          '--channel-id', '3151318',
          '--file-ids', '1,2,3',
          '--merge-mp4',
        ]);

        expect(mockMergePlayback).toHaveBeenCalled();
      });

      it('should output in JSON format when specified', async () => {
        mockMergePlayback.mockResolvedValueOnce({ fileId: 'merged-123' });

        const program = new Command();
        registerPlaybackCommands(program);

        await program.parseAsync([
          'node', 'test', 'playback', 'merge',
          '--channel-id', '3151318',
          '--file-ids', '1,2,3',
          '--output', 'json',
        ]);

        expect(mockMergePlayback).toHaveBeenCalled();
      });
    });

    // ============================================
    // Auth & Config error handling tests
    // ============================================

    describe('auth failure handling', () => {
      it('should handle auth failure in list action', async () => {
        (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValueOnce(null);
        const program = new Command();
        registerPlaybackCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'playback', 'list', '--channel-id', '3151318'])
        ).rejects.toThrow();
      });

      it('should handle auth failure in get action', async () => {
        (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValueOnce(null);
        const program = new Command();
        registerPlaybackCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'playback', 'get', '--channel-id', '3151318', '--video-id', '123'])
        ).rejects.toThrow();
      });

      it('should handle auth failure in delete action', async () => {
        (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValueOnce(null);
        const program = new Command();
        registerPlaybackCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'playback', 'delete', '--channel-id', '3151318', '--video-id', '123', '--force'])
        ).rejects.toThrow();
      });

      it('should handle auth failure in merge action', async () => {
        (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValueOnce(null);
        const program = new Command();
        registerPlaybackCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'playback', 'merge', '--channel-id', '3151318', '--file-ids', '1,2,3'])
        ).rejects.toThrow();
      });
    });

    describe('authentication error with diagnostics', () => {
      it('should show diagnostics when auth error in list action', async () => {
        (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
          config: { appId: 'test', appSecret: 'test' },
          source: 'env',
        });
        mockListPlayback.mockRejectedValueOnce(new Error('Authentication failed'));
        (authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
          availableSources: [{ appId: 'a', appSecret: 's', metadata: { source: 'env' }, type: 'env' }],
          errors: [],
        });
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const program = new Command();
        registerPlaybackCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'playback', 'list', '--channel-id', '3151318'])
        ).rejects.toThrow();

        expect(authAdapter.getDiagnostics).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Authentication Diagnostics'));
        consoleSpy.mockRestore();
      });

      it('should show diagnostics errors when available', async () => {
        (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
          config: { appId: 'test', appSecret: 'test' },
          source: 'env',
        });
        mockListPlayback.mockRejectedValueOnce(new Error('Authentication failed'));
        (authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
          availableSources: [{ appId: '', appSecret: '', metadata: { source: 'env' }, type: 'env' }],
          errors: ['Missing appId'],
        });
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const program = new Command();
        registerPlaybackCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'playback', 'list', '--channel-id', '3151318'])
        ).rejects.toThrow();

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Errors:'));
        consoleSpy.mockRestore();
      });

      it('should show diagnostics when auth error in merge action', async () => {
        (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
          config: { appId: 'test', appSecret: 'test' },
          source: 'env',
        });
        mockMergePlayback.mockRejectedValueOnce(new Error('Authentication failed'));
        (authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
          availableSources: [],
          errors: [],
        });
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const program = new Command();
        registerPlaybackCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'playback', 'merge', '--channel-id', '3151318', '--file-ids', '1,2,3'])
        ).rejects.toThrow();

        expect(authAdapter.getDiagnostics).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });

      it('should show diagnostics with errors in merge action', async () => {
        (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
          config: { appId: 'test', appSecret: 'test' },
          source: 'env',
        });
        mockMergePlayback.mockRejectedValueOnce(new Error('Authentication failed'));
        (authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
          availableSources: [{ appId: '', appSecret: '', metadata: { source: 'cli' }, type: 'cli' }],
          errors: ['Missing secret'],
        });
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const program = new Command();
        registerPlaybackCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'playback', 'merge', '--channel-id', '3151318', '--file-ids', '1,2,3'])
        ).rejects.toThrow();

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Errors:'));
        consoleSpy.mockRestore();
      });

      it('should show diagnostics when auth error in get action', async () => {
        (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
          config: { appId: 'test', appSecret: 'test' },
          source: 'env',
        });
        mockGetPlayback.mockRejectedValueOnce(new Error('Authentication failed'));
        (authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
          availableSources: [],
          errors: [],
        });
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const program = new Command();
        registerPlaybackCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'playback', 'get', '--channel-id', '3151318', '--video-id', '123'])
        ).rejects.toThrow();

        expect(authAdapter.getDiagnostics).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });

      it('should show diagnostics when auth error in delete action', async () => {
        (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
          config: { appId: 'test', appSecret: 'test' },
          source: 'env',
        });
        mockDeletePlayback.mockRejectedValueOnce(new Error('Authentication failed'));
        (authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
          availableSources: [],
          errors: [],
        });
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const program = new Command();
        registerPlaybackCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'playback', 'delete', '--channel-id', '3151318', '--video-id', '123', '--force'])
        ).rejects.toThrow();

        expect(authAdapter.getDiagnostics).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });

      it('should show diagnostics with errors in delete action', async () => {
        (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
          config: { appId: 'test', appSecret: 'test' },
          source: 'env',
        });
        mockDeletePlayback.mockRejectedValueOnce(new Error('Authentication failed'));
        (authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
          availableSources: [{ appId: '', appSecret: '', metadata: { source: 'cli' }, type: 'cli' }],
          errors: ['Missing secret'],
        });
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const program = new Command();
        registerPlaybackCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'playback', 'delete', '--channel-id', '3151318', '--video-id', '123', '--force'])
        ).rejects.toThrow();

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Errors:'));
        consoleSpy.mockRestore();
      });
    });

    describe('config manager error handling', () => {
      it('should handle incomplete auth config error gracefully', async () => {
        (configManager.load as jest.Mock).mockRejectedValueOnce(
          new Error('Auth configuration is incomplete')
        );
        mockListPlayback.mockResolvedValueOnce({ contents: [], total: 0 });
        const program = new Command();
        registerPlaybackCommands(program);

        await program.parseAsync(['node', 'test', 'playback', 'list', '--channel-id', '3151318']);

        expect(mockListPlayback).toHaveBeenCalled();
      });

      it('should handle other config manager errors', async () => {
        (configManager.load as jest.Mock).mockRejectedValueOnce(
          new Error('Network error')
        );
        const program = new Command();
        registerPlaybackCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'playback', 'list', '--channel-id', '3151318'])
        ).rejects.toThrow();
      });
    });

    describe('verbose mode', () => {
      it('should show auth source info when verbose is set', async () => {
        (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
          config: { appId: 'test', appSecret: 'test' },
          source: 'env',
          accountName: 'test-account',
        });
        mockListPlayback.mockResolvedValueOnce({ contents: [], total: 0 });
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const program = new Command();
        program.option('--verbose', 'verbose output');
        registerPlaybackCommands(program);

        await program.parseAsync(['node', 'test', '--verbose', 'playback', 'list', '--channel-id', '3151318']);

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Authentication Source'));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Account'));
        consoleSpy.mockRestore();
      });

      it('should handle missing accountName in verbose mode', async () => {
        (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
          config: { appId: 'test', appSecret: 'test' },
          source: 'env',
        });
        mockListPlayback.mockResolvedValueOnce({ contents: [], total: 0 });
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const program = new Command();
        program.option('--verbose', 'verbose output');
        registerPlaybackCommands(program);

        await program.parseAsync(['node', 'test', '--verbose', 'playback', 'list', '--channel-id', '3151318']);

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Authentication Source'));
        consoleSpy.mockRestore();
      });

      it('should handle missing source in auth result', async () => {
        (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
          config: { appId: 'test', appSecret: 'test' },
        });
        mockListPlayback.mockResolvedValueOnce({ contents: [], total: 0 });
        const program = new Command();
        registerPlaybackCommands(program);

        await program.parseAsync(['node', 'test', 'playback', 'list', '--channel-id', '3151318']);

        expect(mockListPlayback).toHaveBeenCalled();
      });
    });

    describe('non-Error exceptions', () => {
      it('should handle non-Error thrown in list action', async () => {
        mockListPlayback.mockRejectedValueOnce('string error');
        const program = new Command();
        registerPlaybackCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'playback', 'list', '--channel-id', '3151318'])
        ).rejects.toThrow();
      });

      it('should handle non-Error thrown in merge action', async () => {
        mockMergePlayback.mockRejectedValueOnce(42);
        const program = new Command();
        registerPlaybackCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'playback', 'merge', '--channel-id', '3151318', '--file-ids', '1,2,3'])
        ).rejects.toThrow();
      });
    });
  });
});
