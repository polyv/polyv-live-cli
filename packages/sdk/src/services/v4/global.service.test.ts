/**
 * @fileoverview Unit tests for V4GlobalService
 * @module services/v4/global.service.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { V4GlobalService } from './global.service.js';
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

describe('V4GlobalService', () => {
  let service: V4GlobalService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4GlobalService(mockClient);
  });

  // ============================================
  // getAuth Tests
  // ============================================

  describe('getAuth', () => {
    it('[P0] should get auth settings successfully', async () => {
      const mockResponse = [
        { authEnabled: 'Y', authType: 'code' },
        { authEnabled: 'N', authType: 'none' },
      ];

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getAuth();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/global/auth/get'
      );
    });

    it('[P1] should handle API errors', async () => {
      const apiError = new Error('API error: Authentication failed');
      mockHttpClient.get.mockRejectedValueOnce(apiError);

      await expect(service.getAuth()).rejects.toThrow('API error: Authentication failed');
    });
  });

  // ============================================
  // updateAuth Tests
  // ============================================

  describe('updateAuth', () => {
    it('[P0] should update auth settings successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      const params = {
        authSettings: [
          { authEnabled: 'Y', authType: 'code' },
          { authEnabled: 'N', authType: 'none' },
        ],
      };

      await service.updateAuth(params);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/global/auth/update',
        params.authSettings
      );
    });

    it('[P1] should throw error when authSettings has less than 2 items', async () => {
      const params = {
        authSettings: [{ authEnabled: 'Y', authType: 'code' }],
      };

      await expect(service.updateAuth(params)).rejects.toThrow(PolyVValidationError);
      await expect(service.updateAuth(params)).rejects.toThrow(
        'authSettings must contain exactly 2 settings (primary and secondary)'
      );
    });

    it('[P1] should throw error when authSettings has more than 2 items', async () => {
      const params = {
        authSettings: [
          { authEnabled: 'Y', authType: 'code' },
          { authEnabled: 'N', authType: 'none' },
          { authEnabled: 'N', authType: 'pay' },
        ],
      };

      await expect(service.updateAuth(params)).rejects.toThrow(
        'authSettings must contain exactly 2 settings (primary and secondary)'
      );
    });

    it('[P1] should throw error when authSettings is empty', async () => {
      const params = {
        authSettings: [],
      };

      await expect(service.updateAuth(params)).rejects.toThrow(
        'authSettings must contain exactly 2 settings (primary and secondary)'
      );
    });

    it('[P1] should throw error when authSettings is undefined', async () => {
      const params = {} as any;

      await expect(service.updateAuth(params)).rejects.toThrow(
        'authSettings must contain exactly 2 settings (primary and secondary)'
      );
    });

    it('[P1] should handle API errors', async () => {
      const apiError = new Error('API error: Update failed');
      mockHttpClient.post.mockRejectedValueOnce(apiError);

      await expect(
        service.updateAuth({
          authSettings: [
            { authEnabled: 'Y', authType: 'code' },
            { authEnabled: 'N', authType: 'none' },
          ],
        })
      ).rejects.toThrow('API error: Update failed');
    });
  });

  // ============================================
  // getPageSetting Tests
  // ============================================

  describe('getPageSetting', () => {
    it('[P0] should get page settings successfully', async () => {
      const mockResponse = {
        autoPlayEnabled: 'Y',
        barrageEnabled: 'Y',
        barrageSpeed: '270',
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getPageSetting();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/template/page-setting/get'
      );
    });

    it('[P1] should handle API errors', async () => {
      const apiError = new Error('API error: Not found');
      mockHttpClient.get.mockRejectedValueOnce(apiError);

      await expect(service.getPageSetting()).rejects.toThrow('API error: Not found');
    });
  });

  // ============================================
  // updatePageSetting Tests
  // ============================================

  describe('updatePageSetting', () => {
    it('[P0] should update page settings successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      const params = {
        autoPlayEnabled: 'Y',
        barrageEnabled: 'Y',
        barrageSpeed: '270',
      };

      await service.updatePageSetting(params);

      expect(mockHttpClient.post).toHaveBeenCalled();
      const callUrl = mockHttpClient.post.mock.calls[0][0];
      expect(callUrl).toContain('/live/v4/user/template/page-setting/update?');
      expect(callUrl).toContain('autoPlayEnabled=Y');
      expect(callUrl).toContain('barrageEnabled=Y');
      expect(callUrl).toContain('barrageSpeed=270');
    });

    it('[P0] should update single setting parameter', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updatePageSetting({ autoPlayEnabled: 'Y' });

      expect(mockHttpClient.post).toHaveBeenCalled();
      const callUrl = mockHttpClient.post.mock.calls[0][0];
      expect(callUrl).toContain('autoPlayEnabled=Y');
    });

    it('[P1] should filter out undefined values', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      const params = {
        autoPlayEnabled: 'Y',
        barrageEnabled: undefined,
      };

      await service.updatePageSetting(params);

      const callUrl = mockHttpClient.post.mock.calls[0][0];
      expect(callUrl).toContain('autoPlayEnabled=Y');
      expect(callUrl).not.toContain('barrageEnabled');
    });

    it('[P1] should handle API errors', async () => {
      const apiError = new Error('API error: Update failed');
      mockHttpClient.post.mockRejectedValueOnce(apiError);

      await expect(
        service.updatePageSetting({ autoPlayEnabled: 'Y' })
      ).rejects.toThrow('API error: Update failed');
    });
  });
});
