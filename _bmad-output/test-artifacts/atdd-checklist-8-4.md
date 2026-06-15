# ATDD Checklist: Story 8-4 场景初始化命令

## TDD Red Phase (Current)

🔴 **Failing tests generated** - All tests use `it.skip()` as required by TDD

| Test File | Tests | Priority Distribution | Status |
|-----------|-------|----------------------|--------|
| scene-config-loader.test.ts | 18 | P0: 5, P1: 10, P2: 3 | RED |
| variable-resolver.test.ts | 24 | P0: 7, P1: 12, P2: 4, P3: 1 | RED |
| scene-executor.test.ts | 22 | P0: 8, P1: 10, P2: 4 | RED |
| resource-handlers.test.ts | 18 | P0: 6, P1: 9, P2: 3 | RED |
| output-renderer.test.ts | 20 | P0: 8, P1: 9, P2: 3 | RED |
| setup.handler.test.ts | 18 | P0: 7, P1: 9, P2: 2 | RED |
| setup.commands.test.ts | 15 | P0: 5, P1: 8, P2: 2 | RED |
| **Total** | **135** | P0: 46, P1: 67, P2: 21, P3: 1 | RED |

## Acceptance Criteria Coverage

| AC # | Description | Unit Tests | Integration Tests | Coverage |
|------|-------------|------------|-------------------|----------|
| AC1 | 命令支持 `polyv-cli setup <scene>` 格式 | setup.commands.test.ts, setup.handler.test.ts | - | ✅ 100% |
| AC2 | 内置电商场景 (`e-commerce`) 配置 | scene-config-loader.test.ts | - | ✅ 100% |
| AC3 | 配置文件驱动，支持变量替换 | variable-resolver.test.ts, scene-config-loader.test.ts | - | ✅ 100% |
| AC4 | 按配置顺序创建资源，支持资源间依赖 | scene-executor.test.ts | - | ✅ 100% |
| AC5 | 创建失败时自动回滚已创建的资源 | scene-executor.test.ts | - | ✅ 100% |
| AC6 | 输出配置摘要和下一步操作指引 | output-renderer.test.ts, setup.handler.test.ts | - | ✅ 100% |
| AC7 | 支持 `--list` 选项列出可用场景 | setup.commands.test.ts, scene-config-loader.test.ts | - | ✅ 100% |

## Test Files Generated

### Core Components (packages/cli/src/setup/)
```
├── scene-config-loader.test.ts   - 配置加载器测试
├── variable-resolver.test.ts     - 变量解析器测试
├── scene-executor.test.ts        - 场景执行器测试
├── resource-handlers.test.ts     - 资源处理器测试
└── output-renderer.test.ts       - 输出渲染器测试
```

### Handler Tests (packages/cli/src/handlers/)
```
└── setup.handler.test.ts         - Setup 命令处理逻辑测试
```

### Command Tests (packages/cli/src/commands/)
```
└── setup.commands.test.ts        - Setup 命令定义测试
```

### Configuration Files (packages/cli/src/setup-scenes/)
```
└── e-commerce.yaml               - 电商场景配置
```

## Test Priority Distribution

| Priority | Count | Description |
|----------|-------|-------------|
| P0 | 46 | Critical path - must pass for MVP |
| P1 | 67 | Important functionality |
| P2 | 21 | Edge cases and error handling |
| P3 | 1 | Nice-to-have scenarios |

## TDD Red Phase Validation

### ✅ All tests meet ATDD requirements:

1. **All tests use `it.skip()`** - Tests are skipped in red phase
2. **All tests assert expected behavior** - No placeholder assertions
3. **All tests marked with priority** - [P0], [P1], [P2], [P3] tags
4. **Coverage mapped to acceptance criteria** - All 7 ACs covered

## Next Steps (TDD Green Phase)

After implementing the feature:

1. **Remove `it.skip()`** from all test files
2. **Run tests**: `pnpm --filter polyv-live-cli test:unit`
3. **Verify tests PASS** (green phase)
4. **If any tests fail**:
   - Either fix implementation (feature bug)
   - Or fix test (test bug)
5. **Commit passing tests**

## Implementation Guidance

### Files to Implement

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
└── setup-scenes/
    └── e-commerce.yaml         # 电商场景配置 (已创建)
```

### Key Interfaces to Define

```typescript
// scene-config-loader.ts
interface SceneConfig {
  name: string;
  version: string;
  description: string;
  metadata?: SceneMetadata;
  resources: SceneResource[];
  outputTemplate?: string;
  nextSteps?: NextStep[];
}

interface SceneResource {
  id: string;
  type: 'channel' | 'product' | 'coupon';
  description?: string;
  dependsOn?: string | string[];
  params: Record<string, any>;
  output: Record<string, string>;
}

// variable-resolver.ts
interface ResourceOutputs {
  [resourceId: string]: Record<string, any>;
}

// scene-executor.ts
interface ExecutionResult {
  success: boolean;
  resources: ResourceResult[];
  duration?: number;
  rolledBack?: string[];
  dryRun?: boolean;
}

// resource-handlers.ts
interface ResourceHandler {
  create(params: any, outputConfig?: Record<string, string>): Promise<any>;
  rollback?(resource: any): Promise<void>;
}
```

### Variable Types to Support

| 变量 | 说明 | 示例 |
|------|------|------|
| `{timestamp}` | 毫秒时间戳 | `1710960000000` |
| `{random:n-m}` | 随机字符串 | `{random:6-16}` → `abc123xyz` |
| `{now}` | 当前时间戳 | `Date.now()` |
| `{now+Nd}` | N 天后时间戳 | `{now+30d}` → 30 天后 |
| `{resource.field}` | 资源引用 | `{channel.channelId}` → `ch_123` |

---
Generated: 2026-03-21
TDD Phase: RED
Workflow: bmad-testarch-atdd
