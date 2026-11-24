import { describe, expect, it } from 'vitest';

import { PolyVVodError } from '../errors/index.js';
import { normalizeVids, parseSkippedVids } from './video.service.js';
import { clientWith, envelope, jsonResponse, recordedFetch, SECRET_KEY, USER_ID } from '../__tests__/helpers.js';
import { signMd5, signSha1 } from '../auth/signature.js';

const signedOf = (params: URLSearchParams): Record<string, string> =>
  Object.fromEntries([...params.entries()].filter(([key]) => key !== 'sign'));

describe('VideoService', () => {
  it('maps the search filters onto the query string', async () => {
    const http = recordedFetch();
    await clientWith(http).video.searchVideos({ filters: ['basicInfo', 'metaData'], title: '课程', containSubCate: false, encrypted: true, pageSize: 5, page: 2 });
    const params = http.calls[0].params;
    expect(http.calls[0].url.pathname).toBe('/v2/video/search-videos');
    expect(params.get('filters')).toBe('basicInfo,metaData');
    expect(params.get('title')).toBe('课程');
    expect(params.get('containSubCate')).toBe('false');
    expect(params.get('encrypted')).toBe('true');
    expect(params.get('pageSize')).toBe('5');
    expect(params.has('cataId')).toBe(false);
  });

  it('joins vids and limits them to 100 for get-video-info', async () => {
    const http = recordedFetch();
    await clientWith(http).video.getVideoInfo([' a_1 ', 'b_1', '']);
    expect(http.calls[0].url.pathname).toBe('/v2/video/userid123/get-video-info');
    expect(http.calls[0].params.get('vid')).toBe('a_1,b_1');

    await expect(clientWith(http).video.getVideoInfo([])).rejects.toThrow('at least one video id');
    await expect(clientWith(http).video.getVideoInfo(Array.from({ length: 101 }, (_, i) => `v${i}`))).rejects.toThrow('at most 100');
    await expect(clientWith(http).video.getVideo('')).rejects.toThrow('vid is required');
  });

  it('returns the first item from getVideo', async () => {
    const http = recordedFetch(() => jsonResponse(envelope([{ vid: 'v_1' }])));
    await expect(clientWith(http).video.getVideo('v_1')).resolves.toEqual({ vid: 'v_1' });
    const empty = clientWith(recordedFetch(() => jsonResponse(envelope([]))));
    await expect(empty.video.getVideo('v_1')).resolves.toBeUndefined();
  });

  it('updates title, description and tag in the form body', async () => {
    const http = recordedFetch();
    await clientWith(http).video.updateVideoInfo({ vid: 'v_1', title: '新标题', description: '简介', tag: 'a,b' });
    const params = http.calls[0].params;
    expect(http.calls[0].url.pathname).toBe('/v2/video/userid123/video-info');
    expect(params.get('describ')).toBe('简介');
    expect(params.get('title')).toBe('新标题');
    await expect(clientWith(http).video.updateVideoInfo({ vid: '' })).rejects.toThrow('vid is required');
  });

  it('deletes to the recycle bin by default and lists the vids the platform skipped', async () => {
    const http = recordedFetch(() => jsonResponse(envelope(['v_1', 'v_2'])));
    await expect(clientWith(http).video.deleteVideos('v_1,v_2')).resolves.toEqual({ skipped: ['v_1', 'v_2'] });
    expect(http.calls[0].url.pathname).toBe('/v2/video/del-videos');
    expect(http.calls[0].params.get('deleteType')).toBe('1');
    expect(http.calls[0].params.get('ignoreInvalidVids')).toBe('Y');
  });

  it('can delete permanently and refuse to skip invalid vids', async () => {
    const http = recordedFetch(() => jsonResponse(envelope('')));
    await expect(clientWith(http).video.deleteVideos('v_1', { deleteType: 2, ignoreInvalidVids: false })).resolves.toEqual({ skipped: [] });
    expect(http.calls[0].params.get('deleteType')).toBe('2');
    expect(http.calls[0].params.get('ignoreInvalidVids')).toBe('N');
  });

  it('restores, moves, bans and unbans through their endpoints', async () => {
    const http = recordedFetch();
    const video = clientWith(http).video;

    await video.recoverVideos(['v_1', 'v_2']);
    expect(http.calls[0].url.pathname).toBe('/v2/video/userid123/recover-videos');
    expect(http.calls[0].params.get('vids')).toBe('v_1,v_2');

    await video.moveVideos({ vids: 'v_1', cataId: 9 });
    const move = http.calls[1];
    expect(move.url.pathname).toBe('/v2/video/userid123/changeCata');
    expect(move.params.get('sign')).toBe(signSha1({ userid: USER_ID, vids: 'v_1', cataid: '9', ptime: move.params.get('ptime') }, SECRET_KEY));

    await video.setForbidden({ vids: 'v_1', forbidden: true });
    expect(http.calls[2].url.pathname).toBe('/v2/video/userid123/forbidden');
    expect(http.calls[2].params.get('forbidden')).toBe('1');
    await video.setForbidden({ vids: 'v_1', forbidden: false });
    expect(http.calls[3].params.get('forbidden')).toBe('0');

    await video.getDurationAndSize({ cataId: '1,2' });
    expect(http.calls[4].url.pathname).toBe('/v2/video/userid123/getSizeByCata');
    expect(http.calls[4].params.get('cataid')).toBe('1,2');

    await expect(video.moveVideos({ vids: 'v_1', cataId: '' })).rejects.toThrow('cataId is required');
    await expect(video.getDurationAndSize({})).rejects.toThrow('Pass vids, cataId, or both');
  });
});

