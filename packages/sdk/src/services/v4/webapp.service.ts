/**
 * V4 WebApp Service
 *
 * Service for managing PolyV V4 WebApp operations (Permission and Role management).
 * Provides methods for listing permissions and managing application roles.
 *
 * @module services/v4/webapp
 */

import type { PolyVClient } from '../../client.js';
import { PolyVValidationError } from '../../errors/polyv-validation-error.js';
import type {
  Permission,
  Role,
  CreateRoleParams,
  GetRoleResponse,
  ListRolesParams,
  ListRolesResponse,
  UpdateRoleParams,
} from '../../types/v4-webapp.js';

/**
 * V4 WebApp Service
 *
 * Provides methods for managing application permissions and roles.
 */
export class V4WebAppService {
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
   * Validate role creation parameters
   */
  private validateCreateRoleParams(params: CreateRoleParams): void {
    if (!params.name || params.name.trim().length === 0) {
      throw new PolyVValidationError('name is required', 'name');
    }
    if (!params.roleType) {
      throw new PolyVValidationError('roleType is required', 'roleType');
    }
    if (params.roleType !== 'root' && params.roleType !== 'child') {
      throw new PolyVValidationError('roleType must be "root" or "child"', 'roleType');
    }
    if (!params.permissionIds || params.permissionIds.length === 0) {
      throw new PolyVValidationError('permissionIds is required and must not be empty', 'permissionIds');
    }
  }

  /**
   * Validate role update parameters
   */
  private validateUpdateRoleParams(params: UpdateRoleParams): void {
    if (!params.roleId) {
      throw new PolyVValidationError('roleId is required', 'roleId');
    }
    if (!params.name || params.name.trim().length === 0) {
      throw new PolyVValidationError('name is required', 'name');
    }
    if (!params.roleType) {
      throw new PolyVValidationError('roleType is required', 'roleType');
    }
    if (params.roleType !== 'root' && params.roleType !== 'child') {
      throw new PolyVValidationError('roleType must be "root" or "child"', 'roleType');
    }
  }

  // ============================================
  // AC5: Permission API
  // ============================================

  /**
   * List application permissions
   *
   * Retrieves all available permissions that can be assigned to roles.
   *
   * @returns Promise resolving to array of permissions
   *
   * @example
   * ```typescript
   * const permissions = await client.v4WebApp.listPermissions();
   * console.log(`Available permissions: ${permissions.length}`);
   * ```
   */
  async listPermissions(): Promise<Permission[]> {
    const response = await this.client.httpClient.get<Permission[]>(
      '/live/v4/user/webapp-role/permission/list'
    );
    return response as unknown as Permission[];
  }

  // ============================================
  // AC6: Role CRUD APIs
  // ============================================

  /**
   * Create a role
   *
   * Creates a new application role with specified permissions.
   *
   * @param params - Role creation parameters
   *
   * @example
   * ```typescript
   * await client.v4WebApp.createRole({
   *   name: 'Channel Manager',
   *   desc: 'Can manage channels',
   *   roleType: 'child',
   *   permissionIds: [1, 2, 3]
   * });
   * ```
   */
  async createRole(params: CreateRoleParams): Promise<void> {
    this.validateCreateRoleParams(params);
    await this.client.httpClient.post(
      '/live/v4/user/webapp-role/create',
      params
    );
  }

  /**
   * Get role with permissions
   *
   * Retrieves detailed role information and the full permission tree with ownership flags.
   *
   * @param roleId - Role ID to retrieve
   * @returns Promise resolving to role details and permission tree
   *
   * @example
   * ```typescript
   * const result = await client.v4WebApp.getRole(123);
   * console.log(`Role: ${result.role.name}`);
   * const ownedPermissions = result.permissions.filter(p => p.owned);
   * console.log(`Has ${ownedPermissions.length} permissions`);
   * ```
   */
  async getRole(roleId: number): Promise<GetRoleResponse> {
    if (!roleId) {
      throw new PolyVValidationError('roleId is required', 'roleId');
    }

    const response = await this.client.httpClient.get<GetRoleResponse>(
      '/live/v4/user/webapp-role/get',
      { params: { roleId } }
    );
    return response as unknown as GetRoleResponse;
  }

  /**
   * List roles
   *
   * Retrieves a paginated list of application roles.
   *
   * @param params - List parameters
   * @returns Promise resolving to paginated role list
   *
   * @example
   * ```typescript
   * const result = await client.v4WebApp.listRoles({
   *   pageNumber: 1,
   *   pageSize: 20
   * });
   * console.log(`Found ${result.total} roles`);
   * ```
   */
  async listRoles(params: ListRolesParams = {}): Promise<ListRolesResponse> {
    this.validatePagination(params.pageNumber, params.pageSize);

    const response = await this.client.httpClient.get<ListRolesResponse>(
      '/live/v4/user/webapp-role/list',
      { params }
    );
    return response as unknown as ListRolesResponse;
  }

  /**
   * Update a role
   *
   * Updates an existing role's name, description, type, and permissions.
   *
   * @param params - Role update parameters
   *
   * @example
   * ```typescript
   * await client.v4WebApp.updateRole({
   *   roleId: 123,
   *   name: 'Updated Role Name',
   *   roleType: 'child',
   *   permissionIds: [1, 2, 3, 4]
   * });
   * ```
   */
  async updateRole(params: UpdateRoleParams): Promise<void> {
    this.validateUpdateRoleParams(params);
    await this.client.httpClient.post(
      '/live/v4/user/webapp-role/update',
      params
    );
  }

  /**
   * Delete a role
   *
   * Deletes an application role by ID.
   * Note: Uses POST method with query parameter, not DELETE method.
   *
   * @param roleId - Role ID to delete
   *
   * @example
   * ```typescript
   * await client.v4WebApp.deleteRole(123);
   * ```
   */
  async deleteRole(roleId: number): Promise<void> {
    if (!roleId) {
      throw new PolyVValidationError('roleId is required', 'roleId');
    }

    // Note: This API uses POST with query param, not DELETE method
    await this.client.httpClient.post(
      `/live/v4/user/webapp-role/delete?id=${roleId}`
    );
  }
}
