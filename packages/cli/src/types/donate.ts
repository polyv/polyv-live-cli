/**
 * @fileoverview Type definitions for donate commands
 * @author Development Team
 * @since 11.6.0
 */

import { OutputFormat } from '../handlers/base.handler';

/**
 * Y/N flag type for boolean-like fields
 */
export type YNFlag = 'Y' | 'N';

/**
 * Options for getting donate configuration
 */
export interface DonateConfigGetOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for updating donate configuration
 */
export interface DonateConfigUpdateOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Enable cash donate (Y/N) */
  cashEnabled?: YNFlag;
  /** Enable gift donate (Y/N) */
  giftEnabled?: YNFlag;
  /** Donate tips text */
  tips?: string;
  /** Donate amounts (array or comma-separated string) */
  amounts?: number[] | string;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for listing donate records
 */
export interface DonateListOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Start time (timestamp in milliseconds, required) */
  start: number;
  /** End time (timestamp in milliseconds, required) */
  end: number;
  /** Page number */
  page?: number;
  /** Page size */
  size?: number;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Service configuration for donate operations
 */
export interface DonateServiceConfig {
  /** Base URL for API requests */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Enable debug mode */
  debug: boolean;
}

/**
 * Donate configuration response
 */
export interface DonateConfigResponse {
  /** Global setting enabled flag */
  globalSettingEnabled: YNFlag;
  /** Cash donate enabled flag */
  donateCashEnabled: YNFlag;
  /** Good donate enabled flag */
  donateGoodEnabled: YNFlag;
  /** Donate tips text */
  donateTips: string;
  /** Minimum cash amount */
  cashMin: number;
  /** Available cash amounts */
  cashes: number[];
  /** Point donate enabled flag */
  donatePointEnabled: YNFlag;
  /** Point unit */
  pointUnit: string | null;
  /** Goods list */
  goods: DonateGoodItem[];
}

/**
 * Donate good item
 */
export interface DonateGoodItem {
  /** Good name */
  goodName: string;
  /** Good image URL */
  goodImg: string;
  /** Good price */
  goodPrice: number;
  /** Good enabled flag */
  goodEnabled: YNFlag;
}

/**
 * Donate record response
 */
export interface DonateRecordResponse {
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Contents list */
  contents: DonateRecordItem[];
}

/**
 * Donate record item
 */
export interface DonateRecordItem {
  /** User ID */
  userId: string;
  /** User nickname */
  nickName: string;
  /** Timestamp */
  timestamp: number;
  /** Donate name (cash or gift name) */
  name: string;
  /** Donate type (1=props/points, 2=cash) */
  type: '1' | '2';
  /** Donate amount */
  amount: number;
  /** Session ID */
  sessionId: string;
}

/**
 * API response wrapper for donate config
 */
export interface DonateConfigApiResponse {
  code: number;
  status: string;
  data: DonateConfigResponse;
}

/**
 * API response wrapper for donate records
 */
export interface DonateRecordApiResponse {
  code: number;
  status: string;
  data: DonateRecordResponse;
}

/**
 * API response wrapper for update result
 */
export interface DonateUpdateApiResponse {
  code: number;
  status: string;
  data: Record<string, unknown>;
}

/**
 * Parameters for getting donate config via SDK
 */
export interface GetDonateConfigParams {
  channelId: string;
}

/**
 * Parameters for updating donate config via SDK
 */
export interface UpdateDonateConfigParams {
  channelId: string;
  donateEnabled?: YNFlag;
  donateGiftEnabled?: YNFlag;
  donateTips?: string;
  donateAmounts?: number[];
  giftDonate?: {
    payWay?: 'CASH' | 'POINT' | string;
    pointUnit?: string;
    cashPays?: Array<{
      name?: string;
      enabled?: YNFlag;
      imgType?: 'STATIC' | 'DYNAMIC' | string;
      img?: string;
      dynamicImg?: string;
      dynamicFile?: string;
      price?: number | string;
    }>;
    pointPays?: Array<{
      name?: string;
      enabled?: YNFlag;
      imgType?: 'STATIC' | 'DYNAMIC' | string;
      img?: string;
      dynamicImg?: string;
      dynamicFile?: string;
      price?: number | string;
    }>;
  };
}

/**
 * Parameters for listing reward gift records via SDK
 */
export interface ListRewardGiftParams {
  channelId: string;
  start: number;
  end: number;
  pageNumber?: number;
  pageSize?: number;
}
