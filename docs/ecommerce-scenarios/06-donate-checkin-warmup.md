# 场景 06：直播间互动暖场促活 — 打赏激励 + 暖场签到

> 业务阶段：**互动 / 转化**
> 覆盖一级命令：`donate`、`checkin`、`channel`、`account`
> 真实执行状态：**已执行成功**（`donate`、`checkin` 两族均有业务命令在真实测试频道上真实执行成功；其中 `donate config update` 与 `checkin start` 已执行失败并作为问题发现记录）

---

## 1. 场景名称

直播间互动暖场促活 —— 把开播前 10～15 分钟的「冷启动空窗期」做成有节奏的暖场互动，用**打赏激励**（现金打赏 + 礼物打赏）锁定高意向观众，用**暖场签到**（限时签到）把游离观众转化为「留下来的在场观众」，为主推款上架预热人气。

核心是把「打赏配置 → 打赏记录查询 → 暖场签到发起 → 签到记录复盘」串成一个可照着执行的操作闭环：

- **打赏侧**：查询频道打赏配置、配置打赏开关与金额档位、查询打赏流水，用于做「打赏解锁福利 / 打赏榜 Top3 抽奖」等促活玩法。
- **签到侧**：发起限时暖场签到、查询签到发起记录与签到明细，用于做「签到抽免单 / 签到领优惠券」等留人玩法。

> ⚠️ 本场景发现两个**真实执行问题**：
> 1. `donate config update` 对测试频道 `7983902` 的所有取值组合均返回**回显请求参数的成功对象**，但 `donate config get` 复查始终返回「No donate configuration found」，**配置侧无法验证 update 是否真正持久化**（与场景 05 `watch-condition set` 同源的「成功假象」问题）。
> 2. `checkin start` 在 `watchStatus=unStart`（未开播）的频道上返回 `startCheckin failed: 签到失败:`（空原因），**暖场签到必须在频道开播后才能发起**。
>
> 两个问题均不影响本场景命令覆盖结论：`donate` 族的 `config get`/`list`/`likes` 与 `checkin` 族的 `sessions`/`list` 共 5 条业务命令在真实测试频道上真实执行成功，两个命令族均已真实执行覆盖。详见第 12 节问题记录。

## 2. 覆盖命令

| 一级命令 | 子命令 | 执行状态 | 说明 |
|---|---|---|---|
| `account` | `account current`、`account list` | 已执行成功 | 写入前账号预检（`nicksu`，production） |
| `channel` | `channel create`、`channel get` | 已执行成功 | 创建专用测试频道 `7983902` 并验证频道存在与 watchStatus |
| `donate` | `donate config get` | 已执行成功 | 基线查询 + update 后多次复查（变更前/后对比，始终返回无配置） |
| `donate` | `donate config update`（gift/cash/amounts 多组合） | 已执行失败 | 4 次调用均回显请求参数返回 success，但 `donate config get` 复查配置未持久化。见第 12 节 |
| `donate` | `donate list` | 已执行成功 | 7 天时间窗打赏流水查询（频道未开播，无记录，符合预期） |
| `donate` | `donate likes` | 已执行成功 | 点赞奖励记录分页查询（totalItems=0，返回结构完整） |
| `checkin` | `checkin sessions` | 已执行成功 | 7 天签到发起记录查询（无记录，符合预期） |
| `checkin` | `checkin list` | 已执行成功 | 签到用户明细查询（无记录，符合预期） |
| `checkin` | `checkin start`（`--limit-time`/`--message`/`--force`） | 已执行失败 | 频道 `watchStatus=unStart`，返回 `startCheckin failed: 签到失败:`（空原因）。见第 12 节 |

> 说明：本场景所有「已执行成功」命令均使用真实账号（`nicksu`）与真实测试频道（`7983902`）真实执行过，下文「命令执行台账」逐条记录。仅做 `--help` 校验、未真实执行的命令不计入覆盖；`donate config update` 与 `checkin start` 真实执行但未达预期效果，按「已执行失败」并作为问题发现记录。`donate`/`checkin` 两族均因各自至少一条业务命令（`donate config get`/`list`/`likes`、`checkin sessions`/`list`）真实执行成功而计入「已覆盖」。

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

