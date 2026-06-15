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
  - _bmad-output/implementation-artifacts/10-4-statistics-export.md
  - packages/sdk/src/services/statistics.service.ts
  - packages/cli/src/handlers/statistics.handler.ts
  - packages/cli/src/commands/statistics.commands.ts
---

# ATDD Checklist - Epic 10, Story 4: 统计报表导出命令

**Date:** 2026-03-22
**Author:** ATDD Workflow
**Primary Test Level:** Unit (SDK Vitest, CLI Jest)

---

## Story Summary

作为运营人员，我希望通过 CLI 导出频道统计报表（观看日志和场次报表），以便将数据导出为 CSV 文件进行线下分析或存档。

**As a** 运营人员
**I want** 通过 CLI 导出频道统计报表（观看日志和场次报表）
**So that** 将数据导出为 CSV 文件进行线下分析或存档

---

## Acceptance Criteria

1. **AC1**: `statistics export viewlog` 命令支持导出频道观看日志数据
2. **AC2**: `statistics export session` 命令支持导出频道场次报表（返回下载链接）
3. **AC3**: `viewlog` 命令支持 `--start-time` 和 `--end-time` 参数按时间范围过滤
4. **AC4**: `viewlog` 命令支持 `--watch-type` 参数过滤观看类型（live/vod）
5. **AC5**: `viewlog` 命令支持 `--output` 参数指定输出文件路径（CSV 格式）
6. **AC6**: `session` 命令需要 `--session-id` 参数指定场次
7. **AC7**: `session` 命令返回报表下载链接
8. **AC8**: 表格输出格式清晰，显示导出状态和文件路径/链接
9. **AC9**: JSON 输出完整包含所有字段
10. **AC10**: 支持 `--channel-id` 参数指定频道（viewlog 必需，session 可选）

---

## Failing Tests Created (RED Phase)

### SDK Unit Tests (Vitest)

#### SDK Types Tests

**File:** `packages/sdk/src/types/statistics-export.test.ts` (96 lines)

- **Test:** ViewlogItem Type Definition
  - **Status:** RED - Type not implemented
  - **Verifies:** AC1 - Viewlog data item structure

- **Test:** GetViewlogParams Type Definition
  - **Status:** RED - Type not implemented
  - **Verifies:** AC3, AC4, AC10 - Request parameters

- **Test:** GetViewlogResponse Type Definition
  - **Status:** RED - Type not implemented
  - **Verifies:** AC1 - Pagination response

- **Test:** ExportSessionStatsParams Type Definition
  - **Status:** RED - Type not implemented
  - **Verifies:** AC6, AC10 - Session export parameters

- **Test:** ExportSessionStatsResponse Type Definition
  - **Status:** RED - Type not implemented
  - **Verifies:** AC2, AC7 - Download URL response

#### SDK Service Tests

**File:** `packages/sdk/src/services/statistics.service.export.test.ts` (415 lines)

- **Test:** getViewlog API call
  - **Status:** RED - Method not implemented
  - **Verifies:** AC1 - Calls `/live/v3/user/statistics/viewlog`

- **Test:** getViewlog date time validation
  - **Status:** RED - Method not implemented
  - **Verifies:** AC3 - Same month constraint

- **Test:** getViewlog watchType filter
  - **Status:** RED - Method not implemented
  - **Verifies:** AC4 - Accepts live/vod

- **Test:** exportSessionStats API call
  - **Status:** RED - Method not implemented
  - **Verifies:** AC2, AC6, AC7 - Calls `/live/v3/channel/session/stats/export`

### CLI Unit Tests (Jest)

#### CLI Types Tests

**File:** `packages/cli/src/types/statistics-export.test.ts` (112 lines)

- **Test:** StatisticsExportViewlogOptions
  - **Status:** RED - Type not implemented
  - **Verifies:** AC1, AC3, AC4, AC5, AC10

- **Test:** StatisticsExportSessionOptions
  - **Status:** RED - Type not implemented
  - **Verifies:** AC2, AC6, AC10

