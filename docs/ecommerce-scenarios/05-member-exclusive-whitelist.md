# 场景 05：会员专享直播 — 白名单观看与观看条件鉴权

> 业务阶段：**治理 / 预热**
> 覆盖一级命令：`whitelist`、`watch-condition`、`channel`、`account`
> 真实执行状态：**已执行成功（已复测修复）**（`whitelist` 全生命周期成功；`watch-condition get` 成功；`watch-condition set` 已在 `polyv-live-cli@latest` 1.2.36 复测通过；历史 rc 失败记录保留为问题发现）

---

## 1. 场景名称

会员专享直播 —— 把一场直播的观看权限收紧为「仅白名单会员可看」，用于黑卡/金卡 VIP 内购会、老客私域回馈场、经销商内部培训等**不希望公开扩散**的电商直播场景。

核心是把「观看条件鉴权」与「白名单成员管理」串成一个可照着执行的操作闭环：

- **观看条件侧**：把频道的主要/次要观看条件切换为「白名单观看（phone）」，让非白名单观众在观看页被拦在鉴权门外。
- **白名单成员侧**：用真实会员码（手机号）把 VIP 会员逐个加入白名单，演练增、查（含关键词搜索）、改（会员升级换码）、删全生命周期。

> ✅ 修复复测：旧版 rc / npm latest 1.2.35 曾存在 `watch-condition set` 返回 `success:true` 但频道配置不持久化的问题。根因是 SDK 把 `channelId` 放进 JSON body，后端未按目标频道处理，表现为写到账号通用观看条件面而不是频道 `authSettings`；这不是直播频道当前模板的成功写入。已在 `polyv-live-api-sdk@1.0.16` / `polyv-live-cli@1.2.36` 修复为 query 参数传递 `channelId`。2026-06-23 使用 `polyv-live-cli@latest` 1.2.36 在频道 `7988182` 复测，rank 1 成功写入 `phone` 白名单，rank 2 禁用，`watch-condition get` 与 `channel get` 一致读回。历史失败记录保留在第 10.1 / 12.1 节。

## 2. 覆盖命令

| 一级命令 | 子命令 | 执行状态 | 说明 |
|---|---|---|---|
| `account` | `account current`、`account list` | 已执行成功 | 写入前账号预检 |
| `channel` | `channel create`、`channel get` | 已执行成功 | 创建专用测试频道并验证频道存在 |
| `watch-condition` | `watch-condition get` | 已执行成功 | 基线查询、set 后多次复查（变更前/后对比） |
| `watch-condition` | `watch-condition set`（`phone`/`code`/config-file） | 已执行成功（1.2.36 复测通过） | config-file 写入 rank1=`phone` / rank2=`N` 成功；普通参数路径 rank1=`code` / `authCode=123456` 也成功。旧 rc 失败记录保留；`GNHF05vip` 9 位码仍会被后端长度校验拒绝 |
| `whitelist` | `whitelist list` | 已执行成功 | rank1/rank2 基线、增改删前后多次验证、关键词搜索 |
| `whitelist` | `whitelist add` | 已执行成功 | 逐个新增 3 名 VIP + 1 个临时白名单（共 4 次） |
| `whitelist` | `whitelist update` | 已执行成功 | 张三 黑卡→金卡升级、换会员码，并前后对比验证 |
| `whitelist` | `whitelist remove` | 已执行成功 | 删除临时白名单并验证列表回归 3 条 |

> 说明：本场景所有「已执行成功」命令均使用真实账号（`nicksu`）与真实测试频道真实执行过。历史频道 `7983898` 记录了旧 rc 的失败现场；修复复测频道 `7988182` 记录了 latest 1.2.36 的成功写入与读回。仅做 `--help` 校验、未真实执行的命令不计入覆盖。

## 3. 专用测试频道与复测频道

### 3.1 历史问题发现频道

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

### 3.2 修复后复测频道

| 项 | 值 |
|---|---|
| 频道名称 | `GNHF-电商场景-05-watch-condition-fix-202606232330` |
| 频道 ID | `7988182` |
| 账号环境 | `nicksu`（production） |
| 场景类型 | `alone`（活动营销） |
| 模板 | `alone`（纯视频-横屏） |
| 创建结果 | 成功（status=waiting / watchStatus=unStart / 未开始） |
| 创建时间 | 2026-06-23 23:31:16 CST |
| 是否删除 | **否，频道已保留**，供人工查看修复后的观看条件配置 |

