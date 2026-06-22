# 场景 05：会员专享直播 — 白名单观看与观看条件鉴权

> 业务阶段：**治理 / 预热**
> 覆盖一级命令：`whitelist`、`watch-condition`、`channel`、`account`
> 真实执行状态：**已执行成功**（`whitelist` 全生命周期成功；`watch-condition get` 成功；`watch-condition set` 已执行失败并作为问题发现记录）

---

## 1. 场景名称

会员专享直播 —— 把一场直播的观看权限收紧为「仅白名单会员可看」，用于黑卡/金卡 VIP 内购会、老客私域回馈场、经销商内部培训等**不希望公开扩散**的电商直播场景。

核心是把「观看条件鉴权」与「白名单成员管理」串成一个可照着执行的操作闭环：

- **观看条件侧**：把频道的主要/次要观看条件切换为「白名单观看（phone）」，让非白名单观众在观看页被拦在鉴权门外。
- **白名单成员侧**：用真实会员码（手机号）把 VIP 会员逐个加入白名单，演练增、查（含关键词搜索）、改（会员升级换码）、删全生命周期。

> ⚠️ 本场景发现一个**真实执行问题**：`watch-condition set` 对测试频道 `7983898` 的主要条件（rank 1）所有 `--auth-type` 取值（`phone`/`code`/`none`）均返回 `success:true`，但 `watch-condition get` 与 `channel get` 的 `authSettings` 复查均显示**配置未持久化**（rank 1 始终停留在初始的 `custom`）。详见第 12 节问题记录。该问题不影响白名单成员管理——频道**次要条件（rank 2）默认即为 `phone` 白名单模式**，白名单成员在 rank 2 上真实生效，本场景即以 rank 2 作为会员专享鉴权门。

## 2. 覆盖命令

| 一级命令 | 子命令 | 执行状态 | 说明 |
|---|---|---|---|
| `account` | `account current`、`account list` | 已执行成功 | 写入前账号预检 |
| `channel` | `channel create`、`channel get` | 已执行成功 | 创建专用测试频道并验证频道存在 |
| `watch-condition` | `watch-condition get` | 已执行成功 | 基线查询、set 后多次复查（变更前/后对比） |
| `watch-condition` | `watch-condition set`（`phone`/`code`/`none`/config-file） | 已执行失败 | 均返回 `success:true` 但配置未持久化；其中 `--auth-type code --auth-code "GNHF05vip"` 另报 `param length is incorrect: authCode`。见第 12 节 |
| `whitelist` | `whitelist list` | 已执行成功 | rank1/rank2 基线、增改删前后多次验证、关键词搜索 |
| `whitelist` | `whitelist add` | 已执行成功 | 逐个新增 3 名 VIP + 1 个临时白名单（共 4 次） |
| `whitelist` | `whitelist update` | 已执行成功 | 张三 黑卡→金卡升级、换会员码，并前后对比验证 |
| `whitelist` | `whitelist remove` | 已执行成功 | 删除临时白名单并验证列表回归 3 条 |

> 说明：本场景所有「已执行成功」命令均使用真实账号（`nicksu`）与真实测试频道（`7983898`）真实执行过，下文「命令执行台账」逐条记录。仅做 `--help` 校验、未真实执行的命令不计入覆盖；`watch-condition set` 真实执行但未达预期效果，按「已执行失败」并作为问题发现记录。

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道名称 | `GNHF-电商场景-05-member-exclusive-whitelist-202606222322` |
| 频道 ID | `7983898` |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production） |
| 场景类型 | `alone`（活动营销） |
| 模板 | `alone`（纯视频-横屏） |
| 创建结果 | 成功（status=waiting / watchStatus=unStart / 未开始） |
| 创建时间 | 2026-06-22 23:22:49 CST |
| 是否删除 | **否，频道已保留**，供人工查看白名单与观看条件配置 |

