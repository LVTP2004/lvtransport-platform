#!/usr/bin/env bash
set -e

VPS_USER="ubuntu"
VPS_HOST="51.222.107.59"
ACTION="${1:-healthcheck}"

mkdir -p ~/LVTP/memory/commands

CMD_JSON="{\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",\"source\":\"$(hostname)\",\"target\":\"both\",\"action\":\"$ACTION\"}"

echo "$CMD_JSON" >> ~/LVTP/memory/commands/inbox.jsonl

ssh "$VPS_USER@$VPS_HOST" "mkdir -p ~/LVTP/memory/commands && echo '$CMD_JSON' >> ~/LVTP/memory/commands/inbox.jsonl"

python3 ~/LVTP/agents/moni_event_worker.py
ssh "$VPS_USER@$VPS_HOST" "python3 ~/LVTP/agents/moni_event_worker.py"

echo "✅ DISPATCH COMPLETADO: $ACTION"
