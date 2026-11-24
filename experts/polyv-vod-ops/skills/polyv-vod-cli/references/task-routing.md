# 自然语言任务路由

使用本文件把用户的业务说法映射到 `polyv-vod-cli` 命令。选中命令后，必须继续运行 `<CLI> <command> --help` 校验参数。每条业务命令都要带 `--source <标识>`，下文示例统一用 `--source codex`，实际执行时换成你自己的标识。

## 上传

- 上传本地视频、把文件传到点播：`upload file`
- 上传后等它转码完成、上传完告诉我能不能播：`upload file --wait`，或 `upload file` 后接 `video wait`
- 文件超过 2 GB、上传中断后继续：`upload file`（默认自动改用分片续传，中断后重跑同一命令即可续传）
- 从一个网址拉取视频、批量按 URL 上传：`upload url`
- 查看按 URL 上传的进度、导出某个上传任务的结果、删除上传任务记录：`upload tasks`、`upload task-export`、`upload task-delete`
- 放弃一次中断的上传、清掉残留的分片：`upload abort`

## 查找和查看视频

- 搜索视频、按标题找视频、按标签找视频：`video search`
- 看某个视频的详情、时长、大小、播放地址、分辨率：`video get`，加 `-o json` 看全部字段
- 列出某个分类下的视频：`video search --cata-id`
- 只看已发布的、只看转码中的、只看失败的：`video search --status`
- 按创建时间或播放次数排序：`video search --sort`
- 批量查时长和转码后大小：`video size`
- 等一个视频转码完成：`video wait`

## 修改视频

- 改标题、改描述、改标签：`video update`
- 把视频移到另一个分类：`video move`
- 禁播、下架、解禁、重新上架：`video ban`、`video unban`
- 删除视频、清理测试视频：`video delete`（默认进回收站）
- 彻底删除、从回收站清空：`video delete --permanent`
- 恢复误删的视频、从回收站找回：`video recover`

## 分类

- 看分类树、有哪些分类、分类 ID 是多少：`category list`
- 新建分类、建一个子分类：`category add`
- 分类改名：`category rename`
- 把一个分类移到另一个分类下：`category move`
- 删除空分类：`category delete`
- 设置分类的加密、源文件播放、录屏优化、移动端授权：`category setting`

## 播放和统计

- 生成播放凭证、拿 token、加密视频怎么播：`play token`
- 空间和流量用了多少、还剩多少：`stats usage`
- 播放量、每天的播放量、按周按月统计：`stats play-times`
- 播放排行、最受欢迎的视频：`stats rank`
- 某几个视频各被播放了多少次：`stats video-play-times`
- 观看日志、谁看了、看了多久、看到哪里：`stats view-log`

## 回调和账号

- 回调地址是什么、设置回调地址、清空回调地址：`callback get`、`callback set`
- 验证一个回调请求是不是平台发来的、回调签名校验：`callback verify`
- 保存账号、添加账号、换一个账号：`account add`、`use`
- 现在用的是哪个账号、有哪些账号：`account current`、`account list`
- 设默认账号、取消默认账号：`account set-default`、`account unset-default`
- 删除已保存的账号：`account remove`
- 连接器登录状态、连接器登出：`auth status`、`auth logout`

## 常见组合流程

### 上传并登记

```bash
<CLI> upload file ./course-01.mp4 --title "第一课" --tag 入门 --cata-id <分类ID> --wait --source codex -o json
```

stdout 是一段 JSON，取其中的 `vid`。`state` 为 `published` 表示已可播放。

### 批量给一批视频改分类

先用只读命令确认目标分类和视频都存在，再移动：

```bash
<CLI> category list --source codex
<CLI> video search --tag 待整理 --page-size 100 -o json --source codex
<CLI> video move <视频ID1> <视频ID2> <视频ID3> --cata-id <分类ID> --force --source codex
```

`video move` 一次最多 500 个视频 ID。

### 清理测试视频

先搜索确认范围，再删除到回收站，最后按需彻底删除：

```bash
<CLI> video search --title test --page-size 100 -o json --source codex
<CLI> video delete <视频ID...> --force --source codex -o json
```

输出的 `skipped` 列出平台没能删除的视频（不存在、已删除、或仍在处理中）。`skipped` 不为空时不要当作全部成功，稍后对这些 ID 重试。

### 找回误删的视频

```bash
<CLI> video recover <视频ID> --force --source codex
```

恢复后的视频状态码是 `61`，同样表示已发布。

### 按播放量出报表

```bash
<CLI> stats rank --start 2026-11-01 --end 2026-11-30 -o json --source codex
<CLI> stats usage -o json --source codex
```

### 上传后加入直播频道回放库（跨 CLI）

点播和直播是两个 CLI。视频在点播发布后，用直播 CLI 把它加进频道回放：

```bash
<CLI> video wait <视频ID> --source codex
polyv-live-cli playback add-vod --help
```

`playback add-vod` 的参数以直播 CLI 的 `--help` 为准，本 skill 不覆盖它。
