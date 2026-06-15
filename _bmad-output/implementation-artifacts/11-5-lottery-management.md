# Story 11.5: 抽奖管理命令

Status: done

## 故事

作为一个运营人员或 PaaS 客户开发者，
我想要通过 CLI 使用 `lottery create`、`lottery list`、`lottery get`、`lottery winners` 等命令管理抽奖活动，
以便我能够高效地管理直播间抽奖互动功能。

## 验收标准 (ACs)

1. AC1: `lottery create` 命令支持创建抽奖活动（支持无条件、邀请、观看时长、评论、答题等多种类型）
2. AC2: `lottery list` 命令支持查询频道抽奖活动列表（支持分页）
3. AC3: `lottery get` 命令支持查询单个抽奖活动详情
4. AC4: `lottery update` 命令支持更新抽奖活动配置
5. AC5: `lottery delete` 命令支持删除抽奖活动
6. AC6: `lottery winners` 命令支持查询中奖用户列表
7. AC7: `lottery records` 命令支持查询频道抽奖记录（旧版 V3 API）
8. AC8: 所有命令支持 `--output table|json` 输出格式
9. AC9: 遵循 ATDD 开发模式，先编写测试，再实现功能
10. AC10: 复用已有的 SDK `LiveInteractionService` 抽奖相关方法，扩展 V4 抽奖活动 API
11. AC11: 错误消息友好，清晰提示参数验证失败或 API 调用失败的情况
12. AC12: 表格输出格式清晰，显示活动ID、名称、类型、状态、中奖人数等信息

## 任务 / 子任务

- [ ] **任务1: 扩展 CLI 类型定义 (AC: 1-12)**
  - [ ] 在 `packages/cli/src/types/lottery.ts` 中创建接口：
    - `LotteryCreateOptions` - 创建抽奖活动选项
    - `LotteryListOptions` - 查询抽奖活动列表选项
    - `LotteryGetOptions` - 查询抽奖活动详情选项
    - `LotteryUpdateOptions` - 更新抽奖活动选项
    - `LotteryDeleteOptions` - 删除抽奖活动选项
    - `LotteryWinnersOptions` - 查询中奖用户列表选项
    - `LotteryRecordsOptions` - 查询抽奖记录选项
    - `LotteryServiceConfig` - 服务配置
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- lottery`
  - [ ] 测试通过

- [ ] **任务2: 创建 LotteryHandler 类 (AC: 1-12)**
  - [ ] 在 `packages/cli/src/handlers/lottery.handler.ts` 中创建 Handler：
    - [ ] 实现 `createLottery` 方法 - 调用 SDK V4 创建抽奖活动
    - [ ] 实现 `listLottery` 方法 - 调用 SDK V4 查询抽奖活动列表
    - [ ] 实现 `getLottery` 方法 - 调用 SDK V4 查询抽奖活动详情
    - [ ] 实现 `updateLottery` 方法 - 调用 SDK V4 更新抽奖活动
    - [ ] 实现 `deleteLottery` 方法 - 调用 SDK V4 删除抽奖活动
    - [ ] 实现 `getWinners` 方法 - 调用 SDK `liveInteraction.getWinnerDetail`
    - [ ] 实现 `getRecords` 方法 - 调用 SDK `liveInteraction.listLottery`
    - [ ] 实现输入验证和输出格式化
  - [ ] 继承 `BaseHandler` 基类
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- lottery`
  - [ ] 测试通过

