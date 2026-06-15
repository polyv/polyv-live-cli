---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
lastStep: step-03-test-strategy
lastSaved: '2026-03-24'
inputDocuments:
  - _bmad-output/implementation-artifacts/11-3-checkin-management.md
  - _bmad/tea/testarch/knowledge/test-levels-framework.md
  - _bmad/tea/testarch/knowledge/test-priorities-matrix.md
  - _bmad/tea/testarch/knowledge/data-factories.md
  - _bmad/tea/testarch/knowledge/test-quality.md
  - _bmad/tea/testarch/knowledge/test-healing-patterns.md
  - CLAUDE.md
  - CLAUDE.local.md
  - MEMORY.md
storyId: '11-3'
stackType: backend
testFramework: jest
generationMode: ai-generation
---

# ATDD Test Checklist - Story 11-3: Checkin Management Commands

## Story Overview

**Story ID**: 11-3
**Title**: Checkin Management Commands
**Status**: ready-for-dev
**Stack Type**: Backend (Node.js CLI)
**Test Framework**: Jest 29.7.0

### Acceptance Criteria

1. **AC1**: `checkin start` 命令支持发起签到(支持设置签到时长、定时签到、签到提示语、强制签到)
2. **AC2**: `checkin list` 命令支持查询签到成功记录(支持分页、按日期或场次查询)
3. **AC3**: `checkin result` 命令支持查询签到详情(包括已签到和未签到记录)
4. **AC4**: `checkin sessions` 命令支持查询签到发起记录(按时间范围查询)
5. **AC5**: 所有命令支持 `--output table|json` 输出格式
6. **AC6**: 遵循 ATDD 开发模式,先编写测试,再实现功能
7. **AC7**: 复用已有的 SDK `LiveInteractionService` 和 `V4ChatService` 服务
8. **AC8**: 错误消息友好,清晰提示参数验证失败或 API 调用失败的情况
9. **AC9**: 表格输出格式清晰,显示签到ID、用户ID、昵称、签到时间等信息

## Test Strategy

### Test Levels (Backend Project)

- **Unit Tests**: Handler methods, input validation, output formatting
- **Integration Tests**: Handler → SDK wrapper → SDK service interaction
- **No E2E Tests**: CLI commands are tested via unit/integration tests

### Priority Classification

- **P0**: Critical paths (start checkin, list checkins, error handling)
- **P1**: Core features (result, sessions, output formats)
- **P2**: Secondary features (optional parameters, edge cases)
- **P3**: Nice-to-have (detailed error messages, logging)

---

## Test Scenarios

### 1. CheckinHandler Unit Tests

**Test File**: `packages/cli/src/handlers/checkin.handler.test.ts`
**Test Level**: Unit
**Priority**: P0

#### 1.1 startCheckin Method Tests

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.3-UNIT-001 | should start checkin with minimal parameters | P0 | AC1 | ✅ Yes (no implementation) |
| 11.3-UNIT-002 | should start checkin with limitTime parameter | P1 | AC1 | ✅ Yes |
| 11.3-UNIT-003 | should start checkin with delayTime parameter (scheduled checkin) | P1 | AC1 | ✅ Yes |
| 11.3-UNIT-004 | should start checkin with message parameter | P2 | AC1 | ✅ Yes |
| 11.3-UNIT-005 | should start checkin with force flag enabled | P2 | AC1 | ✅ Yes |
| 11.3-UNIT-006 | should validate channelId is required | P0 | AC8 | ✅ Yes |
| 11.3-UNIT-007 | should validate limitTime is within valid range (0-86400) | P1 | AC8 | ✅ Yes |
| 11.3-UNIT-008 | should format success message for immediate checkin | P1 | AC9 | ✅ Yes |
| 11.3-UNIT-009 | should format success message for scheduled checkin | P2 | AC9 | ✅ Yes |
| 11.3-UNIT-010 | should handle API errors gracefully | P0 | AC8 | ✅ Yes |

