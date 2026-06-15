# PolyV CLI - Epics & Stories

**项目**: polyv-cli
**版本**: 1.0
**最后更新**: 2026-03-20

---

## Epic 1: CLI基础与认证

### Epic目标
建立核心CLI基础设施，具备强大的认证、配置管理和基本命令结构，以实现与PolyV API的安全通信。

### 用户故事
作为开发者或运营人员，我想要一个安全可靠的CLI基础，处理认证并提供一致的命令行界面，以便我能够安全高效地管理PolyV直播服务。

### 依赖关系
无（这是基础epic）

### 技术栈
- TypeScript 5.3.3
- Node.js 20.11.0 LTS
- Commander.js 11.1.0
- crypto (MD5签名)
- dotenv (环境变量)

### Stories

#### Story 1-1: 项目设置和基础CLI结构
- **目标**: 创建基础的TypeScript CLI项目结构，使用Commander.js框架
- **验收标准**:
  1. CLI可以通过 `npm run build` 构建
  2. 构建后CLI二进制文件可执行
  3. 基础帮助命令（`--help`）显示使用信息
  4. 版本命令（`--version`）显示当前版本
  5. 错误处理提供用户友好的消息
- **状态**: done

#### Story 1-2: 认证系统实现
- **目标**: 使用appId、appSecret和可选userId实现安全认证
- **验收标准**:
  1. CLI通过命令行参数接受认证
  2. CLI通过环境变量接受认证
  3. 命令行参数覆盖环境变量
  4. 缺少必需凭据时显示清晰错误消息
  5. 凭据不会在错误消息中被记录或暴露
- **状态**: done

#### Story 1-3: MD5签名实现
- **目标**: 实现PolyV的基于MD5的签名机制以确保API安全
- **验收标准**:
  1. 签名正确遵循PolyV的算法规范
  2. 参数按键名字母顺序排序
  3. 时间戳以毫秒生成
  4. 过滤null/undefined/空参数
  5. 签名格式正确（大写MD5）
- **状态**: done

#### Story 1-4: 基础配置管理
- **目标**: 实现配置加载和验证系统
- **验收标准**:
  1. 配置从.env文件加载
  2. 缺少必需配置时显示有用的错误消息
  3. 配置验证防止无效值
  4. 不同环境可以使用不同的配置文件
- **状态**: done

---

## Epic 2: 频道管理命令

### Epic目标
实现全面的频道生命周期管理命令，允许用户通过CLI创建、列出、查看、更新和删除直播频道。

### 用户故事
作为用户（内部运营人员或PaaS客户开发者），我想通过命令行界面管理直播频道，以便我能够高效地处理频道操作而无需使用Web控制台。

### 依赖关系
- Epic 1（CLI基础与认证）必须完成

### Stories

#### Story 2-1: 频道创建命令
- **目标**: 实现 `channel create` 命令来创建新的直播频道
- **验收标准**:
  1. 命令接受 `--name` 参数（必需）
  2. 命令接受可选参数，具有适当的默认值
  3. 参数验证显示清晰的错误消息
  4. 成功创建时以表格格式显示频道ID、名称和状态
  5. API错误以用户友好的消息优雅处理
  6. 命令支持 `--output json` 进行机器可读输出
- **状态**: done

#### Story 2-2: 频道列表命令
- **目标**: 实现 `channel list` 命令来显示现有频道并支持分页
- **验收标准**:
  1. 命令使用默认分页列出频道
  2. 分页参数正常工作
  3. 表格输出格式良好且可读
  4. JSON输出有效且完整
  5. 优雅处理空结果
- **状态**: done

#### Story 2-3: 频道获取命令
- **目标**: 实现 `channel get` 命令来获取详细的频道信息
- **验收标准**:
  1. 命令需要 `--channelId` 参数
  2. 频道ID验证防止无效输入
  3. 详细频道信息清晰显示
  4. 表格格式人类可读
  5. JSON格式包含所有可用数据
- **状态**: done

#### Story 2-4: 频道更新命令
- **目标**: 实现 `channel update` 命令来修改现有频道属性
- **验收标准**:
  1. 命令需要 `--channelId` 参数
  2. 必须提供至少一个更新参数
  3. 所有字段的参数验证都正常工作
  4. 成功更新显示确认消息
- **状态**: done

