/**
 * @fileoverview Resource handlers for scene execution (Story 8-4)
 * Handles create and rollback operations for different resource types
 */

import { PolyVClient } from 'polyv-live-api-sdk';

/**
 * Resource handler interface
 */
export interface ResourceHandler {
  /**
   * Create a resource
   * @param params Resource creation parameters
   * @param outputConfig Output field mapping (optional)
   * @returns Created resource data
   */
  create(params: Record<string, any>, outputConfig?: Record<string, string>): Promise<Record<string, any>>;

  /**
   * Rollback (delete) a resource
   * @param resource Resource data returned from create
   */
  rollback?(resource: Record<string, any>): Promise<void>;
}

/**
 * All resource handlers
 */
export interface ResourceHandlers {
  channel: ResourceHandler;
  product: ResourceHandler;
  coupon: ResourceHandler;
  watchCondition: ResourceHandler;
  productEnabled: ResourceHandler;
  couponEnabled: ResourceHandler;
  couponChannel: ResourceHandler;
}

/**
 * Create resource handlers for a PolyV client
 * @param client PolyV SDK client
 * @returns Resource handlers object
 */
export function createResourceHandlers(client: PolyVClient): ResourceHandlers {
  return {
    channel: createChannelHandler(client),
    product: createProductHandler(client),
    coupon: createCouponHandler(client),
    watchCondition: createWatchConditionHandler(client),
    productEnabled: createProductEnabledHandler(client),
    couponEnabled: createCouponEnabledHandler(client),
    couponChannel: createCouponChannelHandler(client),
  };
}

/**
 * Create channel resource handler
 */
function createChannelHandler(client: PolyVClient): ResourceHandler {
  return {
    async create(
      params: Record<string, any>,
      outputConfig?: Record<string, string>
    ): Promise<Record<string, any>> {
      // Use V4 API for channel creation
      const response = await client.channel.createChannelV4(params as any);

      // Map output fields if config provided
      if (outputConfig) {
        return mapOutputFields(response, outputConfig);
      }

      // Default output
      return {
        channelId: response.channelId,
        channelName: params['name'],
        channelPasswd: response.channelPasswd,
        userId: response.userId,
      };
    },

    async rollback(resource: Record<string, any>): Promise<void> {
      const channelId = resource['channelId'];
      if (!channelId) {
        throw new Error('Cannot rollback channel: channelId is missing');
      }
      const userId = resource['userId'] || resource['createdUserId'] || '';
      await client.channel.deleteChannel(String(channelId), userId);
    },
  };
}

/**
 * Create watch condition resource handler
 */
function createWatchConditionHandler(client: PolyVClient): ResourceHandler {
  return {
    async create(
      params: Record<string, any>,
      outputConfig?: Record<string, string>
    ): Promise<Record<string, any>> {
      // Extract channelId from params (may be a reference like {channel.channelId})
      const channelId = params['channelId'];
      if (!channelId) {
        throw new Error('channelId is required for watch condition');
      }

      // Extract authSettings from params
      const authSettings = params['authSettings'];
      if (!authSettings || !Array.isArray(authSettings)) {
        throw new Error('authSettings array is required for watch condition');
      }

      // Call SDK to update watch condition
      await client.channel.updateWatchCondition({
        channelId: String(channelId),
        authSettings: authSettings as any[],
      });

      // Return result
      const result = {
        channelId,
        authSettings,
        success: true,
      };

      if (outputConfig) {
        return mapOutputFields(result, outputConfig);
      }

      return result;
    },

    // Watch condition doesn't need rollback - channel deletion will handle it
  };
}

/**
 * Create product resource handler
 */
function createProductHandler(client: PolyVClient): ResourceHandler {
  return {
    async create(
      params: Record<string, any>,
      outputConfig?: Record<string, string>
    ): Promise<Record<string, any>> {
      // Validate required fields
      if (!params['channelId']) {
        throw new Error('channelId is required for product creation');
      }

      // Cast params to the expected type - runtime validation ensures correctness
      const response = await client.channel.addChannelProduct(params as any);

      // Map output fields if config provided
      if (outputConfig) {
        return mapOutputFields(response, outputConfig);
      }

      // Default output
      return {
        productId: response.productId,
        name: response.name,
        channelId: params['channelId'],
      };
    },

    async rollback(resource: Record<string, any>): Promise<void> {
      const channelId = resource['channelId'];
      const productId = resource['productId'];
      if (!channelId || !productId) {
        throw new Error('Cannot rollback product: channelId or productId is missing');
      }
      await client.channel.deleteChannelProduct({
        channelId,
        productId,
      });
    },
  };
}

