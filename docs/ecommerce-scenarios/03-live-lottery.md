# 场景 03：直播互动抽奖促活 — 多条件福袋配置与生命周期演练

> 业务阶段：**互动 / 转化**
> 覆盖一级命令：`lottery`、`channel`、`account`
> 真实执行状态：**已执行成功**（2026-06-23 已发布 `polyv-live-cli@latest` 1.2.32，并验证 comment 类型创建成功）

---

## 1. 场景名称

直播互动抽奖促活 —— 在直播开播前，为直播间配置一组覆盖不同促活目的的「福袋/抽奖」活动，把整场直播的互动节奏提前编排好：

- **入场暖场**：一张无条件抽奖（`none`），开播即开抽，用「整点秒抽」把刚进来的观众留住、拉起第一波弹幕。
- **留存拉时长**：一张观看时长抽奖（`duration`，看播满 3 分钟可抽），降低跳出、抬升平均观看时长。
- **裂变拉新**：一张邀请抽奖（`invite`，邀请 3 位好友可抽），用利益点驱动老观众做私域裂变。
- **弹幕加热**：一张评论抽奖（`comment`，发送指定评论后参与）—— 用于在讲解高峰期把弹幕热度顶起来（`polyv-live-cli@latest` 1.2.32 已真实创建成功）。

同时演练抽奖活动的查询、更新（加码奖品/名额）、删除全生命周期，使运营在真实直播中能按节奏开/改/停抽奖。

## 2. 覆盖命令

| 一级命令 | 子命令 | 执行状态 | 说明 |
|---|---|---|---|
| `account` | `account current`、`account list` | 已执行成功 | 写入前账号预检 |
| `channel` | `channel create`、`channel get` | 已执行成功 | 创建专用测试频道并验证频道存在 |
| `lottery` | `lottery list` | 已执行成功 | 基线查询、创建后、删除后多次验证 |
| `lottery` | `lottery create`（`none`/`duration`/`invite`） | 已执行成功 | 建 3 张不同条件福袋 |
| `lottery` | `lottery create`（`comment`） | 已执行成功 | `polyv-live-cli@latest` 1.2.32 补齐 `--duration` 与 `--comment` 映射后成功，见第 12.1 节 |
| `lottery` | `lottery get` | 已执行成功 | 查询福袋详情、更新前后对比 |
| `lottery` | `lottery update` | 已执行成功 | 暖场福袋名额 3→5、奖品加码，并验证 |
| `lottery` | `lottery delete` | 已执行成功 | 临时福袋创建后删除，验证列表回归 3 张 |

> 说明：本场景最新可复现实操以 2026-06-23 发布后的 `polyv-live-cli@latest` 1.2.32 为准。历史 1.2.31/rc 的 comment 失败尝试保留在第 12.1 节作为缺陷复现和根因记录，不再作为当前执行台账的失败项。

> 2026-06-23 latest 复测补充：先使用 `polyv-live-cli@latest` 1.2.31 新建测试频道 `7986869` 复跑，确认 none/duration/invite/list/get/update/delete 均通过且 comment 类型仍失败；随后发布 `polyv-live-cli@latest` 1.2.32，并用 latest 创建 comment 福袋 `73739` 成功。

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道名称 | `GNHF-电商场景-03-live-lottery-202606222254` |
| 频道 ID | `7983885` |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production） |
| 场景类型 | `alone`（活动营销） |
| 模板 | `alone`（纯视频-横屏） |
| 创建结果 | 成功（watchStatus=unStart / 未开始） |
| 创建时间 | 2026-06-22 22:54:51 CST |
| 是否删除 | **否，频道已保留**，供人工查看配置 |

### 3.1 latest 复测频道（2026-06-23）

| 项 | 值 |
|---|---|
| 频道名称 | `GNHF-电商场景-03-live-lottery-latest-202606231547` |
| 频道 ID | `7986869` |
| CLI 版本 | npm latest `1.2.31` 复现 comment 失败；npm latest `1.2.32` 验证 comment 成功 |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production） |
| 场景类型 | `alone`（活动营销） |
| 模板 | `alone`（纯视频-横屏） |
| 创建结果 | 成功（watchStatus=unStart / 未开始） |
| 创建时间 | 2026-06-23 17:17:35 CST |
| 是否删除 | **否，频道已保留**，供人工查看 latest 复测配置 |

