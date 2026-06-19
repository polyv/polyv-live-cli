/**
 * @fileoverview Statistics command handler for CLI operations
 * @author Development Team
 * @since 10.1.0
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { StatisticsServiceSdk } from '../services/statistics.service.sdk';
import {
  StatisticsServiceConfig,
  StatisticsViewOptions,
  DailyViewStatisticsItem,
  StatisticsConcurrencyOptions,
  StatisticsMaxConcurrentOptions,
  ConcurrencyDataPointItem,
  StatisticsAudienceRegionOptions,
  StatisticsAudienceDeviceOptions,
  RegionDistributionDisplayItem,
  DeviceDistributionDisplayItem,
} from '../types/statistics';
import {
  StatisticsExportViewlogOptions,
  StatisticsExportSessionOptions,
  ViewlogDisplayItem,
  SessionExportDisplayItem,
} from '../types/statistics-export';
import { AuthConfig } from '../types/auth';
import * as fs from 'fs';
import { apiParams } from '../utils/api-command';

/**
 * Interface for statistics service (enables dependency injection)
 */
export interface IStatisticsService {
  getSessionStatsSummaryList(params: any): Promise<any>;
  getInviterPosterList(params: any): Promise<any>;
  getDailyViewStatistics(options: StatisticsViewOptions): Promise<DailyViewStatisticsItem[]>;
  getConcurrencyData(options: StatisticsConcurrencyOptions): Promise<ConcurrencyDataPointItem[]>;
  getMaxConcurrent(options: StatisticsMaxConcurrentOptions): Promise<number>;
  getRegionDistribution(options: StatisticsAudienceRegionOptions): Promise<RegionDistributionDisplayItem[]>;
  getDeviceDistribution(options: StatisticsAudienceDeviceOptions): Promise<DeviceDistributionDisplayItem[]>;
  getViewlog(options: StatisticsExportViewlogOptions): Promise<ViewlogDisplayItem[]>;
  exportSessionStats(options: StatisticsExportSessionOptions): Promise<SessionExportDisplayItem>;
}

/**
 * Handler for statistics-related CLI commands
 */
export class StatisticsHandler extends BaseHandler {
  private readonly statisticsService: IStatisticsService;

  /**
   * Creates a new StatisticsHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   * @param statisticsService Optional injected statistics service (for testing)
   */
  constructor(
    authConfig: AuthConfig,
    serviceConfig: StatisticsServiceConfig,
    statisticsService?: IStatisticsService
  ) {
    super();
    this.statisticsService = statisticsService ?? new StatisticsServiceSdk(authConfig, serviceConfig);
  }

