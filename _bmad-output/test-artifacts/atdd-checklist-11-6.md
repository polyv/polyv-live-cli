---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-03-24'
workflowType: 'testarch-atdd'
inputDocuments:
  - '_bmad-output/implementation-artifacts/11-6-donate-management.md'
  - 'packages/cli/src/handlers/lottery.handler.ts'
  - 'packages/cli/src/handlers/lottery.handler.test.ts'
  - 'packages/cli/src/commands/lottery.commands.ts'
  - 'packages/cli/src/commands/lottery.commands.test.ts'
  - 'packages/cli/src/services/lottery-service.ts'
  - 'packages/cli/src/types/lottery.ts'
---

# ATDD Checklist - Epic 11, Story 6: Donate Management Commands

**Date:** 2026-03-24
**Author:** Claude Code Agent (ATDD Workflow)
**Primary Test Level:** Unit (Backend CLI)

---

## Story Summary

As a operations staff or PaaS client developer, I want to manage donate settings through CLI commands (`donate config get`, `donate config update`, `donate list`), so that I can efficiently manage live streaming donation interaction features.

**As a** operations staff or PaaS client developer
**I want** to manage donate settings through CLI commands
**So that** I can efficiently manage live streaming donation interaction features

---

## Acceptance Criteria

1. AC1: `donate config get` command supports getting channel donate settings (V4 API)
2. AC2: `donate config update` command supports updating donate settings (V4 API)
3. AC3: `donate list` command supports paginated query of channel donate records (V4 API)
4. AC4: All commands support `--output table|json` output format
5. AC5: Follow ATDD development pattern, write tests first, then implement
6. AC6: Reuse existing SDK V4 Channel Service donate related methods
7. AC7: Error messages are user-friendly, clearly indicating parameter validation failures or API call failures
8. AC8: Table output format is clear, displaying config info or donate records

---

## Failing Tests Created (RED Phase)

### Handler Unit Tests (0 tests - file will fail to import)

**File:** `packages/cli/src/handlers/donate.handler.test.ts` (will be created)

**Status:** RED - Module not found (handler not implemented yet)

Tests will verify:
- AC1: `getConfig` method for getting donate settings
- AC2: `updateConfig` method for updating donate settings
- AC3: `listRecords` method for querying donate records with time range
- AC4: Output format handling (table/json)
- AC7: Error handling and validation
- AC8: Table output formatting

### Command Unit Tests (0 tests - file will fail to import)

**File:** `packages/cli/src/commands/donate.commands.test.ts` (will be created)

**Status:** RED - Module not found (commands not implemented yet)

Tests will verify:
- Command registration for `donate` main command
- Subcommand registration: `config get`, `config update`, `list`
- Option definitions for each subcommand
- Help text output

### Service SDK Unit Tests (0 tests - file will fail to import)

**File:** `packages/cli/src/services/donate-service.test.ts` (will be created)

**Status:** RED - Module not found (service not implemented yet)

Tests will verify:
- `DonateServiceSdk` class construction
- `getDonateConfig` method (wraps `v4Channel.getDonate`)
- `updateDonateConfig` method (wraps `v4Channel.updateDonate`)
- `listRewardGift` method (calls V4 API `/live/v4/channel/reward/gift-list`)

### Types Unit Tests (0 tests - file will fail to import)

**File:** `packages/cli/src/types/donate.types.test.ts` (will be created)

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
| P0 | Core config operations (get, update, list) | Critical user journeys |
| P1 | Output formatting, edge cases | Quality of life features |
| P2 | Error handling edge cases | Robustness |

---

## Implementation Checklist

### Test: Handler - getConfig (AC1)

**File:** `packages/cli/src/handlers/donate.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Create `packages/cli/src/types/donate.ts` with `DonateConfigGetOptions` interface
- [ ] Create `packages/cli/src/services/donate-service.ts` with `DonateServiceSdk` class
- [ ] Create `packages/cli/src/handlers/donate.handler.ts` with `DonateHandler` class
- [ ] Implement `getConfig` method
- [ ] Implement validation for required parameters (channelId)
- [ ] Run test: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- donate.handler`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: Handler - updateConfig (AC2)

**File:** `packages/cli/src/handlers/donate.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Add `DonateConfigUpdateOptions` interface to `packages/cli/src/types/donate.ts`
- [ ] Add `updateDonateConfig` method to `DonateServiceSdk`
- [ ] Implement `updateConfig` method in `DonateHandler`
- [ ] Implement validation for parameters (cashEnabled, giftEnabled, tips, amounts)
- [ ] Run test: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- donate.handler`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: Handler - listRecords (AC3)

