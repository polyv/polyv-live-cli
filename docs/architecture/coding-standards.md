# Coding Standards

**Version**: 1.2  
**Last Updated**: 2025-07-01  
**Related**: [Tech Stack](./tech-stack.md), [Error Handling](./error-handling.md)

---

## TypeScript Conventions

### **Type Definitions**

```typescript
// ✅ Good: Explicit interface definitions
interface ChannelCreateRequest {
  name: string;
  newScene: string;
  template: string;
  channelPasswd?: string;
}

// ✅ Good: Union types for controlled values
type WatchStatus = 'live' | 'playback' | 'end' | 'waiting' | 'unStart' | 'banpush';

// ✅ Good: Generic types with constraints
interface ApiResponse<T extends object> {
  code: number;
  status: 'success' | 'error';
  data: T;
}

// ❌ Bad: Using 'any' type
interface BadRequest {
  data: any; // Avoid this
}

// ❌ Bad: Implicit types
const config = {
  timeout: 30000 // Should be: timeout: number = 30000
};
```

### **Function Signatures**

```typescript
// ✅ Good: Explicit return types and parameter types
async function createChannel(
  request: ChannelCreateRequest,
  options?: RequestOptions
): Promise<ChannelModel> {
  // Implementation
}

// ✅ Good: Error handling with typed exceptions
async function validateChannelData(data: unknown): Promise<ChannelCreateRequest> {
  if (!isChannelCreateRequest(data)) {
    throw new PolyVValidationError(
      'Invalid channel data',
      'data',
      data,
      'type_mismatch'
    );
  }
  return data;
}

// ✅ Good: Type guards
function isChannelCreateRequest(data: unknown): data is ChannelCreateRequest {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as any).name === 'string' &&
    typeof (data as any).newScene === 'string'
  );
}
```

### **Class Structure**

```typescript
// ✅ Good: Clear class organization
export class PolyVService {
  // Private fields first
  private readonly httpClient: AxiosInstance;
  private readonly config: PolyVConfig;
  
  // Constructor
  constructor(config: PolyVConfig) {
    this.config = config;
    this.httpClient = this.createHttpClient();
  }
  
  // Public methods
  public async createChannel(request: ChannelCreateRequest): Promise<ChannelModel> {
    return this.executeRequest('POST', '/live/v4/channel/create', request);
  }
  
  // Private methods last
  private createHttpClient(): AxiosInstance {
    // Implementation
  }
  
  private async executeRequest<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    // Implementation
  }
}
```

---

## Naming Conventions

### **Files and Directories**

```
✅ Good naming:
src/
├── handlers/
│   ├── channel.handler.ts        # kebab-case for files
│   └── stream.handler.ts
├── services/
│   └── polyv.service.ts
├── types/
│   ├── channel.types.ts          # .types.ts for type definitions
│   └── api.types.ts
└── utils/
    ├── signature.util.ts         # .util.ts for utilities
    └── formatter.util.ts

❌ Bad naming:
src/
├── ChannelHandler.ts             # PascalCase for files
├── polyvService.ts               # camelCase for files
├── types.ts                      # Generic names
└── utils.ts
```

### **Variables and Functions**

```typescript
// ✅ Good: Descriptive camelCase names
const polyvApiClient = createApiClient();
const channelCreationRequest = buildRequest();
const isChannelLive = checkChannelStatus();

// ✅ Good: Boolean variables with is/has/can prefix
const isAuthenticated = true;
const hasPermission = false;
const canCreateChannel = true;

// ✅ Good: Async function naming
async function createChannelAsync(): Promise<ChannelModel> { }
async function fetchChannelDetails(): Promise<ChannelModel> { }

// ❌ Bad: Abbreviations and unclear names
const ch = getChannel();          // Unclear abbreviation
const data = getData();           // Too generic
const flag = true;                // Unclear purpose
```

### **Constants and Enums**

```typescript
// ✅ Good: SCREAMING_SNAKE_CASE for constants
const POLYV_API_BASE_URL = 'https://api.polyv.net/live';
const MAX_RETRY_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 30000;

// ✅ Good: PascalCase for enums
enum ChannelStatus {
  Live = 'live',
  Waiting = 'waiting',
  Ended = 'end'
}

// ✅ Good: Grouped constants
const API_ENDPOINTS = {
  CHANNEL_CREATE: '/live/v4/channel/create',
  CHANNEL_LIST: '/live/v3/user/channels',
  STREAM_START: '/live/v2/channels/{channelId}/live'
} as const;
```

