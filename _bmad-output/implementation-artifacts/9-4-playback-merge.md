# Story 9.4: 回放合并命令

Status: done

## Story

作为运营人员或 PaaS 客户开发者,
我希望通过 CLI 将多个录制文件合并为一个回放文件,
以便整合直播过程中的多个分段视频。

## Acceptance Criteria

1. **AC1**: `playback merge` 命令支持 `--channel-id` 参数（必填）
2. **AC2**: `playback merge` 命令支持 `--file-ids` 参数（必填），多个文件ID用逗号分隔
3. **AC3**: 合并成功后返回新回放文件ID
4. **AC4**: 支持 `--file-name` 参数设置合并后的文件名
5. **AC5**: 支持 `--async` 标志使用异步合并模式
6. **AC6**: 支持 `--callback-url` 参数设置合并完成后的回调URL（异步模式）
7. **AC7**: 支持 `--auto-convert` 标志自动转存到点播（异步模式）
8. **AC8**: 支持 `--merge-mp4` 标志合并为MP4文件（异步模式）
9. **AC9**: 支持 `--output` 参数选择 table 或 json 输出格式
10. **AC10**: 表格输出格式清晰，显示合并结果

## Tasks / Subtasks

- [x] **Task 1: CLI 类型定义** (AC: 1,2,4,5,6,7,8,9,10)
  - [x] 1.1 在 `packages/cli/src/types/playback.ts` 添加 `PlaybackMergeOptions` 接口
  - [x] 1.2 定义合并选项的字段：channelId, fileIds, fileName, async, callbackUrl, autoConvert, mergeMp4, output

- [x] **Task 2: CLI Handler 实现** (AC: 1,3,4,5,6,7,8,9,10)
  - [x] 2.1 在 `packages/cli/src/handlers/playback.handler.ts` 添加 `mergePlayback` 方法
  - [x] 2.2 根据是否启用异步模式调用不同的 SDK 方法
  - [x] 2.3 调用 SDK 服务: `this.playbackService.mergePlayback()` 或 `this.playbackService.mergePlaybackAsync()`
  - [x] 2.4 实现表格格式化输出
  - [x] 2.5 实现 JSON 格式化输出
  - [x] 2.6 参数验证和错误处理

- [x] **Task 3: CLI Commands 注册** (AC: 1,2,4,5,6,7,8,9)
  - [x] 3.1 在 `packages/cli/src/commands/playback.commands.ts` 添加 `playback merge` 子命令
  - [x] 3.2 注册必需参数：`--channel-id` / `-c`, `--file-ids`
  - [x] 3.3 注册可选参数：`--file-name`, `--async`, `--callback-url`, `--auto-convert`, `--merge-mp4`, `--output` / `-o`
  - [x] 3.4 添加命令帮助文本和示例
  - [x] 3.5 在 `src/index.ts` 中确保命令已注册（通常已通过 playbackCmd 注册）

- [x] **Task 4: CLI Service SDK 实现** (AC: 3,5)
  - [x] 4.1 在 `packages/cli/src/services/playback.service.sdk.ts` 添加 `mergePlayback` 方法
  - [x] 4.2 在 `packages/cli/src/services/playback.service.sdk.ts` 添加 `mergePlaybackAsync` 方法
  - [x] 4.3 调用 SDK 的 `client.channel.recordFileMerge()` 和 `client.channel.recordFileMergeAsync()`

- [x] **Task 5: 单元测试** (AC: 全部)
  - [x] 5.1 CLI Handler 单元测试 (Jest)
  - [x] 5.2 CLI Commands 单元测试 (Jest)
  - [x] 5.3 CLI Service SDK 单元测试 (Jest)
  - [x] 5.4 确保覆盖率 >= 80%
  - [x] 5.5 测试同步合并场景
  - [x] 5.6 测试异步合并场景
  - [x] 5.7 测试各种可选参数组合

## Dev Notes

### API 规范

#### 同步合并 API (默认)
**主 API**: `POST /live/v2/channel/recordFile/{channelId}/merge`
```
URL: http://api.polyv.net/live/v2/channel/recordFile/{channelId}/merge
Method: POST
Content-Type: application/x-www-form-urlencoded
```
**请求参数**:
| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳，3分钟内有效 |
| sign | true | String | 签名，32位大写MD5值 |
| channelId | true | String | 频道号（URL路径参数） |
| urls | false | String | 要合并的录制文件URL，多个文件用英文逗号","分隔 |
| fileIds | false | String | 要合并的录制文件id，多个文件id用英文逗号","分隔 |
| fileName | false | String | 合并后的文件名 |

