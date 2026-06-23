# 场景 02：新品直播首发 — 商品库开启 + 商品上架 + 商品卡片节奏推送

> 业务阶段：**转化 / 互动**
> 覆盖一级命令：`product`、`card-push`、`channel`、`account`
> 真实执行状态：**已执行成功**

---

## 1. 场景名称

新品直播首发 —— 在新品直播开播前，先打开频道商品库，再为直播间上架「主打款 + 引流款」两件商品（带原价与到手价），并配置两类卡片推送：一张「限时秒杀」手动推送卡片，供主播讲解时一键弹出引导下单；一张「看播满 30 秒领新人红包」观看时长触发卡片，用于留住新进观众、降低跳出。主播讲解商品时弹出商品大卡（product push），形成「商品库开启 → 上架 → 卡片节奏 → 商品卡推送」的转化闭环。

## 2. 覆盖命令

| 一级命令 | 子命令 | 执行状态 | 说明 |
|---|---|---|---|
| `account` | `account current`、`account list` | 已执行成功 | 写入前账号预检 |
| `channel` | `channel create`、`channel get` | 已执行成功 | 创建专用测试频道并验证频道存在 |
| `product` | `product enabled`、`product update-enabled`、`product add`、`product list`、`product push`、`product cancel-push` | 已执行成功 | 查并打开商品库开关、上架 2 件商品、列表验证、推送商品大卡并取消 |
| `card-push` | `card-push create`、`card-push list`、`card-push push`、`card-push cancel` | 已执行成功 | 建手动推送卡片 + 观看时长触发卡片、列表验证、推送并取消（pushStatus N→Y→L） |

> 说明：本场景所有「覆盖命令」均使用真实账号（`nicksu`）与真实测试频道（`7983883`）真实执行过，下文「命令执行台账」逐条记录。仅做 `--help` 校验、未真实执行的命令不计入覆盖。
> 商品库开关的写入不是 `product enabled` 子命令；`product enabled` 只查询。打开商品库使用 `product update-enabled --enabled Y`，该子命令复用 `setup e-commerce` 的 `productEnabled` 资源同款 `ChannelService#updateChannelProductEnabled` 写入路径。

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道名称 | `GNHF-电商场景-02-product-card-push-202606222245` |
| 频道 ID | `7983883` |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production） |
| 场景类型 | `alone`（活动营销） |
| 模板 | `alone`（纯视频-横屏） |
| 创建结果 | 成功（watchStatus=unStart / 未开始） |
| 创建时间 | 2026-06-22 22:45:33 CST |
| 是否删除 | **否，频道已保留**，供人工查看配置 |

## 4. 行业背景

新品直播首发的核心目标是在 1～2 小时直播窗口里把「新品曝光 → 兴趣激发 → 下单转化」跑通。运营通常要准备两类商品：一件**主打款**（高客单、高毛利，承担 GMV）和一件**引流款**（低价、低门槛，用来拉新、拉升在线人数与互动）。商品本身只解决「能买」，但观众在直播间是否会点、是否会留，靠的是**卡片节奏**：

- 主播讲到主打款时，场控**手动弹出「限时秒杀」卡片**（带倒计时），制造紧迫感促单。
- 新进观众容易秒进秒出，配置一张**看播满 30 秒自动弹出的「新人红包」卡片**，用利益点留住人。
- 同时把主打款作为**商品大卡（bigCard）**直接推送到观众端购物袋，缩短「听讲解 → 找商品 → 下单」的路径。

如果只上架商品但忘记打开频道商品库，后台接口仍可能允许 `product add` 和 `product push` 成功，但观看页商品袋可能不展示商品。本场景把「打开商品库 → 上架商品 → 建手动/触发卡片 → 推送商品卡 → 推送/取消卡片」串成一个可照着执行的操作闭环，全部用真实测试频道验证。

## 5. 业务目标与核心 KPI

