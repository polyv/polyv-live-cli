/**
 * @fileoverview Unit tests for record commands
 * Uses test-helpers for auth mocking
 */

import { Command } from 'commander';
import {
  registerRecordCommands,
  validateOutputFormat,
  validateYN,
  validatePlaybackType,
  validatePlaybackOrigin,
  validateListType,
} from './record.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import {
  createTestProgram,
  mockAuthSuccess,
  mockAuthFailure,
  suppressConsole,
  mockProcessExit,
} from '../utils/test-helpers';

// Mock dependencies
jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/record.handler', () => ({
  RecordHandler: jest.fn().mockImplementation(() => ({
    getPlaybackSetting: jest.fn().mockResolvedValue(undefined),
    setPlaybackSetting: jest.fn().mockResolvedValue(undefined),
    recordConvert: jest.fn().mockResolvedValue(undefined),
    setRecordDefault: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('record commands', () => {
  let restoreConsole: () => void;
  let restoreExit: () => void;

  beforeEach(() => {
    restoreConsole = suppressConsole();
    restoreExit = mockProcessExit();

    // Setup auth mocks
    mockAuthSuccess(
      authAdapter as jest.Mocked<typeof authAdapter>,
      configManager as jest.Mocked<typeof configManager>
    );
  });

  afterEach(() => {
    restoreConsole();
    restoreExit();
    jest.clearAllMocks();
  });

  // Helper function to create program with record commands
  function createProgramWithRecord(): Command {
    const program = createTestProgram();
    registerRecordCommands(program);
    return program;
  }

  // ========================================
  // Command Registration Tests
  // ========================================
  describe('command registration', () => {
    it('[P0] should register record command group', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      expect(recordCmd).toBeDefined();
      expect(recordCmd?.description()).toContain('录制');
    });

    it('[P0] should register setting subcommand group', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const settingCmd = recordCmd?.commands.find(cmd => cmd.name() === 'setting');
      expect(settingCmd).toBeDefined();
    });

    it('[P0] should register setting get subcommand', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const settingCmd = recordCmd?.commands.find(cmd => cmd.name() === 'setting');
      const getCmd = settingCmd?.commands.find(cmd => cmd.name() === 'get');
      expect(getCmd).toBeDefined();
    });

    it('[P0] should register setting set subcommand', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const settingCmd = recordCmd?.commands.find(cmd => cmd.name() === 'setting');
      const setCmd = settingCmd?.commands.find(cmd => cmd.name() === 'set');
      expect(setCmd).toBeDefined();
    });

    it('[P0] should register convert subcommand', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const convertCmd = recordCmd?.commands.find(cmd => cmd.name() === 'convert');
      expect(convertCmd).toBeDefined();
    });

    it('[P0] should register set-default subcommand', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const setDefaultCmd = recordCmd?.commands.find(cmd => cmd.name() === 'set-default');
      expect(setDefaultCmd).toBeDefined();
    });
  });

  // ========================================
  // record setting get - Action Tests
  // ========================================
  describe('record setting get', () => {
    it('[P0] should have required --channel-id option', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const settingCmd = recordCmd?.commands.find(cmd => cmd.name() === 'setting');
      const getCmd = settingCmd?.commands.find(cmd => cmd.name() === 'get');
      const channelIdOption = getCmd?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });

    it('[P1] should have --output option with default table', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const settingCmd = recordCmd?.commands.find(cmd => cmd.name() === 'setting');
      const getCmd = settingCmd?.commands.find(cmd => cmd.name() === 'get');
      const outputOption = getCmd?.options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });
  });

  // ========================================
  // record setting set - Options Tests
  // ========================================
  describe('record setting set', () => {
    it('[P0] should have required --channel-id option', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const settingCmd = recordCmd?.commands.find(cmd => cmd.name() === 'setting');
      const setCmd = settingCmd?.commands.find(cmd => cmd.name() === 'set');
      const channelIdOption = setCmd?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });

    it('[P1] should have --playback-enabled option', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const settingCmd = recordCmd?.commands.find(cmd => cmd.name() === 'setting');
      const setCmd = settingCmd?.commands.find(cmd => cmd.name() === 'set');
      const playbackEnabledOption = setCmd?.options.find(opt => opt.long === '--playback-enabled');
      expect(playbackEnabledOption).toBeDefined();
    });

    it('[P1] should have --type option', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const settingCmd = recordCmd?.commands.find(cmd => cmd.name() === 'setting');
      const setCmd = settingCmd?.commands.find(cmd => cmd.name() === 'set');
      const typeOption = setCmd?.options.find(opt => opt.long === '--type');
      expect(typeOption).toBeDefined();
    });

    it('[P1] should have --origin option', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const settingCmd = recordCmd?.commands.find(cmd => cmd.name() === 'setting');
      const setCmd = settingCmd?.commands.find(cmd => cmd.name() === 'set');
      const originOption = setCmd?.options.find(opt => opt.long === '--origin');
      expect(originOption).toBeDefined();
    });
  });

  // ========================================
  // record convert - Options Tests
  // ========================================
  describe('record convert', () => {
    it('[P0] should have required --channel-id option', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const convertCmd = recordCmd?.commands.find(cmd => cmd.name() === 'convert');
      const channelIdOption = convertCmd?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });

    it('[P0] should have required --file-name option', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const convertCmd = recordCmd?.commands.find(cmd => cmd.name() === 'convert');
      const fileNameOption = convertCmd?.options.find(opt => opt.long === '--file-name');
      expect(fileNameOption?.required).toBe(true);
    });

    it('[P1] should have --async option', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const convertCmd = recordCmd?.commands.find(cmd => cmd.name() === 'convert');
      const asyncOption = convertCmd?.options.find(opt => opt.long === '--async');
      expect(asyncOption).toBeDefined();
    });

    it('[P1] should have --callback-url option', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const convertCmd = recordCmd?.commands.find(cmd => cmd.name() === 'convert');
      const callbackUrlOption = convertCmd?.options.find(opt => opt.long === '--callback-url');
      expect(callbackUrlOption).toBeDefined();
    });
  });

  // ========================================
  // record set-default - Options Tests
  // ========================================
  describe('record set-default', () => {
    it('[P0] should have required --channel-id option', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const setDefaultCmd = recordCmd?.commands.find(cmd => cmd.name() === 'set-default');
      const channelIdOption = setDefaultCmd?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });

    it('[P0] should have required --video-id option', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const setDefaultCmd = recordCmd?.commands.find(cmd => cmd.name() === 'set-default');
      const videoIdOption = setDefaultCmd?.options.find(opt => opt.long === '--video-id');
      expect(videoIdOption?.required).toBe(true);
    });

    it('[P1] should have --list-type option', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const setDefaultCmd = recordCmd?.commands.find(cmd => cmd.name() === 'set-default');
      const listTypeOption = setDefaultCmd?.options.find(opt => opt.long === '--list-type');
      expect(listTypeOption).toBeDefined();
    });
  });

  // ========================================
  // validateOutputFormat Helper Tests
  // ========================================
  describe('validateOutputFormat', () => {
    it('[P0] should accept "table" format', () => {
      expect(validateOutputFormat('table')).toBe('table');
    });

    it('[P0] should accept "json" format', () => {
      expect(validateOutputFormat('json')).toBe('json');
    });

    it('[P1] should reject invalid format', () => {
      expect(() => validateOutputFormat('xml')).toThrow('Output format must be either "table" or "json"');
    });

    it('[P1] should reject empty string', () => {
      expect(() => validateOutputFormat('')).toThrow('Output format must be either "table" or "json"');
    });
  });

  // ========================================
  // validateYN Helper Tests
  // ========================================
  describe('validateYN', () => {
    it('[P0] should accept "Y"', () => {
      expect(validateYN('Y')).toBe('Y');
    });

    it('[P0] should accept "N"', () => {
      expect(validateYN('N')).toBe('N');
    });

    it('[P0] should accept lowercase "y" and convert to uppercase', () => {
      expect(validateYN('y')).toBe('Y');
    });

    it('[P0] should accept lowercase "n" and convert to uppercase', () => {
      expect(validateYN('n')).toBe('N');
    });

    it('[P1] should reject invalid value', () => {
      expect(() => validateYN('yes')).toThrow('Value must be either "Y" or "N"');
    });
  });

  // ========================================
  // validatePlaybackType Helper Tests
  // ========================================
  describe('validatePlaybackType', () => {
    it('[P0] should accept "single"', () => {
      expect(validatePlaybackType('single')).toBe('single');
    });

    it('[P0] should accept "list"', () => {
      expect(validatePlaybackType('list')).toBe('list');
    });

    it('[P1] should reject invalid type', () => {
      expect(() => validatePlaybackType('multi')).toThrow('Playback type must be either "single" or "list"');
    });
  });

  // ========================================
  // validatePlaybackOrigin Helper Tests
  // ========================================
  describe('validatePlaybackOrigin', () => {
    it('[P0] should accept "record"', () => {
      expect(validatePlaybackOrigin('record')).toBe('record');
    });

    it('[P0] should accept "playback"', () => {
      expect(validatePlaybackOrigin('playback')).toBe('playback');
    });

    it('[P0] should accept "vod"', () => {
      expect(validatePlaybackOrigin('vod')).toBe('vod');
    });

    it('[P0] should accept "material"', () => {
      expect(validatePlaybackOrigin('material')).toBe('material');
    });

    it('[P1] should reject invalid origin', () => {
      expect(() => validatePlaybackOrigin('external')).toThrow('Playback origin must be one of: record, playback, vod, material');
    });
  });

  // ========================================
  // validateListType Helper Tests
  // ========================================
  describe('validateListType', () => {
    it('[P0] should accept "playback"', () => {
      expect(validateListType('playback')).toBe('playback');
    });

    it('[P0] should accept "vod"', () => {
      expect(validateListType('vod')).toBe('vod');
    });

    it('[P1] should reject invalid type', () => {
      expect(() => validateListType('record')).toThrow('List type must be either "playback" or "vod"');
    });
  });

  // ========================================
  // Error Handling Tests
  // ========================================
  describe('error handling', () => {
    it('[P1] should handle auth failure for setting get', async () => {
      mockAuthFailure(
        authAdapter as jest.Mocked<typeof authAdapter>,
        'No authentication configured'
      );
      const program = createProgramWithRecord();

      await expect(
        program.parseAsync(['node', 'test', 'record', 'setting', 'get', '-c', '123'])
      ).rejects.toThrow();
    });

    it('[P1] should handle auth failure for convert', async () => {
      mockAuthFailure(
        authAdapter as jest.Mocked<typeof authAdapter>,
        'No authentication configured'
      );
      const program = createProgramWithRecord();

      await expect(
        program.parseAsync(['node', 'test', 'record', 'convert', '-c', '123', '--file-name', 'test'])
      ).rejects.toThrow();
    });

    it('[P1] should handle auth failure for set-default', async () => {
      mockAuthFailure(
        authAdapter as jest.Mocked<typeof authAdapter>,
        'No authentication configured'
      );
      const program = createProgramWithRecord();

      await expect(
        program.parseAsync(['node', 'test', 'record', 'set-default', '-c', '123', '--video-id', 'vid'])
      ).rejects.toThrow();
    });
  });

  // ========================================
  // Help Text Tests
  // ========================================
  describe('help text', () => {
    it('[P1] should show help for record command', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      expect(recordCmd?.description()).toContain('录制');
    });

    it('[P1] should show help for setting command', () => {
      const program = createProgramWithRecord();

      const recordCmd = program.commands.find(cmd => cmd.name() === 'record');
      const settingCmd = recordCmd?.commands.find(cmd => cmd.name() === 'setting');
      expect(settingCmd?.description()).toContain('回放');
    });
  });

  // ========================================
  // Action Execution Tests
  // ========================================
  describe('action execution', () => {
    it('[P0] should call getPlaybackSetting handler with correct params', async () => {
      const { RecordHandler } = await import('../handlers/record.handler');
      const mockHandler = {
        getPlaybackSetting: jest.fn().mockResolvedValue(undefined),
      };
      (RecordHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithRecord();
      await program.parseAsync(['node', 'test', 'record', 'setting', 'get', '-c', '123456']);

      expect(mockHandler.getPlaybackSetting).toHaveBeenCalledWith(
        expect.objectContaining({ channelId: '123456' })
      );
    });

    it('[P0] should call setPlaybackSetting handler with correct params', async () => {
      const { RecordHandler } = await import('../handlers/record.handler');
      const mockHandler = {
        setPlaybackSetting: jest.fn().mockResolvedValue(undefined),
      };
      (RecordHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithRecord();
      await program.parseAsync([
        'node', 'test', 'record', 'setting', 'set',
        '-c', '123456',
        '--playback-enabled', 'Y',
        '--type', 'single',
        '--origin', 'playback',
      ]);

      expect(mockHandler.setPlaybackSetting).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '123456',
          playbackEnabled: 'Y',
          type: 'single',
          origin: 'playback',
        })
      );
    });

    it('[P0] should call recordConvert handler with correct params', async () => {
      const { RecordHandler } = await import('../handlers/record.handler');
      const mockHandler = {
        recordConvert: jest.fn().mockResolvedValue(undefined),
      };
      (RecordHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithRecord();
      await program.parseAsync([
        'node', 'test', 'record', 'convert',
        '-c', '123456',
        '--file-name', 'test-video',
        '--session-id', 'session123',
      ]);

      expect(mockHandler.recordConvert).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '123456',
          fileName: 'test-video',
          sessionId: 'session123',
        })
      );
    });

    it('[P0] should call setRecordDefault handler with correct params', async () => {
      const { RecordHandler } = await import('../handlers/record.handler');
      const mockHandler = {
        setRecordDefault: jest.fn().mockResolvedValue(undefined),
      };
      (RecordHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithRecord();
      await program.parseAsync([
        'node', 'test', 'record', 'set-default',
        '-c', '123456',
        '--video-id', 'video789',
      ]);

      expect(mockHandler.setRecordDefault).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '123456',
          videoId: 'video789',
        })
      );
    });

    it('[P1] should pass output option to handlers', async () => {
      const { RecordHandler } = await import('../handlers/record.handler');
      const mockHandler = {
        getPlaybackSetting: jest.fn().mockResolvedValue(undefined),
      };
      (RecordHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithRecord();
      await program.parseAsync(['node', 'test', 'record', 'setting', 'get', '-c', '123456', '-o', 'json']);

      expect(mockHandler.getPlaybackSetting).toHaveBeenCalledWith(
        expect.objectContaining({ output: 'json' })
      );
    });

    it('[P1] should pass async option to recordConvert', async () => {
      const { RecordHandler } = await import('../handlers/record.handler');
      const mockHandler = {
        recordConvert: jest.fn().mockResolvedValue(undefined),
      };
      (RecordHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithRecord();
      await program.parseAsync([
        'node', 'test', 'record', 'convert',
        '-c', '123456',
        '--file-name', 'test-video',
        '--async',
      ]);

      expect(mockHandler.recordConvert).toHaveBeenCalledWith(
        expect.objectContaining({ async: true })
      );
    });

    it('[P1] should pass listType option to setRecordDefault', async () => {
      const { RecordHandler } = await import('../handlers/record.handler');
      const mockHandler = {
        setRecordDefault: jest.fn().mockResolvedValue(undefined),
      };
      (RecordHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithRecord();
      await program.parseAsync([
        'node', 'test', 'record', 'set-default',
        '-c', '123456',
        '--video-id', 'video789',
        '--list-type', 'vod',
      ]);

      expect(mockHandler.setRecordDefault).toHaveBeenCalledWith(
        expect.objectContaining({ listType: 'vod' })
      );
    });

    it('[P1] should handle handler errors gracefully', async () => {
      const { RecordHandler } = await import('../handlers/record.handler');
      const mockHandler = {
        getPlaybackSetting: jest.fn().mockRejectedValue(new Error('API Error')),
      };
      (RecordHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithRecord();

      await expect(
        program.parseAsync(['node', 'test', 'record', 'setting', 'get', '-c', '123456'])
      ).rejects.toThrow();
    });
  });
});
