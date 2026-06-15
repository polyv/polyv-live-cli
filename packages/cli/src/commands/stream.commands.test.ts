/**
 * @fileoverview Unit tests for stream commands
 * @author Development Team
 * @since 3.1.0
 */

import { Command } from 'commander';
import { registerStreamCommands } from './stream.commands';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { StreamHandler } from '../handlers/stream.handler';
import { StreamServiceSdk } from '../services/stream.service.sdk';
import { logError } from '../utils/errors';
import { ConfigResult } from '../types/config';

// Mock dependencies
jest.mock('../config/manager');
jest.mock('../config/auth-adapter');
jest.mock('../handlers/stream.handler');
jest.mock('../services/stream.service.sdk');
jest.mock('../utils/errors');

const mockConfigManager = configManager as jest.Mocked<typeof configManager>;
const mockAuthAdapter = authAdapter as jest.Mocked<typeof authAdapter>;
const MockStreamServiceSdk = StreamServiceSdk as jest.MockedClass<typeof StreamServiceSdk>;
const MockStreamHandler = StreamHandler as jest.MockedClass<typeof StreamHandler>;

describe('Stream Commands', () => {
  let program: Command;
  let mockStreamService: jest.Mocked<StreamServiceSdk>;
  let mockStreamHandler: jest.Mocked<StreamHandler>;
  let consoleSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    program = new Command();

    // Mock StreamServiceSdk instance
    mockStreamService = {
      getStreamKey: jest.fn()
    } as any;
    MockStreamServiceSdk.mockImplementation(() => mockStreamService);

    // Mock StreamHandler instance
    mockStreamHandler = {
      getStreamKey: jest.fn(),
      startStream: jest.fn(),
      stopStream: jest.fn(),
      getStreamStatus: jest.fn(),
      pushStream: jest.fn(),
      verifyStream: jest.fn(),
      monitorStream: jest.fn()
    } as any;
    MockStreamHandler.mockImplementation(() => mockStreamHandler);

    // Mock console and process
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    // Setup default authAdapter mock
    mockAuthAdapter.tryGetAuthConfig.mockReturnValue({
      config: {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id'
      },
      source: 'Command Line',
      accountName: 'test-account'
    });

    mockAuthAdapter.getDiagnostics.mockReturnValue({
      availableSources: [],
      selectedSource: undefined,
      errors: [],
      warnings: [],
      suggestions: []
    });

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('registerStreamCommands', () => {
    it('should register stream command group', () => {
      registerStreamCommands(program);

      const streamCommand = program.commands.find(cmd => cmd.name() === 'stream');
      expect(streamCommand).toBeDefined();
      expect(streamCommand?.description()).toBe('Manage live streaming operations');
    });

    it('should register get-key subcommand with correct options', () => {
      registerStreamCommands(program);

      const streamCommand = program.commands.find(cmd => cmd.name() === 'stream');
      const getKeyCommand = streamCommand?.commands.find(cmd => cmd.name() === 'get-key');
      
      expect(getKeyCommand).toBeDefined();
      expect(getKeyCommand?.description()).toBe('Get RTMP URL and stream key for a live channel');
      
      // Check required option
      const channelIdOption = getKeyCommand?.options.find(opt => opt.long === '--channelId');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
      
      // Check optional output option
      const outputOption = getKeyCommand?.options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
      expect(outputOption?.defaultValue).toBe('table');
    });

    it('should add help text to get-key command', () => {
      registerStreamCommands(program);

      const streamCommand = program.commands.find(cmd => cmd.name() === 'stream');
      const getKeyCommand = streamCommand?.commands.find(cmd => cmd.name() === 'get-key');
      
      expect(getKeyCommand).toBeDefined();
      
      // Verify command has the basic structure (help text is added but not accessible via helpInformation)
      expect(getKeyCommand?.description()).toBe('Get RTMP URL and stream key for a live channel');
      expect(getKeyCommand?.options.length).toBeGreaterThan(0);
      
      // Verify that the command has been properly configured
      const helpText = getKeyCommand?.helpInformation();
      expect(helpText).toContain('Get RTMP URL and stream key for a live channel');
      expect(helpText).toContain('--channelId');
      expect(helpText).toContain('--output');
    });

    it('should execute get-key command successfully', async () => {
      // Mock successful configuration load
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: {
          environment: 'default',
          debug: 'default',
          timeout: 'default',
          baseUrl: 'default',
          maxRetries: 'default'
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          missingFields: []
        },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);
      mockStreamHandler.getStreamKey.mockResolvedValue();

      registerStreamCommands(program);

      // Simulate command execution
      await program.parseAsync(['node', 'test', 'stream', 'get-key', '--channelId', '3151318']);

      expect(mockConfigManager.load).toHaveBeenCalledWith({
        cliOptions: expect.any(Object)
      });
      expect(MockStreamHandler).toHaveBeenCalledWith(
        mockConfig.config.auth,
        {
          baseUrl: mockConfig.config.baseUrl,
          timeout: mockConfig.config.timeout,
          debug: mockConfig.config.debug
        }
      );
      expect(mockStreamHandler.getStreamKey).toHaveBeenCalledWith({
        channelId: '3151318',
        output: 'table'
      });
    });

    it('should execute get-key command with JSON output', async () => {
      // Mock successful configuration load
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: {
          environment: 'default',
          debug: 'default',
          timeout: 'default',
          baseUrl: 'default',
          maxRetries: 'default'
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          missingFields: []
        },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);
      mockStreamHandler.getStreamKey.mockResolvedValue();

      registerStreamCommands(program);

      // Simulate command execution with JSON output
      await program.parseAsync(['node', 'test', 'stream', 'get-key', '--channelId', '3151318', '--output', 'json']);

      expect(mockStreamHandler.getStreamKey).toHaveBeenCalledWith({
        channelId: '3151318',
        output: 'json'
      });
    });

    it('should handle configuration loading errors', async () => {
      const configError = new Error('Configuration loading failed');
      mockConfigManager.load.mockRejectedValue(configError);

      registerStreamCommands(program);

      // Simulate command execution that will fail
      await program.parseAsync(['node', 'test', 'stream', 'get-key', '--channelId', '3151318']);

      expect(logError).toHaveBeenCalledWith(configError);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle stream handler execution errors', async () => {
      // Mock successful configuration load
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: {
          environment: 'default',
          debug: 'default',
          timeout: 'default',
          baseUrl: 'default',
          maxRetries: 'default'
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          missingFields: []
        },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);

      const handlerError = new Error('Stream handler execution failed');
      mockStreamHandler.getStreamKey.mockRejectedValue(handlerError);

      registerStreamCommands(program);

      // Simulate command execution that will fail
      await program.parseAsync(['node', 'test', 'stream', 'get-key', '--channelId', '3151318']);

      expect(logError).toHaveBeenCalledWith(handlerError);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle non-Error exceptions', async () => {
      // Mock successful configuration load
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: {
          environment: 'default',
          debug: 'default',
          timeout: 'default',
          baseUrl: 'default',
          maxRetries: 'default'
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          missingFields: []
        },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);

      const stringError = 'String error message';
      mockStreamHandler.getStreamKey.mockRejectedValue(stringError);

      registerStreamCommands(program);

      // Simulate command execution that will fail
      await program.parseAsync(['node', 'test', 'stream', 'get-key', '--channelId', '3151318']);

      expect(logError).toHaveBeenCalledWith(new Error('String error message'));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should validate output format correctly', async () => {
      registerStreamCommands(program);

      // Test valid output format
      try {
        await program.parseAsync(['node', 'test', 'stream', 'get-key', '--channelId', '3151318', '--output', 'table']);
        // Should not throw
      } catch (error) {
        // If it throws, it should not be about output format validation
        expect(error).not.toMatch(/Invalid output format/);
      }

      try {
        await program.parseAsync(['node', 'test', 'stream', 'get-key', '--channelId', '3151318', '--output', 'json']);
        // Should not throw
      } catch (error) {
        // If it throws, it should not be about output format validation
        expect(error).not.toMatch(/Invalid output format/);
      }
    });

    it('should reject invalid output format', async () => {
      registerStreamCommands(program);

      // Test invalid output format
      await expect(
        program.parseAsync(['node', 'test', 'stream', 'get-key', '--channelId', '3151318', '--output', 'invalid'])
      ).rejects.toThrow(/Invalid output format: invalid/);
    });
  });

  describe('validateOutputFormat', () => {
    // Test the validation logic by accessing the command option validation
    it('should accept "table" format', async () => {
      registerStreamCommands(program);
      
      // Mock successful execution to test validation passes
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: { appId: 'test', appSecret: 'test', userId: 'test' },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: { environment: 'default', debug: 'default', timeout: 'default', baseUrl: 'default', maxRetries: 'default' },
        validation: { isValid: true, errors: [], warnings: [], missingFields: [] },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);
      mockStreamHandler.getStreamKey.mockResolvedValue();

      // Should not throw for valid format
      await expect(
        program.parseAsync(['node', 'test', 'stream', 'get-key', '--channelId', '3151318', '--output', 'table'])
      ).resolves.not.toThrow();
    });

    it('should accept "json" format', async () => {
      registerStreamCommands(program);
      
      // Mock successful execution to test validation passes
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: { appId: 'test', appSecret: 'test', userId: 'test' },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: { environment: 'default', debug: 'default', timeout: 'default', baseUrl: 'default', maxRetries: 'default' },
        validation: { isValid: true, errors: [], warnings: [], missingFields: [] },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);
      mockStreamHandler.getStreamKey.mockResolvedValue();

      // Should not throw for valid format
      await expect(
        program.parseAsync(['node', 'test', 'stream', 'get-key', '--channelId', '3151318', '--output', 'json'])
      ).resolves.not.toThrow();
    });

    it('should reject invalid format', async () => {
      registerStreamCommands(program);
      
      // Should throw for invalid format during parsing
      await expect(
        program.parseAsync(['node', 'test', 'stream', 'get-key', '--channelId', '3151318', '--output', 'xml'])
      ).rejects.toThrow(/Invalid output format: xml/);
    });

    it('should reject empty format', async () => {
      registerStreamCommands(program);
      
      // Should throw for empty format during parsing
      await expect(
        program.parseAsync(['node', 'test', 'stream', 'get-key', '--channelId', '3151318', '--output', ''])
      ).rejects.toThrow(/Invalid output format: /);
    });
  });

  describe('stop command', () => {
    it('should register stop subcommand with correct options', () => {
      registerStreamCommands(program);

      const streamCommand = program.commands.find(cmd => cmd.name() === 'stream');
      const stopCommand = streamCommand?.commands.find(cmd => cmd.name() === 'stop');
      
      expect(stopCommand).toBeDefined();
      expect(stopCommand?.description()).toBe('Stop live streaming for a channel');
      
      // Check required option
      const channelIdOption = stopCommand?.options.find(opt => opt.long === '--channelId');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should add help text to stop command', () => {
      registerStreamCommands(program);

      const streamCommand = program.commands.find(cmd => cmd.name() === 'stream');
      const stopCommand = streamCommand?.commands.find(cmd => cmd.name() === 'stop');
      
      expect(stopCommand).toBeDefined();
      
      // Verify command has the basic structure
      expect(stopCommand?.description()).toBe('Stop live streaming for a channel');
      expect(stopCommand?.options.length).toBeGreaterThan(0);
      
      // Verify that the command has been properly configured
      const helpText = stopCommand?.helpInformation();
      expect(helpText).toContain('Stop live streaming for a channel');
      expect(helpText).toContain('--channelId');
    });

    it('should execute stop command successfully', async () => {
      // Mock successful configuration load
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: {
          environment: 'default',
          debug: 'default',
          timeout: 'default',
          baseUrl: 'default',
          maxRetries: 'default'
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          missingFields: []
        },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);
      mockStreamHandler.stopStream.mockResolvedValue();

      registerStreamCommands(program);

      // Simulate command execution
      await program.parseAsync(['node', 'test', 'stream', 'stop', '--channelId', '3151318']);

      expect(mockConfigManager.load).toHaveBeenCalledWith({
        cliOptions: expect.any(Object)
      });
      expect(MockStreamHandler).toHaveBeenCalledWith(
        mockConfig.config.auth,
        {
          baseUrl: mockConfig.config.baseUrl,
          timeout: mockConfig.config.timeout,
          debug: mockConfig.config.debug
        }
      );
      expect(mockStreamHandler.stopStream).toHaveBeenCalledWith({
        channelId: '3151318'
      });
    });

    it('should handle configuration loading errors for stop command', async () => {
      const configError = new Error('Configuration loading failed');
      mockConfigManager.load.mockRejectedValue(configError);

      registerStreamCommands(program);

      // Simulate command execution that will fail
      await program.parseAsync(['node', 'test', 'stream', 'stop', '--channelId', '3151318']);

      expect(logError).toHaveBeenCalledWith(configError);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle stream handler execution errors for stop command', async () => {
      // Mock successful configuration load
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: {
          environment: 'default',
          debug: 'default',
          timeout: 'default',
          baseUrl: 'default',
          maxRetries: 'default'
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          missingFields: []
        },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);

      const handlerError = new Error('Stream stop handler execution failed');
      mockStreamHandler.stopStream.mockRejectedValue(handlerError);

      registerStreamCommands(program);

      // Simulate command execution that will fail
      await program.parseAsync(['node', 'test', 'stream', 'stop', '--channelId', '3151318']);

      expect(logError).toHaveBeenCalledWith(handlerError);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle non-Error exceptions for stop command', async () => {
      // Mock successful configuration load
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: {
          environment: 'default',
          debug: 'default',
          timeout: 'default',
          baseUrl: 'default',
          maxRetries: 'default'
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          missingFields: []
        },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);

      const stringError = 'String error message';
      mockStreamHandler.stopStream.mockRejectedValue(stringError);

      registerStreamCommands(program);

      // Simulate command execution that will fail
      await program.parseAsync(['node', 'test', 'stream', 'stop', '--channelId', '3151318']);

      expect(logError).toHaveBeenCalledWith(new Error('String error message'));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('start command', () => {
    it('should register start subcommand with correct options', () => {
      registerStreamCommands(program);

      const streamCommand = program.commands.find(cmd => cmd.name() === 'stream');
      const startCommand = streamCommand?.commands.find(cmd => cmd.name() === 'start');
      
      expect(startCommand).toBeDefined();
      expect(startCommand?.description()).toBe('Start live streaming for a channel');
      
      // Check required option
      const channelIdOption = startCommand?.options.find(opt => opt.long === '--channelId');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should add help text to start command', () => {
      registerStreamCommands(program);

      const streamCommand = program.commands.find(cmd => cmd.name() === 'stream');
      const startCommand = streamCommand?.commands.find(cmd => cmd.name() === 'start');
      
      expect(startCommand).toBeDefined();
      
      // Verify command has the basic structure
      expect(startCommand?.description()).toBe('Start live streaming for a channel');
      expect(startCommand?.options.length).toBeGreaterThan(0);
      
      // Verify that the command has been properly configured
      const helpText = startCommand?.helpInformation();
      expect(helpText).toContain('Start live streaming for a channel');
      expect(helpText).toContain('--channelId');
    });

    it('should execute start command successfully', async () => {
      // Mock successful configuration load
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: {
          environment: 'default',
          debug: 'default',
          timeout: 'default',
          baseUrl: 'default',
          maxRetries: 'default'
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          missingFields: []
        },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);
      mockStreamHandler.startStream.mockResolvedValue();

      registerStreamCommands(program);

      // Simulate command execution
      await program.parseAsync(['node', 'test', 'stream', 'start', '--channelId', '3151318']);

      expect(mockConfigManager.load).toHaveBeenCalledWith({
        cliOptions: expect.any(Object)
      });
      expect(MockStreamHandler).toHaveBeenCalledWith(
        mockConfig.config.auth,
        {
          baseUrl: mockConfig.config.baseUrl,
          timeout: mockConfig.config.timeout,
          debug: mockConfig.config.debug
        }
      );
      expect(mockStreamHandler.startStream).toHaveBeenCalledWith({
        channelId: '3151318'
      });
    });

    it('should handle configuration loading errors for start command', async () => {
      const configError = new Error('Configuration loading failed');
      mockConfigManager.load.mockRejectedValue(configError);

      registerStreamCommands(program);

      // Simulate command execution that will fail
      await program.parseAsync(['node', 'test', 'stream', 'start', '--channelId', '3151318']);

      expect(logError).toHaveBeenCalledWith(configError);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle stream handler execution errors for start command', async () => {
      // Mock successful configuration load
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: {
          environment: 'default',
          debug: 'default',
          timeout: 'default',
          baseUrl: 'default',
          maxRetries: 'default'
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          missingFields: []
        },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);

      const handlerError = new Error('Stream start handler execution failed');
      mockStreamHandler.startStream.mockRejectedValue(handlerError);

      registerStreamCommands(program);

      // Simulate command execution that will fail
      await program.parseAsync(['node', 'test', 'stream', 'start', '--channelId', '3151318']);

      expect(logError).toHaveBeenCalledWith(handlerError);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle non-Error exceptions for start command', async () => {
      // Mock successful configuration load
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: {
          environment: 'default',
          debug: 'default',
          timeout: 'default',
          baseUrl: 'default',
          maxRetries: 'default'
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          missingFields: []
        },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);

      const stringError = 'String error message';
      mockStreamHandler.startStream.mockRejectedValue(stringError);

      registerStreamCommands(program);

      // Simulate command execution that will fail
      await program.parseAsync(['node', 'test', 'stream', 'start', '--channelId', '3151318']);

      expect(logError).toHaveBeenCalledWith(new Error('String error message'));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('status command', () => {
    let setIntervalSpy: jest.SpyInstance;
    let clearIntervalSpy: jest.SpyInstance;
    let processOnSpy: jest.SpyInstance;
    let processStdoutWriteSpy: jest.SpyInstance;

    beforeEach(() => {
      setIntervalSpy = jest.spyOn(global, 'setInterval').mockImplementation();
      clearIntervalSpy = jest.spyOn(global, 'clearInterval').mockImplementation();
      processOnSpy = jest.spyOn(process, 'on').mockImplementation();
      processStdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
    });

    afterEach(() => {
      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
      processOnSpy.mockRestore();
      processStdoutWriteSpy.mockRestore();
    });

    it('should register status subcommand with correct options', () => {
      registerStreamCommands(program);

      const streamCommand = program.commands.find(cmd => cmd.name() === 'stream');
      const statusCommand = streamCommand?.commands.find(cmd => cmd.name() === 'status');
      
      expect(statusCommand).toBeDefined();
      expect(statusCommand?.description()).toBe('Get real-time status information for a live channel');
      
      // Check required option
      const channelIdOption = statusCommand?.options.find(opt => opt.long === '--channelId');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
      
      // Check optional output option
      const outputOption = statusCommand?.options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
      expect(outputOption?.defaultValue).toBe('table');

      // Check optional watch option
      const watchOption = statusCommand?.options.find(opt => opt.long === '--watch');
      expect(watchOption).toBeDefined();
    });

    it('should add help text to status command', () => {
      registerStreamCommands(program);

      const streamCommand = program.commands.find(cmd => cmd.name() === 'stream');
      const statusCommand = streamCommand?.commands.find(cmd => cmd.name() === 'status');
      
      expect(statusCommand).toBeDefined();
      
      // Verify command has the basic structure
      expect(statusCommand?.description()).toBe('Get real-time status information for a live channel');
      expect(statusCommand?.options.length).toBeGreaterThan(0);
      
      // Verify that the command has been properly configured
      const helpText = statusCommand?.helpInformation();
      expect(helpText).toContain('Get real-time status information for a live channel');
      expect(helpText).toContain('--channelId');
      expect(helpText).toContain('--output');
      expect(helpText).toContain('--watch');
    });

    it('should execute status command successfully without watch mode', async () => {
      // Mock successful configuration load
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: {
          environment: 'default',
          debug: 'default',
          timeout: 'default',
          baseUrl: 'default',
          maxRetries: 'default'
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          missingFields: []
        },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);
      mockStreamHandler.getStreamStatus.mockResolvedValue();

      registerStreamCommands(program);

      // Simulate command execution
      await program.parseAsync(['node', 'test', 'stream', 'status', '-c', '3151318']);

      expect(mockConfigManager.load).toHaveBeenCalledWith({
        cliOptions: expect.any(Object)
      });
      expect(MockStreamHandler).toHaveBeenCalledWith(
        mockConfig.config.auth,
        {
          baseUrl: mockConfig.config.baseUrl,
          timeout: mockConfig.config.timeout,
          debug: mockConfig.config.debug
        }
      );
      expect(mockStreamHandler.getStreamStatus).toHaveBeenCalledWith({
        channelId: '3151318',
        output: 'table',
        watch: undefined
      });
    });

    it('should execute status command with JSON output', async () => {
      // Mock successful configuration load
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: {
          environment: 'default',
          debug: 'default',
          timeout: 'default',
          baseUrl: 'default',
          maxRetries: 'default'
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          missingFields: []
        },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);
      mockStreamHandler.getStreamStatus.mockResolvedValue();

      registerStreamCommands(program);

      // Simulate command execution with JSON output
      await program.parseAsync(['node', 'test', 'stream', 'status', '-c', '3151318', '-o', 'json']);

      expect(mockStreamHandler.getStreamStatus).toHaveBeenCalledWith({
        channelId: '3151318',
        output: 'json',
        watch: undefined
      });
    });

    it('should execute status command with watch mode', async () => {
      // Mock successful configuration load
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: {
          environment: 'default',
          debug: 'default',
          timeout: 'default',
          baseUrl: 'default',
          maxRetries: 'default'
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          missingFields: []
        },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);
      mockStreamHandler.getStreamStatus.mockResolvedValue();

      registerStreamCommands(program);

      // Mock setInterval to return a mock timer ID
      const mockTimerId = 12345;
      setIntervalSpy.mockReturnValue(mockTimerId);

      // Simulate command execution with watch mode
      await program.parseAsync(['node', 'test', 'stream', 'status', '-c', '3151318', '-w']);

      expect(consoleSpy).toHaveBeenCalledWith('📺 Starting continuous monitoring (Press Ctrl+C to stop)...\n');
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
      expect(processOnSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
      expect(mockStreamHandler.getStreamStatus).toHaveBeenCalledWith({
        channelId: '3151318',
        output: 'table',
        watch: true
      });
    });

    it('should handle SIGINT in watch mode', async () => {
      // Mock successful configuration load
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: {
          environment: 'default',
          debug: 'default',
          timeout: 'default',
          baseUrl: 'default',
          maxRetries: 'default'
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          missingFields: []
        },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);
      mockStreamHandler.getStreamStatus.mockResolvedValue();

      registerStreamCommands(program);

      // Mock setInterval to return a mock timer ID
      const mockTimerId = 12345;
      setIntervalSpy.mockReturnValue(mockTimerId);

      // Simulate command execution with watch mode
      await program.parseAsync(['node', 'test', 'stream', 'status', '-c', '3151318', '-w']);

      // Get the SIGINT handler that was registered
      const sigintHandler = processOnSpy.mock.calls.find(call => call[0] === 'SIGINT')?.[1];
      expect(sigintHandler).toBeDefined();

      // Simulate SIGINT
      if (sigintHandler) {
        sigintHandler();
      }

      expect(clearIntervalSpy).toHaveBeenCalledWith(mockTimerId);
      expect(consoleSpy).toHaveBeenCalledWith('\n\n👋 Monitoring stopped. Goodbye!');
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should handle configuration loading errors for status command', async () => {
      const configError = new Error('Configuration loading failed');
      mockConfigManager.load.mockRejectedValue(configError);

      registerStreamCommands(program);

      // Simulate command execution that will fail
      await program.parseAsync(['node', 'test', 'stream', 'status', '-c', '3151318']);

      expect(logError).toHaveBeenCalledWith(configError);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle stream handler execution errors for status command', async () => {
      // Mock successful configuration load
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: {
          environment: 'default',
          debug: 'default',
          timeout: 'default',
          baseUrl: 'default',
          maxRetries: 'default'
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          missingFields: []
        },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);

      const handlerError = new Error('Stream status handler execution failed');
      mockStreamHandler.getStreamStatus.mockRejectedValue(handlerError);

      registerStreamCommands(program);

      // Simulate command execution that will fail
      await program.parseAsync(['node', 'test', 'stream', 'status', '-c', '3151318']);

      expect(logError).toHaveBeenCalledWith(handlerError);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle non-Error exceptions for status command', async () => {
      // Mock successful configuration load
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: {
          environment: 'default',
          debug: 'default',
          timeout: 'default',
          baseUrl: 'default',
          maxRetries: 'default'
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          missingFields: []
        },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);

      const stringError = 'String error message';
      mockStreamHandler.getStreamStatus.mockRejectedValue(stringError);

      registerStreamCommands(program);

      // Simulate command execution that will fail
      await program.parseAsync(['node', 'test', 'stream', 'status', '-c', '3151318']);

      expect(logError).toHaveBeenCalledWith(new Error('String error message'));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should validate output format for status command', async () => {
      registerStreamCommands(program);

      // Test invalid output format
      await expect(
        program.parseAsync(['node', 'test', 'stream', 'status', '-c', '3151318', '-o', 'invalid'])
      ).rejects.toThrow(/Invalid output format: invalid/);
    });
  });

  describe('push command', () => {
    it('should register push subcommand with correct options', () => {
      registerStreamCommands(program);

      const streamCommand = program.commands.find(cmd => cmd.name() === 'stream');
      const pushCommand = streamCommand?.commands.find(cmd => cmd.name() === 'push');
      
      expect(pushCommand).toBeDefined();
      expect(pushCommand?.description()).toBe('Push a local video file to a live channel');
      
      // Check required options
      const channelIdOption = pushCommand?.options.find(opt => opt.long === '--channelId');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
      
      const fileOption = pushCommand?.options.find(opt => opt.long === '--file');
      expect(fileOption).toBeDefined();
      expect(fileOption?.required).toBe(true);
      
      // Check optional options
      const verifyOption = pushCommand?.options.find(opt => opt.long === '--verify');
      expect(verifyOption).toBeDefined();
      
      const verificationIntervalOption = pushCommand?.options.find(opt => opt.long === '--verification-interval');
      expect(verificationIntervalOption).toBeDefined();
      expect(verificationIntervalOption?.defaultValue).toBe(10);
      
      const qualityThresholdOption = pushCommand?.options.find(opt => opt.long === '--quality-threshold');
      expect(qualityThresholdOption).toBeDefined();
      expect(qualityThresholdOption?.defaultValue).toBe(15);
      
      const showViewerLinksOption = pushCommand?.options.find(opt => opt.long === '--show-viewer-links');
      expect(showViewerLinksOption).toBeDefined();
    });

    it('should execute push command successfully', async () => {
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: { appId: 'test-app-id', appSecret: 'test-app-secret', userId: 'test-user-id' },
          baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false, maxRetries: 3
        },
        sources: { environment: 'default', debug: 'default', timeout: 'default', baseUrl: 'default', maxRetries: 'default' },
        validation: { isValid: true, errors: [], warnings: [], missingFields: [] },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);
      mockStreamHandler.pushStream.mockResolvedValue();

      registerStreamCommands(program);

      await program.parseAsync(['node', 'test', 'stream', 'push', '--channelId', '3151318', '--file', '/path/to/video.mp4']);

      expect(mockStreamHandler.pushStream).toHaveBeenCalledWith({
        channelId: '3151318', file: '/path/to/video.mp4', verify: undefined,
        verificationInterval: 10, qualityThreshold: 15, showViewerLinks: undefined
      });
    });

    it('should handle errors for push command', async () => {
      const configError = new Error('Configuration loading failed');
      mockConfigManager.load.mockRejectedValue(configError);
      registerStreamCommands(program);

      await program.parseAsync(['node', 'test', 'stream', 'push', '--channelId', '3151318', '--file', '/path/to/video.mp4']);

      expect(logError).toHaveBeenCalledWith(configError);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('verify command', () => {
    it('should register verify subcommand with correct options', () => {
      registerStreamCommands(program);

      const streamCommand = program.commands.find(cmd => cmd.name() === 'stream');
      const verifyCommand = streamCommand?.commands.find(cmd => cmd.name() === 'verify');
      
      expect(verifyCommand).toBeDefined();
      expect(verifyCommand?.description()).toBe('Verify stream quality and performance for a live channel');
      
      const channelIdOption = verifyCommand?.options.find(opt => opt.long === '--channelId');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
      
      const durationOption = verifyCommand?.options.find(opt => opt.long === '--duration');
      expect(durationOption).toBeDefined();
      expect(durationOption?.defaultValue).toBe(60);
    });

    it('should execute verify command successfully', async () => {
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: { appId: 'test-app-id', appSecret: 'test-app-secret', userId: 'test-user-id' },
          baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false, maxRetries: 3
        },
        sources: { environment: 'default', debug: 'default', timeout: 'default', baseUrl: 'default', maxRetries: 'default' },
        validation: { isValid: true, errors: [], warnings: [], missingFields: [] },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);
      mockStreamHandler.verifyStream.mockResolvedValue();

      registerStreamCommands(program);

      await program.parseAsync(['node', 'test', 'stream', 'verify', '--channelId', '3151318']);

      expect(mockStreamHandler.verifyStream).toHaveBeenCalledWith({
        channelId: '3151318', duration: 60, interval: 10, qualityThreshold: 15,
        showViewerLinks: undefined, saveReport: undefined, output: 'table'
      });
    });

    it('should handle errors for verify command', async () => {
      const configError = new Error('Configuration loading failed');
      mockConfigManager.load.mockRejectedValue(configError);
      registerStreamCommands(program);

      await program.parseAsync(['node', 'test', 'stream', 'verify', '--channelId', '3151318']);

      expect(logError).toHaveBeenCalledWith(configError);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('monitor command', () => {
    it('should register monitor subcommand with correct options', () => {
      registerStreamCommands(program);

      const streamCommand = program.commands.find(cmd => cmd.name() === 'stream');
      const monitorCommand = streamCommand?.commands.find(cmd => cmd.name() === 'monitor');
      
      expect(monitorCommand).toBeDefined();
      expect(monitorCommand?.description()).toBe('Monitor stream status in real-time with live dashboard');
      
      const channelIdOption = monitorCommand?.options.find(opt => opt.long === '--channelId');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
      
      const refreshOption = monitorCommand?.options.find(opt => opt.long === '--refresh');
      expect(refreshOption).toBeDefined();
      expect(refreshOption?.defaultValue).toBe(5);
    });

    it('should execute monitor command successfully', async () => {
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: { appId: 'test-app-id', appSecret: 'test-app-secret', userId: 'test-user-id' },
          baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false, maxRetries: 3
        },
        sources: { environment: 'default', debug: 'default', timeout: 'default', baseUrl: 'default', maxRetries: 'default' },
        validation: { isValid: true, errors: [], warnings: [], missingFields: [] },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);
      mockStreamHandler.monitorStream.mockResolvedValue();

      registerStreamCommands(program);

      await program.parseAsync(['node', 'test', 'stream', 'monitor', '--channelId', '3151318']);

      expect(mockStreamHandler.monitorStream).toHaveBeenCalledWith({
        channelId: '3151318', refresh: 5, alerts: undefined, output: 'table'
      });
    });

    it('should handle errors for monitor command', async () => {
      const configError = new Error('Configuration loading failed');
      mockConfigManager.load.mockRejectedValue(configError);
      registerStreamCommands(program);

      await program.parseAsync(['node', 'test', 'stream', 'monitor', '--channelId', '3151318']);

      expect(logError).toHaveBeenCalledWith(configError);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle monitor interval errors gracefully', async () => {
      // Mock config manager to return successful config
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: { appId: 'test', appSecret: 'test', userId: 'test' },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: { environment: 'default', debug: 'default', timeout: 'default', baseUrl: 'default', maxRetries: 'default' },
        validation: { isValid: true, errors: [], warnings: [], missingFields: [] },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);

      // Mock streamHandler to throw error during monitoring
      mockStreamHandler.getStreamStatus.mockRejectedValue(new Error('Stream status error'));

      const originalConsoleError = console.error;
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      registerStreamCommands(program);

      // Simply test error handling by mocking the handler
      await program.parseAsync(['node', 'test', 'stream', 'status', '--channelId', '3151318']);

      // Since the error is thrown by mockStreamHandler.getStreamStatus,
      // it should be handled by the command error handling
      expect(mockStreamHandler.getStreamStatus).toHaveBeenCalled();
      
      // Restore original console.error
      (console.error as any) = originalConsoleError;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Authentication Error Handling', () => {
    beforeEach(() => {
      // Reset mocks for authentication tests
      mockAuthAdapter.tryGetAuthConfig.mockReturnValue(null);
      mockAuthAdapter.getStatusMessage.mockReturnValue('Authentication failed: No valid credentials found');
      mockAuthAdapter.getDiagnostics.mockReturnValue({
        availableSources: [],
        selectedSource: undefined,
        errors: ['No authentication found'],
        warnings: [],
        suggestions: []
      });
    });

    it('should handle authentication errors in get-key command', async () => {
      registerStreamCommands(program);

      await program.parseAsync(['node', 'test', 'stream', 'get-key', '--channelId', '3151318']);

      expect(logError).toHaveBeenCalledWith(expect.any(Error));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('[P1] should handle Authentication errors with diagnostics in get-key', async () => {
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: { appId: 'test', appSecret: 'test', userId: 'test' },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: { environment: 'default', debug: 'default', timeout: 'default', baseUrl: 'default', maxRetries: 'default' },
        validation: { isValid: true, errors: [], warnings: [], missingFields: [] },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);
      mockAuthAdapter.tryGetAuthConfig.mockReturnValue({
        config: {
          appId: 'test',
          appSecret: 'test',
          userId: 'test'
        },
        source: 'cli'
      });

      // Spy on console.error since diagnostics use console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock handler to throw authentication error
      mockStreamHandler.getStreamKey.mockRejectedValue(new Error('Authentication failed'));

      registerStreamCommands(program);

      await program.parseAsync(['node', 'test', 'stream', 'get-key', '--channelId', '3151318']);

      expect(mockAuthAdapter.getDiagnostics).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('🔍 Authentication Diagnostics:'));
      expect(logError).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);

      consoleErrorSpy.mockRestore();
    });

    it('should handle authentication errors in push command', async () => {
      registerStreamCommands(program);

      await program.parseAsync(['node', 'test', 'stream', 'push', '--channelId', '3151318', '--file', 'test.mp4']);

      expect(logError).toHaveBeenCalledWith(expect.any(Error));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle authentication errors in start command', async () => {
      registerStreamCommands(program);

      await program.parseAsync(['node', 'test', 'stream', 'start', '--channelId', '3151318']);

      expect(logError).toHaveBeenCalledWith(expect.any(Error));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle authentication errors in stop command', async () => {
      registerStreamCommands(program);

      await program.parseAsync(['node', 'test', 'stream', 'stop', '--channelId', '3151318']);

      expect(logError).toHaveBeenCalledWith(expect.any(Error));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle authentication errors in status command', async () => {
      registerStreamCommands(program);

      await program.parseAsync(['node', 'test', 'stream', 'status', '--channelId', '3151318']);

      expect(logError).toHaveBeenCalledWith(expect.any(Error));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle authentication errors in verify command', async () => {
      registerStreamCommands(program);

      await program.parseAsync(['node', 'test', 'stream', 'verify', '--channelId', '3151318']);

      expect(logError).toHaveBeenCalledWith(expect.any(Error));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle authentication errors in monitor command', async () => {
      registerStreamCommands(program);

      await program.parseAsync(['node', 'test', 'stream', 'monitor', '--channelId', '3151318']);

      expect(logError).toHaveBeenCalledWith(expect.any(Error));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('Verbose Output and Account Name Tests', () => {
    it('should show verbose output when authentication is successful', async () => {
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: { appId: 'test', appSecret: 'test', userId: 'test' },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: { environment: 'default', debug: 'default', timeout: 'default', baseUrl: 'default', maxRetries: 'default' },
        validation: { isValid: true, errors: [], warnings: [], missingFields: [] },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);
      mockAuthAdapter.tryGetAuthConfig.mockReturnValue({
        config: {
          appId: 'test',
          appSecret: 'test',
          userId: 'test'
        },
        source: 'cli',
        accountName: 'test-account'
      });
      mockStreamHandler.getStreamKey.mockResolvedValue();

      registerStreamCommands(program);

      await program.parseAsync(['node', 'test', 'stream', 'get-key', '--channelId', '3151318', '--verbose']);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('✅ Using authentication from: cli'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('📋 Account: test-account'));
    });

    it('should show verbose output without account name', async () => {
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: { appId: 'test', appSecret: 'test', userId: 'test' },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: { environment: 'default', debug: 'default', timeout: 'default', baseUrl: 'default', maxRetries: 'default' },
        validation: { isValid: true, errors: [], warnings: [], missingFields: [] },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);
      mockAuthAdapter.tryGetAuthConfig.mockReturnValue({
        config: {
          appId: 'test',
          appSecret: 'test',
          userId: 'test'
        },
        source: 'env'
      });
      mockStreamHandler.getStreamKey.mockResolvedValue();

      registerStreamCommands(program);

      await program.parseAsync(['node', 'test', 'stream', 'get-key', '--channelId', '3151318', '--verbose']);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('✅ Using authentication from: env'));
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('📋 Account:'));
    });

    it('should handle status command with watch option error', async () => {
      const mockConfig: ConfigResult = {
        config: {
          environment: 'production' as const,
          auth: { appId: 'test', appSecret: 'test', userId: 'test' },
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
          maxRetries: 3
        },
        sources: { environment: 'default', debug: 'default', timeout: 'default', baseUrl: 'default', maxRetries: 'default' },
        validation: { isValid: true, errors: [], warnings: [], missingFields: [] },
        loadedEnvFiles: []
      };
      mockConfigManager.load.mockResolvedValue(mockConfig);
      mockAuthAdapter.tryGetAuthConfig.mockReturnValue({
        config: {
          appId: 'test',
          appSecret: 'test',
          userId: 'test'
        },
        source: 'cli'
      });

      // Mock first call success, then error for watch interval
      mockStreamHandler.getStreamStatus
        .mockResolvedValueOnce(undefined)
        .mockRejectedValue(new Error('Watch interval error'));

      const originalConsoleError = console.error;
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      registerStreamCommands(program);

      // This will trigger the watch functionality which should handle the error
      await program.parseAsync(['node', 'test', 'stream', 'status', '--channelId', '3151318', '--watch']);

      expect(mockStreamHandler.getStreamStatus).toHaveBeenCalled();
      
      // Restore original console.error
      (console.error as any) = originalConsoleError;
      consoleErrorSpy.mockRestore();
    });
  });
}); 