> 创建命令：`npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-06-donate-checkin-warmup-202606222339" --scene alone --template alone -o json`，返回 `channelId=7983902`。`channel get` 复核 watchStatus=unStart、name 一致、pushUrl/pushSecret 已脱敏。

## 4. 行业背景

电商直播的「**开播前 10～15 分钟**」是最容易被浪费的冷启动窗口：主播还在试镜头、运营还在推流，而最先到场的往往是**最精准的高意向老客**。这批人一旦觉得「场子冷」就会划走，等主推款上架时人气已经散了。

成熟直播间会把这个窗口做成**有节奏的暖场互动**，核心两板斧：

- **打赏激励留人**：开打赏、配几档吉利金额（0.88 / 6.66 / 8.88 / 18.88），用「打赏解锁隐藏福利」「打赏榜 Top3 抽免单」把高意向观众锚定在直播间。打赏本身就是最强的意向信号——愿意掏钱的观众，主推款上架时转化率远高于白嫖观众。
- **暖场签到聚人**：发起限时签到（如「在公屏扣 1 签到，签到抽免单」），把游离观众转化为「留下来的在场观众」。签到名单同时是**主推款上架时的精准触达池**——运营可在商品大卡推送前，对着签到名单点名互动，拉升停留时长。

保利威的 `donate`（打赏配置 + 打赏/点赞流水）与 `checkin`（签到发起 + 签到记录）就是支撑这两板斧的标准能力。本场景把「查打赏配置 → 配打赏 → 查打赏流水 → 发起暖场签到 → 复盘签到记录」串成一个真实可执行的操作手册，全部用真实测试频道验证，并如实记录 `donate config update` 不持久化、`checkin start` 需开播两个问题。

## 5. 业务目标与核心 KPI

**业务目标**：把开播前冷启动窗口（开播前 10～15 分钟）做成有节奏的暖场互动，用打赏激励 + 暖场签到拉升开场停留时长与互动率，为主推款上架蓄水人气。

**核心 KPI**：

| KPI | 定义 | 配置侧可观测手段 |
|---|---|---|
| 打赏开口率 | 开播后 15 分钟内有打赏行为的观众占比 | `donate list` / `donate likes` 查打赏流水（本场景频道未开播，故为空，属预期） |
| 打赏金额档位命中率 | 各吉利金额档位的打赏笔数分布 | `donate list` 按 type/amount 聚合 |
| 暖场签到完成率 | 发起签到后实际签到人数 / 当前在线人数 | `checkin result`（需 checkin-id）的 checkedCount/uncheckedCount |
| 签到→主推款触达转化 | 签到名单中最终点击商品大卡的比例 | `checkin list` 名单 × `product` 推送记录交叉（跨场景） |

> 配置侧 vs 观众侧：本场景 `donate config get` 复查始终为空、`checkin start` 因未开播失败，**均属配置侧 / 指令侧**验证。观众侧真实效果（打赏按钮是否出现、签到弹窗是否弹出、打赏/签到是否真实计入流水）需在频道开播后打开观看页人工验证，本场景未做观众侧验证。

## 6. 适用角色

| 角色 | 在本场景的职责 |
|---|---|
| 直播运营 | 配置打赏开关与金额档位、编写暖场签到话术、决定主推款上架前的签到时机 |
| 中控 / 场控 | 开播后按脚本发起暖场签到、监控打赏榜、在主推款上架前点名签到名单 |
| 数据复盘 | 直播后用 `donate list` / `checkin sessions` 拉打赏流水与签到记录做转化复盘 |

## 7. 前置条件

1. 已配置 PolyV 账号并有可用 App ID / App Secret（本场景用 `nicksu`，production）。
2. 有一个**专用测试频道**承载打赏配置与签到（本场景新建 `7983902`，**勿在长期主频道上直接改打赏配置**）。
3. 直播间已在保利威后台开通**打赏功能**与**签到功能**（账号级行政开关，CLI 不负责开通；本场景发现 `donate config get` 对测试账号所有频道均返回空，疑似与账号级打赏功能未开通相关，详见第 12 节问题 1）。
4. 暖场签到必须在**频道已开播（watchStatus=live）**后发起；未开播发起会失败（详见第 12 节问题 2）。
5. 打赏金额档位为字符串逗号分隔（如 `"0.88,6.66,8.88,18.88"`），现金打赏需同时提供 `--amounts`。

