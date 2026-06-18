# PolyV Live CLI API 覆盖文档

本文档详细记录了 CLI 命令与底层 API 的对应关系，包括 API 路径 (endpoint) 和 API 文档路径。

API 文档列中的路径均相对于本仓库根目录解析的 `../document-center/docs/live/api`。`docs/api/` 只是本地兼容缓存，不作为事实来源。

## 总览

| 统计项 | 数量 |
|--------|------|
| CLI 命令总数 | 151 |
| CLI 服务封装方法 | 94 |
| SDK API 方法 (V3+V4) | 517 |

---

## 命令与 API 对应表

### 1. Channel (频道管理) - 7 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `channel create` | `v4Channel.create()` | `POST /live/v4/channel/create` | `v4/channel/basic_create.md` |
| `channel list` | `v4Channel.channelDetailList()` | `POST /live/v4/channel/detail-list` | `v4/channel/operate/channel_detail_list.md` |
| `channel get` | `v4Channel.getChannel()` | `POST /live/v4/channel/get` | `v4/channel/operate/get_channel.md` |
| `channel update` | `channel.updateChannel()` | `POST /live/v3/channel/basic/update` | `channel/operate/update_setting.md` |
| `channel delete` | `channel.batchDeleteChannels()` | `POST /live/v3/channel/basic/batch-delete` | `channel/operate/batch_delete_channels.md` |
| `channel batch-delete` | `channel.batchDeleteChannels()` | `POST /live/v3/channel/basic/batch-delete` | `channel/operate/batch_delete_channels.md` |

---

### 2. Stream (推流管理) - 8 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `stream get-key` | `channel.getPushUrl()` | `POST /live/v3/channel/stream/get-push-url` | `channel/operate/get_push_url.md` |
| `stream start` | `channel.setLiveStatus()` | `POST /live/v2/channels/{channelId}/live` | `channel/state/set_status_start.md` |
| `stream stop` | `channel.endLiveStatus()` | `POST /live/v2/channels/{channelId}/end` | `channel/state/set_status_end.md` |
| `stream status` | `channel.getStreams()` | `GET /live/v2/statistics/{channelId}/streams` | `channel/state/get_streams.md` |
| `stream push` | 本地 FFmpeg 推流 | - | - |
| `stream verify` | `channel.getStreams()` | `GET /live/v2/statistics/{channelId}/streams` | `channel/state/get_streams.md` |
| `stream monitor` | `channel.getStreams()` | `GET /live/v2/statistics/{channelId}/streams` | `channel/state/get_streams.md` |

---

### 3. Chat (聊天管理) - 12 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `chat send` | `chat.sendAdminMsg()` | `POST /live/v3/channel/chat/send` | `chat/message/send_message.md` |
| `chat list` | `chat.getHistoryPage()` | `GET /live/v3/user/chat/get-speak-list` | `chat/message/get-speak-list.md` |
| `chat delete` | `chat.delChat()` | `POST /live/v3/channel/chat/del-chat` | `chat/message/delete_message_by_id.md` |
| `chat ban` (频道级) | `chat.updateBannedUser()` | `POST /live/v3/channel/chat/banned-user` | `chat/banned/update_banned_user.md` |
| `chat ban` (全局) | `chat.updateBannedViewer()` | `POST /live/v3/user/chat/banned-user/update` | `chat/banned/update_user_banned_viewer.md` |
| `chat kick` (频道级) | `chat.forbidChannelKickUsers()` | `POST /live/v4/chat/channel/forbid/kick-users` | `chat/banned/forbid_channel_kick_users.md` |
| `chat kick` (全局) | `chat.forbidKickUsers()` | `POST /live/v4/chat/forbid/kick-users` | `chat/banned/forbid_kick_users.md` |
| `chat unkick` (频道级) | `chat.forbidChannelUnkickUsers()` | `POST /live/v4/chat/channel/forbid/unkick-users` | `chat/banned/forbid_channel_unkick_users.md` |
| `chat unkick` (全局) | `chat.forbidUnkickUsers()` | `POST /live/v4/chat/forbid/unkick-users` | `chat/banned/forbid_unkick_users.md` |
| `chat banned list` (用户) | `chat.getChannelBannedUserList()` | `GET /live/v3/user/chat/banned-user/list` | `chat/banned/get_channel_banned_user_list.md` |
| `chat banned list` (敏感词) | `chat.getChannelBannedList()` | `GET /live/v3/channel/chat/get-banned-list` | `chat/banned/get_channel_banned_list.md` |
| `chat kicked list` | `chat.getChannelKickedUserList()` | `POST /live/v3/channel/chat/list-kicked` | `chat/banned/get_channel_kicked_user_list.md` |

