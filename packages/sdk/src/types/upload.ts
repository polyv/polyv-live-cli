/**
 * Upload Types
 *
 * Types for file upload functionality.
 */

/**
 * Upload Options
 */
export interface UploadOptions {
  /** File to upload */
  file: File | Blob;
  /** Upload endpoint URL */
  url: string;
  /** Additional form data */
  formData?: Record<string, string | Blob>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Progress callback */
  onProgress?: (progress: UploadProgress) => void;
}

/**
 * Upload Progress Information
 */
export interface UploadProgress {
  /** Bytes uploaded */
  loaded: number;
  /** Total bytes to upload */
  total: number;
  /** Upload percentage (0-100) */
  percentage: number;
}
