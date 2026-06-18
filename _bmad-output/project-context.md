---
project_name: polyv-cli
user_name: Nick
date: 2026-06-18
sections_completed:
  - technology_stack
  - implementation_rules
  - sdk_patterns
  - cli_patterns
  - typescript_rules
  - testing_rules
  - workflow_rules
  - security_rules
  - api_signature_rules
  - common_pitfalls
  - agent_first_design
  - api_doc_reference
  - epic_roadmap
version: 3.4
status: complete
optimized_for_llm: true
---

# AI 代理项目上下文

_本文件包含 AI 代理在实现代码时必须遵循的关键规则和模式。_

---

## 技术栈与版本

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 运行时 | Node.js | 20.x LTS | SDK 和 CLI 必需 |
| 语言 | TypeScript | 5.3.x | 严格模式已启用 |
| 包管理器 | pnpm | 9.x | Workspace monorepo |
| CLI 框架 | Commander.js | 11.x | CLI 命令 |
| HTTP 客户端 | Axios | 1.6.x | SDK API 调用 |
| 构建工具 (SDK) | tsup | 8.x | ESM + CJS 双输出 |
| 构建工具 (CLI) | tsc | 5.x | 标准 TypeScript |
| 测试框架 (SDK) | Vitest | 1.x | 单元测试 |
| 测试框架 (CLI) | Jest | 29.x | 单元测试 |
| 表格输出 | cli-table3 | 0.6.x | CLI 表格格式化 |

---

## Monorepo 结构

```
polyv-cli/
├── packages/
│   ├── sdk/                     # polyv-live-api-sdk
│   │   ├── src/
│   │   │   ├── services/        # API 服务
│   │   │   ├── types/           # TypeScript 类型
│   │   │   ├── auth/            # 认证
│   │   │   ├── errors/          # 错误类
│   │   │   └── utils/           # 工具函数
│   │   └── tests/               # 单元测试
│   └── cli/                     # polyv-live-cli
│       ├── src/
│       │   ├── commands/        # CLI 命令
│       │   ├── handlers/        # 业务逻辑
│       │   ├── config/          # 配置
│       │   ├── utils/           # 工具函数
│       │   └── types/           # CLI 类型
│       └── tests/               # 单元 + 集成测试
├── docs/
│   ├── api-reference/           # API 文档映射和项目侧索引
│   └── api-coverage/            # CLI/API 覆盖关系
├── _bmad-output/
│   ├── planning-artifacts/      # PRD, 架构, Epics
│   └── implementation-artifacts/ # Stories, Sprint 状态
└── pnpm-workspace.yaml
```

---

## Agent-First CLI 设计哲学 🎯

> **核心洞察**：PolyV CLI 不是最终产品，而是**能力层**。

```
AI Agent (最终用户)
    ↓ 调用
Claude Skills (编排层 - 场景化能力封装)
    ↓ 调用
PolyV CLI (能力层 - 550 API 命令行封装)
    ↓ 调用
PolyV API (基础层 - 直播云平台能力)
```

### Agent-First vs 传统 CLI

| 传统 CLI | Agent-First CLI |
|----------|-----------------|
| 面向人类用户 | 面向 AI Agent |
| 可读性优先 | 结构化输出优先 |
| 交互式确认 | 幂等操作 + `--force` |
| 模糊错误消息 | 结构化错误码 + 上下文 |

### Agent 调用要求

| 指标 | 要求 |
|------|------|
| 输出格式 | 所有命令支持 `--output json` |
| 错误结构 | `{ code, message, context, recoverable }` |
| 退出码 | 0=成功, 1=参数错误, 2=认证错误, 3=API 错误 |
| 帮助信息 | 完整的 `--help` 包含参数说明和示例 |

---

## API 文档参考系统 📚

### API 文档源路径

原始 API 文档不维护在本仓库。读取顺序：

1. 优先使用环境变量 `POLYV_API_DOCS_DIR`
2. 未设置时使用默认同级仓库路径：`../document-center/docs/live/api`，相对于本仓库根目录解析
3. `docs/api/` 仅是本地兼容缓存，已被 `.gitignore` 排除，不作为事实来源

