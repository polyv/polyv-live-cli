# PolyV Live API SDK

TypeScript/Node.js SDK for PolyV Live Streaming API.

## Installation

```bash
npm install polyv-live-api-sdk
# or
pnpm add polyv-live-api-sdk
# or
yarn add polyv-live-api-sdk
```

## Quick Start

```typescript
import { PolyVClient } from 'polyv-live-api-sdk';

const client = new PolyVClient({
  appId: 'your-app-id',
  appSecret: 'your-app-secret'
});

// List channels
const channels = await client.channel.listChannels({ pageNumber: 1, pageSize: 10 });

// Get channel details
const channel = await client.channel.getChannel({ channelId: 'your-channel-id' });
```

## Features

- Full TypeScript support with type definitions
- Automatic API signature generation
- Promise-based API
- Comprehensive error handling
- Support for both V3 and V4 APIs

## Services

### V3 Services

| Service | Description |
|---------|-------------|
| `channel` | Channel management (CRUD, settings, streams) |
| `chat` | Chat operations (messages, bans, kicks) |
| `account` | Account operations |
| `group` | Group management |
| `platform` | Platform operations |
| `finance` | Financial operations |
| `web` | Web settings |
| `player` | Player configuration |
| `liveInteraction` | Live interactions (check-in, lottery, Q&A) |
| `statistics` | Statistics and reports |

### V4 Services

| Service | Description |
|---------|-------------|
| `v4Platform` | Coupon management |
| `v4Channel` | V4 channel APIs |
| `v4Chat` | V4 chat APIs |
| `v4User` | User management |
| `v4Group` | V4 group APIs |
| `v4AI` | AI features |
| `v4Robot` | Robot features |
| `v4Material` | Materials management |
| `v4Statistics` | V4 statistics |
| `v4WebApp` | WebApp settings |
| `v4Global` | Global settings |

## Usage Examples

### Channel Management

```typescript
// Create a channel
const newChannel = await client.channel.createChannel({
  name: 'My Live Channel',
  channelPass: 'password123'
});

// List channels with pagination
const result = await client.channel.listChannels({
  pageNumber: 1,
  pageSize: 20
});

// Update channel
await client.channel.updateChannel({
  channelId: 'xxx',
  name: 'Updated Name'
});
```

### Coupon Operations (V4)

```typescript
// Create a coupon
const couponId = await client.v4Platform.createCoupon({
  name: 'Discount Coupon',
  discount: 100,
  total: 1000
});

// Search coupons
const coupons = await client.v4Platform.searchCoupons({
  pageNumber: 1,
  pageSize: 10
});
```

### Product Management

```typescript
// Get product list
const products = await client.channel.getProductList({
  channelId: 'your-channel-id'
});

// Add product
const product = await client.channel.addProduct({
  channelId: 'your-channel-id',
  name: 'Product Name',
  price: '99.00'
});
```

### Statistics

```typescript
// Get channel statistics
const stats = await client.statistics.getChannelStats({
  channelId: 'your-channel-id',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

### Error Handling

```typescript
import { PolyVAPIError, PolyVErrorCode } from 'polyv-live-api-sdk';

try {
  await client.channel.getChannel({ channelId: 'invalid-id' });
} catch (error) {
  if (error instanceof PolyVAPIError) {
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
  }
}
```

## Pagination Utilities

```typescript
import { paginate, collectAll } from 'polyv-live-api-sdk';

// Auto-paginate through all results
const allChannels = await collectAll(
  (page) => client.channel.listChannels({ pageNumber: page, pageSize: 100 }),
  (response) => response.contents
);
```

## Configuration Options

```typescript
const client = new PolyVClient({
  appId: 'your-app-id',
  appSecret: 'your-app-secret',
  userId: 'your-user-id',        // Optional
  timeout: 30000,                 // Request timeout in ms (default: 30000)
  baseURL: 'https://api.polyv.net' // Custom base URL (optional)
});
```

## Requirements

- Node.js >= 18.0.0

## License

MIT