> 修复复测后的观看条件：rank 1 主要条件 `authType=phone`、`enabled=Y`、`authTips=请输入会员手机号验证`、`whiteListEntryText=会员白名单入口`；rank 2 `enabled=N`。rank 1 白名单保留 1 名测试会员：`13800003601` / `VIP-fix-rank1-张三`。复测中曾临时把 rank 1 切为 `code` 并写入 `authCode=123456`，随后恢复为 `phone`；API 仍回显该 `authCode` 字段残留，但当前生效类型是 `authType=phone`。

## 4. 行业背景

电商直播里有一类「**不希望被公开看到**」的场：黑卡/金卡 VIP 内购首发、经销商内部政策宣讲、老客私域回馈场、付费课程先导课。这类场如果走公开观看，一方面会被竞品爬走价格政策，另一方面会稀释 VIP 会员的专属感。

保利威「白名单观看（phone）」就是把这类场做成**会员专享**的标准能力：

- 运营把观看条件设为白名单鉴权，非白名单观众在观看页输入手机号后会被「不在白名单」拦下。
- 真正的 VIP 会员（会员码=手机号）逐个录入白名单后即可观看。
- 直播前可随时增/改/删白名单（临时加几个kol、给升级会员换码、清退失效号码），做到**「谁可看」完全可控**。

本场景把「查观看条件 → 收紧观看条件 → 管理白名单成员全生命周期」串成一个真实可执行的操作手册，全部用真实测试频道验证。旧版 `watch-condition set` 不持久化的问题已作为历史问题保留；修复后已补充 latest 1.2.36 的成功复测证据。

## 5. 业务目标与核心 KPI

- **业务目标**：把测试频道收紧为「仅白名单会员可看」，并掌握白名单成员的增/查/改/停能力。
- **核心 KPI**：
  - 至少 3 名 VIP 会员以真实会员码（手机号）成功录入白名单，并经 `whitelist list` 可见。
  - 关键词搜索能按会员码或昵称命中目标会员。
  - `whitelist update` 能把一名会员的会员码与昵称同步变更（模拟黑卡→金卡升级），并在 `whitelist list` 前后对比中验证生效。
  - `whitelist remove` 能删除指定白名单，删除后 `whitelist list` 总数回归。
  - 频道观看条件经 `watch-condition get` / `channel get` 复核，明确鉴权现状（含旧问题修复复测）。

## 6. 适用角色

- 电商运营 / 会员运营：负责 VIP 白名单成员的录入、升级换码、清退。
- 直播场控：负责直播前/中把频道观看条件收紧或放开（本场景覆盖配置与生命周期演练，不涉及真实直播观众侧验证）。

## 7. 前置条件

1. 已安装可访问 npm 发布版的 Node 环境，可用 `npx --yes polyv-live-cli@latest`。
2. 已配置可用账号且为默认账号（本场景使用 `nicksu`）。
3. 已创建专用测试频道（历史问题发现频道 `7983898`；修复复测频道 `7988182`）。
4. 已明确要录入白名单的会员码（手机号）与昵称（备注）。
5. **版本要求**：频道级 `watch-condition set` 使用 `polyv-live-cli@latest >= 1.2.36`。旧 rc / 1.2.35 的失败记录仅用于追溯，不再作为当前操作口径。
6. **配置约束**：避免把 rank 1 与 rank 2 同时设为 `phone` 且都启用；本场景用 config-file 将 rank 1 设为 `phone`，同时将 rank 2 设为 `enabled=N`。
7. **口令长度约束**：`--auth-type code --auth-code "GNHF05vip"` 会被后端拒绝（9 位，`param length is incorrect: authCode`）；使用口令时选择后端允许的长度（例如本次复测 `123456`）。

## 8. polyv-live-cli latest 能力映射

