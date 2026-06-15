---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode']
lastStep: 'step-02-generation-mode'
lastSaved: '2026-03-23T10:30:00Z'
storyId: '11-2'
storyName: 'ban-kick-management'
status: 'RED_PHASE_COMPLETE'
inputDocuments:
  - '_bmad-output/implementation-artifacts/11-2-ban-kick-management.md'
  - 'packages/sdk/src/types/chat-banned.ts'
  - 'packages/cli/src/handlers/chat.handler.ts'
  - 'packages/cli/src/handlers/chat.handler.test.ts'
  - 'packages/cli/src/commands/chat.commands.ts'
detectedStack: 'backend'
testFramework: 'jest'
---

# ATDD Checklist for Story 11-2: Ban/Kick Management Commands

## Story Summary

**Story ID:** 11-2
**Story Name:** ban-kick-management
**Status:** ready-for-dev

**As a** 运营人员或 PaaS 客户开发者,
**I want** 通过 CLI 使用 `chat ban`、`chat unban`、`chat kick`、`chat unkick` 等命令管理禁言和踢人,
**So that** 我能够高效地管理直播间观众秩序.

## Stack Detection

- **Detected Stack:** backend (CLI/SDK monorepo with Jest/Vitest)
- **Test Framework:** Jest 29.7.0 for CLI, Vitest for SDK
- **Coverage Target:** 80% functions, lines, statements

## Acceptance Criteria Coverage

### AC1: chat ban command (频道级和账号级)
- [ ] Handler method: `banUser` in ChatHandler
- [ ] Command: `chat ban` with options `--channel-id`, `--user-ids`, `--global`, `--output`
- [ ] Test file: `packages/cli/src/handlers/chat.handler.test.ts`
- [ ] Test file: `packages/cli/src/commands/chat.commands.test.ts`

### AC2: chat unban command
- [ ] Handler method: `unbanUser` in ChatHandler
- [ ] Command: `chat unban` with options `--channel-id`, `--user-ids`, `--global`, `--output`
- [ ] Test file: `packages/cli/src/handlers/chat.handler.test.ts`
- [ ] Test file: `packages/cli/src/commands/chat.commands.test.ts`

### AC3: chat kick command (频道级和全平台)
- [ ] Handler method: `kickUser` in ChatHandler
- [ ] Command: `chat kick` with options `--channel-id`, `--viewer-ids`, `--nick-names`, `--global`, `--output`
- [ ] Test file: `packages/cli/src/handlers/chat.handler.test.ts`
- [ ] Test file: `packages/cli/src/commands/chat.commands.test.ts`

### AC4: chat unkick command
- [ ] Handler method: `unkickUser` in ChatHandler
- [ ] Command: `chat unkick` with options `--channel-id`, `--viewer-ids`, `--nick-names`, `--global`, `--output`
- [ ] Test file: `packages/cli/src/handlers/chat.handler.test.ts`
- [ ] Test file: `packages/cli/src/commands/chat.commands.test.ts`

### AC5: chat banned list command (支持用户/IP/严禁词)
- [ ] Handler method: `listBanned` in ChatHandler
- [ ] Command: `chat banned list` with options `--channel-id`, `--type` (userId|ip|badword), `--output`
- [ ] Test file: `packages/cli/src/handlers/chat.handler.test.ts`
- [ ] Test file: `packages/cli/src/commands/chat.commands.test.ts`

### AC6: chat kicked list command
- [ ] Handler method: `listKicked` in ChatHandler
- [ ] Command: `chat kicked list` with options `--channel-id`, `--output`
- [ ] Test file: `packages/cli/src/handlers/chat.handler.test.ts`
- [ ] Test file: `packages/cli/src/commands/chat.commands.test.ts`

### AC7: Output formats (table/json)
- [ ] All handler methods support `--output table|json`
- [ ] Table format displays clear columns (User ID, Nickname, Status, etc.)
- [ ] JSON format returns structured data

### AC8: ATDD Development Mode
- [ ] Tests written BEFORE implementation
- [ ] All tests initially FAILING (red phase)
- [ ] Implementation makes tests pass (green phase)

### AC9: Reuse SDK ChatService
- [ ] Use existing SDK methods (no new SDK methods needed)
- [ ] ChatHandler uses `ChatServiceSdk` wrapper

### AC10: Error Messages
- [ ] Friendly error messages for parameter validation failures
- [ ] Clear API error handling

