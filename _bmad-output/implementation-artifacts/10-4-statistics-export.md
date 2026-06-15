# Story 10.4: 统计报表导出命令

Status: done

## Story

作为运营人员，
我希望通过 CLI 导出频道统计报表（观看日志和场次报表），
以便将数据导出为 CSV 文件进行线下分析或存档。

## Acceptance Criteria

1. **AC1**: `statistics export viewlog` 命令支持导出频道观看日志数据
2. **AC2**: `statistics export session` 命令支持导出频道场次报表（返回下载链接）
3. **AC3**: `viewlog` 命令支持 `--start-time` 和 `--end-time` 参数按时间范围过滤
4. **AC4**: `viewlog` 命令支持 `--watch-type` 参数过滤观看类型（live/vod）
5. **AC5**: `viewlog` 命令支持 `--output` 参数指定输出文件路径（CSV 格式）
6. **AC6**: `session` 命令需要 `--session-id` 参数指定场次
7. **AC7**: `session` 命令返回报表下载链接
8. **AC8**: 表格输出格式清晰，显示导出状态和文件路径/链接
9. **AC9**: JSON 输出完整包含所有字段
10. **AC10**: 支持 `--channel-id` 参数指定频道（viewlog 必需，session 可选）

## Tasks / Subtasks

- [ ] **Task 1: SDK 类型定义扩展** (AC: 1,2,3,4,5,6,7,8,9,10)
  - [ ] 1.1 在 `packages/sdk/src/types/statistics.ts` 添加类型定义
  - [ ] 1.2 定义 `ViewlogItem` 接口（观看日志数据项）
  - [ ] 1.3 定义 `GetViewlogParams` 接口（请求参数：channelId, startTime, endTime, watchType, page, pageSize）
  - [ ] 1.4 定义 `GetViewlogResponse` 接口（分页响应包装）
  - [ ] 1.5 定义 `ExportSessionStatsParams` 接口（请求参数：channelId, sessionId）
  - [ ] 1.6 定义 `ExportSessionStatsResponse` 接口（响应包含下载链接）
  - [ ] 1.7 在 `types/index.ts` 导出新类型

- [ ] **Task 2: SDK Service 扩展** (AC: 1,2,3,4,6,7,10)
  - [ ] 2.1 在 `packages/sdk/src/services/statistics.service.ts` 添加新方法
  - [ ] 2.2 实现 `getViewlog(params)` 方法调用 `/live/v3/user/statistics/viewlog`
  - [ ] 2.3 实现 `exportSessionStats(params)` 方法调用 `/live/v3/channel/session/stats/export`
  - [ ] 2.4 添加分页支持（自动获取所有页或支持指定页）
  - [ ] 2.5 添加参数验证

- [ ] **Task 3: CLI 类型定义扩展** (AC: 1,2,3,4,5,6,8,9,10)
  - [ ] 3.1 在 `packages/cli/src/types/statistics.ts` 添加 CLI 选项类型
  - [ ] 3.2 定义 `StatisticsExportViewlogOptions` 接口
  - [ ] 3.3 定义 `StatisticsExportSessionOptions` 接口
  - [ ] 3.4 定义 `ViewlogItem` 接口（用于 CLI 显示和 CSV 导出）

- [ ] **Task 4: CLI Service SDK 扩展** (AC: 1,2,3,4,6,7)
  - [ ] 4.1 在 `packages/cli/src/services/statistics.service.sdk.ts` 添加新方法
  - [ ] 4.2 实现 `getViewlog(options)` 方法
  - [ ] 4.3 实现 `exportSessionStats(options)` 方法

- [ ] **Task 5: CLI Handler 扩展** (AC: 1,2,3,4,5,6,7,8,9)
  - [ ] 5.1 在 `packages/cli/src/handlers/statistics.handler.ts` 添加新方法
  - [ ] 5.2 实现 `exportViewlog(options)` 方法
  - [ ] 5.3 实现 `exportSessionStats(options)` 方法
  - [ ] 5.4 实现 CSV 文件写入功能（使用 fs 模块）
  - [ ] 5.5 实现观看日志表格格式化输出
  - [ ] 5.6 实现场次报表链接输出
  - [ ] 5.7 实现 JSON 格式化输出

