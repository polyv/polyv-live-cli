# External APIs Integration

**Version**: 1.2  
**Last Updated**: 2025-07-01  
**Related**: [Data Models](./data-models.md), [Workflows](./workflows.md)

---

## PolyV OpenAPI Integration

### **Overview**

- **Purpose:** Live streaming channel and stream management operations
- **Documentation:** PolyV developer documentation (internal)
- **Base URL(s):** `http://api.polyv.net/live/` (multiple API versions: v2, v3, v4)
- **Authentication:** MD5 signature with appId/appSecret/userId
- **Rate Limits:** Frequency limits apply, 3-minute timestamp validity

---

## Authentication Mechanism

### **MD5 Signature Authentication**

All PolyV API requests require MD5 signature authentication following this pattern:

```
1. Collect parameters: appId, timestamp, userId (optional), other URL params
2. Sort parameters alphabetically by key
3. Concatenate: key1value1key2value2...
4. Create signature string: appSecret + concatenated_params + appSecret
5. Generate MD5 hash and convert to uppercase
6. Add signature as 'sign' parameter to URL
```

### **Authentication Parameters**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `appId` | ✅ | PolyV application identifier |
| `timestamp` | ✅ | 13-digit millisecond timestamp (3-minute validity) |
| `sign` | ✅ | 32-character uppercase MD5 signature |
| `userId` | ⚠️ | Required for stream control operations only |

### **Signature Generation Rules**

- **URL Parameters**: appId, timestamp, sign, userId participate in signature
- **Request Body**: JSON body parameters do NOT participate in signature
- **Empty Values**: Filter out null, undefined, and empty string values
- **Timestamp Validity**: Must be within 3 minutes of current time
- **Case Sensitivity**: Final signature must be uppercase

---

## API Endpoint Specifications

### **Channel Management APIs**

#### **Create Channel (v4)**

```yaml
endpoint: POST /live/v4/channel/create
auth: MD5 signature (appId, timestamp, sign in URL)
content_type: application/json

required_body_parameters:
  - name: string (max 100 chars) - Channel name
  - newScene: string - Live scene (topclass/double/train/alone/seminar/guide)
  - template: string - Live template (ppt/portrait_ppt/alone/portrait_alone/topclass/portrait_topclass/seminar)

optional_body_parameters:
  - channelPasswd: string (6-16 chars) - Instructor password
  - seminarHostPassword: string (6-16 chars) - Seminar host password
  - seminarAttendeePassword: string (6-16 chars) - Seminar attendee password
  - pureRtcEnabled: string (Y/N) - Low latency mode
  - type: string - Broadcast type (normal/transmit/receive)
  - linkMicLimit: integer (max 16) - Mic connection limit
  - categoryId: integer - Category ID
  - startTime: long - Start time timestamp
  - endTime: long - End time timestamp
  - labelData: array - Tag ID array

response_format:
  success:
    code: 200
    status: "success"
    data:
      channelId: integer
      userId: string
      channelPasswd: string
      seminarHostPassword: string (if applicable)
      seminarAttendeePassword: string (if applicable)
```

#### **List Channels (v3)**

```yaml
endpoint: GET /live/v3/user/channels
auth: MD5 signature required

optional_parameters:
  - categoryId: string - Category ID filter
  - keyword: string - Channel name fuzzy search
  - labelId: string - Label ID filter

response_format:
  success:
    code: 200
    status: "success"
    data:
      channels: array[string] - Channel ID list
```

#### **Get Channel Details (v4)**

```yaml
endpoint: GET /live/v4/channel/basic/get
auth: MD5 signature required

required_parameters:
  - channelId: string - Channel ID

response_format:
  success:
    code: 200
    status: "success"
    data: ChannelModel (see data-models.md)
```

#### **Update Channel (v3)**

```yaml
endpoint: POST /live/v3/channel/basic/update
auth: MD5 signature (channelId, timestamp, appId in URL)
content_type: application/json

required_url_parameters:
  - channelId: string - Channel ID

optional_body_parameters:
  - basicSetting: object - Basic channel settings
  - authSettings: array - Viewing condition settings

response_format:
  success:
    code: 200
    status: "success"
    data: "" (empty string)
```

#### **Batch Delete Channels (v3)**

```yaml
endpoint: POST /live/v3/channel/basic/batch-delete
auth: MD5 signature required
content_type: application/json

required_body_parameters:
  - channelIds: array[string] - Channel ID list (max 100)

response_format:
  success:
    code: 200
    status: "success"
    data: true
```

### **Stream Control APIs**

#### **Get Stream Info (v3)**

```yaml
endpoint: GET /live/v3/channel/monitor/get-stream-info
auth: MD5 signature required

required_parameters:
  - channelId: string - Channel ID (must be live)

response_format:
  success:
    code: 200
    status: "success"
    data: StreamInfoModel (see data-models.md)
  
  channel_not_live:
    code: 400
    status: "error"
    message: "Channel is not live"
```

#### **Start Live Stream (v2)**

```yaml
endpoint: POST /live/v2/channels/{channelId}/live
auth: MD5 signature required
content_type: application/x-www-form-urlencoded

required_url_parameters:
  - channelId: string - Channel ID (in URL path)

required_form_parameters:
  - userId: string - POLYV user ID

response_format:
  success:
    code: 200
    status: "success"
    data: "success"
```

