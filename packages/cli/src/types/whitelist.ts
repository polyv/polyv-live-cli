/**
 * @fileoverview Type definitions for whitelist CLI commands
 * @author Development Team
 * @since 12.4.0
 */

/**
 * Whitelist service configuration
 */
export interface WhitelistServiceConfig {
  /** API base URL */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Enable debug mode */
  debug: boolean;
}

/**
 * Options for whitelist list command
 */
export interface WhitelistListOptions {
  /** 频道号（可选，不传为全局设置） */
  channelId?: string;
  /** 主要观看条件为1，次要观看条件为2 */
  rank: 1 | 2;
  /** 页码，默认为1 */
  page?: number;
  /** 每页数量，默认为10 */
  pageSize?: number;
  /** 关键词（可根据会员码和名称查询） */
  keyword?: string;
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Options for whitelist add command
 */
export interface WhitelistAddOptions {
  /** 频道号（可选，不传为全局设置） */
  channelId?: string;
  /** 主要观看条件为1，次要观看条件为2 */
  rank: 1 | 2;
  /** 会员码（最多50个字符） */
  code: string;
  /** 昵称（可选，最多50个字符） */
  name?: string;
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Options for whitelist update command
 */
export interface WhitelistUpdateOptions {
  /** 频道号（可选，不传为全局设置） */
  channelId?: string;
  /** 主要观看条件为1，次要观看条件为2 */
  rank: 1 | 2;
  /** 原会员码 */
  oldCode: string;
  /** 新会员码（最多50个字符） */
  code: string;
  /** 昵称（可选，最多50个字符） */
  name?: string;
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Options for whitelist remove command
 */
export interface WhitelistRemoveOptions {
  /** 频道号（可选，不传为全局设置） */
  channelId?: string;
  /** 主要观看条件为1，次要观看条件为2 */
  rank: 1 | 2;
  /** 要删除的会员码（逗号分隔） */
  codes?: string;
  /** 清空所有 */
  clear?: boolean;
  /** Output format */
  output?: 'table' | 'json';
}
