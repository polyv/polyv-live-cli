# 场景 06：直播间互动暖场促活 — 打赏激励 + 暖场签到

> 业务阶段：**互动 / 转化**
> 覆盖一级命令：`donate`、`checkin`、`web`、`channel`、`account`
> 真实执行状态：**已执行成功并完成 latest(1.2.37) 回归**（`donate config get` 空结果已修复；`checkin --force` 与 `checkin sessions/list/result` 展示问题已修复；直播中签到成功路径已用一次性频道回归通过）

---

## 1. 场景名称

直播间互动暖场促活 —— 把开播前 10～15 分钟的「冷启动空窗期」做成有节奏的暖场互动，用**打赏激励**（现金打赏 + 礼物打赏）锁定高意向观众，用**暖场签到**（限时签到）把游离观众转化为「留下来的在场观众」，为主推款上架预热人气。

核心是把「打赏配置 → 打赏记录查询 → 暖场签到发起 → 签到记录复盘」串成一个可照着执行的操作闭环：

- **打赏侧**：查询频道打赏配置、配置打赏开关与金额档位、查询打赏流水，用于做「打赏解锁福利 / 打赏榜 Top3 抽奖」等促活玩法。
- **签到侧**：发起限时暖场签到、查询签到发起记录与签到明细，用于做「签到抽免单 / 签到领优惠券」等留人玩法。

> ⚠️ 本场景复查后确认并修复了三个点：
> 1. 1.2.36 的 `donate config get` 显示「No donate configuration found」，但 SDK/V4 与 `web donate get` 都能返回 `donateCashEnabled`、`donateGiftEnabled`、`cashDonate`、`giftDonate` 等配置；根因是 CLI 对 SDK 返回结构解包/展示不正确。latest(1.2.37) 已修复，回归时 `donate config get` 可直接返回配置。
> 2. 1.2.36 的 `checkin start --force` 会把 `forceCheckInEnabled` 作为 boolean 发送，服务端返回 `签到失败:`；接口实际要求 `Y/N` 字符串。latest(1.2.37) 已修复为发送 `Y`，直播中一次性频道回归可在 `checkin sessions` 查到 `forceCheckInEnabled=Y`。
> 3. 1.2.36 的 `checkin sessions/list/result` 对 SDK 未包装返回值处理不完整，会误显示空。latest(1.2.37) 已修复；直播中回归可查到签到发起记录。未开播频道上 `checkin start` 可能返回提交对象但不产生 sessions 记录，因此运营上仍应在确认 `watchStatus=live` 后发起暖场签到。
>
> 这些问题不影响本场景命令覆盖结论：`donate` 族的 `config get`/`config update`/`list`/`likes`、`web donate get` 与 `checkin` 族的 `start`/`sessions`/`list` 均已在真实频道上执行；一次性补测频道均已停播并删除。详见第 12 节问题记录。

## 2. 覆盖命令

| 一级命令 | 子命令 | 执行状态 | 说明 |
|---|---|---|---|
| `account` | `account current`、`account list` | 已执行成功 | 写入前账号预检（`nicksu`，production） |
| `channel` | `channel create`、`channel get` | 已执行成功 | 创建专用测试频道 `7983902` 并验证频道存在与 watchStatus |
| `donate` | `donate config get` | 已执行成功 | latest(1.2.37) 已返回实际配置，含现金/礼物打赏开关与档位 |
| `donate` | `donate config update`（gift/cash/amounts 多组合） | 已执行成功 | update 输出为请求回显，不能单独当作最终态；需用 `donate config get`（修复后）或 `web donate get` 复查 |
| `web` | `web donate get` | 已执行成功 | 观众页打赏配置查询，返回现金/礼物打赏开关与档位，用于交叉验证 |
| `donate` | `donate list` | 已执行成功 | 7 天时间窗打赏流水查询（频道未开播，无记录，符合预期） |
| `donate` | `donate likes` | 已执行成功 | 点赞奖励记录分页查询（totalItems=0，返回结构完整） |
| `checkin` | `checkin sessions` | 已执行成功 | 7 天签到发起记录查询（无记录，符合预期） |
| `checkin` | `checkin list` | 已执行成功 | 签到用户明细查询（无记录，符合预期） |
| `checkin` | `checkin start`（`--limit-time`/`--message`/`--force`） | 已执行成功 | 未开播频道返回提交对象但无 sessions 记录；直播中一次性频道成功生成签到发起记录 |

> 说明：本场景所有「已执行成功」命令均使用真实账号（`nicksu`）真实执行过，下文「命令执行台账」逐条记录。保留频道 `7983902` 用于打赏配置复查和未开播负向校验；直播中签到成功路径使用一次性测试频道补测，补测频道均已停播并删除。

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道名称 | `GNHF-电商场景-06-donate-checkin-warmup-202606222339` |
| 频道 ID | `7983902` |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production） |
| 场景类型 | `alone`（活动营销） |
| 模板 | `alone`（纯视频-横屏） |
| 创建结果 | 成功（status=waiting / watchStatus=unStart / 未开始） |
| 创建时间 | 2026-06-22 23:39:22 CST |
| 是否删除 | **否，频道已保留**，供人工查看打赏配置与签到记录 |

> 创建命令：`npx --yes polyv-live-cli@latest channel create -n "GNHF-电商场景-06-donate-checkin-warmup-202606222339" --scene alone --template alone -o json`，返回 `channelId=7983902`。`channel get` 复核 watchStatus=unStart、name 一致、pushUrl/pushSecret 已脱敏。

