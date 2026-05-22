#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <snapshot-dir>"
  exit 1
fi

SNAPSHOT_DIR="$1"
CHECKSUM_FILE="$SNAPSHOT_DIR/checksums.sha256"

if [[ ! -f "$CHECKSUM_FILE" ]]; then
  echo "Missing checksum file: $CHECKSUM_FILE"
  exit 1
fi

(
  cd "$SNAPSHOT_DIR"
  sha256sum -c checksums.sha256
)

echo "[LVTP] Backup verification successful for $SNAPSHOT_DIR"
