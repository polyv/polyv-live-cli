/**
 * @fileoverview Stream service using PolyV Live API SDK
 * @author Development Team
 * @since 3.0.0
 */

import {
  StreamGetKeyRequest,
  StreamCredentials,
  StreamStartRequest,
  StreamStartResponse,
  StreamStopRequest,
  StreamStopResponse,
  StreamStatusRequest,
  StreamStatusInfo,
  StreamMonitorData
} from '../types/stream';
import { AuthConfig } from '../types/auth';
import { PolyVError, PolyVAPIError, PolyVValidationError } from '../utils/errors';
import { createSdkClient } from '../sdk';

/**
 * Configuration for stream service
 */
export interface StreamServiceConfig {
  /** Base URL for PolyV API */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Debug mode flag */
  debug: boolean;
}

/**
 * Stream service for managing PolyV live streaming operations using SDK
 */
export class StreamServiceSdk {
  private readonly config: StreamServiceConfig;
  private readonly authConfig: AuthConfig;

  /**
   * Creates a new StreamServiceSdk instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: StreamServiceConfig) {
    this.authConfig = authConfig;
    this.config = serviceConfig;
  }

  /**
   * Gets stream key and RTMP URL for a live channel
   * @param request Stream get key request parameters
   * @returns Promise resolving to stream credentials
   */
  async getStreamKey(request: StreamGetKeyRequest): Promise<StreamCredentials> {
    try {
      this.validateChannelId(request.channelId);

      const client = createSdkClient(this.authConfig, this.config.baseUrl);

      // Use V3 API to get push URL (V4 API may return 404 for some channels)
      const pushUrl = await client.channel.getPushUrl(request.channelId);

      // Parse the full RTMP URL to extract rtmpUrl and streamKey
      // URL format: rtmp://server/app/streamKey?params
      // We need to split into server+app and streamKey+params
      const urlObj = new URL(pushUrl);
      const pathParts = urlObj.pathname.split('/').filter(p => p);

      // rtmpUrl is server + app (e.g., rtmp://push-t2.videocc.net/recordf)
      // Note: urlObj.origin is null for non-standard protocols like rtmp://
      const rtmpUrl = `${urlObj.protocol}//${urlObj.host}/${pathParts[0] || ''}`;

      // streamKey is the rest of the path + query params
      const streamKeyPath = pathParts.slice(1).join('/');
      const streamKey = streamKeyPath ? `${streamKeyPath}?${urlObj.searchParams.toString()}` : urlObj.searchParams.toString();

      return {
        channelId: request.channelId,
        rtmpUrl,
        streamKey,
        deployAddress: '',
        inAddress: '',
        metrics: {
          fps: 0,
          lfr: 0,
          bandwidth: 0
        }
      };
    } catch (error) {
      throw this.handleError(error, 'getStreamKey');
    }
  }

  /**
   * Starts streaming for a channel
   * @param request Stream start request parameters
   * @returns Promise resolving to stream start response
   */
  async startStream(request: StreamStartRequest): Promise<StreamStartResponse> {
    try {
      this.validateChannelId(request.channelId);

      const client = createSdkClient(this.authConfig, this.config.baseUrl);

      // SDK requires userId for setStatusStart
      const userId = this.authConfig.userId || '';
      if (!userId) {
        throw new PolyVValidationError(
          'userId is required to start stream',
          'userId',
          '',
          'required'
        );
      }

      await client.channel.setStatusStart({
        channelId: request.channelId,
        userId: userId,
      });

      return {
        code: 200,
        status: 'success',
        message: 'Stream started successfully',
        data: 'success'
      };
    } catch (error) {
      throw this.handleError(error, 'startStream');
    }
  }

  /**
   * Stops streaming for a channel
   * @param request Stream stop request parameters
   * @returns Promise resolving to stream stop response
   */
  async stopStream(request: StreamStopRequest): Promise<StreamStopResponse> {
    try {
      this.validateChannelId(request.channelId);

      const client = createSdkClient(this.authConfig, this.config.baseUrl);

      // SDK requires userId for setStatusEnd
      const userId = this.authConfig.userId || '';
      if (!userId) {
        throw new PolyVValidationError(
          'userId is required to stop stream',
          'userId',
          '',
          'required'
        );
      }

      await client.channel.setStatusEnd({
        channelId: request.channelId,
        userId: userId,
      });

      return {
        code: 200,
        status: 'success',
        message: 'Stream stopped successfully',
        data: 'success'
      };
    } catch (error) {
      throw this.handleError(error, 'stopStream');
    }
  }