#### **Stop Live Stream (v2)**

```yaml
endpoint: POST /live/v2/channels/{channelId}/end
auth: MD5 signature required
content_type: application/x-www-form-urlencoded

required_url_parameters:
  - channelId: string - Channel ID (in URL path)

required_form_parameters:
  - userId: string - POLYV user ID

response_format:
  success:
    code: 200
    status: "success"
    data: "success"
```

---

## Error Handling

### **Common Error Responses**

| Error Code | Status | Message | Meaning |
|------------|--------|---------|---------|
| 400 | error | "invalid signature." | Authentication signature invalid |
| 400 | error | "时间戳过期" | Timestamp expired (>3 minutes) |
| 400 | error | Application not found | Invalid appId |
| 500 | error | Internal server error | PolyV server error |

### **v4 API Error Format**

```json
{
  "code": 400,
  "status": "error",
  "requestId": "uuid",
  "error": {
    "code": 20001,
    "desc": "application not found."
  },
  "success": false
}
```

### **v3/v2 API Error Format**

```json
{
  "code": 400,
  "status": "error",
  "message": "invalid signature.",
  "data": ""
}
```

---

## Integration Patterns

### **Request Interceptor Pattern**

```typescript
// Axios request interceptor for signature injection
apiClient.interceptors.request.use((config) => {
  const timestamp = Date.now().toString();
  const params = {
    appId: this.appId,
    timestamp,
    ...config.params
  };
  
  // Add userId for stream control endpoints
  if (config.url?.includes('/live/v2/channels/')) {
    params.userId = this.userId;
  }
  
  const signature = generateMD5Signature(params, this.appSecret);
  config.params = { ...params, sign: signature };
  
  return config;
});
```

### **Response Interceptor Pattern**

```typescript
// Axios response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 400) {
      const message = error.response.data.message || 
                     error.response.data.error?.desc;
      throw new PolyVAPIError(message, error.response.data);
    }
    throw new PolyVNetworkError(error.message);
  }
);
```

### **Retry Logic Pattern**

```typescript
const retryConfig = {
  retries: 3,
  retryDelay: (retryCount) => Math.pow(2, retryCount) * 1000,
  retryCondition: (error) => {
    // Retry on network errors and 5xx status codes
    return !error.response || error.response.status >= 500;
  }
};
```

---

## API Version Management

### **Version Strategy**

| API Version | Use Cases | Status |
|-------------|-----------|--------|
| **v4** | Channel creation, channel details | ✅ Preferred |
| **v3** | Channel management, batch operations | ✅ Active |
| **v2** | Stream control | ✅ Legacy but required |

### **Version Selection Logic**

```typescript
class PolyVService {
  private getChannelEndpoint(operation: string): string {
    switch (operation) {
      case 'create':
        return '/live/v4/channel/create';
      case 'get':
        return '/live/v4/channel/basic/get';
      case 'update':
        return '/live/v3/channel/basic/update';
      case 'list':
        return '/live/v3/user/channels';
      case 'batchDelete':
        return '/live/v3/channel/basic/batch-delete';
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
  
  private getStreamEndpoint(channelId: string, operation: string): string {
    switch (operation) {
      case 'info':
        return '/live/v3/channel/monitor/get-stream-info';
      case 'start':
        return `/live/v2/channels/${channelId}/live`;
      case 'stop':
        return `/live/v2/channels/${channelId}/end`;
      default:
        throw new Error(`Unknown stream operation: ${operation}`);
    }
  }
}
```

---

## Security Considerations

### **Credential Management**

- **appSecret**: Never log or expose in error messages
- **Signatures**: Generate fresh for each request
- **Timestamps**: Validate within 3-minute window
- **HTTPS**: Strongly recommended for production

### **Request Security**

- **Parameter Validation**: Validate all inputs before signature generation
- **Signature Verification**: Ensure signature matches expected format
- **Rate Limiting**: Respect PolyV API rate limits
- **Error Sanitization**: Don't expose sensitive data in error messages

### **Development vs Production**

```typescript
const apiConfig = {
  development: {
    baseURL: 'http://api.polyv.net/live',
    timeout: 60000, // Longer timeout for debugging
    validateStatus: () => true // Don't throw on 4xx/5xx for debugging
  },
  production: {
    baseURL: 'https://api.polyv.net/live',
    timeout: 30000,
    validateStatus: (status) => status < 400
  }
};
```

---

## Testing Strategies

### **API Integration Testing**

```typescript
// Mock PolyV API responses for testing
const mockPolyVAPI = {
  'POST /live/v4/channel/create': {
    code: 200,
    status: 'success',
    data: {
      channelId: 123456,
      userId: 'test_user',
      channelPasswd: 'test_password'
    }
  }
};
```

### **Signature Testing**

```typescript
describe('PolyV Signature Generation', () => {
  it('should generate correct MD5 signature', () => {
    const params = {
      appId: 'test_app',
      timestamp: '1640995200000'
    };
    const signature = generateMD5Signature(params, 'test_secret');
    expect(signature).toMatch(/^[A-F0-9]{32}$/);
  });
});
```

---

*This external API integration guide provides complete specifications for implementing PolyV API integration with proper authentication, error handling, and security considerations.* 