  /**
   * View daily statistics for a channel
   * @param options Statistics view options from CLI
   * @returns Promise that resolves when statistics are displayed
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When statistics query fails
   *
   * @example
   * ```typescript
   * await statisticsHandler.viewStatistics({
   *   channelId: '3151318',
   *   startDay: '2024-01-01',
   *   endDay: '2024-01-31',
   *   output: 'table'
   * });
   * ```
   */
  async viewStatistics(options: StatisticsViewOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Call SDK service to get statistics
      const contents = await this.statisticsService.getDailyViewStatistics(options);

      // Display results
      this.displayStatistics(contents, options.channelId, options.output);
    }, 'statistics.view');
  }

  async listSessionSummary(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.displayData(
        await this.statisticsService.getSessionStatsSummaryList(apiParams(options)),
        options.output || 'table'
      );
    }, 'statistics.session-summary.list');
  }

  async listInviterPoster(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.displayData(
        await this.statisticsService.getInviterPosterList(apiParams(options)),
        options.output || 'table'
      );
    }, 'statistics.inviter-poster.list');
  }

  /**
   * Displays statistics in the specified format
   * @param contents Array of daily statistics
   * @param channelId Channel ID for context
   * @param format Output format (table or json)
   */
  private displayStatistics(
    contents: DailyViewStatisticsItem[],
    channelId: string,
    format: OutputFormat = 'table'
  ): void {
    if (contents.length === 0) {
      this.displayInfo(`No statistics data found for channel ${channelId}`);
      return;
    }

    // Display context info
    this.displayInfo(`Statistics for channel: ${channelId}`);
    this.displayInfo(`Records: ${contents.length}`);

    // Display statistics in the requested format
    if (format === 'json') {
      this.displayData(contents, 'json');
    } else {
      this.displayStatisticsTable(contents);
    }
  }

  /**
   * Displays statistics as a formatted table
   * @param contents Array of daily statistics
   */
  private displayStatisticsTable(contents: DailyViewStatisticsItem[]): void {
    // Transform statistics for table display
    const tableData = contents.map((stat) => ({
      '日期': stat.currentDay,
      'PC PV': stat.pcVideoView,
      'PC UV': stat.pcUniqueViewer,
      '移动PV': stat.mobileVideoView,
      '移动UV': stat.mobileUniqueViewer,
      'PC播放(分钟)': stat.pcPlayDuration,
      '移动播放(分钟)': stat.mobilePlayDuration,
    }));

    this.displayAsTable(tableData);
  }

  // ============================================
  // Story 10.2: Concurrency Data Methods
  // ============================================

  /**
   * View historical concurrency data for a channel
   * @param options Concurrency options from CLI
   * @returns Promise that resolves when concurrency data is displayed
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When concurrency query fails
   *
   * @example
   * ```typescript
   * await statisticsHandler.viewConcurrency({
   *   channelId: '3151318',
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   *   output: 'table'
   * });
   * ```
   */
  async viewConcurrency(options: StatisticsConcurrencyOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Call SDK service to get concurrency data
      const contents = await this.statisticsService.getConcurrencyData(options);

      // Display results
      this.displayConcurrency(contents, options.channelId, options.output);
    }, 'statistics.concurrency');
  }

  /**
   * Displays concurrency data in the specified format
   * @param contents Array of concurrency data points
   * @param channelId Channel ID for context
   * @param format Output format (table or json)
   */
  private displayConcurrency(
    contents: ConcurrencyDataPointItem[],
    channelId: string,
    format: OutputFormat = 'table'
  ): void {
    if (contents.length === 0) {
      this.displayInfo(`No concurrency data found for channel ${channelId}`);
      return;
    }

    // Display context info
    this.displayInfo(`Concurrency data for channel: ${channelId}`);
    this.displayInfo(`Records: ${contents.length}`);

    // Display concurrency data in the requested format
    if (format === 'json') {
      this.displayData(contents, 'json');
    } else {
      this.displayConcurrencyTable(contents);
    }
  }

  /**
   * Displays concurrency data as a formatted table
   * @param contents Array of concurrency data points
   */
  private displayConcurrencyTable(contents: ConcurrencyDataPointItem[]): void {
    // Transform concurrency data for table display
    const tableData = contents.map((item) => ({
      '日期': item.day,
      '时间': item.minute,
      '并发人数': item.viewers,
    }));

    this.displayAsTable(tableData);
  }

  // ============================================
  // Story 10.2: Max Concurrent Methods
  // ============================================

  /**
   * View maximum historical concurrent viewers for a channel
   * @param options Max concurrent options from CLI
   * @returns Promise that resolves when max concurrent data is displayed
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When max concurrent query fails
   *
   * @example
   * ```typescript
   * await statisticsHandler.viewMaxConcurrent({
   *   channelId: '3151318',
   *   startTime: 1704067200000,
   *   endTime: 1735689600000,
   *   output: 'table'
   * });
   * ```
   */
  async viewMaxConcurrent(options: StatisticsMaxConcurrentOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Call SDK service to get max concurrent
      const maxConcurrent = await this.statisticsService.getMaxConcurrent(options);

      // Display results
      this.displayMaxConcurrent(maxConcurrent, options, options.output);
    }, 'statistics.max-concurrent');
  }

  /**
   * Displays max concurrent data in the specified format
   * @param maxConcurrent Maximum concurrent viewers count
   * @param options Max concurrent options for context
   * @param format Output format (table or json)
   */
  private displayMaxConcurrent(
    maxConcurrent: number,
    options: StatisticsMaxConcurrentOptions,
    format: OutputFormat = 'table'
  ): void {
    if (format === 'json') {
      const result = {
        channelId: options.channelId,
        startTime: options.startTime,
        endTime: options.endTime,
        maxConcurrent,
      };
      this.displayData(result, 'json');
    } else {
      // Format timestamps to readable dates
      const startDate = new Date(options.startTime).toLocaleString('zh-CN');
      const endDate = new Date(options.endTime).toLocaleString('zh-CN');

      this.displayInfo(`历史最高并发人数: ${maxConcurrent}`);
      this.displayInfo(`时间范围: ${startDate} - ${endDate}`);
    }
  }

  // ============================================
  // Story 10.3: Audience Region Methods
  // ============================================

  /**
   * View region distribution for a channel
   * @param options Audience region options from CLI
   * @returns Promise that resolves when region distribution is displayed
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When region query fails
   *
   * @example
   * ```typescript
   * await statisticsHandler.viewRegionDistribution({
   *   channelId: '3151318',
   *   startTime: 1648742400000,
   *   endTime: 1651334399000,
   *   type: 'province',
   *   output: 'table'
   * });
   * ```
   */
  async viewRegionDistribution(options: StatisticsAudienceRegionOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Call SDK service to get region distribution
      const contents = await this.statisticsService.getRegionDistribution(options);

      // Display results
      this.displayRegion(contents, options.channelId, options.output);
    }, 'statistics.audience.region');
  }

  /**
   * Displays region distribution in the specified format
   * @param contents Array of region distribution items
   * @param channelId Channel ID for context
   * @param format Output format (table or json)
   */
  private displayRegion(
    contents: RegionDistributionDisplayItem[],
    channelId: string,
    format: OutputFormat = 'table'
  ): void {
    if (contents.length === 0) {
      this.displayInfo(`No region distribution data found for channel ${channelId}`);
      return;
    }

    // Display context info
    this.displayInfo(`Region distribution for channel: ${channelId}`);
    this.displayInfo(`Records: ${contents.length}`);

    // Display region data in the requested format
    if (format === 'json') {
      this.displayData(contents, 'json');
    } else {
      this.displayRegionTable(contents);
    }
  }

  /**
   * Displays region distribution as a formatted table
   * @param contents Array of region distribution items
   */
  private displayRegionTable(contents: RegionDistributionDisplayItem[]): void {
    // Transform region data for table display
    const tableData = contents.map((item) => ({
      '地区': item.region,
      '播放次数': item.plays,
      '观众数': item.viewers,
      'IP数': item.ips,
      '播放时长(分钟)': item.playDuration,
      '占比': item.percent,
    }));

    this.displayAsTable(tableData);
  }

  // ============================================
  // Story 10.3: Audience Device Methods
  // ============================================

  /**
   * View device distribution for a channel
   * @param options Audience device options from CLI
   * @returns Promise that resolves when device distribution is displayed
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When device query fails
   *
   * @example
   * ```typescript
   * await statisticsHandler.viewDeviceDistribution({
   *   channelId: '3151318',
   *   startTime: 1651386101000,
   *   endTime: 1652336501462,
   *   output: 'table'
   * });
   * ```
   */
  async viewDeviceDistribution(options: StatisticsAudienceDeviceOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Call SDK service to get device distribution
      const contents = await this.statisticsService.getDeviceDistribution(options);

      // Display results
      this.displayDevice(contents, options.channelId, options.output);
    }, 'statistics.audience.device');
  }

  /**
   * Displays device distribution in the specified format
   * @param contents Array of device distribution items
   * @param channelId Channel ID for context
   * @param format Output format (table or json)
   */
  private displayDevice(
    contents: DeviceDistributionDisplayItem[],
    channelId: string,
    format: OutputFormat = 'table'
  ): void {
    if (contents.length === 0) {
      this.displayInfo(`No device distribution data found for channel ${channelId}`);
      return;
    }

    // Display context info
    this.displayInfo(`Device distribution for channel: ${channelId}`);
    this.displayInfo(`Records: ${contents.length}`);

    // Display device data in the requested format
    if (format === 'json') {
      this.displayData(contents, 'json');
    } else {
      this.displayDeviceTable(contents);
    }
  }

  /**
   * Displays device distribution as a formatted table
   * @param contents Array of device distribution items
   */
  private displayDeviceTable(contents: DeviceDistributionDisplayItem[]): void {
    // Transform device data for table display
    const tableData = contents.map((item) => ({
      '浏览器': item.name,
      '平台': item.platform,
      '播放次数': item.plays,
      '观众数': item.viewers,
      'IP数': item.ips,
      '播放时长(分钟)': item.playDuration,
      '占比': item.percent,
    }));

    this.displayAsTable(tableData);
  }

  // ============================================
  // Story 10.4: Export Viewlog Methods
  // ============================================

  /**
   * Export viewlog data for a channel
   * @param options Export viewlog options from CLI
   * @returns Promise that resolves when viewlog data is displayed or exported
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When API call fails
   *
   * @example
   * ```typescript
   * await statisticsHandler.exportViewlog({
   *   channelId: '3151318',
   *   startTime: '2024-01-01 00:00:00',
   *   endTime: '2024-01-31 23:59:59',
   *   output: 'table'
   * });
   * ```
   */
  async exportViewlog(options: StatisticsExportViewlogOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Call SDK service to get viewlog data
      const contents = await this.statisticsService.getViewlog(options);

      // Check for empty results
      if (contents.length === 0) {
        this.displayInfo('No viewlog data found for the specified criteria');
        return;
      }

      // Display context info
      this.displayInfo(`观看日志导出成功`);
      this.displayInfo(`时间范围: ${options.startTime} - ${options.endTime}`);
      this.displayInfo(`总记录数: ${contents.length} 条`);

      // Display data in the requested format
      if (options.output === 'json') {
        this.displayData(contents, 'json');
      } else {
        // Display preview (first 10 records)
        this.displayInfo(`\n预览（前${Math.min(10, contents.length)}条）:`);
        this.displayViewlogTable(contents.slice(0, 10));
      }

      // Export to CSV file if outputFile is specified
      if (options.outputFile) {
        this.exportViewlogToCsv(contents, options.outputFile);
        this.displayInfo(`\n已导出到: ${options.outputFile}`);
      }
    }, 'statistics.export.viewlog');
  }

  /**
   * Display viewlog data as a formatted table
   * @param contents Array of viewlog items
   */
  private displayViewlogTable(contents: ViewlogDisplayItem[]): void {
    const tableData = contents.map((item) => ({
      '播放ID': item.playId,
      '观众ID': item.viewerId,
      '观众昵称': item.viewerName,
      '观看类型': item.watchType,
      '播放时长(秒)': item.playDuration,
      '停留时长(秒)': item.stayDuration,
      '场次ID': item.sessionId,
      'IP地址': item.ipAddress,
      '国家/省份': item.region,
      '操作系统': item.operatingSystem,
      '浏览器': item.browser,
      '是否移动端': item.isMobile,
      '日期': item.date,
    }));

    this.displayAsTable(tableData);
  }

  /**
   * Export viewlog data to CSV file
   * @param contents Array of viewlog items
   * @param filePath Output file path
   */
  private exportViewlogToCsv(contents: ViewlogDisplayItem[], filePath: string): void {
    // CSV headers in Chinese
    const headers = [
      '播放ID',
      '观众ID',
      '观众昵称',
      '观看类型',
      '播放时长(秒)',
      '停留时长(秒)',
      '场次ID',
      'IP地址',
      '国家',
      '省份',
      '城市',
      'ISP',
      '操作系统',
      '浏览器',
      '是否移动端',
      '日期',
      '创建时间',
    ];

    // Build CSV content
    const csvRows: string[] = [headers.join(',')];

    for (const item of contents) {
      const row = [
        this.escapeCsvField(item.playId),
        this.escapeCsvField(item.viewerId),
        this.escapeCsvField(item.viewerName),
        this.escapeCsvField(item.watchType),
        item.playDuration,
        item.stayDuration,
        this.escapeCsvField(item.sessionId),
        this.escapeCsvField(item.ipAddress),
        this.escapeCsvField(item.region.split('/')[0] || ''),
        this.escapeCsvField(item.region.split('/')[1] || ''),
        '', // City (not available in display item)
        '', // ISP (not available in display item)
        this.escapeCsvField(item.operatingSystem),
        this.escapeCsvField(item.browser),
        this.escapeCsvField(item.isMobile),
        this.escapeCsvField(item.date),
        item.createdTime,
      ];
      csvRows.push(row.join(','));
    }

    // Write to file
    fs.writeFileSync(filePath, '\ufeff' + csvRows.join('\n'), 'utf8');
  }

  /**
   * Escape a field for CSV format
   * @param field Field value
   * @returns Escaped field value
   */
  private escapeCsvField(field: string | number): string {
    if (field === null || field === undefined) {
      return '';
    }
    const str = String(field);
    // If field contains comma, newline, or double quote, wrap in quotes
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  // ============================================
  // Story 10.4: Export Session Stats Methods
  // ============================================

  /**
   * Export session statistics report
   * @param options Export session options from CLI
   * @returns Promise that resolves when session stats are displayed
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When API call fails
   *
   * @example
   * ```typescript
   * await statisticsHandler.exportSessionStats({
   *   channelId: '3151318',
   *   sessionId: 'fv3ma84e63',
   *   output: 'table'
   * });
   * ```
   */
  async exportSessionStats(options: StatisticsExportSessionOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Call SDK service to export session stats
      const result = await this.statisticsService.exportSessionStats(options);

      // Display context info
      this.displayInfo(`场次报表导出成功\n`);
      this.displayInfo(`频道号: ${result.channelId}`);
      this.displayInfo(`场次号: ${result.sessionId}\n`);
      this.displayInfo(`下载链接: ${result.downloadUrl}`);
      this.displayInfo(`链接有效期: ${result.expiresIn}`);

      // Display in the requested format
      if (options.output === 'json') {
        this.displayData(result, 'json');
      }
    }, 'statistics.export.session');
  }
}
