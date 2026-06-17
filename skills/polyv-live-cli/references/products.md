# 商品管理

管理直播频道商品和平台商品库。npm 版当前子命令为 `list`、`add`、`update`、`delete`。

## 商品列表

查询频道商品：

```bash
npx --yes polyv-live-cli@latest product list -c 3151318
npx --yes polyv-live-cli@latest product list -c 3151318 -P 2 -s 10
npx --yes polyv-live-cli@latest product list -c 3151318 -o json
```

查询平台商品库：

```bash
npx --yes polyv-live-cli@latest product list --platform
npx --yes polyv-live-cli@latest product list --platform -P 2 -s 10 -o json
```

| 参数 | 说明 |
| --- | --- |
| `-c, --channel-id` | 频道 ID，查询频道商品时使用 |
| `--platform` | 查询账号级平台商品库 |
| `-P, --page` | 页码，默认 `1` |
| `-s, --size` | 每页条数，范围 `1-100`，默认 `20` |
| `-o, --output` | `table` 或 `json` |

## 添加商品

普通商品：

```bash
npx --yes polyv-live-cli@latest product add \
  -c 3151318 \
  -n "测试商品" \
  --status 1 \
  --link-type 10 \
  -l "https://example.com/product" \
  --cover "https://example.com/cover.jpg" \
  --real-price 99.9 \
  --price 199.9
```

多端链接商品：

```bash
npx --yes polyv-live-cli@latest product add \
  -c 3151318 \
  -n "多端商品" \
  --status 1 \
  --link-type 11 \
  --pc-link "https://example.com/pc" \
  --mobile-link "https://example.com/mobile" \
  --real-price 99.9 \
  --price 199.9
```

## 更新商品

```bash
npx --yes polyv-live-cli@latest product update \
  -c 3151318 \
  -p 12345 \
  -n "新商品名" \
  --status 1 \
  --link-type 10 \
  -l "https://example.com/product"
```

下架商品：

```bash
npx --yes polyv-live-cli@latest product update \
  -c 3151318 \
  -p 12345 \
  -n "商品名" \
  --status 2 \
  --link-type 10
```

## 删除商品

```bash
npx --yes polyv-live-cli@latest product delete -c 3151318 -p 12345
npx --yes polyv-live-cli@latest product delete -c 3151318 -p 12345 --force
```

## 常用参数

| 参数 | 说明 |
| --- | --- |
| `-c, --channel-id` | 频道 ID |
| `-p, --product-id` | 商品 ID，更新和删除时使用 |
| `-n, --name` | 商品名称 |
| `--status` | `1` 上架，`2` 下架 |
| `--link-type` | `10` 通用链接，`11` 多平台链接 |
| `-t, --product-type` | `normal`、`finance`、`position`，默认 `normal` |
| `--cover` | 商品封面 URL |
| `-l, --link` | 通用链接，`--link-type 10` 时使用 |
| `--pc-link`、`--mobile-link` | 多平台链接 |
| `--wx-miniprogram-link`、`--wx-miniprogram-original-id` | 微信小程序链接信息 |
| `--params`、`--features` | JSON 字符串 |
| `--product-desc` | 商品描述 |
| `--btn-show` | 按钮文案 |
| `--price-type`、`--real-price`、`--custom-price` | 到手价配置 |
| `--original-price-type`、`--price`、`--custom-original-price` | 原价配置 |

## 使用注意

- 当前 npm 版没有商品详情查询子命令，需要通过 `product list -o json` 获取列表数据。
- `delete` 不可撤销，建议先 `list` 核对商品 ID。
- 价格在输出中按人民币展示，脚本处理时优先使用 JSON。
