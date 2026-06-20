# PolyV Live CLI

`polyv-live-cli` is an agent-friendly command line tool for managing PolyV live streaming accounts, channels, streams, products, coupons, playback, documents, sessions, chat, interaction tools, viewers, player settings, watch pages, and statistics.

The CLI is designed for both human operators and AI agents:

- every command exposes `--help`;
- most data commands support table and JSON output;
- account configuration can be reused across commands;
- destructive or state-changing commands use confirmation prompts or `--force` where supported.

## Install

Use the latest published CLI directly:

```bash
npx --yes polyv-live-cli@latest --help
```

Or install it globally:

```bash
npm install -g polyv-live-cli
polyv-live-cli --help
```

Node.js 18 or later is required.

## Authentication

Add an account and set it as default:

```bash
polyv-live-cli account add production --app-id <appId> --app-secret <appSecret> --user-id <userId>
polyv-live-cli account set-default production
polyv-live-cli account current
```

Switch the current shell session to a named account:

```bash
polyv-live-cli use production
```

Use one account for a single command:

```bash
polyv-live-cli channel list -a production -o json
```

Or pass credentials directly when automation requires it:

```bash
polyv-live-cli channel list --appId <appId> --appSecret <appSecret> --userId <userId> -o json
```

Do not print or log AppSecret. Stream keys returned by `stream get-key -o json` are also sensitive and should only be sent to trusted streaming software.

## Common Flows

Create and inspect a channel:

```bash
polyv-live-cli channel create -n "Product Launch" --scene topclass --template ppt -o json
polyv-live-cli channel list -P 1 -l 20 -o json
polyv-live-cli channel get -c <channelId> -o json
```

Check stream status and get OBS credentials:

```bash
polyv-live-cli stream status -c <channelId> -o json
polyv-live-cli stream get-key -c <channelId> -o json
```

Manage products and coupons:

```bash
polyv-live-cli product list -c <channelId> -o json
polyv-live-cli coupon add --name "Full 100 minus 20" --type MAX_OUT --availableAmount 100 \
  --receiveStart 1704067200000 --receiveEnd 1704153600000 \
  --useTimeType RANGE --useStart 1704067200000 --useEnd 1704758400000 \
  --condition FULL_REDUCE --full 100 --reduce 20 --limitPerPerson 1 -o json
polyv-live-cli coupon list -o json
```

Query playback, documents, sessions, and statistics:

```bash
polyv-live-cli playback list -c <channelId> -o json
polyv-live-cli document list -c <channelId> -o json
polyv-live-cli session list -c <channelId> -o json
polyv-live-cli statistics view -c <channelId> --start-day 2026-06-01 --end-day 2026-06-20 -o json
```

Preview the built-in e-commerce scene before writing data:

```bash
polyv-live-cli setup e-commerce --dry-run -o json
```

## Command Groups

The current CLI exposes 40 top-level commands. Use top-level help first, then the deepest subcommand help before running a write operation.

```bash
polyv-live-cli --help
polyv-live-cli channel --help
polyv-live-cli channel create --help
```

Main command families:

| Area | Commands |
| --- | --- |
| Accounts and configuration | `account`, `use`, `platform`, `global`, `user`, `group`, `partner` |
| Channel and stream operations | `channel`, `stream`, `monitor`, `transmit` |
| Marketing and commerce | `product`, `coupon`, `card-push`, `promotion` |
| Content and playback | `playback`, `record`, `document`, `session`, `material`, `webapp` |
| Interactions | `chat`, `lottery`, `checkin`, `qa`, `questionnaire`, `donate`, `interaction`, `robot` |
| Viewers and access control | `viewer`, `watch-condition`, `whitelist`, `custom-field`, `invite-sales` |
| Player, watch page, data, and AI | `player`, `web`, `statistics`, `finance`, `ai` |
| Workflow templates | `setup` |

## Safety

Commands that create, update, delete, start, stop, push, send, merge, transcode, import, batch-update, or change global/channel settings can affect live data. Confirm the target account, channel ID, and object ID before running them. Use `--force` only after the user or operator has explicitly approved the operation.

For tests or release validation, prefer temporary channels and clean them up afterwards instead of mutating a long-lived configured channel.

## Development

From the repository root:

```bash
pnpm install
pnpm --filter polyv-live-cli build
pnpm --filter polyv-live-cli test
pnpm --filter polyv-live-cli test:integration
```

Generate API and CLI inventory reports:

```bash
pnpm api:inventory
pnpm cli:inventory
```

Run the local built CLI:

```bash
node packages/cli/dist/index.js --help
```

## Release

Dry-run the package before publishing:

```bash
pnpm release:cli:dry
```

Publish only after the package version has been bumped beyond the current npm version and the build, tests, inventory checks, and `git diff --check` pass.
