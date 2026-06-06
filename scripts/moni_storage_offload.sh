#!/usr/bin/env bash
set -e

VPS_USER="ubuntu"
VPS_HOST="51.222.107.59"
DATE="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
STAMP="$(date -u +"%Y%m%d_%H%M%S")"
LOCAL_BASE="$HOME/LVTP/storage/from-vps/$STAMP"

mkdir -p "$LOCAL_BASE"
mkdir -p "$HOME/LVTP/storage/reports"
mkdir -p "$HOME/LVTP/memory/events"

echo "=== MONI STORAGE OFFLOAD ==="
echo "VPS: $VPS_USER@$VPS_HOST"
echo "Destino local: $LOCAL_BASE"

echo "[1/5] Midiendo espacio VPS..."
ssh "$VPS_USER@$VPS_HOST" "df -h ~" > "$LOCAL_BASE/vps_disk_before.txt"

echo "[2/5] Descargando memoria/eventos/logs desde VPS..."
rsync -av "$VPS_USER@$VPS_HOST:~/LVTP/memory/events/" "$LOCAL_BASE/events/" || true
rsync -av "$VPS_USER@$VPS_HOST:~/LVTP/memory/logs/" "$LOCAL_BASE/logs/" || true
rsync -av "$VPS_USER@$VPS_HOST:~/LVTP/memory/results/" "$LOCAL_BASE/results/" || true
rsync -av "$VPS_USER@$VPS_HOST:~/LVTP/observability/" "$LOCAL_BASE/observability/" || true

echo "[3/5] Creando reporte local..."
cat > "$HOME/LVTP/storage/reports/offload_$STAMP.md" << REPORT
# Moni Storage Offload

Fecha UTC: $DATE
Origen: $VPS_USER@$VPS_HOST
Destino local: $LOCAL_BASE

Archivos descargados:
$(find "$LOCAL_BASE" -type f | wc -l)

Tamaño local:
$(du -sh "$LOCAL_BASE" | awk '{print $1}')

Espacio VPS antes:
$(cat "$LOCAL_BASE/vps_disk_before.txt")
REPORT

echo "[4/5] Registrando evento local..."
cat >> "$HOME/LVTP/memory/events/storage_offload.jsonl" << JSON
{"timestamp":"$DATE","node":"$(hostname)","kind":"STORAGE_OFFLOAD","source":"$VPS_HOST","destination":"$LOCAL_BASE","status":"OK"}
JSON

echo "[5/5] Registrando evento remoto..."
ssh "$VPS_USER@$VPS_HOST" "mkdir -p ~/LVTP/memory/events && cat >> ~/LVTP/memory/events/storage_offload.jsonl << JSON
{\"timestamp\":\"$DATE\",\"node\":\"$VPS_HOST\",\"kind\":\"STORAGE_OFFLOAD_ACK\",\"destination\":\"$(hostname)\",\"status\":\"OK\"}
JSON"

echo ""
echo "✅ MONI STORAGE OFFLOAD COMPLETADO"
echo "Backup local:"
echo "$LOCAL_BASE"
echo "Reporte:"
echo "$HOME/LVTP/storage/reports/offload_$STAMP.md"