### 项目侧 API 索引

本仓库维护 CLI/SDK 开发用的二次索引：

```
docs/api-reference/MODULE_DOC_MAPPING.json
docs/api-reference/CLI_COMMANDS_GUIDE.md
docs/api-reference/INDEX.md
docs/api-reference/BUSINESS_MODULES_INDEX.md
```

`MODULE_DOC_MAPPING.json` 中 `modules.*.docs` 的 API 文档路径默认相对于 `../document-center/docs/live/api`。这个默认根目录相对于本仓库根目录解析。如果路径以 `docs/api-reference/` 开头，则读取本仓库内的项目侧索引文件。

### 使用流程

1. **查找模块** - 在 `modules` 对象中找到对应模块名
2. **解析路径** - 将 `docs` 数组中的 API 文档路径拼到 `POLYV_API_DOCS_DIR` 或相对于本仓库根目录解析的 `../document-center/docs/live/api`
3. **阅读文档** - 从文档中心源目录读取具体 API 文档
4. **实现 SDK** - 在 `packages/sdk/src/services/` 中实现
5. **定义类型** - 在 `packages/sdk/src/types/` 中定义

### 核心模块映射 (42 个模块，表格列出常用核心模块)

| 模块 | 说明 | 文档数 | CLI 命令 |
|------|------|--------|----------|
| `channel` | 频道管理（核心） | 34 | `channel create/list/get/update/delete` |
| `product` | 商品管理 | 36 | `product add/list/update/delete` |
| `playback` | 回放管理 | 26 | `playback list/get/delete/merge` |
| `stream` | 推流/直播状态 | 17 | `stream get-key/start/stop/push` |
| `chat` | 聊天管理 | 47 | `chat send/list/ban/kick` |
| `statistics` | 数据统计 | 29 | `statistics view/concurrency/audience` |
| `interaction` | 互动管理 | 35 | `checkin/qa/questionnaire` |
| `lottery` | 抽奖管理 | 20 | `lottery create/start/result` |
| `viewer` | 观众管理 | 18 | `viewer get/list/tag` |
| `watchCondition` | 观看条件 | 20 | `watch-condition get/set` |
| `coupon` | 优惠券管理 | 9 | `coupon add/list/delete` |
| `account` | 账号管理 | 27 | `account get/update` |
| `callback` | 回调设置 | 23 | `callback get/set` |
| `ai` | AI 功能 | 12 | `ai digital-human` |

### API 版本路径

| 版本 | 路径前缀 | 示例 |
|------|----------|------|
| V2 | `/live/v2/...` | 流控制 API |
| V3 | `/live/v3/...` | 频道、账户 API |
| V4 | `/live/v4/...` | 平台、优惠券 API |
| V5 | `/live/v5/...` | 未来 API |

---

## Epic 路线图 🗺️

### 已完成 (Epic 1-8) ✅

| Epic | 名称 | 状态 |
|------|------|------|
| 1 | CLI 基础与认证 | ✅ done |
| 2 | 频道管理命令 | ✅ done |
| 3 | 流控制命令 | ✅ done |
| 4 | 发起推流命令 | ✅ done |
| 5 | 实时监控界面 | ✅ done |
| 6 | 多账号管理 | ✅ done |
| 7 | 商品管理命令 | ✅ done |
| 8 | 电商场景快速配置 | ✅ done |

### 待开发 (Epic 9-14) 📋

| Epic | 名称 | Phase | 模块数 | API 数 | 优先级 |
|------|------|-------|--------|--------|--------|
| 9 | 内容管理 | MVP | 5 | 60 | 🔴 高 |
| 10 | 数据统计 | MVP | 2 | 41 | 🔴 高 |
| 11 | 观众互动 | Growth | 4 | 110 | 🟡 中 |
| 12 | 观众管理 | Growth | 2 | 38 | 🟡 中 |
| 13 | 平台配置 | Vision | 5 | 83 | 🟢 低 |
| 14 | 高级功能 | Vision | 6 | 59 | 🟢 低 |

**总计**: 29 新模块, 391 新 API

---

## 关键实现规则

### 0. 架构规则 ⚠️

