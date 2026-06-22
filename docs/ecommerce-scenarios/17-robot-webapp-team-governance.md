# 场景 17：直播运营团队协同治理 — 智能挂机机器人配置 + WebApp 角色权限矩阵

> 业务阶段：**治理 / 预热 / 开播**
> 覆盖一级命令：`robot`（#28，账号级全局机器人）、`webapp`（#39，账号级 WebApp 角色与权限）
> 专用测试频道：**7983959**（`channel create` 新建，`topclass/ppt`，watchStatus=unStart，**保留未删除**）

---

## 1. 场景名称

直播运营团队协同治理 — 智能挂机机器人配置 + WebApp 角色权限矩阵。

把两个账号级治理能力组合成一个「团队级运营中台」闭环：

- 用 `robot`（全局虚拟昵称机器人库）+ `chat robot`（频道级挂机机器人设置）配置直播间的「氛围机器人」，让冷启动频道看起来有基础在线人气；
- 用 `webapp`（WebApp 角色与权限）给运营团队的不同岗位（运营员 / 主管）划分后台操作权限矩阵。

## 2. 覆盖命令

| 一级命令 | 覆盖口径 | 说明 |
|---|---|---|
| `robot`（#28） | ✅ 已执行成功（`list` 只读成功）+ ❌ 已执行失败（`batch-save`） | `robot list` 返回账号级 7 个全局机器人基线；`robot batch-save` 真实执行但报后端反序列化错误（CLI 缺陷，详见第 12.1 节）；`batch-delete` 因无可用测试机器人（batch-save 失败）未执行 |
| `webapp`（#39） | ✅ 已执行成功（`create`/`get`/`update` + `permission-list`/`role list`）+ ❌ 已执行失败（`delete`） | `role create` 真实建角色并经 `role list`/`role get` 双重验证持久化（含权限授予 owned 标记）；`role update` 改名+加权限经 `role get` 前后对比验证；`role delete` 真实执行但报「签名错误」（CLI 缺陷，详见第 12.2 节） |
| `chat robot`（频道级，支撑性执行） | ✅ 已执行成功（`setting-get`/`setting-update`/`stats`） | 在专用测试频道 7983959 上演示频道级挂机机器人配置（robotNumber 0→5），经 `setting-get` 前后对比 + `stats` 交叉验证。属 `chat`（#5，场景 12 已覆盖）族下的新子命令，不计入 40 命令覆盖统计 |

## 3. 专用测试频道

| 项目 | 值 |
|---|---|
| 频道 ID | **7983959** |
| 频道名称 | `GNHF-电商场景-17-robot-webapp-team-gov-202606231100` |
| 创建命令 | `npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-17-robot-webapp-team-gov-202606231100" -o json` |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production） |
| scene / template | `topclass` / `ppt` |
| watchStatus | `unStart`（未开始） |
| 创建结果 | ✅ 成功，`channelId=7983959`，`channel get` 复核命中 |
| 删除状态 | **频道已保留，未执行删除**（`chat robot` 设置保留 `robotNumber=5` 演示态） |

> 说明：`robot` 与 `webapp` 两族均为**账号级**命令（写入对本账号 `nicksu` 所有频道/所有后台用户可见，非频道级资产）。专用测试频道 7983959 在本场景承担 `chat robot` 频道级挂机机器人配置的频道侧落点，与场景 08（viewer/custom-field）、11（invite-sales）、14（material）、15（global）、16（finance/group）同为「账号级命令 + 频道侧落点」结构。

## 4. 行业背景

电商直播团队的常见痛点：

1. **冷启动频道没人气**：新品首发、私域召回等场次的开播前 5 分钟往往在线人数极低，真实观众看到「在线 0 人」会迅速流失。行业普遍用「挂机机器人/氛围机器人」给频道垫一个基础在线数（如 5~20），让进来的观众感觉「有人正在看」，提升停留时长。
2. **后台权限乱**：直播运营团队通常分运营员（只能看数据、发公告）、主管（能建频道、改配置）、管理员（全权限）。如果所有人共用一个管理员账号，既不安全也难审计。PolyV WebApp 提供「角色 + 权限码」矩阵，可按岗位分发子账号权限。

