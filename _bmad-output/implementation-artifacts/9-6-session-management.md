# Story 9.6: 场次管理命令

Status: done

## Story

作为运营人员或 PaaS 客户开发者,
我希望通过 CLI 管理直播频道的场次信息,
以便查看直播场次列表和场次详情。

## Acceptance Criteria

1. **AC1**: `session list` 命令支持 `--channel-id` 参数获取频道场次列表
2. **AC2**: `session list` 命令支持分页参数（`--page`, `--page-size`）
3. **AC3**: `session list` 命令支持日期范围过滤（`--start-date`, `--end-date`）
4. **AC4**: `session get` 命令支持通过 `--session-id` 参数获取场次详情
5. **AC5**: 所有命令支持 `--output` 参数选择 table 或 json 输出格式
6. **AC6**: 表格输出格式清晰，显示场次信息
7. **AC7**: JSON 输出完整包含所有 API 返回字段

## Tasks / Subtasks

- [x] **Task 1: CLI 类型定义** (AC: 1,2,3,4,5,6,7)
  - [x] 1.1 创建 `packages/cli/src/types/session.ts` 文件
  - [x] 1.2 定义 `SessionServiceConfig` 接口
  - [x] 1.3 定义 `SessionListOptions` 接口（channelId, page, pageSize, startDate, endDate, output）
  - [x] 1.4 定义 `SessionGetOptions` 接口（channelId, sessionId, output）
  - [x] 1.5 定义 `SessionDisplayItem` 接口用于表格显示

- [x] **Task 2: CLI Service SDK 实现** (AC: 1,4)
  - [x] 2.1 创建 `packages/cli/src/services/session.service.sdk.ts` 文件
  - [x] 2.2 实现 `SessionServiceSdk` 类
  - [x] 2.3 实现 `getSessionList()` 方法，调用 SDK `client.v4Channel.sessionList()`
  - [x] 2.4 实现 `getSession()` 方法，调用 SDK `client.v4Channel.sessionGet()`

- [x] **Task 3: CLI Handler 实现** (AC: 全部)
  - [x] 3.1 创建 `packages/cli/src/handlers/session.handler.ts` 文件
  - [x] 3.2 创建 `SessionHandler` 类继承 `BaseHandler`
  - [x] 3.3 实现 `listSessions()` 方法
  - [x] 3.4 实现 `getSession()` 方法
  - [x] 3.5 实现表格格式化输出方法
  - [x] 3.6 实现 JSON 格式化输出
  - [x] 3.7 参数验证和错误处理

- [x] **Task 4: CLI Commands 注册** (AC: 1,2,3,4,5)
  - [x] 4.1 创建 `packages/cli/src/commands/session.commands.ts` 文件
  - [x] 4.2 创建 `session` 命令组
  - [x] 4.3 添加 `session list` 子命令
  - [x] 4.4 添加 `session get` 子命令
  - [x] 4.5 在 `src/index.ts` 中注册 `registerSessionCommands`
  - [x] 4.6 添加命令帮助文本和示例

- [x] **Task 5: 单元测试** (AC: 全部)
  - [x] 5.1 创建 `session.handler.test.ts` (Jest)
  - [x] 5.2 创建 `session.commands.test.ts` (Jest)
  - [x] 5.3 创建 `session.service.sdk.test.ts` (Jest)
  - [x] 5.4 确保覆盖率 >= 80%
  - [x] 5.5 测试分页参数
  - [x] 5.6 测试日期范围过滤
  - [x] 5.7 测试 JSON 输出格式

- [x] **Task 6: Skill 文件同步更新** (AC: 全部)
  - [x] 6.1 更新 `skills/polyv-live-cli/SKILL.md` 添加 session 命令说明
  - [x] 6.2 创建 `skills/polyv-live-cli/references/session-management.md` 参考文档

## Dev Notes

### API 规范

#### 1. 获取频道场次列表（V4 API）
**API**: `GET /live/v4/channel/session/new/list`
```
URL: http://api.polyv.net/live/v4/channel/session/new/list
Method: GET
```
**请求参数**:
| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳，3分钟内有效 |
| sign | true | String | 签名，32位大写MD5值 |
| channelId | false | Integer | 频道号(不传默认获取整个账号下的所有场次) |
| pageNumber | false | Integer | 分页页码，默认1 |
| pageSize | false | Integer | 分页大小，默认10 |

