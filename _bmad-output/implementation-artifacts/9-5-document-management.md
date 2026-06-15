# Story 9.5: 课件文档管理命令

Status: done

## Story

作为运营人员或 PaaS 客户开发者,
我希望通过 CLI 管理直播频道的课件文档,
以便上传、查看和删除直播课件。

## Acceptance Criteria

1. **AC1**: `document list` 命令支持 `--channel-id` 参数获取频道课件列表
2. **AC2**: `document list` 命令支持 `--status` 参数过滤文档状态（normal/waitUpload/failUpload/waitConvert/failConvert）
3. **AC3**: `document list` 命令支持分页参数（`--page`, `--page-size`）
4. **AC4**: `document upload` 命令支持通过 `--url` 参数上传远程文件
5. **AC5**: `document upload` 命令支持 `--type` 参数设置转换类型（common/animate）
6. **AC6**: `document upload` 命令支持 `--doc-name` 参数设置文档名称
7. **AC7**: `document upload` 命令支持 `--callback-url` 参数设置回调地址
8. **AC8**: `document delete` 命令支持 `--file-id` 参数删除指定文档
9. **AC9**: `document delete` 命令需要确认提示（可通过 `--force` 跳过）
10. **AC10**: `document status` 命令支持查询文档转码状态
11. **AC11**: 所有命令支持 `--output` 参数选择 table 或 json 输出格式
12. **AC12**: 表格输出格式清晰，显示文档信息

## Tasks / Subtasks

- [ ] **Task 1: CLI 类型定义** (AC: 1,2,3,4,5,6,7,8,9,10,11,12)
  - [ ] 1.1 创建 `packages/cli/src/types/document.ts` 文件
  - [ ] 1.2 定义 `DocumentServiceConfig` 接口
  - [ ] 1.3 定义 `DocumentListOptions` 接口（channelId, status, page, pageSize, output）
  - [ ] 1.4 定义 `DocumentUploadOptions` 接口（channelId, url, type, docName, callbackUrl, output）
  - [ ] 1.5 定义 `DocumentDeleteOptions` 接口（channelId, fileId, type, force, output）
  - [ ] 1.6 定义 `DocumentStatusOptions` 接口（channelId, fileId, output）
  - [ ] 1.7 定义 `DocumentDisplayItem` 接口用于表格显示

- [ ] **Task 2: CLI Service SDK 实现** (AC: 4,8,10)
  - [ ] 2.1 创建 `packages/cli/src/services/document.service.sdk.ts` 文件
  - [ ] 2.2 实现 `DocumentServiceSdk` 类
  - [ ] 2.3 实现 `getDocumentList()` 方法，调用 SDK `client.channel.getDocList()`
  - [ ] 2.4 实现 `uploadDocument()` 方法，调用 SDK `client.channel.uploadDoc()`
  - [ ] 2.5 实现 `deleteDocument()` 方法，调用 SDK `client.channel.deleteDoc()`
  - [ ] 2.6 实现 `getDocumentStatus()` 方法，调用 SDK `client.channel.getDocConvertStatus()`

- [ ] **Task 3: CLI Handler 实现** (AC: 全部)
  - [ ] 3.1 创建 `packages/cli/src/handlers/document.handler.ts` 文件
  - [ ] 3.2 创建 `DocumentHandler` 类继承 `BaseHandler`
  - [ ] 3.3 实现 `listDocuments()` 方法
  - [ ] 3.4 实现 `uploadDocument()` 方法
  - [ ] 3.5 实现 `deleteDocument()` 方法（含确认逻辑）
  - [ ] 3.6 实现 `getDocumentStatus()` 方法
  - [ ] 3.7 实现表格格式化输出方法
  - [ ] 3.8 实现 JSON 格式化输出
  - [ ] 3.9 参数验证和错误处理

- [ ] **Task 4: CLI Commands 注册** (AC: 1,2,3,4,5,6,7,8,9,10,11)
  - [ ] 4.1 创建 `packages/cli/src/commands/document.commands.ts` 文件
  - [ ] 4.2 创建 `document` 命令组
  - [ ] 4.3 添加 `document list` 子命令
  - [ ] 4.4 添加 `document upload` 子命令
  - [ ] 4.5 添加 `document delete` 子命令
  - [ ] 4.6 添加 `document status` 子命令
  - [ ] 4.7 在 `src/index.ts` 中注册 `registerDocumentCommands`
  - [ ] 4.8 添加命令帮助文本和示例

- [ ] **Task 5: 单元测试** (AC: 全部)
  - [ ] 5.1 创建 `document.handler.test.ts` (Jest)
  - [ ] 5.2 创建 `document.commands.test.ts` (Jest)
  - [ ] 5.3 创建 `document.service.sdk.test.ts` (Jest)
  - [ ] 5.4 确保覆盖率 >= 80%
  - [ ] 5.5 测试各种文档状态过滤
  - [ ] 5.6 测试上传参数组合
  - [ ] 5.7 测试删除确认逻辑
  - [ ] 5.8 测试转码状态查询