## 8. polyv-live-cli-rc 能力映射

| 业务动作 | 一级命令 | 子命令 | 真实 help 关键参数 |
|---|---|---|---|
| 查频道打赏配置 | `donate` | `config get` | `-c/--channel-id`、`-o/--output` |
| 配打赏开关与金额 | `donate` | `config update` | `--cash-enabled <Y\|N>`（需配 `--amounts`）、`--gift-enabled <Y\|N>`、`--amounts <逗号分隔>`、`-f/--force` |
| 查打赏流水 | `donate` | `list` | `-c`、`--start/--end <13位毫秒>`、`--page`、`--size` |
| 查点赞奖励流水 | `donate` | `likes` | `-c`、`--start/--end`、`--page`、`--size` |
| 发起暖场签到 | `checkin` | `start` | `-c`、`--limit-time <秒>`、`--delay-time <13位毫秒>`、`--message <文本>`、`--force` |
| 查签到发起记录 | `checkin` | `sessions` | `-c`、`--start-date/--end-date <yyyy-MM-dd>`（≤30 天） |
| 查签到用户明细 | `checkin` | `list` | `-c`、`--page`、`--size`、`--date`、`--session-id` |
| 查签到详情 | `checkin` | `result` | `-c`、`--checkin-id`（本场景未产生 checkin-id，未执行） |
| 按场次查签到 | `checkin` | `session-result` | `-c`、`--session-id`（本场景无场次，未执行） |

> ⚠️ 真实 help 与 reference 差异：reference `donate.md` 列出的 `--tips <text>`（打赏提示语）**在 rc(1.2.31-rc.0) 真实 `donate config update --help` 中不存在**；真实参数只有 `--cash-enabled`、`--gift-enabled`、`--amounts`、`-f`、`-o`。本场景以真实 help 为准，未使用 `--tips`。

## 9. 实施步骤

### 步骤 1：账号预检 + 建专用测试频道

```bash
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list
npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-06-donate-checkin-warmup-202606222339" --scene alone --template alone -o json
npx --yes polyv-live-cli@rc channel get -c 7983902 -o json   # 复核 watchStatus=unStart
```

### 步骤 2：查打赏配置基线

```bash
npx --yes polyv-live-cli@rc donate config get -c 7983902 -o json
# 基线：No donate configuration found（频道刚建，无打赏配置，属预期）
```

### 步骤 3：配打赏开关与吉利金额档位

```bash
npx --yes polyv-live-cli@rc donate config update -c 7983902 \
  --gift-enabled Y --cash-enabled Y --amounts "0.88,6.66,8.88,18.88" -f -o json
# 返回回显：{channelId, cashEnabled:Y, giftEnabled:Y, amounts:"0.88,6.66,8.88,18.88"}
# ⚠️ 但 donate config get 复查仍为空——配置侧无法验证持久化，见第 12 节问题 1
```

### 步骤 4：复查打赏配置（变更后查询）

```bash
sleep 3
npx --yes polyv-live-cli@rc donate config get -c 7983902 -o json
# 仍返回 No donate configuration found——与基线一致，未观察到持久化
```

### 步骤 5：查打赏流水与点赞奖励流水（7 天窗口）

```bash
START=$(date -v-7d "+%s")000; END=$(date "+%s")000
npx --yes polyv-live-cli@rc donate list -c 7983902 --start "$START" --end "$END" -o json
npx --yes polyv-live-cli@rc donate likes -c 7983902 -o json
# 频道未开播，无打赏/点赞流水，totalItems=0，属预期
```

### 步骤 6：尝试发起暖场签到（未开播，预期失败）

```bash
npx --yes polyv-live-cli@rc checkin start -c 7983902 \
  --limit-time 30 --message "GNHF场景06暖场签到" --force -o json
# 失败：startCheckin failed: 签到失败:（空原因）——频道 watchStatus=unStart，见第 12 节问题 2
```

### 步骤 7：查签到发起记录与签到明细（7 天窗口）

```bash
npx --yes polyv-live-cli@rc checkin sessions -c 7983902 -o json
npx --yes polyv-live-cli@rc checkin list -c 7983902 -o json
# 均无记录（频道未开播、签到未成功发起），属预期
```

