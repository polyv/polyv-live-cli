# CLI Integration Coverage

Generated at: 2026-06-24T23:30:51.297Z

This report measures real local CLI execution coverage in `packages/cli/tests/integration`.
Help-only invocations are tracked separately and do not count as real execution coverage.

## Summary

| Metric | Value |
|--------|-------|
| Integration files scanned | 87 |
| CLI command paths | 724 |
| Target leaf subcommands | 567 |
| Real-executed leaf subcommands | 439 |
| Missing real-execution leaf subcommands | 128 |
| Real-execution coverage | 77.43% |
| Leaf subcommands referenced including help | 482 |
| Missing including help | 85 |

## By Top-Level Command

| Command | Targets | Real Covered | Real Missing | Real Coverage | Covered Including Help | Missing Including Help |
|---------|---------|--------------|--------------|---------------|------------------------|------------------------|
| `account` | 23 | 22 | 1 | 95.65% | 22 | 1 |
| `ai` | 12 | 9 | 3 | 75.00% | 9 | 3 |
| `card-push` | 8 | 8 | 0 | 100.00% | 8 | 0 |
| `channel` | 78 | 71 | 7 | 91.03% | 77 | 1 |
| `chat` | 44 | 40 | 4 | 90.91% | 42 | 2 |
| `checkin` | 5 | 3 | 2 | 60.00% | 3 | 2 |
| `coupon` | 8 | 8 | 0 | 100.00% | 8 | 0 |
| `custom-field` | 3 | 3 | 0 | 100.00% | 3 | 0 |
| `document` | 11 | 6 | 5 | 54.55% | 7 | 4 |
| `donate` | 4 | 3 | 1 | 75.00% | 4 | 0 |
| `finance` | 7 | 1 | 6 | 14.29% | 2 | 5 |
| `global` | 4 | 2 | 2 | 50.00% | 4 | 0 |
| `group` | 16 | 1 | 15 | 6.25% | 2 | 14 |
| `interaction` | 22 | 14 | 8 | 63.64% | 18 | 4 |
| `invite-sales` | 5 | 2 | 3 | 40.00% | 5 | 0 |
| `lottery` | 24 | 21 | 3 | 87.50% | 23 | 1 |
| `material` | 7 | 6 | 1 | 85.71% | 7 | 0 |
| `monitor` | 9 | 8 | 1 | 88.89% | 9 | 0 |
| `partner` | 2 | 1 | 1 | 50.00% | 2 | 0 |
| `platform` | 22 | 18 | 4 | 81.82% | 20 | 2 |
| `playback` | 13 | 5 | 8 | 38.46% | 6 | 7 |
| `player` | 11 | 8 | 3 | 72.73% | 8 | 3 |
| `product` | 36 | 33 | 3 | 91.67% | 34 | 2 |
| `promotion` | 2 | 2 | 0 | 100.00% | 2 | 0 |
| `qa` | 9 | 8 | 1 | 88.89% | 9 | 0 |
| `questionnaire` | 6 | 6 | 0 | 100.00% | 6 | 0 |
| `record` | 17 | 5 | 12 | 29.41% | 7 | 10 |
| `robot` | 3 | 3 | 0 | 100.00% | 3 | 0 |
| `session` | 11 | 3 | 8 | 27.27% | 4 | 7 |
| `statistics` | 27 | 25 | 2 | 92.59% | 25 | 2 |
| `stream` | 19 | 12 | 7 | 63.16% | 13 | 6 |
| `transmit` | 3 | 3 | 0 | 100.00% | 3 | 0 |
| `user` | 31 | 24 | 7 | 77.42% | 28 | 3 |
| `viewer` | 19 | 17 | 2 | 89.47% | 18 | 1 |
| `watch-condition` | 2 | 2 | 0 | 100.00% | 2 | 0 |
| `web` | 34 | 26 | 8 | 76.47% | 29 | 5 |
| `webapp` | 6 | 6 | 0 | 100.00% | 6 | 0 |
| `whitelist` | 4 | 4 | 0 | 100.00% | 4 | 0 |

## Missing Real-Execution Targets

