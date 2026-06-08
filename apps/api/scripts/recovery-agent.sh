#!/usr/bin/env bash
set -euo pipefail

BACKUP="${1:-.broken-src-backup/src-20260606-200557}"
REPORT_DIR="runtime/moni/recovery-reports"
TSCP="../../node_modules/.bin/tsc"

mkdir -p "$REPORT_DIR"

restore_group () {
  local group="$1"
  local src="$BACKUP/$group"
  local dst="src/$group"
  local report="$REPORT_DIR/${group//\//_}-$(date +%Y%m%d-%H%M%S).log"

  [ -e "$src" ] || return 0

  echo "=== TRY $group ==="
  git switch -C "recovery/${group//\//-}" >/dev/null 2>&1 || true

  rm -rf "$dst"
  mkdir -p "$(dirname "$dst")"
  cp -R "$src" "$dst"

  if "$TSCP" -p tsconfig.json >"$report" 2>&1 && "$TSCP" --noEmit >>"$report" 2>&1; then
    git add "$dst"
    git commit -m "Restore $group subsystem"
    echo "GREEN $group"
  else
    rm -rf "$dst"
    git restore --staged "$dst" 2>/dev/null || true
    git restore "$dst" 2>/dev/null || true
    echo "ROLLBACK $group; report: $report"
  fi
}

while read -r file; do
  [ -n "$file" ] || continue
  echo "$file" | cut -d/ -f1
done < /tmp/missing.txt | sort -u | while read -r group; do
  restore_group "$group"
done

git status --short
