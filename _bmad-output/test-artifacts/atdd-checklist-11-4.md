---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
lastStep: step-03-test-strategy
lastSaved: '2026-03-24'
inputDocuments:
  - _bmad-output/implementation-artifacts/11-4-qa-questionnaire-management.md
  - _bmad/tea/testarch/knowledge/test-levels-framework.md
  - _bmad/tea/testarch/knowledge/test-priorities-matrix.md
  - _bmad/tea/testarch/knowledge/data-factories.md
  - _bmad/tea/testarch/knowledge/test-quality.md
  - _bmad/tea/testarch/knowledge/test-healing-patterns.md
  - CLAUDE.md
  - CLAUDE.local.md
  - MEMORY.md
storyId: '11-4'
stackType: backend
testFramework: jest
generationMode: ai-generation
---

# ATDD Test Checklist - Story 11-4: QA Questionnaire Management Commands

## Story Overview

**Story ID**: 11-4
**Title**: QA Questionnaire Management Commands
**Status**: ready-for-dev
**Stack Type**: Backend (Node.js CLI)
**Test Framework**: Jest 29.7.0

### Acceptance Criteria

1. **AC1**: `qa send` 命令支持发送答题卡(支持设置答题卡ID、答题限时)
2. **AC2**: `qa list` 命令支持查询频道答题卡列表
3. **AC3**: `qa stop` 命令支持停止答题卡(返回答题统计结果)
4. **AC4**: `questionnaire create` 命令支持创建问卷(V4 API)
5. **AC5**: `questionnaire list` 命令支持分页查询频道问卷结果
6. **AC6**: `questionnaire detail` 命令支持查询问卷详情(题目与结果)
7. **AC7**: 所有命令支持 `--output table|json` 输出格式
8. **AC8**: 遵循 ATDD 开发模式,先编写测试,再实现功能
9. **AC9**: 复用已有的 SDK `LiveInteractionService` 和 `V4ChatService` 服务
10. **AC10**: 错误消息友好,清晰提示参数验证失败或 API 调用失败的情况
11. **AC11**: 表格输出格式清晰,显示答题卡ID、类型、状态、问卷ID、标题等信息

## Test Strategy

### Test Levels (Backend Project)

- **Unit Tests**: Handler methods, input validation, output formatting
- **Integration Tests**: Handler → SDK wrapper → SDK service interaction
- **No E2E Tests**: CLI commands are tested via unit/integration tests

### Priority Classification

- **P0**: Critical paths (send qa, list qa, stop qa, error handling)
- **P1**: Core features (questionnaire create/list/detail, output formats)
- **P2**: Secondary features (optional parameters, edge cases)
- **P3**: Nice-to-have (detailed error messages, logging)

---

## Test Scenarios

### 1. QaQuestionnaireHandler Unit Tests

**Test File**: `packages/cli/src/handlers/qa-questionnaire.handler.test.ts`
**Test Level**: Unit
**Priority**: P0

#### 1.1 sendQa Method Tests

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.4-UNIT-001 | should send qa with minimal parameters | P0 | AC1 | Yes (no implementation) |
| 11.4-UNIT-002 | should send qa with duration parameter | P1 | AC1 | Yes |
| 11.4-UNIT-003 | should validate channelId is required | P0 | AC10 | Yes |
| 11.4-UNIT-004 | should validate questionId is required | P0 | AC10 | Yes |
| 11.4-UNIT-005 | should validate duration is within valid range (1-99) | P1 | AC10 | Yes |
| 11.4-UNIT-006 | should format success message | P1 | AC11 | Yes |
| 11.4-UNIT-007 | should handle API errors gracefully | P0 | AC10 | Yes |

#### 1.2 listQa Method Tests

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.4-UNIT-008 | should list qa with minimal parameters | P0 | AC2 | Yes |
| 11.4-UNIT-009 | should validate channelId is required | P0 | AC10 | Yes |
| 11.4-UNIT-010 | should output results in table format by default | P1 | AC7, AC11 | Yes |
| 11.4-UNIT-011 | should output results in JSON format when specified | P1 | AC7 | Yes |
| 11.4-UNIT-012 | should display empty message when no qa found | P2 | AC10 | Yes |
| 11.4-UNIT-013 | should handle API errors gracefully | P0 | AC10 | Yes |

