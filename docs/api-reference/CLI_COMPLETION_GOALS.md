# CLI API Completion Goal Prompts

本文档用于把 `docs/api-reference/cli-inventory.json` 中 `cli.used=false` 的最新 API 分批补齐到 `packages/cli` 命令面。

使用方式：每次只复制一个 `/goal` 提示词。当前批次完成、测试通过、重新生成清单后，再复制下一条。

当前基线来自 `pnpm cli:inventory`：

| 批次 | 范围 | 当前缺口 |
| --- | --- | ---: |
| 00 | 现有 CLI API 调用收口：直接 HTTP、旧版/额外 endpoint、未解析 SDK 调用 | 14 direct HTTP + 11 extra + 1 unresolved |
| 01 | AI 视频制作能力 | 10 |
| 02 | `account`、`platform`、`global` 设置能力 | 34 |
| 03 | 小缺口后台/工具模块：`group`、`finance`、`material`、`webapp`、`player`、`robot`、`statistics`、`root`、`uncategorized` | 54 |
| 04 | `web` 观看页配置 | 34 |
| 05 | `chat` 聊天治理能力 | 31 |
| 06 | `live_interaction` 互动能力 | 20 |
| 07 | `user` 观众记录、标签、中奖记录 | 14 |
| 08 | `user` 商品、邀约销售、自定义字段 | 18 |
| 09 | `user` 子账号、组织、模板、账单、观看日志、全局设置 | 31 |
| 10 | `channel/viewer` 后台登录态频道用户与分组接口 | 26 |
| 11 | `channel` 回放、文档、场次、录制文件接口 | 39 |
| 12 | `channel` 历史 operate/state/marquee 接口 | 56 |
| 13 | `v4/channel` 核心、状态、会话、字幕、分发、装修等接口 | 32 |
| 14 | `v4/channel` 抽奖、互动、任务奖励、打赏接口 | 38 |
| 15 | `v4/channel` 营销、优惠券、商品、素材、观看页动作接口 | 20 |
| 16 | `channel` 统计、鉴权、监控、播放器、暖场等剩余接口 | 24 |

## 通用要求

所有 `/goal` 都默认遵循以下规则：

- 以 `docs/api-reference/cli-inventory.json` 为唯一待补齐清单，只处理 `apis[]` 里 `cli.used=false` 的最新 API，不处理“旧版/额外 CLI 调用”作为新命令目标。
- 每批开始先运行 `pnpm cli:inventory` 获取最新基线；必要时也运行 `pnpm api:inventory` 确认 SDK 覆盖仍为 100%。
- CLI 当前通过 `polyv-live-api-sdk: workspace:*` 引用本地 SDK 包，但 SDK 包入口指向 `packages/sdk/dist`；如果使用新 SDK 方法，先运行 `pnpm --filter polyv-live-api-sdk build`，再运行 CLI 构建或测试。
- 新增命令优先复用 `packages/cli/src/commands`、`handlers`、`services`、`types` 的既有分层；命令只做参数定义和格式校验，业务调用放到 handler/service。
- 优先复用 SDK service 方法。不要为已经有 SDK 方法的 API 新增 CLI 直接 `httpClient` 调用；如 SDK 方法缺少导出、类型或路径有问题，先修 SDK 并补测试，再接 CLI。
- 现有直接 `httpClient` 调用可以作为迁移对象；新增能力默认不扩大直接 HTTP 使用面。
- 命令命名要符合现有 CLI 风格：查询用 `get/list`，创建用 `create/add`，更新用 `update/set`，删除用 `delete/remove`；批量能力用 `batch-*` 或子命令分组。
- 对删除、清空、推送、开播/停播、批量写入、配置变更等高风险命令，必须保留确认流程或显式 `--force`，支持 `-o json`，能 dry-run 的场景优先提供 `--dry-run`。
- 每个新增命令至少补 command 注册测试、handler/service 单元测试、格式化输出测试和真实 CLI 集成测试；涉及参数映射的 API 要覆盖 table/json 两种输出。
- CLI 是面向外部用户的交付物，集成测试必须覆盖真实命令链路；默认使用 `packages/cli/tests/helpers/cli-runner.ts` 通过 `node packages/cli/dist/index.js ...` 启动本地 CLI 子进程，不直接 import handler/service/SDK 代替用户命令。
- 集成测试使用 `packages/cli/.env.test` 或测试环境变量中的账号作为测试账号；该测试账号允许写入、修改、删除数据。测试 helper 会隔离 `HOME`，避免开发者本机 `~/.polyv/accounts.json` 默认账号污染结果；业务命令认证优先级为 `--account`/命令行参数 > 会话账号 > 环境变量 > 默认账号 > 旧全局配置。
- 写数据测试应使用唯一测试前缀、`--force`/非交互参数和 `try/finally` 或 `afterEach/afterAll` 清理，避免遗留大量脏数据，但不要因为接口会改数据就默认跳过。
- 账号凭据从 `.env.test`/环境变量或现有 auth adapter/config manager 读取，不在测试和文档中写真实 AppSecret。
- 现有历史集成测试中仍有直接 import SDK/service 的用例；补齐新命令或重构旧命令时，应同步迁移到 `cli-runner.ts` 的真实 CLI 子进程模式。
- 每批完成后运行相关 CLI 单测和集成测试、`pnpm --filter polyv-live-cli build`、`pnpm cli:inventory`、`git diff --check`，并汇报该批缺口从多少降到多少。
- 如果新增命令改变发布版 skill 的可用语法，后续需要同步 `skills/polyv-live-cli/SKILL.md` 和相关 references；不要在同一批里顺手改无关 skill 示例。
- 不提交、不推送，除非用户另外明确要求。

