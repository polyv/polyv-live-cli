# Story 9.1: 回放列表命令

Status: ready-for-dev

## Story

作为运营人员或 PaaS 客户开发者，
我希望通过 CLI 列出频道的回放视频列表，
以便管理和查看直播回放内容。

## Acceptance Criteria

1. **AC1**: `playback list` 命令支持通过 `--channel-id` 参数获取指定频道的回放列表
2. **AC2**: 支持分页参数 `--page` 和 `--page-size`
3. **AC3**: 支持 `--list-type` 参数区分回放列表(playback)和点播列表(vod)
4. **AC4**: 表格输出格式清晰，显示视频ID、标题、时长、创建时间等关键信息
5. **AC5**: JSON 输出完整包含所有字段
6. **AC6**: 优雅处理空结果（无回放视频时显示友好提示）

## Tasks / Subtasks

- [ ] **Task 1: CLI 类型定义** (AC: 1,2,3,4,5,6)
  - [ ] 1.1 在 `packages/cli/src/types/playback.ts` 创建 CLI 选项类型
  - [ ] 1.2 定义 `PlaybackListOptions` 接口

- [ ] **Task 2: CLI Handler 实现** (AC: 1,4,5,6)
  - [ ] 2.1 创建 `packages/cli/src/handlers/playback.handler.ts`
  - [ ] 2.2 实现 `PlaybackHandler` 类
  - [ ] 2.3 实现 `listPlayback(options)` 方法
  - [ ] 2.4 实现表格格式化输出（显示 videoId、title、duration、createdTime、status）
  - [ ] 2.5 实现 JSON 格式化输出
  - [ ] 2.6 实现空结果友好提示

- [ ] **Task 3: CLI Commands 注册** (AC: 1,2,3)
  - [ ] 3.1 创建 `packages/cli/src/commands/playback.commands.ts`
  - [ ] 3.2 注册 `playback` 命令组
  - [ ] 3.3 注册 `playback list` 子命令
  - [ ] 3.4 定义必需参数：`--channel-id` / `-c`
  - [ ] 3.5 定义分页参数：`--page`、`--page-size`
  - [ ] 3.6 定义列表类型参数：`--list-type`
  - [ ] 3.7 定义可选参数：`--output` / `-o`
  - [ ] 3.8 在 `src/index.ts` 中注册命令

- [ ] **Task 4: 单元测试** (AC: 全部)
  - [ ] 4.1 CLI Handler 单元测试 (Jest)
  - [ ] 4.2 CLI Commands 单元测试 (Jest)
  - [ ] 4.3 确保覆盖率 >= 80%

## Dev Notes

### API 规范

**主 API**: `GET /live/v2/channel/recordFile/{channelId}/playback/list`

```
URL: http://api.polyv.net/live/v2/channel/recordFile/{channelId}/playback/list
Method: GET
```

**请求参数**:

| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳，3分钟内有效 |
| sign | true | String | 签名，32位大写MD5 |
| channelId | true | String | 频道号（URL路径参数） |
| page | false | String | 页数，默认1 |
| pageSize | false | String | 每页显示的数据条数，默认10 |
| listType | false | String | 视频列表类型：playback（回放列表）、vod（点播列表） |
| sessionIds | false | String | 场次ID，多个用英文逗号分割 |
| title | false | String | 回放视频标题，支持模糊查询 |

**响应字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| videoId | String | 直播系统生成的id |
| videoPoolId | String | 点播视频vid / 素材id |
| userId | String | POLYV用户ID |
| channelId | String | 回放视频对应的直播频道号 |
| title | String | 视频标题 |
| firstImage | String | 视频首图 |
| duration | String | 视频长度，格式为HH:mm:ss |
| myBr | String | 默认视频的播放清晰度（1:流畅 2:高清 3:超清） |
| seed | Integer | 视频加密状态（1:加密 0:非加密） |
| createdTime | Long | 添加为回放视频的日期，13位毫秒级时间戳 |
| lastModified | Long | 视频最后修改日期，13位毫秒级时间戳 |
| asDefault | String | 是否为默认播放视频（Y:播放 N:不播放） |
| status | String | 关联点播视频的状态 |
| watchUrl | String | 观看回放视频的地址 |
| liveType | String | 直播类型（alone/ppt/topclass/seminar） |
| origin | String | 转存文件来源（manual/auto/merge/clip/smart-clip） |

**成功响应示例**:
```json
{
  "code": 200,
  "status": "success",
  "message": "",
  "data": {
    "pageSize": 10,
    "pageNumber": 1,
    "totalItems": 1,
    "contents": [
      {
        "videoId": "1b96d90bf5",
        "videoPoolId": "1b448be323e68e4404332113a57353b2_1",
        "userId": "1b448be323",
        "channelId": 2191532,
        "title": "Spring 知识精讲",
        "firstImage": "//doc.polyv.net/images/default/blackboard.png",
        "duration": "00:01:53",
        "myBr": "1",
        "seed": 0,
        "createdTime": 1615515464000,
        "lastModified": 1615515464000,
        "asDefault": "N",
        "status": "Y",
        "watchUrl": "//live.polyv.cn/watch/2191532?vid=1b96d90bf5",
        "liveType": "ppt"
      }
    ],
    "totalPages": 1
  }
}
```

### 项目结构笔记

**SDK 文件**（已存在，无需创建）:
- 类型: `packages/sdk/src/types/channel.ts` (`PlaybackListRequest`, `PlaybackListResponse`, `PlaybackVideoItem`)
- 服务: `packages/sdk/src/services/channel.service.ts` (`ChannelService.getPlaybackList()`)
- 测试: `packages/sdk/src/services/channel.service.playback-player.test.ts`

