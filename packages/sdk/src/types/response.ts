/**
 * API Response Types
 *
 * Unified response format for all PolyV API responses.
 */

/**
 * API Response Status
 */
export type ApiResponseStatus = 'success' | 'error' | 'fail';

/**
 * API Error Detail
 */
export interface ApiErrorDetail {
  /** PolyV error code */
  code: number;
  /** Error description */
  desc: string;
}

/**
 * Generic API Response
 *
 * @template T - The type of the data field
 */
export interface ApiResponse<T = unknown> {
  /** HTTP-like status code (200 = success) */
  code: number;
  /** Response status */
  status: ApiResponseStatus;
  /** Response message */
  message: string;
  /** Response data */
  data: T;
  /** Error details (present when status is error/fail) */
  error?: ApiErrorDetail;
  /** Request ID for tracing */
  requestId?: string;
}

/**
 * API Success Response (status = 'success')
 *
 * @template T - The type of the data field
 */
export interface ApiSuccessResponse<T = unknown>
  extends Omit<ApiResponse<T>, 'status' | 'error'> {
  /** Always 'success' */
  status: 'success';
}

/**
 * API Error Response (status = 'error' | 'fail')
 */
export interface ApiErrorResponse
  extends Omit<ApiResponse<null>, 'status' | 'data'> {
  /** 'error' or 'fail' */
  status: 'error' | 'fail';
  /** Null data for error responses */
  data: null;
  /** Error details */
  error: ApiErrorDetail;
}
