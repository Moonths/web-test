 #!/usr/bin/env bash
 # ==========================================
# build-subapps.sh
# 构建子应用（resume / dashboard）并复制到 portal/public/subapps/
# 用于生产环境：portal 构建时将子应用产物打包进 portal/dist/
# ==========================================
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORTAL_PUBLIC="$ROOT_DIR/portal/public/subapps"

echo "=== Building sub-apps for portal integration ==="

# 1. Build resume with subapp base path
echo "--- Building @resume/resume ---"
cd "$ROOT_DIR/packages/resume"
VITE_BASE=/subapps/resume/ pnpm run build
echo "Copying to $PORTAL_PUBLIC/resume/"
mkdir -p "$PORTAL_PUBLIC/resume"
cp -r dist/* "$PORTAL_PUBLIC/resume/"

# 2. Build dashboard with subapp base path
echo "--- Building @resume/dashboard ---"
cd "$ROOT_DIR/packages/dashboard"
VITE_BASE=/subapps/dashboard/ pnpm run build
echo "Copying to $PORTAL_PUBLIC/dashboard/"
mkdir -p "$PORTAL_PUBLIC/dashboard"
cp -r dist/* "$PORTAL_PUBLIC/dashboard/"

# 3. Build admin (deployed separately, NOT copied into portal)
echo "--- Building @resume/admin ---"
cd "$ROOT_DIR/packages/admin"
pnpm run build
echo "Admin dist ready at packages/admin/dist/"

echo "=== Done: sub-apps ready in $PORTAL_PUBLIC ==="
ls -la "$PORTAL_PUBLIC/resume/" "$PORTAL_PUBLIC/dashboard/"
