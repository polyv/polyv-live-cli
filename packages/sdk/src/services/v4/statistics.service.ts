/**
 * V4 Statistics Service
 *
 * Service for managing PolyV V4 Statistics operations.
 * Provides methods for querying live session statistics.
 *
 * @module services/v4/statistics
 */

import type { PolyVClient } from '../../client.js';
import type {
  GetSessionStatsSummaryListParams,
  GetSessionStatsSummaryListResponse,
} from '../../types/v4-statistics.js';
import { PolyVValidationError } from '../../errors/polyv-validation-error.js';

/**
 * V4StatisticsService
 *
 * Provides methods to interact with PolyV V4 Statistics APIs.
 *
 * @example
 * ```typescript
 * const client = new PolyVClient({ appId: 'xxx', appSecret: 'yyy' });
 * const stats = await client.v4Statistics.getSessionStatsSummaryList({
 *   channelId: '123456',
 *   pageNumber: 1,
 *   pageSize: 10,
 * });
 * ```
 */
export class V4StatisticsService {
  private client: PolyVClient;

  /**
   * Create a new V4StatisticsService instance
   *
   * @param client - The PolyVClient instance to use for API calls
   */
  constructor(client: PolyVClient) {
    this.client = client;
  }

  // ============================================
  // AC1: Session Stats Summary API (1 method)
  // ============================================

  /**
   * Get session stats summary list
   *
   * Query live session summary data list with pagination support.
   *
   * @param params - Query parameters
   * @returns Paginated session stats summary list
   *
   * @example
   * ```typescript
   * const result = await client.v4Statistics.getSessionStatsSummaryList({
   *   channelId: '123456',
   *   keyword: 'test',
   *   startTime: '1678800000000',
   *   endTime: '1678999999999',
   *   pageNumber: 1,
   *   pageSize: 10,
   * });
   * console.log(result.contents);
   * ```
   */
  async getSessionStatsSummaryList(
    params: GetSessionStatsSummaryListParams
  ): Promise<GetSessionStatsSummaryListResponse> {
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<GetSessionStatsSummaryListResponse>(
      '/live/v4/statistics/session-stats/summary/list',
      { params }
    );
    return response as unknown as GetSessionStatsSummaryListResponse;
  }

  // ============================================
  // Private Validation Helpers
  // ============================================

  /**
   * Validate pagination parameters
   */
  private validatePaginationParams(params: { pageNumber?: number; pageSize?: number }): void {
    if (
      params.pageNumber !== undefined &&
      params.pageNumber !== null &&
      params.pageNumber < 1
    ) {
      throw new PolyVValidationError(
        'pageNumber must be >= 1',
        'pageNumber',
        params.pageNumber
      );
    }
    if (
      params.pageSize !== undefined &&
      params.pageSize !== null &&
      (params.pageSize < 1 || params.pageSize > 1000)
    ) {
      throw new PolyVValidationError(
        'pageSize must be between 1 and 1000',
        'pageSize',
        params.pageSize
      );
    }
  }
}
