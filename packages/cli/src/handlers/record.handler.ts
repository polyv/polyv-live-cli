/**
 * @fileoverview Record settings command handler for CLI operations
 * @author Development Team
 * @since 9.7.0
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { RecordServiceSdk } from '../services/record.service.sdk';
import {
  RecordServiceConfig,
  RecordSettingGetOptions,
  RecordSettingSetOptions,
  RecordConvertOptions,
  RecordSetDefaultOptions,
  RecordSettingDisplayItem,
  RecordConvertResult,
} from '../types/record';
import { AuthConfig } from '../types/auth';
import { confirmWrite } from '../utils/api-command';

/**
 * Interface for record service (enables dependency injection)
 */
export interface IRecordService {
  getPlaybackSetting(channelId: string): Promise<RecordSettingDisplayItem>;
  setPlaybackSetting(channelId: string, options: RecordSettingSetOptions): Promise<boolean>;
  recordConvert(channelId: string, options: RecordConvertOptions): Promise<RecordConvertResult>;
  recordConvertAsync(channelId: string, options: RecordConvertOptions): Promise<RecordConvertResult>;
  setRecordDefault(channelId: string, videoId: string, listType?: 'playback' | 'vod'): Promise<boolean>;
  getRecordFile(channelId: string, fileId: string): Promise<any>;
  listRecordFiles(params: any): Promise<any>;
  listMaterialRecordFiles(params: any): Promise<any>;
  clipRecordFile(channelId: string, options: any): Promise<any>;
  mergeRecordFiles(params: any): Promise<any>;
  recordMergeMp4(channelId: string, options: any): Promise<any>;
  recordMergeMp4Start(channelId: string, options: any): Promise<boolean>;
  deleteRecordFile(params: any): Promise<void>;
  convertRecordFileToVod(params: any): Promise<any>;
  recordAddBreakpoint(channelId: string, options: any): Promise<boolean>;
  createRecordFileOutline(params: any): Promise<any>;
  getRecordFileOutline(channelId: string, fileId: string): Promise<any>;
  batchPublishRecordFileSubtitles(subtitles: Array<{ id: string | number; status: string }>): Promise<void>;
}

// Mapping constants for display
const PLAYBACK_ENABLED_MAP: Record<string, string> = {
  'Y': '开启',
  'N': '关闭',
};

const PLAYBACK_TYPE_MAP: Record<string, string> = {
  'single': '单个回放',
  'list': '列表回放',
};

const PLAYBACK_ORIGIN_MAP: Record<string, string> = {
  'record': '录制文件',
  'playback': '回放列表',
  'vod': '点播列表',
  'material': '素材库',
};

const PROGRESS_BAR_TYPE_MAP: Record<string, string> = {
  'drag': '拖动',
  'prohibitDrag': '禁止拖动',
  'dragHistoryOnly': '只能拖动已观看内容',
};

const Y_N_MAP: Record<string, string> = {
  'Y': '是',
  'N': '否',
};

/**
 * Handler for record settings-related CLI commands
 */
export class RecordHandler extends BaseHandler {
  private readonly recordService: IRecordService;

  /**
   * Creates a new RecordHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   * @param recordService Optional injected record service (for testing)
   */
  constructor(
    authConfig: AuthConfig,
    serviceConfig: RecordServiceConfig,
    recordService?: IRecordService
  ) {
    super();
    this.recordService = recordService ?? new RecordServiceSdk(authConfig, serviceConfig);
  }