## 4. 行业背景

电商直播的在线人数和互动直接决定推流权重与转化效率。单纯靠主播口播很难持续调动观众，成熟直播间普遍用**福袋/抽奖**作为节奏工具：

- **开播头 5 分钟**用一张「无条件整点秒抽」快速聚人气，避免新观众秒进秒出。
- **直播中段**用「观看时长抽奖」把观众留住，抬升平均观看时长（这是平台给量的核心指标之一）。
- **流量瓶颈期**用「邀请抽奖」驱动老观众把直播间分享到私域/社群，做低成本裂变拉新。
- **讲解爆款时**用「评论抽奖」把弹幕顶起来，制造热销氛围、刺激从众下单。

奖品通常用**直播间专享券、正装小样、无门槛券、限量周边**等低成本高感知的利益点。本场景把「建不同条件福袋 → 查询验证 → 加码更新 → 删除演练」串成一个可照着执行的操作闭环，全部用真实测试频道验证。

## 5. 业务目标与核心 KPI

- **业务目标**：直播开播前完成 4 类促活福袋配置，开播即可按节奏开抽；并掌握福袋的查/改/停能力。
- **核心 KPI**：
  - 至少 3 张福袋创建成功并在 `lottery list` 可见（无条件 / 观看时长 / 邀请）。
  - 观看时长福袋：观看门槛 180 秒、活动时长 3 分钟、中奖名额 2。
  - 邀请福袋：邀请门槛 3 人、海报裂变（inviteType=poster）、中奖名额 5。
  - 暖场福袋可经 `lottery update` 把名额从 3 加码到 5、奖品从「99减20」加码到「99减30」，并在 `lottery get` 中验证变更生效。
  - 临时福袋可经 `lottery delete` 删除，删除后 `lottery list` 总数回归。

## 6. 适用角色

- 电商运营 / 直播运营：负责福袋奖品配置、条件门槛、活动时长编排。
- 场控 / 助播：在直播中按节奏开抽、加码、停抽（本场景覆盖配置与生命周期演练，不涉及真实直播开抽）。

## 7. 前置条件

1. 已安装可访问 npm latest 发布版的 Node 环境，可用 `npx --yes polyv-live-cli@latest`。
2. 已配置可用账号且为默认账号（本场景使用 `nicksu`）。
3. 已创建专用测试频道（本场景为本轮新建的测试频道 `7983885`）。
4. 已明确每张福袋的：名称、条件类型、中奖名额、奖品名、门槛参数（观看秒数 / 邀请人数 / 评论解锁秒数）。
5. **comment 创建要求**：从 npm latest `1.2.32` 起，`lottery create --type comment` 需同时提供 `--duration` 与 `--comment`。

## 8. polyv-live-cli 能力映射

| 业务动作 | CLI 一级命令 | 子命令 | 关键参数 |
|---|---|---|---|
| 写入前账号预检 | `account` | `current` / `list` | 无 |
| 创建专用测试频道 | `channel` | `create` | `-n`、`--scene alone`、`--template alone` |
| 建无条件暖场福袋 | `lottery` | `create` | `-c`、`--name`、`--type none`、`--amount`、`--prize-name` |
| 建观看时长福袋 | `lottery` | `create` | `-c`、`--type duration`、`--duration`（秒） |
| 建邀请裂变福袋 | `lottery` | `create` | `-c`、`--type invite`、`--invite-num`、`--duration` |
| 建评论弹幕福袋 | `lottery` | `create` | `-c`、`--type comment`、`--duration`、`--comment` |
| 列出频道福袋 | `lottery` | `list` | `-c` |
| 查福袋详情 | `lottery` | `get` | `-c`、`--id` |
| 加码名额/奖品 | `lottery` | `update` | `-c`、`--id`、`--amount`、`--prize-name` |
| 删除福袋 | `lottery` | `delete` | `-c`、`--id` |

