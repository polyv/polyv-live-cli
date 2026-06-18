# PolyV Live API 文档索引

> 本文件是 polyv-live-cli 仓库维护的项目侧索引，不是原始 API 文档。
> API 文档根目录为 `../document-center/docs/live/api`，该路径相对于本仓库根目录解析；例如 `channel/operate/create.md` 对应本仓库同级目录下的 `document-center/docs/live/api/channel/operate/create.md`。

> 本文档按业务模块分类整理所有 API，方便 CLI 命令实现。

---

## 模块概览

| 模块 | 路径 | API 数量 | 描述 |
|------|------|----------|------|
| [Account](#account-账户管理) | `account/` | 27 | 账户管理、分类、SSO |
| [Callback](#callback-回调通知) | `callback/` | 22 | 各类事件回调 |
| [Channel](#channel-频道管理) | `channel/` | 110 | 频道 CRUD、推流、回放等 |
| [Chat](#chat-聊天管理) | `chat/` | 23 | 聊天消息、禁言、审核 |
| [V4/Channel](#v4channel-v4频道) | `v4/channel/` | 130+ | V4 版本频道相关 API |
| [V4/User](#v4user-v4用户) | `v4/user/` | 50+ | V4 版本用户相关 API |
| [V4/Other](#v4other-v4其他) | `v4/` | 40+ | V4 其他模块 |
| [Web](#web-web端设置) | `web/` | 35 | 页面设置、观看条件 |
| [Platform](#platform-平台) | `platform/` | 8 | 主播、内容分组 |
| [Player](#player-播放器) | `player/` | 10 | 播放器设置、跑马灯 |
| [Finance](#finance-财务) | `finance/` | 6 | 账单、内容审核 |
| [Group](#group-集团账号) | `group/` | 5 | 集团账号管理 |
| [Live Interaction](#live_interaction-直播互动) | `live_interaction/` | 28 | 问答、签到、抽奖 |
| [V5](#v5-api) | `v5/` | 1 | V5 版本 API |
| [Other](#other-其他) | 根目录 | 10+ | 签名、密钥等 |

---

## Account (账户管理)

路径: `account/` | 数量: 27

| 文件 | 功能描述 |
|------|----------|
| `channels.md` | 获取频道列表 |
| `channel_detail.md` | 获取频道详情 |
| `get_user_info.md` | 获取用户信息 |
| `get_user_durations.md` | 获取用户时长 |
| `user_channel_basic_list.md` | 用户频道基础列表 |
| `user_playback_list.md` | 用户回放列表 |
| `get_simple_channel_list.md` | 获取简单频道列表 |
| `create_category.md` | 创建分类 |
| `delete_category.md` | 删除分类 |
| `get_category_list.md` | 获取分类列表 |
| `update_category_name.md` | 更新分类名称 |
| `update_category_rank.md` | 更新分类排序 |
| `get_income_detail.md` | 获取收益明细 |
| `receive_list.md` | 收益列表 |
| `mic_duration.md` | 连麦时长 |
| `sso.md` | SSO 单点登录 |
| `sso_manager.md` | SSO 管理员 |
| `set_user_login_token.md` | 设置用户登录 Token |
| `set_user_children_login_token.md` | 设置子账号登录 Token |
| `set_stream_callback.md` | 设置推流回调 |
| `set_record_callback.md` | 设置录制回调 |
| `set_playback_callback.md` | 设置回放回调 |
| `switch_get.md` | 获取开关状态 |
| `switch_update.md` | 更新开关状态 |
| `web_start_client.md` | Web 启动客户端 |
| `demo.md` | Demo |

---

## Callback (回调通知)

路径: `callback/` | 数量: 22

| 文件 | 功能描述 |
|------|----------|
| `live_status_callback.md` | 直播状态回调 |
| `livestatus_callback.md` | 直播状态回调 |
| `record_callback.md` | 录制回调 |
| `playback_callback.md` | 回放回调 |
| `live_record_audio_audit_callback.md` | 直播录制音频审核回调 |
| `live_violation_cut_off_callback.md` | 直播违规切断回调 |
| `livescan_callback.md` | 直播扫描回调 |
| `speak_callback.md` | 发言回调 |
| `feedback_callback.md` | 反馈回调 |
| `interaction_callback.md` | 互动回调 |
| `subtitle_callback.md` | 字幕回调 |
| `subtitle_content_callback.md` | 字幕内容回调 |
| `key_info_callback.md` | 关键信息回调 |
| `member_status_callback.md` | 会员状态回调 |
| `page_event.md` | 页面事件回调 |
| `ppt_record_callback.md` | PPT 录制回调 |
| `push_info_callback.md` | 推送信息回调 |
| `activity_change_callback.md` | 活动变更回调 |
| `channel_booking_callback.md` | 频道预约回调 |
| `coupon_receive_callback.md` | 优惠券领取回调 |
| `ai_ppt_video_callback.md` | AI PPT 视频回调 |
| `invite_qrcode_url_get.md` | 邀请二维码 URL 获取 |

---

## Channel (频道管理)

路径: `channel/` | 数量: 110

### 子模块: auth (认证)

| 文件 | 功能描述 |
|------|----------|
| `get_channel_api_access_token.md` | 获取频道 API 访问 Token |
| `get_channel_watch_test_mode_token.md` | 获取频道观看测试模式 Token |

### 子模块: doc (文档)

| 文件 | 功能描述 |
|------|----------|
| `get_doc_list.md` | 获取文档列表 |
| `upload_doc.md` | 上传文档 |
| `delete_document.md` | 删除文档 |
| `get_doc_convert_status.md` | 获取文档转换状态 |
| `get_channel_multimedia_resource.md` | 获取频道多媒体资源 |
| `get_channel_multimedia_resource_detail.md` | 获取频道多媒体资源详情 |
| `link_channel_multimedia_resource.md` | 关联频道多媒体资源 |
| `del_channel_multimedia_resource.md` | 删除频道多媒体资源 |
| `get_user_multimedia_resource_detail.md` | 获取用户多媒体资源详情 |
| `del_user_multimedia_resource.md` | 删除用户多媒体资源 |
| `update_teacher_doc_relation.md` | 更新讲师文档关联 |

### 子模块: marquee (跑马灯)

| 文件 | 功能描述 |
|------|----------|
| `set_diyurl-marquee.md` | 设置自定义 URL 跑马灯 |

### 子模块: monitor (监控)

| 文件 | 功能描述 |
|------|----------|
| `pull_hls_url.md` | 拉取 HLS URL |

### 子模块: operate (操作)

| 文件 | 功能描述 |
|------|----------|
| `create.md` | 创建频道 |
| `basic_create.md` | 基础创建频道 |
| `batch_create.md` | 批量创建频道 |
| `batch_create_channels.md` | 批量创建频道 |
| `delete_channel.md` | 删除频道 |
| `batch_delete_channels.md` | 批量删除频道 |
| `copy_channel.md` | 复制频道 |
| `get_channel_detail.md` | 获取频道详情 |
| `get_channel_detail_setting.md` | 获取频道详情设置 |
| `update_setting.md` | 更新设置 |
| `update_channel_detail_setting.md` | 更新频道详情设置 |
| `get_api_token.md` | 获取 API Token |
| `get_watch_api_token.md` | 获取观看 API Token |
| `get_chat_token.md` | 获取聊天 Token |
| `get_push_url.md` | 获取推流 URL |
| `get_capture_image.md` | 获取截图 |
| `get_callback_setting.md` | 获取回调设置 |
| `add_account.md` | 添加账号 |
| `get_account.md` | 获取账号 |
| `get_accounts.md` | 获取账号列表 |
| `update_account.md` | 更新账号 |
| `delete_account.md` | 删除账号 |
| `set_account_token.md` | 设置账号 Token |
| `update_password.md` | 更新密码 |
| `set_max_viewer.md` | 设置最大观看人数 |
| `set_token_1.md` | 设置 Token |
| `update_stream_type.md` | 更新流类型 |
| `add_channel_product.md` | 添加频道商品 |
| `batch_add_channel_product.md` | 批量添加频道商品 |
| `get_channel_product_list.md` | 获取频道商品列表 |
| `get_channel_product_enabled.md` | 获取频道商品启用状态 |
| `update_channel_product.md` | 更新频道商品 |
| `update_channel_product_enabled.md` | 更新频道商品启用状态 |
| `delete_channel_product.md` | 删除频道商品 |
| `batch_delete_channel_product.md` | 批量删除频道商品 |
| `shelf_channel_product.md` | 上架频道商品 |
| `batch_shelf_channel_product.md` | 批量上架频道商品 |
| `push_channel_product.md` | 推送频道商品 |
| `cancel_push_channel_product.md` | 取消推送频道商品 |
| `sort_channel_product.md` | 排序频道商品 |
| `reference_product.md` | 引用商品 |
| `get_channel_adverts.md` | 获取频道广告 |
| `ppt_get_setting.md` | 获取 PPT 设置 |
| `ppt_setting.md` | 设置 PPT |
| `pptrecord_list.md` | PPT 录制列表 |
| `get_pptrecord_setting.md` | 获取 PPT 录制设置 |
| `update_pptrecord_setting.md` | 更新 PPT 录制设置 |
| `delete_pptrecord.md` | 删除 PPT 录制 |
| `add_record_task.md` | 添加录制任务 |
| `add_disk_videos.md` | 添加盘片视频 |
| `add_disk_videos-2.md` | 添加盘片视频 v2 |
| `delete_disk_videos.md` | 删除盘片视频 |
| `end_disk_video.md` | 结束盘片视频 |
| `chat_online_count.md` | 聊天在线人数 |
| `get_chat_online_count.md` | 获取聊天在线人数 |
| `remove_chat_contents.md` | 移除聊天内容 |
| `get_transmit_associations.md` | 获取转播关联 |
| `batch_add_transmit.md` | 批量添加转播 |
| `association_receive_channels.md` | 关联接收频道 |
| `batch_add_submeeting.md` | 批量添加子会议 |
| `get_user_children_channels.md` | 获取子账号频道 |
| `list_channels_follow.md` | 频道关注列表 |
| `update_channels_follow.md` | 更新频道关注 |
| `channels_stop_questionnaire.md` | 频道停止问卷 |

### 子模块: playback (回放)

| 文件 | 功能描述 |
|------|----------|
| `get_playback_list.md` | 获取回放列表 |
| `get_playback_setting.md` | 获取回放设置 |
| `set_playback_enabled.md` | 设置回放启用 |
| `get_playback_enabled.md` | 获取回放启用状态 |
| `delete_playback.md` | 删除回放 |
| `update_playback_title.md` | 更新回放标题 |
| `set_playback_sort.md` | 设置回放排序 |
| `set_playback_single_sort.md` | 设置单个回放排序 |
| `add_vod_playback.md` | 添加点播回放 |
| `get_channel_sessions.md` | 获取频道场次 |
| `get_record_file.md` | 获取录制文件 |
| `get_record_info.md` | 获取录制信息 |
| `delete_record.md` | 删除录制 |
| `set_record_default.md` | 设置默认录制 |
| `set_record_setting.md` | 设置录制设置 |
| `record_convert.md` | 录制转换 |
| `record_convert_async.md` | 异步录制转换 |
| `record_file_merge.md` | 录制文件合并 |
| `record_file_merge_async.md` | 异步录制文件合并 |
| `record_merge_mp4.md` | 合并 MP4 |
| `record_merge_mp4_start.md` | 开始合并 MP4 |
| `record_add_breakpoint.md` | 添加断点录制 |
| `clip_record_file.md` | 剪辑录制文件 |

### 子模块: player (播放器)

| 文件 | 功能描述 |
|------|----------|
| `update_logo.md` | 更新 Logo |
| `update_head.md` | 更新头部 |
| `update_stop.md` | 更新停止 |

### 子模块: session (场次)

| 文件 | 功能描述 |
|------|----------|
| `session_list.md` | 场次列表 |
| `get_session-by-external.md` | 通过外部 ID 获取场次 |
| `list_file_id_by_external.md` | 通过外部 ID 列出文件 ID |
| `relevance-session-by-external.md` | 通过外部 ID 关联场次 |
| `export_session_stats.md` | 导出场次统计 |

### 子模块: state (状态)

| 文件 | 功能描述 |
|------|----------|
| `get_live_status.md` | 获取直播状态 |
| `get_live_status_list.md` | 获取直播状态列表 |
| `get_stream_info.md` | 获取流信息 |
| `get_streams.md` | 获取流列表 |
| `list_disk_video.md` | 盘片视频列表 |
| `set_status_start.md` | 设置状态开始 |
| `set_status_end.md` | 设置状态结束 |
| `live_banpush.md` | 直播禁止推流 |
| `live_resume.md` | 直播恢复 |
| `end_disk_push.md` | 结束盘片推流 |

### 子模块: statistics (统计)

| 文件 | 功能描述 |
|------|----------|
| `get_product_list_stats.md` | 获取商品列表统计 |
| `get_product_click_stats.md` | 获取商品点击统计 |
| `get_redpack_stats.md` | 获取红包统计 |

### 子模块: viewdata (观看数据)

| 文件 | 功能描述 |
|------|----------|
| `channel_statistic.md` | 频道统计 |
| `channel_play_summary.md` | 频道播放摘要 |
| `daily_summary.md` | 每日摘要 |
| `summary.md` | 摘要 |
| `concurrency.md` | 并发 |
| `get_max_history_concurrent.md` | 获取历史最大并发 |
| `get_realtime_viewers.md` | 获取实时观看人数 |
| `realviewers.md` | 实时观众 |
| `get_session_stats.md` | 获取场次统计 |
| `viewlog_page.md` | 观看日志分页 |
| `viewlog_page_v3.md` | 观看日志分页 v3 |
| `viewlog_2.md` | 观看日志 v2 |
| `mic_detail_list.md` | 连麦详情列表 |
| `link_mic_detail_list.md` | 连麦详情列表 |

### 子模块: warmup (预热)

| 文件 | 功能描述 |
|------|----------|
| `update_warmup_switch.md` | 更新预热开关 |
| `update_warmup_image.md` | 更新预热图片 |
| `update_warmup_video.md` | 更新预热视频 |

---

## Chat (聊天管理)

路径: `chat/` | 数量: 23

### 子模块: banned (禁言管理)

| 文件 | 功能描述 |
|------|----------|
| `get_channel_banned_list.md` | 获取频道禁言列表 |
| `get_channel_banned_user_list.md` | 获取频道禁言用户列表 |
| `get_channel_kicked_user_list.md` | 获取频道踢出用户列表 |
| `get_forbid_user_list.md` | 获取禁止用户列表 |
| `get_user_banned_list.md` | 获取用户禁言列表 |
| `get_user_badword_list.md` | 获取用户敏感词列表 |
| `add_badwords.md` | 添加敏感词 |
| `delete_user_badword.md` | 删除用户敏感词 |
| `add_banned_ip.md` | 添加禁言 IP |
| `delete_channel_banned.md` | 删除频道禁言 |
| `update_banned_user.md` | 更新禁言用户 |
| `update_user_banned_viewer.md` | 更新用户禁言观众 |
| `forbid_kick_users.md` | 禁止踢出用户 |
| `forbid_unkick_users.md` | 取消禁止踢出用户 |
| `forbid_channel_kick_users.md` | 频道禁止踢出用户 |
| `forbid_channel_unkick_users.md` | 频道取消禁止踢出用户 |

### 子模块: censor (审核)

| 文件 | 功能描述 |
|------|----------|
| `update_censor_enabled.md` | 更新审核启用状态 |

### 子模块: message (消息)

| 文件 | 功能描述 |
|------|----------|
| `get_message_list.md` | 获取消息列表 |
| `get-speak-list.md` | 获取发言列表 |
| `send_message.md` | 发送消息 |
| `send_hidden_message.md` | 发送隐藏消息 |
| `send_hidden_message_by_admin.md` | 管理员发送隐藏消息 |
| `delete_message_by_id.md` | 按 ID 删除消息 |
| `delete_all_message.md` | 删除所有消息 |
| `message_audit.md` | 消息审核 |
| `chat_alert_to_special.md` | 聊天提醒特定用户 |

### 子模块: role (角色)

| 文件 | 功能描述 |
|------|----------|
| `get_user_list.md` | 获取用户列表 |
| `get_admin_info.md` | 获取管理员信息 |
| `get_teacher_info.md` | 获取讲师信息 |
| `update_admin_info.md` | 更新管理员信息 |
| `update_teacher_info.md` | 更新讲师信息 |

---

## V4/Channel (V4频道)

路径: `v4/channel/` | 数量: 130+

### 基础操作

| 文件 | 功能描述 |
|------|----------|
| `create.md` | 创建频道 |
| `basic_create.md` | 基础创建 |
| `create_batch.md` | 批量创建 |
| `create_mr.md` | 创建 MR |
| `update.md` | 更新频道 |

### operate (操作)

| 文件 | 功能描述 |
|------|----------|
| `operate/get_channel.md` | 获取频道 |
| `operate/get_channel_detail.md` | 获取频道详情 |
| `operate/channel_basic_list.md` | 频道基础列表 |
| `operate/channel_simple_list.md` | 频道简单列表 |
| `operate/channel_detail_list.md` | 频道详情列表 |
| `operate/list_channel_basic.md` | 列出基础频道 |
| `operate/list_channel_basic_info.md` | 列出基础频道信息 |
| `operate/channel_update_template.md` | 更新频道模板 |
| `operate/channel_set_pull_bitrate.md` | 设置拉取码率 |

### operate/account (账号)

| 文件 | 功能描述 |
|------|----------|
| `operate/account/add_account.md` | 添加账号 |
| `operate/account/update_account.md` | 更新账号 |
| `operate/account/delete_accounts.md` | 删除账号 |
| `operate/account/get_account_viewer.md` | 获取账号观众 |
| `operate/account/update_account_viewer.md` | 更新账号观众 |

### chat (聊天)

| 文件 | 功能描述 |
|------|----------|
| `chat/update_chat_enabled.md` | 更新聊天启用状态 |

### coupon (优惠券)

| 文件 | 功能描述 |
|------|----------|
| `coupon/create.md` | 创建优惠券 |
| `coupon/delete.md` | 删除优惠券 |
| `coupon/list.md` | 优惠券列表 |

### decorate (装修)

| 文件 | 功能描述 |
|------|----------|
| `decorate/get.md` | 获取装修 |
| `decorate/update.md` | 更新装修 |
| `decorate/skin_update.md` | 更新皮肤 |

### distribute (分发)

| 文件 | 功能描述 |
|------|----------|
| `distribute/create_batch.md` | 批量创建分发 |
| `distribute/delete_batch.md` | 批量删除分发 |
| `distribute/list.md` | 分发列表 |
| `distribute/statistic.md` | 分发统计 |
| `distribute/update_batch.md` | 批量更新分发 |
| `distribute/update-master-switch.md` | 更新主开关 |
| `distribute/update-switch.md` | 更新开关 |

### donate (捐赠)

| 文件 | 功能描述 |
|------|----------|
| `donate/get.md` | 获取捐赠设置 |
| `donate/update.md` | 更新捐赠设置 |

### interaction (互动)

| 文件 | 功能描述 |
|------|----------|
| `interaction/invite/inviter_create.md` | 创建邀请 |
| `interaction/script/disk_video_script_delete.md` | 删除盘片视频脚本 |
| `interaction/script/disk_video_script_query.md` | 查询盘片视频脚本 |
| `interaction/script/disk_video_script_upload.md` | 上传盘片视频脚本 |

### interaction_event (互动事件)

| 文件 | 功能描述 |
|------|----------|
| `interaction_event/delete.md` | 删除互动事件 |
| `interaction_event/save.md` | 保存互动事件 |

### lottery (抽奖)

| 文件 | 功能描述 |
|------|----------|
| `lottery/create_wait_lottery.md` | 创建待抽奖 |
| `lottery/query_winner_viewer.md` | 查询中奖观众 |

### lottery_activity (抽奖活动)

| 文件 | 功能描述 |
|------|----------|
| `lottery_activity/lottery_activity_create.md` | 创建抽奖活动 |
| `lottery_activity/lottery_activity_delete.md` | 删除抽奖活动 |
| `lottery_activity/lottery_activity_get.md` | 获取抽奖活动 |
| `lottery_activity/lottery_activity_list.md` | 抽奖活动列表 |
| `lottery_activity/lottery_activity_update.md` | 更新抽奖活动 |
| `activity_record_list.md` | 活动记录列表 |

### lottery_viewer (抽奖观众)

| 文件 | 功能描述 |
|------|----------|
| `lottery_viewer/blacklist_add.md` | 添加黑名单 |
| `lottery_viewer/blacklist_delete.md` | 删除黑名单 |
| `lottery_viewer/blacklist_page.md` | 黑名单分页 |
| `lottery_viewer/group_add.md` | 添加分组 |
| `lottery_viewer/group_create_viewer_name.md` | 创建观众名称分组 |
| `lottery_viewer/group_delete.md` | 删除分组 |
| `lottery_viewer/group_list.md` | 分组列表 |
| `lottery_viewer/group_update.md` | 更新分组 |
| `lottery_viewer/group_viewer_add.md` | 添加分组观众 |
| `lottery_viewer/group_viewer_delete.md` | 删除分组观众 |
| `lottery_viewer/group_viewer_list.md` | 分组观众列表 |

### market (营销)

| 文件 | 功能描述 |
|------|----------|
| `market/cardPush/create.md` | 创建卡片推送 |
| `market/cardPush/delete.md` | 删除卡片推送 |
| `market/cardPush/get.md` | 获取卡片推送 |
| `market/cardPush/push.md` | 推送卡片 |
| `market/cardPush/cancelPush.md` | 取消推送 |
| `market/cardPush/update.md` | 更新卡片推送 |
| `market/share/get.md` | 获取分享设置 |
| `market/share/update.md` | 更新分享设置 |

### playback (回放)

| 文件 | 功能描述 |
|------|----------|
| `playback/playback_list.md` | 回放列表 |
| `playback/update_channel_subtitle.md` | 更新频道字幕 |
| `play-back/query-play-back-video-info.md` | 查询回放视频信息 |

### popularization (推广)

| 文件 | 功能描述 |
|------|----------|
| `popularization/batch_create_popularization.md` | 批量创建推广 |
| `popularization/popularization_list.md` | 推广列表 |

### product (商品)

| 文件 | 功能描述 |
|------|----------|
| `product/sort_channel_product.md` | 排序频道商品 |
| `product/topping_channel_product.md` | 置顶频道商品 |
| `product/untopping_channel_product.md` | 取消置顶频道商品 |

### product_setting (商品设置)

| 文件 | 功能描述 |
|------|----------|
| `product_setting/get_product_setting.md` | 获取商品设置 |
| `product_setting/update_product_setting.md` | 更新商品设置 |

### product_stats (商品统计)

| 文件 | 功能描述 |
|------|----------|
| `product_stats/page.md` | 商品统计分页 |
| `product_stats/summary.md` | 商品统计摘要 |

### product_tag (商品标签)

| 文件 | 功能描述 |
|------|----------|
| `product_tag/product_tag_create.md` | 创建商品标签 |
| `product_tag/product_tag_delete.md` | 删除商品标签 |
| `product_tag/product_tag_list.md` | 商品标签列表 |
| `product_tag/product_tag_update.md` | 更新商品标签 |

### recordfile (录制文件)

| 文件 | 功能描述 |
|------|----------|
| `recordfile/batch_publish_subtitle.md` | 批量发布字幕 |
| `recordfile/create_record_file_outline.md` | 创建录制文件大纲 |
| `recordfile/get_record_file_outline.md` | 获取录制文件大纲 |
| `recordfile/page_m_record.md` | 录制文件分页 |

### reward (打赏)

| 文件 | 功能描述 |
|------|----------|
| `reward/gift_page.md` | 礼物分页 |
| `reward/like_page.md` | 点赞分页 |

### role_config (角色配置)

| 文件 | 功能描述 |
|------|----------|
| `role_config/get_by_role.md` | 按角色获取 |
| `role_config/teacher_list.md` | 讲师列表 |
| `role_config/update_by_role.md` | 按角色更新 |

### session (场次)

| 文件 | 功能描述 |
|------|----------|
| `session/get_relevance.md` | 获取关联 |
| `session/new/create.md` | 创建场次 |
| `session/new/delete.md` | 删除场次 |
| `session/new/get.md` | 获取场次 |
| `session/new/list.md` | 场次列表 |
| `session/new/update.md` | 更新场次 |

### statistics (统计)

| 文件 | 功能描述 |
|------|----------|
| `statistics/browsers_summary.md` | 浏览器摘要 |
| `statistics/geo_summary_mc.md` | 地理位置摘要 |
| `statistics/get_invite_rank.md` | 获取邀请排行 |
| `statistics/get_invite_stats.md` | 获取邀请统计 |
| `statistics/live_summary.md` | 直播摘要 |
| `statistics/lottery_list.md` | 抽奖列表 |
| `statistics/weixin_booking_stats.md` | 微信预约统计 |

### subtitle (字幕)

| 文件 | 功能描述 |
|------|----------|
| `subtitle/get_subtitle.md` | 获取字幕 |
| `subtitle/list_all_language.md` | 列出所有语言 |
| `subtitle/update_subtitle.md` | 更新字幕 |

### task_reward (任务奖励)

| 文件 | 功能描述 |
|------|----------|
| `task_reward/create.md` | 创建任务奖励 |
| `task_reward/delete.md` | 删除任务奖励 |
| `task_reward/page.md` | 任务奖励分页 |
| `task_reward/stats.md` | 任务奖励统计 |
| `task_reward/stop.md` | 停止任务奖励 |
| `task_reward/submit_accept_info.md` | 提交接受信息 |
| `task_reward/update.md` | 更新任务奖励 |
| `task_reward/viewer_detail.md` | 观众详情 |
| `task_reward/viewer_union_detail.md` | 观众联合详情 |

### viewdata (观看数据)

| 文件 | 功能描述 |
|------|----------|
| `viewdata/get_live_session.md` | 获取直播场次 |

### watch (观看)

| 文件 | 功能描述 |
|------|----------|
| `watch/viewer_logout.md` | 观众登出 |

### 其他

| 文件 | 功能描述 |
|------|----------|
| `get_all_live_status_list.md` | 获取所有直播状态列表 |
| `monitor_list_stream_info.md` | 监控流信息列表 |

---

## V4/User (V4用户)

路径: `v4/user/` | 数量: 50+

### 基础操作

| 文件 | 功能描述 |
|------|----------|
| `get_callback.md` | 获取回调 |
| `update_callback.md` | 更新回调 |
| `get_global_footer.md` | 获取全局页脚 |
| `update_global_footer.md` | 更新全局页脚 |
| `get_global_switch.md` | 获取全局开关 |
| `update_global_switch.md` | 更新全局开关 |
| `get_pv_show_enable.md` | 获取 PV 显示启用 |
| `update_pv_show_enable.md` | 更新 PV 显示启用 |
| `mic_duration.md` | 连麦时长 |
| `mr_concurrency_detail.md` | MR 并发详情 |
| `sms_send.md` | 发送短信 |
| `viewer_lottery_win.md` | 观众抽奖中奖 |

### bill (账单)

| 文件 | 功能描述 |
|------|----------|
| `bill/use_detail_list.md` | 使用详情列表 |

### children (子账号)

| 文件 | 功能描述 |
|------|----------|
| `children/create.md` | 创建子账号 |
| `children/delete.md` | 删除子账号 |
| `children/get_by_sale.md` | 按销售获取 |
| `children/list.md` | 子账号列表 |
| `children/update.md` | 更新子账号 |
| `children/role/list.md` | 子账号角色列表 |

### customfield (自定义字段)

| 文件 | 功能描述 |
|------|----------|
| `customfield/add_custom_field.md` | 添加自定义字段 |
| `customfield/add_custom_field_viewer_value.md` | 添加自定义字段观众值 |
| `customfield/list_custom_field.md` | 自定义字段列表 |

### invitesales (邀请销售)

| 文件 | 功能描述 |
|------|----------|
| `invitesales/add.md` | 添加邀请销售 |
| `invitesales/list.md` | 邀请销售列表 |
| `invitesales/list-follow-viewer.md` | 关注观众列表 |
| `invitesales/remove.md` | 移除邀请销售 |
| `invitesales/update.md` | 更新邀请销售 |

### label (标签)

| 文件 | 功能描述 |
|------|----------|
| `label/create_label.md` | 创建标签 |
| `label/delete_label.md` | 删除标签 |
| `label/list_label.md` | 标签列表 |
| `label/update_label.md` | 更新标签 |
| `label/add_channel_label_refs.md` | 添加频道标签引用 |

### organization (组织)

| 文件 | 功能描述 |
|------|----------|
| `organization/create.md` | 创建组织 |
| `organization/delete.md` | 删除组织 |
| `organization/list.md` | 组织列表 |

### product (商品)

| 文件 | 功能描述 |
|------|----------|
| `product/product_add.md` | 添加商品 |
| `product/product_del.md` | 删除商品 |
| `product/product_edit.md` | 编辑商品 |
| `product/product_list.md` | 商品列表 |
| `product/product_tag_create.md` | 创建商品标签 |
| `product/product_tag_delete.md` | 删除商品标签 |
| `product/product_tag_list.md` | 商品标签列表 |
| `product/product_tag_update.md` | 更新商品标签 |

### product/order (商品订单)

| 文件 | 功能描述 |
|------|----------|
| `product/order/batch_update_status.md` | 批量更新状态 |
| `product/order/get.md` | 获取订单 |
| `product/order/list.md` | 订单列表 |

### template (模板)

| 文件 | 功能描述 |
|------|----------|
| `template/get_audio_moderation_setting.md` | 获取音频审核设置 |
| `template/update_audio_moderation_setting.md` | 更新音频审核设置 |
| `template/get_video_moderation_setting.md` | 获取视频审核设置 |
| `template/update_video_moderation_setting.md` | 更新视频审核设置 |
| `template/get_marquee.md` | 获取跑马灯 |
| `template/update_marquee.md` | 更新跑马灯 |
| `template/get_playback_setting.md` | 获取回放设置 |
| `template/update_playback_setting.md` | 更新回放设置 |
| `template/get_role_config.md` | 获取角色配置 |
| `template/update_role_config.md` | 更新角色配置 |
| `template/getDonate.md` | 获取捐赠设置 |
| `template/updateDonate.md` | 更新捐赠设置 |

### viewerrecord (观众记录)

| 文件 | 功能描述 |
|------|----------|
| `viewerrecord/create.md` | 创建观众记录 |
| `viewerrecord/delete.md` | 删除观众记录 |
| `viewerrecord/get.md` | 获取观众记录 |
| `viewerrecord/list.md` | 观众记录列表 |
| `viewerrecord/update.md` | 更新观众记录 |
| `viewerrecord/update_config.md` | 更新观众记录配置 |
| `viewerrecord/direct_auth.md` | 直接授权 |
| `viewerrecord/import_external_viewer.md` | 导入外部观众 |

### viewerrecord/label (观众记录标签)

| 文件 | 功能描述 |
|------|----------|
| `viewerrecord/label/create.md` | 创建标签 |
| `viewerrecord/label/delete.md` | 删除标签 |
| `viewerrecord/label/list.md` | 标签列表 |
| `viewerrecord/label/update.md` | 更新标签 |
| `viewerrecord/label/add_viewer_label.md` | 添加观众标签 |
| `viewerrecord/label/del_viewer_label.md` | 删除观众标签 |

### viewlog (观看日志)

| 文件 | 功能描述 |
|------|----------|
| `viewlog/viewlog_list.md` | 观看日志列表 |
| `viewlog/viewlog_detail.md` | 观看日志详情 |

---

## V4/Other (V4其他)

路径: `v4/`

### AI

| 文件 | 功能描述 |
|------|----------|
| `ai/digital-human/list-digital-human.md` | 数字人列表 |
| `ai/digital-human/list-organization.md` | 组织列表 |
| `ai/digital-human/set-organizations.md` | 设置组织 |
| `ai/video-produce/video-produce-batch-create.md` | 批量创建视频 |
| `ai/video-produce/video-produce-batch-create-new.md` | 批量创建视频(新) |
| `ai/video-produce/video-produce-delete.md` | 删除视频 |
| `ai/video-produce/video-produce-get.md` | 获取视频 |
| `ai/video-produce/video-produce-list.md` | 视频列表 |
| `ai/video-produce/video-produce-ppt-get.md` | 获取 PPT 视频 |
| `ai/video-produce/video-produce-ppt-list.md` | PPT 视频列表 |
| `ai/video-produce/video-produce-ppt-upload.md` | 上传 PPT 视频 |
| `ai/video-produce/video-produce-tts-voice-list.md` | TTS 语音列表 |

### Chat

| 文件 | 功能描述 |
|------|----------|
| `chat/checkin/batch_checkin.md` | 批量签到 |
| `chat/notice_add.md` | 添加公告 |
| `chat/notice_clean.md` | 清除公告 |
| `chat/notice_list.md` | 公告列表 |
| `chat/qa/qa_list.md` | 问答列表 |
| `chat/robot/get_robot_setting.md` | 获取机器人设置 |
| `chat/robot/get_robot_stats.md` | 获取机器人统计 |
| `chat/robot/pause_robot.md` | 暂停机器人 |
| `chat/robot/update_robot_setting.md` | 更新机器人设置 |
| `chat/send_custom_message.md` | 发送自定义消息 |
| `chat/send_custom_message_encode.md` | 发送编码自定义消息 |

### Global

| 文件 | 功能描述 |
|------|----------|
| `global/auth/auth_get.md` | 获取认证 |
| `global/auth/auth_update.md` | 更新认证 |
| `global/page_setting/page_setting_get.md` | 获取页面设置 |
| `global/page_setting/page_setting_update.md` | 更新页面设置 |

### Group

| 文件 | 功能描述 |
|------|----------|
| `group/account/billing_list.md` | 集团账单列表 |
| `group/user/allocation-log.md` | 分配日志 |
| `group/user/billing_list.md` | 用户账单列表 |
| `group/user/callback.md` | 回调 |
| `group/user/create.md` | 创建用户 |
| `group/user/package_list.md` | 套餐列表 |
| `group/user/package_update.md` | 更新套餐 |

### Material

| 文件 | 功能描述 |
|------|----------|
| `material/category/category-list.md` | 分类列表 |
| `material/label/label-create.md` | 创建标签 |
| `material/label/label-delete.md` | 删除标签 |
| `material/label/label-list.md` | 标签列表 |
| `material/label/label-update.md` | 更新标签 |
| `material/material-delete.md` | 删除素材 |
| `material/material-list.md` | 素材列表 |

### Platform

| 文件 | 功能描述 |
|------|----------|
| `platform/user_coupon_create.md` | 创建用户优惠券 |
| `platform/user_coupon_delete_batch.md` | 批量删除用户优惠券 |
| `platform/user_coupon_search.md` | 搜索用户优惠券 |
| `platform/user_coupon_search_viewer.md` | 搜索观众优惠券 |
| `platform/user_coupon_update.md` | 更新用户优惠券 |
| `platform/user_coupon_update_status_batch.md` | 批量更新状态 |

### Robot

| 文件 | 功能描述 |
|------|----------|
| `robot/robot_delete_batch.md` | 批量删除机器人 |
| `robot/robot_list.md` | 机器人列表 |
| `robot/robot_save_batch.md` | 批量保存机器人 |

### Statistics

| 文件 | 功能描述 |
|------|----------|
| `statistics/summary_list.md` | 摘要列表 |

### Webapp

| 文件 | 功能描述 |
|------|----------|
| `webapp/permission_list.md` | 权限列表 |
| `webapp/role_create.md` | 创建角色 |
| `webapp/role_delete.md` | 删除角色 |
| `webapp/role_get.md` | 获取角色 |
| `webapp/role_list.md` | 角色列表 |
| `webapp/role_update.md` | 更新角色 |

---

## Web (Web端设置)

路径: `web/` | 数量: 35

### info (信息)

| 文件 | 功能描述 |
|------|----------|
| `info/getsplash.md` | 获取启动图 |
| `info/setsplash.md` | 设置启动图 |
| `info/updatechannelname.md` | 更新频道名称 |
| `info/updatechannellogo.md` | 更新频道 Logo |
| `info/setpublisher.md` | 设置发布者 |
| `info/live_likes.md` | 直播点赞 |
| `info/update_likes.md` | 更新点赞 |
| `info/get_countdown.md` | 获取倒计时 |
| `info/set_countdown.md` | 设置倒计时 |

### menu (菜单)

| 文件 | 功能描述 |
|------|----------|
| `menu/add_menu.md` | 添加菜单 |
| `menu/setmenu.md` | 设置菜单 |
| `menu/menu_delete.md` | 删除菜单 |
| `menu/channel_menu_list.md` | 频道菜单列表 |
| `menu/update_channel_menu.md` | 更新频道菜单 |
| `menu/update_consulting_enabled.md` | 更新咨询启用 |
| `menu/update_rank.md` | 更新排名 |
| `menu/tuwen_list.md` | 图文列表 |

### page_interaction (页面互动)

| 文件 | 功能描述 |
|------|----------|
| `page_interaction/get_weixin_share.md` | 获取微信分享 |
| `page_interaction/update_weixin_share.md` | 更新微信分享 |
| `page_interaction/update_cash.md` | 更新现金 |
| `page_interaction/update_good.md` | 更新商品 |
| `page_interaction/donate_get.md` | 获取捐赠 |

### setting (设置)

| 文件 | 功能描述 |
|------|----------|
| `setting/uploadimage.md` | 上传图片 |
| `setting/update_global_enabled.md` | 更新全局启用 |

### watch_condition (观看条件)

| 文件 | 功能描述 |
|------|----------|
| `watch_condition/get_watch_condition.md` | 获取观看条件 |
| `watch_condition/set_watch_condition.md` | 设置观看条件 |
| `watch_condition/set_auth_type.md` | 设置认证类型 |
| `watch_condition/set_authorized_address.md` | 设置授权地址 |
| `watch_condition/set_externalauth.md` | 设置外部认证 |
| `watch_condition/update_auth_url.md` | 更新认证 URL |
| `watch_condition/customauth_2.md` | 自定义认证 v2 |
| `watch_condition/external_authorization_2.md` | 外部授权 v2 |
| `watch_condition/polyv_url.md` | PolyV URL |
| `watch_condition/direct_auth.md` | 直接授权 |
| `watch_condition/get_white_list.md` | 获取白名单 |
| `watch_condition/add_white_list.md` | 添加白名单 |
| `watch_condition/update_white_list.md` | 更新白名单 |
| `watch_condition/delete_white_list.md` | 删除白名单 |
| `watch_condition/upload_white_list.md` | 上传白名单 |
| `watch_condition/download_white_list.md` | 下载白名单 |
| `watch_condition/get_record_field.md` | 获取记录字段 |
| `watch_condition/get_record_info.md` | 获取记录信息 |
| `watch_condition/download_record_info.md` | 下载记录信息 |
| `watch_condition/enroll_list.md` | 报名列表 |

---

## Platform (平台)

路径: `platform/` | 数量: 8

| 文件 | 功能描述 |
|------|----------|
| `channel_anchor_create.md` | 创建主播 |
| `channel_anchor_get.md` | 获取主播 |
| `channel_anchor_list.md` | 主播列表 |
| `channel_anchor_list_relation.md` | 主播关联列表 |
| `channel_anchor_list_unrelation.md` | 主播非关联列表 |
| `channel_anchor_update.md` | 更新主播 |
| `channel_anchor_update_status.md` | 更新主播状态 |
| `content_group_list.md` | 内容分组列表 |
| `SM2_encrypt_detail.md` | SM2 加密详情 |

---

## Player (播放器)

路径: `player/` | 数量: 10

| 文件 | 功能描述 |
|------|----------|
| `update_logo.md` | 更新 Logo |
| `update_head.md` | 更新头部 |
| `update_stop.md` | 更新停止 |
| `set_marquee.md` | 设置跑马灯 |
| `marquee_instruction.md` | 跑马灯说明 |
| `marquee_url_instruction.md` | URL 跑马灯说明 |
| `anti_record_setting.md` | 防录屏设置 |
| `get_anti_record.md` | 获取防录屏 |
| `player_backstage_param.md` | 播放器后台参数 |
| `watch/get_watch_feedback_list.md` | 获取观看反馈列表 |

---

## Finance (财务)

路径: `finance/` | 数量: 6

| 文件 | 功能描述 |
|------|----------|
| `bill_detail_list.md` | 账单详情列表 |
| `audio-moderation/audio_moderation_get.md` | 获取音频审核 |
| `audio-moderation/audio_moderation_list.md` | 音频审核列表 |
| `audio-moderation/audio_moderation_update.md` | 更新音频审核 |
| `video-moderation/video_moderation_get.md` | 获取视频审核 |
| `video-moderation/video_moderation_update.md` | 更新视频审核 |
| `video-moderation/result_list.md` | 结果列表 |

---

## Group (集团账号)

路径: `group/` | 数量: 5

| 文件 | 功能描述 |
|------|----------|
| `set-concurrences.md` | 设置并发 |
| `set-flow.md` | 设置流量 |
| `set-live-durations.md` | 设置直播时长 |
| `set-space.md` | 设置空间 |
| `list-allocate-log.md` | 分配日志列表 |

---

## Live Interaction (直播互动)

路径: `live_interaction/` | 数量: 28

| 文件 | 功能描述 |
|------|----------|
| `create_questionnaire.md` | 创建问卷 |
| `batch_create_questionnaire.md` | 批量创建问卷 |
| `add_edit_questionnaire.md` | 添加编辑问卷 |
| `get_questionnaire_detail.md` | 获取问卷详情 |
| `get_questionnaire_result.md` | 获取问卷结果 |
| `list_questionnaire_by_page.md` | 分页问卷列表 |
| `list_questionaire.md` | 问卷列表 |
| `add_edit_question.md` | 添加编辑问题 |
| `get_question_list.md` | 问题列表 |
| `delete_question.md` | 删除问题 |
| `send_question.md` | 发送问题 |
| `send_question_result.md` | 发送问题结果 |
| `stop_question.md` | 停止问题 |
| `list_question.md` | 问题列表 |
| `list_question_send_time.md` | 问题发送时间列表 |
| `get_answer_list.md` | 答案列表 |
| `get_checkin_list.md` | 签到列表 |
| `get_checkin_by_checkid.md` | 按签到 ID 获取 |
| `get_checkin_by_sessionid.md` | 按场次 ID 获取 |
| `get_checkin_by_time.md` | 按时间获取 |
| `list_lottery.md` | 抽奖列表 |
| `list_channels_lottery.md` | 频道抽奖列表 |
| `get_winner_detail.md` | 中奖详情 |
| `download_winner_detail.md` | 下载中奖详情 |
| `add_receive_info.md` | 添加接收信息 |
| `add_receive_info_v4.md` | 添加接收信息 v4 |
| `send_favor.md` | 发送礼物 |
| `send_reward_msg.md` | 发送奖励消息 |

---

## Donate (捐赠)

路径: `donate/` | 数量: 1

| 文件 | 功能描述 |
|------|----------|
| `donateSetting.md` | 捐赠设置 |

---

## V5 API

路径: `v5/` | 数量: 1

| 文件 | 功能描述 |
|------|----------|
| `chat/redirect/channel/emit-by-userId/post.md` | 按用户 ID 发送消息 |

---

## Other (其他)

### 根目录文件

| 文件 | 功能描述 |
|------|----------|
| `buildSign.md` | 构建签名 |
| `getSecretKey.md` | 获取密钥 |
| `getGroupSecretKey.md` | 获取集团密钥 |
| `getChatToken.md` | 获取聊天 Token |
| `introduce.md` | 介绍 |
| `product_introduction.md` | 产品介绍 |
| `quickAccess.md` | 快速接入 |
| `tips.md` | 提示 |
| `limit.md` | 限制 |
| `errorInfo.md` | 错误信息 |

### Root

| 文件 | 功能描述 |
|------|----------|
| `root/source_register.md` | 源注册 |
| `root/tencent_order.md` | 腾讯订单 |

### Uncategorized

| 文件 | 功能描述 |
|------|----------|
| `uncategorized/callback/channel_change_callback.md` | 频道变更回调 |
| `uncategorized/ccb_focus_reset.md` | CCB 焦点重置 |
| `uncategorized/change_data_by_user.md` | 按用户更改数据 |
| `uncategorized/channel_learn_durations.md` | 频道学习时长 |
| `uncategorized/get_change_person.md` | 获取变更人员 |
| `uncategorized/inviter_poster_page.md` | 邀请海报页面 |
| `uncategorized/learn_durations.md` | 学习时长 |
| `uncategorized/list_tencent_stream_info.md` | 腾讯流信息列表 |
| `uncategorized/chat/chat_get_group_login_times.md` | 获取群登录次数 |
| `uncategorized/huawei/digitalMan/*.md` | 华为数字人相关 |

### FAQ

| 文件 | 功能描述 |
|------|----------|
| `faq/multirate_instruction.md` | 多码率说明 |

---

## 统计信息

- **总 API 数量**: 613
- **主要模块**: 16
- **V4 版本 API**: 250+
- **根目录公共文件**: 10+

---

## CLI 命令建议

基于以上模块划分，建议 CLI 命令结构如下：

```
polyv-live-cli <module> <action> [options]

# 示例
polyv-live-cli channel list
polyv-live-cli channel create --name "测试频道"
polyv-live-cli chat send --channelId xxx --message "hello"
polyv-live-cli coupon create --channelId xxx --type discount
polyv-live-cli product list --channelId xxx
polyv-live-cli playback list --channelId xxx
```

---

*Generated: 2026-03-22*
