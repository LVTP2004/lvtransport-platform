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
import socket, json, hashlib

BASE = Path.home() / "LVTP"

EVENTS = BASE / "memory/events"
RESULTS = BASE / "memory/results"
LESSONS = BASE / "memory/lessons"
POLICIES = BASE / "memory/proposed_policies"
STATE = BASE / "observability/moni_learning_loop_state.json"

for p in [EVENTS, RESULTS, LESSONS, POLICIES, STATE.parent]:
    p.mkdir(parents=True, exist_ok=True)

NODE = socket.gethostname()
client = OpenAI()

def now():
    return datetime.now(timezone.utc).isoformat()

def tail(path, limit=12000):
    try:
        return path.read_text(errors="ignore")[-limit:]
    except:
        return ""

def collect_context():
    chunks = []

    for path in sorted(EVENTS.glob("*.jsonl"))[-10:]:
        chunks.append(f"\n--- EVENT FILE: {path.name} ---\n")
        chunks.append(tail(path))

    for path in sorted(RESULTS.glob("*.jsonl"))[-5:]:
        chunks.append(f"\n--- RESULT FILE: {path.name} ---\n")
        chunks.append(tail(path))

    return "\n".join(chunks)[-40000:]

def mentor_reasoning(context):
    prompt = f"""
Eres ChatGPT Mentor para MONI CORE.

Tu tarea:
- detectar patrones operacionales
- identificar errores repetidos
- extraer lessons learned
- proponer policies seguras

Nodo: {NODE}

Contexto operacional:
{context}

Devuelve JSON válido:

{{
  "lessons": [
    {{
      "topic": "...",
      "lesson": "...",
      "confidence": "low|medium|high"
    }}
  ],
  "proposed_policies": [
    {{
      "name": "...",
      "rule": "...",
      "safe": true
    }}
  ],
  "summary": "..."
}}
"""
    r = client.responses.create(
        model="gpt-5-mini",
        input=prompt
    )

    return r.output_text

def save_learning(data):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    h = hashlib.sha256(data.encode()).hexdigest()[:12]

    lesson_file = LESSONS / f"lesson_{ts}_{h}.json"
    lesson_file.write_text(data)

    return lesson_file

def main():
    context = collect_context()

    reasoning = mentor_reasoning(context)

    lesson_file = save_learning(reasoning)

    event = {
        "timestamp": now(),
        "node": NODE,
        "kind": "LEARNING_LOOP_COMPLETED",
        "lesson_file": str(lesson_file),
        "context_chars": len(context)
    }

    with open(EVENTS / "moni_learning_loop.jsonl", "a") as f:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")

    STATE.write_text(json.dumps({
        "timestamp": now(),
        "node": NODE,
        "status": "OK",
        "lesson_file": str(lesson_file),
        "context_chars": len(context)
    }, indent=2, ensure_ascii=False))

    print("✅ MONI LEARNING LOOP OK")
    print("Nodo:", NODE)
    print("Lesson file:", lesson_file)
    print("Context chars:", len(context))

if __name__ == "__main__":
    main()
