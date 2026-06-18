/**
 * V4 Group Types
 *
 * Type definitions for V4 Group APIs.
 *
 * @module types/v4-group
 */

// ============================================
// Common Types
// ============================================

/**
 * Pagination parameters
 */
export interface GroupPaginationParams {
  /** Page number (>= 1) */
  pageNumber?: number;
  /** Page size (1-1000) */
  pageSize?: number;
}

/**
 * Paginated response
 */
export interface GroupPaginatedResponse<T> {
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Content list */
  contents: T[];
}

// ============================================
// AC3: Group User Types
// ============================================

/**
 * Group user package entity
 */
export interface GroupUserPackage {
  /** User ID */
  userId?: string;
  /** Sub-account appId */
  appId?: string;
  /** Sub-account secret */
  appSecret?: string;
  /** Sub-account email */
  email: string;
  /** Remaining balance */
  balance?: string;
  /** Charge type (minutes/parallelConcurrent/totalConcurrent) */
  chargeType?: string;
  /** Remaining concurrent */
  remainConcurrent?: number;
  /** Remaining minutes */
  remainMinutes?: number;
  /** Remaining VOD flow (GB) */
  remainFlow?: number;
  /** Remaining VOD space (GB) */
  remainSpace?: number;
  /** Link mic minutes */
  linkMicMinutes?: number;
  /** Guide minutes */
  guideMinutes?: number;
  /** Max channels */
  maxChannels?: number;
  /** Link mic limit */
  linkMicLimit?: number;
  /** Status (normal/expired/frozen) */
  status?: string;
}

/**
 * Parameters for creating a group user
 */
export interface CreateGroupUserParams {
  /** Sub-account email (required) */
  email: string;
  /** Password (required, 8-32 chars with numbers and letters) */
  password: string;
  /** Contact name (required) */
  contacts: string;
  /** Phone number (required, max 3 emails per phone) */
  phone: string;
  /** Max channels (required, >= 0) */
  maxChannels: number;
  /** Initial minutes */
  minutes?: number;
  /** Initial concurrent */
  concurrent?: number;
  /** Link mic minutes */
  linkMicMinutes?: number;
  /** Guide minutes */
  guideMinutes?: number;
  /** Link mic limit */
  linkMicLimit?: number;
}

/**
 * Response for creating a group user
 */
export interface CreateGroupUserResponse {
  /** Sub-account appId */
  appId: string;
  /** Sub-account secret */
  appSecret: string;
  /** User ID */
  userId: string;
}

/**
 * Parameters for listing group user packages
 */
export interface ListGroupUserPackagesParams extends GroupPaginationParams {
  /** Filter by emails (comma-separated) */
  emails?: string;
}

/**
 * Response for listing group user packages
 */
export interface ListGroupUserPackagesResponse extends GroupPaginatedResponse<GroupUserPackage> {}

// ============================================
// AC4: Package Management Types
// ============================================

/**
 * Parameters for updating group user package
 */
export interface UpdateGroupUserPackageParams {
  /** Sub-account email (required) */
  email: string;
  /** Add balance */
  balance?: number;
  /** Set concurrent */
  concurrent?: number;
  /** Add minutes */
  minutes?: number;
  /** Add link mic minutes */
  linkMicMinutes?: number;
  /** Add guide minutes */
  guideMinutes?: number;
  /** Set link mic limit */
  linkMicLimit?: number;
  /** Add VOD flow (GB) */
  flow?: number;
  /** Add VOD space (GB) */
  space?: number;
}

// ============================================
// AC5: Billing Types
// ============================================

/**
 * Billing daily item entity
 */
export interface BillingDailyItem {
  /** Date */
  date?: string;
  /** Channel ID */
  channelId?: string;
  /** Channel name */
  channelName?: string;
  /** Watch duration */
  watchDuration?: number;
  /** Unique viewers */
  uniqueViewer?: number;
  /** Video views */
  videoView?: number;
  /** Max concurrency */
  maxConcurrency?: number;
  /** Bill amount */
  billAmount?: number;
}

/**
 * Parameters for listing billing daily
 */
export interface ListBillingDailyParams extends GroupPaginationParams {
  /** Billing date (format yyyyMM, required) */
  billingDate: string;
}

/**
 * Response for listing billing daily
 */
export interface ListBillingDailyResponse extends GroupPaginatedResponse<BillingDailyItem> {}

/**
 * Group sub-account billing daily item entity
 */
export interface GroupUserBillingDailyItem {
  /** Group sub-account ID */
  unionId: string;
  /** Account period */
  accountPeriod: string;
  /** Sub-account email */
  email?: string | null;
  /** Memo */
  memo?: string | null;
  /** Product name */
  production: string;
  /** Usage category */
  category: string;
  /** Usage amount */
  itemConsumed: number;
  /** Usage unit */
  itemConsumedUnit: string;
  /** Settlement date */
  statAt: string;
  /** Trade type */
  tradeType: number;
}

/**
 * Parameters for listing group sub-account billing daily statistics
 */
export interface ListGroupUserBillingDailyParams extends GroupPaginationParams {
  /** Start billing period, format yyyyMM, must be 202204 or later */
  startDate: string;
  /** End billing period, format yyyyMM, must be 202204 or later */
  endDate: string;
  /** Optional sub-account email filter */
  email?: string;
}

/**
 * Response for listing group sub-account billing daily statistics
 */
export interface ListGroupUserBillingDailyResponse extends GroupPaginatedResponse<GroupUserBillingDailyItem> {}

/**
 * Allocation log item entity
 */
export interface AllocationLogItem {
  /** Log ID */
  id?: number;
  /** Sub-account email */
  email?: string;
  /** Resource code */
  resourceCode?: string;
  /** Alteration type */
  alterationType?: string;
  /** Amount */
  amount?: number;
  /** Balance after */
  balanceAfter?: number;
  /** Deposit time */
  depositTime?: number;
  /** Operator */
  operator?: string;
}

/**
 * Parameters for listing allocation logs
 */
export interface ListAllocationLogsParams extends GroupPaginationParams {
  /** Filter by emails (comma-separated, required) */
  emails: string;
  /** Deposit start time (timestamp) */
  depositStartTime?: number;
  /** Deposit end time (timestamp) */
  depositEndTime?: number;
  /** Resource code filter */
  resourceCode?: string;
  /** Alteration type filter */
  alterationType?: string;
}

/**
 * Response for listing allocation logs
 */
export interface ListAllocationLogsResponse extends GroupPaginatedResponse<AllocationLogItem> {}
