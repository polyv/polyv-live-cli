# Story 9.7: 录制设置管理命令

Status: done

## Story

作为运营人员或 PaaS 客户开发者,
我希望通过 CLI 管理直播频道的录制设置,
以便查看和配置频道的回放设置、转存录制文件到点播。

## Acceptance Criteria

1. **AC1**: `record setting get` 命令支持 `--channel-id` 参数获取频道回放设置
2. **AC2**: `record setting set` 命令支持更新频道回放设置（回放开关、回放方式、回放来源等）
3. **AC3**: `record convert` 命令支持将录制文件转存到点播（同步模式）
4. **AC4**: `record convert` 命令支持 `--async` 参数异步转存
5. **AC5**: `record set-default` 命令支持设置默认回放视频
6. **AC6**: 所有命令支持 `--output` 参数选择 table 或 json 输出格式
7. **AC7**: 表格输出格式清晰，显示设置信息
8. **AC8**: JSON 输出完整包含所有 API 返回字段

## Tasks / Subtasks

- [ ] **Task 1: CLI 类型定义** (AC: 1,2,3,4,5,6,7,8)
  - [ ] 1.1 创建 `packages/cli/src/types/record.ts` 文件
  - [ ] 1.2 定义 `RecordServiceConfig` 接口
  - [ ] 1.3 定义 `RecordSettingGetOptions` 接口（channelId, output）
  - [ ] 1.4 定义 `RecordSettingSetOptions` 接口（channelId, playbackEnabled, type, origin, videoId, output 等）
  - [ ] 1.5 定义 `RecordConvertOptions` 接口（channelId, fileId, fileName, sessionId, cataId, toPlayList, setAsDefault, async, output 等）
  - [ ] 1.6 定义 `RecordSetDefaultOptions` 接口（channelId, videoId, listType, output）
  - [ ] 1.7 定义 `RecordSettingDisplayItem` 接口用于表格显示
  - [ ] 1.8 定义 `RecordConvertResult` 接口用于转存结果

- [ ] **Task 2: CLI Service SDK 实现** (AC: 1,2,3,4,5)
  - [ ] 2.1 创建 `packages/cli/src/services/record.service.sdk.ts` 文件
  - [ ] 2.2 实现 `RecordServiceSdk` 类
  - [ ] 2.3 实现 `getPlaybackSetting()` 方法，调用 SDK `client.channel.getPlaybackSetting()`
  - [ ] 2.4 实现 `setPlaybackSetting()` 方法，调用 SDK `client.channel.setRecordSetting()`
  - [ ] 2.5 实现 `recordConvert()` 方法，调用 SDK `client.channel.recordConvert()`
  - [ ] 2.6 实现 `recordConvertAsync()` 方法，调用 SDK `client.channel.recordConvertAsync()`
  - [ ] 2.7 实现 `setRecordDefault()` 方法，调用 SDK `client.channel.setRecordDefault()`

- [ ] **Task 3: CLI Handler 实现** (AC: 全部)
  - [ ] 3.1 创建 `packages/cli/src/handlers/record.handler.ts` 文件
  - [ ] 3.2 创建 `RecordHandler` 类继承 `BaseHandler`
  - [ ] 3.3 实现 `getPlaybackSetting()` 方法
  - [ ] 3.4 实现 `setPlaybackSetting()` 方法
  - [ ] 3.5 实现 `recordConvert()` 方法（支持同步/异步模式）
  - [ ] 3.6 实现 `setRecordDefault()` 方法
  - [ ] 3.7 实现表格格式化输出方法
  - [ ] 3.8 实现 JSON 格式化输出
  - [ ] 3.9 参数验证和错误处理

- [ ] **Task 4: CLI Commands 注册** (AC: 1,2,3,4,5,6)
  - [ ] 4.1 创建 `packages/cli/src/commands/record.commands.ts` 文件
  - [ ] 4.2 创建 `record` 命令组
  - [ ] 4.3 创建 `record setting` 子命令组
  - [ ] 4.4 添加 `record setting get` 子命令
  - [ ] 4.5 添加 `record setting set` 子命令
  - [ ] 4.6 添加 `record convert` 子命令
  - [ ] 4.7 添加 `record set-default` 子命令
  - [ ] 4.8 在 `src/index.ts` 中注册 `registerRecordCommands`
  - [ ] 4.9 添加命令帮助文本和示例

