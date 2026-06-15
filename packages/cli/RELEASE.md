# PolyV CLI 发布指南

## 🚀 自动发布流程

### 1. 准备发布

确保所有测试通过：
```bash
npm test
npm run lint
npm run build
```

### 2. 版本管理

使用语义化版本控制：

**补丁版本** (1.0.0 → 1.0.1)：
```bash
npm run release:patch
```

**次要版本** (1.0.0 → 1.1.0)：
```bash
npm run release:minor
```

**主要版本** (1.0.0 → 2.0.0)：
```bash
npm run release:major
```

### 3. 自动发布

当推送版本标签时，GitHub Actions 会自动：
1. 运行完整测试套件
2. 构建项目
3. 发布到 npm
4. 创建 GitHub Release

## 🔧 手动发布流程

如果需要手动发布：

```bash
# 1. 构建项目
npm run build

# 2. 运行测试
npm test

# 3. 检查包内容
npm pack --dry-run

# 4. 发布到 npm
npm publish
```

## 📋 发布前检查清单

- [ ] 所有测试通过
- [ ] 代码检查通过
- [ ] 构建成功
- [ ] 更新了 README.md
- [ ] 版本号符合语义化版本控制
- [ ] GitHub Secrets 已配置：
  - [ ] `NPM_TOKEN` - npm发布令牌
  - [ ] `GITHUB_TOKEN` - GitHub自动提供

## 🔑 NPM Token 配置

### 1. 创建 NPM Token

1. 登录 [npmjs.com](https://www.npmjs.com/)
2. 点击头像 → Access Tokens
3. 点击 "Generate New Token"
4. 选择 "Automation" 类型
5. 复制生成的 token

### 2. 配置 GitHub Secrets

1. 进入 GitHub 仓库
2. Settings → Secrets and variables → Actions
3. 点击 "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: 粘贴 npm token
6. 点击 "Add secret"

## 📦 发布后验证

### 1. NPM 包验证
```bash
# 检查包是否已发布
npm view polyv-live-cli

# 全局安装测试
npm install -g polyv-live-cli@latest

# 测试 CLI
polyv-cli --version
polyv-cli --help
```

### 2. GitHub Release 验证
- 检查 [Releases 页面](https://github.com/terryso/polyv-live-cli/releases)
- 确认自动生成的 Release Notes
- 验证附件和下载链接

## 🐛 故障排除

### 发布失败常见问题

**1. NPM_TOKEN 无效**
```
Error: 401 Unauthorized
```
解决：重新生成 npm token 并更新 GitHub Secrets

**2. 版本已存在**
```
Error: You cannot publish over the previously published versions
```
解决：使用 `npm version` 命令更新版本号

**3. 测试失败**
```
Error: Test suite failed
```
解决：修复测试问题后重新发布

**4. 构建失败**
```
Error: TypeScript compilation failed
```
解决：修复 TypeScript 错误后重新发布

### 紧急回滚

如果发布的版本有严重问题：

```bash
# 撤销 npm 包（24小时内）
npm unpublish polyv-live-cli@1.0.1

# 或者发布修复版本
npm run release:patch
```

## 📈 发布历史

| 版本 | 发布日期 | 主要变更 |
|------|----------|----------|
| 1.0.0 | 2025-07-05 | 首次发布，包含完整的 PolyV CLI 功能 |

## 🔄 版本策略

- **主要版本** (X.0.0): 破坏性更改
- **次要版本** (1.X.0): 新功能，向后兼容
- **补丁版本** (1.0.X): Bug 修复，向后兼容

遵循 [语义化版本控制](https://semver.org/lang/zh-CN/) 规范。