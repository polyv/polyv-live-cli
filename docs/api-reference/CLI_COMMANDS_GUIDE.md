# PolyV 直播 API 模块-文档映射

> 本文件是 polyv-live-cli 仓库维护的项目侧索引，不是原始 API 文档。
> API 文档根目录为 `../document-center/docs/live/api`，该路径相对于本仓库根目录解析；例如 `channel/operate/create.md` 对应本仓库同级目录下的 `document-center/docs/live/api/channel/operate/create.md`。

> 基于 614 个 API 文档分析，按业务模块分类

## 快速参考

| 命令 | 模块 | 文档数 | 说明 |
|------|------|--------|------|
| `account` | 账号管理 | 27 | 用户信息、分类、SSO、回调设置 |
| `callback` | 回调设置 | 23 | 各种回调通知 |
| `channel` | 频道管理 | 34 | 频道CRUD、设置 |
| `chat` | 聊天管理 | 47 | 消息、禁言、踢人 |
| `product` | 商品管理 | 36 | 商品库、标签、统计 |
| `playback` | 回放管理 | 26 | 回放列表、录制合并 |
| `interaction` | 互动管理 | 35 | 签到、问答、问卷 |
| `lottery` | 抽奖管理 | 20 | 抽奖活动、观众分组 |
| `viewer` | 观众管理 | 18 | 观众信息、标签 |
| `watchCondition` | 观看条件 | 20 | 白名单、授权 |
| `statistics` | 数据统计 | 29 | 观看数据、并发 |
| `coupon` | 优惠券 | 9 | 优惠券CRUD |
| `ai` | AI功能 | 12 | 数字人、视频制作 |

---

## 详细映射

### account - 账号管理 (27 docs)

```
account/channel_detail.md
account/channels.md
account/create_category.md
account/delete_category.md
account/demo.md
account/get_category_list.md
account/get_income_detail.md
account/get_simple_channel_list.md
account/get_user_durations.md
account/get_user_info.md
account/mic_duration.md
account/receive_list.md
account/set_playback_callback.md
account/set_record_callback.md
account/set_stream_callback.md
account/set_user_children_login_token.md
account/set_user_login_token.md
account/sso_manager.md
account/sso.md
account/switch_get.md
account/switch_update.md
account/update_category_name.md
account/update_category_rank.md
account/user_channel_basic_list.md
account/user_playback_list.md
account/web_start_client.md
```

### callback - 回调设置 (23 docs)

```
callback/activity_change_callback.md
callback/ai_ppt_video_callback.md
callback/channel_booking_callback.md
callback/coupon_receive_callback.md
callback/feedback_callback.md
callback/interaction_callback.md
callback/invite_qrcode_url_get.md
callback/key_info_callback.md
callback/live_record_audio_audit_callback.md
callback/live_stats_data_callback.md
callback/live_status_callback.md
callback/live_violation_cut_off_callback.md
callback/livescan_callback.md
callback/livestatus_callback.md
callback/member_status_callback.md
callback/page_event.md
callback/playback_callback.md
callback/ppt_record_callback.md
callback/push_info_callback.md
callback/record_callback.md
callback/speak_callback.md
callback/subtitle_callback.md
callback/subtitle_content_callback.md
```

### channel - 频道管理 (34 docs)

```
channel/auth/get_channel_api_access_token.md
channel/auth/get_channel_watch_test_mode_token.md
channel/operate/basic_create.md
channel/operate/batch_create_channels.md
channel/operate/batch_create.md
channel/operate/batch_delete_channels.md
channel/operate/copy_channel.md
channel/operate/create.md
channel/operate/delete_channel.md
channel/operate/get_channel_detail_setting.md
channel/operate/get_channel_detail.md
channel/operate/set_max_viewer.md
channel/operate/update_channel_detail_setting.md
channel/operate/update_password.md
channel/operate/update_setting.md
channel/operate/update_stream_type.md
channel/operate/get_api_token.md
channel/operate/get_callback_setting.md
channel/operate/get_watch_api_token.md
v4/channel/basic_create.md
v4/channel/create_batch.md
v4/channel/create_mr.md
v4/channel/create.md
v4/channel/get_all_live_status_list.md
v4/channel/update.md
v4/channel/operate/channel_basic_list.md
v4/channel/operate/channel_detail_list.md
v4/channel/operate/channel_simple_list.md
v4/channel/operate/channel_set_pull_bitrate.md
v4/channel/operate/channel_update_template.md
v4/channel/operate/get_channel_detail.md
v4/channel/operate/get_channel.md
v4/channel/operate/list_channel_basic_info.md
v4/channel/operate/list_channel_basic.md
```

