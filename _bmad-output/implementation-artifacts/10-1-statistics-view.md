# Story 10.1: 观看数据统计命令

Status: ready-for-dev

## Story

作为运营人员，
我希望通过 CLI 获取频道观看数据统计，
以便分析直播效果和观众行为。

## Acceptance Criteria

1. **AC1**: `statistics view` 命令返回观看人数、播放时长、UV等关键指标
2. **AC2**: 支持通过 `--start-day` 和 `--end-day` 参数按日期范围过滤（时间跨度不超过60天）
3. **AC3**: 表格输出格式清晰，显示日期、PC/移动端数据
4. **AC4**: JSON 输出完整包含所有字段
5. **AC5**: 支持 `--channel-id` 参数指定频道（必需）

## Tasks / Subtasks

- [ ] **Task 1: SDK 类型定义** (AC: 1,2,3,4,5)
  - [ ] 1.1 在 `packages/sdk/src/types/statistics.ts` 创建类型定义
  - [ ] 1.2 定义 `DailyViewStatistics` 接口（响应实体）
  - [ ] 1.3 定义 `GetDailyViewStatisticsParams` 接口（请求参数）
  - [ ] 1.4 定义 `GetDailyViewStatisticsResponse` 接口（响应包装）
  - [ ] 1.5 在 `types/index.ts` 导出新类型

- [ ] **Task 2: SDK Service 实现** (AC: 1,2)
  - [ ] 2.1 创建 `packages/sdk/src/services/statistics.service.ts`
  - [ ] 2.2 实现 `StatisticsService` 类
  - [ ] 2.3 实现 `getDailyViewStatistics(params)` 方法
  - [ ] 2.4 调用 V3 API: `GET /live/v3/channel/statistics/daily/summary`
  - [ ] 2.5 在 `PolyVClient` 中注册 `statistics` 属性
  - [ ] 2.6 在 `client.ts` 中导入并实例化服务

- [ ] **Task 3: CLI 类型定义** (AC: 1,2,3,4,5)
  - [ ] 3.1 在 `packages/cli/src/types/statistics.ts` 创建 CLI 选项类型
  - [ ] 3.2 定义 `StatisticsViewOptions` 接口

- [ ] **Task 4: CLI Handler 实现** (AC: 1,2,3,4)
  - [ ] 4.1 创建 `packages/cli/src/handlers/statistics.handler.ts`
  - [ ] 4.2 实现 `StatisticsHandler` 类
  - [ ] 4.3 实现 `viewStatistics(options)` 方法
  - [ ] 4.4 实现表格格式化输出（显示日期、PC/移动端PV、UV、播放时长）
  - [ ] 4.5 实现 JSON 格式化输出

- [ ] **Task 5: CLI Commands 注册** (AC: 1,2,5)
  - [ ] 5.1 创建 `packages/cli/src/commands/statistics.commands.ts`
  - [ ] 5.2 注册 `statistics` 命令组
  - [ ] 5.3 注册 `statistics view` 子命令
  - [ ] 5.4 定义必需参数：`--channel-id`
  - [ ] 5.5 定义日期参数：`--start-day`, `--end-day`
  - [ ] 5.6 定义可选参数：`--output`
  - [ ] 5.7 在 `src/index.ts` 中注册命令

- [ ] **Task 6: 单元测试** (AC: 全部)
  - [ ] 6.1 SDK Service 单元测试 (Vitest)
  - [ ] 6.2 CLI Handler 单元测试 (Jest)
  - [ ] 6.3 CLI Commands 单元测试 (Jest)
  - [ ] 6.4 确保覆盖率 ≥ 80%

## Dev Notes

### API 规范

**主 API**: `GET /live/v3/channel/statistics/daily/summary`

```
URL: http://api.polyv.net/live/v3/channel/statistics/daily/summary
Method: GET
```

**请求参数**:

| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳，3分钟内有效 |
| sign | true | String | 签名，32位大写MD5 |
| channelId | true | String | 频道号 |
| startDay | true | String | 开始日期，格式：yyyy-MM-dd |
| endDay | true | String | 结束日期，格式：yyyy-MM-dd |

**约束**: 开始日期和结束日期的时间跨度**不能超过60天**

**响应字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| currentDay | String | 查询日期，格式：yyyy-MM-dd |
| channelId | String | 频道号 |
| userId | String | 直播账号ID |
| pcPlayDuration | Integer | PC端播放时长，单位：分钟 |
| pcVideoView | Integer | PC端总播放量（PV） |
| pcUniqueViewer | Integer | PC端唯一观众数（UV） |
| mobilePlayDuration | Integer | 移动端播放时长，单位：分钟 |
| mobileVideoView | Integer | 移动端总播放量（PV） |
| mobileUniqueViewer | Integer | 移动端唯一观众数（UV） |
| createdTime | Long | 记录添加时间（13位时间戳） |
| lastModified | Long | 记录修改时间（13位时间戳） |

