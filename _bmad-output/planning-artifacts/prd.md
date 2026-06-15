---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments:
  - _bmad-output/project-context.md
  - _bmad-output/planning-artifacts/epics.md
  - docs/api/MODULE_DOC_MAPPING.json
  - docs/api/CLI_COMMANDS_GUIDE.md
workflowType: 'prd'
documentCounts:
  briefCount: 0
  researchCount: 0
  projectDocsCount: 4
date: '2026-03-22'
classification:
  projectType: CLI Tool
  domain: Developer Tool + Live Streaming SaaS
  complexity: medium
  projectContext: brownfield
  modulesTotal: 36
  modulesCompleted: 7
  modulesRemaining: 29
  epicsPlanned: 6
status: complete
---

# 产品需求文档 (PRD): PolyV CLI 扩展 - Agent 原生直播管理能力

**作者:** Nick
**日期:** 2026-03-22
**版本:** 2.0
**项目:** polyv-cli
**状态:** ✅ Complete

---

## Executive Summary

### 产品愿景

**PolyV CLI 扩展项目**旨在构建 **Agent 原生的直播管理能力**。

PolyV CLI 不是最终产品，而是**能力层**——为上层 Skills 提供与 PolyV API 交互的标准化接口。真正的产品是 **Claude Skills**，它将 CLI 的原子能力编排成场景化的 Agent 能力，让 AI Agent 能够自主完成直播运营全流程。

```
AI Agent (最终用户)
    ↓ 调用
Claude Skills (编排层 - 场景化能力封装)
    ↓ 调用
PolyV CLI (能力层 - 550 API 命令行封装)
    ↓ 调用
PolyV API (基础层 - 直播云平台能力)
```

### What Makes This Special

**核心洞察**：「覆盖度决定采用率」

- **CLI 覆盖度**：现有 CLI 仅覆盖 7 个模块。只有当 CLI 覆盖 36 个模块时，Skills 才能编排出完整的场景化能力。
- **Agent-First 设计**：每个 CLI 命令都为 Agent 调用优化——标准化 I/O、完善错误消息、一致命令模式。
- **场景化编排**：Skills 层将原子 CLI 命令编排成业务场景，让 Agent 用自然语言驱动复杂流程。

**一句话价值主张**：
> **让 AI Agent 能够自主完成直播运营** — CLI 提供原子能力，Skills 提供场景编排，Agent 是最终用户。

---

## Project Classification

| 维度 | 分类 |
|------|------|
| **项目类型** | CLI Tool |
| **领域** | Developer Tool + Live Streaming SaaS |
| **复杂度** | 中等 |
| **项目上下文** | Brownfield (棕地项目) |
| **扩展范围** | 29 个模块 / 6 个新 Epic |
| **API 覆盖目标** | 550 API → CLI 命令 |

---

## Success Criteria

### User Success
- Agent 能完成完整直播运营闭环：创建 → 配置 → 直播 → 监控 → 报告
- 错误消息足够清晰，Agent 能自我纠错
- 开发者一行命令完成 10+ 次 Web 点击的操作

### Business Success

| 时间线 | 成功标准 |
|--------|----------|
| 3 个月 | Phase 1 完成，内部运营开始使用 |
| 6 个月 | Phase 2 完成，2+ Skills 基于新能力构建 |
| 12 个月 | 全部完成，20%+ PaaS 客户集成 CLI |

### Technical Success

| 维度 | 标准 |
|------|------|
| API 覆盖率 | ≥ 90% |
| 测试覆盖率 | ≥ 80% |
| Agent 可用性 | 所有命令支持 `--output json` |

---

## Product Scope

### Phase 1: MVP (Epic 9-10)

| Epic | 模块 | API 数量 |
|------|------|----------|
| 内容管理 | document, playback, record, session, ppt | 60 |
| 数据统计 | statistics, player | 41 |

### Phase 2: Growth (Epic 11-12)

| Epic | 模块 | API 数量 |
|------|------|----------|
| 观众互动 | chat, interaction, lottery, donate | 110 |
| 观众管理 | viewer, watchCondition | 38 |

### Phase 3: Vision (Epic 13-14)

| Epic | 模块 | API 数量 |
|------|------|----------|
| 平台配置 | account, callback, globalSetting, template, label | 83 |
| 高级功能 | marketing, cardPush, warmup, transmit, ai, role | 59 |

---

## Innovation & Novel Patterns

### Agent-First CLI Design

本项目采用 **Agent-First** 设计哲学，这是 CLI 工具设计的新范式：

| 传统 CLI | Agent-First CLI |
|----------|-----------------|
| 面向人类用户 | 面向 AI Agent |
| 可读性优先 | 结构化输出优先 |
| 交互式确认 | 幂等操作 + `--force` |
| 模糊错误消息 | 结构化错误码 + 上下文 |

### 创新验证

- ✅ 已验证：Epic 8 的 `polyv-e-commerce-setup` Skill 成功演示了 Agent 调用 CLI 的模式
- 🔄 待验证：29 个新模块的 CLI 命令是否能支持同样流畅的 Agent 体验

---

## CLI Tool Requirements

### Command Structure

```
polyv-cli <resource> <action> [options]

Examples:
  polyv-cli channel list --page 1 --output json
  polyv-cli playback get --channelId xxx --videoId yyy
  polyv-cli statistics summary --channelId xxx --date 2026-03-22
```

### Required Command Patterns

| 模式 | 说明 |
|------|------|
| `--output table\|json` | 所有 list/get 命令必须支持 |
| `--help` | 包含参数说明和使用示例 |
| `--channelId` | 频道级命令的标准参数 |
| 错误码 | 结构化错误，包含 code、message、context |

