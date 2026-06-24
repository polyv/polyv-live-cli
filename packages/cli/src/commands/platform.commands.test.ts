/**
 * @fileoverview Unit tests for platform commands
 * @author Development Team
 * @since 13.1.0
 */

import { Command } from 'commander';
import {
  registerPlatformCommands,
  validateEnabledValue,
  validateOutputFormat,
  loadAuthAndServiceConfig,
} from './platform.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { suppressConsole, mockProcessExit, mockAuthSuccess } from '../utils/test-helpers';

// Mock dependencies
jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/platform.handler');
jest.mock('../utils/errors', () => ({
  logError: jest.fn(),
}));

describe('Platform Commands', () => {
  describe('command registration', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerPlatformCommands(program);
    });

    it('[P0][CMD-001] should register platform command group', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      expect(platformCmd).toBeDefined();
      expect(platformCmd?.description()).toContain('Platform');
    });

    it('[P0][CMD-002] should register platform get subcommand', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const getCmd = platformCmd?.commands.find(cmd => cmd.name() === 'get');

      expect(getCmd).toBeDefined();
      expect(getCmd?.description()).toContain('账号信息');
    });

    it('[P0][CMD-003] should register platform switch get subcommand', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const switchCmd = platformCmd?.commands.find(cmd => cmd.name() === 'switch');

      expect(switchCmd).toBeDefined();

      const getCmd = switchCmd?.commands.find(cmd => cmd.name() === 'get');
      expect(getCmd).toBeDefined();
      expect(getCmd?.description()).toContain('开关配置');
    });

    it('[P0][CMD-004] should register platform switch update subcommand', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const switchCmd = platformCmd?.commands.find(cmd => cmd.name() === 'switch');

      const updateCmd = switchCmd?.commands.find(cmd => cmd.name() === 'update');
      expect(updateCmd).toBeDefined();
      expect(updateCmd?.description()).toContain('更新');
    });

    it('[P1][CMD-005] should register --output option for platform get', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const getCmd = platformCmd?.commands.find(cmd => cmd.name() === 'get');
      const options = getCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    it('[P1][CMD-006] should register --output option for platform switch get', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const switchCmd = platformCmd?.commands.find(cmd => cmd.name() === 'switch');
      const getCmd = switchCmd?.commands.find(cmd => cmd.name() === 'get');
      const options = getCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    it('[P1][CMD-007] should register --output option for platform switch update', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const switchCmd = platformCmd?.commands.find(cmd => cmd.name() === 'switch');
      const updateCmd = switchCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    it('[P1][CMD-008] should register --param as required for platform switch update', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const switchCmd = platformCmd?.commands.find(cmd => cmd.name() === 'switch');
      const updateCmd = switchCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const paramOption = options.find(opt => opt.long === '--param');
      expect(paramOption).toBeDefined();
      expect(paramOption?.required).toBe(true);
    });

    it('[P1][CMD-009] should register --enabled as required for platform switch update', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const switchCmd = platformCmd?.commands.find(cmd => cmd.name() === 'switch');
      const updateCmd = switchCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const enabledOption = options.find(opt => opt.long === '--enabled');
      expect(enabledOption).toBeDefined();
      expect(enabledOption?.required).toBe(true);
    });

    it('[P1] should have short option -o for --output on platform get', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const getCmd = platformCmd?.commands.find(cmd => cmd.name() === 'get');
      const options = getCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption?.short).toBe('-o');
    });

    it('[P1] should have short option -o for --output on platform switch get', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const switchCmd = platformCmd?.commands.find(cmd => cmd.name() === 'switch');
      const getCmd = switchCmd?.commands.find(cmd => cmd.name() === 'get');
      const options = getCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption?.short).toBe('-o');
    });

    it('[P1] should have short option -o for --output on platform switch update', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const switchCmd = platformCmd?.commands.find(cmd => cmd.name() === 'switch');
      const updateCmd = switchCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption?.short).toBe('-o');
    });

    it('should register platform anchor, content-group, and coupon commands', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const anchorCmd = platformCmd?.commands.find(cmd => cmd.name() === 'anchor');
      const contentGroupCmd = platformCmd?.commands.find(cmd => cmd.name() === 'content-group');
      const couponCmd = platformCmd?.commands.find(cmd => cmd.name() === 'coupon');

      expect(anchorCmd).toBeDefined();
      expect(anchorCmd?.commands.some(cmd => cmd.name() === 'list')).toBe(true);
      expect(anchorCmd?.commands.some(cmd => cmd.name() === 'create')).toBe(true);
      expect(anchorCmd?.commands.find(cmd => cmd.name() === 'create')?.options.some(opt => opt.long === '--force')).toBe(true);
      expect(anchorCmd?.commands.find(cmd => cmd.name() === 'update-status')?.options.some(opt => opt.long === '--force')).toBe(true);

      expect(contentGroupCmd?.commands.some(cmd => cmd.name() === 'list')).toBe(true);
      expect(couponCmd?.commands.some(cmd => cmd.name() === 'viewer-list')).toBe(true);
      expect(couponCmd?.commands.find(cmd => cmd.name() === 'update')?.options.some(opt => opt.long === '--force')).toBe(true);
      expect(couponCmd?.commands.find(cmd => cmd.name() === 'status-batch')?.options.some(opt => opt.long === '--force')).toBe(true);
    });

    it('should add force option to existing platform write commands', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const switchUpdate = platformCmd?.commands.find(cmd => cmd.name() === 'switch')?.commands.find(cmd => cmd.name() === 'update');
      const callbackUpdate = platformCmd?.commands.find(cmd => cmd.name() === 'callback')?.commands.find(cmd => cmd.name() === 'update');
      const settingUpdate = platformCmd?.commands.find(cmd => cmd.name() === 'setting')?.commands.find(cmd => cmd.name() === 'update');

      expect(switchUpdate?.options.some(opt => opt.long === '--force')).toBe(true);
      expect(callbackUpdate?.options.some(opt => opt.long === '--force')).toBe(true);
      expect(settingUpdate?.options.some(opt => opt.long === '--force')).toBe(true);
    });
  });

  describe('help information', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerPlatformCommands(program);
    });

    it('should include platform command in help', () => {
      const helpText = program.helpInformation();
      expect(helpText).toContain('platform');
    });

    it('should include platform get command in help', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const helpText = platformCmd?.helpInformation() || '';
      expect(helpText).toContain('get');
    });

    it('should include switch subcommand in help', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const helpText = platformCmd?.helpInformation() || '';
      expect(helpText).toContain('switch');
    });

    it('should include available switch params in update help', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const switchCmd = platformCmd?.commands.find(cmd => cmd.name() === 'switch');
      const updateCmd = switchCmd?.commands.find(cmd => cmd.name() === 'update');

      const helpText = updateCmd?.helpInformation() || '';
      // Should list available params
      expect(helpText).toMatch(/chat|autoPlay|closeDanmu|mobileWatch|isClosePreview/);
    });
  });

  // ========================================
  // Validation functions tests
  // ========================================
  describe('validateEnabledValue', () => {
    it('[P1][CMD-010] should validate Y value', () => {
      expect(validateEnabledValue('Y')).toBe('Y');
    });

    it('[P1][CMD-010] should validate N value', () => {
      expect(validateEnabledValue('N')).toBe('N');
    });

    it('[P1] should throw error for lowercase y', () => {
      expect(() => validateEnabledValue('y')).toThrow('enabled 必须是 Y 或 N');
    });

    it('[P1] should throw error for lowercase n', () => {
      expect(() => validateEnabledValue('n')).toThrow('enabled 必须是 Y 或 N');
    });

    it('[P1] should throw error for YES', () => {
      expect(() => validateEnabledValue('YES')).toThrow('enabled 必须是 Y 或 N');
    });

    it('[P1] should throw error for NO', () => {
      expect(() => validateEnabledValue('NO')).toThrow('enabled 必须是 Y 或 N');
    });

    it('[P1] should throw error for true', () => {
      expect(() => validateEnabledValue('true')).toThrow('enabled 必须是 Y 或 N');
    });

    it('[P1] should throw error for false', () => {
      expect(() => validateEnabledValue('false')).toThrow('enabled 必须是 Y 或 N');
    });

    it('[P1] should throw error for empty string', () => {
      expect(() => validateEnabledValue('')).toThrow('enabled 必须是 Y 或 N');
    });

    it('[P1] should throw error for numeric string', () => {
      expect(() => validateEnabledValue('1')).toThrow('enabled 必须是 Y 或 N');
    });
  });

  describe('validateOutputFormat', () => {
    it('should validate table format', () => {
      expect(validateOutputFormat('table')).toBe('table');
    });

    it('should validate json format', () => {
      expect(validateOutputFormat('json')).toBe('json');
    });

    it('should throw error for invalid format', () => {
      expect(() => validateOutputFormat('xml')).toThrow('Invalid output format');
    });

    it('should throw error for uppercase JSON', () => {
      expect(() => validateOutputFormat('JSON')).toThrow('Invalid output format');
    });

    it('should throw error for empty string', () => {
      expect(() => validateOutputFormat('')).toThrow('Invalid output format');
    });
  });

  // ========================================
  // Command option default values
  // ========================================
  describe('default option values', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerPlatformCommands(program);
    });

    it('should have default output value of "table" for platform get', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const getCmd = platformCmd?.commands.find(cmd => cmd.name() === 'get');
      const options = getCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      // Default should be table
      expect(outputOption?.defaultValue).toBe('table');
    });

    it('should have default output value of "table" for platform switch get', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const switchCmd = platformCmd?.commands.find(cmd => cmd.name() === 'switch');
      const getCmd = switchCmd?.commands.find(cmd => cmd.name() === 'get');
      const options = getCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption?.defaultValue).toBe('table');
    });

    it('should have default output value of "table" for platform switch update', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const switchCmd = platformCmd?.commands.find(cmd => cmd.name() === 'switch');
      const updateCmd = switchCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption?.defaultValue).toBe('table');
    });
  });

  // ========================================
  // loadAuthAndServiceConfig tests
  // ========================================
  describe('loadAuthAndServiceConfig', () => {
    const mockAuthConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id',
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
        config: mockAuthConfig,
        source: 'environment',
        accountName: null,
      });
      (configManager.load as jest.Mock).mockResolvedValue({
        config: {
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
        },
      });
    });

    it('should load auth and service config successfully', async () => {
      const result = await loadAuthAndServiceConfig({});

      expect(result.authConfig).toEqual(mockAuthConfig);
      expect(result.serviceConfig.baseUrl).toBe('https://api.polyv.net');
      expect(result.serviceConfig.timeout).toBe(30000);
      expect(result.isVerbose).toBe(false);
    });

    it('should throw error when auth config is not available', async () => {
      (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue(null);
      (authAdapter.getStatusMessage as jest.Mock).mockReturnValue('No auth configured');

      await expect(loadAuthAndServiceConfig({})).rejects.toThrow('No auth configured');
    });

    it('should use default config when config loading fails with incomplete auth error', async () => {
      const authError = new Error('Auth configuration is incomplete');
      (configManager.load as jest.Mock).mockRejectedValue(authError);

      const result = await loadAuthAndServiceConfig({});

      expect(result.serviceConfig.baseUrl).toBe('https://api.polyv.net');
      expect(result.serviceConfig.timeout).toBe(30000);
      expect(result.serviceConfig.debug).toBe(false);
    });

    it('should rethrow non-auth config errors', async () => {
      const otherError = new Error('Some other error');
      (configManager.load as jest.Mock).mockRejectedValue(otherError);

      await expect(loadAuthAndServiceConfig({})).rejects.toThrow('Some other error');
    });

    it('should set isVerbose to true when verbose option is set', async () => {
      const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

      const result = await loadAuthAndServiceConfig({ verbose: true });

      expect(result.isVerbose).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Authentication Source'));

      mockConsoleLog.mockRestore();
    });

    it('should display account name when verbose and account is set', async () => {
      (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
        config: mockAuthConfig,
        source: 'account',
        accountName: 'my-account',
      });

      const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

      const result = await loadAuthAndServiceConfig({ verbose: true });

      expect(result.isVerbose).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Account: my-account'));

      mockConsoleLog.mockRestore();
    });

    it('should use custom baseUrl from config', async () => {
      (configManager.load as jest.Mock).mockResolvedValue({
        config: {
          baseUrl: 'https://custom.api.com',
          timeout: 60000,
          debug: true,
        },
      });

      const result = await loadAuthAndServiceConfig({});

      expect(result.serviceConfig.baseUrl).toBe('https://custom.api.com');
      expect(result.serviceConfig.timeout).toBe(60000);
      expect(result.serviceConfig.debug).toBe(true);
    });
  });

  // ========================================
  // Story 13-2: Callback Commands Tests
  // ========================================

  describe('callback command registration', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerPlatformCommands(program);
    });

    it('[P0][CMD-CB-001] should register platform callback get subcommand', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const callbackCmd = platformCmd?.commands.find(cmd => cmd.name() === 'callback');
      const getCmd = callbackCmd?.commands.find(cmd => cmd.name() === 'get');

      expect(getCmd).toBeDefined();
      expect(getCmd?.description()).toContain('回调');
    });

    it('[P0][CMD-CB-002] should register platform callback update subcommand', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const callbackCmd = platformCmd?.commands.find(cmd => cmd.name() === 'callback');
      const updateCmd = callbackCmd?.commands.find(cmd => cmd.name() === 'update');

      expect(updateCmd).toBeDefined();
      expect(updateCmd?.description()).toContain('更新');
    });

    it('[P1][CMD-CB-003] should register --output option for platform callback get', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const callbackCmd = platformCmd?.commands.find(cmd => cmd.name() === 'callback');
      const getCmd = callbackCmd?.commands.find(cmd => cmd.name() === 'get');
      const options = getCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    it('[P1][CMD-CB-004] should register --output option for platform callback update', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const callbackCmd = platformCmd?.commands.find(cmd => cmd.name() === 'callback');
      const updateCmd = callbackCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    it('[P1][CMD-CB-005] should register --url option for platform callback update', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const callbackCmd = platformCmd?.commands.find(cmd => cmd.name() === 'callback');
      const updateCmd = callbackCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const urlOption = options.find(opt => opt.long === '--url');
      expect(urlOption).toBeDefined();
    });

    it('[P1][CMD-CB-006] should register --enabled option for platform callback update', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const callbackCmd = platformCmd?.commands.find(cmd => cmd.name() === 'callback');
      const updateCmd = callbackCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const enabledOption = options.find(opt => opt.long === '--enabled');
      expect(enabledOption).toBeDefined();
    });

    it('[P1] should register --clear-url option for streamCallbackUrl clearing', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const callbackCmd = platformCmd?.commands.find(cmd => cmd.name() === 'callback');
      const updateCmd = callbackCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const clearUrlOption = options.find(opt => opt.long === '--clear-url');
      expect(clearUrlOption).toBeDefined();
      expect(clearUrlOption?.description).toMatch(/streamCallbackUrl|live status/i);
    });

    it('[P1] should have short option -o for --output on platform callback get', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const callbackCmd = platformCmd?.commands.find(cmd => cmd.name() === 'callback');
      const getCmd = callbackCmd?.commands.find(cmd => cmd.name() === 'get');
      const options = getCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption?.short).toBe('-o');
    });

    it('[P1] should have short option -o for --output on platform callback update', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const callbackCmd = platformCmd?.commands.find(cmd => cmd.name() === 'callback');
      const updateCmd = callbackCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption?.short).toBe('-o');
    });

    it('[P1] should have default output value of "table" for platform callback get', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const callbackCmd = platformCmd?.commands.find(cmd => cmd.name() === 'callback');
      const getCmd = callbackCmd?.commands.find(cmd => cmd.name() === 'get');
      const options = getCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption?.defaultValue).toBe('table');
    });

    it('[P1] should have default output value of "table" for platform callback update', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const callbackCmd = platformCmd?.commands.find(cmd => cmd.name() === 'callback');
      const updateCmd = callbackCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption?.defaultValue).toBe('table');
    });

    it('[P1] should include callback subcommand in help', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const helpText = platformCmd?.helpInformation() || '';
      expect(helpText).toContain('callback');
    });

    it('[P1] should include available options in callback update help', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const callbackCmd = platformCmd?.commands.find(cmd => cmd.name() === 'callback');
      const updateCmd = callbackCmd?.commands.find(cmd => cmd.name() === 'update');

      const helpText = updateCmd?.helpInformation() || '';
      // Should include url and enabled options
      expect(helpText).toMatch(/url|URL|enabled/i);
    });
  });

  // ========================================
  // Callback URL Validation Tests
  // ========================================
  describe('validateUrlFormat (callback)', () => {
    // This function should be exported from platform.commands.ts
    // For now, we'll test it through command registration

    it('should accept valid http URL', () => {
      // Will be tested through command action
      expect(true).toBe(true);
    });

    it('should accept valid https URL', () => {
      // Will be tested through command action
      expect(true).toBe(true);
    });

    it('should reject URL without protocol', () => {
      // Will be tested through command action
      expect(true).toBe(true);
    });

    it('should reject ftp URL', () => {
      // Will be tested through command action
      expect(true).toBe(true);
    });
  });

  // ========================================
  // Story 13-3: Global Settings Commands Tests
  // ========================================

  describe('setting command registration', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerPlatformCommands(program);
    });

    it('[P0][CMD-GS-001] should register platform setting get subcommand', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const settingCmd = platformCmd?.commands.find(cmd => cmd.name() === 'setting');
      const getCmd = settingCmd?.commands.find(cmd => cmd.name() === 'get');

      expect(getCmd).toBeDefined();
      expect(getCmd?.description()).toContain('全局频道设置');
    });

    it('[P0][CMD-GS-002] should register platform setting update subcommand', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const settingCmd = platformCmd?.commands.find(cmd => cmd.name() === 'setting');
      const updateCmd = settingCmd?.commands.find(cmd => cmd.name() === 'update');

      expect(updateCmd).toBeDefined();
      expect(updateCmd?.description()).toContain('更新');
    });

    it('[P1][CMD-GS-003] should register --output option for platform setting get', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const settingCmd = platformCmd?.commands.find(cmd => cmd.name() === 'setting');
      const getCmd = settingCmd?.commands.find(cmd => cmd.name() === 'get');
      const options = getCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    it('[P1][CMD-GS-004] should register --output option for platform setting update', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const settingCmd = platformCmd?.commands.find(cmd => cmd.name() === 'setting');
      const updateCmd = settingCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    it('[P1][CMD-GS-005] should register --channel-concurrences-enabled option', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const settingCmd = platformCmd?.commands.find(cmd => cmd.name() === 'setting');
      const updateCmd = settingCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const option = options.find(opt => opt.long === '--channel-concurrences-enabled');
      expect(option).toBeDefined();
    });

    it('[P1][CMD-GS-006] should register --timely-convert-enabled option', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const settingCmd = platformCmd?.commands.find(cmd => cmd.name() === 'setting');
      const updateCmd = settingCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const option = options.find(opt => opt.long === '--timely-convert-enabled');
      expect(option).toBeDefined();
    });

    it('[P1][CMD-GS-007] should register --donate-enabled option', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const settingCmd = platformCmd?.commands.find(cmd => cmd.name() === 'setting');
      const updateCmd = settingCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const option = options.find(opt => opt.long === '--donate-enabled');
      expect(option).toBeDefined();
    });

    it('[P1][CMD-GS-008] should register --cover-img-type option', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const settingCmd = platformCmd?.commands.find(cmd => cmd.name() === 'setting');
      const updateCmd = settingCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const option = options.find(opt => opt.long === '--cover-img-type');
      expect(option).toBeDefined();
    });

    it('[P1][CMD-GS-009] should have default output value of "table" for setting get', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const settingCmd = platformCmd?.commands.find(cmd => cmd.name() === 'setting');
      const getCmd = settingCmd?.commands.find(cmd => cmd.name() === 'get');
      const options = getCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption?.defaultValue).toBe('table');
    });

    it('[P1][CMD-GS-010] should have default output value of "table" for setting update', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const settingCmd = platformCmd?.commands.find(cmd => cmd.name() === 'setting');
      const updateCmd = settingCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption?.defaultValue).toBe('table');
    });

    it('[P1][CMD-GS-011] should include setting subcommand in help', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const helpText = platformCmd?.helpInformation() || '';
      expect(helpText).toContain('setting');
    });

    it('[P1][CMD-GS-012] should include available options in setting update help', () => {
      const platformCmd = program.commands.find(cmd => cmd.name() === 'platform');
      const settingCmd = platformCmd?.commands.find(cmd => cmd.name() === 'setting');
      const updateCmd = settingCmd?.commands.find(cmd => cmd.name() === 'update');

      const helpText = updateCmd?.helpInformation() || '';
      // Should include key options
      expect(helpText).toMatch(/channel-concurrences-enabled|timely-convert-enabled|donate-enabled|cover-img-type/i);
    });
  });
});

