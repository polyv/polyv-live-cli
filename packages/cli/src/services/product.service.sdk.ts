/**
 * @fileoverview Product service using PolyV Live API SDK
 * @author Development Team
 * @since 3.0.0
 */

import {
  ProductListRequest,
  ProductListItem,
  ProductAddOptions,
  ProductAddResult,
  ProductUpdateOptions,
  ProductDeleteOptions
} from '../types/product';
import { AuthConfig } from '../types/auth';
import { PolyVError, PolyVAPIError, PolyVValidationError } from '../utils/errors';
import { createSdkClient } from '../sdk';
import type {
  AddChannelProductParams,
  UpdateChannelProductParams
} from 'polyv-live-api-sdk';

/**
 * Configuration for product service
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
 * Product service for managing PolyV live streaming channel products using SDK
 */
export class ProductServiceSdk {
  private readonly config: ProductServiceConfig;
  private readonly authConfig: AuthConfig;

  /**
   * Creates a new ProductServiceSdk instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: ProductServiceConfig) {
    this.authConfig = authConfig;
    this.config = serviceConfig;
  }

  /**
   * Lists products with pagination support
   * @param request Product list request parameters
   * @returns Promise resolving to array of product list items
   */
  async listProducts(request: ProductListRequest = {}): Promise<ProductListItem[]> {
    try {
      this.validateListRequest(request);

      const client = createSdkClient(this.authConfig, this.config.baseUrl);

      // Platform products (平台商品库) - V4 User API
      if (request.platform) {
        const result = await client.v4User.listProducts({
          pageNumber: request.page ?? 1,
          pageSize: request.size ?? 20,
        });

        if (!result?.contents || result.contents.length === 0) {
          return [];
        }

        return result.contents.map((product: any) => ({
          productId: String(product.productId),
          channelId: '', // Platform products don't have channelId
          name: product.name,
          productType: product.productType,
          status: product.status,
          ...(product.price && { price: product.price }),
          ...(product.realPrice && { realPrice: product.realPrice }),
          createdAt: product.createdTime ? new Date(product.createdTime) : new Date(0),
          updatedAt: product.updatedTime ? new Date(product.updatedTime) : new Date(0)
        }));
      }

      // Channel products (频道商品列表) - V3 Channel API
      if (request.channelId) {
        const result = await client.channel.listChannelProducts({
          channelId: request.channelId,
          pageNumber: request.page ?? 1,
          pageSize: request.size ?? 20,
        });

        if (!result?.contents || result.contents.length === 0) {
          return [];
        }

        return result.contents.map((product) => ({
          productId: String(product.productId),
          channelId: String(product.channelId || ''),
          name: product.name,
          productType: (product.productType || 'normal') as 'normal' | 'finance' | 'position',
          status: product.status,
          ...(product.price && { price: product.price }),
          ...(product.realPrice && { realPrice: product.realPrice }),
          createdAt: product.createdTime ? new Date(product.createdTime) : new Date(0),
          updatedAt: product.lastModified ? new Date(product.lastModified) : new Date(0)
        }));
      }

      // Should not reach here if validation is correct
      return [];
    } catch (error) {
      throw this.handleError(error, 'listProducts');
    }
  }

