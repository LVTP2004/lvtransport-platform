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

from datetime import datetime, timezone
from pathlib import Path
import json, socket, os, time, hashlib

BASE = Path.home() / "LVTP"
EVENTS = BASE / "memory/events"
LOGS = BASE / "memory/logs"
INDEX = BASE / "memory/index"
STATE = BASE / "observability/moni_state.json"

for p in [EVENTS, LOGS, INDEX, STATE.parent]:
    p.mkdir(parents=True, exist_ok=True)

client = OpenAI()
NODE = socket.gethostname()

def now():
    return datetime.now(timezone.utc).isoformat()

def write_event(kind, data):
    event = {
        "timestamp": now(),
        "node": NODE,
        "kind": kind,
        "data": data
    }
    with open(EVENTS / "moni_events.jsonl", "a") as f:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")
    return event

def hash_text(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]

def index_memory():
    items = []
    for path in list((BASE / "memory/events").glob("*.jsonl")) + list((BASE / "memory/logs").glob("*.md")):
        try:
            text = path.read_text(errors="ignore")
            items.append({
                "file": str(path),
                "hash": hash_text(text),
                "size": len(text),
                "updated": datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).isoformat()
            })
        except Exception as e:
            items.append({"file": str(path), "error": str(e)})

    index_doc = {
        "timestamp": now(),
        "node": NODE,
        "items": items
    }

    (INDEX / "memory_index.json").write_text(json.dumps(index_doc, indent=2, ensure_ascii=False))
    return index_doc

def ask_openai(summary):
    response = client.responses.create(
        model="gpt-5-mini",
        input=f"""
Eres Moni, agente operacional LVTP CORE.
Analiza este estado del nodo y responde en formato breve:

Nodo: {NODE}
Estado:
{summary}

Devuelve:
1. estado
2. riesgos
3. siguiente acción recomendada
"""
    )
    return response.output_text

def main():
    write_event("MONI_DAEMON_START", {"status": "starting"})

    memory_index = index_memory()
    summary = json.dumps({
        "node": NODE,
        "files_indexed": len(memory_index["items"]),
        "time": now()
    }, ensure_ascii=False)

    analysis = ask_openai(summary)

    report_path = LOGS / f"{datetime.now().strftime('%Y-%m-%d')}-moni-report.md"
    with open(report_path, "a") as f:
        f.write(f"\n\n# Moni Report — {now()}\n\n")
        f.write(analysis)
        f.write("\n")

    write_event("MONI_ANALYSIS_COMPLETE", {
        "report": str(report_path),
        "files_indexed": len(memory_index["items"])
    })

    STATE.write_text(json.dumps({
        "node": NODE,
        "last_run": now(),
        "status": "OK",
        "report": str(report_path)
    }, indent=2, ensure_ascii=False))

    print("✅ MONI DAEMON EJECUTADO")
    print("Nodo:", NODE)
    print("Reporte:", report_path)
    print("Índice:", INDEX / "memory_index.json")
    print("Estado:", STATE)

if __name__ == "__main__":
    main()
