# 优惠券管理

管理账号级优惠券。npm 版当前子命令为 `add`、`list`、`delete`。

## 创建优惠券

满减券：

```bash
npx --yes polyv-live-cli@latest coupon add \
  --name "满100减20" \
  --type MAX_OUT \
  --availableAmount 100 \
  --receiveStart 1704067200000 \
  --receiveEnd 1704153600000 \
  --useTimeType RANGE \
  --useStart 1704067200000 \
  --useEnd 1704758400000 \
  --condition FULL_REDUCE \
  --full 100 \
  --reduce 20 \
  --limitPerPerson 1
```

折扣券：

```bash
npx --yes polyv-live-cli@latest coupon add \
  --name "8折优惠券" \
  --type DISCOUNT \
  --availableAmount 200 \
  --receiveStart 1704067200000 \
  --receiveEnd 1704153600000 \
  --useTimeType DAY \
  --dayOfUse 7 \
  --condition UNCONDITIONAL \
  --discount 80 \
  --limitPerPerson 1
```

## 查询优惠券

```bash
npx --yes polyv-live-cli@latest coupon list
npx --yes polyv-live-cli@latest coupon list -p 2 -s 20
npx --yes polyv-live-cli@latest coupon list --status GOING -o json
```

| 参数 | 说明 |
| --- | --- |
| `-p, --page` | 页码 |
| `-s, --size` | 每页条数 |
| `--status` | `NOT_START`、`GOING`、`FINISHED`、`INVALID` |
| `-o, --output` | `table` 或 `json` |

## 删除优惠券

```bash
npx --yes polyv-live-cli@latest coupon delete --couponIds coupon001
npx --yes polyv-live-cli@latest coupon delete --couponIds coupon001 coupon002 coupon003
```

单次最多删除 200 个优惠券 ID。

## 参数说明

| 参数 | 说明 |
| --- | --- |
| `--name` | 优惠券名称，最多 50 个字符 |
| `--type` | `MAX_OUT` 满减券，`DISCOUNT` 折扣券 |
| `--availableAmount` | 发放数量，`0` 表示按接口规则处理 |
| `--receiveStart`、`--receiveEnd` | 领取开始和结束时间，13 位毫秒时间戳 |
| `--useTimeType` | `RANGE` 指定可用时间范围，`DAY` 领取后若干天有效 |
| `--useStart`、`--useEnd` | `RANGE` 模式下的使用时间范围 |
| `--dayOfUse` | `DAY` 模式下领取后有效天数 |
| `--condition` | `UNCONDITIONAL` 无门槛，`FULL_REDUCE` 满减门槛 |
| `--discount` | 无门槛折扣值 |
| `--full`、`--reduce` | 满减门槛和减免金额 |
| `--limitPerPerson` | 每人限领数量，`-1` 表示不限 |

## 使用注意

- 优惠券命令不接收频道 ID。
- 当前 npm 版没有单张优惠券详情查询子命令，详情类需求先使用 `coupon list -o json`。
- 删除优惠券不可撤销，执行前核对 `--couponIds`。
