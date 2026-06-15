# Story 11.6: 打赏管理命令

Status: ready-for-dev

## 故事

作为一个运营人员或 PaaS 客户开发者，
我想要通过 CLI 使用 `donate config`、`donate list` 等命令管理打赏设置，
以便我能够高效地管理直播间打赏互动功能。

## 验收标准 (ACs)

1. AC1: `donate config get` 命令支持获取频道打赏配置（V4 API）
2. AC2: `donate config update` 命令支持更新打赏配置（V4 API）
3. AC3: `donate list` 命令支持分页查询频道打赏记录（V4 API）
4. AC4: 所有命令支持 `--output table|json` 输出格式
5. AC5: 遵循 ATDD 开发模式，先编写测试，再实现功能
6. AC6: 复用已有的 SDK V4 Channel Service 打赏相关方法
7. AC7: 错误消息友好，清晰提示参数验证失败或 API 调用失败的情况
8. AC8: 表格输出格式清晰，显示配置信息或打赏记录

## 任务 / 子任务

- [ ] **任务1: 扩展 CLI 类型定义 (AC: 1-8)**
  - [ ] 在 `packages/cli/src/types/donate.ts` 中创建接口：
    - `DonateConfigGetOptions` - 获取打赏配置选项
    - `DonateConfigUpdateOptions` - 更新打赏配置选项
    - `DonateListOptions` - 查询打赏记录选项
    - `DonateServiceConfig` - 服务配置
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- donate`
  - [ ] 测试通过

- [ ] **任务2: 扩展 SDK V4 Channel Service 添加打赏记录查询 (AC: 3)**
  - [ ] 在 `packages/sdk/src/types/v4-channel.ts` 中添加类型：
    - `ListRewardGiftParams` - 查询打赏记录参数
    - `RewardGiftItem` - 打赏记录项
    - `ListRewardGiftResponse` - 打赏记录响应
  - [ ] 在 `packages/sdk/src/services/v4/channel.service.ts` 中添加方法：
    - `listRewardGift()` - 调用 `/live/v4/channel/reward/gift-list`
  - [ ] 在 `packages/sdk/src/types/index.ts` 中导出新类型
  - [ ] 运行测试: `pnpm --filter polyv-live-api-sdk test:unit`
  - [ ] 测试通过

- [ ] **任务3: 创建 DonateHandler 类 (AC: 1-8)**
  - [ ] 在 `packages/cli/src/handlers/donate.handler.ts` 中创建 Handler：
    - [ ] 实现 `getConfig` 方法 - 调用 SDK V4 getDonate
    - [ ] 实现 `updateConfig` 方法 - 调用 SDK V4 updateDonate（如果 SDK 支持否则需扩展）
    - [ ] 实现 `listRecords` 方法 - 调用 SDK V4 listRewardGift
    - [ ] 实现输入验证和输出格式化
  - [ ] 继承 `BaseHandler` 基类
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- donate`
  - [ ] 测试通过

