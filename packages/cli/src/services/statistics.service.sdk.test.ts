/**
 * @fileoverview Tests for StatisticsServiceSdk
 * @author Development Team
 */

import { StatisticsServiceSdk } from './statistics.service.sdk';
import {
  StatisticsViewOptions,
  StatisticsConcurrencyOptions,
  StatisticsMaxConcurrentOptions,
  StatisticsAudienceRegionOptions,
  StatisticsAudienceDeviceOptions,
  StatisticsServiceConfig,
} from '../types/statistics';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import * as sdkModule from '../sdk';

// Mock the SDK module
jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

const mockCreateSdkClient = sdkModule.createSdkClient as jest.MockedFunction<typeof sdkModule.createSdkClient>;

describe('StatisticsServiceSdk', () => {
  let service: StatisticsServiceSdk;
  let mockSdkClient: {
    statistics: { [key: string]: jest.Mock };
    channel: { [key: string]: jest.Mock };
  };
  const mockAuthConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
  };
  const mockServiceConfig: StatisticsServiceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock SDK client
    mockSdkClient = {
      statistics: {
        getDailyViewStatistics: jest.fn(),
        getConcurrencyData: jest.fn(),
        getMaxConcurrent: jest.fn(),
        getRegionDistribution: jest.fn(),
        getDeviceDistribution: jest.fn(),
        getViewlog: jest.fn(),
        exportSessionStats: jest.fn(),
      },
      channel: {
        getSummary: jest.fn(),
      },
    };

    mockCreateSdkClient.mockReturnValue(mockSdkClient as any);
    service = new StatisticsServiceSdk(mockAuthConfig, mockServiceConfig);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // ============================================
  // Constructor Tests
  // ============================================

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      expect(service).toBeInstanceOf(StatisticsServiceSdk);
    });
  });

  describe('getSummary', () => {
    it('should return summary data successfully', async () => {
      const mockResponse = [
        {
          currentDay: '2026-06-01',
          channelId: '7983903',
          videoView: 12,
        },
      ];

      mockSdkClient.channel.getSummary.mockResolvedValueOnce(mockResponse);

      const result = await service.getSummary({
        channelId: '7983903',
        startDay: '2026-06-01',
        endDay: '2026-06-30',
      });

      expect(result).toEqual(mockResponse);
      expect(mockSdkClient.channel.getSummary).toHaveBeenCalledWith('7983903', {
        startDay: '2026-06-01',
        endDay: '2026-06-30',
      });
    });

    it('should return an empty array when summary response is undefined', async () => {
      mockSdkClient.channel.getSummary.mockResolvedValueOnce(undefined);

      const result = await service.getSummary({
        channelId: '7983903',
        startDay: '2026-06-01',
        endDay: '2026-06-30',
      });

      expect(result).toEqual([]);
    });
  });

  // ============================================
  // getDailyViewStatistics Tests (Story 10.1)
  // ============================================

  describe('getDailyViewStatistics', () => {
    const validOptions: StatisticsViewOptions = {
      channelId: '3151318',
      startDay: '2024-01-15',
      endDay: '2024-01-16',
    };

    it('should return daily view statistics successfully', async () => {
      const mockResponse = {
        contents: [
          {
            currentDay: '2024-01-15',
            channelId: '3151318',
            userId: 'user123',
            pcPlayDuration: 100,
            pcVideoView: 500,
            pcUniqueViewer: 50,
            mobilePlayDuration: 200,
            mobileVideoView: 800,
            mobileUniqueViewer: 80,
            createdTime: 1705276800000,
            lastModified: 1705363200000,
          },
        ],
      };

      mockSdkClient.statistics.getDailyViewStatistics.mockResolvedValueOnce(mockResponse);

      const result = await service.getDailyViewStatistics(validOptions);

      expect(result).toEqual(mockResponse.contents);
      expect(mockCreateSdkClient).toHaveBeenCalledWith(mockAuthConfig, mockServiceConfig.baseUrl);
    });

    it('should return empty array when no data', async () => {
      mockSdkClient.statistics.getDailyViewStatistics.mockResolvedValueOnce({ contents: null });

      const result = await service.getDailyViewStatistics(validOptions);

      expect(result).toEqual([]);
    });

    it('should throw PolyVValidationError for invalid channelId', async () => {
      const invalidOptions = { ...validOptions, channelId: '' };

      await expect(service.getDailyViewStatistics(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid startDay format', async () => {
      const invalidOptions = { ...validOptions, startDay: '2024/01/15' };

      await expect(service.getDailyViewStatistics(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid endDay format', async () => {
      const invalidOptions = { ...validOptions, endDay: 'invalid-date' };

      await expect(service.getDailyViewStatistics(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for date range exceeding 60 days', async () => {
      const invalidOptions = {
        ...validOptions,
        startDay: '2024-01-01',
        endDay: '2024-03-15', // 74 days
      };

      await expect(service.getDailyViewStatistics(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // getConcurrencyData Tests (Story 10.2)
  // ============================================

  describe('getConcurrencyData', () => {
    const validOptions: StatisticsConcurrencyOptions = {
      channelId: '3151318',
      startDate: '2024-01-15',
      endDate: '2024-01-16',
    };

    it('should return concurrency data successfully', async () => {
      const mockResponse = {
        contents: [
          {
            day: '2024-01-15',
            minute: '10:30',
            viewers: 150,
          },
        ],
      };

      mockSdkClient.statistics.getConcurrencyData.mockResolvedValueOnce(mockResponse);

      const result = await service.getConcurrencyData(validOptions);

      expect(result).toEqual(mockResponse.contents);
    });

    it('should return empty array when no data', async () => {
      mockSdkClient.statistics.getConcurrencyData.mockResolvedValueOnce({ contents: null });

      const result = await service.getConcurrencyData(validOptions);

      expect(result).toEqual([]);
    });

    it('should throw PolyVValidationError for invalid channelId', async () => {
      const invalidOptions = { ...validOptions, channelId: '' };

      await expect(service.getConcurrencyData(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid startDate format', async () => {
      const invalidOptions = { ...validOptions, startDate: '01-15-2024' };

      await expect(service.getConcurrencyData(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid endDate format', async () => {
      const invalidOptions = { ...validOptions, endDate: '' };

      await expect(service.getConcurrencyData(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // getMaxConcurrent Tests (Story 10.2)
  // ============================================

  describe('getMaxConcurrent', () => {
    const validOptions: StatisticsMaxConcurrentOptions = {
      channelId: '3151318',
      startTime: 1705276800000,
      endTime: 1705363200000,
    };

    it('should return max concurrent viewers count successfully', async () => {
      const mockResponse = {
        contents: 500,
      };

      mockSdkClient.statistics.getMaxConcurrent.mockResolvedValueOnce(mockResponse);

      const result = await service.getMaxConcurrent(validOptions);

      expect(result).toBe(500);
    });

    it('should return 0 when no data', async () => {
      mockSdkClient.statistics.getMaxConcurrent.mockResolvedValueOnce({ contents: null });

      const result = await service.getMaxConcurrent(validOptions);

      expect(result).toBe(0);
    });

    it('should throw PolyVValidationError for invalid channelId', async () => {
      const invalidOptions = { ...validOptions, channelId: '' };

      await expect(service.getMaxConcurrent(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid startTime', async () => {
      const invalidOptions = { ...validOptions, startTime: -1 };

      await expect(service.getMaxConcurrent(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid endTime', async () => {
      const invalidOptions = { ...validOptions, endTime: 'invalid' as any };

      await expect(service.getMaxConcurrent(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for time range exceeding 3 months', async () => {
      // 4 months in milliseconds
      const fourMonths = 4 * 30 * 24 * 60 * 60 * 1000;
      const invalidOptions = {
        ...validOptions,
        startTime: 1704067200000, // Jan 1, 2024
        endTime: 1704067200000 + fourMonths, // May 1, 2024
      };

      await expect(service.getMaxConcurrent(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // getRegionDistribution Tests (Story 10.3)
  // ============================================

  describe('getRegionDistribution', () => {
    const validOptions: StatisticsAudienceRegionOptions = {
      channelId: '3151318',
      startTime: 1651386101000,
      endTime: 1652336501462,
    };

    it('should return region distribution successfully', async () => {
      const mockResponse = {
        data: [
          {
            country: null,
            province: '湖南',
            city: null,
            plays: 86,
            viewers: 30,
            ips: 38,
            playDuration: 677,
            percent: 97.73,
          },
          {
            country: null,
            province: '未知',
            city: null,
            plays: 2,
            viewers: 1,
            ips: 1,
            playDuration: 1,
            percent: 2.27,
          },
        ],
      };

      mockSdkClient.statistics.getRegionDistribution.mockResolvedValueOnce(mockResponse);

      const result = await service.getRegionDistribution(validOptions);

      expect(result).toHaveLength(2);
      expect(result[0].region).toBe('湖南');
      expect(result[0].percent).toBe('97.73%');
      expect(result[1].region).toBe('未知');
    });

    it('should return empty array when no data', async () => {
      mockSdkClient.statistics.getRegionDistribution.mockResolvedValueOnce({ data: null });

      const result = await service.getRegionDistribution(validOptions);

      expect(result).toEqual([]);
    });

    it('should pass type parameter to SDK when specified', async () => {
      const optionsWithType = { ...validOptions, type: 'city' as const };
      const mockResponse = { data: [] };

      mockSdkClient.statistics.getRegionDistribution.mockResolvedValueOnce(mockResponse);

      await service.getRegionDistribution(optionsWithType);

      expect(mockSdkClient.statistics.getRegionDistribution).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'city' })
      );
    });

    it('should not pass type parameter when not specified', async () => {
      const mockResponse = { data: [] };

      mockSdkClient.statistics.getRegionDistribution.mockResolvedValueOnce(mockResponse);

      await service.getRegionDistribution(validOptions);

      const callArgs = mockSdkClient.statistics.getRegionDistribution.mock.calls[0][0];
      expect(callArgs).not.toHaveProperty('type');
    });

    it('should throw PolyVValidationError for invalid channelId', async () => {
      const invalidOptions = { ...validOptions, channelId: '' };

      await expect(service.getRegionDistribution(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid startTime', async () => {
      const invalidOptions = { ...validOptions, startTime: -1 };

      await expect(service.getRegionDistribution(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid endTime', async () => {
      const invalidOptions = { ...validOptions, endTime: 0 };

      await expect(service.getRegionDistribution(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid type', async () => {
      const invalidOptions = { ...validOptions, type: 'invalid' as any };

      await expect(service.getRegionDistribution(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for time range exceeding 90 days', async () => {
      // 100 days in milliseconds
      const hundredDays = 100 * 24 * 60 * 60 * 1000;
      const invalidOptions = {
        ...validOptions,
        startTime: 1651386101000,
        endTime: 1651386101000 + hundredDays,
      };

      await expect(service.getRegionDistribution(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // getDeviceDistribution Tests (Story 10.3)
  // ============================================

  describe('getDeviceDistribution', () => {
    const validOptions: StatisticsAudienceDeviceOptions = {
      channelId: '3151318',
      startTime: 1651386101000,
      endTime: 1652336501462,
    };

    it('should return device distribution successfully', async () => {
      const mockResponse = {
        data: [
          {
            name: 'Chrome',
            platform: 'pc',
            plays: 101,
            viewers: 11,
            ips: 88,
            playDuration: 586,
            percent: 69.18,
          },
          {
            name: 'weixin',
            platform: 'mobile',
            plays: 29,
            viewers: 13,
            ips: 17,
            playDuration: 49,
            percent: 19.86,
          },
        ],
      };

      mockSdkClient.statistics.getDeviceDistribution.mockResolvedValueOnce(mockResponse);

      const result = await service.getDeviceDistribution(validOptions);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Chrome');
      expect(result[0].ips).toBe(88);
      expect(result[0].percent).toBe('69.18%');
      expect(result[1].name).toBe('weixin');
      expect(result[1].ips).toBe(17);
    });

    it('should return empty array when no data', async () => {
      mockSdkClient.statistics.getDeviceDistribution.mockResolvedValueOnce({ data: null });

      const result = await service.getDeviceDistribution(validOptions);

      expect(result).toEqual([]);
    });

    it('should throw PolyVValidationError for invalid channelId', async () => {
      const invalidOptions = { ...validOptions, channelId: '' };

      await expect(service.getDeviceDistribution(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid startTime', async () => {
      const invalidOptions = { ...validOptions, startTime: -1 };

      await expect(service.getDeviceDistribution(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid endTime', async () => {
      const invalidOptions = { ...validOptions, endTime: 0 };

      await expect(service.getDeviceDistribution(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for time range exceeding 90 days', async () => {
      // 100 days in milliseconds
      const hundredDays = 100 * 24 * 60 * 60 * 1000;
      const invalidOptions = {
        ...validOptions,
        startTime: 1651386101000,
        endTime: 1651386101000 + hundredDays,
      };

      await expect(service.getDeviceDistribution(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // Viewlog Export Tests
  // ============================================

  describe('getViewlog', () => {
    const validViewlogOptions = {
      channelId: '123456',
      startTime: '2024-01-15 00:00:00',
      endTime: '2024-01-15 23:59:59',
    };

    beforeEach(() => {
      mockSdkClient.statistics.getViewlog.mockResolvedValue({
        contents: [
          {
            playId: 'play1',
            param1: 'viewer1',
            param2: 'Viewer One',
            param3: 'live',
            playDuration: 120,
            stayDuration: 90,
            sessionId: 'session1',
            ipAddress: '192.168.1.1',
            province: '广东',
            city: '深圳',
            operatingSystem: 'Windows',
            browser: 'Chrome',
            isMobile: false,
            currentDay: '2024-01-15',
            createdTime: '2024-01-15 10:00:00',
          },
        ],
      });
    });

    it('should return mapped viewlog data', async () => {
      const result = await service.getViewlog(validViewlogOptions);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        playId: 'play1',
        viewerId: 'viewer1',
        viewerName: 'Viewer One',
        watchType: 'live',
        playDuration: 120,
        stayDuration: 90,
        sessionId: 'session1',
        ipAddress: '192.168.1.1',
        region: '广东/深圳',
        operatingSystem: 'Windows',
        browser: 'Chrome',
        isMobile: false,
        date: '2024-01-15',
        createdTime: '2024-01-15 10:00:00',
      });
    });

    it('should pass watchType when specified', async () => {
      await service.getViewlog({ ...validViewlogOptions, watchType: 'vod' });

      expect(mockSdkClient.statistics.getViewlog).toHaveBeenCalledWith(
        expect.objectContaining({ watchType: 'vod' })
      );
    });

    it('should pass page and pageSize when specified', async () => {
      await service.getViewlog({ ...validViewlogOptions, page: 2, pageSize: 50 });

      expect(mockSdkClient.statistics.getViewlog).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, pageSize: 50 })
      );
    });

    it('should return empty array when contents is undefined', async () => {
      mockSdkClient.statistics.getViewlog.mockResolvedValue({});

      const result = await service.getViewlog(validViewlogOptions);
      expect(result).toEqual([]);
    });

    it('should return empty array when contents is empty', async () => {
      mockSdkClient.statistics.getViewlog.mockResolvedValue({ contents: [] });

      const result = await service.getViewlog(validViewlogOptions);
      expect(result).toEqual([]);
    });

    it('should throw PolyVValidationError for missing channelId', async () => {
      await expect(service.getViewlog({ ...validViewlogOptions, channelId: '' }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid startTime format', async () => {
      await expect(service.getViewlog({ ...validViewlogOptions, startTime: '2024-01-15' }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid endTime format', async () => {
      await expect(service.getViewlog({ ...validViewlogOptions, endTime: 'invalid' }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for different months', async () => {
      await expect(service.getViewlog({
        ...validViewlogOptions,
        startTime: '2024-01-15 00:00:00',
        endTime: '2024-02-15 23:59:59',
      })).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid watchType', async () => {
      await expect(service.getViewlog({ ...validViewlogOptions, watchType: 'invalid' as any }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for missing startTime', async () => {
      await expect(service.getViewlog({ ...validViewlogOptions, startTime: '' }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // Session Export Tests
  // ============================================

  describe('exportSessionStats', () => {
    const validSessionOptions = {
      channelId: '123456',
      sessionId: 'session-abc-123',
    };

    beforeEach(() => {
      mockSdkClient.statistics.exportSessionStats.mockResolvedValue({
        downloadUrl: 'https://example.com/download/session-abc-123.xlsx',
      });
    });

    it('should return session export display item', async () => {
      const result = await service.exportSessionStats(validSessionOptions);

      expect(result).toEqual({
        channelId: '123456',
        sessionId: 'session-abc-123',
        downloadUrl: 'https://example.com/download/session-abc-123.xlsx',
        expiresIn: '60天',
      });
    });

    it('should map a bare URL string from the SDK', async () => {
      mockSdkClient.statistics.exportSessionStats.mockResolvedValueOnce(
        'https://example.com/download/session-abc-123.xlsx'
      );

      const result = await service.exportSessionStats(validSessionOptions);

      expect(result.downloadUrl).toBe('https://example.com/download/session-abc-123.xlsx');
    });

    it('should reject successful responses without a download URL', async () => {
      mockSdkClient.statistics.exportSessionStats.mockResolvedValueOnce({});

      await expect(service.exportSessionStats(validSessionOptions))
        .rejects.toThrow('接口未返回下载链接');
    });

    it('should call SDK with correct params', async () => {
      await service.exportSessionStats(validSessionOptions);

      expect(mockSdkClient.statistics.exportSessionStats).toHaveBeenCalledWith({
        channelId: '123456',
        sessionId: 'session-abc-123',
      });
    });

    it('should throw PolyVValidationError for missing channelId', async () => {
      await expect(service.exportSessionStats({ ...validSessionOptions, channelId: '' }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for missing sessionId', async () => {
      await expect(service.exportSessionStats({ ...validSessionOptions, sessionId: '' }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // Line 178: validateDailyView range error
  // ============================================

  describe('viewStatistics date range validation', () => {
    it('should throw PolyVValidationError when date range exceeds max days', async () => {
      mockSdkClient.statistics.getDailyViewStatistics.mockResolvedValue({ contents: [] });
      const options: StatisticsViewOptions = {
        channelId: '123456',
        startDay: '2024-01-01',
        endDay: '2024-04-15',
        output: 'table',
      };

      await expect(service.getDailyViewStatistics(options)).rejects.toThrow(PolyVValidationError);
    });
  });
});
