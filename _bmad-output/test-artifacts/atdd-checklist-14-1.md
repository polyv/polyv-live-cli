# Story 14-1: ATDD Checklist - Marketing Promotion Management Commands

**Status:** RED PHASE (Tests Created, Expect Failures)

## Overview

This checklist defines the test-first approach for implementing marketing promotion commands (`promotion list`, `promotion create`).

## Test Files

| File | Purpose | Status |
|------|---------|--------|
| `packages/cli/src/handlers/promotion.handler.test.ts` | Handler business logic tests | RED |
| `packages/cli/src/commands/promotion.commands.test.ts` | CLI command registration tests | RED |
| `packages/cli/src/services/promotion-service.test.ts` | SDK wrapper service tests | RED |

## Implementation Files (To Be Created)

| File | Purpose | Status |
|------|---------|--------|
| `packages/cli/src/handlers/promotion.handler.ts` | PromotionHandler class | NOT CREATED |
| `packages/cli/src/commands/promotion.commands.ts` | CLI command definitions | NOT CREATED |
| `packages/cli/src/services/promotion-service.ts` | PromotionServiceSdk wrapper | NOT CREATED |
| `packages/cli/src/types/promotion.ts` | Type definitions | NOT CREATED |

## Acceptance Criteria Coverage

### AC1: `promotion list` - List Promotion Channels

| Test ID | Description | File | Line |
|---------|-------------|------|------|
| 14.1-UNIT-001 | should create PromotionServiceSdk with correct configuration | promotion.handler.test.ts | - |
| 14.1-UNIT-002 | should list promotion channels with channelId | promotion.handler.test.ts | - |
| 14.1-UNIT-003 | should output promotions in JSON format | promotion.handler.test.ts | - |
| 14.1-UNIT-004 | should output promotions in table format | promotion.handler.test.ts | - |
| 14.1-UNIT-005 | should handle API errors gracefully | promotion.handler.test.ts | - |
| 14.1-UNIT-006 | should display empty state when no promotions exist | promotion.handler.test.ts | - |
| 14.1-CMD-001 | should register promotion list command with correct options | promotion.commands.test.ts | - |

### AC2: `promotion create` - Batch Create Promotion Channels

| Test ID | Description | File | Line |
|---------|-------------|------|------|
| 14.1-UNIT-007 | should create promotion channels with valid names | promotion.handler.test.ts | - |
| 14.1-UNIT-008 | should validate channelId is required | promotion.handler.test.ts | - |
| 14.1-UNIT-009 | should validate names is required | promotion.handler.test.ts | - |
| 14.1-UNIT-010 | should validate names is not empty array | promotion.handler.test.ts | - |
| 14.1-UNIT-011 | should validate name length (max 20 chars) | promotion.handler.test.ts | - |
| 14.1-UNIT-012 | should output created promotion info | promotion.handler.test.ts | - |
| 14.1-UNIT-013 | should handle API errors gracefully | promotion.handler.test.ts | - |
| 14.1-CMD-002 | should register promotion create command with correct options | promotion.commands.test.ts | - |

### AC3: Output Format Support

| Test ID | Description | File | Line |
|---------|-------------|------|------|
| 14.1-UNIT-014 | should validate output must be table or json | promotion.handler.test.ts | - |
| 14.1-UNIT-015 | should default to table output | promotion.handler.test.ts | - |
| 14.1-CMD-003 | should have -o short form for --output | promotion.commands.test.ts | - |

### AC4: ATDD Development Mode

- [x] Tests written before implementation (RED phase)
- [ ] Implementation makes tests pass (GREEN phase)
- [ ] Code refactored while keeping tests green (REFACTOR phase)

### AC5: Reuse SDK V4 Channel Service

| Test ID | Description | File | Line |
|---------|-------------|------|------|
| 14.1-SVC-001 | should call v4Channel.listPopularizations for list operations | promotion-service.test.ts | - |
| 14.1-SVC-002 | should call v4Channel.batchCreatePopularizations for create operations | promotion-service.test.ts | - |

### AC6: Error Message Friendliness

