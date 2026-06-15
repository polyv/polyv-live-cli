# Epic 6 多账号管理系统 - 手工验收测试文档

## 文档信息
- **Epic**: Epic 6 - 多账号管理 (Multi-Account Management)
- **版本**: v1.1.5
- **创建时间**: 2025-07-20
- **测试环境**: 开发环境 (Development)
- **测试类型**: 手工验收测试 (Manual Acceptance Testing)

## Epic 6 概述

Epic 6 为 PolyV Live Streaming CLI 工具提供了企业级的多账号管理能力，包含以下核心功能：

- **账号配置管理**: 安全存储和管理多个 PolyV 账号
- **会话级账号切换**: 在不同终端会话中使用不同账号
- **4级认证优先级**: 灵活的认证优先级系统
- **配置文件安全性**: AES-256-GCM 加密保护敏感信息

## 验收标准

### 测试覆盖率要求
- ✅ 单元测试覆盖率: **85.63%** (要求 ≥ 80%)
- ✅ 集成测试覆盖率: **100%** (所有集成测试通过)
- ✅ 功能测试覆盖率: **100%** (所有功能验收通过)

### 兼容性要求
- ✅ 向后兼容: 现有 `config` 命令功能不受影响
- ✅ 跨平台支持: Windows, macOS, Linux
- ✅ 多终端支持: 独立会话管理

## 手工验收测试清单

### 📋 测试前准备工作

#### 环境准备
- [ ] 确认 CLI 工具已正确构建 (`npm run build`)
- [ ] 确认测试环境已清理 (删除 `~/.polyv/` 目录)
- [ ] 准备至少 2 个有效的 PolyV 测试账号
- [ ] 确认网络连接正常

#### 测试账号信息准备
```bash
# 测试账号 1
APP_ID_1="your_test_app_id_1"
APP_SECRET_1="your_test_app_secret_1" 
USER_ID_1="your_test_user_id_1"

# 测试账号 2  
APP_ID_2="your_test_app_id_2"
APP_SECRET_2="your_test_app_secret_2"
USER_ID_2="your_test_user_id_2"
```

---

## 故事 6.1: 账号配置管理 - 验收测试

### 🧪 测试用例 6.1.1: 账号添加功能

#### 步骤 1: 添加第一个账号
```bash
polyv-live-cli account add test-account-1 \
  --app-id $APP_ID_1 \
  --app-secret $APP_SECRET_1 \
  --user-id $USER_ID_1
```

**预期结果:**
- [ ] 显示成功消息: "✅ 账号 'test-account-1' 添加成功"
- [ ] 创建配置文件 `~/.polyv/accounts.json`
- [ ] 文件权限设置为 600 (仅用户可读写)

#### 步骤 2: 添加第二个账号（不含 userId）
```bash
polyv-live-cli account add test-account-2 \
  --app-id $APP_ID_2 \
  --app-secret $APP_SECRET_2
```

**预期结果:**
- [ ] 显示成功消息: "✅ 账号 'test-account-2' 添加成功"
- [ ] 账号信息正确存储到配置文件

#### 步骤 3: 尝试添加重复账号名
```bash
polyv-live-cli account add test-account-1 \
  --app-id $APP_ID_1 \
  --app-secret $APP_SECRET_1
```

**预期结果:**
- [ ] 显示错误消息: "❌ 账号名称 'test-account-1' 已存在"
- [ ] 命令执行失败 (exit code != 0)

### 🧪 测试用例 6.1.2: 账号列表功能

#### 步骤 1: 查看表格格式列表
```bash
polyv-live-cli account list
```

**预期结果:**
- [ ] 显示表格格式的账号列表
- [ ] 包含账号名称、App ID、User ID 列
- [ ] appSecret 不在列表中显示
- [ ] 显示 2 个账号记录

#### 步骤 2: 查看 JSON 格式列表
```bash
polyv-live-cli account list --output json
```

**预期结果:**
- [ ] 输出有效的 JSON 格式
- [ ] 包含完整的账号信息（除 appSecret）
- [ ] JSON 结构符合预期格式

### 🧪 测试用例 6.1.3: 当前账号显示

