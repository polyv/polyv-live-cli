---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
  - step-04c-aggregate
  - step-05-validate-and-complete
lastStep: step-05-validate-and-complete
lastSaved: '2026-03-22T00:00:00Z'
workflowType: testarch-atdd
inputDocuments:
  - _bmad-output/implementation-artifacts/9-1-playback-list.md
  - packages/sdk/src/services/channel.service.ts
  - packages/sdk/src/types/channel.ts
---

# ATDD Checklist - Epic 9, Story 1: 回放列表命令

**Date:** 2026-03-22
**Author:** ATDD Workflow
**Primary Test Level:** Unit (CLI Jest)

---

## Story Summary

作为运营人员或 PaaS 客户开发者，我希望通过 CLI 列出频道的回放视频列表，以便管理和查看直播回放内容。

**As a** 运营人员或 PaaS 客户开发者
**I want** 通过 CLI 列出频道的回放视频列表
**So that** 管理和查看直播回放内容

---

## Acceptance Criteria

1. **AC1**: `playback list` 命令支持通过 `--channel-id` 参数获取指定频道的回放列表
2. **AC2**: 支持分页参数 `--page` 和 `--page-size`
3. **AC3**: 支持 `--list-type` 参数区分回放列表(playback)和点播列表(vod)
4. **AC4**: 表格输出格式清晰，显示视频ID、标题、时长、创建时间等关键信息
5. **AC5**: JSON 输出完整包含所有字段
6. **AC6**: 优雅处理空结果（无回放视频时显示友好提示）

---

## Failing Tests Created (RED Phase)

### CLI Unit Tests (Jest)

#### CLI Types Tests

**File:** `packages/cli/src/types/playback.test.ts`

- **Test:** PlaybackListOptions interface definition
  - **Status:** RED - Type not implemented
  - **Verifies:** AC1, AC2, AC3 - CLI options for playback list

- **Test:** PlaybackServiceConfig interface definition
  - **Status:** RED - Type not implemented
  - **Verifies:** Service configuration

- **Test:** PlaybackDisplayItem interface definition
  - **Status:** RED - Type not implemented
  - **Verifies:** AC4, AC5 - Table/JSON display item

#### CLI Handler Tests

**File:** `packages/cli/src/handlers/playback.handler.test.ts`

- **Test:** PlaybackHandler constructor
  - **Status:** RED - Class not implemented
  - **Verifies:** Handler instantiation

- **Test:** listPlayback calls SDK service
  - **Status:** RED - Method not implemented
  - **Verifies:** AC1 - Calls channel.getPlaybackList()

- **Test:** listPlayback with pagination options
  - **Status:** RED - Method not implemented
  - **Verifies:** AC2 - Passes page/pageSize to SDK

- **Test:** listPlayback with listType option
  - **Status:** RED - Method not implemented
  - **Verifies:** AC3 - Passes listType to SDK

- **Test:** listPlayback table output format
  - **Status:** RED - Method not implemented
  - **Verifies:** AC4 - Table with Chinese headers

- **Test:** listPlayback JSON output format
  - **Status:** RED - Method not implemented
  - **Verifies:** AC5 - Full JSON output

- **Test:** listPlayback empty result handling
  - **Status:** RED - Method not implemented
  - **Verifies:** AC6 - Friendly empty message

#### CLI Commands Tests

**File:** `packages/cli/src/commands/playback.commands.test.ts`

- **Test:** playback command group registration
  - **Status:** RED - Command not implemented
  - **Verifies:** AC1 - playback command exists

- **Test:** playback list subcommand registration
  - **Status:** RED - Command not implemented
  - **Verifies:** AC1 - playback list command exists

- **Test:** --channel-id required option
  - **Status:** RED - Option not implemented
  - **Verifies:** AC1 - channelId is required

- **Test:** --page optional option
  - **Status:** RED - Option not implemented
  - **Verifies:** AC2 - Page number parameter

- **Test:** --page-size optional option
  - **Status:** RED - Option not implemented
  - **Verifies:** AC2 - Page size parameter

- **Test:** --list-type optional option with validation
  - **Status:** RED - Option not implemented
  - **Verifies:** AC3 - Accepts playback/vod

- **Test:** --output optional option with default
  - **Status:** RED - Option not implemented
  - **Verifies:** AC4, AC5 - Output format (table/json)

---

## Test Summary

| Category | Test Count | Status |
|----------|------------|--------|
| CLI Types Tests | 3 | RED (all failing) |
| CLI Handler Tests | 7 | RED (all failing) |
| CLI Commands Tests | 7 | RED (all failing) |
| **Total** | **17** | **RED** |

---

## Implementation Checklist

### Task 1: CLI Type Definitions

**File:** `packages/cli/src/types/playback.ts`

**Tasks to make tests pass:**

- [ ] Define `PlaybackListOptions` interface
  - channelId: string (required)
  - page?: number
  - pageSize?: number
  - listType?: 'playback' | 'vod'
  - output?: 'table' | 'json'
- [ ] Define `PlaybackServiceConfig` interface
  - baseUrl: string
  - timeout: number
  - debug: boolean
