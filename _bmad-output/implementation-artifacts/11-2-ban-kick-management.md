# Story 11.2: 禁言踢人管理命令

Status: done

## 故事

作为一个运营人员或 PaaS 客户开发者，
我想要通过 CLI 使用 `chat ban`、`chat unban`、`chat kick`、`chat unkick` 等命令管理禁言和踢人，
以便我能够高效地管理直播间观众秩序。

## 验收标准 (ACs)

1. AC1: `chat ban` 命令支持禁言指定观众（支持频道级和账号级）
2. AC2: `chat unban` 命令支持解除禁言指定观众
3. AC3: `chat kick` 命令支持踢出指定观众（支持频道级和全平台）
4. AC4: `chat unkick` 命令支持取消踢出指定观众
5. AC5: `chat banned list` 命令支持查询禁言列表（支持用户/IP/严禁词）
6. AC6: `chat kicked list` 命令支持查询被踢人列表
7. AC7: 所有命令支持 `--output table|json` 输出格式
8. AC8: 遵循 ATDD 开发模式，先编写测试，再实现功能
9. AC9: 复用已有的 SDK `ChatService` 服务，无需新增 SDK 方法
10. AC10: 错误消息友好，清晰提示参数验证失败或 API 调用失败的情况
11. AC11: 表格输出格式清晰，显示用户ID、昵称、禁言状态等信息

## 任务 / 子任务

- [ ] **任务1: 扩展 CLI 类型定义 (AC: 1-11)**
  - [ ] 在 `packages/cli/src/types/chat.ts` 中添加接口：
    - `ChatBanOptions` - 禁言用户选项
    - `ChatUnbanOptions` - 解除禁言选项
    - `ChatKickOptions` - 踢人选项
    - `ChatUnkickOptions` - 取消踢人选项
    - `ChatBannedListOptions` - 查询禁言列表选项
    - `ChatKickedListOptions` - 查询被踢人列表选项
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- chat`
  - [ ] 测试通过

- [ ] **任务2: 扩展 ChatHandler 类 (AC: 1-11)**
  - [ ] 在 `packages/cli/src/handlers/chat.handler.ts` 中添加方法：
    - [ ] 实现 `banUser` 方法 - 调用 SDK `updateBannedUser` / `updateBannedViewer`
    - [ ] 实现 `unbanUser` 方法 - 调用 SDK `updateBannedUser` / `updateBannedViewer`
    - [ ] 实现 `kickUser` 方法 - 调用 SDK `forbidChannelKickUsers` / `forbidKickUsers`
    - [ ] 实现 `unkickUser` 方法 - 调用 SDK `forbidChannelUnkickUsers` / `forbidUnkickUsers`
    - [ ] 实现 `listBanned` 方法 - 调用 SDK `getChannelBannedUserList` / `getChannelBannedList`
    - [ ] 实现 `listKicked` 方法 - 调用 SDK `getChannelKickedUserList`
    - [ ] 实现输入验证和输出格式化
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- chat`
  - [ ] 测试通过

- [ ] **任务3: 注册 CLI 命令 (AC: 1-7)**
  - [ ] 在 `packages/cli/src/commands/chat.commands.ts` 中添加命令：
    - [ ] 实现 `chat ban` 子命令
      - 选项: `--channel-id` / `-c`, `--user-ids` / `-u`, `--global`, `--output` / `-o`
    - [ ] 实现 `chat unban` 子命令
      - 选项: `--channel-id` / `-c`, `--user-ids` / `-u`, `--global`, `--output` / `-o`
    - [ ] 实现 `chat kick` 子命令
      - 选项: `--channel-id` / `-c`, `--viewer-ids` / `-v`, `--nick-names` / `-n`, `--global`, `--output` / `-o`
    - [ ] 实现 `chat unkick` 子命令
      - 选项: `--channel-id` / `-c`, `--viewer-ids` / `-v`, `--nick-names` / `-n`, `--global`, `--output` / `-o`
    - [ ] 实现 `chat banned list` 子命令
      - 选项: `--channel-id` / `-c`, `--type` / `-t` (userId|ip|badword), `--output` / `-o`
    - [ ] 实现 `chat kicked list` 子命令
      - 选项: `--channel-id` / `-c`, `--output` / `-o`
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- chat`
  - [ ] 测试通过

- [ ] **任务4: 单元测试 (所有AC)**
  - [ ] 确保所有现有测试继续通过
  - [ ] 为 `ChatHandler` 新方法添加单元测试
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
| `chat ban` (频道级) | `chatService.updateBannedUser({ toBanned: 'Y' })` | `POST /live/v3/channel/chat/banned-user` |
| `chat ban --global` | `chatService.updateBannedViewer({ banned: 'Y' })` | `POST /live/v3/user/chat/banned-user/update` |
| `chat unban` (频道级) | `chatService.updateBannedUser({ toBanned: 'N' })` | `POST /live/v3/channel/chat/banned-user` |
| `chat unban --global` | `chatService.updateBannedViewer({ banned: 'N' })` | `POST /live/v3/user/chat/banned-user/update` |
| `chat kick` (频道级) | `chatService.forbidChannelKickUsers()` | `POST /live/v4/chat/channel/forbid/kick-users` |
| `chat kick --global` | `chatService.forbidKickUsers()` | `POST /live/v4/chat/forbid/kick-users` |
| `chat unkick` (频道级) | `chatService.forbidChannelUnkickUsers()` | `POST /live/v4/chat/channel/forbid/unkick-users` |
| `chat unkick --global` | `chatService.forbidUnkickUsers()` | `POST /live/v4/chat/forbid/unkick-users` |
| `chat banned list --type userId` | `chatService.getChannelBannedUserList()` | `GET /live/v3/channel/chat/get-banned-list` |
| `chat banned list --type ip` | `chatService.getChannelBannedUserList()` | `GET /live/v3/channel/chat/get-banned-list` |
| `chat banned list --type badword` | `chatService.getChannelBannedList()` | `GET /live/v3/channel/badword/list` |
| `chat kicked list` | `chatService.getChannelKickedUserList()` | `POST /live/v3/channel/chat/list-kicked` |

### 认证
- MD5 签名认证 (appId, timestamp, sign)

### SDK 服务
- 使用已有的 `ChatService` 类 (`packages/sdk/src/services/chat.service.ts`)
- SDK 类型定义在 `packages/sdk/src/types/chat-banned.ts`

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
- 通过构造函数注入 `ChatServiceSdk` (SDK wrapper)
- 每个方法实现输入验证、业务逻辑调用、输出格式化
- 使用 `--global` 标志区分频道级和账号级操作

### 命令设计示例

```bash
# 禁言用户 (频道级)
polyv-live-cli chat ban -c "3151318" -u "userId1,userId2"

