# 场景 01：直播间优惠券承接（满减券配置 + 频道绑定 + 领券开关）

> 业务阶段：**预热 / 转化**
> 覆盖一级命令：`channel`、`coupon`、`account`
> 真实执行状态：**已执行成功**

---

## 1. 场景名称

直播间优惠券承接 —— 在新品直播开播前，为直播间配置一张「满 100 减 20」满减券，绑定到直播频道，并打开频道领券开关，让观众进入直播间即可领券，提升下单转化。

## 2. 覆盖命令

| 一级命令 | 子命令 | 执行状态 | 说明 |
|---|---|---|---|
| `account` | `account current`、`account list` | 已执行成功 | 写入前账号预检，确认当前账号与可用账号 |
| `channel` | `channel create`、`channel get` | 已执行成功 | 创建专用测试频道并验证频道存在 |
| `coupon` | `coupon add`、`coupon list`、`coupon channel add`、`coupon channel update-enabled`、`coupon channel enabled`、`coupon channel list` | 已执行成功 | 建券、绑定频道、开领券开关、验证 |

> 说明：本场景所有「覆盖命令」均使用真实账号（`nicksu`）与真实测试频道（`7983877`）真实执行过，下文「命令执行台账」逐条记录。仅做 `--help` 校验、未真实执行的命令不计入覆盖。

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道名称 | `GNHF-电商场景-01-coupon-redemption-202606222219` |
| 频道 ID | `7983877` |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production） |
| 场景类型 | `alone`（活动营销） |
| 模板 | `alone`（纯视频-横屏） |
| 创建结果 | 成功（status=waiting） |
| 创建时间 | 2026-06-22 22:19:22 CST |
| 是否删除 | **否，频道已保留**，供人工查看配置 |

## 4. 行业背景

电商直播的核心转化路径是「进店 → 留存 → 领券 → 下单」。优惠券是直播间最直接的转化抓手：主播在讲解商品时口播「左下角领券，满 100 减 20」，观众点击领取后下单时可抵扣，能够显著缩短决策时间、提升客单价与转化率。

但很多运营在配置优惠券时只建了券、没绑定到频道，或者绑定了却忘了打开频道「领券开关」，导致观众在直播间根本看不到、领不到券，转化抓手失效。本场景把「建券 → 绑定频道 → 打开领券开关 → 验证观众侧可见」串成一个可照着执行的操作闭环。

## 5. 业务目标与核心 KPI

- **业务目标**：直播开播前完成满减券配置并上线到频道，确保开播即领券可用。
- **核心 KPI**：
  - 领券页面在频道内可见（领券开关 = Y）
  - 优惠券剩余可领数量正确（建券 100 张 → 初始 remainAmount=100）
  - 优惠券状态为 `GOING`（领取中），规则为 满 100 减 20、每人限领 1 张
  - 优惠券有效期覆盖直播时段（领取期 = 使用期 = 创建后 30 天）

## 6. 适用角色

- 直播运营 / 电商运营：负责建券、绑定频道、开播前确认领券可用
- 主播 / 场控：在直播间口播引导领券（本场景不涉及，仅配置侧）

## 7. 前置条件

1. 已安装可访问 npm rc 发布版的 Node 环境，可用 `npx --yes polyv-live-cli@rc`。
2. 已配置可用账号且为默认账号（本场景使用 `nicksu`）。
3. 已确认要承接优惠券的直播频道（本场景为本轮新建的测试频道 `7983877`）。
4. 明确优惠券规则：满减门槛、减免金额、每人限领、领取起止时间、使用起止时间。

## 8. polyv-live-cli-rc 能力映射

