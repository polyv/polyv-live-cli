---
stepsCompleted: ['step-01-preflight-and-context', 'step-04-generate-tests']
lastStep: 'step-04-generate-tests'
lastSaved: '2026-03-25'
workflowType: 'testarch-atdd'
inputDocuments:
  - '_bmad-output/implementation-artifacts/13-2-callback-settings.md'
  - 'packages/cli/src/handlers/platform.handler.ts'
  - 'packages/cli/src/commands/platform.commands.ts'
  - 'packages/cli/src/services/platform-service.ts'
  - 'packages/sdk/src/types/v4-user.ts'
---

# ATDD Checklist - Epic 13, Story 2: Callback Settings Management Commands

**Date:** 2026-03-25
**Author:** Claude Code Agent
**Primary Test Level:** Unit (Jest)

---

## Story Summary

Story 13-2 implements `platform callback get` and `platform callback update` commands for managing PolyV callback settings via CLI. These commands allow administrators to view and configure callback URLs for live streaming event notifications.

**As a** administrator or PaaS client developer
**I want** to use `platform callback get` and `platform callback update` commands via CLI
**So that** I can configure and view callback URLs for various live streaming events

---

## Acceptance Criteria

1. **AC1:** `platform callback get` command supports retrieving global callback settings
2. **AC2:** `platform callback update` command supports updating callback URLs for various event types
3. **AC3:** All commands support `--output table|json` output format
4. **AC4:** Follow ATDD development pattern - write tests first, then implement functionality
5. **AC5:** Reuse existing SDK V4UserService callback methods
6. **AC6:** Error messages are user-friendly, clearly indicating parameter validation failures or API call errors
7. **AC7:** Table output format is clean and displays key callback configuration fields
8. **AC8:** Support multiple callback URL parameters in a single update command

---

## Failing Tests Created (RED Phase)

### Handler Tests (15 tests)

**File:** `packages/cli/src/handlers/platform.handler.test.ts` (appended)

#### getCallbackSettings Tests

- **[P0][HDL-CB-001] should get callback settings and display table format**
  - **Status:** RED - Method does not exist on PlatformHandler
  - **Verifies:** AC1 - getCallbackSettings method retrieves callback settings

- **[P0][HDL-CB-002] should get callback settings and output JSON format**
  - **Status:** RED - Method does not exist on PlatformHandler
  - **Verifies:** AC3 - JSON output format support

- **[P1] should handle API errors gracefully in getCallbackSettings**
  - **Status:** RED - Method does not exist on PlatformHandler
  - **Verifies:** AC6 - Error handling

#### updateCallbackSettings Tests

- **[P0][HDL-CB-003] should update callback settings with URL only**
  - **Status:** RED - Method does not exist on PlatformHandler
  - **Verifies:** AC2 - Update callback URL

- **[P0][HDL-CB-004] should update callback settings with enabled only**
  - **Status:** RED - Method does not exist on PlatformHandler
  - **Verifies:** AC2 - Update enabled status

- **[P0][HDL-CB-005] should update callback settings with both URL and enabled**
  - **Status:** RED - Method does not exist on PlatformHandler
  - **Verifies:** AC8 - Multiple parameters in single update

- **[P0][HDL-CB-006] should update callback settings and output JSON format**
  - **Status:** RED - Method does not exist on PlatformHandler
  - **Verifies:** AC3 - JSON output format for update

- **[P1][HDL-CB-007] should throw validation error for invalid URL format**
  - **Status:** RED - Method does not exist on PlatformHandler
  - **Verifies:** AC6 - URL validation

- **[P1][HDL-CB-008] should throw validation error for invalid enabled value**
  - **Status:** RED - Method does not exist on PlatformHandler
  - **Verifies:** AC6 - Enabled validation

- **[P1][HDL-CB-009] should throw validation error when no parameters provided**
  - **Status:** RED - Method does not exist on PlatformHandler
  - **Verifies:** AC6 - Require at least one parameter

- **[P1] should handle API errors gracefully in updateCallbackSettings**
  - **Status:** RED - Method does not exist on PlatformHandler
  - **Verifies:** AC6 - Error handling

#### Validation Error Messages Tests

- **[P1] should show friendly message for invalid URL**
  - **Status:** RED - Method does not exist on PlatformHandler
  - **Verifies:** AC6 - User-friendly error messages

- **[P1] should show friendly message for invalid enabled value**
  - **Status:** RED - Method does not exist on PlatformHandler
  - **Verifies:** AC6 - User-friendly error messages

