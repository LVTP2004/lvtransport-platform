#!/usr/bin/env bash
set -euo pipefail

SNAPSHOT_DIR="${1:-}"
if [ -z "$SNAPSHOT_DIR" ] || [ ! -d "$SNAPSHOT_DIR" ]; then
  echo "Usage: $0 <snapshot_dir>"
  exit 1
fi

for required in source-code.tar.gz docs.tar.gz manifest.txt; do
  if [ ! -f "$SNAPSHOT_DIR/$required" ]; then
    echo "Missing required snapshot artifact: $required"
    exit 1
  fi
done

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

tar -xzf "$SNAPSHOT_DIR/source-code.tar.gz" -C "$TMP_DIR"
[ -f "$TMP_DIR/README.md" ] || { echo "Restore validation failed: README.md missing"; exit 1; }

if [ -f "$SNAPSHOT_DIR/manifest.txt" ]; then
  echo "Manifest present."
fi

echo "Restore validation passed for $SNAPSHOT_DIR"