**CLI 与 SDK 的职责分离:**

```
┌─────────────────────────────────────────────────────┐
│                      CLI                            │
│  - 命令行解析 (Commander.js)                        │
│  - 用户交互和输出格式化                             │
│  - 认证管理 (authAdapter)                           │
│  - 调用 SDK 方法                                    │
│  ❌ 不能直接调用 PolyV API                          │
└────────────────────┬────────────────────────────────┘
                     │ 只通过 SDK 调用
┌────────────────────▼────────────────────────────────┐
│                      SDK                            │
│  - PolyV API 封装                                   │
│  - 类型定义 (Request/Response)                      │
│  - 签名计算                                         │
│  - 错误处理                                         │
│  ✅ 所有 API 调用必须在 SDK 中实现                  │
└─────────────────────────────────────────────────────┘
```

```typescript
// ❌ 错误：CLI 直接调用 API
import axios from 'axios';
await axios.post('https://api.polyv.net/live/v3/...');

// ✅ 正确：CLI 调用 SDK，SDK 调用 API
import { PolyVClient } from 'polyv-live-api-sdk';
await client.channel.updateWatchCondition({ ... });
```

### 1. SDK 开发规则

#### 服务结构
```typescript
// 位置: packages/sdk/src/services/{category}/{name}.service.ts
export class XxxService {
  constructor(private client: PolyVClient) {}

  // 方法命名规范
  async createXxx(params: CreateXxxParams): Promise<string> { }
  async getXxx(id: string): Promise<Xxx> { }
  async listXxx(params: ListXxxParams): Promise<Xxx[]> { }
  async updateXxx(params: UpdateXxxParams): Promise<void> { }
  async deleteXxx(id: string): Promise<void> { }
}
```

#### 类型定义结构
```typescript
// 位置: packages/sdk/src/types/{category}.ts

// 请求/参数类型
export interface CreateXxxParams {
  /** 字段描述 */
  field: string;
}

// 响应/实体类型
export interface Xxx {
  id: string;
  // ...
}

// 分页响应
export interface ListXxxResponse {
  contents: Xxx[];
  total: number;
  pageNumber: number;
  pageSize: number;
}
```

#### API 版本规则
- V3 APIs: `/live/v3/...` → 用于 `ChannelService`, `AccountService`
- V4 APIs: `/live/v4/...` → 用于 `V4PlatformService`, `V4ChannelService`
- V5 APIs: `/live/v5/...` → 未来使用

#### 错误处理
```typescript
// 使用自定义错误类
import { PolyVValidationError, PolyVAuthenticationError } from '../errors';

// 验证参数
if (!params.name) {
  throw new PolyVValidationError('name is required', 'name');
}
```

### 2. CLI 开发规则

#### ⚠️ Skill 同步规则（重要）

**每当 CLI 命令发生变化时，必须同步更新 `skills/polyv-live-cli/` 目录下的 skill 文件！**

```
命令变更类型          → 需要更新的文件
─────────────────────────────────────────────────
新增命令              → SKILL.md + 创建 references/xxx.md（必须）
新增子命令            → SKILL.md + 更新对应 references/*.md
新增/修改参数         → SKILL.md + 更新对应 references/*.md
废弃/删除命令         → SKILL.md（移除或标记废弃）
```

**更新时机（完成 Story 后）：**
1. 先检查 `ls skills/polyv-live-cli/references/` 看是否有对应文件
2. 如果新增了命令文件（如 `xxx.commands.ts`），必须：
   - 更新 SKILL.md 添加命令说明
   - 创建 `references/xxx.md` 详细文档
   - 在 SKILL.md 底部"详细文档"部分添加链接
3. 如果修改了现有命令，更新对应的 references 文件

**已有 reference 文件（17个）：**
```
skills/polyv-live-cli/references/
├── authentication.md       # 认证相关 (account, use, config)
├── channel-management.md   # 频道命令
├── chat-management.md      # 聊天消息 + 禁言踢人
├── checkin.md              # 签到管理
├── coupons.md              # 优惠券命令
├── documents.md            # 文档命令
├── monitor.md              # 直播监控
├── player.md               # 播放器配置
├── playback.md             # 回放命令
├── products.md             # 商品命令
├── qa-questionnaire.md     # 问答 + 问卷
├── record-settings.md      # 录制设置
├── scene-setup.md          # 场景初始化
├── session-management.md   # 场次管理
├── statistics.md           # 统计命令
└── streaming.md            # 推流命令
```

