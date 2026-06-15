/**
 * Other Service
 *
 * Service for managing PolyV miscellaneous operations.
 * Contains various APIs that don't fit into other service categories.
 *
 * Coverage:
 * - Root APIs: registerUser, createTencentOrder
 * - Channel APIs: resetCcbFocus, listTencentStreamInfo, checkChannelStatusValid
 * - Statistics APIs: getInviterPosterList
 * - Chat APIs: getGroupLoginTimes, emitByUserId
 * - Group APIs: healthCheck, createIsolation, createIsolationZone, getPackageValidityList, updatePackageValidity, resetAppSecret
 * - Isolation APIs: getIsolationBillingList, getIsolationList
 *
 * @module services/other
 */

import type { PolyVClient } from '../client.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';

// ============================================
// Type Definitions
// ============================================

/**
 * User registration parameters
 */
export interface RegisterUserParams {
  /** Company name */
  company: string;
  /** Mobile number */
  mobile: number;
  /** Contact person name */
  contact: string;
  /** Email address */
  email: string;
}

/**
 * User registration response
 */
export interface RegisterUserResponse {
  /** User ID */
  userId: string;
  /** Password */
  password: string;
  /** App ID */
  appId: string;
  /** App Secret */
  appSecret: string;
}

/**
 * Basic service configuration for Tencent order
 */
export interface TencentBasicService {
  /** Service type: standard, enterprise, flagship */
  type: 'standard' | 'enterprise' | 'flagship';
  /** Number of services */
  number: number;
}

/**
 * Premium service configuration for Tencent order
 */
export interface TencentPremiumService {
  /** Service type */
  type: string;
  /** Number of services */
  number: number;
}

/**
 * Tencent order creation parameters
 */
export interface CreateTencentOrderParams {
  /** Tencent UIN */
  UIN: string;
  /** Order ID */
  orderId: string;
  /** Email address */
  email: string;
  /** Mobile number */
  mobile: string;
  /** Contact person name */
  contact?: string;
  /** Basic service configuration */
  basicService?: TencentBasicService;
  /** Premium service configuration array */
  premiumService?: TencentPremiumService[];
}

/**
 * Reset CCB focus parameters
 */
export interface ResetCcbFocusParams {
  /** Comma-separated channel IDs */
  channelIds?: string;
}

/**
 * Inviter poster item
 */
export interface InviterPosterItem {
  /** WeChat Open ID */
  openId: string;
  /** Viewer ID */
  viewerId: string;
  /** Nickname */
  nickname: string;
  /** Created time (timestamp) */
  createdTime: number;
  /** Receiver WeChat Open ID */
  receiverOpenId: string;
  /** Receiver viewer ID */
  receiverViewerId: string;
  /** Receiver nickname */
  receiverNickname: string;
  /** Receiver time (timestamp) */
  receiverTime: number;
  /** Custom parameter 4 */
  param4: string;
  /** Custom parameter 5 */
  param5: string;
}

/**
 * Get inviter poster list parameters
 */
export interface GetInviterPosterListParams {
  /** Channel ID */
  channelId: string;
  /** Page number (default: 1) */
  pageNumber?: number;
  /** Page size (default: 10) */
  pageSize?: number;
  /** Start time (timestamp) */
  startTime?: number;
  /** End time (timestamp) */
  endTime?: number;
}

/**
 * Inviter poster list response
 */
export interface GetInviterPosterListResponse {
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Contents array */
  contents: InviterPosterItem[];
}

/**
 * Tencent stream info item
 */
export interface TencentStreamInfoItem {
  /** Stream URL */
  streamUrl: string;
  /** Bit rate */
  bitRate: string;
  /** Audio frame rate */
  audioFrameRate: string;
  /** Video frame rate */
  videoFrameRate: string;
  /** Time */
  time: string;
  /** Timestamp (optional) */
  timestamp?: string | null;
}

/**
 * List Tencent stream info parameters
 */
