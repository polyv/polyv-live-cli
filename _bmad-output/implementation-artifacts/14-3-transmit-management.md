# Story 14.3: 转播管理命令

Status: done

## Story

作为运营人员或 PaaS 客户开发者，
我想要通过 CLI 管理直播间的转播功能，
以便将一个频道的直播内容同步转发到多个其他频道。

## Acceptance Criteria

1. `transmit create` 命令支持批量创建接收转播的频道
2. `transmit list` 命令支持获取频道的转播关联列表
3. 所有命令支持 `--output table|json` 输出格式
4. 参数验证完善，错误消息友好

## Tasks / Subtasks

- [x] Task 1: 创建 TypeScript 类型定义 (AC: #3, #4)
  - [x] 1.1 创建 `packages/cli/src/types/transmit.ts` 类型文件
  - [x] 1.2 定义 `TransmitServiceConfig` 接口
  - [x] 1.3 定义命令选项接口 (`TransmitCreateOptions`, `TransmitListOptions`)
  - [x] 1.4 定义 API 响应类型 (`TransmitChannelInfo`, `TransmitAssociation`)
  - [x] 1.5 在 `packages/cli/src/types/index.ts` 中导出新类型

- [x] Task 2: 创建 SDK 服务包装类 (AC: #1, #2)
  - [x] 2.1 创建 `packages/cli/src/services/transmit-service.ts` 文件
  - [x] 2.2 实现 `TransmitServiceSdk` 类
  - [x] 2.3 实现 `batchCreateTransmitChannels(channelId, names)` 方法 - POST `/live/v3/channel/transmit/batch-create`
  - [x] 2.4 实现 `getTransmitAssociations(channelId)` 方法 - GET `/live/v3/channel/transmit/get-associations`

- [x] Task 3: 创建 Handler 处理器 (AC: #1-#4)
  - [x] 3.1 创建 `packages/cli/src/handlers/transmit.handler.ts` 文件
  - [x] 3.2 实现 `TransmitHandler` 类继承 `BaseHandler`
  - [x] 3.3 实现 `batchCreateTransmitChannels(options)` 方法
  - [x] 3.4 实现 `getTransmitAssociations(options)` 方法

- [x] Task 4: 创建命令定义 (AC: #1-#4)
  - [x] 4.1 创建 `packages/cli/src/commands/transmit.commands.ts` 文件
  - [x] 4.2 注册 `transmit` 父命令
  - [x] 4.3 实现 `transmit create` 子命令
  - [x] 4.4 实现 `transmit list` 子命令
  - [x] 4.5 在 `packages/cli/src/index.ts` 中注册命令

- [x] Task 5: 编写单元测试 (AC: All)
  - [x] 5.1 创建 `packages/cli/src/commands/transmit.commands.test.ts` 测试文件
  - [x] 5.2 测试 `TransmitServiceSdk` 方法
  - [x] 5.3 测试 `TransmitHandler` 方法
  - [x] 5.4 测试命令选项验证
  - [x] 5.5 运行测试确保覆盖率 >= 80%

- [ ] Task 6: 更新 Skill 文档 (AC: All)
  - [ ] 6.1 更新 `skills/polyv-live-cli/SKILL.md` 添加 transmit 命令说明
  - [ ] 6.2 创建 `skills/polyv-live-cli/references/transmit.md` 详细文档

## Dev Notes

### API 文档参考

| 功能 | API 文档 | HTTP 方法 | 端点 |
|-----|--------|---------|------|
| 批量创建转播频道 | `docs/api/channel/operate/batch_add_transmit.md` | POST | `/live/v3/channel/transmit/batch-create` |
| 获取转播关联 | `docs/api/channel/operate/get_transmit_associations.md` | GET | `/live/v3/channel/transmit/get-associations` |

### 命令设计

```bash
# 批量创建接收转播频道
polyv-cli transmit create --channelId <id> --names "接收频道1,接收频道2" [-o table|json]

# 获取转播关联列表
polyv-cli transmit list --channelId <id> [-o table|json]
```

### 核心类型定义参考

```typescript
// 转播频道信息（创建返回）
interface TransmitChannelInfo {
  channelId: number;          // 频道号
  name: string;               // 频道名称
  channelPasswd: string;      // 频道密码
  authType: string;           // 频道观看条件
  streamType: string;         // 频道推流方式
  stream: string;             // 频道流名
  status: string;             // 频道状态
  // ... 其他字段
}

// 转播关联信息
interface TransmitAssociation {
  channelId: string | null;     // 发起转播频道号，接收频道时为null
  receiveChannelId: string;    // 接收转播频道号
}
```

### 验证规则

1. **channelId**: 必填，不能为空
2. **names**: 创建时必填，逗号分隔的频道名称列表，最多100个，发起频道最多支持500个接收频道
3. **output**: 可选，默认 table，必须是 table 或 json

### 项目结构注意事项

- 类型文件放在 `packages/cli/src/types/transmit.ts`
- Handler 文件使用 `*.handler.ts` 命名约定
- 命令文件使用 `*.commands.ts` 命名约定
- 服务包装类使用 `*-service.ts` 命名约定（如 `transmit-service.ts`）
- 所有文件使用 TypeScript + kebab-case 文件命名

### 参考已有实现

- 娡式参考: `packages/cli/src/commands/card-push.commands.ts` - 命令注册模式
- Handler 参考: `packages/cli/src/handlers/card-push.handler.ts` - 验证和输出模式
- 服务参考: `packages/cli/src/services/card-push-service.ts` - SDK 包装模式

### 测试标准

- 单元测试覆盖率: >= 80%
- 测试框架: Jest
- 测试文件命名: `*.test.ts`
- Mock 外部依赖 (SDK, API 调用)
- 测试成功和失败场景

### References

- [Source: docs/api/channel/operate/batch_add_transmit.md] - 批量创建转播 API
- [Source: docs/api/channel/operate/get_transmit_associations.md] - 获取转播关联 API
- [Source: packages/cli/src/commands/card-push.commands.ts] - 命令模式参考
- [Source: packages/cli/src/handlers/card-push.handler.ts] - Handler 模式参考
- [Source: packages/cli/src/services/card-push-service.ts] - 服务包装模式
- [Source: docs/api/module_doc_mapping.json] - API 模块映射

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
