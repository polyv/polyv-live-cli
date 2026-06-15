# Story 12.2: 观众标签管理命令

Status: done

## 故事

作为一个运营人员或 PaaS 客户开发者，
我想要通过 CLI 使用 `viewer tag add`、`viewer tag remove`、`viewer tag list` 等命令管理观众标签，
以便我能够高效地为观众打标签，实现精细化运营。

## 验收标准 (ACs)

1. AC1: `viewer tag add` 命令支持为指定观众添加标签（支持批量）
2. AC2: `viewer tag remove` 命令支持移除指定观众的标签（支持批量）
3. AC3: `viewer tag list` 命令支持列出所有可用标签（支持分页和关键词搜索）
4. AC4: 所有命令支持 `--output table|json` 输出格式
5. AC5: 遵循 ATDD 开发模式，先编写测试，再实现功能
6. AC6: 复用已有的 SDK V4 User Service 观众标签相关方法
7. AC7: 错误消息友好，清晰提示参数验证失败或 API 调用失败的情况
8. AC8: 表格输出格式清晰，显示标签关键信息

## 任务 / 子任务

- [ ] **任务1: 扩展 CLI 类型定义 (AC: 1-8)**
  - [ ] 在 `packages/cli/src/types/viewer.ts` 中添加接口：
    - `ViewerTagAddOptions` - 添加观众标签选项
    - `ViewerTagRemoveOptions` - 移除观众标签选项
    - `ViewerTagListOptions` - 列出标签选项
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- viewer`
  - [ ] 测试通过

- [ ] **任务2: 扩展 ViewerHandler 类 (AC: 1-8)**
  - [ ] 在 `packages/cli/src/handlers/viewer.handler.ts` 中添加方法：
    - [ ] 实现 `addViewerTag` 方法 - 调用 SDK V4 addViewerLabel
    - [ ] 实现 `removeViewerTag` 方法 - 调用 SDK V4 deleteViewerLabelRef
    - [ ] 实现 `listViewerTags` 方法 - 调用 SDK V4 listViewerLabels
    - [ ] 实现输入验证和输出格式化
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- viewer`
  - [ ] 测试通过

- [ ] **任务3: 扩展 SDK 服务包装器 (AC: 6)**
  - [ ] 在 `packages/cli/src/services/viewer-service.ts` 中添加方法：
    - [ ] 封装 V4 观众标签方法（addViewerLabel, deleteViewerLabelRef, listViewerLabels）
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- viewer`
  - [ ] 测试通过

- [ ] **任务4: 注册 CLI 命令 (AC: 1-4)**
  - [ ] 在 `packages/cli/src/commands/viewer.commands.ts` 中添加子命令：
    - [ ] 实现 `viewer tag add` 子命令
      - 选项: `--viewer-ids` / `-v` (必需，逗号分隔), `--label-ids` / `-l` (必需，逗号分隔), `--output` / `-o`
    - [ ] 实现 `viewer tag remove` 子命令
      - 选项: `--viewer-ids` / `-v` (必需，逗号分隔), `--label-ids` / `-l` (必需，逗号分隔), `--output` / `-o`
    - [ ] 实现 `viewer tag list` 子命令
      - 选项: `--keyword` / `-k`, `--page`, `--size`, `--output` / `-o`
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- viewer`
  - [ ] 测试通过

- [ ] **任务5: 单元测试 (所有AC)**
  - [ ] 扩展 `ViewerHandler` 单元测试
  - [ ] 测试覆盖率达到 80% 以上
  - [ ] 运行: `nvm use 23 && pnpm --filter polyv-live-cli test:unit`
  - [ ] 运行覆盖率报告: `pnpm --filter polyv-live-cli test:coverage`
  - [ ] 验证覆盖率达标

- [ ] **任务6: 更新 Skill 文档 (完成开发后)**
  - [ ] 更新 `skills/polyv-live-cli/references/viewer-management.md` 添加标签命令说明
  - [ ] 如不存在则创建该文件

## 开发注意事项

