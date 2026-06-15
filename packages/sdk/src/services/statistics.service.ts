/**
 * Statistics Service
 *
 * Service for managing PolyV V3 Statistics operations.
 * Provides methods for querying daily view statistics.
 *
 * @module services/statistics
 */

import type { PolyVClient } from '../client.js';
import type {
  GetDailyViewStatisticsParams,
  GetDailyViewStatisticsResponse,
  GetConcurrencyDataParams,
  GetConcurrencyDataResponse,
  GetMaxConcurrentParams,
  GetMaxConcurrentResponse,
  GetRegionDistributionParams,
  GetRegionDistributionResponse,
  GetDeviceDistributionParams,
  GetDeviceDistributionResponse,
} from '../types/statistics.js';
import type {
  GetViewlogParams,
  GetViewlogResponse,
  ExportSessionStatsParams,
  ExportSessionStatsResponse,
} from '../types/statistics-export.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';
import {
  MAX_DATE_RANGE_DAYS,
  isValidDateFormat,
  validateDateRange,
  isValidTimestamp,
  validateTimestampRange,
  validateConcurrencyDateRange,
  validate90DayTimestampRange,
} from '../utils/date-validation.js';

/**
 * StatisticsService
 *
 * Provides methods to interact with PolyV V3 Statistics APIs.
 *
 * @example
 * ```typescript
 * const client = new PolyVClient({ appId: 'xxx', appSecret: 'yyy' });
 * const stats = await client.statistics.getDailyViewStatistics({
 *   channelId: '123456',
 *   startDay: '2024-01-01',
 *   endDay: '2024-01-31',
 * });
 * ```
 */
export class StatisticsService {
  private client: PolyVClient;

  /**
   * Create a new StatisticsService instance
   *
   * @param client - The PolyVClient instance to use for API calls
   */
  constructor(client: PolyVClient) {
    this.client = client;
  }

  // ============================================
  // Daily View Statistics API
  // ============================================

  /**
   * Get daily view statistics
   *
   * Query daily view statistics for a channel within a date range.
   * The date range cannot exceed 60 days.
   *
   * @param params - Query parameters
   * @returns Daily view statistics response
   * @throws {PolyVValidationError} When parameters are invalid
   *
   * @example
   * ```typescript
   * const result = await client.statistics.getDailyViewStatistics({
   *   channelId: '123456',
   *   startDay: '2024-01-01',
   *   endDay: '2024-01-31',
   * });
   * console.log(result.contents);
   * ```
   */
  async getDailyViewStatistics(
    params: GetDailyViewStatisticsParams
  ): Promise<GetDailyViewStatisticsResponse> {
    // Validate parameters
    this.validateGetDailyViewStatisticsParams(params);

    // Call V3 API
    const response = await this.client.httpClient.get<GetDailyViewStatisticsResponse['contents']>(
      '/live/v3/channel/statistics/daily/summary',
      { params }
    );

    // Return the response contents
    return {
      contents: response as unknown as GetDailyViewStatisticsResponse['contents'],
    };
  }

  // ============================================
  // Private Validation Helpers
  // ============================================

  /**
   * Validate parameters for getDailyViewStatistics
   */
  private validateGetDailyViewStatisticsParams(params: GetDailyViewStatisticsParams): void {
    // Validate channelId
    if (!params.channelId || typeof params.channelId !== 'string' || params.channelId.trim() === '') {
      throw new PolyVValidationError(
        'channelId is required and must be a non-empty string',
        'channelId',
        params.channelId
      );
    }

    // Validate startDay format
    if (!params.startDay || !isValidDateFormat(params.startDay)) {
      throw new PolyVValidationError(
        'startDay is required and must be in yyyy-MM-dd format',
        'startDay',
        params.startDay
      );
    }

    // Validate endDay format
    if (!params.endDay || !isValidDateFormat(params.endDay)) {
      throw new PolyVValidationError(
        'endDay is required and must be in yyyy-MM-dd format',
        'endDay',
        params.endDay
      );
    }

    // Validate date range (order and not exceeding max days)
    const rangeValidation = validateDateRange(params.startDay, params.endDay, MAX_DATE_RANGE_DAYS);
    if (!rangeValidation.valid) {
      throw new PolyVValidationError(
        rangeValidation.error || 'Invalid date range',
        'dateRange',
        { startDay: params.startDay, endDay: params.endDay, daysDiff: rangeValidation.daysDiff }
      );
    }
  }

