/**
 * @fileoverview Record settings service using PolyV Live API SDK
 * @author Development Team
 * @since 9.7.0
 */

import {
  RecordServiceConfig,
  RecordSettingDisplayItem,
  RecordSettingSetOptions,
  RecordConvertOptions,
  RecordConvertResult,
} from '../types/record';
import { AuthConfig } from '../types/auth';
import { createSdkClient } from '../sdk';

/**
 * Record settings service for managing PolyV live playback settings using SDK
 */
export class RecordServiceSdk {
  private readonly config: RecordServiceConfig;
  private readonly authConfig: AuthConfig;

  /**
   * Creates a new RecordServiceSdk instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: RecordServiceConfig) {
    this.authConfig = authConfig;
    this.config = serviceConfig;
  }

  /**
   * Get playback setting for a channel
   * @param channelId Channel ID
   * @returns Promise resolving to playback setting display item
   */
  async getPlaybackSetting(channelId: string): Promise<RecordSettingDisplayItem> {
    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const result = await client.channel.getPlaybackSetting(channelId);

    // Transform to display format - handle undefined values
    const displayItem: RecordSettingDisplayItem = {
      channelId: String(result['channelId'] ?? channelId),
    };
    if (result['playbackEnabled'] !== undefined) displayItem.playbackEnabled = result['playbackEnabled'];
    if (result['type'] !== undefined) displayItem.type = result['type'];
    if (result['origin'] !== undefined) displayItem.origin = result['origin'];
    if (result['videoId'] !== undefined) displayItem.videoId = result['videoId'];
    if (result['videoName'] !== undefined) displayItem.videoName = result['videoName'];
    if (result['sectionEnabled'] !== undefined) displayItem.sectionEnabled = result['sectionEnabled'];
    if (result['globalSettingEnabled'] !== undefined) displayItem.globalSettingEnabled = result['globalSettingEnabled'];
    if (result['playbackMultiplierEnabled'] !== undefined) displayItem.playbackMultiplierEnabled = result['playbackMultiplierEnabled'];
    if (result['playbackProgressBarEnabled'] !== undefined) displayItem.playbackProgressBarEnabled = result['playbackProgressBarEnabled'];
    if (result['playbackProgressBarOperationType'] !== undefined) displayItem.playbackProgressBarOperationType = result['playbackProgressBarOperationType'];
    if (result['showPlayButtonEnabled'] !== undefined) displayItem.showPlayButtonEnabled = result['showPlayButtonEnabled'];
    if (result['chatPlaybackEnabled'] !== undefined) displayItem.chatPlaybackEnabled = result['chatPlaybackEnabled'];
    if (result['productPlaybackEnabled'] !== undefined) displayItem.productPlaybackEnabled = result['productPlaybackEnabled'];
    if (result['questionnairePlaybackEnabled'] !== undefined) displayItem.questionnairePlaybackEnabled = result['questionnairePlaybackEnabled'];
    if (result['qaPlaybackEnabled'] !== undefined) displayItem.qaPlaybackEnabled = result['qaPlaybackEnabled'];
    if (result['cardPushPlaybackEnabled'] !== undefined) displayItem.cardPushPlaybackEnabled = result['cardPushPlaybackEnabled'];
    if (result['checkInPlaybackEnabled'] !== undefined) displayItem.checkInPlaybackEnabled = result['checkInPlaybackEnabled'];
    if (result['crontabType'] !== undefined) displayItem.crontabType = result['crontabType'];
    if (result['startTime'] !== undefined) displayItem.startTime = result['startTime'];
    if (result['endTime'] !== undefined) displayItem.endTime = result['endTime'];
    return displayItem;
  }

