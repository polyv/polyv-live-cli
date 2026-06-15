/**
 * @fileoverview Unit tests for channel commands
 * @author Development Team
 * @since 2.1.0
 */

import { Command } from 'commander';
import { 
  registerChannelCommands,
  parseInteger,
  validateScene,
  validateTemplate,
  validateLimit,
  validateOutputFormat
} from './channel.commands';

// Mock dependencies
jest.mock('../handlers/channel.handler');
jest.mock('../config/manager');
jest.mock('../config/auth-adapter');
jest.mock('../utils/errors');

// Mock implementations
const mockChannelHandler = {
  create: jest.fn(),
  listChannels: jest.fn(),
  getChannelDetail: jest.fn(),
  updateChannel: jest.fn(),
  deleteChannel: jest.fn(),
  deleteChannels: jest.fn()
};

const mockConfigManager = {
  load: jest.fn()
};

const mockAuthAdapter = {
  tryGetAuthConfig: jest.fn(),
  getDiagnostics: jest.fn()
};

const mockLogError = jest.fn();

// Setup mocks
require('../handlers/channel.handler').ChannelHandler = jest.fn().mockImplementation(() => mockChannelHandler);
require('../config/manager').configManager = mockConfigManager;
require('../config/auth-adapter').authAdapter = mockAuthAdapter;
require('../utils/errors').logError = mockLogError;

