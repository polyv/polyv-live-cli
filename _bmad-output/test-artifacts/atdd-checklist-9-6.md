---
stepsCompleted: ['step-01-preflight-and-context']
lastStep: 'step-01-preflight-and-context'
lastSaved: '2026-03-23'
storyId: '9-6'
storyTitle: '场次管理命令'
inputDocuments:
  - '_bmad-output/implementation-artifacts/9-6-session-management.md'
  - '_bmad/tea/testarch/knowledge/test-levels-framework.md'
  - '_bmad/tea/testarch/knowledge/test-quality.md'
  - 'packages/cli/src/handlers/playback.handler.test.ts'
detectedStack: 'backend'
testFramework: 'jest'
---

# ATDD Checklist for Story 9-6: Session Management Commands

## Story Overview

**Story**: 场次管理命令 (Session Management Commands)
**Status**: ready-for-dev
**Stack**: Backend (Node.js/TypeScript CLI)
**Test Framework**: Jest

### Acceptance Criteria

1. **AC1**: `session list` 命令支持 `--channel-id` 参数获取频道场次列表
2. **AC2**: `session list` 命令支持分页参数（`--page`, `--page-size`）
3. **AC3**: `session list` 命令支持日期范围过滤（`--start-date`, `--end-date`）
4. **AC4**: `session get` 命令支持通过 `--session-id` 参数获取场次详情
5. **AC5**: 所有命令支持 `--output` 参数选择 table 或 json 输出格式
6. **AC6**: 表格输出格式清晰，显示场次信息
7. **AC7**: JSON 输出完整包含所有 API 返回字段

---

## Test File Inventory

### 1. Type Definition Tests

**File**: `packages/cli/src/types/session.test.ts`

**Purpose**: Test session-related type definitions

**Test Scenarios**:
- [ ] Verify `SessionServiceConfig` interface structure
- [ ] Verify `SessionListOptions` interface with all optional fields
- [ ] Verify `SessionGetOptions` interface with required fields
- [ ] Verify `SessionDisplayItem` interface structure

**Expected Interface**:
```typescript
export interface SessionServiceConfig {
  baseUrl: string;
  timeout: number;
  debug: boolean;
}

export interface SessionListOptions {
  channelId?: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  output?: 'table' | 'json';
}

export interface SessionGetOptions {
  channelId: string;
  sessionId: string;
  output?: 'table' | 'json';
}

export interface SessionDisplayItem {
  sessionId: string;
  channelId: string;
  name?: string;
  status: string;
  startTime?: string;
  endTime?: number;
  createdTime?: number;
  planStartTime?: number;
  planEndTime?: number;
  streamType?: string;
  pushClient?: string;
  watchUrl?: string;
  userId?: string;
  splashImg?: string;
  splashLargeImg?: string;
}
```

---

### 2. Service SDK Tests

**File**: `packages/cli/src/services/session.service.sdk.test.ts`

**Purpose**: Test SessionServiceSdk wrapper class

**Test Scenarios**:
- [ ] **AC1**: `getSessionList()` calls SDK `client.v4Channel.sessionList()` with correct parameters
- [ ] **AC2**: `getSessionList()` passes pagination parameters correctly (page, pageSize)
- [ ] **AC3**: `getSessionList()` maps response to `SessionDisplayItem[]` format
- [ ] **AC4**: `getSession()` calls SDK `client.v4Channel.sessionGet()` with correct parameters
- [ ] **AC7**: Service returns complete API response fields

**Mock Requirements**:
- Mock `PolyVClient` and `v4Channel` service
- Mock authentication config
- Mock HTTP responses

**Expected Methods**:
```typescript
class SessionServiceSdk {
  constructor(authConfig: AuthConfig, config: SessionServiceConfig);

  async getSessionList(options: SessionListOptions): Promise<{
    contents: SessionDisplayItem[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }>;

  async getSession(channelId: string, sessionId: string): Promise<SessionDisplayItem>;
}
```

---

### 3. Handler Tests

**File**: `packages/cli/src/handlers/session.handler.test.ts`

**Purpose**: Test SessionHandler business logic

**Test Scenarios**:
- [ ] **AC1**: `listSessions()` calls service with `channelId` parameter
- [ ] **AC2**: `listSessions()` passes pagination parameters to service
- [ ] **AC3**: `listSessions()` validates date range parameters (if implemented)
- [ ] **AC4**: `getSession()` calls service with `channelId` and `sessionId`
- [ ] **AC5**: Both methods support `--output` parameter (table/json)
- [ ] **AC6**: Table output formats session data correctly
- [ ] **AC7**: JSON output includes all API fields
- [ ] Error handling: Invalid channelId
- [ ] Error handling: Invalid sessionId
- [ ] Error handling: Network errors

**Mock Requirements**:
- Mock `ISessionService` interface
- Mock console.log/console.error for output verification
- Mock `BaseHandler` error handling