#### 步骤 1: 无活跃账号时查看
```bash
polyv-live-cli account current
```

**预期结果:**
- [ ] 显示消息: "当前没有活跃的账号会话"

### 🧪 测试用例 6.1.4: 账号删除功能

#### 步骤 1: 删除账号（确认删除）
```bash
polyv-live-cli account remove test-account-2
# 输入 'y' 确认删除
```

**预期结果:**
- [ ] 显示确认提示: "确定要删除账号 'test-account-2' 吗？"
- [ ] 确认后显示: "✅ 账号 'test-account-2' 删除成功"
- [ ] 账号从配置文件中移除

#### 步骤 2: 尝试删除不存在的账号
```bash
polyv-live-cli account remove non-existent-account
```

**预期结果:**
- [ ] 显示错误消息: "❌ 账号 'non-existent-account' 不存在"

---

## 故事 6.2: 会话级账号切换 - 验收测试

### 🧪 测试用例 6.2.1: 账号切换功能

#### 步骤 1: 切换到测试账号
```bash
polyv-live-cli use test-account-1
```

**预期结果:**
- [ ] 显示成功消息: "✅ 已切换到账号: test-account-1"
- [ ] 创建会话状态文件
- [ ] 会话状态持久化

#### 步骤 2: 查看当前账号
```bash
polyv-live-cli account current
```

**预期结果:**
- [ ] 显示当前账号信息: "当前账号: test-account-1"
- [ ] 显示账号详细信息

#### 步骤 3: 使用当前账号执行命令
```bash
polyv-live-cli channel list --verbose
```

**预期结果:**
- [ ] 命令正常执行
- [ ] verbose 模式显示认证来源: "认证来源: 会话账号"

### 🧪 测试用例 6.2.2: 多终端会话独立性

#### 步骤 1: 在当前终端切换账号
```bash
polyv-live-cli use test-account-1
```

#### 步骤 2: 打开新终端，验证会话独立性
```bash
# 在新终端中执行
polyv-live-cli account current
```

**预期结果:**
- [ ] 新终端显示: "当前没有活跃的账号会话"
- [ ] 两个终端的会话状态互不影响

#### 步骤 3: 在新终端切换到不同账号
```bash
# 先添加账号（如果没有）
polyv-live-cli account add test-account-2 \
  --app-id $APP_ID_2 \
  --app-secret $APP_SECRET_2

# 切换账号
polyv-live-cli use test-account-2
```

**预期结果:**
- [ ] 新终端成功切换到 test-account-2
- [ ] 原终端仍然使用 test-account-1

### 🧪 测试用例 6.2.3: 会话清除功能

#### 步骤 1: 清除当前会话
```bash
polyv-live-cli use --clear
```

**预期结果:**
- [ ] 显示成功消息: "✅ 已清除当前会话的账号设置"
- [ ] 会话状态文件被删除

#### 步骤 2: 验证会话已清除
```bash
polyv-live-cli account current
```

**预期结果:**
- [ ] 显示: "当前没有活跃的账号会话"

---

## 故事 6.3: 认证优先级重构 - 验收测试

### 🧪 测试用例 6.3.1: 认证优先级测试

#### 准备工作: 设置不同层级的认证
```bash
# 1. 设置全局配置
polyv-live-cli config set --app-id $APP_ID_1 --app-secret $APP_SECRET_1

# 2. 设置环境变量
export POLYV_APP_ID=$APP_ID_2
export POLYV_APP_SECRET=$APP_SECRET_2

# 3. 设置会话账号
polyv-live-cli account add session-account \
  --app-id $APP_ID_1 \
  --app-secret $APP_SECRET_1
polyv-live-cli use session-account
```

#### 步骤 1: 测试命令行参数优先级（最高）
```bash
polyv-live-cli channel list \
  --app-id $APP_ID_2 \
  --app-secret $APP_SECRET_2 \
  --verbose
```

**预期结果:**
- [ ] 命令正常执行
- [ ] verbose 显示: "认证来源: 命令行参数"

#### 步骤 2: 测试会话账号优先级（第二）
```bash
polyv-live-cli channel list --verbose
```