---

### 4. Statistics (统计数据) - 7 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `statistics view` | `statistics.getDailySummary()` | `GET /live/v2/statistics/{channelId}/summary` | `channel/viewdata/daily_summary.md` |
| `statistics concurrency` | `statistics.getConcurrencyData()` | `GET /live/v2/statistics/{channelId}/realtime` | `channel/viewdata/concurrency.md` |
| `statistics max-concurrent` | `statistics.getMaxConcurrent()` | `GET /live/v3/statistics/{channelId}/viewlog` | `channel/viewdata/viewlog_2.md` |
| `statistics audience region` | V4 统计接口 | `GET /live/v4/user/statistics/viewer/region` | `v4/statistics/summary_list.md` |
| `statistics audience device` | V4 统计接口 | `GET /live/v4/user/statistics/viewer/device` | `v4/statistics/summary_list.md` |

---

### 5. Product (商品管理) - 5 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `product list` (频道) | `channel.listChannelProducts()` | `GET /live/v3/channel/product/list` | `channel/operate/get_channel_product_list.md` |
| `product list` (平台) | V4 商品接口 | `GET /live/v4/user/product/list` | `v4/user/product/product_list.md` |
| `product add` | `channel.addChannelProduct()` | `POST /live/v3/channel/product/add` | `channel/operate/add_channel_product.md` |
| `product update` | `channel.updateChannelProduct()` | `POST /live/v3/channel/product/update` | `channel/operate/update_channel_product.md` |
| `product delete` | `channel.deleteChannelProduct()` | `POST /live/v3/channel/product/delete` | `channel/operate/delete_channel_product.md` |

---

### 6. Coupon (优惠券管理) - 4 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `coupon add` | `v4Platform.createCoupon()` | `POST /live/v4/user/coupon/create` | `v4/platform/user_coupon_create.md` |
| `coupon list` | `v4Platform.searchCoupons()` | `GET /live/v4/user/coupon/search` | `v4/platform/user_coupon_search.md` |
| `coupon delete` | `v4Platform.deleteCouponsBatch()` | `POST /live/v4/user/coupon/delete-batch` | `v4/platform/user_coupon_delete_batch.md` |

---

### 7. Playback (回放管理) - 5 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `playback list` | `channel.getPlaybackList()` | `GET /live/v2/channel/recordFile/{channelId}/playback/list` | `channel/playback/get_playback_list.md` |
| `playback get` | `channel.getPlaybackList()` | `GET /live/v2/channel/recordFile/{channelId}/playback/list` | `channel/playback/get_playback_list.md` |
| `playback delete` | `channel.deletePlayback()` | `POST /live/v2/channel/recordFile/{channelId}/playback/delete` | `channel/playback/delete_playback.md` |
| `playback merge` | `channel.mergeRecordFile()` | `POST /live/v3/channel/recordFile/merge` | `channel/playback/record_file_merge.md` |

---

### 8. Record (录制设置) - 6 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `record setting get` | `channel.getPlaybackSetting()` | `GET /live/v3/channel/playback/setting` | `channel/playback/get_playback_setting.md` |
| `record setting set` | `channel.setPlaybackSetting()` | `POST /live/v3/channel/playback/setting` | `channel/playback/set_record_setting.md` |
| `record convert` | V4 转存接口 | `POST /live/v4/channel/record/convert` | `channel/playback/record_convert.md` |
| `record set-default` | `channel.setDefaultPlayback()` | `POST /live/v3/channel/playback/set-default` | `channel/playback/set_record_default.md` |

---

