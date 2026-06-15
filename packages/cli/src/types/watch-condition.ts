/**
 * @fileoverview Type definitions for Watch Condition CLI commands
 * @author Development Team
 * @since 12.3.0
 */

import type { AuthType } from 'polyv-live-api-sdk';

/** Valid auth types for watch condition */
export const VALID_AUTH_TYPES: readonly AuthType[] = ['none', 'code', 'pay', 'phone', 'info', 'custom', 'external', 'direct'] as const;

/** Auth type Chinese labels */
export const AUTH_TYPE_LABELS: Record<AuthType, string> = {
  none: '无限制',
  code: '密码观看',
  pay: '付费观看',
  phone: '白名单观看',
  info: '登记观看',
  wxshare: '分享观看',
  custom: '自定义授权',
  external: '外部授权',
  direct: '独立授权',
  public: '公开观看',
  wx: '微信授权',
};

/**
 * Service configuration for WatchConditionServiceSdk
 */
export interface WatchConditionServiceConfig {
  /** API base URL */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Options for watch-condition get command
 */
export interface WatchConditionGetOptions {
  /** Channel ID (optional, omit for global settings) */
  channelId?: string;
  /** Output format: 'table' or 'json' */
  output?: 'table' | 'json';
}

/**
 * Options for watch-condition set command
 */
export interface WatchConditionSetOptions {
  /** Channel ID (optional, omit for global settings) */
  channelId?: string;
  /** Auth setting rank: 1 (primary) or 2 (secondary) */
  rank?: 1 | 2;
  /** Auth type */
  authType?: AuthType;
  /** Enabled status: 'Y' or 'N' */
  enabled?: 'Y' | 'N';
  /** Password for authType 'code' */
  authCode?: string;
  /** Price in yuan (will be converted to cents) */
  price?: number;
  /** Path to JSON config file with authSettings array */
  configFile?: string;
  /** Output format: 'table' or 'json' */
  output?: 'table' | 'json';
}

/**
 * Auth setting for config file
 */
export interface ConfigAuthSetting {
  /** Rank: 1 (primary) or 2 (secondary) */
  rank: 1 | 2;
  /** Auth type */
  authType?: AuthType;
  /** Enabled status: 'Y' or 'N' */
  enabled?: 'Y' | 'N';
  /** Password for authType 'code' */
  authCode?: string;
  /** Price in cents for authType 'pay' */
  payAmount?: number;
  /** Info fields for authType 'info' */
  infoFields?: ConfigInfoField[];
  /** Sub auth type for authType 'none' */
  subAuthType?: 'public' | 'wx';
  /** External key for authType 'external' */
  externalKey?: string;
  /** External URI for authType 'external' */
  externalUri?: string;
  /** External redirect URI for authType 'external' */
  externalRedirectUri?: string;
  /** External button enabled: 'Y' or 'N' */
  externalButtonEnabled?: 'Y' | 'N';
  /** Custom key for authType 'custom' */
  customKey?: string;
  /** Custom URI for authType 'custom' */
  customUri?: string;
  /** Direct key for authType 'direct' */
  directKey?: string;
}

/**
 * Info field for config file
 */
export interface ConfigInfoField {
  /** Field type */
  type: 'text' | 'number' | 'option' | 'name' | 'mobile';
  /** Field name/label */
  name: string;
  /** Options for type 'option' */
  options?: string;
  /** Placeholder text */
  placeholder?: string;
  /** SMS verification enabled: 'Y' or 'N' */
  sms?: 'Y' | 'N';
}

/**
 * Config file structure for watch-condition set
 */
export interface WatchConditionConfig {
  /** Array of auth settings */
  authSettings: ConfigAuthSetting[];
}