## 9. 实施步骤

1. **账号预检**：执行 `account current` 与 `account list`，确认当前默认账号。
2. **创建专用测试频道**：用反映场景的名称创建活动营销频道，记录频道 ID。
3. **基线查询**：执行 `lottery list` 确认新频道无福袋。
4. **校验建福袋 help**：运行 `lottery create --help`，确认 `--type`、`--amount`、`--prize-name`、`--duration`、`--invite-num` 等参数真实存在。
5. **建暖场福袋**：`lottery create --type none`，amount 3，记录 activityId。
6. **建观看时长福袋**：`lottery create --type duration --duration 180`，amount 2。
7. **建邀请裂变福袋**：`lottery create --type invite --invite-num 3 --duration 30`，amount 5。
8. **建评论福袋**：`lottery create --type comment --duration 60 --comment "参与抽奖"`，记录 activityId。
9. **列表验证**：`lottery list` 确认福袋配置正确。
10. **详情查询**：`lottery get` 取暖场福袋变更前快照（amount=3）。
11. **加码更新**：`lottery update` 把暖场福袋 amount 改 5、奖品加码。
12. **更新后验证**：`lottery get` 确认 amount=5、prizeName 已变。
13. **删除演练**：建一张临时福袋 → `lottery delete` 删除 → `lottery list` 验证总数回归 3。

## 10. 命令执行台账（当前成功口径）

> 时间均为 CST；敏感值（AppSecret）已脱敏，下文不出现。历史失败命令不放入当前执行台账，详见第 12.1 节。

| # | 执行时间 | 一级命令 / 子命令 | 实际执行命令（脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 2026-06-23 | `account current` | `npx --yes polyv-live-cli@latest account current` | 账号 `nicksu` | 成功 | 默认账号 nicksu，来源全局配置 |
| 2 | 2026-06-23 | `account list` | `npx --yes polyv-live-cli@latest account list` | 共 6 个账号 | 成功 | nicksu/testpolyv6/lizhikang/bd 等可用 |
| 3 | 2026-06-23 | `channel create` | `npx --yes polyv-live-cli@latest channel create -n "GNHF-电商场景-03-live-lottery-latest-202606231547" -d "..." --scene alone --template alone -o json` | 新建 `7986869` | 成功 | channelId=7986869，watchStatus=unStart |
| 4 | 2026-06-23 | `lottery list`（基线） | `npx --yes polyv-live-cli@latest lottery list -c 7986869 -o json` | 频道 `7986869` | 成功 | `No lottery activities found`（空） |
| 5 | 2026-06-23 | `lottery create`（暖场 none） | `npx --yes polyv-live-cli@latest lottery create -c 7986869 --name "整点秒抽-暖场福袋-latest" --type none --amount 3 --prize-name "99减20直播间专享券" -f -o json` | 新建 `73727` | 成功 | activityId=73727，lotteryOnlineEnabled=Y |
| 6 | 2026-06-23 | `lottery create`（观看 duration） | `npx --yes polyv-live-cli@latest lottery create -c 7986869 --name "留人福袋-观看3分钟-latest" --type duration --amount 2 --prize-name "正装体验装1份" --duration 180 -f -o json` | 新建 `73728` | 成功 | duration=180，activityDuration=3 minute |
| 7 | 2026-06-23 | `lottery create`（裂变 invite） | `npx --yes polyv-live-cli@latest lottery create -c 7986869 --name "裂变福袋-邀请3位好友-latest" --type invite --amount 5 --prize-name "无门槛15元券" --duration 30 --invite-num 3 -f -o json` | 新建 `73729` | 成功 | inviteType=poster，inviteNum=3，activityDuration=1 minute |
| 8 | 2026-06-23 | `lottery create`（评论 comment） | `npx --yes polyv-live-cli@latest lottery create -c 7986869 --name "评论抽奖1.2.32" --type comment --amount 3 --prize-name "限量周边礼盒" --duration 60 --comment "参与抽奖" -f -o json` | 新建 `73739` | 成功 | duration=60，comment=`参与抽奖`，activityDuration=1 minute |
| 9 | 2026-06-23 | `lottery get`（评论验证） | `npx --yes polyv-live-cli@latest lottery get -c 7986869 --id 73739 -o json` | 福袋 `73739` | 成功 | status=Y，comment=`参与抽奖`，lotteryOnlineEnabled=Y |
| 10 | 2026-06-23 | `lottery list`（创建后） | `npx --yes polyv-live-cli@latest lottery list -c 7986869 -o json` | 频道 `7986869` | 成功 | totalItems=5，ids=[73739,73731,73729,73728,73727]，全部 status=Y |
| 11 | 2026-06-23 | `lottery get`（变更前） | `npx --yes polyv-live-cli@latest lottery get -c 7986869 --id 73727 -o json` | 福袋 `73727` | 成功 | amount=**3**，prizeName=`99减20直播间专享券` |
| 12 | 2026-06-23 | `lottery update` | `npx --yes polyv-live-cli@latest lottery update -c 7986869 --id 73727 --amount 5 --prize-name "99减30直播间专享券(加码-latest)" -f -o json` | 福袋 `73727` | 成功 | `code:200, status:success` |
| 13 | 2026-06-23 | `lottery get`（变更后） | `npx --yes polyv-live-cli@latest lottery get -c 7986869 --id 73727 -o json` | 福袋 `73727` | 成功 | amount=**5**，prizeName=`99减30直播间专享券(加码-latest)` |
| 14 | 2026-06-23 | `lottery create`（临时） | `npx --yes polyv-live-cli@latest lottery create -c 7986869 --name "演练删除-临时福袋-latest" --type none --amount 1 --prize-name "测试占位" -f -o json` | 新建 `73733` | 成功 | activityId=73733 |
| 15 | 2026-06-23 | `lottery delete` | `npx --yes polyv-live-cli@latest lottery delete -c 7986869 --id 73733 -f -o json` | 福袋 `73733` | 成功 | `Lottery deleted successfully` |
| 16 | 2026-06-23 | `lottery list`（删除后） | `npx --yes polyv-live-cli@latest lottery list -c 7986869 -o json` | 频道 `7986869` | 成功 | 临时福袋 `73733` 已从列表消失 |
| 17 | 2026-06-23 | `channel get` | `npx --yes polyv-live-cli@latest channel get -c 7986869 -o json` | 频道 `7986869` | 成功 | 频道存在，watchStatus=unStart，未删除 |