- **[P1] should show friendly message when no parameters provided**
  - **Status:** RED - Method does not exist on PlatformHandler
  - **Verifies:** AC6 - User-friendly error messages

### Command Tests (12 tests)

**File:** `packages/cli/src/commands/platform.commands.test.ts` (appended)

- **[P0][CMD-CB-001] should register platform callback get subcommand**
  - **Status:** RED - Command not registered
  - **Verifies:** AC1 - Command availability

- **[P0][CMD-CB-002] should register platform callback update subcommand**
  - **Status:** RED - Command not registered
  - **Verifies:** AC2 - Command availability

- **[P1][CMD-CB-003] should register --output option for platform callback get**
  - **Status:** RED - Command not registered
  - **Verifies:** AC3 - Output format option

- **[P1][CMD-CB-004] should register --output option for platform callback update**
  - **Status:** RED - Command not registered
  - **Verifies:** AC3 - Output format option

- **[P1][CMD-CB-005] should register --url option for platform callback update**
  - **Status:** RED - Command not registered
  - **Verifies:** AC2 - URL parameter option

- **[P1][CMD-CB-006] should register --enabled option for platform callback update**
  - **Status:** RED - Command not registered
  - **Verifies:** AC2 - Enabled parameter option

- **[P1] should have short option -o for --output on platform callback get**
  - **Status:** RED - Command not registered
  - **Verifies:** AC3 - Short option support

- **[P1] should have short option -o for --output on platform callback update**
  - **Status:** RED - Command not registered
  - **Verifies:** AC3 - Short option support

- **[P1] should have default output value of "table" for platform callback get**
  - **Status:** RED - Command not registered
  - **Verifies:** AC3 - Default output format

- **[P1] should have default output value of "table" for platform callback update**
  - **Status:** RED - Command not registered
  - **Verifies:** AC3 - Default output format

- **[P1] should include callback subcommand in help**
  - **Status:** RED - Command not registered
  - **Verifies:** Help documentation

- **[P1] should include available options in callback update help**
  - **Status:** RED - Command not registered
  - **Verifies:** Help documentation

### Service Tests (8 tests)

**File:** `packages/cli/src/services/platform-service.test.ts` (appended)

- **[P0][SVC-CB-001] should get callback settings successfully**
  - **Status:** RED - Method does not exist on PlatformServiceSdk
  - **Verifies:** AC5 - SDK method wrapper

- **[P0][SVC-CB-002] should update callback settings with URL successfully**
  - **Status:** RED - Method does not exist on PlatformServiceSdk
  - **Verifies:** AC5 - SDK method wrapper

- **[P0][SVC-CB-003] should update callback settings with enabled successfully**
  - **Status:** RED - Method does not exist on PlatformServiceSdk
  - **Verifies:** AC5 - SDK method wrapper

- **[P0][SVC-CB-004] should update callback settings with both parameters successfully**
  - **Status:** RED - Method does not exist on PlatformServiceSdk
  - **Verifies:** AC5, AC8 - Multiple parameters

- **[P1][SVC-CB-005] should throw validation error for invalid URL format**
  - **Status:** RED - Method does not exist on PlatformServiceSdk
  - **Verifies:** AC6 - URL validation

- **[P1][SVC-CB-006] should throw validation error for invalid enabled value**
  - **Status:** RED - Method does not exist on PlatformServiceSdk
  - **Verifies:** AC6 - Enabled validation

- **[P1][SVC-CB-007] should throw validation error when no parameters provided**
  - **Status:** RED - Method does not exist on PlatformServiceSdk
  - **Verifies:** AC6 - Parameter requirement

- **[P1] should handle API errors from getCallbackSettings**
  - **Status:** RED - Method does not exist on PlatformServiceSdk
  - **Verifies:** AC6 - Error handling

---

## Type Definitions Required

**File:** `packages/cli/src/types/platform.ts` (to be extended)

```typescript
/**
 * Options for platform callback get command
 */
export interface PlatformCallbackGetOptions {
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for platform callback update command
 */
export interface PlatformCallbackUpdateOptions {
  /** Callback URL (must start with http:// or https://) */
  url?: string;
  /** Enable status (Y or N) */
  enabled?: EnabledValue;
  /** Output format (table or json) */
  output?: OutputFormat;
}
```

---

## Mock Requirements

### SDK Callback Mock

**Method:** `client.v4User.getCallback()`
**Success Response:**
```typescript
{
  url: 'https://example.com/callback',
  enabled: true
}
```

**Method:** `client.v4User.updateCallback(params)`
**Parameters:**
```typescript
{
  url?: string,
  enabled?: boolean
}
```
**Success Response:** void

