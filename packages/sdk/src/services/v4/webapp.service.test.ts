/**
 * @fileoverview Unit tests for V4WebAppService
 * @module services/v4/webapp.service.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { V4WebAppService } from './webapp.service.js';
import type { PolyVClient } from '../../client.js';

// Mock the PolyVClient
const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
} as unknown as PolyVClient;

describe('V4WebAppService', () => {
  let service: V4WebAppService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4WebAppService(mockClient);
  });

  // ============================================
  // listPermissions Tests
  // ============================================

  describe('listPermissions', () => {
    it('[P0] should list permissions successfully', async () => {
      const mockResponse = [
        { permissionId: 1, name: 'Permission 1' },
        { permissionId: 2, name: 'Permission 2' },
      ];
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listPermissions();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/webapp-role/permission/list'
      );
    });
  });

  // ============================================
  // createRole Tests
  // ============================================

  describe('createRole', () => {
    it('[P0] should create role with child type successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.createRole({
        name: 'Channel Manager',
        desc: 'Can manage channels',
        roleType: 'child',
        permissionIds: [1, 2, 3],
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/webapp-role/create',
        { name: 'Channel Manager', desc: 'Can manage channels', roleType: 'child', permissionIds: [1, 2, 3] }
      );
    });

    it('[P0] should create role with root type successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.createRole({
        name: 'Admin',
        roleType: 'root',
        permissionIds: [1, 2, 3],
      });

      expect(mockHttpClient.post).toHaveBeenCalled();
    });

    it('[P1] should throw error when name is empty', async () => {
      await expect(
        service.createRole({ name: '', roleType: 'child', permissionIds: [1] } as any)
      ).rejects.toThrow('name is required');
    });

    it('[P1] should throw error when roleType is missing', async () => {
      await expect(
        service.createRole({ name: 'Test', permissionIds: [1] } as any)
      ).rejects.toThrow('roleType is required');
    });

    it('[P1] should throw error for invalid roleType', async () => {
      await expect(
        service.createRole({ name: 'Test', roleType: 'invalid' as any, permissionIds: [1] })
      ).rejects.toThrow('roleType must be "root" or "child"');
    });

    it('[P1] should throw error when permissionIds is empty', async () => {
      await expect(
        service.createRole({ name: 'Test', roleType: 'child', permissionIds: [] })
      ).rejects.toThrow('permissionIds is required and must not be empty');
    });
  });

  // ============================================
  // getRole Tests
  // ============================================

  describe('getRole', () => {
    it('[P0] should get role successfully', async () => {
      const mockResponse = {
        role: { roleId: 123, name: 'Test Role' },
        permissions: [],
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getRole(123);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/webapp-role/get',
        { params: { roleId: 123 } }
      );
    });

    it('[P1] should throw error when roleId is missing', async () => {
      await expect(
        service.getRole(undefined as any)
      ).rejects.toThrow('roleId is required');
    });
  });

  // ============================================
  // listRoles Tests
  // ============================================

  describe('listRoles', () => {
    it('[P0] should list roles successfully', async () => {
      const mockResponse = {
        contents: [{ roleId: 1, name: 'Role 1' }],
        total: 1,
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listRoles({ pageNumber: 1, pageSize: 20 });

      expect(result).toEqual(mockResponse);
    });

    it('[P0] should list roles with default params', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ contents: [] });

      await service.listRoles();

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/webapp-role/list',
        { params: {} }
      );
    });

    it('[P1] should throw error when pageNumber < 1', async () => {
      await expect(
        service.listRoles({ pageNumber: 0, pageSize: 10 })
      ).rejects.toThrow('pageNumber must be >= 1');
    });

    it('[P1] should throw error when pageSize > 1000', async () => {
      await expect(
        service.listRoles({ pageNumber: 1, pageSize: 1001 })
      ).rejects.toThrow('pageSize must be between 1 and 1000');
    });
  });

  // ============================================
  // updateRole Tests
  // ============================================

  describe('updateRole', () => {
    it('[P0] should update role successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateRole({
        roleId: 123,
        name: 'Updated Role',
        roleType: 'child',
        permissionIds: [1, 2, 3, 4],
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/webapp-role/update',
        { roleId: 123, name: 'Updated Role', roleType: 'child', permissionIds: [1, 2, 3, 4] }
      );
    });

    it('[P1] should throw error when roleId is missing', async () => {
      await expect(
        service.updateRole({ name: 'Test', roleType: 'child', permissionIds: [1] } as any)
      ).rejects.toThrow('roleId is required');
    });

    it('[P1] should throw error when name is empty', async () => {
      await expect(
        service.updateRole({ roleId: 123, name: '', roleType: 'child', permissionIds: [1] } as any)
      ).rejects.toThrow('name is required');
    });

    it('[P1] should throw error for invalid roleType', async () => {
      await expect(
        service.updateRole({ roleId: 123, name: 'Test', roleType: 'invalid' as any, permissionIds: [1] })
      ).rejects.toThrow('roleType must be "root" or "child"');
    });
  });

  // ============================================
  // deleteRole Tests
  // ============================================

  describe('deleteRole', () => {
    it('[P0] should delete role successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteRole(123);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/webapp-role/delete',
        undefined,
        { params: { id: 123 } }
      );
    });

    it('[P1] should throw error when roleId is missing', async () => {
      await expect(
        service.deleteRole(undefined as any)
      ).rejects.toThrow('roleId is required');
    });
  });
});