describe('normalizeVids', () => {
  it('accepts a list or a comma-separated string and trims blanks', () => {
    expect(normalizeVids(' a, b ,,c ', 5)).toBe('a,b,c');
    expect(normalizeVids(['a'], 5)).toBe('a');
    expect(() => normalizeVids(undefined as unknown as string, 5, 'vids')).toThrow('vids must contain at least one video id');
    expect(() => normalizeVids([], 5)).toThrow(PolyVVodError);
    expect(() => normalizeVids(['a', 'b'], 1)).toThrow('at most 1');
  });
});

describe('parseSkippedVids', () => {
  it('reads an empty, array, string and object list', () => {
    expect(parseSkippedVids(undefined)).toEqual([]);
    expect(parseSkippedVids(null)).toEqual([]);
    expect(parseSkippedVids('')).toEqual([]);
    expect(parseSkippedVids(['a', 'b'])).toEqual(['a', 'b']);
    expect(parseSkippedVids('a,b c')).toEqual(['a', 'b', 'c']);
    expect(parseSkippedVids([{ vid: 'a' }, { vid: 'b' }])).toEqual(['a', 'b']);
  });
});

describe('CategoryService', () => {
  it('signs the category tree over userid and ptime only', async () => {
    const http = recordedFetch();
    await clientWith(http).category.getCategories(1617160372987);
    const params = http.calls[0].params;
    expect(http.calls[0].url.pathname).toBe('/v2/video/userid123/cataJson');
    expect(params.get('cataid')).toBe('1617160372987');
    expect(params.get('sign')).toBe(signSha1({ userid: USER_ID, ptime: params.get('ptime') }, SECRET_KEY));
  });

  it('defaults the tree to the root category', async () => {
    const http = recordedFetch();
    await clientWith(http).category.getCategories();
    expect(http.calls[0].params.get('cataid')).toBe('1');
  });

  it('adds a category under a parent', async () => {
    const http = recordedFetch();
    await clientWith(http).category.addCategory({ cataname: ' 新分类 ', parentid: '1' });
    const params = http.calls[0].params;
    expect(http.calls[0].url.pathname).toBe('/v2/video/userid123/addCata');
    expect(params.get('cataname')).toBe('新分类');
    expect(params.get('parentid')).toBe('1');
  });

  it('validates the category name', async () => {
    const http = recordedFetch();
    await expect(clientWith(http).category.addCategory({ cataname: '  ', parentid: 1 })).rejects.toThrow('cataname is required');
    await expect(clientWith(http).category.addCategory({ cataname: 'x'.repeat(41), parentid: 1 })).rejects.toThrow('40 characters');
    await expect(clientWith(http).category.renameCategory({ cataid: 1, cataname: '' })).rejects.toThrow('cataname is required');
    expect(http.calls).toHaveLength(0);
  });

  it('signs rename and delete over their fixed key sets', async () => {
    const http = recordedFetch();
    await clientWith(http).category.renameCategory({ cataid: '7', cataname: '改名' });
    const rename = http.calls[0].params;
    expect(http.calls[0].url.pathname).toBe('/v2/video/userid123/updateCata');
    expect(rename.get('sign')).toBe(signSha1({ userid: USER_ID, cataname: '改名', cataid: '7', ptime: rename.get('ptime') }, SECRET_KEY));

    await clientWith(http).category.deleteCategory('7');
    const remove = http.calls[1].params;
    expect(http.calls[1].url.pathname).toBe('/v2/video/userid123/deleteCata');
    expect(remove.get('sign')).toBe(signSha1({ userid: USER_ID, cataid: '7', ptime: remove.get('ptime') }, SECRET_KEY));
  });

  it('updates settings and moves a category', async () => {
    const http = recordedFetch();
    await clientWith(http).category.updateCategorySetting({ cataid: 7, isSettings: true, keepSource: false, encrypt: true, hlslevel: 'app', isEdu: false, encodeAac: true, playerId: 'p' });
    const params = http.calls[0].params;
    expect(http.calls[0].url.pathname).toBe('/v2/video/userid123/updateCataProfile');
    expect(params.get('isSettings')).toBe('Y');
    expect(params.get('keepSource')).toBe('0');
    expect(params.get('encrypt')).toBe('1');
    expect(params.get('hlslevel')).toBe('app');
    expect(params.get('isEdu')).toBe('0');
    expect(params.get('encode_aac')).toBe('1');
    expect(params.get('playerId')).toBe('p');

    await clientWith(http).category.moveCategory({ cataid: 7, destCataid: 1 });
    expect(http.calls[1].url.pathname).toBe('/v2/cata/userid123/change');
    expect(http.calls[1].params.get('destCataid')).toBe('1');

    await expect(clientWith(http).category.deleteCategory(undefined as unknown as string)).rejects.toThrow('cataId is required');
    await expect(clientWith(http).category.updateCategorySetting({ cataid: '' })).rejects.toThrow('cataId is required');
    await expect(clientWith(http).category.moveCategory({ cataid: 1, destCataid: null as unknown as string })).rejects.toThrow('cataId is required');
  });
});

