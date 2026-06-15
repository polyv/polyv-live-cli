# Story 10.3: 观众画像命令

Status: done

## Story

作为运营人员，
我希望通过 CLI 获取频道观众画像数据（地域分布和终端分布），
以便分析观众来源和观看设备偏好。

## Acceptance Criteria

1. **AC1**: `statistics audience region` 命令返回观众地域分布（省份/城市/国家）
2. **AC2**: `statistics audience device` 命令返回观众终端分布（PC/移动端浏览器）
3. **AC3**: 支持通过 `--start-time` 和 `--end-time` 参数按时间范围过滤（时间跨度不超过90天）
4. **AC4**: `region` 命令支持 `--type` 参数指定统计类型（country/province/city），默认为 province
5. **AC5**: 表格输出格式清晰，显示地域/终端名称、观看次数、观众数、占比
6. **AC6**: JSON 输出完整包含所有字段
7. **AC7**: 支持 `--channel-id` 参数指定频道（必需）

## Tasks / Subtasks

- [x] **Task 1: SDK 类型定义扩展** (AC: 1,2,3,4,5,6,7)
  - [x] 1.1 在 `packages/sdk/src/types/statistics.ts` 添加类型定义
  - [x] 1.2 定义 `RegionDistributionItem` 接口（地域分布数据项）
  - [x] 1.3 定义 `DeviceDistributionItem` 接口（终端分布数据项）
  - [x] 1.4 定义 `GetRegionDistributionParams` 接口（请求参数：channelId, startTime, endTime, type）
  - [x] 1.5 定义 `GetRegionDistributionResponse` 接口（响应包装）
  - [x] 1.6 定义 `GetDeviceDistributionParams` 接口（请求参数：channelId, startTime, endTime）
  - [x] 1.7 定义 `GetDeviceDistributionResponse` 接口（响应包装）
  - [x] 1.8 在 `types/index.ts` 导出新类型

- [x] **Task 2: SDK Service 扩展** (AC: 1,2,3,4)
  - [x] 2.1 在 `packages/sdk/src/services/statistics.service.ts` 添加新方法
  - [x] 2.2 实现 `getRegionDistribution(params)` 方法调用 `/live/v4/channel/statistics/geo-summary-mc`
  - [x] 2.3 实现 `getDeviceDistribution(params)` 方法调用 `/live/v4/channel/statistics/browser-summary`
  - [x] 2.4 添加时间范围验证（90天）
  - [x] 2.5 添加类型参数验证（country/province/city）

- [x] **Task 3: CLI 类型定义扩展** (AC: 1,2,3,4,5,6,7)
  - [x] 3.1 在 `packages/cli/src/types/statistics.ts` 添加 CLI 选项类型
  - [x] 3.2 定义 `StatisticsAudienceRegionOptions` 接口
  - [x] 3.3 定义 `StatisticsAudienceDeviceOptions` 接口
  - [x] 3.4 定义 `RegionDistributionItem` 接口（用于 CLI 显示）
  - [x] 3.5 定义 `DeviceDistributionItem` 接口（用于 CLI 显示）

- [x] **Task 4: CLI Service SDK 扩展** (AC: 1,2,3,4)
  - [x] 4.1 在 `packages/cli/src/services/statistics.service.sdk.ts` 添加新方法
  - [x] 4.2 实现 `getRegionDistribution(options)` 方法
  - [x] 4.3 实现 `getDeviceDistribution(options)` 方法

- [x] **Task 5: CLI Handler 扩展** (AC: 1,2,3,4,5,6)
  - [x] 5.1 在 `packages/cli/src/handlers/statistics.handler.ts` 添加新方法
  - [x] 5.2 实现 `viewRegionDistribution(options)` 方法
  - [x] 5.3 实现 `viewDeviceDistribution(options)` 方法
  - [x] 5.4 实现地域分布表格格式化输出
  - [x] 5.5 实现终端分布表格格式化输出
  - [x] 5.6 实现 JSON 格式化输出