- [ ] **Task 5: 单元测试** (AC: 全部)
  - [ ] 5.1 创建 `record.handler.test.ts` (Jest)
  - [ ] 5.2 创建 `record.commands.test.ts` (Jest)
  - [ ] 5.3 创建 `record.service.sdk.test.ts` (Jest)
  - [ ] 5.4 确保覆盖率 >= 80%
  - [ ] 5.5 测试回放设置获取
  - [ ] 5.6 测试回放设置更新
  - [ ] 5.7 测试录制转存（同步/异步）
  - [ ] 5.8 测试设置默认回放视频
  - [ ] 5.9 测试 JSON 输出格式

- [ ] **Task 6: Skill 文件同步更新** (AC: 全部)
  - [ ] 6.1 更新 `skills/polyv-live-cli/SKILL.md` 添加 record 命令说明
  - [ ] 6.2 创建 `skills/polyv-live-cli/references/record-settings.md` 参考文档

## Dev Notes

### API 规范

#### 1. 查询频道回放设置（V3 API）
**API**: `GET /live/v3/channel/playback/get-setting`
```
URL: http://api.polyv.net/live/v3/channel/playback/get-setting
Method: GET
```
**请求参数**:
| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳，3分钟内有效 |
| sign | true | String | 签名，32位大写MD5值 |
| channelId | true | String | 频道号 |

**响应字段 data**:
| 字段 | 类型 | 说明 |
|------|------|------|
| channelId | String | 频道号 |
| type | String | 回放类型：single(单个视频回放)、list(列表回放) |
| playbackEnabled | String | 回放开关：Y(开启)、N(关闭) |
| origin | String | 回放来源：record(录制文件)、playback(回放列表)、vod(点播列表) |
| videoId | String | 回放的视频ID |
| videoName | String | 回放的视频名称 |
| sectionEnabled | String | 章节开关：Y/N |
| globalSettingEnabled | String | 是否应用通用设置：Y/N |
| crontabType | String | 定时回放类型 |
| startTime | Long | 放开回放的时间，13位时间戳 |
| endTime | Long | 关闭回放的时间，13位时间戳 |
| playbackMultiplierEnabled | String | 倍数播放开关：Y/N |
| playbackProgressBarEnabled | String | 进度条开关：Y/N |
| playbackProgressBarOperationType | String | 进度条操作方式 |
| showPlayButtonEnabled | String | 显示播放按钮开关：Y/N |
| productPlaybackEnabled | String | 商品库开关：Y/N |
| chatPlaybackEnabled | String | 聊天互动重现开关：Y/N |
| questionnairePlaybackEnabled | String | 问卷互动重现开关：Y/N |
| qaPlaybackEnabled | String | 答题卡互动重现开关：Y/N |
| cardPushPlaybackEnabled | String | 卡片推送互动重现开关：Y/N |
| checkInPlaybackEnabled | String | 签到互动重现开关：Y/N |

#### 2. 修改频道回放设置（V3 API）
**API**: `POST /live/v3/channel/playback/set-setting`
```
URL: http://api.polyv.net/live/v3/channel/playback/set-setting
Method: POST
Content-Type: application/x-www-form-urlencoded
```
**请求参数**:
| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳 |
| sign | true | String | 签名 |
| channelId | true | String | 频道号 |
| globalSettingEnabled | false | String | 是否使用通用设置：Y/N |
| crontabType | false | String | 定时回放类型 |
| startTime | false | Long | 放开回放的时间 |
| endTime | false | Long | 关闭回放的时间 |
| playbackEnabled | false | String | 回放开关：Y/N |
| type | false | String | 回放方式：single/list |
| origin | false | String | 回放来源：record/playback/vod/material |
| videoId | false | String | 直播系统中视频ID |
| sectionEnabled | false | String | 章节开关：Y/N |
| playbackMultiplierEnabled | false | String | 倍数播放开关：Y/N |
| playbackProgressBarEnabled | false | String | 进度条开关：Y/N |
| playbackProgressBarOperationType | false | String | 进度条操作方式 |
| showPlayButtonEnabled | false | String | 显示播放按钮开关：Y/N |
| productPlaybackEnabled | false | String | 商品库开关：Y/N |
| chatPlaybackEnabled | false | String | 聊天互动重现开关：Y/N |
| questionnairePlaybackEnabled | false | String | 问卷互动重现开关：Y/N |
| qaPlaybackEnabled | false | String | 答题卡互动重现开关：Y/N |
| cardPushPlaybackEnabled | false | String | 卡片推送互动重现开关：Y/N |
| checkInPlaybackEnabled | false | String | 签到互动重现开关：Y/N |

