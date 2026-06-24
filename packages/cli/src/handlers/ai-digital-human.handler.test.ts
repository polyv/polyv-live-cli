/**
 * @fileoverview Unit tests for AI Digital Human handler
 * @author Development Team
 * @since 14.4.0
 */

import { AIDigitalHumanHandler } from './ai-digital-human.handler';
import { AIDigitalHumanServiceSdk } from '../services/ai-digital-human-service';

// Mock the service
jest.mock('../services/ai-digital-human-service');

describe('AIDigitalHumanHandler', () => {
  let handler: AIDigitalHumanHandler;
  let mockService: jest.Mocked<AIDigitalHumanServiceSdk>;

  const mockAuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
    userId: 'test-user-id',
  };

  const mockServiceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };

  beforeEach(() => {
    handler = new AIDigitalHumanHandler(mockAuthConfig, mockServiceConfig);
    mockService = {
      listDigitalHumans: jest.fn(),
      listOrganizations: jest.fn(),
      setOrganizations: jest.fn(),
    } as unknown as jest.Mocked<AIDigitalHumanServiceSdk>;
    (handler as unknown as { aiDigitalHumanService: typeof mockService }).aiDigitalHumanService = mockService;
  });

  describe('listDigitalHumans', () => {
    test('[AC1, AC4] should list digital humans and display in table format', async () => {
      const options = {
        page: 1,
        size: 10,
        output: 'table' as const,
      };

      const mockResponse = {
        pageNumber: 1,
        pageSize: 10,
        totalPages: 2,
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

      mockService.listDigitalHumans.mockResolvedValue(mockResponse);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await handler.listDigitalHumans(options);

      expect(mockService.listDigitalHumans).toHaveBeenCalledWith(1, 10);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('[AC1, AC4] should output JSON format when specified', async () => {
      const options = {
        page: 1,
        size: 10,
        output: 'json' as const,
      };

      const mockResponse = {
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 1,
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

      mockService.listDigitalHumans.mockResolvedValue(mockResponse);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await handler.listDigitalHumans(options);

      expect(consoleSpy).toHaveBeenCalled();
      const lastCall = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(() => JSON.parse(lastCall[0])).not.toThrow();

      consoleSpy.mockRestore();
    });

    test('[AC1] should handle empty result gracefully', async () => {
      const options = {
        page: 1,
        size: 10,
        output: 'table' as const,
      };

      const mockResponse = {
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        totalItems: 0,
        contents: [],
      };

      mockService.listDigitalHumans.mockResolvedValue(mockResponse);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await handler.listDigitalHumans(options);

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('[AC5] should handle service errors gracefully', async () => {
      const options = {
        page: 1,
        size: 10,
        output: 'table' as const,
      };

      mockService.listDigitalHumans.mockRejectedValue(new Error('Service Error'));

      await expect(handler.listDigitalHumans(options)).rejects.toThrow('Service Error');
    });
  });

  describe('listOrganizations', () => {
    test('[AC2, AC4] should list organizations and display in table format', async () => {
      const options = {
        ids: '1,2,3',
        output: 'table' as const,
      };

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

      mockService.listOrganizations.mockResolvedValue(mockResponse);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await handler.listOrganizations(options);

      expect(mockService.listOrganizations).toHaveBeenCalledWith('1,2,3');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('[AC2, AC4] should output JSON format when specified', async () => {
      const options = {
        ids: '1,2,3',
        output: 'json' as const,
      };

      const mockResponse = [
        {
          aiDigitalHumanId: 1,
          organizationIds: [1, 2, 3],
          includeChildren: true,
        },
      ];

      mockService.listOrganizations.mockResolvedValue(mockResponse);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await handler.listOrganizations(options);

      expect(consoleSpy).toHaveBeenCalled();
      const lastCall = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(() => JSON.parse(lastCall[0])).not.toThrow();

      consoleSpy.mockRestore();
    });

    test('[AC5] should throw error when ids is empty', async () => {
      const options = {
        ids: '',
        output: 'table' as const,
      };

      await expect(handler.listOrganizations(options)).rejects.toThrow();
    });

    test('[AC5] should throw error for invalid id format', async () => {
      const options = {
        ids: 'abc,def',
        output: 'table' as const,
      };

      await expect(handler.listOrganizations(options)).rejects.toThrow();
    });

    test('[AC2] should handle empty result gracefully', async () => {
      const options = {
        ids: '1,2,3',
        output: 'table' as const,
      };

      mockService.listOrganizations.mockResolvedValue([]);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await handler.listOrganizations(options);

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('setOrganizations', () => {
    test('[AC3, AC4] should set organizations with JSON config and display success', async () => {
      const options = {
        configJson: JSON.stringify([
          {
            aiDigitalHumanId: 1,
            organizationIds: [1, 2, 3],
            includeChildren: true,
          },
        ]),
        output: 'table' as const,
      };

      mockService.setOrganizations.mockResolvedValue(true);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await handler.setOrganizations(options);

      expect(mockService.setOrganizations).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('[AC3, AC4] should output JSON format when specified', async () => {
      const options = {
        configJson: JSON.stringify([
          {
            aiDigitalHumanId: 1,
            organizationIds: [1, 2, 3],
            includeChildren: true,
          },
        ]),
        output: 'json' as const,
      };

      mockService.setOrganizations.mockResolvedValue(true);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await handler.setOrganizations(options);

      expect(consoleSpy).toHaveBeenCalled();
      const lastCall = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(() => JSON.parse(lastCall[0])).not.toThrow();

      consoleSpy.mockRestore();
    });

    test('[AC3] should set organizations with individual CLI params', async () => {
      const options = {
        aiDigitalHumanId: '1',
        organizationIds: '1,2,3',
        includeChildren: true,
        output: 'table' as const,
      };

      mockService.setOrganizations.mockResolvedValue(true);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await handler.setOrganizations(options);

      expect(mockService.setOrganizations).toHaveBeenCalledWith([
        {
          aiDigitalHumanId: 1,
          organizationIds: [1, 2, 3],
          includeChildren: true,
        },
      ]);

      consoleSpy.mockRestore();
    });

    test('[AC5] should throw error for invalid JSON config', async () => {
      const options = {
        configJson: 'not valid json',
        output: 'table' as const,
      };

      await expect(handler.setOrganizations(options)).rejects.toThrow();
    });

    test('[AC5] should throw error when config is empty', async () => {
      const options = {
        configJson: '[]',
        output: 'table' as const,
      };

      await expect(handler.setOrganizations(options)).rejects.toThrow();
    });

    test('[AC5] should throw error when required params are missing', async () => {
      const options = {
        aiDigitalHumanId: '',
        organizationIds: '1,2,3',
        output: 'table' as const,
      };

      await expect(handler.setOrganizations(options)).rejects.toThrow();
    });
  });

  describe('validateIds', () => {
    test('[AC5] should validate valid comma-separated IDs', () => {
      expect(() => (handler as unknown as { validateIds: (ids: string) => void }).validateIds('1,2,3')).not.toThrow();
    });

    test('[AC5] should throw error for empty IDs', () => {
      expect(() => (handler as unknown as { validateIds: (ids: string) => void }).validateIds('')).toThrow();
    });

    test('[AC5] should throw error for non-numeric IDs', () => {
      expect(() => (handler as unknown as { validateIds: (ids: string) => void }).validateIds('1,abc,3')).toThrow();
    });

    test('[AC5] should throw error when IDs exceed 100', () => {
      const ids = Array(101).fill(0).map((_, i) => i + 1).join(',');
      expect(() => (handler as unknown as { validateIds: (ids: string) => void }).validateIds(ids)).toThrow();
    });
  });

  describe('formatTimestamp', () => {
    test('should format 13-digit timestamp correctly', () => {
      const timestamp = 1704191006000;
      const result = (handler as unknown as { formatTimestamp: (ts: number) => string }).formatTimestamp(timestamp);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });
});
