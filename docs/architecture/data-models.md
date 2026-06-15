# Data Models

**Version**: 1.2  
**Last Updated**: 2025-07-01  
**Related**: [External APIs](./external-apis.md), [Components](./components.md)

---

## Core Data Models

### **ChannelModel**

**Purpose:** Represents a live streaming channel with its configuration and state

**TypeScript Definition:**

```typescript
interface ChannelModel {
  // Core identifiers
  channelId: string;              // Unique channel identifier from PolyV API
  userId: string;                 // Associated PolyV user ID
  
  // Basic information
  name: string;                   // Human-readable channel name (max 100 characters)
  publisher: string;              // Host/presenter name
  desc?: string;                  // Live description (optional)
  
  // Live scene configuration
  scene: string;                  // Legacy live scene (alone/topclass/ppt/seminar)
  newScene: string;               // New live scene (topclass/double/train/alone/seminar/guide)
  template: string;               // Live template (ppt/portrait_ppt/alone/portrait_alone/topclass/portrait_topclass/seminar)
  
  // Authentication
  channelPasswd: string;          // Instructor password (6-16 characters)
  seminarHostPassword?: string;   // Seminar host password (seminar scene only)
  seminarAttendeePassword?: string; // Seminar attendee password (seminar scene only)
  
  // Scheduling
  startTime: number;              // Live start time (13-digit timestamp)
  endTime: number;                // Live end time (13-digit timestamp)
  createdTime: number;            // Creation time (13-digit timestamp)
  
  // Viewer statistics
  pageView: number;               // Cumulative view count
  likes: number;                  // Like count
  maxViewer: number;              // Maximum concurrent viewers
  maxViewerRestrict: 'Y' | 'N';   // Max viewer restriction switch
  
  // Visual configuration
  coverImg?: string;              // Channel icon URL
  splashImg?: string;             // Splash page image URL
  splashEnabled: 'Y' | 'N';       // Splash page switch
  
  // Feature toggles
  consultingMenuEnabled: 'Y' | 'N'; // Consultation menu switch
  pureRtcEnabled: 'Y' | 'N';      // Low latency mode switch
  linkMicLimit: number;           // Mic connection limit (max 16)
  
  // Status information
  watchStatus: WatchStatus;       // Current watch page status
  watchStatusText: string;        // Watch status description
  streamType: 'client' | 'disk';  // Live streaming method
  
  // Streaming URLs (pure video only)
  pushUrl?: string;               // Push stream URL
  pushSecret?: string;            // Push stream key
  
  // Organization
  userCategory?: string;          // Category classification
  labelData?: number[];           // Associated tag IDs
}

type WatchStatus = 'live' | 'playback' | 'end' | 'waiting' | 'unStart' | 'banpush';
```

**Relationships:**

- Associated with PolyV user account via `userId`
- Belongs to a category via `userCategory`
- Has viewing conditions through auth settings
- Has labels via `labelData` array

**Validation Rules:**

```typescript
const ChannelValidation = {
  name: {
    required: true,
    maxLength: 100,
    pattern: /^[^<>]+$/ // No HTML tags
  },
  channelPasswd: {
    required: true,
    minLength: 6,
    maxLength: 16,
    pattern: /^[a-zA-Z0-9]+$/ // Alphanumeric only
  },
  newScene: {
    required: true,
    enum: ['topclass', 'double', 'train', 'alone', 'seminar', 'guide']
  },
  template: {
    required: true,
    enum: ['ppt', 'portrait_ppt', 'alone', 'portrait_alone', 'topclass', 'portrait_topclass', 'seminar']
  },
  linkMicLimit: {
    min: 1,
    max: 16
  }
};
```

---

### **AuthenticationModel**

**Purpose:** Encapsulates PolyV API authentication parameters and signature generation

**TypeScript Definition:**

```typescript
interface AuthenticationModel {
  // Core credentials
  appId: string;                  // PolyV application identifier
  appSecret: string;              // PolyV application secret (never logged)
  userId?: string;                // POLYV user ID (required for stream control)
  
  // Request authentication
  timestamp: number;              // Request timestamp in 13-digit milliseconds
  sign: string;                   // Generated MD5 signature (32-character uppercase)
  
  // Metadata
  generatedAt: Date;              // When this auth was generated
  expiresAt: Date;                // When this auth expires (3 minutes)
}

interface SignatureParams {
  appId: string;
  timestamp: string;
  userId?: string;
  [key: string]: string | undefined;
}
```

**Relationships:**