### **Classes and Interfaces**

```typescript
// ✅ Good: PascalCase with descriptive names
class PolyVApiClient { }
class ChannelManagementHandler { }
interface ChannelCreateRequest { }
interface ApiResponseModel<T> { }

// ✅ Good: Abstract classes with 'Abstract' prefix
abstract class AbstractHandler { }
abstract class AbstractApiClient { }

// ✅ Good: Interface naming (no 'I' prefix)
interface UserConfig { }          // Not IUserConfig
interface DatabaseConnection { }  // Not IDatabaseConnection
```

---

## Code Organization

### **Import/Export Patterns**

```typescript
// ✅ Good: Organized imports
// External libraries first
import axios, { AxiosInstance } from 'axios';
import { Command } from 'commander';

// Internal imports grouped by type
import { ChannelModel, ApiResponseModel } from '../types';
import { PolyVService } from '../services';
import { formatTable, logError } from '../utils';

// ✅ Good: Named exports preferred
export { ChannelHandler } from './channel.handler';
export { StreamHandler } from './stream.handler';

// ✅ Good: Default export for main class
export default class PolyVService {
  // Implementation
}

// ❌ Bad: Mixed import styles
import * as everything from './module';    // Avoid star imports
import './side-effects';                   // Avoid side-effect imports
```

### **File Structure Template**

```typescript
/**
 * @fileoverview Brief description of the file's purpose
 * @author Development Team
 * @since 1.0.0
 */

// Imports (organized as above)
import { ... } from '...';

// Types and interfaces (if small, otherwise separate file)
interface LocalInterface {
  // ...
}

// Constants
const LOCAL_CONSTANT = 'value';

// Main implementation
export class ExampleClass {
  // Implementation
}

// Utility functions (if any)
function helperFunction(): void {
  // Implementation
}

// Default export (if applicable)
export default ExampleClass;
```

---

## Error Handling Standards

### **Exception Patterns**

```typescript
// ✅ Good: Specific error types
try {
  const channel = await polyvService.createChannel(request);
  return channel;
} catch (error) {
  if (error instanceof PolyVAuthenticationError) {
    throw new PolyVConfigError(
      'Authentication failed. Please check your credentials.',
      { originalError: error.code }
    );
  }
  
  if (error instanceof PolyVValidationError) {
    throw error; // Re-throw validation errors as-is
  }
  
  // Wrap unexpected errors
  throw new PolyVError(
    'Failed to create channel',
    'CHANNEL_CREATE_ERROR',
    undefined,
    { originalError: error.message }
  );
}

// ❌ Bad: Generic error handling
try {
  const result = await someOperation();
} catch (error) {
  console.error(error);           // Don't just log
  throw new Error('Failed');      // Don't lose context
}
```

### **Validation Patterns**

```typescript
// ✅ Good: Input validation with specific errors
function validateChannelName(name: unknown): string {
  if (typeof name !== 'string') {
    throw new PolyVValidationError(
      'Channel name must be a string',
      'name',
      name,
      'type_mismatch'
    );
  }
  
  if (name.length === 0) {
    throw new PolyVValidationError(
      'Channel name cannot be empty',
      'name',
      name,
      'required'
    );
  }
  
  if (name.length > 100) {
    throw new PolyVValidationError(
      'Channel name cannot exceed 100 characters',
      'name',
      name,
      'max_length'
    );
  }
  
  return name;
}
```

---

## Testing Standards

### **Test File Organization**

```
✅ Good test structure:
src/
├── handlers/
│   ├── channel.handler.ts
│   └── channel.handler.test.ts    # Co-located tests
├── services/
│   ├── polyv.service.ts
│   └── polyv.service.test.ts
tests/
├── integration/                   # Integration tests separate
│   └── api.integration.test.ts
└── e2e/                          # E2E tests separate
    └── cli.e2e.test.ts
```

### **Test Naming and Structure**

