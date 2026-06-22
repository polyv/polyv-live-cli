# 场景 11：多渠道分销推广 — 推广渠道归因 + 分销员邀请名册

> 业务阶段：**转化 / 数据复盘 / 治理**
> 覆盖一级命令：`promotion`、`invite-sales`、`channel`、`account`
> 真实执行状态：**已执行成功**（`promotion`、`invite-sales` 两族均有业务命令在真实测试频道/真实测试对象上真实执行成功，且写入均经只读复查交叉验证持久化）

---

## 1. 场景名称

多渠道分销推广 —— 把「一场大促/新品首发」拆成**「人」与「渠道」两层分销体系**：先用推广渠道为每个分销来源（达人 A、达人 B、私域社群 C）生成独立归因入口，按渠道统计访问/观看/预约/报名；再用邀请销售名册维护分销员（销售/导购）的花名册与所属组织，按人统计其跟进客户数。

核心是把「建推广渠道 → 按渠道复盘归因 → 查分销员名册 → 新增分销员 → 调整分销员组织 → 移除分销员」串成一个可照着执行的操作闭环：

- **渠道归因侧（`promotion`）**：批量创建推广渠道（每个渠道一个 `promoteId` + 归因链接），按渠道查询访问次数 / 观看人数 / 预约数 / 报名数，做大促后的渠道 ROI 复盘。
- **分销员名册侧（`invite-sales`）**：查询账号下分销员（邀请销售）名册及其所属组织、跟进客户数；新增 / 调整组织 / 移除分销员，维护分销团队。

> 📌 本场景同时探索了 `transmit`（转播/分会场）命令族，但 `transmit create` 与 `transmit associate` 在测试账号下均返回 `access forbidden`（账号级转播权益未开通），仅 `transmit list` 只读可用。为保持本场景「分销推广」主题聚焦，`transmit` 不计入本轮覆盖，其发现记录在第 12.3 节与第 15 节，留待未来「多平台同步转播 / 分会场直播」场景专项覆盖。

## 2. 覆盖命令

| 一级命令 | 子命令 | 执行状态 | 说明 |
|---|---|---|---|
| `account` | `account current`、`account list` | 已执行成功 | 写入前账号预检（`nicksu`，production，User ID `475b6884a7`） |
| `channel` | `channel create`、`channel get` | 已执行成功 | 创建专用测试频道 `7983938` 并复核 watchStatus=unStart、频道保留 |
| `promotion` | `promotion list`（建渠道前基线 ×3 频道） | 已执行失败 | 3 个**零渠道**频道（7983938/7983937/7983934）均返回 `Unexpected error: 系统异常`（exit 非 0），见第 12.1 节 |
| `promotion` | `promotion create --names "达人A,达人B,私域社群C" --force` | 已执行成功 | **真实写入**：批量建 3 个推广渠道，返回 promoteId `aDnZib`/`8TPDLD`/`slrMEQ` |
| `promotion` | `promotion list`（建渠道后复查） | 已执行成功 | 返回 3 个渠道 + 归因指标（visitsNum/watchNum/reservationNum/enrollNum 均 0），与 create 一一对应，确认持久化 |
| `invite-sales` | `invite-sales list`（基线 + 多次复查） | 已执行成功 | 账号级分销员名册查询，基线 1 人（Nick，组织「总部」/29031，customerNum=0） |
| `invite-sales` | `invite-sales follow-viewer list` | 已执行成功 | 分销员跟进客户查询（totalItems=0，Nick 暂未跟进客户，结构完整） |
| `invite-sales` | `invite-sales add --viewer-union-ids … --organization-id 29031 --force` | 已执行成功 | **真实写入**：新增测试分销员「批量测试用户1」，`list` 复查 totalItems 1→2 确认持久化 |
| `invite-sales` | `invite-sales add`（对「数据一致性测试用户」） | 已执行失败 | 报 `参数错误`，特定 viewer 不符合分销员录入条件，见第 12.2 节 |
| `invite-sales` | `invite-sales update --organization-id 29031 --force` | 已执行成功 | **真实写入**：更新测试分销员所属组织，返回 success |
| `invite-sales` | `invite-sales remove --viewer-union-ids … --force` | 已执行成功 | **真实写入 + 清理**：移除测试分销员，`list` 复查 totalItems 2→1（回到基线仅 Nick），确认清理干净 |

