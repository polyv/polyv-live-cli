# Story 10.5: 播放器设置命令

Status: done

## Story

作为运营人员，
我希望通过 CLI 配置频道播放器设置（水印、暖场图、Logo等），
以便快速调整播放器外观和功能，无需登录 Web 控制台。

## Acceptance Criteria

1. **AC1**: `player config get` 命令支持获取频道播放器配置
2. **AC2**: `player config update` 命令支持更新播放器配置
3. **AC3**: `get` 命令需要 `--channel-id` 参数
4. **AC4**: `update` 命令支持 `--watermark-enabled` 参数（Y/N）
5. **AC5**: `update` 命令支持 `--watermark-url` 参数（水印图片URL）
6. **AC6**: `update` 命令支持 `--watermark-position` 参数（tl/tr/bl/br）
7. **AC7**: `update` 命令支持 `--watermark-opacity` 参数（0-1）
8. **AC8**: `update` 命令支持 `--warmup-enabled` 参数（Y/N）
9. **AC9**: `update` 命令支持 `--warmup-image-url` 参数（暖场图片URL）
10. **AC10**: `update` 命令支持 `--base-pv` 参数（基础观看次数）
11. **AC11**: 表格输出格式清晰，显示所有播放器配置项
12. **AC12**: JSON 输出完整包含所有字段
13. **AC13**: 更新成功后显示确认消息

## Tasks / Subtasks

- [ ] **Task 1: SDK 类型定义扩展** (AC: 1-13)
  - [ ] 1.1 在 `packages/sdk/src/types/player.ts` 添加频道装修类型
  - [ ] 1.2 定义 `ChannelDecoratePlayer` 接口（播放器装修配置）
  - [ ] 1.3 定义 `ChannelDecorateChat` 接口（聊天室配置）
  - [ ] 1.4 定义 `ChannelDecorateDesc` 接口（直播介绍页配置）
  - [ ] 1.5 定义 `ChannelDecorateSplash` 接口（引导页配置）
  - [ ] 1.6 定义 `ChannelDecorateMenu` 接口（菜单配置）
  - [ ] 1.7 定义 `ChannelDecorateGetResponse` 接口（获取响应）
  - [ ] 1.8 定义 `ChannelDecorateUpdateParams` 接口（更新参数）
  - [ ] 1.9 定义 `LogoPosition` 类型（tl/tr/bl/br）
  - [ ] 1.10 在 `types/index.ts` 导出新类型

- [ ] **Task 2: SDK Service 扩展** (AC: 1-13)
  - [ ] 2.1 在 `packages/sdk/src/services/player.service.ts` 添加新方法
  - [ ] 2.2 实现 `getChannelDecorate(channelId)` 方法调用 `/live/v4/channel/decorate/get`
  - [ ] 2.3 实现 `updateChannelDecorate(channelId, params)` 方法调用 `/live/v4/channel/decorate/update`
  - [ ] 2.4 添加参数验证（position值、opacity范围等）
  - [ ] 2.5 更新 SDK 单元测试

- [ ] **Task 3: CLI 类型定义扩展** (AC: 1-13)
  - [ ] 3.1 在 `packages/cli/src/types/player.ts` 创建新文件（如果不存在）
  - [ ] 3.2 定义 `PlayerConfigGetOptions` 接口
  - [ ] 3.3 定义 `PlayerConfigUpdateOptions` 接口
  - [ ] 3.4 定义 `PlayerServiceConfig` 接口（与服务层配置一致）

- [ ] **Task 4: CLI Service SDK 扩展** (AC: 1-13)
  - [ ] 4.1 在 `packages/cli/src/services/` 创建 `player.service.sdk.ts`
  - [ ] 4.2 实现 `PlayerServiceSdk` 类包装 SDK 服务
  - [ ] 4.3 实现 `getChannelDecorate(options)` 方法
  - [ ] 4.4 实现 `updateChannelDecorate(options)` 方法

- [ ] **Task 5: CLI Handler 实现** (AC: 1-13)
  - [ ] 5.1 在 `packages/cli/src/handlers/` 创建 `player.handler.ts`
  - [ ] 5.2 实现 `PlayerHandler` 类
  - [ ] 5.3 实现 `getConfig(options)` 方法
  - [ ] 5.4 实现 `updateConfig(options)` 方法
  - [ ] 5.5 实现表格格式化输出（显示播放器配置）
  - [ ] 5.6 实现 JSON 格式化输出
  - [ ] 5.7 实现更新成功确认消息

