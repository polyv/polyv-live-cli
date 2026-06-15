# Story 10.2: 并发数据命令

Status: done

## Story

作为运营人员，
我希望通过 CLI 获取频道历史并发数据，
以便分析直播期间的观众并发情况和峰值。

## Acceptance Criteria

1. **AC1**: `statistics concurrency` 命令返回历史并发数据列表（日期、时间点、并发人数）
2. **AC2**: 支持通过 `--start-date` 和 `--end-date` 参数按日期范围过滤（时间跨度不超过60天）
3. **AC3**: `statistics max-concurrent` 命令返回历史最高并发人数
4. **AC4**: 支持通过 `--start-time` 和 `--end-time` 参数（时间戳格式）查询最高并发（时间跨度不超过3个月）
5. **AC5**: 表格输出格式清晰，显示日期、时间、并发人数
6. **AC6**: JSON 输出完整包含所有字段
7. **AC7**: 支持 `--channel-id` 参数指定频道（必需）

## Tasks / Subtasks

- [ ] **Task 1: SDK 类型定义扩展** (AC: 1,2,3,4,5,6,7)
  - [ ] 1.1 在 `packages/sdk/src/types/statistics.ts` 添加类型定义
  - [ ] 1.2 定义 `ConcurrencyDataPoint` 接口（单个并发数据点）
  - [ ] 1.3 定义 `GetConcurrencyDataParams` 接口（请求参数：channelId, startDate, endDate）
  - [ ] 1.4 定义 `GetConcurrencyDataResponse` 接口（响应包装）
  - [ ] 1.5 定义 `GetMaxConcurrentParams` 接口（请求参数：channelId, startTime, endTime）
  - [ ] 1.6 定义 `GetMaxConcurrentResponse` 接口（响应为 number）
  - [ ] 1.7 在 `types/index.ts` 导出新类型

- [ ] **Task 2: SDK Service 扩展** (AC: 1,2,3,4)
  - [ ] 2.1 在 `packages/sdk/src/services/statistics.service.ts` 添加新方法
  - [ ] 2.2 实现 `getConcurrencyData(params)` 方法调用 `/live/v3/channel/statistics/concurrence`
  - [ ] 2.3 实现 `getMaxConcurrent(params)` 方法调用 `/live/v3/channel/statistics/get-max-history-concurrent`
  - [ ] 2.4 添加日期范围验证（并发数据：60天，最高并发：3个月）

- [ ] **Task 3: CLI 类型定义扩展** (AC: 1,2,3,4,5,6,7)
  - [ ] 3.1 在 `packages/cli/src/types/statistics.ts` 添加 CLI 选项类型
  - [ ] 3.2 定义 `StatisticsConcurrencyOptions` 接口
  - [ ] 3.3 定义 `StatisticsMaxConcurrentOptions` 接口
  - [ ] 3.4 定义 `ConcurrencyDataPointItem` 接口（用于 CLI 显示）

- [ ] **Task 4: CLI Service SDK 扩展** (AC: 1,2,3,4)
  - [ ] 4.1 在 `packages/cli/src/services/statistics.service.sdk.ts` 添加新方法
  - [ ] 4.2 实现 `getConcurrencyData(options)` 方法
  - [ ] 4.3 实现 `getMaxConcurrent(options)` 方法

- [ ] **Task 5: CLI Handler 扩展** (AC: 1,2,3,4,5,6)
  - [ ] 5.1 在 `packages/cli/src/handlers/statistics.handler.ts` 添加新方法
  - [ ] 5.2 实现 `viewConcurrency(options)` 方法
  - [ ] 5.3 实现 `viewMaxConcurrent(options)` 方法
  - [ ] 5.4 实现并发数据表格格式化输出
  - [ ] 5.5 实现 JSON 格式化输出

- [ ] **Task 6: CLI Commands 扩展** (AC: 1,2,3,4,7)
  - [ ] 6.1 在 `packages/cli/src/commands/statistics.commands.ts` 注册新命令
  - [ ] 6.2 注册 `statistics concurrency` 子命令
  - [ ] 6.3 注册 `statistics max-concurrent` 子命令
  - [ ] 6.4 定义必需参数：`--channel-id`
  - [ ] 6.5 定义日期参数：`--start-date`, `--end-date` (concurrency)
  - [ ] 6.6 定义时间戳参数：`--start-time`, `--end-time` (max-concurrent)
  - [ ] 6.7 定义可选参数：`--output`