export interface ListTencentStreamInfoParams {
  /** Channel ID */
  channelId: string;
  /** Start time */
  startTime?: string;
  /** End time */
  endTime?: string;
}

/**
 * Group login times item
 */
export interface GroupLoginTimesItem {
  /** Group ID */
  id: string;
  /** Group name */
  name: string;
  /** Total login times */
  total: number;
}

/**
 * Get group login times parameters
 */
export interface GetGroupLoginTimesParams {
  /** Channel ID */
  channelId: string;
}

/**
 * Emit by user ID parameters
 */
export interface EmitByUserIdParams {
  /** Room ID (channel ID) */
  roomId: string;
  /** User IDs array (max 2000) */
  userIds: string[];
  /** Payload message */
  payload: string;
}

/**
 * Check channel status valid response
 */
export interface CheckChannelStatusValidResponse {
  /** Valid channel IDs */
  validChannels: string[];
  /** Invalid channel IDs */
  invalidChannels: string[];
}

/**
 * Check channel status valid parameters
 */
export interface CheckChannelStatusValidParams {
  /** Comma-separated channel IDs (max 100) */
  channels: string;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  /** Health status */
  status: string;
  /** Timestamp (optional) */
  timestamp?: number;
}

/**
 * Create isolation (sub-account) parameters
 */
export interface CreateIsolationParams {
  /** Email address */
  email: string;
  /** Password (8-32 chars, must contain letters and numbers) */
  password: string;
  /** Contact person name */
  contacts?: string;
  /** Phone number */
  phone?: string;
  /** Max channels allowed */
  maxChannels?: number;
  /** Minutes allocated */
  minutes?: number;
  /** Memo/notes */
  memo?: string;
  /** Expire type: group or custom */
  expireType?: 'group' | 'custom';
  /** Expire date (if expireType is custom) */
  expireDate?: number;
}

/**
 * Create isolation response
 */
export interface CreateIsolationResponse {
  /** User ID */
  userId: string;
  /** Email address */
  email: string;
}

/**
 * Create isolation zone parameters
 */
export interface CreateIsolationZoneParams {
  /** User ID */
  userId: string;
}

/**
 * Create isolation zone response
 */
export interface CreateIsolationZoneResponse {
  /** Isolation ID */
  isolationId: string;
  /** User ID */
  userId: string;
}

/**
 * Sub-account resource item
 */
export interface PackageValidityItem {
  /** Email address */
  email: string;
  /** Concurrent streams */
  concurrent: number;
  /** Minutes allocated */
  minutes: number;
  /** Remaining flow */
  remainFlow: number;
  /** Remaining space */
  remainSpace: number;
}

/**
 * Get package validity list parameters
 */
export interface GetPackageValidityListParams {
  /** Comma-separated email addresses */
  emails?: string;
  /** Page number (default: 1) */
  pageNumber?: number;
  /** Page size (default: 10) */
  pageSize?: number;
}

/**
 * Package validity list response
 */
export interface GetPackageValidityListResponse {
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Contents array */
  contents: PackageValidityItem[];
}

/**
 * Update package validity parameters
 */
export interface UpdatePackageValidityParams {
  /** Email address */
  email: string;
  /** Balance */
  balance?: number;
  /** Concurrent streams */
  concurrent?: number;
  /** Concurrent activate date (timestamp) */
  concurrentActivateDate?: number;
  /** Concurrent end date (timestamp) */
  concurrentEndDate?: number;
  /** Minutes allocated */
  minutes?: number;
  /** Minutes activate date (timestamp) */
  minutesActivateDate?: number;
  /** Minutes end date (timestamp) */
  minutesEndDate?: number;
  /** Remaining flow */
  remainFlow?: number;
  /** Remaining flow activate date (timestamp) */
  remainFlowActivateDate?: number;
  /** Remaining flow end date (timestamp) */
  remainFlowEndDate?: number;
  /** Remaining space */
  remainSpace?: number;
  /** Remaining space activate date (timestamp) */
  remainSpaceActivateDate?: number;
  /** Remaining space end date (timestamp) */
  remainSpaceEndDate?: number;
}