- [ ] **Task 6: CLI Commands 实现** (AC: 1-13)
  - [ ] 6.1 在 `packages/cli/src/commands/` 创建 `player.commands.ts`
  - [ ] 6.2 注册 `player` 命令组
  - [ ] 6.3 注册 `player config` 命令组
  - [ ] 6.4 注册 `player config get` 子命令
  - [ ] 6.5 注册 `player config update` 子命令
  - [ ] 6.6 定义必需参数：`--channel-id`
  - [ ] 6.7 定义水印参数：`--watermark-enabled`, `--watermark-url`, `--watermark-position`, `--watermark-opacity`
  - [ ] 6.8 定义暖场参数：`--warmup-enabled`, `--warmup-image-url`
  - [ ] 6.9 定义基础观看次数参数：`--base-pv`
  - [ ] 6.10 定义输出参数：`--output` (table|json)
  - [ ] 6.11 在 `src/index.ts` 注册新命令

- [ ] **Task 7: 单元测试** (AC: 全部)
  - [ ] 7.1 SDK Service 单元测试 (Vitest) - 新增方法
  - [ ] 7.2 CLI Handler 单元测试 (Jest) - 新增方法
  - [ ] 7.3 CLI Commands 单元测试 (Jest) - 新增命令
  - [ ] 7.4 确保覆盖率 >= 80%

## Dev Notes

### API 规范

#### API 1: 查询频道页面装修

**URL**: `GET /live/v4/channel/decorate/get`

```
URL: http://api.polyv.net/live/v4/channel/decorate/get
Method: GET
```

**请求参数**:

| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳，3分钟内有效 |
| sign | true | String | 签名，32位大写MD5 |
| channelId | true | String | 频道号 |

**响应字段 (data.player)**:

| 字段 | 类型 | 说明 |
|------|------|------|
| watermarkEnabled | String | 水印开关，Y：开启，N：关闭 |
| iconUrl | String | 水印图片URL |
| iconPosition | String | 水印位置（tl/tr/bl/br） |
| logoOpacity | Float | 水印不透明度（0-1） |
| iconLink | String | 水印链接 |
| warmUpEnabled | String | 暖场开关 |
| warmUpImageUrl | String | 暖场图片地址（直播封面图） |
| coverJumpUrl | String | 封面(暖场)跳转链接 |
| backgroundUrl | String | PC背景图片 |
| basePV | Integer | 基础观看次数 |
| actualPV | Integer | 实际累计观看次数 |

**成功响应示例**:
```json
{
  "code": 200,
  "status": "success",
  "requestId": "dc7ae621ef8e4f4a8e4976833f1dbbd4.66.16309975070362179",
  "data": {
    "player": {
      "watermarkEnabled": "Y",
      "iconUrl": "//liveimages.videocc.net/uploaded/images/2021/09/g24vjlhywx.png",
      "iconPosition": "br",
      "logoOpacity": 1,
      "iconLink": "",
      "warmUpEnabled": "Y",
      "warmUpImageUrl": "http://liveimages.videocc.net/uploadimage/20210312/chat_img_1b448be323_16155164629438.jpeg",
      "coverJumpUrl": "",
      "backgroundUrl": "",
      "basePV": 6,
      "actualPV": 21
    }
  },
  "success": true
}
```

#### API 2: 修改频道装修设置

**URL**: `POST /live/v4/channel/decorate/update`

```
URL: http://api.polyv.net/live/v4/channel/decorate/update
Method: POST
Content-Type: application/json
```

**请求参数 (URL)**:

| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳 |
| sign | true | String | 签名 |
| channelId | true | String | 频道号 |

**请求体参数 (player对象)**:

| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| watermarkEnabled | false | String | 水印开关，Y：开启，N：关闭 |
| iconUrl | false | String | 水印图片URL |
| iconPosition | false | String | 水印位置（tl/tr/bl/br） |
| logoOpacity | false | Float | 水印不透明度（0-1） |
| iconLink | false | String | 水印链接 |
| warmUpEnabled | false | String | 暖场开关 |
| warmUpImageUrl | false | String | 暖场图片地址 |
| coverJumpUrl | false | String | 封面跳转链接 |
| backgroundUrl | false | String | PC背景图片 |
| basePV | false | Integer | 基础观看次数 |
| actualPV | false | Integer | 实际累计观看次数 |

