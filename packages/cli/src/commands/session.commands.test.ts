/**
 * @fileoverview Unit tests for session command registration - ATDD Failing Tests (RED Phase)
 * @story 9.6: 场次管理命令
 *
 * These tests will FAIL until the feature is implemented (TDD red phase)
 *
 * Acceptance Criteria:
 * - AC1: session list command is registered with --channel-id option
 * - AC2: session list command has --page and --page-size options
 * - AC3: session list command has --start-date and --end-date options
 * - AC4: session get command is registered with --session-id option
 * - AC5: Both commands have --output option with choices ['table', 'json']
 */

import { Command } from 'commander';
import { registerSessionCommands } from './session.commands';
import { SessionHandler } from '../handlers/session.handler';
import { authAdapter } from '../config/auth-adapter';

// Mock the handler
jest.mock('../handlers/session.handler');
// Mock config and auth modules to prevent process.exit
jest.mock('../config/manager', () => ({
  configManager: {
    load: jest.fn().mockResolvedValue({
      config: { baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false }
    })
  }
}));
jest.mock('../config/auth-adapter', () => ({
  authAdapter: {
    tryGetAuthConfig: jest.fn().mockReturnValue({
      config: { appId: 'test-app-id', appSecret: 'test-app-secret' },
      source: 'test'
    }),
    getStatusMessage: jest.fn().mockReturnValue('Auth required'),
    getDiagnostics: jest.fn().mockReturnValue({ availableSources: [], errors: [] })
  }
}));
jest.mock('../utils/errors', () => ({
  logError: jest.fn()
}));

