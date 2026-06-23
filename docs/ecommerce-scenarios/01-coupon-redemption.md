# 场景 01：直播间优惠券承接（商品库开启 + 商品上架 + 满减券配置 + 频道绑定 + 领券开关）

> 业务阶段：**预热 / 转化**
> 覆盖一级命令：`channel`、`product`、`coupon`、`account`
> 真实执行状态：**已执行成功**

---

## 1. 场景名称

直播间优惠券承接 —— 在新品直播开播前，先打开频道商品库并上架一件可购买商品，再配置一张「满 100 减 20」满减券，绑定到直播频道，并打开频道领券开关，让「商品 + 券」同时在观看页侧就绪，提升下单转化。

## 2. 覆盖命令

| 一级命令 | 子命令 | 执行状态 | 说明 |
|---|---|---|---|
| `account` | `account current`、`account list` | 已执行成功 | 写入前账号预检，确认当前账号与可用账号 |
| `channel` | `channel create`、`channel get` | 已执行成功 | 创建专用测试频道并验证频道存在 |
| `product` | `product enabled`、`product update-enabled`、`product add`、`product list` | 已执行成功 | 使用 `e-commerce.yaml` 示例商品上架 1 件商品，打开并复查商品列表与商品库开关 |
| `coupon` | `coupon add`、`coupon list`、`coupon channel add`、`coupon channel update-enabled`、`coupon channel enabled`、`coupon channel list` | 已执行成功 | 建券、绑定频道、开领券开关、验证 |

> 说明：本场景所有「覆盖命令」均使用真实账号（`nicksu`）与真实测试频道（`7983877`）真实执行过，下文「命令执行台账」逐条记录。仅做 `--help` 校验、未真实执行的命令不计入覆盖。
> 商品库开关的写入不是 `product enabled` 子命令；`product enabled` 只查询。打开商品库使用 `product update-enabled --enabled Y`，该子命令复用 `setup e-commerce` 的 `productEnabled` 资源同款 `ChannelService#updateChannelProductEnabled` 写入路径。

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

电商直播的核心转化路径是「进店 → 留存 → 看商品 → 领券 → 下单」。优惠券是直播间最直接的转化抓手：主播在讲解商品时口播「左下角领券，满 100 减 20」，观众点击领取后下单时可抵扣，能够显著缩短决策时间、提升客单价与转化率。

但很多运营在配置优惠券时只建了券、没上架商品，或者上架了商品却忘了打开频道商品库；建券后也常见没绑定到频道、绑定了却忘了打开频道「领券开关」。这些都会导致观众在观看页看不到商品或领券入口，转化链路断在下单前。本场景按 `e-commerce.yaml` 的电商场景配置，把「打开商品库 → 上架商品 → 建券 → 绑定频道 → 打开领券开关 → 验证商品和券配置」串成一个可照着执行的操作闭环。

## 5. 业务目标与核心 KPI

- **业务目标**：直播开播前完成商品上架与满减券配置，确保开播即具备「可买商品 + 可领优惠券」的转化闭环。
- **核心 KPI**：
  - 频道商品库开关已打开（商品库开关 = Y）
  - 频道商品列表存在 1 件在架商品（status=1），到手价 179、原价 399
  - 领券入口配置已打开（领券开关 = Y）
  - 优惠券剩余可领数量正确（建券 100 张 → 初始 remainAmount=100）
  - 优惠券状态为 `GOING`（领取中），规则为 满 100 减 20、每人限领 1 张
  - 优惠券有效期覆盖直播时段（领取期 = 使用期 = 创建后 30 天）

## 6. 适用角色

- 直播运营 / 电商运营：负责商品上架、建券、绑定频道、开播前确认商品与领券配置可用
- 主播 / 场控：在直播间讲解商品并口播引导领券（本场景覆盖配置侧，不涉及真实直播执行）

## 7. 前置条件