### 技术栈要求
[来源: CLAUDE.md, CLAUDE.local.md]
- **TypeScript**: 5.3.3 - 使用严格类型检查
- **Node.js**: 20.11.0 LTS - 运行时环境
- **Commander.js**: 11.1.0 - CLI 框架用于命令注册
- **Jest**: 29.7.0 - 测试框架

### API 集成要求

| CLI 命令 | SDK 方法 | API 端点 |
|---------|----------|---------|
| `viewer tag add` | `v4User.addViewerLabel()` | `POST /live/v4/user/viewer-record/label/add` |
| `viewer tag remove` | `v4User.deleteViewerLabelRef()` | `POST /live/v4/user/viewer-record/label/delete-ref` |
| `viewer tag list` | `v4User.listViewerLabels()` | `GET /live/v4/user/viewer-record/label/list` |

### 认证
- MD5 签名认证 (appId, timestamp, sign)

### SDK 服务

**已有 SDK 方法 (V4 UserService):**
```typescript
// 列出观众标签
listViewerLabels(): Promise<ListViewerLabelsResponse>

// 添加观众标签（单个观众）
addViewerLabel(params: AddViewerLabelParams): Promise<void>

// 删除观众标签关联（单个观众）
deleteViewerLabelRef(params: DeleteViewerLabelRefParams): Promise<void>
```

**注意：** API 文档显示支持批量操作：
- 批量添加标签: `POST /live/v4/user/viewer-label/add-viewers-label`
- 批量移除标签: `POST /live/v4/user/viewer-label/remove-viewers-label`

**SDK 类型定义位置:**
- `packages/sdk/src/types/v4-user.ts` - ViewerLabel, AddViewerLabelParams, DeleteViewerLabelRefParams

**SDK 类型详情:**

```typescript
// 观众标签实体
export interface ViewerLabel {
  labelId: number;     // 标签 ID
  labelName: string;   // 标签名称
}

// 列表响应
export interface ListViewerLabelsResponse {
  contents: ViewerLabel[];
}

// 添加标签参数（单个）
export interface AddViewerLabelParams {
  viewerUnionId: string;  // 观众唯一 ID
  labelId: number;        // 标签 ID
}

// 删除标签关联参数（单个）
export interface DeleteViewerLabelRefParams {
  viewerUnionId: string;  // 观众唯一 ID
  labelId: number;        // 标签 ID
}
```

### 批量操作说明

API 支持批量添加/移除观众标签（多个观众 + 多个标签）：
- 请求体: `{ viewerUnionIds: string[], labelIds: number[] }`
- 一次请求可为多个观众同时添加/移除多个标签

**实现策略:**
1. CLI 接收逗号分隔的 viewer-ids 和 label-ids
2. 解析为数组
3. 调用批量 API 或循环调用单个 API

### 编码标准要求
[来源: architecture.md]
- 所有 public 方法必须有 JSDoc 注释
- 使用明确的 TypeScript 类型，避免使用 `any` 类型
- 异步操作必须有完整的错误处理
- 遵循现有的命名约定 (camelCase 变量, PascalCase 类)
- 单元测试覆盖率必须 >= 80%

### 模式参考
参考现有的 `ViewerHandler` 和 `viewer.commands.ts` 模式:
- Handler 类继承 `BaseHandler`
- 通过构造函数注入 SDK wrapper 服务
- 每个方法实现输入验证、业务逻辑调用、输出格式化
- 使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法格式化输出

### 命令设计示例

```bash
# ========== 观众标签管理命令 ==========

# 列出所有标签
polyv-live-cli viewer tag list

# 分页查询标签
polyv-live-cli viewer tag list --page 1 --size 20

# 按关键词搜索标签
polyv-live-cli viewer tag list --keyword "VIP"

# 为单个观众添加单个标签
polyv-live-cli viewer tag add -v "2_v378gn997yovtl3p8h77db9e224t6hg9" -l 1

# 为单个观众添加多个标签
polyv-live-cli viewer tag add -v "2_v378gn997yovtl3p8h77db9e224t6hg9" -l 1,2,3

# 为多个观众批量添加标签
polyv-live-cli viewer tag add -v "viewer1,viewer2,viewer3" -l 1,2

# 移除观众的标签
polyv-live-cli viewer tag remove -v "2_v378gn997yovtl3p8h77db9e224t6hg9" -l 1

# 批量移除
polyv-live-cli viewer tag remove -v "viewer1,viewer2" -l 1,2,3

# JSON 输出格式
polyv-live-cli viewer tag list -o json
polyv-live-cli viewer tag add -v "viewer1" -l 1 -o json
```

