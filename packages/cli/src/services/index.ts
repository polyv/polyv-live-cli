/**
 * @fileoverview Service layer exports
 * @author Development Team
 * @since 2.1.0
 */

// Channel service SDK (uses polyv-live-api-sdk)
export { ChannelServiceSdk } from './channel.service.sdk';

// Stream service SDK (uses polyv-live-api-sdk)
export { StreamServiceSdk } from './stream.service.sdk';
export type { StreamServiceConfig } from './stream.service.sdk';

// Product service SDK (uses polyv-live-api-sdk)
export { ProductServiceSdk } from './product.service.sdk';

// System resource service
export { SystemResourceService } from './system-resource.service';
export type { SystemResourcesDetailed, NetworkInterface } from './system-resource.service';
