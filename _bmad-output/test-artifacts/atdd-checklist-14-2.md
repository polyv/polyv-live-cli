# Story 14-2: ATDD Checklist - Card Push Commands

**Status:** RED PHASE (Tests Created, Expect Failures)

## Overview

This checklist defines the test-first approach for implementing card push commands (`card-push list`, `card-push create`, `card-push update`, `card-push push`, `card-push cancel`, `card-push delete`).

## Test Files

| File | Purpose | Status |
|------|---------|--------|
| `packages/cli/src/services/card-push-service.test.ts` | SDK wrapper service tests | RED |
| `packages/cli/src/handlers/card-push.handler.test.ts` | Handler business logic tests | RED |
| `packages/cli/src/commands/card-push.commands.test.ts` | CLI command registration tests | RED |

## Implementation Files (To Be Created)

| File | Purpose | Status |
|------|---------|--------|
| `packages/cli/src/types/card-push.ts` | Type definitions | NOT CREATED |
| `packages/cli/src/services/card-push-service.ts` | CardPushServiceSdk wrapper | NOT CREATED |
| `packages/cli/src/handlers/card-push.handler.ts` | CardPushHandler class | NOT CREATED |
| `packages/cli/src/commands/card-push.commands.ts` | CLI command definitions | NOT CREATED |

## Acceptance Criteria Coverage

### AC1: `card-push list` - List Card Push Configurations

| Test ID | Description | File | Priority |
|---------|-------------|------|----------|
| 14.2-SVC-001 | should call httpClient.get for list operations | card-push-service.test.ts | P0 |
| 14.2-HDL-001 | should list card push configs with channelId | card-push.handler.test.ts | P0 |
| 14.2-HDL-002 | should output card pushes in JSON format | card-push.handler.test.ts | P0 |
| 14.2-HDL-003 | should output card pushes in table format | card-push.handler.test.ts | P0 |
| 14.2-CMD-001 | should register card-push list command with correct options | card-push.commands.test.ts | P0 |

### AC2: `card-push create` - Create Card Push Configuration

| Test ID | Description | File | Priority |
|---------|-------------|------|----------|
| 14.2-SVC-002 | should call httpClient.get for create operations | card-push-service.test.ts | P0 |
| 14.2-HDL-004 | should create card push with required params | card-push.handler.test.ts | P0 |
| 14.2-HDL-005 | should validate imageType enum values | card-push.handler.test.ts | P0 |
| 14.2-HDL-006 | should validate title max 16 chars | card-push.handler.test.ts | P0 |
| 14.2-HDL-007 | should validate link format (http/https) | card-push.handler.test.ts | P0 |
| 14.2-HDL-008 | should validate duration enum values (0,5,10,20,30) | card-push.handler.test.ts | P0 |
| 14.2-HDL-009 | should validate showCondition enum (PUSH/WATCH) | card-push.handler.test.ts | P0 |
| 14.2-CMD-002 | should register card-push create command with correct options | card-push.commands.test.ts | P0 |

### AC3: `card-push update` - Update Card Push Configuration

| Test ID | Description | File | Priority |
|---------|-------------|------|----------|
| 14.2-SVC-003 | should call httpClient.post for update operations | card-push-service.test.ts | P0 |
| 14.2-HDL-010 | should update card push with cardPushId | card-push.handler.test.ts | P0 |
| 14.2-HDL-011 | should validate cardPushId is required | card-push.handler.test.ts | P0 |
| 14.2-CMD-003 | should register card-push update command with correct options | card-push.commands.test.ts | P0 |

### AC4: `card-push push` - Push Card to Viewers

| Test ID | Description | File | Priority |
|---------|-------------|------|----------|
| 14.2-SVC-004 | should call httpClient.post for push operations | card-push-service.test.ts | P0 |
| 14.2-HDL-012 | should push card with cardPushId | card-push.handler.test.ts | P0 |
| 14.2-HDL-013 | should validate cardPushId is required for push | card-push.handler.test.ts | P0 |
| 14.2-CMD-004 | should register card-push push command with correct options | card-push.commands.test.ts | P0 |

### AC5: `card-push cancel` - Cancel Card Push

