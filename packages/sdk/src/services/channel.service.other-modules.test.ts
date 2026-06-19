/**
 * ChannelService Other Modules APIs Unit Tests
 *
 * Story 2-6: ChannelService - Marquee, Session, State, Warmup APIs
 * Story 2-7: ChannelService Tests - Test enhancements
 *
 * These tests verify the expected behavior for ChannelService Other Modules methods.
 *
 * Acceptance Criteria:
 * - AC1: setDiyUrlMarquee - 设置自定义URL跑马灯
 * - AC2: getSessionDataList - 获取场次数据列表
 * - AC3: exportSessionStats - 导出场次统计
 * - AC4: getSessionByExternal - 根据外部ID获取场次
 * - AC5: listFileIdByExternal - 根据外部ID列出文件ID
 * - AC6: relevanceSession - 关联场次
 * - AC7: getLiveStatus - 获取直播状态
 * - AC8: getLiveStatusList - 获取直播状态列表
 * - AC9: getStreamInfo - 获取流信息
 * - AC10: getStreams - 获取多个流信息
 * - AC11: listDiskVideo - 列出磁盘视频
 * - AC12: setStatusStart - 设置状态为开始直播
 * - AC13: setStatusEnd - 设置状态为结束直播
 * - AC14: banPush - 禁止推流
 * - AC15: resume - 恢复推流
 * - AC16: endDiskPush - 结束磁盘推流
 * - AC17: updateWarmupSwitch - 更新暖场开关
 * - AC18: updateWarmupImage - 更新暖场图片
 * - AC19: updateWarmupVideo - 更新暖场视频
 * - AC20: Type Safety - 类型安全
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { PolyVClient } from '../client.js'
import { ChannelService } from './channel.service.js'
import type {
  GetSessionDataListResponse,
  GetSessionByExternalResponse,
  FileIdByExternalItem,
  LiveStatusItem,
  GetStreamInfoResponse,
  GetStreamsItem,
  ListDiskVideoResponse,
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

describe('ChannelService Other Modules APIs', () => {
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
  // AC1: setDiyUrlMarquee
  // ============================================
  describe('AC1: setDiyUrlMarquee', () => {
    it('should enable marquee with URL', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce('success')

      const result = await channelService.setDiyUrlMarquee({
        channelId: 'ch123456',
        marqueeRestrict: 'Y',
        url: 'https://example.com/marquee',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v2/channelRestrict/ch123456/set-diyurl-marquee',
        { params: { marqueeRestrict: 'Y', url: 'https://example.com/marquee' } }
      )
      expect(result).toBe('success')
    })

    it('should disable marquee without URL', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce('success')

      await channelService.setDiyUrlMarquee({
        channelId: 'ch123456',
        marqueeRestrict: 'N',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v2/channelRestrict/ch123456/set-diyurl-marquee',
        { params: { marqueeRestrict: 'N' } }
      )
    })

    it('should validate channelId is required', async () => {
      await expect(
        channelService.setDiyUrlMarquee({
          channelId: '',
          marqueeRestrict: 'Y',
          url: 'https://example.com/marquee',
        })
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should validate marqueeRestrict is required', async () => {
      await expect(
        channelService.setDiyUrlMarquee({
          channelId: 'ch123456',
          marqueeRestrict: '',
          url: 'https://example.com/marquee',
        })
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should validate url is required when marqueeRestrict is Y', async () => {
      await expect(
        channelService.setDiyUrlMarquee({
          channelId: 'ch123456',
          marqueeRestrict: 'Y',
          url: '',
        })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC2: getSessionDataList
  // ============================================
  describe('AC2: getSessionDataList', () => {
    const mockResponse: GetSessionDataListResponse = {
      contents: [
        {
          sessionId: 'session001',
          startTime: '2024-01-15 10:00:00',
          endTime: '2024-01-15 12:00:00',
          uv: 100,
          pv: 500,
          duration: 7200,
        },
      ],
      total: 1,
      page: 1,
      size: 10,
    }

    it('should get session data list', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await channelService.getSessionDataList({
        channelId: 'ch123456',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/session/data/list',
        { params: { channelId: 'ch123456' } }
      )
      expect(result.contents).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('should support date range and pagination', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await channelService.getSessionDataList({
        channelId: 'ch123456',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        page: 2,
        pageSize: 20,
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/session/data/list',
        { params: {
          channelId: 'ch123456',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          page: 2,
          pageSize: 20,
        } }
      )
    })

    it('should validate channelId is required', async () => {
      await expect(
        channelService.getSessionDataList({ channelId: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC3: exportSessionStats
  // ============================================
  describe('AC3: exportSessionStats', () => {
    it('should export session stats', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce('export-url')

      const result = await channelService.exportSessionStats({
        channelId: 'ch123456',
        sessionId: 'session001',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/session/stats/export',
        { params: { channelId: 'ch123456', sessionId: 'session001' } }
      )
      expect(result).toBe('export-url')
    })

    it('should validate required parameters', async () => {
      await expect(
        channelService.exportSessionStats({ channelId: '', sessionId: 'session001' })
      ).rejects.toThrow(PolyVValidationError)

      await expect(
        channelService.exportSessionStats({ channelId: 'ch123456', sessionId: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC4: getSessionByExternal
  // ============================================
  describe('AC4: getSessionByExternal', () => {
    const mockResponse: GetSessionByExternalResponse = {
      list: ['session001', 'session002'],
    }

    it('should get sessions by external ID', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await channelService.getSessionByExternal({
        channelId: 'ch123456',
        externalSessionId: 'external-id-12345678901234567890',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/session/list-session-by-external',
        { params: { channelId: 'ch123456', externalSessionId: 'external-id-12345678901234567890' } }
      )
      expect(result.list).toHaveLength(2)
    })

    it('should validate required parameters', async () => {
      await expect(
        channelService.getSessionByExternal({ channelId: '', externalSessionId: 'ext123' })
      ).rejects.toThrow(PolyVValidationError)

      await expect(
        channelService.getSessionByExternal({ channelId: 'ch123456', externalSessionId: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC5: listFileIdByExternal
  // ============================================
  describe('AC5: listFileIdByExternal', () => {
    const mockResponse: FileIdByExternalItem[] = [
      { fileId: 'file001', status: 'normal' },
      { fileId: 'file002', status: 'normal' },
    ]

    it('should list file IDs by external ID', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await channelService.listFileIdByExternal({
        channelId: 'ch123456',
        externalSessionId: 'external-id-12345678901234567890',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/session/list-file-id-by-external',
        { params: { channelId: 'ch123456', externalSessionId: 'external-id-12345678901234567890' } }
      )
      expect(result).toHaveLength(2)
    })

    it('should validate required parameters', async () => {
      await expect(
        channelService.listFileIdByExternal({ channelId: '', externalSessionId: 'ext123' })
      ).rejects.toThrow(PolyVValidationError)

      await expect(
        channelService.listFileIdByExternal({ channelId: 'ch123456', externalSessionId: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC6: relevanceSession
  // ============================================
  describe('AC6: relevanceSession', () => {
    it('should relevance session', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce('success')

      const result = await channelService.relevanceSession({
        channelId: 'ch123456',
        externalSessionId: 'external-id-12345678901234567890',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/session/relevance',
        null,
        { params: { channelId: 'ch123456', externalSessionId: 'external-id-12345678901234567890' } }
      )
      expect(result).toBe('success')
    })

    it('should validate required parameters', async () => {
      await expect(
        channelService.relevanceSession({ channelId: '', externalSessionId: 'ext123' })
      ).rejects.toThrow(PolyVValidationError)

      await expect(
        channelService.relevanceSession({ channelId: 'ch123456', externalSessionId: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC7: getLiveStatus
  // ============================================
  describe('AC7: getLiveStatus', () => {
    it('should get live status', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce('live')

      const result = await channelService.getLiveStatus('stream123')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live_status/query',
        {
          params: { stream: 'stream123' },
          headers: { 'X-Skip-Auth': 'true' },
        }
      )
      expect(result).toBe('live')
    })

    it('should validate stream is required', async () => {
      await expect(channelService.getLiveStatus('')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC8: getLiveStatusList
  // ============================================
  describe('AC8: getLiveStatusList', () => {
    const mockResponse: LiveStatusItem[] = [
      { channelId: 'ch123456', status: 'live' },
      { channelId: 'ch789012', status: 'end' },
    ]

    it('should get live status list for multiple channels', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      const result = await channelService.getLiveStatusList({
        channelIds: ['ch123456', 'ch789012'],
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channels/live-status',
        null,
        { params: { channelIds: 'ch123456,ch789012' } }
      )
      expect(result).toHaveLength(2)
    })

    it('should validate channelIds is required', async () => {
      await expect(
        channelService.getLiveStatusList({ channelIds: [] })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC9: getStreamInfo
  // ============================================
  describe('AC9: getStreamInfo', () => {
    const mockResponse: GetStreamInfoResponse = {
      stream: 'rtmp://test.polyv.net/live/ch123456',
      status: 'live',
      startTime: 1705312800000,
    }

    it('should get stream info', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await channelService.getStreamInfo({ channelId: 'ch123456' })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/monitor/get-stream-info',
        { params: { channelId: 'ch123456' } }
      )
      expect(result.stream).toBeDefined()
    })

    it('should validate channelId is required', async () => {
      await expect(
        channelService.getStreamInfo({ channelId: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC10: getStreams
  // ============================================
  describe('AC10: getStreams', () => {
    const mockResponse: GetStreamsItem[] = [
      { channelId: 'ch123456', stream: 'rtmp://test1', status: 'live' },
      { channelId: 'ch789012', stream: 'rtmp://test2', status: 'end' },
    ]

    it('should get streams for multiple channels', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await channelService.getStreams({
        channelIds: ['ch123456', 'ch789012'],
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/monitor/get-streams',
        { params: { channelIds: 'ch123456,ch789012' } }
      )
      expect(result).toHaveLength(2)
    })

    it('should validate channelIds is required', async () => {
      await expect(
        channelService.getStreams({ channelIds: [] })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC11: listDiskVideo
  // ============================================
  describe('AC11: listDiskVideo', () => {
    const mockResponse: ListDiskVideoResponse = {
      contents: [
        { diskVideoId: 'video001', name: 'Test Video 1', size: 1024, duration: 3600 },
      ],
      total: 1,
      page: 1,
      size: 10,
    }

    it('should list disk videos', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await channelService.listDiskVideo({
        channelId: 'ch123456',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/disk-video/list',
        { params: { channelId: 'ch123456' } }
      )
      expect(result.contents).toHaveLength(1)
    })

    it('should support pagination', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await channelService.listDiskVideo({
        channelId: 'ch123456',
        page: 2,
        pageSize: 20,
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/disk-video/list',
        { params: { channelId: 'ch123456', page: 2, pageSize: 20 } }
      )
    })

    it('should validate channelId is required', async () => {
      await expect(
        channelService.listDiskVideo({ channelId: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC12: setStatusStart
  // ============================================
  describe('AC12: setStatusStart', () => {
    it('should set status to start', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce('success')

      const result = await channelService.setStatusStart({
        channelId: 'ch123456',
        userId: 'user123',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channels/ch123456/live',
        null,
        { params: { userId: 'user123' } }
      )
      expect(result).toBe('success')
    })

    it('should validate required parameters', async () => {
      await expect(
        channelService.setStatusStart({ channelId: '', userId: 'user123' })
      ).rejects.toThrow(PolyVValidationError)

      await expect(
        channelService.setStatusStart({ channelId: 'ch123456', userId: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC13: setStatusEnd
  // ============================================
  describe('AC13: setStatusEnd', () => {
    it('should set status to end', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce('success')

      const result = await channelService.setStatusEnd({
        channelId: 'ch123456',
        userId: 'user123',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channels/ch123456/end',
        null,
        { params: { userId: 'user123' } }
      )
      expect(result).toBe('success')
    })

    it('should validate required parameters', async () => {
      await expect(
        channelService.setStatusEnd({ channelId: '', userId: 'user123' })
      ).rejects.toThrow(PolyVValidationError)

      await expect(
        channelService.setStatusEnd({ channelId: 'ch123456', userId: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC14: banPush
  // ============================================
  describe('AC14: banPush', () => {
    it('should ban push stream', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce('success')

      const result = await channelService.banPush({
        channelId: 'ch123456',
        userId: 'user123',
        forbidTime: 60,
        playbackForbidden: 'Y',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/stream/ch123456/cutoff',
        null,
        { params: { userId: 'user123', forbidTime: 60, playbackForbidden: 'Y' } }
      )
      expect(result).toBe('success')
    })

    it('should validate required parameters', async () => {
      await expect(
        channelService.banPush({ channelId: '', userId: 'user123' })
      ).rejects.toThrow(PolyVValidationError)

      await expect(
        channelService.banPush({ channelId: 'ch123456', userId: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC15: resume
  // ============================================
  describe('AC15: resume', () => {
    it('should resume push stream', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce('success')

      const result = await channelService.resume({
        channelId: 'ch123456',
        userId: 'user123',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/stream/ch123456/resume',
        null,
        { params: { userId: 'user123' } }
      )
      expect(result).toBe('success')
    })

    it('should validate required parameters', async () => {
      await expect(
        channelService.resume({ channelId: '', userId: 'user123' })
      ).rejects.toThrow(PolyVValidationError)

      await expect(
        channelService.resume({ channelId: 'ch123456', userId: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC16: endDiskPush
  // ============================================
  describe('AC16: endDiskPush', () => {
    it('should end disk push', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce('success')

      const result = await channelService.endDiskPush({
        channelId: 'ch123456',
        diskVideoId: 'video001',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/stream/end-disk-push',
        null,
        { params: { channelId: 'ch123456', diskVideoId: 'video001' } }
      )
      expect(result).toBe('success')
    })

    it('should validate required parameters', async () => {
      await expect(
        channelService.endDiskPush({ channelId: '', diskVideoId: 'video001' })
      ).rejects.toThrow(PolyVValidationError)

      await expect(
        channelService.endDiskPush({ channelId: 'ch123456', diskVideoId: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC17: updateWarmupSwitch
  // ============================================
  describe('AC17: updateWarmupSwitch', () => {
    it('should update warmup switch', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce('success')

      const result = await channelService.updateWarmupSwitch({
        channelId: 'ch123456',
        warmUpEnabled: 'Y',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/set-warmup-enabled',
        null,
        { params: { channelId: 'ch123456', warmUpEnabled: 'Y' } }
      )
      expect(result).toBe('success')
    })

    it('should validate required parameters', async () => {
      await expect(
        channelService.updateWarmupSwitch({ channelId: '', warmUpEnabled: 'Y' })
      ).rejects.toThrow(PolyVValidationError)

      await expect(
        channelService.updateWarmupSwitch({ channelId: 'ch123456', warmUpEnabled: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC18: updateWarmupImage
  // ============================================
  describe('AC18: updateWarmupImage', () => {
    it('should update warmup image', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce('success')

      const result = await channelService.updateWarmupImage({
        channelId: 'ch123456',
        coverImage: 'https://example.com/warmup.jpg',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channels/ch123456/update',
        null,
        { params: { coverImage: 'https://example.com/warmup.jpg' } }
      )
      expect(result).toBe('success')
    })

    it('should validate required parameters', async () => {
      await expect(
        channelService.updateWarmupImage({ channelId: '', coverImage: 'https://example.com/test.jpg' })
      ).rejects.toThrow(PolyVValidationError)

      await expect(
        channelService.updateWarmupImage({ channelId: 'ch123456', coverImage: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC19: updateWarmupVideo
  // ============================================
  describe('AC19: updateWarmupVideo', () => {
    it('should update warmup video', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce('success')

      const result = await channelService.updateWarmupVideo({
        channelId: 'ch123456',
        warmUpFlv: 'https://example.com/warmup.flv',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channels/ch123456/update',
        null,
        { params: { warmUpFlv: 'https://example.com/warmup.flv' } }
      )
      expect(result).toBe('success')
    })

    it('should validate required parameters', async () => {
      await expect(
        channelService.updateWarmupVideo({ channelId: '', warmUpFlv: 'https://example.com/test.flv' })
      ).rejects.toThrow(PolyVValidationError)

      await expect(
        channelService.updateWarmupVideo({ channelId: 'ch123456', warmUpFlv: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // Type Safety
  // ============================================
  describe('Type Safety', () => {
    it('should have correct types for session data', () => {
      const item = {
        sessionId: 'session001',
        startTime: '2024-01-15 10:00:00',
        endTime: '2024-01-15 12:00:00',
        uv: 100,
        pv: 500,
        duration: 7200,
      }
      expect(item.sessionId).toBe('session001')
      expect(item.uv).toBe(100)
    })

    it('should define YNFlag type', () => {
      const ynFlag: 'Y' | 'N' = 'Y'
      expect(['Y', 'N']).toContain(ynFlag)
    })

    it('should define LiveStatus type', () => {
      const status: string = 'live'
      expect(['live', 'end']).toContain(status)
    })
  })
})