| 业务动作 | CLI 一级命令 | 子命令 | 关键参数 |
|---|---|---|---|
| 写入前账号预检 | `account` | `current` / `list` | 无 |
| 创建专用测试频道 | `channel` | `create` | `-n`、`--scene alone`、`--template alone` |
| 验证频道存在 | `channel` | `get` | `-c` |
| 建满减券 | `coupon` | `add` | `--type MAX_OUT`、`--condition FULL_REDUCE`、`--full`、`--reduce` |
| 绑定券到频道 | `coupon` | `channel add` | `-c`、`--coupon-ids` |
| 打开领券开关 | `coupon` | `channel update-enabled` | `-c`、`--enabled Y` |
| 查频道领券开关 | `coupon` | `channel enabled` | `-c` |
| 查频道已绑券 | `coupon` | `channel list` | `-c` |
| 查平台券列表 | `coupon` | `list` | `--status GOING` |

## 9. 实施步骤

1. **账号预检**：执行 `account current` 与 `account list`，确认当前默认账号、是否有写入权限。
2. **创建专用测试频道**：用反映场景的名称创建活动营销频道，记录频道 ID。
3. **校验建券 help**：运行 `coupon add --help`，确认 `MAX_OUT`、`FULL_REDUCE`、`RANGE` 等参数真实存在。
4. **计算时间戳**：领取期、使用期使用 13 位毫秒时间戳；本场景起止一致，覆盖直播后 30 天。
5. **建券**：执行 `coupon add` 创建 满 100 减 20、每人限领 1、发行 100 张的满减券，记录 couponId。
6. **绑定频道**：执行 `coupon channel add` 将券绑定到测试频道。
7. **打开领券开关**：执行 `coupon channel update-enabled --enabled Y`（关键步骤，否则观众侧不可见）。
8. **验证闭环**：`coupon channel list` 看绑定与规则，`coupon channel enabled` 看开关，`coupon list --status GOING` 看平台券。

## 10. 命令执行台账

> 时间均为 2026-06-22 CST；敏感值（AppSecret、推流密钥）已脱敏，下文不出现。

| # | 执行时间 | 一级命令 / 子命令 | 实际执行命令（脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 22:19 | `account current` | `npx --yes polyv-live-cli@rc account current` | 账号 `nicksu` | 成功 | 默认账号 nicksu，来源全局配置 |
| 2 | 22:19 | `account list` | `npx --yes polyv-live-cli@rc account list` | 共 6 个账号 | 成功 | nicksu/testpolyv6/lizhikang/bd 等可用 |
| 3 | 22:19 | `channel create` | `npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-01-coupon-redemption-202606222219" -d "..." --scene alone --template alone -o json` | 新建 `7983877` | 成功 | channelId=7983877，status=waiting |
| 4 | 22:19 | `coupon add` | `npx --yes polyv-live-cli@rc coupon add --name "GNHF场景01-满100减20直播专享券" --type MAX_OUT --availableAmount 100 --receiveStart 1782137947000 --receiveEnd 1784729947000 --useTimeType RANGE --useStart 1782137947000 --useEnd 1784729947000 --condition FULL_REDUCE --full 100 --reduce 20 --limitPerPerson 1 -o json` | 新建券 `4w0gkklj8slqiyontw76yeimxqygf1d1` | 成功 | couponId 返回，券创建 |
| 5 | 22:19 | `coupon channel add` | `npx --yes polyv-live-cli@rc coupon channel add -c 7983877 --coupon-ids 4w0gkklj8slqiyontw76yeimxqygf1d1 -f -o json` | 频道 `7983877` | 成功 | success=true，券已绑定 |
| 6 | 22:19 | `coupon channel update-enabled` | `npx --yes polyv-live-cli@rc coupon channel update-enabled -c 7983877 --enabled Y -f -o json` | 频道 `7983877` | 成功 | enabled=Y，领券开关打开 |
| 7 | 22:19 | `coupon channel list` | `npx --yes polyv-live-cli@rc coupon channel list -c 7983877 -o json` | 频道 `7983877` | 成功 | 1 张券，status=GOING，FULL_REDUCE 满100减20，remainAmount=100 |
| 8 | 22:19 | `coupon channel enabled` | `npx --yes polyv-live-cli@rc coupon channel enabled -c 7983877 -o json` | 频道 `7983877` | 成功 | 返回 `"Y"`（开关打开前为 `N`） |
| 9 | 22:19 | `coupon list` | `npx --yes polyv-live-cli@rc coupon list --status GOING -o json` | 平台券 | 成功 | 命中新建券，状态 GOING |
| 10 | 22:19 | `channel get` | `npx --yes polyv-live-cli@rc channel get -c 7983877 -o json` | 频道 `7983877` | 成功 | 频道存在，pushUrl/pushSecret 已脱敏 |

