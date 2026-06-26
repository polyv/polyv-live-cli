# CLI Integration Coverage

Generated at: 2026-06-26T18:30:55.140Z

This report measures real local CLI execution coverage in `packages/cli/tests/integration`.
Help-only invocations are tracked separately and do not count as real execution coverage.

## Summary

| Metric | Value |
|--------|-------|
| Integration files scanned | 89 |
| CLI command paths | 724 |
| Target leaf subcommands | 567 |
| Real-executed leaf subcommands | 505 |
| Missing real-execution leaf subcommands | 62 |
| Real-execution coverage | 89.07% |
| Leaf subcommands referenced including help | 521 |
| Missing including help | 46 |

## By Top-Level Command

| Command | Targets | Real Covered | Real Missing | Real Coverage | Covered Including Help | Missing Including Help |
|---------|---------|--------------|--------------|---------------|------------------------|------------------------|
| `account` | 23 | 22 | 1 | 95.65% | 22 | 1 |
| `ai` | 12 | 10 | 2 | 83.33% | 10 | 2 |
| `card-push` | 8 | 8 | 0 | 100.00% | 8 | 0 |
| `channel` | 78 | 76 | 2 | 97.44% | 78 | 0 |
| `chat` | 44 | 44 | 0 | 100.00% | 44 | 0 |
| `checkin` | 5 | 4 | 1 | 80.00% | 4 | 1 |
| `coupon` | 8 | 8 | 0 | 100.00% | 8 | 0 |
| `custom-field` | 3 | 3 | 0 | 100.00% | 3 | 0 |
| `document` | 11 | 9 | 2 | 81.82% | 10 | 1 |
| `donate` | 4 | 4 | 0 | 100.00% | 4 | 0 |
| `finance` | 7 | 7 | 0 | 100.00% | 7 | 0 |
| `global` | 4 | 4 | 0 | 100.00% | 4 | 0 |
| `group` | 16 | 1 | 15 | 6.25% | 2 | 14 |
| `interaction` | 22 | 20 | 2 | 90.91% | 22 | 0 |
| `invite-sales` | 5 | 5 | 0 | 100.00% | 5 | 0 |
| `lottery` | 24 | 24 | 0 | 100.00% | 24 | 0 |
| `material` | 7 | 6 | 1 | 85.71% | 7 | 0 |
| `monitor` | 9 | 9 | 0 | 100.00% | 9 | 0 |
| `partner` | 2 | 1 | 1 | 50.00% | 2 | 0 |
| `platform` | 22 | 21 | 1 | 95.45% | 22 | 0 |
| `playback` | 13 | 6 | 7 | 46.15% | 7 | 6 |
| `player` | 11 | 11 | 0 | 100.00% | 11 | 0 |
| `product` | 36 | 36 | 0 | 100.00% | 36 | 0 |
| `promotion` | 2 | 2 | 0 | 100.00% | 2 | 0 |
| `qa` | 9 | 8 | 1 | 88.89% | 9 | 0 |
| `questionnaire` | 6 | 6 | 0 | 100.00% | 6 | 0 |
| `record` | 17 | 5 | 12 | 29.41% | 7 | 10 |
| `robot` | 3 | 3 | 0 | 100.00% | 3 | 0 |
| `session` | 11 | 6 | 5 | 54.55% | 6 | 5 |
| `statistics` | 27 | 26 | 1 | 96.30% | 26 | 1 |
| `stream` | 19 | 14 | 5 | 73.68% | 14 | 5 |
| `transmit` | 3 | 3 | 0 | 100.00% | 3 | 0 |
| `user` | 31 | 30 | 1 | 96.77% | 31 | 0 |
| `viewer` | 19 | 18 | 1 | 94.74% | 19 | 0 |
| `watch-condition` | 2 | 2 | 0 | 100.00% | 2 | 0 |
| `web` | 34 | 33 | 1 | 97.06% | 34 | 0 |
| `webapp` | 6 | 6 | 0 | 100.00% | 6 | 0 |
| `whitelist` | 4 | 4 | 0 | 100.00% | 4 | 0 |

## Missing Real-Execution Targets