## Dev Notes

### API 规范

#### 1. 获取频道文档列表
**API**: `GET /live/v3/channel/document/doc-list`
```
URL: http://api.polyv.net/live/v3/channel/document/doc-list
Method: GET
```
**请求参数**:
| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳，3分钟内有效 |
| sign | true | String | 签名，32位大写MD5值 |
| channelId | false | String | 频道号 |
| status | false | String | 文档状态（normal/waitUpload/failUpload/waitConvert/failConvert） |
| page | false | Integer | 第几页，默认1 |
| limit | false | Integer | 每页数量，默认10 |
| isShowUrl | false | String | 是否展示文档原文件地址（Y/N） |

**响应字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 响应状态码，200为成功 |
| status | String | 响应状态文本信息 |
| message | String | 响应描述信息 |
| data | Object | 分页结果 |

**data.contents 字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| fileId | String | 文件ID |
| fileName | String | 文件名 |
| fileUrl | String | 文件url |
| fileType | String | 文件类型 |
| totalPage | Integer | 总页数 |
| channelId | String | 频道号 |
| status | String | 文档状态 |
| createTime | Long | 创建时间，13位毫秒级时间戳 |
| convertType | String | 转换类型（common/animate） |
| type | String | 新旧版类型（old/new） |
| previewImage | String | ppt预览小图地址 |
| previewBigImage | String | ppt预览大图地址 |

#### 2. 上传文档到频道
**API**: `POST /live/v3/channel/document/upload-doc`
```
URL: http://api.polyv.net/live/v3/channel/document/upload-doc
Method: POST
Content-Type: multipart/form-data
```
**请求参数**:
| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳 |
| sign | true | String | 签名 |
| channelId | true | String | 频道号 |
| file | false | File | 上传的文件（不超过200M，支持ppt/pdf/pptx/doc/docx/wps） |
| url | false | String | 文件地址url（file和url二选一） |
| type | false | String | 转换类型（common/animate），默认common |
| docName | false | String | 文档名称 |
| callbackUrl | false | String | 文档上传转换成功回调地址 |

**响应字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 响应状态码，200为成功 |
| status | String | 响应状态文本信息 |
| data.type | String | 转换类型 |
| data.fileId | String | 文件ID |
| data.status | String | 文档状态 |

#### 3. 删除文档
**API**: `POST /live/v3/channel/document/delete`
```
URL: http://api.polyv.net/live/v3/channel/document/delete
Method: POST
```
**请求参数**:
| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳 |
| sign | true | String | 签名 |
| channelId | true | String | 频道号 |
| fileId | true | String | 文件ID（多个用英文逗号分隔） |
| type | true | String | 新旧版文件类型（old/new） |

**响应字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 响应状态码，200为成功 |

#### 4. 查询文档转码状态
**API**: `GET /live/v3/channel/document/status/get`
```
URL: http://api.polyv.net/live/v3/channel/document/status/get
Method: GET
```
**请求参数**:
| 参数名 | 必选 | 类型 | 说明 |
|--------|------|------|------|
| appId | true | String | 账号appId |
| timestamp | true | Long | 13位毫秒级时间戳 |
| sign | true | String | 签名 |
| channelId | true | String | 频道号 |
| fileId | true | String | 文件ID（多个用英文逗号分隔） |

**响应字段 data[]**:
| 字段 | 类型 | 说明 |
|------|------|------|
| imageCount | Integer | 大图图片数量 |
| images | String[] | 大图地址数组 |
| smallImages | String[] | 小图地址数组 |
| totalPage | Integer | 总页数 |
| htmlUrl | String | 动画PPT地址 |
| convertStatus | String | 转换状态 |
| type | String | 转换类型 |
| fileId | String | 文件ID |

### 命令设计
```bash
# 列出频道课件
polyv-live-cli document list -c "3151318"
polyv-live-cli document list -c "3151318" --status normal --page 1 --page-size 20
polyv-live-cli document list -c "3151318" -o json

# 通过URL上传课件
polyv-live-cli document upload -c "3151318" --url "https://example.com/doc.pdf"
polyv-live-cli document upload -c "3151318" --url "https://example.com/ppt.pptx" --type animate
polyv-live-cli document upload -c "3151318" --url "..." --doc-name "培训课件" --callback-url "http://example.com/callback"

# 删除课件
polyv-live-cli document delete -c "3151318" --file-id "abc123"
polyv-live-cli document delete -c "3151318" --file-id "abc123" --type new --force

# 查询转码状态
polyv-live-cli document status -c "3151318" --file-id "abc123"
polyv-live-cli document status -c "3151318" --file-id "id1,id2" -o json
```

