---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode']
lastStep: 'step-02-generation-mode'
lastSaved: '2026-03-25'
storyId: '13-1'
storyTitle: '账号信息管理命令'
inputDocuments:
  - _bmad-output/implementation-artifacts/13-1-account-info-management.md
  - packages/sdk/src/types/account.ts
  - packages/sdk/src/services/account.service.ts
  - packages/cli/src/handlers/coupon.handler.ts
  - packages/cli/src/handlers/coupon.handler.test.ts
  - packages/cli/src/services/statistics.service.sdk.ts
  - packages/cli/src/services/statistics.service.sdk.test.ts
  - packages/cli/src/handlers/base.handler.ts
---

# ATDD Checklist - Story 13-1: 账号信息管理命令

## Story Overview

**Story ID:** 13-1
**Story Title:** 账号信息管理命令
**Status:** ready-for-dev (ATDD Red Phase)

## Acceptance Criteria (ACs)

1. **AC1:** `platform get` 命令支持获取账号基本信息（用户ID、邮箱、频道数等）
2. **AC2:** `platform switch get` 命令支持获取账号开关配置（全局设置、认证、录制等开关状态）
3. **AC3:** `platform switch update` 命令支持更新账号开关配置
4. **AC4:** 所有命令支持 `--output table|json` 输出格式
5. **AC5:** 遵循 ATDD 开发模式，先编写测试，再实现功能
6. **AC6:** 复用已有的 SDK Account Service 方法
7. **AC7:** 错误消息友好，清晰提示参数验证失败或 API 调用失败的情况
8. **AC8:** 表格输出格式清晰，显示账号信息关键字段

## Test Files to Create

### 1. Service SDK Tests
**File:** `packages/cli/src/services/platform-service.test.ts`

| Test ID | Priority | Test Case | AC | Expected Behavior |
|---------|----------|-----------|-----|-------------------|
| SVC-001 | P0 | `getUserInfo` should return account info | AC1, AC6 | Calls SDK account.getUserInfo() and returns GetUserInfoResponse |
| SVC-002 | P0 | `getSwitchConfig` should return switch config | AC2, AC6 | Calls SDK account.switchGet() and returns SwitchGetResponse |
| SVC-003 | P0 | `updateSwitchConfig` should update config | AC3, AC6 | Calls SDK account.switchUpdate() with validated params |
| SVC-004 | P1 | Constructor should store auth config | AC6 | Creates instance with valid config |
| SVC-005 | P1 | `updateSwitchConfig` should validate param name | AC7 | Throws PolyVValidationError for invalid param |
| SVC-006 | P1 | `updateSwitchConfig` should validate enabled value | AC7 | Throws PolyVValidationError for invalid enabled |

### 2. Handler Tests
**File:** `packages/cli/src/handlers/platform.handler.test.ts`

| Test ID | Priority | Test Case | AC | Expected Behavior |
|---------|----------|-----------|-----|-------------------|
| HDL-001 | P0 | `getAccountInfo` should call SDK and format output | AC1, AC8 | Calls PlatformServiceSdk.getAccountInfo() and displays table |
| HDL-002 | P0 | `getAccountInfo` with `--output json` | AC4 | Outputs JSON format |
| HDL-003 | P0 | `getSwitchConfig` should call SDK and format output | AC2, AC8 | Calls PlatformServiceSdk.getSwitchConfig() and displays switch table |
| HDL-004 | P0 | `getSwitchConfig` with `--output json` | AC4 | Outputs JSON format |
| HDL-005 | P0 | `updateSwitchConfig` with valid params | AC3 | Calls PlatformServiceSdk.updateSwitchConfig() and displays success |
| HDL-006 | P0 | `updateSwitchConfig` with `--output json` | AC4 | Outputs JSON format |
| HDL-007 | P1 | `updateSwitchConfig` throws for missing param | AC7 | Throws PolyVValidationError with friendly message |
| HDL-008 | P1 | `updateSwitchConfig` throws for invalid enabled | AC7 | Throws PolyVValidationError with friendly message |
| HDL-009 | P1 | `updateSwitchConfig` throws for unsupported param | AC7 | Throws PolyVValidationError listing valid params |
| HDL-010 | P1 | Handle API errors gracefully | AC7 | Displays user-friendly error message |

### 3. Command Tests
**File:** `packages/cli/src/commands/platform.commands.test.ts`

| Test ID | Priority | Test Case | AC | Expected Behavior |
|---------|----------|-----------|-----|-------------------|
| CMD-001 | P0 | Register `platform` command group | AC1 | Command group exists with description |
| CMD-002 | P0 | Register `platform get` subcommand | AC1 | Subcommand exists with correct options |
| CMD-003 | P0 | Register `platform switch get` subcommand | AC2 | Subcommand exists with correct options |
| CMD-004 | P0 | Register `platform switch update` subcommand | AC3 | Subcommand exists with required --param and --enabled |
| CMD-005 | P1 | `platform get` has `--output` option | AC4 | Option exists with table|json choices |
| CMD-006 | P1 | `platform switch get` has `--output` option | AC4 | Option exists with table|json choices |
| CMD-007 | P1 | `platform switch update` has `--output` option | AC4 | Option exists with table|json choices |
| CMD-008 | P1 | `platform switch update` requires `--param` | AC3, AC7 | --param is required |
| CMD-009 | P1 | `platform switch update` requires `--enabled` | AC3, AC7 | --enabled is required |
| CMD-010 | P1 | `validateEnabledValue` validates Y/N | AC7 | Validates enabled must be Y or N |