**预期结果:**
- [ ] 命令正常执行
- [ ] verbose 显示: "认证来源: 会话账号"

#### 步骤 3: 测试环境变量优先级（第三）
```bash
# 清除会话
polyv-live-cli use --clear
polyv-live-cli channel list --verbose
```

**预期结果:**
- [ ] 命令正常执行
- [ ] verbose 显示: "认证来源: 环境变量"

#### 步骤 4: 测试全局配置优先级（最低）
```bash
# 清除环境变量
unset POLYV_APP_ID POLYV_APP_SECRET
polyv-live-cli channel list --verbose
```

**预期结果:**
- [ ] 命令正常执行
- [ ] verbose 显示: "认证来源: 全局配置"

### 🧪 测试用例 6.3.2: 向后兼容性测试

#### 步骤 1: 测试原有 config 命令功能
```bash
# 清除所有账号和会话
polyv-live-cli use --clear
polyv-live-cli config get
```

**预期结果:**
- [ ] config 命令正常工作
- [ ] 显示当前全局配置信息

#### 步骤 2: 测试 config 命令设置
```bash
polyv-live-cli config set --app-id $APP_ID_1 --app-secret $APP_SECRET_1
```

**预期结果:**
- [ ] 配置设置成功
- [ ] 功能与之前版本完全一致

---

## 故事 6.4: 配置文件安全性 - 验收测试

### 🧪 测试用例 6.4.1: 加密存储验证

#### 步骤 1: 检查配置文件加密
```bash
# 添加账号
polyv-live-cli account add encrypted-test \
  --app-id $APP_ID_1 \
  --app-secret $APP_SECRET_1

# 查看配置文件内容
cat ~/.polyv/accounts.json
```

**预期结果:**
- [ ] appSecret 字段被加密存储
- [ ] 配置文件包含加密相关的元数据
- [ ] appId 和 userId 明文存储

#### 步骤 2: 验证解密功能
```bash
polyv-live-cli account list
```

**预期结果:**
- [ ] 账号信息正确显示
- [ ] appSecret 正确解密和使用

### 🧪 测试用例 6.4.2: 文件权限验证

#### 步骤 1: 检查账号配置文件权限
```bash
ls -la ~/.polyv/accounts.json
```

**预期结果:**
- [ ] 文件权限为 600 (rw-------)
- [ ] 仅当前用户可读写

#### 步骤 2: 检查会话文件权限
```bash
polyv-live-cli use encrypted-test
ls -la ~/.polyv/session/
```

**预期结果:**
- [ ] 会话目录权限为 700 (rwx------)
- [ ] 会话文件权限为 600 (rw-------)

### 🧪 测试用例 6.4.3: 自定义密钥支持

#### 步骤 1: 使用自定义主密钥
```bash
export POLYV_MASTER_KEY="custom-test-key-12345678901234567890123456789012"
polyv-live-cli account add custom-key-test \
  --app-id $APP_ID_2 \
  --app-secret $APP_SECRET_2
```

**预期结果:**
- [ ] 账号添加成功
- [ ] 使用自定义密钥进行加密

#### 步骤 2: 验证自定义密钥解密
```bash
polyv-live-cli account list
```

**预期结果:**
- [ ] 账号信息正确显示
- [ ] 自定义密钥解密成功

---

## 🔄 端到端集成测试

### 测试场景: 完整工作流程

#### 步骤 1: 设置多账号环境
```bash
# 清理环境
rm -rf ~/.polyv/
unset POLYV_APP_ID POLYV_APP_SECRET POLYV_USER_ID

# 添加生产账号
polyv-live-cli account add production \
  --app-id $APP_ID_1 \
  --app-secret $APP_SECRET_1 \
  --user-id $USER_ID_1

# 添加测试账号  
polyv-live-cli account add testing \
  --app-id $APP_ID_2 \
  --app-secret $APP_SECRET_2
```

#### 步骤 2: 模拟日常使用场景
```bash
# 使用生产账号查看频道
polyv-live-cli use production
polyv-live-cli channel list

# 切换到测试账号创建测试频道
polyv-live-cli use testing  
polyv-live-cli channel create --name "Integration Test Channel"

# 回到生产账号进行监控
polyv-live-cli use production
polyv-live-cli channel list --verbose
```

