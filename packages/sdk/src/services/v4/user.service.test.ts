/**
 * @fileoverview Unit tests for V4UserService
 * @module services/v4/user.service.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { V4UserService } from './user.service.js';
import type { PolyVClient } from '../../client.js';
import { PolyVValidationError } from '../../errors/polyv-validation-error.js';

// Mock the PolyVClient
const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
} as unknown as PolyVClient;

describe('V4UserService', () => {
  let service: V4UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4UserService(mockClient);
  });

  // ============================================
  // AC1: Sub-account Management Tests
  // ============================================

  describe('createChildAccount', () => {
    it('should create child account successfully', async () => {
      const mockResponse = { childUserId: 'child_001', childEmail: 'test@example.com' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createChildAccount({
        childEmail: 'test@example.com',
        childName: 'Test User',
        password: 'Password123',
        roleId: 1,
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/children/create',
        expect.objectContaining({ childEmail: 'test@example.com' })
      );
    });

    it('should throw validation error when childEmail is empty', async () => {
      await expect(service.createChildAccount({
        childEmail: '',
        childName: 'Test',
        password: 'Pass123',
        roleId: 1,
      })).rejects.toThrow(PolyVValidationError);
    });

    it('should throw validation error when childName is missing', async () => {
      await expect(service.createChildAccount({
        childEmail: 'test@example.com',
        childName: '',
        password: 'Pass123',
        roleId: 1,
      })).rejects.toThrow(PolyVValidationError);
    });

    it('should throw validation error when password is missing', async () => {
      await expect(service.createChildAccount({
        childEmail: 'test@example.com',
        childName: 'Test',
        password: '',
        roleId: 1,
      })).rejects.toThrow(PolyVValidationError);
    });

    it('should throw validation error when roleId is undefined', async () => {
      await expect(service.createChildAccount({
        childEmail: 'test@example.com',
        childName: 'Test',
        password: 'Pass123',
        roleId: undefined as any,
      })).rejects.toThrow(PolyVValidationError);
    });
  });

  describe('listChildAccounts', () => {
    it('should list child accounts with pagination', async () => {
      const mockResponse = { contents: [], totalElements: 0 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listChildAccounts({ pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/children/list',
        { params: { pageNumber: 1, pageSize: 10 } }
      );
    });

    it('should throw validation error when pageNumber is invalid', async () => {
      await expect(service.listChildAccounts({ pageNumber: 0, pageSize: 10 }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw validation error when pageSize exceeds limit', async () => {
      await expect(service.listChildAccounts({ pageNumber: 1, pageSize: 1001 }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('getChildAccount', () => {
    it('should get child account by ID', async () => {
      const mockResponse = { childUserId: 'child_001' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getChildAccount({ childUserId: 'child_001' });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/children/get',
        { params: { childUserId: 'child_001' } }
      );
    });

    it('should throw validation error when childUserId is empty', async () => {
      await expect(service.getChildAccount({ childUserId: '' }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('updateChildAccount', () => {
    it('should update child account', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateChildAccount({ childUserId: 'child_001', childName: 'Updated' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/children/update',
        expect.objectContaining({ childUserId: 'child_001' })
      );
    });

    it('should update child account by email', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateChildAccount({ childEmail: 'child@example.com', password: 'Password123' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/children/update',
        expect.objectContaining({ childEmail: 'child@example.com', password: 'Password123' })
      );
    });
  });

  describe('deleteChildAccounts', () => {
    it('should delete child accounts', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteChildAccounts({ childUserIds: ['child_001', 'child_002'] });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/children/delete',
        { childUserIds: ['child_001', 'child_002'] }
      );
    });

    it('should delete child account by email', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteChildAccounts({ childEmail: 'child@example.com' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/children/delete',
        { childEmail: 'child@example.com' }
      );
    });

    it('should throw validation error when childUserIds is empty', async () => {
      await expect(service.deleteChildAccounts({ childUserIds: [] }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('listChildAccountRoles', () => {
    it('should list child account roles', async () => {
      const mockResponse = [{ id: 1, name: 'Admin', permissionName: '新建直播' }];
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listChildAccountRoles();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/children/role/list',
        {}
      );
    });
  });

  describe('getBySale', () => {
    it('should get child account by sale', async () => {
      const mockResponse = { childUserId: 'child_001', childEmail: 'child@example.com' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getBySale({ saleId: '100' });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/invite-customer/get',
        { params: { saleId: '100' } }
      );
    });

    it('should throw validation error when saleId and saleCode are missing', async () => {
      await expect(service.getBySale({}))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // AC2: Organization Tests
  // ============================================

  describe('listOrganizations', () => {
    it('should list organizations', async () => {
      const mockResponse = { contents: [] };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listOrganizations();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/organization/list',
        {}
      );
    });
  });

  describe('createOrganization', () => {
    it('should create organization', async () => {
      const mockResponse = { organizationId: 1 };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createOrganization({ organizationName: 'New Org' });

      expect(result).toEqual(mockResponse);
    });

    it('should create organization with current document parameters', async () => {
      const mockResponse = { id: 1, name: 'New Org', parentId: 2 };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createOrganization({ name: 'New Org', parentId: 2, description: 'Desc' });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/organization/create',
        { name: 'New Org', parentId: 2, description: 'Desc' }
      );
    });
  });

  describe('deleteOrganization', () => {
    it('should delete organization', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteOrganization({ organizationId: 1 });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/organization/delete',
        undefined,
        { params: { organizationId: 1 } },
      );
    });

    it('should throw validation error when organizationId is undefined', async () => {
      await expect(service.deleteOrganization({ organizationId: undefined as any }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // AC3: Viewer Record Tests
  // ============================================

  describe('listViewerRecords', () => {
    it('should list viewer records', async () => {
      const mockResponse = { contents: [], totalElements: 0 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listViewerRecords({ pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getViewerRecord', () => {
    it('should get viewer record by ID', async () => {
      const mockResponse = { viewerUnionId: 'viewer_001' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getViewerRecord({ viewerUnionId: 'viewer_001' });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('createViewerRecord', () => {
    it('should create viewer record', async () => {
      const mockResponse = { viewerUnionId: 'viewer_001' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createViewerRecord({
        nickname: 'Test Viewer',
        mobile: '13800138000',
      });

      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error when nickname is empty', async () => {
      await expect(service.createViewerRecord({
        nickname: '',
        mobile: '13800138000',
      })).rejects.toThrow(PolyVValidationError);
    });
  });

  describe('updateViewerRecord', () => {
    it('should update viewer record', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateViewerRecord({ viewerUnionId: 'viewer_001', nickname: 'Updated' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('deleteViewerRecord', () => {
    it('should delete viewer record', async () => {
      mockHttpClient.get.mockResolvedValueOnce(undefined);

      await service.deleteViewerRecord({ viewerUnionId: 'viewer_001' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/viewer-record/delete',
        { params: { viewerUnionId: 'viewer_001' } }
      );
    });

    it('should throw validation error when viewerUnionId is empty', async () => {
      await expect(service.deleteViewerRecord({ viewerUnionId: '' }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('directAuthViewer', () => {
    it('should direct auth viewer', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.directAuthViewer({
        channelId: '123456',
        viewerId: 'viewer_001',
        nickname: 'Auth User',
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('importExternalViewer', () => {
    it('should import external viewers', async () => {
      const mockResponse = [{ viewerUnionId: 'viewer_001', externalViewerId: 'ext_001', nickname: 'User 1' }];
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.importExternalViewer([
        { externalViewerId: 'ext_001', nickname: 'User 1', labelIds: ['label_001'] },
      ]);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/viewer-record/import-external-viewer',
        [{ externalViewerId: 'ext_001', nickname: 'User 1', labelIds: ['label_001'] }]
      );
    });

    it('should throw validation error when viewers is empty', async () => {
      await expect(service.importExternalViewer([]))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw validation error when externalViewerId is empty', async () => {
      await expect(service.importExternalViewer([{ externalViewerId: '', nickname: 'User 1' }]))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('updateViewerUserSystemConfig', () => {
    it('should update viewer user system config', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateViewerUserSystemConfig({
        mobileLoginEnabled: 'Y',
        wxWorkLoginEnabled: 'N',
        viewerWeixinAuthExpired: 30,
        collectMobileEnabled: 'Y',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/viewer-user-system/update-config',
        {
          mobileLoginEnabled: 'Y',
          wxWorkLoginEnabled: 'N',
          viewerWeixinAuthExpired: 30,
          collectMobileEnabled: 'Y',
        }
      );
    });

    it('should throw validation error when switch value is invalid', async () => {
      await expect(service.updateViewerUserSystemConfig({
        mobileLoginEnabled: 'YES' as any,
        wxWorkLoginEnabled: 'N',
      })).rejects.toThrow(PolyVValidationError);
    });

    it('should throw validation error when viewerWeixinAuthExpired is out of range', async () => {
      await expect(service.updateViewerUserSystemConfig({
        mobileLoginEnabled: 'Y',
        wxWorkLoginEnabled: 'N',
        viewerWeixinAuthExpired: 181,
      })).rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // AC4: Viewer Label Tests
  // ============================================

  describe('listViewerLabels', () => {
    it('should list viewer labels', async () => {
      const mockResponse = { contents: [] };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listViewerLabels();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('createViewerLabel', () => {
    it('should create viewer label', async () => {
      const mockResponse = [{ id: 1, label: 'VIP' }];
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createViewerLabel({ labels: ['VIP'] });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/viewer-label/create-batch',
        { labels: ['VIP'] }
      );
    });

    it('should throw validation error when labels is empty', async () => {
      await expect(service.createViewerLabel({ labels: [] }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('updateViewerLabel', () => {
    it('should update viewer label', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateViewerLabel({ id: 1, label: 'Updated' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/viewer-label/update',
        { id: 1, label: 'Updated' }
      );
    });

    it('should throw validation error when id is missing', async () => {
      await expect(service.updateViewerLabel({ id: undefined as any, label: 'Updated' }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('deleteViewerLabel', () => {
    it('should delete viewer label', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteViewerLabel({ id: 1 });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/viewer-label/delete',
        null,
        { params: { id: 1 } }
      );
    });

    it('should throw validation error when id is empty', async () => {
      await expect(service.deleteViewerLabel({ id: '' }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('addViewerLabel', () => {
    it('should add label to viewer', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.addViewerLabel({ viewerUnionId: 'viewer_001', labelId: 1 });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/viewer-label/add-viewers-label',
        { viewerUnionIds: ['viewer_001'], labelIds: [1] }
      );
    });
  });

  describe('deleteViewerLabelRef', () => {
    it('should delete label from viewer', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteViewerLabelRef({ viewerUnionId: 'viewer_001', labelId: 1 });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/viewer-label/remove-viewers-label',
        { viewerUnionIds: ['viewer_001'], labelIds: [1] }
      );
    });
  });

  // ============================================
  // AC5: Product Tests
  // ============================================

  describe('listProducts', () => {
    it('should list products', async () => {
      const mockResponse = { contents: [], totalElements: 0 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listProducts({ pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/product/list',
        { params: { pageNumber: 1, pageSize: 10 } }
      );
    });
  });

  describe('createProduct', () => {
    it('should create product', async () => {
      const mockResponse = 'prod_001';
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createProduct({
        name: 'New Product',
        linkType: 10,
        link: 'https://example.com/product',
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/product/save',
        {
          name: 'New Product',
          linkType: 10,
          link: 'https://example.com/product',
        }
      );
    });

    it('should throw validation error when link is empty', async () => {
      await expect(service.createProduct({
        name: 'New Product',
        linkType: 10,
        link: '',
      })).rejects.toThrow(PolyVValidationError);
    });
  });

  describe('updateProduct', () => {
    it('should update product', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateProduct({ productId: 'prod_001', name: 'Updated' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/product/update',
        { productId: 'prod_001', name: 'Updated' }
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete product', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteProduct({ productId: 'prod_001' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/product/delete',
        { productId: 'prod_001' }
      );
    });
  });

  // ============================================
  // AC6: Product Tag Tests
  // ============================================

  describe('listProductTags', () => {
    it('should list product tags', async () => {
      const mockResponse = { contents: [] };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listProductTags({ channelId: 123, pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/product/tag/list',
        { params: { channelId: 123, pageNumber: 1, pageSize: 10 } }
      );
    });
  });

  describe('createProductTag', () => {
    it('should create product tag', async () => {
      const mockResponse = { id: 1, name: 'Hot' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createProductTag({ name: 'Hot' });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/product/tag/create',
        { name: 'Hot' }
      );
    });
  });

  describe('updateProductTag', () => {
    it('should update product tag', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateProductTag({ id: 1, name: 'Updated' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/product/tag/update',
        { id: 1, name: 'Updated' }
      );
    });
  });

  describe('deleteProductTag', () => {
    it('should delete product tag', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteProductTag({ id: 1 });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/product/tag/delete',
        { id: 1 }
      );
    });
  });

  // ============================================
  // AC7: Product Order Tests
  // ============================================

  describe('listProductOrders', () => {
    it('should list product orders', async () => {
      const mockResponse = { contents: [], totalElements: 0 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listProductOrders({ pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/product/order/list',
        { params: { pageNumber: 1, pageSize: 10 } }
      );
    });
  });

  describe('getProductOrder', () => {
    it('should get product order by ID', async () => {
      const mockResponse = { orderNo: 'order_001', status: 'finish' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getProductOrder({ orderNo: 'order_001' });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/product/order/get',
        { params: { orderNo: 'order_001' } }
      );
    });
  });

  describe('batchUpdateOrderStatus', () => {
    it('should batch update order status', async () => {
      const mockResponse = { successOrderNos: ['order_001', 'order_002'], failOrderList: [] };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.batchUpdateOrderStatus({
        orderNos: ['order_001', 'order_002'],
        status: 'delivering',
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/product/order/update-batch-status',
        {
          orderNos: ['order_001', 'order_002'],
          status: 'delivering',
        }
      );
    });

    it('should throw validation error when orderNos is empty', async () => {
      await expect(service.batchUpdateOrderStatus({ orderNos: [], status: 'delivering' }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw validation error when status is empty', async () => {
      await expect(service.batchUpdateOrderStatus({ orderNos: ['order_001'], status: '' }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // AC8: Label Tests
  // ============================================

  describe('listLabels', () => {
    it('should list labels', async () => {
      const mockResponse = { contents: [] };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listLabels({ pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/label/page',
        { params: { pageNumber: 1, pageSize: 10 } }
      );
    });

    it('should throw validation error when pageNumber is invalid', async () => {
      await expect(service.listLabels({ pageNumber: 0, pageSize: 10 }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('createLabel', () => {
    it('should create label', async () => {
      const mockResponse = { id: 'label_001', name: 'Tech' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createLabel({ labelName: 'Tech' });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/label/save',
        { labelName: 'Tech' }
      );
    });

    it('should throw validation error when labelName is empty', async () => {
      await expect(service.createLabel({ labelName: '' }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('updateLabel', () => {
    it('should update label', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateLabel({ labelId: 'label_001', labelName: 'Updated' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/label/update',
        { labelId: 'label_001', labelName: 'Updated' }
      );
    });
  });

  describe('deleteLabel', () => {
    it('should delete label', async () => {
      mockHttpClient.get.mockResolvedValueOnce(undefined);

      await service.deleteLabel({ labelId: 'label_001' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/label/delete',
        { params: { labelId: 'label_001' } }
      );
    });

    it('should throw validation error when labelId is empty', async () => {
      await expect(service.deleteLabel({ labelId: '' }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('addChannelLabelRefs', () => {
    it('should add channel label refs', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.addChannelLabelRefs({
        labelIds: ['zylw8zzi3p7mrqr4', 'k48fuvchvmsirky0'],
        channelIds: ['123456', '789012'],
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/label-ref/save-batch',
        {
          labelIds: ['zylw8zzi3p7mrqr4', 'k48fuvchvmsirky0'],
          channelIds: ['123456', '789012'],
        }
      );
    });

    it('should throw validation error when channelIds is empty', async () => {
      await expect(service.addChannelLabelRefs({ labelIds: ['zylw8zzi3p7mrqr4'], channelIds: [] }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('should throw validation error when labelIds is empty', async () => {
      await expect(service.addChannelLabelRefs({ labelIds: [], channelIds: ['123456'] }))
        .rejects.toThrow(PolyVValidationError);
    });

  });

  // ============================================
  // AC9: Invite Sales Tests
  // ============================================

  describe('listInviteSales', () => {
    it('should list invite sales', async () => {
      const mockResponse = { contents: [], pageNumber: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listInviteSales({ mobile: '18112345678', pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/invite-sales/list',
        { params: { mobile: '18112345678', pageNumber: 1, pageSize: 10 } }
      );
    });

    it('should throw validation error when pageSize is invalid', async () => {
      await expect(service.listInviteSales({ pageSize: 1001 }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('addInviteSale', () => {
    it('should add invite sale', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      const result = await service.addInviteSale({
        viewerUnionIds: ['viewer_001', 'viewer_002'],
        organizationId: 123,
      });

      expect(result).toBeUndefined();
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/invite-sales/add',
        {
          viewerUnionIds: ['viewer_001', 'viewer_002'],
          organizationId: 123,
        }
      );
    });

    it('should throw validation error when viewerUnionIds is empty', async () => {
      await expect(service.addInviteSale({ viewerUnionIds: [] }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('updateInviteSale', () => {
    it('should update invite sale', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateInviteSale({
        viewerUnionIds: ['viewer_001'],
        organizationId: 123,
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/invite-sales/update',
        {
          viewerUnionIds: ['viewer_001'],
          organizationId: 123,
        }
      );
    });

    it('should throw validation error when organizationId is missing', async () => {
      await expect(service.updateInviteSale({
        viewerUnionIds: ['viewer_001'],
        organizationId: undefined as unknown as number,
      })).rejects.toThrow(PolyVValidationError);
    });
  });

  describe('removeInviteSale', () => {
    it('should remove invite sale', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.removeInviteSale({
        viewerUnionIds: ['viewer_001'],
        newViewerUnionId: 'viewer_002',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/invite-sales/remove',
        {
          viewerUnionIds: ['viewer_001'],
          newViewerUnionId: 'viewer_002',
        }
      );
    });

    it('should throw validation error when viewerUnionIds contains an empty value', async () => {
      await expect(service.removeInviteSale({ viewerUnionIds: [''] }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('listFollowViewers', () => {
    it('should list follow viewers', async () => {
      const mockResponse = { contents: [], pageNumber: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listFollowViewers({
        inviteCustomerId: 'viewer_001',
        telephone: '18112345678',
        pageNumber: 1,
        pageSize: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/invite-sales/follow-viewer/list',
        {
          params: {
            inviteCustomerId: 'viewer_001',
            telephone: '18112345678',
            pageNumber: 1,
            pageSize: 10,
          },
        }
      );
    });
  });

  // ============================================
  // AC10: Custom Field Tests
  // ============================================

  describe('listCustomFields', () => {
    it('should list custom fields', async () => {
      const mockResponse = [{ customFieldId: 'PAY_STATUS', customFieldName: '支付状态', customFieldType: 'text' }];
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listCustomFields();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/custom-field/list',
        {}
      );
    });
  });

  describe('addCustomField', () => {
    it('should add custom field', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      const result = await service.addCustomField({
        customFieldId: 'PAY_STATUS',
        customFieldName: '支付状态',
        customFieldType: 'text',
      });

      expect(result).toBeUndefined();
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/custom-field/save',
        {
          customFieldId: 'PAY_STATUS',
          customFieldName: '支付状态',
          customFieldType: 'text',
        }
      );
    });

    it('should throw validation error when customFieldId is empty', async () => {
      await expect(service.addCustomField({
        customFieldId: '',
        customFieldName: '支付状态',
        customFieldType: 'text',
      })).rejects.toThrow(PolyVValidationError);
    });
  });

  describe('addCustomFieldValue', () => {
    it('should add custom field value', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.addCustomFieldValue([
        {
          viewerId: 'viewer_001',
          customFieldId: 'PAY_STATUS',
          customFieldValue: '已支付',
        },
      ]);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/custom-field/viewer-value/save',
        [
          {
            viewerId: 'viewer_001',
            customFieldId: 'PAY_STATUS',
            customFieldValue: '已支付',
          },
        ]
      );
    });

    it('should throw validation error when custom field values are empty', async () => {
      await expect(service.addCustomFieldValue([]))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // AC11: Template Tests
  // ============================================

  describe('getDonateTemplate', () => {
    it('should get donate template', async () => {
      const mockResponse = { donateGiftEnabled: 'Y' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getDonateTemplate();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/donate/get',
        {}
      );
    });
  });

  describe('updateDonateTemplate', () => {
    it('should update donate template', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateDonateTemplate({
        donateGiftEnabled: 'Y',
        giftDonate: {
          payWay: 'POINT',
          pointPays: [{ img: 'https://example.com/gift.png', name: '礼物' }],
        },
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/donate/gift/update',
        {
          donateGiftEnabled: 'Y',
          giftDonate: {
            payWay: 'POINT',
            pointPays: [{ img: 'https://example.com/gift.png', name: '礼物' }],
          },
        }
      );
    });

    it('should throw validation error when donateGiftEnabled is invalid', async () => {
      await expect(service.updateDonateTemplate({ donateGiftEnabled: 'invalid' }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('getMarqueeTemplate', () => {
    it('should get marquee template', async () => {
      const mockResponse = { enabled: true };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getMarqueeTemplate();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateMarqueeTemplate', () => {
    it('should update marquee template', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateMarqueeTemplate({ enabled: true, content: 'New message' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });

    it('should update marquee template with current document parameters', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateMarqueeTemplate({
        enable: 'Y',
        antiRecordType: 'marquee',
        modelType: 'fixed',
        content: 'Notice',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/template/marquee/update',
        expect.objectContaining({ enable: 'Y', antiRecordType: 'marquee', modelType: 'fixed' })
      );
    });
  });

  describe('getRoleConfigTemplate', () => {
    it('should get role config template', async () => {
      const mockResponse = { roles: ['admin'] };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getRoleConfigTemplate();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateRoleConfigTemplate', () => {
    it('should update role config template', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateRoleConfigTemplate({ roles: ['admin', 'moderator'] });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('getPlaybackSetting', () => {
    it('should get playback setting', async () => {
      const mockResponse = { playbackEnabled: 'Y' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getPlaybackSetting();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/template/playback-setting/get',
        {}
      );
    });
  });

  describe('updatePlaybackSetting', () => {
    it('should update playback setting', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updatePlaybackSetting({ playbackEnabled: 'N', type: 'single' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/template/playback-setting/update',
        { playbackEnabled: 'N', type: 'single' }
      );
    });

    it('should throw validation error when playback switch is invalid', async () => {
      await expect(service.updatePlaybackSetting({ playbackEnabled: 'bad' }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('getAudioModerationSetting', () => {
    it('should get audio moderation setting', async () => {
      const mockResponse = { enabled: true };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getAudioModerationSetting();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateAudioModerationSetting', () => {
    it('should update audio moderation setting', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateAudioModerationSetting({ enabled: true, level: 'moderate' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });

    it('should update audio moderation setting with current document parameters', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateAudioModerationSetting({
        moderationEnabled: 'Y',
        moderationStrategy: 'finance_serious',
        badwordEnabled: 'N',
        illegalNotify: { monitorEnabled: 'Y' },
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/template/audio-moderation/update',
        expect.objectContaining({ moderationEnabled: 'Y', badwordEnabled: 'N' })
      );
    });
  });

  describe('getVideoModerationSetting', () => {
    it('should get video moderation setting', async () => {
      const mockResponse = { enabled: true };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getVideoModerationSetting();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateVideoModerationSetting', () => {
    it('should update video moderation setting', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateVideoModerationSetting({ enabled: true, level: 'moderate' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });

    it('should update video moderation setting with current document parameters', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateVideoModerationSetting({
        moderationEnabled: 'Y',
        moderationStrategy: 'finance_serious',
        imageFrequency: 5,
        illegalNotify: { monitorEnabled: 'Y' },
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/template/video-moderation/update',
        expect.objectContaining({ moderationEnabled: 'Y', imageFrequency: 5 })
      );
    });
  });

  // ============================================
  // AC12: User Settings Tests
  // ============================================

  describe('getCallback', () => {
    it('should get callback settings', async () => {
      const mockResponse = { streamCallbackUrl: 'https://example.com/callback' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getCallback();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/global-setting/callback/get',
        {}
      );
    });
  });

  describe('updateCallback', () => {
    it('should update callback settings', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateCallback({
        streamCallbackUrl: 'https://example.com/new-callback',
        rebirthVodCallbackEnabled: 'Y',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/global-setting/callback/update',
        {
          streamCallbackUrl: 'https://example.com/new-callback',
          rebirthVodCallbackEnabled: 'Y',
        }
      );
    });
  });

  describe('getGlobalSwitch', () => {
    it('should get global switch settings', async () => {
      const mockResponse = { chatEnabled: true };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getGlobalSwitch();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateGlobalSwitch', () => {
    it('should update global switch settings', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateGlobalSwitch({ chatEnabled: false, danmuEnabled: true });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('getGlobalFooter', () => {
    it('should get global footer settings', async () => {
      const mockResponse = { showFooterEnabled: 'Y', footerText: 'Footer' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getGlobalFooter();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/global-setting/footer/get',
        {}
      );
    });
  });

  describe('updateGlobalFooter', () => {
    it('should update global footer settings', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateGlobalFooter({ showFooterEnabled: 'Y', footerText: 'New footer' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/global-setting/footer/update',
        { showFooterEnabled: 'Y', footerText: 'New footer' }
      );
    });

    it('should throw validation error when footerText is too long', async () => {
      await expect(service.updateGlobalFooter({ footerText: 'this footer is too long' }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('getPvShowEnable', () => {
    it('should get PV show enable settings', async () => {
      const mockResponse = { enabled: 'Y' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getPvShowEnable();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/global-setting/pv-show/get',
        {}
      );
    });
  });

  describe('updatePvShowEnable', () => {
    it('should update PV show enable settings', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updatePvShowEnable({ enabled: 'N' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/global-setting/pv-show/update',
        undefined,
        { params: { enabled: 'N' } }
      );
    });

    it('should throw validation error when enabled is invalid', async () => {
      await expect(service.updatePvShowEnable({ enabled: 'bad' }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // AC13: Other User Tests
  // ============================================

  describe('getMicDuration', () => {
    it('should get mic duration', async () => {
      const mockResponse = { userId: 'user_001', history: 100 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getMicDuration({ startTime: 1704067200000, endTime: 1704153600000 });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/statistics/mic/history/get',
        { params: { startTime: 1704067200000, endTime: 1704153600000 } }
      );
    });
  });

  describe('getMrConcurrencyDetail', () => {
    it('should get MR concurrency detail', async () => {
      const mockResponse = { mrLiveConcurrency: 100, usedCount: 20, residualConcurrency: 80, channelIds: [] };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getMrConcurrencyDetail();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/mr/concurrency-detail/get',
        {}
      );
    });
  });

  describe('sendSms', () => {
    it('should send SMS', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.sendSms({ mobile: '13800138000', content: 'Your code is 123456' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });

    it('should send SMS with current document parameters', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.sendSms({
        phoneNumbers: ['13800138000'],
        templateParamNames: ['code'],
        templateParamValues: ['123456'],
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/sms/send',
        {
          phoneNumbers: ['13800138000'],
          templateParamNames: ['code'],
          templateParamValues: ['123456'],
        }
      );
    });
  });

  describe('getBillUseDetailList', () => {
    it('should get bill use detail list', async () => {
      const mockResponse = { contents: [] };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getBillUseDetailList({
        itemCategory: 'duration',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        pageNumber: 1,
        pageSize: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/use-detail/list',
        {
          params: {
            itemCategory: 'duration',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            pageNumber: 1,
            pageSize: 10,
          },
        }
      );
    });

    it('should throw validation error when itemCategory is empty', async () => {
      await expect(service.getBillUseDetailList({
        itemCategory: '',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      })).rejects.toThrow(PolyVValidationError);
    });
  });

  describe('viewerLotteryWin', () => {
    it('should get viewer lottery win info', async () => {
      const mockResponse = { contents: [], pageNumber: 1, pageSize: 10 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.viewerLotteryWin({
        viewerId: 'viewer_001',
        pageNumber: 1,
        pageSize: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/lottery/list-personal-win',
        { params: { viewerId: 'viewer_001', pageNumber: 1, pageSize: 10 } }
      );
    });

    it('should throw validation error when viewerId is empty', async () => {
      await expect(service.viewerLotteryWin({
        viewerId: '',
        pageNumber: 1,
        pageSize: 10,
      })).rejects.toThrow(PolyVValidationError);
    });
  });

  describe('getWatchLogDetail', () => {
    it('should get watch log detail', async () => {
      const mockResponse = { contents: [], pageNumber: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getWatchLogDetail({
        viewerId: 'viewer_001',
        pageNumber: 1,
        pageSize: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/viewlog/detail',
        { params: { viewerId: 'viewer_001', pageNumber: 1, pageSize: 10 } }
      );
    });

    it('should throw validation error when viewerId is empty', async () => {
      await expect(service.getWatchLogDetail({ viewerId: '' }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('getWatchLogList', () => {
    it('should get watch log list', async () => {
      const mockResponse = { contents: [], pageNumber: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getWatchLogList({
        pageNumber: 1,
        pageSize: 10,
        channelId: 10001,
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/viewlog/list',
        { params: { pageNumber: 1, pageSize: 10, channelId: 10001 } }
      );
    });

    it('should throw validation error when pageSize is invalid', async () => {
      await expect(service.getWatchLogList({ pageSize: 1001 }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // Story 13-3: Global Channel Settings Tests
  // ============================================

  describe('getGlobalChannelSettings', () => {
    it('[P0][SDK-GS-001] should get global channel settings successfully', async () => {
      const mockResponse = {
        channelConcurrencesEnabled: 'Y',
        timelyConvertEnabled: 'Y',
        donateEnabled: 'N',
        rebirthAutoUploadEnabled: 'N',
        rebirthAutoConvertEnabled: 'N',
        pptCoveredEnabled: 'N',
        coverImgType: 'contain',
        testModeButtonEnabled: 'N',
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getGlobalChannelSettings();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/global-setting/switch/get',
        {}
      );
    });

    it('[P1] should handle API errors from getGlobalChannelSettings', async () => {
      const apiError = new Error('API error: Authentication failed');
      mockHttpClient.get.mockRejectedValueOnce(apiError);

      await expect(service.getGlobalChannelSettings()).rejects.toThrow('API error: Authentication failed');
    });
  });

  describe('updateGlobalChannelSettings', () => {
    it('[P0][SDK-GS-002] should update global channel settings successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      const params = {
        channelConcurrencesEnabled: 'Y',
        timelyConvertEnabled: 'N',
        donateEnabled: 'Y',
        coverImgType: 'cover',
      };

      await service.updateGlobalChannelSettings(params);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/global-setting/switch/update',
        params
      );
    });

    it('[P1][SDK-GS-003] should update single setting parameter', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      const params = {
        channelConcurrencesEnabled: 'Y',
      };

      await service.updateGlobalChannelSettings(params);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/global-setting/switch/update',
        { channelConcurrencesEnabled: 'Y' }
      );
    });

    it('[P1][SDK-GS-004] should update multiple setting parameters', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      const params = {
        channelConcurrencesEnabled: 'Y',
        timelyConvertEnabled: 'N',
        donateEnabled: 'Y',
        rebirthAutoUploadEnabled: 'N',
        rebirthAutoConvertEnabled: 'N',
        pptCoveredEnabled: 'Y',
        coverImgType: 'contain',
      };

      await service.updateGlobalChannelSettings(params);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/global-setting/switch/update',
        params
      );
    });

    it('[P1][SDK-GS-005] should validate Y/N values for boolean fields', async () => {
      // Y value should be accepted
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateGlobalChannelSettings({ channelConcurrencesEnabled: 'Y' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/global-setting/switch/update',
        { channelConcurrencesEnabled: 'Y' }
      );
    });

    it('[P1] should reject lowercase y for boolean fields', async () => {
      await expect(
        service.updateGlobalChannelSettings({ channelConcurrencesEnabled: 'y' as any })
      ).rejects.toThrow();
    });

    it('[P1] should reject lowercase n for boolean fields', async () => {
      await expect(
        service.updateGlobalChannelSettings({ channelConcurrencesEnabled: 'n' as any })
      ).rejects.toThrow();
    });

    it('[P1][SDK-GS-006] should validate coverImgType as contain or cover', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateGlobalChannelSettings({ coverImgType: 'contain' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/global-setting/switch/update',
        { coverImgType: 'contain' }
      );
    });

    it('[P1] should reject invalid coverImgType', async () => {
      await expect(
        service.updateGlobalChannelSettings({ coverImgType: 'invalid' as any })
      ).rejects.toThrow();
    });

    it('[P1] should accept coverImgType as cover', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateGlobalChannelSettings({ coverImgType: 'cover' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/global-setting/switch/update',
        { coverImgType: 'cover' }
      );
    });

    it('[P1] should handle API errors from updateGlobalChannelSettings', async () => {
      const apiError = new Error('API error: Update failed');
      mockHttpClient.post.mockRejectedValueOnce(apiError);

      await expect(
        service.updateGlobalChannelSettings({ channelConcurrencesEnabled: 'Y' })
      ).rejects.toThrow('API error: Update failed');
    });
  });
});