**响应**:
```json
{
  "code": 200,
  "status": "success",
  "message": "",
  "data": true
}
```

#### 3. 同步转存录制文件到点播（V2 API）
**API**: `POST /live/v2/channel/recordFile/{channelId}/convert`
```
URL: http://api.polyv.net/live/v2/channel/recordFile/{channelId}/convert
Method: POST
Content-Type: application/x-www-form-urlencoded
```
**请求参数**:
| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳 |
| sign | true | String | 签名 |
| userId | true | String | 直播账号ID |
| fileName | true | String | 转存后的点播视频名称 |
| fileUrl | false | String | 转存到录制文件地址 |
| sessionId | false | String | 直播场次ID |
| cataid | false | String | 目录ID |
| cataname | false | String | 目录名称 |
| toPlayList | false | String | 是否存放到回放列表：Y/N |
| setAsDefault | false | String | 是否设为默认回放视频：Y/N |

**响应**:
```json
{
  "code": 200,
  "status": "success",
  "message": "",
  "data": "1b448be32353f0f4638f70a9545c75bd_1"  // 点播视频vid
}
```

**约束**:
- 同一个POLYV账号，调用该接口的间隔至少5分钟
- 可以同时传fileUrl和sessionId，或必传其中一个

#### 4. 设置视频库列表的默认视频（V2 API）
**API**: `POST /live/v2/channel/recordFile/{channelId}/playback/set-Default`
```
URL: http://api.polyv.net/live/v2/channel/recordFile/{channelId}/playback/set-Default
Method: POST
Content-Type: application/x-www-form-urlencoded
```
**请求参数**:
| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳 |
| sign | true | String | 签名 |
| videoId | true | String | 直播系统中视频ID |
| listType | false | String | 视频列表类型：playback/vod |

**响应**:
```json
{
  "code": 200,
  "status": "success",
  "message": "",
  "data": "success"
}
```

### 命令设计
```bash
# 获取回放设置
polyv-live-cli record setting get -c "2588188"
polyv-live-cli record setting get -c "2588188" -o json

# 设置回放设置
polyv-live-cli record setting set -c "2588188" --playback-enabled Y
polyv-live-cli record setting set -c "2588188" --playback-enabled Y --type single --origin playback --video-id "73801f70c8"
polyv-live-cli record setting set -c "2588188" --playback-enabled Y --playback-multiplier-enabled Y

# 转存录制文件到点播（同步）
polyv-live-cli record convert -c "2588188" --session-id "fvlyin8qz3" --file-name "测试转存"
polyv-live-cli record convert -c "2588188" --session-id "fvlyin8qz3" --file-name "测试转存" --to-play-list Y --set-as-default Y

# 转存录制文件到点播（异步）
polyv-live-cli record convert -c "2588188" --session-id "fvlyin8qz3" --file-name "测试转存" --async

# 设置默认回放视频
polyv-live-cli record set-default -c "2588188" --video-id "73801f70c8"
polyv-live-cli record set-default -c "2588188" --video-id "73801f70c8" --list-type playback -o json
```

### 表格输出设计

**record setting get**:
```
回放设置 - 频道: 2588188

属性                          值
--------------------------    --------------------
回放开关                      开启
回放类型                      单个回放
回放来源                      回放列表
视频ID                        73801f70c8
视频名称                      测试视频
倍数播放                      开启
进度条                        开启
进度条操作                    拖动
显示播放按钮                  开启
聊天互动重现                  关闭
商品库重现                    关闭
```

