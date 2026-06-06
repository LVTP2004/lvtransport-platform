#!/usr/bin/env bash
set -euo pipefail

REPORT="$HOME/LVTP/ops-manager/reports/$(date +%Y%m%d-%H%M%S)-registry-check.md"
mkdir -p "$HOME/LVTP/ops-manager/reports"

{
echo "# LVTP REGISTRY CHECK"
echo "time=$(date -Iseconds)"
echo
python3 -m json.tool "$HOME/LVTP/config/platform_registry.local.json" >/dev/null
echo "local_registry=ok"

if [ -f "$HOME/LVTP/config/platform_registry.vps.json" ]; then
  python3 -m json.tool "$HOME/LVTP/config/platform_registry.vps.json" >/dev/null
  echo "vps_registry=ok"
else
  echo "vps_registry=missing"
fi

echo
echo "## Active Registry"
PYTHONPATH="$HOME" python3 "$HOME/LVTP/core/registry.py"

echo
echo "## Services"
PYTHONPATH="$HOME" python3 - <<'PY'
from LVTP.core.registry import load_registry
reg = load_registry()
for name, svc in reg.get("canonical", {}).items():
    print(f"{name}: type={svc.get('type')} recovery={svc.get('recovery')}")
PY
} | tee "$REPORT"

echo "REPORT=$REPORT"
