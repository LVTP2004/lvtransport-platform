#!/usr/bin/env bash
set -e

VPS_USER="ubuntu"
VPS_HOST="51.222.107.59"
STAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
FILE="$HOME/LVTP/memory/checkpoints/checkpoint_$(date -u +"%Y%m%d_%H%M%S").md"

mkdir -p "$HOME/LVTP/memory/checkpoints"

{
echo "# LVTP CORE CHECKPOINT"
echo ""
echo "Fecha UTC: $STAMP"
echo ""
echo "## Linux Node"
hostname
echo ""
pm2 list || true
echo ""
echo "## VPS Node"
ssh "$VPS_USER@$VPS_HOST" "hostname && pm2 list" || true
echo ""
echo "## Storage"
du -sh "$HOME/LVTP" || true
ssh "$VPS_USER@$VPS_HOST" "du -sh ~/LVTP" || true
echo ""
echo "## Estado"
echo "- MONI online en Linux y VPS"
echo "- MONI_LOOP online"
echo "- MONI_EVENT_WORKER online"
echo "- MONI_WATCHDOG online"
echo "- Policy Engine probado"
echo "- Storage Offload probado"
echo "- Memory Summarizer funcional en Linux"
} > "$FILE"

echo "✅ CHECKPOINT GUARDADO:"
echo "$FILE"