### 步骤 8：保留频道，记录清理命令（未执行）

```bash
# 人工清理（本场景未执行，频道已保留）：
# npx --yes polyv-live-cli@rc channel delete -c 7983902   # 仅人工需要时执行
```

## 10. 命令执行台账

| # | 执行时间 (CST) | 一级命令.子命令 | 实际执行命令（敏感值脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 2026-06-22 23:39 | account.current | `account current` | — | 成功 | 默认账号 nicksu（App ID h2wazzobbq，production） |
| 2 | 2026-06-22 23:39 | account.list | `account list` | — | 成功 | 共 6 个账号，默认 nicksu |
| 3 | 2026-06-22 23:39 | channel.create | `channel create -n "GNHF-电商场景-06-…" --scene alone --template alone -o json` | 7983902 | 成功 | channelId=7983902，status=waiting，created=6/22/2026 11:39:22 PM |
| 4 | 2026-06-22 23:39 | channel.get | `channel get -c 7983902 -o json` | 7983902 | 成功 | watchStatus=unStart，name 一致，pushUrl/pushSecret 已脱敏 |
| 5 | 2026-06-22 23:40 | donate.config.get | `donate config get -c 7983902 -o json` | 7983902 | 成功 | `No donate configuration found`（基线，无配置） |
| 6 | 2026-06-22 23:40 | donate.config.update | `donate config update -c 7983902 --gift-enabled Y --cash-enabled Y --amounts "0.88,6.66,8.88,18.88" -f -o json` | 7983902 | **执行失败** | 回显 `{channelId, cashEnabled:Y, giftEnabled:Y, amounts}`，但后续 get 复查未持久化（见台账 #8、问题 1） |
| 7 | 2026-06-22 23:40 | donate.config.get | `donate config get -c 7983902 -o json`（update 后 sleep 3 复查） | 7983902 | 成功 | 仍 `No donate configuration found`——与基线一致，未持久化 |
| 8 | 2026-06-22 23:40 | donate.list | `donate list -c 7983902 --start 1781538062000 --end 1782142862000 -o json` | 7983902 | 成功 | `No donate records found`（频道未开播，无流水） |
| 9 | 2026-06-22 23:40 | donate.likes | `donate likes -c 7983902 -o json` | 7983902 | 成功 | `{pageNumber:1,pageSize:10,totalPages:0,totalItems:0,contents:[]}` |
| 10 | 2026-06-22 23:41 | checkin.sessions | `checkin sessions -c 7983902 -o json` | 7983902 | 成功 | `No checkin sessions found for the specified date range` |
| 11 | 2026-06-22 23:41 | checkin.list | `checkin list -c 7983902 -o json` | 7983902 | 成功 | `No checkins found for channel 7983902` |
| 12 | 2026-06-22 23:41 | checkin.start | `checkin start -c 7983902 --limit-time 30 --message "GNHF场景06暖场签到" --force -o json` | 7983902 | **执行失败** | `startCheckin failed: 签到失败:`（空原因），频道 watchStatus=unStart（见问题 2） |
| 13 | 2026-06-22 23:42 | donate.config.update | `donate config update -c 7983902 --gift-enabled N -f -o json`（诊断：验证 update 是否仅回显输入） | 7983902 | 执行失败（持久化不可验证） | 回显 `{channelId, giftEnabled:N}`，仅回显本次传入字段，佐证「update 输出=请求回显」非服务端确认态 |
| 14 | 2026-06-22 23:42 | donate.config.update | `donate config update -c 7983902 --cash-enabled Y --amounts "1,5,10" -f -o json`（诊断：cash-only） | 7983902 | 执行失败（持久化不可验证） | 回显 `{channelId, cashEnabled:Y, amounts:"1,5,10"}`，未含 giftEnabled，进一步佐证回显=请求输入 |
| 15 | 2026-06-22 23:42 | donate.config.get | `donate config get -c 7983902 -o json`（两条 update 后复查） | 7983902 | 成功 | 仍 `No donate configuration found`——跨 4 次 update 配置从未在 get 出现 |
| 16 | 2026-06-22 23:42 | channel.get | `channel get -c 7983902 -o json`（收尾复核频道未被删除） | 7983902 | 成功 | watchStatus=unStart，name 一致，频道保留 |

