---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode']
lastStep: 'step-02-generation-mode'
lastSaved: '2026-03-23'
storyId: '9-5'
inputDocuments:
  - '_bmad-output/implementation-artifacts/9-5-document-management.md'
---

# ATDD Checklist - Story 9-5: Document Management Commands

## Story Overview

**Title**: 课件文档管理命令 (Document Management Commands)

**User Story**:
> 作为运营人员或 PaaS 客户开发者,
> 我希望通过 CLI 管理直播频道的课件文档,
> 以便上传、查看和删除直播课件。

**Status**: ready-for-dev

---

## Acceptance Criteria

| AC | Description | Test Coverage |
|----|-------------|---------------|
| AC1 | `document list` 命令支持 `--channel-id` 参数获取频道课件列表 | CLI Commands & Handler Tests |
| AC2 | `document list` 命令支持 `--status` 参数过滤文档状态（normal/waitUpload/failUpload/waitConvert/failConvert） | CLI Commands & Handler Tests |
| AC3 | `document list` 命令支持分页参数（`--page`, `--page-size`） | CLI Commands & Handler Tests |
| AC4 | `document upload` 命令支持通过 `--url` 参数上传远程文件 | CLI Commands & Handler Tests |
| AC5 | `document upload` 命令支持 `--type` 参数设置转换类型（common/animate） | CLI Commands & Handler Tests |
| AC6 | `document upload` 命令支持 `--doc-name` 参数设置文档名称 | CLI Commands & Handler Tests |
| AC7 | `document upload` 命令支持 `--callback-url` 参数设置回调地址 | CLI Commands & Handler Tests |
| AC8 | `document delete` 命令支持 `--file-id` 参数删除指定文档 | CLI Commands & Handler Tests |
| AC9 | `document delete` 命令需要确认提示（可通过 `--force` 跳过） | CLI Handler Tests |
| AC10 | `document status` 命令支持查询文档转码状态 | CLI Commands & Handler Tests |
| AC11 | 所有命令支持 `--output` 参数选择 table 或 json 输出格式 | CLI Handler Tests |
| AC12 | 表格输出格式清晰，显示文档信息 | CLI Handler Tests |

---

## Test Files to Create/Update

### 1. CLI Handler Tests
**File**: `packages/cli/src/handlers/document.handler.test.ts`

**Test Cases**:

#### AC1, AC2, AC3: listDocuments method
- [ ] `should call service with channelId`
- [ ] `should pass status parameter to service`
- [ ] `should pass page parameter to service`
- [ ] `should pass pageSize parameter to service`
- [ ] `should display document list in table format by default`
- [ ] `should output full JSON when output is json`
- [ ] `should display friendly message when no documents found`
- [ ] `should validate required channelId`
- [ ] `should handle service errors gracefully`

#### AC4, AC5, AC6, AC7: uploadDocument method
- [ ] `should call service with channelId and url`
- [ ] `should pass type parameter to service`
- [ ] `should pass docName parameter to service`
- [ ] `should pass callbackUrl parameter to service`
- [ ] `should display upload result in table format by default`
- [ ] `should output JSON when output is json`
- [ ] `should validate required channelId`
- [ ] `should validate required url`
- [ ] `should handle service errors gracefully`

#### AC8, AC9: deleteDocument method
- [ ] `should call service with channelId and fileId`
- [ ] `should prompt for confirmation before deletion when force is false`
- [ ] `should throw error in non-TTY environment without force flag`
- [ ] `should cancel operation when user declines confirmation`
- [ ] `should proceed with deletion when user confirms`
- [ ] `should skip confirmation when force flag is true`
- [ ] `should display deletion result in table format by default`
- [ ] `should display deletion result in JSON format when output is json`
- [ ] `should validate required channelId`
- [ ] `should validate required fileId`
- [ ] `should handle document not found error`
- [ ] `should handle service errors gracefully`

#### AC10: getDocumentStatus method
- [ ] `should call service with channelId and fileId`
- [ ] `should display status in table format by default`
- [ ] `should output JSON when output is json`
- [ ] `should handle multiple fileIds (comma-separated)`
- [ ] `should validate required channelId`
- [ ] `should validate required fileId`
- [ ] `should handle service errors gracefully`

### 2. CLI Commands Tests
**File**: `packages/cli/src/commands/document.commands.test.ts`

**Test Cases**:

#### document list command
- [ ] `should have document command group`
- [ ] `should have document list subcommand`
- [ ] `should require --channel-id option`
- [ ] `should have --status option`
- [ ] `should have --page option with default value 1`
- [ ] `should have --page-size option with default value 10`
- [ ] `should have --output option with default value table`
- [ ] `should include examples in help text`

