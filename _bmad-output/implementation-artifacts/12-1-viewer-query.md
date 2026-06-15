# Story 12.1: 观众信息查询命令

Status: done

## 故事

作为一个运营人员或 PaaS 客户开发者，
我想要通过 CLI 使用 `viewer get`、`viewer list` 等命令查询观众信息，
以便我能够高效地管理直播间观众数据。

## 验收标准 (ACs)

1. AC1: `viewer get` 命令支持获取单个观众详情（V4 API）
2. AC2: `viewer list` 命令支持分页查询观众列表（V4 API）
3. AC3: `viewer list` 命令支持按来源、手机号、邮箱、地址等条件过滤
4. AC4: 所有命令支持 `--output table|json` 输出格式
5. AC5: 遵循 ATDD 开发模式，先编写测试，再实现功能
6. AC6: 复用已有的 SDK V4 User Service 观众相关方法
7. AC7: 错误消息友好，清晰提示参数验证失败或 API 调用失败的情况
8. AC8: 表格输出格式清晰，显示观众关键信息

## 任务 / 子任务

- [x] **任务1: 创建 CLI 类型定义 (AC: 1-8)**
  - [x] 在 `packages/cli/src/types/viewer.ts` 中创建接口：
    - `ViewerGetOptions` - 获取观众详情选项
    - `ViewerListOptions` - 列出观众列表选项
    - `ViewerServiceConfig` - 服务配置
  - [x] 运行测试: `pnpm --filter polyv-live-cli test:unit -- viewer`
  - [x] 测试通过

- [x] **任务2: 创建 ViewerHandler 类 (AC: 1-8)**
  - [x] 在 `packages/cli/src/handlers/viewer.handler.ts` 中创建 Handler：
    - [x] 实现 `getViewer` 方法 - 调用 SDK V4 getViewerRecord
    - [x] 实现 `listViewers` 方法 - 调用 SDK V4 listViewerRecords
    - [x] 实现输入验证和输出格式化
  - [x] 继承 `BaseHandler` 基类
  - [x] 运行测试: `pnpm --filter polyv-live-cli test:unit -- viewer`
  - [x] 测试通过

- [x] **任务3: 创建 SDK 服务包装器 (AC: 6)**
  - [x] 在 `packages/cli/src/services/viewer-service.ts` 中创建 `ViewerServiceSdk`:
    - [x] 封装 V4 观众查询方法（getViewerRecord, listViewerRecords）
  - [x] 运行测试: `pnpm --filter polyv-live-cli test:unit -- viewer`
  - [x] 测试通过

- [x] **任务4: 注册 CLI 命令 (AC: 1-4)**
  - [x] 在 `packages/cli/src/commands/viewer.commands.ts` 中创建命令：
    - [x] 实现 `viewer get` 子命令
      - 选项: `--viewer-id` / `-v` (必需), `--output` / `-o`
    - [x] 实现 `viewer list` 子命令
      - 选项: `--source`, `--mobile`, `--email`, `--area`, `--page`, `--size`, `--output` / `-o`
  - [x] 在 `src/index.ts` 中注册命令
  - [x] 运行测试: `pnpm --filter polyv-live-cli test:unit -- viewer`
  - [x] 测试通过

- [x] **任务5: 单元测试 (所有AC)**
  - [x] 为 `ViewerHandler` 编写单元测试
  - [x] 测试覆盖率达到 80% 以上
  - [x] 运行: `nvm use 23 && pnpm --filter polyv-live-cli test:unit`
  - [x] 运行覆盖率报告: `pnpm --filter polyv-live-cli test:coverage`
  - [x] 验证覆盖率达标

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
| `viewer get` | `v4User.getViewerRecord()` | `GET /live/v4/user/viewer-record/get` |
| `viewer list` | `v4User.listViewerRecords()` | `GET /live/v4/user/viewer-record/list` |

### 认证
- MD5 签名认证 (appId, timestamp, sign)

### SDK 服务

**已有 SDK 方法 (V4 UserService):**
```typescript
// 列出观众记录
listViewerRecords(params: ListViewerRecordsParams): Promise<ListViewerRecordsResponse>

// 获取观众详情
getViewerRecord(params: GetViewerRecordParams): Promise<ViewerRecord>
```

**SDK 类型定义位置:**
- `packages/sdk/src/types/v4-user.ts` - ViewerRecord, ListViewerRecordsParams, GetViewerRecordParams

**SDK 类型详情:**

```typescript
// 观众来源类型
export type ViewerSource = 'IMPORT' | 'WX' | 'MOBILE';

// 观众记录实体
export interface ViewerRecord {
  viewerUnionId: string;      // 观众唯一 ID
  nickname: string;           // 昵称
  mobile: string;             // 手机号
  source?: ViewerSource;      // 来源类型
  name?: string;              // 采集姓名
  email?: string;             // 邮箱
  area?: string;              // 地址
  watchDuration?: number;     // 观看时长
  watchChannelCount?: number; // 观看频道数
  createTime?: number;        // 创建时间
}

// 列表查询参数
export interface ListViewerRecordsParams extends UserPaginationParams {
  source?: ViewerSource;   // 按来源过滤
  mobile?: string;         // 按手机号过滤
  email?: string;          // 按邮箱过滤
  area?: string;           // 按地址过滤
}

// 获取详情参数
export interface GetViewerRecordParams {
  viewerUnionId: string;   // 观众 ID (必需)
}

// 分页响应
export interface ListViewerRecordsResponse extends UserPaginatedResponse<ViewerRecord> {}
```

### 编码标准要求
[来源: architecture.md]
- 所有 public 方法必须有 JSDoc 注释
- 使用明确的 TypeScript 类型，避免使用 `any` 类型
- 异步操作必须有完整的错误处理
- 遵循现有的命名约定 (camelCase 变量, PascalCase 类)
- 单元测试覆盖率必须 >= 80%

