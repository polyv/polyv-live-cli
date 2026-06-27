#!/bin/bash

# 发布脚本 - 创建 tag 触发 GitHub Action 发布
# 用法: ./scripts/release.sh <package> <type>
#   package: cli | sdk
#   type: patch | minor | major
# 示例: ./scripts/release.sh cli patch

set -e

PACKAGE=${1:-cli}
BUMP_TYPE=${2:-patch}

case $PACKAGE in
  cli)
    PKG_DIR="packages/cli"
    PKG_NAME="polyv-live-cli"
    TAG_PREFIX=""
    ;;
  sdk)
    PKG_DIR="packages/sdk"
    PKG_NAME="polyv-live-api-sdk"
    TAG_PREFIX="sdk-"
    ;;
  *)
    echo "❌ 未知包: $PACKAGE (可用: cli, sdk)"
    exit 1
    ;;
esac

# 获取当前版本并计算新版本
CURRENT_VERSION=$(node -p "require('./$PKG_DIR/package.json').version")
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
  major) NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{$1++; $2=0; $3=0}1' OFS=.) ;;
  minor) NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{$2++; $3=0}1' OFS=.) ;;
  patch) NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{$3++}1' OFS=.) ;;
  *)
    echo "❌ 未知类型: $BUMP_TYPE (可用: patch, minor, major)"
    exit 1
    ;;
esac

TAG_NAME="${TAG_PREFIX}v$NEW_VERSION"

echo "📦 包: $PKG_NAME"
echo "📋 当前版本: v$CURRENT_VERSION"
echo "⬆️  新版本: v$NEW_VERSION"
echo "🏷️  Tag: $TAG_NAME"

# 更新 package.json 版本号
node -e "const fs=require('fs');const p=require('./$PKG_DIR/package.json');p.version='$NEW_VERSION';fs.writeFileSync('$PKG_DIR/package.json',JSON.stringify(p,null,2)+'\n')"

# 删除可能存在的 package-lock.json (使用 pnpm)
rm -f $PKG_DIR/package-lock.json

# 提交版本更新 (只提交 package.json)
git add $PKG_DIR/package.json
git commit -m "chore(release): $PKG_NAME v$NEW_VERSION"

# 删除已存在的 tag (本地和远程)
if git tag -l "$TAG_NAME" | grep -q "$TAG_NAME"; then
  echo "🗑️  删除已存在的 tag: $TAG_NAME"
  git tag -d "$TAG_NAME" 2>/dev/null || true
  git push origin :refs/tags/"$TAG_NAME" 2>/dev/null || true
fi

# 创建并推送 tag (触发 GitHub Action)
git tag "$TAG_NAME"
git push origin "$CURRENT_BRANCH"
git push origin "$TAG_NAME"

echo "✅ Tag $TAG_NAME 已推送，GitHub Action 将自动发布"