### 9. Platform (平台管理) - 11 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `platform get` | `account.getUserInfo()` | `GET /live/v3/user/basic/info` | `account/get_user_info.md` |
| `platform switch get` | `account.getSwitchConfig()` | `GET /live/v3/user/switch/get` | `account/switch_get.md` |
| `platform switch update` | `account.updateSwitchConfig()` | `POST /live/v3/user/switch/update` | `account/switch_update.md` |
| `platform callback get` | `account.getCallbackUrl()` | `GET /live/v3/user/callback-url` | `v4/user/get_callback.md` |
| `platform callback update` | `account.setCallbackUrl()` | `POST /live/v3/user/callback-url` | `v4/user/update_callback.md` |
| `platform setting get` | `account.getGlobalChannelSettings()` | `GET /live/v3/user/global/setting` | `v4/user/get_global_switch.md` |
| `platform setting update` | `account.updateGlobalChannelSettings()` | `POST /live/v3/user/global/setting` | `v4/user/update_global_switch.md` |

---

### 10. Platform Label (平台标签) - 5 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `platform label list` | `user.listViewerLabels()` | `GET /live/v4/user/viewer-label/list` | `v4/user/viewerrecord/label/list.md` |
| `platform label create` | `user.createViewerLabel()` | `POST /live/v4/user/viewer-label/create` | `v4/user/viewerrecord/label/create.md` |
| `platform label update` | `user.updateViewerLabel()` | `PUT /live/v4/user/viewer-label/update` | `v4/user/viewerrecord/label/update.md` |
| `platform label delete` | `user.deleteViewerLabel()` | `DELETE /live/v4/user/viewer-label/delete` | `v4/user/viewerrecord/label/delete.md` |

---

### 11. Checkin (签到管理) - 5 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `checkin start` | `liveInteraction.startCheckin()` | `POST /live/v2/chat/{channelId}/start_checkin` | `live_interaction/get_checkin_list.md` |
| `checkin list` | `liveInteraction.getCheckinList()` | `GET /live/v2/chat/{channelId}/get_checkin_list` | `live_interaction/get_checkin_by_time.md` |
| `checkin result` | `liveInteraction.getCheckinResult()` | `GET /live/v2/chat/{channelId}/checkin_result` | `live_interaction/get_checkin_by_checkid.md` |
| `checkin sessions` | `channel.getSessions()` | `GET /live/v2/channel/recordFile/{channelId}/sessions` | `channel/playback/get_channel_sessions.md` |

---

### 12. Lottery (抽奖管理) - 8 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `lottery create` | V4 抽奖接口 | `POST /live/v4/channel/lottery/create` | `v4/channel/lottery_activity/lottery_activity_create.md` |
| `lottery list` | V4 抽奖接口 | `GET /live/v4/channel/lottery/list` | `v4/channel/lottery_activity/lottery_activity_list.md` |
| `lottery get` | V4 抽奖接口 | `GET /live/v4/channel/lottery/get` | `v4/channel/lottery_activity/lottery_activity_get.md` |
| `lottery update` | V4 抽奖接口 | `POST /live/v4/channel/lottery/update` | `v4/channel/lottery_activity/lottery_activity_update.md` |
| `lottery delete` | V4 抽奖接口 | `POST /live/v4/channel/lottery/delete` | `v4/channel/lottery_activity/lottery_activity_delete.md` |
| `lottery winners` | V4 抽奖接口 | `GET /live/v4/channel/lottery/winners` | `v4/channel/lottery/query_winner_viewer.md` |
| `lottery records` | `liveInteraction.getLotteryRecord()` | `GET /live/v2/chat/{channelId}/get_lottery_record` | `live_interaction/list_lottery.md` |

---

### 13. QA (问答管理) - 4 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `qa send` | `liveInteraction.sendQuestion()` | `POST /live/v2/chat/{channelId}/send_question` | `live_interaction/send_question.md` |
| `qa list` | `liveInteraction.getQuestionList()` | `GET /live/v2/chat/{channelId}/get_question_list` | `live_interaction/get_question_list.md` |
| `qa stop` | `liveInteraction.stopQuestion()` | `POST /live/v2/chat/{channelId}/stop_question` | `live_interaction/stop_question.md` |

---

### 14. Questionnaire (问卷管理) - 4 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `questionnaire create` | V4 问卷接口 | `POST /live/v4/channel/questionnaire/create` | `live_interaction/create_questionnaire.md` |
| `questionnaire list` | V4 问卷接口 | `GET /live/v4/channel/questionnaire/list` | `live_interaction/list_questionaire.md` |
| `questionnaire detail` | V4 问卷接口 | `GET /live/v4/channel/questionnaire/detail` | `live_interaction/get_questionnaire_detail.md` |