### 表格输出设计

**document list**:
```
课件列表 - 频道: 3151318
共 3 个文档

视频ID          文件名          类型    状态    页数    创建时间
abc123         培训课件        .pptx   正常    19      2024-01-15 10:30
def456         产品手册        .pdf    转换中  -       2024-01-15 11:00
```

**document upload**:
```
上传成功
课件文档上传 - 频道: 3151318
文件名: 培训课件
文件ID: abc123
转换类型: common
状态: 转换中
```

**document delete**:
```
删除成功
课件文档删除 - 频道: 3151318
文件ID: abc123
文件名: 培训课件
状态: 已删除
```

**document status**:
```
转码状态 - 频道: 3151318
文件ID: abc123
状态: 正常
类型: common
页数: 19
图片数量: 19
```

### 关键实现规则

#### 1. SDK 服务调用（已存在于 channel.service.ts）
SDK 中已有文档管理方法：
```typescript
// packages/sdk/src/services/channel.service.ts 已有实现

// 获取文档列表
async getDocList(options: GetDocListRequest): Promise<DocListResponse>

// 上传文档
async uploadDoc(channelId: string, options: UploadDocRequest): Promise<UploadDocResponse>

// 删除文档
async deleteDoc(channelId: string, fileId: string, type: 'old' | 'new'): Promise<boolean>

// 查询转码状态
async getDocConvertStatus(channelId: string, fileId: string): Promise<DocConvertStatusItem[]>
```

#### 2. DocumentServiceSdk（需新建）
```typescript
// packages/cli/src/services/document.service.sdk.ts

export class DocumentServiceSdk {
  constructor(
    private authConfig: AuthConfig,
    private config: DocumentServiceConfig
  ) {}

  async getDocumentList(options: DocumentListOptions): Promise<{
    contents: DocumentDisplayItem[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    const result = await client.channel.getDocList({
      channelId: options.channelId,
      status: options.status,
      page: options.page,
      limit: options.pageSize,
      isShowUrl: 'Y',
    });
    // 转换响应格式
    return {
      contents: result.contents.map(item => ({
        fileId: item.fileId,
        fileName: item.fileName,
        fileUrl: item.fileUrl,
        fileType: item.fileType,
        totalPage: item.totalPage,
        channelId: item.channelId,
        status: item.status,
        createTime: item.createTime,
        convertType: item.convertType,
        type: item.type,
      })),
      pageNumber: result.pageNumber,
      pageSize: result.pageSize,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
    };
  }

  async uploadDocument(channelId: string, options: {
    url?: string;
    type?: 'common' | 'animate';
    docName?: string;
    callbackUrl?: string;
  }): Promise<{ fileId: string; status: string; type: string }> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.uploadDoc(channelId, {
      url: options.url,
      type: options.type,
      docName: options.docName,
      callbackUrl: options.callbackUrl,
    });
  }

  async deleteDocument(channelId: string, fileId: string, type: 'old' | 'new'): Promise<boolean> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.deleteDoc(channelId, fileId, type);
  }

  async getDocumentStatus(channelId: string, fileId: string): Promise<DocConvertStatusItem[]> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getDocConvertStatus(channelId, fileId);
  }
}
```

#### 3. CLI Handler 模式（参考 PlaybackHandler）
```typescript
// packages/cli/src/handlers/document.handler.ts

export interface IDocumentService {
  getDocumentList(options: DocumentListOptions): Promise<{...}>;
  uploadDocument(channelId: string, options: {...}): Promise<{...}>;
  deleteDocument(channelId: string, fileId: string, type: 'old' | 'new'): Promise<boolean>;
  getDocumentStatus(channelId: string, fileId: string): Promise<DocConvertStatusItem[]>;
}

export class DocumentHandler extends BaseHandler {
  private readonly documentService: IDocumentService;

  constructor(
    authConfig: AuthConfig,
    serviceConfig: DocumentServiceConfig,
    documentService?: IDocumentService
  ) {
    super();
    this.documentService = documentService ?? new DocumentServiceSdk(authConfig, serviceConfig);
  }

  async listDocuments(options: DocumentListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // 验证 channelId
      // 调用 service
      // 显示结果
    }, 'document.list');
  }

  async uploadDocument(options: DocumentUploadOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // 验证参数
      // 调用 service
      // 显示结果
    }, 'document.upload');
  }

  async deleteDocument(options: DocumentDeleteOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // 确认逻辑（参考 playback delete）
      // 调用 service
      // 显示结果
    }, 'document.delete');
  }

  async getDocumentStatus(options: DocumentStatusOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // 验证参数
      // 调用 service
      // 显示结果
    }, 'document.status');
  }
}
```

