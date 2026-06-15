# Story 11-1: 聊天消息管理命令

Status: done

## 故事
作为一个运营人员或 PaaS 宮户开发者
我 我想要通过 CLI 使用 `chat send`、`chat list`、 `chat delete` 等命令管理聊天消息
            以便我能够高效地管理直播间的聊天互动内容。

## 验收标准 (ACs)

1. AC1: `chat send` 命令成功发送管理员聊天消息（支持文本和图片消息）
2. AC2: `chat list` 命令支持分页查询聊天记录（支持时间范围、用户类型过滤）
3. AC3: `chat delete` 命令支持删除指定聊天消息（支持单条和清空全部）
4. AC4: 所有命令支持 `--output table|json` 输出格式
5. AC5: 遵循 ATDD 开发模式，先编写测试,再实现功能

6. AC6: 复用已有的 SDK `ChatService` 服务，无需新增 SDK 方法
7. AC7: 错误消息友好,清晰提示参数验证失败或API 调用失败的情况

8. AC8: 表格输出格式清晰，显示消息ID、内容、发送时间、发送者昵称等信息

## 任务 / 子任务
- [ ] **任务1: 创建 CLI 类型定义 (AC: 1-5, 8)
  - [ ] 在 `packages/cli/src/types/chat.ts` 中定义接口：
    - `ChatSendOptions` - 发送聊天消息选项
    - `ChatListOptions` - 查询聊天记录选项
    - `ChatDeleteOptions` - 删除聊天消息选项
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- chat`
  - [ ] 测试通过
- [ ] **任务2: 创建 ChatHandler 类 (AC: 1-5, 6- 8)
  - [ ] 在 `packages/cli/src/handlers/chat.handler.ts` 中创建 `ChatHandler` 类
  - [ ] 实现 `send` 方法，    - 调用 `this.productService.sendAdminMsg()` (SDK)
    - [ ] 处理响应并格式化输出
  - [ ] 实现 `list` 方法
    - [ ] 调用 `this.productService.getHistoryPage()` (SDK)
    - [ ] 支持分页和时间范围过滤
    - [ ] 处理响应并格式化输出
  - [ ] 实现 `delete` 方法
    - [ ] 调用 `this.productService.delChat()` (SDK)
    - [ ] 支持 `--clear` 参数清空全部聊天
    - [ ] 处理响应并格式化输出
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- chat`
  - [ ] 测试通过
- [ ] **任务3: 创建 CLI 命令注册 (AC: 1-5)
  - [ ] 在 `packages/cli/src/commands/chat.commands.ts` 中创建命令:
  - [ ] 实现 `chat send` 子命令
    - [ ] 定义选项: `--channel-id` / `-c`, `--msg` / `-m`, `--img-url` / `-i`, `--nickname` / `-n`, `--actor` / `-a`, `--pic` / `-p`, `--output` / `-o`
  - [ ] 实现 `chat list` 子命令
    - [ ] 定义选项: `--channel-id` / `-c`, `--start-day`, `--end-day`, `--page`, `--size`, `--user-type`, `--status`, `--output` / `-o`
  - [ ] 实现 `chat delete` 子命令
    - [ ] 定义选项: `--channel-id` / `-c`, `--message-id` / `-m`, `--clear` (清空全部), `--output` / `-o`
  - [ ] 在 `packages/cli/src/index.ts` 中注册命令
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- chat`
  - [ ] 测试通过
- [ ] **任务4: 单元测试 (所有AC)
  - [ ] 确保所有现有测试继续通过
  - [ ] 为 `ChatHandler` 添加单元测试
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
- **API 端点**:
  - 发送消息: `POST /live/v3/channel/chat/send-admin-msg`
  - 查询记录: `GET /live/v3/channel/chat/get-history-page`
  - 删除消息: `POST /live/v2/chat/{channelId}/delChat`
  - 清空记录: `POST /live/v2/chat/{channelId}/cleanChat`
- **认证**: MD5 签名认证 (appId, timestamp, sign)
- **SDK 服务**: 使用已有的 `ChatService` 类 (packages/sdk/src/services/chat.service.ts)
### SDK 方法映射
| CLI 命令 | SDK 方法 | API 端点 |
|---------|----------|---------|
| `chat send` | `chatService.sendAdminMsg()` | `POST /live/v3/channel/chat/send-admin-msg` |
| `chat list` | `chatService.getHistoryPage()` | `GET /live/v3/channel/chat/get-history-page` |
| `chat delete` | `chatService.delChat()` | `POST /live/v2/chat/{channelId}/delChat` |
| `chat delete --clear` | `chatService.cleanChat()` | `POST /live/v2/chat/{channelId}/cleanChat` |
### 编码标准要求
[来源: docs/architecture/coding-standards.md]
- 所有 public 方法必须有 JSDoc 注释
- 使用明确的 TypeScript 类型, 馆使用 `any` 类型
- 异步操作必须有完整的错误处理
- 遵循现有的命名约定 (camelCase 变量, PascalCase 类)
- 单元测试覆盖率必须 >= 80%
### 娡式参考
参考现有的 `ProductHandler` 模式:
- Handler 类继承 `BaseHandler`
- 通过构造函数注入 `ProductServiceSdk` (SDK wrapper)
- 每个方法实现输入验证、业务逻辑调用、输出格式化
### 庺议参考文档
- API 文档: `docs/api/chat/message/send_message.md`
- API 文档: `docs/api/chat/message/get_message_list.md`
- API 文档: `docs/api/chat/message/delete_message_by_id.md`
- API 文档: `docs/api/chat/message/delete_all_message.md`
- SDK 服务: `packages/sdk/src/services/chat.service.ts`
- SDK 类型: `packages/sdk/src/types/chat.ts`
## 测试
### 测试文件位置
[来源: docs/architecture/source-tree.md]
- 单元测试: `packages/cli/src/types/chat.test.ts`, `packages/cli/src/handlers/chat.handler.test.ts`, `packages/cli/src/commands/chat.commands.test.ts`
### 测试标准
[来源: docs/architecture/coding-standards.md]
- 使用 Jest 29.7.0 测试框架
- 测试命名: `describe-it` 模式, 描述性测试名称
- 测试结构: `Arrange-Act-Assert` 模式
- Mock 策略: 使用 Jest mocks for SDK responses
- 覆盖率要求: 单元测试覆盖率必须 >= 80%
### 具体测试要求
- **类型测试**: 验证 ChatSendOptions/ChatListOptions/ChatDeleteOptions 接口定义正确
- **Handler 测试**: 验证业务逻辑、输入验证、错误处理
- **命令测试**: 验证 CLI 选项解析和帮助输出
- **错误场景测试**: 验证参数验证失败、 API 调用失败的处理
## 变更日志
| 日期 | 版本 | 描述 | 作者 |
|------|---------|-------------|--------|
| 2026-03-23 | 1.0 | Initial story creation for chat message management commands | Claude Code Agent |