本场景把这两件事用 CLI 串起来：先用 `chat robot` 给测试频道配 5 个挂机机器人垫人气，再用 `webapp role` 演练「运营员→主管」的角色与权限生命周期。

## 5. 业务目标与核心 KPI

| 目标 | KPI / 验证点 |
|---|---|
| 冷启动频道垫基础在线人气 | `chat robot stats` 的 `robotCount`/`displayCount` 由 0 提升到目标值（本轮 5） |
| 后台按岗位分发权限 | `webapp role` 创建带指定权限码的角色，`role get` 的 `permissions[].owned=true` 命中授予的权限 |
| 角色可随岗位调整 | `role update` 增减权限后，`role get` 的 owned 列表同步变化（本轮 2→3 个权限） |
| 角色可回收 | `role delete` 清理测试角色（本轮因 CLI 签名缺陷未成功，已记录并保留资产） |

## 6. 适用角色

- **直播运营负责人**：用 `webapp` 规划角色权限矩阵，给团队分发子账号。
- **直播间场控 / 运营专员**：用 `chat robot` 给频道配置挂机机器人垫人气。
- **账号管理员**：用 `robot` 维护账号级全局虚拟昵称机器人库（供频道挂机机器人调用）。

## 7. 前置条件

1. 已配置 PolyV 账号并设为默认（`account current` 命中 `nicksu`）。
2. 已建专用测试频道（本轮 7983959）。
3. **`robot batch-save` 当前为 CLI 缺陷态**（详见 12.1），无法经 CLI 新增全局机器人；本账号已有 7 个历史全局机器人可供 `list` 盘点与 `chat robot` 调用。
4. **`webapp role delete` 当前为 CLI 缺陷态**（详见 12.2），测试角色建出后无法经 CLI 删除，需后台人工清理。

## 8. polyv-live-cli-rc 能力映射

| 业务动作 | 一级命令 / 子命令 | 真实 help 参数 |
|---|---|---|
| 盘点账号级全局机器人库 | `robot list` | `--page-number`、`--page-size`、`-o` |
| （缺陷）批量新增全局机器人 | `robot batch-save` | `--robots <json数组>`、`-f`、`-o` |
| （缺陷）批量删除全局机器人 | `robot batch-delete` | `--ids <逗号分隔>`、`-f`、`-o` |
| 查频道挂机机器人配置 | `chat robot setting-get` | `-c/--channel-id`、`-o` |
| 配置频道挂机机器人 | `chat robot setting-update` | `-c`、`--robot-number`、`--add-robot-model <timely\|fixed_time>`、`--change-time`、`--virtual-booking-number`、`-f`、`-o` |
| 查频道机器人统计 | `chat robot stats` | `-c`、`-o` |
| 列出 WebApp 全量权限码 | `webapp permission-list` | `-o` |
| 列出 WebApp 角色 | `webapp role list` | `--page-number`、`--page-size`、`-o` |
| 查角色详情（含权限 owned 标记） | `webapp role get` | `--role-id`、`-o` |
| 新建角色 | `webapp role create` | `--name`、`--desc`、`--role-type <root\|child>`、`--permission-ids <逗号分隔>`、`-f`、`-o` |
| 更新角色 | `webapp role update` | `--role-id`、`--name`、`--desc`、`--role-type`、`--permission-ids`、`-f`、`-o` |
| （缺陷）删除角色 | `webapp role delete` | `--role-id`、`-f`、`-o` |

## 9. 实施步骤