> 说明：本场景所有「已执行成功」命令均使用真实账号（`nicksu`）与真实测试频道（`7983938`，推广渠道为频道级资产）/ 真实账号级对象（invite-sales 名册）真实执行过，下文「命令执行台账」逐条记录。`promotion` 族的 create 真实写入并经 `list` 前后对比验证（建前 系统异常 → 建后 3 渠道）；`invite-sales` 族的 add/update/remove 构成「新增→调整→移除」完整写入生命周期，且每步均经 `invite-sales list` 复查 totalItems 流转（1→2→1）确认持久化与清理。两族均真实执行覆盖。

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道名称 | `GNHF-电商场景-11-promotion-transmit-multichannel-202606230059` |
| 频道 ID | `7983938` |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production） |
| 场景类型 | `alone`（活动营销） |
| 模板 | `alone`（纯视频-横屏） |
| 创建结果 | 成功（status=waiting / watchStatus=unStart / 未开始） |
| 创建时间 | 2026-06-23 01:00:02 CST |
| 是否删除 | **否，频道已保留**，供人工在后台查看推广渠道归因配置 |

> 创建命令：`npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-11-promotion-transmit-multichannel-202606230059" -d "多渠道分销推广场景：推广渠道归因 + 多平台转播分发" --scene alone --template alone -o json`，返回 `channelId=7983938`。`channel get` 复核 watchStatus=unStart、name 一致。
>
> 频道名包含 `transmit` 字样是因为本轮初期曾计划同时覆盖转播命令族，后探索发现 `transmit` 写入受账号级权益门控（见第 12.3 节），本场景聚焦 `promotion` + `invite-sales`，频道名保留不改（推广渠道为该频道的频道级资产，已正常落库）。
>
> 注：`promotion` 为**频道级**命令（推广渠道挂在本轮测试频道 `7983938` 下）；`invite-sales` 为**账号级**命令（分销员名册对本账号所有频道可见），专用测试频道在 invite-sales 侧不承担落点，仅作 promotion 的频道侧载体。

## 4. 行业背景

电商直播的「**多渠道分销**」是大促和新品首发放量最常用的增长打法：品牌方不止自己播，还会把直播间分发给一批**达人（KOL/KOC）**、**私域社群**、**分销导购**，让每个渠道都带着专属入口去引流。成熟分销 SOP 通常包括两层：

- **渠道层（推广渠道归因）**：为每个分销来源生成一个独立推广渠道（带 `promoteId` 的归因链接），投放到对应达人社群。直播后按渠道统计**访问次数 / 观看人数 / 预约数 / 报名数**，算出每个渠道的引流 ROI，决定下一轮把佣金/坑位费投给谁。
- **人层（分销员名册）**：维护分销员（销售/导购/达人）的花名册与所属组织（总部/区域/门店），按人统计其**跟进客户数**，做大促后的分销团队绩效复盘与人头结算。

保利威的 `promotion`（营销推广渠道：建渠道 + 按渠道归因统计）与 `invite-sales`（邀请销售：分销员名册 + 跟进客户 + 组织调整）就是支撑这套两层分销体系的标准能力。本场景把「建推广渠道 → 按渠道复盘归因 → 查分销员名册 → 新增分销员 → 调整组织 → 移除分销员」串成一个真实可执行的操作手册，全部用真实测试频道与真实账号级对象验证，并如实记录 `promotion list` 在零渠道频道上返回「系统异常」、`invite-sales add` 对个别 viewer 返回「参数错误」两个发现。

## 5. 业务目标与核心 KPI

**业务目标**：用「推广渠道归因 + 分销员名册」两层体系，把一场大促的分销流量按渠道、按人头归因清楚，支撑佣金结算与下一轮渠道投放决策。

**核心 KPI**：

| KPI | 定义 | 配置侧可观测手段 |
|---|---|---|
| 渠道归因覆盖率 | 已配置推广渠道的引流来源占比 | `promotion list` 统计渠道数量（本场景建 3 个） |
| 单渠道引流质量 | 单渠道的访问/观看/预约/报名转化 | `promotion list` 的 visitsNum/watchNum/reservationNum/enrollNum |
| 分销员在册人数 | 账号下活跃分销员总数 | `invite-sales list` 的 totalItems（本场景基线 1，演练峰值 2，收尾回 1） |
| 分销员人均客户数 | 分销员平均跟进客户数 | `invite-sales list` 的 customerNum + `invite-sales follow-viewer list` |

