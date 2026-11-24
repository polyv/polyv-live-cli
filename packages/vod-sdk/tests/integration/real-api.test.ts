/**
 * Real-account tests for the SDK.
 *
 * Skipped unless POLYV_VOD_USER_ID, POLYV_VOD_SECRET_KEY and POLYV_VOD_WRITE_TOKEN are set
 * (copy `.env.example` to `.env.test`). Use a test account: they upload and delete temporary
 * videos and create and delete a temporary category.
 *
 * Every video and category created here is removed afterwards, and the removal is verified by
 * fetching each object: a delete call that answers 200 does not mean the object is gone.
 */
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';
import { afterAll, describe, expect, it } from 'vitest';

import { isPublished, isVideoNotFound, MIN_PART_SIZE, PolyVVodClient } from '../../src/index.js';

loadDotenv({ path: fileURLToPath(new URL('../../.env.test', import.meta.url)) });

const userId = process.env.POLYV_VOD_USER_ID;
const secretKey = process.env.POLYV_VOD_SECRET_KEY;
const writeToken = process.env.POLYV_VOD_WRITE_TOKEN;
const real = userId && secretKey && writeToken ? describe.sequential : describe.skip;

const TINY_MP4 = fileURLToPath(new URL('../fixtures/tiny.mp4', import.meta.url));
const RUN = `sdk-it-${Date.now()}`;
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Whether the platform still knows a video. */
async function videoExists(client: PolyVVodClient, vid: string): Promise<boolean> {
  try {
    await client.video.getVideoInfo(vid);
    return true;
  } catch (error) {
    if (isVideoNotFound(error)) return false;
    throw error;
  }
}

/**
 * Deletes a video for good and only resolves once the platform no longer knows it.
 *
 * A video that was just uploaded may be skipped for a while ("still processing"), hence the
 * retries; the final answer is always a lookup, never the delete call's own success.
 */
async function deleteForGood(client: PolyVVodClient, vid: string): Promise<void> {
  let last = 'not attempted';
  for (let attempt = 0; attempt < 18; attempt += 1) {
    try {
      await client.video.deleteVideos(vid, { deleteType: 1 });
      const { skipped } = await client.video.deleteVideos(vid, { deleteType: 2 });
      if (skipped.length === 0 && !(await videoExists(client, vid))) return;
      last = skipped.length > 0 ? 'skipped by the platform' : 'still listed after the delete';
    } catch (error) {
      last = (error as Error).message;
    }
    await sleep(10_000);
  }
  throw new Error(`could not delete video ${vid}: ${last}`);
}

async function deleteCategoryForGood(client: PolyVVodClient, cataid: string): Promise<void> {
  await client.category.deleteCategory(cataid);
  const tree = JSON.stringify(await client.category.getCategories());
  if (tree.includes(`"cataid":${cataid}`)) throw new Error(`category ${cataid} is still listed after the delete`);
}

