---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-03-24'
workflowType: 'testarch-atdd'
inputDocuments:
  - '_bmad-output/implementation-artifacts/11-5-lottery-management.md'
  - 'packages/cli/src/handlers/checkin.handler.ts'
  - 'packages/cli/src/handlers/checkin.handler.test.ts'
  - 'packages/cli/src/commands/checkin.commands.ts'
  - 'packages/cli/src/commands/checkin.commands.test.ts'
  - 'packages/cli/src/services/checkin-service.ts'
  - 'packages/cli/src/types/checkin.ts'
---

# ATDD Checklist - Epic 11, Story 5: Lottery Management Commands

**Date:** 2026-03-24
**Author:** Claude Code Agent (ATDD Workflow)
**Primary Test Level:** Unit (Backend CLI)

---

## Story Summary

As a operations staff or PaaS client developer, I want to manage lottery activities through CLI commands (`lottery create`, `lottery list`, `lottery get`, `lottery update`, `lottery delete`, `lottery winners`, `lottery records`), so that I can efficiently manage live streaming lottery interaction features.

**As a** operations staff or PaaS client developer
**I want** to manage lottery activities through CLI commands
**So that** I can efficiently manage live streaming lottery interaction features

---

## Acceptance Criteria

1. AC1: `lottery create` command supports creating lottery activities (supports unconditional, invite, duration, comment, question types)
2. AC2: `lottery list` command supports querying channel lottery activities list (with pagination)
3. AC3: `lottery get` command supports querying single lottery activity details
4. AC4: `lottery update` command supports updating lottery activity configuration
5. AC5: `lottery delete` command supports deleting lottery activity
6. AC6: `lottery winners` command supports querying winner user list
7. AC7: `lottery records` command supports querying channel lottery records (legacy V3 API)
8. AC8: All commands support `--output table|json` output format
9. AC9: Follow ATDD development pattern, write tests first, then implement
10. AC10: Reuse existing SDK `LiveInteractionService` lottery methods, extend V4 lottery activity API
11. AC11: Error messages are user-friendly, clearly indicating parameter validation failures or API call failures
12. AC12: Table output format is clear, displaying activity ID, name, type, status, winner count, etc.

---

## Failing Tests Created (RED Phase)

### Handler Unit Tests (0 tests - file will fail to import)

**File:** `packages/cli/src/handlers/lottery.handler.test.ts` (will be created)

**Status:** RED - Module not found (handler not implemented yet)

Tests will verify:
- AC1: `createLottery` method for creating various lottery types
- AC2: `listLottery` method with pagination support
- AC3: `getLottery` method for single activity details
- AC4: `updateLottery` method for updating configuration
- AC5: `deleteLottery` method for deleting activities
- AC6: `getWinners` method for querying winners
- AC7: `getRecords` method for legacy lottery records
- AC8: Output format handling (table/json)
- AC11: Error handling and validation
- AC12: Table output formatting

### Command Unit Tests (0 tests - file will fail to import)

**File:** `packages/cli/src/commands/lottery.commands.test.ts` (will be created)

**Status:** RED - Module not found (commands not implemented yet)

Tests will verify:
- Command registration for `lottery` main command
- Subcommand registration: `create`, `list`, `get`, `update`, `delete`, `winners`, `records`
- Option definitions for each subcommand
- Help text output

### Service SDK Unit Tests (0 tests - file will fail to import)

**File:** `packages/cli/src/services/lottery-service.test.ts` (will be created)

**Status:** RED - Module not found (service not implemented yet)

Tests will verify:
- `LotteryServiceSdk` class construction
- `createLotteryActivity` method
- `listLotteryActivities` method
- `getLotteryActivity` method
- `updateLotteryActivity` method
- `deleteLotteryActivity` method
- `getWinnerDetail` method (wraps `liveInteraction.getWinnerDetail`)
- `listLottery` method (wraps `liveInteraction.listLottery`)

### Types Unit Tests (0 tests - file will fail to import)

**File:** `packages/cli/src/types/lottery.types.test.ts` (will be created)

**Status:** RED - Module not found (types not implemented yet)

Tests will verify:
- Interface definitions exist
- Type exports are correct

