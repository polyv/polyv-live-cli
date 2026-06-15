/**
 * PlayerService Decorate Methods Acceptance Tests
 *
 * Story 10.5: 播放器设置命令
 *
 * Tests for PlayerService methods covering:
 * - getChannelDecorate API (Story 10.5 AC1)
 * - updateChannelDecorate API (Story 10.5 AC2)
 *
 * Acceptance Criteria:
 * - AC1: getChannelDecorate returns player configuration (watermark, warmup, view data)
 * - AC2: updateChannelDecorate updates player configuration
 * - AC6: Validate watermark position values (tl/tr/bl/br)
 * - AC7: Validate watermark opacity range (0-1)
 * - AC4, AC8: Validate Y/N values
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { PolyVClient } from '../client.js'
import { PlayerService } from './player.service.js'
import type {
  ChannelDecorateGetResponse,
  ChannelDecorateUpdateParams,
} from '../types/player.js'
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

// Story 10.5: Mock channel decorate get response
const mockChannelDecorateResponse: ChannelDecorateGetResponse = {
  player: {
    watermarkEnabled: 'Y',
    iconUrl: '//liveimages.videocc.net/uploaded/images/2021/09/g24vjlhywx.png',
    iconPosition: 'br',
    logoOpacity: 1,
    iconLink: '',
    warmUpEnabled: 'Y',
    warmUpImageUrl: 'http://liveimages.videocc.net/uploadimage/20210312/chat_img_1b448be323_16155164629438.jpeg',
    coverJumpUrl: '',
    backgroundUrl: '',
    basePV: 6,
    actualPV: 21,
  },
}

describe('PlayerService - Channel Decorate Methods', () => {
  let client: PolyVClient
  let playerService: PlayerService
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

  beforeEach(() => {
    vi.clearAllMocks()

    // Create mock axios instance with interceptors
    mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ result: {} }),
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

    // Mock axios.create to return our mock instance
    ;(axios.create as ReturnType<typeof vi.fn>).mockReturnValue(mockAxiosInstance)

    // Create client and service
    client = new PolyVClient(testConfig)
    playerService = new PlayerService(client)
  })

  // ============================================================
  // AC1: getChannelDecorate API
  // ============================================================

  describe('getChannelDecorate (AC1)', () => {
    it('should call GET /live/v4/channel/decorate/get with channelId', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockChannelDecorateResponse)

      const result = await playerService.getChannelDecorate(3151318)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v4/channel/decorate/get',
        { params: { channelId: 3151318 } }
      )
      expect(result).toEqual(mockChannelDecorateResponse)
    })

    it('should return player configuration with watermark settings', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockChannelDecorateResponse)

      const result = await playerService.getChannelDecorate(3151318)

      expect(result.player.watermarkEnabled).toBe('Y')
      expect(result.player.iconUrl).toContain('videocc.net')
      expect(result.player.iconPosition).toBe('br')
      expect(result.player.logoOpacity).toBe(1)
    })

    it('should return player configuration with warmup settings', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockChannelDecorateResponse)

      const result = await playerService.getChannelDecorate(3151318)

      expect(result.player.warmUpEnabled).toBe('Y')
      expect(result.player.warmUpImageUrl).toContain('videocc.net')
    })

    it('should return player configuration with view data', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockChannelDecorateResponse)

      const result = await playerService.getChannelDecorate(3151318)

      expect(result.player.basePV).toBe(6)
      expect(result.player.actualPV).toBe(21)
    })

    it('should validate channelId is a number', async () => {
      await expect(
        playerService.getChannelDecorate('invalid' as any)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should throw error when channelId is undefined', async () => {
      await expect(
        playerService.getChannelDecorate(undefined as any)
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================================
  // AC2: updateChannelDecorate API
  // ============================================================

  describe('updateChannelDecorate (AC2)', () => {
    it('should call POST /live/v4/channel/decorate/update with channelId and params', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const params: ChannelDecorateUpdateParams = {
        watermarkEnabled: 'Y',
        iconUrl: 'http://example.com/logo.png',
      }

      const result = await playerService.updateChannelDecorate(3151318, params)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v4/channel/decorate/update',
        { player: params },
        { params: { channelId: 3151318 } }
      )
      expect(result).toBe(true)
    })

    it('should return true on successful update', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const params: ChannelDecorateUpdateParams = {
        watermarkEnabled: 'Y',
      }

      const result = await playerService.updateChannelDecorate(3151318, params)
      expect(result).toBe(true)
    })

    it('should validate channelId is a number for update', async () => {
      const params: ChannelDecorateUpdateParams = {
        watermarkEnabled: 'Y',
      }

      await expect(
        playerService.updateChannelDecorate('invalid' as any, params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should send watermark params correctly', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const params: ChannelDecorateUpdateParams = {
        watermarkEnabled: 'Y',
        iconUrl: 'http://example.com/logo.png',
        iconPosition: 'br',
        logoOpacity: 0.8,
        iconLink: 'http://www.polyv.net',
      }

      await playerService.updateChannelDecorate(3151318, params)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v4/channel/decorate/update',
        { player: params },
        { params: { channelId: 3151318 } }
      )
    })

    it('should send warmup params correctly', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const params: ChannelDecorateUpdateParams = {
        warmUpEnabled: 'Y',
        warmUpImageUrl: 'http://example.com/warmup.jpg',
        coverJumpUrl: 'http://example.com/cover',
        backgroundUrl: 'http://example.com/bg.jpg',
      }

      await playerService.updateChannelDecorate(3151318, params)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v4/channel/decorate/update',
        { player: params },
        { params: { channelId: 3151318 } }
      )
    })

    it('should send basePV param correctly', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const params: ChannelDecorateUpdateParams = {
        basePV: 1000,
      }

      await playerService.updateChannelDecorate(3151318, params)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v4/channel/decorate/update',
        { player: params },
        { params: { channelId: 3151318 } }
      )
    })

    it('should send all params together', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const params: ChannelDecorateUpdateParams = {
        watermarkEnabled: 'Y',
        iconUrl: 'http://example.com/logo.png',
        iconPosition: 'br',
        logoOpacity: 0.8,
        warmUpEnabled: 'N',
        basePV: 1000,
      }

      await playerService.updateChannelDecorate(3151318, params)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v4/channel/decorate/update',
        { player: params },
        { params: { channelId: 3151318 } }
      )
    })
  })

  // ============================================================
  // AC6: Watermark position validation
  // ============================================================

  describe('watermark position validation (AC6)', () => {
    it('should accept "tl" (top-left) position', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const params: ChannelDecorateUpdateParams = {
        iconPosition: 'tl',
      }

      await expect(
        playerService.updateChannelDecorate(3151318, params)
      ).resolves.not.toThrow()
    })

    it('should accept "tr" (top-right) position', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const params: ChannelDecorateUpdateParams = {
        iconPosition: 'tr',
      }

      await expect(
        playerService.updateChannelDecorate(3151318, params)
      ).resolves.not.toThrow()
    })

    it('should accept "bl" (bottom-left) position', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const params: ChannelDecorateUpdateParams = {
        iconPosition: 'bl',
      }

      await expect(
        playerService.updateChannelDecorate(3151318, params)
      ).resolves.not.toThrow()
    })

    it('should accept "br" (bottom-right) position', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const params: ChannelDecorateUpdateParams = {
        iconPosition: 'br',
      }

      await expect(
        playerService.updateChannelDecorate(3151318, params)
      ).resolves.not.toThrow()
    })

    it('should reject invalid position value', async () => {
      const params: ChannelDecorateUpdateParams = {
        iconPosition: 'center' as any,
      }

      await expect(
        playerService.updateChannelDecorate(3151318, params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should reject uppercase position value', async () => {
      const params: ChannelDecorateUpdateParams = {
        iconPosition: 'BR' as any,
      }

      await expect(
        playerService.updateChannelDecorate(3151318, params)
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================================
  // AC7: Watermark opacity validation (0-1)
  // ============================================================

  describe('watermark opacity validation (AC7)', () => {
    it('should accept 0 opacity', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const params: ChannelDecorateUpdateParams = {
        logoOpacity: 0,
      }

      await expect(
        playerService.updateChannelDecorate(3151318, params)
      ).resolves.not.toThrow()
    })

    it('should accept 1 opacity', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const params: ChannelDecorateUpdateParams = {
        logoOpacity: 1,
      }

      await expect(
        playerService.updateChannelDecorate(3151318, params)
      ).resolves.not.toThrow()
    })

    it('should accept 0.5 opacity', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const params: ChannelDecorateUpdateParams = {
        logoOpacity: 0.5,
      }

      await expect(
        playerService.updateChannelDecorate(3151318, params)
      ).resolves.not.toThrow()
    })

    it('should reject negative opacity', async () => {
      const params: ChannelDecorateUpdateParams = {
        logoOpacity: -0.1,
      }

      await expect(
        playerService.updateChannelDecorate(3151318, params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should reject opacity greater than 1', async () => {
      const params: ChannelDecorateUpdateParams = {
        logoOpacity: 1.1,
      }

      await expect(
        playerService.updateChannelDecorate(3151318, params)
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================================
  // AC4, AC8: Y/N value validation
  // ============================================================

  describe('Y/N value validation (AC4, AC8)', () => {
    it('should accept "Y" for watermarkEnabled', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const params: ChannelDecorateUpdateParams = {
        watermarkEnabled: 'Y',
      }

      await expect(
        playerService.updateChannelDecorate(3151318, params)
      ).resolves.not.toThrow()
    })

    it('should accept "N" for watermarkEnabled', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const params: ChannelDecorateUpdateParams = {
        watermarkEnabled: 'N',
      }

      await expect(
        playerService.updateChannelDecorate(3151318, params)
      ).resolves.not.toThrow()
    })

    it('should reject lowercase "y" for watermarkEnabled', async () => {
      const params: ChannelDecorateUpdateParams = {
        watermarkEnabled: 'y' as any,
      }

      await expect(
        playerService.updateChannelDecorate(3151318, params)
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should accept "Y" for warmUpEnabled', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const params: ChannelDecorateUpdateParams = {
        warmUpEnabled: 'Y',
      }

      await expect(
        playerService.updateChannelDecorate(3151318, params)
      ).resolves.not.toThrow()
    })

    it('should accept "N" for warmUpEnabled', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const params: ChannelDecorateUpdateParams = {
        warmUpEnabled: 'N',
      }

      await expect(
        playerService.updateChannelDecorate(3151318, params)
      ).resolves.not.toThrow()
    })

    it('should reject invalid value for warmUpEnabled', async () => {
      const params: ChannelDecorateUpdateParams = {
        warmUpEnabled: 'yes' as any,
      }

      await expect(
        playerService.updateChannelDecorate(3151318, params)
      ).rejects.toThrow(PolyVValidationError)
    })
  })
})
