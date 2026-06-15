---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests']
lastStep: 'step-04-generate-tests'
lastSaved: '2026-03-25T00:00:00Z'
inputDocuments:
  - _bmad-output/implementation-artifacts/12-4-whitelist-management.md
  - _bmad/tea/testarch/tea-index.csv
  - _bmad/tea/testarch/knowledge/test-levels-framework.md
  - _bmad/tea/testarch/knowledge/test-priorities-matrix.md
  - packages/cli/src/handlers/watch-condition.handler.test.ts
  - packages/cli/src/commands/watch-condition.commands.test.ts
  - packages/cli/package.json
---

# ATDD Checklist: Story 12-4 Whitelist Management

## Step 1: Preflight & Context Loading ✅

### Stack Detection
- **Detected Stack**: `backend`
- **Test Framework**: Jest 29.7.0
- **Package**: polyv-live-cli (TypeScript CLI)

### Prerequisites Verified
- ✅ Story approved with clear acceptance criteria (10 ACs)
- ✅ Test framework configured (Jest in package.json)
- ✅ Development environment available
- ✅ Existing test patterns identified (watch-condition handler/commands tests)

### Story Context Loaded
- **Story ID**: 12-4-whitelist-management
- **Status**: ready-for-dev
- **User Role**: 运营人员或 PaaS 客户开发者
- **Core Functionality**: Whitelist management commands (add, update, remove, list)

### Acceptance Criteria Summary
1. AC1: `whitelist list` - 获取白名单列表（分页+搜索）
2. AC2: `whitelist add` - 添加单个白名单项
3. AC3: `whitelist update` - 更新单个白名单项
4. AC4: `whitelist remove` - 删除白名单项（批量+清空）
5. AC5: 所有命令支持 `--output table|json`
6. AC6: 遵循 ATDD 开发模式
7. AC7: 复用 SDK Web Service 白名单方法
8. AC8: 友好的错误消息
9. AC9: 清晰的表格输出格式
10. AC10: 支持全局和频道级别设置

### Existing Patterns Identified
- **Handler Pattern**: `WatchConditionHandler` (packages/cli/src/handlers/watch-condition.handler.ts)
- **Commands Pattern**: `watch-condition.commands.ts` (packages/cli/src/commands/)
- **Service Pattern**: `WatchConditionServiceSdk` wrapper (packages/cli/src/services/)
- **Test Structure**: Jest with mock SDK, BaseHandler inheritance, Commander.js

### Knowledge Base Loaded
- Core fragments: test-levels-framework, test-priorities-matrix
- Test patterns: Unit testing with Jest, mock strategies, Arrange-Act-Assert

---

---

## Step 2: Generation Mode Selection ✅

### Mode Chosen: AI Generation

**Justification:**
- ✅ This is a **backend** project (CLI tool)
- ✅ Acceptance criteria are clear and well-defined
- ✅ Scenarios are standard CRUD operations (list, add, update, remove)
- ✅ API documentation available in story file
- ✅ Existing test patterns available to reference

**No browser recording needed** - backend tests use Jest with mocked SDK responses.

---

---

## Step 3: Test Strategy ✅

### Test Levels (Backend Stack)
- **Unit Tests** - Handler business logic, input validation, output formatting
- **Integration Tests** - Service wrapper interactions with SDK
- **No E2E** - Not applicable for backend CLI

### Test Priorities Assigned

#### P0 - Critical (Must Test)
| Test ID | AC | Scenario | Level | Priority | Rationale |
|---------|----|----------|--------|----------|-----------|
| 12.4-UNIT-001 | AC6 | Constructor creates service wrapper correctly | Unit | P0 | Foundation for all tests |
| 12.4-UNIT-002 | AC1 | listWhitelist with channelId (channel-specific) | Unit | P0 | Core list functionality |
| 12.4-UNIT-003 | AC1 | listWhitelist without channelId (global) | Unit | P0 | Core list functionality |
| 12.4-UNIT-004 | AC2 | addWhitelist with required params | Unit | P0 | Core add functionality |
| 12.4-UNIT-005 | AC3 | updateWhitelist with oldCode and new code | Unit | P0 | Core update functionality |
| 12.4-UNIT-006 | AC4 | removeWhitelist with single code | Unit | P0 | Core delete functionality |
| 12.4-UNIT-007 | AC4 | removeWhitelist with --clear flag | Unit | P0 | Critical clear-all functionality |

#### P1 - High (Should Test)
| Test ID | AC | Scenario | Level | Priority | Rationale |
|---------|----|----------|--------|----------|-----------|
| 12.4-UNIT-008 | AC5 | Table output format for list command | Unit | P1 | Output formatting |
| 12.4-UNIT-009 | AC5 | JSON output format for all commands | Unit | P1 | Output formatting |
| 12.4-UNIT-010 | AC1 | listWhitelist with pagination (page, pageSize) | Unit | P1 | Pagination support |
| 12.4-UNIT-011 | AC1 | listWhitelist with keyword search | Unit | P1 | Search functionality |
| 12.4-UNIT-012 | AC4 | removeWhitelist with batch codes (comma-separated) | Unit | P1 | Batch delete |
| 12.4-CMD-001 | AC1-4 | CLI command registration validation | Unit | P1 | Command structure |

