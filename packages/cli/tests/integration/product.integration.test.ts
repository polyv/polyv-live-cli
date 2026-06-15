/**
 * @fileoverview Integration tests for product commands
 * @author Development Team
 * @since 8.0.0
 */

import { ProductServiceSdk } from '../../src/services/product.service.sdk';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('Product Integration Tests', () => {
  let productService: ProductServiceSdk;
  let testChannelId: string;
  let createdProductIds: number[] = [];

  beforeAll(() => {
    productService = new ProductServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });
    testChannelId = testConfig.testChannelId;
  });

  afterAll(async () => {
    // Clean up created products
    if (createdProductIds.length > 0) {
      console.log(`🧹 Cleaning up ${createdProductIds.length} created products...`);
      for (const productId of createdProductIds) {
        try {
          await productService.deleteProduct({
            channelId: testChannelId,
            productId,
            force: true
          });
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    }
  });

  // ========================================
  // Product List Tests
  // ========================================

  describe('product list', () => {
    it('should list channel products successfully', async () => {
      const products = await productService.listProducts({
        channelId: testChannelId,
        page: 1,
        size: 10
      });

      expect(Array.isArray(products)).toBe(true);
      if (products.length > 0) {
        const product = products[0];
        expect(product.productId).toBeDefined();
        expect(product.name).toBeDefined();
        expect(product.channelId).toBe(testChannelId);
      }
    }, 15000);

    it('should list platform products (user-level library)', async () => {
      const products = await productService.listProducts({
        platform: true,
        page: 1,
        size: 10
      });

      expect(Array.isArray(products)).toBe(true);
      if (products.length > 0) {
        const product = products[0];
        expect(product.productId).toBeDefined();
        expect(product.name).toBeDefined();
      }
    }, 15000);

    it('should handle pagination correctly', async () => {
      const page1 = await productService.listProducts({
        channelId: testChannelId,
        page: 1,
        size: 5
      });

      expect(Array.isArray(page1)).toBe(true);
      expect(page1.length).toBeLessThanOrEqual(5);
    }, 15000);

    it('should validate page parameter', async () => {
      await expect(
        productService.listProducts({
          channelId: testChannelId,
          page: 0
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate size parameter', async () => {
      await expect(
        productService.listProducts({
          channelId: testChannelId,
          size: 101 // max is 100
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Product Add Tests
  // ========================================

  describe('product add', () => {
    it('should add a new product with minimal required fields', async () => {
      const result = await productService.addProduct({
        channelId: testChannelId,
        name: `Test Product ${Date.now()}`,
        status: 2, // Off shelf initially
        linkType: 10,
        link: 'https://example.com/product',
        cover: '//liveimages.videocc.net/uploaded/images/2023/11/gqzaoq7pk3.png',
        realPrice: 99.99,
        price: 199.99
      });

      expect(result).toBeDefined();
      expect(result.productId).toBeDefined();
      expect(typeof result.productId).toBe('number');
      expect(result.name).toBeDefined();
      // channelId is returned as number, convert to string for comparison
      expect(String(result.channelId)).toBe(testChannelId);

      createdProductIds.push(result.productId);
    }, 15000);

    it('should add a product with multi-platform links', async () => {
      const result = await productService.addProduct({
        channelId: testChannelId,
        name: `Multi-Platform Product ${Date.now()}`,
        status: 2,
        linkType: 11,
        pcLink: 'https://example.com/pc',
        mobileLink: 'https://example.com/mobile',
        cover: '//liveimages.videocc.net/uploaded/images/2023/11/gqzaoq7pk3.png',
        realPrice: 88.88,
        price: 188.88
      });

      expect(result).toBeDefined();
      expect(result.productId).toBeDefined();
      createdProductIds.push(result.productId);
    }, 15000);

    it('should validate required fields', async () => {
      await expect(
        productService.addProduct({
          channelId: testChannelId,
          name: '',
          status: 1,
          linkType: 10,
          link: 'https://example.com'
        } as any)
      ).rejects.toThrow();
    }, 10000);

    it('should validate linkType=10 requires link', async () => {
      await expect(
        productService.addProduct({
          channelId: testChannelId,
          name: 'Test Product',
          status: 1,
          linkType: 10
        } as any)
      ).rejects.toThrow();
    }, 10000);

    it('should validate status values', async () => {
      await expect(
        productService.addProduct({
          channelId: testChannelId,
          name: 'Test Product',
          status: 3 as any,
          linkType: 10,
          link: 'https://example.com'
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Product Update Tests
  // ========================================

  describe('product update', () => {
    let testProductId: number;

    beforeAll(async () => {
      const result = await productService.addProduct({
        channelId: testChannelId,
        name: 'Product To Update',
        status: 2,
        linkType: 10,
        link: 'https://example.com/update-test',
        cover: '//liveimages.videocc.net/uploaded/images/2023/11/gqzaoq7pk3.png',
        realPrice: 50.00,
        price: 100.00
      });
      testProductId = result.productId;
      createdProductIds.push(testProductId);
    });

    it('should update product name', async () => {
      const result = await productService.updateProduct({
        channelId: testChannelId,
        productId: testProductId,
        name: `Updated Product ${Date.now()}`,
        status: 1,
        linkType: 10,
        link: 'https://example.com/updated',
        cover: '//liveimages.videocc.net/uploaded/images/2023/11/gqzaoq7pk3.png',
        realPrice: 75.00,
        price: 150.00
      });

      // Update returns "SUCCESS" string or true
      expect([true, 'SUCCESS']).toContain(result);
    }, 15000);

    it('should update product status', async () => {
      const result = await productService.updateProduct({
        channelId: testChannelId,
        productId: testProductId,
        name: 'Status Changed Product',
        status: 2,
        linkType: 10,
        link: 'https://example.com/status-changed',
        cover: '//liveimages.videocc.net/uploaded/images/2023/11/gqzaoq7pk3.png',
        realPrice: 60.00,
        price: 120.00
      });

      // Update returns "SUCCESS" string or true
      expect([true, 'SUCCESS']).toContain(result);
    }, 15000);

    it('should fail for non-existent product', async () => {
      await expect(
        productService.updateProduct({
          channelId: testChannelId,
          productId: 999999999,
          name: 'Non-existent',
          status: 1,
          linkType: 10,
          link: 'https://example.com'
        })
      ).rejects.toThrow();
    }, 15000);
  });

  // ========================================
  // Product Delete Tests
  // ========================================

  describe('product delete', () => {
    it('should delete a product successfully', async () => {
      const createResult = await productService.addProduct({
        channelId: testChannelId,
        name: 'Product To Delete',
        status: 2,
        linkType: 10,
        link: 'https://example.com/delete-test',
        cover: '//liveimages.videocc.net/uploaded/images/2023/11/gqzaoq7pk3.png',
        realPrice: 25.00,
        price: 50.00
      });

      const productId = createResult.productId;

      const deleteResult = await productService.deleteProduct({
        channelId: testChannelId,
        productId,
        force: true
      });

      // Delete returns "SUCCESS" string or true
      expect([true, 'SUCCESS']).toContain(deleteResult);
    }, 15000);

    it('should fail for non-existent product', async () => {
      await expect(
        productService.deleteProduct({
          channelId: testChannelId,
          productId: 999999999,
          force: true
        })
      ).rejects.toThrow();
    }, 15000);

    it('should validate required fields', async () => {
      await expect(
        productService.deleteProduct({
          channelId: '',
          productId: 123
        } as any)
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Product Lifecycle Test
  // ========================================

  describe('product lifecycle (CRUD)', () => {
    it('should complete full product lifecycle', async () => {
      // 1. Create
      const createResult = await productService.addProduct({
        channelId: testChannelId,
        name: `Lifecycle Test Product ${Date.now()}`,
        status: 2,
        linkType: 10,
        link: 'https://example.com/lifecycle',
        cover: '//liveimages.videocc.net/uploaded/images/2023/11/gqzaoq7pk3.png',
        productType: 'normal',
        realPrice: 99.99,
        price: 199.99
      });

      expect(createResult.productId).toBeDefined();
      const productId = createResult.productId;

      // 2. Read - Verify it exists
      const listResult = await productService.listProducts({
        channelId: testChannelId,
        page: 1,
        size: 100
      });

      const found = listResult.find(p => p.productId === String(productId));
      expect(found).toBeDefined();

      // 3. Update
      const updateResult = await productService.updateProduct({
        channelId: testChannelId,
        productId,
        name: 'Updated Lifecycle Product',
        status: 1,
        linkType: 10,
        link: 'https://example.com/updated-lifecycle',
        cover: '//liveimages.videocc.net/uploaded/images/2023/11/gqzaoq7pk3.png',
        realPrice: 89.99,
        price: 179.99
      });
      // Update returns "SUCCESS" string or true
      expect([true, 'SUCCESS']).toContain(updateResult);

      // 4. Delete
      const deleteResult = await productService.deleteProduct({
        channelId: testChannelId,
        productId,
        force: true
      });
      // Delete returns "SUCCESS" string or true
      expect([true, 'SUCCESS']).toContain(deleteResult);
    }, 30000);
  });
});
