/**
 * ChannelService Playback + Player APIs Acceptance Tests
 *
 * Story 2-4: ChannelService - Playback + Player APIs
 *
 * These tests verify the expected behavior for ChannelService playback and player methods.
 * All 26 API methods are tested for correct request/response handling and parameter validation.
 *
 * Acceptance Criteria:
 * - AC1: getPlaybackList - retrieves paginated playback video list
 * - AC2: deletePlayback - deletes a playback video
 * - AC3: getChannelSessions - retrieves channel session list
 * - AC4: getRecordFile - retrieves record files
 * - AC5: getRecordInfo - retrieves record info
 * - AC6: deleteRecord - deletes a record
 * - AC7: setRecordDefault - sets default record
 * - AC8: setRecordSetting - sets record settings
 * - AC9: getPlaybackEnabled - gets playback enabled status
 * - AC10: setPlaybackEnabled - sets playback enabled status
 * - AC11: getPlaybackSetting - gets playback settings
 * - AC12: setPlaybackSort - sets playback sort order
 * - AC13: setPlaybackSingleSort - sets single video sort
 * - AC14: updatePlaybackTitle - updates playback title
 * - AC15: addVodPlayback - adds VOD as playback
 * - AC16: clipRecordFile - clips record file
 * - AC17: recordConvert - converts record (sync)
 * - AC18: recordConvertAsync - converts record (async)
 * - AC19: recordFileMerge - merges records (sync)
 * - AC20: recordFileMergeAsync - merges records (async)
 * - AC21: recordMergeMp4 - merges to MP4
 * - AC22: recordMergeMp4Start - starts MP4 merge
 * - AC23: recordAddBreakpoint - adds breakpoint
 * - AC24: updatePlayerLogo - updates player logo settings
 * - AC25: updatePlayerHead - updates player head image settings
 * - AC26: updatePlayerStop - updates player stop image settings
 * - AC27: Type Safety - all requests/responses have complete type definitions
 * - AC28: Parameter Validation - all methods use PolyVValidationError
 * - AC29: JSDoc Documentation - all methods include documentation with examples
 * - AC30: Test Coverage - all methods have corresponding test cases
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { PolyVClient } from '../client.js'
import { ChannelService } from './channel.service.js'
import type {
  PlaybackListResponse,
  PlaybackVideoItem,
  ChannelSession,
  ChannelSessionsResponse,
  RecordFileResponse,
  ListRecordFilesResponse,
  RecordInfo,
  PlaybackEnabledResponse,
  PlaybackSettingResponse,
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

const mockPlaybackVideoItem: PlaybackVideoItem = {
  videoId: 'vid123',
  channelId: 'ch123456',
  title: 'Test Playback',
  startTime: '2024-03-01 10:00:00',
  endTime: '2024-03-01 11:00:00',
  fileSize: 1024000,
  duration: 3600,
  status: 'processed',
  url: 'https://example.com/playback.mp4',
}

const mockPlaybackListResponse: PlaybackListResponse = {
  contents: [mockPlaybackVideoItem],
  total: 1,
  pageSize: 10,
  pageNumber: 1,
}

const mockChannelSession: ChannelSession = {
  sessionId: 'session123',
  startTime: '2024-03-01 10:00:00',
  endTime: '2024-03-01 11:00:00',
  duration: 3600,
}

const mockRecordFileResponse: RecordFileResponse = {
  fileId: 'file123',
  userId: 'user123',
  channelId: 'ch123456',
  startTime: '20240301100000',
  endTime: '20240301110000',
  filename: 'record.mp4',
  filesize: 1024000,
  createdTime: 1709262000000,
  width: 1280,
  height: 720,
  duration: 3600,
  bitrate: 0,
  mp4: 'https://example.com/record.mp4',
  m3u8: 'https://example.com/record.m3u8',
  channelSessionId: 'session123',
  liveType: 'ppt',
  daysLeft: 7,
}

const mockRecordInfo: RecordInfo = {
  fileId: 'file123',
  channelId: 'ch123456',
  sessionId: 'session123',
  startTime: '2024-03-01 10:00:00',
  endTime: '2024-03-01 11:00:00',
  fileSize: 1024000,
  duration: 3600,
  url: 'https://example.com/record.mp4',
}

const mockPlaybackEnabledResponse: PlaybackEnabledResponse = {
  enabled: true,
}

const mockPlaybackSettingResponse: PlaybackSettingResponse = {
  sortType: 'time',
  autoPublish: true,
}

describe('ChannelService Playback + Player APIs', () => {
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
  // Historical playback APIs
  // ============================================
  describe('Historical playback APIs from channel/playback docs', () => {
    it('should list channel sessions through /live/v3/channel/session/list', async () => {
      const mockResponse: ChannelSessionsResponse = {
        pageSize: 10,
        pageNumber: 1,
        totalItems: 1,
        contents: [{
          sessionId: 'session123',
          channelId: 'ch123456',
          userId: 'user123',
          startTime: 1709875200000,
          endTime: 1709878800000,
        }],
        startRow: 1,
        firstPage: true,
        lastPage: true,
        prePageNumber: 0,
        nextPageNumber: 0,
        limit: 10,
        totalPages: 1,
        endRow: 1,
        offset: 0,
      }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await channelService.listChannelSessions({
        channelId: 'ch123456',
        startDate: '2024-03-01',
        endDate: '2024-03-02',
        page: 1,
        pageSize: 10,
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/session/list',
        {
          params: {
            channelId: 'ch123456',
            startDate: '2024-03-01',
            endDate: '2024-03-02',
            page: 1,
            pageSize: 10,
          },
        }
      )
      expect(result.contents[0].sessionId).toBe('session123')
    })

    it('should list historical record files through /live/v2/channels/{channelId}/recordFiles', async () => {
      const mockResponse: ListRecordFilesResponse = [{
        channelId: 'ch123456',
        fileId: 'file123',
        url: 'https://example.com/record.mp4',
        startTime: '20240301100000',
        endTime: '20240301110000',
        fileSize: 1024000,
        duration: 3600,
        bitrate: 1024,
        resolution: '1280x720',
        channelSessionId: 'session123',
        fileName: 'record.mp4',
        daysLeft: -1,
      }]
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await channelService.listRecordFiles({
        channelId: 'ch123456',
        userId: 'user123',
        startDate: '2024-03-01',
        endDate: '2024-03-02',
        sessionIds: 'session123',
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v2/channels/ch123456/recordFiles',
        {
          params: {
            userId: 'user123',
            startDate: '2024-03-01',
            endDate: '2024-03-02',
            sessionIds: 'session123',
          },
        }
      )
      expect(result[0].fileId).toBe('file123')
    })

    it('should merge historical record files by fileIds', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce('https://example.com/merged.mp4')

      const result = await channelService.mergeRecordFiles({
        channelId: 'ch123456',
        fileIds: ['file1', 'file2'],
        fileName: 'merged',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channel/recordFile/ch123456/merge',
        null,
        { params: { fileIds: 'file1,file2', fileName: 'merged' } }
      )
      expect(result).toBe('https://example.com/merged.mp4')
    })

    it('should add VOD video to playback library', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(mockPlaybackVideoItem)

      const result = await channelService.addVodPlaybackToLibrary({
        channelId: 'ch123456',
        vid: 'vod123',
        setAsDefault: 'Y',
        listType: 'vod',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/playback/add',
        null,
        {
          params: {
            channelId: 'ch123456',
            vid: 'vod123',
            setAsDefault: 'Y',
            listType: 'vod',
          },
        }
      )
      expect(result.videoId).toBe('vid123')
    })

    it('should delete historical record file by sessionId', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce('')

      await channelService.deleteRecordFile({
        channelId: 'ch123456',
        sessionId: 'session123',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channel/recordFile/ch123456/delete-record',
        null,
        { params: { sessionId: 'session123' } }
      )
    })

    it('should convert historical record file to VOD', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce('vod123')

      const result = await channelService.convertRecordFileToVod({
        channelId: 'ch123456',
        userId: 'user123',
        fileName: 'converted',
        sessionId: 'session123',
        toPlayList: 'Y',
        setAsDefault: 'N',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channel/recordFile/ch123456/convert',
        null,
        {
          params: {
            userId: 'user123',
            fileName: 'converted',
            sessionId: 'session123',
            toPlayList: 'Y',
            setAsDefault: 'N',
          },
        }
      )
      expect(result).toBe('vod123')
    })

    it('should set playback enabled by user scope', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce('ch123456')

      const result = await channelService.setUserPlaybackEnabled({
        userId: 'user123',
        channelId: 'ch123456',
        playBackEnabled: 'Y',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channelSetting/user123/setPlayBackEnabled',
        null,
        { params: { playBackEnabled: 'Y', channelId: 'ch123456' } }
      )
      expect(result).toBe('ch123456')
    })

    it('should move playback video up or down', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce('')

      await channelService.movePlaybackVideo({
        channelId: 'ch123456',
        videoId: 'vid123',
        type: 'up',
        listType: 'playback',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/playback/single-sort',
        null,
        {
          params: {
            channelId: 'ch123456',
            videoId: 'vid123',
            type: 'up',
            listType: 'playback',
          },
        }
      )
    })

    it('should set default playback video', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce('success')

      const result = await channelService.setDefaultPlaybackVideo({
        channelId: 'ch123456',
        videoId: 'vid123',
        listType: 'vod',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channel/recordFile/ch123456/playback/set-Default',
        null,
        { params: { videoId: 'vid123', listType: 'vod' } }
      )
      expect(result).toBe('success')
    })

    it('should sort playback videos with JSON body and signed query params', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce('')

      await channelService.sortPlaybackVideos({
        channelId: 'ch123456',
        listType: 'vod',
        videoIds: ['vid1', 'vid2'],
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/playback/sort',
        { videoIds: ['vid1', 'vid2'] },
        { params: { channelId: 'ch123456', listType: 'vod' } }
      )
    })

    it('should validate historical playback params', async () => {
      await expect(channelService.listChannelSessions({ channelId: '' })).rejects.toThrow(PolyVValidationError)
      await expect(channelService.listRecordFiles({
        channelId: 'ch123456',
        userId: 'user123',
        startDate: '2024-03-01',
      })).rejects.toThrow(PolyVValidationError)
      await expect(channelService.mergeRecordFiles({ channelId: 'ch123456' })).rejects.toThrow(PolyVValidationError)
      await expect(channelService.deleteRecordFile({ channelId: 'ch123456' })).rejects.toThrow(PolyVValidationError)
      await expect(channelService.setUserPlaybackEnabled({
        userId: 'user123',
        playBackEnabled: 'INVALID' as 'Y',
      })).rejects.toThrow(PolyVValidationError)
      await expect(channelService.movePlaybackVideo({
        channelId: 'ch123456',
        videoId: 'vid123',
        type: 'left' as 'up',
      })).rejects.toThrow(PolyVValidationError)
      await expect(channelService.sortPlaybackVideos({
        channelId: 'ch123456',
        videoIds: [],
      })).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC1: getPlaybackList
  // ============================================
  describe('AC1: getPlaybackList - Get Playback Video List', () => {
    it('should retrieve paginated playback video list', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockPlaybackListResponse)

      const result = await channelService.getPlaybackList('ch123456')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v2/channel/recordFile/ch123456/playback/list',
        { params: {} }
      )
      expect(result.contents).toHaveLength(1)
      expect(result.contents[0].videoId).toBe('vid123')
    })

    it('should support pagination parameters', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockPlaybackListResponse)

      await channelService.getPlaybackList('ch123456', { page: 2, pageSize: 20 })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v2/channel/recordFile/ch123456/playback/list',
        { params: { page: 2, pageSize: 20 } }
      )
    })

    it('should support listType parameter', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockPlaybackListResponse)

      await channelService.getPlaybackList('ch123456', { listType: 'vod' })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v2/channel/recordFile/ch123456/playback/list',
        { params: { listType: 'vod' } }
      )
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.getPlaybackList('')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC2: deletePlayback
  // ============================================
  describe('AC2: deletePlayback - Delete Playback Video', () => {
    it('should delete a playback video', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.deletePlayback('ch123456', 'vid123')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channel/recordFile/ch123456/playback/delete',
        null,
        { params: { videoId: 'vid123' } }
      )
      expect(result).toBe(true)
    })

    it('should support listType parameter', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      await channelService.deletePlayback('ch123456', 'vid123', 'vod')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channel/recordFile/ch123456/playback/delete',
        null,
        { params: { videoId: 'vid123', listType: 'vod' } }
      )
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.deletePlayback('', 'vid123')).rejects.toThrow(PolyVValidationError)
    })

    it('should validate videoId is required', async () => {
      await expect(channelService.deletePlayback('ch123456', '')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC3: getChannelSessions
  // ============================================
  describe('AC3: getChannelSessions - Get Channel Sessions', () => {
    it('should retrieve channel session list', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce([mockChannelSession])

      const result = await channelService.getChannelSessions('ch123456')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v2/channel/recordFile/ch123456/sessions'
      )
      expect(result).toHaveLength(1)
      expect(result[0].sessionId).toBe('session123')
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.getChannelSessions('')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC4: getRecordFile
  // ============================================
  describe('AC4: getRecordFile - Get Record File', () => {
    it('should retrieve a record file by file ID', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockRecordFileResponse)

      const result = await channelService.getRecordFile('ch123456', 'file123')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/record/get',
        { params: { channelId: 'ch123456', fileId: 'file123' } }
      )
      expect(result.fileId).toBe('file123')
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.getRecordFile('', 'file123')).rejects.toThrow(PolyVValidationError)
    })

    it('should validate fileId is required', async () => {
      await expect(channelService.getRecordFile('ch123456', '')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC5: getRecordInfo
  // ============================================
  describe('AC5: getRecordInfo - Get Record Info', () => {
    it('should retrieve record info by sessionId', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockRecordInfo)

      const result = await channelService.getRecordInfo('ch123456', 'session123')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/record/info',
        { params: { channelId: 'ch123456', sessionId: 'session123' } }
      )
      expect(result.fileId).toBe('file123')
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.getRecordInfo('', 'session123')).rejects.toThrow(PolyVValidationError)
    })

    it('should validate sessionId is required', async () => {
      await expect(channelService.getRecordInfo('ch123456', '')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC6: deleteRecord
  // ============================================
  describe('AC6: deleteRecord - Delete Record', () => {
    it('should delete a record', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.deleteRecord('ch123456', 'file123')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/record/delete',
        null,
        { params: { channelId: 'ch123456', fileId: 'file123' } }
      )
      expect(result).toBe(true)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.deleteRecord('', 'file123')).rejects.toThrow(PolyVValidationError)
    })

    it('should validate fileId is required', async () => {
      await expect(channelService.deleteRecord('ch123456', '')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC7: setRecordDefault
  // ============================================
  describe('AC7: setRecordDefault - Set Default Record', () => {
    it('should set default record', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.setRecordDefault('ch123456', 'file123')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/record/set-default',
        null,
        { params: { channelId: 'ch123456', fileId: 'file123' } }
      )
      expect(result).toBe(true)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.setRecordDefault('', 'file123')).rejects.toThrow(PolyVValidationError)
    })

    it('should validate fileId is required', async () => {
      await expect(channelService.setRecordDefault('ch123456', '')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC8: setRecordSetting
  // ============================================
  describe('AC8: setRecordSetting - Set Record Settings', () => {
    it('should set record settings', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.setRecordSetting('ch123456', {
        enabled: true,
        type: 'video',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/record/set-setting',
        null,
        { params: { channelId: 'ch123456', enabled: true, type: 'video' } }
      )
      expect(result).toBe(true)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.setRecordSetting('', { enabled: true })).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC9: getPlaybackEnabled
  // ============================================
  describe('AC9: getPlaybackEnabled - Get Playback Enabled Status', () => {
    it('should get playback enabled status', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockPlaybackEnabledResponse)

      const result = await channelService.getPlaybackEnabled('ch123456')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/playback/get-enabled',
        { params: { channelId: 'ch123456' } }
      )
      expect(result.enabled).toBe(true)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.getPlaybackEnabled('')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC10: setPlaybackEnabled
  // ============================================
  describe('AC10: setPlaybackEnabled - Set Playback Enabled Status', () => {
    it('should enable playback', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.setPlaybackEnabled('ch123456', true)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/playback/set-enabled',
        null,
        { params: { channelId: 'ch123456', enabled: 'Y' } }
      )
      expect(result).toBe(true)
    })

    it('should disable playback', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.setPlaybackEnabled('ch123456', false)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/playback/set-enabled',
        null,
        { params: { channelId: 'ch123456', enabled: 'N' } }
      )
      expect(result).toBe(true)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.setPlaybackEnabled('', true)).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC11: getPlaybackSetting
  // ============================================
  describe('AC11: getPlaybackSetting - Get Playback Settings', () => {
    it('should get playback settings', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(mockPlaybackSettingResponse)

      const result = await channelService.getPlaybackSetting('ch123456')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/playback/get-setting',
        { params: { channelId: 'ch123456' } }
      )
      expect(result.sortType).toBe('time')
      expect(result.autoPublish).toBe(true)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.getPlaybackSetting('')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC12: setPlaybackSort
  // ============================================
  describe('AC12: setPlaybackSort - Set Playback Sort Order', () => {
    it('should set playback sort order for multiple videos', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.setPlaybackSort('ch123456', ['vid1', 'vid2', 'vid3'])

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/playback/set-sort',
        { videoIds: 'vid1,vid2,vid3' },
        { params: { channelId: 'ch123456' } }
      )
      expect(result).toBe(true)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.setPlaybackSort('', ['vid1'])).rejects.toThrow(PolyVValidationError)
    })

    it('should validate videoIds is not empty', async () => {
      await expect(channelService.setPlaybackSort('ch123456', [])).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC13: setPlaybackSingleSort
  // ============================================
  describe('AC13: setPlaybackSingleSort - Set Single Video Sort', () => {
    it('should set sort for a single video', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.setPlaybackSingleSort('ch123456', 'vid123', 1)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/playback/set-single-sort',
        null,
        { params: { channelId: 'ch123456', videoId: 'vid123', rank: 1 } }
      )
      expect(result).toBe(true)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.setPlaybackSingleSort('', 'vid123', 1)).rejects.toThrow(PolyVValidationError)
    })

    it('should validate videoId is required', async () => {
      await expect(channelService.setPlaybackSingleSort('ch123456', '', 1)).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC14: updatePlaybackTitle
  // ============================================
  describe('AC14: updatePlaybackTitle - Update Playback Title', () => {
    it('should update playback video title', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.updatePlaybackTitle('ch123456', 'vid123', 'New Title')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/playback/update-title',
        null,
        { params: { channelId: 'ch123456', videoId: 'vid123', title: 'New Title' } }
      )
      expect(result).toBe(true)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.updatePlaybackTitle('', 'vid123', 'Title')).rejects.toThrow(PolyVValidationError)
    })

    it('should validate videoId is required', async () => {
      await expect(channelService.updatePlaybackTitle('ch123456', '', 'Title')).rejects.toThrow(PolyVValidationError)
    })

    it('should validate title is required', async () => {
      await expect(channelService.updatePlaybackTitle('ch123456', 'vid123', '')).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC15: addVodPlayback
  // ============================================
  describe('AC15: addVodPlayback - Add VOD as Playback', () => {
    it('should add VOD video as playback', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.addVodPlayback('ch123456', {
        vid: 'vod123',
        title: 'My VOD',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/playback/add-vod',
        null,
        { params: { channelId: 'ch123456', vid: 'vod123', title: 'My VOD' } }
      )
      expect(result).toBe(true)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.addVodPlayback('', { vid: 'vod123' })).rejects.toThrow(PolyVValidationError)
    })

    it('should validate vid is required', async () => {
      await expect(channelService.addVodPlayback('ch123456', { vid: '' })).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC16: clipRecordFile
  // ============================================
  describe('AC16: clipRecordFile - Clip Record File', () => {
    it('should clip record file', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ fileId: 'newFile123' })

      const result = await channelService.clipRecordFile('ch123456', {
        fileId: 'file123',
        startTime: 0,
        endTime: 1800,
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/record/clip',
        null,
        { params: { channelId: 'ch123456', fileId: 'file123', startTime: 0, endTime: 1800 } }
      )
      expect(result.fileId).toBe('newFile123')
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.clipRecordFile('', { fileId: 'file123', startTime: 0, endTime: 1800 })).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC17: recordConvert
  // ============================================
  describe('AC17: recordConvert - Convert Record (Sync)', () => {
    it('should convert record synchronously via v2 endpoint with sessionId', async () => {
      // Interceptor unwraps the envelope; on success `data` is the vid string.
      mockAxiosInstance.post.mockResolvedValueOnce('converted123')

      const result = await channelService.recordConvert('ch123456', {
        userId: 'user123',
        fileName: 'my-vod',
        sessionId: 'fvlyin8qz3',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channel/recordFile/ch123456/convert',
        null,
        { params: { userId: 'user123', fileName: 'my-vod', sessionId: 'fvlyin8qz3' } }
      )
      expect(result.vid).toBe('converted123')
    })

    it('should validate channelId is required', async () => {
      await expect(
        channelService.recordConvert('', {
          userId: 'user123',
          fileName: 'my-vod',
          sessionId: 'fvlyin8qz3',
        })
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should require sessionId or fileUrl', async () => {
      await expect(
        channelService.recordConvert('ch123456', {
          userId: 'user123',
          fileName: 'my-vod',
        })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC18: recordConvertAsync
  // ============================================
  describe('AC18: recordConvertAsync - Convert Record (Async)', () => {
    it('should convert record asynchronously via v3 endpoint with fileIds', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.recordConvertAsync('ch123456', {
        fileIds: 'file1,file2',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/record/convert',
        null,
        { params: { channelId: 'ch123456', fileIds: 'file1,file2' } }
      )
      expect(result).toBe(true)
    })

    it('should validate channelId is required', async () => {
      await expect(
        channelService.recordConvertAsync('', { fileIds: 'file1' })
      ).rejects.toThrow(PolyVValidationError)
    })

    it('should require fileIds', async () => {
      await expect(
        channelService.recordConvertAsync('ch123456', { fileIds: '' })
      ).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC19: recordFileMerge
  // ============================================
  describe('AC19: recordFileMerge - Merge Records (Sync)', () => {
    it('should merge records synchronously', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ fileId: 'merged123' })

      const result = await channelService.recordFileMerge('ch123456', {
        fileIds: ['file1', 'file2'],
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/record/merge',
        null,
        { params: { channelId: 'ch123456', fileIds: 'file1,file2' } }
      )
      expect(result.fileId).toBe('merged123')
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.recordFileMerge('', { fileIds: ['file1'] })).rejects.toThrow(PolyVValidationError)
    })

    it('should validate fileIds is not empty', async () => {
      await expect(channelService.recordFileMerge('ch123456', { fileIds: [] })).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC20: recordFileMergeAsync
  // ============================================
  describe('AC20: recordFileMergeAsync - Merge Records (Async)', () => {
    it('should merge records asynchronously', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.recordFileMergeAsync('ch123456', {
        fileIds: ['file1', 'file2'],
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/record/merge-async',
        null,
        { params: { channelId: 'ch123456', fileIds: 'file1,file2' } }
      )
      expect(result).toBe(true)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.recordFileMergeAsync('', { fileIds: ['file1'] })).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC21: recordMergeMp4
  // ============================================
  describe('AC21: recordMergeMp4 - Merge to MP4', () => {
    it('should merge records to MP4', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ url: 'https://example.com/merged.mp4' })

      const result = await channelService.recordMergeMp4('ch123456', {
        fileIds: ['file1', 'file2'],
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/record/merge-mp4',
        null,
        { params: { channelId: 'ch123456', fileIds: 'file1,file2' } }
      )
      expect(result.url).toBe('https://example.com/merged.mp4')
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.recordMergeMp4('', { fileIds: ['file1'] })).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC22: recordMergeMp4Start
  // ============================================
  describe('AC22: recordMergeMp4Start - Start MP4 Merge', () => {
    it('should start MP4 merge process', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.recordMergeMp4Start('ch123456', {
        fileIds: ['file1', 'file2'],
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/record/merge-mp4-start',
        null,
        { params: { channelId: 'ch123456', fileIds: 'file1,file2' } }
      )
      expect(result).toBe(true)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.recordMergeMp4Start('', { fileIds: ['file1'] })).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC23: recordAddBreakpoint
  // ============================================
  describe('AC23: recordAddBreakpoint - Add Breakpoint', () => {
    it('should add breakpoint to record', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.recordAddBreakpoint('ch123456', {
        fileId: 'file123',
        time: 1800,
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v3/channel/record/add-breakpoint',
        null,
        { params: { channelId: 'ch123456', fileId: 'file123', time: 1800 } }
      )
      expect(result).toBe(true)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.recordAddBreakpoint('', { fileId: 'file123', time: 1800 })).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC24: updatePlayerLogo
  // ============================================
  describe('AC24: updatePlayerLogo - Update Player Logo Settings', () => {
    it('should update player logo settings', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.updatePlayerLogo('ch123456', {
        logoImage: 'https://example.com/logo.png',
        logoOpacity: 90,
        logoPosition: 'bottom-right',
        logoHref: 'https://example.com',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channels/ch123456/update',
        null,
        {
          params: {
            logoImage: 'https://example.com/logo.png',
            logoOpacity: 90,
            logoPosition: 'bottom-right',
            logoHref: 'https://example.com',
          }
        }
      )
      expect(result).toBe(true)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.updatePlayerLogo('', {
        logoImage: 'https://example.com/logo.png',
      })).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC25: updatePlayerHead
  // ============================================
  describe('AC25: updatePlayerHead - Update Player Head Image Settings', () => {
    it('should update player head image settings', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.updatePlayerHead('ch123456', {
        headImage: 'https://example.com/head.png',
        headImageHref: 'https://example.com',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channels/ch123456/update',
        null,
        {
          params: {
            headImage: 'https://example.com/head.png',
            headImageHref: 'https://example.com',
          }
        }
      )
      expect(result).toBe(true)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.updatePlayerHead('', {
        headImage: 'https://example.com/head.png',
      })).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC26: updatePlayerStop
  // ============================================
  describe('AC26: updatePlayerStop - Update Player Stop Image Settings', () => {
    it('should update player stop image settings', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(true)

      const result = await channelService.updatePlayerStop('ch123456', {
        stopImage: 'https://example.com/stop.png',
        stopImageHref: 'https://example.com',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/live/v2/channels/ch123456/update',
        null,
        {
          params: {
            stopImage: 'https://example.com/stop.png',
            stopImageHref: 'https://example.com',
          }
        }
      )
      expect(result).toBe(true)
    })

    it('should validate channelId is required', async () => {
      await expect(channelService.updatePlayerStop('', {
        stopImage: 'https://example.com/stop.png',
      })).rejects.toThrow(PolyVValidationError)
    })
  })

  // ============================================
  // AC27-30: Type Safety & Quality
  // ============================================
  describe('AC27-30: Type Safety & Quality', () => {
    it('should have correct type for PlaybackVideoItem', () => {
      const item: PlaybackVideoItem = mockPlaybackVideoItem
      expect(item.videoId).toBeDefined()
      expect(item.channelId).toBeDefined()
      expect(item.title).toBeDefined()
    })

    it('should have correct type for PlaybackListResponse', () => {
      const response: PlaybackListResponse = mockPlaybackListResponse
      expect(response.contents).toBeDefined()
      expect(response.total).toBeDefined()
      expect(response.pageSize).toBeDefined()
      expect(response.pageNumber).toBeDefined()
    })

    it('should have correct type for ChannelSession', () => {
      const session: ChannelSession = mockChannelSession
      expect(session.sessionId).toBeDefined()
      expect(session.startTime).toBeDefined()
      expect(session.endTime).toBeDefined()
      expect(session.duration).toBeDefined()
    })

    it('should have correct type for RecordInfo', () => {
      const info: RecordInfo = mockRecordInfo
      expect(info.fileId).toBeDefined()
      expect(info.channelId).toBeDefined()
      expect(info.sessionId).toBeDefined()
    })

    it('should have correct type for PlaybackEnabledResponse', () => {
      const response: PlaybackEnabledResponse = mockPlaybackEnabledResponse
      expect(response.enabled).toBeDefined()
    })

    it('should have correct type for PlaybackSettingResponse', () => {
      const response: PlaybackSettingResponse = mockPlaybackSettingResponse
      expect(response.sortType).toBeDefined()
      expect(response.autoPublish).toBeDefined()
    })
  })
})