**record convert** (同步):
```
转存成功 - 频道: 2588188

属性                          值
--------------------------    --------------------
源场次ID                      fvlyin8qz3
文件名                        测试转存
存入回放列表                  是
设为默认回放                  是
点播视频ID                    1b448be32353f0f4638f70a9545c75bd_1
```

**record convert** (异步):
```
转存任务已提交 - 频道: 2588188

属性                          值
--------------------------    --------------------
源场次ID                      fvlyin8qz3
文件名                        测试转存
状态                          处理中
说明                          异步转存不立即返回视频ID，请在点播后台查看
```

**record set-default**:
```
设置成功 - 频道: 2588188

属性                          值
--------------------------    --------------------
视频ID                        73801f70c8
列表类型                      回放列表
状态                          已设为默认回放
```

### 关键实现规则

#### 1. SDK 服务调用（已存在于 channel.service.ts）
SDK 中已有录制/回放设置相关方法：
```typescript
// packages/sdk/src/services/channel.service.ts 已有实现

// 获取回放设置
async getPlaybackSetting(channelId: string): Promise<PlaybackSettingResponse>

// 设置回放设置
async setRecordSetting(channelId: string, options: SetRecordSettingRequest): Promise<boolean>

// 设置默认回放视频
async setRecordDefault(channelId: string, fileId: string): Promise<boolean>

// 转存录制文件（同步）
async recordConvert(channelId: string, options: RecordConvertRequest): Promise<RecordConvertResponse>

// 转存录制文件（异步）
async recordConvertAsync(channelId: string, options: RecordConvertRequest): Promise<boolean>
```

**注意**: SDK 的 `setRecordSetting` 使用的是 `/live/v3/channel/record/set-setting` 接口，
而本 Story 需要的 `/live/v3/channel/playback/set-setting` 接口字段更丰富。

需要检查 SDK 是否有对应方法，或需要新增 `setPlaybackSetting` 方法。

#### 2. RecordServiceSdk（需新建）
```typescript
// packages/cli/src/services/record.service.sdk.ts

export class RecordServiceSdk {
  constructor(
    private authConfig: AuthConfig,
    private config: RecordServiceConfig
  ) {}

  async getPlaybackSetting(channelId: string): Promise<RecordSettingDisplayItem> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    const result = await client.channel.getPlaybackSetting(channelId);
    // 转换响应格式
    return {
      channelId: String(result.channelId ?? channelId),
      playbackEnabled: result.playbackEnabled,
      type: result.type,
      origin: result.origin,
      videoId: result.videoId,
      videoName: result.videoName,
      sectionEnabled: result.sectionEnabled,
      globalSettingEnabled: result.globalSettingEnabled,
      playbackMultiplierEnabled: result.playbackMultiplierEnabled,
      playbackProgressBarEnabled: result.playbackProgressBarEnabled,
      playbackProgressBarOperationType: result.playbackProgressBarOperationType,
      showPlayButtonEnabled: result.showPlayButtonEnabled,
      chatPlaybackEnabled: result.chatPlaybackEnabled,
      productPlaybackEnabled: result.productPlaybackEnabled,
      questionnairePlaybackEnabled: result.questionnairePlaybackEnabled,
      qaPlaybackEnabled: result.qaPlaybackEnabled,
      cardPushPlaybackEnabled: result.cardPushPlaybackEnabled,
      checkInPlaybackEnabled: result.checkInPlaybackEnabled,
      crontabType: result.crontabType,
      startTime: result.startTime,
      endTime: result.endTime,
    };
  }

  async setPlaybackSetting(channelId: string, options: RecordSettingSetOptions): Promise<boolean> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.setPlaybackSetting(channelId, options);
  }

  async recordConvert(channelId: string, options: RecordConvertOptions): Promise<RecordConvertResult> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    if (options.async) {
      await client.channel.recordConvertAsync(channelId, {
        fileId: options.sessionId ?? options.fileId,
        fileName: options.fileName,
        callbackUrl: options.callbackUrl,
      });
      return { async: true };
    }
    const result = await client.channel.recordConvert(channelId, {
      fileId: options.sessionId ?? options.fileId,
      fileName: options.fileName,
      callbackUrl: options.callbackUrl,
    });
    return { async: false, vid: result.fileId };
  }

  async setRecordDefault(channelId: string, videoId: string, listType?: 'playback' | 'vod'): Promise<boolean> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.setRecordDefault(channelId, videoId);
  }
}
```