## 11. 实际使用的 CLI 命令与真实参数

```bash
# 1) 账号预检
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list

# 2) 创建专用测试频道（活动营销 / 纯视频横屏）
npx --yes polyv-live-cli@rc channel create \
  -n "GNHF-电商场景-01-coupon-redemption-202606222219" \
  -d "电商营销场景01：直播间优惠券承接专用测试频道，GNHF 创建保留不删除" \
  --scene alone --template alone -o json

# 3) 建满减券（满 100 减 20，发行 100 张，每人限领 1，领取期=使用期=创建后 30 天）
npx --yes polyv-live-cli@rc coupon add \
  --name "GNHF场景01-满100减20直播专享券" \
  --type MAX_OUT --availableAmount 100 \
  --receiveStart 1782137947000 --receiveEnd 1784729947000 \
  --useTimeType RANGE --useStart 1782137947000 --useEnd 1784729947000 \
  --condition FULL_REDUCE --full 100 --reduce 20 --limitPerPerson 1 -o json

# 4) 绑定券到频道
npx --yes polyv-live-cli@rc coupon channel add -c 7983877 \
  --coupon-ids 4w0gkklj8slqiyontw76yeimxqygf1d1 -f -o json

# 5) 打开频道领券开关（关键：不打开观众侧看不到券）
npx --yes polyv-live-cli@rc coupon channel update-enabled -c 7983877 --enabled Y -f -o json

# 6) 验证
npx --yes polyv-live-cli@rc coupon channel list -c 7983877 -o json
npx --yes polyv-live-cli@rc coupon channel enabled -c 7983877 -o json
npx --yes polyv-live-cli@rc coupon list --status GOING -o json
npx --yes polyv-live-cli@rc channel get -c 7983877 -o json
```

> 时间戳取值说明：`1782137947000` = 2026-06-22 22:19 CST（建券时刻），`1784729947000` = 此后 30 天。

## 12. 执行或验证结果

- ✅ 测试频道 `7983877` 创建成功，状态 waiting，归属 nicksu。
- ✅ 满减券 `4w0gkklj8slqiyontw76yeimxqygf1d1` 创建成功，规则 满 100 减 20、每人限领 1、发行 100 张。
- ✅ 优惠券绑定到频道，频道领券列表返回 1 张券，status=GOING，remainAmount=100。
- ✅ 频道领券开关从默认 `N` 成功切到 `Y`，观众侧领券入口可用。
- ✅ 平台 `coupon list --status GOING` 命中该券。

**关键排查发现**：
- 新建频道默认领券开关为 `N`（关闭）。仅执行 `coupon channel add` 绑定券后，观众侧仍看不到券；必须再执行 `coupon channel update-enabled --enabled Y` 才能真正上线领券。这是运营最易遗漏的一步，本场景已显式覆盖并验证。
- 平台 `coupon list` 按 `--status` 过滤时，券的 `receiveStart` 取「当前时刻」会立刻进入 `GOING`，用 `NOT_START` 过滤会查无结果；验证发行券应使用 `--status GOING` 或不带状态过滤。

## 13. 风险点与回滚/清理方式