#### 命令结构
```typescript
// 位置: packages/cli/src/commands/{resource}.commands.ts
import { Command } from 'commander';

export function registerXxxCommands(program: Command): void {
  const xxx = program.command('xxx');
  xxx.description('管理 xxx');

  xxx
    .command('add')
    .description('创建 xxx')
    .requiredOption('--name <name>', '名称')
    .option('--output <format>', '输出格式', 'table')
    .action(async (options) => {
      // 委托给 handler
    });
}
```

#### ⚠️ CLI 选项短参数规则

**禁止使用 `-v` 或 `-V` 作为短参数！**

```
❌ 错误：
.option('-v, --viewer-ids <ids>', ...)   // 与 --version 冲突
.option('-V, --viewer-ids <ids>', ...)   // 与 --version 冲突

✅ 正确：
.option('--viewer-ids <ids>', ...)       // 只使用长参数
.option('-V, --verbose', ...)            // -v/--V 仅用于 --verbose
```

**原因：**
- `-v` 和 `-V` 容易与全局 `--version` 标志混淆
- Commander.js 和大多数 CLI 工具中 `-v` 通常保留给 `--verbose`
- 保持一致的命令行体验

**特殊情况：**
- `-v, --verbose` 是允许的（详细输出模式的标准约定）
- 如果参数确实需要短形式，使用其他字母如 `-i`、`-d` 等

#### Handler 结构
```typescript
// 位置: packages/cli/src/handlers/{resource}.handler.ts
import { authAdapter } from '../config/auth-adapter';
import { PolyVClient } from 'polyv-live-api-sdk';

export class XxxHandler {
  async createXxx(options: CreateXxxOptions): Promise<void> {
    // 1. 获取认证
    const authResult = authAdapter.tryGetAuthConfig(options);
    if (!authResult) {
      throw new Error(authAdapter.getStatusMessage(options));
    }

    // 2. 创建客户端
    const client = new PolyVClient(authResult.config);

    // 3. 调用 SDK
    const result = await client.xxx.createXxx(params);

    // 4. 格式化输出
    this.formatOutput(result, options.output);
  }
}
```

#### 认证模式
```typescript
// 始终使用 authAdapter 获取认证
import { authAdapter } from '../config/auth-adapter';

const authResult = authAdapter.tryGetAuthConfig(parentOptions);
if (!authResult) {
  throw new Error(authAdapter.getStatusMessage(parentOptions));
}
const { appId, appSecret, userId } = authResult.config;
```

#### 输出格式化
```typescript
// 支持 table 和 json 两种输出格式
import { Formatter } from '../utils/formatter';

if (options.output === 'json') {
  console.log(JSON.stringify(data, null, 2));
} else {
  Formatter.printTable(data, columns);
}
```

### 3. 测试规则

#### ⚠️ ATDD 核心原则 (最重要)

**永远不要修改测试来适应实现！**

ATDD (Acceptance Test-Driven Development) 的核心流程：
1. **RED 阶段**: 先写失败的测试（测试定义了期望的接口和行为）
2. **GREEN 阶段**: 写实现代码让测试通过
3. **REFACTOR 阶段**: 重构代码，保持测试通过

```
❌ 错误做法：
   1. 写实现代码
   2. 发现测试不通过
   3. 修改测试文件来适应实现  ← 这是错误的！

✅ 正确做法：
   1. ATDD 检查列表定义了测试文件路径和期望的接口
   2. 测试文件定义了期望的类/方法签名
   3. 实现代码必须让原始测试通过
   4. 如果测试不合理，先与用户讨论，不要擅自修改
```

**实际案例教训 (Story 10-1)**:
- ATDD 检查列表要求 CLI 使用 `StatisticsServiceSdk` 作为 SDK 包装层
- 错误做法：直接在 handler 使用 `PolyVClient`，然后修改测试来适应
- 正确做法：创建 `StatisticsServiceSdk` 包装类，让原始测试通过

