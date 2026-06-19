/**
 * @fileoverview SDK wrapper for viewer operations
 * @author Development Team
 * @since 12.1.0
 */

import { PolyVClient } from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import { ViewerServiceConfig } from '../types/viewer';
import { PolyVError } from '../utils/errors';
import type {
  GetViewerRecordParams,
  ViewerRecord,
  ListViewerRecordsParams,
  ListViewerRecordsResponse,
  CreateViewerRecordParams,
  UpdateViewerRecordParams,
  DeleteViewerRecordParams,
  ImportExternalViewerParams,
  ImportExternalViewerResponse,
  UpdateViewerUserSystemConfigParams,
  ListViewerLabelsResponse,
  CreateViewerLabelParams,
  CreateViewerLabelResponse,
  UpdateViewerLabelParams,
  DeleteViewerLabelParams,
  AddViewerLabelParams,
  DeleteViewerLabelRefParams,
  ListLabelsParams,
  ListLabelsResponse,
  CreateLabelParams,
  CreateLabelResponse,
  UpdateLabelParams,
  DeleteLabelParams,
  AddChannelLabelRefsParams,
  ViewerLotteryWinParams,
  ViewerLotteryWinResponse,
} from 'polyv-live-api-sdk';

/**
 * Batch operation result for a single viewer-label combination
 */
export interface BatchOperationResult {
  viewerUnionId: string;
  labelId: number;
  success: boolean;
  error?: string;
}

/**
 * Batch operation summary
 */
export interface BatchOperationSummary {
  total: number;
  succeeded: number;
  failed: number;
  results: BatchOperationResult[];
}

/** Concurrency limit for batch operations */
const BATCH_CONCURRENCY = 5;
/** Delay between batch chunks (ms) to avoid rate limiting */
const BATCH_DELAY_MS = 100;

/**
 * SDK wrapper for viewer operations
 * Encapsulates V4UserService viewer methods
 */
export class ViewerServiceSdk {
  private readonly client: PolyVClient;
  private readonly v4User: any;

  /**
   * Creates a new ViewerServiceSdk instance
   * @param authConfig Authentication configuration
   * @param _serviceConfig Service configuration (currently unused but required for consistency)
   */
  constructor(authConfig: AuthConfig, _serviceConfig?: ViewerServiceConfig) {
    this.client = new PolyVClient(authConfig);
    this.v4User = this.client.v4User;
  }

  /**
   * Get viewer record details
   * @param params Get viewer record parameters
   * @returns Promise resolving to viewer record
   */
  async getViewerRecord(params: GetViewerRecordParams): Promise<ViewerRecord> {
    try {
      const result = await this.v4User.getViewerRecord(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'getViewerRecord');
    }
  }

  /**
   * List viewer records with pagination and filters
   * @param params List viewer records parameters
   * @returns Promise resolving to paginated viewer records
   */
  async listViewerRecords(params: ListViewerRecordsParams): Promise<ListViewerRecordsResponse> {
    try {
      const result = await this.v4User.listViewerRecords(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'listViewerRecords');
    }
  }

  /**
   * Create a viewer record.
   * @param params Create viewer parameters
   * @returns Promise resolving to created viewer record
   */
  async createViewerRecord(params: CreateViewerRecordParams): Promise<ViewerRecord> {
    try {
      const result = await this.v4User.createViewerRecord(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'createViewerRecord');
    }
  }

  /**
   * Update a viewer record.
   * @param params Update viewer parameters
   * @returns Promise resolving when update completes
   */
  async updateViewerRecord(params: UpdateViewerRecordParams & Record<string, unknown>): Promise<void> {
    try {
      await this.v4User.updateViewerRecord(params);
    } catch (error) {
      throw this.wrapError(error, 'updateViewerRecord');
    }
  }

  /**
   * Delete a viewer record.
   * @param params Delete viewer parameters
   * @returns Promise resolving when delete completes
   */
  async deleteViewerRecord(params: DeleteViewerRecordParams): Promise<void> {
    try {
      await this.v4User.deleteViewerRecord(params);
    } catch (error) {
      throw this.wrapError(error, 'deleteViewerRecord');
    }
  }