- **业务目标**：新品直播开播前完成商品上架与卡片配置，开播即可按节奏推送。
- **核心 KPI**：
  - 频道商品列表返回 2 件上架商品（status=1），主打款到手价 299（原价 399）、引流款到手价 9.9（原价 39.9）。
  - 频道商品库开关已写为 `Y`，避免观看页因商品库关闭而不展示商品。
  - 至少 1 张手动推送卡片（showCondition=PUSH）+ 1 张观看时长触发卡片（showCondition=WATCH，30 秒）配置成功。
  - 卡片推送在配置侧可验证状态流转：`pushStatus` 由 `N`（未推送）→ `Y`（推送中）→ `L`（已结束/已取消）。
  - 商品大卡推送（`product push`）返回成功，并可取消。

## 6. 适用角色

- 电商运营 / 直播运营：负责商品上架、价格配置、卡片配置与开播前节奏演练。
- 场控 / 助播：在直播中执行 `product push` 与 `card-push push` 的手动推送（本场景覆盖配置与演练，不涉及真实直播执行）。

## 7. 前置条件

1. 已安装可访问 npm rc 发布版的 Node 环境，可用 `npx --yes polyv-live-cli@rc`。
2. 已配置可用账号且为默认账号（本场景使用 `nicksu`）。
3. 已创建专用测试频道（本场景为本轮新建的测试频道 `7983883`）。
4. 已准备好**可被保利威服务器公网访问的商品封面图 URL**（关键：见第 12 节问题发现）。
5. 明确两件商品的名称、链接、到手价、原价、按钮文案。

## 8. polyv-live-cli-rc 能力映射

| 业务动作 | CLI 一级命令 | 子命令 | 关键参数 |
|---|---|---|---|
| 写入前账号预检 | `account` | `current` / `list` | 无 |
| 创建专用测试频道 | `channel` | `create` | `-n`、`--scene alone`、`--template alone` |
| 查频道商品库开关 | `product` | `enabled` | `-c` |
| 打开频道商品库 | `product` | `update-enabled` | `-c`、`--enabled Y`、`-f` |
| 上架商品（含原价/到手价） | `product` | `add` | `-n`、`--status 1`、`--link-type 10`、`-l`、`--cover`、`--real-price`、`--price` |
| 验证商品列表 | `product` | `list` | `-c` |
| 推送商品大卡到观众 | `product` | `push` | `-c`、`-p`、`--push-card-type bigCard` |
| 取消已推送商品 | `product` | `cancel-push` | `-c`、`-p` |
| 建手动推送卡片（秒杀） | `card-push` | `create` | `--channelId`、`--showCondition PUSH`、`--imageType giftbox`、`--duration` |
| 建观看时长触发卡片（红包） | `card-push` | `create` | `--channelId`、`--showCondition WATCH`、`--conditionValue`、`--conditionUnit` |
| 推送/取消卡片 | `card-push` | `push` / `cancel` | `--channelId`、`--cardPushId` |
| 列出频道卡片 | `card-push` | `list` | `--channelId` |

## 9. 实施步骤

1. **账号预检**：执行 `account current` 与 `account list`，确认当前默认账号、是否有写入权限。
2. **创建专用测试频道**：用反映场景的名称创建活动营销频道，记录频道 ID。
3. **查商品库开关**：执行 `product enabled` 记录初始状态（本频道为 `N`）。
4. **打开频道商品库**：执行 `product update-enabled --enabled Y`，再用 `product enabled` 复查为 `Y`。
5. **校验建商品 help**：运行 `product add --help`，确认 `--real-price`、`--price`、`--cover`、`--link-type` 等参数真实存在。
6. **上架主打款**：执行 `product add` 上架旗舰款，原价 399、到手价 299，记录 productId。
7. **上架引流款**：执行 `product add` 上架旅行装洁面小样，原价 39.9、到手价 9.9。
8. **验证商品**：执行 `product enabled` 与 `product list`，确认商品库开关已打开、2 件商品在架、价格正确。
9. **建手动秒杀卡片**：执行 `card-push create --showCondition PUSH`，记录 cardPushId。
10. **建观看触发红包卡片**：执行 `card-push create --showCondition WATCH --conditionValue 30 --conditionUnit SECONDS`。
11. **卡片列表验证**：执行 `card-push list` 确认 2 张卡片配置正确、`pushStatus=N`。
12. **推送秒杀卡片**：执行 `card-push push`，列表验证 `pushStatus` 由 `N` → `Y`。
13. **取消秒杀卡片**：执行 `card-push cancel`，列表验证 `pushStatus` 由 `Y` → `L`。
14. **商品大卡演练**：执行 `product push --push-card-type bigCard` 推送主打款，再 `product cancel-push` 取消，验证推送可成功发起与回收。