### chat - 聊天管理 (47 docs)

```
chat/banned/add_badwords.md
chat/banned/add_banned_ip.md
chat/banned/delete_channel_banned.md
chat/banned/delete_user_badword.md
chat/banned/forbid_channel_kick_users.md
chat/banned/forbid_channel_unkick_users.md
chat/banned/forbid_kick_users.md
chat/banned/forbid_unkick_users.md
chat/banned/get_channel_banned_list.md
chat/banned/get_channel_banned_user_list.md
chat/banned/get_channel_kicked_user_list.md
chat/banned/get_forbid_user_list.md
chat/banned/get_user_badword_list.md
chat/banned/get_user_banned_list.md
chat/banned/update_banned_user.md
chat/banned/update_user_banned_viewer.md
chat/censor/update_censor_enabled.md
chat/message/chat_alert_to_special.md
chat/message/delete_all_message.md
chat/message/delete_message_by_id.md
chat/message/get_message_list.md
chat/message/get-speak-list.md
chat/message/message_audit.md
chat/message/send_hidden_message_by_admin.md
chat/message/send_hidden_message.md
chat/message/send_message.md
chat/role/get_admin_info.md
chat/role/get_teacher_info.md
chat/role/get_user_list.md
chat/role/update_admin_info.md
chat/role/update_teacher_info.md
channel/operate/chat_online_count.md
channel/operate/get_chat_online_count.md
channel/operate/get_chat_token.md
channel/operate/remove_chat_contents.md
v4/channel/chat/update_chat_enabled.md
v4/chat/checkin/batch_checkin.md
v4/chat/notice_add.md
v4/chat/notice_clean.md
v4/chat/notice_list.md
v4/chat/qa/qa_list.md
v4/chat/robot/get_robot_setting.md
v4/chat/robot/get_robot_stats.md
v4/chat/robot/pause_robot.md
v4/chat/robot/update_robot_setting.md
v4/chat/send_custom_message_encode.md
v4/chat/send_custom_message.md
v5/chat/redirect/channel/emit-by-userId/post.md
```

### product - 商品管理 (36 docs)

```
channel/operate/add_channel_product.md
channel/operate/batch_add_channel_product.md
channel/operate/batch_delete_channel_product.md
channel/operate/batch_shelf_channel_product.md
channel/operate/cancel_push_channel_product.md
channel/operate/delete_channel_product.md
channel/operate/get_channel_product_enabled.md
channel/operate/get_channel_product_list.md
channel/operate/push_channel_product.md
channel/operate/reference_product.md
channel/operate/shelf_channel_product.md
channel/operate/sort_channel_product.md
channel/operate/update_channel_product_enabled.md
channel/operate/update_channel_product.md
v4/channel/product/sort_channel_product.md
v4/channel/product/topping_channel_product.md
v4/channel/product/untopping_channel_product.md
v4/channel/product_setting/get_product_setting.md
v4/channel/product_setting/update_product_setting.md
v4/channel/product_stats/page.md
v4/channel/product_stats/summary.md
v4/channel/product_tag/product_tag_create.md
v4/channel/product_tag/product_tag_delete.md
v4/channel/product_tag/product_tag_list.md
v4/channel/product_tag/product_tag_update.md
v4/user/product/order/batch_update_status.md
v4/user/product/order/get.md
v4/user/product/order/list.md
v4/user/product/product_add.md
v4/user/product/product_del.md
v4/user/product/product_edit.md
v4/user/product/product_list.md
v4/user/product/product_tag_create.md
v4/user/product/product_tag_delete.md
v4/user/product/product_tag_list.md
v4/user/product/product_tag_update.md
```

