# PolyV Live CLI 保利威直播云CLI工具

一个强大的命令行工具，用于管理保利威(PolyV)直播云服务。支持频道管理、直播流控制等核心功能，提供完整的API集成和友好的用户体验。


## ✨ 特性

### 🏗️ 核心功能
- **频道管理**: 创建、查看、更新、删除直播频道
- **流控制**: 获取推流密钥、开始/停止直播、实时状态监控
- **认证集成**: 完整的PolyV OpenAPI认证支持
- **多输出格式**: 支持表格和JSON格式输出

### 🛠️ 技术特性
- **TypeScript**: 完整的类型安全和智能提示
- **分层架构**: 清晰的命令、处理器、服务分层设计
- **错误处理**: 用户友好的错误消息和详细的调试信息
- **配置灵活**: 支持环境变量、命令行参数、配置文件
- **测试完备**: 80%+测试覆盖率，包含单元测试和集成测试

## 📦 安装

### 全局安装
```bash
npm install -g polyv-live-cli
```

### 本地开发
```bash
git clone https://github.com/your-repo/polyv-cli.git
cd polyv-cli
npm install
npm run build
```

## 🚀 快速开始

### 1. 配置认证信息

#### 🎯 推荐方式：交互式配置 (推荐)

使用 `config set` 命令进行一次性交互式配置，系统会安全地将认证信息保存到用户主目录：

```bash
# 交互式配置认证信息
polyv-live-cli config set
```

运行后会提示输入：
- PolyV App ID
- PolyV App Secret  
- PolyV User ID (可选)
- API Base URL (可选，默认为官方API地址)

配置完成后，所有后续命令都会自动使用保存的认证信息，无需重复设置。

#### 📋 配置管理命令

```bash
# 显示当前配置
polyv-live-cli config show

# 获取特定配置项
polyv-live-cli config get appId

# 设置特定配置项
polyv-live-cli config put appId your_new_app_id

# 删除特定配置项
polyv-live-cli config unset appId

# 清空所有配置
polyv-live-cli config clear
```

#### 🔧 其他认证方式

**方法二：环境变量**
```bash
export POLYV_APP_ID="your_app_id"
export POLYV_APP_SECRET="your_app_secret"
export POLYV_USER_ID="your_user_id"  # 可选
```

**方法三：命令行参数**
```bash
polyv-live-cli --appId your_app_id --appSecret your_app_secret [command]
```

#### 🔄 认证优先级

系统会按以下优先级使用认证信息：
1. **命令行参数** (最高优先级)
2. **环境变量**
3. **全局配置文件** (config set 设置的内容)
4. **默认值** (最低优先级)

### 2. 基础使用示例

```bash
# 首次使用：配置认证信息
polyv-live-cli config set

# 查看帮助
polyv-live-cli --help

# 查看版本
polyv-live-cli --version

# 查看当前配置
polyv-live-cli config show

# 创建频道
polyv-live-cli channel create --name "我的直播间" --scene topclass

# 查看频道列表
polyv-live-cli channel list

# 获取推流密钥
polyv-live-cli stream get-key --channelId 3151318

# 开始直播
polyv-live-cli stream start --channelId 3151318

# 查看直播状态
polyv-live-cli stream status --channelId 3151318

# 停止直播
polyv-live-cli stream stop --channelId 3151318
```

## 📋 命令参考

### 配置管理 (Configuration Management)

#### 交互式配置设置
```bash
polyv-live-cli config set
```
启动交互式配置向导，引导用户输入认证信息并保存到全局配置文件。

#### 显示当前配置
```bash
polyv-live-cli config show [options]

选项:
  --output <format>         输出格式: table|json (默认: table)
```

#### 获取特定配置项
```bash
polyv-live-cli config get <key>

参数:
  <key>                     配置项名称 (appId|appSecret|userId|baseUrl)
```

#### 设置特定配置项
```bash
polyv-live-cli config put <key> <value>

参数:
  <key>                     配置项名称 (appId|appSecret|userId|baseUrl)
  <value>                   配置项值
```