> 配置侧 vs 观众侧：本场景 `promotion create` 建渠道、`invite-sales add/update/remove` 维护名册均属**配置侧**写入，已用 `promotion list` / `invite-sales list` 只读复查交叉验证持久化。但推广渠道的**实际访问/观看/预约/报名计数**需观众真正通过归因链接进入直播间才会增长——本场景测试频道未开播、无真实观众进入，归因指标恒为 0，**渠道引流质量未在观众侧验证**（属预期）。文档不声称「观众侧已产生引流数据」。

## 6. 适用角色

| 角色 | 在本场景的职责 |
|---|---|
| 分销 / 渠道运营 | 大促前为每个分销来源建推广渠道、分发归因链接；大促后按渠道复盘引流 ROI |
| 销售 / 团队管理 | 维护分销员（销售/导购）名册与所属组织，按人结算佣金 |
| 数据复盘 | 用 `promotion list` 渠道归因指标 + `invite-sales list` 人头客户数做分销绩效复盘 |

## 7. 前置条件

1. 已配置 PolyV 账号并有可用 App ID / App Secret（本场景用 `nicksu`，production）。
2. 有一个**专用测试频道**承载推广渠道（本场景新建 `7983938`，推广渠道为频道级资产）。
3. `promotion create` 为频道级批量写入，`--names` 用英文逗号分隔、渠道名本身不含逗号；写入需 `--force` 或交互确认。
4. `invite-sales` 为**账号级**命令（分销员名册对本账号所有频道可见），`add`/`update`/`remove` 均需真实 `--viewer-union-ids`（来自 `viewer list` 的 unionId），且 viewer 需符合分销员录入条件（个别 viewer 会报「参数错误」，见第 12.2 节）。
5. **不要在用户长期主频道上批量建推广渠道**；推广渠道一旦建立，CLI 无对应 delete 子命令，需后台人工清理。

## 8. polyv-live-cli-rc 能力映射

| 业务动作 | 一级命令 | 子命令 | 真实 help 关键参数 |
|---|---|---|---|
| 列出频道推广渠道（含归因指标） | `promotion` | `list` | `--channelId <id>`（camelCase）、`-o/--output` |
| 批量建推广渠道 | `promotion` | `create` | `--channelId <id>`、`--names <逗号分隔>`、`-f/--force`、`-o` |
| 列出账号分销员名册 | `invite-sales` | `list` | `--page`、`--page-size`、`--viewer-union-id`、`--mobile`、`-k/--keyword`、`--organization-id`、`-o` |
| 列出分销员跟进客户 | `invite-sales` | `follow-viewer list` | `--page`、`--page-size`、`--invite-customer-id`、`--invite-customer-nickname`、`--viewer-id`、`--username`、`--telephone`、`--follow-status-list`、`-o` |
| 新增分销员 | `invite-sales` | `add` | `--viewer-union-ids <逗号分隔, ≤200>`、`--organization-id`、`-f/--force`、`-o` |
| 更新分销员组织 | `invite-sales` | `update` | `--viewer-union-ids <逗号分隔, ≤200>`、`--organization-id`、`-f/--force`、`-o` |
| 移除分销员 | `invite-sales` | `remove` | `--viewer-union-ids <逗号分隔, ≤100>`、`--new-viewer-union-id`（转移其跟进客户）、`-f/--force`、`-o` |

> ⚠️ 参数命名风格差异（与历史场景一致的踩坑点）：`promotion` 全族用 **camelCase**（`--channelId`），与 `card-push` 一致；`invite-sales` 全族用 **kebab-case**（`--viewer-union-ids`、`--organization-id`、`--follow-status-list`），与 `product`/`lottery` 一致。两族混用会报参数缺失或 unknown option，配置时必须各按各的 help。
>
> ⚠️ `promotion` 与 `invite-sales` 真实子命令面与 reference 一致，无偏差；`promotion` 仅 `create`/`list`，`invite-sales` 含 `add`/`follow-viewer`/`list`/`remove`/`update`。

## 9. 实施步骤