- [ ] Define `PlaybackDisplayItem` interface for table display
- [ ] Export all types from `types/index.ts`
- [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- playback`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Task 2: CLI Handler Implementation

**File:** `packages/cli/src/handlers/playback.handler.ts`

**Tasks to make tests pass:**

- [ ] Create `PlaybackHandler` class extending `BaseHandler`
- [ ] Implement constructor with authConfig and serviceConfig
- [ ] Implement `listPlayback(options: PlaybackListOptions)` method
- [ ] Use `PolyVClient` to call SDK: `client.channel.getPlaybackList(channelId, params)`
- [ ] Implement table output format (Chinese headers: 视频ID, 标题, 时长, 创建时间, 状态)
- [ ] Implement JSON output format
- [ ] Implement empty result friendly message
- [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- playback`
- [ ] Test passes (green phase)

**Estimated Effort:** 1.5 hours

---

### Task 3: CLI Commands Registration

**File:** `packages/cli/src/commands/playback.commands.ts`

**Tasks to make tests pass:**

- [ ] Create `playback` command group
- [ ] Create `playback list` subcommand
- [ ] Define required option: `--channel-id` / `-c`
- [ ] Define optional options:
  - `--page` (default: 1)
  - `--page-size` (default: 10)
  - `--list-type` (choices: playback, vod)
  - `--output` / `-o` (default: table, choices: table, json)
- [ ] Implement `validateListType` helper (optional)
- [ ] Add help text with examples
- [ ] Register commands in `src/index.ts`
- [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- playback`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Task 4: Run Full Test Suite

**Tasks:**

- [ ] Run all CLI tests: `pnpm --filter polyv-live-cli test:unit`
- [ ] Verify coverage >= 80% for functions, lines, statements
- [ ] Verify coverage >= 70% for branches
- [ ] Run coverage report: `pnpm --filter polyv-live-cli test:coverage`

**Estimated Effort:** 0.5 hours

---

## Running Tests

```bash
# Run all failing tests for this story
pnpm --filter polyv-live-cli test:unit -- playback

# Run specific test files
pnpm --filter polyv-live-cli test:unit -- playback.test.ts
pnpm --filter polyv-live-cli test:unit -- playback.handler.test.ts
pnpm --filter polyv-live-cli test:unit -- playback.commands.test.ts

# Run with coverage
pnpm --filter polyv-live-cli test:coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- All tests written with failing assertions (types not implemented)
- Tests assert EXPECTED behavior from acceptance criteria
- No placeholder assertions
- Failure messages will be clear when tests run

**Verification:**

- 17 tests created across 3 test files
- Tests cover all 6 acceptance criteria

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test file** from implementation checklist
2. **Read the tests** to understand expected interface and behavior
3. **Implement minimal code** to make those specific tests pass
4. **Run tests** to verify they pass (green)
5. **Check off the task** in implementation checklist
6. **Move to next test file** and repeat

**Key Principles:**

- One test file at a time (follow task order)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Progress Tracking:**

- [ ] Task 1: CLI Type Definitions
- [ ] Task 2: CLI Handler Implementation
- [ ] Task 3: CLI Commands Registration
- [ ] Task 4: Run Full Test Suite

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability, performance)
3. **Extract duplications** (DRY principle)
4. **Ensure 80%+ test coverage**
5. **Update documentation** (if API contracts change)

---

## Next Steps

1. **Begin implementation** using Task 1 as starting point
2. **Follow ATDD pattern**: Run test, see fail, implement, see pass
3. **Work one task at a time** (Types first, then Handler, then Commands)
4. **Run tests frequently** to verify progress
5. **When all tests pass**, run full test suite for coverage

---

## Knowledge Base References Applied

This ATDD workflow consulted the following patterns:

- **Jest patterns** from existing `statistics.handler.test.ts` and `statistics.commands.test.ts`
- **Type definitions** from existing `types/statistics.ts` and `types/player.ts`
- **Handler pattern** from `handlers/statistics.handler.ts`
- **Command registration pattern** from `commands/statistics.commands.ts`
- **SDK service pattern** from existing `ChannelService.getPlaybackList()`

---

## Notes

### SDK Already Implemented

The SDK already has the required method:
- `ChannelService.getPlaybackList(channelId, options)` - exists in `packages/sdk/src/services/channel.service.ts`
- Types `PlaybackListRequest`, `PlaybackListResponse`, `PlaybackVideoItem` - exist in `packages/sdk/src/types/channel.ts`

### CLI-Only Implementation

This story only requires CLI layer implementation:
- Types in `packages/cli/src/types/playback.ts`
- Handler in `packages/cli/src/handlers/playback.handler.ts`
- Commands in `packages/cli/src/commands/playback.commands.ts`

### Command Examples

```bash
# Basic usage
polyv-live-cli playback list -c "3151318"

# With pagination
polyv-live-cli playback list -c "3151318" --page 2 --page-size 20

# With list type
polyv-live-cli playback list -c "3151318" --list-type vod

# JSON output
polyv-live-cli playback list -c "3151318" -o json
```

### Table Output Design

```
回放列表 (频道: 3151318, 共 5 条)

+--------------+------------------------+----------+---------------------+--------+
| 视频ID       | 标题                   | 时长     | 创建时间            | 状态   |
+--------------+------------------------+----------+---------------------+--------+
| 1b96d90bf5   | Spring 知识精讲        | 00:01:53 | 2021-03-12 10:31:04 | 启用   |
| 2c07e91cg6   | 直播回放测试           | 00:05:30 | 2021-03-13 14:22:18 | 启用   |
+--------------+------------------------+----------+---------------------+--------+

第 1 页，共 1 页
```

---

**Generated by BMad TEA Agent** - 2026-03-22