**成功响应示例**:
```json
{
  "status": "success",
  "result": [
    {
      "currentDay": "2020-10-20",
      "channelId": 1965681,
      "userId": "1b448be323",
      "pcPlayDuration": 7,
      "pcVideoView": 7,
      "pcUniqueViewer": 1,
      "mobilePlayDuration": 0,
      "mobileVideoView": 0,
      "mobileUniqueViewer": 0,
      "createdTime": 1603218100000,
      "lastModified": 1603218100000
    }
  ]
}
```

### 项目结构笔记

**SDK 文件**:
- 类型: `packages/sdk/src/types/statistics.ts` (新建)
- 服务: `packages/sdk/src/services/statistics.service.ts` (新建)
- 测试: `packages/sdk/src/services/statistics.service.test.ts` (新建)

**CLI 文件**:
- 类型: `packages/cli/src/types/statistics.ts` (新建)
- Handler: `packages/cli/src/handlers/statistics.handler.ts` (新建)
- Commands: `packages/cli/src/commands/statistics.commands.ts` (新建)
- 测试: `packages/cli/tests/commands/statistics.commands.test.ts` (新建)
- 测试: `packages/cli/tests/handlers/statistics.handler.test.ts` (新建)

### 命令设计

```bash
# 基本用法
polyv-live-cli statistics view -c "3151318" --start-day "2024-01-01" --end-day "2024-01-31"

# JSON 输出
polyv-live-cli statistics view -c "3151318" --start-day "2024-01-01" --end-day "2024-01-31" -o json

# 完整参数名
polyv-live-cli statistics view --channel-id "3151318" --start-day "2024-01-01" --end-day "2024-01-31" --output table
```

### 表格输出设计

```
┌────────────┬────────┬────────┬────────┬────────┬──────────────┬────────────────┐
│ 日期       │ PC PV  │ PC UV  │ 移动PV │ 移动UV │ PC播放(分钟) │ 移动播放(分钟) │
├────────────┼────────┼────────┼────────┼────────┼──────────────┼────────────────┤
│ 2024-01-01 │ 100    │ 50     │ 80     │ 40     │ 500          │ 400            │
│ 2024-01-02 │ 120    │ 60     │ 90     │ 45     │ 600          │ 450            │
└────────────┴────────┴────────┴────────┴────────┴──────────────┴────────────────┘
```

### 关键实现规则

#### 1. SDK 服务模式（参考 V4StatisticsService）

```typescript
// packages/sdk/src/services/statistics.service.ts
export class StatisticsService {
  constructor(private client: PolyVClient) {}

  async getDailyViewStatistics(
    params: GetDailyViewStatisticsParams
  ): Promise<GetDailyViewStatisticsResponse> {
    // 1. 验证参数（channelId 必填，日期范围 ≤ 60天）
    // 2. 调用 API: GET /live/v3/channel/statistics/daily/summary
    // 3. 返回响应
  }
}
```

#### 2. CLI Handler 模式（参考 ProductHandler）

```typescript
// packages/cli/src/handlers/statistics.handler.ts
export class StatisticsHandler {
  constructor(
    private authConfig: AuthConfig,
    private serviceConfig: StatisticsServiceConfig
  ) {}

  async viewStatistics(options: StatisticsViewOptions): Promise<void> {
    // 1. 创建 PolyVClient
    // 2. 调用 SDK: client.statistics.getDailyViewStatistics(params)
    // 3. 格式化输出（table/json）
  }
}
```

#### 3. 日期验证规则

- 格式：`yyyy-MM-dd`
- 范围：startDay 到 endDay 不超过 60 天
- 建议提供默认值：endDay 默认今天，startDay 默认 7 天前

#### 4. 认证模式

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
| 每日观看统计 | `docs/api/channel/viewdata/daily_summary.md` |
| 历史并发数据 | `docs/api/channel/viewdata/concurrency.md` |
| V2 Summary | `docs/api/channel/viewdata/summary.md` |

### 已有代码参考

- **SDK Service 模式**: `packages/sdk/src/services/v4/statistics.service.ts`
- **SDK 类型定义**: `packages/sdk/src/types/v4-statistics.ts`
- **CLI Commands 模式**: `packages/cli/src/commands/product.commands.ts`
- **CLI Handler 模式**: `packages/cli/src/handlers/product.handler.ts`

### 测试要点

1. **SDK 测试**:
   - Mock `httpClient.get()` 返回
   - 验证参数传递正确
   - 验证日期范围校验

2. **CLI 测试**:
   - 命令注册正确
   - 参数验证（必需参数缺失时报错）
   - 输出格式化正确

3. **覆盖率要求**:
   - Functions: ≥ 80%
   - Lines: ≥ 80%
   - Statements: ≥ 80%
   - Branches: ≥ 70%

### References

- [Source: docs/api/channel/viewdata/daily_summary.md]
- [Source: _bmad-output/project-context.md#SDK开发规则]
- [Source: _bmad-output/project-context.md#CLI开发规则]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic10]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