> 初始观看条件（创建后 `channel get` 即返回，未由本场景改写成功）：rank 1 主要条件 `authType=custom`（账号级默认的自定义授权占位），rank 2 次要条件 `authType=phone`（白名单观看）、`enabled=Y`、`whiteListEntryText=白名单验证入口`。即**次要条件默认就是白名单模式**，本场景的白名单成员即挂在 rank 2 上生效。

## 4. 行业背景

电商直播里有一类「**不希望被公开看到**」的场：黑卡/金卡 VIP 内购首发、经销商内部政策宣讲、老客私域回馈场、付费课程先导课。这类场如果走公开观看，一方面会被竞品爬走价格政策，另一方面会稀释 VIP 会员的专属感。

保利威「白名单观看（phone）」就是把这类场做成**会员专享**的标准能力：

- 运营把观看条件设为白名单鉴权，非白名单观众在观看页输入手机号后会被「不在白名单」拦下。
- 真正的 VIP 会员（会员码=手机号）逐个录入白名单后即可观看。
- 直播前可随时增/改/删白名单（临时加几个kol、给升级会员换码、清退失效号码），做到**「谁可看」完全可控**。

本场景把「查观看条件 → 试图收紧观看条件 → 管理白名单成员全生命周期」串成一个真实可执行的操作手册，全部用真实测试频道验证，并如实记录 `watch-condition set` 不持久化的问题。

## 5. 业务目标与核心 KPI

- **业务目标**：把测试频道收紧为「仅白名单会员可看」，并掌握白名单成员的增/查/改/停能力。
- **核心 KPI**：
  - 至少 3 名 VIP 会员以真实会员码（手机号）成功录入白名单，并经 `whitelist list` 可见。
  - 关键词搜索能按会员码或昵称命中目标会员。
  - `whitelist update` 能把一名会员的会员码与昵称同步变更（模拟黑卡→金卡升级），并在 `whitelist list` 前后对比中验证生效。
  - `whitelist remove` 能删除指定白名单，删除后 `whitelist list` 总数回归。
  - 频道观看条件经 `watch-condition get` / `channel get` 复核，明确鉴权现状（含 set 不持久化的问题发现）。

## 6. 适用角色

- 电商运营 / 会员运营：负责 VIP 白名单成员的录入、升级换码、清退。
- 直播场控：负责直播前/中把频道观看条件收紧或放开（本场景覆盖配置与生命周期演练，不涉及真实直播观众侧验证）。

## 7. 前置条件

1. 已安装可访问 npm rc 发布版的 Node 环境，可用 `npx --yes polyv-live-cli@rc`。
2. 已配置可用账号且为默认账号（本场景使用 `nicksu`）。
3. 已创建专用测试频道（本场景为本轮新建的测试频道 `7983898`）。
4. 已明确要录入白名单的会员码（手机号）与昵称（备注）。
5. **已知限制**：`watch-condition set` 在当前 rc 版本（1.2.31-rc.0）对 rank 1 写入不持久化（返回 `success:true` 但 `get` 无变化），见第 12 节。若需把**主要条件**也切成白名单，建议在保利威后台操作或等待 CLI 修复；本场景的白名单鉴权门依赖 rank 2（默认即 phone）。

## 8. polyv-live-cli-rc 能力映射

| 业务动作 | CLI 一级命令 | 子命令 | 关键参数 |
|---|---|---|---|
| 写入前账号预检 | `account` | `current` / `list` | 无 |
| 创建专用测试频道 | `channel` | `create` | `-n`、`--scene alone`、`--template alone` |
| 查观看条件现状 | `watch-condition` | `get` | `--channel-id` |
| 收紧观看条件（**当前失败**） | `watch-condition` | `set` | `--channel-id`、`--rank`、`--auth-type phone`、`--enabled` |
| 查白名单列表 | `whitelist` | `list` | `--channel-id`、`--rank`、`--keyword` |
| 新增白名单会员 | `whitelist` | `add` | `--channel-id`、`--rank`、`--code`、`--name` |
| 会员升级换码 | `whitelist` | `update` | `--channel-id`、`--rank`、`--old-code`、`--code`、`--name` |
| 清退白名单会员 | `whitelist` | `remove` | `--channel-id`、`--rank`、`--codes` |

