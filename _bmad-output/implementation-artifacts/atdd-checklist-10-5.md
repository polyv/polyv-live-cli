---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
lastStep: 'step-04-generate-tests'
lastSaved: '2026-03-22'
storyId: '10-5'
inputDocuments:
  - '_bmad-output/implementation-artifacts/10-5-player-config.md'
  - 'packages/cli/src/commands/statistics.commands.test.ts'
  - 'packages/cli/src/handlers/statistics.handler.test.ts'
  - 'packages/sdk/src/services/player.service.ts'
  - 'packages/sdk/src/types/player.ts'
---

# ATDD Checklist: Story 10-5 Player Config Commands

## Story Summary

**Story 10-5: 播放器设置命令**

作为运营人员，我希望通过 CLI 配置频道播放器设置（水印、暖场图、Logo等），以便快速调整播放器外观和功能，无需登录 Web 控制台。

---

## Test Strategy

### Test Levels

| Level | Tests | Priority |
|-------|-------|----------|
| Unit (CLI Commands) | Command registration, option validation | P0 |
| Unit (CLI Handler) | Business logic, output formatting | P0 |
| Unit (SDK Service) | API calls, parameter validation | P0 |
| Integration | End-to-end command execution | P1 |

### Test Stack

- **Backend** (Node.js CLI + SDK)
- **Test Framework**: Jest (CLI), Vitest (SDK)
- **Coverage Target**: >= 80% (functions, lines, statements), >= 70% (branches)

---

## Acceptance Criteria to Test Mapping

| AC | Description | Test Type | Test File | Priority |
|----|-------------|-----------|-----------|----------|
| AC1 | `player config get` command supports getting channel player config | Unit (Commands) | `player.commands.test.ts` | P0 |
| AC2 | `player config update` command supports updating player config | Unit (Commands) | `player.commands.test.ts` | P0 |
| AC3 | `get` command requires `--channel-id` parameter | Unit (Commands) | `player.commands.test.ts` | P0 |
| AC4 | `update` command supports `--watermark-enabled` parameter (Y/N) | Unit (Commands) | `player.commands.test.ts` | P0 |
| AC5 | `update` command supports `--watermark-url` parameter | Unit (Commands) | `player.commands.test.ts` | P0 |
| AC6 | `update` command supports `--watermark-position` parameter (tl/tr/bl/br) | Unit (Commands) | `player.commands.test.ts` | P0 |
| AC7 | `update` command supports `--watermark-opacity` parameter (0-1) | Unit (Commands) | `player.commands.test.ts` | P0 |
| AC8 | `update` command supports `--warmup-enabled` parameter (Y/N) | Unit (Commands) | `player.commands.test.ts` | P0 |
| AC9 | `update` command supports `--warmup-image-url` parameter | Unit (Commands) | `player.commands.test.ts` | P0 |
| AC10 | `update` command supports `--base-pv` parameter | Unit (Commands) | `player.commands.test.ts` | P0 |
| AC11 | Table output format clear, displays all player config items | Unit (Handler) | `player.handler.test.ts` | P0 |
| AC12 | JSON output includes all fields | Unit (Handler) | `player.handler.test.ts` | P0 |
| AC13 | Update success shows confirmation message | Unit (Handler) | `player.handler.test.ts` | P0 |

---

## Test Files to Create

### 1. SDK Service Tests (Vitest)

**File**: `packages/sdk/src/services/player.service.decorate.test.ts`

```typescript
// Tests for getChannelDecorate() and updateChannelDecorate() methods
// - API call validation
// - Parameter validation (position, opacity)
// - Response parsing
```

### 2. CLI Types Tests (Jest)

**File**: `packages/cli/src/types/player.test.ts`

```typescript
// Tests for type definitions
// - PlayerConfigGetOptions
// - PlayerConfigUpdateOptions
// - PlayerDecorateConfig
```

### 3. CLI Handler Tests (Jest)

**File**: `packages/cli/src/handlers/player.handler.test.ts`

```typescript
// Tests for PlayerHandler class
// - getConfig() method
// - updateConfig() method
// - Table output formatting
// - JSON output formatting
// - Success confirmation message
```

### 4. CLI Commands Tests (Jest)