### interaction - 互动管理 (35 docs)

```
live_interaction/add_edit_question.md
live_interaction/add_edit_questionnaire.md
live_interaction/add_receive_info_v4.md
live_interaction/add_receive_info.md
live_interaction/batch_create_questionnaire.md
live_interaction/create_questionnaire.md
live_interaction/delete_question.md
live_interaction/download_winner_detail.md
live_interaction/get_answer_list.md
live_interaction/get_checkin_by_checkid.md
live_interaction/get_checkin_by_sessionid.md
live_interaction/get_checkin_by_time.md
live_interaction/get_checkin_list.md
live_interaction/get_question_list.md
live_interaction/get_questionnaire_detail.md
live_interaction/get_questionnaire_result.md
live_interaction/get_winner_detail.md
live_interaction/list_channels_lottery.md
live_interaction/list_lottery.md
live_interaction/list_question_send_time.md
live_interaction/list_question.md
live_interaction/list_questionaire.md
live_interaction/list_questionnaire_by_page.md
live_interaction/send_favor.md
live_interaction/send_question_result.md
live_interaction/send_question.md
live_interaction/send_reward_msg.md
live_interaction/stop_question.md
v4/channel/interaction_event/delete.md
v4/channel/interaction_event/save.md
v4/channel/interaction/invite/inviter_create.md
v4/channel/interaction/script/disk_video_script_delete.md
v4/channel/interaction/script/disk_video_script_query.md
v4/channel/interaction/script/disk_video_script_upload.md
channel/operate/channels_stop_questionnaire.md
```

### playback - 回放管理 (26 docs)

```
channel/playback/add_vod_playback.md
channel/playback/clip_record_file.md
channel/playback/delete_playback.md
channel/playback/delete_record.md
channel/playback/get_channel_sessions.md
channel/playback/get_playback_enabled.md
channel/playback/get_playback_list.md
channel/playback/get_playback_setting.md
channel/playback/get_record_file.md
channel/playback/get_record_info.md
channel/playback/record_add_breakpoint.md
channel/playback/record_convert_async.md
channel/playback/record_convert.md
channel/playback/record_file_merge_async.md
channel/playback/record_file_merge.md
channel/playback/record_merge_mp4_start.md
channel/playback/record_merge_mp4.md
channel/playback/set_playback_enabled.md
channel/playback/set_playback_single_sort.md
channel/playback/set_playback_sort.md
channel/playback/set_record_default.md
channel/playback/set_record_setting.md
channel/playback/update_playback_title.md
v4/channel/playback/playback_list.md
v4/channel/playback/update_channel_subtitle.md
v4/channel/play-back/query-play-back-video-info.md
```

### lottery - 抽奖管理 (20 docs)

```
v4/channel/lottery_activity/lottery_activity_create.md
v4/channel/lottery_activity/lottery_activity_delete.md
v4/channel/lottery_activity/lottery_activity_get.md
v4/channel/lottery_activity/lottery_activity_list.md
v4/channel/lottery_activity/lottery_activity_update.md
v4/channel/lottery_viewer/blacklist_add.md
v4/channel/lottery_viewer/blacklist_delete.md
v4/channel/lottery_viewer/blacklist_page.md
v4/channel/lottery_viewer/group_add.md
v4/channel/lottery_viewer/group_create_viewer_name.md
v4/channel/lottery_viewer/group_delete.md
v4/channel/lottery_viewer/group_list.md
v4/channel/lottery_viewer/group_update.md
v4/channel/lottery_viewer/group_viewer_add.md
v4/channel/lottery_viewer/group_viewer_delete.md
v4/channel/lottery_viewer/group_viewer_list.md
v4/channel/lottery/activity_record_list.md
v4/channel/lottery/create_wait_lottery.md
v4/channel/lottery/query_winner_viewer.md
v4/user/viewer_lottery_win.md
```

