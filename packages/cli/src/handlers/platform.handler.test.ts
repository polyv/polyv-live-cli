/**
 * @fileoverview Unit tests for PlatformHandler
 * @author Development Team
 * @since 13.1.0
 */

import { PlatformHandler, PlatformGetOptions, PlatformSwitchGetOptions, PlatformSwitchUpdateOptions } from './platform.handler';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { PlatformServiceSdk } from '../services/platform-service';

// Mock the PlatformServiceSdk module
const mockPlatformService = {
  getUserInfo: jest.fn(),
  getSwitchConfig: jest.fn(),
  updateSwitchConfig: jest.fn(),
};

jest.mock('../services/platform-service', () => ({
  PlatformServiceSdk: jest.fn(() => mockPlatformService),
}));

// Mock console methods to suppress output during tests
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('PlatformHandler', () => {
  let platformHandler: PlatformHandler;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Ensure console methods are properly mocked and silent
    mockConsoleLog.mockImplementation(() => {});
    mockConsoleError.mockImplementation(() => {});
    mockConsoleWarn.mockImplementation(() => {});

    // Mock configs
    mockAuthConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
    };

    mockServiceConfig = {
      baseUrl: 'https://api.polyv.net',
      timeout: 30000,
      debug: false,
    };

    // Create handler instance
    platformHandler = new PlatformHandler(mockAuthConfig, mockServiceConfig);
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
  });

  // ========================================
  // AC1: getAccountInfo - 获取账号信息
  // ========================================
  describe('getAccountInfo', () => {
    const mockUserInfo = {
      userId: 'user123',
      email: 'test@example.com',
      maxChannels: 100,
      totalChannels: 10,
      availableChannels: 90,
      linkMicLimit: 10,
      watchDomain: 'https://live.polyv.net',
    };

    const defaultOptions: PlatformGetOptions = {
      output: 'table',
    };

    it('[P0][HDL-001] should get account info and display table format', async () => {
      mockPlatformService.getUserInfo.mockResolvedValueOnce(mockUserInfo);

      await platformHandler.getAccountInfo(defaultOptions);

      expect(mockPlatformService.getUserInfo).toHaveBeenCalled();
      // Verify table output was generated (console.log was called)
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P0][HDL-002] should get account info and output JSON format', async () => {
      mockPlatformService.getUserInfo.mockResolvedValueOnce(mockUserInfo);

      const jsonOptions: PlatformGetOptions = { output: 'json' };
      await platformHandler.getAccountInfo(jsonOptions);

      expect(mockPlatformService.getUserInfo).toHaveBeenCalled();
      // Verify JSON output was generated
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('"userId"')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('[P1] should display all user info fields in table', async () => {
      mockPlatformService.getUserInfo.mockResolvedValueOnce(mockUserInfo);

      await platformHandler.getAccountInfo(defaultOptions);

      // Verify that key fields are included in output
      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toMatch(/用户\s*ID|userId/i);
    });

    it('[P1] should handle API errors gracefully', async () => {
      const apiError = new Error('API error: Authentication failed');
      mockPlatformService.getUserInfo.mockRejectedValueOnce(apiError);

      await expect(platformHandler.getAccountInfo(defaultOptions)).rejects.toThrow();
    });
  });

  // ========================================
  // AC2: getSwitchConfig - 获取开关配置
  // ========================================
  describe('getSwitchConfig', () => {
    const mockSwitchConfig = {
      config: {
        globalSettingEnabled: true,
        authEnabled: false,
        recordEnabled: true,
        playbackEnabled: true,
        danmuEnabled: false,
      },
    };

    const defaultOptions: PlatformSwitchGetOptions = {
      output: 'table',
    };

    it('[P0][HDL-003] should get switch config and display table format', async () => {
      mockPlatformService.getSwitchConfig.mockResolvedValueOnce(mockSwitchConfig);

      await platformHandler.getSwitchConfig(defaultOptions);

      expect(mockPlatformService.getSwitchConfig).toHaveBeenCalled();
      // Verify table output was generated
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P0][HDL-004] should get switch config and output JSON format', async () => {
      mockPlatformService.getSwitchConfig.mockResolvedValueOnce(mockSwitchConfig);

      const jsonOptions: PlatformSwitchGetOptions = { output: 'json' };
      await platformHandler.getSwitchConfig(jsonOptions);

      expect(mockPlatformService.getSwitchConfig).toHaveBeenCalled();
      // Verify JSON output was generated
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('"config"')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('[P1] should display all switch fields in table', async () => {
      mockPlatformService.getSwitchConfig.mockResolvedValueOnce(mockSwitchConfig);

      await platformHandler.getSwitchConfig(defaultOptions);

      // Verify that key fields are included in output
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P1] should handle API errors gracefully', async () => {
      const apiError = new Error('API error: Permission denied');
      mockPlatformService.getSwitchConfig.mockRejectedValueOnce(apiError);

      await expect(platformHandler.getSwitchConfig(defaultOptions)).rejects.toThrow();
    });
  });

  // ========================================
  // AC3: updateSwitchConfig - 更新开关配置
  // ========================================
  describe('updateSwitchConfig', () => {
    const validOptions: PlatformSwitchUpdateOptions = {
      param: 'chat',
      enabled: 'Y',
      output: 'table',
    };

    it('[P0][HDL-005] should update switch config with valid params', async () => {
      mockPlatformService.updateSwitchConfig.mockResolvedValueOnce({ success: true });

      await platformHandler.updateSwitchConfig(validOptions);

      expect(mockPlatformService.updateSwitchConfig).toHaveBeenCalledWith({
        param: 'chat',
        enabled: 'Y',
      });
      // Verify success message was displayed
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P0][HDL-006] should update switch config and output JSON format', async () => {
      mockPlatformService.updateSwitchConfig.mockResolvedValueOnce({ success: true });

      const jsonOptions: PlatformSwitchUpdateOptions = {
        ...validOptions,
        output: 'json',
      };
      await platformHandler.updateSwitchConfig(jsonOptions);

      expect(mockPlatformService.updateSwitchConfig).toHaveBeenCalled();
      // Verify JSON output was generated
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('"success"')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('[P0] should update switch config with N value', async () => {
      mockPlatformService.updateSwitchConfig.mockResolvedValueOnce({ success: true });

      const options: PlatformSwitchUpdateOptions = {
        param: 'autoPlay',
        enabled: 'N',
        output: 'table',
      };
      await platformHandler.updateSwitchConfig(options);

      expect(mockPlatformService.updateSwitchConfig).toHaveBeenCalledWith({
        param: 'autoPlay',
        enabled: 'N',
      });
    });

    it('[P1][HDL-007] should throw validation error for missing param', async () => {
      const invalidOptions: PlatformSwitchUpdateOptions = {
        param: '',
        enabled: 'Y',
        output: 'table',
      };

      await expect(platformHandler.updateSwitchConfig(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockPlatformService.updateSwitchConfig).not.toHaveBeenCalled();
    });

    it('[P1][HDL-008] should throw validation error for invalid enabled value', async () => {
      const invalidOptions: PlatformSwitchUpdateOptions = {
        param: 'chat',
        enabled: 'YES' as any,
        output: 'table',
      };

      await expect(platformHandler.updateSwitchConfig(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockPlatformService.updateSwitchConfig).not.toHaveBeenCalled();
    });

    it('[P1][HDL-009] should throw validation error for unsupported param', async () => {
      const invalidOptions: PlatformSwitchUpdateOptions = {
        param: 'unsupportedParam',
        enabled: 'Y',
        output: 'table',
      };

      await expect(platformHandler.updateSwitchConfig(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockPlatformService.updateSwitchConfig).not.toHaveBeenCalled();
    });

    it('[P1] should validate enabled must be Y or N', async () => {
      const invalidOptions: PlatformSwitchUpdateOptions = {
        param: 'chat',
        enabled: 'yes' as any, // lowercase
        output: 'table',
      };

      await expect(platformHandler.updateSwitchConfig(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should throw validation error when enabled is undefined', async () => {
      const invalidOptions: PlatformSwitchUpdateOptions = {
        param: 'chat',
        enabled: undefined as any,
        output: 'table',
      };

      await expect(platformHandler.updateSwitchConfig(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should handle API errors gracefully', async () => {
      const apiError = new Error('API error: Update failed');
      mockPlatformService.updateSwitchConfig.mockRejectedValueOnce(apiError);

      await expect(platformHandler.updateSwitchConfig(validOptions)).rejects.toThrow();
    });
  });

  // ========================================
  // Error handling (HDL-010)
  // ========================================
  describe('Error handling', () => {
    it('[P1][HDL-010] should handle authentication errors with friendly message', async () => {
      const authError = new Error('Authentication failed');
      mockPlatformService.getUserInfo.mockRejectedValueOnce(authError);

      await expect(platformHandler.getAccountInfo({ output: 'table' }))
        .rejects
        .toThrow();
    });

    it('[P1] should handle network errors with friendly message', async () => {
      const networkError = new Error('Network connection failed');
      mockPlatformService.getSwitchConfig.mockRejectedValueOnce(networkError);

      await expect(platformHandler.getSwitchConfig({ output: 'table' }))
        .rejects
        .toThrow();
    });

    it('[P1] should handle permission errors with friendly message', async () => {
      const permissionError = new Error('Permission denied');
      mockPlatformService.updateSwitchConfig.mockRejectedValueOnce(permissionError);

      await expect(platformHandler.updateSwitchConfig({
        param: 'chat',
        enabled: 'Y',
        output: 'table',
      })).rejects.toThrow();
    });
  });

  // ========================================
  // Validation messages (AC7)
  // ========================================
  describe('Validation error messages', () => {
    it('[P1] should show friendly message for missing param', async () => {
      const invalidOptions: PlatformSwitchUpdateOptions = {
        param: '',
        enabled: 'Y',
        output: 'table',
      };

      try {
        await platformHandler.updateSwitchConfig(invalidOptions);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        const validationError = error as PolyVValidationError;
        expect(validationError.message).toContain('param');
      }
    });

    it('[P1] should show friendly message for invalid enabled value', async () => {
      const invalidOptions: PlatformSwitchUpdateOptions = {
        param: 'chat',
        enabled: 'invalid' as any,
        output: 'table',
      };

      try {
        await platformHandler.updateSwitchConfig(invalidOptions);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        const validationError = error as PolyVValidationError;
        expect(validationError.message).toMatch(/enabled.*Y.*N/i);
      }
    });

    it('[P1] should list available params in unsupported param error', async () => {
      const invalidOptions: PlatformSwitchUpdateOptions = {
        param: 'unknownParam',
        enabled: 'Y',
        output: 'table',
      };

      try {
        await platformHandler.updateSwitchConfig(invalidOptions);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        const validationError = error as PolyVValidationError;
        // Should list available params
        expect(validationError.message).toMatch(/chat|autoPlay|closeDanmu|mobileWatch|isClosePreview/);
      }
    });
  });

  // ========================================
  // Story 13-2: Callback Settings Tests
  // ========================================

  // ========================================
  // AC1: getCallbackSettings - 获取回调设置
  // ========================================
  describe('getCallbackSettings', () => {
    const mockCallbackSettings = {
      url: 'https://example.com/callback',
      enabled: true,
    };

    const defaultOptions = {
      output: 'table' as const,
    };

    it('[P0][HDL-CB-001] should get callback settings and display table format', async () => {
      mockPlatformService.getCallbackSettings = jest.fn().mockResolvedValueOnce(mockCallbackSettings);

      await platformHandler.getCallbackSettings(defaultOptions);

      expect(mockPlatformService.getCallbackSettings).toHaveBeenCalled();
      // Verify table output was generated (console.log was called)
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P0][HDL-CB-002] should get callback settings and output JSON format', async () => {
      mockPlatformService.getCallbackSettings = jest.fn().mockResolvedValueOnce(mockCallbackSettings);

      const jsonOptions = { output: 'json' as const };
      await platformHandler.getCallbackSettings(jsonOptions);

      expect(mockPlatformService.getCallbackSettings).toHaveBeenCalled();
      // Verify JSON output was generated
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('"url"')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('[P1] should display callback settings fields in table', async () => {
      mockPlatformService.getCallbackSettings = jest.fn().mockResolvedValueOnce(mockCallbackSettings);

      await platformHandler.getCallbackSettings(defaultOptions);

      // Verify that key fields are included in output
      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toMatch(/回调|URL|callback|enabled|启用/i);
    });

    it('[P1] should handle API errors gracefully in getCallbackSettings', async () => {
      const apiError = new Error('API error: Authentication failed');
      mockPlatformService.getCallbackSettings = jest.fn().mockRejectedValueOnce(apiError);

      await expect(platformHandler.getCallbackSettings(defaultOptions)).rejects.toThrow();
    });
  });

  // ========================================
  // AC2: updateCallbackSettings - 更新回调设置
  // ========================================
  describe('updateCallbackSettings', () => {
    const validUrlOptions = {
      url: 'https://example.com/new-callback',
      output: 'table' as const,
    };

    const validEnabledOptions = {
      enabled: 'Y' as const,
      output: 'table' as const,
    };

    const validBothOptions = {
      url: 'https://example.com/new-callback',
      enabled: 'Y' as const,
      output: 'table' as const,
    };

    it('[P0][HDL-CB-003] should update callback settings with URL only', async () => {
      mockPlatformService.updateCallbackSettings = jest.fn().mockResolvedValueOnce({ success: true });

      await platformHandler.updateCallbackSettings(validUrlOptions);

      expect(mockPlatformService.updateCallbackSettings).toHaveBeenCalledWith({
        url: 'https://example.com/new-callback',
      });
      // Verify success message was displayed
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P0][HDL-CB-004] should update callback settings with enabled only', async () => {
      mockPlatformService.updateCallbackSettings = jest.fn().mockResolvedValueOnce({ success: true });

      await platformHandler.updateCallbackSettings(validEnabledOptions);

      expect(mockPlatformService.updateCallbackSettings).toHaveBeenCalledWith({
        enabled: true,
      });
    });

    it('[P0][HDL-CB-005] should update callback settings with both URL and enabled', async () => {
      mockPlatformService.updateCallbackSettings = jest.fn().mockResolvedValueOnce({ success: true });

      await platformHandler.updateCallbackSettings(validBothOptions);

      expect(mockPlatformService.updateCallbackSettings).toHaveBeenCalledWith({
        url: 'https://example.com/new-callback',
        enabled: true,
      });
    });

    it('[P0] should clear streamCallbackUrl when clearUrl is provided', async () => {
      mockPlatformService.updateCallbackSettings = jest.fn().mockResolvedValueOnce({ success: true });

      await platformHandler.updateCallbackSettings({
        clearUrl: true,
        output: 'json',
      });

      expect(mockPlatformService.updateCallbackSettings).toHaveBeenCalledWith({
        url: '',
      });
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('"streamCallbackUrl": ""')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('[P0][HDL-CB-006] should update callback settings and output JSON format', async () => {
      mockPlatformService.updateCallbackSettings = jest.fn().mockResolvedValueOnce({ success: true });

      const jsonOptions = {
        url: 'https://example.com/new-callback',
        enabled: 'Y' as const,
        output: 'json' as const,
      };
      await platformHandler.updateCallbackSettings(jsonOptions);

      expect(mockPlatformService.updateCallbackSettings).toHaveBeenCalled();
      // Verify JSON output was generated
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('"success"')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('[P0] should update callback settings with enabled N', async () => {
      mockPlatformService.updateCallbackSettings = jest.fn().mockResolvedValueOnce({ success: true });

      const options = {
        enabled: 'N' as const,
        output: 'table' as const,
      };
      await platformHandler.updateCallbackSettings(options);

      expect(mockPlatformService.updateCallbackSettings).toHaveBeenCalledWith({
        enabled: false,
      });
    });

    it('[P1][HDL-CB-007] should throw validation error for invalid URL format', async () => {
      const invalidOptions = {
        url: 'invalid-url',
        output: 'table' as const,
      };

      await expect(platformHandler.updateCallbackSettings(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockPlatformService.updateCallbackSettings).not.toHaveBeenCalled();
    });

    it('[P1][HDL-CB-008] should throw validation error for invalid enabled value', async () => {
      const invalidOptions = {
        enabled: 'YES' as any,
        output: 'table' as const,
      };

      await expect(platformHandler.updateCallbackSettings(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockPlatformService.updateCallbackSettings).not.toHaveBeenCalled();
    });

    it('[P1][HDL-CB-009] should throw validation error when no parameters provided', async () => {
      const emptyOptions = {
        output: 'table' as const,
      };

      await expect(platformHandler.updateCallbackSettings(emptyOptions))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockPlatformService.updateCallbackSettings).not.toHaveBeenCalled();
    });

    it('[P1] should validate URL must start with http:// or https://', async () => {
      const invalidOptions = {
        url: 'ftp://example.com/callback',
        output: 'table' as const,
      };

      await expect(platformHandler.updateCallbackSettings(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should validate enabled must be Y or N', async () => {
      const invalidOptions = {
        enabled: 'yes' as any, // lowercase
        output: 'table' as const,
      };

      await expect(platformHandler.updateCallbackSettings(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should handle API errors gracefully in updateCallbackSettings', async () => {
      const apiError = new Error('API error: Update failed');
      mockPlatformService.updateCallbackSettings = jest.fn().mockRejectedValueOnce(apiError);

      await expect(platformHandler.updateCallbackSettings(validUrlOptions)).rejects.toThrow();
    });
  });

  // ========================================
  // Callback Validation Error Messages (AC6)
  // ========================================
  describe('Callback validation error messages', () => {
    it('[P1] should show friendly message for invalid URL', async () => {
      const invalidOptions = {
        url: 'not-a-url',
        output: 'table' as const,
      };

      try {
        await platformHandler.updateCallbackSettings(invalidOptions);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        const validationError = error as PolyVValidationError;
        expect(validationError.message).toMatch(/url|URL|http|https/i);
      }
    });

    it('[P1] should show friendly message for invalid enabled value', async () => {
      const invalidOptions = {
        enabled: 'yes' as any,
        output: 'table' as const,
      };

      try {
        await platformHandler.updateCallbackSettings(invalidOptions);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        const validationError = error as PolyVValidationError;
        expect(validationError.message).toMatch(/enabled.*Y.*N/i);
      }
    });

    it('[P1] should show friendly message when no parameters provided', async () => {
      const emptyOptions = {
        output: 'table' as const,
      };

      try {
        await platformHandler.updateCallbackSettings(emptyOptions);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        const validationError = error as PolyVValidationError;
        expect(validationError.message).toMatch(/至少.*一个|at least one|url|enabled/i);
      }
    });
  });

  // ========================================
  // Story 13-3: Global Settings Tests
  // ========================================

  // ========================================
  // AC1: getGlobalSettings - 获取全局设置
  // ========================================
  describe('getGlobalSettings', () => {
    const mockGlobalSettings = {
      channelConcurrencesEnabled: 'Y',
      timelyConvertEnabled: 'Y',
      donateEnabled: 'N',
      rebirthAutoUploadEnabled: 'N',
      rebirthAutoConvertEnabled: 'N',
      pptCoveredEnabled: 'N',
      coverImgType: 'contain',
      testModeButtonEnabled: 'N',
    };

    const defaultOptions = {
      output: 'table' as const,
    };

    it('[P0][HDL-GS-001] should get global settings and display table format', async () => {
      mockPlatformService.getGlobalChannelSettings = jest.fn().mockResolvedValueOnce(mockGlobalSettings);

      await platformHandler.getGlobalSettings(defaultOptions);

      expect(mockPlatformService.getGlobalChannelSettings).toHaveBeenCalled();
      // Verify table output was generated (console.log was called)
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P0][HDL-GS-002] should get global settings and output JSON format', async () => {
      mockPlatformService.getGlobalChannelSettings = jest.fn().mockResolvedValueOnce(mockGlobalSettings);

      const jsonOptions = { output: 'json' as const };
      await platformHandler.getGlobalSettings(jsonOptions);

      expect(mockPlatformService.getGlobalChannelSettings).toHaveBeenCalled();
      // Verify JSON output was generated
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('"channelConcurrencesEnabled"')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('[P1][HDL-GS-006] should display all global setting fields in table', async () => {
      mockPlatformService.getGlobalChannelSettings = jest.fn().mockResolvedValueOnce(mockGlobalSettings);

      await platformHandler.getGlobalSettings(defaultOptions);

      // Verify that key fields are included in output
      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toMatch(/并发|Concurrent|Auto.*Convert|自动.*转|Donate|打赏|Cover|封面/i);
    });

    it('[P1][HDL-GS-013] should handle API errors gracefully in getGlobalSettings', async () => {
      const apiError = new Error('API error: Authentication failed');
      mockPlatformService.getGlobalChannelSettings = jest.fn().mockRejectedValueOnce(apiError);

      await expect(platformHandler.getGlobalSettings(defaultOptions)).rejects.toThrow();
    });
  });

  // ========================================
  // AC2: updateGlobalSettings - 更新全局设置
  // ========================================
  describe('updateGlobalSettings', () => {
    const validSingleParamOptions = {
      channelConcurrencesEnabled: 'Y' as const,
      output: 'table' as const,
    };

    const validMultipleParamsOptions = {
      channelConcurrencesEnabled: 'Y' as const,
      timelyConvertEnabled: 'N' as const,
      donateEnabled: 'Y' as const,
      coverImgType: 'cover' as const,
      output: 'table' as const,
    };

    beforeEach(() => {
      mockPlatformService.updateGlobalChannelSettings = jest.fn().mockResolvedValueOnce({ success: true });
    });

    it('[P0][HDL-GS-003] should update global settings with single parameter', async () => {
      await platformHandler.updateGlobalSettings(validSingleParamOptions);

      expect(mockPlatformService.updateGlobalChannelSettings).toHaveBeenCalledWith({
        channelConcurrencesEnabled: 'Y',
      });
      // Verify success message was displayed
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P0][HDL-GS-004] should update global settings with multiple parameters', async () => {
      await platformHandler.updateGlobalSettings(validMultipleParamsOptions);

      expect(mockPlatformService.updateGlobalChannelSettings).toHaveBeenCalledWith({
        channelConcurrencesEnabled: 'Y',
        timelyConvertEnabled: 'N',
        donateEnabled: 'Y',
        coverImgType: 'cover',
      });
    });

    it('[P0][HDL-GS-005] should update global settings and output JSON format', async () => {
      const jsonOptions = {
        channelConcurrencesEnabled: 'Y' as const,
        output: 'json' as const,
      };
      await platformHandler.updateGlobalSettings(jsonOptions);

      expect(mockPlatformService.updateGlobalChannelSettings).toHaveBeenCalled();
      // Verify JSON output was generated
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('"success"')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('[P1][HDL-GS-007] should throw validation error for invalid Y/N value', async () => {
      const invalidOptions = {
        channelConcurrencesEnabled: 'yes' as any, // lowercase
        output: 'table' as const,
      };

      await expect(platformHandler.updateGlobalSettings(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockPlatformService.updateGlobalChannelSettings).not.toHaveBeenCalled();
    });

    it('[P1][HDL-GS-008] should throw validation error for invalid coverImgType', async () => {
      const invalidOptions = {
        coverImgType: 'invalid' as any,
        output: 'table' as const,
      };

      await expect(platformHandler.updateGlobalSettings(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockPlatformService.updateGlobalChannelSettings).not.toHaveBeenCalled();
    });

    it('[P1][HDL-GS-009] should validate channelConcurrencesEnabled must be Y or N', async () => {
      const invalidOptions = {
        channelConcurrencesEnabled: 'YES' as any,
        output: 'table' as const,
      };

      await expect(platformHandler.updateGlobalSettings(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1][HDL-GS-010] should validate timelyConvertEnabled must be Y or N', async () => {
      const invalidOptions = {
        timelyConvertEnabled: 'no' as any,
        output: 'table' as const,
      };

      await expect(platformHandler.updateGlobalSettings(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1][HDL-GS-011] should validate donateEnabled must be Y or N', async () => {
      const invalidOptions = {
        donateEnabled: '1' as any,
        output: 'table' as const,
      };

      await expect(platformHandler.updateGlobalSettings(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1][HDL-GS-012] should throw validation error when no parameters provided for update', async () => {
      const emptyOptions = {
        output: 'table' as const,
      };

      await expect(platformHandler.updateGlobalSettings(emptyOptions))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockPlatformService.updateGlobalChannelSettings).not.toHaveBeenCalled();
    });

    it('[P1][HDL-GS-014] should handle API errors gracefully in updateGlobalSettings', async () => {
      const apiError = new Error('API error: Update failed');
      mockPlatformService.updateGlobalChannelSettings = jest.fn().mockRejectedValueOnce(apiError);

      await expect(platformHandler.updateGlobalSettings(validSingleParamOptions)).rejects.toThrow();
    });
  });

  // ========================================
  // Global Settings Validation Error Messages (AC6)
  // ========================================
  describe('Global Settings validation error messages', () => {
    beforeEach(() => {
      mockPlatformService.updateGlobalChannelSettings = jest.fn().mockResolvedValue({ success: true });
    });

    it('[P1] should show friendly message for invalid Y/N value', async () => {
      const invalidOptions = {
        channelConcurrencesEnabled: 'yes' as any,
        output: 'table' as const,
      };

      try {
        await platformHandler.updateGlobalSettings(invalidOptions);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        const validationError = error as PolyVValidationError;
        expect(validationError.message).toMatch(/Y.*N|channelConcurrencesEnabled/i);
      }
    });

    it('[P1] should show friendly message for invalid coverImgType', async () => {
      const invalidOptions = {
        coverImgType: 'invalid' as any,
        output: 'table' as const,
      };

      try {
        await platformHandler.updateGlobalSettings(invalidOptions);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        const validationError = error as PolyVValidationError;
        expect(validationError.message).toMatch(/coverImgType|contain|cover/i);
      }
    });

    it('[P1] should show friendly message when no parameters provided', async () => {
      const emptyOptions = {
        output: 'table' as const,
      };

      try {
        await platformHandler.updateGlobalSettings(emptyOptions);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        const validationError = error as PolyVValidationError;
        expect(validationError.message).toMatch(/至少.*一个|at least one|parameter/i);
      }
    });
  });
});
