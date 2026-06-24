# 场景 07：场次级直播运营 — 新版场次编排 + 数据复盘

> 业务阶段：**预热 / 数据复盘**
> 覆盖一级命令：`session`、`statistics`、`channel`、`account`
> 真实执行状态：**验收通过**（`session`、`statistics` 两族均有业务命令在真实测试频道上真实执行成功；`statistics channel-summary` 历史空数据输出 `undefined` 问题已在 `polyv-live-cli@1.2.38` 修复并用 latest 复验通过；`session create` 仍受账号级「新版场次手动创建」权益限制，作为已知前置条件记录）

---

## 1. 场景名称

场次级直播运营 —— 把电商直播从「开一个频道一直播」升级为「**按场次编排 + 按场次复盘**」，让每场大促（如 618 新品首发场、双 11 爆款返场场）都成为可命名、可计划、可独立统计的运营单元。

核心是把「**场次编排**」与「**场次/频道数据复盘**」串成一个可照着执行的操作闭环：

- **场次编排侧**：用 `session create` 为每场直播建立命名场次（场次名、计划开播/结束时间、暖场图），用 `session list`/`legacy-list`/`data-list` 查询频道场次台账。
- **数据复盘侧**：用 `statistics` 在直播后拉**场均指标**（UV/播放/停留/峰值并发）、**观众画像**（设备/地域分布）、**商品点击转化**（商品点击/商品列表点击）、**场次级汇总**（场次统计/场次汇总），为「这场为什么爆 / 为什么没爆」提供数据证据。

> ⚠️ 本场景发现并处理两个**真实执行问题**：
> 1. `session create` 对测试账号 `nicksu` 的频道 `7983903` 返回 `当前用户不允许手动创建场次`——**新版场次的「手动创建」是账号级权益**，测试账号未开通，CLI 层无法绕过。
> 2. `statistics channel-summary`（频道观看汇总）曾对该频道输出字面 `undefined`（table 与 json 两种格式均如此）。已修复发布 `polyv-live-cli@1.2.38`，latest 复验空数据输出为 `[]`。
>
> 两个问题均不影响本场景命令覆盖结论：`session` 族的 `list`/`legacy-list`/`data-list` 与 `statistics` 族的 `max-concurrent`/`channel-statistic`/`channel-summary`/`session-summary-list`/`channel-session-stats`/`view`/`product-click`/`product-list-click`/`audience device`/`audience region` 共 13 条业务命令在真实测试频道上真实执行成功，两个命令族均已真实执行覆盖。详见第 12 节问题记录。

## 2. 覆盖命令

| 一级命令 | 子命令 | 执行状态 | 说明 |
|---|---|---|---|
| `account` | `account current`、`account list` | 已执行成功 | 写入前账号预检（`nicksu`，production） |
| `channel` | `channel create`、`channel get` | 已执行成功 | 创建专用测试频道 `7983903` 并复核 watchStatus |
| `session` | `session list`（含基线） | 已执行成功 | 频道场次列表（新版），totalItems=0（频道刚建，无场次，符合预期） |
| `session` | `session create`（`--name`/`--plan-start-time`/`--plan-end-time`/`--splash-img`） | 已执行失败 | 返回 `当前用户不允许手动创建场次`（账号级权益未开通）。见第 12 节问题 1 |
| `session` | `session legacy-list` | 已执行成功 | 频道历史场次（V3），totalItems=0 |
| `session` | `session data-list` | 已执行成功 | 频道场次数据列表，totalItems=0 |
| `statistics` | `statistics max-concurrent` | 已执行成功 | 历史峰值并发，maxConcurrent=0（频道未开播） |
| `statistics` | `statistics channel-statistic` | 已执行成功 | 频道统计明细（UV/播放/停留/IP/观看人数，全 0 基线） |
| `statistics` | `statistics session-summary-list` | 已执行成功 | V4 场次统计汇总，totalItems=0 |
| `statistics` | `statistics channel-session-stats` | 已执行成功 | 频道场次统计，list=[] |
| `statistics` | `statistics view` | 已执行成功 | 频道日报统计，`No statistics data found` |
| `statistics` | `statistics product-click` | 已执行成功 | 商品点击统计，totalItems=0 |
| `statistics` | `statistics product-list-click` | 已执行成功 | 商品列表点击统计，totalItems=0 |
| `statistics` | `statistics audience device` | 已执行成功 | 观众设备分布，`No device distribution data found` |
| `statistics` | `statistics audience region` | 已执行成功 | 观众地域分布，`No region distribution data found` |
| `statistics` | `statistics channel-summary` | 已执行成功 | 旧版输出字面 `undefined`；`polyv-live-cli@1.2.38` 修复后 latest 复验返回 `[]`。见第 12 节问题 2 |

