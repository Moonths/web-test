#!/bin/bash
# resume-platform 开发启动脚本
# Ctrl+C 会彻底终止所有子进程并释放端口
set -e

PORTS=(5200 5173 5176)

cleanup() {
  echo ""
  echo "正在停止所有服务..."
  pkill -P $$ 2>/dev/null
  sleep 0.5
  for port in "${PORTS[@]}"; do
    pid=$(lsof -ti :$port 2>/dev/null)
    if [ -n "$pid" ]; then
      kill -9 $pid 2>/dev/null && echo "  已释放端口 $port"
    fi
  done
  echo "所有服务已停止。"
  exit 0
}

trap cleanup SIGINT SIGTERM

echo "=== resume-platform 启动 ==="
echo ""
echo "   portal:       http://localhost:5200  (3D 展厅主页)"
echo "   resume:       http://localhost:5173  (简历子应用)"
echo "   dashboard:    http://localhost:5176  (大屏子应用)"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

pnpm --parallel --filter portal --filter @resume/resume --filter @resume/dashboard run dev &
wait
