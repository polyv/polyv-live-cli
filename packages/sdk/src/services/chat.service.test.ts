import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import axios from 'axios';
import { createHash, createCipheriv } from 'crypto';
import { ChatService } from './chat.service.js';
import { PolyVClient } from '../client.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';

// getUserList calls the apichat endpoint via a plain axios.get (bypassing the
// SDK httpClient), so the axios module must be mocked for that path.
vi.mock('axios');

/**
 * Reproduce the apichat userlistExternal signing algorithm so the test can
 * build a matching ciphertext/sign pair to feed the mocked axios call.
 * Must stay in sync with chat.service.ts buildChatUserListSign.
 */
function buildChatUserListSign(params: Record<string, string>): string {
  let content = 'polyvChatSignForExternal';
  for (const key of Object.keys(params).sort()) {
    content += key + params[key];
  }
  content += 'polyvChatSignForExternal';
  return createHash('md5').update(content, 'utf8').digest('hex').toUpperCase();
}

function encryptChatUserList(json: string, sign: string): string {
  const key = Buffer.from(sign.slice(0, 16), 'utf8');
  const cipher = createCipheriv('aes-128-cbc', key, key);
  const b64 = Buffer.from(json, 'utf8').toString('base64');
  return Buffer.concat([cipher.update(b64, 'utf8'), cipher.final()]).toString('hex');
}

