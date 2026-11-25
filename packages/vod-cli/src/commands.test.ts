import { PassThrough } from 'node:stream';

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { Command } from 'commander';
import { PolyVVodError } from 'polyv-vod-api-sdk';

import { ACCOUNT, OTHER_ACCOUNT, createHarness, type Harness, json, videoItem } from './__tests__/harness';
import { confirmWrite } from './core/confirm';
import { bytes, pick, printObject, printRows, seconds } from './core/output';
import { dateString, jsonOption, optionsOf, positiveInteger, stringList, vidsOf } from './core/options';

let cli: Harness;
beforeEach(async () => {
  cli = await createHarness({ setup: (store) => void store.add(ACCOUNT.name, ACCOUNT) });
});
afterEach(async () => {
  await cli.cleanup();
});

describe('account, use and auth', () => {
  it('saves an account, makes it the default and never echoes a secret', async () => {
    await expect(cli.run('account', 'add', 'work', '--user-id', 'u9', '--secret-key', 'top-secret', '--write-token', 'top-write', '--default')).resolves.toBe(0);
    expect(cli.store.get('work')).toMatchObject({ userId: 'u9', secretKey: 'top-secret', writeToken: 'top-write' });
    expect(cli.store.defaultName()).toBe('work');
    expect(cli.stdout.join('\n')).toContain('Account "work" saved and set as default');
    expect([...cli.stdout, ...cli.stderr].join('\n')).not.toMatch(/top-secret|top-write/);
  });

  it('saves the API credentials together and refuses one without the other', async () => {
    await cli.run('account', 'add', 'api', '--user-id', 'u', '--secret-key', 's', '--app-id', 'a', '--app-secret', 'app-secret');
    expect(cli.store.get('api')).toMatchObject({ appId: 'a', appSecret: 'app-secret' });
    await expect(cli.run('account', 'add', 'half', '--user-id', 'u', '--secret-key', 's', '--app-id', 'a')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('--app-id and --app-secret must be given together');
    expect(cli.store.exists('half')).toBe(false);
  });

  it('warns when the writetoken is missing', async () => {
    await cli.run('account', 'add', 'no-write', '--user-id', 'u', '--secret-key', 's');
    expect(cli.stderr.join('\n')).toContain('No --write-token given');
  });

  it('refuses to overwrite an account without --replace', async () => {
    await expect(cli.run('account', 'add', ACCOUNT.name, '--user-id', 'x', '--secret-key', 'y')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('--replace');
    await expect(cli.run('account', 'add', ACCOUNT.name, '--user-id', 'x', '--secret-key', 'y', '--replace')).resolves.toBe(0);
    expect(cli.store.get(ACCOUNT.name)?.userId).toBe('x');
  });

  it('requires both --user-id and --secret-key', async () => {
    await expect(cli.run('account', 'add', 'bad', '--user-id', 'u')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain("required option '--secret-key <key>' not specified");
  });

  it('lists the accounts without their secrets', async () => {
    cli.store.add(OTHER_ACCOUNT.name, OTHER_ACCOUNT);
    await cli.run('account', 'list');
    const text = cli.stdout.join('\n');
    for (const column of ['name', 'userId', 'default', 'writeToken', 'apiCredentials', 'createdAt']) expect(text).toContain(column);
    expect(text).toContain(ACCOUNT.userId);
    expect(text).not.toMatch(/secret-1|write-1|secret-2/);

    cli.stdout.length = 0;
    await cli.run('account', 'list', '-o', 'json');
    expect(json(cli.stdout)).toEqual([
      expect.objectContaining({ name: ACCOUNT.name, userId: ACCOUNT.userId, default: 'yes', writeToken: 'yes', apiCredentials: 'no' }),
      expect.objectContaining({ name: OTHER_ACCOUNT.name, default: '', writeToken: 'no' })
    ]);
  });

  it('tells how to add the first account when none is saved', async () => {
    const empty = await createHarness();
    await empty.run('account', 'list');
    expect(empty.stdout.join('\n')).toContain('No accounts saved');
    empty.stdout.length = 0;
    await empty.run('account', 'list', '-o', 'json');
    expect(json(empty.stdout)).toEqual([]);
    empty.stdout.length = 0;
    await empty.run('use', '--list', '-o', 'json');
    expect(json(empty.stdout)).toEqual([]);
    await empty.cleanup();
  });

  it('shows where the credentials come from, never the credentials', async () => {
    await cli.run('account', 'current');
    expect(cli.stdout.join('\n')).toContain('default account');
    cli.stdout.length = 0;
    cli.stdout.length = 0;
    await cli.run('account', 'current', '-o', 'json', '--userId', 'f-u', '--secretKey', 'f-s');
    expect(json(cli.stdout)).toEqual({
      configured: true,
      source: 'command-line flags',
      account: null,
      userId: 'f-u',
      hasWriteToken: false,
      hasApiCredentials: false
    });
    expect(cli.stdout.join('\n')).not.toContain('f-s');
  });

  it('exits 1 when no credentials are configured', async () => {
    const empty = await createHarness();
    await expect(empty.run('account', 'current')).resolves.toBe(1);
    expect(empty.stdout.join('\n')).toContain('No VOD credentials configured');
    await empty.cleanup();
  });

  it('removes an account with --force, and clears the session when it pointed at it', async () => {
    cli.session.set(ACCOUNT.name);
    await expect(cli.run('account', 'remove', ACCOUNT.name)).resolves.toBe(1);
    expect(cli.store.exists(ACCOUNT.name)).toBe(true);
    await cli.run('account', 'remove', ACCOUNT.name, '--force');
    expect(cli.store.exists(ACCOUNT.name)).toBe(false);
    expect(cli.store.defaultName()).toBeUndefined();
    expect(cli.session.get()).toBeUndefined();
  });

  it('refuses to remove an account that is not saved', async () => {
    await expect(cli.run('account', 'remove', 'ghost', '--force')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('Account "ghost" is not saved');
  });

  it('sets and unsets the default account', async () => {
    cli.store.add(OTHER_ACCOUNT.name, OTHER_ACCOUNT);
    await cli.run('account', 'set-default', OTHER_ACCOUNT.name);
    expect(cli.store.defaultName()).toBe(OTHER_ACCOUNT.name);
    await expect(cli.run('account', 'set-default', 'ghost')).resolves.toBe(1);
    await cli.run('account', 'unset-default');
    expect(cli.store.defaultName()).toBeUndefined();
    cli.stdout.length = 0;
    await cli.run('account', 'unset-default');
    expect(cli.stdout.join('\n')).toContain('No default account was set');
  });

  it('switches the session account with use', async () => {
    cli.store.add(OTHER_ACCOUNT.name, OTHER_ACCOUNT);
    await cli.run('use', OTHER_ACCOUNT.name);
    expect(cli.session.get()).toBe(OTHER_ACCOUNT.name);
    cli.stdout.length = 0;
    await cli.run('account', 'current', '-o', 'json');
    expect(json(cli.stdout)).toMatchObject({ source: 'account "other" (selected with "use")' });

    cli.sdk.video.searchVideos.mockResolvedValue({ pageNumber: 1, totalPages: 1, pageSize: 10, totalItems: 0, contents: [] });
    await cli.run('video', 'search', '--source', 'test');
    expect(cli.credentialsUsed).toHaveLength(1);
    expect(cli.credentialsUsed[0]).toMatchObject({ userId: OTHER_ACCOUNT.userId });
  });

  it('answers each use option', async () => {
    cli.store.add(OTHER_ACCOUNT.name, OTHER_ACCOUNT);
    await cli.run('use', '--list');
    expect(cli.stdout.join('\n')).toContain(`${OTHER_ACCOUNT.name}  ${OTHER_ACCOUNT.userId}`);
    cli.stdout.length = 0;
    await cli.run('use', '--status');
    expect(cli.stdout.join('\n')).toContain('No account chosen');
    cli.stdout.length = 0;
    cli.session.set(OTHER_ACCOUNT.name);
    await cli.run('use', '--status', '-o', 'json');
    expect(json(cli.stdout)).toEqual({ account: OTHER_ACCOUNT.name, userId: OTHER_ACCOUNT.userId });
    cli.stdout.length = 0;
    await cli.run('use', '--clear');
    expect(cli.stdout.join('\n')).toContain('cleared');
    expect(cli.session.get()).toBeUndefined();
    cli.stdout.length = 0;
    await cli.run('use', '--clear');
    expect(cli.stdout.join('\n')).toContain('No session account was set');
  });

  it('fails when the use target is not saved and when no name is given', async () => {
    await expect(cli.run('use', 'ghost')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('Account "ghost" is not saved');
    cli.stderr.length = 0;
    await expect(cli.run('use')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('account name is required');
  });

  it('reports a session account that no longer exists', async () => {
    cli.session.set('ghost');
    await expect(cli.run('use', '--status')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('no longer saved');
  });

  it('meets the connector contract: auth prints a guide, status says Logged in, logout removes', async () => {
    await cli.run('auth');
    const guide = cli.stdout.join('\n');
    expect(guide).toContain('https://help.polyv.net/#/vod/api/getSecretKey');
    expect(guide).toContain('polyv-vod-cli account add workbuddy');

    cli.stdout.length = 0;
    await expect(cli.run('auth', 'status')).resolves.toBe(0);
    expect(cli.stdout[0]).toMatch(/^Logged in/);
    expect(cli.stdout[0]).not.toContain('Logged in ()');

    cli.store.add('workbuddy', { userId: 'w', secretKey: 'w-secret' });
    cli.session.set('workbuddy');
    cli.stdout.length = 0;
    await cli.run('auth', 'status');
    expect(cli.stdout[0]).toBe('Logged in (workbuddy)');

    cli.stdout.length = 0;
    await cli.run('auth', 'logout');
    expect(cli.store.exists('workbuddy')).toBe(false);
    expect(cli.session.get()).toBeUndefined();
    cli.stdout.length = 0;
    await cli.run('auth', 'logout');
    expect(cli.stdout.join('\n')).toContain('Not logged in. Nothing to remove.');
  });

  it('reports Not logged in with exit 1 when there are no credentials', async () => {
    const empty = await createHarness();
    await expect(empty.run('auth', 'status')).resolves.toBe(1);
    expect(empty.stdout[0]).toBe('Not logged in. No usable VOD credentials.');
    expect(empty.stdout[1]).toBe('Run `polyv-vod-cli auth` for setup instructions.');
    await empty.cleanup();
  });

  it('takes credentials from the environment', async () => {
    const fromEnv = await createHarness({
      env: { POLYV_VOD_USER_ID: 'env-u', POLYV_VOD_SECRET_KEY: 'env-s', POLYV_VOD_WRITE_TOKEN: 'env-w' }
    });
    fromEnv.sdk.video.searchVideos.mockResolvedValue({ pageNumber: 1, totalPages: 1, pageSize: 10, totalItems: 0, contents: [] });
    await fromEnv.run('video', 'search', '--source', 'test');
    expect(fromEnv.credentialsUsed[0]).toMatchObject({ userId: 'env-u', secretKey: 'env-s', writeToken: 'env-w' });
    await fromEnv.cleanup();
  });

  it('takes the credentials given as flags over the saved account', async () => {
    cli.sdk.video.searchVideos.mockResolvedValue({ pageNumber: 1, totalPages: 1, pageSize: 10, totalItems: 0, contents: [] });
    await cli.run('video', 'search', '--source', 'test', '--userId', 'flag-u', '--secretKey', 'flag-s', '--verbose');
    expect(cli.credentialsUsed[0]).toMatchObject({ userId: 'flag-u', secretKey: 'flag-s' });
    expect(cli.credentialsUsed[0]).not.toHaveProperty('writeToken');
    expect(cli.stderr.join('\n')).toContain('command-line flags');
    expect(cli.stderr.join('\n')).not.toContain('flag-s');
  });

  it('builds the client with the credentials and the declared source', async () => {
    const { createClient } = jest.requireActual('./core/client') as typeof import('./core/client');
    const client = createClient({ userId: 'u', secretKey: 's', writeToken: 'w', appId: 'a', appSecret: 'as' });
    expect(client.config).toMatchObject({ userId: 'u', secretKey: 's', writeToken: 'w', appId: 'a', appSecret: 'as' });
    expect(client.config.userAgent).toMatch(/^polyv-vod-cli\/\d+\.\d+\.\d+/);
  });
});

describe('video', () => {
  it('searches with the given filters and prints the total', async () => {
    cli.sdk.video.searchVideos.mockResolvedValue({ pageNumber: 2, totalPages: 5, pageSize: 1, totalItems: 5, contents: [videoItem('v_1')] });
    await expect(cli.run('video', 'search', '--title', '课程', '--cata-id', '7', '--tag', 't', '--status', '60', '--sort', 'playTimesDesc', '--page', '2', '--page-size', '1', '--source', 'test')).resolves.toBe(0);
    expect(cli.sdk.video.searchVideos).toHaveBeenCalledWith({ title: '课程', cataId: '7', tag: 't', status: '60', sort: 'playTimesDesc', page: 2, pageSize: 1 });
    const text = cli.stdout.join('\n');
    expect(text).toContain('v_1');
    expect(text).toContain('title of v_1');
    expect(text).toContain('1:01');
    expect(text).toContain('1 MB');
    expect(text).toContain('5 video(s) in total, page 2 of 5');
  });

  it('prints search results as JSON with the full platform records', async () => {
    const item = videoItem('v_1');
    cli.sdk.video.searchVideos.mockResolvedValue({ pageNumber: 1, totalPages: 1, pageSize: 10, totalItems: 1, contents: [item] });
    await cli.run('video', 'search', '-o', 'json', '--source', 'test');
    expect(json(cli.stdout)).toEqual({ totalItems: 1, pageNumber: 1, totalPages: 1, videos: [item] });
  });

  it('describes every status', async () => {
    cli.sdk.video.searchVideos.mockResolvedValue({
      pageNumber: 1, totalPages: 1, pageSize: 10, totalItems: 4,
      contents: [videoItem('a', { status: 6 }), videoItem('b', { status: 20 }), videoItem('c', { status: 41 }), videoItem('d', { status: 99 })]
    });
    await cli.run('video', 'search', '--source', 'test');
    const text = cli.stdout.join('\n');
    expect(text).toContain('processing');
    expect(text).toContain('encoding');
    expect(text).toContain('not-playable');
    expect(text).toContain('unknown(99)');
  });

  it('shows a video with its details', async () => {
    cli.sdk.video.getVideoInfo.mockResolvedValue([videoItem('v_1')]);
    await cli.run('video', 'get', 'v_1', '--source', 'test');
    const text = cli.stdout.join('\n');
    expect(text).toContain('https://example.com/v_1.mp4');
    expect(text).toContain('1 MB');
    // The detail view adds the columns the list does not have.
    for (const column of ['categoryId', 'tags', 'playUrl']) expect(text).toContain(column);
  });

  it('validates the page options before calling the platform', async () => {
    await expect(cli.run('video', 'search', '--page', '0', '--source', 'test')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('positive integer');
    expect(cli.sdk.video.searchVideos).not.toHaveBeenCalled();
  });

  it('updates a video only with a change and a confirmation', async () => {
    await expect(cli.run('video', 'update', 'v_1', '--source', 'test', '--force')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('Pass at least one of --title, --description or --tag');
    await cli.run('video', 'update', 'v_1', '--description', 'd', '--tag', 'a,b', '--source', 'test', '--force');
    expect(cli.sdk.video.updateVideoInfo).toHaveBeenCalledWith({ vid: 'v_1', title: undefined, description: 'd', tag: 'a,b' });
    expect(cli.stdout.join('\n')).toContain('Video v_1 updated');
  });

  it('deletes permanently only when asked', async () => {
    cli.sdk.video.deleteVideos.mockResolvedValue({ skipped: [] });
    await cli.run('video', 'delete', 'v_1', '--source', 'test', '--force', '--permanent');
    expect(cli.sdk.video.deleteVideos).toHaveBeenCalledWith(['v_1'], { deleteType: 2, ignoreInvalidVids: true });
    expect(cli.stdout.join('\n')).toContain('permanently deleted');
  });

  it('lets --strict turn unknown video ids into a failure of the whole batch', async () => {
    await cli.run('video', 'delete', 'v_1', '--strict', '--source', 'test', '--force');
    expect(cli.sdk.video.deleteVideos).toHaveBeenCalledWith(['v_1'], { deleteType: 1, ignoreInvalidVids: false });
  });

  it('names the ids the platform does not know, and does not suggest asking again', async () => {
    cli.sdk.video.deleteVideos.mockResolvedValue({ skipped: ['v_2'] });
    await cli.run('video', 'delete', 'v_1', 'v_2', '--source', 'test', '--force');
    expect(cli.stdout.join('\n')).toBe('✅ 1 video(s) moved to the recycle bin');
    const warning = cli.stderr.join('\n');
    expect(warning).toContain('⚠️  Not deleted, the platform does not know these ids (a wrong id, or one deleted for good already): v_2');
    expect(warning).not.toContain('Retry');
  });

  it('explains the two refusals of a delete, and keeps stdout empty in JSON mode', async () => {
    cli.sdk.video.deleteVideos.mockRejectedValue(new PolyVVodError('api', 'all vids illegal', { code: 400 }));
    await expect(cli.run('video', 'delete', 'v_1', '--source', 'test', '--force', '-o', 'json')).resolves.toBe(1);
    expect(cli.stdout).toEqual([]);
    expect(cli.stderr.join('\n')).toContain('❌ The platform knows none of these video ids, so nothing was deleted');
    expect(cli.stderr.join('\n')).toContain('Check the ids with: polyv-vod-cli video get <vid> --source <id>');

    cli.stderr.length = 0;
    cli.sdk.video.deleteVideos.mockRejectedValue(new PolyVVodError('api', 'illegal vids', { code: 400 }));
    await expect(cli.run('video', 'delete', 'v_1', 'v_2', '--strict', '--source', 'test', '--force', '-o', 'json')).resolves.toBe(1);
    expect(cli.stdout).toEqual([]);
    expect(cli.stderr.join('\n')).toContain('❌ The platform does not know some of these video ids, so with --strict nothing was deleted');
    expect(cli.stderr.join('\n')).toContain('drop --strict to delete the ones it knows');
  });

  it('passes other platform failures of a delete through unchanged', async () => {
    cli.sdk.video.deleteVideos.mockRejectedValue(new PolyVVodError('api', 'the sign is not right', { code: 400 }));
    await expect(cli.run('video', 'delete', 'v_1', '--source', 'test', '--force')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('❌ the sign is not right');
    expect(cli.stderr.join('\n')).not.toContain('these video ids');
  });

  it('moves, bans and unbans with a confirmation each', async () => {
    await expect(cli.run('video', 'move', 'v_1', '--cata-id', '7', '--source', 'test')).resolves.toBe(1);
    await expect(cli.run('video', 'recover', 'v_1', '--source', 'test')).resolves.toBe(1);
    await expect(cli.run('video', 'ban', 'v_1', '--source', 'test')).resolves.toBe(1);
    expect(cli.sdk.video.moveVideos).not.toHaveBeenCalled();
    expect(cli.sdk.video.recoverVideos).not.toHaveBeenCalled();
    expect(cli.sdk.video.setForbidden).not.toHaveBeenCalled();
  });

  it('requires --cata-id for move', async () => {
    await expect(cli.run('video', 'move', 'v_1', '--source', 'test')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain("required option '--cata-id <id>' not specified");
  });

  it('reports durations and sizes of videos or of a category', async () => {
    cli.sdk.video.getDurationAndSize.mockResolvedValue([
      { cataid: null, videos: [{ vid: 'v_1', duration: '00:01:01', filesize1: 1_048_576, filesize2: 524_288 }] }
    ]);
    await cli.run('video', 'size', '--vid', 'v_1', '--source', 'test');
    expect(cli.sdk.video.getDurationAndSize).toHaveBeenCalledWith({ vids: ['v_1'], cataId: undefined });
    const text = cli.stdout.join('\n');
    expect(text).toContain('00:01:01');
    expect(text).toContain('1.5 MB');
    expect(text).toContain('v_1');

    await cli.run('video', 'size', '--cata-id', '1,2', '--source', 'test');
    expect(cli.sdk.video.getDurationAndSize).toHaveBeenLastCalledWith({ vids: undefined, cataId: '1,2' });

    await expect(cli.run('video', 'size', '--source', 'test')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('Pass --vid or --cata-id');
  });

  it('waits for a video and reports the outcome', async () => {
    cli.sdk.video.waitUntilPublished.mockResolvedValue({ state: 'published', info: { vid: 'v_1', basicInfo: { status: 60 } } });
    await expect(cli.run('video', 'wait', 'v_1', '--source', 'test', '--timeout', '30', '--interval', '1')).resolves.toBe(0);
    expect(cli.sdk.video.waitUntilPublished).toHaveBeenCalledWith('v_1', { timeoutMs: 30_000, intervalMs: 1_000 });
    expect(cli.stdout.join('\n')).toContain('Video v_1 is published');
    expect(cli.stderr.join('\n')).toContain('Waiting for video v_1');

    cli.stderr.length = 0;
    cli.sdk.video.waitUntilPublished.mockResolvedValue({ state: 'timeout', info: undefined });
    await expect(cli.run('video', 'wait', 'v_1', '--source', 'test')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('Timed out waiting for video v_1');
    expect(cli.sdk.video.waitUntilPublished).toHaveBeenLastCalledWith('v_1', { timeoutMs: 600_000, intervalMs: 5_000 });
  });
});

describe('category', () => {
  const tree = [
    { text: 'Root (2)', cataname: '默认分类', catatree: '1', cataid: 1, parentid: 0, videos: 2, nodes: [{ text: 'Sub (1)', cataname: '课程', catatree: '1,7', cataid: 7, parentid: 1, videos: 1 }] },
    { text: 'Other (0)', cataname: '其他', catatree: '1,9', cataid: 9, parentid: 1, videos: 0, cataProfile: "<span class='cata-block'>加密</span>" }
  ];

  it('prints the tree indented', async () => {
    cli.sdk.category.getCategories.mockResolvedValue(tree);
    await cli.run('category', 'list', '--source', 'test');
    expect(cli.stdout).toEqual(['- 1  默认分类  (2 video(s))', '  - 7  课程  (1 video(s))', '- 9  其他  (0 video(s))']);
  });

  it('prints the tree as JSON without the markup', async () => {
    cli.sdk.category.getCategories.mockResolvedValue(tree);
    await cli.run('category', 'list', '-o', 'json', '--source', 'test');
    expect(json(cli.stdout)).toEqual([
      { id: 1, name: '默认分类', parentId: 0, path: '1', videos: 2, children: [{ id: 7, name: '课程', parentId: 1, path: '1,7', videos: 1 }] },
      { id: 9, name: '其他', parentId: 1, path: '1,9', videos: 0, settings: '加密' }
    ]);
  });

  it('says so when a category has no children', async () => {
    cli.sdk.category.getCategories.mockResolvedValue([]);
    await cli.run('category', 'list', '--source', 'test');
    expect(cli.stdout).toEqual(['No categories']);
  });

  it('creates a category and prints its id', async () => {
    cli.sdk.category.addCategory.mockResolvedValue({ cataid: 8, catatree: '1,7,8' });
    await cli.run('category', 'add', '新分类', '--parent-id', '7', '--source', 'test', '--force');
    expect(cli.sdk.category.addCategory).toHaveBeenCalledWith({ cataname: '新分类', parentid: '7' });
    expect(cli.stdout.join('\n')).toContain('Category created: 8 ("新分类" under 7)');

    cli.stdout.length = 0;
    await cli.run('category', 'add', '又一层', '--parent-id', '7', '--source', 'test', '--force', '-o', 'json');
    expect(json(cli.stdout)).toEqual({ id: 8, name: '又一层', parentId: '7', path: '1,7,8' });
  });

  it('changes the settings of a category', async () => {
    await cli.run('category', 'setting', '7', '--encrypt', '--no-keep-source', '--edu', '--no-aac', '--hls-level', 'app', '--player-id', 'p1', '--source', 'test', '--force');
    expect(cli.sdk.category.updateCategorySetting).toHaveBeenCalledWith({ cataid: '7', encrypt: true, keepSource: false, isEdu: true, encodeAac: false, hlslevel: 'app', playerId: 'p1' });

    cli.sdk.category.updateCategorySetting.mockClear();
    await cli.run('category', 'setting', '7', '--no-encrypt', '--source', 'test', '--force');
    expect(cli.sdk.category.updateCategorySetting).toHaveBeenLastCalledWith({ cataid: '7', encrypt: false, keepSource: undefined, isEdu: undefined, encodeAac: undefined, hlslevel: undefined, playerId: undefined });
  });

  // `videos` counts the videos of the whole sub-tree; `nodes` are the categories directly below.
  const branch = {
    text: 'Courses (3)', cataname: '课程', catatree: '1,7', cataid: 7, parentid: 1, videos: 3,
    nodes: [{ text: 'A (2)', cataname: '入门', catatree: '1,7,8', cataid: 8, parentid: 7, videos: 2, nodes: [{ text: 'A1 (1)', cataname: '第一课', catatree: '1,7,8,10', cataid: 10, parentid: 8, videos: 1 }] }]
  };

  it('says what deleting a category takes with it, before and after', async () => {
    cli.sdk.category.getCategories.mockResolvedValue([branch]);
    // No --force: the refusal names everything the delete would take with it.
    await expect(cli.run('category', 'delete', '7', '--source', 'test')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain(
      'This command will delete category 7 "课程" (with 2 sub-categories; 3 videos move to the default category). Re-run it with --force to confirm.'
    );
    expect(cli.sdk.category.deleteCategory).not.toHaveBeenCalled();

    await cli.run('category', 'delete', '7', '--source', 'test', '--force');
    expect(cli.sdk.category.getCategories).toHaveBeenCalledWith('7');
    expect(cli.sdk.category.deleteCategory).toHaveBeenCalledWith('7');
    expect(cli.stdout).toEqual(['✅ Category 7 deleted (with 2 sub-categories; 3 videos moved to the default category)']);
  });

  it('deletes a category that holds nothing without a count', async () => {
    cli.sdk.category.getCategories.mockResolvedValue([{ ...branch, videos: 0, nodes: [] }]);
    await cli.run('category', 'delete', '9', '--source', 'test', '--force');
    expect(cli.stderr).toEqual([]);
    expect(cli.stdout).toEqual(['✅ Category 9 deleted']);
  });

  it('uses the singular for one sub-category and one video', async () => {
    cli.sdk.category.getCategories.mockResolvedValue([{ ...branch, videos: 1, nodes: [{ ...branch.nodes[0], videos: 1, nodes: [] }] }]);
    await cli.run('category', 'delete', '7', '--source', 'test', '--force');
    expect(cli.stdout).toEqual(['✅ Category 7 deleted (with 1 sub-category; 1 video moved to the default category)']);
  });

  it('refuses to delete the root, and does not call the platform', async () => {
    await expect(cli.run('category', 'delete', '1', '--source', 'test', '--force')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('Category 1 is the root category; it cannot be deleted');
    expect(cli.sdk.category.getCategories).not.toHaveBeenCalled();
    expect(cli.sdk.category.deleteCategory).not.toHaveBeenCalled();
  });

  it('says when the category to delete is not there, whatever the platform words it as', async () => {
    cli.sdk.category.getCategories.mockRejectedValue(new PolyVVodError('api', 'cataId不存在', { code: 400 }));
    await expect(cli.run('category', 'delete', '123', '--source', 'test', '--force')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('❌ Category 123 was not found');
    expect(cli.stderr.join('\n')).toContain('List the categories with: polyv-vod-cli category list --source <id>');
    expect(cli.sdk.category.deleteCategory).not.toHaveBeenCalled();

    cli.sdk.category.getCategories.mockResolvedValue([]);
    await expect(cli.run('category', 'delete', '123', '--source', 'test', '--force')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('❌ Category 123 was not found');

    // Any other failure of the lookup is reported as it is, and nothing is deleted.
    cli.sdk.category.getCategories.mockRejectedValue(new PolyVVodError('network', 'fetch failed'));
    await expect(cli.run('category', 'delete', '123', '--source', 'test', '--force')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('❌ fetch failed');
    expect(cli.sdk.category.deleteCategory).not.toHaveBeenCalled();
  });

  it('validates the settings before changing anything', async () => {
    await expect(cli.run('category', 'setting', '7', '--source', 'test', '--force')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('Pass at least one setting to change');
    await expect(cli.run('category', 'setting', '7', '--hls-level', 'nope', '--source', 'test', '--force')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('--hls-level must be one of');
    expect(cli.sdk.category.updateCategorySetting).not.toHaveBeenCalled();
  });
});

describe('upload', () => {
  it('uploads a local file and prints the vid', async () => {
    cli.sdk.upload.uploadFile.mockResolvedValue({ vid: 'v_1', title: 'intro', mode: 'direct', status: 10, resumed: false });
    await cli.run('upload', 'file', './intro.mp4', '--title', '片头', '--description', 'd', '--tag', 't', '--cata-id', '7', '--luping', '--keep-source', '--source', 'test');
    expect(cli.sdk.upload.uploadFile.mock.calls[0][0]).toMatchObject({
      filePath: './intro.mp4',
      title: '片头',
      description: 'd',
      tag: 't',
      cataId: '7',
      luping: true,
      keepSource: true,
      mode: 'auto',
      resume: true
    });
    expect(cli.stdout.join('\n')).toContain('Uploaded v_1 (direct)');
    expect(cli.stdout.join('\n')).toContain('polyv-vod-cli video wait v_1');
  });

  it('maps the chunked-upload options and reports a resumed upload', async () => {
    cli.sdk.upload.uploadFile.mockResolvedValue({ vid: 'v_1', mode: 'chunked', resumed: true, parts: 3 });
    await cli.run('upload', 'file', './big.mp4', '--mode', 'chunked', '--part-size', '2', '--concurrency', '2', '--no-resume', '--checkpoint-dir', './cp', '--source', 'test', '-o', 'json');
    expect(cli.sdk.upload.uploadFile.mock.calls[0][0]).toMatchObject({ mode: 'chunked', partSize: 2 * 1024 * 1024, concurrency: 2, resume: false, checkpointDir: './cp' });
    expect(json(cli.stdout)).toMatchObject({ vid: 'v_1', mode: 'chunked', resumed: true, parts: 3 });
  });

  it('says what a resumed upload keeps from the interrupted run', async () => {
    cli.sdk.upload.uploadFile.mockResolvedValue({ vid: 'v_1', title: '课程', mode: 'chunked', resumed: true, parts: 3 });
    await cli.run('upload', 'file', './big.mp4', '--mode', 'chunked', '--title', '课程', '--source', 'test');
    expect(cli.stderr.join('\n')).toContain('ℹ️  Resumed upload: the video keeps the title given when the upload was first started');
    expect(cli.stderr.join('\n')).toContain('"video update" and "video move"');

    // Another title on the resumed run does not reach the video: say which one it has.
    cli.stderr.length = 0;
    await cli.run('upload', 'file', './big.mp4', '--mode', 'chunked', '--title', '新标题', '--source', 'test');
    expect(cli.stderr.join('\n')).toContain('Resumed upload: the video keeps the title "课程" given when the upload was first started');
  });

  it('says nothing about resuming for an upload that started from the beginning', async () => {
    cli.sdk.upload.uploadFile.mockResolvedValue({ vid: 'v_1', mode: 'direct', title: 'intro', resumed: false });
    await cli.run('upload', 'file', './intro.mp4', '--source', 'test');
    expect(cli.stderr.join('\n')).not.toContain('Resumed');
  });

  it('validates --mode and does not write progress to stdout', async () => {
    await expect(cli.run('upload', 'file', './intro.mp4', '--mode', 'teleport', '--source', 'test')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('--mode must be one of auto, direct, chunked');
    expect(cli.sdk.upload.uploadFile).not.toHaveBeenCalled();
  });

  it('waits for the upload when asked', async () => {
    cli.sdk.upload.uploadFile.mockResolvedValue({ vid: 'v_1', mode: 'direct', resumed: false });
    cli.sdk.video.waitUntilPublished.mockResolvedValue({ state: 'published', info: { vid: 'v_1', basicInfo: { status: 60 } } });
    await expect(cli.run('upload', 'file', './intro.mp4', '--wait', '--timeout', '30', '--source', 'test')).resolves.toBe(0);
    expect(cli.sdk.video.waitUntilPublished).toHaveBeenCalledWith('v_1', { timeoutMs: 30_000 });
    expect(cli.stdout.join('\n')).toContain('and published');

    cli.sdk.video.waitUntilPublished.mockResolvedValue({ state: 'failed', info: { vid: 'v_1', basicInfo: { status: 40 } } });
    await expect(cli.run('upload', 'file', './intro.mp4', '--wait', '--source', 'test')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('not published: failed');
  });

  it('submits a URL upload and needs a confirmation', async () => {
    const infos = [{ fileUrl: 'https://example.com/a.mp4', title: 'A' }];
    await expect(cli.run('upload', 'url', '--upload-infos', JSON.stringify(infos), '--source', 'test')).resolves.toBe(1);
    await cli.run('upload', 'url', '--upload-infos', JSON.stringify(infos), '--cata-id', '7', '--luping', '--source', 'test', '--force');
    expect(cli.sdk.upload.uploadByUrl).toHaveBeenCalledWith({ uploadInfos: infos, fileUrl: undefined, title: undefined, cataId: '7', luping: true });
    expect(cli.stdout.join('\n')).toContain('URL upload submitted');
  });

  it('submits the legacy URL form and validates its JSON', async () => {
    await cli.run('upload', 'url', '--file-url', 'https://a/1.mp4,https://a/2.mp4', '--title', 'A,B', '--source', 'test', '--force');
    expect(cli.sdk.upload.uploadByUrl).toHaveBeenCalledWith({ uploadInfos: undefined, fileUrl: 'https://a/1.mp4,https://a/2.mp4', title: 'A,B', cataId: undefined, luping: false });
    await expect(cli.run('upload', 'url', '--source', 'test', '--force')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('Pass --upload-infos or --file-url');
    await expect(cli.run('upload', 'url', '--upload-infos', '{bad', '--source', 'test', '--force')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('--upload-infos must be valid JSON');
  });

  it('lists the URL-upload tasks', async () => {
    cli.sdk.upload.listSyncTasks.mockResolvedValue({
      pageNumber: 1, totalItems: 1, totalPages: 1,
      contents: [{ taskid: 't1', classifyname: '默认分类', totalcount: 3, seccesscount: 2, failcount: 1, endtime: 1795551600000 }]
    });
    await cli.run('upload', 'tasks', '--page', '1', '--page-size', '5', '--source', 'test');
    expect(cli.sdk.upload.listSyncTasks).toHaveBeenCalledWith({ page: 1, pageSize: 5 });
    const text = cli.stdout.join('\n');
    expect(text).toContain('t1');
    expect(cli.stdout.length).toBeGreaterThan(0);
  });

  it('exports a task as CSV to stdout or to a file', async () => {
    cli.sdk.upload.exportSyncTask.mockResolvedValue('vid,title\nv_1,a\n');
    // stdout gets the CSV as given: a line of output already ends with the newline.
    await cli.run('upload', 'task-export', 't1', '--source', 'test');
    expect(cli.stdout).toEqual(['vid,title\nv_1,a']);
    cli.stdout.length = 0;
    const target = join(cli.store.filePath, '..', 'tasks.csv');
    await cli.run('upload', 'task-export', 't1', '--out', target, '--source', 'test');
    expect(cli.stdout.join('\n')).toContain('Written to');
    expect(await readFile(target, 'utf8')).toBe('vid,title\nv_1,a\n');
    expect(cli.stderr).toEqual([]);
  });

  it('says why an exported task is empty, and prints nothing to stdout', async () => {
    cli.sdk.upload.exportSyncTask.mockResolvedValue('');
    await cli.run('upload', 'task-export', 't1', '--source', 'test');
    expect(cli.stdout).toEqual([]);
    expect(cli.stderr.join('\n')).toBe('ℹ️  The export is empty: nothing has finished uploading for this task yet, or every upload in it failed.');
  });

  it('aborts an interrupted upload', async () => {
    cli.sdk.upload.abortChunkedUpload.mockResolvedValue(false);
    await cli.run('upload', 'abort', './big.mp4', '--source', 'test', '--force');
    expect(cli.sdk.upload.abortChunkedUpload).toHaveBeenCalledWith({ filePath: './big.mp4', checkpointDir: undefined });
    expect(cli.stdout.join('\n')).toContain('No interrupted upload found');
  });
});

describe('play', () => {
  it('creates a token and prints when it expires', async () => {
    cli.sdk.playSafe.createPlayToken.mockResolvedValue({ token: 'tok', videoId: 'v_1', viewerId: 'viewer-1', ttl: 300_000, disposable: true, createdTime: 1795551600000, expiredTime: 1795551900000 });
    await cli.run('play', 'token', '--vid', 'v_1', '--viewer-id', 'viewer-1', '--viewer-name', 'Nick', '--viewer-ip', '127.0.0.1', '--expires', '300', '--disposable', '--source', 'test');
    expect(cli.sdk.playSafe.createPlayToken).toHaveBeenCalledWith({ videoId: 'v_1', viewerId: 'viewer-1', viewerName: 'Nick', viewerIp: '127.0.0.1', expires: 300, disposable: true });

    cli.stdout.length = 0;
    await cli.run('play', 'token', '--vid', 'v_1', '--viewer-id', 'viewer-1', '-o', 'json', '--source', 'test');
    const view = json(cli.stdout) as Record<string, unknown>;
    expect(view).toMatchObject({ token: 'tok', videoId: 'v_1', viewerId: 'viewer-1', ttlSeconds: 300, disposable: true });
    expect(String(view.expiresAt)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('requires the video and the viewer', async () => {
    await expect(cli.run('play', 'token', '--source', 'test')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain("required option '--vid <vid>' not specified");
  });
});

describe('stats', () => {
  it('prints the space and traffic usage', async () => {
    cli.sdk.statistics.getAccountUsage.mockResolvedValue({ videoCount: 15, totalFlow: 100 * 1024 ** 3, usedSpace: 682 * 1024 ** 2, usedFlow: 49 * 1024 ** 3, totalSpace: 20 * 1024 ** 3, userId: 'u', email: 'e' });
    await cli.run('stats', 'usage', '--date', '2026-11-25', '--source', 'test');
    expect(cli.sdk.statistics.getAccountUsage).toHaveBeenCalledWith('2026-11-25');
    const text = cli.stdout.join('\n');
    expect(text).toContain('15');
    expect(text).toContain('682 MB');
    expect(text).toContain('20 GB');
    expect(text).toContain('49 GB');
    expect(text).toContain('100 GB');
    await expect(cli.run('stats', 'usage', '--date', '11/25/2026', '--source', 'test')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('yyyy-MM-dd');
  });

  it('prints play counts per period', async () => {
    cli.sdk.statistics.getPlayTimes.mockResolvedValue([{ currentTime: '2026-11-25', pcVideoView: 4, mobileVideoView: 2 }]);
    await cli.run('stats', 'play-times', '--vid', 'v_1', '--dr', '7days', '--period', 'daily', '--source', 'test');
    expect(cli.sdk.statistics.getPlayTimes).toHaveBeenCalledWith({ vid: 'v_1', dr: '7days', period: 'daily' });
    expect(cli.stdout.join('\n')).toContain('2026-11-25');
  });

  it('prints the ranking of the most played videos', async () => {
    const item = { videoId: 'v_1', title: 'A', duration: '00:01:00', pcVideoView: 4, mobileVideoView: 2 };
    cli.sdk.statistics.getPlayTimesRank.mockResolvedValue({ totalPcVideoView: 4, totalMoVideoView: 2, pcVideoDailys: [item], moVideoDailys: [item] });
    await cli.run('stats', 'rank', '--start', '2026-11-01', '--end', '2026-11-25', '--source', 'test');
    expect(cli.sdk.statistics.getPlayTimesRank).toHaveBeenCalledWith({ start: '2026-11-01', end: '2026-11-25', dr: undefined });
    expect(cli.stdout.join('\n').match(/v_1/g)).toHaveLength(2);
    await expect(cli.run('stats', 'rank', '--start', 'yesterday', '--source', 'test')).resolves.toBe(1);
  });

  it('prints the play count of specific videos', async () => {
    cli.sdk.statistics.getVideoPlayTimes.mockResolvedValue([{ vid: 'v_1', times: 7 }]);
    await cli.run('stats', 'video-play-times', 'v_1', '--real-time', '-o', 'json', '--source', 'test');
    expect(cli.sdk.statistics.getVideoPlayTimes).toHaveBeenCalledWith(['v_1'], true);
    expect(json(cli.stdout)).toEqual([{ videoId: 'v_1', playTimes: 7 }]);
  });

  it('reads the view log by day and by month', async () => {
    const entry = { playId: 'p', videoId: 'v_1', playDuration: 61, stayDuration: 90, currentTimes: 30, duration: 120, currentDay: '2026-11-25', ipAddress: '127.0.0.1', city: '深圳', referer: 'https://a', operatingSystem: 'macOS', browser: 'Chrome' };
    cli.sdk.statistics.getDailyViewLog.mockResolvedValue({ total: 1, contents: [entry] });
    await cli.run('stats', 'view-log', '--day', '20261125', '--page', '2', '--page-size', '5', '--source', 'test');
    expect(cli.sdk.statistics.getDailyViewLog).toHaveBeenCalledWith({ day: '20261125', pageNum: 2, pageSize: 5 });
    const text = cli.stdout.join('\n');
    expect(text).toContain('1:01');
    expect(text).toContain('0:30');
    expect(text).toContain('macOS Chrome');

    cli.sdk.statistics.getMonthlyViewLog.mockResolvedValue({ total: 1, data: [entry] });
    await cli.run('stats', 'view-log', '--month', '202611', '--vid', 'v_1', '--source', 'test');
    expect(cli.sdk.statistics.getMonthlyViewLog).toHaveBeenCalledWith({ month: '202611', pageNum: 1, pageSize: 50, vid: 'v_1' });
    expect(cli.stdout.join('\n')).toContain('1 entries in total');
  });

  it('needs exactly one of --day and --month', async () => {
    await expect(cli.run('stats', 'view-log', '--source', 'test')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('Pass --day <yyyyMMdd> or --month <yyyyMM>');
    await expect(cli.run('stats', 'view-log', '--day', '20261125', '--month', '202611', '--source', 'test')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('not both');
    await expect(cli.run('stats', 'view-log', '--day', '2026-11-25', '--source', 'test')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('--day must be formatted yyyyMMdd');
    expect(cli.sdk.statistics.getDailyViewLog).not.toHaveBeenCalled();
  });
});

describe('callback', () => {
  it('reads and sets the callback URL, which needs the API credentials', async () => {
    cli.sdk.callback.getCallbackSetting.mockResolvedValue({ callbackUrl: 'https://example.com/cb' });
    await cli.run('callback', 'get', '--source', 'test');
    expect(cli.stdout.join('\n')).toContain('https://example.com/cb');

    cli.sdk.callback.getCallbackSetting.mockResolvedValue({});
    cli.stdout.length = 0;
    await cli.run('callback', 'get', '--source', 'test');
    expect(cli.stdout.join('\n')).toContain('(not set)');

    await cli.run('callback', 'set', '--url', 'https://example.com/new', '--source', 'test', '--force');
    expect(cli.sdk.callback.updateCallbackSetting).toHaveBeenCalledWith({ callbackUrl: 'https://example.com/new' });
    await cli.run('callback', 'set', '--source', 'test', '--force');
    expect(cli.sdk.callback.updateCallbackSetting).toHaveBeenLastCalledWith({ callbackUrl: undefined });
    expect(cli.stdout.join('\n')).toContain('cleared');
  });

  it('validates the callback URL and asks before changing it', async () => {
    await expect(cli.run('callback', 'set', '--url', 'ftp://x', '--source', 'test', '--force')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('--url must be an http(s) URL');
    await expect(cli.run('callback', 'set', '--url', 'https://x', '--source', 'test')).resolves.toBe(1);
    expect(cli.sdk.callback.updateCallbackSetting).not.toHaveBeenCalled();
  });

  // Signature and plain text from the worked example of docs/vod/api/callBack.md.
  const UPLOAD = { sign: 'b245e3e65aa45b60dc02337b5cd914a7', type: 'upload', vid: 'e2e84a738302f20a4f6eb202976f5c63_e' };
  const SECRET = '7UagtQOq2A';

  it('checks a callback signature offline with the saved secretkey', async () => {
    // The default account carries the secretkey the documented signature was made with.
    cli.store.add('cb', { userId: 'cb', secretKey: SECRET });
    cli.store.setDefault('cb');
    await expect(cli.run('callback', 'verify', '--sign', UPLOAD.sign, '--type', 'upload', '--vid', UPLOAD.vid)).resolves.toBe(0);
    expect(cli.stdout.join('\n')).toContain('Signature valid');
    expect(cli.sdk.callback.verifySignature).not.toHaveBeenCalled();
    expect(cli.credentialsUsed).toHaveLength(0);

    cli.stdout.length = 0;
    await cli.run('callback', 'verify', '--json', JSON.stringify(UPLOAD), '-o', 'json');
    expect(json(cli.stdout)).toEqual({ valid: true });
  });

  it('rejects a forged callback and fails', async () => {
    await expect(cli.run('callback', 'verify', '--sign', UPLOAD.sign, '--type', 'upload', '--vid', 'v_forged', '--secret-key', SECRET)).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('Signature invalid');
    expect(cli.stdout).toEqual([]);
  });

  it('needs a signature and a secretkey to check against', async () => {
    await expect(cli.run('callback', 'verify', '--type', 'upload', '--source', 'test')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('Pass the callback signature');
    const empty = await createHarness();
    await expect(empty.run('callback', 'verify', '--sign', UPLOAD.sign, '--type', 'upload', '--vid', UPLOAD.vid)).resolves.toBe(1);
    expect(empty.stderr.join('\n')).toContain('No secretkey to check against');
    await empty.cleanup();
  });
});

describe('output and option helpers', () => {
  it('formats sizes and durations for people', () => {
    expect(bytes(0)).toBe('0 B');
    expect(bytes(1023)).toBe('1023 B');
    expect(bytes(1024)).toBe('1 KB');
    expect(bytes(1024 ** 2)).toBe('1 MB');
    expect(bytes(1.5 * 1024 * 1024)).toBe('1.5 MB');
    expect(bytes(20 * 1024 ** 3)).toBe('20 GB');
    expect(bytes(3 * 1024 ** 4)).toBe('3 TB');
    expect(bytes('x')).toBe('');
    expect(seconds(0)).toBe('0:00');
    expect(seconds(61)).toBe('1:01');
    expect(seconds(3661)).toBe('1:01:01');
    expect(seconds(undefined)).toBe('');
  });

  it('prints rows, single objects and JSON', () => {
    const lines: string[] = [];
    const out = (line: string): void => void lines.push(line);
    printRows(out, [], ['a'], 'table');
    expect(lines).toEqual(['No results']);
    printRows(out, [{ a: 1, b: 2 }], ['a', 'c'], 'table');
    expect(lines[1]).toContain('a');
    printRows(out, [{ a: 1 }], ['a'], 'json');
    expect(lines[2]).toBe(JSON.stringify([{ a: 1 }], null, 2));
    lines.length = 0;
    printObject(out, { a: true, b: null, c: { d: 1 } }, ['a', 'b', 'c'], 'table');
    expect(lines.join('\n')).toContain('yes');
    expect(lines.join('\n')).toContain('{"d":1}');
    printObject(out, { a: 1 }, ['a'], 'json');
    expect(lines[lines.length - 1]).toContain('"a": 1');
    expect(pick({ a: 1, b: 2 }, ['b'])).toEqual({ b: 2 });
  });

  it('parses and validates options', () => {
    expect(positiveInteger('3')).toBe(3);
    expect(() => positiveInteger('0')).toThrow('positive integer');
    expect(() => positiveInteger('1.5')).toThrow('positive integer');
    expect(stringList('a, b,c')).toEqual(['a', 'b', 'c']);
    expect(() => stringList(' , ')).toThrow('must not be empty');
    expect(vidsOf(['a,b', 'c'])).toEqual(['a', 'b', 'c']);
    expect(vidsOf('a')).toEqual(['a']);
    expect(vidsOf(undefined)).toEqual([]);
    expect(jsonOption('{"a":1}', '--x')).toEqual({ a: 1 });
    expect(() => jsonOption('{', '--x')).toThrow('--x must be valid JSON');
    expect(dateString('2026-11-25', '--date')).toBe('2026-11-25');
    expect(dateString(undefined, '--date')).toBeUndefined();
    expect(() => dateString('20261125', '--date')).toThrow('yyyy-MM-dd');
  });

  it('reads positional arguments by their declared names', () => {
    const program = new Command();
    const seen: unknown[] = [];
    program
      .command('get <vid...>')
      .option('-o, --output <format>')
      .action(function (this: Command, ...args: unknown[]) {
        seen.push(optionsOf(this, args));
      });
    program.command('rename <cata-id> <name>').action(function (this: Command, ...args: unknown[]) {
      seen.push(optionsOf(this, args));
    });
    program.parse(['node', 'cli', 'get', 'a_1', 'b_1', '-o', 'json']);
    program.parse(['node', 'cli', 'rename', '7', '课程']);
    expect(seen).toEqual([{ output: 'json', vid: ['a_1', 'b_1'] }, { cataId: '7', name: '课程' }]);
  });

  describe('confirmWrite', () => {
    it('does not ask with --force', async () => {
      await expect(confirmWrite('delete', { force: true })).resolves.toBeUndefined();
    });

    it('refuses when there is no terminal to ask on', async () => {
      await expect(confirmWrite('delete 3 videos')).rejects.toThrow('This command will delete 3 videos. Re-run it with --force to confirm.');
    });

    it('asks on a terminal and takes yes for an answer', async () => {
      const input = new PassThrough();
      const output = new PassThrough();
      const answer = confirmWrite('delete', { input, output });
      input.write('y\n');
      await expect(answer).resolves.toBeUndefined();
      expect(output.read()?.toString()).toContain('About to delete. Continue? [y/N]');
    });

    it('cancels on any other answer', async () => {
      const input = new PassThrough();
      const answer = confirmWrite('delete', { input, output: new PassThrough() });
      input.write('no\n');
      await expect(answer).rejects.toThrow('Operation cancelled');
    });
  });
});
