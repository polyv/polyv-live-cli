# 场景 16：直播运营财务与合规复盘 — 账单明细 + 音视频内容安全审核 + 集团账号资源/计费盘点

> 覆盖一级命令：`finance`（已执行成功 + 已执行失败）、`group`（已执行失败，账号级集团权益门控）
> 业务阶段：**数据复盘 / 治理**
> 专用测试频道：`7983957`（账号级命令为主，频道仅作 `finance` 音视频审核的频道侧查询落点）

---

## 1. 场景名称

**直播运营财务与合规复盘 — 账单明细查询 + 音视频内容安全审核 + 集团账号资源/计费盘点**

电商品牌在月度/季度直播运营收尾时，运营负责人与财务/合规岗需要做三件事：
1. **财务复盘**：拉取本月直播/点播时长类账单明细，核对消耗、对账结算。
2. **合规复盘**：核查直播音频/视频内容是否开启安全审核，盘点审核命中记录，满足广告法/平台合规留痕。
3. **集团资源盘点**（多账号品牌）：查询集团主账号下子账号的资源配额（并发/流量/存储/时长）与日计费、调拨日志。

本场景用 `finance` 与 `group` 两个一级命令族完成这三类只读复盘。

---

## 2. 覆盖命令

| 一级命令 | 子命令 | 执行状态 | 说明 |
|---|---|---|---|
| `finance` | `bill-detail-list` | ✅ 已执行成功 | 账号级账单明细查询，结构化分页返回 |
| `finance` | `audio-moderation get` | ❌ 已执行失败 | 账号未开启音频审核功能 |
| `finance` | `audio-moderation list` | ❌ 已执行失败 | 账号未开启音频审核功能 |
| `finance` | `video-moderation get` | ❌ 已执行失败 | 账号未开启视频审核功能 |
| `finance` | `video-moderation result-list` | ❌ 已执行失败 | 账号未开启视频审核功能 |
| `group` | `billing-daily` | ❌ 已执行失败 | 找不到集团账号（当前账号非集团主账号） |
| `group` | `health-check` | ❌ 已执行失败 | 找不到集团账号 |
| `group` | `allocate-log` | ❌ 已执行失败 | 需子账号邮箱；当前账号非集团主账号 |
| `group` | `user billing-daily` | ❌ 已执行失败 | 找不到集团账号 |
| `group` | `user package-list` | ❌ 已执行失败 | 找不到集团账号 |
| `group` | `user package-validity-list` | ❌ 已执行失败 | 找不到集团账号 |

> `finance` 命令族因核心业务命令 `bill-detail-list` 真实执行成功（结构化分页返回）而计入已覆盖；音视频审核子命令族因账号级审核功能未开通已执行失败并记录。
> `group` 命令族为集团（多账号）治理命令，所有子命令真实执行均命中「账号非集团主账号」账号级权益门控，全部已执行失败并完整记录错误与下一步排查——按覆盖口径「已执行失败」计入真实执行覆盖，而非仅 help 校验。

---

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道 ID | `7983957` |
| 频道名称 | `GNHF-电商场景-16-finance-group-compliance-202606230630` |
| 创建命令 | `npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-16-finance-group-compliance-202606230630"` |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，全局配置默认账号） |
| Scene / Template | `topclass` / `ppt`（当前 rc 默认，不可自定义为 alone，见迭代 15 学习记录） |
| 创建时 watchStatus | `unStart`（频道 `waiting`） |
| 创建时间 | 2026/6/23 02:08:51 |
| 删除状态 | **频道已保留，未执行删除** |

> `finance` 与 `group` 均为**账号级**命令族（账单、审核、集团资源都是账号级能力，不挂在单个频道下）。本场景专用测试频道 `7983957` 仅承担 `finance audio-moderation get/list`、`finance video-moderation get/result-list` 的**频道侧查询落点**（这四个子命令的 `-c/--channel-id` 参数）。`finance bill-detail-list` 与全部 `group` 子命令均不带频道参数，作用范围为整个账号。

---

## 4. 行业背景