  // ============================================
  // Concurrency Data API (Story 10.2)
  // ============================================

  /**
   * Get historical concurrency data
   *
   * Query historical concurrency data for a channel within a date range.
   * The date range cannot exceed 60 days.
   *
   * @param params - Query parameters
   * @returns Concurrency data response
   * @throws {PolyVValidationError} When parameters are invalid
   *
   * @example
   * ```typescript
   * const result = await client.statistics.getConcurrencyData({
   *   channelId: '123456',
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   * });
   * console.log(result.contents);
   * ```
   */
  async getConcurrencyData(
    params: GetConcurrencyDataParams
  ): Promise<GetConcurrencyDataResponse> {
    // Validate parameters
    this.validateGetConcurrencyDataParams(params);

    // Call V3 API
    const response = await this.client.httpClient.get<GetConcurrencyDataResponse['contents']>(
      '/live/v3/channel/statistics/concurrence',
      { params }
    );

    // Return the response contents
    return {
      contents: response as unknown as GetConcurrencyDataResponse['contents'],
    };
  }

  /**
   * Validate parameters for getConcurrencyData
   */
  private validateGetConcurrencyDataParams(params: GetConcurrencyDataParams): void {
    // Validate channelId
    if (!params.channelId || typeof params.channelId !== 'string' || params.channelId.trim() === '') {
      throw new PolyVValidationError(
        'channelId is required and must be a non-empty string',
        'channelId',
        params.channelId
      );
    }

    // Validate startDate format
    if (!params.startDate || !isValidDateFormat(params.startDate)) {
      throw new PolyVValidationError(
        'startDate is required and must be in yyyy-MM-dd format',
        'startDate',
        params.startDate
      );
    }

    // Validate endDate format
    if (!params.endDate || !isValidDateFormat(params.endDate)) {
      throw new PolyVValidationError(
        'endDate is required and must be in yyyy-MM-dd format',
        'endDate',
        params.endDate
      );
    }

    // Validate date range (order and not exceeding max days)
    const rangeValidation = validateConcurrencyDateRange(params.startDate, params.endDate, MAX_DATE_RANGE_DAYS);
    if (!rangeValidation.valid) {
      throw new PolyVValidationError(
        rangeValidation.error || 'Invalid date range',
        'dateRange',
        { startDate: params.startDate, endDate: params.endDate, daysDiff: rangeValidation.daysDiff }
      );
    }
  }

  // ============================================
  // Max Concurrent API (Story 10.2)
  // ============================================

  /**
   * Get maximum historical concurrent viewers
   *
   * Query the maximum concurrent viewers for a channel within a time range.
   * The time range cannot exceed 3 months.
   *
   * @param params - Query parameters
   * @returns Max concurrent response
   * @throws {PolyVValidationError} When parameters are invalid
   *
   * @example
   * ```typescript
   * const result = await client.statistics.getMaxConcurrent({
   *   channelId: '123456',
   *   startTime: 1704067200000,
   *   endTime: 1735689600000,
   * });
   * console.log(result.contents);
   * ```
   */
  async getMaxConcurrent(
    params: GetMaxConcurrentParams
  ): Promise<GetMaxConcurrentResponse> {
    // Validate parameters
    this.validateGetMaxConcurrentParams(params);

    // Call V3 API
    const response = await this.client.httpClient.get<GetMaxConcurrentResponse['contents']>(
      '/live/v3/channel/statistics/get-max-history-concurrent',
      { params }
    );

    // Return the response contents
    return {
      contents: response as unknown as GetMaxConcurrentResponse['contents'],
    };
  }

