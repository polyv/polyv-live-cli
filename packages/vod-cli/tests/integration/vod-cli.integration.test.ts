/**
 * The built CLI against the real platform: the flow a user goes through, end to end.
 *
 * Skipped unless the test account is configured (see `../helpers/credentials.ts`). Use a test
 * account: this uploads and deletes videos, creates and deletes categories and a URL-upload
 * task, and sets the callback URL back to what it was. Set `POLYV_VOD_TEST_PUBLIC_MP4` to a
 * public mp4 to add the test of a URL upload that succeeds.
 *
 * Everything created here is removed afterwards, and the removal is verified through the SDK by
 * fetching each object: a command that reports success does not prove the object is gone. The
 * tests in this file run in order and build on each other.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { isPublished, isVideoNotFound, PolyVVodClient, type CategoryNode } from 'polyv-vod-api-sdk';

import { Cli, type CliRunResult } from '../helpers/cli-runner';
import { readCredentials } from '../helpers/credentials';

const credentials = readCredentials();
const real = credentials ? describe : describe.skip;

const TINY_MP4 = resolve(__dirname, '../fixtures/tiny.mp4');
/** The `--source` of every API command: this test. */
const SOURCE = 'cli-it';
const ACCOUNT = 'it';
/** The CLI takes its part size in whole MB. */
const PART_BYTES = 1024 * 1024;
/** Long enough for a transcode. */
const WAIT_SECONDS = '480';
const PLACEHOLDER_CALLBACK = 'https://example.com/polyv-vod-cli-integration-test';
/** A video id and a category id the platform has never handed out. */
const UNKNOWN_VID = 'zzz_0';
const UNKNOWN_CATEGORY = '9999999999999';
/**
 * A public mp4 the platform can fetch. Setting it adds the test of a URL upload that succeeds;
 * without it only the failing path is covered, which needs no address outside the platform.
 */
const PUBLIC_MP4 = process.env.POLYV_VOD_TEST_PUBLIC_MP4?.trim() || '';

/** What the CLI prints for a video with `-o json`: the SDK's video record. */
interface JsonVideo {
  vid: string;
  basicInfo: { title: string; status: number; cateId: number; cateName?: string };
}

interface JsonSearch {
  totalItems: number;
  videos: Array<{ vid: string }>;
}

interface JsonCategory {
  id: number;
  name: string;
  parentId: number;
  videos?: number;
  children?: JsonCategory[];
}

interface JsonTask {
  taskid: string;
  totalcount?: number;
  /** Counts of the platform's own spelling. */
  seccesscount?: number;
  failcount?: number;
  taskstatus?: string;
}

interface JsonUpload {
  vid: string;
  mode: string;
  title?: string;
  resumed: boolean;
  parts?: number;
  /** Set by `video wait` and by an upload with `--wait`. */
  state?: string;
}

const sleep = (ms: number): Promise<void> => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

/** Polls until `done` resolves to true, and fails the test when it never does. */
async function waitFor(what: string, done: () => Promise<boolean>, timeoutMs = 2 * 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await done()) return;
    await sleep(5_000);
  }
  throw new Error(`gave up waiting for ${what}`);
}

