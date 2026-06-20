/**
 * @fileoverview Playback command handler for CLI operations
 * @author Development Team
 * @since 9.1.0
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { PlaybackServiceSdk } from '../services/playback.service.sdk';
import {
  PlaybackServiceConfig,
  PlaybackListOptions,
  PlaybackDisplayItem,
  PlaybackGetOptions,
  PlaybackDeleteOptions,
  PlaybackMergeOptions,
} from '../types/playback';
import { AuthConfig } from '../types/auth';
import { confirmDeletion, isInteractiveEnvironment } from '../utils/confirmation';
import { confirmWrite } from '../utils/api-command';

/**
 * Interface for playback service (enables dependency injection)
 */
export interface IPlaybackService {
  getPlaybackList(options: PlaybackListOptions): Promise<{
    contents: PlaybackDisplayItem[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }>;
  deletePlayback(channelId: string, videoId: string, listType?: 'playback' | 'vod'): Promise<boolean>;
  mergePlayback(channelId: string, fileIds: string[], fileName?: string): Promise<{ fileId: string; url?: string }>;
  mergePlaybackAsync(channelId: string, fileIds: string[], options?: {
    fileName?: string;
    callbackUrl?: string;
    autoConvert?: boolean;
    mergeMp4?: boolean;
  }): Promise<boolean>;
  listPlaybackSettings(channelIds: string[]): Promise<any>;
  getPlaybackVideoInfo(channelIds: string[]): Promise<any>;
  updateChannelSubtitles(channelId: string, body: any[]): Promise<void>;
  getPlaybackEnabled(channelId: string): Promise<any>;
  setPlaybackEnabled(params: any): Promise<any>;
  addVodPlayback(params: any): Promise<any>;
  updatePlaybackTitle(channelId: string, videoId: string, title: string): Promise<boolean>;
  movePlaybackVideo(params: any): Promise<void>;
  sortPlaybackVideos(params: any): Promise<void>;
}

/**
 * Handler for playback-related CLI commands
 */
export class PlaybackHandler extends BaseHandler {
  private readonly playbackService: IPlaybackService;

  /**
   * Creates a new PlaybackHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   * @param playbackService Optional injected playback service (for testing)
   */
  constructor(
    authConfig: AuthConfig,
    serviceConfig: PlaybackServiceConfig,
    playbackService?: IPlaybackService
  ) {
    super();
    this.playbackService = playbackService ?? new PlaybackServiceSdk(authConfig, serviceConfig);
  }