#### 3. CLI Handler 模式（参考 PlaybackHandler）
```typescript
// packages/cli/src/handlers/record.handler.ts

export interface IRecordService {
  getPlaybackSetting(channelId: string): Promise<RecordSettingDisplayItem>;
  setPlaybackSetting(channelId: string, options: RecordSettingSetOptions): Promise<boolean>;
  recordConvert(channelId: string, options: RecordConvertOptions): Promise<RecordConvertResult>;
  setRecordDefault(channelId: string, videoId: string, listType?: 'playback' | 'vod'): Promise<boolean>;
}

export class RecordHandler extends BaseHandler {
  private readonly recordService: IRecordService;

  constructor(
    authConfig: AuthConfig,
    serviceConfig: RecordServiceConfig,
    recordService?: IRecordService
  ) {
    super();
    this.recordService = recordService ?? new RecordServiceSdk(authConfig, serviceConfig);
  }

  async getPlaybackSetting(options: RecordSettingGetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // 验证 channelId
      // 调用 service
      // 显示结果
    }, 'record.setting.get');
  }

  async setPlaybackSetting(options: RecordSettingSetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // 验证参数
      // 调用 service
      // 显示结果
    }, 'record.setting.set');
  }

  async recordConvert(options: RecordConvertOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // 验证参数
      // 调用 service
      // 显示结果（区分同步/异步）
    }, 'record.convert');
  }

  async setRecordDefault(options: RecordSetDefaultOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // 验证参数
      // 调用 service
      // 显示结果
    }, 'record.set-default');
  }
}
```

#### 4. CLI 类型定义
```typescript
// packages/cli/src/types/record.ts

export interface RecordServiceConfig {
  baseUrl: string;
  timeout: number;
  debug: boolean;
}

export interface RecordSettingGetOptions {
  channelId: string;
  output?: 'table' | 'json';
}

export interface RecordSettingSetOptions {
  channelId: string;
  playbackEnabled?: 'Y' | 'N';
  type?: 'single' | 'list';
  origin?: 'record' | 'playback' | 'vod' | 'material';
  videoId?: string;
  globalSettingEnabled?: 'Y' | 'N';
  sectionEnabled?: 'Y' | 'N';
  playbackMultiplierEnabled?: 'Y' | 'N';
  playbackProgressBarEnabled?: 'Y' | 'N';
  playbackProgressBarOperationType?: 'drag' | 'prohibitDrag' | 'dragHistoryOnly';
  showPlayButtonEnabled?: 'Y' | 'N';
  chatPlaybackEnabled?: 'Y' | 'N';
  productPlaybackEnabled?: 'Y' | 'N';
  questionnairePlaybackEnabled?: 'Y' | 'N';
  qaPlaybackEnabled?: 'Y' | 'N';
  cardPushPlaybackEnabled?: 'Y' | 'N';
  checkInPlaybackEnabled?: 'Y' | 'N';
  output?: 'table' | 'json';
}

export interface RecordConvertOptions {
  channelId: string;
  fileId?: string;
  sessionId?: string;
  fileName: string;
  cataId?: string;
  cataName?: string;
  toPlayList?: 'Y' | 'N';
  setAsDefault?: 'Y' | 'N';
  async?: boolean;
  callbackUrl?: string;
  output?: 'table' | 'json';
}

export interface RecordSetDefaultOptions {
  channelId: string;
  videoId: string;
  listType?: 'playback' | 'vod';
  output?: 'table' | 'json';
}

export interface RecordSettingDisplayItem {
  channelId: string;
  playbackEnabled?: string;
  type?: string;
  origin?: string;
  videoId?: string;
  videoName?: string;
  sectionEnabled?: string;
  globalSettingEnabled?: string;
  playbackMultiplierEnabled?: string;
  playbackProgressBarEnabled?: string;
  playbackProgressBarOperationType?: string;
  showPlayButtonEnabled?: string;
  chatPlaybackEnabled?: string;
  productPlaybackEnabled?: string;
  questionnairePlaybackEnabled?: string;
  qaPlaybackEnabled?: string;
  cardPushPlaybackEnabled?: string;
  checkInPlaybackEnabled?: string;
  crontabType?: string;
  startTime?: number;
  endTime?: number;
}

export interface RecordConvertResult {
  async: boolean;
  vid?: string;
}
```

