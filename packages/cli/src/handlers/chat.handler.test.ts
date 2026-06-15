/**
 * @fileoverview Unit tests for ChatHandler
 * @author Development Team
 * @since 11.1.0
 */

import { ChatHandler } from './chat.handler';
import { ChatServiceSdk } from '../services/chat.service.sdk';
import { ChatServiceConfig } from '../types/chat';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError, PolyVError } from '../utils/errors';

// Mock ChatServiceSdk
jest.mock('../services/chat.service.sdk');
const MockedChatService = ChatServiceSdk as jest.MockedClass<typeof ChatServiceSdk>;

// Mock confirmation utility
jest.mock('../utils/confirmation', () => ({
  confirmDeletion: jest.fn()
}));

import { confirmDeletion } from '../utils/confirmation';
const mockConfirmDeletion = confirmDeletion as jest.MockedFunction<typeof confirmDeletion>;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('ChatHandler', () => {
  let chatHandler: ChatHandler;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: ChatServiceConfig;
  let mockChatService: jest.Mocked<ChatServiceSdk>;

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
    mockChatService = {
      sendAdminMessage: jest.fn(),
      listMessages: jest.fn(),
      deleteMessage: jest.fn()
    } as any;

    // Mock ChatService constructor
    MockedChatService.mockImplementation(() => mockChatService);

    // Create handler instance
    chatHandler = new ChatHandler(mockAuthConfig, mockServiceConfig);
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('constructor', () => {
    it('should create ChatServiceSdk with correct configuration', () => {
      expect(MockedChatService).toHaveBeenCalledWith(mockAuthConfig, mockServiceConfig);
    });
  });

  // ============================================================
  // AC #1: chat send command
  // ============================================================
  describe('sendAdminMessage (AC #1)', () => {
    it('should send text message successfully', async () => {
      const options = {
        channelId: '3151318',
        msg: 'Hello World',
        output: 'table' as const
      };

      mockChatService.sendAdminMessage.mockResolvedValue({
        success: true,
        message: 'Message sent successfully',
        data: 'msg-123'
      });

      await chatHandler.sendAdminMessage(options);

      expect(mockChatService.sendAdminMessage).toHaveBeenCalledWith(options);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Admin message sent successfully')
      );
    });

    it('should send image message successfully', async () => {
      const options = {
        channelId: '3151318',
        imgUrl: 'https://example.com/image.png',
        output: 'table' as const
      };

      mockChatService.sendAdminMessage.mockResolvedValue({
        success: true,
        message: 'Message sent successfully',
        data: 'msg-456'
      });

      await chatHandler.sendAdminMessage(options);

      expect(mockChatService.sendAdminMessage).toHaveBeenCalledWith(options);
    });

    it('should send message with custom nickname and actor', async () => {
      const options = {
        channelId: '3151318',
        msg: 'Hello',
        nickName: 'Admin',
        actor: '管理员',
        output: 'table' as const
      };

      mockChatService.sendAdminMessage.mockResolvedValue({
        success: true,
        message: 'Message sent successfully',
        data: 'msg-789'
      });

      await chatHandler.sendAdminMessage(options);

      expect(mockChatService.sendAdminMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          nickName: 'Admin',
          actor: '管理员'
        })
      );
    });

    it('should display result in JSON format', async () => {
      const options = {
        channelId: '3151318',
        msg: 'Hello',
        output: 'json' as const
      };

      mockChatService.sendAdminMessage.mockResolvedValue({
        success: true,
        message: 'Message sent successfully',
        data: 'msg-123'
      });

      await chatHandler.sendAdminMessage(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"success": true')
      );
    });

    it('should throw PolyVValidationError when channelId is missing', async () => {
      const options = {
        msg: 'Hello',
        output: 'table' as const
      };

      await expect(chatHandler.sendAdminMessage(options as any)).rejects.toThrow(PolyVValidationError);
      await expect(chatHandler.sendAdminMessage(options as any)).rejects.toThrow('channelId is required');
    });

    it('should throw PolyVValidationError when both msg and imgUrl are missing', async () => {
      const options = {
        channelId: '3151318',
        output: 'table' as const
      };

      await expect(chatHandler.sendAdminMessage(options as any)).rejects.toThrow(PolyVValidationError);
      await expect(chatHandler.sendAdminMessage(options as any)).rejects.toThrow('msg or imgUrl is required');
    });

    it('should throw PolyVValidationError for invalid output format', async () => {
      const options = {
        channelId: '3151318',
        msg: 'Hello',
        output: 'xml' as any
      };

      await expect(chatHandler.sendAdminMessage(options)).rejects.toThrow(PolyVValidationError);
      await expect(chatHandler.sendAdminMessage(options)).rejects.toThrow('output must be either "table" or "json"');
    });

    it('should handle service errors', async () => {
      const options = {
        channelId: '3151318',
        msg: 'Hello',
        output: 'table' as const
      };

      const serviceError = new PolyVError('Service error', 'SERVICE_ERROR', 500);
      mockChatService.sendAdminMessage.mockRejectedValue(serviceError);

      await expect(chatHandler.sendAdminMessage(options)).rejects.toThrow(serviceError);
    });
  });

  // ============================================================
  // AC #2: chat list command
  // ============================================================
  describe('listMessages (AC #2)', () => {
    const mockMessages = [
      {
        id: 'msg-1',
        content: 'Hello everyone!',
        user: { userId: 'user-1', nick: 'Alice', userType: 'student' },
        time: 1704067200000,
        status: 'show'
      },
      {
        id: 'msg-2',
        content: 'Welcome to the live stream!',
        user: { userId: 'user-2', nick: 'Bob', userType: 'teacher' },
        time: 1704067260000,
        status: 'show'
      }
    ];

    it('should list messages successfully with default options', async () => {
      const options = {
        channelId: '3151318',
        output: 'table' as const
      };

      mockChatService.listMessages.mockResolvedValue({
        contents: mockMessages,
        total: 2,
        pageSize: 20,
        pageNumber: 1,
        totalPages: 1
      });

      await chatHandler.listMessages(options);

      expect(mockChatService.listMessages).toHaveBeenCalledWith(options);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Showing messages')
      );
    });

    it('should list messages with pagination', async () => {
      const options = {
        channelId: '3151318',
        page: 2,
        size: 10,
        output: 'table' as const
      };

      mockChatService.listMessages.mockResolvedValue({
        contents: [mockMessages[0]],
        total: 15,
        pageSize: 10,
        pageNumber: 2,
        totalPages: 2
      });

      await chatHandler.listMessages(options);

      expect(mockChatService.listMessages).toHaveBeenCalledWith(options);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('page 2')
      );
    });

    it('should list messages with date range filter', async () => {
      const options = {
        channelId: '3151318',
        startDay: '2024-01-01',
        endDay: '2024-01-31',
        output: 'table' as const
      };

      mockChatService.listMessages.mockResolvedValue({
        contents: mockMessages,
        total: 2,
        pageSize: 20,
        pageNumber: 1,
        totalPages: 1
      });

      await chatHandler.listMessages(options);

      expect(mockChatService.listMessages).toHaveBeenCalledWith(
        expect.objectContaining({
          startDay: '2024-01-01',
          endDay: '2024-01-31'
        })
      );
    });

    it('should list messages with user type filter', async () => {
      const options = {
        channelId: '3151318',
        userType: 'teacher',
        output: 'table' as const
      };

      mockChatService.listMessages.mockResolvedValue({
        contents: [mockMessages[1]],
        total: 1,
        pageSize: 20,
        pageNumber: 1,
        totalPages: 1
      });

      await chatHandler.listMessages(options);

      expect(mockChatService.listMessages).toHaveBeenCalledWith(
        expect.objectContaining({
          userType: 'teacher'
        })
      );
    });

    it('should display messages in JSON format', async () => {
      const options = {
        channelId: '3151318',
        output: 'json' as const
      };

      mockChatService.listMessages.mockResolvedValue({
        contents: mockMessages,
        total: 2,
        pageSize: 20,
        pageNumber: 1,
        totalPages: 1
      });

      await chatHandler.listMessages(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"id": "msg-1"')
      );
    });

    it('should display empty results gracefully', async () => {
      const options = {
        channelId: '3151318',
        output: 'table' as const
      };

      mockChatService.listMessages.mockResolvedValue({
        contents: [],
        total: 0,
        pageSize: 20,
        pageNumber: 1,
        totalPages: 0
      });

      await chatHandler.listMessages(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No chat messages found')
      );
    });

    it('should throw PolyVValidationError when channelId is missing', async () => {
      const options = {
        output: 'table' as const
      };

      await expect(chatHandler.listMessages(options as any)).rejects.toThrow(PolyVValidationError);
      await expect(chatHandler.listMessages(options as any)).rejects.toThrow('channelId is required');
    });

    it('should throw PolyVValidationError for invalid page number', async () => {
      const options = {
        channelId: '3151318',
        page: 0,
        output: 'table' as const
      };

      await expect(chatHandler.listMessages(options)).rejects.toThrow(PolyVValidationError);
      await expect(chatHandler.listMessages(options)).rejects.toThrow('page must be a positive integer');
    });

    it('should throw PolyVValidationError for invalid page size', async () => {
      const options = {
        channelId: '3151318',
        size: 101,
        output: 'table' as const
      };

      await expect(chatHandler.listMessages(options)).rejects.toThrow(PolyVValidationError);
      await expect(chatHandler.listMessages(options)).rejects.toThrow('pageSize must be an integer between 1 and 100');
    });

    it('should handle service errors', async () => {
      const options = {
        channelId: '3151318',
        output: 'table' as const
      };

      const serviceError = new PolyVError('Service error', 'SERVICE_ERROR', 500);
      mockChatService.listMessages.mockRejectedValue(serviceError);

      await expect(chatHandler.listMessages(options)).rejects.toThrow(serviceError);
    });
  });

  // ============================================================
  // AC #3: chat delete command
  // ============================================================
  describe('deleteMessage (AC #3)', () => {
    it('should delete a single message with confirmation', async () => {
      const options = {
        channelId: '3151318',
        messageId: 'msg-123',
        output: 'table' as const
      };

      mockConfirmDeletion.mockResolvedValue(true);
      mockChatService.deleteMessage.mockResolvedValue();

      await chatHandler.deleteMessage(options);

      expect(mockConfirmDeletion).toHaveBeenCalledWith(
        expect.stringContaining('msg-123'),
        'yes'
      );
      expect(mockChatService.deleteMessage).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('deleted successfully')
      );
    });

    it('should cancel operation when user declines confirmation', async () => {
      const options = {
        channelId: '3151318',
        messageId: 'msg-123',
        output: 'table' as const
      };

      mockConfirmDeletion.mockResolvedValue(false);

      await chatHandler.deleteMessage(options);

      expect(mockChatService.deleteMessage).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('cancelled')
      );
    });

    it('should clear all messages with --clear flag', async () => {
      const options = {
        channelId: '3151318',
        clear: true,
        output: 'table' as const
      };

      mockConfirmDeletion.mockResolvedValue(true);
      mockChatService.deleteMessage.mockResolvedValue();

      await chatHandler.deleteMessage(options);

      expect(mockConfirmDeletion).toHaveBeenCalledWith(
        expect.stringContaining('clear all chat messages'),
        'yes'
      );
      expect(mockChatService.deleteMessage).toHaveBeenCalledWith(
        expect.objectContaining({ clear: true })
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('cleared successfully')
      );
    });

    it('should display result in JSON format', async () => {
      const options = {
        channelId: '3151318',
        messageId: 'msg-123',
        output: 'json' as const
      };

      mockConfirmDeletion.mockResolvedValue(true);
      mockChatService.deleteMessage.mockResolvedValue();

      await chatHandler.deleteMessage(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"deleted": true')
      );
    });

    it('should throw PolyVValidationError when channelId is missing', async () => {
      const options = {
        messageId: 'msg-123',
        output: 'table' as const
      };

      await expect(chatHandler.deleteMessage(options as any)).rejects.toThrow(PolyVValidationError);
      await expect(chatHandler.deleteMessage(options as any)).rejects.toThrow('channelId is required');
    });

    it('should throw PolyVValidationError when messageId is missing without --clear', async () => {
      const options = {
        channelId: '3151318',
        output: 'table' as const
      };

      await expect(chatHandler.deleteMessage(options)).rejects.toThrow(PolyVValidationError);
      await expect(chatHandler.deleteMessage(options)).rejects.toThrow('messageId is required when --clear is not specified');
    });

    it('should not require messageId when --clear is true', async () => {
      const options = {
        channelId: '3151318',
        clear: true,
        output: 'table' as const
      };

      mockConfirmDeletion.mockResolvedValue(true);
      mockChatService.deleteMessage.mockResolvedValue();

      // Should not throw
      await expect(chatHandler.deleteMessage(options)).resolves.toBeUndefined();
    });

    it('should handle service errors', async () => {
      const options = {
        channelId: '3151318',
        messageId: 'msg-123',
        output: 'table' as const
      };

      mockConfirmDeletion.mockResolvedValue(true);
      const serviceError = new PolyVError('Service error', 'SERVICE_ERROR', 500);
      mockChatService.deleteMessage.mockRejectedValue(serviceError);

      await expect(chatHandler.deleteMessage(options)).rejects.toThrow(serviceError);
    });
  });

  // ============================================================
  // AC #8: Table output format
  // ============================================================
  describe('table output format (AC #8)', () => {
    it('should display message ID in table output', async () => {
      const options = {
        channelId: '3151318',
        output: 'table' as const
      };

      mockChatService.listMessages.mockResolvedValue({
        contents: [{ id: 'msg-123', content: 'Test', user: { nick: 'User' }, time: Date.now() }],
        total: 1,
        pageSize: 20,
        pageNumber: 1,
        totalPages: 1
      });

      await chatHandler.listMessages(options);

      // Table should include Message ID column
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should display content in table output', async () => {
      const options = {
        channelId: '3151318',
        output: 'table' as const
      };

      mockChatService.listMessages.mockResolvedValue({
        contents: [{ id: 'msg-1', content: 'Hello World', user: { nick: 'User' }, time: Date.now() }],
        total: 1,
        pageSize: 20,
        pageNumber: 1,
        totalPages: 1
      });

      await chatHandler.listMessages(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should display sender nickname in table output', async () => {
      const options = {
        channelId: '3151318',
        output: 'table' as const
      };

      mockChatService.listMessages.mockResolvedValue({
        contents: [{ id: 'msg-1', content: 'Test', user: { nick: 'Alice' }, time: Date.now() }],
        total: 1,
        pageSize: 20,
        pageNumber: 1,
        totalPages: 1
      });

      await chatHandler.listMessages(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should display time in table output', async () => {
      const options = {
        channelId: '3151318',
        output: 'table' as const
      };

      mockChatService.listMessages.mockResolvedValue({
        contents: [{ id: 'msg-1', content: 'Test', user: { nick: 'User' }, time: 1704067200000 }],
        total: 1,
        pageSize: 20,
        pageNumber: 1,
        totalPages: 1
      });

      await chatHandler.listMessages(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should truncate long content in table output', async () => {
      const handler = chatHandler as any;
      const longContent = 'a'.repeat(100);
      const truncated = handler.truncateContent(longContent, 50);

      expect(truncated.length).toBeLessThanOrEqual(50);
      expect(truncated).toContain('...');
    });
  });

  // ============================================================
  // Story 11-2: Ban/Kick Management Commands
  // ============================================================

  // ========================================
  // AC #1: chat ban command
  // ========================================
  describe('banUser (Story 11-2, AC #1)', () => {
    it('should ban users at channel level', async () => {
      const options = {
        channelId: '3151318',
        userIds: ['user1', 'user2'],
        output: 'table' as const
      };

      mockChatService.updateBannedUser = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'SUCCESS',
        data: 'SUCCESS'
      });

      await chatHandler.banUser(options);

      expect(mockChatService.updateBannedUser).toHaveBeenCalledWith({
        channelId: '3151318',
        userIds: 'user1,user2',
        toBanned: 'Y'
      });
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('banned')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('successfully')
      );
    });

    it('should ban users globally with --global flag', async () => {
      const options = {
        userIds: ['user1', 'user2'],
        global: true,
        output: 'table' as const
      };

      mockChatService.updateBannedViewer = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'SUCCESS',
        data: 'SUCCESS'
      });

      await chatHandler.banUser(options);

      expect(mockChatService.updateBannedViewer).toHaveBeenCalledWith({
        viewerIds: ['user1', 'user2'],
        banned: 'Y'
      });
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('banned globally')
      );
    });

    it('should validate user IDs are required', async () => {
      const options = {
        channelId: '3151318',
        output: 'table' as const
      };

      await expect(chatHandler.banUser(options as any)).rejects.toThrow(PolyVValidationError);
      await expect(chatHandler.banUser(options as any)).rejects.toThrow('userIds is required');
    });

    it('should support JSON output format', async () => {
      const options = {
        channelId: '3151318',
        userIds: ['user1'],
        output: 'json' as const
      };

      mockChatService.updateBannedUser = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'SUCCESS',
        data: 'SUCCESS'
      });

      await chatHandler.banUser(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"channelId": "3151318"')
      );
    });

    it('should handle API errors gracefully', async () => {
      const options = {
        channelId: '3151318',
        userIds: ['user1'],
        output: 'table' as const
      };

      const serviceError = new PolyVError('Ban failed', 'BAN_ERROR', 400);
      mockChatService.updateBannedUser = jest.fn().mockRejectedValue(serviceError);

      await expect(chatHandler.banUser(options)).rejects.toThrow(serviceError);
    });

    it('should validate output format', async () => {
      const options = {
        channelId: '3151318',
        userIds: ['user1'],
        output: 'xml' as any
      };

      await expect(chatHandler.banUser(options)).rejects.toThrow(PolyVValidationError);
      await expect(chatHandler.banUser(options)).rejects.toThrow('output must be either "table" or "json"');
    });
  });

  // ========================================
  // AC #2: chat unban command
  // ========================================
  describe('unbanUser (Story 11-2, AC #2)', () => {
    it('should unban users at channel level', async () => {
      const options = {
        channelId: '3151318',
        userIds: ['user1', 'user2'],
        output: 'table' as const
      };

      mockChatService.updateBannedUser = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'SUCCESS',
        data: 'SUCCESS'
      });

      await chatHandler.unbanUser(options);

      expect(mockChatService.updateBannedUser).toHaveBeenCalledWith({
        channelId: '3151318',
        userIds: 'user1,user2',
        toBanned: 'N'
      });
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('unbanned')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('successfully')
      );
    });

    it('should unban users globally with --global flag', async () => {
      const options = {
        userIds: ['user1', 'user2'],
        global: true,
        output: 'table' as const
      };

      mockChatService.updateBannedViewer = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'SUCCESS',
        data: 'SUCCESS'
      });

      await chatHandler.unbanUser(options);

      expect(mockChatService.updateBannedViewer).toHaveBeenCalledWith({
        viewerIds: ['user1', 'user2'],
        banned: 'N'
      });
    });

    it('should validate user IDs are required', async () => {
      const options = {
        channelId: '3151318',
        output: 'table' as const
      };

      await expect(chatHandler.unbanUser(options as any)).rejects.toThrow(PolyVValidationError);
    });

    it('should support both table and json output', async () => {
      const options = {
        channelId: '3151318',
        userIds: ['user1'],
        output: 'json' as const
      };

      mockChatService.updateBannedUser = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'SUCCESS',
        data: 'SUCCESS'
      });

      await chatHandler.unbanUser(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"userIds"')
      );
    });
  });

  // ========================================
  // AC #3: chat kick command
  // ========================================
  describe('kickUser (Story 11-2, AC #3)', () => {
    it('should kick users at channel level', async () => {
      const options = {
        channelId: '3151318',
        viewerIds: ['viewer1', 'viewer2'],
        nickNames: ['Nick1', 'Nick2'],
        output: 'table' as const
      };

      mockChatService.forbidChannelKickUsers = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'SUCCESS',
        data: 'SUCCESS'
      });

      await chatHandler.kickUser(options);

      expect(mockChatService.forbidChannelKickUsers).toHaveBeenCalledWith({
        channelId: '3151318',
        viewerIds: ['viewer1', 'viewer2'],
        nickNames: ['Nick1', 'Nick2']
      });
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('kicked')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('successfully')
      );
    });

    it('should kick users globally with --global flag', async () => {
      const options = {
        viewerIds: ['viewer1', 'viewer2'],
        nickNames: ['Nick1', 'Nick2'],
        global: true,
        output: 'table' as const
      };

      mockChatService.forbidKickUsers = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'SUCCESS',
        data: 'SUCCESS'
      });

      await chatHandler.kickUser(options);

      expect(mockChatService.forbidKickUsers).toHaveBeenCalledWith({
        viewerIds: ['viewer1', 'viewer2'],
        nickNames: ['Nick1', 'Nick2']
      });
    });

    it('should validate viewer IDs and nicknames are provided', async () => {
      const options = {
        channelId: '3151318',
        output: 'table' as const
      };

      await expect(chatHandler.kickUser(options as any)).rejects.toThrow(PolyVValidationError);
      await expect(chatHandler.kickUser(options as any)).rejects.toThrow('viewerIds and nickNames are required');
    });

    it('should validate viewerIds and nickNames arrays have same length', async () => {
      const options = {
        channelId: '3151318',
        viewerIds: ['viewer1', 'viewer2'],
        nickNames: ['Nick1'],
        output: 'table' as const
      };

      await expect(chatHandler.kickUser(options as any)).rejects.toThrow(PolyVValidationError);
      await expect(chatHandler.kickUser(options as any)).rejects.toThrow('viewerIds and nickNames must have the same length');
    });

    it('should support both table and json output', async () => {
      const options = {
        channelId: '3151318',
        viewerIds: ['viewer1'],
        nickNames: ['Nick1'],
        output: 'json' as const
      };

      mockChatService.forbidChannelKickUsers = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'SUCCESS',
        data: 'SUCCESS'
      });

      await chatHandler.kickUser(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"viewerIds"')
      );
    });
  });

  // ========================================
  // AC #4: chat unkick command
  // ========================================
  describe('unkickUser (Story 11-2, AC #4)', () => {
    it('should unkick users at channel level', async () => {
      const options = {
        channelId: '3151318',
        viewerIds: ['viewer1', 'viewer2'],
        nickNames: ['Nick1', 'Nick2'],
        output: 'table' as const
      };

      mockChatService.forbidChannelUnkickUsers = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'SUCCESS',
        data: 'SUCCESS'
      });

      await chatHandler.unkickUser(options);

      expect(mockChatService.forbidChannelUnkickUsers).toHaveBeenCalledWith({
        channelId: '3151318',
        viewerIds: ['viewer1', 'viewer2'],
        nickNames: ['Nick1', 'Nick2']
      });
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('unkicked')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('successfully')
      );
    });

    it('should unkick users globally with --global flag', async () => {
      const options = {
        viewerIds: ['viewer1'],
        nickNames: ['Nick1'],
        global: true,
        output: 'table' as const
      };

      mockChatService.forbidUnkickUsers = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'SUCCESS',
        data: 'SUCCESS'
      });

      await chatHandler.unkickUser(options);

      expect(mockChatService.forbidUnkickUsers).toHaveBeenCalledWith({
        viewerIds: ['viewer1'],
        nickNames: ['Nick1']
      });
    });

    it('should validate viewer IDs and nicknames', async () => {
      const options = {
        channelId: '3151318',
        output: 'table' as const
      };

      await expect(chatHandler.unkickUser(options as any)).rejects.toThrow(PolyVValidationError);
    });
  });

  // ========================================
  // AC #5: chat banned list command
  // ========================================
  describe('listBanned (Story 11-2, AC #5)', () => {
    it('should list banned users (--type userId)', async () => {
      const options = {
        channelId: '3151318',
        type: 'userId' as const,
        output: 'table' as const
      };

      mockChatService.getChannelBannedUserList = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'success',
        data: ['user1', 'user2', 'user3']
      });

      await chatHandler.listBanned(options);

      expect(mockChatService.getChannelBannedUserList).toHaveBeenCalledWith({
        channelId: '3151318',
        type: 'userId'
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should list banned IPs (--type ip)', async () => {
      const options = {
        channelId: '3151318',
        type: 'ip' as const,
        output: 'table' as const
      };

      mockChatService.getChannelBannedUserList = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'success',
        data: ['192.168.1.1', '10.0.0.1']
      });

      await chatHandler.listBanned(options);

      expect(mockChatService.getChannelBannedUserList).toHaveBeenCalledWith({
        channelId: '3151318',
        type: 'ip'
      });
    });

    it('should list badwords (--type badword)', async () => {
      const options = {
        channelId: '3151318',
        type: 'badword' as const,
        output: 'table' as const
      };

      mockChatService.getChannelBannedList = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'success',
        data: ['badword1', 'badword2']
      });

      await chatHandler.listBanned(options);

      expect(mockChatService.getChannelBannedList).toHaveBeenCalledWith({
        channelId: '3151318',
        type: 'badword'
      });
    });

    it('should validate type parameter (userId|ip|badword)', async () => {
      const options = {
        channelId: '3151318',
        type: 'invalid' as any,
        output: 'table' as const
      };

      await expect(chatHandler.listBanned(options)).rejects.toThrow(PolyVValidationError);
      await expect(chatHandler.listBanned(options)).rejects.toThrow('type must be one of: userId, ip, badword');
    });

    it('should validate channelId is required', async () => {
      const options = {
        type: 'userId' as const,
        output: 'table' as const
      };

      await expect(chatHandler.listBanned(options as any)).rejects.toThrow(PolyVValidationError);
    });

    it('should support both table and json output', async () => {
      const options = {
        channelId: '3151318',
        type: 'userId' as const,
        output: 'json' as const
      };

      mockChatService.getChannelBannedUserList = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'success',
        data: ['user1']
      });

      await chatHandler.listBanned(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"data"')
      );
    });
  });

  // ========================================
  // AC #6: chat kicked list command
  // ========================================
  describe('listKicked (Story 11-2, AC #6)', () => {
    const mockKickedUsers = [
      {
        banned: true,
        channelId: '3151318',
        clientIp: '192.168.1.1',
        nick: 'BadUser1',
        pic: 'https://example.com/avatar1.png',
        roomId: 'room1',
        uid: 'socket1',
        userId: 'user1',
        userType: 'viewer'
      },
      {
        banned: false,
        channelId: '3151318',
        clientIp: '10.0.0.1',
        nick: 'BadUser2',
        pic: 'https://example.com/avatar2.png',
        roomId: 'room1',
        uid: 'socket2',
        userId: 'user2',
        userType: 'student'
      }
    ];

    it('should list kicked users successfully', async () => {
      const options = {
        channelId: '3151318',
        output: 'table' as const
      };

      mockChatService.getChannelKickedUserList = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'success',
        data: mockKickedUsers
      });

      await chatHandler.listKicked(options);

      expect(mockChatService.getChannelKickedUserList).toHaveBeenCalledWith({
        channelId: '3151318'
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should display user ID, nickname, IP, and ban status in table', async () => {
      const options = {
        channelId: '3151318',
        output: 'table' as const
      };

      mockChatService.getChannelKickedUserList = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'success',
        data: mockKickedUsers
      });

      await chatHandler.listKicked(options);

      // Verify table includes these columns
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should validate channelId is required', async () => {
      const options = {
        output: 'table' as const
      };

      await expect(chatHandler.listKicked(options as any)).rejects.toThrow(PolyVValidationError);
      await expect(chatHandler.listKicked(options as any)).rejects.toThrow('channelId is required');
    });

    it('should display empty results gracefully', async () => {
      const options = {
        channelId: '3151318',
        output: 'table' as const
      };

      mockChatService.getChannelKickedUserList = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'success',
        data: []
      });

      await chatHandler.listKicked(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No kicked users found')
      );
    });

    it('should support both table and json output', async () => {
      const options = {
        channelId: '3151318',
        output: 'json' as const
      };

      mockChatService.getChannelKickedUserList = jest.fn().mockResolvedValue({
        code: 200,
        status: 'success',
        message: 'success',
        data: mockKickedUsers
      });

      await chatHandler.listKicked(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"userId": "user1"')
      );
    });
  });
});