#### 4. CLI 类型定义
```typescript
// packages/cli/src/types/document.ts

export interface DocumentServiceConfig {
  baseUrl: string;
  timeout: number;
  debug: boolean;
}

export interface DocumentListOptions {
  channelId: string;
  status?: 'normal' | 'waitUpload' | 'failUpload' | 'waitConvert' | 'failConvert';
  page?: number;
  pageSize?: number;
  output?: 'table' | 'json';
}

export interface DocumentUploadOptions {
  channelId: string;
  url: string;
  type?: 'common' | 'animate';
  docName?: string;
  callbackUrl?: string;
  output?: 'table' | 'json';
}

export interface DocumentDeleteOptions {
  channelId: string;
  fileId: string;
  type?: 'old' | 'new';
  force?: boolean;
  output?: 'table' | 'json';
}

export interface DocumentStatusOptions {
  channelId: string;
  fileId: string;
  output?: 'table' | 'json';
}

export interface DocumentDisplayItem {
  fileId: string;
  fileName: string;
  fileUrl?: string;
  fileType: string;
  totalPage: number;
  channelId?: string;
  status: string;
  createTime: number;
  convertType: string;
  type: string;
}
```

#### 5. 删除时的 type 参数处理
删除文档需要知道文档的 type（old/new），有两个方案：
1. **先查询后删除**：在删除前先调用 getDocList 获取文档信息，自动获取 type
2. **用户手动指定**：让用户通过 `--type` 参数指定

建议采用方案1：先查询获取 type，再执行删除。这样用户体验更好。

```typescript
async deleteDocument(options: DocumentDeleteOptions): Promise<void> {
  // 1. 先查询获取文档信息（包含 type）
  const result = await this.documentService.getDocumentList({
    channelId: options.channelId,
  });
  const doc = result.contents.find(item => item.fileId === options.fileId);

  if (!doc) {
    throw new Error(`Document not found: ${options.fileId}`);
  }

  // 2. 确认逻辑
  if (!options.force) {
    const confirmed = await confirmDeletion(
      `确定要删除文档 '${doc.fileName}' 吗？此操作无法撤销。`,
      'yes'
    );
    if (!confirmed) {
      this.displayInfo('删除操作已取消');
      return;
    }
  }

  // 3. 执行删除（使用查询到的 type）
  await this.documentService.deleteDocument(
    options.channelId,
    options.fileId,
    doc.type as 'old' | 'new'
  );
}
```

### 相关 API 文档
| 文档 | 路径 |
|------|------|
| 上传文档 | `docs/api/channel/doc/upload_doc.md` |
| 查询文档列表 | `docs/api/channel/doc/get_doc_list.md` |
| 删除文档 | `docs/api/channel/doc/delete_document.md` |
| 查询转码状态 | `docs/api/channel/doc/get_doc_convert_status.md` |

### 已有代码参考
- **SDK Service**: `packages/sdk/src/services/channel.service.ts` - `getDocList()`, `uploadDoc()`, `deleteDoc()`, `getDocConvertStatus()` 方法（已存在）
- **SDK Types**: `packages/sdk/src/types/channel.ts` - `GetDocListRequest`, `DocListResponse`, `UploadDocRequest`, `UploadDocResponse`, `DocConvertStatusItem`（已存在）
- **CLI Service SDK**: `packages/cli/src/services/playback.service.sdk.ts` - 参考模式
- **CLI Handler**: `packages/cli/src/handlers/playback.handler.ts` - 参考模式
- **CLI Commands**: `packages/cli/src/commands/playback.commands.ts` - 参考模式
- **CLI 类型**: `packages/cli/src/types/playback.ts` - 参考模式

### 与 Story 9-1~9-4 的模式对比
| 功能 | Story 9-1~4 (playback) | Story 9-5 (document) |
|------|------------------------|----------------------|
| SDK 服务 | ChannelService | ChannelService（相同） |
| 列表命令 | `playback list` | `document list` |
| 详情命令 | `playback get` | `document status`（转码状态） |
| 删除命令 | `playback delete` | `document delete` |
| 上传命令 | 无 | `document upload`（新增） |
| 确认逻辑 | 有 | 有（相同） |

### 测试要点
1. **CLI Handler 测试**:
   - Mock `DocumentServiceSdk`
   - 验证参数传递正确
   - 验证各种文档状态过滤
   - 验证上传参数组合
   - 验证删除确认逻辑
   - 验证表格输出格式
   - 验证 JSON 输出格式
   - 验证错误处理

2. **CLI Commands 测试**:
   - 验证命令注册正确
   - 验证必需参数验证
   - 验证可选参数默认值

3. **边界情况**:
   - 空文档列表处理
   - 无效文档状态过滤
   - 上传 URL 无效
   - 文件 ID 不存在
   - 网络错误处理

### 测试覆盖率目标
- Handler: >= 80%
- Commands: >= 80%
- Service SDK: >= 80%
- 整体: >= 80%

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

