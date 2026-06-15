/**
 * @fileoverview Product type definitions for PolyV live streaming
 * @author Development Team
 * @since 7.1.0
 */

/**
 * Product types available in PolyV
 */
export type ProductType = 'normal' | 'finance' | 'position';

/**
 * Product model representing a PolyV product
 */
export interface ProductModel {
  /** Product ID */
  productId: string;
  /** Associated channel ID */
  channelId: string;
  /** Product name */
  name: string;
  /** Product type */
  productType: ProductType;
  /** Product status */
  status: number;
  /** Link type */
  linkType: number;
  /** Product cover image URL (optional) */
  cover?: string;
  /** Product price (optional) */
  price?: number;
  /** Real/discounted price (optional) */
  realPrice?: number;
  /** Creation timestamp */
  createdTime: number;
  /** Last update timestamp */
  updatedTime: number;
}

/**
 * Request parameters for listing products
 */
export interface ProductListRequest {
  /** Page number for pagination (minimum 1) */
  page?: number;
  /** Page size for pagination (1-100) */
  size?: number;
  /** Channel ID filter (required unless platform is true) */
  channelId?: string;
  /** List platform products (user-level product library) instead of channel products */
  platform?: boolean;
}

/**
 * Response structure for product list API
 */
export interface ProductListResponse {
  /** Response status code */
  code: number;
  /** Response status */
  status: 'success' | 'error';
  /** Response data */
  data: {
    /** Array of products */
    contents: ProductModel[];
    /** Total number of products */
    totalItems: number;
    /** Current page number */
    pageNumber: number;
    /** Page size */
    pageSize: number;
    /** Total number of pages */
    totalPages: number;
  };
  /** Error information (if status is 'error') */
  error?: {
    /** Error code */
    code: string;
    /** Error description */
    desc: string;
  };
}

/**
 * Service configuration for product operations
 */
export interface ProductServiceConfig {
  /** Base URL for PolyV API */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Debug mode flag */
  debug: boolean;
}

/**
 * Simplified product list item for table display
 */
export interface ProductListItem {
  /** Product ID */
  productId: string;
  /** Associated channel ID */
  channelId: string;
  /** Product name */
  name: string;
  /** Product type */
  productType: ProductType;
  /** Product status */
  status: number;
  /** Product price (if available) */
  price?: number;
  /** Real price (if available) */
  realPrice?: number;
  /** Creation date */
  createdAt: Date;
  /** Last update date */
  updatedAt: Date;
}

/**
 * Product request validation errors
 */
export interface ProductValidationError {
  /** Field name that failed validation */
  field: string;
  /** Error message */
  message: string;
  /** Invalid value */
  value: any;
}

// ========================================
// Product Add/Update/Delete Types (Story 8-2)
// ========================================

/**
 * Product link type
 * - 10: Universal link (通用链接)
 * - 11: Multi-platform link (多平台链接)
 */
export type ProductLinkType = 10 | 11;

/**
 * Product status enum
 * - 1: On shelf (上架)
 * - 2: Off shelf (下架)
 */
export type ProductStatusType = 1 | 2;

/**
 * Product price type
 * - AMOUNT: Numeric price
 * - CUSTOM: Custom text price
 */
export type ProductPriceType = 'AMOUNT' | 'CUSTOM';

/**
 * Product add options for CLI
 */
export interface ProductAddOptions {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Product type: normal, finance, position */
  productType?: ProductType;
  /** Product name - REQUIRED */
  name: string;
  /** Product status - REQUIRED: 1 (on shelf) | 2 (off shelf) */
  status: ProductStatusType;
  /** Link type - REQUIRED: 10 (universal) | 11 (multi-platform) */
  linkType: ProductLinkType;
  /** Product cover URL */
  cover?: string;
  /** Universal link - REQUIRED when linkType=10 */
  link?: string;
  /** PC link */
  pcLink?: string;
  /** Mobile web link */
  mobileLink?: string;
  /** WeChat miniprogram link */
  wxMiniprogramLink?: string;
  /** WeChat miniprogram original ID */
  wxMiniprogramOriginalId?: string;
  /** Mobile app link */
  mobileAppLink?: string;
  /** Android native link */
  androidLink?: string;
  /** iOS native link */
  iosLink?: string;
  /** Custom params as JSON string */
  params?: string;
  /** Product description */
  productDesc?: string;
  /** Features/tags as JSON array string */
  features?: string;
  /** Button text */
  btnShow?: string;
  /** Yield/rate for finance products */
  yield?: string;
  /** Platform product ID for copy */
  originId?: string;
  /** Copy strategy: copy | ref */
  strategy?: 'copy' | 'ref';
  /** Product detail HTML */
  productDetail?: string;
  /** Extension info as JSON string */
  ext?: string;
  /** Tag IDs as JSON array string */
  tagIds?: string;
  /** Real price type */
  priceType?: ProductPriceType;
  /** Real price amount */
  realPrice?: number;
  /** Custom price text */
  customPrice?: string;
  /** Original price type */
  originalPriceType?: ProductPriceType;
  /** Original price amount */
  price?: number;
  /** Custom original price text */
  customOrignalPrice?: string;
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Product add result
 */
export interface ProductAddResult {
  /** Created product ID */
  productId: number;
  /** Product name */
  name: string;
  /** Channel ID */
  channelId: string;
  /** Created timestamp */
  createdTime: number;
}

/**
 * Product update options for CLI
 */
export interface ProductUpdateOptions {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Product ID - REQUIRED */
  productId: number;
  /** Product name - REQUIRED */
  name: string;
  /** Product status - REQUIRED: 1 | 2 */
  status: ProductStatusType;
  /** Link type - REQUIRED: 10 | 11 */
  linkType: ProductLinkType;
  /** Product cover URL */
  cover?: string;
  /** Universal link */
  link?: string;
  /** PC link */
  pcLink?: string;
  /** Mobile web link */
  mobileLink?: string;
  /** WeChat miniprogram link */
  wxMiniprogramLink?: string;
  /** WeChat miniprogram original ID */
  wxMiniprogramOriginalId?: string;
  /** Mobile app link */
  mobileAppLink?: string;
  /** Android native link */
  androidLink?: string;
  /** iOS native link */
  iosLink?: string;
  /** Custom params as JSON string */
  params?: string;
  /** Product description */
  productDesc?: string;
  /** Features/tags as JSON array string */
  features?: string;
  /** Button text */
  btnShow?: string;
  /** Yield/rate for finance products */
  yield?: string;
  /** Product detail HTML */
  productDetail?: string;
  /** Extension info as JSON string */
  ext?: string;
  /** Tag IDs as JSON array string */
  tagIds?: string;
  /** Real price type */
  priceType?: ProductPriceType;
  /** Real price amount */
  realPrice?: number;
  /** Custom price text */
  customPrice?: string;
  /** Original price type */
  originalPriceType?: ProductPriceType;
  /** Original price amount */
  price?: number;
  /** Custom original price text */
  customOrignalPrice?: string;
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Product delete options for CLI
 */
export interface ProductDeleteOptions {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Product ID - REQUIRED */
  productId: number;
  /** Force delete without confirmation */
  force?: boolean;
  /** Output format */
  output?: 'table' | 'json';
}