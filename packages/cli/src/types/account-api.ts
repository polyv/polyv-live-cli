/**
 * Server-side account API CLI types.
 */

export type AccountApiOutputFormat = 'table' | 'json';

export interface AccountApiBaseOptions {
  output?: AccountApiOutputFormat;
}

export interface AccountApiPaginationOptions extends AccountApiBaseOptions {
  page?: number;
  pageSize?: number;
}

export interface AccountApiChannelsOptions extends AccountApiBaseOptions {
  categoryId?: string;
  keyword?: string;
  labelId?: string;
}

export interface AccountApiChannelListOptions extends AccountApiPaginationOptions {
  categoryId?: string;
  watchStatus?: string;
  keyword?: string;
}

export interface AccountApiChannelBasicListOptions extends AccountApiPaginationOptions {
  categoryIds?: string;
  keyword?: string;
}

export interface AccountApiPlaybackListOptions extends AccountApiPaginationOptions {
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export interface AccountApiReceiveListOptions extends AccountApiPaginationOptions {
  channelId: string;
  keyword?: string;
}

export interface AccountApiIncomeListOptions extends AccountApiPaginationOptions {
  userId: string;
  startDate: string;
  endDate: string;
  channelId?: string;
}

export interface AccountApiCategoryCreateOptions extends AccountApiBaseOptions {
  name: string;
  force?: boolean;
}

export interface AccountApiCategoryDeleteOptions extends AccountApiBaseOptions {
  categoryId: number;
  force?: boolean;
}

export interface AccountApiCategoryUpdateNameOptions extends AccountApiBaseOptions {
  categoryId: number;
  name: string;
  force?: boolean;
}

export interface AccountApiCategoryUpdateRankOptions extends AccountApiBaseOptions {
  categoryId: number;
  rank: number;
  force?: boolean;
}

export type AccountCallbackType = 'stream' | 'record' | 'playback';

export interface AccountApiCallbackSetOptions extends AccountApiBaseOptions {
  type: AccountCallbackType;
  userId: string;
  url?: string;
  force?: boolean;
}

export interface AccountApiSsoSetOptions extends AccountApiBaseOptions {
  token: string;
  childEmail?: string;
  force?: boolean;
}
