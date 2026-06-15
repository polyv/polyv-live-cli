/**
 * Group Service
 *
 * Service for managing PolyV Group Account operations (v2 API).
 * Provides methods for resource allocation to sub-accounts including:
 * - Live streaming concurrency and duration
 * - VOD flow and storage space
 * - Allocation record queries
 *
 * @module services/group
 */

import type { PolyVClient } from '../client.js';
import type {
  ListAllocateLogParams,
  ListAllocateLogResponse,
  SetConcurrencesParams,
  SetFlowParams,
  SetLiveDurationsParams,
  SetSpaceParams,
} from '../types/group.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';

/**
 * GroupService
 *
 * Provides methods to interact with PolyV Group Account APIs (v2).
 * Used for managing sub-account resource allocation.
 *
 * @example
 * ```typescript
 * const client = new PolyVClient({ appId: 'xxx', appSecret: 'yyy' });
 *
 * // Allocate live concurrency to sub-account
 * await client.group.setConcurrences({
 *   email: 'sub@polyv.com',
 *   concurrences: 100,
 *   type: 'add'
 * });
 *
 * // Query allocation records
 * const logs = await client.group.listAllocateLog({
 *   emails: 'sub@polyv.com'
 * });
 * ```
 */
export class GroupService {
  private client: PolyVClient;

  /**
   * Create a new GroupService instance
   *
   * @param client - The PolyVClient instance to use for API calls
   */
  constructor(client: PolyVClient) {
    this.client = client;
  }

  // ============================================
  // AC1: Allocation Records API
  // ============================================

  /**
   * List allocation records for sub-accounts
   * Query allocation history for one or more sub-accounts
   *
   * @param params - Query parameters including emails (required)
   * @returns Paginated list of allocation records
   *
   * @example
   * ```typescript
   * const logs = await client.group.listAllocateLog({
   *   emails: 'sub@polyv.com',
   *   type: 'live',
   *   page: 1,
   *   pageSize: 20
   * });
   * ```
   */
  async listAllocateLog(params: ListAllocateLogParams): Promise<ListAllocateLogResponse> {
    // Validate required params
    this.validateEmails(params.emails);

    // Validate pagination
    this.validatePagination(params);

    // Validate type if provided
    if (params.type !== undefined) {
      this.validateAllocateLogType(params.type);
    }

    const apiParams: Record<string, unknown> = {
      emails: params.emails,
    };

    if (params.type !== undefined) {
      apiParams.type = params.type;
    }
    if (params.startTime !== undefined) {
      apiParams.startTime = params.startTime;
    }
    if (params.endTime !== undefined) {
      apiParams.endTime = params.endTime;
    }
    if (params.page !== undefined) {
      apiParams.page = params.page;
    }
    if (params.pageSize !== undefined) {
      apiParams.pageSize = params.pageSize;
    }

    const response = await this.client.httpClient.get<ListAllocateLogResponse>(
      '/v2/group/account/list-allocate-log',
      { params: apiParams }
    );
    return response as unknown as ListAllocateLogResponse;
  }

  // ============================================
  // AC2: Live Concurrency API
  // ============================================

  /**
   * Set live concurrency for a sub-account
   * Allocate or recover live streaming concurrency
   *
   * @param params - Parameters including email (required) and concurrences (required)
   * @returns "success" on successful allocation
   *
   * @example
   * ```typescript
   * // Add concurrency
   * await client.group.setConcurrences({
   *   email: 'sub@polyv.com',
   *   concurrences: 100,
   *   type: 'add'
   * });
   *
   * // Recover concurrency
   * await client.group.setConcurrences({
   *   email: 'sub@polyv.com',
   *   concurrences: 50,
   *   type: 'recover'
   * });
   * ```
   */
  async setConcurrences(params: SetConcurrencesParams): Promise<string> {
    // Validate required params
    this.validateEmail(params.email);

    // Validate type if provided
    if (params.type !== undefined) {
      this.validateAllocationType(params.type);
    }

    // Validate concurrences
    this.validatePositiveInteger(params.concurrences, 'concurrences');

    const body: Record<string, unknown> = {
      email: params.email,
      concurrences: params.concurrences,
    };

    if (params.type !== undefined) {
      body.type = params.type;
    }

    const response = await this.client.httpClient.post<string>(
      '/v2/group/live/set-concurrences',
      body
    );
    return response as unknown as string;
  }

  // ============================================
  // AC3: VOD Flow API
  // ============================================

  /**
   * Set VOD flow for a sub-account
   * Allocate or recover VOD flow/bandwidth
   *
   * @param params - Parameters including email (required)
   * @returns "success" on successful allocation
   *
   * @example
   * ```typescript
   * // Add flow
   * await client.group.setFlow({
   *   email: 'sub@polyv.com',
   *   type: 'add'
   * });
   *
   * // Recover all flow
   * await client.group.setFlow({
   *   email: 'sub@polyv.com',
   *   type: 'recover',
   *   all: 1
   * });
   * ```
   */
  async setFlow(params: SetFlowParams): Promise<string> {
    // Validate required params
    this.validateEmail(params.email);

    // Validate type if provided
    if (params.type !== undefined) {
      this.validateAllocationType(params.type);
    }

    // Validate all parameter
    if (params.all !== undefined) {
      this.validateAllParameter(params.all, params.type);
    }

    const body: Record<string, unknown> = {
      email: params.email,
    };

    if (params.type !== undefined) {
      body.type = params.type;
    }

    if (params.all !== undefined) {
      body.all = params.all;
    }

    const response = await this.client.httpClient.post<string>(
      '/v2/group/vod/set-flow',
      body
    );
    return response as unknown as string;
  }

