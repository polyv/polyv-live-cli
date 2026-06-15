# Story 12.4: 白名单管理命令

Status: done

## 故事

作为一个运营人员或 PaaS 客户开发者，
我想要通过 CLI 使用 `whitelist add`、`whitelist remove`、`whitelist list` 等命令管理白名单，
以便我能够高效地控制直播间的观看权限（白名单观看模式）。

## 验收标准 (ACs)

1. AC1: `whitelist list` 命令支持获取白名单列表（支持分页和关键词搜索）
2. AC2: `whitelist add` 命令支持添加单个白名单项
3. AC3: `whitelist update` 命令支持更新单个白名单项
4. AC4: `whitelist remove` 命令支持删除白名单项（支持批量删除和一键清空）
5. AC5: 所有命令支持 `--output table|json` 输出格式
6. AC6: 遵循 ATDD 开发模式，先编写测试，再实现功能
7. AC7: 复用已有的 SDK Web Service 白名单相关方法
8. AC8: 错误消息友好，清晰提示参数验证失败或 API 调用失败的情况
9. AC9: 表格输出格式清晰，显示白名单关键信息
10. AC10: 支持全局设置和频道级别设置（通过 --channel-id 参数区分）

## 任务 / 子任务

- [x] **任务1: 创建 CLI 类型定义 (AC: 1-10)**
  - [x] 在 `packages/cli/src/types/whitelist.ts` 中创建接口：
    - `WhitelistServiceConfig` - 服务配置
    - `WhitelistListOptions` - 获取白名单选项
    - `WhitelistAddOptions` - 添加白名单选项
    - `WhitelistUpdateOptions` - 更新白名单选项
    - `WhitelistRemoveOptions` - 删除白名单选项
  - [x] 运行测试: `pnpm --filter polyv-live-cli test:unit -- whitelist`
  - [x] 测试通过

- [x] **任务2: 创建 WhitelistHandler 类 (AC: 1-10)**
  - [x] 在 `packages/cli/src/handlers/whitelist.handler.ts` 中创建 Handler：
    - [x] 实现 `listWhitelist` 方法 - 调用 SDK Web getWhiteList
    - [x] 实现 `addWhitelist` 方法 - 调用 SDK Web addWhiteList
    - [x] 实现 `updateWhitelist` 方法 - 调用 SDK Web updateWhiteList
    - [x] 实现 `removeWhitelist` 方法 - 调用 SDK Web deleteWhiteList
    - [x] 实现输入验证和输出格式化
  - [x] 继承 `BaseHandler` 基类
  - [x] 运行测试: `pnpm --filter polyv-live-cli test:unit -- whitelist`
  - [x] 测试通过

- [x] **任务3: 创建 SDK 服务包装器 (AC: 7)**
  - [x] 在 `packages/cli/src/services/whitelist-service.ts` 中创建 `WhitelistServiceSdk`:
    - [x] 封装 Web Service 白名单方法（getWhiteList, addWhiteList, updateWhiteList, deleteWhiteList）
  - [x] 运行测试: `pnpm --filter polyv-live-cli test:unit -- whitelist`
  - [x] 测试通过

- [x] **任务4: 注册 CLI 命令 (AC: 1-6, 10)**
  - [x] 在 `packages/cli/src/commands/whitelist.commands.ts` 中创建命令：
    - [x] 实现 `whitelist list` 子命令
      - 选项: `--channel-id` (可选), `--rank` (必需, 1或2), `--page`, `--page-size`, `--keyword`, `--output` / `-o`
    - [x] 实现 `whitelist add` 子命令
      - 选项: `--channel-id` (可选), `--rank` (必需), `--code` (必需), `--name`, `--output` / `-o`
    - [x] 实现 `whitelist update` 子命令
      - 选项: `--channel-id` (可选), `--rank` (必需), `--old-code` (必需), `--code` (必需), `--name`, `--output` / `-o`
    - [x] 实现 `whitelist remove` 子命令
      - 选项: `--channel-id` (可选), `--rank` (必需), `--codes` (逗号分隔), `--clear` (清空所有), `--output` / `-o`
  - [x] 在 `src/index.ts` 中注册命令
  - [x] 运行测试: `pnpm --filter polyv-live-cli test:unit -- whitelist`
  - [x] 测试通过

- [x] **任务5: 单元测试 (所有AC)**
  - [x] 为 `WhitelistHandler` 编写单元测试
  - [x] 测试覆盖率达到 80% 以上
  - [x] 运行: `nvm use 23 && pnpm --filter polyv-live-cli test:unit`
  - [x] 运行覆盖率报告: `pnpm --filter polyv-live-cli test:coverage`
  - [x] 验证覆盖率达标

- [x] **任务6: 更新 Skill 文档 (完成开发后)**
  - [x] 更新 `skills/polyv-live-cli/SKILL.md` 添加 whitelist 命令说明
  - [x] 创建 `skills/polyv-live-cli/references/whitelist.md` 详细文档

## 开发注意事项

