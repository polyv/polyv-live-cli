---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
  - step-04c-aggregate
lastStep: 'step-04c-aggregate'
lastSaved: '2026-03-25'
workflowType: 'testarch-atdd'
inputDocuments:
  - '_bmad-output/implementation-artifacts/13-3-global-settings.md'
  - 'packages/cli/src/handlers/platform.handler.test.ts'
  - 'packages/cli/src/commands/platform.commands.test.ts'
  - 'packages/cli/src/services/platform-service.test.ts'
---

# ATDD Checklist - Epic 13, Story 3: Global Settings Management Commands

**Date:** 2026-03-25
**Author:** Claude Code Agent
**Primary Test Level:** Unit (Handler/Command/Service)

---

## Story Summary

As an administrator or PaaS client developer, I want to use `platform setting get` and `platform setting update` commands via CLI to manage PolyV global settings, so that I can configure and view global channel settings such as auto-convert, donation, and player cover settings.

**As a** administrator or PaaS client developer
**I want** `platform setting get` and `platform setting update` CLI commands
**So that** I can configure and view global channel settings

---

## Acceptance Criteria

1. AC1: `platform setting get` command supports retrieving global channel settings
2. AC2: `platform setting update` command supports updating multiple global setting parameters
3. AC3: All commands support `--output table|json` output format
4. AC4: Follow ATDD development pattern - write tests first, then implement functionality
5. AC5: Reuse existing SDK V4UserService global setting methods (requires NEW SDK methods)
6. AC6: Error messages are user-friendly, clearly indicating parameter validation failures or API call errors
7. AC7: Table output format is clean and displays key global setting fields
8. AC8: Support updating multiple global setting parameters in a single update command
9. AC9: All Y/N parameters must use uppercase values (Y or N)

---

## Failing Tests Created (RED Phase)

### SDK Tests (6 tests)

**File:** `packages/sdk/src/services/v4/user.service.test.ts` (extended)

- **Test:** [P0][SDK-GS-001] should get global channel settings successfully
  - **Status:** RED - Method getGlobalChannelSettings() not implemented
  - **Verifies:** AC1, AC5

- **Test:** [P0][SDK-GS-002] should update global channel settings successfully
  - **Status:** RED - Method updateGlobalChannelSettings() not implemented
  - **Verifies:** AC2, AC5

- **Test:** [P1][SDK-GS-003] should update single setting parameter
  - **Status:** RED - Method updateGlobalChannelSettings() not implemented
  - **Verifies:** AC2, AC8

- **Test:** [P1][SDK-GS-004] should update multiple setting parameters
  - **Status:** RED - Method updateGlobalChannelSettings() not implemented
  - **Verifies:** AC2, AC8

- **Test:** [P1][SDK-GS-005] should validate Y/N values for boolean fields
  - **Status:** RED - Method not implemented
  - **Verifies:** AC9

- **Test:** [P1][SDK-GS-006] should validate coverImgType as contain or cover
  - **Status:** RED - Method not implemented
  - **Verifies:** AC6

### Service Tests (8 tests)

**File:** `packages/cli/src/services/platform-service.test.ts` (extended)

- **Test:** [P0][SVC-GS-001] should get global channel settings successfully
  - **Status:** RED - Method getGlobalChannelSettings() not implemented
  - **Verifies:** AC1, AC5

- **Test:** [P0][SVC-GS-002] should update global channel settings with valid params
  - **Status:** RED - Method updateGlobalChannelSettings() not implemented
  - **Verifies:** AC2, AC5

- **Test:** [P1][SVC-GS-003] should validate Y/N values for boolean fields
  - **Status:** RED - Method not implemented
  - **Verifies:** AC9

- **Test:** [P1][SVC-GS-004] should validate coverImgType as contain or cover
  - **Status:** RED - Method not implemented
  - **Verifies:** AC6

- **Test:** [P1][SVC-GS-005] should throw validation error for invalid Y/N value
  - **Status:** RED - Method not implemented
  - **Verifies:** AC6, AC9