### AC11: Table Output Format
- [ ] Clear column headers
- [ ] Displays User ID, Nickname, Ban Status, etc.

## Test File Structure

### Handler Tests (`packages/cli/src/handlers/chat.handler.test.ts`)

```
describe('ChatHandler - Ban/Kick Management (Story 11-2)', () => {
  describe('banUser (AC #1)', () => {
    - should ban users at channel level
    - should ban users globally with --global flag
    - should validate user IDs are required
    - should support both table and json output
    - should handle API errors gracefully
  })

  describe('unbanUser (AC #2)', () => {
    - should unban users at channel level
    - should unban users globally with --global flag
    - should validate user IDs are required
    - should support both table and json output
  })

  describe('kickUser (AC #3)', () => {
    - should kick users at channel level
    - should kick users globally with --global flag
    - should validate viewer IDs and nicknames
    - should support both table and json output
  })

  describe('unkickUser (AC #4)', () => {
    - should unkick users at channel level
    - should unkick users globally with --global flag
    - should validate viewer IDs and nicknames
  })

  describe('listBanned (AC #5)', () => {
    - should list banned users (--type userId)
    - should list banned IPs (--type ip)
    - should list badwords (--type badword)
    - should support both table and json output
  })

  describe('listKicked (AC #6)', () => {
    - should list kicked users
    - should display user ID, nickname, IP, ban status
    - should support both table and json output
  })
})
```

### Command Tests (`packages/cli/src/commands/chat.commands.test.ts`)

```
describe('chat commands - Ban/Kick (Story 11-2)', () => {
  describe('chat ban command', () => {
    - should register with correct options
    - should parse user-ids option
    - should handle --global flag
    - should validate output format
  })

  describe('chat unban command', () => {
    - should register with correct options
    - should parse user-ids option
    - should handle --global flag
  })

  describe('chat kick command', () => {
    - should register with correct options
    - should parse viewer-ids and nick-names
    - should handle --global flag
  })

  describe('chat unkick command', () => {
    - should register with correct options
    - should parse viewer-ids and nick-names
    - should handle --global flag
  })

  describe('chat banned list command', () => {
    - should register with correct options
    - should validate --type option (userId|ip|badword)
  })

  describe('chat kicked list command', () => {
    - should register with correct options
    - should require channel-id
  })
})
```

## Type Definitions Required

New types to be added in `packages/cli/src/types/chat.ts`:

```typescript
// Ban/Kick Options
export interface ChatBanOptions {
  channelId?: string;
  userIds: string[];
  global?: boolean;
  output?: OutputFormat;
}

export interface ChatUnbanOptions {
  channelId?: string;
  userIds: string[];
  global?: boolean;
  output?: OutputFormat;
}

export interface ChatKickOptions {
  channelId?: string;
  viewerIds?: string[];
  nickNames?: string[];
  global?: boolean;
  output?: OutputFormat;
}

export interface ChatUnkickOptions {
  channelId?: string;
  viewerIds?: string[];
  nickNames?: string[];
  global?: boolean;
  output?: OutputFormat;
}

export interface ChatBannedListOptions {
  channelId: string;
  type: 'userId' | 'ip' | 'badword';
  output?: OutputFormat;
}

export interface ChatKickedListOptions {
  channelId: string;
  output?: OutputFormat;
}
```

## SDK Methods to Use (No New Methods Needed)

| CLI Method | SDK Method | API Endpoint |
|-----------|------------|--------------|
| banUser (channel) | `chatService.updateBannedUser({ toBanned: 'Y' })` | POST /live/v3/channel/chat/banned-user |
| banUser (global) | `chatService.updateBannedViewer({ banned: 'Y' })` | POST /live/v3/user/chat/banned-user/update |
| unbanUser (channel) | `chatService.updateBannedUser({ toBanned: 'N' })` | POST /live/v3/channel/chat/banned-user |
| unbanUser (global) | `chatService.updateBannedViewer({ banned: 'N' })` | POST /live/v3/user/chat/banned-user/update |
| kickUser (channel) | `chatService.forbidChannelKickUsers()` | POST /live/v4/chat/channel/forbid/kick-users |
| kickUser (global) | `chatService.forbidKickUsers()` | POST /live/v4/chat/forbid/kick-users |
| unkickUser (channel) | `chatService.forbidChannelUnkickUsers()` | POST /live/v4/chat/channel/forbid/unkick-users |
| unkickUser (global) | `chatService.forbidUnkickUsers()` | POST /live/v4/chat/forbid/unkick-users |
| listBanned (userId) | `chatService.getChannelBannedUserList({ type: 'userId' })` | GET /live/v3/channel/chat/get-banned-list |
| listBanned (ip) | `chatService.getChannelBannedUserList({ type: 'ip' })` | GET /live/v3/channel/chat/get-banned-list |
| listBanned (badword) | `chatService.getChannelBannedList({ type: 'badword' })` | GET /live/v3/channel/badword/list |
| listKicked | `chatService.getChannelKickedUserList()` | POST /live/v3/channel/chat/list-kicked |