/**
 * Reset app secret parameters
 */
export interface ResetAppSecretParams {
  /** Email address */
  email: string;
}

/**
 * Reset app secret response
 */
export interface ResetAppSecretResponse {
  /** New app secret */
  appSecret: string;
}

/**
 * Isolation billing item
 */
export interface IsolationBillingItem {
  /** Billing date (yyyyMM format) */
  billingDate: string;
  /** Amount */
  amount: number;
}

/**
 * Get isolation billing list parameters
 */
export interface GetIsolationBillingListParams {
  /** Billing date (yyyyMM format, >= 202204) */
  billingDate: string;
  /** Isolation ID */
  isolationId: string;
  /** Page number (default: 1) */
  pageNumber?: number;
  /** Page size (default: 10) */
  pageSize?: number;
}

/**
 * Isolation billing list response
 */
export interface GetIsolationBillingListResponse {
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Contents array */
  contents: IsolationBillingItem[];
}

/**
 * Isolation account item
 */
export interface IsolationAccountItem {
  /** User ID */
  userId: string;
  /** Email address */
  email: string;
  /** Account status */
  status?: string;
}

/**
 * Get isolation list parameters
 */
export interface GetIsolationListParams {
  /** Isolation ID */
  isolationId: string;
}

/**
 * OtherService
 *
 * Provides methods to interact with PolyV miscellaneous APIs.
 *
 * @example
 * ```typescript
 * const client = new PolyVClient({ appId: 'xxx', appSecret: 'yyy' });
 * const result = await client.other.registerUser({...});
 * ```
 */
export class OtherService {
  private client: PolyVClient;

  /**
   * Create a new OtherService instance
   *
   * @param client - The PolyVClient instance to use for API calls
   */
  constructor(client: PolyVClient) {
    this.client = client;
  }

  // ============================================
  // Root APIs
  // ============================================

  /**
   * Register a new PolyV user
   * Creates a new PolyV account
   *
   * @param params - Registration parameters
   * @returns User credentials including userId, password, appId, appSecret
   *
   * @example
   * ```typescript
   * const result = await client.other.registerUser({
   *   company: 'Test Company',
   *   mobile: 17600000000,
   *   contact: 'Test Contact',
   *   email: 'test@polyv.net',
   * });
   * ```
   */
  async registerUser(params: RegisterUserParams): Promise<RegisterUserResponse> {
    // Validate required fields
    if (!params.company) {
      throw new PolyVValidationError('company is required');
    }
    if (!params.email) {
      throw new PolyVValidationError('email is required');
    }
    if (typeof params.mobile !== 'number') {
      throw new PolyVValidationError('mobile must be a number');
    }

    const response = await this.client.httpClient.post<RegisterUserResponse>(
      '/live/v4/root/user/register',
      params
    );
    return response as unknown as RegisterUserResponse;
  }

  /**
   * Create a Tencent enterprise order
   * Creates an order for Tencent enterprise services
   *
   * @param params - Order parameters
   * @returns true on success
   *
   * @example
   * ```typescript
   * const result = await client.other.createTencentOrder({
   *   UIN: 'test-uin',
   *   orderId: 'test-order-id',
   *   email: 'admin@polyv.net',
   *   mobile: '18888888888',
   * });
   * ```
   */
  async createTencentOrder(params: CreateTencentOrderParams): Promise<boolean> {
    // Validate required fields
    if (!params.UIN) {
      throw new PolyVValidationError('UIN is required');
    }
    if (!params.orderId) {
      throw new PolyVValidationError('orderId is required');
    }

    const response = await this.client.httpClient.post<boolean>(
      '/live/v4/root/order/create',
      params
    );
    return response as unknown as boolean;
  }

  // ============================================
  // Channel APIs
  // ============================================