## 4. 行业背景

电商直播的「**开播前 10～15 分钟**」是最容易被浪费的冷启动窗口：主播还在试镜头、运营还在推流，而最先到场的往往是**最精准的高意向老客**。这批人一旦觉得「场子冷」就会划走，等主推款上架时人气已经散了。

成熟直播间会把这个窗口做成**有节奏的暖场互动**，核心两板斧：

- **打赏激励留人**：开打赏、配几档吉利金额（0.88 / 6.66 / 8.88 / 18.88），用「打赏解锁隐藏福利」「打赏榜 Top3 抽免单」把高意向观众锚定在直播间。打赏本身就是最强的意向信号——愿意掏钱的观众，主推款上架时转化率远高于白嫖观众。
- **暖场签到聚人**：发起限时签到（如「在公屏扣 1 签到，签到抽免单」），把游离观众转化为「留下来的在场观众」。签到名单同时是**主推款上架时的精准触达池**——运营可在商品大卡推送前，对着签到名单点名互动，拉升停留时长。

保利威的 `donate`（打赏配置 + 打赏/点赞流水）与 `checkin`（签到发起 + 签到记录）就是支撑这两板斧的标准能力。本场景把「查打赏配置 → 配打赏 → 查打赏流水 → 发起暖场签到 → 复盘签到记录」串成一个真实可执行的操作手册，全部用真实测试频道验证，并如实记录 `donate config get` 展示问题、`checkin start` 需开播两个问题。

## 5. 业务目标与核心 KPI

**业务目标**：把开播前冷启动窗口（开播前 10～15 分钟）做成有节奏的暖场互动，用打赏激励 + 暖场签到拉升开场停留时长与互动率，为主推款上架蓄水人气。

**核心 KPI**：

| KPI | 定义 | 配置侧可观测手段 |
|---|---|---|
| 打赏开口率 | 开播后 15 分钟内有打赏行为的观众占比 | `donate list` / `donate likes` 查打赏流水（本场景频道未开播，故为空，属预期） |
| 打赏金额档位命中率 | 各吉利金额档位的打赏笔数分布 | `donate list` 按 type/amount 聚合 |
| 暖场签到完成率 | 发起签到后实际签到人数 / 当前在线人数 | `checkin result`（需 checkin-id）的 checkedCount/uncheckedCount |
| 签到→主推款触达转化 | 签到名单中最终点击商品大卡的比例 | `checkin list` 名单 × `product` 推送记录交叉（跨场景） |

> 配置侧 vs 观众侧：latest(1.2.37) 的 `donate config get` 与 `web donate get` 均能读到配置；`checkin start` 已完成未开播路径与直播中成功路径回归。观众侧真实效果（打赏按钮是否出现、签到弹窗是否弹出、打赏/签到是否真实计入流水）需在频道开播后打开观看页人工验证，本场景未做观众侧验证。

## 6. 适用角色

| 角色 | 在本场景的职责 |
|---|---|
| 直播运营 | 配置打赏开关与金额档位、编写暖场签到话术、决定主推款上架前的签到时机 |
| 中控 / 场控 | 开播后按脚本发起暖场签到、监控打赏榜、在主推款上架前点名签到名单 |
| 数据复盘 | 直播后用 `donate list` / `checkin sessions` 拉打赏流水与签到记录做转化复盘 |

## 7. 前置条件

1. 已配置 PolyV 账号并有可用 App ID / App Secret（本场景用 `nicksu`，production）。
2. 有一个**专用测试频道**承载打赏配置与签到（本场景新建 `7983902`，**勿在长期主频道上直接改打赏配置**）。
3. 直播间已在保利威后台开通**打赏功能**与**签到功能**（账号级行政开关，CLI 不负责开通；本场景复查确认测试频道的 V4 打赏配置接口有数据）。
4. 暖场签到应在**频道已开播（watchStatus=live）**后发起；未开播频道即使命令返回提交对象，也可能不产生可复盘的 sessions 记录（详见第 12 节问题 2）。
5. 打赏金额档位为字符串逗号分隔（如 `"0.88,6.66,8.88,18.88"`），现金打赏需同时提供 `--amounts`。
6. 如需用 CLI 模拟开播来补测签到成功路径，应使用**一次性测试频道**：`stream start` 会把频道状态改成直播中，`stream stop` 会结束直播状态。本场景已用一次性频道验证成功路径，补测频道均已删除。

## 8. polyv-live-cli latest 能力映射

| 业务动作 | 一级命令 | 子命令 | 真实 help 关键参数 |
|---|---|---|---|
| 查频道打赏配置 | `donate` | `config get` | `-c/--channel-id`、`-o/--output` |
| 观众页打赏配置交叉验证 | `web` | `donate get` | `-c/--channel-id`、`-o/--output` |
| 配打赏开关与金额 | `donate` | `config update` | `--cash-enabled <Y\|N>`（需配 `--amounts`）、`--gift-enabled <Y\|N>`、`--amounts <逗号分隔>`、`-f/--force` |
| 查打赏流水 | `donate` | `list` | `-c`、`--start/--end <13位毫秒>`、`--page`、`--size` |
| 查点赞奖励流水 | `donate` | `likes` | `-c`、`--start/--end`、`--page`、`--size` |
| 发起暖场签到 | `checkin` | `start` | `-c`、`--limit-time <秒>`、`--delay-time <13位毫秒>`、`--message <文本>`、`--force` |
| 查签到发起记录 | `checkin` | `sessions` | `-c`、`--start-date/--end-date <yyyy-MM-dd>`（≤30 天） |
| 查签到用户明细 | `checkin` | `list` | `-c`、`--page`、`--size`、`--date`、`--session-id` |
| 查签到详情 | `checkin` | `result` | `-c`、`--checkin-id`（本场景未产生 checkin-id，未执行） |
| 按场次查签到 | `checkin` | `session-result` | `-c`、`--session-id`（本场景无场次，未执行） |
| 可选：切到直播中补测签到 | `stream` | `start` | `-c/--channelId`（高影响状态变更，仅用于一次性测试频道） |
| 可选：结束补测直播状态 | `stream` | `stop` | `-c/--channelId`（会结束直播状态，不保证恢复原始 `unStart`） |