#### SDK 测试 (Vitest)
```typescript
// 位置: packages/sdk/src/services/xxx.service.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('XxxService', () => {
  it('应该创建 xxx', async () => {
    const mockClient = { httpClient: { post: vi.fn() } };
    // ...
  });
});
```

#### CLI 测试 (Jest)
```typescript
// 位置: packages/cli/src/commands/xxx.commands.test.ts
import { Command } from 'commander';
import { registerXxxCommands } from './xxx.commands';

describe('Xxx 命令', () => {
  it('应该注册 xxx 命令', () => {
    const program = new Command();
    registerXxxCommands(program);
    expect(program.commands.find(c => c.name() === 'xxx')).toBeDefined();
  });
});
```

#### 覆盖率要求
- 最低: 80% (branches: 70%, functions/lines/statements: 80%)
- 目标: 85%

#### 测试组织
- **SDK**: 测试文件与源文件同目录 (`*.test.ts`)
- **CLI**: 单元测试在 `tests/` 目录，集成测试在 `tests/integration/`

#### Mock 模式

**SDK (Vitest):**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockClient = {
  httpClient: {
    post: vi.fn().mockResolvedValue({ data: { code: 200 } }),
    get: vi.fn().mockResolvedValue({ data: { code: 200 } }),
  }
};
```

**CLI (Jest):**
```typescript
jest.mock('../config/auth-adapter');
const mockAuthAdapter = authAdapter as jest.Mocked<typeof authAdapter>;
mockAuthAdapter.tryGetAuthConfig.mockReturnValue({ config: mockConfig });
```

#### 测试命令
```bash
# SDK 单元测试
pnpm --filter polyv-live-api-sdk test:unit

# CLI 单元测试（跳过集成/性能测试）
pnpm --filter polyv-live-cli test:unit

# CLI 集成测试（需要真实 API 凭证）
RUN_INTEGRATION_TESTS=true pnpm --filter polyv-live-cli test:integration
```

### 4. 导入规则

```typescript
// SDK 导入 - 使用包名
import { PolyVClient, ChannelService } from 'polyv-live-api-sdk';
import type { Channel, CreateChannelParams } from 'polyv-live-api-sdk';

// CLI 内部导入 - 使用相对路径
import { authAdapter } from '../config/auth-adapter';
import { Formatter } from '../utils/formatter';
```

### 5. TypeScript 严格规则（仅 CLI）

CLI 包启用了 SDK 没有的额外严格检查：

```typescript
// CLI tsconfig 额外规则：
"exactOptionalPropertyTypes": true,  // 可选属性必须精确匹配 undefined
"noUncheckedIndexedAccess": true,    // 数组/对象索引访问返回 T | undefined
"noImplicitOverride": true,          // 子类重写必须用 override 关键字
"noPropertyAccessFromIndexSignature": true,  // 索引签名属性必须用括号访问
```

**CLI 代码示例：**
```typescript
// 数组访问需要处理 undefined
const firstItem = array[0];  // 类型是 T | undefined
if (firstItem) {
  // 现在是 T
}

// 索引签名访问
interface Config {
  [key: string]: string;
}
const config: Config = { foo: 'bar' };
const value = config['foo'];  // 必须用括号，不能用 config.foo
```

### 6. 模块系统差异

| 方面 | SDK | CLI |
|------|-----|-----|
| 模块类型 | ESM (`"type": "module"`) | CommonJS |
| 导入后缀 | 必须加 `.js` | 不加后缀 |
| tsconfig module | `"NodeNext"` | `"commonjs"` |

```typescript
// SDK - 必须加 .js 后缀
import { ChannelService } from './services/channel.service.js';

// CLI - 不加后缀
import { authAdapter } from '../config/auth-adapter';
```

---

## 安全规则 🔒

```typescript
// ❌ 绝对不要
console.log(`Secret: ${appSecret}`);  // 永远不要记录密钥
const sign = generateSignature(params, appSecret);
console.log(`Signature: ${sign}`);     // 签名也不要记录

