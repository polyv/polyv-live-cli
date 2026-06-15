# Story 14.4: AI 数字人管理命令

Status: done

## Story

作为运营人员或 PaaS 客户开发者，
我想要通过 CLI 管理AI数字人功能，
以便查看和配置可用的AI数字人，用于直播场景。

## Acceptance Criteria

1. `ai digital-human list` 命令支持列出可用的AI数字人列表，支持分页
2. `ai digital-human list-org` 命令支持查询数字人关联的组织
3. `ai digital-human set-org` 命令支持设置数字人关联的组织
4. 所有命令支持 `--output table|json` 输出格式
5. 参数验证完善，错误消息友好

## Tasks / Subtasks

- [x] Task 1: 创建 TypeScript 类型定义 (AC: #4, #5)
  - [x] 1.1 创建 `packages/cli/src/types/ai-digital-human.ts` 类型文件
  - [x] 1.2 定义 `AIDigitalHumanServiceConfig` 接口
  - [x] 1.3 定义命令选项接口 (`AIDigitalHumanListOptions`, `AIDigitalHumanListOrgOptions`, `AIDigitalHumanSetOrgOptions`)
  - [x] 1.4 定义 API 响应类型 (`AIDigitalHuman`, `AIDigitalHumanOrganization`)
  - [x] 1.5 在 `packages/cli/src/types/index.ts` 中导出新类型

- [x] Task 2: 创建 SDK 服务包装类 (AC: #1-#3)
  - [x] 2.1 创建 `packages/cli/src/services/ai-digital-human-service.ts` 文件
  - [x] 2.2 实现 `AIDigitalHumanServiceSdk` 类
  - [x] 2.3 实现 `listDigitalHumans(pageNumber, pageSize)` 方法 - GET `/live/v4/ai/digital-human/list`
  - [x] 2.4 实现 `listOrganizations(aiDigitalHumanIds)` 方法 - GET `/live/v4/ai/digital-human/list-organization`
  - [x] 2.5 实现 `setOrganizations(params)` 方法 - POST `/live/v4/ai/digital-human/set-organizations`

- [x] Task 3: 创建 Handler 处理器 (AC: #1-#5)
  - [x] 3.1 创建 `packages/cli/src/handlers/ai-digital-human.handler.ts` 文件
  - [x] 3.2 实现 `AIDigitalHumanHandler` 类继承 `BaseHandler`
  - [x] 3.3 实现 `listDigitalHumans(options)` 方法
  - [x] 3.4 实现 `listOrganizations(options)` 方法
  - [x] 3.5 实现 `setOrganizations(options)` 方法
  - [x] 3.6 实现私有验证方法
  - [x] 3.7 实现表格输出格式化方法

- [x] Task 4: 创建命令定义 (AC: #1-#5)
  - [x] 4.1 创建 `packages/cli/src/commands/ai.commands.ts` 文件
  - [x] 4.2 注册 `ai` 父命令
  - [x] 4.3 注册 `ai digital-human` 子命令组
  - [x] 4.4 实现 `ai digital-human list` 子命令
  - [x] 4.5 实现 `ai digital-human list-org` 子命令
  - [x] 4.6 实现 `ai digital-human set-org` 子命令
  - [x] 4.7 在 `packages/cli/src/index.ts` 中注册命令

- [x] Task 5: 编写单元测试 (AC: All)
  - [x] 5.1 创建 `packages/cli/src/services/ai-digital-human-service.test.ts`
  - [x] 5.2 创建 `packages/cli/src/handlers/ai-digital-human.handler.test.ts`
  - [x] 5.3 创建 `packages/cli/src/commands/ai.commands.test.ts`
  - [x] 5.4 运行测试确保覆盖率 >= 80%

- [x] Task 6: 更新 Skill 文档 (AC: All)
  - [x] 6.1 更新 `skills/polyv-live-cli/SKILL.md` 添加 ai 命令说明
  - [x] 6.2 创建 `skills/polyv-live-cli/references/ai-digital-human.md` 详细文档

## Dev Notes

### API 文档参考

| 功能 | API 文档 | HTTP 方法 | 端点 |
|-----|--------|---------|------|
| 列出数字人 | `docs/api/v4/ai/digital-human/list-digital-human.md` | GET | `/live/v4/ai/digital-human/list` |
| 查询数字人组织 | `docs/api/v4/ai/digital-human/list-organization.md` | GET | `/live/v4/ai/digital-human/list-organization` |
| 设置数字人组织 | `docs/api/v4/ai/digital-human/set-organizations.md` | POST | `/live/v4/ai/digital-human/set-organizations` |

### 命令设计

```bash
# 列出AI数字人
polyv-cli ai digital-human list [--page 1] [--size 10] [-o table|json]

# 查询数字人关联的组织
polyv-cli ai digital-human list-org --ids <id1,id2,id3> [-o table|json]

# 设置数字人关联的组织
polyv-cli ai digital-human set-org --config '<json>' [-o table|json]
# 或者交互式输入
polyv-cli ai digital-human set-org --aiDigitalHumanId <id> --organizationIds <id1,id2> [--includeChildren]
```

### 核心类型定义参考

```typescript
// AI数字人信息
interface AIDigitalHuman {
  id: number;                    // 数字人ID
  name: string;                  // 数字人名称
  thirdRoleCode: string;         // 数字人模型ID
  coverPhoto: string;            // 数字人封面图
  fullBodyPhoto: string;         // 数字人全身图
  clothesDesc: string;           // 数字人服装描述
  defaultTtsVoiceId: number;     // 默认使用的声音ID
  createTime: number;            // 创建时间 (13位时间戳)
}

// 数字人组织关联信息
interface AIDigitalHumanOrganization {
  aiDigitalHumanId: number;      // 数字人ID
  organizationIds: number[];     // 组织ID列表
  includeChildren: boolean;      // 是否包含子节点
}

// 分页响应
interface AIDigitalHumanListResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  contents: AIDigitalHuman[];
}

// 设置组织请求参数
interface SetOrganizationParams {
  aiDigitalHumanId: number;
  organizationIds: number[];
  includeChildren?: boolean;
}
```

### 验证规则

1. **pageNumber**: 可选，默认1，必须大于0
2. **pageSize**: 可选，默认10，最大1000
3. **aiDigitalHumanIds**: list-org时必填，逗号分隔的数字人ID，最多100个
4. **config**: set-org时使用JSON数组格式，每项包含 aiDigitalHumanId, organizationIds, includeChildren
5. **output**: 可选，默认 table，必须是 table 或 json

### 项目结构注意事项

- 类型文件放在 `packages/cli/src/types/ai-digital-human.ts`
- Handler 文件使用 `*.handler.ts` 命名约定
- 命令文件使用 `*.commands.ts` 命名约定
- 服务包装类使用 `*-service.ts` 命名约定
- 所有文件使用 TypeScript + kebab-case 文件命名

### 参考已有实现

- 命令模式: `packages/cli/src/commands/transmit.commands.ts` - 多级命令结构
- Handler 参考: `packages/cli/src/handlers/card-push.handler.ts` - 验证和输出模式
- 服务参考: `packages/cli/src/services/transmit-service.ts` - SDK 包装模式

### 测试标准

- 单元测试覆盖率: >= 80%
- 测试框架: Jest
- 测试文件命名: `*.test.ts`
- Mock 外部依赖 (SDK, API 调用)
- 测试成功和失败场景

### References

- [Source: docs/api/v4/ai/digital-human/list-digital-human.md] - 列出数字人 API
- [Source: docs/api/v4/ai/digital-human/list-organization.md] - 查询数字人组织 API
- [Source: docs/api/v4/ai/digital-human/set-organizations.md] - 设置数字人组织 API
- [Source: packages/cli/src/commands/transmit.commands.ts] - 命令模式参考
- [Source: packages/cli/src/handlers/card-push.handler.ts] - Handler 模式参考
- [Source: packages/cli/src/services/transmit-service.ts] - 服务包装模式

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
