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
  ProductDeleteOptions
} from '../types/product';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { confirmDeletion } from '../utils/confirmation';

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
}