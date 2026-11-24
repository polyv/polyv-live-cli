#!/bin/bash

# 发布脚本 - 创建 tag 触发 GitHub Action 发布
# 用法: ./scripts/release.sh <package> <type>
#   package: cli | sdk | vod | vod-sdk
#   type: patch | minor | major
# 示例: ./scripts/release.sh vod patch
#
# tag 与包的对应关系在 scripts/release-package.mjs 里维护，发布工作流用的是同一份：
#   cli      -> v<version>           polyv-live-cli
#   sdk      -> sdk-v<version>       polyv-live-api-sdk
#   vod      -> vod-v<version>       polyv-vod-cli
#   vod-sdk  -> vod-sdk-v<version>   polyv-vod-api-sdk

set -e

PACKAGE_KEY=${1:-cli}
BUMP_TYPE=${2:-patch}

resolve_script="scripts/release-package.mjs"
if [ ! -f "$resolve_script" ]; then
  echo "❌ 请在仓库根目录运行本脚本"
  exit 1
fi

# 把包名解析成目录和 npm 包名；未知的包名在这里就退出
if ! resolve_output=$(node "$resolve_script" resolve-by-key "$PACKAGE_KEY"); then
  echo "❌ 未知包: $PACKAGE_KEY (可用: cli, sdk, vod, vod-sdk)"
  exit 1
fi
# 输出是每行一个 KEY=VALUE，只接受这几个已知的键，不把输出当作 shell 代码执行
PACKAGE_DIR=""
PKG_NAME=""
while IFS= read -r line; do
  case "$line" in
    PACKAGE_DIR=*) PACKAGE_DIR="${line#PACKAGE_DIR=}" ;;
    PKG_NAME=*) PKG_NAME="${line#PKG_NAME=}" ;;
  esac
done <<< "$resolve_output"
if [ -z "$PACKAGE_DIR" ] || [ -z "$PKG_NAME" ]; then
  echo "❌ 无法从 $resolve_script 得到包 $PACKAGE_KEY 的信息"
  exit 1
fi

# 获取当前版本并计算新版本
CURRENT_VERSION=$(node -p "require('./$PACKAGE_DIR/package.json').version")
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
  echo "❌ 当前处于 detached HEAD，无法确定要推送的发布分支"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "❌ 工作区不干净。请先提交或清理改动，再执行发布脚本。"
  git status --short
  exit 1
fi

case $BUMP_TYPE in
  major) NEW_VERSION=$(echo "$CURRENT_VERSION" | awk -F. '{$1++; $2=0; $3=0}1' OFS=.) ;;
  minor) NEW_VERSION=$(echo "$CURRENT_VERSION" | awk -F. '{$2++; $3=0}1' OFS=.) ;;
  patch) NEW_VERSION=$(echo "$CURRENT_VERSION" | awk -F. '{$3++}1' OFS=.) ;;
  *)
    echo "❌ 未知类型: $BUMP_TYPE (可用: patch, minor, major)"
    exit 1
    ;;
esac

TAG_NAME=$(node "$resolve_script" tag "$PACKAGE_KEY" "$NEW_VERSION")

# 一个已经存在的 tag 属于一次已经做过的发布，不覆盖：删掉再推会重发同一个版本，
# 而 npm 不允许重发，工作流只会失败并留下一个指向新提交的 tag。
if git ls-remote --exit-code --tags origin "refs/tags/$TAG_NAME" >/dev/null 2>&1; then
  echo "❌ tag $TAG_NAME 已存在于远程。请提高版本号，或先确认那次发布的结果。"
  exit 1
fi
if git tag -l "$TAG_NAME" | grep -q .; then
  echo "❌ tag $TAG_NAME 已存在于本地。请先处理它（git tag -d $TAG_NAME）。"
  exit 1
fi

echo "📦 包: $PKG_NAME"
echo "📋 当前版本: v$CURRENT_VERSION"
echo "⬆️  新版本: v$NEW_VERSION"
echo "🏷️  Tag: $TAG_NAME"

# 更新 package.json 版本号
node -e "const fs=require('fs');const p=require('./$PACKAGE_DIR/package.json');p.version='$NEW_VERSION';fs.writeFileSync('$PACKAGE_DIR/package.json',JSON.stringify(p,null,2)+'\n')"

# 删除可能存在的 package-lock.json (使用 pnpm)
rm -f "$PACKAGE_DIR/package-lock.json"

# 提交版本更新 (只提交 package.json)
git add "$PACKAGE_DIR/package.json"
git commit -m "chore(release): $PKG_NAME v$NEW_VERSION"

# 创建并推送 tag (触发 GitHub Action)
git tag "$TAG_NAME"
git push origin "$CURRENT_BRANCH"
git push origin "$TAG_NAME"

echo "✅ Tag $TAG_NAME 已推送，GitHub Action 将自动发布"