1. **账号预检**：`account current` / `account list` 确认当前账号与可用账号。
2. **建专用测试频道**：`channel create -n "GNHF-..."`，记录频道 ID 并 `channel get` 复核。
3. **盘点全局机器人库**：`robot list` 看账号级已有多少虚拟昵称机器人（供频道挂机调用）。
4. **（探索）尝试批量新增机器人**：`robot batch-save --robots '[...]'`，记录 CLI 缺陷。
5. **配置频道挂机机器人**：`chat robot setting-update` 给测试频道配 robotNumber=5，`setting-get` 前后对比、`stats` 交叉验证。
6. **盘点 WebApp 权限码**：`webapp permission-list` 找到要授予的权限 id（如「概览页-数据」374、「概览页-菜单」375、「新建直播」103）。
7. **建运营员角色**：`webapp role create` 建带 374/375 权限的角色，`role list`/`role get` 验证。
8. **升级角色为主管**：`webapp role update` 改名 + 加 103 权限，`role get` 前后对比。
9. **（探索）尝试删除角色**：`webapp role delete`，记录 CLI 签名缺陷；测试角色作为保留资产留存。

## 10. 命令执行台账

> 执行时间均为 2026-06-23；账号 `nicksu`；敏感值（AppSecret 等）已脱敏。

| # | 时间 | 一级命令 / 子命令 | 实际执行命令（脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 2026-06-23 | `account current` | `account current` | — | ✅ 成功 | 来源=全局配置；默认账号 `nicksu`（App ID `h2wazzobbq`） |
| 2 | 2026-06-23 | `account list` | `account list` | — | ✅ 成功 | 6 个账号（nicksu/testpolyv6/lizhikang/test-account/production-account/bd） |
| 3 | 2026-06-23 | `channel create` | `channel create -n "GNHF-电商场景-17-robot-webapp-team-gov-202606231100" -o json` | → 7983959 | ✅ 成功 | `channelId=7983959`，scene=topclass/template=ppt，status=waiting |
| 4 | 2026-06-23 | `channel get` | `channel get -c 7983959 -o json` | 7983959 | ✅ 成功 | 命中，watchStatus=unStart，channelPasswd 已脱敏 |
| 5 | 2026-06-23 | `robot list` | `robot list -o json` | 账号级 | ✅ 成功 | `totalItems=7`，id 1020223~1020229（测试机器人1/2/3、自定义名称机器人等），avatar 均为 videocc.net 默认图 |
| 6 | 2026-06-23 | `robot batch-save` | `robot batch-save --robots '[{"name":"GNHF-探针机器人"}]' -f -o json` | 账号级 | ❌ 失败 | `JSON parse error: Cannot deserialize instance of ArrayList<GlobalRobotSaveBatchReq> out of START_OBJECT token`（详见 12.1） |
| 7 | 2026-06-23 | `robot batch-save` | `robot batch-save --robots '[{"name":"GNHF-客服机器人A","avatar":"https://liveimages.videocc.net/.../viewer.png"}]' -f -o json` | 账号级 | ❌ 失败 | 同上 ArrayList/START_OBJECT 反序列化错误（带 avatar 亦然） |
| 8 | 2026-06-23 | `robot batch-save` | `robot batch-save --robots '[{"name":"GNHF-R1"},{"name":"GNHF-R2"}]' -f -o json` | 账号级 | ❌ 失败 | 同上（多元素亦然），确认与元素数量/字段无关 |
| 9 | 2026-06-23 | `chat robot stats` | `chat robot stats -c 7983959 -o json` | 7983959 | ✅ 成功 | 基线：realViewerCount=0/robotCount=0/displayCount=0/pv=0 |
| 10 | 2026-06-23 | `chat robot setting-get` | `chat robot setting-get -c 7983959 -o json` | 7983959 | ✅ 成功 | 基线：robotNumber=0、addRobotModel=timely、virtualBookingNumber=0、changeTime=0、leftTime=0 |
| 11 | 2026-06-23 | `chat robot setting-update` | `chat robot setting-update -c 7983959 --robot-number 5 --add-robot-model timely --virtual-booking-number 20 -f -o json` | 7983959 | ✅ 成功 | `{success:true}` |
| 12 | 2026-06-23 | `chat robot setting-get`（复查） | `chat robot setting-get -c 7983959 -o json` | 7983959 | ✅ 成功 | **持久化**：robotNumber=0→5、virtualBookingNumber=0→20、leftTime=0→17828 |
| 13 | 2026-06-23 | `chat robot stats`（复查） | `chat robot stats -c 7983959 -o json` | 7983959 | ✅ 成功 | **交叉验证**：robotCount=0→5、displayCount=0→5、pv=0→5（realViewerCount 仍 0） |
| 14 | 2026-06-23 | `webapp permission-list` | `webapp permission-list -o json` | 账号级 | ✅ 成功 | 返回权限树（type=LIVE_V2，如 id 102「直播权限」、103「新建直播」、374「概览页-数据」live-overview-data、375「概览页-菜单」live-overview-menu 等，含 depth/parentId/lft/rgt） |
| 15 | 2026-06-23 | `webapp role list` | `webapp role list -o json` | 账号级 | ✅ 成功 | 基线 `totalItems=3`：id 4537「test」、2「直播频道管理员」、1「管理员」（均 type=root） |
| 16 | 2026-06-23 | `webapp role create` | `webapp role create --name "GNHF直播运营员" --desc "GNHF场景17测试-直播运营与数据查看" --role-type child --permission-ids 374,375 -f -o json` | → 角色 4687 | ✅ 成功 | `{success:true}`（不回显 id） |
| 17 | 2026-06-23 | `webapp role list`（复查） | `webapp role list -o json` | 账号级 | ✅ 成功 | **持久化**：totalItems 3→4，新增 id 4687「GNHF直播运营员」type=child |
| 18 | 2026-06-23 | `webapp role get` | `webapp role get --role-id 4687 -o json` | 4687 | ✅ 成功 | 返回 role + 全量权限树；owned=true 命中 374、375（即 create 的 permission-ids 已落库） |
| 19 | 2026-06-23 | `webapp role update` | `webapp role update --role-id 4687 --name "GNHF直播运营员-主管" --desc "升级为主管岗-增加数据复盘权限" --role-type child --permission-ids 374,375,103 -f -o json` | 4687 | ✅ 成功 | `{success:true, roleId:4687}` |
| 20 | 2026-06-23 | `webapp role get`（复查） | `webapp role get --role-id 4687 -o json` | 4687 | ✅ 成功 | **持久化**：name「GNHF直播运营员」→「GNHF直播运营员-主管」、desc 变更、owned 2→3（新增 103「新建直播」） |
| 21 | 2026-06-23 | `webapp role delete` | `webapp role delete --role-id 4687 -f -o json` | 4687 | ❌ 失败 | `Unexpected error: 签名错误`（连试 3 次同报错，详见 12.2） |
| 22 | 2026-06-23 | `webapp role list`（收尾） | `webapp role list -o json` | 账号级 | ✅ 成功 | totalItems 仍 4，id 4687 仍在（delete 未生效） |