### 4. Types Tests
**File:** `packages/cli/src/types/platform.test.ts`

| Test ID | Priority | Test Case | AC | Expected Behavior |
|---------|----------|-----------|-----|-------------------|
| TYP-001 | P1 | PlatformGetOptions interface exists | AC1 | Interface with output field |
| TYP-002 | P1 | PlatformSwitchGetOptions interface exists | AC2 | Interface with output field |
| TYP-003 | P1 | PlatformSwitchUpdateOptions interface exists | AC3 | Interface with param, enabled, output fields |
| TYP-004 | P1 | PlatformServiceConfig interface exists | AC6 | Interface with baseUrl, timeout, debug |

## Interface Definitions (Expected)

### PlatformServiceSdk
```typescript
// packages/cli/src/services/platform-service.ts
export class PlatformServiceSdk {
  constructor(authConfig: AuthConfig, serviceConfig: PlatformServiceConfig);

  // AC1, AC6
  getUserInfo(): Promise<GetUserInfoResponse>;

  // AC2, AC6
  getSwitchConfig(): Promise<SwitchGetResponse>;

  // AC3, AC6
  updateSwitchConfig(params: { param: string; enabled: 'Y' | 'N' }): Promise<SwitchUpdateResponse>;
}
```

### PlatformHandler
```typescript
// packages/cli/src/handlers/platform.handler.ts
export class PlatformHandler extends BaseHandler {
  constructor(authConfig: AuthConfig, serviceConfig: PlatformServiceConfig);

  // AC1, AC4, AC8
  getAccountInfo(options: PlatformGetOptions): Promise<void>;

  // AC2, AC4, AC8
  getSwitchConfig(options: PlatformSwitchGetOptions): Promise<void>;

  // AC3, AC4, AC7
  updateSwitchConfig(options: PlatformSwitchUpdateOptions): Promise<void>;
}
```

### CLI Commands
```typescript
// packages/cli/src/commands/platform.commands.ts

// platform get
polyv-live-cli platform get [--output table|json]

// platform switch get
polyv-live-cli platform switch get [--output table|json]

// platform switch update
polyv-live-cli platform switch update --param <name> --enabled <Y|N> [--output table|json]
```

## Table Output Formats

### platform get (AC8)
| 字段 | 值 |
|-----|-----|
| 用户 ID | userId |
| 邮箱 | email |
| 最大频道数 | maxChannels |
| 总频道数 | totalChannels |
| 可用频道数 | availableChannels |
| 连麦限制 | linkMicLimit |
| 观看域名 | watchDomain |

### platform switch get (AC8)
| 开关名称 | 状态 |
|---------|------|
| 全局设置 | enabled/disabled |
| 认证 | enabled/disabled |
| 录制 | enabled/disabled |
| 回放 | enabled/disabled |
| 弹幕 | enabled/disabled |

## Valid Switch Parameters (AC7)
- `globalSettingEnabled` - 全局设置开关
- `authEnabled` - 认证开关
- `recordEnabled` - 录制开关
- `playbackEnabled` - 回放开关
- `danmuEnabled` - 弹幕开关

## Error Messages (AC7)
- Missing `--param`: "param (配置项名称) 是必需的"
- Invalid `--enabled`: "enabled 必须是 Y 或 N"
- Unsupported param: "不支持的配置项: xxx。可用配置项: globalSettingEnabled, authEnabled, recordEnabled, playbackEnabled, danmuEnabled"

## Test Coverage Target
- Functions: 80%
- Lines: 80%
- Statements: 80%
- Branches: 70%

## Test Execution Commands
```bash
# Run all platform tests
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- platform

# Run with coverage
pnpm --filter polyv-live-cli test:coverage -- platform

# Run specific test file
pnpm --filter polyv-live-cli test:unit -- platform.handler.test.ts
```

## Dependencies
- SDK: `polyv-live-api-sdk` (AccountService)
- Types from SDK:
  - `GetUserInfoResponse`
  - `SwitchGetResponse`
  - `SwitchUpdateParams`
  - `SwitchUpdateResponse`
  - `SwitchConfig`

## Checklist Status

- [x] Story analysis complete
- [x] Acceptance criteria mapped to tests
- [x] Test file structure defined
- [x] Interface signatures defined
- [x] Test files created (RED phase) - Tests failing as expected
- [x] Implementation complete (GREEN phase)
- [x] Tests passing (GREEN phase)
- [x] Coverage >= 80%

## Test Execution Results (GREEN Phase)

```
$ npx jest src/types/platform.test.ts src/services/platform-service.test.ts src/handlers/platform.handler.test.ts src/commands/platform.commands.test.ts

PASS src/commands/platform.commands.test.ts
PASS src/handlers/platform.handler.test.ts
PASS src/services/platform-service.test.ts
PASS src/types/platform.test.ts

Test Suites: 4 passed, 4 total
Tests:       85 passed, 85 total
```

**GREEN Phase Complete**: All tests passing.

## Full Test Suite Results

```
$ pnpm --filter polyv-live-cli test:unit

Test Suites: 147 passed, 147 total
Tests:       20 skipped, 4744 passed, 4764 total
```

**No Regressions**: All existing tests continue to pass.
