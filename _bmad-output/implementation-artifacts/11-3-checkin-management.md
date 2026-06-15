# Story 11.3: 签到管理命令

Status: done

## 故事

作为一个运营人员或 PaaS 客户开发者，
我想要通过 CLI 使用 `checkin start`、`checkin list`、`checkin result` 等命令管理签到，
以便我能够高效地管理直播间签到互动功能。

## 验收标准 (ACs)

1. AC1: `checkin start` 命令支持发起签到（支持设置签到时长、定时签到、签到提示语、强制签到）
2. AC2: `checkin list` 命令支持查询签到成功记录（支持分页、按日期或场次查询）
3. AC3: `checkin result` 命令支持查询签到详情（包括已签到和未签到记录）
4. AC4: `checkin sessions` 命令支持查询签到发起记录（按时间范围查询）
5. AC5: 所有命令支持 `--output table|json` 输出格式
6. AC6: 遵循 ATDD 开发模式，先编写测试，再实现功能
7. AC7: 复用已有的 SDK `LiveInteractionService` 和 `V4ChatService` 服务
8. AC8: 错误消息友好，清晰提示参数验证失败或 API 调用失败的情况
9. AC9: 表格输出格式清晰，显示签到ID、用户ID、昵称、签到时间等信息

## 任务 / 子任务

- [ ] **任务1: 扩展 CLI 类型定义 (AC: 1-9)**
  - [ ] 在 `packages/cli/src/types/checkin.ts` 中创建接口：
    - `CheckinStartOptions` - 发起签到选项
    - `CheckinListOptions` - 查询签到列表选项
    - `CheckinResultOptions` - 查询签到详情选项
    - `CheckinSessionsOptions` - 查询签到发起记录选项
    - `CheckinServiceConfig` - 服务配置
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- checkin`
  - [ ] 测试通过

- [ ] **任务2: 创建 CheckinHandler 类 (AC: 1-9)**
  - [ ] 在 `packages/cli/src/handlers/checkin.handler.ts` 中创建 Handler：
    - [ ] 实现 `startCheckin` 方法 - 调用 SDK `v4Chat.batchCheckin`
    - [ ] 实现 `listCheckins` 方法 - 调用 SDK `liveInteraction.getCheckinList`
    - [ ] 实现 `getCheckinResult` 方法 - 调用 SDK `liveInteraction.getCheckinByCheckinId`
    - [ ] 实现 `listSessions` 方法 - 调用 SDK `liveInteraction.getCheckinByTime`
    - [ ] 实现输入验证和输出格式化
  - [ ] 继承 `BaseHandler` 基类
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- checkin`
  - [ ] 测试通过

- [ ] **任务3: 创建 SDK 服务包装器 (AC: 7)**
  - [ ] 在 `packages/cli/src/services/checkin-service.ts` 中创建 `CheckinServiceSdk`:
    - [ ] 封装 `LiveInteractionService` 签到相关方法
    - [ ] 封装 `V4ChatService.batchCheckin` 方法
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- checkin`
  - [ ] 测试通过

- [ ] **任务4: 注册 CLI 命令 (AC: 1-5)**
  - [ ] 在 `packages/cli/src/commands/checkin.commands.ts` 中创建命令：
    - [ ] 实现 `checkin start` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--limit-time`, `--delay-time`, `--message`, `--force`, `--output` / `-o`
    - [ ] 实现 `checkin list` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--page`, `--size`, `--date`, `--session-id`, `--output` / `-o`
    - [ ] 实现 `checkin result` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--checkin-id` (必需), `--output` / `-o`
    - [ ] 实现 `checkin sessions` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--start-date`, `--end-date`, `--output` / `-o`
  - [ ] 在 `src/index.ts` 中注册命令
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- checkin`
  - [ ] 测试通过

- [ ] **任务5: 单元测试 (所有AC)**
  - [ ] 为 `CheckinHandler` 编写单元测试
  - [ ] 测试覆盖率达到 80% 以上
  - [ ] 运行: `nvm use 23 && pnpm --filter polyv-live-cli test:unit`
  - [ ] 运行覆盖率报告: `pnpm --filter polyv-live-cli test:coverage`
  - [ ] 验证覆盖率达标

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
| `checkin start` | `v4Chat.batchCheckin()` | `POST /live/v4/chat/batch-checkin` |
| `checkin list` | `liveInteraction.getCheckinList()` | `GET /live/v3/channel/checkin/list` |
| `checkin result` | `liveInteraction.getCheckinByCheckinId()` | `GET /live/v3/channel/chat/get-checkins` |
| `checkin sessions` | `liveInteraction.getCheckinByTime()` | `GET /live/v3/channel/chat/get-checkin-list` |

### 认证
- MD5 签名认证 (appId, timestamp, sign)

### SDK 服务
- 使用已有的 `V4ChatService` 类 (`packages/sdk/src/services/v4/chat.service.ts`)
- 使用已有的 `LiveInteractionService` 类 (`packages/sdk/src/services/live-interaction.service.ts`)
- SDK 类型定义:
  - `packages/sdk/src/types/v4-chat.ts` (BatchCheckinParams)
  - `packages/sdk/src/types/live-interaction.ts` (Checkin 相关类型)

