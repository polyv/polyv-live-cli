# 场景 13：开播前频道初始化与推流就绪 — 一键电商场景初始化 + 推流凭证/直播状态就绪检查

> 覆盖一级命令：`setup`、`stream`（本轮新增）
> 业务阶段：开播 / 预热
> 专用测试频道：`7983944`（`channel create` 新建，已保留，未删除）；`setup e-commerce` 另创建频道 `7983945`（已保留，未删除）

---

## 1. 场景名称

**开播前频道初始化与推流就绪**：品牌电商直播开播前，运营/直播中控团队先用 `setup` **一键初始化一个包含频道、观看条件、商品、优惠券、商品/领券开关的完整电商直播频道**，再用 `stream` **取回该频道的 RTMP 推流凭证（配置 OBS / 编码器）并轮询直播状态，确认频道处于可开播的"待推流"就绪态**。这是每一场电商直播开播前最核心的两步基础设施动作：频道从零就绪 + 推流链路接通。

---

## 2. 覆盖命令

| 一级命令 | 覆盖口径 | 说明 |
|---|---|---|
| `setup` | ✅ 已执行成功 | `setup --list`、`setup --list --detailed`、`setup e-commerce --dry-run -o json`（预览）真实执行成功；`setup e-commerce`（**真实写入**）一次性创建全部 7 个资源（频道 `7983945` + 观看条件 + 商品 `998742` + 商品库开关 `enabled=Y` + 优惠券 `4ttd0zp3...` + 优惠券频道绑定 + 领券开关 `enabled=Y`），并经 `channel get`/`product list` 只读复查交叉验证产物落库 |
| `stream` | ✅ 已执行成功 | `stream status`（频道 `7983944`、`7983945` 均返回 `waiting`/`isLive=false`）、`stream get-key`（**未开播 waiting 态即可返回 RTMP URL + 推流密钥**，与 reference/help "must be live" 描述不符，已记录）、`stream live-status list`、`stream streams` 四条只读命令真实执行成功；`stream hls-pull-url`（已执行失败：`forbidden`）、`stream capture`（已执行失败：`channel is not live`）已记录 |

> 共享预检命令 `account`、`channel` 在本场景中真实执行（建测试频道 + 验证），已在场景 01 起计入覆盖。

---

## 3. 专用测试频道

本场景涉及**两个**新建测试频道，均**已保留、未删除**：

| 项 | 频道 A（推流就绪检查落点） | 频道 B（setup 一键初始化产物） |
|---|---|---|
| 频道 ID | `7983944` | `7983945` |
| 频道名称 | `GNHF-电商场景-13-stream-setup-golive-202606230130` | `电商示例频道-1782149500278`（`setup e-commerce` 内置命名） |
| 创建命令 | `npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-13-stream-setup-golive-202606230130" -d "..." --scene alone --template alone -o json` | `npx --yes polyv-live-cli@rc setup e-commerce -o json`（由 setup 自动创建） |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production） | 同左（`createdAccountEmail=nicksu@polyv.net`） |
| scene / template | `alone` / `alone` | `alone` / `alone` |
| 初始状态 | `status=waiting`（`channel create` 返回） | `status=waiting`（`stream status` 复查） |
| 是否删除 | **否**，频道已保留供人工查看配置 | **否**，频道及其商品/优惠券已保留 |

> 说明：本场景按工作流要求先用 `channel create` 建一个**显式命名**的专用测试频道 `7983944` 作为 stream 族命令的落点；随后为真实演练 `setup` 的核心写入能力执行 `setup e-commerce`，该命令会**自带一个频道**（`7983945`，名称由内置场景模板决定，不可自定义），故本场景最终保留两个测试频道。两者均为本轮新建、互不污染既有频道。

---

## 4. 行业背景

电商直播的"开播前 30 分钟"是事故高发窗口：频道没建好、商品没挂上、领券开关没开、推流地址没配进 OBS、编码器没连通……任何一个环节缺失都会导致准点开播失败、流量白白流失。成熟的直播团队会把开播前准备拆成两条独立可验证的流水线：

1. **频道/货品/权益一键初始化**：用一个标准化模板把"频道 + 商品 + 优惠券 + 各类开关"一次性配齐，避免手工逐项配置遗漏。保利威 CLI 的 `setup e-commerce` 正是这种"场景模板化初始化"能力。
2. **推流链路就绪检查**：开播前从频道取回 RTMP 推流地址与推流密钥交由 OBS / 硬件编码器，并轮询频道实时状态，确认频道处于"待推流（waiting）"而非异常态，再准点开播。

