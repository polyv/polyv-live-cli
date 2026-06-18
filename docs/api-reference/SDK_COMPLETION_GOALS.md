# SDK API Completion Goal Prompts

本文档用于把 `docs/api-reference/api-inventory.json` 中 `sdk.implemented=false` 的 API 分批补齐到 `packages/sdk`。

使用方式：每次只复制一个 `/goal` 提示词。当前批次完成、测试通过、重新生成清单后，再复制下一条。

当前基线来自 `pnpm api:inventory`：

| 批次 | 范围 | 当前缺口 |
| --- | --- | ---: |
| 01 | 小缺口模块：`ai`、`finance`、`group`、`material`、`web`、`chat` | 17 |
| 02 | `account` 模块 | 15 |
| 03 | `live_interaction` 模块 | 30 |
| 04 | `user` 观众记录、标签、中奖记录 | 11 |
| 05 | `user` 商品、邀约销售、自定义字段 | 10 |
| 06 | `user` 子账号、模板、回调、全局设置、账单、观看日志 | 17 |
| 07 | `channel/viewer` 后台登录态接口 | 26 |
| 08 | `channel/playback` 历史回放接口 | 10 |
| 09 | `channel/operate`、`channel/state`、`channel/marquee` 历史只读接口 | 11 |
| 10 | `channel/operate`、`channel/state`、`channel/marquee` 历史写接口 | 31 |
| 11 | `v4/channel` 核心、状态、会话、回放、字幕、统计、装修等接口 | 28 |
| 12 | `v4/channel` 抽奖、互动、任务奖励、打赏接口 | 36 |
| 13 | `v4/channel` 营销、卡片、优惠券、商品、素材、观看页动作接口 | 31 |

## 通用要求

所有 `/goal` 都默认遵循以下规则：

- 以 `docs/api-reference/api-inventory.json` 为唯一待补齐清单，只处理 `apis[]` 里 `sdk.implemented=false` 的最新 API，不处理 `supersededApis`。
- 每个 API 至少补 TypeScript 请求/响应类型、service 方法、必要的参数校验和单元测试。
- 公共签名参数 `appId`、`sign`、`timestamp`、`signatureNonce`、`signatureMethod` 继续由 `PolyVClient` 统一处理，不暴露给业务入参。
- 优先复用现有 `packages/sdk/src/services/**`、`packages/sdk/src/types/**`、测试 mock 风格和命名约定。
- 涉及新增或修正真实 API 调用路径、HTTP method、请求参数映射、响应解析时，必须同步补 `packages/sdk/tests/integration/` 下的 SDK 集成测试规范或用例，形成后续 API 的真实请求验收样例。
- SDK 集成测试默认只跑只读接口；频道相关接口应优先通过 `POLYV_CHANNEL_ID`，没有配置时可复用 CLI 已验证的频道列表能力自动发现频道。自动发现失败时要输出明确 skip 原因，不把环境限制误判为 SDK 失败。
- 写入、删除、推送、开播/停播、配置变更等会修改正式环境的集成测试必须默认跳过，只能通过显式环境变量开关启用，并使用唯一测试前缀、`finally` 清理和最小影响数据。
- 集成测试凭证从 `packages/sdk/.env` 或环境变量读取；`.env` 不提交，示例变量只写到 `packages/sdk/.env.example` 和 SDK README。
- 每批完成后运行相关 SDK 单测、`pnpm --filter polyv-live-api-sdk test:integration`、`pnpm api:inventory`、`git diff --check`，并汇报该批目标缺口从多少降到多少；如果某个集成测试因账号权限或环境数据跳过，要说明具体原因。
- 不改 CLI；如果某个 SDK 变更确实要求 CLI 跟进，先只记录原因，不在同一批里扩散。
- 不提交、不推送，除非用户另外明确要求。

## 01 小缺口模块

```text
/goal 先阅读并遵循 docs/api-reference/SDK_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/api-inventory.json 补齐小缺口模块的 SDK API。目标筛选：apis[] 中 sdk.implemented=false 且 module 属于 ai、finance、group、material、web、chat。要求：先运行 pnpm api:inventory 获取最新基线；为目标 API 补 TypeScript 类型、service 方法、必要参数校验和单元测试；保持公共签名参数由 PolyVClient 处理；优先复用现有服务类，ai 用 V4AiService，material 用 V4MaterialService，web 用 WebService，chat 用 ChatService/V4ChatService，finance/group 使用现有对应服务。完成后运行相关 SDK 单测、pnpm api:inventory、git diff --check，并汇报该批未实现数量变化。
```

## 02 Account 模块

```text
/goal 先阅读并遵循 docs/api-reference/SDK_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/api-inventory.json 补齐 account 模块的 SDK API。目标筛选：apis[] 中 sdk.implemented=false 且 module=="account"。要求：先运行 pnpm api:inventory 获取最新基线；补齐 AccountService 中缺失的账号、频道列表、功能开关、分钟数、收入、SSO token、回调设置等 API；修正清单里提示 methodMismatch 的接口时，以源文档 Method 为准，同时保留兼容性判断；补 TypeScript 类型、参数校验和单元测试。完成后运行 AccountService 相关单测、pnpm api:inventory、git diff --check，并汇报 account 缺口变化。
```

