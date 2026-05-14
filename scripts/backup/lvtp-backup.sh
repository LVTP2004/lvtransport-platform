#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
BACKUP_ROOT="${1:-$ROOT_DIR/backups}"
SNAPSHOT_DIR="$BACKUP_ROOT/$STAMP"
MANIFEST="$SNAPSHOT_DIR/manifest.txt"

mkdir -p "$SNAPSHOT_DIR"

echo "LVTP backup snapshot: $STAMP" | tee "$MANIFEST"
echo "repo_root=$ROOT_DIR" | tee -a "$MANIFEST"

tar --exclude='.git' --exclude='node_modules' --exclude='dist' --exclude='build' \
  -czf "$SNAPSHOT_DIR/source-code.tar.gz" -C "$ROOT_DIR" .

if [ -d "$ROOT_DIR/deploy" ]; then
  tar -czf "$SNAPSHOT_DIR/deploy-config.tar.gz" -C "$ROOT_DIR" deploy scripts/deploy-production.sh deploy.sh
fi

if [ -f "$ROOT_DIR/.env.example" ]; then
  cp "$ROOT_DIR/.env.example" "$SNAPSHOT_DIR/.env.example"
fi

# Branding and PWA assets.
mkdir -p "$SNAPSHOT_DIR/branding"
for path in apps/*/public/brand apps/*/public/icons apps/*/public/manifest.webmanifest; do
  if compgen -G "$ROOT_DIR/$path" > /dev/null; then
    tar -czf "$SNAPSHOT_DIR/branding/$(echo "$path" | tr '/*' '__').tar.gz" -C "$ROOT_DIR" $path
  fi
done

# Documentation snapshot for operational continuity.
if [ -d "$ROOT_DIR/docs" ]; then
  tar -czf "$SNAPSHOT_DIR/docs.tar.gz" -C "$ROOT_DIR" docs
fi

(
  cd "$SNAPSHOT_DIR"
  shasum -a 256 ./*.tar.gz .env.example 2>/dev/null | tee -a "$MANIFEST" || true
)

echo "snapshot_dir=$SNAPSHOT_DIR" | tee -a "$MANIFEST"
echo "Backup complete."
