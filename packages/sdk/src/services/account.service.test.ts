/**
 * AccountService Acceptance Tests
 *
 * Story 4.1: AccountService APIs
 *
 * Tests for AccountService methods covering all 26 Account APIs.
 *
 * Acceptance Criteria:
 * - AC1: Category Management - getCategoryList, createCategory, deleteCategory, updateCategoryName, updateCategoryRank
 * - AC2: User Info - getUserInfo
 * - AC3: Channel List - channels, channelDetail, getSimpleChannelList, userChannelBasicList, userPlaybackList
 * - AC4: Statistics - receiveList, getIncomeDetail, getUserDurations, micDuration
 * - AC5: Switch Config - switchGet, switchUpdate
 * - AC6: Callback Settings - setStreamCallback, setRecordCallback, setPlaybackCallback
 * - AC7: Token Management - setUserLoginToken, setUserChildrenLoginToken
 * - AC8: SSO - ssoLogin, ssoConfig
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { PolyVClient } from '../client.js'
import { AccountService } from './account.service.js'
import type { Category } from '../types/account.js'
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

const mockCategory: Category = {
  categoryId: 12345,
  categoryName: 'Test Category',
  userId: 'user123',
  rank: 1,
}

describe('AccountService', () => {
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
  let accountService: AccountService

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
    accountService = new AccountService(client)
  })

  // ============================================
  // AC1: Category Management APIs
  // ============================================

  describe('AC1: Category Management', () => {
    describe('getCategoryList', () => {
      it('should return category list successfully', async () => {
        const mockCategories: Category[] = [mockCategory]
        mockAxiosInstance.post.mockResolvedValueOnce(mockCategories)

        const result = await accountService.getCategoryList()

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v3/user/category/list'
        )
        expect(result.categories).toEqual(mockCategories)
      })

      it('should return empty array when no categories exist', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce([])

        const result = await accountService.getCategoryList()

        expect(result.categories).toEqual([])
      })
    })

    describe('createCategory', () => {
      it('should create category with valid name', async () => {
        const newCategory = { ...mockCategory, categoryId: 99999, categoryName: 'New Category' }
        mockAxiosInstance.post.mockResolvedValueOnce(newCategory)

        const result = await accountService.createCategory({ categoryName: 'New Category' })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v3/user/category/create',
          null,
          { params: { categoryName: 'New Category' } }
        )
        expect(result.categoryId).toBe(99999)
        expect(result.categoryName).toBe('New Category')
      })

      it('should throw PolyVValidationError when categoryName is empty', async () => {
        await expect(accountService.createCategory({ categoryName: '' }))
          .rejects.toThrow(PolyVValidationError)
      })

      it('should throw PolyVValidationError when categoryName is whitespace only', async () => {
        await expect(accountService.createCategory({ categoryName: '   ' }))
          .rejects.toThrow(PolyVValidationError)
      })
    })

    describe('deleteCategory', () => {
      it('should delete category by categoryId', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(true)

        const result = await accountService.deleteCategory({ categoryId: 12345 })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v3/user/category/delete',
          null,
          { params: { categoryId: 12345 } }
        )
        expect(result.success).toBe(true)
      })

      it('should throw PolyVValidationError when categoryId is missing', async () => {
        await expect(accountService.deleteCategory({ categoryId: 0 } as any))
          .rejects.toThrow(PolyVValidationError)
      })

      it('should throw PolyVValidationError when categoryId is negative', async () => {
        await expect(accountService.deleteCategory({ categoryId: -1 }))
          .rejects.toThrow(PolyVValidationError)
      })
    })

    describe('updateCategoryName', () => {
      it('should update category name successfully', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(true)

        const result = await accountService.updateCategoryName({
          categoryId: 12345,
          categoryName: 'Updated Name',
        })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v3/user/category/update-name',
          null,
          { params: { categoryId: 12345, categoryName: 'Updated Name' } }
        )
        expect(result.success).toBe(true)
      })

      it('should throw PolyVValidationError when categoryId is invalid', async () => {
        await expect(accountService.updateCategoryName({
          categoryId: 0,
          categoryName: 'Test',
        })).rejects.toThrow(PolyVValidationError)
      })

      it('should throw PolyVValidationError when categoryName is empty', async () => {
        await expect(accountService.updateCategoryName({
          categoryId: 12345,
          categoryName: '',
        })).rejects.toThrow(PolyVValidationError)
      })
    })

    describe('updateCategoryRank', () => {
      it('should update category rank successfully', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(true)

        const result = await accountService.updateCategoryRank({
          categoryId: 12345,
          afterCategoryId: 5,
        })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v3/user/category/update-rank',
          null,
          { params: { categoryId: 12345, afterCategoryId: 5 } }
        )
        expect(result.success).toBe(true)
      })

      it('should throw PolyVValidationError when categoryId is invalid', async () => {
        await expect(accountService.updateCategoryRank({
          categoryId: 0,
          afterCategoryId: 1,
        })).rejects.toThrow(PolyVValidationError)
      })

      it('should throw PolyVValidationError when afterCategoryId is undefined', async () => {
        await expect(accountService.updateCategoryRank({
          categoryId: 12345,
          afterCategoryId: undefined as any,
        })).rejects.toThrow(PolyVValidationError)
      })
    })
  })

  // ============================================
  // AC2: User Info API
  // ============================================

  describe('AC2: User Info', () => {
    describe('getUserInfo', () => {
      it('should return user account information', async () => {
        const mockUserInfo = {
          userId: 'user123',
          email: 'test@example.com',
          maxChannels: 100,
          totalChannels: 50,
          availableChannels: 50,
          linkMicLimit: 4,
        }
        mockAxiosInstance.get.mockResolvedValueOnce(mockUserInfo)

        const result = await accountService.getUserInfo()

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/live/v3/user/get-info'
        )
        expect(result.userId).toBe('user123')
        expect(result.email).toBe('test@example.com')
        expect(result.maxChannels).toBe(100)
      })
    })
  })

  // ============================================
  // AC3: Channel List APIs
  // ============================================

  describe('AC3: Channel List', () => {
    describe('channels', () => {
      it('should query channel ids with GET', async () => {
        const mockResponse = {
          channels: [2139283, 2139268],
        }
        mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

        const result = await accountService.channels({
          categoryId: 340019,
          keyword: 'Test',
          labelId: 'label-1',
        })

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/live/v3/user/channels',
          { params: { categoryId: 340019, keyword: 'Test', labelId: 'label-1' } }
        )
        expect(result.channels).toEqual([2139283, 2139268])
      })

      it('should return empty list when no channels exist', async () => {
        const mockResponse = {
          channels: [],
        }
        mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

        const result = await accountService.channels()

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/live/v3/user/channels',
          { params: {} }
        )
        expect(result.channels).toEqual([])
      })
    })

    describe('channelDetail', () => {
      it('should return channel detail by channelId', async () => {
        const mockDetail = {
          channel: {
            channelId: 'ch123',
            name: 'Test Channel',
            scene: 'alone',
          },
        }
        mockAxiosInstance.get.mockResolvedValueOnce(mockDetail)

        const result = await accountService.channelDetail({ channelId: 'ch123' })

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/live/v3/user/channel/detail',
          { params: { channelId: 'ch123' } }
        )
        expect(result.channel.channelId).toBe('ch123')
      })

      it('should throw PolyVValidationError when channelId is missing', async () => {
        await expect(accountService.channelDetail({ channelId: '' }))
          .rejects.toThrow(PolyVValidationError)
      })
    })

    describe('channelDetailList', () => {
      it('should return channel detail list with POST form params', async () => {
        const mockResponse = {
          contents: [{ channelId: 2191569, name: 'Test Channel' }],
          pageNumber: 1,
          pageSize: 20,
          totalItems: 1,
        }
        mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

        const result = await accountService.channelDetailList({
          page: 1,
          pageSize: 20,
          categoryId: '345134',
          watchStatus: 'playback',
          keyword: 'Test',
        })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v3/channel/management/list-detail',
          null,
          {
            params: {
              page: 1,
              pageSize: 20,
              categoryId: '345134',
              watchStatus: 'playback',
              keyword: 'Test',
            },
          }
        )
        expect(result.contents).toHaveLength(1)
      })

      it('should validate pagination', async () => {
        await expect(accountService.channelDetailList({ page: 0 }))
          .rejects.toThrow(PolyVValidationError)
      })
    })

    describe('getSimpleChannelList', () => {
      it('should return simple channel list', async () => {
        const mockResponse = {
          contents: [{ channelId: 'ch123', name: 'Test' }],
          pageNumber: 1,
          pageSize: 20,
          totalItems: 1,
        }
        mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

        const result = await accountService.getSimpleChannelList({
          categoryId: 123,
          page: 1,
          pageSize: 20,
          watchStatus: 'playback',
          keyword: 'Test',
        })

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/live/v3/channel/management/list',
          {
            params: {
              categoryId: 123,
              page: 1,
              pageSize: 20,
              watchStatus: 'playback',
              keyword: 'Test',
            },
          }
        )
        expect(result.contents).toHaveLength(1)
      })
    })

    describe('userChannelBasicList', () => {
      it('should return basic channel list for user', async () => {
        const mockResponse = {
          contents: [{ channelId: 'ch123', name: 'Test' }],
          pageNumber: 1,
          pageSize: 20,
          totalItems: 1,
        }
        mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

        const result = await accountService.userChannelBasicList({
          categoryIds: [340019, 345134],
          page: 1,
          pageSize: 20,
        })

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/live/v3/channel/basic/list',
          { params: { categoryIds: '340019,345134', page: 1, pageSize: 20 } }
        )
        expect(result.contents).toHaveLength(1)
      })
    })

    describe('userPlaybackList', () => {
      it('should return playback list for user', async () => {
        const mockResponse = {
          contents: [{ videoId: 'v123', title: 'Recording 1' }],
          total: 1,
        }
        mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

        const result = await accountService.userPlaybackList({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        })

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/live/v3/user/playback/list',
          { params: { startDate: '2024-01-01', endDate: '2024-01-31' } }
        )
        expect(result.contents).toHaveLength(1)
      })
    })
  })

  // ============================================
  // AC4: Statistics APIs
  // ============================================

  describe('AC4: Statistics', () => {
    describe('receiveList', () => {
      it('should return receive channel list', async () => {
        const mockResponse = {
          contents: [{ channelId: '1972965', name: 'Spring' }],
          pageNumber: 1,
          pageSize: 10,
          totalItems: 1,
        }
        mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

        const result = await accountService.receiveList({
          channelId: '2788479',
          keyword: 'Spring',
          page: 1,
          pageSize: 10,
        })

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/live/v3/channel/basic/receive/list',
          { params: { channelId: '2788479', keyword: 'Spring', page: 1, pageSize: 10 } }
        )
        expect(result.contents).toHaveLength(1)
      })

      it('should throw PolyVValidationError when channelId is missing', async () => {
        await expect(accountService.receiveList({ channelId: '' }))
          .rejects.toThrow(PolyVValidationError)
      })
    })

    describe('getIncomeDetail', () => {
      it('should return detailed income information', async () => {
        const mockResponse = {
          contents: [{ amount: 0.01, payType: 'good', payTypeName: '道具打赏', userId: 'user123' }],
          pageNumber: 1,
          pageSize: 20,
          totalItems: 1,
        }
        mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

        const result = await accountService.getIncomeDetail({
          userId: 'user123',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          channelId: '1965681',
          page: 1,
          pageSize: 20,
        })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v2/user/user123/get-income-detail',
          null,
          {
            params: {
              startDate: '2024-01-01',
              endDate: '2024-01-31',
              channelId: '1965681',
              page: 1,
              pageSize: 20,
            },
          }
        )
        expect(result.contents[0].amount).toBe(0.01)
      })

      it('should throw PolyVValidationError when required dates are missing', async () => {
        await expect(accountService.getIncomeDetail({
          userId: 'user123',
          startDate: '',
          endDate: '2024-01-31',
        })).rejects.toThrow(PolyVValidationError)
      })
    })

    describe('getUserDurations', () => {
      it('should return user viewing duration', async () => {
        const mockResponse = {
          userId: 'user123',
          available: 9610,
          used: 570,
        }
        mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

        const result = await accountService.getUserDurations()

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v2/user/get-user-durations',
          null,
          { params: {} }
        )
        expect(result.available).toBe(9610)
      })
    })

    describe('micDuration', () => {
      it('should return mic duration statistics', async () => {
        const mockResponse = {
          available: 5000,
          history: 3,
        }
        mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

        const result = await accountService.micDuration()

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/live/v3/channel/statistics/mic/get-duration',
          { params: {} }
        )
        expect(result.history).toBe(3)
      })
    })
  })

  // ============================================
  // AC5: Switch Config APIs
  // ============================================

  describe('AC5: Switch Config', () => {
    describe('switchGet', () => {
      it('should return current switch configuration', async () => {
        const mockResponse = [
          { type: 'isClosePreview', enabled: 'N' },
          { type: 'mobileWatch', enabled: 'Y' },
        ]
        mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

        const result = await accountService.switchGet({ channelId: '2191569' })

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/live/v3/channel/switch/get',
          { params: { channelId: '2191569' } }
        )
        expect(result[0].type).toBe('isClosePreview')
      })
    })

    describe('switchUpdate', () => {
      it('should update switch configuration with Y/N string', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(true)

        const result = await accountService.switchUpdate({
          channelId: '2191569',
          type: 'mobileWatch',
          enabled: 'Y',
        })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v3/channel/switch/update',
          null,
          { params: { channelId: '2191569', type: 'mobileWatch', enabled: 'Y' } }
        )
        expect(result.success).toBe(true)
      })

      it('should convert boolean true to Y and accept deprecated param alias', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(true)

        await accountService.switchUpdate({
          param: 'mobileWatch',
          enabled: true,
        })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v3/channel/switch/update',
          null,
          { params: { type: 'mobileWatch', enabled: 'Y' } }
        )
      })

      it('should convert boolean false to N', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(true)

        await accountService.switchUpdate({
          param: 'authEnabled',
          enabled: false,
        })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v3/channel/switch/update',
          null,
          { params: { type: 'authEnabled', enabled: 'N' } }
        )
      })

      it('should throw PolyVValidationError when type is missing', async () => {
        await expect(accountService.switchUpdate({
          enabled: 'Y',
        })).rejects.toThrow(PolyVValidationError)
      })

      it('should throw PolyVValidationError when enabled is missing', async () => {
        await expect(accountService.switchUpdate({
          param: 'authEnabled',
          enabled: undefined as any,
        })).rejects.toThrow(PolyVValidationError)
      })
    })
  })

  // ============================================
  // AC6: Callback Settings APIs
  // ============================================

  describe('AC6: Callback Settings', () => {
    describe('setStreamCallback', () => {
      it('should set stream callback URL', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce('success')

        const result = await accountService.setStreamCallback({
          userId: 'user123',
          url: 'https://example.com/stream-callback',
        })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v2/user/user123/set-stream-callback',
          null,
          { params: { url: 'https://example.com/stream-callback' } }
        )
        expect(result.success).toBe(true)
      })

      it('should throw PolyVValidationError when URL is invalid', async () => {
        await expect(accountService.setStreamCallback({
          userId: 'user123',
          url: 'not-a-valid-url',
        })).rejects.toThrow(PolyVValidationError)
      })

      it('should clear callback when URL is empty', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(true)

        const result = await accountService.setStreamCallback({ userId: 'user123', url: '' })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v2/user/user123/set-stream-callback',
          null,
          { params: { url: '' } }
        )
        expect(result.success).toBe(true)
      })

      it('should throw PolyVValidationError when userId is missing', async () => {
        await expect(accountService.setStreamCallback({ userId: '', url: '' }))
          .rejects.toThrow(PolyVValidationError)
      })
    })

    describe('setRecordCallback', () => {
      it('should set record callback URL', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(true)

        const result = await accountService.setRecordCallback({
          userId: 'user123',
          url: 'https://example.com/record-callback',
        })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v2/user/user123/set-record-callback',
          null,
          { params: { url: 'https://example.com/record-callback' } }
        )
        expect(result.success).toBe(true)
      })

      it('should throw PolyVValidationError when URL is invalid', async () => {
        await expect(accountService.setRecordCallback({
          userId: 'user123',
          url: 'invalid-url',
        })).rejects.toThrow(PolyVValidationError)
      })
    })

    describe('setPlaybackCallback', () => {
      it('should set playback callback URL', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(true)

        const result = await accountService.setPlaybackCallback({
          userId: 'user123',
          url: 'https://example.com/playback-callback',
        })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v2/user/user123/set-playback-callback',
          null,
          { params: { url: 'https://example.com/playback-callback' } }
        )
        expect(result.success).toBe(true)
      })

      it('should throw PolyVValidationError when URL is invalid', async () => {
        await expect(accountService.setPlaybackCallback({
          userId: 'user123',
          url: 'not-valid',
        })).rejects.toThrow(PolyVValidationError)
      })
    })
  })

  // ============================================
  // AC7: Token Management APIs
  // ============================================

  describe('AC7: Token Management', () => {
    describe('setUserLoginToken', () => {
      it('should set user login token', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(true)

        const result = await accountService.setUserLoginToken({ token: 'my-token' })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v3/user/set-sso-token',
          null,
          { params: { token: 'my-token' } }
        )
        expect(result.success).toBe(true)
      })

      it('should throw PolyVValidationError when token is missing', async () => {
        await expect(accountService.setUserLoginToken({ token: '' }))
          .rejects.toThrow(PolyVValidationError)
      })
    })

    describe('setUserChildrenLoginToken', () => {
      it('should set child account login token', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(true)

        const result = await accountService.setUserChildrenLoginToken({
          childEmail: 'child@example.com',
          token: 'child-token',
        })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v3/user/set-sso-token',
          null,
          { params: { childEmail: 'child@example.com', token: 'child-token' } }
        )
        expect(result.success).toBe(true)
      })

      it('should accept deprecated userId alias for childEmail', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(true)

        await accountService.setUserChildrenLoginToken({
          userId: 'child@example.com',
          token: 'child-token',
        })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v3/user/set-sso-token',
          null,
          { params: { childEmail: 'child@example.com', token: 'child-token' } }
        )
      })

      it('should throw PolyVValidationError when childEmail is missing', async () => {
        await expect(accountService.setUserChildrenLoginToken({
          childEmail: '',
          token: 'token',
        })).rejects.toThrow(PolyVValidationError)
      })

      it('should throw PolyVValidationError when token is missing', async () => {
        await expect(accountService.setUserChildrenLoginToken({
          userId: 'child123',
          token: '',
        })).rejects.toThrow(PolyVValidationError)
      })
    })
  })

  // ============================================
  // AC8: SSO APIs
  // ============================================

  describe('AC8: SSO', () => {
    describe('ssoLogin', () => {
      it('should handle SSO login', async () => {
        const mockResponse = {
          token: 'sso-token-123',
          userId: 'user123',
          expireTime: 3600,
        }
        mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

        const result = await accountService.ssoLogin({
          code: 'auth-code',
          redirectUri: 'https://example.com/callback',
        })

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/live/v3/user/sso/login',
          { params: { code: 'auth-code', redirectUri: 'https://example.com/callback' } }
        )
        expect(result.token).toBe('sso-token-123')
      })

      it('should throw PolyVValidationError when code is missing', async () => {
        await expect(accountService.ssoLogin({ code: '' }))
          .rejects.toThrow(PolyVValidationError)
      })
    })

    describe('ssoConfig', () => {
      it('should configure SSO settings', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(true)

        const result = await accountService.ssoConfig({
          ssoEnabled: true,
          ssoUrl: 'https://sso.example.com/login',
        })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v3/user/sso/config',
          null,
          { params: { ssoEnabled: 'Y', ssoUrl: 'https://sso.example.com/login' } }
        )
        expect(result.success).toBe(true)
      })

      it('should convert boolean ssoEnabled to Y/N', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(true)

        await accountService.ssoConfig({
          ssoEnabled: false,
          ssoUrl: 'https://sso.example.com/login',
        })

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v3/user/sso/config',
          null,
          { params: { ssoEnabled: 'N', ssoUrl: 'https://sso.example.com/login' } }
        )
      })
    })
  })

  // ============================================
  // Service Architecture Tests
  // ============================================

  describe('Service architecture', () => {
    it('should be accessible via PolyVClient.account property', () => {
      expect(client.account).toBeDefined()
      expect(client.account).toBeInstanceOf(AccountService)
    })

    it('should use client.httpClient for requests', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({})
      await accountService.getUserInfo()
      expect(mockAxiosInstance.get).toHaveBeenCalled()
    })
  })
})
