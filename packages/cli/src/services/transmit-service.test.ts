/**
 * @fileoverview Unit tests for transmit service
 * @author Development Team
 * @since 14.3.0
 */

import { TransmitServiceSdk } from './transmit-service';
import { AuthConfig } from '../types/auth';
import { TransmitChannelInfo, TransmitAssociation } from '../types/transmit';

describe('TransmitServiceSdk', () => {
  let service: TransmitServiceSdk;
  let mockChannel: {
    batchAddTransmit: jest.Mock;
    getTransmitAssociations: jest.Mock;
    associationReceiveChannels: jest.Mock;
  };
  const authConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
    userId: 'test-user-id',
  };

  beforeEach(() => {
    service = new TransmitServiceSdk(authConfig);
    mockChannel = {
      batchAddTransmit: jest.fn(),
      getTransmitAssociations: jest.fn(),
      associationReceiveChannels: jest.fn(),
    };
    (service as unknown as { channel: typeof mockChannel }).channel = mockChannel;
  });

  describe('batchCreateTransmitChannels', () => {
    test('[AC1] should create transmit channels with valid parameters', async () => {
      const channelId = '123456';
      const names = ['频道1', '频道2'];
      const mockResponse: TransmitChannelInfo[] = [
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

      mockChannel.batchAddTransmit.mockResolvedValue({ data: mockResponse });

      const result = await service.batchCreateTransmitChannels(channelId, names);

      expect(result).toEqual(mockResponse);
      expect(mockChannel.batchAddTransmit).toHaveBeenCalledWith({ channelId, names });
    });

    test('[AC1] should throw error when channelId is empty', async () => {
      await expect(service.batchCreateTransmitChannels('', ['频道1'])).rejects.toThrow('Channel ID is required');
    });

    test('[AC1] should throw error when names array is empty', async () => {
      await expect(service.batchCreateTransmitChannels('123456', [])).rejects.toThrow('Names are required');
    });

    test('[AC1] should throw error when names array exceeds 100 items', async () => {
      const names = Array(101).fill('频道');
      await expect(service.batchCreateTransmitChannels('123456', names)).rejects.toThrow('exceeds maximum');
    });

    test('[AC1] should handle API error response', async () => {
      mockChannel.batchAddTransmit.mockRejectedValue(new Error('API Error'));

      await expect(service.batchCreateTransmitChannels('123456', ['频道1'])).rejects.toThrow('API Error');
    });
  });

  describe('getTransmitAssociations', () => {
    test('[AC2] should get transmit associations with valid channelId', async () => {
      const channelId = '123456';
      const mockResponse: TransmitAssociation[] = [
        {
          channelId: '123456',
          receiveChannelId: '1234567',
        },
        {
          channelId: null,
          receiveChannelId: '1234568',
        },
      ];

      mockChannel.getTransmitAssociations.mockResolvedValue({ data: mockResponse });

      const result = await service.getTransmitAssociations(channelId);

      expect(result).toEqual(mockResponse);
      expect(mockChannel.getTransmitAssociations).toHaveBeenCalledWith({ channelId });
    });

    test('[AC2] should throw error when channelId is empty', async () => {
      await expect(service.getTransmitAssociations('')).rejects.toThrow('Channel ID is required');
    });

    test('[AC2] should return empty array when no associations found', async () => {
      mockChannel.getTransmitAssociations.mockResolvedValue({ data: [] });

      const result = await service.getTransmitAssociations('123456');

      expect(result).toEqual([]);
    });

    test('[AC2] should handle API error response', async () => {
      mockChannel.getTransmitAssociations.mockRejectedValue(new Error('API Error'));

      await expect(service.getTransmitAssociations('123456')).rejects.toThrow('API Error');
    });
  });
});