## 11. 实际使用的 CLI 命令与真实参数

```bash
# 0) 账号预检
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list

# 1) 建专用测试频道
npx --yes polyv-live-cli@rc channel create \
  -n "GNHF-电商场景-17-robot-webapp-team-gov-202606231100" -o json
# => channelId 7983959

# 2) 盘点账号级全局机器人库
npx --yes polyv-live-cli@rc robot list -o json

# 3) 给测试频道配置挂机机器人（垫人气）
npx --yes polyv-live-cli@rc chat robot setting-get -c 7983959 -o json   # 变更前
npx --yes polyv-live-cli@rc chat robot setting-update -c 7983959 \
  --robot-number 5 --add-robot-model timely --virtual-booking-number 20 -f -o json
npx --yes polyv-live-cli@rc chat robot setting-get -c 7983959 -o json   # 变更后：robotNumber=5
npx --yes polyv-live-cli@rc chat robot stats -c 7983959 -o json         # robotCount=5/displayCount=5

# 4) WebApp 权限矩阵
npx --yes polyv-live-cli@rc webapp permission-list -o json              # 找权限 id（374/375/103）
npx --yes polyv-live-cli@rc webapp role list -o json                    # 基线 3 角色

# 5) 建运营员角色（授予 374 概览页-数据、375 概览页-菜单）
npx --yes polyv-live-cli@rc webapp role create \
  --name "GNHF直播运营员" --desc "GNHF场景17测试-直播运营与数据查看" \
  --role-type child --permission-ids 374,375 -f -o json
# => success:true（不回显 id，用 role list 复查得 4687）
npx --yes polyv-live-cli@rc webapp role get --role-id 4687 -o json      # owned: 374,375

# 6) 升级为主管（追加 103 新建直播）
npx --yes polyv-live-cli@rc webapp role update \
  --role-id 4687 --name "GNHF直播运营员-主管" \
  --desc "升级为主管岗-增加数据复盘权限" \
  --role-type child --permission-ids 374,375,103 -f -o json
npx --yes polyv-live-cli@rc webapp role get --role-id 4687 -o json      # owned: 103,374,375

# 7) （缺陷）尝试删除角色 —— 报「签名错误」，角色保留
npx --yes polyv-live-cli@rc webapp role delete --role-id 4687 -f -o json
```

