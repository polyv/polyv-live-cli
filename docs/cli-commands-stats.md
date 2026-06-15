# PolyV Live CLI 命令统计

> 统计日期：2026-03-27

## 总览

| 指标 | 数量 |
|------|------|
| **命令文件** | 30 个 |
| **顶级命令** | 29 个 |
| **子命令总数** | ~113 个 |
| **调用远程 API 的子命令** | ~93 个 |
| **纯本地子命令** | ~20 个 |
| **涉及的独立 API 端点** | ~83 个 |

---

## 按命令详细统计

### 1. `channel` — 频道管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `channel create` | 创建频道 | createChannel |
| `channel list` | 列出频道 | listChannels |
| `channel get` | 查看频道详情 | getChannelDetail |
| `channel update` | 更新频道设置 | updateChannel |
| `channel delete` | 删除频道 | deleteChannel |
| `channel batch-delete` | 批量删除频道 | batchDeleteChannels |

**API 数量：6**

---

### 2. `stream` — 推流管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `stream get-key` | 获取推流密钥 | getStreamKey |
| `stream start` | 开始推流 | startStream |
| `stream stop` | 停止推流 | stopStream |
| `stream status` | 查看推流状态 | getStreamStatus |
| `stream push` | 推流操作 | getStreamKey + getStreamStatus |
| `stream verify` | 验证推流 | getStreamStatus |
| `stream monitor` | 推流监控 | getStreamStatus |

**API 数量：7**（4 个独立端点，monitor/push/verify 复用 getStreamStatus）

---

### 3. `monitor` — 直播监控仪表盘

| 子命令 | 作用 | API |
|--------|------|-----|
| `monitor` | 启动监控面板 | 无（终端 UI） |
| `monitor status` | 显示面板状态 | 无 |
| `monitor config` | 管理配置 | 无 |
| `monitor layouts` | 列出布局 | 无 |
| `monitor themes` | 列出主题 | 无 |
| `monitor test` | 兼容性测试 | 无 |
| `monitor export` | 导出配置 | 无 |
| `monitor import` | 导入配置 | 无 |

**API 数量：0**（纯终端 UI 功能）

---

### 4. `coupon` — 优惠券管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `coupon add` | 创建优惠券 | createCoupon |
| `coupon list` | 列出优惠券 | searchCoupons |
| `coupon delete` | 批量删除优惠券 | deleteCouponsBatch |

**API 数量：3**

---

### 5. `product` — 商品管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `product list` | 列出商品 | getProductList |
| `product add` | 添加商品 | addProduct |
| `product update` | 更新商品 | updateProduct |
| `product delete` | 删除商品 | deleteProduct |

**API 数量：4**

---

### 6. `statistics` — 数据统计

| 子命令 | 作用 | API |
|--------|------|-----|
| `statistics view` | 观看数据统计 | getDailyViewStatistics |
| `statistics concurrency` | 并发数据 | getConcurrencyData |
| `statistics max-concurrent` | 最大并发 | getMaxConcurrent |
| `statistics audience region` | 观众地区分布 | getRegionDistribution |
| `statistics audience device` | 观众设备分布 | getDeviceDistribution |

**API 数量：5**

---

### 7. `statistics export` — 统计数据导出

| 子命令 | 作用 | API |
|--------|------|-----|
| `statistics export viewlog` | 导出观看日志 | getViewlog |
| `statistics export session` | 导出场次报表 | exportSessionStats |

**API 数量：2**

---

### 8. `player` — 播放器配置

| 子命令 | 作用 | API |
|--------|------|-----|
| `player config get` | 获取播放器配置 | getChannelDecorate |
| `player config update` | 更新播放器配置 | updateChannelDecorate |

**API 数量：2**

---

### 9. `playback` — 回放管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `playback list` | 列出回放 | listPlaybacks |
| `playback get` | 查看回放详情 | getPlaybackDetail |
| `playback delete` | 删除回放 | deletePlayback |
| `playback merge` | 合并回放 | mergePlayback |

**API 数量：4**

---

### 10. `document` — 文档管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `document list` | 列出文档 | getDocumentList |
| `document upload` | 上传文档 | uploadDocument |
| `document delete` | 删除文档 | deleteDocument |
| `document status` | 文档转换状态 | getDocumentStatus |

**API 数量：4**

---

### 11. `session` — 场次管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `session list` | 列出场次 | getSessionList |
| `session get` | 查看场次详情 | getSession |