## 00 现有调用收口

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/cli-inventory.json 收口现有 CLI API 调用技术债。目标：unmatchedUsages 中的 11 条旧版/额外 endpoint、summary.cliDirectHttpUsages 的 14 条直接 httpClient 调用、summary.cliUnresolvedSdkUsages 的 1 条未解析 SDK 调用。要求：先运行 pnpm cli:inventory 获取最新基线；把 ai、card-push、promotion、transmit、donate、lottery 等已有直接 HTTP 或旧路径调用迁移到 SDK 最新 service 方法；若 SDK 最新方法缺少类型导出或 dist 未更新，先修 SDK 并运行 pnpm --filter polyv-live-api-sdk build；修复 LiveInteractionService#addEditQuestionnaire 无法解析的问题；完成后运行相关 CLI/SDK 单测和 CLI 集成测试、pnpm cli:inventory、git diff --check，并汇报 direct HTTP、unmatched、unresolved 数量变化。
```

## 01 AI 视频制作能力

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/cli-inventory.json 补齐 AI 视频制作相关 CLI 命令。目标筛选：apis[] 中 cli.used=false 且 module=="ai"。要求：先运行 pnpm cli:inventory 获取最新基线；扩展现有 ai 命令，在 ai digital-human 已有能力之外补 ai video-produce、tts-voice、ppt 上传/异步上传/查询/列表、视频创作任务创建/查询/列表/删除等命令；优先复用 V4AiService；所有列表命令支持分页和 -o json；创建/删除类命令提供确认或 --force。完成后运行 ai 相关 CLI 单测和集成测试、pnpm --filter polyv-live-cli build、pnpm cli:inventory、git diff --check，并汇报 ai 缺口变化。
```

## 02 Account、Platform 与 Global 设置

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/cli-inventory.json 补齐 account、platform、global 相关 CLI 命令。目标筛选：apis[] 中 cli.used=false 且 module 属于 account、platform、global。要求：先运行 pnpm cli:inventory 获取最新基线；扩展 account 命令补直播分类、频道列表/详情、可用分钟数、收入详情、SSO token、回调设置、功能开关等能力；扩展 platform 命令补主播、开放平台配置、回调/开关/全局设置等缺失能力；必要时新增 global 命令组承载全局设置接口；写入类命令必须有确认或 --force。完成后运行 account/platform/global 相关 CLI 单测和集成测试、pnpm --filter polyv-live-cli build、pnpm cli:inventory、git diff --check，并汇报该批缺口变化。
```

## 03 小缺口后台与工具模块

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/cli-inventory.json 补齐小缺口后台和工具模块 CLI 命令。目标筛选：apis[] 中 cli.used=false 且 module 属于 group、finance、material、webapp、player、robot、statistics、root、uncategorized。要求：先运行 pnpm cli:inventory 获取最新基线；新增或扩展 group、finance、material、webapp、player、robot、statistics 等命令组；root/uncategorized 需要先阅读 actualDocumentPath 判断业务归属，再挂到最合适的命令组，不要新增含义不清的 uncategorized 命令；审核、素材删除、角色权限、机器人暂停/更新等写入类命令必须有确认或 --force。完成后运行相关 CLI 单测和集成测试、pnpm --filter polyv-live-cli build、pnpm cli:inventory、git diff --check，并汇报该批缺口变化。
```

