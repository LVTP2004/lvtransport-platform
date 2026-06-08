#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"
REPORT_DIR="atlas-reports/secret-audit-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$REPORT_DIR"

echo "[1/5] Checking active secret patterns..."

grep -RInE 'sk-[A-Za-z0-9_-]{20,}|sk-proj-[A-Za-z0-9_-]+' "$ROOT" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude-dir=build \
  --exclude-dir=.next \
  --exclude-dir=coverage \
  --exclude-dir=atlas-reports \
  --exclude-dir=atlas-pro \
  > "$REPORT_DIR/active-key-patterns.txt" || true

echo "[2/5] Checking env key assignments..."

grep -RInE 'OPENAI_API_KEY=.+|QWEN_API_KEY=.+|DASHSCOPE_API_KEY=.+|JWT_SECRET=.+' "$ROOT" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude-dir=build \
  --exclude-dir=.next \
  --exclude-dir=coverage \
  --exclude-dir=atlas-reports \
  --exclude-dir=atlas-pro \
  > "$REPORT_DIR/env-assignments.txt" || true

echo "[3/5] Checking git tracking..."

{
  echo "git status:"
  git status --short || true
  echo
  echo "tracked env files:"
  git ls-files | grep -Ei '(^|/)\.env|env\.local|\.env\.local|\.env$' || true
  echo
  echo "ignore check:"
  git check-ignore -v config/.env private/.env.local.backup 2>/dev/null || true
} > "$REPORT_DIR/git-env-status.txt"

echo "[4/5] Checking noisy backup size..."

{
  du -sh apps/api/.broken-src-backup 2>/dev/null || true
  find apps/api/.broken-src-backup -type f 2>/dev/null | wc -l || true
} > "$REPORT_DIR/broken-backup-size.txt"

echo "[5/5] Writing summary..."

ACTIVE_COUNT="$(wc -l < "$REPORT_DIR/active-key-patterns.txt" | tr -d ' ')"
ENV_COUNT="$(wc -l < "$REPORT_DIR/env-assignments.txt" | tr -d ' ')"

cat > "$REPORT_DIR/summary.txt" <<SUMMARY
LVTP Secret Audit Summary
=========================

Active key pattern hits: $ACTIVE_COUNT
Env assignment hits: $ENV_COUNT

Report directory:
$REPORT_DIR

Review files:
- active-key-patterns.txt
- env-assignments.txt
- git-env-status.txt
- broken-backup-size.txt

Interpretation:
- active-key-patterns.txt should be empty.
- env-assignments.txt may show empty placeholder assignments.
- config/.env and private/.env.local.backup should not be tracked by git.
SUMMARY

cat "$REPORT_DIR/summary.txt"
echo
echo "Details:"
echo "$REPORT_DIR"