---

## Implementation Checklist

### Task 1: Create CLI Type Definitions

**File:** `packages/cli/src/types/platform.ts`

**Tasks to make tests pass:**
- [ ] Add `PlatformCallbackGetOptions` interface
- [ ] Add `PlatformCallbackUpdateOptions` interface
- [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- platform`
- [ ] Tests pass

**Estimated Effort:** 0.5 hours

---

### Task 2: Extend PlatformServiceSdk

**File:** `packages/cli/src/services/platform-service.ts`

**Tasks to make tests pass:**
- [ ] Add `getCallbackSettings()` method - call SDK `v4User.getCallback()`
- [ ] Add `updateCallbackSettings(params)` method - call SDK `v4User.updateCallback(params)`
- [ ] Add URL validation (must start with http:// or https://)
- [ ] Add enabled validation (Y/N conversion to boolean)
- [ ] Add validation for at least one parameter required
- [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- platform-service`
- [ ] Tests pass

**Estimated Effort:** 1 hour

---

### Task 3: Extend PlatformHandler

**File:** `packages/cli/src/handlers/platform.handler.ts`

**Tasks to make tests pass:**
- [ ] Add `getCallbackSettings(options)` method
- [ ] Add `updateCallbackSettings(options)` method
- [ ] Add `displayCallbackSettingsTable(data)` private method
- [ ] Add input validation (URL format, enabled Y/N, at least one param)
- [ ] Handle output formatting (table/json)
- [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- platform.handler`
- [ ] Tests pass

**Estimated Effort:** 1.5 hours

---

### Task 4: Register CLI Commands

**File:** `packages/cli/src/commands/platform.commands.ts`

**Tasks to make tests pass:**
- [ ] Create `platform callback` command group
- [ ] Register `platform callback get` subcommand with --output/-o option
- [ ] Register `platform callback update` subcommand with --url, --enabled, --output/-o options
- [ ] Add help text for both commands
- [ ] Add `validateUrlFormat` function for URL validation
- [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- platform.commands`
- [ ] Tests pass

**Estimated Effort:** 1 hour

---

## Running Tests

```bash
# Run all platform tests
pnpm --filter polyv-live-cli test:unit -- platform

# Run specific test file
pnpm --filter polyv-live-cli test:unit -- platform.handler.test.ts
pnpm --filter polyv-live-cli test:unit -- platform.commands.test.ts
pnpm --filter polyv-live-cli test:unit -- platform-service.test.ts

# Run tests with coverage
pnpm --filter polyv-live-cli test:coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

- All handler tests written and failing
- All command tests written and failing
- All service tests written and failing
- Type definitions documented
- Mock requirements documented
- Implementation checklist created

### GREEN Phase (DEV Team - Next Steps)

1. Pick one failing test from implementation checklist (start with types, then service, then handler, then commands)
2. Read the test to understand expected behavior
3. Implement minimal code to make that specific test pass
4. Run the test to verify it now passes (green)
5. Check off the task in implementation checklist
6. Move to next test and repeat

### REFACTOR Phase (DEV Team - After All Tests Pass)

1. Verify all tests pass (green phase complete)
2. Review code for quality
3. Extract duplications (DRY principle)
4. Ensure tests still pass after each refactor

---

## Command Design Reference

```bash
# Get callback settings
polyv-live-cli platform callback get

# JSON output format
polyv-live-cli platform callback get -o json

# Update callback URL
polyv-live-cli platform callback update --url https://example.com/callback

# Enable/disable callback
polyv-live-cli platform callback update --enabled Y
polyv-live-cli platform callback update --enabled N

# Combined update
polyv-live-cli platform callback update --url https://example.com/new-callback --enabled Y

# JSON output format
polyv-live-cli platform callback update --url https://example.com/callback -o json
```

---

## Table Output Design

**platform callback get table:**
| Field | Value |
|-------|-------|
| Callback URL | url |
| Enabled | Yes/No |

**platform callback update success message:**
```
Successfully updated callback settings.
Callback URL: https://example.com/callback
Enabled: Yes
```

---

## Notes

- The SDK types (`CallbackSettings` and `UpdateCallbackParams`) are simple with only `url` and `enabled` fields
- CLI uses Y/N for enabled while SDK uses boolean (conversion required)
- At least one parameter must be provided for update command
- URL must start with `http://` or `https://`
- **CLI option short parameter rule:** Do NOT use `-v` or `-V` to avoid conflict with `--version`

---

**Generated by BMad TEA Agent** - 2026-03-25