本场景把这两条流水线落到 `setup` 与 `stream` 两个一级命令上，形成"初始化 → 取推流凭证 → 状态就绪确认"的开播前闭环。

---

## 5. 业务目标与核心 KPI

- **业务目标**：开播前用 ≤5 分钟完成"频道+货品+券"初始化与"推流凭证+状态"就绪确认，做到开播零配置遗漏、零推流链路故障。
- **核心 KPI**：
  - 开播前就绪检查通过率（频道 `status=waiting` 且 `get-key` 能取回有效 RTMP 凭证）= 100%
  - `setup e-commerce` 一次性资源创建成功率（7 个资源全部 `created`）
  - 开播故障中"配置遗漏/推流未接通"类原因占比下降

---

## 6. 适用角色

| 角色 | 职责 |
|---|---|
| 直播中控 / 导播 | 执行 `setup` 初始化、`stream get-key` 取推流凭证、`stream status` 轮询就绪态 |
| 直播运营 | 确认初始化产物（频道、商品、优惠券、开关）符合本场直播规划 |
| 技术支持 | 排查 `get-key`/`status` 异常、OBS 推流链路问题 |

---

## 7. 前置条件

1. 已配置默认账号（`npx --yes polyv-live-cli@rc account current` 显示 `nicksu` 为默认，来源全局配置）。
2. 账号具备频道创建、商品、优惠券、推流查询权限（本场景测试账号 `nicksu` 为 production 环境，全部满足）。
3. 推流端（OBS / FFmpeg / 硬件编码器）已就绪，可接收 RTMP 地址与推流密钥。
4. `stream get-key` 的 JSON 输出含**完整推流密钥**，属敏感凭证，仅提供给可信推流端，不得进入公开日志（本文档一律使用 table 格式的脱敏输出）。

---

## 8. polyv-live-cli-rc 能力映射

| 业务动作 | 一级命令 | 子命令 | 说明 |
|---|---|---|---|
| 查看可用场景模板 | `setup` | `--list` / `--list --detailed` | 列出内置 `e-commerce` 场景及其资源数、分类、标签 |
| 预览初始化计划 | `setup` | `e-commerce --dry-run` | 不变更资源，预览将创建的 7 个资源 |
| 一键初始化电商频道 | `setup` | `e-commerce` | 真实创建频道+观看条件+商品+商品开关+优惠券+券绑定+领券开关 |
| 取推流凭证（配 OBS） | `stream` | `get-key` | 返回 RTMP URL + 推流密钥（table 脱敏 / json 完整） |
| 查频道实时状态 | `stream` | `status` | 返回 live/waiting/stopped 及性能指标（直播中） |
| 批量查推流监控信息 | `stream` | `streams` | 按 `--channel-ids` 批量返回 `live`/`streamInfo` |
| 历史直播状态 | `stream` | `live-status list` | 按频道批量返回历史 `status`（end/live…） |
| 取监控 HLS 拉流地址 | `stream` | `hls-pull-url` | 本场景已执行失败（`forbidden`，见第 12.2 节） |
| 取实时直播截图 | `stream` | `capture` | 本场景已执行失败（`channel is not live`，见第 12.2 节） |

---

## 9. 实施步骤

1. **账号预检**：`account current` + `account list` 确认默认账号 `nicksu`（production）。
2. **建专用测试频道（stream 族落点）**：`channel create` 建 `7983944`（alone/alone），记录 ID 与状态。
3. **查看 setup 场景面**：`setup --list` → `--list --detailed` → `e-commerce --dry-run -o json`，确认内置 `e-commerce` 场景与 7 个资源计划。
4. **一键初始化电商频道（setup 核心写入）**：`setup e-commerce -o json`，捕获创建的频道 `7983945`、商品 `998742`、优惠券 `4ttd0zp3...` 及各开关状态。
5. **产物只读复查**：`channel get -c 7983945` + `product list -c 7983945` 交叉验证 setup 产物落库。
6. **推流凭证就绪检查**：`stream get-key -c 7983944`（table 脱敏）取回 RTMP 地址与推流密钥，确认未开播即可取回。
7. **直播状态就绪检查**：`stream status` / `stream streams` / `stream live-status list` 轮询频道就绪态（应均为 `waiting`/未直播）。
8. **对 setup 产物频道补做就绪检查**：`stream status -c 7983945` + `stream get-key -c 7983945`（table 脱敏），串联"初始化→推流就绪"闭环。
9. **记录失败的拉流/截图命令**：`hls-pull-url`（forbidden）、`capture`（not live）已执行失败并归因。
10. **保留资产**：两个测试频道及 setup 产物均保留，不删除。

