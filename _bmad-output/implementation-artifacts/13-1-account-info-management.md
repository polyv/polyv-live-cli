# Story 13.1: 账号信息管理命令

Status: done

## 故事

作为管理员或 PaaS 客户开发者，
我想要通过 CLI 使用 `platform get`、`platform update` 等命令管理 PolyV 账号信息，
以便我能够查看和配置平台级账号设置。

## 验收标准 (ACs)

1. AC1: `platform get` 命令支持获取账号基本信息（用户ID、邮箱、频道数等）
2. AC2: `platform switch get` 命令支持获取账号开关配置（全局设置、认证、录制等开关状态）
3. AC3: `platform switch update` 命令支持更新账号开关配置
4. AC4: 所有命令支持 `--output table|json` 输出格式
5. AC5: 遵循 ATDD 开发模式，先编写测试，再实现功能
6. AC6: 复用已有的 SDK Account Service 方法
7. AC7: 错误消息友好，清晰提示参数验证失败或 API 调用失败的情况
8. AC8: 表格输出格式清晰，显示账号信息关键字段

## 任务 / 子任务

- [x] **任务1: 创建 CLI 类型定义 (AC: 1-8)**
  - [x] 在 `packages/cli/src/types/platform.ts` 中创建接口：
    - `PlatformGetOptions` - 获取账号信息选项
    - `PlatformSwitchGetOptions` - 获取开关配置选项
    - `PlatformSwitchUpdateOptions` - 更新开关配置选项
  - [x] 运行测试: `pnpm --filter polyv-live-cli test:unit -- platform`
  - [x] 测试通过

- [x] **任务2: 创建 PlatformHandler 类 (AC: 1-8)**
  - [x] 在 `packages/cli/src/handlers/platform.handler.ts` 中创建 Handler：
    - [x] 实现 `getAccountInfo` 方法 - 调用 SDK Account getUserInfo
    - [x] 实现 `getSwitchConfig` 方法 - 调用 SDK Account switchGet
    - [x] 实现 `updateSwitchConfig` 方法 - 调用 SDK Account switchUpdate
    - [x] 实现输入验证和输出格式化
  - [x] 继承 `BaseHandler` 基类
  - [x] 运行测试: `pnpm --filter polyv-live-cli test:unit -- platform`
  - [x] 测试通过

- [x] **任务3: 创建 SDK 服务包装器 (AC: 6)**
  - [x] 在 `packages/cli/src/services/platform-service.ts` 中创建 `PlatformServiceSdk`:
    - [x] 封装 Account Service 相关方法（getUserInfo, switchGet, switchUpdate）
  - [x] 运行测试: `pnpm --filter polyv-live-cli test:unit -- platform`
  - [x] 测试通过

- [x] **任务4: 注册 CLI 命令 (AC: 1-5)**
  - [x] 在 `packages/cli/src/commands/platform.commands.ts` 中创建命令：
    - [x] 实现 `platform get` 子命令
      - 选项: `--output` / `-o` (table|json)
    - [x] 实现 `platform switch get` 子命令
      - 选项: `--output` / `-o` (table|json)
    - [x] 实现 `platform switch update` 子命令
      - 选项: `--param` (必需), `--enabled` (必需, Y/N), `--output` / `-o`
  - [x] 在 `src/index.ts` 中注册命令
  - [x] 运行测试: `pnpm --filter polyv-live-cli test:unit -- platform`
  - [x] 测试通过

- [x] **任务5: 单元测试 (所有AC)**
  - [x] 为 `PlatformHandler` 编写单元测试
  - [x] 测试覆盖率达到 80% 以上
  - [x] 运行: `nvm use 23 && pnpm --filter polyv-live-cli test:unit`
  - [x] 运行覆盖率报告: `pnpm --filter polyv-live-cli test:coverage`
  - [x] 验证覆盖率达标

- [x] **任务6: 更新 Skill 文档 (完成开发后)**
  - [x] 更新 `skills/polyv-live-cli/SKILL.md` 添加 platform 命令说明
  - [x] 创建 `skills/polyv-live-cli/references/platform.md` 详细文档

## 开发注意事项

### 技术栈要求
[来源: CLAUDE.md, CLAUDE.local.md]
- **TypeScript**: 5.3.3 - 使用严格类型检查
- **Node.js**: 20.11.0 LTS - 运行时环境
- **Commander.js**: 11.1.0 - CLI 框架用于命令注册
- **Jest**: 29.7.0 - 测试框架