## 11. 实际使用的 CLI 命令与真实参数

```bash
# 1) 账号预检
npx --yes polyv-live-cli@latest account current
npx --yes polyv-live-cli@latest account list

# 2) 创建专用测试频道（活动营销 / 纯视频横屏）
npx --yes polyv-live-cli@latest channel create \
  -n "GNHF-电商场景-03-live-lottery-latest-202606231547" \
  -d "电商营销场景03：latest CLI 复测直播互动抽奖促活专用测试频道，GNHF 创建保留不删除" \
  --scene alone --template alone -o json

# 3) 基线查询（新频道应为空）
npx --yes polyv-live-cli@latest lottery list -c 7986869 -o json

# 4) 建无条件暖场福袋（开播即开抽）
npx --yes polyv-live-cli@latest lottery create \
  -c 7986869 --name "整点秒抽-暖场福袋-latest" \
  --type none --amount 3 --prize-name "99减20直播间专享券" -f -o json

# 5) 建观看时长福袋（看播满 180 秒可抽，活动时长 3 分钟）
npx --yes polyv-live-cli@latest lottery create \
  -c 7986869 --name "留人福袋-观看3分钟-latest" \
  --type duration --amount 2 --prize-name "正装体验装1份" --duration 180 -f -o json

# 6) 建邀请裂变福袋（邀请 3 位好友可抽，海报裂变）
npx --yes polyv-live-cli@latest lottery create \
  -c 7986869 --name "裂变福袋-邀请3位好友-latest" \
  --type invite --amount 5 --prize-name "无门槛15元券" \
  --duration 30 --invite-num 3 -f -o json

# 7) 建评论型福袋（发送指定评论后参与）
npx --yes polyv-live-cli@latest lottery create \
  -c 7986869 --name "评论抽奖1.2.32" \
  --type comment --amount 3 --prize-name "限量周边礼盒" \
  --duration 60 --comment "参与抽奖" -f -o json

# 8) 列表验证
npx --yes polyv-live-cli@latest lottery list -c 7986869 -o json

# 9) 评论福袋详情查询
npx --yes polyv-live-cli@latest lottery get -c 7986869 --id 73739 -o json

# 10) 暖场福袋详情查询（变更前 amount=3）
npx --yes polyv-live-cli@latest lottery get -c 7986869 --id 73727 -o json

# 11) 加码更新：名额 3→5，奖品加码
npx --yes polyv-live-cli@latest lottery update \
  -c 7986869 --id 73727 \
  --amount 5 --prize-name "99减30直播间专享券(加码-latest)" -f -o json

# 12) 变更后验证（amount=5，prizeName 已变）
npx --yes polyv-live-cli@latest lottery get -c 7986869 --id 73727 -o json

# 13) 删除演练：建临时福袋 → 删除 → 列表验证临时福袋消失
npx --yes polyv-live-cli@latest lottery create \
  -c 7986869 --name "演练删除-临时福袋-latest" \
  --type none --amount 1 --prize-name "测试占位" -f -o json   # => 73733
npx --yes polyv-live-cli@latest lottery delete -c 7986869 --id 73733 -f -o json
npx --yes polyv-live-cli@latest lottery list -c 7986869 -o json
```