  /**
   * Get playback setting for a channel
   * @param options Playback setting get options from CLI
   * @returns Promise that resolves when playback settings are displayed
   *
   * @throws {Error} When options are invalid
   * @throws {PolyVError} When query fails
   *
   * @example
   * ```typescript
   * await recordHandler.getPlaybackSetting({
   *   channelId: '2588188',
   *   output: 'table'
   * });
   * ```
   */
  async getPlaybackSetting(options: RecordSettingGetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate required channelId
      if (!options.channelId || options.channelId.trim() === '') {
        throw new Error('channelId is required');
      }

      // Call SDK service to get playback setting
      const result = await this.recordService.getPlaybackSetting(options.channelId);

      // Display results
      this.displayPlaybackSetting(result, options.channelId, options.output);
    }, 'record.setting.get');
  }

  /**
   * Set playback setting for a channel
   * @param options Playback setting set options from CLI
   * @returns Promise that resolves when playback settings are updated
   *
   * @throws {Error} When options are invalid
   * @throws {PolyVError} When update fails
   *
   * @example
   * ```typescript
   * await recordHandler.setPlaybackSetting({
   *   channelId: '2588188',
   *   playbackEnabled: 'Y',
   *   type: 'single'
   * });
   * ```
   */
  async setPlaybackSetting(options: RecordSettingSetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate required channelId
      if (!options.channelId || options.channelId.trim() === '') {
        throw new Error('channelId is required');
      }

      // Call SDK service to set playback setting
      await this.recordService.setPlaybackSetting(options.channelId, options);

      // Display success result
      this.displaySetPlaybackSettingResult(options);
    }, 'record.setting.set');
  }

  /**
   * Convert recording to VOD
   * @param options Convert options from CLI
   * @returns Promise that resolves when conversion is complete
   *
   * @throws {Error} When options are invalid
   * @throws {PolyVError} When conversion fails
   *
   * @example
   * ```typescript
   * await recordHandler.recordConvert({
   *   channelId: '2588188',
   *   sessionId: 'fvlyin8qz3',
   *   fileName: '测试转存'
   * });
   * ```
   */
  async recordConvert(options: RecordConvertOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate required channelId
      if (!options.channelId || options.channelId.trim() === '') {
        throw new Error('channelId is required');
      }

      // Validate required fileName
      if (!options.fileName || options.fileName.trim() === '') {
        throw new Error('fileName is required');
      }

      await confirmWrite(options.force, `Convert record file for channel ${options.channelId}?`);

      let result: RecordConvertResult;

      if (options.async) {
        // Async mode
        result = await this.recordService.recordConvertAsync(options.channelId, options);
      } else {
        // Sync mode
        result = await this.recordService.recordConvert(options.channelId, options);
      }

      // Display result
      this.displayConvertResult(options, result);
    }, 'record.convert');
  }

  /**
   * Set default playback video for a channel
   * @param options Set default options from CLI
   * @returns Promise that resolves when default is set
   *
   * @throws {Error} When options are invalid
   * @throws {PolyVError} When operation fails
   *
   * @example
   * ```typescript
   * await recordHandler.setRecordDefault({
   *   channelId: '2588188',
   *   videoId: '73801f70c8'
   * });
   * ```
   */
  async setRecordDefault(options: RecordSetDefaultOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate required channelId
      if (!options.channelId || options.channelId.trim() === '') {
        throw new Error('channelId is required');
      }

      // Validate required videoId
      if (!options.videoId || options.videoId.trim() === '') {
        throw new Error('videoId is required');
      }

      // Call SDK service to set default playback video
      await this.recordService.setRecordDefault(
        options.channelId,
        options.videoId,
        options.listType
      );

      // Display success result
      this.displaySetDefaultResult(options);
    }, 'record.set-default');
  }

  async getRecordFile(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.recordService.getRecordFile(options.channelId, options.fileId);
      this.displayResult(result, options.output);
    }, 'record.temp-list');
  }

  async listRecordFiles(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.recordService.listRecordFiles(this.compactOptions(options));
      this.displayResult(result, options.output);
    }, 'record.file.list');
  }

  async listMaterialRecordFiles(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.recordService.listMaterialRecordFiles(this.compactOptions(options));
      this.displayResult(result, options.output);
    }, 'record.material-list');
  }

  async clipRecordFile(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await confirmWrite(options.force, `Clip record file ${options.fileId} for channel ${options.channelId}?`);
      const result = await this.recordService.clipRecordFile(options.channelId, this.compactOptions({
        fileId: options.fileId,
        startTime: options.startTime,
        endTime: options.endTime,
        fileName: options.fileName,
        callbackUrl: options.callbackUrl,
      }));
      this.displayResult(result, options.output);
    }, 'record.clip');
  }

  async mergeRecordFiles(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await confirmWrite(options.force, `Merge record files for channel ${options.channelId}?`);
      const result = await this.recordService.mergeRecordFiles(this.compactOptions({
        channelId: options.channelId,
        urls: options.urls,
        fileIds: options.fileIds,
        fileName: options.fileName,
      }));
      this.displayResult(result, options.output);
    }, 'record.file.merge');
  }

  async recordMergeMp4(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const fileIds = this.normalizeStringList(options.fileIds);
      await confirmWrite(options.force, `Merge ${fileIds.length} record file(s) to MP4 for channel ${options.channelId}?`);
      const result = await this.recordService.recordMergeMp4(options.channelId, this.compactOptions({
        fileIds,
        fileName: options.fileName,
        callbackUrl: options.callbackUrl,
      }));
      this.displayResult(result, options.output);
    }, 'record.merge-mp4');
  }

  async recordMergeMp4Start(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const fileIds = this.normalizeStringList(options.fileIds);
      await confirmWrite(options.force, `Start MP4 merge for ${fileIds.length} record file(s) in channel ${options.channelId}?`);
      const result = await this.recordService.recordMergeMp4Start(options.channelId, this.compactOptions({
        fileIds,
        fileName: options.fileName,
        callbackUrl: options.callbackUrl,
      }));
      this.displayResult({ channelId: options.channelId, fileIds, submitted: result }, options.output);
    }, 'record.merge-mp4-start');
  }

  async deleteRecordFile(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await confirmWrite(options.force, `Delete record file(s) from channel ${options.channelId}?`);
      await this.recordService.deleteRecordFile(this.compactOptions({
        channelId: options.channelId,
        sessionId: options.sessionId,
        startTime: options.startTime,
      }));
      this.displayResult({ channelId: options.channelId, sessionId: options.sessionId, startTime: options.startTime, deleted: true }, options.output);
    }, 'record.file.delete');
  }

  async convertRecordFileToVod(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await confirmWrite(options.force, `Convert historical record file for channel ${options.channelId}?`);
      const result = await this.recordService.convertRecordFileToVod(this.compactOptions({
        channelId: options.channelId,
        userId: options.userId,
        fileName: options.fileName,
        fileUrl: options.fileUrl,
        sessionId: options.sessionId,
        cataid: options.cataid,
        cataname: options.cataname,
        toPlayList: options.toPlayList,
        setAsDefault: options.setAsDefault,
      }));
      this.displayResult(result, options.output);
    }, 'record.file.convert');
  }

  async recordAddBreakpoint(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await confirmWrite(options.force, `Add breakpoint to record file ${options.fileId}?`);
      const result = await this.recordService.recordAddBreakpoint(options.channelId, {
        fileId: options.fileId,
        time: options.time,
      });
      this.displayResult({ channelId: options.channelId, fileId: options.fileId, time: options.time, success: result }, options.output);
    }, 'record.breakpoint.add');
  }

  async createRecordFileOutline(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await confirmWrite(options.force, `Create outline for record file ${options.fileId}?`);
      const result = await this.recordService.createRecordFileOutline(this.compactOptions({
        fileId: options.fileId,
        aiKnowledgeQuizEnabled: options.aiKnowledgeQuizEnabled,
        aiSummaryAuditEnabled: options.aiSummaryAuditEnabled,
        syncToPlaybackDotEnabled: options.syncToPlaybackDotEnabled,
      }));
      this.displayResult(result, options.output);
    }, 'record.outline.create');
  }

  async getRecordFileOutline(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.recordService.getRecordFileOutline(options.channelId, options.fileId);
      this.displayResult(result, options.output);
    }, 'record.outline.get');
  }

  async batchPublishRecordFileSubtitles(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await confirmWrite(options.force, `Publish ${options.subtitles.length} record file subtitle(s)?`);
      await this.recordService.batchPublishRecordFileSubtitles(options.subtitles);
      this.displayResult({ published: true, subtitles: options.subtitles }, options.output);
    }, 'record.subtitle.publish');
  }

  /**
   * Displays playback setting in the specified format
   * @param setting Playback setting item
   * @param channelId Channel ID for context
   * @param format Output format (table or json)
   */
  private displayPlaybackSetting(
    setting: RecordSettingDisplayItem,
    channelId: string,
    format: OutputFormat = 'table'
  ): void {
    // Display context info
    this.displayInfo(`回放设置 - 频道: ${channelId}`);

    // Display in the requested format
    if (format === 'json') {
      this.displayData(setting, 'json');
    } else {
      this.displayPlaybackSettingTable(setting);
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

  private compactOptions(options: any): any {
    return Object.fromEntries(
      Object.entries(options).filter(([, value]) => value !== undefined && value !== '')
    );
  }

  private displayResult(result: any, format: OutputFormat = 'table'): void {
    this.displayData(result ?? { success: true }, format);
  }

  /**
   * Displays playback setting as a formatted table
   * @param setting Playback setting item
   */
  private displayPlaybackSettingTable(setting: RecordSettingDisplayItem): void {
    const tableData: Record<string, string>[] = [];

    // Add rows for display
    tableData.push({ '属性': '回放开关', '值': PLAYBACK_ENABLED_MAP[setting.playbackEnabled ?? ''] ?? setting.playbackEnabled ?? '-' });
    tableData.push({ '属性': '回放类型', '值': PLAYBACK_TYPE_MAP[setting.type ?? ''] ?? setting.type ?? '-' });
    tableData.push({ '属性': '回放来源', '值': PLAYBACK_ORIGIN_MAP[setting.origin ?? ''] ?? setting.origin ?? '-' });
    tableData.push({ '属性': '视频ID', '值': setting.videoId ?? '-' });
    tableData.push({ '属性': '视频名称', '值': setting.videoName ?? '-' });
    tableData.push({ '属性': '倍数播放', '值': PLAYBACK_ENABLED_MAP[setting.playbackMultiplierEnabled ?? ''] ?? setting.playbackMultiplierEnabled ?? '-' });
    tableData.push({ '属性': '进度条', '值': PLAYBACK_ENABLED_MAP[setting.playbackProgressBarEnabled ?? ''] ?? setting.playbackProgressBarEnabled ?? '-' });
    tableData.push({ '属性': '进度条操作', '值': PROGRESS_BAR_TYPE_MAP[setting.playbackProgressBarOperationType ?? ''] ?? setting.playbackProgressBarOperationType ?? '-' });
    tableData.push({ '属性': '显示播放按钮', '值': PLAYBACK_ENABLED_MAP[setting.showPlayButtonEnabled ?? ''] ?? setting.showPlayButtonEnabled ?? '-' });
    tableData.push({ '属性': '聊天互动重现', '值': PLAYBACK_ENABLED_MAP[setting.chatPlaybackEnabled ?? ''] ?? setting.chatPlaybackEnabled ?? '-' });
    tableData.push({ '属性': '商品库重现', '值': PLAYBACK_ENABLED_MAP[setting.productPlaybackEnabled ?? ''] ?? setting.productPlaybackEnabled ?? '-' });

    this.displayAsTable(tableData);
  }

  /**
   * Displays set playback setting result
   * @param options Set options from CLI
   */
  private displaySetPlaybackSettingResult(options: RecordSettingSetOptions): void {
    const format = options['output'] || 'table';

    // Build result data
    const resultData: Record<string, any> = {
      channelId: options['channelId'],
      status: 'success',
    };
    if (options['playbackEnabled'] !== undefined) resultData.playbackEnabled = options['playbackEnabled'];
    if (options['type'] !== undefined) resultData.type = options['type'];
    if (options['origin'] !== undefined) resultData.origin = options['origin'];
    if (options['videoId'] !== undefined) resultData.videoId = options['videoId'];

    // Display context info
    this.displayInfo(`设置成功 - 频道: ${options['channelId']}`);

    // Display in the requested format
    if (format === 'json') {
      this.displayData(resultData, 'json');
    } else {
      const tableData: Record<string, string>[] = [];
      tableData.push({ '属性': '频道', '值': options['channelId'] });
      tableData.push({ '属性': '状态', '值': '已更新' });
      if (options['playbackEnabled'] !== undefined) {
        tableData.push({ '属性': '回放开关', '值': PLAYBACK_ENABLED_MAP[options['playbackEnabled']] ?? options['playbackEnabled'] });
      }
      this.displayAsTable(tableData);
    }
  }

  /**
   * Displays convert result
   * @param options Convert options from CLI
   * @param result Convert result from service
   */
  private displayConvertResult(
    options: RecordConvertOptions,
    result: RecordConvertResult
  ): void {
    const format = options.output || 'table';

    if (result.async) {
      // Async mode - task submitted
      this.displayInfo(`转存任务已提交 - 频道: ${options.channelId}`);

      const resultData: Record<string, any> = {
        channelId: options.channelId,
        sessionId: options.sessionId,
        fileName: options.fileName,
        status: 'processing',
      };

      if (format === 'json') {
        this.displayData(resultData, 'json');
      } else {
        const tableData: Record<string, string>[] = [];
        tableData.push({ '属性': '源场次ID', '值': options.sessionId ?? '-' });
        tableData.push({ '属性': '文件名', '值': options.fileName });
        tableData.push({ '属性': '状态', '值': '处理中' });
        tableData.push({ '属性': '说明', '值': '异步转存不立即返回视频ID，请在点播后台查看' });
        this.displayAsTable(tableData);
      }
    } else {
      // Sync mode - conversion complete
      this.displayInfo(`转存成功 - 频道: ${options.channelId}`);

      const resultData: Record<string, any> = {
        channelId: options.channelId,
        sessionId: options.sessionId,
        fileName: options.fileName,
        toPlayList: options.toPlayList,
        setAsDefault: options.setAsDefault,
        vid: result.vid,
      };

      if (format === 'json') {
        this.displayData(resultData, 'json');
      } else {
        const tableData: Record<string, string>[] = [];
        tableData.push({ '属性': '源场次ID', '值': options.sessionId ?? '-' });
        tableData.push({ '属性': '文件名', '值': options.fileName });
        tableData.push({ '属性': '存入回放列表', '值': Y_N_MAP[options.toPlayList ?? ''] ?? options.toPlayList ?? '-' });
        tableData.push({ '属性': '设为默认回放', '值': Y_N_MAP[options.setAsDefault ?? ''] ?? options.setAsDefault ?? '-' });
        tableData.push({ '属性': '点播视频ID', '值': result.vid ?? '-' });
        this.displayAsTable(tableData);
      }
    }
  }

  /**
   * Displays set default result
   * @param options Set default options from CLI
   */
  private displaySetDefaultResult(options: RecordSetDefaultOptions): void {
    const format = options.output || 'table';

    // Build result data
    const resultData: Record<string, any> = {
      channelId: options.channelId,
      videoId: options.videoId,
      listType: options.listType,
      status: 'success',
    };

    // Display context info
    this.displayInfo(`设置成功 - 频道: ${options.channelId}`);

    // Display in the requested format
    if (format === 'json') {
      this.displayData(resultData, 'json');
    } else {
      const tableData: Record<string, string>[] = [];
      tableData.push({ '属性': '视频ID', '值': options.videoId });
      tableData.push({ '属性': '列表类型', '值': options.listType === 'playback' ? '回放列表' : options.listType === 'vod' ? '点播列表' : '-' });
      tableData.push({ '属性': '状态', '值': '已设为默认回放' });
      this.displayAsTable(tableData);
    }
  }
}