#### 删除特定配置项
```bash
polyv-live-cli config unset <key>

参数:
  <key>                     配置项名称 (appId|appSecret|userId|baseUrl)
```

#### 清空所有配置
```bash
polyv-live-cli config clear
```
删除所有保存的配置信息。

### 频道管理 (Channel Management)

#### 创建频道
```bash
polyv-live-cli channel create [options]

选项:
  --name <string>           频道名称 (必需)
  --scene <string>          场景类型: topclass|ppt|pure (必需)
  --description <string>    频道描述
  --publisher <string>      主持人名称
  --password <string>       频道密码
  --max-viewers <number>    最大观看人数
  --output <format>         输出格式: table|json (默认: table)
```

#### 查看频道列表
```bash
polyv-live-cli channel list [options]

选项:
  --page <number>           页码 (默认: 1)
  --per-page <number>       每页数量 (默认: 20)
  --output <format>         输出格式: table|json (默认: table)
```

#### 获取频道详情
```bash
polyv-live-cli channel get --channelId <id> [options]

选项:
  --channelId <string>      频道ID (必需)
  --output <format>         输出格式: table|json (默认: table)
```

#### 更新频道
```bash
polyv-live-cli channel update --channelId <id> [options]

选项:
  --channelId <string>      频道ID (必需)
  --name <string>           频道名称
  --description <string>    频道描述
  --publisher <string>      主持人名称
  --password <string>       频道密码
  --max-viewers <number>    最大观看人数
  --start-time <timestamp>  开始时间 (13位时间戳)
  --end-time <timestamp>    结束时间 (13位时间戳)
  --page-views <number>     累积观看数
  --likes <number>          点赞数
  --cover-img <url>         封面图片URL
  --splash-img <url>        引导页图片URL
  --output <format>         输出格式: table|json (默认: table)
```

#### 删除频道
```bash
polyv-live-cli channel delete --channelId <id>

选项:
  --channelId <string>      频道ID (必需)
```

### 流控制 (Stream Control)

#### 获取推流密钥
```bash
polyv-live-cli stream get-key --channelId <id> [options]

选项:
  --channelId <string>      频道ID (必需)
  --output <format>         输出格式: table|json (默认: table)
```

#### 开始直播
```bash
polyv-live-cli stream start --channelId <id>

选项:
  --channelId <string>      频道ID (必需)
```

#### 停止直播
```bash
polyv-live-cli stream stop --channelId <id>

选项:
  --channelId <string>      频道ID (必需)
```

#### 查看流状态
```bash
polyv-live-cli stream status --channelId <id> [options]

选项:
  --channelId <string>      频道ID (必需)
  --output <format>         输出格式: table|json (默认: table)
  --watch                   持续监控模式 (5秒更新)
```

## 🎯 使用场景

### 1. 批量频道管理
```bash
# 批量创建频道
for i in {1..5}; do
  polyv-live-cli channel create --name "批量频道$i" --scene topclass --publisher "主持人$i"
done

# 查看所有频道
polyv-live-cli channel list --per-page 50 --output json
```

### 2. 自动化直播流程
```bash
#!/bin/bash
CHANNEL_ID="3151318"

echo "🚀 开始直播..."
polyv-live-cli stream start --channelId $CHANNEL_ID

echo "📡 获取推流信息..."
polyv-live-cli stream get-key --channelId $CHANNEL_ID

echo "📊 监控直播状态..."
polyv-live-cli stream status --channelId $CHANNEL_ID --watch
```

### 3. CI/CD集成
```bash
# 在CI/CD流水线中使用
polyv-live-cli channel create \
  --name "自动化测试频道" \
  --scene topclass \
  --description "CI/CD自动创建" \
  --output json > channel_info.json

CHANNEL_ID=$(cat channel_info.json | jq -r '.channelId')
echo "创建的频道ID: $CHANNEL_ID"
```

## ⚙️ 配置选项