## 10. 命令执行台账

> 原始执行时间均为 2026-06-22 CST；补充商品库开关执行为 2026-06-23 CST。敏感值（AppSecret、推流密钥）已脱敏，下文不出现。

| # | 执行时间 | 一级命令 / 子命令 | 实际执行命令（脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 22:45 | `account current` | `npx --yes polyv-live-cli@rc account current` | 账号 `nicksu` | 成功 | 默认账号 nicksu，来源全局配置 |
| 2 | 22:45 | `account list` | `npx --yes polyv-live-cli@rc account list` | 共 6 个账号 | 成功 | nicksu/testpolyv6/lizhikang/bd 等可用 |
| 3 | 22:45 | `channel create` | `npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-02-product-card-push-202606222245" -d "..." --scene alone --template alone -o json` | 新建 `7983883` | 成功 | channelId=7983883，watchStatus=unStart |
| 4 | 22:46 | `product enabled` | `npx --yes polyv-live-cli@rc product enabled -c 7983883 -o json` | 频道 `7983883` | 成功 | `enabled: "N"`（商品库开关默认关闭；已在 #18/#19 补充打开并复查） |
| 5 | 22:46 | `product add`（主打款） | `npx --yes polyv-live-cli@rc product add -c 7983883 -n "GNHF场景02-新品首发-旗舰款护肤套装" --status 1 --link-type 10 -l "https://shop.example.com/..." --cover "https://placehold.co/400x400.png" --btn-show "立即抢购" --price-type AMOUNT --real-price 299 --original-price-type AMOUNT --price 399 -o json` | 新建 `998740` | 成功 | productId=998740，到手价 299/原价 399 |
| 6 | 22:46 | `product add`（引流款） | `npx --yes polyv-live-cli@rc product add -c 7983883 -n "GNHF场景02-引流款-旅行装洁面小样" --status 1 --link-type 10 -l "https://shop.example.com/..." --cover "https://placehold.co/400x400.png" --btn-show "9.9抢样" --price-type AMOUNT --real-price 9.9 --original-price-type AMOUNT --price 39.9 -o json` | 新建 `998741` | 成功 | productId=998741，到手价 9.9/原价 39.9 |
| 7 | 22:46 | `product list` | `npx --yes polyv-live-cli@rc product list -c 7983883 -o json` | 频道 `7983883` | 成功 | 返回 2 件商品，status=1，价格正确 |
| 8 | 22:46 | `product push` | `npx --yes polyv-live-cli@rc product push -c 7983883 -p 998740 --push-card-type bigCard -f -o json` | 商品 `998740` | 成功 | `success: true`，商品大卡推送成功 |
| 9 | 22:47 | `product cancel-push` | `npx --yes polyv-live-cli@rc product cancel-push -c 7983883 -p 998740 -f -o json` | 商品 `998740` | 成功 | `success: true`，已取消推送 |
| 10 | 22:47 | `card-push create`（红包） | `npx --yes polyv-live-cli@rc card-push create --channelId 7983883 --cardType common --imageType redpack --title "看播满30秒领新人红包" --link "https://shop.example.com/..." --duration 10 --showCondition WATCH --conditionValue 30 --conditionUnit SECONDS --countdownMsg "即将消失" --linkEnabled Y -o json` | 新建卡片 `77897` | 成功 | id=77897，WATCH/30 SECONDS，pushStatus=N |
| 11 | 22:47 | `card-push create`（秒杀） | `npx --yes polyv-live-cli@rc card-push create --channelId 7983883 --cardType common --imageType giftbox --title "新品首发限时秒杀" --link "https://shop.example.com/..." --duration 20 --showCondition PUSH --countdownMsg "秒杀进行中" --linkEnabled Y -o json` | 新建卡片 `77898` | 成功 | id=77898，PUSH，pushStatus=N |
| 12 | 22:47 | `card-push list`（推送前） | `npx --yes polyv-live-cli@rc card-push list --channelId 7983883 -o json` | 频道 `7983883` | 成功 | 2 张卡片，`77898` pushStatus=**N** |
| 13 | 22:47 | `card-push push` | `npx --yes polyv-live-cli@rc card-push push --channelId 7983883 --cardPushId 77898 -o json` | 卡片 `77898` | 成功 | `success: true`，卡片推送成功 |
| 14 | 22:47 | `card-push list`（推送后） | `npx --yes polyv-live-cli@rc card-push list --channelId 7983883 -o json` | 频道 `7983883` | 成功 | `77898` pushStatus=**Y**，pushTime 已写入 |
| 15 | 22:48 | `card-push cancel` | `npx --yes polyv-live-cli@rc card-push cancel --channelId 7983883 --cardPushId 77898 -o json` | 卡片 `77898` | 成功 | `success: true`，卡片推送已取消 |
| 16 | 22:48 | `card-push list`（取消后） | `npx --yes polyv-live-cli@rc card-push list --channelId 7983883 -o json` | 频道 `7983883` | 成功 | `77898` pushStatus=**L**，pushTime 保留 |
| 17 | 22:48 | `channel get` | `npx --yes polyv-live-cli@rc channel get -c 7983883 -o json` | 频道 `7983883` | 成功 | 频道存在，watchStatus=unStart |
| 18 | 补充执行 | `product update-enabled` | `npx --yes polyv-live-cli@rc product update-enabled -c 7983883 --enabled Y -f -o json` | 频道 `7983883` | 成功 | rc `1.2.31-rc.1` 验证成功，返回 success=true，enabled=Y |
| 19 | 补充执行 | `product enabled` | `npx --yes polyv-live-cli@rc product enabled -c 7983883 -o json` | 频道 `7983883` | 成功 | 返回 `enabled: "Y"` |
| 20 | 补充执行 | `product list` | `npx --yes polyv-live-cli@rc product list -c 7983883 -o json` | 频道 `7983883` | 成功 | 仍返回 2 件商品：`998740` / `998741`，均 status=1 |