  /**
   * Import external viewers.
   * @param params External viewer items
   * @returns Promise resolving to imported viewers
   */
  async importExternalViewer(params: ImportExternalViewerParams): Promise<ImportExternalViewerResponse> {
    try {
      const result = await this.v4User.importExternalViewer(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'importExternalViewer');
    }
  }

  /**
   * Update viewer user system config.
   * @param params Config parameters
   * @returns Promise resolving when update completes
   */
  async updateViewerUserSystemConfig(params: UpdateViewerUserSystemConfigParams): Promise<void> {
    try {
      await this.v4User.updateViewerUserSystemConfig(params);
    } catch (error) {
      throw this.wrapError(error, 'updateViewerUserSystemConfig');
    }
  }

  // ========================================
  // Story 12-2: Viewer Tag Methods
  // ========================================

  /**
   * List viewer labels
   * @returns Promise resolving to list of viewer labels
   */
  async listViewerLabels(): Promise<ListViewerLabelsResponse> {
    try {
      const result = await this.v4User.listViewerLabels();
      return result;
    } catch (error) {
      throw this.wrapError(error, 'listViewerLabels');
    }
  }

  /**
   * Create viewer labels.
   * @param params Viewer label names
   * @returns Promise resolving to created labels
   */
  async createViewerLabel(params: CreateViewerLabelParams): Promise<CreateViewerLabelResponse> {
    try {
      const result = await this.v4User.createViewerLabel(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'createViewerLabel');
    }
  }

  /**
   * Update a viewer label.
   * @param params Viewer label update parameters
   * @returns Promise resolving when update completes
   */
  async updateViewerLabel(params: UpdateViewerLabelParams): Promise<void> {
    try {
      await this.v4User.updateViewerLabel(params);
    } catch (error) {
      throw this.wrapError(error, 'updateViewerLabel');
    }
  }

  /**
   * Delete a viewer label.
   * @param params Viewer label delete parameters
   * @returns Promise resolving when delete completes
   */
  async deleteViewerLabel(params: DeleteViewerLabelParams): Promise<void> {
    try {
      await this.v4User.deleteViewerLabel(params);
    } catch (error) {
      throw this.wrapError(error, 'deleteViewerLabel');
    }
  }

  /**
   * List account labels.
   * @param params Pagination parameters
   * @returns Promise resolving to paginated labels
   */
  async listLabels(params: ListLabelsParams): Promise<ListLabelsResponse> {
    try {
      const result = await this.v4User.listLabels(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'listLabels');
    }
  }

  /**
   * Create an account label.
   * @param params Account label parameters
   * @returns Promise resolving to created label
   */
  async createLabel(params: CreateLabelParams): Promise<CreateLabelResponse> {
    try {
      const result = await this.v4User.createLabel(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'createLabel');
    }
  }

  /**
   * Update an account label.
   * @param params Account label update parameters
   * @returns Promise resolving when update completes
   */
  async updateLabel(params: UpdateLabelParams): Promise<void> {
    try {
      await this.v4User.updateLabel(params);
    } catch (error) {
      throw this.wrapError(error, 'updateLabel');
    }
  }

  /**
   * Delete an account label.
   * @param params Account label delete parameters
   * @returns Promise resolving when delete completes
   */
  async deleteLabel(params: DeleteLabelParams): Promise<void> {
    try {
      await this.v4User.deleteLabel(params);
    } catch (error) {
      throw this.wrapError(error, 'deleteLabel');
    }
  }

  /**
   * Add label refs to channels.
   * @param params Channel and label IDs
   * @returns Promise resolving when add completes
   */
  async addChannelLabelRefs(params: AddChannelLabelRefsParams): Promise<void> {
    try {
      await this.v4User.addChannelLabelRefs(params);
    } catch (error) {
      throw this.wrapError(error, 'addChannelLabelRefs');
    }
  }

  /**
   * List viewer lottery wins.
   * @param params Viewer lottery win query
   * @returns Promise resolving to paginated wins
   */
  async viewerLotteryWin(params: ViewerLotteryWinParams): Promise<ViewerLotteryWinResponse> {
    try {
      const result = await this.v4User.viewerLotteryWin(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'viewerLotteryWin');
    }
  }

