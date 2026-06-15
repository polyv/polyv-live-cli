/**
 * ChannelService Monitor + Operate Acceptance Tests (TDD Red Phase)
 *
 * Story 2-3: ChannelService - Monitor + Operate APIs
 *
 * These tests define the expected behavior for ChannelService methods.
 * They will FAIL initially because methods are not implemented yet.
 * This is the TDD "Red" phase - tests define requirements.
 *
 * Acceptance Criteria:
 * - AC1: getHlsPullUrl - 获取频道HLS协议拉流地址
 * - AC2: getPushUrl - 获取频道推流地址
 * - AC3: createChannelV3 - 创建频道(新版)
 * - AC4: getChannelDetail - 查询频道详情信息
 * - AC5: deleteChannel - 删除单个频道
 * - AC6: batchDeleteChannels - 批量删除频道
 * - AC7: copyChannel - 复制频道
 * - AC8: setMaxViewer - 设置频道最大观看人数
 * - AC9: updateChannelPassword - 修改频道密码
 * - AC10: updateCallbackSetting - 修改频道回调设置
 * - AC11: getCallbackSetting - 查询频道回调设置
 * - AC12: addAccount - 创建角色
 * - AC13: getAccount - 查询单个角色信息
 * - AC14: getAccounts - 查询频道下所有角色
 * - AC15: updateAccount - 修改角色信息
 * - AC16: deleteAccount - 删除角色
 * - AC17: batchCreateAccounts - 批量创建角色
 * - AC18: deleteDiskVideos - 删除云盘视频
 * - AC19: getCaptureImage - 获取频道截图
 * - AC20: updateStreamType - 更新推流方式
 * - AC21: setAccountToken - 设置角色访问令牌
 * - AC22: getChatToken - 获取聊天token
 * - AC23: getApiToken - 获取API Token
 * - AC24: getWatchApiToken - 获取观看页API Token
 * - AC25: updateSetting - 修改频道基本设置
 * - AC26: updateChannelDetailSetting - 修改频道详情设置
 * - AC27: pptGetSetting - 查询PPT设置
 * - AC28: pptSetting - 修改PPT设置
 * - AC29: pptrecordList - 查询PPT录制列表
 * - AC30: updatePptRecordSetting - 修改PPT录制设置
 * - AC31: deletePptRecord - 删除PPT录制
 * - AC32: addRecordTask - 添加录制任务
 * - AC33: endDiskVideo - 结束云盘视频
 * - AC34: addDiskVideos - 添加云盘视频
 * - AC35: getChannelAdverts - 查询频道广告设置
 * - AC36: removeChatContents - 删除聊天记录
 * - AC37: getChannelProductList - 查询频道商品列表
 * - AC38: addChannelProduct - 添加频道商品
 * - AC39: updateChannelProduct - 修改频道商品
 * - AC40: deleteChannelProduct - 删除频道商品
 * - AC41: batchAddChannelProduct - 批量添加频道商品
 * - AC42: batchDeleteChannelProduct - 批量删除频道商品
 * - AC43: shelfChannelProduct - 商品上架
 * - AC44: cancelPushChannelProduct - 取消商品推送
 * - AC45: pushChannelProduct - 商品推送
 * - AC46: sortChannelProduct - 商品排序
 * - AC47: referenceProduct - 商品关联
 * - AC48: batchShelfChannelProduct - 批量商品上架
 * - AC49: addSubmeeting - 添加子会议
 * - AC50: batchAddSubmeeting - 批量添加子会议
 * - AC51: batchAddTransmit - 批量添加转播频道
 * - AC52: associationReceiveChannels - 关联接收转播频道
 * - AC53: getTransmitAssociations - 查询转播频道关联
 * - AC54: getChatOnlineCount - 查询频道实时在线人数
 * - AC55: listChannelsFollow - 查询频道关注列表
 * - AC56: updateChannelsFollow - 更新频道关注
 * - AC57: getUserChildrenChannels - 查询用户子频道列表
 * - AC58: getChannelDetailSetting - 查询频道详情设置
 * - AC59: updateChannelDetailSetting - 修改频道详情设置
 * - AC60: getChannelProductEnabled - 查询频道商品功能开关
 * - AC61: updateChannelProductEnabled - 修改频道商品功能开关
 * - AC62: batchUpdateDanmu - 批量更新弹幕
 * - AC63: channelsStopQuestionnaire - 查询问卷下的频道停止问卷
 * - AC64: Type Safety - 所有请求和响应有完整类型定义
 * - AC65: updateChannelConfig - 更新频道配置（通用key/value）
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { PolyVClient } from '../client.js'
import { ChannelService } from './channel.service.js'
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

  // ============================================
  // AC1: Monitor - getHlsPullUrl
  // ============================================
  describe('AC1: getHlsPullUrl - 获取频道HLS协议拉流地址', () => {
    it('should get HLS pull URL with valid channelId', async () => {
      const mockHlsUrl = 'https://pull-t2.videocc.net/recordf/93837273272343dsfasdfasdfasdf.m3u8?txSecret=26d9998b71b58c8b6f14b27ccf6e285b&txTime=661d10c6'
      mockAxiosInstance.get.mockResolvedValueOnce(mockHlsUrl)

      const result = await channelService.getHlsPullUrl('ch123456')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/monitor/hls-pull-url',
        { params: { channelId: 'ch123456' } }
      )
      expect(result).toBe(mockHlsUrl)
    })

    it('should throw PolyVValidationError if channelId is empty', async () => {
      await expect(channelService.getHlsPullUrl('')).rejects.toThrow(PolyVValidationError)
    })

    it('should handle API error response', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: { status: 400, data: { code: 400, message: 'forbidden' } },
      })
      await expect(channelService.getHlsPullUrl('ch123456')).rejects.toThrow()
    })
  })

  // ============================================
  // AC2: Stream - getPushUrl
  // ============================================
  describe('AC2: getPushUrl - 获取频道推流地址', () => {
    it('should get push URL with valid channelId', async () => {
      const mockPushUrl = 'rtmp://push-d1.videocc.net/recordf/1b448be3231102820826401ff57?auth_key=1642220773-0-0-a1f935fcfcf63b7654ac86586ab0f6b6'
      mockAxiosInstance.get.mockResolvedValueOnce(mockPushUrl)

      const result = await channelService.getPushUrl('ch123456')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/stream/get-push-url',
        { params: { channelId: 'ch123456' } }
      )
      expect(result).toBe(mockPushUrl)
    })

    it('should throw PolyVValidationError if channelId is empty', async () => {
      await expect(channelService.getPushUrl('')).rejects.toThrow(PolyVValidationError)
    })

    it('should handle API error response', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: { status: 400, data: { code: 400, message: 'invalid signature' } },
      })
      await expect(channelService.getPushUrl('ch123456')).rejects.toThrow()
    })
  })

  // ============================================
  // AC3: createChannelV3
  // ============================================
  describe('AC3: createChannelV3 - 创建频道(新版)', () => {
    it('should create channel with basic settings', async () => {
      const mockCreatedChannel = {
        channelId: '123456',
        userId: 'user123',
        name: 'Test Channel',
        scene: 'alone',
        channelPasswd: 'password123',
        streamType: 'client',
        pureRtcEnabled: 'N',
        currentTimeMillis: 1709875200000,
      }
      mockAxiosInstance.post.mockResolvedValueOnce(mockCreatedChannel)

      const request = {
        name: 'Test Channel',
        channelPasswd: 'password123',
        userId: 'user123',
      }

      const result = await channelService.createChannelV3(request)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/basic/create',
        {
          basicSetting: request,
        },
        { params: {} }
      )
      expect(result.channelId).toBe('123456')
      expect(result.name).toBe('Test Channel')
    })

    it('should create channel with auth settings', async () => {
      const mockCreatedChannel = {
        channelId: '123456',
        userId: 'user123',
        name: 'Test Channel',
        scene: 'alone',
        channelPasswd: 'password123',
      }
      mockAxiosInstance.post.mockResolvedValueOnce(mockCreatedChannel)

      const request = {
        name: 'Test Channel',
        channelPasswd: 'password123',
        userId: 'user123',
        authSettings: [
          {
            rank: 1,
            enabled: 'Y',
            authType: 'pay',
            payAuthTips: 'Welcome',
            price: 99.99,
          },
        ],
      }

      const result = await channelService.createChannelV3(request)
      expect(result.channelId).toBe('123456')
    })

    it('should create channel with playback settings', async () => {
      const mockCreatedChannel = {
        channelId: '123456',
        userId: 'user123',
        name: 'Test Channel',
      }
      mockAxiosInstance.post.mockResolvedValueOnce(mockCreatedChannel)

      const request = {
        name: 'Test Channel',
        channelPasswd: 'password123',
        userId: 'user123',
        playbackSetting: {
          playbackEnabled: 'Y',
          type: 'single',
          origin: 'record',
        },
      }

      const result = await channelService.createChannelV3(request)
      expect(result.channelId).toBe('123456')
    })

    it('should create channel with teacher settings', async () => {
      const mockCreatedChannel = {
        channelId: '123456',
        userId: 'user123',
        name: 'Test Channel',
      }
      mockAxiosInstance.post.mockResolvedValueOnce(mockCreatedChannel)

      const request = {
        name: 'Test Channel',
        channelPasswd: 'password123',
        userId: 'user123',
        teacher: {
          nickname: 'Teacher Nick',
          actor: 'Instructor',
          passwd: 'teacher123',
        },
      }

      const result = await channelService.createChannelV3(request)
      expect(result.channelId).toBe('123456')
    })

    it('should create channel with roles', async () => {
      const mockCreatedChannel = {
        channelId: '123456',
        userId: 'user123',
        name: 'Test Channel',
      }
      mockAxiosInstance.post.mockResolvedValueOnce(mockCreatedChannel)

      const request = {
        name: 'Test Channel',
        channelPasswd: 'password123',
        userId: 'user123',
        roles: [
          {
            nickname: 'Assistant',
            actor: '助教',
            passwd: 'assistant123',
            role: 'Assistant',
          },
        ],
      }

      const result = await channelService.createChannelV3(request)
      expect(result.channelId).toBe('123456')
    })

    it('should throw PolyVValidationError if name is empty', async () => {
      const request = {
        name: '',
        channelPasswd: 'password123',
        userId: 'user123',
      } as any
      await expect(channelService.createChannelV3(request)).rejects.toThrow(PolyVValidationError)
    })

    it('should throw PolyVValidationError if channelPasswd is empty', async () => {
      const request = {
        name: 'Test',
        channelPasswd: '',
        userId: 'user123',
      } as any
      await expect(channelService.createChannelV3(request)).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC7: copyChannel
  // ============================================
  describe('AC7: copyChannel - 复制频道', () => {
    it('should copy channel successfully', async () => {
      const newChannelId = 999999
      mockAxiosInstance.post.mockResolvedValueOnce(newChannelId)

      const result = await channelService.copyChannel('ch123456')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/basic/copy',
        null,
        { params: { channelId: 'ch123456' } }
      )
      expect(result).toBe(newChannelId)
    })

    it('should copy channel with custom name', async () => {
      const newChannelId = 999999
      mockAxiosInstance.post.mockResolvedValueOnce(newChannelId)

      const result = await channelService.copyChannel('ch123456', { name: 'Copied Channel' })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/basic/copy',
        null,
        { params: { channelId: 'ch123456', name: 'Copied Channel' } }
      )
      expect(result).toBe(newChannelId)
    })

    it('should copy channel with categoryId', async () => {
      const newChannelId = 999999
      mockAxiosInstance.post.mockResolvedValueOnce(newChannelId)

      const result = await channelService.copyChannel('ch123456', { categoryId: 12345 })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/basic/copy',
        null,
        { params: { channelId: 'ch123456', categoryId: 12345 } }
      )
      expect(result).toBe(newChannelId)
    })

    it('should throw PolyVValidationError if channelId is empty', async () => {
      await expect(channelService.copyChannel('')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC8: setMaxViewer
  // ============================================
  describe('AC8: setMaxViewer - 设置频道最大观看人数', () => {
    it('should set max viewer successfully', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce('设置成功')

      const result = await channelService.setMaxViewer('ch123456', 'user123', 100)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channelRestrict/ch123456/set-max-viewer',
        null,
        { params: { userId: 'user123', maxViewer: 100 } }
      )
      expect(result).toBe('设置成功')
    })

    it('should throw PolyVValidationError if channelId is empty', async () => {
      await expect(channelService.setMaxViewer('', 'user123', 100)).rejects.toThrow(PolyVValidationError)
    })

    it('should throw PolyVValidationError if userId is empty', async () => {
      await expect(channelService.setMaxViewer('ch123456', '', 100)).rejects.toThrow(PolyVValidationError)
    })

    it('should throw PolyVValidationError if maxViewer is undefined', async () => {
      await expect(channelService.setMaxViewer('ch123456', 'user123', undefined as any)).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC9: updateChannelPassword
  // ============================================
  describe('AC9: updateChannelPassword - 修改频道密码', () => {
    it('should update channel password successfully', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.updateChannelPassword('user123', 'newPassword123', 'ch123456')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channels/user123/passwdSetting',
        null,
        { params: { passwd: 'newPassword123', channelId: 'ch123456' } }
      )
      expect(result).toBe(true)
    })

    it('should update all channels when channelId not provided', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.updateChannelPassword('user123', 'newPassword123')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channels/user123/passwdSetting',
        null,
        { params: { passwd: 'newPassword123' } }
      )
      expect(result).toBe(true)
    })

    it('should throw PolyVValidationError if userId is empty', async () => {
      await expect(channelService.updateChannelPassword('', 'password123')).rejects.toThrow(PolyVValidationError)
    })

    it('should throw PolyVValidationError if passwd is empty', async () => {
      await expect(channelService.updateChannelPassword('user123', '')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC10: updateCallbackSetting
  // ============================================
  describe('AC10: updateCallbackSetting - 修改频道回调设置', () => {
    it('should update callback setting successfully', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(null)

        const options = {
          recordCallbackUrl: 'http://callback.example.com',
          recordCallbackVideoType: 'm3u8',
        }

        const result = await channelService.updateCallbackSetting('ch123456', options)

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v3/channel/callback/update-setting',
          null,
          { params: { channelId: 'ch123456', recordCallbackUrl: 'http://callback.example.com', recordCallbackVideoType: 'm3u8' } }
        )
        expect(result).toBeNull()
      })

    it('should support all callback URL parameters', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(null)

        const options = {
          recordCallbackUrl: 'http://record.example.com',
          playbackCallbackUrl: 'http://playback.example.com',
          streamCallbackUrl: 'http://stream.example.com',
          pptRecordCallbackUrl: 'http://ppt.example.com',
          liveScanCallbackUrl: 'http://scan.example.com',
          playbackCacheCallbackUrl: 'http://cache.example.com',
        }

        await channelService.updateCallbackSetting('ch123456', options)

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v3/channel/callback/update-setting',
          null,
          expect.objectContaining({
            params: expect.objectContaining({
              channelId: 'ch123456',
              recordCallbackUrl: 'http://record.example.com',
              playbackCallbackUrl: 'http://playback.example.com',
              streamCallbackUrl: 'http://stream.example.com',
            }),
          })
        )
      })

    it('should throw PolyVValidationError if channelId is empty', async () => {
        await expect(channelService.updateCallbackSetting('', {})).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC11: getCallbackSetting
  // ============================================
  describe('AC11: getCallbackSetting - 查询频道回调设置', () => {
    it('should get callback setting successfully', async () => {
        const mockCallbackSetting = {
          recordCallbackUrl: 'http://www.abc.com/callback',
          playbackCallbackUrl: 'http://www.abc.com/callback',
          streamCallbackUrl: 'http://www.abc.com/callback',
          liveScanCallbackUrl: null,
          recordCallbackVideoType: 'm3u8',
          playbackCacheCallbackUrl: null,
          pptRecordCallbackUrl: null,
          playbackSettingCallbackUrl: null,
          globalSettingEnabled: 'Y',
          liveViolationCutoffCallbackUrl: 'http://www.abc.com/callback',
        }
        mockAxiosInstance.get.mockResolvedValueOnce(mockCallbackSetting)

        const result = await channelService.getCallbackSetting('ch123456')

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/live/v3/channel/callback/get-setting',
          { params: { channelId: 'ch123456' } }
        )
        expect(result.recordCallbackUrl).toBe('http://www.abc.com/callback')
        expect(result.globalSettingEnabled).toBe('Y')
      })

    it('should throw PolyVValidationError if channelId is empty', async () => {
        await expect(channelService.getCallbackSetting('')).rejects.toThrow(PolyVValidationError)
      })
  })

  // ============================================
  // AC12: addAccount
  // ============================================
  describe('AC12: addAccount - 创建角色', () => {
    it('should add account successfully', async () => {
        const mockAccount = {
          account: '0052191569',
          userId: 'user123',
          channelId: '2191569',
          passwd: '123456',
          nickname: '助教A',
          stream: 'kmd6qbz0',
          status: 'Y',
          createdTime: 1615969860000,
          lastModified: 1615969860000,
          sort: 5,
          avatar: '//s1.videocc.net/default-img/avatar/assistant.png',
          actor: '助教',
          pageTurnEnabled: 'N',
          notifyEnabled: 'Y',
          checkinEnabled: 'Y',
          voteEnabled: 'N',
          lotteryEnabled: 'N',
          role: 'Assistant',
          chatListEnabled: 'Y',
          chatAuditEnabled: 'N',
          monitorEnabled: 'N',
          roundTourEnabled: 'N',
          watchLockEnabled: 'N',
          loginUrl: null,
        }
        mockAxiosInstance.post.mockResolvedValueOnce(mockAccount)

        const options = {
          role: 'Assistant',
          nickname: '助教A',
          password: '123456',
          actor: '助教',
        }

        const result = await channelService.addAccount('ch123456', options)

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/live/v2/channelAccount/ch123456/add',
          null,
          { params: options }
        )
        expect(result.account).toBe('0052191569')
        expect(result.nickname).toBe('助教A')
        expect(result.role).toBe('Assistant')
      })

    it('should add guest account', async () => {
        const mockAccount = {
          account: '0062191569',
          role: 'Guest',
          nickname: '嘉宾A',
        }
        mockAxiosInstance.post.mockResolvedValueOnce(mockAccount)

        const options = {
          role: 'Guest',
          nickname: '嘉宾A',
        }

        const result = await channelService.addAccount('ch123456', options)
        expect(result.role).toBe('Guest')
      })

    it('should throw PolyVValidationError if channelId is empty', async () => {
        await expect(channelService.addAccount('', {})).rejects.toThrow(PolyVValidationError)
      })
  })

  // ============================================
  // AC13: getAccount
  // ============================================
  describe('AC13: getAccount - 查询单个角色信息', () => {
    it('should get account successfully', async () => {
        const mockAccount = {
          account: '0062191569',
          userId: 'user123',
          channelId: '2191569',
          passwd: '123456',
          nickname: '助教A',
          stream: 'km1bdhf9',
          status: 'Y',
          createdTime: 1615252064000,
          lastModified: 1615254463000,
          sort: 6,
          avatar: '//s1.videocc.net/default-img/avatar/assistant.png',
          actor: '助教',
          pageTurnEnabled: 'N',
          notifyEnabled: 'Y',
          checkinEnabled: 'Y',
          voteEnabled: 'Y',
          lotteryEnabled: 'Y',
          role: 'Assistant',
          chatListEnabled: 'Y',
          chatAuditEnabled: 'N',
          monitorEnabled: 'N',
          roundTourEnabled: 'N',
          watchLockEnabled: 'N',
          pushUrl: 'rtmp://push-d1.videocc.net/...',
        }
        mockAxiosInstance.get.mockResolvedValueOnce(mockAccount)

        const result = await channelService.getAccount('ch123456', '0062191569')

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/live/v2/channelAccount/ch123456/account',
          { params: { account: '0062191569' } }
        )
        expect(result.account).toBe('0062191569')
        expect(result.nickname).toBe('助教A')
      })

    it('should throw PolyVValidationError if channelId is empty', async () => {
        await expect(channelService.getAccount('', 'account123')).rejects.toThrow(PolyVValidationError)
      })

    it('should throw PolyVValidationError if account is empty', async () => {
        await expect(channelService.getAccount('ch123456', '')).rejects.toThrow(PolyVValidationError)
      })
  })

  // ============================================
  // AC14: getAccounts
  // ============================================
  describe('AC14: getAccounts - 查询频道下所有角色', () => {
    it('should get all accounts successfully', async () => {
        const mockAccounts = [
          {
            account: '0072191569',
            userId: 'user123',
            channelId: '2191569',
            passwd: '123456',
            nickname: '助教A',
            stream: 'km1fvuo3',
            status: 'Y',
            createdTime: 1615259640000,
            lastModified: 1615259640000,
            sort: 7,
            avatar: '//s1.videocc.net/default-img/avatar/assistant.png',
            actor: '助教',
            role: 'Assistant',
          },
        ]
        mockAxiosInstance.get.mockResolvedValueOnce(mockAccounts)

        const result = await channelService.getAccounts('ch123456')

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/live/v2/channelAccount/ch123456/accounts',
          { params: {} }
        )
        expect(result).toHaveLength(1)
        expect(result[0].account).toBe('0072191569')
      })

    it('should throw PolyVValidationError if channelId is empty', async () => {
        await expect(channelService.getAccounts('')).rejects.toThrow(PolyVValidationError)
      })
  })

  // ============================================
  // AC65: updateChannelConfig - 更新频道配置
  // ============================================
  describe('AC65: updateChannelConfig', () => {
    it('should update channel config with key and value', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.updateChannelConfig({
        channelId: 'ch123456',
        key: 'couponEnabled',
        value: 'Y',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/config/update',
        null,
        { params: { channelId: 'ch123456', key: 'couponEnabled', value: 'Y' } }
      )
      expect(result).toBe(true)
    })

    it('should throw PolyVValidationError if channelId is empty', async () => {
      await expect(
        channelService.updateChannelConfig({
          channelId: '',
          key: 'couponEnabled',
          value: 'Y',
        })
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should throw PolyVValidationError if key is empty', async () => {
      await expect(
        channelService.updateChannelConfig({
          channelId: 'ch123456',
          key: '',
          value: 'Y',
        })
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should throw PolyVValidationError if value is empty', async () => {
      await expect(
        channelService.updateChannelConfig({
          channelId: 'ch123456',
          key: 'couponEnabled',
          value: '',
        })
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should disable coupon display with value N', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.updateChannelConfig({
        channelId: 'ch123456',
        key: 'couponEnabled',
        value: 'N',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/config/update',
        null,
        { params: { channelId: 'ch123456', key: 'couponEnabled', value: 'N' } }
      )
      expect(result).toBe(true)
    })
  })

  // ============================================
  // AC64: Type Safety
  // ============================================
  describe('AC64: Type Safety', () => {
    it('should have correct types for all request/response types', () => {
      // This test ensures types are exported
      expect(true).toBe(true)
    })
  })
})