- **Test:** ViewlogDisplayItem
  - **Status:** RED - Type not implemented
  - **Verifies:** AC8, AC9

- **Test:** SessionExportDisplayItem
  - **Status:** RED - Type not implemented
  - **Verifies:** AC8, AC9

#### CLI Handler Tests

**File:** `packages/cli/src/handlers/statistics.handler.export.test.ts` (320 lines)

- **Test:** exportViewlog calls service
  - **Status:** RED - Method not implemented
  - **Verifies:** AC1

- **Test:** exportViewlog CSV file output
  - **Status:** RED - Method not implemented
  - **Verifies:** AC5 - CSV with Chinese headers

- **Test:** exportViewlog table/JSON output
  - **Status:** RED - Method not implemented
  - **Verifies:** AC8, AC9

- **Test:** exportSessionStats displays download link
  - **Status:** RED - Method not implemented
  - **Verifies:** AC2, AC7

#### CLI Commands Tests

**File:** `packages/cli/src/commands/statistics.commands.export.test.ts` (315 lines)

- **Test:** statistics export command group registration
  - **Status:** RED - Command not implemented
  - **Verifies:** AC1, AC2

- **Test:** statistics export viewlog options
  - **Status:** RED - Command not implemented
  - **Verifies:** AC3, AC4, AC5, AC10

- **Test:** statistics export session options
  - **Status:** RED - Command not implemented
  - **Verifies:** AC6, AC10

- **Test:** validateDateTimeFormat helper
  - **Status:** RED - Function not implemented
  - **Verifies:** AC3

- **Test:** validateWatchType helper
  - **Status:** RED - Function not implemented
  - **Verifies:** AC4

- **Test:** validateSameMonth helper
  - **Status:** RED - Function not implemented
  - **Verifies:** AC3

---

## Test Summary

| Category | Test Count | Status |
|----------|------------|--------|
| SDK Types Tests | 5 | RED (all skipped) |
| SDK Service Tests | 15 | RED (all skipped) |
| CLI Types Tests | 4 | RED (all skipped) |
| CLI Handler Tests | 10 | RED (all skipped) |
| CLI Commands Tests | 12 | RED (all skipped) |
| **Total** | **46** | **RED** |

---

## Implementation Checklist

### Task 1: SDK Type Definitions

**File:** `packages/sdk/src/types/statistics-export.ts`

**Tasks to make tests pass:**

- [ ] Define `ViewlogItem` interface (30+ fields from API)
- [ ] Define `GetViewlogParams` interface
- [ ] Define `GetViewlogResponse` interface
- [ ] Define `ExportSessionStatsParams` interface
- [ ] Define `ExportSessionStatsResponse` interface
- [ ] Export all types from `types/index.ts`
- [ ] Run tests: `pnpm --filter polyv-live-api-sdk test:unit`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Task 2: SDK Service Methods

**File:** `packages/sdk/src/services/statistics.service.ts`

**Tasks to make tests pass:**

- [ ] Implement `getViewlog(params)` method
- [ ] Implement `exportSessionStats(params)` method
- [ ] Add date time validation (same month constraint)
- [ ] Add watchType validation (live/vod)
- [ ] Add parameter validation (channelId, sessionId required)
- [ ] Run tests: `pnpm --filter polyv-live-api-sdk test:unit`
- [ ] Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Task 3: CLI Type Definitions

**File:** `packages/cli/src/types/statistics-export.ts`

**Tasks to make tests pass:**

- [ ] Define `StatisticsExportViewlogOptions` interface
- [ ] Define `StatisticsExportSessionOptions` interface
- [ ] Define `ViewlogDisplayItem` interface
- [ ] Define `SessionExportDisplayItem` interface
- [ ] Export from `types/index.ts`
- [ ] Run tests: `pnpm --filter polyv-live-cli test:unit`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Task 4: CLI Service SDK Extension

**File:** `packages/cli/src/services/statistics.service.sdk.ts`

**Tasks to make tests pass:**

