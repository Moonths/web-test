#!/bin/bash

# resume-platform — 启动脚本
# 微前端架构：portal（3D 展厅）+ resume（简历子应用）+ dashboard（大屏子应用）

set -e

echo "=== resume-platform 启动 ==="
echo ""

# 安装依赖（如需要）
if [ ! -d "node_modules" ]; then
  echo "[1/2] 安装依赖..."
  pnpm install --no-strict-peer-dependencies
  echo ""
fi

echo "[2/2] 并行启动各服务..."
echo "     portal:       http://localhost:5100  (3D 展厅主页)"
echo "     resume:       http://localhost:5173  (简历子应用)"
echo "     dashboard:    http://localhost:5176  (大屏子应用)"
echo ""

# 同时启动 portal、resume 和 dashboard
pnpm --parallel --filter portal --filter @resume/resume --filter @resume/dashboard run dev
