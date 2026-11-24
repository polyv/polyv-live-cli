/**
 * Play-safety (视频安全) and statistics types.
 *
 * @module types/playsafe
 */

export interface CreatePlayTokenParams {
  videoId: string;
  /** Distinct per viewer; letters, digits, "-" and "_". */
  viewerId: string;
  /** Default: the caller's IP. */
  viewerIp?: string;
  viewerName?: string;
  /** Token lifetime in seconds. Default 10 minutes, max 24 hours. */
  expires?: number;
  /** When true the token is valid for a single verification. Default false. */
  disposable?: boolean;
  /** WeChat mini-program playback. */
  iswxa?: boolean;
  /** Restricts the client: `WEB` or `NATIVE`. */
  type?: string;
  extraParams?: string;
  securitySeed?: string;
}

export interface PlayToken {
  token: string;
  userId: string;
  videoId: string;
  viewerId: string;
  /** Lifetime in milliseconds. */
  ttl: number;
  disposable: boolean;
  /** 13-digit timestamps. */
  createdTime: number;
  expiredTime: number;
}

export type PlayDateRange =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | '7days'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_year';

export type PlayPeriod = 'daily' | 'weekly' | 'monthly';

export interface PlayTimesParams {
  /** Omit for every video. */
  vid?: string;
  dr?: PlayDateRange;
  /** `weekly` and `monthly` need `dr` to be `this_month` or `last_month`. */
  period?: PlayPeriod;
}

export interface PlayTimesItem {
  currentTime: string;
  pcVideoView: number;
  mobileVideoView: number;
}

export type RankDateRange = 'today' | 'yesterday' | '7days' | '30days';

export interface PlayTimesRankParams {
  /** `yyyy-MM-dd`. Both bounds given: `dr` is ignored. One given: the last 7 days. */
  start?: string;
  end?: string;
  dr?: RankDateRange;
}

export interface RankedVideo {
  videoId: string;
  title: string;
  duration: string;
  pcVideoView: number;
  mobileVideoView: number;
}

export interface PlayTimesRank {
  totalPcVideoView: number;
  totalMoVideoView: number;
  pcVideoDailys: RankedVideo[];
  moVideoDailys: RankedVideo[];
}

export interface VideoPlayTimes {
  vid: string;
  times: number;
}

/** Space and traffic figures in bytes. */
export interface AccountUsage {
  videoCount: number;
  totalFlow: number;
  usedSpace: number;
  usedFlow: number;
  totalSpace: number;
  userId: string;
  email: string;
}

export interface DailyViewLogParams {
  /** `yyyyMMdd` */
  day: string;
  pageNum?: number;
  pageSize?: number;
}

export interface MonthlyViewLogParams {
  /** `yyyyMM`; also sent as a parameter because it takes part in the signature. */
  month: string;
  pageNum?: number;
  /** The platform signs `pageSize`; the `numPerPage` name from the docs breaks the signature. */
  pageSize?: number;
  start?: string;
  end?: string;
  vid?: string;
  sessionId?: string;
  currentDay?: string;
}

export interface ViewLogEntry {
  playId: string;
  userId?: string;
  videoId: string;
  playDuration: number;
  stayDuration: number;
  currentTimes: number;
  duration: number;
  flowSize: number;
  sessionId?: string;
  ipAddress?: string;
  country?: string;
  province?: string;
  city?: string;
  referer?: string;
  userAgent?: string;
  operatingSystem?: string;
  browser?: string;
  isMobile?: string;
  currentDay?: string;
}

export interface MonthlyViewLogPage {
  total: number;
  contents?: ViewLogEntry[];
  data?: ViewLogEntry[];
}

export interface CallbackSetting {
  callbackUrl?: string;
}
