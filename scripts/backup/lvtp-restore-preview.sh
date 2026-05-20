#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <snapshot-tar.gz> <target-dir>"
  exit 1
fi

ARCHIVE="$1"
TARGET_DIR="$2"

mkdir -p "$TARGET_DIR"
tar -xzf "$ARCHIVE" -C "$TARGET_DIR"

EXTRACTED_DIR="$(find "$TARGET_DIR" -maxdepth 1 -type d -name 'snapshot-*' | head -n 1)"
if [[ -z "$EXTRACTED_DIR" ]]; then
  echo "No snapshot directory found after extract"
  exit 1
fi

echo "[LVTP] Restore preview extracted into: $EXTRACTED_DIR"
echo "[LVTP] Run scripts/backup/lvtp-verify-backup.sh $EXTRACTED_DIR to validate integrity"