#### Story 2-5: 频道删除命令
- **目标**: 实现带有安全确认机制的 `channel delete` 命令
- **验收标准**:
  1. 命令需要 `--channelId` 参数
  2. 交互式确认提示用户进行验证
  3. `--force` 标志绕过交互式确认
  4. 成功删除显示确认消息
- **状态**: done

---

## Epic 3: 流控制命令

### Epic目标
实现直播流控制命令，允许用户管理流操作，包括获取流密钥、开始和停止直播。

### 用户故事
作为用户（内部运营人员或PaaS客户开发者），我想通过命令行界面控制直播操作，以便我能够管理流生命周期并以编程方式获取流凭据。

### 依赖关系
- Epic 1（CLI基础与认证）必须完成
- Epic 2（频道管理命令）必须完成

### Stories

#### Story 3-1: 流获取密钥命令
- **目标**: 实现 `stream get-key` 命令来获取RTMP URL和流密钥
- **验收标准**:
  1. 命令需要 `--channelId` 参数
  2. 频道ID验证防止无效输入
  3. RTMP URL和流密钥清晰显示
  4. 表格格式人类可读且安全
  5. JSON格式包含所有流凭据
- **状态**: done

#### Story 3-2: 流开始命令
- **目标**: 实现 `stream start` 命令来为频道开始直播
- **验收标准**:
  1. 命令需要 `--channelId` 参数
  2. 频道ID验证正常工作
  3. 成功开始显示确认消息
  4. 已开始的流显示信息消息
- **状态**: done

#### Story 3-3: 流停止命令
- **目标**: 实现 `stream stop` 命令来结束频道的直播
- **验收标准**:
  1. 命令需要 `--channelId` 参数
  2. 频道ID验证防止无效操作
  3. 成功停止显示确认消息
  4. 已停止的流显示信息消息
- **状态**: done

#### Story 3-4: 流状态增强（可选）
- **目标**: 添加流状态检查功能以补充控制命令
- **验收标准**:
  1. 流命令显示当前状态信息
  2. 状态信息准确且最新
  3. 可用时显示流持续时间
- **状态**: done

---

## Epic 4: 发起推流命令

### Epic目标
实现一个客户端推流命令，允许用户使用本地视频文件向指定的PolyV频道发起直播推流。

### 用户故事
作为一名用户（开发者或运营人员），我希望能通过CLI将一个本地视频文件推送到指定的频道，以便我能快速测试直播流或进行简单的直播。

### 依赖关系
- Epic 1, 2, 3 必须完成
- 用户本地环境需要安装 `ffmpeg`

### Stories

#### Story 4-1: 实现 stream push 命令
- **目标**: 创建 `stream push` 命令，用于将本地视频文件推送到指定频道
- **验收标准**:
  1. 当不提供必需参数时，命令会报错并提示用法
  2. 如果系统中找不到 `ffmpeg`，命令会打印错误信息并退出
  3. 如果提供的文件路径不存在，命令会打印错误信息并退出
  4. 命令能成功获取RTMP地址和密钥
  5. `ffmpeg` 进程成功启动，并将视频流推送到PolyV服务器
  6. 用户可以通过 `Ctrl+C` 正常停止推流
- **状态**: done

#### Story 4-2: 推流进度监控与控制
- **目标**: 增强推流命令的用户体验
- **验收标准**:
  1. 显示实时推流状态和进度
  2. 捕获并显示ffmpeg输出
  3. 提供推流统计信息
- **状态**: done

---

## Epic 5: 实时监控界面

### Epic目标
实现一个类似btop的实时监控界面，为PolyV CLI工具提供交互式的终端监控仪表板。

### 用户故事
作为一名用户（开发者或运营人员），我希望能通过一个直观的实时监控界面，持续观察直播频道的运行状态、流媒体指标和系统性能。

### 依赖关系
- Epic 1, 2, 3 必须完成
- Epic 4 建议完成

### Stories

#### Story 5-1: 监控界面基础架构
- **目标**: 建立基于blessed-contrib的终端UI框架和核心组件架构
- **验收标准**:
  1. 终端UI框架能够正常初始化并显示基础界面
  2. 组件架构支持动态添加和移除组件
  3. 网格布局管理器能够正确分配组件位置和大小
- **状态**: done

#### Story 5-2: 直播流监控面板
- **目标**: 实现实时直播流指标监控
- **验收标准**:
  1. 流媒体指标能够实时更新并正确显示
  2. 折线图能够流畅地展示指标变化趋势
  3. 多频道切换功能正常
