# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **PolyV Live Monorepo** - a TypeScript/Node.js project containing:
- **SDK** (`polyv-live-api-sdk`): PolyV Live API SDK
- **CLI** (`polyv-live-cli`): Command-line interface for PolyV live streaming services
- **VOD SDK** (`polyv-vod-api-sdk`): PolyV VOD (video on-demand) API SDK
- **VOD CLI** (`polyv-vod-cli`): Command-line interface for PolyV VOD services

The VOD packages are siblings of the live packages, not part of them: the two products use
different credentials and different signing rules, and a VOD user should not have to install
the live CLI's 500-odd commands. They share no code at run time. See "VOD packages" below.

## Monorepo Structure

```
polyv-cli/
├── packages/
│   ├── sdk/                     # polyv-live-api-sdk
│   │   ├── src/
│   │   │   ├── services/        # API services (v3, v4)
│   │   │   ├── types/           # TypeScript type definitions
│   │   │   └── index.ts         # SDK entry point
│   │   └── package.json
│   └── cli/                     # polyv-live-cli
│       ├── src/
│       │   ├── commands/        # CLI command definitions
│       │   ├── handlers/        # Business logic
│       │   ├── config/          # Configuration management
│       │   └── index.ts         # CLI entry point
│       └── package.json
├── docs/                        # Project documentation
│   └── api/                     # API documentation
│       ├── coupon/              # Coupon API docs
│       ├── product/             # Product API docs
│       └── channel/             # Channel API docs
├── pnpm-workspace.yaml          # Workspace configuration
└── package.json                 # Root package.json
```

## Common Commands

```bash
# Install dependencies (from root)
pnpm install

# Build all packages
pnpm build

# Build specific package
pnpm --filter polyv-live-api-sdk build
pnpm --filter polyv-live-cli build

# Run unit tests
pnpm test:unit

# Run tests for specific package
pnpm --filter polyv-live-cli test:unit
```

## SDK Architecture

### Services

| Service | Location | Description |
|---------|----------|-------------|
| ChannelService | `packages/sdk/src/services/channel.service.ts` | Channel CRUD operations |
| V4PlatformService | `packages/sdk/src/services/v4/platform.service.ts` | Coupon management |
| AccountService | `packages/sdk/src/services/account.service.ts` | Account operations |

### Types

| Type File | Description |
|-----------|-------------|
| `types/channel.ts` | Channel and Product types |
| `types/v4-platform.ts` | Coupon types |
| `types/auth.ts` | Authentication types |

### Usage Example

```typescript
import { PolyVClient } from 'polyv-live-api-sdk';

const client = new PolyVClient({
  appId: 'your-app-id',
  appSecret: 'your-app-secret'
});

// Channel operations
const channels = await client.channel.listChannels({ pageNumber: 1, pageSize: 10 });

// Coupon operations (V4)
const couponId = await client.v4Platform.createCoupon({ ... });
const coupons = await client.v4Platform.searchCoupons({ pageNumber: 1 });

// Product operations
const products = await client.channel.getProductList({ channelId: 'xxx' });
```

## CLI Architecture

### Command Pattern

Commands are defined in `packages/cli/src/commands/*.commands.ts`:
- Use Commander.js framework
- Follow the pattern: `program.command('resource action').description('...').action(handler)`
- Handler files in `packages/cli/src/handlers/`

### Adding New Commands

1. Create command file: `src/commands/coupon.commands.ts`
2. Create handler file: `src/handlers/coupon.handler.ts`
3. Register in `src/index.ts`
4. Add types if needed: reference SDK types

### Authentication

CLI supports multiple auth sources (priority order):
1. Command-line parameters: `--appId`, `--appSecret`, `--userId`
2. Session account: `polyv-live-cli use <account-name>`
3. Environment variables: `POLYV_APP_ID`, `POLYV_APP_SECRET`
4. Default account: `polyv-live-cli account set-default <name>`
5. Global config: `polyv-live-cli config set`

## API Documentation