### API 集成要求

| CLI 命令 | SDK 方法 | API 端点 | HTTP 方法 |
|---------|----------|---------|---------|
| `platform get` | `account.getUserInfo()` | `/live/v3/user/get-info` | GET |
| `platform switch get` | `account.switchGet()` | `/live/v3/user/switch/get` | GET |
| `platform switch update` | `account.switchUpdate()` | `/live/v3/user/switch/update` | POST |

### 认证
- MD5 签名认证 (appId, timestamp, sign)

### SDK 服务

**已有 SDK 方法 (AccountService):**
```typescript
// 获取用户账号信息
getUserInfo(): Promise<GetUserInfoResponse>

// 获取开关配置
switchGet(): Promise<SwitchGetResponse>

// 更新开关配置
switchUpdate(params: SwitchUpdateParams): Promise<SwitchUpdateResponse>
```

**SDK 类型定义位置:**
- `packages/sdk/src/types/account.ts` - GetUserInfoResponse, SwitchGetResponse, SwitchUpdateParams, SwitchConfig

**SDK 类型详情:**

```typescript
// 用户信息响应
export interface GetUserInfoResponse {
  userId: string;           // 用户ID
  email: string;            // 邮箱
  maxChannels: number;      // 最大频道数
  totalChannels: number;    // 总频道数
  availableChannels: number; // 可用频道数
  linkMicLimit: number;     // 连麦限制数
  watchDomain?: string;     // 观看域名
}

// 开关配置
export interface SwitchConfig {
  globalSettingEnabled: boolean;  // 全局设置开关
  authEnabled: boolean;           // 认证开关
  recordEnabled: boolean;         // 录制开关
  playbackEnabled: boolean;       // 回放开关
  danmuEnabled: boolean;          // 弹幕开关
  [key: string]: boolean | string | number;
}

// 获取开关配置响应
export interface SwitchGetResponse {
  config: SwitchConfig;
}

// 更新开关配置参数
export interface SwitchUpdateParams {
  param: string;               // 配置项名称
  enabled: 'Y' | 'N' | boolean; // 启用状态
}

// 更新开关配置响应
export interface SwitchUpdateResponse {
  success: boolean;
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
参考现有的 `StatisticsHandler` 和 `statistics.commands.ts` 模式:
- Handler 类继承 `BaseHandler`
- 通过构造函数注入 SDK wrapper 服务
- 每个方法实现输入验证、业务逻辑调用、输出格式化
- 使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法格式化输出

### 命令设计示例

```bash
# ========== 平台账号信息管理命令 ==========

# 获取账号基本信息
polyv-live-cli platform get

# JSON 输出格式
polyv-live-cli platform get -o json

# 获取开关配置
polyv-live-cli platform switch get

# JSON 输出格式
polyv-live-cli platform switch get -o json

# 更新开关配置 - 启用认证
polyv-live-cli platform switch update --param authEnabled --enabled Y

# 更新开关配置 - 禁用录制
polyv-live-cli platform switch update --param recordEnabled --enabled N

