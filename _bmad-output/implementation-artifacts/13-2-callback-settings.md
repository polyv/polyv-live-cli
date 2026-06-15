# Story 13.2: Callback Settings Management Commands

Status: done

## Story

As an administrator or PaaS client developer,
I want to use `platform callback get` and `platform callback update` commands via CLI to manage PolyV callback settings,
so that I can configure and view callback URLs for various live streaming events.

## Acceptance Criteria (ACs)

1. AC1: `platform callback get` command supports retrieving global callback settings
2. AC2: `platform callback update` command supports updating callback URLs for various event types
3. AC3: All commands support `--output table|json` output format
4. AC4: Follow ATDD development pattern - write tests first, then implement functionality
5. AC5: Reuse existing SDK V4UserService callback methods
6. AC6: Error messages are user-friendly, clearly indicating parameter validation failures or API call errors
7. AC7: Table output format is clean and displays key callback configuration fields
8. AC8: Support multiple callback URL parameters in a single update command

## Tasks / Subtasks

- [ ] **Task 1: Create CLI Type Definitions (AC: 1-8)**
  - [ ] In `packages/cli/src/types/platform.ts` add interfaces:
    - `PlatformCallbackGetOptions` - Get callback settings options
    - `PlatformCallbackUpdateOptions` - Update callback settings options
    - `CallbackSettingsData` - Extended callback settings response type
  - [ ] Add callback URL field constants for validation
  - [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- platform`
  - [ ] Tests pass

- [ ] **Task 2: Extend PlatformHandler Class (AC: 1-8)**
  - [ ] In `packages/cli/src/handlers/platform.handler.ts` add methods:
    - [ ] `getCallbackSettings` method - Retrieve callback settings
    - [ ] `updateCallbackSettings` method - Update callback settings
    - [ ] Input validation and output formatting
    - [ ] Table display method for callback settings
  - [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- platform`
  - [ ] Tests pass

- [ ] **Task 3: Extend PlatformServiceSdk (AC: 5)**
  - [ ] In `packages/cli/src/services/platform-service.ts` add methods:
    - [ ] `getCallbackSettings` - Call SDK v4User.getCallback()
    - [ ] `updateCallbackSettings` - Call SDK v4User.updateCallback()
  - [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- platform`
  - [ ] Tests pass

- [ ] **Task 4: Register CLI Commands (AC: 1-5)**
  - [ ] In `packages/cli/src/commands/platform.commands.ts` add commands:
    - [ ] `platform callback get` subcommand
      - Options: `--output` / `-o` (table|json)
    - [ ] `platform callback update` subcommand
      - Options: Multiple callback URL parameters, `--output` / `-o`
  - [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- platform`
  - [ ] Tests pass

- [ ] **Task 5: Unit Tests (All ACs)**
  - [ ] Write tests for `PlatformHandler` callback methods
  - [ ] Test coverage >= 80%
  - [ ] Run: `nvm use 23 && pnpm --filter polyv-live-cli test:unit`
  - [ ] Run coverage report: `pnpm --filter polyv-live-cli test:coverage`
  - [ ] Verify coverage meets requirements

- [ ] **Task 6: Update Skill Documentation (After Development)**
  - [ ] Update `skills/polyv-live-cli/SKILL.md` with callback commands
  - [ ] Update `skills/polyv-live-cli/references/platform.md` with callback details

## Development Notes

### Technical Stack Requirements
[Source: CLAUDE.md, CLAUDE.local.md]
- **TypeScript**: 5.3.3 - Use strict type checking
- **Node.js**: 20.11.0 LTS - Runtime environment
- **Commander.js**: 11.1.0 - CLI framework for command registration
- **Jest**: 29.7.0 - Testing framework

### API Integration Requirements

| CLI Command | SDK Method | API Endpoint | HTTP Method |
|------------|-----------|--------------|-------------|
| `platform callback get` | `v4User.getCallback()` | `/live/v4/user/callback/get` | GET |
| `platform callback update` | `v4User.updateCallback(params)` | `/live/v4/user/callback/update` | POST |

### Authentication
- MD5 signature authentication (appId, timestamp, sign)

### SDK Service

**Existing SDK Methods (V4UserService):**
```typescript
// Get callback settings
async getCallback(): Promise<CallbackSettings>

// Update callback settings
async updateCallback(params: UpdateCallbackParams): Promise<void>
```

**SDK Type Definitions Location:**
- `packages/sdk/src/types/v4-user.ts` - CallbackSettings, UpdateCallbackParams

**SDK Type Details:**

```typescript
// Callback settings response
export interface CallbackSettings {
  url?: string;      // Callback URL
  enabled?: boolean; // Whether enabled
}

// Update callback parameters
export interface UpdateCallbackParams {
  url?: string;      // Callback URL
  enabled?: boolean; // Whether enabled
}
```

**Note:** The current SDK types (`CallbackSettings` and `UpdateCallbackParams`) are simple with only `url` and `enabled` fields. The API documentation shows comprehensive global callback settings with many URL fields. For this story, we will implement using the existing SDK methods. If more detailed callback settings are needed, the SDK types can be extended in a future iteration.

### Coding Standard Requirements
[Source: architecture.md]
- All public methods must have JSDoc comments
- Use explicit TypeScript types, avoid `any` type
- Async operations must have complete error handling
- Follow existing naming conventions (camelCase variables, PascalCase classes)
- Unit test coverage must be >= 80%

### Pattern Reference
Reference existing `PlatformHandler` and `platform.commands.ts` patterns from Story 13-1:
- Handler class extends `BaseHandler`
- SDK wrapper service injected via constructor
- Each method implements input validation, business logic call, output formatting
- Use `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` methods for output

### Command Design

```bash
# ========== Platform Callback Settings Commands ==========

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

### Table Output Design

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

### Error Handling
- URL validation: Must start with `http://` or `https://`
- `--enabled` not Y/N: "enabled must be Y or N"
- API error: Display friendly error message

### Previous Story (13-1) Learnings
1. Handler class calls SDK through SDK wrapper
2. Use `BaseHandler`'s `executeWithErrorHandling` for unified error handling
3. Output formatting uses `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` methods
4. Validation failures throw `PolyVValidationError`
5. Command registration uses Commander.js chaining
6. `loadAuthAndServiceConfig` helper function handles auth configuration
7. **CLI option short parameter rule: Do NOT use `-v` or `-V`** to avoid conflict with `--version`

### Key Implementation Details

1. **Get Callback Settings (`platform callback get`)**
   - Use V4 API `/live/v4/user/callback/get`
   - No additional parameters required
   - SDK method exists: `v4User.getCallback()`
   - Response contains callback URL and enabled status

2. **Update Callback Settings (`platform callback update`)**
   - Use V4 API `/live/v4/user/callback/update`
   - Parameters: `--url` (optional), `--enabled` (optional, Y/N)
   - SDK method exists: `v4User.updateCallback(params)`
   - At least one parameter must be provided

## Test

### Test File Locations
[Source: architecture.md]
- Handler tests: `packages/cli/src/handlers/platform.handler.test.ts`
- Command tests: `packages/cli/src/commands/platform.commands.test.ts`
- Service tests: `packages/cli/src/services/platform-service.test.ts`

### Test Standards
[Source: architecture.md]
- Use Jest 29.7.0 testing framework
- Test naming: `describe-it` pattern with descriptive test names
- Test structure: `Arrange-Act-Assert` pattern
- Mock strategy: Use Jest mocks to simulate SDK responses
- Coverage requirement: Unit test coverage must be >= 80%

### Specific Test Requirements
- **Handler Tests**: Verify business logic, input validation, error handling
  - Test get callback settings
  - Test update callback settings (URL only, enabled only, both)
  - Test table and JSON output formats
  - Test error handling (invalid URL, invalid enabled value)
- **Command Tests**: Verify CLI option parsing and help output
- **Error Scenario Tests**: Verify parameter validation failures, API call failures

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-25 | 1.0 | Initial story creation for callback settings commands | Claude Code Agent |

## File List

### Modified Files
- `packages/cli/src/types/platform.ts` - Add callback-related type definitions
- `packages/cli/src/services/platform-service.ts` - Add callback methods to PlatformServiceSdk
- `packages/cli/src/handlers/platform.handler.ts` - Add callback handler methods
- `packages/cli/src/commands/platform.commands.ts` - Add callback subcommands

### Test Files (ATDD - Created in RED Phase)
- `packages/cli/src/handlers/platform.handler.test.ts` - Add callback handler tests
- `packages/cli/src/commands/platform.commands.test.ts` - Add callback command tests
- `packages/cli/src/services/platform-service.test.ts` - Add callback service tests

## Dev Agent Record

### Agent Model Used
{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
