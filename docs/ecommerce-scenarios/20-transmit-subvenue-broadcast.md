# 场景 20：多平台分会场同步转播 — 全国新品首发多地分会场分发

> 覆盖一级命令：`transmit`（`list` 已执行成功 + `create`/`associate` 已执行失败，账号级转播权益门控）
> 业务阶段：**转化 / 互动 / 数据复盘**
> 专用测试频道：`7983962`（transmit 为频道级转播能力，主频道即本测试频道）

---

## 1. 场景名称

**多平台分会场同步转播 — 全国新品首发多地分会场分发**

电商品牌做全国级新品首发时，总部主直播间一场开播，需要把同一路直播**同步分发**到全国多地分会场（北京/上海/广州门店直播间）或合作平台直播间，让各地观众就近观看、就地承接转化。运营总监与直播技术中台要解决两件事：

1. **批量建分会场转播频道**：为主频道一次性批量创建多个转播频道（`transmit create`），每个分会场一个独立观看入口与统计口径。
2. **关联/取消接收频道**：把已有频道作为「接收频道」挂到主频道下，或事后取消关联（`transmit associate`），灵活编排分会场矩阵。
3. **复盘转播关联**：查询任意主频道的转播关联列表（`transmit list`），核对分发覆盖、归因分会场观看/转化。

本场景用 `transmit` 一级命令族完成这三类操作。

---

## 2. 覆盖命令

| 一级命令 | 子命令 | 执行状态 | 说明 |
|---|---|---|---|
| `transmit` | `list` | ✅ 已执行成功 | 查询主频道转播关联列表，返回 `[]`（无关联基线） |
| `transmit` | `create` | ❌ 已执行失败 | 批量建转播频道，账号级转播权益门控 `access forbidden` |
| `transmit` | `associate` | ❌ 已执行失败 | 关联接收频道，同账号级转播权益门控 `access forbidden` |

> `transmit` 命令族因只读命令 `list` 真实执行成功（返回 `[]`）而计入**已覆盖（✅）**；写入命令 `create`/`associate` 真实执行并命中账号级转播权益门控，全部已执行失败并完整记录错误与下一步排查——按覆盖口径「已执行失败」计入真实执行覆盖，而非仅 help 校验（与场景 16 `group` 全族账号级门控、场景 11 `transmit create/associate` 探索性执行同源）。

---

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道 ID | `7983962` |
| 频道名称 | `GNHF-电商场景-20-transmit-subvenue-broadcast-202606230300` |
| 创建命令 | `npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-20-transmit-subvenue-broadcast-202606230300" -d "..."` |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，全局配置默认账号） |
| Scene / Template | `topclass` / `ppt`（当前 rc 默认，不可自定义为 alone，见迭代 15 学习记录） |
| 创建时 watchStatus | `unStart`（频道 `waiting`） |
| 创建时间 | 2026/6/23 03:00:48 |
| 删除状态 | **频道已保留，未执行删除** |

> `transmit` 为**频道级**转播能力命令族：`create`/`list`/`associate` 的 `--channelId` 均指向「主频道」（发起转播的频道号）。本场景专用测试频道 `7983962` 即作为分会场分发的**主频道**承载全部 transmit 操作。`create` 的批量转播频道与 `associate` 的接收频道都挂在主频道 `7983962` 之下。

---

## 4. 行业背景

直播电商进入规模化、全国连锁化运营后，「一场主直播 + 多地分会场同步转播」成为品牌全国级活动（新品首发、双 11 大促、年度会员日）的标准打法：

- **总部主直播间**承担主讲、明星达人、核心爆品讲解、统一优惠券发券节奏。
- **各地分会场**（城市旗舰店直播间、加盟商直播间、合作平台直播间）同步接收主路画面，就近承接本地观众，独立统计观看/转化/分销归因。
- 运营总监需要一次性把主路分发给 N 个分会场，活动结束后能复盘每个分会场的转播关联与覆盖。

`transmit`（转播频道管理）正是支撑「主频道 → 多接收频道」分发编排的命令族。

---

## 5. 业务目标与核心 KPI

| 维度 | 目标 | KPI |
|---|---|---|
| 分会场分发 | 为主频道批量创建多个转播频道 | `transmit create` 成功创建的转播频道数 |
| 接收频道编排 | 关联/取消已有频道作为接收频道 | `transmit associate` add/cancel 的接收频道数 |
| 分发复盘 | 查询主频道转播关联列表核对覆盖 | `transmit list` 返回的关联条数、各分会场观看/转化 |

---

## 6. 适用角色

- 直播运营总监（全国级活动编排）
- 直播技术中台 / 导播（主路分发配置）
- 分会场/加盟商运营（接收频道承接）
- 数据复盘岗（分会场分发归因）