#### P2 - Medium (Nice to Test)
| Test ID | AC | Scenario | Level | Priority | Rationale |
|---------|----|----------|--------|----------|-----------|
| 12.4-UNIT-013 | AC8 | Error: rank not 1 or 2 | Unit | P2 | Validation error |
| 12.4-UNIT-014 | AC8 | Error: code is empty | Unit | P2 | Validation error |
| 12.4-UNIT-015 | AC8 | Error: oldCode is empty (update) | Unit | P2 | Validation error |
| 12.4-UNIT-016 | AC8 | Error: codes is empty without --clear | Unit | P2 | Validation error |
| 12.4-UNIT-017 | AC8 | Error: code/name exceeds 50 chars | Unit | P2 | Validation error |
| 12.4-UNIT-018 | AC8 | API error handling (SDK throws) | Unit | P2 | Error handling |

### Test Files to Generate

1. **packages/cli/src/handlers/whitelist.handler.test.ts** (Unit)
   - Tests for WhitelistHandler class
   - Mocked WhitelistServiceSdk
   - Coverage target: 80%+

2. **packages/cli/src/commands/whitelist.commands.test.ts** (Unit)
   - Tests for CLI command registration
   - Commander.js validation
   - Coverage target: 80%+

3. **packages/cli/src/services/whitelist-service.test.ts** (Unit)
   - Tests for WhitelistServiceSdk wrapper
   - SDK integration validation
   - Coverage target: 80%+

### Red Phase Requirements ✅
- All tests MUST fail initially (classes don't exist yet)
- Tests define expected interfaces and behavior
- Implementation will make tests pass (GREEN phase)

---

---

## Step 4: Generate Failing Tests (RED PHASE) ✅

### Test Files Generated

#### 1. Handler Tests
**File**: `packages/cli/src/handlers/whitelist.handler.test.ts`
- **Total Tests**: 25 test cases
- **Coverage**:
  - Constructor validation (1 test)
  - AC#1: listWhitelist - list with pagination, search, table/JSON output (8 tests)
  - AC#2: addWhitelist - add with validation (5 tests)
  - AC#3: updateWhitelist - update with oldCode (2 tests)
  - AC#4: removeWhitelist - remove single, batch, clear-all (4 tests)
  - AC#8: Error handling (5 tests)

#### 2. Commands Tests
**File**: `packages/cli/src/commands/whitelist.commands.test.ts`
- **Total Tests**: 28 test cases
- **Coverage**:
  - Main command registration (1 test)
  - AC#1: list subcommand - options validation (7 tests)
  - AC#2: add subcommand - options validation (6 tests)
  - AC#3: update subcommand - options validation (7 tests)
  - AC#4: remove subcommand - options validation (6 tests)

#### 3. Service Tests
**File**: `packages/cli/src/services/whitelist-service.test.ts`
- **Total Tests**: 9 test cases
- **Coverage**:
  - Constructor validation (1 test)
  - SDK integration methods (7 tests)
  - Error propagation (1 test)

#### 4. Type Definitions
**File**: `packages/cli/src/types/whitelist.ts`
- Defined all required interfaces:
  - WhitelistServiceConfig
  - WhitelistListOptions
  - WhitelistAddOptions
  - WhitelistUpdateOptions
  - WhitelistRemoveOptions

### TDD RED Phase Status
🔴 **All tests are designed to FAIL until implementation is complete**

- ✅ Tests use `@ts-expect-error` for non-existent modules
- ✅ Tests define expected interfaces and behavior
- ✅ Tests cover all 10 acceptance criteria
- ✅ Tests include validation and error scenarios
- ✅ Tests follow existing project patterns (watch-condition)

### Test Statistics
- **Total Test Files**: 3
- **Total Test Cases**: 62
- **Estimated Coverage**: Will achieve 80%+ when implementation complete

---

## ATDD Workflow Complete ✅

### Summary

**Status**: ✅ RED PHASE COMPLETE - Tests generated and will fail

**Deliverables**:
1. ✅ ATDD Checklist created
2. ✅ Test strategy defined (P0-P2 priorities)
3. ✅ Failing test files generated (handler, commands, service)
4. ✅ Type definitions created
5. ✅ All acceptance criteria covered by tests

**Next Steps for Implementation**:
1. Create `packages/cli/src/handlers/whitelist.handler.ts` (implement WhitelistHandler)
2. Create `packages/cli/src/services/whitelist-service.ts` (implement WhitelistServiceSdk)
3. Create `packages/cli/src/commands/whitelist.commands.ts` (register CLI commands)
4. Run tests: `pnpm --filter polyv-live-cli test:unit -- whitelist`
5. Make tests pass (GREEN phase)
6. Update skill documentation (AC#6)

**ATDD Principle Maintained**:
- ❌ Implementation does NOT exist yet
- ✅ Tests define expected interfaces
- ✅ Tests will FAIL until implementation complete
- ✅ No test modifications allowed during GREEN phase