| 业务动作 | CLI 一级命令 | 子命令 | 关键参数 |
|---|---|---|---|
| 写入前账号预检 | `account` | `current` / `list` | 无 |
| 创建专用测试频道 | `channel` | `create` | `-n`、`--scene alone`、`--template alone` |
| 查观看条件现状 | `watch-condition` | `get` | `--channel-id` |
| 收紧观看条件（已修复） | `watch-condition` | `set` | `--channel-id`、`--rank`、`--auth-type phone`、`--enabled`；或 `--config-file` 全量 authSettings |
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
6. **新增 rank 1 VIP 白名单**：先用 `whitelist add --rank 1` 录入测试会员手机号。
7. **收紧主要条件**：用 `watch-condition set --config-file` 写入 rank1=`phone`、rank2=`enabled=N`，避免两级条件同时开启同一 `phone` 模式。
8. **双路径复核**：分别执行 `watch-condition get --channel-id` 与 `channel get -c`，确认 rank 1 为 `phone`、rank 2 已禁用。
9. **普通参数路径复测**：用 `--rank 1 --auth-type code --auth-code "123456"` 验证简单参数写入可持久化，再用 config-file 恢复 rank1=`phone`。
10. **保留历史白名单生命周期证据**：旧频道 `7983898` 已完整演练 rank 2 白名单 add/list/keyword/update/remove 全生命周期。
11. **真实业务复用**：当前版本优先使用 rank 1 白名单作为会员专享鉴权门；如沿用 rank 2 默认白名单，也必须先确认对应 rank 的 `authType=phone`。

## 10. 命令执行台账

### 10.1 历史执行台账（rc，问题发现）

> 时间均为 2026-06-22 CST；敏感值（AppSecret、推流密钥）已脱敏，下文不出现。会员码为虚构测试号码。该台账用于保留旧 rc 的问题发现过程。

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

### 10.2 修复后复测台账（latest 1.2.36）

> 时间均为 2026-06-23 CST；本节均使用 `npx --yes polyv-live-cli@latest`，实际解析版本为 1.2.36。

| # | 执行时间 | 一级命令 / 子命令 | 实际执行命令（脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 28 | 23:31 | `--version` | `npx --yes polyv-live-cli@latest --version` | - | 成功 | 输出 `1.2.36` |
| 29 | 23:31 | `account current` / `account list` | `npx --yes polyv-live-cli@latest account current`；`... account list` | 账号 `nicksu` | 成功 | 默认账号为 nicksu，账号列表可读 |
| 30 | 23:31 | `channel create` | `npx --yes polyv-live-cli@latest channel create -n "GNHF-电商场景-05-watch-condition-fix-202606232330" --scene alone --template alone -o json` | 新建 `7988182` | 成功 | channelId=7988182，status=waiting，watchStatus=unStart |
| 31 | 23:31 | `channel get` / `watch-condition get`（基线） | `... channel get -c 7988182 -o json`；`... watch-condition get --channel-id 7988182 -o json` | 频道 `7988182` | 成功 | 基线 rank1=custom，rank2=phone |
| 32 | 23:31 | `watch-condition get`（通用设置基线） | `npx --yes polyv-live-cli@latest watch-condition get -o json` | 账号通用观看条件 | 成功 | 基线保留旧测试值 rank1=phone/authCode=888888，rank2=N |
| 33 | 23:32 | `whitelist add`（rank1） | `npx --yes polyv-live-cli@latest whitelist add --channel-id 7988182 --rank 1 --code "13800003601" --name "VIP-fix-rank1-张三" -o json` | rank1 `13800003601` | 成功 | `白名单添加成功` |
| 34 | 23:32 | `watch-condition set`（config-file） | `npx --yes polyv-live-cli@latest watch-condition set --channel-id 7988182 --config-file /tmp/gnhf05-watch-condition-fix-*.json -o json` | 频道 `7988182` | 成功 | 返回 success，写入 rank1=phone、rank2=N |
| 35 | 23:32 | `watch-condition get` / `channel get`（写入后） | `... watch-condition get --channel-id 7988182 -o json`；`... channel get -c 7988182 -o json` | 频道 `7988182` | 成功 | 两条读路径一致返回 rank1=phone、rank2 enabled=N |
| 36 | 23:32 | `watch-condition get`（通用设置复查） | `npx --yes polyv-live-cli@latest watch-condition get -o json` | 账号通用观看条件 | 成功 | 与写入前一致，确认未误写通用设置 |
| 37 | 23:33 | `watch-condition set`（简单参数→code） | `npx --yes polyv-live-cli@latest watch-condition set --channel-id 7988182 --rank 1 --auth-type code --enabled Y --auth-code "123456" -o json` | 频道 `7988182` | 成功 | 读回 rank1=code、authCode=123456 |
| 38 | 23:33 | `watch-condition set`（恢复 phone） | `... watch-condition set --channel-id 7988182 --config-file /tmp/gnhf05-watch-condition-restore-*.json -o json` | 频道 `7988182` | 成功 | rank1 恢复 phone；authCode 字段仍回显 123456 但不作为当前 phone 鉴权生效 |
| 39 | 23:33 | `whitelist list`（rank1） | `npx --yes polyv-live-cli@latest whitelist list --channel-id 7988182 --rank 1 -o json` | 频道 `7988182` rank1 | 成功 | contents=1，包含 `13800003601 / VIP-fix-rank1-张三` |

