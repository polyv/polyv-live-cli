# 统计

空间与流量、播放量、播放排行、观看日志。全部是只读命令。

## 空间和流量

```bash
<CLI> stats usage --source codex
<CLI> stats usage --date 2026-11-25 -o json --source codex
```

不带 `--date` 查询当前套餐起始日至今的累计；`--date`（`yyyy-MM-dd`）查询某一天。JSON 返回的数值单位是字节：

```json
{
  "videoCount": 15,
  "totalSpace": 21474836480,
  "usedSpace": 715128832,
  "totalFlow": 107374182400,
  "usedFlow": 52613316608,
  "userId": "…",
  "email": "…"
}
```

## 播放量趋势

```bash
<CLI> stats play-times --dr 7days --source codex
<CLI> stats play-times --vid <视频ID> --dr this_month --period weekly -o json --source codex
```

| 选项 | 说明 |
|---|---|
| `--vid` | 只看一个视频，不传则看整个账号 |
| `--dr` | `today`、`yesterday`、`this_week`、`last_week`、`7days`、`this_month`、`last_month`、`this_year`、`last_year` |
| `--period` | `daily`（默认）、`weekly`、`monthly` |

`--period weekly` 和 `monthly` 只在 `--dr` 为 `this_month` 或 `last_month` 时可用，否则命令报错。每行有 PC 端和移动端两个播放量。

## 播放排行

```bash
<CLI> stats rank --dr 30days --source codex
<CLI> stats rank --start 2026-11-01 --end 2026-11-30 -o json --source codex
```

`--start` 和 `--end`（`yyyy-MM-dd`）都给时按日期范围；只给一个查最近 7 天；都不给按 `--dr`（`today`、`yesterday`、`7days`、`30days`）。JSON 返回 PC 端和移动端两个榜单。

## 指定视频的播放次数

```bash
<CLI> stats video-play-times <视频ID1> <视频ID2> --source codex
<CLI> stats video-play-times <视频ID> --real-time -o json --source codex
```

默认不含当天的播放；`--real-time` 把当天的也计入。JSON 是 `[{ "vid": "…", "times": 7 }]`。

## 观看日志

按天或按月，二选一：

```bash
<CLI> stats view-log --day 20261125 --source codex
<CLI> stats view-log --month 202611 --vid <视频ID> --page 1 --page-size 100 -o json --source codex
```

| 选项 | 说明 |
|---|---|
| `--day` | 一天，格式 `yyyyMMdd` |
| `--month` | 一个月，格式 `yyyyMM` |
| `--vid` | 只看一个视频 |
| `--page` / `--page-size` | 分页，`--page-size` 默认 50 |

每条记录包含观看时长、播放位置、视频总时长、流量、IP、地域、来源页面、设备和浏览器。`-o json` 返回平台原始字段（秒和字节），表格模式已换算为时分秒和可读大小。
