/**
 * Platform Service
 *
 * Service for managing PolyV platform-related operations.
 * Provides methods for anchor management and content groups.
 *
 * @module services/platform
 */

import type { PolyVClient } from '../client.js';
import type {
  CreateAnchorParams,
  AnchorDetail,
  ListAnchorsParams,
  ListAnchorsResponse,
  ListAnchorRelationsParams,
  AnchorRelationItem,
  UpdateAnchorParams,
  UpdateAnchorStatusParams,
  ContentGroupItem,
  SexType,
} from '../types/platform.js';
import type { PaginationResponse } from '../types/pagination.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';

/**
 * PlatformService
 *
 * Provides methods to interact with PolyV Platform APIs.
 *
 * @example
 * ```typescript
 * const client = new PolyVClient({ appId: 'xxx', appSecret: 'yyy' });
 * const anchorId = await client.platform.createAnchor({
 *   nickname: '主播1',
 *   sex: 'W',
 *   avatar: 'https://example.com/avatar.png',
 * });
 * ```
 */
export class PlatformService {
  private client: PolyVClient;

  /**
   * Create a new PlatformService instance
   *
   * @param client - The PolyVClient instance to use for API calls
   */
  constructor(client: PolyVClient) {
    this.client = client;
  }

  // ============================================
  // Anchor Management APIs
  // ============================================

  /**
   * Create an anchor
   * Create a new anchor profile
   *
   * @param params - Create anchor parameters
   * @returns Anchor ID
   *
   * @example
   * ```typescript
   * const anchorId = await client.platform.createAnchor({
   *   nickname: '主播1',
   *   sex: 'W',
   *   avatar: 'https://example.com/avatar.png',
   * });
   * ```
   */
  async createAnchor(params: CreateAnchorParams): Promise<number> {
    // Validate nickname
    this.validateNickname(params.nickname, true);

    // Validate sex
    this.validateSex(params.sex);

    // Validate avatar
    this.validateAvatar(params.avatar, true);

    // Validate description
    if (params.description !== undefined) {
      this.validateDescription(params.description);
    }

    // Validate addChannelIds
    if (params.addChannelIds !== undefined) {
      this.validateChannelIds(params.addChannelIds, 'addChannelIds');
    }

    // Build request body
    const body: Record<string, unknown> = {
      nickname: params.nickname,
      sex: params.sex,
      avatar: params.avatar,
    };
    if (params.description !== undefined) {
      body.description = params.description;
    }
    if (params.addChannelIds !== undefined) {
      body.addChannelIds = params.addChannelIds;
    }

    const response = await this.client.httpClient.post<number>(
      '/live/v4/channel/anchor/create',
      body
    );
    return response as unknown as number;
  }

  /**
   * Get anchor details
   * Query anchor profile by ID
   *
   * @param anchorId - Anchor ID
   * @returns Anchor details
   *
   * @example
   * ```typescript
   * const anchor = await client.platform.getAnchor(1);
   * console.log(anchor.nickname, anchor.status);
   * ```
   */
  async getAnchor(anchorId: number): Promise<AnchorDetail> {
    this.validateAnchorId(anchorId);

    const response = await this.client.httpClient.get<AnchorDetail>(
      '/live/v4/channel/anchor/get',
      { params: { anchorId } }
    );
    return response as unknown as AnchorDetail;
  }

  /**
   * List anchors
   * Query paginated list of anchors with filters
   *
   * @param params - List parameters (optional)
   * @returns Paginated list of anchors
   *
   * @example
   * ```typescript
   * // List all anchors
   * const anchors = await client.platform.listAnchors();
   *
   * // List with filters
   * const filtered = await client.platform.listAnchors({
   *   status: 1,
   *   sex: 'W',
   *   nickname: '主播',
   * });
   * ```
   */
  async listAnchors(params?: ListAnchorsParams): Promise<ListAnchorsResponse> {
    // Validate pagination params
    if (params) {
      this.validatePagination(params);

      // Validate status
      if (params.status !== undefined) {
        if (params.status !== 0 && params.status !== 1) {
          throw new PolyVValidationError('status must be 0 or 1');
        }
      }

      // Validate sex
      if (params.sex !== undefined) {
        this.validateSex(params.sex);
      }

      // Validate pageSize max
      if (params.pageSize !== undefined && params.pageSize > 1000) {
        throw new PolyVValidationError('pageSize cannot exceed 1000');
      }
    }

    const apiParams: Record<string, unknown> = {};
    if (params) {
      if (params.pageNumber !== undefined) {
        apiParams.pageNumber = params.pageNumber;
      }
      if (params.pageSize !== undefined) {
        apiParams.pageSize = params.pageSize;
      }
      if (params.status !== undefined) {
        apiParams.status = params.status;
      }
      if (params.sex !== undefined) {
        apiParams.sex = params.sex;
      }
      if (params.nickname !== undefined) {
        apiParams.nickname = params.nickname;
      }
      if (params.startTime !== undefined) {
        apiParams.startTime = params.startTime;
      }
      if (params.endTime !== undefined) {
        apiParams.endTime = params.endTime;
      }
    }

    const response = await this.client.httpClient.get<ListAnchorsResponse>(
      '/live/v4/channel/anchor/list',
      { params: apiParams }
    );
    return response as unknown as ListAnchorsResponse;
  }