> 说明：本场景所有「已执行成功」命令均使用真实账号（`nicksu`）与真实测试频道（`7983903`）真实执行过，下文「命令执行台账」逐条记录。`session create` 真实执行但未达预期效果，按「已执行失败」记录；`statistics channel-summary` 历史输出异常已在 latest 1.2.38 修复并复验通过。`session` 族因 `list`/`legacy-list`/`data-list` 三条业务命令真实执行成功而计入「已覆盖」；`statistics` 族因 10 条业务命令真实执行成功而计入「已覆盖」。仅做 `--help` 校验、未真实执行的命令（如 `session get`/`update`/`delete`，因无可用 session-id 未执行）不计入覆盖。

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道名称 | `GNHF-电商场景-07-session-statistics-202606222350` |
| 频道 ID | `7983903` |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production） |
| 场景类型 | `alone`（活动营销） |
| 模板 | `alone`（纯视频-横屏） |
| 创建结果 | 成功（status=waiting / watchStatus=unStart / 未开始） |
| 创建时间 | 2026-06-22 23:50:43 CST |
| 是否删除 | **否，频道已保留**，供人工查看场次台账与统计基线 |

> 创建命令：`npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-07-session-statistics-202606222350" -d "GNHF 场景 07 场次级直播运营 新版场次编排与数据复盘专用测试频道" --scene alone --template alone -o json`，返回 `channelId=7983903`。`channel get` 复核 watchStatus=unStart、name 一致、pushUrl/pushSecret 已脱敏。

## 4. 行业背景

电商直播的运营颗粒度正在从「**频道**」收敛到「**场次**」。一个频道（如「品牌官方旗舰店直播间」）一年要播 300+ 场，每场的主题、货盘、投流预算、主播都不一样：

- 618 大促首场（爆品冲量）、日常平销场（清库存）、达人专场（带货分佣）、会员专享场（私域复购）……每场都是独立的运营单元。
- 复盘时不能只看「这个频道这个月做了多少 GMV」，必须**按场次拆**：哪场峰值最高？哪场停留最长？哪场商品点击转化最好？哪场观众地域分布异常（疑似投流地域偏差）？

保利威的 `session`（新版场次编排）+ `statistics`（场次/频道统计）就是支撑「场次化运营」的标准能力：

- **场次编排**：为每场直播建立命名场次，挂计划开播时间与暖场图，让中控、投流、客服对齐「我们今天打的是哪一场」。
- **数据复盘**：直播后按场次拉场均指标、观众画像、商品点击，把「主播感觉今天场子很热」变成「场均 UV 12k、峰值并发 3.2k、商品点击率 18%、广东观众占 41%」的可量化结论。

本场景把「建场次 → 查场次台账 → 拉场均指标 → 拉观众画像 → 拉商品点击 → 拉场次汇总」串成一个真实可执行的操作手册，全部用真实测试频道验证，并如实记录 `session create` 账号权益受限，以及 `channel-summary` 历史空数据输出异常已修复的过程。

## 5. 业务目标与核心 KPI

**业务目标**：把电商直播做成「场次化」运营——每场大促可命名、可计划、可独立统计；直播后用场次级数据复盘回答「这场为什么爆/为什么没爆」，指导下场货盘与投流策略。

**核心 KPI**（均为直播后从 `statistics` 拉取，本场景频道未开播，故为全 0 基线，属预期）：

| KPI | 定义 | 配置侧可观测手段 |
|---|---|---|
| 场均 UV / 场均观看人次 | 单场独立访客数 / 单场播放次数 | `statistics channel-statistic`（uniqueVisitor / plays） |
| 场均停留时长 | 单场平均观看时长 | `statistics channel-statistic`（averagePlayDuration / averageTime） |
| 峰值并发 | 单场最高同时在线人数 | `statistics max-concurrent`（maxConcurrent） |
| 商品点击转化 | 商品卡片点击次数 / 商品列表点击次数 | `statistics product-click`、`statistics product-list-click` |
| 观众设备分布 | 移动端 / PC 端观众占比 | `statistics audience device` |
| 观众地域分布 | 观众所在省市分布（投流地域命中判断） | `statistics audience region` |
| 场次级汇总 | 按场次聚合的 UV/并发/时长 | `statistics session-summary-list`、`statistics channel-session-stats` |

> 配置侧 vs 观众侧：本场景所有 `statistics` 命令均属**数据侧 / 配置侧**只读查询（拉服务端已沉淀的统计数据）。`session create` 属配置侧写入（失败）。本场景未做观众侧验证（未推流开播，无在线观众与观众侧行为数据）。

## 6. 适用角色

| 角色 | 在本场景的职责 |
|---|---|
| 直播运营 | 为每场大促建命名场次、设定计划开播时间与暖场图，对齐中控/投流/客服 |
| 数据复盘 | 直播后用 `statistics` 拉场均指标、观众画像、商品点击，输出场次复盘报告 |
| 投流操盘 | 用 `audience region` 观众地域分布复盘投流地域命中，调整下场投流策略 |
| 中控 / 场控 | 按 `session list` 场次台账确认本场场次名与计划时间，按场次切换话术与货盘 |

## 7. 前置条件

