/**
 * @fileoverview Channel command handler for CLI operations
 * @author Development Team
 * @since 2.1.0
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { ChannelServiceSdk } from '../services/channel.service.sdk';
import {
  ChannelCreateOptions,
  ChannelCreateRequest,
  ChannelModel,
  ChannelServiceConfig,
  ChannelListOptions,
  ChannelListRequest,
  ChannelListItem,
  ChannelGetOptions,
  ChannelDetailRequest,
  ChannelDetailModel,
  ChannelUpdateOptions,
  ChannelUpdateRequest,
  ChannelDeleteOptions,
  ChannelBatchDeleteRequest,
  BasicSetting
} from '../types/channel';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';

/**
 * Handler for channel-related CLI commands
 */
export class ChannelHandler extends BaseHandler {
  private readonly channelService: ChannelServiceSdk;

  /**
   * Creates a new ChannelHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: ChannelServiceConfig) {
    super();
    // Use SDK-based service
    this.channelService = new ChannelServiceSdk(authConfig, serviceConfig);
  }

  /**
   * Creates a new live streaming channel
   * @param options Channel creation options from CLI
   * @returns Promise that resolves when channel is created
   * 
   * @throws {PolyVValidationError} When channel options are invalid
   * @throws {PolyVError} When channel creation fails
   * 
   * @example
   * ```typescript
   * await channelHandler.create({
   *   name: 'My Live Stream',
   *   description: 'Test channel',
   *   output: 'table'
   * });
   * ```
   */
  async create(options: ChannelCreateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateCreateOptions(options);

      // Transform CLI options to API request
      const request = this.transformToCreateRequest(options);

      // Create channel via service
      const channel = await this.channelService.createChannel(request);

      // Display success result
      this.displayChannelCreated(channel, options.output);

    }, 'channel.create');
  }

  /**
   * Lists live streaming channels with pagination
   * @param options Channel list options from CLI
   * @returns Promise that resolves when channels are listed
   * 
   * @throws {PolyVValidationError} When channel options are invalid
   * @throws {PolyVError} When channel listing fails
   * 
   * @example
   * ```typescript
   * await channelHandler.listChannels({
   *   page: 1,
   *   limit: 20,
   *   output: 'table'
   * });
   * ```
   */
  async listChannels(options: ChannelListOptions = {}): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateListOptions(options);

      // Transform CLI options to API request
      const request = this.transformToListRequest(options);

      // List channels via service
      const channels = await this.channelService.listChannels(request);

      // Display results
      this.displayChannelsList(channels, request, options.output);

    }, 'channel.list');
  }

  /**
   * Gets detailed information for a specific channel
   * @param options Channel get options from CLI
   * @returns Promise that resolves when channel detail is displayed
   * 
   * @throws {PolyVValidationError} When channel options are invalid
   * @throws {PolyVError} When channel detail retrieval fails
   * 
   * @example
   * ```typescript
   * await channelHandler.getChannelDetail({
   *   channelId: '3151318',
   *   output: 'table'
   * });
   * ```
   */
  async getChannelDetail(options: ChannelGetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateGetOptions(options);

      // Transform CLI options to API request
      const request = this.transformToDetailRequest(options);

      // Get channel detail via service
      const channelDetail = await this.channelService.getChannelDetail(request);

      // Display results
      this.displayChannelDetail(channelDetail, options.output);

    }, 'channel.get');
  }

  /**
   * Updates an existing live streaming channel
   * @param options Channel update options from CLI
   * @returns Promise that resolves when channel is updated
   * 
   * @throws {PolyVValidationError} When channel options are invalid
   * @throws {PolyVError} When channel update fails
   * 
   * @example
   * ```typescript
   * await channelHandler.updateChannel({
   *   channelId: '3151318',
   *   name: 'Updated Channel Name',
   *   publisher: 'New Publisher',
   *   output: 'table'
   * });
   * ```
   */
  async updateChannel(options: ChannelUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateUpdateOptions(options);

      // Transform CLI options to API request
      const request = this.transformToUpdateRequest(options);

      // Update channel via service
      await this.channelService.updateChannel(request);

      // Display success result
      this.displayChannelUpdated(options);

    }, 'channel.update');
  }

  /**
   * Deletes a single live streaming channel with confirmation
   * @param options Channel delete options from CLI
   * @returns Promise that resolves when channel is deleted
   * 
   * @throws {PolyVValidationError} When channel options are invalid
   * @throws {PolyVError} When channel deletion fails
   * 
   * @example
   * ```typescript
   * await channelHandler.deleteChannel({
   *   channelId: '3151318',
   *   force: false,
   *   output: 'table'
   * });
   * ```
   */
  async deleteChannel(options: ChannelDeleteOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateSingleDeleteOptions(options);

      // Check for confirmation unless force flag is used
      if (!options.force) {
        const { confirmDeletion } = await import('../utils/confirmation');
        const confirmed = await confirmDeletion(
          `Are you sure you want to delete channel '${options.channelId}'? This action cannot be undone.`,
          'yes'
        );
        
        if (!confirmed) {
          this.displayInfo('Channel deletion cancelled by user');
          return;
        }
      }

      // Delete channel via service
      await this.channelService.deleteChannel(options.channelId);

      // Display success result
      this.displayChannelDeleted(options);

    }, 'channel.delete');
  }

  /**
   * Deletes multiple live streaming channels
   * @param options Channel delete options from CLI (with multiple channelIds)
   * @returns Promise that resolves when channels are deleted
   * 
   * @throws {PolyVValidationError} When channel options are invalid
   * @throws {PolyVError} When channel deletion fails
   * 
   * @example
   * ```typescript
   * await channelHandler.deleteChannels({
   *   channelIds: ['3151318', '3151319'],
   *   force: false,
   *   output: 'table'
   * });
   * ```
   */
  async deleteChannels(options: any): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateDeleteOptions(options);

      // Transform CLI options to API request
      const request = this.transformToDeleteRequest(options);

      // Delete channels via service
      await this.channelService.batchDeleteChannels(request);

      // Display success result
      this.displayChannelsDeleted(options);

    }, 'channel.delete');
  }

  /**
   * Validates channel creation options from CLI
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateCreateOptions(options: ChannelCreateOptions): void {
    const errors: string[] = [];

    // Validate required fields
    if (!options.name || typeof options.name !== 'string') {
      errors.push('Channel name is required and must be a string');
    } else if (options.name.trim().length === 0) {
      errors.push('Channel name cannot be empty');
    } else if (options.name.length > 100) {
      errors.push('Channel name cannot exceed 100 characters');
    }

    // Validate optional fields
    if (options.description !== undefined) {
      if (typeof options.description !== 'string') {
        errors.push('Description must be a string');
      } else if (options.description.length > 500) {
        errors.push('Description cannot exceed 500 characters');
      }
    }

    if (options.maxViewers !== undefined) {
      if (typeof options.maxViewers !== 'number' || options.maxViewers < 0) {
        errors.push('Max viewers must be a non-negative number');
      } else if (options.maxViewers > 100000) {
        errors.push('Max viewers cannot exceed 100,000');
      }
    }

    if (options.autoRecord !== undefined && typeof options.autoRecord !== 'boolean') {
      errors.push('Auto record must be a boolean value');
    }

    if (options.output !== undefined && !['table', 'json'].includes(options.output)) {
      errors.push('Output format must be either "table" or "json"');
    }

    if (options.scene !== undefined) {
      const validScenes = ['topclass', 'alone', 'seminar', 'train', 'double', 'guide'];
      if (!validScenes.includes(options.scene)) {
        errors.push(`Scene must be one of: ${validScenes.join(', ')}`);
      }
    }

    if (options.template !== undefined) {
      const validTemplates = ['ppt', 'portrait_ppt', 'alone', 'portrait_alone', 'topclass', 'portrait_topclass', 'seminar'];
      if (!validTemplates.includes(options.template)) {
        errors.push(`Template must be one of: ${validTemplates.join(', ')}`);
      }
    }

    if (options.password !== undefined) {
      if (typeof options.password !== 'string') {
        errors.push('Password must be a string');
      } else if (options.password.length < 6 || options.password.length > 16) {
        errors.push('Password must be 6-16 characters long');
      } else if (!/^[a-zA-Z0-9]+$/.test(options.password)) {
        errors.push('Password must contain only alphanumeric characters');
      }
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Channel creation options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  /**
   * Transforms CLI options to API request format
   * @param options CLI options
   * @returns API request object
   */
  private transformToCreateRequest(options: ChannelCreateOptions): ChannelCreateRequest {
    const request: ChannelCreateRequest = {
      name: options.name.trim(),
      newScene: options.scene || 'topclass', // Default scene
      template: options.template || 'ppt' // Default template
    };

    // Add optional parameters
    if (options.password) {
      request.channelPasswd = options.password;
    }

    // Note: description, maxViewers, and autoRecord are CLI-specific options
    // They would be used for additional configuration if supported by the API
    // For now, we'll store them as metadata or handle them separately

    return request;
  }

  /**
   * Displays the created channel information
   * @param channel Created channel model
   * @param format Output format
   */
  private displayChannelCreated(channel: ChannelModel, format: OutputFormat = 'table'): void {
    const displayData = {
      channelId: channel.channelId,
      name: channel.name,
      userId: channel.userId,
      password: channel.channelPasswd ? '***' : '-', // Mask password for security
      scene: channel.newScene,
      template: channel.template,
      status: channel.status || 'waiting',
      created: channel.createdAt ? channel.createdAt.toLocaleString() : 'Just now'
    };

    this.displaySuccess('Channel created successfully', displayData, format);

    // Show additional information in table mode
    if (format === 'table') {
      this.displayInfo('Channel is ready for streaming configuration');
      
      if (channel.channelPasswd) {
        this.displayWarning('Channel password has been set - remember to provide it to viewers');
      }
    }
  }

  /**
   * Validates channel list options from CLI
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateListOptions(options: ChannelListOptions): void {
    const errors: string[] = [];

    // Validate page parameter
    if (options.page !== undefined) {
      if (typeof options.page !== 'number' || !Number.isInteger(options.page) || options.page < 1) {
        errors.push('Page must be a positive integer (minimum 1)');
      }
    }

    // Validate limit parameter
    if (options.limit !== undefined) {
      if (typeof options.limit !== 'number' || !Number.isInteger(options.limit) || options.limit < 1 || options.limit > 100) {
        errors.push('Limit must be an integer between 1 and 100');
      }
    }

    // Validate output format
    if (options.output !== undefined && !['table', 'json'].includes(options.output)) {
      errors.push('Output format must be either "table" or "json"');
    }

    // Validate optional string parameters
    if (options.categoryId !== undefined && (typeof options.categoryId !== 'string' || options.categoryId.trim().length === 0)) {
      errors.push('Category ID must be a non-empty string');
    }

    if (options.keyword !== undefined && (typeof options.keyword !== 'string' || options.keyword.trim().length === 0)) {
      errors.push('Keyword must be a non-empty string');
    }

    if (options.labelId !== undefined && (typeof options.labelId !== 'string' || options.labelId.trim().length === 0)) {
      errors.push('Label ID must be a non-empty string');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Channel list options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  /**
   * Validates channel get options from CLI
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateGetOptions(options: ChannelGetOptions): void {
    const errors: string[] = [];

    // Validate required channelId parameter
    if (!options.channelId) {
      errors.push('Channel ID is required');
    } else if (typeof options.channelId !== 'string') {
      errors.push('Channel ID must be a string');
    } else if (options.channelId.trim().length === 0) {
      errors.push('Channel ID cannot be empty');
    }

    // Validate output format
    if (options.output !== undefined && !['table', 'json'].includes(options.output)) {
      errors.push('Output format must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Channel get options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  /**
   * Validates channel update options from CLI
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateUpdateOptions(options: ChannelUpdateOptions): void {
    const errors: string[] = [];

    // Validate required channelId parameter
    if (!options.channelId) {
      errors.push('Channel ID is required');
    } else if (typeof options.channelId !== 'string') {
      errors.push('Channel ID must be a string');
    } else if (options.channelId.trim().length === 0) {
      errors.push('Channel ID cannot be empty');
    }

    // Ensure at least one update field is provided
    const updateFields = [
      'name', 'description', 'publisher', 'password', 'maxViewers',
      'autoRecord', 'startTime', 'endTime', 'pageView', 'likes',
      'coverImg', 'splashImg'
    ];
    const hasUpdateField = updateFields.some(field => options[field as keyof ChannelUpdateOptions] !== undefined);
    
    if (!hasUpdateField) {
      errors.push('At least one update parameter must be provided');
    }

    // Validate optional fields
    if (options.name !== undefined) {
      if (typeof options.name !== 'string') {
        errors.push('Channel name must be a string');
      } else if (options.name.trim().length === 0) {
        errors.push('Channel name cannot be empty');
      } else if (options.name.length > 100) {
        errors.push('Channel name cannot exceed 100 characters');
      }
    }

    if (options.description !== undefined) {
      if (typeof options.description !== 'string') {
        errors.push('Description must be a string');
      } else if (options.description.length > 500) {
        errors.push('Description cannot exceed 500 characters');
      }
    }

    if (options.publisher !== undefined) {
      if (typeof options.publisher !== 'string') {
        errors.push('Publisher must be a string');
      }
    }

    if (options.password !== undefined) {
      if (typeof options.password !== 'string') {
        errors.push('Password must be a string');
      } else if (options.password.length < 6 || options.password.length > 16) {
        errors.push('Password must be 6-16 characters long');
      } else if (!/^[a-zA-Z0-9]+$/.test(options.password)) {
        errors.push('Password must contain only alphanumeric characters');
      }
    }

    if (options.maxViewers !== undefined) {
      if (typeof options.maxViewers !== 'number' || options.maxViewers <= 0) {
        errors.push('Max viewers must be a positive number');
      }
    }

    if (options.autoRecord !== undefined && typeof options.autoRecord !== 'boolean') {
      errors.push('Auto record must be a boolean value');
    }

    if (options.startTime !== undefined) {
      if (typeof options.startTime !== 'number' || options.startTime < 0) {
        errors.push('Start time must be a non-negative timestamp');
      }
    }

    if (options.endTime !== undefined) {
      if (typeof options.endTime !== 'number' || options.endTime < 0) {
        errors.push('End time must be a non-negative timestamp');
      }
      if (options.startTime !== undefined && options.endTime <= options.startTime) {
        errors.push('End time must be greater than start time');
      }
    }

    if (options.pageView !== undefined) {
      if (typeof options.pageView !== 'number' || options.pageView < 0) {
        errors.push('Page view count must be a non-negative number');
      }
    }

    if (options.likes !== undefined) {
      if (typeof options.likes !== 'number' || options.likes < 0) {
        errors.push('Likes count must be a non-negative number');
      }
    }

    if (options.coverImg !== undefined && typeof options.coverImg !== 'string') {
      errors.push('Cover image URL must be a string');
    }

    if (options.splashImg !== undefined && typeof options.splashImg !== 'string') {
      errors.push('Splash image URL must be a string');
    }

    // Validate output format
    if (options.output !== undefined && !['table', 'json'].includes(options.output)) {
      errors.push('Output format must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Channel update options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  /**
   * Transforms CLI update options to API request format
   * @param options CLI options
   * @returns Formatted API request
   */
  private transformToUpdateRequest(options: ChannelUpdateOptions): ChannelUpdateRequest {
    const request: ChannelUpdateRequest = {
      channelId: options.channelId.trim()
    };

    // Build basicSetting object if any basic settings are provided
    const basicSetting: BasicSetting = {};
    let hasBasicSetting = false;

    if (options.name !== undefined) {
      basicSetting.name = options.name.trim();
      hasBasicSetting = true;
    }

    if (options.description !== undefined) {
      basicSetting.desc = options.description;
      hasBasicSetting = true;
    }

    if (options.publisher !== undefined) {
      basicSetting.publisher = options.publisher;
      hasBasicSetting = true;
    }

    if (options.password !== undefined) {
      basicSetting.channelPasswd = options.password;
      hasBasicSetting = true;
    }

    if (options.maxViewers !== undefined) {
      basicSetting.maxViewer = options.maxViewers;
      hasBasicSetting = true;
    }

    if (options.startTime !== undefined) {
      basicSetting.startTime = options.startTime;
      hasBasicSetting = true;
    }

    if (options.endTime !== undefined) {
      basicSetting.endTime = options.endTime;
      hasBasicSetting = true;
    }

    if (options.pageView !== undefined) {
      basicSetting.pageView = options.pageView;
      hasBasicSetting = true;
    }

    if (options.likes !== undefined) {
      basicSetting.likes = options.likes;
      hasBasicSetting = true;
    }

    if (options.coverImg !== undefined) {
      basicSetting.coverImg = options.coverImg;
      hasBasicSetting = true;
    }

    if (options.splashImg !== undefined) {
      basicSetting.splashImg = options.splashImg;
      hasBasicSetting = true;
    }

    if (hasBasicSetting) {
      request.basicSetting = basicSetting;
    }

    return request;
  }

  /**
   * Displays channel update success message
   * @param options Original CLI options
   */
  private displayChannelUpdated(options: ChannelUpdateOptions): void {
    const updateSummary: string[] = [];
    
    if (options.name !== undefined) updateSummary.push(`Name: ${options.name}`);
    if (options.description !== undefined) updateSummary.push(`Description: ${options.description}`);
    if (options.publisher !== undefined) updateSummary.push(`Publisher: ${options.publisher}`);
    if (options.password !== undefined) updateSummary.push('Password: ***');
    if (options.maxViewers !== undefined) updateSummary.push(`Max Viewers: ${options.maxViewers}`);
    if (options.startTime !== undefined) updateSummary.push(`Start Time: ${new Date(options.startTime).toLocaleString()}`);
    if (options.endTime !== undefined) updateSummary.push(`End Time: ${new Date(options.endTime).toLocaleString()}`);
    if (options.pageView !== undefined) updateSummary.push(`Page Views: ${options.pageView}`);
    if (options.likes !== undefined) updateSummary.push(`Likes: ${options.likes}`);
    if (options.coverImg !== undefined) updateSummary.push(`Cover Image: ${options.coverImg}`);
    if (options.splashImg !== undefined) updateSummary.push(`Splash Image: ${options.splashImg}`);

    this.displaySuccess(`Channel ${options.channelId} updated successfully`);
    
    if (updateSummary.length > 0) {
      this.displayInfo('Updated fields:');
      updateSummary.forEach(summary => this.displayInfo(`  • ${summary}`));
    }

    if (options.password) {
      this.displayWarning('Channel password has been updated - remember to provide it to viewers');
    }
  }

  /**
   * Validates single channel delete options from CLI
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateSingleDeleteOptions(options: ChannelDeleteOptions): void {
    const errors: string[] = [];

    // Validate required channelId parameter
    if (!options.channelId) {
      errors.push('Channel ID is required');
    } else if (typeof options.channelId !== 'string') {
      errors.push('Channel ID must be a string');
    } else if (options.channelId.trim().length === 0) {
      errors.push('Channel ID cannot be empty');
    }

    // Validate force flag
    if (options.force !== undefined && typeof options.force !== 'boolean') {
      errors.push('Force flag must be a boolean value');
    }

    // Validate output format
    if (options.output !== undefined && !['table', 'json'].includes(options.output)) {
      errors.push('Output format must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Channel delete options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  /**
   * Validates channel delete options from CLI (for multiple channels)
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateDeleteOptions(options: any): void {
    const errors: string[] = [];

    // Validate channelIds parameter
    if (!options.channelIds) {
      errors.push('Channel IDs are required');
    } else if (!Array.isArray(options.channelIds)) {
      errors.push('Channel IDs must be an array');
    } else if (options.channelIds.length === 0) {
      errors.push('At least one channel ID must be provided');
    } else if (options.channelIds.length > 100) {
      errors.push('Cannot delete more than 100 channels at once');
    } else {
      // Validate each channel ID
      for (let i = 0; i < options.channelIds.length; i++) {
        const channelId = options.channelIds[i];
        if (typeof channelId !== 'string') {
          errors.push(`Channel ID at position ${i + 1} must be a string`);
        } else if (channelId.trim().length === 0) {
          errors.push(`Channel ID at position ${i + 1} cannot be empty`);
        }
      }
    }

    // Validate output format
    if (options.output !== undefined && !['table', 'json'].includes(options.output)) {
      errors.push('Output format must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Channel delete options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  /**
   * Transforms CLI delete options to API request format (legacy multiple channels)
   * @param options CLI options with channelIds array
   * @returns API request object
   */
  private transformToDeleteRequest(options: any): ChannelBatchDeleteRequest {
    return {
      channelIds: options.channelIds.map((id: string) => id.trim())
    };
  }

  /**
   * Displays the result of channel deletion (legacy multiple channels)
   * @param options Original delete options with channelIds array
   */
  private displayChannelsDeleted(options: any): void {
    const channelCount = options.channelIds.length;
    const channelText = channelCount === 1 ? 'channel' : 'channels';
    
    this.displaySuccess(`Successfully deleted ${channelCount} ${channelText}`);
    
    if (options.output === 'json') {
      const jsonData = {
        deleted: true,
        channelIds: options.channelIds,
        count: channelCount
      };
      this.displayData(jsonData, 'json');
    } else {
      this.displayInfo('Deleted channels:');
      options.channelIds.forEach((channelId: string) => {
        this.displayInfo(`  • Channel ${channelId}`);
      });
    }
  }

  /**
   * Displays the result of single channel deletion
   * @param options Original delete options
   */
  private displayChannelDeleted(options: ChannelDeleteOptions): void {
    this.displaySuccess(`Successfully deleted channel ${options.channelId}`);
    
    if (options.output === 'json') {
      const jsonData = {
        deleted: true,
        channelId: options.channelId,
        timestamp: new Date().toISOString()
      };
      this.displayData(jsonData, 'json');
    } else {
      this.displayInfo(`Channel ${options.channelId} has been permanently deleted`);
      this.displayWarning('This action cannot be undone');
    }
  }

  /**
   * Transforms CLI options to API request format
   * @param options CLI options
   * @returns API request object
   */
  private transformToListRequest(options: ChannelListOptions): ChannelListRequest {
    const request: ChannelListRequest = {};

    // Add pagination parameters with defaults
    if (options.page !== undefined) {
      request.page = options.page;
    }
    if (options.limit !== undefined) {
      request.limit = options.limit;
    }

    // Add optional filters
    if (options.categoryId) {
      request.categoryId = options.categoryId.trim();
    }
    if (options.keyword) {
      request.keyword = options.keyword.trim();
    }
    if (options.labelId) {
      request.labelId = options.labelId.trim();
    }

    return request;
  }

  /**
   * Transforms CLI options to API request format for channel detail
   * @param options CLI options
   * @returns API request object
   */
  private transformToDetailRequest(options: ChannelGetOptions): ChannelDetailRequest {
    return {
      channelId: options.channelId.trim()
    };
  }

  /**
   * Displays the channels list information
   * @param channels Array of channel list items
   * @param request Original request for context
   * @param format Output format
   */
  private displayChannelsList(
    channels: ChannelListItem[],
    request: ChannelListRequest,
    format: OutputFormat = 'table'
  ): void {
    // Handle empty results
    if (channels.length === 0) {
      this.displayInfo('No channels found');
      return;
    }

    if (format === 'json') {
      // Display as JSON
      const jsonData = {
        channels: channels.map(channel => ({
          channelId: channel.channelId,
          name: channel.name,
          status: channel.status,
          scene: channel.scene,
          template: channel.template,
          createdAt: channel.createdAt.toISOString(),
          description: channel.description,
          maxViewers: channel.maxViewers
        })),
        pagination: {
          page: request.page ?? 1,
          limit: request.limit ?? 20,
          total: channels.length
        }
      };
      this.displayData(jsonData, 'json');
    } else {
      // Display as table
      const tableData = channels.map(channel => ({
        'Channel ID': channel.channelId,
        'Name': channel.name,
        'Status': channel.status,
        'Scene': channel.scene,
        'Template': channel.template,
        'Created': channel.createdAt.toLocaleDateString()
      }));

      this.displaySuccess(`Found ${channels.length} channels`, tableData, 'table');
      
      // Show pagination info
      const page = request.page ?? 1;
      const limit = request.limit ?? 20;
      this.displayInfo(`Page ${page}, showing up to ${limit} channels per page`);
    }
  }

  /**
   * Displays detailed information for a specific channel
   * @param channelDetail Channel detail model
   * @param format Output format
   */
  private displayChannelDetail(channelDetail: ChannelDetailModel, format: OutputFormat = 'table'): void {
    if (format === 'json') {
      // Display as JSON with all available data
      const jsonData = {
        channelId: channelDetail.channelId,
        name: channelDetail.name,
        scene: channelDetail.scene,
        newScene: channelDetail.newScene,
        template: channelDetail.template,
        channelPasswd: channelDetail.channelPasswd ? '***masked***' : null,
        publisher: channelDetail.publisher,
        startTime: channelDetail.startTime,
        endTime: channelDetail.endTime,
        pureRtcEnabled: channelDetail.pureRtcEnabled,
        pageView: channelDetail.pageView,
        likes: channelDetail.likes,
        coverImg: channelDetail.coverImg,
        splashImg: channelDetail.splashImg,
        splashEnabled: channelDetail.splashEnabled,
        bgImg: channelDetail.bgImg,
        desc: channelDetail.desc,
        consultingMenuEnabled: channelDetail.consultingMenuEnabled,
        maxViewerRestrict: channelDetail.maxViewerRestrict,
        maxViewer: channelDetail.maxViewer,
        watchStatus: channelDetail.watchStatus,
        watchStatusText: channelDetail.watchStatusText,
        userCategory: channelDetail.userCategory,
        authSettings: channelDetail.authSettings,
        linkMicLimit: channelDetail.linkMicLimit,
        createdAccountId: channelDetail.createdAccountId,
        createdAccountEmail: channelDetail.createdAccountEmail,
        createdTime: channelDetail.createdTime,
        labelData: channelDetail.labelData,
        clientAloneTemplateBackgroundUrl: channelDetail.clientAloneTemplateBackgroundUrl,
        liveCdnBackgroundUrl: channelDetail.liveCdnBackgroundUrl,
        pushUrl: channelDetail.pushUrl ? '***masked***' : null,
        pushSecret: channelDetail.pushSecret ? '***masked***' : null,
        streamType: channelDetail.streamType,
        onlyOutEnabled: channelDetail.onlyOutEnabled
      };
      this.displayData(jsonData, 'json');
    } else {
      // Display as grouped tables for better readability
      this.displaySuccess(`Channel Details: ${channelDetail.name}`, null, 'table');
      
      // Basic Information
      const basicInfo = {
        'Channel ID': channelDetail.channelId.toString(),
        'Name': channelDetail.name,
        'Publisher': channelDetail.publisher || '-',
        'Description': channelDetail.desc || '-',
        'Status': `${channelDetail.watchStatus} (${channelDetail.watchStatusText})`,
        'Scene': channelDetail.newScene !== 'undefined' ? channelDetail.newScene : channelDetail.scene,
        'Template': channelDetail.template !== 'undefined' ? channelDetail.template : '-'
      };
      this.displayInfo('📋 Basic Information');
      this.displayData(basicInfo, 'table');

      // Configuration Settings
      const configInfo = {
        'Channel Password': channelDetail.channelPasswd ? 'Set (***masked***)' : 'Not set',
        'Pure RTC': channelDetail.pureRtcEnabled === 'Y' ? 'Enabled' : 'Disabled',
        'Max Viewer Restrict': channelDetail.maxViewerRestrict === 'Y' ? 'Enabled' : 'Disabled',
        'Max Viewers': channelDetail.maxViewer > 0 ? channelDetail.maxViewer.toString() : 'Unlimited',
        'Link Mic Limit': channelDetail.linkMicLimit.toString(),
        'Consulting Menu': channelDetail.consultingMenuEnabled === 'Y' ? 'Enabled' : 'Disabled',
        'Splash Page': channelDetail.splashEnabled === 'Y' ? 'Enabled' : 'Disabled'
      };
      this.displayInfo('⚙️ Configuration');
      this.displayData(configInfo, 'table');

      // Statistics and Timing
      const statsInfo = {
        'Page Views': channelDetail.pageView.toString(),
        'Likes': channelDetail.likes.toString(),
        'Start Time': channelDetail.startTime > 0 ? new Date(channelDetail.startTime).toLocaleString() : 'Not set',
        'End Time': channelDetail.endTime > 0 ? new Date(channelDetail.endTime).toLocaleString() : 'Not set',
        'Created Time': new Date(channelDetail.createdTime).toLocaleString(),
        'Created By': channelDetail.createdAccountEmail || channelDetail.createdAccountId
      };
      this.displayInfo('📊 Statistics & Timing');
      this.displayData(statsInfo, 'table');

      // Category and Labels
      if (channelDetail.userCategory) {
        const categoryInfo = {
          'Category ID': channelDetail.userCategory.categoryId.toString(),
          'Category Name': channelDetail.userCategory.categoryName,
          'Rank': channelDetail.userCategory.rank.toString()
        };
        this.displayInfo('📁 Category Information');
        this.displayData(categoryInfo, 'table');
      }

      // Authentication Settings Summary
      if (channelDetail.authSettings && channelDetail.authSettings.length > 0) {
        const authSummary = channelDetail.authSettings.map((auth) => ({
          'Rank': auth.rank.toString(),
          'Type': auth.authType,
          'Enabled': auth.enabled,
          'Global Setting': auth.globalSettingEnabled
        }));
        this.displayInfo('🔐 Authentication Settings');
        this.displayData(authSummary, 'table');
      }

      // Labels
      if (channelDetail.labelData && channelDetail.labelData.length > 0) {
        this.displayInfo(`Labels: ${channelDetail.labelData.join(', ')}`);
      }

      // Additional URLs (if available)
      const urls: string[] = [];
      if (channelDetail.coverImg) urls.push(`Cover Image: ${channelDetail.coverImg}`);
      if (channelDetail.splashImg) urls.push(`Splash Image: ${channelDetail.splashImg}`);
      if (channelDetail.bgImg) urls.push(`Background Image: ${channelDetail.bgImg}`);
      if (urls.length > 0) {
        this.displayInfo('Images:\n' + urls.join('\n'));
      }
    }
  }

}