**File**: `packages/cli/src/commands/player.commands.test.ts`

```typescript
// Tests for command registration
// - player command group
// - player config command group
// - player config get subcommand
// - player config update subcommand
// - Required parameters
// - Optional parameters
```

---

## Expected Interfaces

### SDK Types (packages/sdk/src/types/player.ts)

```typescript
// New types to add:

export interface ChannelDecoratePlayer {
  watermarkEnabled: 'Y' | 'N';
  iconUrl: string;
  iconPosition: LogoPosition;
  logoOpacity: number;
  iconLink: string;
  warmUpEnabled: 'Y' | 'N';
  warmUpImageUrl: string;
  coverJumpUrl: string;
  backgroundUrl: string;
  basePV: number;
  actualPV: number;
}

export interface ChannelDecorateGetResponse {
  player: ChannelDecoratePlayer;
}

export interface ChannelDecorateUpdateParams {
  watermarkEnabled?: 'Y' | 'N';
  iconUrl?: string;
  iconPosition?: LogoPosition;
  logoOpacity?: number;
  iconLink?: string;
  warmUpEnabled?: 'Y' | 'N';
  warmUpImageUrl?: string;
  coverJumpUrl?: string;
  backgroundUrl?: string;
  basePV?: number;
  actualPV?: number;
}
```

### CLI Types (packages/cli/src/types/player.ts)

```typescript
export interface PlayerServiceConfig {
  baseUrl: string;
  timeout: number;
  debug: boolean;
}

export interface PlayerConfigGetOptions {
  channelId: string;
  output?: 'table' | 'json';
}

export interface PlayerConfigUpdateOptions {
  channelId: string;
  watermarkEnabled?: 'Y' | 'N';
  watermarkUrl?: string;
  watermarkPosition?: 'tl' | 'tr' | 'bl' | 'br';
  watermarkOpacity?: number;
  warmupEnabled?: 'Y' | 'N';
  warmupImageUrl?: string;
  basePv?: number;
  output?: 'table' | 'json';
}

export interface PlayerDecorateDisplayItem {
  // Watermark settings
  watermarkEnabled: string;
  watermarkUrl: string;
  watermarkPosition: string;
  watermarkOpacity: string;
  watermarkLink: string;
  // Warmup settings
  warmupEnabled: string;
  warmupImageUrl: string;
  coverJumpUrl: string;
  backgroundImageUrl: string;
  // View data
  basePv: number;
  actualPv: number;
}
```

### SDK Service Methods (packages/sdk/src/services/player.service.ts)

```typescript
// New methods to add to PlayerService:

async getChannelDecorate(channelId: number): Promise<ChannelDecorateGetResponse>;
async updateChannelDecorate(channelId: number, params: ChannelDecorateUpdateParams): Promise<boolean>;
```

### CLI Service SDK (packages/cli/src/services/player.service.sdk.ts)

```typescript
export class PlayerServiceSdk {
  constructor(authConfig: AuthConfig, serviceConfig: PlayerServiceConfig);
  getChannelDecorate(options: PlayerConfigGetOptions): Promise<PlayerDecorateDisplayItem>;
  updateChannelDecorate(options: PlayerConfigUpdateOptions): Promise<{ success: boolean; updatedFields: string[] }>;
}
```

### CLI Handler (packages/cli/src/handlers/player.handler.ts)

```typescript
export interface IPlayerService {
  getChannelDecorate(options: PlayerConfigGetOptions): Promise<PlayerDecorateDisplayItem>;
  updateChannelDecorate(options: PlayerConfigUpdateOptions): Promise<{ success: boolean; updatedFields: string[] }>;
}

export class PlayerHandler extends BaseHandler {
  constructor(authConfig: AuthConfig, serviceConfig: PlayerServiceConfig, playerService?: IPlayerService);
  getConfig(options: PlayerConfigGetOptions): Promise<void>;
  updateConfig(options: PlayerConfigUpdateOptions): Promise<void>;
}
```

### CLI Commands (packages/cli/src/commands/player.commands.ts)

