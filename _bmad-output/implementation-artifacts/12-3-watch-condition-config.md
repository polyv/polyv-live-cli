# Story 12.3: 观看条件配置命令

Status: ready-for-dev

## 故事

作为一个运营人员或 PaaS 客户开发者，
我想要通过 CLI 使用 `watch-condition get`、`watch-condition set` 等命令配置观看条件，
以便我能够高效地控制直播间的观看权限。

## 验收标准 (ACs)

1. AC1: `watch-condition get` 命令支持获取频道观看条件配置（支持全局和单个频道）
2. AC2: `watch-condition set` 命令支持更新频道观看条件配置（支持主要条件和次要条件）
3. AC3: 所有命令支持 `--output table|json` 输出格式
4. AC4: 遵循 ATDD 开发模式，先编写测试，再实现功能
5. AC5: 复用已有的 SDK Web Service 观看条件相关方法
6. AC6: 错误消息友好，清晰提示参数验证失败或 API 调用失败的情况
7. AC7: 表格输出格式清晰，显示观看条件关键信息
8. AC8: 支持 JSON 格式配置文件输入（复杂配置场景）

## 任务 / 子任务

- [ ] **任务1: 创建 CLI 类型定义 (AC: 1-8)**
  - [ ] 在 `packages/cli/src/types/watch-condition.ts` 中创建接口：
    - `WatchConditionGetOptions` - 获取观看条件选项
    - `WatchConditionSetOptions` - 设置观看条件选项
    - `WatchConditionServiceConfig` - 服务配置
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- watch-condition`
  - [ ] 测试通过

- [ ] **任务2: 创建 WatchConditionHandler 类 (AC: 1-8)**
  - [ ] 在 `packages/cli/src/handlers/watch-condition.handler.ts` 中创建 Handler：
    - [ ] 实现 `getWatchCondition` 方法 - 调用 SDK Web getWatchCondition
    - [ ] 实现 `setWatchCondition` 方法 - 调用 SDK Web setWatchCondition
    - [ ] 实现输入验证和输出格式化
  - [ ] 继承 `BaseHandler` 基类
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- watch-condition`
  - [ ] 测试通过

- [ ] **任务3: 创建 SDK 服务包装器 (AC: 5)**
  - [ ] 在 `packages/cli/src/services/watch-condition-service.ts` 中创建 `WatchConditionServiceSdk`:
    - [ ] 封装 Web Service 观看条件方法（getWatchCondition, setWatchCondition）
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- watch-condition`
  - [ ] 测试通过

- [ ] **任务4: 注册 CLI 命令 (AC: 1-4, 8)**
  - [ ] 在 `packages/cli/src/commands/watch-condition.commands.ts` 中创建命令：
    - [ ] 实现 `watch-condition get` 子命令
      - 选项: `--channel-id` (可选，不传为全局), `--output` / `-o`
    - [ ] 实现 `watch-condition set` 子命令
      - 选项: `--channel-id` (可选), `--config` (JSON 配置文件路径), `--rank` (1 或 2), `--auth-type` (认证类型), `--enabled` (Y/N), `--output` / `-o`
  - [ ] 在 `src/index.ts` 中注册命令
  - [ ] 运行测试: `pnpm --filter polyv-live-cli test:unit -- watch-condition`
  - [ ] 测试通过

- [ ] **任务5: 单元测试 (所有AC)**
  - [ ] 为 `WatchConditionHandler` 编写单元测试
  - [ ] 测试覆盖率达到 80% 以上
  - [ ] 运行: `nvm use 23 && pnpm --filter polyv-live-cli test:unit`
  - [ ] 运行覆盖率报告: `pnpm --filter polyv-live-cli test:coverage`
  - [ ] 验证覆盖率达标

- [ ] **任务6: 更新 Skill 文档 (完成开发后)**
  - [ ] 更新 `skills/polyv-live-cli/SKILL.md` 添加 watch-condition 命令说明
  - [ ] 创建 `skills/polyv-live-cli/references/watch-condition.md` 详细文档

## 开发注意事项

### 技术栈要求
[来源: CLAUDE.md, CLAUDE.local.md]
- **TypeScript**: 5.3.3 - 使用严格类型检查
- **Node.js**: 20.11.0 LTS - 运行时环境
- **Commander.js**: 11.1.0 - CLI 框架用于命令注册
- **Jest**: 29.7.0 - 测试框架

### API 集成要求

| CLI 命令 | SDK 方法 | API 端点 |
|---------|----------|---------|
| `watch-condition get` | `web.getWatchCondition()` | `GET /live/v3/channel/auth/get` |
| `watch-condition set` | `web.setWatchCondition()` | `POST /live/v3/channel/auth/update` |

### 认证
- MD5 签名认证 (appId, timestamp, sign)

### SDK 服务

**已有 SDK 方法 (WebService):**
```typescript
// 获取观看条件
getWatchCondition(params: GetWatchConditionParams): Promise<WatchConditionResponse>