直播电商进入规模化运营后，财务、合规、平台治理三岗会在每个结算周期对直播中台做集中复盘：

- **财务岗**要核对直播时长、录制时长等按量计费类目的实际消耗，确认账单金额与业务侧预估一致，避免超量扣费。
- **合规岗**要确认直播间音频/视频是否走了平台内容安全审核，对命中违禁词/违规画面的场次留痕，应对平台合规检查与广告法审查。
- **集团品牌岗**（多账号矩阵）要盘点主账号下各子账号（不同门店/不同业务线）的资源配额、日计费、调拨变更日志，做容量规划与成本分摊。

`finance`（财务/审核）与 `group`（集团多账号治理）正是支撑这三类复盘的命令族。

---

## 5. 业务目标与核心 KPI

| 维度 | 目标 | KPI |
|---|---|---|
| 财务复盘 | 拉取本月时长类账单明细，建立消耗基线 | `finance bill-detail-list` 各 item-category 的 totalItems / 月度时长合计 |
| 合规复盘 | 核查内容审核开关与命中记录 | 音频/视频审核开启状态（enabled）、命中违规条数 |
| 集团治理 | 盘点子账号资源配额与日计费 | 各子账号 package 剩余配额、日计费明细、调拨日志条数 |

---

## 6. 适用角色

- 直播运营负责人（月度运营复盘）
- 财务/结算岗（账单核对）
- 合规/风控岗（内容审核留痕）
- 集团/多账号品牌运营管理岗（资源配额与成本分摊）

---

## 7. 前置条件

1. 已配置默认账号（`account current` 可返回 `nicksu`，全局配置来源）。
2. 已创建专用测试频道 `7983957`（`finance` 审核查询的频道侧落点）。
3. **财务账单查询**：对账号级 API 有读权限即可（`finance bill-detail-list` 直接可用）。
4. **音视频内容审核**：需账号已在保利威后台开通「音频审核」「视频审核」功能（见 §12 问题记录）。
5. **集团多账号治理**：需当前账号为「集团主账号」（见 §12 问题记录）。

---

## 8. polyv-live-cli-rc 能力映射

| 业务动作 | 命令 | 作用层级 |
|---|---|---|
| 查询时长类账单明细 | `finance bill-detail-list --item-category <category> --start-date --end-date` | 账号级 |
| 查询音频审核设置 | `finance audio-moderation get -c <channelId>` | 账号级开关 + 频道侧查询 |
| 列出音频审核记录 | `finance audio-moderation list -c <channelId>` | 账号级开关 + 频道侧查询 |
| 查询视频审核设置 | `finance video-moderation get -c <channelId>` | 账号级开关 + 频道侧查询 |
| 列出视频审核结果 | `finance video-moderation result-list -c <channelId>` | 账号级开关 + 频道侧查询 |
| 集团日计费 | `group billing-daily --billing-date <yyyyMM>` | 集团账号级 |
| 集团后端健康检查 | `group health-check` | 集团账号级 |
| 集团资源调拨日志 | `group allocate-log --emails <sub-emails> --type <all|live|vod>` | 集团账号级 |
| 子账号日计费 | `group user billing-daily --start-date <yyyyMM> --end-date <yyyyMM>` | 集团账号级 |
| 子账号套餐列表 | `group user package-list` | 集团账号级 |
| 子账号套餐剩余有效期 | `group user package-validity-list` | 集团账号级 |

> 更新类命令（`finance audio-moderation update`、`finance video-moderation update`、`group resource set-*`、`group user create/package-update/secret-reset` 等）为写入命令，爆炸半径覆盖账号级配置或集团资源，按风险规则本轮不执行写入，仅做只读复盘。

---

## 9. 实施步骤