```typescript
export function registerPlayerCommands(program: Command): void;
export function validateWatermarkPosition(value: string): 'tl' | 'tr' | 'bl' | 'br';
export function validateWatermarkOpacity(value: string): number;
export function validateYNValue(value: string): 'Y' | 'N';
```

---

## Test Cases

### player.commands.test.ts

| Test Case | AC | Description |
|-----------|----|----|
| should register player command group | AC1 | Verify `player` command is registered |
| should register player config command group | AC1, AC2 | Verify `player config` subcommand is registered |
| should register player config get subcommand | AC1 | Verify `player config get` subcommand is registered |
| should register player config update subcommand | AC2 | Verify `player config update` subcommand is registered |
| should require --channel-id for get | AC3 | Verify `--channel-id` is required for get |
| should require --channel-id for update | AC3 | Verify `--channel-id` is required for update |
| should register --watermark-enabled option | AC4 | Verify `--watermark-enabled` option exists |
| should register --watermark-url option | AC5 | Verify `--watermark-url` option exists |
| should register --watermark-position option | AC6 | Verify `--watermark-position` option exists |
| should register --watermark-opacity option | AC7 | Verify `--watermark-opacity` option exists |
| should register --warmup-enabled option | AC8 | Verify `--warmup-enabled` option exists |
| should register --warmup-image-url option | AC9 | Verify `--warmup-image-url` option exists |
| should register --base-pv option | AC10 | Verify `--base-pv` option exists |
| should validate watermark position values | AC6 | Verify only tl/tr/bl/br are accepted |
| should validate watermark opacity range | AC7 | Verify 0-1 range is enforced |
| should validate Y/N values | AC4, AC8 | Verify only Y/N are accepted |

### player.handler.test.ts

| Test Case | AC | Description |
|-----------|----|----|
| should call service with correct parameters for get | AC1 | Verify service call with channelId |
| should display table output for get | AC11 | Verify table format is displayed |
| should display JSON output for get | AC12 | Verify JSON format is displayed |
| should include watermark settings in output | AC11, AC12 | Verify watermark fields are present |
| should include warmup settings in output | AC11, AC12 | Verify warmup fields are present |
| should include view data in output | AC11, AC12 | Verify basePv, actualPv are present |
| should call service with correct parameters for update | AC2 | Verify service call with update params |
| should display success message for update | AC13 | Verify confirmation message is shown |
| should display updated fields in success message | AC13 | Verify updated fields are listed |

### player.service.test.ts (SDK)

| Test Case | AC | Description |
|-----------|----|----|
| should call GET /live/v4/channel/decorate/get | AC1 | Verify API endpoint |
| should validate channelId for get | AC3 | Verify channelId validation |
| should call POST /live/v4/channel/decorate/update | AC2 | Verify API endpoint |
| should validate channelId for update | AC3 | Verify channelId validation |
| should validate watermark position values | AC6 | Verify position validation (tl/tr/bl/br) |
| should validate watermark opacity range | AC7 | Verify opacity validation (0-1) |
| should validate Y/N values | AC4, AC8 | Verify Y/N validation |
| should parse get response correctly | AC11, AC12 | Verify response parsing |
| should return true on successful update | AC13 | Verify update response |

---

## TDD Red Phase Status

All tests are designed to FAIL until the feature is implemented.

- [ ] Test files created with `describe.skip()` or failing assertions
- [ ] Tests assert EXPECTED interfaces (not current state)
- [ ] Tests will pass once implementation is complete

---

## Next Steps

1. Run tests to confirm they fail (RED phase)
2. Implement SDK types and methods
3. Implement CLI types
4. Implement CLI service SDK wrapper
5. Implement CLI handler
6. Implement CLI commands
7. Run tests to confirm they pass (GREEN phase)
8. Refactor if needed (REFACTOR phase)
9. Verify coverage >= 80%

---

## Commands to Run Tests

```bash
# Run all CLI tests
pnpm --filter polyv-live-cli test:unit

# Run all SDK tests
pnpm --filter polyv-live-api-sdk test:unit

# Run specific test file
pnpm --filter polyv-live-cli test:unit -- player.commands.test.ts
pnpm --filter polyv-live-cli test:unit -- player.handler.test.ts

# Run with coverage
pnpm --filter polyv-live-cli test:coverage
```
