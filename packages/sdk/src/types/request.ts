/**
 * Request Types
 *
 * Types for HTTP request configuration.
 */

/**
 * HTTP Methods (as const object for runtime use)
 */
export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];

/**
 * Sort Options for queries
 */
export interface SortOptions {
  /** Field to sort by */
  field: string;
  /** Sort order */
  order: 'asc' | 'desc';
}

/**
 * Request Options
 *
 * Options for customizing API requests.
 */
export interface RequestOptions {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Custom headers */
  headers?: Record<string, string>;
  /** Abort signal for request cancellation */
  signal?: AbortSignal;
  /** Additional query parameters */
  params?: Record<string, unknown>;
  /** Skip automatic auth signature injection (for multipart/form-data) */
  skipAuth?: boolean;
}
