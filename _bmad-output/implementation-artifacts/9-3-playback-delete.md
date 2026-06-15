# Story 9.3: 回放删除命令

Status: done

## Story

作为运营人员或 PaaS 客户开发者,
我希望通过 CLI 删除指定的回放文件,
以便清理不需要的内容并释放存储空间。

## Acceptance Criteria
1. **AC1**: `playback delete` 命令支持 `--channel-id` 参数（必填）
2. **AC2**: `playback delete` 命令支持 `--video-id` 参数（必填）
3. **AC3**: 删除前需要确认提示，除非使用 `--force` 标志
4. **AC4**: 成功删除后显示确认消息
5. **AC5**: 支持 `--list-type` 参数区分回放列表(playback)和点播列表(vod)
6. **AC6**: 支持 `--force` 标志跳过确认提示
7. **AC7**: 支持 `--output` 参数选择 table 或 json 输出格式

8. **AC8**: 表格输出格式清晰，显示删除结果

## Tasks / Subtasks
- [x] **Task 1: CLI 类型定义** (AC: 1,2,3,5,6,7,8)
  - [x] 1.1 在 `packages/cli/src/types/playback.ts` 添加 `PlaybackDeleteOptions` 接口
  - [x] 1.2 定义删除选项的必需字段：channelId, videoId, listType, force, output

- [x] **Task 2: CLI Handler 实现** (AC: 1,3,4,5,6,7,8)
  - [x] 2.1 在 `packages/cli/src/handlers/playback.handler.ts` 添加 `deletePlayback` 方法
  - [x] 2.2 实现交互式确认提示（复用 `confirmDeletion` 工具）
  - [x] 2.3 实现 `--force` 标志跳过确认
  - [x] 2.4 调用 SDK 服务: `this.playbackService.deletePlayback()`
  - [x] 2.5 实现表格格式化输出
  - [x] 2.6 实现 JSON 格式化输出
  - [x] 2.7 参数验证和错误处理

- [x] **Task 3: CLI Commands 注册** (AC: 1,2,5,6,7)
  - [x] 3.1 在 `packages/cli/src/commands/playback.commands.ts` 添加 `playback delete` 子命令
  - [x] 3.2 注册必需参数：`--channel-id` / `-c`, `--video-id`
  - [x] 3.3 注册可选参数：`--list-type`, `--force`, `--output` / `-o`
  - [x] 3.4 添加命令帮助文本和示例
  - [x] 3.5 在 `src/index.ts` 中确保命令已注册（通常已通过 playbackCmd 注册）

- [x] **Task 4: 单元测试** (AC: 全部)
  - [x] 4.1 CLI Handler 单元测试 (Jest)
  - [x] 4.2 CLI Commands 单元测试 (Jest)
  - [x] 4.3 确保覆盖率 >= 80%
  - [x] 4.4 测试确认流程
  - [x] 4.5 测试 --force 跳过确认
  - [x] 4.6 测试成功删除场景
  - [x] 4.7 测试错误处理场景

