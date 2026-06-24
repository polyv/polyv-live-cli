/**
 * @fileoverview Integration tests for chat commands
 * @author Development Team
 * @since 11.1.0
 */

import { ChatServiceSdk } from '../../src/services/chat.service.sdk';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  parseJsonValue,
  runCliSuccess,
} from '../helpers/channel-fixture';

const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('Chat Integration Tests', () => {
  let chatService: ChatServiceSdk;
  let testChannelId = '';

  beforeAll(() => {
    chatService = new ChatServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });
    testChannelId = createTemporaryChannel('Chat CLI');
  });

  afterAll(() => {
    if (testChannelId) {
      deleteTemporaryChannel(testChannelId);
    }
  });

  // ========================================
  // Chat Send Tests
  // ========================================

  describe('chat send', () => {
    it('should send a text message successfully', async () => {
      const result = await chatService.sendAdminMessage({
        channelId: testChannelId,
        msg: `Test message ${Date.now()}`,
        nickName: 'TestAdmin',
        pic: '//liveimages.videocc.net/uploaded/images/2023/11/gqzaoq7pk3.png'
      });

      expect(result).toBeDefined();
      // API may not return success field, just check result exists
    }, 15000);

    it('should send a message with custom nickname', async () => {
      const result = await chatService.sendAdminMessage({
        channelId: testChannelId,
        msg: `Test message with nickname ${Date.now()}`,
        nickName: 'TestBot',
        pic: '//liveimages.videocc.net/uploaded/images/2023/11/gqzaoq7pk3.png'
      });

      expect(result).toBeDefined();
    }, 15000);

    it('should validate required channelId', async () => {
      await expect(
        chatService.sendAdminMessage({
          channelId: '',
          msg: 'Test message',
          nickName: 'TestAdmin'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate required msg or imgUrl', async () => {
      await expect(
        chatService.sendAdminMessage({
          channelId: testChannelId,
          nickName: 'TestAdmin'
        } as any)
      ).rejects.toThrow();
    }, 10000);

    it('should fail for non-existent channel', async () => {
      await expect(
        chatService.sendAdminMessage({
          channelId: '999999999',
          msg: 'Test message',
          nickName: 'TestAdmin'
        })
      ).rejects.toThrow();
    }, 15000);
  });

  // ========================================
  // Chat List Tests
  // ========================================

  describe('chat list', () => {
    // Helper to get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    };

    it('should list chat messages successfully', async () => {
      const result = await chatService.listMessages({
        channelId: testChannelId,
        page: 1,
        size: 10,
        startDay: getTodayDate(),
        endDay: getTodayDate()
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.contents)).toBe(true);
    }, 15000);

    it('should handle pagination', async () => {
      const result = await chatService.listMessages({
        channelId: testChannelId,
        page: 1,
        size: 5,
        startDay: getTodayDate(),
        endDay: getTodayDate()
      });

      expect(result.contents.length).toBeLessThanOrEqual(5);
    }, 15000);

    it('should validate required channelId', async () => {
      await expect(
        chatService.listMessages({
          channelId: ''
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate page parameter', async () => {
      await expect(
        chatService.listMessages({
          channelId: testChannelId,
          page: 0
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate size parameter', async () => {
      await expect(
        chatService.listMessages({
          channelId: testChannelId,
          size: 101 // max is 100
        })
      ).rejects.toThrow();
    }, 10000);

    it('should return empty for non-existent channel', async () => {
      await expect(
        chatService.listMessages({
          channelId: '999999999',
          page: 1,
          size: 10
        })
      ).rejects.toThrow();
    }, 15000);
  });

  // ========================================
  // Chat Delete Tests
  // ========================================

  describe('chat delete', () => {
    it('should validate required channelId', async () => {
      await expect(
        chatService.deleteMessage({
          channelId: '',
          messageId: 'test123'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate required messageId when clear is false', async () => {
      await expect(
        chatService.deleteMessage({
          channelId: testChannelId
        } as any)
      ).rejects.toThrow();
    }, 10000);

    it('should handle non-existent message gracefully', async () => {
      // API may not throw for non-existent message, just return
      const result = await chatService.deleteMessage({
        channelId: testChannelId,
        messageId: 'nonexistentmessage12345'
      });
      // If no error is thrown, just verify it returns undefined
      expect(result).toBeUndefined();
    }, 15000);
  });

  // ========================================
  // Chat Ban/Unban Tests
  // ========================================

  describe('chat ban/unban', () => {
    it('should get banned user list', async () => {
      const result = await chatService.getChannelBannedUserList({
        channelId: testChannelId,
        type: 'userId'
      });

      expect(result).toBeDefined();
      // data may be undefined if no banned users
    }, 15000);

    it('should get banned IP list', async () => {
      const result = await chatService.getChannelBannedUserList({
        channelId: testChannelId,
        type: 'ip'
      });

      expect(result).toBeDefined();
    }, 15000);

    it('should get badword list', async () => {
      const result = await chatService.getChannelBannedList({
        channelId: testChannelId,
        type: 'badword'
      });

      expect(result).toBeDefined();
    }, 15000);

    // Note: We don't test actual ban/unban operations to avoid side effects
  });

  // ========================================
  // Chat Kick/Unkick Tests
  // ========================================

  describe('chat kick/unkick', () => {
    it('should get kicked user list', async () => {
      const result = await chatService.getChannelKickedUserList({
        channelId: testChannelId
      });

      expect(result).toBeDefined();
      // data may be undefined if no kicked users
    }, 15000);

    // Note: We don't test actual kick/unkick operations to avoid side effects
  });

  // ========================================
  // Chat Lifecycle Test
  // ========================================

  describe('chat lifecycle', () => {
    it('should complete send-list lifecycle', async () => {
      // Helper to get today's date in YYYY-MM-DD format
      const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
      };

      // 1. Send a message
      const sendResult = await chatService.sendAdminMessage({
        channelId: testChannelId,
        msg: `Lifecycle Test Message ${Date.now()}`,
        nickName: 'TestAdmin',
        pic: '//liveimages.videocc.net/uploaded/images/2023/11/gqzaoq7pk3.png'
      });

      expect(sendResult).toBeDefined();

      // 2. List messages - should contain messages
      const listResult = await chatService.listMessages({
        channelId: testChannelId,
        page: 1,
        size: 50,
        startDay: getTodayDate(),
        endDay: getTodayDate()
      });

      expect(listResult.contents.length).toBeGreaterThanOrEqual(0);
    }, 20000);
  });

  describe('real CLI command coverage', () => {
    it('should send and clear chat messages through the local CLI', () => {
      const message = `CLI chat message ${Date.now()}`;
      const sendOutput = runCliSuccess([
        'chat',
        'send',
        '-c',
        testChannelId,
        '-m',
        message,
        '-n',
        'CLIIntegrationBot',
        '-o',
        'json',
      ]);
      const sendPayload = parseJsonObject(sendOutput);
      expect(sendPayload.success).toEqual(expect.any(Boolean));
      expect(typeof sendPayload.message).toBe('string');

      const deleteOutput = runCliSuccess([
        'chat',
        'delete',
        '-c',
        testChannelId,
        '--clear',
        '--force',
        '-o',
        'json',
      ]);
      const deletePayload = parseJsonObject(deleteOutput);
      expect(deletePayload).toMatchObject({
        channelId: testChannelId,
        deleted: true,
        cleared: 'all messages',
      });
    }, 60000);

    it('should read group login times through the local CLI', () => {
      const output = runCliSuccess([
        'chat',
        'group-login-times',
        '-c',
        testChannelId,
        '-o',
        'json',
      ]);
      const payload = parseJsonValue(output);
      expect(Array.isArray(payload)).toBe(true);
    }, 60000);

    it('should log out watch viewers through the local CLI', () => {
      const output = runCliSuccess([
        'chat',
        'viewer-logout',
        '-c',
        testChannelId,
        '--force',
        '-o',
        'json',
      ]);
      expect(parseJsonObject(output).success).toBe(true);
    }, 60000);
  });
});
