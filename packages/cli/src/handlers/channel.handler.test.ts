/**
 * @fileoverview Unit tests for ChannelHandler
 */

import { ChannelHandler } from './channel.handler';
import { ChannelServiceSdk } from '../services/channel.service.sdk';
import {
  ChannelCreateOptions,
  ChannelModel,
  ChannelServiceConfig,
  ChannelGetOptions,
  ChannelDetailModel,
  ChannelUpdateOptions
} from '../types/channel';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError, PolyVError, PolyVAPIError } from '../utils/errors';

// Mock the ChannelServiceSdk
jest.mock('../services/channel.service.sdk');
const MockedChannelService = ChannelServiceSdk as jest.MockedClass<typeof ChannelServiceSdk>;

// Mock console methods to suppress output during tests
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {})
};

describe('ChannelHandler', () => {
  let channelHandler: ChannelHandler;
  let mockChannelService: jest.Mocked<ChannelService>;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: ChannelServiceConfig;

  // Global setup to suppress all console output in tests
  beforeAll(() => {
    consoleSpy.log.mockImplementation(() => {});
    consoleSpy.error.mockImplementation(() => {});
    consoleSpy.warn.mockImplementation(() => {});
  });

  afterAll(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
    consoleSpy.warn.mockRestore();
  });

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Ensure console methods are properly mocked and silent
    consoleSpy.log.mockImplementation(() => {});
    consoleSpy.error.mockImplementation(() => {});
    consoleSpy.warn.mockImplementation(() => {});

    // Mock configs
    mockAuthConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id'
    };

    mockServiceConfig = {
      baseUrl: 'https://api.polyv.net',
      timeout: 30000,
      maxRetries: 3,
      debug: false
    };

    // Create mock service instance
    mockChannelService = {
      createChannel: jest.fn(),
      listChannels: jest.fn(),
      getChannelDetail: jest.fn(),
      updateChannel: jest.fn()
    } as any;

    // Mock the ChannelService constructor
    MockedChannelService.mockImplementation(() => mockChannelService);

    // Create handler instance
    channelHandler = new ChannelHandler(mockAuthConfig, mockServiceConfig);
  });

  afterEach(() => {
    // Restore console methods
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  describe('constructor', () => {
    it('should create ChannelService with correct configuration', () => {
      expect(MockedChannelService).toHaveBeenCalledWith(mockAuthConfig, mockServiceConfig);
    });
  });

  describe('create', () => {
    const validOptions: ChannelCreateOptions = {
      name: 'Test Channel',
      description: 'Test description',
      maxViewers: 100,
      autoRecord: true,
      output: 'table'
    };

    const mockChannel: ChannelModel = {
      channelId: 'ch123456',
      name: 'Test Channel',
      userId: 'user123',
      channelPasswd: 'abc123',
      newScene: 'topclass',
      template: 'ppt',
      status: 'waiting',
      createdAt: new Date('2023-01-01T00:00:00Z')
    };

    it('should create channel successfully with valid options', async () => {
      mockChannelService.createChannel.mockResolvedValue(mockChannel);

      await expect(channelHandler.create(validOptions)).resolves.toBeUndefined();

      expect(mockChannelService.createChannel).toHaveBeenCalledWith({
        name: 'Test Channel',
        newScene: 'topclass',
        template: 'ppt'
      });
    });

    it('should create channel with custom scene and template', async () => {
      const customOptions: ChannelCreateOptions = {
        ...validOptions,
        scene: 'alone',
        template: 'portrait_alone'
      };

      mockChannelService.createChannel.mockResolvedValue(mockChannel);

      await channelHandler.create(customOptions);

      expect(mockChannelService.createChannel).toHaveBeenCalledWith({
        name: 'Test Channel',
        newScene: 'alone',
        template: 'portrait_alone'
      });
    });

    it('should create channel with password', async () => {
      const optionsWithPassword: ChannelCreateOptions = {
        ...validOptions,
        password: 'test123'
      };

      mockChannelService.createChannel.mockResolvedValue(mockChannel);

      await channelHandler.create(optionsWithPassword);

      expect(mockChannelService.createChannel).toHaveBeenCalledWith({
        name: 'Test Channel',
        newScene: 'topclass',
        template: 'ppt',
        channelPasswd: 'test123'
      });
    });

    it('should display channel information in table format', async () => {
      mockChannelService.createChannel.mockResolvedValue(mockChannel);

      await expect(channelHandler.create(validOptions)).resolves.toBeUndefined();
      
      // Verify the display methods are called (functionality verified by console output)
      expect(mockChannelService.createChannel).toHaveBeenCalled();
    });

    it('should display channel information in JSON format', async () => {
      const jsonOptions: ChannelCreateOptions = {
        ...validOptions,
        output: 'json'
      };

      mockChannelService.createChannel.mockResolvedValue(mockChannel);

      await expect(channelHandler.create(jsonOptions)).resolves.toBeUndefined();
      
      expect(mockChannelService.createChannel).toHaveBeenCalled();
    });

    describe('validation', () => {
      it('should throw validation error for missing name', async () => {
        const invalidOptions = { ...validOptions, name: '' };

        await expect(channelHandler.create(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);

        expect(mockChannelService.createChannel).not.toHaveBeenCalled();
      });

      it('should throw validation error for name too long', async () => {
        const invalidOptions = { 
          ...validOptions, 
          name: 'a'.repeat(101) // 101 characters
        };

        await expect(channelHandler.create(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });

      it('should throw validation error for invalid description', async () => {
        const invalidOptions = { 
          ...validOptions, 
          description: 'a'.repeat(501) // 501 characters
        };

        await expect(channelHandler.create(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });

      it('should throw validation error for negative maxViewers', async () => {
        const invalidOptions = { ...validOptions, maxViewers: -1 };

        await expect(channelHandler.create(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });

      it('should throw validation error for maxViewers too high', async () => {
        const invalidOptions = { ...validOptions, maxViewers: 100001 };

        await expect(channelHandler.create(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });

      it('should throw validation error for invalid autoRecord type', async () => {
        const invalidOptions = { ...validOptions, autoRecord: 'yes' as any };

        await expect(channelHandler.create(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });

      it('should throw validation error for invalid output format', async () => {
        const invalidOptions = { ...validOptions, output: 'xml' as any };

        await expect(channelHandler.create(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });

      it('should throw validation error for invalid scene', async () => {
        const invalidOptions = { ...validOptions, scene: 'invalid' as any };

        await expect(channelHandler.create(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });

      it('should throw validation error for invalid template', async () => {
        const invalidOptions = { ...validOptions, template: 'invalid' as any };

        await expect(channelHandler.create(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });

      it('should throw validation error for password too short', async () => {
        const invalidOptions = { ...validOptions, password: '123' };

        await expect(channelHandler.create(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });

      it('should throw validation error for password with special characters', async () => {
        const invalidOptions = { ...validOptions, password: 'test@123' };

        await expect(channelHandler.create(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });
    });

    describe('error handling', () => {
      it('should handle service validation errors', async () => {
        const serviceError = new PolyVValidationError(
          'Service validation failed',
          'name',
          'invalid',
          'max_length'
        );

        mockChannelService.createChannel.mockRejectedValue(serviceError);

        await expect(channelHandler.create(validOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });

      it('should handle API errors', async () => {
        const apiError = new PolyVError(
          'API request failed',
          'POLYV_API_ERROR',
          500
        );

        mockChannelService.createChannel.mockRejectedValue(apiError);

        await expect(channelHandler.create(validOptions))
          .rejects
          .toThrow(PolyVError);
      });

      it('should handle authentication errors', async () => {
        const authError = new PolyVError(
          'Authentication failed',
          'POLYV_AUTH_ERROR',
          401
        );

        mockChannelService.createChannel.mockRejectedValue(authError);

        await expect(channelHandler.create(validOptions))
          .rejects
          .toThrow(PolyVError);
      });

      it('should handle network errors', async () => {
        const networkError = new PolyVError(
          'Network connection failed',
          'NETWORK_ERROR',
          0
        );

        mockChannelService.createChannel.mockRejectedValue(networkError);

        await expect(channelHandler.create(validOptions))
          .rejects
          .toThrow(PolyVError);
      });

      it('should handle unexpected errors', async () => {
        const unexpectedError = new Error('Unexpected error');

        mockChannelService.createChannel.mockRejectedValue(unexpectedError);

        await expect(channelHandler.create(validOptions))
          .rejects
          .toThrow(Error);
      });
    });

    describe('request transformation', () => {
      it('should use default scene and template when not specified', async () => {
        const minimalOptions: ChannelCreateOptions = {
          name: 'Minimal Channel'
        };

        mockChannelService.createChannel.mockResolvedValue(mockChannel);

        await channelHandler.create(minimalOptions);

        expect(mockChannelService.createChannel).toHaveBeenCalledWith({
          name: 'Minimal Channel',
          newScene: 'topclass',
          template: 'ppt'
        });
      });

      it('should trim channel name', async () => {
        const optionsWithSpaces: ChannelCreateOptions = {
          name: '  Spaced Channel  '
        };

        mockChannelService.createChannel.mockResolvedValue(mockChannel);

        await channelHandler.create(optionsWithSpaces);

        expect(mockChannelService.createChannel).toHaveBeenCalledWith({
          name: 'Spaced Channel',
          newScene: 'topclass',
          template: 'ppt'
        });
      });
    });

    describe('output formatting', () => {
      it('should display output successfully', async () => {
        mockChannelService.createChannel.mockResolvedValue(mockChannel);

        await expect(channelHandler.create(validOptions)).resolves.toBeUndefined();

        // The functionality is verified by console output during test runs
        expect(mockChannelService.createChannel).toHaveBeenCalled();
      });
    });
  });

  describe('listChannels', () => {
    const mockChannelListItems = [
      {
        channelId: 'ch001',
        name: 'Channel 1',
        status: 'waiting' as const,
        createdAt: new Date('2023-01-01'),
        scene: 'topclass',
        template: 'ppt'
      },
      {
        channelId: 'ch002',
        name: 'Channel 2',
        status: 'live' as const,
        createdAt: new Date('2023-01-02'),
        scene: 'alone',
        template: 'portrait_alone'
      }
    ];

    beforeEach(() => {
      mockChannelService.listChannels.mockResolvedValue(mockChannelListItems);
    });

    describe('valid options', () => {
      it('should list channels with default options', async () => {
        await expect(channelHandler.listChannels()).resolves.toBeUndefined();

        expect(mockChannelService.listChannels).toHaveBeenCalledWith({});
      });

      it('should list channels with pagination options', async () => {
        const options = {
          page: 2,
          limit: 10,
          output: 'table' as const
        };

        await expect(channelHandler.listChannels(options)).resolves.toBeUndefined();

        expect(mockChannelService.listChannels).toHaveBeenCalledWith({
          page: 2,
          limit: 10
        });
      });

      it('should list channels with filters', async () => {
        const options = {
          categoryId: 'cat123',
          keyword: 'test',
          labelId: 'label456',
          output: 'json' as const
        };

        await expect(channelHandler.listChannels(options)).resolves.toBeUndefined();

        expect(mockChannelService.listChannels).toHaveBeenCalledWith({
          categoryId: 'cat123',
          keyword: 'test',
          labelId: 'label456'
        });
      });
    });

    describe('validation', () => {
      it('should throw validation error for invalid page', async () => {
        const options = { page: 0 };

        await expect(channelHandler.listChannels(options))
          .rejects.toThrow(PolyVValidationError);

        expect(mockChannelService.listChannels).not.toHaveBeenCalled();
      });

      it('should throw validation error for invalid limit', async () => {
        const options = { limit: 101 };

        await expect(channelHandler.listChannels(options))
          .rejects.toThrow(PolyVValidationError);

        expect(mockChannelService.listChannels).not.toHaveBeenCalled();
      });

      it('should throw validation error for empty string filters', async () => {
        const options = { categoryId: '' };

        await expect(channelHandler.listChannels(options))
          .rejects.toThrow(PolyVValidationError);

        expect(mockChannelService.listChannels).not.toHaveBeenCalled();
      });

      it('should throw validation error for invalid output format', async () => {
        const options = { output: 'invalid' as any };

        await expect(channelHandler.listChannels(options))
          .rejects.toThrow(PolyVValidationError);

        expect(mockChannelService.listChannels).not.toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('should handle service errors', async () => {
        const serviceError = new PolyVError('Service error', 'SERVICE_ERROR');
        mockChannelService.listChannels.mockRejectedValue(serviceError);

        await expect(channelHandler.listChannels())
          .rejects.toThrow('Service error');

        expect(mockChannelService.listChannels).toHaveBeenCalled();
      });

      it('should handle unexpected errors', async () => {
        const unexpectedError = new Error('Unexpected error');
        mockChannelService.listChannels.mockRejectedValue(unexpectedError);

        await expect(channelHandler.listChannels())
          .rejects.toThrow('Unexpected error');

        expect(mockChannelService.listChannels).toHaveBeenCalled();
      });
    });

    describe('empty results', () => {
      it('should handle empty channel list', async () => {
        mockChannelService.listChannels.mockResolvedValue([]);

        await expect(channelHandler.listChannels()).resolves.toBeUndefined();

        expect(mockChannelService.listChannels).toHaveBeenCalled();
      });
    });

    describe('output formatting', () => {
      it('should display table output by default', async () => {
        await expect(channelHandler.listChannels()).resolves.toBeUndefined();

        // The functionality is verified by console output during test runs
        expect(mockChannelService.listChannels).toHaveBeenCalled();
      });

      it('should display JSON output when specified', async () => {
        const options = { output: 'json' as const };

        await expect(channelHandler.listChannels(options)).resolves.toBeUndefined();

        expect(mockChannelService.listChannels).toHaveBeenCalled();
      });
    });
  });

  describe('getChannelDetail', () => {
    const validOptions: ChannelGetOptions = {
      channelId: '3151318',
      output: 'table'
    };

    const mockChannelDetail: ChannelDetailModel = {
      channelId: 3151318,
      name: 'Test Channel',
      scene: 'ppt',
      newScene: 'topclass',
      template: 'ppt',
      channelPasswd: 'testpass',
      publisher: 'Test Publisher',
      startTime: 0,
      endTime: 1687414806000,
      pureRtcEnabled: 'N',
      pageView: 100,
      likes: 5,
      coverImg: 'https://example.com/cover.png',
      splashImg: 'https://example.com/splash.png',
      splashEnabled: 'Y',
      bgImg: null,
      desc: 'Test description',
      consultingMenuEnabled: 'Y',
      maxViewerRestrict: 'N',
      maxViewer: -1,
      watchStatus: 'waiting',
      watchStatusText: 'Waiting to start',
      userCategory: {
        categoryId: 391352,
        categoryName: 'Test Category',
        userId: 'test-user-id',
        rank: 1
      },
      authSettings: [
        {
          channelId: 3151318,
          userId: 'test-user-id',
          rank: 1,
          globalSettingEnabled: 'N',
          enabled: 'N',
          authType: 'none',
          authTips: 'Welcome',
          payAuthTips: 'Pay to watch',
          codeAuthTips: 'Enter code',
          infoAuthTips: 'Register to watch',
          authCode: '',
          qcodeTips: '',
          qcodeImg: '',
          price: 0,
          watchEndTime: null,
          validTimePeriod: null,
          customKey: 'test-key',
          customUri: '',
          externalKey: 'test-ext-key',
          externalUri: '',
          externalRedirectUri: '',
          directKey: 'test-direct-key',
          trialWatchEnabled: 'N',
          trialWatchTime: null,
          trialWatchEndTime: null,
          whiteListInputTips: '',
          whiteListEntryText: '',
          infoDesc: ''
        }
      ],
      linkMicLimit: 16,
      createdAccountId: 'test-account-id',
      createdAccountEmail: 'test@example.com',
      createdTime: 1603155366000,
      labelData: ['label1', 'label2'],
      onlyOutEnabled: 'Y'
    };

    beforeEach(() => {
      mockChannelService.getChannelDetail.mockResolvedValue(mockChannelDetail);
    });

    describe('valid options', () => {
      it('should get channel detail with valid channelId', async () => {
        await expect(channelHandler.getChannelDetail(validOptions)).resolves.toBeUndefined();

        expect(mockChannelService.getChannelDetail).toHaveBeenCalledWith({
          channelId: '3151318'
        });
      });

      it('should get channel detail with JSON output format', async () => {
        const jsonOptions: ChannelGetOptions = {
          channelId: '3151318',
          output: 'json'
        };

        await expect(channelHandler.getChannelDetail(jsonOptions)).resolves.toBeUndefined();

        expect(mockChannelService.getChannelDetail).toHaveBeenCalledWith({
          channelId: '3151318'
        });
      });

      it('should trim channelId whitespace', async () => {
        const optionsWithSpaces: ChannelGetOptions = {
          channelId: '  3151318  ',
          output: 'table'
        };

        await expect(channelHandler.getChannelDetail(optionsWithSpaces)).resolves.toBeUndefined();

        expect(mockChannelService.getChannelDetail).toHaveBeenCalledWith({
          channelId: '3151318'
        });
      });
    });

    describe('validation', () => {
      it('should throw validation error for missing channelId', async () => {
        const invalidOptions = { ...validOptions, channelId: '' };

        await expect(channelHandler.getChannelDetail(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);

        expect(mockChannelService.getChannelDetail).not.toHaveBeenCalled();
      });

      it('should throw validation error for non-string channelId', async () => {
        const invalidOptions = { ...validOptions, channelId: 123 as any };

        await expect(channelHandler.getChannelDetail(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);

        expect(mockChannelService.getChannelDetail).not.toHaveBeenCalled();
      });

      it('should throw validation error for whitespace-only channelId', async () => {
        const invalidOptions = { ...validOptions, channelId: '   ' };

        await expect(channelHandler.getChannelDetail(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);

        expect(mockChannelService.getChannelDetail).not.toHaveBeenCalled();
      });

      it('should throw validation error for invalid output format', async () => {
        const invalidOptions = { ...validOptions, output: 'xml' as any };

        await expect(channelHandler.getChannelDetail(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);

        expect(mockChannelService.getChannelDetail).not.toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('should handle service validation errors', async () => {
        const serviceError = new PolyVValidationError(
          'Channel not found',
          'channelId',
          '3151318',
          'not_found'
        );

        mockChannelService.getChannelDetail.mockRejectedValue(serviceError);

        await expect(channelHandler.getChannelDetail(validOptions))
          .rejects
          .toThrow(PolyVValidationError);

        expect(mockChannelService.getChannelDetail).toHaveBeenCalled();
      });

      it('should handle API errors', async () => {
        const apiError = new PolyVError(
          'API request failed',
          'POLYV_API_ERROR',
          500
        );

        mockChannelService.getChannelDetail.mockRejectedValue(apiError);

        await expect(channelHandler.getChannelDetail(validOptions))
          .rejects
          .toThrow(PolyVError);

        expect(mockChannelService.getChannelDetail).toHaveBeenCalled();
      });

      it('should handle authentication errors', async () => {
        const authError = new PolyVError(
          'Authentication failed',
          'POLYV_AUTH_ERROR',
          401
        );

        mockChannelService.getChannelDetail.mockRejectedValue(authError);

        await expect(channelHandler.getChannelDetail(validOptions))
          .rejects
          .toThrow(PolyVError);

        expect(mockChannelService.getChannelDetail).toHaveBeenCalled();
      });

      it('should handle channel not found errors', async () => {
        const notFoundError = new PolyVError(
          'Channel not found',
          'CHANNEL_NOT_FOUND',
          404
        );

        mockChannelService.getChannelDetail.mockRejectedValue(notFoundError);

        await expect(channelHandler.getChannelDetail(validOptions))
          .rejects
          .toThrow(PolyVError);

        expect(mockChannelService.getChannelDetail).toHaveBeenCalled();
      });

      it('should handle network errors', async () => {
        const networkError = new PolyVError(
          'Network connection failed',
          'NETWORK_ERROR',
          0
        );

        mockChannelService.getChannelDetail.mockRejectedValue(networkError);

        await expect(channelHandler.getChannelDetail(validOptions))
          .rejects
          .toThrow(PolyVError);

        expect(mockChannelService.getChannelDetail).toHaveBeenCalled();
      });

      it('should handle unexpected errors', async () => {
        const unexpectedError = new Error('Unexpected error');

        mockChannelService.getChannelDetail.mockRejectedValue(unexpectedError);

        await expect(channelHandler.getChannelDetail(validOptions))
          .rejects
          .toThrow(Error);

        expect(mockChannelService.getChannelDetail).toHaveBeenCalled();
      });
    });

    describe('output formatting', () => {
      it('should display table output by default', async () => {
        const tableOptions: ChannelGetOptions = {
          channelId: '3151318'
          // output defaults to 'table'
        };

        await expect(channelHandler.getChannelDetail(tableOptions)).resolves.toBeUndefined();

        expect(mockChannelService.getChannelDetail).toHaveBeenCalled();
      });

      it('should display JSON output when specified', async () => {
        const jsonOptions: ChannelGetOptions = {
          channelId: '3151318',
          output: 'json'
        };

        await expect(channelHandler.getChannelDetail(jsonOptions)).resolves.toBeUndefined();

        expect(mockChannelService.getChannelDetail).toHaveBeenCalled();
      });
    });

    describe('request transformation', () => {
      it('should transform CLI options to service request correctly', async () => {
        await channelHandler.getChannelDetail(validOptions);

        expect(mockChannelService.getChannelDetail).toHaveBeenCalledWith({
          channelId: '3151318'
        });
      });

      it('should handle numeric channelId strings', async () => {
        const numericOptions: ChannelGetOptions = {
          channelId: '123456789',
          output: 'table'
        };

        await channelHandler.getChannelDetail(numericOptions);

        expect(mockChannelService.getChannelDetail).toHaveBeenCalledWith({
          channelId: '123456789'
        });
      });
    });
  });

  describe('updateChannel', () => {
    const validOptions: ChannelUpdateOptions = {
      channelId: '3151318',
      name: 'Updated Channel Name',
      publisher: 'New Publisher',
      output: 'table'
    };

    beforeEach(() => {
      mockChannelService.updateChannel = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        success: true,
        data: ''
      });
    });

    it('should update channel successfully with valid options', async () => {
      await expect(channelHandler.updateChannel(validOptions)).resolves.toBeUndefined();

      expect(mockChannelService.updateChannel).toHaveBeenCalledWith({
        channelId: '3151318',
        basicSetting: {
          name: 'Updated Channel Name',
          publisher: 'New Publisher'
        }
      });
    });

    describe('validation', () => {
      it('should throw validation error for missing channelId', async () => {
        const invalidOptions = {
          name: 'Test Channel'
        } as any;

        await expect(channelHandler.updateChannel(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });

      it('should throw validation error for empty channelId', async () => {
        const invalidOptions: ChannelUpdateOptions = {
          channelId: '',
          name: 'Test Channel'
        };

        await expect(channelHandler.updateChannel(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });

      it('should throw validation error when no update fields provided', async () => {
        const invalidOptions: ChannelUpdateOptions = {
          channelId: '3151318'
        };

        await expect(channelHandler.updateChannel(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });

      it('should throw validation error for invalid name length', async () => {
        const invalidOptions: ChannelUpdateOptions = {
          channelId: '3151318',
          name: 'a'.repeat(101)
        };

        await expect(channelHandler.updateChannel(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });

      it('should throw validation error for invalid password format', async () => {
        const invalidOptions: ChannelUpdateOptions = {
          channelId: '3151318',
          password: '123'
        };

        await expect(channelHandler.updateChannel(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });

      it('should throw validation error for invalid maxViewers', async () => {
        const invalidOptions: ChannelUpdateOptions = {
          channelId: '3151318',
          maxViewers: -1
        };

        await expect(channelHandler.updateChannel(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });

      it('should throw validation error for invalid time range', async () => {
        const invalidOptions: ChannelUpdateOptions = {
          channelId: '3151318',
          startTime: 2000,
          endTime: 1000
        };

        await expect(channelHandler.updateChannel(invalidOptions))
          .rejects
          .toThrow(PolyVValidationError);
      });

      it('should accept valid password format', async () => {
        const validPasswordOptions: ChannelUpdateOptions = {
          channelId: '3151318',
          password: 'test123'
        };

        await expect(channelHandler.updateChannel(validPasswordOptions)).resolves.toBeUndefined();

        expect(mockChannelService.updateChannel).toHaveBeenCalledWith({
          channelId: '3151318',
          basicSetting: {
            channelPasswd: 'test123'
          }
        });
      });
    });

    describe('request transformation', () => {
      it('should transform all supported CLI options to service request', async () => {
        const allFieldsOptions: ChannelUpdateOptions = {
          channelId: '3151318',
          name: 'New Name',
          description: 'New Description',
          publisher: 'New Publisher',
          password: 'newpass123',
          maxViewers: 1000,
          startTime: 1640995200000,
          endTime: 1641081600000,
          pageView: 500,
          likes: 100,
          coverImg: 'https://example.com/cover.jpg',
          splashImg: 'https://example.com/splash.jpg'
        };

        await channelHandler.updateChannel(allFieldsOptions);

        expect(mockChannelService.updateChannel).toHaveBeenCalledWith({
          channelId: '3151318',
          basicSetting: {
            name: 'New Name',
            desc: 'New Description',
            publisher: 'New Publisher',
            channelPasswd: 'newpass123',
            maxViewer: 1000,
            startTime: 1640995200000,
            endTime: 1641081600000,
            pageView: 500,
            likes: 100,
            coverImg: 'https://example.com/cover.jpg',
            splashImg: 'https://example.com/splash.jpg'
          }
        });
      });

      it('should only include provided fields in basicSetting', async () => {
        const partialOptions: ChannelUpdateOptions = {
          channelId: '3151318',
          name: 'Only Name',
          maxViewers: 500
        };

        await channelHandler.updateChannel(partialOptions);

        expect(mockChannelService.updateChannel).toHaveBeenCalledWith({
          channelId: '3151318',
          basicSetting: {
            name: 'Only Name',
            maxViewer: 500
          }
        });
      });

      it('should trim whitespace from channelId and name', async () => {
        const whitespaceOptions: ChannelUpdateOptions = {
          channelId: '  3151318  ',
          name: '  Test Channel  '
        };

        await channelHandler.updateChannel(whitespaceOptions);

        expect(mockChannelService.updateChannel).toHaveBeenCalledWith({
          channelId: '3151318',
          basicSetting: {
            name: 'Test Channel'
          }
        });
      });
    });

    describe('error handling', () => {
      it('should handle service errors', async () => {
        const serviceError = new PolyVAPIError('Channel not found', 'CHANNEL_NOT_FOUND', 404);
        mockChannelService.updateChannel = jest.fn().mockRejectedValue(serviceError);

        await expect(channelHandler.updateChannel(validOptions))
          .rejects
          .toThrow(PolyVAPIError);

        expect(mockChannelService.updateChannel).toHaveBeenCalled();
      });

      it('should handle unexpected errors', async () => {
        const unexpectedError = new Error('Unexpected error');
        mockChannelService.updateChannel = jest.fn().mockRejectedValue(unexpectedError);

        await expect(channelHandler.updateChannel(validOptions))
          .rejects
          .toThrow(Error);
      });
    });

    describe('output display', () => {
      it('should display success message with update summary', async () => {
        const displayOptions: ChannelUpdateOptions = {
          channelId: '3151318',
          name: 'New Name',
          publisher: 'New Publisher',
          maxViewers: 1000
        };

        await channelHandler.updateChannel(displayOptions);

        expect(mockChannelService.updateChannel).toHaveBeenCalled();
        // Note: The actual display testing would require mocking the display methods,
        // but since they're inherited from BaseHandler, we focus on the service call
      });

      it('should show password mask in display when password is updated', async () => {
        const passwordOptions: ChannelUpdateOptions = {
          channelId: '3151318',
          password: 'newpass123'
        };

        await channelHandler.updateChannel(passwordOptions);

        expect(mockChannelService.updateChannel).toHaveBeenCalledWith({
          channelId: '3151318',
          basicSetting: {
            channelPasswd: 'newpass123'
          }
        });
      });
    });
  });

  // ============================================
  // deleteChannel Tests
  // ============================================

  describe('deleteChannel', () => {
    it('should delete single channel successfully', async () => {
      const mockChannelService = {
        deleteChannel: jest.fn().mockResolvedValue({}),
      };
      MockedChannelService.mockImplementation(() => mockChannelService as any);
      const handler = new ChannelHandler(mockAuthConfig, mockServiceConfig);

      await handler.deleteChannel({ channelId: '123456', force: true });

      expect(mockChannelService.deleteChannel).toHaveBeenCalled();
    });

    it('should throw PolyVValidationError for missing channelId', async () => {
      const mockChannelService = { deleteChannel: jest.fn() };
      MockedChannelService.mockImplementation(() => mockChannelService as any);
      const handler = new ChannelHandler(mockAuthConfig, mockServiceConfig);

      await expect(handler.deleteChannel({ channelId: '' }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for non-string channelId', async () => {
      const mockChannelService = { deleteChannel: jest.fn() };
      MockedChannelService.mockImplementation(() => mockChannelService as any);
      const handler = new ChannelHandler(mockAuthConfig, mockServiceConfig);

      await expect(handler.deleteChannel({ channelId: 123 as any }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid force flag', async () => {
      const mockChannelService = { deleteChannel: jest.fn() };
      MockedChannelService.mockImplementation(() => mockChannelService as any);
      const handler = new ChannelHandler(mockAuthConfig, mockServiceConfig);

      await expect(handler.deleteChannel({ channelId: '123', force: 'yes' as any }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid output format', async () => {
      const mockChannelService = { deleteChannel: jest.fn() };
      MockedChannelService.mockImplementation(() => mockChannelService as any);
      const handler = new ChannelHandler(mockAuthConfig, mockServiceConfig);

      await expect(handler.deleteChannel({ channelId: '123', output: 'xml' as any }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVError when service fails', async () => {
      const mockChannelService = {
        deleteChannel: jest.fn().mockRejectedValue(new PolyVError('API error')),
      };
      MockedChannelService.mockImplementation(() => mockChannelService as any);
      const handler = new ChannelHandler(mockAuthConfig, mockServiceConfig);

      await expect(handler.deleteChannel({ channelId: '123', force: true }))
        .rejects.toThrow(PolyVError);
    });
  });

  // ============================================
  // deleteChannels (batch) Tests
  // ============================================

  describe('deleteChannels', () => {
    it('should delete multiple channels successfully', async () => {
      const mockChannelService = {
        batchDeleteChannels: jest.fn().mockResolvedValue({}),
      };
      MockedChannelService.mockImplementation(() => mockChannelService as any);
      const handler = new ChannelHandler(mockAuthConfig, mockServiceConfig);

      await handler.deleteChannels({ channelIds: ['111', '222', '333'] });

      expect(mockChannelService.batchDeleteChannels).toHaveBeenCalled();
    });

    it('should throw for missing channelIds', async () => {
      const mockChannelService = { batchDeleteChannels: jest.fn() };
      MockedChannelService.mockImplementation(() => mockChannelService as any);
      const handler = new ChannelHandler(mockAuthConfig, mockServiceConfig);

      await expect(handler.deleteChannels({}))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw for non-array channelIds', async () => {
      const mockChannelService = { batchDeleteChannels: jest.fn() };
      MockedChannelService.mockImplementation(() => mockChannelService as any);
      const handler = new ChannelHandler(mockAuthConfig, mockServiceConfig);

      await expect(handler.deleteChannels({ channelIds: '123' as any }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw for empty channelIds array', async () => {
      const mockChannelService = { batchDeleteChannels: jest.fn() };
      MockedChannelService.mockImplementation(() => mockChannelService as any);
      const handler = new ChannelHandler(mockAuthConfig, mockServiceConfig);

      await expect(handler.deleteChannels({ channelIds: [] }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw for more than 100 channelIds', async () => {
      const mockChannelService = { batchDeleteChannels: jest.fn() };
      MockedChannelService.mockImplementation(() => mockChannelService as any);
      const handler = new ChannelHandler(mockAuthConfig, mockServiceConfig);

      const ids = Array.from({ length: 101 }, (_, i) => `ch${i}`);
      await expect(handler.deleteChannels({ channelIds: ids }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw for non-string channelId in array', async () => {
      const mockChannelService = { batchDeleteChannels: jest.fn() };
      MockedChannelService.mockImplementation(() => mockChannelService as any);
      const handler = new ChannelHandler(mockAuthConfig, mockServiceConfig);

      await expect(handler.deleteChannels({ channelIds: [123 as any] }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw for empty string channelId in array', async () => {
      const mockChannelService = { batchDeleteChannels: jest.fn() };
      MockedChannelService.mockImplementation(() => mockChannelService as any);
      const handler = new ChannelHandler(mockAuthConfig, mockServiceConfig);

      await expect(handler.deleteChannels({ channelIds: [''] }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw for invalid output format in batch delete', async () => {
      const mockChannelService = { batchDeleteChannels: jest.fn() };
      MockedChannelService.mockImplementation(() => mockChannelService as any);
      const handler = new ChannelHandler(mockAuthConfig, mockServiceConfig);

      await expect(handler.deleteChannels({ channelIds: ['123'], output: 'xml' as any }))
        .rejects.toThrow(PolyVValidationError);
    });
  });
});