> 说明：`product update-enabled` 为补齐商品库展示闭环的新子命令；台账 #18 已用已发布的 rc `1.2.31-rc.1` 真实写入验证。

## 11. 实际使用的 CLI 命令与真实参数

```bash
# 1) 账号预检
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list

# 2) 创建专用测试频道（活动营销 / 纯视频横屏）
npx --yes polyv-live-cli@rc channel create \
  -n "GNHF-电商场景-02-product-card-push-202606222245" \
  -d "电商营销场景02：新品直播首发-商品上架与商品卡片推送专用测试频道，GNHF 创建保留不删除" \
  --scene alone --template alone -o json

# 3) 查频道商品库开关（初始为 N）
npx --yes polyv-live-cli@rc product enabled -c 7983883 -o json

# 4) 打开频道商品库开关
# product enabled 只能查询；product update-enabled 负责写入。
npx --yes polyv-live-cli@rc product update-enabled -c 7983883 --enabled Y -f -o json
npx --yes polyv-live-cli@rc product enabled -c 7983883 -o json

# 5) 上架主打款（原价 399，到手价 299）
#    关键：--cover 必须是公网可访问的图片 URL，否则报「商品封面图片获取失败」
npx --yes polyv-live-cli@rc product add \
  -c 7983883 \
  -n "GNHF场景02-新品首发-旗舰款护肤套装" \
  --status 1 --link-type 10 \
  -l "https://shop.example.com/gnhf02/flagship-skincare-set" \
  --cover "https://placehold.co/400x400.png" \
  --product-desc "GNHF场景02测试新品：旗舰款护肤套装" \
  --btn-show "立即抢购" \
  --price-type AMOUNT --real-price 299 \
  --original-price-type AMOUNT --price 399 -o json

# 6) 上架引流款（原价 39.9，到手价 9.9）
npx --yes polyv-live-cli@rc product add \
  -c 7983883 \
  -n "GNHF场景02-引流款-旅行装洁面小样" \
  --status 1 --link-type 10 \
  -l "https://shop.example.com/gnhf02/travel-cleanser-sample" \
  --cover "https://placehold.co/400x400.png" \
  --btn-show "9.9抢样" \
  --price-type AMOUNT --real-price 9.9 \
  --original-price-type AMOUNT --price 39.9 -o json

# 7) 验证商品列表
npx --yes polyv-live-cli@rc product enabled -c 7983883 -o json
npx --yes polyv-live-cli@rc product list -c 7983883 -o json

# 8) 推送主打款商品大卡，再取消
npx --yes polyv-live-cli@rc product push -c 7983883 -p 998740 --push-card-type bigCard -f -o json
npx --yes polyv-live-cli@rc product cancel-push -c 7983883 -p 998740 -f -o json

# 9) 建观看时长触发卡片（看播满 30 秒弹新人红包）
npx --yes polyv-live-cli@rc card-push create \
  --channelId 7983883 --cardType common --imageType redpack \
  --title "看播满30秒领新人红包" \
  --link "https://shop.example.com/gnhf02/newbie-redpack" \
  --duration 10 --showCondition WATCH \
  --conditionValue 30 --conditionUnit SECONDS \
  --countdownMsg "即将消失" --linkEnabled Y -o json

# 10) 建手动推送卡片（新品首发限时秒杀）
npx --yes polyv-live-cli@rc card-push create \
  --channelId 7983883 --cardType common --imageType giftbox \
  --title "新品首发限时秒杀" \
  --link "https://shop.example.com/gnhf02/seckill" \
  --duration 20 --showCondition PUSH \
  --countdownMsg "秒杀进行中" --linkEnabled Y -o json

# 11) 推送 / 取消手动卡片，并用 list 验证 pushStatus 流转
npx --yes polyv-live-cli@rc card-push list --channelId 7983883 -o json          # pushStatus=N
npx --yes polyv-live-cli@rc card-push push   --channelId 7983883 --cardPushId 77898 -o json
npx --yes polyv-live-cli@rc card-push list --channelId 7983883 -o json          # pushStatus=Y
npx --yes polyv-live-cli@rc card-push cancel --channelId 7983883 --cardPushId 77898 -o json
npx --yes polyv-live-cli@rc card-push list --channelId 7983883 -o json          # pushStatus=L
```

