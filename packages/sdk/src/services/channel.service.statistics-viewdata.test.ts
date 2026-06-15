/**
 * ChannelService Statistics + ViewData APIs Unit Tests
 *
 * Story 2-5: ChannelService - Statistics + ViewData APIs
 * Story 2-7: ChannelService Tests - Test enhancements
 *
 * These tests verify the behavior for ChannelService Statistics and ViewData methods.
 *
 * Acceptance Criteria:
 * - AC1: getProductClickStats - 查询产品点击统计
 * - AC2: getProductListStats - 查询产品列表点击统计
 * - AC3: getRedpackStats - 查询红包统计
 * - AC4: getSummary - 获取频道汇总统计
 * - AC5: getDailySummary - 获取每日汇总统计
 * - AC6: getChannelPlaySummary - 获取频道播放汇总统计
 * - AC7: getChannelStatistic - 获取频道统计数据
 * - AC8: getConcurrency - 获取并发数据
 * - AC9: getMaxHistoryConcurrent - 获取历史最大并发数
 * - AC10: getRealtimeViewers - 获取实时观看人数
 * - AC11: getSessionStats - 获取场次统计
 * - AC12: getRealtimeViewersV1 - 获取实时观看人数V1
 * - AC13: getViewlogPage - 分页查询观看日志
 * - AC14: getViewlogV1 - 查询观看日志V1
 * - AC15: getUserViewlog - 查询用户观看日志
 * - AC16: getMicDetailList - 查询连麦详情列表
 * - AC17: getRealviewers - 别名方法
 * - AC18: getViewlog2 - 查询观看日志V2
 * - AC19: getViewlogPageV3 - 分页查询观看日志V3
 * - AC20: Type Safety - 类型安全
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { PolyVClient } from '../client.js'
import { ChannelService } from './channel.service.js'
import type {
  GetProductClickStatsResponse,
  GetProductListStatsResponse,
  GetRedpackStatsResponse,
  ChannelSummaryItem,
  DailySummaryItem,
  ChannelPlaySummaryItem,
  ChannelStatisticData,
  ConcurrencyDataItem,
  SessionStatsResponse,
  GetViewlogPageResponse,
  RealtimeViewerDataItem,
  RealtimeViewerV1Item,
  GetUserViewlogResponse,
  GetMicDetailListResponse,
} from '../types/channel.js'
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

const mockProductClickStatsResponse: GetProductClickStatsResponse = {
  contents: [
    {
      productId: 'prod001',
      productName: 'Test Product',
      clickCount: 100,
      clickUserCount: 50,
    },
  ],
  total: 1,
  pageNumber: 1,
  pageSize: 10,
}

const mockProductListStatsResponse: GetProductListStatsResponse = {
  contents: [
    {
      productId: 'prod001',
      productName: 'Test Product',
      clickCount: 50,
    },
  ],
  total: 1,
  pageNumber: 1,
  pageSize: 10,
}

const mockRedpackStatsResponse: GetRedpackStatsResponse = {
  contents: [
    {
      redpackId: 'rp001',
      totalAmount: 10000,
      totalCount: 100,
      grabCount: 80,
    },
  ],
  total: 1,
  pageNumber: 1,
  pageSize: 10,
}

const mockChannelSummaryItem: ChannelSummaryItem = {
  day: '2024-01-15',
  uv: 1000,
  pv: 5000,
  flowUv: 200,
  keepRatio: 85.5,
}

const mockDailySummaryItem: DailySummaryItem = {
  day: '2024-01-15',
  channelId: 'ch123456',
  uv: 1000,
  pv: 5000,
  totalDuration: 3600000,
  avgDuration: 3600,
}

const mockChannelPlaySummaryItem: ChannelPlaySummaryItem = {
  channelId: 'ch123456',
  name: 'Test Channel',
  uv: 1000,
  pv: 5000,
  totalDuration: 3600000,
}

const mockChannelStatisticData: ChannelStatisticData = {
  channelId: 'ch123456',
  totalUv: 10000,
  totalPv: 50000,
  totalDuration: 36000000,
  avgDuration: 3600,
  maxConcurrent: 500,
}

const mockConcurrencyDataItem: ConcurrencyDataItem = {
  time: 1705312800000,
  count: 150,
}

const mockSessionStatsResponse: SessionStatsResponse = {
  contents: [
    {
      sessionId: 'session001',
      startTime: 1705312800000,
      endTime: 1705316400000,
      uv: 500,
      pv: 2500,
      duration: 3600000,
    },
  ],
  total: 1,
}

const mockViewlogPageResponse: GetViewlogPageResponse = {
  contents: [
    {
      logId: 'log001',
      userId: 'user001',
      userName: 'Test User',
      playDuration: 3600,
    },
  ],
  total: 1,
  pageNumber: 1,
  pageSize: 10,
}

const mockRealtimeViewerDataItem: RealtimeViewerDataItem = {
  channelId: 'ch123456',
  count: 150,
}

const mockRealtimeViewerV1Item: RealtimeViewerV1Item = {
  channelId: 'ch123456',
  userId: 'user123',
  count: 100,
}

const mockUserViewlogResponse: GetUserViewlogResponse = {
  contents: [
    {
      logId: 'log001',
      channelId: 'ch123456',
      playDuration: 3600,
    },
  ],
  total: 1,
}

const mockMicDetailListResponse: GetMicDetailListResponse = {
  contents: [
    {
      sessionId: 'session001',
      micId: 'mic001',
      userId: 'user001',
      userName: 'Test User',
      startTime: 1705312800000,
      endTime: 1705316400000,
    },
  ],
  total: 1,
  page: 1,
  size: 10,
}

describe('ChannelService Statistics + ViewData APIs', () => {
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
  let channelService: ChannelService

  beforeEach(() => {
    vi.clearAllMocks()

    mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({}),
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
    channelService = new ChannelService(client)
  })

  // ============================================
  // AC1: getProductClickStats
  // ============================================
  describe('AC1: getProductClickStats', () => {
    it('should get product click statistics with required parameters', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockProductClickStatsResponse)

      const result = await channelService.getProductClickStats({
        channelId: 'ch123456',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v4/channel/product/click',
        { params: { channelId: 'ch123456' } }
      )
      expect(result.contents).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('should support optional parameters for product click stats', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockProductClickStatsResponse)

      await channelService.getProductClickStats({
        channelId: 'ch123456',
        sessionId: 'session001',
        startTime: 1705312800000,
        endTime: 1705399200000,
        pageNumber: 1,
        pageSize: 20,
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v4/channel/product/click',
        {
          params: {
            channelId: 'ch123456',
            sessionId: 'session001',
            startTime: 1705312800000,
            endTime: 1705399200000,
            pageNumber: 1,
            pageSize: 20,
          },
        }
      )
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.getProductClickStats({ channelId: '' })).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC2: getProductListStats
  // ============================================
  describe('AC2: getProductListStats', () => {
    it('should get product list statistics', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockProductListStatsResponse)

      const result = await channelService.getProductListStats({
        channelId: 'ch123456',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v4/channel/product/click/product-list',
        { params: { channelId: 'ch123456' } }
      )
      expect(result.contents).toHaveLength(1)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.getProductListStats({ channelId: '' })).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC3: getRedpackStats
  // ============================================
  describe('AC3: getRedpackStats', () => {
    it('should get red packet statistics', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockRedpackStatsResponse)

      const result = await channelService.getRedpackStats({
        channelId: 'ch123456',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v4/channel/red-pack/statistics/list',
        { params: { channelId: 'ch123456' } }
      )
      expect(result.contents).toHaveLength(1)
    })

    it('should support optional sessionId parameter', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockRedpackStatsResponse)

      await channelService.getRedpackStats({
        channelId: 'ch123456',
        sessionId: 'session001',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v4/channel/red-pack/statistics/list',
        { params: { channelId: 'ch123456', sessionId: 'session001' } }
      )
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.getRedpackStats({ channelId: '' })).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC4: getSummary
  // ============================================
  describe('AC4: getSummary', () => {
    it('should get channel summary statistics', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce([mockChannelSummaryItem])

      const result = await channelService.getSummary('ch123456', {
        startDay: '2024-01-01',
        endDay: '2024-01-31',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v2/statistics/ch123456/summary',
        { params: { startDay: '2024-01-01', endDay: '2024-01-31' } }
      )
      expect(result).toHaveLength(1)
    })

    it('should validate channelId is required', async () => {
      await expect(
        channelService.getSummary('', { startDay: '2024-01-01', endDay: '2024-01-31' })
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should validate startDay is required', async () => {
      await expect(
        channelService.getSummary('ch123456', { startDay: '', endDay: '2024-01-31' })
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should validate endDay is required', async () => {
      await expect(
        channelService.getSummary('ch123456', { startDay: '2024-01-01', endDay: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC5: getDailySummary
  // ============================================
  describe('AC5: getDailySummary', () => {
    it('should get daily summary statistics', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce([mockDailySummaryItem])

      const result = await channelService.getDailySummary({
        channelId: 'ch123456',
        startDay: '2024-01-01',
        endDay: '2024-01-31',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/statistics/daily/summary',
        {
          params: {
            channelId: 'ch123456',
            startDay: '2024-01-01',
            endDay: '2024-01-31',
          },
        }
      )
      expect(result).toHaveLength(1)
    })

    it('should validate required parameters', async () => {
      await expect(
        channelService.getDailySummary({ channelId: '', startDay: '2024-01-01', endDay: '2024-01-31' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC6: getChannelPlaySummary
  // ============================================
  describe('AC6: getChannelPlaySummary', () => {
    it('should get channel play summary statistics', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce([mockChannelPlaySummaryItem])

      const result = await channelService.getChannelPlaySummary('user123', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/statistics/user123/channel_summary',
        null,
        { params: { startDate: '2024-01-01', endDate: '2024-01-31' } }
      )
      expect(result).toHaveLength(1)
    })

    it('should support optional channelIds parameter', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce([mockChannelPlaySummaryItem])

      await channelService.getChannelPlaySummary('user123', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        channelIds: 'ch123456,ch789012',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/statistics/user123/channel_summary',
        null,
        { params: { startDate: '2024-01-01', endDate: '2024-01-31', channelIds: 'ch123456,ch789012' } }
      )
    })

    it('should validate userId is required', async () => {
      await expect(
        channelService.getChannelPlaySummary('', { startDate: '2024-01-01', endDate: '2024-01-31' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC7: getChannelStatistic
  // ============================================
  describe('AC7: getChannelStatistic', () => {
    it('should get channel statistic data', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockChannelStatisticData)

      const result = await channelService.getChannelStatistic({
        channelId: 'ch123456',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v4/channel/statistics/channel-statistic',
        {
          params: {
            channelId: 'ch123456',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
          },
        }
      )
      expect(result.channelId).toBe('ch123456')
    })

    it('should validate required parameters', async () => {
      await expect(
        channelService.getChannelStatistic({ channelId: '', startDate: '2024-01-01', endDate: '2024-01-31' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC8: getConcurrency
  // ============================================
  describe('AC8: getConcurrency', () => {
    it('should get concurrency data', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce([mockConcurrencyDataItem])

      const result = await channelService.getConcurrency({
        channelId: 'ch123456',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/statistics/concurrence',
        {
          params: {
            channelId: 'ch123456',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
          },
        }
      )
      expect(result).toHaveLength(1)
    })

    it('should validate required parameters', async () => {
      await expect(
        channelService.getConcurrency({ channelId: '', startDate: '2024-01-01', endDate: '2024-01-31' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC9: getMaxHistoryConcurrent
  // ============================================
  describe('AC9: getMaxHistoryConcurrent', () => {
    it('should get max history concurrent viewers', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(500)

      const result = await channelService.getMaxHistoryConcurrent({
        channelId: 'ch123456',
        startTime: 1705312800000,
        endTime: 1705399200000,
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/statistics/get-max-history-concurrent',
        {
          params: {
            channelId: 'ch123456',
            startTime: 1705312800000,
            endTime: 1705399200000,
          },
        }
      )
      expect(result).toBe(500)
    })

    it('should validate channelId is required', async () => {
      await expect(
        channelService.getMaxHistoryConcurrent({
          channelId: '',
          startTime: 1705312800000,
          endTime: 1705399200000,
        })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC10: getRealtimeViewers
  // ============================================
  describe('AC10: getRealtimeViewers', () => {
    it('should get realtime viewers count', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce([mockRealtimeViewerDataItem])

      const result = await channelService.getRealtimeViewers({ channelIds: 'ch123456' })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v2/statistics/get-realtime-viewers',
        { params: { channelIds: 'ch123456' } }
      )
      expect(result).toHaveLength(1)
    })

    it('should validate channelIds is required', async () => {
      await expect(channelService.getRealtimeViewers({ channelIds: '' })).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC11: getSessionStats
  // ============================================
  describe('AC11: getSessionStats', () => {
    it('should get session statistics', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockSessionStatsResponse)

      const result = await channelService.getSessionStats({
        channelId: 'ch123456',
        startTime: 1705312800000,
        endTime: 1705399200000,
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/statistics/get-session-stats',
        {
          params: {
            channelId: 'ch123456',
            startTime: 1705312800000,
            endTime: 1705399200000,
          },
        }
      )
      expect(result.contents).toHaveLength(1)
    })

    it('should validate channelId is required', async () => {
      await expect(
        channelService.getSessionStats({
          channelId: '',
          startTime: 1705312800000,
          endTime: 1705399200000,
        })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC12: getRealtimeViewersV1
  // ============================================
  describe('AC12: getRealtimeViewersV1', () => {
    it('should get realtime viewers v1 count', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce([mockRealtimeViewerV1Item])

      const result = await channelService.getRealtimeViewersV1('ch123456', 'user123')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v1/statistics/ch123456/realtime',
        { params: { userId: 'user123' } }
      )
      expect(result).toHaveLength(1)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.getRealtimeViewersV1('', 'user123')).rejects.toThrow(PolyVValidationError)
    })

    it('should validate userId is required', async () => {
      await expect(channelService.getRealtimeViewersV1('ch123456', '')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC13: getViewlogPage
  // ============================================
  describe('AC13: getViewlogPage', () => {
    it('should get paginated viewlog', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockViewlogPageResponse)

      const result = await channelService.getViewlogPage('ch123456', {
        currentDay: '2024-01-15',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v2/statistics/ch123456/viewlog/page',
        { params: { currentDay: '2024-01-15' } }
      )
      expect(result.contents).toHaveLength(1)
    })

    it('should validate channelId is required', async () => {
      await expect(
        channelService.getViewlogPage('', { currentDay: '2024-01-15' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC14: getViewlogV1
  // ============================================
  describe('AC14: getViewlogV1', () => {
    it('should get viewlog v1', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce([{ logId: 'log001', userId: 'user001' }])

      const result = await channelService.getViewlogV1('ch123456', {
        currentDay: '2024-01-15',
        userId: 'user123',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v1/statistics/ch123456/viewlog',
        { params: { currentDay: '2024-01-15', userId: 'user123' } }
      )
      expect(result).toHaveLength(1)
    })

    it('should validate channelId is required', async () => {
      await expect(
        channelService.getViewlogV1('', { currentDay: '2024-01-15', userId: 'user123' })
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should validate currentDay is required', async () => {
      await expect(
        channelService.getViewlogV1('ch123456', { currentDay: '', userId: 'user123' })
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should validate userId is required', async () => {
      await expect(
        channelService.getViewlogV1('ch123456', { currentDay: '2024-01-15', userId: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC15: getUserViewlog
  // ============================================
  describe('AC15: getUserViewlog', () => {
    it('should get user viewlog', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockUserViewlogResponse)

      const result = await channelService.getUserViewlog({
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-01-31 23:59:59',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/user/statistics/viewlog',
        {
          params: {
            startDate: '2024-01-01 00:00:00',
            endDate: '2024-01-31 23:59:59',
          },
        }
      )
      expect(result.contents).toHaveLength(1)
    })

    it('should validate startDate is required', async () => {
      await expect(
        channelService.getUserViewlog({ startDate: '', endDate: '2024-01-31' })
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should validate endDate is required', async () => {
      await expect(
        channelService.getUserViewlog({ startDate: '2024-01-01', endDate: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC16: getMicDetailList
  // ============================================
  describe('AC16: getMicDetailList', () => {
    it('should get mic detail list', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockMicDetailListResponse)

      const result = await channelService.getMicDetailList({
        channelIds: 'ch123456',
        startDay: '2024-01-01',
        endDay: '2024-01-31',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/statistics/mic/list',
        { params: { channelIds: 'ch123456', startDay: '2024-01-01', endDay: '2024-01-31' } }
      )
      expect(result.contents).toHaveLength(1)
    })
  })

  // ============================================
  // AC17: getRealviewers
  // ============================================
  describe('AC17: getRealviewers', () => {
    it('should get realviewers data', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce([mockChannelSummaryItem])

      const result = await channelService.getRealviewers('ch123456', {
        currentDay: '2024-01-15',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v2/statistics/ch123456/realviewers',
        { params: { currentDay: '2024-01-15' } }
      )
      expect(result).toHaveLength(1)
    })

    it('should validate channelId is required', async () => {
      await expect(
        channelService.getRealviewers('', { currentDay: '2024-01-15' })
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should validate currentDay is required', async () => {
      await expect(
        channelService.getRealviewers('ch123456', { currentDay: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC18: getViewlog2
  // ============================================
  describe('AC18: getViewlog2', () => {
    it('should get viewlog v2', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce([{ logId: 'log001' }])

      const result = await channelService.getViewlog2('ch123456', {
        currentDay: '2024-01-15',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v2/statistics/ch123456/viewlog',
        { params: { currentDay: '2024-01-15' } }
      )
      expect(result).toHaveLength(1)
    })

    it('should validate channelId is required', async () => {
      await expect(
        channelService.getViewlog2('', { currentDay: '2024-01-15' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC19: getViewlogPageV3
  // ============================================
  describe('AC19: getViewlogPageV3', () => {
    it('should get viewlog page v3', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockViewlogPageResponse)

      const result = await channelService.getViewlogPageV3('ch123456', {
        currentDay: '2024-01-15',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/statistics/ch123456/viewlog',
        { params: { currentDay: '2024-01-15' } }
      )
      expect(result.contents).toHaveLength(1)
    })

    it('should validate channelId is required', async () => {
      await expect(
        channelService.getViewlogPageV3('', { currentDay: '2024-01-15' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // Type Safety Tests
  // ============================================
  describe('Type Safety', () => {
    it('should have correct type for GetProductClickStatsResponse', () => {
      const response = mockProductClickStatsResponse
      expect(response.contents).toBeDefined()
      expect(response.total).toBeDefined()
      expect(response.pageNumber).toBeDefined()
      expect(response.pageSize).toBeDefined()
    })

    it('should have correct type for ChannelSummaryItem', () => {
      const item = mockChannelSummaryItem
      expect(item.day).toBeDefined()
      expect(item.uv).toBeDefined()
      expect(item.pv).toBeDefined()
    })

    it('should have correct type for DailySummaryItem', () => {
      const item = mockDailySummaryItem
      expect(item.day).toBeDefined()
      expect(item.channelId).toBeDefined()
      expect(item.uv).toBeDefined()
      expect(item.pv).toBeDefined()
    })

    it('should have correct type for ConcurrencyDataItem', () => {
      const item = mockConcurrencyDataItem
      expect(item.time).toBeDefined()
      expect(item.count).toBeDefined()
    })

    it('should have correct type for GetMicDetailListResponse', () => {
      const response = mockMicDetailListResponse
      expect(response.contents).toBeDefined()
      expect(response.total).toBeDefined()
      expect(response.page).toBeDefined()
      expect(response.size).toBeDefined()
    })
  })
})
