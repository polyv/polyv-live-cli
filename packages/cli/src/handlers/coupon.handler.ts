/**
 * @fileoverview Coupon command handler for CLI operations
 * @author Development Team
 * @since 8.1.0
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { createSdkClient } from '../sdk';
import type {
  CreateCouponParams,
  SearchCouponsParams,
  Coupon,
  CouponRule,
} from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';

// ========================================
// Constants
// ========================================

/** Maximum length for coupon name */
const COUPON_NAME_MAX_LENGTH = 50;

/** Maximum number of coupon IDs for batch deletion */
const BATCH_DELETE_MAX_IDS = 200;

/** Maximum page size for list queries */
const PAGE_SIZE_MAX = 1000;

/**
 * Options for coupon add command from CLI
 */
export interface CouponAddOptions {
  /** Coupon name (max 50 characters) */
  name: string;
  /** Coupon type - MAX_OUT (满减券) or DISCOUNT (折扣券) */
  type: 'MAX_OUT' | 'DISCOUNT';
  /** Issue quantity (>= 0) */
  availableAmount: number;
  /** Receive start time (13-bit millisecond timestamp) */
  receiveStart: number;
  /** Receive end time (13-bit millisecond timestamp) */
  receiveEnd: number;
  /** Use time type - RANGE or DAY */
  useTimeType: 'RANGE' | 'DAY';
  /** Use start time (when useTimeType=RANGE) */
  useStart?: number;
  /** Use end time (when useTimeType=RANGE) */
  useEnd?: number;
  /** Days available (when useTimeType=DAY) */
  dayOfUse?: number;
  /** Rule condition - UNCONDITIONAL or FULL_REDUCE */
  condition: 'UNCONDITIONAL' | 'FULL_REDUCE';
  /** Discount value for UNCONDITIONAL rule */
  discount?: number;
  /** Minimum spend threshold for FULL_REDUCE rule */
  full?: number;
  /** Discount amount for FULL_REDUCE rule */
  reduce?: number;
  /** Maximum claims per person (-1 for unlimited) */
  limitPerPerson: number;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for coupon list command from CLI
 */
export interface CouponListOptions {
  /** Page number for pagination (minimum 1) */
  page?: number;
  /** Page size for pagination (1-1000) */
  size?: number;
  /** Filter by status */
  status?: 'NOT_START' | 'GOING' | 'FINISHED' | 'INVALID';
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for coupon delete command from CLI
 */
export interface CouponDeleteOptions {
  /** Array of coupon IDs to delete (max 200) */
  couponIds: string[];
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Service configuration for coupon handler
 */
export interface CouponServiceConfig {
  /** Base URL for PolyV API */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Debug mode flag */
  debug?: boolean;
}

/**
 * Handler for coupon-related CLI commands
 */
export class CouponHandler extends BaseHandler {
  private readonly authConfig: AuthConfig;
  private readonly serviceConfig: CouponServiceConfig;

  /**
   * Creates a new CouponHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: CouponServiceConfig) {
    super();
    this.authConfig = authConfig;
    this.serviceConfig = serviceConfig;
  }

  /**
   * Creates a new coupon
   * @param options Coupon add options from CLI
   * @returns Promise that resolves when coupon is created
   *
   * @throws {PolyVValidationError} When coupon options are invalid
   * @throws {PolyVError} When coupon creation fails
   *
   * @example
   * ```typescript
   * await couponHandler.addCoupon({
   *   name: '满100减20',
   *   type: 'MAX_OUT',
   *   availableAmount: 100,
   *   receiveStart: 1704067200000,
   *   receiveEnd: 1704153600000,
   *   useTimeType: 'RANGE',
   *   useStart: 1704067200000,
   *   useEnd: 1704758400000,
   *   condition: 'FULL_REDUCE',
   *   full: 100,
   *   reduce: 20,
   *   limitPerPerson: 1,
   *   output: 'table'
   * });
   * ```
   */
  async addCoupon(options: CouponAddOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateAddOptions(options);

      // Transform CLI options to API params
      const params = this.transformToAddParams(options);

      // Create SDK client and coupon
      const client = createSdkClient(this.authConfig, this.serviceConfig.baseUrl);
      const couponId = await client.v4Platform.createCoupon(params);

      // Display results
      this.displayAddResult(couponId, options.name, options.output);

    }, 'coupon.add');
  }

