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

    it('should throw validation error when childUserIds is empty', async () => {
      await expect(service.deleteChildAccounts({ childUserIds: [] }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('listChildAccountRoles', () => {
    it('should list child account roles', async () => {
      const mockResponse = [{ roleId: 1, roleName: 'Admin' }];
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listChildAccountRoles();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/children/roles',
        {}
      );
    });
  });

  describe('getBySale', () => {
    it('should get child account by sale', async () => {
      const mockResponse = { childUserId: 'child_001' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getBySale({ sale: '100' });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/children/get-by-sale',
        { params: { sale: '100' } }
      );
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
  });

  describe('deleteOrganization', () => {
    it('should delete organization', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteOrganization({ organizationId: 1 });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/organization/delete',
        { organizationId: 1 }
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
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteViewerRecord({ viewerUnionId: 'viewer_001' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/viewer-record/delete',
        { viewerUnionId: 'viewer_001' }
      );
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
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.importExternalViewer({
        viewers: [{ nickname: 'User 1', mobile: '13800138001' }],
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });

    it('should throw validation error when viewers is empty', async () => {
      await expect(service.importExternalViewer({ viewers: [] }))
        .rejects.toThrow(PolyVValidationError);
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
      const mockResponse = { labelId: 1 };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createViewerLabel({ labelName: 'VIP' });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateViewerLabel', () => {
    it('should update viewer label', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateViewerLabel({ labelId: 1, labelName: 'Updated' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('deleteViewerLabel', () => {
    it('should delete viewer label', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteViewerLabel({ labelId: 1 });

      expect(mockHttpClient.post).toHaveBeenCalled();
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
    });
  });

  describe('createProduct', () => {
    it('should create product', async () => {
      const mockResponse = { productId: 'prod_001' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createProduct({
        name: 'New Product',
        linkType: 10,
        link: 'https://example.com/product',
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateProduct', () => {
    it('should update product', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateProduct({ productId: 'prod_001', name: 'Updated' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('deleteProduct', () => {
    it('should delete product', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteProduct({ productId: 'prod_001' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  // ============================================
  // AC6: Product Tag Tests
  // ============================================

  describe('listProductTags', () => {
    it('should list product tags', async () => {
      const mockResponse = { contents: [] };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listProductTags();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('createProductTag', () => {
    it('should create product tag', async () => {
      const mockResponse = { tagId: 1 };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createProductTag({ tagName: 'Hot' });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateProductTag', () => {
    it('should update product tag', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateProductTag({ tagId: 1, tagName: 'Updated' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('deleteProductTag', () => {
    it('should delete product tag', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteProductTag({ tagId: 1 });

      expect(mockHttpClient.post).toHaveBeenCalled();
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
    });
  });

  describe('getProductOrder', () => {
    it('should get product order by ID', async () => {
      const mockResponse = { orderId: 'order_001' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getProductOrder({ orderId: 'order_001' });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('batchUpdateOrderStatus', () => {
    it('should batch update order status', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.batchUpdateOrderStatus({
        orderIds: ['order_001', 'order_002'],
        status: 'completed',
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });

    it('should throw validation error when orderIds is empty', async () => {
      await expect(service.batchUpdateOrderStatus({ orderIds: [], status: 'completed' }))
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

      const result = await service.listLabels();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('createLabel', () => {
    it('should create label', async () => {
      const mockResponse = { labelId: 1 };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createLabel({ labelName: 'Tech' });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateLabel', () => {
    it('should update label', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateLabel({ labelId: 1, labelName: 'Updated' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('deleteLabel', () => {
    it('should delete label', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteLabel({ labelId: 1 });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('addChannelLabelRefs', () => {
    it('should add channel label refs', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.addChannelLabelRefs({ labelId: 1, channelIds: ['123456', '789012'] });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });

    it('should throw validation error when channelIds is empty', async () => {
      await expect(service.addChannelLabelRefs({ labelId: 1, channelIds: [] }))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // AC9: Invite Sales Tests
  // ============================================

  describe('listInviteSales', () => {
    it('should list invite sales', async () => {
      const mockResponse = { contents: [] };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listInviteSales();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('addInviteSale', () => {
    it('should add invite sale', async () => {
      const mockResponse = { inviteId: 1 };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.addInviteSale({ nickname: 'New Sales' });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateInviteSale', () => {
    it('should update invite sale', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateInviteSale({ inviteId: 1, nickname: 'Updated' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('removeInviteSale', () => {
    it('should remove invite sale', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.removeInviteSale({ inviteId: 1 });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('listFollowViewers', () => {
    it('should list follow viewers', async () => {
      const mockResponse = { contents: [] };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listFollowViewers({ inviteId: 1 });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // AC10: Custom Field Tests
  // ============================================

  describe('listCustomFields', () => {
    it('should list custom fields', async () => {
      const mockResponse = { contents: [] };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listCustomFields();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('addCustomField', () => {
    it('should add custom field', async () => {
      const mockResponse = { fieldId: 1 };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.addCustomField({ fieldName: 'Company', fieldType: 'text' });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('addCustomFieldValue', () => {
    it('should add custom field value', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.addCustomFieldValue({
        fieldId: 1,
        viewerUnionId: 'viewer_001',
        value: 'Tech Corp',
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  // ============================================
  // AC11: Template Tests
  // ============================================

  describe('getDonateTemplate', () => {
    it('should get donate template', async () => {
      const mockResponse = { enabled: true };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getDonateTemplate();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateDonateTemplate', () => {
    it('should update donate template', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateDonateTemplate({ enabled: true, minAmount: 1, maxAmount: 10000 });

      expect(mockHttpClient.post).toHaveBeenCalled();
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
      const mockResponse = { autoPlay: true };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getPlaybackSetting();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updatePlaybackSetting', () => {
    it('should update playback setting', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updatePlaybackSetting({ autoPlay: false, quality: 'medium' });

      expect(mockHttpClient.post).toHaveBeenCalled();
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
  });

  // ============================================
  // AC12: User Settings Tests
  // ============================================

  describe('getCallback', () => {
    it('should get callback settings', async () => {
      const mockResponse = { url: 'https://example.com/callback' };
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

      await service.updateCallback({ url: 'https://example.com/new-callback', enabled: true });

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
      const mockResponse = { enabled: true, content: 'Footer' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getGlobalFooter();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateGlobalFooter', () => {
    it('should update global footer settings', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateGlobalFooter({ enabled: true, content: 'New footer' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('getPvShowEnable', () => {
    it('should get PV show enable settings', async () => {
      const mockResponse = { enabled: true };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getPvShowEnable();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updatePvShowEnable', () => {
    it('should update PV show enable settings', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updatePvShowEnable({ enabled: false });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  // ============================================
  // AC13: Other User Tests
  // ============================================

  describe('getMicDuration', () => {
    it('should get mic duration', async () => {
      const mockResponse = { duration: 100 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getMicDuration({ channelId: '123456', sessionId: 'session_001' });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMrConcurrencyDetail', () => {
    it('should get MR concurrency detail', async () => {
      const mockResponse = { concurrency: 100 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getMrConcurrencyDetail();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('sendSms', () => {
    it('should send SMS', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.sendSms({ mobile: '13800138000', content: 'Your code is 123456' });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('getBillUseDetailList', () => {
    it('should get bill use detail list', async () => {
      const mockResponse = { contents: [] };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getBillUseDetailList({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('viewerLotteryWin', () => {
    it('should get viewer lottery win info', async () => {
      const mockResponse = { win: true };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.viewerLotteryWin({ lotteryId: 1, viewerId: 'viewer_001' });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getWatchLogDetail', () => {
    it('should get watch log detail', async () => {
      const mockResponse = { logId: 1 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getWatchLogDetail({ logId: 1 });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getWatchLogList', () => {
    it('should get watch log list', async () => {
      const mockResponse = { contents: [], totalElements: 0 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getWatchLogList({ pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
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
