# 命令索引

由 `polyv-vod-cli@0.1.0` 的命令树生成，不要手工编辑。命令或参数变动后运行 `node scripts/generate-skill-command-index.mjs polyv-vod-cli` 重新生成。

本文档和其它 reference 中的 `<CLI>` 表示 `npx --yes polyv-vod-cli@latest`。标 **（必填）** 的选项不给时命令不执行。

## 全局选项

这些选项可以放在任何命令上。

| 选项 | 说明 |
|---|---|
| `--userId` | VOD user id (with --secretKey) |
| `--secretKey` | VOD secretkey (with --userId) |
| `--writeToken` | VOD writetoken |
| `--appId` | Account API appId; only V4 endpoints need it |
| `--appSecret` | Account API appSecret; only V4 endpoints need it |
| `-a, --account` | use a saved account |
| `--verbose` | show where the credentials come from |
| `--source` | 调用方来源标识（API 命令必填）：官方平台连接器传平台名（如 workbuddy），其它 agent 传自身名称（如 codex） |

## account

Manage saved VOD accounts

### account add

Save a VOD account

Usage: polyv-vod-cli account add [options] <name>

| 选项 | 说明 |
|---|---|
| `--user-id` | VOD user id **（必填）** |
| `--secret-key` | VOD secretkey **（必填）** |
| `--write-token` | VOD writetoken; uploads need it |
| `--read-token` | VOD readtoken |
| `--app-id` | Account API appId; only V4 endpoints such as "callback" need it |
| `--app-secret` | Account API appSecret |
| `--default` | Make it the default account |
| `--replace` | Overwrite an account saved under the same name |


### account list

List saved accounts

Usage: polyv-vod-cli account list [options]

| 选项 | 说明 |
|---|---|
| `-o, --output` | output format (table\|json)（默认：`table`） |


### account current

Show which credentials commands would use (never the secrets)

Usage: polyv-vod-cli account current [options]

| 选项 | 说明 |
|---|---|
| `-o, --output` | output format (table\|json)（默认：`table`） |


### account remove

Remove a saved account

Usage: polyv-vod-cli account remove [options] <name>

| 选项 | 说明 |
|---|---|
| `--force` | skip the confirmation prompt |


### account set-default

Make a saved account the default

Usage: polyv-vod-cli account set-default <name>

_没有专属选项。_


### account unset-default

Drop the default account

Usage: polyv-vod-cli account unset-default

_没有专属选项。_


## use

Choose the account for later commands on this machine

Usage: polyv-vod-cli use [options] [name]

| 选项 | 说明 |
|---|---|
| `--status` | show the chosen account |
| `--clear` | forget the chosen account |
| `--list` | list the saved accounts |
| `-o, --output` | output format (table\|json)（默认：`table`） |


## auth

Show how to connect to PolyV VOD: the key guide page and the setup command

### auth status

Check whether credentials are usable (exit 0 when logged in)

Usage: polyv-vod-cli auth status

_没有专属选项。_


### auth logout

Remove the connector account ("workbuddy")

Usage: polyv-vod-cli auth logout

_没有专属选项。_


## video

Search and manage videos

### video search

Search videos

Usage: polyv-vod-cli video search [options]

| 选项 | 说明 |
|---|---|
| `--title` | fuzzy match on title or vid |
| `--cata-id` | category id |
| `--tag` | fuzzy match on tag |
| `--status` | status codes, comma-separated; 60 or 61 means published |
| `--sort` | creationTimeAsc\|creationTimeDesc\|playTimesAsc\|playTimesDesc |
| `--page` | page number（默认：`1`） |
| `--page-size` | page size (max 1000)（默认：`10`） |
| `-o, --output` | output format (table\|json)（默认：`table`） |


### video get

Show up to 100 videos; add -o json for every field

Usage: polyv-vod-cli video get [options] <vid...>

| 选项 | 说明 |
|---|---|
| `-o, --output` | output format (table\|json)（默认：`table`） |


### video update

Change the title, description or tags of a video

Usage: polyv-vod-cli video update [options] <vid>

| 选项 | 说明 |
|---|---|
| `--title` | new title |
| `--description` | new description |
| `--tag` | new tags |
| `--force` | skip the confirmation prompt |
| `-o, --output` | output format (table\|json)（默认：`table`） |


### video delete

Delete up to 500 videos, to the recycle bin by default

Usage: polyv-vod-cli video delete [options] <vid...>

| 选项 | 说明 |
|---|---|
| `--permanent` | delete for good instead of moving to the recycle bin |
| `--strict` | fail when the platform does not know one of the ids, instead of deleting the others |
| `--force` | skip the confirmation prompt |
| `-o, --output` | output format (table\|json)（默认：`table`） |


### video recover

Restore up to 100 videos from the recycle bin

Usage: polyv-vod-cli video recover [options] <vid...>