  /**
   * Validate parameters for getMaxConcurrent
   */
  private validateGetMaxConcurrentParams(params: GetMaxConcurrentParams): void {
    // Validate channelId
    if (!params.channelId || typeof params.channelId !== 'string' || params.channelId.trim() === '') {
      throw new PolyVValidationError(
        'channelId is required and must be a non-empty string',
        'channelId',
        params.channelId
      );
    }

    // Validate startTime
    if (!isValidTimestamp(params.startTime)) {
      throw new PolyVValidationError(
        'startTime is required and must be a valid timestamp',
        'startTime',
        params.startTime
      );
    }

    // Validate endTime
    if (!isValidTimestamp(params.endTime)) {
      throw new PolyVValidationError(
        'endTime is required and must be a valid timestamp',
        'endTime',
        params.endTime
      );
    }

    // Validate timestamp range (order and not exceeding max months)
    const rangeValidation = validateTimestampRange(params.startTime, params.endTime);
    if (!rangeValidation.valid) {
      throw new PolyVValidationError(
        rangeValidation.error || 'Invalid time range',
        'timeRange',
        { startTime: params.startTime, endTime: params.endTime, daysDiff: rangeValidation.daysDiff }
      );
    }
  }

  // ============================================
  // Region Distribution API (Story 10.3)
  // ============================================

  /**
   * Get region distribution
   *
   * Query the geographic distribution of viewers for a channel.
   * The time range cannot exceed 90 days.
   *
   * @param params - Query parameters
   * @returns Region distribution response
   * @throws {PolyVValidationError} When parameters are invalid
   *
   * @example
   * ```typescript
   * const result = await client.statistics.getRegionDistribution({
   *   channelId: '123456',
   *   startTime: 1648742400000,
   *   endTime: 1651334399000,
   *   type: 'province',
   * });
   * console.log(result.data);
   * ```
   */
  async getRegionDistribution(
    params: GetRegionDistributionParams
  ): Promise<GetRegionDistributionResponse> {
    // Validate parameters
    this.validateGetRegionDistributionParams(params);

    // Build request params
    const requestParams: Record<string, unknown> = {
      channelId: params.channelId,
      startTime: params.startTime,
      endTime: params.endTime,
    };

    // Add type parameter if specified
    if (params.type) {
      requestParams.type = params.type;
    }

    // Call V4 API
    const response = await this.client.httpClient.get<GetRegionDistributionResponse>(
      '/live/v4/channel/statistics/geo-summary-mc',
      { params: requestParams }
    );

    // Return the response directly
    return response as unknown as GetRegionDistributionResponse;
  }

  /**
   * Validate parameters for getRegionDistribution
   */
  private validateGetRegionDistributionParams(params: GetRegionDistributionParams): void {
    // Validate channelId
    if (!params.channelId || typeof params.channelId !== 'string' || params.channelId.trim() === '') {
      throw new PolyVValidationError(
        'channelId is required and must be a non-empty string',
        'channelId',
        params.channelId
      );
    }

    // Validate startTime
    if (!isValidTimestamp(params.startTime)) {
      throw new PolyVValidationError(
        'startTime is required and must be a valid timestamp',
        'startTime',
        params.startTime
      );
    }

    // Validate endTime
    if (!isValidTimestamp(params.endTime)) {
      throw new PolyVValidationError(
        'endTime is required and must be a valid timestamp',
        'endTime',
        params.endTime
      );
    }

    // Validate timestamp range (order and not exceeding 90 days)
    const rangeValidation = validate90DayTimestampRange(params.startTime, params.endTime);
    if (!rangeValidation.valid) {
      throw new PolyVValidationError(
        rangeValidation.error || 'Invalid time range',
        'timeRange',
        { startTime: params.startTime, endTime: params.endTime, daysDiff: rangeValidation.daysDiff }
      );
    }

    // Validate type parameter if specified
    if (params.type !== undefined) {
      const validTypes = ['country', 'province', 'city'];
      if (!validTypes.includes(params.type)) {
        throw new PolyVValidationError(
          'Type must be one of: country, province, city',
          'type',
          params.type
        );
      }
    }
  }

  // ============================================
  // Device Distribution API (Story 10.3)
  // ============================================