> 参数大小写差异：`product` 用 kebab-case（`-c/--channel-id`、`-p/--product-id`）；`card-push` 用 camelCase（`--channelId`、`--cardPushId`）。混用会报参数缺失，必须各自遵循 help。

## 12. 执行或验证结果

- ✅ 测试频道 `7983883` 创建成功，watchStatus=unStart，归属 nicksu。
- ✅ 频道商品库开关已通过 `product update-enabled --enabled Y` 从 `N` 切到 `Y`，`product enabled` 复查返回 `Y`。
- ✅ 主打款 `998740`（到手 299/原价 399）、引流款 `998741`（到手 9.9/原价 39.9）上架成功，`product list` 返回 2 件、status=1、价格一致。
- ✅ 商品大卡 `product push --push-card-type bigCard` 返回 `success: true`，`product cancel-push` 同样返回成功。
- ✅ 手动秒杀卡片 `77898`、观看红包卡片 `77897` 创建成功，`card-push list` 可见两张。
- ✅ **配置侧状态流转已验证**：手动卡片 `77898` 的 `pushStatus` 经 `list` 三次查询确认 `N`（推送前）→ `Y`（`card-push push` 后）→ `L`（`card-push cancel` 后），`pushTime` 在推送后写入并保留。

**关键排查发现 / 问题记录**：

