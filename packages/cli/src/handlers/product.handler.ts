/**
 * @fileoverview Product command handler for CLI operations
 * @author Development Team
 * @since 7.1.0
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { ProductServiceSdk } from '../services/product.service.sdk';
import {
  ProductListRequest,
  ProductListItem,
  ProductServiceConfig,
  ProductAddOptions,
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
import { PolyVValidationError } from '../utils/errors';
import { confirmDeletion } from '../utils/confirmation';
import { confirmWrite } from '../utils/api-command';

/**
 * Options for product list command from CLI
 */
export interface ProductListOptions {
  /** Page number for pagination (minimum 1) */
  page?: number;
  /** Page size for pagination (1-100) */
  size?: number;
  /** Channel ID filter (required unless platform is true) */
  channelId?: string;
  /** List platform products instead of channel products */
  platform?: boolean;
  /** Output format (table or json) */
  output?: OutputFormat;
}

export interface ProductUpdateEnabledOptions {
  channelId: string;
  enabled: 'Y' | 'N';
  force?: boolean;
  output?: OutputFormat;
}

/**
 * Handler for product-related CLI commands
 */
export class ProductHandler extends BaseHandler {
  private readonly productService: ProductServiceSdk;

  /**
   * Creates a new ProductHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: ProductServiceConfig) {
    super();
    this.productService = new ProductServiceSdk(authConfig, serviceConfig);
  }

  /**
   * Lists products with pagination support
   * @param options Product list options from CLI
   * @returns Promise that resolves when products are listed
   * 
   * @throws {PolyVValidationError} When product options are invalid
   * @throws {PolyVError} When product listing fails
   * 
   * @example
   * ```typescript
   * await productHandler.listProducts({
   *   page: 1,
   *   size: 20,
   *   output: 'table'
   * });
   * ```
   */
  async listProducts(options: ProductListOptions = {}): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateListOptions(options);

      // Transform CLI options to API request
      const request = this.transformToListRequest(options);

      // List products via service
      const products = await this.productService.listProducts(request);

