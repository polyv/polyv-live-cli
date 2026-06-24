/**
 * @fileoverview Statistics service using PolyV Live API SDK
 * @author Development Team
 * @since 10.1.0
 */

import {
  StatisticsViewOptions,
  StatisticsServiceConfig,
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
import { PolyVValidationError } from '../utils/errors';
import { createSdkClient } from '../sdk';
import {
  MAX_DATE_RANGE_DAYS,
  isValidDateFormat,
  validateDateRange,
  isValidTimestamp,
  validateTimestampRange,
  validate90DayTimestampRange,
} from '../utils/date-validation';

/**
 * Statistics service for managing PolyV live streaming statistics using SDK
 */
export class StatisticsServiceSdk {
  private readonly config: StatisticsServiceConfig;
  private readonly authConfig: AuthConfig;

  /**
   * Creates a new StatisticsServiceSdk instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: StatisticsServiceConfig) {
    this.authConfig = authConfig;
    this.config = serviceConfig;
  }

  async getSessionStatsSummaryList(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Statistics.getSessionStatsSummaryList(params);
  }

  async getInviterPosterList(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.other.getInviterPosterList(params);
  }

  async listChannelLotteryRecords(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.listChannelLotteryRecords(params);
  }

  async getLiveData(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.getLiveData(params);
  }

  async listSessionStats(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.listSessionStats(params);
  }

  async listWeixinBookings(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.listWeixinBookings(params);
  }

  async listInviteStats(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.listInviteStats(params);
  }

  async getChannelPlaySummary(params: any): Promise<any> {
    const userId = params.userId || this.authConfig.userId;
    if (!userId) {
      throw new PolyVValidationError('userId is required', 'userId', userId, 'required');
    }
    const { userId: _userId, ...options } = params;
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getChannelPlaySummary(String(userId), this.compact(options) as any);
  }

  async getRealtimeViewers(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getRealtimeViewers(params);
  }

  async getRedpackStats(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getRedpackStats(params);
  }

  async getChannelStatistic(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getChannelStatistic(params);
  }

  async getSessionStats(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getSessionStats(params);
  }

  async getMicDetailList(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getMicDetailList(params);
  }

  async getLinkMicDetailList(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getLinkMicDetailList(params);
  }

  async getSummary(params: any): Promise<any> {
    const { channelId, ...options } = params;
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return (await client.channel.getSummary(channelId, options)) ?? [];
  }

  async getProductClickStats(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getProductClickStats(params);
  }

  async getProductListStats(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getProductListStats(params);
  }

  async getRealtimeViewersV1(params: any): Promise<any> {
    const userId = params.userId || this.authConfig.userId;
    if (!userId) {
      throw new PolyVValidationError('userId is required', 'userId', userId, 'required');
    }
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getRealtimeViewersV1(params.channelId, String(userId));
  }

  async getViewlogV1(params: any): Promise<any> {
    const userId = params.userId || this.authConfig.userId;
    if (!userId) {
      throw new PolyVValidationError('userId is required', 'userId', userId, 'required');
    }
    const { channelId, userId: _userId, ...options } = params;
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getViewlogV1(channelId, { ...this.compact(options), userId: String(userId) } as any);
  }

  async getViewlog2(params: any): Promise<any> {
    const { channelId, ...options } = params;
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getViewlog2(channelId, options);
  }

  /**
   * Get daily view statistics for a channel
   * @param options Statistics view options from CLI
   * @returns Promise resolving to array of daily statistics
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getDailyViewStatistics(options: StatisticsViewOptions): Promise<DailyViewStatisticsItem[]> {
    // Validate parameters (including date range validation)
    this.validateViewOptions(options);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const result = await client.statistics.getDailyViewStatistics({
      channelId: options.channelId,
      startDay: options.startDay,
      endDay: options.endDay,
    });

    // Return contents
    return result.contents || [];
  }

  /**
   * Validates statistics view options
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateViewOptions(options: StatisticsViewOptions): void {
    const errors: string[] = [];

    // Validate channelId parameter
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim().length === 0) {
      errors.push('channelId is required and must be a non-empty string');
    }

    // Validate startDay format (yyyy-MM-dd)
    if (!options.startDay || !isValidDateFormat(options.startDay)) {
      errors.push('startDay is required and must be in yyyy-MM-dd format');
    }

    // Validate endDay format (yyyy-MM-dd)
    if (!options.endDay || !isValidDateFormat(options.endDay)) {
      errors.push('endDay is required and must be in yyyy-MM-dd format');
    }

    // If dates are valid format, validate range
    if (errors.length === 0) {
      const rangeValidation = validateDateRange(options.startDay, options.endDay, MAX_DATE_RANGE_DAYS);
      if (!rangeValidation.valid) {
        errors.push(rangeValidation.error || 'Invalid date range');
      }
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Statistics view options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  // ============================================
  // Story 10.2: Concurrency Data Methods
  // ============================================

  /**
   * Get historical concurrency data for a channel
   * @param options Concurrency options from CLI
   * @returns Promise resolving to array of concurrency data points
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getConcurrencyData(options: StatisticsConcurrencyOptions): Promise<ConcurrencyDataPointItem[]> {
    // Validate parameters (including date range validation)
    this.validateConcurrencyOptions(options);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const result = await client.statistics.getConcurrencyData({
      channelId: options.channelId,
      startDate: options.startDate,
      endDate: options.endDate,
    });

    // Return contents
    return result.contents || [];
  }

  /**
   * Validates concurrency options
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateConcurrencyOptions(options: StatisticsConcurrencyOptions): void {
    const errors: string[] = [];

    // Validate channelId parameter
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim().length === 0) {
      errors.push('channelId is required and must be a non-empty string');
    }

    // Validate startDate format (yyyy-MM-dd)
    if (!options.startDate || !isValidDateFormat(options.startDate)) {
      errors.push('startDate is required and must be in yyyy-MM-dd format');
    }

    // Validate endDate format (yyyy-MM-dd)
    if (!options.endDate || !isValidDateFormat(options.endDate)) {
      errors.push('endDate is required and must be in yyyy-MM-dd format');
    }

    // If dates are valid format, validate range
    if (errors.length === 0) {
      const rangeValidation = validateDateRange(options.startDate, options.endDate, MAX_DATE_RANGE_DAYS);
      if (!rangeValidation.valid) {
        errors.push(rangeValidation.error || 'Invalid date range');
      }
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Concurrency options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  // ============================================
  // Story 10.2: Max Concurrent Methods
  // ============================================

  /**
   * Get maximum historical concurrent viewers for a channel
   * @param options Max concurrent options from CLI
   * @returns Promise resolving to max concurrent viewers count
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getMaxConcurrent(options: StatisticsMaxConcurrentOptions): Promise<number> {
    // Validate parameters (including timestamp range validation)
    this.validateMaxConcurrentOptions(options);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const result = await client.statistics.getMaxConcurrent({
      channelId: options.channelId,
      startTime: options.startTime,
      endTime: options.endTime,
    });

    // Return contents
    return result.contents || 0;
  }

  /**
   * Validates max concurrent options
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateMaxConcurrentOptions(options: StatisticsMaxConcurrentOptions): void {
    const errors: string[] = [];

    // Validate channelId parameter
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim().length === 0) {
      errors.push('channelId is required and must be a non-empty string');
    }

    // Validate startTime format (timestamp)
    if (!isValidTimestamp(options.startTime)) {
      errors.push('startTime is required and must be a valid timestamp');
    }

    // Validate endTime format (timestamp)
    if (!isValidTimestamp(options.endTime)) {
      errors.push('endTime is required and must be a valid timestamp');
    }

    // If timestamps are valid, validate range
    if (errors.length === 0) {
      const rangeValidation = validateTimestampRange(options.startTime, options.endTime);
      if (!rangeValidation.valid) {
        errors.push(rangeValidation.error || 'Invalid time range');
      }
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Max concurrent options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  // ============================================
  // Story 10.3: Region Distribution Methods
  // ============================================

  /**
   * Get region distribution for a channel
   * @param options Region options from CLI
   * @returns Promise resolving to array of region distribution items
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getRegionDistribution(options: StatisticsAudienceRegionOptions): Promise<RegionDistributionDisplayItem[]> {
    // Validate parameters (including timestamp range validation)
    this.validateRegionOptions(options);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const params: {
      channelId: string;
      startTime: number;
      endTime: number;
      type?: 'country' | 'province' | 'city';
    } = {
      channelId: options.channelId,
      startTime: options.startTime,
      endTime: options.endTime,
    };
    if (options.type) {
      params.type = options.type;
    }
    const result = await client.statistics.getRegionDistribution(params);

    // Transform data for CLI display
    return (result.data || []).map((item) => ({
      region: item.city || item.province || item.country || '未知',
      plays: item.plays,
      viewers: item.viewers,
      ips: item.ips,
      playDuration: item.playDuration,
      percent: `${item.percent.toFixed(2)}%`,
    }));
  }

  /**
   * Validates region options
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateRegionOptions(options: StatisticsAudienceRegionOptions): void {
    const errors: string[] = [];

    // Validate channelId parameter
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim().length === 0) {
      errors.push('channelId is required and must be a non-empty string');
    }

    // Validate startTime format (timestamp)
    if (!isValidTimestamp(options.startTime)) {
      errors.push('startTime is required and must be a valid timestamp');
    }

    // Validate endTime format (timestamp)
    if (!isValidTimestamp(options.endTime)) {
      errors.push('endTime is required and must be a valid timestamp');
    }

    // Validate type parameter if specified
    if (options.type !== undefined) {
      const validTypes = ['country', 'province', 'city'];
      if (!validTypes.includes(options.type)) {
        errors.push('type must be one of: country, province, city');
      }
    }

    // If timestamps are valid, validate range
    if (errors.length === 0) {
      const rangeValidation = validate90DayTimestampRange(options.startTime, options.endTime);
      if (!rangeValidation.valid) {
        errors.push(rangeValidation.error || 'Invalid time range');
      }
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Region options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  // ============================================
  // Story 10.3: Device Distribution Methods
  // ============================================

  /**
   * Get device distribution for a channel
   * @param options Device options from CLI
   * @returns Promise resolving to array of device distribution items
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getDeviceDistribution(options: StatisticsAudienceDeviceOptions): Promise<DeviceDistributionDisplayItem[]> {
    // Validate parameters (including timestamp range validation)
    this.validateDeviceOptions(options);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const result = await client.statistics.getDeviceDistribution({
      channelId: options.channelId,
      startTime: options.startTime,
      endTime: options.endTime,
    });

    // Transform data for CLI display
    return (result.data || []).map((item) => ({
      name: item.name,
      platform: item.platform,
      plays: item.plays,
      viewers: item.viewers,
      ips: item.ips,
      playDuration: item.playDuration,
      percent: `${item.percent.toFixed(2)}%`,
    }));
  }

  /**
   * Validates device options
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateDeviceOptions(options: StatisticsAudienceDeviceOptions): void {
    const errors: string[] = [];

    // Validate channelId parameter
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim().length === 0) {
      errors.push('channelId is required and must be a non-empty string');
    }

    // Validate startTime format (timestamp)
    if (!isValidTimestamp(options.startTime)) {
      errors.push('startTime is required and must be a valid timestamp');
    }

    // Validate endTime format (timestamp)
    if (!isValidTimestamp(options.endTime)) {
      errors.push('endTime is required and must be a valid timestamp');
    }

    // If timestamps are valid, validate range
    if (errors.length === 0) {
      const rangeValidation = validate90DayTimestampRange(options.startTime, options.endTime);
      if (!rangeValidation.valid) {
        errors.push(rangeValidation.error || 'Invalid time range');
      }
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Device options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  // ============================================
  // Story 10.4: Viewlog Export Methods
  // ============================================

  /**
   * Get viewlog data for export
   * @param options Export viewlog options from CLI
   * @returns Promise resolving to array of viewlog display items
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getViewlog(options: StatisticsExportViewlogOptions): Promise<ViewlogDisplayItem[]> {
    // Validate parameters
    this.validateViewlogOptions(options);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Build SDK params
    const params: {
      channelId: string;
      startDate: string;
      endDate: string;
      watchType?: 'live' | 'vod';
      page?: number;
      pageSize?: number;
    } = {
      channelId: options.channelId,
      startDate: options.startTime,
      endDate: options.endTime,
    };

    // Add optional parameters
    if (options.watchType) {
      params.watchType = options.watchType;
    }
    if (options.page !== undefined) {
      params.page = options.page;
    }
    if (options.pageSize !== undefined) {
      params.pageSize = options.pageSize;
    }

    // Call SDK
    const result = await client.statistics.getViewlog(params);

    // Transform data for CLI display
    return (result.contents || []).map((item) => ({
      playId: item.playId,
      viewerId: item.param1,
      viewerName: item.param2,
      watchType: item.param3,
      playDuration: item.playDuration,
      stayDuration: item.stayDuration,
      sessionId: item.sessionId,
      ipAddress: item.ipAddress,
      region: `${item.province}/${item.city}`,
      operatingSystem: item.operatingSystem,
      browser: item.browser,
      isMobile: item.isMobile,
      date: item.currentDay,
      createdTime: item.createdTime,
    }));
  }

  /**
   * Validates viewlog export options
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateViewlogOptions(options: StatisticsExportViewlogOptions): void {
    const errors: string[] = [];

    // Validate channelId parameter
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim().length === 0) {
      errors.push('channelId is required and must be a non-empty string');
    }

    // Validate startTime format (yyyy-MM-dd HH:mm:ss)
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (!options.startTime || !dateTimeRegex.test(options.startTime)) {
      errors.push('startTime is required and must be in yyyy-MM-dd HH:mm:ss format');
    }

    // Validate endTime format (yyyy-MM-dd HH:mm:ss)
    if (!options.endTime || !dateTimeRegex.test(options.endTime)) {
      errors.push('endTime is required and must be in yyyy-MM-dd HH:mm:ss format');
    }

    // Validate same month constraint
    if (errors.length === 0) {
      const startMonth = options.startTime.substring(0, 7);
      const endMonth = options.endTime.substring(0, 7);
      if (startMonth !== endMonth) {
        errors.push('startTime and endTime must be in the same month');
      }
    }

    // Validate watchType if specified
    if (options.watchType !== undefined) {
      const validTypes = ['live', 'vod'];
      if (!validTypes.includes(options.watchType)) {
        errors.push('watchType must be either "live" or "vod"');
      }
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Viewlog options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  // ============================================
  // Story 10.4: Session Export Methods
  // ============================================

  /**
   * Export session statistics
   * @param options Export session options from CLI
   * @returns Promise resolving to session export display item
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async exportSessionStats(options: StatisticsExportSessionOptions): Promise<SessionExportDisplayItem> {
    // Validate parameters
    this.validateSessionExportOptions(options);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const result = await client.statistics.exportSessionStats({
      channelId: options.channelId,
      sessionId: options.sessionId,
    }) as unknown;
    const downloadUrl =
      typeof result === 'string'
        ? result
        : (result as { downloadUrl?: unknown } | undefined)?.downloadUrl;
    if (typeof downloadUrl !== 'string' || downloadUrl.trim() === '') {
      throw new Error('场次报表导出失败：接口未返回下载链接，报表可能尚未生成，请稍后重试');
    }

    // Transform to display item
    return {
      channelId: options.channelId,
      sessionId: options.sessionId,
      downloadUrl,
      expiresIn: '60天',
    };
  }

  /**
   * Validates session export options
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateSessionExportOptions(options: StatisticsExportSessionOptions): void {
    const errors: string[] = [];

    // Validate channelId parameter
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim().length === 0) {
      errors.push('channelId is required and must be a non-empty string');
    }

    // Validate sessionId parameter
    if (!options.sessionId || typeof options.sessionId !== 'string' || options.sessionId.trim().length === 0) {
      errors.push('sessionId is required and must be a non-empty string');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Session export options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private compact<T extends Record<string, unknown>>(params: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    ) as Partial<T>;
  }
}