#### 1.2 listCheckins Method Tests

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.3-UNIT-011 | should list checkins with minimal parameters | P0 | AC2 | ✅ Yes |
| 11.3-UNIT-012 | should list checkins with pagination (page, size) | P1 | AC2 | ✅ Yes |
| 11.3-UNIT-013 | should list checkins filtered by date | P1 | AC2 | ✅ Yes |
| 11.3-UNIT-014 | should list checkins filtered by sessionId | P1 | AC2 | ✅ Yes |
| 11.3-UNIT-015 | should validate channelId is required | P0 | AC8 | ✅ Yes |
| 11.3-UNIT-016 | should output results in table format by default | P1 | AC5, AC9 | ✅ Yes |
| 11.3-UNIT-017 | should output results in JSON format when specified | P1 | AC5 | ✅ Yes |
| 11.3-UNIT-018 | should display empty message when no checkins found | P2 | AC8 | ✅ Yes |
| 11.3-UNIT-019 | should handle API errors gracefully | P0 | AC8 | ✅ Yes |

#### 1.3 getCheckinResult Method Tests

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.3-UNIT-020 | should get checkin result with checkinId | P0 | AC3 | ✅ Yes |
| 11.3-UNIT-021 | should display checked-in users (checked=Y) | P1 | AC3, AC9 | ✅ Yes |
| 11.3-UNIT-022 | should display not-checked-in users (checked=N) | P1 | AC3, AC9 | ✅ Yes |
| 11.3-UNIT-023 | should validate channelId is required | P0 | AC8 | ✅ Yes |
| 11.3-UNIT-024 | should validate checkinId is required | P0 | AC8 | ✅ Yes |
| 11.3-UNIT-025 | should output results in table format | P1 | AC5, AC9 | ✅ Yes |
| 11.3-UNIT-026 | should output results in JSON format | P1 | AC5 | ✅ Yes |
| 11.3-UNIT-027 | should handle API errors gracefully | P0 | AC8 | ✅ Yes |

#### 1.4 listSessions Method Tests

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.3-UNIT-028 | should list checkin sessions with date range | P0 | AC4 | ✅ Yes |
| 11.3-UNIT-029 | should validate channelId is required | P0 | AC8 | ✅ Yes |
| 11.3-UNIT-030 | should validate date range format (yyyy-MM-dd) | P1 | AC8 | ✅ Yes |
| 11.3-UNIT-031 | should validate date range is within 30 days | P1 | AC8 | ✅ Yes |
| 11.3-UNIT-032 | should output results in table format | P1 | AC5, AC9 | ✅ Yes |
| 11.3-UNIT-033 | should output results in JSON format | P1 | AC5 | ✅ Yes |
| 11.3-UNIT-034 | should handle API errors gracefully | P0 | AC8 | ✅ Yes |

---

### 2. CLI Command Tests

**Test File**: `packages/cli/src/commands/checkin.commands.test.ts`
**Test Level**: Unit (Command Registration)
**Priority**: P1

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.3-UNIT-035 | should register checkin start command | P1 | AC1 | ✅ Yes |
| 11.3-UNIT-036 | should register checkin list command | P1 | AC2 | ✅ Yes |
| 11.3-UNIT-037 | should register checkin result command | P1 | AC3 | ✅ Yes |
| 11.3-UNIT-038 | should register checkin sessions command | P1 | AC4 | ✅ Yes |
| 11.3-UNIT-039 | should parse --channel-id option correctly | P0 | AC1-4 | ✅ Yes |
| 11.3-UNIT-040 | should parse --output option (table/json) | P1 | AC5 | ✅ Yes |
| 11.3-UNIT-041 | should show help for checkin start command | P2 | - | ✅ Yes |
| 11.3-UNIT-042 | should show help for checkin list command | P2 | - | ✅ Yes |
| 11.3-UNIT-043 | should show help for checkin result command | P2 | - | ✅ Yes |
| 11.3-UNIT-044 | should show help for checkin sessions command | P2 | - | ✅ Yes |

---

### 3. CheckinServiceSdk Integration Tests