# 可用开关参数:
# - authEnabled: 认证开关
# - recordEnabled: 录制开关
# - playbackEnabled: 回放开关
# - danmuEnabled: 弹幕开关
# - globalSettingEnabled: 全局设置开关
```

### 前一 Story (12-4) 学习要点
1. Handler 类通过 SDK wrapper 调用 SDK
2. 使用 `BaseHandler` 的 `executeWithErrorHandling` 进行统一错误处理
3. 输出格式化使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法
4. 验证失败抛出 `PolyVValidationError`
5. 命令注册使用 Commander.js 的链式调用
6. `loadAuthAndServiceConfig` 辅助函数处理认证配置
7. **注意 CLI 选项短参数规则：禁止使用 `-v` 或 `-V`**，避免与 `--version` 冲突

### 关键实现细节

1. **获取账号信息 (`platform get`)**
   - 使用 V3 API `/live/v3/user/get-info`
   - 无需额外参数
   - SDK 方法已存在: `account.getUserInfo()`
   - 响应包含用户ID、邮箱、频道数等信息

2. **获取开关配置 (`platform switch get`)**
   - 使用 V3 API `/live/v3/user/switch/get`
   - 无需额外参数
   - SDK 方法已存在: `account.switchGet()`
   - 响应包含所有开关配置项

3. **更新开关配置 (`platform switch update`)**
   - 使用 V3 API `/live/v3/user/switch/update`
   - 参数: `param` (必需), `enabled` (必需, Y/N)
   - SDK 方法已存在: `account.switchUpdate(params)`
   - SDK 内部会自动将 boolean 转换为 Y/N

### 表格输出设计

**platform get 表格:**
| 字段 | 值 |
|-----|-----|
| 用户 ID | userId |
| 邮箱 | email |
| 最大频道数 | maxChannels |
| 总频道数 | totalChannels |
| 可用频道数 | availableChannels |
| 连麦限制 | linkMicLimit |
| 观看域名 | watchDomain |

**platform switch get 表格:**
| 开关名称 | 状态 |
|---------|------|
| 全局设置 | enabled/disabled |
| 认证 | enabled/disabled |
| 录制 | enabled/disabled |
| 回放 | enabled/disabled |
| 弹幕 | enabled/disabled |

**platform switch update 成功消息:**
```
Successfully updated switch config: authEnabled = Y
```

### 错误处理
- `--param` 为空时提示: "param (配置项名称) 是必需的"
- `--enabled` 不是 Y/N/true/false 时提示: "enabled 必须是 Y 或 N"
- 不支持的 param 值时提示: "不支持的配置项: xxx。可用配置项: authEnabled, recordEnabled, ..."
- API 返回错误时显示友好的错误消息

## 测试

### 测试文件位置
[来源: architecture.md]
- 单元测试: `packages/cli/src/handlers/platform.handler.test.ts`
- 命令测试: `packages/cli/src/commands/platform.commands.test.ts`
- 服务测试: `packages/cli/src/services/platform-service.test.ts`

### 测试标准
[来源: architecture.md]
- 使用 Jest 29.7.0 测试框架
- 测试命名: `describe-it` 模式，描述性测试名称
- 测试结构: `Arrange-Act-Assert` 模式
- Mock 策略: 使用 Jest mocks 模拟 SDK 响应
- 覆盖率要求: 单元测试覆盖率必须 >= 80%

### 具体测试要求
- **Handler 测试**: 验证业务逻辑、输入验证、错误处理
  - 测试获取账号信息
  - 测试获取开关配置
  - 测试更新开关配置
  - 测试表格和 JSON 输出格式
  - 测试错误处理（无效 param、enabled 等）
- **命令测试**: 验证 CLI 选项解析和帮助输出
- **错误场景测试**: 验证参数验证失败、API 调用失败的处理

## 变更日志

| 日期 | 版本 | 描述 | 作者 |
|------|------|------|------|
| 2026-03-25 | 1.0 | Initial story creation for platform account info commands | Claude Code Agent |
| 2026-03-25 | 1.1 | Implementation complete - all tests passing | Claude Code Agent |

## 文件列表

### 新增文件
- `packages/cli/src/types/platform.ts` - 平台相关类型定义
- `packages/cli/src/services/platform-service.ts` - PlatformServiceSdk 服务包装器
- `packages/cli/src/handlers/platform.handler.ts` - PlatformHandler 处理器
- `packages/cli/src/commands/platform.commands.ts` - CLI 命令定义
- `skills/polyv-live-cli/references/platform.md` - Skill 参考文档

### 修改文件
- `packages/cli/src/commands/index.ts` - 注册 platform 命令
- `skills/polyv-live-cli/SKILL.md` - 添加 platform 命令说明

### 测试文件（已存在，RED Phase 创建）
- `packages/cli/src/types/platform.test.ts` - 类型测试
- `packages/cli/src/services/platform-service.test.ts` - 服务测试
- `packages/cli/src/handlers/platform.handler.test.ts` - 处理器测试
- `packages/cli/src/commands/platform.commands.test.ts` - 命令测试

## 开发代理记录

### 实现计划
遵循 ATDD 模式，测试文件已在 RED Phase 创建。实现包括：
1. 创建类型定义 (platform.ts)
2. 创建 SDK 包装器 (platform-service.ts)
3. 创建 Handler (platform.handler.ts)
4. 创建命令 (platform.commands.ts)
5. 注册命令 (index.ts)
6. 更新 Skill 文档

### 完成备注
- 所有 85 个平台相关测试通过
- 全部单元测试通过 (4744 passed)
- 实现覆盖所有 8 个验收标准
- 遵循现有代码模式 (CouponHandler, StatisticsServiceSdk)
- 使用 BaseHandler 的 executeWithErrorHandling 进行统一错误处理
- 支持表格和 JSON 两种输出格式