**响应字段 data.contents[]**:
| 字段 | 类型 | 说明 |
|------|------|------|
| channelId | Integer | 频道ID |
| sessionId | String | 场次ID |
| name | String | 场次名称 |
| startTime | String | 场次开始时间 |
| endTime | Long | 场次结束时间 |
| status | String | 场次状态(unStart:未开始，live:直播中，end:已结束，playback:回放中，expired:已过期) |
| createdTime | Long | 场次开始时间 |
| planStartTime | Long | 计划开始时间 |
| planEndTime | Long | 计划结束时间 |
| streamType | String | 流类型 |
| pushClient | String | 推流客户端类型 |
| splashImg | String | 封面图 |
| splashLargeImg | String | 竖屏、大图模式的封面图 |
| watchUrl | String | 观看地址 |
| userId | String | 用户ID |

#### 2. 获取频道场次信息（V4 API）
**API**: `GET /live/v4/channel/session/new/get`
```
URL: http://api.polyv.net/live/v4/channel/session/new/get
Method: GET
```
**请求参数**:
| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳 |
| sign | true | String | 签名 |
| channelId | false | Integer | 频道号 |
| sessionId | false | String | 场次ID |

**响应字段 data**:
| 字段 | 类型 | 说明 |
|------|------|------|
| channelId | Integer | 频道ID |
| sessionId | String | 场次ID |
| name | String | 场次名称 |
| status | String | 场次状态 |
| startTime | String | 场次开始时间 |
| endTime | Long | 场次结束时间 |
| createdTime | Long | 场次开始时间 |
| planStartTime | Long | 计划开始时间 |
| planEndTime | Long | 计划结束时间 |
| streamType | String | 流类型 |
| pushClient | String | 推流客户端类型 |
| splashImg | String | 封面图 |
| splashLargeImg | String | 竖屏、大图模式的封面图 |
| watchUrl | String | 观看地址 |
| userId | String | 用户ID |
| diskVideoVO | Object | 硬盘推流视频信息 |
| interactionScriptVO | Object | 互动脚本信息 |

### 命令设计
```bash
# 列出频道场次
polyv-live-cli session list -c "2588188"
polyv-live-cli session list -c "2588188" --page 1 --page-size 20
polyv-live-cli session list -c "2588188" -o json

# 获取场次详情
polyv-live-cli session get -c "2588188" --session-id "e9s2h3jd8f"
polyv-live-cli session get -c "2588188" --session-id "e9s2h3jd8f" -o json
```

### 表格输出设计

**session list**:
```
场次列表 - 频道: 2588188
共 2 个场次

场次ID          名称          状态      开始时间              结束时间
e9s2h3jd8f     测试场次1     已结束    2024-01-15 10:30     2024-01-15 11:00
k7d9f2h1l5     测试场次2     已结束    2024-01-14 14:00     2024-01-14 15:00
```

**session get**:
```
场次详情 - 频道: 2588188
场次ID: e9s2h3jd8f
名称: 测试场次1
状态: 已结束
开始时间: 2024-01-15 10:30
结束时间: 2024-01-15 11:00
计划开始: 2024-01-15 10:00
计划结束: 2024-01-15 12:00
推流类型: client
推流客户端: web
观看地址: https://live.polyv.net/2588188/e9s2h3jd8f
```

### 关键实现规则

#### 1. SDK 服务调用（已存在于 v4/channel.service.ts）
SDK 中已有场次管理方法：
```typescript
// packages/sdk/src/services/v4/channel.service.ts 已有实现

// 获取场次列表
async sessionList(params: ListSessionsParams): Promise<ListSessionsResponse>

// 获取场次详情
async sessionGet(params: GetSessionParams): Promise<SessionInfo>
```

#### 2. SessionServiceSdk（需新建）
```typescript
// packages/cli/src/services/session.service.sdk.ts

export class SessionServiceSdk {
  constructor(
    private authConfig: AuthConfig,
    private config: SessionServiceConfig
  ) {}

  async getSessionList(options: SessionListOptions): Promise<{
    contents: SessionDisplayItem[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    const result = await client.v4Channel.sessionList({
      channelId: options.channelId ? parseInt(options.channelId, 10) : undefined,
      pageNumber: options.page,
      pageSize: options.pageSize,
    });
    // 转换响应格式
    return {
      contents: result.contents.map(item => ({
        sessionId: item.sessionId,
        channelId: String(item.channelId),
        name: item.name,
        status: item.status,
        startTime: item.startTime,
        endTime: item.endTime,
        createdTime: item.createdTime,
        planStartTime: item.planStartTime,
        planEndTime: item.planEndTime,
        streamType: item.streamType,
        pushClient: item.pushClient,
        watchUrl: item.watchUrl,
        userId: item.userId,
      })),
      pageNumber: result.pageNumber,
      pageSize: result.pageSize,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
    };
  }

  async getSession(channelId: string, sessionId: string): Promise<SessionDisplayItem> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    const result = await client.v4Channel.sessionGet({
      channelId: parseInt(channelId, 10),
      sessionId,
    });
    return {
      sessionId: result.sessionId,
      channelId: String(result.channelId),
      name: result.name,
      status: result.status,
      startTime: result.startTime,
      endTime: result.endTime,
      createdTime: result.createdTime,
      planStartTime: result.planStartTime,
      planEndTime: result.planEndTime,
      streamType: result.streamType,
      pushClient: result.pushClient,
      watchUrl: result.watchUrl,
      userId: result.userId,
      splashImg: result.splashImg,
      splashLargeImg: result.splashLargeImg,
    };
  }
}
```