### 技术栈要求
[来源: CLAUDE.md, CLAUDE.local.md]
- **TypeScript**: 5.3.3 - 使用严格类型检查
- **Node.js**: 20.11.0 LTS - 运行时环境
- **Commander.js**: 11.1.0 - CLI 框架用于命令注册
- **Jest**: 29.7.0 - 测试框架

### API 集成要求

| CLI 命令 | SDK 方法 | API 端点 | HTTP 方法 |
|---------|----------|---------|---------|
| `whitelist list` | `web.getWhiteList()` | `/live/v3/channel/auth/get-white-list` | GET |
| `whitelist add` | `web.addWhiteList()` | `/live/v3/channel/auth/add-white-list` | POST |
| `whitelist update` | `web.updateWhiteList()` | `/live/v3/channel/auth/update-white-list` | POST |
| `whitelist remove` | `web.deleteWhiteList()` | `/live/v3/channel/auth/delete-white-list` | POST |

### 认证
- MD5 签名认证 (appId, timestamp, sign)

### SDK 服务

**已有 SDK 方法 (WebService):**
```typescript
// 获取白名单列表
getWhiteList(params: GetWhiteListParams): Promise<GetWhiteListResponse>

// 添加白名单
addWhiteList(params: AddWhiteListParams): Promise<string>

// 更新白名单
updateWhiteList(params: UpdateWhiteListParams): Promise<string>

// 删除白名单
deleteWhiteList(params: DeleteWhiteListParams): Promise<string>
```

**SDK 类型定义位置:**
- `packages/sdk/src/types/web.ts` - GetWhiteListParams, GetWhiteListResponse, AddWhiteListParams, UpdateWhiteListParams, DeleteWhiteListParams, WhiteListItem

**SDK 类型详情:**

```typescript
// 白名单项
export interface WhiteListItem {
  /** 昵称/备注 */
  name: string;
  /** 会员码/手机号 */
  phone: string;
}

// 获取白名单参数
export interface GetWhiteListParams {
  /** 主要观看条件为1，次要观看条件为2 */
  rank: 1 | 2;
  /** 频道号（可选，不传为全局设置） */
  channelId?: string;
  /** 页码，默认为1 */
  page?: number;
  /** 每页数量，默认为10 */
  pageSize?: number;
  /** 关键词（可根据会员码和名称查询） */
  keyword?: string;
}

// 获取白名单响应
export interface GetWhiteListResponse {
  /** 当前页码 */
  pageNumber: number;
  /** 总页数 */
  totalPages: number;
  /** 每页数量 */
  pageSize: number;
  /** 白名单内容 */
  contents: WhiteListItem[];
}

// 添加白名单参数
export interface AddWhiteListParams {
  /** 主要观看条件为1，次要观看条件为2 */
  rank: 1 | 2;
  /** 会员码（最多50个字符） */
  code: string;
  /** 昵称（可选，最多50个字符） */
  name?: string;
  /** 频道号（可选，不传为全局设置） */
  channelId?: string;
}

// 更新白名单参数 (注意: SDK 类型中缺少 oldCode，但 API 需要)
// CLI 需要自己处理 oldCode 参数
export interface UpdateWhiteListParams {
  /** 主要观看条件为1，次要观看条件为2 */
  rank: 1 | 2;
  /** 会员码（最多50个字符） */
  code: string;
  /** 昵称（可选，最多50个字符） */
  name?: string;
  /** 频道号（可选，不传为全局设置） */
  channelId?: string;
}

// 删除白名单参数
export interface DeleteWhiteListParams {
  /** 主要观看条件为1，次要观看条件为2 */
  rank: 1 | 2;
  /** 要删除的会员码（逗号分隔） */
  codes: string;
  /** 频道号（可选，不传为全局设置） */
  channelId?: string;
}
```

**重要提示:** 根据API文档，更新白名单需要 `oldCode` 参数来标识要更新的记录，但 SDK 的 `UpdateWhiteListParams` 类型中缺少此参数。CLI Handler 需要直接构造包含 `oldCode` 的请求参数。

### 编码标准要求
[来源: architecture.md]
- 所有 public 方法必须有 JSDoc 注释
- 使用明确的 TypeScript 类型，避免使用 `any` 类型
- 异步操作必须有完整的错误处理
- 遵循现有的命名约定 (camelCase 变量, PascalCase 类)
- 单元测试覆盖率必须 >= 80%

### 模式参考
参考现有的 `WatchConditionHandler` 和 `watch-condition.commands.ts` 模式:
- Handler 类继承 `BaseHandler`
- 通过构造函数注入 SDK wrapper 服务
- 每个方法实现输入验证、业务逻辑调用、输出格式化
- 使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法格式化输出

### 命令设计示例