- [ ] **任务3: 创建 SDK 服务包装器 (AC: 10)**
  - [ ] 在 `packages/cli/src/services/lottery-service.ts` 中创建 `LotteryServiceSdk`:
    - [ ] 封装 V4 抽奖活动 CRUD 方法（create, list, get, update, delete）
    - [ ] 封装 `LiveInteractionService` 抽奖相关方法（listLottery, getWinnerDetail）
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- lottery`
  - [ ] 测试通过

- [ ] **任务4: 注册 CLI 命令 (AC: 1-8)**
  - [ ] 在 `packages/cli/src/commands/lottery.commands.ts` 中创建命令：
    - [ ] 实现 `lottery create` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--name` (必需), `--type` (必需), `--amount` (必需), `--prize-name` (必需), `--receive-info` (JSON), `--output` / `-o`
    - [ ] 实现 `lottery list` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--page`, `--size`, `--output` / `-o`
    - [ ] 实现 `lottery get` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--id` (必需), `--output` / `-o`
    - [ ] 实现 `lottery update` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--id` (必需), `--name`, `--amount`, `--prize-name`, `--output` / `-o`
    - [ ] 实现 `lottery delete` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--id` (必需), `--output` / `-o`
    - [ ] 实现 `lottery winners` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--lottery-id` (必需), `--page`, `--limit`, `--output` / `-o`
    - [ ] 实现 `lottery records` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--start-time`, `--end-time`, `--session-id`, `--page`, `--limit`, `--output` / `-o`
  - [ ] 在 `src/index.ts` 中注册命令
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- lottery`
  - [ ] 测试通过

- [ ] **任务5: 单元测试 (所有AC)**
  - [ ] 为 `LotteryHandler` 编写单元测试
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
| `lottery create` | `lotteryService.createLotteryActivity()` | `POST /live/v4/channel/lottery-activity/create` |
| `lottery list` | `lotteryService.listLotteryActivities()` | `GET /live/v4/channel/lottery-activity/list` |
| `lottery get` | `lotteryService.getLotteryActivity()` | `GET /live/v4/channel/lottery-activity/get` |
| `lottery update` | `lotteryService.updateLotteryActivity()` | `POST /live/v4/channel/lottery-activity/update` |
| `lottery delete` | `lotteryService.deleteLotteryActivity()` | `POST /live/v4/channel/lottery-activity/delete` |
| `lottery winners` | `liveInteraction.getWinnerDetail()` | `GET /live/v2/chat/get_winner_detail` |
| `lottery records` | `liveInteraction.listLottery()` | `GET /live/v3/channel/lottery/list-lottery` |

### 认证
- MD5 签名认证 (appId, timestamp, sign)

### SDK 服务
- 使用已有的 `LiveInteractionService` 类 (`packages/sdk/src/services/live-interaction.service.ts`)
- 需要扩展 V4 抽奖活动 API（V4 端点尚未在 SDK 中实现）
- SDK 类型定义:
  - `packages/sdk/src/types/live-interaction.ts` (Lottery 相关类型已存在)
- 需要新增 V4 抽奖活动类型定义

### 编码标准要求
[来源: architecture.md]
- 所有 public 方法必须有 JSDoc 注释
- 使用明确的 TypeScript 类型，避免使用 `any` 类型
- 异步操作必须有完整的错误处理
- 遵循现有的命名约定 (camelCase 变量, PascalCase 类)
- 单元测试覆盖率必须 >= 80%

### 模式参考
参考现有的 `CheckinHandler` 和 `checkin.commands.ts` 模式:
- Handler 类继承 `BaseHandler`
- 通过构造函数注入 SDK wrapper 服务
- 每个方法实现输入验证、业务逻辑调用、输出格式化
- 使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法格式化输出

### 命令设计示例

```bash
# ========== 抽奖活动管理命令 ==========

# 创建无条件抽奖活动
polyv-live-cli lottery create -c "3151318" --name "新年抽奖" --type none \
  --amount 3 --prize-name "新年礼包" \
  --receive-info '[{"type":"userName","field":"姓名","tips":"请输入姓名","required":true}]'

# 创建邀请抽奖活动
polyv-live-cli lottery create -c "3151318" --name "邀请好友抽奖" --type invite \
  --amount 5 --prize-name "优惠券" --duration 30 --invite-num 3

# 创建观看时长抽奖活动
polyv-live-cli lottery create -c "3151318" --name "观看时长抽奖" --type duration \
  --amount 2 --prize-name "会员卡" --duration 10

# 查询抽奖活动列表
polyv-live-cli lottery list -c "3151318"

# 分页查询
polyv-live-cli lottery list -c "3151318" --page 1 --size 20

# 查询抽奖活动详情
polyv-live-cli lottery get -c "3151318" --id 20521

# 更新抽奖活动
polyv-live-cli lottery update -c "3151318" --id 20521 --amount 5

# 删除抽奖活动
polyv-live-cli lottery delete -c "3151318" --id 20521

# 查询中奖用户列表
polyv-live-cli lottery winners -c "3151318" --lottery-id "fv3mao43u6"

# 查询抽奖记录（旧版）
polyv-live-cli lottery records -c "3151318" --start-time 1615772426000 --end-time 1615773566000

