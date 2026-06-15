/**
 * @fileoverview Unit tests for WatchConditionServiceSdk
 * @author Development Team
 * @since 12.3.0
 *
 * ATDD RED PHASE - These tests will fail until watch-condition-service.ts is implemented
 */

// @ts-expect-error - Module not implemented yet
import { WatchConditionServiceSdk } from './watch-condition-service';
import { AuthConfig } from '../types/auth';
import { WatchConditionServiceConfig } from '../types/watch-condition';
import { PolyVClient } from 'polyv-live-api-sdk';

// Mock PolyVClient
jest.mock('polyv-live-api-sdk');
const MockedPolyVClient = PolyVClient as jest.MockedClass<typeof PolyVClient>;

describe('WatchConditionServiceSdk (ATDD RED PHASE)', () => {
  let service: WatchConditionServiceSdk;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: WatchConditionServiceConfig;
  let mockClient: jest.Mocked<PolyVClient>;
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
      getWatchCondition: jest.fn(),
      setWatchCondition: jest.fn(),
    };

    mockClient = {
      web: mockWebService,
    } as any;

    try {
      MockedPolyVClient.mockImplementation(() => mockClient);
      service = new WatchConditionServiceSdk(mockAuthConfig, mockServiceConfig);
    } catch {
      // Expected to fail in RED phase
    }
  });

  describe('constructor', () => {
    it('should create PolyVClient with correct configuration', () => {
      expect(MockedPolyVClient).toHaveBeenCalledWith(mockAuthConfig);
    });
  });

  // ============================================================
  // AC #5: Reuse SDK Web Service - getWatchCondition
  // ============================================================
  describe('getWatchCondition (AC #5)', () => {
    it('12.3-SVC-001: should call web.getWatchCondition for get operations', async () => {
      const mockResponse = [
        {
          channelId: '123456',
          authType: 'code',
          enabled: 'Y',
          code: 'test123',
        },
        {
          channelId: '123456',
          authType: 'none',
          enabled: 'N',
        },
      ];

      mockWebService.getWatchCondition.mockResolvedValue(mockResponse);

      const result = await service.getWatchCondition({ channelId: '123456' });

      expect(mockWebService.getWatchCondition).toHaveBeenCalledWith({
        channelId: '123456',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call web.getWatchCondition without channelId for global settings', async () => {
      const mockResponse = [
        {
          channelId: '',
          authType: 'none',
          enabled: 'Y',
        },
      ];

      mockWebService.getWatchCondition.mockResolvedValue(mockResponse);

      const result = await service.getWatchCondition({});

      expect(mockWebService.getWatchCondition).toHaveBeenCalledWith({});
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty response', async () => {
      mockWebService.getWatchCondition.mockResolvedValue([]);

      const result = await service.getWatchCondition({ channelId: '123456' });

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockWebService.getWatchCondition.mockRejectedValue(error);

      await expect(service.getWatchCondition({ channelId: '123456' })).rejects.toThrow('API Error');
    });

    it('should pass through PolyVError instances', async () => {
      const { PolyVError } = await import('../utils/errors');
      const polyvError = new PolyVError('Original error', 'TEST_ERROR', 400);
      mockWebService.getWatchCondition.mockRejectedValue(polyvError);

      await expect(service.getWatchCondition({ channelId: '123456' })).rejects.toThrow(polyvError);
    });

    it('should handle non-Error objects', async () => {
      mockWebService.getWatchCondition.mockRejectedValue('string error');

      await expect(service.getWatchCondition({ channelId: '123456' })).rejects.toThrow('getWatchCondition failed');
    });

    it('should pass through response with all authType fields', async () => {
      const mockResponse = [
        {
          channelId: '123456',
          authType: 'pay',
          enabled: 'Y',
          payAmount: 9900,
        },
        {
          channelId: '123456',
          authType: 'external',
          enabled: 'Y',
          externalKey: 'key',
          externalUri: 'https://example.com',
        },
        {
          channelId: '123456',
          authType: 'info',
          enabled: 'Y',
          infoFields: [
            { type: 'name', name: '姓名' },
          ],
        },
      ];

      mockWebService.getWatchCondition.mockResolvedValue(mockResponse);

      const result = await service.getWatchCondition({ channelId: '123456' });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================================
  // AC #5: Reuse SDK Web Service - setWatchCondition
  // ============================================================
  describe('setWatchCondition (AC #5)', () => {
    it('12.3-SVC-002: should call web.setWatchCondition for set operations', async () => {
      mockWebService.setWatchCondition.mockResolvedValue('success');

      const params = {
        channelId: '123456',
        authSettings: [
          {
            rank: 1 as const,
            authType: 'code' as const,
            enabled: 'Y' as const,
            code: 'password123',
          },
        ],
      };

      const result = await service.setWatchCondition(params);

      expect(mockWebService.setWatchCondition).toHaveBeenCalledWith(params);
      expect(result).toBe('success');
    });

    it('should call web.setWatchCondition without channelId for global settings', async () => {
      mockWebService.setWatchCondition.mockResolvedValue('success');

      const params = {
        authSettings: [
          {
            rank: 1 as const,
            authType: 'none' as const,
            enabled: 'Y' as const,
          },
        ],
      };

      const result = await service.setWatchCondition(params);

      expect(mockWebService.setWatchCondition).toHaveBeenCalledWith(params);
      expect(result).toBe('success');
    });

    it('should pass through multiple authSettings', async () => {
      mockWebService.setWatchCondition.mockResolvedValue('success');

      const params = {
        channelId: '123456',
        authSettings: [
          {
            rank: 1 as const,
            authType: 'code' as const,
            enabled: 'Y' as const,
            code: 'abc123',
          },
          {
            rank: 2 as const,
            authType: 'pay' as const,
            enabled: 'Y' as const,
            payAmount: 5000,
          },
        ],
      };

      const result = await service.setWatchCondition(params);

      expect(mockWebService.setWatchCondition).toHaveBeenCalledWith(params);
      expect(result).toBe('success');
    });

    it('should pass through pay authType settings', async () => {
      mockWebService.setWatchCondition.mockResolvedValue('success');

      const params = {
        channelId: '123456',
        authSettings: [
          {
            rank: 1 as const,
            authType: 'pay' as const,
            enabled: 'Y' as const,
            payAmount: 9900,
          },
        ],
      };

      const result = await service.setWatchCondition(params);

      expect(mockWebService.setWatchCondition).toHaveBeenCalledWith(params);
      expect(result).toBe('success');
    });

    it('should pass through external authType settings', async () => {
      mockWebService.setWatchCondition.mockResolvedValue('success');

      const params = {
        channelId: '123456',
        authSettings: [
          {
            rank: 1 as const,
            authType: 'external' as const,
            enabled: 'Y' as const,
            externalKey: 'ext-key',
            externalUri: 'https://example.com/auth',
          },
        ],
      };

      const result = await service.setWatchCondition(params);

      expect(mockWebService.setWatchCondition).toHaveBeenCalledWith(params);
      expect(result).toBe('success');
    });

    it('should pass through info authType settings with infoFields', async () => {
      mockWebService.setWatchCondition.mockResolvedValue('success');

      const params = {
        channelId: '123456',
        authSettings: [
          {
            rank: 1 as const,
            authType: 'info' as const,
            enabled: 'Y' as const,
            infoFields: [
              { type: 'name' as const, name: '姓名' },
              { type: 'mobile' as const, name: '手机号', sms: 'Y' },
            ],
          },
        ],
      };

      const result = await service.setWatchCondition(params);

      expect(mockWebService.setWatchCondition).toHaveBeenCalledWith(params);
      expect(result).toBe('success');
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockWebService.setWatchCondition.mockRejectedValue(error);

      const params = {
        channelId: '123456',
        authSettings: [
          {
            rank: 1 as const,
            authType: 'none' as const,
            enabled: 'Y' as const,
          },
        ],
      };

      await expect(service.setWatchCondition(params)).rejects.toThrow('API Error');
    });

    it('should pass through PolyVError instances for setWatchCondition', async () => {
      const { PolyVError } = await import('../utils/errors');
      const polyvError = new PolyVError('Original set error', 'SET_ERROR', 400);
      mockWebService.setWatchCondition.mockRejectedValue(polyvError);

      const params = {
        channelId: '123456',
        authSettings: [
          {
            rank: 1 as const,
            authType: 'none' as const,
            enabled: 'Y' as const,
          },
        ],
      };

      await expect(service.setWatchCondition(params)).rejects.toThrow(polyvError);
    });

    it('should handle non-Error objects for setWatchCondition', async () => {
      mockWebService.setWatchCondition.mockRejectedValue({ message: 'object error' });

      const params = {
        channelId: '123456',
        authSettings: [
          {
            rank: 1 as const,
            authType: 'none' as const,
            enabled: 'Y' as const,
          },
        ],
      };

      await expect(service.setWatchCondition(params)).rejects.toThrow('setWatchCondition failed');
    });

    it('should handle disabled authSetting', async () => {
      mockWebService.setWatchCondition.mockResolvedValue('success');

      const params = {
        channelId: '123456',
        authSettings: [
          {
            rank: 1 as const,
            enabled: 'N' as const,
          },
        ],
      };

      const result = await service.setWatchCondition(params);

      expect(mockWebService.setWatchCondition).toHaveBeenCalledWith(params);
      expect(result).toBe('success');
    });
  });

  // ============================================================
  // Service configuration tests
  // ============================================================
  describe('Service Configuration', () => {
    it('should work with minimal configuration', async () => {
      const minimalConfig = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
      };

      mockWebService.getWatchCondition.mockResolvedValue([]);

      const minimalService = new WatchConditionServiceSdk(minimalConfig);
      await minimalService.getWatchCondition({});

      expect(mockWebService.getWatchCondition).toHaveBeenCalled();
    });

    it('should work without serviceConfig', async () => {
      mockWebService.getWatchCondition.mockResolvedValue([]);

      const serviceWithoutConfig = new WatchConditionServiceSdk(mockAuthConfig);
      await serviceWithoutConfig.getWatchCondition({});

      expect(mockWebService.getWatchCondition).toHaveBeenCalled();
    });
  });
});