#### document upload command
- [ ] `should have document upload subcommand`
- [ ] `should require --channel-id option`
- [ ] `should require --url option`
- [ ] `should have --type option with default common`
- [ ] `should have --doc-name option`
- [ ] `should have --callback-url option`
- [ ] `should have --output option`
- [ ] `should include examples in help text`

#### document delete command
- [ ] `should have document delete subcommand`
- [ ] `should require --channel-id option`
- [ ] `should require --file-id option`
- [ ] `should have --type option`
- [ ] `should have --force flag with default false`
- [ ] `should have --output option`
- [ ] `should include examples in help text`

#### document status command
- [ ] `should have document status subcommand`
- [ ] `should require --channel-id option`
- [ ] `should require --file-id option`
- [ ] `should have --output option`
- [ ] `should include examples in help text`

### 3. Service SDK Tests
**File**: `packages/cli/src/services/document.service.sdk.test.ts`

**Test Cases**:
- [ ] `should call SDK getDocList with correct parameters`
- [ ] `should transform SDK response to display items`
- [ ] `should call SDK uploadDoc with correct parameters`
- [ ] `should call SDK deleteDoc with correct parameters`
- [ ] `should call SDK getDocConvertStatus with correct parameters`
- [ ] `should validate required parameters`
- [ ] `should handle SDK errors`

---

## Type Definitions Required

**File**: `packages/cli/src/types/document.ts`

```typescript
export interface DocumentServiceConfig {
  baseUrl: string;
  timeout: number;
  debug: boolean;
}

export interface DocumentListOptions {
  channelId: string;
  status?: 'normal' | 'waitUpload' | 'failUpload' | 'waitConvert' | 'failConvert';
  page?: number;
  pageSize?: number;
  output?: 'table' | 'json';
}

export interface DocumentUploadOptions {
  channelId: string;
  url: string;
  type?: 'common' | 'animate';
  docName?: string;
  callbackUrl?: string;
  output?: 'table' | 'json';
}

export interface DocumentDeleteOptions {
  channelId: string;
  fileId: string;
  type?: 'old' | 'new';
  force?: boolean;
  output?: 'table' | 'json';
}

export interface DocumentStatusOptions {
  channelId: string;
  fileId: string;
  output?: 'table' | 'json';
}

export interface DocumentDisplayItem {
  fileId: string;
  fileName: string;
  fileUrl?: string;
  fileType: string;
  totalPage: number;
  channelId?: string;
  status: string;
  createTime: number;
  convertType: string;
  type: string;
}

export interface DocumentUploadResult {
  fileId: string;
  status: string;
  type: string;
}

export interface DocumentStatusItem {
  fileId: string;
  convertStatus: string;
  type: string;
  totalPage: number;
  imageCount: number;
  htmlUrl?: string;
}
```

---

## Service Interface Required

**File**: `packages/cli/src/handlers/document.handler.ts`

```typescript
export interface IDocumentService {
  getDocumentList(options: DocumentListOptions): Promise<{
    contents: DocumentDisplayItem[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }>;
  uploadDocument(channelId: string, options: {
    url: string;
    type?: 'common' | 'animate';
    docName?: string;
    callbackUrl?: string;
  }): Promise<DocumentUploadResult>;
  deleteDocument(channelId: string, fileId: string, type: 'old' | 'new'): Promise<boolean>;
  getDocumentStatus(channelId: string, fileId: string): Promise<DocumentStatusItem[]>;
}
```

---

## Expected CLI Interface

### document list
```bash
polyv-live-cli document list -c <channelId> [options]
```

| Option | Short | Required | Default | Description |
|--------|-------|----------|---------|-------------|
| --channel-id | -c | Yes | - | 频道ID |
| --status | | No | - | 文档状态过滤 |
| --page | | No | 1 | 页码 |
| --page-size | | No | 10 | 每页数量 |
| --output | -o | No | table | 输出格式 |

### document upload
```bash
polyv-live-cli document upload -c <channelId> --url <url> [options]
```

| Option | Short | Required | Default | Description |
|--------|-------|----------|---------|-------------|
| --channel-id | -c | Yes | - | 频道ID |
| --url | | Yes | - | 文件URL |
| --type | | No | common | 转换类型 |
| --doc-name | | No | - | 文档名称 |
| --callback-url | | No | - | 回调地址 |
| --output | -o | No | table | 输出格式 |

### document delete
```bash
polyv-live-cli document delete -c <channelId> --file-id <fileId> [options]
```