### 前一 Story (12-1) 学习要点
1. Handler 类通过 SDK wrapper 调用 SDK
2. 使用 `BaseHandler` 的 `executeWithErrorHandling` 进行统一错误处理
3. 输出格式化使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法
4. 验证失败抛出 `PolyVValidationError`
5. 命令注册使用 Commander.js 的链式调用
6. `loadAuthAndServiceConfig` 辅助函数处理认证配置
7. `truncate` 和 `formatTime` 辅助方法用于格式化输出

### 关键实现细节

1. **列出标签 (`viewer tag list`)**
   - 使用 V4 API `/live/v4/user/viewer-record/label/list`
   - 参数:
     - `keyword`: 关键词搜索 (可选)
     - `pageNumber`: 页码 (可选，默认 1)
     - `pageSize`: 页面大小 (可选，默认 10，最大 1000)
   - SDK 方法已存在: `v4User.listViewerLabels()`
   - 响应包含:
     - `contents`: 标签列表 `[{ id, label }]`
     - `pageNumber`, `pageSize`, `totalPages`, `totalItems`

2. **添加观众标签 (`viewer tag add`)**
   - 使用 V4 API `/live/v4/user/viewer-label/add-viewers-label` (批量)
   - 请求体: `{ viewerUnionIds: string[], labelIds: number[] }`
   - 响应: 成功返回 `{ code: 200, success: true }`

3. **移除观众标签 (`viewer tag remove`)**
   - 使用 V4 API `/live/v4/user/viewer-label/remove-viewers-label` (批量)
   - 请求体: `{ viewerUnionIds: string[], labelIds: number[] }`
   - 响应: 成功返回 `{ code: 200, success: true }`

### 表格输出设计

**viewer tag list 表格:**
| 列名 | 字段 | 说明 |
|-----|------|-----|
| 标签ID | id | - |
| 标签名称 | label | 30字符截断 |

**viewer tag add/remove 成功消息:**
```
Successfully added label(s) [1, 2, 3] to viewer(s) [viewer1, viewer2]
```

### 错误处理
- `viewer-ids` 为空时提示: "观众ID列表 (viewer-ids) 是必需的"
- `label-ids` 为空时提示: "标签ID列表 (label-ids) 是必需的"
- ID 格式错误时提示: "无效的标签ID格式"
- API 返回错误时显示友好的错误消息
- 分页参数验证: pageNumber >= 1, pageSize 1-1000

## 测试

### 测试文件位置
[来源: architecture.md]
- 单元测试: `packages/cli/src/handlers/viewer.handler.test.ts`
- 命令测试: `packages/cli/src/commands/viewer.commands.test.ts`

### 测试标准
[来源: architecture.md]
- 使用 Jest 29.7.0 测试框架
- 测试命名: `describe-it` 模式，描述性测试名称
- 测试结构: `Arrange-Act-Assert` 模式
- Mock 策略: 使用 Jest mocks 模拟 SDK 响应
- 覆盖率要求: 单元测试覆盖率必须 >= 80%

### 具体测试要求
- **Handler 测试**: 验证业务逻辑、输入验证、错误处理
  - 测试列出标签（带分页和关键词搜索）
  - 测试添加观众标签（单个和批量）
  - 测试移除观众标签（单个和批量）
  - 测试表格和 JSON 输出格式
  - 测试错误处理（空 ID 列表、无效格式等）
- **命令测试**: 验证 CLI 选项解析和帮助输出
- **错误场景测试**: 验证参数验证失败、API 调用失败的处理

## 变更日志

| 日期 | 版本 | 描述 | 作者 |
|------|------|------|------|
| 2026-03-24 | 1.0 | Initial story creation for viewer tag management commands | Claude Code Agent |
