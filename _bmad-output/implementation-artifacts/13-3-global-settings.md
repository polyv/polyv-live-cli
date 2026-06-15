# Story 13.3: Global Settings Management Commands

Status: done

## Story

As an administrator or PaaS client developer,
I want to use `platform setting get` and `platform setting update` commands via CLI to manage PolyV global settings,
so that I can configure and view global channel settings such as auto-convert, donation, and player cover settings.

## Acceptance Criteria (ACs)

1. AC1: `platform setting get` command supports retrieving global channel settings
2. AC2: `platform setting update` command supports updating multiple global setting parameters
3. AC3: All commands support `--output table|json` output format
4. AC4: Follow ATDD development pattern - write tests first, then implement functionality
5. AC5: Reuse existing SDK V4UserService global setting methods
6. AC6: Error messages are user-friendly, clearly indicating parameter validation failures or API call errors
7. AC7: Table output format is clean and displays key global setting fields
8. AC8: Support updating multiple global setting parameters in a single update command
9. AC9: All Y/N parameters must use uppercase values (Y or N)

## Tasks / Subtasks

- [ ] **Task 1: Create CLI Type Definitions (AC: 1-9)**
  - [ ] In `packages/cli/src/types/platform.ts` add interfaces:
    - `PlatformSettingGetOptions` - Get global settings options
    - `PlatformSettingUpdateOptions` - Update global settings options
    - `GlobalChannelSettings` - Extended global settings response type
  - [ ] Add global setting field constants for validation
  - [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- platform`
  - [ ] Tests pass

- [ ] **Task 2: Extend PlatformHandler Class (AC: 1-9)**
  - [ ] In `packages/cli/src/handlers/platform.handler.ts` add methods:
    - [ ] `getGlobalSettings` method - Retrieve global channel settings
    - [ ] `updateGlobalSettings` method - Update global channel settings
    - [ ] Input validation and output formatting
    - [ ] Table display method for global settings
  - [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- platform`
  - [ ] Tests pass

- [ ] **Task 3: Extend PlatformServiceSdk (AC: 5)**
  - [ ] In `packages/cli/src/services/platform-service.ts` add methods:
    - [ ] `getGlobalChannelSettings` - Call SDK `/live/v4/user/global-setting/switch/get`
    - [ ] `updateGlobalChannelSettings` - Call SDK `/live/v4/user/global-setting/switch/update`
  - [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- platform`
  - [ ] Tests pass

- [ ] **Task 4: Register CLI Commands (AC: 1-5)**
  - [ ] In `packages/cli/src/commands/platform.commands.ts` add commands:
    - [ ] `platform setting get` subcommand
      - Options: `--output` / `-o` (table|json)
    - [ ] `platform setting update` subcommand
      - Options: Multiple global setting parameters, `--output` / `-o`
  - [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- platform`
  - [ ] Tests pass

- [ ] **Task 5: Unit Tests (All ACs)**
  - [ ] Write tests for `PlatformHandler` global settings methods
  - [ ] Test coverage >= 80%
  - [ ] Run: `nvm use 23 && pnpm --filter polyv-live-cli test:unit`
  - [ ] Run coverage report: `pnpm --filter polyv-live-cli test:coverage`
  - [ ] Verify coverage meets requirements

- [ ] **Task 6: Update Skill Documentation (After Development)**
  - [ ] Update `skills/polyv-live-cli/SKILL.md` with global settings commands
  - [ ] Update `skills/polyv-live-cli/references/platform.md` with global settings details

## Development Notes

### Technical Stack Requirements
[Source: CLAUDE.md, CLAUDE.local.md]
- **TypeScript**: 5.3.3 - Use strict type checking
- **Node.js**: 20.11.0 LTS - Runtime environment
- **Commander.js**: 11.1.0 - CLI framework for command registration
- **Jest**: 29.7.0 - Testing framework

### API Integration Requirements

| CLI Command | API Endpoint | HTTP Method |
|------------|--------------|-------------|
| `platform setting get` | `/live/v4/user/global-setting/switch/get` | GET |
| `platform setting update` | `/live/v4/user/global-setting/switch/update` | POST |

**Note:** These are V4 User APIs under the global-setting path. The SDK's V4UserService currently has `getGlobalSwitch()` and `updateGlobalSwitch()` methods for different endpoints. This story requires NEW SDK methods for the global-setting/switch APIs.

### Authentication
- MD5 signature authentication (appId, timestamp, sign)

### SDK Service

**Existing SDK V4UserService Methods (Reference Only):**
The existing `getGlobalSwitch()` and `updateGlobalSwitch()` methods call different endpoints (`/live/v4/user/global-switch/get`). This story requires implementing NEW methods for the `/live/v4/user/global-setting/switch/*` endpoints.

**New SDK Methods Required in V4UserService:**
```typescript
// Get global channel settings
async getGlobalChannelSettings(): Promise<GlobalChannelSettings>

// Update global channel settings
async updateGlobalChannelSettings(params: UpdateGlobalChannelSettingsParams): Promise<void>
```

**SDK Type Definitions to Add in `packages/sdk/src/types/v4-user.ts`:**
```typescript
// Global channel settings response
export interface GlobalChannelSettings {
  channelConcurrencesEnabled?: string;  // Y/N - Max concurrent viewers switch
  timelyConvertEnabled?: string;         // Y/N - Auto convert switch
  donateEnabled?: string;                // Y/N - Donation switch
  rebirthAutoUploadEnabled?: string;     // Y/N - Rebirth PPT auto-upload switch
  rebirthAutoConvertEnabled?: string;    // Y/N - Rebirth auto-convert switch
  pptCoveredEnabled?: string;            // Y/N - PPT full-screen switch
  coverImgType?: string;                 // contain/cover - Player cover type
  testModeButtonEnabled?: string;        // Y/N - Test mode button switch (update only)
}

// Update global channel settings parameters
export interface UpdateGlobalChannelSettingsParams {
  channelConcurrencesEnabled?: string;
  timelyConvertEnabled?: string;
  donateEnabled?: string;
  rebirthAutoUploadEnabled?: string;
  rebirthAutoConvertEnabled?: string;
  pptCoveredEnabled?: string;
  coverImgType?: string;
  testModeButtonEnabled?: string;
}
```

### Coding Standard Requirements
[Source: architecture.md]
- All public methods must have JSDoc comments
- Use explicit TypeScript types, avoid `any` type
- Async operations must have complete error handling
- Follow existing naming conventions (camelCase variables, PascalCase classes)
- Unit test coverage must be >= 80%

### Pattern Reference
Reference existing `PlatformHandler` and `platform.commands.ts` patterns from Story 13-1 and 13-2:
- Handler class extends `BaseHandler`
- SDK wrapper service injected via constructor
- Each method implements input validation, business logic call, output formatting
- Use `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` methods for output

### Command Design

```bash
# ========== Platform Global Settings Commands ==========

# Get global settings
polyv-live-cli platform setting get

# JSON output format
polyv-live-cli platform setting get -o json

# Update single setting
polyv-live-cli platform setting update --channel-concurrences-enabled Y
polyv-live-cli platform setting update --timely-convert-enabled N
polyv-live-cli platform setting update --donate-enabled Y

# Update cover image type
polyv-live-cli platform setting update --cover-img-type contain
polyv-live-cli platform setting update --cover-img-type cover

# Combined update
polyv-live-cli platform setting update \
  --channel-concurrences-enabled Y \
  --timely-convert-enabled Y \
  --donate-enabled N \
  --cover-img-type contain

# JSON output format
polyv-live-cli platform setting update --donate-enabled Y -o json
```

### CLI Option Names Mapping

| CLI Option | API Field | Type | Values |
|------------|-----------|------|--------|
| `--channel-concurrences-enabled` | channelConcurrencesEnabled | string | Y/N |
| `--timely-convert-enabled` | timelyConvertEnabled | string | Y/N |
| `--donate-enabled` | donateEnabled | string | Y/N |
| `--rebirth-auto-upload-enabled` | rebirthAutoUploadEnabled | string | Y/N |
| `--rebirth-auto-convert-enabled` | rebirthAutoConvertEnabled | string | Y/N |
| `--ppt-covered-enabled` | pptCoveredEnabled | string | Y/N |
| `--cover-img-type` | coverImgType | string | contain/cover |
| `--test-mode-button-enabled` | testModeButtonEnabled | string | Y/N |

### Table Output Design

**platform setting get table:**
| Setting Name | Value |
|--------------|-------|
| Max Concurrent Viewers | Enabled/Disabled |
| Auto Convert | Enabled/Disabled |
| Donation | Enabled/Disabled |
| Rebirth Auto Upload | Enabled/Disabled |
| Rebirth Auto Convert | Enabled/Disabled |
| PPT Full Screen | Enabled/Disabled |
| Cover Image Type | contain/cover |

**platform setting update success message:**
```
Successfully updated global settings.
Max Concurrent Viewers: Enabled
Auto Convert: Disabled
```

### Error Handling
- Y/N validation: "channel-concurrences-enabled must be Y or N"
- cover-img-type validation: "cover-img-type must be contain or cover"
- At least one parameter: "At least one setting parameter is required"
- API error: Display friendly error message

### Previous Story (13-1, 13-2) Learnings
1. Handler class calls SDK through SDK wrapper
2. Use `BaseHandler`'s `executeWithErrorHandling` for unified error handling
3. Output formatting uses `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` methods
4. Validation failures throw `PolyVValidationError`
5. Command registration uses Commander.js chaining
6. `loadAuthAndServiceConfig` helper function handles auth configuration
7. **CLI option short parameter rule: Do NOT use `-v` or `-V`** to avoid conflict with `--version`
8. Y/N parameters must be validated to uppercase values only

### Key Implementation Details

1. **Get Global Settings (`platform setting get`)**
   - Use V4 API `/live/v4/user/global-setting/switch/get`
   - No additional parameters required
   - Need to add new SDK method in V4UserService
   - Response contains multiple Y/N switches and coverImgType

2. **Update Global Settings (`platform setting update`)**
   - Use V4 API `/live/v4/user/global-setting/switch/update`
   - Parameters: Multiple optional settings (see table above)
   - At least one parameter must be provided
   - Need to add new SDK method in V4UserService

3. **SDK Extension Required**
   - Add `getGlobalChannelSettings()` method in V4UserService
   - Add `updateGlobalChannelSettings(params)` method in V4UserService
   - Add type definitions in `v4-user.ts`

## Test

### Test File Locations
[Source: architecture.md]
- Handler tests: `packages/cli/src/handlers/platform.handler.test.ts`
- Command tests: `packages/cli/src/commands/platform.commands.test.ts`
- Service tests: `packages/cli/src/services/platform-service.test.ts`
- SDK tests: `packages/sdk/src/services/v4/user.service.test.ts`

### Test Standards
[Source: architecture.md]
- Use Jest 29.7.0 testing framework
- Test naming: `describe-it` pattern with descriptive test names
- Test structure: `Arrange-Act-Assert` pattern
- Mock strategy: Use Jest mocks to simulate SDK responses
- Coverage requirement: Unit test coverage must be >= 80%

### Specific Test Requirements
- **Handler Tests**: Verify business logic, input validation, error handling
  - Test get global settings
  - Test update global settings (single parameter, multiple parameters)
  - Test table and JSON output formats
  - Test error handling (invalid Y/N value, invalid cover-img-type)
- **Command Tests**: Verify CLI option parsing and help output
- **Error Scenario Tests**: Verify parameter validation failures, API call failures
- **SDK Tests**: Verify new V4UserService methods for global settings

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-25 | 1.0 | Initial story creation for global settings commands | Claude Code Agent |

## File List

### Modified Files
- `packages/sdk/src/types/v4-user.ts` - Add GlobalChannelSettings and UpdateGlobalChannelSettingsParams types
- `packages/sdk/src/services/v4/user.service.ts` - Add getGlobalChannelSettings and updateGlobalChannelSettings methods
- `packages/cli/src/types/platform.ts` - Add global settings-related type definitions
- `packages/cli/src/services/platform-service.ts` - Add global settings methods to PlatformServiceSdk
- `packages/cli/src/handlers/platform.handler.ts` - Add global settings handler methods
- `packages/cli/src/commands/platform.commands.ts` - Add setting subcommands

### Test Files (ATDD - Created in RED Phase)
- `packages/sdk/src/services/v4/user.service.test.ts` - Add global settings SDK tests
- `packages/cli/src/handlers/platform.handler.test.ts` - Add global settings handler tests
- `packages/cli/src/commands/platform.commands.test.ts` - Add global settings command tests
- `packages/cli/src/services/platform-service.test.ts` - Add global settings service tests

## Dev Agent Record

### Agent Model Used
{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
