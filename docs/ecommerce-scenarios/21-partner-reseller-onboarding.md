# 电商场景 21：合作伙伴/转售商代客开户与腾讯云政企订单开通

> 一级命令覆盖：`partner`（#19）
> 覆盖口径：两条子命令均**真实执行**（命中真实 PolyV 合作伙伴 API），全部**已执行失败**——根因是 CLI/SDK 把 `--mobile` 序列化为 JSON 字符串而后端期望数字、`--uin` 未映射到后端 `UIN` 字段（与场景 03/09/17/19 同源的 CLI 选项 → 后端字段映射/类型缺陷家族）。partner 族**无任何只读命令**，本场景通过真实执行两条写入子命令并记录失败结果完成覆盖。

---

## 1. 场景名称

**合作伙伴/转售商代客开户与腾讯云政企订单开通**

保利威的「合作伙伴/转售商（partner）」体系：转售商账号可以在保利威平台上**代客注册新的直播客户账号**（`partner user-register`），并为走腾讯云政企/企业采购通道的客户**创建腾讯云政企订单**（`partner tencent-order create`）。这是面向 ISV、渠道代理商、腾讯云生态集成商的「渠道分销/代客开户」业务闭环，与面向终端直播运营的频道级能力不同——它操作的是**账号体系与云订单**，是直播业务的「上游获客」环节。

---

## 2. 覆盖命令

| 一级命令 | 子命令 | 真实执行 | 结果 |
|---|---|---|---|
| `partner`（#19） | `partner user-register` | ✅ 真实执行 | ❌ 已执行失败（CLI/SDK `--mobile` 类型序列化缺陷：字符串序列化为 JSON 字符串、后端期望数字 → `mobile must be a number`，与 mobile 取值无关） |
| `partner`（#19） | `partner tencent-order create` | ✅ 真实执行 | ❌ 已执行失败（CLI/SDK `--uin → UIN` 字段映射缺陷 → `UIN is required`，与 uin 取值无关；另该子命令 `--mobile` 必填、`--basic-service`/`--premium-service` 至少一项必填） |

> 说明：`partner` 是本次场景覆盖的第 **40 个**也是最后一个一级命令。该族**没有只读命令**（仅 `user-register` 与 `tencent-order create` 两条写入子命令），因此无法套用「单条只读命令成功即计入覆盖」的先例（如场景 06/07/10/11/12/13/14/15/16/17/18/19/20）。本场景通过**真实执行两条写入子命令**（命中真实 PolyV 合作伙伴 API），并完整记录其 CLI/SDK 缺陷导致的失败，按「已执行失败」口径计入覆盖——与场景 16 `group` 整族「已执行失败」计入覆盖（集团账号门控）、场景 20 `transmit create/associate`「已执行失败」计入覆盖（转播权益门控）的先例一致。

---

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道 ID | **7983964** |
| 频道名称 | `GNHF-电商场景-21-partner-reseller-onboarding-202606230400` |
| 创建命令 | `npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-21-partner-reseller-onboarding-202606230400" -o json` |
| scene / template | topclass / ppt |
| watchStatus | unStart（未开播） |
| 账号环境 | nicksu（App ID `h2wazzobbq`，User ID `475b6884a7`，production） |
| 创建结果 | 成功（`Channel created successfully`，channelId 7983964） |
| 删除状态 | **频道已保留，未执行删除**（partner 族为账号级/外部账号写入，与本频道无关联；频道仅作为本轮专用测试对象与审计落点保留，供人工查看） |

> 注：`partner user-register` 与 `partner tencent-order create` 都是**账号级/跨账号写入**（注册外部客户账号、创建腾讯云订单），并非频道级配置，专用测试频道 `7983964` 在本场景中仅承担「专用测试对象落点 + 账号环境审计对象」的角色，与场景 08（viewer/custom-field）、场景 11（invite-sales）、场景 15（global）、场景 16（finance/group）、场景 17（robot/webapp）、场景 18（use/platform/user）、场景 19（ai）等账号级命令族的处理方式一致。

---

## 4. 行业背景

