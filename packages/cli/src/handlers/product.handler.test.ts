/**
 * @fileoverview Unit tests for ProductHandler
 * @author Development Team
 * @since 7.1.0
 */

import { ProductHandler, ProductListOptions } from './product.handler';
import { ProductServiceSdk } from '../services/product.service.sdk';
import { ProductServiceConfig, ProductListItem, ProductType } from '../types/product';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError, PolyVError } from '../utils/errors';

// Mock ProductServiceSdk
jest.mock('../services/product.service.sdk');
const MockedProductService = ProductServiceSdk as jest.MockedClass<typeof ProductServiceSdk>;

// Mock confirmation utility
jest.mock('../utils/confirmation', () => ({
  confirmDeletion: jest.fn()
}));

import { confirmDeletion } from '../utils/confirmation';
const mockConfirmDeletion = confirmDeletion as jest.MockedFunction<typeof confirmDeletion>;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('ProductHandler', () => {
  let productHandler: ProductHandler;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: ProductServiceConfig;
  let mockProductService: jest.Mocked<ProductService>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock auth config
    mockAuthConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id'
    };

    // Mock service config
    mockServiceConfig = {
      baseUrl: 'https://api.polyv.net',
      timeout: 30000,
      debug: false
    };

    // Create mock service instance
    mockProductService = {
      listProducts: jest.fn(),
      addProduct: jest.fn(),
      updateProduct: jest.fn(),
      updateChannelProductEnabled: jest.fn(),
      deleteProduct: jest.fn()
    } as any;

    // Mock ProductService constructor
    MockedProductService.mockImplementation(() => mockProductService);

    // Create handler instance
    productHandler = new ProductHandler(mockAuthConfig, mockServiceConfig);
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('constructor', () => {
    it('should create ProductService with correct configuration', () => {
      expect(MockedProductService).toHaveBeenCalledWith(mockAuthConfig, mockServiceConfig);
    });
  });

  describe('listProducts', () => {
    const mockProductItems: ProductListItem[] = [
      {
        productId: '123',
        channelId: '456',
        name: 'Test Product 1',
        productType: 'normal' as ProductType,
        status: 1,
        price: 100,
        realPrice: 90,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      },
      {
        productId: '124',
        channelId: '457',
        name: 'Test Product 2',
        productType: 'finance' as ProductType,
        status: 0,
        createdAt: new Date('2023-01-03'),
        updatedAt: new Date('2023-01-04')
      }
    ];

    it('should list products successfully with default options', async () => {
      mockProductService.listProducts.mockResolvedValue(mockProductItems);

      await productHandler.listProducts();

      expect(mockProductService.listProducts).toHaveBeenCalledWith({});
      expect(mockConsoleLog).toHaveBeenCalledWith('ℹ️  Showing products 1-2 (page 1, size 20)');
    });

    it('should list products with custom options', async () => {
      const options: ProductListOptions = {
        page: 2,
        size: 10,
        channelId: '789',
        output: 'json'
      };

      mockProductService.listProducts.mockResolvedValue(mockProductItems);

      await productHandler.listProducts(options);

      expect(mockProductService.listProducts).toHaveBeenCalledWith({
        page: 2,
        size: 10,
        channelId: '789'
      });
      expect(mockConsoleLog).toHaveBeenCalledWith('ℹ️  Showing products 11-12 (page 2, size 10)');
      expect(mockConsoleLog).toHaveBeenCalledWith('ℹ️  Filtered by channel: 789');
    });

    it('should display products in JSON format', async () => {
      const options: ProductListOptions = {
        output: 'json'
      };

      mockProductService.listProducts.mockResolvedValue(mockProductItems);

      await productHandler.listProducts(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(JSON.stringify(mockProductItems, null, 2));
    });

    it('should display products in table format (default)', async () => {
      mockProductService.listProducts.mockResolvedValue(mockProductItems);

      await productHandler.listProducts();

      // Should not call JSON.stringify for table format
      expect(mockConsoleLog).not.toHaveBeenCalledWith(JSON.stringify(mockProductItems, null, 2));
    });

    it('should handle empty product list', async () => {
      mockProductService.listProducts.mockResolvedValue([]);

      await productHandler.listProducts();

      expect(mockConsoleLog).toHaveBeenCalledWith('ℹ️  No products found');
    });

    it('should handle empty product list with channel filter', async () => {
      const options: ProductListOptions = {
        channelId: '789'
      };

      mockProductService.listProducts.mockResolvedValue([]);

      await productHandler.listProducts(options);

      expect(mockConsoleLog).toHaveBeenCalledWith('ℹ️  No products found for channel 789');
    });

    it('should throw PolyVValidationError on invalid page parameter', async () => {
      const invalidOptions: ProductListOptions = {
        page: 0
      };

      await expect(productHandler.listProducts(invalidOptions)).rejects.toThrow(PolyVValidationError);
      await expect(productHandler.listProducts(invalidOptions)).rejects.toThrow('page must be a positive integer');
    });

    it('should throw PolyVValidationError on invalid size parameter', async () => {
      const invalidOptions: ProductListOptions = {
        size: 101
      };

      await expect(productHandler.listProducts(invalidOptions)).rejects.toThrow(PolyVValidationError);
      await expect(productHandler.listProducts(invalidOptions)).rejects.toThrow('size must be an integer between 1 and 100');
    });

    it('should throw PolyVValidationError on empty channelId parameter', async () => {
      const invalidOptions: ProductListOptions = {
        channelId: ''
      };

      await expect(productHandler.listProducts(invalidOptions)).rejects.toThrow(PolyVValidationError);
      await expect(productHandler.listProducts(invalidOptions)).rejects.toThrow('channelId must be a non-empty string');
    });

    it('should throw PolyVValidationError on invalid output format', async () => {
      const invalidOptions: ProductListOptions = {
        output: 'xml' as any
      };

      await expect(productHandler.listProducts(invalidOptions)).rejects.toThrow(PolyVValidationError);
      await expect(productHandler.listProducts(invalidOptions)).rejects.toThrow('output must be either "table" or "json"');
    });

    it('should handle service errors', async () => {
      const serviceError = new PolyVError('Service error', 'SERVICE_ERROR', 500);
      mockProductService.listProducts.mockRejectedValue(serviceError);

      await expect(productHandler.listProducts()).rejects.toThrow(serviceError);
    });
  });

  describe('validation', () => {
    it('should validate multiple errors together', async () => {
      const invalidOptions: ProductListOptions = {
        page: -1,
        size: 200,
        channelId: '',
        output: 'xml' as any
      };

      await expect(productHandler.listProducts(invalidOptions)).rejects.toThrow(PolyVValidationError);
      const error = await productHandler.listProducts(invalidOptions).catch(e => e);
      expect(error.message).toContain('page must be a positive integer');
      expect(error.message).toContain('size must be an integer between 1 and 100');
      expect(error.message).toContain('channelId must be a non-empty string');
      expect(error.message).toContain('output must be either "table" or "json"');
    });

    it('should allow undefined optional parameters', async () => {
      const options: ProductListOptions = {
        page: undefined,
        size: undefined,
        channelId: undefined,
        output: undefined
      };

      mockProductService.listProducts.mockResolvedValue([]);

      await expect(productHandler.listProducts(options)).resolves.toBeUndefined();
    });
  });

  describe('formatProductType', () => {
    it('should format product types correctly', () => {
      const handler = productHandler as any;
      
      expect(handler.formatProductType('normal')).toBe('Normal');
      expect(handler.formatProductType('finance')).toBe('Finance');
      expect(handler.formatProductType('position')).toBe('Position');
      expect(handler.formatProductType('unknown')).toBe('unknown');
    });
  });

  describe('formatProductStatus', () => {
    it('should format product status correctly', () => {
      const handler = productHandler as any;

      // PolyV API: 1=上架(Active), 2=下架(Inactive)
      expect(handler.formatProductStatus(1)).toBe('上架');
      expect(handler.formatProductStatus(2)).toBe('下架');
      expect(handler.formatProductStatus(0)).toBe('Status 0');
      expect(handler.formatProductStatus(99)).toBe('Status 99');
    });
  });

  describe('formatPrice', () => {
    it('should format prices correctly', () => {
      const handler = productHandler as any;
      
      // No price
      expect(handler.formatPrice(undefined, undefined)).toBe('-');
      
      // Only original price
      expect(handler.formatPrice(100, undefined)).toBe('¥100');
      
      // Only real price
      expect(handler.formatPrice(undefined, 90)).toBe('¥90');
      
      // Same price and real price
      expect(handler.formatPrice(100, 100)).toBe('¥100');
      
      // Different price and real price (discounted)
      expect(handler.formatPrice(100, 90)).toBe('¥90 (was ¥100)');
    });
  });

  describe('pagination calculation', () => {
    it('should calculate pagination info correctly', async () => {
      const options: ProductListOptions = {
        page: 3,
        size: 5
      };

      const singleItem: ProductListItem = {
        productId: '123',
        channelId: '456',
        name: 'Test Product',
        productType: 'normal' as ProductType,
        status: 1,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      };

      mockProductService.listProducts.mockResolvedValue([singleItem]);

      await productHandler.listProducts(options);

      // Page 3, size 5 = items 11-15, but only 1 item returned
      expect(mockConsoleLog).toHaveBeenCalledWith('ℹ️  Showing products 11-11 (page 3, size 5)');
    });
  });

  // ============================================================
  // ATDD FAILING TESTS - Story 8-2: product add/update/delete
  // These tests will FAIL until the feature is implemented (TDD red phase)
  // ============================================================

  describe('addProduct (AC #1)', () => {
    const mockAddResponse = {
      productId: '123456',
      userId: 'test-user-id',
      channelId: 'test-channel-id',
      name: 'Test Product',
      productType: 'normal',
      cover: 'https://example.com/cover.jpg',
      link: 'https://example.com/product',
      status: 1,
      createdTime: Date.now(),
      lastModified: Date.now()
    };

    it('should add a normal product successfully', async () => {
      const options = {
        channelId: 'test-channel-id',
        name: 'Test Product',
        status: 1 as const,
        linkType: 10 as const,
        link: 'https://example.com/product',
        cover: 'https://example.com/cover.jpg',
        realPrice: 99.9,
        price: 199.9,
        output: 'table' as const
      };

      mockProductService.addProduct.mockResolvedValue({
        productId: 123456,
        name: 'Test Product',
        channelId: 'test-channel-id',
        createdTime: Date.now()
      });

      await productHandler.addProduct(options);

      expect(mockProductService.addProduct).toHaveBeenCalledWith(options);
    });

    it('should add a finance product with yield field', async () => {
      const options = {
        channelId: 'test-channel-id',
        name: 'Finance Product',
        productType: 'finance' as const,
        status: 1 as const,
        linkType: 10 as const,
        link: 'https://example.com/finance',
        yield: '5.5%',
        output: 'json' as const
      };

      mockProductService.addProduct.mockResolvedValue({
        productId: 123456,
        name: 'Finance Product',
        channelId: 'test-channel-id',
        createdTime: Date.now()
      });

      await productHandler.addProduct(options);

      expect(mockProductService.addProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          productType: 'finance',
          yield: '5.5%'
        })
      );
    });

    it('should add a position product with required fields', async () => {
      const options = {
        channelId: 'test-channel-id',
        name: 'Position Product',
        productType: 'position' as const,
        status: 1 as const,
        linkType: 10 as const,
        link: 'https://example.com/position',
        productDesc: 'Job description',
        btnShow: 'Apply Now',
        params: JSON.stringify({ treatment: 'Competitive' }),
        output: 'table' as const
      };

      mockProductService.addProduct.mockResolvedValue({
        productId: 123456,
        name: 'Position Product',
        channelId: 'test-channel-id',
        createdTime: Date.now()
      });

      await productHandler.addProduct(options);

      expect(mockProductService.addProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          productType: 'position',
          productDesc: 'Job description',
          btnShow: 'Apply Now',
          params: JSON.stringify({ treatment: 'Competitive' })
        })
      );
    });

    it('should throw validation error when required fields are missing', async () => {
      const options = {
        channelId: '',
        name: 'Test Product',
        status: 1 as const,
        linkType: 10 as const,
        output: 'table' as const
      };

      // Mock service to throw validation error for empty channelId
      mockProductService.addProduct.mockRejectedValue(
        new PolyVValidationError('channelId is required', 'channelId', '', 'required')
      );

      await expect(productHandler.addProduct(options)).rejects.toThrow();
    });

    it('should throw validation error for invalid status', async () => {
      const options = {
        channelId: 'test-channel-id',
        name: 'Test Product',
        status: 3 as any, // Invalid status
        linkType: 10 as const,
        output: 'table' as const
      };

      // Mock service to throw validation error for invalid status
      mockProductService.addProduct.mockRejectedValue(
        new PolyVValidationError('status must be 1 or 2', 'status', 3, 'invalid')
      );

      await expect(productHandler.addProduct(options)).rejects.toThrow();
    });

    it('should display result in table format', async () => {
      const options = {
        channelId: 'test-channel-id',
        name: 'Test Product',
        status: 1 as const,
        linkType: 10 as const,
        link: 'https://example.com/product',
        output: 'table' as const
      };

      mockProductService.addProduct.mockResolvedValue({
        productId: 123456,
        name: 'Test Product',
        channelId: 'test-channel-id',
        createdTime: Date.now()
      });

      await productHandler.addProduct(options);

      // Should display success message with product ID
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Product created successfully')
      );
    });

    it('should display result in JSON format', async () => {
      const options = {
        channelId: 'test-channel-id',
        name: 'Test Product',
        status: 1 as const,
        linkType: 10 as const,
        link: 'https://example.com/product',
        output: 'json' as const
      };

      const mockResult = {
        productId: 123456,
        name: 'Test Product',
        channelId: 'test-channel-id',
        createdTime: Date.now()
      };

      mockProductService.addProduct.mockResolvedValue(mockResult);

      await productHandler.addProduct(options);

      // Handler transforms the response for JSON output
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('123456')
      );
    });
  });

  describe('updateProduct (AC #2)', () => {
    it('should update product name only', async () => {
      const options = {
        channelId: 'test-channel-id',
        productId: 123456,
        name: 'Updated Product Name',
        status: 1 as const,
        linkType: 10 as const,
        output: 'table' as const
      };

      mockProductService.updateProduct.mockResolvedValue(true);

      await productHandler.updateProduct(options);

      expect(mockProductService.updateProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: 'test-channel-id',
          productId: 123456,
          name: 'Updated Product Name'
        })
      );
    });

    it('should update multiple fields', async () => {
      const options = {
        channelId: 'test-channel-id',
        productId: 123456,
        name: 'Updated Name',
        status: 2 as const,
        linkType: 10 as const,
        realPrice: 88.8,
        output: 'json' as const
      };

      mockProductService.updateProduct.mockResolvedValue(true);

      await productHandler.updateProduct(options);

      expect(mockProductService.updateProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: 'test-channel-id',
          productId: 123456,
          name: 'Updated Name',
          status: 2,
          realPrice: 88.8
        })
      );
    });

    it('should throw validation error when productId is missing', async () => {
      const options = {
        channelId: 'test-channel-id',
        name: 'Updated Name',
        output: 'table' as const
      };

      mockProductService.updateProduct.mockRejectedValue(
        new PolyVValidationError('productId is required', 'productId', undefined, 'required')
      );

      await expect(productHandler.updateProduct(options as any)).rejects.toThrow();
    });

    it('should throw validation error when channelId is missing', async () => {
      const options = {
        productId: 123456,
        name: 'Updated Name',
        output: 'table' as const
      };

      mockProductService.updateProduct.mockRejectedValue(
        new PolyVValidationError('channelId is required', 'channelId', undefined, 'required')
      );

      await expect(productHandler.updateProduct(options as any)).rejects.toThrow();
    });

    it('should display success message in table format', async () => {
      const options = {
        channelId: 'test-channel-id',
        productId: 123456,
        name: 'Updated Name',
        status: 1 as const,
        linkType: 10 as const,
        output: 'table' as const
      };

      mockProductService.updateProduct.mockResolvedValue(true);

      await productHandler.updateProduct(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Product updated successfully')
      );
    });

    it('should display result in JSON format', async () => {
      const options = {
        channelId: 'test-channel-id',
        productId: 123456,
        name: 'Updated Name',
        status: 1 as const,
        linkType: 10 as const,
        output: 'json' as const
      };

      mockProductService.updateProduct.mockResolvedValue(true);

      await productHandler.updateProduct(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('123456')
      );
    });
  });

  describe('deleteProduct (AC #3)', () => {
    it('should delete product with confirmation when force is false', async () => {
      const options = {
        channelId: 'test-channel-id',
        productId: 123456,
        force: false,
        output: 'table' as const
      };

      // Mock confirmation utility to return true (user confirms)
      mockConfirmDeletion.mockResolvedValue(true);
      mockProductService.deleteProduct.mockResolvedValue(true);

      await productHandler.deleteProduct(options);

      expect(mockConfirmDeletion).toHaveBeenCalledWith(
        expect.stringContaining('123456'),
        'yes'
      );
      expect(mockProductService.deleteProduct).toHaveBeenCalled();
    });

    it('should skip confirmation when force is true', async () => {
      const options = {
        channelId: 'test-channel-id',
        productId: 123456,
        force: true,
        output: 'table' as const
      };

      mockProductService.deleteProduct.mockResolvedValue(true);

      await productHandler.deleteProduct(options);

      // Should NOT call confirmDeletion when force is true
      expect(mockConfirmDeletion).not.toHaveBeenCalled();
      expect(mockProductService.deleteProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: 'test-channel-id',
          productId: 123456
        })
      );
    });

    it('should cancel operation when user declines confirmation', async () => {
      const options = {
        channelId: 'test-channel-id',
        productId: 123456,
        force: false,
        output: 'table' as const
      };

      // Mock user declining confirmation
      mockConfirmDeletion.mockResolvedValue(false);

      await productHandler.deleteProduct(options);

      // Should NOT call deleteProduct when user cancels
      expect(mockProductService.deleteProduct).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('已取消')
      );
    });

    it('should throw validation error when productId is missing', async () => {
      const options = {
        channelId: 'test-channel-id',
        force: true,
        output: 'table' as const
      };

      mockProductService.deleteProduct.mockRejectedValue(
        new PolyVValidationError('productId is required', 'productId', undefined, 'required')
      );

      await expect(productHandler.deleteProduct(options as any)).rejects.toThrow();
    });

    it('should display success message after deletion', async () => {
      const options = {
        channelId: 'test-channel-id',
        productId: 123456,
        force: true,
        output: 'table' as const
      };

      mockProductService.deleteProduct.mockResolvedValue(true);

      await productHandler.deleteProduct(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('deleted successfully')
      );
    });

    it('should display result in JSON format', async () => {
      const options = {
        channelId: 'test-channel-id',
        productId: 123456,
        force: true,
        output: 'json' as const
      };

      mockProductService.deleteProduct.mockResolvedValue(true);

      await productHandler.deleteProduct(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('123456')
      );
    });
  });

  describe('updateChannelProductEnabled', () => {
    it('should update channel product library enabled status', async () => {
      const options = {
        channelId: 'test-channel-id',
        enabled: 'Y' as const,
        force: true,
        output: 'json' as const
      };

      mockProductService.updateChannelProductEnabled.mockResolvedValue(true);

      await productHandler.updateChannelProductEnabled(options);

      expect(mockProductService.updateChannelProductEnabled).toHaveBeenCalledWith({
        channelId: 'test-channel-id',
        enabled: 'Y',
      });
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('test-channel-id')
      );
    });

    it('should reject invalid enabled value', async () => {
      await expect(productHandler.updateChannelProductEnabled({
        channelId: 'test-channel-id',
        enabled: 'YES' as any,
        force: true,
      })).rejects.toThrow(PolyVValidationError);

      expect(mockProductService.updateChannelProductEnabled).not.toHaveBeenCalled();
    });
  });

  describe('validation helpers (AC #5)', () => {
    it('should validate required fields for add operation', async () => {
      const missingName = {
        channelId: 'test-channel-id',
        status: 1 as const,
        linkType: 10 as const,
        output: 'table' as const
      };

      mockProductService.addProduct.mockRejectedValue(
        new PolyVValidationError('name is required', 'name', undefined, 'required')
      );

      await expect(productHandler.addProduct(missingName as any)).rejects.toThrow();
    });

    it('should provide user-friendly error messages', async () => {
      const invalidStatus = {
        channelId: 'test-channel-id',
        name: 'Test',
        status: 99 as any,
        linkType: 10 as const,
        output: 'table' as const
      };

      mockProductService.addProduct.mockRejectedValue(
        new PolyVValidationError('status must be 1 or 2', 'status', 99, 'invalid')
      );

      await expect(productHandler.addProduct(invalidStatus)).rejects.toThrow();
    });
  });
});
