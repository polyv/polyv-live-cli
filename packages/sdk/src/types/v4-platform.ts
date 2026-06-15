/**
 * V4 Platform Types
 *
 * Type definitions for V4 Platform APIs (Coupon management).
 *
 * @module types/v4-platform
 */

// ============================================
// AC1-AC4: Coupon Rule Types
// ============================================

/**
 * Unconditional coupon rule
 *
 * Used when condition is UNCONDITIONAL - no minimum spend required
 */
export interface UnconditionalRule {
  /** Whether this rule is enabled */
  enable: boolean;
  /** Discount value amount */
  value: number;
  /** Value unit - MONEY (yuan) or DISCOUNT (percent) */
  unit: 'MONEY' | 'DISCOUNT';
}

/**
 * Full reduction coupon rule
 *
 * Used when condition is FULL_REDUCE - discount applied when spending meets threshold
 */
export interface FullReduceRule {
  /** Whether this rule is enabled */
  enable: boolean;
  /** Minimum spend threshold to qualify for discount */
  full: number;
  /** Discount amount to reduce */
  reduce: number;
  /** Value unit - MONEY (yuan) or DISCOUNT (percent) */
  unit: 'MONEY' | 'DISCOUNT';
}

/**
 * Coupon rule configuration
 *
 * Defines the discount condition and value for a coupon
 */
export interface CouponRule {
  /** Coupon condition type - UNCONDITIONAL (no minimum) or FULL_REDUCE (minimum spend required) */
  condition: 'UNCONDITIONAL' | 'FULL_REDUCE';
  /** Unconditional rule (required when condition=UNCONDITIONAL) */
  unconditional?: UnconditionalRule;
  /** Full reduce rule (required when condition=FULL_REDUCE) */
  fullReduce?: FullReduceRule;
  /** Maximum claims per person (-1 for unlimited) */
  limitPerPerson: number;
}

// ============================================
// AC1-AC4: Coupon Types
// ============================================

/**
 * Coupon entity
 *
 * Represents a coupon in the system
 */
export interface Coupon {
  /** Coupon ID */
  couponId: string;
  /** Coupon name (max 50 characters) */
  name: string;
  /** Receive start time (13-bit millisecond timestamp) */
  receiveStartTime: number;
  /** Receive end time (13-bit millisecond timestamp) */
  receiveEndTime: number;
  /** Use time type - RANGE (specific time range) or DAY (days after receive) */
  useTimeType: 'RANGE' | 'DAY';
  /** Use start time (13-bit timestamp, when useTimeType=RANGE) */
  useStartTime?: number;
  /** Use end time (13-bit timestamp, when useTimeType=RANGE) */
  useEndTime?: number;
  /** Days available after receive (when useTimeType=DAY) */
  dayOfUse?: number;
  /** Issue quantity available */
  availableAmount: number;
  /** Quantity already received */
  receivedAmount: number;
  /** Coupon rule configuration */
  rule: CouponRule;
  /** Coupon status - NOT_START, GOING, FINISHED, INVALID */
  status: 'NOT_START' | 'GOING' | 'FINISHED' | 'INVALID';
}

/**
 * Parameters for creating a coupon
 */
export interface CreateCouponParams {
  /** Coupon name (max 50 characters) */
  name: string;
  /** Receive start time (13-bit millisecond timestamp) */
  receiveStartTime: number;
  /** Receive end time (13-bit millisecond timestamp) */
  receiveEndTime: number;
  /** Use time type - RANGE (time range) or DAY (days) */
  useTimeType: 'RANGE' | 'DAY';
  /** Use start time (13-bit timestamp, required when useTimeType=RANGE) */
  useStartTime?: number;
  /** Use end time (13-bit timestamp, required when useTimeType=RANGE) */
  useEndTime?: number;
  /** Days available (required when useTimeType=DAY) */
  dayOfUse?: number;
  /** Coupon type - MAX_OUT (fixed discount) or DISCOUNT (percentage) */
  type: 'MAX_OUT' | 'DISCOUNT';
  /** Issue quantity (>= 0) */
  availableAmount: number;
  /** Coupon rule configuration */
  rule: CouponRule;
}

/**
 * Parameters for updating a coupon
 *
 * Note: Cannot update coupons with status FINISHED or INVALID
 */
export interface UpdateCouponParams {
  /** Coupon ID to update */
  couponId: string;
  /** Coupon name (max 50 characters) */
  name?: string;
  /** Receive start time (13-bit millisecond timestamp) */
  receiveStartTime?: number;
  /** Receive end time (13-bit millisecond timestamp) */
  receiveEndTime?: number;
  /** Use time type - RANGE (time range) or DAY (days) */
  useTimeType?: 'RANGE' | 'DAY';
  /** Use start time (13-bit timestamp, when useTimeType=RANGE) */
  useStartTime?: number;
  /** Use end time (13-bit timestamp, when useTimeType=RANGE) */
  useEndTime?: number;
  /** Days available (when useTimeType=DAY) */
  dayOfUse?: number;
  /** Coupon type - MAX_OUT (fixed discount) or DISCOUNT (percentage) */
  type?: 'MAX_OUT' | 'DISCOUNT';
  /** Issue quantity (>= 0) */
  availableAmount?: number;
  /** Coupon rule configuration */
  rule?: CouponRule;
}

/**
 * Parameters for searching coupons
 */
export interface SearchCouponsParams {
  /** Page number (default 1, >= 1) */
  pageNumber?: number;
  /** Page size (default 10, 1-1000) */
  pageSize?: number;
  /** Filter by coupon ID */
  couponId?: string;
  /** Filter by coupon name (fuzzy match) */
  name?: string;
  /** Filter by status - NOT_START, GOING, FINISHED, INVALID */
  status?: 'NOT_START' | 'GOING' | 'FINISHED' | 'INVALID';
}

/**
 * Paginated response for coupon search
 */
export interface SearchCouponsResponse {
  /** List of coupons */
  contents: Coupon[];
  /** Total number of items */
  total: number;
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
}

/**
 * Coupon viewer (recipient) information
 */
export interface CouponViewer {
  /** Viewer ID */
  viewerId: string;
  /** Viewer nickname */
  nickname: string;
  /** Phone number */
  mobile?: string;
  /** Avatar URL */
  avatar?: string;
  /** Receive source - CHANNEL or AGGREGATE_PAGE */
  receiveSource: 'CHANNEL' | 'AGGREGATE_PAGE';
  /** Receive time (13-bit millisecond timestamp) */
  receiveTime: number;
}

/**
 * Parameters for searching coupon viewers
 */
export interface SearchCouponViewersParams {
  /** Coupon ID (required) */
  couponId: string;
  /** Page number (default 1, >= 1) */
  pageNumber?: number;
  /** Page size (default 10, 1-1000) */
  pageSize?: number;
  /** Search keyword (viewer nickname or phone) */
  keyword?: string;
  /** Filter by receive source - CHANNEL or AGGREGATE_PAGE */
  receiveSource?: 'CHANNEL' | 'AGGREGATE_PAGE';
}

/**
 * Paginated response for coupon viewer search
 */
export interface SearchCouponViewersResponse {
  /** List of coupon viewers */
  contents: CouponViewer[];
  /** Total number of items */
  total: number;
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
}

/**
 * Parameters for batch deleting coupons
 */
export interface DeleteCouponsBatchParams {
  /** Array of coupon IDs to delete (max 200) */
  couponIds: string[];
}

/**
 * Parameters for batch updating coupon status
 */
export interface UpdateCouponsStatusBatchParams {
  /** Array of coupon IDs to update status (max 200) */
  couponIds: string[];
}