- [ ] **Task 6: CLI Commands 扩展** (AC: 1,2,3,4,5,6,10)
  - [ ] 6.1 在 `packages/cli/src/commands/statistics.commands.ts` 注册新命令
  - [ ] 6.2 注册 `statistics export` 命令组
  - [ ] 6.3 注册 `statistics export viewlog` 子命令
  - [ ] 6.4 注册 `statistics export session` 子命令
  - [ ] 6.5 定义必需参数：`--channel-id` (viewlog), `--session-id` (session)
  - [ ] 6.6 定义时间参数：`--start-time`, `--end-time`
  - [ ] 6.7 定义过滤参数：`--watch-type` (live/vod)
  - [ ] 6.8 定义输出参数：`--output` (文件路径)
  - [ ] 6.9 定义可选参数：`--page`, `--page-size`

- [ ] **Task 7: 单元测试** (AC: 全部)
  - [ ] 7.1 SDK Service 单元测试 (Vitest) - 新增方法
  - [ ] 7.2 CLI Handler 单元测试 (Jest) - 新增方法
  - [ ] 7.3 CLI Commands 单元测试 (Jest) - 新增命令
  - [ ] 7.4 确保覆盖率 >= 80%

## Dev Notes

### API 规范

#### API 1: 分页查询账号直播观看详情数据

**URL**: `GET /live/v3/user/statistics/viewlog`

```
URL: http://api.polyv.net/live/v3/user/statistics/viewlog
Method: GET
```

**请求参数**:

| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳，3分钟内有效 |
| sign | true | String | 签名，32位大写MD5 |
| startDate | true | String | 查询开始时间，格式: yyyy-MM-dd HH:mm:ss |
| endDate | true | String | 查询结束时间，格式: yyyy-MM-dd HH:mm:ss |
| channelId | false | String | 频道ID，不传查询所有频道 |
| watchType | false | String | 观看类型：live（直播），vod（回放） |
| page | false | String | 当前页码，默认为1 |
| pageSize | false | String | 每页显示的数据条数，默认1000条 |

**约束**: startDate 和 endDate 必须在同一个月

**响应字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 响应状态码 |
| status | String | 响应状态文本 |
| message | String | 响应描述信息 |
| data | Object | 分页数据对象 |

**Data 对象**:

| 字段 | 类型 | 说明 |
|------|------|------|
| pageSize | Integer | 每页数据条数 |
| pageNumber | Integer | 当前页数 |
| totalItems | Integer | 总条数 |
| totalPages | Integer | 总页数 |
| contents | Array | 观看日志列表 |

**Contents 数组元素**:

| 字段 | 类型 | 说明 |
|------|------|------|
| playId | String | 播放动作ID |
| userId | String | 直播账号ID |
| channelId | String | 频道号 |
| playDuration | Integer | 播放时长，单位:秒 |
| stayDuration | Integer | 停留时长，单位:秒 |
| sessionId | String | 直播场次ID |
| param1 | String | 观众ID |
| param2 | String | 观众昵称 |
| param3 | String | 观看类型：vod(回放)/live(直播) |
| ipAddress | String | IP地址 |
| country | String | 国家 |
| province | String | 省份 |
| city | String | 城市 |
| isp | String | ISP运营商 |
| referer | String | 播放页面地址 |
| userAgent | String | 用户设备 |
| operatingSystem | String | 操作系统 |
| browser | String | 浏览器 |
| isMobile | String | 是否移动端: Y/N |
| currentDay | String | 查询日期，格式: yyyy-MM-dd |
| createdTime | Long | 日志创建时间，13位毫秒级时间戳 |
| lastModified | Long | 日志更新时间，13位毫秒级时间戳 |
| ptype | Integer | 直播类型: 0(普通)/1(超低延迟)/2(PRTC) |
| firstActiveTime | Long | 进入页面时间 |
| lastActiveTime | Long | 退出页面时间 |