## 12. 执行或验证结果

### 12.1 问题记录：`robot batch-save` 后端反序列化失败（CLI/SDK 缺陷）

- **现象**：`robot batch-save --robots '[{"name":"GNHF-探针机器人"}]' -f` 报：
  ```
  Unexpected error: JSON parse error: Cannot deserialize instance of
  `java.util.ArrayList<net.polyv.modules.channel.api.req.GlobalRobotSaveBatchReq>`
  out of START_OBJECT token
  ```
- **复现**：3 种入参形态（单元素仅 name / 单元素带 avatar / 双元素）全部同报错，与元素数量、是否带 avatar 无关。
- **根因（源码核对）**：SDK `V4RobotService.batchSaveRobots` 直接把 `params`（即 `{robots: [...]}` 对象）作为 POST body 发往 `/live/v4/global/robot/save-batch`（`packages/sdk/src/services/v4/robot.service.ts` L125-128）；而后端该接口期望 body 是**裸 JSON 数组** `[...]`（错误信息明确要 `ArrayList<...>`，却收到 `START_OBJECT` `{`）。即 SDK 多包了一层 `{robots: ...}` 外壳，与后端契约不符。
- **结论**：当前 rc 版本 `robot batch-save` 在任意合法入参下都不可用，属 CLI/SDK 缺陷，非参数误用。**本账号已有 7 个历史全局机器人**（id 1020223~1020229，疑为后台或历史版本创建），可供 `robot list` 盘点与 `chat robot` 调用，故 `robot` 族仍可经只读 `list` 覆盖。
- **下一步建议**：等 CLI 修复（把 body 改为裸数组，或后端兼容 `{robots:[]}`）；修复前需新增全局机器人请在保利威后台手动添加。

### 12.2 问题记录：`webapp role delete` 签名错误（CLI/SDK 缺陷）

- **现象**：`webapp role delete --role-id 4687 -f` 报 `Unexpected error: 签名错误`，连试 3 次（含去掉 `-o json`）全部同报错。
- **根因（源码核对）**：SDK `V4WebApp.deleteRole` 用 `POST /live/v4/user/webapp-role/delete?id=${roleId}`，roleId 仅出现在 **query string**、body 为空（`packages/sdk/src/services/v4/webapp.service.ts` L232-241，源码注释亦写明 "Uses POST method with query parameter, not DELETE method"）。对照同族 `create`/`update`（POST 带 body，均成功），PolyV MD5 签名大概率只覆盖了 body 参数、未把 query-only 的 `id` 计入签名，导致服务端按完整请求校验时签名不匹配。
- **结论**：`webapp role delete` 在当前 rc 版本不可用，属 CLI/SDK 签名实现缺陷。测试角色 4687 建出后无法经 CLI 删除。
- **下一步建议**：等 CLI 修复（让签名覆盖 query 参数，或改用 body 传 id）；修复前删除角色请走保利威后台「角色管理」页面。