## 04 Web 观看页配置

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/cli-inventory.json 补齐 web 模块 CLI 命令。目标筛选：apis[] 中 cli.used=false 且 module=="web"。要求：先运行 pnpm cli:inventory 获取最新基线；新增 web 命令组或在 player/watch-condition/whitelist 下扩展合适子命令，覆盖暖场、主持人、频道名称/Logo、点赞、倒计时、菜单、图文、打赏、微信分享、观看条件、白名单、外部授权、登记表、图片上传等观看页配置；优先复用 WebService；配置变更命令必须支持 -o json 并提供确认或 --force。完成后运行 web/watch-condition/whitelist/player 相关 CLI 单测和集成测试、pnpm --filter polyv-live-cli build、pnpm cli:inventory、git diff --check，并汇报 web 缺口变化。
```

## 05 Chat 聊天治理

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/cli-inventory.json 补齐 chat 模块 CLI 命令。目标筛选：apis[] 中 cli.used=false 且 module=="chat"。要求：先运行 pnpm cli:inventory 获取最新基线；扩展现有 chat 命令，补敏感词、禁言 IP、全局禁言/踢人列表、公告、消息审核、隐藏消息、角色信息、教师/管理员信息、机器人相关查询等能力；已有 send/list/delete/ban/kick 命令不要破坏兼容；删除、清空、封禁类命令必须有确认或 --force。完成后运行 chat 相关 CLI 单测和集成测试、pnpm --filter polyv-live-cli build、pnpm cli:inventory、git diff --check，并汇报 chat 缺口变化。
```

## 06 Live Interaction 互动能力

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/cli-inventory.json 补齐 live_interaction 模块 CLI 命令。目标筛选：apis[] 中 cli.used=false 且 module=="live_interaction"。要求：先运行 pnpm cli:inventory 获取最新基线；扩展 checkin、qa、questionnaire、lottery，必要时新增 interaction 命令组，覆盖签到、问答、问卷、抽奖、中奖信息、奖励消息、老师回答、学生提问 webhook 等缺失接口；优先复用 LiveInteractionService；创建/停止/删除类命令提供确认或 --force。完成后运行互动相关 CLI 单测和集成测试、pnpm --filter polyv-live-cli build、pnpm cli:inventory、git diff --check，并汇报 live_interaction 缺口变化。
```

## 07 User 观众记录、标签、中奖记录

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/cli-inventory.json 补齐 user 模块中的观众记录、标签和中奖记录 CLI 命令。目标筛选：apis[] 中 cli.used=false 且 module=="user" 且 sourceDoc 匹配 ^v4/user/(viewerrecord/|label/|viewer_lottery_win)。要求：先运行 pnpm cli:inventory 获取最新基线；扩展 viewer 和 viewer tag 命令，覆盖观众记录 CRUD、标签 CRUD/关联、观众中奖记录查询等能力；复用 V4UserService；批量关联/移除标签命令要支持输入校验和清晰失败输出。完成后运行 viewer 相关 CLI 单测和集成测试、pnpm --filter polyv-live-cli build、pnpm cli:inventory、git diff --check，并汇报该批缺口变化。
```