- [x] **Task 6: CLI Commands 扩展** (AC: 1,2,3,4,7)
  - [x] 6.1 在 `packages/cli/src/commands/statistics.commands.ts` 注册新命令
  - [x] 6.2 注册 `statistics audience` 命令组
  - [x] 6.3 注册 `statistics audience region` 子命令
  - [x] 6.4 注册 `statistics audience device` 子命令
  - [x] 6.5 定义必需参数：`--channel-id`
  - [x] 6.6 定义时间戳参数：`--start-time`, `--end-time`
  - [x] 6.7 定义 `--type` 参数（region 命令，可选：country/province/city）
  - [x] 6.8 定义可选参数：`--output`

- [x] **Task 7: 单元测试** (AC: 全部)
  - [x] 7.1 SDK Service 单元测试 (Vitest) - 新增方法
  - [x] 7.2 CLI Handler 单元测试 (Jest) - 新增方法
  - [x] 7.3 CLI Commands 单元测试 (Jest) - 新增命令
  - [x] 7.4 确保覆盖率 >= 80%

## Dev Notes

### API 规范

#### API 1: 地域分布统计

**URL**: `GET /live/v4/channel/statistics/geo-summary-mc`

```
URL: http://api.polyv.net/live/v4/channel/statistics/geo-summary-mc
Method: GET
```

**请求参数**:

| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳，3分钟内有效 |
| sign | true | String | 签名，32位大写MD5 |
| channelId | true | String | 频道号 |
| startTime | true | Long | 开始时间，13位毫秒级时间戳 |
| endTime | true | Long | 结束时间，13位毫秒级时间戳 |
| type | false | String | 统计类型，默认为province<br/>country：按国家统计<br/>province：按省份统计<br/>city：按城市统计 |

**约束**: 时间跨度**不能超过90天**

**响应字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 响应状态码 |
| status | String | 响应状态文本 |
| success | Boolean | 是否成功响应 |
| requestId | String | 请求ID |
| data | Array | 地域分布数据数组 |

**Data 数组元素**:

| 字段 | 类型 | 说明 |
|------|------|------|
| plays | Integer | 观看次数 |
| viewers | Integer | 观看用户数（基于viewerId） |
| ips | Integer | 观看IP数 |
| playDuration | Integer | 观看时长，单位:分钟 |
| country | String | 国家 |
| province | String | 省份 |
| city | String | 城市 |
| percent | Double | 百分比，保留两位小数（基于观看次数） |

**成功响应示例**:
```json
{
  "code": 200,
  "status": "success",
  "requestId": "68e5160da1484817bba9ec0b63310e95.60.16520919629800561",
  "data": [
    {
      "ips": 38,
      "playDuration": 677,
      "plays": 86,
      "viewers": 30,
      "country": null,
      "province": "湖南",
      "city": null,
      "percent": 97.73
    },
    {
      "ips": 1,
      "playDuration": 1,
      "plays": 2,
      "viewers": 1,
      "country": null,
      "province": "未知",
      "city": null,
      "percent": 2.27
    }
  ],
  "success": true
}
```

#### API 2: 终端分布统计

**URL**: `GET /live/v4/channel/statistics/browser-summary`

```
URL: http://api.polyv.net/live/v4/channel/statistics/browser-summary
Method: GET
```

**请求参数**:

| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳，3分钟内有效 |
| sign | true | String | 签名，32位大写MD5 |
| channelId | true | String | 频道号 |
| startTime | true | Long | 开始时间，13位毫秒级时间戳 |
| endTime | true | Long | 结束时间，13位毫秒级时间戳 |

**约束**: 时间跨度**不能超过90天**

**响应字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 响应状态码 |
| status | String | 响应状态文本 |
| success | Boolean | 是否成功响应 |
| requestId | String | 请求ID |
| data | Array | 终端分布数据数组 |

**Data 数组元素**:

| 字段 | 类型 | 说明 |
|------|------|------|
| name | String | 终端名称 |
| platform | String | 终端类型<br/>pc：PC端<br/>mobile：移动端 |
| plays | Integer | 观看次数 |
| viewers | Integer | 观看用户数（基于viewerId） |
| ips | Integer | 观看IP数 |
| playDuration | Integer | 观看时长，单位:分钟 |
| percent | Double | 百分比，保留两位小数（基于观看次数） |

