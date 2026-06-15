# Quick Start: Story 12-4 Implementation Guide

## Status
✅ ATDD RED PHASE COMPLETE - Tests are failing as expected

## Files to Implement

### 1. Handler (packages/cli/src/handlers/whitelist.handler.ts)
```typescript
import { BaseHandler } from './base.handler';
import { WhitelistServiceSdk } from '../services/whitelist-service';
// ... implement listWhitelist, addWhitelist, updateWhitelist, removeWhitelist
```

### 2. Service (packages/cli/src/services/whitelist-service.ts)
```typescript
import { PolyVClient } from 'polyv-live-api-sdk';
// ... wrap SDK Web Service methods
```

### 3. Commands (packages/cli/src/commands/whitelist.commands.ts)
```typescript
import { Command } from 'commander';
// ... register whitelist list/add/update/remove subcommands
```

## Test Commands

```bash
# Switch to Node 23
. ~/.nvm/nvm.sh && nvm use 23

# Run whitelist tests
pnpm --filter polyv-live-cli test:unit -- whitelist

# Run with coverage
pnpm --filter polyv-live-cli test:coverage

# Run all unit tests
pnpm --filter polyv-live-cli test:unit
```

## Key Points

1. **oldCode Parameter**: Update whitelist requires oldCode (not in SDK type)
2. **Clear All**: Use isClear: 'Y' when --clear flag is set
3. **No -v/-V**: Use -o for output option only
4. **Coverage Target**: 80%+ for functions, lines, statements

## Test Coverage

- Handler tests: 25 tests
- Commands tests: 28 tests  
- Service tests: 9 tests
- **Total: 62 tests**

## Documentation

- Full checklist: `_bmad-output/test-artifacts/atdd-checklist-12-4-whitelist-management.md`
- Summary report: `_bmad-output/test-artifacts/atdd-summary-12-4-whitelist-management.md`
- Story file: `_bmad-output/implementation-artifacts/12-4-whitelist-management.md`