- **Test:** [P1][SVC-GS-006] should throw validation error for invalid coverImgType
  - **Status:** RED - Method not implemented
  - **Verifies:** AC6

- **Test:** [P1][SVC-GS-007] should handle API errors from getGlobalChannelSettings
  - **Status:** RED - Method not implemented
  - **Verifies:** AC6

- **Test:** [P1][SVC-GS-008] should handle API errors from updateGlobalChannelSettings
  - **Status:** RED - Method not implemented
  - **Verifies:** AC6

### Handler Tests (14 tests)

**File:** `packages/cli/src/handlers/platform.handler.test.ts` (extended)

- **Test:** [P0][HDL-GS-001] should get global settings and display table format
  - **Status:** RED - Method getGlobalSettings() not implemented
  - **Verifies:** AC1, AC7

- **Test:** [P0][HDL-GS-002] should get global settings and output JSON format
  - **Status:** RED - Method getGlobalSettings() not implemented
  - **Verifies:** AC1, AC3

- **Test:** [P0][HDL-GS-003] should update global settings with single parameter
  - **Status:** RED - Method updateGlobalSettings() not implemented
  - **Verifies:** AC2, AC8

- **Test:** [P0][HDL-GS-004] should update global settings with multiple parameters
  - **Status:** RED - Method updateGlobalSettings() not implemented
  - **Verifies:** AC2, AC8

- **Test:** [P0][HDL-GS-005] should update global settings and output JSON format
  - **Status:** RED - Method updateGlobalSettings() not implemented
  - **Verifies:** AC2, AC3

- **Test:** [P1][HDL-GS-006] should display all global setting fields in table
  - **Status:** RED - Method not implemented
  - **Verifies:** AC7

- **Test:** [P1][HDL-GS-007] should throw validation error for invalid Y/N value
  - **Status:** RED - Method not implemented
  - **Verifies:** AC6, AC9

- **Test:** [P1][HDL-GS-008] should throw validation error for invalid coverImgType
  - **Status:** RED - Method not implemented
  - **Verifies:** AC6

- **Test:** [P1][HDL-GS-009] should validate channelConcurrencesEnabled must be Y or N
  - **Status:** RED - Method not implemented
  - **Verifies:** AC6, AC9

- **Test:** [P1][HDL-GS-010] should validate timelyConvertEnabled must be Y or N
  - **Status:** RED - Method not implemented
  - **Verifies:** AC6, AC9

- **Test:** [P1][HDL-GS-011] should validate donateEnabled must be Y or N
  - **Status:** RED - Method not implemented
  - **Verifies:** AC6, AC9

- **Test:** [P1][HDL-GS-012] should throw validation error when no parameters provided for update
  - **Status:** RED - Method not implemented
  - **Verifies:** AC6

- **Test:** [P1][HDL-GS-013] should handle API errors gracefully in getGlobalSettings
  - **Status:** RED - Method not implemented
  - **Verifies:** AC6

- **Test:** [P1][HDL-GS-014] should handle API errors gracefully in updateGlobalSettings
  - **Status:** RED - Method not implemented
  - **Verifies:** AC6

### Command Tests (12 tests)

**File:** `packages/cli/src/commands/platform.commands.test.ts` (extended)

- **Test:** [P0][CMD-GS-001] should register platform setting get subcommand
  - **Status:** RED - Command not registered
  - **Verifies:** AC1

- **Test:** [P0][CMD-GS-002] should register platform setting update subcommand
  - **Status:** RED - Command not registered
  - **Verifies:** AC2

- **Test:** [P1][CMD-GS-003] should register --output option for platform setting get
  - **Status:** RED - Option not registered
  - **Verifies:** AC3

- **Test:** [P1][CMD-GS-004] should register --output option for platform setting update
  - **Status:** RED - Option not registered
  - **Verifies:** AC3

- **Test:** [P1][CMD-GS-005] should register --channel-concurrences-enabled option
  - **Status:** RED - Option not registered
  - **Verifies:** AC2

- **Test:** [P1][CMD-GS-006] should register --timely-convert-enabled option
  - **Status:** RED - Option not registered
  - **Verifies:** AC2

