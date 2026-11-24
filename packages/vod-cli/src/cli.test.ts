import { ACCOUNT, createHarness, type Harness, json } from './__tests__/harness';

let cli: Harness;
beforeEach(async () => {
  cli = await createHarness({ setup: (store) => void store.add(ACCOUNT.name, ACCOUNT, { replace: true }) });
});
afterEach(async () => {
  await cli.cleanup();
});

describe('exit codes and streams', () => {
  it('exits 0 and prints the result on stdout when a command succeeds', async () => {
    cli.sdk.video.searchVideos.mockResolvedValue({ pageNumber: 1, totalPages: 1, pageSize: 10, totalItems: 1, contents: [] });
    await expect(cli.run('video', 'search', '--source', 'test')).resolves.toBe(0);
    expect(cli.stdout.join('\n')).toContain('No results');
    expect(cli.stderr).toEqual([]);
  });

  it('exits 1 without calling the platform when --source is missing', async () => {
    await expect(cli.run('video', 'search')).resolves.toBe(1);
    expect(cli.sdk.video.searchVideos).not.toHaveBeenCalled();
    expect(cli.stderr.join('\n')).toContain('--source');
  });

  it('exits 1 for a malformed --source', async () => {
    await expect(cli.run('video', 'search', '--source', 'Not Valid')).resolves.toBe(1);
    expect(cli.sdk.video.searchVideos).not.toHaveBeenCalled();
  });

  it.each(['account', 'use', 'auth'])('does not require --source for %s', async (command) => {
    await expect(cli.run(command, '--help')).resolves.toBe(0);
  });

  it('exits 1 for an unknown option and keeps stdout empty', async () => {
    await expect(cli.run('video', 'search', '--source', 'test', '--bogus')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain("unknown option '--bogus'");
    expect(cli.stdout).toEqual([]);
  });

  it('exits 1 for a missing required argument', async () => {
    await expect(cli.run('video', 'update', '--title', 'x', '--source', 'test')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain("missing required argument 'vid'");
  });

  it('exits 0 for help and version', async () => {
    await expect(cli.run('--help')).resolves.toBe(0);
    expect(cli.stdout.join('\n')).toContain('Usage: polyv-vod-cli');
    cli.stdout.length = 0;
    await expect(cli.run('--version')).resolves.toBe(0);
    expect(cli.stdout.join('').trim()).toMatch(/^\d+\.\d+\.\d+$/);
    expect(cli.stderr).toEqual([]);
  });

  it('exits 1 and prints a hint when the platform rejects the request', async () => {
    const { PolyVVodError } = jest.requireActual('polyv-vod-api-sdk') as typeof import('polyv-vod-api-sdk');
    cli.sdk.video.searchVideos.mockRejectedValue(new PolyVVodError('api', 'the sign is not right.', { code: 400 }));
    await expect(cli.run('video', 'search', '--source', 'test')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('❌ the sign is not right.');
    expect(cli.stdout).toEqual([]);
  });

  it('keeps stdout valid JSON when a command fails in JSON mode', async () => {
    cli.sdk.video.waitUntilPublished.mockResolvedValue({ state: 'failed', info: { vid: 'v_1', basicInfo: { status: 40 } } });
    await expect(cli.run('video', 'wait', 'v_1', '--source', 'test', '-o', 'json')).resolves.toBe(1);
    expect(json(cli.stdout)).toMatchObject({ state: 'failed', status: 'encode-failed' });
    expect(cli.stderr.join('\n')).toContain('❌ Video v_1 is not playable');
  });

  it('does not leak a failure from one invocation into the next', async () => {
    await expect(cli.run('video', 'search')).resolves.toBe(1);
    cli.sdk.video.searchVideos.mockResolvedValue({ pageNumber: 1, totalPages: 1, pageSize: 10, totalItems: 0, contents: [] });
    await expect(cli.run('video', 'search', '--source', 'test')).resolves.toBe(0);
  });

  it('exits 1 when a write command runs without --force and there is no terminal', async () => {
    await expect(cli.run('video', 'delete', 'v_1', '--source', 'test')).resolves.toBe(1);
    expect(cli.stderr.join('\n')).toContain('Re-run it with --force');
    expect(cli.sdk.video.deleteVideos).not.toHaveBeenCalled();
  });
});

describe('positional arguments reach the command', () => {
  it('passes a single video id to video get, update and wait', async () => {
    cli.sdk.video.getVideoInfo.mockResolvedValue([]);
    await cli.run('video', 'get', 'v_1', '--source', 'test');
    expect(cli.sdk.video.getVideoInfo).toHaveBeenCalledWith(['v_1']);

    await cli.run('video', 'update', 'v_1', '--title', 'New', '--source', 'test', '--force');
    expect(cli.sdk.video.updateVideoInfo).toHaveBeenCalledWith({ vid: 'v_1', title: 'New', description: undefined, tag: undefined });

    cli.sdk.video.waitUntilPublished.mockResolvedValue({ state: 'published', info: { vid: 'v_1', basicInfo: { status: 60 } } });
    await cli.run('video', 'wait', 'v_1', '--source', 'test');
    expect(cli.sdk.video.waitUntilPublished.mock.calls[0][0]).toBe('v_1');
  });

  it('passes several video ids to the variadic commands', async () => {
    cli.sdk.video.deleteVideos.mockResolvedValue({ skipped: ['v_2'] });
    cli.sdk.video.recoverVideos.mockResolvedValue(undefined);
    cli.sdk.video.setForbidden.mockResolvedValue(undefined);
    cli.sdk.video.moveVideos.mockResolvedValue(undefined);

    await cli.run('video', 'delete', 'v_1', 'v_2', '--source', 'test', '--force', '-o', 'json');
    expect(cli.sdk.video.deleteVideos).toHaveBeenCalledWith(['v_1', 'v_2'], { deleteType: 1, ignoreInvalidVids: true });
    expect(json(cli.stdout)).toEqual({ deleted: ['v_1'], skipped: ['v_2'] });
    expect(cli.stderr.join('\n')).toContain('Not deleted: v_2');

    await cli.run('video', 'recover', 'v_1', 'v_2', '--source', 'test', '--force');
    expect(cli.sdk.video.recoverVideos).toHaveBeenCalledWith(['v_1', 'v_2']);

    await cli.run('video', 'ban', 'v_1', '--source', 'test', '--force');
    expect(cli.sdk.video.setForbidden).toHaveBeenCalledWith({ vids: ['v_1'], forbidden: true });
    await cli.run('video', 'unban', 'v_1', '--source', 'test', '--force');
    expect(cli.sdk.video.setForbidden).toHaveBeenLastCalledWith({ vids: ['v_1'], forbidden: false });

    await cli.run('video', 'move', 'v_1,v_2', '--cata-id', '7', '--source', 'test', '--force');
    expect(cli.sdk.video.moveVideos).toHaveBeenCalledWith({ vids: ['v_1', 'v_2'], cataId: '7' });
  });

  it('passes category ids and names to the category commands', async () => {
    await cli.run('category', 'list', '7', '--source', 'test');
    expect(cli.sdk.category.getCategories).toHaveBeenCalledWith('7');
    await cli.run('category', 'list', '--source', 'test');
    expect(cli.sdk.category.getCategories).toHaveBeenLastCalledWith(1);

    cli.sdk.category.addCategory.mockResolvedValue({ cataid: 8, catatree: '1,7,8' });
    await cli.run('category', 'add', '新分类', '--parent-id', '7', '--source', 'test', '--force');
    expect(cli.sdk.category.addCategory).toHaveBeenCalledWith({ cataname: '新分类', parentid: '7' });

    await cli.run('category', 'rename', '8', '改名', '--source', 'test', '--force');
    expect(cli.sdk.category.renameCategory).toHaveBeenCalledWith({ cataid: '8', cataname: '改名' });

    await cli.run('category', 'move', '8', '--dest-id', '1', '--source', 'test', '--force');
    expect(cli.sdk.category.moveCategory).toHaveBeenCalledWith({ cataid: '8', destCataid: '1' });

    await cli.run('category', 'delete', '8', '--source', 'test', '--force');
    expect(cli.sdk.category.deleteCategory).toHaveBeenCalledWith('8');
  });

  it('passes the file path and the task ids to the upload commands', async () => {
    cli.sdk.upload.uploadFile.mockResolvedValue({ vid: 'v_1', mode: 'direct', title: 'intro', status: 10, resumed: false });
    await cli.run('upload', 'file', './intro.mp4', '--source', 'test');
    expect(cli.sdk.upload.uploadFile.mock.calls[0][0]).toMatchObject({ filePath: './intro.mp4', mode: 'auto', resume: true });

    cli.sdk.upload.exportSyncTask.mockResolvedValue('vid,title\n');
    await cli.run('upload', 'task-export', 'task-1', '--source', 'test');
    expect(cli.sdk.upload.exportSyncTask).toHaveBeenCalledWith('task-1');

    await cli.run('upload', 'task-delete', 'task-1', '--source', 'test', '--force');
    expect(cli.sdk.upload.deleteSyncTask).toHaveBeenCalledWith('task-1');

    cli.sdk.upload.abortChunkedUpload.mockResolvedValue(true);
    await cli.run('upload', 'abort', './intro.mp4', '--source', 'test', '--force');
    expect(cli.sdk.upload.abortChunkedUpload).toHaveBeenCalledWith({ filePath: './intro.mp4', checkpointDir: undefined });
  });
});

describe('source and user agent', () => {
  it('reports the CLI version', async () => {
    await cli.run('--version');
    expect(cli.stdout.join('')).toMatch(/^0\.1\.0$/);
  });
});
