/**
 * @fileoverview Unit tests for Chat commands - Command Execution
 * @author Development Team
 * @since 11.1.0
 */

import { Command } from 'commander';
import { registerChatCommands } from './chat.commands';
import { ChatHandler } from '../handlers/chat.handler';

// Mock the ChatHandler class
jest.mock('../handlers/chat.handler');

// Mock auth and config modules
jest.mock('../config/auth-adapter', () => ({
  authAdapter: {
    tryGetAuthConfig: jest.fn().mockReturnValue({
      config: {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
      },
      source: 'test',
      accountName: 'test-account',
    }),
    getStatusMessage: jest.fn().mockReturnValue('Authentication required'),
    getDiagnostics: jest.fn().mockReturnValue({
      availableSources: [],
      errors: [],
    }),
  },
}));

jest.mock('../config/manager', () => ({
  configManager: {
    load: jest.fn().mockResolvedValue({
      config: {
        baseUrl: 'https://api.polyv.net',
        timeout: 30000,
        debug: false,
      },
    }),
  },
}));

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
  throw new Error(`process.exit:${code}`);
});

// Suppress console output during tests
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('Chat Commands - Command Execution', () => {
  let program: Command;
  let mockChatHandler: jest.Mocked<ChatHandler>;

  beforeEach(() => {
    jest.clearAllMocks();

    program = new Command();
    program.exitOverride();

    // Create mock instance
    mockChatHandler = {
      sendAdminMessage: jest.fn(),
      listMessages: jest.fn(),
      deleteMessage: jest.fn(),
      banUser: jest.fn(),
      unbanUser: jest.fn(),
      kickUser: jest.fn(),
      unkickUser: jest.fn(),
      listBanned: jest.fn(),
      listKicked: jest.fn()
    } as any;

    (ChatHandler as jest.Mock).mockImplementation(() => mockChatHandler);

    registerChatCommands(program);
  });

  afterAll(() => {
    mockExit.mockRestore();
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  // ========================================
  // AC #1: chat send command execution
  // ========================================

  describe('chat send command execution', () => {
    it('[P0] should execute send command with required options', async () => {
      const mockResult = { success: true, message: 'Message sent' };
      mockChatHandler.sendAdminMessage.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'send',
        '--channel-id', '12345678',
        '--msg', 'Hello World'
      ]);

      expect(mockChatHandler.sendAdminMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '12345678',
          msg: 'Hello World'
        })
      );
    });

    it('[P0] should execute send command with all options', async () => {
      mockChatHandler.sendAdminMessage.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'send',
        '--channel-id', '12345678',
        '--msg', 'Test message',
        '--img-url', 'https://example.com/image.jpg',
        '--nickname', 'Admin',
        '--output', 'json'
      ]);

      expect(mockChatHandler.sendAdminMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '12345678',
          msg: 'Test message',
          output: 'json'
        })
      );
    });

    it('[P1] should handle send command error', async () => {
      mockChatHandler.sendAdminMessage.mockRejectedValue(new Error('Failed to send'));

      await expect(
        program.parseAsync(['node', 'test', 'chat', 'send',
          '--channel-id', '12345678',
          '--msg', 'Test'
        ], { from: 'user' })
      ).rejects.toThrow();
    });
  });

  // ========================================
  // AC #2: chat list command execution
  // ========================================

  describe('chat list command execution', () => {
    it('[P0] should execute list command', async () => {
      const mockResult = { success: true, data: { contents: [], total: 0 } };
      mockChatHandler.listMessages.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'list',
        '--channel-id', '12345678'
      ]);

      expect(mockChatHandler.listMessages).toHaveBeenCalled();
    });

    it('[P0] should execute list command with pagination', async () => {
      mockChatHandler.listMessages.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'list',
        '--channel-id', '12345678',
        '--page', '2',
        '--size', '50',
        '--output', 'json'
      ]);

      expect(mockChatHandler.listMessages).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          size: 50,
          output: 'json'
        })
      );
    });

    it('[P1] should handle list command error', async () => {
      mockChatHandler.listMessages.mockRejectedValue(new Error('Failed to list'));

      await expect(
        program.parseAsync(['node', 'test', 'chat', 'list',
          '--channel-id', '12345678'
        ], { from: 'user' })
      ).rejects.toThrow();
    });
  });

  // ========================================
  // AC #3: chat delete command execution
  // ========================================

  describe('chat delete command execution', () => {
    it('[P0] should execute delete command with message-id', async () => {
      mockChatHandler.deleteMessage.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'delete',
        '--channel-id', '12345678',
        '--message-id', 'msg123'
      ]);

      expect(mockChatHandler.deleteMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '12345678',
          messageId: 'msg123'
        })
      );
    });

    it('[P0] should execute delete command with clear flag', async () => {
      mockChatHandler.deleteMessage.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'delete',
        '--channel-id', '12345678',
        '--clear'
      ]);

      expect(mockChatHandler.deleteMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '12345678',
          clear: true
        })
      );
    });

    it('[P1] should handle delete command error', async () => {
      mockChatHandler.deleteMessage.mockRejectedValue(new Error('Failed to delete'));

      await expect(
        program.parseAsync(['node', 'test', 'chat', 'delete',
          '--channel-id', '12345678',
          '--message-id', 'msg123'
        ], { from: 'user' })
      ).rejects.toThrow();
    });
  });

  // ========================================
  // AC #4: chat ban command execution
  // ========================================

  describe('chat ban command execution', () => {
    it('[P0] should execute ban command for channel', async () => {
      mockChatHandler.banUser.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'ban',
        '--channel-id', '12345678',
        '--user-ids', 'user1,user2'
      ]);

      expect(mockChatHandler.banUser).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '12345678',
          userIds: ['user1', 'user2']
        })
      );
    });

    it('[P0] should execute ban command globally', async () => {
      mockChatHandler.banUser.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'ban',
        '--channel-id', '12345678',
        '--user-ids', 'user1,user2',
        '--global'
      ]);

      expect(mockChatHandler.banUser).toHaveBeenCalledWith(
        expect.objectContaining({
          userIds: ['user1', 'user2'],
          global: true
        })
      );
    });

    it('[P1] should handle ban command error', async () => {
      mockChatHandler.banUser.mockRejectedValue(new Error('Failed to ban'));

      await expect(
        program.parseAsync(['node', 'test', 'chat', 'ban',
          '--channel-id', '12345678',
          '--user-ids', 'user1'
        ], { from: 'user' })
      ).rejects.toThrow();
    });
  });

  // ========================================
  // AC #5: chat unban command execution
  // ========================================

  describe('chat unban command execution', () => {
    it('[P0] should execute unban command', async () => {
      mockChatHandler.unbanUser.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'unban',
        '--channel-id', '12345678',
        '--user-ids', 'user1,user2'
      ]);

      expect(mockChatHandler.unbanUser).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '12345678',
          userIds: ['user1', 'user2']
        })
      );
    });

    it('[P0] should execute unban command globally', async () => {
      mockChatHandler.unbanUser.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'unban',
        '--channel-id', '12345678',
        '--user-ids', 'user1',
        '--global'
      ]);

      expect(mockChatHandler.unbanUser).toHaveBeenCalledWith(
        expect.objectContaining({
          userIds: ['user1'],
          global: true
        })
      );
    });

    it('[P1] should handle unban command error', async () => {
      mockChatHandler.unbanUser.mockRejectedValue(new Error('Failed to unban'));

      await expect(
        program.parseAsync(['node', 'test', 'chat', 'unban',
          '--channel-id', '12345678',
          '--user-ids', 'user1'
        ], { from: 'user' })
      ).rejects.toThrow();
    });
  });

  // ========================================
  // AC #6: chat kick command execution
  // ========================================

  describe('chat kick command execution', () => {
    it('[P0] should execute kick command with viewer-ids', async () => {
      mockChatHandler.kickUser.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'kick',
        '--channel-id', '12345678',
        '--viewer-ids', 'viewer1,viewer2'
      ]);

      expect(mockChatHandler.kickUser).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '12345678',
          viewerIds: ['viewer1', 'viewer2'],
          global: undefined
        })
      );
    });

    it('[P0] should execute kick command with nick-names', async () => {
      mockChatHandler.kickUser.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'kick',
        '--channel-id', '12345678',
        '--nick-names', 'Nick1,Nick2'
      ]);

      expect(mockChatHandler.kickUser).toHaveBeenCalledWith(
        expect.objectContaining({
          nickNames: ['Nick1', 'Nick2']
        })
      );
    });

    it('[P0] should execute kick command globally', async () => {
      mockChatHandler.kickUser.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'kick',
        '--channel-id', '12345678',
        '--viewer-ids', 'viewer1',
        '--global'
      ]);

      expect(mockChatHandler.kickUser).toHaveBeenCalledWith(
        expect.objectContaining({
          global: true
        })
      );
    });

    it('[P1] should handle kick command error', async () => {
      mockChatHandler.kickUser.mockRejectedValue(new Error('Failed to kick'));

      await expect(
        program.parseAsync(['node', 'test', 'chat', 'kick',
          '--channel-id', '12345678',
          '--viewer-ids', 'viewer1'
        ], { from: 'user' })
      ).rejects.toThrow();
    });
  });

  // ========================================
  // AC #7: chat unkick command execution
  // ========================================

  describe('chat unkick command execution', () => {
    it('[P0] should execute unkick command', async () => {
      mockChatHandler.unkickUser.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'unkick',
        '--channel-id', '12345678',
        '--viewer-ids', 'viewer1'
      ]);

      expect(mockChatHandler.unkickUser).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '12345678',
          viewerIds: ['viewer1']
        })
      );
    });

    it('[P1] should handle unkick command error', async () => {
      mockChatHandler.unkickUser.mockRejectedValue(new Error('Failed to unkick'));

      await expect(
        program.parseAsync(['node', 'test', 'chat', 'unkick',
          '--channel-id', '12345678',
          '--viewer-ids', 'viewer1'
        ], { from: 'user' })
      ).rejects.toThrow();
    });
  });

  // ========================================
  // AC #8: chat banned list command execution
  // ========================================

  describe('chat banned list command execution', () => {
    it('[P0] should execute banned list command for userId', async () => {
      mockChatHandler.listBanned.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'banned', 'list',
        '--channel-id', '12345678',
        '--type', 'userId'
      ]);

      expect(mockChatHandler.listBanned).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '12345678',
          type: 'userId'
        })
      );
    });

    it('[P0] should execute banned list command for ip', async () => {
      mockChatHandler.listBanned.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'banned', 'list',
        '--channel-id', '12345678',
        '--type', 'ip'
      ]);

      expect(mockChatHandler.listBanned).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ip'
        })
      );
    });

    it('[P0] should execute banned list command for badword', async () => {
      mockChatHandler.listBanned.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'banned', 'list',
        '--channel-id', '12345678',
        '--type', 'badword'
      ]);

      expect(mockChatHandler.listBanned).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'badword'
        })
      );
    });

    it('[P1] should handle banned list command error', async () => {
      mockChatHandler.listBanned.mockRejectedValue(new Error('Failed to list banned'));

      await expect(
        program.parseAsync(['node', 'test', 'chat', 'banned', 'list',
          '--channel-id', '12345678',
          '--type', 'userId'
        ], { from: 'user' })
      ).rejects.toThrow();
    });
  });

  // ========================================
  // AC #9: chat kicked list command execution
  // ========================================

  describe('chat kicked list command execution', () => {
    it('[P0] should execute kicked list command', async () => {
      mockChatHandler.listKicked.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'kicked', 'list',
        '--channel-id', '12345678'
      ]);

      expect(mockChatHandler.listKicked).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '12345678'
        })
      );
    });

    it('[P1] should handle kicked list command error', async () => {
      mockChatHandler.listKicked.mockRejectedValue(new Error('Failed to list kicked'));

      await expect(
        program.parseAsync(['node', 'test', 'chat', 'kicked', 'list',
          '--channel-id', '12345678'
        ], { from: 'user' })
      ).rejects.toThrow();
    });

    it('[P1] should output in json format', async () => {
      mockChatHandler.listKicked.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'kicked', 'list',
        '--channel-id', '12345678',
        '--output', 'json'
      ]);

      expect(mockChatHandler.listKicked).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'json'
        })
      );
    });
  });

  // ========================================
  // AC #10: output format validation
  // ========================================

  describe('output format handling', () => {
    it('[P2] should use table format by default', async () => {
      mockChatHandler.sendAdminMessage.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'send',
        '--channel-id', '12345678',
        '--msg', 'Test'
      ]);

      expect(mockChatHandler.sendAdminMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'table'
        })
      );
    });

    it('[P2] should accept json format', async () => {
      mockChatHandler.sendAdminMessage.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'chat', 'send',
        '--channel-id', '12345678',
        '--msg', 'Test',
        '--output', 'json'
      ]);

      expect(mockChatHandler.sendAdminMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'json'
        })
      );
    });
  });
});
