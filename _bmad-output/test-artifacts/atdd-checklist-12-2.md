---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode']
lastStep: 'step-02-generation-mode'
lastSaved: '2026-03-24'
storyId: '12-2'
inputDocuments:
  - '_bmad-output/implementation-artifacts/12-2-viewer-tag-management.md'
  - 'packages/cli/src/handlers/viewer.handler.ts'
  - 'packages/cli/src/handlers/viewer.handler.test.ts'
  - 'packages/cli/src/commands/viewer.commands.ts'
  - 'packages/cli/src/commands/viewer.commands.test.ts'
  - 'packages/cli/src/types/viewer.ts'
  - 'packages/cli/src/services/viewer-service.ts'
  - 'packages/cli/src/services/viewer-service.test.ts'
  - 'packages/sdk/src/types/v4-user.ts'
  - 'packages/sdk/src/services/v4/user.service.ts'
---

# ATDD Checklist: Story 12-2 Viewer Tag Management Commands

## Story Overview

**Story ID:** 12-2
**Title:** Viewer Tag Management Commands
**Status:** Ready for ATDD Red Phase

### Acceptance Criteria (ACs)

| AC | Description |
|----|-------------|
| AC1 | `viewer tag add` command supports adding tags to viewers (batch support) |
| AC2 | `viewer tag remove` command supports removing tags from viewers (batch support) |
| AC3 | `viewer tag list` command supports listing all available tags (pagination + keyword search) |
| AC4 | All commands support `--output table\|json` output format |
| AC5 | Follow ATDD development pattern - tests first, then implementation |
| AC6 | Reuse existing SDK V4 User Service viewer label methods |
| AC7 | Friendly error messages for validation and API failures |
| AC8 | Clear table output format for tag information |

---

## Test File Inventory

### Files to Create/Extend

| File | Type | Status |
|------|------|--------|
| `packages/cli/src/types/viewer.ts` | Extend | Types for tag commands |
| `packages/cli/src/services/viewer-service.ts` | Extend | SDK wrapper for tag methods |
| `packages/cli/src/services/viewer-service.test.ts` | Extend | Service layer tests |
| `packages/cli/src/handlers/viewer.handler.ts` | Extend | Handler methods for tags |
| `packages/cli/src/handlers/viewer.handler.test.ts` | Extend | Handler tests |
| `packages/cli/src/commands/viewer.commands.ts` | Extend | CLI command registration |
| `packages/cli/src/commands/viewer.commands.test.ts` | Extend | Command registration tests |

---

## Type Definitions Required

### File: `packages/cli/src/types/viewer.ts`

```typescript
/**
 * Options for viewer tag add command
 */
export interface ViewerTagAddOptions {
  /** Comma-separated viewer IDs (required) */
  viewerIds: string;
  /** Comma-separated label IDs (required) */
  labelIds: string;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for viewer tag remove command
 */
export interface ViewerTagRemoveOptions {
  /** Comma-separated viewer IDs (required) */
  viewerIds: string;
  /** Comma-separated label IDs (required) */
  labelIds: string;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for viewer tag list command
 */
export interface ViewerTagListOptions {
  /** Keyword search for tag name */
  keyword?: string;
  /** Page number (default: 1) */
  page?: number;
  /** Page size (default: 10, max: 1000) */
  size?: number;
  /** Output format: table or json */
  output?: 'table' | 'json';
}
```

---

## SDK Wrapper Methods Required

### File: `packages/cli/src/services/viewer-service.ts`

```typescript
/**
 * List viewer labels
 * @returns Promise resolving to list of viewer labels
 */
async listViewerLabels(): Promise<ListViewerLabelsResponse>

/**
 * Add viewer label (batch operation)
 * @param viewerUnionIds Array of viewer union IDs
 * @param labelIds Array of label IDs
 */
async addViewersLabels(viewerUnionIds: string[], labelIds: number[]): Promise<void>

/**
 * Remove viewer label (batch operation)
 * @param viewerUnionIds Array of viewer union IDs
 * @param labelIds Array of label IDs
 */
async removeViewersLabels(viewerUnionIds: string[], labelIds: number[]): Promise<void>
```

---

## Handler Methods Required

### File: `packages/cli/src/handlers/viewer.handler.ts`

```typescript
/**
 * List viewer tags
 * @param options Tag list options
 */
async listViewerTags(options: ViewerTagListOptions): Promise<void>

/**
 * Add tags to viewers
 * @param options Tag add options
 */
async addViewerTag(options: ViewerTagAddOptions): Promise<void>

/**
 * Remove tags from viewers
 * @param options Tag remove options
 */
async removeViewerTag(options: ViewerTagRemoveOptions): Promise<void>
```

---

## CLI Commands Required