**响应字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 响应状态码，200为成功 |
| status | String | 响应状态文本信息 |
| message | String | 响应描述信息 |
| data | String | 请求成功时返回合并后的文件地址 |

#### 异步合并 API (`--async` 标志)
**主 API**: `POST /live/v3/channel/record/merge`
```
URL: http://api.polyv.net/live/v3/channel/record/merge
Method: POST
Content-Type: application/x-www-form-urlencoded
```
**请求参数**:
| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳，3分钟内有效 |
| sign | true | String | 签名，32位大写MD5值 |
| channelId | true | String | 频道号 |
| fileIds | true | String | 要合并的录制视频文件ID，多个id用英文逗号, 分隔 |
| fileName | false | String | 合并后的视频的文件名 |
| callbackUrl | false | String | 合并成功或失败回调的url |
| autoConvert | false | String | 是否自动转存到点播，默认为N (Y/N) |
| mergeMp4 | false | String | 合并后文件类型，默认为N (Y:MP4 / N:m3u8) |
| orderByCustom | false | String | 是否按照参数的fileIds顺序做合并 (Y/N) |

**响应字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 响应状态码，200为成功 |
| status | String | 响应状态文本信息 |
| message | String | 响应描述信息 |
| data | String | "processing." 或 "submit success." |

### 命令设计
```bash
# 同步合并（默认）
polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2,file3"

# 设置合并后的文件名
polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2" --file-name "合并回放"

# 异步合并模式
polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2" --async

# 异步合并 + 回调URL
polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2" --async --callback-url "http://example.com/callback"

# 异步合并 + 自动转存点播 + 合并为MP4
polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2" --async --auto-convert --merge-mp4

# JSON 输出
polyv-live-cli playback merge -c "3151318" --file-ids "file1,file2" -o json

# 完整参数名
polyv-live-cli playback merge --channel-id "3151318" --file-ids "file1,file2" --file-name "合并回放" --output table
```

### 表格输出设计
```
合并成功
合并录制文件
频道: 3151318
文件名: 合并回放
源文件数: 3
合并结果: 成功
文件地址: http://oss-live-2.videocc.net/record/...
```

异步模式输出：
```
合并任务已提交
合并录制文件（异步）
频道: 3151318
文件名: 合并回放
源文件数: 3
状态: 处理中
提示: 合并完成后将通过回调URL通知
```

### 关键实现规则

#### 1. SDK 服务调用（已存在）
SDK 中已有 `ChannelService.recordFileMerge()` 和 `ChannelService.recordFileMergeAsync()` 方法：
```typescript
// packages/sdk/src/services/channel.service.ts 已有实现

// 同步合并
async recordFileMerge(
  channelId: string,
  options: RecordMergeArrayRequest
): Promise<RecordMergeResponse>

// 异步合并
async recordFileMergeAsync(
  channelId: string,
  options: RecordMergeArrayRequest
): Promise<boolean>
```

#### 2. PlaybackServiceSdk（需添加）
```typescript
// packages/cli/src/services/playback.service.sdk.ts 需添加

async mergePlayback(
  channelId: string,
  fileIds: string[],
  fileName?: string
): Promise<{ fileId: string; url?: string }> {
  const client = createSdkClient(this.authConfig, this.config.baseUrl);
  return client.channel.recordFileMerge(channelId, {
    fileIds,
    fileName,
  });
}

async mergePlaybackAsync(
  channelId: string,
  fileIds: string[],
  options?: {
    fileName?: string;
    callbackUrl?: string;
    autoConvert?: boolean;
    mergeMp4?: boolean;
  }
): Promise<boolean> {
  const client = createSdkClient(this.authConfig, this.config.baseUrl);
  return client.channel.recordFileMergeAsync(channelId, {
    fileIds,
    fileName: options?.fileName,
    callbackUrl: options?.callbackUrl,
    // 需要扩展 SDK 的 RecordMergeArrayRequest 类型以支持 autoConvert 和 mergeMp4
  });
}
```

