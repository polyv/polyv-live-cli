# ATDD Checklist - Story 14-3: Transmit Management Commands

Story: 14-3-transmit-management
Created: 2026-03-25
Status: red-phase

## Test Files to Create

### 1. Service Test File
- **Path**: `packages/cli/src/services/transmit-service.test.ts`
- **Class**: `TransmitServiceSdk`
- **Methods to Test**:
  - `batchCreateTransmitChannels(channelId: string, names: string[]): Promise<TransmitChannelInfo[]>`
  - `getTransmitAssociations(channelId: string): Promise<TransmitAssociation[]>`

### 2. Handler Test File
- **Path**: `packages/cli/src/handlers/transmit.handler.test.ts`
- **Class**: `TransmitHandler`
- **Methods to Test**:
  - `batchCreateTransmitChannels(options: TransmitCreateOptions): Promise<void>`
  - `getTransmitAssociations(options: TransmitListOptions): Promise<void>`
  - `validateChannelId(channelId: string): void`
  - `validateNames(names: string): void`

### 3. Commands Test File
- **Path**: `packages/cli/src/commands/transmit.commands.test.ts`
- **Functions to Test**:
  - `registerTransmitCommands(program: Command): void`
  - `validateOutputFormat(format: string): string`

## Expected Interfaces

### TransmitServiceSdk
```typescript
class TransmitServiceSdk {
  constructor(authConfig: AuthConfig, config?: TransmitServiceConfig);
  batchCreateTransmitChannels(channelId: string, names: string[]): Promise<TransmitChannelInfo[]>;
  getTransmitAssociations(channelId: string): Promise<TransmitAssociation[]>;
}
```

### TransmitHandler
```typescript
class TransmitHandler extends BaseHandler {
  batchCreateTransmitChannels(options: TransmitCreateOptions): Promise<void>;
  getTransmitAssociations(options: TransmitListOptions): Promise<void>;
}
```

### Command Registration
```typescript
// transmit create --channelId <id> --names "name1,name2" [-o table|json]
// transmit list --channelId <id> [-o table|json]
registerTransmitCommands(program: Command): void
```

## Acceptance Criteria Mapping

| AC # | Description | Test File | Test Cases |
|------|-------------|-----------|------------|
| AC1 | transmit create supports batch creation | transmit.commands.test.ts | should register transmit create subcommand with required options |
| AC1 | transmit create supports batch creation | transmit.handler.test.ts | should call service with parsed names array |
| AC2 | transmit list supports getting associations | transmit.commands.test.ts | should register transmit list subcommand with required options |
| AC2 | transmit list supports getting associations | transmit.handler.test.ts | should call service and display results |
| AC3 | All commands support --output table\|json | transmit.commands.test.ts | should register -o short option for output |
| AC4 | Parameter validation and friendly errors | transmit.handler.test.ts | should validate required channelId |
| AC4 | Parameter validation and friendly errors | transmit.handler.test.ts | should validate names format |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/live/v3/channel/transmit/batch-create` | Batch create transmit channels |
| GET | `/live/v3/channel/transmit/get-associations` | Get transmit associations |

## Test Patterns (Reference: card-push tests)

1. Service tests use mockHttpClient to simulate API responses
2. Handler tests use jest.spyOn for console output verification
3. Command tests verify option registration and action handlers
4. All tests use test.skip() in red phase

## TDD Status

- [ ] Service tests created (red phase - all test.skip)
- [ ] Handler tests created (red phase - all test.skip)
- [ ] Command tests created (red phase - all test.skip)
- [ ] Types exported from types/index.ts
- [ ] Run tests to confirm all fail as expected