1. 已配置 PolyV 账号并有可用 App ID / App Secret（本场景用 `nicksu`，production）。
2. 有一个**专用测试频道**承载场次编排与统计查询（本场景新建 `7983903`，**勿在长期主频道上直接建测试场次**）。
3. **新版场次「手动创建」是账号级权益**：`session create` 要求账号在保利威后台开通「新版场次 + 手动创建」权限，否则返回 `当前用户不允许手动创建场次`（详见第 12 节问题 1）。本场景测试账号 `nicksu` 未开通，故 create 失败，但 `session list`/`legacy-list`/`data-list` 只读查询不受影响。
4. `statistics` 多数子命令的时间参数为 **13 位毫秒时间戳**（`--start-time`/`--end-time`），少数用日期字符串（`--start-day`/`--end-day` 或 `--start-date`/`--end-date`，注意 `channel-statistic` 用 `--start-date` 而非 `--start-day`，`audience device/region` 用 `--start-time` 而非 `--start-day`）。
5. `statistics` 查询窗口对未开播频道返回全 0 / 空，属预期；要拿到非零数据需频道真实推流开播并有观众访问。

## 8. polyv-live-cli 能力映射

| 业务动作 | 一级命令 | 子命令 | 真实 help 关键参数 |
|---|---|---|---|
| 查频道场次列表（新版） | `session` | `list` | `-c/--channel-id`（可选，不传查全部）、`--page`、`--page-size`、`--start-date/--end-date <yyyy-MM-dd>`、`-o` |
| 创建新版场次 | `session` | `create` | `-c`、`--name`、`--plan-start-time <13位毫秒>`、`--plan-end-time <13位毫秒>`、`--splash-img <url>`、`-f`、`-o` |
| 查场次详情 | `session` | `get` | `-c`、`--session-id`（本场景无可用 session-id，未执行） |
| 更新场次 | `session` | `update` | `-c`、`--session-id`、`--name`、`--plan-start-time`、`--plan-end-time`、`--splash-img`、`-f`（本场景无 session-id，未执行） |
| 删除场次 | `session` | `delete` | `-c`、`--session-id`、`-f`（本场景无 session-id，未执行） |
| 查历史场次（V3） | `session` | `legacy-list` | `-c`、`--start-date/--end-date`、`--page`、`--page-size`、`-o` |
| 查场次数据列表 | `session` | `data-list` | `-c`、`--start-date/--end-date`、`--page`、`--page-size`、`-o` |
| 查峰值并发 | `statistics` | `max-concurrent` | `-c`、`--start-time/--end-time <13位毫秒>`（范围≤3 个月）、`-o` |
| 查频道统计明细 | `statistics` | `channel-statistic` | `-c`、`--start-date/--end-date <yyyy-MM-dd>`、`-o` |
| 查频道观看汇总 | `statistics` | `channel-summary` | `-c`、`--start-day/--end-day <yyyy-MM-dd>`、`-o`（latest 1.2.38 空数据输出 `[]`） |
| 查场次统计汇总 | `statistics` | `session-summary-list` | `-c`、`--keyword`、`--start-time/--end-time`、`--page-number`、`--page-size`、`-o` |
| 查频道场次统计 | `statistics` | `channel-session-stats` | `-c`、`--session-ids`、`--start-time/--end-time`、`-o` |
| 查频道日报 | `statistics` | `view` | `-c`、`--start-day/--end-day`、`-o` |
| 查商品点击 | `statistics` | `product-click` | `-c`、`--session-id`、`--start-time/--end-time`、`--page-number`、`--page-size`、`-o` |
| 查商品列表点击 | `statistics` | `product-list-click` | `-c`、`--start-time/--end-time`、`--page-number`、`--page-size`、`-o` |
| 查观众设备分布 | `statistics` | `audience device` | `-c`、`--start-time/--end-time`、`-o` |
| 查观众地域分布 | `statistics` | `audience region` | `-c`、`--start-time/--end-time`、`-o` |

> ⚠️ 真实 help 参数名差异（易踩坑）：`statistics channel-statistic` 用 `--start-date/--end-date`（date），而 `statistics channel-summary`/`view` 用 `--start-day/--end-day`（day），`statistics audience device/region` 用 `--start-time/--end-time`（13 位毫秒）。同名业务、不同时间参数风格，配置时必须以各子命令 `--help` 为准。

## 9. 实施步骤

### 步骤 1：账号预检 + 建专用测试频道

```bash
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list
npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-07-session-statistics-202606222350" \
  -d "GNHF 场景 07 场次级直播运营 新版场次编排与数据复盘专用测试频道" \
  --scene alone --template alone -o json
npx --yes polyv-live-cli@rc channel get -c 7983903 -o json   # 复核 watchStatus=unStart
```

### 步骤 2：查场次台账基线（频道刚建，预期空）

```bash
npx --yes polyv-live-cli@rc session list -c 7983903 -o json
# 基线：{contents:[], totalItems:0}（频道无场次，属预期）
```

### 步骤 3：尝试创建命名场次（账号权益受限，预期失败）

```bash
# 计划 2026-06-23 20:00~21:00 的晚场（13 位毫秒时间戳）
START_MS=1782216000000; END_MS=1782219600000
npx --yes polyv-live-cli@rc session create -c 7983903 \
  --name "GNHF07-618新品首发场-0623晚场" \
  --plan-start-time $START_MS --plan-end-time $END_MS \
  --splash-img "https://placehold.co/750x422.png" -f -o json
# 失败：当前用户不允许手动创建场次（账号级权益未开通，见第 12 节问题 1）
```