1. **【封面图必须公网可访问】`product add` 的 `--cover` 由保利威服务器端抓取**。首次用虚构域名 `https://shop.example.com/.../cover.jpg` 报 `商品封面图片获取失败`；不带 `--cover` 报 `param should not be empty: cover`（即封面实为必填）；改用公网可达的占位图 `https://placehold.co/400x400.png` 后成功。**运营落地时必须使用真实可访问的商品主图 URL**，不能用内网/未上线/虚构链接。
2. **【商品库开关不阻断上架，但影响观看页展示闭环】新建频道 `product enabled` 返回 `enabled: "N"`**，`product add` 与 `product push` 仍可成功，说明该开关不阻止 API 写入和推送指令。但运营上线不能停在这里：观看页是否展示商品依赖频道商品库开关，必须用 `product update-enabled --enabled Y` 打开，再用 `product enabled` 复查。本场景已补充执行并验证为 `Y`。
3. **【频道描述未持久化】`channel create` 传入了 `-d` 描述，但 `channel get` 返回 `desc: ""`**（与场景 01 一致）。这是已知现象：V4 创建接口的描述字段未回填到 `channel get` 的 `desc`，不属于本场景执行失败。
4. **【推送不依赖直播态】频道 watchStatus=unStart（未开播）时，`product push` 与 `card-push push` 仍返回成功**。说明推送是面向观众端的指令，不在配置侧校验直播是否进行；真实效果需在直播中由观众端体现。

> ⚠️ 配置侧 vs 观众侧（依规则区分）：本场景所有「推送成功 / 状态流转」均为通过 CLI/API 查询到的**配置侧已满足条件**。**未打开观看页、未做观众侧验证**，因此不写「观众侧可见/可用」。运营上线时需在真实直播中由主播/场控确认卡片与商品卡在观众端实际弹出。

## 13. 风险点与回滚/清理方式

| 风险 | 说明 | 回滚/清理 |
|---|---|---|
| 商品封面图不可访问导致上架失败 | 服务器端抓取，虚构/内网链接直接报错 | 使用公网可访问图片 URL（本场景用 `placehold.co` 占位） |
| 商品/卡片误配价格或链接 | 影响真实下单跳转 | `product update` 改价/改链；卡片 `card-push update` 改配置（本场景未执行） |
| 卡片推送到观众端未及时取消 | 活动结束后卡片仍挂出 | `card-push cancel` 取消正在推送的卡片；`product cancel-push` 取消商品大卡（本场景已演练取消） |
| 误把商品/卡片配到生产频道 | 影响真实直播 | 仅使用本轮新建测试频道 `7983883`；执行时务必 `-c/--channelId` 指向正确频道 |
| 商品库开关未打开 | 商品已上架、商品大卡推送也可能返回成功，但观看页商品袋可能不展示商品 | 用 `product update-enabled --enabled Y` 打开，再用 `product enabled` 复查 |

**可选的人工清理命令（未执行，仅备查）**：

```bash
# 下架/删除测试商品（未执行）
npx --yes polyv-live-cli@rc product delete -c 7983883 -p 998740 -f
npx --yes polyv-live-cli@rc product delete -c 7983883 -p 998741 -f
# 删除测试卡片（未执行）
npx --yes polyv-live-cli@rc card-push delete --channelId 7983883 --cardPushId 77897
npx --yes polyv-live-cli@rc card-push delete --channelId 7983883 --cardPushId 77898
# 删除测试频道（未执行，频道按约定保留）
npx --yes polyv-live-cli@rc channel delete -c 7983883 -f
```

> 上述清理命令**均未执行**，仅作为人工清理参考。

## 14. 保留资产说明

本轮保留以下资产用于人工查看配置，**未执行任何删除**：