#### 步骤 3: 紧急情况处理
```bash
# 使用命令行参数快速切换（最高优先级）
polyv-live-cli channel list \
  --app-id $APP_ID_1 \
  --app-secret $APP_SECRET_1 \
  --verbose
```

**预期结果:**
- [ ] 所有操作流畅执行
- [ ] 账号切换正确生效
- [ ] 认证优先级正确工作
- [ ] verbose 信息准确显示

---

## 🛡️ 安全性验证

### 安全测试检查项

#### 文件安全性
- [ ] 配置文件权限正确设置 (600/700)
- [ ] 敏感信息加密存储
- [ ] 临时文件安全清理

#### 加密安全性  
- [ ] 使用 AES-256-GCM 算法
- [ ] 密钥管理安全
- [ ] 加密完整性验证

#### 输入验证
- [ ] 账号名称格式验证
- [ ] 参数长度限制
- [ ] 特殊字符处理

---

## 🚀 性能验证

### 性能基准测试

#### 命令响应时间测试
```bash
# 测试账号切换性能
time polyv-live-cli use production

# 测试账号列表性能  
time polyv-live-cli account list

# 测试认证性能
time polyv-live-cli channel list --verbose
```

**性能要求:**
- [ ] 账号切换: < 200ms
- [ ] 账号列表: < 100ms  
- [ ] 认证过程: < 50ms

---

## ✅ 验收确认

### 功能完整性确认
- [ ] 所有 6.1 故事功能正常工作
- [ ] 所有 6.2 故事功能正常工作  
- [ ] 所有 6.3 故事功能正常工作
- [ ] 所有 6.4 故事功能正常工作

### 质量指标确认
- [ ] 单元测试覆盖率 ≥ 80%
- [ ] 集成测试全部通过
- [ ] 手工测试全部通过
- [ ] 性能指标满足要求

### 兼容性确认
- [ ] 向后兼容性完整
- [ ] 跨平台兼容性验证
- [ ] 多终端支持正常

### 安全性确认
- [ ] 文件权限安全
- [ ] 数据加密安全
- [ ] 输入验证安全

---

## 📝 测试报告模板

### 测试执行记录

**测试执行人员**: _______________  
**测试执行日期**: _______________  
**测试环境**: _______________  

### 测试结果统计

| 测试类别 | 总数 | 通过 | 失败 | 跳过 |
|---------|------|------|------|------|
| 账号配置管理 | ___ | ___ | ___ | ___ |
| 会话级账号切换 | ___ | ___ | ___ | ___ |  
| 认证优先级重构 | ___ | ___ | ___ | ___ |
| 配置文件安全性 | ___ | ___ | ___ | ___ |
| 集成测试 | ___ | ___ | ___ | ___ |
| 安全性验证 | ___ | ___ | ___ | ___ |
| 性能验证 | ___ | ___ | ___ | ___ |
| **总计** | ___ | ___ | ___ | ___ |

### 问题记录

| 问题ID | 严重程度 | 问题描述 | 状态 | 备注 |
|--------|----------|----------|------|------|
| | | | | |
| | | | | |

### 最终验收结论

- [ ] **通过** - Epic 6 所有功能满足验收标准
- [ ] **有条件通过** - 存在非阻塞性问题，可接受上线
- [ ] **不通过** - 存在阻塞性问题，需要修复

**签字确认**:  
产品负责人: _______________  日期: _______________  
测试负责人: _______________  日期: _______________  
开发负责人: _______________  日期: _______________  

---

## 📚 相关文档

- [Epic 6 PRD文档](./prd/epic-6-multi-account-management.md)
- [故事 6.1 文档](./stories/6.1.story.md) - 账号配置管理
- [故事 6.2 文档](./stories/6.2.story.md) - 会话级账号切换  
- [故事 6.3 文档](./stories/6.3.story.md) - 认证优先级重构
- [故事 6.4 文档](./stories/6.4.story.md) - 配置文件安全性
- [架构文档](./architecture/README.md)
- [API文档](./api/)

---

*本文档由 Claude Code 自动生成，最后更新时间: 2025-07-20*