  /**
   * Lists coupons with pagination support
   * @param options Coupon list options from CLI
   * @returns Promise that resolves when coupons are listed
   *
   * @throws {PolyVValidationError} When list options are invalid
   * @throws {PolyVError} When coupon listing fails
   *
   * @example
   * ```typescript
   * await couponHandler.listCoupons({
   *   page: 1,
   *   size: 10,
   *   status: 'GOING',
   *   output: 'table'
   * });
   * ```
   */
  async listCoupons(options: CouponListOptions = {}): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateListOptions(options);

      // Transform CLI options to API params
      const params = this.transformToListParams(options);

      // Create SDK client and list coupons
      const client = createSdkClient(this.authConfig, this.serviceConfig.baseUrl);
      const result = await client.v4Platform.searchCoupons(params);

      // Display results
      this.displayListResult(result.contents, result.total, params.pageNumber ?? 1, params.pageSize ?? 10, options.output);

    }, 'coupon.list');
  }

  /**
   * Deletes coupons in batch
   * @param options Coupon delete options from CLI
   * @returns Promise that resolves when coupons are deleted
   *
   * @throws {PolyVValidationError} When delete options are invalid
   * @throws {PolyVError} When coupon deletion fails
   *
   * @example
   * ```typescript
   * await couponHandler.deleteCoupons({
   *   couponIds: ['coupon001', 'coupon002'],
   *   output: 'table'
   * });
   * ```
   */
  async deleteCoupons(options: CouponDeleteOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateDeleteOptions(options);

      // Create SDK client and delete coupons
      const client = createSdkClient(this.authConfig, this.serviceConfig.baseUrl);
      await client.v4Platform.deleteCouponsBatch({ couponIds: options.couponIds });

      // Display results
      this.displayDeleteResult(options.couponIds.length, options.output);

    }, 'coupon.delete');
  }

  // ========================================
  // Private Validation Methods
  // ========================================

  /**
   * Validates coupon add options from CLI
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateAddOptions(options: CouponAddOptions): void {
    const errors: string[] = [];

    // Validate name
    if (!options.name || options.name.trim().length === 0) {
      errors.push('name is required');
    } else if (options.name.length > COUPON_NAME_MAX_LENGTH) {
      errors.push(`name must not exceed ${COUPON_NAME_MAX_LENGTH} characters`);
    }

    // Validate type
    if (!options.type || !['MAX_OUT', 'DISCOUNT'].includes(options.type)) {
      errors.push('type must be either MAX_OUT or DISCOUNT');
    }

    // Validate availableAmount
    if (options.availableAmount === undefined || options.availableAmount < 0) {
      errors.push('availableAmount must be >= 0');
    }

    // Validate receiveStart and receiveEnd
    if (!options.receiveStart || !options.receiveEnd) {
      errors.push('receiveStart and receiveEnd are required');
    } else if (options.receiveStart >= options.receiveEnd) {
      errors.push('receiveEnd must be greater than receiveStart');
    }

    // Validate useTimeType
    if (!options.useTimeType || !['RANGE', 'DAY'].includes(options.useTimeType)) {
      errors.push('useTimeType must be either RANGE or DAY');
    }

    // Validate RANGE type requires useStart and useEnd
    if (options.useTimeType === 'RANGE') {
      if (!options.useStart || !options.useEnd) {
        errors.push('useStart and useEnd are required when useTimeType is RANGE');
      } else if (options.useStart >= options.useEnd) {
        errors.push('useEnd must be greater than useStart');
      }
    }

    // Validate DAY type requires dayOfUse
    if (options.useTimeType === 'DAY') {
      if (options.dayOfUse === undefined || options.dayOfUse < 1) {
        errors.push('dayOfUse is required and must be >= 1 when useTimeType is DAY');
      }
    }

    // Validate condition
    if (!options.condition || !['UNCONDITIONAL', 'FULL_REDUCE'].includes(options.condition)) {
      errors.push('condition must be either UNCONDITIONAL or FULL_REDUCE');
    }

    // Validate UNCONDITIONAL condition requires discount
    if (options.condition === 'UNCONDITIONAL') {
      if (options.discount === undefined || options.discount <= 0) {
        errors.push('discount is required and must be > 0 when condition is UNCONDITIONAL');
      }
    }

    // Validate FULL_REDUCE requires full and reduce
    if (options.condition === 'FULL_REDUCE') {
      if (options.full === undefined || options.full < 0) {
        errors.push('full is required and must be >= 0 when condition is FULL_REDUCE');
      }
      if (options.reduce === undefined || options.reduce < 0) {
        errors.push('reduce is required and must be >= 0 when condition is FULL_REDUCE');
      }
    }

    // Validate limitPerPerson
    if (options.limitPerPerson === undefined || options.limitPerPerson < -1) {
      errors.push('limitPerPerson must be >= -1');
    }

    // Validate output format
    if (options.output !== undefined && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Coupon add options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  /**
   * Validates coupon list options from CLI
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateListOptions(options: CouponListOptions): void {
    const errors: string[] = [];

    // Validate page parameter
    if (options.page !== undefined) {
      if (typeof options.page !== 'number' || !Number.isInteger(options.page) || options.page < 1) {
        errors.push('page must be a positive integer (minimum 1)');
      }
    }

    // Validate size parameter
    if (options.size !== undefined) {
      if (typeof options.size !== 'number' || !Number.isInteger(options.size) || options.size < 1 || options.size > PAGE_SIZE_MAX) {
        errors.push(`size must be an integer between 1 and ${PAGE_SIZE_MAX}`);
      }
    }

    // Validate status parameter
    if (options.status !== undefined && !['NOT_START', 'GOING', 'FINISHED', 'INVALID'].includes(options.status)) {
      errors.push('status must be one of: NOT_START, GOING, FINISHED, INVALID');
    }

    // Validate output format
    if (options.output !== undefined && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Coupon list options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  /**
   * Validates coupon delete options from CLI
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateDeleteOptions(options: CouponDeleteOptions): void {
    const errors: string[] = [];

    // Validate couponIds
    if (!options.couponIds || !Array.isArray(options.couponIds) || options.couponIds.length === 0) {
      errors.push('couponIds is required and must not be empty');
    } else if (options.couponIds.length > BATCH_DELETE_MAX_IDS) {
      errors.push(`couponIds must not exceed ${BATCH_DELETE_MAX_IDS} items`);
    } else {
      // Check for duplicate IDs
      const uniqueIds = new Set(options.couponIds);
      if (uniqueIds.size !== options.couponIds.length) {
        errors.push('couponIds contains duplicate values');
      }
    }

    // Validate output format
    if (options.output !== undefined && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Coupon delete options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  // ========================================
  // Private Transformation Methods
  // ========================================

  /**
   * Transforms CLI options to API request format
   * @param options CLI options
   * @returns API request object
   */
  private transformToAddParams(options: CouponAddOptions): CreateCouponParams {
    const rule: CouponRule = {
      condition: options.condition,
      limitPerPerson: options.limitPerPerson,
    };

    if (options.condition === 'UNCONDITIONAL') {
      rule.unconditional = {
        enable: true,
        value: options.discount as number,
        unit: options.type === 'DISCOUNT' ? 'DISCOUNT' : 'MONEY',
      }
    } else if (options.condition === 'FULL_REDUCE') {
      rule.fullReduce = {
        enable: true,
        full: options.full ?? 0,
        reduce: options.reduce ?? 0,
        unit: options.type === 'DISCOUNT' ? 'DISCOUNT' : 'MONEY',
      };
    }

    const params: CreateCouponParams = {
      name: options.name,
      type: options.type,
      availableAmount: options.availableAmount,
      receiveStartTime: options.receiveStart,
      receiveEndTime: options.receiveEnd,
      useTimeType: options.useTimeType,
      rule,
    };

    if (options.useTimeType === 'RANGE') {
      params.useStartTime = options.useStart as number;
      params.useEndTime = options.useEnd as number;
    } else if (options.useTimeType === 'DAY') {
      params.dayOfUse = options.dayOfUse as number;
    }

    return params;
  }

  /**
   * Transforms CLI options to API request format
   * @param options CLI options
   * @returns API request object
   */
  private transformToListParams(options: CouponListOptions): SearchCouponsParams {
    return {
      pageNumber: options.page ?? 1,
      pageSize: options.size ?? 10,
      ...(options.status && { status: options.status }),
    };
  }

  // ========================================
  // Private Display Methods
  // ========================================

  /**
   * Displays add coupon result
   * @param couponId Created coupon ID
   * @param name Coupon name
   * @param format Output format
   */
  private displayAddResult(couponId: string, name: string, format: OutputFormat = 'table'): void {
    const data = {
      couponId,
      name,
      created: new Date().toISOString(),
    };

    if (format === 'json') {
      this.displayData(data, 'json');
    } else {
      this.displaySuccess(`Coupon created successfully`, data, 'table');
    }
  }

  /**
   * Displays list coupons result
   * @param coupons Array of coupons
   * @param total Total count
   * @param page Current page
   * @param size Page size
   * @param format Output format
   */
  private displayListResult(
    coupons: Coupon[],
    total: number,
    page: number,
    size: number,
    format: OutputFormat = 'table'
  ): void {
    if (coupons.length === 0) {
      this.displayInfo('No coupons found');
      return;
    }

    // Display pagination info
    const fromItem = (page - 1) * size + 1;
    const toItem = Math.min(fromItem + coupons.length - 1, fromItem + size - 1);

    this.displayInfo(`Showing coupons ${fromItem}-${toItem} of ${total} (page ${page}, size ${size})`);

    if (format === 'json') {
      this.displayData(coupons, 'json');
    } else {
      this.displayCouponsTable(coupons);
    }
  }

  /**
   * Displays coupons as a formatted table
   * @param coupons Array of coupons
   */
  private displayCouponsTable(coupons: Coupon[]): void {
    const tableData = coupons.map((coupon) => ({
      'Coupon ID': coupon.couponId,
      'Name': coupon.name,
      'Type': coupon.useTimeType === 'DAY' ? 'Days' : 'Range',
      'Status': this.formatStatus(coupon.status),
      'Available': coupon.availableAmount,
      'Received': coupon.receivedAmount,
      'Receive Period': `${this.formatDate(coupon.receiveStartTime)} - ${this.formatDate(coupon.receiveEndTime)}`,
    }));

    this.displayAsTable(tableData);
  }

  /**
   * Displays delete coupons result
   * @param count Number of coupons deleted
   * @param format Output format
   */
  private displayDeleteResult(count: number, format: OutputFormat = 'table'): void {
    const data = {
      deleted: count,
      timestamp: new Date().toISOString(),
    };

    if (format === 'json') {
      this.displayData(data, 'json');
    } else {
      this.displaySuccess(`Successfully deleted ${count} coupon(s)`, data, 'table');
    }
  }

  /**
   * Formats coupon status for display
   * @param status Coupon status
   * @returns Formatted status string
   */
  private formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      NOT_START: 'Not Started',
      GOING: 'Active',
      FINISHED: 'Finished',
      INVALID: 'Invalid',
    };

    return statusMap[status] || status;
  }

  /**
   * Formats timestamp for display
   * @param timestamp 13-bit millisecond timestamp
   * @returns Formatted date string
   */
  private formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }
}