real('polyv-vod-api-sdk against the real platform', () => {
  const client = new PolyVVodClient({
    userId,
    secretKey,
    writeToken,
    appId: process.env.POLYV_VOD_APP_ID,
    appSecret: process.env.POLYV_VOD_APP_SECRET,
    rateLimit: false
  });
  const created: string[] = [];
  let cataid = '';
  let directVid = '';
  let workDir = '';

  afterAll(async () => {
    const failures: string[] = [];
    // Videos go first: a category cannot be deleted while it holds videos.
    for (const vid of created) {
      await deleteForGood(client, vid).catch((error: unknown) => failures.push(`${vid}: ${(error as Error).message}`));
    }
    if (cataid) await deleteCategoryForGood(client, cataid).catch((error: unknown) => failures.push(`category ${cataid}: ${(error as Error).message}`));
    if (workDir) await rm(workDir, { recursive: true, force: true });
    if (failures.length > 0) throw new Error(`cleanup left objects in the test account:\n${failures.join('\n')}`);
  }, 600_000);

  it('lists the category tree', async () => {
    const tree = await client.category.getCategories();
    expect(tree.some((node) => node.cataid === 1)).toBe(true);
  });

  it('creates a temporary category', async () => {
    const added = await client.category.addCategory({ cataname: RUN, parentid: 1 });
    expect(added.cataid).toBeGreaterThan(1);
    cataid = String(added.cataid);
    await client.category.renameCategory({ cataid, cataname: `${RUN}-renamed` });
    const tree = await client.category.getCategories();
    expect(JSON.stringify(tree)).toContain(`${RUN}-renamed`);
  });

  it('uploads a small video directly', async () => {
    const result = await client.upload.uploadFile({ filePath: TINY_MP4, title: `${RUN}-direct`, tag: 'sdk-it' });
    expect(result.mode).toBe('direct');
    expect(result.vid).toMatch(/_/);
    directVid = result.vid;
    created.push(result.vid);
  });

  /**
   * A real video large enough for three parts: the fixture clip written out several times.
   * The platform reads the first clip in the file, so the upload is a valid video.
   */
  async function multiPartVideo(name: string): Promise<string> {
    workDir ??= await mkdtemp(join(tmpdir(), 'polyv-vod-sdk-it-'));
    const clip = await readFile(TINY_MP4);
    const copies = Math.ceil((MIN_PART_SIZE * 2 + 40_000) / clip.length);
    const path = join(workDir, name);
    await writeFile(path, Buffer.concat(Array.from({ length: copies }, () => clip)));
    return path;
  }

  it('uploads through the resumable protocol in several parts', async () => {
    const bigFile = await multiPartVideo('sample.mp4');
    const progress: number[] = [];

    const result = await client.upload.uploadFile({
      filePath: bigFile,
      title: `${RUN}-chunked`,
      mode: 'chunked',
      partSize: MIN_PART_SIZE,
      checkpointDir: join(workDir, 'checkpoints'),
      onProgress: (event) => progress.push(event.uploadedParts ?? 0)
    });

    expect(result).toMatchObject({ mode: 'chunked', parts: 3, resumed: false });
    created.push(result.vid);
    expect(Math.max(...progress)).toBe(3);
    // The record is visible right away, before transcoding.
    const info = await client.video.getVideo(result.vid);
    expect(info?.basicInfo.title).toBe(`${RUN}-chunked`);
  });

  it('resumes an interrupted upload from its checkpoint', async () => {
    const resumedFile = await multiPartVideo('resumed.mp4');
    const options = { filePath: resumedFile, title: `${RUN}-resumed`, mode: 'chunked' as const, partSize: MIN_PART_SIZE, checkpointDir: join(workDir, 'checkpoints') };
    const controller = new AbortController();

    await expect(
      client.upload.uploadFile({
        ...options,
        concurrency: 1,
        signal: controller.signal,
        onProgress: (event) => {
          if ((event.uploadedParts ?? 0) >= 1) controller.abort();
        }
      })
    ).rejects.toMatchObject({ name: 'AbortError' });

    const result = await client.upload.uploadFile({ ...options, concurrency: 1 });
    expect(result).toMatchObject({ resumed: true, parts: 3 });
    created.push(result.vid);
  });

  it('waits until the direct upload is published', async () => {
    const outcome = await client.video.waitUntilPublished(directVid, { timeoutMs: 5 * 60_000 });
    expect(outcome.state).toBe('published');
  }, 6 * 60_000);

  it('reads, updates, moves and bans the video', async () => {
    await client.video.updateVideoInfo({ vid: directVid, title: `${RUN}-renamed`, description: 'integration test' });
    const info = (await client.video.getVideo(directVid)) as NonNullable<Awaited<ReturnType<typeof client.video.getVideo>>>;
    expect(info.basicInfo.title).toBe(`${RUN}-renamed`);

    await client.video.moveVideos({ vids: directVid, cataId: cataid });
    expect((await client.video.getVideo(directVid))?.basicInfo.cateId).toBe(Number(cataid));

    await client.video.setForbidden({ vids: directVid, forbidden: true });
    await client.video.setForbidden({ vids: directVid, forbidden: false });

    const sizes = await client.video.getDurationAndSize({ vids: directVid });
    expect(sizes[0]?.videos[0]).toMatchObject({ vid: directVid, duration: '00:00:01' });
    expect(sizes[0]?.videos[0]?.filesize1).toBeGreaterThan(0);

    const found = await client.video.searchVideos({ title: RUN, pageSize: 50 });
    expect(found.contents.map((item) => item.vid)).toContain(directVid);
  });

  it('creates a play token', async () => {
    const token = await client.playSafe.createPlayToken({ videoId: directVid, viewerId: 'sdk-it-viewer', expires: 300 });
    expect(token.token).toBeTruthy();
    expect(token.videoId).toBe(directVid);
    expect(token.ttl).toBe(300_000);
  });

  it('reports statistics', async () => {
    const usage = await client.statistics.getAccountUsage();
    expect(usage.userId).toBe(userId);
    expect(await client.statistics.getVideoPlayTimes(directVid)).toEqual([{ vid: directVid, times: 0 }]);
    expect(Array.isArray(await client.statistics.getPlayTimes({ dr: '7days' }))).toBe(true);
    const rank = await client.statistics.getPlayTimesRank({ dr: '7days' });
    expect(rank.totalPcVideoView).toBeGreaterThanOrEqual(0);

    const now = new Date();
    const pad = (value: number): string => String(value).padStart(2, '0');
    expect(Array.isArray(await client.statistics.getMonthlyViewLog({ month: `${now.getFullYear()}${pad(now.getMonth() + 1)}`, pageSize: 1 }))).toBe(true);
    await client.statistics.getDailyViewLog({ day: `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` });
  });

  it('submits a URL upload and removes the task it created', async () => {
    const before = new Set((await client.upload.listSyncTasks({ pageSize: 50 })).contents.map((task) => task.taskid));
    await client.upload.uploadByUrl({ uploadInfos: [{ fileUrl: `https://example.invalid/${RUN}.mp4`, title: `${RUN}-url` }] });
    const createdTasks = (await client.upload.listSyncTasks({ pageSize: 50 })).contents.filter((task) => !before.has(task.taskid));
    for (const task of createdTasks) await client.upload.deleteSyncTask(task.taskid);
  });

  it('recycles, restores and finally deletes the videos', async () => {
    const recycled = await client.video.deleteVideos(directVid, { deleteType: 1 });
    expect(recycled.skipped).toEqual([]);
    expect((await client.video.getVideo(directVid))?.basicInfo.status).toBe(-1);
    await client.video.recoverVideos(directVid);
    // A restored video comes back published; the platform reports 61 for it.
    expect(isPublished((await client.video.getVideo(directVid))?.basicInfo.status ?? 0)).toBe(true);

    for (const vid of created) {
      await deleteForGood(client, vid);
      expect(await videoExists(client, vid)).toBe(false);
    }
    created.length = 0;
  }, 4 * 60_000);
});