real('polyv-vod-cli against the real platform', () => {
  if (!credentials) {
    // Jest runs the body of a skipped suite too, to collect its tests, and a file without a
    // single test counts as a failure. This is the one test it finds without an account.
    it('needs the test account (see helpers/credentials.ts)', () => undefined);
    return;
  }
  const account = credentials;
  const hasApiCredentials = Boolean(account.appId && account.appSecret);

  let cli: Cli;
  let sdk: PolyVVodClient;
  let workDir = '';
  let checkpointDir = '';
  const RUN = `cli-it-${Date.now()}`;

  /** Videos to delete for good before the run ends. A video leaves the list once it is confirmed gone. */
  const created: string[] = [];
  /** Categories to delete before the run ends, children before their parents. */
  const categories: string[] = [];
  /** URL-upload tasks to delete before the run ends. */
  const tasks: string[] = [];
  /** The callback URL as it was, from the moment a test reads it until it has put it back. */
  let callbackBefore: string | null | undefined;
  let cataid = '';
  let childCataId = '';
  let parentCataId = '';
  let directVid = '';
  let chunkedVid = '';

  /** Runs an API command: each of them has to declare who is calling. */
  const api = (args: string[]): CliRunResult => cli.run([...args, '--source', SOURCE]);
  const apiJson = <T>(args: string[]): T => cli.json([...args, '--source', SOURCE]) as T;

  const videoOf = (vid: string): JsonVideo => apiJson<JsonVideo[]>(['video', 'get', vid])[0];
  const vidsIn = (result: JsonSearch): string[] => result.videos.map((video) => video.vid);
  const taskIds = (): string[] => apiJson<{ contents: JsonTask[] }>(['upload', 'tasks', '--page-size', '50']).contents.map((task) => task.taskid);
  const checkpoints = (): number => (existsSync(checkpointDir) ? readdirSync(checkpointDir).length : 0);

  /** Finds a category in what `category list` prints. */
  const findCategory = (id: number): JsonCategory | undefined => {
    const search = (nodes: JsonCategory[]): JsonCategory | undefined => {
      for (const node of nodes) {
        if (node.id === id) return node;
        const nested = search(node.children ?? []);
        if (nested) return nested;
      }
      return undefined;
    };
    return search(apiJson<JsonCategory[]>(['category', 'list']));
  };

  /** Every category of the tree, as the SDK returns it. */
  const flatTree = async (): Promise<CategoryNode[]> => {
    const flat = (nodes: CategoryNode[]): CategoryNode[] => nodes.flatMap((node) => [node, ...flat(node.nodes ?? [])]);
    return flat(await sdk.category.getCategories());
  };

  /** Whether the platform still knows a video. */
  async function videoExists(vid: string): Promise<boolean> {
    try {
      await sdk.video.getVideoInfo(vid);
      return true;
    } catch (error) {
      if (isVideoNotFound(error)) return false;
      throw error;
    }
  }

  /**
   * Deletes a video for good and only resolves once the platform no longer knows it. The final
   * answer is always a lookup, never the delete call's own success.
   */
  async function deleteForGood(vid: string): Promise<void> {
    let last = 'not attempted';
    for (let attempt = 0; attempt < 18; attempt += 1) {
      try {
        if (!(await videoExists(vid))) return;
        await sdk.video.deleteVideos(vid, { deleteType: 1 });
        const { skipped } = await sdk.video.deleteVideos(vid, { deleteType: 2 });
        if (skipped.length === 0 && !(await videoExists(vid))) return;
        last = skipped.length > 0 ? 'skipped by the platform' : 'still listed after the delete';
      } catch (error) {
        last = (error as Error).message;
      }
      await sleep(10_000);
    }
    throw new Error(`could not delete video ${vid}: ${last}`);
  }

  /** Deletes a category, if the platform still lists it, and fails if it lists it afterwards. */
  async function deleteCategoryForGood(cataidToDelete: string): Promise<void> {
    const listed = async (): Promise<boolean> => JSON.stringify(await sdk.category.getCategories()).includes(`"cataid":${cataidToDelete}`);
    // Deleting a category takes the categories below it with it, so it may have gone with its parent.
    if (!(await listed())) return;
    await sdk.category.deleteCategory(cataidToDelete);
    if (await listed()) throw new Error(`category ${cataidToDelete} is still listed after the delete`);
  }

  /** A real video large enough for three parts: the fixture clip written out several times. */
  function multiPartVideo(): string {
    const clip = readFileSync(TINY_MP4);
    const copies = Math.ceil((PART_BYTES * 2 + 40_000) / clip.length);
    const path = join(workDir, 'sample.mp4');
    writeFileSync(path, Buffer.concat(Array.from({ length: copies }, () => clip)));
    return path;
  }

  /**
   * Stops a chunked upload through the SDK after its first part, as a dropped connection would,
   * and so leaves its checkpoint behind for the CLI to find.
   */
  async function interruptAfterFirstPart(path: string): Promise<void> {
    const controller = new AbortController();
    await expect(
      sdk.upload.uploadFile({
        filePath: path,
        title: `${RUN}-chunked`,
        mode: 'chunked',
        partSize: PART_BYTES,
        checkpointDir,
        concurrency: 1,
        signal: controller.signal,
        onProgress: (event) => {
          if ((event.uploadedParts ?? 0) >= 1) controller.abort();
        }
      })
    ).rejects.toMatchObject({ name: 'AbortError' });
  }

  beforeAll(() => {
    cli = Cli.isolated();
    workDir = mkdtempSync(join(tmpdir(), 'polyv-vod-cli-it-'));
    checkpointDir = join(workDir, 'checkpoints');
    // The SDK is not what is tested here. It checks what the CLI claims.
    sdk = new PolyVVodClient({ ...account, rateLimit: false });
  });

  afterAll(async () => {
    const failures: string[] = [];
    const note = (what: string, error: unknown): void => {
      failures.push(`${what}: ${(error as Error).message}`);
    };
    try {
      // Videos first: deleting a category moves its videos to the default category instead of
      // deleting them, so they are what must not be left behind.
      for (const vid of created) await deleteForGood(vid).catch((error: unknown) => note(`video ${vid}`, error));
      // Videos and categories this run created but never recorded, because a test stopped in between.
      try {
        const unrecorded = (await sdk.video.searchVideos({ title: RUN, pageSize: 100 })).contents.map((video) => video.vid);
        for (const vid of unrecorded) {
          if (!created.includes(vid)) await deleteForGood(vid).catch((error: unknown) => note(`video ${vid}`, error));
        }
      } catch (error) {
        note('searching for videos left behind', error);
      }
      try {
        // Deepest first, so that each is still listed when its turn comes.
        const withDepth = (nodes: CategoryNode[], depth = 0): Array<{ node: CategoryNode; depth: number }> =>
          nodes.flatMap((node) => [{ node, depth }, ...withDepth(node.nodes ?? [], depth + 1)]);
        const leftovers = withDepth(await sdk.category.getCategories())
          .filter(({ node }) => node.cataname.startsWith(RUN))
          .sort((a, b) => b.depth - a.depth);
        for (const { node } of leftovers) await deleteCategoryForGood(String(node.cataid)).catch((error: unknown) => note(`category ${node.cataid}`, error));
      } catch (error) {
        note('looking for categories left behind', error);
      }
      for (const id of categories) await deleteCategoryForGood(id).catch((error: unknown) => note(`category ${id}`, error));
      for (const id of tasks) await sdk.upload.deleteSyncTask(id).catch((error: unknown) => note(`URL-upload task ${id}`, error));
      if (callbackBefore !== undefined) {
        const current = (await sdk.callback.getCallbackSetting()).callbackUrl ?? null;
        const wanted = callbackBefore ?? null;
        if (current !== wanted) await sdk.callback.updateCallbackSetting({ callbackUrl: callbackBefore ?? undefined });
      }
    } finally {
      cli.cleanup();
      rmSync(workDir, { recursive: true, force: true });
    }
    if (failures.length > 0) throw new Error(`cleanup left objects in the test account:\n${failures.join('\n')}`);
  }, 15 * 60_000);

  it('takes the credentials from the environment', () => {
    expect(cli.json(['account', 'current'], { credentials: account })).toEqual({
      configured: true,
      source: 'environment variables',
      account: null,
      userId: account.userId,
      hasWriteToken: true,
      hasApiCredentials
    });
    const status = cli.run(['auth', 'status'], { credentials: account });
    expect(status.exitCode).toBe(0);
    expect(status.stdout).toBe('Logged in\n');
  });

  it('takes the credentials from the flags and says so with --verbose', () => {
    const result = cli.run([
      'video', 'search', '--page-size', '1', '--userId', account.userId, '--secretKey', account.secretKey, '--source', SOURCE, '--verbose'
    ]);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toContain('Credentials: command-line flags');
    expect(result.stdout + result.stderr).not.toContain(account.secretKey);
  });

  it('refuses an account that is not saved', () => {
    const result = cli.run(['video', 'search', '--account', 'nobody', '--source', SOURCE]);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Account "nobody" is not saved');
  });

  it('saves the account as the default and logs in with it', () => {
    const saved = cli.run([
      'account', 'add', ACCOUNT,
      '--user-id', account.userId,
      '--secret-key', account.secretKey,
      '--write-token', account.writeToken,
      ...(hasApiCredentials ? ['--app-id', String(account.appId), '--app-secret', String(account.appSecret)] : []),
      '--default'
    ]);
    expect(saved.exitCode).toBe(0);
    expect(saved.stdout).toBe(`✅ Account "${ACCOUNT}" saved and set as default\n`);
    // No command prints the keys it was handed.
    for (const secret of [account.secretKey, account.writeToken, account.appSecret]) {
      if (secret) expect(saved.stdout + saved.stderr).not.toContain(secret);
    }

    expect(cli.run(['auth', 'status']).stdout).toBe(`Logged in (${ACCOUNT})\n`);
    expect(cli.json(['account', 'current'])).toEqual({
      configured: true,
      source: `default account "${ACCOUNT}"`,
      account: ACCOUNT,
      userId: account.userId,
      hasWriteToken: true,
      hasApiCredentials
    });
    // The same account by name, and as the one chosen with `use`.
    expect(api(['category', 'list', '--account', ACCOUNT, '--verbose']).stderr).toContain(`Credentials: account "${ACCOUNT}" (--account)`);
    expect(cli.run(['use', ACCOUNT]).exitCode).toBe(0);
    expect(api(['category', 'list', '--verbose']).stderr).toContain(`Credentials: account "${ACCOUNT}" (selected with "use")`);
    expect(cli.run(['use', '--clear']).exitCode).toBe(0);
  });

  it('refuses to call the platform without --source although it is logged in', () => {
    const result = cli.run(['category', 'list']);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('--source');
    expect(result.stdout).toBe('');
  });

  it('lists the category tree', () => {
    const table = api(['category', 'list']);
    expect(table.exitCode).toBe(0);
    expect(table.stdout).toContain('video(s))');

    const tree = apiJson<JsonCategory[]>(['category', 'list']);
    expect(tree[0]).toMatchObject({ id: 1, parentId: 0 });
    expect(Array.isArray(tree[0].children)).toBe(true);
  });

  it('creates a category, renames it and changes its settings', () => {
    const refused = api(['category', 'add', RUN, '--parent-id', '1']);
    expect(refused.exitCode).toBe(1);
    expect(refused.stderr).toContain('Re-run it with --force');

    const added = apiJson<{ id: number; name: string; parentId: string; path: string }>([
      'category', 'add', RUN, '--parent-id', '1', '--force'
    ]);
    if (added.id) {
      cataid = String(added.id);
      categories.push(cataid);
    }
    expect(added.id).toBeGreaterThan(1);
    expect(added).toMatchObject({ name: RUN, parentId: '1' });

    expect(api(['category', 'rename', cataid, `${RUN}-renamed`, '--force']).exitCode).toBe(0);
    expect(findCategory(added.id)).toMatchObject({ id: added.id, name: `${RUN}-renamed`, parentId: 1 });

    // Settings of the temporary category only; it is deleted before the run ends.
    expect(api(['category', 'setting', cataid, '--aac', '--force']).exitCode).toBe(0);
    expect(api(['category', 'setting', cataid, '--no-aac', '--force']).exitCode).toBe(0);
  });

  it('moves a category under another one and back to the root', () => {
    const parent = apiJson<{ id: number }>(['category', 'add', `${RUN}-parent`, '--parent-id', '1', '--force']);
    const child = apiJson<{ id: number }>(['category', 'add', `${RUN}-child`, '--parent-id', String(parent.id), '--force']);
    if (child.id) {
      childCataId = String(child.id);
      categories.push(childCataId);
    }
    if (parent.id) {
      parentCataId = String(parent.id);
      categories.push(parentCataId);
    }
    expect(findCategory(child.id)).toMatchObject({ parentId: parent.id });

    expect(api(['category', 'move', childCataId, '--dest-id', '1', '--force']).exitCode).toBe(0);
    expect(findCategory(child.id)).toMatchObject({ parentId: 1 });
  });

  it('uploads a video directly', () => {
    const uploaded = api(['upload', 'file', TINY_MP4, '--mode', 'direct', '--title', `${RUN}-direct`, '--tag', 'cli-it']);
    // Registered before anything is asserted, so a failed assertion still leaves a way to clean it up.
    const vid = /✅ Uploaded (\S+) \(direct\)\n/.exec(uploaded.stdout)?.[1] ?? '';
    if (vid) {
      directVid = vid;
      created.push(directVid);
    }
    expect(uploaded.exitCode).toBe(0);
    expect(uploaded.stderr).toBe('');
    expect(vid).toMatch(/_/);
    expect(uploaded.stdout).toContain(`polyv-vod-cli video wait ${vid} --source <id>`);
  });

  it('discards an interrupted upload, then resumes one from its checkpoint and waits for it', async () => {
    const bigFile = multiPartVideo();
    const abort = ['upload', 'abort', bigFile, '--checkpoint-dir', checkpointDir, '--force'];

    await interruptAfterFirstPart(bigFile);
    expect(checkpoints()).toBe(1);
    expect(api(abort).stdout).toBe(`✅ Interrupted upload of ${bigFile} discarded\n`);
    expect(checkpoints()).toBe(0);
    expect(api(abort).stdout).toBe(`No interrupted upload found for ${bigFile}\n`);

    await interruptAfterFirstPart(bigFile);
    expect(checkpoints()).toBe(1);
    // The resumed run asks for another title. The video was reserved as `${RUN}-chunked` when the
    // first run started, and that is what it is called on the platform.
    const resumedRun = api([
      'upload', 'file', bigFile, '--mode', 'chunked', '--part-size', '1', '--concurrency', '2', '--title', `${RUN}-another-title`,
      '--checkpoint-dir', checkpointDir, '--wait', '--timeout', WAIT_SECONDS, '-o', 'json'
    ]);
    const resumed = resumedRun.stdout ? (JSON.parse(resumedRun.stdout) as JsonUpload) : undefined;
    if (resumed?.vid) {
      chunkedVid = resumed.vid;
      created.push(chunkedVid);
    }
    expect(resumedRun.exitCode).toBe(0);
    expect(resumedRun.stderr).toContain(`ℹ️  Resumed upload: the video keeps the title "${RUN}-chunked" given when the upload was first started`);
    expect(resumed).toMatchObject({ mode: 'chunked', title: `${RUN}-chunked`, resumed: true, parts: 3, state: 'published' });
    // A finished upload leaves nothing to resume.
    expect(checkpoints()).toBe(0);
  });

  it('waits until a video is published', () => {
    const waited = apiJson<JsonUpload>(['video', 'wait', directVid, '--timeout', WAIT_SECONDS]);
    expect(waited).toMatchObject({ state: 'published' });

    // Already published: the wait returns at once.
    expect(api(['video', 'wait', directVid]).stdout).toBe(`✅ Video ${directVid} is published\n`);
  });

  it('shows the videos and finds them in searches', () => {
    const table = api(['video', 'get', directVid]);
    expect(table.exitCode).toBe(0);
    expect(table.stdout).toContain(`${RUN}-direct`);

    // Both videos in one call.
    const both = apiJson<JsonVideo[]>(['video', 'get', directVid, chunkedVid]);
    expect(both.map((video) => video.vid).sort()).toEqual([directVid, chunkedVid].sort());
    for (const video of both) expect(isPublished(video.basicInfo.status)).toBe(true);
    expect(both.map((video) => video.basicInfo.title).sort()).toEqual([`${RUN}-chunked`, `${RUN}-direct`].sort());

    expect(vidsIn(apiJson<JsonSearch>(['video', 'search', '--title', RUN, '--page-size', '50']))).toEqual(
      expect.arrayContaining([directVid, chunkedVid])
    );
    expect(vidsIn(apiJson<JsonSearch>(['video', 'search', '--tag', 'cli-it', '--page-size', '50']))).toContain(directVid);
    expect(apiJson<JsonSearch>(['video', 'search', '--title', `${RUN}-direct`]).videos.map((video) => video.vid)).toEqual([directVid]);
    const nothing = api(['video', 'search', '--title', 'no-video-has-this-title-8f3a']);
    expect(nothing.exitCode).toBe(0);
    expect(nothing.stdout).toContain('0 video(s) in total');

    // Comma-separated ids, and one row per video.
    const sizes = apiJson<Array<{ vid: string; duration: string }>>(['video', 'size', '--vid', `${directVid},${chunkedVid}`]);
    expect(sizes.map((size) => size.vid).sort()).toEqual([directVid, chunkedVid].sort());
    expect(sizes[0].duration).toBe('00:00:01');
  });

  it('updates, moves, bans and unbans a video', () => {
    const refused = api(['video', 'update', directVid, '--title', `${RUN}-renamed`]);
    expect(refused.exitCode).toBe(1);
    expect(refused.stderr).toContain('Re-run it with --force');
    expect(videoOf(directVid).basicInfo.title).toBe(`${RUN}-direct`);

    expect(api(['video', 'update', directVid, '--title', `${RUN}-renamed`, '--description', 'integration test', '--force']).stdout).toBe(
      `✅ Video ${directVid} updated\n`
    );
    expect(videoOf(directVid).basicInfo.title).toBe(`${RUN}-renamed`);

    expect(api(['video', 'move', directVid, '--cata-id', cataid, '--force']).stdout).toBe(`✅ 1 video(s) moved into category ${cataid}\n`);
    expect(videoOf(directVid).basicInfo.cateId).toBe(Number(cataid));
    expect(vidsIn(apiJson<JsonSearch>(['video', 'search', '--cata-id', cataid, '--page-size', '50']))).toContain(directVid);
    expect(findCategory(Number(cataid))?.videos).toBe(1);

    // The platform does not refuse to delete a category that holds a video. The confirmation is
    // where the command says what it would take with it.
    const spelled = api(['category', 'delete', cataid]);
    expect(spelled.exitCode).toBe(1);
    expect(spelled.stderr).toContain(
      `This command will delete category ${cataid} "${RUN}-renamed" (1 video moves to the default category). Re-run it with --force to confirm.`
    );
    expect(findCategory(Number(cataid))).toBeDefined();

    expect(api(['video', 'ban', directVid, '--force']).stdout).toBe('✅ 1 video(s) banned\n');
    expect(api(['video', 'unban', directVid, '--force']).stdout).toBe('✅ 1 video(s) unbanned\n');
    expect(isPublished(videoOf(directVid).basicInfo.status)).toBe(true);
  });

  it('creates a play token', () => {
    const token = apiJson<{ token: string; videoId: string; viewerId: string; ttl: number }>([
      'play', 'token', '--vid', directVid, '--viewer-id', 'cli-it-viewer', '--expires', '300'
    ]);
    expect(token.token).toBeTruthy();
    expect(token).toMatchObject({ videoId: directVid, viewerId: 'cli-it-viewer', ttl: 300_000 });
  });

  it('reports statistics', () => {
    const usage = apiJson<{ userId: string; videoCount: number }>(['stats', 'usage']);
    expect(usage.userId).toBe(account.userId);
    expect(usage.videoCount).toBeGreaterThanOrEqual(2);
    expect(api(['stats', 'usage']).stdout).toContain('usedSpace');

    expect(apiJson<unknown>(['stats', 'play-times', '--dr', '7days'])).toEqual(expect.any(Array));
    const rank = apiJson<{ totalPcVideoView: number }>(['stats', 'rank', '--dr', '7days']);
    expect(rank.totalPcVideoView).toBeGreaterThanOrEqual(0);
    expect(apiJson<unknown>(['stats', 'video-play-times', directVid])).toEqual([{ videoId: directVid, playTimes: 0 }]);
    expect(apiJson<unknown>(['stats', 'video-play-times', directVid, chunkedVid, '--real-time'])).toEqual(
      expect.arrayContaining([{ videoId: directVid, playTimes: 0 }])
    );

    const now = new Date();
    const pad = (value: number): string => String(value).padStart(2, '0');
    const month = `${now.getFullYear()}${pad(now.getMonth() + 1)}`;
    expect(apiJson<unknown>(['stats', 'view-log', '--month', month, '--page-size', '5'])).toEqual(expect.any(Object));
    expect(apiJson<unknown>(['stats', 'view-log', '--day', `${month}${pad(now.getDate())}`, '--page-size', '5'])).toEqual(expect.any(Object));
    const both = api(['stats', 'view-log', '--day', '20260101', '--month', '202601']);
    expect(both.exitCode).toBe(1);
    expect(both.stderr).toContain('Pass either --day or --month, not both');
  });

  it('submits a URL upload, follows the task and removes it', async () => {
    const before = new Set(taskIds());
    const refused = api(['upload', 'url', '--file-url', `https://example.invalid/${RUN}.mp4`, '--title', `${RUN}-url`]);
    expect(refused.exitCode).toBe(1);
    expect(refused.stderr).toContain('Re-run it with --force');
    expect(taskIds().some((id) => !before.has(id))).toBe(false);

    const submitted = api([
      'upload', 'url', '--upload-infos', JSON.stringify([{ fileUrl: `https://example.invalid/${RUN}.mp4`, title: `${RUN}-url` }]), '--force'
    ]);
    expect(submitted.exitCode).toBe(0);
    expect(submitted.stdout).toContain('URL upload submitted');

    const added = taskIds().filter((id) => !before.has(id));
    tasks.push(...added);
    expect(added.length).toBeGreaterThanOrEqual(1);
    for (const taskId of added) {
      // The platform fetches the URLs in the background. Nothing lives at example.invalid.
      const taskOf = async (): Promise<JsonTask | undefined> =>
        (await sdk.upload.listSyncTasks({ pageSize: 50 })).contents.find((task) => task.taskid === taskId);
      await waitFor('the URL-upload task to finish', async () => (await taskOf())?.taskstatus === 'FINISHED');
      expect(apiJson<{ contents: JsonTask[] }>(['upload', 'tasks', '--page-size', '50']).contents.find((task) => task.taskid === taskId)).toMatchObject({
        totalcount: 1,
        failcount: 1,
        taskstatus: 'FINISHED'
      });

      // The CLI prints what the platform gives, to stdout or to a file, and says when that is nothing.
      const expected = await sdk.upload.exportSyncTask(taskId);
      expect(api(['upload', 'task-export', taskId]).stdout).toBe(expected);
      const csv = join(workDir, `${taskId}.csv`);
      const written = api(['upload', 'task-export', taskId, '--out', csv]);
      expect(written.stdout).toBe(`✅ Written to ${csv}\n`);
      expect(readFileSync(csv, 'utf8')).toBe(expected);
      // Every upload in the task failed, so there is nothing to list.
      expect(expected).toBe('');
      expect(written.stderr).toBe('ℹ️  The export is empty: nothing has finished uploading for this task yet, or every upload in it failed.\n');
      expect(api(['upload', 'task-delete', taskId, '--force']).stdout).toBe(`✅ Task ${taskId} deleted\n`);
    }
    expect(taskIds().filter((id) => added.includes(id))).toEqual([]);
    tasks.length = 0;
  }, 3 * 60_000);

  const urlSucceeds = PUBLIC_MP4 ? it : it.skip;

  urlSucceeds('a URL upload that succeeds lists its video in the export, which has no header', async () => {
    const title = `${RUN}-fetched`;
    const before = new Set(taskIds());
    const submitted = api(['upload', 'url', '--upload-infos', JSON.stringify([{ fileUrl: PUBLIC_MP4, title, tag: 'cli-it' }]), '--force']);
    expect(submitted.exitCode).toBe(0);
    const added = taskIds().filter((id) => !before.has(id));
    tasks.push(...added);
    expect(added).toHaveLength(1);
    const taskId = added[0];

    await waitFor(
      'the platform to fetch the video',
      async () => (await sdk.upload.listSyncTasks({ pageSize: 50 })).contents.find((task) => task.taskid === taskId)?.taskstatus === 'FINISHED',
      5 * 60_000
    );
    expect(apiJson<{ contents: JsonTask[] }>(['upload', 'tasks', '--page-size', '50']).contents.find((task) => task.taskid === taskId)).toMatchObject({
      totalcount: 1,
      seccesscount: 1,
      failcount: 0
    });

    // No header, and one line per video: `fileUrl,title,vid,time`.
    const [line] = api(['upload', 'task-export', taskId]).stdout.trimEnd().split(/\r?\n/);
    const [fileUrl, exportedTitle, fetchedVid] = line.split(',');
    if (fetchedVid) created.push(fetchedVid);
    expect(fileUrl).toBe(PUBLIC_MP4);
    expect(exportedTitle).toBe(title);
    expect(fetchedVid).toMatch(/_/);
    // The video is the account's, under the title the task was given.
    expect(videoOf(fetchedVid).basicInfo.title).toBe(title);
    expect(api(['upload', 'task-delete', taskId, '--force']).stdout).toBe(`✅ Task ${taskId} deleted\n`);
    tasks.splice(tasks.indexOf(taskId), 1);
    // Removed here rather than with the rest at the end: later tests count what is left.
    await deleteForGood(fetchedVid);
    created.splice(created.indexOf(fetchedVid), 1);
  }, 8 * 60_000);

  const callbackTest = hasApiCredentials ? it : it.skip;

  callbackTest('reads the callback setting, changes it and puts it back', async () => {
    const read = (): string | null | undefined => apiJson<{ callbackUrl: string | null | undefined }>(['callback', 'get']).callbackUrl;
    // The platform reports "no callback" as null for an account that never had one and as "" after one was cleared.
    const isUnset = (url: string | null | undefined): boolean => url === null || url === undefined || url === '';
    const before = read();
    callbackBefore = before;
    const target = isUnset(before) ? PLACEHOLDER_CALLBACK : (before as string);

    try {
      expect(api(['callback', 'set', '--url', target]).exitCode).toBe(1);
      expect(read()).toBe(before);
      expect(api(['callback', 'set', '--url', 'ftp://example.com/hook', '--force']).exitCode).toBe(1);
      expect(read()).toBe(before);

      expect(api(['callback', 'set', '--url', target, '--force']).stdout).toBe(`✅ Callback URL set to ${target}\n`);
      expect(read()).toBe(target);
      // Seen through the SDK, not only through the CLI.
      expect((await sdk.callback.getCallbackSetting()).callbackUrl).toBe(target);

      expect(api(['callback', 'set', '--force']).stdout).toBe('✅ Callback URL cleared\n');
      expect(isUnset(read())).toBe(true);
    } finally {
      // Through the SDK, so the account is left as it was even when a CLI command is what failed.
      await sdk.callback.updateCallbackSetting(isUnset(before) ? {} : { callbackUrl: before as string });
    }

    const after = read();
    expect(isUnset(after)).toBe(isUnset(before));
    if (!isUnset(before)) expect(after).toBe(before);
    callbackBefore = undefined;
  });

  it('verifies a callback signature offline against the saved secretkey', () => {
    // The documented rule for an `upload` event: MD5 of `upload` + vid + secretkey.
    const sign = createHash('md5').update(`upload${directVid}${account.secretKey}`).digest('hex');
    const args = ['callback', 'verify', '--type', 'upload', '--vid', directVid];

    expect(cli.json([...args, '--sign', sign])).toEqual({ valid: true });
    expect(cli.run([...args, '--sign', sign]).stdout).toBe('✅ Signature valid: the callback comes from the platform\n');

    // The same signature for another video id is a forgery.
    const forged = cli.run(['callback', 'verify', '--type', 'upload', '--vid', chunkedVid, '--sign', sign, '-o', 'json']);
    expect(forged.exitCode).toBe(1);
    expect(JSON.parse(forged.stdout)).toEqual({ valid: false });
    expect(forged.stderr).toContain('Signature invalid');
  });

  callbackTest('reports the signature error of a wrong AppSecret, and keeps stdout clean', () => {
    const result = cli.run([
      'callback', 'get', '--userId', account.userId, '--secretKey', account.secretKey,
      '--appId', String(account.appId), '--appSecret', `${account.appSecret}0`, '--source', SOURCE, '-o', 'json'
    ]);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('签名错误');
    expect(result.stdout + result.stderr).not.toContain(String(account.appSecret));
  });

  it('says which credentials an endpoint lacks', () => {
    cli.run(['account', 'add', 'noapi', '--user-id', account.userId, '--secret-key', account.secretKey]);
    const result = cli.run(['callback', 'get', '--account', 'noapi', '--source', SOURCE, '-o', 'json']);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('This endpoint needs the account API credentials: set appId and appSecret');
  });

  it('deleting a category takes the categories below it with it, and their videos move to the default category', async () => {
    const notFound = api(['category', 'delete', UNKNOWN_CATEGORY, '--force']);
    expect(notFound.exitCode).toBe(1);
    expect(notFound.stderr).toContain(`Category ${UNKNOWN_CATEGORY} was not found`);
    const root = api(['category', 'delete', '1', '--force']);
    expect(root.exitCode).toBe(1);
    expect(root.stderr).toContain('Category 1 is the root category; it cannot be deleted');

    // root → child → category, the lower one holding the video.
    expect(api(['category', 'move', cataid, '--dest-id', childCataId, '--force']).stdout).toBe(`✅ Category ${cataid} moved under category ${childCataId}\n`);
    expect(findCategory(Number(cataid))?.parentId).toBe(Number(childCataId));

    const refused = api(['category', 'delete', childCataId]);
    expect(refused.exitCode).toBe(1);
    expect(refused.stderr).toContain(
      `This command will delete category ${childCataId} "${RUN}-child" (with 1 sub-category; 1 video moves to the default category). ` +
        'Re-run it with --force to confirm.'
    );
    expect(findCategory(Number(childCataId))).toBeDefined();

    expect(api(['category', 'delete', childCataId, '--force']).stdout).toBe(
      `✅ Category ${childCataId} deleted (with 1 sub-category; 1 video moved to the default category)\n`
    );
    // Seen through the SDK: both categories are gone and the video is not.
    const ids = (await flatTree()).map((node) => node.cataid);
    expect(ids).not.toContain(Number(childCataId));
    expect(ids).not.toContain(Number(cataid));
    expect(videoOf(directVid).basicInfo).toMatchObject({ cateId: 1, cateName: '默认分类' });
    expect(isPublished(videoOf(directVid).basicInfo.status)).toBe(true);
    for (const id of [childCataId, cataid]) categories.splice(categories.indexOf(id), 1);
  });

  it('moves a video to the recycle bin only with --force, restores it, then deletes both videos for good', async () => {
    const refused = api(['video', 'delete', directVid]);
    expect(refused.exitCode).toBe(1);
    expect(refused.stderr).toContain('Re-run it with --force');
    expect(await videoExists(directVid)).toBe(true);

    // The platform deletes the ids it knows and lists the others.
    const mixed = api(['video', 'delete', directVid, UNKNOWN_VID, '--force', '-o', 'json']);
    expect(mixed.exitCode).toBe(0);
    expect(JSON.parse(mixed.stdout)).toEqual({ deleted: [directVid], skipped: [UNKNOWN_VID] });
    expect(mixed.stderr).toBe(`⚠️  Not deleted, the platform does not know these ids (a wrong id, or one deleted for good already): ${UNKNOWN_VID}\n`);
    expect(videoOf(directVid).basicInfo.status).toBe(-1);
    expect(api(['video', 'get', directVid]).stdout).toContain('deleted');

    // --strict: an id the platform does not know fails the whole batch, and nothing is deleted.
    const strict = api(['video', 'delete', chunkedVid, UNKNOWN_VID, '--strict', '--force', '-o', 'json']);
    expect(strict.exitCode).toBe(1);
    expect(strict.stdout).toBe('');
    expect(strict.stderr).toContain('❌ The platform does not know some of these video ids, so with --strict nothing was deleted');
    expect(strict.stderr).toContain('drop --strict to delete the ones it knows');
    expect(isPublished(videoOf(chunkedVid).basicInfo.status)).toBe(true);

    // Ids the platform knows none of: refused with or without --strict.
    for (const extra of [[], ['--strict']]) {
      const unknown = api(['video', 'delete', UNKNOWN_VID, '--force', '-o', 'json', ...extra]);
      expect(unknown.exitCode).toBe(1);
      expect(unknown.stdout).toBe('');
      expect(unknown.stderr).toContain('❌ The platform knows none of these video ids, so nothing was deleted');
      expect(unknown.stderr).toContain('Check the ids with: polyv-vod-cli video get <vid> --source <id>');
    }

    expect(api(['video', 'recover', directVid, '--force']).stdout).toBe('✅ 1 video(s) restored\n');
    expect(isPublished(videoOf(directVid).basicInfo.status)).toBe(true);

    expect(apiJson(['video', 'delete', directVid, '--permanent', '--strict', '--force'])).toEqual({ deleted: [directVid], skipped: [] });
    expect(await videoExists(directVid)).toBe(false);
    const gone = api(['video', 'get', directVid]);
    expect(gone.exitCode).toBe(1);
    expect(gone.stdout).toBe('');
    // Deleted for good, so the platform does not know the id any more.
    expect(api(['video', 'delete', directVid, '--force']).stderr).toContain('The platform knows none of these video ids');
    created.splice(created.indexOf(directVid), 1);

    expect(apiJson(['video', 'delete', chunkedVid, '--force'])).toEqual({ deleted: [chunkedVid], skipped: [] });
    expect(apiJson(['video', 'delete', chunkedVid, '--permanent', '--force'])).toEqual({ deleted: [chunkedVid], skipped: [] });
    expect(await videoExists(chunkedVid)).toBe(false);
    created.splice(created.indexOf(chunkedVid), 1);
    expect(created).toEqual([]);
  });

  it('deletes the categories that are left', async () => {
    const refused = api(['category', 'delete', parentCataId]);
    expect(refused.exitCode).toBe(1);
    expect(refused.stderr).toContain('Re-run it with --force');

    expect(api(['category', 'delete', parentCataId, '--force']).stdout).toBe(`✅ Category ${parentCataId} deleted\n`);
    // Seen through the SDK: a delete that answers 200 does not prove the category is gone.
    const ids = (await flatTree()).map((node) => node.cataid);
    for (const id of categories) expect(ids).not.toContain(Number(id));
    categories.length = 0;
  });

  it('logs the connector account out and removes the saved account', () => {
    cli.run(['account', 'add', 'workbuddy', '--user-id', account.userId, '--secret-key', account.secretKey]);
    expect(cli.run(['auth', 'status']).stdout).toBe(`Logged in (${ACCOUNT})\n`);
    expect(cli.run(['auth', 'logout']).stdout).toBe('✅ Logged out (removed account "workbuddy")\n');
    expect(cli.json(['use', '--list'])).toEqual([
      { name: ACCOUNT, userId: account.userId },
      { name: 'noapi', userId: account.userId }
    ]);

    expect(cli.run(['account', 'remove', ACCOUNT, '--force']).stdout).toBe(`✅ Account "${ACCOUNT}" removed\n`);
    // What is left is saved, but neither the default nor chosen.
    expect(cli.run(['auth', 'status']).exitCode).toBe(1);
    expect(cli.json(['account', 'list'])).toEqual([
      { name: 'noapi', userId: account.userId, default: '', writeToken: 'no', apiCredentials: 'no', createdAt: expect.any(String) }
    ]);
  });
});
