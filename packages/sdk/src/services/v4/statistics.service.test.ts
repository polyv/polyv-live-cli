/**
 * @fileoverview Unit tests for V4StatisticsService
 * @module services/v4/statistics.service.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { V4StatisticsService } from './statistics.service.js';
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

describe('V4StatisticsService', () => {
  let service: V4StatisticsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4StatisticsService(mockClient);
  });

  // ============================================
  // getSessionStatsSummaryList Tests
  // ============================================

  describe('getSessionStatsSummaryList', () => {
    it('[P0] should get session stats summary list successfully', async () => {
      const mockResponse = {
        contents: [
          {
            sessionId: 'session001',
            channelId: '123456',
            title: 'Test Session',
            startTime: 1678800000000,
            endTime: 1678999999999,
            viewerCount: 100,
            maxConcurrent: 50,
          },
        ],
        total: 1,
        pageNumber: 1,
        pageSize: 10,
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getSessionStatsSummaryList({
        channelId: '123456',
        pageNumber: 1,
        pageSize: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/statistics/session-stats/summary/list',
        { params: { channelId: '123456', pageNumber: 1, pageSize: 10 } }
      );
    });

    it('[P0] should get session stats with keyword filter', async () => {
      const mockResponse = {
        contents: [],
        total: 0,
        pageNumber: 1,
        pageSize: 10,
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getSessionStatsSummaryList({
        channelId: '123456',
        keyword: 'test',
        pageNumber: 1,
        pageSize: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/statistics/session-stats/summary/list',
        { params: { channelId: '123456', keyword: 'test', pageNumber: 1, pageSize: 10 } }
      );
    });

    it('[P0] should get session stats with time range filter', async () => {
      const mockResponse = {
        contents: [],
        total: 0,
        pageNumber: 1,
        pageSize: 10,
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getSessionStatsSummaryList({
        channelId: '123456',
        startTime: '1678800000000',
        endTime: '1678999999999',
        pageNumber: 1,
        pageSize: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/statistics/session-stats/summary/list',
        { params: expect.objectContaining({ startTime: '1678800000000', endTime: '1678999999999' }) }
      );
    });

    it('[P1] should handle API errors', async () => {
      const apiError = new Error('API error: Authentication failed');
      mockHttpClient.get.mockRejectedValueOnce(apiError);

      await expect(
        service.getSessionStatsSummaryList({
          channelId: '123456',
          pageNumber: 1,
          pageSize: 10,
        })
      ).rejects.toThrow('API error: Authentication failed');
    });

    // ============================================
    // Validation Tests
    // ============================================

    describe('pagination validation', () => {
      it('[P1] should throw error when pageNumber is less than 1', async () => {
        await expect(
          service.getSessionStatsSummaryList({
            channelId: '123456',
            pageNumber: 0,
            pageSize: 10,
          })
        ).rejects.toThrow(PolyVValidationError);
        await expect(
          service.getSessionStatsSummaryList({
            channelId: '123456',
            pageNumber: 0,
            pageSize: 10,
          })
        ).rejects.toThrow('pageNumber must be >= 1');
      });

      it('[P1] should throw error when pageNumber is negative', async () => {
        await expect(
          service.getSessionStatsSummaryList({
            channelId: '123456',
            pageNumber: -1,
            pageSize: 10,
          })
        ).rejects.toThrow('pageNumber must be >= 1');
      });

      it('[P1] should throw error when pageSize is less than 1', async () => {
        await expect(
          service.getSessionStatsSummaryList({
            channelId: '123456',
            pageNumber: 1,
            pageSize: 0,
          })
        ).rejects.toThrow('pageSize must be between 1 and 1000');
      });

      it('[P1] should throw error when pageSize is greater than 1000', async () => {
        await expect(
          service.getSessionStatsSummaryList({
            channelId: '123456',
            pageNumber: 1,
            pageSize: 1001,
          })
        ).rejects.toThrow('pageSize must be between 1 and 1000');
      });

      it('[P1] should accept pageNumber = 1', async () => {
        mockHttpClient.get.mockResolvedValueOnce({ contents: [], total: 0 });

        await service.getSessionStatsSummaryList({
          channelId: '123456',
          pageNumber: 1,
          pageSize: 10,
        });

        expect(mockHttpClient.get).toHaveBeenCalled();
      });

      it('[P1] should accept pageSize = 1', async () => {
        mockHttpClient.get.mockResolvedValueOnce({ contents: [], total: 0 });

        await service.getSessionStatsSummaryList({
          channelId: '123456',
          pageNumber: 1,
          pageSize: 1,
        });

        expect(mockHttpClient.get).toHaveBeenCalled();
      });

      it('[P1] should accept pageSize = 1000', async () => {
        mockHttpClient.get.mockResolvedValueOnce({ contents: [], total: 0 });

        await service.getSessionStatsSummaryList({
          channelId: '123456',
          pageNumber: 1,
          pageSize: 1000,
        });

        expect(mockHttpClient.get).toHaveBeenCalled();
      });
    });
  });
});
