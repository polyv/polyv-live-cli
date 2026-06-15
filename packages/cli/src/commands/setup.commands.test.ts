/**
 * @fileoverview Unit tests for setup commands
 * Uses test-helpers for auth mocking
 */

import { Command } from 'commander';
import { registerSetupCommand, validateOutputFormat } from './setup.commands';
import { SetupHandler } from '../handlers/setup.handler';
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
jest.mock('../handlers/setup.handler');

describe('setup commands', () => {
  let restoreConsole: () => void;
  let restoreExit: () => void;
  let mockSetupHandler: jest.Mocked<SetupHandler>;

  beforeEach(() => {
    restoreConsole = suppressConsole();
    restoreExit = mockProcessExit();

    // Setup auth mocks
    mockAuthSuccess(
      authAdapter as jest.Mocked<typeof authAdapter>,
      configManager as jest.Mocked<typeof configManager>
    );

    // Create mock handler
    mockSetupHandler = {
      setup: jest.fn().mockResolvedValue(undefined),
      listScenes: jest.fn().mockResolvedValue({
        builtin: [{ name: 'e-commerce', description: '电商场景', icon: '🛒' }],
        user: [],
      }),
      listScenesDetailed: jest.fn().mockResolvedValue({
        scenes: [{ name: 'e-commerce', description: '电商场景', resources: [] }],
      }),
    } as any;

    (SetupHandler as jest.Mock).mockImplementation(() => mockSetupHandler);
  });

  afterEach(() => {
    restoreConsole();
    restoreExit();
    jest.clearAllMocks();
  });

  // Helper function to create program and register command
  function createProgramWithSetup(): Command {
    const program = createTestProgram();
    registerSetupCommand(program);
    return program;
  }

  // ========================================
  // Command Registration Tests
  // ========================================
  describe('command registration', () => {
    it('[P0] should register setup command', () => {
      const program = createProgramWithSetup();

      const setupCmd = program.commands.find(cmd => cmd.name() === 'setup');
      expect(setupCmd).toBeDefined();
      expect(setupCmd?.description()).toContain('Initialize');
    });

    it('[P0] should register --list option', () => {
      const program = createProgramWithSetup();

      const setupCmd = program.commands.find(cmd => cmd.name() === 'setup');
      const listOption = setupCmd?.options.find(opt => opt.long === '--list');
      expect(listOption).toBeDefined();
    });

    it('[P0] should register --output option', () => {
      const program = createProgramWithSetup();

      const setupCmd = program.commands.find(cmd => cmd.name() === 'setup');
      const outputOption = setupCmd?.options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    it('[P1] should register --dry-run option', () => {
      const program = createProgramWithSetup();

      const setupCmd = program.commands.find(cmd => cmd.name() === 'setup');
      const dryRunOption = setupCmd?.options.find(opt => opt.long === '--dry-run');
      expect(dryRunOption).toBeDefined();
    });

    it('[P1] should register --detailed option', () => {
      const program = createProgramWithSetup();

      const setupCmd = program.commands.find(cmd => cmd.name() === 'setup');
      const detailedOption = setupCmd?.options.find(opt => opt.long === '--detailed');
      expect(detailedOption).toBeDefined();
    });
  });

  // ========================================
  // setup <scene> - Action Tests
  // ========================================
  describe('setup <scene>', () => {
    it('[P0] should call handler.setup with correct scene name', async () => {
      const program = createProgramWithSetup();

      await program.parseAsync(['node', 'test', 'setup', 'e-commerce']);

      expect(mockSetupHandler.setup).toHaveBeenCalledWith(
        expect.objectContaining({ scene: 'e-commerce' })
      );
    });

    it('[P0] should accept output option', async () => {
      const program = createProgramWithSetup();

      await program.parseAsync(['node', 'test', 'setup', 'e-commerce', '--output', 'json']);

      expect(mockSetupHandler.setup).toHaveBeenCalledWith(
        expect.objectContaining({ output: 'json' })
      );
    });

    it('[P1] should pass dryRun option to handler', async () => {
      const program = createProgramWithSetup();

      await program.parseAsync(['node', 'test', 'setup', 'e-commerce', '--dry-run']);

      expect(mockSetupHandler.setup).toHaveBeenCalledWith(
        expect.objectContaining({ dryRun: true })
      );
    });

    it('[P1] should use default output format (table)', async () => {
      const program = createProgramWithSetup();

      await program.parseAsync(['node', 'test', 'setup', 'e-commerce']);

      expect(mockSetupHandler.setup).toHaveBeenCalledWith(
        expect.objectContaining({ output: 'table' })
      );
    });

    it('[P1] should use default dryRun (false)', async () => {
      const program = createProgramWithSetup();

      await program.parseAsync(['node', 'test', 'setup', 'e-commerce']);

      expect(mockSetupHandler.setup).toHaveBeenCalledWith(
        expect.objectContaining({ dryRun: false })
      );
    });
  });

  // ========================================
  // setup --list - Action Tests
  // ========================================
  describe('setup --list', () => {
    it('[P0] should call listScenes handler when --list is provided', async () => {
      const program = createProgramWithSetup();

      await program.parseAsync(['node', 'test', 'setup', '--list']);

      expect(mockSetupHandler.listScenes).toHaveBeenCalled();
      expect(mockSetupHandler.setup).not.toHaveBeenCalled();
    });

    it('[P1] should call listScenesDetailed when --list --detailed is provided', async () => {
      const program = createProgramWithSetup();

      await program.parseAsync(['node', 'test', 'setup', '--list', '--detailed']);

      expect(mockSetupHandler.listScenesDetailed).toHaveBeenCalled();
      expect(mockSetupHandler.listScenes).not.toHaveBeenCalled();
    });

    it('[P1] should pass output option to listScenes', async () => {
      const program = createProgramWithSetup();

      await program.parseAsync(['node', 'test', 'setup', '--list', '--output', 'json']);

      expect(mockSetupHandler.listScenes).toHaveBeenCalledWith(
        expect.objectContaining({ output: 'json' })
      );
    });
  });

  // ========================================
  // Error Handling Tests
  // ========================================
  describe('error handling', () => {
    it('[P0] should handle setup failure gracefully', async () => {
      mockSetupHandler.setup.mockRejectedValue(new Error('Scene not found'));
      const program = createProgramWithSetup();

      // Should throw due to process.exit mock
      await expect(
        program.parseAsync(['node', 'test', 'setup', 'nonexistent'])
      ).rejects.toThrow();
    });

    it('[P1] should handle auth failure', async () => {
      mockAuthFailure(
        authAdapter as jest.Mocked<typeof authAdapter>,
        'No authentication configured'
      );
      const program = createProgramWithSetup();

      await expect(
        program.parseAsync(['node', 'test', 'setup', 'e-commerce'])
      ).rejects.toThrow();
    });

    it('[P1] should require scene name when not using --list', async () => {
      const program = createProgramWithSetup();

      // Should exit with error when no scene provided
      await expect(
        program.parseAsync(['node', 'test', 'setup'])
      ).rejects.toThrow();
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
      expect(() => validateOutputFormat('xml')).toThrow('Invalid output format');
    });

    it('[P1] should reject empty string', () => {
      expect(() => validateOutputFormat('')).toThrow('Invalid output format');
    });
  });

  // ========================================
  // Help Text Tests
  // ========================================
  describe('help text', () => {
    it('[P1] should show help for setup command', () => {
      const program = createProgramWithSetup();

      const setupCmd = program.commands.find(cmd => cmd.name() === 'setup');
      expect(setupCmd?.description()).toContain('Initialize');
    });

    it('[P1] should show help for list option', () => {
      const program = createProgramWithSetup();

      const setupCmd = program.commands.find(cmd => cmd.name() === 'setup');
      const listOption = setupCmd?.options.find(opt => opt.long === '--list');
      expect(listOption?.description).toContain('List');
    });
  });
});
