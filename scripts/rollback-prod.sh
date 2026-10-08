#!/usr/bin/env bash
set -euo pipefail

REMOTE_HOST="${PORTAL_DEPLOY_HOST:-10.3.1.142}"
REMOTE_USER="${PORTAL_DEPLOY_USER:-deploy}"
APP_DIR="${PORTAL_DEPLOY_PATH:-/srv/apps/portal}"
TARGET_REF="${1:-HEAD~1}"
SSH_TARGET="${REMOTE_USER}@${REMOTE_HOST}"

ssh "$SSH_TARGET" bash -s <<EOF
set -euo pipefail
APP_DIR="${APP_DIR}"
TARGET_REF="${TARGET_REF}"

cd "\$APP_DIR"

git fetch --all --tags
# faz checkout do commit/tag anterior informado
if git rev-parse --verify "\$TARGET_REF" >/dev/null 2>&1; then
  git checkout "\$TARGET_REF"
else
  echo "Referencia informada nao encontrada: \$TARGET_REF"
  exit 1
fi

npm --prefix backend ci --include=dev
npm --prefix frontend ci --include=dev
npm --prefix backend run build
npm --prefix frontend run build

echo "Rollback executado para \$TARGET_REF"
EOF

echo "Rollback concluído em ${REMOTE_HOST}"
