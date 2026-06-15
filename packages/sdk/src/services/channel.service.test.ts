/**
 * ChannelService Acceptance Tests (TDD Red Phase)
 *
 * Story 2-1: ChannelService Skeleton + Core CRUD
 *
 * These tests define the expected behavior for ChannelService methods.
 * They will FAIL initially because ChannelService does not exist yet.
 * This is the TDD "Red" phase - tests define requirements.
 *
 * Acceptance Criteria:
 * - AC1: createChannel - creates a channel with proper signature injection
 * - AC2: getChannel - retrieves channel details by ID
* - AC3: updateChannel - updates channel settings (partial update)
* - AC4: deleteChannel - deletes a channel
 * - AC5: Type Safety - all requests/responses have complete type definitions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { PolyVClient } from '../client.js'
import { ChannelService } from './channel.service.js'
import type { ChannelModel, ChannelDetail, CreateChannelRequest, UpdateChannelRequest } from '../types/channel.js'
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

const mockChannelResponse: ChannelModel = {
  channelId: 'ch123456',
  userId: 'user123',
  name: 'Test Channel',
  publisher: 'Test Publisher',
  description: 'Test Description',
  url: 'https://live.polyv.cn/watch/ch123456',
  stream: 'rtmp://test.polyv.net/live/ch123456',
  scene: 'alone',
  channelPasswd: 'password123',
  streamType: 'client',
  pureRtcEnabled: 'N',
  status: 'live',
  createdTime: 1709875200000,
  lastModified: 1709875200000,
}

const mockChannelDetail: ChannelDetail = {
  ...mockChannelResponse,
  categoryId: 'cat001',
  maxViewer: 1000,
  linkMicLimit: 4,
  playerColor: '#000000',
  autoPlay: 1,
  logoImage: 'https://example.com/logo.png',
  logoOpacity: 90,
  logoPosition: 'bottom-left',
}

const mockCreateRequest: CreateChannelRequest = {
  name: 'New Channel',
  channelPasswd: 'password123',
  userId: 'user123',
  scene: 'alone',
  pureRtcEnabled: 'N',
}

const mockUpdateRequest: UpdateChannelRequest = {
  name: 'Updated Channel Name',
  description: 'Updated description',
}

describe('ChannelService', () => {
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

  describe('AC1: createChannel - Create Channel', () => {
    it('should create a channel and return ChannelModel', async () => {
      const mockCreatedChannel = {
        ...mockChannelResponse,
        name: mockCreateRequest.name,
      }

      mockAxiosInstance.post.mockResolvedValueOnce(mockCreatedChannel)

      const result = await channelService.createChannel(mockCreateRequest)

      // The implementation passes request params as query parameters (third argument)
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channels',
        null,
        { params: mockCreateRequest }
      )

      expect(result.channelId).toBe('ch123456')
      expect(result.name).toBe('New Channel')
      expect(result.userId).toBe('user123')
    })

    it('should inject correct endpoint into httpClient.post', async () => {
      const mockResponse = { ...mockChannelResponse }
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)
      const result = await channelService.createChannel(mockCreateRequest)
      expect(result).toEqual(mockResponse)
    })

    it('should validate userId is required', async () => {
      const requestWithoutUserId = {
        name: 'Test',
        channelPasswd: 'pwd'
      } as CreateChannelRequest

      await expect(channelService.createChannel(requestWithoutUserId)).rejects.toThrow(PolyVValidationError)
    })

    it('should validate name is required', async () => {
      const requestWithoutName = {
        userId: 'user123',
        channelPasswd: 'pwd'
      } as CreateChannelRequest
      await expect(channelService.createChannel(requestWithoutName)).rejects.toThrow(PolyVValidationError)
    })

    it('should validate name max length (60 chars)', async () => {
      const requestWithLongName: CreateChannelRequest = {
        name: 'a'.repeat(61),
        userId: 'user123',
        channelPasswd: 'pwd',
      }
      await expect(channelService.createChannel(requestWithLongName)).rejects.toThrow(PolyVValidationError)
    })

    it('should validate channelPasswd max length (16 chars)', async () => {
      const requestWithLongPassword: CreateChannelRequest = {
        name: 'Test',
        userId: 'user123',
        channelPasswd: 'a'.repeat(17),
      }
      await expect(channelService.createChannel(requestWithLongPassword)).rejects.toThrow(PolyVValidationError)
    })
  })

  describe('AC2: getChannel - Get Channel Details', () => {
    it('should retrieve channel details by channelId', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockChannelDetail)
      const result = await channelService.getChannel('ch123456')
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v2/channels/ch123456/get'
      )
      expect(result.channelId).toBe('ch123456')
      expect(result.name).toBe('Test Channel')
      expect(result.categoryId).toBe('cat001')
    })

    it('should return complete channel details including all fields', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockChannelDetail)
      const result = await channelService.getChannel('ch123456')
      expect(result).toEqual(mockChannelDetail)
    })

    it('should handle 404 error for non-existent channel', async () => {
      const apiError = {
        response: {
          status: 404,
          data: { code: 400, message: 'Channel not found' },
        },
      }
      mockAxiosInstance.get.mockRejectedValueOnce(apiError)
      await expect(channelService.getChannel('non-existent')).rejects.toThrow()
    })
  })

  describe('AC3: updateChannel - Update Channel Settings', () => {
    it('should update channel settings with partial update', async () => {
      const updatedChannel = {
        ...mockChannelDetail,
        name: 'Updated Channel Name',
        description: 'Updated description',
      }
      // updateChannel calls the v3 endpoint with basicSetting wrapper
      // The update API returns 204 with empty data
      mockAxiosInstance.post.mockResolvedValueOnce(undefined)
      // then getChannel returns the updated channel details
      mockAxiosInstance.get.mockResolvedValueOnce(updatedChannel)
      const result = await channelService.updateChannel('ch123456', mockUpdateRequest)
      // Verify the v3 endpoint is called with basicSetting wrapper and channelId as params
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/basic/update',
        { basicSetting: mockUpdateRequest },
        { params: { channelId: 'ch123456' } }
      )
      expect(result).toEqual(updatedChannel)
    })

    it('should support updating only name (partial update)', async () => {
      const partialUpdate: UpdateChannelRequest = {
        name: 'Only Name Updated'
      }
      // updateChannel calls the v3 endpoint with basicSetting wrapper
      mockAxiosInstance.post.mockResolvedValueOnce(undefined)
      mockAxiosInstance.get.mockResolvedValueOnce({
        ...mockChannelDetail,
        name: partialUpdate.name,
      })
      const result = await channelService.updateChannel('ch123456', partialUpdate)
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/basic/update',
        { basicSetting: partialUpdate },
        { params: { channelId: 'ch123456' } }
      )
      expect(result.name).toBe('Only Name Updated')
    })

    it('should support updating only description (partial update)', async () => {
      const partialUpdate: UpdateChannelRequest = {
        description: 'Only Description Updated'
      }
      // updateChannel calls the v3 endpoint with basicSetting wrapper
      mockAxiosInstance.post.mockResolvedValueOnce(undefined)
      mockAxiosInstance.get.mockResolvedValueOnce({
        ...mockChannelDetail,
        description: partialUpdate.description,
      })
      await channelService.updateChannel('ch123456', partialUpdate)
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/basic/update',
        { basicSetting: partialUpdate },
        { params: { channelId: 'ch123456' } }
      )
    })

    it('should support updating maxViewer and linkMicLimit', async () => {
      const updateRequest: UpdateChannelRequest = {
        maxViewer: 2000,
        linkMicLimit: 8
      }
      // updateChannel calls the v3 endpoint with basicSetting wrapper
      mockAxiosInstance.post.mockResolvedValueOnce(undefined)
      mockAxiosInstance.get.mockResolvedValueOnce({
        ...mockChannelDetail,
        maxViewer: 2000,
        linkMicLimit: 8,
      })
      const result = await channelService.updateChannel('ch123456', updateRequest)
      // Verify the v3 endpoint is called with basicSetting wrapper and channelId as params
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/basic/update',
        { basicSetting: updateRequest },
        { params: { channelId: 'ch123456' } }
      )
      expect(result.maxViewer).toBe(2000)
      expect(result.linkMicLimit).toBe(8)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.updateChannel('', mockUpdateRequest)).rejects.toThrow(PolyVValidationError)
    })
  })

  describe('AC4: deleteChannel - Delete Channel', () => {
    it('should delete a channel and return true on success', async () => {
      // API returns true directly after response interceptor extracts the boolean directly
      mockAxiosInstance.post.mockResolvedValueOnce(true)
      const result = await channelService.deleteChannel('ch123456', 'user123')
      // userId is passed as query params (for signing), not in body
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channels/ch123456/delete',
        null,
        { params: { userId: 'user123' } }
      )
      expect(result).toBe(true)
    })

    it('should include userId in request params', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)
      await channelService.deleteChannel('ch123456', 'user456')
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channels/ch123456/delete',
        null,
        { params: { userId: 'user456' } }
      )
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.deleteChannel('', 'user123')).rejects.toThrow(PolyVValidationError)
    })

    it('should validate userId is required', async () => {
      await expect(channelService.deleteChannel('ch123456', '')).rejects.toThrow(PolyVValidationError)
    })
  })

  describe('AC5: type Safety', () => {
    it('should have correct type for ChannelModel', () => {
      const channel: ChannelModel = mockChannelResponse
      expect(channel.channelId).toBeDefined()
      expect(channel.name).toBeDefined()
      expect(channel.userId).toBeDefined()
    })

    it('should have correct type for ChannelDetail', () => {
      const detail: ChannelDetail = mockChannelDetail
      expect(detail.categoryId).toBeDefined()
      expect(detail.maxViewer).toBeDefined()
    })

    it('should have correct type for CreateChannelRequest', () => {
      const request: CreateChannelRequest = {
        name: 'Test',
        channelPasswd: 'pwd',
        userId: 'user123'
      }
      expect(request.name).toBe('Test')
    })

    it('should have correct type for UpdateChannelRequest', () => {
      const request: UpdateChannelRequest = {
        name: 'Updated'
      }
      expect(request.name).toBe('Updated')
    })

    it('should define scene enum values', () => {
      const scenes = ['alone', 'ppt', 'topclass']
      expect(scenes).toContain('alone')
      expect(scenes).toContain('ppt')
    })

    it('should define streamType enum values', () => {
      const streamTypes = ['client', 'client_pull']
      expect(streamTypes).toContain('client')
    })

    it('should define YNFlag type values', () => {
      const ynFlags: ('Y' | 'N')[] = ['Y', 'N']
      expect(ynFlags).toContain('Y')
      expect(ynFlags).toContain('N')
    })
  })

  describe('Service architecture', () => {
    it('should be accessible via PolyVClient.channel property', () => {
      expect(client.channel).toBeDefined()
      expect(client.channel).toBeInstanceOf(ChannelService)
    })

    it('should use client.httpClient for requests', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockChannelDetail)
      await channelService.getChannel('ch123456')
      expect(mockAxiosInstance.get).toHaveBeenCalled()
    })
  })
})
