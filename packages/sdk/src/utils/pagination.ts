/**
 * Pagination Utilities
 *
 * Provides utilities for handling paginated API responses.
 * Supports both v3 (page) and v4 (pageNumber) API naming conventions.
 */

import type {
  PaginationOptions,
  PaginationResponse,
} from '../types/pagination.js';

/**
 * Paginate options for the paginate function
 */
export interface PaginateOptions {
  /** Number of items per page (default: 100) */
  pageSize?: number;
}

/**
 * Async generator that yields pages of items from a paginated API.
 *
 * Automatically handles pagination by calling the fetcher function
 * with incrementing page numbers until all items are retrieved.
 *
 * @template T - The type of items in the paginated response
 * @param fetcher - Function that fetches a single page of data
 * @param options - Pagination options (pageSize)
 * @yields Arrays of items, one page at a time
 *
 * @example
 * ```typescript
 * const fetcher = async (opts: PaginationOptions) => {
 *   const response = await api.get('/items', { params: opts });
 *   return response.data;
 * };
 *
 * for await (const items of paginate(fetcher)) {
 *   console.log('Got page with', items.length, 'items');
 * }
 * ```
 */
export async function* paginate<T>(
  fetcher: (opts: PaginationOptions) => Promise<PaginationResponse<T>>,
  options: PaginateOptions = {}
): AsyncGenerator<T[], void, unknown> {
  let currentPage = 1;
  const pageSize = options.pageSize ?? 100;
  let hasMore = true;

  // Continue fetching while hasMore is true
  // The hasMore flag is determined by:
  // 1. Explicit hasMore from API response (if provided)
  // 2. Calculated from total (items fetched < total)
  while (hasMore) {
    const result = await fetcher({ page: currentPage, pageSize });

    // Determine if there are more pages
    // Use explicit hasMore if available, otherwise calculate from total
    if (result.hasMore !== undefined) {
      hasMore = result.hasMore;
    } else {
      // There are more pages if we haven't fetched all items yet
      hasMore = currentPage * pageSize < result.total;
    }

    yield result.items;
    currentPage++;
  }
}

/**
 * Collects all items from all pages into a single array.
 *
 * This is a convenience function that internally uses `paginate` and
 * collects all yielded items into a single array.
 *
 * @template T - The type of items in the paginated response
 * @param fetcher - Function that fetches a single page of data
 * @param options - Pagination options (pageSize)
 * @returns Promise resolving to an array of all items
 *
 * @example
 * ```typescript
 * const fetcher = async (opts: PaginationOptions) => {
 *   const response = await api.get('/items', { params: opts });
 *   return response.data;
 * };
 *
 * const allItems = await collectAll(fetcher);
 * console.log('Total items:', allItems.length);
 * ```
 */
export async function collectAll<T>(
  fetcher: (opts: PaginationOptions) => Promise<PaginationResponse<T>>,
  options: PaginateOptions = {}
): Promise<T[]> {
  const allItems: T[] = [];

  for await (const items of paginate(fetcher, options)) {
    allItems.push(...items);
  }

  return allItems;
}