  /**
   * List anchor relations (associated channels)
   * Query channels associated with an anchor
   *
   * @param params - Query parameters
   * @returns Paginated list of associated channels
   *
   * @example
   * ```typescript
   * const relations = await client.platform.listAnchorRelations({ anchorId: 1 });
   * console.log(relations.contents);
   * ```
   */
  async listAnchorRelations(
    params: ListAnchorRelationsParams
  ): Promise<PaginationResponse<AnchorRelationItem>> {
    this.validateAnchorId(params.anchorId);

    // Validate pagination
    this.validatePagination(params);

    const apiParams: Record<string, unknown> = { anchorId: params.anchorId };
    if (params.pageNumber !== undefined) {
      apiParams.pageNumber = params.pageNumber;
    }
    if (params.pageSize !== undefined) {
      apiParams.pageSize = params.pageSize;
    }

    const response = await this.client.httpClient.get<PaginationResponse<AnchorRelationItem>>(
      '/live/v4/channel/anchor/list-relation',
      { params: apiParams }
    );
    return response as unknown as PaginationResponse<AnchorRelationItem>;
  }

  /**
   * List anchor unrelations (unassociated channels)
   * Query channels not associated with an anchor
   *
   * @param params - Query parameters
   * @returns Paginated list of unassociated channels
   *
   * @example
   * ```typescript
   * const unrelations = await client.platform.listAnchorUnrelations({ anchorId: 1 });
   * console.log(unrelations.contents);
   * ```
   */
  async listAnchorUnrelations(
    params: ListAnchorRelationsParams
  ): Promise<PaginationResponse<AnchorRelationItem>> {
    this.validateAnchorId(params.anchorId);

    // Validate pagination
    this.validatePagination(params);

    const apiParams: Record<string, unknown> = { anchorId: params.anchorId };
    if (params.pageNumber !== undefined) {
      apiParams.pageNumber = params.pageNumber;
    }
    if (params.pageSize !== undefined) {
      apiParams.pageSize = params.pageSize;
    }

    const response = await this.client.httpClient.get<PaginationResponse<AnchorRelationItem>>(
      '/live/v4/channel/anchor/list-unrelation',
      { params: apiParams }
    );
    return response as unknown as PaginationResponse<AnchorRelationItem>;
  }

  /**
   * Update anchor
   * Modify anchor profile
   *
   * @param params - Update parameters
   * @returns void
   *
   * @example
   * ```typescript
   * await client.platform.updateAnchor({
   *   anchorId: 1,
   *   nickname: '新昵称',
   * });
   * ```
   */
  async updateAnchor(params: UpdateAnchorParams): Promise<void> {
    this.validateAnchorId(params.anchorId);

    // Validate optional fields
    if (params.nickname !== undefined) {
      this.validateNickname(params.nickname, false);
    }
    if (params.sex !== undefined) {
      this.validateSex(params.sex);
    }
    if (params.avatar !== undefined) {
      this.validateAvatar(params.avatar, false);
    }
    if (params.description !== undefined) {
      this.validateDescription(params.description);
    }
    if (params.addChannelIds !== undefined) {
      this.validateChannelIds(params.addChannelIds, 'addChannelIds');
    }
    if (params.delChannelIds !== undefined) {
      this.validateChannelIds(params.delChannelIds, 'delChannelIds');
    }

    // Build request body
    const body: Record<string, unknown> = { anchorId: params.anchorId };
    if (params.nickname !== undefined) {
      body.nickname = params.nickname;
    }
    if (params.sex !== undefined) {
      body.sex = params.sex;
    }
    if (params.avatar !== undefined) {
      body.avatar = params.avatar;
    }
    if (params.description !== undefined) {
      body.description = params.description;
    }
    if (params.addChannelIds !== undefined) {
      body.addChannelIds = params.addChannelIds;
    }
    if (params.delChannelIds !== undefined) {
      body.delChannelIds = params.delChannelIds;
    }

    await this.client.httpClient.post<void>(
      '/live/v4/channel/anchor/update',
      body
    );
  }