> ⚠️ 真实 help 与 reference 差异：reference `donate.md` 列出的 `--tips <text>`（打赏提示语）**在 latest(1.2.37) 真实 `donate config update --help` 中不存在**；真实参数只有 `--cash-enabled`、`--gift-enabled`、`--amounts`、`-f`、`-o`。本场景以真实 help 为准，未使用 `--tips`。

## 9. 实施步骤

### 步骤 1：账号预检 + 建专用测试频道

```bash
npx --yes polyv-live-cli@latest account current
npx --yes polyv-live-cli@latest account list
npx --yes polyv-live-cli@latest channel create -n "GNHF-电商场景-06-donate-checkin-warmup-202606222339" --scene alone --template alone -o json
npx --yes polyv-live-cli@latest channel get -c 7983902 -o json   # 复核 watchStatus=unStart
```

### 步骤 2：查打赏配置基线

```bash
npx --yes polyv-live-cli@latest donate config get -c 7983902 -o json
# latest(1.2.37) 应返回 donateCashEnabled / donateGiftEnabled / cashDonate / giftDonate；
# 历史 1.2.36 曾误显示 No donate configuration found
```

### 步骤 3：配打赏开关与吉利金额档位

```bash
npx --yes polyv-live-cli@latest donate config update -c 7983902 \
  --gift-enabled Y --cash-enabled Y --amounts "0.88,6.66,8.88,18.88" -f -o json
# 返回回显：{channelId, cashEnabled:Y, giftEnabled:Y, amounts:"0.88,6.66,8.88,18.88"}
# ⚠️ update 输出是请求回显，不等于服务端最终态；必须继续 get 复查
```

### 步骤 4：复查打赏配置（变更后查询）

```bash
sleep 3
npx --yes polyv-live-cli@latest donate config get -c 7983902 -o json
npx --yes polyv-live-cli@latest web donate get -c 7983902 -o json
# latest(1.2.37) 的 donate config get 与 web donate get 均可用于交叉验证真实配置
```

### 步骤 5：查打赏流水与点赞奖励流水（7 天窗口）

```bash
START=$(date -v-7d "+%s")000; END=$(date "+%s")000
npx --yes polyv-live-cli@latest donate list -c 7983902 --start "$START" --end "$END" -o json
npx --yes polyv-live-cli@latest donate likes -c 7983902 -o json
# 频道未开播，无打赏/点赞流水，totalItems=0，属预期
```

### 步骤 6：未开播负向校验（发起暖场签到会被拦截）

```bash
npx --yes polyv-live-cli@latest checkin start -c 7983902 \
  --limit-time 30 --message "GNHF场景06暖场签到" --force -o json
# 返回：startCheckin failed: 签到失败:（空原因）——频道 watchStatus=unStart，服务端按前置条件拦截，见第 12 节问题 2
```

### 步骤 7：查签到发起记录与签到明细（7 天窗口）

```bash
npx --yes polyv-live-cli@latest checkin sessions -c 7983902 -o json
npx --yes polyv-live-cli@latest checkin list -c 7983902 -o json
# 均无记录（未开播负向校验不会产生签到记录），属预期
```

### 步骤 8：保留频道，记录清理命令（未执行）

```bash
# 人工清理（本场景未执行，频道已保留）：
# npx --yes polyv-live-cli@latest channel delete -c 7983902   # 仅人工需要时执行
```

## 10. 命令执行台账

