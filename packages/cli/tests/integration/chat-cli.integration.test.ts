import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  parseJsonValue,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { getAccountCredentials, hasRealCredentials } from '../helpers/integration-config';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const shouldRunRealChannelTests = hasRealCredentials();

// 1x1 transparent PNG used as a real avatar upload fixture for chat role
// admin-update (the server requires an actual jpg/jpeg/png file upload).
const FIXTURE_AVATAR_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

/**
 * Create a temp directory with a small PNG avatar and return its path.
 * The caller is responsible for removing the returned directory.
 */
function createTemporaryAvatarFile(): string {
  const dir = mkdtempSync(join(tmpdir(), 'polyv-chat-avatar-'));
  const filePath = join(dir, 'avatar.png');
  writeFileSync(filePath, Buffer.from(FIXTURE_AVATAR_PNG_BASE64, 'base64'));
  return filePath;
}

function sleep(ms: number): void {
  const buffer = new SharedArrayBuffer(4);
  Atomics.wait(new Int32Array(buffer), 0, 0, ms);
}

function findChatMessageId(channelId: string, content: string): string {
  let lastOutput = '';

  for (let attempt = 0; attempt < 6; attempt += 1) {
    if (attempt > 0) {
      sleep(2000);
    }

    lastOutput = runCliSuccess([
      'chat',
      'list',
      '--channel-id',
      channelId,
      '--page',
      '1',
      '--size',
      '50',
      '--output',
      'json',
    ]);

    try {
      const messages = parseJsonValue(lastOutput);
      if (!Array.isArray(messages)) {
        continue;
      }

      const match = messages.find((message) => {
        if (!message || typeof message !== 'object') {
          return false;
        }

        const item = message as { id?: unknown; content?: unknown };
        return String(item.content ?? '') === content && String(item.id ?? '').length > 0;
      }) as { id?: unknown } | undefined;

      if (match?.id !== undefined) {
        return String(match.id);
      }
    } catch {
      // chat list prints an informational message rather than JSON while the
      // just-sent message is not visible yet; retry briefly.
    }
  }

  throw new Error(`Could not find chat message "${content}" in CLI output:\n${lastOutput}`);
}