#### 1.3 stopQa Method Tests

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.4-UNIT-014 | should stop qa with questionId | P0 | AC3 | Yes |
| 11.4-UNIT-015 | should display qa statistics result | P1 | AC3, AC11 | Yes |
| 11.4-UNIT-016 | should validate channelId is required | P0 | AC10 | Yes |
| 11.4-UNIT-017 | should validate questionId is required | P0 | AC10 | Yes |
| 11.4-UNIT-018 | should output results in table format | P1 | AC7, AC11 | Yes |
| 11.4-UNIT-019 | should output results in JSON format | P1 | AC7 | Yes |
| 11.4-UNIT-020 | should handle API errors gracefully | P0 | AC10 | Yes |

#### 1.4 createQuestionnaire Method Tests

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.4-UNIT-021 | should create questionnaire with title and questions | P0 | AC4 | Yes |
| 11.4-UNIT-022 | should validate channelId is required | P0 | AC10 | Yes |
| 11.4-UNIT-023 | should validate title is required | P0 | AC10 | Yes |
| 11.4-UNIT-024 | should validate questions is required | P0 | AC10 | Yes |
| 11.4-UNIT-025 | should parse questions JSON correctly | P1 | AC4 | Yes |
| 11.4-UNIT-026 | should output success message with questionnaireId | P1 | AC11 | Yes |
| 11.4-UNIT-027 | should handle invalid questions JSON | P1 | AC10 | Yes |
| 11.4-UNIT-028 | should handle API errors gracefully | P0 | AC10 | Yes |

#### 1.5 listQuestionnaires Method Tests

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.4-UNIT-029 | should list questionnaires with minimal parameters | P0 | AC5 | Yes |
| 11.4-UNIT-030 | should list questionnaires with pagination (page, size) | P1 | AC5 | Yes |
| 11.4-UNIT-031 | should list questionnaires filtered by sessionId | P1 | AC5 | Yes |
| 11.4-UNIT-032 | should list questionnaires filtered by date range | P1 | AC5 | Yes |
| 11.4-UNIT-033 | should validate channelId is required | P0 | AC10 | Yes |
| 11.4-UNIT-034 | should output results in table format by default | P1 | AC7, AC11 | Yes |
| 11.4-UNIT-035 | should output results in JSON format when specified | P1 | AC7 | Yes |
| 11.4-UNIT-036 | should display empty message when no questionnaires found | P2 | AC10 | Yes |
| 11.4-UNIT-037 | should handle API errors gracefully | P0 | AC10 | Yes |

#### 1.6 getQuestionnaireDetail Method Tests

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.4-UNIT-038 | should get questionnaire detail with questionnaireId | P0 | AC6 | Yes |
| 11.4-UNIT-039 | should display questionnaire questions list | P1 | AC6, AC11 | Yes |
| 11.4-UNIT-040 | should validate channelId is required | P0 | AC10 | Yes |
| 11.4-UNIT-041 | should validate questionnaireId is required | P0 | AC10 | Yes |
| 11.4-UNIT-042 | should output results in table format | P1 | AC7, AC11 | Yes |
| 11.4-UNIT-043 | should output results in JSON format | P1 | AC7 | Yes |
| 11.4-UNIT-044 | should handle API errors gracefully | P0 | AC10 | Yes |

---

### 2. QA CLI Command Tests

**Test File**: `packages/cli/src/commands/qa.commands.test.ts`
**Test Level**: Unit (Command Registration)
**Priority**: P1

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.4-UNIT-045 | should register qa send command | P1 | AC1 | Yes |
| 11.4-UNIT-046 | should register qa list command | P1 | AC2 | Yes |
| 11.4-UNIT-047 | should register qa stop command | P1 | AC3 | Yes |
| 11.4-UNIT-048 | should parse --channel-id option correctly | P0 | AC1-3 | Yes |
| 11.4-UNIT-049 | should parse --question-id option correctly | P0 | AC1, AC3 | Yes |
| 11.4-UNIT-050 | should parse --duration option correctly | P1 | AC1 | Yes |
| 11.4-UNIT-051 | should parse --output option (table/json) | P1 | AC7 | Yes |
| 11.4-UNIT-052 | should show help for qa send command | P2 | - | Yes |
| 11.4-UNIT-053 | should show help for qa list command | P2 | - | Yes |
| 11.4-UNIT-054 | should show help for qa stop command | P2 | - | Yes |

---

### 3. Questionnaire CLI Command Tests