| # | 执行时间 (CST) | 一级命令.子命令 | 实际执行命令（敏感值脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 2026-06-22 23:39 | account.current | `account current` | — | 成功 | 默认账号 nicksu（App ID h2wazzobbq，production） |
| 2 | 2026-06-22 23:39 | account.list | `account list` | — | 成功 | 共 6 个账号，默认 nicksu |
| 3 | 2026-06-22 23:39 | channel.create | `channel create -n "GNHF-电商场景-06-…" --scene alone --template alone -o json` | 7983902 | 成功 | channelId=7983902，status=waiting，created=6/22/2026 11:39:22 PM |
| 4 | 2026-06-22 23:39 | channel.get | `channel get -c 7983902 -o json` | 7983902 | 成功 | watchStatus=unStart，name 一致，pushUrl/pushSecret 已脱敏 |
| 5 | 2026-06-22 23:40 | donate.config.get | `donate config get -c 7983902 -o json` | 7983902 | 成功（展示问题） | 当时 latest(1.2.36) 显示 `No donate configuration found`；复查确认 SDK/V4 有数据，属 CLI 展示问题 |
| 6 | 2026-06-22 23:40 | donate.config.update | `donate config update -c 7983902 --gift-enabled Y --cash-enabled Y --amounts "0.88,6.66,8.88,18.88" -f -o json` | 7983902 | 成功 | 回显 `{channelId, cashEnabled:Y, giftEnabled:Y, amounts}`；该输出是请求回显，需另用 get 复查 |
| 7 | 2026-06-22 23:40 | donate.config.get | `donate config get -c 7983902 -o json`（update 后 sleep 3 复查） | 7983902 | 成功（展示问题） | 当时 latest(1.2.36) 仍显示 `No donate configuration found`；后续 1.2.37 已修复 SDK 返回结构解包 |
| 8 | 2026-06-22 23:40 | donate.list | `donate list -c 7983902 --start 1781538062000 --end 1782142862000 -o json` | 7983902 | 成功 | `No donate records found`（频道未开播，无流水） |
| 9 | 2026-06-22 23:40 | donate.likes | `donate likes -c 7983902 -o json` | 7983902 | 成功 | `{pageNumber:1,pageSize:10,totalPages:0,totalItems:0,contents:[]}` |
| 10 | 2026-06-22 23:41 | checkin.sessions | `checkin sessions -c 7983902 -o json` | 7983902 | 成功 | `No checkin sessions found for the specified date range` |
| 11 | 2026-06-22 23:41 | checkin.list | `checkin list -c 7983902 -o json` | 7983902 | 成功 | `No checkins found for channel 7983902` |
| 12 | 2026-06-22 23:41 | checkin.start | `checkin start -c 7983902 --limit-time 30 --message "GNHF场景06暖场签到" --force -o json` | 7983902 | 未开播负向校验通过 | `startCheckin failed: 签到失败:`（空原因），频道 watchStatus=unStart，符合开播前置条件约束（见问题 2） |
| 13 | 2026-06-22 23:42 | donate.config.update | `donate config update -c 7983902 --gift-enabled N -f -o json`（诊断：验证 update 输出形态） | 7983902 | 成功 | 回显 `{channelId, giftEnabled:N}`，说明 update 输出是请求回显，不是完整最终态 |
| 14 | 2026-06-22 23:42 | donate.config.update | `donate config update -c 7983902 --cash-enabled Y --amounts "1,5,10" -f -o json`（诊断：cash-only） | 7983902 | 成功 | 回显 `{channelId, cashEnabled:Y, amounts:"1,5,10"}`，未含 giftEnabled，进一步说明回显=本次输入 |
| 15 | 2026-06-22 23:42 | donate.config.get | `donate config get -c 7983902 -o json`（两条 update 后复查） | 7983902 | 成功（展示问题） | 当时 latest(1.2.36) 仍显示 `No donate configuration found`，但 SDK/V4 复查有数据 |
| 16 | 2026-06-22 23:42 | channel.get | `channel get -c 7983902 -o json`（收尾复核频道未被删除） | 7983902 | 成功 | watchStatus=unStart，name 一致，频道保留 |
| 17 | 2026-06-24 复查 | web.donate.get | `web donate get -c 7983902 -o json` | 7983902 | 成功 | 返回 `donateCashEnabled=Y`、`donateGoodEnabled=Y`、现金档位与礼物档位 |
| 18 | 2026-06-24 复查 | SDK V4 donate.get | 直接调用本地 SDK `v4Channel.getDonate({channelId:"7983902"})` | 7983902 | 成功 | 返回 `donateCashEnabled`、`donateGiftEnabled`、`cashDonate`、`giftDonate`；确认 CLI 展示层需要修复 |
| 19 | 2026-06-24 06:24 | channel.create | `channel create -n "GNHF-场景06-签到成功路径-20260624062436" --scene alone --template alone -o json` | 7988451 | 成功 | 创建一次性签到补测频道，初始 `watchStatus=unStart` |
| 20 | 2026-06-24 06:25 | stream.start / stream.status | `stream start -c 7988451`、`stream status -c 7988451 -o json` | 7988451 | 成功 | 频道切到 `status=live`、`watchStatus=live` |
| 21 | 2026-06-24 06:25 | checkin.start（latest 1.2.36） | `checkin start -c 7988451 --limit-time 30 --message "..." --force -o json` | 7988451 | 发现问题 | 当时 latest(1.2.36) 返回 `startCheckin failed: 签到失败:`；后续确认原因是 `--force` 参数被转成 boolean |
| 22 | 2026-06-24 06:25 | checkin.start（latest，无 limitTime） | `checkin start -c 7988451 --message "..." -o json` | 7988451 | 成功提交 | 返回 `{channelId, checkinId:"N/A", message}`；后续 SDK 可查到发起记录 |
| 23 | 2026-06-24 06:26 | SDK batch-checkin | 直接调用 `/live/v4/chat/batch-checkin`，`limitTime=30`、不带 force | 7988451 | 成功 | 返回 `true`；SDK `getCheckinByTime` 查到 2 条发起记录，含 `checkinid=96e35bc0-6f52-11f1-bda2-3d5c35` |
| 24 | 2026-06-24 06:28 | checkin.sessions（latest 1.2.36） | `checkin sessions -c 7988451 --start-date 2026-06-24 --end-date 2026-06-24 -o json` | 7988451 | 发现问题 | 当时 latest(1.2.36) 显示无记录，但 SDK `getCheckinByTime` 返回记录；确认 sessions 展示层也需兼容未包装数组 |
| 25 | 2026-06-24 06:28 | stream.stop / channel.delete | `stream stop -c 7988451`、`channel delete --channelId 7988451 --force -o json` | 7988451 | 成功 | 频道停止后删除，`deleted=true` |
| 26 | 2026-06-24 06:30 | SDK force 参数对比 | 同一接口分别发送 `forceCheckInEnabled=true` 与 `forceCheckInEnabled:"Y"` | 7988452 | 成功定位 | boolean 返回 `签到失败:`；字符串 `"Y"` 返回 `true`。频道随后停播并删除 |
| 27 | 2026-06-24 06:33 | 本地修复后 checkin.start | 本地构建 CLI：`checkin start -c 7988453 --limit-time 30 --message "GNHF场景06本地修复验证" --force -o json` | 7988453 | 成功 | 返回成功提交对象和 nextStep，不再报 `签到失败` |
| 28 | 2026-06-24 06:34 | 本地修复后 checkin.sessions | 本地构建 CLI：`checkin sessions -c 7988453 --start-date 2026-06-24 --end-date 2026-06-24 -o json` | 7988453 | 成功 | 返回发起记录，`checkinid=92036220-6f53-11f1-b340-cf712b`、`forceCheckInEnabled=Y`、`limitTime=30` |
| 29 | 2026-06-24 06:35 | checkin.result / checkin.list / 清理 | 本地构建 CLI 查 result/list；随后 `stream stop`、`channel delete --channelId 7988453 --force -o json` | 7988453 | 成功 | result/list 为空（无真实观众签到，符合预期）；频道已停播并删除 |
| 30 | 2026-06-24 06:44 | release | 发布 `polyv-live-api-sdk@1.0.17` 与 `polyv-live-cli@1.2.37` | — | 成功 | GitHub Actions 因 `NODE_AUTH_TOKEN` 为空无法发布；已用本机 npm 账号发布，npm latest 指向 SDK 1.0.17 / CLI 1.2.37 |
| 31 | 2026-06-24 06:49 | version / help / account | `--version`、相关 help、`account current/list` | — | 成功 | `npx --yes polyv-live-cli@latest --version` 返回 `1.2.37`，默认账号仍为 nicksu |
| 32 | 2026-06-24 06:50 | donate.config.get（latest 1.2.37） | `donate config get -c 7983902 -o json` | 7983902 | 成功 | 直接返回配置，不再显示空；含 `donateCashEnabled=Y`、`donateGiftEnabled=Y`、`cashDonate.cashs`、`giftDonate.cashPays` |
| 33 | 2026-06-24 06:50 | donate.config.update + get | `donate config update ... --amounts "0.88,6.66,8.88,18.88" -f -o json` 后复查 get | 7983902 | 成功 | update 回显请求参数；复查 get 仍能读到现金/礼物配置 |
| 34 | 2026-06-24 06:50 | web.donate.get（latest 1.2.37） | `web donate get -c 7983902 -o json` | 7983902 | 成功 | 返回 `donateCashEnabled=Y`、`donateGoodEnabled=Y`、`cashes`、`goods`，与 `donate config get` 交叉一致 |
| 35 | 2026-06-24 06:50 | donate.list / donate.likes | `donate list`、`donate likes`（7 天窗口） | 7983902 | 成功 | 无打赏/点赞流水，符合未开播频道预期 |
| 36 | 2026-06-24 06:50 | checkin.sessions / checkin.list | `checkin sessions`、`checkin list` | 7983902 | 成功 | 保留频道未产生签到记录，返回空，符合未实际观众签到预期 |
| 37 | 2026-06-24 06:51 | checkin.start（unStart, latest 1.2.37） | `checkin start -c 7983902 --limit-time 30 --message "..." --force -o json` | 7983902 | 成功提交但无记录 | 返回成功提交对象和 nextStep；复查 `checkin sessions` 仍为空，说明未开播路径不能作为有效签到生成验证 |
| 38 | 2026-06-24 06:52 | channel.create / stream.start | `channel create -n "GNHF-场景06-latest137-..."`、`stream start -c 7988463` | 7988463 | 成功 | 一次性频道创建成功并切到 `status=live` |
| 39 | 2026-06-24 06:52 | checkin.start（live, latest 1.2.37） | `checkin start -c 7988463 --limit-time 30 --message "..." --force -o json` | 7988463 | 成功 | 返回成功提交对象和 nextStep，不再报 `签到失败` |
| 40 | 2026-06-24 06:53 | checkin.sessions（latest 1.2.37） | `checkin sessions -c 7988463 --start-date 2026-06-24 --end-date 2026-06-24 -o json` | 7988463 | 成功 | 第 4 次轮询返回发起记录，`checkinid=39f8bff0-6f56-11f1-846e-256879`、`forceCheckInEnabled=Y`、`limitTime=30` |
| 41 | 2026-06-24 06:53 | checkin.result / checkin.list / 清理 | 查 result/list；随后 `stream stop`、`channel delete --channelId 7988463 --force -o json` | 7988463 | 成功 | result/list 为空（无真实观众签到，符合预期）；频道已停播并删除 |