- **状态**: done

#### Story 5-3: 频道状态监控面板
- **目标**: 实现频道状态的表格式监控
- **验收标准**:
  1. 频道状态表格能够正确显示所有频道信息
  2. 状态颜色编码能够直观地反映频道健康状况
  3. 排序和过滤功能正常
- **状态**: done

#### Story 5-4: 系统资源监控面板
- **目标**: 实现系统资源使用情况的实时监控
- **验收标准**:
  1. CPU和内存仪表盘能够准确显示当前使用率
  2. 网络流量监控能够实时更新
  3. CLI进程资源监控正常工作
- **状态**: done

#### Story 5-5: 交互式操作与导航
- **目标**: 实现丰富的交互式操作，提供类似btop的用户体验
- **验收标准**:
  1. 键盘导航流畅，所有功能都能通过键盘操作
  2. 快捷键响应准确
  3. 鼠标操作与键盘操作无冲突
- **状态**: done

#### Story 5-6: 告警与通知系统
- **目标**: 实现智能告警系统
- **验收标准**:
  1. 告警面板能够清晰地显示不同级别的告警
  2. 告警规则配置功能正常
  3. 告警历史记录完整
- **状态**: done

#### Story 5-7: 配置管理与主题定制
- **目标**: 实现灵活的配置管理和主题定制功能
- **验收标准**:
  1. 配置管理系统能够正确保存和加载用户设置
  2. 主题切换功能正常
  3. 自定义主题功能完整
- **状态**: done

#### Story 5-8: 性能优化与稳定性保障
- **目标**: 优化监控界面性能
- **验收标准**:
  1. 智能数据收集能够有效减少不必要的API调用
  2. 渲染性能优化使界面更新更加流畅
  3. 内存使用稳定
- **状态**: done

---

## Epic 6: 多账号管理

### Epic目标
实现多PolyV账号管理功能，支持会话级账号切换，使用户能够在不同终端中便捷地使用不同的PolyV账号进行操作。

### 用户故事
作为管理多个PolyV客户账号的开发者或运营人员，我希望能够便捷地在不同的终端会话中使用不同的PolyV账号，而无需每次都手动输入账号参数。

### 依赖关系
- Epic 1: CLI基础与认证

### Stories

#### Story 6-1: 账号配置管理
- **目标**: 实现账号的添加、删除、列表查看功能
- **验收标准**:
  1. 可以成功添加新的账号配置
  2. 账号名称重复时显示清晰错误消息
  3. appSecret被安全加密存储在配置文件中
  4. 可以列出所有已配置的账号
  5. 可以删除指定的账号配置
- **状态**: done

#### Story 6-2: 会话级账号切换
- **目标**: 实现终端会话级的账号切换功能
- **验收标准**:
  1. `polyv-cli use <name>` 成功切换当前终端的账号
  2. 不同终端可以同时使用不同的账号
  3. 当前账号状态在终端会话中保持
  4. 切换到不存在的账号时显示错误消息
- **状态**: done

#### Story 6-3: 认证优先级重构
- **目标**: 重构现有认证系统，支持多种认证源的优先级
- **验收标准**:
  1. 命令行参数具有最高优先级
  2. 会话账号在没有命令行参数时生效
  3. 环境变量作为第三优先级
  4. 默认账号作为第四优先级
  5. 全局config配置作为最后的默认配置
- **状态**: done

#### Story 6-4: 配置文件安全性
- **目标**: 确保账号配置的安全存储和访问控制
- **验收标准**:
  1. appSecret在配置文件中被加密存储（AES-256-GCM）
  2. 配置文件权限设置为600
  3. 支持 `POLYV_MASTER_KEY` 环境变量
  4. 配置文件损坏时显示恢复指导
- **状态**: done

---

## Epic 7: 商品管理命令

### Epic目标
添加全面的商品管理功能，使用户能够通过一致的命令行操作管理频道商品（添加、列表、更新、删除）。

### 用户故事
作为用户，我希望能够通过CLI管理直播间的商品信息，以便实现直播带货功能。

### 依赖关系
- Epic 1, 2 必须完成

### Stories

#### Story 7-1: 商品管理命令实现
- **目标**: 实现 `product add/list/update/delete` 命令
- **验收标准**:
  1. `product list` 支持分页和过滤
  2. `product add` 支持所有商品类型
  3. `product update` 支持选择性字段更新
  4. `product delete` 带安全确认