### 步骤 1：账号预检 + 建专用测试频道

```bash
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list
npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-11-promotion-transmit-multichannel-202606230059" -d "多渠道分销推广场景" --scene alone --template alone -o json
npx --yes polyv-live-cli@rc channel get -c 7983938 -o json   # 复核 watchStatus=unStart
```

### 步骤 2：查推广渠道基线（零渠道 = 系统异常，见问题 1）

```bash
npx --yes polyv-live-cli@rc promotion list --channelId 7983938 -o json
# Unexpected error: 系统异常（exit 非 0）—— 零渠道频道下 list 报错而非返回空数组，见第 12.1 节
npx --yes polyv-live-cli@rc promotion list --channelId 7983937 -o json   # 同样 系统异常（交叉验证既有频道）
```

### 步骤 3：批量建 3 个推广渠道（真实写入）

```bash
npx --yes polyv-live-cli@rc promotion create --channelId 7983938 --names "达人A,达人B,私域社群C" --force -o json
# 返回 [{promoteId:aDnZib, 达人A}, {promoteId:8TPDLD, 达人B}, {promoteId:slrMEQ, 私域社群C}]
```

### 步骤 4：按渠道复盘归因（建渠道后 list 正常，含归因指标）

```bash
npx --yes polyv-live-cli@rc promotion list --channelId 7983938 -o json
# 返回 3 个渠道 + visitsNum/watchNum/reservationNum/viewerNum/averageWatchTime/enrollNum（均 0，未开播无引流）
# ✅ 与 create 返回一一对应，确认持久化（与步骤 2 的「系统异常」基线对比）
```

### 步骤 5：查分销员名册与跟进客户基线

```bash
npx --yes polyv-live-cli@rc invite-sales list -o json
# 基线：totalItems=1，Nick（viewerUnionId 4_167v…，组织 总部/29031，customerNum=0）
npx --yes polyv-live-cli@rc invite-sales follow-viewer list -o json
# totalItems=0（Nick 暂未跟进客户）
```

### 步骤 6：取一个测试 viewer 的 unionId 作为新增分销员对象

```bash
npx --yes polyv-live-cli@rc viewer list -o json   # 账号级，取 unionId（本场景取「批量测试用户1」= 4_611h…）
```

### 步骤 7：新增测试分销员（真实写入 + list 前后对比）

```bash
npx --yes polyv-live-cli@rc invite-sales add --viewer-union-ids 4_611hbye3eaoxlgaomoj6rksxs6zygln6 --organization-id 29031 --force -o json
# { success: true }
npx --yes polyv-live-cli@rc invite-sales list -o json   # totalItems 1→2，批量测试用户1 入册 ✅
```

### 步骤 8：调整分销员组织（真实写入）

```bash
npx --yes polyv-live-cli@rc invite-sales update --viewer-union-ids 4_611hbye3eaoxlgaomoj6rksxs6zygln6 --organization-id 29031 --force -o json
# { success: true }（本账号仅有「总部/29031」一个组织，故演示同组织更新以验证命令可用）
```

### 步骤 9：移除测试分销员（真实写入 + 清理 + list 前后对比）

```bash
npx --yes polyv-live-cli@rc invite-sales remove --viewer-union-ids 4_611hbye3eaoxlgaomoj6rksxs6zygln6 --force -o json
# { success: true }
npx --yes polyv-live-cli@rc invite-sales list -o json   # totalItems 2→1，回到基线仅 Nick ✅ 清理干净
```

### 步骤 10：保留频道与推广渠道，记录清理命令（未执行）

```bash
# 人工清理（本场景未执行，频道与推广渠道已保留）：
# 推广渠道：CLI 无 promotion delete 子命令，需在保利威后台人工删除 3 个测试渠道
# 频道：npx --yes polyv-live-cli@rc channel delete -c 7983938   # 仅人工需要时执行
```

## 10. 命令执行台账

