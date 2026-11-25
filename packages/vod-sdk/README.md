# polyv-vod-api-sdk

PolyV VOD（保利威云点播）API 的 TypeScript / Node.js SDK，无运行时依赖。

## 安装

```bash
npm install polyv-vod-api-sdk
```

要求 Node.js 18 或更高。

## 快速开始

```ts
import { PolyVVodClient } from 'polyv-vod-api-sdk';

const client = new PolyVVodClient({
  userId: '<userId>',
  secretKey: '<secretKey>',
  writeToken: '<writeToken>' // 上传时需要
});

// 搜索视频
const found = await client.video.searchVideos({ title: '课程', pageSize: 10 });

// 上传并等转码完成
const uploaded = await client.upload.uploadFile({ filePath: './intro.mp4' });
const outcome = await client.video.waitUntilPublished(uploaded.vid);
if (outcome.state === 'published') {
  console.log('可播放：', outcome.info.transcodeInfos?.[0]?.playUrl);
}
```

凭证在云点播后台的「设置 → API接口」获取。点播凭证（`userId` / `secretKey` / `writeToken`）与直播 API 的凭证（`appId` / `appSecret`）不通用。

## 服务

| 服务 | 用途 |
|---|---|
| `client.video` | 搜索、详情、修改、删除、恢复、移动分类、禁播、等待转码 |
| `client.category` | 分类树和分类管理 |
| `client.upload` | 本地上传（直传与分片续传）、按 URL 上传、同步任务 |
| `client.playSafe` | 加密视频的播放凭证 |
| `client.statistics` | 空间流量、播放量、排行、观看日志 |
| `client.callback` | 回调地址设置、回调签名校验 |

通用请求用 `client.request({ method, path, params })`，返回响应里的 `data`。

## 签名

SDK 按接口选择签名方式，调用方不需要自己签名：

| 场景 | 算法 |
|---|---|
| 绝大多数接口 | 参数排序成 `k=v&`，接上 `secretkey`，SHA1 大写 |
| 播放凭证 | 参数排序拼接，首尾接 `secretkey`，MD5 大写 |
| 本地文件直传 | 不签名，直接带 `writeToken` |
| 回调设置（V4 接口） | 账号的 `appId` / `appSecret`，MD5 大写 |

少数接口只对固定字段签名（例如分类树只签 `userid` 和 `ptime`）。这些规则是对着真实接口验证过的，公开文档在个别接口上与实际不一致。创建客户端时传入 `appId` / `appSecret` 才能调用 `callback.getCallbackSetting` 和 `callback.updateCallbackSetting`。

## 上传

`uploadFile` 默认按文件大小选择方式：2 GB 以内一次请求直传，更大则分片续传。想明确指定时用 `mode: 'direct'` 或 `mode: 'chunked'`。

```ts
// 分片续传：中断后重跑同一条调用即可从断点继续
const result = await client.upload.uploadFile({
  filePath: './movie.mp4',
  mode: 'chunked',
  partSize: 5 * 1024 * 1024,
  onProgress: ({ uploadedBytes, totalBytes }) => console.log(`${uploadedBytes}/${totalBytes}`)
});
console.log(result.vid, result.resumed ? '（续传）' : '');
```

续传接着完成上一次保留下来的那个视频，所以标题、简介、分类和标签都用**上一次**调用的，这次调用里给的不再生效；返回值的 `title` 就是平台上的标题。要换这些信息，等视频发布后用 `updateVideoInfo` / `moveVideos` 修改，或传 `resume: false` 重新上传。

平台随后转码，视频记录在转码完成后才可播放。`waitUntilPublished` 轮询到已发布或确定失败：

```ts
const outcome = await client.video.waitUntilPublished(vid, { timeoutMs: 10 * 60_000 });
// outcome.state: 'published' | 'failed' | 'timeout'
```

## 错误处理

所有错误都是 `PolyVVodError`，用 `kind` 区分原因：

| `kind` | 含义 |
|---|---|
| `validation` | 参数或配置不合法 |
| `auth` | 缺少该接口需要的凭证 |
| `api` | 平台返回了非成功结果，`code` 是平台的状态码 |
| `network` | 超时、连接失败、取消 |
| `upload` | 上传过程失败 |

```ts
import { PolyVVodError, isPolyVVodError } from 'polyv-vod-api-sdk';

try {
  await client.video.deleteVideos('vid');
} catch (error) {
  if (isPolyVVodError(error) && error.kind === 'api') console.error(error.code, error.message);
}
```

## 注意

- **删除的返回值**：`deleteVideos` 成功时返回 `{ skipped }`，里面是平台不认识的 vid（写错了，或早已彻底删除），其余的已删除，所以 `skipped` 不为空时不能当作全部删除成功。整批 vid 平台都不认识时，整个请求失败（`kind: 'api'`，`message: 'all vids illegal'`），不会删除任何视频。还在转码的视频可以照常删除。
- **限流**：平台对单个 IP 限制 10 秒内 500 次请求。SDK 默认把请求节流到 10 秒 400 次，可用 `rateLimit` 调整或关闭。
- **重试**：超时、连接失败和 HTTP 429 / 5xx 会重试，默认 2 次。会改变状态的请求（POST）默认不重试，除非标记 `idempotent`。
- **临时凭证**：`upload` 的内部响应里含有对象存储的临时密钥，不要打印或记录它。

## 开发

```bash
pnpm --filter polyv-vod-api-sdk build          # 构建（会先从 API 文档生成类型）
pnpm --filter polyv-vod-api-sdk test:unit      # 单元测试
pnpm --filter polyv-vod-api-sdk test:coverage  # 带覆盖率
pnpm --filter polyv-vod-api-sdk test:integration  # 真实接口测试
pnpm --filter polyv-vod-api-sdk typecheck      # 含测试文件
```

真实接口测试需要凭证：把 `.env.example` 复制为 `.env.test` 并填入。测试会上传并删除临时视频，请用测试账号。没有凭证时测试自动跳过。

回调设置的测试（`tests/integration/callback.test.ts`）另外需要 `POLYV_VOD_APP_ID` 和 `POLYV_VOD_APP_SECRET`，缺少时这个文件跳过。它会设置回调地址再恢复原状。

类型定义由 `scripts/generate-types.ts` 从点播 API 文档生成，默认读取仓库旁的 `../document-center/docs/vod/api`，可用环境变量 `POLYV_VOD_API_DOCS_DIR` 指定其它位置。生成结果已提交，普通构建不需要文档库。

## 相关链接

- [保利威点播 API 文档](https://help.polyv.net/#/vod/api/)
- [polyv-vod-cli](https://www.npmjs.com/package/polyv-vod-cli) - 基于本 SDK 的命令行工具
- [直播 API SDK](https://www.npmjs.com/package/polyv-live-api-sdk) - 保利威直播的 SDK

## License

MIT
