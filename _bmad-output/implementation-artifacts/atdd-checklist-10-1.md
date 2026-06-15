---
stepsCompleted: ['step-01-preflight-and-context']
lastStep: 'step-01-preflight-and-context'
lastSaved: '2026-03-22'
story_id: '10-1'
inputDocuments:
  - '_bmad-output/implementation-artifacts/10-1-statistics-view.md'
  - '_bmad/tea/testarch/knowledge/data-factories.md'
---

# ATDD Checklist - Story 10.1: Statistics View Command

## Preflight Verification

### Stack Detection
- **Detected Stack**: `backend` (CLI/Node.js project)
- **Test Framework**: Jest (CLI), Vitest (SDK)
- **No browser automation required**

### Prerequisites Verified
- [x] Story approved with clear acceptance criteria (5 ACs)
- [x] Test framework configured (Jest + Vitest)
- [x] Development environment available
- [x] Existing test patterns identified (product.commands.test.ts, product.handler.test.ts)

## Acceptance Criteria Mapping

| AC | Description | Test Location |
|----|-------------|---------------|
| AC1 | `statistics view` returns key metrics | SDK Service + CLI Handler |
| AC2 | Date range filtering with `--start-day`, `--end-day` | SDK Service + CLI Handler |
| AC3 | Table output format | CLI Handler |
| AC4 | JSON output complete | CLI Handler |
| AC5 | Required `--channel-id` parameter | CLI Commands |

## Test Files to Generate

### 1. SDK Service Tests (Vitest)
- **Path**: `packages/sdk/src/services/statistics.service.test.ts`
- **Coverage**: AC1, AC2

### 2. CLI Handler Tests (Jest)
- **Path**: `packages/cli/src/handlers/statistics.handler.test.ts`
- **Coverage**: AC1, AC2, AC3, AC4

### 3. CLI Commands Tests (Jest)
- **Path**: `packages/cli/src/commands/statistics.commands.test.ts`
- **Coverage**: AC5, command registration

## Test Design Patterns

Based on existing test patterns:
- Mock service dependencies
- Test validation errors for invalid inputs
- Test both table and JSON output formats
- Test required parameter validation

## Test Execution Results (TDD Red Phase)

### CLI Tests (Jest)
```
FAIL src/handlers/statistics.handler.test.ts
  Cannot find module '../services/statistics.service.sdk'

FAIL src/commands/statistics.commands.test.ts
  Cannot find module './statistics.commands'

Test Suites: 2 failed, 2 total
Tests:       0 total
```

### SDK Tests (Vitest)
Pending - requires implementation of types

### Status: ✅ RED PHASE COMPLETE
All tests fail as expected because implementation files don't exist yet.

## Implementation Files Required

### SDK (packages/sdk/src/)
1. `types/statistics.ts` - Type definitions
2. `services/statistics.service.ts` - StatisticsService implementation

### CLI (packages/cli/src/)
1. `types/statistics.ts` - CLI options types
2. `services/statistics.service.sdk.ts` - SDK wrapper
3. `handlers/statistics.handler.ts` - Handler implementation
4. `commands/statistics.commands.ts` - Command registration

## Next Step

Proceed to implementation (TDD green phase)
