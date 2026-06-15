# Story 8.3: 电商场景配置 Skill

Status: done

## Story

作为新注册的电商客户，
我希望通过一个简单的流程快速配置适合电商直播的环境，
以便我能够快速体验平台能力。

## Acceptance Criteria

1. Skill 可通过 `/polyv-e-commerce-setup` 调用
2. 检测认证状态，未配置时引导用户
3. 调用 `polyv-cli setup e-commerce` 命令创建完整环境
4. 输出配置摘要和下一步指引

## Tasks / Subtasks

- [x] Task 1: 创建 Skill 目录结构 (AC: #1)
  - [x] 1.1 创建 `.claude/skills/polyv-e-commerce-setup/` 目录
  - [x] 1.2 创建 `SKILL.md` 文件
  - [x] 1.3 创建 `workflow.md` 工作流定义

- [x] Task 2: 实现认证检测 (AC: #2)
  - [x] 2.1 检测认证状态
  - [x] 2.2 未配置时显示引导信息

- [x] Task 3: 调用 setup 命令 (AC: #3)
  - [x] 3.1 调用 `polyv-cli setup e-commerce --yolo` 命令
  - [x] 3.2 处理命令执行结果

- [x] Task 4: 简化 Skill 依赖 (AC: #4)
  - [x] 4.1 移除复杂的多步骤逻辑
  - [x] 4.2 依赖 Story 8-4 的 setup 命令

## Dev Notes

### 设计说明

本 Skill 是一个**简单入口**，复杂逻辑由 Story 8-4 的 `setup` 命令处理：

```
用户调用 /polyv-e-commerce-setup
        ↓
Skill 检测认证
        ↓
调用 polyv-cli setup e-commerce --yolo
        ↓
setup 命令处理所有复杂逻辑
（创建频道、添加商品、创建优惠券）
        ↓
输出配置摘要
```

### 文件位置

| 文件类型 | 位置 |
|----------|------|
| Skill 目录 | `.claude/skills/polyv-e-commerce-setup/` |
| 工作流定义 | `.claude/skills/polyv-e-commerce-setup/workflow.md` |
| Skill 元数据 | `.claude/skills/polyv-e-commerce-setup/SKILL.md` |

### 前置依赖

- Story 8-4: 场景初始化命令（`polyv-cli setup` 命令）

## Dev Agent Record

### Agent Model Used

GLM-5

### Debug Log References

无

### Completion Notes List

- ✅ 创建了简化的 Skill 结构
- ✅ Skill 作为 setup 命令的简单入口
- ✅ 复杂逻辑委托给 setup 命令处理

### File List

- `.claude/skills/polyv-e-commerce-setup/SKILL.md` - Skill 元数据
- `.claude/skills/polyv-e-commerce-setup/workflow.md` - 工作流定义

### Change Log

- 2026-03-21: 完成 Story 8-3，简化为 setup 命令的入口