  // ============================================
  // AC4: Live Durations API
  // ============================================

  /**
   * Set live duration for a sub-account
   * Allocate or recover live streaming minutes
   *
   * @param params - Parameters including email (required) and duration (required)
   * @returns "success" on successful allocation
   *
   * @example
   * ```typescript
   * // Add duration
   * await client.group.setLiveDurations({
   *   email: 'sub@polyv.com',
   *   duration: 1000,
   *   type: 'add'
   * });
   *
   * // Recover duration
   * await client.group.setLiveDurations({
   *   email: 'sub@polyv.com',
   *   duration: 500,
   *   type: 'recover'
   * });
   * ```
   */
  async setLiveDurations(params: SetLiveDurationsParams): Promise<string> {
    // Validate required params
    this.validateEmail(params.email);

    // Validate type if provided
    if (params.type !== undefined) {
      this.validateAllocationType(params.type);
    }

    // Validate duration is required and positive
    if (params.duration === undefined || params.duration === null) {
      throw new PolyVValidationError('duration is required');
    }
    this.validatePositiveInteger(params.duration, 'duration');

    const body: Record<string, unknown> = {
      email: params.email,
      duration: params.duration,
    };

    if (params.type !== undefined) {
      body.type = params.type;
    }

    const response = await this.client.httpClient.post<string>(
      '/v2/group/live/set-durations',
      body
    );
    return response as unknown as string;
  }

  // ============================================
  // AC5: VOD Space API
  // ============================================

  /**
   * Set VOD space for a sub-account
   * Allocate or recover VOD storage space (in GB)
   *
   * @param params - Parameters including email (required)
   * @returns "success" on successful allocation
   *
   * @example
   * ```typescript
   * // Add space
   * await client.group.setSpace({
   *   email: 'sub@polyv.com',
   *   space: 10,
   *   type: 'add'
   * });
   *
   * // Recover all space
   * await client.group.setSpace({
   *   email: 'sub@polyv.com',
   *   type: 'recover',
   *   all: 1
   * });
   * ```
   */
  async setSpace(params: SetSpaceParams): Promise<string> {
    // Validate required params
    this.validateEmail(params.email);

    // Validate type if provided
    if (params.type !== undefined) {
      this.validateAllocationType(params.type);
    }

    // Validate space if provided
    if (params.space !== undefined) {
      this.validatePositiveInteger(params.space, 'space');
    }

    // Validate all parameter
    if (params.all !== undefined) {
      this.validateAllParameter(params.all, params.type);
    }

    const body: Record<string, unknown> = {
      email: params.email,
    };

    if (params.type !== undefined) {
      body.type = params.type;
    }

    if (params.space !== undefined) {
      body.space = params.space;
    }

    if (params.all !== undefined) {
      body.all = params.all;
    }

    const response = await this.client.httpClient.post<string>(
      '/v2/group/vod/set-space',
      body
    );
    return response as unknown as string;
  }

  // ============================================
  // Private Validation Helpers
  // ============================================

  /**
   * Validate email (single)
   */
  private validateEmail(email: string): void {
    if (!email || email.trim() === '') {
      throw new PolyVValidationError('email is required');
    }
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new PolyVValidationError('email must be a valid email address');
    }
  }

  /**
   * Validate emails (comma-separated)
   */
  private validateEmails(emails: string): void {
    if (!emails || emails.trim() === '') {
      throw new PolyVValidationError('emails is required');
    }
  }

  /**
   * Validate allocation log type
   */
  private validateAllocateLogType(type: string): void {
    const validTypes = ['all', 'live', 'vod'];
    if (!validTypes.includes(type)) {
      throw new PolyVValidationError(`type must be one of: ${validTypes.join(', ')}`);
    }
  }

  /**
   * Validate allocation type (add/recover)
   */
  private validateAllocationType(type: string): void {
    const validTypes = ['add', 'recover'];
    if (!validTypes.includes(type)) {
      throw new PolyVValidationError(`type must be one of: ${validTypes.join(', ')}`);
    }
  }

  /**
   * Validate positive integer
   */
  private validatePositiveInteger(value: number, field: string): void {
    if (!Number.isInteger(value) || value <= 0) {
      throw new PolyVValidationError(`${field} must be a positive integer greater than 0`);
    }
  }

  /**
   * Validate all parameter (only valid with type=recover)
   */
  private validateAllParameter(all: number, type?: string): void {
    if (all === 1 && type !== 'recover') {
      throw new PolyVValidationError('all=1 is only valid when type=recover');
    }
  }

  /**
   * Validate pagination parameters
   */
  private validatePagination(params: { page?: number; pageSize?: number }): void {
    if (params.page !== undefined && params.page < 1) {
      throw new PolyVValidationError('page must be at least 1');
    }
    if (params.pageSize !== undefined) {
      if (params.pageSize < 1) {
        throw new PolyVValidationError('pageSize must be at least 1');
      }
      if (params.pageSize > 1000) {
        throw new PolyVValidationError('pageSize cannot exceed 1000');
      }
    }
  }
}
