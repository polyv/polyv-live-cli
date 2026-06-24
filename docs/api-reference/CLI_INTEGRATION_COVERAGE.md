# CLI Integration Coverage

Generated at: 2026-06-24T19:25:04.270Z

This report measures real local CLI execution coverage in `packages/cli/tests/integration`.
Help-only invocations are tracked separately and do not count as real execution coverage.

## Summary

| Metric | Value |
|--------|-------|
| Integration files scanned | 77 |
| CLI command paths | 724 |
| Target leaf subcommands | 567 |
| Real-executed leaf subcommands | 354 |
| Missing real-execution leaf subcommands | 213 |
| Real-execution coverage | 62.43% |
| Leaf subcommands referenced including help | 432 |
| Missing including help | 135 |

## By Top-Level Command

| Command | Targets | Real Covered | Real Missing | Real Coverage | Covered Including Help | Missing Including Help |
|---------|---------|--------------|--------------|---------------|------------------------|------------------------|
| `account` | 23 | 22 | 1 | 95.65% | 22 | 1 |
| `ai` | 12 | 5 | 7 | 41.67% | 5 | 7 |
| `card-push` | 8 | 8 | 0 | 100.00% | 8 | 0 |
| `channel` | 78 | 67 | 11 | 85.90% | 73 | 5 |
| `chat` | 44 | 37 | 7 | 84.09% | 41 | 3 |
| `checkin` | 5 | 2 | 3 | 40.00% | 2 | 3 |
| `coupon` | 8 | 8 | 0 | 100.00% | 8 | 0 |
| `custom-field` | 3 | 1 | 2 | 33.33% | 3 | 0 |
| `document` | 11 | 3 | 8 | 27.27% | 4 | 7 |
| `donate` | 4 | 2 | 2 | 50.00% | 3 | 1 |
| `finance` | 7 | 1 | 6 | 14.29% | 2 | 5 |
| `global` | 4 | 2 | 2 | 50.00% | 4 | 0 |
| `group` | 16 | 1 | 15 | 6.25% | 2 | 14 |
| `interaction` | 22 | 6 | 16 | 27.27% | 15 | 7 |
| `invite-sales` | 5 | 2 | 3 | 40.00% | 5 | 0 |
| `lottery` | 24 | 12 | 12 | 50.00% | 18 | 6 |
| `material` | 7 | 6 | 1 | 85.71% | 7 | 0 |
| `monitor` | 9 | 8 | 1 | 88.89% | 9 | 0 |
| `partner` | 2 | 1 | 1 | 50.00% | 2 | 0 |
| `platform` | 22 | 10 | 12 | 45.45% | 12 | 10 |
| `playback` | 13 | 4 | 9 | 30.77% | 5 | 8 |
| `player` | 11 | 4 | 7 | 36.36% | 5 | 6 |
| `product` | 36 | 24 | 12 | 66.67% | 30 | 6 |
| `promotion` | 2 | 2 | 0 | 100.00% | 2 | 0 |
| `qa` | 9 | 4 | 5 | 44.44% | 7 | 2 |
| `questionnaire` | 6 | 3 | 3 | 50.00% | 4 | 2 |
| `record` | 17 | 4 | 13 | 23.53% | 6 | 11 |
| `robot` | 3 | 1 | 2 | 33.33% | 2 | 1 |
| `session` | 11 | 3 | 8 | 27.27% | 4 | 7 |
| `statistics` | 27 | 21 | 6 | 77.78% | 21 | 6 |
| `stream` | 19 | 12 | 7 | 63.16% | 13 | 6 |
| `transmit` | 3 | 3 | 0 | 100.00% | 3 | 0 |
| `user` | 31 | 17 | 14 | 54.84% | 28 | 3 |
| `viewer` | 19 | 13 | 6 | 68.42% | 18 | 1 |
| `watch-condition` | 2 | 1 | 1 | 50.00% | 1 | 1 |
| `web` | 34 | 24 | 10 | 70.59% | 28 | 6 |
| `webapp` | 6 | 6 | 0 | 100.00% | 6 | 0 |
| `whitelist` | 4 | 4 | 0 | 100.00% | 4 | 0 |