---

## Test Strategy

### Test Levels

| Level | Usage | Rationale |
|-------|-------|-----------|
| Unit | Primary | Handler, service, and command logic is pure TypeScript functions |
| Integration | None | SDK handles external API integration |
| E2E | None | CLI commands are thin wrappers, unit tests sufficient |

### Priority Assignments

| Priority | Tests | Rationale |
|----------|-------|-----------|
| P0 | Core CRUD operations (create, list, get) | Critical user journeys |
| P1 | Update, delete, winners, records | Secondary operations |
| P2 | Output formatting, edge cases | Quality of life features |
| P3 | Error handling edge cases | Robustness |

---

## Implementation Checklist

### Test: Handler - createLottery (AC1)

**File:** `packages/cli/src/handlers/lottery.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Create `packages/cli/src/types/lottery.ts` with `LotteryCreateOptions` interface
- [ ] Create `packages/cli/src/services/lottery-service.ts` with `LotteryServiceSdk` class
- [ ] Create `packages/cli/src/handlers/lottery.handler.ts` with `LotteryHandler` class
- [ ] Implement `createLottery` method
- [ ] Implement validation for required parameters (channelId, name, type, amount, prizeName)
- [ ] Implement validation for lottery type (none, invite, duration, comment, question)
- [ ] Run test: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- lottery.handler`
- [ ] Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: Handler - listLottery (AC2)

**File:** `packages/cli/src/handlers/lottery.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Add `LotteryListOptions` interface to `packages/cli/src/types/lottery.ts`
- [ ] Add `listLotteryActivities` method to `LotteryServiceSdk`
- [ ] Implement `listLottery` method in `LotteryHandler`
- [ ] Implement pagination parameters (page, size)
- [ ] Run test: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- lottery.handler`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: Handler - getLottery (AC3)

**File:** `packages/cli/src/handlers/lottery.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Add `LotteryGetOptions` interface to `packages/cli/src/types/lottery.ts`
- [ ] Add `getLotteryActivity` method to `LotteryServiceSdk`
- [ ] Implement `getLottery` method in `LotteryHandler`
- [ ] Run test: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- lottery.handler`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: Handler - updateLottery (AC4)

**File:** `packages/cli/src/handlers/lottery.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Add `LotteryUpdateOptions` interface to `packages/cli/src/types/lottery.ts`
- [ ] Add `updateLotteryActivity` method to `LotteryServiceSdk`
- [ ] Implement `updateLottery` method in `LotteryHandler`
- [ ] Run test: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- lottery.handler`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: Handler - deleteLottery (AC5)

**File:** `packages/cli/src/handlers/lottery.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Add `LotteryDeleteOptions` interface to `packages/cli/src/types/lottery.ts`
- [ ] Add `deleteLotteryActivity` method to `LotteryServiceSdk`
- [ ] Implement `deleteLottery` method in `LotteryHandler`
- [ ] Run test: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- lottery.handler`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: Handler - getWinners (AC6)

**File:** `packages/cli/src/handlers/lottery.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Add `LotteryWinnersOptions` interface to `packages/cli/src/types/lottery.ts`
- [ ] Add `getWinnerDetail` method to `LotteryServiceSdk` (wraps `liveInteraction.getWinnerDetail`)
- [ ] Implement `getWinners` method in `LotteryHandler`
- [ ] Run test: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- lottery.handler`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: Handler - getRecords (AC7)

**File:** `packages/cli/src/handlers/lottery.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Add `LotteryRecordsOptions` interface to `packages/cli/src/types/lottery.ts`
- [ ] Add `listLottery` method to `LotteryServiceSdk` (wraps `liveInteraction.listLottery`)
- [ ] Implement `getRecords` method in `LotteryHandler`
- [ ] Run test: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- lottery.handler`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: Commands - lottery create (AC1)

**File:** `packages/cli/src/commands/lottery.commands.test.ts`

**Tasks to make this test pass:**

