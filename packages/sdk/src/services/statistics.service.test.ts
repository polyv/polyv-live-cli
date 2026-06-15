/**
 * StatisticsService Acceptance Tests
 *
 * Story 10.1: 观看数据统计命令
 * Story 10.2: 并发数据命令
 * Story 10.3: 观众画像命令
 *
 * Tests for StatisticsService methods covering:
 * - Daily view statistics API (Story 10.1)
 * - Concurrency data API (Story 10.2)
 * - Max concurrent API (Story 10.2)
 * - Region distribution API (Story 10.3)
 * - Device distribution API (Story 10.3)
 *
 * Acceptance Criteria (Story 10.1):
 * - AC1: getDailyViewStatistics returns view metrics (PV, UV, play duration)
 * - AC2: Support date range filtering (startDay, endDay, max 60 days)
 *
 * Acceptance Criteria (Story 10.2):
 * - AC1: getConcurrencyData returns historical concurrency data (date, time, viewers)
 * - AC2: Support date range filtering (startDate, endDate, max 60 days)
 * - AC3: getMaxConcurrent returns maximum historical concurrent viewers
 * - AC4: Support timestamp filtering (startTime, endTime, max 3 months)
 *
 * Acceptance Criteria (Story 10.3):
 * - AC1: getRegionDistribution returns region distribution (province/city/country)
 * - AC2: getDeviceDistribution returns device distribution (PC/mobile)
 * - AC3: Support timestamp filtering (startTime, endTime, max 90 days)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { PolyVClient } from '../client.js'
import { StatisticsService } from './statistics.service.js'
import type {
  GetDailyViewStatisticsParams,
  GetConcurrencyDataParams,
  GetMaxConcurrentParams,
  GetRegionDistributionParams,
  GetDeviceDistributionParams,
} from '../types/statistics.js'
import { PolyVValidationError } from '../errors/polyv-validation-error.js'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(),
    isCancel: vi.fn(),
    isAxiosError: vi.fn(),
  },
}))

// Test fixtures
const testConfig = {
  appId: 'test-app-id',
  appSecret: 'test-app-secret',
}

const mockStatisticsResponse = [
  {
    currentDay: '2024-01-15',
    channelId: '3151318',
    userId: 'test-user-id',
    pcPlayDuration: 500,
    pcVideoView: 100,
    pcUniqueViewer: 50,
    mobilePlayDuration: 300,
    mobileVideoView: 80,
    mobileUniqueViewer: 40,
    createdTime: 1705276800000,
    lastModified: 1705276800000,
  },
  {
    currentDay: '2024-01-16',
    channelId: '3151318',
    userId: 'test-user-id',
    pcPlayDuration: 600,
    pcVideoView: 120,
    pcUniqueViewer: 60,
    mobilePlayDuration: 400,
    mobileVideoView: 100,
    mobileUniqueViewer: 50,
    createdTime: 1705363200000,
    lastModified: 1705363200000,
  },
]

// Story 10.2: Mock concurrency data response
const mockConcurrencyDataResponse = [
  {
    day: '2024-01-15',
    minute: '10:30',
    viewers: 150,
  },
  {
    day: '2024-01-15',
    minute: '10:31',
    viewers: 165,
  },
  {
    day: '2024-01-15',
    minute: '10:32',
    viewers: 180,
  },
]

// Story 10.2: Mock max concurrent response
const mockMaxConcurrentResponse = 180

describe('StatisticsService', () => {
  let mockAxiosInstance: {
    get: ReturnType<typeof vi.fn>
    post: ReturnType<typeof vi.fn>
    put: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
    patch: ReturnType<typeof vi.fn>
    request: ReturnType<typeof vi.fn>
    interceptors: {
      request: { use: ReturnType<typeof vi.fn> }
      response: { use: ReturnType<typeof vi.fn> }
    }
    defaults: {
      baseURL: string
      timeout: number
      headers: Record<string, string>
    }
  }
  let client: PolyVClient
  let statisticsService: StatisticsService

  beforeEach(() => {
    vi.clearAllMocks()

    mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ result: [] }),
      post: vi.fn().mockResolvedValue({}),
      put: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      patch: vi.fn().mockResolvedValue({}),
      request: vi.fn().mockResolvedValue({}),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      defaults: {
        baseURL: 'https://api.polyv.net/live/v3',
        timeout: 30000,
        headers: {},
      },
    }

    ;(axios.create as ReturnType<typeof vi.fn>).mockReturnValue(mockAxiosInstance)
    client = new PolyVClient(testConfig)
    statisticsService = new StatisticsService(client)
  })

  // ============================================
  // AC1: getDailyViewStatistics returns key metrics
  // ============================================

  describe('getDailyViewStatistics (AC1)', () => {
    it('should call API with correct endpoint and parameters', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ result: mockStatisticsResponse })

      const params: GetDailyViewStatisticsParams = {
        channelId: '3151318',
        startDay: '2024-01-15',
        endDay: '2024-01-16',
      }

      await statisticsService.getDailyViewStatistics(params)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/statistics/daily/summary',
        { params }
      )
    })

    it('should return daily view statistics with PC metrics', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockStatisticsResponse)

      const params: GetDailyViewStatisticsParams = {
        channelId: '3151318',
        startDay: '2024-01-15',
        endDay: '2024-01-16',
      }

      const result = await statisticsService.getDailyViewStatistics(params)

      expect(result.contents).toHaveLength(2)
      expect(result.contents[0].pcPlayDuration).toBe(500)
      expect(result.contents[0].pcVideoView).toBe(100)
      expect(result.contents[0].pcUniqueViewer).toBe(50)
    })

    it('should return daily view statistics with mobile metrics', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockStatisticsResponse)

      const params: GetDailyViewStatisticsParams = {
        channelId: '3151318',
        startDay: '2024-01-15',
        endDay: '2024-01-16',
      }

      const result = await statisticsService.getDailyViewStatistics(params)

      expect(result.contents[0].mobilePlayDuration).toBe(300)
      expect(result.contents[0].mobileVideoView).toBe(80)
      expect(result.contents[0].mobileUniqueViewer).toBe(40)
    })

    it('should return empty contents array when no data', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce([])

      const params: GetDailyViewStatisticsParams = {
        channelId: '3151318',
        startDay: '2024-01-01',
        endDay: '2024-01-07',
      }

      const result = await statisticsService.getDailyViewStatistics(params)

      expect(result.contents).toEqual([])
    })
  })

  // ============================================
  // AC2: Date range filtering with validation
  // ============================================

  describe('date range validation (AC2)', () => {
    it('should accept valid date range within 60 days', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ result: [] })

      const params: GetDailyViewStatisticsParams = {
        channelId: '3151318',
        startDay: '2024-01-01',
        endDay: '2024-02-29', // 59 days
      }

      await expect(
        statisticsService.getDailyViewStatistics(params)
      ).resolves.toBeDefined()
    })

    it('should reject date range exceeding 60 days', async () => {
      const params: GetDailyViewStatisticsParams = {
        channelId: '3151318',
        startDay: '2024-01-01',
        endDay: '2024-03-15', // 74 days, exceeds 60
      }

      await expect(
        statisticsService.getDailyViewStatistics(params)
      ).rejects.toThrow('Date range cannot exceed 60 days')
    })

    it('should reject invalid date format for startDay', async () => {
      const params: GetDailyViewStatisticsParams = {
        channelId: '3151318',
        startDay: '2024/01/01', // Wrong format
        endDay: '2024-01-07',
      }

      await expect(
        statisticsService.getDailyViewStatistics(params)
      ).rejects.toThrow('startDay is required and must be in yyyy-MM-dd format')
    })

    it('should reject invalid date format for endDay', async () => {
      const params: GetDailyViewStatisticsParams = {
        channelId: '3151318',
        startDay: '2024-01-01',
        endDay: '01-07-2024', // Wrong format
      }

      await expect(
        statisticsService.getDailyViewStatistics(params)
      ).rejects.toThrow('endDay is required and must be in yyyy-MM-dd format')
    })

    it('should reject invalid date values', async () => {
      const params: GetDailyViewStatisticsParams = {
        channelId: '3151318',
        startDay: '2024-02-30', // Invalid date
        endDay: '2024-03-01',
      }

      await expect(
        statisticsService.getDailyViewStatistics(params)
      ).rejects.toThrow('startDay is required and must be in yyyy-MM-dd format')
    })

    it('should accept exactly 60 days range', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ result: [] })

      const params: GetDailyViewStatisticsParams = {
        channelId: '3151318',
        startDay: '2024-01-01',
        endDay: '2024-03-01', // Exactly 60 days
      }

      await expect(
        statisticsService.getDailyViewStatistics(params)
      ).resolves.toBeDefined()
    })

    it('should reject when startDay is after endDay', async () => {
      const params: GetDailyViewStatisticsParams = {
        channelId: '3151318',
        startDay: '2024-01-15',
        endDay: '2024-01-01', // endDay before startDay
      }

      await expect(
        statisticsService.getDailyViewStatistics(params)
      ).rejects.toThrow('startDay must be before or equal to endDay')
    })
  })

  // ============================================
  // Parameter validation
  // ============================================

  describe('parameter validation', () => {
    it('should reject missing channelId', async () => {
      const params = {
        channelId: '',
        startDay: '2024-01-01',
        endDay: '2024-01-07',
      } as GetDailyViewStatisticsParams

      await expect(
        statisticsService.getDailyViewStatistics(params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should reject missing startDay', async () => {
      const params = {
        channelId: '3151318',
        startDay: '',
        endDay: '2024-01-07',
      } as GetDailyViewStatisticsParams

      await expect(
        statisticsService.getDailyViewStatistics(params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should reject missing endDay', async () => {
      const params = {
        channelId: '3151318',
        startDay: '2024-01-01',
        endDay: '',
      } as GetDailyViewStatisticsParams

      await expect(
        statisticsService.getDailyViewStatistics(params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should reject whitespace-only channelId', async () => {
      const params: GetDailyViewStatisticsParams = {
        channelId: '   ', // Whitespace only
        startDay: '2024-01-01',
        endDay: '2024-01-07',
      }

      await expect(
        statisticsService.getDailyViewStatistics(params)
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // API error handling
  // ============================================

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'))

      const params: GetDailyViewStatisticsParams = {
        channelId: '3151318',
        startDay: '2024-01-01',
        endDay: '2024-01-07',
      }

      await expect(
        statisticsService.getDailyViewStatistics(params)
      ).rejects.toThrow('Network error')
    })
  })

  // ============================================
  // Story 10.2: Concurrency Data API Tests
  // ============================================

  describe('getConcurrencyData (Story 10.2 - AC1)', () => {
    it('should call API with correct endpoint and parameters', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ result: mockConcurrencyDataResponse })

      const params: GetConcurrencyDataParams = {
        channelId: '3151318',
        startDate: '2024-01-15',
        endDate: '2024-01-16',
      }

      await statisticsService.getConcurrencyData(params)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/statistics/concurrence',
        { params }
      )
    })

    it('should return concurrency data with day, minute, and viewers', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockConcurrencyDataResponse)

      const params: GetConcurrencyDataParams = {
        channelId: '3151318',
        startDate: '2024-01-15',
        endDate: '2024-01-16',
      }

      const result = await statisticsService.getConcurrencyData(params)

      expect(result.contents).toHaveLength(3)
      expect(result.contents[0].day).toBe('2024-01-15')
      expect(result.contents[0].minute).toBe('10:30')
      expect(result.contents[0].viewers).toBe(150)
    })

    it('should return empty contents array when no data', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce([])

      const params: GetConcurrencyDataParams = {
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      }

      const result = await statisticsService.getConcurrencyData(params)

      expect(result.contents).toEqual([])
    })
  })

  describe('getConcurrencyData date range validation (Story 10.2 - AC2)', () => {
    it('should accept valid date range within 60 days', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ result: [] })

      const params: GetConcurrencyDataParams = {
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '2024-02-29', // 59 days
      }

      await expect(
        statisticsService.getConcurrencyData(params)
      ).resolves.toBeDefined()
    })

    it('should reject date range exceeding 60 days', async () => {
      const params: GetConcurrencyDataParams = {
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '2024-03-15', // 74 days, exceeds 60
      }

      await expect(
        statisticsService.getConcurrencyData(params)
      ).rejects.toThrow('Date range cannot exceed 60 days')
    })

    it('should reject invalid date format for startDate', async () => {
      const params: GetConcurrencyDataParams = {
        channelId: '3151318',
        startDate: '2024/01/01', // Wrong format
        endDate: '2024-01-07',
      }

      await expect(
        statisticsService.getConcurrencyData(params)
      ).rejects.toThrow('startDate is required and must be in yyyy-MM-dd format')
    })

    it('should reject invalid date format for endDate', async () => {
      const params: GetConcurrencyDataParams = {
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '01-07-2024', // Wrong format
      }

      await expect(
        statisticsService.getConcurrencyData(params)
      ).rejects.toThrow('endDate is required and must be in yyyy-MM-dd format')
    })

    it('should accept exactly 60 days range', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ result: [] })

      const params: GetConcurrencyDataParams = {
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '2024-03-01', // Exactly 60 days
      }

      await expect(
        statisticsService.getConcurrencyData(params)
      ).resolves.toBeDefined()
    })

    it('should reject when startDate is after endDate', async () => {
      const params: GetConcurrencyDataParams = {
        channelId: '3151318',
        startDate: '2024-01-15',
        endDate: '2024-01-01', // endDate before startDate
      }

      await expect(
        statisticsService.getConcurrencyData(params)
      ).rejects.toThrow('startDate must be before or equal to endDate')
    })
  })

  describe('getConcurrencyData parameter validation', () => {
    it('should reject missing channelId', async () => {
      const params = {
        channelId: '',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      } as GetConcurrencyDataParams

      await expect(
        statisticsService.getConcurrencyData(params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should reject missing startDate', async () => {
      const params = {
        channelId: '3151318',
        startDate: '',
        endDate: '2024-01-07',
      } as GetConcurrencyDataParams

      await expect(
        statisticsService.getConcurrencyData(params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should reject missing endDate', async () => {
      const params = {
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '',
      } as GetConcurrencyDataParams

      await expect(
        statisticsService.getConcurrencyData(params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should reject whitespace-only channelId', async () => {
      const params: GetConcurrencyDataParams = {
        channelId: '   ', // Whitespace only
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      }

      await expect(
        statisticsService.getConcurrencyData(params)
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // Story 10.2: Max Concurrent API Tests
  // ============================================

  describe('getMaxConcurrent (Story 10.2 - AC3)', () => {
    it('should call API with correct endpoint and parameters', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ result: mockMaxConcurrentResponse })

      const params: GetMaxConcurrentParams = {
        channelId: '3151318',
        startTime: 1704067200000, // 2024-01-01 00:00:00
        endTime: 1704153600000, // 2024-01-02 00:00:00
      }

      await statisticsService.getMaxConcurrent(params)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/statistics/get-max-history-concurrent',
        { params }
      )
    })

    it('should return max concurrent viewers as number', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockMaxConcurrentResponse)

      const params: GetMaxConcurrentParams = {
        channelId: '3151318',
        startTime: 1704067200000, // 2024-01-01
        endTime: 1709251200000, // 2024-03-01 (59 days, within 3 months)
      }

      const result = await statisticsService.getMaxConcurrent(params)

      expect(result.contents).toBe(180)
      expect(typeof result.contents).toBe('number')
    })

    it('should return 0 when no data in range', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(0)

      const params: GetMaxConcurrentParams = {
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: 1704153600000,
      }

      const result = await statisticsService.getMaxConcurrent(params)

      expect(result.contents).toBe(0)
    })
  })

  describe('getMaxConcurrent timestamp range validation (Story 10.2 - AC4)', () => {
    it('should accept valid timestamp range within 3 months', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ result: 100 })

      const params: GetMaxConcurrentParams = {
        channelId: '3151318',
        startTime: 1704067200000, // 2024-01-01
        endTime: 1709251200000, // 2024-03-01 (59 days)
      }

      await expect(
        statisticsService.getMaxConcurrent(params)
      ).resolves.toBeDefined()
    })

    it('should reject timestamp range exceeding 3 months', async () => {
      const params: GetMaxConcurrentParams = {
        channelId: '3151318',
        startTime: 1704067200000, // 2024-01-01
        endTime: 1719792000000, // 2024-07-01 (6 months)
      }

      await expect(
        statisticsService.getMaxConcurrent(params)
      ).rejects.toThrow('Time range cannot exceed 3 months')
    })

    it('should accept exactly 3 months range (92 days)', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ result: 100 })

      const params: GetMaxConcurrentParams = {
        channelId: '3151318',
        startTime: 1704067200000, // 2024-01-01
        endTime: 1711929600000, // 2024-04-01 (91 days, within 3 months)
      }

      await expect(
        statisticsService.getMaxConcurrent(params)
      ).resolves.toBeDefined()
    })

    it('should reject when startTime is after endTime', async () => {
      const params: GetMaxConcurrentParams = {
        channelId: '3151318',
        startTime: 1704153600000, // Later
        endTime: 1704067200000, // Earlier
      }

      await expect(
        statisticsService.getMaxConcurrent(params)
      ).rejects.toThrow('startTime must be before or equal to endTime')
    })

    it('should reject invalid startTime format', async () => {
      const params = {
        channelId: '3151318',
        startTime: 'not-a-timestamp',
        endTime: 1704153600000,
      } as unknown as GetMaxConcurrentParams

      await expect(
        statisticsService.getMaxConcurrent(params)
      ).rejects.toThrow('startTime is required and must be a valid timestamp')
    })

    it('should reject invalid endTime format', async () => {
      const params = {
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: 'not-a-timestamp',
      } as unknown as GetMaxConcurrentParams

      await expect(
        statisticsService.getMaxConcurrent(params)
      ).rejects.toThrow('endTime is required and must be a valid timestamp')
    })
  })

  describe('getMaxConcurrent parameter validation', () => {
    it('should reject missing channelId', async () => {
      const params = {
        channelId: '',
        startTime: 1704067200000,
        endTime: 1704153600000,
      } as GetMaxConcurrentParams

      await expect(
        statisticsService.getMaxConcurrent(params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should reject missing startTime', async () => {
      const params = {
        channelId: '3151318',
        startTime: undefined,
        endTime: 1704153600000,
      } as unknown as GetMaxConcurrentParams

      await expect(
        statisticsService.getMaxConcurrent(params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should reject missing endTime', async () => {
      const params = {
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: undefined,
      } as unknown as GetMaxConcurrentParams

      await expect(
        statisticsService.getMaxConcurrent(params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should reject whitespace-only channelId', async () => {
      const params: GetMaxConcurrentParams = {
        channelId: '   ', // Whitespace only
        startTime: 1704067200000,
        endTime: 1704153600000,
      }

      await expect(
        statisticsService.getMaxConcurrent(params)
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // Story 10.2: Error handling
  // ============================================

  describe('getConcurrencyData error handling', () => {
    it('should handle network errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'))

      const params: GetConcurrencyDataParams = {
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      }

      await expect(
        statisticsService.getConcurrencyData(params)
      ).rejects.toThrow('Network error')
    })
  })

  describe('getMaxConcurrent error handling', () => {
    it('should handle network errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'))

      const params: GetMaxConcurrentParams = {
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: 1704153600000,
      }

      await expect(
        statisticsService.getMaxConcurrent(params)
      ).rejects.toThrow('Network error')
    })
  })

  // ============================================
  // Story 10.3: Region Distribution API Tests
  // ============================================

  // Mock region distribution response
  const mockRegionDistributionResponse = [
    {
      ips: 38,
      playDuration: 677,
      plays: 86,
      viewers: 30,
      country: null,
      province: '湖南',
      city: null,
      percent: 97.73,
    },
    {
      ips: 1,
      playDuration: 1,
      plays: 2,
      viewers: 1,
      country: null,
      province: '未知',
      city: null,
      percent: 2.27,
    },
  ]

  // Mock device distribution response
  const mockDeviceDistributionResponse = [
    {
      name: 'Chrome',
      platform: 'pc',
      plays: 101,
      viewers: 11,
      ips: 28,
      playDuration: 586,
      percent: 69.18,
    },
    {
      name: 'weixin',
      platform: 'mobile',
      plays: 29,
      viewers: 13,
      ips: 10,
      playDuration: 49,
      percent: 19.86,
    },
  ]

  describe('getRegionDistribution (Story 10.3 - AC1)', () => {
    it('should call API with correct endpoint and parameters', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockRegionDistributionResponse })

      const params: GetRegionDistributionParams = {
        channelId: '3151318',
        startTime: 1648742400000,
        endTime: 1651334399000,
      }

      await statisticsService.getRegionDistribution(params)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v4/channel/statistics/geo-summary-mc',
        { params }
      )
    })

    it('should call API with type parameter when specified', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockRegionDistributionResponse })

      const params: GetRegionDistributionParams = {
        channelId: '3151318',
        startTime: 1648742400000,
        endTime: 1651334399000,
        type: 'city',
      }

      await statisticsService.getRegionDistribution(params)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v4/channel/statistics/geo-summary-mc',
        { params: expect.objectContaining({ type: 'city' }) }
      )
    })

    it('should return region distribution with plays, viewers, and percent', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockRegionDistributionResponse })

      const params: GetRegionDistributionParams = {
        channelId: '3151318',
        startTime: 1648742400000,
        endTime: 1651334399000,
        type: 'province',
      }

      const result = await statisticsService.getRegionDistribution(params)

      expect(result.data).toHaveLength(2)
      expect(result.data[0].province).toBe('湖南')
      expect(result.data[0].plays).toBe(86)
      expect(result.data[0].viewers).toBe(30)
      expect(result.data[0].percent).toBe(97.73)
    })

    it('should return city distribution when type is city', async () => {
      const mockCityResponse = [
        {
          ips: 20,
          playDuration: 300,
          plays: 50,
          viewers: 15,
          country: null,
          province: '湖南',
          city: '长沙',
          percent: 50.0,
        },
      ]
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockCityResponse })

      const params: GetRegionDistributionParams = {
        channelId: '3151318',
        startTime: 1648742400000,
        endTime: 1651334399000,
        type: 'city',
      }

      const result = await statisticsService.getRegionDistribution(params)

      expect(result.data[0].city).toBe('长沙')
    })

    it('should return country distribution when type is country', async () => {
      const mockCountryResponse = [
        {
          ips: 38,
          playDuration: 677,
          plays: 86,
          viewers: 30,
          country: '中国',
          province: null,
          city: null,
          percent: 100.0,
        },
      ]
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockCountryResponse })

      const params: GetRegionDistributionParams = {
        channelId: '3151318',
        startTime: 1648742400000,
        endTime: 1651334399000,
        type: 'country',
      }

      const result = await statisticsService.getRegionDistribution(params)

      expect(result.data[0].country).toBe('中国')
    })

    it('should return empty data array when no data', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] })

      const params: GetRegionDistributionParams = {
        channelId: '3151318',
        startTime: 1648742400000,
        endTime: 1651334399000,
      }

      const result = await statisticsService.getRegionDistribution(params)

      expect(result.data).toEqual([])
    })
  })

  describe('getRegionDistribution timestamp range validation (Story 10.3 - AC3)', () => {
    it('should accept valid timestamp range within 90 days', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] })

      const params: GetRegionDistributionParams = {
        channelId: '3151318',
        startTime: 1704067200000, // 2024-01-01
        endTime: 1709251200000, // 2024-03-01 (59 days)
      }

      await expect(
        statisticsService.getRegionDistribution(params)
      ).resolves.toBeDefined()
    })

    it('should accept exactly 90 days range', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] })

      // 90 days = 90 * 24 * 60 * 60 * 1000 = 7776000000 ms
      const params: GetRegionDistributionParams = {
        channelId: '3151318',
        startTime: 1704067200000, // 2024-01-01
        endTime: 1704067200000 + 7776000000, // 90 days later
      }

      await expect(
        statisticsService.getRegionDistribution(params)
      ).resolves.toBeDefined()
    })

    it('should reject timestamp range exceeding 90 days', async () => {
      const params: GetRegionDistributionParams = {
        channelId: '3151318',
        startTime: 1704067200000, // 2024-01-01
        endTime: 1711929600000, // 2024-04-01 (91 days)
      }

      await expect(
        statisticsService.getRegionDistribution(params)
      ).rejects.toThrow('Time range cannot exceed 90 days')
    })

    it('should reject when startTime is after endTime', async () => {
      const params: GetRegionDistributionParams = {
        channelId: '3151318',
        startTime: 1704153600000, // Later
        endTime: 1704067200000, // Earlier
      }

      await expect(
        statisticsService.getRegionDistribution(params)
      ).rejects.toThrow('startTime must be before or equal to endTime')
    })

    it('should reject invalid startTime format', async () => {
      const params = {
        channelId: '3151318',
        startTime: 'not-a-timestamp',
        endTime: 1704153600000,
      } as unknown as GetRegionDistributionParams

      await expect(
        statisticsService.getRegionDistribution(params)
      ).rejects.toThrow('startTime is required and must be a valid timestamp')
    })

    it('should reject invalid endTime format', async () => {
      const params = {
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: 'not-a-timestamp',
      } as unknown as GetRegionDistributionParams

      await expect(
        statisticsService.getRegionDistribution(params)
      ).rejects.toThrow('endTime is required and must be a valid timestamp')
    })
  })

  describe('getRegionDistribution type parameter validation', () => {
    it('should accept "province" type (default)', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] })

      const params: GetRegionDistributionParams = {
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: 1709251200000,
        type: 'province',
      }

      await expect(
        statisticsService.getRegionDistribution(params)
      ).resolves.toBeDefined()
    })

    it('should accept "city" type', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] })

      const params: GetRegionDistributionParams = {
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: 1709251200000,
        type: 'city',
      }

      await expect(
        statisticsService.getRegionDistribution(params)
      ).resolves.toBeDefined()
    })

    it('should accept "country" type', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] })

      const params: GetRegionDistributionParams = {
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: 1709251200000,
        type: 'country',
      }

      await expect(
        statisticsService.getRegionDistribution(params)
      ).resolves.toBeDefined()
    })

    it('should reject invalid type value', async () => {
      const params = {
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: 1709251200000,
        type: 'invalid',
      } as unknown as GetRegionDistributionParams

      await expect(
        statisticsService.getRegionDistribution(params)
      ).rejects.toThrow('Type must be one of: country, province, city')
    })
  })

  describe('getRegionDistribution parameter validation', () => {
    it('should reject missing channelId', async () => {
      const params = {
        channelId: '',
        startTime: 1704067200000,
        endTime: 1704153600000,
      } as GetRegionDistributionParams

      await expect(
        statisticsService.getRegionDistribution(params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should reject missing startTime', async () => {
      const params = {
        channelId: '3151318',
        startTime: undefined,
        endTime: 1704153600000,
      } as unknown as GetRegionDistributionParams

      await expect(
        statisticsService.getRegionDistribution(params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should reject missing endTime', async () => {
      const params = {
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: undefined,
      } as unknown as GetRegionDistributionParams

      await expect(
        statisticsService.getRegionDistribution(params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should reject whitespace-only channelId', async () => {
      const params: GetRegionDistributionParams = {
        channelId: '   ',
        startTime: 1704067200000,
        endTime: 1704153600000,
      }

      await expect(
        statisticsService.getRegionDistribution(params)
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // Story 10.3: Device Distribution API Tests
  // ============================================

  describe('getDeviceDistribution (Story 10.3 - AC2)', () => {
    it('should call API with correct endpoint and parameters', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockDeviceDistributionResponse })

      const params: GetDeviceDistributionParams = {
        channelId: '3151318',
        startTime: 1651386101000,
        endTime: 1652336501462,
      }

      await statisticsService.getDeviceDistribution(params)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v4/channel/statistics/browser-summary',
        { params }
      )
    })

    it('should return device distribution with name, platform, plays, viewers, and percent', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockDeviceDistributionResponse })

      const params: GetDeviceDistributionParams = {
        channelId: '3151318',
        startTime: 1651386101000,
        endTime: 1652336501462,
      }

      const result = await statisticsService.getDeviceDistribution(params)

      expect(result.data).toHaveLength(2)
      expect(result.data[0].name).toBe('Chrome')
      expect(result.data[0].platform).toBe('pc')
      expect(result.data[0].plays).toBe(101)
      expect(result.data[0].viewers).toBe(11)
      expect(result.data[0].percent).toBe(69.18)
    })

    it('should return device distribution with mobile platform data', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockDeviceDistributionResponse })

      const params: GetDeviceDistributionParams = {
        channelId: '3151318',
        startTime: 1651386101000,
        endTime: 1652336501462,
      }

      const result = await statisticsService.getDeviceDistribution(params)

      expect(result.data[1].name).toBe('weixin')
      expect(result.data[1].platform).toBe('mobile')
      expect(result.data[1].plays).toBe(29)
    })

    it('should return empty data array when no data', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] })

      const params: GetDeviceDistributionParams = {
        channelId: '3151318',
        startTime: 1651386101000,
        endTime: 1652336501462,
      }

      const result = await statisticsService.getDeviceDistribution(params)

      expect(result.data).toEqual([])
    })
  })

  describe('getDeviceDistribution timestamp range validation (Story 10.3 - AC3)', () => {
    it('should accept valid timestamp range within 90 days', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] })

      const params: GetDeviceDistributionParams = {
        channelId: '3151318',
        startTime: 1704067200000, // 2024-01-01
        endTime: 1709251200000, // 2024-03-01 (59 days)
      }

      await expect(
        statisticsService.getDeviceDistribution(params)
      ).resolves.toBeDefined()
    })

    it('should accept exactly 90 days range', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] })

      // 90 days = 90 * 24 * 60 * 60 * 1000 = 7776000000 ms
      const params: GetDeviceDistributionParams = {
        channelId: '3151318',
        startTime: 1704067200000, // 2024-01-01
        endTime: 1704067200000 + 7776000000, // 90 days later
      }

      await expect(
        statisticsService.getDeviceDistribution(params)
      ).resolves.toBeDefined()
    })

    it('should reject timestamp range exceeding 90 days', async () => {
      const params: GetDeviceDistributionParams = {
        channelId: '3151318',
        startTime: 1704067200000, // 2024-01-01
        endTime: 1711929600000, // 2024-04-01 (91 days)
      }

      await expect(
        statisticsService.getDeviceDistribution(params)
      ).rejects.toThrow('Time range cannot exceed 90 days')
    })

    it('should reject when startTime is after endTime', async () => {
      const params: GetDeviceDistributionParams = {
        channelId: '3151318',
        startTime: 1704153600000, // Later
        endTime: 1704067200000, // Earlier
      }

      await expect(
        statisticsService.getDeviceDistribution(params)
      ).rejects.toThrow('startTime must be before or equal to endTime')
    })

    it('should reject invalid startTime format', async () => {
      const params = {
        channelId: '3151318',
        startTime: 'not-a-timestamp',
        endTime: 1704153600000,
      } as unknown as GetDeviceDistributionParams

      await expect(
        statisticsService.getDeviceDistribution(params)
      ).rejects.toThrow('startTime is required and must be a valid timestamp')
    })

    it('should reject invalid endTime format', async () => {
      const params = {
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: 'not-a-timestamp',
      } as unknown as GetDeviceDistributionParams

      await expect(
        statisticsService.getDeviceDistribution(params)
      ).rejects.toThrow('endTime is required and must be a valid timestamp')
    })
  })

  describe('getDeviceDistribution parameter validation', () => {
    it('should reject missing channelId', async () => {
      const params = {
        channelId: '',
        startTime: 1704067200000,
        endTime: 1704153600000,
      } as GetDeviceDistributionParams

      await expect(
        statisticsService.getDeviceDistribution(params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should reject missing startTime', async () => {
      const params = {
        channelId: '3151318',
        startTime: undefined,
        endTime: 1704153600000,
      } as unknown as GetDeviceDistributionParams

      await expect(
        statisticsService.getDeviceDistribution(params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should reject missing endTime', async () => {
      const params = {
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: undefined,
      } as unknown as GetDeviceDistributionParams

      await expect(
        statisticsService.getDeviceDistribution(params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should reject whitespace-only channelId', async () => {
      const params: GetDeviceDistributionParams = {
        channelId: '   ',
        startTime: 1704067200000,
        endTime: 1704153600000,
      }

      await expect(
        statisticsService.getDeviceDistribution(params)
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // Story 10.3: Error handling
  // ============================================

  describe('getRegionDistribution error handling', () => {
    it('should handle network errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'))

      const params: GetRegionDistributionParams = {
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: 1704153600000,
      }

      await expect(
        statisticsService.getRegionDistribution(params)
      ).rejects.toThrow('Network error')
    })
  })

  describe('getDeviceDistribution error handling', () => {
    it('should handle network errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'))

      const params: GetDeviceDistributionParams = {
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: 1704153600000,
      }

      await expect(
        statisticsService.getDeviceDistribution(params)
      ).rejects.toThrow('Network error')
    })
  })
})