> 变更前/后查询对比（规则 15）：
> - **打赏配置**：变更前（台账 #5）`No donate configuration found` → 变更后（台账 #7、#15）仍 `No donate configuration found`。即 `donate config update` **未产生任何可在 `donate config get` 观测到的状态变化**，无法证明配置从「无」变为「现金打赏开 + 4 档金额」。

## 11. 实际使用的 CLI 命令与真实参数

> 所有命令均以 `npx --yes polyv-live-cli@rc` 为前缀（rc 版本 1.2.31-rc.0），频道 ID `7983902`、账号 `nicksu`（production）。AppSecret / pushSecret / token 等敏感值在输出中均已由 CLI 自动脱敏（`***masked***`）。

```bash
# 账号预检
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list

# 建专用测试频道
npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-06-donate-checkin-warmup-202606222339" --scene alone --template alone -o json
npx --yes polyv-live-cli@rc channel get -c 7983902 -o json

# 打赏配置（基线 → 配置 → 复查）
npx --yes polyv-live-cli@rc donate config get -c 7983902 -o json
npx --yes polyv-live-cli@rc donate config update -c 7983902 --gift-enabled Y --cash-enabled Y --amounts "0.88,6.66,8.88,18.88" -f -o json
npx --yes polyv-live-cli@rc donate config get -c 7983902 -o json

# 打赏流水与点赞流水
npx --yes polyv-live-cli@rc donate list -c 7983902 --start 1781538062000 --end 1782142862000 -o json
npx --yes polyv-live-cli@rc donate likes -c 7983902 -o json

# 暖场签到（未开播，失败）+ 签到记录查询
npx --yes polyv-live-cli@rc checkin start -c 7983902 --limit-time 30 --message "GNHF场景06暖场签到" --force -o json
npx --yes polyv-live-cli@rc checkin sessions -c 7983902 -o json
npx --yes polyv-live-cli@rc checkin list -c 7983902 -o json
```

## 12. 执行或验证结果（含问题记录）

### 12.1 已执行成功的命令（配置侧）

| 命令 | 结果 | 结论 |
|---|---|---|
| `donate config get`（4 次） | 每次返回 `No donate configuration found` | 命令真实执行成功，API 返回有效响应（频道无打赏配置）。作为「变更前/后查询」原语工作正常 |
| `donate list` | `No donate records found` | 命令真实执行成功，时间窗参数被正确接受，频道未开播故无流水（预期） |
| `donate likes` | `{totalItems:0, contents:[]}` | 命令真实执行成功，分页结构完整，频道未开播故无点赞流水（预期） |
| `checkin sessions` | `No checkin sessions found for the specified date range` | 命令真实执行成功，日期范围参数被正确接受（默认 7 天） |
| `checkin list` | `No checkins found for channel 7983902` | 命令真实执行成功 |
| `channel create / channel get` | 频道 7983902 创建并复核一致 | 专用测试频道就绪，watchStatus=unStart |

### 12.2 问题记录 1：`donate config update` 回显请求参数但配置未持久化（「成功假象」）

- **现象**：对测试频道 `7983902` 执行 4 次 `donate config update`（gift+cash+amounts、gift-only-N、cash-only-amounts、组合），每次都返回**仅包含本次传入字段**的成功对象：
  - `--gift-enabled Y --cash-enabled Y --amounts "0.88,6.66,8.88,18.88"` → `{channelId, cashEnabled:Y, giftEnabled:Y, amounts}`
  - `--gift-enabled N` → `{channelId, giftEnabled:N}`（**不包含** cashEnabled/amounts）
  - `--cash-enabled Y --amounts "1,5,10"` → `{channelId, cashEnabled:Y, amounts:"1,5,10"}`（**不包含** giftEnabled）