      // Display results
      this.displayProductsList(products, request, options.output);

    }, 'product.list');
  }

  /**
   * Validates product list options from CLI
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateListOptions(options: ProductListOptions): void {
    const errors: string[] = [];

    // Validate page parameter
    if (options.page !== undefined) {
      if (typeof options.page !== 'number' || !Number.isInteger(options.page) || options.page < 1) {
        errors.push('page must be a positive integer (minimum 1)');
      }
    }

    // Validate size parameter
    if (options.size !== undefined) {
      if (typeof options.size !== 'number' || !Number.isInteger(options.size) || options.size < 1 || options.size > 100) {
        errors.push('size must be an integer between 1 and 100');
      }
    }

    // Validate channelId parameter
    if (options.channelId !== undefined) {
      if (typeof options.channelId !== 'string' || options.channelId.trim().length === 0) {
        errors.push('channelId must be a non-empty string');
      }
    }

    // Validate output format
    if (options.output !== undefined && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Product list options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  /**
   * Transforms CLI options to API request format
   * @param options CLI options
   * @returns API request object
   */
  private transformToListRequest(options: ProductListOptions): ProductListRequest {
    return {
      ...(options.page !== undefined && { page: options.page }),
      ...(options.size !== undefined && { size: options.size }),
      ...(options.channelId !== undefined && { channelId: options.channelId }),
      ...(options.platform !== undefined && { platform: options.platform })
    };
  }

  /**
   * Displays products list in the specified format
   * @param products Array of product items
   * @param request Original API request for context
   * @param format Output format (table or json)
   */
  private displayProductsList(
    products: ProductListItem[],
    request: ProductListRequest,
    format: OutputFormat = 'table'
  ): void {
    const page = request.page || 1;
    const size = request.size || 20;

    if (products.length === 0) {
      if (request.platform) {
        this.displayInfo('No platform products found');
      } else if (request.channelId) {
        this.displayInfo(`No products found for channel ${request.channelId}`);
      } else {
        this.displayInfo('No products found');
      }
      return;
    }

    // Display pagination info
    const fromItem = (page - 1) * size + 1;
    const toItem = Math.min(fromItem + products.length - 1, fromItem + size - 1);

    this.displayInfo(`Showing products ${fromItem}-${toItem} (page ${page}, size ${size})`);

    if (request.platform) {
      this.displayInfo('Platform products (user-level product library)');
    } else if (request.channelId) {
      this.displayInfo(`Filtered by channel: ${request.channelId}`);
    }

    // Display products in the requested format
    if (format === 'json') {
      this.displayData(products, 'json');
    } else {
      this.displayProductsTable(products, request.platform);
    }
  }

  /**
   * Displays products as a formatted table
   * @param products Array of product items
   * @param isPlatform Whether displaying platform products (no channelId, no status)
   */
  private displayProductsTable(products: ProductListItem[], isPlatform?: boolean): void {
    // Transform products for better table display
    const tableData = products.map(product => {
      const row: Record<string, string> = {
        'Product ID': product.productId,
      };

      // Only show Channel ID for channel products (not platform products)
      if (!isPlatform) {
        row['Channel ID'] = product.channelId;
      }

      row['Name'] = product.name;
      row['Type'] = this.formatProductType(product.productType);

      // Only show Status for channel products (platform API doesn't return status)
      if (!isPlatform) {
        row['Status'] = this.formatProductStatus(product.status);
      }

      row['Price'] = this.formatPrice(product.price, product.realPrice);
      row['Created'] = product.createdAt.toLocaleDateString();
      row['Updated'] = product.updatedAt.toLocaleDateString();

      return row;
    });

    this.displayAsTable(tableData);
  }

  /**
   * Formats product type for display
   * @param type Product type
   * @returns Formatted product type string
   */
  private formatProductType(type: string): string {
    const typeMap: Record<string, string> = {
      'normal': 'Normal',
      'finance': 'Finance',
      'position': 'Position'
    };
    
    return typeMap[type] || type;
  }

  /**
   * Formats product status for display
   * @param status Product status number
   * @returns Formatted product status string
   */
  private formatProductStatus(status: number): string {
    // PolyV API status mappings: 1=上架(Active), 2=下架(Inactive)
    const statusMap: Record<number, string> = {
      1: '上架',
      2: '下架'
    };

    return statusMap[status] || `Status ${status}`;
  }

  /**
   * Formats product price for display
   * @param price Original price
   * @param realPrice Real/discounted price
   * @returns Formatted price string
   */
  private formatPrice(price?: number, realPrice?: number): string {
    if (price === undefined && realPrice === undefined) {
      return '-';
    }

    if (price !== undefined && realPrice !== undefined && price !== realPrice) {
      return `¥${realPrice} (was ¥${price})`;
    }

    const displayPrice = realPrice !== undefined ? realPrice : price;
    return `¥${displayPrice}`;
  }

  // ========================================
  // Add Product (Story 8-2)
  // ========================================

  /**
   * Adds a new product to channel
   * @param options Product add options from CLI
   * @returns Promise that resolves when product is added
   */
  async addProduct(options: ProductAddOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.productService.addProduct(options);
      this.displayAddResult(result, options.output);
    }, 'product.add');
  }

  /**
   * Displays add product result
   */
  private displayAddResult(result: { productId: number; name: string; channelId: string; createdTime: number }, format?: OutputFormat): void {
    const data = {
      productId: result.productId,
      name: result.name,
      channelId: result.channelId,
      created: new Date(result.createdTime).toISOString()
    };

    if (format === 'json') {
      this.displayData(data, 'json');
    } else {
      this.displaySuccess(`Product created successfully`, data, 'table');
    }
  }

  // ========================================
  // Update Product (Story 8-2)
  // ========================================

  /**
   * Updates an existing product
   * @param options Product update options from CLI
   * @returns Promise that resolves when product is updated
   */
  async updateProduct(options: ProductUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      await this.productService.updateProduct(options);
      this.displayUpdateResult(options, options.output);
    }, 'product.update');
  }

  /**
   * Displays update product result
   */
  private displayUpdateResult(options: ProductUpdateOptions, format?: OutputFormat): void {
    const data = {
      productId: options.productId,
      channelId: options.channelId,
      name: options.name,
      status: options.status === 1 ? 'Active' : 'Inactive',
      updated: new Date().toISOString()
    };

    if (format === 'json') {
      this.displayData(data, 'json');
    } else {
      this.displaySuccess(`Product updated successfully`, data, 'table');
    }
  }

  // ========================================
  // Delete Product (Story 8-2)
  // ========================================

  /**
   * Deletes a product from channel
   * @param options Product delete options from CLI
   * @returns Promise that resolves when product is deleted
   */
  async deleteProduct(options: ProductDeleteOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Check if confirmation is needed
      if (!options.force) {
        const confirmed = await confirmDeletion(
          `确定要删除商品 ${options.productId} 吗？此操作不可撤销。`,
          'yes'
        );
        if (!confirmed) {
          this.displayInfo('操作已取消');
          return;
        }
      }

      await this.productService.deleteProduct(options);
      this.displayDeleteResult(options, options.output);
    }, 'product.delete');
  }

  /**
   * Displays delete product result
   */
  private displayDeleteResult(options: ProductDeleteOptions, format?: OutputFormat): void {
    const data = {
      productId: options.productId,
      channelId: options.channelId,
      deleted: true,
      timestamp: new Date().toISOString()
    };

    if (format === 'json') {
      this.displayData(data, 'json');
    } else {
      this.displaySuccess(`Product ${options.productId} deleted successfully`, data, 'table');
    }
  }

  // ========================================
  // User-level Product Library
  // ========================================

  async listUserProducts(options: ProductLibraryListOptions = {}): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.productService.listUserProducts(options);
      this.displayData(result, options.output || 'table');
    }, 'product.library.list');
  }

  async createUserProduct(options: ProductLibraryCreateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['name', 'linkType', 'link']);
      await confirmWrite(options.force, `Create user product "${options.name}"?`);
      const result = await this.productService.createUserProduct(options);
      this.displayWriteResult('User product created successfully', { productId: result }, options.output);
    }, 'product.library.create');
  }

  async updateUserProduct(options: ProductLibraryUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['productId', 'name', 'linkType', 'link']);
      await confirmWrite(options.force, `Update user product ${options.productId}?`);
      await this.productService.updateUserProduct(options);
      this.displayWriteResult('User product updated successfully', { productId: options.productId }, options.output);
    }, 'product.library.update');
  }

  async deleteUserProduct(options: ProductLibraryDeleteOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['productId']);
      await confirmWrite(options.force, `Delete user product ${options.productId}?`);
      await this.productService.deleteUserProduct(options);
      this.displayWriteResult('User product deleted successfully', { productId: options.productId }, options.output);
    }, 'product.library.delete');
  }

  async listProductTags(options: ProductTagListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId']);
      const result = await this.productService.listProductTags(options);
      this.displayData(result, options.output || 'table');
    }, 'product.tag.list');
  }

  async createProductTag(options: ProductTagCreateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['name']);
      await confirmWrite(options.force, `Create product tag "${options.name}"?`);
      const result = await this.productService.createProductTag(options);
      this.displayWriteResult('Product tag created successfully', result, options.output);
    }, 'product.tag.create');
  }

  async updateProductTag(options: ProductTagUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['id', 'name']);
      await confirmWrite(options.force, `Update product tag ${options.id}?`);
      await this.productService.updateProductTag(options);
      this.displayWriteResult('Product tag updated successfully', { id: options.id, name: options.name }, options.output);
    }, 'product.tag.update');
  }

  async deleteProductTag(options: ProductTagDeleteOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['id']);
      await confirmWrite(options.force, `Delete product tag ${options.id}?`);
      await this.productService.deleteProductTag(options);
      this.displayWriteResult('Product tag deleted successfully', { id: options.id }, options.output);
    }, 'product.tag.delete');
  }

  async listProductOrders(options: ProductOrderListOptions = {}): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.productService.listProductOrders(options);
      this.displayData(result, options.output || 'table');
    }, 'product.order.list');
  }

  async getProductOrder(options: ProductOrderGetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['orderNo']);
      const result = await this.productService.getProductOrder(options);
      this.displayData(result, options.output || 'table');
    }, 'product.order.get');
  }

  async batchUpdateProductOrderStatus(options: ProductOrderBatchStatusOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['orderNos', 'status']);
      await confirmWrite(options.force, `Update status for product orders ${options.orderNos}?`);
      const result = await this.productService.batchUpdateProductOrderStatus(options);
      this.displayWriteResult('Product order status updated successfully', result, options.output);
    }, 'product.order.batchStatus');
  }

  async getChannelProductEnabled(options: { channelId: string; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId']);
      const result = await this.productService.getChannelProductEnabled(options.channelId);
      this.displayData(result, options.output || 'table');
    }, 'product.enabled.get');
  }

  async updateChannelProductEnabled(options: ProductUpdateEnabledOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId', 'enabled']);
      this.validateYn(options.enabled, 'enabled');
      await confirmWrite(options.force, `Update channel product library switch for channel ${options.channelId}?`);
      await this.productService.updateChannelProductEnabled({
        channelId: options.channelId,
        enabled: options.enabled,
      });
      this.displayWriteResult('Channel product library switch updated successfully', {
        channelId: options.channelId,
        enabled: options.enabled,
      }, options.output);
    }, 'product.update-enabled');
  }

  async batchAddChannelProducts(options: { channelId: string; products: any[]; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId', 'products']);
      await confirmWrite(options.force, `Add ${options.products.length} product(s) to channel ${options.channelId}?`);
      const result = await this.productService.batchAddChannelProducts({
        channelId: options.channelId,
        products: options.products,
      });
      this.displayWriteResult('Channel products added successfully', result, options.output);
    }, 'product.batch-add');
  }

  async batchDeleteChannelProducts(options: { channelId: string; productIds: number[]; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId', 'productIds']);
      await confirmWrite(options.force, `Delete product(s) ${options.productIds.join(',')} from channel ${options.channelId}?`);
      const result = await this.productService.batchDeleteChannelProducts({
        channelId: options.channelId,
        productIds: options.productIds,
      });
      this.displayWriteResult('Channel products deleted successfully', result, options.output);
    }, 'product.batch-delete');
  }

  async batchShelfChannelProducts(options: { channelId: string; productIds: number[]; shelf: 1 | 2; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId', 'productIds', 'shelf']);
      await confirmWrite(options.force, `Update shelf status for product(s) ${options.productIds.join(',')}?`);
      const result = await this.productService.batchShelfChannelProducts({
        channelId: options.channelId,
        productIds: options.productIds,
        shelf: options.shelf,
      });
      this.displayWriteResult('Channel products shelf status updated successfully', result, options.output);
    }, 'product.batch-shelf');
  }

  async shelfChannelProduct(options: { channelId: string; productId: number; shelf: 1 | 2; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId', 'productId', 'shelf']);
      await confirmWrite(options.force, `Update shelf status for product ${options.productId}?`);
      const result = await this.productService.shelfChannelProduct(options);
      this.displayWriteResult('Channel product shelf status updated successfully', result, options.output);
    }, 'product.shelf');
  }

  async sortChannelProduct(options: { channelId: string; productId: number; type: 10 | 20 | 50; sort?: number; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId', 'productId', 'type']);
      await confirmWrite(options.force, `Sort product ${options.productId} in channel ${options.channelId}?`);
      const result = await this.productService.sortChannelProduct(options);
      this.displayWriteResult('Channel product sorted successfully', result, options.output);
    }, 'product.sort');
  }

  async pushChannelProduct(options: { channelId: string; productId: number; pushCardType?: 'smallCard' | 'bigCard'; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId', 'productId']);
      await confirmWrite(options.force, `Push product ${options.productId} to viewers?`);
      const result = await this.productService.pushChannelProduct(options);
      this.displayWriteResult('Channel product pushed successfully', result, options.output);
    }, 'product.push');
  }

  async cancelPushChannelProduct(options: { channelId: string; productId: number; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId', 'productId']);
      await confirmWrite(options.force, `Cancel pushed product ${options.productId}?`);
      const result = await this.productService.cancelPushChannelProduct(options);
      this.displayWriteResult('Channel product push cancelled successfully', result, options.output);
    }, 'product.cancel-push');
  }

  async referenceProduct(options: { channelId: string; originId: string; status: 1 | 2; withTags?: boolean; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId', 'originId', 'status']);
      await confirmWrite(options.force, `Reference platform product ${options.originId} into channel ${options.channelId}?`);
      const result = await this.productService.referenceProduct(options);
      this.displayWriteResult('Platform product referenced successfully', result, options.output);
    }, 'product.reference');
  }

  async getProductPushRule(options: { channelId: string; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId']);
      const result = await this.productService.getProductPushRule({ channelId: options.channelId });
      this.displayData(result, options.output || 'table');
    }, 'product.push-rule.get');
  }

  async updateProductPushRule(options: Record<string, any> & { channelId: string; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId']);
      this.requireAtLeastOne(options, [
        'productExplainEnabled',
        'productExplainingAutoPushAndSticky',
        'productListSortType',
        'productTagSortType',
        'productPushRule',
        'productHotEffectEnabled',
        'normalProductHotEffectTips',
        'jobProductHotEffectTips',
        'financeProductHotEffectTips',
        'outLinkProductRedirectEnabled',
        'productTagSortOrderIds',
      ]);
      await confirmWrite(options.force, `Update product push rule for channel ${options.channelId}?`);
      await this.productService.updateProductPushRule(options);
      this.displayWriteResult('Product push rule updated successfully', { channelId: options.channelId }, options.output);
    }, 'product.push-rule.update');
  }

  async listChannelProductTags(options: { channelId: string; page?: number; size?: number; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId']);
      const result = await this.productService.listChannelProductTags(options);
      this.displayData(result, options.output || 'table');
    }, 'product.channel-tag.list');
  }

  async createChannelProductTag(options: { channelId: string; name: string; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId', 'name']);
      await confirmWrite(options.force, `Create channel product tag "${options.name}" in channel ${options.channelId}?`);
      const result = await this.productService.createChannelProductTag(options);
      this.displayWriteResult('Channel product tag created successfully', result, options.output);
    }, 'product.channel-tag.create');
  }

  async updateChannelProductTag(options: { channelId: string; id: number; name: string; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId', 'id', 'name']);
      await confirmWrite(options.force, `Update channel product tag ${options.id} in channel ${options.channelId}?`);
      await this.productService.updateChannelProductTag(options);
      this.displayWriteResult('Channel product tag updated successfully', { channelId: options.channelId, id: options.id, name: options.name }, options.output);
    }, 'product.channel-tag.update');
  }

  async deleteChannelProductTag(options: { channelId: string; id: number; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId', 'id']);
      await confirmWrite(options.force, `Delete channel product tag ${options.id} from channel ${options.channelId}?`);
      await this.productService.deleteChannelProductTag(options);
      this.displayWriteResult('Channel product tag deleted successfully', { channelId: options.channelId, id: options.id }, options.output);
    }, 'product.channel-tag.delete');
  }

  async listProductStats(options: { channelId: string; productId?: string; productName?: string; sessionId?: string; page?: number; size?: number; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId']);
      const result = await this.productService.listProductStats(options);
      this.displayData(result, options.output || 'table');
    }, 'product.stats.list');
  }

  async getProductStatsSummary(options: { channelId: string; sessionId?: string; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId']);
      const result = await this.productService.getProductStatsSummary(options);
      this.displayData(result, options.output || 'table');
    }, 'product.stats.summary');
  }

  async sortChannelProductRank(options: { channelId: string; productId: number; rank: number; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId', 'productId', 'rank']);
      await confirmWrite(options.force, `Set product ${options.productId} rank to ${options.rank} in channel ${options.channelId}?`);
      await this.productService.sortChannelProductRank(options);
      this.displayWriteResult('Channel product rank updated successfully', { channelId: options.channelId, productId: options.productId, rank: options.rank }, options.output);
    }, 'product.rank');
  }

  async toppingChannelProduct(options: { channelId: string; productId: number; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId', 'productId']);
      await confirmWrite(options.force, `Top product ${options.productId} in channel ${options.channelId}?`);
      await this.productService.toppingChannelProduct(options);
      this.displayWriteResult('Channel product topped successfully', { channelId: options.channelId, productId: options.productId }, options.output);
    }, 'product.topping');
  }

  async untoppingChannelProduct(options: { channelId: string; productId: number; force?: boolean; output?: OutputFormat }): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.requireFields(options, ['channelId', 'productId']);
      await confirmWrite(options.force, `Untop product ${options.productId} in channel ${options.channelId}?`);
      await this.productService.untoppingChannelProduct(options);
      this.displayWriteResult('Channel product untopped successfully', { channelId: options.channelId, productId: options.productId }, options.output);
    }, 'product.untopping');
  }

  private displayWriteResult(message: string, data: unknown, output?: OutputFormat): void {
    if (output === 'json') {
      this.displayData({ success: true, data }, 'json');
    } else {
      this.displaySuccess(message, data, 'table');
    }
  }

  private requireFields(options: object, fields: string[]): void {
    const record = options as Record<string, unknown>;
    const missing = fields.filter((field) => {
      const value = record[field];
      return value === undefined || value === null || value === '';
    });
    if (missing.length > 0) {
      throw new PolyVValidationError(
        `Missing required option(s): ${missing.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateYn(value: string, fieldName: string): void {
    if (value !== 'Y' && value !== 'N') {
      throw new PolyVValidationError(`${fieldName} must be Y or N`, fieldName, value, 'invalid_value');
    }
  }

  private requireAtLeastOne(options: Record<string, unknown>, fields: string[]): void {
    const present = fields.some((field) => {
      const value = options[field];
      return value !== undefined && value !== null && value !== '';
    });
    if (!present) {
      throw new PolyVValidationError(
        `At least one option is required: ${fields.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }
}
