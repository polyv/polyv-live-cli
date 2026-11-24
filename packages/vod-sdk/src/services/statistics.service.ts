/**
 * Statistics endpoints.
 *
 * @module services/statistics
 */

import type { PolyVVodClient } from '../client.js';
import { PolyVVodError } from '../errors/index.js';
import type {
  AccountUsage,
  DailyViewLogParams,
  MonthlyViewLogPage,
  MonthlyViewLogParams,
  PlayTimesItem,
  PlayTimesParams,
  PlayTimesRank,
  PlayTimesRankParams,
  VideoPlayTimes
} from '../types/playsafe.js';

export class StatisticsService {
  constructor(private readonly client: PolyVVodClient) {}

  /** Space and traffic usage, for one day (`yyyy-MM-dd`) or since the current plan started. */
  async getAccountUsage(date?: string): Promise<AccountUsage> {
    if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new PolyVVodError('validation', 'date must be formatted yyyy-MM-dd');
    }
    return this.client.request({
      method: 'POST',
      path: '/v2/user/{userid}/main',
      params: { date },
      idempotent: true
    });
  }

  /** Total play count of specific videos. */
  async getVideoPlayTimes(vids: string | string[], realTime = false): Promise<VideoPlayTimes[]> {
    const list = (Array.isArray(vids) ? vids : String(vids ?? '').split(',')).map((vid) => vid.trim()).filter(Boolean);
    if (list.length === 0) throw new PolyVVodError('validation', 'vids must contain at least one video id');
    return this.client.request({
      method: 'POST',
      path: '/v2/data/{userid}/play-times',
      params: { vids: list.join(','), realTime: realTime ? 1 : 0 },
      idempotent: true
    });
  }

  /** Play counts per day, week or month, for one video or for the whole account. */
  async getPlayTimes(params: PlayTimesParams = {}): Promise<PlayTimesItem[]> {
    if (params.period && params.period !== 'daily' && params.dr !== 'this_month' && params.dr !== 'last_month') {
      throw new PolyVVodError('validation', 'period weekly or monthly needs dr to be this_month or last_month');
    }
    return this.client.request({
      method: 'GET',
      path: '/v2/videoview/{userid}',
      params: { vid: params.vid, dr: params.dr, period: params.period }
    });
  }

  async getPlayTimesRank(params: PlayTimesRankParams = {}): Promise<PlayTimesRank> {
    for (const bound of [params.start, params.end]) {
      if (bound !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(bound)) {
        throw new PolyVVodError('validation', 'start and end must be formatted yyyy-MM-dd');
      }
    }
    return this.client.request({ method: 'GET', path: '/v2/videoview/{userid}/ranklist', params: { ...params } });
  }

  /** View log of one day. */
  async getDailyViewLog(params: DailyViewLogParams): Promise<unknown> {
    if (!/^\d{8}$/.test(params.day)) throw new PolyVVodError('validation', 'day must be formatted yyyyMMdd');
    return this.client.request({
      method: 'POST',
      path: '/v2/data/{userid}/viewlog',
      auth: { scheme: 'sha1', keys: ['userid', 'day', 'ptime'] },
      params: { day: params.day, pageNum: params.pageNum, pageSize: params.pageSize },
      idempotent: true
    });
  }

  /** View log of one month, by pages. */
  async getMonthlyViewLog(params: MonthlyViewLogParams): Promise<MonthlyViewLogPage> {
    if (!/^\d{6}$/.test(params.month)) throw new PolyVVodError('validation', 'month must be formatted yyyyMM');
    return this.client.request({
      method: 'GET',
      path: `/v2/viewlog/{userid}/monthly/${params.month}`,
      // `month` is in the path and still has to be sent as a parameter, because it takes part in
      // the signature. The page size is `pageSize`: the `numPerPage` name from the docs is not
      // recognised by the signer and breaks the signature.
      params: {
        month: params.month,
        pageNum: params.pageNum,
        pageSize: params.pageSize,
        start: params.start,
        end: params.end,
        vid: params.vid,
        sessionId: params.sessionId,
        currentDay: params.currentDay
      }
    });
  }
}
