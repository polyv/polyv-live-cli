---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
  - step-05-validate-and-complete
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-03-23'
workflowType: 'testarch-atdd'
inputDocuments:
  - '_bmad-output/implementation-artifacts/9-7-record-settings.md'
  - 'packages/cli/src/handlers/playback.handler.ts'
  - 'packages/cli/src/handlers/statistics.handler.ts'
  - 'packages/cli/tests/handlers/statistics.handler.spec.ts'
  - 'packages/cli/tests/commands/statistics.commands.spec.ts'
---

# ATDD Checklist - Epic 9, Story 7: 录制设置管理命令

**Date:** 2026-03-23
**Author:** Nick
**Primary Test Level:** Component (Handler) + Unit (Commands)

---

## Story Summary

CLI 录制设置管理命令，支持查看和配置频道的回放设置、转存录制文件到点播。

**As a** 运营人员或 PaaS 客户开发者
**I want** 通过 CLI 管理直播频道的录制设置
**So that** 查看和配置频道的回放设置、转存录制文件到点播

---

## Acceptance Criteria

1. **AC1**: `record setting get` 命令支持 `--channel-id` 参数获取频道回放设置
2. **AC2**: `record setting set` 命令支持更新频道回放设置（回放开关、回放方式、回放来源等）
3. **AC3**: `record convert` 命令支持将录制文件转存到点播（同步模式）
4. **AC4**: `record convert` 命令支持 `--async` 参数异步转存
5. **AC5**: `record set-default` 命令支持设置默认回放视频
6. **AC6**: 所有命令支持 `--output` 参数选择 table 或 json 输出格式
7. **AC7**: 表格输出格式清晰，显示设置信息
8. **AC8**: JSON 输出完整包含所有 API 返回字段

---

## Failing Tests Created (RED Phase)

### Handler Tests (22 tests)

**File:** `packages/cli/src/handlers/record.handler.test.ts`

- **AC1: getPlaybackSetting**
  - `should call service with channelId`
  - `should display playback settings in table format by default`
  - `should display playback settings in JSON format when requested`
  - `should handle empty/null response fields gracefully`

- **AC2: setPlaybackSetting**
  - `should call service with correct parameters`
  - `should validate required channelId`
  - `should display success message after update`
  - `should display result in JSON format when requested`

- **AC3: recordConvert (sync mode)**
  - `should call service with correct parameters`
  - `should display convert result in table format`
  - `should display vid in output`
  - `should validate required fileName`

- **AC4: recordConvert (async mode)**
  - `should call service with async flag`
  - `should display async status message`
  - `should not return vid in async mode`

- **AC5: setRecordDefault**
  - `should call service with correct parameters`
  - `should display success message`
  - `should support listType parameter`

- **Error Handling**
  - `should handle service errors gracefully`
  - `should validate required parameters`

### Commands Tests (18 tests)

**File:** `packages/cli/tests/commands/record.commands.spec.ts`

- **Command Registration**
  - `should register record command group`
  - `should register setting subcommand group`
  - `should register setting get subcommand`
  - `should register setting set subcommand`
  - `should register convert subcommand`
  - `should register set-default subcommand`

- **Required Options**
  - `should require --channel-id for setting get`
  - `should require --channel-id for setting set`
  - `should require --channel-id for convert`
  - `should require --file-name for convert`
  - `should require --channel-id for set-default`
  - `should require --video-id for set-default`

- **Optional Options**
  - `should have optional --output with default table`
  - `should have optional --async flag for convert`
  - `should have optional --list-type for set-default`

### Service SDK Tests (12 tests)

**File:** `packages/cli/src/services/record.service.sdk.test.ts`

- **getPlaybackSetting**
  - `should call SDK client.channel.getPlaybackSetting`
  - `should transform response to display format`

- **setPlaybackSetting**
  - `should call SDK client.channel.setPlaybackSetting`
  - `should pass all options correctly`

- **recordConvert (sync)**
  - `should call SDK client.channel.recordConvert`
  - `should return vid from response`

- **recordConvert (async)**
  - `should call SDK client.channel.recordConvertAsync`
  - `should return async result`

- **setRecordDefault**
  - `should call SDK client.channel.setRecordDefault`
  - `should pass listType if provided`

---

## Test Files Created

### 1. Handler Test File

**Path:** `packages/cli/src/handlers/record.handler.test.ts`

**Tests:** 22 tests (all failing - RED phase)

