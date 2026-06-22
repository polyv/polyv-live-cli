# 电商营销场景覆盖总索引

本目录把 `polyv-live-cli-rc` skill 的 **40 个一级命令**，逐轮转化为电商营销行业可落地的业务场景，并以**真实执行**为准沉淀为运营操作手册。

> 覆盖口径（严格遵守）：
> - **已执行成功**：使用真实账号、真实测试频道/真实测试对象执行业务命令成功。
> - **已执行失败**：使用真实测试频道/对象执行了命令，但 API 或参数报错（记录错误与排查）。
> - **仅 help 校验**：不计入已覆盖，仅放在「待执行/未覆盖」中。
> - 不允许把仅写了占位符、未真实执行的命令计入覆盖。

每个场景文档都包含：专用测试频道、命令执行台账、执行/验证结果、风险点与回滚/清理方式、保留资产说明、可复用模板。

---

## 一、场景列表

| 序号 | 场景 | 业务阶段 | 覆盖一级命令 | 文档 |
|---|---|---|---|---|
| 01 | 直播间优惠券承接（满减券配置+频道绑定+领券开关） | 预热 / 转化 | `account`、`channel`、`coupon` | [01-coupon-redemption.md](./01-coupon-redemption.md) |
| 02 | 新品直播首发（商品上架+商品卡片节奏推送） | 转化 / 互动 | `account`、`channel`、`product`、`card-push` | [02-product-card-push.md](./02-product-card-push.md) |
| 03 | 直播互动抽奖促活（多条件福袋配置+生命周期演练） | 互动 / 转化 | `account`、`channel`、`lottery` | [03-live-lottery.md](./03-live-lottery.md) |
| 04 | 售前答疑与问卷收集（新品首发购买意向摸底+答疑卡编排） | 预热 / 互动 / 数据复盘 | `account`、`channel`、`questionnaire`、`qa` | [04-presale-qa-questionnaire.md](./04-presale-qa-questionnaire.md) |
| 05 | 会员专享直播（白名单观看+观看条件鉴权+VIP 成员全生命周期） | 治理 / 预热 | `account`、`channel`、`whitelist`、`watch-condition` | [05-member-exclusive-whitelist.md](./05-member-exclusive-whitelist.md) |

---

## 二、覆盖统计

- **已覆盖一级命令**：10 / 40
  - `account`（每个场景写入前的账号预检，真实执行）
  - `channel`（场景 01、02、03、04、05：建测试频道 + 验证）
  - `coupon`（场景 01：建券 + 绑定频道 + 开领券开关 + 验证）
  - `product`（场景 02：上架主打款+引流款 + 商品大卡推送/取消 + 列表验证）
  - `card-push`（场景 02：建手动秒杀卡 + 观看触发红包卡 + push/cancel 状态流转验证）
  - `lottery`（场景 03：建 none/duration/invite 三类福袋 + 列表/详情/更新加码/删除全生命周期；comment 类型已执行失败并记录）
  - `questionnaire`（场景 04：建 2 张售前问卷 + detail 验证题目落库 + legacy-list 列出；V4 list 对未发布问卷返回空已记录）
  - `qa`（场景 04：qa list 只读验证；qa add-edit 新建答题卡已执行失败并记录 CLI 三层限制）
  - `whitelist`（场景 05：rank2 白名单 add 3 名 VIP + list/keyword 搜索 + update 会员升级换码 + remove 删除演练全生命周期，均前后对比验证）
  - `watch-condition`（场景 05：get 查询鉴权现状成功；set 写入 rank1 已执行失败并记录「返回 success:true 但配置未持久化」静默问题）
- **未覆盖一级命令**：30 / 40（见下表「未覆盖」）

> 进度：10 / 40 = 25%。距离停止条件（40 / 40 全部至少被一个场景真实执行覆盖）仍需继续逐轮补充场景。

---

## 三、业务阶段说明

| 阶段 | 含义 |
|---|---|
| 预热 | 开播前的预约、配置、券/商品/资料准备 |
| 开播 | 频道、推流、场次、状态相关 |
| 转化 | 优惠券、商品、卡片推送、推广渠道等促单 |
| 互动 | 签到、抽奖、问答、问卷、打赏、聊天等拉活 |
| 复购 | 回放、录制、二次触达 |
| 数据复盘 | 统计、观众、行为分析 |
| 治理 | 账号、平台、白名单、观看条件、风控、财务 |

---

## 四、40 个一级命令覆盖矩阵

> 状态：✅ 已执行成功 / ❌ 已执行失败 / ⏳ 仅 help 校验 / ⬜ 未覆盖
> `account` 为所有场景写入前的共享预检命令，在首个场景中即被真实执行覆盖。

