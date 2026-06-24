/**
 * @fileoverview Unit tests for V4AiService
 * @module services/v4/ai.service.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { V4AiService } from './ai.service.js';
import type { PolyVClient } from '../../client.js';

// Mock the PolyVClient
const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
} as unknown as PolyVClient;

describe('V4AiService', () => {
  let service: V4AiService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4AiService(mockClient);
  });

  // ============================================
  // listDigitalHumans Tests
  // ============================================

  describe('listDigitalHumans', () => {
    it('[P0] should list digital humans successfully', async () => {
      const mockResponse = {
        contents: [{ id: 1, name: 'Digital Human 1' }],
        total: 1,
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listDigitalHumans({ pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/ai/digital-human/list',
        { params: { pageNumber: 1, pageSize: 10 } }
      );
    });

    it('[P1] should throw error when pageNumber < 1', async () => {
      await expect(
        service.listDigitalHumans({ pageNumber: 0, pageSize: 10 })
      ).rejects.toThrow('pageNumber must be >= 1');
    });

    it('[P1] should throw error when pageSize > 1000', async () => {
      await expect(
        service.listDigitalHumans({ pageNumber: 1, pageSize: 1001 })
      ).rejects.toThrow('pageSize must be between 1 and 1000');
    });
  });

  // ============================================
  // listOrganizations Tests
  // ============================================

  describe('listOrganizations', () => {
    it('[P0] should list organizations successfully', async () => {
      const mockResponse = [
        { aiDigitalHumanId: 1001, organizationIds: [1, 2, 3] },
      ];

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listOrganizations({ aiDigitalHumanIds: '1001,1002' });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/ai/digital-human/list-organization',
        { params: { aiDigitalHumanIds: '1001,1002' } }
      );
    });

    it('[P1] should throw error when aiDigitalHumanIds is empty', async () => {
      await expect(
        service.listOrganizations({ aiDigitalHumanIds: '' })
      ).rejects.toThrow('aiDigitalHumanIds is required and cannot be empty');
    });
  });

  // ============================================
  // setOrganizations Tests
  // ============================================

  describe('setOrganizations', () => {
    it('[P0] should set organizations successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.setOrganizations({
        items: [
          { aiDigitalHumanId: 1001, organizationIds: [1, 2, 3], includeChildren: true },
        ],
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/ai/digital-human/set-organizations',
        { setOrganizations: [{ aiDigitalHumanId: 1001, organizationIds: [1, 2, 3], includeChildren: true }] }
      );
    });

    it('[P1] should throw error when items is empty', async () => {
      await expect(
        service.setOrganizations({ items: [] })
      ).rejects.toThrow('items is required and cannot be empty');
    });
  });

  // ============================================
  // listVideoProduces Tests
  // ============================================

  describe('listVideoProduces', () => {
    it('[P0] should list video produces successfully', async () => {
      const mockResponse = {
        contents: [{ id: 1, videoName: 'Video 1' }],
        total: 1,
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listVideoProduces({ pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // getVideoProduce Tests
  // ============================================

  describe('getVideoProduce', () => {
    it('[P0] should get video produce successfully', async () => {
      const mockResponse = { id: 2001, videoName: 'Test Video' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getVideoProduce({ id: 2001 });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/ai/video-produce/get',
        { params: { id: 2001 } }
      );
    });

    it('[P1] should throw error when id is undefined', async () => {
      await expect(
        service.getVideoProduce({ id: undefined as any })
      ).rejects.toThrow('id is required');
    });
  });

  // ============================================
  // batchCreateVideoProduces Tests
  // ============================================

  describe('batchCreateVideoProduces', () => {
    it('[P0] should batch create video produces successfully', async () => {
      const mockResponse = { createdCount: 1 };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const params = {
        tasks: [
          {
            videoName: 'Video 1',
            hasDigitalHuman: false,
            ttsVoiceInfo: { ttsVoiceId: 1, rate: 1.0 },
            subtitleInfo: { enableSubtitle: true },
          },
        ],
      };

      const result = await service.batchCreateVideoProduces(params);

      expect(result).toEqual(mockResponse);
    });

    it('[P1] should throw error when tasks is empty', async () => {
      await expect(
        service.batchCreateVideoProduces({ tasks: [] })
      ).rejects.toThrow('tasks is required and cannot be empty');
    });

    it('[P1] should throw error when tasks exceeds 20', async () => {
      const tasks = Array.from({ length: 21 }, (_, i) => ({
        videoName: `Video ${i}`,
        hasDigitalHuman: false,
      }));

      await expect(
        service.batchCreateVideoProduces({ tasks } as any)
      ).rejects.toThrow('tasks cannot contain more than 20 items');
    });

    it('[P1] should throw error when ttsVoiceInfo.rate < 0.5', async () => {
      await expect(
        service.batchCreateVideoProduces({
          tasks: [
            {
              videoName: 'Video 1',
              hasDigitalHuman: false,
              ttsVoiceInfo: { ttsVoiceId: 1, rate: 0.4 },
            },
          ],
        } as any)
      ).rejects.toThrow('tasks[0].ttsVoiceInfo.rate must be between 0.5 and 2.0');
    });

    it('[P1] should throw error when ttsVoiceInfo.rate > 2.0', async () => {
      await expect(
        service.batchCreateVideoProduces({
          tasks: [
            {
              videoName: 'Video 1',
              hasDigitalHuman: false,
              ttsVoiceInfo: { ttsVoiceId: 1, rate: 2.1 },
            },
          ],
        } as any)
      ).rejects.toThrow('tasks[0].ttsVoiceInfo.rate must be between 0.5 and 2.0');
    });
  });

  // ============================================
  // deleteVideoProduce Tests
  // ============================================

  describe('deleteVideoProduce', () => {
    it('[P0] should delete video produce successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteVideoProduce({ id: 2001 });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/ai/video-produce/delete',
        { id: 2001 }
      );
    });

    it('[P1] should throw error when id is null', async () => {
      await expect(
        service.deleteVideoProduce({ id: null as any })
      ).rejects.toThrow('id is required');
    });
  });

  // ============================================
  // listVideoProducePpts Tests
  // ============================================

  describe('listVideoProducePpts', () => {
    it('[P0] should list video produce ppts successfully', async () => {
      const mockResponse = {
        contents: [{ fileId: 'file001', fileName: 'Presentation.pptx' }],
        total: 1,
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listVideoProducePpts({ pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // getVideoProducePpt Tests
  // ============================================

  describe('getVideoProducePpt', () => {
    it('[P0] should get video produce ppt successfully', async () => {
      const mockResponse = { fileId: 'file001', fileName: 'Presentation.pptx' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getVideoProducePpt({ fileId: 'file001' });

      expect(result).toEqual(mockResponse);
    });

    it('[P1] should throw error when fileId is empty', async () => {
      await expect(
        service.getVideoProducePpt({ fileId: '' })
      ).rejects.toThrow('fileId is required and cannot be empty');
    });
  });

  // ============================================
  // asyncUploadVideoProducePpt Tests
  // ============================================

  describe('asyncUploadVideoProducePpt', () => {
    it('[P0] should async upload video produce ppt successfully', async () => {
      const mockResponse = { fileId: 'file001' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.asyncUploadVideoProducePpt({
        url: 'https://example.com/presentation.pptx',
        docName: 'Presentation',
        type: 'animate',
        callbackUrl: 'https://example.com/callback',
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/ai/video-produce/ppt/async-upload',
        null,
        {
          params: {
            url: 'https://example.com/presentation.pptx',
            docName: 'Presentation',
            type: 'animate',
            callbackUrl: 'https://example.com/callback',
          },
        }
      );
    });

    it('[P1] should throw error when url is empty', async () => {
      await expect(
        service.asyncUploadVideoProducePpt({ url: '' })
      ).rejects.toThrow('url is required and cannot be empty');
    });

    it('[P1] should throw error when type is invalid', async () => {
      await expect(
        service.asyncUploadVideoProducePpt({
          url: 'https://example.com/presentation.pptx',
          type: 'invalid' as any,
        })
      ).rejects.toThrow('type must be common or animate');
    });
  });

  // ============================================
  // uploadVideoProducePpt Tests
  // ============================================

  describe('uploadVideoProducePpt', () => {
    it('[P0] should upload video produce ppt successfully', async () => {
      const mockResponse = { fileId: 'file001' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.uploadVideoProducePpt({
        url: 'https://example.com/presentation.pptx',
        docName: 'My Presentation',
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/ai/video-produce/ppt/upload',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    });

    it('[P0] should upload without docName', async () => {
      const mockResponse = { fileId: 'file002' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.uploadVideoProducePpt({
        url: 'https://example.com/presentation.pptx',
      });

      expect(result).toEqual(mockResponse);
    });

    it('[P1] should throw error when url is empty', async () => {
      await expect(
        service.uploadVideoProducePpt({ url: '' })
      ).rejects.toThrow('url is required and cannot be empty');
    });
  });

  // ============================================
  // listTtsVoices Tests
  // ============================================

  describe('listTtsVoices', () => {
    it('[P0] should list tts voices successfully', async () => {
      const mockResponse = [
        { ttsVoiceId: 1, name: 'Voice 1' },
        { ttsVoiceId: 2, name: 'Voice 2' },
      ];

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listTtsVoices();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/ai/video-produce/tts-voice/list'
      );
    });

    it('[P1] should forward pagination params when provided', async () => {
      mockHttpClient.get.mockResolvedValueOnce([]);

      await service.listTtsVoices({ pageNumber: 1, pageSize: 20 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/ai/video-produce/tts-voice/list',
        { params: { pageNumber: 1, pageSize: 20 } }
      );
    });

    it('[P1] should reject invalid pagination', async () => {
      await expect(service.listTtsVoices({ pageNumber: 0, pageSize: 10 })).rejects.toThrow(
        'pageNumber must be >= 1'
      );
      await expect(service.listTtsVoices({ pageNumber: 1, pageSize: 0 })).rejects.toThrow(
        'pageSize must be between 1 and 1000'
      );
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });
  });
});