### 编码标准要求
[来源: architecture.md]
- 所有 public 方法必须有 JSDoc 注释
- 使用明确的 TypeScript 类型，避免使用 `any` 类型
- 异步操作必须有完整的错误处理
- 遵循现有的命名约定 (camelCase 变量, PascalCase 类)
- 单元测试覆盖率必须 >= 80%

### 模式参考
参考现有的 `ChatHandler` 和 `chat.commands.ts` 模式:
- Handler 类继承 `BaseHandler`
- 通过构造函数注入 SDK wrapper 服务
- 每个方法实现输入验证、业务逻辑调用、输出格式化
- 使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法格式化输出

### 命令设计示例

```bash
# 发起签到（立即签到）
polyv-live-cli checkin start -c "3151318"

# 发起签到（限时30秒）
polyv-live-cli checkin start -c "3151318" --limit-time 30

# 发起签到（定时签到）
polyv-live-cli checkin start -c "3151318" --limit-time 60 --delay-time 1700734800000 --message "请签到"

# 发起强制签到
polyv-live-cli checkin start -c "3151318" --force

# 查询签到成功记录
polyv-live-cli checkin list -c "3151318"

# 查询指定日期签到记录
polyv-live-cli checkin list -c "3151318" --date "2024-01-15"

# 查询指定场次签到记录
polyv-live-cli checkin list -c "3151318" --session-id "fwly13xczv"

# 分页查询
polyv-live-cli checkin list -c "3151318" --page 1 --size 20

# 查询签到详情（包括未签到）
polyv-live-cli checkin result -c "3151318" --checkin-id "db14ef80-81b8-11eb-b114-e7477b"

# 查询签到发起记录
polyv-live-cli checkin sessions -c "3151318" --start-date "2024-01-01" --end-date "2024-01-31"

# JSON 输出格式
polyv-live-cli checkin list -c "3151318" -o json
```

### 建议参考文档
- API 文档: `docs/api/v4/chat/checkin/batch_checkin.md` (发起签到)
- API 文档: `docs/api/live_interaction/get_checkin_list.md` (查询签到记录)
- API 文档: `docs/api/live_interaction/get_checkin_by_checkid.md` (查询签到详情)
- API 文档: `docs/api/live_interaction/get_checkin_by_time.md` (查询签到发起记录)
- SDK 服务: `packages/sdk/src/services/v4/chat.service.ts`
- SDK 服务: `packages/sdk/src/services/live-interaction.service.ts`
- SDK 类型: `packages/sdk/src/types/v4-chat.ts`
- SDK 类型: `packages/sdk/src/types/live-interaction.ts`
- 前一 Story 实现: `_bmad-output/implementation-artifacts/11-2-ban-kick-management.md`

### 前一 Story (11-2) 学习要点
1. Handler 类通过 SDK wrapper 调用 SDK
2. 使用 `BaseHandler` 的 `executeWithErrorHandling` 进行统一错误处理
3. 输出格式化使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法
4. 验证失败抛出 `PolyVValidationError`
5. 命令注册使用 Commander.js 的链式调用
6. `loadAuthAndServiceConfig` 辅助函数处理认证配置

### 关键实现细节

1. **发起签到 (`checkin start`)**
   - 使用 V4 API `batchCheckin`，支持批量设置，但 CLI 只支持单频道
   - `limitTime`: 签到时长(秒), 0表示立即签到, 最大86400
   - `delayTime`: 定时开始时间(13位时间戳)
   - `message`: 签到提示语
   - `forceCheckInEnabled`: 是否强制签到 (Y/N)

2. **查询签到记录 (`checkin list`)**
   - 返回已签到的记录
   - 支持按 `date` 或 `sessionId` 过滤
   - 分页参数: `page`, `pageSize`
   - 响应包含: `checkinid`, `nickname`, `userid`, `time`, `timeFormat`

3. **查询签到详情 (`checkin result`)**
   - 通过 `checkinId` 查询
   - 包括已签到和未签到记录
   - 响应字段 `checked`: "Y"=已签到, "N"=未签到

4. **查询签到发起记录 (`checkin sessions`)**
   - 按时间范围查询: `startDate`, `endDate`
   - 格式: `yyyy-MM-dd`
   - 时间范围限制: 30天内

## 测试

### 测试文件位置
[来源: architecture.md]
- 单元测试: `packages/cli/src/handlers/checkin.handler.test.ts`
- 命令测试: `packages/cli/src/commands/checkin.commands.test.ts`

### 测试标准
[来源: architecture.md]
- 使用 Jest 29.7.0 测试框架
- 测试命名: `describe-it` 模式，描述性测试名称
- 测试结构: `Arrange-Act-Assert` 模式
- Mock 策略: 使用 Jest mocks 模拟 SDK 响应
- 覆盖率要求: 单元测试覆盖率必须 >= 80%

### 具体测试要求
- **Handler 测试**: 验证业务逻辑、输入验证、错误处理
  - 测试发起签到的各种参数组合
  - 测试分页查询
  - 测试表格和 JSON 输出格式
- **命令测试**: 验证 CLI 选项解析和帮助输出
- **错误场景测试**: 验证参数验证失败、API 调用失败的处理

## 变更日志

| 日期 | 版本 | 描述 | 作者 |
|------|------|------|------|
| 2026-03-24 | 1.0 | Initial story creation for checkin management commands | Claude Code Agent |