## 9. 实施步骤

1. **账号预检**：执行 `account current` 与 `account list`，确认当前默认账号。
2. **创建专用测试频道**：用反映场景的名称创建活动营销频道，记录频道 ID。
3. **观看条件基线**：`channel get` 与 `watch-condition get` 记录初始鉴权现状（rank1=custom / rank2=phone）。
4. **白名单基线**：`whitelist list --rank 1` 与 `--rank 2` 确认新频道两边白名单均为空。
5. **校验 set help**：运行 `watch-condition set --help`，确认 `--rank`、`--auth-type`、`--enabled`、`--auth-code`、`--config-file` 等参数真实存在。
6. **尝试收紧主要条件**：`watch-condition set --rank 1 --auth-type phone`（**预期不持久化**，记录问题）。
7. **换类型复测 set**：`--auth-type code --auth-code`（其中 `"GNHF05vip"` 报 param length 错；`"888888"` 返回 success 但不持久化）、`--auth-type none`、`--config-file` JSON 配置，均**不持久化**，逐一记录。
8. **结论**：rank 1 写入路径不可用，会员专享鉴权门改用 rank 2（默认 phone）。
9. **新增 VIP 白名单**：`whitelist add --rank 2` 逐个录入 3 名 VIP 会员（手机号+昵称）。
10. **列表验证**：`whitelist list --rank 2` 确认 3 条入库；`--keyword` 搜索验证命中。
11. **会员升级换码**：`whitelist update --rank 2` 把张三 由黑卡升级金卡并换会员码。
12. **更新后验证**：`whitelist list --rank 2` 前后对比，确认旧码消失、新码与新昵称入库。
13. **删除演练**：建一条临时白名单 → `whitelist remove` 删除 → `whitelist list` 验证总数回归 3。

## 10. 命令执行台账

> 时间均为 2026-06-22 CST；敏感值（AppSecret、推流密钥）已脱敏，下文不出现。会员码为虚构测试号码。

