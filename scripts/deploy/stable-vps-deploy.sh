#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/home/ubuntu/lvtransport-platform}"
BRANCH="${BRANCH:-main}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${HOME}/lvtp-backups/${TIMESTAMP}"

log() {
  echo "[LVTP deploy] $*"
}

fail() {
  echo "[LVTP deploy][ERROR] $*" >&2
  exit 1
}

log "Starting stable VPS deployment"
log "App dir: ${APP_DIR}"
log "Branch: ${BRANCH}"

cd "${APP_DIR}" || fail "Cannot access APP_DIR=${APP_DIR}"

log "Creating lightweight backup metadata"
mkdir -p "${BACKUP_DIR}"
git rev-parse HEAD > "${BACKUP_DIR}/previous_commit.txt" || true
pm2 jlist > "${BACKUP_DIR}/pm2-before.json" || true
cp package.json "${BACKUP_DIR}/package.json" 2>/dev/null || true
cp pnpm-lock.yaml "${BACKUP_DIR}/pnpm-lock.yaml" 2>/dev/null || true

log "Fetching latest GitHub state"
git fetch origin "${BRANCH}"

log "Checking for local uncommitted changes"
if ! git diff --quiet || ! git diff --cached --quiet; then
  git status --short > "${BACKUP_DIR}/dirty-state.txt"
  fail "Local VPS working tree has uncommitted changes. Saved status in ${BACKUP_DIR}/dirty-state.txt. Resolve before deploy."
fi

log "Resetting working tree to origin/${BRANCH}"
git checkout "${BRANCH}"
git reset --hard "origin/${BRANCH}"

log "Preparing pnpm"
if command -v corepack >/dev/null 2>&1; then
  corepack enable || true
fi

if ! command -v pnpm >/dev/null 2>&1; then
  fail "pnpm is not installed or not in PATH"
fi

log "Installing dependencies"
pnpm install --frozen-lockfile || pnpm install

log "Running production build. PM2 will NOT restart if this fails."
pnpm run build

log "Build passed. Restarting known PM2 processes if they exist."
if command -v pm2 >/dev/null 2>&1; then
  pm2 describe lvtransport-api >/dev/null 2>&1 && pm2 restart lvtransport-api || log "PM2 process lvtransport-api not found; skipped"
  pm2 describe lvtransport-web >/dev/null 2>&1 && pm2 restart lvtransport-web || log "PM2 process lvtransport-web not found; skipped"
  pm2 describe lvtransport-admin >/dev/null 2>&1 && pm2 restart lvtransport-admin || log "PM2 process lvtransport-admin not found; skipped"
  pm2 describe lvtransport-driver >/dev/null 2>&1 && pm2 restart lvtransport-driver || log "PM2 process lvtransport-driver not found; skipped"
  pm2 save || true
else
  log "pm2 not found; skipped process restart"
fi

log "Deployment completed successfully"
git rev-parse HEAD > "${BACKUP_DIR}/deployed_commit.txt" || true