When implementing new features, use the project-maintained API indexes first, then read the raw API docs from the document-center checkout.

- API index: `docs/api-reference/MODULE_DOC_MAPPING.json`
- Command guide: `docs/api-reference/CLI_COMMANDS_GUIDE.md`
- Raw API docs root: `../document-center/docs/live/api` relative to the repository root
- Override raw docs root with `POLYV_API_DOCS_DIR`

| Feature | Doc Location |
|---------|--------------|
| Coupon | `v4/platform/user_coupon_*.md` under the raw docs root |
| Product | `channel/operate/*product*.md` and `v4/user/product/` under the raw docs root |
| Channel | `channel/` and `v4/channel/` under the raw docs root |

## Signature Mechanism

PolyV API uses MD5-based signature authentication:
1. Sort parameters by key name
2. Concatenate: `key1value1key2value2...`
3. Build: `appSecret + concatenated_params + appSecret`
4. Generate MD5 hash (uppercase)

This is the live API's rule. The VOD API signs differently; see the next section.

## VOD packages

VOD lives in `packages/vod-sdk` and `packages/vod-cli`, with its skill in `skills/polyv-vod-cli`.
The plan and the findings it rests on are in `docs/vod-cli-development-plan.md`.

**Credentials are not shared with live.** VOD uses `userId` / `secretKey` / `writeToken` (plus the
account's `appId` / `appSecret` for two V4 endpoints); live uses `appId` / `appSecret`. The VOD CLI
keeps its accounts in `~/.polyv-vod/`, apart from the live CLI's `~/.polyv`, and reads
`POLYV_VOD_USER_ID` / `POLYV_VOD_SECRET_KEY` rather than the live CLI's `POLYV_USER_ID`.

**Signing is per endpoint, and the public docs are wrong on a few endpoints.** The rules were
verified against the live API and cross-checked with the official Java SDK
(`polyv-java-sdk/polyv-java-vod-sdk`), and they are encoded in `packages/vod-sdk/src`:

| Case | Rule |
|------|------|
| Most endpoints | every non-empty parameter sent, sorted as `k=v&k=v`, then `secretkey`; SHA1 upper-case. Values are raw, never URL-encoded |
| A few endpoints sign a fixed key set | `cataJson` → `{userid, ptime}`; `updateCata`, `deleteCata` → `{userid, <id field>, ptime}`; `changeCata` → `{userid, vids, cataid, ptime}`; daily view log → `{userid, day, ptime}` |
| Play token | MD5 with `secretkey` on both ends |
| V4 endpoints (`callback get/set`) | `appId` / `timestamp` / `requestId`, MD5 with `appSecret`, as in live. The platform signs every parameter it receives: a `requestId` that is sent but not signed is rejected with HTTP 403 `签名错误` |
| Direct upload | no signature; `writetoken` |

The V4 pair is the account's AppID / AppSecret, the one shown in the live console under
设置 → 开发设置 → 开发者信息. The VOD docs do not mention it: their key page lists only the
userId, secretKey and the two tokens.

Before changing a signer or adding an endpoint, check `VodBaseService.commonRequestLogic` in the
Java SDK for that endpoint, and confirm against the real API. Do not infer the signed fields from
the public docs alone.

**The chunked upload protocol is not in the public docs.** It follows the Java SDK's `upload`
package: `POST /v2/uploadvideo/{userid}/init` reserves a vid and returns temporary storage
credentials; the file is uploaded as a multipart upload to Huawei OBS or Aliyun OSS (both are
implemented, hand-signed, with no runtime dependency); the complete request carries a callback
through which the storage notifies the platform. Its response contains temporary secrets: never
log or print it.

**Platform behaviour that is easy to get wrong:**

- `deleteVideos` answering 200 does not mean every video is gone: vids the platform skipped are
  in `skipped`. A video uploaded moments ago may be skipped.
- Status `6` (just uploaded), `41` (not playable) and `61` (restored from the recycle bin) are
  not in the public docs; they were observed on the platform. `41` is treated as a final failure.
- The video record appears right after a chunked upload completes; transcoding starts about a
  minute later and takes about 80 seconds for a small clip.

**VOD CLI conventions** (they differ from the live CLI in places; follow these for VOD code):

- Layers: `commands/` → `core/context.ts` executors → `polyv-vod-api-sdk`. There is no separate
  handler or service layer.
- A command gets its options and positional arguments through `optionsOf(this, args)`. Commander
  passes positional arguments to the action handler, not through `opts()`.
- A command reports failure through `ctx.err('❌ …')` and `ctx.fail()`. Nothing but `src/index.ts`
  touches `process.exitCode`; the exit state lives in `ctx.state` because contexts are copied with
  object spread.
- Results go to stdout, diagnostics to stderr, so `-o json` output stays parseable.
- Every command that calls the platform requires `--source <id>`, as in the live CLI. Offline
  commands are exempt: `account`, `use`, `auth`, `callback verify`.
- API-bound commands live or die by the SDK's methods: declare what each endpoint signs in the
  SDK, keep the CLI a thin layer over it.
- Tests drive `run(argv, ctx)` with the platform replaced by a stand-in
  (`src/__tests__/harness.ts`), the same path the binary takes. Add a case there for every new
  command: positional arguments, the JSON output, the failure exit code.

```bash
# VOD packages
pnpm --filter polyv-vod-api-sdk build
pnpm --filter polyv-vod-api-sdk test:unit          # vitest
pnpm --filter polyv-vod-api-sdk test:integration   # real account: needs packages/vod-sdk/.env.test
pnpm --filter polyv-vod-cli build                  # also writes dist/version.json
pnpm --filter polyv-vod-cli test:unit              # jest
pnpm --filter polyv-vod-cli typecheck              # includes the tests
```

The VOD SDK's types are generated from the VOD API docs (`../document-center/docs/vod/api`,
override with `POLYV_VOD_API_DOCS_DIR`) and committed; the generator names types after the doc
files. Regenerate with `pnpm --filter polyv-vod-api-sdk types:generate`.