---

### 15. Donate (打赏管理) - 5 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `donate config get` | V4 打赏配置 | `GET /live/v4/channel/donate/get` | `v4/channel/donate/get.md` |
| `donate config update` | V4 打赏配置 | `POST /live/v4/channel/donate/update` | `v4/channel/donate/update.md` |
| `donate list` | V4 打赏记录 | `GET /live/v4/channel/donate/records` | `donate/donateSettings.md` |

---

### 16. Viewer (观众管理) - 7 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `viewer get` | `user.getViewerDetail()` | `GET /live/v4/user/viewer/detail` | `v4/user/viewerrecord/get.md` |
| `viewer list` | `user.listViewer()` | `GET /live/v4/user/viewer/list` | `v4/user/viewerrecord/list.md` |
| `viewer tag list` | `user.listViewerLabels()` | `GET /live/v4/user/viewer-label/list` | `v4/user/viewerrecord/label/list.md` |
| `viewer tag add` | `user.addViewersLabels()` | `POST /live/v4/user/viewer-label/add` | `v4/user/viewerrecord/label/add_viewer_label.md` |
| `viewer tag remove` | `user.removeViewersLabels()` | `POST /live/v4/user/viewer-label/remove` | `v4/user/viewerrecord/label/del_viewer_label.md` |

---

### 17. Document (文档管理) - 5 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `document list` | `channel.getDocList()` | `POST /live/v3/channel/document/doc-list` | `channel/doc/get_doc_list.md` |
| `document upload` | `channel.uploadDoc()` | `POST /live/v3/channel/document/upload-doc` | `channel/doc/upload_doc.md` |
| `document delete` | `channel.deleteDoc()` | `POST /live/v3/channel/document/delete` | `channel/doc/delete_document.md` |
| `document status` | `channel.getDocConvertStatus()` | `POST /live/v3/channel/document/status/get` | `channel/doc/get_doc_convert_status.md` |

---

### 18. Player (播放器配置) - 4 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `player config get` | `player.getChannelDecorate()` | `GET /live/v3/channel/player/get-decorate` | `player/player_backstage_param.md` |
| `player config update` | `player.updateChannelDecorate()` | `POST /live/v3/channel/player/update-decorate` | `player/player_backstage_param.md` |

---

### 19. Session (场次管理) - 3 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `session list` | `channel.getSessions()` | `GET /live/v2/channel/recordFile/{channelId}/sessions` | `channel/playback/get_channel_sessions.md` |
| `session get` | `channel.getSessionDetail()` | `GET /live/v3/channel/session/get` | `v4/channel/session/new/get.md` |

---

### 20. Whitelist (白名单管理) - 5 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `whitelist list` | `channel.getWhiteList()` | `GET /live/v3/channel/auth/white-list` | `web/watch_condition/get_white_list.md` |
| `whitelist add` | `channel.addWhiteList()` | `POST /live/v3/channel/auth/white-list/add` | `web/watch_condition/add_white_list.md` |
| `whitelist update` | `channel.updateWhiteList()` | `POST /live/v3/channel/auth/white-list/update` | `web/watch_condition/update_white_list.md` |
| `whitelist remove` | `channel.deleteWhiteList()` | `POST /live/v3/channel/auth/white-list/delete` | `web/watch_condition/delete_white_list.md` |

---

### 21. Watch Condition (观看条件) - 3 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `watch-condition get` | `channel.getAuthSetting()` | `GET /live/v3/channel/auth/get` | `web/watch_condition/get_watch_condition.md` |
| `watch-condition set` | `channel.updateAuthSetting()` | `POST /live/v3/channel/auth/update` | `web/watch_condition/set_watch_condition.md` |

---

### 22. Promotion (推广链接) - 3 命令

| 命令 | SDK 方法 | API Endpoint | API 文档 |
|------|----------|--------------|---------|
| `promotion list` | `channel.getPopularizations()` | `GET /live/v4/channel/popularization/list` | `v4/channel/popularization/popularization_list.md` |
| `promotion create` | `channel.batchCreatePopularizations()` | `POST /live/v4/channel/popularization/batch-create` | `v4/channel/popularization/batch_create_popularization.md` |

---

### 23. Monitor (直播监控) - 8 命令