**Test File**: `packages/cli/src/services/checkin-service.test.ts`
**Test Level**: Integration (SDK Wrapper)
**Priority**: P0

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.3-INT-001 | should call v4Chat.batchCheckin with correct parameters | P0 | AC7 | ✅ Yes |
| 11.3-INT-002 | should call liveInteraction.getCheckinList with correct parameters | P0 | AC7 | ✅ Yes |
| 11.3-INT-003 | should call liveInteraction.getCheckinByCheckinId with correct parameters | P0 | AC7 | ✅ Yes |
| 11.3-INT-004 | should call liveInteraction.getCheckinByTime with correct parameters | P0 | AC7 | ✅ Yes |
| 11.3-INT-005 | should handle SDK errors and rethrow with friendly messages | P0 | AC8 | ✅ Yes |
| 11.3-INT-006 | should transform SDK response to CLI format | P1 | AC9 | ✅ Yes |

---

### 4. Output Formatting Tests

**Test Level**: Unit
**Priority**: P1

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.3-UNIT-045 | should format checkin list as table with correct columns | P1 | AC5, AC9 | ✅ Yes |
| 11.3-UNIT-046 | should format checkin result as table with checked status | P1 | AC5, AC9 | ✅ Yes |
| 11.3-UNIT-047 | should format sessions list as table with date/time | P1 | AC5, AC9 | ✅ Yes |
| 11.3-UNIT-048 | should format success message with checkin details | P1 | AC9 | ✅ Yes |
| 11.3-UNIT-049 | should format error messages with actionable guidance | P0 | AC8 | ✅ Yes |

---

### 5. Error Handling Tests

**Test Level**: Unit
**Priority**: P0

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.3-UNIT-050 | should validate missing channelId and throw PolyVValidationError | P0 | AC8 | ✅ Yes |
| 11.3-UNIT-051 | should validate missing checkinId and throw PolyVValidationError | P0 | AC8 | ✅ Yes |
| 11.3-UNIT-052 | should validate invalid date format and throw PolyVValidationError | P1 | AC8 | ✅ Yes |
| 11.3-UNIT-053 | should validate date range exceeds 30 days and throw error | P1 | AC8 | ✅ Yes |
| 11.3-UNIT-054 | should handle API 401 error (authentication failed) | P0 | AC8 | ✅ Yes |
| 11.3-UNIT-055 | should handle API 403 error (permission denied) | P0 | AC8 | ✅ Yes |
| 11.3-UNIT-056 | should handle API 404 error (resource not found) | P1 | AC8 | ✅ Yes |
| 11.3-UNIT-057 | should handle API 500 error (internal server error) | P1 | AC8 | ✅ Yes |
| 11.3-UNIT-058 | should handle network timeout errors | P1 | AC8 | ✅ Yes |

---

## Test Execution Strategy

### Red Phase (Current)

- **Goal**: All tests FAIL (no implementation exists)
- **Validation**: Run `pnpm --filter polyv-live-cli test:unit -- checkin` → expect all test failures
- **Criteria**: Tests are well-structured, use proper mocks, and fail for the right reasons

### Green Phase (Next)

- **Goal**: Implement features to make all tests PASS
- **Implementation Order**: P0 tests first, then P1, P2, P3
- **Coverage Target**: ≥80% for functions, lines, statements; ≥70% for branches

### Refactor Phase (Final)

- **Goal**: Improve code quality while keeping tests green
- **Validation**: Re-run tests after refactoring → all should still pass

---

## Test Coverage Requirements

### Target Coverage

- **Functions**: ≥80%
- **Lines**: ≥80%
- **Statements**: ≥80%
- **Branches**: ≥70%

### Coverage Command

```bash
nvm use 23 && pnpm --filter polyv-live-cli test:coverage -- --testPathPattern=checkin
```

---

## Test Quality Checklist

### Before Implementation (Red Phase)

- [ ] All test files created with proper structure
- [ ] All test scenarios use descriptive names (describe-it pattern)
- [ ] All tests follow Arrange-Act-Assert pattern
- [ ] Mocks are properly configured for SDK services
- [ ] Input validation tests cover all edge cases
- [ ] Error handling tests cover all HTTP status codes
- [ ] Output formatting tests validate table and JSON formats
- [ ] No hardcoded test data (use factory functions or dynamic values)
- [ ] All tests are isolated (no shared state)
- [ ] All tests are expected to FAIL before implementation

