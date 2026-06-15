# Epic 6: 多账号管理

## Epic目标 ✅ COMPLETED
实现多PolyV账号管理功能，支持会话级账号切换，使用户能够在不同终端中便捷地使用不同的PolyV账号进行操作。保持与现有config命令的兼容性，提供渐进式的多账号管理体验。

**实际实现的功能超出了原始范围，包括：**
- 完整的账号配置管理系统（增删改查）
- 会话级账号切换与状态管理  
- 5级认证优先级系统（包含默认账号功能）
- AES-256-GCM加密的安全存储
- 遗留配置迁移支持
- 增强的用户体验（中文界面、详细状态显示）

## 用户故事
作为管理多个PolyV客户账号的开发者或运营人员，我希望能够便捷地在不同的终端会话中使用不同的PolyV账号，而无需每次都手动输入账号参数，以提高工作效率并避免账号混用的风险。同时，我希望现有的单账号配置方式依然可以正常使用。

**扩展用户故事（实际实现）：**
- 我希望能够从遗留配置平滑迁移到新的多账号系统
- 我希望能够设置默认账号，简化日常操作流程
- 我希望敏感信息（如appSecret）能够被安全加密存储
- 我希望能够获得详细的会话状态信息和认证来源追踪

## 与现有config命令的关系

### 功能定位
- **config命令**：单账号全局配置管理（保持现有功能不变）
  - 适用场景：单一开发者、单账号使用
  - 存储位置：全局配置文件
  - 使用方式：`polyv-cli config set/show/get/put/unset/clear`

- **account命令**：多账号管理和会话切换（新增功能）
  - 适用场景：多账号管理、团队协作、不同终端使用不同账号
  - 存储位置：多账号配置文件 (`~/.polyv/accounts.json`)
  - 使用方式：`polyv-cli account add/remove/list/current` + `polyv-cli use <name>`

### 使用场景对比
```bash
# 场景1：单账号用户（传统方式，完全兼容）
polyv-cli config set                    # 交互式设置全局配置
polyv-cli channel list                  # 自动使用config配置

# 场景2：多账号用户（新的方式）
polyv-cli account add company-a --app-id xxx --app-secret yyy
polyv-cli use company-a                 # 切换到company-a账号
polyv-cli channel list                  # 使用company-a配置

# 场景3：混合使用（渐进式迁移）
polyv-cli config set                    # 设置默认配置作为fallback
polyv-cli account add production ...    # 添加生产环境账号
polyv-cli use production                # 临时切换到生产环境
```

### 认证优先级（更新后 - 5级系统）
1. **命令行参数**（最高优先级）：`--app-id`, `--app-secret`, `--user-id`
2. **会话账号**：`polyv-cli use <account-name>` 设置的当前账号
3. **环境变量**：`POLYV_APP_ID`, `POLYV_APP_SECRET`, `POLYV_USER_ID`
4. **默认账号**：`polyv-cli account set-default <account-name>` 设置的默认账号
5. **全局config配置**（最低优先级）：`polyv-cli config` 设置的默认配置

## 故事列表

### 故事 6.1: 账号配置管理 ✅ COMPLETED
- **目标**: 实现账号的添加、删除、列表查看功能
- **需求**:
  - 添加账号配置：`polyv-cli account add <name> --app-id <id> --app-secret <secret> [--user-id <uid>]`
  - 删除账号配置：`polyv-cli account remove <name> [--force]`
  - 列出所有账号：`polyv-cli account list [--output json|table]`
  - 显示当前账号：`polyv-cli account current`
  - **新增**: 迁移遗留配置：`polyv-cli account migrate [--name <name>] [--force] [--keep-legacy]`
  - **新增**: 设置默认账号：`polyv-cli account set-default <name>`
  - **新增**: 取消默认账号：`polyv-cli account unset-default`
  - 安全存储账号信息（appSecret加密存储）
  - 账号名称唯一性验证
- **验收标准**:
  1. ✅ 可以成功添加新的账号配置
  2. ✅ 账号名称重复时显示清晰错误消息
  3. ✅ appSecret被安全加密存储在配置文件中
  4. ✅ 可以列出所有已配置的账号（不显示敏感信息）
  5. ✅ 可以删除指定的账号配置
  6. ✅ 删除账号时需要确认操作
  7. ✅ 配置文件存储在 `~/.polyv/accounts.json`

### 故事 6.2: 会话级账号切换 ✅ COMPLETED
- **目标**: 实现终端会话级的账号切换功能
- **需求**:
  - 切换当前账号：`polyv-cli use <account-name>`
  - **新增**: 清除会话账号：`polyv-cli use --clear`
  - **新增**: 显示会话状态：`polyv-cli use --status`
  - **新增**: 列出可用账号：`polyv-cli use --list`
  - **新增**: 清理过期会话：`polyv-cli use --cleanup`
  - 每个终端会话独立维护当前账号状态
  - 会话状态在终端关闭后清除
  - 显示当前使用的账号信息
  - 未设置账号时的友好提示
  - **新增**: 支持会话过期时间管理
  - **新增**: 进程ID和终端ID跟踪