### statistics - 数据统计 (29 docs)

```
channel/statistics/get_product_click_stats.md
channel/statistics/get_product_list_stats.md
channel/statistics/get_redpack_stats.md
channel/viewdata/channel_play_summary.md
channel/viewdata/channel_statistic.md
channel/viewdata/concurrency.md
channel/viewdata/daily_summary.md
channel/viewdata/get_max_history_concurrent.md
channel/viewdata/get_realtime_viewers.md
channel/viewdata/get_session_stats.md
channel/viewdata/link_mic_detail_list.md
channel/viewdata/mic_detail_list.md
channel/viewdata/realviewers.md
channel/viewdata/summary.md
channel/viewdata/viewlog_2.md
channel/viewdata/viewlog_page_v3.md
channel/viewdata/viewlog_page.md
v4/channel/statistics/browsers_summary.md
v4/channel/statistics/geo_summary_mc.md
v4/channel/statistics/get_invite_rank.md
v4/channel/statistics/get_invite_stats.md
v4/channel/statistics/live_summary.md
v4/channel/statistics/lottery_list.md
v4/channel/statistics/weixin_booking_stats.md
v4/channel/viewdata/get_live_session.md
v4/statistics/summary_list.md
v4/user/viewlog/viewlog_detail.md
v4/user/viewlog/viewlog_list.md
```

### watchCondition - 观看条件 (20 docs)

```
web/watch_condition/add_white_list.md
web/watch_condition/customauth_2.md
web/watch_condition/delete_white_list.md
web/watch_condition/direct_auth.md
web/watch_condition/download_record_info.md
web/watch_condition/download_white_list.md
web/watch_condition/enroll_list.md
web/watch_condition/external_authorization_2.md
web/watch_condition/get_record_field.md
web/watch_condition/get_record_info.md
web/watch_condition/get_watch_condition.md
web/watch_condition/get_white_list.md
web/watch_condition/polyv_url.md
web/watch_condition/set_auth_type.md
web/watch_condition/set_authorized_address.md
web/watch_condition/set_externalauth.md
web/watch_condition/set_watch_condition.md
web/watch_condition/update_auth_url.md
web/watch_condition/update_white_list.md
web/watch_condition/upload_white_list.md
```

### viewer - 观众管理 (18 docs)

```
v4/user/viewerrecord/create.md
v4/user/viewerrecord/delete.md
v4/user/viewerrecord/direct_auth.md
v4/user/viewerrecord/get.md
v4/user/viewerrecord/import_external_viewer.md
v4/user/viewerrecord/label/add_viewer_label.md
v4/user/viewerrecord/label/create.md
v4/user/viewerrecord/label/del_viewer_label.md
v4/user/viewerrecord/label/delete.md
v4/user/viewerrecord/label/list.md
v4/user/viewerrecord/label/update.md
v4/user/viewerrecord/list.md
v4/user/viewerrecord/update_config.md
v4/user/viewerrecord/update.md
v4/user/customfield/add_custom_field_viewer_value.md
v4/user/customfield/add_custom_field.md
v4/user/customfield/list_custom_field.md
v4/channel/watch/viewer_logout.md
```

### coupon - 优惠券 (9 docs)

```
v4/channel/coupon/create.md
v4/channel/coupon/delete.md
v4/channel/coupon/list.md
v4/platform/user_coupon_create.md
v4/platform/user_coupon_delete_batch.md
v4/platform/user_coupon_search_viewer.md
v4/platform/user_coupon_search.md
v4/platform/user_coupon_update_status_batch.md
v4/platform/user_coupon_update.md
```

---

## 完整模块列表

完整 JSON 映射请参考: [MODULE_DOC_MAPPING.json](./MODULE_DOC_MAPPING.json)

*生成时间: 2026-03-22*
