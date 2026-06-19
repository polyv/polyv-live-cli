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
  ProductDeleteOptions,
  ProductLibraryListOptions,
  ProductLibraryCreateOptions,
  ProductLibraryUpdateOptions,
  ProductLibraryDeleteOptions,
  ProductTagListOptions,
  ProductTagCreateOptions,
  ProductTagUpdateOptions,
  ProductTagDeleteOptions,
  ProductOrderListOptions,
  ProductOrderGetOptions,
  ProductOrderBatchStatusOptions
} from '../types/product';
import { AuthConfig } from '../types/auth';
import { PolyVError, PolyVAPIError, PolyVValidationError } from '../utils/errors';
import { createSdkClient } from '../sdk';
import type {
  AddChannelProductParams,
  UpdateChannelProductParams,
  ProductOrder,
  ListProductOrdersResponse,
  BatchUpdateOrderStatusResponse,
  ListProductTagsResponse
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

  // ========================================
  // User-level Product Library APIs
  // ========================================

  async listUserProducts(options: ProductLibraryListOptions = {}) {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return client.v4User.listProducts({
        pageNumber: options.page ?? 1,
        pageSize: options.size ?? 20,
        ...(options.keyword && { keyword: options.keyword }),
        ...(options.productType && { productType: options.productType }),
      });
    } catch (error) {
      throw this.handleError(error, 'listUserProducts');
    }
  }

  async createUserProduct(options: ProductLibraryCreateOptions) {
    try {
      this.validateUserProductOptions(options, ['name', 'linkType', 'link']);
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return client.v4User.createProduct(this.toUserProductParams(options));
    } catch (error) {
      throw this.handleError(error, 'createUserProduct');
    }
  }

  async updateUserProduct(options: ProductLibraryUpdateOptions): Promise<void> {
    try {
      this.validateUserProductOptions(options, ['productId', 'name', 'linkType', 'link']);
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      await client.v4User.updateProduct(this.toUserProductParams(options));
    } catch (error) {
      throw this.handleError(error, 'updateUserProduct');
    }
  }

  async deleteUserProduct(options: ProductLibraryDeleteOptions): Promise<void> {
    try {
      if (!options.productId || options.productId.trim() === '') {
        throw new PolyVValidationError('productId is required', 'productId', options.productId, 'required');
      }
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      await client.v4User.deleteProduct({ productId: options.productId });
    } catch (error) {
      throw this.handleError(error, 'deleteUserProduct');
    }
  }

  async listProductTags(options: ProductTagListOptions): Promise<ListProductTagsResponse> {
    try {
      if (!options.channelId || options.channelId.trim() === '') {
        throw new PolyVValidationError('channelId is required', 'channelId', options.channelId, 'required');
      }
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return client.v4User.listProductTags({
        channelId: options.channelId,
        pageNumber: options.page ?? 1,
        pageSize: options.size ?? 20,
        ...(options.keyword && { keyword: options.keyword }),
      });
    } catch (error) {
      throw this.handleError(error, 'listProductTags');
    }
  }

  async createProductTag(options: ProductTagCreateOptions) {
    try {
      if (!options.name || options.name.trim() === '') {
        throw new PolyVValidationError('name is required', 'name', options.name, 'required');
      }
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return client.v4User.createProductTag({ name: options.name });
    } catch (error) {
      throw this.handleError(error, 'createProductTag');
    }
  }

  async updateProductTag(options: ProductTagUpdateOptions): Promise<void> {
    try {
      if (!options.id || options.id <= 0) {
        throw new PolyVValidationError('id must be a positive integer', 'id', options.id, 'positive_integer');
      }
      if (!options.name || options.name.trim() === '') {
        throw new PolyVValidationError('name is required', 'name', options.name, 'required');
      }
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      await client.v4User.updateProductTag({ id: options.id, name: options.name });
    } catch (error) {
      throw this.handleError(error, 'updateProductTag');
    }
  }

  async deleteProductTag(options: ProductTagDeleteOptions): Promise<void> {
    try {
      if (!options.id || options.id <= 0) {
        throw new PolyVValidationError('id must be a positive integer', 'id', options.id, 'positive_integer');
      }
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      await client.v4User.deleteProductTag({ id: options.id });
    } catch (error) {
      throw this.handleError(error, 'deleteProductTag');
    }
  }

  async listProductOrders(options: ProductOrderListOptions): Promise<ListProductOrdersResponse> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return client.v4User.listProductOrders({
        pageNumber: options.page ?? 1,
        pageSize: options.size ?? 20,
      });
    } catch (error) {
      throw this.handleError(error, 'listProductOrders');
    }
  }

  async getProductOrder(options: ProductOrderGetOptions): Promise<ProductOrder> {
    try {
      if (!options.orderNo || options.orderNo.trim() === '') {
        throw new PolyVValidationError('orderNo is required', 'orderNo', options.orderNo, 'required');
      }
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return client.v4User.getProductOrder({ orderNo: options.orderNo });
    } catch (error) {
      throw this.handleError(error, 'getProductOrder');
    }
  }

  async batchUpdateProductOrderStatus(options: ProductOrderBatchStatusOptions): Promise<BatchUpdateOrderStatusResponse | null> {
    try {
      const orderNos = this.parseStringList(options.orderNos, 'orderNos');
      if (orderNos.length > 1000) {
        throw new PolyVValidationError('orderNos cannot exceed 1000 items', 'orderNos', options.orderNos, 'max_items');
      }
      if (!options.status || options.status.trim() === '') {
        throw new PolyVValidationError('status is required', 'status', options.status, 'required');
      }
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return client.v4User.batchUpdateOrderStatus({
        orderNos,
        status: options.status,
      });
    } catch (error) {
      throw this.handleError(error, 'batchUpdateProductOrderStatus');
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

  private validateUserProductOptions(options: object, requiredFields: string[]): void {
    const values = options as Record<string, unknown>;
    const errors: string[] = [];
    for (const field of requiredFields) {
      const value = values[field];
      if (value === undefined || value === null || value === '') {
        errors.push(`${field} is required`);
      }
    }

    if (values['linkType'] !== undefined && ![10, 11, 12].includes(Number(values['linkType']))) {
      errors.push('linkType must be 10, 11, or 12');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `User product options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private toUserProductParams(options: ProductLibraryCreateOptions | ProductLibraryUpdateOptions): any {
    return this.compact({
      ...('productId' in options ? { productId: options.productId } : {}),
      name: options.name,
      linkType: options.linkType,
      link: options.link,
      cover: options.cover,
      productType: options.productType,
      pcLink: options.pcLink,
      mobileLink: options.mobileLink,
      wxMiniprogramOriginalId: options.wxMiniprogramOriginalId,
      wxMiniprogramLink: options.wxMiniprogramLink,
      mobileAppLink: options.mobileAppLink,
      iosLink: options.iosLink,
      androidLink: options.androidLink,
      otherLink: options.otherLink,
      features: options.features,
      tagIds: options.tagIds ? this.parseNumberList(options.tagIds, 'tagIds') : undefined,
      btnShow: options.btnShow,
      productDesc: options.productDesc,
      productDetail: options.productDetail,
      ext: options.ext,
      priceType: options.priceType,
      realPrice: options.realPrice,
      customPrice: options.customPrice,
      originalPriceType: options.originalPriceType,
      price: options.price,
      customOrignalPrice: options.customOrignalPrice,
    });
  }

  private parseStringList(value: string, fieldName: string): string[] {
    const list = value.split(',').map(item => item.trim()).filter(Boolean);
    if (list.length === 0) {
      throw new PolyVValidationError(`${fieldName} must not be empty`, fieldName, value, 'not_empty');
    }
    return Array.from(new Set(list));
  }

  private parseNumberList(value: string, fieldName: string): number[] {
    return this.parseStringList(value, fieldName).map(item => {
      const parsed = Number(item);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new PolyVValidationError(`${fieldName} must contain positive integers`, fieldName, value, 'positive_integer_list');
      }
      return parsed;
    });
  }

  private compact<T extends Record<string, unknown>>(params: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    ) as Partial<T>;
  }

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