### 12.3 已验证持久化前后对比

| 对象 | 字段 | 变更前 | 变更后 | 验证命令 |
|---|---|---|---|---|
| 频道 7983959 挂机机器人 | robotNumber | 0 | 5 | `chat robot setting-get` 前后对比 |
| 频道 7983959 挂机机器人 | virtualBookingNumber | 0 | 20 | `chat robot setting-get` 前后对比 |
| 频道 7983959 机器人统计 | robotCount | 0 | 5 | `chat robot stats` 交叉验证 |
| 频道 7983959 机器人统计 | displayCount | 0 | 5 | `chat robot stats` 交叉验证 |
| 角色 4687 | name | GNHF直播运营员 | GNHF直播运营员-主管 | `webapp role get` 前后对比 |
| 角色 4687 | desc | GNHF场景17测试-直播运营与数据查看 | 升级为主管岗-增加数据复盘权限 | `webapp role get` 前后对比 |
| 角色 4687 权限 | owned 数 | 2（374,375） | 3（103,374,375） | `webapp role get` 的 `permissions[].owned` 前后对比 |

### 12.4 配置侧 vs 观众侧区分

- **配置侧已满足条件**：
  - `chat robot setting-get` 复核 robotNumber=5、`chat robot stats` 复核 robotCount=5/displayCount=5 —— 证明频道已配置 5 个挂机机器人，**配置侧已生效**。
  - `webapp role get` 复核 owned 权限标记 —— 证明角色与权限授予**配置侧已落库**。
- **观众侧可见性**：本轮**未打开观看页**验证。`chat robot stats` 的 `displayCount=5` 强烈暗示观看页会显示 5 个在线人数（因 displayCount=robotCount、realViewerCount=0），但严格按口径，这只是统计接口的配置侧读数，**观众侧实际显示需开播后打开观看页复核**，本轮不声称「观众侧已可见」。`webapp` 角色权限的观众侧效果体现为子账号登录后台后能/不能看到对应菜单，本轮亦未用子账号登录验证，仅配置侧确认。

## 13. 风险点与回滚/清理方式

| 风险 | 说明 | 回滚/清理 |
|---|---|---|
| `robot batch-save` 不可用 | CLI 缺陷，任意入参报反序列化错；误以为参数问题反复重试无意义 | 不再尝试；新增机器人走后台 |
| `webapp role delete` 不可用 | CLI 签名缺陷，建出的测试角色无法 CLI 删除 | **后台人工清理**：保利威后台「角色管理」删除角色 4687（CLI 清理未执行） |
| `webapp role update` 隐式必填 `--role-type` | help 未标 required，但缺省报 `required option '--role-type <type>' not specified` | update 时务必带 `--role-type root\|child` |
| 账号级写入爆炸半径 | `robot`/`webapp` 均为账号级，写入影响本账号所有频道/所有后台用户 | 本轮所有账号级写入均为本轮新建的测试对象（角色 4687），未触碰既有 3 个角色（4537/2/1）与 7 个全局机器人 |
| 挂机机器人「刷量」合规风险 | 用机器人垫在线人数属行业灰色操作，过度使用可能违反平台规则或误导真实观众 | 仅用于冷启动过渡，控制 robotNumber 在合理区间（本轮 5），开播后真实观众上来应及时调低或关闭 |

### 可选人工清理命令（**均未执行**，仅备查）

```bash
# CLI 删除角色（当前会失败，仅供修复后参考）
npx --yes polyv-live-cli@rc webapp role delete --role-id 4687 -f
# 把测试频道挂机机器人恢复为 0（可选）
npx --yes polyv-live-cli@rc chat robot setting-update -c 7983959 --robot-number 0 --add-robot-model timely -f
# 删除测试频道（本轮不执行，频道保留）
npx --yes polyv-live-cli@rc channel delete -c 7983959 -f
```

## 14. 保留资产说明

