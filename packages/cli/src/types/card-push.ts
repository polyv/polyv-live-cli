/**
 * @fileoverview Card-push type definitions for CLI
 * @author Development Team
 * @since 14.2.0
 */

/**
 * Card-push service configuration
 */
export interface CardPushServiceConfig {
  /** Base URL for API calls */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Enable debug mode */
  debug?: boolean;
}

/**
 * Card-push list command options
 */
export interface CardPushListOptions {
  /** Channel ID (频道ID) */
  channelId: string;
  /** Output format (table|json) */
  output?: 'table' | 'json';
}

/**
 * Card-push create command options
 */
export interface CardPushCreateOptions {
  /** Channel ID (频道ID) */
  channelId: string;
  /** Card type (common|qrCode) */
  cardType?: 'common' | 'qrCode';
  /** Image type (giftbox|redpack|custom|weixinWork) */
  imageType: 'giftbox' | 'redpack' | 'custom' | 'weixinWork';
  /** Card title (max 16 chars) */
  title: string;
  /** Card link URL */
  link: string;
  /** Card countdown duration (0,5,10,20,30 seconds) */
  duration: number;
  /** Countdown duration position (bottom|top) */
  durationPosition?: 'bottom' | 'top';
  /** Show condition (PUSH|WATCH) */
  showCondition: 'PUSH' | 'WATCH';
  /** Watch duration value */
  conditionValue?: number;
  /** Watch duration unit (SECONDS|MINUTES) */
  conditionUnit?: 'SECONDS' | 'MINUTES';
  /** Countdown message (max 8 chars) */
  countdownMsg?: string;
  /** Card entry enabled (Y|N) */
  enterEnabled?: 'Y' | 'N';
  /** Card link enabled (Y|N) */
  linkEnabled?: 'Y' | 'N';
  /** Redirect type (iframe|tab) */
  redirectType?: 'iframe' | 'tab';
  /** Output format (table|json) */
  output?: 'table' | 'json';
}

/**
 * Card-push update command options
 */
export interface CardPushUpdateOptions {
  /** Channel ID (频道ID) */
  channelId: string;
  /** Card-push ID */
  cardPushId: string;
  /** Card type (common|qrCode) */
  cardType?: 'common' | 'qrCode';
  /** Image type (giftbox|redpack|custom|weixinWork) */
  imageType?: 'giftbox' | 'redpack' | 'custom' | 'weixinWork';
  /** Card title (max 16 chars) */
  title?: string;
  /** Card link URL */
  link?: string;
  /** Card countdown duration (0,5,10,20,30 seconds) */
  duration?: number;
  /** Countdown duration position (bottom|top) */
  durationPosition?: 'bottom' | 'top';
  /** Show condition (PUSH|WATCH) */
  showCondition?: 'PUSH' | 'WATCH';
  /** Watch duration value */
  conditionValue?: number;
  /** Watch duration unit (SECONDS|MINUTES) */
  conditionUnit?: 'SECONDS' | 'MINUTES';
  /** Countdown message (max 8 chars) */
  countdownMsg?: string;
  /** Card entry enabled (Y|N) */
  enterEnabled?: 'Y' | 'N';
  /** Card link enabled (Y|N) */
  linkEnabled?: 'Y' | 'N';
  /** Redirect type (iframe|tab) */
  redirectType?: 'iframe' | 'tab';
  /** Output format (table|json) */
  output?: 'table' | 'json';
}

/**
 * Card-push push command options
 */
export interface CardPushPushOptions {
  /** Channel ID (频道ID) */
  channelId: string;
  /** Card-push ID */
  cardPushId: string;
  /** Output format (table|json) */
  output?: 'table' | 'json';
}

/**
 * Card-push cancel command options
 */
export interface CardPushCancelOptions {
  /** Channel ID (频道ID) */
  channelId: string;
  /** Card-push ID */
  cardPushId: string;
  /** Output format (table|json) */
  output?: 'table' | 'json';
}

/**
 * Card-push delete command options
 */
export interface CardPushDeleteOptions {
  /** Channel ID (频道ID) */
  channelId: string;
  /** Card-push ID */
  cardPushId: string;
  /** Output format (table|json) */
  output?: 'table' | 'json';
}

export interface CardPushShareGetOptions {
  /** Channel ID (频道ID) */
  channelId: string;
  /** Output format (table|json) */
  output?: 'table' | 'json';
}

export interface CardPushShareUpdateOptions extends CardPushShareGetOptions {
  /** Whether to show the share button (Y|N) */
  shareBtnEnable: 'Y' | 'N';
  /** Share title mode */
  titleType: 'follow' | 'custom' | string;
  /** WeChat share title */
  weixinShareTitle?: string;
  /** WeChat share description */
  weixinShareDesc?: string;
  /** Custom WeChat share URL */
  weixinShareCustomUrl?: string;
  /** Custom web share URL */
  webShareCustomUrl?: string;
  /** Whether to append params to custom WeChat share URL */
  weixinShareCustomUrlWithParamEnabled?: 'Y' | 'N';
  /** Whether to append params to custom web share URL */
  webShareCustomUrlWithParamEnabled?: 'Y' | 'N';
  /** Skip confirmation prompt */
  force?: boolean;
}

/**
 * Card-push information
 */