- [ ] **Task 7: 单元测试** (AC: 全部)
  - [ ] 7.1 SDK Service 单元测试 (Vitest) - 新增方法
  - [ ] 7.2 CLI Handler 单元测试 (Jest) - 新增方法
  - [ ] 7.3 CLI Commands 单元测试 (Jest) - 新增命令
  - [ ] 7.4 确保覆盖率 ≥ 80%

## Dev Notes

### API 规范

#### API 1: 历史并发数据

**URL**: `GET /live/v3/channel/statistics/concurrence`

```
URL: http://api.polyv.net/live/v3/channel/statistics/concurrence
Method: GET
```

**请求参数**:

| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳，3分钟内有效 |
| sign | true | String | 签名，32位大写MD5 |
| channelId | true | String | 频道号 |
| startDate | true | String | 开始日期，格式：yyyy-MM-dd |
| endDate | true | String | 结束日期，格式：yyyy-MM-dd |

**约束**: 开始日期和结束日期的时间跨度**不能超过60天**（两个月）

**响应字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 响应状态码 |
| status | String | 响应状态文本 |
| message | String | 响应描述信息 |
| data | Array | 并发数据数组 |

**Data 数组元素**:

| 字段 | 类型 | 说明 |
|------|------|------|
| day | String | 并发日期，格式：yyyy-MM-dd |
| minute | String | 并发时间点，格式：HH:mm |
| viewers | Integer | 并发人数 |

**成功响应示例**:
```json
{
  "code": 200,
  "status": "success",
  "message": "",
  "data": [
    {
      "day": "2021-03-09",
      "minute": "00:00",
      "viewers": 0
    },
    {
      "day": "2021-03-10",
      "minute": "00:00",
      "viewers": 0
    }
  ]
}
```

#### API 2: 历史最高并发

**URL**: `GET /live/v3/channel/statistics/get-max-history-concurrent`

