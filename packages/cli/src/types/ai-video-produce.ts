/**
 * @fileoverview TypeScript type definitions for AI video production commands
 */

import type {
  AsyncUploadVideoProducePptResponse,
  BatchCreateVideoProducesItem,
  BatchCreateVideoProducesResponse,
  ListVideoProducePptsResponse,
  ListVideoProducesResponse,
  TtsVoice,
  UploadVideoProducePptResponse,
  VideoProducePpt,
  VideoProducePptConvertType,
  VideoProduceTask,
} from 'polyv-live-api-sdk';

export interface AIVideoProduceServiceConfig {
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
}

export type AIVideoProduceTask = VideoProduceTask;
export type AIVideoProduceTaskListResponse = ListVideoProducesResponse;
export type AIVideoProducePpt = VideoProducePpt;
export type AIVideoProducePptListResponse = ListVideoProducePptsResponse;
export type AIVideoProduceTtsVoice = TtsVoice;
export type AIVideoProduceCreateTask = BatchCreateVideoProducesItem;
export type AIVideoProduceCreateResponse = BatchCreateVideoProducesResponse;
export type AIVideoProducePptUploadResponse = UploadVideoProducePptResponse;
export type AIVideoProducePptAsyncUploadResponse = AsyncUploadVideoProducePptResponse;

export interface AITtsVoiceListOptions {
  page?: number;
  size?: number;
  output?: 'table' | 'json';
}

export interface AIVideoProduceListOptions {
  page?: number;
  size?: number;
  videoName?: string;
  status?: number;
  createTimeStart?: number;
  createTimeEnd?: number;
  tags?: string;
  output?: 'table' | 'json';
}

export interface AIVideoProduceGetOptions {
  id: number;
  output?: 'table' | 'json';
}

export interface AIVideoProduceCreateOptions {
  tasks: string;
  force?: boolean;
  output?: 'table' | 'json';
}

export interface AIVideoProduceDeleteOptions {
  id: number;
  force?: boolean;
  output?: 'table' | 'json';
}

export interface AIVideoProducePptListOptions {
  page?: number;
  size?: number;
  output?: 'table' | 'json';
}

export interface AIVideoProducePptGetOptions {
  fileId: string;
  output?: 'table' | 'json';
}

export interface AIVideoProducePptUploadOptions {
  url: string;
  docName?: string;
  force?: boolean;
  output?: 'table' | 'json';
}

export interface AIVideoProducePptAsyncUploadOptions {
  url: string;
  docName?: string;
  type?: VideoProducePptConvertType;
  callbackUrl?: string;
  childUserId?: string;
  force?: boolean;
  output?: 'table' | 'json';
}
