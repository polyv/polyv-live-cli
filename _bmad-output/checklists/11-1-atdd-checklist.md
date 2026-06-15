# Story 11-1: Chat Message Management Commands - ATDD Checklist

**Status**: red-phase (failing tests created)
**Created**: 2026-03-23
**Story Doc**: `_bmad-output/implementation-artifacts/11-1-chat-message-management.md`

## Overview

This checklist defines the test file paths and expected interfaces for ATDD development of chat message management CLI commands.

**CRITICAL ATDD PRINCIPLE**: Tests define expected interface & behavior. Implementation must make original tests pass. NEVER modify tests to fit implementation!

---

## Test Files to Create

| File Path | Status | Description |
|-----------|--------|-------------|
| `packages/cli/src/types/chat.test.ts` | pending | CLI type definition tests |
| `packages/cli/src/services/chat.service.sdk.test.ts` | pending | SDK wrapper service tests |
| `packages/cli/src/handlers/chat.handler.test.ts` | pending | ChatHandler tests |
| `packages/cli/src/commands/chat.commands.test.ts` | pending | CLI command registration tests |

---

## Expected Interfaces (Test Contracts)

### 1. CLI Types (`packages/cli/src/types/chat.ts`)

```typescript
// ChatSendOptions - Options for chat send command
export interface ChatSendOptions {
  channelId: string;           // REQUIRED
  msg?: string;                // Text message content
  imgUrl?: string;             // Image URL
  pic?: string;                // Avatar URL
  nickName?: string;           // Nickname
  actor?: string;              // Actor/role
  output?: 'table' | 'json';   // Output format
}

// ChatListOptions - Options for chat list command
export interface ChatListOptions {
  channelId: string;           // REQUIRED
  startDay?: string;           // Start date (yyyy-MM-dd)
  endDay?: string;             // End date (yyyy-MM-dd)
  page?: number;               // Page number (default 1)
  size?: number;               // Page size (default 20, max 100)
  userType?: string;           // User type filter
  status?: string;             // Status filter
  output?: 'table' | 'json';   // Output format
}

// ChatDeleteOptions - Options for chat delete command
export interface ChatDeleteOptions {
  channelId: string;           // REQUIRED
  messageId?: string;          // Message ID to delete (required unless clear=true)
  clear?: boolean;             // Clear all messages
  output?: 'table' | 'json';   // Output format
}

// ChatServiceConfig - Service configuration
export interface ChatServiceConfig {
  baseUrl: string;
  timeout: number;
  debug: boolean;
}

// ChatMessageDisplayItem - Display item for table output
export interface ChatMessageDisplayItem {
  id: string;
  content: string;
  sender: string;
  time: string;
  type: string;
}
```

### 2. SDK Wrapper Service (`packages/cli/src/services/chat.service.sdk.ts`)

```typescript
export class ChatServiceSdk {
  constructor(authConfig: AuthConfig, serviceConfig: ChatServiceConfig);

  // Send admin message (text or image)
  async sendAdminMsg(options: ChatSendOptions): Promise<{ success: boolean; messageId?: string }>;

  // Get chat history with pagination
  async getHistoryPage(options: ChatListOptions): Promise<ChatMessageDisplayItem[]>;

  // Delete a single message
  async delChat(options: { channelId: string; messageId: string }): Promise<{ success: boolean }>;

  // Clear all chat messages
  async cleanChat(options: { channelId: string }): Promise<{ success: boolean }>;
}
```

### 3. Handler (`packages/cli/src/handlers/chat.handler.ts`)

```typescript
export class ChatHandler extends BaseHandler {
  constructor(authConfig: AuthConfig, serviceConfig: ChatServiceConfig);

  // Send admin message
  async send(options: ChatSendOptions): Promise<void>;

  // List chat history
  async list(options: ChatListOptions): Promise<void>;

  // Delete message(s)
  async delete(options: ChatDeleteOptions): Promise<void>;
}
```

### 4. Commands (`packages/cli/src/commands/chat.commands.ts`)