- [ ] **任务4: 创建 SDK 服务包装器 (AC: 6)**
  - [ ] 在 `packages/cli/src/services/donate-service.ts` 中创建 `DonateServiceSdk`:
    - [ ] 封装 V4 打赏配置方法（getDonate, updateDonate）
    - [ ] 封装 V4 打赏记录方法（listRewardGift）
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- donate`
  - [ ] 测试通过

- [ ] **任务5: 注册 CLI 命令 (AC: 1-4)**
  - [ ] 在 `packages/cli/src/commands/donate.commands.ts` 中创建命令：
    - [ ] 实现 `donate config get` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--output` / `-o`
    - [ ] 实现 `donate config update` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--cash-enabled`, `--gift-enabled`, `--tips`, `--amounts`, `--output` / `-o`
    - [ ] 实现 `donate list` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--start`, `--end`, `--page`, `--size`, `--output` / `-o`
  - [ ] 在 `src/index.ts` 中注册命令
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- donate`
  - [ ] 测试通过

- [ ] **任务6: 单元测试 (所有AC)**
  - [ ] 为 `DonateHandler` 编写单元测试
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
| `donate config get` | `v4Channel.getDonate()` | `GET /live/v4/channel/donate/get` |
| `donate config update` | `v4Channel.updateDonate()` | `POST /live/v4/channel/donate/update` |
| `donate list` | `v4Channel.listRewardGift()` | `GET /live/v4/channel/reward/gift-list` |

### 认证
- MD5 签名认证 (appId, timestamp, sign)

### SDK 服务

**已有 SDK 方法 (V4 ChannelService):**
- `getDonate(params: GetDonateParams): Promise<DonateSettings>` - 获取打赏配置
- `updateDonate(params: UpdateDonateParams): Promise<void>` - 更新打赏配置

**需要新增的 SDK 方法:**
- `listRewardGift(params: ListRewardGiftParams): Promise<ListRewardGiftResponse>` - 查询打赏记录

**SDK 类型定义位置:**
- `packages/sdk/src/types/v4-channel.ts` - DonateSettings, GetDonateParams, UpdateDonateParams

**注意:** 现有 SDK 中的 `DonateSettings` 类型是简化版，V4 API 实际返回更复杂的结构（包含现金打赏、礼物打赏等详细信息）。需要扩展类型定义以匹配实际 API 响应。

### 编码标准要求
[来源: architecture.md]
- 所有 public 方法必须有 JSDoc 注释
- 使用明确的 TypeScript 类型，避免使用 `any` 类型
- 异步操作必须有完整的错误处理
- 遵循现有的命名约定 (camelCase 变量, PascalCase 类)
- 单元测试覆盖率必须 >= 80%

### 模式参考
参考现有的 `LotteryHandler` 和 `lottery.commands.ts` 模式:
- Handler 类继承 `BaseHandler`
- 通过构造函数注入 SDK wrapper 服务
- 每个方法实现输入验证、业务逻辑调用、输出格式化
- 使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法格式化输出

### 命令设计示例

```bash
# ========== 打赏管理命令 ==========

# 获取频道打赏配置
polyv-live-cli donate config get -c "3151318"

# 获取配置（JSON 输出）
polyv-live-cli donate config get -c "3151318" -o json

# 更新打赏配置
polyv-live-cli donate config update -c "3151318" --cash-enabled Y --gift-enabled Y --tips "感谢打赏"

# 更新打赏金额选项
polyv-live-cli donate config update -c "3151318" --amounts 0.88,6.66,8.88,18.88,66.6,88.8

# 查询打赏记录
polyv-live-cli donate list -c "3151318" --start 1615772426000 --end 1615858826000

# 分页查询打赏记录
polyv-live-cli donate list -c "3151318" --start 1615772426000 --end 1615858826000 --page 1 --size 20

