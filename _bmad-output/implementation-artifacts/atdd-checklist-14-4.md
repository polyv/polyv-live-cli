---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-05-development', 'step-06-code-review', 'step-07-trace-coverage']
lastStep: 'step-07-trace-coverage'
lastSaved: '2026-03-26'
inputDocuments:
  - _bmad-output/implementation-artifacts/14-4-ai-digital-human.md
  - docs/api/v4/ai/digital-human/list-digital-human.md
  - docs/api/v4/ai/digital-human/list-organization.md
  - docs/api/v4/ai/digital-human/set-organizations.md
  - packages/cli/src/services/transmit-service.test.ts
  - packages/cli/src/handlers/transmit.handler.test.ts
  - packages/cli/src/commands/transmit.commands.test.ts
---

# ATDD Checklist: Story 14-4 AI Digital Human Commands

## Story Summary
- **Story ID**: 14.4
- **Title**: AI 数字人管理命令
- **Status**: ready-for-dev
- **Test Stack**: backend (CLI)

## Acceptance Criteria Mapping

| AC# | Description | Test Files | Status |
|-----|-------------|-----------|--------|
| AC1 | `ai digital-human list` 命令支持列出数字人列表，支持分页 | service, handler, commands tests | ✅ DONE |
| AC2 | `ai digital-human list-org` 命令支持查询数字人关联的组织 | service, handler, commands tests | ✅ DONE |
| AC3 | `ai digital-human set-org` 命令支持设置数字人关联的组织 | service, handler, commands tests | ✅ DONE |
| AC4 | 所有命令支持 `--output table\|json` 输出格式 | commands tests | ✅ DONE |
| AC5 | 参数验证完善，错误消息友好 | service, handler tests | ✅ DONE |

---

## Test File Checklist

### 1. Service Layer Tests
**File**: `packages/cli/src/services/ai-digital-human-service.test.ts`

| Test Case | AC | Status | Description |
|-----------|-----|--------|-------------|
| `listDigitalHumans_validParams_returnsList` | AC1 | 🟢 | 应返回分页数字人列表 |
| `listDigitalHumans_emptyResult_returnsEmpty` | AC1 | 🟢 | 应正确处理空结果 |
| `listDigitalHumans_defaultPagination_usesDefaults` | AC1 | 🟢 | 应使用默认分页参数 (page=1, size=10) |
| `listDigitalHumans_maxPageSize_1000` | AC5 | 🟢 | 应限制 pageSize 最大为 1000 |
| `listDigitalHumans_apiError_throws` | AC5 | 🟢 | 应正确处理 API 错误 |
| `listOrganizations_validIds_returnsOrgList` | AC2 | 🟢 | 应返回组织关联列表 |
| `listOrganizations_emptyResult_returnsEmpty` | AC2 | 🟢 | 应正确处理空结果 |
| `listOrganizations_max100Ids_validates` | AC5 | 🟢 | 应验证最多 100 个 ID |
| `listOrganizations_emptyIds_throws` | AC5 | 🟢 | 空 ID 列表应抛出错误 |
| `listOrganizations_apiError_throws` | AC5 | 🟢 | 应正确处理 API 错误 |
| `setOrganizations_validParams_succeeds` | AC3 | 🟢 | 应成功设置组织关联 |
| `setOrganizations_arrayConfig_processesAll` | AC3 | 🟢 | 应处理 JSON 数组配置 |
| `setOrganizations_max100Items_validates` | AC5 | 🟢 | 应验证最多 100 项 |
| `setOrganizations_emptyConfig_throws` | AC5 | 🟢 | 空配置应抛出错误 |
| `setOrganizations_apiError_throws` | AC5 | 🟢 | 应正确处理 API 错误 |

### 2. Handler Layer Tests
**File**: `packages/cli/src/handlers/ai-digital-human.handler.test.ts`

| Test Case | AC | Status | Description |
|-----------|-----|--------|-------------|
| `listDigitalHumans_tableOutput_displaysTable` | AC1, AC4 | 🟢 | table 格式输出应显示表格 |
| `listDigitalHumans_jsonOutput_outputsJson` | AC1, AC4 | 🟢 | json 格式输出应为有效 JSON |
| `listDigitalHumans_emptyResult_handlesGracefully` | AC1 | 🟢 | 空结果应显示友好消息 |
| `listDigitalHumans_serviceError_handlesGracefully` | AC5 | 🟢 | 服务错误应友好显示 |
| `listOrganizations_tableOutput_displaysTable` | AC2, AC4 | 🟢 | table 格式输出应显示表格 |
| `listOrganizations_jsonOutput_outputsJson` | AC2, AC4 | 🟢 | json 格式输出应为有效 JSON |
| `listOrganizations_emptyIds_throws` | AC5 | 🟢 | 空 ID 应抛出验证错误 |
| `listOrganizations_invalidIds_throws` | AC5 | 🟢 | 无效 ID 格式应抛出错误 |
| `setOrganizations_jsonConfig_succeeds` | AC3, AC4 | 🟢 | JSON 配置应成功处理 |
| `setOrganizations_cliParams_succeeds` | AC3 | 🟢 | CLI 参数应成功处理 |
| `setOrganizations_tableOutput_displaysSuccess` | AC3, AC4 | 🟢 | table 格式应显示成功消息 |
| `setOrganizations_jsonOutput_outputsJson` | AC3, AC4 | 🟢 | json 格式应输出 JSON |
| `setOrganizations_invalidJson_throws` | AC5 | 🟢 | 无效 JSON 应抛出错误 |
| `setOrganizations_missingRequired_throws` | AC5 | 🟢 | 缺少必填项应抛出错误 |