**Skills and their packaged copies.** A skill under `skills/` is embedded in an expert package
(`experts/*/skills/`) and in a connector (`connectors/*/skills/`). The copies are generated, not
hand-edited: run `node scripts/sync-packaged-skills.mjs` after changing a skill, and check with
`pnpm skill:sync:check`. The connector copy rewrites the CLI prefix from the npx form to the
installed command, which is why it is generated rather than copied. `pnpm skill:check` checks each
skill against its own CLI; `pnpm skill:command-index` regenerates the VOD skill's command index
from the CLI's command tree.

**Releasing.** A tag publishes one package; `scripts/release-package.mjs` maps tag prefixes to
packages and is the single source for `scripts/release.sh` and the release workflow. Note that the
glob `v*` also matches `vod-v*`, so never decide which package a tag publishes by "starts with v".
Publish `polyv-vod-api-sdk` before a `polyv-vod-cli` version that depends on it.

**Tests against the real platform** (`packages/vod-sdk/tests/integration`) create videos and a
category and remove them afterwards. They upload real video files: the platform cannot delete
records made from non-video content, and such records are left behind. They verify each removal by
fetching the object, because a search returning nothing does not prove an object is gone.

`callback.test.ts` only reads and writes the callback setting. It needs `POLYV_VOD_APP_ID` /
`POLYV_VOD_APP_SECRET` as well and is skipped without them. The platform reports "no callback"
as `null` for an account that never had one and as `""` after one is cleared; treat both as unset.

## Development Guidelines

- Use `workspace:*` for internal package dependencies
- Follow existing command patterns in CLI
- Reference SDK types from `polyv-live-api-sdk`
- Run `pnpm test:unit` before committing
- Coverage target: 80%

## Package Manager

This project uses **pnpm** with workspace support:
- Use `pnpm` instead of `npm`
- Workspace protocol: `"polyv-live-api-sdk": "workspace:*"`
- Changesets for versioning: `pnpm changeset`