# JSON 输出格式
polyv-live-cli donate list -c "3151318" --start 1615772426000 --end 1615858826000 -o json
```

### 建议参考文档
- API 文档: `docs/api/v4/channel/donate/get.md` (获取打赏配置)
- API 文档: `docs/api/v4/channel/donate/update.md` (更新礼物打赏设置)
- API 文档: `docs/api/v4/channel/reward/gift_page.md` (分页查询打赏记录)
- SDK 服务: `packages/sdk/src/services/v4/channel.service.ts`
- SDK 类型: `packages/sdk/src/types/v4-channel.ts`
- 前一 Story 实现: `_bmad-output/implementation-artifacts/11-5-lottery-management.md`

### 前一 Story (11-5) 学习要点
1. Handler 类通过 SDK wrapper 调用 SDK
2. 使用 `BaseHandler` 的 `executeWithErrorHandling` 进行统一错误处理
3. 输出格式化使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法
4. 验证失败抛出 `PolyVValidationError`
5. 命令注册使用 Commander.js 的链式调用
6. `loadAuthAndServiceConfig` 辅助函数处理认证配置

### 关键实现细节

1. **获取打赏配置 (`donate config get`)**
   - 使用 V4 API `/live/v4/channel/donate/get`
   - 参数: `channelId` (必需)
   - 响应包含:
     - `donateCashEnabled`: 现金红包打赏开关 (Y/N)
     - `donateGiftEnabled`: 礼物打赏开关 (Y/N)
     - `cashDonate`: 现金红包配置
       - `cashs`: 固定打赏金额数组
       - `cashMin`: 最低打赏金额
     - `giftDonate`: 礼物打赏配置
       - `payWay`: 支付方式 (CASH/POINT)
       - `cashPays`: 现金支付礼物列表
       - `pointPays`: 积分支付礼物列表

2. **更新打赏配置 (`donate config update`)**
   - 使用 V4 API `/live/v4/channel/donate/update`
   - 参数: `channelId` (必需), `donateEnabled`, `donateTips`, `donateAmounts`
   - 注意: 现有 SDK `updateDonate` 方法参数较为简化，可能需要扩展以支持完整功能

3. **查询打赏记录 (`donate list`)**
   - 使用 V4 API `/live/v4/channel/reward/gift-list`
   - 参数:
     - `channelId`: 频道号 (必需)
     - `start`: 查询开始时间，13位时间戳 (必需)
     - `end`: 查询结束时间，13位时间戳 (必需)
     - `pageNumber`: 分页页码 (可选)
     - `pageSize`: 分页大小，最大300 (可选)
   - 响应包含:
     - `pageNumber`: 当前页码
     - `pageSize`: 分页大小
     - `totalPages`: 总页数
     - `totalItems`: 总记录数
     - `contents`: 打赏记录列表
       - `userId`: 用户ID
       - `nickName`: 用户昵称
       - `timestamp`: 打赏时间戳
       - `name`: 打赏名称（现金或道具名称）
       - `type`: 打赏类型 (1: 道具/积分, 2: 现金)
       - `amount`: 打赏数额
       - `sessionId`: 直播场次号

### 表格输出设计

**donate config get 表格:**
| 配置项 | 值 |
|-------|---|
| 现金打赏开关 | donateCashEnabled |
| 礼物打赏开关 | donateGiftEnabled |
| 固定金额选项 | cashs (逗号分隔) |
| 最低金额 | cashMin |
| 支付方式 | payWay |

**donate list 表格列:**
| 列名 | 字段 | 说明 |
|------|------|------|
| 用户ID | userId | 15字符截断 |
| 昵称 | nickName | 20字符截断 |
| 打赏名称 | name | - |
| 类型 | type | 现金/道具 |
| 金额 | amount | - |
| 打赏时间 | timestamp | 格式化时间 |
| 场次ID | sessionId | 10字符截断 |

### 时间参数处理

`donate list` 命令的 `--start` 和 `--end` 参数：
- 接受 13 位毫秒级时间戳
- 可以支持额外的时间格式（如 ISO 8601 字符串），自动转换为时间戳
- 建议提供友好的错误提示，说明时间格式要求

## 测试

### 测试文件位置
[来源: architecture.md]
- 单元测试: `packages/cli/src/handlers/donate.handler.test.ts`
- 命令测试: `packages/cli/src/commands/donate.commands.test.ts`
- SDK 测试: `packages/sdk/src/services/v4/channel.service.test.ts` (新增 listRewardGift 测试)

### 测试标准
[来源: architecture.md]
- 使用 Jest 29.7.0 测试框架
- 测试命名: `describe-it` 模式，描述性测试名称
- 测试结构: `Arrange-Act-Assert` 模式
- Mock 策略: 使用 Jest mocks 模拟 SDK 响应
- 覆盖率要求: 单元测试覆盖率必须 >= 80%

### 具体测试要求
- **Handler 测试**: 验证业务逻辑、输入验证、错误处理
  - 测试获取打赏配置
  - 测试更新打赏配置
  - 测试查询打赏记录（带时间范围）
  - 测试表格和 JSON 输出格式
- **命令测试**: 验证 CLI 选项解析和帮助输出
- **错误场景测试**: 验证参数验证失败、API 调用失败的处理
- **SDK 测试**: 验证新增的 listRewardGift 方法

## 变更日志

| 日期 | 版本 | 描述 | 作者 |
|------|------|------|------|
| 2026-03-24 | 1.0 | Initial story creation for donate management commands | Claude Code Agent |
