/**
 * Unit tests for use commands
 * Tests use command registration and handler integration
 */

import { Command } from 'commander';
import { registerUseCommand, handleUse } from './use.commands';

// Import fail function for tests
const fail = (message?: string) => {
  throw new Error(message || 'Test failed');
};

// Mock dependencies
jest.mock('../handlers/use.handler');

// Mock UseHandler
const mockUseHandler = {
  handleUseClear: jest.fn(),
  handleUseStatus: jest.fn(),
  handleUseList: jest.fn(),
  handleCleanup: jest.fn(),
  handleUse: jest.fn()
};

// Mock UseHandler constructor
jest.mock('../handlers/use.handler', () => ({
  UseHandler: jest.fn().mockImplementation(() => mockUseHandler)
}));

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation()
};

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
  throw new Error(`process.exit() was called with code ${code}`);
});

describe('Use Commands', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Don't restore mocks here to prevent actual process.exit calls
  });

  afterAll(() => {
    // Restore mocks after all tests are done
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
    mockExit.mockRestore();
  });

  describe('registerUseCommand', () => {
    it('should register use command with correct configuration', () => {
      registerUseCommand(program);
      
      const useCommand = program.commands.find(cmd => cmd.name() === 'use');
      expect(useCommand).toBeDefined();
      expect(useCommand?.description()).toBe('管理当前终端会话的账号设置');
      
      // Check options
      const options = useCommand?.options;
      expect(options?.some(opt => opt.long === '--clear')).toBe(true);
      expect(options?.some(opt => opt.long === '--status')).toBe(true);
      expect(options?.some(opt => opt.long === '--list')).toBe(true);
      expect(options?.some(opt => opt.long === '--cleanup')).toBe(true);
    });
  });

  describe('handleUse function', () => {
    let useCommand: Command;

    beforeEach(() => {
      registerUseCommand(program);
      useCommand = program.commands.find(cmd => cmd.name() === 'use')!;
    });

    it('should handle --clear option', async () => {
      mockUseHandler.handleUseClear.mockResolvedValue('Session cleared successfully');
      
      // Simulate command execution with --clear flag
      await expect(async () => {
        await useCommand.parseAsync(['node', 'test', 'use', '--clear'], { from: 'user' });
      }).not.toThrow();

      expect(mockUseHandler.handleUseClear).toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalledWith('Session cleared successfully');
    });

    it('should handle --status option', async () => {
      mockUseHandler.handleUseStatus.mockResolvedValue('Current session status');
      
      await expect(async () => {
        await useCommand.parseAsync(['node', 'test', 'use', '--status'], { from: 'user' });
      }).not.toThrow();

      expect(mockUseHandler.handleUseStatus).toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalledWith('Current session status');
    });

    it('should handle --list option', async () => {
      mockUseHandler.handleUseList.mockResolvedValue('Available accounts list');
      
      await expect(async () => {
        await useCommand.parseAsync(['node', 'test', 'use', '--list'], { from: 'user' });
      }).not.toThrow();

      expect(mockUseHandler.handleUseList).toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalledWith('Available accounts list');
    });

    it('should handle --cleanup option', async () => {
      mockUseHandler.handleCleanup.mockResolvedValue('Cleanup completed');
      
      await expect(async () => {
        await useCommand.parseAsync(['node', 'test', 'use', '--cleanup'], { from: 'user' });
      }).not.toThrow();

      expect(mockUseHandler.handleCleanup).toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalledWith('Cleanup completed');
    });

    it('should handle account switching with valid account name', async () => {
      mockUseHandler.handleUse.mockResolvedValue('Switched to account: test-account');
      
      // Test by directly calling handleUse function
      await handleUse('test-account', {});

      expect(mockUseHandler.handleUse).toHaveBeenCalledWith('test-account');
      expect(consoleSpy.log).toHaveBeenCalledWith('Switched to account: test-account');
    });

    it('should exit with error when no account name provided', async () => {
      try {
        // Test handleUse function directly with empty account name
        await handleUse('', {});
        fail('Expected handleUse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('process.exit() was called with code 1');
      }

      expect(consoleSpy.error).toHaveBeenCalledWith('错误: 请指定要切换到的账号名称');
      expect(consoleSpy.log).toHaveBeenCalledWith('使用 \'polyv-live-cli use --list\' 查看可用账号');
      expect(consoleSpy.log).toHaveBeenCalledWith('使用 \'polyv-live-cli use --help\' 查看帮助信息');
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle UseHandler errors', async () => {
      const testError = new Error('Handler error');
      mockUseHandler.handleUse.mockRejectedValue(testError);
      
      try {
        await useCommand.parseAsync(['node', 'test', 'use', 'test-account'], { from: 'user' });
        fail('Expected parseAsync to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('process.exit() was called with code 1');
      }

      expect(consoleSpy.error).toHaveBeenCalledWith('Handler error');
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle unknown errors', async () => {
      mockUseHandler.handleUse.mockRejectedValue('String error');
      
      try {
        await useCommand.parseAsync(['node', 'test', 'use', 'test-account'], { from: 'user' });
        fail('Expected parseAsync to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('process.exit() was called with code 1');
      }

      expect(consoleSpy.error).toHaveBeenCalledWith('未知错误');
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle error from clear option', async () => {
      const testError = new Error('Clear error');
      mockUseHandler.handleUseClear.mockRejectedValue(testError);
      
      try {
        await useCommand.parseAsync(['node', 'test', 'use', '--clear'], { from: 'user' });
        fail('Expected parseAsync to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('process.exit() was called with code 1');
      }

      expect(consoleSpy.error).toHaveBeenCalledWith('Clear error');
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle error from status option', async () => {
      const testError = new Error('Status error');
      mockUseHandler.handleUseStatus.mockRejectedValue(testError);
      
      try {
        await useCommand.parseAsync(['node', 'test', 'use', '--status'], { from: 'user' });
        fail('Expected parseAsync to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('process.exit() was called with code 1');
      }

      expect(consoleSpy.error).toHaveBeenCalledWith('Status error');
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle error from list option', async () => {
      const testError = new Error('List error');
      mockUseHandler.handleUseList.mockRejectedValue(testError);
      
      try {
        await useCommand.parseAsync(['node', 'test', 'use', '--list'], { from: 'user' });
        fail('Expected parseAsync to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('process.exit() was called with code 1');
      }

      expect(consoleSpy.error).toHaveBeenCalledWith('List error');
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle error from cleanup option', async () => {
      const testError = new Error('Cleanup error');
      mockUseHandler.handleCleanup.mockRejectedValue(testError);
      
      try {
        await useCommand.parseAsync(['node', 'test', 'use', '--cleanup'], { from: 'user' });
        fail('Expected parseAsync to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('process.exit() was called with code 1');
      }

      expect(consoleSpy.error).toHaveBeenCalledWith('Cleanup error');
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
});