**成功响应示例**:
```json
{
  "code": 200,
  "status": "success",
  "message": "",
  "data": {
    "pageSize": 1000,
    "pageNumber": 1,
    "totalItems": 1,
    "contents": [
      {
        "playId": "1648432513206X1501461",
        "userId": "1b448be323",
        "channelId": 2909053,
        "playDuration": 87,
        "stayDuration": 90,
        "sessionId": "g83wdgxfh6",
        "param1": "1648432461504",
        "param2": "回放列表观看",
        "param3": "vod",
        "ipAddress": "120.228.5.164",
        "country": "中国",
        "province": "湖南",
        "city": "长沙",
        "isp": "移动",
        "referer": "https://live.polyv.cn/watch/2909053",
        "userAgent": "Mozilla/5.0...",
        "operatingSystem": "Windows",
        "browser": "Chrome 9",
        "isMobile": "N",
        "currentDay": "2022-03-28",
        "createdTime": 1648432556000,
        "lastModified": 1648443664000,
        "ptype": 0,
        "firstActiveTime": 1648432516000,
        "lastActiveTime": 1648432606000
      }
    ],
    "totalPages": 1
  }
}
```

#### API 2: 导出频道场次报表

**URL**: `GET /live/v3/channel/session/stats/export`

```
URL: http://api.polyv.net/live/v3/channel/session/stats/export
Method: GET
```

**请求参数**:

| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳，3分钟内有效 |
| sign | true | String | 签名，32位大写MD5 |
| channelId | true | String | 直播频道号 |
| sessionId | true | String | 直播场次号 |

**响应字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 响应状态码 |
| status | String | 响应状态文本 |
| message | String | 响应描述信息 |
| data | String | 报表下载地址（有效期60天） |

**成功响应示例**:
```json
{
  "code": 200,
  "status": "success",
  "message": "",
  "data": "https://liveimages.videocc.net/xx/xxx/xx.xlsx"
}
```

**异常响应示例**:
```json
{
  "code": 400,
  "status": "error",
  "message": "Report is not ready yet, please try again later.",
  "data": ""
}
```

### 项目结构笔记

**SDK 文件（扩展现有）**:
- 类型: `packages/sdk/src/types/statistics.ts`
- 服务: `packages/sdk/src/services/statistics.service.ts`
- 测试: `packages/sdk/src/services/statistics.service.test.ts`

**CLI 文件（扩展现有）**:
- 类型: `packages/cli/src/types/statistics.ts`
- Service SDK: `packages/cli/src/services/statistics.service.sdk.ts`
- Handler: `packages/cli/src/handlers/statistics.handler.ts`
- Commands: `packages/cli/src/commands/statistics.commands.ts`
- 测试: `packages/cli/tests/commands/statistics.commands.test.ts`
- 测试: `packages/cli/tests/handlers/statistics.handler.test.ts`

### 命令设计

```bash
# 导出观看日志（指定频道）
polyv-live-cli statistics export viewlog -c "3151318" --start-time "2024-01-01 00:00:00" --end-time "2024-01-31 23:59:59"

# 导出观看日志（指定观看类型）
polyv-live-cli statistics export viewlog -c "3151318" --start-time "2024-01-01 00:00:00" --end-time "2024-01-31 23:59:59" --watch-type live

# 导出观看日志到指定文件
polyv-live-cli statistics export viewlog -c "3151318" --start-time "2024-01-01 00:00:00" --end-time "2024-01-31 23:59:59" --output ./viewlog.csv

# JSON 输出（不写文件，直接输出 JSON）
polyv-live-cli statistics export viewlog -c "3151318" --start-time "2024-01-01 00:00:00" --end-time "2024-01-31 23:59:59" -o json

# 导出场次报表（获取下载链接）
polyv-live-cli statistics export session -c "3151318" --session-id "fv3ma84e63"

# JSON 输出
polyv-live-cli statistics export session -c "3151318" --session-id "fv3ma84e63" -o json
```