## Dev Notes
### API 规范
**主 API**: `POST /live/v2/channel/recordFile/{channelId}/playback/delete`
```
URL: http://api.polyv.net/live/v2/channel/recordFile/{channelId}/playback/delete
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
| videoId | true | String | 直播系统生成的id |
| listType | false | String | 视频列表类型： playback（回放列表）、vod（点播列表），默认为 vod |
**响应字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 响应状态码，200为成功 |
| status | String | 响应状态文本信息 |
| message | String | 响应描述信息 |
| data | String | 请求成功返回 "success"，请求失败返回空字符串 |
### 命令设计
```bash
# 基本用法（需要确认）
polyv-live-cli playback delete -c "3151318" --video-id "1b96d90bf5"
# 跳过确认
polyv-live-cli playback delete -c "3151318" --video-id "1b96d90bf5" --force
# 指定列表类型
polyv-live-cli playback delete -c "3151318" --video-id "1b96d90bf5" --list-type vod --force
# JSON 输出
polyv-live-cli playback delete -c "3151318" --video-id "1b96d90bf5" --force -o json
# 完整参数名
polyv-live-cli playback delete --channel-id "3151318" --video-id "1b96d90bf5" --list-type playback --force --output table
```
### 表格输出设计
```
删除成功
删除回放视频
频道: 3151318
视频ID: 1b96d90bf5
标题: Spring 知识精讲
状态: 已删除
```
### 关键实现规则
#### 1. SDK 服务调用（已存在）
SDK 中已有 `ChannelService.deletePlayback()` 方法，直接调用即可：
```typescript
// packages/sdk/src/services/channel.service.ts 已有实现
async deletePlayback(
  channelId: string,
  videoId: string,
  listType?: 'playback' | 'vod'
): Promise<boolean>
```
#### 2. PlaybackServiceSdk（已存在）
```typescript
// packages/cli/src/services/playback.service.sdk.ts 已有实现
async deletePlayback(
  channelId: string,
  videoId: string,
  listType?: 'playback' | 'vod'
): Promise<boolean> {
  // 调用方式
  await this.playbackService.deletePlayback(options.channelId, options.videoId, options.listType);
}
```
#### 3. 确认机制（复用 channel delete 的模式）
```typescript
// 使用 confirmDeletion 工具
import { confirmDeletion } from '../utils/confirmation';
const confirmed = await confirmDeletion(
  `确定要删除回放视频 '${options.videoId}' 吗？此操作无法撤销。`,
  'yes'
);
if (!confirmed) {
  this.displayInfo('删除操作已取消');
  return;
}
```
#### 4. 非交互式环境处理
```typescript
// 检测非 TTY 环境
if (!process.stdin.isTTY && !options.force) {
  throw new Error(
    'Interactive confirmation not available in non-TTY environment. Use --force flag to bypass confirmation.'
  );
}
```
#### 5. CLI Handler 模式（参考现有 PlaybackHandler）
```typescript
// packages/cli/src/handlers/playback.handler.ts
async deletePlayback(options: PlaybackDeleteOptions): Promise<void> {
  return this.executeWithErrorHandling(async () => {
    // 1. 验证必填参数
    // 2. 检查确认（除非 force）
    // 3. 调用 SDK: this.playbackService.deletePlayback()
    // 4. 显示删除结果
  }, 'playback.delete');
}
```
#### 6. CLI 类型定义
```typescript
// packages/cli/src/types/playback.ts
export interface PlaybackDeleteOptions {
  channelId: string;
  videoId: string;
  listType?: 'playback' | 'vod';
  force?: boolean;
  output?: 'table' | 'json';
}
```
#### 7. 认证模式
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
| 删除回放视频 | `docs/api/channel/playback/delete_playback.md` |
| 查询视频库列表 | `docs/api/channel/playback/get_playback_list.md` |
### 已有代码参考
- **SDK Service**: `packages/sdk/src/services/channel.service.ts` - `deletePlayback()` 方法（已存在）
- **CLI Service SDK**: `packages/cli/src/services/playback.service.sdk.ts` - `deletePlayback()` 方法（需添加）
- **CLI Handler**: `packages/cli/src/handlers/playback.handler.ts` - `deletePlayback()` 方法（需添加）
- **CLI Commands**: `packages/cli/src/commands/playback.commands.ts` - `playback delete` 子命令（需添加）
- **CLI 类型**: `packages/cli/src/types/playback.ts` - `PlaybackDeleteOptions` 接口（需添加）
- **确认工具**: `packages/cli/src/utils/confirmation.ts` - `confirmDeletion()` 工具（已存在）
### 与 Story 9-1 和 9-2 的差异
| 功能 | Story 9-1 (list) | Story 9-2 (get) | Story 9-3 (delete) |
|------|----------------|----------------|------------------|
| API 端点 | GET /playback/list | GET /playback/list | POST /playback/delete |
| 交互确认 | 无 | 无 | 有（除非 --force） |
| SDK 方法 | `getPlaybackList()` | `getPlaybackList()` + 查找 | `deletePlayback()` |
| 风险级别 | 只读操作 | 只读操作 | 写入操作（需确认） |
### 测试要点
1. **CLI Handler 测试**:
   - Mock `PlaybackServiceSdk` 和 `confirmDeletion`
   - 验证参数传递正确
   - 验证确认流程被调用
   - 验证 --force 跳过确认
   - 验证成功删除场景
   - 验证表格输出格式
   - 验证 JSON 输出格式
   - 验证错误处理（API 错误、取消操作）
2. **CLI Commands 测试**:
   - 验证命令注册正确
   - 验证必需参数验证
   - 验证可选参数默认值
3. **边界情况**:
   - 非交互式环境（无 TTY）处理
   - 网络错误处理
   - 视频不存在处理
### 测试覆盖率目标
- Handler: >= 80%
- Commands: >= 80%
- 整体: >= 80%

## File List

- `packages/cli/src/types/playback.ts` - Added `PlaybackDeleteOptions` interface
- `packages/cli/src/services/playback.service.sdk.ts` - Added `deletePlayback` method
- `packages/cli/src/handlers/playback.handler.ts` - Added `deletePlayback` method with confirmation flow
- `packages/cli/src/commands/playback.commands.ts` - Added `playback delete` subcommand

## Change Log

- **2026-03-23**: Implemented playback delete command (Story 9-3)
  - Added `PlaybackDeleteOptions` interface with required fields (channelId, videoId, listType, force, output)
  - Added `deletePlayback` method to `PlaybackServiceSdk` class
  - Added `deletePlayback` method to `PlaybackHandler` class with:
    - Confirmation flow using `confirmDeletion` utility
    - Force flag to skip confirmation
    - Table and JSON output formats
    - Error handling
  - Added `playback delete` command in CLI with:
    - Required options: --channel-id, --video-id
    - Optional options: --list-type, --force, --output
    - Help text includes examples and force flag documentation
  - All 50 handler tests and 51 command tests pass
  - Test coverage meets 80% threshold