## 03 Live Interaction 模块

```text
/goal 先阅读并遵循 docs/api-reference/SDK_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/api-inventory.json 补齐 live_interaction 模块的 SDK API。目标筛选：apis[] 中 sdk.implemented=false 且 module=="live_interaction"。要求：先运行 pnpm api:inventory 获取最新基线；补齐签到、问答、问卷、抽奖、中奖信息、奖励消息、学生提问 webhook、老师回答等 API；优先放在现有 LiveInteractionService 和对应 types 文件中，必要时按子领域拆私有校验函数；每个 API 补请求/响应类型、service 方法和单元测试。完成后运行 LiveInteractionService 相关单测、pnpm api:inventory、git diff --check，并汇报 live_interaction 缺口变化。
```

## 04 User 观众记录与标签

```text
/goal 先阅读并遵循 docs/api-reference/SDK_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/api-inventory.json 补齐 user 模块中的观众记录、标签和中奖记录 API。目标筛选：apis[] 中 sdk.implemented=false 且 module=="user" 且 sourceDoc 匹配 ^v4/user/(viewerrecord/|label/|viewer_lottery_win)。要求：先运行 pnpm api:inventory 获取最新基线；在 V4UserService 中补齐观众记录 CRUD、标签 CRUD/关联、观众中奖记录查询等 API；补请求/响应类型、参数校验和单元测试。完成后运行 V4UserService 相关单测、pnpm api:inventory、git diff --check，并汇报该批缺口变化。
```

## 05 User 商品、邀约销售、自定义字段

```text
/goal 先阅读并遵循 docs/api-reference/SDK_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/api-inventory.json 补齐 user 模块中的商品、邀约销售和自定义字段 API。目标筛选：apis[] 中 sdk.implemented=false 且 module=="user" 且 sourceDoc 匹配 ^v4/user/(product/|invitesales/|customfield/)。要求：先运行 pnpm api:inventory 获取最新基线；在 V4UserService 中补齐用户商品、邀约销售、跟进观众、自定义字段和值相关 API；补请求/响应类型、参数校验和单元测试。完成后运行 V4UserService 相关单测、pnpm api:inventory、git diff --check，并汇报该批缺口变化。
```

## 06 User 设置、模板、账单与日志

```text
/goal 先阅读并遵循 docs/api-reference/SDK_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/api-inventory.json 补齐 user 模块剩余设置类 API。目标筛选：apis[] 中 sdk.implemented=false 且 module=="user" 且 sourceDoc 匹配 ^v4/user/(children/|template/|viewlog/|bill/) 或 ^v4/user/(update_callback|get_callback|update_global_footer|get_global_footer|update_pv_show_enable|get_pv_show_enable|mr_concurrency_detail|mic_duration)。要求：先运行 pnpm api:inventory 获取最新基线；在 V4UserService 中补齐子账号、模板配置、回调、全局页脚、PV 展示开关、MR 并发详情、连麦分钟数、账单、观看日志等 API；补请求/响应类型、参数校验和单元测试。完成后运行 V4UserService 相关单测、pnpm api:inventory、git diff --check，并汇报 user 模块总体缺口变化。
```

## 07 Channel Viewer 后台登录态接口

```text
/goal 先阅读并遵循 docs/api-reference/SDK_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/api-inventory.json 补齐 channel/viewer 相关 SDK API。目标筛选：apis[] 中 sdk.implemented=false 且 module=="channel" 且 sourceDoc 以 channel/viewer/ 开头。要求：先运行 pnpm api:inventory 获取最新基线；这些是 /live-bg/v3/user 与 /live-bg/v3/teacher 双前缀后台登录态接口，需要先评估现有 PolyVClient 是否适合承载 /live-bg 路径；如果需要新增 base path 或内部 service，请保持最小改动并加测试覆盖；补频道用户分组、分组配置、频道所属用户列表、未加入分组观众列表等 API。完成后运行相关 SDK 单测、pnpm api:inventory、git diff --check，并汇报该批缺口变化。
```

## 08 Channel 历史回放接口

```text
/goal 先阅读并遵循 docs/api-reference/SDK_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/api-inventory.json 补齐 channel/playback 历史回放 SDK API。目标筛选：apis[] 中 sdk.implemented=false 且 module=="channel" 且 sourceDoc 以 channel/playback/ 开头。要求：先运行 pnpm api:inventory 获取最新基线；在 ChannelService 中补齐回放列表、录制文件信息、合并、删除、添加点播、转码等历史接口；复用已有 playback/record 类型风格，补请求/响应类型、参数校验和单元测试。完成后运行 ChannelService 回放相关单测、pnpm api:inventory、git diff --check，并汇报该批缺口变化。
```

## 09 Channel 历史只读接口

