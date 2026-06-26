# CLI Integration Coverage

Generated at: 2026-06-26T20:10:31.600Z

This report measures real local CLI execution coverage in `packages/cli/tests/integration`.
Help-only invocations are tracked separately and do not count as real execution coverage.

## Summary

| Metric | Value |
|--------|-------|
| Integration files scanned | 91 |
| CLI command paths | 724 |
| Target leaf subcommands | 567 |
| Real-executed leaf subcommands | 534 |
| Missing real-execution leaf subcommands | 33 |
| Real-execution coverage | 94.18% |
| Leaf subcommands referenced including help | 544 |
| Missing including help | 23 |

## By Top-Level Command

| Command | Targets | Real Covered | Real Missing | Real Coverage | Covered Including Help | Missing Including Help |
|---------|---------|--------------|--------------|---------------|------------------------|------------------------|
| `account` | 23 | 22 | 1 | 95.65% | 22 | 1 |
| `ai` | 12 | 11 | 1 | 91.67% | 11 | 1 |
| `card-push` | 8 | 8 | 0 | 100.00% | 8 | 0 |
| `channel` | 78 | 77 | 1 | 98.72% | 78 | 0 |
| `chat` | 44 | 44 | 0 | 100.00% | 44 | 0 |
| `checkin` | 5 | 4 | 1 | 80.00% | 4 | 1 |
| `coupon` | 8 | 8 | 0 | 100.00% | 8 | 0 |
| `custom-field` | 3 | 3 | 0 | 100.00% | 3 | 0 |
| `document` | 11 | 10 | 1 | 90.91% | 10 | 1 |
| `donate` | 4 | 4 | 0 | 100.00% | 4 | 0 |
| `finance` | 7 | 7 | 0 | 100.00% | 7 | 0 |
| `global` | 4 | 4 | 0 | 100.00% | 4 | 0 |
| `group` | 16 | 10 | 6 | 62.50% | 10 | 6 |
| `interaction` | 22 | 20 | 2 | 90.91% | 22 | 0 |
| `invite-sales` | 5 | 5 | 0 | 100.00% | 5 | 0 |
| `lottery` | 24 | 24 | 0 | 100.00% | 24 | 0 |
| `material` | 7 | 7 | 0 | 100.00% | 7 | 0 |
| `monitor` | 9 | 9 | 0 | 100.00% | 9 | 0 |
| `partner` | 2 | 1 | 1 | 50.00% | 2 | 0 |
| `platform` | 22 | 21 | 1 | 95.45% | 22 | 0 |
| `playback` | 13 | 11 | 2 | 84.62% | 12 | 1 |
| `player` | 11 | 11 | 0 | 100.00% | 11 | 0 |
| `product` | 36 | 36 | 0 | 100.00% | 36 | 0 |
| `promotion` | 2 | 2 | 0 | 100.00% | 2 | 0 |
| `qa` | 9 | 8 | 1 | 88.89% | 9 | 0 |
| `questionnaire` | 6 | 6 | 0 | 100.00% | 6 | 0 |
| `record` | 17 | 6 | 11 | 35.29% | 8 | 9 |
| `robot` | 3 | 3 | 0 | 100.00% | 3 | 0 |
| `session` | 11 | 11 | 0 | 100.00% | 11 | 0 |
| `statistics` | 27 | 26 | 1 | 96.30% | 26 | 1 |
| `stream` | 19 | 17 | 2 | 89.47% | 17 | 2 |
| `transmit` | 3 | 3 | 0 | 100.00% | 3 | 0 |
| `user` | 31 | 30 | 1 | 96.77% | 31 | 0 |
| `viewer` | 19 | 19 | 0 | 100.00% | 19 | 0 |
| `watch-condition` | 2 | 2 | 0 | 100.00% | 2 | 0 |
| `web` | 34 | 34 | 0 | 100.00% | 34 | 0 |
| `webapp` | 6 | 6 | 0 | 100.00% | 6 | 0 |
| `whitelist` | 4 | 4 | 0 | 100.00% | 4 | 0 |

## Missing Real-Execution Targets

| Command | Source |
|---------|--------|
| `account api sso set` | `packages/cli/src/commands/account.commands.ts:844` |
| `ai video-produce delete` | `packages/cli/src/commands/ai.commands.ts:312` |
| `channel ppt-record add-task` | `packages/cli/src/commands/channel.commands.ts:1265` |
| `checkin session-result` | `packages/cli/src/commands/checkin.commands.ts:188` |
| `document teacher-doc relation` | `packages/cli/src/commands/document.commands.ts:502` |
| `group resource set-flow` | `packages/cli/src/commands/group.commands.ts:54` |
| `group user create` | `packages/cli/src/commands/group.commands.ts:90` |
| `group user isolation-create` | `packages/cli/src/commands/group.commands.ts:148` |
| `group user package-update` | `packages/cli/src/commands/group.commands.ts:110` |
| `group user package-validity-update` | `packages/cli/src/commands/group.commands.ts:171` |
| `group user secret-reset` | `packages/cli/src/commands/group.commands.ts:195` |
| `interaction script upload` | `packages/cli/src/commands/interaction.commands.ts:249` |
| `interaction task-reward submit-accept-info` | `packages/cli/src/commands/interaction.commands.ts:415` |
| `partner tencent-order create` | `packages/cli/src/commands/partner.commands.ts:39` |
| `platform anchor create` | `packages/cli/src/commands/platform.commands.ts:676` |
| `playback merge` | `packages/cli/src/commands/playback.commands.ts:405` |
| `playback subtitle update-batch` | `packages/cli/src/commands/playback.commands.ts:597` |
| `qa send-result` | `packages/cli/src/commands/qa.commands.ts:322` |
| `record clip` | `packages/cli/src/commands/record.commands.ts:490` |
| `record convert` | `packages/cli/src/commands/record.commands.ts:323` |
| `record merge-mp4` | `packages/cli/src/commands/record.commands.ts:503` |
| `record merge-mp4-start` | `packages/cli/src/commands/record.commands.ts:514` |
| `record set-default` | `packages/cli/src/commands/record.commands.ts:415` |
| `record breakpoint add` | `packages/cli/src/commands/record.commands.ts:581` |
| `record file convert` | `packages/cli/src/commands/record.commands.ts:561` |
| `record file merge` | `packages/cli/src/commands/record.commands.ts:540` |
| `record outline create` | `packages/cli/src/commands/record.commands.ts:595` |
| `record outline get` | `packages/cli/src/commands/record.commands.ts:606` |
| `record subtitle publish` | `packages/cli/src/commands/record.commands.ts:618` |
| `statistics export session` | `packages/cli/src/commands/statistics.commands.export.ts:273` |
| `stream push` | `packages/cli/src/commands/stream.commands.ts:543` |
| `stream disk-video end` | `packages/cli/src/commands/stream.commands.ts:506` |
| `user sms-send` | `packages/cli/src/commands/user.commands.ts:124` |