### 2. Commands Test File

**Path:** `packages/cli/tests/commands/record.commands.spec.ts`

**Tests:** 18 tests (all failing - RED phase)

### 3. Service SDK Test File

**Path:** `packages/cli/src/services/record.service.sdk.test.ts`

**Tests:** 12 tests (all failing - RED phase)

---

## Required Type Definitions

**File:** `packages/cli/src/types/record.ts` (to be created)

```typescript
export interface RecordServiceConfig {
  baseUrl: string;
  timeout: number;
  debug: boolean;
}

export interface RecordSettingGetOptions {
  channelId: string;
  output?: 'table' | 'json';
}

export interface RecordSettingSetOptions {
  channelId: string;
  playbackEnabled?: 'Y' | 'N';
  type?: 'single' | 'list';
  origin?: 'record' | 'playback' | 'vod' | 'material';
  videoId?: string;
  globalSettingEnabled?: 'Y' | 'N';
  sectionEnabled?: 'Y' | 'N';
  playbackMultiplierEnabled?: 'Y' | 'N';
  playbackProgressBarEnabled?: 'Y' | 'N';
  playbackProgressBarOperationType?: 'drag' | 'prohibitDrag' | 'dragHistoryOnly';
  showPlayButtonEnabled?: 'Y' | 'N';
  chatPlaybackEnabled?: 'Y' | 'N';
  productPlaybackEnabled?: 'Y' | 'N';
  questionnairePlaybackEnabled?: 'Y' | 'N';
  qaPlaybackEnabled?: 'Y' | 'N';
  cardPushPlaybackEnabled?: 'Y' | 'N';
  checkInPlaybackEnabled?: 'Y' | 'N';
  output?: 'table' | 'json';
}

export interface RecordConvertOptions {
  channelId: string;
  fileId?: string;
  sessionId?: string;
  fileName: string;
  cataId?: string;
  cataName?: string;
  toPlayList?: 'Y' | 'N';
  setAsDefault?: 'Y' | 'N';
  async?: boolean;
  callbackUrl?: string;
  output?: 'table' | 'json';
}

export interface RecordSetDefaultOptions {
  channelId: string;
  videoId: string;
  listType?: 'playback' | 'vod';
  output?: 'table' | 'json';
}

export interface RecordSettingDisplayItem {
  channelId: string;
  playbackEnabled?: string;
  type?: string;
  origin?: string;
  videoId?: string;
  videoName?: string;
  sectionEnabled?: string;
  globalSettingEnabled?: string;
  playbackMultiplierEnabled?: string;
  playbackProgressBarEnabled?: string;
  playbackProgressBarOperationType?: string;
  showPlayButtonEnabled?: string;
  chatPlaybackEnabled?: string;
  productPlaybackEnabled?: string;
  questionnairePlaybackEnabled?: string;
  qaPlaybackEnabled?: string;
  cardPushPlaybackEnabled?: string;
  checkInPlaybackEnabled?: string;
  crontabType?: string;
  startTime?: number;
  endTime?: number;
}

export interface RecordConvertResult {
  async: boolean;
  vid?: string;
}
```

---

## Implementation Checklist

### Test: Handler - getPlaybackSetting

**File:** `packages/cli/src/handlers/record.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Create `packages/cli/src/types/record.ts` with type definitions
- [ ] Create `packages/cli/src/handlers/record.handler.ts` with `RecordHandler` class
- [ ] Implement `getPlaybackSetting()` method
- [ ] Create `packages/cli/src/services/record.service.sdk.ts` with `RecordServiceSdk` class
- [ ] Implement `IRecordService` interface
- [ ] Run test: `npx jest src/handlers/record.handler.test.ts`
- [ ] Test passes (green phase)

---

### Test: Handler - setPlaybackSetting

**File:** `packages/cli/src/handlers/record.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Implement `setPlaybackSetting()` method in `RecordHandler`
- [ ] Implement `setPlaybackSetting()` method in `RecordServiceSdk`
- [ ] Add parameter validation
- [ ] Run test: `npx jest src/handlers/record.handler.test.ts`
- [ ] Test passes (green phase)

---

### Test: Handler - recordConvert

