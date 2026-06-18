/**
 * V4 Group Service
 *
 * Service for managing PolyV V4 Group operations.
 * Provides methods for group user management, package allocation, and billing.
 *
 * @module services/v4/group
 */

import type { PolyVClient } from '../../client.js';
import { PolyVValidationError } from '../../errors/polyv-validation-error.js';
import type {
  CreateGroupUserParams,
  CreateGroupUserResponse,
  ListGroupUserPackagesParams,
  ListGroupUserPackagesResponse,
  UpdateGroupUserPackageParams,
  ListBillingDailyParams,
  ListBillingDailyResponse,
  ListGroupUserBillingDailyParams,
  ListGroupUserBillingDailyResponse,
  ListAllocationLogsParams,
  ListAllocationLogsResponse,
} from '../../types/v4-group.js';

/**
 * V4 Group Service
 *
 * Provides methods for managing group users, packages, and billing.
 */
export class V4GroupService {
  private client: PolyVClient;

  constructor(client: PolyVClient) {
    this.client = client;
  }

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
   * Validate email format
   */
  private validateEmail(email: string, fieldName: string = 'email'): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new PolyVValidationError(`Invalid email format for ${fieldName}`, fieldName);
    }
  }

  /**
   * Validate billingDate format (yyyyMM)
   */
  private validateBillingDate(billingDate: string): void {
    const dateRegex = /^\d{6}$/;
    if (!dateRegex.test(billingDate)) {
      throw new PolyVValidationError('billingDate must be in yyyyMM format (e.g., 202603)', 'billingDate');
    }
  }

  /**
   * Validate group billing period in yyyyMM format and minimum range
   */
  private validateGroupBillingPeriod(value: string, fieldName: string): void {
    const dateRegex = /^\d{6}$/;
    if (!dateRegex.test(value)) {
      throw new PolyVValidationError(`${fieldName} must be in yyyyMM format (e.g., 202205)`, fieldName);
    }
    if (Number(value) < 202204) {
      throw new PolyVValidationError(`${fieldName} must be 202204 or later`, fieldName);
    }
  }

  /**
   * Validate createGroupUser params
   */
  private validateCreateGroupUserParams(params: CreateGroupUserParams): void {
    // Email: required, valid format
    if (!params.email) {
      throw new PolyVValidationError('email is required', 'email');
    }
    this.validateEmail(params.email, 'email');

    // Password: required, 8-32 chars with numbers and letters
    if (!params.password) {
      throw new PolyVValidationError('password is required', 'password');
    }
    if (params.password.length < 8 || params.password.length > 32) {
      throw new PolyVValidationError('password must be 8-32 characters', 'password');
    }
    if (!/[a-zA-Z]/.test(params.password) || !/\d/.test(params.password)) {
      throw new PolyVValidationError('password must contain both letters and numbers', 'password');
    }

    // Contacts: required
    if (!params.contacts) {
      throw new PolyVValidationError('contacts is required', 'contacts');
    }

    // Phone: required
    if (!params.phone) {
      throw new PolyVValidationError('phone is required', 'phone');
    }

    // MaxChannels: required, >= 0
    if (params.maxChannels === undefined || params.maxChannels === null) {
      throw new PolyVValidationError('maxChannels is required', 'maxChannels');
    }
    if (params.maxChannels < 0) {
      throw new PolyVValidationError('maxChannels must be >= 0', 'maxChannels');
    }
  }

  // ============================================
  // AC3: User Management APIs
  // ============================================

  /**
   * Create a group sub-account
   *
   * Create a new sub-account under the main account.
   * Note: Account creation is async, wait 1-3s before querying.
   *
   * @param params - Create group user params
   * @returns Promise resolving to created account info
   *
   * @example
   * ```typescript
   * const result = await client.v4Group.createGroupUser({
   *   email: 'sub@example.com',
   *   password: 'Password123',
   *   contacts: 'John Doe',
   *   phone: '13800138000',
   *   maxChannels: 10
   * });
   * console.log(result.appId, result.appSecret);
   * ```
   */
  async createGroupUser(params: CreateGroupUserParams): Promise<CreateGroupUserResponse> {
    this.validateCreateGroupUserParams(params);
    const response = await this.client.httpClient.post<CreateGroupUserResponse>(
      '/live/v4/group/user/create',
      params
    );
    return response as unknown as CreateGroupUserResponse;
  }

  /**
   * List group sub-accounts and their packages
   *
   * Get a paginated list of sub-accounts with their resource allocation.
   *
   * @param params - List params with optional email filter and pagination
   * @returns Promise resolving to paginated list of group user packages
   *
   * @example
   * ```typescript
   * const result = await client.v4Group.listGroupUserPackages({
   *   pageNumber: 1,
   *   pageSize: 10
   * });
   * console.log(result.contents[0].email, result.contents[0].remainMinutes);
   * ```
   */
  async listGroupUserPackages(params: ListGroupUserPackagesParams = {}): Promise<ListGroupUserPackagesResponse> {
    this.validatePagination(params.pageNumber, params.pageSize);

    const response = await this.client.httpClient.get<ListGroupUserPackagesResponse>(
      '/live/v4/group/user/package/list',
      { params }
    );
    return response as unknown as ListGroupUserPackagesResponse;
  }

  // ============================================
  // AC4: Package Management APIs
  // ============================================

  /**
   * Update/allocate group sub-account resources
   *
   * Update resource allocation for a sub-account.
   *
   * @param params - Update package params with email and resources to add/set
   * @returns Promise resolving to boolean success
   *
   * @example
   * ```typescript
   * await client.v4Group.updateGroupUserPackage({
   *   email: 'sub@example.com',
   *   minutes: 1000,
   *   concurrent: 50
   * });
   * ```
   */
  async updateGroupUserPackage(params: UpdateGroupUserPackageParams): Promise<boolean> {
    if (!params.email) {
      throw new PolyVValidationError('email is required', 'email');
    }
    this.validateEmail(params.email, 'email');
    const response = await this.client.httpClient.post<boolean>(
      '/live/v4/group/user/package/update',
      params
    );
    return response as unknown as boolean;
  }

  // ============================================
  // AC5: Billing APIs
  // ============================================

  /**
   * List main account billing statistics
   *
   * Get daily billing statistics for the main account.
   *
   * @param params - List params with billingDate (yyyyMM format) and pagination
   * @returns Promise resolving to paginated list of billing daily items
   *
   * @example
   * ```typescript
   * const result = await client.v4Group.listBillingDaily({
   *   billingDate: '202603',
   *   pageNumber: 1,
   *   pageSize: 30
   * });
   * console.log(result.contents[0].billAmount);
   * ```
   */
  async listBillingDaily(params: ListBillingDailyParams): Promise<ListBillingDailyResponse> {
    this.validatePagination(params.pageNumber, params.pageSize);
    this.validateBillingDate(params.billingDate);

    const response = await this.client.httpClient.get<ListBillingDailyResponse>(
      '/live/v4/group/account/billing-daily/list',
      { params }
    );
    return response as unknown as ListBillingDailyResponse;
  }

  /**
   * List group sub-account billing statistics
   *
   * Get daily billing statistics for sub-accounts in a billing period range.
   *
   * @param params - List params with startDate/endDate in yyyyMM format
   * @returns Promise resolving to paginated list of sub-account billing items
   */
  async listGroupUserBillingDaily(
    params: ListGroupUserBillingDailyParams
  ): Promise<ListGroupUserBillingDailyResponse> {
    this.validatePagination(params.pageNumber, params.pageSize);
    this.validateGroupBillingPeriod(params.startDate, 'startDate');
    this.validateGroupBillingPeriod(params.endDate, 'endDate');
    if (Number(params.startDate) > Number(params.endDate)) {
      throw new PolyVValidationError('startDate must be earlier than or equal to endDate', 'startDate');
    }
    if (params.email !== undefined) {
      this.validateEmail(params.email, 'email');
    }

    const response = await this.client.httpClient.get<ListGroupUserBillingDailyResponse>(
      '/live/v4/group/user/billing-daily/list',
      { params }
    );
    return response as unknown as ListGroupUserBillingDailyResponse;
  }

  /**
   * List allocation records
   *
   * Get allocation records for specified sub-accounts.
   *
   * @param params - List params with emails (required) and optional filters
   * @returns Promise resolving to paginated list of allocation log items
   *
   * @example
   * ```typescript
   * const result = await client.v4Group.listAllocationLogs({
   *   emails: 'sub1@example.com,sub2@example.com',
   *   pageNumber: 1,
   *   pageSize: 20
   * });
   * console.log(result.contents[0].amount, result.contents[0].resourceCode);
   * ```
   */
  async listAllocationLogs(params: ListAllocationLogsParams): Promise<ListAllocationLogsResponse> {
    this.validatePagination(params.pageNumber, params.pageSize);
    if (!params.emails) {
      throw new PolyVValidationError('emails is required', 'emails');
    }

    const response = await this.client.httpClient.get<ListAllocationLogsResponse>(
      '/live/v4/group/account/allocation-log/list',
      { params }
    );
    return response as unknown as ListAllocationLogsResponse;
  }
}
