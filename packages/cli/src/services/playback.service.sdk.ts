/**
 * @fileoverview Playback service using PolyV Live API SDK
 * @author Development Team
 * @since 9.1.0
 */

import {
  PlaybackListOptions,
  PlaybackServiceConfig,
  PlaybackDisplayItem,
} from '../types/playback';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { createSdkClient } from '../sdk';

/**
 * Playback service for managing PolyV live playback using SDK
 */
export class PlaybackServiceSdk {
  private readonly config: PlaybackServiceConfig;
  private readonly authConfig: AuthConfig;

  /**
   * Creates a new PlaybackServiceSdk instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: PlaybackServiceConfig) {
    this.authConfig = authConfig;
    this.config = serviceConfig;
  }

  /**
   * Get playback list for a channel
   * @param options Playback list options from CLI
   * @returns Promise resolving to array of playback display items
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getPlaybackList(options: PlaybackListOptions): Promise<{
    contents: PlaybackDisplayItem[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }> {
    // Validate parameters
    this.validateListOptions(options);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Build SDK params
    const params: {
      page?: number;
      pageSize?: number;
      listType?: 'playback' | 'vod';
    } = {};

    if (options.page !== undefined) {
      params.page = options.page;
    }
    if (options.pageSize !== undefined) {
      params.pageSize = options.pageSize;
    }
    if (options.listType !== undefined) {
      params.listType = options.listType;
    }

    // Call SDK
    const result = await client.channel.getPlaybackList(options.channelId, params);

    // Transform data for CLI display
    return {
      contents: (result.contents || []).map((item) => {
        const displayItem: PlaybackDisplayItem = {
          videoId: item.videoId,
          channelId: String(item.channelId),
          title: item.title || '',
          duration: this.formatDuration(item.duration),
        };
        // Only add optional fields if they have values
        if (item.videoPoolId !== undefined) displayItem.videoPoolId = item.videoPoolId;
        if (item.userId !== undefined) displayItem.userId = item.userId;
        if (item.firstImage !== undefined) displayItem.firstImage = item.firstImage;
        if (item.myBr !== undefined) displayItem.myBr = item.myBr;
        if (item.seed !== undefined) displayItem.seed = item.seed;
        if (item.createdTime !== undefined) displayItem.createdTime = item.createdTime;
        if (item.lastModified !== undefined) displayItem.lastModified = item.lastModified;
        if (item.asDefault !== undefined) displayItem.asDefault = item.asDefault;
        if (item.status !== undefined) displayItem.status = item.status;
        if (item.watchUrl !== undefined) displayItem.watchUrl = item.watchUrl;
        if (item.liveType !== undefined) displayItem.liveType = item.liveType;
        if (item.origin !== undefined) displayItem.origin = item.origin;
        return displayItem;
      }),
      pageNumber: result.pageNumber,
      pageSize: result.pageSize,
      totalItems: result.totalItems || result.total || 0,
      totalPages: result.totalPages || 0,
    };
  }

  async listPlaybackSettings(channelIds: string[]): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.listPlaybackSettings({ channelIds });
  }

  async getPlaybackVideoInfo(channelIds: string[]): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.getPlaybackVideoInfo({ channelIds });
  }

  async updateChannelSubtitles(channelId: string, body: any[]): Promise<void> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    await client.v4Channel.updateChannelSubtitleBatch({ channelId, body });
  }

  async getPlaybackEnabled(channelId: string): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getPlaybackEnabled(channelId);
  }

  async setPlaybackEnabled(params: {
    userId: string;
    playBackEnabled: 'Y' | 'N';
    channelId?: string;
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.setUserPlaybackEnabled(params);
  }

  async addVodPlayback(params: {
    channelId: string;
    vid: string;
    setAsDefault?: 'Y' | 'N';
    listType?: 'playback' | 'vod';
  }): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.addVodPlaybackToLibrary(params);
  }

  async updatePlaybackTitle(channelId: string, videoId: string, title: string): Promise<boolean> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.updatePlaybackTitle(channelId, videoId, title);
  }

  async movePlaybackVideo(params: {
    channelId: string;
    videoId: string;
    type: 'up' | 'down';
    listType?: 'playback' | 'vod';
  }): Promise<void> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    await client.channel.movePlaybackVideo(params);
  }

  async sortPlaybackVideos(params: {
    channelId: string;
    videoIds: string[];
    listType?: 'playback' | 'vod';
  }): Promise<void> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    await client.channel.sortPlaybackVideos(params);
  }

  /**
   * Formats duration from seconds to HH:MM:SS format
   * @param seconds Duration in seconds
   * @returns Formatted duration string
   */
  private formatDuration(seconds?: number): string {
    if (seconds === undefined || seconds === null) {
      return '00:00:00';
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Validates playback list options
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateListOptions(options: PlaybackListOptions): void {
    const errors: string[] = [];

    // Validate channelId parameter
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim().length === 0) {
      errors.push('channelId is required and must be a non-empty string');
    }

    // Validate page if specified
    if (options.page !== undefined && (!Number.isInteger(options.page) || options.page < 1)) {
      errors.push('page must be a positive integer');
    }

    // Validate pageSize if specified
    if (options.pageSize !== undefined && (!Number.isInteger(options.pageSize) || options.pageSize < 1)) {
      errors.push('pageSize must be a positive integer');
    }

    // Validate listType if specified
    if (options.listType !== undefined && !['playback', 'vod'].includes(options.listType)) {
      errors.push('listType must be either "playback" or "vod"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Playback list options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  /**
   * Delete a playback video from a channel
   * @param channelId Channel ID
   * @param videoId Video ID to delete
   * @param listType List type (playback or vod)
   * @returns Promise resolving to true if deletion was successful
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async deletePlayback(
    channelId: string,
    videoId: string,
    listType?: 'playback' | 'vod'
  ): Promise<boolean> {
    // Validate parameters
    this.validateDeleteParams(channelId, videoId, listType);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const result = await client.channel.deletePlayback(channelId, videoId, listType);

    return result;
  }

  /**
   * Validates delete parameters
   * @param channelId Channel ID
   * @param videoId Video ID
   * @param listType List type
   * @throws {PolyVValidationError} When validation fails
   */
  private validateDeleteParams(
    channelId: string,
    videoId: string,
    listType?: 'playback' | 'vod'
  ): void {
    const errors: string[] = [];

    // Validate channelId parameter
    if (!channelId || typeof channelId !== 'string' || channelId.trim().length === 0) {
      errors.push('channelId is required and must be a non-empty string');
    }

    // Validate videoId parameter
    if (!videoId || typeof videoId !== 'string' || videoId.trim().length === 0) {
      errors.push('videoId is required and must be a non-empty string');
    }

    // Validate listType if specified
    if (listType !== undefined && !['playback', 'vod'].includes(listType)) {
      errors.push('listType must be either "playback" or "vod"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Playback delete parameters validation failed: ${errors.join(', ')}`,
        'params',
        { channelId, videoId, listType },
        'validation_failed'
      );
    }
  }

  /**
   * Merge playback files synchronously
   * @param channelId Channel ID
   * @param fileIds Array of file IDs to merge
   * @param fileName Optional merged file name
   * @returns Promise resolving to merge result with file ID and URL
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async mergePlayback(
    channelId: string,
    fileIds: string[],
    fileName?: string
  ): Promise<{ fileId: string; url?: string }> {
    // Validate parameters
    this.validateMergeParams(channelId, fileIds);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Build params object
    const params: { fileIds: string[]; fileName?: string } = { fileIds };
    if (fileName !== undefined) {
      params.fileName = fileName;
    }

    // Call SDK
    const result = await client.channel.recordFileMerge(channelId, params);

    return result;
  }

  /**
   * Merge playback files asynchronously
   * @param channelId Channel ID
   * @param fileIds Array of file IDs to merge
   * @param options Optional async merge options
   * @returns Promise resolving to true if merge was submitted successfully
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async mergePlaybackAsync(
    channelId: string,
    fileIds: string[],
    options?: {
      fileName?: string;
      callbackUrl?: string;
      autoConvert?: boolean;
      mergeMp4?: boolean;
      orderByCustom?: boolean;
    }
  ): Promise<boolean> {
    // Validate parameters
    this.validateMergeParams(channelId, fileIds);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Build request params
    const params: {
      fileIds: string[];
      fileName?: string;
      callbackUrl?: string;
      autoConvert?: 'Y' | 'N';
      mergeMp4?: 'Y' | 'N';
      orderByCustom?: 'Y' | 'N';
    } = { fileIds };

    if (options?.fileName !== undefined) {
      params.fileName = options.fileName;
    }
    if (options?.callbackUrl !== undefined) {
      params.callbackUrl = options.callbackUrl;
    }
    if (options?.autoConvert !== undefined) {
      params.autoConvert = options.autoConvert ? 'Y' : 'N';
    }
    if (options?.mergeMp4 !== undefined) {
      params.mergeMp4 = options.mergeMp4 ? 'Y' : 'N';
    }
    if (options?.orderByCustom !== undefined) {
      params.orderByCustom = options.orderByCustom ? 'Y' : 'N';
    }

    // The latest inventory keeps this API at /record/merge.
    await client.channel.recordFileMerge(channelId, params);

    return true;
  }

  /**
   * Validates merge parameters
   * @param channelId Channel ID
   * @param fileIds Array of file IDs
   * @throws {PolyVValidationError} When validation fails
   */
  private validateMergeParams(channelId: string, fileIds: string[]): void {
    const errors: string[] = [];

    // Validate channelId parameter
    if (!channelId || typeof channelId !== 'string' || channelId.trim().length === 0) {
      errors.push('channelId is required and must be a non-empty string');
    }

    // Validate fileIds parameter
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      errors.push('fileIds is required and must be a non-empty array');
    } else {
      // Validate each fileId
      const invalidFileIds = fileIds.filter(id => !id || typeof id !== 'string' || id.trim().length === 0);
      if (invalidFileIds.length > 0) {
        errors.push('all fileIds must be non-empty strings');
      }
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Playback merge parameters validation failed: ${errors.join(', ')}`,
        'params',
        { channelId, fileIds },
        'validation_failed'
      );
    }
  }
}