**成功响应示例**:
```json
{
  "code": 200,
  "status": "success",
  "requestId": "1375e52c9fc041a89ce61daf28f79737.58.16520842026550383",
  "data": [
    {
      "name": "Chrome",
      "platform": "pc",
      "plays": 101,
      "viewers": 11,
      "ips": 28,
      "playDuration": 586,
      "percent": 69.18
    },
    {
      "name": "weixin",
      "platform": "mobile",
      "plays": 29,
      "viewers": 13,
      "ips": 10,
      "playDuration": 49,
      "percent": 19.86
    }
  ],
  "success": true
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
# 地域分布（省份统计，默认）
polyv-live-cli statistics audience region -c "3151318" --start-time 1648742400000 --end-time 1651334399000

# 地域分布（城市统计）
polyv-live-cli statistics audience region -c "3151318" --start-time 1648742400000 --end-time 1651334399000 --type city

# 地域分布（国家统计）
polyv-live-cli statistics audience region -c "3151318" --start-time 1648742400000 --end-time 1651334399000 --type country

# JSON 输出
polyv-live-cli statistics audience region -c "3151318" --start-time 1648742400000 --end-time 1651334399000 -o json

# 终端分布
polyv-live-cli statistics audience device -c "3151318" --start-time 1651386101000 --end-time 1652336501462

# JSON 输出
polyv-live-cli statistics audience device -c "3151318" --start-time 1651386101000 --end-time 1652336501462 -o json
```

### 表格输出设计

#### 地域分布表格

```
┌──────────┬──────────┬──────────┬──────────┬──────────────┬─────────┐
│ 地域     │ 观看次数 │ 观众数   │ IP数     │ 播放时长(分) │ 占比    │
├──────────┼──────────┼──────────┼──────────┼──────────────┼─────────┤
│ 湖南     │ 86       │ 30       │ 38       │ 677          │ 97.73%  │
│ 未知     │ 2        │ 1        │ 1        │ 1            │ 2.27%   │
└──────────┴──────────┴──────────┴──────────┴──────────────┴─────────┘
```

#### 终端分布表格

```
┌───────────┬──────────┬──────────┬──────────┬──────────────┬─────────┐
│ 终端      │ 平台     │ 观看次数 │ 观众数   │ 播放时长(分) │ 占比    │
├───────────┼──────────┼──────────┼──────────┼──────────────┼─────────┤
│ Chrome    │ pc       │ 101      │ 11       │ 586          │ 69.18%  │
│ weixin    │ mobile   │ 29       │ 13       │ 49           │ 19.86%  │
│ Safari    │ mobile   │ 11       │ 4        │ 12           │ 7.53%   │
└───────────┴──────────┴──────────┴──────────┴──────────────┴─────────┘
```

### 关键实现规则

#### 1. SDK 服务模式（扩展现有 StatisticsService）

```typescript
// packages/sdk/src/services/statistics.service.ts
export class StatisticsService {
  // 现有方法: getDailyViewStatistics, getConcurrencyData, getMaxConcurrent

  /**
   * 获取地域分布数据
   */
  async getRegionDistribution(
    params: GetRegionDistributionParams
  ): Promise<GetRegionDistributionResponse> {
    // 1. 验证参数（channelId 必填，时间范围 <= 90天，type 可选）
    // 2. 调用 API: GET /live/v4/channel/statistics/geo-summary-mc
    // 3. 返回响应
  }

  /**
   * 获取终端分布数据
   */
  async getDeviceDistribution(
    params: GetDeviceDistributionParams
  ): Promise<GetDeviceDistributionResponse> {
    // 1. 验证参数（channelId 必填，时间范围 <= 90天）
    // 2. 调用 API: GET /live/v4/channel/statistics/browser-summary
    // 3. 返回响应
  }
}
```

#### 2. CLI Handler 模式（扩展现有 StatisticsHandler）

```typescript
// packages/cli/src/handlers/statistics.handler.ts
export class StatisticsHandler extends BaseHandler {
  // 现有方法: viewStatistics, viewConcurrency, viewMaxConcurrent

  /**
   * 查看地域分布
   */
  async viewRegionDistribution(options: StatisticsAudienceRegionOptions): Promise<void> {
    // 1. 调用 SDK: statisticsService.getRegionDistribution(params)
    // 2. 格式化输出（table/json）
  }

  /**
   * 查看终端分布
   */
  async viewDeviceDistribution(options: StatisticsAudienceDeviceOptions): Promise<void> {
    // 1. 调用 SDK: statisticsService.getDeviceDistribution(params)
    // 2. 格式化输出（table/json）
  }
}
```