  /**
   * Gets enhanced stream status information for a channel
   * @param request Stream status request parameters
   * @returns Promise resolving to stream status information
   */
  async getStreamStatus(request: StreamStatusRequest): Promise<StreamStatusInfo> {
    try {
      this.validateChannelId(request.channelId);

      const client = createSdkClient(this.authConfig, this.config.baseUrl);

      // First try to get stream info (only works for live channels)
      let streamMonitorData: StreamMonitorData | null = null;
      let streamInfoError: { code: string; message: string } | undefined;

      try {
        const streamInfo = await client.channel.getStreamInfo({
          channelId: request.channelId,
        });

        streamMonitorData = {
          deployAddress: (streamInfo as any).deployAddress || '',
          inAddress: (streamInfo as any).inAddress || '',
          streamName: (streamInfo as any).streamName || '',
          fps: (streamInfo as any).fps || '0',
          lfr: (streamInfo as any).lfr,
          inBandWidth: (streamInfo as any).inBandWidth || '0',
          retrievedAt: new Date(),
          channelId: request.channelId
        };
      } catch (error) {
        if (error instanceof PolyVAPIError) {
          streamInfoError = {
            code: error.code || 'STREAM_INFO_ERROR',
            message: error.message
          };
        }
      }

      // Get channel information to determine overall status
      let channelStatus: 'live' | 'stopped' | 'waiting' | 'error' | 'unknown' = 'unknown';
      let statusText = 'Unknown';
      let isLive = false;
      let channelError: { code: string; message: string } | undefined;

      try {
        const channelInfo = await client.v4Channel.getChannel({
          channelId: request.channelId,
        });

        if (channelInfo && channelInfo.watchStatus) {
          const watchStatus = channelInfo.watchStatus as string;
          switch (watchStatus) {
            case 'live':
              channelStatus = 'live';
              statusText = 'Live';
              isLive = true;
              break;
            case 'waiting':
            case 'unStart':
              channelStatus = 'waiting';
              statusText = 'Waiting';
              break;
            case 'end':
            case 'playback':
              channelStatus = 'stopped';
              statusText = 'Stopped';
              break;
            case 'banpush':
              channelStatus = 'error';
              statusText = 'Push Banned';
              break;
            default:
              channelStatus = 'unknown';
              statusText = watchStatus || 'Unknown';
          }
        }
      } catch (error) {
        channelStatus = 'error';
        statusText = 'Channel Error';
        if (error instanceof PolyVAPIError) {
          channelError = {
            code: error.code || 'CHANNEL_ERROR',
            message: error.message
          };
        }
      }

      // Calculate duration if live and we have stream monitor data
      let duration: number | undefined;
      let durationText: string | undefined;

      if (isLive && streamMonitorData && streamMonitorData.retrievedAt) {
        duration = Date.now() - streamMonitorData.retrievedAt.getTime();
        durationText = this.formatDuration(duration);
      }

      // Build metrics if available
      let metrics: StreamStatusInfo['metrics'] | undefined;
      if (streamMonitorData) {
        const fpsValue = parseFloat(streamMonitorData.fps) || 0;
        const lfrValue = parseFloat(streamMonitorData.lfr || '0') || 0;
        const bandwidthValue = parseFloat(streamMonitorData.inBandWidth) || 0;

        metrics = {
          fps: fpsValue,
          lfr: lfrValue,
          bandwidth: bandwidthValue,
          bandwidthText: this.formatBandwidth(bandwidthValue)
        };
      }

      // Build network info if available
      let network: StreamStatusInfo['network'] | undefined;
      if (streamMonitorData) {
        network = {
          ...(streamMonitorData.deployAddress && { deployAddress: streamMonitorData.deployAddress }),
          ...(streamMonitorData.inAddress && { inAddress: streamMonitorData.inAddress }),
          ...(streamMonitorData.streamName && { streamName: streamMonitorData.streamName })
        };
      }

      // Determine final error to include
      let finalError: { code: string; message: string } | undefined;
      if (channelStatus === 'waiting' && streamInfoError) {
        finalError = streamInfoError;
      } else if (channelStatus === 'error') {
        finalError = channelError || streamInfoError;
      }

      return {
        channelId: request.channelId,
        status: channelStatus,
        statusText,
        isLive,
        ...(duration !== undefined && { duration }),
        ...(durationText !== undefined && { durationText }),
        ...(metrics !== undefined && { metrics }),
        ...(network !== undefined && { network }),
        lastUpdated: new Date(),
        ...(finalError !== undefined && { error: finalError })
      };
    } catch (error) {
      throw this.handleError(error, 'getStreamStatus');
    }
  }