## 11. 实际使用的 CLI 命令与真实参数

### 11.1 历史 rc 命令（问题发现）

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

# 4) 试图把主要条件（rank 1）切成白名单 —— 当时 rc 不持久化（返回 success 但 get 无变化）
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

### 11.2 修复后 latest 复测命令

```bash
# 1) 版本与账号预检
npx --yes polyv-live-cli@latest --version
npx --yes polyv-live-cli@latest account current
npx --yes polyv-live-cli@latest account list

# 2) 创建修复复测频道
npx --yes polyv-live-cli@latest channel create \
  -n "GNHF-电商场景-05-watch-condition-fix-202606232330" \
  --scene alone --template alone -o json

# 3) 观看条件基线与通用设置基线
npx --yes polyv-live-cli@latest channel get -c 7988182 -o json
npx --yes polyv-live-cli@latest watch-condition get --channel-id 7988182 -o json
npx --yes polyv-live-cli@latest watch-condition get -o json

# 4) 录入 rank 1 白名单会员
npx --yes polyv-live-cli@latest whitelist add \
  --channel-id 7988182 --rank 1 \
  --code "13800003601" --name "VIP-fix-rank1-张三" -o json

# 5) 用 config-file 写入 rank1=phone，同时禁用 rank2
cat > watch-condition-fix.json <<'JSON'
{
  "authSettings": [
    {
      "rank": 1,
      "enabled": "Y",
      "authType": "phone",
      "authTips": "请输入会员手机号验证",
      "whiteListEntryText": "会员白名单入口"
    },
    {
      "rank": 2,
      "enabled": "N"
    }
  ]
}
JSON

npx --yes polyv-live-cli@latest watch-condition set \
  --channel-id 7988182 --config-file ./watch-condition-fix.json -o json

# 6) 双读回验证：频道级观看条件已持久化，通用设置未被误写
npx --yes polyv-live-cli@latest watch-condition get --channel-id 7988182 -o json
npx --yes polyv-live-cli@latest channel get -c 7988182 -o json
npx --yes polyv-live-cli@latest watch-condition get -o json

# 7) 简单参数路径也可持久化；验证后再恢复 phone
npx --yes polyv-live-cli@latest watch-condition set \
  --channel-id 7988182 --rank 1 --auth-type code --enabled Y --auth-code "123456" -o json
npx --yes polyv-live-cli@latest watch-condition get --channel-id 7988182 -o json
npx --yes polyv-live-cli@latest watch-condition set \
  --channel-id 7988182 --config-file ./watch-condition-fix.json -o json
npx --yes polyv-live-cli@latest whitelist list --channel-id 7988182 --rank 1 -o json
```

> 参数风格：`watch-condition` 与 `whitelist` 全族用 kebab-case 长参数（`--channel-id`、`--auth-type`、`--old-code`、`--codes`），无短参数；`whitelist` 的 `--rank` 为必填，必须与观看条件级别对应（rank 2=本场景默认白名单模式）。

## 12. 执行或验证结果

- ✅ 历史测试频道 `7983898` 创建成功，watchStatus=unStart，归属 nicksu。
- ✅ 修复复测频道 `7988182` 创建成功，watchStatus=unStart，归属 nicksu。
- ✅ **watch-condition set 修复复测通过**：
  - `polyv-live-cli@latest` 实际版本为 1.2.36，依赖 `polyv-live-api-sdk@1.0.16`。
  - 用 config-file 写入频道 `7988182`：rank1=`phone`、enabled=`Y`、rank2=`enabled=N`，返回成功。
  - `watch-condition get --channel-id 7988182` 与 `channel get -c 7988182` 一致读回 rank1=`phone`、rank2=`N`，证明频道级 `authSettings` 已持久化。
  - 不带 `--channel-id` 的 `watch-condition get` 在写入前后保持一致，证明修复后没有再误写账号通用观看条件。
  - 简单参数路径 `--rank 1 --auth-type code --auth-code "123456"` 也可持久化，随后已恢复 rank1=`phone`。
