/**
 * @fileoverview Record settings CLI type definitions
 * @author Development Team
 * @since 9.7.0
 */

/**
 * Record service configuration
 */
export interface RecordServiceConfig {
  baseUrl: string;
  timeout: number;
  debug: boolean;
}

/**
 * Record setting get options from CLI
 */
export interface RecordSettingGetOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Record setting set options from CLI
 */
export interface RecordSettingSetOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Playback enabled: Y or N */
  playbackEnabled?: 'Y' | 'N';
  /** Playback type: single or list */
  type?: 'single' | 'list';
  /** Playback origin: record, playback, vod, or material */
  origin?: 'record' | 'playback' | 'vod' | 'material';
  /** Video ID */
  videoId?: string;
  /** Global setting enabled: Y or N */
  globalSettingEnabled?: 'Y' | 'N';
  /** Section enabled: Y or N */
  sectionEnabled?: 'Y' | 'N';
  /** Playback multiplier enabled: Y or N */
  playbackMultiplierEnabled?: 'Y' | 'N';
  /** Playback progress bar enabled: Y or N */
  playbackProgressBarEnabled?: 'Y' | 'N';
  /** Playback progress bar operation type */
  playbackProgressBarOperationType?: 'drag' | 'prohibitDrag' | 'dragHistoryOnly';
  /** Show play button enabled: Y or N */
  showPlayButtonEnabled?: 'Y' | 'N';
  /** Chat playback enabled: Y or N */
  chatPlaybackEnabled?: 'Y' | 'N';
  /** Product playback enabled: Y or N */
  productPlaybackEnabled?: 'Y' | 'N';
  /** Questionnaire playback enabled: Y or N */
  questionnairePlaybackEnabled?: 'Y' | 'N';
  /** QA playback enabled: Y or N */
  qaPlaybackEnabled?: 'Y' | 'N';
  /** Card push playback enabled: Y or N */
  cardPushPlaybackEnabled?: 'Y' | 'N';
  /** Check-in playback enabled: Y or N */
  checkInPlaybackEnabled?: 'Y' | 'N';
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Record convert options from CLI
 */
export interface RecordConvertOptions {
  /** Channel ID (required) */
  channelId: string;
  /** File ID (optional, use sessionId instead) */
  fileId?: string;
  /** Session ID (optional) */
  sessionId?: string;
  /** File name (required) */
  fileName: string;
  /** Catalog ID */
  cataId?: string;
  /** Catalog name */
  cataName?: string;
  /** Add to playback list: Y or N */
  toPlayList?: 'Y' | 'N';
  /** Set as default playback: Y or N */
  setAsDefault?: 'Y' | 'N';
  /** Use async mode */
  async?: boolean;
  /** Callback URL for async mode */
  callbackUrl?: string;
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Record set default options from CLI
 */
export interface RecordSetDefaultOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Video ID (required) */
  videoId: string;
  /** List type: playback or vod */
  listType?: 'playback' | 'vod';
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Record setting display item for table and JSON output
 */
export interface RecordSettingDisplayItem {
  channelId: string;
  playbackEnabled?: string;
  type?: string;
  origin?: string;
  videoId?: string;
  videoName?: string;
  sectionEnabled?: string;
  globalSettingEnabled?: string;
  playbackMultiplierEnabled?: string;
  playbackProgressBarEnabled?: string;
  playbackProgressBarOperationType?: string;
  showPlayButtonEnabled?: string;
  chatPlaybackEnabled?: string;
  productPlaybackEnabled?: string;
  questionnairePlaybackEnabled?: string;
  qaPlaybackEnabled?: string;
  cardPushPlaybackEnabled?: string;
  checkInPlaybackEnabled?: string;
  crontabType?: string;
  startTime?: number;
  endTime?: number;
}

/**
 * Record convert result
 */
export interface RecordConvertResult {
  async: boolean;
  vid?: string;
}