  /**
   * Adds a new product to channel
   * @param options Product add options
   * @returns Promise resolving to product add result
   */
  async addProduct(options: ProductAddOptions): Promise<ProductAddResult> {
    try {
      this.validateAddOptions(options);

      const client = createSdkClient(this.authConfig, this.config.baseUrl);

      // Build SDK params
      const params: AddChannelProductParams = {
        channelId: options.channelId,
        name: options.name,
        status: options.status as 1 | 2,
        linkType: options.linkType as 10 | 11,
        ...(options.productType && { productType: options.productType }),
        ...(options.cover && { cover: options.cover }),
        ...(options.link && { link: options.link }),
        ...(options.pcLink && { pcLink: options.pcLink }),
        ...(options.mobileLink && { mobileLink: options.mobileLink }),
        ...(options.wxMiniprogramLink && { wxMiniprogramLink: options.wxMiniprogramLink }),
        ...(options.wxMiniprogramOriginalId && { wxMiniprogramOriginalId: options.wxMiniprogramOriginalId }),
        ...(options.mobileAppLink && { mobileAppLink: options.mobileAppLink }),
        ...(options.androidLink && { androidLink: options.androidLink }),
        ...(options.iosLink && { iosLink: options.iosLink }),
        ...(options.params && { params: options.params }),
        ...(options.productDesc && { productDesc: options.productDesc }),
        ...(options.features && { features: options.features }),
        ...(options.btnShow && { btnShow: options.btnShow }),
        ...(options.yield && { yield: options.yield }),
        ...(options.originId && { originId: options.originId }),
        ...(options.strategy && { strategy: options.strategy }),
        ...(options.productDetail && { productDetail: options.productDetail }),
        ...(options.ext && { ext: options.ext }),
        ...(options.tagIds && { tagIds: options.tagIds }),
        ...(options.priceType && { priceType: options.priceType }),
        ...(options.realPrice !== undefined && { realPrice: options.realPrice }),
        ...(options.customPrice && { customPrice: options.customPrice }),
        ...(options.originalPriceType && { originalPriceType: options.originalPriceType }),
        ...(options.price !== undefined && { price: options.price }),
        ...(options.customOrignalPrice && { customOrignalPrice: options.customOrignalPrice }),
      };

      const result = await client.channel.addChannelProduct(params);

      return {
        productId: result.productId,
        name: result.name,
        channelId: result.channelId,
        createdTime: result.createdTime
      };
    } catch (error) {
      throw this.handleError(error, 'addProduct');
    }
  }

  /**
   * Updates an existing product
   * @param options Product update options
   * @returns Promise resolving when update is complete
   */
  async updateProduct(options: ProductUpdateOptions): Promise<boolean> {
    try {
      this.validateUpdateOptions(options);

      const client = createSdkClient(this.authConfig, this.config.baseUrl);

      // Build SDK params
      const params: UpdateChannelProductParams = {
        channelId: options.channelId,
        productId: options.productId,
        name: options.name,
        status: options.status as 1 | 2,
        linkType: options.linkType as 10 | 11,
        ...(options.cover && { cover: options.cover }),
        ...(options.link && { link: options.link }),
        ...(options.pcLink && { pcLink: options.pcLink }),
        ...(options.mobileLink && { mobileLink: options.mobileLink }),
        ...(options.wxMiniprogramLink && { wxMiniprogramLink: options.wxMiniprogramLink }),
        ...(options.wxMiniprogramOriginalId && { wxMiniprogramOriginalId: options.wxMiniprogramOriginalId }),
        ...(options.mobileAppLink && { mobileAppLink: options.mobileAppLink }),
        ...(options.androidLink && { androidLink: options.androidLink }),
        ...(options.iosLink && { iosLink: options.iosLink }),
        ...(options.params && { params: options.params }),
        ...(options.productDesc && { productDesc: options.productDesc }),
        ...(options.features && { features: options.features }),
        ...(options.btnShow && { btnShow: options.btnShow }),
        ...(options.yield && { yield: options.yield }),
        ...(options.productDetail && { productDetail: options.productDetail }),
        ...(options.ext && { ext: options.ext }),
        ...(options.tagIds && { tagIds: options.tagIds }),
        ...(options.priceType && { priceType: options.priceType }),
        ...(options.realPrice !== undefined && { realPrice: options.realPrice }),
        ...(options.customPrice && { customPrice: options.customPrice }),
        ...(options.originalPriceType && { originalPriceType: options.originalPriceType }),
        ...(options.price !== undefined && { price: options.price }),
        ...(options.customOrignalPrice && { customOrignalPrice: options.customOrignalPrice }),
      };

      return await client.channel.updateChannelProduct(params);
    } catch (error) {
      throw this.handleError(error, 'updateProduct');
    }
  }