| 资产 | ID | 说明 |
|---|---|---|
| 测试频道 | `7983883` | `GNHF-电商场景-02-product-card-push-202606222245`，活动营销/纯视频横屏，watchStatus=unStart |
| 商品库开关读数 | 频道 `7983883` | 初始 `product enabled` 返回 `N`；执行 `product update-enabled --enabled Y` 后，`product enabled` 返回 `Y` |
| 主打款商品 | `998740` | 旗舰款护肤套装，到手 299/原价 399，status=1 |
| 引流款商品 | `998741` | 旅行装洁面小样，到手 9.9/原价 39.9，status=1 |
| 观看触发卡片 | `77897` | 看播满 30 秒领新人红包（WATCH/30 SECONDS），pushStatus=N |
| 手动推送卡片 | `77898` | 新品首发限时秒杀（PUSH），演练后 pushStatus=L |

> 频道、商品、卡片均已保留，未删除。如需清理，参见上文「可选的人工清理命令」，但该清理命令本轮未执行。

## 15. 可复用模板

运营在真实直播中复用时，替换占位符即可（`<频道ID>`、`<商品名>`、`<商品链接>`、`<封面图URL>`、`<到手价>`、`<原价>`、`<卡片标题>`、`<倒计时秒>`）。注意：`product enabled` 只用于复查；商品库开关写入使用 `product update-enabled`：

```bash
# 1) 打开商品库开关并复查
npx --yes polyv-live-cli@rc product update-enabled -c <频道ID> --enabled Y -f -o json
npx --yes polyv-live-cli@rc product enabled -c <频道ID> -o json

# 2) 上架商品（封面图必须是公网可访问 URL！）
npx --yes polyv-live-cli@rc product add \
  -c <频道ID> -n "<商品名>" --status 1 --link-type 10 \
  -l "<商品链接>" --cover "<封面图URL>" \
  --btn-show "立即抢购" \
  --price-type AMOUNT --real-price <到手价> \
  --original-price-type AMOUNT --price <原价> -o json

# 3) 直播中推送商品大卡并按需取消
npx --yes polyv-live-cli@rc product push -c <频道ID> -p <商品ID> --push-card-type bigCard -f -o json
npx --yes polyv-live-cli@rc product cancel-push -c <频道ID> -p <商品ID> -f -o json

# 4) 建手动推送卡片（主播讲解时一键弹出）
npx --yes polyv-live-cli@rc card-push create \
  --channelId <频道ID> --cardType common --imageType giftbox \
  --title "<卡片标题，≤16字>" --link "<跳转链接>" \
  --duration <0|5|10|20|30> --showCondition PUSH \
  --countdownMsg "<≤8字>" --linkEnabled Y -o json

# 5) 建观看时长触发卡片（留人用）
npx --yes polyv-live-cli@rc card-push create \
  --channelId <频道ID> --cardType common --imageType redpack \
  --title "<卡片标题>" --link "<跳转链接>" \
  --duration <秒> --showCondition WATCH \
  --conditionValue <观看时长> --conditionUnit SECONDS \
  --countdownMsg "<≤8字>" --linkEnabled Y -o json

# 6) 直播中推送 / 取消手动卡片
npx --yes polyv-live-cli@rc card-push push   --channelId <频道ID> --cardPushId <卡片ID> -o json
npx --yes polyv-live-cli@rc card-push cancel --channelId <频道ID> --cardPushId <卡片ID> -o json
```

## 16. 后续可扩展方向

- **商品与优惠券联动**：把主打款 `998740` 与场景 01 的满减券绑到同一频道，形成「商品卡 + 满减券」叠加促单（依赖 `coupon` 已覆盖）。
- **商品标签 / 排序 / 置顶**：用 `product channel-tag`、`product rank`、`product topping` 控制直播间商品袋的展示顺序与重点曝光（后续场景覆盖）。
- **推广渠道追踪**：用 `promotion` 为不同投放渠道生成带参分享链接，回传秒杀卡片点击与下单归因（后续场景覆盖）。
- **多平台链接商品**：用 `--link-type 11` 配 PC/移动/小程序多端跳转，覆盖跨端下单场景。
- **数据复盘**：用 `product stats` / `statistics` 复盘卡片点击率、商品点击与下单转化（后续场景覆盖）。