1. **账号预检**：`account current` 确认默认账号 `nicksu` 与账号环境。
2. **建专用测试频道**：`channel create -n <场景名>` → `7983957`，`channel get` 复核。
3. **财务账单复盘**：对 `duration`/`seminarDuration`/`seminarRecordDuration` 三类 item-category，按单月窗口分别 `finance bill-detail-list` 拉账单明细。
4. **内容审核复盘**：对测试频道 `7983957` 执行 `finance audio-moderation get/list`、`finance video-moderation get/result-list`，核查审核开关与命中记录（本账号未开通，记录为问题）。
5. **集团资源复盘**：执行 `group billing-daily`、`group health-check`、`group allocate-log`、`group user billing-daily/package-list/package-validity-list`，盘点集团子账号资源与计费（当前账号非集团主账号，记录为问题）。
6. **沉淀台账与问题记录**，更新 README 覆盖矩阵。

---

## 10. 命令执行台账

> 执行时间：2026-06-23（UTC+8 凌晨）；账号 `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`）。敏感值脱敏。

| # | 时间 | 一级命令 / 子命令 | 实际执行命令（脱敏） | 频道/对象 | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 06-23 02:08 | `account current` | `npx --yes polyv-live-cli@rc account current` | — | ✅ 成功 | 默认账号 `nicksu`，全局配置来源，6 个可用账号 |
| 2 | 06-23 02:08 | `channel create` | `... channel create -n "GNHF-电商场景-16-...-202606230630"` | — | ✅ 成功 | channelId=`7983957`，scene=topclass/template=ppt，waiting |
| 3 | 06-23 02:09 | `channel get` | `... channel get -c 7983957 -o json` | 7983957 | ✅ 成功 | name 命中，watchStatus=unStart，scene=ppt |
| 4 | 06-23 02:10 | `finance bill-detail-list` | `... finance bill-detail-list --item-category duration --start-date 2026-06-01 --end-date 2026-06-23 --page 1 --page-size 20 -o json` | 账号级 | ✅ 成功 | 结构化分页：totalItems=0、contents=[]、totalPages=0 |
| 5 | 06-23 02:10 | `finance bill-detail-list` | `... --item-category seminarDuration --start-date 2026-06-01 --end-date 2026-06-23 ...` | 账号级 | ✅ 成功 | totalItems=0、contents=[] |
| 6 | 06-23 02:10 | `finance bill-detail-list` | `... --item-category seminarRecordDuration --start-date 2026-06-01 --end-date 2026-06-23 ...` | 账号级 | ✅ 成功 | totalItems=0、contents=[] |
| 7 | 06-23 02:11 | `finance bill-detail-list` | `... --item-category duration --start-date 2026-05-01 --end-date 2026-05-31 ...` | 账号级 | ✅ 成功 | totalItems=0（5 月亦无时长类账单） |
| 8 | 06-23 02:11 | `finance bill-detail-list` | `... --item-category seminarDuration --start-date 2026-05-01 --end-date 2026-05-31 ...` | 账号级 | ✅ 成功 | totalItems=0 |
| 9 | 06-23 02:12 | `finance bill-detail-list`（参数探测） | `... finance bill-detail-list --item-category live ...`（试 live/vod/concurrency/flow/space/all） | 账号级 | ❌ 失败 | `itemCategory must be one of: seminarDuration, seminarRecordDuration, duration`（探明合法枚举） |
| 10 | 06-23 02:12 | `finance audio-moderation get` | `... finance audio-moderation get -c 7983957 -o json` | 7983957 | ❌ 失败 | `账号未开启音频审核功能` |
| 11 | 06-23 02:12 | `finance audio-moderation list` | `... finance audio-moderation list -c 7983957 --page 1 --page-size 10 -o json` | 7983957 | ❌ 失败 | `账号未开启音频审核功能` |
| 12 | 06-23 02:12 | `finance video-moderation get` | `... finance video-moderation get -c 7983957 -o json` | 7983957 | ❌ 失败 | `账号未开启视频审核功能` |
| 13 | 06-23 02:12 | `finance video-moderation result-list` | `... finance video-moderation result-list -c 7983957 --page 1 --page-size 10 -o json` | 7983957 | ❌ 失败 | `账号未开启视频审核功能` |
| 14 | 06-23 02:13 | `group billing-daily` | `... group billing-daily --billing-date 202606 --page 1 --page-size 10 -o json` | 集团账号级 | ❌ 失败 | `找不到集团账号` |
| 15 | 06-23 02:13 | `group health-check` | `... group health-check -o json` | 集团账号级 | ❌ 失败 | `找不到集团账号` |
| 16 | 06-23 02:13 | `group allocate-log`（参数探测） | `... group allocate-log --type all --start-time "2026-06-01 00:00:00" --end-time "2026-06-23 23:59:59" ...`（无 --emails） | 集团账号级 | ❌ 失败 | `required option '--emails <emails>' not specified` |
| 17 | 06-23 02:13 | `group allocate-log` | `... group allocate-log --emails "nicksu" --type all ...` | 集团账号级 | ❌ 失败 | `account not found.`（`nicksu` 非子账号邮箱） |
| 18 | 06-23 02:14 | `group user billing-daily` | `... group user billing-daily --start-date 202606 --end-date 202606 -o json` | 集团账号级 | ❌ 失败 | `找不到集团账号` |
| 19 | 06-23 02:14 | `group user package-list` | `... group user package-list -o json` | 集团账号级 | ❌ 失败 | `找不到集团账号` |
| 20 | 06-23 02:14 | `group user package-validity-list` | `... group user package-validity-list -o json` | 集团账号级 | ❌ 失败 | `找不到集团账号` |