- Used by all API requests to PolyV services
- Generated fresh for each request to ensure security
- URL parameters participate in signature generation
- Request body parameters do NOT participate in signature

**Security Rules:**

```typescript
const AuthenticationSecurity = {
  appSecret: {
    logging: false,           // Never log this value
    errorExposure: false,     // Never expose in error messages
    storage: 'environment'    // Store only in environment variables
  },
  timestamp: {
    validity: 180000,         // 3 minutes in milliseconds
    format: 'milliseconds',   // 13-digit timestamp
    tolerance: 30000          // 30-second clock skew tolerance
  },
  signature: {
    algorithm: 'MD5',
    format: 'uppercase',      // Must be uppercase
    length: 32               // Exactly 32 characters
  }
};
```

---

### **ApiResponseModel**

**Purpose:** Standardized wrapper for all PolyV API responses

**TypeScript Definition:**

```typescript
// Base response interface
interface ApiResponseModel<T = any> {
  code: number;                   // HTTP status code (200 for success, 400/500 for errors)
  status: 'success' | 'error';    // Response status text
  message?: string;               // Error description when code is 400/500
  data: T;                        // Generic response payload (varies by endpoint)
}

// v4 API specific response (enhanced format)
interface V4ApiResponseModel<T = any> extends ApiResponseModel<T> {
  success: boolean;               // Success flag
  requestId: string;              // Unique request identifier for debugging
  error?: {                       // Error object (when success = false)
    code: number;                 // PolyV-specific error code
    desc: string;                 // Error description
  };
}

// v3/v2 API response (legacy format)
interface LegacyApiResponseModel<T = any> extends ApiResponseModel<T> {
  // Uses base interface only
}
```

**Response Type Guards:**

```typescript
function isV4Response<T>(response: ApiResponseModel<T>): response is V4ApiResponseModel<T> {
  return 'success' in response && 'requestId' in response;
}

function isSuccessResponse<T>(response: ApiResponseModel<T>): boolean {
  if (isV4Response(response)) {
    return response.success === true;
  }
  return response.code === 200 && response.status === 'success';
}

function isErrorResponse<T>(response: ApiResponseModel<T>): boolean {
  return !isSuccessResponse(response);
}
```

**Relationships:**

- Base type for all service layer responses
- Consumed by handlers for business logic processing
- Transformed into user-friendly messages by formatters

---

### **StreamInfoModel**

**Purpose:** Represents real-time streaming information for a live channel

**TypeScript Definition:**

```typescript
interface StreamInfoModel {
  // Network information
  deployAddress?: string;         // CDN node IP address for push stream
  inAddress?: string;             // Push stream exit IP address
  
  // Stream characteristics
  streamName: string;             // Stream name identifier
  fps: string;                    // Push stream frame rate (e.g., "25")
  lfr?: string;                   // Push stream frame loss rate (optional)
  inBandWidth: string;            // Push stream bitrate in bps (e.g., "1024000")
  
  // Metadata
  retrievedAt: Date;              // When this info was retrieved
  channelId: string;              // Associated channel ID
}
```

**Relationships:**

- Associated with a specific channel during live streaming
- Only available when channel `watchStatus` is 'live'
- Refreshed periodically during live streaming

**Usage Patterns:**

```typescript
// Stream info is only available for live channels
const getStreamInfo = async (channelId: string): Promise<StreamInfoModel | null> => {
  try {
    const response = await polyvService.getStreamInfo(channelId);
    return response.data;
  } catch (error) {
    if (error.message.includes('Channel is not live')) {
      return null; // Channel not currently streaming
    }
    throw error;
  }
};
```

---

### **ChannelListModel**

**Purpose:** Represents the response from channel listing operations

**TypeScript Definition:**

```typescript
interface ChannelListModel {
  channels: string[];             // Array of channel IDs matching the search criteria
  
  // Metadata (not provided by API but added by client)
  totalCount: number;             // Total number of channels found
  retrievedAt: Date;              // When this list was retrieved
  filters?: ChannelListFilters;   // Filters applied to this search
}

interface ChannelListFilters {
  categoryId?: string;            // Category ID filter
  keyword?: string;               // Channel name fuzzy search
  labelId?: string;               // Label ID filter
}
```

**Relationships:**

- Result of channel list/search operations
- Channel IDs can be used to fetch detailed channel information via `ChannelModel`
- Supports filtering and search capabilities

---

## Utility Types

### **Configuration Types**