| Command | Source |
|---------|--------|
| `account api sso set` | `packages/cli/src/commands/account.commands.ts:844` |
| `ai video-produce delete` | `packages/cli/src/commands/ai.commands.ts:312` |
| `ai video-produce ppt async-upload` | `packages/cli/src/commands/ai.commands.ts:396` |
| `channel ccb-focus-reset` | `packages/cli/src/commands/channel.commands.ts:1460` |
| `channel ppt-record add-task` | `packages/cli/src/commands/channel.commands.ts:1265` |
| `checkin session-result` | `packages/cli/src/commands/checkin.commands.ts:188` |
| `document media link` | `packages/cli/src/commands/document.commands.ts:534` |
| `document teacher-doc relation` | `packages/cli/src/commands/document.commands.ts:502` |
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
| `interaction script upload` | `packages/cli/src/commands/interaction.commands.ts:249` |
| `interaction task-reward submit-accept-info` | `packages/cli/src/commands/interaction.commands.ts:415` |
| `material delete` | `packages/cli/src/commands/material.commands.ts:40` |
| `partner tencent-order create` | `packages/cli/src/commands/partner.commands.ts:39` |
| `platform anchor create` | `packages/cli/src/commands/platform.commands.ts:676` |
| `playback add-vod` | `packages/cli/src/commands/playback.commands.ts:543` |
| `playback delete` | `packages/cli/src/commands/playback.commands.ts:319` |
| `playback merge` | `packages/cli/src/commands/playback.commands.ts:405` |
| `playback sort move` | `packages/cli/src/commands/playback.commands.ts:572` |
| `playback sort set` | `packages/cli/src/commands/playback.commands.ts:583` |
| `playback subtitle update-batch` | `packages/cli/src/commands/playback.commands.ts:597` |
| `playback title update` | `packages/cli/src/commands/playback.commands.ts:558` |
| `qa send-result` | `packages/cli/src/commands/qa.commands.ts:322` |
| `record clip` | `packages/cli/src/commands/record.commands.ts:490` |
| `record convert` | `packages/cli/src/commands/record.commands.ts:323` |
| `record merge-mp4` | `packages/cli/src/commands/record.commands.ts:503` |
| `record merge-mp4-start` | `packages/cli/src/commands/record.commands.ts:514` |
| `record set-default` | `packages/cli/src/commands/record.commands.ts:415` |
| `record breakpoint add` | `packages/cli/src/commands/record.commands.ts:581` |
| `record file convert` | `packages/cli/src/commands/record.commands.ts:561` |
| `record file delete` | `packages/cli/src/commands/record.commands.ts:551` |
| `record file merge` | `packages/cli/src/commands/record.commands.ts:540` |
| `record outline create` | `packages/cli/src/commands/record.commands.ts:595` |
| `record outline get` | `packages/cli/src/commands/record.commands.ts:606` |
| `record subtitle publish` | `packages/cli/src/commands/record.commands.ts:618` |
| `session create` | `packages/cli/src/commands/session.commands.ts:313` |
| `session delete` | `packages/cli/src/commands/session.commands.ts:338` |
| `session get` | `packages/cli/src/commands/session.commands.ts:221` |
| `session update` | `packages/cli/src/commands/session.commands.ts:325` |
| `session external get` | `packages/cli/src/commands/session.commands.ts:351` |
| `statistics export session` | `packages/cli/src/commands/statistics.commands.export.ts:273` |
| `stream capture` | `packages/cli/src/commands/stream.commands.ts:475` |
| `stream monitor` | `packages/cli/src/commands/stream.commands.ts:713` |
| `stream push` | `packages/cli/src/commands/stream.commands.ts:543` |
| `stream disk-video add` | `packages/cli/src/commands/stream.commands.ts:489` |
| `stream disk-video end` | `packages/cli/src/commands/stream.commands.ts:506` |
| `user sms-send` | `packages/cli/src/commands/user.commands.ts:124` |
| `viewer config update` | `packages/cli/src/commands/viewer.commands.ts:243` |
| `web setting global-enabled-update` | `packages/cli/src/commands/web.commands.ts:198` |