# JSON 输出格式
polyv-live-cli lottery list -c "3151318" -o json
```

### 建议参考文档
- API 文档: `docs/api/v4/channel/lottery_activity/lottery_activity_create.md` (创建抽奖活动)
- API 文档: `docs/api/v4/channel/lottery_activity/lottery_activity_list.md` (查询抽奖活动列表)
- API 文档: `docs/api/v4/channel/lottery_activity/lottery_activity_get.md` (查询抽奖活动)
- API 文档: `docs/api/v4/channel/lottery_activity/lottery_activity_update.md` (更新抽奖活动)
- API 文档: `docs/api/v4/channel/lottery_activity/lottery_activity_delete.md` (删除抽奖活动)
- API 文档: `docs/api/live_interaction/list_lottery.md` (查询频道抽奖记录-旧版)
- SDK 服务: `packages/sdk/src/services/live-interaction.service.ts`
- SDK 类型: `packages/sdk/src/types/live-interaction.ts`
- 前一 Story 实现: `_bmad-output/implementation-artifacts/11-4-qa-questionnaire-management.md`

### 前一 Story (11-4) 学习要点
1. Handler 类通过 SDK wrapper 调用 SDK
2. 使用 `BaseHandler` 的 `executeWithErrorHandling` 进行统一错误处理
3. 输出格式化使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法
4. 验证失败抛出 `PolyVValidationError`
5. 命令注册使用 Commander.js 的链式调用
6. `loadAuthAndServiceConfig` 辅助函数处理认证配置

### 关键实现细节

1. **创建抽奖活动 (`lottery create`)**
   - 使用 V4 API `/live/v4/channel/lottery-activity/create`
   - `channelId`: 频道号 (Integer 类型，URL 参数)
   - `activityName`: 抽奖活动名称 (必需)
   - `lotteryCondition`: 抽奖类型 (必需)
     - `none`: 无条件
     - `invite`: 邀请好友
     - `duration`: 观看时长
     - `comment`: 评论抽奖
     - `question`: 答题抽奖
   - `amount`: 中奖人数 (必需)
   - `prizeName`: 奖品名称 (必需)
   - `receiveEnabled`: 是否填写收货信息 (Y/N)
   - `receiveInfo`: 收货字段信息列表 (JSON)
   - 其他类型特定参数

2. **查询抽奖活动列表 (`lottery list`)**
   - 使用 V4 API `/live/v4/channel/lottery-activity/list`
   - 返回频道的所有抽奖活动
   - 支持分页 (`pageNumber`, `pageSize`)
   - 响应包含: `id`, `activityName`, `lotteryCondition`, `status`, `amount`, `prizeName`

3. **查询抽奖活动详情 (`lottery get`)**
   - 使用 V4 API `/live/v4/channel/lottery-activity/get`
   - 参数: `channelId`, `id` (抽奖活动ID)
   - 返回完整的活动配置信息

4. **更新抽奖活动 (`lottery update`)**
   - 使用 V4 API `/live/v4/channel/lottery-activity/update`
   - 参数与创建类似，需要额外提供 `id`

5. **删除抽奖活动 (`lottery delete`)**
   - 使用 V4 API `/live/v4/channel/lottery-activity/delete`
   - 参数: `channelId` (URL), `id` (Body)

6. **查询中奖用户 (`lottery winners`)**
   - 使用 `liveInteraction.getWinnerDetail()`
   - 参数: `channelId`, `lotteryId`, `page`, `limit`
   - 响应包含: `viewerId`, `nick`, `winnerCode`, `winTime`

7. **查询抽奖记录 (`lottery records`)**
   - 使用 `liveInteraction.listLottery()`
   - 参数: `channelId`, `startTime`, `endTime`, `sessionId`, `page`, `limit`
   - 响应包含: `lotteryId`, `channelId`, `sessionId`, `prize`, `amount`, `winnerCount`, `createdTime`

### ReceiveInfo 格式
```json
[
  {
    "type": "userName",  // userName:姓名, userPhone:手机号, custom:自定义
    "field": "姓名",
    "tips": "请输入您的名称",
    "required": true
  }
]
```

### 表格输出设计

**lottery list 表格列:**
| 列名 | 字段 | 说明 |
|------|------|------|
| 活动ID | id | - |
| 活动名称 | activityName | 30字符截断 |
| 类型 | lotteryCondition | none/invite/duration/comment/question |
| 状态 | status | - |
| 中奖人数 | amount | - |
| 奖品名称 | prizeName | 20字符截断 |

**lottery winners 表格列:**
| 列名 | 字段 | 说明 |
|------|------|------|
| 观众ID | viewerId | 10字符截断 |
| 昵称 | nick | 20字符截断 |
| 中奖码 | winnerCode | - |
| 中奖时间 | winTime | 格式化时间 |

**lottery records 表格列:**
| 列名 | 字段 | 说明 |
|------|------|------|
| 抽奖ID | lotteryId | 10字符截断 |
| 场次ID | sessionId | 10字符截断 |
| 奖品 | prize | 20字符截断 |
| 预设人数 | amount | - |
| 实际人数 | winnerCount | - |
| 抽奖时间 | createdTime | 格式化时间 |

## 测试

### 测试文件位置
[来源: architecture.md]
- 单元测试: `packages/cli/src/handlers/lottery.handler.test.ts`
- 命令测试: `packages/cli/src/commands/lottery.commands.test.ts`

### 测试标准
[来源: architecture.md]
- 使用 Jest 29.7.0 测试框架
- 测试命名: `describe-it` 模式，描述性测试名称
- 测试结构: `Arrange-Act-Assert` 模式
- Mock 策略: 使用 Jest mocks 模拟 SDK 响应
- 覆盖率要求: 单元测试覆盖率必须 >= 80%

### 具体测试要求
- **Handler 测试**: 验证业务逻辑、输入验证、错误处理
  - 测试创建各种类型抽奖活动
  - 测试分页查询
  - 测试表格和 JSON 输出格式
- **命令测试**: 验证 CLI 选项解析和帮助输出
- **错误场景测试**: 验证参数验证失败、API 调用失败的处理

## 变更日志

| 日期 | 版本 | 描述 | 作者 |
|------|------|------|------|
| 2026-03-24 | 1.0 | Initial story creation for lottery management commands | Claude Code Agent |