| # | 执行时间 (CST) | 一级命令.子命令 | 实际执行命令（敏感值脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 2026-06-23 01:00 | account.current | `account current` | — | 成功 | 默认账号 nicksu（App ID h2wazzobbq，production） |
| 2 | 2026-06-23 01:00 | account.list | `account list` | — | 成功 | 共 6 个账号，默认 nicksu |
| 3 | 2026-06-23 01:00 | channel.create | `channel create -n "GNHF-电商场景-11-…" --scene alone --template alone -o json` | 7983938 | 成功 | channelId=7983938，status=waiting，created=6/23/2026 1:00:02 AM |
| 4 | 2026-06-23 01:00 | channel.get | `channel get -c 7983938 -o json` | 7983938 | 成功 | name 一致、watchStatus=unStart、scene=alone（复核） |
| 5 | 2026-06-23 01:00 | promotion.list | `promotion list --channelId 7983938 -o json`（基线） | 7983938 | **执行失败** | `Unexpected error: 系统异常`（零渠道频道，见问题 1） |
| 6 | 2026-06-23 01:00 | promotion.list | `promotion list --channelId 7983937 -o json`（交叉验证） | 7983937 | **执行失败** | `系统异常`（既有零渠道频道同错） |
| 7 | 2026-06-23 01:00 | promotion.create | `promotion create --channelId 7983938 --names "达人A,达人B,私域社群C" --force -o json` | 7983938 | 成功 | 3 渠道：aDnZib(达人A)、8TPDLD(达人B)、slrMEQ(私域社群C) |
| 8 | 2026-06-23 01:00 | promotion.list | `promotion list --channelId 7983938 -o json`（建后复查） | 7983938 | 成功 | 3 渠道 + visitsNum/watchNum/reservationNum/viewerNum/averageWatchTime/enrollNum（均 0），与 #7 一一对应 ✅ 持久化 |
| 9 | 2026-06-23 01:01 | invite-sales.list | `invite-sales list -o json`（基线） | 账号级 | 成功 | totalItems=1，Nick（unionId 4_167v…，总部/29031，customerNum=0） |
| 10 | 2026-06-23 01:01 | invite-sales.follow-viewer.list | `invite-sales follow-viewer list -o json` | 账号级 | 成功 | totalItems=0（Nick 暂未跟进客户，结构完整） |
| 11 | 2026-06-23 01:01 | viewer.list | `viewer list -o json`（取测试 unionId） | 账号级 | 成功 | 取「批量测试用户1」unionId=4_611h…（73 名观众） |
| 12 | 2026-06-23 01:01 | invite-sales.add | `invite-sales add --viewer-union-ids 4_611h… --organization-id 29031 --force -o json` | 账号级 | 成功 | `{success:true}`；list 复查 totalItems 1→2（见 #14） |
| 13 | 2026-06-23 01:01 | invite-sales.add | `invite-sales add --viewer-union-ids 4_qncm… --organization-id 29031 --force -o json`（数据一致性测试用户） | 账号级 | **执行失败** | `Unexpected error: 参数错误`（特定 viewer 不符合录入条件，见问题 2） |
| 14 | 2026-06-23 01:01 | invite-sales.list | `invite-sales list -o json`（add 后复查） | 账号级 | 成功 | totalItems=2，批量测试用户1 入册（总部/29031）✅ 与基线 1 对比确认写入 |
| 15 | 2026-06-23 01:01 | invite-sales.update | `invite-sales update --viewer-union-ids 4_611h… --organization-id 29031 --force -o json` | 账号级 | 成功 | `{success:true}`（同组织更新，验证 update 命令可用） |
| 16 | 2026-06-23 01:01 | invite-sales.remove | `invite-sales remove --viewer-union-ids 4_611h… --force -o json`（清理） | 账号级 | 成功 | `{success:true}`；list 复查 totalItems 2→1（见 #17） |
| 17 | 2026-06-23 01:01 | invite-sales.list | `invite-sales list -o json`（remove 后复查） | 账号级 | 成功 | totalItems=1，仅 Nick ✅ 回到基线，测试分销员清理干净 |
| 18 | 2026-06-23 01:01 | transmit.list | `transmit list --channelId 7983938 -o json`（探索，未计入覆盖） | 7983938 | 成功 | `[]`（零转播关联，仅只读可用） |
| 19 | 2026-06-23 01:01 | transmit.create | `transmit create --channelId 7983938 --names "北京分会场,上海分会场" -o json`（探索） | 7983938 | **执行失败** | `Unexpected error: access forbidden`（账号级转播权益未开通，见问题 3） |
| 20 | 2026-06-23 01:01 | transmit.associate | `transmit associate --channelId 7983938 --receive-channel-ids 7983937 --type add --force -o json`（探索） | 7983938 | **执行失败** | `Unexpected error: access forbidden`（同权益门控） |

