#!/usr/bin/env bash
set -e

echo "=== LVTP CORE BOOTSTRAP ==="

mkdir -p ~/LVTP/{core,agents,memory/logs,memory/events,observability,tmp,scripts}

python3 -m pip install --user openai >/dev/null 2>&1 || pip3 install --break-system-packages openai

cat > ~/LVTP/agents/moni_healthcheck.py << 'PYEOF'
from openai import OpenAI
from datetime import datetime
import socket
import os
import json

client = OpenAI()

hostname = socket.gethostname()
now = datetime.utcnow().isoformat() + "Z"

models = client.models.list()

event = {
    "timestamp": now,
    "node": hostname,
    "status": "OPENAI_API_OPERATIVE",
    "models_available": len(models.data),
    "role": "LVTP_NODE"
}

os.makedirs(os.path.expanduser("~/LVTP/memory/events"), exist_ok=True)

with open(os.path.expanduser("~/LVTP/memory/events/openai_healthcheck.jsonl"), "a") as f:
    f.write(json.dumps(event) + "\n")

print("✅ LVTP NODE OPERATIVO")
print("Nodo:", hostname)
print("OpenAI modelos disponibles:", len(models.data))
print("Evento guardado en ~/LVTP/memory/events/openai_healthcheck.jsonl")
PYEOF

cat > ~/LVTP/memory/logs/$(date +%F)-node-bootstrap.md << EOF2
# LVTP Node Bootstrap

Fecha: $(date)
Nodo: $(hostname)
Usuario: $(whoami)

Estado:
- Linux operativo
- OpenAI SDK instalado
- Estructura LVTP creada
- Healthcheck Moni preparado

Arquitectura:
Tablet / Beam Pro / Fossibot
→ PC Linux
→ VPS OVH
→ OpenAI API
→ Agentes / memoria / automatización
EOF2

python3 ~/LVTP/agents/moni_healthcheck.py

echo ""
echo "✅ Bootstrap completado en nodo: $(hostname)"
echo "Ruta LVTP: ~/LVTP"