直播 SaaS 行业的渠道分销模式：保利威除了直客模式外，还存在「合作伙伴/转售商」模式——ISV、MCN、腾讯云生态集成商、区域代理商以转售商身份，在自己的保利威合作伙伴后台**代终端客户开户**（客户不需要自己注册，由转售商统一管理账号、统一计费、统一对接腾讯云政企采购）。两条核心链路：

1. **代客开户（partner user-register）**：转售商录入新客户的公司、联系人、手机号、邮箱、账号类型，保利威侧自动开通一个归属该转售商的新客户直播账号。这是渠道获客到账号开通的自动化入口。
2. **腾讯云政企订单（partner tencent-order create）**：对于走腾讯云政企/企业采购（非在线支付）的客户，转售商把腾讯云侧的 UIN、订单 ID、基础/增值服务清单同步到保利威，完成「云订单 → 直播服务履约」的打通。

电商营销场景中，这类能力对应**区域代理商批量开店、集团客户政企采购上单、腾讯云市场下单履约**等真实业务——是直播业务的「上游开户与商务履约」环节，与下游的频道开播、互动、转化（场景 01–20）形成完整链路。

---

## 5. 业务目标与核心 KPI

**业务目标**：把转售商的「代客开户 + 腾讯云政企上单」从保利威 Web 后台手动操作，沉淀为可脚本化、可批量、可审计的 CLI 操作手册，支撑渠道获客自动化。

**核心 KPI**：
- 单客户开户耗时（目标：CLI 一条命令 < 5 秒，替代后台表单手动填写）
- 腾讯云政企订单同步成功率（订单 ID + UIN + 服务清单一次落单）
- 开户/上单操作的审计完整性（每条命令留台账，公司/联系人/邮箱可追溯）

---

## 6. 适用角色

- **渠道/转售商务经理**：负责代客开户、维护客户名册。
- **腾讯云生态集成对接人**：负责把腾讯云政企订单同步到保利威履约。
- **ISV 平台运营**：把 partner CLI 嵌入自有的获客/上单自动化流水线。

> 前置约束：执行 partner 命令的保利威账号本身必须是**已认证的合作伙伴/转售商账号**。普通终端客户账号（如本轮测试账号 `nicksu`）即使 CLI 调用成功，也仅用于验证命令链路；真实代客开户必须在转售商账号下进行。

---

## 7. 前置条件

1. 已登录的保利威账号（`nix --yes polyv-live-cli@rc account current` 确认），本轮为 `nicksu`。
2. 已创建专用测试频道（本场景 `7983964`）。
3. 已校验 `partner` 命令面真实 help（见第 8 节），不凭记忆猜参数。
4. **风险前置确认**：`partner user-register` 会真实注册一个外部客户账号、`partner tencent-order create` 会真实创建一条腾讯云政企订单——均为**不可逆对外动作**。本轮所有写入均使用**明显测试标记**的公司名/联系人/邮箱/订单号，且预期在参数校验阶段即被 CLI/SDK 缺陷拦截，不会产生真实账号/订单（实测确认见第 12 节）。

---

## 8. polyv-live-cli-rc 能力映射

入口校验（rc 版本 `1.2.31-rc.0`）：

```bash
npx --yes polyv-live-cli@rc --version          # 1.2.31-rc.0
npx --yes polyv-live-cli@rc partner --help     # 子命令：tencent-order / user-register
```

`partner` 真实命令面（**无任何只读命令**，两条均为写入）：

| 子命令 | 真实参数（取自 `--help`） |
|---|---|
| `partner user-register` | `--company <company>` / `--mobile <mobile>` / `--contact <contact>` / `--email <email>` / `--type <type>` / `--remark <remark>` / `-f, --force` / `-o, --output` |
| `partner tencent-order create` | `--uin <uin>` / `--order-id <orderId>` / `--email <email>` / `--mobile <mobile>` / `--company <company>` / `--contact <contact>` / `--basic-service <json>` / `--premium-service <json>` / `--remark <remark>` / `-f, --force` / `-o, --output` |

> 真实 help 与 reference `partner.md`（「伙伴客户注册、腾讯订单」）一致；reference 未列具体参数，必须以真实 `--help` 为准。

---

## 9. 实施步骤