```text
/goal 先阅读并遵循 docs/api-reference/SDK_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/api-inventory.json 补齐 channel 历史只读 SDK API。目标筛选：apis[] 中 sdk.implemented=false 且 module=="channel" 且 sourceDoc 以 channel/operate/、channel/state/ 或 channel/marquee/ 开头，且 method=="GET"。要求：先运行 pnpm api:inventory 获取最新基线；在 ChannelService 中补齐频道状态、广告、PPT 设置、转播关系、商品开关、API token、聊天在线人数、监控/查询类等 GET 接口；补请求/响应类型、参数校验和单元测试。完成后运行 ChannelService 相关单测、pnpm api:inventory、git diff --check，并汇报该批缺口变化。
```

## 10 Channel 历史写接口

```text
/goal 先阅读并遵循 docs/api-reference/SDK_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/api-inventory.json 补齐 channel 历史写 SDK API。目标筛选：apis[] 中 sdk.implemented=false 且 module=="channel" 且 sourceDoc 以 channel/operate/、channel/state/ 或 channel/marquee/ 开头，且 method!="GET"。要求：先运行 pnpm api:inventory 获取最新基线；在 ChannelService 中补齐创建/批量/设置/更新/删除/推送/上下架/转播/子频道/商品/PPT/云点播等历史写接口；对危险操作添加必要参数校验；补请求/响应类型和单元测试。完成后运行 ChannelService 相关单测、pnpm api:inventory、git diff --check，并汇报该批缺口变化。
```

## 11 V4 Channel 核心接口

```text
/goal 先阅读并遵循 docs/api-reference/SDK_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/api-inventory.json 补齐 v4/channel 核心 SDK API。目标筛选：apis[] 中 sdk.implemented=false 且 module=="channel" 且 sourceDoc 以这些前缀开头：v4/channel/operate/、v4/channel/session/、v4/channel/monitor、v4/channel/get_all_live_status、v4/channel/playback/、v4/channel/play-back/、v4/channel/subtitle/、v4/channel/role_config/、v4/channel/viewdata/、v4/channel/distribute/、v4/channel/decorate/、v4/channel/create_mr、v4/channel/basic_create、v4/channel/statistics/。要求：先运行 pnpm api:inventory 获取最新基线；优先补到 V4ChannelService，覆盖频道基础、角色、会话、状态、监控、回放、字幕、统计、分发、装修、MR 创建等 API；补请求/响应类型、参数校验和单元测试。完成后运行 V4ChannelService 相关单测、pnpm api:inventory、git diff --check，并汇报该批缺口变化。
```

## 12 V4 Channel 互动接口

```text
/goal 先阅读并遵循 docs/api-reference/SDK_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/api-inventory.json 补齐 v4/channel 互动 SDK API。目标筛选：apis[] 中 sdk.implemented=false 且 module=="channel" 且 sourceDoc 以这些前缀开头：v4/channel/lottery、v4/channel/task_reward/、v4/channel/interaction/、v4/channel/interaction_event/、v4/channel/reward/、v4/channel/donate/。要求：先运行 pnpm api:inventory 获取最新基线；在 V4ChannelService 中补齐抽奖活动、抽奖观众组/黑名单、福袋、互动脚本、任务奖励、奖励/点赞列表、打赏设置等 API；补请求/响应类型、参数校验和单元测试。完成后运行 V4ChannelService 相关单测、pnpm api:inventory、git diff --check，并汇报该批缺口变化。
```

## 13 V4 Channel 营销与内容接口

```text
/goal 先阅读并遵循 docs/api-reference/SDK_COMPLETION_GOALS.md 的通用要求。基于 docs/api-reference/api-inventory.json 补齐 v4/channel 营销与内容 SDK API。目标筛选：apis[] 中 sdk.implemented=false 且 module=="channel" 且 sourceDoc 以这些前缀开头：v4/channel/market/、v4/channel/coupon/、v4/channel/product、v4/channel/popularization/、v4/channel/recordfile/、v4/channel/watch/、v4/channel/chat/。要求：先运行 pnpm api:inventory 获取最新基线；在 V4ChannelService 中补齐卡片推送、分享、优惠券、频道商品和标签、商品统计/设置、推广渠道、录制文件、观看页退出、聊天开关等 API；补请求/响应类型、参数校验和单元测试。完成后运行 V4ChannelService 相关单测、pnpm api:inventory、git diff --check，并汇报 channel 模块总体缺口变化。
```

## 14 最终收口校验

```text
/goal 先阅读并遵循 docs/api-reference/SDK_COMPLETION_GOALS.md 的通用要求。对 SDK API 补齐工作做最终收口校验。要求：运行 pnpm api:inventory，确认 docs/api-reference/api-inventory.json 中 summary.sdkMissing 是否为 0；如果不为 0，按 module 和 sourceDoc 列出剩余 sdk.implemented=false API，并判断是确实未实现、文档错误、登录态接口暂不适合 SDK，还是 methodMismatch；运行完整 SDK 单测和 git diff --check；更新 docs/api-reference/API_INVENTORY.md 与 api-inventory.json；最后给出剩余风险和是否可以进入提交阶段。不要提交或推送。
```