// ✅ 正确做法
console.log('Authentication: using credentials from config');
// 日志中只说明来源，不暴露任何敏感信息
```

---

## PolyV API 签名规则 📝

```typescript
// 签名计算规则：
// 1. 只参与签名：URL 参数（appId, timestamp）
// 2. 不参与签名：请求体参数
// 3. 空值参数必须过滤
// 4. 参数按字母顺序排序
// 5. 格式：appSecret + key1value1key2value2... + appSecret
// 6. MD5 后转大写

// ❌ 错误：请求体参数参与签名
const signParams = { ...urlParams, ...bodyParams };  // 错误！

// ✅ 正确：只有 URL 参数参与签名
const signParams = { appId, timestamp, userId };  // 正确
```

---

## 认证优先级 🎯

```typescript
// 认证来源优先级（从高到低）：
// 1. 命令行参数 --appId, --appSecret, --userId
// 2. 会话账户 polyv-cli use <account>
// 3. 环境变量 POLYV_APP_ID, POLYV_APP_SECRET
// 4. 默认账户 polyv-cli account set-default <name>
// 5. 全局配置 polyv-cli config set
```

---

## 常见陷阱 ⚠️

| 陷阱 | 问题 | 解决方案 |
|------|------|---------|
| 时间戳过期 | PolyV API 时间戳有效期 3 分钟 | 使用 `Date.now()` 生成 13 位毫秒时间戳 |
| 渠道状态检查 | 某些操作需要渠道在直播状态 | 先调用 `getChannelLiveStatus` 检查 |
| 分页参数 | pageNumber 从 1 开始，不是 0 | 使用 `{ pageNumber: 1, pageSize: 10 }` |
| API 版本混用 | V3/V4 API 响应格式不同 | 检查 `code` 和 `status` 字段 |
| SDK 导入后缀 | ESM 模块必须加 `.js` 后缀 | `from './service.js'` 不是 `from './service'` |
| API 文档遗漏 | 不知道使用哪个 API | 查阅 `docs/api-reference/MODULE_DOC_MAPPING.json`，再到相对于本仓库根目录解析的 `../document-center/docs/live/api` 读取具体文档 |

---

## 开发工作流自动化 ⚙️

> **重要规则（来自 CLAUDE.local.md）：**
> 完成一个故事的开发之后，马上运行所有单元测试和集成测试，单元测试的覆盖率必须达到 80%。
> **所有测试都通过和测试覆盖率达标之后，自动提交代码。**

```bash
# 开发完成后必须执行
pnpm test:unit                    # 运行单元测试
pnpm test:integration             # 运行集成测试（如有）

# 覆盖率检查通过后自动提交
git add -A && git commit -m "feat: implement story XXX"
```

---

## 使用指南

### AI 代理

- 在实现任何代码前**先阅读此文件**
- **严格遵循**所有记录的规则
- 如有疑问，选择**更严格的选项**
- 如果发现新模式，**更新此文件**
- **开发新模块前**，先查阅 `docs/api-reference/MODULE_DOC_MAPPING.json`

### 人类用户

- 保持文件**精简**，专注于 AI 代理需求
- 当技术栈变化时**更新**
- **每季度审查**一次，移除过时规则
- 随着时间推移，移除变得**显而易见**的规则

---

## 快速参考链接

| 资源 | 路径 |
|------|------|
| API 文档源 | `../document-center/docs/live/api`，相对于本仓库根目录解析 |
| API 文档映射 | `docs/api-reference/MODULE_DOC_MAPPING.json` |
| PRD 文档 | `_bmad-output/planning-artifacts/prd.md` |
| 架构文档 | `_bmad-output/planning-artifacts/architecture.md` |
| Epics & Stories | `_bmad-output/planning-artifacts/epics.md` |
| SDK 服务 | `packages/sdk/src/services/` |
| CLI 命令 | `packages/cli/src/commands/` |
| CLI Handlers | `packages/cli/src/handlers/` |
| 类型定义 | `packages/sdk/src/types/` |

---

**最后更新:** 2026-06-18
**版本:** 3.4 (API 文档源迁移到 document-center，项目侧索引迁入 docs/api-reference)