1. **账号预检**：`account current` / `account list` 确认当前账号与可用账号。
2. **建专用测试频道**：`channel create` 建 `7983964` 作为本轮专用测试对象与审计落点。
3. **代客开户演练（partner user-register）**：用明显测试标记的公司/联系人/邮箱/手机号，带 `-f -o json` 真实执行，预期命中 CLI/SDK `--mobile` 类型缺陷。
4. **腾讯云政企订单演练（partner tencent-order create）**：用明显测试标记的 UIN/订单号/邮箱/手机号 + `--basic-service` JSON 数组，带 `-f -o json` 真实执行，预期命中 CLI/SDK `--uin → UIN` 映射缺陷。
5. **复盘与归因**：对两条失败做值无关性确认（换 mobile/uin 取值复测），归因为 CLI/SDK 缺陷而非业务参数问题，写入台账与问题记录。
6. **频道保留确认**：`channel get -c 7983964` 复核测试频道完好、未被删除。

---

## 10. 命令执行台账

> 时间：2026-06-23（UTC 偏移后本地凌晨）；账号 `nicksu`（User ID `475b6884a7`，production）；敏感值（AppSecret/推流密钥）全程未出现。所有写入均使用明显测试标记，未产生真实外部客户账号/腾讯云订单。

| # | 时间 | 一级命令 / 子命令 | 实际执行命令（敏感脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 2026-06-23 | `partner --help`（help 校验） | `partner --help` | — | 成功 | 子命令：`tencent-order`、`user-register` |
| 2 | 2026-06-23 | `partner user-register --help` | `partner user-register --help` | — | 成功 | 参数：`--company/--mobile/--contact/--email/--type/--remark/-f/-o` |
| 3 | 2026-06-23 | `partner tencent-order --help` / `create --help` | `partner tencent-order create --help` | — | 成功 | 参数：`--uin/--order-id/--email/--mobile/--company/--contact/--basic-service/--premium-service/--remark/-f/-o` |
| 4 | 2026-06-23 | `account current` / `account list`（预检） | `account current`；`account list` | — | 成功 | 当前默认 `nicksu`；6 个可用账号 |
| 5 | 2026-06-23 | `channel create`（专用测试频道） | `channel create -n "GNHF-电商场景-21-…" -o json` | 新建 7983964 | 成功 | channelId 7983964，topclass/ppt，watchStatus waiting |
| 6 | 2026-06-23 | `partner user-register`（真实执行①） | `partner user-register --company "GNHF电商场景21-测试公司-非真实-勿处理" --mobile "13800138000" --contact "GNHF测试联系人" --email "gnhf21-scenario@example.com" --remark "…非真实合作伙伴-请勿处理" -f -o json` | 账号级（无频道对象） | **失败** | `Unexpected error: mobile must be a number`（exit 1） |
| 7 | 2026-06-23 | `partner user-register`（值无关复测②） | 同上，`--mobile "13900001111"` | 账号级 | **失败** | `Unexpected error: mobile must be a number` |
| 8 | 2026-06-23 | `partner user-register`（必填校验③） | 同上，省略 `--mobile` | 账号级 | **失败** | `error: required option '--mobile <mobile>' not specified`（证明 `--mobile` CLI 层必填） |
| 9 | 2026-06-23 | `partner user-register`（值无关复测④） | 同上，`--mobile "13800"`（短数字） | 账号级 | **失败** | `Unexpected error: mobile must be a number`（值无关，定性为类型缺陷） |
| 10 | 2026-06-23 | `partner tencent-order create`（真实执行①，未带 service） | `partner tencent-order create --uin "100012345678" --order-id "GNHF21-TEST-ORDER-001" --email "gnhf21-tencent@example.com" --mobile "13800138000" --company "GNHF测试企业" --contact "GNHF测试联系人" --remark "…非真实订单" -f -o json` | 账号级 | **失败** | `Error: Missing required option(s): basicService or premiumService`（`--basic-service`/`--premium-service` 至少一项必填） |
| 11 | 2026-06-23 | `partner tencent-order create`（必填校验②） | 同上，省略 `--mobile` | 账号级 | **失败** | `error: required option '--mobile <mobile>' not specified`（`--mobile` 必填） |
| 12 | 2026-06-23 | `partner tencent-order create`（真实执行③，带 basic-service） | 同上 + `--basic-service '[{"serviceId":"live_basic","num":1}]'` | 账号级 | **失败** | `Unexpected error: UIN is required`（exit 1）——尽管传入了 `--uin "100012345678"` |
| 13 | 2026-06-23 | `partner tencent-order create`（UIN 值无关复测④） | 同上，`--uin "888888888888"` + `--order-id "GNHF21-TEST-ORDER-004"` | 账号级 | **失败** | `Unexpected error: UIN is required`（值无关，定性为字段映射缺陷） |
| 14 | 2026-06-23 | `channel get`（频道保留复核） | `channel get -c 7983964 -o json` | 7983964 | 成功 | channelId 7983964 / 名称匹配 / watchStatus unStart（频道完好未删除） |

