/**
 * Pagination Types
 *
 * Types for handling paginated API responses.
 */

/**
 * Pagination Options
 *
 * Options for requesting paginated data.
 * Supports both v3 (page) and v4 (pageNumber) API conventions.
 */
export interface PaginationOptions {
  /** Page number (v3 API naming) */
  page?: number;
  /** Page number (v4 API naming) */
  pageNumber?: number;
  /** Number of items per page */
  pageSize?: number;
}

/**
 * Pagination Response
 *
 * Standard response structure for paginated data.
 */
export interface PaginationResponse<T> {
  /** Array of items on the current page */
  items: T[];
  /** Total number of items across all pages */
  total: number;
  /** Current page number */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Whether there are more pages available */
  hasMore: boolean;
}