---

## 7. 前置条件

1. 已配置默认账号（`account current` 可返回 `nicksu`，全局配置来源）。
2. 已创建专用测试频道 `7983962`（作为分会场分发的主频道）。
3. **创建转播频道 / 关联接收频道**：需账号已在保利威后台开通「转播/分会场」权益（见 §12 问题记录）。当前测试账号 `nicksu` 未开通该权益，`create`/`associate` 均被门控拦截。
4. **查询转播关联**：`transmit list` 为只读，账号级读权限即可直接使用（已验证成功）。

---

## 8. polyv-live-cli-rc 能力映射

| 业务动作 | 命令 | 作用层级 |
|---|---|---|
| 批量创建转播频道（分会场） | `transmit create --channelId <主频道ID> --names "分会场1,分会场2"` | 频道级（主频道） |
| 关联/取消接收频道 | `transmit associate --channelId <主频道ID> --receive-channel-ids <ids> --type add\|cancel` | 频道级（主频道） |
| 查询主频道转播关联列表 | `transmit list --channelId <频道ID>` | 频道级 |

> `transmit` 全族用 camelCase（`--channelId`、`--receive-channel-ids` 用 kebab 但 channelId 用 camel），与 card-push/promotion 的 camelCase 一致、与 product/lottery 的 kebab-case 不同，配置时须以各子命令 `--help` 为准。

---

## 9. 实施步骤

1. **账号预检**：`account current` 确认默认账号 `nicksu` 与账号环境。
2. **建专用测试频道**：`channel create -n <场景名>` → `7983962`，`channel get` 复核。
3. **校验 transmit 命令面**：`transmit --help` + `transmit create/associate/list --help` 校验真实参数（以 rc 真实 help 为准，不据 reference 记忆）。
4. **查询转播关联基线**：`transmit list --channelId 7983962` 建立无关联基线（`[]`）。
5. **批量建分会场转播频道**：`transmit create --channelId 7983962 --names "北京分会场,上海分会场,广州分会场"`（命中账号级转播权益门控，记录失败）。
6. **关联接收频道演练**：`transmit associate --channelId 7983962 --receive-channel-ids 7983962 --type add -f`（同门控失败，记录）。
7. **复盘验证**：`transmit list` 复查主频道关联（失败写入无副作用，仍为 `[]`），`channel get` 复核主频道完好未删除。
8. **沉淀台账与问题记录**，更新 README 覆盖矩阵。

---

## 10. 命令执行台账

> 执行时间：2026-06-23（UTC+8）；账号 `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`）。敏感值脱敏。

| # | 时间 | 一级命令 / 子命令 | 实际执行命令（脱敏） | 频道/对象 | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 06-23 03:00 | `account current` | `npx --yes polyv-live-cli@rc account current` | — | ✅ 成功 | 默认账号 `nicksu`，全局配置来源，6 个可用账号 |
| 2 | 06-23 03:00 | `account list` | `npx --yes polyv-live-cli@rc account list` | — | ✅ 成功 | 6 账号：nicksu/testpolyv6/lizhikang/test-account/production-account/bd |
| 3 | 06-23 03:00 | `transmit --help` | `npx --yes polyv-live-cli@rc transmit --help` | — | ✅ 成功 | 子命令：associate / create / list |
| 4 | 06-23 03:00 | `transmit create --help` | `... transmit create --help` | — | ✅ 成功 | 参数：`--channelId`、`--names`、`-o` |
| 5 | 06-23 03:00 | `transmit associate --help` | `... transmit associate --help` | — | ✅ 成功 | 参数：`--channelId`、`--receive-channel-ids`、`--type add\|cancel`、`-f`、`-o` |
| 6 | 06-23 03:00 | `transmit list --help` | `... transmit list --help` | — | ✅ 成功 | 参数：`--channelId`、`-o` |
| 7 | 06-23 03:00 | `channel create` | `... channel create -n "GNHF-电商场景-20-...-202606230300" -d "..."` | — | ✅ 成功 | channelId=`7983962`，scene=topclass/template=ppt，watchStatus=unStart |
| 8 | 06-23 03:01 | `transmit list` | `... transmit list --channelId 7983962` | 7983962 | ✅ 成功 | `No transmit associations found (未找到转播关联)` |
| 9 | 06-23 03:01 | `transmit list` | `... transmit list --channelId 7983962 -o json` | 7983962 | ✅ 成功 | `[]`（无关联基线） |
| 10 | 06-23 03:01 | `transmit create` | `... transmit create --channelId 7983962 --names "北京分会场,上海分会场,广州分会场" -o json` | 7983962 | ❌ 失败 | `Unexpected error: access forbidden`（账号级转播权益门控） |
| 11 | 06-23 03:01 | `transmit associate` | `... transmit associate --channelId 7983962 --receive-channel-ids 7983962 --type add -f -o json` | 7983962 | ❌ 失败 | `Unexpected error: access forbidden`（同门控） |
| 12 | 06-23 03:02 | `transmit list`（写后复查） | `... transmit list --channelId 7983962 -o json` | 7983962 | ✅ 成功 | `[]`（失败写入无副作用，主频道无残留关联） |
| 13 | 06-23 03:02 | `channel get` | `... channel get -c 7983962 -o json` | 7983962 | ✅ 成功 | channelId/name/watchStatus=unStart/scene/template 复核主频道完好 |