export interface CardPush {
  /** Card-push ID */
  id: number;
  /** Channel ID */
  channelId: number;
  /** Card title */
  title: string;
  /** Card type (common|qrCode) */
  cardType?: 'common' | 'qrCode';
  /** Image type */
  imageType: 'giftbox' | 'redpack' | 'custom' | 'weixinWork';
  /** Card countdown duration */
  duration: number;
  /** Countdown duration position */
  durationPosition?: 'bottom' | 'top';
  /** Card link URL */
  link: string;
  /** Push status (Y: pushing, N: not pushed, L: last pushed) */
  pushStatus: 'Y' | 'N' | 'L';
  /** Card entry enabled */
  enterEnabled: 'Y' | 'N';
  /** Show condition */
  showCondition: 'PUSH' | 'WATCH';
  /** Watch duration value */
  conditionValue?: number;
  /** Watch duration unit */
  conditionUnit?: 'SECONDS' | 'MINUTES';
  /** Countdown message */
  countdownMsg?: string;
  /** Card link enabled */
  linkEnabled?: 'Y' | 'N';
  /** Redirect type */
  redirectType?: 'iframe' | 'tab';
  /** Created time (13-digit timestamp) */
  createdTime: number;
  /** Last modified time (13-digit timestamp) */
  lastModified?: number;
  /** Push time (13-digit timestamp) */
  pushTime?: number;
  /** Push end time (13-digit timestamp) */
  pushEndTime?: number;
  /** Card entry image */
  enterImage?: string;
  /** Card image */
  cardImage?: string;
}

/**
 * Created card-push information
 */
export interface CreatedCardPush {
  /** Card-push ID */
  id: number;
  /** Channel ID */
  channelId: number;
  /** Card title */
  title: string;
  /** Card type */
  cardType?: 'common' | 'qrCode';
  /** Image type */
  imageType: 'giftbox' | 'redpack' | 'custom' | 'weixinWork';
  /** Card countdown duration */
  duration: number;
  /** Countdown duration position */
  durationPosition?: 'bottom' | 'top';
  /** Card link URL */
  link: string;
  /** Push status */
  pushStatus: 'Y' | 'N' | 'L';
  /** Card entry enabled */
  enterEnabled?: 'Y' | 'N';
  /** Show condition */
  showCondition: 'PUSH' | 'WATCH';
  /** Watch duration value */
  conditionValue?: number;
  /** Watch duration unit */
  conditionUnit?: 'SECONDS' | 'MINUTES';
  /** Countdown message */
  countdownMsg?: string;
  /** Card link enabled */
  linkEnabled?: 'Y' | 'N';
  /** Redirect type */
  redirectType?: 'iframe' | 'tab';
  /** Created time */
  createdTime: number;
  /** Last modified time */
  lastModified?: number;
  /** Push time */
  pushTime?: number;
  /** Push end time */
  pushEndTime?: number;
}

/**
 * Card-push create API parameters
 */
export interface CardPushCreateParams {
  /** Channel ID */
  channelId: string;
  /** Card type */
  cardType?: 'common' | 'qrCode' | undefined;
  /** Image type */
  imageType: 'giftbox' | 'redpack' | 'custom' | 'weixinWork';
  /** Card title */
  title: string;
  /** Card link URL */
  link: string;
  /** Card countdown duration */
  duration: number;
  /** Countdown duration position */
  durationPosition?: 'bottom' | 'top' | undefined;
  /** Show condition */
  showCondition: 'PUSH' | 'WATCH';
  /** Watch duration value */
  conditionValue?: number | undefined;
  /** Watch duration unit */
  conditionUnit?: 'SECONDS' | 'MINUTES' | undefined;
  /** Countdown message */
  countdownMsg?: string | undefined;
  /** Card entry enabled */
  enterEnabled?: 'Y' | 'N' | undefined;
  /** Card link enabled */
  linkEnabled?: 'Y' | 'N' | undefined;
  /** Redirect type */
  redirectType?: 'iframe' | 'tab' | undefined;
}

/**
 * Card-push update API parameters
 */
export interface CardPushUpdateParams {
  /** Channel ID */
  channelId: string;
  /** Card-push ID */
  cardPushId: string;
  /** Card type */
  cardType?: 'common' | 'qrCode' | undefined;
  /** Image type */
  imageType?: 'giftbox' | 'redpack' | 'custom' | 'weixinWork' | undefined;
  /** Card title */
  title?: string | undefined;
  /** Card link URL */
  link?: string | undefined;
  /** Card countdown duration */
  duration?: number | undefined;
  /** Countdown duration position */
  durationPosition?: 'bottom' | 'top' | undefined;
  /** Show condition */
  showCondition?: 'PUSH' | 'WATCH' | undefined;
  /** Watch duration value */
  conditionValue?: number | undefined;
  /** Watch duration unit */
  conditionUnit?: 'SECONDS' | 'MINUTES' | undefined;
  /** Countdown message */
  countdownMsg?: string | undefined;
  /** Card entry enabled */
  enterEnabled?: 'Y' | 'N' | undefined;
  /** Card link enabled */
  linkEnabled?: 'Y' | 'N' | undefined;
  /** Redirect type */
  redirectType?: 'iframe' | 'tab' | undefined;
}

/**
 * Card-push push API parameters
 */
export interface CardPushPushParams {
  /** Channel ID */
  channelId: string;
  /** Card-push ID */
  cardPushId: string;
}

/**
 * Card-push cancel API parameters
 */
export interface CardPushCancelParams {
  /** Channel ID */
  channelId: string;
  /** Card-push ID */
  cardPushId: string;
}

/**
 * Card-push delete API parameters
 */
export interface CardPushDeleteParams {
  /** Channel ID */
  channelId: string;
  /** Card-push ID */
  cardPushId: string;
}
