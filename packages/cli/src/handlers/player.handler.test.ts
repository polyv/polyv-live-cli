/**
 * @fileoverview Unit tests for PlayerHandler - ATDD Failing Tests
 * @story 10.5: 播放器设置命令
 *
 * These tests will FAIL until the feature is implemented (TDD red phase)
 *
 * Acceptance Criteria:
 * - AC11: Table output format clear, displays all player config items
 * - AC12: JSON output includes all fields
 * - AC13: Update success shows confirmation message
 */

import { PlayerHandler, IPlayerService } from './player.handler';
import { PlayerConfigGetOptions, PlayerConfigUpdateOptions, PlayerServiceConfig } from '../types/player';
import { AuthConfig } from '../types/auth';

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('PlayerHandler', () => {
  let playerHandler: PlayerHandler;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: PlayerServiceConfig;
  let mockPlayerService: jest.Mocked<IPlayerService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id',
    };

    mockServiceConfig = {
      baseUrl: 'https://api.polyv.net',
      timeout: 30000,
      debug: false,
    };

    // Create mock service using dependency injection
    mockPlayerService = {
      getChannelDecorate: jest.fn(),
      updateChannelDecorate: jest.fn(),
    };

    // Inject mock service via constructor
    playerHandler = new PlayerHandler(
      mockAuthConfig,
      mockServiceConfig,
      mockPlayerService
    );
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  // ============================================================
  // AC1 & AC11: getConfig - Table output format
  // ============================================================

  describe('getConfig (AC1, AC11)', () => {
    const mockConfigResponse = {
      // Watermark settings
      watermarkEnabled: 'Y',
      watermarkUrl: '//liveimages.videocc.net/uploaded/images/2021/09/g24vjlhywx.png',
      watermarkPosition: 'br',
      watermarkOpacity: '1',
      watermarkLink: '',
      // Warmup settings
      warmupEnabled: 'Y',
      warmupImageUrl: 'http://liveimages.videocc.net/uploadimage/20210312/chat_img_1b448be323_16155164629438.jpeg',
      coverJumpUrl: '',
      backgroundImageUrl: '',
      // View data
      basePv: 6,
      actualPv: 21,
    };

    it('should call PlayerService with correct parameters', async () => {
      mockPlayerService.getChannelDecorate.mockResolvedValueOnce(mockConfigResponse);

      const options: PlayerConfigGetOptions = {
        channelId: '3151318',
      };

      await playerHandler.getConfig(options);

      expect(mockPlayerService.getChannelDecorate).toHaveBeenCalledWith(options);
    });

    // AC11: Table output format clear
    it('should display table output by default (AC11)', async () => {
      mockPlayerService.getChannelDecorate.mockResolvedValueOnce(mockConfigResponse);

      const options: PlayerConfigGetOptions = {
        channelId: '3151318',
      };

      await playerHandler.getConfig(options);

      // Verify table output is called
      const logCalls = mockConsoleLog.mock.calls;
      const output = logCalls.map(call => call.join(' ')).join('\n');

      // Check for watermark settings section
      expect(output).toContain('watermarkEnabled');
      expect(output).toContain('watermarkUrl');
      expect(output).toContain('watermarkPosition');
      expect(output).toContain('watermarkOpacity');

      // Check for warmup settings section
      expect(output).toContain('warmupEnabled');
      expect(output).toContain('warmupImageUrl');

      // Check for view data section
      expect(output).toContain('basePv');
      expect(output).toContain('actualPv');
    });

    // AC11: Table output displays all player config items
    it('should display all config items in table output (AC11)', async () => {
      mockPlayerService.getChannelDecorate.mockResolvedValueOnce(mockConfigResponse);

      const options: PlayerConfigGetOptions = {
        channelId: '3151318',
      };

      await playerHandler.getConfig(options);

      const logCalls = mockConsoleLog.mock.calls;
      const output = logCalls.map(call => call.join(' ')).join('\n');

      // Watermark settings
      expect(output).toContain('Y'); // watermarkEnabled
      expect(output).toContain('br'); // watermarkPosition

      // Warmup settings
      expect(output).toContain('warmupEnabled');

      // View data
      expect(output).toContain('6'); // basePv
      expect(output).toContain('21'); // actualPv
    });
  });

  // ============================================================
  // AC12: JSON output includes all fields
  // ============================================================

  describe('getConfig JSON output (AC12)', () => {
    const mockConfigResponse = {
      watermarkEnabled: 'Y',
      watermarkUrl: '//liveimages.videocc.net/uploaded/images/2021/09/logo.png',
      watermarkPosition: 'br',
      watermarkOpacity: '0.8',
      watermarkLink: 'http://www.polyv.net',
      warmupEnabled: 'N',
      warmupImageUrl: '',
      coverJumpUrl: '',
      backgroundImageUrl: '',
      basePv: 1000,
      actualPv: 200,
    };

    it('should display JSON output when --output json is specified (AC12)', async () => {
      mockPlayerService.getChannelDecorate.mockResolvedValueOnce(mockConfigResponse);

      const options: PlayerConfigGetOptions = {
        channelId: '3151318',
        output: 'json',
      };

      await playerHandler.getConfig(options);

      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call) =>
        call[0] && typeof call[0] === 'string' && call[0].includes('watermarkEnabled')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('should include all watermark fields in JSON output (AC12)', async () => {
      mockPlayerService.getChannelDecorate.mockResolvedValueOnce(mockConfigResponse);

      const options: PlayerConfigGetOptions = {
        channelId: '3151318',
        output: 'json',
      };

      await playerHandler.getConfig(options);

      const logCalls = mockConsoleLog.mock.calls;
      const output = logCalls.map(call => call.join(' ')).join('\n');

      // Verify all watermark fields
      expect(output).toContain('watermarkEnabled');
      expect(output).toContain('watermarkUrl');
      expect(output).toContain('watermarkPosition');
      expect(output).toContain('watermarkOpacity');
      expect(output).toContain('watermarkLink');
    });

    it('should include all warmup fields in JSON output (AC12)', async () => {
      mockPlayerService.getChannelDecorate.mockResolvedValueOnce(mockConfigResponse);

      const options: PlayerConfigGetOptions = {
        channelId: '3151318',
        output: 'json',
      };

      await playerHandler.getConfig(options);

      const logCalls = mockConsoleLog.mock.calls;
      const output = logCalls.map(call => call.join(' ')).join('\n');

      // Verify all warmup fields
      expect(output).toContain('warmupEnabled');
      expect(output).toContain('warmupImageUrl');
      expect(output).toContain('coverJumpUrl');
      expect(output).toContain('backgroundImageUrl');
    });

    it('should include view data fields in JSON output (AC12)', async () => {
      mockPlayerService.getChannelDecorate.mockResolvedValueOnce(mockConfigResponse);

      const options: PlayerConfigGetOptions = {
        channelId: '3151318',
        output: 'json',
      };

      await playerHandler.getConfig(options);

      const logCalls = mockConsoleLog.mock.calls;
      const output = logCalls.map(call => call.join(' ')).join('\n');

      // Verify view data fields
      expect(output).toContain('basePv');
      expect(output).toContain('actualPv');
    });
  });

  // ============================================================
  // AC2 & AC13: updateConfig - Success confirmation message
  // ============================================================

  describe('updateConfig (AC2, AC13)', () => {
    const mockUpdateResponse = {
      success: true,
      updatedFields: ['watermarkEnabled', 'watermarkUrl', 'basePv'],
    };

    it('should call PlayerService with correct parameters', async () => {
      mockPlayerService.updateChannelDecorate.mockResolvedValueOnce(mockUpdateResponse);

      const options: PlayerConfigUpdateOptions = {
        channelId: '3151318',
        watermarkEnabled: 'Y',
        watermarkUrl: 'http://example.com/logo.png',
        basePv: 1000,
      };

      await playerHandler.updateConfig(options);

      expect(mockPlayerService.updateChannelDecorate).toHaveBeenCalledWith(options);
    });

    // AC13: Update success shows confirmation message
    it('should display success message after update (AC13)', async () => {
      mockPlayerService.updateChannelDecorate.mockResolvedValueOnce(mockUpdateResponse);

      const options: PlayerConfigUpdateOptions = {
        channelId: '3151318',
        watermarkEnabled: 'Y',
      };

      await playerHandler.updateConfig(options);

      const logCalls = mockConsoleLog.mock.calls;
      const output = logCalls.map(call => call.join(' ')).join('\n');

      // Check for success message
      expect(output).toContain('success');
    });

    it('should display updated fields in confirmation message (AC13)', async () => {
      mockPlayerService.updateChannelDecorate.mockResolvedValueOnce(mockUpdateResponse);

      const options: PlayerConfigUpdateOptions = {
        channelId: '3151318',
        watermarkEnabled: 'Y',
        watermarkUrl: 'http://example.com/logo.png',
        basePv: 1000,
      };

      await playerHandler.updateConfig(options);

      const logCalls = mockConsoleLog.mock.calls;
      const output = logCalls.map(call => call.join(' ')).join('\n');

      // Check for updated fields being displayed
      expect(output).toContain('watermarkEnabled');
      expect(output).toContain('watermarkUrl');
      expect(output).toContain('basePv');
    });

    it('should display channel ID in confirmation message (AC13)', async () => {
      mockPlayerService.updateChannelDecorate.mockResolvedValueOnce(mockUpdateResponse);

      const options: PlayerConfigUpdateOptions = {
        channelId: '3151318',
        watermarkEnabled: 'Y',
      };

      await playerHandler.updateConfig(options);

      const logCalls = mockConsoleLog.mock.calls;
      const output = logCalls.map(call => call.join(' ')).join('\n');

      expect(output).toContain('3151318');
    });
  });

  // ============================================================
  // Edge cases
  // ============================================================

  describe('edge cases', () => {
    it('should handle empty response gracefully', async () => {
      mockPlayerService.getChannelDecorate.mockResolvedValueOnce({
        watermarkEnabled: 'N',
        watermarkUrl: '',
        watermarkPosition: 'br',
        watermarkOpacity: '1',
        watermarkLink: '',
        warmupEnabled: 'N',
        warmupImageUrl: '',
        coverJumpUrl: '',
        backgroundImageUrl: '',
        basePv: 0,
        actualPv: 0,
      });

      const options: PlayerConfigGetOptions = {
        channelId: '3151318',
      };

      // Should not throw
      await expect(playerHandler.getConfig(options)).resolves.not.toThrow();
    });

    it('should handle service errors gracefully', async () => {
      mockPlayerService.getChannelDecorate.mockRejectedValueOnce(new Error('API Error'));

      const options: PlayerConfigGetOptions = {
        channelId: '3151318',
      };

      // Should handle error
      await expect(playerHandler.getConfig(options)).rejects.toThrow('API Error');
    });
  });
});
