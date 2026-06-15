/**
 * @fileoverview Unit tests for V4ChannelService - Template Management
 * @module services/v4/channel.service.template.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { V4ChannelService } from './channel.service.js';
import type { PolyVClient } from '../../client.js';

// Mock the PolyVClient
const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
} as unknown as PolyVClient;

describe('V4ChannelService - Template Management', () => {
  let service: V4ChannelService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4ChannelService(mockClient);
  });

  // ============================================
  // channelUpdateTemplate Tests
  // ============================================

  describe('channelUpdateTemplate', () => {
    it('[P0] should update channel template to ppt successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.channelUpdateTemplate({
        channelId: '12345678',
        template: 'ppt'
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/operate/channel-update-template',
        null,
        expect.objectContaining({
          params: expect.objectContaining({
            channelId: '12345678',
            template: 'ppt'
          })
        })
      );
    });

    it('[P0] should update channel template to alone successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.channelUpdateTemplate({
        channelId: '12345678',
        template: 'alone'
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/operate/channel-update-template',
        null,
        expect.objectContaining({
          params: expect.objectContaining({
            template: 'alone'
          })
        })
      );
    });

    it('[P1] should update template with all available types', async () => {
      const templates = ['ppt', 'alone', 'topclass', 'alv', 'v541'] as const;

      for (const template of templates) {
        mockHttpClient.post.mockResolvedValueOnce(undefined);

        await service.channelUpdateTemplate({
          channelId: '12345678',
          template
        });

        expect(mockHttpClient.post).toHaveBeenCalledWith(
          expect.any(String),
          null,
          expect.objectContaining({
            params: expect.objectContaining({ template })
          })
        );
      }
    });

    it('[P1] should handle template update for newly created channel', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.channelUpdateTemplate({
        channelId: '99999999',
        template: 'ppt'
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });

    it('[P2] should handle network error during template update', async () => {
      mockHttpClient.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        service.channelUpdateTemplate({
          channelId: '12345678',
          template: 'ppt'
        })
      ).rejects.toThrow('Network error');
    });
  });

  // ============================================
  // create with different templates Tests
  // ============================================

  describe('create - Template Scenarios', () => {
    it('[P0] should create channel with ppt template', async () => {
      const mockResponse = { channelId: '12345678', name: 'Test Channel' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.create({
        name: 'PPT Channel',
        newScene: 'ppt',
        template: 'ppt'
      });

      expect(result.channelId).toBe('12345678');
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/create',
        expect.objectContaining({
          template: 'ppt'
        })
      );
    });

    it('[P0] should create channel with alone template', async () => {
      const mockResponse = { channelId: '12345679', name: 'Alone Channel' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.create({
        name: 'Alone Channel',
        newScene: 'topclass',
        template: 'alone'
      });

      expect(result.channelId).toBe('12345679');
    });

    it('[P1] should create channel with custom template settings', async () => {
      const mockResponse = { channelId: '12345680' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.create({
        name: 'Custom Channel',
        newScene: 'topclass',
        template: 'ppt',
        channelPasswd: '123456',
        scene: 'live'
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          channelPasswd: '123456',
          scene: 'live'
        })
      );
    });

    it('[P2] should create channel with minimal template params', async () => {
      const mockResponse = { channelId: '12345681' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.create({
        name: 'Minimal Channel',
        newScene: 'topclass',
        template: 'ppt'
      });

      expect(result.channelId).toBeDefined();
    });
  });

  // ============================================
  // basicCreate Tests (Legacy Template)
  // ============================================

  describe('basicCreate', () => {
    it('[P0] should create basic channel with template', async () => {
      const mockResponse = { channelId: '12345682', name: 'Basic Channel' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.basicCreate({
        name: 'Basic Channel',
        channelPasswd: 'password123'
      });

      expect(result.channelId).toBe('12345682');
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/basic-create',
        expect.objectContaining({
          name: 'Basic Channel'
        })
      );
    });

    it('[P1] should throw error when name is empty in basicCreate', async () => {
      await expect(
        service.basicCreate({ name: '' })
      ).rejects.toThrow('name is required');
    });

    it('[P2] should create basic channel with minimal params', async () => {
      const mockResponse = { channelId: '12345683' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.basicCreate({
        name: 'Minimal Basic'
      });

      expect(result.channelId).toBeDefined();
    });
  });

  // ============================================
  // createMr Tests (MR Channel Template)
  // ============================================

  describe('createMr', () => {
    it('[P0] should create MR channel successfully', async () => {
      const mockResponse = {
        channelId: '12345684',
        name: 'MR Channel',
        type: 'mr'
      };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createMr({
        name: 'MR Channel',
        newScene: 'topclass'
      });

      expect(result.channelId).toBe('12345684');
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/create-mr',
        expect.objectContaining({
          name: 'MR Channel'
        })
      );
    });

    it('[P1] should throw error when name is empty in createMr', async () => {
      await expect(
        service.createMr({ name: '', newScene: 'topclass' })
      ).rejects.toThrow('name is required');
    });

    it('[P2] should create MR channel with custom scene', async () => {
      const mockResponse = { channelId: '12345685' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createMr({
        name: 'Custom MR',
        newScene: 'alv'
      });

      expect(result.channelId).toBeDefined();
    });
  });

  // ============================================
  // Template-related List Operations
  // ============================================

  describe('Template List Operations', () => {
    it('[P0] should list channels with template info', async () => {
      const mockResponse = {
        contents: [
          { channelId: '123', name: 'Channel 1', template: 'ppt' },
          { channelId: '124', name: 'Channel 2', template: 'alone' }
        ]
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listChannelBasic({
        pageNumber: 1,
        pageSize: 10
      });

      expect(result.contents).toHaveLength(2);
      expect(result.contents[0].template).toBe('ppt');
    });

    it('[P1] should filter channels by template', async () => {
      const mockResponse = {
        contents: [
          { channelId: '123', template: 'ppt' }
        ]
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listChannelBasic({
        pageNumber: 1,
        pageSize: 10,
        template: 'ppt'
      });

      expect(result.contents).toHaveLength(1);
    });

    it('[P2] should get channel detail with template info', async () => {
      const mockResponse = {
        channelId: '12345678',
        name: 'Test Channel',
        template: 'ppt',
        scene: 'topclass'
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getChannelDetail({ channelId: '12345678' });

      expect(result.template).toBe('ppt');
      expect(result.scene).toBe('topclass');
    });
  });

  // ============================================
  // Template Validation Tests
  // ============================================

  describe('Template Validation', () => {
    it('[P1] should accept valid template names', async () => {
      const validTemplates = ['ppt', 'alone', 'topclass'];

      for (const template of validTemplates) {
        mockHttpClient.post.mockResolvedValueOnce({ channelId: '123' });

        await service.create({
          name: `Channel with ${template}`,
          newScene: 'topclass',
          template: template as any
        });

        expect(mockHttpClient.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ template })
        );
      }
    });

    it('[P2] should handle API validation error for invalid template', async () => {
      mockHttpClient.post.mockRejectedValueOnce(
        new Error('Invalid template value')
      );

      await expect(
        service.create({
          name: 'Invalid Template',
          newScene: 'topclass',
          template: 'invalid' as any
        })
      ).rejects.toThrow('Invalid template value');
    });
  });
});