> 参数风格：`lottery` 全族用 kebab-case（`-c/--channel-id`、`--id`、`--prize-name`、`--invite-num`），与 `product` 一致、与 `card-push` 的 camelCase 不同。

## 12. 执行或验证结果

- ✅ 测试频道 `7983885` 创建成功，watchStatus=unStart，归属 nicksu。
- ✅ 暖场福袋 `73554`（none）、观看福袋 `73555`（duration/180s/活动时长 3min）、裂变福袋 `73556`（invite/inviteNum 3/poster/活动时长 1min）创建成功，`lottery list` 返回 3 张、全部 status=Y、lotteryOnlineEnabled=Y。
- ✅ **更新变更已前后对比验证**：暖场福袋 `73554` 变更前 `lottery get` 显示 amount=3、prizeName=`99减20直播间专享券`；`lottery update` 返回 `code:200, status:success`；变更后 `lottery get` 显示 amount=5、prizeName=`99减30直播间专享券(加码)`。变更确已生效。
- ✅ **删除已验证**：临时福袋 `73557` 创建后 `lottery delete` 返回 `Lottery deleted successfully`，删除后 `lottery list` totalItems 由 3（含临时）→ 回归 3（临时已消失），ids=[73556,73555,73554]。

**关键排查发现 / 问题记录**：

1. **【评论型福袋已修复并发布】npm latest `1.2.31` 执行 `lottery create --type comment --duration 60` 报 `createLotteryActivity failed: 活动时长不能为空`**。根因是 handler 只为 `invite|duration` 类型透传 `duration`，导致 `comment` 类型没有派生后端必填的 `activityDuration`；补上后还需要新增并透传后端必填的 `comment` 评论内容。**npm latest `1.2.32` 已验证创建 comment 福袋 `73739` 成功**。
   - **已做排查**：确认 1.2.31 的 `lottery create --help` 没有 `--comment` 参数；API 文档明确 `comment` 类型要求 `activityDuration` 与 `comment`。
   - **当前结论**：使用 `npx --yes polyv-live-cli@latest lottery create ... --type comment --duration <活动秒> --comment "<评论内容>"`。
2. **【`--duration` 语义随类型变化】同一 `--duration` 参数在不同 `--type` 下语义不同**：
   - `duration`：观看门槛秒数（180=看播满 3 分钟可抽），并自动派生活动时长 `activityDuration`（分钟）。
   - `invite`：活动持续时长（30 秒），并派生 `activityDuration`（向上取整分钟），同时需配 `--invite-num`。
   - `comment`：活动持续秒数，且需额外提供评论内容 `--comment`（npm latest 1.2.32 已支持）。
   运营配置时务必按类型核对，不能复用同一秒数。