**请求体示例**:
```json
{
  "player": {
    "watermarkEnabled": "Y",
    "iconUrl": "http://liveimages.videocc.net/assets/wimages/pc_images/logo.png",
    "iconPosition": "br",
    "logoOpacity": 0.7,
    "iconLink": "http://www.polyv.net",
    "warmUpEnabled": "N",
    "warmUpImageUrl": "",
    "coverJumpUrl": "",
    "backgroundUrl": "",
    "basePV": 2000,
    "actualPV": 200
  }
}
```

**成功响应示例**:
```json
{
  "code": 200,
  "status": "success",
  "requestId": "dc7ae621ef8e4f4a8e4976833f1dbbd4.69.16309852981551185",
  "data": null,
  "success": true
}
```

### 项目结构笔记

**SDK 文件（扩展现有）**:
- 类型: `packages/sdk/src/types/player.ts` (已存在，需扩展)
- 服务: `packages/sdk/src/services/player.service.ts` (已存在，需扩展)
- 测试: `packages/sdk/src/services/player.service.test.ts` (需更新)

**CLI 文件（新建）**:
- 类型: `packages/cli/src/types/player.ts` (新建)
- Service SDK: `packages/cli/src/services/player.service.sdk.ts` (新建)
- Handler: `packages/cli/src/handlers/player.handler.ts` (新建)
- Commands: `packages/cli/src/commands/player.commands.ts` (新建)
- 测试: `packages/cli/tests/commands/player.commands.test.ts` (新建)
- 测试: `packages/cli/tests/handlers/player.handler.test.ts` (新建)

### 命令设计

```bash
# 获取播放器配置
polyv-live-cli player config get -c "3151318"

# JSON 输出
polyv-live-cli player config get -c "3151318" -o json

# 更新水印设置
polyv-live-cli player config update -c "3151318" --watermark-enabled Y --watermark-url "http://example.com/logo.png" --watermark-position br --watermark-opacity 0.8

# 更新暖场设置
polyv-live-cli player config update -c "3151318" --warmup-enabled Y --warmup-image-url "http://example.com/warmup.jpg"

# 更新基础观看次数
polyv-live-cli player config update -c "3151318" --base-pv 1000

# 组合更新
polyv-live-cli player config update -c "3151318" --watermark-enabled Y --watermark-url "http://example.com/logo.png" --base-pv 1000 -o json
```

### 表格输出设计

#### 获取配置表格

```
播放器配置
频道号: 3151318

水印设置:
┌────────────┬────────────────────────────────────────┐
│ 配置项     │ 值                                     │
├────────────┼────────────────────────────────────────┤
│ 水印开关   │ 开启                                   │
│ 水印图片   │ http://liveimages.videocc.net/...      │
│ 水印位置   │ 右下角                                 │
│ 水印透明度 │ 0.8                                    │
│ 水印链接   │ http://www.polyv.net                   │
└────────────┴────────────────────────────────────────┘

暖场设置:
┌────────────┬────────────────────────────────────────┐
│ 配置项     │ 值                                     │
├────────────┼────────────────────────────────────────┤
│ 暖场开关   │ 开启                                   │
│ 暖场图片   │ http://liveimages.videocc.net/...      │
│ 封面跳转   │ -                                      │
│ 背景图片   │ -                                      │
└────────────┴────────────────────────────────────────┘

观看数据:
┌────────────────┬───────┐
│ 配置项         │ 值    │
├────────────────┼───────┤
│ 基础观看次数   │ 1000  │
│ 实际观看次数   │ 21    │
└────────────────┴───────┘
```

#### 更新配置输出

```
播放器配置更新成功
频道号: 3151318

已更新:
- watermarkEnabled: Y
- watermarkUrl: http://example.com/logo.png
- basePV: 1000
```

### 水印位置映射

| 代码 | 位置 |
|------|------|
| tl | 左上角 (top-left) |
| tr | 右上角 (top-right) |
| bl | 左下角 (bottom-left) |
| br | 右下角 (bottom-right) |

### 关键实现规则

#### 1. SDK 服务模式（扩展现有 PlayerService）

```typescript
// packages/sdk/src/services/player.service.ts
export class PlayerService {
  // 现有方法: setAntiRecordSettings, getAntiRecordSettings, setMarqueeUrl,
  //          updateHeadAdvert, updateStopAdvert, updateLogo, getWatchFeedbackList

  /**
   * 获取频道装修配置
   */
  async getChannelDecorate(channelId: number): Promise<ChannelDecorateGetResponse> {
    // 1. 验证 channelId
    // 2. 调用 API: GET /live/v4/channel/decorate/get
    // 3. 返回响应
  }

  /**
   * 更新频道装修配置
   */
  async updateChannelDecorate(
    channelId: number,
    params: ChannelDecorateUpdateParams
  ): Promise<boolean> {
    // 1. 验证 channelId
    // 2. 验证参数（position值、opacity范围等）
    // 3. 调用 API: POST /live/v4/channel/decorate/update
    // 4. 返回成功/失败
  }
}
```

