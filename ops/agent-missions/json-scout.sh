#!/usr/bin/env bash
cd ~/lvtransport-platform
REPORT="ops/reports/json-scout.md"
echo "# JSON Scout Report" > "$REPORT"
date >> "$REPORT"
echo "" >> "$REPORT"

find . \
  -path ./node_modules -prune -o \
  -path ./.git -prune -o \
  -name package.json -print | while read f; do
  echo "## $f" >> "$REPORT"
  node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" 2>> "$REPORT" \
    && echo "OK" >> "$REPORT" \
    || echo "BROKEN: $f" >> "$REPORT"
done

cat "$REPORT"