describe('chat CLI integration', () => {
  it('shows extended chat command groups', () => {
    const result = runCli(['chat', '--help'], { includeTestEnv: false });

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('message');
    expect(result.output).toContain('badword');
    expect(result.output).toContain('notice');
    expect(result.output).toContain('robot');
  });

  it('shows force options for dangerous chat commands', () => {
    const commands = [
      ['chat', 'message', 'alert-special', '--help'],
      ['chat', 'badword', 'add', '--help'],
      ['chat', 'badword', 'delete', '--help'],
      ['chat', 'banned', 'ip-add', '--help'],
      ['chat', 'banned', 'delete', '--help'],
      ['chat', 'notice', 'clean', '--help'],
      ['chat', 'censor', 'update', '--help'],
      ['chat', 'role', 'admin-update', '--help'],
      ['chat', 'robot', 'setting-update', '--help'],
      ['chat', 'robot', 'pause', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--force');
      expect(result.output).toContain('--output');
    }
  });

  it('shows json-capable read command help', () => {
    const commands = [
      ['chat', 'message', 'online-count', '--help'],
      ['chat', 'message', 'speak-list', '--help'],
      ['chat', 'badword', 'list', '--help'],
      ['chat', 'banned', 'forbid-list', '--help'],
      ['chat', 'notice', 'list', '--help'],
      ['chat', 'qa', 'list', '--help'],
      ['chat', 'role', 'teacher-get', '--help'],
      ['chat', 'role', 'user-list', '--help'],
      ['chat', 'robot', 'stats', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--output');
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)('runs chat read commands against a temporary real channel', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Chat Read Smoke');
      const id = channelId;

      const readCommands = [
        ['chat', 'list', '--channel-id', id, '--page', '1', '--size', '5', '--output', 'json'],
        ['chat', 'banned', 'list', '--channel-id', id, '--type', 'badword', '--output', 'json'],
        ['chat', 'kicked', 'list', '--channel-id', id, '--output', 'json'],
        ['chat', 'message', 'online-count', '--channel-id', id, '--output', 'json'],
        ['chat', 'message', 'speak-list', '--size', '5', '--output', 'json'],
        ['chat', 'badword', 'list', '--output', 'json'],
        ['chat', 'banned', 'forbid-list', '--page-number', '1', '--page-size', '5', '--output', 'json'],
        ['chat', 'notice', 'list', '--channel-id', id, '--page-number', '1', '--page-size', '5', '--output', 'json'],
        ['chat', 'qa', 'list', '--channel-id', id, '--page-number', '1', '--page-size', '5', '--output', 'json'],
        ['chat', 'role', 'teacher-get', '--channel-id', id, '--output', 'json'],
        ['chat', 'robot', 'setting-get', '--channel-id', id, '--output', 'json'],
        ['chat', 'robot', 'stats', '--channel-id', id, '--output', 'json'],
      ];

      for (const args of readCommands) {
        runCliSuccess(args);
      }
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  // Real CLI execution of self-contained chat write subcommands. Each target
  // is a channel-scoped write that returns success on a fresh (non-live)
  // channel and is fully reversible: notice add -> clean forms a closed loop,
  // and the remaining writes are transient state on a temp channel that gets
  // deleted in `finally`.
  (shouldRunRealChannelTests ? it : it.skip)('runs chat write commands against a temporary real channel', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Chat Write Smoke');
      const id = channelId;

      // chat notice add returns the JSON boolean `true`.
      const noticeAdd = runCliSuccess([
        'chat', 'notice', 'add',
        '--channel-id', id,
        '--content', 'gnhf-integration-notice',
        '--force', '--output', 'json',
      ]);
      expect(JSON.parse(noticeAdd.trim())).toBe(true);

      // chat notice clean returns `{ success: true }` (also cleans up the add above).
      const noticeClean = parseJsonObject(runCliSuccess([
        'chat', 'notice', 'clean',
        '--channel-id', id,
        '--force', '--output', 'json',
      ]));
      expect(noticeClean.success).toBe(true);

      // chat role teacher-update returns the JSON boolean `true`.
      const teacherUpdate = runCliSuccess([
        'chat', 'role', 'teacher-update',
        '--channel-id', id,
        '--nickname', 'gnhf-teacher',
        '--actor', '讲师',
        '--force', '--output', 'json',
      ]);
      expect(JSON.parse(teacherUpdate.trim())).toBe(true);

      // chat message admin-send requires the role enum value `ADMIN` and returns
      // a success message string.
      const adminSend = runCliSuccess([
        'chat', 'message', 'admin-send',
        '--channel-id', id,
        '--content', 'gnhf-admin-hello',
        '--role', 'ADMIN',
        '--output', 'json',
      ]);
      expect(JSON.parse(adminSend.trim())).toMatch(/success/i);

      const removableContent = `gnhf-remove-contents-${Date.now()}`;
      const removableSend = parseJsonObject(runCliSuccess([
        'chat',
        'send',
        '--channel-id',
        id,
        '--msg',
        removableContent,
        '--nickname',
        'GNHFRemoveBot',
        '--output',
        'json',
      ]));
      expect(removableSend.success).toEqual(expect.any(Boolean));
      const removableMessageId = findChatMessageId(id, removableContent);

      // chat message remove-contents batch-deletes the message id returned by
      // chat history and returns the server success string as JSON.
      const removeContents = JSON.parse(runCliSuccess([
        'chat',
        'message',
        'remove-contents',
        '--channel-id',
        id,
        '--ids',
        removableMessageId,
        '--force',
        '--output',
        'json',
      ]).trim());
      expect(typeof removeContents === 'string' || removeContents?.success === true).toBe(true);

      // chat message alert-special returns the JSON boolean `true`.
      const alert = runCliSuccess([
        'chat', 'message', 'alert-special',
        '--channel-id', id,
        '--title', '提醒',
        '--message', 'gnhf-alert',
        '--force', '--output', 'json',
      ]);
      expect(JSON.parse(alert.trim())).toBe(true);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  // Real CLI execution of `chat role admin-update`. The set-chat-admin endpoint
  // requires an actual avatar image file (multipart upload); the default admin
  // info on a fresh channel is 管理员/管理员/missing_face.png. We capture the
  // originals, update nickname (<=8 chars) + actor (<=4 chars) + avatar, verify
  // all three persisted via admin-get, then restore the originals. Isolated in
  // its own block on a dedicated temp channel (deleted in `finally`) so it does
  // not couple to the chat-send/remove-contents flow above.
  (shouldRunRealChannelTests ? it : it.skip)('runs chat role admin-update with a real avatar upload against a temporary real channel', () => {
    let channelId: string | undefined;
    const avatarPath = createTemporaryAvatarFile();

    try {
      channelId = createTemporaryChannel('Chat Admin Update');
      const id = channelId;

      const before = parseJsonObject(runCliSuccess([
        'chat', 'role', 'admin-get',
        '--channel-id', id,
        '--output', 'json',
      ]));
      const originalNickname = String(before.nickname ?? '');
      const originalActor = String(before.actor ?? '');
      const originalAvatar = String(before.avatar ?? '');

      // chat role admin-update uploads the avatar (multipart) and returns the
      // server success string "修改成功" as a bare JSON string.
      const adminUpdate = runCliSuccess([
        'chat', 'role', 'admin-update',
        '--channel-id', id,
        '--nickname', 'gnhf-adm',
        '--actor', '主管',
        '--avatar', avatarPath,
        '--force', '--output', 'json',
      ]);
      expect(JSON.parse(adminUpdate.trim())).toBe('修改成功');

      const after = parseJsonObject(runCliSuccess([
        'chat', 'role', 'admin-get',
        '--channel-id', id,
        '--output', 'json',
      ]));
      expect(after.nickname).toBe('gnhf-adm');
      expect(after.actor).toBe('主管');
      // The avatar must have changed from the default missing_face placeholder
      // to a real uploaded CDN image URL.
      expect(String(after.avatar)).not.toBe(originalAvatar);
      expect(String(after.avatar)).toMatch(/videocc\.net\//);

      // Restore the original admin info (the endpoint always requires a file).
      const restore = runCliSuccess([
        'chat', 'role', 'admin-update',
        '--channel-id', id,
        '--nickname', originalNickname,
        '--actor', originalActor,
        '--avatar', avatarPath,
        '--force', '--output', 'json',
      ]);
      expect(JSON.parse(restore.trim())).toBe('修改成功');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
      rmSync(join(avatarPath, '..'), { recursive: true, force: true });
    }
  }, 120000);

  // Real CLI execution of the advanced chat message write subcommands. Each
  // target takes only the channel id (hidden-send / custom-send /
  // custom-send-encode) or the room id (emit-by-user-id, where the PolyV room
  // id equals the channel id) plus trivial text payloads, and reports success.
  // These are transient chat messages on a temp channel that is deleted in
  // `finally`, so there is no lasting side effect.
  (shouldRunRealChannelTests ? it : it.skip)('runs chat message advanced writes against a temporary real channel', () => {
    const credentials = getAccountCredentials();
    const userId = credentials?.userId;
    if (!userId) {
      throw new Error('POLYV_USER_ID is required for chat message hidden-send / emit-by-user-id');
    }

    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Chat Message Writes');
      const id = channelId;

      // chat message hidden-send returns `{ success: true }` (content is base64
      // URL-safe encoded inside the SDK sendChat call).
      const hiddenSend = parseJsonObject(runCliSuccess([
        'chat', 'message', 'hidden-send',
        '--channel-id', id,
        '--user-id', userId,
        '--content', 'gnhf-hidden-message',
        '--output', 'json',
      ]));
      expect(hiddenSend.success).toBe(true);

      // chat message custom-send returns `{ success: true }`.
      const customSend = parseJsonObject(runCliSuccess([
        'chat', 'message', 'custom-send',
        '--channel-id', id,
        '--content', 'gnhf-custom-message',
        '--force', '--output', 'json',
      ]));
      expect(customSend.success).toBe(true);

      // chat message custom-send-encode takes URL-safe base64 content and
      // returns `{ success: true }`.
      const encodedContent = Buffer.from('gnhf-encoded-message', 'utf8').toString('base64url');
      const customSendEncode = parseJsonObject(runCliSuccess([
        'chat', 'message', 'custom-send-encode',
        '--channel-id', id,
        '--content', encodedContent,
        '--force', '--output', 'json',
      ]));
      expect(customSendEncode.success).toBe(true);

      // chat message emit-by-user-id broadcasts to specific user ids in a room
      // (room id == channel id) and returns an empty success string `""`.
      const emit = runCliSuccess([
        'chat', 'message', 'emit-by-user-id',
        '--room-id', id,
        '--user-ids', userId,
        '--payload', 'gnhf-broadcast-payload',
        '--force', '--output', 'json',
      ]);
      expect(JSON.parse(emit.trim())).toBe('');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  // Real CLI execution of the chat robot channel-scoped write subcommands
  // (setting-update / list-update / pause). Each target takes only the channel
  // id plus trivial numeric/text values, reports `{ success: true }`, and
  // persists verifiable state (robot setting-get re-reads robotNumber). These
  // are transient robot settings on a temp channel deleted in `finally`, so
  // there is no lasting side effect (channel-scoped writes need no restore).
  (shouldRunRealChannelTests ? it : it.skip)('runs chat robot write commands against a temporary real channel', async () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Chat Robot Writes');
      const id = channelId;

      // chat robot setting-update sets robotNumber/addRobotModel and returns
      // `{ success: true }`; verify the new robotNumber persisted via setting-get.
      const settingUpdate = parseJsonObject(runCliSuccess([
        'chat', 'robot', 'setting-update',
        '--channel-id', id,
        '--robot-number', '5',
        '--add-robot-model', 'timely',
        '--force', '--output', 'json',
      ]));
      expect(settingUpdate.success).toBe(true);
      const afterSetting = parseJsonObject(runCliSuccess([
        'chat', 'robot', 'setting-get',
        '--channel-id', id,
        '--output', 'json',
      ]));
      expect(afterSetting.robotNumber).toBe(5);

      // chat robot pause pauses channel robot growth and returns
      // `{ success: true }`. pause does not change the virtual-viewer number,
      // so it does not incur the number-change cooldown below.
      const pause = parseJsonObject(runCliSuccess([
        'chat', 'robot', 'pause',
        '--channel-id', id,
        '--force', '--output', 'json',
      ]));
      expect(pause.success).toBe(true);

      // The server enforces a ~20s cooldown between consecutive virtual-viewer
      // number changes on the same channel (error: 虚拟人数设置频繁 需等待), so we
      // wait it out before the second number-setting write (list-update).
      await new Promise((resolve) => setTimeout(resolve, 25000));

      // chat robot list-update also only needs robotNumber + addRobotModel
      // (robot-list is optional) and returns `{ success: true }`; verify the new
      // robotNumber persisted via setting-get.
      const listUpdate = parseJsonObject(runCliSuccess([
        'chat', 'robot', 'list-update',
        '--channel-id', id,
        '--robot-number', '3',
        '--add-robot-model', 'timely',
        '--force', '--output', 'json',
      ]));
      expect(listUpdate.success).toBe(true);
      const afterList = parseJsonObject(runCliSuccess([
        'chat', 'robot', 'setting-get',
        '--channel-id', id,
        '--output', 'json',
      ]));
      expect(afterList.robotNumber).toBe(3);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  // Real CLI execution of chat role user-list. The apichat userlistExternal
  // endpoint returns an AES-encrypted body that the SDK signs (with the fixed
  // polyvChatSignForExternal secret) and decrypts; on a fresh non-live channel
  // the decrypted payload is an empty online-user list. The PolyV chat room id
  // equals the channel id, so the temp channel id is used as --room-id.
  (shouldRunRealChannelTests ? it : it.skip)('lists online chat room users via the apichat endpoint', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Chat Role UserList');
      const id = channelId;

      // chat role user-list returns `{ count, userlist }` (decrypted by the SDK).
      const result = parseJsonObject(runCliSuccess([
        'chat', 'role', 'user-list',
        '--room-id', id,
        '--page', '1',
        '--len', '10',
        '--output', 'json',
      ]));
      expect(typeof result.count).toBe('number');
      expect(Array.isArray(result.userlist)).toBe(true);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);
});