1. 已安装可访问 npm rc 发布版的 Node 环境，可用 `npx --yes polyv-live-cli@rc`。
2. 已配置可用账号且为默认账号（本场景使用 `nicksu`）。
3. 已确认要承接优惠券的直播频道（本场景为本轮新建的测试频道 `7983877`）。
4. 已准备商品名称、封面图、购买链接、到手价、原价；本场景沿用 `packages/cli/src/setup-scenes/e-commerce.yaml` 的 Allowish 示例商品配置。
5. 明确优惠券规则：满减门槛、减免金额、每人限领、领取起止时间、使用起止时间。

## 8. polyv-live-cli-rc 能力映射

| 业务动作 | CLI 一级命令 | 子命令 | 关键参数 |
|---|---|---|---|
| 写入前账号预检 | `account` | `current` / `list` | 无 |
| 创建专用测试频道 | `channel` | `create` | `-n`、`--scene alone`、`--template alone` |
| 验证频道存在 | `channel` | `get` | `-c` |
| 查频道商品库开关 | `product` | `enabled` | `-c` |
| 打开频道商品库 | `product` | `update-enabled` | `-c`、`--enabled Y`、`-f` |
| 上架承接商品 | `product` | `add` | `-c`、`--status 1`、`--link-type 11`、`--pc-link`、`--mobile-link`、`--cover`、`--real-price`、`--price` |
| 验证商品列表 | `product` | `list` | `-c` |
| 建满减券 | `coupon` | `add` | `--type MAX_OUT`、`--condition FULL_REDUCE`、`--full`、`--reduce` |
| 绑定券到频道 | `coupon` | `channel add` | `-c`、`--coupon-ids` |
| 打开领券开关 | `coupon` | `channel update-enabled` | `-c`、`--enabled Y` |
| 查频道领券开关 | `coupon` | `channel enabled` | `-c` |
| 查频道已绑券 | `coupon` | `channel list` | `-c` |
| 查平台券列表 | `coupon` | `list` | `--status GOING` |

## 9. 实施步骤

1. **账号预检**：执行 `account current` 与 `account list`，确认当前默认账号、是否有写入权限。
2. **创建专用测试频道**：用反映场景的名称创建活动营销频道，记录频道 ID。
3. **检查商品现状**：执行 `product enabled` 与 `product list`，确认当前频道商品库开关和是否已有商品。
4. **打开频道商品库**：执行 `product update-enabled --enabled Y`，把频道商品库开关写为 `Y`；`product enabled` 仅用于写入后复查。
5. **上架承接商品**：按 `e-commerce.yaml` 的 Allowish 示例商品执行 `product add --status 1`，记录 productId。
6. **验证商品**：执行 `product enabled` 与 `product list`，确认商品库开关已打开、商品已在架、价格正确。
7. **校验建券 help**：运行 `coupon add --help`，确认 `MAX_OUT`、`FULL_REDUCE`、`RANGE` 等参数真实存在。
8. **计算时间戳**：领取期、使用期使用 13 位毫秒时间戳；本场景起止一致，覆盖直播后 30 天。
9. **建券**：执行 `coupon add` 创建 满 100 减 20、每人限领 1、发行 100 张的满减券，记录 couponId。
10. **绑定频道**：执行 `coupon channel add` 将券绑定到测试频道。
11. **打开领券开关**：执行 `coupon channel update-enabled --enabled Y`（关键步骤，否则配置侧领券入口不开启）。
12. **验证闭环**：`product enabled` 看商品库开关，`product list` 看商品，`coupon channel list` 看绑定与规则，`coupon channel enabled` 看领券开关，`coupon list --status GOING` 看平台券。

## 10. 命令执行台账