describe('ChatService', () => {
  let service: ChatService;
  let mockClient: { httpClient: { get: Mock; post: Mock }; config: { appId: string; appSecret: string } };

  beforeEach(() => {
    mockClient = {
      httpClient: {
        get: vi.fn(),
        post: vi.fn(),
      },
      config: { appId: 'test-app-id', appSecret: 'test-secret' },
    };
    service = new ChatService(mockClient as unknown as PolyVClient);
  });

  // ============================================
  // AC 2: getHistoryPage - Query chat history
  // ============================================
  describe('getHistoryPage', () => {
    it('should get chat history successfully', async () => {
      const mockResponse = {
        contents: [{ id: '1', content: 'Hello' }],
        totalPage: 1,
        pageSize: 20,
        totalRow: 1,
        currentPage: 1,
      };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getHistoryPage({
        channelId: '123456',
        startDay: '2024-01-01',
        endDay: '2024-01-31',
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/chat/get-history-page',
        { params: { channelId: '123456', startDay: '2024-01-01', endDay: '2024-01-31' } }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // AC 3: sendAdminMsg - Send admin message
  // ============================================
  describe('sendAdminMsg', () => {
    it('should send admin message successfully', async () => {
      const mockResponse = { msgId: 'msg123' };
      mockClient.httpClient.post.mockResolvedValue(mockResponse);

      const result = await service.sendAdminMsg({
        channelId: '123456',
        msg: 'Hello World',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/chat/send-admin-msg',
        null,
        { params: { channelId: '123456', msg: 'Hello World' } }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // AC 4: sendChat - Send hidden chat message
  // ============================================
  describe('sendChat', () => {
    it('should send chat message successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue({ success: true });

      const result = await service.sendChat({
        channelId: '123456',
        userId: 'user123',
        content: 'Hello World',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v1/channelSetting/123456/send-chat',
        null,
        {
          params: {
            userId: 'user123',
            content: Buffer.from('Hello World', 'utf8').toString('base64url'),
            imgUrl: undefined,
          },
        }
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ============================================
  // AC 5: sendHiddenByAdmin - Send message as admin
  // ============================================
  describe('sendHiddenByAdmin', () => {
    it('should send hidden by admin successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue({ data: true });

      const result = await service.sendHiddenByAdmin({
        channelId: '123456',
        content: 'Admin message',
        role: 'ADMIN',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/chat/send',
        null,
        { params: { channelId: '123456', content: 'Admin message', role: 'ADMIN' } }
      );
      expect(result).toEqual({ data: true });
    });
  });

  describe('countOnlineUser', () => {
    it('should count online users successfully', async () => {
      mockClient.httpClient.get.mockResolvedValue(3);

      const result = await service.countOnlineUser({ channelId: '123456' });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/chat/count-online-user',
        { params: { channelId: '123456' } }
      );
      expect(result).toBe(3);
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.countOnlineUser({ channelId: '' }))
        .rejects.toThrow('channelId is required');
    });
  });

  // ============================================
  // AC 6: delChat - Delete a chat message
  // ============================================
  describe('delChat', () => {
    it('should delete chat successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue({ data: 'success' });

      const result = await service.delChat({
        channelId: '123456',
        id: 'msg-uuid',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/chat/123456/delChat',
        null,
        { params: { id: 'msg-uuid' } }
      );
      expect(result).toEqual({ data: 'success' });
    });

    it('should throw validation error for missing id', async () => {
      await expect(service.delChat({
        channelId: '123456',
        id: '',
      })).rejects.toThrow('id is required');
    });
  });

  // ============================================
  // AC 7: cleanChat - Clear all chat messages
  // ============================================
  describe('cleanChat', () => {
    it('should clean chat successfully', async () => {
      mockClient.httpClient.get.mockResolvedValue({ data: true });

      const result = await service.cleanChat({
        channelId: '123456',
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v2/chat/123456/cleanChat'
      );
      expect(result).toEqual({ data: true });
    });
  });

  // ============================================
  // AC 8: messageAudit - Audit chat messages
  // ============================================
  describe('messageAudit', () => {
    it('should audit messages successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue({ data: true });

      const result = await service.messageAudit({
        channelId: '123456',
        messages: [
          { msgId: 'msg1', viewerId: 'viewer1', nickName: 'User', content: 'Hello' },
        ],
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/chat/message/audit',
        [{ msgId: 'msg1', viewerId: 'viewer1', nickName: 'User', content: 'Hello' }],
        { params: { channelId: '123456' } }
      );
      expect(result).toEqual({ data: true });
    });
  });

  // ============================================
  // AC 9: alertToSpecial - Send popup alert
  // ============================================
  describe('alertToSpecial', () => {
    it('should send alert to special successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue({ data: true });

      const result = await service.alertToSpecial({
        channelId: '123456',
        message: 'Warning message',
        title: 'Warning',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/chat/alert-to-special',
        null,
        { params: { channelId: '123456', message: 'Warning message', title: 'Warning' } }
      );
      expect(result).toEqual({ data: true });
    });
  });

  // ============================================
  // AC 10: getSpeakList - Get speak list
  // ============================================
  describe('getSpeakList', () => {
    it('should get speak list successfully', async () => {
      const mockResponse = {
        list: [{ id: '1', content: 'Hello' }],
        startRowId: '1',
      };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getSpeakList({
        startTime: 1631000000000,
        endTime: 1631003600000,
        size: 10,
      });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/user/chat/get-speak-list',
        { params: { startTime: 1631000000000, endTime: 1631003600000, size: 10 } }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // Censor and role management APIs
  // ============================================
  describe('updateCensorEnabled', () => {
    it('should update censor enabled successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue({ data: true });

      const result = await service.updateCensorEnabled({
        channelId: '123456',
        enabled: 'Y',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/chat/update-censor-enabled',
        null,
        { params: { channelId: '123456', enabled: 'Y' } }
      );
      expect(result).toEqual({ data: true });
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.updateCensorEnabled({
        channelId: '',
        enabled: 'Y',
      })).rejects.toThrow('channelId is required');
    });
  });

  describe('getAdminInfo', () => {
    it('should get admin info successfully', async () => {
      const mockResponse = {
        nickname: 'Admin',
        actor: 'Admin',
        avatar: 'https://example.com/avatar.png',
      };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getAdminInfo('123456');

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v2/channelSetting/123456/get-chat-admin'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for empty channelId', async () => {
      await expect(service.getAdminInfo(''))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('getTeacherInfo', () => {
    it('should get teacher info successfully', async () => {
      const mockResponse = {
        nickname: 'Teacher',
        actor: 'Teacher',
        avatar: 'https://example.com/avatar.png',
      };
      mockClient.httpClient.get.mockResolvedValue(mockResponse);

      const result = await service.getTeacherInfo({ channelId: '123456' });

      expect(mockClient.httpClient.get).toHaveBeenCalledWith(
        '/live/v3/channel/account/getTeacher',
        { params: { channelId: '123456' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.getTeacherInfo({ channelId: '' }))
        .rejects.toThrow('channelId is required');
    });
  });

  describe('getUserList', () => {
    it('should sign, fetch, and decrypt the apichat userlist', async () => {
      const expected = {
        count: 2,
        userlist: [
          { userId: 'user1', nick: 'User 1' },
          { userId: 'user2', nick: 'User 2' },
        ],
      };
      // Build the sign + ciphertext matching the params the service will send.
      const query: Record<string, string> = {
        roomId: '123456',
        page: '1',
        len: '100',
        hide: '0',
        toGetSubRooms: 'false',
      };
      const sign = buildChatUserListSign(query);
      const ciphertext = encryptChatUserList(JSON.stringify(expected), sign);

      vi.mocked(axios.get).mockResolvedValueOnce({ data: ciphertext } as never);

      const result = await service.getUserList({
        roomId: '123456',
        page: 1,
        len: 100,
      });

      expect(axios.get).toHaveBeenCalledWith(
        'https://apichat.polyv.net/front/userlistExternal',
        {
          params: { ...query, sign },
          responseType: 'text',
          transformResponse: [expect.any(Function)],
        }
      );
      expect(result).toEqual(expected);
    });

    it('should return an empty list when the endpoint returns an empty body', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({ data: '' } as never);

      const result = await service.getUserList({ roomId: '123456' });

      expect(result).toEqual({ count: 0, userlist: [] });
    });

    it('should throw validation error for missing roomId', async () => {
      await expect(service.getUserList({
        roomId: '',
        page: 1,
        len: 100,
      })).rejects.toThrow('roomId is required');
    });

    it('should throw validation error when len exceeds 1000', async () => {
      await expect(service.getUserList({
        roomId: '123456',
        len: 1001,
      })).rejects.toThrow('len must be between 1 and 1000');
    });
  });

  describe('updateAdminInfo', () => {
    it('should upload the avatar as a signed multipart body with X-Skip-Auth', async () => {
      mockClient.httpClient.post.mockResolvedValue({ data: '修改成功' });
      const avatar = new Blob(['png-bytes'], { type: 'image/png' });

      const result = await service.updateAdminInfo({
        channelId: '123456',
        nickname: 'Admin',
        actor: 'Admin1',
        avatar,
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledTimes(1);
      const [url, formData, config] = mockClient.httpClient.post.mock.calls[0];
      expect(url).toBe('/live/v2/channelSetting/123456/set-chat-admin');
      // Auth is handled manually for FormData (default signature interceptor skipped).
      expect(config.headers['X-Skip-Auth']).toBe('true');
      expect(config.headers['Content-Type']).toBe('multipart/form-data');
      // appId, timestamp, nickname and actor participate in the signature; the
      // avatar file is submitted as a binary stream and is not signed.
      expect(formData.get('appId')).toBe('test-app-id');
      expect(formData.get('timestamp')).toBeTruthy();
      expect(formData.get('sign')).toBeTruthy();
      expect(formData.get('nickname')).toBe('Admin');
      expect(formData.get('actor')).toBe('Admin1');
      const uploadedAvatar = formData.get('avatar');
      expect(uploadedAvatar).toBeInstanceOf(Blob);
      // A nameless Blob falls back to the default avatar.png filename.
      expect((uploadedAvatar as File).name).toBe('avatar.png');
      expect(result).toEqual({ data: '修改成功' });
    });

    it('should preserve the filename when the avatar is a File', async () => {
      mockClient.httpClient.post.mockResolvedValue({ data: '修改成功' });
      const avatar = new File(['png-bytes'], 'face.jpeg', { type: 'image/jpeg' });

      await service.updateAdminInfo({
        channelId: '123456',
        nickname: 'Admin',
        actor: 'Admin1',
        avatar,
      });

      const [, formData] = mockClient.httpClient.post.mock.calls[0];
      expect((formData.get('avatar') as File).name).toBe('face.jpeg');
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.updateAdminInfo({
        channelId: '',
        nickname: 'Admin',
        actor: 'Admin1',
        avatar: new Blob(['x']),
      })).rejects.toThrow('channelId is required');
    });

    it('should throw validation error for missing nickname', async () => {
      await expect(service.updateAdminInfo({
        channelId: '123456',
        nickname: '',
        actor: 'Admin1',
        avatar: new Blob(['x']),
      })).rejects.toThrow('nickname is required');
    });

    it('should throw validation error for missing actor', async () => {
      await expect(service.updateAdminInfo({
        channelId: '123456',
        nickname: 'Admin',
        actor: '',
        avatar: new Blob(['x']),
      })).rejects.toThrow('actor is required');
    });

    it('should throw validation error for missing avatar', async () => {
      await expect(service.updateAdminInfo({
        channelId: '123456',
        nickname: 'Admin',
        actor: 'Admin1',
        avatar: undefined as unknown as Blob,
      })).rejects.toThrow('avatar is required');
    });
  });

  describe('updateTeacherInfo', () => {
    it('should update teacher info successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue({ data: true });

      const result = await service.updateTeacherInfo({
        channelId: '123456',
        nickname: 'Teacher',
        actor: 'Teacher1',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/channel/account/updateTeacher',
        null,
        { params: { channelId: '123456', nickname: 'Teacher', actor: 'Teacher1' } }
      );
      expect(result).toEqual({ data: true });
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.updateTeacherInfo({
        channelId: '',
        nickname: 'Teacher',
        actor: 'Teacher1',
      })).rejects.toThrow('channelId is required');
    });
  });

  // ============================================
  // Banned/Chat Management APIs
  // ============================================
  describe('addBadwords', () => {
    it('should add badwords successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue({ data: { count: 2 } });

      const result = await service.addBadwords({
        userId: 'user123',
        words: ['word1', 'word2'],
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/chat/user123/addBadWords',
        null,
        { params: { words: JSON.stringify(['word1', 'word2']), channelId: undefined } }
      );
      expect(result).toEqual({ data: { count: 2 } });
    });

    it('should throw validation error for missing userId', async () => {
      await expect(service.addBadwords({
        userId: '',
        words: ['word1'],
      })).rejects.toThrow('userId is required');
    });

    it('should throw validation error for missing words', async () => {
      await expect(service.addBadwords({
        userId: 'user123',
        words: [],
      })).rejects.toThrow('words is required and cannot be empty');
    });
  });

  describe('addBannedIp', () => {
    it('should add banned IP successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue({ data: ['59.41.20.74'] });

      const result = await service.addBannedIp({
        channelId: '123456',
        ip: '59.41.20.74',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/chat/123456/addBannedIP',
        null,
        { params: { ip: '59.41.20.74' } }
      );
      expect(result).toEqual({ data: ['59.41.20.74'] });
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.addBannedIp({
        channelId: '',
        ip: '59.41.20.74',
      })).rejects.toThrow('channelId is required');
    });

    it('should throw validation error for missing ip', async () => {
      await expect(service.addBannedIp({
        channelId: '123456',
        ip: '',
      })).rejects.toThrow('ip is required');
    });
  });

  describe('deleteChannelBanned', () => {
    it('should delete channel banned successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue({ data: true });

      const result = await service.deleteChannelBanned({
        channelId: '123456',
        type: 'ip',
        content: '59.41.20.74',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v2/chat/123456/delBanned',
        null,
        { params: { channelId: '123456', type: 'ip', content: '59.41.20.74' } }
      );
      expect(result).toEqual({ data: true });
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.deleteChannelBanned({
        channelId: '',
        type: 'ip',
        content: '59.41.20.74',
      })).rejects.toThrow('channelId is required');
    });

    it('should throw validation error for missing type', async () => {
      await expect(service.deleteChannelBanned({
        channelId: '123456',
        type: '' as 'ip',
        content: '59.41.20.74',
      })).rejects.toThrow('type is required');
    });

    it('should throw validation error for missing content', async () => {
      await expect(service.deleteChannelBanned({
        channelId: '123456',
        type: 'ip',
        content: '',
      })).rejects.toThrow('content is required');
    });
  });

  describe('deleteUserBadword', () => {
    it('should delete user badword successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue({ data: [] });

      const result = await service.deleteUserBadword({
        words: 'word1,word2',
      });

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v3/user/badword/delete',
        null,
        { params: { words: 'word1,word2' } }
      );
      expect(result).toEqual({ data: [] });
    });

    it('should throw validation error for missing words', async () => {
      await expect(service.deleteUserBadword({
        words: '',
      })).rejects.toThrow('words is required');
    });
  });

  describe('forbidChannelKickUsers', () => {
    it('should kick users successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue({ data: true });

      const result = await service.forbidChannelKickUsers(
        { channelId: '123456' },
        { viewerIds: ['user1', 'user2'], nickNames: ['User 1', 'User 2'] }
      );

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/chat/channel/forbid/kick-users',
        { viewerIds: ['user1', 'user2'], nickNames: ['User 1', 'User 2'] },
        { params: { channelId: '123456' } }
      );
      expect(result).toEqual({ data: true });
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.forbidChannelKickUsers(
        { channelId: '' },
        { viewerIds: ['user1'], nickNames: ['User 1'] }
      )).rejects.toThrow('channelId is required');
    });

    it('should throw validation error for empty viewerIds', async () => {
      await expect(service.forbidChannelKickUsers(
        { channelId: '123456' },
        { viewerIds: [], nickNames: ['User 1'] }
      )).rejects.toThrow('viewerIds is required and cannot be empty');
    });

    it('should throw validation error for empty nickNames', async () => {
      await expect(service.forbidChannelKickUsers(
        { channelId: '123456' },
        { viewerIds: ['user1'], nickNames: [] }
      )).rejects.toThrow('nickNames is required and cannot be empty');
    });
  });

  describe('forbidChannelUnkickUsers', () => {
    it('should unkick users successfully', async () => {
      mockClient.httpClient.post.mockResolvedValue({ data: true });

      const result = await service.forbidChannelUnkickUsers(
        { channelId: '123456' },
        { viewerIds: ['user1', 'user2'], nickNames: ['User 1', 'User 2'] }
      );

      expect(mockClient.httpClient.post).toHaveBeenCalledWith(
        '/live/v4/chat/channel/forbid/unkick-users',
        { viewerIds: ['user1', 'user2'], nickNames: ['User 1', 'User 2'] },
        { params: { channelId: '123456' } }
      );
      expect(result).toEqual({ data: true });
    });

    it('should throw validation error for missing channelId', async () => {
      await expect(service.forbidChannelUnkickUsers(
        { channelId: '' },
        { viewerIds: ['user1'], nickNames: ['User 1'] }
      )).rejects.toThrow('channelId is required');
    });

    it('should throw validation error for empty viewerIds', async () => {
      await expect(service.forbidChannelUnkickUsers(
        { channelId: '123456' },
        { viewerIds: [], nickNames: ['User 1'] }
      )).rejects.toThrow('viewerIds is required and cannot be empty');
    });

    it('should throw validation error for empty nickNames', async () => {
      await expect(service.forbidChannelUnkickUsers(
        { channelId: '123456' },
        { viewerIds: ['user1'], nickNames: [] }
      )).rejects.toThrow('nickNames is required and cannot be empty');
    });
  });
});