- **状态**: done

---

## Epic 8: 电商场景快速配置

### Epic目标
为 PolyV CLI 添加电商直播场景快速配置能力，让新用户能够一键配置适合电商直播的完整环境。

### 用户故事
作为新注册的电商客户，我希望通过一个简单的流程快速配置一套适合电商直播的环境，包括频道、商品、优惠券，以便我能够快速体验平台能力，降低决策时间。

### 依赖关系
- Epic 1, 2, 7 必须完成
- SDK 优惠券 API 已实现

### API 文档参考

| 功能 | API 文档 | SDK 服务 | SDK 类型 |
|-----|--------|--------|---------|
| 优惠券创建 | `docs/api/v4/platform/user_coupon_create.md` | `V4PlatformService.createCoupon()` | `types/v4-platform.ts` |
| 优惠券搜索 | `docs/api/v4/platform/user_coupon_search.md` | `V4PlatformService.searchCoupons()` | `types/v4-platform.ts` |
| 优惠券领取记录 | `docs/api/v4/platform/user_coupon_search_viewer.md` | `V4PlatformService.searchCouponViewers()` | `types/v4-platform.ts` |
| 优惠券更新 | `docs/api/v4/platform/user_coupon_update.md` | `V4PlatformService.updateCoupon()` | `types/v4-platform.ts` |
| 优惠券批量删除 | `docs/api/v4/platform/user_coupon_delete_batch.md` | `V4PlatformService.deleteCouponsBatch()` | `types/v4-platform.ts` |
| 优惠券批量状态 | `docs/api/v4/platform/user_coupon_update_status_batch.md` | `V4PlatformService.updateCouponsStatusBatch()` | `types/v4-platform.ts` |
| 商品添加 | `docs/api/channel/operate/add_channel_product.md` | `ChannelService.addChannelProduct()` | `types/channel.ts` |
| 商品列表 | `docs/api/channel/operate/get_channel_product_list.md` | `ChannelService.getChannelProductList()` | `types/channel.ts` |
| 商品更新 | `docs/api/channel/operate/update_channel_product.md` | `ChannelService.updateChannelProduct()` | `types/channel.ts` |
| 商品删除 | `docs/api/channel/operate/delete_channel_product.md` | `ChannelService.deleteChannelProduct()` | `types/channel.ts` |

### Stories

#### Story 8-1: CLI 优惠券命令
- **目标**: 实现 `coupon add/list/delete` 命令
- **API 文档**:
  - `docs/api/v4/platform/user_coupon_create.md`
  - `docs/api/v4/platform/user_coupon_search.md`
  - `docs/api/v4/platform/user_coupon_delete_batch.md`
- **SDK 参考**: `packages/sdk/src/services/v4/platform.service.ts`
- **命令设计**:
  ```bash
  polyv-cli coupon add --name "满100减20" --availableAmount 100 ...
  polyv-cli coupon list [--page 1] [--size 10] [--status GOING]
  polyv-cli coupon delete --couponIds <id1,id2>
  ```
- **验收标准**:
  1. `coupon add` 支持创建满减券和折扣券
  2. `coupon list` 支持分页和状态过滤
  3. `coupon delete` 支持批量删除
  4. 所有命令支持 `--output table|json`
  5. 参数验证完善，错误消息友好
- **开发指南**:
  1. 参考 `packages/cli/src/commands/product.commands.ts` 的模式
  2. 使用 SDK 的 `client.v4Platform.createCoupon()` 等方法
  3. 类型定义已在 `polyv-live-api-sdk` 中导出
- **状态**: done

#### Story 8-2: CLI 商品命令补全
- **目标**: 补全 `product add/update/delete` 命令（目前只有 list）
- **API 文档**:
  - `docs/api/channel/operate/add_channel_product.md`
  - `docs/api/channel/operate/get_channel_product_list.md`
  - `docs/api/channel/operate/update_channel_product.md`
  - `docs/api/channel/operate/delete_channel_product.md`
- **SDK 参考**: `packages/sdk/src/services/channel.service.ts` (Product 相关方法)
- **命令设计**:
  ```bash
  polyv-cli product add --channelId <id> --name "商品名" --price 99.9 ...
  polyv-cli product update --channelId <id> --productId <id> --name "新名称" ...
  polyv-cli product delete --channelId <id> --productId <id>
  ```