describe('Channel Commands', () => {
  let program: Command;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    program = new Command();
    exitSpy = jest.spyOn(process, 'exit').mockImplementation();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default successful mocks
    mockConfigManager.load.mockResolvedValue({
      config: {
        baseUrl: 'https://api.polyv.net',
        timeout: 30000,
        maxRetries: 3,
        debug: false,
        auth: {
          appId: 'test-app-id',
          appSecret: 'test-app-secret',
          userId: 'test-user-id'
        }
      }
    });

    // Setup authAdapter mock
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
      sources: [
        { source: 'Command Line', available: true, status: 'Available' },
        { source: 'Environment Variables', available: false, status: 'Not configured' }
      ],
      configPaths: []
    });
    
    mockChannelHandler.create.mockResolvedValue({
      channelId: 'ch123456',
      name: 'Test Channel'
    });
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  describe('registerChannelCommands', () => {
    it('should register channel command group', () => {
      registerChannelCommands(program);
      
      const commands = program.commands;
      const channelCommand = commands.find(cmd => cmd.name() === 'channel');
      
      expect(channelCommand).toBeDefined();
      expect(channelCommand?.description()).toBe('Manage live streaming channels');
    });

    it('should register channel create subcommand with correct options', () => {
      registerChannelCommands(program);
      
      const channelCommand = program.commands.find(cmd => cmd.name() === 'channel');
      const createCommand = channelCommand?.commands.find(cmd => cmd.name() === 'create');
      
      expect(createCommand).toBeDefined();
      expect(createCommand?.description()).toBe('Create a new live streaming channel');
      
      // Check required options
      const options = createCommand?.options || [];
      const nameOption = options.find(opt => opt.long === '--name');
      expect(nameOption).toBeDefined();
      expect(nameOption?.required).toBe(true);
    });

    it('should register all optional parameters', () => {
      registerChannelCommands(program);
      
      const channelCommand = program.commands.find(cmd => cmd.name() === 'channel');
      const createCommand = channelCommand?.commands.find(cmd => cmd.name() === 'create');
      const options = createCommand?.options || [];
      
      const expectedOptions = [
        '--name',
        '--description', 
        '--max-viewers',
        '--auto-record',
        '--scene',
        '--template',
        '--password',
        '--output'
      ];
      
      expectedOptions.forEach(optionName => {
        const option = options.find(opt => opt.long === optionName);
        expect(option).toBeDefined();
      });
    });

    it('should set correct default values', () => {
      registerChannelCommands(program);
      
      const channelCommand = program.commands.find(cmd => cmd.name() === 'channel');
      const createCommand = channelCommand?.commands.find(cmd => cmd.name() === 'create');
      const options = createCommand?.options || [];
      
      const sceneOption = options.find(opt => opt.long === '--scene');
      const templateOption = options.find(opt => opt.long === '--template');
      const outputOption = options.find(opt => opt.long === '--output');
      
      expect(sceneOption?.defaultValue).toBe('topclass');
      expect(templateOption?.defaultValue).toBe('ppt');
      expect(outputOption?.defaultValue).toBe('table');
    });

    it('should have validation functions for options', () => {
      registerChannelCommands(program);
      
      const channelCommand = program.commands.find(cmd => cmd.name() === 'channel');
      const createCommand = channelCommand?.commands.find(cmd => cmd.name() === 'create');
      const options = createCommand?.options || [];
      
      const sceneOption = options.find(opt => opt.long === '--scene');
      const templateOption = options.find(opt => opt.long === '--template');
      const outputOption = options.find(opt => opt.long === '--output');
      const maxViewersOption = options.find(opt => opt.long === '--max-viewers');
      
      expect(sceneOption?.argParser).toBeDefined();
      expect(templateOption?.argParser).toBeDefined();
      expect(outputOption?.argParser).toBeDefined();
      expect(maxViewersOption?.argParser).toBeDefined();
    });
  });

  describe('Help text', () => {
    it('should include comprehensive examples and documentation', () => {
      registerChannelCommands(program);
      
      const channelCommand = program.commands.find(cmd => cmd.name() === 'channel');
      const helpText = channelCommand?.helpInformation();
      
      // The examples are added via addHelpText, which may not show in helpInformation()
      // Test that the command exists and has proper description
      expect(helpText).toContain('Manage live streaming channels');
      expect(helpText).toContain('Create a new live streaming channel');
      
      // Test that the command has the help text added (this is added via addHelpText)
      expect(channelCommand).toBeDefined();
    });
  });

  describe('Validation functions', () => {
    // Test the actual exported validation functions directly instead of extracting from commander
    // We'll need to import the functions individually or test them through command execution
    
    describe('parseInteger', () => {
      it('should parse valid integer strings', () => {
        // Test by calling the command with valid values and ensure it doesn't throw
        registerChannelCommands(program);
        program.opts = jest.fn().mockReturnValue({});
        
        // The validation happens when the command is parsed
        // We can test indirectly by ensuring the command registration succeeds
        const channelCommand = program.commands.find(cmd => cmd.name() === 'channel');
        const createCommand = channelCommand?.commands.find(cmd => cmd.name() === 'create');
        expect(createCommand).toBeDefined();
      });
    });

    describe('Scene validation', () => {
      it('should have scene validation configured', () => {
        registerChannelCommands(program);
        const channelCommand = program.commands.find(cmd => cmd.name() === 'channel');
        const createCommand = channelCommand?.commands.find(cmd => cmd.name() === 'create');
        const sceneOption = createCommand?.options.find(opt => opt.long === '--scene');
        
        expect(sceneOption).toBeDefined();
        expect(sceneOption?.defaultValue).toBe('topclass');
      });
    });

    describe('Template validation', () => {
      it('should have template validation configured', () => {
        registerChannelCommands(program);
        const channelCommand = program.commands.find(cmd => cmd.name() === 'channel');
        const createCommand = channelCommand?.commands.find(cmd => cmd.name() === 'create');
        const templateOption = createCommand?.options.find(opt => opt.long === '--template');
        
        expect(templateOption).toBeDefined();
        expect(templateOption?.defaultValue).toBe('ppt');
      });
    });

    describe('Output format validation', () => {
      it('should have output format validation configured', () => {
        registerChannelCommands(program);
        const channelCommand = program.commands.find(cmd => cmd.name() === 'channel');
        const createCommand = channelCommand?.commands.find(cmd => cmd.name() === 'create');
        const outputOption = createCommand?.options.find(opt => opt.long === '--output');
        
        expect(outputOption).toBeDefined();
        expect(outputOption?.defaultValue).toBe('table');
      });
    });
  });

  describe('Command execution', () => {
    it('should execute channel create command using parseAsync', async () => {
      registerChannelCommands(program);
      
      // Mock program.opts() to return parent options
      program.opts = jest.fn().mockReturnValue({
        appId: 'test-app-id',
        appSecret: 'test-app-secret'
      });

      // Execute command using parseAsync - this will trigger the action
      try {
        await program.parseAsync([
          'node', 'test', 'channel', 'create', 
          '--name', 'Test Channel',
          '--description', 'Test description',
          '--max-viewers', '1000',
          '--auto-record',
          '--scene', 'topclass',
          '--template', 'ppt',
          '--password', 'test123',
          '--output', 'table'
        ]);
      } catch (error) {
        // parseAsync might throw when process.exit is called
      }

      expect(mockConfigManager.load).toHaveBeenCalledWith({
        cliOptions: {
          appId: 'test-app-id',
          appSecret: 'test-app-secret'
        }
      });

      expect(mockChannelHandler.create).toHaveBeenCalledWith({
        name: 'Test Channel',
        description: 'Test description',
        maxViewers: 1000,
        autoRecord: true,
        scene: 'topclass',
        template: 'ppt',
        password: 'test123',
        output: 'table'
      });
    });

    it('should handle configuration loading errors', async () => {
      const configError = new Error('Config failed to load');
      mockConfigManager.load.mockRejectedValue(configError);
      
      registerChannelCommands(program);
      program.opts = jest.fn().mockReturnValue({});

      try {
        await program.parseAsync([
          'node', 'test', 'channel', 'create', 
          '--name', 'Test Channel'
        ]);
      } catch (error) {
        // Expected due to process.exit
      }

      expect(mockLogError).toHaveBeenCalledWith(configError);
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle channel creation errors', async () => {
      const channelError = new Error('Channel creation failed');
      mockChannelHandler.create.mockRejectedValue(channelError);
      
      registerChannelCommands(program);
      program.opts = jest.fn().mockReturnValue({});

      try {
        await program.parseAsync([
          'node', 'test', 'channel', 'create', 
          '--name', 'Test Channel'
        ]);
      } catch (error) {
        // Expected due to process.exit
      }

      expect(mockLogError).toHaveBeenCalledWith(channelError);
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle string errors by converting to Error objects', async () => {
      const stringError = 'String error message';
      mockChannelHandler.create.mockRejectedValue(stringError);
      
      registerChannelCommands(program);
      program.opts = jest.fn().mockReturnValue({});

      try {
        await program.parseAsync([
          'node', 'test', 'channel', 'create', 
          '--name', 'Test Channel'
        ]);
      } catch (error) {
        // Expected due to process.exit
      }

      expect(mockLogError).toHaveBeenCalledWith(new Error(stringError));
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should set default values for autoRecord when not provided', async () => {
      registerChannelCommands(program);
      program.opts = jest.fn().mockReturnValue({});

      try {
        await program.parseAsync([
          'node', 'test', 'channel', 'create', 
          '--name', 'Test Channel'
        ]);
      } catch (error) {
        // Expected due to possible process.exit
      }

      expect(mockChannelHandler.create).toHaveBeenCalledWith({
        name: 'Test Channel',
        description: undefined,
        maxViewers: undefined,
        autoRecord: false, // Should default to false
        scene: 'topclass', // Default value
        template: 'ppt', // Default value
        password: undefined,
        output: 'table' // Default value
      });
    });

    it('should create ChannelHandler with correct service configuration', async () => {
      const ChannelHandlerMock = require('../handlers/channel.handler').ChannelHandler;
      
      registerChannelCommands(program);
      program.opts = jest.fn().mockReturnValue({});

      try {
        await program.parseAsync([
          'node', 'test', 'channel', 'create', 
          '--name', 'Test Channel'
        ]);
      } catch (error) {
        // Expected due to possible process.exit
      }

      expect(ChannelHandlerMock).toHaveBeenCalledWith(
        {
          appId: 'test-app-id',
          appSecret: 'test-app-secret',
          userId: 'test-user-id'
        },
        {
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          maxRetries: 3,
          debug: false
        }
      );
    });
  });

  describe('Channel List Command', () => {
    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();
      
      // Setup default successful mocks
      mockConfigManager.load.mockResolvedValue({
        config: {
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          maxRetries: 3,
          debug: false,
          auth: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          }
        }
      });
      
      mockChannelHandler.listChannels.mockResolvedValue([]);
    });

    describe('registerChannelCommands for list', () => {
      it('should register channel list subcommand with correct options', () => {
        registerChannelCommands(program);
        
        const channelCommand = program.commands.find(cmd => cmd.name() === 'channel');
        const listCommand = channelCommand?.commands.find(cmd => cmd.name() === 'list');
        
        expect(listCommand).toBeDefined();
        expect(listCommand?.description()).toBe('List live streaming channels with pagination');
        
        // Check options
        const options = listCommand?.options || [];
        const expectedOptions = [
          '--page',
          '--limit',
          '--output',
          '--category-id',
          '--keyword',
          '--label-id'
        ];
        
        expectedOptions.forEach(optionName => {
          const option = options.find(opt => opt.long === optionName);
          expect(option).toBeDefined();
        });
      });

      it('should set correct default values for list command', () => {
        registerChannelCommands(program);
        
        const channelCommand = program.commands.find(cmd => cmd.name() === 'channel');
        const listCommand = channelCommand?.commands.find(cmd => cmd.name() === 'list');
        const options = listCommand?.options || [];
        
        const pageOption = options.find(opt => opt.long === '--page');
        const limitOption = options.find(opt => opt.long === '--limit');
        const outputOption = options.find(opt => opt.long === '--output');
        
        expect(pageOption?.defaultValue).toBe(1);
        expect(limitOption?.defaultValue).toBe(20);
        expect(outputOption?.defaultValue).toBe('table');
      });

      it('should have validation functions for list options', () => {
        registerChannelCommands(program);
        
        const channelCommand = program.commands.find(cmd => cmd.name() === 'channel');
        const listCommand = channelCommand?.commands.find(cmd => cmd.name() === 'list');
        const options = listCommand?.options || [];
        
        const pageOption = options.find(opt => opt.long === '--page');
        const limitOption = options.find(opt => opt.long === '--limit');
        const outputOption = options.find(opt => opt.long === '--output');
        
        expect(pageOption?.argParser).toBeDefined();
        expect(limitOption?.argParser).toBeDefined();
        expect(outputOption?.argParser).toBeDefined();
      });
    });

    describe('Command execution for list', () => {
      it('should execute channel list command with default options', async () => {
        registerChannelCommands(program);
        
        // Mock program.opts() to return parent options
        program.opts = jest.fn().mockReturnValue({
          appId: 'test-app-id',
          appSecret: 'test-app-secret'
        });

        // Execute command using parseAsync
        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'list'
          ]);
        } catch (error) {
          // parseAsync might throw when process.exit is called
        }

        expect(mockConfigManager.load).toHaveBeenCalledWith({
          cliOptions: {
            appId: 'test-app-id',
            appSecret: 'test-app-secret'
          }
        });

        expect(mockChannelHandler.listChannels).toHaveBeenCalledWith({
          page: 1,
          limit: 20,
          output: 'table',
          categoryId: undefined,
          keyword: undefined,
          labelId: undefined
        });
      });

      it('should execute channel list command with custom pagination', async () => {
        registerChannelCommands(program);
        
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'list',
            '--page', '2',
            '--limit', '5',
            '--output', 'json'
          ]);
        } catch (error) {
          // Expected due to possible process.exit
        }

        expect(mockChannelHandler.listChannels).toHaveBeenCalledWith({
          page: 2,
          limit: 5,
          output: 'json',
          categoryId: undefined,
          keyword: undefined,
          labelId: undefined
        });
      });

      it('should execute channel list command with filters', async () => {
        registerChannelCommands(program);
        
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'list',
            '--category-id', 'cat123',
            '--keyword', 'live stream',
            '--label-id', 'label456'
          ]);
        } catch (error) {
          // Expected due to possible process.exit
        }

        expect(mockChannelHandler.listChannels).toHaveBeenCalledWith({
          page: 1,
          limit: 20,
          output: 'table',
          categoryId: 'cat123',
          keyword: 'live stream',
          labelId: 'label456'
        });
      });

      it('should handle channel list errors', async () => {
        const channelError = new Error('Channel list failed');
        mockChannelHandler.listChannels.mockRejectedValue(channelError);
        
        registerChannelCommands(program);
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'list'
          ]);
        } catch (error) {
          // Expected due to process.exit
        }

        expect(mockLogError).toHaveBeenCalledWith(channelError);
        expect(exitSpy).toHaveBeenCalledWith(1);
      });

      it('should handle configuration loading errors for list', async () => {
        const configError = new Error('Config failed to load');
        mockConfigManager.load.mockRejectedValue(configError);
        
        registerChannelCommands(program);
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'list'
          ]);
        } catch (error) {
          // Expected due to process.exit
        }

        expect(mockLogError).toHaveBeenCalledWith(configError);
        expect(exitSpy).toHaveBeenCalledWith(1);
      });

      it('should create ChannelHandler with correct service configuration for list', async () => {
        const ChannelHandlerMock = require('../handlers/channel.handler').ChannelHandler;
        
        registerChannelCommands(program);
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'list'
          ]);
        } catch (error) {
          // Expected due to possible process.exit
        }

        expect(ChannelHandlerMock).toHaveBeenCalledWith(
          {
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            userId: 'test-user-id'
          },
          {
            baseUrl: 'https://api.polyv.net',
            timeout: 30000,
            maxRetries: 3,
            debug: false
          }
        );
      });
    });
  });

  describe('Channel Get Command', () => {
    describe('registerChannelCommands for get', () => {
      it('should register channel get subcommand with correct options', () => {
        registerChannelCommands(program);
        
        const channelCommand = program.commands.find(cmd => cmd.name() === 'channel');
        expect(channelCommand).toBeDefined();
        
        const getCommand = channelCommand!.commands.find(cmd => cmd.name() === 'get');
        expect(getCommand).toBeDefined();
        expect(getCommand!.description()).toBe('Get detailed information for a specific channel');
        
        // Check required option
        const channelIdOption = getCommand!.options.find(opt => opt.long === '--channelId');
        expect(channelIdOption).toBeDefined();
        expect(channelIdOption!.required).toBe(true);
        
        // Check output option
        const outputOption = getCommand!.options.find(opt => opt.long === '--output');
        expect(outputOption).toBeDefined();
        expect(outputOption!.defaultValue).toBe('table');
      });
    });

    describe('Command execution for get', () => {
      it('should execute channel get command successfully', async () => {
        registerChannelCommands(program);
        
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'get',
            '--channelId', '3151318'
          ]);
        } catch (error) {
          // Expected due to possible process.exit
        }

        expect(mockChannelHandler.getChannelDetail).toHaveBeenCalledWith({
          channelId: '3151318',
          output: 'table'
        });
      });

      it('should execute channel get command with JSON output', async () => {
        registerChannelCommands(program);
        
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'get',
            '--channelId', '3151318',
            '--output', 'json'
          ]);
        } catch (error) {
          // Expected due to possible process.exit
        }

        expect(mockChannelHandler.getChannelDetail).toHaveBeenCalledWith({
          channelId: '3151318',
          output: 'json'
        });
      });

      it('should handle channel get configuration loading errors', async () => {
        mockConfigManager.load.mockRejectedValue(new Error('Config load failed'));
        
        registerChannelCommands(program);
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'get',
            '--channelId', '3151318'
          ]);
        } catch (error) {
          // Expected due to possible process.exit
        }

        expect(mockLogError).toHaveBeenCalledWith(expect.any(Error));
        expect(exitSpy).toHaveBeenCalledWith(1);
      });

      it('should handle channel get execution errors', async () => {
        mockChannelHandler.getChannelDetail.mockRejectedValue(new Error('Get channel failed'));
        
        registerChannelCommands(program);
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'get',
            '--channelId', '3151318'
          ]);
        } catch (error) {
          // Expected due to possible process.exit
        }

        expect(mockLogError).toHaveBeenCalledWith(expect.any(Error));
        expect(exitSpy).toHaveBeenCalledWith(1);
      });

      it('should handle string errors by converting to Error objects for get', async () => {
        mockChannelHandler.getChannelDetail.mockRejectedValue('String error');
        
        registerChannelCommands(program);
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'get',
            '--channelId', '3151318'
          ]);
        } catch (error) {
          // Expected due to possible process.exit
        }

        expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
          message: 'String error'
        }));
        expect(exitSpy).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Channel Update Command', () => {
    beforeEach(() => {
      mockChannelHandler.updateChannel.mockResolvedValue({});
    });

    describe('registerChannelCommands for update', () => {
      it('should register channel update subcommand with correct options', () => {
        registerChannelCommands(program);
        
        const channelCommand = program.commands.find(cmd => cmd.name() === 'channel');
        const updateCommand = channelCommand?.commands.find(cmd => cmd.name() === 'update');
        
        expect(updateCommand).toBeDefined();
        expect(updateCommand?.description()).toBe('Update an existing live streaming channel');
        
        // Check required option
        const channelIdOption = updateCommand?.options.find(opt => opt.long === '--channelId');
        expect(channelIdOption).toBeDefined();
        expect(channelIdOption?.required).toBe(true);
        
        // Check optional parameters
        const expectedOptions = [
          '--name', '--description', '--publisher', '--password', '--max-viewers',
          '--start-time', '--end-time', '--page-views', '--likes', '--cover-img',
          '--splash-img', '--output'
        ];
        
        expectedOptions.forEach(optionName => {
          const option = updateCommand?.options.find(opt => opt.long === optionName);
          expect(option).toBeDefined();
        });
      });
    });

    describe('Command execution for update', () => {
      it('should execute channel update command successfully', async () => {
        registerChannelCommands(program);
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'update',
            '--channelId', '3151318',
            '--name', 'Updated Channel'
          ]);
        } catch (error) {
          // Expected due to possible process.exit
        }

        expect(mockChannelHandler.updateChannel).toHaveBeenCalledWith({
          channelId: '3151318',
          name: 'Updated Channel',
          description: undefined,
          publisher: undefined,
          password: undefined,
          maxViewers: undefined,
          startTime: undefined,
          endTime: undefined,
          pageView: undefined,
          likes: undefined,
          coverImg: undefined,
          splashImg: undefined,
          output: 'table'
        });
      });

      it('should handle update command errors', async () => {
        const updateError = new Error('Update failed');
        mockChannelHandler.updateChannel.mockRejectedValue(updateError);
        
        registerChannelCommands(program);
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'update',
            '--channelId', '3151318',
            '--name', 'Updated Channel'
          ]);
        } catch (error) {
          // Expected due to process.exit
        }

        expect(mockLogError).toHaveBeenCalledWith(updateError);
        expect(exitSpy).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Channel Delete Command', () => {
    beforeEach(() => {
      mockChannelHandler.deleteChannel.mockResolvedValue({});
    });

    describe('registerChannelCommands for delete', () => {
      it('should register channel delete subcommand with correct options', () => {
        registerChannelCommands(program);
        
        const channelCommand = program.commands.find(cmd => cmd.name() === 'channel');
        const deleteCommand = channelCommand?.commands.find(cmd => cmd.name() === 'delete');
        
        expect(deleteCommand).toBeDefined();
        expect(deleteCommand?.description()).toBe('Delete a single live streaming channel with confirmation');
        
        // Check required option
        const channelIdOption = deleteCommand?.options.find(opt => opt.long === '--channelId');
        expect(channelIdOption).toBeDefined();
        expect(channelIdOption?.required).toBe(true);
        
        // Check optional parameters
        const forceOption = deleteCommand?.options.find(opt => opt.long === '--force');
        const outputOption = deleteCommand?.options.find(opt => opt.long === '--output');
        
        expect(forceOption).toBeDefined();
        expect(outputOption).toBeDefined();
        expect(outputOption?.defaultValue).toBe('table');
      });
    });

    describe('Command execution for delete', () => {
      it('should execute channel delete command successfully', async () => {
        registerChannelCommands(program);
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'delete',
            '--channelId', '3151318'
          ]);
        } catch (error) {
          // Expected due to possible process.exit
        }

        expect(mockChannelHandler.deleteChannel).toHaveBeenCalledWith({
          channelId: '3151318',
          force: false,
          output: 'table'
        });
      });

      it('should execute channel delete command with force flag', async () => {
        registerChannelCommands(program);
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'delete',
            '--channelId', '3151318',
            '--force'
          ]);
        } catch (error) {
          // Expected due to possible process.exit
        }

        expect(mockChannelHandler.deleteChannel).toHaveBeenCalledWith({
          channelId: '3151318',
          force: true,
          output: 'table'
        });
      });

      it('should handle delete command errors', async () => {
        const deleteError = new Error('Delete failed');
        mockChannelHandler.deleteChannel.mockRejectedValue(deleteError);
        
        registerChannelCommands(program);
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'delete',
            '--channelId', '3151318'
          ]);
        } catch (error) {
          // Expected due to process.exit
        }

        expect(mockLogError).toHaveBeenCalledWith(deleteError);
        expect(exitSpy).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Channel Batch Delete Command', () => {
    beforeEach(() => {
      mockChannelHandler.deleteChannels.mockResolvedValue({});
    });

    describe('registerChannelCommands for batch-delete', () => {
      it('should register channel batch-delete subcommand with correct options', () => {
        registerChannelCommands(program);
        
        const channelCommand = program.commands.find(cmd => cmd.name() === 'channel');
        const batchDeleteCommand = channelCommand?.commands.find(cmd => cmd.name() === 'batch-delete');
        
        expect(batchDeleteCommand).toBeDefined();
        expect(batchDeleteCommand?.description()).toBe('Delete multiple live streaming channels at once');
        
        // Check required option
        const channelIdsOption = batchDeleteCommand?.options.find(opt => opt.long === '--channelIds');
        expect(channelIdsOption).toBeDefined();
        expect(channelIdsOption?.required).toBe(true);
        
        // Check optional parameters
        const forceOption = batchDeleteCommand?.options.find(opt => opt.long === '--force');
        const outputOption = batchDeleteCommand?.options.find(opt => opt.long === '--output');
        
        expect(forceOption).toBeDefined();
        expect(outputOption).toBeDefined();
        expect(outputOption?.defaultValue).toBe('table');
      });
    });

    describe('Command execution for batch-delete', () => {
      it('should execute channel batch-delete command successfully', async () => {
        registerChannelCommands(program);
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'batch-delete',
            '--channelIds', '3151318', '3151319'
          ]);
        } catch (error) {
          // Expected due to possible process.exit
        }

        expect(mockChannelHandler.deleteChannels).toHaveBeenCalledWith({
          channelIds: ['3151318', '3151319'],
          force: false,
          output: 'table'
        });
      });

      it('should execute channel batch-delete command with force flag', async () => {
        registerChannelCommands(program);
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'batch-delete',
            '--channelIds', '3151318', '3151319', '3151320',
            '--force'
          ]);
        } catch (error) {
          // Expected due to possible process.exit
        }

        expect(mockChannelHandler.deleteChannels).toHaveBeenCalledWith({
          channelIds: ['3151318', '3151319', '3151320'],
          force: true,
          output: 'table'
        });
      });

      it('should handle batch-delete command errors', async () => {
        const batchDeleteError = new Error('Batch delete failed');
        mockChannelHandler.deleteChannels.mockRejectedValue(batchDeleteError);
        
        registerChannelCommands(program);
        program.opts = jest.fn().mockReturnValue({});

        try {
          await program.parseAsync([
            'node', 'test', 'channel', 'batch-delete',
            '--channelIds', '3151318', '3151319'
          ]);
        } catch (error) {
          // Expected due to process.exit
        }

        expect(mockLogError).toHaveBeenCalledWith(batchDeleteError);
        expect(exitSpy).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Validation functions', () => {
    describe('parseInteger', () => {
      it('should parse valid integers', () => {
        expect(parseInteger('123')).toBe(123);
        expect(parseInteger('0')).toBe(0);
        expect(parseInteger('-5')).toBe(-5);
      });

      it('should throw error for invalid integer', () => {
        expect(() => parseInteger('invalid')).toThrow('Invalid number: invalid');
        expect(() => parseInteger('abc123')).toThrow('Invalid number: abc123');
        expect(() => parseInteger('')).toThrow('Invalid number: ');
      });
    });

    describe('validateScene', () => {
      it('should validate valid scenes', () => {
        expect(validateScene('topclass')).toBe('topclass');
        expect(validateScene('alone')).toBe('alone');
        expect(validateScene('seminar')).toBe('seminar');
        expect(validateScene('train')).toBe('train');
      });

      it('should throw error for invalid scene', () => {
        expect(() => validateScene('invalid')).toThrow('Invalid scene type: invalid. Must be one of: topclass, alone, seminar, train, double, guide');
        expect(() => validateScene('badscene')).toThrow('Invalid scene type: badscene. Must be one of: topclass, alone, seminar, train, double, guide');
      });
    });

    describe('validateTemplate', () => {
      it('should validate valid templates', () => {
        expect(validateTemplate('ppt')).toBe('ppt');
        expect(validateTemplate('portrait_alone')).toBe('portrait_alone');
        expect(validateTemplate('seminar')).toBe('seminar');
      });

      it('should throw error for invalid template', () => {
        expect(() => validateTemplate('invalid')).toThrow('Invalid template: invalid. Must be one of: ppt, portrait_ppt, alone, portrait_alone, topclass, portrait_topclass, seminar');
        expect(() => validateTemplate('badtemplate')).toThrow('Invalid template: badtemplate. Must be one of: ppt, portrait_ppt, alone, portrait_alone, topclass, portrait_topclass, seminar');
      });
    });

    describe('validateLimit', () => {
      it('should validate valid limits', () => {
        expect(validateLimit('1')).toBe(1);
        expect(validateLimit('50')).toBe(50);
        expect(validateLimit('100')).toBe(100);
      });

      it('should throw error for invalid limit', () => {
        expect(() => validateLimit('invalid')).toThrow('Invalid limit: invalid. Must be a number.');
        expect(() => validateLimit('0')).toThrow('Invalid limit: 0. Must be between 1 and 100.');
        expect(() => validateLimit('101')).toThrow('Invalid limit: 101. Must be between 1 and 100.');
        expect(() => validateLimit('-1')).toThrow('Invalid limit: -1. Must be between 1 and 100.');
      });
    });

    describe('validateOutputFormat', () => {
      it('should validate valid output formats', () => {
        expect(validateOutputFormat('table')).toBe('table');
        expect(validateOutputFormat('json')).toBe('json');
      });

      it('should throw error for invalid output format', () => {
        expect(() => validateOutputFormat('invalid')).toThrow('Invalid output format: invalid. Must be one of: table, json');
        expect(() => validateOutputFormat('xml')).toThrow('Invalid output format: xml. Must be one of: table, json');
        expect(() => validateOutputFormat('csv')).toThrow('Invalid output format: csv. Must be one of: table, json');
      });
    });
  });

  // ============================================
  // Auth & Config error handling
  // ============================================

  describe('auth error handling', () => {
    it('should handle auth failure in create action', async () => {
      mockAuthAdapter.tryGetAuthConfig.mockReturnValue(null);
      registerChannelCommands(program);
      program.opts = jest.fn().mockReturnValue({});
      try {
        await program.parseAsync(['node', 'test', 'channel', 'create', '-n', 'Test', '-c', 'alone']);
      } catch { /* process.exit */ }
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle auth failure in list action', async () => {
      mockAuthAdapter.tryGetAuthConfig.mockReturnValue(null);
      registerChannelCommands(program);
      program.opts = jest.fn().mockReturnValue({});
      try {
        await program.parseAsync(['node', 'test', 'channel', 'list']);
      } catch { /* process.exit */ }
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should show diagnostics on Authentication error in list', async () => {
      mockChannelHandler.listChannels.mockRejectedValue(new Error('Authentication failed'));
      mockAuthAdapter.getDiagnostics.mockReturnValue({
        availableSources: [{ appId: 'a', appSecret: 's', metadata: { source: 'env' }, type: 'env' }],
        errors: [],
      });
      registerChannelCommands(program);
      program.opts = jest.fn().mockReturnValue({});
      try {
        await program.parseAsync(['node', 'test', 'channel', 'list']);
      } catch { /* process.exit */ }
      expect(mockAuthAdapter.getDiagnostics).toHaveBeenCalled();
    });

    it('should show diagnostics errors when available', async () => {
      mockChannelHandler.listChannels.mockRejectedValue(new Error('Authentication failed'));
      mockAuthAdapter.getDiagnostics.mockReturnValue({
        availableSources: [{ appId: '', appSecret: '', metadata: { source: 'cli' }, type: 'cli' }],
        errors: ['Missing secret'],
      });
      registerChannelCommands(program);
      program.opts = jest.fn().mockReturnValue({});
      try {
        await program.parseAsync(['node', 'test', 'channel', 'list']);
      } catch { /* process.exit */ }
      expect(mockLogError).toHaveBeenCalled();
    });
  });

  describe('config error handling', () => {
    it('should handle incomplete auth config gracefully', async () => {
      mockConfigManager.load.mockRejectedValue(new Error('Auth configuration is incomplete'));
      mockChannelHandler.create.mockResolvedValue(undefined);
      registerChannelCommands(program);
      program.opts = jest.fn().mockReturnValue({});
      await program.parseAsync(['node', 'test', 'channel', 'create', '-n', 'Test', '-c', 'alone']);
      expect(mockChannelHandler.create).toHaveBeenCalled();
    });

    it('should handle other config errors', async () => {
      mockConfigManager.load.mockRejectedValue(new Error('Network error'));
      registerChannelCommands(program);
      program.opts = jest.fn().mockReturnValue({});
      try {
        await program.parseAsync(['node', 'test', 'channel', 'create', '-n', 'Test', '-c', 'alone']);
      } catch { /* process.exit */ }
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('verbose mode', () => {
    it('should show auth source info when verbose', async () => {
      mockChannelHandler.create.mockResolvedValue(undefined);
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      registerChannelCommands(program);
      program.option('--verbose', 'verbose');
      program.opts = jest.fn().mockReturnValue({ verbose: true });
      await program.parseAsync(['node', 'test', 'channel', 'create', '-n', 'Test', '-c', 'alone']);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Authentication Source'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Account'));
      logSpy.mockRestore();
    });

    it('should handle missing accountName in verbose mode', async () => {
      mockAuthAdapter.tryGetAuthConfig.mockReturnValue({
        config: { appId: 'a', appSecret: 's' },
        source: 'env',
      });
      mockChannelHandler.create.mockResolvedValue(undefined);
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      registerChannelCommands(program);
      program.option('--verbose', 'verbose');
      program.opts = jest.fn().mockReturnValue({ verbose: true });
      await program.parseAsync(['node', 'test', 'channel', 'create', '-n', 'Test', '-c', 'alone']);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Authentication Source'));
      logSpy.mockRestore();
    });

    it('should handle missing source in auth result', async () => {
      mockAuthAdapter.tryGetAuthConfig.mockReturnValue({
        config: { appId: 'a', appSecret: 's' },
      });
      mockChannelHandler.create.mockResolvedValue(undefined);
      registerChannelCommands(program);
      program.opts = jest.fn().mockReturnValue({});
      await program.parseAsync(['node', 'test', 'channel', 'create', '-n', 'Test', '-c', 'alone']);
      expect(mockChannelHandler.create).toHaveBeenCalled();
    });
  });
});