/**
 * @fileoverview TypeScript type definitions for transmit management
 * @author Development Team
 * @since 14.3.0
 */

/**
 * Service configuration for transmit operations
 */
export interface TransmitServiceConfig {
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
}

/**
 * 转播频道信息（创建返回)
 */
export interface TransmitChannelInfo {
  channelId: number;
  name: string;
  channelPasswd: string;
  authType: string;
  streamType: string;
  debugEnabled: boolean;
  playbackEnabled: boolean;
  stream: string;
  status: string;
  category: string;
  scene: string;
  createdAt?: number;
  // ... 其他字段
}

/**
 * 转播关联信息
 */
export interface TransmitAssociation {
  channelId: string | null;
  receiveChannelId: string;
}

/**
 * 批量创建接收转播频道的参数
 */
export interface TransmitBatchCreateParams {
  channelId: string;
  names: string[];
}

/**
 * 获取转播关联列表的参数
 */
export interface TransmitGetAssociationsParams {
  channelId: string;
}

/**
 * transmit create 命令选项
 */
export interface TransmitCreateOptions {
  channelId: string;
  names: string;
  output?: 'table' | 'json';
}

/**
 * transmit list 命令选项
 */
export interface TransmitListOptions {
  channelId: string;
  output?: 'table' | 'json';
}
