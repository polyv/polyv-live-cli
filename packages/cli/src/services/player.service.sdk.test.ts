/**
 * @fileoverview Tests for PlayerServiceSdk
 * @author Development Team
 */

import { PlayerServiceSdk } from './player.service.sdk';
import {
  PlayerServiceConfig,
  PlayerConfigGetOptions,
  PlayerConfigUpdateOptions,
} from '../types/player';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import * as sdkModule from '../sdk';

// Mock the SDK module
jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

const mockCreateSdkClient = sdkModule.createSdkClient as jest.MockedFunction<typeof sdkModule.createSdkClient>;

describe('PlayerServiceSdk', () => {
  let service: PlayerServiceSdk;
  let mockSdkClient: {
    player: {
      getChannelDecorate: jest.Mock;
      updateChannelDecorate: jest.Mock;
    };
  };
  const mockAuthConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
  };
  const mockServiceConfig: PlayerServiceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockSdkClient = {
      player: {
        getChannelDecorate: jest.fn(),
        updateChannelDecorate: jest.fn(),
      },
    };

    mockCreateSdkClient.mockReturnValue(mockSdkClient as any);
    service = new PlayerServiceSdk(mockAuthConfig, mockServiceConfig);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // ============================================
  // Constructor Tests
  // ============================================

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      expect(service).toBeInstanceOf(PlayerServiceSdk);
    });

    it('should store authConfig and serviceConfig', () => {
      const newService = new PlayerServiceSdk(mockAuthConfig, mockServiceConfig);
      expect(newService).toBeDefined();
    });
  });

  // ============================================
  // getChannelDecorate Tests
  // ============================================

  describe('getChannelDecorate', () => {
    const validOptions: PlayerConfigGetOptions = {
      channelId: '3151318',
    };

    it('should return player decorate settings successfully', async () => {
      const mockResponse = {
        player: {
          watermarkEnabled: 'Y',
          iconUrl: 'https://example.com/watermark.png',
          iconPosition: 'br',
          logoOpacity: 0.8,
          iconLink: 'https://example.com',
          warmUpEnabled: 'N',
          warmUpImageUrl: '',
          coverJumpUrl: '',
          backgroundUrl: 'https://example.com/bg.png',
          basePV: 1000,
          actualPV: 500,
        },
      };

      mockSdkClient.player.getChannelDecorate.mockResolvedValueOnce(mockResponse);

      const result = await service.getChannelDecorate(validOptions);

      expect(result).toEqual({
        watermarkEnabled: 'Y',
        watermarkUrl: 'https://example.com/watermark.png',
        watermarkPosition: 'br',
        watermarkOpacity: '0.8',
        watermarkLink: 'https://example.com',
        warmupEnabled: 'N',
        warmupImageUrl: '',
        coverJumpUrl: '',
        backgroundImageUrl: 'https://example.com/bg.png',
        basePv: 1000,
        actualPv: 500,
      });
      expect(mockSdkClient.player.getChannelDecorate).toHaveBeenCalledWith(3151318);
    });

    it('should handle null values in response', async () => {
      const mockResponse = {
        player: {
          watermarkEnabled: 'N',
          iconUrl: null,
          iconPosition: null,
          logoOpacity: null,
          iconLink: null,
          warmUpEnabled: 'N',
          warmUpImageUrl: null,
          coverJumpUrl: null,
          backgroundUrl: null,
          basePV: null,
          actualPV: null,
        },
      };

      mockSdkClient.player.getChannelDecorate.mockResolvedValueOnce(mockResponse);

      const result = await service.getChannelDecorate(validOptions);

      expect(result.watermarkUrl).toBe('');
      expect(result.watermarkPosition).toBe('br');
      expect(result.watermarkOpacity).toBe('1');
      expect(result.basePv).toBe(0);
      expect(result.actualPv).toBe(0);
    });

    it('should handle missing warmUpEnabled field', async () => {
      const mockResponse = {
        player: {
          watermarkEnabled: 'Y',
          iconUrl: 'https://example.com/watermark.png',
          iconPosition: 'tl',
          logoOpacity: 1,
          warmUpEnabled: undefined,
          warmUpImageUrl: undefined,
          basePV: 0,
          actualPV: 0,
        },
      };

      mockSdkClient.player.getChannelDecorate.mockResolvedValueOnce(mockResponse);

      const result = await service.getChannelDecorate(validOptions);

      expect(result.warmupEnabled).toBe('N');
    });

    it('should throw PolyVValidationError for empty channelId', async () => {
      const invalidOptions = { channelId: '' };

      await expect(service.getChannelDecorate(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for whitespace-only channelId', async () => {
      const invalidOptions = { channelId: '   ' };

      await expect(service.getChannelDecorate(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for null channelId', async () => {
      const invalidOptions = { channelId: null as any };

      await expect(service.getChannelDecorate(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for undefined channelId', async () => {
      const invalidOptions = { channelId: undefined as any };

      await expect(service.getChannelDecorate(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for non-string channelId', async () => {
      const invalidOptions = { channelId: 123 as any };

      await expect(service.getChannelDecorate(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should include validation error details for empty channelId', async () => {
      const invalidOptions = { channelId: '' };

      try {
        await service.getChannelDecorate(invalidOptions);
        fail('Expected PolyVValidationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        expect((error as PolyVValidationError).field).toBe('options');
        expect((error as PolyVValidationError).rule).toBe('validation_failed');
      }
    });

    it('should handle API errors', async () => {
      mockSdkClient.player.getChannelDecorate.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getChannelDecorate(validOptions)).rejects.toThrow();
    });

    it('should convert string channelId to number for SDK call', async () => {
      const mockResponse = {
        player: {
          watermarkEnabled: 'Y',
          iconUrl: '',
          iconPosition: 'br',
          logoOpacity: 1,
          basePV: 0,
          actualPV: 0,
        },
      };

      mockSdkClient.player.getChannelDecorate.mockResolvedValueOnce(mockResponse);

      await service.getChannelDecorate({ channelId: '12345' });

      expect(mockSdkClient.player.getChannelDecorate).toHaveBeenCalledWith(12345);
    });
  });

  // ============================================
  // updateChannelDecorate Tests
  // ============================================

  describe('updateChannelDecorate', () => {
    const validOptions: PlayerConfigUpdateOptions = {
      channelId: '3151318',
    };

    it('should update watermark enabled successfully', async () => {
      mockSdkClient.player.updateChannelDecorate.mockResolvedValueOnce({});

      const result = await service.updateChannelDecorate({
        channelId: '3151318',
        watermarkEnabled: 'Y',
      });

      expect(result.success).toBe(true);
      expect(result.updatedFields).toContain('watermarkEnabled');
      expect(mockSdkClient.player.updateChannelDecorate).toHaveBeenCalledWith(
        3151318,
        expect.objectContaining({ watermarkEnabled: 'Y' })
      );
    });

    it('should update multiple fields successfully', async () => {
      mockSdkClient.player.updateChannelDecorate.mockResolvedValueOnce({});

      const result = await service.updateChannelDecorate({
        channelId: '3151318',
        watermarkEnabled: 'Y',
        watermarkUrl: 'https://example.com/watermark.png',
        watermarkPosition: 'tl',
        watermarkOpacity: 0.5,
        warmupEnabled: 'Y',
        warmupImageUrl: 'https://example.com/warmup.png',
        basePv: 100,
      });

      expect(result.success).toBe(true);
      expect(result.updatedFields).toHaveLength(7);
      expect(result.updatedFields).toContain('watermarkEnabled');
      expect(result.updatedFields).toContain('watermarkUrl');
      expect(result.updatedFields).toContain('watermarkPosition');
      expect(result.updatedFields).toContain('watermarkOpacity');
      expect(result.updatedFields).toContain('warmupEnabled');
      expect(result.updatedFields).toContain('warmupImageUrl');
      expect(result.updatedFields).toContain('basePv');
    });

    it('should return empty updatedFields when no updates provided', async () => {
      mockSdkClient.player.updateChannelDecorate.mockResolvedValueOnce({});

      const result = await service.updateChannelDecorate({
        channelId: '3151318',
      });

      expect(result.success).toBe(true);
      expect(result.updatedFields).toHaveLength(0);
    });

    it('should throw PolyVValidationError for empty channelId', async () => {
      const invalidOptions = { channelId: '' };

      await expect(service.updateChannelDecorate(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for whitespace-only channelId', async () => {
      const invalidOptions = { channelId: '   ' };

      await expect(service.updateChannelDecorate(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid watermarkPosition', async () => {
      const invalidOptions = {
        channelId: '3151318',
        watermarkPosition: 'invalid' as any,
      };

      await expect(service.updateChannelDecorate(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should accept valid watermarkPosition values', async () => {
      mockSdkClient.player.updateChannelDecorate.mockResolvedValue({});

      const positions = ['tl', 'tr', 'bl', 'br'];

      for (const position of positions) {
        const result = await service.updateChannelDecorate({
          channelId: '3151318',
          watermarkPosition: position as any,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should throw PolyVValidationError for invalid watermarkOpacity (negative)', async () => {
      const invalidOptions = {
        channelId: '3151318',
        watermarkOpacity: -0.5,
      };

      await expect(service.updateChannelDecorate(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid watermarkOpacity (> 1)', async () => {
      const invalidOptions = {
        channelId: '3151318',
        watermarkOpacity: 1.5,
      };

      await expect(service.updateChannelDecorate(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for non-number watermarkOpacity', async () => {
      const invalidOptions = {
        channelId: '3151318',
        watermarkOpacity: 'high' as any,
      };

      await expect(service.updateChannelDecorate(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should accept valid watermarkOpacity values (0 and 1)', async () => {
      mockSdkClient.player.updateChannelDecorate.mockResolvedValue({});

      const result1 = await service.updateChannelDecorate({
        channelId: '3151318',
        watermarkOpacity: 0,
      });
      expect(result1.success).toBe(true);

      const result2 = await service.updateChannelDecorate({
        channelId: '3151318',
        watermarkOpacity: 1,
      });
      expect(result2.success).toBe(true);
    });

    it('should throw PolyVValidationError for invalid watermarkEnabled', async () => {
      const invalidOptions = {
        channelId: '3151318',
        watermarkEnabled: 'YES' as any,
      };

      await expect(service.updateChannelDecorate(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should accept valid watermarkEnabled values', async () => {
      mockSdkClient.player.updateChannelDecorate.mockResolvedValue({});

      const result1 = await service.updateChannelDecorate({
        channelId: '3151318',
        watermarkEnabled: 'Y',
      });
      expect(result1.success).toBe(true);

      const result2 = await service.updateChannelDecorate({
        channelId: '3151318',
        watermarkEnabled: 'N',
      });
      expect(result2.success).toBe(true);
    });

    it('should throw PolyVValidationError for invalid warmupEnabled', async () => {
      const invalidOptions = {
        channelId: '3151318',
        warmupEnabled: 'NO' as any,
      };

      await expect(service.updateChannelDecorate(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should accept valid warmupEnabled values', async () => {
      mockSdkClient.player.updateChannelDecorate.mockResolvedValue({});

      const result1 = await service.updateChannelDecorate({
        channelId: '3151318',
        warmupEnabled: 'Y',
      });
      expect(result1.success).toBe(true);

      const result2 = await service.updateChannelDecorate({
        channelId: '3151318',
        warmupEnabled: 'N',
      });
      expect(result2.success).toBe(true);
    });

    it('should include validation error details', async () => {
      const invalidOptions = {
        channelId: '3151318',
        watermarkPosition: 'invalid' as any,
      };

      try {
        await service.updateChannelDecorate(invalidOptions);
        fail('Expected PolyVValidationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        expect((error as PolyVValidationError).field).toBe('options');
        expect((error as PolyVValidationError).rule).toBe('validation_failed');
      }
    });

    it('should handle API errors', async () => {
      mockSdkClient.player.updateChannelDecorate.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.updateChannelDecorate(validOptions)).rejects.toThrow();
    });

    it('should convert string channelId to number for SDK call', async () => {
      mockSdkClient.player.updateChannelDecorate.mockResolvedValueOnce({});

      await service.updateChannelDecorate({ channelId: '12345', watermarkEnabled: 'Y' });

      expect(mockSdkClient.player.updateChannelDecorate).toHaveBeenCalledWith(
        12345,
        expect.any(Object)
      );
    });

    it('should map watermarkUrl to iconUrl in SDK params', async () => {
      mockSdkClient.player.updateChannelDecorate.mockResolvedValueOnce({});

      await service.updateChannelDecorate({
        channelId: '3151318',
        watermarkUrl: 'https://example.com/watermark.png',
      });

      expect(mockSdkClient.player.updateChannelDecorate).toHaveBeenCalledWith(
        3151318,
        expect.objectContaining({ iconUrl: 'https://example.com/watermark.png' })
      );
    });

    it('should map watermarkPosition to iconPosition in SDK params', async () => {
      mockSdkClient.player.updateChannelDecorate.mockResolvedValueOnce({});

      await service.updateChannelDecorate({
        channelId: '3151318',
        watermarkPosition: 'tr',
      });

      expect(mockSdkClient.player.updateChannelDecorate).toHaveBeenCalledWith(
        3151318,
        expect.objectContaining({ iconPosition: 'tr' })
      );
    });

    it('should map watermarkOpacity to logoOpacity in SDK params', async () => {
      mockSdkClient.player.updateChannelDecorate.mockResolvedValueOnce({});

      await service.updateChannelDecorate({
        channelId: '3151318',
        watermarkOpacity: 0.7,
      });

      expect(mockSdkClient.player.updateChannelDecorate).toHaveBeenCalledWith(
        3151318,
        expect.objectContaining({ logoOpacity: 0.7 })
      );
    });

    it('should map warmupEnabled to warmUpEnabled in SDK params', async () => {
      mockSdkClient.player.updateChannelDecorate.mockResolvedValueOnce({});

      await service.updateChannelDecorate({
        channelId: '3151318',
        warmupEnabled: 'Y',
      });

      expect(mockSdkClient.player.updateChannelDecorate).toHaveBeenCalledWith(
        3151318,
        expect.objectContaining({ warmUpEnabled: 'Y' })
      );
    });

    it('should map warmupImageUrl to warmUpImageUrl in SDK params', async () => {
      mockSdkClient.player.updateChannelDecorate.mockResolvedValueOnce({});

      await service.updateChannelDecorate({
        channelId: '3151318',
        warmupImageUrl: 'https://example.com/warmup.png',
      });

      expect(mockSdkClient.player.updateChannelDecorate).toHaveBeenCalledWith(
        3151318,
        expect.objectContaining({ warmUpImageUrl: 'https://example.com/warmup.png' })
      );
    });

    it('should map basePv to basePV in SDK params', async () => {
      mockSdkClient.player.updateChannelDecorate.mockResolvedValueOnce({});

      await service.updateChannelDecorate({
        channelId: '3151318',
        basePv: 500,
      });

      expect(mockSdkClient.player.updateChannelDecorate).toHaveBeenCalledWith(
        3151318,
        expect.objectContaining({ basePV: 500 })
      );
    });
  });

  // ============================================
  // Multiple Validation Errors Tests
  // ============================================

  describe('multiple validation errors', () => {
    it('should report all validation errors for updateChannelDecorate', async () => {
      const invalidOptions = {
        channelId: '',
        watermarkPosition: 'invalid' as any,
        watermarkOpacity: 2,
        watermarkEnabled: 'YES' as any,
        warmupEnabled: 'NO' as any,
      };

      try {
        await service.updateChannelDecorate(invalidOptions);
        fail('Expected PolyVValidationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        const message = (error as PolyVValidationError).message;
        expect(message).toContain('channelId');
        expect(message).toContain('watermarkPosition');
        expect(message).toContain('watermarkOpacity');
        expect(message).toContain('watermarkEnabled');
        expect(message).toContain('warmupEnabled');
      }
    });
  });
});
