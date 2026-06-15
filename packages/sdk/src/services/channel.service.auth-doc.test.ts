/**
 * ChannelService Auth + Doc APIs Acceptance Tests (TDD Red Phase)
 *
 * Story 2-2: ChannelService - Auth + Doc APIs
 *
 * These tests define the expected behavior for ChannelService Auth and Doc methods.
 * They will FAIL initially because these methods do not exist yet.
 * This is the TDD "Red" phase - tests define requirements.
 *
 * Acceptance Criteria:
 * - AC1: getChannelApiAccessToken - 获取频道API访问令牌
 * - AC2: getTestModeToken - 获取观看页测试模式令牌
 * - AC3: getDocList - 查询频道文档列表
 * - AC4: uploadDoc - 上传文档
 * - AC5: deleteDocument - 删除文档
 * - AC6: getDocConvertStatus - 查询文档转码状态
 * - AC7: updateTeacherDocRelation - 讲师文档关系管理
 * - AC8: getChannelMultimediaResourceList - 查询频道关联音视频列表
 * - AC9: getChannelMultimediaResourceDetail - 查询频道关联音视频详情
 * - AC10: linkChannelMultimediaResource - 关联音视频到频道
 * - AC11: unlinkChannelMultimediaResource - 取消频道关联音视频
 * - AC12: getUserMultimediaResourceDetail - 查询用户音视频详情
 * - AC13: deleteUserMultimediaResource - 删除用户音视频
 * - AC14: Type Safety - 类型安全
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { PolyVClient } from '../client.js'
import { ChannelService } from './channel.service.js'
import type {
  ChannelApiTokenResponse,
  GetChannelApiTokenRequest,
  GetTestModeTokenRequest,
  DocStatus,
  DocConvertType,
  DocType,
  DocModel,
  DocListResponse,
  UploadDocRequest,
  UploadDocResponse,
  DocConvertStatusItem,
  MultimediaResourceVidListResponse,
  MultimediaResourceDetailResponse,
  UserMultimediaResourceResponse,
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

const mockChannelTokenResponse: ChannelApiTokenResponse = {
  channelToken: 'test-channel-token-abc123',
  expireTime: 1709875200,
}

const mockTestModeTokenResponse = 'test-mode-token-xyz789'

const mockDocModel: DocModel = {
  fileId: 'file123',
  fileName: 'presentation.pdf',
  fileType: 'pdf',
  totalPage: 20,
  status: 'normal',
  createTime: 1709875200000,
  convertType: 'common',
  type: 'new',
}

const mockDocListResponse: DocListResponse = {
  contents: [mockDocModel],
  total: 1,
  page: 1,
  limit: 10,
}

const mockUploadDocResponse: UploadDocResponse = {
  type: 'new',
  fileId: 'file456',
  status: 'waitConvert',
}

const mockDocConvertStatusItem: DocConvertStatusItem = {
  fileId: 'file123',
  convertStatus: 'success',
  type: 'new',
  imageCount: 20,
  images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
  smallImages: ['https://example.com/small1.jpg', 'https://example.com/small2.jpg'],
  totalPage: 20,
  htmlUrl: 'https://example.com/doc.html',
}

const mockMultimediaVidListResponse: MultimediaResourceVidListResponse = {
  contents: ['vid1', 'vid2', 'vid3'],
  total: 3,
  pageNumber: 1,
  pageSize: 10,
}

const mockMultimediaDetailResponse: MultimediaResourceDetailResponse = {
  contents: [
    {
      id: 1,
      channelId: 'ch123456',
      vid: 'vid1',
      title: 'Test Video',
      status: 'active',
      url: 'https://example.com/video.mp4',
    },
  ],
  total: 1,
  pageNumber: 1,
  pageSize: 10,
}

const mockUserMultimediaResponse: UserMultimediaResourceResponse = [
  {
    vid: 'vid1',
    title: 'User Video',
    status: 61,
    createTime: '2026-03-05 14:53:20',
  },
]

describe('ChannelService Auth + Doc APIs', () => {
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
  // AC1: getChannelApiAccessToken
  // ============================================
  describe('AC1: getChannelApiAccessToken', () => {
    it('should get channel API access token with default options', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(mockChannelTokenResponse)

      const result = await channelService.getChannelApiAccessToken('ch123456')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/common/token/get-channel-token',
        null,
        { params: { channelId: 'ch123456' } }
      )
      expect(result.channelToken).toBe('test-channel-token-abc123')
      expect(result.expireTime).toBe(1709875200)
    })

    it('should get channel API access token with custom expireSeconds', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(mockChannelTokenResponse)

      const options: GetChannelApiTokenRequest = { expireSeconds: 7200 }
      await channelService.getChannelApiAccessToken('ch123456', options)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/common/token/get-channel-token',
        null,
        { params: { channelId: 'ch123456', expireSeconds: 7200 } }
      )
    })

    it('should get disposable channel API access token', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(mockChannelTokenResponse)

      const options: GetChannelApiTokenRequest = { disposable: true }
      await channelService.getChannelApiAccessToken('ch123456', options)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/common/token/get-channel-token',
        null,
        { params: { channelId: 'ch123456', disposable: true } }
      )
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.getChannelApiAccessToken('')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC2: getTestModeToken
  // ============================================
  describe('AC2: getTestModeToken', () => {
    it('should get test mode token with default options', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(mockTestModeTokenResponse)

      const result = await channelService.getTestModeToken('ch123456')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/watch/get-test-mode-token',
        null,
        { params: { channelId: 'ch123456' } }
      )
      expect(result).toBe('test-mode-token-xyz789')
    })

    it('should get test mode token with custom expireTime', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(mockTestModeTokenResponse)

      const options: GetTestModeTokenRequest = { expireTime: 7200 }
      await channelService.getTestModeToken('ch123456', options)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/watch/get-test-mode-token',
        null,
        { params: { channelId: 'ch123456', expireTime: 7200 } }
      )
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.getTestModeToken('')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC3: getDocList
  // ============================================
  describe('AC3: getDocList', () => {
    it('should get doc list by channelId', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockDocListResponse)

      const result = await channelService.getDocList({ channelId: 'ch123456' })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/document/doc-list',
        { params: { channelId: 'ch123456' } }
      )
      expect(result.contents).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('should get doc list by teacherId', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockDocListResponse)

      await channelService.getDocList({ teacherId: 'teacher123' })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/document/doc-list',
        { params: { teacherId: 'teacher123' } }
      )
    })

    it('should filter doc list by status', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockDocListResponse)

      await channelService.getDocList({ channelId: 'ch123456', status: 'normal' })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/document/doc-list',
        { params: { channelId: 'ch123456', status: 'normal' } }
      )
    })

    it('should support pagination parameters', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockDocListResponse)

      await channelService.getDocList({ channelId: 'ch123456', page: 2, limit: 20 })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/document/doc-list',
        { params: { channelId: 'ch123456', page: 2, limit: 20 } }
      )
    })
  })

  // ============================================
  // AC4: uploadDoc
  // ============================================
  describe('AC4: uploadDoc', () => {
    it('should upload document from URL', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(mockUploadDocResponse)

      const options: UploadDocRequest = {
        url: 'https://example.com/document.pdf',
        docName: 'My Document',
      }
      const result = await channelService.uploadDoc('ch123456', options)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/document/upload-doc',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-Skip-Auth': 'true',
          },
        })
      )
      expect(result.fileId).toBe('file456')
      expect(result.status).toBe('waitConvert')
    })

    it('should upload document with type parameter', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(mockUploadDocResponse)

      const options: UploadDocRequest = {
        url: 'https://example.com/document.pdf',
        type: 'new',
      }
      await channelService.uploadDoc('ch123456', options)

      expect(mockAxiosInstance.post).toHaveBeenCalled()
    })

    it('should validate channelId is required', async () => {
      const options: UploadDocRequest = { url: 'https://example.com/doc.pdf' }
      await expect(channelService.uploadDoc('', options)).rejects.toThrow(PolyVValidationError)
    })

    it('should validate file or url is required', async () => {
      const options: UploadDocRequest = {}
      await expect(channelService.uploadDoc('ch123456', options)).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC5: deleteDocument
  // ============================================
  describe('AC5: deleteDocument', () => {
    it('should delete document successfully', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.deleteDocument('ch123456', 'file123', 'new')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/document/delete',
        null,
        { params: { channelId: 'ch123456', fileId: 'file123', type: 'new' } }
      )
      expect(result).toBe(true)
    })

    it('should support multiple fileIds (comma-separated)', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      await channelService.deleteDocument('ch123456', 'file1,file2,file3', 'new')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/document/delete',
        null,
        { params: { channelId: 'ch123456', fileId: 'file1,file2,file3', type: 'new' } }
      )
    })

    it('should validate required parameters', async () => {
      await expect(channelService.deleteDocument('', 'file123', 'new')).rejects.toThrow(PolyVValidationError)
      await expect(channelService.deleteDocument('ch123456', '', 'new')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC6: getDocConvertStatus
  // ============================================
  describe('AC6: getDocConvertStatus', () => {
    it('should get document convert status', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce([mockDocConvertStatusItem])

      const result = await channelService.getDocConvertStatus('ch123456', 'file123')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/document/status/get',
        { params: { channelId: 'ch123456', fileId: 'file123' } }
      )
      expect(result).toHaveLength(1)
      expect(result[0].fileId).toBe('file123')
      expect(result[0].convertStatus).toBe('success')
    })

    it('should support multiple fileIds', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce([mockDocConvertStatusItem])

      await channelService.getDocConvertStatus('ch123456', 'file1,file2')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/document/status/get',
        { params: { channelId: 'ch123456', fileId: 'file1,file2' } }
      )
    })

    it('should validate channelId and fileId are required', async () => {
      await expect(channelService.getDocConvertStatus('', 'file123')).rejects.toThrow(PolyVValidationError)
      await expect(channelService.getDocConvertStatus('ch123456', '')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC7: updateTeacherDocRelation
  // ============================================
  describe('AC7: updateTeacherDocRelation', () => {
    it('should add teacher-doc relation (operation=1)', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.updateTeacherDocRelation('teacher123', 'file1,file2', 1)

      // fileIds is in body, other params in query
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v4/channel/doc/teacher/update-relation',
        { fileIds: 'file1,file2' },
        { params: { teacherId: 'teacher123', operation: 1 } }
      )
      expect(result).toBe(true)
    })

    it('should remove teacher-doc relation (operation=2)', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.updateTeacherDocRelation('teacher123', 'file1', 2)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v4/channel/doc/teacher/update-relation',
        { fileIds: 'file1' },
        { params: { teacherId: 'teacher123', operation: 2 } }
      )
      expect(result).toBe(true)
    })

    it('should validate required parameters', async () => {
      await expect(channelService.updateTeacherDocRelation('', 'file1', 1)).rejects.toThrow(PolyVValidationError)
      await expect(channelService.updateTeacherDocRelation('teacher123', '', 1)).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC8: getChannelMultimediaResourceList
  // ============================================
  describe('AC8: getChannelMultimediaResourceList', () => {
    it('should get channel multimedia resource VID list', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockMultimediaVidListResponse)

      const result = await channelService.getChannelMultimediaResourceList('ch123456')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v4/channel/multimedia/resource/list-vids',
        { params: { channelId: 'ch123456' } }
      )
      expect(result.contents).toEqual(['vid1', 'vid2', 'vid3'])
      expect(result.total).toBe(3)
    })

    it('should support pagination parameters', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockMultimediaVidListResponse)

      await channelService.getChannelMultimediaResourceList('ch123456', { pageNumber: 2, pageSize: 20 })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v4/channel/multimedia/resource/list-vids',
        { params: { channelId: 'ch123456', pageNumber: 2, pageSize: 20 } }
      )
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.getChannelMultimediaResourceList('')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC9: getChannelMultimediaResourceDetail
  // ============================================
  describe('AC9: getChannelMultimediaResourceDetail', () => {
    it('should get channel multimedia resource details', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockMultimediaDetailResponse)

      const result = await channelService.getChannelMultimediaResourceDetail('ch123456')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v4/channel/multimedia/resource/list',
        { params: { channelId: 'ch123456' } }
      )
      expect(result.contents).toHaveLength(1)
      expect(result.contents[0].vid).toBe('vid1')
      expect(result.contents[0].title).toBe('Test Video')
    })

    it('should support pagination parameters', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockMultimediaDetailResponse)

      await channelService.getChannelMultimediaResourceDetail('ch123456', { pageNumber: 1, pageSize: 50 })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v4/channel/multimedia/resource/list',
        { params: { channelId: 'ch123456', pageNumber: 1, pageSize: 50 } }
      )
    })
  })

  // ============================================
  // AC10: linkChannelMultimediaResource
  // ============================================
  describe('AC10: linkChannelMultimediaResource', () => {
    it('should link multimedia resources to channel', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.linkChannelMultimediaResource('ch123456', 'vid1')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v4/channel/multimedia/resource/save-batch',
        null,
        { params: { channelId: 'ch123456', vids: 'vid1' } }
      )
      expect(result).toBe(true)
    })

    it('should support multiple vids (comma-separated)', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      await channelService.linkChannelMultimediaResource('ch123456', 'vid1,vid2,vid3')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v4/channel/multimedia/resource/save-batch',
        null,
        { params: { channelId: 'ch123456', vids: 'vid1,vid2,vid3' } }
      )
    })

    it('should validate required parameters', async () => {
      await expect(channelService.linkChannelMultimediaResource('', 'vid1')).rejects.toThrow(PolyVValidationError)
      await expect(channelService.linkChannelMultimediaResource('ch123456', '')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC11: unlinkChannelMultimediaResource
  // ============================================
  describe('AC11: unlinkChannelMultimediaResource', () => {
    it('should unlink multimedia resources from channel', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.unlinkChannelMultimediaResource('ch123456', 'vid1')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v4/channel/multimedia/resource/delete-batch',
        null,
        { params: { channelId: 'ch123456', vids: 'vid1' } }
      )
      expect(result).toBe(true)
    })

    it('should support multiple vids (comma-separated)', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      await channelService.unlinkChannelMultimediaResource('ch123456', 'vid1,vid2')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v4/channel/multimedia/resource/delete-batch',
        null,
        { params: { channelId: 'ch123456', vids: 'vid1,vid2' } }
      )
    })

    it('should validate required parameters', async () => {
      await expect(channelService.unlinkChannelMultimediaResource('', 'vid1')).rejects.toThrow(PolyVValidationError)
      await expect(channelService.unlinkChannelMultimediaResource('ch123456', '')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC12: getUserMultimediaResourceDetail
  // ============================================
  describe('AC12: getUserMultimediaResourceDetail', () => {
    it('should get user multimedia resource details', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockUserMultimediaResponse)

      const result = await channelService.getUserMultimediaResourceDetail('vid1')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v4/user/multimedia/resource/list',
        { params: { vids: 'vid1' } }
      )
      expect(result).toHaveLength(1)
      expect(result[0].vid).toBe('vid1')
      expect(result[0].title).toBe('User Video')
    })

    it('should support multiple vids (up to 100)', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockUserMultimediaResponse)

      await channelService.getUserMultimediaResourceDetail('vid1,vid2,vid3')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v4/user/multimedia/resource/list',
        { params: { vids: 'vid1,vid2,vid3' } }
      )
    })

    it('should validate vids is required', async () => {
      await expect(channelService.getUserMultimediaResourceDetail('')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC13: deleteUserMultimediaResource
  // ============================================
  describe('AC13: deleteUserMultimediaResource', () => {
    it('should delete user multimedia resources', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.deleteUserMultimediaResource('vid1')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v4/user/multimedia/resource/delete-batch',
        null,
        { params: { vids: 'vid1' } }
      )
      expect(result).toBe(true)
    })

    it('should support multiple vids (up to 100)', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      await channelService.deleteUserMultimediaResource('vid1,vid2')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v4/user/multimedia/resource/delete-batch',
        null,
        { params: { vids: 'vid1,vid2' } }
      )
    })

    it('should validate vids is required', async () => {
      await expect(channelService.deleteUserMultimediaResource('')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC14: Type Safety
  // ============================================
  describe('AC14: Type Safety', () => {
    it('should have correct type for ChannelApiTokenResponse', () => {
      const response: ChannelApiTokenResponse = mockChannelTokenResponse
      expect(response.channelToken).toBeDefined()
      expect(response.expireTime).toBeDefined()
    })

    it('should have correct type for GetChannelApiTokenRequest', () => {
      const request: GetChannelApiTokenRequest = {
        disposable: true,
        expireSeconds: 7200,
      }
      expect(request.disposable).toBe(true)
      expect(request.expireSeconds).toBe(7200)
    })

    it('should have correct type for DocModel', () => {
      const doc: DocModel = mockDocModel
      expect(doc.fileId).toBeDefined()
      expect(doc.fileName).toBeDefined()
      expect(doc.status).toBeDefined()
    })

    it('should define DocStatus enum values', () => {
      const statuses: DocStatus[] = ['normal', 'waitUpload', 'failUpload', 'waitConvert', 'failConvert']
      expect(statuses).toContain('normal')
      expect(statuses).toContain('waitConvert')
    })

    it('should define DocConvertType enum values', () => {
      const types: DocConvertType[] = ['common', 'animate']
      expect(types).toContain('common')
      expect(types).toContain('animate')
    })

    it('should define DocType enum values', () => {
      const types: DocType[] = ['old', 'new']
      expect(types).toContain('old')
      expect(types).toContain('new')
    })

    it('should have correct type for UploadDocRequest', () => {
      const request: UploadDocRequest = {
        url: 'https://example.com/doc.pdf',
        type: 'new',
        docName: 'Test Doc',
        callbackUrl: 'https://example.com/callback',
      }
      expect(request.url).toBe('https://example.com/doc.pdf')
      expect(request.type).toBe('new')
    })

    it('should have correct type for DocConvertStatusItem', () => {
      const item: DocConvertStatusItem = mockDocConvertStatusItem
      expect(item.fileId).toBeDefined()
      expect(item.convertStatus).toBeDefined()
      expect(item.images).toBeDefined()
      expect(item.htmlUrl).toBeDefined()
    })

    it('should have correct type for MultimediaResourceDetailItem', () => {
      const item = mockMultimediaDetailResponse.contents[0]
      expect(item.id).toBeDefined()
      expect(item.channelId).toBeDefined()
      expect(item.vid).toBeDefined()
      expect(item.title).toBeDefined()
      expect(item.status).toBeDefined()
      expect(item.url).toBeDefined()
    })

    it('should have correct type for UserMultimediaResourceItem', () => {
      const item = mockUserMultimediaResponse[0]
      expect(item.vid).toBeDefined()
      expect(item.title).toBeDefined()
      expect(item.status).toBeDefined()
      expect(item.createTime).toBeDefined()
    })
  })
})