---

## 11. 实际使用的 CLI 命令与真实参数

```bash
# 0. 入口校验与账号预检
npx --yes polyv-live-cli@rc --version
npx --yes polyv-live-cli@rc partner --help
npx --yes polyv-live-cli@rc partner user-register --help
npx --yes polyv-live-cli@rc partner tencent-order create --help
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list

# 1. 建专用测试频道（保留未删除）
npx --yes polyv-live-cli@rc channel create \
  -n "GNHF-电商场景-21-partner-reseller-onboarding-202606230400" -o json

# 2. 代客开户演练（真实执行，预期 mobile 类型缺陷失败）
npx --yes polyv-live-cli@rc partner user-register \
  --company "GNHF电商场景21-测试公司-非真实-勿处理" \
  --mobile "13800138000" \
  --contact "GNHF测试联系人" \
  --email "gnhf21-scenario@example.com" \
  --remark "GNHF电商场景21 partner覆盖测试-非真实合作伙伴-请勿处理" \
  -f -o json

# 3. 腾讯云政企订单演练（真实执行，预期 UIN 字段映射缺陷失败）
npx --yes polyv-live-cli@rc partner tencent-order create \
  --uin "100012345678" \
  --order-id "GNHF21-TEST-ORDER-001" \
  --email "gnhf21-tencent@example.com" \
  --mobile "13800138000" \
  --company "GNHF测试企业" \
  --contact "GNHF测试联系人" \
  --basic-service '[{"serviceId":"live_basic","num":1}]' \
  --remark "GNHF电商场景21测试-非真实订单" \
  -f -o json

# 4. 频道保留复核
npx --yes polyv-live-cli@rc channel get -c 7983964 -o json
```

---

## 12. 执行或验证结果

### 12.1 `partner user-register` —— CLI/SDK `--mobile` 类型序列化缺陷

真实执行 4 次（含 3 次带值 + 1 次省略），结论：

| 取值 | 结果 |
|---|---|
| `--mobile "13800138000"`（标准 11 位） | `Unexpected error: mobile must be a number` |
| `--mobile "13900001111"`（换值） | `Unexpected error: mobile must be a number` |
| `--mobile "13800"`（短数字） | `Unexpected error: mobile must be a number` |
| 省略 `--mobile` | `error: required option '--mobile <mobile>' not specified` |

**归因**：错误信息 `mobile must be a number` 与 `--mobile` 的实际取值**完全无关**（11 位标准号、换号、5 位短数字均同报错），证明这不是「手机号格式不合法」的业务校验，而是 **CLI/SDK 把 `--mobile` 字符串值序列化为 JSON 字符串（`"mobile":"13800138000"`），而 PolyV 合作伙伴注册后端期望 JSON 数字（`"mobile":13800138000`）** 的类型序列化缺陷。CLI 命令行参数天然是字符串，SDK 未做字符串→数字的转换，导致后端反序列化时判定「不是数字」。

> 该缺陷属「CLI 选项类型/字段与后端契约不符」家族，与场景 17 `robot batch-save`（SDK 把 `{robots:[...]}` 对象作 body、后端期望裸数组）、场景 17 `webapp role delete`（query-only `id` 未计入 MD5 签名）同类——均为 SDK 对 partner/robot/webapp 等「边缘命令族」的序列化实现不完善。