| 命令 | 类型 | 说明 | API 文档 |
|------|------|------|---------|
| `monitor status` | 本地 | 显示监控状态 | - |
| `monitor config` | 本地 | 配置监控参数 | - |
| `monitor layouts` | 本地 | 显示可用布局 | - |
| `monitor themes` | 本地 | 显示可用主题 | - |
| `monitor test` | 本地 | 测试监控功能 | - |
| `monitor export` | 本地 | 导出监控配置 | - |
| `monitor import` | 本地 | 导入监控配置 | - |

---

### 24. Account (账户管理) - 8 命令

| 命令 | 类型 | 说明 | API 文档 |
|------|------|------|---------|
| `account add` | 本地 | 添加账户到本地配置 | - |
| `account remove` | 本地 | 从本地配置移除账户 | - |
| `account list` | 本地 | 列出本地存储的账户 | - |
| `account current` | 本地 | 显示当前使用的账户 | - |
| `account migrate` | 本地 | 迁移账户配置 | - |
| `account set-default` | 本地 | 设置默认账户 | - |
| `account unset-default` | 本地 | 取消默认账户 | - |

---

### 25. Config (配置管理) - 7 命令

| 命令 | 类型 | 说明 | API 文档 |
|------|------|------|---------|
| `config set` | 本地 | 设置配置项到本地文件 | - |
| `config show` | 本地 | 显示本地配置 | - |
| `config get` | 本地 | 获取本地配置值 | - |
| `config put` | 本地 | 设置配置键值 | - |
| `config unset` | 本地 | 删除本地配置项 | - |
| `config clear` | 本地 | 清除所有本地配置 | - |

---

### 26. Use (切换账户) - 1 命令

| 命令 | 类型 | 说明 | API 文档 |
|------|------|------|---------|
| `use [account-name]` | 本地 | 切换当前使用的账户 | - |

---

### 27. Setup (场景初始化) - 1 命令

| 命令 | 类型 | 说明 | API 文档 |
|------|------|------|---------|
| `setup [scene]` | 综合操作 | 初始化直播场景（调用多个API） | 多个 API 组合 |

---

## API 版本说明

### V2 API (旧版)
- 路径格式: `/live/v2/...`
- 主要用于: 基础频道操作、统计查询
- 文档目录: `channel/`

### V3 API (稳定版)
- 路径格式: `/live/v3/...`
- 主要用于: 频道管理、文档管理、认证设置
- 文档目录: `channel/`, `chat/`

### V4 API (新版)
- 路径格式: `/live/v4/...`
- 主要用于: 优惠券、抽奖、问卷、观众管理、推广链接
- 文档目录: `v4/`

---

## 服务层方法与 API 路径对照

### CLI Services (`packages/cli/src/services/`)

