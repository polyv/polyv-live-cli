/**
 * @fileoverview Tests for StreamServiceSdk
 * @author Development Team
 */

import { StreamServiceSdk, StreamServiceConfig } from './stream.service.sdk';
import {
  StreamGetKeyRequest,
  StreamStartRequest,
  StreamStopRequest,
  StreamStatusRequest,
} from '../types/stream';
import { AuthConfig } from '../types/auth';
import { PolyVError, PolyVAPIError, PolyVValidationError } from '../utils/errors';
import * as sdkModule from '../sdk';

// Mock the SDK module
jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

const mockCreateSdkClient = sdkModule.createSdkClient as jest.MockedFunction<typeof sdkModule.createSdkClient>;

describe('StreamServiceSdk', () => {
  let service: StreamServiceSdk;
  let mockSdkClient: {
    v4Channel: { getChannel: jest.Mock };
    channel: {
      setStatusStart: jest.Mock;
      setStatusEnd: jest.Mock;
      getStreamInfo: jest.Mock;
      getPushUrl: jest.Mock;
    };
  };
  const mockAuthConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
    userId: 'test-user-id',
  };
  const mockServiceConfig: StreamServiceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockSdkClient = {
      v4Channel: {
        getChannel: jest.fn(),
      },
      channel: {
        setStatusStart: jest.fn(),
        setStatusEnd: jest.fn(),
        getStreamInfo: jest.fn(),
        getPushUrl: jest.fn(),
      },
    };

    mockCreateSdkClient.mockReturnValue(mockSdkClient as any);
    service = new StreamServiceSdk(mockAuthConfig, mockServiceConfig);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // ============================================
  // Constructor Tests
  // ============================================

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      expect(service).toBeInstanceOf(StreamServiceSdk);
    });

    it('should store authConfig and serviceConfig', () => {
      const newService = new StreamServiceSdk(mockAuthConfig, mockServiceConfig);
      expect(newService).toBeDefined();
    });
  });

  // ============================================
  // getStreamKey Tests
  // ============================================

  describe('getStreamKey', () => {
    const validRequest: StreamGetKeyRequest = {
      channelId: '3151318',
    };

    it('should return stream credentials successfully', async () => {
      // getPushUrl returns the full RTMP URL: rtmp://server/app/streamKey?params
      const mockPushUrl = 'rtmp://push.polyv.net/live/stream-key-123?s=abc&t=def';
      mockSdkClient.channel.getPushUrl.mockResolvedValueOnce(mockPushUrl);

      const result = await service.getStreamKey(validRequest);

      expect(result).toEqual({
        channelId: '3151318',
        rtmpUrl: 'rtmp://push.polyv.net/live',
        streamKey: 'stream-key-123?s=abc&t=def',
        deployAddress: '',
        inAddress: '',
        metrics: {
          fps: 0,
          lfr: 0,
          bandwidth: 0,
        },
      });
      expect(mockCreateSdkClient).toHaveBeenCalledWith(mockAuthConfig, mockServiceConfig.baseUrl);
      expect(mockSdkClient.channel.getPushUrl).toHaveBeenCalledWith('3151318');
    });

    it('should throw PolyVValidationError for empty channelId', async () => {
      const invalidRequest = { channelId: '' };

      await expect(service.getStreamKey(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for whitespace-only channelId', async () => {
      const invalidRequest = { channelId: '   ' };

      await expect(service.getStreamKey(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for null channelId', async () => {
      const invalidRequest = { channelId: null as any };

      await expect(service.getStreamKey(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for undefined channelId', async () => {
      const invalidRequest = { channelId: undefined as any };

      await expect(service.getStreamKey(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should handle API errors when getPushUrl fails', async () => {
      const apiError = new Error('Channel not found');
      (apiError as any).code = 'CHANNEL_NOT_FOUND';

      mockSdkClient.channel.getPushUrl.mockRejectedValueOnce(apiError);

      await expect(service.getStreamKey(validRequest)).rejects.toThrow();
    });

    it('should handle network errors and wrap them appropriately', async () => {
      const networkError = new Error('Network Error');
      mockSdkClient.channel.getPushUrl.mockRejectedValueOnce(networkError);

      await expect(service.getStreamKey(validRequest)).rejects.toThrow();
    });
  });

  // ============================================
  // startStream Tests
  // ============================================

  describe('startStream', () => {
    const validRequest: StreamStartRequest = {
      channelId: '3151318',
    };

    it('should start stream successfully', async () => {
      mockSdkClient.channel.setStatusStart.mockResolvedValueOnce({});

      const result = await service.startStream(validRequest);

      expect(result).toEqual({
        code: 200,
        status: 'success',
        message: 'Stream started successfully',
        data: 'success',
      });
      expect(mockSdkClient.channel.setStatusStart).toHaveBeenCalledWith({
        channelId: '3151318',
        userId: 'test-user-id',
      });
    });

    it('should throw PolyVValidationError for empty channelId', async () => {
      const invalidRequest = { channelId: '' };

      await expect(service.startStream(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError when userId is missing', async () => {
      const authConfigWithoutUserId: AuthConfig = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
      };
      const serviceWithoutUserId = new StreamServiceSdk(authConfigWithoutUserId, mockServiceConfig);

      await expect(serviceWithoutUserId.startStream(validRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError with correct field info when userId missing', async () => {
      const authConfigWithoutUserId: AuthConfig = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
      };
      const serviceWithoutUserId = new StreamServiceSdk(authConfigWithoutUserId, mockServiceConfig);

      try {
        await serviceWithoutUserId.startStream(validRequest);
        fail('Expected PolyVValidationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        expect((error as PolyVValidationError).field).toBe('userId');
      }
    });

    it('should handle API errors during start', async () => {
      const apiError = new Error('Failed to start stream');
      (apiError as any).code = 'START_FAILED';

      mockSdkClient.channel.setStatusStart.mockRejectedValueOnce(apiError);

      await expect(service.startStream(validRequest)).rejects.toThrow();
    });
  });

  // ============================================
  // stopStream Tests
  // ============================================

  describe('stopStream', () => {
    const validRequest: StreamStopRequest = {
      channelId: '3151318',
    };

    it('should stop stream successfully', async () => {
      mockSdkClient.channel.setStatusEnd.mockResolvedValueOnce({});

      const result = await service.stopStream(validRequest);

      expect(result).toEqual({
        code: 200,
        status: 'success',
        message: 'Stream stopped successfully',
        data: 'success',
      });
      expect(mockSdkClient.channel.setStatusEnd).toHaveBeenCalledWith({
        channelId: '3151318',
        userId: 'test-user-id',
      });
    });

    it('should throw PolyVValidationError for empty channelId', async () => {
      const invalidRequest = { channelId: '' };

      await expect(service.stopStream(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError when userId is missing', async () => {
      const authConfigWithoutUserId: AuthConfig = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
      };
      const serviceWithoutUserId = new StreamServiceSdk(authConfigWithoutUserId, mockServiceConfig);

      await expect(serviceWithoutUserId.stopStream(validRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should handle API errors during stop', async () => {
      const apiError = new Error('Failed to stop stream');
      (apiError as any).code = 'STOP_FAILED';

      mockSdkClient.channel.setStatusEnd.mockRejectedValueOnce(apiError);

      await expect(service.stopStream(validRequest)).rejects.toThrow();
    });
  });

  // ============================================
  // getStreamStatus Tests
  // ============================================

  describe('getStreamStatus', () => {
    const validRequest: StreamStatusRequest = {
      channelId: '3151318',
    };

    it('should return live status for live channel', async () => {
      mockSdkClient.channel.getStreamInfo.mockResolvedValueOnce({
        deployAddress: '1.2.3.4',
        inAddress: '5.6.7.8',
        streamName: 'stream-123',
        fps: '30',
        lfr: '0.1',
        inBandWidth: '5000',
      });

      mockSdkClient.v4Channel.getChannel.mockResolvedValueOnce({
        channelId: '3151318',
        watchStatus: 'live',
      });

      const result = await service.getStreamStatus(validRequest);

      expect(result.channelId).toBe('3151318');
      expect(result.status).toBe('live');
      expect(result.statusText).toBe('Live');
      expect(result.isLive).toBe(true);
      expect(result.metrics).toBeDefined();
      expect(result.metrics?.fps).toBe(30);
    });

    it('should return waiting status for waiting channel', async () => {
      mockSdkClient.channel.getStreamInfo.mockRejectedValueOnce(new Error('Not streaming'));

      mockSdkClient.v4Channel.getChannel.mockResolvedValueOnce({
        channelId: '3151318',
        watchStatus: 'waiting',
      });

      const result = await service.getStreamStatus(validRequest);

      expect(result.status).toBe('waiting');
      expect(result.statusText).toBe('Waiting');
      expect(result.isLive).toBe(false);
    });

    it('should return stopped status for ended channel', async () => {
      mockSdkClient.channel.getStreamInfo.mockRejectedValueOnce(new Error('Not streaming'));

      mockSdkClient.v4Channel.getChannel.mockResolvedValueOnce({
        channelId: '3151318',
        watchStatus: 'end',
      });

      const result = await service.getStreamStatus(validRequest);

      expect(result.status).toBe('stopped');
      expect(result.statusText).toBe('Stopped');
      expect(result.isLive).toBe(false);
    });

    it('should return error status for banned channel', async () => {
      mockSdkClient.channel.getStreamInfo.mockRejectedValueOnce(new Error('Not streaming'));

      mockSdkClient.v4Channel.getChannel.mockResolvedValueOnce({
        channelId: '3151318',
        watchStatus: 'banpush',
      });

      const result = await service.getStreamStatus(validRequest);

      expect(result.status).toBe('error');
      expect(result.statusText).toBe('Push Banned');
    });

    it('should return unknown status for unrecognized status', async () => {
      mockSdkClient.channel.getStreamInfo.mockRejectedValueOnce(new Error('Not streaming'));

      mockSdkClient.v4Channel.getChannel.mockResolvedValueOnce({
        channelId: '3151318',
        watchStatus: 'unknown_status',
      });

      const result = await service.getStreamStatus(validRequest);

      expect(result.status).toBe('unknown');
      expect(result.statusText).toBe('unknown_status');
    });

    it('should return unknown status when watchStatus is null', async () => {
      mockSdkClient.channel.getStreamInfo.mockRejectedValueOnce(new Error('Not streaming'));

      mockSdkClient.v4Channel.getChannel.mockResolvedValueOnce({
        channelId: '3151318',
        watchStatus: null,
      });

      const result = await service.getStreamStatus(validRequest);

      expect(result.status).toBe('unknown');
    });

    it('should handle channel info error gracefully', async () => {
      mockSdkClient.channel.getStreamInfo.mockRejectedValueOnce(new Error('Stream info error'));
      mockSdkClient.v4Channel.getChannel.mockRejectedValueOnce(new PolyVAPIError('Channel error', 'CHANNEL_ERROR', 404));

      const result = await service.getStreamStatus(validRequest);

      expect(result.status).toBe('error');
      expect(result.error).toBeDefined();
    });

    it('should throw PolyVValidationError for empty channelId', async () => {
      const invalidRequest = { channelId: '' };

      await expect(service.getStreamStatus(invalidRequest)).rejects.toThrow(PolyVValidationError);
    });

    it('should include metrics when stream info is available', async () => {
      mockSdkClient.channel.getStreamInfo.mockResolvedValueOnce({
        deployAddress: '1.2.3.4',
        inAddress: '5.6.7.8',
        streamName: 'stream-123',
        fps: '25',
        lfr: '0.5',
        inBandWidth: '8000',
      });

      mockSdkClient.v4Channel.getChannel.mockResolvedValueOnce({
        channelId: '3151318',
        watchStatus: 'live',
      });

      const result = await service.getStreamStatus(validRequest);

      expect(result.metrics).toEqual({
        fps: 25,
        lfr: 0.5,
        bandwidth: 8000,
        bandwidthText: '7.81 Kbps',
      });
    });

    it('should include network info when stream info is available', async () => {
      mockSdkClient.channel.getStreamInfo.mockResolvedValueOnce({
        deployAddress: '1.2.3.4',
        inAddress: '5.6.7.8',
        streamName: 'stream-123',
        fps: '30',
        lfr: '0.1',
        inBandWidth: '5000',
      });

      mockSdkClient.v4Channel.getChannel.mockResolvedValueOnce({
        channelId: '3151318',
        watchStatus: 'live',
      });

      const result = await service.getStreamStatus(validRequest);

      expect(result.network).toEqual({
        deployAddress: '1.2.3.4',
        inAddress: '5.6.7.8',
        streamName: 'stream-123',
      });
    });

    it('should handle unStart status correctly', async () => {
      mockSdkClient.channel.getStreamInfo.mockRejectedValueOnce(new Error('Not streaming'));
      mockSdkClient.v4Channel.getChannel.mockResolvedValueOnce({
        channelId: '3151318',
        watchStatus: 'unStart',
      });

      const result = await service.getStreamStatus(validRequest);

      expect(result.status).toBe('waiting');
    });

    it('should handle playback status correctly', async () => {
      mockSdkClient.channel.getStreamInfo.mockRejectedValueOnce(new Error('Not streaming'));
      mockSdkClient.v4Channel.getChannel.mockResolvedValueOnce({
        channelId: '3151318',
        watchStatus: 'playback',
      });

      const result = await service.getStreamStatus(validRequest);

      expect(result.status).toBe('stopped');
    });
  });

  // ============================================
  // Helper Methods Tests (via behavior)
  // ============================================

  describe('formatDuration (via getStreamStatus)', () => {
    it('should format duration with hours correctly', async () => {
      mockSdkClient.channel.getStreamInfo.mockResolvedValueOnce({
        deployAddress: '1.2.3.4',
        inAddress: '5.6.7.8',
        streamName: 'stream-123',
        fps: '30',
        lfr: '0.1',
        inBandWidth: '5000',
      });

      mockSdkClient.v4Channel.getChannel.mockResolvedValueOnce({
        channelId: '3151318',
        watchStatus: 'live',
      });

      const result = await service.getStreamStatus({ channelId: '3151318' });

      expect(result.durationText).toBeDefined();
    });
  });

  describe('formatBandwidth (via getStreamStatus)', () => {
    it('should format bandwidth in Kbps correctly', async () => {
      mockSdkClient.channel.getStreamInfo.mockResolvedValueOnce({
        deployAddress: '1.2.3.4',
        inAddress: '5.6.7.8',
        streamName: 'stream-123',
        fps: '30',
        lfr: '0.1',
        inBandWidth: '1024',
      });

      mockSdkClient.v4Channel.getChannel.mockResolvedValueOnce({
        channelId: '3151318',
        watchStatus: 'live',
      });

      const result = await service.getStreamStatus({ channelId: '3151318' });

      expect(result.metrics?.bandwidthText).toBe('1.00 Kbps');
    });

    it('should format bandwidth in Mbps correctly', async () => {
      mockSdkClient.channel.getStreamInfo.mockResolvedValueOnce({
        deployAddress: '1.2.3.4',
        inAddress: '5.6.7.8',
        streamName: 'stream-123',
        fps: '30',
        lfr: '0.1',
        inBandWidth: '1048576',
      });

      mockSdkClient.v4Channel.getChannel.mockResolvedValueOnce({
        channelId: '3151318',
        watchStatus: 'live',
      });

      const result = await service.getStreamStatus({ channelId: '3151318' });

      expect(result.metrics?.bandwidthText).toBe('1.00 Mbps');
    });

    it('should return 0 bps for zero bandwidth', async () => {
      mockSdkClient.channel.getStreamInfo.mockResolvedValueOnce({
        deployAddress: '1.2.3.4',
        inAddress: '5.6.7.8',
        streamName: 'stream-123',
        fps: '30',
        lfr: '0.1',
        inBandWidth: '0',
      });

      mockSdkClient.v4Channel.getChannel.mockResolvedValueOnce({
        channelId: '3151318',
        watchStatus: 'live',
      });

      const result = await service.getStreamStatus({ channelId: '3151318' });

      expect(result.metrics?.bandwidthText).toBe('0 bps');
    });
  });

  // ============================================
  // Debug Mode Tests
  // ============================================

  describe('debug mode', () => {
    it('should not log errors when debug is false', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockSdkClient.v4Channel.getChannel.mockRejectedValueOnce(new Error('API Error'));

      try {
        await service.getStreamKey({ channelId: '3151318' });
      } catch (e) {
        // Expected
      }

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log errors when debug is true', async () => {
      const debugConfig = { ...mockServiceConfig, debug: true };
      const debugService = new StreamServiceSdk(mockAuthConfig, debugConfig);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockCreateSdkClient.mockReturnValue(mockSdkClient as any);
      mockSdkClient.v4Channel.getChannel.mockRejectedValueOnce(new Error('API Error'));

      try {
        await debugService.getStreamKey({ channelId: '3151318' });
      } catch (e) {
        // Expected
      }

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // ============================================
  // Error Handling Tests
  // ============================================

  describe('handleError', () => {
    it('should preserve PolyVError instances', async () => {
      const polyvError = new PolyVValidationError('Test error', 'field', 'value', 'required');
      mockSdkClient.channel.getPushUrl.mockRejectedValueOnce(polyvError);

      await expect(service.getStreamKey({ channelId: '3151318' })).rejects.toThrow(PolyVValidationError);
    });

    it('should preserve PolyVAPIError instances', async () => {
      const apiError = new PolyVAPIError('API error', 'API_ERROR', 500);
      mockSdkClient.channel.getPushUrl.mockRejectedValueOnce(apiError);

      await expect(service.getStreamKey({ channelId: '3151318' })).rejects.toThrow(PolyVAPIError);
    });

    it('should convert SDK errors with code to PolyVAPIError', async () => {
      const sdkError = new Error('SDK error');
      (sdkError as any).code = 'SDK_ERROR';
      (sdkError as any).status = 400;

      mockSdkClient.channel.getPushUrl.mockRejectedValueOnce(sdkError);

      try {
        await service.getStreamKey({ channelId: '3151318' });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVAPIError);
      }
    });

    it('should convert generic errors to PolyVError', async () => {
      mockSdkClient.channel.getPushUrl.mockRejectedValueOnce(new Error('Generic error'));

      try {
        await service.getStreamKey({ channelId: '3151318' });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVError);
        expect((error as PolyVError).code).toBe('STREAM_SERVICE_ERROR');
      }
    });

    it('should handle non-Error throws', async () => {
      mockSdkClient.channel.getPushUrl.mockRejectedValueOnce('string error');

      try {
        await service.getStreamKey({ channelId: '3151318' });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVError);
        expect((error as PolyVError).code).toBe('UNKNOWN_ERROR');
      }
    });
  });
});