### 配置方法优先级
1. **命令行参数** (最高优先级)
2. **环境变量**
3. **全局配置文件** (推荐用于全局安装)
4. **项目配置文件**
5. **默认值** (最低优先级)

### 交互式配置 (推荐)
```bash
# 交互式设置配置
polyv-live-cli config set

# 查看当前配置
polyv-live-cli config show

# 查看特定配置值
polyv-live-cli config get appId

# 设置特定配置值
polyv-live-cli config put appId your_app_id

# 清除配置
polyv-live-cli config clear
```

全局配置文件位置：`~/.polyv-live-cli/config.json`

### 环境变量
| 变量名 | 说明 | 必需 |
|--------|------|------|
| `POLYV_APP_ID` | PolyV应用ID | ✅ |
| `POLYV_APP_SECRET` | PolyV应用密钥 | ✅ |
| `POLYV_USER_ID` | PolyV用户ID | ❌ |
| `POLYV_BASE_URL` | API基础URL | ❌ |
| `POLYV_TIMEOUT` | 请求超时时间(ms) | ❌ |
| `DEBUG` | 调试模式 | ❌ |

## 🔐 认证与安全

### PolyV API认证
本工具使用PolyV官方的MD5签名认证机制：

1. **参数收集**: 收集appId、timestamp、channelId等参数
2. **参数排序**: 按字典序排序参数
3. **字符串拼接**: 格式为 `appSecret + 排序后参数 + appSecret`
4. **MD5签名**: 计算MD5哈希值并转换为大写
5. **请求发送**: 将签名作为sign参数发送

### 安全最佳实践
- ✅ 使用环境变量存储敏感信息
- ✅ 敏感数据在输出中自动脱敏
- ✅ 不在日志中记录密钥信息
- ✅ 支持用户级别的权限控制

## 🧪 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 查看测试覆盖率
npm run test:coverage
```

### 测试覆盖率
- **单元测试**: 80%+ 代码覆盖率
- **集成测试**: 核心工作流全覆盖
- **错误处理**: 各种异常场景测试

## 🐛 故障排除

### 常见问题

#### 1. 认证失败
```bash
❌ 认证失败: 无效的appId或appSecret

解决方案:
- 检查POLYV_APP_ID和POLYV_APP_SECRET环境变量
- 确认PolyV控制台中的应用凭据
- 验证网络连接和防火墙设置
```

#### 2. 频道未找到
```bash
❌ 频道未找到: 频道ID 3151318 不存在

解决方案:
- 确认频道ID是否正确
- 检查账号是否有访问该频道的权限
- 使用 channel list 命令查看可用频道
```

#### 3. 推流密钥获取失败
```bash
❌ 获取推流密钥失败: 频道未在直播状态

解决方案:
- 使用 stream start 命令先开始直播
- 确认频道类型支持推流功能
- 检查频道配置是否正确
```

### 调试模式
```bash
# 启用详细调试信息
DEBUG=1 polyv-live-cli [command]

# 或设置环境变量
export DEBUG=1
polyv-live-cli [command]
```

## 🏗️ 开发

### 项目结构
```
src/
├── commands/          # CLI命令定义
│   ├── channel.commands.ts
│   └── stream.commands.ts
├── handlers/          # 业务逻辑处理器
│   ├── channel.handler.ts
│   └── stream.handler.ts
├── services/          # API服务层
│   ├── channel.service.ts
│   └── stream.service.ts
├── types/             # TypeScript类型定义
│   ├── channel.ts
│   ├── stream.ts
│   └── auth.ts
├── utils/             # 工具函数
│   ├── errors.ts
│   ├── formatter.ts
│   └── signature.ts
└── config/            # 配置管理
    └── manager.ts
```

### 开发命令
```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 代码检查
npm run lint

# 类型检查
npm run type-check

# 清理构建
npm run clean
```

### 贡献指南
1. Fork 项目仓库
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交变更: `git commit -m 'feat: add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 创建Pull Request

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。

## 🆘 支持

### 获取帮助
- 📖 [PolyV官方文档](https://help.polyv.net/)

---