**CLI 文件**（需要创建）:
- 类型: `packages/cli/src/types/playback.ts` (新建)
- Handler: `packages/cli/src/handlers/playback.handler.ts` (新建)
- Commands: `packages/cli/src/commands/playback.commands.ts` (新建)
- 测试: `packages/cli/tests/commands/playback.commands.test.ts` (新建)
- 测试: `packages/cli/tests/handlers/playback.handler.test.ts` (新建)

### 命令设计

```bash
# 基本用法
polyv-live-cli playback list -c "3151318"

# 指定分页
polyv-live-cli playback list -c "3151318" --page 2 --page-size 20

# 指定列表类型
polyv-live-cli playback list -c "3151318" --list-type vod

# JSON 输出
polyv-live-cli playback list -c "3151318" -o json

# 完整参数名
polyv-live-cli playback list --channel-id "3151318" --page 1 --page-size 10 --list-type playback --output table
```

### 表格输出设计

```
回放列表 (频道: 3151318, 共 5 条)

┌──────────────┬────────────────────────┬──────────┬─────────────────────┬────────┐
│ 视频ID       │ 标题                   │ 时长     │ 创建时间            │ 状态   │
├──────────────┼────────────────────────┼──────────┼─────────────────────┼────────┤
│ 1b96d90bf5   │ Spring 知识精讲        │ 00:01:53 │ 2021-03-12 10:31:04 │ 启用   │
│ 2c07e91cg6   │ 直播回放测试           │ 00:05:30 │ 2021-03-13 14:22:18 │ 启用   │
└──────────────┴────────────────────────┴──────────┴─────────────────────┴────────┘

第 1 页，共 1 页
```

### 关键实现规则

#### 1. SDK 服务调用（已存在）

SDK 中已有 `ChannelService.getPlaybackList()` 方法，直接调用即可：

```typescript
// packages/sdk/src/services/channel.service.ts 已有实现
async getPlaybackList(
  channelId: string,
  options?: PlaybackListRequest
): Promise<PlaybackListResponse>
```

#### 2. CLI Handler 模式（参考 StatisticsHandler）

```typescript
// packages/cli/src/handlers/playback.handler.ts
export class PlaybackHandler {
  constructor(
    private authConfig: AuthConfig,
    private serviceConfig: PlaybackServiceConfig
  ) {}

  async listPlayback(options: PlaybackListOptions): Promise<void> {
    // 1. 创建 PolyVClient
    // 2. 调用 SDK: client.channel.getPlaybackList(channelId, params)
    // 3. 格式化输出（table/json）
    // 4. 空结果友好提示
  }
}
```

#### 3. CLI 类型定义

```typescript
// packages/cli/src/types/playback.ts
export interface PlaybackListOptions {
  channelId: string;
  page?: number;
  pageSize?: number;
  listType?: 'playback' | 'vod';
  output?: 'table' | 'json';
}

export interface PlaybackServiceConfig {
  baseUrl: string;
  timeout: number;
  debug: boolean;
}
```

#### 4. 认证模式

```typescript
// 使用 authAdapter 获取认证
const authResult = authAdapter.tryGetAuthConfig(parentOptions);
if (!authResult) {
  throw new Error(authAdapter.getStatusMessage(parentOptions));
}
```

#### 5. 空结果处理

当 `data.contents` 为空数组或 `data.totalItems` 为 0 时：
- 表格模式：显示 "该频道暂无回放视频"
- JSON 模式：返回空数组 `[]`

### 相关 API 文档

| 文档 | 路径 |
|------|------|
| 查询视频库列表 | `docs/api/channel/playback/get_playback_list.md` |
| V4 回放设置 | `docs/api/v4/channel/playback/playback_list.md` |

### 已有代码参考

- **SDK Service**: `packages/sdk/src/services/channel.service.ts` - `getPlaybackList()` 方法（已存在）
- **SDK 类型**: `packages/sdk/src/types/channel.ts` - `PlaybackListRequest`, `PlaybackListResponse`（已存在）
- **CLI Commands 模式**: `packages/cli/src/commands/statistics.commands.ts`
- **CLI Handler 模式**: `packages/cli/src/handlers/statistics.handler.ts`

### 测试要点

1. **CLI Handler 测试**:
   - Mock `PolyVClient` 和 `ChannelService`
   - 验证参数传递正确
   - 验证表格输出格式
   - 验证 JSON 输出格式
   - 验证空结果处理

2. **CLI Commands 测试**:
   - 命令注册正确
   - 参数验证（必需参数缺失时报错）
   - 选项默认值正确

3. **覆盖率要求**:
   - Functions: >= 80%
   - Lines: >= 80%
   - Statements: >= 80%
   - Branches: >= 70%

### 注意事项

1. **SDK 已实现**: `ChannelService.getPlaybackList()` 已存在，无需修改 SDK
2. **类型已导出**: `PlaybackListRequest`, `PlaybackListResponse`, `PlaybackVideoItem` 已在 SDK 中定义
3. **listType 默认值**: 普通直播场景默认为 'vod'，三分屏默认为 'playback'
4. **分页默认值**: page 默认 1，pageSize 默认 10

### References

- [Source: docs/api/channel/playback/get_playback_list.md]
- [Source: packages/sdk/src/services/channel.service.ts - getPlaybackList()]
- [Source: packages/sdk/src/types/channel.ts - PlaybackListRequest/Response]
- [Source: packages/cli/src/commands/statistics.commands.ts - 命令模式参考]
- [Source: packages/cli/src/handlers/statistics.handler.ts - Handler模式参考]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic9]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