/**
 * Create product enabled resource handler
 */
function createProductEnabledHandler(client: PolyVClient): ResourceHandler {
  return {
    async create(
      params: Record<string, any>,
      outputConfig?: Record<string, string>
    ): Promise<Record<string, any>> {
      if (!params['channelId']) {
        throw new Error('channelId is required for productEnabled');
      }
      if (!params['enabled']) {
        throw new Error('enabled is required for productEnabled');
      }

      await client.channel.updateChannelProductEnabled({
        channelId: String(params['channelId']),
        enabled: params['enabled'],
      });

      const result = {
        channelId: params['channelId'],
        enabled: params['enabled'],
        success: true,
      };

      if (outputConfig) {
        return mapOutputFields(result, outputConfig);
      }

      return result;
    },
  };
}

/**
 * Create coupon enabled resource handler
 */
function createCouponEnabledHandler(client: PolyVClient): ResourceHandler {
  return {
    async create(
      params: Record<string, any>,
      outputConfig?: Record<string, string>
    ): Promise<Record<string, any>> {
      if (!params['channelId']) {
        throw new Error('channelId is required for couponEnabled');
      }
      if (!params['enabled']) {
        throw new Error('enabled is required for couponEnabled');
      }

      await client.v4Channel.updateCouponEnabled({
        channelId: String(params['channelId']),
        enabled: params['enabled'],
      });

      const result = {
        channelId: params['channelId'],
        enabled: params['enabled'],
        success: true,
      };

      if (outputConfig) {
        return mapOutputFields(result, outputConfig);
      }

      return result;
    },
  };
}

/**
 * Create coupon resource handler
 */
function createCouponHandler(client: PolyVClient): ResourceHandler {
  return {
    async create(
      params: Record<string, any>,
      outputConfig?: Record<string, string>
    ): Promise<Record<string, any>> {
      // Cast params to the expected type - runtime validation ensures correctness
      const couponId = await client.v4Platform.createCoupon(params as any);

      // Map output fields if config provided
      if (outputConfig) {
        return mapOutputFields({ couponId, ...params }, outputConfig);
      }

      // Default output
      return {
        couponId,
        name: params['name'],
      };
    },

    async rollback(resource: Record<string, any>): Promise<void> {
      const couponId = resource['couponId'];
      if (!couponId) {
        throw new Error('Cannot rollback coupon: couponId is missing');
      }
      await client.v4Platform.deleteCouponsBatch({
        couponIds: [couponId],
      });
    },
  };
}

/**
 * Create coupon-channel association resource handler
 */
function createCouponChannelHandler(client: PolyVClient): ResourceHandler {
  return {
    async create(
      params: Record<string, any>,
      outputConfig?: Record<string, string>
    ): Promise<Record<string, any>> {
      if (!params['channelId']) {
        throw new Error('channelId is required for couponChannel');
      }
      if (!params['couponIds'] || !Array.isArray(params['couponIds']) || params['couponIds'].length === 0) {
        throw new Error('couponIds array is required for couponChannel');
      }

      await (client as any).v4Channel.addChannelCoupon({
        channelId: String(params['channelId']),
        couponIds: params['couponIds'] as string[],
      });

      const result = {
        channelId: params['channelId'],
        couponIds: params['couponIds'],
        success: true,
      };

      if (outputConfig) {
        return mapOutputFields(result, outputConfig);
      }

      return result;
    },
  };
}

/**
 * Map API response fields to output configuration
 * @param response API response
 * @param outputConfig Output field mapping { outputField: responseField }
 * @returns Mapped output object
 */
function mapOutputFields(
  response: Record<string, any>,
  outputConfig: Record<string, string>
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [outputField, responsePath] of Object.entries(outputConfig)) {
    // Support nested field access using dot notation
    const value = getNestedValue(response, responsePath);
    if (value !== undefined) {
      result[outputField] = value;
    }
  }

  return result;
}

/**
 * Get a nested value from an object using dot notation path
 * @param obj Object to get value from
 * @param path Dot notation path (e.g., "channelDetail.maxViewers")
 * @returns Value at path or undefined
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
  const parts = path.split('.');
  let value: any = obj;

  for (const part of parts) {
    if (value === undefined || value === null) {
      return undefined;
    }
    value = value[part];
  }

  return value;
}