| 选项 | 说明 |
|---|---|
| `--force` | skip the confirmation prompt |


### video move

Move up to 500 videos into a category

Usage: polyv-vod-cli video move [options] <vid...>

| 选项 | 说明 |
|---|---|
| `--cata-id` | target category id **（必填）** |
| `--force` | skip the confirmation prompt |


### video ban

Ban up to 500 published videos

Usage: polyv-vod-cli video ban [options] <vid...>

| 选项 | 说明 |
|---|---|
| `--force` | skip the confirmation prompt |


### video unban

Unban up to 500 banned videos

Usage: polyv-vod-cli video unban [options] <vid...>

| 选项 | 说明 |
|---|---|
| `--force` | skip the confirmation prompt |


### video size

Duration and transcoded sizes of videos, or of a category

Usage: polyv-vod-cli video size [options]

| 选项 | 说明 |
|---|---|
| `--vid` | video ids, comma-separated |
| `--cata-id` | category ids, comma-separated |
| `-o, --output` | output format (table\|json)（默认：`table`） |


### video wait

Wait until a video is published or has definitively failed

Usage: polyv-vod-cli video wait [options] <vid>

| 选项 | 说明 |
|---|---|
| `--timeout` | how long to wait (transcoding takes minutes)（默认：`600`） |
| `--interval` | seconds between checks（默认：`5`） |
| `-o, --output` | output format (table\|json)（默认：`table`） |


## category

Manage the category tree

### category list

Show the category tree below a category (the root by default)

Usage: polyv-vod-cli category list [options] [id]

| 选项 | 说明 |
|---|---|
| `-o, --output` | output format (table\|json)（默认：`table`） |


### category add

Create a category

Usage: polyv-vod-cli category add [options] <name>

| 选项 | 说明 |
|---|---|
| `--parent-id` | parent category id; 1 is the root **（必填）** |
| `--force` | skip the confirmation prompt |
| `-o, --output` | output format (table\|json)（默认：`table`） |


### category rename

Rename a category

Usage: polyv-vod-cli category rename [options] <id> <name>

| 选项 | 说明 |
|---|---|
| `--force` | skip the confirmation prompt |


### category setting

Change what a top-level category does with videos uploaded into it afterwards

Usage: polyv-vod-cli category setting [options] <id>

| 选项 | 说明 |
|---|---|
| `--encrypt` | encrypt new videos |
| `--no-encrypt` | do not encrypt new videos |
| `--keep-source` | play the source file instead of a transcoded one |
| `--no-keep-source` | transcode new videos |
| `--edu` | optimise new videos for screen recordings |
| `--no-edu` | no screen-recording optimisation |
| `--aac` | also produce an audio file |
| `--no-aac` | do not produce an audio file |
| `--hls-level` | mobile authorization level: open\|web\|app\|wxa_app |
| `--player-id` | player for the videos of this category |
| `--force` | skip the confirmation prompt |


### category move

Move a category under another one

Usage: polyv-vod-cli category move [options] <id>

| 选项 | 说明 |
|---|---|
| `--dest-id` | new parent category id; 1 is the root **（必填）** |
| `--force` | skip the confirmation prompt |


### category delete

Delete a category together with every category under it; the videos in them move to the default category

Usage: polyv-vod-cli category delete [options] <id>

| 选项 | 说明 |
|---|---|
| `--force` | skip the confirmation prompt |


## upload

Upload videos and manage URL-upload tasks

### upload file

Upload a local video (up to 2 GB in one request; larger or interrupted files use the resumable upload)

Usage: polyv-vod-cli upload file [options] <path>

| 选项 | 说明 |
|---|---|
| `--title` | title; defaults to the file name |
| `--description` | description |
| `--tag` | tags |
| `--cata-id` | category to upload into |
| `--luping` | optimise a screen recording |
| `--keep-source` | play the source file instead of transcoding it |
| `--mode` | auto\|direct\|chunked |
| `--part-size` | part size of the resumable upload in MB |
| `--concurrency` | parallel part uploads（默认：`3`） |
| `--no-resume` | ignore the saved progress of an interrupted upload of this file |
| `--checkpoint-dir` | where the resume state is kept |
| `--wait` | wait until the video is published or has failed |
| `--timeout` | how long to wait with --wait（默认：`600`） |
| `-o, --output` | output format (table\|json)（默认：`table`） |


### upload url

Pull videos from public URLs; the platform processes them in the background

Usage: polyv-vod-cli upload url [options]

| 选项 | 说明 |
|---|---|
| `--file-url` | public video URLs, comma-separated |
| `--title` | titles matching --file-url, comma-separated |
| `--upload-infos` | JSON array of {fileUrl, title[, tag][, state]}; takes precedence over --file-url |
| `--cata-id` | category to upload into |
| `--luping` | optimise screen recordings |
| `--force` | skip the confirmation prompt |


### upload tasks