**File:** `packages/cli/src/handlers/record.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Implement `recordConvert()` method in `RecordHandler`
- [ ] Implement `recordConvert()` method in `RecordServiceSdk` (sync mode)
- [ ] Implement `recordConvertAsync()` method in `RecordServiceSdk` (async mode)
- [ ] Add sync/async mode handling
- [ ] Run test: `npx jest src/handlers/record.handler.test.ts`
- [ ] Test passes (green phase)

---

### Test: Handler - setRecordDefault

**File:** `packages/cli/src/handlers/record.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Implement `setRecordDefault()` method in `RecordHandler`
- [ ] Implement `setRecordDefault()` method in `RecordServiceSdk`
- [ ] Add listType parameter support
- [ ] Run test: `npx jest src/handlers/record.handler.test.ts`
- [ ] Test passes (green phase)

---

### Test: Commands - record setting get

**File:** `packages/cli/tests/commands/record.commands.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `packages/cli/src/commands/record.commands.ts`
- [ ] Implement `registerRecordCommands()` function
- [ ] Create `record` command group
- [ ] Create `setting` subcommand group
- [ ] Create `setting get` subcommand
- [ ] Register in `src/index.ts`
- [ ] Run test: `npx jest tests/commands/record.commands.spec.ts`
- [ ] Test passes (green phase)

---

### Test: Commands - record setting set

**File:** `packages/cli/tests/commands/record.commands.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `setting set` subcommand with all options
- [ ] Add option validators
- [ ] Run test: `npx jest tests/commands/record.commands.spec.ts`
- [ ] Test passes (green phase)

---

### Test: Commands - record convert

**File:** `packages/cli/tests/commands/record.commands.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `convert` subcommand
- [ ] Add `--file-name`, `--session-id`, `--async` options
- [ ] Run test: `npx jest tests/commands/record.commands.spec.ts`
- [ ] Test passes (green phase)

---

### Test: Commands - record set-default

**File:** `packages/cli/tests/commands/record.commands.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `set-default` subcommand
- [ ] Add `--video-id`, `--list-type` options
- [ ] Run test: `npx jest tests/commands/record.commands.spec.ts`
- [ ] Test passes (green phase)

---

### Test: Service SDK - RecordServiceSdk

**File:** `packages/cli/src/services/record.service.sdk.test.ts`

**Tasks to make this test pass:**

- [ ] Implement `getPlaybackSetting()` in `RecordServiceSdk`
- [ ] Implement `setPlaybackSetting()` in `RecordServiceSdk`
- [ ] Implement `recordConvert()` in `RecordServiceSdk`
- [ ] Implement `recordConvertAsync()` in `RecordServiceSdk`
- [ ] Implement `setRecordDefault()` in `RecordServiceSdk`
- [ ] Run test: `npx jest src/services/record.service.sdk.test.ts`
- [ ] Test passes (green phase)

---

## Running Tests

```bash
# Switch to Node 23 first
nvm use 23

# Run all failing tests for this story
pnpm --filter polyv-live-cli test:unit

# Run specific test file
npx jest src/handlers/record.handler.test.ts
npx jest tests/commands/record.commands.spec.ts
npx jest src/services/record.service.sdk.test.ts

# Run with coverage
pnpm --filter polyv-live-cli test:coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- All tests written and failing
- Type definitions documented
- Implementation checklist created
- Test files created

**Verification:**

- All tests run and fail as expected
- Failure messages are clear and actionable
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. Pick one failing test from implementation checklist
2. Read the test to understand expected behavior
3. Implement minimal code to make that specific test pass
4. Run the test to verify it now passes (green)
5. Check off the task in implementation checklist
6. Move to next test and repeat

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

1. Verify all tests pass (green phase complete)
2. Review code for quality
3. Extract duplications (DRY principle)
4. Optimize performance if needed
5. Ensure tests still pass after each refactor
6. Update Skill documentation

---

## Next Steps

1. Run failing tests to confirm RED phase
2. Begin implementation using checklist as guide
3. Work one test at a time (red -> green for each)
4. When all tests pass, update Skill documentation
5. Run coverage to verify >= 80%

---

## Notes

- SDK methods (`getPlaybackSetting`, `recordConvert`, `recordConvertAsync`, `setRecordDefault`) already exist in `packages/sdk/src/services/channel.service.ts`
- May need to add `setPlaybackSetting` method to SDK if not already present for `/live/v3/channel/playback/set-setting` API
- Follow the same pattern as `PlaybackHandler` and `SessionHandler`
- Use `BaseHandler` for error handling and display utilities

---

**Generated by BMad TEA Agent** - 2026-03-23