- **佐证**：输出字段集合 = 本次命令传入字段集合，说明 update 返回的是**请求回显**，而非服务端确认的最终态。每次 update 后 `donate config get`（含 sleep 3 延迟复查）始终返回 `No donate configuration found`，**从未观察到配置从无到有**。
- **交叉验证**：对场景 02/03/05 的既有测试频道（7983883 / 7983885 / 7983898）执行 `donate config get`，**全部返回 `No donate configuration found`**——即该测试账号（nicksu）下所有频道都读不到打赏配置。
- **可能根因（假设，待验证）**：
  1. 测试账号 `nicksu` 的**账号级打赏功能未在保利威后台开通**，导致 `donate config get`（读 `/live/v4/channel/donate/get`）对所有频道恒返回空；`donate config update`（写 `/live/v4/channel/donate/update`）的回显由 CLI 本地构造、未必真正落库。
  2. 或 read/write 走不同数据源，write 落库但 get 读的是另一份（传播/缓存差异已通过 sleep 3 + 跨 4 次复查排除延迟因素）。
- **运营结论**：**配置侧无法用 `donate config get` 验证 `donate config update` 是否生效**。运营若要确认打赏开关，必须在频道开播后打开观看页人工确认打赏按钮是否出现（观众侧验证），不能信任 update 的回显。
- **下一步排查建议**：① 在保利威后台确认 `nicksu` 账号是否开通打赏功能；② 用一个已知后台手动开过打赏的频道复测 `donate config get` 是否能读到配置，以区分「功能未开通」vs「读写路径不一致」。

### 12.3 问题记录 2：`checkin start` 在未开播频道失败（`签到失败:` 空原因）

- **现象**：`checkin start -c 7983902 --limit-time 30 --message "GNHF场景06暖场签到" --force -o json` 返回 `Error: startCheckin failed: 签到失败:`（冒号后无具体原因）。
- **频道状态**：`channel get` 显示 watchStatus=unStart（频道创建后未推流开播）。
- **结论**：**暖场签到必须在频道已开播（watchStatus=live）后发起**。这与 reference `checkin.md` 故障排除「确认频道正在直播中」一致——签到是面向在场观众的实时互动指令，未开播无在线观众，签到必然失败。
- **运营结论**：运营编排暖场签到脚本时，必须挂在「主播确认推流开播 → 中控确认 watchStatus=live」之后，不能在开播前预先发起。本场景因不推流开播（避免占用真实推流资源与影响生产），签到发起失败属预期，但签到族的 `sessions`/`list` 查询命令仍真实执行成功，签到族已覆盖。
- **下一步排查建议**：若需验证 `checkin start` 成功路径，需在一个真实开播的测试频道上执行（推流开播后），并随后用 `checkin result --checkin-id` 验证 checkedCount/uncheckedCount。本场景未做此步骤。

### 12.4 配置侧 vs 观众侧

| 能力 | 配置侧 | 观众侧 |
|---|---|---|
| 打赏开关/金额是否生效 | ❌ 配置侧不可验证（`donate config get` 恒空） | 未验证（需开播后开观看页看打赏按钮/金额档位） |
| 签到是否发起 | ❌ 本场景未成功发起（频道未开播） | 未验证（需开播后开观看页看签到弹窗） |
| 打赏/点赞流水 | ✅ 配置侧可查（`donate list`/`likes`，频道未开播故为空） | — |
| 签到记录 | ✅ 配置侧可查（`checkin sessions`/`list`，无记录） | — |

> 本场景所有「已执行成功」结论均限**配置侧 / 指令侧**。观众侧真实效果未验证，文档不声称「观众侧可见/可用」。

## 13. 风险点与回滚/清理方式

| 风险 | 影响 | 缓解 / 回滚 |
|---|---|---|
| `donate config update` 回显 success 但未持久化（问题 1） | 运营误以为打赏已开，开播后观众侧实际无打赏按钮 | **必须**在开播后开观看页人工复核打赏按钮；不能信任 update 回显；以 `donate config get` 复查（虽本账号恒空，但可作为「未读到」的基线对照） |
| `checkin start` 在未开播频道失败（问题 2） | 暖场签到脚本若挂在开播前会静默失败 | 签到脚本必须挂在「确认 watchStatus=live」之后；中控发起前先 `channel get` 确认直播态 |
| 误在长期主频道改打赏配置 | 影响线上直播间的打赏开关与金额档位 | **所有打赏配置一律用专用测试频道**；本场景用新建 `7983902`，未触碰任何既有频道 |
| 打赏金额档位配置错误（如漏配 `--amounts`） | `--cash-enabled Y` 要求同时给 `--amounts`，否则参数不全 | 配置前先 `donate config update --help` 校验；现金打赏必须 `--cash-enabled Y --amounts "..."` 成对出现 |
| 测试频道残留 | 占用频道配额 | 频道已保留供人工查看（见第 14 节）；如需清理用 `channel delete -c 7983902`（**本场景未执行**） |