- **验收标准**:
  1. `product add` 支持所有商品类型
  2. `product update` 支持选择性字段更新
  3. `product delete` 带安全确认
  4. 所有命令支持 `--output table|json`
- **状态**: done

#### Story 8-3: 电商场景配置 Skill
- **目标**: 创建 Claude Code Skill，一键配置电商直播环境
- **工作流**:
  1. 检测/引导认证配置
  2. 创建电商频道（scene=topclass, template=ppt, auto-record=Y）
  3. 添加示例商品
  4. 添加优惠券
  5. 输出配置摘要和下一步操作指引
- **验收标准**:
  1. Skill 可通过 `/polyv-e-commerce-setup` 调用
  2. 自动检测认证状态并引导配置
  3. 一键创建完整的电商直播环境
  4. 输出清晰的配置摘要
- **状态**: done

#### Story 8-4: 场景初始化命令
- **目标**: 实现配置驱动的 `setup` 命令，支持多种场景快速初始化
- **命令设计**:
  ```bash
  polyv-cli setup <scene> [--list]
  ```
- **核心特性**:
  1. 配置文件驱动 - 场景定义在 YAML 文件中
  2. 资源处理器 - 每种资源类型对应一个 Handler
  3. 变量系统 - 支持 `{timestamp}`, `{random}`, 资源引用等
  4. 依赖管理 - 资源可声明 dependsOn
  5. 自动回滚 - 失败时自动清理已创建资源
- **验收标准**:
  1. 命令支持 `polyv-cli setup <scene>` 格式
  2. 内置电商场景 (`e-commerce`) 配置
  3. 支持列出可用场景 (`--list`)
  4. 输出配置摘要和下一步指引
- **技术设计**: 配置驱动 + 轻量级 Handler
- **状态**: done

### 技术栈
- SDK 优惠券 API: `packages/sdk/src/services/v4/platform.service.ts`
- CLI 命令模式: 参考 `channel.commands.ts`, `product.commands.ts`
- Claude Skill: `.claude/skills/polyv-e-commerce-setup/`

### 延后功能
- **语音审核**: 需要开通权限，第一版暂不实现

---

## Epic 9: 内容管理

### Epic目标
实现直播内容全生命周期管理，包括回放、录制、场次、课件等内容的命令行操作。

### 用户故事
作为运营人员或 PaaS 客户开发者，我希望通过 CLI 管理直播内容，以便高效地处理内容运营任务。

### 依赖关系
- Epic 1（CLI 基础与认证）必须完成
- Epic 2（频道管理）建议完成

### Stories

#### Story 9-1: 回放列表命令
- **目标**: 实现 `playback list` 命令列出频道回放列表
- **验收标准**:
  1. `playback list` 支持分页
  2. 通过 channelId 获取回放列表
  3. 表格输出格式清晰
  4. JSON 输出完整
  5. 优雅处理空结果
- **状态**: pending

- **依赖**: Epic 1, 2

### Story 9-2: 回放详情命令
- **目标**: 实现 `playback get` 命
  通过 channelId 和 videoId 获取回放详情
- **验收标准**:
  1. 返回完整的回放信息
  2. 表格输出格式清晰
  3. JSON 输出完整
- **状态**: pending
- **依赖**: Epic 1

### Story 9-3: 回放删除命令
- **目标**: 实现 `playback delete` 命令删除指定的回放文件
- **验收标准**:
  1. 删除前需要确认
  2. 表格输出确认删除成功
- **状态**: pending
- **依赖**: Epic 1

### Story 9-4: 回放合并命令
- **目标**: 实现 `playback merge` 命令合并多个录制文件为一个回放文件
- **验收标准**:
  1. 合并成功后返回新回放 ID
  2. 表格输出合并结果
  3. JSON 输出包含新回放 ID 和合并时间
- **状态**: pending
- **依赖**: Epic 1

### Story 9-5: 课件文档管理命令
- **目标**: 实现 `document upload`、 `document list`、 `document delete` 等命令管理课件文档
- **验收标准**:
  1. 上传课件成功
  2. 列出频道的课件列表
  3. 删除指定课件
  4. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

### Story 9-6: 场次管理命令
- **目标**: 实现 `session list` 和 `session get` 命令获取频道的场次列表
- **验收标准**:
  1. 返回场次列表
  2. 支持分页
  3. 表格输出格式清晰
  4. JSON 输出完整
