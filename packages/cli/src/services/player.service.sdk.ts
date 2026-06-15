/**
 * @fileoverview Player service using PolyV Live API SDK
 * @author Development Team
 * @since 10.5.0
 */

import {
  PlayerServiceConfig,
  PlayerConfigGetOptions,
  PlayerConfigUpdateOptions,
  PlayerDecorateDisplayItem,
} from '../types/player';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { createSdkClient } from '../sdk';

/**
 * Player service for managing PolyV live streaming player settings using SDK
 */
export class PlayerServiceSdk {
  private readonly config: PlayerServiceConfig;
  private readonly authConfig: AuthConfig;

  /**
   * Creates a new PlayerServiceSdk instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: PlayerServiceConfig) {
    this.authConfig = authConfig;
    this.config = serviceConfig;
  }

  /**
   * Get channel decorate settings for CLI display
   * @param options Player config get options from CLI
   * @returns Promise resolving to player decorate display item
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getChannelDecorate(options: PlayerConfigGetOptions): Promise<PlayerDecorateDisplayItem> {
    // Validate parameters
    this.validateGetOptions(options);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const result = await client.player.getChannelDecorate(parseInt(options.channelId, 10));

    // Transform SDK response to CLI display item
    const player = result.player;
    return {
      watermarkEnabled: player.watermarkEnabled,
      watermarkUrl: player.iconUrl || '',
      watermarkPosition: player.iconPosition || 'br',
      watermarkOpacity: String(player.logoOpacity ?? 1),
      watermarkLink: player.iconLink || '',
      warmupEnabled: player.warmUpEnabled || 'N',
      warmupImageUrl: player.warmUpImageUrl || '',
      coverJumpUrl: player.coverJumpUrl || '',
      backgroundImageUrl: player.backgroundUrl || '',
      basePv: player.basePV ?? 0,
      actualPv: player.actualPV ?? 0,
    };
  }

  /**
   * Update channel decorate settings
   * @param options Player config update options from CLI
   * @returns Promise resolving to update result with success status and updated fields
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async updateChannelDecorate(
    options: PlayerConfigUpdateOptions
  ): Promise<{ success: boolean; updatedFields: string[] }> {
    // Validate parameters
    this.validateUpdateOptions(options);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Build SDK params
    const params: {
      watermarkEnabled?: 'Y' | 'N';
      iconUrl?: string;
      iconPosition?: 'tl' | 'tr' | 'bl' | 'br';
      logoOpacity?: number;
      warmUpEnabled?: 'Y' | 'N';
      warmUpImageUrl?: string;
      basePV?: number;
    } = {};

    const updatedFields: string[] = [];

    if (options.watermarkEnabled !== undefined) {
      params.watermarkEnabled = options.watermarkEnabled;
      updatedFields.push('watermarkEnabled');
    }
    if (options.watermarkUrl !== undefined) {
      params.iconUrl = options.watermarkUrl;
      updatedFields.push('watermarkUrl');
    }
    if (options.watermarkPosition !== undefined) {
      params.iconPosition = options.watermarkPosition;
      updatedFields.push('watermarkPosition');
    }
    if (options.watermarkOpacity !== undefined) {
      params.logoOpacity = options.watermarkOpacity;
      updatedFields.push('watermarkOpacity');
    }
    if (options.warmupEnabled !== undefined) {
      params.warmUpEnabled = options.warmupEnabled;
      updatedFields.push('warmupEnabled');
    }
    if (options.warmupImageUrl !== undefined) {
      params.warmUpImageUrl = options.warmupImageUrl;
      updatedFields.push('warmupImageUrl');
    }
    if (options.basePv !== undefined) {
      params.basePV = options.basePv;
      updatedFields.push('basePv');
    }

    // Call SDK
    await client.player.updateChannelDecorate(parseInt(options.channelId, 10), params);

    return {
      success: true,
      updatedFields,
    };
  }

  /**
   * Validates player config get options
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateGetOptions(options: PlayerConfigGetOptions): void {
    const errors: string[] = [];

    // Validate channelId parameter
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim().length === 0) {
      errors.push('channelId is required and must be a non-empty string');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Player config get options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  /**
   * Validates player config update options
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateUpdateOptions(options: PlayerConfigUpdateOptions): void {
    const errors: string[] = [];

    // Validate channelId parameter
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim().length === 0) {
      errors.push('channelId is required and must be a non-empty string');
    }

    // Validate watermarkPosition if provided
    if (options.watermarkPosition !== undefined) {
      const validPositions = ['tl', 'tr', 'bl', 'br'];
      if (!validPositions.includes(options.watermarkPosition)) {
        errors.push(`watermarkPosition must be one of: ${validPositions.join(', ')}`);
      }
    }

    // Validate watermarkOpacity if provided
    if (options.watermarkOpacity !== undefined) {
      if (typeof options.watermarkOpacity !== 'number' || options.watermarkOpacity < 0 || options.watermarkOpacity > 1) {
        errors.push('watermarkOpacity must be a number between 0 and 1');
      }
    }

    // Validate watermarkEnabled if provided
    if (options.watermarkEnabled !== undefined) {
      if (options.watermarkEnabled !== 'Y' && options.watermarkEnabled !== 'N') {
        errors.push('watermarkEnabled must be "Y" or "N"');
      }
    }

    // Validate warmupEnabled if provided
    if (options.warmupEnabled !== undefined) {
      if (options.warmupEnabled !== 'Y' && options.warmupEnabled !== 'N') {
        errors.push('warmupEnabled must be "Y" or "N"');
      }
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Player config update options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }
}
