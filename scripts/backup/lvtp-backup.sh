#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKUP_ROOT="${BACKUP_ROOT:-$ROOT_DIR/backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
SNAPSHOT_DIR="$BACKUP_ROOT/snapshot-$STAMP"
MANIFEST_FILE="$SNAPSHOT_DIR/manifest.txt"
CHECKSUM_FILE="$SNAPSHOT_DIR/checksums.sha256"

mkdir -p "$SNAPSHOT_DIR"

echo "[LVTP] Creating source snapshot in $SNAPSHOT_DIR"

INCLUDE_PATHS=(
  "apps"
  "packages"
  "scripts"
  "docs"
  "assets"
  "branding"
  "nginx"
  "infra"
  ".github"
)

OPTIONAL_FILES=(
  ".env.example"
  "pnpm-workspace.yaml"
  "package.json"
  "pnpm-lock.yaml"
  "ecosystem.config.cjs"
  "deploy.sh"
)

for path in "${INCLUDE_PATHS[@]}"; do
  if [[ -e "$ROOT_DIR/$path" ]]; then
    rsync -a "$ROOT_DIR/$path" "$SNAPSHOT_DIR/"
    echo "$path" >> "$MANIFEST_FILE"
  fi
done

for file in "${OPTIONAL_FILES[@]}"; do
  if [[ -f "$ROOT_DIR/$file" ]]; then
    cp "$ROOT_DIR/$file" "$SNAPSHOT_DIR/"
    echo "$file" >> "$MANIFEST_FILE"
  fi
done

if [[ -d "$ROOT_DIR/.git" ]]; then
  git -C "$ROOT_DIR" bundle create "$SNAPSHOT_DIR/lvtp-repo.bundle" --all
  git -C "$ROOT_DIR" rev-parse HEAD > "$SNAPSHOT_DIR/git-head.txt"
  echo "git-bundle" >> "$MANIFEST_FILE"
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
  find . -type f ! -name "checksums.sha256" -print0 | sort -z | xargs -0 sha256sum > "$CHECKSUM_FILE"
)

tar -czf "$BACKUP_ROOT/lvtp-snapshot-$STAMP.tar.gz" -C "$BACKUP_ROOT" "snapshot-$STAMP"

echo "[LVTP] Snapshot archive created: $BACKUP_ROOT/lvtp-snapshot-$STAMP.tar.gz"
echo "[LVTP] Manifest: $MANIFEST_FILE"
echo "[LVTP] Checksums: $CHECKSUM_FILE"
  shasum -a 256 ./*.tar.gz .env.example 2>/dev/null | tee -a "$MANIFEST" || true
)

echo "snapshot_dir=$SNAPSHOT_DIR" | tee -a "$MANIFEST"
echo "Backup complete."