- **状态**: pending
- **依赖**: Epic 1

### Story 9-7: 录制设置管理命令
- **目标**: 实现 `record setting` 和 `record convert` 等命令管理录制设置
- **验收标准**:
  1. 获取当前录制设置
  2. 更新录制设置
  3. 启用/禁用自动录制
  4. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

---

## Epic 10: 数据统计

### Epic目标
提供直播数据分析能力，让运营人员和开发者能够通过 CLI 获取观看统计、并发数据、观众画像等信息。

### 用户故事
作为运营人员，我希望通过 CLI 获取直播数据统计，以便分析直播效果和观众行为。

### 依赖关系
- Epic 1（CLI 基础与认证）必须完成

### Stories

#### Story 10-1: 观看数据统计命令
- **目标**: 实现 `statistics view` 命令获取频道观看数据统计
- **验收标准**:
  1. 返回观看人数、并发数等关键指标
  2. 支持按日期范围过滤
  3. 表格输出格式清晰
  4. JSON 输出完整
- **状态**: pending
- **依赖**: Epic 1

### Story 10-2: 并发数据命令
- **目标**: 实现 `statistics concurrency` 命令获取并发数据
- **验收标准**:
  1. 返回历史并发峰值
  2. 支持时间范围查询
  3. 表格输出格式清晰
  4. JSON 输出完整
- **状态**: pending
- **依赖**: Epic 1

### Story 10-3: 观众画像命令
- **目标**: 实现 `statistics audience` 命令获取观众画像数据
- **验收标准**:
  1. 返回观众地域分布
  2. 返回观众设备分布
  3. 表格输出格式清晰
  4. JSON 输出完整
- **状态**: pending
- **依赖**: Epic 1

### Story 10-4: 统计报表导出命令
- **目标**: 实现 `statistics export` 命令导出统计报表
- **验收标准**:
  1. 支持 CSV 导出
  2. 导出当前选中数据
  3. 导出完整数据（分页）
- **状态**: pending
- **依赖**: Epic 1

### Story 10-5: 播放器设置命令
- **目标**: 实现 `player config` 命令配置播放器设置
- **验收标准**:
  1. 获取当前播放器配置
  2. 更新播放器配置
  3. 表格输出格式清晰
  4. JSON 输出完整
- **状态**: pending
- **依赖**: Epic 1

---

## Epic 11: 观众互动

### Epic目标
实现直播间互动功能管理，包括聊天、签到、问答、问卷、抽奖、打赏等互动能力的命令行操作。

### 用户故事
作为运营人员，我希望通过 CLI 管理直播间互动功能，以便提升观众参与度和直播效果。

### 依赖关系
- Epic 1（CLI 基础与认证）必须完成
- Epic 2（频道管理）建议完成

### Stories

#### Story 11-1: 聊天消息管理命令
- **目标**: 实现 `chat send`、`chat list`、`chat delete` 等命令管理聊天消息
- **验收标准**:
  1. 发送聊天消息成功
  2. 列出聊天消息列表
  3. 删除指定聊天消息
  4. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

#### Story 11-2: 禁言踢人管理命令
- **目标**: 实现 `chat ban`、`chat unban`、`chat kick` 等命令管理禁言和踢人
- **验收标准**:
  1. 禁言指定观众成功
  2. 解除禁言成功
  3. 踢出指定观众成功
  4. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

#### Story 11-3: 签到管理命令
- **目标**: 实现 `checkin start`、`checkin list`、`checkin result` 等命令管理签到
- **验收标准**:
  1. 启动签到成功
  2. 列出签到记录
  3. 获取签到结果统计
  4. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

#### Story 11-4: 问答问卷管理命令
- **目标**: 实现 `qa send`、`qa list`、`questionnaire create` 等命令管理问答和问卷
- **验收标准**:
  1. 发送问答成功
  2. 列出问答列表
  3. 创建问卷成功
  4. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

#### Story 11-5: 抽奖管理命令
- **目标**: 实现 `lottery create`、`lottery start`、`lottery result` 等命令管理抽奖
- **验收标准**:
  1. 创建抽奖活动成功
  2. 启动抽奖成功
  3. 获取抽奖结果成功
  4. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

#### Story 11-6: 打赏管理命令
- **目标**: 实现 `donate config`、`donate list` 等命令管理打赏设置
- **验收标准**:
  1. 获取打赏配置成功
  2. 更新打赏配置成功
  3. 列出打赏记录成功
  4. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

