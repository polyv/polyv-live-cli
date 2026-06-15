import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { OtherService } from './other.service.js';
import { PolyVClient } from '../client.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';

describe('OtherService', () => {
  let service: OtherService;
  let mockClient: { httpClient: { get: Mock; post: Mock } };

  beforeEach(() => {
    mockClient = {
      httpClient: {
        get: vi.fn(),
        post: vi.fn(),
      },
    };
    service = new OtherService(mockClient as unknown as PolyVClient);
  });

  // ============================================
  // Root APIs
  // ============================================
  describe('registerUser', () => {
    it('should register user successfully', async () => {
      const mockResponse = {
        userId: 'user123',
        password: 'pass123',
        appId: 'app123',
        appSecret: 'secret123',
      };
      mockClient.httpClient.post.mockResolvedValue(mockResponse);

      const result = await service.registerUser({
        company: 'Test Company',
        mobile: 17600000000,
        contact: 'Test Contact',
        email: 'test@polyv.net',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/root/user/register',
        {
          company: 'Test Company',
          mobile: 17600000000,
          contact: 'Test Contact',
          email: 'test@polyv.net',
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for missing company', async () => {
      await expect(service.registerUser({
        company: '',
        mobile: 17600000000,
        contact: 'Test',
        email: 'test@polyv.net',
      })).rejects.toThrow('company is required');
    });

    it('should throw validation error for missing email', async () => {
      await expect(service.registerUser({
        company: 'Test',
        mobile: 17600000000,
        contact: 'Test',
        email: '',
      })).rejects.toThrow('email is required');
    });

    it('should throw validation error for invalid mobile', async () => {
      await expect(service.registerUser({
        company: 'Test',
        mobile: 'invalid' as unknown as number,
        contact: 'Test',
        email: 'test@polyv.net',
      })).rejects.toThrow('mobile must be a number');
    });
  });

  describe('createTencentOrder', () => {
    it('should create tencent order successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const result = await service.createTencentOrder({
        UIN: 'test-uin',
        orderId: 'test-order-id',
        email: 'admin@polyv.net',
        mobile: '18888888888',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/root/order/create',
        {
          UIN: 'test-uin',
          orderId: 'test-order-id',
          email: 'admin@polyv.net',
          mobile: '18888888888',
        }
      );
      expect(result).toBe(true);
    });

    it('should throw validation error for missing UIN', async () => {
      await expect(service.createTencentOrder({
        UIN: '',
        orderId: 'test-order-id',
        email: 'admin@polyv.net',
        mobile: '18888888888',
      })).rejects.toThrow('UIN is required');
    });

    it('should throw validation error for missing orderId', async () => {
      await expect(service.createTencentOrder({
        UIN: 'test-uin',
        orderId: '',
        email: 'admin@polyv.net',
        mobile: '18888888888',
      })).rejects.toThrow('orderId is required');
    });
  });

  // ============================================
  // Channel APIs
  // ============================================
  describe('resetCcbFocus', () => {
    it('should reset ccb focus successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue(null);

      const result = await service.resetCcbFocus({
        channelIds: '2731380,2750506',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/ccb/focus/reset',
        { channelIds: '2731380,2750506' }
      );
      expect(result).toBe(null);
    });

    it('should reset ccb focus with empty channelIds', async () => {
      mockClient.httpClient.post.mockResolvedValue(null);

      const result = await service.resetCcbFocus({});

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/ccb/focus/reset',
        {}
      );
      expect(result).toBe(null);
    });
  });

  describe('listTencentStreamInfo', () => {
    it('should list tencent stream info successfully', async () => {
      const mockResponse = [
        { streamUrl: 'rtmp://test', bitRate: '1000', audioFrameRate: '30', videoFrameRate: '30', time: '2024-01-01' },
      ];
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.listTencentStreamInfo({
        channelId: '3880533',
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/monitor/list-tencent-stream-info',
        { params: { channelId: '3880533' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.listTencentStreamInfo({
        channelId: '',
      })).rejects.toThrow('channelId is required');
    });
  });

  describe('checkChannelStatusValid', () => {
    it('should check channel status valid successfully', async () => {
      const mockResponse = {
        validChannels: ['1965681', '2272665'],
        invalidChannels: ['9999999'],
      };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.checkChannelStatusValid({
        channels: '1965681,2272665,9999999',
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/status-valid',
        { params: { channels: '1965681,2272665,9999999' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for missing channels', async () => {
      await expect(service.checkChannelStatusValid({
        channels: '',
      })).rejects.toThrow('channels is required');
    });

    it('should throw validation error for more than 100 channels', async () => {
      const channels = Array(101).fill('123').join(',');
      await expect(service.checkChannelStatusValid({
        channels,
      })).rejects.toThrow('channels cannot exceed 100');
    });

    it('should accept exactly 100 channels', async () => {
      const mockResponse = { validChannels: [], invalidChannels: [] };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const channels = Array(100).fill('123').join(',');
      await service.checkChannelStatusValid({ channels });

      expect(mockClient.httpClient.get).toHaveBeenCalled();
    });
  });

  // ============================================
  // Statistics APIs
  // ============================================
  describe('getInviterPosterList', () => {
    it('should get inviter poster list successfully', async () => {
      const mockResponse = {
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 1,
        contents: [],
      };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getInviterPosterList({
        channelId: '2731380',
        pageNumber: 1,
        pageSize: 10,
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/statistics/inviter-poster/list',
        { params: { channelId: '2731380', pageNumber: 1, pageSize: 10 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.getInviterPosterList({
        channelId: '',
      })).rejects.toThrow('channelId is required');
    });
  });

  // ============================================
  // Chat APIs
  // ============================================
  describe('getGroupLoginTimes', () => {
    it('should get group login times successfully', async () => {
      const mockResponse = [
        { id: 'group1', name: 'Group 1', total: 100 },
      ];
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getGroupLoginTimes({
        channelId: '1965681',
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/chat/get-group-login-times',
        { params: { channelId: '1965681' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.getGroupLoginTimes({
        channelId: '',
      })).rejects.toThrow('channelId is required');
    });
  });

  describe('emitByUserId', () => {
    it('should emit by user id successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue({});

      const result = await service.emitByUserId({
        roomId: '123456',
        userIds: ['user1', 'user2', 'user3'],
        payload: 'Hello everyone!',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v5/chat/redirect/channel/emit-by-userId/post',
        {
          roomId: '123456',
          userIds: ['user1', 'user2', 'user3'],
          payload: 'Hello everyone!',
        }
      );
      expect(result).toEqual({});
    });

    it('should throw validation error for missing roomId', async () => {
      await expect(service.emitByUserId({
        roomId: '',
        userIds: ['user1'],
        payload: 'test',
      })).rejects.toThrow('roomId is required');
    });

    it('should throw validation error for missing userIds', async () => {
      await expect(service.emitByUserId({
        roomId: '123456',
        userIds: undefined as unknown as string[],
        payload: 'test',
      })).rejects.toThrow('userIds is required');
    });

    it('should throw validation error for non-array userIds', async () => {
      await expect(service.emitByUserId({
        roomId: '123456',
        userIds: 'not-array' as unknown as string[],
        payload: 'test',
      })).rejects.toThrow('userIds must be an array');
    });

    it('should throw validation error for empty userIds', async () => {
      await expect(service.emitByUserId({
        roomId: '123456',
        userIds: [],
        payload: 'test',
      })).rejects.toThrow('userIds cannot be empty');
    });

    it('should throw validation error for too many userIds', async () => {
      await expect(service.emitByUserId({
        roomId: '123456',
        userIds: Array(2001).fill('user'),
        payload: 'test',
      })).rejects.toThrow('userIds cannot exceed 2000');
    });

    it('should throw validation error for missing payload', async () => {
      await expect(service.emitByUserId({
        roomId: '123456',
        userIds: ['user1'],
        payload: '',
      })).rejects.toThrow('payload is required');
    });

    it('should accept exactly 2000 userIds', async () => {
      mockClient.httpClient.post.mockResolvedValue({});

      await service.emitByUserId({
        roomId: '123456',
        userIds: Array(2000).fill('user'),
        payload: 'test',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalled();
    });
  });

  // ============================================
  // Group APIs
  // ============================================
  describe('healthCheck', () => {
    it('should health check successfully', async () => {
      const mockResponse = { status: 'ok', timestamp: 1700000000000 };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.healthCheck();

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/group/health-check'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createIsolation', () => {
    it('should create isolation successfully', async () => {
      const mockResponse = { userId: 'user123', email: 'sub@polyv.net' };
      mockClient.httpClient.post.mockResolvedValue(mockResponse);

      const result = await service.createIsolation({
        email: 'sub@polyv.net',
        password: 'Test123456',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/group/user/isolation/create',
        {
          email: 'sub@polyv.net',
          password: 'Test123456',
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for missing email', async () => {
      await expect(service.createIsolation({
        email: '',
        password: 'Test123456',
      })).rejects.toThrow('email is required');
    });

    it('should throw validation error for missing password', async () => {
      await expect(service.createIsolation({
        email: 'sub@polyv.net',
        password: '',
      })).rejects.toThrow('password is required');
    });

    it('should throw validation error for password too short', async () => {
      await expect(service.createIsolation({
        email: 'sub@polyv.net',
        password: 'Test1',
      })).rejects.toThrow('password must be 8-32 characters');
    });

    it('should throw validation error for password too long', async () => {
      await expect(service.createIsolation({
        email: 'sub@polyv.net',
        password: 'a'.repeat(33) + '1',
      })).rejects.toThrow('password must be 8-32 characters');
    });

    it('should throw validation error for password without letters', async () => {
      await expect(service.createIsolation({
        email: 'sub@polyv.net',
        password: '12345678',
      })).rejects.toThrow('password must contain both letters and numbers');
    });

    it('should throw validation error for password without numbers', async () => {
      await expect(service.createIsolation({
        email: 'sub@polyv.net',
        password: 'abcdefgh',
      })).rejects.toThrow('password must contain both letters and numbers');
    });
  });

  describe('createIsolationZone', () => {
    it('should create isolation zone successfully', async () => {
      const mockResponse = { isolationId: 'iso123', userId: 'user123' };
      mockClient.httpClient.post.mockResolvedValue(mockResponse);

      const result = await service.createIsolationZone({
        userId: 'user123',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/group/isolation-zone/create',
        { userId: 'user123' }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPackageValidityList', () => {
    it('should get package validity list successfully', async () => {
      const mockResponse = {
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 1,
        contents: [],
      };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getPackageValidityList({
        pageNumber: 1,
        pageSize: 10,
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/group/user/package-validity/list',
        { params: { pageNumber: 1, pageSize: 10 } }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updatePackageValidity', () => {
    it('should update package validity successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue(true);

      const result = await service.updatePackageValidity({
        email: 'sub@polyv.net',
        balance: 100,
        concurrent: 5,
        minutes: 1000,
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/group/user/package-validity/update',
        {
          email: 'sub@polyv.net',
          balance: 100,
          concurrent: 5,
          minutes: 1000,
        }
      );
      expect(result).toBe(true);
    });

    it('should throw validation error for missing email', async () => {
      await expect(service.updatePackageValidity({
        email: '',
        balance: 100,
      })).rejects.toThrow('email is required');
    });
  });

  describe('resetAppSecret', () => {
    it('should reset app secret successfully', async () => {
      const mockResponse = { appSecret: 'new-secret-123' };
      mockClient.httpClient.post.mockResolvedValue(mockResponse);

      const result = await service.resetAppSecret({
        email: 'sub@polyv.net',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/group/user/secret/reset',
        { email: 'sub@polyv.net' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for missing email', async () => {
      await expect(service.resetAppSecret({
        email: '',
      })).rejects.toThrow('email is required');
    });
  });

  describe('getIsolationBillingList', () => {
    it('should get isolation billing list successfully', async () => {
      const mockResponse = {
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 1,
        contents: [],
      };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getIsolationBillingList({
        billingDate: '202401',
        isolationId: 'iso123',
        pageNumber: 1,
        pageSize: 10,
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/group/isolation/billing/list',
        { params: { billingDate: '202401', isolationId: 'iso123', pageNumber: 1, pageSize: 10 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for missing billingDate', async () => {
      await expect(service.getIsolationBillingList({
        billingDate: '',
        isolationId: 'iso123',
      })).rejects.toThrow('billingDate is required');
    });

    it('should throw validation error for missing isolationId', async () => {
      await expect(service.getIsolationBillingList({
        billingDate: '202401',
        isolationId: '',
      })).rejects.toThrow('isolationId is required');
    });
  });

  describe('getIsolationList', () => {
    it('should get isolation list successfully', async () => {
      const mockResponse = [
        { userId: 'user1', email: 'sub1@polyv.net', status: 'active' },
        { userId: 'user2', email: 'sub2@polyv.net', status: 'active' },
      ];
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getIsolationList({
        isolationId: 'iso123',
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v4/group/isolation/list',
        { params: { isolationId: 'iso123' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for missing isolationId', async () => {
      await expect(service.getIsolationList({
        isolationId: '',
      })).rejects.toThrow('isolationId is required');
    });
  });
});
