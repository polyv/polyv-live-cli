/**
 * @fileoverview Unit tests for AI Digital Human service
 * @author Development Team
 * @since 14.4.0
 */

import { AIDigitalHumanServiceSdk } from './ai-digital-human-service';
import { AuthConfig } from '../types/auth';

describe('AIDigitalHumanServiceSdk', () => {
  let service: AIDigitalHumanServiceSdk;
  let mockHttpClient: { get: jest.Mock; post: jest.Mock };
  const authConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
    userId: 'test-user-id',
  };

  beforeEach(() => {
    service = new AIDigitalHumanServiceSdk(authConfig);
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
    };
    (service as unknown as { client: { httpClient: typeof mockHttpClient } }).client.httpClient = mockHttpClient;
  });

  describe('listDigitalHumans', () => {
    test('[AC1] should list digital humans with valid pagination params', async () => {
      const mockResponse = {
        pageNumber: 1,
        pageSize: 10,
        totalPages: 8,
        totalItems: 16,
        contents: [
          {
            id: 55,
            name: '萌萌',
            thirdRoleCode: '00024',
            coverPhoto: 'https://img.videocc.net/cover.png',
            fullBodyPhoto: 'https://img.videocc.net/full.png',
            defaultTtsVoiceId: 92,
            clothesDesc: '白色西装',
            createTime: 1704191006000,
          },
        ],
      };

      mockHttpClient.get.mockResolvedValue({ data: mockResponse });

      const result = await service.listDigitalHumans(1, 10);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/ai/digital-human/list',
        {
          params: {
            pageNumber: 1,
            pageSize: 10,
          },
        }
      );
    });

    test('[AC1] should use default pagination when not provided', async () => {
      const mockResponse = {
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 0,
        contents: [],
      };

      mockHttpClient.get.mockResolvedValue({ data: mockResponse });

      const result = await service.listDigitalHumans();

      expect(result.pageNumber).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/ai/digital-human/list',
        {
          params: {
            pageNumber: 1,
            pageSize: 10,
          },
        }
      );
    });

    test('[AC1] should handle empty result', async () => {
      const mockResponse = {
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        totalItems: 0,
        contents: [],
      };

      mockHttpClient.get.mockResolvedValue({ data: mockResponse });

      const result = await service.listDigitalHumans(1, 10);

      expect(result.contents).toEqual([]);
      expect(result.totalItems).toBe(0);
    });

    test('[AC5] should limit pageSize to max 1000', async () => {
      const mockResponse = {
        pageNumber: 1,
        pageSize: 1000,
        totalPages: 1,
        totalItems: 5,
        contents: [],
      };

      mockHttpClient.get.mockResolvedValue({ data: mockResponse });

      await service.listDigitalHumans(1, 2000);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/ai/digital-human/list',
        {
          params: {
            pageNumber: 1,
            pageSize: 1000,
          },
        }
      );
    });

    test('[AC5] should throw error for invalid pageNumber', async () => {
      await expect(service.listDigitalHumans(0, 10)).rejects.toThrow('pageNumber must be greater than 0');
    });

    test('[AC5] should handle API error', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('API Error'));

      await expect(service.listDigitalHumans(1, 10)).rejects.toThrow('API Error');
    });
  });

  describe('listOrganizations', () => {
    test('[AC2] should list organizations for valid IDs', async () => {
      const mockResponse = [
        {
          aiDigitalHumanId: 1,
          organizationIds: [1, 2, 3],
          includeChildren: true,
        },
        {
          aiDigitalHumanId: 2,
          organizationIds: [3, 4, 5],
          includeChildren: false,
        },
      ];

      mockHttpClient.get.mockResolvedValue({ data: mockResponse });

      const result = await service.listOrganizations('1,2,3');

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/ai/digital-human/list-organization',
        {
          params: {
            aiDigitalHumanIds: '1,2,3',
          },
        }
      );
    });

    test('[AC2] should handle empty result', async () => {
      mockHttpClient.get.mockResolvedValue({ data: [] });

      const result = await service.listOrganizations('1,2,3');

      expect(result).toEqual([]);
    });

    test('[AC5] should throw error for empty IDs', async () => {
      await expect(service.listOrganizations('')).rejects.toThrow('aiDigitalHumanIds is required');
    });

    test('[AC5] should throw error when IDs exceed 100', async () => {
      const ids = Array(101).fill(0).map((_, i) => i + 1).join(',');

      await expect(service.listOrganizations(ids)).rejects.toThrow('exceeds maximum');
    });

    test('[AC5] should accept exactly 100 IDs', async () => {
      const ids = Array(100).fill(0).map((_, i) => i + 1).join(',');
      mockHttpClient.get.mockResolvedValue({ data: [] });

      await expect(service.listOrganizations(ids)).resolves.toBeDefined();
    });

    test('[AC5] should handle API error', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('API Error'));

      await expect(service.listOrganizations('1,2,3')).rejects.toThrow('API Error');
    });
  });

  describe('setOrganizations', () => {
    test('[AC3] should set organizations with valid params', async () => {
      const params = [
        {
          aiDigitalHumanId: 1,
          organizationIds: [1, 2, 3],
          includeChildren: true,
        },
      ];

      mockHttpClient.post.mockResolvedValue({ data: {} });

      const result = await service.setOrganizations(params);

      expect(result).toBe(true);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/ai/digital-human/set-organizations',
        { setOrganizations: params }
      );
    });

    test('[AC3] should process array config', async () => {
      const params = [
        {
          aiDigitalHumanId: 1,
          organizationIds: [1, 2, 3],
          includeChildren: false,
        },
        {
          aiDigitalHumanId: 2,
          organizationIds: [4, 5, 6],
          includeChildren: true,
        },
      ];

      mockHttpClient.post.mockResolvedValue({ data: {} });

      const result = await service.setOrganizations(params);

      expect(result).toBe(true);
      expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/ai/digital-human/set-organizations',
        { setOrganizations: params }
      );
    });

    test('[AC5] should throw error for empty config', async () => {
      await expect(service.setOrganizations([])).rejects.toThrow('config is required');
    });

    test('[AC5] should throw error when items exceed 100', async () => {
      const params = Array(101).fill(0).map((_, i) => ({
        aiDigitalHumanId: i + 1,
        organizationIds: [1],
        includeChildren: true,
      }));

      await expect(service.setOrganizations(params)).rejects.toThrow('exceeds maximum');
    });

    test('[AC3] should accept exactly 100 items', async () => {
      const params = Array(100).fill(0).map((_, i) => ({
        aiDigitalHumanId: i + 1,
        organizationIds: [1],
        includeChildren: true,
      }));

      mockHttpClient.post.mockResolvedValue({ data: {} });

      await expect(service.setOrganizations(params)).resolves.toBe(true);
    });

    test('[AC5] should handle API error', async () => {
      const params = [
        {
          aiDigitalHumanId: 1,
          organizationIds: [1],
          includeChildren: true,
        },
      ];

      mockHttpClient.post.mockRejectedValue(new Error('API Error'));

      await expect(service.setOrganizations(params)).rejects.toThrow('API Error');
    });
  });
});
