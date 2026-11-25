# 上传

三种方式：本地直传（默认，2 GB 以内）、分片续传（大文件或中断续传）、按 URL 拉取。上传成功只表示文件已送达，平台随后转码，见文末“等待转码”。

## 本地上传

```bash
<CLI> upload file ./intro.mp4 --source codex
<CLI> upload file ./intro.mp4 --title "片头" --description "介绍" --tag 片头,开场 --cata-id <分类ID> --source codex
<CLI> upload file ./intro.mp4 -o json --source codex
```

| 选项 | 说明 |
|---|---|
| `--title` | 标题，默认取文件名（不含扩展名） |
| `--description` | 描述 |
| `--tag` | 标签，逗号分隔 |
| `--cata-id` | 上传到哪个分类，不传则进默认分类 |
| `--luping` | 录屏视频优化 |
| `--keep-source` | 源文件播放，不转码 |
| `--mode` | `auto`（默认）、`direct`、`chunked` |
| `--wait` | 上传后等到发布或失败 |
| `--timeout` | 配合 `--wait` 的最长等待秒数，默认 600 |

JSON 输出：

```json
{
  "vid": "<视频ID>",
  "title": "片头",
  "mode": "direct",
  "status": 10,
  "resumed": false
}
```

`mode` 为 `direct`（单次请求）或 `chunked`（分片）。`status` 是上传刚完成时的状态码，见 `videos.md` 的状态码表。

## 大文件与续传

- 2 GB 以内默认走直传；超过 2 GB 自动改用分片续传。
- 想要断点续传能力时显式指定 `--mode chunked`：

```bash
<CLI> upload file ./movie.mp4 --mode chunked --source codex
```

- 上传中断（网络断开、手动终止）后，**重跑同一条命令**即可从断点继续，输出里 `resumed` 为 `true`。
- 续传完成的是中断前已经登记的那个视频，所以标题、简介、分类、标签都用**中断前那次**给的，重跑时改成别的值不会生效（stderr 会提示）。要改就等发布后用 `video update` / `video move`。
- `--part-size <MB>` 分片大小，`--concurrency <n>` 并发分片数（默认 3），`--checkpoint-dir <dir>` 续传状态存放目录。
- `--no-resume` 忽略已保存的进度，从头上传。
- 放弃一次中断的上传并清理分片：

```bash
<CLI> upload abort ./movie.mp4 --force --source codex
```

续传状态存在系统临时目录下的 `polyv-vod-upload/`，按源文件路径区分；文件内容变化（大小或修改时间不同）后旧进度自动失效。

## 按 URL 拉取

平台在后台下载并处理，命令提交后立即返回。视频源必须是可公网访问的 HTTP(S) 地址。

```bash
<CLI> upload url --upload-infos '[{"fileUrl":"https://example.com/a.mp4","title":"视频A"},{"fileUrl":"https://example.com/b.mp4","title":"视频B","tag":"课程"}]' --cata-id <分类ID> --force --source codex
```

- `--upload-infos` 是 JSON 数组，每项 `{fileUrl, title[, tag][, state]}`，一次最多 100 项。`title` 必填、不超过 100 字符；`fileUrl` 不超过 1000 字符。
- 旧写法 `--file-url <网址,网址> --title <标题,标题>` 仍可用，但优先用 `--upload-infos`。
- 这是写操作，需要 `--force`。
- 结果通过回调通知，或在同步任务里查看：

```bash
<CLI> upload tasks --source codex
<CLI> upload tasks --page 1 --page-size 20 -o json --source codex
<CLI> upload task-export <任务ID> --out ./result.csv --source codex
<CLI> upload task-delete <任务ID> --force --source codex
```

`task-export` 不带 `--out` 时把 CSV 写到 stdout，内容与平台给的一致。CSV **没有表头**，每个抓取成功的视频一行：`源地址,标题,视频ID,上传时间`，例如：

```
https://example.com/a.mp4,视频A,abc_123,2026-11-25 15:10:54
```

导出为空说明任务还没处理完，或里面的地址全部抓取失败，stderr 会提示。`upload tasks -o json` 里 `taskstatus` 为 `FINISHED` 表示任务已结束，`failcount` 是抓取失败的数量。

## 等待转码

上传后平台需要转码。1 秒的小视频实测约 80 秒发布；视频越大越久。

一步完成：

```bash
<CLI> upload file ./intro.mp4 --wait --timeout 900 -o json --source codex
```

JSON 里 `state` 为 `published` 表示可播放；为 `failed` 或 `timeout` 时命令退出码为 `1`。

分两步：

```bash
<CLI> upload file ./intro.mp4 -o json --source codex
<CLI> video wait <视频ID> --timeout 900 --source codex
```

## 支持的格式

直传接口文档列出的格式：`.flv`、`.avi`、`.mpg`、`.mp4`、`.wmv`、`.mov`、`.3gp`、`.asf` 等。推荐 `.mp4`。上传非视频内容的文件不会报错，但平台无法转码，视频会停在不可播放状态。

## 本 skill 不覆盖的上传方式

浏览器端上传（网页里选文件直接传）用的是 JavaScript 上传 SDK，不在 CLI 范围内。
