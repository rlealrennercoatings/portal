#!/usr/bin/env bash
set -euo pipefail

REMOTE_HOST="${PORTAL_DEPLOY_HOST:-10.3.1.142}"
REMOTE_USER="${PORTAL_DEPLOY_USER:-deploy}"
APP_DIR="${PORTAL_DEPLOY_PATH:-/srv/apps/portal}"
REPO_URL="${PORTAL_DEPLOY_REPO_URL:-${GIT_REPO_URL:-}}"
BRANCH="${PORTAL_DEPLOY_BRANCH:-${GIT_PROD_BRANCH:-main}}"

if [ -z "$REPO_URL" ]; then
  echo "Erro: informe a URL do repositório com PORTAL_DEPLOY_REPO_URL ou GIT_REPO_URL."
  echo "Exemplo: https://github.com/seu-usuario/portal.git"
  exit 1
fi

SSH_TARGET="${REMOTE_USER}@${REMOTE_HOST}"

ssh "$SSH_TARGET" bash -s <<EOF
set -euo pipefail
APP_DIR="${APP_DIR}"
REPO_URL="${REPO_URL}"
BRANCH="${BRANCH}"

mkdir -p "\$APP_DIR"
cd "\$APP_DIR"

if [ ! -d .git ]; then
  git clone --branch "\$BRANCH" "\$REPO_URL" "\$APP_DIR"
  cd "\$APP_DIR"
else
  git fetch --all --tags
  git checkout "\$BRANCH"
  git pull --ff-only origin "\$BRANCH"
fi

npm --prefix backend ci --include=dev
npm --prefix frontend ci --include=dev
npm --prefix backend run build
npm --prefix frontend run build

echo "Deploy via Git concluído em \$APP_DIR"
EOF

echo "Deploy concluído no host ${REMOTE_HOST}"
