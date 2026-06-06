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
import socket, json, os

BASE = Path.home() / "LVTP"
EVENTS = BASE / "memory/events"
LOGS = BASE / "memory/logs"
SUMMARIES = BASE / "memory/summaries"
STATE = BASE / "observability/moni_memory_summarizer_state.json"

for p in [EVENTS, LOGS, SUMMARIES, STATE.parent]:
    p.mkdir(parents=True, exist_ok=True)

NODE = socket.gethostname()
client = OpenAI()

def now():
    return datetime.now(timezone.utc).isoformat()

def read_tail(path, limit=12000):
    try:
        text = path.read_text(errors="ignore")
        return text[-limit:]
    except:
        return ""

def collect_context():
    chunks = []

    for path in sorted(EVENTS.glob("*.jsonl"))[-12:]:
        chunks.append(f"\n--- EVENTS: {path.name} ---\n{read_tail(path)}")

    for path in sorted(LOGS.glob("*.md"))[-8:]:
        chunks.append(f"\n--- LOGS: {path.name} ---\n{read_tail(path)}")

    return "\n".join(chunks)[-50000:]

def summarize(context):
    prompt = f"""
Eres Moni Memory Summarizer para LVTP CORE.

Resume la memoria operacional del nodo.

Nodo: {NODE}
Fecha UTC: {now()}

Contexto:
{context}

Devuelve en español:
1. Estado operacional actual
2. Eventos importantes
3. Errores detectados
4. Acciones realizadas
5. Riesgos
6. Próximos pasos recomendados
7. Timeline breve
"""
    r = client.responses.create(
        model="gpt-5-mini",
        input=prompt
    )
    return r.output_text

def main():
    context = collect_context()
    summary = summarize(context)

    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    out = SUMMARIES / f"{day}-memory-summary.md"

    with open(out, "a") as f:
        f.write(f"\n\n# Moni Memory Summary — {now()}\n\n")
        f.write(summary)
        f.write("\n")

    event = {
        "timestamp": now(),
        "node": NODE,
        "kind": "MEMORY_SUMMARY_CREATED",
        "summary": str(out),
        "context_chars": len(context)
    }

    with open(EVENTS / "moni_memory_summarizer.jsonl", "a") as f:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")

    STATE.write_text(json.dumps({
        "timestamp": now(),
        "node": NODE,
        "status": "OK",
        "summary": str(out),
        "context_chars": len(context)
    }, indent=2, ensure_ascii=False))

    print("✅ MONI MEMORY SUMMARIZER OK")
    print("Nodo:", NODE)
    print("Resumen:", out)
    print("Context chars:", len(context))

if __name__ == "__main__":
    main()