### File: `packages/cli/src/commands/viewer.commands.ts`

```bash
# viewer tag list
viewer tag list [--keyword <k>] [--page <n>] [--size <n>] [--output table|json]

# viewer tag add
viewer tag add -v <viewer-ids> -l <label-ids> [--output table|json]
viewer tag add --viewer-ids <ids> --label-ids <ids> [--output table|json]

# viewer tag remove
viewer tag remove -v <viewer-ids> -l <label-ids> [--output table|json]
viewer tag remove --viewer-ids <ids> --label-ids <ids> [--output table|json]
```

---

## Test Cases

### Service Layer Tests (ViewerServiceSdk)

| Test ID | Description | AC |
|---------|-------------|-----|
| 12.2-SVC-001 | listViewerLabels calls SDK method | AC3 |
| 12.2-SVC-002 | addViewersLabels calls batch API | AC1 |
| 12.2-SVC-003 | removeViewersLabels calls batch API | AC2 |
| 12.2-SVC-004 | Service wraps SDK errors properly | AC7 |

### Handler Tests (ViewerHandler)

| Test ID | Description | AC |
|---------|-------------|-----|
| 12.2-UNIT-001 | listViewerTags with default pagination | AC3 |
| 12.2-UNIT-002 | listViewerTags with keyword filter | AC3 |
| 12.2-UNIT-003 | listViewerTags with custom pagination | AC3 |
| 12.2-UNIT-004 | listViewerTags JSON output | AC4 |
| 12.2-UNIT-005 | listViewerTags table output | AC8 |
| 12.2-UNIT-006 | addViewerTag single viewer + single label | AC1 |
| 12.2-UNIT-007 | addViewerTag batch (multiple viewers + labels) | AC1 |
| 12.2-UNIT-008 | addViewerTag validates empty viewerIds | AC7 |
| 12.2-UNIT-009 | addViewerTag validates empty labelIds | AC7 |
| 12.2-UNIT-010 | addViewerTag validates invalid label ID format | AC7 |
| 12.2-UNIT-011 | addViewerTag JSON output | AC4 |
| 12.2-UNIT-012 | removeViewerTag single viewer + single label | AC2 |
| 12.2-UNIT-013 | removeViewerTag batch operation | AC2 |
| 12.2-UNIT-014 | removeViewerTag validates empty viewerIds | AC7 |
| 12.2-UNIT-015 | removeViewerTag validates empty labelIds | AC7 |
| 12.2-UNIT-016 | removeViewerTag JSON output | AC4 |
| 12.2-UNIT-017 | API error handling for 401 | AC7 |
| 12.2-UNIT-018 | API error handling for 403 | AC7 |
| 12.2-UNIT-019 | API error handling for 500 | AC7 |
| 12.2-UNIT-020 | Empty list displays "No tags found" | AC8 |

### Command Tests (viewer.commands.ts)

| Test ID | Description | AC |
|---------|-------------|-----|
| 12.2-CMD-001 | Register viewer tag subcommand group | - |
| 12.2-CMD-002 | Register viewer tag list with options | AC3 |
| 12.2-CMD-003 | Register viewer tag add with required options | AC1 |
| 12.2-CMD-004 | Register viewer tag remove with required options | AC2 |
| 12.2-CMD-005 | Short options: -v, -l, -k, -o | - |
| 12.2-CMD-006 | Required options validation for add | AC1 |
| 12.2-CMD-007 | Required options validation for remove | AC2 |

---

## Test Execution Commands

```bash
# Run all viewer tests
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- viewer

# Run with coverage
nvm use 23 && pnpm --filter polyv-live-cli test:coverage
```

---

## Expected RED Phase Failures

All tests in this checklist are expected to FAIL initially because:

1. `ViewerTagAddOptions`, `ViewerTagRemoveOptions`, `ViewerTagListOptions` types do not exist
2. `listViewerLabels`, `addViewersLabels`, `removeViewersLabels` methods do not exist in ViewerServiceSdk
3. `listViewerTags`, `addViewerTag`, `removeViewerTag` methods do not exist in ViewerHandler
4. `viewer tag` subcommand group does not exist

---

## GREEN Phase Implementation Order

1. Add types to `packages/cli/src/types/viewer.ts`
2. Add SDK wrapper methods to `packages/cli/src/services/viewer-service.ts`
3. Add handler methods to `packages/cli/src/handlers/viewer.handler.ts`
4. Add CLI commands to `packages/cli/src/commands/viewer.commands.ts`

---

## Notes

- Story mentions batch APIs but current SDK has single-viewer methods (addViewerLabel, deleteViewerLabelRef)
- Implementation will use loop-based approach if batch APIs not available in SDK
- Table output for tag list: columns = [Label ID, Label Name (truncated to 30 chars)]