---

## 10. 命令执行台账

> 执行时间：2026-06-23 01:30–01:32（账号环境 `nicksu` / production）。敏感值（推流密钥、pushSecret、pushUrl）一律脱敏。

| # | 时间 | 一级命令.子命令 | 实际执行命令（脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 01:30 | account.current | `account current` | — | ✅ 成功 | 默认账号 `nicksu`，来源全局配置，App ID `h2wazzobbq` |
| 2 | 01:30 | account.list | `account list` | — | ✅ 成功 | `nicksu`（production）/ `testpolyv6` / `lizhikang`(test) 等共 6 个账号 |
| 3 | 01:30 | channel.create | `channel create -n "GNHF-电商场景-13-stream-setup-golive-202606230130" -d "..." --scene alone --template alone -o json` | 7983944 | ✅ 成功 | `channelId=7983944`、`status=waiting`、scene/template=alone/alone |
| 4 | 01:30 | setup.list | `setup --list` | — | ✅ 成功 | 内置场景 `e-commerce`（电商直播场景） |
| 5 | 01:30 | setup.list | `setup --list --detailed` | — | ✅ 成功 | `e-commerce`：Category `business`、Resources `7`、Tags `电商, 直播带货` |
| 6 | 01:30 | setup(e-commerce).dry-run | `setup e-commerce --dry-run -o json` | — | ✅ 成功 | 7 个资源全部 `status=would_create`（channel/watchCondition/product/productEnabled/coupon/couponChannel/couponEnabled），未实际变更 |
| 7 | 01:31 | setup(e-commerce) | `setup e-commerce -o json` | 7983945（新建） | ✅ 成功 | 7 个资源全部 `status=created`：频道 `7983945`（`电商示例频道-1782149500278`）、观看条件（rank1 public/rank2 disabled）、商品 `998742`、商品库开关 `enabled=Y`、优惠券 `4ttd0zp3uoue103f1qanjh0s2adko9bb`、券频道绑定、领券开关 `enabled=Y`；耗时 2218ms |
| 8 | 01:31 | channel.get | `channel get -c 7983945 -o json` | 7983945 | ✅ 成功 | 频道存在，`pushUrl`/`pushSecret` 均脱敏，`streamType=client`，`createdAccountEmail=nicksu@polyv.net`，`createdTime=1782149501000` |
| 9 | 01:31 | product.list | `product list -c 7983945 -o json` | 7983945 | ✅ 成功 | 商品 `998742`「Allowish英国进口香氛沐浴露」，`price=399`/`realPrice=179`/`status=1`（在架），与 setup 创建一一对应 |
| 10 | 01:30 | stream.status | `stream status -c 7983944 -o json` | 7983944 | ✅ 成功 | `status=waiting`、`statusText=Waiting`、`isLive=false`、`lastUpdated=2026-06-22T17:30:24Z` |
| 11 | 01:30 | stream.get-key | `stream get-key -c 7983944`（table 脱敏） | 7983944 | ✅ 成功 | 🟡 Waiting；RTMP URL `rtmp://push-t2.videocc.net/recordf`；推流密钥脱敏 `475b***...c2b2`；deploy/input address=`-`（未开播） |
| 12 | 01:30 | stream.live-status.list | `stream live-status list --channel-ids 7983944 -o json` | 7983944 | ✅ 成功 | `status=end`、`seminarStatus=null`（历史状态 API，语义见第 12.1 节） |
| 13 | 01:30 | stream.streams | `stream streams --channel-ids 7983944 -o json` | 7983944 | ✅ 成功 | `live=false`、`streamInfo=null` |
| 14 | 01:30 | stream.hls-pull-url | `stream hls-pull-url -c 7983944 -o json` | 7983944 | ❌ 失败 | `Error: Failed to getHlsPullUrl: forbidden`（详见 12.2） |
| 15 | 01:30 | stream.capture | `stream capture -c 7983944 -o json` | 7983944 | ❌ 失败 | `Error: Failed to getCaptureImage: channel is not live.`（详见 12.2） |
| 16 | 01:32 | stream.status | `stream status -c 7983945 -o json` | 7983945 | ✅ 成功 | `status=waiting`、`isLive=false`（setup 产物频道同样处于待推流就绪态） |
| 17 | 01:32 | stream.get-key | `stream get-key -c 7983945`（table 脱敏） | 7983945 | ✅ 成功 | 🟡 Waiting；RTMP URL `rtmp://push-t2.videocc.net/recordf`；推流密钥脱敏 `475b***...c330` |