## 08 User 商品、邀约销售、自定义字段

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/cli-inventory.json 补齐 user 模块中的商品、邀约销售和自定义字段 CLI 命令。目标筛选：apis[] 中 cli.used=false 且 module=="user" 且 sourceDoc 匹配 ^v4/user/(product/|invitesales/|customfield/)。要求：先运行 pnpm cli:inventory 获取最新基线；扩展 product 命令以覆盖用户商品库、商品标签、订单查询/状态更新；新增或扩展 invite-sales/custom-field 命令覆盖邀约销售、跟进观众、自定义字段和值相关接口；写入和批量更新命令必须有确认或 --force。完成后运行 product/user 相关 CLI 单测和集成测试、pnpm --filter polyv-live-cli build、pnpm cli:inventory、git diff --check，并汇报该批缺口变化。
```

## 09 User 设置、模板、组织与日志

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/cli-inventory.json 补齐 user 模块剩余设置类 CLI 命令。目标筛选：apis[] 中 cli.used=false 且 module=="user" 且 sourceDoc 匹配 ^v4/user/(children/|organization/|template/|viewlog/|bill/) 或 ^v4/user/(get_pv_show_enable|update_pv_show_enable|get_global_footer|update_global_footer|mic_duration|sms_send|mr_concurrency_detail)。要求：先运行 pnpm cli:inventory 获取最新基线；新增或扩展 user 命令组，覆盖子账号、组织、模板、观看日志、账单、全局页脚、PV 展示开关、短信发送、MR 并发详情、连麦分钟数等接口；只读命令优先完成，写入类命令必须有确认或 --force。完成后运行 user 相关 CLI 单测和集成测试、pnpm --filter polyv-live-cli build、pnpm cli:inventory、git diff --check，并汇报 user 模块总体缺口变化。
```

## 10 Channel Viewer 后台登录态接口

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/cli-inventory.json 补齐 channel/viewer 相关 CLI 命令。目标筛选：apis[] 中 cli.used=false 且 module=="channel" 且 sourceDoc 以 channel/viewer/ 开头。要求：先运行 pnpm cli:inventory 获取最新基线；这些是 /live-bg/v3/user 与 /live-bg/v3/teacher 双前缀后台登录态接口，需要先确认 SDK 方法、认证来源和 baseUrl 选择；扩展 viewer 或 channel viewer 命令，覆盖频道用户分组、分组配置、频道所属用户列表、导入/导出、未加入分组观众列表等能力；导入、删除、批量转移命令必须有确认或 --force，并支持文件输入校验。完成后运行相关 CLI/SDK 单测和 CLI 集成测试、pnpm --filter polyv-live-cli build、pnpm cli:inventory、git diff --check，并汇报该批缺口变化。
```

## 11 Channel 回放、文档、场次、录制

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/cli-inventory.json 补齐 channel 回放、文档、场次和录制文件相关 CLI 命令。目标筛选：apis[] 中 cli.used=false 且 module=="channel" 且 sourceDoc 匹配 ^channel/(playback/|doc/|session/|record) 或 ^v4/channel/(recordfile/|playback/|play-back/|session/)。要求：先运行 pnpm cli:inventory 获取最新基线；扩展 playback、document、session、record 命令，覆盖回放列表/详情/开关/排序/标题、录制文件合并/转码/断点、文档和多媒体资源关联、场次外部 ID 关联等接口；删除、转码、合并、关联类命令必须有确认或 --force。完成后运行 playback/document/session/record 相关 CLI 单测和集成测试、pnpm --filter polyv-live-cli build、pnpm cli:inventory、git diff --check，并汇报该批缺口变化。
```

## 12 Channel 历史 Operate/State/Marquee

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/cli-inventory.json 补齐 channel 历史 operate/state/marquee CLI 命令。目标筛选：apis[] 中 cli.used=false 且 module=="channel" 且 sourceDoc 以 channel/operate/、channel/state/ 或 channel/marquee/ 开头。要求：先运行 pnpm cli:inventory 获取最新基线；扩展 channel、stream、product、chat、transmit 等现有命令，覆盖频道状态、广告、角色、回调、PPT 设置、转播关系、商品开关、API token、聊天在线人数、云点播、跑马灯、推流恢复/断流等接口；该批接口历史风格混杂，必须逐个核对 SDK 方法与请求形态；危险操作必须有确认或 --force。完成后运行相关 CLI 单测和集成测试、pnpm --filter polyv-live-cli build、pnpm cli:inventory、git diff --check，并汇报该批缺口变化。
```

## 13 V4 Channel 核心接口

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/cli-inventory.json 补齐 v4/channel 核心 CLI 命令。目标筛选：apis[] 中 cli.used=false 且 module=="channel" 且 sourceDoc 以这些前缀开头：v4/channel/operate/、v4/channel/monitor、v4/channel/get_all_live_status、v4/channel/subtitle/、v4/channel/role_config/、v4/channel/viewdata/、v4/channel/distribute/、v4/channel/decorate/、v4/channel/create_mr、v4/channel/basic_create、v4/channel/statistics/。要求：先运行 pnpm cli:inventory 获取最新基线；扩展 channel、monitor、statistics、player 等命令，覆盖频道基础、角色、状态、监控、字幕、统计、分发、装修、MR 创建等接口；优先复用 V4ChannelService；批量更新和配置变更命令必须有确认或 --force。完成后运行 V4ChannelService 接入相关 CLI 单测和集成测试、pnpm --filter polyv-live-cli build、pnpm cli:inventory、git diff --check，并汇报该批缺口变化。
```