> 时间为 2026-06-22 与 2026-06-23 CST；敏感值（AppSecret、推流密钥）已脱敏，下文不出现。

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
| 11 | 10:49 | `product enabled` | `npx --yes polyv-live-cli@rc product enabled -c 7983877 -o json` | 频道 `7983877` | 成功 | 返回 `enabled: "N"` |
| 12 | 10:49 | `product list`（补充前） | `npx --yes polyv-live-cli@rc product list -c 7983877 -o json` | 频道 `7983877` | 成功 | `No products found for channel 7983877`，确认原场景缺少商品 |
| 13 | 10:49 | `product add` | `npx --yes polyv-live-cli@rc product add -c 7983877 -n "GNHF场景01-Allowish英国进口香氛沐浴露" --status 1 --link-type 11 --pc-link "https://npcitem.jd.hk/10128409499312.html" --mobile-link "https://npcitem.jd.hk/10128409499312.html" --cover "https://liveimages.videocc.net/uploaded/images/2026/03/hguwyf1zxx.png" --btn-show "去购买" --price-type AMOUNT --real-price 179 --original-price-type AMOUNT --price 399 -o json` | 新建商品 `999016` | 成功 | productId=999016，status=1，上架到频道 |
| 14 | 10:49 | `product list`（补充后） | `npx --yes polyv-live-cli@rc product list -c 7983877 -o json` | 频道 `7983877` | 成功 | 返回 1 件商品：`999016`，status=1，price=399，realPrice=179 |
| 15 | 补充执行 | `product update-enabled` | `npx --yes polyv-live-cli@rc product update-enabled -c 7983877 --enabled Y -f -o json` | 频道 `7983877` | 成功 | rc `1.2.31-rc.1` 验证成功，返回 success=true，enabled=Y |
| 16 | 补充执行 | `product enabled` | `npx --yes polyv-live-cli@rc product enabled -c 7983877 -o json` | 频道 `7983877` | 成功 | 返回 `enabled: "Y"` |

## 11. 实际使用的 CLI 命令与真实参数

> 说明：`product update-enabled` 为本次补齐的新子命令；台账 #15 已用已发布的 rc `1.2.31-rc.1` 真实写入验证。

```bash
# 1) 账号预检
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list

# 2) 创建专用测试频道（活动营销 / 纯视频横屏）
npx --yes polyv-live-cli@rc channel create \
  -n "GNHF-电商场景-01-coupon-redemption-202606222219" \
  -d "电商营销场景01：直播间优惠券承接专用测试频道，GNHF 创建保留不删除" \
  --scene alone --template alone -o json

# 3) 上架承接商品（参数来自 e-commerce.yaml 示例商品）
npx --yes polyv-live-cli@rc product enabled -c 7983877 -o json
npx --yes polyv-live-cli@rc product add \
  -c 7983877 \
  -n "GNHF场景01-Allowish英国进口香氛沐浴露" \
  --status 1 --link-type 11 \
  --pc-link "https://npcitem.jd.hk/10128409499312.html" \
  --mobile-link "https://npcitem.jd.hk/10128409499312.html" \
  --cover "https://liveimages.videocc.net/uploaded/images/2026/03/hguwyf1zxx.png" \
  --product-desc "Allowish英国进口香氛沐浴露除螨止痒滋润美白保湿去鸡皮全身持久留香男女【午后伯爵】新式调香" \
  --btn-show "去购买" \
  --price-type AMOUNT --real-price 179 \
  --original-price-type AMOUNT --price 399 -o json

# 4) 打开频道商品库开关
# product enabled 只能查询；product update-enabled 负责写入。
npx --yes polyv-live-cli@rc product update-enabled -c 7983877 --enabled Y -f -o json
npx --yes polyv-live-cli@rc product enabled -c 7983877 -o json
npx --yes polyv-live-cli@rc product list -c 7983877 -o json

# 5) 建满减券（满 100 减 20，发行 100 张，每人限领 1，领取期=使用期=创建后 30 天）
npx --yes polyv-live-cli@rc coupon add \
  --name "GNHF场景01-满100减20直播专享券" \
  --type MAX_OUT --availableAmount 100 \
  --receiveStart 1782137947000 --receiveEnd 1784729947000 \
  --useTimeType RANGE --useStart 1782137947000 --useEnd 1784729947000 \
  --condition FULL_REDUCE --full 100 --reduce 20 --limitPerPerson 1 -o json

# 6) 绑定券到频道
npx --yes polyv-live-cli@rc coupon channel add -c 7983877 \
  --coupon-ids 4w0gkklj8slqiyontw76yeimxqygf1d1 -f -o json

# 7) 打开频道领券开关（关键：不打开配置侧领券入口不开启）
npx --yes polyv-live-cli@rc coupon channel update-enabled -c 7983877 --enabled Y -f -o json

# 8) 验证
npx --yes polyv-live-cli@rc product enabled -c 7983877 -o json
npx --yes polyv-live-cli@rc product list -c 7983877 -o json
npx --yes polyv-live-cli@rc coupon channel list -c 7983877 -o json
npx --yes polyv-live-cli@rc coupon channel enabled -c 7983877 -o json
npx --yes polyv-live-cli@rc coupon list --status GOING -o json
npx --yes polyv-live-cli@rc channel get -c 7983877 -o json
```