**API 数量：2**

---

### 12. `record` — 录制设置

| 子命令 | 作用 | API |
|--------|------|-----|
| `record setting get` | 获取录制设置 | getPlaybackSetting |
| `record setting set` | 更新录制设置 | setPlaybackSetting |
| `record convert` | 录制转码 | recordConvert / recordConvertAsync |
| `record set-default` | 设置默认录制 | setRecordDefault |

**API 数量：4**

---

### 13. `checkin` — 签到管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `checkin start` | 发起签到 | startCheckin |
| `checkin list` | 签到列表 | listCheckins |
| `checkin result` | 签到结果 | getCheckinResult |
| `checkin sessions` | 签到场次 | listSessions |

**API 数量：4**

---

### 14. `qa` — 问答管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `qa send` | 发送问答 | sendQa |
| `qa list` | 问答列表 | listQa |
| `qa stop` | 停止问答 | stopQa |

**API 数量：3**

---

### 15. `questionnaire` — 问卷管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `questionnaire create` | 创建问卷 | createQuestionnaire |
| `questionnaire list` | 问卷列表 | listQuestionnaires |
| `questionnaire detail` | 问卷详情 | getQuestionnaireDetail |

**API 数量：3**

---

### 16. `lottery` — 抽奖管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `lottery create` | 创建抽奖 | createLotteryActivity |
| `lottery list` | 抽奖列表 | listLotteryActivities |
| `lottery get` | 抽奖详情 | getLotteryActivity |
| `lottery update` | 更新抽奖 | updateLotteryActivity |
| `lottery delete` | 删除抽奖 | deleteLotteryActivity |
| `lottery winners` | 中奖名单 | getWinnerDetail |
| `lottery records` | 抽奖记录 | listLottery |

**API 数量：7**

---

### 17. `donate` — 打赏管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `donate config get` | 获取打赏配置 | getDonateConfig |
| `donate config update` | 更新打赏配置 | updateDonateConfig |
| `donate list` | 打赏记录 | listRewardGift |

**API 数量：3**

---

### 18. `viewer` — 观众管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `viewer get` | 查看观众信息 | getViewerRecord |
| `viewer list` | 观众列表 | listViewerRecords |
| `viewer tag list` | 观众标签列表 | listViewerLabels |
| `viewer tag add` | 添加观众标签 | addViewersLabels |
| `viewer tag remove` | 移除观众标签 | removeViewersLabels |

**API 数量：5**

---

### 19. `chat` — 聊天消息 + 禁言踢人

| 子命令 | 作用 | API |
|--------|------|-----|
| `chat send` | 发送管理员消息 | sendAdminMessage |
| `chat list` | 消息列表 | listMessages |
| `chat delete` | 删除消息 | deleteMessage |
| `chat ban` | 禁言用户 | updateBannedViewer / updateBannedUser |
| `chat unban` | 解除禁言 | updateBannedViewer / updateBannedUser |
| `chat kick` | 踢出用户 | forbidKickUsers / forbidChannelKickUsers |
| `chat unkick` | 取消踢出 | forbidUnkickUsers / forbidChannelUnkickUsers |
| `chat banned list` | 禁言列表 | getChannelBannedList / getChannelBannedUserList |
| `chat kicked list` | 踢出列表 | getChannelKickedUserList |

**API 数量：13**

---

### 20. `watch-condition` — 观看条件

| 子命令 | 作用 | API |
|--------|------|-----|
| `watch-condition get` | 获取观看条件 | getWatchCondition |
| `watch-condition set` | 设置观看条件 | setWatchCondition |

**API 数量：2**

---

### 21. `whitelist` — 白名单管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `whitelist list` | 白名单列表 | getWhiteList |
| `whitelist add` | 添加白名单 | addWhiteList |
| `whitelist update` | 更新白名单 | updateWhiteList |
| `whitelist remove` | 删除白名单 | deleteWhiteList |

**API 数量：4**

---

### 22. `platform` — 平台设置

| 子命令 | 作用 | API |
|--------|------|-----|
| `platform get` | 获取账户信息 | getUserInfo |
| `platform switch get` | 获取开关配置 | getSwitchConfig |
| `platform switch update` | 更新开关配置 | updateSwitchConfig |
| `platform callback get` | 获取回调设置 | getCallbackSettings |
| `platform callback update` | 更新回调设置 | updateCallbackSettings |
| `platform setting get` | 获取全局设置 | getGlobalChannelSettings |
| `platform setting update` | 更新全局设置 | updateGlobalChannelSettings |