**Test File**: `packages/cli/src/commands/questionnaire.commands.test.ts`
**Test Level**: Unit (Command Registration)
**Priority**: P1

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.4-UNIT-055 | should register questionnaire create command | P1 | AC4 | Yes |
| 11.4-UNIT-056 | should register questionnaire list command | P1 | AC5 | Yes |
| 11.4-UNIT-057 | should register questionnaire detail command | P1 | AC6 | Yes |
| 11.4-UNIT-058 | should parse --channel-id option correctly | P0 | AC4-6 | Yes |
| 11.4-UNIT-059 | should parse --title option correctly | P0 | AC4 | Yes |
| 11.4-UNIT-060 | should parse --questions option correctly | P0 | AC4 | Yes |
| 11.4-UNIT-061 | should parse --questionnaire-id option correctly | P0 | AC6 | Yes |
| 11.4-UNIT-062 | should parse pagination options (page, size) | P1 | AC5 | Yes |
| 11.4-UNIT-063 | should parse date range options | P1 | AC5 | Yes |
| 11.4-UNIT-064 | should parse --output option (table/json) | P1 | AC7 | Yes |
| 11.4-UNIT-065 | should show help for questionnaire create command | P2 | - | Yes |
| 11.4-UNIT-066 | should show help for questionnaire list command | P2 | - | Yes |
| 11.4-UNIT-067 | should show help for questionnaire detail command | P2 | - | Yes |

---

### 4. QaQuestionnaireServiceSdk Integration Tests

**Test File**: `packages/cli/src/services/qa-questionnaire-service.test.ts`
**Test Level**: Integration (SDK Wrapper)
**Priority**: P0

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.4-INT-001 | should call liveInteraction.sendQuestion with correct parameters | P0 | AC9 | Yes |
| 11.4-INT-002 | should call liveInteraction.listQuestion with correct parameters | P0 | AC9 | Yes |
| 11.4-INT-003 | should call liveInteraction.stopQuestion with correct parameters | P0 | AC9 | Yes |
| 11.4-INT-004 | should call liveInteraction.addEditQuestionnaire with correct parameters | P0 | AC9 | Yes |
| 11.4-INT-005 | should call liveInteraction.listQuestionnaireByPage with correct parameters | P0 | AC9 | Yes |
| 11.4-INT-006 | should call liveInteraction.getQuestionnaireDetail with correct parameters | P0 | AC9 | Yes |
| 11.4-INT-007 | should handle SDK errors and rethrow with friendly messages | P0 | AC10 | Yes |
| 11.4-INT-008 | should transform SDK response to CLI format | P1 | AC11 | Yes |

---

### 5. Output Formatting Tests

**Test Level**: Unit
**Priority**: P1

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.4-UNIT-068 | should format qa list as table with correct columns | P1 | AC7, AC11 | Yes |
| 11.4-UNIT-069 | should format qa stop result as table with statistics | P1 | AC7, AC11 | Yes |
| 11.4-UNIT-070 | should format questionnaire list as table with correct columns | P1 | AC7, AC11 | Yes |
| 11.4-UNIT-071 | should format questionnaire detail as table with questions | P1 | AC7, AC11 | Yes |
| 11.4-UNIT-072 | should format success message with details | P1 | AC11 | Yes |
| 11.4-UNIT-073 | should format error messages with actionable guidance | P0 | AC10 | Yes |

---

### 6. Error Handling Tests

**Test Level**: Unit
**Priority**: P0

| Test ID | Test Scenario | Priority | AC Coverage | Expected to Fail |
|---------|---------------|----------|-------------|------------------|
| 11.4-UNIT-074 | should validate missing channelId and throw PolyVValidationError | P0 | AC10 | Yes |
| 11.4-UNIT-075 | should validate missing questionId and throw PolyVValidationError | P0 | AC10 | Yes |
| 11.4-UNIT-076 | should validate missing questionnaireId and throw PolyVValidationError | P0 | AC10 | Yes |
| 11.4-UNIT-077 | should validate invalid questions JSON format | P1 | AC10 | Yes |
| 11.4-UNIT-078 | should handle API 401 error (authentication failed) | P0 | AC10 | Yes |
| 11.4-UNIT-079 | should handle API 403 error (permission denied) | P0 | AC10 | Yes |
| 11.4-UNIT-080 | should handle API 404 error (resource not found) | P1 | AC10 | Yes |
| 11.4-UNIT-081 | should handle API 500 error (internal server error) | P1 | AC10 | Yes |
| 11.4-UNIT-082 | should handle network timeout errors | P1 | AC10 | Yes |

---

## Test Execution Strategy

### Red Phase (Current)

- **Goal**: All tests FAIL (no implementation exists)
- **Validation**: Run `pnpm --filter polyv-live-cli test:unit -- qa` → expect all test failures
- **Criteria**: Tests are well-structured, use proper mocks, and fail for the right reasons

### Green Phase (Next)

