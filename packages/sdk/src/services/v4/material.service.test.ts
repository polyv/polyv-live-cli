/**
 * @fileoverview Unit tests for V4MaterialService
 * @module services/v4/material.service.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { V4MaterialService } from './material.service.js';
import type { PolyVClient } from '../../client.js';
import { PolyVValidationError } from '../../errors/polyv-validation-error.js';

// Mock the PolyVClient
const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
} as unknown as PolyVClient;

describe('V4MaterialService', () => {
  let service: V4MaterialService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4MaterialService(mockClient);
  });

  // ============================================
  // listMaterials Tests
  // ============================================

  describe('listMaterials', () => {
    it('[P0] should list video materials successfully', async () => {
      const mockResponse = {
        contents: [
          { materialId: 'mat001', title: 'Video 1', type: 'video', url: 'http://example.com/v1' },
        ],
        total: 1,
        pageNumber: 1,
        pageSize: 20,
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listMaterials({
        type: 'video',
        pageNumber: 1,
        pageSize: 20,
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/material/list',
        { params: { type: 'video', pageNumber: 1, pageSize: 20 } }
      );
    });

    it('[P0] should list image materials successfully', async () => {
      const mockResponse = {
        contents: [
          { materialId: 'mat002', title: 'Image 1', type: 'image', url: 'http://example.com/i1' },
        ],
        total: 1,
        pageNumber: 1,
        pageSize: 20,
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listMaterials({
        type: 'image',
        pageNumber: 1,
        pageSize: 20,
      });

      expect(result).toEqual(mockResponse);
    });

    it('[P0] should list audio materials successfully', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ contents: [], total: 0 });

      await service.listMaterials({
        type: 'audio',
        pageNumber: 1,
        pageSize: 20,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/material/list',
        { params: { type: 'audio', pageNumber: 1, pageSize: 20 } }
      );
    });

    it('[P0] should list document materials successfully', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ contents: [], total: 0 });

      await service.listMaterials({
        type: 'document',
        pageNumber: 1,
        pageSize: 20,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/material/list',
        { params: { type: 'document', pageNumber: 1, pageSize: 20 } }
      );
    });

    it('[P0] should list materials with filters', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ contents: [], total: 0 });

      await service.listMaterials({
        type: 'video',
        category: 'cat001',
        title: 'test',
        pageNumber: 1,
        pageSize: 10,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/material/list',
        { params: { type: 'video', category: 'cat001', title: 'test', pageNumber: 1, pageSize: 10 } }
      );
    });

    it('[P1] should handle API errors', async () => {
      const apiError = new Error('API error: Authentication failed');
      mockHttpClient.get.mockRejectedValueOnce(apiError);

      await expect(
        service.listMaterials({
          type: 'video',
          pageNumber: 1,
          pageSize: 10,
        })
      ).rejects.toThrow('API error: Authentication failed');
    });

    // ============================================
    // Validation Tests
    // ============================================

    describe('validation', () => {
      it('[P1] should throw error for invalid material type', async () => {
        await expect(
          service.listMaterials({
            type: 'invalid' as any,
            pageNumber: 1,
            pageSize: 10,
          })
        ).rejects.toThrow(PolyVValidationError);
        await expect(
          service.listMaterials({
            type: 'invalid' as any,
            pageNumber: 1,
            pageSize: 10,
          })
        ).rejects.toThrow('type must be one of: video, image, audio, document');
      });

      it('[P1] should throw error for empty type', async () => {
        await expect(
          service.listMaterials({
            type: '' as any,
            pageNumber: 1,
            pageSize: 10,
          })
        ).rejects.toThrow('type must be one of: video, image, audio, document');
      });

      it('[P1] should throw error when pageNumber < 1', async () => {
        await expect(
          service.listMaterials({
            type: 'video',
            pageNumber: 0,
            pageSize: 10,
          })
        ).rejects.toThrow('pageNumber must be >= 1');
      });

      it('[P1] should throw error when pageSize < 1', async () => {
        await expect(
          service.listMaterials({
            type: 'video',
            pageNumber: 1,
            pageSize: 0,
          })
        ).rejects.toThrow('pageSize must be between 1 and 1000');
      });

      it('[P1] should throw error when pageSize > 1000', async () => {
        await expect(
          service.listMaterials({
            type: 'video',
            pageNumber: 1,
            pageSize: 1001,
          })
        ).rejects.toThrow('pageSize must be between 1 and 1000');
      });
    });
  });

  // ============================================
  // deleteMaterials Tests
  // ============================================

  describe('deleteMaterials', () => {
    it('[P0] should delete single material successfully', async () => {
      const mockResponse = {
        failedMaterialIds: [],
      };

      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.deleteMaterials({
        materialIds: ['mat001'],
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/material/delete',
        { materialIds: ['mat001'] }
      );
    });

    it('[P0] should delete multiple materials successfully', async () => {
      const mockResponse = {
        failedMaterialIds: [],
      };

      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.deleteMaterials({
        materialIds: ['mat001', 'mat002', 'mat003'],
      });

      expect(result).toEqual(mockResponse);
    });

    it('[P0] should handle partial delete with failedMaterialIds', async () => {
      const mockResponse = {
        failedMaterialIds: ['mat002'],
      };

      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.deleteMaterials({
        materialIds: ['mat001', 'mat002'],
        allowPartialDelete: 'Y',
      });

      expect(result.failedMaterialIds).toEqual(['mat002']);
    });

    it('[P1] should handle API errors', async () => {
      const apiError = new Error('API error: Delete failed');
      mockHttpClient.post.mockRejectedValueOnce(apiError);

      await expect(
        service.deleteMaterials({ materialIds: ['mat001'] })
      ).rejects.toThrow('API error: Delete failed');
    });

    // ============================================
    // Validation Tests
    // ============================================

    describe('validation', () => {
      it('[P1] should throw error when materialIds is empty', async () => {
        await expect(
          service.deleteMaterials({ materialIds: [] })
        ).rejects.toThrow('materialIds must contain 1-1000 items');
      });

      it('[P1] should throw error when materialIds is undefined', async () => {
        await expect(
          service.deleteMaterials({ materialIds: undefined as any })
        ).rejects.toThrow('materialIds must contain 1-1000 items');
      });

      it('[P1] should throw error when materialIds exceeds 1000', async () => {
        const materialIds = Array.from({ length: 1001 }, (_, i) => `mat${i}`);

        await expect(
          service.deleteMaterials({ materialIds })
        ).rejects.toThrow('materialIds must contain 1-1000 items');
      });
    });
  });

  // ============================================
  // listMaterialCategories Tests
  // ============================================

  describe('listMaterialCategories', () => {
    it('[P0] should list video categories successfully', async () => {
      const mockResponse = {
        contents: [
          { categoryId: 'cat001', title: 'Category 1', subCount: 5 },
        ],
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listMaterialCategories({
        materialType: 'video',
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/material/category/list',
        { params: { materialType: 'video', parentId: undefined } }
      );
    });

    it('[P0] should list image categories successfully', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ contents: [] });

      await service.listMaterialCategories({
        materialType: 'image',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/material/category/list',
        { params: { materialType: 'image', parentId: undefined } }
      );
    });

    it('[P0] should list audio categories successfully', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ contents: [] });

      await service.listMaterialCategories({
        materialType: 'audio',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/material/category/list',
        { params: { materialType: 'audio', parentId: undefined } }
      );
    });

    it('[P0] should list document categories successfully', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ contents: [] });

      await service.listMaterialCategories({
        materialType: 'document',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/material/category/list',
        { params: { materialType: 'document', parentId: undefined } }
      );
    });

    it('[P0] should list categories with parentId filter', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ contents: [] });

      await service.listMaterialCategories({
        materialType: 'video',
        parentId: 'parent001',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/material/category/list',
        { params: { materialType: 'video', parentId: 'parent001' } }
      );
    });

    it('[P1] should handle API errors', async () => {
      const apiError = new Error('API error: Authentication failed');
      mockHttpClient.get.mockRejectedValueOnce(apiError);

      await expect(
        service.listMaterialCategories({ materialType: 'video' })
      ).rejects.toThrow('API error: Authentication failed');
    });

    // ============================================
    // Validation Tests
    // ============================================

    describe('validation', () => {
      it('[P1] should throw error for invalid materialType', async () => {
        await expect(
          service.listMaterialCategories({ materialType: 'invalid' as any })
        ).rejects.toThrow('materialType must be one of: video, image, audio, document');
      });

      it('[P1] should throw error for empty materialType', async () => {
        await expect(
          service.listMaterialCategories({ materialType: '' as any })
        ).rejects.toThrow('materialType must be one of: video, image, audio, document');
      });
    });
  });
});