### 模式参考
参考现有的 `DonateHandler` 和 `donate.commands.ts` 模式:
- Handler 类继承 `BaseHandler`
- 通过构造函数注入 SDK wrapper 服务
- 每个方法实现输入验证、业务逻辑调用、输出格式化
- 使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法格式化输出

### 命令设计示例

```bash
# ========== 观众信息查询命令 ==========

# 获取单个观众详情
polyv-live-cli viewer get -v "2_v378gn997yovtl3p8h77db9e224t6hg9"

# 获取观众详情（JSON 输出）
polyv-live-cli viewer get -v "2_v378gn997yovtl3p8h77db9e224t6hg9" -o json

# 列出所有观众（默认分页）
polyv-live-cli viewer list

# 分页查询观众列表
polyv-live-cli viewer list --page 1 --size 20

# 按来源过滤
polyv-live-cli viewer list --source IMPORT
polyv-live-cli viewer list --source WX
polyv-live-cli viewer list --source MOBILE

# 按手机号过滤
polyv-live-cli viewer list --mobile "13800138000"

# 按邮箱过滤
polyv-live-cli viewer list --email "user@example.com"

# 按地址过滤
polyv-live-cli viewer list --area "北京"

# 组合过滤条件
polyv-live-cli viewer list --source IMPORT --page 1 --size 50 -o json

# JSON 输出格式
polyv-live-cli viewer list --source WX -o json
```

### 建议参考文档
- API 文档: `docs/api/v4/user/viewerrecord/get.md` (查询观众详情)
- API 文档: `docs/api/v4/user/viewerrecord/list.md` (获取观众列表)
- SDK 服务: `packages/sdk/src/services/v4/user.service.ts`
- SDK 类型: `packages/sdk/src/types/v4-user.ts`
- 前一 Story 实现: `_bmad-output/implementation-artifacts/11-6-donate-management.md`

### 前一 Story (11-6) 学习要点
1. Handler 类通过 SDK wrapper 调用 SDK
2. 使用 `BaseHandler` 的 `executeWithErrorHandling` 进行统一错误处理
3. 输出格式化使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法
4. 验证失败抛出 `PolyVValidationError`
5. 命令注册使用 Commander.js 的链式调用
6. `loadAuthAndServiceConfig` 辅助函数处理认证配置

### 关键实现细节

1. **获取观众详情 (`viewer get`)**
   - 使用 V4 API `/live/v4/user/viewer-record/get`
   - 参数: `viewerUnionId` (必需)
   - SDK 方法已存在: `v4User.getViewerRecord({ viewerUnionId })`
   - 响应包含:
     - `viewerUnionId`: 观众唯一 ID
     - `nickname`: 昵称
     - `mobile`: 手机号
     - `source`: 来源 (IMPORT/WX/MOBILE)
     - `name`: 采集姓名
     - `email`: 邮箱
     - `area`: 地址
     - `watchDuration`: 观看时长
     - `watchChannelCount`: 观看频道数
     - `createTime`: 创建时间
     - `labels`: 标签数组 (可选)

2. **列出观众列表 (`viewer list`)**
   - 使用 V4 API `/live/v4/user/viewer-record/list`
   - 参数:
     - `pageNumber`: 页码 (可选，默认 1)
     - `pageSize`: 页面大小 (可选，默认 10，最大 1000)
     - `source`: 来源过滤 (可选，IMPORT/WX/MOBILE)
     - `mobile`: 手机号过滤 (可选)
     - `email`: 邮箱过滤 (可选)
     - `area`: 地址过滤 (可选)
   - SDK 方法已存在: `v4User.listViewerRecords(params)`
   - 响应包含:
     - `pageNumber`: 当前页码
     - `pageSize`: 分页大小
     - `totalPages`: 总页数
     - `totalItems`: 总记录数
     - `contents`: 观众列表

### 表格输出设计

**viewer get 表格:**
| 字段 | 值 |
|-----|---|
| 观众ID | viewerUnionId (30字符截断) |
| 昵称 | nickname |
| 手机号 | mobile |
| 来源 | source |
| 姓名 | name |
| 邮箱 | email |
| 地址 | area |
| 观看时长 | watchDuration (格式化) |
| 观看频道数 | watchChannelCount |
| 创建时间 | createTime (格式化时间) |

**viewer list 表格列:**
| 列名 | 字段 | 说明 |
|-----|------|-----|
| 观众ID | viewerUnionId | 20字符截断 |
| 昵称 | nickname | 20字符截断 |
| 手机号 | mobile | - |
| 来源 | source | IMPORT/WX/MOBILE |
| 观看时长 | watchDuration | 格式化显示 |
| 观看频道数 | watchChannelCount | - |
| 创建时间 | createTime | 格式化时间 |

### 时间格式化
- `createTime`: 使用 `new Date(createTime).toLocaleString('zh-CN')` 格式化
- `watchDuration`: 转换为 "X小时Y分钟" 或 "X分钟" 格式显示

### 错误处理
- `viewerUnionId` 为空时提示: "观众ID (viewer-id) 是必需的"
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
  - 测试获取观众详情
  - 测试列出观众列表（带各种过滤条件）
  - 测试分页参数
  - 测试表格和 JSON 输出格式
  - 测试错误处理（空 viewerUnionId 等）
- **命令测试**: 验证 CLI 选项解析和帮助输出
- **错误场景测试**: 验证参数验证失败、API 调用失败的处理

## 变更日志

| 日期 | 版本 | 描述 | 作者 |
|------|------|------|------|
| 2026-03-24 | 1.0 | Initial story creation for viewer query commands | Claude Code Agent |