#### 2. CLI Handler 模式

```typescript
// packages/cli/src/handlers/player.handler.ts
export class PlayerHandler extends BaseHandler {
  /**
   * 获取播放器配置
   */
  async getConfig(options: PlayerConfigGetOptions): Promise<void> {
    // 1. 调用 SDK: playerService.getChannelDecorate(channelId)
    // 2. 格式化输出（table/json）
  }

  /**
   * 更新播放器配置
   */
  async updateConfig(options: PlayerConfigUpdateOptions): Promise<void> {
    // 1. 构建更新参数
    // 2. 调用 SDK: playerService.updateChannelDecorate(channelId, params)
    // 3. 显示确认消息
  }
}
```

#### 3. 参数验证

**水印位置**:
```typescript
const validPositions = ['tl', 'tr', 'bl', 'br'];
if (position && !validPositions.includes(position)) {
  throw new PolyVValidationError('watermarkPosition must be one of: tl, tr, bl, br');
}
```

**水印透明度**:
```typescript
if (opacity !== undefined && (opacity < 0 || opacity > 1)) {
  throw new PolyVValidationError('watermarkOpacity must be between 0 and 1');
}
```

#### 4. 认证模式

```typescript
// 使用 authAdapter 获取认证（与 statistics 命令相同模式）
const authResult = authAdapter.tryGetAuthConfig(parentOptions);
if (!authResult) {
  throw new Error(authAdapter.getStatusMessage(parentOptions));
}
```

### V4 API 注意事项

频道装修 API 是 **V4 版本**:

1. **API 路径**: `/live/v4/channel/decorate/get` 和 `/live/v4/channel/decorate/update`
2. **签名参数**: `channelId`, `timestamp`, `appId` 参与 sign 签名
3. **请求体**: POST 请求使用 JSON body，不参与签名
4. **响应格式**: 包含 `code`, `status`, `message`, `data`, `success`, `requestId` 字段

### 相关 API 文档

| 文档 | 路径 |
|------|------|
| 查询频道装修 | `docs/api/v4/channel/decorate/get.md` |
| 修改频道装修 | `docs/api/v4/channel/decorate/update.md` |

### 已有代码参考

- **SDK Service**: `packages/sdk/src/services/player.service.ts` (已有多个播放器相关方法)
- **SDK Types**: `packages/sdk/src/types/player.ts` (已有播放器类型)
- **CLI Commands**: `packages/cli/src/commands/statistics.commands.ts` (命令模式参考)
- **CLI Handler**: `packages/cli/src/handlers/statistics.handler.ts` (Handler模式参考)

### Story 10-1, 10-2, 10-3, 10-4 学习要点

1. **SDK 服务包装模式**: CLI 使用 ServiceSdk 包装 SDK 服务，而非直接使用 `PolyVClient`
2. **类型转换**: SDK 类型与 CLI 类型分开定义，Handler 负责转换
3. **认证优先级**: 使用 `authAdapter` 处理多源认证
4. **输出模式**: 支持 `--output table|json` 两种格式
5. **参数��证**: 在命令层和 Handler 层都需要验证参数
6. **错误处理**: 统一使用 `logError` 处理错误

### 测试要点

1. **SDK 测试**:
   - Mock `httpClient.get()` 和 `httpClient.post()` 返回
   - 验证参数传递正确
   - 验证水印位置值
   - 验证透明度范围

2. **CLI 测试**:
   - 命令注册正确
   - 参数验证（必需参数缺失时报错）
   - 输出格式化正确
   - 更新成功消息显示

3. **覆盖率要求**:
   - Functions: >= 80%
   - Lines: >= 80%
   - Statements: >= 80%
   - Branches: >= 70%

### References

- [Source: docs/api/v4/channel/decorate/get.md]
- [Source: docs/api/v4/channel/decorate/update.md]
- [Source: _bmad-output/project-context.md#SDK开发规则]
- [Source: _bmad-output/project-context.md#CLI开发规则]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic10]
- [Source: _bmad-output/implementation-artifacts/10-1-statistics-view.md]
- [Source: _bmad-output/implementation-artifacts/10-4-statistics-export.md]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