### 步骤 4：复查场次台账（确认 create 未产生场次）

```bash
npx --yes polyv-live-cli@rc session list -c 7983903 -o json
npx --yes polyv-live-cli@rc session legacy-list -c 7983903 --start-date 2026-06-01 --end-date 2026-06-30 -o json
npx --yes polyv-live-cli@rc session data-list -c 7983903 --start-date 2026-06-01 --end-date 2026-06-30 -o json
# 三条均 totalItems=0，与基线一致——create 确未落库
```

### 步骤 5：拉场均指标基线（频道未开播，预期全 0）

```bash
# 8 天时间窗（覆盖 2026-06-16~06-24，含执行日），13 位毫秒时间戳
START_TS=1781558400000; END_TS=1782249600000
npx --yes polyv-live-cli@rc statistics max-concurrent -c 7983903 --start-time $START_TS --end-time $END_TS -o json
npx --yes polyv-live-cli@rc statistics channel-statistic -c 7983903 --start-date 2026-06-01 --end-date 2026-06-30 -o json
# max-concurrent=0；channel-statistic 全 0（uniqueVisitor/plays/playDuration/ips/viewers 均为 0）
```

### 步骤 6：拉观众画像基线（设备 / 地域分布）

```bash
npx --yes polyv-live-cli@rc statistics audience device -c 7983903 --start-time $START_TS --end-time $END_TS -o json
npx --yes polyv-live-cli@rc statistics audience region -c 7983903 --start-time $START_TS --end-time $END_TS -o json
# 均返回 No ... data found（频道未开播，无观众画像，属预期）
```

### 步骤 7：拉商品点击转化基线

```bash
npx --yes polyv-live-cli@rc statistics product-click -c 7983903 --start-time $START_TS --end-time $END_TS -o json
npx --yes polyv-live-cli@rc statistics product-list-click -c 7983903 --start-time $START_TS --end-time $END_TS -o json
# 均 totalItems=0（频道未开播、未推商品点击，属预期）
```

### 步骤 8：拉场次级汇总基线 + 频道日报

```bash
npx --yes polyv-live-cli@rc statistics session-summary-list -c 7983903 --start-time $START_TS --end-time $END_TS -o json
npx --yes polyv-live-cli@rc statistics channel-session-stats -c 7983903 --start-time $START_TS --end-time $END_TS -o json
npx --yes polyv-live-cli@rc statistics view -c 7983903 --start-day 2026-06-01 --end-day 2026-06-30 -o json
# session-summary-list totalItems=0；channel-session-stats list=[]；view: No statistics data found
```

### 步骤 9：保留频道，记录清理命令（未执行）

```bash
# 人工清理（本场景未执行，频道已保留）：
# npx --yes polyv-live-cli@latest channel delete -c 7983903   # 仅人工需要时执行
```

## 10. 命令执行台账