**Expected Methods**:
```typescript
interface ISessionService {
  getSessionList(options: SessionListOptions): Promise<{...}>;
  getSession(channelId: string, sessionId: string): Promise<SessionDisplayItem>;
}

class SessionHandler extends BaseHandler {
  constructor(authConfig: AuthConfig, serviceConfig: SessionServiceConfig, sessionService?: ISessionService);

  async listSessions(options: SessionListOptions): Promise<void>;
  async getSession(options: SessionGetOptions): Promise<void>;
}
```

---

### 4. Command Registration Tests

**File**: `packages/cli/src/commands/session.commands.test.ts`

**Purpose**: Test CLI command registration and parameter parsing

**Test Scenarios**:
- [ ] **AC1**: `session list` command is registered with `--channel-id` option
- [ ] **AC2**: `session list` command has `--page` and `--page-size` options
- [ ] **AC3**: `session list` command has `--start-date` and `--end-date` options (if implemented)
- [ ] **AC4**: `session get` command is registered with `--session-id` option
- [ ] **AC5**: Both commands have `--output` option with choices ['table', 'json']
- [ ] Command descriptions are clear and helpful
- [ ] Command aliases work correctly (e.g., `-c` for `--channel-id`)

**Expected Command Structure**:
```bash
polyv-live-cli session list [options]
  -c, --channel-id <id>       Channel ID
  --page <number>             Page number (default: 1)
  --page-size <number>        Page size (default: 10)
  --start-date <date>         Start date filter
  --end-date <date>           End date filter
  -o, --output <format>       Output format: table, json (default: table)

polyv-live-cli session get [options]
  -c, --channel-id <id>       Channel ID (required)
  --session-id <id>           Session ID (required)
  -o, --output <format>       Output format: table, json (default: table)
```

---

## Test Coverage Targets

Following project standards (80% for functions, lines, statements; 70% for branches):

- [ ] **Handler tests**: >= 80% coverage
- [ ] **Commands tests**: >= 80% coverage
- [ ] **Service SDK tests**: >= 80% coverage
- [ ] **Type tests**: 100% (type definitions only)
- [ ] **Overall coverage**: >= 80%

---

## Test Data Examples

### Valid Session List Response
```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "totalItems": 2,
  "totalPages": 1,
  "contents": [
    {
      "channelId": 2588188,
      "sessionId": "e9s2h3jd8f",
      "name": "测试场次1",
      "startTime": "2024-01-15 10:30",
      "endTime": 1705292400000,
      "status": "end",
      "createdTime": 1705285800000,
      "planStartTime": 1705284000000,
      "planEndTime": 1705291200000,
      "streamType": "client",
      "pushClient": "web",
      "watchUrl": "https://live.polyv.net/2588188/e9s2h3jd8f",
      "userId": "test-user"
    }
  ]
}
```

### Valid Session Get Response
```json
{
  "channelId": 2588188,
  "sessionId": "e9s2h3jd8f",
  "name": "测试场次1",
  "status": "end",
  "startTime": "2024-01-15 10:30",
  "endTime": 1705292400000,
  "createdTime": 1705285800000,
  "planStartTime": 1705284000000,
  "planEndTime": 1705291200000,
  "streamType": "client",
  "pushClient": "web",
  "watchUrl": "https://live.polyv.net/2588188/e9s2h3jd8f",
  "userId": "test-user",
  "splashImg": "https://example.com/cover.jpg"
}
```

---

## Implementation Files to Create

Based on story tasks:

1. **Types**: `packages/cli/src/types/session.ts`
2. **Service SDK**: `packages/cli/src/services/session.service.sdk.ts`
3. **Handler**: `packages/cli/src/handlers/session.handler.ts`
4. **Commands**: `packages/cli/src/commands/session.commands.ts`
5. **Registration**: Update `packages/cli/src/index.ts` to register session commands

---

## ATDD Workflow Status

### RED Phase (Current)
- [ ] Create test files with failing tests
- [ ] Define expected interfaces and behaviors
- [ ] All tests fail as expected

### GREEN Phase (Next)
- [ ] Implement session types
- [ ] Implement SessionServiceSdk
- [ ] Implement SessionHandler
- [ ] Implement session commands
- [ ] Register commands in CLI
- [ ] All tests pass

### REFACTOR Phase (Final)
- [ ] Review code quality
- [ ] Optimize if needed
- [ ] Ensure 80% coverage maintained
- [ ] Update skill documentation

---

## Notes

- SDK already has `sessionList()` and `sessionGet()` methods in `V4ChannelService`
- This is a CLI wrapper story - no new SDK APIs needed
- Follow patterns from `playback.handler.test.ts` and `playback.commands.test.ts`
- Status mapping: `unStart` → '未开始', `live` → '直播中', `end` → '已结束', `playback` → '回放中', `expired` → '已过期'