  /**
   * Update anchor status
   * Enable or disable an anchor
   *
   * @param params - Update status parameters
   * @returns void
   *
   * @example
   * ```typescript
   * // Enable anchor
   * await client.platform.updateAnchorStatus({ anchorId: 1, status: 1 });
   * // Disable anchor
   * await client.platform.updateAnchorStatus({ anchorId: 1, status: 0 });
   * ```
   */
  async updateAnchorStatus(params: UpdateAnchorStatusParams): Promise<void> {
    this.validateAnchorId(params.anchorId);

    // Validate status
    if (params.status !== 0 && params.status !== 1) {
      throw new PolyVValidationError('status must be 0 or 1');
    }

    await this.client.httpClient.post<void>(
      '/live/v4/channel/anchor/update-status',
      { anchorId: params.anchorId, status: params.status }
    );
  }

  // ============================================
  // Content Group APIs
  // ============================================

  /**
   * List content groups
   * Query platform content library groups
   *
   * @param type - Content type: 'script' (内容库) or 'robot' (成员库)
   * @returns Array of content groups
   *
   * @example
   * ```typescript
   * const scriptGroups = await client.platform.listContentGroups('script');
   * const robotGroups = await client.platform.listContentGroups('robot');
   * ```
   */
  async listContentGroups(type: 'script' | 'robot'): Promise<ContentGroupItem[]> {
    // Validate type
    if (type !== 'script' && type !== 'robot') {
      throw new PolyVValidationError('type must be "script" or "robot"');
    }

    const response = await this.client.httpClient.get<ContentGroupItem[]>(
      '/live/v4/global/robot/label/list',
      { params: { type } }
    );
    return response as unknown as ContentGroupItem[];
  }

  // ============================================
  // Private Validation Helpers
  // ============================================

  /**
   * Validate anchor ID
   */
  private validateAnchorId(anchorId: number): void {
    if (anchorId === undefined || anchorId === null) {
      throw new PolyVValidationError('anchorId is required');
    }
    if (typeof anchorId !== 'number' || isNaN(anchorId)) {
      throw new PolyVValidationError('anchorId must be a number');
    }
  }

  /**
   * Validate sex type
   */
  private validateSex(sex: SexType): void {
    if (sex !== 'M' && sex !== 'W') {
      throw new PolyVValidationError('sex must be "M" or "W"');
    }
  }

  /**
   * Validate nickname
   */
  private validateNickname(nickname: string, required: boolean): void {
    if (required && (!nickname || nickname.trim() === '')) {
      throw new PolyVValidationError('nickname is required');
    }
    if (nickname && nickname.length > 20) {
      throw new PolyVValidationError('nickname cannot exceed 20 characters');
    }
  }

  /**
   * Validate avatar URL
   */
  private validateAvatar(avatar: string, required: boolean): void {
    if (required && (!avatar || avatar.trim() === '')) {
      throw new PolyVValidationError('avatar is required');
    }
    if (avatar && avatar.length > 255) {
      throw new PolyVValidationError('avatar cannot exceed 255 characters');
    }
  }

  /**
   * Validate description
   */
  private validateDescription(description: string): void {
    if (description && description.length > 150) {
      throw new PolyVValidationError('description cannot exceed 150 characters');
    }
  }

  /**
   * Validate channel IDs array
   */
  private validateChannelIds(ids: number[], field: string): void {
    if (!Array.isArray(ids)) {
      throw new PolyVValidationError(`${field} must be an array`);
    }
    if (ids.length > 1000) {
      throw new PolyVValidationError(`${field} cannot exceed 1000 items`);
    }
  }

  /**
   * Validate pagination parameters
   */
  private validatePagination(params: { pageNumber?: number; pageSize?: number }): void {
    if (params.pageNumber !== undefined && params.pageNumber < 1) {
      throw new PolyVValidationError('pageNumber must be at least 1');
    }
    if (params.pageSize !== undefined && params.pageSize < 1) {
      throw new PolyVValidationError('pageSize must be at least 1');
    }
  }
}