> 台账说明：#18–#20 为本轮对 `transmit` 的探索性执行，**不计入本轮覆盖**（`transmit` 仅 `list` 只读可用，写入受权益门控，留待未来转播场景专项覆盖）。`promotion` 覆盖依据 #7（create 真实写入）+ #8（list 复查确认持久化）；`invite-sales` 覆盖依据 #12（add）+ #14（list 复查 1→2）+ #15（update）+ #16（remove）+ #17（list 复查 2→1）的完整写入生命周期。

## 11. 实际使用的 CLI 命令与真实参数

> 以下为本场景真实执行过的命令（敏感值脱敏，viewer unionId 取部分前缀）。`<CLI>` = `npx --yes polyv-live-cli@rc`。

```bash
# 账号预检
<CLI> account current
<CLI> account list

# 建专用测试频道
<CLI> channel create -n "GNHF-电商场景-11-promotion-transmit-multichannel-202606230059" -d "多渠道分销推广场景" --scene alone --template alone -o json
<CLI> channel get -c 7983938 -o json

# 推广渠道：建 + 复盘（promotion 用 camelCase --channelId）
<CLI> promotion list --channelId 7983938 -o json                       # 基线（零渠道=系统异常）
<CLI> promotion create --channelId 7983938 --names "达人A,达人B,私域社群C" --force -o json
<CLI> promotion list --channelId 7983938 -o json                       # 复盘（3 渠道 + 归因指标）

# 分销员名册：查 + 新增 + 调组织 + 移除（invite-sales 用 kebab-case，账号级）
<CLI> invite-sales list -o json                                        # 基线（Nick）
<CLI> invite-sales follow-viewer list -o json                          # 跟进客户（空）
<CLI> viewer list -o json                                              # 取测试 unionId
<CLI> invite-sales add --viewer-union-ids 4_611h… --organization-id 29031 --force -o json
<CLI> invite-sales list -o json                                        # 复查 1→2
<CLI> invite-sales update --viewer-union-ids 4_611h… --organization-id 29031 --force -o json
<CLI> invite-sales remove --viewer-union-ids 4_611h… --force -o json
<CLI> invite-sales list -o json                                        # 复查 2→1（清理）
```

## 12. 执行或验证结果 / 问题记录

### 12.1 问题 1：`promotion list` 对零推广渠道频道返回「系统异常」（非空数组）

**现象**：对**没有任何推广渠道**的频道执行 `promotion list`，返回 `Unexpected error: 系统异常` 且 exit 非 0，而非返回空数组 `[]`。交叉验证 3 个零渠道频道（本轮新建 7983938、既有 7983937、既有 7983934）**全部同错**；一旦该频道通过 `promotion create` 建立至少 1 个渠道，`promotion list` 立即正常返回渠道列表与归因指标。

**排查**：
- 排除单频道问题：7983937/7983934 为历史场景频道，同样零渠道同样报错。
- 排除参数问题：`--channelId` camelCase 正确，table/json 两种格式均报错。
- 复现「建渠道即恢复」：7983938 create 后 list 立即正常（台账 #5 失败 → #8 成功）。

**根因判断**：保利威后端 `promotion list` 接口在频道零渠道时未返回空集合，而是抛出未捕获的「系统异常」。这是接口空值处理缺陷，非 CLI bug，也非参数错误。

**下一步建议**：
- 运营用 `promotion list` 复盘归因前，若返回「系统异常」，先用 `promotion create` 确认频道已至少建 1 个渠道；不要把「系统异常」误判为「无渠道」。
- 长期建议保利威修复该接口对空集合的处理（应返回 `[]` 而非异常）。

> 覆盖结论不受影响：`promotion create`（台账 #7）真实写入成功、`promotion list`（台账 #8）在建渠道后真实执行成功并返回归因指标，`promotion` 族已真实执行覆盖。台账 #5/#6 的「系统异常」按「已执行失败」记录。

### 12.2 问题 2：`invite-sales add` 对个别 viewer 返回「参数错误」

