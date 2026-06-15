/**
 * @fileoverview Unit tests for V4GroupService
 * @module services/v4/group.service.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { V4GroupService } from './group.service.js';
import type { PolyVClient } from '../../client.js';

// Mock the PolyVClient
const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
} as unknown as PolyVClient;

describe('V4GroupService', () => {
  let service: V4GroupService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4GroupService(mockClient);
  });

  // ============================================
  // createGroupUser Tests
  // ============================================

  describe('createGroupUser', () => {
    it('[P0] should create group user successfully', async () => {
      const mockResponse = { appId: 'app123', appSecret: 'secret123' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const params = {
        email: 'sub@example.com',
        password: 'Password123',
        contacts: 'John Doe',
        phone: '13800138000',
        maxChannels: 10,
      };

      const result = await service.createGroupUser(params);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/group/user/create',
        params
      );
    });

    it('[P1] should throw error when email is missing', async () => {
      await expect(
        service.createGroupUser({ password: 'Password123', contacts: 'John', phone: '13800000000', maxChannels: 10 } as any)
      ).rejects.toThrow('email is required');
    });

    it('[P1] should throw error for invalid email format', async () => {
      await expect(
        service.createGroupUser({ email: 'invalid', password: 'Password123', contacts: 'John', phone: '13800000000', maxChannels: 10 })
      ).rejects.toThrow('Invalid email format for email');
    });

    it('[P1] should throw error when password is missing', async () => {
      await expect(
        service.createGroupUser({ email: 'sub@example.com', contacts: 'John', phone: '13800000000', maxChannels: 10 } as any)
      ).rejects.toThrow('password is required');
    });

    it('[P1] should throw error when password is too short', async () => {
      await expect(
        service.createGroupUser({ email: 'sub@example.com', password: 'Pass1', contacts: 'John', phone: '13800000000', maxChannels: 10 })
      ).rejects.toThrow('password must be 8-32 characters');
    });

    it('[P1] should throw error when password has no letters', async () => {
      await expect(
        service.createGroupUser({ email: 'sub@example.com', password: '12345678', contacts: 'John', phone: '13800000000', maxChannels: 10 })
      ).rejects.toThrow('password must contain both letters and numbers');
    });

    it('[P1] should throw error when password has no numbers', async () => {
      await expect(
        service.createGroupUser({ email: 'sub@example.com', password: 'Password', contacts: 'John', phone: '13800000000', maxChannels: 10 })
      ).rejects.toThrow('password must contain both letters and numbers');
    });

    it('[P1] should throw error when contacts is missing', async () => {
      await expect(
        service.createGroupUser({ email: 'sub@example.com', password: 'Password123', phone: '13800000000', maxChannels: 10 } as any)
      ).rejects.toThrow('contacts is required');
    });

    it('[P1] should throw error when phone is missing', async () => {
      await expect(
        service.createGroupUser({ email: 'sub@example.com', password: 'Password123', contacts: 'John', maxChannels: 10 } as any)
      ).rejects.toThrow('phone is required');
    });

    it('[P1] should throw error when maxChannels is negative', async () => {
      await expect(
        service.createGroupUser({ email: 'sub@example.com', password: 'Password123', contacts: 'John', phone: '13800000000', maxChannels: -1 })
      ).rejects.toThrow('maxChannels must be >= 0');
    });
  });

  // ============================================
  // listGroupUserPackages Tests
  // ============================================

  describe('listGroupUserPackages', () => {
    it('[P0] should list group user packages successfully', async () => {
      const mockResponse = {
        contents: [{ email: 'sub@example.com', remainMinutes: 1000 }],
        total: 1,
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listGroupUserPackages({ pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
    });

    it('[P0] should list with default params', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ contents: [] });

      await service.listGroupUserPackages();

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/group/user/package/list',
        { params: {} }
      );
    });

    it('[P1] should throw error when pageNumber < 1', async () => {
      await expect(
        service.listGroupUserPackages({ pageNumber: 0, pageSize: 10 })
      ).rejects.toThrow('pageNumber must be >= 1');
    });
  });

  // ============================================
  // updateGroupUserPackage Tests
  // ============================================

  describe('updateGroupUserPackage', () => {
    it('[P0] should update group user package successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(true);

      const result = await service.updateGroupUserPackage({
        email: 'sub@example.com',
        minutes: 1000,
        concurrent: 50,
      });

      expect(result).toBe(true);
    });

    it('[P1] should throw error when email is missing', async () => {
      await expect(
        service.updateGroupUserPackage({ minutes: 1000 } as any)
      ).rejects.toThrow('email is required');
    });

    it('[P1] should throw error for invalid email format', async () => {
      await expect(
        service.updateGroupUserPackage({ email: 'invalid', minutes: 1000 })
      ).rejects.toThrow('Invalid email format for email');
    });
  });

  // ============================================
  // listBillingDaily Tests
  // ============================================

  describe('listBillingDaily', () => {
    it('[P0] should list billing daily successfully', async () => {
      const mockResponse = {
        contents: [{ billAmount: 100.50 }],
        total: 1,
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listBillingDaily({
        billingDate: '202603',
        pageNumber: 1,
        pageSize: 30,
      });

      expect(result).toEqual(mockResponse);
    });

    it('[P1] should throw error for invalid billingDate format', async () => {
      await expect(
        service.listBillingDaily({ billingDate: '2026-03', pageNumber: 1, pageSize: 10 })
      ).rejects.toThrow('billingDate must be in yyyyMM format');
    });
  });

  // ============================================
  // listAllocationLogs Tests
  // ============================================

  describe('listAllocationLogs', () => {
    it('[P0] should list allocation logs successfully', async () => {
      const mockResponse = {
        contents: [{ amount: 100, resourceCode: 'minutes' }],
        total: 1,
      };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listAllocationLogs({
        emails: 'sub1@example.com,sub2@example.com',
        pageNumber: 1,
        pageSize: 20,
      });

      expect(result).toEqual(mockResponse);
    });

    it('[P1] should throw error when emails is missing', async () => {
      await expect(
        service.listAllocationLogs({ pageNumber: 1, pageSize: 10 } as any)
      ).rejects.toThrow('emails is required');
    });
  });
});