> 时间戳取值说明：`1782137947000` = 2026-06-22 22:19 CST（建券时刻），`1784729947000` = 此后 30 天。

## 12. 执行或验证结果

- ✅ 测试频道 `7983877` 创建成功，状态 waiting，归属 nicksu。
- ✅ 频道商品库开关已通过 `product update-enabled --enabled Y` 从 `N` 切到 `Y`，`product enabled` 复查返回 `Y`。
- ✅ 承接商品 `999016`「GNHF场景01-Allowish英国进口香氛沐浴露」上架成功，`product list` 返回 1 件商品，status=1，realPrice=179，price=399。
- ✅ 满减券 `4w0gkklj8slqiyontw76yeimxqygf1d1` 创建成功，规则 满 100 减 20、每人限领 1、发行 100 张。
- ✅ 优惠券绑定到频道，频道领券列表返回 1 张券，status=GOING，remainAmount=100。
- ✅ 频道领券开关从默认 `N` 成功切到 `Y`，配置侧领券入口已开启。
- ✅ 平台 `coupon list --status GOING` 命中该券。

**关键排查发现**：

- 原场景补充前执行 `product list -c 7983877` 返回 `No products found for channel 7983877`，确实只有券、没有商品。本次按 `e-commerce.yaml` 示例商品补充执行 `product add`，形成「商品 + 券」闭环。
- 新建频道默认领券开关为 `N`（关闭）。仅执行 `coupon channel add` 绑定券后，配置侧领券入口仍未开启；必须再执行 `coupon channel update-enabled --enabled Y` 才能真正上线领券。这是运营最易遗漏的一步，本场景已显式覆盖并验证。
- 平台 `coupon list` 按 `--status` 过滤时，券的 `receiveStart` 取「当前时刻」会立刻进入 `GOING`，用 `NOT_START` 过滤会查无结果；验证发行券应使用 `--status GOING` 或不带状态过滤。
- 文档口径明确区分两个端点：`product enabled` 对应 `GET /live/v3/channel/product/get-enabled`，只查频道商品库开关；`product update-enabled` 对应 `POST /live/v3/channel/product/update-enabled`，负责修改频道商品库开关。`setup e-commerce` 的 `productEnabled=Y` 与该子命令复用同一个 SDK 方法 `ChannelService#updateChannelProductEnabled`。

## 13. 风险点与回滚/清理方式