- ✅ **白名单全生命周期验证通过（历史频道 `7983898` rank 2）**：
  - 新增 3 名 VIP（13800000001 张三黑卡 / 002 李四黑卡 / 003 王五金卡）全部 `白名单添加成功`，`whitelist list --rank 2` 返回 contents=3。
  - 关键词 `--keyword "张三"` 精确命中 1 条（13800000001）。
  - **更新已前后对比验证**：更新前 `whitelist list` 含 `13800000001/VIP-张三-黑卡`；`whitelist update --old-code 001 --code 011` 返回 `白名单更新成功`；更新后 `whitelist list` 显示旧码 001 消失、新条目 `13800000011/VIP-张三-升级金卡` 入库。变更确已生效。
  - **删除已验证**：临时白名单 `13800000099` 创建后 `whitelist remove` 返回 `白名单删除成功`，删除后 `whitelist list` 由 4 条回归 3 条，临时条目消失。
- ✅ **rank 1 白名单可用于当前复测频道**：频道 `7988182` 已在 rank 1 保留 `13800003601 / VIP-fix-rank1-张三`，且 rank 1 当前鉴权类型为 `phone`。

**关键排查发现 / 问题记录**：

1. **【历史问题已修复：`watch-condition set` 静默不持久化】对旧测试频道 `7983898` 的 rank 1 主要条件，旧 rc 的 `watch-condition set` 在所有 `--auth-type` 取值下均返回 `{success:true, channelId:7983898}`，但 `watch-condition get` 与 `channel get` 的 `authSettings` 复查均显示 rank 1 始终停留在初始 `custom`、`authCode=null`、`enabled=Y`，配置未发生任何持久化。
   - 复测矩阵：`--auth-type phone`（不持久化）、`--auth-type none`（不持久化）、`--auth-type code --auth-code "888888"`（不持久化）、`--config-file` JSON 配置 `rank1=phone`（不持久化）；并经 5 秒延迟复查与 `channel get` 交叉验证，排除传播延迟与读路径差异。
   - 根因已定位：SDK 请求把 `channelId` 放入 JSON body，后端没有按目标频道处理；修复后改为 query 参数。旧表现更接近误写账号通用观看条件面，不是频道 `7983898` 或其当前直播模板成功落库。
   - 修复版本：`polyv-live-api-sdk@1.0.16` / `polyv-live-cli@1.2.36`。latest 1.2.36 已在频道 `7988182` 复测通过。
2. **【authCode 长度校验仍存在】`--auth-type code --auth-code "GNHF05vip"`（9 位字母数字）仍会报 `setWatchCondition failed: param length is incorrect: authCode`；改用 `123456` 可成功写入并读回。这是后端参数约束，不是本次持久化修复范围。**
3. **【authCode 字段残留】复测频道曾从 `code` 恢复到 `phone`，API 仍回显 `authCode=123456`。当前生效条件以 `authType=phone` 为准，该残留字段不作为 phone 白名单鉴权生效；若后端需要清理展示残留，需单独跟进。**
4. **【频道默认次要条件即白名单模式】新建活动营销频道（alone/alone）的 rank 2 次要条件默认为 `authType=phone`（白名单观看）、`enabled=Y`、`whiteListEntryText=白名单验证入口`**，无需额外开启即可直接挂白名单成员；rank 1 主要条件默认为 `custom`（账号级自定义授权占位）。
5. **【白名单挂载在条件级别 rank 上】`whitelist` 全族必填 `--rank`，且白名单成员只在对应 rank 的 `authType=phone` 时才对观众生效**。当前推荐使用 latest 1.2.36 将 rank 1 配为 `phone` 后，把会员白名单挂在 rank 1；若沿用 rank 2 默认白名单，则白名单应继续挂 rank 2。
6. **【频道描述未持久化】`channel create` 传入了 `-d` 描述，但 `channel get` 的 `desc` 回填为空**（与场景 01/02/03 一致的已知现象），不属于本场景执行失败。

> ⚠️ 配置侧 vs 观众侧（依规则区分）：本场景「白名单增/改/删生效」「观看条件现状」均为通过 CLI/API 查询到的**配置侧已满足条件**。**未打开观看页、未做观众侧验证**，因此不写「观众侧非白名单被拦截 / 白名单会员可观看」。真实观众侧拦截效果需在直播中由真实观众端访问观看页验证（白名单鉴权需频道处于可观看态）。