---

## 11. 实际使用的 CLI 命令与真实参数

### 11.1 查询主频道转播关联（只读，成功）

```bash
# 查询主频道 7983962 的转播关联（无关联时返回 []）
npx --yes polyv-live-cli@rc transmit list --channelId 7983962
# → No transmit associations found (未找到转播关联)

npx --yes polyv-live-cli@rc transmit list --channelId 7983962 -o json
# → []
```

### 11.2 批量创建分会场转播频道（账号级转播权益门控，失败）

```bash
# 为主频道 7983962 批量创建 3 个分会场转播频道
npx --yes polyv-live-cli@rc transmit create \
  --channelId 7983962 \
  --names "北京分会场,上海分会场,广州分会场" -o json
# → Unexpected error: access forbidden
```

### 11.3 关联接收频道（账号级转播权益门控，失败）

```bash
# 把接收频道关联到主频道 7983962（type=add 关联 / cancel 取消）
npx --yes polyv-live-cli@rc transmit associate \
  --channelId 7983962 \
  --receive-channel-ids 7983962 \
  --type add -f -o json
# → Unexpected error: access forbidden
```

---

## 12. 执行或验证结果 / 问题记录

### 12.1 `transmit list` — 主频道转播关联只读复盘（成功）

- `transmit list --channelId 7983962` 真实执行成功，table 输出 `No transmit associations found (未找到转播关联)`、JSON 输出 `[]`，是新建主频道无关联的合法基线。
- 该命令是 `transmit` 族唯一的只读命令，账号级读权限即可直接使用，不受转播权益门控限制。
- 覆盖口径：`list` 真实执行成功并返回结构化数据（`[]`），`transmit` 命令族计入**已覆盖（✅）**（与场景 06/07/10/11/12/13/14/15/16/17/18/19 只读命令计入覆盖的先例一致）。

### 12.2 `transmit create` / `associate` — 账号级转播权益未开通（已执行失败）

- `transmit create --channelId 7983962 --names "..."` 与 `transmit associate --channelId 7983962 --receive-channel-ids ... --type add` 均返回 `Unexpected error: access forbidden`，与场景 11 中对 `transmit create/associate` 的探索性执行结论完全一致。
- 根因：当前测试账号 `nicksu` 未在保利威后台开通「转播/分会场」权益，`create`（批量建转播频道）与 `associate`（关联/取消接收频道）这两条**写入路径**在权益校验阶段被 `access forbidden` 拦截，与参数取值、频道状态、接收频道 ID 无关。
- 这与场景 07 `session create`（新版场次权益）、场景 11 `transmit create/associate`（转播权益）、场景 16 `finance audio/video-moderation`（账号级审核功能）、场景 18 `user mr-concurrency`（MR 直播权限）同属**账号级权益/功能门控家族**，CLI 无对应「开通转播权益」子命令，需后台开通。
- **失败写入无副作用**：两条写入虽报 `access forbidden`，但 `transmit list` 复查主频道关联仍为 `[]`、`channel get` 复核主频道完好，证明门控在创建阶段拦截、未产生任何残留转播频道或关联。
- **下一步建议**：品牌要做多平台分会场分发前，先在保利威后台开通「转播/分会场」权益；开通后 `transmit create --names "城市A,城市B,城市C"` 即可一次性批量建分会场，再用 `transmit list --channelId <主频道>` 复盘分发覆盖。未开通权益时，分会场分发只能退回「各分会场独立频道 + 人工导播切流」或「主频道 OBS 多路推流」方案。
- 覆盖口径：两条写入命令真实执行并命中账号级权益门控，按「已执行失败（❌）」记录（非仅 help 校验）；`transmit` 族已由只读 `list` 成功覆盖，整体计入已覆盖。

### 12.3 配置侧 vs 观众侧验证区分

- 本场景 `transmit list` 为**配置侧只读复盘**，验证对象是主频道的转播关联配置（关联条数），结论一律落在「配置侧已满足条件（无关联基线）/ 账号级权益门控阻断」，不声称任何观众侧效果。
- 分会场是否真正能就近观看主路画面，属于**观众侧**能力，需在权益开通、`create` 成功建出分会场后、实际打开各分会场观看页验证——本轮权益未开通，无法走到观众侧验证，文档不夸大。