| # | 执行时间 (CST) | 一级命令.子命令 | 实际执行命令（敏感值脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 2026-06-22 23:50 | account.current | `account current` | — | 成功 | 默认账号 nicksu（App ID h2wazzobbq，production） |
| 2 | 2026-06-22 23:50 | account.list | `account list` | — | 成功 | 共 6 个账号，默认 nicksu |
| 3 | 2026-06-22 23:50 | channel.create | `channel create -n "GNHF-电商场景-07-…" -d "…" --scene alone --template alone -o json` | 7983903 | 成功 | channelId=7983903，status=waiting，created=6/22/2026 11:50:43 PM |
| 4 | 2026-06-22 23:50 | channel.get | `channel get -c 7983903 -o json` | 7983903 | 成功 | watchStatus=unStart，name 一致，pushUrl/pushSecret 已脱敏 |
| 5 | 2026-06-22 23:51 | session.list | `session list -c 7983903 -o json` | 7983903 | 成功 | `{contents:[], pageNumber:1, pageSize:0, totalItems:0, totalPages:1}`（基线） |
| 6 | 2026-06-22 23:51 | session.create | `session create -c 7983903 --name "GNHF07-618新品首发场-0623晚场" --plan-start-time 1782216000000 --plan-end-time 1782219600000 --splash-img "https://placehold.co/750x422.png" -f -o json` | 7983903 | **执行失败** | `当前用户不允许手动创建场次`（账号级权益未开通，见问题 1） |
| 7 | 2026-06-22 23:51 | session.legacy-list | `session legacy-list -c 7983903 --start-date 2026-06-01 --end-date 2026-06-30 -o json` | 7983903 | 成功 | `{contents:[], totalItems:0, totalPages:0}`（V3 历史场次） |
| 8 | 2026-06-22 23:51 | session.data-list | `session data-list -c 7983903 --start-date 2026-06-01 --end-date 2026-06-30 -o json` | 7983903 | 成功 | `{contents:[], totalItems:0, totalPages:0}`（场次数据列表） |
| 9 | 2026-06-22 23:51 | statistics.max-concurrent | `statistics max-concurrent -c 7983903 --start-time 1781558400000 --end-time 1782249600000 -o json` | 7983903 | 成功 | `{channelId, startTime, endTime, maxConcurrent:0}` |
| 10 | 2026-06-22 23:51 | statistics.channel-statistic | `statistics channel-statistic -c 7983903 --start-date 2026-06-01 --end-date 2026-06-30 -o json` | 7983903 | 成功 | `{uniqueVisitor:0, plays:0, playDuration:0, ips:0, averagePlayDuration:0, averageTime:0, viewers:0, …}` |
| 11 | 2026-06-22 23:52 | statistics.channel-summary | `statistics channel-summary -c 7983903 --start-day 2026-06-01 --end-day 2026-06-30 -o json` | 7983903 | **输出异常** | 字面输出 `undefined`（table 与 json 均如此），见问题 2 |
| 12 | 2026-06-22 23:52 | statistics.session-summary-list | `statistics session-summary-list -c 7983903 --start-time 1781558400000 --end-time 1782249600000 -o json` | 7983903 | 成功 | `{pageNumber:1, pageSize:10, totalPages:0, totalItems:0, contents:[]}` |
| 13 | 2026-06-22 23:52 | statistics.channel-session-stats | `statistics channel-session-stats -c 7983903 --start-time 1781558400000 --end-time 1782249600000 -o json` | 7983903 | 成功 | `{list:[]}` |
| 14 | 2026-06-22 23:52 | statistics.view | `statistics view -c 7983903 --start-day 2026-06-01 --end-day 2026-06-30 -o json` | 7983903 | 成功 | `ℹ️ No statistics data found for channel 7983903` |
| 15 | 2026-06-22 23:52 | statistics.product-click | `statistics product-click -c 7983903 --start-time 1781558400000 --end-time 1782249600000 -o json` | 7983903 | 成功 | `{pageNumber:1, pageSize:10, totalPages:0, totalItems:0, contents:[]}` |
| 16 | 2026-06-22 23:52 | statistics.product-list-click | `statistics product-list-click -c 7983903 --start-time 1781558400000 --end-time 1782249600000 -o json` | 7983903 | 成功 | `{pageNumber:1, pageSize:10, totalPages:0, totalItems:0, contents:[]}` |
| 17 | 2026-06-22 23:52 | statistics.audience.device | `statistics audience device -c 7983903 --start-time 1781558400000 --end-time 1782249600000 -o json` | 7983903 | 成功 | `ℹ️ No device distribution data found for channel 7983903` |
| 18 | 2026-06-22 23:52 | statistics.audience.region | `statistics audience region -c 7983903 --start-time 1781558400000 --end-time 1782249600000 -o json` | 7983903 | 成功 | `ℹ️ No region distribution data found for channel 7983903` |
| 19 | 2026-06-22 23:52 | channel.get | `channel get -c 7983903 -o json`（收尾复核频道未被删除） | 7983903 | 成功 | watchStatus=unStart，name 一致，频道保留 |
| 20 | 2026-06-24 | statistics.channel-summary | `npx --yes polyv-live-cli@latest statistics channel-summary -c 7983903 --start-day 2026-06-01 --end-day 2026-06-30 -o json` | 7983903 | 成功 | latest `1.2.38` 复验返回 `[]`；默认 table 输出同样为 `[]`，不再输出 `undefined` |

> 变更前/后查询对比（规则 15）：
> - **场次台账**：变更前（台账 #5）`session list` totalItems=0 → 变更后（台账 #5 基线即终态，create 失败未产生场次）`session list`/`legacy-list`/`data-list` 均仍 totalItems=0。即 `session create` **未产生任何可在场次台账观测到的新增场次**，无法证明场次从「无」变为「618 新品首发场」。

## 11. 实际使用的 CLI 命令与真实参数

> 所有命令均以 `npx --yes polyv-live-cli@rc` 为前缀（rc 版本 1.2.31-rc.0），频道 ID `7983903`、账号 `nicksu`（production）。AppSecret / pushSecret / token 等敏感值在输出中均已由 CLI 自动脱敏（`***masked***`）。

```bash
# 账号预检
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list

# 建专用测试频道
npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-07-session-statistics-202606222350" \
  -d "GNHF 场景 07 场次级直播运营 新版场次编排与数据复盘专用测试频道" \
  --scene alone --template alone -o json
npx --yes polyv-live-cli@rc channel get -c 7983903 -o json

# 场次台账（基线 → create 失败 → 复查）
npx --yes polyv-live-cli@rc session list -c 7983903 -o json
npx --yes polyv-live-cli@rc session create -c 7983903 --name "GNHF07-618新品首发场-0623晚场" \
  --plan-start-time 1782216000000 --plan-end-time 1782219600000 \
  --splash-img "https://placehold.co/750x422.png" -f -o json
npx --yes polyv-live-cli@rc session legacy-list -c 7983903 --start-date 2026-06-01 --end-date 2026-06-30 -o json
npx --yes polyv-live-cli@rc session data-list -c 7983903 --start-date 2026-06-01 --end-date 2026-06-30 -o json

# 场均指标基线（13 位毫秒时间戳，覆盖 2026-06-16~06-24 的 8 天窗口）
START_TS=1781558400000; END_TS=1782249600000
npx --yes polyv-live-cli@rc statistics max-concurrent -c 7983903 --start-time $START_TS --end-time $END_TS -o json
npx --yes polyv-live-cli@rc statistics channel-statistic -c 7983903 --start-date 2026-06-01 --end-date 2026-06-30 -o json

# 观众画像 + 商品点击 + 场次汇总 + 频道日报
npx --yes polyv-live-cli@rc statistics audience device -c 7983903 --start-time $START_TS --end-time $END_TS -o json
npx --yes polyv-live-cli@rc statistics audience region -c 7983903 --start-time $START_TS --end-time $END_TS -o json
npx --yes polyv-live-cli@rc statistics product-click -c 7983903 --start-time $START_TS --end-time $END_TS -o json
npx --yes polyv-live-cli@rc statistics product-list-click -c 7983903 --start-time $START_TS --end-time $END_TS -o json
npx --yes polyv-live-cli@rc statistics session-summary-list -c 7983903 --start-time $START_TS --end-time $END_TS -o json
npx --yes polyv-live-cli@rc statistics channel-session-stats -c 7983903 --start-time $START_TS --end-time $END_TS -o json
npx --yes polyv-live-cli@rc statistics view -c 7983903 --start-day 2026-06-01 --end-day 2026-06-30 -o json
```

