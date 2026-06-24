import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { PlayerService } from './player.service.js';
import { PolyVClient } from '../client.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';

describe('PlayerService', () => {
  let service: PlayerService;
  let mockClient: { httpClient: { get: Mock; post: Mock } };

  beforeEach(() => {
    mockClient = {
      httpClient: {
        get: vi.fn(),
        post: vi.fn(),
      },
    };
    service = new PlayerService(mockClient as unknown as PolyVClient);
  });

  // ============================================
  // Anti-Record Settings APIs
  // ============================================
  describe('setAntiRecordSettings', () => {
    it('should set anti-record settings with marquee type successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('SUCCESS');

      const result = await service.setAntiRecordSettings(123456, {
        antiRecordType: 'marquee',
        modelType: 'fixed',
        content: '用户ID：12345',
        fontSize: 14,
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/anti/record/setting',
        null,
        {
          params: {
            channelId: 123456,
            antiRecordType: 'marquee',
            modelType: 'fixed',
            content: '用户ID：12345',
            fontSize: 14,
          },
        }
      );
      expect(result).toBe('SUCCESS');
    });

    it('should set anti-record settings with watermark type successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue('SUCCESS');

      const result = await service.setAntiRecordSettings(123456, {
        antiRecordType: 'watermark',
        modelType: 'nickname',
        content: 'user content',
        fontSize: 'middle',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/anti/record/setting',
        null,
        {
          params: {
            channelId: 123456,
            antiRecordType: 'watermark',
            modelType: 'nickname',
            content: 'user content',
            fontSize: 'middle',
          },
        }
      );
      expect(result).toBe('SUCCESS');
    });

    it('should set anti-record settings with all optional params', async () => {
      mockClient.httpClient.post.mockResolvedValue('SUCCESS');

      await service.setAntiRecordSettings(123456, {
        antiRecordType: 'marquee',
        modelType: 'diyurl',
        content: 'https://example.com/{userId}',
        fontSize: 20,
        opacity: 50,
        fontColor: '#FF0000',
        showMode: 'roll',
        doubleEnabled: 'Y',
        autoZoomEnabled: 'N',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/anti/record/setting',
        null,
        {
          params: {
            channelId: 123456,
            antiRecordType: 'marquee',
            modelType: 'diyurl',
            content: 'https://example.com/{userId}',
            fontSize: 20,
            opacity: 50,
            fontColor: '#FF0000',
            showMode: 'roll',
            doubleEnabled: 'Y',
            autoZoomEnabled: 'N',
          },
        }
      );
    });

    it('should throw validation error for missing antiRecordType', async () => {
      await expect(service.setAntiRecordSettings(123456, {
        antiRecordType: '' as 'marquee',
        modelType: 'fixed',
        content: 'test',
        fontSize: 14,
      })).rejects.toThrow('antiRecordType is required');
    });

    it('should throw validation error for missing modelType', async () => {
      await expect(service.setAntiRecordSettings(123456, {
        antiRecordType: 'marquee',
        modelType: '' as 'fixed',
        content: 'test',
        fontSize: 14,
      })).rejects.toThrow('modelType is required');
    });

    it('should throw validation error for missing content', async () => {
      await expect(service.setAntiRecordSettings(123456, {
        antiRecordType: 'marquee',
        modelType: 'fixed',
        content: undefined as unknown as string,
        fontSize: 14,
      })).rejects.toThrow('content is required');
    });

    it('should throw validation error for missing fontSize', async () => {
      await expect(service.setAntiRecordSettings(123456, {
        antiRecordType: 'marquee',
        modelType: 'fixed',
        content: 'test',
        fontSize: undefined as unknown as number,
      })).rejects.toThrow('fontSize is required');
    });

    it('should throw validation error for invalid antiRecordType', async () => {
      await expect(service.setAntiRecordSettings(123456, {
        antiRecordType: 'invalid' as 'marquee',
        modelType: 'fixed',
        content: 'test',
        fontSize: 14,
      })).rejects.toThrow('antiRecordType must be one of: marquee, watermark');
    });

    it('should throw validation error for invalid modelType', async () => {
      await expect(service.setAntiRecordSettings(123456, {
        antiRecordType: 'marquee',
        modelType: 'invalid' as 'fixed',
        content: 'test',
        fontSize: 14,
      })).rejects.toThrow('modelType must be one of: fixed, nickname, diyurl');
    });

    it('should throw validation error for invalid fontSize (marquee)', async () => {
      await expect(service.setAntiRecordSettings(123456, {
        antiRecordType: 'marquee',
        modelType: 'fixed',
        content: 'test',
        fontSize: 0,
      })).rejects.toThrow('fontSize must be a number between 1 and 256 for marquee type');
    });

    it('should throw validation error for fontSize > 256 (marquee)', async () => {
      await expect(service.setAntiRecordSettings(123456, {
        antiRecordType: 'marquee',
        modelType: 'fixed',
        content: 'test',
        fontSize: 257,
      })).rejects.toThrow('fontSize must be a number between 1 and 256 for marquee type');
    });

    it('should throw validation error for invalid fontSize (watermark)', async () => {
      await expect(service.setAntiRecordSettings(123456, {
        antiRecordType: 'watermark',
        modelType: 'fixed',
        content: 'test',
        fontSize: 'invalid' as 'small',
      })).rejects.toThrow('fontSize must be one of: small, middle, large for watermark type');
    });

    it('should throw validation error for invalid opacity', async () => {
      await expect(service.setAntiRecordSettings(123456, {
        antiRecordType: 'marquee',
        modelType: 'fixed',
        content: 'test',
        fontSize: 14,
        opacity: -1,
      })).rejects.toThrow('opacity must be a number between 0 and 100');
    });

    it('should throw validation error for opacity > 100', async () => {
      await expect(service.setAntiRecordSettings(123456, {
        antiRecordType: 'marquee',
        modelType: 'fixed',
        content: 'test',
        fontSize: 14,
        opacity: 101,
      })).rejects.toThrow('opacity must be a number between 0 and 100');
    });

    it('should throw validation error for invalid showMode', async () => {
      await expect(service.setAntiRecordSettings(123456, {
        antiRecordType: 'marquee',
        modelType: 'fixed',
        content: 'test',
        fontSize: 14,
        showMode: 'invalid' as 'roll',
      })).rejects.toThrow('showMode must be one of: roll, flicker');
    });

    it('should throw validation error for invalid doubleEnabled', async () => {
      await expect(service.setAntiRecordSettings(123456, {
        antiRecordType: 'marquee',
        modelType: 'fixed',
        content: 'test',
        fontSize: 14,
        doubleEnabled: 'INVALID' as 'Y',
      })).rejects.toThrow('doubleEnabled must be "Y" or "N"');
    });

    it('should throw validation error for invalid autoZoomEnabled', async () => {
      await expect(service.setAntiRecordSettings(123456, {
        antiRecordType: 'marquee',
        modelType: 'fixed',
        content: 'test',
        fontSize: 14,
        autoZoomEnabled: 'INVALID' as 'Y',
      })).rejects.toThrow('autoZoomEnabled must be "Y" or "N"');
    });

    it('should accept valid modelType values', async () => {
      mockClient.httpClient.post.mockResolvedValue('SUCCESS');

      const modelTypes = ['fixed', 'nickname', 'diyurl'] as const;
      for (const modelType of modelTypes) {
        await service.setAntiRecordSettings(123456, {
          antiRecordType: 'marquee',
          modelType,
          content: 'test',
          fontSize: 14,
        });
      }

      expect(mockClient.httpClient.post).toHaveBeenCalledTimes(3);
    });

    it('should accept valid fontSize for watermark', async () => {
      mockClient.httpClient.post.mockResolvedValue('SUCCESS');

      const sizes = ['small', 'middle', 'large'] as const;
      for (const fontSize of sizes) {
        await service.setAntiRecordSettings(123456, {
          antiRecordType: 'watermark',
          modelType: 'fixed',
          content: 'test',
          fontSize,
        });
      }

      expect(mockClient.httpClient.post).toHaveBeenCalledTimes(3);
    });
  });

  describe('getAntiRecordSettings', () => {
    it('should get anti-record settings with channelId', async () => {
      const mockResponse = {
        antiRecordType: 'marquee' as const,
        modelType: 'fixed' as const,
        content: 'test',
        opacity: 80,
        fontSize: 14,
      };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getAntiRecordSettings(123456);

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/anti/record/get',
        { params: { channelId: 123456 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get anti-record settings without channelId', async () => {
      const mockResponse = {
        antiRecordType: 'watermark' as const,
        modelType: 'nickname' as const,
        content: 'default',
        opacity: 50,
        fontSize: 'middle' as const,
      };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getAntiRecordSettings();

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/anti/record/get',
        { params: {} }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // Marquee URL API
  // ============================================
  describe('setMarqueeUrl', () => {
    it('should set marquee URL with marqueeRestrict=Y', async () => {
      mockClient.httpClient.post.mockResolvedValue('设置成功');

      const result = await service.setMarqueeUrl(123456, {
        marqueeRestrict: 'Y',
        url: 'https://example.com/user/{userId}',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channelRestrict/123456/set-diyurl-marquee',
        {
          marqueeRestrict: 'Y',
          url: 'https://example.com/user/{userId}',
        }
      );
      expect(result).toBe('设置成功');
    });

    it('should set marquee URL with marqueeRestrict=N', async () => {
      mockClient.httpClient.post.mockResolvedValue('设置成功');

      await service.setMarqueeUrl(123456, {
        marqueeRestrict: 'N',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channelRestrict/123456/set-diyurl-marquee',
        { marqueeRestrict: 'N' }
      );
    });

    it('should throw validation error for invalid marqueeRestrict', async () => {
      await expect(service.setMarqueeUrl(123456, {
        marqueeRestrict: 'INVALID' as 'Y',
      })).rejects.toThrow('marqueeRestrict must be "Y" or "N"');
    });

    it('should throw validation error when url missing with marqueeRestrict=Y', async () => {
      await expect(service.setMarqueeUrl(123456, {
        marqueeRestrict: 'Y',
        url: undefined,
      })).rejects.toThrow('url is required when marqueeRestrict is "Y"');
    });

    it('should throw validation error when url empty with marqueeRestrict=Y', async () => {
      await expect(service.setMarqueeUrl(123456, {
        marqueeRestrict: 'Y',
        url: '',
      })).rejects.toThrow('url is required when marqueeRestrict is "Y"');
    });
  });

  // ============================================
  // Head Advert API
  // ============================================
  describe('updateHeadAdvert', () => {
    it('should update head advert with NONE type', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const result = await service.updateHeadAdvert(123456, {
        headAdvertType: 'NONE',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channelAdvert/123456/updateHead',
        { headAdvertType: 'NONE' }
      );
      expect(result).toBe(true);
    });

    it('should update head advert with IMAGE type', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const result = await service.updateHeadAdvert(123456, {
        headAdvertType: 'IMAGE',
        headAdvertImage: 'https://example.com/ad.jpg',
        headAdvertHref: 'https://example.com',
        headAdvertDuration: 5,
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channelAdvert/123456/updateHead',
        {
          headAdvertType: 'IMAGE',
          headAdvertImage: 'https://example.com/ad.jpg',
          headAdvertHref: 'https://example.com',
          headAdvertDuration: 5,
        }
      );
      expect(result).toBe(true);
    });

    it('should update head advert with FLV type', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const result = await service.updateHeadAdvert(123456, {
        headAdvertType: 'FLV',
        headAdvertFlv: 'https://example.com/ad.flv',
        headAdvertWidth: 640,
        headAdvertHeight: 480,
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channelAdvert/123456/updateHead',
        {
          headAdvertType: 'FLV',
          headAdvertFlv: 'https://example.com/ad.flv',
          headAdvertWidth: 640,
          headAdvertHeight: 480,
        }
      );
      expect(result).toBe(true);
    });

    it('should update head advert with enabled param', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      await service.updateHeadAdvert(123456, {
        headAdvertType: 'IMAGE',
        headAdvertImage: 'https://example.com/ad.jpg',
        enabled: 'Y',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channelAdvert/123456/updateHead',
        {
          headAdvertType: 'IMAGE',
          headAdvertImage: 'https://example.com/ad.jpg',
          enabled: 'Y',
        }
      );
    });

    it('should throw validation error for invalid headAdvertType', async () => {
      await expect(service.updateHeadAdvert(123456, {
        headAdvertType: 'INVALID' as 'NONE',
      })).rejects.toThrow('headAdvertType must be one of: NONE, IMAGE, FLV');
    });

    it('should throw validation error for invalid enabled', async () => {
      await expect(service.updateHeadAdvert(123456, {
        headAdvertType: 'IMAGE',
        enabled: 'INVALID' as 'Y',
      })).rejects.toThrow('enabled must be "Y" or "N"');
    });
  });

  // ============================================
  // Stop Advert API
  // ============================================
  describe('updateStopAdvert', () => {
    it('should update stop advert with all params', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const result = await service.updateStopAdvert(123456, {
        enabled: 'Y',
        stopAdvertImage: 'https://example.com/pause-ad.jpg',
        stopAdvertHref: 'https://example.com',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channelAdvert/123456/updateStop',
        {
          enabled: 'Y',
          stopAdvertImage: 'https://example.com/pause-ad.jpg',
          stopAdvertHref: 'https://example.com',
        }
      );
      expect(result).toBe(true);
    });

    it('should update stop advert with empty params', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const result = await service.updateStopAdvert(123456, {});

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channelAdvert/123456/updateStop',
        {}
      );
      expect(result).toBe(true);
    });

    it('should throw validation error for invalid enabled', async () => {
      await expect(service.updateStopAdvert(123456, {
        enabled: 'INVALID' as 'Y',
      })).rejects.toThrow('enabled must be "Y" or "N"');
    });
  });

  // ============================================
  // Logo API
  // ============================================
  describe('updateLogo', () => {
    it('should update logo with required params', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const result = await service.updateLogo(123456, {
        logoImage: 'https://example.com/logo.png',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channels/123456/update',
        { logoImage: 'https://example.com/logo.png' }
      );
      expect(result).toBe(true);
    });

    it('should update logo with all params', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const result = await service.updateLogo(123456, {
        logoImage: 'https://example.com/logo.png',
        logoOpacity: 0.8,
        logoPosition: 'tr',
        logoHref: 'https://example.com',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channels/123456/update',
        {
          logoImage: 'https://example.com/logo.png',
          logoOpacity: 0.8,
          logoPosition: 'tr',
          logoHref: 'https://example.com',
        }
      );
      expect(result).toBe(true);
    });

    it('should throw validation error for missing logoImage', async () => {
      await expect(service.updateLogo(123456, {
        logoImage: '',
      })).rejects.toThrow('logoImage is required');
    });

    it('should throw validation error for invalid logoOpacity (0)', async () => {
      await expect(service.updateLogo(123456, {
        logoImage: 'https://example.com/logo.png',
        logoOpacity: 0,
      })).rejects.toThrow('logoOpacity must be a number in range (0, 1]');
    });

    it('should throw validation error for invalid logoOpacity (> 1)', async () => {
      await expect(service.updateLogo(123456, {
        logoImage: 'https://example.com/logo.png',
        logoOpacity: 1.5,
      })).rejects.toThrow('logoOpacity must be a number in range (0, 1]');
    });

    it('should throw validation error for invalid logoOpacity (negative)', async () => {
      await expect(service.updateLogo(123456, {
        logoImage: 'https://example.com/logo.png',
        logoOpacity: -0.5,
      })).rejects.toThrow('logoOpacity must be a number in range (0, 1]');
    });

    it('should throw validation error for invalid logoPosition', async () => {
      await expect(service.updateLogo(123456, {
        logoImage: 'https://example.com/logo.png',
        logoPosition: 'invalid' as 'tl',
      })).rejects.toThrow('logoPosition must be one of: tl, tr, bl, br');
    });

    it('should accept valid logoPosition values', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const positions = ['tl', 'tr', 'bl', 'br'] as const;
      for (const position of positions) {
        await service.updateLogo(123456, {
          logoImage: 'https://example.com/logo.png',
          logoPosition: position,
        });
      }

      expect(mockClient.httpClient.post).toHaveBeenCalledTimes(4);
    });

    it('should accept logoOpacity = 1', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      await service.updateLogo(123456, {
        logoImage: 'https://example.com/logo.png',
        logoOpacity: 1,
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/channels/123456/update',
        {
          logoImage: 'https://example.com/logo.png',
          logoOpacity: 1,
        }
      );
    });
  });

  // ============================================
  // Watch Feedback API
  // ============================================
  describe('getWatchFeedbackList', () => {
    it('should get watch feedback list without params', async () => {
      const mockResponse = {
        contents: [],
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        totalItems: 0,
      };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getWatchFeedbackList();

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/feedback/list',
        { params: {} }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get watch feedback list with all params', async () => {
      const mockResponse = {
        contents: [],
        pageNumber: 2,
        pageSize: 20,
        totalPages: 5,
        totalItems: 100,
      };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getWatchFeedbackList({
        channelId: 123456,
        pageNumber: 2,
        pageSize: 20,
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/feedback/list',
        { params: { channelId: 123456, pageNumber: 2, pageSize: 20 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for pageNumber < 1', async () => {
      await expect(service.getWatchFeedbackList({ pageNumber: 0 }))
        .rejects.toThrow('pageNumber must be at least 1');
    });

    it('should throw validation error for pageSize < 1', async () => {
      await expect(service.getWatchFeedbackList({ pageSize: 0 }))
        .rejects.toThrow('pageSize must be at least 1');
    });

    it('should throw validation error for pageSize > 1000', async () => {
      await expect(service.getWatchFeedbackList({ pageSize: 1001 }))
        .rejects.toThrow('pageSize cannot exceed 1000');
    });
  });

  // ============================================
  // Channel Decorate APIs
  // ============================================
  describe('getChannelDecorate', () => {
    it('should get channel decorate settings successfully', async () => {
      const mockResponse = {
        player: {
          watermarkEnabled: 'Y' as const,
          iconUrl: 'https://example.com/logo.png',
          iconPosition: 'br' as const,
          logoOpacity: 0.8,
          iconLink: 'https://example.com',
          warmUpEnabled: 'N' as const,
          warmUpImageUrl: '',
          coverJumpUrl: '',
          backgroundUrl: '',
          basePV: 1000,
          actualPV: 500,
        },
      };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getChannelDecorate(123456);

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/decorate/get',
        { params: { channelId: 123456 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for undefined channelId', async () => {
      await expect(service.getChannelDecorate(undefined as unknown as number))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('updateChannelDecorate', () => {
    it('should update channel decorate with watermark settings', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const result = await service.updateChannelDecorate(123456, {
        watermarkEnabled: 'Y',
        iconUrl: 'https://example.com/logo.png',
        iconPosition: 'tr',
        logoOpacity: 0.8,
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/decorate/update',
        {
          player: {
            watermarkEnabled: 'Y',
            iconUrl: 'https://example.com/logo.png',
            iconPosition: 'tr',
            logoOpacity: 0.8,
          },
        },
        { params: { channelId: 123456 } }
      );
      expect(result).toBe(true);
    });

    it('should update channel decorate with all params', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      await service.updateChannelDecorate(123456, {
        watermarkEnabled: 'Y',
        iconUrl: 'https://example.com/logo.png',
        iconPosition: 'bl',
        logoOpacity: 0.5,
        iconLink: 'https://example.com',
        warmUpEnabled: 'Y',
        warmUpImageUrl: 'https://example.com/warmup.jpg',
        coverJumpUrl: 'https://example.com/cover',
        backgroundUrl: 'https://example.com/bg.jpg',
        basePV: 1000,
        actualPV: 500,
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/decorate/update',
        {
          player: {
            watermarkEnabled: 'Y',
            iconUrl: 'https://example.com/logo.png',
            iconPosition: 'bl',
            logoOpacity: 0.5,
            iconLink: 'https://example.com',
            warmUpEnabled: 'Y',
            warmUpImageUrl: 'https://example.com/warmup.jpg',
            coverJumpUrl: 'https://example.com/cover',
            backgroundUrl: 'https://example.com/bg.jpg',
            basePV: 1000,
            actualPV: 500,
          },
        },
        { params: { channelId: 123456 } }
      );
    });

    it('should throw validation error for invalid iconPosition', async () => {
      await expect(service.updateChannelDecorate(123456, {
        iconPosition: 'invalid' as 'tl',
      })).rejects.toThrow('logoPosition must be one of: tl, tr, bl, br');
    });

    it('should throw validation error for invalid logoOpacity (< 0)', async () => {
      await expect(service.updateChannelDecorate(123456, {
        logoOpacity: -0.5,
      })).rejects.toThrow('logoOpacity must be a number between 0 and 1');
    });

    it('should throw validation error for invalid logoOpacity (> 1)', async () => {
      await expect(service.updateChannelDecorate(123456, {
        logoOpacity: 1.5,
      })).rejects.toThrow('logoOpacity must be a number between 0 and 1');
    });

    it('should throw validation error for invalid watermarkEnabled', async () => {
      await expect(service.updateChannelDecorate(123456, {
        watermarkEnabled: 'INVALID' as 'Y',
      })).rejects.toThrow('watermarkEnabled must be "Y" or "N"');
    });

    it('should throw validation error for invalid warmUpEnabled', async () => {
      await expect(service.updateChannelDecorate(123456, {
        warmUpEnabled: 'INVALID' as 'Y',
      })).rejects.toThrow('warmUpEnabled must be "Y" or "N"');
    });

    it('should accept logoOpacity = 0', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      await service.updateChannelDecorate(123456, {
        logoOpacity: 0,
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/decorate/update',
        { player: { logoOpacity: 0 } },
        { params: { channelId: 123456 } }
      );
    });

    it('should accept logoOpacity = 1', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      await service.updateChannelDecorate(123456, {
        logoOpacity: 1,
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/decorate/update',
        { player: { logoOpacity: 1 } },
        { params: { channelId: 123456 } }
      );
    });
  });
});