```typescript
// ✅ Good: Descriptive test structure
describe('ChannelHandler', () => {
  describe('create', () => {
    it('should create channel with valid input', async () => {
      // Arrange
      const mockService = createMockPolyVService();
      const handler = new ChannelHandler(mockService);
      const request: ChannelCreateRequest = {
        name: 'Test Channel',
        newScene: 'topclass',
        template: 'ppt'
      };
      
      // Act
      const result = await handler.create(request);
      
      // Assert
      expect(result.channelId).toBeDefined();
      expect(result.name).toBe('Test Channel');
      expect(mockService.createChannel).toHaveBeenCalledWith(request);
    });
    
    it('should throw validation error for invalid input', async () => {
      // Arrange
      const handler = new ChannelHandler(createMockPolyVService());
      const invalidRequest = { name: '' }; // Missing required fields
      
      // Act & Assert
      await expect(handler.create(invalidRequest as any))
        .rejects
        .toThrow(PolyVValidationError);
    });
  });
});
```

---

## Documentation Standards

### **JSDoc Comments**

```typescript
/**
 * Creates a new live streaming channel in PolyV
 * 
 * @param request - Channel creation parameters
 * @param options - Optional request configuration
 * @returns Promise resolving to the created channel model
 * 
 * @throws {PolyVValidationError} When request parameters are invalid
 * @throws {PolyVAuthenticationError} When API credentials are invalid
 * @throws {PolyVAPIError} When PolyV API returns an error
 * 
 * @example
 * ```typescript
 * const channel = await service.createChannel({
 *   name: 'My Live Stream',
 *   newScene: 'topclass',
 *   template: 'ppt'
 * });
 * console.log(`Created channel: ${channel.channelId}`);
 * ```
 * 
 * @since 1.0.0
 */
async function createChannel(
  request: ChannelCreateRequest,
  options?: RequestOptions
): Promise<ChannelModel> {
  // Implementation
}
```

### **README Standards**

```markdown
# Module Name

Brief description of what this module does.

## Usage

```typescript
import { ModuleName } from './module-name';

const instance = new ModuleName(config);
const result = await instance.doSomething();
```

## API

### `methodName(param: Type): ReturnType`

Description of what the method does.

**Parameters:**
- `param` - Description of parameter

**Returns:**
- `ReturnType` - Description of return value

**Throws:**
- `ErrorType` - When this error occurs

## Examples

[Provide practical examples]
```

---

## AI Agent Requirements

### **Code Generation Rules**

1. **Always use explicit types** - Never rely on type inference for public APIs
2. **Include comprehensive error handling** - Every async operation must handle errors
3. **Add JSDoc comments** - All public methods must have documentation
4. **Follow naming conventions** - Use established patterns consistently
5. **Include unit tests** - Generate tests for all new functionality

### **Code Review Checklist**

```typescript
// ✅ AI agents should verify:
// 1. All imports are used and necessary
// 2. No 'any' types without justification
// 3. Error handling is comprehensive
// 4. Function signatures are explicit
// 5. Tests cover main functionality
// 6. JSDoc comments are present
// 7. Naming follows conventions
// 8. No security vulnerabilities (exposed secrets, etc.)
```

### **Refactoring Guidelines**

```typescript
// ✅ When refactoring, AI agents should:
// 1. Preserve existing functionality
// 2. Improve type safety
// 3. Add missing error handling
// 4. Update tests accordingly
// 5. Maintain backward compatibility
// 6. Update documentation

// ❌ AI agents should NOT:
// 1. Change public APIs without approval
// 2. Remove existing error handling
// 3. Ignore test failures
// 4. Add unnecessary dependencies
```

---

## Performance Guidelines

### **Async/Await Best Practices**

```typescript
// ✅ Good: Parallel execution when possible
const [channels, streamInfo] = await Promise.all([
  polyvService.listChannels(),
  polyvService.getStreamInfo(channelId)
]);

// ✅ Good: Proper error handling in parallel operations
const results = await Promise.allSettled([
  operation1(),
  operation2(),
  operation3()
]);

// ❌ Bad: Sequential when parallel is possible
const channels = await polyvService.listChannels();
const streamInfo = await polyvService.getStreamInfo(channelId);
```

### **Memory Management**

```typescript
// ✅ Good: Clean up resources
class PolyVService {
  private httpClient: AxiosInstance;
  
  constructor(config: PolyVConfig) {
    this.httpClient = axios.create(config);
  }
  
  public destroy(): void {
    // Clean up any resources
    this.httpClient.defaults.timeout = 0;
  }
}

// ✅ Good: Avoid memory leaks in event handlers
process.on('SIGINT', () => {
  polyvService.destroy();
  process.exit(0);
});
```

---

*These coding standards ensure consistent, maintainable, and robust code across the PolyV CLI project. All team members and AI agents must follow these guidelines.* 