### 表格输出设计

#### 观看日志表格（预览前10条）

```
观看日志导出成功
时间范围: 2024-01-01 00:00:00 - 2024-01-31 23:59:59
总记录数: 1500 条

预览（前10条）:
┌─────────────┬─────────┬──────────┬──────────┬──────────┬────────┬────────────┐
│ 播放ID      │ 观众ID  │ 观众昵称 │ 观看类型 │ 播放时长 │ IP地址 │ 日期       │
├─────────────┼─────────┼──────────┼──────────┼──────────┼────────┼────────────┤
│ xxx1461     │ user1   │ 张三     │ live     │ 87       │ 120... │ 2024-01-15 │
│ xxx1462     │ user2   │ 李四     │ vod      │ 120      │ 121... │ 2024-01-15 │
└─────────────┴─────────┴──────────┴──────────┴──────────┴────────┴────────────┘

已导出到: ./viewlog_2024-01-01_2024-01-31.csv
```

#### 场次报表输出

```
场次报表导出成功

频道号: 3151318
场次号: fv3ma84e63

下载链接: https://liveimages.videocc.net/xx/xxx/xx.xlsx
链接有效期: 60天
```

### CSV 文件格式

观看日志 CSV 文件应包含以下列（中文表头）:

```
播放ID,观众ID,观众昵称,观看类型,播放时长(秒),停留时长(秒),场次ID,IP地址,国家,省份,城市,ISP,操作系统,浏览器,是否移动端,日期,创建时间
```

### 关键实现规则

#### 1. SDK 服务模式（扩展现有 StatisticsService）

```typescript
// packages/sdk/src/services/statistics.service.ts
export class StatisticsService {
  // 现有方法: getDailyViewStatistics, getConcurrencyData, getMaxConcurrent,
  //          getRegionDistribution, getDeviceDistribution

  /**
   * 获取观看日志（分页）
   */
  async getViewlog(
    params: GetViewlogParams
  ): Promise<GetViewlogResponse> {
    // 1. 验证参数（startDate/endDate 必填，且在同一个月）
    // 2. 调用 API: GET /live/v3/user/statistics/viewlog
    // 3. 返回响应
  }

  /**
   * 导出场次报表
   */
  async exportSessionStats(
    params: ExportSessionStatsParams
  ): Promise<ExportSessionStatsResponse> {
    // 1. 验证参数（channelId、sessionId 必填）
    // 2. 调用 API: GET /live/v3/channel/session/stats/export
    // 3. 返回下载链接
  }
}
```

#### 2. CLI Handler 模式（扩展现有 StatisticsHandler）

```typescript
// packages/cli/src/handlers/statistics.handler.ts
export class StatisticsHandler extends BaseHandler {
  // 现有方法: viewStatistics, viewConcurrency, viewMaxConcurrent,
  //          viewRegionDistribution, viewDeviceDistribution

  /**
   * 导出观看日志
   */
  async exportViewlog(options: StatisticsExportViewlogOptions): Promise<void> {
    // 1. 验证时间参数
    // 2. 调用 SDK: statisticsService.getViewlog(params)
    // 3. 如果指定了 --output，写入 CSV 文件
    // 4. 否则输出表格预览或 JSON
  }

  /**
   * 导出场次报表
   */
  async exportSessionStats(options: StatisticsExportSessionOptions): Promise<void> {
    // 1. 验证参数
    // 2. 调用 SDK: statisticsService.exportSessionStats(params)
    // 3. 输出下载链接
  }
}
```

#### 3. 时间参数处理

**观看日志 API**:
- 使用 `startDate`/`endDate` 参数（格式: `yyyy-MM-dd HH:mm:ss`）
- 需要将 CLI 的 `--start-time`/`--end-time` 转换为 API 格式
- 两个时间必须在同一个月

**实现建议**:
```typescript
// CLI 参数接受多种格式:
// 1. 时间戳: 1704067200000
// 2. 日期时间字符串: "2024-01-01 00:00:00"
// 3. 日期字符串: "2024-01-01" (自动补充 00:00:00 和 23:59:59)
```