#### 3. CLI Handler 模式（参考现有 PlaybackHandler）
```typescript
// packages/cli/src/handlers/playback.handler.ts
async mergePlayback(options: PlaybackMergeOptions): Promise<void> {
  return this.executeWithErrorHandling(async () => {
    // 1. 验证必填参数
    // 2. 解析 fileIds（逗号分隔的字符串转为数组）
    // 3. 根据是否启用异步模式调用不同的 SDK 方法
    // 4. 显示合并结果
  }, 'playback.merge');
}
```

#### 4. CLI 类型定义
```typescript
// packages/cli/src/types/playback.ts
export interface PlaybackMergeOptions {
  channelId: string;
  fileIds: string; // 逗号分隔的字符串
  fileName?: string;
  async?: boolean;
  callbackUrl?: string;
  autoConvert?: boolean;
  mergeMp4?: boolean;
  output?: 'table' | 'json';
}
```

#### 5. fileIds 参数处理
```typescript
// 解析逗号分隔的 fileIds 字符串为数组
const fileIdArray = options.fileIds.split(',').map(id => id.trim()).filter(id => id);
```

#### 6. 认证模式
```typescript
// 使用 authAdapter 获取认证
const authResult = authAdapter.tryGetAuthConfig(parentOptions);
if (!authResult) {
  throw new Error(authAdapter.getStatusMessage(parentOptions));
}
```

### 相关 API 文档
| 文档 | 路径 |
|------|------|
| 合并录制文件（同步） | `docs/api/channel/playback/record_file_merge.md` |
| 合并直播录制（异步） | `docs/api/channel/playback/record_file_merge_async.md` |
| 查询频道录制视频信息 | `docs/api/channel/playback/get_record_info.md` |

### 已有代码参考
- **SDK Service**: `packages/sdk/src/services/channel.service.ts` - `recordFileMerge()`, `recordFileMergeAsync()` 方法（已存在）
- **SDK Types**: `packages/sdk/src/types/channel.ts` - `RecordMergeArrayRequest`, `RecordMergeResponse`（已存在）
- **CLI Service SDK**: `packages/cli/src/services/playback.service.sdk.ts` - 需添加 `mergePlayback()`, `mergePlaybackAsync()` 方法
- **CLI Handler**: `packages/cli/src/handlers/playback.handler.ts` - 需添加 `mergePlayback()` 方法
- **CLI Commands**: `packages/cli/src/commands/playback.commands.ts` - 需添加 `playback merge` 子命令
- **CLI 类型**: `packages/cli/src/types/playback.ts` - 需添加 `PlaybackMergeOptions` 接口

### 与 Story 9-1, 9-2, 9-3 的差异
| 功能 | Story 9-1 (list) | Story 9-2 (get) | Story 9-3 (delete) | Story 9-4 (merge) |
|------|-----------------|-----------------|-------------------|-------------------|
| API 端点 | GET /playback/list | GET /playback/list | POST /playback/delete | POST /recordFile/merge |
| 交互确认 | 无 | 无 | 有（除非 --force） | 无 |
| SDK 方法 | `getPlaybackList()` | `getPlaybackList()` + 查找 | `deletePlayback()` | `recordFileMerge()` / `recordFileMergeAsync()` |
| 风险级别 | 只读操作 | 只读操作 | 写入操作 | 写入操作 |
| 异步模式 | 无 | 无 | 无 | 有（--async 标志） |

### SDK 类型扩展需求
异步合并 API 支持 `autoConvert` 和 `mergeMp4` 参数，但当前 SDK 的 `RecordMergeArrayRequest` 类型可能不包含这些字段。需要检查并扩展：

```typescript
// packages/sdk/src/types/channel.ts 可能需要扩展
export interface RecordMergeArrayRequest {
  fileIds: string[];
  fileName?: string;
  callbackUrl?: string;
  // 可能需要添加：
  autoConvert?: 'Y' | 'N';
  mergeMp4?: 'Y' | 'N';
  orderByCustom?: 'Y' | 'N';
}
```

### 测试要点
1. **CLI Handler 测试**:
   - Mock `PlaybackServiceSdk`
   - 验证参数传递正确
   - 验证同步合并场景
   - 验证异步合并场景
   - 验证可选参数组合
   - 验证表格输出格式
   - 验证 JSON 输出格式
   - 验证错误处理（API 错误）

2. **CLI Commands 测试**:
   - 验证命令注册正确
   - 验证必需参数验证
   - 验证可选参数默认值

3. **边界情况**:
   - 空文件ID列表处理
   - 单个文件ID合并
   - 大量文件ID合并（检查API限制：最多15个MP4文件）
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