| Test ID | Description | File | Line |
|---------|-------------|------|------|
| 14.1-UNIT-016 | should show friendly error for missing channelId | promotion.handler.test.ts | - |
| 14.1-UNIT-017 | should show friendly error for missing names | promotion.handler.test.ts | - |
| 14.1-UNIT-018 | should handle API 401 error | promotion.handler.test.ts | - |
| 14.1-UNIT-019 | should handle API 403 error | promotion.handler.test.ts | - |
| 14.1-UNIT-020 | should handle API 404 error (channel not found) | promotion.handler.test.ts | - |
| 14.1-UNIT-021 | should handle API 500 error | promotion.handler.test.ts | - |

### AC7: Table Output Format

| Test ID | Description | File | Line |
|---------|-------------|------|------|
| 14.1-UNIT-022 | should display promotions as formatted table | promotion.handler.test.ts | - |
| 14.1-UNIT-023 | should show promoteId column | promotion.handler.test.ts | - |
| 14.1-UNIT-024 | should show popularizationName column | promotion.handler.test.ts | - |
| 14.1-UNIT-025 | should show visitsNum column | promotion.handler.test.ts | - |
| 14.1-UNIT-026 | should show viewerNum column | promotion.handler.test.ts | - |
| 14.1-UNIT-027 | should show createdTime column | promotion.handler.test.ts | - |
| 14.1-UNIT-028 | should show empty state message when no promotions | promotion.handler.test.ts | - |

## Expected Interface

### PromotionHandler Class
```typescript
class PromotionHandler extends BaseHandler {
  constructor(authConfig: AuthConfig, serviceConfig: PromotionServiceConfig);

  // AC1
  listPromotions(options: PromotionListOptions): Promise<void>;

  // AC2
  createPromotions(options: PromotionCreateOptions): Promise<void>;
}
```

### PromotionServiceSdk Class
```typescript
class PromotionServiceSdk {
  constructor(authConfig: AuthConfig, serviceConfig?: PromotionServiceConfig);

  // AC1
  listPopularizations(channelId: string): Promise<PromotionChannel[]>;

  // AC2
  batchCreatePopularizations(params: { channelId: string; names: string[] }): Promise<CreatedPromotion[]>;
}
```
### CLI Commands
```bash
# promotion list
promotion list --channelId <ID> [-o table|json]

# promotion create
promotion create --channelId <ID> --names <name1,name2,...> [-o table|json]
```
### PromotionChannel Type
```typescript
interface PromotionChannel {
  promoteId: string;           // 推广ID
  popularizationName: string;   // 推广渠道名称
  visitsNum: number;            // 总访问次数
  reservationNum: number;       // 预约人数
  watchNum: number;             // 观看次数
  viewerNum: number;            // 观看人数
  averageWatchTime: string;     // 人均观看时长
  enrollNum: number;            // 报名观看人数
  createdTime: number;          // 创建时间 (13位毫秒时间戳)
}
```

### CreatedPromotion Type
```typescript
interface CreatedPromotion {
  promoteId: string;           // 推广ID
  popularizationName: string;   // 推广渠道名称
}
```
## Run Tests
```bash
# Run promotion-related tests only
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- promotion

# Run with coverage
nvm use 23 && pnpm --filter polyv-live-cli test:coverage
```
## Progress Tracking
- [ ] Phase 1: Create types (`packages/cli/src/types/promotion.ts`)
- [ ] Phase 2: Create SDK wrapper (`packages/cli/src/services/promotion-service.ts`)
- [ ] Phase 3: Create handler (`packages/cli/src/handlers/promotion.handler.ts`)
- [ ] Phase 4: Create commands (`packages/cli/src/commands/promotion.commands.ts`)
- [ ] Phase 5: Register commands in `src/index.ts`
- [ ] Phase 6: All tests pass (GREEN phase)
- [ ] Phase 7: Verify 80% test coverage
- [ ] Phase 8: Update skill documentation
## Notes
- Follow the pattern from `PlatformHandler` and `platform.commands.ts`
- Reuse SDK V4ChannelService methods (listPopularizations, batchCreatePopularizations)
- All public methods must have JSDoc comments
- Table output should display promoteId, popularizationName, visitsNum, viewerNum, createdTime
- CLI short option rule: **NO `-v` or `-V` allowed** (conflicts with `--version`)
- Use `-o` for output format (consistent with other commands)
- Business rule: channelId must be provided
- Business rule: names array cannot be empty
- Business rule: each name cannot exceed 20 characters
- Maximum 500 promotions per channel (including historical)