| Option | Short | Required | Default | Description |
|--------|-------|----------|---------|-------------|
| --channel-id | -c | Yes | - | 频道ID |
| --file-id | | Yes | - | 文件ID |
| --type | | No | new | 文件类型 |
| --force | | No | false | 跳过确认 |
| --output | -o | No | table | 输出格式 |

### document status
```bash
polyv-live-cli document status -c <channelId> --file-id <fileId> [options]
```

| Option | Short | Required | Default | Description |
|--------|-------|----------|---------|-------------|
| --channel-id | -c | Yes | - | 频道ID |
| --file-id | | Yes | - | 文件ID（多个用逗号分隔） |
| --output | -o | No | table | 输出格式 |

---

## Test Data

### Mock Document List Response
```typescript
const mockDocumentListResponse = {
  pageSize: 10,
  pageNumber: 1,
  totalItems: 2,
  totalPages: 1,
  contents: [
    {
      fileId: 'abc123',
      fileName: '培训课件.pptx',
      fileUrl: 'https://example.com/doc.pptx',
      fileType: '.pptx',
      totalPage: 19,
      channelId: '3151318',
      status: 'normal',
      createTime: 1705286400000,
      convertType: 'common',
      type: 'new',
    },
    {
      fileId: 'def456',
      fileName: '产品手册.pdf',
      fileUrl: 'https://example.com/manual.pdf',
      fileType: '.pdf',
      totalPage: 5,
      channelId: '3151318',
      status: 'waitConvert',
      createTime: 1705372800000,
      convertType: 'common',
      type: 'new',
    },
  ],
};
```

### Mock Upload Response
```typescript
const mockUploadResponse = {
  fileId: 'ghi789',
  status: 'waitConvert',
  type: 'common',
};
```

### Mock Status Response
```typescript
const mockStatusResponse = [
  {
    fileId: 'abc123',
    convertStatus: 'normal',
    type: 'common',
    totalPage: 19,
    imageCount: 19,
    htmlUrl: 'https://example.com/converted.html',
  },
];
```

---

## Implementation Files (Not Tests)

The following files need to be created for implementation:

1. `packages/cli/src/types/document.ts` - Document type definitions
2. `packages/cli/src/services/document.service.sdk.ts` - Document service SDK wrapper
3. `packages/cli/src/handlers/document.handler.ts` - Document command handler
4. `packages/cli/src/commands/document.commands.ts` - Document CLI commands
5. Update `packages/cli/src/index.ts` - Register document commands

---

## Coverage Target

- Handler: >= 80%
- Commands: >= 80%
- Service SDK: >= 80%
- Overall: >= 80%

---

## Dependencies

- SDK Methods in ChannelService (already exists):
  - `client.channel.getDocList(options)`
  - `client.channel.uploadDoc(channelId, options)`
  - `client.channel.deleteDoc(channelId, fileId, type)`
  - `client.channel.getDocConvertStatus(channelId, fileId)`
- Confirmation Utility: `confirmDeletion` from `../utils/confirmation`
- Base Handler: `BaseHandler` from `./base.handler`

---

## Notes

1. Delete command uses "先查询后删除" pattern - fetch document info first to get type (old/new), then delete
2. Document status supports comma-separated fileIds for multiple files
3. Non-TTY environments MUST use `--force` flag for delete
4. Table output should display document status in Chinese (normal -> 正常, waitConvert -> 转换中, etc.)

---

## Running Tests

```bash
# Run all document tests
pnpm --filter polyv-live-cli test:unit -- document

# Run specific test file
pnpm --filter polyv-live-cli test:unit -- document.handler.test.ts
pnpm --filter polyv-live-cli test:unit -- document.commands.test.ts
pnpm --filter polyv-live-cli test:unit -- document.service.sdk.test.ts

# Run with coverage
pnpm --filter polyv-live-cli test:coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**
- [x] All tests written and failing
- [x] Type definitions documented
- [x] Service interface documented
- [x] Implementation checklist created

**Verification:**
- Tests run and fail as expected (after implementation)
- Failure messages are clear and actionable
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with types)
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist
6. **Move to next test** and repeat

**Implementation Order:**
1. Create type definitions (`packages/cli/src/types/document.ts`)
2. Create service SDK (`packages/cli/src/services/document.service.sdk.ts`)
3. Create handler (`packages/cli/src/handlers/document.handler.ts`)
4. Create commands (`packages/cli/src/commands/document.commands.ts`)
5. Register commands in `src/index.ts`

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality**
3. **Ensure tests still pass** after each refactor
4. **Update documentation** if API contracts change

---

**Generated by BMad TEA Agent** - 2026-03-23