```bash
# ========== 白名单管理命令 ==========

# 列出白名单（频道）
polyv-live-cli whitelist list --channel-id 123456 --rank 1

# 列出白名单（全局）
polyv-live-cli whitelist list --rank 1

# 分页和搜索
polyv-live-cli whitelist list --channel-id 123456 --rank 1 --page 1 --page-size 20 --keyword "张三"

# JSON 输出格式
polyv-live-cli whitelist list --channel-id 123456 --rank 1 -o json

# 添加白名单
polyv-live-cli whitelist add --channel-id 123456 --rank 1 --code "13800138000" --name "张三"

# 添加白名单（全局）
polyv-live-cli whitelist add --rank 1 --code "13800138000" --name "张三"

# 更新白名单
polyv-live-cli whitelist update --channel-id 123456 --rank 1 --old-code "13800138000" --code "13900139000" --name "李四"

# 删除白名单（单个）
polyv-live-cli whitelist remove --channel-id 123456 --rank 1 --codes "13800138000"

# 删除白名单（批量）
polyv-live-cli whitelist remove --channel-id 123456 --rank 1 --codes "13800138000,13900139000"

# 清空所有白名单
polyv-live-cli whitelist remove --channel-id 123456 --rank 1 --clear
```

### 前一 Story (12-3) 学习要点
1. Handler 类通过 SDK wrapper 调用 SDK
2. 使用 `BaseHandler` 的 `executeWithErrorHandling` 进行统一错误处理
3. 输出格式化使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法
4. 验证失败抛出 `PolyVValidationError`
5. 命令注册使用 Commander.js 的链式调用
6. `loadAuthAndServiceConfig` 辅助函数处理认证配置
7. **注意 CLI 选项短参数规则：禁止使用 `-v` 或 `-V`**，避免与 `--version` 冲突

### 关键实现细节

1. **获取白名单 (`whitelist list`)**
   - 使用 V3 API `/live/v3/channel/auth/get-white-list`
   - 参数: `rank` (必需), `channelId` (可选), `page`, `pageSize`, `keyword`
   - SDK 方法已存在: `web.getWhiteList(params)`
   - 响应包含分页信息和白名单内容数组

2. **添加白名单 (`whitelist add`)**
   - 使用 V3 API `/live/v3/channel/auth/add-white-list`
   - 参数: `rank` (必需), `code` (必需), `name` (可选), `channelId` (可选)
   - SDK 方法已存在: `web.addWhiteList(params)`
   - code 最多50个字符，name 最多50个字符

3. **更新白名单 (`whitelist update`)**
   - 使用 V3 API `/live/v3/channel/auth/update-white-list`
   - 参数: `rank` (必需), `oldCode` (必需), `code` (必需), `name` (可选), `channelId` (可选)
   - **注意**: SDK 的 `UpdateWhiteListParams` 缺少 `oldCode`，需要额外处理
   - 实现时需要扩展 SDK 参数或直接调用 HTTP

4. **删除白名单 (`whitelist remove`)**
   - 使用 V3 API `/live/v3/channel/auth/delete-white-list`
   - 参数: `rank` (必需), `codes` (逗号分隔), `channelId` (可选)
   - 特殊选项: `--clear` 清空所有 (设置 `isClear=Y`)
   - SDK 方法已存在: `web.deleteWhiteList(params)`

### 表格输出设计

**whitelist list 表格:**
| 列名 | 字段 | 说明 |
|-----|------|-----|
| 会员码 | phone/code | 白名单唯一标识 |
| 昵称 | name | 用户备注名 |

**whitelist add/update/remove 成功消息:**
```
Successfully added whitelist item for channel 123456
Successfully updated whitelist item for channel 123456
Successfully removed 2 whitelist items for channel 123456
```

### 错误处理
- `--rank` 不是 1 或 2 时提示: "rank 必须是 1 (主要条件) 或 2 (次要条件)"
- `--code` 为空时提示: "code (会员码) 是必需的"
- `--old-code` 为空时（更新命令）提示: "old-code (原会员码) 是必需的"
- `--codes` 为空且未指定 `--clear` 时提示: "必须指定 --codes 或使用 --clear 清空所有"
- code/name 超过50字符时提示: "code/name 不能超过50个字符"
- API 返回错误时显示友好的错误消息

## 测试

### 测试文件位置
[来源: architecture.md]
- 单元测试: `packages/cli/src/handlers/whitelist.handler.test.ts`
- 命令测试: `packages/cli/src/commands/whitelist.commands.test.ts`
- 服务测试: `packages/cli/src/services/whitelist-service.test.ts`

### 测试标准
[来源: architecture.md]
- 使用 Jest 29.7.0 测试框架
- 测试命名: `describe-it` 模式，描述性测试名称
- 测试结构: `Arrange-Act-Assert` 模式
- Mock 策略: 使用 Jest mocks 模拟 SDK 响应
- 覆盖率要求: 单元测试覆盖率必须 >= 80%

### 具体测试要求
- **Handler 测试**: 验证业务逻辑、输入验证、错误处理
  - 测试获取白名单列表（分页、搜索）
  - 测试添加白名单
  - 测试更新白名单
  - 测试删除白名单（单个、批量、清空）
  - 测试表格和 JSON 输出格式
  - 测试错误处理（无效 rank、code 等）
- **命令测试**: 验证 CLI 选项解析和帮助输出
- **错误场景测试**: 验证参数验证失败、API 调用失败的处理

## 变更日志

| 日期 | 版本 | 描述 | 作者 |
|------|------|------|------|
| 2026-03-25 | 1.0 | Initial story creation for whitelist management commands | Claude Code Agent |