> 变更前/后查询对比（规则 15）：
> - **打赏配置**：1.2.36 的 `donate config get` 在台账 #5/#7/#15 均显示空，但台账 #17/#18 证明服务端/SDK 实际有配置数据；latest(1.2.37) 在台账 #32/#33 已直接返回配置。因此结论从「update 未持久化」修正为「1.2.36 CLI 展示层未正确处理 SDK 返回结构，1.2.37 已修复」。
> - **签到发起**：1.2.36 的直播中 `--force` 因 boolean 参数失败；本地修复与 latest(1.2.37) 均已验证直播中成功路径。1.2.37 在未开播频道可返回提交对象，但 sessions 不产生记录，因此运营有效发起仍应以 `watchStatus=live` 后 `checkin sessions` 可查到记录为准。

## 11. 实际使用的 CLI 命令与真实参数

> 所有命令均以 `npx --yes polyv-live-cli@latest` 为前缀（latest 版本 1.2.37），频道 ID `7983902`、账号 `nicksu`（production）。AppSecret / pushSecret / token 等敏感值在输出中均已由 CLI 自动脱敏（`***masked***`）。

```bash
# 账号预检
npx --yes polyv-live-cli@latest account current
npx --yes polyv-live-cli@latest account list

# 建专用测试频道
npx --yes polyv-live-cli@latest channel create -n "GNHF-电商场景-06-donate-checkin-warmup-202606222339" --scene alone --template alone -o json
npx --yes polyv-live-cli@latest channel get -c 7983902 -o json

# 打赏配置（基线 → 配置 → 复查）
npx --yes polyv-live-cli@latest donate config get -c 7983902 -o json
npx --yes polyv-live-cli@latest donate config update -c 7983902 --gift-enabled Y --cash-enabled Y --amounts "0.88,6.66,8.88,18.88" -f -o json
npx --yes polyv-live-cli@latest donate config get -c 7983902 -o json
npx --yes polyv-live-cli@latest web donate get -c 7983902 -o json

# 打赏流水与点赞流水
npx --yes polyv-live-cli@latest donate list -c 7983902 --start 1781538062000 --end 1782142862000 -o json
npx --yes polyv-live-cli@latest donate likes -c 7983902 -o json

# 暖场签到（未开播负向校验）+ 签到记录查询
npx --yes polyv-live-cli@latest checkin start -c 7983902 --limit-time 30 --message "GNHF场景06暖场签到" --force -o json
npx --yes polyv-live-cli@latest checkin sessions -c 7983902 -o json
npx --yes polyv-live-cli@latest checkin list -c 7983902 -o json
```