## 14. 保留资产说明

| 资产 | 状态 | 用途 |
|---|---|---|
| 测试频道 `7983902`（GNHF-电商场景-06-donate-checkin-warmup-202606222339） | **已保留，未删除** | 供人工在保利威后台查看打赏配置（验证问题 1 的账号级开关假设）、查看签到记录 |
| 打赏配置（4 次 update） | 未在 `donate config get` 观测到持久化 | 即便未持久化，保留频道可人工到后台核对打赏功能开通状态 |
| 签到发起（1 次 start） | 失败，无 checkin-id 产生 | 无残留 |

> **频道已保留，未执行删除**。可选的人工清理命令（**本场景未执行**）：
> ```bash
> npx --yes polyv-live-cli@rc channel delete -c 7983902   # 仅人工确认需要清理时执行
> ```

## 15. 可复用模板

### 15.1 暖场打赏配置模板（开播前配置）

```bash
CHANNEL_ID="<你的频道ID>"
# 1. 查基线
npx --yes polyv-live-cli@rc donate config get -c "$CHANNEL_ID" -o json
# 2. 开礼物打赏 + 现金打赏，配吉利金额档位（⚠️ update 回显≠持久化，开播后必须观众侧复核）
npx --yes polyv-live-cli@rc donate config update -c "$CHANNEL_ID" \
  --gift-enabled Y --cash-enabled Y --amounts "0.88,6.66,8.88,18.88" -f -o json
# 3. 复查（本账号可能恒空，仅作基线对照）
npx --yes polyv-live-cli@rc donate config get -c "$CHANNEL_ID" -o json
```

### 15.2 暖场签到发起模板（开播后执行）

```bash
CHANNEL_ID="<你的频道ID>"
# ⚠️ 必须先确认频道已开播
npx --yes polyv-live-cli@rc channel get -c "$CHANNEL_ID" -o json   # 确认 watchStatus=live
# 发起 30 秒暖场签到
npx --yes polyv-live-cli@rc checkin start -c "$CHANNEL_ID" --limit-time 30 --message "扣1签到抽免单" --force -o json
# 直播后复盘签到记录
npx --yes polyv-live-cli@rc checkin sessions -c "$CHANNEL_ID" -o json
npx --yes polyv-live-cli@rc checkin list -c "$CHANNEL_ID" -o json
```

### 15.3 打赏流水复盘模板（直播后）

```bash
CHANNEL_ID="<你的频道ID>"
START=$(date -v-1d "+%s")000; END=$(date "+%s")000
npx --yes polyv-live-cli@rc donate list -c "$CHANNEL_ID" --start "$START" --end "$END" -o json
npx --yes polyv-live-cli@rc donate likes -c "$CHANNEL_ID" --start "$START" --end "$END" -o json
```

## 16. 后续可扩展方向

- **观众侧验证补全**：在一个真实推流开播的测试频道上重跑 `checkin start`，并用 `checkin result --checkin-id` 验证 checkedCount/uncheckedCount，补全问题 2 的成功路径；同时开观看页验证打赏按钮是否随 `donate config update` 出现，补全问题 1 的观众侧证据。
- **打赏→主推款转化闭环**：把 `donate list` 打赏名单 × 场景 02 的 `product push` 商品大卡推送记录交叉，量化「打赏观众」vs「白嫖观众」的主推款点击转化差异（跨场景数据复盘）。
- **签到→优惠券承接闭环**：把 `checkin list` 签到名单 × 场景 01 的 `coupon` 优惠券绑定，做「签到领券」自动化，把暖场签到直接转化为优惠券领取。
- **互动脚本编排**：用 `interaction`（互动脚本/任务奖励）把打赏、签到、点赞奖励编成一条自动化暖场脚本，本场景未覆盖 `interaction`，留作后续场景。
- **覆盖剩余互动命令**：`donate`/`checkin` 已覆盖，`lottery`/`qa`/`questionnaire` 已在场景 03/04 覆盖，互动域剩余 `interaction`、`chat` 可在后续场景补全。