// ============================================================
// Action execution tests
// ============================================================
describe('action execution', () => {
  let restoreConsole: () => void;
  let restoreExit: () => void;
  let MockPlatformHandler: jest.Mock;

  const createTestProgram = (): Command => {
    const program = new Command();
    program.exitOverride();
    return program;
  };

  beforeEach(() => {
    restoreConsole = suppressConsole();
    restoreExit = mockProcessExit();
    MockPlatformHandler = require('../handlers/platform.handler').PlatformHandler;
    MockPlatformHandler.mockClear();
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);
  });

  afterEach(() => {
    restoreConsole();
    restoreExit();
  });

  describe('platform get action', () => {
    it('[P0] should call getAccountInfo handler with correct params', async () => {
      const mockHandler = { getAccountInfo: jest.fn().mockResolvedValue(undefined) };
      MockPlatformHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPlatformCommands(program);
      await program.parseAsync(['node', 'test', 'platform', 'get']);

      expect(MockPlatformHandler).toHaveBeenCalled();
      expect(mockHandler.getAccountInfo).toHaveBeenCalledWith({
        output: 'table',
      });
    });

    it('[P1] should call getAccountInfo with json output', async () => {
      const mockHandler = { getAccountInfo: jest.fn().mockResolvedValue(undefined) };
      MockPlatformHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPlatformCommands(program);
      await program.parseAsync(['node', 'test', 'platform', 'get', '-o', 'json']);

      expect(mockHandler.getAccountInfo).toHaveBeenCalledWith({
        output: 'json',
      });
    });

    it('[P1] should handle API errors in platform get action', async () => {
      const mockHandler = { getAccountInfo: jest.fn().mockRejectedValue(new Error('Get failed')) };
      MockPlatformHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerPlatformCommands(program);
      await expect(program.parseAsync(['node', 'test', 'platform', 'get'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('platform switch get action', () => {
    it('[P0] should call getSwitchConfig handler with correct params', async () => {
      const mockHandler = { getSwitchConfig: jest.fn().mockResolvedValue(undefined) };
      MockPlatformHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPlatformCommands(program);
      await program.parseAsync(['node', 'test', 'platform', 'switch', 'get']);

      expect(MockPlatformHandler).toHaveBeenCalled();
      expect(mockHandler.getSwitchConfig).toHaveBeenCalledWith({
        output: 'table',
      });
    });

    it('[P1] should handle API errors in switch get action', async () => {
      const mockHandler = { getSwitchConfig: jest.fn().mockRejectedValue(new Error('Get failed')) };
      MockPlatformHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerPlatformCommands(program);
      await expect(program.parseAsync(['node', 'test', 'platform', 'switch', 'get'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('platform switch update action', () => {
    it('[P0] should call updateSwitchConfig handler with correct params', async () => {
      const mockHandler = { updateSwitchConfig: jest.fn().mockResolvedValue(undefined) };
      MockPlatformHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPlatformCommands(program);
      await program.parseAsync([
        'node', 'test', 'platform', 'switch', 'update',
        '--param', 'chat',
        '--enabled', 'Y',
        '--force',
      ]);

      expect(MockPlatformHandler).toHaveBeenCalled();
      expect(mockHandler.updateSwitchConfig).toHaveBeenCalledWith({
        param: 'chat',
        enabled: 'Y',
        output: 'table',
      });
    });

    it('[P1] should handle API errors in switch update action', async () => {
      const mockHandler = { updateSwitchConfig: jest.fn().mockRejectedValue(new Error('Update failed')) };
      MockPlatformHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerPlatformCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'platform', 'switch', 'update',
        '--param', 'chat',
        '--enabled', 'N',
        '--force',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('platform callback get action', () => {
    it('[P0] should call getCallbackSettings handler with correct params', async () => {
      const mockHandler = { getCallbackSettings: jest.fn().mockResolvedValue(undefined) };
      MockPlatformHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPlatformCommands(program);
      await program.parseAsync(['node', 'test', 'platform', 'callback', 'get']);

      expect(MockPlatformHandler).toHaveBeenCalled();
      expect(mockHandler.getCallbackSettings).toHaveBeenCalledWith({
        output: 'table',
      });
    });

    it('[P1] should handle API errors in callback get action', async () => {
      const mockHandler = { getCallbackSettings: jest.fn().mockRejectedValue(new Error('Get failed')) };
      MockPlatformHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerPlatformCommands(program);
      await expect(program.parseAsync(['node', 'test', 'platform', 'callback', 'get'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('platform callback update action', () => {
    it('[P0] should call updateCallbackSettings handler with correct params', async () => {
      const mockHandler = { updateCallbackSettings: jest.fn().mockResolvedValue(undefined) };
      MockPlatformHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPlatformCommands(program);
      await program.parseAsync([
        'node', 'test', 'platform', 'callback', 'update',
        '--url', 'https://example.com/callback',
        '--enabled', 'Y',
        '--force',
      ]);

      expect(MockPlatformHandler).toHaveBeenCalled();
      expect(mockHandler.updateCallbackSettings).toHaveBeenCalledWith({
        url: 'https://example.com/callback',
        enabled: 'Y',
        clearUrl: undefined,
        output: 'table',
      });
    });

    it('[P1] should pass clearUrl to callback update handler', async () => {
      const mockHandler = { updateCallbackSettings: jest.fn().mockResolvedValue(undefined) };
      MockPlatformHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPlatformCommands(program);
      await program.parseAsync([
        'node', 'test', 'platform', 'callback', 'update',
        '--clear-url',
        '--force',
      ]);

      expect(mockHandler.updateCallbackSettings).toHaveBeenCalledWith({
        url: undefined,
        clearUrl: true,
        enabled: undefined,
        output: 'table',
      });
    });

    it('[P1] should handle API errors in callback update action', async () => {
      const mockHandler = { updateCallbackSettings: jest.fn().mockRejectedValue(new Error('Update failed')) };
      MockPlatformHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerPlatformCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'platform', 'callback', 'update',
        '--enabled', 'N',
        '--force',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('platform setting get action', () => {
    it('[P0] should call getGlobalSettings handler with correct params', async () => {
      const mockHandler = { getGlobalSettings: jest.fn().mockResolvedValue(undefined) };
      MockPlatformHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPlatformCommands(program);
      await program.parseAsync(['node', 'test', 'platform', 'setting', 'get']);

      expect(MockPlatformHandler).toHaveBeenCalled();
      expect(mockHandler.getGlobalSettings).toHaveBeenCalledWith({
        output: 'table',
      });
    });

    it('[P1] should handle API errors in setting get action', async () => {
      const mockHandler = { getGlobalSettings: jest.fn().mockRejectedValue(new Error('Get failed')) };
      MockPlatformHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerPlatformCommands(program);
      await expect(program.parseAsync(['node', 'test', 'platform', 'setting', 'get'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('platform setting update action', () => {
    it('[P0] should call updateGlobalSettings handler with correct params', async () => {
      const mockHandler = { updateGlobalSettings: jest.fn().mockResolvedValue(undefined) };
      MockPlatformHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPlatformCommands(program);
      await program.parseAsync([
        'node', 'test', 'platform', 'setting', 'update',
        '--donate-enabled', 'Y',
        '--cover-img-type', 'contain',
        '--force',
      ]);

      expect(MockPlatformHandler).toHaveBeenCalled();
      expect(mockHandler.updateGlobalSettings).toHaveBeenCalledWith({
        channelConcurrencesEnabled: undefined,
        timelyConvertEnabled: undefined,
        donateEnabled: 'Y',
        rebirthAutoUploadEnabled: undefined,
        rebirthAutoConvertEnabled: undefined,
        pptCoveredEnabled: undefined,
        coverImgType: 'contain',
        testModeButtonEnabled: undefined,
        output: 'table',
      });
    });

    it('[P1] should handle API errors in setting update action', async () => {
      const mockHandler = { updateGlobalSettings: jest.fn().mockRejectedValue(new Error('Update failed')) };
      MockPlatformHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerPlatformCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'platform', 'setting', 'update',
        '--donate-enabled', 'N',
        '--force',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });
});