```typescript
interface PolyVConfig {
  // Authentication
  appId: string;
  appSecret: string;
  userId?: string;
  
  // API settings
  baseURL: string;
  timeout: number;
  retries: number;
  
  // Output preferences
  outputFormat: 'table' | 'json';
  verbose: boolean;
}

interface CLIOptions {
  // Global options
  appId?: string;
  appSecret?: string;
  userId?: string;
  format?: 'table' | 'json';
  verbose?: boolean;
  
  // Command-specific options
  [key: string]: any;
}
```

### **Error Types**

```typescript
interface PolyVError extends Error {
  code: string;                   // Error code for programmatic handling
  statusCode?: number;            // HTTP status code (if applicable)
  details?: any;                  // Additional error details
  requestId?: string;             // Request ID for debugging
}

interface ValidationError extends PolyVError {
  field: string;                  // Field that failed validation
  value: any;                     // Value that failed validation
  constraint: string;             // Validation constraint that was violated
}

interface NetworkError extends PolyVError {
  timeout: boolean;               // Whether this was a timeout error
  retryCount: number;             // Number of retries attempted
}
```

---

## Data Transformation Patterns

### **API Response to Domain Model**

```typescript
// Transform PolyV API response to internal model
const transformChannelResponse = (apiResponse: ApiResponseModel<any>): ChannelModel => {
  const data = apiResponse.data;
  
  return {
    channelId: data.channelId.toString(),
    userId: data.userId,
    name: data.name,
    publisher: data.publisher || '',
    desc: data.desc || undefined,
    scene: data.scene,
    newScene: data.newScene,
    template: data.template,
    channelPasswd: data.channelPasswd,
    seminarHostPassword: data.seminarHostPassword,
    seminarAttendeePassword: data.seminarAttendeePassword,
    startTime: parseInt(data.startTime),
    endTime: parseInt(data.endTime),
    createdTime: parseInt(data.createdTime),
    pageView: parseInt(data.pageView) || 0,
    likes: parseInt(data.likes) || 0,
    maxViewer: parseInt(data.maxViewer) || 1000,
    maxViewerRestrict: data.maxViewerRestrict || 'N',
    coverImg: data.coverImg || undefined,
    splashImg: data.splashImg || undefined,
    splashEnabled: data.splashEnabled || 'N',
    consultingMenuEnabled: data.consultingMenuEnabled || 'N',
    pureRtcEnabled: data.pureRtcEnabled || 'N',
    linkMicLimit: parseInt(data.linkMicLimit) || 16,
    watchStatus: data.watchStatus || 'waiting',
    watchStatusText: data.watchStatusText || '',
    streamType: data.streamType || 'client',
    pushUrl: data.pushUrl || undefined,
    pushSecret: data.pushSecret || undefined,
    userCategory: data.userCategory || undefined,
    labelData: data.labelData || undefined
  };
};
```

### **Domain Model to CLI Output**

```typescript
// Transform internal model to user-friendly output
const formatChannelForDisplay = (channel: ChannelModel, format: 'table' | 'json') => {
  if (format === 'json') {
    return JSON.stringify(channel, null, 2);
  }
  
  // Table format with selected fields
  return {
    'Channel ID': channel.channelId,
    'Name': channel.name,
    'Publisher': channel.publisher,
    'Scene': channel.newScene,
    'Template': channel.template,
    'Status': channel.watchStatusText,
    'Created': new Date(channel.createdTime).toLocaleString()
  };
};
```

---

## Data Validation

### **Runtime Validation**

```typescript
import Joi from 'joi';

const ChannelCreateSchema = Joi.object({
  name: Joi.string().required().max(100),
  newScene: Joi.string().required().valid('topclass', 'double', 'train', 'alone', 'seminar', 'guide'),
  template: Joi.string().required().valid('ppt', 'portrait_ppt', 'alone', 'portrait_alone', 'topclass', 'portrait_topclass', 'seminar'),
  channelPasswd: Joi.string().alphanum().min(6).max(16),
  linkMicLimit: Joi.number().integer().min(1).max(16),
  startTime: Joi.number().integer().positive(),
  endTime: Joi.number().integer().positive().greater(Joi.ref('startTime'))
});

const validateChannelCreate = (data: any): ChannelModel => {
  const { error, value } = ChannelCreateSchema.validate(data);
  if (error) {
    throw new ValidationError(`Validation failed: ${error.message}`, 'VALIDATION_ERROR');
  }
  return value;
};
```

---

*This data models specification provides complete type definitions and validation rules for all data structures used in the PolyV CLI tool.* 