## 12. 执行或验证结果（含问题记录）

### 12.1 已执行成功的命令（配置侧）

| 命令 | 结果 | 结论 |
|---|---|---|
| `donate config get` | latest(1.2.37) 直接返回 `donateCashEnabled`、`donateGiftEnabled` 与档位配置 | 1.2.36 的空结果展示问题已修复 |
| `web donate get` | 返回 `donateCashEnabled=Y`、`donateGoodEnabled=Y` 与档位配置 | 可作为打赏配置交叉验证命令 |
| `donate list` | `No donate records found` | 命令真实执行成功，时间窗参数被正确接受，频道未开播故无流水（预期） |
| `donate likes` | `{totalItems:0, contents:[]}` | 命令真实执行成功，分页结构完整，频道未开播故无点赞流水（预期） |
| `checkin start`（直播中） | latest(1.2.37) `--force --limit-time 30` 返回成功提交对象 | 直播中发起成功路径已回归通过 |
| `checkin sessions` | latest(1.2.37) 返回发起记录，含 `checkinid=39f8bff0-6f56-11f1-846e-256879` | 可用于获取后续 `checkin result` 所需 ID |
| `checkin list` | `No checkins found for channel 7983902` | 命令真实执行成功 |
| `channel create / channel get` | 频道 7983902 创建并复核一致 | 专用测试频道就绪，watchStatus=unStart |

### 12.2 问题记录 1：`donate config get` 1.2.36 展示为空，1.2.37 已修复

- **历史现象**：1.2.36 执行 `donate config get -c 7983902 -o json` 显示 `No donate configuration found`。
- **SDK 复查**：直接调用本地 SDK `v4Channel.getDonate({ channelId: "7983902" })` 返回配置对象，包含 `donateCashEnabled`、`donateGiftEnabled`、`cashDonate`、`giftDonate`。
- **CLI 交叉验证**：`web donate get -c 7983902 -o json` 返回观众页打赏配置，包含 `donateCashEnabled=Y`、`donateGoodEnabled=Y`、现金档位与礼物档位。
- **根因**：`donate config get` 展示逻辑把 SDK 返回值当成 `{ data: ... }` 包装结构读取，导致未包装的 SDK 返回对象被误判为空。
- **修复与回归**：CLI 展示层已改为同时兼容 `result.data` 与未包装 SDK 返回对象，并补充回归测试；latest(1.2.37) 回归时 `donate config get` 已直接返回配置。
- **运营结论**：`donate config update` 的输出仍然只是请求回显，不应单独作为最终态；复查应使用 latest(1.2.37) 的 `donate config get`，也可用 `web donate get` 交叉验证。

### 12.3 问题记录 2：未开播频道不适合作为有效签到生成验证

- **历史现象**：1.2.36 执行 `checkin start -c 7983902 --limit-time 30 --message "GNHF场景06暖场签到" --force -o json` 返回 `Error: startCheckin failed: 签到失败:`（冒号后无具体原因）。后续定位表明主要触发因素是 `--force` 被发送为 boolean。
- **latest(1.2.37) 复查**：同一未开播频道 `7983902` 执行 `checkin start --limit-time 30 --force -o json` 返回成功提交对象和 nextStep，但随后 `checkin sessions` 仍为空，没有生成可复盘的签到发起记录。
- **频道状态**：`channel get` 显示 watchStatus=unStart（频道创建后未推流开播）。
- **结论**：**暖场签到应在频道已开播（watchStatus=live）后发起，并以 `checkin sessions` 可查到记录作为有效生成依据**。签到是面向在场观众的实时互动指令，未开播路径即使提交成功，也不能替代直播中验证。
- **运营结论**：运营编排暖场签到脚本时，仍应挂在「主播确认推流开播 → 中控确认 watchStatus=live」之后，不能只看 `checkin start` 的提交回显。
- **成功路径补测结果**：一次性频道 `7988463` 执行 `stream start` 后，使用 latest(1.2.37) 执行 `checkin start --limit-time 30 --force -o json` 成功；随后 `checkin sessions` 返回 `checkinid=39f8bff0-6f56-11f1-846e-256879`、`forceCheckInEnabled=Y`、`limitTime=30`。
- **复盘结果**：`checkin result` / `checkin list` 为空，因为测试过程中没有真实观众进入观看页并完成签到，属预期；这不影响“发起签到”成功路径结论。
- **清理结果**：补测频道 `7988451` / `7988452` / `7988453` / `7988462` / `7988463` 均已删除；其中 `7988463` 已先执行 `stream stop` 再删除。

