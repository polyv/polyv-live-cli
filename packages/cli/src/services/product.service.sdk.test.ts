/**
 * @fileoverview Unit tests for ProductServiceSdk
 * @author Development Team
 * @since 8.2.0
 */

import { ProductServiceSdk } from './product.service.sdk';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError, PolyVError } from '../utils/errors';

// Mock the SDK module
jest.mock('../sdk', () => ({
  createSdkClient: jest.fn()
}));

import { createSdkClient } from '../sdk';
const mockCreateSdkClient = createSdkClient as jest.MockedFunction<typeof createSdkClient>;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('ProductServiceSdk', () => {
  let service: ProductServiceSdk;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: { baseUrl: string; timeout: number; debug: boolean };
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id'
    };

    mockServiceConfig = {
      baseUrl: 'https://api.polyv.net',
      timeout: 30000,
      debug: false
    };

    // Create mock client
    mockClient = {
      channel: {
        addChannelProduct: jest.fn(),
        updateChannelProduct: jest.fn(),
        updateChannelProductEnabled: jest.fn(),
        deleteChannelProduct: jest.fn(),
        listChannelProducts: jest.fn()
      },
      v4User: {
        listProducts: jest.fn()
      }
    };

    mockCreateSdkClient.mockReturnValue(mockClient);

    service = new ProductServiceSdk(mockAuthConfig, mockServiceConfig);
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('listProducts', () => {
    describe('platform products (V4 User API)', () => {
      it('should list platform products with default parameters', async () => {
        const mockResponse = {
          contents: [
            { productId: 1, name: 'Product 1', productType: 'normal', status: 1, createdTime: 1000, updatedTime: 2000 }
          ],
          total: 1
        };

        mockClient.v4User.listProducts.mockResolvedValue(mockResponse);

        const result = await service.listProducts({ platform: true });

        expect(mockClient.v4User.listProducts).toHaveBeenCalledWith({
          pageNumber: 1,
          pageSize: 20
        });
        expect(result).toHaveLength(1);
        expect(result[0].productId).toBe('1');
        expect(result[0].channelId).toBe(''); // Platform products don't have channelId
      });

      it('should list platform products with custom pagination', async () => {
        const mockResponse = {
          contents: [],
          total: 0
        };

        mockClient.v4User.listProducts.mockResolvedValue(mockResponse);

        await service.listProducts({ platform: true, page: 2, size: 50 });

        expect(mockClient.v4User.listProducts).toHaveBeenCalledWith({
          pageNumber: 2,
          pageSize: 50
        });
      });
    });

    describe('channel products (V3 Channel API)', () => {
      it('should list channel products by channelId', async () => {
        const mockResponse = {
          contents: [
            { productId: 1, channelId: '123', name: 'Product 1', productType: 'normal', status: 1, createdTime: 1000, lastModified: 2000 }
          ],
          total: 1
        };

        mockClient.channel.listChannelProducts.mockResolvedValue(mockResponse);

        const result = await service.listProducts({ channelId: '123' });

        expect(result).toHaveLength(1);
        expect(result[0].channelId).toBe('123');
        expect(mockClient.channel.listChannelProducts).toHaveBeenCalledWith({
          channelId: '123',
          pageNumber: 1,
          pageSize: 20
        });
      });

      it('should list channel products with custom pagination', async () => {
        const mockResponse = {
          contents: [
            { productId: 1, channelId: '123', name: 'Product 1', productType: 'normal', status: 1, createdTime: 1000, lastModified: 2000 }
          ],
          total: 1
        };

        mockClient.channel.listChannelProducts.mockResolvedValue(mockResponse);

        await service.listProducts({ channelId: '123', page: 2, size: 50 });

        expect(mockClient.channel.listChannelProducts).toHaveBeenCalledWith({
          channelId: '123',
          pageNumber: 2,
          pageSize: 50
        });
      });
    });

    it('should return empty array when neither platform nor channelId is specified', async () => {
      const result = await service.listProducts({});

      expect(result).toEqual([]);
      expect(mockClient.v4User.listProducts).not.toHaveBeenCalled();
      expect(mockClient.channel.listChannelProducts).not.toHaveBeenCalled();
    });

    it('should return empty array when no products (platform)', async () => {
      mockClient.v4User.listProducts.mockResolvedValue({ contents: [] });

      const result = await service.listProducts({ platform: true });

      expect(result).toEqual([]);
    });

    it('should return empty array when no products (channel)', async () => {
      mockClient.channel.listChannelProducts.mockResolvedValue({ contents: [] });

      const result = await service.listProducts({ channelId: '123' });

      expect(result).toEqual([]);
    });

    it('should validate page parameter', async () => {
      await expect(service.listProducts({ page: 0 })).rejects.toThrow(PolyVValidationError);
    });

    it('should validate size parameter', async () => {
      await expect(service.listProducts({ size: 0 })).rejects.toThrow(PolyVValidationError);
      await expect(service.listProducts({ size: 101 })).rejects.toThrow(PolyVValidationError);
    });

    it('should validate channelId parameter', async () => {
      await expect(service.listProducts({ channelId: '' })).rejects.toThrow(PolyVValidationError);
    });
  });

  describe('addProduct', () => {
    const validOptions = {
      channelId: 'test-channel-id',
      name: 'Test Product',
      status: 1 as const,
      linkType: 10 as const,
      link: 'https://example.com/product',
      output: 'table' as const
    };

    it('should add a normal product successfully', async () => {
      const mockResponse = {
        productId: 123456,
        name: 'Test Product',
        channelId: 'test-channel-id',
        createdTime: Date.now()
      };

      mockClient.channel.addChannelProduct.mockResolvedValue(mockResponse);

      const result = await service.addProduct(validOptions);

      expect(result.productId).toBe(123456);
      expect(mockClient.channel.addChannelProduct).toHaveBeenCalled();
    });

    it('should add a finance product with yield field', async () => {
      const options = {
        ...validOptions,
        productType: 'finance' as const,
        yield: '5.5%'
      };

      const mockResponse = {
        productId: 123456,
        name: 'Test Product',
        channelId: 'test-channel-id',
        createdTime: Date.now()
      };

      mockClient.channel.addChannelProduct.mockResolvedValue(mockResponse);

      const result = await service.addProduct(options);

      expect(result.productId).toBe(123456);
      expect(mockClient.channel.addChannelProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          productType: 'finance',
          yield: '5.5%'
        })
      );
    });

    it('should add a position product with required fields', async () => {
      const options = {
        ...validOptions,
        productType: 'position' as const,
        productDesc: 'Job description',
        btnShow: 'Apply Now'
      };

      const mockResponse = {
        productId: 123456,
        name: 'Test Product',
        channelId: 'test-channel-id',
        createdTime: Date.now()
      };

      mockClient.channel.addChannelProduct.mockResolvedValue(mockResponse);

      const result = await service.addProduct(options);

      expect(result.productId).toBe(123456);
      expect(mockClient.channel.addChannelProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          productType: 'position',
          productDesc: 'Job description',
          btnShow: 'Apply Now'
        })
      );
    });

    it('should validate required channelId', async () => {
      const invalidOptions = { ...validOptions, channelId: '' };

      await expect(service.addProduct(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should validate required name', async () => {
      const invalidOptions = { ...validOptions, name: '' };

      await expect(service.addProduct(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should validate status value', async () => {
      const invalidOptions = { ...validOptions, status: 3 as any };

      await expect(service.addProduct(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should validate linkType value', async () => {
      const invalidOptions = { ...validOptions, linkType: 12 as any };

      await expect(service.addProduct(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should require link when linkType is 10', async () => {
      const invalidOptions = { ...validOptions, link: undefined };

      await expect(service.addProduct(invalidOptions as any)).rejects.toThrow(PolyVValidationError);
    });
  });

  describe('updateProduct', () => {
    const validOptions = {
      channelId: 'test-channel-id',
      productId: 123456,
      name: 'Updated Product',
      status: 1 as const,
      linkType: 10 as const,
      output: 'table' as const
    };

    it('should update product successfully', async () => {
      mockClient.channel.updateChannelProduct.mockResolvedValue(true);

      const result = await service.updateProduct(validOptions);

      expect(result).toBe(true);
      expect(mockClient.channel.updateChannelProduct).toHaveBeenCalled();
    });

    it('should validate required channelId', async () => {
      const invalidOptions = { ...validOptions, channelId: '' };

      await expect(service.updateProduct(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should validate required productId', async () => {
      const invalidOptions = { ...validOptions, productId: undefined as any };

      await expect(service.updateProduct(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should allow update without name (selective update)', async () => {
      // AC#2: name is now optional for selective field updates
      const optionsWithoutName = { ...validOptions };
      delete (optionsWithoutName as any).name;

      // Should not throw - name is optional for update
      mockClient.channel.updateChannelProduct.mockResolvedValue(true);
      await expect(service.updateProduct(optionsWithoutName as any)).resolves.toBe(true);
    });

    it('should validate status value', async () => {
      const invalidOptions = { ...validOptions, status: 3 as any };

      await expect(service.updateProduct(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should validate linkType value', async () => {
      const invalidOptions = { ...validOptions, linkType: 12 as any };

      await expect(service.updateProduct(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });
  });

  describe('deleteProduct', () => {
    const validOptions = {
      channelId: 'test-channel-id',
      productId: 123456,
      output: 'table' as const
    };

    it('should delete product successfully', async () => {
      mockClient.channel.deleteChannelProduct.mockResolvedValue(true);

      const result = await service.deleteProduct(validOptions);

      expect(result).toBe(true);
      expect(mockClient.channel.deleteChannelProduct).toHaveBeenCalledWith({
        channelId: 'test-channel-id',
        productId: 123456
      });
    });

    it('should validate required channelId', async () => {
      const invalidOptions = { ...validOptions, channelId: '' };

      await expect(service.deleteProduct(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should validate required productId', async () => {
      const invalidOptions = { ...validOptions, productId: undefined as any };

      await expect(service.deleteProduct(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });
  });

  describe('updateChannelProductEnabled', () => {
    it('should update channel product library enabled status', async () => {
      mockClient.channel.updateChannelProductEnabled.mockResolvedValue(true);

      const result = await service.updateChannelProductEnabled({
        channelId: 'test-channel-id',
        enabled: 'Y',
      });

      expect(result).toBe(true);
      expect(mockClient.channel.updateChannelProductEnabled).toHaveBeenCalledWith({
        channelId: 'test-channel-id',
        enabled: 'Y',
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      mockClient.v4User.listProducts.mockRejectedValue(new Error('API Error'));

      await expect(service.listProducts({ platform: true })).rejects.toThrow();
    });

    it('should handle PolyVError instances', async () => {
      const polyvError = new PolyVError('Custom error', 'CUSTOM_ERROR', 500);
      mockClient.v4User.listProducts.mockRejectedValue(polyvError);

      await expect(service.listProducts({ platform: true })).rejects.toThrow(polyvError);
    });
  });
});