// 设置观看条件
setWatchCondition(params: SetWatchConditionParams): Promise<string>
```

**SDK 类型定义位置:**
- `packages/sdk/src/types/web.ts` - WatchConditionResponse, SetWatchConditionParams, AuthSetting

**SDK 类型详情:**

```typescript
// 认证类型
export type AuthType =
  | 'none'      // 无限制
  | 'code'      // 密码观看
  | 'pay'       // 付费观看
  | 'phone'     // 白名单观看
  | 'info'      // 登记观看
  | 'wxshare'   // 分享观看
  | 'custom'    // 自定义授权观看
  | 'external'  // 外部授权观看
  | 'direct';   // 独立授权

// 观看条件响应
export interface WatchConditionResponse {
  channelId: string;
  userId: string;
  rank: number;  // 1=主要条件, 2=次要条件
  globalSettingEnabled: string;  // Y/N
  enabled: string;  // Y/N
  authType: AuthType;
  subAuthType?: 'public' | 'wx';  // authType=none时
  codeAuthTips?: string;  // 密码观看提示
  authCode?: string;  // 密码
  payAuthTips?: string;  // 付费提示
  price?: number;  // 价格
  watchEndTime?: number;  // 截止时间
  validTimePeriod?: number;  // 有效天数
  customKey?: string;
  customUri?: string;
  externalKey?: string;
  externalUri?: string;
  externalRedirectUri?: string;
  directKey?: string;
  trialWatchEnabled?: string;  // Y/N
  trialWatchTime?: number;  // 试看分钟数
  infoFields?: InfoField[];  // 登记观看字段
  // ...更多字段
}

// 设置观看条件参数
export interface SetWatchConditionParams {
  channelId?: string;  // 不传为全局设置
  authSettings: AuthSetting[];
}

// 认证设置
export interface AuthSetting {
  rank: 1 | 2;  // 主要/次要
  enabled?: 'Y' | 'N';
  authType?: AuthType;
  code?: string;  // 密码观看
  payAmount?: number;  // 付费金额
  infoFields?: InfoField[];  // 登记观看字段
  externalKey?: string;
  externalUri?: string;
  customKey?: string;
  customUri?: string;
  directKey?: string;
  subAuthType?: 'public' | 'wx';
}
```

### 编码标准要求
[来源: architecture.md]
- 所有 public 方法必须有 JSDoc 注释
- 使用明确的 TypeScript 类型，避免使用 `any` 类型
- 异步操作必须有完整的错误处理
- 遵循现有的命名约定 (camelCase 变量, PascalCase 类)
- 单元测试覆盖率必须 >= 80%

### 模式参考
参考现有的 `ViewerHandler` 和 `viewer.commands.ts` 模式:
- Handler 类继承 `BaseHandler`
- 通过构造函数注入 SDK wrapper 服务
- 每个方法实现输入验证、业务逻辑调用、输出格式化
- 使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法格式化输出

### 命令设计示例

```bash
# ========== 观看条件配置命令 ==========

# 获取全局观看条件
polyv-live-cli watch-condition get

# 获取频道观看条件
polyv-live-cli watch-condition get --channel-id 123456

# JSON 输出格式
polyv-live-cli watch-condition get --channel-id 123456 -o json

# 简单设置：关闭观看条件（公开观看）
polyv-live-cli watch-condition set --channel-id 123456 --rank 1 --auth-type none --enabled Y

# 简单设置：密码观看
polyv-live-cli watch-condition set --channel-id 123456 --rank 1 --auth-type code --enabled Y --code "abc123"

# 简单设置：付费观看
polyv-live-cli watch-condition set --channel-id 123456 --rank 1 --auth-type pay --enabled Y --price 99.9 --tips "付费观看"

# 复杂设置：使用 JSON 配置文件
polyv-live-cli watch-condition set --channel-id 123456 --config ./watch-condition.json