**现象**：对 viewer「数据一致性测试用户」（unionId `4_qncma4ngv4rkksk7cqvljrs6vhw7m955`）执行 `invite-sales add`，无论是否带 `--organization-id` 均报 `Unexpected error: 参数错误`；而对「批量测试用户1」（unionId `4_611h…`）同样命令返回 `{success:true}` 并成功入册（台账 #12 vs #13）。批量传两个 unionId（其中一个已是分销员或含不合格 viewer）也报 `参数错误`。

**排查**：
- 排除参数命名/必填问题：`--viewer-union-ids` kebab-case 正确、`--organization-id` 取账号现有 29031 合法值。
- 排除 unionId 格式问题：两个 unionId 均为 viewer list 返回的标准 `4_xxx` 格式。
- 复现「viewer 相关」：合格 viewer（批量测试用户1）add 成功、不合格 viewer（数据一致性测试用户）add 报参数错误，差异仅在 viewer 本身。

**根因判断**：后端 `invite-sales add` 对 viewer 做了资格校验（如该 viewer 是否符合分销员录入条件、是否已在某状态），个别 viewer 不满足时返回笼统「参数错误」。这是后端校验过严/错误信息过粗，非 CLI 参数错误。

**下一步建议**：
- 运营批量录入分销员前，先用 `viewer list` 确认 viewer 合格；遇到「参数错误」时逐个排查 viewer 资格，而非怀疑命令参数。
- 长期建议保利威细化错误信息（区分「viewer 不符合分销员条件」与「参数格式错误」）。

> 覆盖结论不受影响：`invite-sales add`（台账 #12）对合格 viewer 真实写入成功并经 list 复查 1→2 确认持久化，`invite-sales` 族已真实执行覆盖。台账 #13 的「参数错误」按「已执行失败」记录。

### 12.3 问题 3（探索发现，transmit 不计入本轮覆盖）：`transmit create` / `associate` 受账号级权益门控

**现象**：本轮探索 `transmit`（转播/分会场）命令族时：
- `transmit list --channelId 7983938` 只读成功，返回 `[]`（零转播关联）。
- `transmit create --channelId 7983938 --names "北京分会场,上海分会场"` 报 `Unexpected error: access forbidden`。
- `transmit associate --channelId 7983938 --receive-channel-ids 7983937 --type add` 同样报 `access forbidden`。

**根因判断**：与场景 07 `session create`（账号级「新版场次手动创建」权益未开通）同类——测试账号 `nicksu` 未开通**转播/分会场**账号级权益，`transmit` 的两条写入路径（create 建转播频道、associate 关联接收频道）全部被权益门控拦截，仅 `transmit list` 只读可用。

**处理**：为保持本场景「分销推广」主题聚焦，`transmit` **不计入本轮覆盖**（其写入全部受权益门控、仅 list 只读可用，独立成一个完整的转播场景更合适）。该发现留待未来「多平台同步转播 / 分会场直播」场景专项覆盖（届时可向保利威后台申请开通转播权益后补做 create/associate）。

## 13. 风险点与回滚 / 清理方式

| 风险 | 说明 | 回滚 / 清理 |
|---|---|---|
| 推广渠道一旦建立难删 | `promotion` 无 CLI delete 子命令，3 个测试渠道需后台人工删 | 后台人工删除（本场景未执行）；推广渠道为频道级，仅影响 7983938 |
| 误把分销员加到真实名册 | `invite-sales add` 是账号级写入，会影响本账号所有频道的分销员名册 | 本场景已用 `invite-sales remove` 清理测试分销员（台账 #16/#17 totalItems 2→1，回到基线） |
| 误改真实分销员组织 | `invite-sales update` 改组织是账号级，会改动真实分销员归属 | 本场景仅对**新增的测试分销员**执行 update，未触碰真实分销员 Nick |
| 零渠道 list 报「系统异常」误判 | `promotion list` 零渠道返回异常，易被误判为频道问题 | 见 12.1，建渠道后即恢复，不要据「系统异常」下结论 |

> 清理执行情况：测试分销员（批量测试用户1）已通过 `invite-sales remove` 清理干净（list 复查 totalItems 2→1，仅余 Nick）；测试频道 7983938 与 3 个推广渠道**已保留未删**（CLI 无 promotion delete，频道保留供人工查看归因配置）。

## 14. 保留资产说明