---

## 11. 实际使用的 CLI 命令与真实参数

```bash
# 0. 账号预检
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list

# 1. 建专用测试频道（stream 族落点）
npx --yes polyv-live-cli@rc channel create \
  -n "GNHF-电商场景-13-stream-setup-golive-202606230130" \
  -d "GNHF电商场景13 开播前频道初始化与推流就绪专用测试频道" \
  --scene alone --template alone -o json

# 2. setup 场景面与预览（只读 / 预览，不变更资源）
npx --yes polyv-live-cli@rc setup --list
npx --yes polyv-live-cli@rc setup --list --detailed
npx --yes polyv-live-cli@rc setup e-commerce --dry-run -o json

# 3. setup 一键初始化电商频道（核心写入，会真实创建资源）
npx --yes polyv-live-cli@rc setup e-commerce -o json

# 4. setup 产物只读复查
npx --yes polyv-live-cli@rc channel get -c 7983945 -o json
npx --yes polyv-live-cli@rc product list -c 7983945 -o json

# 5. stream 推流凭证就绪检查（table 脱敏；JSON 输出含完整密钥勿外泄）
npx --yes polyv-live-cli@rc stream get-key -c 7983944
npx --yes polyv-live-cli@rc stream get-key -c 7983945

# 6. stream 直播状态就绪检查（只读）
npx --yes polyv-live-cli@rc stream status -c 7983944 -o json
npx --yes polyv-live-cli@rc stream status -c 7983945 -o json
npx --yes polyv-live-cli@rc stream streams --channel-ids 7983944 -o json
npx --yes polyv-live-cli@rc stream live-status list --channel-ids 7983944 -o json

# 7. 失败命令（已执行失败并记录，勿在生产未确认时复跑）
npx --yes polyv-live-cli@rc stream hls-pull-url -c 7983944 -o json   # forbidden
npx --yes polyv-live-cli@rc stream capture -c 7983944 -o json        # channel is not live
```

---

## 12. 执行或验证结果

### 12.1 setup 一键初始化 — 真实写入并交叉验证（✅ 全部成功）

`setup e-commerce -o json` 一次性创建 7 个资源，全部 `status=created`，耗时 2218ms：

| 资源 id | 类型 | 产物 | 复查方式 |
|---|---|---|---|
| `channel` | channel | 频道 `7983945`（`电商示例频道-1782149500278`） | `channel get -c 7983945` ✅ 命中 |
| `watchCondition` | watchCondition | rank1 `enabled=Y`/`authType=public`，rank2 `enabled=N` | setup 返回内嵌（未单独复查） |
| `product` | product | 商品 `998742` | `product list -c 7983945` ✅ 命中「Allowish英国进口香氛沐浴露」399→179 |
| `productEnabled` | productEnabled | `enabled=Y`（商品库开关开） | setup 返回 `success:true` |
| `coupon` | coupon | `4ttd0zp3uoue103f1qanjh0s2adko9bb` | setup 返回内嵌 |
| `couponChannel` | couponChannel | 优惠券绑定到 `7983945` | setup 返回 `success:true` |
| `couponEnabled` | couponEnabled | `enabled=Y`（领券开关开） | setup 返回 `success:true` |

**重要发现（对比场景 02）**：`setup e-commerce` 把**商品库开关置为 `enabled=Y`**，而场景 02 手动 `channel create` 后 `product enabled` 查得 `enabled=N`（商品库开关默认关）。说明 setup 场景模板显式打开了商品库开关，是一键初始化相对手工配置的优势之一。此外 setup 内置商品使用**有效封面**（商品 `998742` 正常创建，未触发场景 02 的"商品封面图片获取失败"），证明场景模板的预置资源参数齐全可用。

