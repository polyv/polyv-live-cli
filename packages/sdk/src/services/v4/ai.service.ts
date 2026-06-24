/**
 * V4 AI Service
 *
 * Service for managing PolyV V4 AI and Digital Human operations.
 * Provides methods for digital humans, video production, and TTS voices.
 *
 * @module services/v4/ai
 */

import type { PolyVClient } from '../../client.js';
import type {
  ListDigitalHumansParams,
  ListDigitalHumansResponse,
  ListOrganizationsParams,
  DigitalHumanOrganization,
  SetOrganizationsParams,
  ListVideoProducesParams,
  ListVideoProducesResponse,
  GetVideoProduceParams,
  VideoProduceTask,
  BatchCreateVideoProducesParams,
  BatchCreateVideoProducesResponse,
  DeleteVideoProduceParams,
  ListVideoProducePptsParams,
  ListVideoProducePptsResponse,
  GetVideoProducePptParams,
  VideoProducePpt,
  AsyncUploadVideoProducePptParams,
  AsyncUploadVideoProducePptResponse,
  UploadVideoProducePptParams,
  UploadVideoProducePptResponse,
  TtsVoice,
  ListTtsVoicesParams,
} from '../../types/v4-ai.js';
import { PolyVValidationError } from '../../errors/polyv-validation-error.js';

/**
 * V4AiService
 *
 * Provides methods to interact with PolyV V4 AI APIs.
 *
 * @example
 * ```typescript
 * const client = new PolyVClient({ appId: 'xxx', appSecret: 'yyy' });
 * const digitalHumans = await client.v4Ai.listDigitalHumans({ pageNumber: 1, pageSize: 10 });
 * ```
 */
export class V4AiService {
  private client: PolyVClient;

  /**
   * Create a new V4AiService instance
   *
   * @param client - The PolyVClient instance to use for API calls
   */
  constructor(client: PolyVClient) {
    this.client = client;
  }

  // ============================================
  // AC1: AI Digital Human APIs (3 methods)
  // ============================================

  /**
   * Query digital human list with pagination
   *
   * @param params - Query parameters
   * @returns Paginated digital human list
   *
   * @example
   * ```typescript
   * const result = await client.v4Ai.listDigitalHumans({
   *   pageNumber: 1,
   *   pageSize: 10,
   * });
   * console.log(result.contents);
   * ```
   */
  async listDigitalHumans(params: ListDigitalHumansParams): Promise<ListDigitalHumansResponse> {
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<ListDigitalHumansResponse>(
      '/live/v4/ai/digital-human/list',
      { params }
    );
    return response as unknown as ListDigitalHumansResponse;
  }

  /**
   * Query digital human organizations
   *
   * @param params - Query parameters
   * @returns Digital human organization mappings
   *
   * @example
   * ```typescript
   * const result = await client.v4Ai.listOrganizations({
   *   aiDigitalHumanIds: '1001,1002',
   * });
   * console.log(result);
   * ```
   */
  async listOrganizations(params: ListOrganizationsParams): Promise<DigitalHumanOrganization[]> {
    if (!params.aiDigitalHumanIds || params.aiDigitalHumanIds.trim() === '') {
      throw new PolyVValidationError('aiDigitalHumanIds is required and cannot be empty');
    }

    const response = await this.client.httpClient.get<DigitalHumanOrganization[]>(
      '/live/v4/ai/digital-human/list-organization',
      { params }
    );
    return response as unknown as DigitalHumanOrganization[];
  }

  /**
   * Associate digital humans with organizations
   *
   * @param params - Association parameters
   *
   * @example
   * ```typescript
   * await client.v4Ai.setOrganizations({
   *   items: [
   *     {
   *       aiDigitalHumanId: 1001,
   *       organizationIds: [1, 2, 3],
   *       includeChildren: true,
   *     },
   *   ],
   * });
   * ```
   */
  async setOrganizations(params: SetOrganizationsParams): Promise<void> {
    if (!params.items || params.items.length === 0) {
      throw new PolyVValidationError('items is required and cannot be empty');
    }

    await this.client.httpClient.post(
      '/live/v4/ai/digital-human/set-organizations',
      { setOrganizations: params.items }
    );
  }

  // ============================================
  // AC2: AI Video Produce APIs (8 methods)
  // ============================================

