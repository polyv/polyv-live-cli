/**
 * @fileoverview Platform label service using PolyV Live API SDK
 * @author Development Team
 * @since 13.4.0
 */

import { AuthConfig } from '../types/auth';
import { PlatformLabelServiceConfig, ViewerLabel } from '../types/platform-label';
import { createSdkClient } from '../sdk';
import { PolyVValidationError } from '../utils/errors';

/**
 * Platform label service for managing viewer labels using SDK
 */
export class PlatformLabelServiceSdk {
  private readonly config: PlatformLabelServiceConfig;
  private readonly authConfig: AuthConfig;

  /**
   * Creates a new PlatformLabelServiceSdk instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig?: PlatformLabelServiceConfig) {
    this.authConfig = authConfig;
    this.config = serviceConfig || {
      baseUrl: 'https://api.polyv.net',
      timeout: 30000,
      debug: false,
    };
  }

  /**
   * List all viewer labels
   * @returns Promise resolving to array of viewer labels
   *
   * @throws {PolyVError} When API call fails
   */
  async listViewerLabels(): Promise<ViewerLabel[]> {
    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const result = await client.v4User.listViewerLabels();

    return result as unknown as ViewerLabel[];
  }

  /**
   * Create a viewer label
   * @param params Creation parameters
   * @returns Promise resolving to created label
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async createViewerLabel(params: { labelName: string }): Promise<ViewerLabel> {
    // Validate labelName
    this.validateLabelName(params.labelName);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const result = await client.v4User.createViewerLabel({
      labelName: params.labelName,
    });

    return result as unknown as ViewerLabel;
  }

  /**
   * Update a viewer label
   * @param params Update parameters
   * @returns Promise resolving when update is complete
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async updateViewerLabel(params: { labelId: number; labelName: string }): Promise<void> {
    // Validate labelId
    this.validateLabelId(params.labelId);

    // Validate labelName
    this.validateLabelName(params.labelName);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    await client.v4User.updateViewerLabel({
      labelId: params.labelId,
      labelName: params.labelName,
    });
  }

  /**
   * Delete a viewer label
   * @param params Delete parameters
   * @returns Promise resolving when delete is complete
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async deleteViewerLabel(params: { labelId: number }): Promise<void> {
    // Validate labelId
    this.validateLabelId(params.labelId);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    await client.v4User.deleteViewerLabel({
      labelId: params.labelId,
    });
  }

  // ========================================
  // Private Validation Methods
  // ========================================

  /**
   * Validates label name
   * @param labelName Label name to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateLabelName(labelName: string): void {
    if (!labelName || typeof labelName !== 'string' || labelName.trim().length === 0) {
      throw new PolyVValidationError(
        'labelName 不能为空',
        'labelName',
        labelName,
        'validation_failed'
      );
    }
  }

  /**
   * Validates label ID
   * @param labelId Label ID to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateLabelId(labelId: number): void {
    if (labelId === undefined || labelId === null || labelId <= 0 || !Number.isInteger(labelId)) {
      throw new PolyVValidationError(
        'labelId 必须是正整数',
        'labelId',
        labelId,
        'validation_failed'
      );
    }
  }
}