---

## 11. 实际使用的 CLI 命令与真实参数

### 11.1 财务账单明细查询（账号级，成功）

```bash
# 合法 item-category 枚举：duration / seminarDuration / seminarRecordDuration
# start-date / end-date 必须落在同一自然月（yyyy-MM-dd）
npx --yes polyv-live-cli@rc finance bill-detail-list \
  --item-category duration \
  --start-date 2026-06-01 \
  --end-date 2026-06-23 \
  --page 1 --page-size 20 -o json
```

返回结构（2026-06，测试账号无时长类消耗）：

```json
{
  "pageSize": 20, "pageNumber": 1, "totalItems": 0, "contents": [],
  "limit": 0, "endRow": 0, "totalPages": 0, "startRow": 1,
  "firstPage": true, "lastPage": false, "nextPageNumber": 1,
  "prePageNumber": 1, "offset": 0
}
```

### 11.2 音视频内容审核查询（账号级开关门控，失败）

```bash
npx --yes polyv-live-cli@rc finance audio-moderation get -c 7983957 -o json
# → Unexpected error: 账号未开启音频审核功能

npx --yes polyv-live-cli@rc finance video-moderation get -c 7983957 -o json
# → Unexpected error: 账号未开启视频审核功能
```

### 11.3 集团账号资源/计费盘点（集团主账号门控，失败）

```bash
npx --yes polyv-live-cli@rc group billing-daily --billing-date 202606 -o json
# → Unexpected error: 找不到集团账号

npx --yes polyv-live-cli@rc group health-check -o json
# → Unexpected error: 找不到集团账号

npx --yes polyv-live-cli@rc group user billing-daily --start-date 202606 --end-date 202606 -o json
# → Unexpected error: 找不到集团账号
```

---

## 12. 执行或验证结果 / 问题记录

### 12.1 `finance bill-detail-list` — 账号级账单复盘基线（成功）

- `--item-category` **为必填**（help 未标 required），且合法枚举只有三个：`duration`（直播观看时长）、`seminarDuration`（研讨会/大班课直播时长）、`seminarRecordDuration`（研讨会录制时长）。传入 `live`/`vod`/`concurrency`/`flow`/`space`/`all` 等直觉值均报 `itemCategory must be one of: seminarDuration, seminarRecordDuration, duration`。
- `--start-date`/`--end-date`（`yyyy-MM-dd`）**必须落在同一自然月**，跨月报 `startDate and endDate must be in the same month`。跨月复盘需按月分多次调用。
- 测试账号 `nicksu` 在 2026-05、2026-06 两月对三类 item-category 的 `totalItems` 均为 0，`contents=[]`，属「无时长类按量消耗」的合法基线。**配置侧已满足条件**（API 返回结构化分页），观众侧无对应概念。
- 覆盖口径：`bill-detail-list` 真实执行成功并返回结构化数据，`finance` 命令族计入**已覆盖（✅）**。

