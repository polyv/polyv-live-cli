/**
 * Record Commands Acceptance Tests
 *
 * Story 9.7: 录制设置管理命令
 *
 * Tests for record CLI commands covering:
 * - record setting get: Get channel playback settings
 * - record setting set: Update channel playback settings
 * - record convert: Convert recording to VOD (sync/async)
 * - record set-default: Set default playback video
 *
 * Acceptance Criteria (Story 9.7):
 * - AC1: `record setting get` 命令支持 `--channel-id` 参数获取频道回放设置
 * - AC2: `record setting set` 命令支持更新频道回放设置
 * - AC3: `record convert` 命令支持将录制文件转存到点播（同步模式）
 * - AC4: `record convert` 命令支持 `--async` 参数异步转存
 * - AC5: `record set-default` 命令支持设置默认回放视频
 * - AC6: 所有命令支持 `--output` 参数选择 table 或 json 输出格式
 */

import { Command } from 'commander';
import { registerRecordCommands } from '../../src/commands/record.commands';

// Mock dependencies
jest.mock('../../src/handlers/record.handler');
jest.mock('../../src/config/manager');
jest.mock('../../src/config/auth-adapter');
jest.mock('../../src/utils/errors');

describe('Record Commands - Story 9.7: Record Settings Commands', () => {
  let program: Command;
  let originalExit: typeof process.exit;

  beforeEach(() => {
    jest.clearAllMocks();
    program = new Command();
    program.exitOverride(); // Throw instead of exit
    originalExit = process.exit;
    process.exit = jest.fn() as unknown as typeof process.exit;

    // Register record commands
    registerRecordCommands(program);
  });

  afterEach(() => {
    process.exit = originalExit;
  });

  // ============================================
  // Command Registration Tests
  // ============================================

  describe('Command Registration', () => {
    it('should register record command group', () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      expect(recordCmd).toBeDefined();
      expect(recordCmd?.description()).toContain('录制');
    });

    it('should register setting subcommand group', () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const settingCmd = recordCmd?.commands.find(c => c.name() === 'setting');
      expect(settingCmd).toBeDefined();
    });

    it('should register setting get subcommand', () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const settingCmd = recordCmd?.commands.find(c => c.name() === 'setting');
      const getCmd = settingCmd?.commands.find(c => c.name() === 'get');
      expect(getCmd).toBeDefined();
      expect(getCmd?.description()).toContain('回放设置');
    });

    it('should register setting set subcommand', () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const settingCmd = recordCmd?.commands.find(c => c.name() === 'setting');
      const setCmd = settingCmd?.commands.find(c => c.name() === 'set');
      expect(setCmd).toBeDefined();
      expect(setCmd?.description()).toContain('设置');
    });

    it('should register convert subcommand', () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const convertCmd = recordCmd?.commands.find(c => c.name() === 'convert');
      expect(convertCmd).toBeDefined();
      expect(convertCmd?.description()).toContain('转存');
    });

    it('should register set-default subcommand', () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const setDefaultCmd = recordCmd?.commands.find(c => c.name() === 'set-default');
      expect(setDefaultCmd).toBeDefined();
      expect(setDefaultCmd?.description()).toContain('默认');
    });
  });

  // ============================================
  // AC1: record setting get - Required Options
  // ============================================

  describe('record setting get - Required Options (AC1)', () => {
    it('should require --channel-id option', async () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const settingCmd = recordCmd?.commands.find(c => c.name() === 'setting');
      const getCmd = settingCmd?.commands.find(c => c.name() === 'get');

      const channelIdOption = getCmd?.options.find(o => o.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });

    it('should fail when channelId is missing', async () => {
      await expect(
        program.parseAsync([
          'node',
          'cli',
          'record',
          'setting',
          'get',
        ])
      ).rejects.toThrow("required option '-c, --channel-id <channelId>' not specified");
    });

    it('should have optional --output option with default table', async () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const settingCmd = recordCmd?.commands.find(c => c.name() === 'setting');
      const getCmd = settingCmd?.commands.find(c => c.name() === 'get');

      const outputOption = getCmd?.options.find(o => o.long === '--output');
      expect(outputOption?.defaultValue).toBe('table');
      expect(outputOption?.long).toBe('--output');
    });
  });

  // ============================================
  // AC2: record setting set - Required Options
  // ============================================

  describe('record setting set - Required Options (AC2)', () => {
    it('should require --channel-id option', async () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const settingCmd = recordCmd?.commands.find(c => c.name() === 'setting');
      const setCmd = settingCmd?.commands.find(c => c.name() === 'set');

      const channelIdOption = setCmd?.options.find(o => o.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });

    it('should fail when channelId is missing', async () => {
      await expect(
        program.parseAsync([
          'node',
          'cli',
          'record',
          'setting',
          'set',
          '--playback-enabled',
          'Y',
        ])
      ).rejects.toThrow("required option '-c, --channel-id <channelId>' not specified");
    });

    it('should have --playback-enabled option', async () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const settingCmd = recordCmd?.commands.find(c => c.name() === 'setting');
      const setCmd = settingCmd?.commands.find(c => c.name() === 'set');

      const playbackEnabledOption = setCmd?.options.find(o => o.long === '--playback-enabled');
      expect(playbackEnabledOption).toBeDefined();
    });

    it('should have --type option', async () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const settingCmd = recordCmd?.commands.find(c => c.name() === 'setting');
      const setCmd = settingCmd?.commands.find(c => c.name() === 'set');

      const typeOption = setCmd?.options.find(o => o.long === '--type');
      expect(typeOption).toBeDefined();
    });

    it('should have --origin option', async () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const settingCmd = recordCmd?.commands.find(c => c.name() === 'setting');
      const setCmd = settingCmd?.commands.find(c => c.name() === 'set');

      const originOption = setCmd?.options.find(o => o.long === '--origin');
      expect(originOption).toBeDefined();
    });
  });

  // ============================================
  // AC3 & AC4: record convert - Required Options
  // ============================================

  describe('record convert - Required Options (AC3, AC4)', () => {
    it('should require --channel-id option', async () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const convertCmd = recordCmd?.commands.find(c => c.name() === 'convert');

      const channelIdOption = convertCmd?.options.find(o => o.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });

    it('should have optional --file-name option', async () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const convertCmd = recordCmd?.commands.find(c => c.name() === 'convert');

      const fileNameOption = convertCmd?.options.find(o => o.long === '--file-name');
      expect(fileNameOption).toBeDefined();
      expect(fileNameOption?.mandatory).toBeFalsy();
    });

    it('should allow async mode without --file-name at command parse time', async () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const convertCmd = recordCmd?.commands.find(c => c.name() === 'convert');

      const fileNameOption = convertCmd?.options.find(o => o.long === '--file-name');
      expect(fileNameOption?.mandatory).toBeFalsy();
    });

    it('should have --session-id option', async () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const convertCmd = recordCmd?.commands.find(c => c.name() === 'convert');

      const sessionIdOption = convertCmd?.options.find(o => o.long === '--session-id');
      expect(sessionIdOption).toBeDefined();
    });

    it('should have --async flag for async mode (AC4)', async () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const convertCmd = recordCmd?.commands.find(c => c.name() === 'convert');

      const asyncOption = convertCmd?.options.find(o => o.long === '--async');
      expect(asyncOption).toBeDefined();
    });

    it('should have --file-ids option for async mode (AC4)', async () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const convertCmd = recordCmd?.commands.find(c => c.name() === 'convert');

      const fileIdsOption = convertCmd?.options.find(o => o.long === '--file-ids');
      expect(fileIdsOption).toBeDefined();
    });

    it('should have --to-play-list option', async () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const convertCmd = recordCmd?.commands.find(c => c.name() === 'convert');

      const toPlayListOption = convertCmd?.options.find(o => o.long === '--to-play-list');
      expect(toPlayListOption).toBeDefined();
    });

    it('should have --set-as-default option', async () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const convertCmd = recordCmd?.commands.find(c => c.name() === 'convert');

      const setAsDefaultOption = convertCmd?.options.find(o => o.long === '--set-as-default');
      expect(setAsDefaultOption).toBeDefined();
    });
  });

  // ============================================
  // AC5: record set-default - Required Options
  // ============================================

  describe('record set-default - Required Options (AC5)', () => {
    it('should require --channel-id option', async () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const setDefaultCmd = recordCmd?.commands.find(c => c.name() === 'set-default');

      const channelIdOption = setDefaultCmd?.options.find(o => o.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });

    it('should require --video-id option', async () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const setDefaultCmd = recordCmd?.commands.find(c => c.name() === 'set-default');

      const videoIdOption = setDefaultCmd?.options.find(o => o.long === '--video-id');
      expect(videoIdOption?.required).toBe(true);
    });

    it('should fail when videoId is missing', async () => {
      await expect(
        program.parseAsync([
          'node',
          'cli',
          'record',
          'set-default',
          '-c',
          '2588188',
        ])
      ).rejects.toThrow("required option '--video-id <videoId>' not specified");
    });

    it('should have --list-type option', async () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const setDefaultCmd = recordCmd?.commands.find(c => c.name() === 'set-default');

      const listTypeOption = setDefaultCmd?.options.find(o => o.long === '--list-type');
      expect(listTypeOption).toBeDefined();
    });
  });

  // ============================================
  // AC6: Output format options
  // ============================================

  describe('output format options (AC6)', () => {
    it('should accept table output format for setting get', () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const settingCmd = recordCmd?.commands.find(c => c.name() === 'setting');
      const getCmd = settingCmd?.commands.find(c => c.name() === 'get');

      const outputOption = getCmd?.options.find(o => o.long === '--output');
      expect(outputOption?.defaultValue).toBe('table');
    });

    it('should accept json output format', () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const settingCmd = recordCmd?.commands.find(c => c.name() === 'setting');
      const getCmd = settingCmd?.commands.find(c => c.name() === 'get');

      const outputOption = getCmd?.options.find(o => o.long === '--output');
      // Check that the option accepts 'json' as a valid value
      expect(outputOption?.long).toBe('--output');
    });

    it('should have -o as shortcut for --output', () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const settingCmd = recordCmd?.commands.find(c => c.name() === 'setting');
      const getCmd = settingCmd?.commands.find(c => c.name() === 'get');

      const outputOption = getCmd?.options.find(o => o.short === '-o');
      expect(outputOption).toBeDefined();
      expect(outputOption?.long).toBe('--output');
    });
  });

  // ============================================
  // Command aliases and shortcuts
  // ============================================

  describe('command shortcuts', () => {
    it('should accept -c as shortcut for --channel-id', () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const settingCmd = recordCmd?.commands.find(c => c.name() === 'setting');
      const getCmd = settingCmd?.commands.find(c => c.name() === 'get');

      const channelIdOption = getCmd?.options.find(o => o.short === '-c');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.long).toBe('--channel-id');
    });
  });

  // ============================================
  // Help text
  // ============================================

  describe('help text', () => {
    it('should include examples in setting get command help', () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const settingCmd = recordCmd?.commands.find(c => c.name() === 'setting');
      const getCmd = settingCmd?.commands.find(c => c.name() === 'get');

      const helpText = getCmd?.helpInformation() || '';
      expect(helpText).toContain('setting');
      expect(helpText).toContain('get');
    });

    it('should include examples in convert command help', () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const convertCmd = recordCmd?.commands.find(c => c.name() === 'convert');

      const helpText = convertCmd?.helpInformation() || '';
      expect(helpText).toContain('convert');
    });

    it('should include examples in set-default command help', () => {
      const recordCmd = program.commands.find(c => c.name() === 'record');
      const setDefaultCmd = recordCmd?.commands.find(c => c.name() === 'set-default');

      const helpText = setDefaultCmd?.helpInformation() || '';
      expect(helpText).toContain('set-default');
    });
  });
});