| Test ID | Description | File | Priority |
|---------|-------------|------|----------|
| 14.2-SVC-005 | should call httpClient.post for cancel operations | card-push-service.test.ts | P0 |
| 14.2-HDL-014 | should cancel push with cardPushId | card-push.handler.test.ts | P0 |
| 14.2-CMD-005 | should register card-push cancel command with correct options | card-push.commands.test.ts | P0 |

### AC6: `card-push delete` - Delete Card Push Configuration

| Test ID | Description | File | Priority |
|---------|-------------|------|----------|
| 14.2-SVC-006 | should call httpClient.post for delete operations | card-push-service.test.ts | P0 |
| 14.2-HDL-015 | should delete card push with cardPushId | card-push.handler.test.ts | P0 |
| 14.2-CMD-006 | should register card-push delete command with correct options | card-push.commands.test.ts | P0 |

### AC7: Output Format Support

| Test ID | Description | File | Priority |
|---------|-------------|------|----------|
| 14.2-HDL-016 | should validate output must be table or json | card-push.handler.test.ts | P0 |
| 14.2-HDL-017 | should default to table output | card-push.handler.test.ts | P1 |
| 14.2-CMD-007 | should have -o short form for --output | card-push.commands.test.ts | P1 |

### AC8: Error Message Friendliness

| Test ID | Description | File | Priority |
|---------|-------------|------|----------|
| 14.2-HDL-018 | should show friendly error for missing channelId | card-push.handler.test.ts | P1 |
| 14.2-HDL-019 | should show friendly error for missing cardPushId | card-push.handler.test.ts | P1 |
| 14.2-HDL-020 | should show friendly error for invalid imageType | card-push.handler.test.ts | P1 |
| 14.2-HDL-021 | should show friendly error for title too long | card-push.handler.test.ts | P1 |
| 14.2-HDL-022 | should handle API 401 error | card-push.handler.test.ts | P1 |
| 14.2-HDL-023 | should handle API 403 error | card-push.handler.test.ts | P1 |
| 14.2-HDL-024 | should handle API 404 error | card-push.handler.test.ts | P1 |
| 14.2-HDL-025 | should handle API 500 error | card-push.handler.test.ts | P1 |

## Expected Interface

### CardPushServiceSdk Class
```typescript
class CardPushServiceSdk {
  constructor(authConfig: AuthConfig, serviceConfig?: CardPushServiceConfig);

  // AC1
  listCardPushes(channelId: string): Promise<CardPush[]>;

  // AC2
  createCardPush(params: CreateCardPushParams): Promise<CreatedCardPush>;

  // AC3
  updateCardPush(params: UpdateCardPushParams): Promise<CardPush>;

  // AC4
  pushCard(params: PushCardParams): Promise<void>;

  // AC5
  cancelPush(params: CancelPushParams): Promise<void>;

  // AC6
  deleteCardPush(params: DeleteCardPushParams): Promise<void>;
}
```

### CardPushHandler Class
```typescript
class CardPushHandler extends BaseHandler {
  constructor(authConfig: AuthConfig, serviceConfig: CardPushServiceConfig);

  // AC1
  listCardPushes(options: CardPushListOptions): Promise<void>;

  // AC2
  createCardPush(options: CardPushCreateOptions): Promise<void>;

  // AC3
  updateCardPush(options: CardPushUpdateOptions): Promise<void>;

  // AC4
  pushCard(options: CardPushPushOptions): Promise<void>;

  // AC5
  cancelPush(options: CardPushCancelOptions): Promise<void>;

  // AC6
  deleteCardPush(options: CardPushDeleteOptions): Promise<void>;
}
```

### CLI Commands
```bash
# card-push list
card-push list --channelId <ID> [-o table|json]

# card-push create
card-push create --channelId <ID> --imageType <type> --title <title> --link <url> \
  --duration <seconds> --showCondition <PUSH|WATCH> \
  [--cardType <common|qrCode>] [--conditionValue <seconds>] \
  [--conditionUnit <SECONDS|MINUTES>] [--countdownMsg <msg>] \
  [--enterEnabled <Y|N>] [--linkEnabled <Y|N>] [--redirectType <iframe|tab>] \
  [-o table|json]

# card-push update
card-push update --channelId <ID> --cardPushId <ID> \
  [--title <title>] [--link <url>] [--duration <seconds>] \
  [--showCondition <PUSH|WATCH>] [-o table|json]

# card-push push
card-push push --channelId <ID> --cardPushId <ID> [-o table|json]

# card-push cancel
card-push cancel --channelId <ID> --cardPushId <ID> [-o table|json]

# card-push delete
card-push delete --channelId <ID> --cardPushId <ID> [-o table|json]
```

