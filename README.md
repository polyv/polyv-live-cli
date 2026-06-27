# PolyV Live CLI

<div>

[![Node Version](https://img.shields.io/node/v/polyv-live-cli?style=flat-square&color=brightgreen)](https://nodejs.org/)
[![NPM Version](https://badge.fury.io/js/polyv-live-cli.svg)](https://www.npmjs.com/package/polyv-live-cli)
[![NPM Downloads](https://img.shields.io/npm/dm/polyv-live-cli.svg)](https://www.npmjs.com/package/polyv-live-cli)
[![Coverage](https://img.shields.io/badge/coverage-93%25-brightgreen?style=flat-square)](https://github.com/polyv/polyv-live-cli/actions/workflows/ci.yml)
[![BMAD](https://bmad-badge.vercel.app/polyv/polyv-live-cli.svg)](https://github.com/bmad-code-org/BMAD-METHOD)
[![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/polyv/polyv-live-cli)
[![GitHub License](https://img.shields.io/github/license/polyv/polyv-live-cli?style=flat-square)](https://github.com/polyv/polyv-live-cli/blob/main/LICENSE)
</div>

**Agent-First** 设计的保利威直播管理命令行工具。

## Agent-First 设计理念

PolyV Live CLI 专为 AI Agent 和自动化场景设计：

- **详细帮助文档** - 每个命令都有完整的参数说明和示例
- **结构化输出** - 支持 JSON 格式输出，便于程序化处理
- **清晰错误信息** - 错误消息包含解决建议
- **原生 Skill 支持** - 支持 Claude Code、OpenClaw 等 AI Agent

### 在 AI Agent 中使用

只需告诉 AI 你想做什么，它会自动调用 CLI 完成任务：

```
用户: 帮我创建一个电商直播频道
AI Agent: [自动执行 npx polyv-live-cli@latest channel create ...]

用户: 查看昨天直播的观看数据
AI Agent: [自动执行 npx polyv-live-cli@latest statistics view ...]

用户: 给频道添加一个限时优惠券
AI Agent: [自动执行 npx polyv-live-cli@latest coupon add ...]
```

### WorkBuddy 演示

观看完整演示，了解如何在 WorkBuddy 中通过 PolyV Live CLI 完成保利威直播接入全过程。

[观看演示视频](https://polyv-cuplayer-admin.oss-cn-shenzhen.aliyuncs.com/assets/video/demo.mp4)

## AI Agent Skill

本项目提供官方 Skill，让 AI Agent（如 Claude Code、OpenClaw 等）能够智能管理直播服务。

### 功能特点

- **自动认证验证** - 执行命令前自动检查账号状态
- **完整命令参考** - 包含所有命令的详细说明和示例
- **中文文档** - 面向中文用户的完整指南
- **引用文档** - 详细的使用场景和故障排除

### 安装

```bash
npx skills add polyv/polyv-live-cli
```

> 支持 Claude Code、OpenClaw 等所有兼容 Skill 协议的 AI Agent。

### 使用示例

安装后，直接向 AI Agent 提问即可：

```
用户: 我想开始一场电商直播
AI Agent: 我来帮你设置...
         1. 创建电商频道
         2. 添加商品
         3. 创建优惠券
         4. 获取推流密钥

用户: 帮我监控直播质量
AI Agent: 正在启动直播监控...
```

## 快速开始

### 安装

```bash
# 推荐：使用 npx 直接运行（始终使用最新版）
npx --yes polyv-live-cli@latest --help

# 或全局安装
npm install -g polyv-live-cli
polyv-live-cli --help
```

### 配置认证

```bash
# 添加账号
npx --yes polyv-live-cli@latest account add myaccount --app-id <appId> --app-secret <appSecret> --user-id <userId>

# 设为默认账号
npx --yes polyv-live-cli@latest account set-default myaccount
```

### 基本使用

```bash
# 创建频道
npx --yes polyv-live-cli@latest channel create -n "新品发布会"

# 获取推流密钥（用于 OBS）
npx --yes polyv-live-cli@latest stream get-key -c <channelId>

# 查看直播状态
npx --yes polyv-live-cli@latest stream status -c <channelId>

# 查看统计数据
npx --yes polyv-live-cli@latest statistics view -c <channelId> --start-day 2026-06-01 --end-day 2026-06-20
```

## 功能模块

| 模块 | 命令 | 说明 |
|------|------|------|
| 频道管理 | `channel` | 创建、查看、更新、删除频道 |
| 推流管理 | `stream` | 获取推流密钥、开始/结束直播、质量监控 |
| 商品管理 | `product` | 添加、查看、更新、删除商品 |
| 优惠券 | `coupon` | 创建、查看、删除优惠券 |
| 回放管理 | `playback` | 查看、删除、合并回放录像 |
| 文档管理 | `document` | 上传、查看、删除直播文档 |
| 统计分析 | `statistics` | 查看观看数据、导出报告 |
| 互动工具 | `lottery` / `checkin` / `qa` / `questionnaire` / `donate` | 抽奖、签到、问答、问卷、打赏 |
| 观众与观看条件 | `viewer` / `watch-condition` / `whitelist` | 观众查询、观看鉴权、白名单 |
| 播放器与观看页 | `player` / `web` | 播放器、水印、暖场、观看页配置 |
| 场景初始化 | `setup` | 一键配置电商场景，可先用 `--dry-run` 预览 |

## 包结构

```
packages/
├── sdk/    # polyv-live-api-sdk - PolyV Live API SDK
└── cli/    # polyv-live-cli       - PolyV Live CLI 工具
```

## 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 测试
pnpm test

# 运行 CLI（开发模式）
pnpm --filter polyv-live-cli dev
```

## 发布流程

使用 Changesets 管理版本：

```bash
pnpm changeset        # 创建 changeset
pnpm changeset version # 版本升级
pnpm changeset publish # 发布
```

## 相关链接

- [SDK 文档](./packages/sdk/README.md)
- [CLI 详细文档](./packages/cli/README.md)
- [保利威直播 API 文档](https://help.polyv.net/#/live/api/)
- [保利威官网](https://www.polyv.net/)

## 联系方式

- 邮箱: support@polyv.net
- 官网: https://www.polyv.net/
- 技术支持: 400-993-9533

## Made with ❤️ by PolyV Team

> 让直播管理更简单，让开发者更高效！

## License

MIT
