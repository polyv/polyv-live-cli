---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode']
lastStep: 'step-02-generation-mode'
lastSaved: '2026-03-23'
storyId: '9-3'
inputDocuments:
  - '_bmad-output/implementation-artifacts/9-3-playback-delete.md'
  - 'packages/cli/src/handlers/playback.handler.ts'
  - 'packages/cli/src/commands/playback.commands.ts'
  - 'packages/cli/src/handlers/playback.handler.test.ts'
  - 'packages/cli/src/commands/playback.commands.test.ts'
  - 'packages/cli/src/types/playback.ts'
  - 'packages/cli/src/utils/confirmation.ts'
  - 'packages/cli/src/services/playback.service.sdk.ts'
---

# ATDD Checklist - Story 9-3: Playback Delete Command

## Story Overview

**Title**: 回放删除命令 (Playback Delete Command)

**User Story**:
> 作为运营人员或 PaaS 客户开发者,
> 我希望通过 CLI 删除指定的回放文件,
> 以便清理不需要的内容并释放存储空间。

**Status**: ready-for-dev

---

## Acceptance Criteria

| AC | Description | Test Coverage |
|----|-------------|---------------|
| AC1 | `playback delete` 命令支持 `--channel-id` 参数（必填） | CLI Commands Tests |
| AC2 | `playback delete` 命令支持 `--video-id` 参数（必填） | CLI Commands Tests |
| AC3 | 删除前需要确认提示，除非使用 `--force` 标志 | CLI Handler Tests |
| AC4 | 成功删除后显示确认消息 | CLI Handler Tests |
| AC5 | 支持 `--list-type` 参数区分回放列表(playback)和点播列表(vod) | CLI Commands & Handler Tests |
| AC6 | 支持 `--force` 标志跳过确认提示 | CLI Handler Tests |
| AC7 | 支持 `--output` 参数选择 table 或 json 输出格式 | CLI Handler Tests |
| AC8 | 表格输出格式清晰，显示删除结果 | CLI Handler Tests |

---

## Test Files to Create/Update

### 1. CLI Handler Tests
**File**: `packages/cli/src/handlers/playback.handler.test.ts`

**New Test Cases for `deletePlayback` method**:

#### AC3: Confirmation Flow
- [ ] `should prompt for confirmation before deletion when force is false`
- [ ] `should throw error in non-TTY environment without force flag`
- [ ] `should cancel operation when user declines confirmation`
- [ ] `should proceed with deletion when user confirms`

#### AC4: Success Message
- [ ] `should display success message after successful deletion`
- [ ] `should include channelId and videoId in success message`

#### AC6: Force Flag
- [ ] `should skip confirmation when force flag is true`
- [ ] `should call deletePlayback immediately when force is true`

#### AC7, AC8: Output Format
- [ ] `should display deletion result in table format by default`
- [ ] `should display deletion result in JSON format when output is json`
- [ ] `should include video title in table output`
- [ ] `should include status "已删除" in table output`

#### Parameter Handling
- [ ] `should call playbackService.deletePlayback with correct parameters`
- [ ] `should pass listType parameter to service`
- [ ] `should validate required channelId`
- [ ] `should validate required videoId`

#### Error Handling
- [ ] `should handle service errors gracefully`
- [ ] `should handle API error responses`
- [ ] `should handle video not found error`

### 2. CLI Commands Tests
**File**: `packages/cli/src/commands/playback.commands.test.ts`

**New Test Cases for `playback delete` command**:

#### AC1: --channel-id Option
- [ ] `should require --channel-id option`
- [ ] `should accept --channel-id with short form -c`
- [ ] `should accept --channel-id with long form`
- [ ] `should have required --channel-id option`

#### AC2: --video-id Option
- [ ] `should require --video-id option`
- [ ] `should have required --video-id option`

#### AC5: --list-type Option
- [ ] `should have --list-type option for delete command`
- [ ] `should have default listType value of playback`

#### AC6: --force Option
- [ ] `should have --force flag option`
- [ ] `should have default force value of false`

#### AC7: --output Option
- [ ] `should have --output option with short form -o`
- [ ] `should have default output value of table`

#### Command Registration
- [ ] `should have playback delete subcommand`
- [ ] `should include delete in command description`

#### Help Text
- [ ] `should include examples in help text for delete command`
- [ ] `should describe all options in help text for delete command`
- [ ] `should include force flag in help text`

### 3. Type Definitions
**File**: `packages/cli/src/types/playback.ts`

**New Interface Required**:
```typescript
export interface PlaybackDeleteOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Video ID (required) */
  videoId: string;
  /** List type: 'playback' or 'vod' */
  listType?: 'playback' | 'vod';
  /** Skip confirmation prompt */
  force?: boolean;
  /** Output format */
  output?: 'table' | 'json';
}
```

### 4. Service Interface Update
**File**: `packages/cli/src/handlers/playback.handler.ts`

**Update IPlaybackService interface**:
```typescript
export interface IPlaybackService {
  getPlaybackList(options: PlaybackListOptions): Promise<{...}>;
  deletePlayback(channelId: string, videoId: string, listType?: 'playback' | 'vod'): Promise<boolean>;
}
```

---

## Test Data

### Mock Playback Service Response
```typescript
const mockDeleteSuccess = true;
```

### Mock Playback Item for Delete Output
```typescript
const mockPlaybackItem = {
  videoId: '1b96d90bf5',
  title: 'Spring 知识精讲',
  channelId: '3151318',
  status: 'Y',
};
```

---

## Expected CLI Interface

### Command Signature
```bash
polyv-live-cli playback delete -c <channelId> --video-id <videoId> [options]
```

### Options
| Option | Short | Required | Default | Description |
|--------|-------|----------|---------|-------------|
| --channel-id | -c | Yes | - | 频道ID |
| --video-id | | Yes | - | 视频ID |
| --list-type | | No | playback | 列表类型 (playback\|vod) |
| --force | | No | false | 跳过确认提示 |
| --output | -o | No | table | 输出格式 (table\|json) |

### Example Usage
```bash
# Basic usage (requires confirmation)
polyv-live-cli playback delete -c "3151318" --video-id "1b96d90bf5"

# Skip confirmation
polyv-live-cli playback delete -c "3151318" --video-id "1b96d90bf5" --force

# Specify list type
polyv-live-cli playback delete -c "3151318" --video-id "1b96d90bf5" --list-type vod --force

# JSON output
polyv-live-cli playback delete -c "3151318" --video-id "1b96d90bf5" --force -o json
```

---

## Implementation Files (Not Tests)

The following files need to be updated/created for implementation:

1. `packages/cli/src/types/playback.ts` - Add `PlaybackDeleteOptions` interface
2. `packages/cli/src/handlers/playback.handler.ts` - Add `deletePlayback` method
3. `packages/cli/src/commands/playback.commands.ts` - Add `playback delete` subcommand
4. `packages/cli/src/services/playback.service.sdk.ts` - Add `deletePlayback` method

---

## Coverage Target

- Handler: >= 80%
- Commands: >= 80%
- Overall: >= 80%

---

## Dependencies

- SDK Method: `client.channel.deletePlayback(channelId, videoId, listType)` (already exists)
- Confirmation Utility: `confirmDeletion` from `../utils/confirmation`
- Base Handler: `BaseHandler` from `./base.handler`

---

## Notes

1. This is a **destructive operation** - confirmation is mandatory unless `--force` is used
2. Non-TTY environments MUST use `--force` flag
3. Table output should display clear deletion confirmation with video details
4. Follow the pattern established by `channel delete` command for confirmation flow