#### 5. 回放设置映射
```typescript
const PLAYBACK_ENABLED_MAP: Record<string, string> = {
  'Y': '开启',
  'N': '关闭',
};

const PLAYBACK_TYPE_MAP: Record<string, string> = {
  'single': '单个回放',
  'list': '列表回放',
};

const PLAYBACK_ORIGIN_MAP: Record<string, string> = {
  'record': '录制文件',
  'playback': '回放列表',
  'vod': '点播列表',
  'material': '素材库',
};

const PROGRESS_BAR_TYPE_MAP: Record<string, string> = {
  'drag': '拖动',
  'prohibitDrag': '禁止拖动',
  'dragHistoryOnly': '只能拖动已观看内容',
};
```

### 相关 API 文档
| 文档 | 路径 |
|------|------|
| 查询频道回放设置 | `docs/api/channel/playback/get_playback_setting.md` |
| 修改频道回放设置 | `docs/api/channel/playback/set_record_setting.md` |
| 同步转存录制文件到点播 | `docs/api/channel/playback/record_convert.md` |
| 设置默认回放视频 | `docs/api/channel/playback/set_record_default.md` |

### 已有代码参考
- **SDK Service**: `packages/sdk/src/services/channel.service.ts` - `getPlaybackSetting()`, `setRecordSetting()`, `recordConvert()`, `recordConvertAsync()`, `setRecordDefault()` 方法（已存在）
- **SDK Types**: `packages/sdk/src/types/channel.ts` - `SetRecordSettingRequest`, `RecordConvertRequest`, `RecordConvertResponse`（已存在）
- **CLI Service SDK**: `packages/cli/src/services/playback.service.sdk.ts` - 参考模式
- **CLI Handler**: `packages/cli/src/handlers/playback.handler.ts` - 参考模式
- **CLI Commands**: `packages/cli/src/commands/playback.commands.ts` - 参考模式
- **CLI 类型**: `packages/cli/src/types/playback.ts` - 参考模式

### 与 Story 9-1~9-6 的模式对比
| 功能 | Story 9-1~4 (playback) | Story 9-6 (session) | Story 9-7 (record) |
|------|------------------------|---------------------|---------------------|
| SDK 服务 | ChannelService | V4ChannelService | ChannelService |
| 列表命令 | `playback list` | `session list` | - |
| 详情命令 | `playback get` | `session get` | `record setting get` |
| 设置命令 | - | - | `record setting set` |
| 操作命令 | `playback delete/merge` | - | `record convert`, `record set-default` |
| API 版本 | V3 | V4 | V3/V2 |

### SDK 方法检查清单
在实现前需要确认 SDK 中是否已有以下方法：

1. **getPlaybackSetting**: `packages/sdk/src/services/channel.service.ts` - 已存在（返回 `PlaybackSettingResponse`，但字段可能不完整）
2. **setPlaybackSetting** (针对 `/live/v3/channel/playback/set-setting`): 需检查是否已存在，可能需要新增
3. **recordConvert**: 已存在（同步）
4. **recordConvertAsync**: 已存在（异步）
5. **setRecordDefault**: 已存在

**重要**: 如果 SDK 缺少 `setPlaybackSetting` 方法（针对 `/live/v3/channel/playback/set-setting`），
需要先在 SDK 中添加该方法，然后再在 CLI 中调用。

### 测试要点
1. **CLI Handler 测试**:
   - Mock `RecordServiceSdk`
   - 验证参数传递正确
   - 验证设置获取/更新
   - 验证转存参数（同步/异步）
   - 验证表格输出格式
   - 验证 JSON 输出格式
   - 验证错误处理

2. **CLI Commands 测试**:
   - 验证命令注册正确
   - 验证必需参数验证
   - 验证可选参数默认值

3. **边界情况**:
   - 无效频道 ID
   - 无效视频 ID
   - 转存频率限制（5分钟间隔）
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
