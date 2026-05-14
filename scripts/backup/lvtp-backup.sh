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
fi

(
  cd "$SNAPSHOT_DIR"
  find . -type f ! -name "checksums.sha256" -print0 | sort -z | xargs -0 sha256sum > "$CHECKSUM_FILE"
)

tar -czf "$BACKUP_ROOT/lvtp-snapshot-$STAMP.tar.gz" -C "$BACKUP_ROOT" "snapshot-$STAMP"

echo "[LVTP] Snapshot archive created: $BACKUP_ROOT/lvtp-snapshot-$STAMP.tar.gz"
echo "[LVTP] Manifest: $MANIFEST_FILE"
echo "[LVTP] Checksums: $CHECKSUM_FILE"