| 风险 | 说明 | 回滚/清理 |
|---|---|---|
| 商品库开关未打开 | 即使商品已上架，观看页也可能不展示商品 | 用 `product update-enabled --enabled Y` 打开，再用 `product enabled` 复查 |
| 商品未上架或价格/链接错误 | 观众领券后没有明确承接商品，转化链路断裂 | 用 `product add` 上架，或用 `product update` 修正；必要时 `product delete` 删除测试商品 |
| 优惠券配置错误（门槛/减免/有效期） | 错配会直接影响下单抵扣 | 可在后台停用券；CLI 侧 `coupon channel delete` 解绑，或 `coupon delete` 批量删除（本场景未执行删除） |
| 领券开关默认关闭导致观众看不到券 | 转化抓手失效 | 用 `coupon channel update-enabled --enabled Y` 打开（本场景已执行） |
| 误把商品/券配到生产频道 | 影响真实直播 | 仅绑定本轮新建测试频道 `7983877`；运营执行时务必 `-c` 指向正确频道 |
| 优惠券超发 | availableAmount 过大 | 本场景仅发行 100 张，配合 `--limitPerPerson 1` 控制单人领取 |

**可选的人工清理命令（未执行，仅备查）**：

```bash
# 删除测试商品（未执行）
npx --yes polyv-live-cli@rc product delete -c 7983877 -p 999016 -f
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
| 承接商品 | `999016` | `GNHF场景01-Allowish英国进口香氛沐浴露`，status=1，到手价 179，原价 399，购买链接来自 `e-commerce.yaml` |
| 商品库开关读数 | 频道 `7983877` | 初始 `product enabled` 返回 `N`；执行 `product update-enabled --enabled Y` 后，`product enabled` 返回 `Y` |
| 满减券 | `4w0gkklj8slqiyontw76yeimxqygf1d1` | 满 100 减 20，发行 100 张，每人限领 1，有效期 30 天 |
| 频道-券绑定 | 频道 `7983877` ↔ 券 `4w0gkklj8slqiyontw76yeimxqygf1d1` | 领券开关=Y |

> 频道、商品与券均已保留，未删除。如需清理，参见上文「可选的人工清理命令」，但该清理命令本轮未执行。

## 15. 可复用模板

运营在真实直播中复用时，替换占位符即可（`<频道ID>`、`<商品名>`、`<购买链接>`、`<封面图URL>`、`<券名>`、`<满>`、`<减>`、`<发行量>`、`<起止时间戳>`）。注意：`product enabled` 只用于复查；商品库开关写入使用 `product update-enabled`。

```bash
# 打开商品库开关并复查
npx --yes polyv-live-cli@rc product update-enabled -c <频道ID> --enabled Y -f -o json
npx --yes polyv-live-cli@rc product enabled -c <频道ID> -o json

# 上架商品
npx --yes polyv-live-cli@rc product add \
  -c <频道ID> -n "<商品名>" --status 1 --link-type 10 \
  -l "<购买链接>" --cover "<封面图URL>" \
  --btn-show "去购买" \
  --price-type AMOUNT --real-price <到手价> \
  --original-price-type AMOUNT --price <原价> -o json

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
npx --yes polyv-live-cli@rc product enabled -c <频道ID> -o json
npx --yes polyv-live-cli@rc product list -c <频道ID> -o json
npx --yes polyv-live-cli@rc coupon channel list -c <频道ID> -o json
npx --yes polyv-live-cli@rc coupon channel enabled -c <频道ID> -o json
```

> 取时间戳示例（macOS）：`date +%s`000（当前毫秒）、`date -v+30d +%s`000（30 天后毫秒）。

## 16. 后续可扩展方向

- **折扣券（DISCOUNT）**：用 `--type DISCOUNT --condition UNCONDITIONAL --discount 80` 建 8 折无门槛券，覆盖会员专享直播场景。
- **多券组合**：单频道绑定多张券（`--coupon-ids` 支持逗号分隔，最多 30），做满减 + 折扣叠加节奏。
- **卡片联动**：配合 `card-push` 推送商品卡片和新人红包卡，形成「券 + 商品 + 卡片」完整转化闭环（场景 02 已覆盖）。
- **领券数据复盘**：用 `statistics` 查看领券与下单转化，复盘 ROI（后续场景覆盖）。