  /**
   * Query video produce task list with pagination
   *
   * @param params - Query parameters
   * @returns Paginated video produce task list
   *
   * @example
   * ```typescript
   * const result = await client.v4Ai.listVideoProduces({
   *   pageNumber: 1,
   *   pageSize: 10,
   *   status: VideoProduceStatus.SUCCESS,
   * });
   * console.log(result.contents);
   * ```
   */
  async listVideoProduces(params: ListVideoProducesParams): Promise<ListVideoProducesResponse> {
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<ListVideoProducesResponse>(
      '/live/v4/ai/video-produce/list',
      { params }
    );
    return response as unknown as ListVideoProducesResponse;
  }

  /**
   * Query single video produce task
   *
   * @param params - Query parameters
   * @returns Video produce task detail
   *
   * @example
   * ```typescript
   * const task = await client.v4Ai.getVideoProduce({ id: 2001 });
   * console.log(task.videoName);
   * ```
   */
  async getVideoProduce(params: GetVideoProduceParams): Promise<VideoProduceTask> {
    if (params.id === undefined || params.id === null) {
      throw new PolyVValidationError('id is required');
    }

    const response = await this.client.httpClient.get<VideoProduceTask>(
      '/live/v4/ai/video-produce/get',
      { params }
    );
    return response as unknown as VideoProduceTask;
  }

  /**
   * Create video produce tasks in batch
   *
   * @param params - Batch creation parameters
   * @returns Batch creation result
   *
   * @example
   * ```typescript
   * const result = await client.v4Ai.batchCreateVideoProduces({
   *   tasks: [
   *     {
   *       videoName: 'Video 1',
   *       hasDigitalHuman: false,
   *       ttsVoiceInfo: { ttsVoiceId: 1, rate: 1.0 },
   *       subtitleInfo: { enableSubtitle: true },
   *     },
   *   ],
   * });
   * console.log(result.createdCount);
   * ```
   */
  async batchCreateVideoProduces(params: BatchCreateVideoProducesParams): Promise<BatchCreateVideoProducesResponse> {
    if (!params.tasks || params.tasks.length === 0) {
      throw new PolyVValidationError('tasks is required and cannot be empty');
    }
    if (params.tasks.length > 20) {
      throw new PolyVValidationError('tasks cannot contain more than 20 items');
    }

    // Validate ttsVoiceInfo rate range
    for (let i = 0; i < params.tasks.length; i++) {
      const task = params.tasks[i];
      if (task.ttsVoiceInfo && (task.ttsVoiceInfo.rate < 0.5 || task.ttsVoiceInfo.rate > 2.0)) {
        throw new PolyVValidationError(
          `tasks[${i}].ttsVoiceInfo.rate must be between 0.5 and 2.0`,
          `tasks[${i}].ttsVoiceInfo.rate`,
          task.ttsVoiceInfo.rate
        );
      }
    }

    const response = await this.client.httpClient.post<BatchCreateVideoProducesResponse>(
      '/live/v4/ai/video-produce/create-batch',
      params
    );
    return response as unknown as BatchCreateVideoProducesResponse;
  }

  /**
   * Delete video produce task
   *
   * @param params - Delete parameters
   *
   * @example
   * ```typescript
   * await client.v4Ai.deleteVideoProduce({ id: 2001 });
   * ```
   */
  async deleteVideoProduce(params: DeleteVideoProduceParams): Promise<void> {
    if (params.id === undefined || params.id === null) {
      throw new PolyVValidationError('id is required');
    }

    await this.client.httpClient.post(
      '/live/v4/ai/video-produce/delete',
      params
    );
  }

  /**
   * Query PPT list for video creation
   *
   * @param params - Query parameters
   * @returns Paginated PPT list
   *
   * @example
   * ```typescript
   * const result = await client.v4Ai.listVideoProducePpts({
   *   pageNumber: 1,
   *   pageSize: 10,
   * });
   * console.log(result.contents);
   * ```
   */
  async listVideoProducePpts(params: ListVideoProducePptsParams): Promise<ListVideoProducePptsResponse> {
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<ListVideoProducePptsResponse>(
      '/live/v4/ai/video-produce/ppt/list',
      { params }
    );
    return response as unknown as ListVideoProducePptsResponse;
  }

