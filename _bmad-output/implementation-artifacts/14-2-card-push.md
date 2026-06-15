# Story 14.2: 卡片推送命令

Status: done

## Story

作为运营人员或 PaaS 客户开发者，
我想要通过 CLI 管理直播间的卡片推送功能，
以便在直播过程中向观众推送营销卡片，提升转化率。

## Acceptance Criteria

1. `card-push list` 命令支持列出频道的所有卡片推送配置
2. `card-push create` 命令支持创建新的卡片推送配置
3. `card-push update` 命令支持更新现有卡片推送配置
4. `card-push push` 命令支持立即推送指定卡片到观众端
5. `card-push cancel` 命令支持取消正在推送的卡片
6. `card-push delete` 命令支持删除卡片推送配置
7. 所有命令支持 `--output table|json` 输出格式
8. 参数验证完善，错误消息友好

## Tasks / Subtasks

- [ ] Task 1: 创建 TypeScript 类型定义 (AC: #7, #8)
  - [ ] 1.1 创建 `packages/cli/src/types/card-push.ts` 类型文件
  - [ ] 1.2 定义 `CardPushServiceConfig` 接口
  - [ ] 1.3 定义命令选项接口 (`CardPushListOptions`, `CardPushCreateOptions`, `CardPushUpdateOptions`, `CardPushPushOptions`, `CardPushCancelOptions`, `CardPushDeleteOptions`)
  - [ ] 1.4 定义 API 响应类型 (`CardPush`, `CreatedCardPush`)
  - [ ] 1.5 在 `packages/cli/src/types/index.ts` 中导出新类型

- [ ] Task 2: 创建 SDK 服务包装类 (AC: #1-#6)
  - [ ] 2.1 创建 `packages/cli/src/services/card-push-service.ts` 文件
  - [ ] 2.2 实现 `CardPushServiceSdk` 类
  - [ ] 2.3 实现 `listCardPushes(channelId)` 方法 - GET `/live/v4/channel/card-push/list`
  - [ ] 2.4 实现 `createCardPush(params)` 方法 - GET `/live/v4/channel/card-push/create`
  - [ ] 2.5 实现 `updateCardPush(params)` 方法 - POST `/live/v4/channel/card-push/update`
  - [ ] 2.6 实现 `pushCard(params)` 方法 - POST `/live/v4/channel/card-push/push`
  - [ ] 2.7 实现 `cancelPush(params)` 方法 - POST `/live/v4/channel/card-push/cancel-push`
  - [ ] 2.8 实现 `deleteCardPush(params)` 方法 - POST `/live/v4/channel/card-push/delete`

- [ ] Task 3: 创建 Handler 处理器 (AC: #1-#8)
  - [ ] 3.1 创建 `packages/cli/src/handlers/card-push.handler.ts` 文件
  - [ ] 3.2 实现 `CardPushHandler` 类继承 `BaseHandler`
  - [ ] 3.3 实现 `listCardPushes(options)` 方法
  - [ ] 3.4 实现 `createCardPush(options)` 方法
  - [ ] 3.5 实现 `updateCardPush(options)` 方法
  - [ ] 3.6 实现 `pushCard(options)` 方法
  - [ ] 3.7 实现 `cancelPush(options)` 方法
  - [ ] 3.8 实现 `deleteCardPush(options)` 方法
  - [ ] 3.9 实现私有验证方法
  - [ ] 3.10 实现表格输出格式化方法

- [ ] Task 4: 创建命令定义 (AC: #1-#8)
  - [ ] 4.1 创建 `packages/cli/src/commands/card-push.commands.ts` 文件
  - [ ] 4.2 实现 `registerCardPushCommands(program)` 函数
  - [ ] 4.3 注册 `card-push list` 子命令
  - [ ] 4.4 注册 `card-push create` 子命令
  - [ ] 4.5 注册 `card-push update` 子命令
  - [ ] 4.6 注册 `card-push push` 子命令
  - [ ] 4.7 注册 `card-push cancel` 子命令
  - [ ] 4.8 注册 `card-push delete` 子命令

- [ ] Task 5: 注册命令到 CLI 入口 (AC: #1-#6)
  - [ ] 5.1 在 `packages/cli/src/index.ts` 中导入 `registerCardPushCommands`
  - [ ] 5.2 调用 `registerCardPushCommands(program)`

- [ ] Task 6: 编写单元测试 (AC: All)
  - [ ] 6.1 创建 `packages/cli/src/services/card-push-service.test.ts`
  - [ ] 6.2 创建 `packages/cli/src/handlers/card-push.handler.test.ts`
  - [ ] 6.3 创建 `packages/cli/src/commands/card-push.commands.test.ts`
  - [ ] 6.4 运行测试确保覆盖率 >= 80%

- [ ] Task 7: 更新 Skill 文档 (AC: All)
  - [ ] 7.1 更新 `skills/polyv-live-cli/SKILL.md` 添加 card-push 命令说明
  - [ ] 7.2 创建 `skills/polyv-live-cli/references/card-push.md` 详细文档

## Dev Notes

### API 文档参考

| 功能 | API 文档 | HTTP 方法 | 端点 |
|-----|--------|---------|------|
| 列出卡片推送 | `docs/api/v4/channel/market/cardPush/get.md` | GET | `/live/v4/channel/card-push/list` |
| 创建卡片推送 | `docs/api/v4/channel/market/cardPush/create.md` | GET | `/live/v4/channel/card-push/create` |
| 更新卡片推送 | `docs/api/v4/channel/market/cardPush/update.md` | POST | `/live/v4/channel/card-push/update` |
| 推送卡片 | `docs/api/v4/channel/market/cardPush/push.md` | POST | `/live/v4/channel/card-push/push` |
| 取消推送 | `docs/api/v4/channel/market/cardPush/cancelPush.md` | POST | `/live/v4/channel/card-push/cancel-push` |
| 删除卡片推送 | `docs/api/v4/channel/market/cardPush/delete.md` | POST | `/live/v4/channel/card-push/delete` |

### 命令设计

```bash
# 列出卡片推送配置
polyv-cli card-push list --channelId <id> [-o table|json]

# 创建卡片推送配置
polyv-cli card-push create --channelId <id> --imageType <type> --title <title> --link <url> \
  --duration <seconds> --showCondition <PUSH|WATCH> \
  [--cardType <common|qrCode>] \
  [--conditionValue <seconds>] [--conditionUnit <SECONDS|MINUTES>] \
  [--countdownMsg <msg>] [--enterEnabled <Y|N>] \
  [--linkEnabled <Y|N>] [--redirectType <iframe|tab>] \
  [-o table|json]

# 更新卡片推送配置
polyv-cli card-push update --channelId <id> --cardPushId <id> \
  [--title <title>] [--link <url>] \
  [--duration <seconds>] [--showCondition <PUSH|WATCH>] \
  [-o table|json]

# 推送卡片到观众端
polyv-cli card-push push --channelId <id> --cardPushId <id> [-o table|json]

# 取消正在推送的卡片
polyv-cli card-push cancel --channelId <id> --cardPushId <id> [-o table|json]

# 删除卡片推送配置
polyv-cli card-push delete --channelId <id> --cardPushId <id> [-o table|json]
```

### 核心类型定义参考

```typescript
// 卡片推送信息
interface CardPush {
  id: number;                    // 卡片推送ID
  channelId: number;             // 频道ID
  title: string;                 // 卡片标题，最多16个字符
  cardType: 'common' | 'qrCode'; // 卡片类型
  imageType: 'giftbox' | 'redpack' | 'custom' | 'weixinWork'; // 卡片样式类型
  duration: number;              // 卡片倒计时时长 (0,5,10,20,30秒)
  durationPosition?: 'bottom' | 'top'; // 倒计时显示位置
  link: string;                  // 卡片跳转链接
  pushStatus: 'Y' | 'N' | 'L';   // 推送状态 (Y:推送中, N:未推送, L:上次推送)
  enterEnabled: 'Y' | 'N';       // 卡片入口开关
  showCondition: 'PUSH' | 'WATCH'; // 弹出方式
  conditionValue?: number;       // 观看时长
  conditionUnit?: 'SECONDS' | 'MINUTES'; // 观看时长单位
  countdownMsg?: string;         // 倒计时文案，最多8个字符
  linkEnabled: 'Y' | 'N';        // 卡片跳转开关
  redirectType?: 'iframe' | 'tab'; // 跳转方式
  createdTime: number;           // 创建时间 (13位时间戳)
  lastModified?: number;         // 修改时间
  pushTime?: number;             // 推送时间
  pushEndTime?: number;          // 推送结束时间
}
```

### 参考实现模式

参考 Story 14-1 (promotion.commands.ts, promotion.handler.ts, promotion-service.ts) 的实现模式:
- 命令文件: `packages/cli/src/commands/promotion.commands.ts`
- Handler 文件: `packages/cli/src/handlers/promotion.handler.ts`
- Service 文件: `packages/cli/src/services/promotion-service.ts`
- 类型文件: `packages/cli/src/types/promotion.ts`

### 项目结构注意事项

- 命令文件使用 `*.commands.ts` 命名约定
- Handler 文件使用 `*.handler.ts` 命名约定
- Service 文件使用 `*-service.ts` 命名约定
- 类型文件放在 `packages/cli/src/types/` 目录
- 所有文件使用 TypeScript + kebab-case 命名

### 验证规则

1. **channelId**: 必填，不能为空
2. **cardPushId**: 更新/推送/取消/删除时必填
3. **imageType**: 必填，枚举值: giftbox, redpack, custom, weixinWork
4. **title**: 创建时必填，最多16个字符
5. **link**: 创建时必填，需要带 http:// 等协议头
6. **duration**: 创建时必填，枚举值: 0, 5, 10, 20, 30
7. **showCondition**: 创建时必填，枚举值: PUSH, WATCH
8. **conditionUnit**: 当 showCondition 为 WATCH 时必填，枚举值: SECONDS, MINUTES
9. **countdownMsg**: 当 showCondition 为 WATCH 时有效，最多8个字符

### 测试标准

- 单元测试覆盖率: >= 80%
- 测试框架: Jest
- 测试文件命名: `*.test.ts`
- Mock 外部依赖 (SDK, API 调用)
- 测试成功和失败场景

### References

- [Source: docs/api/v4/channel/market/cardPush/get.md] - 列出卡片推送 API
- [Source: docs/api/v4/channel/market/cardPush/create.md] - 创建卡片推送 API
- [Source: docs/api/v4/channel/market/cardPush/update.md] - 更新卡片推送 API
- [Source: docs/api/v4/channel/market/cardPush/push.md] - 推送卡片 API
- [Source: docs/api/v4/channel/market/cardPush/cancelPush.md] - 取消推送 API
- [Source: docs/api/v4/channel/market/cardPush/delete.md] - 删除卡片推送 API
- [Source: docs/api/MODULE_DOC_MAPPING.json] - cardPush 模块定义
- [Source: packages/cli/src/commands/promotion.commands.ts] - 参考命令模式
- [Source: packages/cli/src/handlers/promotion.handler.ts] - 参考Handler模式
- [Source: packages/cli/src/services/promotion-service.ts] - 参考Service模式

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
