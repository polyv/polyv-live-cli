---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-identify-targets
  - step-03-generate-tests
lastStep: 'step-03-generate-tests'
lastSaved: '2026-03-26'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - packages/cli/package.json (Jest config)
  - packages/sdk/vitest.config.ts
workflowType: 'bmad-testarch-automate'
executionMode: 'BMad-Integrated'
focusArea: 'Coverage Gaps'
---

# Test Automation Coverage Plan

## Executive Summary

**Goal:** Achieve 80% coverage threshold for statements, lines, and functions; 70% for branches.

**Initial State:**
| Metric | Initial | Threshold | Gap |
|--------|---------|-----------|-----|
| Statements | 79.43% | 80% | -0.57% |
| Branches | 69.75% | 70% | -0.25% |
| Lines | 79.73% | 80% | -0.27% |
| Functions | N/A | 80% | N/A |

**Final State (After Implementation):**
| Metric | Final | Threshold | Status |
|--------|-------|-----------|--------|
| Statements | **81.5%** | 80% | ✅ PASS |
| Branches | **72.65%** | 70% | ✅ PASS |
| Lines | **81.81%** | 80% | ✅ PASS |
| Functions | **82.12%** | 80% | ✅ PASS |

**Strategy:** Focus on high-impact, low-coverage files to close the gap efficiently.

---

## 1. Automation Targets

### Priority 0: Critical - Services Without Tests (Coverage Gap: 0-10%)

| File | Initial Coverage | Final Coverage | Status |
|------|-----------------|----------------|--------|
| `stream.service.sdk.ts` | 2.67% | **96.42%** | ✅ Complete |
| `player.service.sdk.ts` | 5% | **100%** | ✅ Complete |
| `channel.service.sdk.ts` | 5.51% | **100%** | ✅ Complete |
| `qa-questionnaire-service.ts` | 8.82% | **100%** | ✅ Complete |

### Priority 1: High - Commands With Low Coverage (Coverage: 18-40%)

| File | Initial Coverage | Final Coverage | Status |
|------|-----------------|----------------|--------|
| `playback.commands.ts` | 18.18% | **Improved** | ✅ Action handlers added |
| `record.commands.ts` | 20% | Pending | ⏳ Next |
| `document.commands.ts` | 21.42% | Pending | ⏳ Next |
| `statistics.commands.ts` | 23.6% | Pending | ⏳ Next |
| `chat.commands.ts` | 26.66% | Pending | ⏳ Next |
| `player.commands.ts` | 27.45% | Pending | ⏳ Next |
| `setup.commands.ts` | 18% | Pending | ⏳ Next |

### Priority 2: Medium - Services With Partial Coverage (Coverage: 58-75%)

| File | Current Coverage | Priority | Status |
|------|-----------------|----------|--------|
| `resource-handlers.ts` | 58.62% | P2 | ⏳ Pending |
| `statistics.service.sdk.ts` | 69.71% | P2 | ⏳ Pending |
| `config-manager.ts` | 69.27% | P2 | ⏳ Pending |

---

## 2. Test Files Created/Expanded

### Phase 1: P0 Services (Completed ✅)

| Source File | Test File | Test Count | Status |
|-------------|-----------|------------|--------|
| `stream.service.sdk.ts` | `stream.service.sdk.test.ts` | 94 tests | ✅ Complete |
| `player.service.sdk.ts` | `player.service.sdk.test.ts` | 50 tests | ✅ Complete |
| `channel.service.sdk.ts` | `channel.service.sdk.test.ts` | 75 tests | ✅ Complete |
| `qa-questionnaire-service.ts` | `qa-questionnaire-service.test.ts` | 45 tests | ✅ Complete |

### Phase 2: P1 Commands (In Progress)

| Source File | Test File | Test Count | Status |
|-------------|-----------|------------|--------|
| `playback.commands.ts` | `playback.commands.test.ts` | 89 tests (+24 action handlers) | ✅ Expanded |

---

## 3. Test Pattern Guidelines

### Service SDK Test Pattern

```typescript
describe('StreamServiceSdk', () => {
  let service: StreamServiceSdk;
  let mockClient: jest.Mocked<PolyVClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    service = new StreamServiceSdk(authConfig, serviceConfig);
  });

  describe('getStreamKey', () => {
    it('should return stream credentials for valid channel', async () => {});
    it('should throw PolyVValidationError for invalid channelId', async () => {});
    it('should throw PolyVAPIError when push URL not available', async () => {});
    it('should handle API errors gracefully', async () => {});
  });
});
```

### Command Action Handler Test Pattern

```typescript
describe('action handlers', () => {
  const mockListPlaybacks = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockListPlaybacks.mockClear();
  });

  describe('list action', () => {
    it('should list playbacks with valid parameters', async () => {
      mockListPlaybacks.mockResolvedValueOnce({ contents: [], total: 0 });
      const program = new Command();
      registerPlaybackCommands(program);
      await program.parseAsync(['node', 'test', 'playback', 'list', '--channel-id', '3151318']);
      expect(mockListPlaybacks).toHaveBeenCalled();
    });
  });
});
```

---

## 4. Success Criteria

| Metric | Target | Achieved | Verification |
|--------|--------|----------|--------------|
| Statements | ≥ 80% | **81.5%** | ✅ `pnpm test:coverage` |
| Branches | ≥ 70% | **72.65%** | ✅ `pnpm test:coverage` |
| Lines | ≥ 80% | **81.81%** | ✅ `pnpm test:coverage` |
| Functions | ≥ 80% | **82.12%** | ✅ `pnpm test:coverage` |
| All P0 files | ≥ 80% | **100%** | ✅ Individual file coverage |

---

## 5. Summary

**Coverage thresholds have been achieved!** All metrics now exceed the required thresholds:

- **P0 Services:** All 4 services now have 96-100% coverage
- **P1 Commands:** playback.commands.ts expanded with action handler tests
- **Overall:** 5543 tests passing across 174 test suites

### Remaining Work (Optional)

To further improve coverage, consider expanding P1 command tests for:
- `record.commands.ts`
- `document.commands.ts`
- `statistics.commands.ts`
- `chat.commands.ts`
- `player.commands.ts`