describe('PlaySafeService', () => {
  it('signs the play token with MD5 over every sent parameter', async () => {
    const http = recordedFetch();
    await clientWith(http).playSafe.createPlayToken({ videoId: 'v_1', viewerId: 'viewer1', expires: 300, disposable: true, iswxa: false });
    const [call] = http.calls;
    expect(call.url.origin).toBe('https://hls.videocc.net');
    expect(call.url.pathname).toBe('/service/v1/token');
    expect(call.params.get('userid')).toBe(USER_ID);
    expect(call.params.get('videoId')).toBe('v_1');
    expect(call.params.get('disposable')).toBe('true');
    expect(call.params.get('iswxa')).toBe('0');
    expect(call.params.get('sign')).toBe(signMd5(signedOf(call.params), SECRET_KEY));
  });

  it('validates its input', async () => {
    const http = recordedFetch();
    const playSafe = clientWith(http).playSafe;
    await expect(playSafe.createPlayToken({ videoId: '', viewerId: 'v' })).rejects.toThrow('videoId is required');
    await expect(playSafe.createPlayToken({ videoId: 'v_1', viewerId: '' })).rejects.toThrow('viewerId is required');
    await expect(playSafe.createPlayToken({ videoId: 'v_1', viewerId: 'not allowed!' })).rejects.toThrow('viewerId must consist of');
    await expect(playSafe.createPlayToken({ videoId: 'v_1', viewerId: 'v', expires: 0 })).rejects.toThrow('between 1 second and 24 hours');
    await expect(playSafe.createPlayToken({ videoId: 'v_1', viewerId: 'v', expires: 24 * 3600 + 1 })).rejects.toThrow('between 1 second and 24 hours');
    expect(http.calls).toHaveLength(0);
    // Hyphens and underscores are accepted, as the platform takes them.
    await expect(playSafe.createPlayToken({ videoId: 'v_1', viewerId: 'viewer-1_A' })).resolves.toBeDefined();
  });
});