| # | 一级命令 | 覆盖场景 | 执行状态 | 测试频道 ID | 文档 |
|---|---|---|---|---|---|
| 1 | `account` | 01（写入前预检，共享） | ✅ 已执行成功 | — | [01](./01-coupon-redemption.md) |
| 2 | `ai` | — | ⬜ 未覆盖 | — | — |
| 3 | `card-push` | 02 | ✅ 已执行成功 | 7983883 | [02](./02-product-card-push.md) |
| 4 | `channel` | 01、02、03、04、05 | ✅ 已执行成功 | 7983877 / 7983883 / 7983885 / 7983889 / 7983898 | [01](./01-coupon-redemption.md)、[02](./02-product-card-push.md)、[03](./03-live-lottery.md)、[04](./04-presale-qa-questionnaire.md)、[05](./05-member-exclusive-whitelist.md) |
| 5 | `chat` | — | ⬜ 未覆盖 | — | — |
| 6 | `checkin` | — | ⬜ 未覆盖 | — | — |
| 7 | `coupon` | 01 | ✅ 已执行成功 | 7983877 | [01](./01-coupon-redemption.md) |
| 8 | `custom-field` | — | ⬜ 未覆盖 | — | — |
| 9 | `document` | — | ⬜ 未覆盖 | — | — |
| 10 | `donate` | — | ⬜ 未覆盖 | — | — |
| 11 | `finance` | — | ⬜ 未覆盖 | — | — |
| 12 | `global` | — | ⬜ 未覆盖 | — | — |
| 13 | `group` | — | ⬜ 未覆盖 | — | — |
| 14 | `interaction` | — | ⬜ 未覆盖 | — | — |
| 15 | `invite-sales` | — | ⬜ 未覆盖 | — | — |
| 16 | `lottery` | 03 | ✅ 已执行成功 | 7983885 | [03](./03-live-lottery.md) |
| 17 | `material` | — | ⬜ 未覆盖 | — | — |
| 18 | `monitor` | — | ⬜ 未覆盖 | — | — |
| 19 | `partner` | — | ⬜ 未覆盖 | — | — |
| 20 | `platform` | — | ⬜ 未覆盖 | — | — |
| 21 | `playback` | — | ⬜ 未覆盖 | — | — |
| 22 | `player` | — | ⬜ 未覆盖 | — | — |
| 23 | `product` | 02 | ✅ 已执行成功 | 7983883 | [02](./02-product-card-push.md) |
| 24 | `promotion` | — | ⬜ 未覆盖 | — | — |
| 25 | `qa` | 04 | ✅ 已执行成功 | 7983889 | [04](./04-presale-qa-questionnaire.md) |
| 26 | `questionnaire` | 04 | ✅ 已执行成功 | 7983889 | [04](./04-presale-qa-questionnaire.md) |
| 27 | `record` | — | ⬜ 未覆盖 | — | — |
| 28 | `robot` | — | ⬜ 未覆盖 | — | — |
| 29 | `session` | — | ⬜ 未覆盖 | — | — |
| 30 | `setup` | — | ⬜ 未覆盖 | — | — |
| 31 | `statistics` | — | ⬜ 未覆盖 | — | — |
| 32 | `stream` | — | ⬜ 未覆盖 | — | — |
| 33 | `transmit` | — | ⬜ 未覆盖 | — | — |
| 34 | `use` | — | ⬜ 未覆盖 | — | — |
| 35 | `user` | — | ⬜ 未覆盖 | — | — |
| 36 | `viewer` | — | ⬜ 未覆盖 | — | — |
| 37 | `watch-condition` | 05 | ✅ 已执行成功 ¹ | 7983898 | [05](./05-member-exclusive-whitelist.md) |
| 38 | `web` | — | ⬜ 未覆盖 | — | — |
| 39 | `webapp` | — | ⬜ 未覆盖 | — | — |
| 40 | `whitelist` | 05 | ✅ 已执行成功 | 7983898 | [05](./05-member-exclusive-whitelist.md) |

> ¹ `watch-condition` 的 `get` 真实执行成功；`set` 真实执行但**已执行失败**——对所有 `--auth-type`（phone/code/none）与 config-file 路径均返回 `success:true` 但配置未持久化（rank1 始终停留 custom），详见 [场景 05 第 12 节](./05-member-exclusive-whitelist.md)。`watch-condition` 命令族已被真实执行覆盖（get 成功），会员专享鉴权门由 rank2 默认 phone 白名单承载。

---

## 五、变更记录

- 2026-06-22：新增场景 01「直播间优惠券承接」，真实执行覆盖 `account`、`channel`、`coupon`（测试频道 `7983877`，领券开关已打开并验证）。
- 2026-06-22：新增场景 02「新品直播首发 — 商品上架 + 商品卡片节奏推送」，真实执行覆盖 `product`、`card-push`（测试频道 `7983883`，上架 2 件商品，建 2 张卡片并验证 pushStatus N→Y→L 流转）。累计覆盖 5 / 40。
- 2026-06-22：新增场景 03「直播互动抽奖促活 — 多条件福袋配置 + 生命周期演练」，真实执行覆盖 `lottery`（测试频道 `7983885`，建 none/duration/invite 三类福袋，演练列表/详情/更新加码/删除全生命周期；`--type comment` 真实执行失败并记录「活动时长不能为空」）。累计覆盖 6 / 40。
- 2026-06-22：新增场景 04「售前答疑与问卷收集 — 新品首发购买意向摸底 + 答疑卡编排」，真实执行覆盖 `questionnaire`、`qa`（测试频道 `7983889`，建 2 张售前问卷并 detail/legacy-list 验证落库；记录 V4 `questionnaire list` 对未发布问卷返回空、`qa add-edit` 因 CLI 三层强制 question-id 非空无法新建两条问题）。累计覆盖 8 / 40。
- 2026-06-22：新增场景 05「会员专享直播 — 白名单观看 + 观看条件鉴权 + VIP 成员全生命周期」，真实执行覆盖 `whitelist`、`watch-condition`（测试频道 `7983898`，rank2 白名单 add 3 名 VIP + keyword 搜索 + update 会员升级换码 + remove 删除演练全生命周期并前后对比验证；`watch-condition get` 成功，`watch-condition set` 已执行失败并记录「返回 success:true 但 rank1 配置未持久化」静默问题，会员专享鉴权门由 rank2 默认 phone 白名单承载）。累计覆盖 10 / 40。
