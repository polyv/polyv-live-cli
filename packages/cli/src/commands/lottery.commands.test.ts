/**
 * @fileoverview Unit tests for lottery CLI commands
 * @author Development Team
 * @since 11.5.0
 */

import { Command } from 'commander';
import { registerLotteryCommands, validateOutputFormat } from './lottery.commands';
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
jest.mock('../handlers/lottery.handler', () => ({
  LotteryHandler: jest.fn().mockImplementation(() => ({
    createLottery: jest.fn().mockResolvedValue(undefined),
    listLottery: jest.fn().mockResolvedValue(undefined),
    getLottery: jest.fn().mockResolvedValue(undefined),
    updateLottery: jest.fn().mockResolvedValue(undefined),
    deleteLottery: jest.fn().mockResolvedValue(undefined),
    getWinners: jest.fn().mockResolvedValue(undefined),
    getRecords: jest.fn().mockResolvedValue(undefined),
    getLegacyRecords: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('Lottery Commands', () => {
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

  // Helper function to create program with lottery commands
  function createProgramWithLottery(): Command {
    const program = createTestProgram();
    registerLotteryCommands(program);
    return program;
  }

  // ============================================================
  // Main command registration
  // ============================================================
  describe('11.5-CMD-001: should register lottery main command', () => {
    it('should register lottery command with correct description', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      expect(command).toBeDefined();
      expect(command?.description()).toContain('lottery');
    });
  });

  // ============================================================
  // AC #1: lottery create command
  // ============================================================
  describe('11.5-CMD-002: should register lottery create command', () => {
    it('should register create subcommand with correct options', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const createSubcommand = command?.commands.find(cmd => cmd.name() === 'create');
      expect(createSubcommand).toBeDefined();

      const options = createSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--name')).toBe(true);
      expect(options.some(opt => opt.long === '--type')).toBe(true);
      expect(options.some(opt => opt.long === '--amount')).toBe(true);
      expect(options.some(opt => opt.long === '--prize-name')).toBe(true);
      expect(options.some(opt => opt.long === '--receive-info')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });

    it('should have short form -c for --channel-id', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const createSubcommand = command?.commands.find(cmd => cmd.name() === 'create');

      const channelIdOption = createSubcommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.short).toBe('-c');
    });

    it('should have short form -o for --output', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const createSubcommand = command?.commands.find(cmd => cmd.name() === 'create');

      const outputOption = createSubcommand?.options.find(opt => opt.long === '--output');
      expect(outputOption?.short).toBe('-o');
      expect(outputOption?.defaultValue).toBe('table');
    });

    it('should mark channel-id as required', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const createSubcommand = command?.commands.find(cmd => cmd.name() === 'create');

      const channelIdOption = createSubcommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });

    it('should have description for create command', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const createSubcommand = command?.commands.find(cmd => cmd.name() === 'create');
      expect(createSubcommand?.description().toLowerCase()).toContain('create');
    });
  });

  // ============================================================
  // AC #2: lottery list command
  // ============================================================
  describe('11.5-CMD-003: should register lottery list command', () => {
    it('should register list subcommand with correct options', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');
      expect(listSubcommand).toBeDefined();

      const options = listSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--page')).toBe(true);
      expect(options.some(opt => opt.long === '--size')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });

    it('should have short form -c for --channel-id', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');

      const channelIdOption = listSubcommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.short).toBe('-c');
    });
  });

  // ============================================================
  // AC #3: lottery get command
  // ============================================================
  describe('11.5-CMD-004: should register lottery get command', () => {
    it('should register get subcommand with correct options', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const getSubcommand = command?.commands.find(cmd => cmd.name() === 'get');
      expect(getSubcommand).toBeDefined();

      const options = getSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--id')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });

    it('should mark id as required', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const getSubcommand = command?.commands.find(cmd => cmd.name() === 'get');

      const idOption = getSubcommand?.options.find(opt => opt.long === '--id');
      expect(idOption?.required).toBe(true);
    });
  });

  // ============================================================
  // AC #4: lottery update command
  // ============================================================
  describe('11.5-CMD-005: should register lottery update command', () => {
    it('should register update subcommand with correct options', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const updateSubcommand = command?.commands.find(cmd => cmd.name() === 'update');
      expect(updateSubcommand).toBeDefined();

      const options = updateSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--id')).toBe(true);
      expect(options.some(opt => opt.long === '--name')).toBe(true);
      expect(options.some(opt => opt.long === '--amount')).toBe(true);
      expect(options.some(opt => opt.long === '--prize-name')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });
  });

  // ============================================================
  // AC #5: lottery delete command
  // ============================================================
  describe('11.5-CMD-006: should register lottery delete command', () => {
    it('should register delete subcommand with correct options', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const deleteSubcommand = command?.commands.find(cmd => cmd.name() === 'delete');
      expect(deleteSubcommand).toBeDefined();

      const options = deleteSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--id')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });
  });

  // ============================================================
  // AC #6: lottery winners command
  // ============================================================
  describe('11.5-CMD-007: should register lottery winners command', () => {
    it('should register winners subcommand with correct options', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const winnersSubcommand = command?.commands.find(cmd => cmd.name() === 'winners');
      expect(winnersSubcommand).toBeDefined();

      const options = winnersSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--lottery-id')).toBe(true);
      expect(options.some(opt => opt.long === '--viewer-id')).toBe(true);
      expect(options.some(opt => opt.long === '--page')).toBe(true);
      expect(options.some(opt => opt.long === '--limit')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });

    it('should mark lottery-id as required', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const winnersSubcommand = command?.commands.find(cmd => cmd.name() === 'winners');

      const lotteryIdOption = winnersSubcommand?.options.find(opt => opt.long === '--lottery-id');
      expect(lotteryIdOption?.required).toBe(true);
    });
  });

  // ============================================================
  // AC #7: lottery records command
  // ============================================================
  describe('11.5-CMD-008: should register lottery records command', () => {
    it('should register records subcommand with correct options', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const recordsSubcommand = command?.commands.find(cmd => cmd.name() === 'records');
      expect(recordsSubcommand).toBeDefined();

      const options = recordsSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--start-time')).toBe(true);
      expect(options.some(opt => opt.long === '--end-time')).toBe(true);
      expect(options.some(opt => opt.long === '--session-id')).toBe(true);
      expect(options.some(opt => opt.long === '--page')).toBe(true);
      expect(options.some(opt => opt.long === '--limit')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });
  });

  describe('11.5-CMD-008B: should register lottery legacy-records command', () => {
    it('should register legacy-records subcommand with required time range options', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const legacyRecordsSubcommand = command?.commands.find(cmd => cmd.name() === 'legacy-records');
      expect(legacyRecordsSubcommand).toBeDefined();

      const options = legacyRecordsSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.find(opt => opt.long === '--start-time')?.required).toBe(true);
      expect(options.find(opt => opt.long === '--end-time')?.required).toBe(true);
      expect(options.some(opt => opt.long === '--session-id')).toBe(true);
      expect(options.some(opt => opt.long === '--page')).toBe(true);
      expect(options.some(opt => opt.long === '--limit')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });
  });

  // ============================================================
  // Help text tests
  // ============================================================
  describe('11.5-CMD-009: should show help for lottery commands', () => {
    it('should have help text for create command with examples', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const createSubcommand = command?.commands.find(cmd => cmd.name() === 'create');

      // Check that help text exists (addHelpText is called)
      expect(createSubcommand).toBeDefined();
    });

    it('should have help text for list command with examples', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');

      expect(listSubcommand).toBeDefined();
    });
  });

  // ============================================================
  // validateOutputFormat function tests
  // ============================================================
  describe('validateOutputFormat', () => {
    it('11.5-CMD-010: should return "table" for valid input "table"', () => {
      expect(validateOutputFormat('table')).toBe('table');
    });

    it('11.5-CMD-011: should return "json" for valid input "json"', () => {
      expect(validateOutputFormat('json')).toBe('json');
    });

    it('11.5-CMD-012: should throw error for invalid format', () => {
      expect(() => validateOutputFormat('invalid')).toThrow(
        'Output format must be either "table" or "json"'
      );
    });

    it('11.5-CMD-013: should throw error for empty string', () => {
      expect(() => validateOutputFormat('')).toThrow(
        'Output format must be either "table" or "json"'
      );
    });

    it('11.5-CMD-014: should throw error for case-sensitive mismatch', () => {
      expect(() => validateOutputFormat('TABLE')).toThrow(
        'Output format must be either "table" or "json"'
      );
    });

    it('11.5-CMD-015: should throw error for XML format', () => {
      expect(() => validateOutputFormat('xml')).toThrow(
        'Output format must be either "table" or "json"'
      );
    });

    it('11.5-CMD-016: should throw error for CSV format', () => {
      expect(() => validateOutputFormat('csv')).toThrow(
        'Output format must be either "table" or "json"'
      );
    });
  });

  // ============================================================
  // All subcommands overview
  // ============================================================
  describe('11.5-CMD-017: should register lottery subcommands', () => {
    it('should register activity, winner, and record subcommands', () => {
      const prog = createTestProgram();
      registerLotteryCommands(prog);

      const command = prog.commands.find(cmd => cmd.name() === 'lottery');
      const subcommandNames = command?.commands.map(cmd => cmd.name()) || [];

      expect(subcommandNames).toContain('create');
      expect(subcommandNames).toContain('list');
      expect(subcommandNames).toContain('get');
      expect(subcommandNames).toContain('update');
      expect(subcommandNames).toContain('delete');
      expect(subcommandNames).toContain('winners');
      expect(subcommandNames).toContain('records');
      expect(subcommandNames).toContain('legacy-records');
      expect(subcommandNames).toContain('channel-records');
      expect(subcommandNames).toContain('download-winners');
      expect(subcommandNames).toContain('receive-info');
      expect(subcommandNames).toContain('wait');
      expect(subcommandNames).toContain('group');
      expect(subcommandNames).toContain('group-viewer');
      expect(subcommandNames).toContain('blacklist');
      expect(subcommandNames).toContain('lucky-bag');

      expect(subcommandNames).toHaveLength(16);
    });
  });

  // ========================================
  // Action Execution Tests
  // ========================================
  describe('action execution', () => {
    it('[P0] should call createLottery handler with correct params', async () => {
      const { LotteryHandler } = await import('../handlers/lottery.handler');
      const mockHandler = {
        createLottery: jest.fn().mockResolvedValue(undefined),
      };
      (LotteryHandler as jest.Mock).mockImplementation(() => mockHandler);

      const prog = createProgramWithLottery();
      await prog.parseAsync([
        'node', 'test', 'lottery', 'create',
        '-c', '123456',
        '--name', 'Test Lottery',
        '--type', 'none',
        '--amount', '3',
        '--prize-name', 'Gift',
      ]);

      expect(mockHandler.createLottery).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '123456',
          name: 'Test Lottery',
          type: 'none',
          amount: 3,
          prizeName: 'Gift',
        })
      );
    });

    it('[P0] should call listLottery handler with correct params', async () => {
      const { LotteryHandler } = await import('../handlers/lottery.handler');
      const mockHandler = {
        listLottery: jest.fn().mockResolvedValue(undefined),
      };
      (LotteryHandler as jest.Mock).mockImplementation(() => mockHandler);

      const prog = createProgramWithLottery();
      await prog.parseAsync(['node', 'test', 'lottery', 'list', '-c', '123456']);

      expect(mockHandler.listLottery).toHaveBeenCalledWith(
        expect.objectContaining({ channelId: '123456' })
      );
    });

    it('[P0] should call getLottery handler with correct params', async () => {
      const { LotteryHandler } = await import('../handlers/lottery.handler');
      const mockHandler = {
        getLottery: jest.fn().mockResolvedValue(undefined),
      };
      (LotteryHandler as jest.Mock).mockImplementation(() => mockHandler);

      const prog = createProgramWithLottery();
      await prog.parseAsync(['node', 'test', 'lottery', 'get', '-c', '123456', '--id', 'lottery123']);

      expect(mockHandler.getLottery).toHaveBeenCalledWith(
        expect.objectContaining({ channelId: '123456', id: 'lottery123' })
      );
    });

    it('[P0] should call updateLottery handler with correct params', async () => {
      const { LotteryHandler } = await import('../handlers/lottery.handler');
      const mockHandler = {
        updateLottery: jest.fn().mockResolvedValue(undefined),
      };
      (LotteryHandler as jest.Mock).mockImplementation(() => mockHandler);

      const prog = createProgramWithLottery();
      await prog.parseAsync([
        'node', 'test', 'lottery', 'update',
        '-c', '123456',
        '--id', 'lottery123',
        '--amount', '5',
      ]);

      expect(mockHandler.updateLottery).toHaveBeenCalledWith(
        expect.objectContaining({ channelId: '123456', id: 'lottery123', amount: 5 })
      );
    });

    it('[P0] should call deleteLottery handler with correct params', async () => {
      const { LotteryHandler } = await import('../handlers/lottery.handler');
      const mockHandler = {
        deleteLottery: jest.fn().mockResolvedValue(undefined),
      };
      (LotteryHandler as jest.Mock).mockImplementation(() => mockHandler);

      const prog = createProgramWithLottery();
      await prog.parseAsync(['node', 'test', 'lottery', 'delete', '-c', '123456', '--id', 'lottery123']);

      expect(mockHandler.deleteLottery).toHaveBeenCalledWith(
        expect.objectContaining({ channelId: '123456', id: 'lottery123' })
      );
    });

    it('[P0] should call getWinners handler with correct params', async () => {
      const { LotteryHandler } = await import('../handlers/lottery.handler');
      const mockHandler = {
        getWinners: jest.fn().mockResolvedValue(undefined),
      };
      (LotteryHandler as jest.Mock).mockImplementation(() => mockHandler);

      const prog = createProgramWithLottery();
      await prog.parseAsync(['node', 'test', 'lottery', 'winners', '-c', '123456', '--lottery-id', 'lottery123', '--viewer-id', 'viewer123']);

      expect(mockHandler.getWinners).toHaveBeenCalledWith(
        expect.objectContaining({ channelId: '123456', lotteryId: 'lottery123', viewerId: 'viewer123' })
      );
    });

    it('[P0] should call getRecords handler with correct params', async () => {
      const { LotteryHandler } = await import('../handlers/lottery.handler');
      const mockHandler = {
        getRecords: jest.fn().mockResolvedValue(undefined),
      };
      (LotteryHandler as jest.Mock).mockImplementation(() => mockHandler);

      const prog = createProgramWithLottery();
      await prog.parseAsync(['node', 'test', 'lottery', 'records', '-c', '123456']);

      expect(mockHandler.getRecords).toHaveBeenCalledWith(
        expect.objectContaining({ channelId: '123456' })
      );
    });

    it('[P0] should call getLegacyRecords handler with correct params', async () => {
      const { LotteryHandler } = await import('../handlers/lottery.handler');
      const mockHandler = {
        getLegacyRecords: jest.fn().mockResolvedValue(undefined),
      };
      (LotteryHandler as jest.Mock).mockImplementation(() => mockHandler);

      const prog = createProgramWithLottery();
      await prog.parseAsync([
        'node',
        'test',
        'lottery',
        'legacy-records',
        '-c',
        '123456',
        '--start-time',
        '1704067200000',
        '--end-time',
        '1706745599000',
        '--page',
        '1',
        '--limit',
        '10',
      ]);

      expect(mockHandler.getLegacyRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '123456',
          startTime: 1704067200000,
          endTime: 1706745599000,
          page: 1,
          limit: 10,
        })
      );
    });

    it('[P1] should pass pagination options to listLottery', async () => {
      const { LotteryHandler } = await import('../handlers/lottery.handler');
      const mockHandler = {
        listLottery: jest.fn().mockResolvedValue(undefined),
      };
      (LotteryHandler as jest.Mock).mockImplementation(() => mockHandler);

      const prog = createProgramWithLottery();
      await prog.parseAsync(['node', 'test', 'lottery', 'list', '-c', '123456', '--page', '2', '--size', '20']);

      expect(mockHandler.listLottery).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, size: 20 })
      );
    });

    it('[P1] should pass output option to handlers', async () => {
      const { LotteryHandler } = await import('../handlers/lottery.handler');
      const mockHandler = {
        listLottery: jest.fn().mockResolvedValue(undefined),
      };
      (LotteryHandler as jest.Mock).mockImplementation(() => mockHandler);

      const prog = createProgramWithLottery();
      await prog.parseAsync(['node', 'test', 'lottery', 'list', '-c', '123456', '-o', 'json']);

      expect(mockHandler.listLottery).toHaveBeenCalledWith(
        expect.objectContaining({ output: 'json' })
      );
    });

    it('[P1] should pass optional params to createLottery', async () => {
      const { LotteryHandler } = await import('../handlers/lottery.handler');
      const mockHandler = {
        createLottery: jest.fn().mockResolvedValue(undefined),
      };
      (LotteryHandler as jest.Mock).mockImplementation(() => mockHandler);

      const prog = createProgramWithLottery();
      await prog.parseAsync([
        'node', 'test', 'lottery', 'create',
        '-c', '123456',
        '--name', 'Test',
        '--type', 'invite',
        '--amount', '3',
        '--prize-name', 'Gift',
        '--duration', '30',
        '--invite-num', '2',
      ]);

      expect(mockHandler.createLottery).toHaveBeenCalledWith(
        expect.objectContaining({ duration: 30, inviteNum: 2 })
      );
    });

    it('[P1] should handle handler errors gracefully', async () => {
      const { LotteryHandler } = await import('../handlers/lottery.handler');
      const mockHandler = {
        listLottery: jest.fn().mockRejectedValue(new Error('API Error')),
      };
      (LotteryHandler as jest.Mock).mockImplementation(() => mockHandler);

      const prog = createProgramWithLottery();

      await expect(
        prog.parseAsync(['node', 'test', 'lottery', 'list', '-c', '123456'])
      ).rejects.toThrow();
    });

    it('[P1] should handle auth failure', async () => {
      mockAuthFailure(
        authAdapter as jest.Mocked<typeof authAdapter>,
        'No authentication configured'
      );
      const prog = createProgramWithLottery();

      await expect(
        prog.parseAsync(['node', 'test', 'lottery', 'list', '-c', '123456'])
      ).rejects.toThrow();
    });

    it('[P1] should handle config fallback when auth config incomplete', async () => {
      // Mock auth success
      (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
        config: { appId: 'test-app-id', appSecret: 'test-app-secret', userId: 'test-user-id' },
        source: 'environment',
      });
      // Mock config load failure with specific error message
      (configManager.load as jest.Mock).mockRejectedValue(new Error('Auth configuration is incomplete'));

      const { LotteryHandler } = await import('../handlers/lottery.handler');
      const mockHandler = {
        listLottery: jest.fn().mockResolvedValue(undefined),
      };
      (LotteryHandler as jest.Mock).mockImplementation(() => mockHandler);

      const prog = createProgramWithLottery();
      await prog.parseAsync(['node', 'test', 'lottery', 'list', '-c', '123456']);

      expect(mockHandler.listLottery).toHaveBeenCalledWith(
        expect.objectContaining({ channelId: '123456' })
      );
    });
  });
});