### 11.1 latest 修复复验命令

> 2026-06-24 发布 `polyv-live-cli@1.2.38` 后，用 npm latest 对 `statistics channel-summary` 做回归验证：

```bash
npx --yes polyv-live-cli@latest --version
# 1.2.38
npx --yes polyv-live-cli@latest statistics channel-summary -c 7983903 \
  --start-day 2026-06-01 --end-day 2026-06-30 -o json
# []
npx --yes polyv-live-cli@latest statistics channel-summary -c 7983903 \
  --start-day 2026-06-01 --end-day 2026-06-30
# []
```

## 12. 执行或验证结果（含问题记录）

### 12.1 已执行成功的命令（数据侧 / 配置侧）

| 命令 | 结果 | 结论 |
|---|---|---|
| `session list` | `{contents:[], totalItems:0}` | 命令真实执行成功，频道无场次（预期） |
| `session legacy-list` | `{contents:[], totalItems:0}` | 命令真实执行成功，V3 历史场次查询参数被正确接受 |
| `session data-list` | `{contents:[], totalItems:0}` | 命令真实执行成功，场次数据列表查询参数被正确接受 |
| `statistics max-concurrent` | `{maxConcurrent:0}` | 命令真实执行成功，13 位毫秒时间戳参数被正确接受，频道未开播故峰值 0（预期） |
| `statistics channel-statistic` | 全 0 指标对象 | 命令真实执行成功，UV/播放/停留/IP/观看人数等 10 项指标结构完整 |
| `statistics session-summary-list` | `{totalItems:0}` | 命令真实执行成功，V4 场次统计汇总分页结构完整 |
| `statistics channel-session-stats` | `{list:[]}` | 命令真实执行成功，场次统计列表结构完整 |
| `statistics view` | `No statistics data found` | 命令真实执行成功，频道日报为空（预期） |
| `statistics product-click` | `{totalItems:0}` | 命令真实执行成功，商品点击统计分页结构完整 |
| `statistics product-list-click` | `{totalItems:0}` | 命令真实执行成功，商品列表点击统计分页结构完整 |
| `statistics audience device` | `No device distribution data found` | 命令真实执行成功，时间戳参数被正确接受 |
| `statistics audience region` | `No region distribution data found` | 命令真实执行成功，时间戳参数被正确接受 |
| `statistics channel-summary` | `[]` | 命令在 latest 1.2.38 复验成功，空数据返回空数组，不再输出 `undefined` |
| `channel create / channel get` | 频道 7983903 创建并复核一致 | 专用测试频道就绪，watchStatus=unStart |

### 12.2 问题记录 1：`session create` 返回 `当前用户不允许手动创建场次`（账号级权益受限）

- **现象**：`session create -c 7983903 --name "GNHF07-618新品首发场-0623晚场" --plan-start-time 1782216000000 --plan-end-time 1782219600000 --splash-img "https://placehold.co/750x422.png" -f -o json` 返回 `Unexpected error: 当前用户不允许手动创建场次`（重复两次输出，命令以 exit 1 退出）。
- **排查**：
  1. 参数形态经 `session create --help` 校验无误（`--name`/`--plan-start-time`/`--plan-end-time`/`--splash-img` 均为 help 列出参数，时间戳为 13 位毫秒）。
  2. 暖场图用公网占位图 `https://placehold.co/750x422.png`（与场景 02 product cover 同源可用占位图）。
  3. 错误信息「当前用户不允许」明确指向**账号级权益**，而非参数或频道状态。
- **结论**：**新版场次的「手动创建」是保利威账号级行政权益**，测试账号 `nicksu` 未开通该权益，故 `session create` 在该账号下所有频道均会失败，CLI 层无法绕过。这与「打赏功能未开通」「签到需开播」属同类账号级/频道态前置限制。
- **运营结论**：运营若要用 `session create` 编排命名场次，**必须先在保利威后台为账号开通「新版场次 + 手动创建场次」权益**。未开通时，可退而用频道本身作为单场次载体（频道级统计仍可用 `statistics` 查询），或联系保利威开通权益后再编排多场次。`session` 族的只读查询（`list`/`legacy-list`/`data-list`）不受此权益限制，仍可正常拉取场次台账。
- **下一步排查建议**：① 在保利威后台确认 `nicksu` 账号是否开通「新版场次」权益；② 用一个已开通权益的账号复测 `session create` 并随后用 `session get --session-id` 验证场次详情落库，补全 create→get→update→delete 成功路径。本场景未做此步骤。

