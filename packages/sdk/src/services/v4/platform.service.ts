/**
 * V4 Platform Service
 *
 * Service for managing PolyV V4 Platform operations (Coupon management).
 * Provides methods for coupon CRUD, search, and batch operations.
 *
 * @module services/v4/platform
 */

import type { PolyVClient } from '../../client.js';
import { PolyVValidationError } from '../../errors/polyv-validation-error.js';
import type {
  Coupon,
  CreateCouponParams,
  UpdateCouponParams,
  SearchCouponsParams,
  SearchCouponsResponse,
  SearchCouponViewersParams,
  SearchCouponViewersResponse,
  CouponViewer,
  DeleteCouponsBatchParams,
  UpdateCouponsStatusBatchParams,
} from '../../types/v4-platform.js';

/**
 * V4 Platform Service
 *
 * Provides methods for managing coupons including create, update, search, and batch operations.
 */
export class V4PlatformService {
  private client: PolyVClient;

  constructor(client: PolyVClient) {
    this.client = client;
  }

  // ============================================
  // Private Validation Helpers
  // ============================================

  /**
   * Validate pagination parameters
   */
  private validatePagination(pageNumber?: number, pageSize?: number): void {
    if (pageNumber !== undefined && pageNumber < 1) {
      throw new PolyVValidationError('pageNumber must be >= 1', 'pageNumber');
    }
    if (pageSize !== undefined && (pageSize < 1 || pageSize > 1000)) {
      throw new PolyVValidationError('pageSize must be between 1 and 1000', 'pageSize');
    }
  }

  /**
   * Validate coupon IDs array for batch operations
   */
  private validateCouponIds(couponIds: string[], fieldName: string = 'couponIds'): void {
    if (!couponIds || couponIds.length === 0) {
      throw new PolyVValidationError(`${fieldName} is required and must not be empty`, fieldName);
    }
    if (couponIds.length > 200) {
      throw new PolyVValidationError(`${fieldName} must not exceed 200 items`, fieldName);
    }
  }

  /**
   * Validate coupon creation parameters
   */
  private validateCreateCouponParams(params: CreateCouponParams): void {
    if (!params.name || params.name.trim().length === 0) {
      throw new PolyVValidationError('name is required', 'name');
    }
    if (params.name.length > 50) {
      throw new PolyVValidationError('name must not exceed 50 characters', 'name');
    }
    if (params.availableAmount !== undefined && params.availableAmount < 0) {
      throw new PolyVValidationError('availableAmount must be >= 0', 'availableAmount');
    }
    if (params.useTimeType === 'RANGE') {
      if (!params.useStartTime || !params.useEndTime) {
        throw new PolyVValidationError(
          'useStartTime and useEndTime are required when useTimeType is RANGE',
          'useTimeType'
        );
      }
    }
    if (params.useTimeType === 'DAY' && !params.dayOfUse) {
      throw new PolyVValidationError(
        'dayOfUse is required when useTimeType is DAY',
        'dayOfUse'
      );
    }
  }

  /**
   * Validate coupon update parameters
   */
  private validateUpdateCouponParams(params: UpdateCouponParams): void {
    if (!params.couponId || params.couponId.trim().length === 0) {
      throw new PolyVValidationError('couponId is required', 'couponId');
    }
  }

  // ============================================
  // AC1: Coupon Create API
  // ============================================

  /**
   * Create a coupon
   *
   * Creates a new coupon with the specified parameters.
   *
   * @param params - Coupon creation parameters
   * @returns Promise resolving to the created coupon ID
   *
   * @example
   * ```typescript
   * const couponId = await client.v4Platform.createCoupon({
   *   name: 'Summer Discount',
   *   receiveStartTime: Date.now(),
   *   receiveEndTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
   *   useTimeType: 'DAY',
   *   dayOfUse: 30,
   *   type: 'MAX_OUT',
   *   availableAmount: 1000,
   *   rule: {
   *     condition: 'UNCONDITIONAL',
   *     unconditional: { enable: true, value: 10, unit: 'MONEY' },
   *     limitPerPerson: 1
   *   }
   * });
   * ```
   */
  async createCoupon(params: CreateCouponParams): Promise<string> {
    this.validateCreateCouponParams(params);
    const response = await this.client.httpClient.post<string>(
      '/live/v4/user/coupon/create',
      params
    );
    return response as unknown as string;
  }

