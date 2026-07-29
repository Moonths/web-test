#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
KILLED=false

cleanup() {
  if [ "$KILLED" = true ]; then return; fi
  KILLED=true
  echo ""
  echo "🛑 正在停止所有服务..."
  kill $(jobs -p) 2>/dev/null
  wait 2>/dev/null
}

trap cleanup INT TERM

# --- 后端 ---
echo "🔧 启动后端 (FastAPI :8000)..."
cd "$ROOT/backend"
source .venv/bin/activate
uvicorn main:app --reload --port 8000 &

# --- 前端 ---
echo "🎨 启动前端 (pnpm workspaces)..."
cd "$ROOT"
pnpm dev &

echo ""
echo "所有服务启动中..."
echo "  Portal:       http://localhost:5100"
echo "  Resume:       http://localhost:5173"
echo "  Admin:        http://localhost:5174"
echo "  Digital City: http://localhost:5175"
echo "  Dashboard:    http://localhost:5176"
echo "  Backend API:  http://localhost:8000"
echo ""
echo "按 Ctrl+C 停止所有服务"

wait