  /**
   * Get device distribution
   *
   * Query the browser/device distribution of viewers for a channel.
   * The time range cannot exceed 90 days.
   *
   * @param params - Query parameters
   * @returns Device distribution response
   * @throws {PolyVValidationError} When parameters are invalid
   *
   * @example
   * ```typescript
   * const result = await client.statistics.getDeviceDistribution({
   *   channelId: '123456',
   *   startTime: 1651386101000,
   *   endTime: 1652336501462,
   * });
   * console.log(result.data);
   * ```
   */
  async getDeviceDistribution(
    params: GetDeviceDistributionParams
  ): Promise<GetDeviceDistributionResponse> {
    // Validate parameters
    this.validateGetDeviceDistributionParams(params);

    // Call V4 API
    const response = await this.client.httpClient.get<GetDeviceDistributionResponse>(
      '/live/v4/channel/statistics/browser-summary',
      { params }
    );

    // Return the response directly
    return response as unknown as GetDeviceDistributionResponse;
  }

  /**
   * Validate parameters for getDeviceDistribution
   */
  private validateGetDeviceDistributionParams(params: GetDeviceDistributionParams): void {
    // Validate channelId
    if (!params.channelId || typeof params.channelId !== 'string' || params.channelId.trim() === '') {
      throw new PolyVValidationError(
        'channelId is required and must be a non-empty string',
        'channelId',
        params.channelId
      );
    }

    // Validate startTime
    if (!isValidTimestamp(params.startTime)) {
      throw new PolyVValidationError(
        'startTime is required and must be a valid timestamp',
        'startTime',
        params.startTime
      );
    }

    // Validate endTime
    if (!isValidTimestamp(params.endTime)) {
      throw new PolyVValidationError(
        'endTime is required and must be a valid timestamp',
        'endTime',
        params.endTime
      );
    }

    // Validate timestamp range (order and not exceeding 90 days)
    const rangeValidation = validate90DayTimestampRange(params.startTime, params.endTime);
    if (!rangeValidation.valid) {
      throw new PolyVValidationError(
        rangeValidation.error || 'Invalid time range',
        'timeRange',
        { startTime: params.startTime, endTime: params.endTime, daysDiff: rangeValidation.daysDiff }
      );
    }
  }

  // ============================================
  // Viewlog Export API (Story 10.4)
  // ============================================

  /**
   * Get viewlog (viewing log) data
   *
   * Query viewing log data for a channel within a date range.
   * The date range must be within the same month.
   *
   * @param params - Query parameters
   * @returns Viewlog response with pagination
   * @throws {PolyVValidationError} When parameters are invalid
   *
   * @example
   * ```typescript
   * const result = await client.statistics.getViewlog({
   *   channelId: '3151318',
   *   startDate: '2024-01-01 00:00:00',
   *   endDate: '2024-01-31 23:59:59',
   * });
   * console.log(result.contents);
   * ```
   */
  async getViewlog(params: GetViewlogParams): Promise<GetViewlogResponse> {
    // Validate parameters
    this.validateGetViewlogParams(params);

    // Build request params with defaults
    const requestParams: Record<string, unknown> = {
      channelId: params.channelId,
      startDate: params.startDate,
      endDate: params.endDate,
      pageSize: params.pageSize ?? 1000,
    };

    // Add optional parameters
    if (params.page !== undefined) {
      requestParams.page = params.page;
    }
    if (params.watchType !== undefined) {
      requestParams.watchType = params.watchType;
    }

    // Call V3 API
    const response = await this.client.httpClient.get<GetViewlogResponse>(
      '/live/v3/user/statistics/viewlog',
      { params: requestParams }
    );

    // Handle response - if it has a 'data' property, extract it (for test mocks)
    // In production, the interceptor already extracts the data
    if (response && typeof response === 'object' && 'data' in response) {
      const responseData = response as { data: unknown };
      // Check if data is the expected response format
      if (responseData.data && typeof responseData.data === 'object') {
        return responseData.data as GetViewlogResponse;
      }
    }

    // Return the response directly
    return response as unknown as GetViewlogResponse;
  }