### During Implementation (Green Phase)

- [ ] Run tests frequently during implementation
- [ ] Fix one test at a time (incremental progress)
- [ ] Maintain test independence (no order dependencies)
- [ ] Keep tests under 300 lines each
- [ ] Keep test execution under 1.5 minutes
- [ ] Use explicit assertions (no hidden expects in helpers)
- [ ] Clean up resources in afterEach/afterAll hooks

---

## Dependencies

### Test Utilities

- Jest 29.7.0 (test framework)
- ts-jest 29.1.1 (TypeScript support)
- @types/jest 29.5.8 (type definitions)

### Mocking Strategy

- Mock `V4ChatService` methods
- Mock `LiveInteractionService` methods
- Mock `console.log` for output verification
- Mock `process.exit` for error handling tests

### Factory Functions

Create test data factories for:
- `createCheckinOptions()` - Start checkin parameters
- `createCheckinRecord()` - Checkin list response
- `createCheckinResult()` - Checkin detail response
- `createCheckinSession()` - Checkin session response

---

## API Mock Responses

### batchCheckin Response

```typescript
{
  code: 200,
  status: "success",
  data: {
    checkinId: "db14ef80-81b8-11eb-b114-e7477b"
  }
}
```

### getCheckinList Response

```typescript
{
  code: 200,
  status: "success",
  data: {
    contents: [
      {
        checkinid: "db14ef80-81b8-11eb-b114-e7477b",
        nickname: "User1",
        userid: "user123",
        time: 1616150400000,
        timeFormat: "2021-03-19 12:00:00"
      }
    ],
    count: 1
  }
}
```

### getCheckinByCheckinId Response

```typescript
{
  code: 200,
  status: "success",
  data: [
    {
      userid: "user123",
      nickname: "User1",
      checked: "Y",
      time: 1616150400000,
      timeFormat: "2021-03-19 12:00:00"
    },
    {
      userid: "user456",
      nickname: "User2",
      checked: "N",
      time: null,
      timeFormat: null
    }
  ]
}
```

### getCheckinByTime Response

```typescript
{
  code: 200,
  status: "success",
  data: [
    {
      checkinid: "db14ef80-81b8-11eb-b114-e7477b",
      time: 1616150400000,
      timeFormat: "2021-03-19 12:00:00"
    }
  ]
}
```

---

## Next Steps

### 1. Generate Test Files (step-04)

Create the following test files with failing tests:
- `packages/cli/src/handlers/checkin.handler.test.ts`
- `packages/cli/src/commands/checkin.commands.test.ts`
- `packages/cli/src/services/checkin-service.test.ts`

### 2. Verify Red Phase

Run tests and confirm all fail:
```bash
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- checkin
```

### 3. Proceed to Green Phase

Implement features in this order:
1. Types (`packages/cli/src/types/checkin.ts`)
2. SDK wrapper (`packages/cli/src/services/checkin-service.ts`)
3. Handler (`packages/cli/src/handlers/checkin.handler.ts`)
4. Commands (`packages/cli/src/commands/checkin.commands.ts`)

---

## Generation Mode Selection

**Selected Mode**: AI Generation
**Rationale**: Backend CLI project with clear API contracts and standard CRUD operations. No browser-based testing needed. Tests can be generated from API documentation and SDK interface definitions.

---

## Knowledge Base Fragments Loaded

### Core Fragments (Always Loaded)

- ✅ `test-levels-framework.md` - Test level selection for backend projects
- ✅ `test-priorities-matrix.md` - P0-P3 prioritization criteria
- ✅ `data-factories.md` - Factory functions for test data
- ✅ `test-quality.md` - Quality standards and DoD
- ✅ `test-healing-patterns.md` - Common failure patterns and fixes

### Backend-Specific Patterns

- ✅ Use Jest for unit and integration tests
- ✅ Mock SDK services to isolate handler logic
- ✅ Test input validation at unit level
- ✅ Test API integration at integration level
- ✅ No E2E browser tests needed for CLI

---

**Checklist Status**: ✅ Complete - Ready for Test Generation (step-04)