  /**
   * Reset CCB focus channel list
   * Sets or clears the focus live list for CCB
   *
   * @param params - Parameters including channelIds (optional)
   * @returns null on success
   *
   * @example
   * ```typescript
   * const result = await client.other.resetCcbFocus({
   *   channelIds: '2731380,2750506,2737621,365032',
   * });
   * ```
   */
  async resetCcbFocus(params: ResetCcbFocusParams): Promise<null> {
    const response = await this.client.httpClient.post<null>(
      '/live/v4/channel/ccb/focus/reset',
      params
    );
    return response as unknown as null;
  }

  /**
   * List Tencent stream info
   * Gets stream information for a channel
   *
   * @param params - Parameters including channelId (required)
   * @returns Array of stream info objects
   *
   * @example
   * ```typescript
   * const result = await client.other.listTencentStreamInfo({
   *   channelId: '3880533',
   * });
   * ```
   */
  async listTencentStreamInfo(params: ListTencentStreamInfoParams): Promise<TencentStreamInfoItem[]> {
    // Validate required fields
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }

    const response = await this.client.httpClient.get<TencentStreamInfoItem[]>(
      '/live/v3/channel/monitor/list-tencent-stream-info',
      { params }
    );
    return response as unknown as TencentStreamInfoItem[];
  }

  /**
   * Check channel status valid
   * Validates the status of multiple channels
   *
   * @param params - Parameters including channels (comma-separated, max 100)
   * @returns Object with validChannels and invalidChannels arrays
   *
   * @example
   * ```typescript
   * const result = await client.other.checkChannelStatusValid({
   *   channels: '1965681,2272665,3297504',
   * });
   * ```
   */
  async checkChannelStatusValid(params: CheckChannelStatusValidParams): Promise<CheckChannelStatusValidResponse> {
    // Validate required fields
    if (!params.channels) {
      throw new PolyVValidationError('channels is required');
    }

    // Validate max 100 channels
    const channelCount = params.channels.split(',').length;
    if (channelCount > 100) {
      throw new PolyVValidationError('channels cannot exceed 100');
    }

    const response = await this.client.httpClient.get<CheckChannelStatusValidResponse>(
      '/live/v4/channel/status-valid',
      { params }
    );
    return response as unknown as CheckChannelStatusValidResponse;
  }

  // ============================================
  // Statistics APIs
  // ============================================

  /**
   * Get inviter poster list
   * Gets a paginated list of inviter poster records
   *
   * @param params - Parameters including channelId (required)
   * @returns Paginated response with inviter poster records
   *
   * @example
   * ```typescript
   * const result = await client.other.getInviterPosterList({
   *   channelId: '2731380',
   *   pageNumber: 1,
   *   pageSize: 10,
   * });
   * ```
   */
  async getInviterPosterList(params: GetInviterPosterListParams): Promise<GetInviterPosterListResponse> {
    // Validate required fields
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }

    const response = await this.client.httpClient.get<GetInviterPosterListResponse>(
      '/live/v4/statistics/inviter-poster/list',
      { params }
    );
    return response as unknown as GetInviterPosterListResponse;
  }

  // ============================================
  // Chat APIs
  // ============================================

  /**
   * Get group login times
   * Gets login statistics by group for a channel
   *
   * @param params - Parameters including channelId (required)
   * @returns Array of group login statistics
   *
   * @example
   * ```typescript
   * const result = await client.other.getGroupLoginTimes({
   *   channelId: '1965681',
   * });
   * ```
   */
  async getGroupLoginTimes(params: GetGroupLoginTimesParams): Promise<GroupLoginTimesItem[]> {
    // Validate required fields
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }

    const response = await this.client.httpClient.get<GroupLoginTimesItem[]>(
      '/live/v4/chat/get-group-login-times',
      { params }
    );
    return response as unknown as GroupLoginTimesItem[];
  }

  /**
   * Emit message by user ID
   * Broadcasts a message to specific users in a room
   *
   * @param params - Parameters including roomId, userIds (max 2000), and payload
   * @returns Empty object on success
   *
   * @example
   * ```typescript
   * const result = await client.other.emitByUserId({
   *   roomId: '123456',
   *   userIds: ['user1', 'user2', 'user3'],
   *   payload: 'Hello everyone!',
   * });
   * ```
   */
  async emitByUserId(params: EmitByUserIdParams): Promise<Record<string, never>> {
    // Validate required fields
    if (!params.roomId) {
      throw new PolyVValidationError('roomId is required');
    }
    if (!params.userIds) {
      throw new PolyVValidationError('userIds is required');
    }
    if (!Array.isArray(params.userIds)) {
      throw new PolyVValidationError('userIds must be an array');
    }
    if (params.userIds.length === 0) {
      throw new PolyVValidationError('userIds cannot be empty');
    }
    if (params.userIds.length > 2000) {
      throw new PolyVValidationError('userIds cannot exceed 2000');
    }
    if (!params.payload) {
      throw new PolyVValidationError('payload is required');
    }

    const response = await this.client.httpClient.post<Record<string, never>>(
      '/live/v5/chat/redirect/channel/emit-by-userId/post',
      params
    );
    return response as unknown as Record<string, never>;
  }

  // ============================================
  // Group APIs
  // ============================================

  /**
   * Health check
   * Checks the health status of the group service
   *
   * @returns Health status object
   *
   * @example
   * ```typescript
   * const result = await client.other.healthCheck();
   * ```
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await this.client.httpClient.get<HealthCheckResponse>(
      '/live/v4/group/health-check'
    );
    return response as unknown as HealthCheckResponse;
  }

  /**
   * Create isolation (sub-account)
   * Creates a sub-account under the group
   *
   * @param params - Parameters including email and password (required)
   * @returns Created user information
   *
   * @example
   * ```typescript
   * const result = await client.other.createIsolation({
   *   email: 'subaccount@polyv.net',
   *   password: 'Test123456',
   * });
   * ```
   */
  async createIsolation(params: CreateIsolationParams): Promise<CreateIsolationResponse> {
    // Validate required fields
    if (!params.email) {
      throw new PolyVValidationError('email is required');
    }
    if (!params.password) {
      throw new PolyVValidationError('password is required');
    }

    // Validate password format (8-32 chars, must contain letters and numbers)
    if (params.password.length < 8 || params.password.length > 32) {
      throw new PolyVValidationError('password must be 8-32 characters');
    }
    if (!/[a-zA-Z]/.test(params.password) || !/[0-9]/.test(params.password)) {
      throw new PolyVValidationError('password must contain both letters and numbers');
    }

    const response = await this.client.httpClient.post<CreateIsolationResponse>(
      '/live/v4/group/user/isolation/create',
      params
    );
    return response as unknown as CreateIsolationResponse;
  }

  /**
   * Create isolation zone
   * Creates an isolation zone for a user
   *
   * @param params - Parameters including userId (required)
   * @returns Created isolation zone information
   *
   * @example
   * ```typescript
   * const result = await client.other.createIsolationZone({
   *   userId: 'user-123',
   * });
   * ```
   */
  async createIsolationZone(params: CreateIsolationZoneParams): Promise<CreateIsolationZoneResponse> {
    // Validate required fields
    if (!params.userId) {
      throw new PolyVValidationError('userId is required');
    }

    const response = await this.client.httpClient.post<CreateIsolationZoneResponse>(
      '/live/v4/group/isolation-zone/create',
      params
    );
    return response as unknown as CreateIsolationZoneResponse;
  }

  /**
   * Get package validity list
   * Gets sub-account resource allocation list
   *
   * @param params - Optional filter parameters
   * @returns Paginated list of sub-account resources
   *
   * @example
   * ```typescript
   * const result = await client.other.getPackageValidityList({
   *   emails: 'subaccount@polyv.net',
   * });
   * ```
   */
  async getPackageValidityList(params?: GetPackageValidityListParams): Promise<GetPackageValidityListResponse> {
    const response = await this.client.httpClient.get<GetPackageValidityListResponse>(
      '/live/v4/group/user/package-validity/list',
      { params }
    );
    return response as unknown as GetPackageValidityListResponse;
  }

  /**
   * Update package validity
   * Allocates resources to a sub-account
   *
   * @param params - Parameters including email (required) and resource allocations
   * @returns true on success
   *
   * @example
   * ```typescript
   * const result = await client.other.updatePackageValidity({
   *   email: 'subaccount@polyv.net',
   *   concurrent: 100,
   *   minutes: 1000,
   * });
   * ```
   */
  async updatePackageValidity(params: UpdatePackageValidityParams): Promise<boolean> {
    // Validate required fields
    if (!params.email) {
      throw new PolyVValidationError('email is required');
    }

    const response = await this.client.httpClient.post<boolean>(
      '/live/v4/group/user/package-validity/update',
      params
    );
    return response as unknown as boolean;
  }

  /**
   * Reset app secret
   * Resets the app secret for a sub-account
   *
   * @param params - Parameters including email (required)
   * @returns New app secret
   *
   * @example
   * ```typescript
   * const result = await client.other.resetAppSecret({
   *   email: 'subaccount@polyv.net',
   * });
   * ```
   */
  async resetAppSecret(params: ResetAppSecretParams): Promise<ResetAppSecretResponse> {
    // Validate required fields
    if (!params.email) {
      throw new PolyVValidationError('email is required');
    }

    const response = await this.client.httpClient.post<ResetAppSecretResponse>(
      '/live/v4/group/user/secret/reset',
      params
    );
    return response as unknown as ResetAppSecretResponse;
  }

  // ============================================
  // Isolation APIs
  // ============================================

  /**
   * Get isolation billing list
   * Gets billing records for an isolation zone
   *
   * @param params - Parameters including billingDate and isolationId (required)
   * @returns Paginated list of billing records
   *
   * @example
   * ```typescript
   * const result = await client.other.getIsolationBillingList({
   *   billingDate: '202205',
   *   isolationId: 'isolation-123',
   * });
   * ```
   */
  async getIsolationBillingList(params: GetIsolationBillingListParams): Promise<GetIsolationBillingListResponse> {
    // Validate required fields
    if (!params.billingDate) {
      throw new PolyVValidationError('billingDate is required');
    }
    if (!params.isolationId) {
      throw new PolyVValidationError('isolationId is required');
    }

    // Validate billingDate format (yyyyMM, >= 202204)
    if (!/^\d{6}$/.test(params.billingDate)) {
      throw new PolyVValidationError('billingDate must be in yyyyMM format');
    }
    const yearMonth = parseInt(params.billingDate, 10);
    if (yearMonth < 202204) {
      throw new PolyVValidationError('billingDate must be >= 202204');
    }

    const response = await this.client.httpClient.get<GetIsolationBillingListResponse>(
      '/live/v4/group/isolation/billing/list',
      { params }
    );
    return response as unknown as GetIsolationBillingListResponse;
  }

  /**
   * Get isolation list
   * Gets the account list for an isolation zone
   *
   * @param params - Parameters including isolationId (required)
   * @returns Array of accounts in the isolation zone
   *
   * @example
   * ```typescript
   * const result = await client.other.getIsolationList({
   *   isolationId: 'isolation-123',
   * });
   * ```
   */
  async getIsolationList(params: GetIsolationListParams): Promise<IsolationAccountItem[]> {
    // Validate required fields
    if (!params.isolationId) {
      throw new PolyVValidationError('isolationId is required');
    }

    const response = await this.client.httpClient.get<IsolationAccountItem[]>(
      '/live/v4/group/isolation/list',
      { params }
    );
    return response as unknown as IsolationAccountItem[];
  }
}