#### 3. CLI Handler 模式（参考 PlaybackHandler）
```typescript
// packages/cli/src/handlers/session.handler.ts

export interface ISessionService {
  getSessionList(options: SessionListOptions): Promise<{...}>;
  getSession(channelId: string, sessionId: string): Promise<SessionDisplayItem>;
}

export class SessionHandler extends BaseHandler {
  private readonly sessionService: ISessionService;

  constructor(
    authConfig: AuthConfig,
    serviceConfig: SessionServiceConfig,
    sessionService?: ISessionService
  ) {
    super();
    this.sessionService = sessionService ?? new SessionServiceSdk(authConfig, serviceConfig);
  }

  async listSessions(options: SessionListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // 验证 channelId
      // 调用 service
      // 显示结果
    }, 'session.list');
  }

  async getSession(options: SessionGetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // 验证参数
      // 调用 service
      // 显示结果
    }, 'session.get');
  }
}
```

#### 4. CLI 类型定义
```typescript
// packages/cli/src/types/session.ts

export interface SessionServiceConfig {
  baseUrl: string;
  timeout: number;
  debug: boolean;
}

export interface SessionListOptions {
  channelId?: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  output?: 'table' | 'json';
}

export interface SessionGetOptions {
  channelId: string;
  sessionId: string;
  output?: 'table' | 'json';
}

export interface SessionDisplayItem {
  sessionId: string;
  channelId: string;
  name?: string;
  status: string;
  startTime?: string;
  endTime?: number;
  createdTime?: number;
  planStartTime?: number;
  planEndTime?: number;
  streamType?: string;
  pushClient?: string;
  watchUrl?: string;
  userId?: string;
  splashImg?: string;
  splashLargeImg?: string;
}
```

#### 5. 场次状态映射
```typescript
const SESSION_STATUS_MAP: Record<string, string> = {
  'unStart': '未开始',
  'live': '直播中',
  'end': '已结束',
  'playback': '回放中',
  'expired': '已过期',
};
```

### 相关 API 文档
| 文档 | 路径 |
|------|------|
| 获取场次列表 | `docs/api/v4/channel/session/new/list.md` |
| 获取场次详情 | `docs/api/v4/channel/session/new/get.md` |

### 已有代码参考
- **SDK Service**: `packages/sdk/src/services/v4/channel.service.ts` - `sessionList()`, `sessionGet()` 方法（已存在）
- **SDK Types**: `packages/sdk/src/types/channel.ts` - `ListSessionsParams`, `ListSessionsResponse`, `GetSessionParams`, `SessionInfo`（已存在）
- **CLI Service SDK**: `packages/cli/src/services/playback.service.sdk.ts` - 参考模式
- **CLI Handler**: `packages/cli/src/handlers/playback.handler.ts` - 参考模式
- **CLI Commands**: `packages/cli/src/commands/playback.commands.ts` - 参考模式
- **CLI 类型**: `packages/cli/src/types/playback.ts` - 参考模式

### 与 Story 9-1~9-5 的模式对比
| 功能 | Story 9-1~4 (playback) | Story 9-5 (document) | Story 9-6 (session) |
|------|------------------------|----------------------|---------------------|
| SDK 服务 | ChannelService | ChannelService | V4ChannelService |
| 列表命令 | `playback list` | `document list` | `session list` |
| 详情命令 | `playback get` | `document status` | `session get` |
| API 版本 | V3 | V3 | V4 |

### 测试要点
1. **CLI Handler 测试**:
   - Mock `SessionServiceSdk`
   - 验证参数传递正确
   - 验证分页参数
   - 验证表格输出格式
   - 验证 JSON 输出格式
   - 验证错误处理

2. **CLI Commands 测试**:
   - 验证命令注册正确
   - 验证必需参数验证
   - 验证可选参数默认值

3. **边界情况**:
   - 空场次列表处理
   - 无效场次 ID
   - 无效频道 ID
   - 网络错误处理

### 测试覆盖率目标
- Handler: >= 80%
- Commands: >= 80%
- Service SDK: >= 80%
- 整体: >= 80%

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