## 14 V4 Channel 互动接口

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/cli-inventory.json 补齐 v4/channel 互动 CLI 命令。目标筛选：apis[] 中 cli.used=false 且 module=="channel" 且 sourceDoc 以这些前缀开头：v4/channel/lottery、v4/channel/task_reward/、v4/channel/interaction/、v4/channel/interaction_event/、v4/channel/reward/、v4/channel/donate/。要求：先运行 pnpm cli:inventory 获取最新基线；扩展 lottery、donate，必要时新增 interaction/task-reward 子命令，覆盖抽奖活动新版准确路径、抽奖观众组/黑名单、福袋、互动脚本、互动监听事件、任务奖励、奖励/点赞列表、打赏设置等接口；把现有 lottery 旧路径调用迁移到最新 SDK 方法；创建、更新、删除、停止类命令必须有确认或 --force。完成后运行 lottery/donate/interaction 相关 CLI 单测和集成测试、pnpm --filter polyv-live-cli build、pnpm cli:inventory、git diff --check，并汇报该批缺口变化。
```

## 15 V4 Channel 营销与内容接口

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/cli-inventory.json 补齐 v4/channel 营销与内容 CLI 命令。目标筛选：apis[] 中 cli.used=false 且 module=="channel" 且 sourceDoc 以这些前缀开头：v4/channel/market/、v4/channel/coupon/、v4/channel/product、v4/channel/product_setting/、v4/channel/product_stats/、v4/channel/product_tag/、v4/channel/popularization/、v4/channel/watch/、v4/channel/chat/。要求：先运行 pnpm cli:inventory 获取最新基线；扩展 card-push、coupon、product、promotion、chat 等命令，覆盖分享、频道优惠券、频道商品和标签、商品统计/设置、推广渠道、观看页退出、聊天开关等接口；把现有 card-push/promotion 直接 HTTP 调用迁移到 SDK；写入类命令必须有确认或 --force。完成后运行营销相关 CLI 单测和集成测试、pnpm --filter polyv-live-cli build、pnpm cli:inventory、git diff --check，并汇报该批缺口变化。
```

## 16 Channel 剩余接口

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/cli-inventory.json 补齐 channel 模块剩余 CLI 命令。目标筛选：apis[] 中 cli.used=false 且 module=="channel" 且未被 docs/api-reference/CLI_COMPLETION_GOALS.md 第 10 到第 15 批覆盖。要求：先运行 pnpm cli:inventory 获取最新基线；覆盖频道统计、鉴权 token、监控拉流地址、批量创建、播放器片头/暂停页/Logo、暖场开关/视频/图片、v4 channel update 等剩余接口；按业务归属扩展 channel、statistics、stream、player 命令，不新增含义不清的杂项命令；写入类命令必须有确认或 --force。完成后运行相关 CLI 单测和集成测试、pnpm --filter polyv-live-cli build、pnpm cli:inventory、git diff --check，并汇报 channel 模块总体缺口变化。
```

## 17 最终收口校验

```text
/goal 先阅读并遵循 docs/api-reference/CLI_COMPLETION_GOALS.md 的通用要求。对 CLI API 补齐工作做最终收口校验。要求：运行 pnpm api:inventory 和 pnpm cli:inventory，确认 docs/api-reference/cli-inventory.json 中 summary.cliMissingLatestApis 是否为 0；如果不为 0，按 module、sourceDoc 和建议命令路径列出剩余 cli.used=false API，并判断是确实未接入、命令价值低暂缓、需要 SDK/dist 修复、登录态接口暂不适合 CLI，还是清单匹配问题；确认 summary.cliDirectHttpUsages、summary.cliUnmatchedEndpointUsages、summary.cliUnresolvedSdkUsages 是否可接受；运行完整 CLI 单测和集成测试、pnpm --filter polyv-live-cli build、git diff --check；更新 docs/api-reference/CLI_INVENTORY.md、cli-inventory.json 和必要 README；最后给出剩余风险和是否可以进入提交阶段。不要提交或推送。
```