List the URL-upload tasks

Usage: polyv-vod-cli upload tasks [options]

| 选项 | 说明 |
|---|---|
| `--page` | page number（默认：`1`） |
| `--page-size` | page size（默认：`10`） |
| `-o, --output` | output format (table\|json)（默认：`table`） |


### upload task-export

Export the videos of a URL-upload task as CSV

Usage: polyv-vod-cli upload task-export [options] <task-id>

| 选项 | 说明 |
|---|---|
| `--out` | write the CSV to this file instead of stdout |


### upload task-delete

Delete a URL-upload task record

Usage: polyv-vod-cli upload task-delete [options] <task-id>

| 选项 | 说明 |
|---|---|
| `--force` | skip the confirmation prompt |


### upload abort

Discard the stored parts of an interrupted resumable upload

Usage: polyv-vod-cli upload abort [options] <path>

| 选项 | 说明 |
|---|---|
| `--checkpoint-dir` | where the resume state is kept |
| `--force` | skip the confirmation prompt |


## play

Playback credentials

### play token

Create a token for playing an encrypted video

Usage: polyv-vod-cli play token [options]

| 选项 | 说明 |
|---|---|
| `--vid` | video id **（必填）** |
| `--viewer-id` | id of the viewer; use a different one per viewer **（必填）** |
| `--viewer-name` | viewer name |
| `--viewer-ip` | viewer IP; defaults to the caller IP |
| `--expires` | lifetime in seconds (default 600, max 86400) |
| `--disposable` | make the token valid for a single verification |
| `-o, --output` | output format (table\|json)（默认：`table`） |


## stats

Space, traffic and playback statistics

### stats usage

Space and traffic usage

Usage: polyv-vod-cli stats usage [options]

| 选项 | 说明 |
|---|---|
| `--date` | one day (yyyy-MM-dd); omit for the whole current plan |
| `-o, --output` | output format (table\|json)（默认：`table`） |


### stats play-times

Play counts per day, week or month

Usage: polyv-vod-cli stats play-times [options]

| 选项 | 说明 |
|---|---|
| `--vid` | one video; omit for the whole account |
| `--dr` | today\|yesterday\|this_week\|last_week\|7days\|this_month\|last_month\|this_year\|last_year |
| `--period` | daily\|weekly\|monthly (weekly and monthly need this_month or last_month) |
| `-o, --output` | output format (table\|json)（默认：`table`） |


### stats rank

Most played videos

Usage: polyv-vod-cli stats rank [options]

| 选项 | 说明 |
|---|---|
| `--start` | start date (yyyy-MM-dd) |
| `--end` | end date (yyyy-MM-dd) |
| `--dr` | today\|yesterday\|7days\|30days |
| `-o, --output` | output format (table\|json)（默认：`table`） |


### stats video-play-times

Total play count of specific videos

Usage: polyv-vod-cli stats video-play-times [options] <vid...>

| 选项 | 说明 |
|---|---|
| `--real-time` | count the plays of today as well |
| `-o, --output` | output format (table\|json)（默认：`table`） |


### stats view-log

View log of one day or of one month

Usage: polyv-vod-cli stats view-log [options]

| 选项 | 说明 |
|---|---|
| `--day` | one day (yyyyMMdd) |
| `--month` | one month (yyyyMM) |
| `--vid` | one video; omit for every video |
| `--page` | page number（默认：`1`） |
| `--page-size` | page size（默认：`50`） |
| `-o, --output` | output format (table\|json)（默认：`table`） |


## callback

Event callbacks: the setting, and checking signatures

### callback get

Show the callback URL (needs the account API credentials: appId and appSecret)

Usage: polyv-vod-cli callback get [options]

| 选项 | 说明 |
|---|---|
| `-o, --output` | output format (table\|json)（默认：`table`） |


### callback set

Set the callback URL; without --url the setting is cleared

Usage: polyv-vod-cli callback set [options]

| 选项 | 说明 |
|---|---|
| `--url` | https URL the platform posts events to |
| `--force` | skip the confirmation prompt |


### callback verify

Check that an event callback was signed by the platform (offline; uses the account secretkey)

Usage: polyv-vod-cli callback verify [options]

| 选项 | 说明 |
|---|---|
| `--json` | callback body as JSON; query fields such as sign and type may be merged in |
| `--sign` | sign parameter of the callback |
| `--type` | type parameter of the callback |
| `--event-type` | eventType field of the callback body |
| `--vid` | video id |
| `--format` | transcoded format, e.g. mp4 |
| `--df` | clearness index of the transcoded file |
| `--file-url` | source URL of a failed URL upload |
| `--secret-key` | check with this secretkey instead of the saved one |
| `-o, --output` | output format (table\|json)（默认：`table`） |


共 9 个一级命令、39 个子命令。

<!-- generated by scripts/generate-skill-command-index.mjs -->