3. **【频道描述未持久化】`channel create` 传入了 `-d` 描述，但 `channel get` 不回填描述字段**（与场景 01、02 一致的已知现象），不属于本场景执行失败。
4. **【创建即生效】新建福袋返回 `lotteryOnlineEnabled: "Y"`、`status: "Y"`**，即创建后默认在线可用，无需额外「启用」步骤；如需停用可用 `lottery delete`（本场景已演练）或后台操作。

> ⚠️ 配置侧 vs 观众侧（依规则区分）：本场景「福袋创建成功 / 更新生效 / 删除生效」均为通过 CLI/API 查询到的**配置侧已满足条件**。**未打开观看页、未做观众侧验证**，因此不写「观众侧可见/可抽」。真实开抽需在直播中由观众端实际参与体现；`lottery winners` / `lottery records` 需在有真实中奖数据后才有意义（本场景频道未开播、无中奖数据，未执行这两条只读命令以避免空查询误导）。

### 12.1 2026-06-23 latest 复测、发布与验证

**latest 复测结论**：

- 发布前 npm dist-tag：`latest=1.2.31`，`rc=1.2.31-rc.1`；发布后 npm dist-tag：`latest=1.2.32`，`rc=1.2.31-rc.1`。
- 账号预检成功：默认账号 `nicksu`，production。
- 新建频道 `7986869` 成功，`channel get` 返回 watchStatus=`unStart`；频道描述 `desc` 仍为空，沿用既有“描述未回填”现象。
- `lottery list -c 7986869 -o json` 基线为空。
- npm latest 成功创建 3 张福袋：none=`73727`、duration=`73728`（duration=180，activityDuration=3 minute）、invite=`73729`（inviteNum=3，activityDuration=1 minute）。
- npm latest 1.2.31 执行 `lottery create --type comment --duration 60` 仍失败：`createLotteryActivity failed: 活动时长不能为空`。
- 本地修复后执行 `node packages/cli/dist/index.js lottery create -c 7986869 --name "弹幕福袋-评论解锁-localfix" --type comment --amount 3 --prize-name "限量周边礼盒" --duration 60 --comment "参与抽奖" -f -o json` 成功，新建 comment 福袋 `73731`，读回 `activityDuration=1`、`duration=60`、`comment=参与抽奖`、`status=Y`。
- 发布 `polyv-live-cli@1.2.32` 后，`npx --yes polyv-live-cli@latest --version` 返回 `1.2.32`，`lottery create --help` 已包含 `--comment <text>`。
- npm latest 1.2.32 执行 `npx --yes polyv-live-cli@latest lottery create -c 7986869 --name "评论抽奖1.2.32" --type comment --amount 3 --prize-name "限量周边礼盒" --duration 60 --comment "参与抽奖" -f -o json` 成功，新建 comment 福袋 `73739`，读回 `activityDuration=1`、`duration=60`、`comment=参与抽奖`、`status=Y`。
- latest `lottery list` 可读到 5 张福袋，ids=`[73739,73731,73729,73728,73727]`。
- latest `lottery update -c 7986869 --id 73727 --amount 5 --prize-name "99减30直播间专享券(加码-latest)" -f -o json` 成功；`lottery get` 复查 amount=5、prizeName 已变。
- latest 临时福袋 `73733` 创建成功并执行 `lottery delete` 成功；删除后 `lottery list` totalItems 回到 4 且不再包含 `73733`。注意：`lottery get --id 73733` 删除后仍能返回该对象，删除验证以列表集合是否排除为准。

**根因与修复**：