## Missing Real-Execution Targets

| Command | Source |
|---------|--------|
| `account api sso set` | `packages/cli/src/commands/account.commands.ts:844` |
| `ai digital-human list-org` | `packages/cli/src/commands/ai.commands.ts:170` |
| `ai digital-human set-org` | `packages/cli/src/commands/ai.commands.ts:189` |
| `ai video-produce delete` | `packages/cli/src/commands/ai.commands.ts:310` |
| `ai video-produce get` | `packages/cli/src/commands/ai.commands.ts:272` |
| `ai video-produce ppt async-upload` | `packages/cli/src/commands/ai.commands.ts:394` |
| `ai video-produce ppt get` | `packages/cli/src/commands/ai.commands.ts:354` |
| `ai video-produce ppt upload` | `packages/cli/src/commands/ai.commands.ts:372` |
| `channel ccb-focus-reset` | `packages/cli/src/commands/channel.commands.ts:1459` |
| `channel children-list` | `packages/cli/src/commands/channel.commands.ts:1290` |
| `channel questionnaire-stop` | `packages/cli/src/commands/channel.commands.ts:1401` |
| `channel submeeting-batch-add` | `packages/cli/src/commands/channel.commands.ts:1390` |
| `channel distribute create-batch` | `packages/cli/src/commands/channel.commands.ts:1134` |
| `channel distribute delete-batch` | `packages/cli/src/commands/channel.commands.ts:1164` |
| `channel distribute switch` | `packages/cli/src/commands/channel.commands.ts:1194` |
| `channel distribute update-batch` | `packages/cli/src/commands/channel.commands.ts:1149` |
| `channel follow update` | `packages/cli/src/commands/channel.commands.ts:1377` |
| `channel ppt-record add-task` | `packages/cli/src/commands/channel.commands.ts:1264` |
| `channel ppt-record delete` | `packages/cli/src/commands/channel.commands.ts:1271` |
| `chat message audit` | `packages/cli/src/commands/chat.commands.ts:534` |
| `chat message remove-contents` | `packages/cli/src/commands/chat.commands.ts:505` |
| `chat robot list-update` | `packages/cli/src/commands/chat.commands.ts:783` |
| `chat robot pause` | `packages/cli/src/commands/chat.commands.ts:797` |
| `chat robot setting-update` | `packages/cli/src/commands/chat.commands.ts:771` |
| `chat role admin-update` | `packages/cli/src/commands/chat.commands.ts:714` |
| `chat role user-list` | `packages/cli/src/commands/chat.commands.ts:744` |
| `checkin result` | `packages/cli/src/commands/checkin.commands.ts:148` |
| `checkin session-result` | `packages/cli/src/commands/checkin.commands.ts:188` |
| `checkin start` | `packages/cli/src/commands/checkin.commands.ts:38` |
| `custom-field add` | `packages/cli/src/commands/custom-field.commands.ts:30` |
| `custom-field value save` | `packages/cli/src/commands/custom-field.commands.ts:41` |
| `document delete` | `packages/cli/src/commands/document.commands.ts:342` |
| `document status` | `packages/cli/src/commands/document.commands.ts:424` |
| `document upload` | `packages/cli/src/commands/document.commands.ts:253` |
| `document media link` | `packages/cli/src/commands/document.commands.ts:534` |
| `document media unlink` | `packages/cli/src/commands/document.commands.ts:543` |
| `document media user-delete` | `packages/cli/src/commands/document.commands.ts:559` |
| `document media user-detail` | `packages/cli/src/commands/document.commands.ts:552` |
| `document teacher-doc relation` | `packages/cli/src/commands/document.commands.ts:502` |
| `donate list` | `packages/cli/src/commands/donate.commands.ts:132` |
| `donate config update` | `packages/cli/src/commands/donate.commands.ts:83` |
| `finance audio-moderation get` | `packages/cli/src/commands/finance.commands.ts:42` |
| `finance audio-moderation list` | `packages/cli/src/commands/finance.commands.ts:48` |
| `finance audio-moderation update` | `packages/cli/src/commands/finance.commands.ts:53` |
| `finance video-moderation get` | `packages/cli/src/commands/finance.commands.ts:68` |
| `finance video-moderation result-list` | `packages/cli/src/commands/finance.commands.ts:74` |
| `finance video-moderation update` | `packages/cli/src/commands/finance.commands.ts:79` |
| `global auth update` | `packages/cli/src/commands/global.commands.ts:102` |
| `global page-setting update` | `packages/cli/src/commands/global.commands.ts:126` |
| `group allocate-log` | `packages/cli/src/commands/group.commands.ts:36` |
| `group billing-daily` | `packages/cli/src/commands/group.commands.ts:131` |
| `group resource set-concurrences` | `packages/cli/src/commands/group.commands.ts:45` |
| `group resource set-flow` | `packages/cli/src/commands/group.commands.ts:54` |
| `group resource set-live-durations` | `packages/cli/src/commands/group.commands.ts:66` |
| `group resource set-space` | `packages/cli/src/commands/group.commands.ts:75` |
| `group user allocation-log` | `packages/cli/src/commands/group.commands.ts:135` |
| `group user billing-daily` | `packages/cli/src/commands/group.commands.ts:125` |
| `group user create` | `packages/cli/src/commands/group.commands.ts:90` |
| `group user isolation-create` | `packages/cli/src/commands/group.commands.ts:148` |
| `group user package-list` | `packages/cli/src/commands/group.commands.ts:106` |
| `group user package-update` | `packages/cli/src/commands/group.commands.ts:110` |
| `group user package-validity-list` | `packages/cli/src/commands/group.commands.ts:167` |
| `group user package-validity-update` | `packages/cli/src/commands/group.commands.ts:171` |
| `group user secret-reset` | `packages/cli/src/commands/group.commands.ts:195` |
| `interaction favor` | `packages/cli/src/commands/interaction.commands.ts:51` |
| `interaction reward` | `packages/cli/src/commands/interaction.commands.ts:67` |
| `interaction teacher-answer` | `packages/cli/src/commands/interaction.commands.ts:137` |
| `interaction event delete` | `packages/cli/src/commands/interaction.commands.ts:189` |
| `interaction event save` | `packages/cli/src/commands/interaction.commands.ts:173` |
| `interaction invite-poster create` | `packages/cli/src/commands/interaction.commands.ts:207` |
| `interaction script delete` | `packages/cli/src/commands/interaction.commands.ts:263` |
| `interaction script query` | `packages/cli/src/commands/interaction.commands.ts:233` |
| `interaction script upload` | `packages/cli/src/commands/interaction.commands.ts:245` |
| `interaction task-reward create` | `packages/cli/src/commands/interaction.commands.ts:295` |
| `interaction task-reward delete` | `packages/cli/src/commands/interaction.commands.ts:341` |
| `interaction task-reward stop` | `packages/cli/src/commands/interaction.commands.ts:353` |
| `interaction task-reward submit-accept-info` | `packages/cli/src/commands/interaction.commands.ts:411` |
| `interaction task-reward update` | `packages/cli/src/commands/interaction.commands.ts:317` |
| `interaction task-reward viewer-detail` | `packages/cli/src/commands/interaction.commands.ts:379` |
| `interaction task-reward viewer-list` | `packages/cli/src/commands/interaction.commands.ts:397` |
| `invite-sales add` | `packages/cli/src/commands/invite-sales.commands.ts:40` |
| `invite-sales remove` | `packages/cli/src/commands/invite-sales.commands.ts:56` |
| `invite-sales update` | `packages/cli/src/commands/invite-sales.commands.ts:48` |
| `lottery download-winners` | `packages/cli/src/commands/lottery.commands.ts:491` |
| `lottery get` | `packages/cli/src/commands/lottery.commands.ts:182` |
| `lottery receive-info` | `packages/cli/src/commands/lottery.commands.ts:524` |
| `lottery winners` | `packages/cli/src/commands/lottery.commands.ts:309` |
| `lottery blacklist add` | `packages/cli/src/commands/lottery.commands.ts:730` |
| `lottery blacklist delete` | `packages/cli/src/commands/lottery.commands.ts:744` |
| `lottery group-viewer add` | `packages/cli/src/commands/lottery.commands.ts:664` |
| `lottery group-viewer add-names` | `packages/cli/src/commands/lottery.commands.ts:680` |
| `lottery group-viewer delete` | `packages/cli/src/commands/lottery.commands.ts:696` |
| `lottery group-viewer list` | `packages/cli/src/commands/lottery.commands.ts:648` |
| `lottery lucky-bag winners` | `packages/cli/src/commands/lottery.commands.ts:762` |
| `lottery wait create` | `packages/cli/src/commands/lottery.commands.ts:566` |
| `material delete` | `packages/cli/src/commands/material.commands.ts:40` |
| `monitor tencent-stream-info-list` | `packages/cli/src/commands/monitor.commands.ts:73` |
| `partner tencent-order create` | `packages/cli/src/commands/partner.commands.ts:39` |
| `platform anchor create` | `packages/cli/src/commands/platform.commands.ts:663` |
| `platform anchor get` | `packages/cli/src/commands/platform.commands.ts:642` |
| `platform anchor relation-list` | `packages/cli/src/commands/platform.commands.ts:754` |
| `platform anchor unrelation-list` | `packages/cli/src/commands/platform.commands.ts:779` |
| `platform anchor update` | `packages/cli/src/commands/platform.commands.ts:694` |
| `platform anchor update-status` | `packages/cli/src/commands/platform.commands.ts:729` |
| `platform callback update` | `packages/cli/src/commands/platform.commands.ts:417` |
| `platform coupon status-batch` | `packages/cli/src/commands/platform.commands.ts:887` |
| `platform coupon update` | `packages/cli/src/commands/platform.commands.ts:862` |
| `platform coupon viewer-list` | `packages/cli/src/commands/platform.commands.ts:833` |
| `platform setting update` | `packages/cli/src/commands/platform.commands.ts:530` |
| `platform switch update` | `packages/cli/src/commands/platform.commands.ts:311` |
| `playback add-vod` | `packages/cli/src/commands/playback.commands.ts:543` |
| `playback delete` | `packages/cli/src/commands/playback.commands.ts:319` |
| `playback get` | `packages/cli/src/commands/playback.commands.ts:241` |
| `playback merge` | `packages/cli/src/commands/playback.commands.ts:405` |
| `playback enabled set` | `packages/cli/src/commands/playback.commands.ts:533` |
| `playback sort move` | `packages/cli/src/commands/playback.commands.ts:572` |
| `playback sort set` | `packages/cli/src/commands/playback.commands.ts:583` |
| `playback subtitle update-batch` | `packages/cli/src/commands/playback.commands.ts:597` |
| `playback title update` | `packages/cli/src/commands/playback.commands.ts:558` |
| `player logo-update` | `packages/cli/src/commands/player.commands.ts:510` |
| `player marquee-url` | `packages/cli/src/commands/player.commands.ts:451` |
| `player advert head-update` | `packages/cli/src/commands/player.commands.ts:469` |
| `player advert stop-update` | `packages/cli/src/commands/player.commands.ts:492` |
| `player anti-record get` | `packages/cli/src/commands/player.commands.ts:413` |
| `player anti-record update` | `packages/cli/src/commands/player.commands.ts:427` |
| `player config update` | `packages/cli/src/commands/player.commands.ts:271` |
| `product batch-add` | `packages/cli/src/commands/product.commands.ts:663` |
| `product batch-shelf` | `packages/cli/src/commands/product.commands.ts:682` |
| `product cancel-push` | `packages/cli/src/commands/product.commands.ts:719` |
| `product push` | `packages/cli/src/commands/product.commands.ts:710` |
| `product rank` | `packages/cli/src/commands/product.commands.ts:839` |
| `product reference` | `packages/cli/src/commands/product.commands.ts:727` |
| `product sort` | `packages/cli/src/commands/product.commands.ts:700` |
| `product topping` | `packages/cli/src/commands/product.commands.ts:848` |
| `product untopping` | `packages/cli/src/commands/product.commands.ts:856` |
| `product update-enabled` | `packages/cli/src/commands/product.commands.ts:655` |
| `product order batch-status` | `packages/cli/src/commands/product.commands.ts:973` |
| `product order get` | `packages/cli/src/commands/product.commands.ts:964` |
| `qa add-edit` | `packages/cli/src/commands/qa.commands.ts:256` |
| `qa delete-question` | `packages/cli/src/commands/qa.commands.ts:295` |
| `qa send` | `packages/cli/src/commands/qa.commands.ts:54` |
| `qa send-result` | `packages/cli/src/commands/qa.commands.ts:322` |
| `qa stop` | `packages/cli/src/commands/qa.commands.ts:137` |
| `questionnaire batch-create` | `packages/cli/src/commands/questionnaire.commands.ts:296` |
| `questionnaire create` | `packages/cli/src/commands/questionnaire.commands.ts:54` |
| `questionnaire detail` | `packages/cli/src/commands/questionnaire.commands.ts:218` |
| `record clip` | `packages/cli/src/commands/record.commands.ts:480` |
| `record convert` | `packages/cli/src/commands/record.commands.ts:323` |
| `record merge-mp4` | `packages/cli/src/commands/record.commands.ts:493` |
| `record merge-mp4-start` | `packages/cli/src/commands/record.commands.ts:504` |
| `record set-default` | `packages/cli/src/commands/record.commands.ts:405` |
| `record breakpoint add` | `packages/cli/src/commands/record.commands.ts:571` |
| `record file convert` | `packages/cli/src/commands/record.commands.ts:551` |
| `record file delete` | `packages/cli/src/commands/record.commands.ts:541` |
| `record file merge` | `packages/cli/src/commands/record.commands.ts:530` |
| `record outline create` | `packages/cli/src/commands/record.commands.ts:585` |
| `record outline get` | `packages/cli/src/commands/record.commands.ts:596` |
| `record setting set` | `packages/cli/src/commands/record.commands.ts:242` |
| `record subtitle publish` | `packages/cli/src/commands/record.commands.ts:608` |
| `robot batch-delete` | `packages/cli/src/commands/robot.commands.ts:42` |
| `robot batch-save` | `packages/cli/src/commands/robot.commands.ts:35` |
| `session create` | `packages/cli/src/commands/session.commands.ts:313` |
| `session delete` | `packages/cli/src/commands/session.commands.ts:338` |
| `session get` | `packages/cli/src/commands/session.commands.ts:221` |
| `session update` | `packages/cli/src/commands/session.commands.ts:325` |
| `session external file-ids` | `packages/cli/src/commands/session.commands.ts:367` |
| `session external get` | `packages/cli/src/commands/session.commands.ts:351` |
| `session external relevance` | `packages/cli/src/commands/session.commands.ts:375` |
| `session external session-list` | `packages/cli/src/commands/session.commands.ts:359` |
| `statistics inviter-poster-list` | `packages/cli/src/commands/statistics.commands.ts:205` |
| `statistics view` | `packages/cli/src/commands/statistics.commands.ts:445` |
| `statistics audience device` | `packages/cli/src/commands/statistics.commands.ts:758` |
| `statistics audience region` | `packages/cli/src/commands/statistics.commands.ts:675` |
| `statistics export session` | `packages/cli/src/commands/statistics.commands.export.ts:273` |
| `statistics export viewlog` | `packages/cli/src/commands/statistics.commands.export.ts:178` |
| `stream capture` | `packages/cli/src/commands/stream.commands.ts:475` |
| `stream monitor` | `packages/cli/src/commands/stream.commands.ts:713` |
| `stream push` | `packages/cli/src/commands/stream.commands.ts:543` |
| `stream verify` | `packages/cli/src/commands/stream.commands.ts:622` |
| `stream disk-video add` | `packages/cli/src/commands/stream.commands.ts:489` |
| `stream disk-video delete` | `packages/cli/src/commands/stream.commands.ts:498` |
| `stream disk-video end` | `packages/cli/src/commands/stream.commands.ts:506` |
| `user sms-send` | `packages/cli/src/commands/user.commands.ts:124` |
| `user child create` | `packages/cli/src/commands/user.commands.ts:58` |
| `user child delete` | `packages/cli/src/commands/user.commands.ts:78` |
| `user child sale-get` | `packages/cli/src/commands/user.commands.ts:82` |
| `user child update` | `packages/cli/src/commands/user.commands.ts:68` |
| `user mr-concurrency detail` | `packages/cli/src/commands/user.commands.ts:136` |
| `user org create` | `packages/cli/src/commands/user.commands.ts:92` |
| `user org delete` | `packages/cli/src/commands/user.commands.ts:98` |
| `user viewlog detail` | `packages/cli/src/commands/user.commands.ts:150` |
| `user setting pv-show update` | `packages/cli/src/commands/user.commands.ts:120` |
| `user template audio-moderation update` | `packages/cli/src/commands/user.commands.ts:197` |
| `user template playback update` | `packages/cli/src/commands/user.commands.ts:190` |
| `user template role-config update` | `packages/cli/src/commands/user.commands.ts:183` |
| `user template video-moderation update` | `packages/cli/src/commands/user.commands.ts:207` |
| `viewer import-external` | `packages/cli/src/commands/viewer.commands.ts:217` |
| `viewer lottery-wins` | `packages/cli/src/commands/viewer.commands.ts:269` |
| `viewer config update` | `packages/cli/src/commands/viewer.commands.ts:243` |
| `viewer tag add` | `packages/cli/src/commands/viewer.commands.ts:385` |
| `viewer tag remove` | `packages/cli/src/commands/viewer.commands.ts:429` |
| `viewer label channel-ref add` | `packages/cli/src/commands/viewer.commands.ts:536` |
| `watch-condition set` | `packages/cli/src/commands/watch-condition.commands.ts:80` |
| `web auth authorized-address-set` | `packages/cli/src/commands/web.commands.ts:221` |
| `web auth external-set` | `packages/cli/src/commands/web.commands.ts:215` |
| `web auth record-field-get` | `packages/cli/src/commands/web.commands.ts:232` |
| `web auth record-info-download` | `packages/cli/src/commands/web.commands.ts:245` |
| `web donate cash-update` | `packages/cli/src/commands/web.commands.ts:173` |
| `web donate good-update` | `packages/cli/src/commands/web.commands.ts:180` |
| `web info channel-logo-update` | `packages/cli/src/commands/web.commands.ts:90` |
| `web setting global-enabled-update` | `packages/cli/src/commands/web.commands.ts:198` |
| `web setting image-upload` | `packages/cli/src/commands/web.commands.ts:204` |
| `web auth whitelist upload` | `packages/cli/src/commands/web.commands.ts:251` |
