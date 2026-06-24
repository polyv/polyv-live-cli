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
   *
   * Uses the v2 endpoint which accepts a sessionId (or fileUrl) directly.
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

    // The v2 sync endpoint requires the account userId (included in signature).
    const userId = options.userId ?? this.authConfig.userId;
    if (!userId) {
      throw new Error(
        'record convert (sync) 需要 userId：请通过 --user-id 传入，或确认当前账号已配置 userId'
      );
    }
    if (!options.fileName || options.fileName.trim() === '') {
      throw new Error('record convert (sync) 需要 --file-name');
    }

    // Build SDK params - sync mode is sessionId/fileUrl based
    const params: {
      userId: string;
      fileName: string;
      sessionId?: string;
      fileUrl?: string;
      cataid?: string;
      cataname?: string;
      toPlayList?: 'Y' | 'N';
      setAsDefault?: 'Y' | 'N';
    } = {
      userId,
      fileName: options.fileName,
    };
    if (options.sessionId) params.sessionId = options.sessionId;
    if (options.fileUrl) params.fileUrl = options.fileUrl;
    if (options.cataId !== undefined) params.cataid = options.cataId;
    if (options.cataName !== undefined) params.cataname = options.cataName;
    if (options.toPlayList !== undefined) params.toPlayList = options.toPlayList;
    if (options.setAsDefault !== undefined) params.setAsDefault = options.setAsDefault;

    // Call SDK - sync mode
    const result = await client.channel.recordConvert(channelId, params);

    return {
      async: false,
      vid: result.vid,
    };
  }

  /**
   * Convert recording to VOD (async mode)
   *
   * Uses the v3 endpoint which requires comma-separated fileIds (obtain them via
   * `record file list -c <channelId> --user-id <userId> --session-ids <id>`).
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

    if (!options.fileIds || options.fileIds.trim() === '') {
      throw new Error(
        'record convert --async 需要 --file-ids（逗号分隔）。请先用 ' +
          '`record file list -c <channelId> --user-id <userId> --session-ids <id>` 获取 fileId'
      );
    }

    // Build SDK params - async mode is fileIds based
    const params: {
      fileIds: string;
      fileName?: string;
      cataId?: string;
      callbackUrl?: string;
    } = {
      fileIds: options.fileIds,
    };
    if (options.fileName !== undefined) {
      params.fileName = options.fileName;
    }
    if (options.cataId !== undefined) {
      params.cataId = options.cataId;
    }
    if (options.callbackUrl !== undefined) {
      params.callbackUrl = options.callbackUrl;
    }

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
    await client.channel.setDefaultPlaybackVideo({
      channelId,
      videoId,
      ...(listType ? { listType } : {}),
    });

    return true;
  }

  async getRecordFile(channelId: string, fileId: string): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getRecordFile(channelId, fileId);
  }

  async listRecordFiles(params: {
    channelId: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    sessionIds?: string;
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    // The record-file list API requires userId (included in signature). When the
    // caller omits it, fall back to the active account's userId so users do not
    // have to pass --user-id explicitly.
    const userId = params.userId && params.userId.trim() !== ''
      ? params.userId
      : this.authConfig.userId;
    if (!userId) {
      throw new Error(
        'record file list 需要 userId：请通过 --user-id 传入，或确认当前账号已配置 userId'
      );
    }
    return client.channel.listRecordFiles({ ...params, userId });
  }

  async listMaterialRecordFiles(params: {
    channelId: string;
    page?: number;
    pageSize?: number;
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.listMaterialRecordFiles(params);
  }

  async clipRecordFile(channelId: string, options: {
    fileId: string;
    startTime: number;
    endTime: number;
    fileName?: string;
    callbackUrl?: string;
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.clipRecordFile(channelId, options);
  }

  async mergeRecordFiles(params: {
    channelId: string;
    urls?: string;
    fileIds?: string;
    fileName?: string;
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.mergeRecordFiles(params);
  }

  async recordMergeMp4(channelId: string, options: {
    fileIds: string[];
    fileName?: string;
    callbackUrl?: string;
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.recordMergeMp4(channelId, options);
  }

  async recordMergeMp4Start(channelId: string, options: {
    fileIds: string[];
    fileName?: string;
    callbackUrl?: string;
  }): Promise<boolean> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.recordMergeMp4Start(channelId, options);
  }

  async deleteRecordFile(params: {
    channelId: string;
    sessionId?: string;
    startTime?: string;
  }): Promise<void> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    await client.channel.deleteRecordFile(params);
  }

  async convertRecordFileToVod(params: {
    channelId: string;
    userId: string;
    fileName: string;
    fileUrl?: string;
    sessionId?: string;
    cataid?: string;
    cataname?: string;
    toPlayList?: 'Y' | 'N';
    setAsDefault?: 'Y' | 'N';
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.convertRecordFileToVod(params);
  }

  async recordAddBreakpoint(channelId: string, options: { fileId: string; time: number }): Promise<boolean> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.recordAddBreakpoint(channelId, options);
  }

  async createRecordFileOutline(params: {
    fileId: string;
    aiKnowledgeQuizEnabled?: 'Y' | 'N';
    aiSummaryAuditEnabled?: 'Y' | 'N';
    syncToPlaybackDotEnabled?: 'Y' | 'N';
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.createRecordFileOutline(params);
  }

  async getRecordFileOutline(channelId: string, fileId: string): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.getRecordFileOutline({ channelId, fileId });
  }

  async batchPublishRecordFileSubtitles(subtitles: Array<{ id: string | number; status: string }>): Promise<void> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    await client.v4Channel.batchPublishRecordFileSubtitles({ subtitles });
  }
}
