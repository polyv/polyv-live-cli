# CLI Integration Coverage

Generated at: 2026-06-27T04:38:12.460Z

This report measures real local CLI execution coverage in `packages/cli/tests/integration`.
Help-only invocations are tracked separately and do not count as real execution coverage.

## Summary

| Metric | Value |
|--------|-------|
| Integration files scanned | 92 |
| CLI command paths | 724 |
| Target leaf subcommands | 567 |
| Real-executed leaf subcommands | 558 |
| Missing real-execution leaf subcommands | 9 |
| Real-execution coverage | 98.41% |
| Leaf subcommands referenced including help | 564 |
| Missing including help | 3 |

## By Top-Level Command

| Command | Targets | Real Covered | Real Missing | Real Coverage | Covered Including Help | Missing Including Help |
|---------|---------|--------------|--------------|---------------|------------------------|------------------------|
| `account` | 23 | 22 | 1 | 95.65% | 22 | 1 |
| `ai` | 12 | 12 | 0 | 100.00% | 12 | 0 |
| `card-push` | 8 | 8 | 0 | 100.00% | 8 | 0 |
| `channel` | 78 | 78 | 0 | 100.00% | 78 | 0 |
| `chat` | 44 | 44 | 0 | 100.00% | 44 | 0 |
| `checkin` | 5 | 5 | 0 | 100.00% | 5 | 0 |
| `coupon` | 8 | 8 | 0 | 100.00% | 8 | 0 |
| `custom-field` | 3 | 3 | 0 | 100.00% | 3 | 0 |
| `document` | 11 | 10 | 1 | 90.91% | 10 | 1 |
| `donate` | 4 | 4 | 0 | 100.00% | 4 | 0 |
| `finance` | 7 | 7 | 0 | 100.00% | 7 | 0 |
| `global` | 4 | 4 | 0 | 100.00% | 4 | 0 |
| `group` | 16 | 16 | 0 | 100.00% | 16 | 0 |
| `interaction` | 22 | 20 | 2 | 90.91% | 22 | 0 |
| `invite-sales` | 5 | 5 | 0 | 100.00% | 5 | 0 |
| `lottery` | 24 | 24 | 0 | 100.00% | 24 | 0 |
| `material` | 7 | 7 | 0 | 100.00% | 7 | 0 |
| `monitor` | 9 | 9 | 0 | 100.00% | 9 | 0 |
| `partner` | 2 | 1 | 1 | 50.00% | 2 | 0 |
| `platform` | 22 | 21 | 1 | 95.45% | 22 | 0 |
| `playback` | 13 | 13 | 0 | 100.00% | 13 | 0 |
| `player` | 11 | 11 | 0 | 100.00% | 11 | 0 |
| `product` | 36 | 36 | 0 | 100.00% | 36 | 0 |
| `promotion` | 2 | 2 | 0 | 100.00% | 2 | 0 |
| `qa` | 9 | 8 | 1 | 88.89% | 9 | 0 |
| `questionnaire` | 6 | 6 | 0 | 100.00% | 6 | 0 |
| `record` | 17 | 17 | 0 | 100.00% | 17 | 0 |
| `robot` | 3 | 3 | 0 | 100.00% | 3 | 0 |
| `session` | 11 | 11 | 0 | 100.00% | 11 | 0 |
| `statistics` | 27 | 27 | 0 | 100.00% | 27 | 0 |
| `stream` | 19 | 18 | 1 | 94.74% | 18 | 1 |
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
| `document teacher-doc relation` | `packages/cli/src/commands/document.commands.ts:502` |
| `interaction script upload` | `packages/cli/src/commands/interaction.commands.ts:249` |
| `interaction task-reward submit-accept-info` | `packages/cli/src/commands/interaction.commands.ts:415` |
| `partner tencent-order create` | `packages/cli/src/commands/partner.commands.ts:39` |
| `platform anchor create` | `packages/cli/src/commands/platform.commands.ts:676` |
| `qa send-result` | `packages/cli/src/commands/qa.commands.ts:322` |
| `stream push` | `packages/cli/src/commands/stream.commands.ts:543` |
| `user sms-send` | `packages/cli/src/commands/user.commands.ts:124` |