| 保留资产 | 数量 / ID | 是否清理 | 说明 |
|---|---|---|---|
| 专用测试频道 | `7983938` | **未删除（已保留）** | 供人工在保利威后台查看推广渠道归因配置 |
| 推广渠道（频道级） | 3 个：达人A(aDnZib)、达人B(8TPDLD)、私域社群C(slrMEQ) | **未删除（已保留）** | CLI 无 promotion delete，需后台人工清理；归因指标均 0（未开播无引流） |
| 测试分销员（账号级） | 「批量测试用户1」 | **已清理** | 通过 `invite-sales remove` 移除，list 复查 totalItems 回到 1（仅 Nick），未遗留 |
| 真实分销员 Nick | 未改动 | — | 全程未对真实分销员执行任何写入 |

> 人工清理（本场景均**未执行**，仅在需要时使用）：
> ```bash
> # 推广渠道：CLI 无删除命令，需保利威后台人工删除 7983938 下 3 个测试渠道
> # 频道：npx --yes polyv-live-cli@rc channel delete -c 7983938
> ```

## 15. 可复用模板

### 15.1 大促分销渠道归因模板（promotion）

```bash
# 1) 为每个分销来源建推广渠道（频道级，camelCase）
<CLI> promotion create --channelId <主频道ID> \
  --names "达人-李佳琦,达人-薇娅,私域-会员群A,分销-导购小王" --force -o json

# 2) 大促中/后按渠道复盘引流归因
<CLI> promotion list --channelId <主频道ID> -o json
# 关注 visitsNum(访问)/watchNum(观看)/reservationNum(预约)/enrollNum(报名)，
# 算单渠道 ROI，决定下一轮佣金/坑位费投放
```

> 注意：零渠道时 `promotion list` 会报「系统异常」（见 12.1），首次复盘前确保已建至少 1 个渠道。

### 15.2 分销团队名册维护模板（invite-sales，账号级）

```bash
# 1) 查当前分销员名册与所属组织、人均客户数
<CLI> invite-sales list -o json
<CLI> invite-sales follow-viewer list -o json          # 各分销员跟进客户明细

# 2) 取 viewer unionId（来自 viewer list）后批量新增分销员（≤200/次）
<CLI> viewer list -o json                              # 取合格 viewer 的 unionId
<CLI> invite-sales add --viewer-union-ids "<uid1>,<uid2>" --organization-id <组织ID> --force -o json
# ⚠️ 个别 viewer 会报「参数错误」（见 12.2），需逐个排查资格

# 3) 调整分销员所属组织（区域/门店调动）
<CLI> invite-sales update --viewer-union-ids "<uid>" --organization-id <新组织ID> --force -o json

# 4) 离职/退出分销，移除并可选转移其跟进客户
<CLI> invite-sales remove --viewer-union-ids "<uid>" --new-viewer-union-id <承接分销员uid> --force -o json
```

## 16. 后续可扩展方向

1. **观众侧引流验证**：本场景推广渠道归因指标恒为 0（测试频道未开播、无真实观众进入）。未来在已开播频道用真实观众通过归因链接进入，验证 visitsNum/watchNum/reservationNum/enrollNum 的真实增长，从「配置侧已建渠道」升级为「观众侧已产生引流」。
2. **`transmit` 多平台转播专项场景**：本轮发现 `transmit create`/`associate` 受账号级转播权益门控（access forbidden），仅 `transmit list` 只读可用。未来向保利威后台开通转播权益后，补做 `transmit create`（建转播频道）+ `transmit associate`（关联接收频道）+ `transmit list`（查关联）的完整转播生命周期，覆盖 `transmit` 一级命令。
3. **分销员绩效深度复盘**：`invite-sales follow-viewer list` 支持按 `--follow-status-list`、`--invite-customer-id`、`--username` 等过滤，未来结合 `statistics` 做分销员人均客户数、客户转化率的深度绩效复盘。
4. **渠道归因 × 转化交叉**：把 `promotion list` 的渠道引流指标与 `statistics product-click`/`coupon` 领券核销交叉，算「单渠道引流 → 单渠道转化 GMV」，沉淀大促渠道 ROI 看板。
5. **多组织分销体系**：本账号仅有「总部/29031」一个组织，`invite-sales update` 演示为同组织更新。未来开通多组织（区域/门店）后，演示真实的跨组织分销员调动。