# 设置全局观看条件
polyv-live-cli watch-condition set --rank 1 --auth-type none --enabled N
```

### JSON 配置文件格式

```json
{
  "authSettings": [
    {
      "rank": 1,
      "enabled": "Y",
      "authType": "code",
      "code": "abc123",
      "codeAuthTips": "请输入观看密码"
    },
    {
      "rank": 2,
      "enabled": "N"
    }
  ]
}
```

### 前一 Story (12-2) 学习要点
1. Handler 类通过 SDK wrapper 调用 SDK
2. 使用 `BaseHandler` 的 `executeWithErrorHandling` 进行统一错误处理
3. 输出格式化使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法
4. 验证失败抛出 `PolyVValidationError`
5. 命令注册使用 Commander.js 的链式调用
6. `loadAuthAndServiceConfig` 辅助函数处理认证配置
7. 注意 CLI 选项短参数规则：**禁止使用 `-v` 或 `-V`**，避免与 `--version` 冲突

### 关键实现细节

1. **获取观看条件 (`watch-condition get`)**
   - 使用 V3 API `/live/v3/channel/auth/get`
   - 参数: `channelId` (可选，不传为全局)
   - SDK 方法已存在: `web.getWatchCondition({ channelId })`
   - 响应包含数组（主要条件 rank=1 和次要条件 rank=2）

2. **设置观看条件 (`watch-condition set`)**
   - 使用 V3 API `/live/v3/channel/auth/update`
   - 参数: `channelId` (可选), `authSettings` 数组
   - SDK 方法已存在: `web.setWatchCondition(params)`
   - 业务规则:
     - 主要观看条件关闭时，次要观看条件不能打开
     - 主要和次要观看条件相同时，不能同时打开

3. **支持的认证类型**
   - `none`: 无限制/公开观看
   - `code`: 密码观看
   - `pay`: 付费观看
   - `phone`: 白名单观看
   - `info`: 登记观看
   - `custom`: 自定义授权
   - `external`: 外部授权
   - `direct`: 独立授权

### 表格输出设计

**watch-condition get 表格:**
| 列名 | 字段 | 说明 |
|-----|------|-----|
| 条件级别 | rank | 1=主要, 2=次要 |
| 状态 | enabled | Y/N |
| 认证类型 | authType | 无限制/密码/付费/白名单等 |
| 详细配置 | 根据authType显示 | 密码/价格/链接等 |

**watch-condition set 成功消息:**
```
Successfully updated watch condition for channel 123456
```

### 错误处理
- `--rank` 不是 1 或 2 时提示: "rank 必须是 1 (主要条件) 或 2 (次要条件)"
- `--auth-type` 无效时提示: "无效的认证类型，支持的类型: none, code, pay, phone, info, custom, external, direct"
- `--enabled` 不是 Y/N 时提示: "enabled 必须是 Y 或 N"
- API 返回错误时显示友好的错误消息
- 配置文件不存在或格式错误时提示具体问题

## 测试

### 测试文件位置
[来源: architecture.md]
- 单元测试: `packages/cli/src/handlers/watch-condition.handler.test.ts`
- 命令测试: `packages/cli/src/commands/watch-condition.commands.test.ts`
- 服务测试: `packages/cli/src/services/watch-condition-service.test.ts`

### 测试标准
[来源: architecture.md]
- 使用 Jest 29.7.0 测试框架
- 测试命名: `describe-it` 模式，描述性测试名称
- 测试结构: `Arrange-Act-Assert` 模式
- Mock 策略: 使用 Jest mocks 模拟 SDK 响应
- 覆盖率要求: 单元测试覆盖率必须 >= 80%

### 具体测试要求
- **Handler 测试**: 验证业务逻辑、输入验证、错误处理
  - 测试获取观看条件（全局和频道）
  - 测试设置观看条件（简单参数和配置文件）
  - 测试表格和 JSON 输出格式
  - 测试错误处理（无效 rank、authType 等）
  - 测试配置文件解析
- **命令测试**: 验证 CLI 选项解析和帮助输出
- **错误场景测试**: 验证参数验证失败、API 调用失败的处理

## 变更日志

| 日期 | 版本 | 描述 | 作者 |
|------|------|------|------|
| 2026-03-24 | 1.0 | Initial story creation for watch condition commands | Claude Code Agent |
