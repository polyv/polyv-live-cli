# PolyV API 项目侧索引

本目录存放 polyv-live-cli 仓库维护的 API 索引，用于 AI Agent、BMAD 规划和 CLI/SDK 开发。
这里不存放原始保利威 API 文档。

## 文档来源

- 原始 API 文档默认根目录：`../document-center/docs/live/api`，相对于本仓库根目录解析
- 自定义 workspace 可用环境变量覆盖：`POLYV_API_DOCS_DIR`
- 兼容缓存目录：`docs/api/`，该目录已被 `.gitignore` 排除，不作为事实来源

## 文件说明

- `MODULE_DOC_MAPPING.json`：机器可读的模块到文档映射。`modules.*.docs` 中的路径默认相对于原始 API 文档根目录；以 `docs/api-reference/` 开头的路径表示本仓库内的项目侧索引。
- `CLI_COMMANDS_GUIDE.md`：按 CLI 开发视角整理的 API 文档选择指南。
- `INDEX.md`：面向人工阅读的 API 文档树索引。
- `BUSINESS_MODULES_INDEX.md`：按业务领域整理的 API 分组，用于规划新的 CLI 能力。
- `API_INVENTORY.md`：由真实 API 文档和 SDK 源码生成的接口清单，保留同功能最高版本，并标记 SDK 是否已实现。
- `api-inventory.json`：`API_INVENTORY.md` 的机器可读数据源，便于后续 SDK 补齐和 CI 校验。
- `CLI_INVENTORY.md`：由 `api-inventory.json`、SDK 源码和 CLI 源码生成的 CLI API 使用清单，标记哪些最新 API 已被 CLI 命令面使用。
- `cli-inventory.json`：`CLI_INVENTORY.md` 的机器可读数据源，便于规划 CLI 补齐模块和追踪直接 `httpClient` 调用。
- `CLI_COMPLETION_GOALS.md`：按批次补齐 CLI 未使用 API 的 `/goal` 提示词清单。
- `SDK_COMPLETION_GOALS.md`：按批次补齐 SDK 未实现 API 的 `/goal` 提示词清单。

## 生成命令

```bash
pnpm api:inventory
pnpm cli:inventory
```