| 资产 | 类型 | ID / 值 | 状态 | 清理方式 |
|---|---|---|---|---|
| 测试频道 | 频道级 | **7983959** | 保留未删除 | `channel delete -c 7983959`（未执行） |
| 频道挂机机器人设置 | 频道级配置 | robotNumber=5、virtualBookingNumber=20 | 保留（演示态） | `chat robot setting-update --robot-number 0`（未执行） |
| WebApp 测试角色 | 账号级 | **4687**「GNHF直播运营员-主管」（type=child，权限 103/374/375） | 保留（CLI delete 缺陷无法清理） | 保利威后台「角色管理」删除（未执行） |

> 本轮未触碰既有资产：账号级 3 个既有角色（4537「test」、2「直播频道管理员」、1「管理员」）、7 个既有全局机器人（1020223~1020229）均未修改/删除。

## 15. 可复用模板

### 15.1 冷启动频道垫人气（挂机机器人）

```bash
CHAN=<频道ID>
# 变更前基线
npx --yes polyv-live-cli@rc chat robot setting-get -c "$CHAN" -o json
npx --yes polyv-live-cli@rc chat robot stats        -c "$CHAN" -o json
# 配置：5 个机器人，按需进入即增（timely），虚拟预约 20
npx --yes polyv-live-cli@rc chat robot setting-update -c "$CHAN" \
  --robot-number 5 --add-robot-model timely --virtual-booking-number 20 -f -o json
# 复核
npx --yes polyv-live-cli@rc chat robot setting-get -c "$CHAN" -o json
npx --yes polyv-live-cli@rc chat robot stats        -c "$CHAN" -o json
```

### 15.2 按岗位建 WebApp 角色（权限矩阵）

```bash
# 1) 先查可用权限码与 id
npx --yes polyv-live-cli@rc webapp permission-list -o json | grep -E '"id"|"name"|"code"'
# 2) 建角色（permission-ids 用上一步查到的 id，逗号分隔）
npx --yes polyv-live-cli@rc webapp role create \
  --name "<角色名≤无硬限制但建议简短>" --desc "<职责说明>" \
  --role-type child --permission-ids <id1>,<id2> -f -o json
# 3) 用 role list 拿到新角色 id，再 role get 复核 owned 权限
npx --yes polyv-live-cli@rc webapp role list -o json
npx --yes polyv-live-cli@rc webapp role get --role-id <角色ID> -o json
# 4) 升级角色（务必带 --role-type）
npx --yes polyv-live-cli@rc webapp role update \
  --role-id <角色ID> --name "<新名>" --desc "<新职责>" \
  --role-type child --permission-ids <id1>,<id2>,<id3> -f -o json
```

> ⚠️ 注意：`webapp role delete` / `robot batch-save` / `robot batch-delete` 当前为 CLI 缺陷态（详见 12.1、12.2），模板中不要依赖它们做回收，回收走保利威后台。

## 16. 后续可扩展方向

1. **`robot` 缺陷修复后**：补 `batch-save`（批量建电商客服虚拟昵称，如「官方小助手」「售后小管家」）+ `batch-delete` 的完整生命周期，并探索全局机器人与频道 `chat robot` 的调用关系（频道挂机机器人是否从全局库随机分配昵称）。
2. **`webapp role delete` 缺陷修复后**：补角色的完整 create→update→delete 回收闭环，并演练 `role-type root`（根角色，可管理子角色）的层级授权。
3. **子账号绑定角色**：探索把建好的角色绑定到具体子账号（.viewer/invite-sales 同为账号级用户体系），验证「子账号登录后台后菜单可见性」的观众侧效果（本轮仅配置侧）。
4. **挂机机器人观众侧验证**：开播后用观看页截图复核 `displayCount` 是否真的体现为观看页在线人数，闭合 12.4 的观众侧验证缺口。
5. **与场景 12（chat）联动**：`chat robot` 属 `chat` 族的频道级子命令（场景 12 未覆盖），本场景已补 `setting-get`/`setting-update`/`stats`，未来可继续探索 `chat robot list-update`（自定义机器人列表）与 `chat robot pause`（暂停机器人增长）。