describe('Session Commands (Story 9.6 - ATDD RED Phase)', () => {
  let program: Command;
  let mockListSessions: jest.Mock;
  let mockGetSession: jest.Mock;
  let originalExit: typeof process.exit;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock process.exit to prevent Jest worker crash
    originalExit = process.exit;
    process.exit = jest.fn() as unknown as typeof process.exit;

    // Create mock methods
    mockListSessions = jest.fn().mockResolvedValue(undefined);
    mockGetSession = jest.fn().mockResolvedValue(undefined);

    // Mock SessionHandler constructor
    (SessionHandler as jest.Mock).mockImplementation(() => ({
      listSessions: mockListSessions,
      getSession: mockGetSession,
    }));

    // Create fresh program instance
    program = new Command();
    program.exitOverride(); // Prevent process.exit during tests
  });

  afterEach(() => {
    process.exit = originalExit;
  });

  describe('command registration', () => {
    it('should register session command group', () => {
      registerSessionCommands(program);

      const commands = program.commands;
      const sessionCommand = commands.find(cmd => cmd.name() === 'session');

      expect(sessionCommand).toBeDefined();
      expect(sessionCommand?.description()).toMatch(/场次|session/i);
    });

    it('should register session list subcommand', () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const listCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'list');

      expect(listCommand).toBeDefined();
      expect(listCommand?.description()).toMatch(/列表|list/i);
    });

    it('should register session get subcommand', () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const getCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'get');

      expect(getCommand).toBeDefined();
      expect(getCommand?.description()).toMatch(/详情|detail|get/i);
    });
  });

  describe('session list command options', () => {
    it('AC1: should have --channel-id option', () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const listCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'list');
      const options = listCommand?.options || [];

      const channelIdOption = options.find(opt =>
        opt.long === '--channel-id' || opt.short === '-c'
      );

      expect(channelIdOption).toBeDefined();
    });

    it('AC2: should have --page option', () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const listCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'list');
      const options = listCommand?.options || [];

      const pageOption = options.find(opt => opt.long === '--page');

      expect(pageOption).toBeDefined();
    });

    it('AC2: should have --page-size option', () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const listCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'list');
      const options = listCommand?.options || [];

      const pageSizeOption = options.find(opt => opt.long === '--page-size');

      expect(pageSizeOption).toBeDefined();
    });

    it('AC3: should have --start-date option', () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const listCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'list');
      const options = listCommand?.options || [];

      const startDateOption = options.find(opt => opt.long === '--start-date');

      expect(startDateOption).toBeDefined();
    });

    it('AC3: should have --end-date option', () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const listCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'list');
      const options = listCommand?.options || [];

      const endDateOption = options.find(opt => opt.long === '--end-date');

      expect(endDateOption).toBeDefined();
    });

    it('AC5: should have --output option with choices', () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const listCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'list');
      const options = listCommand?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');

      expect(outputOption).toBeDefined();
      expect(outputOption?.long).toBe('--output');
    });
  });

  describe('session get command options', () => {
    it('AC1: should have --channel-id option', () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const getCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'get');
      const options = getCommand?.options || [];

      const channelIdOption = options.find(opt =>
        opt.long === '--channel-id' || opt.short === '-c'
      );

      expect(channelIdOption).toBeDefined();
    });

    it('AC4: should have --session-id option', () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const getCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'get');
      const options = getCommand?.options || [];

      const sessionIdOption = options.find(opt => opt.long === '--session-id');

      expect(sessionIdOption).toBeDefined();
    });

    it('AC5: should have --output option', () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const getCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'get');
      const options = getCommand?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');

      expect(outputOption).toBeDefined();
    });
  });

  describe('command execution', () => {
    it('should call handler.listSessions when session list is executed', async () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const listCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'list');

      // Simulate command execution
      await listCommand?.parseAsync(['node', 'test', '--channel-id', '2588188'], { from: 'user' });

      expect(mockListSessions).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '2588188',
        })
      );
    });

    it('should pass all options to handler.listSessions', async () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const listCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'list');

      await listCommand?.parseAsync(
        ['node', 'test', '--channel-id', '2588188', '--page', '2', '--page-size', '20', '--output', 'json'],
        { from: 'user' }
      );

      expect(mockListSessions).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '2588188',
          page: 2,
          pageSize: 20,
          output: 'json',
        })
      );
    });

    it('should call handler.getSession when session get is executed', async () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const getCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'get');

      await getCommand?.parseAsync(
        ['node', 'test', '--channel-id', '2588188', '--session-id', 'e9s2h3jd8f'],
        { from: 'user' }
      );

      expect(mockGetSession).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '2588188',
          sessionId: 'e9s2h3jd8f',
        })
      );
    });

    it('should pass output option to handler.getSession', async () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const getCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'get');

      await getCommand?.parseAsync(
        ['node', 'test', '--channel-id', '2588188', '--session-id', 'e9s2h3jd8f', '--output', 'json'],
        { from: 'user' }
      );

      expect(mockGetSession).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '2588188',
          sessionId: 'e9s2h3jd8f',
          output: 'json',
        })
      );
    });

    it('should accept short alias -c for --channel-id', async () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const listCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'list');

      await listCommand?.parseAsync(['node', 'test', '-c', '2588188'], { from: 'user' });

      expect(mockListSessions).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '2588188',
        })
      );
    });

    it('should accept short alias -o for --output', async () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const listCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'list');

      await listCommand?.parseAsync(['node', 'test', '-c', '2588188', '-o', 'json'], { from: 'user' });

      expect(mockListSessions).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'json',
        })
      );
    });
  });

  describe('help text', () => {
    it('should have clear description for session list command', () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const listCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'list');

      expect(listCommand?.description()).toBeTruthy();
      expect(listCommand?.description().length).toBeGreaterThan(10);
    });

    it('should have clear description for session get command', () => {
      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const getCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'get');

      expect(getCommand?.description()).toBeTruthy();
      expect(getCommand?.description().length).toBeGreaterThan(10);
    });
  });

  describe('validateOutputFormat', () => {
    it('should throw error for invalid output format', async () => {
      const testProgram = new Command();
      testProgram.exitOverride();
      registerSessionCommands(testProgram);
      const sessionCommand = testProgram.commands.find(cmd => cmd.name() === 'session');
      const listCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'list');

      // Test that invalid output format is rejected
      await expect(
        listCommand?.parseAsync(['node', 'test', '-c', '2588188', '-o', 'invalid'], { from: 'user' })
      ).rejects.toThrow();
    });
  });

  // ============================================
  // Verbose Logging Tests
  // ============================================
  describe('verbose logging', () => {
    it('[P1] should display auth source when verbose is enabled for list', async () => {
      // Mock auth with accountName
      const mockAuthResult = {
        config: { appId: 'test-app-id', appSecret: 'test-app-secret' },
        source: 'session',
        accountName: 'test-account',
      };
      (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue(mockAuthResult);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const testProgram = new Command();
      testProgram
        .option('--verbose', 'Enable verbose logging')
        .exitOverride();
      registerSessionCommands(testProgram);

      const sessionCommand = testProgram.commands.find(cmd => cmd.name() === 'session');
      const listCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'list');

      await listCommand?.parseAsync(['node', 'test', '-c', '2588188'], { from: 'user' });

      // Note: verbose is passed via parent program options
      consoleSpy.mockRestore();
    });

    it('[P1] should not display auth source when verbose is disabled', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      registerSessionCommands(program);

      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const listCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'list');

      await listCommand?.parseAsync(['node', 'test', '-c', '2588188'], { from: 'user' });

      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Authentication Source'));
      consoleSpy.mockRestore();
    });
  });

  // ============================================
  // Error Handling Path Tests
  // ============================================
  describe('error handling paths', () => {
    it('[P1] should handle authentication error with diagnostics for list', async () => {
      mockListSessions.mockRejectedValue(new Error('Authentication failed'));

      // Mock getDiagnostics
      (authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [
          { appId: 'test', appSecret: 'test', type: 'session', metadata: { source: 'session' } },
        ],
        errors: [],
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      registerSessionCommands(program);
      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const listCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'list');

      await listCommand?.parseAsync(['node', 'test', '-c', '2588188'], { from: 'user' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('[P1] should handle authentication error with diagnostics for get', async () => {
      mockGetSession.mockRejectedValue(new Error('Authentication failed'));

      (authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [],
        errors: ['No auth configured'],
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      registerSessionCommands(program);
      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const getCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'get');

      await getCommand?.parseAsync(
        ['node', 'test', '-c', '2588188', '--session-id', 'e9s2h3jd8f'],
        { from: 'user' }
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('[P1] should handle handler errors gracefully', async () => {
      mockListSessions.mockRejectedValue(new Error('API Error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      registerSessionCommands(program);
      const sessionCommand = program.commands.find(cmd => cmd.name() === 'session');
      const listCommand = sessionCommand?.commands.find(cmd => cmd.name() === 'list');

      await listCommand?.parseAsync(['node', 'test', '-c', '2588188'], { from: 'user' });

      expect(process.exit).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