> 配置侧 vs 观众侧：本节全部为**配置侧验证**（CLI/API 查询确认资源已落库、开关已置位）。观众侧（观看页是否能看到商品/领券入口）需实际打开观看页或直播中验证，本文档不声称观众侧可见。

### 12.2 stream 族失败命令记录（❌ 已执行失败，已归因）

| 命令 | 错误原文 | 归因 / 下一步 |
|---|---|---|
| `stream hls-pull-url -c 7983944` | `Error: Failed to getHlsPullUrl: forbidden` | 取频道监控 HLS 拉流地址被服务端 `forbidden` 拒绝，疑似账号级"监控/拉流"权益未开通或该接口仅对已开通监控的频道开放。**下一步**：在保利威后台确认监控/拉流权益后，对已开播频道复跑。 |
| `stream capture -c 7983944` | `Error: Failed to getCaptureImage: channel is not live.` | 取实时直播截图必须频道处于直播中（`live`），未开播频道无画面可截。**属预期失败**，与 reference"Channel must be in live state"一致；**下一步**：频道 `stream start` + OBS 推流后复跑。 |

两条失败命令均**真实执行**（使用真实测试频道 `7983944`），按覆盖口径计入"已执行失败"并保留错误与排查；`stream` 族因 `status`/`get-key`/`live-status list`/`streams` 四条只读命令真实执行成功而计入已覆盖。

### 12.3 问题发现：`stream get-key` 在未开播（waiting）态即可返回推流凭证

reference（`streaming.md`）与 `stream get-key --help` 均声明 *"Channel must be in live streaming state"*。但实测在 `status=waiting`（`channel create` 刚建好、从未开播）的频道 `7983944` 与 setup 产物频道 `7983945` 上，`stream get-key`（table）均**成功返回** RTMP URL（`rtmp://push-t2.videocc.net/recordf`）与推流密钥（脱敏），仅 deploy/input address 显示 `-`（这两个字段要等真正推流后才填充）。

**结论**：`get-key` 的"频道鉴权信息"在频道创建后即可取回，不必等开播；这对开播前把推流凭证预配进 OBS 非常关键——运营可在频道一建好就取凭证，不必先 `stream start`。文档/help 的"must be live"描述应理解为"完整推流链路（含 deploy/input address）需直播态"，而非"取凭证需直播态"。**已据此修正本场景的就绪检查流程**：先 `get-key` 预配凭证，开播后再用 `status`/`streams` 复查 deploy/input 是否填充。

### 12.4 问题发现：`stream status` 与 `stream live-status list` 状态语义不同

同一频道 `7983944`（刚创建、从未开播）：
- `stream status`（实时状态 API）→ `status=waiting`、`isLive=false`
- `stream live-status list`（历史直播状态 API）→ `status=end`

两者**不矛盾但语义不同**：`status` 反映频道**当前实时**推流态（waiting=待推流），`live-status` 反映**历史场次**状态（end=无进行中直播/上一场已结束）。运营做"开播前就绪检查"应**以 `stream status=waiting` 为准**确认频道可推流；`live-status` 用于复盘历史场次是否 live/end，不要据其 `end` 误判频道不可用。

---

## 13. 风险点与回滚/清理方式

| 风险 | 说明 | 回滚 / 清理 |
|---|---|---|
| `setup e-commerce` 一次性创建 7 个资源 | 包含频道、商品、优惠券等真实写入，跑一次即产生计费/资源对象 | **本场景保留全部产物未清理**。可选人工清理（**未执行**）：在保利威后台删除频道 `7983945`、商品 `998742`、优惠券 `4ttd0zp3...`；或 `channel delete`（若 CLI 支持）。**切勿**删除用户长期使用的频道。 |
| `stream get-key -o json` 暴露完整推流密钥 | JSON 输出含完整推流密钥，泄露后他人可推流占用频道 | 本场景一律使用 table 脱敏输出；如需 JSON 仅提供给可信推流端，不入公开日志/文档 |
| `stream start`/`push`/`stop`/`ban-push` 等写入命令 | 会真实改变直播态、占用推流链路 | 本场景**未执行**这些写入命令（聚焦开播前就绪检查）；如需演练须在专用测试频道并确认账号 |
| 两个测试频道长期保留 | 频道 `7983944`、`7983945` 及其商品/券均保留 | 保留供人工查看配置；可选人工清理命令见"保留资产说明" |

