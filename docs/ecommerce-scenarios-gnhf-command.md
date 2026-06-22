# GNHF 电商营销场景文档生成脚本

长提示词已放入脚本，避免在命令行复制时被截断或被 shell 引号影响。

## 执行

在仓库根目录执行：

```bash
bash scripts/run-ecommerce-scenarios-gnhf.sh
```

如果当前在仓库子目录中，执行：

```bash
bash "$(git rev-parse --show-toplevel)/scripts/run-ecommerce-scenarios-gnhf.sh"
```

脚本默认配置：

- 使用本地已安装的 `gnhf`
- 使用 Claude Code：`--agent claude`
- 使用隔离 worktree：`--worktree`
- 默认只跑 1 轮：`--max-iterations 1`
- 要求工作区干净，否则直接退出
- 每个场景必须先创建一个专用测试频道
- 场景文档中列入覆盖的命令必须真实执行过；只做 help 校验不能计入覆盖
- 测试结束后保留新建频道，不自动删除，方便后续查看频道配置
- 命令执行失败时写入场景文档的执行台账和问题记录

## 跑多轮

一次跑 40 轮：

```bash
MAX_ITERATIONS=40 bash scripts/run-ecommerce-scenarios-gnhf.sh
```

临时切换 agent：

```bash
GNHF_AGENT=claude MAX_ITERATIONS=40 bash scripts/run-ecommerce-scenarios-gnhf.sh
```

## 脚本位置

完整提示词在：

```text
scripts/run-ecommerce-scenarios-gnhf.sh
```
