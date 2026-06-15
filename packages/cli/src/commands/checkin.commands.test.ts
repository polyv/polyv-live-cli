/**
 * @fileoverview Unit tests for checkin CLI commands
 * @author Development Team
 * @since 11.3.0
 */

import { Command } from 'commander';
import { registerCheckinCommands, validateOutputFormat } from './checkin.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';

// Mock dependencies
jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/checkin.handler', () => ({
  CheckinHandler: jest.fn().mockImplementation(() => ({
    startCheckin: jest.fn().mockResolvedValue(undefined),
    listCheckins: jest.fn().mockResolvedValue(undefined),
    getCheckinResult: jest.fn().mockResolvedValue(undefined),
    getCheckinSessions: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('Checkin Commands Registration', () => {
  let program: Command;
  let mockAction: jest.Mock;

  beforeEach(() => {
    program = new Command();
    mockAction = jest.fn();
    jest.clearAllMocks();

    // Setup auth mocks
    (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
      config: { appId: 'test-app-id', appSecret: 'test-app-secret', userId: 'test-user-id' },
      source: 'environment',
    });
    (configManager.load as jest.Mock).mockResolvedValue({
      config: { baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false },
    });
  });

  describe('11.3-UNIT-035: should register checkin start command', () => {
    it('should register checkin start command with correct options', () => {
      registerCheckinCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'checkin');
      expect(command).toBeDefined();

      const startSubcommand = command?.commands.find(cmd => cmd.name() === 'start');
      expect(startSubcommand).toBeDefined();

      const options = startSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--limit-time')).toBe(true);
      expect(options.some(opt => opt.long === '--delay-time')).toBe(true);
      expect(options.some(opt => opt.long === '--message')).toBe(true);
      expect(options.some(opt => opt.long === '--force')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });
  });

  describe('11.3-UNIT-036: should register checkin list command', () => {
    it('should register checkin list command with correct options', () => {
      registerCheckinCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'checkin');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');
      expect(listSubcommand).toBeDefined();

      const options = listSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--page')).toBe(true);
      expect(options.some(opt => opt.long === '--size')).toBe(true);
      expect(options.some(opt => opt.long === '--date')).toBe(true);
      expect(options.some(opt => opt.long === '--session-id')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });
  });

  describe('11.3-UNIT-037: should register checkin result command', () => {
    it('should register checkin result command with correct options', () => {
      registerCheckinCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'checkin');
      const resultSubcommand = command?.commands.find(cmd => cmd.name() === 'result');
      expect(resultSubcommand).toBeDefined();

      const options = resultSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--checkin-id')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });
  });

  describe('11.3-UNIT-038: should register checkin sessions command', () => {
    it('should register checkin sessions command with correct options', () => {
      registerCheckinCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'checkin');
      const sessionsSubcommand = command?.commands.find(cmd => cmd.name() === 'sessions');
      expect(sessionsSubcommand).toBeDefined();

      const options = sessionsSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--start-date')).toBe(true);
      expect(options.some(opt => opt.long === '--end-date')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });
  });

  describe('11.3-UNIT-039: should parse --channel-id option correctly', () => {
    it('should parse --channel-id option with short form -c', () => {
      registerCheckinCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'checkin');
      const startSubcommand = command?.commands.find(cmd => cmd.name() === 'start');

      const channelIdOption = startSubcommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.short).toBe('-c');
    });
  });

  describe('11.3-UNIT-040: should parse --output option (table/json)', () => {
    it('should have --output option with short form -o', () => {
      registerCheckinCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'checkin');
      const startSubcommand = command?.commands.find(cmd => cmd.name() === 'start');

      const outputOption = startSubcommand?.options.find(opt => opt.long === '--output');
      expect(outputOption?.short).toBe('-o');
      expect(outputOption?.defaultValue).toBe('table');
    });
  });

  describe('11.3-UNIT-041: should show help for checkin start command', () => {
    it('should have description for checkin start command', () => {
      registerCheckinCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'checkin');
      const startSubcommand = command?.commands.find(cmd => cmd.name() === 'start');
      expect(startSubcommand?.description().toLowerCase()).toContain('start');
    });
  });

  describe('11.3-UNIT-042: should show help for checkin list command', () => {
    it('should have description for checkin list command', () => {
      registerCheckinCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'checkin');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');
      expect(listSubcommand?.description().toLowerCase()).toContain('list');
    });
  });

  describe('11.3-UNIT-043: should show help for checkin result command', () => {
    it('should have description for checkin result command', () => {
      registerCheckinCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'checkin');
      const resultSubcommand = command?.commands.find(cmd => cmd.name() === 'result');
      expect(resultSubcommand?.description().toLowerCase()).toContain('result');
    });
  });

  describe('11.3-UNIT-044: should show help for checkin sessions command', () => {
    it('should have description for checkin sessions command', () => {
      registerCheckinCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'checkin');
      const sessionsSubcommand = command?.commands.find(cmd => cmd.name() === 'sessions');
      expect(sessionsSubcommand?.description().toLowerCase()).toContain('sessions');
    });
  });

  // Tests for validateOutputFormat function
  describe('validateOutputFormat', () => {
    it('should return "table" for valid input "table"', () => {
      expect(validateOutputFormat('table')).toBe('table');
    });

    it('should return "json" for valid input "json"', () => {
      expect(validateOutputFormat('json')).toBe('json');
    });

    it('should throw error for invalid format', () => {
      expect(() => validateOutputFormat('invalid')).toThrow('Output format must be either "table" or "json"');
    });

    it('should throw error for empty string', () => {
      expect(() => validateOutputFormat('')).toThrow('Output format must be either "table" or "json"');
    });

    it('should throw error for case-sensitive mismatch', () => {
      expect(() => validateOutputFormat('TABLE')).toThrow('Output format must be either "table" or "json"');
    });

    it('should throw error for XML format', () => {
      expect(() => validateOutputFormat('xml')).toThrow('Output format must be either "table" or "json"');
    });

    it('should throw error for YAML format', () => {
      expect(() => validateOutputFormat('yaml')).toThrow('Output format must be either "table" or "json"');
    });

    it('should throw error for CSV format', () => {
      expect(() => validateOutputFormat('csv')).toThrow('Output format must be either "table" or "json"');
    });
  });

  // ========================================
  // Action Execution Tests
  // ========================================
  describe('action execution', () => {
    it('[P0] should call startCheckin handler with correct params', async () => {
      const { CheckinHandler } = await import('../handlers/checkin.handler');
      const mockHandler = {
        startCheckin: jest.fn().mockResolvedValue(undefined),
      };
      (CheckinHandler as jest.Mock).mockImplementation(() => mockHandler);

      program = new Command();
      registerCheckinCommands(program);
      await program.parseAsync(['node', 'test', 'checkin', 'start', '-c', '123456']);

      expect(mockHandler.startCheckin).toHaveBeenCalledWith(
        expect.objectContaining({ channelId: '123456' })
      );
    });

    it('[P0] should call listCheckins handler with correct params', async () => {
      const { CheckinHandler } = await import('../handlers/checkin.handler');
      const mockHandler = {
        listCheckins: jest.fn().mockResolvedValue(undefined),
      };
      (CheckinHandler as jest.Mock).mockImplementation(() => mockHandler);

      program = new Command();
      registerCheckinCommands(program);
      await program.parseAsync(['node', 'test', 'checkin', 'list', '-c', '123456']);

      expect(mockHandler.listCheckins).toHaveBeenCalledWith(
        expect.objectContaining({ channelId: '123456' })
      );
    });

    it('[P0] should call getCheckinResult handler with correct params', async () => {
      const { CheckinHandler } = await import('../handlers/checkin.handler');
      const mockHandler = {
        getCheckinResult: jest.fn().mockResolvedValue(undefined),
      };
      (CheckinHandler as jest.Mock).mockImplementation(() => mockHandler);

      program = new Command();
      registerCheckinCommands(program);
      await program.parseAsync(['node', 'test', 'checkin', 'result', '-c', '123456', '--checkin-id', 'ck789']);

      expect(mockHandler.getCheckinResult).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '123456',
          checkinId: 'ck789',
        })
      );
    });

    it('[P0] should call listSessions handler with correct params', async () => {
      const { CheckinHandler } = await import('../handlers/checkin.handler');
      const mockHandler = {
        listSessions: jest.fn().mockResolvedValue(undefined),
      };
      (CheckinHandler as jest.Mock).mockImplementation(() => mockHandler);

      program = new Command();
      registerCheckinCommands(program);
      await program.parseAsync(['node', 'test', 'checkin', 'sessions', '-c', '123456']);

      expect(mockHandler.listSessions).toHaveBeenCalledWith(
        expect.objectContaining({ channelId: '123456' })
      );
    });

    it('[P1] should pass limitTime option to startCheckin', async () => {
      const { CheckinHandler } = await import('../handlers/checkin.handler');
      const mockHandler = {
        startCheckin: jest.fn().mockResolvedValue(undefined),
      };
      (CheckinHandler as jest.Mock).mockImplementation(() => mockHandler);

      program = new Command();
      registerCheckinCommands(program);
      await program.parseAsync(['node', 'test', 'checkin', 'start', '-c', '123456', '--limit-time', '60']);

      expect(mockHandler.startCheckin).toHaveBeenCalledWith(
        expect.objectContaining({ limitTime: 60 })
      );
    });

    it('[P1] should pass pagination options to listCheckins', async () => {
      const { CheckinHandler } = await import('../handlers/checkin.handler');
      const mockHandler = {
        listCheckins: jest.fn().mockResolvedValue(undefined),
      };
      (CheckinHandler as jest.Mock).mockImplementation(() => mockHandler);

      program = new Command();
      registerCheckinCommands(program);
      await program.parseAsync(['node', 'test', 'checkin', 'list', '-c', '123456', '--page', '2', '--size', '20']);

      expect(mockHandler.listCheckins).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          size: 20,
        })
      );
    });

    it('[P1] should pass output option to handlers', async () => {
      const { CheckinHandler } = await import('../handlers/checkin.handler');
      const mockHandler = {
        startCheckin: jest.fn().mockResolvedValue(undefined),
      };
      (CheckinHandler as jest.Mock).mockImplementation(() => mockHandler);

      program = new Command();
      registerCheckinCommands(program);
      await program.parseAsync(['node', 'test', 'checkin', 'start', '-c', '123456', '-o', 'json']);

      expect(mockHandler.startCheckin).toHaveBeenCalledWith(
        expect.objectContaining({ output: 'json' })
      );
    });

    it('[P1] should handle auth failure', async () => {
      (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue(null);
      (authAdapter.getStatusMessage as jest.Mock).mockReturnValue('No authentication configured');

      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });

      const program = new Command();
      program.exitOverride();
      registerCheckinCommands(program);

      await expect(
        program.parseAsync(['node', 'test', 'checkin', 'start', '-c', '123456'])
      ).rejects.toThrow();

      exitSpy.mockRestore();
    });

    it('[P1] should handle handler errors gracefully', async () => {
      const { CheckinHandler } = await import('../handlers/checkin.handler');
      const mockHandler = {
        startCheckin: jest.fn().mockRejectedValue(new Error('API Error')),
      };
      (CheckinHandler as jest.Mock).mockImplementation(() => mockHandler);

      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });

      const program = new Command();
      program.exitOverride();
      registerCheckinCommands(program);

      await expect(
        program.parseAsync(['node', 'test', 'checkin', 'start', '-c', '123456'])
      ).rejects.toThrow();

      exitSpy.mockRestore();
    });
  });
});
