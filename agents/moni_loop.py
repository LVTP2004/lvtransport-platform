#!/usr/bin/env python3
from openai import OpenAI

import os
from pathlib import Path as _Path
_env_path = _Path.home() / "LVTP/config/.env"
if _env_path.exists():
    for _line in _env_path.read_text(errors="ignore").splitlines():
        _line = _line.strip()
        if _line.startswith("export "):
            _line = _line.replace("export ", "", 1)
        if "=" in _line:
            _k, _v = _line.split("=", 1)
            os.environ[_k.strip()] = _v.strip().strip('"').strip("'")

from pathlib import Path
from datetime import datetime, timezone
import subprocess, socket, json, time, os

BASE = Path.home() / "LVTP"
EVENTS = BASE / "memory/events"
LOGS = BASE / "memory/logs"
OBS = BASE / "observability"
STATE = OBS / "moni_loop_state.json"

for p in [EVENTS, LOGS, OBS]:
    p.mkdir(parents=True, exist_ok=True)

NODE = socket.gethostname()
client = OpenAI()

def now():
    return datetime.now(timezone.utc).isoformat()

def sh(cmd):
    p = subprocess.run(cmd, shell=True, text=True, capture_output=True, executable="/bin/bash")
    return {
        "cmd": cmd,
        "code": p.returncode,
        "stdout": p.stdout[-3000:],
        "stderr": p.stderr[-3000:]
    }

def write_event(kind, data):
    event = {
        "timestamp": now(),
        "node": NODE,
        "kind": kind,
        "data": data
    }
    with open(EVENTS / "moni_loop.jsonl", "a") as f:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")

def think(snapshot):
    prompt = f"""
Eres Moni, agente cognitivo operacional de LVTP CORE.

Analiza este snapshot del nodo:

{json.dumps(snapshot, indent=2, ensure_ascii=False)}

Devuelve una respuesta breve con:
1. Estado del nodo
2. Riesgos detectados
3. Próxima acción recomendada
4. Prioridad
"""
    response = client.responses.create(
        model="gpt-5-mini",
        input=prompt
    )
    return response.output_text

def cycle():
    disk = sh("df -h ~")
    pm2 = sh("pm2 list || true")
    events_count = sh("find ~/LVTP/memory/events -type f | wc -l")
    logs_count = sh("find ~/LVTP/memory/logs -type f | wc -l")

    snapshot = {
        "timestamp": now(),
        "node": NODE,
        "disk": disk,
        "pm2": pm2,
        "events_count": events_count,
        "logs_count": logs_count
    }

    analysis = think(snapshot)

    report = LOGS / f"{datetime.now().strftime('%Y-%m-%d')}-moni-cognition.md"
    with open(report, "a") as f:
        f.write(f"\n\n# Moni Cognition — {now()}\n\n")
        f.write(analysis)
        f.write("\n")

    write_event("MONI_COGNITION_CYCLE", {
        "report": str(report),
        "status": "OK"
    })

    STATE.write_text(json.dumps({
        "timestamp": now(),
        "node": NODE,
        "status": "OK",
        "last_report": str(report)
    }, indent=2, ensure_ascii=False))

    print("✅ MONI COGNITION CYCLE OK")
    print("Nodo:", NODE)
    print("Reporte:", report)

def main():
    interval = int(os.getenv("MONI_LOOP_INTERVAL", "300"))
    print("MONI LOOP START:", NODE, "interval:", interval)

    while True:
        try:
            cycle()
        except Exception as e:
            write_event("MONI_COGNITION_ERROR", {"error": str(e)})
            print("ERROR:", e)
        time.sleep(interval)

if __name__ == "__main__":
    main()