- **Goal**: Implement features to make all tests PASS
- **Implementation Order**: P0 tests first, then P1, P2, P3
- **Coverage Target**: >=80% for functions, lines, statements; >=70% for branches

### Refactor Phase (Final)

- **Goal**: Improve code quality while keeping tests green
- **Validation**: Re-run tests after refactoring -> all should still pass

---

## Test Coverage Requirements

### Target Coverage

- **Functions**: >=80%
- **Lines**: >=80%
- **Statements**: >=80%
- **Branches**: >=70%

### Coverage Command

```bash
nvm use 23 && pnpm --filter polyv-live-cli test:coverage -- --testPathPattern="qa|questionnaire"
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

- Mock `LiveInteractionService` methods
- Mock `V4ChatService` methods (if used)
- Mock `console.log` for output verification
- Mock `process.exit` for error handling tests

### Factory Functions

Create test data factories for:
- `createQaSendOptions()` - Send QA parameters
- `createQaListResponse()` - QA list response
- `createQaStopResult()` - QA stop result response
- `createQuestionnaireCreateOptions()` - Create questionnaire parameters
- `createQuestionnaireListResponse()` - Questionnaire list response
- `createQuestionnaireDetailResponse()` - Questionnaire detail response

---

## API Mock Responses

### sendQuestion Response

```typescript
{
  code: 200,
  status: "success",
  data: {}
}
```

### listQuestion Response

```typescript
{
  code: 200,
  status: "success",
  data: {
    contents: [
      {
        questionId: "gv0uf9s5v7",
        name: "What is 1+1?",
        type: "R",
        status: "send",
        times: 5
      }
    ]
  }
}
```

### stopQuestion Response

```typescript
{
  code: 200,
  status: "success",
  data: {
    answer: "A",
    total: 100,
    rightUserCount: 80,
    faultUserCount: 20,
    singleResult: [50, 30, 15, 5]
  }
}
```

### addEditQuestionnaire Response

```typescript
{
  code: 200,
  status: "success",
  data: {
    questionnaireId: "fs9v59nq4u"
  }
}
```

### listQuestionnaireByPage Response

```typescript
{
  code: 200,
  status: "success",
  data: {
    contents: [
      {
        questionnaireId: "fs9v59nq4u",
        questionnaireTitle: "Survey Title",
        lastModified: 1704067200000,
        users: []
      }
    ],
    totalItems: 1
  }
}
```

### getQuestionnaireDetail Response

```typescript
{
  code: 200,
  status: "success",
  data: {
    questionnaireId: "fs9v59nq4u",
    name: "Survey Title",
    status: "published",
    questions: [
      {
        questionId: "q1",
        name: "What is your gender?",
        type: "R",
        required: "Y",
        scoreEnabled: "N"
      }
    ]
  }
}
```

---

## Next Steps

### 1. Generate Test Files (step-04)

Create the following test files with failing tests:
- `packages/cli/src/handlers/qa-questionnaire.handler.test.ts`
- `packages/cli/src/commands/qa.commands.test.ts`
- `packages/cli/src/commands/questionnaire.commands.test.ts`
- `packages/cli/src/services/qa-questionnaire-service.test.ts`

### 2. Verify Red Phase

Run tests and confirm all fail:
```bash
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- "qa|questionnaire"
```

### 3. Proceed to Green Phase

Implement features in this order:
1. Types (`packages/cli/src/types/qa.ts`)
2. SDK wrapper (`packages/cli/src/services/qa-questionnaire-service.ts`)
3. Handler (`packages/cli/src/handlers/qa-questionnaire.handler.ts`)
4. Commands (`packages/cli/src/commands/qa.commands.ts`, `packages/cli/src/commands/questionnaire.commands.ts`)

---

## Generation Mode Selection

**Selected Mode**: AI Generation
**Rationale**: Backend CLI project with clear API contracts and standard CRUD operations. No browser-based testing needed. Tests can be generated from API documentation and SDK interface definitions.

---

## Knowledge Base Fragments Loaded

### Core Fragments (Always Loaded)

- `test-levels-framework.md` - Test level selection for backend projects
- `test-priorities-matrix.md` - P0-P3 prioritization criteria
- `data-factories.md` - Factory functions for test data
- `test-quality.md` - Quality standards and DoD
- `test-healing-patterns.md` - Common failure patterns and fixes

### Backend-Specific Patterns

- Use Jest for unit and integration tests
- Mock SDK services to isolate handler logic
- Test input validation at unit level
- Test API integration at integration level
- No E2E browser tests needed for CLI

---

**Checklist Status**: Complete - Ready for Test Generation (step-04)