### 12.2 `partner tencent-order create` —— CLI/SDK `--uin → UIN` 字段映射缺陷（+ mobile 同源缺陷）

真实执行 4 次，逐层揭示 3 个约束：

| 入参形态 | 结果 | 揭示的约束 |
|---|---|---|
| 带 uin/order-id/email/mobile/company/contact、**不带 service** | `Error: Missing required option(s): basicService or premiumService` | `--basic-service` / `--premium-service` 至少一项必填（CLI 层校验） |
| 省略 `--mobile` | `error: required option '--mobile <mobile>' not specified` | `--mobile` CLI 层必填（与 user-register 同） |
| 补 `--basic-service '[{"serviceId":"live_basic","num":1}]'`、`--uin "100012345678"` | `Unexpected error: UIN is required` | **尽管传入了 `--uin`，后端仍报 UIN 缺失** |
| 换 `--uin "888888888888"` + 换 order-id | `Unexpected error: UIN is required` | 值无关，定性为字段映射缺陷 |

**归因**：补齐 `--basic-service` 后，校验推进到 UIN 检查阶段，后端报 `UIN is required`，但命令行**已显式传入 `--uin "100012345678"`**——换 UIN 取值（`888888888888`）仍同报错，证明这是 **CLI 的 `--uin` 选项未被映射到后端接口期望的 `UIN` 字段**（疑似字段名大小写/驼峰转换缺失，或 SDK 未把 `uin` 透传到请求体），属 CLI 选项 → 后端字段映射缺陷。

> 该缺陷与场景 19 `ai video-produce get`（`--id` 未映射到 `aiPPTVideoId`）、场景 09 `player anti-record update`（`--model-type` 未映射到 `modelType`）、场景 03 `lottery create --type comment`（`--duration` 未映射到 `activityDuration`）同源——均为「CLI 选项名与后端必填字段名不一致且未做映射」。即使本账号是合格转售商、UIN 合法，该子命令在当前 rc（`1.2.31-rc.0`）也无法创建订单。

### 12.3 问题记录

- **问题 P21-1（`partner user-register` mobile 类型缺陷）**：CLI/SDK 把 `--mobile` 序列化为 JSON 字符串，后端期望数字，导致 `mobile must be a number`，值无关。**下一步排查**：检查 SDK `PartnerService`/`registerUser` 是否对 mobile 字段做了 `String` → `Number` 转换；修复后需在真实转售商账号下用合规手机号复测（含是否会进一步命中转售商权限门控）。
- **问题 P21-2（`partner tencent-order create` UIN 字段映射缺陷）**：CLI `--uin` 未映射到后端 `UIN` 字段，导致 `UIN is required`，值无关；同时该子命令 `--mobile` 必填（预期会复现 P21-1 的 mobile 类型缺陷）、`--basic-service`/`--premium-service` 至少一项必填。**下一步排查**：检查 SDK 创建腾讯订单的请求体构造，确认 `uin` 是否以正确字段名（后端期望 `UIN`/`uin`/`tencentUin` 之一）写入；`--basic-service`/`--premium-service` 的 JSON 数组元素结构（`serviceId`/`num` 等字段名）需对照后端契约核对。
- **问题 P21-3（partner 族无只读命令）**：`partner` 仅有两条写入子命令、无 list/get，无法用只读命令做「写入→读回验证」，也意味着无法在不触发外部写入的前提下探查当前账号是否具备转售商资格。**运营建议**：转售商资格与 partner 写入权限请在保利威 Web 后台确认，CLI 仅适合在已确认资格的转售商账号下批量执行；普通客户账号（如 `nicksu`）即使 CLI 链路修通，也可能在转售商资格校验阶段被拦截（与场景 20 `transmit` 转播权益门控、场景 16 `group` 集团主账号门控同类）。

---

## 13. 风险点与回滚/清理方式