- **Test:** [P1][CMD-GS-007] should register --donate-enabled option
  - **Status:** RED - Option not registered
  - **Verifies:** AC2

- **Test:** [P1][CMD-GS-008] should register --cover-img-type option
  - **Status:** RED - Option not registered
  - **Verifies:** AC2

- **Test:** [P1][CMD-GS-009] should have default output value of "table" for setting get
  - **Status:** RED - Option not registered
  - **Verifies:** AC3

- **Test:** [P1][CMD-GS-010] should have default output value of "table" for setting update
  - **Status:** RED - Option not registered
  - **Verifies:** AC3

- **Test:** [P1][CMD-GS-011] should include setting subcommand in help
  - **Status:** RED - Command not registered
  - **Verifies:** AC1, AC2

- **Test:** [P1][CMD-GS-012] should include available options in setting update help
  - **Status:** RED - Command not registered
  - **Verifies:** AC2

---

## Mock Requirements

### Global Channel Settings API Mock

**GET Endpoint:** `/live/v4/user/global-setting/switch/get`

**Success Response:**
```json
{
  "channelConcurrencesEnabled": "Y",
  "timelyConvertEnabled": "Y",
  "donateEnabled": "N",
  "rebirthAutoUploadEnabled": "N",
  "rebirthAutoConvertEnabled": "N",
  "pptCoveredEnabled": "N",
  "coverImgType": "contain",
  "testModeButtonEnabled": "N"
}
```

**POST Endpoint:** `/live/v4/user/global-setting/switch/update`

**Request Body:**
```json
{
  "channelConcurrencesEnabled": "Y",
  "timelyConvertEnabled": "N",
  "donateEnabled": "Y",
  "coverImgType": "cover"
}
```

**Success Response:**
```json
{
  "code": 200,
  "message": "success"
}
```

---

## Required data-testid Attributes

N/A - This is a CLI application, not a UI.

---

## Implementation Checklist

### Test: [P0][SDK-GS-001] should get global channel settings successfully

**File:** `packages/sdk/src/services/v4/user.service.test.ts`

**Tasks to make this test pass:**

- [ ] Add `GlobalChannelSettings` and `UpdateGlobalChannelSettingsParams` types to `packages/sdk/src/types/v4-user.ts`
- [ ] Add `getGlobalChannelSettings()` method to `V4UserService` in `packages/sdk/src/services/v4/user.service.ts`
- [ ] Method should call `/live/v4/user/global-setting/switch/get` endpoint
- [ ] Run test: `pnpm --filter polyv-live-api-sdk test:unit -- user.service`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: [P0][SDK-GS-002] should update global channel settings successfully

**File:** `packages/sdk/src/services/v4/user.service.test.ts`

**Tasks to make this test pass:**

- [ ] Add `updateGlobalChannelSettings(params)` method to `V4UserService` in `packages/sdk/src/services/v4/user.service.ts`
- [ ] Method should call `/live/v4/user/global-setting/switch/update` endpoint
- [ ] Run test: `pnpm --filter polyv-live-api-sdk test:unit -- user.service`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: [P0][SVC-GS-001] should get global channel settings successfully

**File:** `packages/cli/src/services/platform-service.test.ts`

**Tasks to make this test pass:**

- [ ] Add `getGlobalChannelSettings()` method to `PlatformServiceSdk` in `packages/cli/src/services/platform-service.ts`
- [ ] Method should call SDK's `v4User.getGlobalChannelSettings()`
- [ ] Run test: `pnpm --filter polyv-live-cli test:unit -- platform-service`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hour

---

### Test: [P0][SVC-GS-002] should update global channel settings with valid params

**File:** `packages/cli/src/services/platform-service.test.ts`

**Tasks to make this test pass:**

- [ ] Add `updateGlobalChannelSettings(params)` method to `PlatformServiceSdk`
- [ ] Add Y/N validation for boolean fields
- [ ] Add coverImgType validation (contain/cover)
- [ ] Run test: `pnpm --filter polyv-live-cli test:unit -- platform-service`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hour

---