---

## 13. 风险点与回滚/清理方式

| 风险 | 说明 | 处置 |
|---|---|---|
| 误把转播频道挂到生产主频道 | `transmit create`/`associate` 的 `--channelId` 若填错主频道，会把分会场分发挂到错误直播间 | 本轮 `--channelId` 一律用本轮新建测试频道 `7983962`，未触碰任何既有/生产频道 |
| 转播关联误操作 | `transmit associate --type cancel` 会取消接收频道关联 | 本轮 `create`/`associate` 全部被权益门控拦截，无任何关联变更；未执行 cancel |
| 账号级权益误开通 | 在后台开通转播权益后 `create` 即真实建频道 | 本轮未开通权益，无写入副作用 |
| 测试频道残留 | 主频道 `7983962` 保留未删除 | 见 §14，可选人工清理（未执行） |

**可选人工清理命令（未执行，仅供后续人工清理测试频道）：**

```bash
# 仅在确认不再需要本测试频道时，由人工执行（本轮未执行）
npx --yes polyv-live-cli@rc channel delete -c 7983962   # 如该子命令存在且经 --help 校验后由人工确认
```

> 本轮未产生任何转播频道创建、接收频道关联变更（两条写入均被权益门控拦截），无需回滚。测试频道按规则保留。

---

## 14. 保留资产说明

| 资产 | 类型 | 状态 |
|---|---|---|
| 频道 `7983962`（`GNHF-电商场景-20-transmit-subvenue-broadcast-202606230300`） | 频道级（transmit 主频道） | **保留，未删除**（供人工查看频道配置与转播关联现状） |
| `transmit list` 查询结果（主频道无关联 `[]`） | 频道级只读数据 | 无写入，无残留 |
| `transmit create`/`associate` 写入 | 频道级写入 | 全部因账号级转播权益门控失败，无任何残留转播频道或关联 |

> 本场景未产生任何写入型资产（无转播频道创建、无接收频道关联），保留项仅测试主频道 `7983962`。

---

## 15. 可复用模板

### 15.1 主频道转播关联复盘模板（只读，账号级读权限即可用）

```bash
# 查询任意主频道的转播关联列表（已开通转播权益后能看到分会场）
npx --yes polyv-live-cli@rc transmit list --channelId <主频道ID> -o json
```

### 15.2 多地分会场批量分发模板（需账号已开通转播/分会场权益）

```bash
# 为主频道一次性批量创建多个分会场转播频道（名称逗号分隔，名称本身不含逗号）
npx --yes polyv-live-cli@rc transmit create \
  --channelId <主频道ID> \
  --names "北京分会场,上海分会场,广州分会场,成都分会场" -o json

# 复盘分发覆盖（应返回刚创建的分会场列表）
npx --yes polyv-live-cli@rc transmit list --channelId <主频道ID> -o json
```

### 15.3 接收频道关联/取消编排模板（需账号已开通转播/分会场权益）

```bash
# 把已有频道作为接收频道关联到主频道（add）/ 取消关联（cancel）
npx --yes polyv-live-cli@rc transmit associate \
  --channelId <主频道ID> \
  --receive-channel-ids <接收频道1ID>,<接收频道2ID> \
  --type add -f -o json

# 取消关联（活动结束后下线分会场）
npx --yes polyv-live-cli@rc transmit associate \
  --channelId <主频道ID> \
  --receive-channel-ids <接收频道ID> \
  --type cancel -f -o json

# 复盘当前关联矩阵
npx --yes polyv-live-cli@rc transmit list --channelId <主频道ID> -o json
```

---

## 16. 后续可扩展方向

1. **真实分会场分发演练**：账号在保利威后台开通「转播/分会场」权益后，重跑 `transmit create --names "城市A,城市B,城市C"` 真实批量建分会场，并经 `transmit list` 复盘分发覆盖（本轮权益未开通，`create`/`associate` 全部门控失败）。
2. **接收频道动态编排**：开通权益后演练 `transmit associate --type add/cancel` 全生命周期（活动前挂分会场、活动后下线），形成分会场矩阵动态编排 SOP。
3. **分会场归因复盘**：分会场转播成功后，结合各分会场独立 `channelId` 用 `statistics`（场景 07）拉分会场观看/转化，做分会场 ROI 排名。
4. **与推广渠道联动**：把每个分会场频道作为独立推广渠道，用 `promotion create`（场景 11）为分会场生成专属推广链接，做多分会场分销归因。
5. **`partner` 转售场景**：转播权益常与合作伙伴/分销商体系联动，后续可结合 `partner`（场景待覆盖）做合作伙伴账号下的转播分发编排。