| 风险 | 说明 | 缓解 / 回滚 |
|---|---|---|
| 不可逆对外动作 | `user-register` 会真实注册外部客户账号，`tencent-order create` 会真实创建腾讯云政企订单，均**不可经 CLI 一键回滚** | 本轮所有写入均用明显测试标记（公司名含「非真实-勿处理」、邮箱用 `example.com`、订单号含 `GNHF21-TEST`），且实测两条命令均在**参数校验阶段被 CLI/SDK 缺陷拦截**（未产生真实账号/订单）；若 SDK 修复后需复测，必须在已认证转售商账号下、用真实合规数据执行 |
| 转售商资格门控 | 即使 CLI 修通，普通客户账号可能命中转售商资格门控 | 在保利威后台确认账号已开通合作伙伴/转售商资格后再批量执行 |
| 频道误删 | 测试频道 `7983964` 被误删 | 本轮**未删除**测试频道；如需人工清理见第 14 节 |

---

## 14. 保留资产说明

| 保留资产 | 标识 | 删除状态 | 说明 |
|---|---|---|---|
| 专用测试频道 | `7983964`（`GNHF-电商场景-21-partner-reseller-onboarding-202606230400`） | **未删除（已保留）** | 本轮专用测试对象与账号环境审计落点；partner 族为账号级/外部账号写入，与本频道无功能关联，频道仅供人工查看配置 |
| 外部客户账号 | 无 | — | `partner user-register` 4 次真实执行均被 mobile 类型缺陷拦截，**未产生任何外部客户账号** |
| 腾讯云政企订单 | 无 | — | `partner tencent-order create` 4 次真实执行均被 UIN 字段映射缺陷（及 mobile/basic-service 必填校验）拦截，**未产生任何腾讯云订单** |

> 可选人工清理命令（**明确未执行**，仅备查）：
> ```bash
> # 清理本轮测试频道（未执行，频道已保留供人工查看）
> # npx --yes polyv-live-cli@rc channel delete -c 7983964 -f
> ```
> partner 族无对应 delete/list 子命令，外部客户账号与腾讯云订单本就未创建，无需清理。

---

## 15. 可复用模板

```bash
# 代客开户（需在已认证转售商账号下；当前 rc 因 mobile 类型缺陷不可用，模板供 SDK 修复后复用）
npx --yes polyv-live-cli@rc partner user-register \
  --company "<客户公司名>" \
  --mobile "<客户手机号>" \
  --contact "<联系人姓名>" \
  --email "<联系人邮箱>" \
  --type "<账号类型>" \
  --remark "<渠道来源/商务备注>" \
  -f -o json

# 腾讯云政企订单（需在已认证转售商账号下；当前 rc 因 UIN 字段映射缺陷不可用，模板供 SDK 修复后复用）
npx --yes polyv-live-cli@rc partner tencent-order create \
  --uin "<腾讯云 UIN>" \
  --order-id "<腾讯云订单号>" \
  --email "<联系人邮箱>" \
  --mobile "<联系人手机号>" \
  --company "<客户公司名>" \
  --contact "<联系人姓名>" \
  --basic-service '<[{serviceId,num},...] JSON 数组>' \
  --premium-service '<[{serviceId,num},...] JSON 数组>'  # basic/premium 至少一项
  --remark "<订单备注>" \
  -f -o json
```

---

## 16. 后续可扩展方向

1. **SDK 修复后端到端验证**：待保利威 SDK 修复 `--mobile` 类型转换与 `--uin → UIN` 字段映射后，在已认证转售商账号下用真实合规数据完成「代客开户 → channel get 验证新账号 → tencent-order create 上单 → 订单查询」端到端闭环。
2. **批量代客开户脚本**：基于 `partner user-register` 模板，结合 CSV 名册（公司/联系人/手机号/邮箱）做批量开户，每条留台账。
3. **腾讯云订单履约联动**：把 `tencent-order create` 嵌入腾讯云市场下单 webhook，实现「云市场下单 → 自动保利威上单 → 直播服务开通」自动化。
4. **partner 族只读能力补齐建议**：向保利威产品侧建议补充 `partner list`/`partner order list` 等只读查询子命令，支撑「开户/上单后审计回查」，避免当前「写入即不可读回」的黑盒状态（与场景 08 `viewer label channel-ref`/`custom-field value save` 无读回路径同类诉求）。
5. **覆盖收尾**：本场景完成后，40 个一级命令已全部至少被一个电商营销场景真实执行覆盖（partner 为第 40 个、最后一个），README 覆盖矩阵达成 40/40。