### CardPush Type
```typescript
interface CardPush {
  id: number;                    // Card push ID
  channelId: number;             // Channel ID
  title: string;                 // Card title, max 16 chars
  cardType: 'common' | 'qrCode'; // Card type
  imageType: 'giftbox' | 'redpack' | 'custom' | 'weixinWork'; // Card style
  duration: number;              // Countdown duration (0,5,10,20,30)
  durationPosition?: 'bottom' | 'top'; // Countdown position
  link: string;                  // Jump link
  pushStatus: 'Y' | 'N' | 'L';   // Push status (Y:pushing, N:not pushed, L:last pushed)
  enterEnabled: 'Y' | 'N';       // Card entry switch
  showCondition: 'PUSH' | 'WATCH'; // Popup method
  conditionValue?: number;       // Watch duration
  conditionUnit?: 'SECONDS' | 'MINUTES'; // Duration unit
  countdownMsg?: string;         // Countdown message, max 8 chars
  linkEnabled: 'Y' | 'N';        // Card jump switch
  redirectType?: 'iframe' | 'tab'; // Jump method
  createdTime: number;           // Create time (13-digit timestamp)
  lastModified?: number;         // Modify time
  pushTime?: number;             // Push time
  pushEndTime?: number;          // Push end time
}
```

### CreateCardPushParams Type
```typescript
interface CreateCardPushParams {
  channelId: string;
  imageType: 'giftbox' | 'redpack' | 'custom' | 'weixinWork';
  title: string;
  link: string;
  duration: 0 | 5 | 10 | 20 | 30;
  showCondition: 'PUSH' | 'WATCH';
  cardType?: 'common' | 'qrCode';
  conditionValue?: number;
  conditionUnit?: 'SECONDS' | 'MINUTES';
  countdownMsg?: string;
  enterEnabled?: 'Y' | 'N';
  linkEnabled?: 'Y' | 'N';
  redirectType?: 'iframe' | 'tab';
}
```

## Run Tests
```bash
# Run card-push-related tests only
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- card-push

# Run with coverage
nvm use 23 && pnpm --filter polyv-live-cli test:coverage
```

## Progress Tracking
- [ ] Phase 1: Create types (`packages/cli/src/types/card-push.ts`)
- [ ] Phase 2: Create SDK wrapper (`packages/cli/src/services/card-push-service.ts`)
- [ ] Phase 3: Create handler (`packages/cli/src/handlers/card-push.handler.ts`)
- [ ] Phase 4: Create commands (`packages/cli/src/commands/card-push.commands.ts`)
- [ ] Phase 5: Register commands in `src/index.ts`
- [ ] Phase 6: All tests pass (GREEN phase)
- [ ] Phase 7: Verify 80% test coverage
- [ ] Phase 8: Update skill documentation

## API Endpoints

| Feature | HTTP Method | Endpoint |
|---------|-------------|----------|
| List card pushes | GET | `/live/v4/channel/card-push/list` |
| Create card push | GET | `/live/v4/channel/card-push/create` |
| Update card push | POST | `/live/v4/channel/card-push/update` |
| Push card | POST | `/live/v4/channel/card-push/push` |
| Cancel push | POST | `/live/v4/channel/card-push/cancel-push` |
| Delete card push | POST | `/live/v4/channel/card-push/delete` |

## Notes
- Follow the pattern from `PromotionHandler` and `promotion.commands.ts` (Story 14-1)
- Use httpClient directly for API calls (similar to promotion-service.ts)
- All public methods must have JSDoc comments
- CLI short option rule: **NO `-v` or `-V` allowed** (conflicts with `--version`)
- Use `-o` for output format (consistent with other commands)
- Business rule: channelId must be provided
- Business rule: cardPushId is required for update/push/cancel/delete
- Business rule: title max 16 characters
- Business rule: countdownMsg max 8 characters
- Business rule: duration must be one of 0, 5, 10, 20, 30
- Business rule: showCondition WATCH requires conditionValue and conditionUnit