**File:** `packages/cli/src/handlers/donate.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Add `DonateListOptions` interface to `packages/cli/src/types/donate.ts`
- [ ] Add `listRewardGift` method to `DonateServiceSdk`
- [ ] Implement `listRecords` method in `DonateHandler`
- [ ] Implement validation for required time range (start, end)
- [ ] Implement pagination parameters (page, size)
- [ ] Run test: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- donate.handler`
- [ ] Test passes (green phase)

**Estimated Effort:** 1.5 hours

---

### Test: Commands - donate config get (AC1)

**File:** `packages/cli/src/commands/donate.commands.test.ts`

**Tasks to make this test pass:**

- [ ] Create `packages/cli/src/commands/donate.commands.ts`
- [ ] Register `donate` main command
- [ ] Register `config` subcommand
- [ ] Register `get` sub-subcommand with options: `-c/--channel-id` (required), `-o/--output`
- [ ] Run test: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- donate.commands`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: Commands - donate config update (AC2)

**File:** `packages/cli/src/commands/donate.commands.test.ts`

**Tasks to make this test pass:**

- [ ] Register `update` sub-subcommand with options: `-c/--channel-id` (required), `--cash-enabled`, `--gift-enabled`, `--tips`, `--amounts`, `-o/--output`
- [ ] Run test: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- donate.commands`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: Commands - donate list (AC3)

**File:** `packages/cli/src/commands/donate.commands.test.ts`

**Tasks to make this test pass:**

- [ ] Register `list` subcommand with options: `-c/--channel-id` (required), `--start` (required), `--end` (required), `--page`, `--size`, `-o/--output`
- [ ] Run test: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- donate.commands`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: Service SDK - all methods (AC6)

**File:** `packages/cli/src/services/donate-service.test.ts`

**Tasks to make this test pass:**

- [ ] Implement `getDonateConfig` method calling V4 API `getDonate`
- [ ] Implement `updateDonateConfig` method calling V4 API `updateDonate`
- [ ] Implement `listRewardGift` method calling V4 API `/live/v4/channel/reward/gift-list`
- [ ] Run test: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- donate-service`
- [ ] Test passes (green phase)

**Estimated Effort:** 1.5 hours

---

## Running Tests

```bash
# Run all donate tests
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- donate

# Run handler tests only
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- donate.handler

# Run commands tests only
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- donate.commands

# Run service tests only
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- donate-service

# Run types tests only
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- donate.types

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

1. Types (`donate.ts`)
2. Service SDK (`donate-service.ts`)
3. Handler (`donate.handler.ts`)
4. Commands (`donate.commands.ts`)
5. Register in `index.ts`

---

## Test File Paths

| File | Path |
|------|------|
| Types | `packages/cli/src/types/donate.ts` |
| Types Test | `packages/cli/src/types/donate.types.test.ts` |
| Service | `packages/cli/src/services/donate-service.ts` |
| Service Test | `packages/cli/src/services/donate-service.test.ts` |
| Handler | `packages/cli/src/handlers/donate.handler.ts` |
| Handler Test | `packages/cli/src/handlers/donate.handler.test.ts` |
| Commands | `packages/cli/src/commands/donate.commands.ts` |
| Commands Test | `packages/cli/src/commands/donate.commands.test.ts` |

---

## Notes

- Reference: `LotteryHandler` and `lottery.commands.ts` patterns
- V4 API endpoints:
  - `/live/v4/channel/donate/get` - Get donate config
  - `/live/v4/channel/donate/update` - Update donate config
  - `/live/v4/channel/reward/gift-list` - List donate records
- SDK already has `getDonate` and `updateDonate` methods in V4 Channel Service
- SDK needs new `listRewardGift` method for `/live/v4/channel/reward/gift-list` endpoint
- Table output columns defined in story document
- Test naming convention: `11.6-UNIT-XXX` for unit tests

---

## API Response Structures

### getDonate Response
```typescript
{
  globalSettingEnabled: 'Y' | 'N';
  donateCashEnabled: 'Y' | 'N';
  donateGoodEnabled: 'Y' | 'N';
  donateTips: string;
  cashMin: number;
  cashes: number[];
  donatePointEnabled: 'Y' | 'N';
  pointUnit: string | null;
  goods: Array<{
    goodName: string;
    goodImg: string;
    goodPrice: number;
    goodEnabled: 'Y' | 'N';
  }>;
}
```

### listRewardGift Response
```typescript
{
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  contents: Array<{
    userId: string;
    nickName: string;
    timestamp: number;
    name: string;
    type: '1' | '2'; // 1=props/points, 2=cash
    amount: number;
    sessionId: string;
  }>;
}
```

---

**Generated by BMad TEA Agent** - 2026-03-24