## 13. 风险点与回滚/清理方式

| 风险 | 说明 | 回滚/清理 |
|---|---|---|
| 旧版 `watch-condition set` 不持久化 / 误写通用设置 | rc / 1.2.35 返回 success 但频道配置不变，易让运营误以为已收紧观看条件 | 使用 `polyv-live-cli@latest >= 1.2.36`；写入后必须用 `watch-condition get --channel-id` 与 `channel get` 双路径复查 |
| `authCode` 字段残留 | 从 code 恢复到 phone 后仍可能回显旧 `authCode`，容易误读 | 以当前 `authType` 判断生效逻辑；如需清理展示残留，单独跟进后端行为 |
| 白名单录错会员码 | 真实会员因错码被拦在门外 | `whitelist update --old-code <错码> --code <对码>` 改码（本场景已演练） |
| 白名单建错频道/rank | 影响真实直播鉴权 | 确认目标频道 ID 与目标 rank；当前推荐 rank 1=phone 后白名单挂 rank 1，历史频道 `7983898` 的白名单挂 rank 2 |
| 残留测试白名单 | 占用白名单条数 | `whitelist remove --codes <会员码>` 清理（本场景仅删除了临时 099） |
| 直播前误清空白名单 | 全员被拦在门外 | 删除前用 `whitelist list` 核对；避免在直播临近时 `--clear` |

**可选的人工清理命令（未执行，仅备查）**：

```bash
# 删除历史频道保留的测试白名单会员（未执行，白名单按约定保留供查看）
npx --yes polyv-live-cli@rc whitelist remove --channel-id 7983898 --rank 2 --codes "13800000011"
npx --yes polyv-live-cli@rc whitelist remove --channel-id 7983898 --rank 2 --codes "13800000002"
npx --yes polyv-live-cli@rc whitelist remove --channel-id 7983898 --rank 2 --codes "13800000003"
# 或一次清空 rank 2 全部白名单（未执行）
npx --yes polyv-live-cli@rc whitelist remove --channel-id 7983898 --rank 2 --clear
# 删除测试频道（未执行，频道按约定保留）
npx --yes polyv-live-cli@rc channel delete -c 7983898 -f

# 删除修复复测频道的 rank 1 测试白名单（未执行）
npx --yes polyv-live-cli@latest whitelist remove --channel-id 7988182 --rank 1 --codes "13800003601"
# 删除修复复测频道（未执行，频道按约定保留）
npx --yes polyv-live-cli@latest channel delete -c 7988182 -f
```

> 上述清理命令**均未执行**，仅作为人工清理参考。

## 14. 保留资产说明

本轮保留以下资产用于人工查看配置，**未执行任何删除**（仅删除了为演练 `whitelist remove` 而建的临时白名单 `13800000099`）：

| 资产 | ID / 值 | 说明 |
|---|---|---|
| 历史问题发现频道 | `7983898` | `GNHF-电商场景-05-member-exclusive-whitelist-202606222322`，活动营销/纯视频横屏，watchStatus=unStart |
| 历史频道观看条件 rank 1 | `custom` | 主要条件（账号级默认占位）；旧 rc set 写入未持久化，保留初始 custom |
| 历史频道观看条件 rank 2 | `phone`（白名单） | 次要条件，默认白名单模式、enabled=Y；历史白名单生命周期演练挂在此 rank |
| 白名单会员 · 张三 | `13800000011` / `VIP-张三-升级金卡` | 由 001 黑卡升级换码为 011 金卡 |
| 白名单会员 · 李四 | `13800000002` / `VIP-李四-黑卡` | rank 2 |
| 白名单会员 · 王五 | `13800000003` / `VIP-王五-金卡` | rank 2 |
| 修复复测频道 | `7988182` | `GNHF-电商场景-05-watch-condition-fix-202606232330`，watchStatus=unStart |
| 修复复测频道观看条件 rank 1 | `phone`（白名单） | enabled=Y，`authTips=请输入会员手机号验证`，`whiteListEntryText=会员白名单入口` |
| 修复复测频道观看条件 rank 2 | `enabled=N` | 用于避免两级观看条件同时启用同类 phone 鉴权 |
| 修复复测白名单会员 | `13800003601` / `VIP-fix-rank1-张三` | rank 1，配合 rank1=phone 验证当前可用路径 |

