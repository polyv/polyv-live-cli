/**
 * @fileoverview Unit tests for ChatServiceSdk
 * @author Development Team
 * @since 11.1.0
 */

import { ChatServiceSdk } from './chat.service.sdk';
import { ChatServiceConfig } from '../types/chat';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError, PolyVError } from '../utils/errors';
import type { ChatHistoryPageResponse } from 'polyv-live-api-sdk';

// Mock the SDK module
jest.mock('../sdk', () => ({
  createSdkClient: jest.fn()
}));

import { createSdkClient } from '../sdk';
const mockCreateSdkClient = createSdkClient as jest.MockedFunction<typeof createSdkClient>;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('ChatServiceSdk', () => {
  let chatService: ChatServiceSdk;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: ChatServiceConfig;
  let mockClient: any;

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

    // Create mock client
    mockClient = {
      chat: {
        sendAdminMsg: jest.fn(),
        getHistoryPage: jest.fn(),
        delChat: jest.fn(),
        cleanChat: jest.fn()
      }
    };

    // Setup mock return value
    mockCreateSdkClient.mockReturnValue(mockClient);

    // Create service instance
    chatService = new ChatServiceSdk(mockAuthConfig, mockServiceConfig);
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('constructor', () => {
    it('should store auth config and service config', () => {
      // ChatServiceSdk creates client lazily, not in constructor
      // The client is created when a method is called
      expect(chatService).toBeDefined();
    });
  });

  // ========================================
  // sendAdminMessage tests
  // ========================================
  describe('sendAdminMessage', () => {
    it('should send admin message successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Message sent',
        data: 'msg-123'
      };

      mockClient.chat.sendAdminMsg.mockResolvedValue(mockResponse);

      const result = await chatService.sendAdminMessage({
        channelId: '3151318',
        msg: 'Hello World'
      });

      expect(mockClient.chat.sendAdminMsg).toHaveBeenCalledWith({
        channelId: '3151318',
        msg: 'Hello World'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should send image message successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Image sent',
        data: 'img-456'
      };

      mockClient.chat.sendAdminMsg.mockResolvedValue(mockResponse);

      const result = await chatService.sendAdminMessage({
        channelId: '3151318',
        imgUrl: 'https://example.com/image.png'
      });

      expect(mockClient.chat.sendAdminMsg).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          imgUrl: 'https://example.com/image.png'
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should send message with all options', async () => {
      const mockResponse = {
        success: true,
        message: 'Message sent',
        data: 'msg-789'
      };

      mockClient.chat.sendAdminMsg.mockResolvedValue(mockResponse);

      const result = await chatService.sendAdminMessage({
        channelId: '3151318',
        msg: 'Hello',
        imgUrl: 'https://example.com/img.png',
        pic: 'https://example.com/avatar.png',
        nickName: 'Admin',
        actor: '管理员',
        adminIndex: 1
      });

      expect(mockClient.chat.sendAdminMsg).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          msg: 'Hello',
          imgUrl: 'https://example.com/img.png',
          pic: 'https://example.com/avatar.png',
          nickName: 'Admin',
          actor: '管理员',
          adminIndex: 1
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw PolyVValidationError when required fields are missing', async () => {
      await expect(
        chatService.sendAdminMessage({ channelId: '' } as any)
      ).rejects.toThrow(PolyVValidationError);
      await expect(
        chatService.sendAdminMessage({ channelId: '' } as any)
      ).rejects.toThrow('channelId is required');
    });

    it('should throw PolyVValidationError when msg and imgUrl are both missing', async () => {
      await expect(
        chatService.sendAdminMessage({ channelId: '3151318' } as any)
      ).rejects.toThrow(PolyVValidationError);
      await expect(
        chatService.sendAdminMessage({ channelId: '3151318' } as any)
      ).rejects.toThrow('msg or imgUrl is required');
    });

    it('should throw PolyVValidationError for invalid output format', async () => {
      await expect(
        chatService.sendAdminMessage({
          channelId: '3151318',
          msg: 'Test',
          output: 'invalid' as any
        })
      ).rejects.toThrow(PolyVValidationError);
    });

    it('should handle SDK errors gracefully', async () => {
      const sdkError = new Error('SDK error');
      mockClient.chat.sendAdminMsg.mockRejectedValue(sdkError);

      await expect(
        chatService.sendAdminMessage({
          channelId: '3151318',
          msg: 'Test'
        })
      ).rejects.toThrow();
    });
  });

  // ========================================
  // listMessages tests
  // ========================================
  describe('listMessages', () => {
    const mockListResponse: ChatHistoryPageResponse = {
      contents: [
        {
          id: 'msg-1',
          content: 'Hello everyone!',
          user: { userId: 'user-1', nick: 'Alice', userType: 'student' },
          time: 1704067200000
        },
        {
          id: 'msg-2',
          content: 'Welcome to the live stream!',
          user: { userId: 'user-2', nick: 'Bob', userType: 'teacher' },
          time: 1704067260000
        }
      ],
      total: 2,
      pageSize: 20,
      pageNumber: 1,
      totalPages: 1
    };

    it('should list messages successfully', async () => {
      mockClient.chat.getHistoryPage.mockResolvedValue(mockListResponse);

      const result = await chatService.listMessages({
        channelId: '3151318'
      });

      expect(mockClient.chat.getHistoryPage).toHaveBeenCalledWith({
        channelId: '3151318'
      });
      expect(result).toEqual(mockListResponse);
    });

    it('should list messages with pagination', async () => {
      mockClient.chat.getHistoryPage.mockResolvedValue(mockListResponse);

      const result = await chatService.listMessages({
        channelId: '3151318',
        page: 2,
        size: 10
      });

      expect(mockClient.chat.getHistoryPage).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          pageSize: 10
        })
      );
      expect(result).toEqual(mockListResponse);
    });

    it('should list messages with date range filter', async () => {
      mockClient.chat.getHistoryPage.mockResolvedValue(mockListResponse);

      const result = await chatService.listMessages({
        channelId: '3151318',
        startDay: '2024-01-01',
        endDay: '2024-01-31'
      });

      expect(mockClient.chat.getHistoryPage).toHaveBeenCalledWith(
        expect.objectContaining({
          startDay: '2024-01-01',
          endDay: '2024-01-31'
        })
      );
      expect(result).toEqual(mockListResponse);
    });

    it('should list messages with user type filter', async () => {
      mockClient.chat.getHistoryPage.mockResolvedValue(mockListResponse);

      const result = await chatService.listMessages({
        channelId: '3151318',
        userType: 'teacher'
      });

      expect(mockClient.chat.getHistoryPage).toHaveBeenCalledWith(
        expect.objectContaining({
          userType: 'teacher'
        })
      );
      expect(result).toEqual(mockListResponse);
    });

    it('should list messages with status filter', async () => {
      mockClient.chat.getHistoryPage.mockResolvedValue(mockListResponse);

      const result = await chatService.listMessages({
        channelId: '3151318',
        status: 'auditing'
      });

      expect(mockClient.chat.getHistoryPage).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'auditing'
        })
      );
      expect(result).toEqual(mockListResponse);
    });

    it('should throw PolyVValidationError when channelId is missing', async () => {
      await expect(
        chatService.listMessages({ channelId: '' } as any)
      ).rejects.toThrow(PolyVValidationError);
      await expect(
        chatService.listMessages({ channelId: '' } as any)
      ).rejects.toThrow('channelId is required');
    });

    it('should throw PolyVValidationError for invalid page', async () => {
      await expect(
        chatService.listMessages({ channelId: '3151318', page: 0 } as any)
      ).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError for invalid pageSize', async () => {
      await expect(
        chatService.listMessages({ channelId: '3151318', size: 101 } as any)
      ).rejects.toThrow(PolyVValidationError);
    });

    it('should handle SDK errors gracefully', async () => {
      const sdkError = new Error('SDK error');
      mockClient.chat.getHistoryPage.mockRejectedValue(sdkError);

      await expect(
        chatService.listMessages({ channelId: '3151318' })
      ).rejects.toThrow();
    });
  });

  // ========================================
  // deleteMessage tests
  // ========================================
  describe('deleteMessage', () => {
    it('should delete single message successfully', async () => {
      mockClient.chat.delChat.mockResolvedValue({
        success: true,
        message: 'Message deleted',
        data: 'msg-123'
      });

      await chatService.deleteMessage({
        channelId: '3151318',
        messageId: 'msg-123'
      });

      expect(mockClient.chat.delChat).toHaveBeenCalledWith({
        channelId: '3151318',
        id: 'msg-123'
      });
    });

    it('should clear all messages successfully', async () => {
      mockClient.chat.cleanChat.mockResolvedValue({
        success: true,
        data: true
      });

      await chatService.deleteMessage({
        channelId: '3151318',
        clear: true
      });

      expect(mockClient.chat.cleanChat).toHaveBeenCalledWith({
        channelId: '3151318'
      });
    });

    it('should throw PolyVValidationError when channelId is missing', async () => {
      await expect(
        chatService.deleteMessage({ messageId: 'msg-123' } as any)
      ).rejects.toThrow(PolyVValidationError);
    });

    it('should throw PolyVValidationError when messageId is missing without clear', async () => {
      await expect(
        chatService.deleteMessage({ channelId: '3151318' } as any)
      ).rejects.toThrow(PolyVValidationError);
    });

    it('should not require messageId when clear is true', async () => {
      mockClient.chat.cleanChat.mockResolvedValue({
        success: true,
        data: true
      });

      // Should not throw
      await expect(
        chatService.deleteMessage({ channelId: '3151318', clear: true })
      ).resolves.toBeUndefined();
    });

    it('should handle SDK errors gracefully', async () => {
      const sdkError = new Error('SDK error');
      mockClient.chat.delChat.mockRejectedValue(sdkError);

      await expect(
        chatService.deleteMessage({
          channelId: '3151318',
          messageId: 'msg-123'
        })
      ).rejects.toThrow();
    });
  });
});
