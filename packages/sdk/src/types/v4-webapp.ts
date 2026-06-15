/**
 * V4 WebApp Types
 *
 * Type definitions for V4 WebApp APIs (Permission and Role management).
 *
 * @module types/v4-webapp
 */

// ============================================
// AC5: Permission Types
// ============================================

/**
 * Permission entity
 *
 * Represents an application permission that can be assigned to roles
 */
export interface Permission {
  /** Permission ID */
  id: number;
  /** Permission name */
  name: string;
}

// ============================================
// AC6: Role Types
// ============================================

/**
 * Role entity (basic info)
 *
 * Represents an application role
 */
export interface Role {
  /** Role ID */
  id: number;
  /** Role name */
  name: string;
  /** User ID (account owner) */
  userId: string;
  /** Role description */
  description?: string;
  /** Role status */
  status: boolean;
  /** Created time (13-bit millisecond timestamp) */
  createdTime: number;
  /** Last modified time (13-bit millisecond timestamp) */
  lastModified: number;
  /** Permission names (comma-separated) */
  permissionName?: string;
  /** Whether this is a legacy role */
  isOldRole: boolean;
  /** Role type - root (main account) or child (sub-account) */
  type: 'root' | 'child';
}

/**
 * Role detail entity
 *
 * Extended role information returned by getRole
 */
export interface RoleDetail {
  /** Role ID */
  id: number;
  /** Role name */
  name: string;
  /** User ID (account owner) */
  userId: string;
  /** Role description */
  description?: string;
  /** Role status */
  status: string;
  /** Created time (13-bit millisecond timestamp) */
  createdTime: number;
  /** Last modified time (13-bit millisecond timestamp) */
  lastModified: number;
  /** Permission names (comma-separated) */
  permissionName?: string;
  /** Whether this is a legacy role */
  isOldRole: boolean;
  /** Role type - root (main account) or child (sub-account) */
  type: 'root' | 'child';
}

/**
 * Role permission with tree structure
 *
 * Permission info with ownership flag for a specific role
 */
export interface RolePermission {
  /** Permission ID */
  id: number;
  /** Permission type */
  type: string;
  /** Permission name */
  name: string;
  /** Permission code */
  code: string;
  /** Parent permission ID */
  parentId: number;
  /** Left node value (for nested set tree structure) */
  lft: number;
  /** Right node value (for nested set tree structure) */
  rgt: number;
  /** Created time (13-bit millisecond timestamp) */
  createdTime: number;
  /** Last modified time (13-bit millisecond timestamp) */
  lastModified: number;
  /** Permission depth in tree */
  depth: number;
  /** Whether the role has this permission */
  owned: boolean;
}

/**
 * Parameters for creating a role
 */
export interface CreateRoleParams {
  /** Role name */
  name: string;
  /** Role description */
  desc?: string;
  /** Role type - root (main account) or child (sub-account) */
  roleType: 'root' | 'child';
  /** Array of permission IDs to assign to the role */
  permissionIds: number[];
}

/**
 * Response from getRole API
 */
export interface GetRoleResponse {
  /** Role details */
  role: RoleDetail;
  /** Full permission tree with ownership flags */
  permissions: RolePermission[];
}

/**
 * Parameters for listing roles
 */
export interface ListRolesParams {
  /** Page number (default 1, >= 1) */
  pageNumber?: number;
  /** Page size (default 10, 1-1000) */
  pageSize?: number;
}

/**
 * Paginated response for role list
 */
export interface ListRolesResponse {
  /** List of roles */
  contents: Role[];
  /** Total number of items */
  total: number;
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
}

/**
 * Parameters for updating a role
 */
export interface UpdateRoleParams {
  /** Role ID to update */
  roleId: number;
  /** Role name */
  name: string;
  /** Role description */
  desc?: string;
  /** Role type - root (main account) or child (sub-account) */
  roleType: 'root' | 'child';
  /** Array of permission IDs to assign to the role (optional for update) */
  permissionIds?: number[];
}