---

## 14. 保留资产说明

本场景保留以下本轮新建资产，**均未删除**，供人工查看配置：

| 资产 | ID / 标识 | 来源 | 状态 |
|---|---|---|---|
| 测试频道 A | `7983944`（`GNHF-电商场景-13-stream-setup-golive-202606230130`） | `channel create` | waiting，保留 |
| 测试频道 B | `7983945`（`电商示例频道-1782149500278`） | `setup e-commerce` | waiting，保留 |
| 商品 | `998742`「Allowish英国进口香氛沐浴露」399→179 | `setup e-commerce` | status=1 在架，保留 |
| 优惠券 | `4ttd0zp3uoue103f1qanjh0s2adko9bb` | `setup e-commerce` | 已绑定 `7983945`、领券开关 Y，保留 |
| 商品库开关 / 领券开关 | `7983945` 的 productEnabled=Y / couponEnabled=Y | `setup e-commerce` | 保留 |

**可选人工清理命令（均未执行，仅供后续人工参考）**：
```bash
# 仅在确认要清理时由人工执行；本场景未运行以下任何命令
npx --yes polyv-live-cli@rc channel delete -c 7983944   # 若 CLI 支持
npx --yes polyv-live-cli@rc channel delete -c 7983945   # 若 CLI 支持
# 商品/优惠券请在保利威后台对应模块手动删除
```

---

## 15. 可复用模板

### 15.1 开播前一键初始化 + 推流就绪检查（运营照抄）

```bash
# A. 账号预检
npx --yes polyv-live-cli@rc account current

# B. （可选）预览电商场景将创建的资源
npx --yes polyv-live-cli@rc setup e-commerce --dry-run -o json

# C. 一键初始化电商频道（捕获返回的 channelId / productId / couponId）
CHANNEL_ID=$(npx --yes polyv-live-cli@rc setup e-commerce -o json | <解析 channel.channelId>)
echo "初始化频道: $CHANNEL_ID"

# D. 取推流凭证（table 脱敏）交由 OBS
npx --yes polyv-live-cli@rc stream get-key -c "$CHANNEL_ID"

# E. 开播前就绪确认（status 应为 waiting，isLive=false）
npx --yes polyv-live-cli@rc stream status -c "$CHANNEL_ID" -o json

# F. 准点开播后复查推流链路（deploy/input address 应已填充）
npx --yes polyv-live-cli@rc stream streams --channel-ids "$CHANNEL_ID" -o json
```

### 15.2 setup 场景面速查

| 命令 | 用途 | 是否写入 |
|---|---|---|
| `setup --list` | 列出内置场景 | 否 |
| `setup --list --detailed` | 场景资源数/分类/标签 | 否 |
| `setup e-commerce --dry-run` | 预览 7 个资源创建计划 | 否 |
| `setup e-commerce` | 一键创建频道+观看条件+商品+商品开关+优惠券+券绑定+领券开关 | **是** |

---

## 16. 后续可扩展方向

- **自定义场景模板**：在 `~/.polyv/scenes/` 放置自定义场景配置（如"秒杀专场"=频道+秒杀价商品+限量券+倒计时装修），用 `setup <自定义场景名>` 一键初始化，复用本场景验证的 setup 写入路径。
- **推流链路深度演练**：在专用测试频道 `stream start` + OBS/FFmpeg 推流后，复跑 `stream status`（应转 `live` 并填充 fps/bandwidth）、`stream capture`（取实时截图）、`stream verify`（质量评分）、`stream monitor`（实时面板），覆盖 stream 族的直播中命令。
- **`stream push` 本地文件推流**：用 `stream push -c <频道> -f video.mp4 --verify` 做无人值守伪直播排播，配合 `stream disk-video` 管理盘播视频，覆盖电商"录播带货"场景。
- **与播放器/观看页联动**：setup 初始化后接场景 09 的 `web`/`player` 品牌化装修，形成"初始化→装修→推流"完整开播流水线。
- **拉流权益开通后补覆盖 `hls-pull-url`**：待账号开通监控/拉流权益后，对已开播频道复跑 `stream hls-pull-url` 补齐本场景记录的失败命令。
