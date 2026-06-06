#!/usr/bin/env bash
set -e

VPS_USER="ubuntu"
VPS_HOST="51.222.107.59"
LOCAL_NODE="$(hostname)"
DATE="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

echo "=== MONI SYNC START ==="
echo "Local node: $LOCAL_NODE"
echo "Remote VPS: $VPS_USER@$VPS_HOST"
echo "Time UTC: $DATE"

mkdir -p ~/LVTP/memory/{events,logs,sync/from-vps}

ssh "$VPS_USER@$VPS_HOST" 'mkdir -p ~/LVTP/memory/{events,logs,sync/from-linux}'

echo "[1/4] Enviando eventos/logs Linux → VPS..."
rsync -av --ignore-existing ~/LVTP/memory/events/ "$VPS_USER@$VPS_HOST:~/LVTP/memory/sync/from-linux/events/"
rsync -av --ignore-existing ~/LVTP/memory/logs/ "$VPS_USER@$VPS_HOST:~/LVTP/memory/sync/from-linux/logs/"

echo "[2/4] Trayendo eventos/logs VPS → Linux..."
rsync -av --ignore-existing "$VPS_USER@$VPS_HOST:~/LVTP/memory/events/" ~/LVTP/memory/sync/from-vps/events/
rsync -av --ignore-existing "$VPS_USER@$VPS_HOST:~/LVTP/memory/logs/" ~/LVTP/memory/sync/from-vps/logs/

echo "[3/4] Registrando evento local..."
cat >> ~/LVTP/memory/events/moni_sync.jsonl << JSON
{"timestamp":"$DATE","node":"$LOCAL_NODE","sync":"linux_vps","remote":"$VPS_HOST","status":"OK"}
JSON

echo "[4/4] Registrando evento remoto..."
ssh "$VPS_USER@$VPS_HOST" "cat >> ~/LVTP/memory/events/moni_sync.jsonl << JSON
{\"timestamp\":\"$DATE\",\"node\":\"$VPS_HOST\",\"sync\":\"vps_linux\",\"remote\":\"$LOCAL_NODE\",\"status\":\"OK\"}
JSON"

echo "✅ MONI SYNC COMPLETADO"
