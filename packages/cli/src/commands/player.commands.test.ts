/**
 * @fileoverview Unit tests for Player commands - ATDD Failing Tests
 * @story 10.5: 播放器设置命令
 *
 * These tests will FAIL until the feature is implemented (TDD red phase)
 *
 * Acceptance Criteria:
 * - AC1: `player config get` command supports getting channel player config
 * - AC2: `player config update` command supports updating player config
 * - AC3: `get` command requires `--channel-id` parameter
 * - AC4: `update` command supports `--watermark-enabled` parameter (Y/N)
 * - AC5: `update` command supports `--watermark-url` parameter
 * - AC6: `update` command supports `--watermark-position` parameter (tl/tr/bl/br)
 * - AC7: `update` command supports `--watermark-opacity` parameter (0-1)
 * - AC8: `update` command supports `--warmup-enabled` parameter (Y/N)
 * - AC9: `update` command supports `--warmup-image-url` parameter
 * - AC10: `update` command supports `--base-pv` parameter
 */

import { Command } from 'commander';
import { registerPlayerCommands, validateWatermarkPosition, validateWatermarkOpacity, validateYNValue, validateOutputFormat } from './player.commands';
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
jest.mock('../handlers/player.handler', () => ({
  PlayerHandler: jest.fn().mockImplementation(() => ({
    getConfig: jest.fn().mockResolvedValue(undefined),
    updateConfig: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Helper function tests
describe('validateWatermarkPosition', () => {
  it('should return "tl" for top-left input', () => {
    expect(validateWatermarkPosition('tl')).toBe('tl');
  });

  it('should return "tr" for top-right input', () => {
    expect(validateWatermarkPosition('tr')).toBe('tr');
  });

  it('should return "bl" for bottom-left input', () => {
    expect(validateWatermarkPosition('bl')).toBe('bl');
  });

  it('should return "br" for bottom-right input', () => {
    expect(validateWatermarkPosition('br')).toBe('br');
  });

  it('should throw error for invalid position', () => {
    expect(() => validateWatermarkPosition('center')).toThrow();
  });

  it('should throw error for uppercase input', () => {
    expect(() => validateWatermarkPosition('TL')).toThrow();
  });
});

describe('validateWatermarkOpacity', () => {
  it('should return 0 for "0" input', () => {
    expect(validateWatermarkOpacity('0')).toBe(0);
  });

  it('should return 1 for "1" input', () => {
    expect(validateWatermarkOpacity('1')).toBe(1);
  });

  it('should return 0.5 for "0.5" input', () => {
    expect(validateWatermarkOpacity('0.5')).toBe(0.5);
  });

  it('should throw error for value less than 0', () => {
    expect(() => validateWatermarkOpacity('-0.1')).toThrow();
  });

  it('should throw error for value greater than 1', () => {
    expect(() => validateWatermarkOpacity('1.1')).toThrow();
  });

  it('should throw error for non-numeric input', () => {
    expect(() => validateWatermarkOpacity('abc')).toThrow();
  });
});

describe('validateYNValue', () => {
  it('should return "Y" for "Y" input', () => {
    expect(validateYNValue('Y')).toBe('Y');
  });

  it('should return "N" for "N" input', () => {
    expect(validateYNValue('N')).toBe('N');
  });

  it('should throw error for lowercase input', () => {
    expect(() => validateYNValue('y')).toThrow();
  });

  it('should throw error for invalid value', () => {
    expect(() => validateYNValue('yes')).toThrow();
  });
});

describe('validateOutputFormat', () => {
  it('should return "table" for "table" input', () => {
    expect(validateOutputFormat('table')).toBe('table');
  });

  it('should return "json" for "json" input', () => {
    expect(validateOutputFormat('json')).toBe('json');
  });

  it('should throw error for invalid format', () => {
    expect(() => validateOutputFormat('xml')).toThrow('Output format must be either "table" or "json"');
  });

  it('should throw error for empty string', () => {
    expect(() => validateOutputFormat('')).toThrow('Output format must be either "table" or "json"');
  });

  it('should throw error for case-sensitive mismatch', () => {
    expect(() => validateOutputFormat('JSON')).toThrow('Output format must be either "table" or "json"');
  });
});

describe('Player Commands', () => {
  describe('command registration', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerPlayerCommands(program);
    });

    // ============================================================
    // AC1: player config get command
    // ============================================================

    it('should register player command group', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      expect(playerCmd).toBeDefined();
      expect(playerCmd?.description()).toContain('player');
    });

    it('should register player config command group', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');

      expect(configCmd).toBeDefined();
      expect(configCmd?.description()).toContain('config');
    });

    it('should register player config get subcommand', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');
      const getCmd = configCmd?.commands.find(cmd => cmd.name() === 'get');

      expect(getCmd).toBeDefined();
      expect(getCmd?.description().toLowerCase()).toContain('get');
    });

    // ============================================================
    // AC2: player config update command
    // ============================================================

    it('should register player config update subcommand', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');
      const updateCmd = configCmd?.commands.find(cmd => cmd.name() === 'update');

      expect(updateCmd).toBeDefined();
      expect(updateCmd?.description().toLowerCase()).toContain('update');
    });
  });

  // ============================================================
  // AC3: Required --channel-id parameter for get command
  // ============================================================

  describe('player config get command options (AC3)', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerPlayerCommands(program);
    });

    it('should register required --channel-id option', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');
      const getCmd = configCmd?.commands.find(cmd => cmd.name() === 'get');

      const options = getCmd?.options || [];
      const channelIdOption = options.find(opt => opt.long === '--channel-id');

      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register --channel-id with short option -c', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');
      const getCmd = configCmd?.commands.find(cmd => cmd.name() === 'get');

      const options = getCmd?.options || [];
      const channelIdOption = options.find(opt => opt.long === '--channel-id');

      expect(channelIdOption?.short).toBe('-c');
    });

    it('should register --output option', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');
      const getCmd = configCmd?.commands.find(cmd => cmd.name() === 'get');

      const options = getCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--output');
    });

    it('should register --output with short option -o', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');
      const getCmd = configCmd?.commands.find(cmd => cmd.name() === 'get');

      const options = getCmd?.options || [];
      const outputOption = options.find(opt => opt.long === '--output');

      expect(outputOption?.short).toBe('-o');
    });
  });

  // ============================================================
  // AC4-AC10: Update command options
  // ============================================================

  describe('player config update command options (AC4-AC10)', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerPlayerCommands(program);
    });

    // AC3: Required --channel-id for update
    it('should register required --channel-id option for update', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');
      const updateCmd = configCmd?.commands.find(cmd => cmd.name() === 'update');

      const options = updateCmd?.options || [];
      const channelIdOption = options.find(opt => opt.long === '--channel-id');

      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    // AC4: --watermark-enabled
    it('should register --watermark-enabled option (AC4)', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');
      const updateCmd = configCmd?.commands.find(cmd => cmd.name() === 'update');

      const options = updateCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--watermark-enabled');
    });

    // AC5: --watermark-url
    it('should register --watermark-url option (AC5)', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');
      const updateCmd = configCmd?.commands.find(cmd => cmd.name() === 'update');

      const options = updateCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--watermark-url');
    });

    // AC6: --watermark-position
    it('should register --watermark-position option (AC6)', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');
      const updateCmd = configCmd?.commands.find(cmd => cmd.name() === 'update');

      const options = updateCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--watermark-position');
    });

    // AC7: --watermark-opacity
    it('should register --watermark-opacity option (AC7)', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');
      const updateCmd = configCmd?.commands.find(cmd => cmd.name() === 'update');

      const options = updateCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--watermark-opacity');
    });

    // AC8: --warmup-enabled
    it('should register --warmup-enabled option (AC8)', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');
      const updateCmd = configCmd?.commands.find(cmd => cmd.name() === 'update');

      const options = updateCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--warmup-enabled');
    });

    // AC9: --warmup-image-url
    it('should register --warmup-image-url option (AC9)', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');
      const updateCmd = configCmd?.commands.find(cmd => cmd.name() === 'update');

      const options = updateCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--warmup-image-url');
    });

    // AC10: --base-pv
    it('should register --base-pv option (AC10)', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');
      const updateCmd = configCmd?.commands.find(cmd => cmd.name() === 'update');

      const options = updateCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--base-pv');
    });

    it('should register --output option for update', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');
      const updateCmd = configCmd?.commands.find(cmd => cmd.name() === 'update');

      const options = updateCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--output');
    });
  });

  // ============================================================
  // Help information
  // ============================================================

  describe('help information', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerPlayerCommands(program);
    });

    it('should include basic help information for player config get command', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');
      const getCmd = configCmd?.commands.find(cmd => cmd.name() === 'get');

      const helpText = getCmd?.helpInformation();

      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--output');
    });

    it('should include all update options in help information', () => {
      const playerCmd = program.commands.find(cmd => cmd.name() === 'player');
      const configCmd = playerCmd?.commands.find(cmd => cmd.name() === 'config');
      const updateCmd = configCmd?.commands.find(cmd => cmd.name() === 'update');

      const helpText = updateCmd?.helpInformation();

      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--watermark-enabled');
      expect(helpText).toContain('--watermark-url');
      expect(helpText).toContain('--watermark-position');
      expect(helpText).toContain('--watermark-opacity');
      expect(helpText).toContain('--warmup-enabled');
      expect(helpText).toContain('--warmup-image-url');
      expect(helpText).toContain('--base-pv');
    });
  });

  // ========================================
  // Action Execution Tests
  // ========================================
  describe('action execution', () => {
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

    // Helper function to create program with player commands
    function createProgramWithPlayer(): Command {
      const program = createTestProgram();
      registerPlayerCommands(program);
      return program;
    }

    it('[P0] should call getConfig handler with correct params', async () => {
      const { PlayerHandler } = await import('../handlers/player.handler');
      const mockHandler = {
        getConfig: jest.fn().mockResolvedValue(undefined),
      };
      (PlayerHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithPlayer();
      await program.parseAsync(['node', 'test', 'player', 'config', 'get', '-c', '123456']);

      expect(mockHandler.getConfig).toHaveBeenCalledWith(
        expect.objectContaining({ channelId: '123456' })
      );
    });

    it('[P0] should call updateConfig handler with correct params', async () => {
      const { PlayerHandler } = await import('../handlers/player.handler');
      const mockHandler = {
        updateConfig: jest.fn().mockResolvedValue(undefined),
      };
      (PlayerHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithPlayer();
      await program.parseAsync([
        'node', 'test', 'player', 'config', 'update',
        '-c', '123456',
        '--watermark-enabled', 'Y',
      ]);

      expect(mockHandler.updateConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '123456',
          watermarkEnabled: 'Y',
        })
      );
    });

    it('[P1] should pass watermark options to updateConfig', async () => {
      const { PlayerHandler } = await import('../handlers/player.handler');
      const mockHandler = {
        updateConfig: jest.fn().mockResolvedValue(undefined),
      };
      (PlayerHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithPlayer();
      await program.parseAsync([
        'node', 'test', 'player', 'config', 'update',
        '-c', '123456',
        '--watermark-url', 'https://example.com/watermark.png',
        '--watermark-position', 'br',
        '--watermark-opacity', '0.5',
      ]);

      expect(mockHandler.updateConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          watermarkUrl: 'https://example.com/watermark.png',
          watermarkPosition: 'br',
          watermarkOpacity: 0.5,
        })
      );
    });

    it('[P1] should pass warmup options to updateConfig', async () => {
      const { PlayerHandler } = await import('../handlers/player.handler');
      const mockHandler = {
        updateConfig: jest.fn().mockResolvedValue(undefined),
      };
      (PlayerHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithPlayer();
      await program.parseAsync([
        'node', 'test', 'player', 'config', 'update',
        '-c', '123456',
        '--warmup-enabled', 'Y',
        '--warmup-image-url', 'https://example.com/warmup.png',
      ]);

      expect(mockHandler.updateConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          warmupEnabled: 'Y',
          warmupImageUrl: 'https://example.com/warmup.png',
        })
      );
    });

    it('[P1] should pass basePv option to updateConfig', async () => {
      const { PlayerHandler } = await import('../handlers/player.handler');
      const mockHandler = {
        updateConfig: jest.fn().mockResolvedValue(undefined),
      };
      (PlayerHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithPlayer();
      await program.parseAsync([
        'node', 'test', 'player', 'config', 'update',
        '-c', '123456',
        '--base-pv', '1000',
      ]);

      expect(mockHandler.updateConfig).toHaveBeenCalledWith(
        expect.objectContaining({ basePv: 1000 })
      );
    });

    it('[P1] should pass output option to handlers', async () => {
      const { PlayerHandler } = await import('../handlers/player.handler');
      const mockHandler = {
        getConfig: jest.fn().mockResolvedValue(undefined),
      };
      (PlayerHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithPlayer();
      await program.parseAsync(['node', 'test', 'player', 'config', 'get', '-c', '123456', '-o', 'json']);

      expect(mockHandler.getConfig).toHaveBeenCalledWith(
        expect.objectContaining({ output: 'json' })
      );
    });

    it('[P1] should handle handler errors gracefully', async () => {
      const { PlayerHandler } = await import('../handlers/player.handler');
      const mockHandler = {
        getConfig: jest.fn().mockRejectedValue(new Error('API Error')),
      };
      (PlayerHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithPlayer();

      await expect(
        program.parseAsync(['node', 'test', 'player', 'config', 'get', '-c', '123456'])
      ).rejects.toThrow();
    });

    it('[P1] should handle auth failure', async () => {
      mockAuthFailure(
        authAdapter as jest.Mocked<typeof authAdapter>,
        'No authentication configured'
      );
      const program = createProgramWithPlayer();

      await expect(
        program.parseAsync(['node', 'test', 'player', 'config', 'get', '-c', '123456'])
      ).rejects.toThrow();
    });

    it('[P1] should handle auth error with diagnostics', async () => {
      // Mock auth failure with "Authentication" in error message
      (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
        config: { appId: 'test-app-id', appSecret: 'test-app-secret', userId: 'test-user-id' },
        source: 'environment',
      });
      (authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [
          { metadata: { source: 'env' }, type: 'env', appId: 'test', appSecret: 'test' },
        ],
        errors: ['Test error'],
      });
      (configManager.load as jest.Mock).mockRejectedValue(new Error('Authentication failed'));

      const { PlayerHandler } = await import('../handlers/player.handler');

      const program = createProgramWithPlayer();

      await expect(
        program.parseAsync(['node', 'test', 'player', 'config', 'get', '-c', '123456'])
      ).rejects.toThrow();
    });

    it('[P1] should handle auth error with diagnostics for update', async () => {
      // Mock auth failure with "Authentication" in error message
      (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
        config: { appId: 'test-app-id', appSecret: 'test-app-secret', userId: 'test-user-id' },
        source: 'environment',
      });
      (authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [
          { metadata: { source: 'env' }, type: 'env', appId: 'test', appSecret: 'test' },
        ],
        errors: ['Test error'],
      });
      (configManager.load as jest.Mock).mockRejectedValue(new Error('Authentication failed'));

      const program = createProgramWithPlayer();

      await expect(
        program.parseAsync(['node', 'test', 'player', 'config', 'update', '-c', '123456', '--watermark-enabled', 'Y'])
      ).rejects.toThrow();
    });

    it('[P1] should handle config fallback when auth config incomplete', async () => {
      // Mock auth success
      (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
        config: { appId: 'test-app-id', appSecret: 'test-app-secret', userId: 'test-user-id' },
        source: 'environment',
        accountName: 'test-account',
      });
      // Mock config load failure with specific error message
      (configManager.load as jest.Mock).mockRejectedValue(new Error('Auth configuration is incomplete'));

      const { PlayerHandler } = await import('../handlers/player.handler');
      const mockHandler = {
        getConfig: jest.fn().mockResolvedValue(undefined),
      };
      (PlayerHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithPlayer();
      await program.parseAsync(['node', 'test', 'player', 'config', 'get', '-c', '123456']);

      expect(mockHandler.getConfig).toHaveBeenCalledWith(
        expect.objectContaining({ channelId: '123456' })
      );
    });

    it('[P1] should handle auth result with accountName', async () => {
      const { PlayerHandler } = await import('../handlers/player.handler');
      const mockHandler = {
        getConfig: jest.fn().mockResolvedValue(undefined),
      };
      (PlayerHandler as jest.Mock).mockImplementation(() => mockHandler);

      // Mock auth success with accountName
      (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
        config: { appId: 'test-app-id', appSecret: 'test-app-secret', userId: 'test-user-id' },
        source: 'session',
        accountName: 'test-account',
      });

      const program = createProgramWithPlayer();
      await program.parseAsync(['node', 'test', 'player', 'config', 'get', '-c', '123456']);

      expect(mockHandler.getConfig).toHaveBeenCalledWith(
        expect.objectContaining({ channelId: '123456' })
      );
    });

    it('[P1] should handle config load error without fallback', async () => {
      // Mock auth success
      (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
        config: { appId: 'test-app-id', appSecret: 'test-app-secret', userId: 'test-user-id' },
        source: 'environment',
      });
      // Mock config load failure with non-auth error
      (configManager.load as jest.Mock).mockRejectedValue(new Error('Config file corrupted'));

      const program = createProgramWithPlayer();

      await expect(
        program.parseAsync(['node', 'test', 'player', 'config', 'get', '-c', '123456'])
      ).rejects.toThrow();
    });
  });
});