### 12.3 问题记录 2：`statistics channel-summary` 输出字面 `undefined`（已修复）

- **现象**：`statistics channel-summary -c 7983903 --start-day 2026-06-01 --end-day 2026-06-30 -o json` 输出字面 `undefined`；去掉 `-o json` 用默认 table 输出**同样是 `undefined`**。命令以 exit 0 退出，无报错信息。
- **对照**：同族的 `channel-statistic`（用 `--start-date`）、`view`（用 `--start-day`）对同一频道分别返回结构化全 0 指标对象与 `No statistics data found` 的友好提示，**均未出现 undefined**。
- **根因**：`channel-summary`（V4 频道观看汇总）对未开播/无数据频道返回空时，CLI 服务层未做空值处理，通用输出层继续格式化 `undefined`，最终打印了 JS 的 `undefined`。这是 **CLI 输出侧缺陷**，不影响其他 statistics 子命令。
- **修复**：2026-06-24 发布 `polyv-live-cli@1.2.38`，在 `StatisticsServiceSdk.getSummary()` 中把底层空响应归一为 `[]`，并补充单元测试覆盖 `undefined` 响应。
- **复验**：`npx --yes polyv-live-cli@latest --version` 返回 `1.2.38`；同一频道同一时间窗执行 `statistics channel-summary -c 7983903 --start-day 2026-06-01 --end-day 2026-06-30 -o json` 返回 `[]`，默认 table 输出也返回 `[]`。问题已关闭。
- **运营结论**：运营拉「频道观看汇总」时，可继续使用 `statistics channel-summary`；若频道未开播/无数据，latest 会返回空数组 `[]`，代表没有可汇总的观看数据。

### 12.4 配置侧 vs 观众侧

| 能力 | 配置侧 / 数据侧 | 观众侧 |
|---|---|---|
| 场次编排（create） | ❌ 账号权益受限，create 失败 | —（场次编排不直接面向观众） |
| 场次台账查询（list 等） | ✅ 可查（totalItems=0） | — |
| 场均指标（UV/播放/停留/峰值） | ✅ 可查（全 0 基线，频道未开播） | —（统计数据为服务端沉淀，非观众侧实时） |
| 观众画像（设备/地域） | ✅ 可查（无数据，频道未开播） | — |
| 商品点击转化 | ✅ 可查（totalItems=0） | — |

> 本场景所有「已执行成功」结论均限**数据侧 / 配置侧**。频道未推流开播，无在线观众与观众侧行为数据，文档不声称「观众侧可见/可用」。

## 13. 风险点与回滚/清理方式

| 风险 | 影响 | 缓解 / 回滚 |
|---|---|---|
| `session create` 账号权益受限（问题 1） | 运营误以为可编排场次，实际未开通权益则 create 静默失败 | 用 `session list` 复查确认 create 是否真的产生场次；权益未开通时退用频道级统计或联系保利威开通 |
| 旧版 `statistics channel-summary` 输出 undefined（问题 2，已修复） | 运营误以为接口故障或数据丢失 | 升级到 `polyv-live-cli@1.2.38` 或更高版本；latest 空数据输出为 `[]` |
| statistics 时间参数风格混用 | `channel-statistic` 用 `--start-date`、`channel-summary`/`view` 用 `--start-day`、`audience` 用 `--start-time`，混用报 required option 缺失 | 每个子命令先 `--help` 校验时间参数名；13 位毫秒时间戳用 `date "+%s"` 拼接 `000` 生成 |
| 误在长期主频道建测试场次 | 影响线上直播间的场次台账与统计 | **所有场次/统计演练一律用专用测试频道**；本场景用新建 `7983903`，未触碰任何既有频道 |
| statistics 查询窗口超 3 个月 | `max-concurrent` 等要求窗口≤3 个月，超限报错 | 拆分为多个≤3 个月窗口分别查询 |
| 测试频道残留 | 占用频道配额 | 频道已保留供人工查看（见第 14 节）；如需清理用 `channel delete -c 7983903`（**本场景未执行**） |

## 14. 保留资产说明

| 资产 | 状态 | 用途 |
|---|---|---|
| 测试频道 `7983903`（GNHF-电商场景-07-session-statistics-202606222350） | **已保留，未删除** | 供人工在保利威后台查看场次台账、核对账号「新版场次」权益开通状态、查看 statistics 全 0 基线 |
| 命名场次（1 次 create） | 失败，未产生 session-id | 无残留 |
| statistics 复盘基线（10 条只读查询） | 只读，无写入 | 无残留 |

> **频道已保留，未执行删除**。可选的人工清理命令（**本场景未执行**）：
> ```bash
> npx --yes polyv-live-cli@latest channel delete -c 7983903   # 仅人工确认需要清理时执行
> ```