| 风险 | 说明 | 回滚/清理 |
|---|---|---|
| 优惠券配置错误（门槛/减免/有效期） | 错配会直接影响下单抵扣 | 可在后台停用券；CLI 侧 `coupon channel delete` 解绑，或 `coupon delete` 批量删除（本场景未执行删除） |
| 领券开关默认关闭导致观众看不到券 | 转化抓手失效 | 用 `coupon channel update-enabled --enabled Y` 打开（本场景已执行） |
| 误把券绑到生产频道 | 影响真实直播 | 仅绑定本轮新建测试频道 `7983877`；运营执行时务必 `-c` 指向正确频道 |
| 优惠券超发 | availableAmount 过大 | 本场景仅发行 100 张，配合 `--limitPerPerson 1` 控制单人领取 |

**可选的人工清理命令（未执行，仅备查）**：

```bash
# 解绑频道上的券（未执行）
npx --yes polyv-live-cli@rc coupon channel delete -c 7983877 --coupon-ids 4w0gkklj8slqiyontw76yeimxqygf1d1 -f
# 删除平台券（未执行）
npx --yes polyv-live-cli@rc coupon delete --coupon-ids 4w0gkklj8slqiyontw76yeimxqygf1d1 -f
# 删除测试频道（未执行，频道按约定保留）
npx --yes polyv-live-cli@rc channel delete -c 7983877 -f
```

> 上述清理命令**均未执行**，仅作为人工清理参考。

## 14. 保留资产说明

本轮保留以下资产用于人工查看配置，**未执行任何删除**：

| 资产 | ID | 说明 |
|---|---|---|
| 测试频道 | `7983877` | `GNHF-电商场景-01-coupon-redemption-202606222219`，活动营销/纯视频横屏，归属 nicksu |
| 满减券 | `4w0gkklj8slqiyontw76yeimxqygf1d1` | 满 100 减 20，发行 100 张，每人限领 1，有效期 30 天 |
| 频道-券绑定 | 频道 `7983877` ↔ 券 `4w0gkklj8slqiyontw76yeimxqygf1d1` | 领券开关=Y |

> 频道与券均已保留，未删除。如需清理，参见上文「可选的人工清理命令」，但该清理命令本轮未执行。

## 15. 可复用模板

运营在真实直播中复用时，替换占位符即可（`<频道ID>`、`<券名>`、`<满>`、`<减>`、`<发行量>`、`<起止时间戳>`）：

```bash
# 建满减券
npx --yes polyv-live-cli@rc coupon add \
  --name "<券名>" --type MAX_OUT --availableAmount <发行量> \
  --receiveStart <领取开始ms> --receiveEnd <领取结束ms> \
  --useTimeType RANGE --useStart <使用开始ms> --useEnd <使用结束ms> \
  --condition FULL_REDUCE --full <满> --reduce <减> --limitPerPerson 1 -o json

# 绑定频道 + 打开领券开关
npx --yes polyv-live-cli@rc coupon channel add -c <频道ID> --coupon-ids <券ID> -f -o json
npx --yes polyv-live-cli@rc coupon channel update-enabled -c <频道ID> --enabled Y -f -o json

# 验证
npx --yes polyv-live-cli@rc coupon channel list -c <频道ID> -o json
npx --yes polyv-live-cli@rc coupon channel enabled -c <频道ID> -o json
```

> 取时间戳示例（macOS）：`date +%s`000（当前毫秒）、`date -v+30d +%s`000（30 天后毫秒）。

## 16. 后续可扩展方向

- **折扣券（DISCOUNT）**：用 `--type DISCOUNT --condition UNCONDITIONAL --discount 80` 建 8 折无门槛券，覆盖会员专享直播场景。
- **多券组合**：单频道绑定多张券（`--coupon-ids` 支持逗号分隔，最多 30），做满减 + 折扣叠加节奏。
- **商品联动**：配合 `product add` 上架商品、`card-push` 推送商品卡片，形成「券 + 商品 + 卡片」完整转化闭环（后续场景覆盖）。
- **领券数据复盘**：用 `statistics` 查看领券与下单转化，复盘 ROI（后续场景覆盖）。
