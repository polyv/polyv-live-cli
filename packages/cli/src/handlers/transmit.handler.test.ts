/**
 * @fileoverview Unit tests for transmit handler
 * @author Development Team
 * @since 14.3.0
 */

import { TransmitHandler } from './transmit.handler';
import { TransmitServiceSdk } from '../services/transmit-service';
import { TransmitCreateOptions, TransmitListOptions } from '../types/transmit';

// Mock the service
jest.mock('../services/transmit-service');

describe('TransmitHandler', () => {
  let handler: TransmitHandler;
  let mockService: jest.Mocked<TransmitServiceSdk>;

  const mockAuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
    userId: 'test-user-id',
  };

  beforeEach(() => {
    handler = new TransmitHandler(mockAuthConfig);
    mockService = {
      batchCreateTransmitChannels: jest.fn(),
      getTransmitAssociations: jest.fn(),
    } as unknown as jest.Mocked<TransmitServiceSdk>;
    (handler as unknown as { transmitService: typeof mockService }).transmitService = mockService;
  });

  describe('batchCreateTransmitChannels', () => {
    test('[AC1] should create channels and display success message', async () => {
      const options: TransmitCreateOptions = {
        channelId: '123456',
        names: '频道1,频道2',
        output: 'table',
      };

      const mockResponse = [
        {
          channelId: 1234567,
          name: '频道1',
          channelPasswd: 'password1',
          authType: 'none',
          streamType: 'client',
          debugEnabled: false,
          playbackEnabled: true,
          stream: 'stream1',
          status: 'waiting',
          category: 'default',
          scene: 'alone',
        },
        {
          channelId: 1234568,
          name: '频道2',
          channelPasswd: 'password2',
          authType: 'none',
          streamType: 'client',
          debugEnabled: false,
          playbackEnabled: true,
          stream: 'stream2',
          status: 'waiting',
          category: 'default',
          scene: 'alone',
        },
      ];

      mockService.batchCreateTransmitChannels.mockResolvedValue(mockResponse);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await handler.batchCreateTransmitChannels(options);

      expect(mockService.batchCreateTransmitChannels).toHaveBeenCalledWith('123456', ['频道1', '频道2']);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('[AC1] should output JSON format when specified', async () => {
      const options: TransmitCreateOptions = {
        channelId: '123456',
        names: '频道1',
        output: 'json',
      };

      mockService.batchCreateTransmitChannels.mockResolvedValue([]);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await handler.batchCreateTransmitChannels(options);

      expect(consoleSpy).toHaveBeenCalled();
      const lastCall = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(() => JSON.parse(lastCall[0])).not.toThrow();

      consoleSpy.mockRestore();
    });

    test('[AC4] should throw error when channelId is missing', async () => {
      const options: TransmitCreateOptions = {
        channelId: '',
        names: '频道1',
      };

      await expect(handler.batchCreateTransmitChannels(options)).rejects.toThrow();
    });

    test('[AC4] should throw error when names is missing', async () => {
      const options: TransmitCreateOptions = {
        channelId: '123456',
        names: '',
      };

      await expect(handler.batchCreateTransmitChannels(options)).rejects.toThrow();
    });

    test('[AC4] should validate names count does not exceed 100', async () => {
      const names = Array(101).fill('频道').join(',');
      const options: TransmitCreateOptions = {
        channelId: '123456',
        names,
      };

      await expect(handler.batchCreateTransmitChannels(options)).rejects.toThrow('exceed');
    });

    test('[AC1] should handle service errors gracefully', async () => {
      const options: TransmitCreateOptions = {
        channelId: '123456',
        names: '频道1',
      };

      mockService.batchCreateTransmitChannels.mockRejectedValue(new Error('Service Error'));

      await expect(handler.batchCreateTransmitChannels(options)).rejects.toThrow('Service Error');
    });
  });

  describe('getTransmitAssociations', () => {
    test('[AC2] should list associations and display in table format', async () => {
      const options: TransmitListOptions = {
        channelId: '123456',
        output: 'table',
      };

      const mockResponse = [
        {
          channelId: '123456',
          receiveChannelId: '1234567',
        },
        {
          channelId: null,
          receiveChannelId: '1234568',
        },
      ];

      mockService.getTransmitAssociations.mockResolvedValue(mockResponse);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await handler.getTransmitAssociations(options);

      expect(mockService.getTransmitAssociations).toHaveBeenCalledWith('123456');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('[AC2] should output JSON format when specified', async () => {
      const options: TransmitListOptions = {
        channelId: '123456',
        output: 'json',
      };

      mockService.getTransmitAssociations.mockResolvedValue([]);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await handler.getTransmitAssociations(options);

      expect(consoleSpy).toHaveBeenCalled();
      const lastCall = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(() => JSON.parse(lastCall[0])).not.toThrow();

      consoleSpy.mockRestore();
    });

    test('[AC4] should throw error when channelId is missing', async () => {
      const options: TransmitListOptions = {
        channelId: '',
      };

      await expect(handler.getTransmitAssociations(options)).rejects.toThrow();
    });

    test('[AC2] should handle empty results gracefully', async () => {
      const options: TransmitListOptions = {
        channelId: '123456',
        output: 'table',
      };

      mockService.getTransmitAssociations.mockResolvedValue([]);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await handler.getTransmitAssociations(options);

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('[AC2] should handle service errors gracefully', async () => {
      const options: TransmitListOptions = {
        channelId: '123456',
      };

      mockService.getTransmitAssociations.mockRejectedValue(new Error('Service Error'));

      await expect(handler.getTransmitAssociations(options)).rejects.toThrow('Service Error');
    });
  });

  describe('validateChannelId', () => {
    test('[AC4] should validate valid channelId', () => {
      expect(() => (handler as unknown as { validateChannelId: (id: string) => void }).validateChannelId('123456')).not.toThrow();
    });

    test('[AC4] should throw error for empty channelId', () => {
      expect(() => (handler as unknown as { validateChannelId: (id: string) => void }).validateChannelId('')).toThrow();
    });

    test('[AC4] should throw error for whitespace-only channelId', () => {
      expect(() => (handler as unknown as { validateChannelId: (id: string) => void }).validateChannelId('   ')).toThrow();
    });
  });

  describe('validateNames', () => {
    test('[AC4] should validate valid names string', () => {
      expect(() => (handler as unknown as { validateNames: (names: string) => void }).validateNames('频道1,频道2')).not.toThrow();
    });

    test('[AC4] should throw error for empty names', () => {
      expect(() => (handler as unknown as { validateNames: (names: string) => void }).validateNames('')).toThrow();
    });

    test('[AC4] should throw error when names exceed 100', () => {
      const names = Array(101).fill('频道').join(',');
      expect(() => (handler as unknown as { validateNames: (names: string) => void }).validateNames(names)).toThrow();
    });

    test('[AC4] should accept exactly 100 names', () => {
      const names = Array(100).fill('频道').join(',');
      expect(() => (handler as unknown as { validateNames: (names: string) => void }).validateNames(names)).not.toThrow();
    });
  });
});