### Test: [P0][HDL-GS-001] should get global settings and display table format

**File:** `packages/cli/src/handlers/platform.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Add `PlatformSettingGetOptions` and `PlatformSettingUpdateOptions` types to `packages/cli/src/types/platform.ts`
- [ ] Add `getGlobalSettings()` method to `PlatformHandler` in `packages/cli/src/handlers/platform.handler.ts`
- [ ] Implement `displayGlobalSettingsTable()` private method
- [ ] Run test: `pnpm --filter polyv-live-cli test:unit -- platform.handler`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: [P0][HDL-GS-002] should get global settings and output JSON format

**File:** `packages/cli/src/handlers/platform.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Handle `output: 'json'` option in `getGlobalSettings()` method
- [ ] Run test: `pnpm --filter polyv-live-cli test:unit -- platform.handler`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hour

---

### Test: [P0][HDL-GS-003] should update global settings with single parameter

**File:** `packages/cli/src/handlers/platform.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Add `updateGlobalSettings()` method to `PlatformHandler`
- [ ] Implement validation for single parameter update
- [ ] Run test: `pnpm --filter polyv-live-cli test:unit -- platform.handler`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: [P0][HDL-GS-004] should update global settings with multiple parameters

**File:** `packages/cli/src/handlers/platform.handler.test.ts`

**Tasks to make this test pass:**

- [ ] Support multiple parameters in `updateGlobalSettings()` method
- [ ] Run test: `pnpm --filter polyv-live-cli test:unit -- platform.handler`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hour

---

### Test: [P0][CMD-GS-001] should register platform setting get subcommand

**File:** `packages/cli/src/commands/platform.commands.test.ts`

**Tasks to make this test pass:**

- [ ] Add `setting` subcommand group to `platform` command in `packages/cli/src/commands/platform.commands.ts`
- [ ] Add `get` subcommand under `setting`
- [ ] Run test: `pnpm --filter polyv-live-cli test:unit -- platform.commands`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: [P0][CMD-GS-002] should register platform setting update subcommand

**File:** `packages/cli/src/commands/platform.commands.test.ts`

**Tasks to make this test pass:**

- [ ] Add `update` subcommand under `setting`
- [ ] Register all update options (8 parameters)
- [ ] Run test: `pnpm --filter polyv-live-cli test:unit -- platform.commands`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

## Running Tests

```bash
# Run all failing tests for this story
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- platform

# Run SDK tests
pnpm --filter polyv-live-api-sdk test:unit -- user.service

# Run specific test file (handler)
pnpm --filter polyv-live-cli test:unit -- platform.handler

# Run specific test file (commands)
pnpm --filter polyv-live-cli test:unit -- platform.commands

# Run specific test file (service)
pnpm --filter polyv-live-cli test:unit -- platform-service

# Run tests with coverage
pnpm --filter polyv-live-cli test:coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- All tests written and failing
- Mock requirements documented
- Implementation checklist created

**Verification:**

- All tests run and fail as expected
- Failure messages are clear and actionable
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with highest priority)
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist
6. **Move to next test** and repeat

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality**
3. **Ensure tests still pass** after each refactor
4. **Update skill documentation** (SKILL.md and references/platform.md)

---

## Next Steps

1. **Run failing tests** to confirm RED phase: `nvm use 23 && pnpm --filter polyv-live-cli test:unit -- platform`
2. **Begin implementation** using implementation checklist as guide
3. **Work one test at a time** (red -> green for each)
4. **When all tests pass**, run full test suite with coverage: `pnpm --filter polyv-live-cli test:coverage`
5. **Update skill documentation** after implementation

---

## Notes

- **SDK Extension Required:** This story requires NEW SDK methods for `/live/v4/user/global-setting/switch/*` endpoints
- **CLI Option Short Parameter Rule:** Do NOT use `-v` or `-V` to avoid conflict with `--version`
- **Y/N Validation:** All boolean parameters must use uppercase Y or N values only
- **coverImgType Validation:** Must be either "contain" or "cover"

---

**Generated by BMad TEA Agent** - 2026-03-25