- `packages/cli/src/handlers/lottery.handler.ts` 在 1.2.31 中只为 `invite|duration` 类型透传 `options.duration`，导致 `comment` 类型请求没有后端必填的 `activityDuration`。
- 补透传 `duration` 后，后端继续返回 `评论不能为空`；API 文档确认 `comment` 类型还需要请求体字段 `comment`。
- 1.2.32 已新增 `--comment <text>` 命令参数，comment 类型会同时传 `duration` 和 `comment`；缺少 `duration` 或 `comment` 时 CLI 本地报明确校验错误。
- 已补回归：`lottery.commands.test.ts`、`lottery.handler.test.ts`、`lottery-service.test.ts`，并用 npm latest 1.2.32 真实频道验证修复后的 comment 创建成功。

## 13. 风险点与回滚/清理方式

| 风险 | 说明 | 回滚/清理 |
|---|---|---|
| 评论型福袋参数缺失 | comment 类型必须同时传 `--duration` 和 `--comment` | 使用 npm latest 1.2.32+，并按 help 提供两个参数 |
| 福袋名额/奖品配错 | 影响真实中奖名额与奖品发放 | `lottery update` 改名额/奖品（本场景已演练 amount 3→5） |
| 福袋建错频道 | 影响真实直播抽奖 | 仅使用本轮新建测试频道 `7983885`；执行时务必 `-c` 指向正确频道 |
| 残留测试福袋 | 占用频道福袋位 | `lottery delete -c <频道ID> --id <福袋ID> -f` 清理（本场景仅删除了临时福袋 73557） |
| 开播后误删在抽福袋 | 中断观众抽奖体验 | 删除前用 `lottery get` 确认状态；非必要不在直播中删除 |

**可选的人工清理命令（未执行，仅备查）**：

```bash
# 删除保留的测试福袋（未执行，福袋按约定保留供查看）
npx --yes polyv-live-cli@rc lottery delete -c 7983885 --id 73554 -f
npx --yes polyv-live-cli@rc lottery delete -c 7983885 --id 73555 -f
npx --yes polyv-live-cli@rc lottery delete -c 7983885 --id 73556 -f
# 删除 latest 复测保留福袋（未执行）
npx --yes polyv-live-cli@latest lottery delete -c 7986869 --id 73727 -f
npx --yes polyv-live-cli@latest lottery delete -c 7986869 --id 73728 -f
npx --yes polyv-live-cli@latest lottery delete -c 7986869 --id 73729 -f
npx --yes polyv-live-cli@latest lottery delete -c 7986869 --id 73731 -f
npx --yes polyv-live-cli@latest lottery delete -c 7986869 --id 73739 -f
# 删除测试频道（未执行，频道按约定保留）
npx --yes polyv-live-cli@rc channel delete -c 7983885 -f
npx --yes polyv-live-cli@latest channel delete -c 7986869 -f
```

> 上述清理命令**均未执行**，仅作为人工清理参考。

## 14. 保留资产说明

本轮保留以下资产用于人工查看配置，**未执行任何删除**（仅删除了为演练 `lottery delete` 而建的临时福袋 `73557`）：

| 资产 | ID | 说明 |
|---|---|---|
| 测试频道 | `7983885` | `GNHF-电商场景-03-live-lottery-202606222254`，活动营销/纯视频横屏，watchStatus=unStart |
| 暖场福袋 | `73554` | 整点秒抽-暖场福袋（none），更新后 amount=5、奖品 99减30专享券（加码），status=Y |
| 观看福袋 | `73555` | 留人福袋-观看3分钟（duration/180s/活动时长 3min），amount=2，奖品 正装体验装1份 |
| 裂变福袋 | `73556` | 裂变福袋-邀请3位好友（invite/inviteNum 3/poster/活动时长 1min），amount=5，奖品 无门槛15元券 |
| latest 复测频道 | `7986869` | `GNHF-电商场景-03-live-lottery-latest-202606231547`，活动营销/纯视频横屏，watchStatus=unStart |
| latest 暖场福袋 | `73727` | 整点秒抽-暖场福袋-latest（none），更新后 amount=5、奖品 99减30专享券（加码-latest），status=Y |
| latest 观看福袋 | `73728` | 留人福袋-观看3分钟-latest（duration/180s/活动时长 3min），amount=2，奖品 正装体验装1份 |
| latest 裂变福袋 | `73729` | 裂变福袋-邀请3位好友-latest（invite/inviteNum 3/poster/活动时长 1min），amount=5，奖品 无门槛15元券 |
| 本地修复验证评论福袋 | `73731` | 弹幕福袋-评论解锁-localfix（comment/duration=60/comment=参与抽奖/活动时长 1min），amount=3，奖品 限量周边礼盒 |
| latest 1.2.32 评论福袋 | `73739` | 评论抽奖1.2.32（comment/duration=60/comment=参与抽奖/活动时长 1min），amount=3，奖品 限量周边礼盒 |