| 服务文件 | 方法 | API Endpoint | API 文档 |
|---------|------|-------------|---------|
| **channel.service.sdk.ts** | | | |
| | createChannel | POST /live/v4/channel/create | `v4/channel/basic_create.md` |
| | listChannels | POST /live/v4/channel/detail-list | `v4/channel/operate/channel_detail_list.md` |
| | getChannelDetail | POST /live/v4/channel/get | `v4/channel/operate/get_channel.md` |
| | updateChannel | POST /live/v3/channel/basic/update | `channel/operate/update_setting.md` |
| | deleteChannel | POST /live/v3/channel/basic/batch-delete | `channel/operate/batch_delete_channels.md` |
| | batchDeleteChannels | POST /live/v3/channel/basic/batch-delete | `channel/operate/batch_delete_channels.md` |
| **chat.service.sdk.ts** | | | |
| | sendAdminMessage | POST /live/v3/channel/chat/send | `chat/message/send_message.md` |
| | listMessages | GET /live/v3/user/chat/get-speak-list | `chat/message/get-speak-list.md` |
| | deleteMessage | POST /live/v3/channel/chat/del-chat | `chat/message/delete_message_by_id.md` |
| | updateBannedUser | POST /live/v3/channel/chat/banned-user | `chat/banned/update_banned_user.md` |
| | updateBannedViewer | POST /live/v3/user/chat/banned-user/update | `chat/banned/update_user_banned_viewer.md` |
| | forbidChannelKickUsers | POST /live/v4/chat/channel/forbid/kick-users | `chat/banned/forbid_channel_kick_users.md` |
| | forbidKickUsers | POST /live/v4/chat/forbid/kick-users | `chat/banned/forbid_kick_users.md` |
| | forbidChannelUnkickUsers | POST /live/v4/chat/channel/forbid/unkick-users | `chat/banned/forbid_channel_unkick_users.md` |
| | forbidUnkickUsers | POST /live/v4/chat/forbid/unkick-users | `chat/banned/forbid_unkick_users.md` |
| | getChannelBannedUserList | GET /live/v3/user/chat/banned-user/list | `chat/banned/get_channel_banned_user_list.md` |
| | getChannelBannedList | GET /live/v3/channel/chat/get-banned-list | `chat/banned/get_channel_banned_list.md` |
| | getChannelKickedUserList | POST /live/v3/channel/chat/list-kicked | `chat/banned/get_channel_kicked_user_list.md` |
| **statistics.service.sdk.ts** | | | |
| | getDailyViewStatistics | GET /live/v2/statistics/{channelId}/summary | `channel/viewdata/daily_summary.md` |
| | getConcurrencyData | GET /live/v2/statistics/{channelId}/realtime | `channel/viewdata/concurrency.md` |
| | getMaxConcurrent | GET /live/v3/statistics/{channelId}/viewlog | `channel/viewdata/viewlog_2.md` |
| | getRegionDistribution | GET /live/v4/user/statistics/viewer/region | `v4/statistics/summary_list.md` |
| **product.service.sdk.ts** | | | |
| | listProducts | GET /live/v3/channel/product/list | `channel/operate/get_channel_product_list.md` |
| | addProduct | POST /live/v3/channel/product/add | `channel/operate/add_channel_product.md` |
| | updateProduct | POST /live/v3/channel/product/update | `channel/operate/update_channel_product.md` |
| | deleteProduct | POST /live/v3/channel/product/delete | `channel/operate/delete_channel_product.md` |
| **playback.service.sdk.ts** | | | |
| | getPlaybackList | GET /live/v2/channel/recordFile/{channelId}/playback/list | `channel/playback/get_playback_list.md` |
| | deletePlayback | POST /live/v2/channel/recordFile/{channelId}/playback/delete | `channel/playback/delete_playback.md` |
| | mergePlayback | POST /live/v3/channel/recordFile/merge | `channel/playback/record_file_merge.md` |
| **document.service.sdk.ts** | | | |
| | getDocumentList | POST /live/v3/channel/document/doc-list | `channel/doc/get_doc_list.md` |
| | uploadDocument | POST /live/v3/channel/document/upload-doc | `channel/doc/upload_doc.md` |
| | deleteDocument | POST /live/v3/channel/document/delete | `channel/doc/delete_document.md` |
| | getDocumentStatus | POST /live/v3/channel/document/status/get | `channel/doc/get_doc_convert_status.md` |
| **stream.service.sdk.ts** | | | |
| | getStreamKey | POST /live/v3/channel/stream/get-push-url | `channel/operate/get_push_url.md` |
| | startStream | POST /live/v2/channels/{channelId}/live | `channel/state/set_status_start.md` |
| | stopStream | POST /live/v2/channels/{channelId}/end | `channel/state/set_status_end.md` |
| | getStreamStatus | GET /live/v2/statistics/{channelId}/streams | `channel/state/get_streams.md` |

---

## 覆盖率分析

CLI 命令通过服务封装覆盖了 **94 个核心 API 方法**，涉及 **~60 个不同的 API Endpoints**。

按 API 版本分布:
- V2 API: ~10 个端点
- V3 API: ~30 个端点
- V4 API: ~20 个端点

按模块分布 (来自 `docs/api-reference/MODULE_DOC_MAPPING.json`；具体 API 文档默认位于相对于本仓库根目录解析的 `../document-center/docs/live/api`):

| 模块 | API 数量 | CLI 覆盖 |
|------|---------|---------|
| channel | 35 | ✅ |
| chat | 45 | ✅ |
| product | 35 | ✅ |
| playback | 26 | ✅ |
| statistics | 30 | ✅ |
| coupon | 9 | ✅ |
| lottery | 18 | ✅ |
| viewer | 18 | ✅ |
| document | 11 | ✅ |
| interaction | 30 | ✅ (部分) |
| account | 28 | ✅ |
| globalSetting | 14 | ✅ |

---

*文档生成时间: 2026-03-25*