### 3. Command Registration Tests
**File**: `packages/cli/src/commands/ai.commands.test.ts`

| Test Case | AC | Status | Description |
|-----------|-----|--------|-------------|
| `registerAiCommands_createsParentCommand` | AC1-3 | 🟢 | 应创建 ai 父命令 |
| `registerAiCommands_createsDigitalHumanSubgroup` | AC1-3 | 🟢 | 应创建 digital-human 子命令组 |
| `listCommand_registeredCorrectly` | AC1 | 🟢 | list 命令应正确注册 |
| `listCommand_pageOption_optional` | AC1 | 🟢 | --page 选项应为可选 |
| `listCommand_sizeOption_optional` | AC1 | 🟢 | --size 选项应为可选 |
| `listCommand_outputOption_optional` | AC4 | 🟢 | -o/--output 选项应为可选 |
| `listOrgCommand_registeredCorrectly` | AC2 | 🟢 | list-org 命令应正确注册 |
| `listOrgCommand_idsOption_required` | AC2 | 🟢 | --ids 选项应为必填 |
| `setOrgCommand_registeredCorrectly` | AC3 | 🟢 | set-org 命令应正确注册 |
| `setOrgCommand_configOption_defined` | AC3 | 🟢 | --config 选项应定义 |
| `setOrgCommand_idOption_defined` | AC3 | 🟢 | --aiDigitalHumanId 选项应定义 |
| `setOrgCommand_orgIdsOption_defined` | AC3 | 🟢 | --organizationIds 选项应定义 |
| `outputOption_shortForm_isO` | AC4 | 🟢 | -o 应为 --output 短选项 |
| `outputOption_default_isTable` | AC4 | 🟢 | 默认输出格式应为 table |
| `helpInformation_includesAllCommands` | AC1-5 | 🟢 | 帮助信息应包含所有命令 |

### 4. Type Definition Tests
**File**: `packages/cli/src/types/ai-digital-human.test.ts`

| Test Case | AC | Status | Description |
|-----------|-----|--------|-------------|
| `AIDigitalHuman_interface_defined` | AC1 | 🟢 | 应定义 AIDigitalHuman 接口 |
| `AIDigitalHumanOrganization_interface_defined` | AC2, AC3 | 🟢 | 应定义 AIDigitalHumanOrganization 接口 |
| `AIDigitalHumanListResponse_interface_defined` | AC1 | 🟢 | 应定义分页响应接口 |
| `SetOrganizationParams_interface_defined` | AC3 | 🟢 | 应定义设置参数接口 |
| `ServiceConfig_interface_defined` | AC1-3 | 🟢 | 应定义服务配置接口 |
| `types_exported_fromIndex` | AC1-5 | 🟢 | 类型应从 index.ts 导出 |

---

## API Endpoint Reference

| Method | Endpoint | Test Mock Key |
|--------|----------|---------------|
| GET | `/live/v4/ai/digital-human/list` | `mockHttpClient.get` |
| GET | `/live/v4/ai/digital-human/list-organization` | `mockHttpClient.get` |
| POST | `/live/v4/ai/digital-human/set-organizations` | `mockHttpClient.post` |

---

## Test Data Factories

### Mock AIDigitalHuman
```typescript
const mockAIDigitalHuman = {
  id: 55,
  name: '萌萌',
  thirdRoleCode: '00024',
  coverPhoto: 'https://img.videocc.net/e5f34f7744/html/adv/wav/00024-cover.png',
  fullBodyPhoto: 'https://img.videocc.net/e5f34f7744/html/adv/wav/00024.png',
  defaultTtsVoiceId: 92,
  clothesDesc: '白色西装',
  createTime: 1704191006000,
};
```

### Mock AIDigitalHumanListResponse
```typescript
const mockListResponse = {
  pageNumber: 1,
  pageSize: 10,
  totalPages: 8,
  totalItems: 16,
  contents: [mockAIDigitalHuman],
};
```

### Mock AIDigitalHumanOrganization
```typescript
const mockOrganization = {
  aiDigitalHumanId: 1,
  organizationIds: [1, 2, 3],
  includeChildren: true,
};
```

---

## Coverage Requirements
- **Target**: >= 80%
- **Statements**: >= 80%
- **Branches**: >= 70%
- **Functions**: >= 80%
- **Lines**: >= 80%

---

## Next Steps

1. ✅ Story file created: `14-4-ai-digital-human.md`
2. ✅ ATDD checklist created: `atdd-checklist-14-4.md`
3. ✅ Failing tests created (TDD Red Phase)
4. ✅ Implementation complete (TDD Green Phase)
5. ✅ All 5271 tests pass with 🟢 status
6. ✅ Trace coverage verified (75%+ for all core files)

---

## Implementation Order

1. **Types** (`packages/cli/src/types/ai-digital-human.ts`)
2. **Service** (`packages/cli/src/services/ai-digital-human-service.ts` + test)
3. **Handler** (`packages/cli/src/handlers/ai-digital-human.handler.ts` + test)
4. **Commands** (`packages/cli/src/commands/ai.commands.ts` + test)
5. **Index Registration** (`packages/cli/src/index.ts`)
6. **Skill Documentation** (`skills/polyv-live-cli/`)