  /**
   * Set playback setting for a channel
   * @param channelId Channel ID
   * @param options Playback setting options
   * @returns Promise resolving to true if successful
   */
  async setPlaybackSetting(
    channelId: string,
    options: RecordSettingSetOptions
  ): Promise<boolean> {
    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Build SDK params (exclude channelId and output)
    const params: Record<string, any> = {};
    if (options['playbackEnabled'] !== undefined) params['playbackEnabled'] = options['playbackEnabled'];
    if (options['type'] !== undefined) params['type'] = options['type'];
    if (options['origin'] !== undefined) params['origin'] = options['origin'];
    if (options['videoId'] !== undefined) params['videoId'] = options['videoId'];
    if (options['globalSettingEnabled'] !== undefined) params['globalSettingEnabled'] = options['globalSettingEnabled'];
    if (options['sectionEnabled'] !== undefined) params['sectionEnabled'] = options['sectionEnabled'];
    if (options['playbackMultiplierEnabled'] !== undefined) params['playbackMultiplierEnabled'] = options['playbackMultiplierEnabled'];
    if (options['playbackProgressBarEnabled'] !== undefined) params['playbackProgressBarEnabled'] = options['playbackProgressBarEnabled'];
    if (options['playbackProgressBarOperationType'] !== undefined) params['playbackProgressBarOperationType'] = options['playbackProgressBarOperationType'];
    if (options['showPlayButtonEnabled'] !== undefined) params['showPlayButtonEnabled'] = options['showPlayButtonEnabled'];
    if (options['chatPlaybackEnabled'] !== undefined) params['chatPlaybackEnabled'] = options['chatPlaybackEnabled'];
    if (options['productPlaybackEnabled'] !== undefined) params['productPlaybackEnabled'] = options['productPlaybackEnabled'];
    if (options['questionnairePlaybackEnabled'] !== undefined) params['questionnairePlaybackEnabled'] = options['questionnairePlaybackEnabled'];
    if (options['qaPlaybackEnabled'] !== undefined) params['qaPlaybackEnabled'] = options['qaPlaybackEnabled'];
    if (options['cardPushPlaybackEnabled'] !== undefined) params['cardPushPlaybackEnabled'] = options['cardPushPlaybackEnabled'];
    if (options['checkInPlaybackEnabled'] !== undefined) params['checkInPlaybackEnabled'] = options['checkInPlaybackEnabled'];

    // Call SDK
    const result = await client.channel.setPlaybackSetting(channelId, params);

    return result;
  }

  /**
   * Convert recording to VOD (sync mode)
   * @param channelId Channel ID
   * @param options Convert options
   * @returns Promise resolving to convert result
   */
  async recordConvert(
    channelId: string,
    options: RecordConvertOptions
  ): Promise<RecordConvertResult> {
    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Build SDK params - use sessionId or fileId as the source
    const params: { fileId: string; fileName: string; callbackUrl?: string } = {
      fileId: options['sessionId'] ?? options['fileId'] ?? '',
      fileName: options['fileName'],
    };
    if (options['callbackUrl'] !== undefined) {
      params.callbackUrl = options['callbackUrl'];
    }

    // Call SDK - sync mode
    const result = await client.channel.recordConvert(channelId, params);

    return {
      async: false,
      vid: result['fileId'],
    };
  }

  /**
   * Convert recording to VOD (async mode)
   * @param channelId Channel ID
   * @param options Convert options
   * @returns Promise resolving to convert result
   */
  async recordConvertAsync(
    channelId: string,
    options: RecordConvertOptions
  ): Promise<RecordConvertResult> {
    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Build SDK params - use sessionId or fileId as the source
    const params: { fileId: string; fileName: string; callbackUrl?: string } = {
      fileId: options['sessionId'] ?? options['fileId'] ?? '',
      fileName: options['fileName'],
    };
    if (options['callbackUrl'] !== undefined) {
      params.callbackUrl = options['callbackUrl'];
    }

    // Call SDK - async mode
    await client.channel.recordConvertAsync(channelId, params);

    return {
      async: true,
    };
  }

  /**
   * Set default playback video for a channel
   * @param channelId Channel ID
   * @param videoId Video ID
   * @param listType List type (playback or vod)
   * @returns Promise resolving to true if successful
   */
  async setRecordDefault(
    channelId: string,
    videoId: string,
    listType?: 'playback' | 'vod'
  ): Promise<boolean> {
    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const result = await client.channel.setRecordDefault(channelId, videoId, listType);

    return result;
  }
}