  /**
   * List playback videos for a channel
   * @param options Playback list options from CLI
   * @returns Promise that resolves when playback list is displayed
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When playback query fails
   *
   * @example
   * ```typescript
   * await playbackHandler.listPlayback({
   *   channelId: '2191532',
   *   output: 'table'
   * });
   * ```
   */
  async listPlayback(options: PlaybackListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate required channelId
      if (!options.channelId || options.channelId.trim() === '') {
        throw new Error('channelId is required');
      }

      // Call SDK service to get playback list
      const result = await this.playbackService.getPlaybackList(options);

      // Display results
      this.displayPlaybackList(result.contents, options.channelId, options.output);
    }, 'playback.list');
  }

  /**
   * Get a single playback video by videoId
   * @param options Playback get options from CLI
   * @returns Promise that resolves when playback details are displayed
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When playback query fails
   *
   * @example
   * ```typescript
   * await playbackHandler.getPlayback({
   *   channelId: '2191532',
   *   videoId: '1b96d90bf5',
   *   output: 'table'
   * });
   * ```
   */
  async getPlayback(options: PlaybackGetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate required channelId
      if (!options.channelId || options.channelId.trim() === '') {
        throw new Error('channelId is required');
      }

      // Validate required videoId
      if (!options.videoId || options.videoId.trim() === '') {
        throw new Error('videoId is required');
      }

      // Call SDK service to get playback list
      const result = await this.playbackService.getPlaybackList({
        channelId: options.channelId,
        ...(options.listType && { listType: options.listType }),
      });

      // Find the specific video by videoId
      const playback = result.contents.find(
        (item) => item.videoId === options.videoId
      );

      if (!playback) {
        this.displayInfo(`未找到回放视频 - 频道: ${options.channelId}, 视频ID: ${options.videoId}`);
        return;
      }

      // Display the single playback details
      this.displayPlaybackDetail(playback, options.channelId, options.output);
    }, 'playback.get');
  }

  /**
   * Delete a playback video from a channel
   * @param options Playback delete options from CLI
   * @returns Promise that resolves when playback video is deleted
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When deletion fails
   *
   * @example
   * ```typescript
   * await playbackHandler.deletePlayback({
   *   channelId: '3151318',
   *   videoId: '1b96d90bf5',
   *   force: true
   * });
   * ```
   */
  async deletePlayback(options: PlaybackDeleteOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate required channelId
      if (!options.channelId || options.channelId.trim() === '') {
        throw new Error('channelId is required');
      }

      // Validate required videoId
      if (!options.videoId || options.videoId.trim() === '') {
        throw new Error('videoId is required');
      }

      // Check for confirmation if force is not set
      if (!options.force) {
        // Check if we're in a TTY environment
        if (!isInteractiveEnvironment()) {
          throw new Error(
            'Interactive confirmation not available in non-TTY environment. Use --force flag to bypass confirmation.'
          );
        }

        // Prompt for confirmation
        const confirmed = await confirmDeletion(
          `确定要删除回放视频 '${options.videoId}' 吗？此操作无法撤销。`,
          'yes'
        );

        if (!confirmed) {
          this.displayInfo('删除操作已取消');
          return;
        }
      }

      // Get playback info first for display (optional - to show title in result)
      let playbackInfo: PlaybackDisplayItem | undefined;
      try {
        const result = await this.playbackService.getPlaybackList({
          channelId: options.channelId,
          ...(options.listType && { listType: options.listType }),
        });
        playbackInfo = result.contents.find((item) => item.videoId === options.videoId);
      } catch {
        // Ignore errors when getting playback info - deletion should still proceed
      }

      // Call SDK service to delete playback
      await this.playbackService.deletePlayback(
        options.channelId,
        options.videoId,
        options.listType
      );

      // Display deletion result
      this.displayDeleteResult(options, playbackInfo);
    }, 'playback.delete');
  }

  async listPlaybackSettings(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.playbackService.listPlaybackSettings(this.normalizeStringList(options.channelIds));
      this.displayResult(result, options.output);
    }, 'playback.setting-list');
  }

  async getPlaybackVideoInfo(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.playbackService.getPlaybackVideoInfo(this.normalizeStringList(options.channelIds));
      this.displayResult(result, options.output);
    }, 'playback.video-info');
  }

  async updateChannelSubtitles(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await confirmWrite(options.force, `Update playback subtitles for channel ${options.channelId}?`);
      await this.playbackService.updateChannelSubtitles(options.channelId, options.body);
      this.displayResult({ channelId: options.channelId, updated: true }, options.output);
    }, 'playback.subtitle.update-batch');
  }

  async getPlaybackEnabled(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.playbackService.getPlaybackEnabled(options.channelId);
      this.displayResult(result, options.output);
    }, 'playback.enabled.get');
  }

  async setPlaybackEnabled(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await confirmWrite(options.force, `Set playback enabled to ${options.playBackEnabled} for user ${options.userId}?`);
      const result = await this.playbackService.setPlaybackEnabled({
        userId: options.userId,
        playBackEnabled: options.playBackEnabled,
        channelId: options.channelId,
      });
      this.displayResult(result ?? { updated: true }, options.output);
    }, 'playback.enabled.set');
  }

  async addVodPlayback(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await confirmWrite(options.force, `Add VOD ${options.vid} to channel ${options.channelId} playback library?`);
      const result = await this.playbackService.addVodPlayback({
        channelId: options.channelId,
        vid: options.vid,
        setAsDefault: options.setAsDefault,
        listType: options.listType,
      });
      this.displayResult(result, options.output);
    }, 'playback.add-vod');
  }

  async updatePlaybackTitle(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await confirmWrite(options.force, `Update playback ${options.videoId} title?`);
      await this.playbackService.updatePlaybackTitle(options.channelId, options.videoId, options.title);
      this.displayResult({ channelId: options.channelId, videoId: options.videoId, title: options.title, updated: true }, options.output);
    }, 'playback.title.update');
  }

  async movePlaybackVideo(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await confirmWrite(options.force, `Move playback video ${options.videoId} ${options.type}?`);
      await this.playbackService.movePlaybackVideo({
        channelId: options.channelId,
        videoId: options.videoId,
        type: options.type,
        listType: options.listType,
      });
      this.displayResult({ channelId: options.channelId, videoId: options.videoId, type: options.type, moved: true }, options.output);
    }, 'playback.sort.move');
  }

  async sortPlaybackVideos(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const videoIds = this.normalizeStringList(options.videoIds);
      await confirmWrite(options.force, `Sort ${videoIds.length} playback video(s) for channel ${options.channelId}?`);
      await this.playbackService.sortPlaybackVideos({
        channelId: options.channelId,
        videoIds,
        listType: options.listType,
      });
      this.displayResult({ channelId: options.channelId, videoIds, sorted: true }, options.output);
    }, 'playback.sort.set');
  }

  /**
   * Displays playback list in the specified format
   * @param contents Array of playback items
   * @param channelId Channel ID for context
   * @param format Output format (table or json)
   */
  private displayPlaybackList(
    contents: PlaybackDisplayItem[],
    channelId: string,
    format: OutputFormat = 'table'
  ): void {
    if (contents.length === 0) {
      this.displayInfo(`暂无回放视频 - 频道: ${channelId}`);
      return;
    }

    // Display context info
    this.displayInfo(`回放列表 - 频道: ${channelId}`);
    this.displayInfo(`共 ${contents.length} 个回放视频`);

    // Display playback list in the requested format
    if (format === 'json') {
      this.displayData(contents, 'json');
    } else {
      this.displayPlaybackTable(contents);
    }
  }

  /**
   * Displays playback list as a formatted table
   * @param contents Array of playback items
   */
  private displayPlaybackTable(contents: PlaybackDisplayItem[]): void {
    // Transform playback data for table display
    const tableData = contents.map((item) => ({
      '视频ID': item.videoId,
      '标题': item.title,
      '时长': item.duration,
      '创建时间': this.formatTimestamp(item.createdTime),
      '状态': item.status === 'Y' ? '可用' : '不可用',
    }));

    this.displayAsTable(tableData);
  }

  /**
   * Displays a single playback video details
   * @param playback Playback item to display
   * @param channelId Channel ID for context
   * @param format Output format (table or json)
   */
  private displayPlaybackDetail(
    playback: PlaybackDisplayItem,
    channelId: string,
    format: OutputFormat = 'table'
  ): void {
    // Display context info
    this.displayInfo(`回放详情 - 频道: ${channelId}`);

    // Display playback details in the requested format
    if (format === 'json') {
      this.displayData(playback, 'json');
    } else {
      this.displayPlaybackDetailTable(playback);
    }
  }

  /**
   * Displays a single playback video as a formatted table
   * @param playback Playback item to display
   */
  private displayPlaybackDetailTable(playback: PlaybackDisplayItem): void {
    const tableData = [{
      '视频ID': playback.videoId,
      '标题': playback.title,
      '时长': playback.duration,
      '创建时间': this.formatTimestamp(playback.createdTime),
      '状态': playback.status === 'Y' ? '可用' : '不可用',
    }];

    this.displayAsTable(tableData);
  }

  /**
   * Displays deletion result in the specified format
   * @param options Delete options from CLI
   * @param playbackInfo Optional playback info for display
   */
  private displayDeleteResult(
    options: PlaybackDeleteOptions,
    playbackInfo?: PlaybackDisplayItem
  ): void {
    const format = options.output || 'table';

    // Build result data
    const resultData = {
      channelId: options.channelId,
      videoId: options.videoId,
      title: playbackInfo?.title || '未知',
      status: '已删除',
    };

    // Display context info
    this.displayInfo(`删除回放视频 - 频道: ${options.channelId}`);

    // Display in the requested format
    if (format === 'json') {
      this.displayData(resultData, 'json');
    } else {
      this.displayDeleteResultTable(resultData);
    }
  }

  private normalizeStringList(value: unknown): string[] {
    const items = Array.isArray(value) ? value : String(value ?? '').split(',');
    const list = items.map((item) => String(item).trim()).filter(Boolean);
    if (list.length === 0) {
      throw new Error('list must not be empty');
    }
    return list;
  }

  private displayResult(result: any, format: OutputFormat = 'table'): void {
    this.displayData(result ?? { success: true }, format);
  }

  /**
   * Displays deletion result as a formatted table
   * @param resultData Result data to display
   */
  private displayDeleteResultTable(resultData: {
    channelId: string;
    videoId: string;
    title: string;
    status: string;
  }): void {
    const tableData = [{
      '频道': resultData.channelId,
      '视频ID': resultData.videoId,
      '标题': resultData.title,
      '状态': resultData.status,
    }];

    this.displayAsTable(tableData);
  }

  /**
   * Formats a timestamp to readable date string
   * @param timestamp Unix timestamp in milliseconds
   * @returns Formatted date string
   */
  private formatTimestamp(timestamp?: number): string {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Merge playback files
   * @param options Playback merge options from CLI
   * @returns Promise that resolves when playback files are merged
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When merge fails
   *
   * @example
   * ```typescript
   * await playbackHandler.mergePlayback({
   *   channelId: '3151318',
   *   fileIds: 'file1,file2,file3',
   *   fileName: '合并回放',
   *   output: 'table'
   * });
   * ```
   */
  async mergePlayback(options: PlaybackMergeOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate required channelId
      if (!options.channelId || options.channelId.trim() === '') {
        throw new Error('channelId is required');
      }

      // Validate required fileIds
      if (!options.fileIds || options.fileIds.trim() === '') {
        throw new Error('fileIds is required');
      }

      // Parse comma-separated fileIds to array
      const fileIdArray = options.fileIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id);

      // Validate we have at least one valid fileId
      if (fileIdArray.length === 0) {
        throw new Error('At least one valid fileId is required');
      }

      // Validate max 15 files (API limit)
      if (fileIdArray.length > 15) {
        throw new Error('Maximum 15 files can be merged at once');
      }

      if (options.async) {
        // Async merge mode - build options object conditionally
        const asyncOptions: {
          fileName?: string;
          callbackUrl?: string;
          autoConvert?: boolean;
          mergeMp4?: boolean;
        } = {};

        if (options.fileName !== undefined) {
          asyncOptions.fileName = options.fileName;
        }
        if (options.callbackUrl !== undefined) {
          asyncOptions.callbackUrl = options.callbackUrl;
        }
        if (options.autoConvert !== undefined) {
          asyncOptions.autoConvert = options.autoConvert;
        }
        if (options.mergeMp4 !== undefined) {
          asyncOptions.mergeMp4 = options.mergeMp4;
        }

        await this.playbackService.mergePlaybackAsync(
          options.channelId,
          fileIdArray,
          asyncOptions
        );

        // Display async merge result
        this.displayAsyncMergeResult(options, fileIdArray);
      } else {
        // Sync merge mode
        const result = await this.playbackService.mergePlayback(
          options.channelId,
          fileIdArray,
          options.fileName
        );

        // Display merge result
        this.displayMergeResult(options, fileIdArray, result);
      }
    }, 'playback.merge');
  }

  /**
   * Displays merge result in the specified format
   * @param options Merge options from CLI
   * @param fileIdArray Array of file IDs that were merged
   * @param result Merge result from API
   */
  private displayMergeResult(
    options: PlaybackMergeOptions,
    fileIdArray: string[],
    result: { fileId: string; url?: string }
  ): void {
    const format = options.output || 'table';

    // Build result data
    const resultData: {
      channelId: string;
      fileName: string;
      sourceFileCount: number;
      status: string;
      fileId: string;
      url?: string;
    } = {
      channelId: options.channelId,
      fileName: options.fileName || '未命名',
      sourceFileCount: fileIdArray.length,
      status: '成功',
      fileId: result.fileId,
    };
    if (result.url !== undefined) {
      resultData.url = result.url;
    }

    // Display context info
    this.displayInfo(`合并成功`);
    this.displayInfo(`合并录制文件 - 频道: ${options.channelId}`);

    // Display in the requested format
    if (format === 'json') {
      this.displayData(resultData, 'json');
    } else {
      this.displayMergeResultTable(resultData);
    }
  }

  /**
   * Displays merge result as a formatted table
   * @param resultData Result data to display
   */
  private displayMergeResultTable(resultData: {
    channelId: string;
    fileName: string;
    sourceFileCount: number;
    status: string;
    fileId: string;
    url?: string | undefined;
  }): void {
    const tableData = [{
      '频道': resultData.channelId,
      '文件名': resultData.fileName,
      '源文件数': resultData.sourceFileCount,
      '合并结果': resultData.status,
      '文件地址': resultData.url ?? '-',
    }];

    this.displayAsTable(tableData);
  }

  /**
   * Displays async merge result in the specified format
   * @param options Merge options from CLI
   * @param fileIdArray Array of file IDs that were merged
   */
  private displayAsyncMergeResult(
    options: PlaybackMergeOptions,
    fileIdArray: string[]
  ): void {
    const format = options.output || 'table';

    // Build result data
    const resultData: {
      channelId: string;
      fileName: string;
      sourceFileCount: number;
      status: string;
      callbackUrl?: string;
    } = {
      channelId: options.channelId,
      fileName: options.fileName || '未命名',
      sourceFileCount: fileIdArray.length,
      status: '处理中',
    };
    if (options.callbackUrl !== undefined) {
      resultData.callbackUrl = options.callbackUrl;
    }

    // Display context info
    this.displayInfo(`合并任务已提交`);
    this.displayInfo(`合并录制文件（异步） - 频道: ${options.channelId}`);

    // Display in the requested format
    if (format === 'json') {
      this.displayData(resultData, 'json');
    } else {
      this.displayAsyncMergeResultTable(resultData);
    }
  }

  /**
   * Displays async merge result as a formatted table
   * @param resultData Result data to display
   */
  private displayAsyncMergeResultTable(resultData: {
    channelId: string;
    fileName: string;
    sourceFileCount: number;
    status: string;
    callbackUrl?: string | undefined;
  }): void {
    const tableData = [{
      '频道': resultData.channelId,
      '文件名': resultData.fileName,
      '源文件数': resultData.sourceFileCount,
      '状态': resultData.status,
      '提示': resultData.callbackUrl
        ? '合并完成后将通过回调URL通知，文件ID将在回调中返回'
        : '合并完成后请在频道回放列表查看（使用 playback list 命令）',
      '说明': '异步合并不立即返回文件ID，请稍后查询',
    }];

    this.displayAsTable(tableData);
  }
}