| # | 执行时间 | 一级命令 / 子命令 | 实际执行命令（脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 23:22 | `account current` | `npx --yes polyv-live-cli@rc account current` | 账号 `nicksu` | 成功 | 默认账号 nicksu，来源全局配置 |
| 2 | 23:22 | `account list` | `npx --yes polyv-live-cli@rc account list` | 共 6 个账号 | 成功 | nicksu/testpolyv6/lizhikang/bd 等可用 |
| 3 | 23:22 | `channel create` | `npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-05-member-exclusive-whitelist-202606222322" -d "..." --scene alone --template alone -o json` | 新建 `7983898` | 成功 | channelId=7983898，status=waiting，watchStatus=unStart |
| 4 | 23:23 | `channel get`（基线） | `npx --yes polyv-live-cli@rc channel get -c 7983898 -o json` | 频道 `7983898` | 成功 | watchStatus=unStart；authSettings：rank1=custom、rank2=phone(白名单验证入口) |
| 5 | 23:23 | `watch-condition get`（基线） | `npx --yes polyv-live-cli@rc watch-condition get --channel-id 7983898 -o json` | 频道 `7983898` | 成功 | rank1 authType=custom/enabled=Y；rank2 authType=phone/enabled=Y |
| 6 | 23:23 | `whitelist list`（rank1 基线） | `npx --yes polyv-live-cli@rc whitelist list --channel-id 7983898 --rank 1 -o json` | 频道 `7983898` rank1 | 成功 | contents=[]（空） |
| 7 | 23:23 | `whitelist list`（rank2 基线） | `npx --yes polyv-live-cli@rc whitelist list --channel-id 7983898 --rank 2 -o json` | 频道 `7983898` rank2 | 成功 | contents=[]（空） |
| 8 | 23:23 | `watch-condition set`（rank1→phone） | `npx --yes polyv-live-cli@rc watch-condition set --channel-id 7983898 --rank 1 --auth-type phone --enabled Y -o json` | 频道 `7983898` | **失败（静默）** | 返回 `{success:true}`，但后续 `get` 复查 rank1 仍为 custom，未持久化 |
| 9 | 23:23 | `watch-condition get`（set phone 后） | `npx --yes polyv-live-cli@rc watch-condition get --channel-id 7983898 -o json` | 频道 `7983898` | 成功 | rank1 仍 authType=**custom**（与基线一致，变更未生效） |
| 10 | 23:24 | `watch-condition set`（rank1→code，9 位码） | `... watch-condition set --channel-id 7983898 --rank 1 --auth-type code --enabled Y --auth-code "GNHF05vip" -o json` | 频道 `7983898` | **失败** | `setWatchCondition failed: param length is incorrect: authCode` |
| 11 | 23:24 | `watch-condition set`（rank1→code，6 位数字码） | `... --auth-type code --enabled Y --auth-code "888888" -o json` | 频道 `7983898` | **失败（静默）** | 返回 `{success:true}`，但复查 authCode=null、authType 仍 custom |
| 12 | 23:24 | `channel get`（交叉验证 authSettings） | `npx --yes polyv-live-cli@rc channel get -c 7983898 -o json` | 频道 `7983898` | 成功 | authSettings rank1 仍 custom/authCode=null（与 watch-condition get 一致） |
| 13 | 23:24 | `watch-condition get`（延迟 5s 复查） | `sleep 5 && ... watch-condition get --channel-id 7983898 -o json` | 频道 `7983898` | 成功 | rank1 仍 custom（排除传播延迟） |
| 14 | 23:24 | `watch-condition set`（rank1→none） | `... --rank 1 --auth-type none --enabled Y -o json` | 频道 `7983898` | **失败（静默）** | 返回 `{success:true}`，复查 rank1 仍 custom |
| 15 | 23:25 | `watch-condition set`（config-file→rank1 phone） | `... --channel-id 7983898 --config-file /tmp/gnhf05-watch-condition-rank1-phone.json -o json` | 频道 `7983898` | **失败（静默）** | 返回 `{success:true}`，复查 rank1 仍 custom（config-file 路径同样不持久化） |
| 16 | 23:25 | `whitelist add`（VIP 张三） | `npx --yes polyv-live-cli@rc whitelist add --channel-id 7983898 --rank 2 --code "13800000001" --name "VIP-张三-黑卡" -o json` | rank2 `13800000001` | 成功 | `白名单添加成功` |
| 17 | 23:25 | `whitelist add`（VIP 李四） | `... --rank 2 --code "13800000002" --name "VIP-李四-黑卡" -o json` | rank2 `13800000002` | 成功 | `白名单添加成功` |
| 18 | 23:25 | `whitelist add`（VIP 王五） | `... --rank 2 --code "13800000003" --name "VIP-王五-金卡" -o json` | rank2 `13800000003` | 成功 | `白名单添加成功` |
| 19 | 23:25 | `whitelist list`（rank2，新增后） | `npx --yes polyv-live-cli@rc whitelist list --channel-id 7983898 --rank 2 -o json` | 频道 `7983898` rank2 | 成功 | contents=3（王五/李四/张三） |
| 20 | 23:25 | `whitelist list`（关键词「张三」） | `... --rank 2 --keyword "张三" -o json` | 频道 `7983898` rank2 | 成功 | 命中 1 条：13800000001/VIP-张三-黑卡 |
| 21 | 23:26 | `whitelist update`（张三升级换码） | `npx --yes polyv-live-cli@rc whitelist update --channel-id 7983898 --rank 2 --old-code "13800000001" --code "13800000011" --name "VIP-张三-升级金卡" -o json` | rank2 `001→011` | 成功 | `白名单更新成功`，oldCode=001/newCode=011 |
| 22 | 23:26 | `whitelist list`（rank2，更新后） | `npx --yes polyv-live-cli@rc whitelist list --channel-id 7983898 --rank 2 -o json` | 频道 `7983898` rank2 | 成功 | contents=3：王五金卡/李四黑卡/**张三升级金卡(011)**，旧码 001 已消失 |
| 23 | 23:26 | `whitelist add`（临时，演练删除） | `... --rank 2 --code "13800000099" --name "演练删除-临时白名单" -o json` | rank2 `13800000099` | 成功 | `白名单添加成功` |
| 24 | 23:26 | `whitelist list`（rank2，删除前） | `... --rank 2 -o json` | 频道 `7983898` rank2 | 成功 | contents=4（含临时 099） |
| 25 | 23:26 | `whitelist remove`（删临时） | `npx --yes polyv-live-cli@rc whitelist remove --channel-id 7983898 --rank 2 --codes "13800000099" -o json` | rank2 `13800000099` | 成功 | `白名单删除成功`，clear=false |
| 26 | 23:26 | `whitelist list`（rank2，删除后） | `... --rank 2 -o json` | 频道 `7983898` rank2 | 成功 | contents=3（临时 099 已消失），回归王五/李四/张三 |
| 27 | 23:27 | `channel get`（收尾确认） | `npx --yes polyv-live-cli@rc channel get -c 7983898 -o json` | 频道 `7983898` | 成功 | 频道存在，watchStatus=unStart，未删除 |

## 11. 实际使用的 CLI 命令与真实参数

```bash
# 1) 账号预检
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list

# 2) 创建专用测试频道（活动营销 / 纯视频横屏）
npx --yes polyv-live-cli@rc channel create \
  -n "GNHF-电商场景-05-member-exclusive-whitelist-202606222322" \
  -d "电商营销场景05：会员专享直播-白名单观看与观看条件鉴权专用测试频道，GNHF 创建保留不删除" \
  --scene alone --template alone -o json

# 3) 观看条件与白名单基线
npx --yes polyv-live-cli@rc channel get -c 7983898 -o json
npx --yes polyv-live-cli@rc watch-condition get --channel-id 7983898 -o json
npx --yes polyv-live-cli@rc whitelist list --channel-id 7983898 --rank 1 -o json
npx --yes polyv-live-cli@rc whitelist list --channel-id 7983898 --rank 2 -o json

# 4) 试图把主要条件（rank 1）切成白名单 —— 当前 rc 不持久化（返回 success 但 get 无变化）
npx --yes polyv-live-cli@rc watch-condition set \
  --channel-id 7983898 --rank 1 --auth-type phone --enabled Y -o json
npx --yes polyv-live-cli@rc watch-condition get --channel-id 7983898 -o json   # rank1 仍 custom

# 5) 换 code 类型复测 —— 9 位字母数字码报 param length 错；6 位数字码返回 success 但仍不持久化
npx --yes polyv-live-cli@rc watch-condition set \
  --channel-id 7983898 --rank 1 --auth-type code --enabled Y --auth-code "GNHF05vip" -o json
# => Error: setWatchCondition failed: param length is incorrect: authCode
npx --yes polyv-live-cli@rc watch-condition set \
  --channel-id 7983898 --rank 1 --auth-type code --enabled Y --auth-code "888888" -o json

# 6) config-file 路径同样不持久化
npx --yes polyv-live-cli@rc watch-condition set \
  --channel-id 7983898 --config-file /tmp/gnhf05-watch-condition-rank1-phone.json -o json

# 7) 结论：会员专享鉴权门用 rank 2（默认 phone）。新增 VIP 白名单（手机号=会员码）
npx --yes polyv-live-cli@rc whitelist add \
  --channel-id 7983898 --rank 2 --code "13800000001" --name "VIP-张三-黑卡" -o json
npx --yes polyv-live-cli@rc whitelist add \
  --channel-id 7983898 --rank 2 --code "13800000002" --name "VIP-李四-黑卡" -o json
npx --yes polyv-live-cli@rc whitelist add \
  --channel-id 7983898 --rank 2 --code "13800000003" --name "VIP-王五-金卡" -o json

# 8) 列表验证 + 关键词搜索
npx --yes polyv-live-cli@rc whitelist list --channel-id 7983898 --rank 2 -o json
npx --yes polyv-live-cli@rc whitelist list --channel-id 7983898 --rank 2 --keyword "张三" -o json

# 9) 会员升级换码：张三 黑卡→金卡，会员码 001→011
npx --yes polyv-live-cli@rc whitelist update \
  --channel-id 7983898 --rank 2 \
  --old-code "13800000001" --code "13800000011" --name "VIP-张三-升级金卡" -o json
npx --yes polyv-live-cli@rc whitelist list --channel-id 7983898 --rank 2 -o json   # 旧码消失、新码入库

# 10) 删除演练：建临时白名单 → 删除 → 列表回归 3 条
npx --yes polyv-live-cli@rc whitelist add \
  --channel-id 7983898 --rank 2 --code "13800000099" --name "演练删除-临时白名单" -o json
npx --yes polyv-live-cli@rc whitelist remove --channel-id 7983898 --rank 2 --codes "13800000099" -o json
npx --yes polyv-live-cli@rc whitelist list --channel-id 7983898 --rank 2 -o json   # => contents=3
```

> 参数风格：`watch-condition` 与 `whitelist` 全族用 kebab-case 长参数（`--channel-id`、`--auth-type`、`--old-code`、`--codes`），无短参数；`whitelist` 的 `--rank` 为必填，必须与观看条件级别对应（rank 2=本场景默认白名单模式）。

## 12. 执行或验证结果

- ✅ 测试频道 `7983898` 创建成功，watchStatus=unStart，归属 nicksu。
- ✅ **白名单全生命周期验证通过**：
  - 新增 3 名 VIP（13800000001 张三黑卡 / 002 李四黑卡 / 003 王五金卡）全部 `白名单添加成功`，`whitelist list --rank 2` 返回 contents=3。
  - 关键词 `--keyword "张三"` 精确命中 1 条（13800000001）。
  - **更新已前后对比验证**：更新前 `whitelist list` 含 `13800000001/VIP-张三-黑卡`；`whitelist update --old-code 001 --code 011` 返回 `白名单更新成功`；更新后 `whitelist list` 显示旧码 001 消失、新条目 `13800000011/VIP-张三-升级金卡` 入库。变更确已生效。
  - **删除已验证**：临时白名单 `13800000099` 创建后 `whitelist remove` 返回 `白名单删除成功`，删除后 `whitelist list` 由 4 条回归 3 条，临时条目消失。
- ⚠️ **观看条件查询可用**：`watch-condition get` 与 `channel get` 的 `authSettings` 一致返回 rank1=custom / rank2=phone，作为配置侧鉴权现状的可靠只读验证原语。

**关键排查发现 / 问题记录**：

1. **【`watch-condition set` 静默不持久化 — CLI/rc 问题】对测试频道 `7983898` 的 rank 1 主要条件，`watch-condition set` 在所有 `--auth-type` 取值下均返回 `{success:true, channelId:7983898}`，但 `watch-condition get` 与 `channel get` 的 `authSettings` 复查均显示 rank 1 始终停留在初始 `custom`、`authCode=null`、`enabled=Y`，**配置未发生任何持久化**。
   - 复测矩阵：`--auth-type phone`（不持久化）、`--auth-type none`（不持久化）、`--auth-type code --auth-code "888888"`（不持久化）、`--config-file` JSON 配置 `rank1=phone`（不持久化）；并经 5 秒延迟复查与 `channel get` 交叉验证，排除传播延迟与读路径差异。
   - **额外一条显式报错**：`--auth-type code --auth-code "GNHF05vip"`（9 位字母数字）报 `setWatchCondition failed: param length is incorrect: authCode`；改 6 位数字 `"888888"` 后不再报长度错、但返回 success 后仍不持久化，说明长度校验与持久化是两个独立问题。
   - **已做排查**：①确认 `watch-condition set --help` 参数拼写正确；②交叉用 `channel get` 的 `authSettings` 验证（与 `watch-condition get` 结论一致）；③延迟 5s 复查排除缓存；④换 `code`/`none` 类型与 config-file 路径均不持久化。
   - **下一步建议**：①升级到修复该持久化的 rc 版本后重试；②临时如需把**主要条件**切成白名单/密码/付费，在保利威后台「观看条件」页操作；③本场景已用 rank 2（默认 phone）作为会员专享鉴权门，白名单成员真实生效，不阻塞业务。
2. **【频道默认次要条件即白名单模式】新建活动营销频道（alone/alone）的 rank 2 次要条件默认为 `authType=phone`（白名单观看）、`enabled=Y`、`whiteListEntryText=白名单验证入口`**，无需额外开启即可直接挂白名单成员；rank 1 主要条件默认为 `custom`（账号级自定义授权占位）。运营做会员专享场时，若不强制要求主要条件鉴权，直接用 rank 2 白名单即可。
3. **【白名单挂载在条件级别 rank 上】`whitelist` 全族必填 `--rank`，且白名单成员只在对应 rank 的 `authType=phone` 时才对观众生效**。本场景 rank 2=phone 故 rank 2 白名单生效；rank 1=custom 故 rank 1 白名单即使录入也不生效（本场景 rank 1 白名单保持空）。
4. **【频道描述未持久化】`channel create` 传入了 `-d` 描述，但 `channel get` 的 `desc` 回填为空**（与场景 01/02/03 一致的已知现象），不属于本场景执行失败。

> ⚠️ 配置侧 vs 观众侧（依规则区分）：本场景「白名单增/改/删生效」「观看条件现状」均为通过 CLI/API 查询到的**配置侧已满足条件**。**未打开观看页、未做观众侧验证**，因此不写「观众侧非白名单被拦截 / 白名单会员可观看」。真实观众侧拦截效果需在直播中由真实观众端访问观看页验证（白名单鉴权需频道处于可观看态）。

## 13. 风险点与回滚/清理方式

| 风险 | 说明 | 回滚/清理 |
|---|---|---|
| `watch-condition set` 不持久化 | 返回 success 但配置不变，易让运营误以为已收紧观看条件 | 以 `watch-condition get` / `channel get` 复查为准；主要条件鉴权改在后台操作 |
| 白名单录错会员码 | 真实会员因错码被拦在门外 | `whitelist update --old-code <错码> --code <对码>` 改码（本场景已演练） |
| 白名单建错频道/rank | 影响真实直播鉴权 | 仅使用本轮新建测试频道 `7983898`；白名单挂在 rank 2（默认 phone）上 |
| 残留测试白名单 | 占用白名单条数 | `whitelist remove --codes <会员码>` 清理（本场景仅删除了临时 099） |
| 直播前误清空白名单 | 全员被拦在门外 | 删除前用 `whitelist list` 核对；避免在直播临近时 `--clear` |

**可选的人工清理命令（未执行，仅备查）**：

```bash
# 删除保留的测试白名单会员（未执行，白名单按约定保留供查看）
npx --yes polyv-live-cli@rc whitelist remove --channel-id 7983898 --rank 2 --codes "13800000011"
npx --yes polyv-live-cli@rc whitelist remove --channel-id 7983898 --rank 2 --codes "13800000002"
npx --yes polyv-live-cli@rc whitelist remove --channel-id 7983898 --rank 2 --codes "13800000003"
# 或一次清空 rank 2 全部白名单（未执行）
npx --yes polyv-live-cli@rc whitelist remove --channel-id 7983898 --rank 2 --clear
# 删除测试频道（未执行，频道按约定保留）
npx --yes polyv-live-cli@rc channel delete -c 7983898 -f
```

> 上述清理命令**均未执行**，仅作为人工清理参考。

## 14. 保留资产说明

本轮保留以下资产用于人工查看配置，**未执行任何删除**（仅删除了为演练 `whitelist remove` 而建的临时白名单 `13800000099`）：

| 资产 | ID / 值 | 说明 |
|---|---|---|
| 测试频道 | `7983898` | `GNHF-电商场景-05-member-exclusive-whitelist-202606222322`，活动营销/纯视频横屏，watchStatus=unStart |
| 观看条件 rank 1 | `custom` | 主要条件（账号级默认占位）；本场景 set 写入未持久化，保留初始 custom |
| 观看条件 rank 2 | `phone`（白名单） | 次要条件，默认白名单模式、enabled=Y；本场景会员专享鉴权门 |
| 白名单会员 · 张三 | `13800000011` / `VIP-张三-升级金卡` | 由 001 黑卡升级换码为 011 金卡 |
| 白名单会员 · 李四 | `13800000002` / `VIP-李四-黑卡` | rank 2 |
| 白名单会员 · 王五 | `13800000003` / `VIP-王五-金卡` | rank 2 |

> 频道、观看条件与 3 名 VIP 白名单均已保留，未删除。如需清理，参见上文「可选的人工清理命令」，但该清理命令本轮未执行。

## 15. 可复用模板

运营在真实会员专享直播中复用时，替换占位符即可（`<频道ID>`、`<会员码>`、`<昵称>`、`<旧码>`）：

```bash
# 0) 前置：确认频道次要条件(rank 2)为白名单(phone)模式
npx --yes polyv-live-cli@rc watch-condition get --channel-id <频道ID> -o json

# 1) 录入 VIP 会员（会员码=手机号）
npx --yes polyv-live-cli@rc whitelist add \
  --channel-id <频道ID> --rank 2 --code "<会员码>" --name "<昵称>" -o json

# 2) 查白名单 / 按关键词找人
npx --yes polyv-live-cli@rc whitelist list --channel-id <频道ID> --rank 2 -o json
npx --yes polyv-live-cli@rc whitelist list --channel-id <频道ID> --rank 2 --keyword "<昵称或码段>" -o json

# 3) 会员升级 / 换码（黑卡→金卡、手机号变更）
npx --yes polyv-live-cli@rc whitelist update \
  --channel-id <频道ID> --rank 2 \
  --old-code "<旧码>" --code "<新码>" --name "<新昵称>" -o json

# 4) 清退失效会员
npx --yes polyv-live-cli@rc whitelist remove \
  --channel-id <频道ID> --rank 2 --codes "<会员码>" -o json

# 5) 直播后一次性清空白名单（如该场为一次性内购会）
npx --yes polyv-live-cli@rc whitelist remove \
  --channel-id <频道ID> --rank 2 --clear -o json
```

> 注意：如需把**主要条件（rank 1）**也切成白名单/密码/付费，当前 rc 的 `watch-condition set` 写入不持久化（见第 12 节），请在保利威后台「观看条件」页操作，或待 CLI 修复后用 `watch-condition set --channel-id <频道ID> --rank 1 --auth-type phone --enabled Y`。

## 16. 后续可扩展方向

- **`watch-condition set` 持久化问题跟踪**：升级 rc 后重试 rank 1 写入（phone/code/pay/none），把「主要条件鉴权」补成真实执行覆盖，并补 auth-code 长度规则（当前 9 位报 param length、6 位不报但不持久化）。
- **登记观看（info）/付费观看（pay）**：用 `watch-condition set --config-file` 配 `infoFields`/`price` 做登记留资或付费直播（待 set 持久化修复后覆盖）。
- **与邀请榜单/观众标签联动**：把白名单会员与 `invite-sales`（邀请销售）、`viewer`（观众）、`custom-field`（自定义字段）结合，做「白名单会员邀请裂变榜」「VIP 分层标签运营」。
- **全局白名单 vs 频道白名单**：不传 `--channel-id` 即为全局白名单，可探索一批 VIP 跨频道复用的会员专享矩阵。
- **白名单批量导入**：当前 `whitelist add` 为单条，大批量会员可探索 `material`/后台批量导入，或脚本循环 add（注意 API 频控）。
- **观众侧验证**：频道开播后用真实手机号访问观看页，验证「白名单内可看 / 非白名单被拦」的观众侧效果，补全配置侧→观众侧证据链。