# 禁言用户 (全平台)
polyv-live-cli chat ban -u "userId1,userId2" --global

# 解除禁言
polyv-live-cli chat unban -c "3151318" -u "userId1"

# 踢人 (频道级)
polyv-live-cli chat kick -c "3151318" -v "viewer1,viewer2" -n "昵称1,昵称2"

# 踢人 (全平台)
polyv-live-cli chat kick -v "viewer1,viewer2" -n "昵称1,昵称2" --global

# 取消踢人
polyv-live-cli chat unkick -c "3151318" -v "viewer1" -n "昵称1"

# 查询禁言用户列表
polyv-live-cli chat banned list -c "3151318" --type userId

# 查询禁言IP列表
polyv-live-cli chat banned list -c "3151318" --type ip

# 查询严禁词列表
polyv-live-cli chat banned list -c "3151318" --type badword

# 查询被踢人列表
polyv-live-cli chat kicked list -c "3151318"
```

### 建议参考文档
- API 文档: `docs/api/chat/banned/update_banned_user.md`
- API 文档: `docs/api/chat/banned/update_user_banned_viewer.md`
- API 文档: `docs/api/chat/banned/forbid_channel_kick_users.md`
- API 文档: `docs/api/chat/banned/forbid_kick_users.md`
- API 文档: `docs/api/chat/banned/get_channel_banned_user_list.md`
- API 文档: `docs/api/chat/banned/get_channel_banned_list.md`
- API 文档: `docs/api/chat/banned/get_channel_kicked_user_list.md`
- SDK 服务: `packages/sdk/src/services/chat.service.ts`
- SDK 类型: `packages/sdk/src/types/chat-banned.ts`
- 前一 Story 实现: `_bmad-output/implementation-artifacts/11-1-chat-message-management.md`

### 前一 Story (11-1) 学习要点
1. Handler 类通过 `ChatServiceSdk` 包装器调用 SDK
2. 使用 `BaseHandler` 的 `executeWithErrorHandling` 进行统一错误处理
3. 输出格式化使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法
4. 验证失败抛出 `PolyVValidationError`
5. 命令注册使用 Commander.js 的链式调用
6. `loadAuthAndServiceConfig` 辅助函数处理认证配置

## 测试

### 测试文件位置
[来源: architecture.md]
- 单元测试: `packages/cli/src/handlers/chat.handler.test.ts`
- 命令测试: `packages/cli/src/commands/chat.commands.test.ts`

### 测试标准
[来源: architecture.md]
- 使用 Jest 29.7.0 测试框架
- 测试命名: `describe-it` 模式，描述性测试名称
- 测试结构: `Arrange-Act-Assert` 模式
- Mock 策略: 使用 Jest mocks 模拟 SDK 响应
- 覆盖率要求: 单元测试覆盖率必须 >= 80%

### 具体测试要求
- **Handler 测试**: 验证业务逻辑、输入验证、错误处理
  - 测试频道级和账号级操作的区分
  - 测试批量用户操作
  - 测试表格和 JSON 输出格式
- **命令测试**: 验证 CLI 选项解析和帮助输出
- **错误场景测试**: 验证参数验证失败、API 调用失败的处理

## 变更日志

| 日期 | 版本 | 描述 | 作者 |
|------|------|------|------|
| 2026-03-23 | 1.0 | Initial story creation for ban/kick management commands | Claude Code Agent |