  // ============================================
  // AC2: Coupon Update API
  // ============================================

  /**
   * Update a coupon
   *
   * Updates an existing coupon. Cannot update coupons with status FINISHED or INVALID.
   *
   * @param params - Coupon update parameters
   *
   * @example
   * ```typescript
   * await client.v4Platform.updateCoupon({
   *   couponId: 'coupon123',
   *   name: 'Updated Coupon Name',
   *   availableAmount: 2000
   * });
   * ```
   */
  async updateCoupon(params: UpdateCouponParams): Promise<void> {
    this.validateUpdateCouponParams(params);
    await this.client.httpClient.post(
      '/live/v4/user/coupon/update',
      params
    );
  }

  // ============================================
  // AC3: Coupon Search APIs
  // ============================================

  /**
   * Search coupons
   *
   * Retrieves a paginated list of coupons with optional filtering.
   *
   * @param params - Search parameters
   * @returns Promise resolving to paginated coupon list
   *
   * @example
   * ```typescript
   * const result = await client.v4Platform.searchCoupons({
   *   status: 'GOING',
   *   pageNumber: 1,
   *   pageSize: 20
   * });
   * console.log(`Found ${result.total} active coupons`);
   * ```
   */
  async searchCoupons(params: SearchCouponsParams = {}): Promise<SearchCouponsResponse> {
    this.validatePagination(params.pageNumber, params.pageSize);

    const response = await this.client.httpClient.get<SearchCouponsResponse>(
      '/live/v4/user/coupon/search',
      { params }
    );
    return response as unknown as SearchCouponsResponse;
  }

  /**
   * Search coupon viewers (recipients)
   *
   * Retrieves a paginated list of viewers who have received a specific coupon.
   *
   * @param params - Search parameters (couponId is required)
   * @returns Promise resolving to paginated viewer list
   *
   * @example
   * ```typescript
   * const result = await client.v4Platform.searchCouponViewers({
   *   couponId: 'coupon123',
   *   pageNumber: 1,
   *   pageSize: 50
   * });
   * console.log(`${result.total} viewers received this coupon`);
   * ```
   */
  async searchCouponViewers(params: SearchCouponViewersParams): Promise<SearchCouponViewersResponse> {
    if (!params.couponId) {
      throw new PolyVValidationError('couponId is required', 'couponId');
    }
    this.validatePagination(params.pageNumber, params.pageSize);

    const response = await this.client.httpClient.get<SearchCouponViewersResponse>(
      '/live/v4/user/coupon/search-viewer',
      { params }
    );
    return response as unknown as SearchCouponViewersResponse;
  }

  // ============================================
  // AC4: Coupon Batch Operations APIs
  // ============================================

  /**
   * Delete coupons in batch
   *
   * Deletes multiple coupons at once (max 200).
   *
   * @param params - Batch delete parameters
   *
   * @example
   * ```typescript
   * await client.v4Platform.deleteCouponsBatch({
   *   couponIds: ['coupon1', 'coupon2', 'coupon3']
   * });
   * ```
   */
  async deleteCouponsBatch(params: DeleteCouponsBatchParams): Promise<void> {
    this.validateCouponIds(params.couponIds);

    await this.client.httpClient.post(
      '/live/v4/user/coupon/delete-batch',
      params
    );
  }

  /**
   * Update coupons status in batch
   *
   * Stops or invalidates multiple coupons at once (max 200).
   *
   * @param params - Batch status update parameters
   *
   * @example
   * ```typescript
   * await client.v4Platform.updateCouponsStatusBatch({
   *   couponIds: ['coupon1', 'coupon2']
   * });
   * ```
   */
  async updateCouponsStatusBatch(params: UpdateCouponsStatusBatchParams): Promise<void> {
    this.validateCouponIds(params.couponIds);

    await this.client.httpClient.post(
      '/live/v4/user/coupon/update-status-batch',
      params
    );
  }
}