#### 4. CSV 文件写入

使用 Node.js `fs` 模块写入 CSV 文件:
- 使用逗号分隔
- 使用双引号包裹含逗号的字段
- 处理中文字符编码（UTF-8）

#### 5. 认证模式

```typescript
// 使用 authAdapter 获取认证（与 story 10-1, 10-2, 10-3 相同模式）
const authResult = authAdapter.tryGetAuthConfig(parentOptions);
if (!authResult) {
  throw new Error(authAdapter.getStatusMessage(parentOptions));
}
```

### V3 API 注意事项

观看日志 API 是 **V3 版本**:

1. **API 路径**: `/live/v3/user/statistics/viewlog` (账号级)
2. **时间参数**: 使用 `startDate`/`endDate`（日期时间字符串格式）
3. **同月约束**: startDate 和 endDate 必须在同一个月
4. **响应格式**: 包含 `code`、`status`、`message`、`data` 字段

### 相关 API 文档

| 文档 | 路径 |
|------|------|
| 分页查询观看详情 | `docs/api/channel/viewdata/viewlog_page_v3.md` |
| 导出场次报��� | `docs/api/channel/session/export_session_stats.md` |
| 每日观看统计 | `docs/api/channel/viewdata/daily_summary.md` (已实现) |
| 历史并发数据 | `docs/api/channel/viewdata/concurrency.md` (已实现) |
| 历史最高并发 | `docs/api/channel/viewdata/get_max_history_concurrent.md` (已实现) |
| 地域分布统计 | `docs/api/v4/channel/statistics/geo_summary_mc.md` (已实现) |
| 终端分布统计 | `docs/api/v4/channel/statistics/browsers_summary.md` (已实现) |

### 已有代码参考

- **SDK Service**: `packages/sdk/src/services/statistics.service.ts` (已有多个统计方法)
- **SDK 类型**: `packages/sdk/src/types/statistics.ts` (已有统计类型)
- **CLI Commands**: `packages/cli/src/commands/statistics.commands.ts` (已有 view, concurrency, audience 命令)
- **CLI Handler**: `packages/cli/src/handlers/statistics.handler.ts` (已有处理方法)
- **CLI Service SDK**: `packages/cli/src/services/statistics.service.sdk.ts`

### Story 10-1, 10-2, 10-3 学习要点

1. **SDK 服务包装模式**: CLI 使用 `StatisticsServiceSdk` 包装 SDK 服务，而非直接使用 `PolyVClient`
2. **类型转换**: SDK 类型与 CLI 类型分开定义，Handler 负责转换
3. **时间参数处理**:
   - V3 API 使用日期字符串格式 (`yyyy-MM-dd`)
   - V4 API 使用时间戳格式 (13位毫秒)
   - 需要在 Handler 层做格式转换
4. **认证优先级**: 使用 `authAdapter` 处理多源认证
5. **输出模式**: 支持 `--output table|json` 两种格式

### 测试要点

1. **SDK 测试**:
   - Mock `httpClient.get()` 返回
   - 验证参数传递正确
   - 验证日期格式转换
   - 验证同月约束

2. **CLI 测试**:
   - 命令注册正确
   - 参数验证（必需参数缺失时报错）
   - 输出格式化正确
   - CSV 文件写入正确

3. **覆盖率要求**:
   - Functions: >= 80%
   - Lines: >= 80%
   - Statements: >= 80%
   - Branches: >= 70%

### References

- [Source: docs/api/channel/viewdata/viewlog_page_v3.md]
- [Source: docs/api/channel/session/export_session_stats.md]
- [Source: _bmad-output/project-context.md#SDK开发规则]
- [Source: _bmad-output/project-context.md#CLI开发规则]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic10]
- [Source: _bmad-output/implementation-artifacts/10-1-statistics-view.md]
- [Source: _bmad-output/implementation-artifacts/10-2-statistics-concurrency.md]
- [Source: _bmad-output/implementation-artifacts/10-3-statistics-audience.md]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