**API 数量：7**

---

### 23. `platform label` — 平台标签

| 子命令 | 作用 | API |
|--------|------|-----|
| `platform label list` | 标签列表 | listViewerLabels |
| `platform label create` | 创建标签 | createViewerLabel |
| `platform label update` | 更新标签 | updateViewerLabel |
| `platform label delete` | 删除标签 | deleteViewerLabel |

**API 数量：4**

---

### 24. `promotion` — 推广管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `promotion list` | 推广列表 | listPopularizations |
| `promotion create` | 创建推广 | batchCreatePopularizations |

**API 数量：2**

---

### 25. `card-push` — 卡片推送

| 子命令 | 作用 | API |
|--------|------|-----|
| `card-push list` | 卡片列表 | listCardPushes |
| `card-push create` | 创建卡片 | createCardPush |
| `card-push update` | 更新卡片 | updateCardPush |
| `card-push push` | 推送卡片 | pushCard |
| `card-push cancel` | 取消推送 | cancelPush |
| `card-push delete` | 删除卡片 | deleteCardPush |

**API 数量：6**

---

### 26. `transmit` — 转播管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `transmit create` | 创建转播频道 | batchCreateTransmitChannels |
| `transmit list` | 查看转播关联 | getTransmitAssociations |

**API 数量：2**

---

### 27. `ai digital-human` — AI 数字人

| 子命令 | 作用 | API |
|--------|------|-----|
| `ai digital-human list` | 数字人列表 | listDigitalHumans |
| `ai digital-human list-org` | 组织列表 | listOrganizations |
| `ai digital-human set-org` | 设置组织 | setOrganizations |

**API 数量：3**

---

### 28. `setup` — 场景初始化

| 子命令 | 作用 | API |
|--------|------|-----|
| `setup [scene]` | 快速搭建直播间 | 组合调用多个 API |

**API 数量：复合**（创建频道、配置推流、设置播放器等）

---

### 29. `config` — 配置管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `config set` | 交互式设置 | 无（本地） |
| `config show` | 显示配置 | 无 |
| `config get` | 获取配置项 | 无 |
| `config put` | 设置配置项 | 无 |
| `config unset` | 删除配置项 | 无 |
| `config clear` | 清空配置 | 无 |

**API 数量：0**（纯本地操作）

---

### 30. `account` — 账户管理

| 子命令 | 作用 | API |
|--------|------|-----|
| `account add` | 添加账户 | 无（本地） |
| `account remove` | 删除账户 | 无 |
| `account list` | 列出账户 | 无 |
| `account current` | 当前账户 | 无 |
| `account migrate` | 迁移账户 | 1（验证） |
| `account set-default` | 设置默认账户 | 无 |
| `account unset-default` | 取消默认账户 | 无 |

**API 数量：1**

---

### 31. `use` — 会话账户切换

| 子命令 | 作用 | API |
|--------|------|-----|
| `use [account-name]` | 切换会话账户 | 无（本地） |

**API 数量：0**（纯本地操作）

---

## API 数量排名

| 排名 | 命令 | API 数量 |
|------|------|---------|
| 1 | `chat` | 13 |
| 2 | `channel` | 6 |
| 3 | `stream` | 7 |
| 4 | `lottery` | 7 |
| 5 | `platform` | 7 |
| 6 | `card-push` | 6 |
| 7 | `product` | 4 |
| 8 | `playback` | 4 |
| 9 | `document` | 4 |
| 10 | `record` | 4 |
| 11 | `checkin` | 4 |
| 12 | `whitelist` | 4 |
| 13 | `platform label` | 4 |
| 14 | `viewer` | 5 |
| 15 | `statistics` | 5 |
| 16 | `coupon` | 3 |
| 17 | `qa` | 3 |
| 18 | `questionnaire` | 3 |
| 19 | `donate` | 3 |
| 20 | `ai digital-human` | 3 |
| 21 | `statistics export` | 2 |
| 22 | `player` | 2 |
| 23 | `session` | 2 |
| 24 | `watch-condition` | 2 |
| 25 | `transmit` | 2 |
| 26 | `promotion` | 2 |
| 27 | `account` | 1 |
| 28 | `config` | 0 |
| 29 | `use` | 0 |
| 30 | `monitor` | 0 |
| 31 | `setup` | 复合 |