## 15. 可复用模板

### 15.1 场次编排模板（需账号已开通「新版场次」权益）

```bash
CHANNEL_ID="<你的频道ID>"
# 计划开播时间（13 位毫秒时间戳），示例：明天 20:00~21:00
START_MS=$(date -v+1d -j -f "%Y-%m-%d %H:%M:%S" "$(date -v+1d "+%Y-%m-%d") 20:00:00" "+%s")000
END_MS=$(date -v+1d -j -f "%Y-%m-%d %H:%M:%S" "$(date -v+1d "+%Y-%m-%d") 21:00:00" "+%s")000
# 建命名场次（⚠️ 需账号已开通「新版场次 + 手动创建」权益）
npx --yes polyv-live-cli@latest session create -c "$CHANNEL_ID" \
  --name "618新品首发场-晚场" --plan-start-time "$START_MS" --plan-end-time "$END_MS" \
  --splash-img "https://your-cdn.com/warmup.png" -f -o json
# 查场次台账
npx --yes polyv-live-cli@latest session list -c "$CHANNEL_ID" -o json
```

### 15.2 场次/频道数据复盘模板（直播后执行）

```bash
CHANNEL_ID="<你的频道ID>"
# 时间窗（13 位毫秒，≤3 个月），示例：最近 7 天
START_TS=$(date -v-7d "+%s")000; END_TS=$(date "+%s")000
# 场均指标
npx --yes polyv-live-cli@latest statistics max-concurrent -c "$CHANNEL_ID" --start-time "$START_TS" --end-time "$END_TS" -o json
npx --yes polyv-live-cli@latest statistics channel-statistic -c "$CHANNEL_ID" --start-date "$(date -v-7d "+%Y-%m-%d")" --end-date "$(date "+%Y-%m-%d")" -o json
npx --yes polyv-live-cli@latest statistics channel-summary -c "$CHANNEL_ID" --start-day "$(date -v-7d "+%Y-%m-%d")" --end-day "$(date "+%Y-%m-%d")" -o json
# 观众画像
npx --yes polyv-live-cli@latest statistics audience device -c "$CHANNEL_ID" --start-time "$START_TS" --end-time "$END_TS" -o json
npx --yes polyv-live-cli@latest statistics audience region -c "$CHANNEL_ID" --start-time "$START_TS" --end-time "$END_TS" -o json
# 商品点击转化
npx --yes polyv-live-cli@latest statistics product-click -c "$CHANNEL_ID" --start-time "$START_TS" --end-time "$END_TS" -o json
npx --yes polyv-live-cli@latest statistics product-list-click -c "$CHANNEL_ID" --start-time "$START_TS" --end-time "$END_TS" -o json
# 场次级汇总
npx --yes polyv-live-cli@latest statistics session-summary-list -c "$CHANNEL_ID" --start-time "$START_TS" --end-time "$END_TS" -o json
npx --yes polyv-live-cli@latest statistics channel-session-stats -c "$CHANNEL_ID" --start-time "$START_TS" --end-time "$END_TS" -o json
```

### 15.3 statistics 时间参数速查（避免混用踩坑）

| 子命令 | 时间参数 | 类型 |
|---|---|---|
| `max-concurrent` | `--start-time`/`--end-time` | 13 位毫秒 |
| `channel-statistic` | `--start-date`/`--end-date` | yyyy-MM-dd |
| `channel-summary` | `--start-day`/`--end-day` | yyyy-MM-dd（latest 1.2.38 起空数据输出 `[]`） |
| `view` | `--start-day`/`--end-day` | yyyy-MM-dd |
| `audience device`/`audience region` | `--start-time`/`--end-time` | 13 位毫秒 |
| `product-click`/`product-list-click` | `--start-time`/`--end-time` | 13 位毫秒 |
| `session-summary-list`/`channel-session-stats` | `--start-time`/`--end-time` | 13 位毫秒 |

## 16. 后续可扩展方向

- **场次编排成功路径补全**：在一个已开通「新版场次」权益的账号/频道上重跑 `session create`，并用 `session get`/`update`/`delete` 跑完整生命周期（含 update 前后 name/plan-time 对比验证），补全问题 1 的成功路径。本场景因账号权益受限未做。
- **场次×商品转化闭环**：把 `statistics product-click` 商品点击 × 场景 02 的 `product push` 商品大卡推送记录 × `session-summary-list` 场次汇总交叉，量化「单场主推款点击转化率」，做场次级 GMV 归因。
- **观众地域×投流复盘闭环**：把 `statistics audience region` 观众地域分布 × 投流后台地域出价交叉，判断投流地域命中精度，指导下场投流策略。
- **覆盖剩余数据/治理命令**：`statistics`/`session` 已覆盖；数据复盘与治理域剩余 `viewer`（观众）、`custom-field`（自定义字段）、`invite-sales`（邀请榜单）可在后续场景补全，做「观众分层运营」「邀请榜单裂变」。
- **`channel-summary` 回归监控**：问题 2 已在 `polyv-live-cli@1.2.38` 修复；后续统计类空数据命令应继续保持 `[]` 或友好空提示，避免回退到字面 `undefined`。