---

## Epic 12: 观众管理

### Epic目标
实现观众信息管理和观看条件配置的命令行操作。

### 用户故事
作为运营人员，我希望通过 CLI 管理观众信息和观看权限，以便精准控制直播受众。

### 依赖关系
- Epic 1（CLI 基础与认证）必须完成

### Stories

#### Story 12-1: 观众信息查询命令
- **目标**: 实现 `viewer get`、`viewer list`、`viewer search` 等命令查询观众信息
- **验收标准**:
  1. 获取单个观众详情成功
  2. 列出观众列表支持分页
  3. 搜索观众成功
  4. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

#### Story 12-2: 观众标签管理命令
- **目标**: 实现 `viewer tag add`、`viewer tag remove`、`viewer tag list` 等命令管理观众标签
- **验收标准**:
  1. 添加观众标签成功
  2. 移除观众标签成功
  3. 列出观众标签成功
  4. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

#### Story 12-3: 观看条件配置命令
- **目标**: 实现 `watch-condition get`、`watch-condition set` 等命令配置观看条件
- **验收标准**:
  1. 获取观看条件配置成功
  2. 更新观看条件配置成功
  3. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

#### Story 12-4: 白名单管理命令
- **目标**: 实现 `whitelist add`、`whitelist remove`、`whitelist list` 等命令管理白名单
- **验收标准**:
  1. 添加白名单成功
  2. 移除白名单成功
  3. 列出白名单支持分页
  4. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

---

## Epic 13: 平台配置

### Epic目标
实现账号、回调、全局设置、模板等平台级配置的命令行操作。

### 用户故事
作为管理员
我希望通过 CLI 管理平台级配置
以便统一管理多个频道。

### 依赖关系
- Epic 1（CLI 基础与认证）必须完成

### Stories

#### Story 13-1: 账号信息管理命令
- **目标**: 实现 `account get`、`account update` 等命令管理账号信息
- **验收标准**:
  1. 获取账号信息成功
  2. 更新账号信息成功
  3. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

#### Story 13-2: 回调设置管理命令
- **目标**: 实现 `callback get`、`callback set` 等命令管理回调设置
- **验收标准**:
  1. 获取回调设置成功
  2. 更新回调设置成功
  3. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

#### Story 13-3: 全局设置管理命令
- **目标**: 实现 `setting get`、`setting set` 等命令管理全局设置
- **验收标准**:
  1. 获取全局设置成功
  2. 更新全局设置成功
  3. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

#### Story 13-4: 标签管理命令
- **目标**: 实现 `label create`、`label list`、`label delete` 等命令管理标签
- **验收标准**:
  1. 创建标签成功
  2. 列出标签成功
  3. 删除标签成功
  4. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

---

## Epic 14: 高级功能

### Epic目标
实现营销推广、卡片推送、转播、AI 数字人等高级功能的命令行操作。

### 用户故事
作为高级用户
我希望通过 CLI 使用高级营销和 AI 功能
以便提升直播效果和运营效率。

### 依赖关系
- Epic 1（CLI 基础与认证）必须完成
- Epic 2（频道管理）建议完成

### Stories

#### Story 14-1: 营销推广命令
- **目标**: 实现 `marketing create`、`marketing list` 等命令管理营销推广
- **验收标准**:
  1. 创建营销活动成功
  2. 列出营销活动成功
  3. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1, 2

#### Story 14-2: 卡片推送命令
- **目标**: 实现 `card-push create`、`card-push send`、`card-push list` 等命令管理卡片推送
- **验收标准**:
  1. 创建卡片成功
  2. 推送卡片成功
  3. 列出卡片列表成功
  4. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

#### Story 14-3: 转播管理命令
- **目标**: 实现 `transmit create`、`transmit list`、`transmit update` 等命令管理转播
- **验收标准**:
  1. 创建转播配置成功
  2. 列出转播列表成功
  3. 更新转播配置成功
  4. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1, 2

#### Story 14-4: AI 数字人管理命令
- **目标**: 实现 `ai digital-human list` 等命令管理 AI 数字人
- **验收标准**:
  1. 列出可用数字人成功
  2. 配置数字人成功
  3. 所有命令支持 `--output json`
- **状态**: pending
- **依赖**: Epic 1

---

*文档更新: 2026-03-22*