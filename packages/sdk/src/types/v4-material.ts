/**
 * V4 Material Types
 *
 * Type definitions for V4 Material APIs.
 *
 * @module types/v4-material
 */

// ============================================
// Common Types
// ============================================

/**
 * Pagination parameters
 */
export interface MaterialPaginationParams {
  /** Page number (>= 1) */
  pageNumber: number;
  /** Page size (1-1000) */
  pageSize: number;
}

/**
 * Paginated response
 */
export interface MaterialPaginatedResponse<T> {
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
// AC6: Material Types
// ============================================

/**
 * Material extended data
 */
export interface MaterialExtData {
  /** Screenshots */
  screenshots?: string[];
  /** Subtitles */
  subtitles?: string[];
  /** Other metadata */
  [key: string]: unknown;
}

/**
 * Material entity
 */
export interface Material {
  /** Material ID */
  id: string;
  /** Access URL (with expiry) */
  url?: string;
  /** Material title */
  title: string;
  /** Material type (video/image/audio/document) */
  type: string;
  /** File size (bytes) */
  fileSize?: number;
  /** Duration in seconds (video only) */
  duration?: number;
  /** Source (upload/record/pptRecord/aiVideo/etc.) */
  source?: string;
  /** Extended data (screenshots, subtitles, etc.) */
  extData?: MaterialExtData;
  /** Category ID */
  categoryId?: number;
  /** Status (normal/recycle/auditing/etc.) */
  status?: string;
  /** Create timestamp (ms) */
  createTime?: number;
  /** Update timestamp (ms) */
  updateTime?: number;
}

/**
 * Parameters for listing materials
 */
export interface ListMaterialsParams extends MaterialPaginationParams {
  /** Material type (required: video/image/audio/document) */
  type: string;
  /** Category ID filter */
  categoryId?: number;
  /** Title keyword filter */
  title?: string;
  /** Start create time filter (timestamp) */
  startCreateTime?: number;
  /** End create time filter (timestamp) */
  endCreateTime?: number;
  /** Expire second filter */
  expireSecond?: number;
}

/**
 * Response for listing materials
 */
export interface ListMaterialsResponse extends MaterialPaginatedResponse<Material> {}

/**
 * Parameters for deleting materials
 */
export interface DeleteMaterialsParams {
  /** Material IDs to delete (required, 1-1000 items) */
  materialIds: string[];
  /** Delete completely (permanent delete) */
  deleteCompletely?: string;
  /** Allow partial delete if some fail */
  allowPartialDelete?: string;
}

/**
 * Result for deleting materials
 */
export interface DeleteMaterialsResult {
  /** Failed material IDs */
  failedMaterialIds: string[];
}

// ============================================
// AC7: Material Category Types
// ============================================

/**
 * Material category entity
 */
export interface MaterialCategory {
  /** Category ID */
  id: number;
  /** Category name */
  title: string;
  /** Category type (DEFAULT/CUSTOM/PLAYBACK/AI/DISK_VIDEO/etc.) */
  type?: string;
  /** Sub-category count */
  subCount?: number;
}

/**
 * Parameters for listing material categories
 */
export interface ListMaterialCategoriesParams {
  /** Material type (required: video/image/audio/document) */
  materialType: string;
  /** Parent category ID (for sub-categories) */
  parentId?: number;
}

/**
 * Response for listing material categories
 */
export interface ListMaterialCategoriesResponse {
  /** Category list */
  contents: MaterialCategory[];
}