describe('StatisticsService', () => {
  it('reads usage, play counts and rankings', async () => {
    const http = recordedFetch();
    const statistics = clientWith(http).statistics;

    await statistics.getAccountUsage('2026-11-25');
    expect(http.calls[0].url.pathname).toBe('/v2/user/userid123/main');
    expect(http.calls[0].params.get('date')).toBe('2026-11-25');
    await statistics.getAccountUsage();
    expect(http.calls[1].params.has('date')).toBe(false);
    await expect(statistics.getAccountUsage('2026-11-25T00:00:00Z')).rejects.toThrow('yyyy-MM-dd');

    await statistics.getVideoPlayTimes('a_1,b_1', true);
    expect(http.calls[2].url.pathname).toBe('/v2/data/userid123/play-times');
    expect(http.calls[2].params.get('realTime')).toBe('1');
    await expect(statistics.getVideoPlayTimes([])).rejects.toThrow('at least one video id');

    await statistics.getPlayTimes({ vid: 'a_1', dr: '7days', period: 'daily' });
    expect(http.calls[3].url.pathname).toBe('/v2/videoview/userid123');
    expect(http.calls[3].params.get('dr')).toBe('7days');
    await expect(statistics.getPlayTimes({ period: 'monthly', dr: '7days' })).rejects.toThrow('this_month or last_month');

    await statistics.getPlayTimesRank({ start: '2026-11-01', end: '2026-11-25' });
    expect(http.calls[4].url.pathname).toBe('/v2/videoview/userid123/ranklist');
    expect(http.calls[4].params.get('start')).toBe('2026-11-01');
    await expect(statistics.getPlayTimesRank({ start: '11/01' })).rejects.toThrow('yyyy-MM-dd');
    await expect(statistics.getPlayTimesRank({ end: 'yesterday' })).rejects.toThrow('yyyy-MM-dd');
  });

  it('signs the daily view log over userid, day and ptime', async () => {
    const http = recordedFetch();
    await clientWith(http).statistics.getDailyViewLog({ day: '20261125', pageNum: 1, pageSize: 5 });
    const params = http.calls[0].params;
    expect(http.calls[0].url.pathname).toBe('/v2/data/userid123/viewlog');
    expect(params.get('pageSize')).toBe('5');
    expect(params.get('sign')).toBe(signSha1({ userid: USER_ID, day: '20261125', ptime: params.get('ptime') }, SECRET_KEY));
    await expect(clientWith(http).statistics.getDailyViewLog({ day: '2026-11-25' })).rejects.toThrow('yyyyMMdd');
  });

  it('sends month in the path and as a parameter, and names the page size pageSize', async () => {
    const http = recordedFetch();
    await clientWith(http).statistics.getMonthlyViewLog({ month: '202611', pageNum: 2, pageSize: 3 });
    const params = http.calls[0].params;
    expect(http.calls[0].url.pathname).toBe('/v2/viewlog/userid123/monthly/202611');
    expect(params.get('month')).toBe('202611');
    expect(params.get('pageSize')).toBe('3');
    expect(params.has('numPerPage')).toBe(false);
    expect(params.get('sign')).toBe(signSha1(signedOf(params), SECRET_KEY));
    await expect(clientWith(http).statistics.getMonthlyViewLog({ month: '2026' })).rejects.toThrow('yyyyMM');
  });
});

describe('CallbackService', () => {
  it('reads and updates the setting through the V4 credential', async () => {
    const http = recordedFetch();
    const callback = clientWith(http, { appId: 'app1', appSecret: 'app-secret' }).callback;

    await callback.getCallbackSetting();
    expect(http.calls[0].url.pathname).toBe('/vod/v4/user/setting/callback/get');
    expect(http.calls[0].params.get('appId')).toBe('app1');

    await callback.updateCallbackSetting({ callbackUrl: 'https://example.com/cb' });
    expect(http.calls[1].url.pathname).toBe('/vod/v4/user/setting/callback/update');
    expect(http.calls[1].params.get('callbackUrl')).toBe('https://example.com/cb');
    expect(http.calls[1].url.search).toContain('callbackUrl=');

    await callback.updateCallbackSetting();
    expect(http.calls[2].params.has('callbackUrl')).toBe(false);
  });

  it('fails with a hint when the API credentials are missing', async () => {
    const http = recordedFetch();
    await expect(clientWith(http).callback.getCallbackSetting()).rejects.toMatchObject({ kind: 'auth' });
  });

  it('verifies callback signatures with the account secretkey', () => {
    const callback = clientWith(recordedFetch(), { secretKey: '7UagtQOq2A' }).callback;
    const input = { sign: 'b245e3e65aa45b60dc02337b5cd914a7', type: 'upload', vid: 'e2e84a738302f20a4f6eb202976f5c63_e' };
    expect(callback.verifySignature(input)).toBe(true);
    expect(clientWith(recordedFetch(), { secretKey: 'other' }).callback.verifySignature(input)).toBe(false);
  });
});