#### 3. 时间验证规则

**地域分布和终端分布**:
- 时间格式：13位毫秒级时间戳
- 范围：startTime 到 endTime 不超过 90 天

#### 4. 类型参数验证（地域分布）

- type 参数可选值：`country`（国家）、`province`（省份，默认）、`city`（城市）
- 默认值为 `province`

#### 5. 认证模式

```typescript
// 使用 authAdapter 获取认证（与 story 10-1, 10-2 相同模式）
const authResult = authAdapter.tryGetAuthConfig(parentOptions);
if (!authResult) {
  throw new Error(authAdapter.getStatusMessage(parentOptions));
}
```

### V4 API 注意事项

这些 API 是 **V4 版本**，与之前的 V3 API 有以下差异：

1. **API 路径**: `/live/v4/channel/statistics/...` (而非 `/live/v3/...`)
2. **认证方式**: 同样使用 appId、timestamp、sign 参数
3. **时间参数**: 使用 `startTime`/`endTime`（时间戳格式），而非 `startDay`/`endDay`（日期格式）
4. **响应格式**: 包含 `requestId`、`success` 字段

### 相关 API 文档

| 文档 | 路径 |
|------|------|
| 地域分布统计 | `docs/api/v4/channel/statistics/geo_summary_mc.md` |
| 终端分布统计 | `docs/api/v4/channel/statistics/browsers_summary.md` |
| 每日观看统计 | `docs/api/channel/viewdata/daily_summary.md` (已实现) |
| 历史并发数据 | `docs/api/channel/viewdata/concurrency.md` (已实现) |
| 历史最高并发 | `docs/api/channel/viewdata/get_max_history_concurrent.md` (已实现) |

### 已有代码参考

- **SDK Service**: `packages/sdk/src/services/statistics.service.ts` (已有 getDailyViewStatistics, getConcurrencyData, getMaxConcurrent)
- **SDK 类型**: `packages/sdk/src/types/statistics.ts` (已有统计类型)
- **CLI Commands**: `packages/cli/src/commands/statistics.commands.ts` (已有 view, concurrency, max-concurrent 命令)
- **CLI Handler**: `packages/cli/src/handlers/statistics.handler.ts` (已有处理方法)
- **CLI Service SDK**: `packages/cli/src/services/statistics.service.sdk.ts`

### Story 10-1, 10-2 学习要点

1. **SDK 服务包装模式**: CLI 使用 `StatisticsServiceSdk` 包装 SDK 服务，而非直接使用 `PolyVClient`
2. **类型转换**: SDK 类型与 CLI 类型分开定义，Handler 负责转换
3. **时间戳验证**: 使用 `utils/date-validation.ts` 中的 `validateTimestampRange` 函数
4. **认证优先级**: 使用 `authAdapter` 处理多源认证
5. **90天验证**: 需要添加新的验证函数 `validateTimestampRange90Days`

### 测试要点

1. **SDK 测试**:
   - Mock `httpClient.get()` 返回
   - 验证参数传递正确
   - 验证时间范围校验（90天）
   - 验证 type 参数校验（country/province/city）

2. **CLI 测试**:
   - 命令注册正确
   - 参数验证（必需参数缺失时报错）
   - 输出格式化正确
   - 时间戳格式验证

3. **覆盖率要求**:
   - Functions: >= 80%
   - Lines: >= 80%
   - Statements: >= 80%
   - Branches: >= 70%

### References

- [Source: docs/api/v4/channel/statistics/geo_summary_mc.md]
- [Source: docs/api/v4/channel/statistics/browsers_summary.md]
- [Source: _bmad-output/project-context.md#SDK开发规则]
- [Source: _bmad-output/project-context.md#CLI开发规则]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic10]
- [Source: _bmad-output/implementation-artifacts/10-1-statistics-view.md]
- [Source: _bmad-output/implementation-artifacts/10-2-statistics-concurrency.md]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