| Command | Source |
|---------|--------|
| `account api sso set` | `packages/cli/src/commands/account.commands.ts:844` |
| `ai digital-human set-org` | `packages/cli/src/commands/ai.commands.ts:189` |
| `ai video-produce delete` | `packages/cli/src/commands/ai.commands.ts:310` |
| `ai video-produce ppt async-upload` | `packages/cli/src/commands/ai.commands.ts:394` |
| `channel ccb-focus-reset` | `packages/cli/src/commands/channel.commands.ts:1459` |
| `channel distribute create-batch` | `packages/cli/src/commands/channel.commands.ts:1134` |
| `channel distribute delete-batch` | `packages/cli/src/commands/channel.commands.ts:1164` |
| `channel distribute switch` | `packages/cli/src/commands/channel.commands.ts:1194` |
| `channel distribute update-batch` | `packages/cli/src/commands/channel.commands.ts:1149` |
| `channel ppt-record add-task` | `packages/cli/src/commands/channel.commands.ts:1264` |
| `channel ppt-record delete` | `packages/cli/src/commands/channel.commands.ts:1271` |
| `chat message audit` | `packages/cli/src/commands/chat.commands.ts:534` |
| `chat message remove-contents` | `packages/cli/src/commands/chat.commands.ts:505` |
| `chat role admin-update` | `packages/cli/src/commands/chat.commands.ts:714` |
| `chat role user-list` | `packages/cli/src/commands/chat.commands.ts:744` |
| `checkin result` | `packages/cli/src/commands/checkin.commands.ts:148` |
| `checkin session-result` | `packages/cli/src/commands/checkin.commands.ts:188` |
| `document media link` | `packages/cli/src/commands/document.commands.ts:534` |
| `document media unlink` | `packages/cli/src/commands/document.commands.ts:543` |
| `document media user-delete` | `packages/cli/src/commands/document.commands.ts:559` |
| `document media user-detail` | `packages/cli/src/commands/document.commands.ts:552` |
| `document teacher-doc relation` | `packages/cli/src/commands/document.commands.ts:502` |
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
| `interaction reward` | `packages/cli/src/commands/interaction.commands.ts:67` |
| `interaction event delete` | `packages/cli/src/commands/interaction.commands.ts:189` |
| `interaction event save` | `packages/cli/src/commands/interaction.commands.ts:173` |
| `interaction script delete` | `packages/cli/src/commands/interaction.commands.ts:263` |
| `interaction script query` | `packages/cli/src/commands/interaction.commands.ts:233` |
| `interaction script upload` | `packages/cli/src/commands/interaction.commands.ts:245` |
| `interaction task-reward submit-accept-info` | `packages/cli/src/commands/interaction.commands.ts:411` |
| `interaction task-reward viewer-list` | `packages/cli/src/commands/interaction.commands.ts:397` |
| `invite-sales add` | `packages/cli/src/commands/invite-sales.commands.ts:40` |
| `invite-sales remove` | `packages/cli/src/commands/invite-sales.commands.ts:56` |
| `invite-sales update` | `packages/cli/src/commands/invite-sales.commands.ts:48` |
| `lottery download-winners` | `packages/cli/src/commands/lottery.commands.ts:491` |
| `lottery receive-info` | `packages/cli/src/commands/lottery.commands.ts:524` |
| `lottery lucky-bag winners` | `packages/cli/src/commands/lottery.commands.ts:762` |
| `material delete` | `packages/cli/src/commands/material.commands.ts:40` |
| `monitor tencent-stream-info-list` | `packages/cli/src/commands/monitor.commands.ts:73` |
| `partner tencent-order create` | `packages/cli/src/commands/partner.commands.ts:39` |
| `platform anchor create` | `packages/cli/src/commands/platform.commands.ts:663` |
| `platform anchor update` | `packages/cli/src/commands/platform.commands.ts:694` |
| `platform anchor update-status` | `packages/cli/src/commands/platform.commands.ts:729` |
| `platform coupon update` | `packages/cli/src/commands/platform.commands.ts:862` |
| `playback add-vod` | `packages/cli/src/commands/playback.commands.ts:543` |
| `playback delete` | `packages/cli/src/commands/playback.commands.ts:319` |
| `playback get` | `packages/cli/src/commands/playback.commands.ts:241` |
| `playback merge` | `packages/cli/src/commands/playback.commands.ts:405` |
| `playback sort move` | `packages/cli/src/commands/playback.commands.ts:572` |
| `playback sort set` | `packages/cli/src/commands/playback.commands.ts:583` |
| `playback subtitle update-batch` | `packages/cli/src/commands/playback.commands.ts:597` |
| `playback title update` | `packages/cli/src/commands/playback.commands.ts:558` |
| `player marquee-url` | `packages/cli/src/commands/player.commands.ts:451` |
| `player advert head-update` | `packages/cli/src/commands/player.commands.ts:469` |
| `player anti-record get` | `packages/cli/src/commands/player.commands.ts:413` |
| `product reference` | `packages/cli/src/commands/product.commands.ts:727` |
| `product order batch-status` | `packages/cli/src/commands/product.commands.ts:973` |
| `product order get` | `packages/cli/src/commands/product.commands.ts:964` |
| `qa send-result` | `packages/cli/src/commands/qa.commands.ts:322` |
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
| `record subtitle publish` | `packages/cli/src/commands/record.commands.ts:608` |
| `session create` | `packages/cli/src/commands/session.commands.ts:313` |
| `session delete` | `packages/cli/src/commands/session.commands.ts:338` |
| `session get` | `packages/cli/src/commands/session.commands.ts:221` |
| `session update` | `packages/cli/src/commands/session.commands.ts:325` |
| `session external file-ids` | `packages/cli/src/commands/session.commands.ts:367` |
| `session external get` | `packages/cli/src/commands/session.commands.ts:351` |
| `session external relevance` | `packages/cli/src/commands/session.commands.ts:375` |
| `session external session-list` | `packages/cli/src/commands/session.commands.ts:359` |
| `statistics inviter-poster-list` | `packages/cli/src/commands/statistics.commands.ts:205` |
| `statistics export session` | `packages/cli/src/commands/statistics.commands.export.ts:273` |
| `stream capture` | `packages/cli/src/commands/stream.commands.ts:475` |
| `stream monitor` | `packages/cli/src/commands/stream.commands.ts:713` |
| `stream push` | `packages/cli/src/commands/stream.commands.ts:543` |
| `stream verify` | `packages/cli/src/commands/stream.commands.ts:622` |
| `stream disk-video add` | `packages/cli/src/commands/stream.commands.ts:489` |
| `stream disk-video delete` | `packages/cli/src/commands/stream.commands.ts:498` |
| `stream disk-video end` | `packages/cli/src/commands/stream.commands.ts:506` |
| `user sms-send` | `packages/cli/src/commands/user.commands.ts:124` |
| `user child sale-get` | `packages/cli/src/commands/user.commands.ts:82` |
| `user mr-concurrency detail` | `packages/cli/src/commands/user.commands.ts:136` |
| `user viewlog detail` | `packages/cli/src/commands/user.commands.ts:150` |
| `user setting pv-show update` | `packages/cli/src/commands/user.commands.ts:120` |
| `user template playback update` | `packages/cli/src/commands/user.commands.ts:190` |
| `user template role-config update` | `packages/cli/src/commands/user.commands.ts:183` |
| `viewer lottery-wins` | `packages/cli/src/commands/viewer.commands.ts:269` |
| `viewer config update` | `packages/cli/src/commands/viewer.commands.ts:243` |
| `web auth record-field-get` | `packages/cli/src/commands/web.commands.ts:232` |
| `web auth record-info-download` | `packages/cli/src/commands/web.commands.ts:245` |
| `web donate cash-update` | `packages/cli/src/commands/web.commands.ts:173` |
| `web donate good-update` | `packages/cli/src/commands/web.commands.ts:180` |
| `web info channel-logo-update` | `packages/cli/src/commands/web.commands.ts:90` |
| `web setting global-enabled-update` | `packages/cli/src/commands/web.commands.ts:198` |
| `web setting image-upload` | `packages/cli/src/commands/web.commands.ts:204` |
| `web auth whitelist upload` | `packages/cli/src/commands/web.commands.ts:251` |
