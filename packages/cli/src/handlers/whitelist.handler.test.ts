/**
 * @fileoverview Unit tests for WhitelistHandler
 * @author Development Team
 * @since 12.4.0
 */

import { WhitelistHandler } from './whitelist.handler';
import { WhitelistServiceSdk } from '../services/whitelist-service';
import {
  WhitelistServiceConfig,
  WhitelistListOptions,
  WhitelistAddOptions,
  WhitelistUpdateOptions,
  WhitelistRemoveOptions,
} from '../types/whitelist';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError, PolyVError } from '../utils/errors';

// Mock WhitelistServiceSdk
jest.mock('../services/whitelist-service');
const MockedWhitelistService = WhitelistServiceSdk as jest.MockedClass<typeof WhitelistServiceSdk>;

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

describe('WhitelistHandler', () => {
  let whitelistHandler: WhitelistHandler;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: WhitelistServiceConfig;
  let mockWhitelistService: jest.Mocked<WhitelistServiceSdk>;

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

    mockWhitelistService = {
      getWhiteList: jest.fn(),
      addWhiteList: jest.fn(),
      updateWhiteList: jest.fn(),
      deleteWhiteList: jest.fn(),
    } as any;

    try {
      MockedWhitelistService.mockImplementation(() => mockWhitelistService);
      whitelistHandler = new WhitelistHandler(mockAuthConfig, mockServiceConfig);
    } catch {
      // Expected to fail in RED phase
    }
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('constructor', () => {
    it('12.4-UNIT-001: should create WhitelistServiceSdk with correct configuration', () => {
      expect(MockedWhitelistService).toHaveBeenCalledWith(mockAuthConfig, mockServiceConfig);
    });
  });

  // ============================================================
  // AC #1: whitelist list command
  // ============================================================
  describe('listWhitelist (AC #1)', () => {
    it('12.4-UNIT-002: should get channel-specific whitelist with channelId', async () => {
      const options: WhitelistListOptions = {
        channelId: '123456',
        rank: 1,
        output: 'table',
      };

      mockWhitelistService.getWhiteList.mockResolvedValue({
        pageNumber: 1,
        totalPages: 1,
        pageSize: 10,
        contents: [
          { name: '张三', phone: '13800138000' },
          { name: '李四', phone: '13900139000' },
        ],
      });

      await whitelistHandler.listWhitelist(options);

      expect(mockWhitelistService.getWhiteList).toHaveBeenCalledWith({
        rank: 1,
        channelId: '123456',
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.4-UNIT-003: should get global whitelist when no channelId provided', async () => {
      const options: WhitelistListOptions = {
        rank: 2,
        output: 'table',
      };

      mockWhitelistService.getWhiteList.mockResolvedValue({
        pageNumber: 1,
        totalPages: 1,
        pageSize: 10,
        contents: [{ name: '王五', phone: '13700137000' }],
      });

      await whitelistHandler.listWhitelist(options);

      expect(mockWhitelistService.getWhiteList).toHaveBeenCalledWith({
        rank: 2,
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.4-UNIT-010: should get whitelist with pagination parameters', async () => {
      const options: WhitelistListOptions = {
        channelId: '123456',
        rank: 1,
        page: 2,
        pageSize: 20,
        output: 'table',
      };

      mockWhitelistService.getWhiteList.mockResolvedValue({
        pageNumber: 2,
        totalPages: 5,
        pageSize: 20,
        contents: [],
      });

      await whitelistHandler.listWhitelist(options);

      expect(mockWhitelistService.getWhiteList).toHaveBeenCalledWith({
        rank: 1,
        channelId: '123456',
        page: 2,
        pageSize: 20,
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.4-UNIT-011: should get whitelist with keyword search', async () => {
      const options: WhitelistListOptions = {
        channelId: '123456',
        rank: 1,
        keyword: '张三',
        output: 'table',
      };

      mockWhitelistService.getWhiteList.mockResolvedValue({
        pageNumber: 1,
        totalPages: 1,
        pageSize: 10,
        contents: [{ name: '张三', phone: '13800138000' }],
      });

      await whitelistHandler.listWhitelist(options);

      expect(mockWhitelistService.getWhiteList).toHaveBeenCalledWith({
        rank: 1,
        channelId: '123456',
        keyword: '张三',
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.4-UNIT-008: should output whitelist in table format', async () => {
      const options: WhitelistListOptions = {
        channelId: '123456',
        rank: 1,
        output: 'table',
      };

      mockWhitelistService.getWhiteList.mockResolvedValue({
        pageNumber: 1,
        totalPages: 1,
        pageSize: 10,
        contents: [
          { name: '张三', phone: '13800138000' },
          { name: '李四', phone: '13900139000' },
        ],
      });

      await whitelistHandler.listWhitelist(options);

      expect(mockConsoleLog).toHaveBeenCalled();
      // The table output is rendered via console.log in displayAsTable
      // Check that multiple calls were made (summary + table headers + table data)
      const allOutput = mockConsoleLog.mock.calls.map(call => call[0]).join('\n');
      expect(allOutput).toContain('会员码');
      expect(allOutput).toContain('昵称');
      expect(allOutput).toContain('13800138000');
      expect(allOutput).toContain('张三');
    });

    it('12.4-UNIT-009: should output whitelist in JSON format', async () => {
      const options: WhitelistListOptions = {
        channelId: '123456',
        rank: 1,
        output: 'json',
      };

      mockWhitelistService.getWhiteList.mockResolvedValue({
        pageNumber: 1,
        totalPages: 1,
        pageSize: 10,
        contents: [{ name: '张三', phone: '13800138000' }],
      });

      await whitelistHandler.listWhitelist(options);

      expect(mockConsoleLog).toHaveBeenCalled();
      const output = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(output).toHaveProperty('pageNumber', 1);
      expect(output).toHaveProperty('contents');
      expect(output.contents[0]).toMatchObject({
        name: '张三',
        phone: '13800138000',
      });
    });

    it('12.4-UNIT-013: should throw error when rank is not 1 or 2', async () => {
      const options: WhitelistListOptions = {
        channelId: '123456',
        rank: 3 as any,
        output: 'table',
      };

      await expect(whitelistHandler.listWhitelist(options)).rejects.toThrow(PolyVValidationError);
      await expect(whitelistHandler.listWhitelist(options)).rejects.toThrow(
        'rank 必须是 1 (主要条件) 或 2 (次要条件)'
      );
    });
  });

  // ============================================================
  // AC #2: whitelist add command
  // ============================================================
  describe('addWhitelist (AC #2)', () => {
    it('12.4-UNIT-004: should add whitelist with required parameters', async () => {
      const options: WhitelistAddOptions = {
        channelId: '123456',
        rank: 1,
        code: '13800138000',
        name: '张三',
        output: 'table',
      };

      mockWhitelistService.addWhiteList.mockResolvedValue('success');

      await whitelistHandler.addWhitelist(options);

      expect(mockWhitelistService.addWhiteList).toHaveBeenCalledWith({
        rank: 1,
        channelId: '123456',
        code: '13800138000',
        name: '张三',
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.4-UNIT-009: should output add result in JSON format', async () => {
      const options: WhitelistAddOptions = {
        rank: 1,
        code: '13800138000',
        name: '张三',
        output: 'json',
      };

      mockWhitelistService.addWhiteList.mockResolvedValue('success');

      await whitelistHandler.addWhitelist(options);

      expect(mockConsoleLog).toHaveBeenCalled();
      const output = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(output).toHaveProperty('success', true);
      expect(output).toHaveProperty('message');
    });

    it('12.4-UNIT-014: should throw error when code is empty', async () => {
      const options: WhitelistAddOptions = {
        rank: 1,
        code: '',
        output: 'table',
      };

      await expect(whitelistHandler.addWhitelist(options)).rejects.toThrow(PolyVValidationError);
      await expect(whitelistHandler.addWhitelist(options)).rejects.toThrow(
        'code (会员码) 是必需的'
      );
    });

    it('12.4-UNIT-017: should throw error when code exceeds 50 characters', async () => {
      const options: WhitelistAddOptions = {
        rank: 1,
        code: 'a'.repeat(51),
        output: 'table',
      };

      await expect(whitelistHandler.addWhitelist(options)).rejects.toThrow(PolyVValidationError);
      await expect(whitelistHandler.addWhitelist(options)).rejects.toThrow(
        'code 不能超过50个字符'
      );
    });

    it('12.4-UNIT-017: should throw error when name exceeds 50 characters', async () => {
      const options: WhitelistAddOptions = {
        rank: 1,
        code: '13800138000',
        name: 'a'.repeat(51),
        output: 'table',
      };

      await expect(whitelistHandler.addWhitelist(options)).rejects.toThrow(PolyVValidationError);
      await expect(whitelistHandler.addWhitelist(options)).rejects.toThrow(
        'name 不能超过50个字符'
      );
    });
  });

  // ============================================================
  // AC #3: whitelist update command
  // ============================================================
  describe('updateWhitelist (AC #3)', () => {
    it('12.4-UNIT-005: should update whitelist with oldCode and new code', async () => {
      const options: WhitelistUpdateOptions = {
        channelId: '123456',
        rank: 1,
        oldCode: '13800138000',
        code: '13900139000',
        name: '李四',
        output: 'table',
      };

      mockWhitelistService.updateWhiteList.mockResolvedValue('success');

      await whitelistHandler.updateWhitelist(options);

      expect(mockWhitelistService.updateWhiteList).toHaveBeenCalledWith({
        rank: 1,
        channelId: '123456',
        oldCode: '13800138000',
        code: '13900139000',
        name: '李四',
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.4-UNIT-015: should throw error when oldCode is empty', async () => {
      const options: WhitelistUpdateOptions = {
        rank: 1,
        oldCode: '',
        code: '13900139000',
        output: 'table',
      };

      await expect(whitelistHandler.updateWhitelist(options)).rejects.toThrow(
        PolyVValidationError
      );
      await expect(whitelistHandler.updateWhitelist(options)).rejects.toThrow(
        'old-code (原会员码) 是必需的'
      );
    });
  });

  // ============================================================
  // AC #4: whitelist remove command
  // ============================================================
  describe('removeWhitelist (AC #4)', () => {
    it('12.4-UNIT-006: should remove whitelist with single code', async () => {
      const options: WhitelistRemoveOptions = {
        channelId: '123456',
        rank: 1,
        codes: '13800138000',
        output: 'table',
      };

      mockWhitelistService.deleteWhiteList.mockResolvedValue('success');

      await whitelistHandler.removeWhitelist(options);

      expect(mockWhitelistService.deleteWhiteList).toHaveBeenCalledWith({
        rank: 1,
        channelId: '123456',
        codes: '13800138000',
        isClear: 'N',
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.4-UNIT-012: should remove whitelist with batch codes (comma-separated)', async () => {
      const options: WhitelistRemoveOptions = {
        channelId: '123456',
        rank: 1,
        codes: '13800138000,13900139000,13700137000',
        output: 'table',
      };

      mockWhitelistService.deleteWhiteList.mockResolvedValue('success');

      await whitelistHandler.removeWhitelist(options);

      expect(mockWhitelistService.deleteWhiteList).toHaveBeenCalledWith({
        rank: 1,
        channelId: '123456',
        codes: '13800138000,13900139000,13700137000',
        isClear: 'N',
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.4-UNIT-007: should clear all whitelist with --clear flag', async () => {
      const options: WhitelistRemoveOptions = {
        channelId: '123456',
        rank: 1,
        clear: true,
        output: 'table',
      };

      mockWhitelistService.deleteWhiteList.mockResolvedValue('success');

      await whitelistHandler.removeWhitelist(options);

      expect(mockWhitelistService.deleteWhiteList).toHaveBeenCalledWith({
        rank: 1,
        channelId: '123456',
        isClear: 'Y',
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.4-UNIT-016: should throw error when codes is empty without clear flag', async () => {
      const options: WhitelistRemoveOptions = {
        rank: 1,
        codes: '',
        output: 'table',
      };

      await expect(whitelistHandler.removeWhitelist(options)).rejects.toThrow(
        PolyVValidationError
      );
      await expect(whitelistHandler.removeWhitelist(options)).rejects.toThrow(
        '必须指定 --codes 或使用 --clear 清空所有'
      );
    });
  });

  // ============================================================
  // AC #8: Error handling
  // ============================================================
  describe('Error Handling (AC #8)', () => {
    it('12.4-UNIT-018: should handle API errors gracefully', async () => {
      const options: WhitelistListOptions = {
        rank: 1,
        output: 'table',
      };

      mockWhitelistService.getWhiteList.mockRejectedValue(new Error('API Error: Invalid appId'));

      await expect(whitelistHandler.listWhitelist(options)).rejects.toThrow();
    });

    it('12.4-UNIT-013: should validate rank parameter in all methods', async () => {
      const invalidRank = 3 as any;

      // Test listWhitelist
      await expect(
        whitelistHandler.listWhitelist({ rank: invalidRank, output: 'table' })
      ).rejects.toThrow(PolyVValidationError);

      // Test addWhitelist
      await expect(
        whitelistHandler.addWhitelist({ rank: invalidRank, code: 'test', output: 'table' })
      ).rejects.toThrow(PolyVValidationError);

      // Test updateWhitelist
      await expect(
        whitelistHandler.updateWhitelist({
          rank: invalidRank,
          oldCode: 'old',
          code: 'new',
          output: 'table',
        })
      ).rejects.toThrow(PolyVValidationError);

      // Test removeWhitelist
      await expect(
        whitelistHandler.removeWhitelist({ rank: invalidRank, codes: 'test', output: 'table' })
      ).rejects.toThrow(PolyVValidationError);
    });
  });
});
