# Story 8.1: CLI 优惠券命令

Status: done

## Story

As a user (developer or operations staff),
I want to manage coupons through the CLI (create, list, delete),
so that I can configure e-commerce live streaming scenarios efficiently.

## Acceptance Criteria

1. `coupon add` 支持创建满减券（MAX_OUT）和折扣券（DISCOUNT）
2. `coupon list` 支持分页和状态过滤（NOT_START, GOING, FINISHED, INVALID）
3. `coupon delete` 支持批量删除（最多200个）
4. 所有命令支持 `--output table|json` 输出格式
5. 参数验证完善，错误消息用户友好

## Tasks / Subtasks

- [x] Task 1: 创建 CLI 命令文件 `coupon.commands.ts` (AC: #1-#5)
  - [x] 1.1 创建 `packages/cli/src/commands/coupon.commands.ts`
  - [x] 1.2 实现 `coupon add` 命令（创建优惠券）
  - [x] 1.3 实现 `coupon list` 命令（查询优惠券列表）
  - [x] 1.4 实现 `coupon delete` 命令（批量删除优惠券）
  - [x] 1.5 注册命令到 CLI 入口

- [x] Task 2: 创建 Handler 文件 `coupon.handler.ts` (AC: #1-#5)
  - [x] 2.1 创建 `packages/cli/src/handlers/coupon.handler.ts`
  - [x] 2.2 实现 `addCoupon` 方法
  - [x] 2.3 实现 `listCoupons` 方法
  - [x] 2.4 实现 `deleteCoupons` 方法
  - [x] 2.5 实现表格和 JSON 输出格式化

- [x] Task 3: 创建单元测试 (AC: #1-#5)
  - [x] 3.1 创建 `packages/cli/src/commands/coupon.commands.test.ts`
  - [x] 3.2 创建 `packages/cli/src/handlers/coupon.handler.test.ts`
  - [x] 3.3 确保测试覆盖率达到 80%

## Dev Notes

### SDK 服务已就绪

SDK 的 `V4PlatformService` 已实现所有优惠券 API，无需修改 SDK：

| 方法 | API 路径 | 说明 |
|------|----------|------|
| `createCoupon(params)` | POST `/live/v4/user/coupon/create` | 创建优惠券，返回 couponId |
| `searchCoupons(params)` | GET `/live/v4/user/coupon/search` | 查询优惠券列表 |
| `deleteCouponsBatch(params)` | POST `/live/v4/user/coupon/delete-batch` | 批量删除（最多200个） |

### SDK 类型已导出

从 `polyv-live-api-sdk` 导入类型：
```typescript
import type {
  Coupon,
  CreateCouponParams,
  SearchCouponsParams,
  SearchCouponsResponse,
  DeleteCouponsBatchParams,
  CouponRule,
  UnconditionalRule,
  FullReduceRule,
} from 'polyv-live-api-sdk';
```

### 关键类型说明

**CreateCouponParams 必填字段：**
- `name`: 优惠券名称（最多50字符）
- `receiveStartTime`: 领券开始时间（13位毫秒时间戳）
- `receiveEndTime`: 领券结束时间
- `useTimeType`: `'RANGE'` | `'DAY'`
- `type`: `'MAX_OUT'`（满减券）| `'DISCOUNT'`（折扣券）
- `availableAmount`: 发放数量（>=0）
- `rule`: CouponRule 对象

**useTimeType 条件字段：**
- 当 `useTimeType='RANGE'` 时，需要 `useStartTime` 和 `useEndTime`
- 当 `useTimeType='DAY'` 时，需要 `dayOfUse`

**CouponRule 结构：**
```typescript
interface CouponRule {
  condition: 'UNCONDITIONAL' | 'FULL_REDUCE';
  unconditional?: UnconditionalRule; // condition=UNCONDITIONAL 时必填
  fullReduce?: FullReduceRule;       // condition=FULL_REDUCE 时必填
  limitPerPerson: number; // -1 表示不限制
}
```

**Coupon 状态枚举：**
- `NOT_START`: 未开始
- `GOING`: 进行中
- `FINISHED`: 已结束
- `INVALID`: 已失效

### 命令设计参考

参考 `packages/cli/src/commands/product.commands.ts` 的模式：

```typescript
// coupon add 命令
polyv-cli coupon add --name "满100减20" --type MAX_OUT --availableAmount 100 \
  --receiveStart <timestamp> --receiveEnd <timestamp> \
  --useTimeType RANGE --useStart <timestamp> --useEnd <timestamp> \
  --condition FULL_REDUCE --full 100 --reduce 20 --unit MONEY \
  --limitPerPerson 1

// coupon list 命令
polyv-cli coupon list [--page 1] [--size 10] [--status GOING] [--output table]

// coupon delete 命令
polyv-cli coupon delete --couponIds <id1,id2,...>
```

### CLI 认证模式

**必须使用 authAdapter 获取认证：**
```typescript
import { authAdapter } from '../config/auth-adapter';

const authResult = authAdapter.tryGetAuthConfig(parentOptions);
if (!authResult) {
  throw new Error(authAdapter.getStatusMessage(parentOptions));
}
const { appId, appSecret, userId } = authResult.config;
```

### 输出格式化

**支持 table 和 json 两种格式：**
```typescript
if (options.output === 'json') {
  console.log(JSON.stringify(data, null, 2));
} else {
  Formatter.printTable(data, columns);
}
```

### 文件位置

| 文件类型 | 位置 |
|----------|------|
| 命令定义 | `packages/cli/src/commands/coupon.commands.ts` |
| Handler | `packages/cli/src/handlers/coupon.handler.ts` |
| 命令测试 | `packages/cli/tests/commands/coupon.commands.test.ts` |
| Handler 测试 | `packages/cli/tests/handlers/coupon.handler.test.ts` |

### API 文档参考

| 功能 | API 文档 |
|------|----------|
| 创建优惠券 | `docs/api/v4/platform/user_coupon_create.md` |
| 查询优惠券 | `docs/api/v4/platform/user_coupon_search.md` |
| 批量删除 | `docs/api/v4/platform/user_coupon_delete_batch.md` |

### Project Structure Notes

- 遵循 monorepo 结构：CLI 在 `packages/cli/`
- 使用 `workspace:*` 依赖 SDK
- CLI 使用 CommonJS 模块（不加 `.js` 后缀）
- 测试文件放在 `tests/` 目录

### 常见陷阱

| 陷阱 | 解决方案 |
|------|---------|
| 时间戳格式 | 使用 13 位毫秒时间戳 `Date.now()` |
| 时间戳过期 | PolyV API 时间戳有效期 3 分钟 |
| 分页参数 | pageNumber 从 1 开始，pageSize 最大 1000 |
| 批量删除限制 | 最多 200 个 couponId |
| CLI 模块系统 | 不加 `.js` 后缀（与 SDK 不同） |

### 测试要求

- 单元测试覆盖率 >= 80%
- 测试命令：`pnpm --filter polyv-live-cli test:unit`
- Mock SDK 调用，不进行真实 API 调用

### 完成后自动化

根据 `CLAUDE.local.md` 规则：
1. 运行单元测试：`pnpm test:unit`
2. 确保覆盖率 >= 80%
3. 所有测试通过后自动提交代码

### References

- [Source: docs/api/v4/platform/user_coupon_create.md]
- [Source: docs/api/v4/platform/user_coupon_search.md]
- [Source: docs/api/v4/platform/user_coupon_delete_batch.md]
- [Source: packages/sdk/src/services/v4/platform.service.ts]
- [Source: packages/sdk/src/types/v4-platform.ts]
- [Source: packages/cli/src/commands/product.commands.ts]
- [Source: _bmad-output/project-context.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (GLM-5)

### Debug Log References

无

### Completion Notes List

- ✅ Task 1 完成：创建了 `coupon.commands.ts`，实现了 `coupon add/list/delete` 三个命令
- ✅ Task 2 完成：创建了 `coupon.handler.ts`，实现了完整的业务逻辑和输出格式化
- ✅ Task 3 完成：创建了测试文件，覆盖率达到 83.45%（statements），超过 80% 目标
- ✅ AC1: `coupon add` 支持 MAX_OUT 和 DISCOUNT 两种类型
- ✅ AC2: `coupon list` 支持分页和四种状态过滤
- ✅ AC3: `coupon delete` 支持批量删除，限制最多 200 个
- ✅ AC4: 所有命令支持 `--output table|json`
- ✅ AC5: 完整的参数验证和用户友好的错误消息

### File List

- packages/cli/src/commands/coupon.commands.ts (新建)
- packages/cli/src/handlers/coupon.handler.ts (新建)
- packages/cli/src/commands/coupon.commands.test.ts (新建)
- packages/cli/src/handlers/coupon.handler.test.ts (新建)
- packages/cli/src/index.ts (修改，注册命令)

### Change Log

- 2026-03-20: 完成故事 8.1 实现，所有测试通过，覆盖率 83.45%