## Test Execution Commands

```bash
# Run all chat tests
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- chat

# Run with coverage
pnpm --filter polyv-live-cli test:coverage

# Verify coverage >= 80%
```

## Test Execution Results (RED Phase)

### Handler Tests (`chat.handler.test.ts`)
- **Total tests:** 61
- **Passing:** 32 (existing functionality)
- **Failing:** 29 (new ban/kick functionality - expected in RED phase)
- **Test suites:** 1 failed, 1 total

**New Handler Tests Added (All Failing - Expected):**
- AC #1 (banUser): 6 tests
- AC #2 (unbanUser): 4 tests
- AC #3 (kickUser): 5 tests
- AC #4 (unkickUser): 3 tests
- AC #5 (listBanned): 6 tests
- AC #6 (listKicked): 5 tests

### Command Tests (`chat.commands.test.ts`)
- **Total tests:** 43
- **Passing:** 19 (existing commands)
- **Failing:** 24 (new ban/kick commands - expected in RED phase)
- **Test suites:** 1 failed, 1 total

**New Command Tests Added (All Failing - Expected):**
- chat ban command: 4 tests
- chat unban command: 2 tests
- chat kick command: 3 tests
- chat unkick command: 2 tests
- chat banned list command: 4 tests
- chat kicked list command: 4 tests
- output format validation: 4 tests

### Missing Implementations (Identified by Failing Tests)

**Handler Methods (Not Yet Implemented):**
1. `ChatHandler.banUser()` - Ban users at channel or global level
2. `ChatHandler.unbanUser()` - Unban users at channel or global level
3. `ChatHandler.kickUser()` - Kick users at channel or global level
4. `ChatHandler.unkickUser()` - Unkick users at channel or global level
5. `ChatHandler.listBanned()` - List banned users, IPs, or badwords
6. `ChatHandler.listKicked()` - List kicked users

**CLI Commands (Not Yet Registered):**
1. `chat ban` - Ban users command
2. `chat unban` - Unban users command
3. `chat kick` - Kick users command
4. `chat unkick` - Unkick users command
5. `chat banned list` - List banned items command
6. `chat kicked list` - List kicked users command

**Type Definitions (Not Yet Added):**
1. `ChatBanOptions` - Ban command options
2. `ChatUnbanOptions` - Unban command options
3. `ChatKickOptions` - Kick command options
4. `ChatUnkickOptions` - Unkick command options
5. `ChatBannedListOptions` - Banned list options
6. `ChatKickedListOptions` - Kicked list options

## Next Steps (GREEN Phase)

1. **Implement Type Definitions** (`packages/cli/src/types/chat.ts`)
   - Add all required interfaces for ban/kick options

2. **Implement ChatHandler Methods** (`packages/cli/src/handlers/chat.handler.ts`)
   - Implement `banUser()` method
   - Implement `unbanUser()` method
   - Implement `kickUser()` method
   - Implement `unkickUser()` method
   - Implement `listBanned()` method
   - Implement `listKicked()` method

3. **Register CLI Commands** (`packages/cli/src/commands/chat.commands.ts`)
   - Register `chat ban` command
   - Register `chat unban` command
   - Register `chat kick` command
   - Register `chat unkick` command
   - Register `chat banned list` command
   - Register `chat kicked list` command

4. **Run Tests** (Make tests pass - GREEN phase)
   ```bash
   nvm use 23 && pnpm --filter polyv-live-cli test:unit -- chat
   ```

5. **Verify Coverage**
   ```bash
   pnpm --filter polyv-live-cli test:coverage
   ```
   - Target: >= 80% coverage

## Notes

- All tests are currently failing as expected (TDD RED phase)
- Tests follow existing patterns from Story 11-1 (chat message management)
- No new SDK methods needed - reusing existing `ChatService` methods
- Error handling tests included for all methods
- Table and JSON output format tests included for all methods
