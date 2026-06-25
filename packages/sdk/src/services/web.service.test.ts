import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { WebService } from './web.service.js';
import { PolyVClient } from '../client.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';

describe('WebService', () => {
  let service: WebService;
  let mockClient: { httpClient: { get: Mock; post: Mock } };

  beforeEach(() => {
    mockClient = {
      httpClient: {
        get: vi.fn(),
        post: vi.fn(),
      },
    };
    service = new WebService(mockClient as unknown as PolyVClient);
  });

  // ============================================
  // AC1: Web Info APIs
  // ============================================
  describe('getSplash', () => {
    it('should get splash settings successfully', async () => {
      const mockResponse = { splashEnabled: 'Y', splashImg: 'https://example.com/splash.png' };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getSplash('123456');

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v2/channelSetting/123456/getSplash'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for empty channelId', async () => {
      await expect(service.getSplash(''))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw validation error for whitespace channelId', async () => {
      await expect(service.getSplash('   '))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('setSplash', () => {
    it('should set splash successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setSplash({
        channelId: '123456',
        splashEnabled: 'Y',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channelSetting/123456/setSplash',
        null,
        { params: { splashEnabled: 'Y' } }
      );
      expect(result).toBe('success');
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.setSplash({
        channelId: '',
        splashEnabled: 'Y',
      })).rejects.toThrow('channelId is required');
    });

    it('should throw validation error for missing splashEnabled', async () => {
      await expect(service.setSplash({
        channelId: '123456',
        splashEnabled: '' as 'Y',
      })).rejects.toThrow('splashEnabled is required');
    });

    it('should throw validation error for invalid splashEnabled', async () => {
      await expect(service.setSplash({
        channelId: '123456',
        splashEnabled: 'INVALID' as 'Y',
      })).rejects.toThrow('splashEnabled must be Y or N');
    });
  });

  describe('setPublisher', () => {
    it('should set publisher successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('123456');

      const result = await service.setPublisher({
        userId: 'user123',
        publisher: 'John Doe',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channelSetting/user123/setPublisher',
        null,
        { params: { publisher: 'John Doe' } }
      );
      expect(result).toBe('123456');
    });

    it('should set publisher with channelId', async () => {
      mockClient.httpClient.post.mockResolvedValue('123456');

      await service.setPublisher({
        userId: 'user123',
        publisher: 'John Doe',
        channelId: '123456',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channelSetting/user123/setPublisher',
        null,
        { params: { publisher: 'John Doe', channelId: '123456' } }
      );
    });

    it('should throw validation error for missing userId', async () => {
      await expect(service.setPublisher({
        userId: '',
        publisher: 'John Doe',
      })).rejects.toThrow('userId is required');
    });

    it('should throw validation error for empty publisher', async () => {
      await expect(service.setPublisher({
        userId: 'user123',
        publisher: '',
      })).rejects.toThrow('publisher is required and cannot be empty');
    });

    it('should throw validation error for publisher too long', async () => {
      await expect(service.setPublisher({
        userId: 'user123',
        publisher: 'a'.repeat(51),
      })).rejects.toThrow('publisher cannot exceed 50 characters');
    });
  });

  describe('updateChannelName', () => {
    it('should update channel name successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const result = await service.updateChannelName({
        channelId: '123456',
        name: 'New Name',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channels/123456/update',
        null,
        { params: { name: 'New Name' } }
      );
      expect(result).toBe(true);
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.updateChannelName({
        channelId: '',
        name: 'New Name',
      })).rejects.toThrow('channelId is required');
    });

    it('should throw validation error for empty name', async () => {
      await expect(service.updateChannelName({
        channelId: '123456',
        name: '',
      })).rejects.toThrow('name is required and cannot be empty');
    });
  });

  describe('updateChannelLogo', () => {
    it('should throw validation error for missing channelId', async () => {
      await expect(service.updateChannelLogo({
        channelId: '',
        imgfile: {} as File,
      })).rejects.toThrow('channelId is required');
    });

    it('should throw validation error for missing imgfile', async () => {
      await expect(service.updateChannelLogo({
        channelId: '123456',
        imgfile: undefined as unknown as File,
      })).rejects.toThrow('imgfile is required');
    });
  });

  describe('liveLikes', () => {
    it('should get live likes successfully', async () => {
      const mockResponse = [{ channelId: '123456', likes: 100, viewers: 50 }];
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.liveLikes('123456,789012');

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v2/channels/live-likes',
        { params: { channelIds: '123456,789012' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for empty channelIds', async () => {
      await expect(service.liveLikes(''))
        .rejects.toThrow('channelIds is required');
    });
  });

  describe('updateLikes', () => {
    it('should update likes successfully', async () => {
      mockClient.httpClient.get.mockResolvedValue('success');

      const result = await service.updateLikes({
        channelId: '123456',
        likes: 99999,
        viewers: 1000000,
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v2/channels/123456/update-likes',
        { params: { likes: 99999, viewers: 1000000 } }
      );
      expect(result).toBe('success');
    });

    it('should update only likes', async () => {
      mockClient.httpClient.get.mockResolvedValue('success');

      await service.updateLikes({
        channelId: '123456',
        likes: 500,
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v2/channels/123456/update-likes',
        { params: { likes: 500 } }
      );
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.updateLikes({
        channelId: '',
        likes: 100,
      })).rejects.toThrow('channelId is required');
    });

    it('should throw validation error when no likes or viewers provided', async () => {
      await expect(service.updateLikes({
        channelId: '123456',
      })).rejects.toThrow('at least one of likes or viewers must be provided');
    });
  });

  describe('getCountdown', () => {
    it('should get countdown settings successfully', async () => {
      const mockResponse = { startTime: '2024-03-15 15:00:00', bookingEnabled: 'Y' };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getCountdown('123456');

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v2/channelSetting/123456/get-countdown'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for empty channelId', async () => {
      await expect(service.getCountdown(''))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('setCountdown', () => {
    it('should set countdown successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('');

      const result = await service.setCountdown({
        channelId: '123456',
        bookingEnabled: 'Y',
        startTime: '2024-03-15 15:00:00',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channelSetting/123456/set-countdown',
        null,
        { params: { bookingEnabled: 'Y', startTime: '2024-03-15 15:00:00' } }
      );
      expect(result).toBe('');
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.setCountdown({
        channelId: '',
      })).rejects.toThrow('channelId is required');
    });
  });

  // ============================================
  // AC2: Menu Management APIs
  // ============================================
  describe('getMenuList', () => {
    it('should get menu list successfully', async () => {
      const mockResponse = [{ menuId: '1', name: 'Menu 1', type: 'text' }];
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getMenuList({ channelId: '123456' });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/menu/list',
        { params: { channelId: '123456' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get menu list with lang parameter', async () => {
      const mockResponse = [];
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      await service.getMenuList({ channelId: '123456', lang: 'en' as 'zh_CN' });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/menu/list',
        { params: { channelId: '123456', lang: 'en' } }
      );
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.getMenuList({ channelId: '' }))
        .rejects.toThrow('channelId is required');
    });
  });

  describe('addMenu', () => {
    it('should add menu successfully', async () => {
      const mockResponse = { menuId: 'menu123' };
      mockClient.httpClient.post.mockResolvedValue(mockResponse);

      const result = await service.addMenu({
        channelId: '123456',
        name: 'My Menu',
        type: 'text',
        content: 'Menu content',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/menu/add',
        null,
        { params: { channelId: '123456', name: 'My Menu', type: 'text', content: 'Menu content' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.addMenu({
        channelId: '',
        name: 'My Menu',
        type: 'text',
      })).rejects.toThrow('channelId is required');
    });

    it('should throw validation error for missing name', async () => {
      await expect(service.addMenu({
        channelId: '123456',
        name: '',
        type: 'text',
      })).rejects.toThrow('name is required and cannot be empty');
    });

    it('should throw validation error for missing type', async () => {
      await expect(service.addMenu({
        channelId: '123456',
        name: 'My Menu',
        type: '' as 'text',
      })).rejects.toThrow('type is required');
    });

    it('should throw validation error for invalid type', async () => {
      await expect(service.addMenu({
        channelId: '123456',
        name: 'My Menu',
        type: 'invalid' as 'desc',
      })).rejects.toThrow('type must be one of');
    });
  });

  describe('deleteMenu', () => {
    it('should delete menus successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue(1);

      const result = await service.deleteMenu({ menuIds: 'menu1,menu2' });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/menu/delete',
        null,
        { params: { menuIds: 'menu1,menu2' } }
      );
      expect(result).toBe(1);
    });

    it('should throw validation error for missing menuIds', async () => {
      await expect(service.deleteMenu({ menuIds: '' }))
        .rejects.toThrow('menuIds is required');
    });
  });

  describe('updateMenu', () => {
    it('should update menu successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.updateMenu({
        channelId: '123456',
        menuId: 'menu123',
        content: 'Updated content',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/menu/update',
        null,
        { params: { channelId: '123456', menuId: 'menu123', content: 'Updated content' } }
      );
      expect(result).toBe('success');
    });

    it('should throw validation error for missing menuId', async () => {
      await expect(service.updateMenu({
        channelId: '123456',
        menuId: '',
        content: 'content',
      })).rejects.toThrow('menuId is required');
    });

    it('should throw validation error for missing content', async () => {
      await expect(service.updateMenu({
        channelId: '123456',
        menuId: 'menu123',
        content: undefined as unknown as string,
      })).rejects.toThrow('content is required');
    });
  });

  describe('setMenu', () => {
    it('should set menu successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setMenu({
        userId: 'user123',
        channelId: '123456',
        menuType: 'desc',
        content: '<p>Introduction</p>',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channelSetting/user123/123456/set-menu',
        null,
        { params: { menuType: 'desc', content: '<p>Introduction</p>' } }
      );
      expect(result).toBe('success');
    });

    it('should throw validation error for missing userId', async () => {
      await expect(service.setMenu({
        userId: '',
        channelId: '123456',
        menuType: 'desc',
        content: 'content',
      })).rejects.toThrow('userId is required');
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.setMenu({
        userId: 'user123',
        channelId: '',
        menuType: 'desc',
        content: 'content',
      })).rejects.toThrow('channelId is required');
    });

    it('should throw validation error for missing menuType', async () => {
      await expect(service.setMenu({
        userId: 'user123',
        channelId: '123456',
        menuType: '' as 'desc',
        content: 'content',
      })).rejects.toThrow('menuType is required');
    });

    it('should throw validation error for invalid menuType', async () => {
      await expect(service.setMenu({
        userId: 'user123',
        channelId: '123456',
        menuType: 'invalid' as 'desc',
        content: 'content',
      })).rejects.toThrow('menuType must be desc');
    });

    it('should throw validation error for missing content', async () => {
      await expect(service.setMenu({
        userId: 'user123',
        channelId: '123456',
        menuType: 'desc',
        content: undefined as unknown as string,
      })).rejects.toThrow('content is required');
    });
  });

  describe('updateRank', () => {
    it('should update rank successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.updateRank({
        channelId: '123456',
        menuIds: 'menu1,menu2,menu3',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/menu/update-rank',
        null,
        { params: { channelId: '123456', menuIds: 'menu1,menu2,menu3' } }
      );
      expect(result).toBe('success');
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.updateRank({
        channelId: '',
        menuIds: 'menu1,menu2',
      })).rejects.toThrow('channelId is required');
    });

    it('should throw validation error for missing menuIds', async () => {
      await expect(service.updateRank({
        channelId: '123456',
        menuIds: '',
      })).rejects.toThrow('menuIds is required');
    });
  });

  describe('updateConsultingEnabled', () => {
    it('should update consulting enabled successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('');

      const result = await service.updateConsultingEnabled({
        channelId: '123456',
        enabled: 'Y',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channel/menu/123456/update-consulting-enabled',
        null,
        { params: { enabled: 'Y' } }
      );
      expect(result).toBe('');
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.updateConsultingEnabled({
        channelId: '',
        enabled: 'Y',
      })).rejects.toThrow('channelId is required');
    });

    it('should throw validation error for missing enabled', async () => {
      await expect(service.updateConsultingEnabled({
        channelId: '123456',
        enabled: '' as 'Y',
      })).rejects.toThrow('enabled is required');
    });

    it('should throw validation error for invalid enabled', async () => {
      await expect(service.updateConsultingEnabled({
        channelId: '123456',
        enabled: 'INVALID' as 'Y',
      })).rejects.toThrow('enabled must be Y or N');
    });
  });

  describe('getTuwenList', () => {
    it('should get tuwen list successfully', async () => {
      const mockResponse = { contents: [], total: 0 };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getTuwenList({ channelId: '123456' });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/watch/tuwen/list',
        { params: { channelId: '123456' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.getTuwenList({ channelId: '' }))
        .rejects.toThrow('channelId is required');
    });
  });

  // ============================================
  // Story 4.3: Page Interaction APIs
  // ============================================
  describe('getDonate', () => {
    it('should get donate settings with channelId', async () => {
      const mockResponse = { cashEnabled: 'Y', goodEnabled: 'N' };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getDonate('123456');

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/donate/get',
        { params: { channelId: '123456' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get global donate settings', async () => {
      const mockResponse = { cashEnabled: 'N', goodEnabled: 'N' };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getDonate();

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/donate/get',
        { params: {} }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getWeixinShare', () => {
    it('should get weixin share settings successfully', async () => {
      const mockResponse = { weixinShareTitle: 'My Live', weixinShareDesc: 'Join now!' };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getWeixinShare('123456');

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/weixin-share/get',
        { params: { channelId: '123456' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for empty channelId', async () => {
      await expect(service.getWeixinShare(''))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('updateCash', () => {
    it('should update cash successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.updateCash({
        channelId: '123456',
        cashes: [1, 2, 5, 10, 50, 100],
        cashMin: 1,
        enabled: 'Y',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/donate/update-cash',
        {
          channelId: '123456',
          cashes: [1, 2, 5, 10, 50, 100],
          cashMin: 1,
          enabled: 'Y',
        }
      );
      expect(result).toBe('success');
    });

    it('should throw validation error for missing cashes', async () => {
      await expect(service.updateCash({
        cashes: undefined as unknown as number[],
        cashMin: 1,
      })).rejects.toThrow('cashes is required and must be an array');
    });

    it('should throw validation error for cashes not 6 items', async () => {
      await expect(service.updateCash({
        cashes: [1, 2, 3],
        cashMin: 1,
      })).rejects.toThrow('cashes must contain exactly 6 numbers');
    });

    it('should throw validation error for missing cashMin', async () => {
      await expect(service.updateCash({
        cashes: [1, 2, 5, 10, 50, 100],
        cashMin: undefined as unknown as number,
      })).rejects.toThrow('cashMin is required');
    });

    it('should throw validation error for invalid enabled', async () => {
      await expect(service.updateCash({
        cashes: [1, 2, 5, 10, 50, 100],
        cashMin: 1,
        enabled: 'INVALID' as 'Y',
      })).rejects.toThrow('enabled must be Y or N');
    });
  });

  describe('updateGood', () => {
    it('should update good successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.updateGood({
        channelId: '123456',
        goods: [
          { goodName: 'Rose', goodImg: 'http://example.com/rose.png', goodPrice: 10, goodEnabled: 'Y' },
        ],
        enabled: 'Y',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/donate/update-good',
        {
          channelId: '123456',
          goods: [
            { goodName: 'Rose', goodImg: 'http://example.com/rose.png', goodPrice: 10, goodEnabled: 'Y' },
          ],
          enabled: 'Y',
        }
      );
      expect(result).toBe('success');
    });

    it('should throw validation error for missing goods', async () => {
      await expect(service.updateGood({
        goods: undefined as unknown as { goodName: string; goodImg: string; goodPrice: number; goodEnabled: string }[],
      })).rejects.toThrow('goods is required and must be an array');
    });

    it('should throw validation error for goods count out of range', async () => {
      await expect(service.updateGood({
        goods: [],
      })).rejects.toThrow('goods must contain 1-10 items');
    });

    it('should throw validation error for missing goodName', async () => {
      await expect(service.updateGood({
        goods: [
          { goodName: '', goodImg: 'http://example.com/rose.png', goodPrice: 10, goodEnabled: 'Y' },
        ],
      })).rejects.toThrow('goodName is required and must be max 5 characters');
    });

    it('should throw validation error for goodName too long', async () => {
      await expect(service.updateGood({
        goods: [
          { goodName: '123456', goodImg: 'http://example.com/rose.png', goodPrice: 10, goodEnabled: 'Y' },
        ],
      })).rejects.toThrow('goodName is required and must be max 5 characters');
    });

    it('should throw validation error for missing goodImg', async () => {
      await expect(service.updateGood({
        goods: [
          { goodName: 'Rose', goodImg: '', goodPrice: 10, goodEnabled: 'Y' },
        ],
      })).rejects.toThrow('goodImg is required and must be max 120 characters');
    });

    it('should throw validation error for missing goodPrice', async () => {
      await expect(service.updateGood({
        goods: [
          { goodName: 'Rose', goodImg: 'http://example.com/rose.png', goodPrice: undefined as unknown as number, goodEnabled: 'Y' },
        ],
      })).rejects.toThrow('goodPrice is required');
    });

    it('should throw validation error for invalid goodEnabled', async () => {
      await expect(service.updateGood({
        goods: [
          { goodName: 'Rose', goodImg: 'http://example.com/rose.png', goodPrice: 10, goodEnabled: 'INVALID' as 'Y' },
        ],
      })).rejects.toThrow('goodEnabled is required and must be Y or N');
    });
  });

  describe('updateWeixinShare', () => {
    it('should update weixin share successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.updateWeixinShare({
        channelId: '123456',
        weixinShareTitle: 'My Live Stream',
        weixinShareDesc: 'Join my live stream!',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/weixin-share/update',
        null,
        { params: { channelId: '123456', weixinShareTitle: 'My Live Stream', weixinShareDesc: 'Join my live stream!' } }
      );
      expect(result).toBe('success');
    });

    it('should throw validation error for title too long', async () => {
      await expect(service.updateWeixinShare({
        channelId: '123456',
        weixinShareTitle: 'a'.repeat(31),
      })).rejects.toThrow('weixinShareTitle must be max 30 characters');
    });

    it('should throw validation error for desc too long', async () => {
      await expect(service.updateWeixinShare({
        channelId: '123456',
        weixinShareDesc: 'a'.repeat(121),
      })).rejects.toThrow('weixinShareDesc must be max 120 characters');
    });

    it('should throw validation error for empty channelId', async () => {
      await expect(service.updateWeixinShare({
        channelId: '',
      })).rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // Story 4.3: Setting APIs
  // ============================================
  describe('updateGlobalEnabled', () => {
    it('should update global enabled successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.updateGlobalEnabled({
        channelId: '123456',
        globalEnabledType: 'donate',
        enabled: 'Y',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/common/update-global-enabled',
        null,
        { params: { channelId: '123456', globalEnabledType: 'donate', enabled: 'Y' } }
      );
      expect(result).toBe('success');
    });

    it('should throw validation error for invalid globalEnabledType', async () => {
      await expect(service.updateGlobalEnabled({
        channelId: '123456',
        globalEnabledType: 'invalid' as 'donate',
        enabled: 'Y',
      })).rejects.toThrow('globalEnabledType must be one of');
    });

    it('should throw validation error for invalid enabled', async () => {
      await expect(service.updateGlobalEnabled({
        channelId: '123456',
        globalEnabledType: 'donate',
        enabled: 'INVALID' as 'Y',
      })).rejects.toThrow('enabled is required and must be Y or N');
    });
  });

  describe('uploadImage', () => {
    it('should throw validation error for invalid type', async () => {
      await expect(service.uploadImage({
        type: 'invalid' as 'coverImage',
        files: [{} as File],
      })).rejects.toThrow('type must be one of');
    });

    it('should throw validation error for missing files', async () => {
      await expect(service.uploadImage({
        type: 'coverImage',
        files: undefined as unknown as File[],
      })).rejects.toThrow('files is required and must be a non-empty array');
    });

    it('should throw validation error for too many files', async () => {
      await expect(service.uploadImage({
        type: 'coverImage',
        files: [1, 2, 3, 4, 5, 6, 7] as unknown as File[],
      })).rejects.toThrow('files must contain 1-6 files');
    });
  });

  // ============================================
  // Story 4.5: Watch Condition APIs
  // ============================================
  describe('getWatchCondition', () => {
    it('should get watch condition with channelId', async () => {
      const mockResponse = { authSettings: [] };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getWatchCondition({ channelId: '123456' });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/auth/get',
        { params: { channelId: '123456' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get global watch condition', async () => {
      const mockResponse = { authSettings: [] };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getWatchCondition({});

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/auth/get',
        { params: {} }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('setWatchCondition', () => {
    it('should set watch condition successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setWatchCondition({
        channelId: '123456',
        authSettings: [
          { rank: 1, enabled: 'Y', authType: 'code' },
        ],
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/auth/update',
        {
          authSettings: [
            { rank: 1, enabled: 'Y', authType: 'code' },
          ],
        },
        { params: { channelId: '123456' }, headers: { 'Content-Type': 'application/json' } }
      );
      expect(result).toBe('success');
    });

    it('should throw validation error for missing authSettings', async () => {
      await expect(service.setWatchCondition({
        authSettings: undefined as unknown as { rank: 1 | 2; enabled: string }[],
      })).rejects.toThrow('authSettings is required and must be an array');
    });

    it('should throw validation error for empty authSettings', async () => {
      await expect(service.setWatchCondition({
        authSettings: [],
      })).rejects.toThrow('authSettings must contain at least one item');
    });

    it('should throw validation error for invalid rank', async () => {
      await expect(service.setWatchCondition({
        authSettings: [{ rank: 3 as 1, enabled: 'Y' }],
      })).rejects.toThrow('rank must be 1 or 2');
    });

    it('should throw validation error for invalid enabled', async () => {
      await expect(service.setWatchCondition({
        authSettings: [{ rank: 1, enabled: 'INVALID' as 'Y' }],
      })).rejects.toThrow('enabled must be Y or N');
    });
  });

  describe('setAuthType', () => {
    it('should set auth type successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setAuthType({
        channelId: '123456',
        authType: 'none',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channelSetting/123456/set-auth-type',
        null,
        { params: { authType: 'none' } }
      );
      expect(result).toBe('success');
    });

    it('should throw validation error for invalid authType', async () => {
      await expect(service.setAuthType({
        channelId: '123456',
        authType: 'invalid' as 'none',
      })).rejects.toThrow('authType must be "none"');
    });
  });

  describe('getWhiteList', () => {
    it('should get white list successfully', async () => {
      const mockResponse = { contents: [], total: 0 };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getWhiteList({
        rank: 1,
        channelId: '123456',
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/auth/get-white-list',
        { params: { rank: 1, channelId: '123456' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for invalid rank', async () => {
      await expect(service.getWhiteList({
        rank: 3 as 1,
        channelId: '123456',
      })).rejects.toThrow('rank must be 1 or 2');
    });
  });

  describe('addWhiteList', () => {
    it('should add white list successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.addWhiteList({
        rank: 1,
        code: '13800138000',
        name: 'John Doe',
        channelId: '123456',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/auth/add-white-list',
        null,
        { params: { rank: 1, code: '13800138000', name: 'John Doe', channelId: '123456' } }
      );
      expect(result).toBe('success');
    });

    it('should throw validation error for invalid rank', async () => {
      await expect(service.addWhiteList({
        rank: 3 as 1,
        code: '13800138000',
      })).rejects.toThrow('rank must be 1 or 2');
    });

    it('should throw validation error for missing code', async () => {
      await expect(service.addWhiteList({
        rank: 1,
        code: '',
      })).rejects.toThrow('code is required');
    });

    it('should throw validation error for code too long', async () => {
      await expect(service.addWhiteList({
        rank: 1,
        code: 'a'.repeat(51),
      })).rejects.toThrow('code cannot exceed 50 characters');
    });

    it('should throw validation error for name too long', async () => {
      await expect(service.addWhiteList({
        rank: 1,
        code: '13800138000',
        name: 'a'.repeat(51),
      })).rejects.toThrow('name cannot exceed 50 characters');
    });
  });

  describe('updateWhiteList', () => {
    it('should update white list successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.updateWhiteList({
        rank: 1,
        oldCode: '13800138000',
        code: '13900139000',
        name: 'Updated Name',
        channelId: '123456',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/auth/update-white-list',
        null,
        { params: { rank: 1, oldCode: '13800138000', code: '13900139000', name: 'Updated Name', channelId: '123456' } }
      );
      expect(result).toBe('success');
    });

    it('should throw validation error for invalid rank', async () => {
      await expect(service.updateWhiteList({
        rank: 3 as 1,
        oldCode: '13800138000',
        code: '13900139000',
      })).rejects.toThrow('rank must be 1 or 2');
    });

    it('should throw validation error for missing oldCode', async () => {
      await expect(service.updateWhiteList({
        rank: 1,
        oldCode: '',
        code: '13900139000',
      })).rejects.toThrow('oldCode is required');
    });

    it('should throw validation error for missing code', async () => {
      await expect(service.updateWhiteList({
        rank: 1,
        oldCode: '13800138000',
        code: '',
      })).rejects.toThrow('code is required');
    });
  });

  describe('deleteWhiteList', () => {
    it('should delete white list items successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.deleteWhiteList({
        rank: 1,
        isClear: 'N',
        codes: '13800138000,13800138001',
        channelId: '123456',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/auth/delete-white-list',
        null,
        { params: { rank: 1, isClear: 'N', code: '13800138000,13800138001', channelId: '123456' } }
      );
      expect(result).toBe('success');
    });

    it('should clear all white list successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.deleteWhiteList({
        rank: 1,
        isClear: 'Y',
        channelId: '123456',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/auth/delete-white-list',
        null,
        { params: { rank: 1, isClear: 'Y', channelId: '123456' } }
      );
      expect(result).toBe('success');
    });

    it('should throw validation error for invalid rank', async () => {
      await expect(service.deleteWhiteList({
        rank: 3 as 1,
        isClear: 'Y',
      })).rejects.toThrow('rank must be 1 or 2');
    });

    it('should throw validation error for missing isClear', async () => {
      await expect(service.deleteWhiteList({
        rank: 1,
        isClear: '' as 'Y',
      })).rejects.toThrow('isClear is required');
    });

    it('should throw validation error for missing codes when isClear=N', async () => {
      await expect(service.deleteWhiteList({
        rank: 1,
        isClear: 'N',
        codes: '',
      })).rejects.toThrow('codes is required when isClear=N');
    });
  });

  describe('uploadWhiteList', () => {
    it('should throw validation error for invalid rank', async () => {
      await expect(service.uploadWhiteList({
        rank: 3 as 1,
        file: {} as File,
      })).rejects.toThrow('rank must be 1 or 2');
    });

    it('should throw validation error for missing file', async () => {
      await expect(service.uploadWhiteList({
        rank: 1,
        file: undefined as unknown as File,
      })).rejects.toThrow('file is required');
    });
  });

  describe('downloadWhiteList', () => {
    it('should throw validation error for invalid rank', async () => {
      await expect(service.downloadWhiteList({
        rank: 3 as 1,
        channelId: '123456',
      })).rejects.toThrow('rank must be 1 or 2');
    });

    it('should download whitelist as an ArrayBuffer', async () => {
      const buffer = new ArrayBuffer(8);
      mockClient.httpClient.get.mockResolvedValueOnce(buffer);

      const result = await service.downloadWhiteList({ rank: 1, channelId: '123456' });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/auth/download-white-list',
        { params: { rank: 1, channelId: '123456' }, responseType: 'arraybuffer' }
      );
      expect(result).toBe(buffer);
    });
  });

  describe('setExternalAuth', () => {
    it('should set external auth successfully', async () => {
      const mockResponse = [{ channelId: 2191532, secretKey: 'secret-key' }];
      mockClient.httpClient.post.mockResolvedValue(mockResponse);

      const result = await service.setExternalAuth({
        userId: 'user123',
        externalUri: 'https://auth.example.com',
        channelId: '123456',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channelSetting/user123/auth-external',
        null,
        { params: { externalUri: 'https://auth.example.com', channelId: '123456' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for missing externalUri', async () => {
      await expect(service.setExternalAuth({
        userId: 'user123',
        externalUri: '',
      })).rejects.toThrow('externalUri is required');
    });
  });

  describe('setCustomAuth', () => {
    it('should set custom auth successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setCustomAuth({
        channelId: '123456',
        customKey: 'key123',
        customUri: 'https://auth.example.com/custom',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/auth/custom/set',
        null,
        { params: { channelId: '123456', customKey: 'key123', customUri: 'https://auth.example.com/custom' } }
      );
      expect(result).toBe('success');
    });
  });

  describe('setDirectAuth', () => {
    it('should set direct auth successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.setDirectAuth({
        channelId: '123456',
        directKey: 'direct-key-123',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/auth/direct/set',
        null,
        { params: { channelId: '123456', directKey: 'direct-key-123' } }
      );
      expect(result).toBe('success');
    });
  });

  describe('directAuth', () => {
    it('should get direct auth successfully', async () => {
      const mockResponse = { directKey: 'direct-key-123' };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.directAuth({ channelId: '123456' });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/auth/direct/get',
        { params: { channelId: '123456' } }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getRecordField', () => {
    it('should get record field successfully', async () => {
      const mockResponse = { infoFields: [] };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getRecordField({ channelId: '123456', rank: 1 });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/auth/get-record-field',
        { params: { channelId: '123456', rank: 1 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error when rank is invalid', async () => {
      await expect(service.getRecordField({ channelId: '123456', rank: 3 }))
        .rejects.toThrow('rank must be 1 (primary) or 2 (secondary)');
    });
  });

  describe('getRecordInfo', () => {
    it('should get record info successfully', async () => {
      const mockResponse = { contents: [], total: 0 };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getRecordInfo({ channelId: '123456' });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/auth/get-record-info',
        { params: { channelId: '123456' } }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('enrollList', () => {
    it('should get enroll list successfully', async () => {
      const mockResponse = { auditEnabled: 'N', list: [] };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.enrollList({
        channelId: '123456',
        viewerIds: 'viewer1,viewer2',
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/enroll/list',
        { params: { channelId: '123456', viewerIds: 'viewer1,viewer2' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error when viewerIds exceeds 20 items', async () => {
      await expect(service.enrollList({
        channelId: '123456',
        viewerIds: Array.from({ length: 21 }, (_, index) => `viewer${index}`).join(','),
      })).rejects.toThrow('viewerIds cannot contain more than 20 items');
    });
  });

  describe('downloadRecordInfo', () => {
    it('should download record info successfully', async () => {
      const mockResponse = new ArrayBuffer(0);
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.downloadRecordInfo({ channelId: '123456', rank: 1 });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/auth/download-record-info',
        { params: { channelId: '123456', rank: 1 }, responseType: 'arraybuffer' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error when rank is invalid', async () => {
      await expect(service.downloadRecordInfo({ channelId: '123456', rank: 0 }))
        .rejects.toThrow('rank must be 1 (primary) or 2 (secondary)');
    });
  });

  describe('updateAuthUrl', () => {
    it('should update auth url successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('success');

      const result = await service.updateAuthUrl({
        channelId: '123456',
        url: 'https://example.com/auth-callback',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/restrict/update-auth-url',
        null,
        { params: { channelId: '123456', url: 'https://example.com/auth-callback' } }
      );
      expect(result).toBe('success');
    });
  });

  describe('setAuthorizedAddress', () => {
    it('should set authorized address successfully', async () => {
      const mockResponse = [{ channelId: 2191532, secretKey: 'secret-key' }];
      mockClient.httpClient.post.mockResolvedValue(mockResponse);

      const result = await service.setAuthorizedAddress({
        userId: 'user123',
        channelId: '123456',
        customUri: 'https://example.com/custom-auth',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channelSetting/user123/oauth-custom',
        null,
        { params: { customUri: 'https://example.com/custom-auth', channelId: '123456' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for missing customUri', async () => {
      await expect(service.setAuthorizedAddress({
        userId: 'user123',
        customUri: '',
      })).rejects.toThrow('customUri is required');
    });
  });

  describe('customauth2', () => {
    it('should get custom auth info successfully', async () => {
      const mockResponse = { customKey: 'key123', customUri: 'https://auth.example.com' };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.customauth2('123456');

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/auth/customauth2',
        { params: { channelId: '123456' } }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('polyvUrl', () => {
    it('should get polyv url successfully', async () => {
      const mockResponse = { url: 'https://polyv.example.com/auth' };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.polyvUrl('123456');

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/auth/polyv-url',
        { params: { channelId: '123456' } }
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