```typescript
export function registerChatCommands(program: Command): void;

// Subcommands:
// - chat send    : Send admin chat message
// - chat list    : List chat history with pagination
// - chat delete  : Delete message or clear all

// chat send options:
//   -c, --channel-id <id>     Channel ID (required)
//   -m, --msg <text>          Text message
//   -i, --img-url <url>       Image URL
//   -p, --pic <url>           Avatar URL
//   -n, --nickname <name>     Nickname
//   -a, --actor <role>        Actor/role
//   -o, --output <format>     Output format (table|json)

// chat list options:
//   -c, --channel-id <id>     Channel ID (required)
//   --start-day <date>        Start date (yyyy-MM-dd)
//   --end-day <date>          End date (yyyy-MM-dd)
//   --page <number>           Page number (default 1)
//   --size <number>           Page size (default 20)
//   --user-type <type>        User type filter
//   --status <status>         Status filter
//   -o, --output <format>     Output format (table|json)

// chat delete options:
//   -c, --channel-id <id>     Channel ID (required)
//   -m, --message-id <id>     Message ID to delete
//   --clear                   Clear all messages
//   -o, --output <format>     Output format (table|json)
```

---

## Acceptance Criteria Test Mapping

| AC | Test File | Test Description |
|----|-----------|------------------|
| AC1 | chat.handler.test.ts | chat send command sends admin message (text/image) |
| AC2 | chat.handler.test.ts | chat list command supports pagination and filters |
| AC3 | chat.handler.test.ts | chat delete command deletes single/all messages |
| AC4 | chat.commands.test.ts | all commands support --output table\|json |
| AC5 | all test files | ATDD workflow - tests first, implementation second |
| AC6 | chat.service.sdk.test.ts | ChatServiceSdk wraps SDK ChatService |
| AC7 | chat.handler.test.ts | Friendly error messages for validation/API failures |
| AC8 | chat.handler.test.ts | Table output displays message ID, content, time, sender |

---

## Test Cases Summary

### chat.service.sdk.test.ts
- [ ] Constructor creates SDK client with correct config
- [ ] sendAdminMsg calls SDK with correct params
- [ ] getHistoryPage calls SDK with correct params and transforms response
- [ ] delChat calls SDK with correct params
- [ ] cleanChat calls SDK with correct params
- [ ] Validation errors are thrown with friendly messages
- [ ] API errors are properly handled

### chat.handler.test.ts
- [ ] send() sends text message successfully
- [ ] send() sends image message successfully
- [ ] send() validates required channelId
- [ ] send() validates msg or imgUrl is required
- [ ] list() returns paginated results
- [ ] list() supports date range filtering
- [ ] list() supports user type filtering
- [ ] list() displays empty results gracefully
- [ ] delete() deletes single message with confirmation
- [ ] delete() clears all messages with --clear flag
- [ ] All methods support JSON output
- [ ] Error messages are user-friendly

### chat.commands.test.ts
- [ ] chat command group is registered
- [ ] chat send subcommand with correct options
- [ ] chat list subcommand with correct options
- [ ] chat delete subcommand with correct options
- [ ] All required options are marked
- [ ] Help text includes examples
- [ ] Output format option works

---

## Implementation Order (GREEN Phase)

1. Create types: `packages/cli/src/types/chat.ts`
2. Create SDK wrapper: `packages/cli/src/services/chat.service.sdk.ts`
3. Create handler: `packages/cli/src/handlers/chat.handler.ts`
4. Create commands: `packages/cli/src/commands/chat.commands.ts`
5. Register in `packages/cli/src/index.ts`
6. Update skill files in `skills/polyv-live-cli/`

---

## Files to Register/Update

| File | Action |
|------|--------|
| `packages/cli/src/index.ts` | Add `registerChatCommands(program)` |
| `skills/polyv-live-cli/SKILL.md` | Add chat command section |
| `skills/polyv-live-cli/references/chat-management.md` | Create chat command reference |

---

## Run Tests

```bash
# Run all chat tests
nvm use 23 && pnpm --filter polyv-live-cli test:unit -- chat

# Run with coverage
pnpm --filter polyv-live-cli test:coverage -- chat
```

---

## Checklist Progress

- [ ] Create failing tests (RED phase) - Current
- [ ] Implement types
- [ ] Implement SDK wrapper
- [ ] Implement handler
- [ ] Implement commands
- [ ] Register commands
- [ ] Update skill files
- [ ] All tests pass (GREEN phase)
- [ ] Coverage >= 80%