describe('UploadService endpoint helpers', () => {
  const client = () => clientWith(recordedFetch(), { writeToken: 'wt' });

  it('issues the signature the browser upload SDK expects', () => {
    expect(client().upload.createBrowserUploadSignature()).toMatchObject({ sign: expect.stringMatching(/^[0-9a-f]{32}$/), hash: expect.stringMatching(/^[0-9a-f]{32}$/) });
    expect(() => clientWith(recordedFetch()).upload.createBrowserUploadSignature()).toThrow(PolyVVodError);
  });

  it('submits URL uploads as a JSON array and can list, export and delete the tasks', async () => {
    const http = recordedFetch(({ url }) => (url.pathname.includes('/export') ? new Response('vid,title\nv_1,a\n') : jsonResponse(envelope('ok'))));
    const upload = clientWith(http).upload;

    await upload.uploadByUrl({ cataId: 1, luping: true, uploadInfos: [{ fileUrl: 'https://example.com/a.mp4', title: 'A' }] });
    const submit = http.calls[0];
    expect(submit.url.pathname).toBe('/v2/video/grab/userid123/upload/multi');
    expect(submit.params.get('uploadInfos')).toBe('[{"fileUrl":"https://example.com/a.mp4","title":"A"}]');
    expect(submit.params.get('luping')).toBe('1');
    expect(submit.params.has('fileUrl')).toBe(false);
    expect(submit.params.get('sign')).toBe(signSha1(signedOf(submit.params), SECRET_KEY));

    await upload.uploadByUrl({ fileUrl: 'https://example.com/a.mp4,https://example.com/b.mp4', title: 'A,B' });
    expect(http.calls[1].params.get('fileUrl')).toContain('b.mp4');
    expect(http.calls[1].params.has('uploadInfos')).toBe(false);

    await upload.listSyncTasks({ page: 2, pageSize: 5 });
    expect(http.calls[2].url.pathname).toBe('/v2/video/grab/userid123/list');
    expect(http.calls[2].params.get('pageSize')).toBe('5');

    await expect(upload.exportSyncTask('task-1')).resolves.toBe('vid,title\nv_1,a\n');
    expect(http.calls[3].url.pathname).toBe('/v2/video/grab/userid123/listVideos/export');
    expect(http.calls[3].params.get('taskId')).toBe('task-1');

    await upload.deleteSyncTask('task-1');
    expect(http.calls[4].url.pathname).toBe('/v2/video/grab/userid123/delete');
  });

  it('validates URL uploads and task ids', async () => {
    const http = recordedFetch();
    const upload = clientWith(http).upload;
    const bad = (uploadInfos: unknown) => upload.uploadByUrl({ uploadInfos } as never);
    await expect(upload.uploadByUrl({})).rejects.toThrow('Pass uploadInfos or fileUrl');
    await expect(bad(Array.from({ length: 101 }, () => ({ fileUrl: 'https://a/1.mp4', title: 't' })))).rejects.toThrow('at most 100');
    await expect(bad([{ fileUrl: 'ftp://a/1.mp4', title: 't' }])).rejects.toThrow('http(s) URL');
    await expect(bad([{ fileUrl: `https://a/${'x'.repeat(1000)}.mp4`, title: 't' }])).rejects.toThrow('1000 characters');
    await expect(bad([{ fileUrl: 'https://a/1.mp4', title: '' }])).rejects.toThrow('title is required');
    await expect(bad([{ fileUrl: 'https://a/1.mp4', title: 'x'.repeat(101) }])).rejects.toThrow('100 characters');
    await expect(bad([{ fileUrl: 'https://a/1.mp4', title: 't', state: 'x'.repeat(101) }])).rejects.toThrow('100 characters');
    await expect(bad([{ fileUrl: 'https://a/1.mp4', title: 't', tag: 'x'.repeat(201) }])).rejects.toThrow('200 characters');
    await expect(upload.exportSyncTask('')).rejects.toThrow('taskId is required');
    await expect(upload.deleteSyncTask('')).rejects.toThrow('taskId is required');
    expect(http.calls).toHaveLength(0);
  });
});