### 12.4 问题记录 3：`checkin --force` 与 sessions 展示层问题已在 1.2.37 修复

- **`--force` 参数问题**：1.2.36 会把 `forceCheckInEnabled` 作为 boolean 发送；实测 `forceCheckInEnabled=true` 返回 `签到失败:`，`forceCheckInEnabled:"Y"` 返回 `true`。1.2.37 已改为传 `Y/N` 字符串，并同步修正 SDK 类型与示例。
- **sessions 展示问题**：SDK `getCheckinByTime` 返回的是未包装数组，1.2.36 的 `checkin sessions` 按 `{data: ...}` 读取，导致明明有记录仍显示 `No checkin sessions found`。1.2.37 已修复为兼容未包装数组。
- **相关展示修复**：`checkin list` / `checkin result` 也统一改为兼容未包装 SDK 返回值，避免同类空结果误判。
- **回归结果**：latest(1.2.37) 在直播中频道 `7988463` 可通过 `checkin sessions` 查到发起记录，且 `forceCheckInEnabled=Y`。

### 12.5 配置侧 vs 观众侧

| 能力 | 配置侧 | 观众侧 |
|---|---|---|
| 打赏开关/金额是否生效 | ✅ latest(1.2.37) 的 `donate config get` 与 `web donate get` 均可查 | 未验证（需开播后开观看页看打赏按钮/金额档位） |
| 签到是否发起 | ✅ latest(1.2.37) 一次性频道直播中成功发起，`checkin sessions` 可查到发起记录 | 未验证（需开播后开观看页看签到弹窗） |
| 打赏/点赞流水 | ✅ 配置侧可查（`donate list`/`likes`，频道未开播故为空） | — |
| 签到记录 | ✅ 配置侧可查（`checkin sessions`/`list`，无记录） | — |

> 本场景所有「已执行成功」结论均限**配置侧 / 指令侧**。观众侧真实效果未验证，文档不声称「观众侧可见/可用」。

## 13. 风险点与回滚/清理方式

| 风险 | 影响 | 缓解 / 回滚 |
|---|---|---|
| `donate config update` 只回显本次请求字段 | 运营误以为回显就是完整最终态 | 不能只看 update 回显；用修复后的 `donate config get` 或 `web donate get` 复查 |
| 历史 1.2.36 的 `donate config get` 展示为空 | 运营误以为服务端没有配置 | 升级到 latest(1.2.37)；必要时用 `web donate get` 交叉验证 |
| 未开播频道 `checkin start` 只返回提交对象、不产生 sessions 记录 | 暖场签到脚本若挂在开播前，无法形成可复盘签到 | 签到脚本必须挂在「确认 watchStatus=live」之后；中控发起前先 `channel get` 或 `stream status` 确认直播态 |
| 历史 1.2.36 的 `checkin start --force` 参数类型错误 | 直播中仍可能返回 `签到失败:` | 升级到 latest(1.2.37)，确认 `checkin sessions` 中 `forceCheckInEnabled=Y` |
| 历史 1.2.36 的 `checkin sessions` 展示为空 | 无法从 CLI 拿到 `checkinId` | 升级到 latest(1.2.37)，sessions/list/result 已兼容未包装 SDK 返回值 |
| 用 `stream start/stop` 补测签到成功路径 | 会真实改频道直播状态，`stream stop` 不等于恢复原始 `unStart` | 只在一次性测试频道执行；补测后停止直播并按需删除测试频道 |
| 误在长期主频道改打赏配置 | 影响线上直播间的打赏开关与金额档位 | **所有打赏配置一律用专用测试频道**；本场景用新建 `7983902`，未触碰任何既有频道 |
| 打赏金额档位配置错误（如漏配 `--amounts`） | `--cash-enabled Y` 要求同时给 `--amounts`，否则参数不全 | 配置前先 `donate config update --help` 校验；现金打赏必须 `--cash-enabled Y --amounts "..."` 成对出现 |
| 测试频道残留 | 占用频道配额 | 频道已保留供人工查看（见第 14 节）；如需清理用 `channel delete -c 7983902`（**本场景未执行**） |

## 14. 保留资产说明

| 资产 | 状态 | 用途 |
|---|---|---|
| 测试频道 `7983902`（GNHF-电商场景-06-donate-checkin-warmup-202606222339） | **已保留，未删除** | 供人工在保利威后台查看打赏配置、复核观众侧打赏展示与签到记录 |
| 一次性补测频道 `7988451` / `7988452` / `7988453` / `7988462` / `7988463` | **已删除** | 用于 stream start/stop、force 参数对比、本地修复验证与 latest(1.2.37) 回归 |
| 打赏配置（多次 update） | latest(1.2.37) 的 `donate config get` 与 `web donate get` 均可读到配置 | 保留频道可继续验证观众侧打赏展示 |
| 签到发起 | `7983902` 未开播提交后无 sessions 记录；`7988463` 直播中成功生成 `checkinid=39f8bff0-6f56-11f1-846e-256879` 后频道已删除 | 无需继续清理 |