### 12.2 `finance audio-moderation` / `video-moderation` — 账号级审核功能未开通（已执行失败）

- 四个子命令（`audio-moderation get/list`、`video-moderation get/result-list`）对测试频道 `7983957` 全部返回 `账号未开启音频审核功能` / `账号未开启视频审核功能`。
- 错误文案为「**账号**未开启」而非「频道未开启」，且这四个子命令虽带 `-c/--channel-id` 频道参数，门控却是**账号级**——即审核是账号级能力开关，频道参数仅用于过滤查询范围。
- 排查：这是账号级功能门控，与场景 07 `session create`（新版场次权益未开通）、场景 11 `transmit create/associate`（转播权益门控）同类。CLI 无对应「开启审核」子命令，需在保利威后台开通「音频审核」「视频审核」功能后才能查询。
- **下一步建议**：合规复盘前，先在后台确认账号已开通音视频审核；若未开通，`finance audio-moderation`/`video-moderation` 整族不可用，合规留痕需另寻平台侧审核日志。
- 覆盖口径：四个子命令真实执行并命中账号级门控，按「已执行失败（❌）」记录；`finance` 族已由 `bill-detail-list` 成功覆盖，整体计入已覆盖。

### 12.3 `group` 全族 — 当前账号非集团主账号（已执行失败）

- `group` 的 `billing-daily`、`health-check`、`user billing-daily`、`user package-list`、`user package-validity-list` 五个子命令全部返回 `找不到集团账号`。
- `group allocate-log` / `group user allocation-log` 必填 `--emails`（逗号分隔的子账号邮箱）；传入 `nicksu`（账号名而非邮箱）报 `account not found.`，说明该参数需要**真实的子账号邮箱**，且其前置仍是当前账号须为集团主账号。
- 根因：当前测试账号 `nicksu` 是**普通单账号**，不是「集团主账号」（集团/多账号管理体系下的主账号），因此整个 `group` 命令族的后端接口在账号解析阶段就被 `找不到集团账号` 拦截，与参数、频道、时间窗口无关。
- 排查：交叉验证——`group billing-daily`（带 `--billing-date`）、`group health-check`（无参）、`group user package-list`（无参）三种不同形态的子命令同账号同报错，确认为账号级门控而非单命令参数问题。
- **下一步建议**：集团多账号治理复盘必须在「集团主账号」身份下执行；单账号品牌无集团体系，`group` 整族不可用，资源/计费盘点应改用 `finance bill-detail-list`（本账号级）+ 各子账号各自的 `account` 体系分别查询。
- 覆盖口径：`group` 全族真实执行并命中账号级集团权益门控，按「已执行失败（❌）」计入真实执行覆盖（非仅 help 校验）。

### 12.4 配置侧 vs 观众侧验证区分

- 本场景所有命令均为**账号级/集团级只读复盘命令**，验证对象是配置侧的账单数据、审核开关、集团资源配额，**不存在「观众侧」概念**。文档结论一律落在「配置侧已满足条件 / 账号级门控阻断」，不声称任何观众侧效果。

---

## 13. 风险点与回滚/清理方式

| 风险 | 说明 | 处置 |
|---|---|---|
| 误传写入类 `update`/`set` 命令 | `finance audio-moderation update`、`finance video-moderation update`、`group resource set-*`、`group user create/package-update/secret-reset` 等为账号级/集团级写入，爆炸半径大 | 本轮**未执行任何写入**，仅做只读复盘 |
| 集团资源调拨误操作 | `group resource set-concurrences/set-flow/set-live-durations/set-space` 会真实变更子账号资源配额 | 未执行；未来需要时必须在集团主账号下、对明确子账号、用 `--force` 显式确认 |
| 账单查询跨月 | 跨月报错但不会产生数据，无副作用 | 仅查询，无回滚需求 |
| 测试频道残留 | 频道 `7983957` 保留未删除 | 见 §14，可选人工清理（未执行） |

**可选人工清理命令（未执行，仅供后续人工清理测试频道）：**