### SDK/CLI Architecture

```
CLI (packages/cli)
├── commands/     # 命令定义 (Commander.js)
├── handlers/     # 业务逻辑
└── utils/        # 格式化、输出

    ↓ 调用

SDK (packages/sdk)
├── services/     # API 封装
├── types/        # TypeScript 类型
└── auth/         # 签名认证
```

---

## Functional Requirements

### FR1: 内容管理 (Epic 9)

- **FR1.1**: Agent 可以列出频道的回放列表
- **FR1.2**: Agent 可以获取回放详情
- **FR1.3**: Agent 可以删除回放
- **FR1.4**: Agent 可以合并录制文件
- **FR1.5**: Agent 可以上传和管理课件文档
- **FR1.6**: Agent 可以查询场次信息
- **FR1.7**: Agent 可以管理录制设置

### FR2: 数据统计 (Epic 10)

- **FR2.1**: Agent 可以获取频道观看数据统计
- **FR2.2**: Agent 可以获取并发数据
- **FR2.3**: Agent 可以获取观众画像数据
- **FR2.4**: Agent 可以导出统计报表
- **FR2.5**: Agent 可以配置播放器设置

### FR3: 观众互动 (Epic 11)

- **FR3.1**: Agent 可以发送和管理聊天消息
- **FR3.2**: Agent 可以管理禁言和踢人
- **FR3.3**: Agent 可以配置和执行签到
- **FR3.4**: Agent 可以管理问答和问卷
- **FR3.5**: Agent 可以配置和执行抽奖
- **FR3.6**: Agent 可以管理打赏设置

### FR4: 观众管理 (Epic 12)

- **FR4.1**: Agent 可以查询观众信息
- **FR4.2**: Agent 可以管理观众标签
- **FR4.3**: Agent 可以配置观看条件
- **FR4.4**: Agent 可以管理白名单

### FR5: 平台配置 (Epic 13)

- **FR5.1**: Agent 可以查询和更新账号信息
- **FR5.2**: Agent 可以配置回调设置
- **FR5.3**: Agent 可以管理全局设置
- **FR5.4**: Agent 可以管理模板设置

### FR6: 高级功能 (Epic 14)

- **FR6.1**: Agent 可以配置营销推广
- **FR6.2**: Agent 可以管理卡片推送
- **FR6.3**: Agent 可以配置转播
- **FR6.4**: Agent 可以管理 AI 数字人

### FR7: 通用能力

- **FR7.1**: 所有命令支持 `--output json` 输出
- **FR7.2**: 所有命令提供完整的 `--help` 文档
- **FR7.3**: 所有命令支持多账号切换
- **FR7.4**: 所有命令返回结构化错误信息

---

## Non-Functional Requirements

### Performance

| 指标 | 要求 |
|------|------|
| 命令响应时间 | < 200ms (不含网络) |
| 批量操作 | 支持 100+ 并发请求 |
| 大数据输出 | 分页支持，默认 20 条/页 |

### Security

| 指标 | 要求 |
|------|------|
| 密钥存储 | AES-256-GCM 加密 |
| 配置文件权限 | 600 |
| 敏感信息输出 | 脱敏显示 (`***`) |
| 签名机制 | MD5 签名，时间戳防重放 |

### Reliability

| 指标 | 要求 |
|------|------|
| 错误恢复 | Agent 可基于错误码自动重试 |
| 批量容错 | 单条失败不中断批量操作 |
| 离线支持 | 认证信息本地缓存 |

### Agent Compatibility

| 指标 | 要求 |
|------|------|
| 输出格式 | JSON 输出必须符合 JSON Schema |
| 错误结构 | `{ code, message, context, recoverable }` |
| 退出码 | 0=成功, 1=参数错误, 2=认证错误, 3=API 错误 |

---

## Epic Summary

| Epic | 名称 | Phase | 模块数 | API 数 | 优先级 |
|------|------|-------|--------|--------|--------|
| 9 | 内容管理 | MVP | 5 | 60 | 🔴 高 |
| 10 | 数据统计 | MVP | 2 | 41 | 🔴 高 |
| 11 | 观众互动 | Growth | 4 | 110 | 🟡 中 |
| 12 | 观众管理 | Growth | 2 | 38 | 🟡 中 |
| 13 | 平台配置 | Vision | 5 | 83 | 🟢 低 |
| 14 | 高级功能 | Vision | 6 | 59 | 🟢 低 |

**总计**: 29 模块, 391 API

---

## Next Steps

1. **Architecture Review**: 验证 SDK/CLI 分层架构是否支持新模块
2. **Epic Breakdown**: 为每个 Epic 创建详细的用户故事
3. **Skills Planning**: 规划基于新 CLI 能力的场景化 Skills
4. **Sprint Planning**: 安排 Phase 1 (Epic 9-10) 的开发迭代

---

## Appendix: Module Reference

完整模块映射请参考: `docs/api/MODULE_DOC_MAPPING.json`

| 命令 | 模块 | 文档数 |
|------|------|--------|
| `account` | 账号管理 | 27 |
| `callback` | 回调设置 | 23 |
| `channel` | 频道管理 | 34 |
| `chat` | 聊天管理 | 47 |
| `product` | 商品管理 | 36 |
| `playback` | 回放管理 | 26 |
| `interaction` | 互动管理 | 35 |
| `lottery` | 抽奖管理 | 20 |
| `viewer` | 观众管理 | 18 |
| `watchCondition` | 观看条件 | 20 |
| `statistics` | 数据统计 | 29 |
| `coupon` | 优惠券 | 9 |
| `ai` | AI功能 | 12 |

---

*PRD Generated by BMAD Method v6.2*
*Last Updated: 2026-03-22*