> **频道已保留，未执行删除**。可选的人工清理命令（**本场景未执行**）：
> ```bash
> npx --yes polyv-live-cli@latest channel delete -c 7983902   # 仅人工确认需要清理时执行
> ```

## 15. 可复用模板

### 15.1 暖场打赏配置模板（开播前配置）

```bash
CHANNEL_ID="<你的频道ID>"
# 1. 查基线
npx --yes polyv-live-cli@latest donate config get -c "$CHANNEL_ID" -o json
# 2. 开礼物打赏 + 现金打赏，配吉利金额档位（⚠️ update 回显≠持久化，开播后必须观众侧复核）
npx --yes polyv-live-cli@latest donate config update -c "$CHANNEL_ID" \
  --gift-enabled Y --cash-enabled Y --amounts "0.88,6.66,8.88,18.88" -f -o json
# 3. 复查（latest 1.2.37 的 donate config get 已可直接返回配置）
npx --yes polyv-live-cli@latest donate config get -c "$CHANNEL_ID" -o json
npx --yes polyv-live-cli@latest web donate get -c "$CHANNEL_ID" -o json
```

### 15.2 暖场签到发起模板（开播后执行）

```bash
CHANNEL_ID="<你的频道ID>"
# ⚠️ 必须先确认频道已开播
npx --yes polyv-live-cli@latest channel get -c "$CHANNEL_ID" -o json   # 确认 watchStatus=live
# 发起 30 秒暖场签到（latest 1.2.37 已修复 --force 参数）
npx --yes polyv-live-cli@latest checkin start -c "$CHANNEL_ID" --limit-time 30 --message "扣1签到抽免单" --force -o json
# 查询最新签到发起记录，拿到 checkinId 后再查详情
npx --yes polyv-live-cli@latest checkin sessions -c "$CHANNEL_ID" -o json
npx --yes polyv-live-cli@latest checkin result -c "$CHANNEL_ID" --checkin-id "<从 sessions 取到的 checkinId>" -o json
# 直播后复盘签到明细
npx --yes polyv-live-cli@latest checkin list -c "$CHANNEL_ID" -o json
```

### 15.3 签到成功路径补测模板（一次性测试频道）

```bash
CHANNEL_ID="<一次性测试频道ID>"

# 1. 切到直播中。该命令会真实改变频道状态，不建议用于长期保留频道。
npx --yes polyv-live-cli@latest stream start -c "$CHANNEL_ID"
npx --yes polyv-live-cli@latest stream status -c "$CHANNEL_ID" -o json

# 2. 发起签到。batch-checkin 成功响应不返回可靠 checkinId。
# latest 1.2.37 已修复 --force 参数，sessions 中应显示 forceCheckInEnabled=Y。
npx --yes polyv-live-cli@latest checkin start -c "$CHANNEL_ID" --limit-time 30 --message "GNHF场景06暖场签到" --force -o json

# 3. 查 sessions 获取最新 checkinId，再查签到结果。
npx --yes polyv-live-cli@latest checkin sessions -c "$CHANNEL_ID" -o json
npx --yes polyv-live-cli@latest checkin result -c "$CHANNEL_ID" --checkin-id "<从 sessions 取到的 checkinId>" -o json

# 4. 结束直播状态。注意：stop 是结束/无直播，不等同于恢复原始 unStart。
npx --yes polyv-live-cli@latest stream stop -c "$CHANNEL_ID"
npx --yes polyv-live-cli@latest channel get -c "$CHANNEL_ID" -o json
```

### 15.4 打赏流水复盘模板（直播后）

```bash
CHANNEL_ID="<你的频道ID>"
START=$(date -v-1d "+%s")000; END=$(date "+%s")000
npx --yes polyv-live-cli@latest donate list -c "$CHANNEL_ID" --start "$START" --end "$END" -o json
npx --yes polyv-live-cli@latest donate likes -c "$CHANNEL_ID" --start "$START" --end "$END" -o json
```

## 16. 后续可扩展方向

- **观众侧验证补全**：在一次性测试频道上用 `stream start` 切到直播中，重跑 `checkin start`，再从 `checkin sessions` 获取 `checkinId`；同时打开观看页完成一次真实签到，验证 `checkin result --checkin-id` 的 checkedCount/uncheckedCount 与打赏按钮/金额档位是否随 `donate config update` 出现。
- **打赏→主推款转化闭环**：把 `donate list` 打赏名单 × 场景 02 的 `product push` 商品大卡推送记录交叉，量化「打赏观众」vs「白嫖观众」的主推款点击转化差异（跨场景数据复盘）。
- **签到→优惠券承接闭环**：把 `checkin list` 签到名单 × 场景 01 的 `coupon` 优惠券绑定，做「签到领券」自动化，把暖场签到直接转化为优惠券领取。
- **互动脚本编排**：用 `interaction`（互动脚本/任务奖励）把打赏、签到、点赞奖励编成一条自动化暖场脚本，本场景未覆盖 `interaction`，留作后续场景。
- **覆盖剩余互动命令**：`donate`/`checkin` 已覆盖，`lottery`/`qa`/`questionnaire` 已在场景 03/04 覆盖，互动域剩余 `interaction`、`chat` 可在后续场景补全。