> 两个频道、观看条件与测试白名单均已保留，未删除。如需清理，参见上文「可选的人工清理命令」，但该清理命令本轮未执行。

## 15. 可复用模板

运营在真实会员专享直播中复用时，替换占位符即可（`<频道ID>`、`<会员码>`、`<昵称>`、`<旧码>`）：

```bash
# 0) 前置：确认账号、版本与频道观看条件
npx --yes polyv-live-cli@latest --version
npx --yes polyv-live-cli@latest account current
npx --yes polyv-live-cli@latest watch-condition get --channel-id <频道ID> -o json

# 1) 录入 rank 1 VIP 会员（会员码=手机号）
npx --yes polyv-live-cli@latest whitelist add \
  --channel-id <频道ID> --rank 1 --code "<会员码>" --name "<昵称>" -o json

# 2) 将 rank 1 设置为白名单观看，rank 2 禁用
cat > watch-condition-member-only.json <<'JSON'
{
  "authSettings": [
    {
      "rank": 1,
      "enabled": "Y",
      "authType": "phone",
      "authTips": "请输入会员手机号验证",
      "whiteListEntryText": "会员白名单入口"
    },
    {
      "rank": 2,
      "enabled": "N"
    }
  ]
}
JSON

npx --yes polyv-live-cli@latest watch-condition set \
  --channel-id <频道ID> --config-file ./watch-condition-member-only.json -o json

# 3) 频道级双读回验证
npx --yes polyv-live-cli@latest watch-condition get --channel-id <频道ID> -o json
npx --yes polyv-live-cli@latest channel get -c <频道ID> -o json

# 4) 查白名单 / 按关键词找人
npx --yes polyv-live-cli@latest whitelist list --channel-id <频道ID> --rank 1 -o json
npx --yes polyv-live-cli@latest whitelist list --channel-id <频道ID> --rank 1 --keyword "<昵称或码段>" -o json

# 5) 会员升级 / 换码（黑卡→金卡、手机号变更）
npx --yes polyv-live-cli@latest whitelist update \
  --channel-id <频道ID> --rank 1 \
  --old-code "<旧码>" --code "<新码>" --name "<新昵称>" -o json

# 6) 清退失效会员
npx --yes polyv-live-cli@latest whitelist remove \
  --channel-id <频道ID> --rank 1 --codes "<会员码>" -o json

# 7) 直播后一次性清空白名单（如该场为一次性内购会）
npx --yes polyv-live-cli@latest whitelist remove \
  --channel-id <频道ID> --rank 1 --clear -o json
```

> 注意：`watch-condition set` 必须带 `--channel-id <频道ID>` 才是频道级写入；不带频道 ID 查询的是账号通用观看条件。配置后务必用 `watch-condition get --channel-id` 与 `channel get` 双路径复查。若业务选择沿用 rank 2 默认白名单，则上方 `whitelist` 的 `--rank 1` 改为 `--rank 2`，并先确认 rank 2 当前 `authType=phone` 且 `enabled=Y`。

## 16. 后续可扩展方向

- **观看条件边界补测**：继续补 `none`、`info`、`pay`、`custom` 等 authType 的 latest 1.2.36 频道级写入与读回矩阵，确认每类配置所需字段。
- **authCode 残留行为跟踪**：从 `code` 恢复到 `phone` 后 API 仍回显旧 `authCode`，需确认是后端展示残留、兼容字段，还是需要额外清理接口。
- **登记观看（info）/付费观看（pay）**：用 `watch-condition set --config-file` 配 `infoFields`/`price` 做登记留资或付费直播。
- **与邀请榜单/观众标签联动**：把白名单会员与 `invite-sales`（邀请销售）、`viewer`（观众）、`custom-field`（自定义字段）结合，做「白名单会员邀请裂变榜」「VIP 分层标签运营」。
- **全局白名单 vs 频道白名单**：不传 `--channel-id` 即为全局白名单，可探索一批 VIP 跨频道复用的会员专享矩阵。
- **白名单批量导入**：当前 `whitelist add` 为单条，大批量会员可探索 `material`/后台批量导入，或脚本循环 add（注意 API 频控）。
- **观众侧验证**：频道开播后用真实手机号访问观看页，验证「白名单内可看 / 非白名单被拦」的观众侧效果，补全配置侧→观众侧证据链。