  /**
   * Query single PPT for video creation
   *
   * @param params - Query parameters
   * @returns PPT detail
   *
   * @example
   * ```typescript
   * const ppt = await client.v4Ai.getVideoProducePpt({ fileId: 'file_001' });
   * console.log(ppt.fileName);
   * ```
   */
  async getVideoProducePpt(params: GetVideoProducePptParams): Promise<VideoProducePpt> {
    if (!params.fileId || params.fileId.trim() === '') {
      throw new PolyVValidationError('fileId is required and cannot be empty');
    }

    const response = await this.client.httpClient.get<VideoProducePpt>(
      '/live/v4/ai/video-produce/ppt/get',
      { params }
    );
    return response as unknown as VideoProducePpt;
  }

  /**
   * Asynchronously upload a PPT URL for video creation
   *
   * @param params - Async upload parameters
   * @returns Uploaded PPT file ID
   */
  async asyncUploadVideoProducePpt(
    params: AsyncUploadVideoProducePptParams
  ): Promise<AsyncUploadVideoProducePptResponse> {
    if (!params.url || params.url.trim() === '') {
      throw new PolyVValidationError('url is required and cannot be empty');
    }
    if (params.type !== undefined && params.type !== 'common' && params.type !== 'animate') {
      throw new PolyVValidationError('type must be common or animate', 'type', params.type);
    }

    const response = await this.client.httpClient.post<AsyncUploadVideoProducePptResponse>(
      '/live/v4/ai/video-produce/ppt/async-upload',
      null,
      { params }
    );
    return response as unknown as AsyncUploadVideoProducePptResponse;
  }

  /**
   * Upload PPT file for video creation
   *
   * @param params - Upload parameters
   * @returns Upload result
   *
   * @example
   * ```typescript
   * const result = await client.v4Ai.uploadVideoProducePpt({
   *   url: 'https://example.com/presentation.pptx',
   *   docName: 'My Presentation',
   * });
   * console.log(result.fileId);
   * ```
   */
  async uploadVideoProducePpt(params: UploadVideoProducePptParams): Promise<UploadVideoProducePptResponse> {
    if (!params.url || params.url.trim() === '') {
      throw new PolyVValidationError('url is required and cannot be empty');
    }

    // Build FormData
    const formData = new FormData();
    formData.append('url', params.url);
    if (params.docName) {
      formData.append('docName', params.docName);
    }

    const response = await this.client.httpClient.post<UploadVideoProducePptResponse>(
      '/live/v4/ai/video-produce/ppt/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response as unknown as UploadVideoProducePptResponse;
  }

  /**
   * Query available TTS voices
   *
   * @param params - Optional pagination parameters. When omitted the server
   * returns its default page.
   * @returns TTS voice list
   *
   * @example
   * ```typescript
   * const voices = await client.v4Ai.listTtsVoices();
   * console.log(voices);
   *
   * // explicit pagination
   * const page = await client.v4Ai.listTtsVoices({ pageNumber: 1, pageSize: 20 });
   * ```
   */
  async listTtsVoices(params?: ListTtsVoicesParams): Promise<TtsVoice[]> {
    if (params?.pageNumber !== undefined && params.pageNumber < 1) {
      throw new PolyVValidationError('pageNumber must be >= 1', 'pageNumber', params.pageNumber);
    }
    if (
      params?.pageSize !== undefined &&
      (params.pageSize < 1 || params.pageSize > 1000)
    ) {
      throw new PolyVValidationError('pageSize must be between 1 and 1000', 'pageSize', params.pageSize);
    }

    const response = params
      ? await this.client.httpClient.get<TtsVoice[]>(
        '/live/v4/ai/video-produce/tts-voice/list',
        { params }
      )
      : await this.client.httpClient.get<TtsVoice[]>(
        '/live/v4/ai/video-produce/tts-voice/list'
      );
    return response as unknown as TtsVoice[];
  }

  // ============================================
  // Private Validation Helpers
  // ============================================

  /**
   * Validate pagination parameters
   */
  private validatePaginationParams(params: { pageNumber: number; pageSize: number }): void {
    if (params.pageNumber === undefined || params.pageNumber === null || params.pageNumber < 1) {
      throw new PolyVValidationError('pageNumber must be >= 1', 'pageNumber', params.pageNumber);
    }
    if (params.pageSize === undefined || params.pageSize === null || params.pageSize < 1 || params.pageSize > 1000) {
      throw new PolyVValidationError('pageSize must be between 1 and 1000', 'pageSize', params.pageSize);
    }
  }
}