> 原始频道与 latest 复测频道、原始 3 张福袋、latest 4 张福袋均已保留，未删除。如需清理，参见上文「可选的人工清理命令」，但该清理命令本轮未执行。

## 15. 可复用模板

运营在真实直播中复用时，替换占位符即可（`<频道ID>`、`<福袋名>`、`<奖品名>`、`<名额>`、`<观看秒>`、`<邀请人数>`）：

```bash
# 1) 暖场无条件福袋（开播即开抽）
npx --yes polyv-live-cli@latest lottery create \
  -c <频道ID> --name "<福袋名>" \
  --type none --amount <名额> --prize-name "<奖品名>" -f -o json

# 2) 观看时长福袋（留人拉时长）
npx --yes polyv-live-cli@latest lottery create \
  -c <频道ID> --name "<福袋名>" \
  --type duration --amount <名额> --prize-name "<奖品名>" \
  --duration <观看秒> -f -o json

# 3) 邀请裂变福袋（私域拉新）
npx --yes polyv-live-cli@latest lottery create \
  -c <频道ID> --name "<福袋名>" \
  --type invite --amount <名额> --prize-name "<奖品名>" \
  --duration <活动秒> --invite-num <邀请人数> -f -o json

# 4) 评论福袋
npx --yes polyv-live-cli@latest lottery create \
  -c <频道ID> --name "<福袋名>" \
  --type comment --amount <名额> --prize-name "<奖品名>" \
  --duration <活动秒> --comment "<评论内容>" -f -o json

# 5) 直播中加码名额/奖品（如转化不及预期临时加码）
npx --yes polyv-live-cli@latest lottery update \
  -c <频道ID> --id <福袋ID> \
  --amount <新名额> --prize-name "<新奖品名>" -f -o json

# 6) 停抽/清理福袋
npx --yes polyv-live-cli@latest lottery delete -c <频道ID> --id <福袋ID> -f -o json

# 7) 复盘：开奖后查中奖名单与抽奖记录（需有真实中奖数据）
npx --yes polyv-live-cli@latest lottery winners -c <频道ID> --lottery-id <福袋ID> -o json
npx --yes polyv-live-cli@latest lottery records -c <频道ID> -o json
```

> 注意：`--type comment` 需要 npm latest 1.2.32+；1.2.31 会因缺少 `--comment` 映射而失败。

## 16. 后续可扩展方向

- **评论型福袋**：`comment` 类型的活动时长与评论内容映射已在 npm latest 1.2.32 发布并真实验证成功；后续可补开奖与观众侧参与验证。
- **开奖与复盘**：频道真实开播并开奖后，用 `lottery winners`、`lottery records`、`lottery channel-records` 复盘中奖名单与跨频道抽奖记录，把「促活 → 中奖 → 复购」闭环补全。
- **中奖者信息收集**：用 `lottery receive-info` / `receive-info` 配置中奖者收件信息表单，承接实物奖品发放（后续场景覆盖）。
- **白名单/黑名单分组抽奖**：用 `lottery group`、`lottery group-viewer`、`lottery blacklist` 做会员专享或防刷抽奖（与 `whitelist`、`viewer` 命令联动，后续场景覆盖）。
- **与签到/问答联动**：把抽奖与 `checkin`（签到）、`qa`（问答）组合，做「签到抽 → 答题抽」的连贯互动剧本（后续场景覆盖）。
- **福袋 lucky-bag / wait**：探索 `lottery lucky-bag`（福袋数据）与 `lottery wait`（条件抽奖等待调度）在电商场景的应用（后续场景覆盖）。
