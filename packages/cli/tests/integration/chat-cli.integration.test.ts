import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { getAccountCredentials, hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

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