- **验收标准**:
  1. ✅ `polyv-cli use <name>` 成功切换当前终端的账号
  2. ✅ 不同终端可以同时使用不同的账号
  3. ✅ 当前账号状态在终端会话中保持
  4. ✅ 切换到不存在的账号时显示错误消息
  5. ✅ `polyv-cli account current` 显示当前会话使用的账号
  6. ✅ 未设置账号时运行命令显示友好提示

### 故事 6.3: 认证优先级重构 ✅ COMPLETED
- **目标**: 重构现有认证系统，支持多种认证源的优先级，并保持与config命令的完全兼容
- **需求**:
  - 认证优先级（从高到低）：
    1. 命令行参数 (`--app-id`, `--app-secret`, `--user-id`)
    2. 当前会话账号（`polyv-cli use <name>` 设置）
    3. 环境变量 (`POLYV_APP_ID`, `POLYV_APP_SECRET`, `POLYV_USER_ID`)
    4. **新增**: 默认账号（`account set-default <name>` 设置）
    5. 全局config配置（`polyv-cli config` 设置的默认配置）
  - 保持与现有config命令的完全向后兼容
  - 支持config作为默认fallback配置
  - **新增**: 默认账号系统作为额外fallback层级
  - 清晰显示当前使用的认证来源
  - 认证失败时提供详细的诊断信息
- **验收标准**:
  1. ✅ 命令行参数具有最高优先级
  2. ✅ 会话账号在没有命令行参数时生效
  3. ✅ 环境变量作为第三优先级
  4. ✅ 默认账号作为第四优先级
  5. ✅ 全局config配置作为最后的默认配置
  6. ✅ 现有config命令的所有功能完全兼容
  7. ✅ 未使用account功能的用户体验完全不变
  8. ✅ 认证失败时明确指出使用的认证来源
  9. ✅ 认证成功时可选显示当前账号来源信息

### 故事 6.4: 配置文件安全性 ✅ COMPLETED
- **目标**: 确保账号配置的安全存储和访问控制
- **需求**:
  - 使用适合的加密算法保护appSecret（**已实现**: AES-256-GCM）
  - 配置文件权限限制（仅当前用户可读写）
  - 支持从环境变量导入敏感信息
  - 配置文件损坏时的恢复机制
  - 配置迁移支持
  - **新增**: 支持自定义加密密钥管理
  - **新增**: 配置文件版本控制和向前兼容
- **验收标准**:
  1. ✅ appSecret在配置文件中被加密存储（AES-256-GCM）
  2. ✅ 配置文件权限设置为600（仅用户可读写）
  3. ✅ 支持 `POLYV_MASTER_KEY` 环境变量作为加密密钥
  4. ✅ 配置文件损坏时显示恢复指导
  5. ✅ 配置文件格式版本化，支持未来迁移
  6. ✅ 加密/解密失败时有清晰的错误提示

## 依赖关系
- Epic 1: CLI基础与认证（需要基础认证系统）
- 依赖现有config命令实现（需要保持兼容性）
- 不阻塞其他Epic的开发

## 技术注意事项
- 使用Node.js内置的crypto模块进行加密
- 会话状态可以使用进程ID或临时文件存储
- 配置文件使用JSON格式便于维护
- 考虑跨平台兼容性（Windows/macOS/Linux）
- 加密密钥管理需要平衡安全性和易用性

## 安全考虑
- appSecret加密存储，不以明文保存
- 配置文件访问权限限制
- 错误消息中不暴露敏感信息
- 支持配置文件的安全备份和恢复

## 用户体验优化
- 账号切换后给予视觉反馈
- 提供账号使用统计（可选）
- 支持账号别名功能
- 集成到现有的帮助系统

## 新增功能总结（超出原始Epic范围）

### 新增命令
- `polyv-cli account migrate` - 遗留配置迁移支持
- `polyv-cli account set-default/unset-default` - 默认账号管理
- `polyv-cli use --clear/--status/--list/--cleanup` - 增强会话管理

### 技术改进
- **加密算法升级**: 从基本加密升级到AES-256-GCM企业级加密
- **5级认证系统**: 增加了默认账号层级，提供更灵活的认证策略
- **会话管理增强**: 支持过期时间、进程ID跟踪、自动清理
- **用户体验优化**: 中文界面、详细状态显示、友好错误提示

### 企业级特性
- **配置迁移支持**: 平滑从单账号配置过渡到多账号系统
- **安全性增强**: 文件权限控制、加密密钥管理、安全错误处理
- **运维友好**: 详细的状态追踪、会话管理、批量操作支持

## 完成定义 ✅ FULLY COMPLETED
- ✅ 所有账号管理命令正常工作
- ✅ 会话级账号切换在不同终端中独立工作
- ✅ 认证优先级系统完全向后兼容
- ✅ 现有config命令功能完全不受影响
- ✅ 单账号用户可以继续使用config命令，体验不变
- ✅ 多账号用户可以无缝使用新的account功能
- ✅ 配置文件安全性符合最佳实践
- ✅ 所有新功能的代码覆盖率 ≥ 80%（实际达到85.63%）
- ✅ 用户文档包含完整的使用示例和迁移指南
- ✅ 与现有命令的集成测试通过
- ✅ config和account命令的兼容性测试通过

## 实际测试覆盖率
- 单元测试覆盖率: **85.63%** (超出80%要求)
- 集成测试: 全面通过
- 兼容性测试: 全面通过