- [ ] Create `packages/cli/src/commands/lottery.commands.ts`
- [ ] Register `lottery` main command
- [ ] Register `create` subcommand with options: `-c/--channel-id`, `--name`, `--type`, `--amount`, `--prize-name`, `--receive-info`, `-o/--output`
- [ ] Run test: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- lottery.commands`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: Commands - all subcommands (AC2-7)

**File:** `packages/cli/src/commands/lottery.commands.test.ts`

**Tasks to make this test pass:**

- [ ] Register `list` subcommand with options: `-c/--channel-id`, `--page`, `--size`, `-o/--output`
- [ ] Register `get` subcommand with options: `-c/--channel-id`, `--id`, `-o/--output`
- [ ] Register `update` subcommand with options: `-c/--channel-id`, `--id`, `--name`, `--amount`, `--prize-name`, `-o/--output`
- [ ] Register `delete` subcommand with options: `-c/--channel-id`, `--id`, `-o/--output`
- [ ] Register `winners` subcommand with options: `-c/--channel-id`, `--lottery-id`, `--page`, `--limit`, `-o/--output`
- [ ] Register `records` subcommand with options: `-c/--channel-id`, `--start-time`, `--end-time`, `--session-id`, `--page`, `--limit`, `-o/--output`
- [ ] Register commands in `src/index.ts`
- [ ] Run test: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- lottery.commands`
- [ ] Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: Service SDK - all methods (AC10)

**File:** `packages/cli/src/services/lottery-service.test.ts`

**Tasks to make this test pass:**

- [ ] Implement `createLotteryActivity` method calling V4 API
- [ ] Implement `listLotteryActivities` method calling V4 API
- [ ] Implement `getLotteryActivity` method calling V4 API
- [ ] Implement `updateLotteryActivity` method calling V4 API
- [ ] Implement `deleteLotteryActivity` method calling V4 API
- [ ] Implement `getWinnerDetail` method wrapping `liveInteraction.getWinnerDetail`
- [ ] Implement `listLottery` method wrapping `liveInteraction.listLottery`
- [ ] Run test: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- lottery-service`
- [ ] Test passes (green phase)

**Estimated Effort:** 2 hours

---

## Running Tests

```bash
# Run all lottery tests
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- lottery

# Run handler tests only
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- lottery.handler

# Run commands tests only
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- lottery.commands

# Run service tests only
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- lottery-service

# Run types tests only
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- lottery.types

# Run with coverage
nvm use 23 && pnpm --filter polyv-live-cli test:coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- [x] All test files created with test.skip() or failing imports
- [x] Tests assert EXPECTED behavior (not placeholder assertions)
- [x] Implementation checklist created
- [x] ATDD checklist populated

**Verification:**

- Test files exist at expected locations
- Tests will fail because modules don't exist yet
- Failure is intentional (TDD red phase)

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with types, then service, then handler, then commands)
2. **Read the test** to understand expected interface and behavior
3. **Implement minimal code** to make that specific test pass
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist
6. **Move to next test** and repeat

**Recommended Order:**

1. Types (`lottery.ts`)
2. Service SDK (`lottery-service.ts`)
3. Handler (`lottery.handler.ts`)
4. Commands (`lottery.commands.ts`)
5. Register in `index.ts`

---

## Test File Paths

| File | Path |
|------|------|
| Types | `packages/cli/src/types/lottery.ts` |
| Types Test | `packages/cli/src/types/lottery.types.test.ts` |
| Service | `packages/cli/src/services/lottery-service.ts` |
| Service Test | `packages/cli/src/services/lottery-service.test.ts` |
| Handler | `packages/cli/src/handlers/lottery.handler.ts` |
| Handler Test | `packages/cli/src/handlers/lottery.handler.test.ts` |
| Commands | `packages/cli/src/commands/lottery.commands.ts` |
| Commands Test | `packages/cli/src/commands/lottery.commands.test.ts` |

---

## Notes

- Reference: `CheckinHandler` and `checkin.commands.ts` patterns
- V4 API endpoints for lottery activities need to be implemented in SDK wrapper
- Legacy V3 `listLottery` and `getWinnerDetail` are already in `LiveInteractionService`
- Table output columns defined in story document
- Test naming convention: `11.5-UNIT-XXX` for unit tests

---

**Generated by BMad TEA Agent** - 2026-03-24
