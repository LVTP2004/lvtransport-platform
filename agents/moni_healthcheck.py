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
