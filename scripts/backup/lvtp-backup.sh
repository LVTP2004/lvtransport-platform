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
echo "LVTP backup snapshot: $STAMP" > "$MANIFEST_FILE"
echo "repo_root=$ROOT_DIR" >> "$MANIFEST_FILE"

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

tar --exclude='.git' --exclude='node_modules' --exclude='dist' --exclude='build' --exclude='backups' \
  -czf "$SNAPSHOT_DIR/source-code.tar.gz" -C "$ROOT_DIR" .

if [[ -d "$ROOT_DIR/docs" ]]; then
  tar -czf "$SNAPSHOT_DIR/docs.tar.gz" -C "$ROOT_DIR" docs
fi

(
  cd "$SNAPSHOT_DIR"
  find . -type f ! -name "checksums.sha256" -print0 | sort -z | xargs -0 sha256sum > checksums.sha256
)

echo "snapshot_dir=$SNAPSHOT_DIR" >> "$MANIFEST_FILE"
echo "[LVTP] Manifest: $MANIFEST_FILE"
echo "[LVTP] Checksums: $CHECKSUM_FILE"
echo "Backup complete."
