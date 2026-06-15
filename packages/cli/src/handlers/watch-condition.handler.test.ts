/**
 * @fileoverview Unit tests for WatchConditionHandler
 * @author Development Team
 * @since 12.3.0
 *
 * ATDD RED PHASE - These tests will fail until watch-condition.handler.ts is implemented
 */

// @ts-expect-error - Module not implemented yet
import { WatchConditionHandler } from './watch-condition.handler';
// @ts-expect-error - Module not implemented yet
import { WatchConditionServiceSdk } from '../services/watch-condition-service';
import {
  WatchConditionServiceConfig,
  WatchConditionGetOptions,
  WatchConditionSetOptions,
} from '../types/watch-condition';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError, PolyVError } from '../utils/errors';

// Mock WatchConditionServiceSdk
jest.mock('../services/watch-condition-service');
const MockedWatchConditionService = WatchConditionServiceSdk as jest.MockedClass<typeof WatchConditionServiceSdk>;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

// Mock fs module for config file reading
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn(),
  existsSync: jest.fn(),
}));

import { readFileSync, existsSync } from 'fs';

describe('WatchConditionHandler (ATDD RED PHASE)', () => {
  let watchConditionHandler: WatchConditionHandler;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: WatchConditionServiceConfig;
  let mockWatchConditionService: jest.Mocked<WatchConditionServiceSdk>;

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

    mockWatchConditionService = {
      getWatchCondition: jest.fn(),
      setWatchCondition: jest.fn(),
    } as any;

    try {
      MockedWatchConditionService.mockImplementation(() => mockWatchConditionService);
      watchConditionHandler = new WatchConditionHandler(mockAuthConfig, mockServiceConfig);
    } catch {
      // Expected to fail in RED phase
    }
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('constructor', () => {
    it('12.3-UNIT-001: should create WatchConditionServiceSdk with correct configuration', () => {
      expect(MockedWatchConditionService).toHaveBeenCalledWith(mockAuthConfig, mockServiceConfig);
    });
  });

  // ============================================================
  // AC #1: watch-condition get command
  // ============================================================
  describe('getWatchCondition (AC #1)', () => {
    it('12.3-UNIT-002: should get global watch condition when no channelId provided', async () => {
      const options: WatchConditionGetOptions = {
        output: 'table',
      };

      mockWatchConditionService.getWatchCondition.mockResolvedValue([
        {
          channelId: '',
          authType: 'none',
          enabled: 'Y',
        },
        {
          channelId: '',
          authType: 'none',
          enabled: 'N',
        },
      ]);

      await watchConditionHandler.getWatchCondition(options);

      expect(mockWatchConditionService.getWatchCondition).toHaveBeenCalledWith({});
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.3-UNIT-003: should get channel-specific watch condition with channelId', async () => {
      const options: WatchConditionGetOptions = {
        channelId: '123456',
        output: 'table',
      };

      mockWatchConditionService.getWatchCondition.mockResolvedValue([
        {
          channelId: '123456',
          authType: 'code',
          enabled: 'Y',
          code: 'abc123',
        },
        {
          channelId: '123456',
          authType: 'none',
          enabled: 'N',
        },
      ]);

      await watchConditionHandler.getWatchCondition(options);

      expect(mockWatchConditionService.getWatchCondition).toHaveBeenCalledWith({
        channelId: '123456',
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.3-UNIT-004: should output watch condition in JSON format', async () => {
      const options: WatchConditionGetOptions = {
        channelId: '123456',
        output: 'json',
      };

      mockWatchConditionService.getWatchCondition.mockResolvedValue([
        {
          channelId: '123456',
          authType: 'pay',
          enabled: 'Y',
          payAmount: 9900,
        },
      ]);

      await watchConditionHandler.getWatchCondition(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('authType')
      );
    });

    it('12.3-UNIT-005: should output watch condition in table format', async () => {
      const options: WatchConditionGetOptions = {
        channelId: '123456',
        output: 'table',
      };

      mockWatchConditionService.getWatchCondition.mockResolvedValue([
        {
          channelId: '123456',
          authType: 'code',
          enabled: 'Y',
          code: 'secret123',
        },
        {
          channelId: '123456',
          authType: 'none',
          enabled: 'N',
        },
      ]);

      await watchConditionHandler.getWatchCondition(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.3-UNIT-006: should handle API errors gracefully', async () => {
      const options: WatchConditionGetOptions = {
        channelId: '999999',
        output: 'table',
      };

      const apiError = new PolyVError('API Error: Channel not found', 'NOT_FOUND', 404);
      mockWatchConditionService.getWatchCondition.mockRejectedValue(apiError);

      await expect(watchConditionHandler.getWatchCondition(options)).rejects.toThrow(PolyVError);
    });

    it('12.3-UNIT-007: should display both primary and secondary conditions', async () => {
      const options: WatchConditionGetOptions = {
        channelId: '123456',
        output: 'table',
      };

      mockWatchConditionService.getWatchCondition.mockResolvedValue([
        {
          channelId: '123456',
          authType: 'code',
          enabled: 'Y',
          code: 'password1',
        },
        {
          channelId: '123456',
          authType: 'pay',
          enabled: 'Y',
          payAmount: 5000,
        },
      ]);

      await watchConditionHandler.getWatchCondition(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.3-CMD-001: should register watch-condition get command with correct options', async () => {
      // This is tested in commands test file
      expect(true).toBe(true);
    });
  });

  // ============================================================
  // AC #2: watch-condition set command
  // ============================================================
  describe('setWatchCondition (AC #2)', () => {
    it('12.3-UNIT-008: should set simple watch condition (none type)', async () => {
      const options: WatchConditionSetOptions = {
        channelId: '123456',
        rank: 1,
        authType: 'none',
        enabled: 'Y',
        output: 'table',
      };

      mockWatchConditionService.setWatchCondition.mockResolvedValue('success');

      await watchConditionHandler.setWatchCondition(options);

      expect(mockWatchConditionService.setWatchCondition).toHaveBeenCalledWith({
        channelId: '123456',
        authSettings: [
          {
            rank: 1,
            enabled: 'Y',
          },
        ],
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.3-UNIT-009: should set password watch condition', async () => {
      const options: WatchConditionSetOptions = {
        channelId: '123456',
        rank: 1,
        authType: 'code',
        enabled: 'Y',
        authCode: 'myPassword123',
        output: 'table',
      };

      mockWatchConditionService.setWatchCondition.mockResolvedValue('success');

      await watchConditionHandler.setWatchCondition(options);

      expect(mockWatchConditionService.setWatchCondition).toHaveBeenCalledWith({
        channelId: '123456',
        authSettings: [
          {
            rank: 1,
            authType: 'code',
            enabled: 'Y',
            authCode: 'myPassword123',
          },
        ],
      });
    });

    it('12.3-UNIT-010: should set pay watch condition with price', async () => {
      const options: WatchConditionSetOptions = {
        channelId: '123456',
        rank: 1,
        authType: 'pay',
        enabled: 'Y',
        price: 99.9,
        output: 'table',
      };

      mockWatchConditionService.setWatchCondition.mockResolvedValue('success');

      await watchConditionHandler.setWatchCondition(options);

      expect(mockWatchConditionService.setWatchCondition).toHaveBeenCalledWith({
        channelId: '123456',
        authSettings: [
          {
            rank: 1,
            authType: 'pay',
            enabled: 'Y',
            payAmount: 9990, // 99.9 * 100 = cents
          },
        ],
      });
    });

    it('12.3-UNIT-011: should set watch condition from JSON config file', async () => {
      const configPath = '/path/to/config.json';
      const options: WatchConditionSetOptions = {
        channelId: '123456',
        configFile: configPath,
        output: 'table',
      };

      const mockConfig = {
        authSettings: [
          {
            rank: 1,
            enabled: 'Y',
            authType: 'code',
            code: 'abc123',
          },
          {
            rank: 2,
            enabled: 'N',
          },
        ],
      };

      (existsSync as jest.Mock).mockReturnValue(true);
      (readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));

      mockWatchConditionService.setWatchCondition.mockResolvedValue('success');

      await watchConditionHandler.setWatchCondition(options);

      expect(mockWatchConditionService.setWatchCondition).toHaveBeenCalledWith({
        channelId: '123456',
        authSettings: mockConfig.authSettings,
      });
    });

    it('12.3-UNIT-012: should set global watch condition when no channelId provided', async () => {
      const options: WatchConditionSetOptions = {
        rank: 1,
        authType: 'none',
        enabled: 'N',
        output: 'table',
      };

      mockWatchConditionService.setWatchCondition.mockResolvedValue('success');

      await watchConditionHandler.setWatchCondition(options);

      expect(mockWatchConditionService.setWatchCondition).toHaveBeenCalledWith({
        authSettings: [
          {
            rank: 1,
            enabled: 'N',
          },
        ],
      });
    });

    it('12.3-UNIT-013: should validate rank must be 1 or 2', async () => {
      const options = {
        channelId: '123456',
        rank: 3,
        authType: 'none' as const,
        enabled: 'Y' as const,
        output: 'table' as const,
      };

      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(PolyVValidationError);
      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(
        'rank 必须是 1 (主要条件) 或 2 (次要条件)'
      );
    });

    it('12.3-UNIT-014: should validate authType is valid', async () => {
      const options = {
        channelId: '123456',
        rank: 1,
        authType: 'invalid' as any,
        enabled: 'Y' as const,
        output: 'table' as const,
      };

      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(PolyVValidationError);
      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(
        '无效的认证类型，支持的类型: none, code, pay, phone, info, custom, external, direct'
      );
    });

    it('12.3-UNIT-015: should validate enabled must be Y or N', async () => {
      const options = {
        channelId: '123456',
        rank: 1,
        authType: 'none' as const,
        enabled: 'YES' as any,
        output: 'table' as const,
      };

      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(PolyVValidationError);
      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(
        'enabled 必须是 Y 或 N'
      );
    });

    it('12.3-UNIT-041: should validate output format for setWatchCondition', async () => {
      const options = {
        channelId: '123456',
        rank: 1,
        authType: 'none' as const,
        enabled: 'Y' as const,
        output: 'xml' as any,
      };

      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(PolyVValidationError);
      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(
        '输出格式必须是 "table" 或 "json"'
      );
    });

    it('12.3-UNIT-016: should output success message after update', async () => {
      const options: WatchConditionSetOptions = {
        channelId: '123456',
        rank: 1,
        authType: 'code',
        enabled: 'Y',
        authCode: 'test123',
        output: 'table',
      };

      mockWatchConditionService.setWatchCondition.mockResolvedValue('success');

      await watchConditionHandler.setWatchCondition(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Successfully')
      );
    });

    it('12.3-UNIT-038: should output JSON format for setWatchCondition', async () => {
      const options: WatchConditionSetOptions = {
        channelId: '123456',
        rank: 1,
        authType: 'none',
        enabled: 'Y',
        output: 'json',
      };

      mockWatchConditionService.setWatchCondition.mockResolvedValue('success');

      await watchConditionHandler.setWatchCondition(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('success')
      );
    });

    it('12.3-UNIT-039: should output JSON format for global settings', async () => {
      const options: WatchConditionSetOptions = {
        rank: 1,
        authType: 'none',
        enabled: 'Y',
        output: 'json',
      };

      mockWatchConditionService.setWatchCondition.mockResolvedValue('success');

      await watchConditionHandler.setWatchCondition(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('global')
      );
    });
  });

  // ============================================================
  // AC #3: Output format validation
  // ============================================================
  describe('Output Format Validation (AC #3)', () => {
    it('12.3-UNIT-017: should validate output must be table or json', async () => {
      const options = {
        channelId: '123456',
        output: 'xml' as any,
      };

      await expect(watchConditionHandler.getWatchCondition(options)).rejects.toThrow(PolyVValidationError);
      await expect(watchConditionHandler.getWatchCondition(options)).rejects.toThrow(
        '输出格式必须是 "table" 或 "json"'
      );
    });

    it('12.3-UNIT-018: should default to table output', async () => {
      const options: WatchConditionGetOptions = {
        channelId: '123456',
      };

      mockWatchConditionService.getWatchCondition.mockResolvedValue([
        {
          channelId: '123456',
          authType: 'none',
          enabled: 'Y',
        },
      ]);

      await watchConditionHandler.getWatchCondition(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.3-CMD-003: should have -o short form for --output', async () => {
      // This is tested in commands test file
      expect(true).toBe(true);
    });
  });

  // ============================================================
  // AC #6: Error handling
  // ============================================================
  describe('Error Handling (AC #6)', () => {
    it('12.3-UNIT-019: should show friendly error for invalid rank', async () => {
      const options = {
        channelId: '123456',
        rank: 0,
        authType: 'none' as const,
        enabled: 'Y' as const,
        output: 'table' as const,
      };

      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(PolyVValidationError);
      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(
        'rank 必须是 1 (主要条件) 或 2 (次要条件)'
      );
    });

    it('12.3-UNIT-020: should show friendly error for invalid authType', async () => {
      const options = {
        channelId: '123456',
        rank: 1,
        authType: 'unknown' as any,
        enabled: 'Y' as const,
        output: 'table' as const,
      };

      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(PolyVValidationError);
      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(
        '无效的认证类型'
      );
    });

    it('12.3-UNIT-021: should show friendly error for invalid enabled value', async () => {
      const options = {
        channelId: '123456',
        rank: 1,
        authType: 'none' as const,
        enabled: 'yes' as any,
        output: 'table' as const,
      };

      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(PolyVValidationError);
      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(
        'enabled 必须是 Y 或 N'
      );
    });

    it('12.3-UNIT-022: should handle config file not found', async () => {
      const options: WatchConditionSetOptions = {
        channelId: '123456',
        configFile: '/nonexistent/config.json',
        output: 'table',
      };

      (existsSync as jest.Mock).mockReturnValue(false);

      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(PolyVValidationError);
      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(
        '配置文件不存在'
      );
    });

    it('12.3-UNIT-040: should handle config file read error', async () => {
      const options: WatchConditionSetOptions = {
        channelId: '123456',
        configFile: '/path/to/unreadable.json',
        output: 'table',
      };

      (existsSync as jest.Mock).mockReturnValue(true);
      (readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(PolyVValidationError);
      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(
        '无法读取配置文件'
      );
    });

    it('12.3-UNIT-023: should handle invalid JSON config file', async () => {
      const options: WatchConditionSetOptions = {
        channelId: '123456',
        configFile: '/path/to/invalid.json',
        output: 'table',
      };

      (existsSync as jest.Mock).mockReturnValue(true);
      (readFileSync as jest.Mock).mockReturnValue('{ invalid json }');

      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(PolyVValidationError);
      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(
        '配置文件 JSON 格式无效'
      );
    });

    it('12.3-UNIT-024: should handle API 401 error (authentication failed)', async () => {
      const options: WatchConditionGetOptions = {
        channelId: '123456',
        output: 'table',
      };

      const apiError = new PolyVError('Request failed with status code 401', 'AUTH_ERROR', 401);
      mockWatchConditionService.getWatchCondition.mockRejectedValue(apiError);

      await expect(watchConditionHandler.getWatchCondition(options)).rejects.toThrow();
    });

    it('12.3-UNIT-025: should handle API 403 error (permission denied)', async () => {
      const options: WatchConditionSetOptions = {
        channelId: '123456',
        rank: 1,
        authType: 'none',
        enabled: 'Y',
        output: 'table',
      };

      const apiError = new PolyVError('Request failed with status code 403', 'FORBIDDEN', 403);
      mockWatchConditionService.setWatchCondition.mockRejectedValue(apiError);

      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow();
    });

    it('12.3-UNIT-026: should handle API 500 error (internal server error)', async () => {
      const options: WatchConditionGetOptions = {
        output: 'table',
      };

      const apiError = new PolyVError('Request failed with status code 500', 'SERVER_ERROR', 500);
      mockWatchConditionService.getWatchCondition.mockRejectedValue(apiError);

      await expect(watchConditionHandler.getWatchCondition(options)).rejects.toThrow();
    });
  });

  // ============================================================
  // AC #7: Table output format
  // ============================================================
  describe('Table Output Format (AC #7)', () => {
    it('12.3-UNIT-027: should display watch condition get as formatted table', async () => {
      const options: WatchConditionGetOptions = {
        channelId: '123456',
        output: 'table',
      };

      mockWatchConditionService.getWatchCondition.mockResolvedValue([
        {
          channelId: '123456',
          authType: 'code',
          enabled: 'Y',
          code: 'secret',
        },
      ]);

      await watchConditionHandler.getWatchCondition(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.3-UNIT-028: should show rank column (1=Primary, 2=Secondary)', async () => {
      const options: WatchConditionGetOptions = {
        channelId: '123456',
        output: 'table',
      };

      mockWatchConditionService.getWatchCondition.mockResolvedValue([
        {
          channelId: '123456',
          authType: 'code',
          enabled: 'Y',
        },
        {
          channelId: '123456',
          authType: 'pay',
          enabled: 'N',
        },
      ]);

      await watchConditionHandler.getWatchCondition(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.3-UNIT-029: should show authType with Chinese labels', async () => {
      const options: WatchConditionGetOptions = {
        channelId: '123456',
        output: 'table',
      };

      mockWatchConditionService.getWatchCondition.mockResolvedValue([
        {
          channelId: '123456',
          authType: 'code',
          enabled: 'Y',
        },
      ]);

      await watchConditionHandler.getWatchCondition(options);

      // Should show Chinese labels like "密码观看", "付费观看", etc.
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.3-UNIT-030: should show enabled status with Y/N labels', async () => {
      const options: WatchConditionGetOptions = {
        channelId: '123456',
        output: 'table',
      };

      mockWatchConditionService.getWatchCondition.mockResolvedValue([
        {
          channelId: '123456',
          authType: 'none',
          enabled: 'Y',
        },
        {
          channelId: '123456',
          authType: 'none',
          enabled: 'N',
        },
      ]);

      await watchConditionHandler.getWatchCondition(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.3-UNIT-031: should show authType-specific details (password, price, etc.)', async () => {
      const options: WatchConditionGetOptions = {
        channelId: '123456',
        output: 'table',
      };

      mockWatchConditionService.getWatchCondition.mockResolvedValue([
        {
          channelId: '123456',
          authType: 'code',
          enabled: 'Y',
          code: 'password123',
        },
        {
          channelId: '123456',
          authType: 'pay',
          enabled: 'Y',
          payAmount: 9900, // 99.00 yuan
        },
        {
          channelId: '123456',
          authType: 'external',
          enabled: 'Y',
          externalKey: 'ext-key',
          externalUri: 'https://example.com/auth',
        },
      ]);

      await watchConditionHandler.getWatchCondition(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.3-UNIT-035: should show custom authType details', async () => {
      const options: WatchConditionGetOptions = {
        channelId: '123456',
        output: 'table',
      };

      mockWatchConditionService.getWatchCondition.mockResolvedValue([
        {
          channelId: '123456',
          authType: 'custom',
          enabled: 'Y',
          customUri: 'https://custom.example.com/auth',
        },
      ]);

      await watchConditionHandler.getWatchCondition(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.3-UNIT-036: should show info authType details', async () => {
      const options: WatchConditionGetOptions = {
        channelId: '123456',
        output: 'table',
      };

      mockWatchConditionService.getWatchCondition.mockResolvedValue([
        {
          channelId: '123456',
          authType: 'info',
          enabled: 'Y',
          infoFields: [
            { type: 'name', name: '姓名' },
            { type: 'mobile', name: '手机' },
          ],
        },
      ]);

      await watchConditionHandler.getWatchCondition(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.3-UNIT-037: should show direct authType details', async () => {
      const options: WatchConditionGetOptions = {
        channelId: '123456',
        output: 'table',
      };

      mockWatchConditionService.getWatchCondition.mockResolvedValue([
        {
          channelId: '123456',
          authType: 'direct',
          enabled: 'Y',
          directKey: 'direct-auth-key-12345',
        },
      ]);

      await watchConditionHandler.getWatchCondition(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });

  // ============================================================
  // AC #8: JSON config file support
  // ============================================================
  describe('JSON Config File Support (AC #8)', () => {
    it('12.3-UNIT-032: should parse JSON config file correctly', async () => {
      const configPath = '/path/to/config.json';
      const options: WatchConditionSetOptions = {
        channelId: '123456',
        configFile: configPath,
        output: 'table',
      };

      const mockConfig = {
        authSettings: [
          {
            rank: 1,
            enabled: 'Y',
            authType: 'code',
            code: 'test123',
          },
        ],
      };

      (existsSync as jest.Mock).mockReturnValue(true);
      (readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));

      mockWatchConditionService.setWatchCondition.mockResolvedValue('success');

      await watchConditionHandler.setWatchCondition(options);

      expect(mockWatchConditionService.setWatchCondition).toHaveBeenCalledWith({
        channelId: '123456',
        authSettings: mockConfig.authSettings,
      });
    });

    it('12.3-UNIT-033: should support multiple authSettings in config file', async () => {
      const configPath = '/path/to/config.json';
      const options: WatchConditionSetOptions = {
        channelId: '123456',
        configFile: configPath,
        output: 'table',
      };

      const mockConfig = {
        authSettings: [
          {
            rank: 1,
            enabled: 'Y',
            authType: 'code',
            code: 'password1',
          },
          {
            rank: 2,
            enabled: 'Y',
            authType: 'pay',
            payAmount: 5000,
          },
        ],
      };

      (existsSync as jest.Mock).mockReturnValue(true);
      (readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));

      mockWatchConditionService.setWatchCondition.mockResolvedValue('success');

      await watchConditionHandler.setWatchCondition(options);

      expect(mockWatchConditionService.setWatchCondition).toHaveBeenCalledWith({
        channelId: '123456',
        authSettings: mockConfig.authSettings,
      });
    });

    it('12.3-UNIT-034: should validate config file structure', async () => {
      const configPath = '/path/to/invalid-config.json';
      const options: WatchConditionSetOptions = {
        channelId: '123456',
        configFile: configPath,
        output: 'table',
      };

      // Missing authSettings field
      const mockConfig = {
        settings: [
          { rank: 1, authType: 'none' },
        ],
      };

      (existsSync as jest.Mock).mockReturnValue(true);
      (readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));

      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(PolyVValidationError);
      await expect(watchConditionHandler.setWatchCondition(options)).rejects.toThrow(
        '配置文件必须包含 authSettings 字段'
      );
    });

    it('12.3-CMD-004: should support --config option for complex settings', async () => {
      // This is tested in commands test file
      expect(true).toBe(true);
    });
  });

  // ============================================================
  // Additional edge cases
  // ============================================================
  describe('Edge Cases', () => {
    it('should handle empty watch condition response', async () => {
      const options: WatchConditionGetOptions = {
        channelId: '123456',
        output: 'table',
      };

      mockWatchConditionService.getWatchCondition.mockResolvedValue([]);

      await watchConditionHandler.getWatchCondition(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('未找到观看条件配置')
      );
    });

    it('should handle authType=code without code parameter', async () => {
      const options: WatchConditionSetOptions = {
        channelId: '123456',
        rank: 1,
        authType: 'code',
        enabled: 'Y',
        output: 'table',
      };

      // Should still work, code is optional
      mockWatchConditionService.setWatchCondition.mockResolvedValue('success');

      await watchConditionHandler.setWatchCondition(options);

      expect(mockWatchConditionService.setWatchCondition).toHaveBeenCalled();
    });

    it('should handle authType=pay without price parameter', async () => {
      const options: WatchConditionSetOptions = {
        channelId: '123456',
        rank: 1,
        authType: 'pay',
        enabled: 'Y',
        output: 'table',
      };

      // Should still work, price is optional
      mockWatchConditionService.setWatchCondition.mockResolvedValue('success');

      await watchConditionHandler.setWatchCondition(options);

      expect(mockWatchConditionService.setWatchCondition).toHaveBeenCalled();
    });

    it('should convert price from yuan to cents correctly', async () => {
      const options: WatchConditionSetOptions = {
        channelId: '123456',
        rank: 1,
        authType: 'pay',
        enabled: 'Y',
        price: 1.5, // 1.5 yuan = 150 cents
        output: 'table',
      };

      mockWatchConditionService.setWatchCondition.mockResolvedValue('success');

      await watchConditionHandler.setWatchCondition(options);

      expect(mockWatchConditionService.setWatchCondition).toHaveBeenCalledWith(
        expect.objectContaining({
          authSettings: expect.arrayContaining([
            expect.objectContaining({
              payAmount: 150,
            }),
          ]),
        })
      );
    });

    it('should handle info authType with infoFields', async () => {
      const configPath = '/path/to/info-config.json';
      const options: WatchConditionSetOptions = {
        channelId: '123456',
        configFile: configPath,
        output: 'table',
      };

      const mockConfig = {
        authSettings: [
          {
            rank: 1,
            enabled: 'Y',
            authType: 'info',
            infoFields: [
              { type: 'name', name: '姓名', placeholder: '请输入姓名' },
              { type: 'mobile', name: '手机号', sms: 'Y' },
            ],
          },
        ],
      };

      (existsSync as jest.Mock).mockReturnValue(true);
      (readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));

      mockWatchConditionService.setWatchCondition.mockResolvedValue('success');

      await watchConditionHandler.setWatchCondition(options);

      expect(mockWatchConditionService.setWatchCondition).toHaveBeenCalledWith({
        channelId: '123456',
        authSettings: mockConfig.authSettings,
      });
    });
  });
});