  /**
   * Add labels to viewers (batch operation with concurrency control)
   * Uses controlled concurrency to avoid API rate limiting
   * @param viewerUnionIds Array of viewer union IDs
   * @param labelIds Array of label IDs
   * @param onProgress Optional progress callback
   * @returns Promise resolving to batch operation summary
   */
  async addViewersLabels(
    viewerUnionIds: string[],
    labelIds: number[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<BatchOperationSummary> {
    return this.executeBatchOperation(
      viewerUnionIds,
      labelIds,
      (viewerUnionId, labelId) => this.v4User.addViewerLabel({ viewerUnionId, labelId } as AddViewerLabelParams),
      'addViewersLabels',
      onProgress
    );
  }

  /**
   * Remove labels from viewers (batch operation with concurrency control)
   * Uses controlled concurrency to avoid API rate limiting
   * @param viewerUnionIds Array of viewer union IDs
   * @param labelIds Array of label IDs
   * @param onProgress Optional progress callback
   * @returns Promise resolving to batch operation summary
   */
  async removeViewersLabels(
    viewerUnionIds: string[],
    labelIds: number[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<BatchOperationSummary> {
    return this.executeBatchOperation(
      viewerUnionIds,
      labelIds,
      (viewerUnionId, labelId) => this.v4User.deleteViewerLabelRef({ viewerUnionId, labelId } as DeleteViewerLabelRefParams),
      'removeViewersLabels',
      onProgress
    );
  }

  /**
   * Execute batch operation with concurrency control and rate limiting
   * @private
   */
  private async executeBatchOperation(
    viewerUnionIds: string[],
    labelIds: number[],
    operation: (viewerUnionId: string, labelId: number) => Promise<void>,
    operationName: string,
    onProgress?: (completed: number, total: number) => void
  ): Promise<BatchOperationSummary> {
    const results: BatchOperationResult[] = [];
    const combinations: Array<{ viewerUnionId: string; labelId: number }> = [];

    // Build all viewer-label combinations
    for (const viewerUnionId of viewerUnionIds) {
      for (const labelId of labelIds) {
        combinations.push({ viewerUnionId, labelId });
      }
    }

    const total = combinations.length;
    let completed = 0;

    // Process in chunks with concurrency control
    for (let i = 0; i < combinations.length; i += BATCH_CONCURRENCY) {
      const chunk = combinations.slice(i, i + BATCH_CONCURRENCY);

      // Execute chunk in parallel
      const chunkResults = await Promise.allSettled(
        chunk.map(async ({ viewerUnionId, labelId }) => {
          await operation(viewerUnionId, labelId);
          return { viewerUnionId, labelId, success: true } as BatchOperationResult;
        })
      );

      // Collect results
      chunkResults.forEach((settledResult, j) => {
        const { viewerUnionId, labelId } = chunk[j]!;

        if (settledResult.status === 'fulfilled') {
          results.push(settledResult.value);
        } else {
          const reason = (settledResult as PromiseRejectedResult).reason;
          results.push({
            viewerUnionId,
            labelId,
            success: false,
            error: reason instanceof Error ? reason.message : String(reason),
          });
        }
        completed++;
        onProgress?.(completed, total);
      });

      // Add delay between chunks to avoid rate limiting (except for last chunk)
      if (i + BATCH_CONCURRENCY < combinations.length) {
        await this.delay(BATCH_DELAY_MS);
      }
    }

    const summary: BatchOperationSummary = {
      total,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };

    // If all operations failed, throw an error
    if (summary.failed > 0 && summary.succeeded === 0) {
      throw this.wrapError(
        new Error(`All ${summary.failed} operations failed`),
        operationName
      );
    }

    return summary;
  }

  /**
   * Delay utility
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wrap SDK errors with PolyVError for consistent error handling
   */
  private wrapError(error: unknown, operation: string): PolyVError {
    if (error instanceof PolyVError) {
      return error;
    }
    const message = error instanceof Error ? error.message : String(error);
    return new PolyVError(
      `${operation} failed: ${message}`,
      'VIEWER_API_ERROR',
      1,
      { originalError: error }
    );
  }
}
