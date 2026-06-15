# Story 13.4: Label Management Commands

Status: ready-for-dev

## Story

As an administrator or PaaS client developer,
I want to use `platform label create`, `platform label list`, `platform label delete` commands via CLI,
so that I can classify and organize频道以便更好地管理和直播内容。

## Acceptance Criteria (ACs)

1. AC1: `platform label create` command supports creating a new label
2. AC2: `platform label list` command lists all existing labels with pagination
3. AC3: `platform label delete` command deletes a label by ID with confirmation
4. AC4: All commands support `--output table|json` output format
5. AC5: Follow ATDD development pattern - write tests first, then implement functionality
6. AC6: Reuse existing SDK V4UserService methods
7. AC7: Error messages are user-friendly, clearly indicating parameter validation failures or API call errors
8. AC8: Table output format is clean and displays key label fields
9. AC9: Support updating multiple global setting parameters in a single update command
10. AC10: Use `--force` flag for force delete without confirmation

## Tasks / Subtasks

- [ ] **Task 1: Create CLI Type Definitions (AC: 1-9)**
  - [ ] In `packages/cli/src/types/platform.ts` add interfaces:
    - `PlatformLabelCreateOptions` - Create label options
    - `PlatformLabelListOptions` - List labels options
    - `PlatformLabelDeleteOptions` - Delete label options
  - [ ] Add label field constants for validation
  - [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- platform`
  - [ ] Tests pass

- [ ] **Task 2: Extend PlatformHandler Class (AC: 1-9)**
  - [ ] In `packages/cli/src/handlers/platform.handler.ts` add methods:
    - [ ] `createLabel` method - Create a new label
    - [ ] `listLabels` method - List all labels
    - [ ] `updateLabel` method - Update a label name
    - [ ] `deleteLabel` method - Delete a label by ID
    - [ ] `addChannelLabelRefs` method - Add channels to a label
    - [ ] Input validation and output formatting
    - [ ] Table display method for labels
  - [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- platform`
  - [ ] Tests pass

- [ ] **Task 3: Extend PlatformServiceSdk (AC: 6)**
  - [ ] In `packages/cli/src/services/platform-service.ts` add methods:
    - [ ] `listLabels` - Call SDK `client.v4User.listLabels()`
    - [ ] `createLabel` - Call SDK `client.v4User.createLabel()`
    - [ ] `updateLabel` - Call SDK `client.v4User.updateLabel()`
    - [ ] `deleteLabel` - Call SDK `client.v4User.deleteLabel()`
    - [ ] `addChannelLabelRefs` - Call SDK `client.v4User.addChannelLabelRefs()`
  - [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- platform`
  - [ ] Tests pass

- [ ] **Task 4: Register CLI Commands (AC: 1-5)**
  - [ ] In `packages/cli/src/commands/platform.commands.ts` add commands:
    - [ ] `platform label create` subcommand
      - Options: `--name` (required), `--output` / `-o` (table|json)
    - [ ] `platform label list` subcommand
      - Options: `--output` / `-o` (table|json)
    - [ ] `platform label delete` subcommand
      - Options: `--label-id` (required), `--force`, `-f` / `-y, boolean
      - [ ] `platform label add-channels` subcommand
      - Options: `--label-id` (required), `--channel-ids` (required, comma-separated), `-o` / `-f`, `--output` / `-o` (table|json)
  - [ ] Run tests: `pnpm --filter polyv-live-cli test:unit -- platform`
  - [ ] Tests pass

- [ ] **Task 5: Unit Tests (All ACs)**
  - [ ] Write tests for `PlatformHandler` label methods
  - [ ] Test coverage >= 80%
  - [ ] Run: `nvm use 23 && pnpm --filter polyv-live-cli test:unit`
  - [ ] Run coverage report: `pnpm --filter polyv-live-cli test:coverage`
    - [ ] Verify coverage meets requirements

- [ ] **Task 6: Update Skill Documentation (After Development)**
  - [ ] Update `skills/polyv-live-cli/SKILL.md` with label commands description
  - [ ] Update `skills/polyv-live-cli/references/platform.md` with label management details

## Development Notes

{% comment %}
### Key Implementation Points from Story 13-1, 13-2, and 13-3

1. **Pattern reuse**: This story continues the platform command patterns established in 13-1, 13-2, and 13-3.
   - `PlatformHandler` extends `BaseHandler`
   - SDK wrapper (`PlatformServiceSdk`) injected via constructor
   - `platform.commands.ts` registers subcommands with Commander.js
2. **Command registration**: All subcommands follow the same structure as Story 13-1:
   ```typescript
   platform
     .command('label')
       .command('create')
       .command('list')
       .command('delete')
       .command('add-channels')
   ```
3. **Authentication**: Uses MD5 signature via `PolyVClient`
4. **Output formats**: `table` (default) and `json`
5. **Testing**: Jest with `--testPath` pattern for unit tests

6. **Error handling**: All methods use `executeWithErrorHandling` for unified error processing

### SDK Integration
[Source: `packages/sdk/src/services/v4/user.service.ts`]

The SDK V4UserService already has the following methods that we will use:

| Method | API Endpoint | Description |
|-------|--------------|-------------|
| `listLabels()` | `/live/v4/user/label/list` | Lists all labels |
| `createLabel(params)` | `/live/v4/user/label/create` | Creates a new label |
| `updateLabel(params)` | `/live/v4/user/label/update` | Updates a label name |
| `deleteLabel(params)` | `/live/v4/user/label/delete` | Deletes a label by ID |
| `addChannelLabelRefs(params)` | `/live/v4/user/label/add-channel-refs` | Adds channels to a label |

### Command Design

```bash
# Create a new label
polyv-live-cli platform label create --name "VIP用户"

# List all labels
polyv-live-cli platform label list

# Delete a label (with confirmation)
polyv-live-cli platform label delete --label-id 123

# Force delete (skip confirmation)
polyv-live-cli platform label delete --label-id 123 --force

# Add channels to a label
polyv-live-cli platform label add-channels --label-id 1 --channel-ids 123456,789012

# JSON output
polyv-live-cli platform label list -o json
```

### Test File Locations
- Unit tests: `packages/cli/src/handlers/platform.handler.test.ts`
- Command tests: `packages/cli/src/commands/platform.commands.test.ts`
- Service tests: `packages/cli/src/services/platform-service.test.ts`

### Coding Standards
- All public methods must have JSDoc comments
- Use explicit TypeScript types, avoid `any`
- Async operations must have complete error handling
- Follow existing naming conventions (camelCase variables, PascalCase classes)
- Unit test coverage must be >= 80%

## ATDD Checklist

```
RED Phase (Tests First):
- [ ] Write failing tests for:
  - [ ] `packages/cli/src/handlers/platform.handler.test.ts` - PlatformHandler label methods
  - [ ] `packages/cli/src/commands/platform.commands.test.ts` - CLI command registration
  - [ ] `packages/cli/src/services/platform-service.test.ts` - SDK service wrapper

GREEN Phase (Implementation)
- [ ] Implement all code to make tests pass
  - [ ] `packages/cli/src/handlers/platform.handler.ts`
  - [ ] `packages/cli/src/commands/platform.commands.ts`
  - [ ] `packages/cli/src/services/platform-service.ts`
  - [ ] `packages/cli/src/types/platform.ts`

Coverage Check
- [ ] Run: `nvm use 23 && pnpm --filter polyv-live-cli test:unit`
- [ ] Verify coverage >= 80%
```

## Dev Agent Record

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