```bash
# 仅在确认不再需要本测试频道时，由人工执行（本轮未执行）
npx --yes polyv-live-cli@rc channel delete -c 7983957   # 如该子命令存在且经 --help 校验后由人工确认
```

> 本轮未产生任何账号级/集团级写入，`finance`/`group` 均为只读复盘，无需回滚。测试频道按规则保留。

---

## 14. 保留资产说明

| 资产 | 类型 | 状态 |
|---|---|---|
| 频道 `7983957`（`GNHF-电商场景-16-finance-group-compliance-202606230630`） | 频道级 | **保留，未删除**（供人工查看频道配置） |
| `finance bill-detail-list` 查询结果（2026-05/06 两月三类 item-category 均 totalItems=0） | 账号级只读数据 | 无写入，无残留 |
| 音视频审核 / 集团资源查询 | 账号级只读 | 全部因账号级门控失败，无任何写入残留 |

> 本场景未产生任何写入型资产（无审核开关变更、无集团资源调拨、无账单生成），保留项仅测试频道 `7983957`。

---

## 15. 可复用模板

### 15.1 月度财务账单复盘模板

```bash
# 对三类时长 item-category，按月分别拉账单（单月窗口）
for cat in duration seminarDuration seminarRecordDuration; do
  echo "===== $cat (2026-06) ====="
  npx --yes polyv-live-cli@rc finance bill-detail-list \
    --item-category "$cat" \
    --start-date 2026-06-01 --end-date 2026-06-30 \
    --page 1 --page-size 100 -o json
done
```

### 15.2 直播间内容合规审核核查模板（需账号已开通审核）

```bash
# 音频审核：设置 + 命中记录
npx --yes polyv-live-cli@rc finance audio-moderation get -c <频道ID> -o json
npx --yes polyv-live-cli@rc finance audio-moderation list -c <频道ID> \
  --start-time <13位毫秒> --end-time <13位毫秒> -o json

# 视频审核：设置 + 结果记录
npx --yes polyv-live-cli@rc finance video-moderation get -c <频道ID> -o json
npx --yes polyv-live-cli@rc finance video-moderation result-list -c <频道ID> \
  --start-time <13位毫秒> --end-time <13位毫秒> --result-type <逗号分隔> -o json
```

### 15.3 集团多账号资源/计费盘点模板（需集团主账号）

```bash
# 集团日计费 + 后端健康检查
npx --yes polyv-live-cli@rc group billing-daily --billing-date 202606 -o json
npx --yes polyv-live-cli@rc group health-check -o json

# 子账号套餐与有效期盘点
npx --yes polyv-live-cli@rc group user package-list -o json
npx --yes polyv-live-cli@rc group user package-validity-list -o json

# 子账号日计费（yyyyMM 区间）
npx --yes polyv-live-cli@rc group user billing-daily --start-date 202606 --end-date 202606 -o json

# 资源调拨日志（子账号邮箱逗号分隔）
npx --yes polyv-live-cli@rc group allocate-log \
  --emails "<sub1@x.com>,<sub2@x.com>" --type all \
  --start-time "2026-06-01 00:00:00" --end-time "2026-06-30 23:59:59" -o json
```

---

## 16. 后续可扩展方向

1. **真实账单复盘**：在有真实直播时长消耗的账号/月份上跑 `finance bill-detail-list`，沉淀真实的月度时长合计与对账模板（本测试账号 totalItems=0）。
2. **内容审核闭环**：账号在后台开通音视频审核后，补全 `audio-moderation update`/`video-moderation update` 写入与命中记录核查，形成「开通→开播→命中→处置」合规闭环。
3. **集团资源调拨演练**：在集团主账号下，对明确子账号用 `group resource set-concurrences/set-flow` 做配额调拨并经 `group allocate-log` 复盘变更，形成多账号容量治理 SOP。
4. **财务审核自动化**：把 `finance bill-detail-list` 的 JSON 结果接入财务对账脚本，按月自动核对时长类消耗与结算金额。
5. **`group user create`/`secret-reset`**：在集团主账号下演练子账号创建与密钥重置，覆盖集团账号生命周期（本轮因账号级门控未执行）。