  /**
   * Validate parameters for getViewlog
   */
  private validateGetViewlogParams(params: GetViewlogParams): void {
    // Validate channelId
    if (!params.channelId || typeof params.channelId !== 'string' || params.channelId.trim() === '') {
      throw new PolyVValidationError(
        'channelId is required and must be a non-empty string',
        'channelId',
        params.channelId
      );
    }

    // Validate startDate format (yyyy-MM-dd HH:mm:ss)
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (!params.startDate || !dateTimeRegex.test(params.startDate)) {
      throw new PolyVValidationError(
        'startDate is required and must be in yyyy-MM-dd HH:mm:ss format',
        'startDate',
        params.startDate
      );
    }

    // Validate endDate format (yyyy-MM-dd HH:mm:ss)
    if (!params.endDate || !dateTimeRegex.test(params.endDate)) {
      throw new PolyVValidationError(
        'endDate is required and must be in yyyy-MM-dd HH:mm:ss format',
        'endDate',
        params.endDate
      );
    }

    // Validate same month constraint
    const startMonth = params.startDate.substring(0, 7); // "yyyy-MM"
    const endMonth = params.endDate.substring(0, 7);
    if (startMonth !== endMonth) {
      throw new PolyVValidationError(
        'startDate and endDate must be in the same month',
        'dateRange',
        { startDate: params.startDate, endDate: params.endDate }
      );
    }

    // Validate watchType if specified
    if (params.watchType !== undefined) {
      const validWatchTypes = ['live', 'vod'];
      if (!validWatchTypes.includes(params.watchType)) {
        throw new PolyVValidationError(
          'watchType must be either "live" or "vod"',
          'watchType',
          params.watchType
        );
      }
    }
  }

  // ============================================
  // Session Stats Export API (Story 10.4)
  // ============================================

  /**
   * Export session statistics report
   *
   * Export the session statistics report for a specific session.
   * Returns a download URL for the report file.
   *
   * @param params - Query parameters
   * @returns Export response with download URL
   * @throws {PolyVValidationError} When parameters are invalid
   *
   * @example
   * ```typescript
   * const result = await client.statistics.exportSessionStats({
   *   channelId: '3151318',
   *   sessionId: 'fv3ma84e63',
   * });
   * console.log(result.downloadUrl);
   * ```
   */
  async exportSessionStats(params: ExportSessionStatsParams): Promise<ExportSessionStatsResponse> {
    // Validate parameters
    this.validateExportSessionStatsParams(params);

    // Call V3 API
    const response = await this.client.httpClient.get<ExportSessionStatsResponse>(
      '/live/v3/channel/session/stats/export',
      { params }
    );

    // Handle response - if it has a 'data' property, check its structure
    // The test mocks wrap the response in { data: ... }
    if (response && typeof response === 'object' && 'data' in response) {
      const responseData = response as { data: unknown };

      // Check if data contains error response
      if (responseData.data && typeof responseData.data === 'object') {
        const innerData = responseData.data as { code?: number; message?: string; status?: string; data?: unknown };

        // Check for API error response (code !== 200)
        if (innerData.code && innerData.code !== 200) {
          throw new Error(innerData.message || 'API Error');
        }

        // If inner data is the expected response format
        if ('downloadUrl' in innerData) {
          return innerData as ExportSessionStatsResponse;
        }

        // If data is a string (URL in the 'data' field of API response)
        if (typeof innerData.data === 'string' && innerData.data) {
          return { downloadUrl: innerData.data };
        }
      }
    }

    // Check for direct error response (without 'data' wrapper)
    if (response && typeof response === 'object' && 'code' in response) {
      const apiResponse = response as Record<string, unknown>;
      if (apiResponse.code && apiResponse.code !== 200) {
        throw new Error(String(apiResponse.message || 'API Error'));
      }
      // If data is a string (URL), wrap it in response format
      if (typeof apiResponse.data === 'string' && apiResponse.data) {
        return { downloadUrl: apiResponse.data };
      }
    }

    // Return the response directly
    return response as unknown as ExportSessionStatsResponse;
  }

  /**
   * Validate parameters for exportSessionStats
   */
  private validateExportSessionStatsParams(params: ExportSessionStatsParams): void {
    // Validate channelId
    if (!params.channelId || typeof params.channelId !== 'string' || params.channelId.trim() === '') {
      throw new PolyVValidationError(
        'channelId is required and must be a non-empty string',
        'channelId',
        params.channelId
      );
    }

    // Validate sessionId
    if (!params.sessionId || typeof params.sessionId !== 'string' || params.sessionId.trim() === '') {
      throw new PolyVValidationError(
        'sessionId is required and must be a non-empty string',
        'sessionId',
        params.sessionId
      );
    }
  }
}