```
URL: http://api.polyv.net/live/v3/channel/statistics/get-max-history-concurrent
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

**约束**: 时间跨度**不能超过3个月**

**响应字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 响应状态码 |
| status | String | 成功为success，失败为error |
| message | String | 响应描述信息 |
| data | Integer | 日期区间内最大的历史并发人数 |

**成功响应示例**:
```json
{
  "code": 200,
  "status": "success",
  "message": "",
  "data": 1
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
# 历史并发数据
polyv-live-cli statistics concurrency -c "3151318" --start-date "2024-01-01" --end-date "2024-01-31"

# JSON 输出
polyv-live-cli statistics concurrency -c "3151318" --start-date "2024-01-01" --end-date "2024-01-31" -o json

# 历史最高并发（时间戳格式）
polyv-live-cli statistics max-concurrent -c "3151318" --start-time 1704067200000 --end-time 1735689600000

# JSON 输出
polyv-live-cli statistics max-concurrent -c "3151318" --start-time 1704067200000 --end-time 1735689600000 -o json
```

### 表格输出设计

#### 并发数据表格

```
┌────────────┬────────┬──────────┐
│ 日期       │ 时间   │ 并发人数 │
├────────────┼────────┼──────────┤
│ 2024-01-01 │ 10:30  │ 150      │
│ 2024-01-01 │ 10:31  │ 165      │
│ 2024-01-01 │ 10:32  │ 180      │
└────────────┴────────┴──────────┘
```

#### 最高并发输出

```
历史最高并发人数: 180
时间范围: 2024-01-01 00:00:00 - 2024-03-31 23:59:59
```

### 关键实现规则

#### 1. SDK 服务模式（扩展现有 StatisticsService）

```typescript
// packages/sdk/src/services/statistics.service.ts
export class StatisticsService {
  // 现有方法: getDailyViewStatistics

  /**
   * 获取历史并发数据
   */
  async getConcurrencyData(
    params: GetConcurrencyDataParams
  ): Promise<GetConcurrencyDataResponse> {
    // 1. 验证参数（channelId 必填，日期范围 ≤ 60天）
    // 2. 调用 API: GET /live/v3/channel/statistics/concurrence
    // 3. 返回响应
  }

  /**
   * 获取历史最高并发
   */
  async getMaxConcurrent(
    params: GetMaxConcurrentParams
  ): Promise<GetMaxConcurrentResponse> {
    // 1. 验证参数（channelId 必填，时间范围 ≤ 3个月）
    // 2. 调用 API: GET /live/v3/channel/statistics/get-max-history-concurrent
    // 3. 返回响应
  }
}
```

#### 2. CLI Handler 模式（扩展现有 StatisticsHandler）

```typescript
// packages/cli/src/handlers/statistics.handler.ts
export class StatisticsHandler extends BaseHandler {
  // 现有方法: viewStatistics

  /**
   * 查看历史并发数据
   */
  async viewConcurrency(options: StatisticsConcurrencyOptions): Promise<void> {
    // 1. 调用 SDK: statisticsService.getConcurrencyData(params)
    // 2. 格式化输出（table/json）
  }

  /**
   * 查看历史最高并发
   */
  async viewMaxConcurrent(options: StatisticsMaxConcurrentOptions): Promise<void> {
    // 1. 调用 SDK: statisticsService.getMaxConcurrent(params)
    // 2. 格式化输出（table/json）
  }
}
```

#### 3. 日期/时间验证规则

**并发数据（concurrency）**:
- 日期格式：`yyyy-MM-dd`
- 范围：startDate 到 endDate 不超过 60 天

**最高并发（max-concurrent）**:
- 时间格式：13位毫秒级时间戳
- 范围：startTime 到 endTime 不超过 3 个月

#### 4. 认证模式

```typescript
// 使用 authAdapter 获取认证（与 story 10-1 相同模式）
const authResult = authAdapter.tryGetAuthConfig(parentOptions);
if (!authResult) {
  throw new Error(authAdapter.getStatusMessage(parentOptions));
}
```

### 相关 API 文档

| 文档 | 路径 |
|------|------|
| 历史并发数据 | `docs/api/channel/viewdata/concurrency.md` |
| 历史最高并发 | `docs/api/channel/viewdata/get_max_history_concurrent.md` |
| 每日观看统计 | `docs/api/channel/viewdata/daily_summary.md` (已实现) |

### 已有代码参考

- **SDK Service**: `packages/sdk/src/services/statistics.service.ts` (已有 getDailyViewStatistics)
- **SDK 类型**: `packages/sdk/src/types/statistics.ts` (已有 DailyViewStatistics 类型)
- **CLI Commands**: `packages/cli/src/commands/statistics.commands.ts` (已有 view 命令)
- **CLI Handler**: `packages/cli/src/handlers/statistics.handler.ts` (已有 viewStatistics 方法)
- **CLI Service SDK**: `packages/cli/src/services/statistics.service.sdk.ts`

### Story 10-1 学习要点

1. **SDK 服务包装模式**: CLI 使用 `StatisticsServiceSdk` 包装 SDK 服务，而非直接使用 `PolyVClient`
2. **类型转换**: SDK 类型与 CLI 类型分开定义，Handler 负责转换
3. **日期验证**: 使用 `utils/date-validation.ts` 中的共享验证函数
4. **认证优先级**: 使用 `authAdapter` 处理多源认证

### 测试要点

1. **SDK 测试**:
   - Mock `httpClient.get()` 返回
   - 验证参数传递正确
   - 验证日期范围校验（60天和3个月）

2. **CLI 测试**:
   - 命令注册正确
   - 参数验证（必需参数缺失时报错）
   - 输出格式化正确
   - 时间戳格式验证

3. **覆盖率要求**:
   - Functions: ≥ 80%
   - Lines: ≥ 80%
   - Statements: ≥ 80%
   - Branches: ≥ 70%

### References

- [Source: docs/api/channel/viewdata/concurrency.md]
- [Source: docs/api/channel/viewdata/get_max_history_concurrent.md]
- [Source: _bmad-output/project-context.md#SDK开发规则]
- [Source: _bmad-output/project-context.md#CLI开发规则]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic10]
- [Source: _bmad-output/implementation-artifacts/10-1-statistics-view.md]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