- [ ] Add `getViewlog(options)` method
- [ ] Add `exportSessionStats(options)` method
- [ ] Transform SDK types to CLI display types
- [ ] Run tests: `pnpm --filter polyv-live-cli test:unit`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Task 5: CLI Handler Methods

**File:** `packages/cli/src/handlers/statistics.handler.ts`

**Tasks to make tests pass:**

- [ ] Implement `exportViewlog(options)` method
- [ ] Implement `exportSessionStats(options)` method
- [ ] Implement CSV file writing (fs.writeFileSync)
- [ ] Implement table output with preview (first 10 records)
- [ ] Implement JSON output
- [ ] Run tests: `pnpm --filter polyv-live-cli test:unit`
- [ ] Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Task 6: CLI Commands

**File:** `packages/cli/src/commands/statistics.commands.export.ts`

**Tasks to make tests pass:**

- [ ] Register `statistics export` command group
- [ ] Register `statistics export viewlog` subcommand
- [ ] Register `statistics export session` subcommand
- [ ] Implement `validateDateTimeFormat` helper
- [ ] Implement `validateWatchType` helper
- [ ] Implement `validateSameMonth` helper
- [ ] Add help text with examples
- [ ] Run tests: `pnpm --filter polyv-live-cli test:unit`
- [ ] Test passes (green phase)

**Estimated Effort:** 1.5 hours

---

## Running Tests

```bash
# Run all failing tests for this story
pnpm test:unit

# Run SDK tests specifically
pnpm --filter polyv-live-api-sdk test:unit -- statistics

# Run CLI tests specifically
pnpm --filter polyv-live-cli test:unit -- statistics

# Run with coverage
pnpm --filter polyv-live-cli test:coverage
pnpm --filter polyv-live-api-sdk test:coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- All tests written with `it.skip()` (intentionally failing)
- Tests assert EXPECTED behavior from acceptance criteria
- No placeholder assertions
- Failure messages will be clear when tests run

**Verification:**

- 46 tests created across 5 test files
- All tests use `it.skip()` to mark as intentionally failing
- Tests cover all 10 acceptance criteria

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test file** from implementation checklist
2. **Read the tests** to understand expected interface and behavior
3. **Implement minimal code** to make those specific tests pass
4. **Remove `it.skip()`** from passing tests
5. **Run tests** to verify they pass (green)
6. **Check off the task** in implementation checklist
7. **Move to next test file** and repeat

**Key Principles:**

- One test file at a time (follow task order)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Progress Tracking:**

- [ ] Task 1: SDK Type Definitions
- [ ] Task 2: SDK Service Methods
- [ ] Task 3: CLI Type Definitions
- [ ] Task 4: CLI Service SDK Extension
- [ ] Task 5: CLI Handler Methods
- [ ] Task 6: CLI Commands

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
2. **Follow ATDD pattern**: Remove skip, run test, see fail, implement, see pass
3. **Work one task at a time** (SDK types first, then SDK service, etc.)
4. **Run tests frequently** to verify progress
5. **When all tests pass**, run full test suite for coverage

---

## Knowledge Base References Applied

This ATDD workflow consulted the following patterns:

- **Vitest patterns** from existing `statistics.service.test.ts`
- **Jest patterns** from existing `statistics.handler.test.ts` and `statistics.commands.test.ts`
- **Type definitions** from existing `types/statistics.ts`
- **Service SDK wrapper pattern** from `statistics.service.sdk.ts`
- **Command registration pattern** from `statistics.commands.ts`

---

## Notes

### API Constraints

- **Same Month Constraint**: startDate and endDate for viewlog must be in the same month
- **Watch Type Values**: Only "live" or "vod" accepted
- **Session Export**: Returns download URL, not file content directly
- **Download URL Expiry**: Session report download links valid for 60 days

### CSV Format

观看日志 CSV 文件应包含以下列（中文表头）:

```
播放ID,观众ID,观众昵称,观看类型,播放时长(秒),停留时长(秒),场次ID,IP地址,国家,省份,城市,ISP,操作系统,浏览器,是否移动端,日期,创建时间
```

---

**Generated by BMad TEA Agent** - 2026-03-22