  async getLiveStatus(stream: string): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.getLiveStatus(stream);
    } catch (error) {
      throw this.handleError(error, 'getLiveStatus');
    }
  }

  async getLiveStatusList(options: { channelIds: string[] }): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.getLiveStatusList(options);
    } catch (error) {
      throw this.handleError(error, 'getLiveStatusList');
    }
  }

  async getStreams(options: { channelIds: string[] }): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.getStreams(options);
    } catch (error) {
      throw this.handleError(error, 'getStreams');
    }
  }

  async listDiskVideo(options: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.listDiskVideo(options);
    } catch (error) {
      throw this.handleError(error, 'listDiskVideo');
    }
  }

  async getCaptureImage(channelId: string): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.getCaptureImage(channelId);
    } catch (error) {
      throw this.handleError(error, 'getCaptureImage');
    }
  }

  async addDiskVideos(options: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.addDiskVideos(options);
    } catch (error) {
      throw this.handleError(error, 'addDiskVideos');
    }
  }

  async deleteDiskVideos(options: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.deleteDiskVideos(options);
    } catch (error) {
      throw this.handleError(error, 'deleteDiskVideos');
    }
  }

  async endDiskPush(options: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.endDiskPush(options);
    } catch (error) {
      throw this.handleError(error, 'endDiskPush');
    }
  }

  async banPush(options: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.banPush(options);
    } catch (error) {
      throw this.handleError(error, 'banPush');
    }
  }

  async resume(options: { channelId: string; userId: string }): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.resume(options);
    } catch (error) {
      throw this.handleError(error, 'resume');
    }
  }

  async updateStreamType(options: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.updateStreamType(options);
    } catch (error) {
      throw this.handleError(error, 'updateStreamType');
    }
  }

  // ===== Validation Methods =====

  private validateChannelId(channelId: string): void {
    if (!channelId || typeof channelId !== 'string' || channelId.trim() === '') {
      throw new PolyVValidationError(
        'Channel ID cannot be empty',
        'channelId',
        channelId,
        'required'
      );
    }
  }

  // ===== Helper Methods =====

  private formatDuration(duration: number): string {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  private formatBandwidth(bandwidth: number): string {
    if (bandwidth === 0) return '0 bps';

    const units = ['bps', 'Kbps', 'Mbps', 'Gbps'];
    let unitIndex = 0;
    let value = bandwidth;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(2)} ${units[unitIndex]}`;
  }

  private handleError(error: unknown, operation: string): Error {
    if (this.config.debug) {
      console.error(`[StreamServiceSdk] Error in ${operation}:`, error);
    }

    if (error instanceof PolyVError || error instanceof PolyVAPIError || error instanceof PolyVValidationError) {
      return error;
    }

    if (error instanceof Error) {
      const anyError = error as any;
      if (anyError.polyvCode || anyError.code) {
        return new PolyVAPIError(
          error.message,
          anyError.code || 'API_ERROR',
          anyError.status || 500,
          {
            polyvCode: anyError.polyvCode,
            polyvMessage: anyError.polyvMessage || error.message,
          }
        );
      }

      return new PolyVError(
        `Failed to ${operation}: ${error.message}`,
        'STREAM_SERVICE_ERROR',
        500,
        { originalError: error.message }
      );
    }

    return new PolyVError(
      `Failed to ${operation}: Unknown error`,
      'UNKNOWN_ERROR',
      500,
      { originalError: String(error) }
    );
  }
}
