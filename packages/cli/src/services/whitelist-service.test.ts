/**
 * @fileoverview Unit tests for WhitelistServiceSdk
 * @author Development Team
 * @since 12.4.0
 */

import { WhitelistServiceSdk } from './whitelist-service';
import { AuthConfig } from '../types/auth';
import { PolyVClient } from 'polyv-live-api-sdk';

// Mock PolyVClient
jest.mock('polyv-live-api-sdk');
const MockedPolyVClient = PolyVClient as jest.MockedClass<typeof PolyVClient>;

describe('WhitelistServiceSdk', () => {
  let whitelistService: WhitelistServiceSdk;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: any;
  let mockPolyVClient: jest.Mocked<PolyVClient>;
  let mockWebService: any;

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

    mockWebService = {
      getWhiteList: jest.fn(),
      addWhiteList: jest.fn(),
      updateWhiteList: jest.fn(),
      deleteWhiteList: jest.fn(),
    };

    mockPolyVClient = {
      web: mockWebService,
    } as any;

    try {
      MockedPolyVClient.mockImplementation(() => mockPolyVClient);
      whitelistService = new WhitelistServiceSdk(mockAuthConfig, mockServiceConfig);
    } catch {
      // Expected to fail in RED phase
    }
  });

  describe('constructor', () => {
    it('12.4-SVC-001: should create PolyVClient with auth config', () => {
      expect(MockedPolyVClient).toHaveBeenCalledWith(mockAuthConfig);
    });
  });

  describe('getWhiteList', () => {
    it('12.4-SVC-002: should call web.getWhiteList with correct parameters', async () => {
      const params = {
        rank: 1 as const,
        channelId: '123456',
        page: 1,
        pageSize: 10,
        keyword: '张三',
      };

      mockWebService.getWhiteList.mockResolvedValue({
        pageNumber: 1,
        totalPages: 1,
        pageSize: 10,
        contents: [{ name: '张三', phone: '13800138000' }],
      });

      const result = await whitelistService.getWhiteList(params);

      expect(mockWebService.getWhiteList).toHaveBeenCalledWith(params);
      expect(result).toMatchObject({
        pageNumber: 1,
        totalPages: 1,
        pageSize: 10,
        contents: [{ name: '张三', phone: '13800138000' }],
      });
    });

    it('12.4-SVC-003: should call web.getWhiteList without optional parameters', async () => {
      const params = {
        rank: 2 as const,
      };

      mockWebService.getWhiteList.mockResolvedValue({
        pageNumber: 1,
        totalPages: 1,
        pageSize: 10,
        contents: [],
      });

      const result = await whitelistService.getWhiteList(params);

      expect(mockWebService.getWhiteList).toHaveBeenCalledWith(params);
      expect(result).toBeDefined();
    });
  });

  describe('addWhiteList', () => {
    it('12.4-SVC-004: should call web.addWhiteList with correct parameters', async () => {
      const params = {
        rank: 1 as const,
        channelId: '123456',
        code: '13800138000',
        name: '张三',
      };

      mockWebService.addWhiteList.mockResolvedValue('success');

      const result = await whitelistService.addWhiteList(params);

      expect(mockWebService.addWhiteList).toHaveBeenCalledWith(params);
      expect(result).toBe('success');
    });

    it('12.4-SVC-005: should call web.addWhiteList without optional name parameter', async () => {
      const params = {
        rank: 1 as const,
        code: '13800138000',
      };

      mockWebService.addWhiteList.mockResolvedValue('success');

      const result = await whitelistService.addWhiteList(params);

      expect(mockWebService.addWhiteList).toHaveBeenCalledWith(params);
      expect(result).toBe('success');
    });
  });

  describe('updateWhiteList', () => {
    it('12.4-SVC-006: should call web.updateWhiteList with correct parameters including oldCode', async () => {
      const params = {
        rank: 1 as const,
        channelId: '123456',
        oldCode: '13800138000',
        code: '13900139000',
        name: '李四',
      };

      mockWebService.updateWhiteList.mockResolvedValue('success');

      const result = await whitelistService.updateWhiteList(params);

      // Note: oldCode is passed even though SDK type might not include it
      // The service wrapper should handle this extension
      expect(mockWebService.updateWhiteList).toHaveBeenCalledWith(
        expect.objectContaining({
          rank: 1,
          channelId: '123456',
          code: '13900139000',
          name: '李四',
          oldCode: '13800138000',
        })
      );
      expect(result).toBe('success');
    });
  });

  describe('deleteWhiteList', () => {
    it('12.4-SVC-007: should call web.deleteWhiteList with codes parameter', async () => {
      const params = {
        rank: 1 as const,
        channelId: '123456',
        codes: '13800138000,13900139000',
      };

      mockWebService.deleteWhiteList.mockResolvedValue('success');

      const result = await whitelistService.deleteWhiteList(params);

      expect(mockWebService.deleteWhiteList).toHaveBeenCalledWith(params);
      expect(result).toBe('success');
    });

    it('12.4-SVC-008: should call web.deleteWhiteList with isClear parameter', async () => {
      const params = {
        rank: 1 as const,
        channelId: '123456',
        codes: '',
        isClear: 'Y' as const,
      };

      mockWebService.deleteWhiteList.mockResolvedValue('success');

      const result = await whitelistService.deleteWhiteList(params);

      expect(mockWebService.deleteWhiteList).toHaveBeenCalledWith(params);
      expect(result).toBe('success');
    });
  });

  describe('error handling', () => {
    it('12.4-SVC-009: should propagate errors from SDK', async () => {
      const params = {
        rank: 1 as const,
      };

      mockWebService.getWhiteList.mockRejectedValue(new Error('API Error: Invalid appId'));

      await expect(whitelistService.getWhiteList(params)).rejects.toThrow('API Error: Invalid appId');
    });
  });
});
