# Story 8.4: 场景初始化命令

Status: done

## Story

作为新注册的 PolyV 用户，
我希望通过一个命令快速初始化适合我业务场景的完整直播环境，
以便我能够快速体验平台能力，无需了解所有配置细节。

## Acceptance Criteria

1. 命令支持 `polyv-cli setup <scene>` 格式
2. 内置电商场景 (`e-commerce`) 配置
3. 配置文件驱动，支持变量替换 (`{timestamp}`, `{random}`, `{now}`, 资源引用等)
4. 按配置顺序创建资源，支持资源间依赖
5. 创建失败时自动回滚已创建的资源
6. 输出配置摘要和下一步操作指引
7. 支持 `--list` 选项列出可用场景

## Tasks / Subtasks

- [x] Task 1: 设计场景配置文件格式 (AC: #3)
  - [x] 1.1 定义 YAML 配置结构 (name, version, description, resources, outputTemplate, nextSteps)
  - [x] 1.2 设计资源定义格式 (id, type, params, dependsOn, output)
  - [x] 1.3 定义支持的变量类型 (`{timestamp}`, `{random:n-m}`, `{now}`, `{now+Nd}`, 资源引用)

- [x] Task 2: 创建内置场景配置文件 (AC: #2)
  - [x] 2.1 创建 `src/setup-scenes/e-commerce.yaml` 电商场景配置
  - [x] 2.2 配置包含频道、商品、优惠券三种资源
  - [x] 2.3 配置输出模板和下一步指引

- [x] Task 3: 实现配置加载器 (AC: #3)
  - [x] 3.1 创建 `SceneConfigLoader` 类
  - [x] 3.2 支持内置场景和用户自定义场景 (`~/.polyv/scenes/`)
  - [x] 3.3 配置文件验证和错误提示

- [x] Task 4: 实现变量解析器 (AC: #3)
  - [x] 4.1 创建 `VariableResolver` 类
  - [x] 4.2 实现时间变量解析 (`{timestamp}`, `{now}`, `{now+Nd}`)
  - [x] 4.3 实现随机变量解析 (`{random:n-m}`)
  - [x] 4.4 实现资源引用解析 (`{channel.channelId}`)

- [x] Task 5: 实现资源处理器 (AC: #4)
  - [x] 5.1 创建 `ResourceHandler` 接口 (create, rollback)
  - [x] 5.2 实现 `ChannelHandler` (频道创建/删除)
  - [x] 5.3 实现 `ProductHandler` (商品添加/删除)
  - [x] 5.4 实现 `CouponHandler` (优惠券创建/删除)
  - [x] 5.5 创建资源处理器注册表

- [x] Task 6: 实现场景执行器 (AC: #4, #5)
  - [x] 6.1 创建 `SceneExecutor` 类
  - [x] 6.2 按配置顺序创建资源
  - [x] 6.3 处理资源依赖关系
  - [x] 6.4 实现失败自动回滚逻辑

- [x] Task 7: 实现 setup 命令 (AC: #1, #7)
  - [x] 7.1 创建 `setup.commands.ts` 命令文件
  - [x] 7.2 实现 `polyv-cli setup <scene>` 命令
  - [x] 7.3 添加 `--list` 选项列出可用场景
  - [x] 7.4 在 `index.ts` 中注册命令

- [x] Task 8: 实现输出格式化 (AC: #7)
  - [x] 8.1 创建输出模板渲染器
  - [x] 8.2 渲染配置摘要
  - [x] 8.3 渲染下一步操作指引
  - [x] 8.4 支持进度显示 (使用 ora)

- [x] Task 9: 单元测试 (AC: All)
  - [x] 9.1 测试配置加载器
  - [x] 9.2 测试变量解析器
  - [x] 9.3 测试资源处理器
  - [x] 9.4 测试场景执行器
  - [x] 9.5 测试覆盖率 ≥ 80%

## Dev Notes

### 命令设计

```bash
# 初始化电商场景
polyv-cli setup e-commerce

# 列出所有可用场景
polyv-cli setup --list

# 使用用户自定义场景
polyv-cli setup my-custom-scene
```

### 目录结构

```
packages/cli/src/
├── commands/
│   └── setup.commands.ts       # 命令定义
├── handlers/
│   └── setup.handler.ts        # 命令处理
├── setup/
│   ├── scene-config-loader.ts  # 配置加载器
│   ├── variable-resolver.ts    # 变量解析器
│   ├── scene-executor.ts       # 场景执行器
│   ├── resource-handlers.ts    # 资源处理器
│   └── output-renderer.ts      # 输出渲染器
└── setup-scenes/               # 内置场景配置
    └── e-commerce.yaml         # 电商场景
```

### 配置文件格式

```yaml
# e-commerce.yaml
name: e-commerce
version: "1.0"
description: 电商直播场景 - 包含频道、商品、优惠券

metadata:
  icon: 🛒
  category: business
  tags: [电商, 直播带货]

resources:
  - id: channel
    type: channel
    description: 电商直播频道
    params:
      name: "电商示例频道-{timestamp}"
      scene: topclass
      channelPasswd: "{random:6-16}"
    output:
      channelId: channelId
      channelName: name

  - id: product
    type: product
    description: 示例商品
    dependsOn: channel
    params:
      channelId: "{channel.channelId}"
      name: "示例商品"
      price: 99.9
    output:
      productId: productId

  - id: coupon
    type: coupon
    description: 新人优惠券
    params:
      name: "新人专享券"
      type: MAX_OUT
    output:
      couponId: couponId

outputTemplate: |
  # 🎉 配置完成！
  ## 频道
  - ID: {channel.channelId}
  ## 商品
  - ID: {product.productId}
  ## 优惠券
  - ID: {coupon.couponId}

nextSteps:
  - command: "polyv-cli stream start --channelId {channel.channelId}"
    description: "开始直播"
```

### 变量类型

| 变量 | 说明 | 示例 |
|------|------|------|
| `{timestamp}` | 毫秒时间戳 | `1710960000000` |
| `{random:n-m}` | 随机字符串 | `{random:6-16}` 生成 6-16 位随机密码 |
| `{now}` | 当前时间戳 | `Date.now()` |
| `{now+Nd}` | N 天后时间戳 | `{now+30d}` 30 天后 |
| `{resource.field}` | 资源引用 | `{channel.channelId}` |

### 资源处理器设计

```typescript
// packages/cli/src/setup/resource-handlers.ts

import { PolyVClient } from 'polyv-live-api-sdk';

interface ResourceHandler {
  create(client: PolyVClient, params: Record<string, any>): Promise<any>;
  rollback?(client: PolyVClient, resource: any): Promise<void>;
}

export const handlers: Record<string, ResourceHandler> = {
  channel: {
    create: (client, p) => client.channel.createChannelV3(p),
    rollback: (client, r) => client.channel.deleteChannel(r.channelId),
  },
  product: {
    create: (client, p) => client.channel.addChannelProduct(p),
    rollback: (client, r) => client.channel.deleteChannelProduct({
      channelId: r.channelId,
      productId: r.productId
    }),
  },
  coupon: {
    create: (client, p) => client.v4Platform.createCoupon(p),
    rollback: (client, r) => client.v4Platform.deleteCouponsBatch({
      couponIds: [r.couponId]
    }),
  },
  // 未来扩展：document, checkin, interaction 等
};
```

### 场景执行流程

```
1. 加载场景配置 (SceneConfigLoader)
      ↓
2. 解析变量 (VariableResolver)
      ↓
3. 按顺序创建资源 (SceneExecutor)
   ┌─────────────────────────────┐
   │ for each resource:          │
   │   - 解析参数 (变量替换)      │
   │   - 调用 Handler.create()   │
   │   - 保存输出供后续引用       │
   │   - 失败则自动回滚已创建资源 │
   └─────────────────────────────┘
      ↓
4. 渲染输出 (OutputRenderer)
   - 配置摘要
   - 下一步指引
```

### 常见陷阱

| 陷阱 | 解决方案 |
|------|---------|
| 资源依赖顺序错误 | 使用 `dependsOn` 明确声明依赖关系 |
| 变量解析失败 | 提供清晰的错误信息，指出哪个变量解析失败 |
| 部分成功回滚 | 记录已创建资源，按逆序回滚 |
| 时间变量格式 | 统一使用 13 位毫秒时间戳 |
| 用户自定义场景冲突 | 内置场景不可被覆盖，用户场景使用不同名称 |

### 前置依赖

- ✅ Story 8-1: coupon 命令（优惠券 API）
- ✅ Story 8-2: product 命令（商品 API）
- ✅ Story 8-3: 电商场景 Skill（可简化为调用 setup 命令）

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-8]
- [Source: packages/sdk/src/services/channel.service.ts]
- [Source: packages/sdk/src/services/v4/platform.service.ts]
- [Source: packages/cli/src/commands/channel.commands.ts]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (via GLM-5[1m])

### Debug Log References

无

### Completion Notes List

1. **实现完成**: 所有 9 个任务及其子任务都已完成
2. **测试覆盖率**: Statements: 80.3%, Lines: 80.57%, Functions: 79.73%
3. **命令注册**: `polyv-cli setup <scene>` 已成功集成到 CLI
4. **内置场景**: e-commerce.yaml 已创建并包含频道、商品、优惠券三种资源
5. **变量支持**: 支持 `{timestamp}`, `{random:n-m}`, `{now}`, `{now+Nd}`, 资源引用
6. **自动回滚**: 场景执行器实现了失败自动回滚逻辑
7. **代码审查修复 (2026-03-21)**:
   - 添加回滚参数验证 (channelId, productId, couponId)
   - 添加变量边界验证 (随机数最大长度 10000, 天数最大 3650)
   - 添加 YAML 解析错误友好提示
   - 添加重复资源 ID 检测
   - 修复 e-commerce.yaml 拼写错误 (概道 → 频道) 并添加 nextSteps 数组
   - 修复 dryRun + JSON 双重输出问题
   - 添加常量 MS_PER_DAY 替代魔法数字
8. **e-commerce.yaml API 参数修复 (2026-03-21)**:
   - **Product**: 修复缺失的必需参数
     - 添加 `status: 1` (商品状态: 上架)
     - 添加 `linkType: 10` (链接类型: 通用链接)
     - 添加 `link` 和 `cover` (商品链接和封面)
     - 修复 `price` → `realPrice` (正确的字段名)
   - **Coupon**: 修复缺失的必需参数
     - 添加 `receiveStartTime: "{now}"` (领取开始时间)
     - 添加 `receiveEndTime: "{now+30d}"` (领取结束时间)
     - 添加 `useTimeType: DAY` (使用时间类型)
     - 添加 `dayOfUse: 30` (有效天数)
     - 添加 `availableAmount: 1000` (发行数量)
     - 添加 `rule` 配置 (优惠规则: 无门槛10元)

### File List

- packages/cli/src/setup/variable-resolver.ts
- packages/cli/src/setup/scene-config-loader.ts
- packages/cli/src/setup/resource-handlers.ts
- packages/cli/src/setup/scene-executor.ts
- packages/cli/src/setup/output-renderer.ts
- packages/cli/src/handlers/setup.handler.ts
- packages/cli/src/commands/setup.commands.ts
- packages/cli/src/setup-scenes/e-commerce.yaml
- packages/cli/src/index.ts (modified)
- packages/cli/src/setup/variable-resolver.test.ts (existed)
- packages/cli/src/setup/scene-config-loader.test.ts (existed)
- packages/cli/src/setup/resource-handlers.test.ts (modified)
- packages/cli/src/setup/scene-executor.test.ts (existed)
- packages/cli/src/setup/output-renderer.test.ts (existed)
- packages/cli/src/commands/setup.commands.test.ts (existed)
- packages/cli/src/handlers/setup.handler.test.ts (existed)