  /**
   * Deletes a product from channel
   * @param options Product delete options
   * @returns Promise resolving when delete is complete
   */
  async deleteProduct(options: ProductDeleteOptions): Promise<boolean> {
    try {
      this.validateDeleteOptions(options);

      const client = createSdkClient(this.authConfig, this.config.baseUrl);

      return await client.channel.deleteChannelProduct({
        channelId: options.channelId,
        productId: options.productId
      });
    } catch (error) {
      throw this.handleError(error, 'deleteProduct');
    }
  }

  // ===== Validation Methods =====

  private validateListRequest(request: ProductListRequest): void {
    const errors: string[] = [];

    if (request.page !== undefined) {
      if (typeof request.page !== 'number' || !Number.isInteger(request.page) || request.page < 1) {
        errors.push('page must be a positive integer (minimum 1)');
      }
    }

    if (request.size !== undefined) {
      if (typeof request.size !== 'number' || !Number.isInteger(request.size) || request.size < 1 || request.size > 100) {
        errors.push('size must be an integer between 1 and 100');
      }
    }

    if (request.channelId !== undefined && (typeof request.channelId !== 'string' || request.channelId.trim().length === 0)) {
      errors.push('channelId must be a non-empty string');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Product list request validation failed: ${errors.join(', ')}`,
        'request',
        request,
        'validation_failed'
      );
    }
  }

  private validateAddOptions(options: ProductAddOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }
    if (!options.name || options.name.trim() === '') {
      errors.push('name is required');
    }
    if (options.status === undefined) {
      errors.push('status is required (1 for on-shelf, 2 for off-shelf)');
    } else if (![1, 2].includes(options.status)) {
      errors.push('status must be 1 (on-shelf) or 2 (off-shelf)');
    }
    if (options.linkType === undefined) {
      errors.push('linkType is required (10 for universal, 11 for multi-platform)');
    } else if (![10, 11].includes(options.linkType)) {
      errors.push('linkType must be 10 (universal) or 11 (multi-platform)');
    }
    // linkType=10 requires link
    if (options.linkType === 10 && (!options.link || options.link.trim() === '')) {
      errors.push('link is required when linkType is 10');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Product add options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateUpdateOptions(options: ProductUpdateOptions): void {
    const errors: string[] = [];

    // Required fields for identifying the product
    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }
    if (options.productId === undefined) {
      errors.push('productId is required');
    }

    // Optional fields - only validate if provided
    if (options.status !== undefined && ![1, 2].includes(options.status)) {
      errors.push('status must be 1 or 2');
    }
    if (options.linkType !== undefined && ![10, 11].includes(options.linkType)) {
      errors.push('linkType must be 10 or 11');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Product update options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateDeleteOptions(options: ProductDeleteOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }
    if (options.productId === undefined) {
      errors.push('productId is required');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Product delete options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  // ===== Helper Methods =====

  private handleError(error: unknown, operation: string): Error {
    if (this.config.debug) {
      console.error(`[ProductServiceSdk] Error in ${operation}:`, error);
    }

    if (error instanceof PolyVError || error instanceof PolyVAPIError || error instanceof PolyVValidationError) {
      return error;
    }

    if (error instanceof Error) {
      const anyError = error as any;
      if (anyError.polyvCode || anyError.code) {
        return new PolyVAPIError(
          error.message,
          anyError.code || 'API_ERROR',
          anyError.status || 500,
          {
            polyvCode: anyError.polyvCode,
            polyvMessage: anyError.polyvMessage || error.message,
          }
        );
      }

      return new PolyVError(
        `Failed to ${operation}: ${error.message}`,
        'PRODUCT_SERVICE_ERROR',
        500,
        { originalError: error.message }
      );
    }

    return new PolyVError(
      `Failed to ${operation}: Unknown error`,
      'UNKNOWN_ERROR',
      500,
      { originalError: String(error) }
    );
  }
}
